const supportedDbDrivers = ["local-sqlite", "cloudflare-d1"] as const;

type DatabaseDriver = (typeof supportedDbDrivers)[number];

function parseDbDriver(value: string | undefined): DatabaseDriver {
  if (value === "cloudflare-d1") {
    return "cloudflare-d1";
  }

  return "local-sqlite";
}

export const env = {
  adminEmail: process.env.ADMIN_EMAIL ?? "teacher@abycourse.local",
  adminPassword: process.env.ADMIN_PASSWORD ?? "teach123!",
  adminName: process.env.ADMIN_NAME ?? "Aby Course Teacher",
  sessionSecret:
    process.env.SESSION_SECRET ?? "local-dev-secret-change-before-production",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  dbDriver: parseDbDriver(process.env.DB_DRIVER),
  localDbPath: process.env.LOCAL_DB_PATH ?? "data/abycourse.sqlite",
  cloudflareD1Binding: process.env.CLOUDFLARE_D1_BINDING ?? "DB",
  cloudflareD1DatabaseName:
    process.env.CLOUDFLARE_D1_DATABASE_NAME ?? "abycourse",
  cloudflareD1DatabaseId: process.env.CLOUDFLARE_D1_DATABASE_ID ?? "",
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
};

export { supportedDbDrivers };
export type { DatabaseDriver };
