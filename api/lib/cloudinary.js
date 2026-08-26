import { createHash, randomUUID } from "node:crypto";
import { HttpError } from "./http.js";

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

const SIGNATURES = [
  { mime: "image/jpeg", test: (b) => b.length > 2 && b[0] === 0xff && b[1] === 0xd8 },
  { mime: "image/png", test: (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: "image/webp", test: (b) => b.length > 12 && b.slice(0, 4).toString("ascii") === "RIFF" && b.slice(8, 12).toString("ascii") === "WEBP" }
];

export function sniffImage(buffer) {
  const match = SIGNATURES.find((s) => s.test(buffer));
  return match?.mime || null;
}

function requiredEnv() {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    throw new HttpError(503, "upload_unconfigured", "Image upload is not configured yet.");
  }
  return { cloud, key, secret };
}

function sign(params, secret) {
  const blob = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(blob + secret).digest("hex");
}

export async function uploadSignedImage({ buffer, mime, folder }) {
  const { cloud, key, secret } = requiredEnv();
  if (!["chimes/roofs", "chimes/drafts"].includes(folder)) {
    throw new HttpError(400, "invalid_input", "Unknown upload folder.");
  }
  const publicId = `${folder}/${randomUUID()}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    folder,
    public_id: publicId,
    timestamp,
    overwrite: "false"
  };
  const signature = sign(params, secret);
  const form = new FormData();
  form.set("file", new Blob([buffer], { type: mime }), "roof.jpg");
  form.set("api_key", key);
  form.set("timestamp", String(timestamp));
  form.set("signature", signature);
  form.set("folder", folder);
  form.set("public_id", publicId);
  form.set("overwrite", "false");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body: form
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(JSON.stringify({ level: "error", event: "cloudinary_upload", status: res.status, data }));
    throw new HttpError(502, "upload_failed", "Could not store that image.");
  }
  return {
    publicId: data.public_id || publicId,
    url: data.secure_url
  };
}
