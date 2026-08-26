import { copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILES = [
  "wiki-api.js",
  "wiki-ui.js",
  "wiki-merge.js",
  "script.js",
  "index.html",
  "media.js",
  "favicon.svg"
];

async function main() {
  for (const file of FILES) {
    const from = join(ROOT, "src", file);
    await copyFile(from, join(ROOT, "dist", file));
    await copyFile(from, join(ROOT, "docs", file));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
