"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from "recharts";
import { formatINR as fmtINR } from "@/lib/normalization";
import { LEVEL_LABELS } from "@/types";
import type { Level } from "@/types";

interface LevelData {
  level: Level;
  avgBase: number;
  avgBonus: number;
  avgStock: number;
  avgTotalComp: number;
  count: number;
}

interface Props {
  data: LevelData[];
  title?: string;
}

const formatTick = (value: number) => fmtINR(value);

export function CompBreakdownChart({ data, title }: Props) {
  const chartData = data.map((d) => ({
    name: LEVEL_LABELS[d.level].split(" / ")[0],
    Base: Math.round(d.avgBase),
    Bonus: Math.round(d.avgBonus),
    "Stock/yr": Math.round(d.avgStock),
    count: d.count,
  }));

  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={formatTick} tick={{ fontSize: 11 }} width={64} />
          <Tooltip
            formatter={(value: any, name: any) => [fmtINR(value), name]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Base" fill="#6366f1" stackId="a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Bonus" fill="#a78bfa" stackId="a" />
          <Bar dataKey="Stock/yr" fill="#22d3ee" stackId="a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Multi-company comparison bar chart
interface CompanyCompData {
  level: Level;
  [company: string]: number | Level;
}

const COMPANY_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export function CompanyComparisonChart({
  data,
  companies,
}: {
  data: CompanyCompData[];
  companies: string[];
}) {
  const chartData = data.map((d) => ({
    name: LEVEL_LABELS[d.level].split(" / ")[0],
    ...companies.reduce((acc, c) => ({ ...acc, [c]: d[c] }), {}),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={formatTick} tick={{ fontSize: 11 }} width={64} />
        <Tooltip
          formatter={(value: any, name: any) => [fmtINR(value), name]}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        {companies.map((c, i) => (
          <Bar key={c} dataKey={c} fill={COMPANY_COLORS[i % COMPANY_COLORS.length]} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
