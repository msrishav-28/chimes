import { withHandler, sendJson, readJson, HttpError, clientIp } from "./lib/http.js";
import { timingSafeSecret } from "./lib/auth.js";
import { rateLimit } from "./lib/rate-limit.js";
import { fetchWikipediaSummary, parseWikipediaTarget } from "./lib/ingest.js";
import { insertPending, recordAudit } from "./lib/wiki.js";

function bearer(req) {
  const header = String(req.headers.authorization || "");
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : "";
}

export default async function handler(req, res) {
  await withHandler(req, res, async () => {
    const secret = process.env.CRON_SECRET;
    if (!secret || !timingSafeSecret(bearer(req), secret)) {
      throw new HttpError(401, "unauthenticated", "Missing or invalid cron secret.");
    }
    if (req.method === "GET") {
      sendJson(res, 200, {
        ok: true,
        note: "Cron is armed. POST url or title to file Wikipedia drafts. Humans still publish."
      });
      return;
    }
    if (req.method !== "POST") {
      throw new HttpError(405, "method_not_allowed", "Use POST.");
    }
    await rateLimit(req, "ingest", { limit: 20, windowSeconds: 60 * 10 });
    const body = await readJson(req);
    const urls = [];
    if (Array.isArray(body.urls)) urls.push(...body.urls);
    if (body.url) urls.push(body.url);
    const titles = Array.isArray(body.titles) ? body.titles : body.title ? [body.title] : [];

    const targets = [];
    for (const url of urls) targets.push(parseWikipediaTarget(url, null));
    for (const title of titles) targets.push(parseWikipediaTarget(null, title));
    if (!targets.length) {
      throw new HttpError(400, "invalid_input", "Provide url(s) or title(s) to ingest.");
    }
    if (targets.length > 5) {
      throw new HttpError(400, "invalid_input", "Ingest at most 5 pages per call.");
    }

    const pending = [];
    for (const target of targets) {
      const draft = await fetchWikipediaSummary(target);
      const row = await insertPending(
        {
          type: "ingest",
          targetSlug: draft.targetSlug,
          title: draft.title,
          typology: "",
          setting: "",
          lead: draft.lead,
          sectionHeading: draft.sectionHeading,
          sectionBody: draft.sectionBody,
          sourceTitle: draft.sourceTitle,
          sourceUrl: draft.sourceUrl,
          displayName: "ingest",
          imagePublicId: "",
          imageUrl: null,
          ingestUrl: draft.ingestUrl
        },
        { ip: clientIp(req), userAgent: "chimes-ingest" }
      );
      pending.push(row);
    }

    await recordAudit("ingest", {
      ip: clientIp(req),
      meta: { count: pending.length }
    });
    sendJson(res, 201, { pending, note: "Drafts only. Humans publish." });
  });
}
