import { neon } from "@neondatabase/serverless";
import { HttpError } from "./http.js";

let sql;

export function getSql() {
  if (sql) return sql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new HttpError(
      503,
      "db_unconfigured",
      "The database is not configured yet."
    );
  }
  sql = neon(url, { fetchOptions: { cache: "no-store" } });
  return sql;
}

export async function query(strings, ...values) {
  return getSql()(strings, ...values);
}

export async function transaction(statements) {
  return getSql().transaction(statements);
}
