import { withHandler, sendJson, readJson, assertSafeMutation, HttpError, clientIp, userAgent } from "./lib/http.js";
import { requireUser, readSession } from "./lib/auth.js";
import { rateLimit } from "./lib/rate-limit.js";
import { parsePendingPayload } from "./lib/validate.js";
import { insertPending, listInbox, recordAudit } from "./lib/wiki.js";

export default async function handler(req, res) {
  await withHandler(req, res, async () => {
    if (req.method === "GET") {
      await requireUser(req, ["admin"]);
      const pending = await listInbox();
      sendJson(res, 200, { pending });
      return;
    }

    if (req.method !== "POST") {
      throw new HttpError(405, "method_not_allowed", "Use GET or POST.");
    }

    assertSafeMutation(req);
    await rateLimit(req, "pending", { limit: 12, windowSeconds: 60 * 10 });
    const session = await readSession(req);
    const body = await readJson(req);
    const payload = parsePendingPayload(body);
    if (payload.type === "ingest" && session?.role !== "admin") {
      throw new HttpError(403, "forbidden", "Only ingest cron or an admin can file ingest drafts.");
    }
    const row = await insertPending(payload, {
      userId: session?.user_id || null,
      ip: clientIp(req),
      userAgent: userAgent(req)
    });
    await recordAudit("pending_create", {
      userId: session?.user_id || null,
      ip: clientIp(req),
      meta: { type: payload.type, pendingId: row.id }
    });
    sendJson(res, 201, row);
  });
}
