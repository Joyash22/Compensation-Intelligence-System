/**
 * Normalizes a raw company name to a canonical form.
 * "google inc.", "Google LLC", "GOOGLE" → "Google"
 */

// Known canonical name mappings
const KNOWN_COMPANIES: Record<string, string> = {
  google: "Google",
  "google inc": "Google",
  "google llc": "Google",
  alphabet: "Google",
  microsoft: "Microsoft",
  "microsoft corporation": "Microsoft",
  amazon: "Amazon",
  "amazon.com": "Amazon",
  aws: "Amazon Web Services",
  "amazon web services": "Amazon Web Services",
  meta: "Meta",
  facebook: "Meta",
  "meta platforms": "Meta",
  apple: "Apple",
  "apple inc": "Apple",
  netflix: "Netflix",
  "netflix inc": "Netflix",
  flipkart: "Flipkart",
  "flipkart internet": "Flipkart",
  infosys: "Infosys",
  "infosys limited": "Infosys",
  tcs: "TCS",
  "tata consultancy services": "TCS",
  wipro: "Wipro",
  hcl: "HCL Technologies",
  "hcl technologies": "HCL Technologies",
  "hcl tech": "HCL Technologies",
  zomato: "Zomato",
  swiggy: "Swiggy",
  byju: "BYJU'S",
  "byju's": "BYJU'S",
  byjus: "BYJU'S",
  razorpay: "Razorpay",
  paytm: "Paytm",
  ola: "Ola",
  "ola cabs": "Ola",
  phonepe: "PhonePe",
  meesho: "Meesho",
  cred: "CRED",
  groww: "Groww",
  zerodha: "Zerodha",
  dream11: "Dream11",
  freshworks: "Freshworks",
  zoho: "Zoho",
  oracle: "Oracle",
  "oracle corporation": "Oracle",
  ibm: "IBM",
  "international business machines": "IBM",
  sap: "SAP",
  salesforce: "Salesforce",
  uber: "Uber",
  "uber technologies": "Uber",
  linkedin: "LinkedIn",
  twitter: "X (Twitter)",
  "twitter inc": "X (Twitter)",
  x: "X (Twitter)",
  airbnb: "Airbnb",
  stripe: "Stripe",
  adobe: "Adobe",
  "adobe systems": "Adobe",
  nvidia: "NVIDIA",
  intel: "Intel",
  qualcomm: "Qualcomm",
  accenture: "Accenture",
  deloitte: "Deloitte",
  pwc: "PwC",
  "price waterhouse coopers": "PwC",
  kpmg: "KPMG",
  ey: "EY",
  "ernst & young": "EY",
  "ernst and young": "EY",
  mckinsey: "McKinsey",
  "mckinsey & company": "McKinsey",
  bcg: "BCG",
  "boston consulting group": "BCG",
  bain: "Bain & Company",
  "bain & company": "Bain & Company",
};

const STRIP_SUFFIXES = [
  /\s+(inc\.?|llc\.?|ltd\.?|limited|corporation|corp\.?|co\.?|pvt\.?|private|technologies|technology|tech|systems|solutions|group|holdings|global|international)$/i,
];

