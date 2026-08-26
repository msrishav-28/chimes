import { withHandler, sendJson, HttpError } from "./lib/http.js";
import { query } from "./lib/db.js";

export default async function handler(req, res) {
  await withHandler(req, res, async () => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      throw new HttpError(405, "method_not_allowed", "Use GET.");
    }

    if (!process.env.DATABASE_URL) {
      sendJson(res, 503, {
        ok: false,
        db: "unconfigured",
        upload: process.env.CLOUDINARY_CLOUD_NAME ? "configured" : "unconfigured"
      });
      return;
    }

    try {
      await query`SELECT 1 AS ok`;
    } catch {
      sendJson(res, 503, {
        ok: false,
        db: "down",
        upload: process.env.CLOUDINARY_CLOUD_NAME ? "configured" : "unconfigured"
      });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      db: "up",
      upload: process.env.CLOUDINARY_CLOUD_NAME ? "configured" : "unconfigured"
    });
  });
}
