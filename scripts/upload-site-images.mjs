import { readFile, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { loadEnvFile, envRoot } from "./load-env.mjs";
import { SITE_FILES, SITE_FOLDER, sitePublicId } from "../src/cloudinary-site.js";

function sign(params, secret) {
  const blob = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(blob + secret).digest("hex");
}

function mimeFor(file) {
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".webp")) return "image/webp";
  if (file.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

async function uploadOne({ cloud, key, secret, file, buffer }) {
  const publicId = sitePublicId(file);
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    folder: SITE_FOLDER,
    overwrite: "true",
    public_id: publicId,
    timestamp
  };
  const signature = sign(params, secret);
  const form = new FormData();
  form.set("file", new Blob([buffer], { type: mimeFor(file) }), file);
  form.set("api_key", key);
  form.set("timestamp", String(timestamp));
  form.set("signature", signature);
  form.set("folder", SITE_FOLDER);
  form.set("public_id", publicId);
  form.set("overwrite", "true");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body: form
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(`${file}: ${detail}`);
  }
  return data.secure_url || publicId;
}

async function writeCloudName(cloud) {
  const root = envRoot();
  const body =
    "/** Public Cloudinary cloud name. Not a secret. Filled by npm run upload-site-images. */\n" +
    "export const SITE_CLOUD_NAME = " +
    JSON.stringify(cloud) +
    ";\n";
  const from = join(root, "src", "site-cloud.js");
  await writeFile(from, body);
  for (const dir of ["dist", "docs"]) {
    await copyFile(from, join(root, dir, "site-cloud.js")).catch(() => {});
  }
}

async function main() {
  await loadEnvFile();
  const cloud = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const key = String(process.env.CLOUDINARY_API_KEY || "").trim();
  const secret = process.env.CLOUDINARY_API_SECRET || "";
  if (!cloud || !key || !secret) {
    console.error(
      "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env, then rerun."
    );
    process.exit(1);
  }

  const root = envRoot();
  const srcDir = join(root, "src");
  console.log(`Uploading ${SITE_FILES.length} site files to ${SITE_FOLDER} on cloud ${cloud}`);

  for (const file of SITE_FILES) {
    const buffer = await readFile(join(srcDir, file));
    const url = await uploadOne({ cloud, key, secret, file, buffer });
    console.log(`ok ${file} -> ${url}`);
  }

  await writeCloudName(cloud);
  console.log("Wrote src/site-cloud.js. Git originals were not deleted.");
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
