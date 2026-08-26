import { isSeedSlug, slugify } from "../../src/wiki-merge.js";
import { HttpError } from "./http.js";

const PENDING_TYPES = new Set(["improve", "page", "roof", "ingest"]);

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "metadata.internal"
]);

export function clampText(value, max) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

export function optionalText(value, max) {
  const text = clampText(value, max);
  return text || "";
}

export function isBlockedHostname(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost")) return true;
  if (host.endsWith(".internal")) return true;
  if (host.endsWith(".local")) return true;
  if (host === "metadata") return true;
  return false;
}

export function isPrivateIpv4(host) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const parts = m.slice(1).map(Number);
  if (parts.some((n) => n > 255)) return false;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

export function parseHttpsUrl(raw, { field = "url", required = false } = {}) {
  const text = clampText(raw, 400);
  if (!text) {
    if (required) throw new HttpError(400, "invalid_input", `${field} is required.`);
    return null;
  }
  let url;
  try {
    url = new URL(text);
  } catch {
    throw new HttpError(400, "invalid_input", `${field} must be an https URL.`);
  }
  if (url.protocol !== "https:") {
    throw new HttpError(400, "invalid_input", `${field} must be https.`);
  }
  if (url.username || url.password) {
    throw new HttpError(400, "invalid_input", `${field} must not include credentials.`);
  }
  if (isBlockedHostname(url.hostname) || isPrivateIpv4(url.hostname)) {
    throw new HttpError(400, "invalid_input", `${field} host is not allowed.`);
  }
  return url.toString();
}

export function parseEmail(raw) {
  const email = clampText(raw, 320).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "invalid_input", "Enter a valid email address.");
  }
  return email;
}

export function parseSlug(raw, { required = false } = {}) {
  const slug = slugify(raw);
  if (!slug) {
    if (required) throw new HttpError(400, "invalid_input", "A slug is required.");
    return null;
  }
  return slug;
}

export function parsePendingPayload(body) {
  const type = String(body?.type || "").trim();
  if (!PENDING_TYPES.has(type)) {
    throw new HttpError(400, "invalid_input", "type must be improve, page, roof, or ingest.");
  }

  const payload = {
    type,
    targetSlug: parseSlug(body.targetSlug),
    title: optionalText(body.title, 120),
    typology: optionalText(body.typology, 120),
    setting: optionalText(body.setting, 160),
    lead: optionalText(body.lead, 1200),
    sectionHeading: optionalText(body.sectionHeading, 120),
    sectionBody: optionalText(body.sectionBody, 4000),
    sourceTitle: optionalText(body.sourceTitle, 160),
    sourceUrl: parseHttpsUrl(body.sourceUrl, { field: "sourceUrl" }),
    displayName: optionalText(body.displayName, 80),
    imagePublicId: optionalText(body.imagePublicId, 200),
    imageUrl: null
  };

  if (body.imageUrl) {
    const imageUrl = clampText(body.imageUrl, 500);
    if (imageUrl.startsWith("https://res.cloudinary.com/")) {
      payload.imageUrl = imageUrl;
    } else if (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) {
      payload.imageUrl = null;
    } else {
      throw new HttpError(400, "invalid_input", "imageUrl must be a Cloudinary https URL.");
    }
  }

  if (payload.imagePublicId && !payload.imagePublicId.startsWith("chimes/")) {
    throw new HttpError(400, "invalid_input", "imagePublicId is not from this project.");
  }

  if (type === "page" && !payload.title) {
    throw new HttpError(400, "invalid_input", "A title is required.");
  }
  if (type === "improve" && !payload.sectionBody && !payload.lead) {
    throw new HttpError(400, "invalid_input", "Add a lead or a section.");
  }
  if (type === "improve" && !payload.targetSlug && !isSeedSlug(payload.targetSlug)) {
    /* target may be a community slug; absence is the only hard fail */
  }
  if (type === "improve" && !payload.targetSlug) {
    throw new HttpError(400, "invalid_input", "Improve needs a target page.");
  }
  if (type === "roof" && !payload.imagePublicId && !payload.imageUrl) {
    throw new HttpError(400, "invalid_input", "A roof image is required.");
  }
  if (type === "ingest" && !payload.title && !payload.sectionBody && !payload.lead) {
    throw new HttpError(400, "invalid_input", "Ingest draft is empty.");
  }

  return payload;
}

export function parsePendingId(raw) {
  const id = String(raw || "").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new HttpError(400, "invalid_input", "pendingId is not valid.");
  }
  return id.toLowerCase();
}

export { slugify, isSeedSlug };
