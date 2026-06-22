import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LEVEL_ORDER } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { slug: (await params).slug },
      include: {
        submissions: {
          orderBy: { submittedAt: "desc" },
          select: {
            id: true,
            title: true,
            normalizedTitle: true,
            level: true,
            levelLabel: true,
            location: true,
            baseSalary: true,
            bonus: true,
            stockValue: true,
            totalComp: true,
            yoe: true,
            submittedAt: true,
            verified: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const subs = company.submissions;
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

    // Breakdown by level
    const levelBreakdown = LEVEL_ORDER.map((level) => {
      const levelSubs = subs.filter((s) => s.level === level);
      if (!levelSubs.length) return null;
      return {
        level,
        count: levelSubs.length,
        avgBase: avg(levelSubs.map((s) => s.baseSalary)),
        avgBonus: avg(levelSubs.map((s) => s.bonus)),
        avgStock: avg(levelSubs.map((s) => s.stockValue)),
        avgTotalComp: avg(levelSubs.map((s) => s.totalComp)),
        medianTotalComp: median(levelSubs.map((s) => s.totalComp)),
        p25: (() => {
          const sorted = levelSubs.map((s) => s.totalComp).sort((a, b) => a - b);
          return sorted[Math.floor(sorted.length * 0.25)] ?? 0;
        })(),
        p75: (() => {
          const sorted = levelSubs.map((s) => s.totalComp).sort((a, b) => a - b);
          return sorted[Math.floor(sorted.length * 0.75)] ?? 0;
        })(),
      };
    }).filter(Boolean);

    // Role breakdown
    const roleMap = new Map<string, number[]>();
    (await subs).forEach((s: any) => {
      const arr = roleMap.get(s.normalizedTitle) ?? [];
      arr.push(s.totalComp);
      roleMap.set(s.normalizedTitle, arr);
    });
    const roleBreakdown = Array.from(roleMap.entries())
      .map(([role, comps]) => ({
        role,
        count: comps.length,
        avgTotalComp: avg(comps),
        medianTotalComp: median(comps),
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
        hqLocation: company.hqLocation,
        industry: company.industry,
        website: company.website,
      },
      stats: {
        total: subs.length,
        avgBase: avg(subs.map((s) => s.baseSalary)),
        avgBonus: avg(subs.map((s) => s.bonus)),
        avgStock: avg(subs.map((s) => s.stockValue)),
        avgTotalComp: avg(subs.map((s) => s.totalComp)),
        medianTotalComp: median(subs.map((s) => s.totalComp)),
      },
      levelBreakdown,
      roleBreakdown,
      recentSubmissions: subs.slice(0, 20),
    });
  } catch (err) {
    console.error("GET /api/companies/[slug]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
