import path from "node:path";
import { env, type DatabaseDriver } from "../env";

export function isCloudflareD1Driver(driver: DatabaseDriver) {
  return driver === "cloudflare-d1";
}

export function resolveLocalDatabasePath() {
  if (path.isAbsolute(env.localDbPath)) {
    return env.localDbPath;
  }

  return path.join(/* turbopackIgnore: true */ process.cwd(), env.localDbPath);
}

export function assertLocalSqliteRuntime() {
  if (env.dbDriver !== "local-sqlite") {
    throw new Error(
      [
        "DB_DRIVER=cloudflare-d1 belum bisa dijalankan langsung di Next.js lokal ini.",
        "Fondasi env dan config Cloudflare sudah disiapkan, tapi runtime app saat ini masih memakai local SQLite.",
        "Untuk development sekarang, pakai DB_DRIVER=local-sqlite.",
      ].join(" "),
    );
  }
}

export function getDatabaseRuntimeMeta() {
  return {
    driver: env.dbDriver,
    localDbPath: resolveLocalDatabasePath(),
    cloudflare: {
      binding: env.cloudflareD1Binding,
      databaseName: env.cloudflareD1DatabaseName,
      databaseId: env.cloudflareD1DatabaseId,
      accountId: env.cloudflareAccountId,
    },
  };
}
