import { randomUUID } from "node:crypto";

export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function requestIdOf(req) {
  return (
    req.headers["x-request-id"] ||
    req.headers["x-vercel-id"] ||
    randomUUID()
  );
}

export function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  return forwarded || req.socket?.remoteAddress || "0.0.0.0";
}

export function asInet(ip) {
  const value = String(ip || "")
    .trim()
    .replace(/^::ffff:/, "");
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return value;
  if (/^[0-9a-f:]+$/i.test(value) && value.includes(":")) return value;
  return null;
}

export function userAgent(req) {
  return String(req.headers["user-agent"] || "").slice(0, 300);
}

export function readCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  for (const part of String(header).split(";")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export function cookieHeader(name, value, { maxAge, clear = false } = {}) {
  const parts = [
    `${name}=${clear ? "" : encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax"
  ];
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  if (clear) parts.push("Max-Age=0");
  else if (maxAge != null) parts.push(`Max-Age=${maxAge}`);
  return parts.join("; ");
}

export function allowedOrigins(req) {
  const host = String(req.headers.host || "");
  const proto = String(req.headers["x-forwarded-proto"] || "http").split(",")[0];
  const set = new Set();
  if (host) {
    set.add(`${proto}://${host}`);
    set.add(`https://${host}`);
    const live = Boolean(process.env.VERCEL || process.env.NODE_ENV === "production");
    if (!live) set.add(`http://${host}`);
  }
  for (const raw of String(process.env.CHIMES_ORIGIN || "").split(",")) {
    const origin = raw.trim().replace(/\/$/, "");
    if (origin) set.add(origin);
  }
  if (process.env.VERCEL_URL) set.add(`https://${process.env.VERCEL_URL}`);
  return set;
}

export function assertSafeMutation(req) {
  const method = req.method || "GET";
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;
  const origin = req.headers.origin;
  const allowed = allowedOrigins(req);
  if (origin) {
    if (!allowed.has(origin)) {
      throw new HttpError(403, "bad_origin", "Request origin is not allowed.");
    }
    return;
  }
  const referer = req.headers.referer;
  if (!referer) {
    throw new HttpError(403, "bad_origin", "Missing origin for a write request.");
  }
  let refOrigin;
  try {
    refOrigin = new URL(referer).origin;
  } catch {
    throw new HttpError(403, "bad_origin", "Invalid referer.");
  }
  if (!allowed.has(refOrigin)) {
    throw new HttpError(403, "bad_origin", "Request origin is not allowed.");
  }
}

export async function readJson(req, { maxBytes = 32_000 } = {}) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === "string" && req.body) {
    try {
      return JSON.parse(req.body);
    } catch {
      throw new HttpError(400, "invalid_json", "Body must be JSON.");
    }
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      throw new HttpError(413, "payload_too_large", "Request body is too large.");
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "invalid_json", "Body must be JSON.");
  }
}

export function sendJson(res, status, body, { requestId, extraHeaders } = {}) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Request-Id": requestId || "",
    ...(extraHeaders || {})
  };
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

export function sendError(res, err, requestId) {
  const status = err instanceof HttpError ? err.status : 500;
  const code = err instanceof HttpError ? err.code : "internal_error";
  const message =
    err instanceof HttpError
      ? err.message
      : "Something went wrong. Try again in a moment.";
  if (!(err instanceof HttpError) || status >= 500) {
    console.error(
      JSON.stringify({
        level: "error",
        requestId,
        code,
        status,
        message: err?.message,
        stack: err?.stack
      })
    );
  } else {
    console.log(
      JSON.stringify({
        level: "warn",
        requestId,
        code,
        status,
        message
      })
    );
  }
  sendJson(
    res,
    status,
    {
      error: { code, message, details: err instanceof HttpError ? err.details : undefined },
      requestId
    },
    { requestId }
  );
}

export async function withHandler(req, res, fn) {
  const requestId = requestIdOf(req);
  const started = Date.now();
  res.setHeader("X-Request-Id", requestId);
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, { "Cache-Control": "no-store" });
      res.end();
      return;
    }
    await fn(req, res, requestId);
  } catch (err) {
    if (!res.headersSent) sendError(res, err, requestId);
  } finally {
    console.log(
      JSON.stringify({
        level: "info",
        requestId,
        method: req.method,
        path: req.url,
        status: res.statusCode,
        ms: Date.now() - started,
        ip: clientIp(req)
      })
    );
  }
}
