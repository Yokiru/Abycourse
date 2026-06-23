import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const usesLocalSqlite = (process.env.DB_DRIVER ?? "local-sqlite") === "local-sqlite";

const nextConfig: NextConfig = {
  serverExternalPackages: usesLocalSqlite ? ["better-sqlite3"] : [],
};

initOpenNextCloudflareForDev();

export default nextConfig;
