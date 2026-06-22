"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import { Button, Badge, Select, Input, Card, Spinner, EmptyState } from "@/components/ui";
import { formatINR as fmtINR } from "@/lib/normalization";
import { LEVEL_LABELS, LEVEL_ORDER } from "@/types";
import type { Level } from "@/types";

const LEVEL_OPTIONS = [
  { value: "", label: "All Levels" },
  ...LEVEL_ORDER.map((l) => ({ value: l, label: LEVEL_LABELS[l] })),
];

const SORT_OPTIONS = [
  { value: "submittedAt", label: "Most Recent" },
  { value: "totalComp", label: "Total Comp" },
  { value: "baseSalary", label: "Base Salary" },
];

const LEVEL_BADGE_MAP: Record<Level, "default" | "info" | "success" | "warning" | "danger" | "purple"> = {
  INTERN: "default",
  JUNIOR: "info",
  MID: "success",
  SENIOR: "warning",
  STAFF: "purple",
  PRINCIPAL: "purple",
  DIRECTOR: "danger",
  VP: "danger",
  C_LEVEL: "danger",
};

interface Submission {
  id: string;
  company: { name: string; slug: string };
  title: string;
  normalizedTitle: string;
  level: Level;
  levelLabel: string;
  location: string;
  baseSalary: number;
  bonus: number;
  stockValue: number;
  totalComp: number;
  yoe: number | null;
  submittedAt: string;
  verified: boolean;
}

interface Props {
  onAddToCompare?: (id: string) => void;
  compareIds?: string[];
}

export function SalaryTable({ onAddToCompare, compareIds = [] }: Props) {
  const [data, setData] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    company: "",
    title: "",
    level: "",
    location: "",
    minComp: "",
    maxComp: "",
  });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
        sortBy,
        sortOrder,
        ...(filters.company && { company: filters.company }),
        ...(filters.title && { title: filters.title }),
        ...(filters.level && { level: filters.level }),
        ...(filters.location && { location: filters.location }),
        ...(filters.minComp && { minComp: filters.minComp }),
        ...(filters.maxComp && { maxComp: filters.maxComp }),
      });
      const res = await fetch(`/api/submissions?${params}`);
      if (!res.ok) throw new Error("Failed to load data");
      const json = await res.json();
      setData(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortOrder("desc"); }
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Input
            placeholder="Company..."
            value={filters.company}
            onChange={(e) => handleFilterChange("company", e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Role..."
            value={filters.title}
            onChange={(e) => handleFilterChange("title", e.target.value)}
            className="text-sm"
          />
          <Select
            options={LEVEL_OPTIONS}
            value={filters.level}
            onChange={(v) => handleFilterChange("level", v)}
            placeholder="All Levels"
          />
          <Input
            placeholder="City..."
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Min ₹"
            type="number"
            value={filters.minComp}
            onChange={(e) => handleFilterChange("minComp", e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Max ₹"
              type="number"
              value={filters.maxComp}
              onChange={(e) => handleFilterChange("maxComp", e.target.value)}
              className="text-sm flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFilters({ company: "", title: "", level: "", location: "", minComp: "", maxComp: "" }); setPage(1); }}
              className="shrink-0"
            >
              ✕
            </Button>
          </div>
        </div>
      </Card>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {loading ? "Loading..." : `${total.toLocaleString()} data points`}
        </p>
        <Select
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={(v) => { setSortBy(v); setPage(1); }}
          className="text-sm w-40"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="w-8 h-8 text-indigo-600" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : data.length === 0 ? (
          <EmptyState
            title="No salary data found"
            description="Try adjusting your filters or be the first to submit data."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Level</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Location</th>
                  <th
                    className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => toggleSort("baseSalary")}
                  >
                    Base {sortBy === "baseSalary" && (sortOrder === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Bonus</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Stock/yr</th>
                  <th
                    className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => toggleSort("totalComp")}
                  >
                    Total TC {sortBy === "totalComp" && (sortOrder === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">YoE</th>
                  {onAddToCompare && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/companies/${row.company.slug}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        {row.company.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 max-w-[180px] truncate">
                      {row.normalizedTitle}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={LEVEL_BADGE_MAP[row.level]}>
                        {row.levelLabel || LEVEL_LABELS[row.level].split(" / ")[0]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{row.location}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-800 dark:text-gray-200">
                      {fmtINR(row.baseSalary)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-500 dark:text-gray-400 text-xs">
                      {row.bonus > 0 ? fmtINR(row.bonus) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-500 dark:text-gray-400 text-xs">
                      {row.stockValue > 0 ? fmtINR(row.stockValue) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                        {fmtINR(row.totalComp)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 text-xs">
                      {row.yoe != null ? `${row.yoe}y` : "—"}
                    </td>
                    {onAddToCompare && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onAddToCompare(row.id)}
                          disabled={compareIds.includes(row.id)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            compareIds.includes(row.id)
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 cursor-default"
                              : "bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-gray-700 dark:hover:bg-indigo-900/40 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {compareIds.includes(row.id) ? "Added ✓" : "+ Compare"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
            ← Prev
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
