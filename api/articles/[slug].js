import { withHandler, sendJson, HttpError } from "../lib/http.js";
import { getPublishedArticle } from "../lib/wiki.js";

export default async function handler(req, res) {
  await withHandler(req, res, async () => {
    if (req.method !== "GET") {
      throw new HttpError(405, "method_not_allowed", "Use GET.");
    }
    const slug = req.query?.slug || String(req.url || "").split("/").filter(Boolean).pop();
    const article = await getPublishedArticle(slug);
    if (!article) {
      throw new HttpError(404, "not_found", "No published page with that slug.");
    }
    sendJson(res, 200, article);
  });
}
