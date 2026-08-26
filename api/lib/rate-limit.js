import { query } from "./db.js";
import { HttpError, clientIp } from "./http.js";

export async function rateLimit(req, name, { limit, windowSeconds }) {
  const ip = clientIp(req);
  const windowStart = new Date(
    Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000
  );
  const key = `${name}:${ip}`;
  const rows = await query`
    INSERT INTO rate_buckets (bucket_key, window_start, hit_count)
    VALUES (${key}, ${windowStart.toISOString()}, 1)
    ON CONFLICT (bucket_key, window_start)
    DO UPDATE SET hit_count = rate_buckets.hit_count + 1
    RETURNING hit_count
  `;
  const count = Number(rows[0]?.hit_count || 1);
  if (count > limit) {
    throw new HttpError(429, "rate_limited", "Slow down and try again shortly.");
  }
  if (Math.random() < 0.02) {
    await query`
      DELETE FROM rate_buckets
      WHERE window_start < now() - interval '2 hours'
    `;
  }
}
