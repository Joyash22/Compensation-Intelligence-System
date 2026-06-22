"use client";

import { useState, useRef } from "react";
import { Button, Card, Badge } from "@/components/ui";

const TEMPLATE_CSV = `company,title,level,levelLabel,location,baseSalary,bonus,stockValue,yoe,currency
Google,Software Engineer,SENIOR,L5,Bangalore,3500000,700000,2000000,5,INR
Microsoft,Product Manager,MID,IC3,Hyderabad,2800000,420000,1400000,3,INR
Flipkart,Data Scientist,JUNIOR,SDE-1,Bangalore,1800000,180000,0,1,INR
Amazon,Frontend Engineer,SENIOR,SDE-2,Mumbai,2600000,520000,1300000,4,INR`;

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; field: string; message: string }[];
  total: number;
}

export function CSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResult(null); setError(null); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) { setFile(f); setResult(null); setError(null); }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/csv-import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed"); return; }
      setResult(data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compiq_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Template download */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload a CSV file to bulk import salary data.
        </p>
        <Button variant="secondary" size="sm" onClick={downloadTemplate}>
          ↓ Download Template
        </Button>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {file ? (
          <div>
            <p className="font-medium text-indigo-600">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-300">Drop CSV here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">Max 5MB · .csv files only</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {file && (
        <Button onClick={handleUpload} loading={loading} className="w-full">
          Import {file.name}
        </Button>
      )}

      {/* Results */}
      {result && (
        <Card className="p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Import Complete</h3>
          <div className="flex gap-3 flex-wrap">
            <Badge variant="success">✓ {result.imported} imported</Badge>
            {result.skipped > 0 && <Badge variant="warning">⚠ {result.skipped} skipped</Badge>}
            <Badge variant="default">{result.total} rows total</Badge>
          </div>

          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                Errors ({result.errors.length}):
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {result.errors.map((e, i) => (
                  <div key={i} className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded px-2 py-1">
                    Row {e.row} · {e.field}: {e.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Format guide */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Required columns</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { col: "company", req: true },
            { col: "title", req: true },
            { col: "level", req: true },
            { col: "location", req: true },
            { col: "baseSalary", req: true },
            { col: "bonus", req: false },
            { col: "stockValue", req: false },
            { col: "levelLabel", req: false },
            { col: "yoe", req: false },
            { col: "currency", req: false },
          ].map(({ col, req }) => (
            <div key={col} className="flex items-center gap-1.5 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${req ? "bg-red-400" : "bg-gray-300"}`} />
              <code className="font-mono">{col}</code>
              {!req && <span className="text-gray-400">(opt)</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Level values: INTERN, JUNIOR, MID, SENIOR, STAFF, PRINCIPAL, DIRECTOR, VP, C_LEVEL
        </p>
      </Card>
    </div>
  );
}
