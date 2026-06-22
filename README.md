# CompIQ — Compensation Intelligence Platform

A production-grade compensation intelligence platform for Indian tech roles, inspired by Levels.fyi. **Levels matter more than job titles.**

## Architecture

```
compiq/
├── prisma/
│   ├── schema.prisma       # Full data model
│   └── seed.ts             # 50+ realistic salary data points
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/       # NextAuth handlers
│   │   │   ├── submissions/# GET (filtered+paginated), POST (create)
│   │   │   ├── companies/  # List + [slug] detail with level breakdown
│   │   │   ├── compare/    # Multi-company side-by-side comparison
│   │   │   ├── csv-import/ # Bulk CSV ingestion with validation
│   │   │   └── register/   # User registration
│   │   ├── companies/[slug]/
│   │   ├── compare/
│   │   ├── submit/
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   ├── ui/             # Button, Input, Card, Badge, Select, Spinner
│   │   ├── charts/         # CompBreakdownChart, CompanyComparisonChart
│   │   ├── layout/         # Navbar
│   │   ├── SalaryTable.tsx
│   │   ├── SubmitForm.tsx
│   │   └── CSVImport.tsx
│   ├── lib/
│   │   ├── prisma.ts       # Singleton client
│   │   ├── auth.ts         # NextAuth v5 (credentials + Google)
│   │   ├── normalization.ts# Company dedup, title + level mapping
│   │   ├── validations.ts  # Zod schemas
│   │   └── utils.ts
│   └── types/index.ts
```

## Local Setup

```bash
git clone https://github.com/yourusername/compiq
cd compiq
npm install
cp .env.example .env
# Fill in DATABASE_URL and NEXTAUTH_SECRET

npx prisma db push
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npm run dev
```

Open http://localhost:3000

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| NEXTAUTH_SECRET | Yes | Random 32-byte string |
| NEXTAUTH_URL | Yes | http://localhost:3000 for dev |
| GOOGLE_CLIENT_ID | No | For Google OAuth |
| GOOGLE_CLIENT_SECRET | No | For Google OAuth |

## CSV Import Format

```csv
company,title,level,levelLabel,location,baseSalary,bonus,stockValue,yoe,currency
Google,Software Engineer,SENIOR,L5,Bangalore,3500000,700000,2000000,5,INR
```

Valid levels: INTERN, JUNIOR, MID, SENIOR, STAFF, PRINCIPAL, DIRECTOR, VP, C_LEVEL

## Key Design Decisions

- **Levels over titles** — canonical Level enum maps L5/SDE-3/IC3 to "SENIOR" for cross-company comparison
- **Company normalization** — "google inc", "Google LLC", "GOOGLE" all resolve to "Google"
- **All comp stored in INR** — currency conversion at ingestion time
- **Bonus/stock default to 0** — totalComp is always computable

## Competitive Research

| Feature | Levels.fyi | AmbitionBox | Glassdoor | CompIQ |
|---------|-----------|-------------|-----------|--------|
| Level-based comp | Core | No | No | Core |
| India focus | No | Yes | Partial | Yes |
| Stock breakdown | Yes | No | No | Yes |
| Company comparison | Yes | No | No | Yes |
| CSV import | No | No | No | Yes |