export function normalizeCompanyName(raw: string): string {
  const cleaned = raw
    .trim()
    .replace(/[^\w\s&.'()-]/g, "") // remove unusual chars
    .replace(/\s+/g, " ");

  const key = cleaned.toLowerCase();
  if (KNOWN_COMPANIES[key]) return KNOWN_COMPANIES[key];

  // Try stripping legal suffixes
  let stripped = cleaned;
  for (const re of STRIP_SUFFIXES) {
    stripped = stripped.replace(re, "").trim();
  }
  const strippedKey = stripped.toLowerCase();
  if (KNOWN_COMPANIES[strippedKey]) return KNOWN_COMPANIES[strippedKey];

  // Title-case fallback
  return toTitleCase(stripped || cleaned);
}

function toTitleCase(str: string): string {
  const SMALL_WORDS = new Set(["and", "or", "the", "of", "in", "at", "for", "&"]);
  return str
    .toLowerCase()
    .split(" ")
    .map((word, i) =>
      i === 0 || !SMALL_WORDS.has(word)
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word
    )
    .join(" ");
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Normalizes job title to a consistent canonical title
 */
const TITLE_PATTERNS: Array<[RegExp, string]> = [
  [/^(software|swe|sde|sw)\s*(engineer|dev(eloper)?|engg?)?$/i, "Software Engineer"],
  [/^(senior|sr\.?)\s*(software|swe|sde)?\s*(engineer|dev(eloper)?|engg?)?$/i, "Software Engineer"],
  [/^(staff|principal)\s*(software)?\s*(engineer|dev)?$/i, "Software Engineer"],
  [/^(frontend|front-end|fe)\s*(engineer|dev(eloper)?)?$/i, "Frontend Engineer"],
  [/^(backend|back-end|be)\s*(engineer|dev(eloper)?)?$/i, "Backend Engineer"],
  [/^(full.?stack)\s*(engineer|dev(eloper)?)?$/i, "Full Stack Engineer"],
  [/^(ml|machine learning|ai)\s*(engineer|scientist|researcher)?$/i, "ML Engineer"],
  [/^data\s*(scientist|science)\s*.*$/i, "Data Scientist"],
  [/^data\s*(engineer|engineering)\s*.*$/i, "Data Engineer"],
  [/^(product\s*manager|pm)\s*.*$/i, "Product Manager"],
  [/^(devops|sre|site\s*reliability)\s*(engineer)?$/i, "DevOps / SRE"],
  [/^(mobile|ios|android)\s*(engineer|dev(eloper)?)?$/i, "Mobile Engineer"],
  [/^(qa|quality\s*assurance|test)\s*(engineer|analyst)?$/i, "QA Engineer"],
  [/^(ux|ui|design(er)?)\s*(engineer|designer)?$/i, "Designer"],
  [/^(engineering\s*)?(manager|em)\s*.*$/i, "Engineering Manager"],
  [/^(intern(ship)?|trainee|fresher)\s*.*$/i, "Intern"],
];

export function normalizeTitle(raw: string): string {
  const trimmed = raw.trim();
  for (const [pattern, normalized] of TITLE_PATTERNS) {
    if (pattern.test(trimmed)) return normalized;
  }
  return toTitleCase(trimmed);
}

/**
 * Maps various level strings to canonical Level enum
 */
export function normalizeLevel(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/\s+/g, "");

  if (/INTERN|TRAINEE|FRESHER/.test(s)) return "INTERN";
  if (/L3|SDE.?1|IC1|JUNIOR|JR/.test(s)) return "JUNIOR";
  if (/L4|SDE.?2|IC2|MID|ASSOCIATE/.test(s)) return "MID";
  if (/L5|SDE.?3|IC3|SENIOR|SR/.test(s)) return "SENIOR";
  if (/L6|IC4|STAFF|TECHLEADMANAGER|TLM/.test(s)) return "STAFF";
  if (/L7|IC5|PRINCIPAL|DISTINGUISH/.test(s)) return "PRINCIPAL";
  if (/DIRECTOR/.test(s)) return "DIRECTOR";
  if (/^VP|VICEPRESIDENT/.test(s)) return "VP";
  if (/CTO|CEO|CFO|C.LEVEL|CLEVEL/.test(s)) return "C_LEVEL";

  // Numeric fallback
  if (/^[1-9]$/.test(s)) {
    const n = parseInt(s);
    if (n <= 1) return "JUNIOR";
    if (n === 2) return "MID";
    if (n === 3) return "SENIOR";
    if (n === 4) return "STAFF";
    return "PRINCIPAL";
  }

  return "MID"; // safe default
}

export function formatINR(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function convertToINR(amount: number, currency: string): number {
  const rates: Record<string, number> = {
    INR: 1,
    USD: 83.5,
    EUR: 91.2,
    GBP: 106.0,
    SGD: 62.0,
    AED: 22.7,
  };
  return amount * (rates[currency.toUpperCase()] ?? 1);
}
