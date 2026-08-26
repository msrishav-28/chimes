import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { query } from "./db.js";
import { cookieHeader, HttpError, readCookies, clientIp, userAgent } from "./http.js";
import { passwordLooksUsable, verifyPassword } from "./password.js";

export const SESSION_COOKIE = "chimes_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;
const LOCK_AFTER = 8;
const LOCK_MINUTES = 15;

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function publicUser(row) {
  if (!row) return null;
  return {
    email: row.email,
    displayName: row.display_name,
    role: row.role
  };
}

export async function readSession(req) {
  const token = readCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const tokenHash = hashToken(token);
  const rows = await query`
    SELECT
      s.session_id,
      s.expires_at,
      u.user_id,
      u.email,
      u.display_name,
      u.role
    FROM sessions s
    JOIN users u ON u.user_id = s.user_id
    WHERE s.token_hash = ${tokenHash}
      AND s.revoked_at IS NULL
      AND s.expires_at > now()
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function requireUser(req, roles) {
  const session = await readSession(req);
  if (!session) {
    throw new HttpError(401, "unauthenticated", "Sign in to continue.");
  }
  if (roles?.length && !roles.includes(session.role)) {
    throw new HttpError(403, "forbidden", "You do not have access to that.");
  }
  return session;
}

export function sessionCookie(token) {
  return cookieHeader(SESSION_COOKIE, token, { maxAge: SESSION_TTL_SECONDS });
}

export function clearSessionCookie() {
  return cookieHeader(SESSION_COOKIE, "", { clear: true });
}

function inetOrNull(ip) {
  const value = String(ip || "").trim();
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return value;
  if (/^[0-9a-f:]+$/i.test(value) && value.includes(":")) return value;
  return null;
}

export async function createSession(userId, req) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  await query`
    INSERT INTO sessions (user_id, token_hash, expires_at, user_agent, ip)
    VALUES (
      ${userId},
      ${tokenHash},
      now() + (${SESSION_TTL_SECONDS} * interval '1 second'),
      ${userAgent(req)},
      ${inetOrNull(clientIp(req))}
    )
  `;
  return token;
}

export async function revokeSession(req) {
  const token = readCookies(req)[SESSION_COOKIE];
  if (!token) return;
  const tokenHash = hashToken(token);
  await query`
    UPDATE sessions
    SET revoked_at = now()
    WHERE token_hash = ${tokenHash} AND revoked_at IS NULL
  `;
}

function sameDummyHash() {
  return "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
}

export async function loginWithPassword(email, password, req) {
  if (!passwordLooksUsable(password)) {
    await verifyPassword(password || "x", sameDummyHash()).catch(() => false);
    throw new HttpError(401, "invalid_credentials", "Email or password is wrong.");
  }

  const rows = await query`
    SELECT user_id, email, display_name, role, password_hash,
           failed_login_count, locked_until
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  const user = rows[0];
  const hash = user?.password_hash || sameDummyHash();
  const ok = await verifyPassword(password, hash);

  if (user?.locked_until && new Date(user.locked_until) > new Date()) {
    throw new HttpError(423, "locked", "Too many attempts. Try again later.");
  }

  if (!user || !ok) {
    if (user) {
      const fails = Number(user.failed_login_count || 0) + 1;
      const lock = fails >= LOCK_AFTER;
      await query`
        UPDATE users
        SET failed_login_count = ${fails},
            locked_until = CASE WHEN ${lock} THEN now() + (${LOCK_MINUTES} * interval '1 minute') ELSE locked_until END
        WHERE user_id = ${user.user_id}
      `;
    }
    throw new HttpError(401, "invalid_credentials", "Email or password is wrong.");
  }

  await query`
    UPDATE users
    SET failed_login_count = 0,
        locked_until = NULL,
        last_login_at = now()
    WHERE user_id = ${user.user_id}
  `;

  const token = await createSession(user.user_id, req);
  return { token, user };
}

export function timingSafeSecret(provided, expected) {
  if (!expected || !provided) return false;
  const a = Buffer.from(String(provided));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
