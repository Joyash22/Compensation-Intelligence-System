import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") ?? "20"));

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: { select: { submissions: true } },
          submissions: {
            select: { baseSalary: true, bonus: true, stockValue: true, totalComp: true },
          },
        },
        orderBy: { submissions: { _count: "desc" } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.company.count({ where }),
    ]);

    // Compute aggregate stats in application layer (works with any DB)
    const result = companies.map((c: any) => {
      const subs = c.submissions;
      const n = subs.length;
      const avg = (arr: number[]): number =>
        arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      const median = (arr: number[]): number => {
        if (!arr.length) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;
      };

      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        logoUrl: c.logoUrl,
        hqLocation: c.hqLocation,
        industry: c.industry,
        submissionCount: n,
        avgBase: avg(subs.map((s) => s.baseSalary)),
        avgBonus: avg(subs.map((s) => s.bonus)),
        avgStock: avg(subs.map((s) => s.stockValue)),
        avgTotalComp: avg(subs.map((s) => s.totalComp)),
        medianTotalComp: median(subs.map((s) => s.totalComp)),
      };
    });

    return NextResponse.json({
      data: result,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("GET /api/companies", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
