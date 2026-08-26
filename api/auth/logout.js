import { withHandler, sendJson, assertSafeMutation, HttpError } from "../lib/http.js";
import { clearSessionCookie, revokeSession } from "../lib/auth.js";

export default async function handler(req, res) {
  await withHandler(req, res, async () => {
    if (req.method !== "POST") {
      throw new HttpError(405, "method_not_allowed", "Use POST.");
    }
    assertSafeMutation(req);
    await revokeSession(req);
    sendJson(res, 200, { ok: true }, {
      extraHeaders: { "Set-Cookie": clearSessionCookie() }
    });
  });
}
