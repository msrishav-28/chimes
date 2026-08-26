import { withHandler, sendJson, readJson, assertSafeMutation, HttpError } from "./lib/http.js";
import { requireUser } from "./lib/auth.js";
import { parsePendingId } from "./lib/validate.js";
import { publishPending } from "./lib/wiki.js";

export default async function handler(req, res) {
  await withHandler(req, res, async () => {
    if (req.method !== "POST") {
      throw new HttpError(405, "method_not_allowed", "Use POST.");
    }
    assertSafeMutation(req);
    const session = await requireUser(req, ["admin"]);
    const body = await readJson(req);
    const pendingId = parsePendingId(body.pendingId);
    const result = await publishPending(pendingId, session.user_id);
    sendJson(res, 200, result);
  });
}
