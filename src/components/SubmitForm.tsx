"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button, Input, Select, Card, Badge } from "@/components/ui";
import { LEVEL_ORDER, LEVEL_LABELS } from "@/types";
import Link from "next/link";

const LEVEL_OPTIONS = LEVEL_ORDER.map((l) => ({ value: l, label: LEVEL_LABELS[l] }));
const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR (₹)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "SGD", label: "SGD" },
];

interface FormState {
  company: string;
  title: string;
  level: string;
  levelLabel: string;
  location: string;
  currency: string;
  baseSalary: string;
  bonus: string;
  stockValue: string;
  yoe: string;
  yearsAtCompany: string;
  department: string;
  remote: boolean;
}

const INITIAL: FormState = {
  company: "", title: "", level: "MID", levelLabel: "",
  location: "", currency: "INR", baseSalary: "", bonus: "0",
  stockValue: "0", yoe: "", yearsAtCompany: "", department: "", remote: false,
};

export function SubmitForm() {
  const { data: session } = useSession();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));
  const clearError = (key: string) => setErrors((e) => { const copy = { ...e }; delete copy[key]; return copy; });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const payload = {
      company: form.company,
      title: form.title,
      level: form.level,
      levelLabel: form.levelLabel,
      location: form.location,
      currency: form.currency,
      baseSalary: parseFloat(form.baseSalary) || 0,
      bonus: parseFloat(form.bonus) || 0,
      stockValue: parseFloat(form.stockValue) || 0,
      yoe: form.yoe ? parseInt(form.yoe) : null,
      yearsAtCompany: form.yearsAtCompany ? parseInt(form.yearsAtCompany) : null,
      department: form.department,
      remote: form.remote,
    };

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const errs: Record<string, string> = {};
          Object.entries(data.details).forEach(([k, msgs]) => {
            errs[k] = Array.isArray(msgs) ? msgs[0] : String(msgs);
          });
          setErrors(errs);
        } else {
          setErrors({ general: data.error ?? "Submission failed" });
        }
        return;
      }

      setSuccess(true);
      setForm(INITIAL);
    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Salary submitted!</h2>
        <p className="text-sm text-gray-500">Thanks for contributing. Your data helps thousands make better decisions.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => setSuccess(false)}>Submit another</Button>
          <Link href="/"><Button variant="secondary">View salaries</Button></Link>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!session && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
          You can submit anonymously, but <Link href="/login" className="underline font-medium">signing in</Link> lets you edit your submissions later.
        </div>
      )}

      {errors.general && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
          {errors.general}
        </div>
      )}

      {/* Company & Role */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Company & Role</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company *"
            placeholder="e.g. Google, Flipkart, Infosys"
            value={form.company}
            onChange={(e) => { set("company", e.target.value); clearError("company"); }}
            error={errors.company}
            required
          />
          <Input
            label="Job Title *"
            placeholder="e.g. Software Engineer, PM"
            value={form.title}
            onChange={(e) => { set("title", e.target.value); clearError("title"); }}
            error={errors.title}
            required
          />
          <Select
            label="Level *"
            options={LEVEL_OPTIONS}
            value={form.level}
            onChange={(v) => set("level", v)}
            error={errors.level}
          />
          <Input
            label="Company-specific level label"
            placeholder="e.g. L5, SDE-2, IC3, Senior"
            value={form.levelLabel}
            onChange={(e) => set("levelLabel", e.target.value)}
            hint="How your company labels this level internally"
          />
          <Input
            label="Department"
            placeholder="e.g. Engineering, Product, Data"
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
          />
          <Input
            label="Location *"
            placeholder="e.g. Bangalore, Hyderabad, Remote"
            value={form.location}
            onChange={(e) => { set("location", e.target.value); clearError("location"); }}
            error={errors.location}
            required
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={form.remote}
            onChange={(e) => set("remote", e.target.checked)}
            className="rounded"
          />
          Fully remote
        </label>
      </Card>

      {/* Compensation */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Compensation</h2>
          <Select
            options={CURRENCY_OPTIONS}
            value={form.currency}
            onChange={(v) => set("currency", v)}
            className="w-32 text-sm"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          All amounts will be stored in INR. Non-INR values are converted using current rates.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Base Salary (annual) *"
            type="number"
            min="0"
            placeholder="e.g. 2000000"
            value={form.baseSalary}
            onChange={(e) => { set("baseSalary", e.target.value); clearError("baseSalary"); }}
            error={errors.baseSalary}
            required
          />
          <Input
            label="Target Bonus (annual)"
            type="number"
            min="0"
            placeholder="0"
            value={form.bonus}
            onChange={(e) => set("bonus", e.target.value)}
            hint="Leave 0 if none or unknown"
          />
          <Input
            label="Stock / Equity (annual value)"
            type="number"
            min="0"
            placeholder="0"
            value={form.stockValue}
            onChange={(e) => set("stockValue", e.target.value)}
            hint="Annualized vest value (grant ÷ 4 for 4yr)"
          />
        </div>

        {/* Live total preview */}
        {form.baseSalary && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Total TC preview:</span>
            <Badge variant="purple" className="text-base px-3 py-1">
              ₹{(
                (parseFloat(form.baseSalary) || 0) +
                (parseFloat(form.bonus) || 0) +
                (parseFloat(form.stockValue) || 0)
              ).toLocaleString("en-IN")}
            </Badge>
          </div>
        )}
      </Card>

      {/* Experience */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Experience (optional)</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Total Years of Experience"
            type="number"
            min="0"
            max="50"
            placeholder="e.g. 3"
            value={form.yoe}
            onChange={(e) => set("yoe", e.target.value)}
          />
          <Input
            label="Years at this Company"
            type="number"
            min="0"
            max="50"
            placeholder="e.g. 1"
            value={form.yearsAtCompany}
            onChange={(e) => set("yearsAtCompany", e.target.value)}
          />
        </div>
      </Card>

      <Button type="submit" loading={loading} size="lg" className="w-full">
        Submit Salary Data
      </Button>
    </form>
  );
}
