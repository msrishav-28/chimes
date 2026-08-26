import { withHandler, sendJson, readJson, assertSafeMutation, HttpError } from "./lib/http.js";
import { rateLimit } from "./lib/rate-limit.js";
import { clampText, parseSlug } from "./lib/validate.js";
import { publishedCorpus } from "./lib/wiki.js";
import { extractiveAnswer } from "./lib/seed.js";

export default async function handler(req, res) {
  await withHandler(req, res, async () => {
    if (req.method !== "POST") {
      throw new HttpError(405, "method_not_allowed", "Use POST.");
    }
    assertSafeMutation(req);
    await rateLimit(req, "ask", { limit: 20, windowSeconds: 60 * 10 });
    const body = await readJson(req, { maxBytes: 4000 });
    const question = clampText(body.question, 400);
    if (!question) {
      throw new HttpError(400, "invalid_input", "Ask a question about a roof, climate, or country.");
    }
    const slug = parseSlug(body.slug);
    const corpus = await publishedCorpus();
    const result = extractiveAnswer(question, corpus, slug);
    sendJson(res, 200, {
      answer: result.answer,
      citations: result.citations
    });
  });
}
