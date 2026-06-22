// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SEED_DATA = [
  // Google
  { company: "Google", slug: "google", title: "Software Engineer", normalizedTitle: "Software Engineer", level: "JUNIOR", levelLabel: "L3", location: "Bangalore", baseSalary: 2200000, bonus: 330000, stockValue: 1100000, yoe: 1 },
  { company: "Google", slug: "google", title: "Software Engineer", normalizedTitle: "Software Engineer", level: "MID", levelLabel: "L4", location: "Bangalore", baseSalary: 2800000, bonus: 560000, stockValue: 1800000, yoe: 3 },
  { company: "Google", slug: "google", title: "Senior Software Engineer", normalizedTitle: "Software Engineer", level: "SENIOR", levelLabel: "L5", location: "Bangalore", baseSalary: 3800000, bonus: 760000, stockValue: 2500000, yoe: 6 },
  { company: "Google", slug: "google", title: "Staff Software Engineer", normalizedTitle: "Software Engineer", level: "STAFF", levelLabel: "L6", location: "Hyderabad", baseSalary: 5500000, bonus: 1100000, stockValue: 5000000, yoe: 10 },
  { company: "Google", slug: "google", title: "Product Manager", normalizedTitle: "Product Manager", level: "MID", levelLabel: "L4", location: "Bangalore", baseSalary: 3000000, bonus: 600000, stockValue: 1800000, yoe: 4 },
  { company: "Google", slug: "google", title: "Senior Product Manager", normalizedTitle: "Product Manager", level: "SENIOR", levelLabel: "L5", location: "Bangalore", baseSalary: 4200000, bonus: 840000, stockValue: 3000000, yoe: 7 },
  { company: "Google", slug: "google", title: "Data Scientist", normalizedTitle: "Data Scientist", level: "SENIOR", levelLabel: "L5", location: "Bangalore", baseSalary: 3600000, bonus: 720000, stockValue: 2200000, yoe: 5 },

  // Microsoft
  { company: "Microsoft", slug: "microsoft", title: "Software Engineer", normalizedTitle: "Software Engineer", level: "JUNIOR", levelLabel: "IC2", location: "Hyderabad", baseSalary: 1900000, bonus: 285000, stockValue: 800000, yoe: 1 },
  { company: "Microsoft", slug: "microsoft", title: "Software Engineer II", normalizedTitle: "Software Engineer", level: "MID", levelLabel: "IC3", location: "Hyderabad", baseSalary: 2500000, bonus: 375000, stockValue: 1200000, yoe: 3 },
  { company: "Microsoft", slug: "microsoft", title: "Senior Software Engineer", normalizedTitle: "Software Engineer", level: "SENIOR", levelLabel: "IC4", location: "Hyderabad", baseSalary: 3400000, bonus: 680000, stockValue: 2000000, yoe: 6 },
  { company: "Microsoft", slug: "microsoft", title: "Principal Engineer", normalizedTitle: "Software Engineer", level: "STAFF", levelLabel: "IC5", location: "Hyderabad", baseSalary: 5000000, bonus: 1000000, stockValue: 4000000, yoe: 11 },
  { company: "Microsoft", slug: "microsoft", title: "Data Scientist", normalizedTitle: "Data Scientist", level: "MID", levelLabel: "IC3", location: "Hyderabad", baseSalary: 2400000, bonus: 360000, stockValue: 1000000, yoe: 3 },

  // Amazon
  { company: "Amazon", slug: "amazon", title: "SDE-1", normalizedTitle: "Software Engineer", level: "JUNIOR", levelLabel: "SDE-1", location: "Bangalore", baseSalary: 2000000, bonus: 200000, stockValue: 900000, yoe: 1 },
  { company: "Amazon", slug: "amazon", title: "SDE-2", normalizedTitle: "Software Engineer", level: "MID", levelLabel: "SDE-2", location: "Bangalore", baseSalary: 2700000, bonus: 270000, stockValue: 1600000, yoe: 4 },
  { company: "Amazon", slug: "amazon", title: "SDE-3", normalizedTitle: "Software Engineer", level: "SENIOR", levelLabel: "SDE-3", location: "Bangalore", baseSalary: 3500000, bonus: 350000, stockValue: 2800000, yoe: 7 },
  { company: "Amazon", slug: "amazon", title: "Principal SDE", normalizedTitle: "Software Engineer", level: "STAFF", levelLabel: "Principal", location: "Bangalore", baseSalary: 5200000, bonus: 520000, stockValue: 6000000, yoe: 13 },
  { company: "Amazon", slug: "amazon", title: "Product Manager", normalizedTitle: "Product Manager", level: "MID", levelLabel: "PM-II", location: "Hyderabad", baseSalary: 2800000, bonus: 420000, stockValue: 1400000, yoe: 4 },

  // Flipkart
  { company: "Flipkart", slug: "flipkart", title: "SDE-1", normalizedTitle: "Software Engineer", level: "JUNIOR", levelLabel: "SDE-1", location: "Bangalore", baseSalary: 1600000, bonus: 160000, stockValue: 400000, yoe: 1 },
  { company: "Flipkart", slug: "flipkart", title: "SDE-2", normalizedTitle: "Software Engineer", level: "MID", levelLabel: "SDE-2", location: "Bangalore", baseSalary: 2200000, bonus: 330000, stockValue: 800000, yoe: 3 },
  { company: "Flipkart", slug: "flipkart", title: "Senior SDE", normalizedTitle: "Software Engineer", level: "SENIOR", levelLabel: "SDE-3", location: "Bangalore", baseSalary: 3000000, bonus: 600000, stockValue: 1500000, yoe: 6 },
  { company: "Flipkart", slug: "flipkart", title: "Staff Engineer", normalizedTitle: "Software Engineer", level: "STAFF", levelLabel: "Staff", location: "Bangalore", baseSalary: 4200000, bonus: 840000, stockValue: 3500000, yoe: 10 },
  { company: "Flipkart", slug: "flipkart", title: "Data Scientist", normalizedTitle: "Data Scientist", level: "MID", levelLabel: "L4", location: "Bangalore", baseSalary: 2100000, bonus: 315000, stockValue: 700000, yoe: 3 },

  // Meta
  { company: "Meta", slug: "meta", title: "Software Engineer", normalizedTitle: "Software Engineer", level: "JUNIOR", levelLabel: "E3", location: "Hyderabad", baseSalary: 2400000, bonus: 480000, stockValue: 1500000, yoe: 1 },
  { company: "Meta", slug: "meta", title: "Software Engineer", normalizedTitle: "Software Engineer", level: "MID", levelLabel: "E4", location: "Hyderabad", baseSalary: 3200000, bonus: 640000, stockValue: 2500000, yoe: 3 },
  { company: "Meta", slug: "meta", title: "Senior Software Engineer", normalizedTitle: "Software Engineer", level: "SENIOR", levelLabel: "E5", location: "Hyderabad", baseSalary: 4500000, bonus: 900000, stockValue: 4000000, yoe: 7 },
  { company: "Meta", slug: "meta", title: "Staff Engineer", normalizedTitle: "Software Engineer", level: "STAFF", levelLabel: "E6", location: "Hyderabad", baseSalary: 7000000, bonus: 1400000, stockValue: 8000000, yoe: 12 },

  // Infosys
  { company: "Infosys", slug: "infosys", title: "Systems Engineer", normalizedTitle: "Software Engineer", level: "JUNIOR", levelLabel: "SE", location: "Bangalore", baseSalary: 480000, bonus: 48000, stockValue: 0, yoe: 0 },
  { company: "Infosys", slug: "infosys", title: "Senior Systems Engineer", normalizedTitle: "Software Engineer", level: "MID", levelLabel: "SSE", location: "Pune", baseSalary: 850000, bonus: 85000, stockValue: 0, yoe: 3 },
  { company: "Infosys", slug: "infosys", title: "Technical Lead", normalizedTitle: "Software Engineer", level: "SENIOR", levelLabel: "TL", location: "Chennai", baseSalary: 1500000, bonus: 150000, stockValue: 0, yoe: 6 },
  { company: "Infosys", slug: "infosys", title: "Solution Architect", normalizedTitle: "Software Engineer", level: "STAFF", levelLabel: "Architect", location: "Bangalore", baseSalary: 2400000, bonus: 360000, stockValue: 200000, yoe: 12 },

  // TCS
  { company: "TCS", slug: "tcs", title: "Assistant System Engineer", normalizedTitle: "Software Engineer", level: "JUNIOR", levelLabel: "ASE", location: "Mumbai", baseSalary: 380000, bonus: 38000, stockValue: 0, yoe: 0 },
  { company: "TCS", slug: "tcs", title: "System Engineer", normalizedTitle: "Software Engineer", level: "MID", levelLabel: "SE", location: "Bangalore", baseSalary: 680000, bonus: 68000, stockValue: 0, yoe: 3 },
  { company: "TCS", slug: "tcs", title: "IT Analyst", normalizedTitle: "Software Engineer", level: "SENIOR", levelLabel: "ITA", location: "Hyderabad", baseSalary: 1100000, bonus: 110000, stockValue: 0, yoe: 6 },

  // Zomato
  { company: "Zomato", slug: "zomato", title: "Software Engineer", normalizedTitle: "Software Engineer", level: "JUNIOR", levelLabel: "SDE-1", location: "Gurgaon", baseSalary: 1400000, bonus: 140000, stockValue: 600000, yoe: 1 },
  { company: "Zomato", slug: "zomato", title: "Senior Software Engineer", normalizedTitle: "Software Engineer", level: "SENIOR", levelLabel: "SDE-3", location: "Gurgaon", baseSalary: 2800000, bonus: 420000, stockValue: 1800000, yoe: 5 },
  { company: "Zomato", slug: "zomato", title: "Product Manager", normalizedTitle: "Product Manager", level: "MID", levelLabel: "PM", location: "Gurgaon", baseSalary: 2400000, bonus: 480000, stockValue: 1200000, yoe: 4 },

  // Razorpay
  { company: "Razorpay", slug: "razorpay", title: "Software Engineer", normalizedTitle: "Software Engineer", level: "MID", levelLabel: "SDE-2", location: "Bangalore", baseSalary: 2000000, bonus: 300000, stockValue: 800000, yoe: 2 },
  { company: "Razorpay", slug: "razorpay", title: "Senior Software Engineer", normalizedTitle: "Software Engineer", level: "SENIOR", levelLabel: "SDE-3", location: "Bangalore", baseSalary: 3200000, bonus: 640000, stockValue: 2000000, yoe: 5 },
  { company: "Razorpay", slug: "razorpay", title: "ML Engineer", normalizedTitle: "ML Engineer", level: "SENIOR", levelLabel: "Senior MLE", location: "Bangalore", baseSalary: 3000000, bonus: 600000, stockValue: 1800000, yoe: 5 },

  // PhonePe
  { company: "PhonePe", slug: "phonepe", title: "Software Engineer", normalizedTitle: "Software Engineer", level: "MID", levelLabel: "SDE-2", location: "Bangalore", baseSalary: 1900000, bonus: 285000, stockValue: 700000, yoe: 2 },
  { company: "PhonePe", slug: "phonepe", title: "Senior Software Engineer", normalizedTitle: "Software Engineer", level: "SENIOR", levelLabel: "SDE-3", location: "Bangalore", baseSalary: 2900000, bonus: 580000, stockValue: 1600000, yoe: 5 },

  // Swiggy
  { company: "Swiggy", slug: "swiggy", title: "Software Engineer", normalizedTitle: "Software Engineer", level: "JUNIOR", levelLabel: "SDE-1", location: "Bangalore", baseSalary: 1500000, bonus: 150000, stockValue: 500000, yoe: 1 },
  { company: "Swiggy", slug: "swiggy", title: "SDE-2", normalizedTitle: "Software Engineer", level: "MID", levelLabel: "SDE-2", location: "Bangalore", baseSalary: 2300000, bonus: 345000, stockValue: 1000000, yoe: 3 },
  { company: "Swiggy", slug: "swiggy", title: "Senior Engineer", normalizedTitle: "Software Engineer", level: "SENIOR", levelLabel: "SDE-3", location: "Bangalore", baseSalary: 3100000, bonus: 620000, stockValue: 1800000, yoe: 6 },

  // Freshworks
  { company: "Freshworks", slug: "freshworks", title: "Software Engineer", normalizedTitle: "Software Engineer", level: "MID", levelLabel: "SE", location: "Chennai", baseSalary: 1600000, bonus: 160000, stockValue: 400000, yoe: 2 },
  { company: "Freshworks", slug: "freshworks", title: "Senior Software Engineer", normalizedTitle: "Software Engineer", level: "SENIOR", levelLabel: "SSE", location: "Chennai", baseSalary: 2500000, bonus: 375000, stockValue: 1000000, yoe: 5 },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Group by company
  const byCompany = SEED_DATA.reduce((acc, row) => {
    if (!acc[row.slug]) acc[row.slug] = { name: row.company, slug: row.slug, rows: [] };
    acc[row.slug].rows.push(row);
    return acc;
  }, {} as Record<string, { name: string; slug: string; rows: typeof SEED_DATA }>);

  for (const [slug, { name, rows }] of Object.entries(byCompany)) {
    const company = await prisma.company.upsert({
      where: { slug },
      update: {},
      create: { name, slug, aliases: [name.toLowerCase()] },
    });

    for (const row of rows) {
      const totalComp = row.baseSalary + row.bonus + row.stockValue;
      await prisma.submission.create({
        data: {
          companyId: company.id,
          title: row.title,
          normalizedTitle: row.normalizedTitle,
          level: row.level as any,
          levelLabel: (row as any).levelLabel ?? "",
          location: row.location,
          baseSalary: row.baseSalary,
          bonus: row.bonus,
          stockValue: row.stockValue,
          totalComp,
          yoe: row.yoe ?? null,
          currency: "INR",
          source: "manual",
          verified: true,
        },
      });
    }

    console.log(`  ✓ ${name}: ${rows.length} submissions`);
  }

  console.log(`\n✅ Seeded ${SEED_DATA.length} salary entries across ${Object.keys(byCompany).length} companies.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
