import Busboy from "busboy";
import { withHandler, sendJson, assertSafeMutation, HttpError } from "./lib/http.js";
import { requireUser } from "./lib/auth.js";
import { rateLimit } from "./lib/rate-limit.js";
import { MAX_UPLOAD_BYTES, sniffImage, uploadSignedImage } from "./lib/cloudinary.js";
import { recordAsset } from "./lib/wiki.js";

function readMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: MAX_UPLOAD_BYTES, fields: 4 }
    });
    const chunks = [];
    let filename = "";
    let mime = "";
    let truncated = false;

    bb.on("file", (_name, file, info) => {
      filename = info.filename || "";
      mime = info.mimeType || "";
      file.on("data", (d) => chunks.push(d));
      file.on("limit", () => {
        truncated = true;
      });
    });
    bb.on("error", reject);
    bb.on("finish", () => {
      resolve({
        buffer: Buffer.concat(chunks),
        filename,
        mime,
        truncated
      });
    });
    req.pipe(bb);
  });
}

export default async function handler(req, res) {
  await withHandler(req, res, async () => {
    if (req.method !== "POST") {
      throw new HttpError(405, "method_not_allowed", "Use POST.");
    }
    assertSafeMutation(req);
    const session = await requireUser(req, ["contributor", "admin"]);
    await rateLimit(req, "upload", { limit: 8, windowSeconds: 60 * 10 });

    const file = await readMultipart(req);
    if (file.truncated) {
      throw new HttpError(413, "payload_too_large", "Image must be 6 MB or smaller.");
    }
    if (!file.buffer.length) {
      throw new HttpError(400, "invalid_input", "Choose an image file.");
    }
    const sniffed = sniffImage(file.buffer);
    if (!sniffed) {
      throw new HttpError(400, "invalid_input", "Only JPEG, PNG, or WebP images are allowed.");
    }

    const folder = session.role === "admin" ? "chimes/roofs" : "chimes/drafts";
    const uploaded = await uploadSignedImage({
      buffer: file.buffer,
      mime: sniffed,
      folder
    });
    await recordAsset({
      publicId: uploaded.publicId,
      url: uploaded.url,
      folder,
      contentType: sniffed,
      byteSize: file.buffer.length,
      userId: session.user_id
    });
    sendJson(res, 201, { publicId: uploaded.publicId, url: uploaded.url });
  });
}
