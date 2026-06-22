"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Button, Input, Select, Spinner, StatCard } from "@/components/ui";
import { CompanyComparisonChart } from "@/components/charts/CompChart";
import { formatINR } from "@/lib/normalization";
import { LEVEL_LABELS, LEVEL_ORDER, Level } from "@/types";

const LEVEL_OPTIONS = [
  { value: "", label: "All Levels" },
  ...LEVEL_ORDER.map((l) => ({ value: l, label: LEVEL_LABELS[l].split(" / ")[0] })),
];

interface CompanyResult {
  company: { name: string; slug: string };
  totalDataPoints: number;
  overall: { avgBase: number; avgBonus: number; avgStock: number; avgTotalComp: number };
  byLevel: Array<{
    level: Level; count: number;
    avgBase: number; avgBonus: number; avgStock: number; avgTotalComp: number;
  }>;
}

function ComparePageInner() {
  const searchParams = useSearchParams();

  const [companyInputs, setCompanyInputs] = useState<string[]>(
    searchParams.get("companies")?.split(",").filter(Boolean) ?? ["", ""]
  );
  const [selectedLevel, setSelectedLevel] = useState("");
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const addCompany = () => {
    if (companyInputs.length < 4) setCompanyInputs((p) => [...p, ""]);
  };
  const removeCompany = (i: number) =>
    setCompanyInputs((p) => p.filter((_, idx) => idx !== i));
  const setCompany = (i: number, v: string) =>
    setCompanyInputs((p) => p.map((c, idx) => (idx === i ? v : c)));

  const handleCompare = async () => {
    const companies = companyInputs.map((c) => c.trim().toLowerCase().replace(/\s+/g, "-")).filter(Boolean);
    if (companies.length < 2) { setError("Add at least 2 companies to compare."); return; }
    setLoading(true); setError(null); setHasSearched(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies, level: selectedLevel || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResults(json.data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Build chart data
  const chartData = LEVEL_ORDER.map((level) => {
    const entry: Record<string, Level | number> = { level };
    results.forEach((r) => {
      const lvl = r.byLevel.find((b) => b.level === level);
      entry[r.company.name] = lvl?.avgTotalComp ?? 0;
    });
    return entry;
  }).filter((row) => results.some((r) => (row[r.company.name] as number) > 0));

  const companyNames = results.map((r) => r.company.name);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compare Companies</h1>
        <p className="text-sm text-gray-500 mt-1">
          Side-by-side compensation comparison across levels. Enter company slugs (e.g. "google", "microsoft").
        </p>
      </div>

      {/* Controls */}
      <Card className="p-5 space-y-4">
        <div className="space-y-3">
          {companyInputs.map((val, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                placeholder={`Company ${i + 1} (e.g. google, flipkart)`}
                value={val}
                onChange={(e) => setCompany(i, e.target.value)}
                className="flex-1"
              />
              {companyInputs.length > 2 && (
                <button
                  onClick={() => removeCompany(i)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {companyInputs.length < 4 && (
            <Button variant="ghost" size="sm" onClick={addCompany}>
              + Add company
            </Button>
          )}
          <Select
            options={LEVEL_OPTIONS}
            value={selectedLevel}
            onChange={setSelectedLevel}
            className="w-44 text-sm"
          />
          <Button onClick={handleCompare} loading={loading}>
            Compare →
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </Card>

      {/* Results */}
      {loading && (
        <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-indigo-600" /></div>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <Card className="p-8 text-center text-gray-500 text-sm">
          No data found. Check that company slugs are correct (e.g. "google", "tcs", "amazon-web-services").
        </Card>
      )}

      {results.length > 0 && (
        <>
          {/* Overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map((r) => (
              <Card key={r.company.slug} className="p-4 space-y-2">
                <h3 className="font-bold text-gray-900 dark:text-white">{r.company.name}</h3>
                <p className="text-xs text-gray-400">{r.totalDataPoints} data points</p>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Avg Base</span>
                    <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{formatINR(r.overall.avgBase)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Avg Bonus</span>
                    <span className="font-mono text-gray-600 dark:text-gray-400">{r.overall.avgBonus > 0 ? formatINR(r.overall.avgBonus) : "—"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Avg Stock/yr</span>
                    <span className="font-mono text-gray-600 dark:text-gray-400">{r.overall.avgStock > 0 ? formatINR(r.overall.avgStock) : "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-gray-100 dark:border-gray-700">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Avg Total TC</span>
                    <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{formatINR(r.overall.avgTotalComp)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                Total Compensation by Level
                {selectedLevel && ` · Filtered: ${LEVEL_LABELS[selectedLevel as Level].split(" / ")[0]}`}
              </h2>
              <CompanyComparisonChart data={chartData as any} companies={companyNames} />
            </Card>
          )}

          {/* Level-by-level table */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Level-by-Level: Avg Total Comp</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Level</th>
                    {results.map((r) => (
                      <th key={r.company.slug} className="px-5 py-3 text-right font-medium text-indigo-600 dark:text-indigo-400">
                        {r.company.name}
                      </th>
                    ))}
                    <th className="px-5 py-3 text-right font-medium text-gray-500">Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {LEVEL_ORDER.map((level) => {
                    const comps = results.map((r) => ({
                      name: r.company.name,
                      value: r.byLevel.find((b) => b.level === level)?.avgTotalComp ?? 0,
                      count: r.byLevel.find((b) => b.level === level)?.count ?? 0,
                    }));
                    if (comps.every((c) => c.value === 0)) return null;
                    const maxComp = Math.max(...comps.map((c) => c.value));

                    return (
                      <tr key={level} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                        <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
                          {LEVEL_LABELS[level].split(" / ")[0]}
                        </td>
                        {comps.map((c) => (
                          <td key={c.name} className={`px-5 py-3 text-right font-mono text-xs ${
                            c.value === maxComp && c.value > 0
                              ? "font-bold text-green-600 dark:text-green-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}>
                            {c.value > 0 ? (
                              <>
                                {formatINR(c.value)}
                                <span className="text-gray-400 ml-1">({c.count})</span>
                              </>
                            ) : "—"}
                          </td>
                        ))}
                        <td className="px-5 py-3 text-right text-xs font-medium text-green-600 dark:text-green-400">
                          {maxComp > 0 ? comps.find((c) => c.value === maxComp)?.name : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-indigo-600" /></div>}>
      <ComparePageInner />
    </Suspense>
  );
}
