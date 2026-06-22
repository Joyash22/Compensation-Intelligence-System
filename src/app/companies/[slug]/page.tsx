"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Badge, Spinner, EmptyState, StatCard } from "@/components/ui";
import { CompBreakdownChart } from "@/components/charts/CompChart";
import { formatINR } from "@/lib/normalization";
import { LEVEL_LABELS, Level } from "@/types";

interface CompanyDetail {
  company: {
    id: string; name: string; slug: string;
    logoUrl: string | null; hqLocation: string | null;
    industry: string | null; website: string | null;
  };
  stats: {
    total: number; avgBase: number; avgBonus: number;
    avgStock: number; avgTotalComp: number; medianTotalComp: number;
  };
  levelBreakdown: Array<{
    level: Level; count: number;
    avgBase: number; avgBonus: number; avgStock: number;
    avgTotalComp: number; medianTotalComp: number;
    p25: number; p75: number;
  }>;
  roleBreakdown: Array<{ role: string; count: number; avgTotalComp: number }>;
  recentSubmissions: Array<{
    id: string; title: string; normalizedTitle: string;
    level: Level; levelLabel: string; location: string;
    baseSalary: number; bonus: number; stockValue: number;
    totalComp: number; yoe: number | null; submittedAt: string;
  }>;
}

export default function CompanyPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/companies/${slug}`)
      .then((r) => r.ok ? r.json() : r.json().then((e: any) => { throw new Error(e.error); }))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10 text-indigo-600" /></div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;
  if (!data) return null;

  const { company, stats, levelBreakdown, roleBreakdown, recentSubmissions } = data;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/companies" className="hover:text-indigo-600">Companies</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900 dark:text-white">{company.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {company.hqLocation && <span className="text-sm text-gray-500">📍 {company.hqLocation}</span>}
            {company.industry && <Badge variant="default">{company.industry}</Badge>}
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="text-xs text-indigo-500 hover:underline">
                Website ↗
              </a>
            )}
          </div>
        </div>
        <Link href={`/compare?companies=${slug}`}>
          <button className="text-sm px-3 py-1.5 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
            + Add to Compare
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Data Points" value={stats.total.toString()} />
        <StatCard label="Median Total Comp" value={formatINR(stats.medianTotalComp)} />
        <StatCard label="Avg Base Salary" value={formatINR(stats.avgBase)} />
        <StatCard label="Avg Stock / yr" value={stats.avgStock > 0 ? formatINR(stats.avgStock) : "—"} />
      </div>

      {/* Chart */}
      {levelBreakdown.length > 0 && (
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Compensation by Level</h2>
          <CompBreakdownChart data={levelBreakdown} />
        </Card>
      )}

      {/* Level table */}
      {levelBreakdown.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Level Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Level</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500">Reports</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500">Avg Base</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500">Avg Bonus</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500">Avg Stock/yr</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500">Median TC</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500">P25–P75</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {levelBreakdown.map((row) => (
                  <tr key={row.level} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-5 py-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {LEVEL_LABELS[row.level].split(" / ")[0]}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">{LEVEL_LABELS[row.level].split(" / ").slice(1).join(" / ")}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500">{row.count}</td>
                    <td className="px-5 py-3 text-right font-mono text-gray-700 dark:text-gray-300">{formatINR(row.avgBase)}</td>
                    <td className="px-5 py-3 text-right font-mono text-gray-500">{row.avgBonus > 0 ? formatINR(row.avgBonus) : "—"}</td>
                    <td className="px-5 py-3 text-right font-mono text-gray-500">{row.avgStock > 0 ? formatINR(row.avgStock) : "—"}</td>
                    <td className="px-5 py-3 text-right font-bold font-mono text-indigo-600 dark:text-indigo-400">{formatINR(row.medianTotalComp)}</td>
                    <td className="px-5 py-3 text-right text-xs text-gray-400 font-mono">
                      {formatINR(row.p25)} – {formatINR(row.p75)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role breakdown */}
        {roleBreakdown.length > 0 && (
          <Card className="p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">By Role</h2>
            <div className="space-y-2">
              {roleBreakdown.slice(0, 10).map((r) => (
                <div key={r.role} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300 truncate">{r.role}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">{r.count}</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 text-xs">{formatINR(r.avgTotalComp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent submissions */}
        <div className={roleBreakdown.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Submissions</h2>
            </div>
            {recentSubmissions.length === 0 ? (
              <EmptyState title="No submissions yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Level</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Location</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Base</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Total TC</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">YoE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {recentSubmissions.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200 max-w-[140px] truncate">{s.normalizedTitle}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                            {s.levelLabel || LEVEL_LABELS[s.level].split(" / ")[0]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{s.location}</td>
                        <td className="px-4 py-3 text-right font-mono text-gray-700 dark:text-gray-300 text-xs">{formatINR(s.baseSalary)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">{formatINR(s.totalComp)}</td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">{s.yoe != null ? `${s.yoe}y` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
