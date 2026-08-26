import { withHandler, sendJson, readJson, assertSafeMutation, HttpError } from "../lib/http.js";
import { loginWithPassword, publicUser, sessionCookie } from "../lib/auth.js";
import { rateLimit } from "../lib/rate-limit.js";
import { parseEmail } from "../lib/validate.js";

export default async function handler(req, res) {
  await withHandler(req, res, async () => {
    if (req.method !== "POST") {
      throw new HttpError(405, "method_not_allowed", "Use POST.");
    }
    assertSafeMutation(req);
    await rateLimit(req, "login", { limit: 8, windowSeconds: 60 * 10 });
    const body = await readJson(req, { maxBytes: 4000 });
    const email = parseEmail(body.email);
    const { token, user } = await loginWithPassword(email, body.password, req);
    sendJson(res, 200, publicUser(user), {
      extraHeaders: { "Set-Cookie": sessionCookie(token) }
    });
  });
}
