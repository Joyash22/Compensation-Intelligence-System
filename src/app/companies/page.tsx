"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/normalization";
import { Card, Input, Spinner, EmptyState, StatCard } from "@/components/ui";

interface CompanyCard {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  hqLocation: string | null;
  industry: string | null;
  submissionCount: number;
  avgTotalComp: number;
  medianTotalComp: number;
}

export default function CompaniesPage() {
  const [data, setData] = useState<CompanyCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/companies?search=${encodeURIComponent(search)}&pageSize=30`);
        const json = await res.json();
        setData(json.data ?? []);
        setTotal(json.total ?? 0);
      } catch {}
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Companies</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} companies with salary data</p>
        </div>
        <div className="w-64">
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-indigo-600" /></div>
      ) : data.length === 0 ? (
        <EmptyState title="No companies found" description="Try a different search term." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((c) => (
            <Link key={c.id} href={`/companies/${c.slug}`}>
              <Card className="p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer h-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-base">{c.name}</h2>
                    {c.hqLocation && (
                      <p className="text-xs text-gray-500 mt-0.5">{c.hqLocation}</p>
                    )}
                    {c.industry && (
                      <p className="text-xs text-gray-400">{c.industry}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                    {c.submissionCount} reports
                  </span>
                </div>
                {c.medianTotalComp > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500">Median Total Comp</p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {formatINR(c.medianTotalComp)}
                    </p>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
