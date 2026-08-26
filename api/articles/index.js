import { withHandler, sendJson, HttpError } from "../lib/http.js";
import { listPublishedArticles } from "../lib/wiki.js";

export default async function handler(req, res) {
  await withHandler(req, res, async () => {
    if (req.method !== "GET") {
      throw new HttpError(405, "method_not_allowed", "Use GET.");
    }
    const data = await listPublishedArticles();
    sendJson(res, 200, data);
  });
}
