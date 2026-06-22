import { z } from "zod";

const LEVELS = [
  "INTERN", "JUNIOR", "MID", "SENIOR", "STAFF",
  "PRINCIPAL", "DIRECTOR", "VP", "C_LEVEL",
] as const;

export const submissionSchema = z.object({
  company: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name too long"),
  title: z
    .string()
    .min(1, "Job title is required")
    .max(150, "Title too long"),
  level: z.enum(LEVELS, { error: () => ({ message: "Invalid level" }) }),
  levelLabel: z
    .string()
    .max(50, "Level label too long")
    .optional()
    .default(""),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location too long"),
  remote: z.boolean().optional().default(false),
  baseSalary: z
    .number()
    .positive("Base salary must be positive")
    .max(100_000_000, "Value seems too large — did you enter correctly?"),
  bonus: z
    .number()
    .min(0, "Bonus cannot be negative")
    .max(100_000_000)
    .optional()
    .default(0),
  stockValue: z
    .number()
    .min(0, "Stock value cannot be negative")
    .max(500_000_000)
    .optional()
    .default(0),
  yoe: z
    .number()
    .int()
    .min(0)
    .max(50)
    .nullable()
    .optional(),
  yearsAtCompany: z
    .number()
    .int()
    .min(0)
    .max(50)
    .nullable()
    .optional(),
  currency: z
    .string()
    .length(3, "Currency must be 3-letter code")
    .optional()
    .default("INR"),
  department: z.string().max(100).optional(),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const filterSchema = z.object({
  company: z.string().optional(),
  title: z.string().optional(),
  level: z.enum(LEVELS).optional(),
  location: z.string().optional(),
  minComp: z.coerce.number().min(0).optional(),
  maxComp: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(["totalComp", "baseSalary", "submittedAt"]).optional().default("submittedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const csvRowSchema = z.object({
  company: z.string().min(1, "Company required"),
  title: z.string().min(1, "Title required"),
  level: z.string().min(1, "Level required"),
  levelLabel: z.string().optional().default(""),
  location: z.string().min(1, "Location required"),
  baseSalary: z.coerce
    .number()
    .positive("Base salary must be a positive number"),
  bonus: z.coerce.number().min(0).optional().default(0),
  stockValue: z.coerce.number().min(0).optional().default(0),
  yoe: z.coerce.number().int().min(0).max(50).optional().nullable(),
  currency: z.string().length(3).optional().default("INR"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
