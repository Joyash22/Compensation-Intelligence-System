export type Level =
  | "INTERN"
  | "JUNIOR"
  | "MID"
  | "SENIOR"
  | "STAFF"
  | "PRINCIPAL"
  | "DIRECTOR"
  | "VP"
  | "C_LEVEL";

export const LEVEL_LABELS: Record<Level, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior / L3 / SDE-1",
  MID: "Mid / L4 / SDE-2",
  SENIOR: "Senior / L5 / SDE-3",
  STAFF: "Staff / L6 / Principal",
  PRINCIPAL: "Principal / L7 / Distinguished",
  DIRECTOR: "Director",
  VP: "VP",
  C_LEVEL: "C-Level",
};

export const LEVEL_ORDER: Level[] = [
  "INTERN",
  "JUNIOR",
  "MID",
  "SENIOR",
  "STAFF",
  "PRINCIPAL",
  "DIRECTOR",
  "VP",
  "C_LEVEL",
];

export interface SubmissionRow {
  id: string;
  company: { id: string; name: string; slug: string; logoUrl: string | null };
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

export interface CompanyStats {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  hqLocation: string | null;
  industry: string | null;
  _count: { submissions: number };
  avgBase: number;
  avgBonus: number;
  avgStock: number;
  avgTotalComp: number;
  medianTotalComp: number;
}

export interface FilterParams {
  company?: string;
  title?: string;
  level?: Level;
  location?: string;
  minComp?: number;
  maxComp?: number;
  page?: number;
  pageSize?: number;
  sortBy?: "totalComp" | "baseSalary" | "submittedAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CSVRow {
  company: string;
  title: string;
  level: string;
  levelLabel?: string;
  location: string;
  baseSalary: string;
  bonus?: string;
  stockValue?: string;
  yoe?: string;
  currency?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface CSVImportResult {
  imported: number;
  skipped: number;
  errors: ValidationError[];
}
