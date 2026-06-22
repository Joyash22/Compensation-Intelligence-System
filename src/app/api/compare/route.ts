import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LEVEL_ORDER, Level } from "@/types";

// POST /api/compare - compare multiple submissions or companies by level
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mode 1: compare specific submission IDs
    if (body.submissionIds && Array.isArray(body.submissionIds)) {
      const ids: string[] = body.submissionIds.slice(0, 5); // max 5
      if (ids.length < 2) {
        return NextResponse.json(
          { error: "Provide at least 2 submission IDs to compare" },
          { status: 400 }
        );
      }

      const submissions = await prisma.submission.findMany({
        where: { id: { in: ids } },
        include: { company: { select: { name: true, slug: true } } },
      });

      return NextResponse.json({ mode: "submissions", data: submissions });
    }

    // Mode 2: compare companies by level/role
    if (body.companies && Array.isArray(body.companies)) {
      const slugs: string[] = body.companies.slice(0, 4);
      const level: Level | undefined = body.level;
      const role: string | undefined = body.role;

      if (slugs.length < 2) {
        return NextResponse.json(
          { error: "Provide at least 2 company slugs" },
          { status: 400 }
        );
      }

      const companiesData = await Promise.all(
        slugs.map(async (slug) => {
          const company = await prisma.company.findUnique({
            where: { slug },
            select: { id: true, name: true, slug: true, logoUrl: true },
          });
          if (!company) return null;

          const submissions = await prisma.submission.findMany({
            where: {
              companyId: company.id,
              ...(level && { level }),
              ...(role && {
                normalizedTitle: { contains: role, mode: "insensitive" },
              }),
            },
            select: {
              level: true,
              baseSalary: true,
              bonus: true,
              stockValue: true,
              totalComp: true,
              yoe: true,
            },
          });

          if (!submissions.length) return null;

          const avg = (arr: number[]): number =>
            arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

          // Level breakdown
          const byLevel = LEVEL_ORDER.map((lvl) => {
            const lvlSubs = submissions.filter((s: any) => s.level === lvl);
            if (!lvlSubs.length) return null;
            return {
              level: lvl,
              count: lvlSubs.length,
              avgBase: avg(lvlSubs.map((s) => s.baseSalary)),
              avgBonus: avg(lvlSubs.map((s) => s.bonus)),
              avgStock: avg(lvlSubs.map((s) => s.stockValue)),
              avgTotalComp: avg(lvlSubs.map((s) => s.totalComp)),
            };
          }).filter(Boolean);

          return {
            company,
            totalDataPoints: submissions.length,
            overall: {
              avgBase: avg(submissions.map((s: any) => s.baseSalary)),
              avgBonus: avg(submissions.map((s: any) => s.bonus)),
              avgStock: avg(submissions.map((s: any) => s.stockValue)),
              avgTotalComp: avg(submissions.map((s: any) => s.totalComp)),
            },
            byLevel,
          };
        })
      );

      return NextResponse.json({
        mode: "companies",
        data: companiesData.filter(Boolean),
      });
    }

    return NextResponse.json(
      { error: "Provide either submissionIds or companies array" },
      { status: 400 }
    );
  } catch (err) {
    console.error("POST /api/compare", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
