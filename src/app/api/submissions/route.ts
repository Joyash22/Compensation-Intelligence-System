import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { submissionSchema, filterSchema } from "@/lib/validations";
import {
  normalizeCompanyName,
  normalizeTitle,
  normalizeLevel,
  slugify,
  convertToINR,
} from "@/lib/normalization";

// GET /api/submissions - paginated, filtered salary data
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = filterSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid filters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      company, title, level, location,
      minComp, maxComp, page, pageSize, sortBy, sortOrder,
    } = parsed.data;

    const where: Record<string, unknown> = {
      ...(company && {
        company: {
          OR: [
            { name: { contains: company, mode: "insensitive" } },
            { aliases: { has: company.toLowerCase() } },
          ],
        },
      }),
      ...(title && {
        OR: [
          { title: { contains: title, mode: "insensitive" } },
          { normalizedTitle: { contains: title, mode: "insensitive" } },
        ],
      }),
      ...(level && { level }),
      ...(location && {
        location: { contains: location, mode: "insensitive" },
      }),
      ...((minComp !== undefined || maxComp !== undefined) && {
        totalComp: {
          ...(minComp !== undefined && { gte: minComp }),
          ...(maxComp !== undefined && { lte: maxComp }),
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: { company: { select: { id: true, name: true, slug: true, logoUrl: true } } },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.submission.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("GET /api/submissions", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/submissions - create new salary entry
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // Normalize
    const canonicalName = normalizeCompanyName(data.company);
    const companySlug = slugify(canonicalName);
    const normalizedTitle = normalizeTitle(data.title);
    const normalizedLevel = normalizeLevel(data.level);

    // Upsert company (find by slug, add alias if new)
    const company = await prisma.company.upsert({
      where: { slug: companySlug },
      update: {
        aliases: {
          push: data.company.toLowerCase(),
        },
      },
      create: {
        name: canonicalName,
        slug: companySlug,
        aliases: [data.company.toLowerCase()],
      },
    });

    // Convert all amounts to INR
    const currency = data.currency ?? "INR";
    const baseSalary = convertToINR(data.baseSalary, currency);
    const bonus = convertToINR(data.bonus ?? 0, currency);
    const stockValue = convertToINR(data.stockValue ?? 0, currency);
    const totalComp = baseSalary + bonus + stockValue;

    const submission = await prisma.submission.create({
      data: {
        companyId: company.id,
        userId: session?.user?.id ?? null,
        title: data.title,
        normalizedTitle,
        level: normalizedLevel as any,
        levelLabel: data.levelLabel ?? "",
        location: data.location,
        remote: data.remote ?? false,
        baseSalary,
        bonus,
        stockValue,
        totalComp,
        yoe: data.yoe ?? null,
        yearsAtCompany: data.yearsAtCompany ?? null,
        currency: "INR", // always stored in INR
        department: data.department ?? null,
        source: "manual",
      },
      include: {
        company: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error("POST /api/submissions", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
