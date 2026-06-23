import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { env } from "../env";
import { createPublicId, nowIso } from "../utils";
import { getDatabaseRuntimeMeta, isCloudflareD1Driver, resolveLocalDatabasePath } from "./runtime";
import * as schema from "./schema";

type D1ClientLike = {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<unknown>;
    };
  };
};

function createLocalDrizzle(sqlite: Database.Database) {
  return drizzleSqlite(sqlite, { schema });
}

function createD1Drizzle(client: Parameters<typeof drizzleD1>[0]) {
  return drizzleD1(client, { schema });
}

type AppDatabase = ReturnType<typeof createLocalDrizzle>;

declare global {
  var __abyCourseSqlite: Database.Database | undefined;
  var __abyCourseLocalDb: AppDatabase | undefined;
  var __abyCourseLocalReady: boolean | undefined;
  var __abyCourseD1Db: AppDatabase | undefined;
  var __abyCourseD1Ready: boolean | undefined;
}

function ensureLocalDatabaseFile() {
  const resolvedPath = resolveLocalDatabasePath();
  const dataDir = path.dirname(resolvedPath);

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  return resolvedPath;
}

function loadSchemaSql() {
  const schemaPath = path.join(process.cwd(), "..", "d1-schema.sql");
  return readFileSync(schemaPath, "utf8");
}

function getLocalSqlite() {
  const sqlite =
    global.__abyCourseSqlite ??
    new Database(ensureLocalDatabaseFile(), {
      fileMustExist: false,
    });

  if (!global.__abyCourseSqlite) {
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    global.__abyCourseSqlite = sqlite;
  }

  return sqlite;
}

function seedLocalAdminUser(sqlite: Database.Database) {
  const timestamp = nowIso();

  sqlite
    .prepare(
      `
        INSERT OR IGNORE INTO admin_users (
          public_id,
          name,
          email,
          password_hash,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      createPublicId("adm"),
      env.adminName,
      env.adminEmail,
      bcrypt.hashSync(env.adminPassword, 10),
      timestamp,
      timestamp,
    );
}

function ensureLocalDatabaseReady() {
  if (global.__abyCourseLocalReady) {
    return;
  }

  const sqlite = getLocalSqlite();
  sqlite.exec(loadSchemaSql());
  seedLocalAdminUser(sqlite);
  global.__abyCourseLocalReady = true;
}

function getLocalDatabase() {
  ensureLocalDatabaseReady();

  global.__abyCourseLocalDb ??= createLocalDrizzle(getLocalSqlite());
  return global.__abyCourseLocalDb;
}

async function getCloudflareD1Client() {
  const context = await getCloudflareContext({ async: true });
  const binding = context.env[env.cloudflareD1Binding as keyof typeof context.env];

  if (!binding) {
    throw new Error(
      `Cloudflare D1 binding "${env.cloudflareD1Binding}" tidak ditemukan di runtime ini.`,
    );
  }

  return binding as D1ClientLike & Parameters<typeof drizzleD1>[0];
}

async function seedCloudflareAdminUser(client: D1ClientLike) {
  const timestamp = nowIso();

  await client
    .prepare(
      `
        INSERT OR IGNORE INTO admin_users (
          public_id,
          name,
          email,
          password_hash,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      createPublicId("adm"),
      env.adminName,
      env.adminEmail,
      bcrypt.hashSync(env.adminPassword, 10),
      timestamp,
      timestamp,
    )
    .run();
}

async function getCloudflareD1Database() {
  const client = await getCloudflareD1Client();

  if (!global.__abyCourseD1Ready) {
    await seedCloudflareAdminUser(client);
    global.__abyCourseD1Ready = true;
  }

  global.__abyCourseD1Db ??= createD1Drizzle(client) as unknown as AppDatabase;
  return global.__abyCourseD1Db;
}

export async function ensureDatabaseReady() {
  if (isCloudflareD1Driver(env.dbDriver)) {
    await getCloudflareD1Database();
    return;
  }

  getLocalDatabase();
}

export async function getDb(): Promise<AppDatabase> {
  if (isCloudflareD1Driver(env.dbDriver)) {
    return await getCloudflareD1Database();
  }

  return getLocalDatabase();
}

export const databaseRuntimeMeta = getDatabaseRuntimeMeta();
