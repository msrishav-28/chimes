import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { hashPassword } from "../api/lib/password.js";
import { splitSqlStatements } from "../api/lib/sql-split.js";
import { envRoot, loadEnvFile } from "./load-env.mjs";

const ROOT = envRoot();
const MIGRATIONS = join(ROOT, "db", "migrations");

async function ensureAdmin(sql) {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = String(process.env.ADMIN_DISPLAY_NAME || "Editor").slice(0, 80);
  if (!email || !password) {
    console.log("No ADMIN_EMAIL/ADMIN_PASSWORD — skipping admin seed.");
    return;
  }
  const existing = await sql`SELECT user_id FROM users WHERE email = ${email} LIMIT 1`;
  const reset = String(process.env.ADMIN_RESET_PASSWORD || "") === "true";
  if (existing[0] && !reset) {
    console.log(`Admin ${email} already exists.`);
    return;
  }
  const hash = await hashPassword(password);
  if (existing[0] && reset) {
    await sql`
      UPDATE users
      SET password_hash = ${hash}, role = 'admin', display_name = ${name}, updated_at = now()
      WHERE email = ${email}
    `;
    console.log(`Reset password for ${email}.`);
    return;
  }
  await sql`
    INSERT INTO users (email, display_name, password_hash, role)
    VALUES (${email}, ${name}, ${hash}, 'admin')
  `;
  console.log(`Created admin ${email}.`);
}

async function main() {
  await loadEnvFile();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }
  const sql = neon(url);
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  const appliedRows = await sql`SELECT version FROM schema_migrations`;
  const applied = new Set(appliedRows.map((r) => r.version));
  const files = (await readdir(MIGRATIONS))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    if (applied.has(version)) {
      console.log(`skip ${file}`);
      continue;
    }
    const body = await readFile(join(MIGRATIONS, file), "utf8");
    console.log(`apply ${file}`);
    for (const stmt of splitSqlStatements(body)) {
      await sql.query(stmt);
    }
    await sql`INSERT INTO schema_migrations (version) VALUES (${version}) ON CONFLICT (version) DO NOTHING`;
  }

  await ensureAdmin(sql);
  console.log("Migrations complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
