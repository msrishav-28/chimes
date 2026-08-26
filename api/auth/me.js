import { withHandler, sendJson, HttpError } from "../lib/http.js";
import { publicUser, readSession } from "../lib/auth.js";

export default async function handler(req, res) {
  await withHandler(req, res, async () => {
    if (req.method !== "GET") {
      throw new HttpError(405, "method_not_allowed", "Use GET.");
    }
    const session = await readSession(req);
    if (!session) {
      sendJson(res, 200, { email: null, displayName: null, role: "visitor" });
      return;
    }
    sendJson(res, 200, publicUser(session));
  });
}
