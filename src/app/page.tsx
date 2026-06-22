"use client";

import { useState } from "react";
import { SalaryTable } from "@/components/SalaryTable";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function HomePage() {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const addToCompare = (id: string) => {
    if (compareIds.includes(id) || compareIds.length >= 5) return;
    setCompareIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Compensation Intelligence
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm">
          Transparent, level-based comp data for tech roles in India.
          Levels matter more than job titles.
        </p>
        <div className="flex gap-3 justify-center mt-4">
          <Link href="/submit"><Button>+ Submit Salary</Button></Link>
          <Link href="/compare"><Button variant="secondary">Compare Companies</Button></Link>
        </div>
      </div>

      {/* Compare tray */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {compareIds.length} item{compareIds.length > 1 ? "s" : ""} selected
          </p>
          <div className="flex gap-2">
            <Link href={`/compare?ids=${compareIds.join(",")}`}>
              <Button size="sm" disabled={compareIds.length < 2}>Compare →</Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={() => setCompareIds([])}>Clear</Button>
          </div>
        </div>
      )}

      <SalaryTable onAddToCompare={addToCompare} compareIds={compareIds} />
    </div>
  );
}
