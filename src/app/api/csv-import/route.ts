import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { csvRowSchema } from "@/lib/validations";
import {
  normalizeCompanyName,
  normalizeTitle,
  normalizeLevel,
  slugify,
  convertToINR,
} from "@/lib/normalization";
import { ValidationError } from "@/types";

// POST /api/csv-import - accepts multipart/form-data with "file" field
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only .csv files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 413 }
      );
    }

    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV must have a header row and at least one data row" },
        { status: 400 }
      );
    }

    // Parse header
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));

    const EXPECTED_HEADERS = ["company", "title", "level", "location", "basesalary"];
    const missing = EXPECTED_HEADERS.filter((h) => !headers.includes(h));
    if (missing.length) {
      return NextResponse.json(
        {
          error: `Missing required columns: ${missing.join(", ")}`,
          hint: "Expected: company, title, level, location, baseSalary, [bonus, stockValue, yoe, currency, levelLabel]",
        },
        { status: 400 }
      );
    }

    // Parse rows
    const errors: ValidationError[] = [];
    let imported = 0;
    let skipped = 0;

    const rows = lines.slice(1);

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // 1-indexed, accounting for header
      const cells = parseCSVLine(rows[i]);

      if (cells.length === 0 || (cells.length === 1 && cells[0] === "")) {
        skipped++;
        continue;
      }

      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = cells[idx]?.trim() ?? "";
      });

      // Map header variations
      const rawRow = {
        company: rowObj["company"] ?? "",
        title: rowObj["title"] ?? rowObj["jobtitle"] ?? rowObj["role"] ?? "",
        level: rowObj["level"] ?? rowObj["joblevel"] ?? "",
        levelLabel: rowObj["levellabel"] ?? rowObj["level_label"] ?? "",
        location: rowObj["location"] ?? rowObj["city"] ?? "",
        baseSalary: rowObj["basesalary"] ?? rowObj["base"] ?? rowObj["salary"] ?? "0",
        bonus: rowObj["bonus"] ?? rowObj["targetbonus"] ?? "0",
        stockValue: rowObj["stockvalue"] ?? rowObj["stock"] ?? rowObj["equity"] ?? "0",
        yoe: rowObj["yoe"] ?? rowObj["experience"] ?? "",
        currency: rowObj["currency"] ?? "INR",
      };

      const parsed = csvRowSchema.safeParse(rawRow);
      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        Object.entries(fieldErrors).forEach(([field, msgs]) => {
          errors.push({ row: rowNum, field, message: (msgs ?? [])[0] ?? "Invalid" });
        });
        skipped++;
        continue;
      }

      const data = parsed.data;

      try {
        const canonicalName = normalizeCompanyName(data.company);
        const companySlug = slugify(canonicalName);
        const normalizedTitle = normalizeTitle(data.title);
        const normalizedLevel = normalizeLevel(data.level);

        const company = await prisma.company.upsert({
          where: { slug: companySlug },
          update: { aliases: { push: data.company.toLowerCase() } },
          create: {
            name: canonicalName,
            slug: companySlug,
            aliases: [data.company.toLowerCase()],
          },
        });

        const currency = data.currency ?? "INR";
        const baseSalary = convertToINR(data.baseSalary, currency);
        const bonus = convertToINR(data.bonus ?? 0, currency);
        const stockValue = convertToINR(data.stockValue ?? 0, currency);
        const totalComp = baseSalary + bonus + stockValue;

        await prisma.submission.create({
          data: {
            companyId: company.id,
            userId: session?.user?.id ?? null,
            title: data.title,
            normalizedTitle,
            level: normalizedLevel as any,
            levelLabel: data.levelLabel ?? "",
            location: data.location,
            baseSalary,
            bonus,
            stockValue,
            totalComp,
            yoe: data.yoe ?? null,
            currency: "INR",
            source: "csv",
          },
        });

        imported++;
      } catch (dbErr) {
        errors.push({
          row: rowNum,
          field: "general",
          message: "Failed to save row",
        });
        skipped++;
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      errors: errors.slice(0, 50), // cap error list
      total: rows.length,
    });
  } catch (err) {
    console.error("POST /api/csv-import", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Handles quoted fields with commas inside
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let current = "";

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
