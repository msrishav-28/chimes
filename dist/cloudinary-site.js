/**
 * Official site pictures live in Cloudinary folder chimes/site.
 * Git originals stay in src/. If the cloud name is empty, local paths are used.
 * User-contributed images never use this folder — they go through /api/upload
 * into chimes/drafts or chimes/roofs.
 */

import { SITE_CLOUD_NAME } from "./site-cloud.js";

export const SITE_FOLDER = "chimes/site";

export const SITE_FILES = Object.freeze([
  "bg.png",
  "chat-noise.png",
  "configure-btn.svg",
  "favicon.svg",
  "icon-creatures.svg",
  "marina.jpg",
  "roof.png",
  "roof-brazil.png",
  "roof-china.png",
  "roof-france.png",
  "roof-india.png",
  "roof-iran.png",
  "roof-italy.png",
  "roof-japan.png",
  "roof-kazakhstan.png",
  "roof-norway.png",
  "roof-russia.png",
  "roof-uk.png",
  "roof-usa.png",
  "roof-vietnam.png",
  "selector-brazil.png",
  "selector-china.png",
  "selector-frame.svg",
  "selector-france.png",
  "selector-india.png",
  "selector-iran.png",
  "selector-italy.png",
  "selector-japan.png",
  "selector-kazakhstan.png",
  "selector-norway.png",
  "selector-russia.png",
  "selector-uk.png",
  "selector-usa.png",
  "selector-vietnam.png",
  "shadow.svg"
]);

export function siteCloudName() {
  return String(SITE_CLOUD_NAME || "").trim();
}

export function siteFileName(localPath) {
  return String(localPath || "")
    .replace(/^\.\//, "")
    .split("/")
    .pop();
}

export function sitePublicId(localPath) {
  const file = siteFileName(localPath);
  const stem = file.replace(/\.[^.]+$/, "");
  return `${SITE_FOLDER}/${stem}`;
}

export function siteSrc(localPath, { width } = {}) {
  const file = siteFileName(localPath);
  const local = file ? `./${file}` : String(localPath || "");
  const cloud = siteCloudName();
  if (!cloud || !file) return local;
  const id = sitePublicId(file);
  if (file.endsWith(".svg")) {
    return `https://res.cloudinary.com/${cloud}/image/upload/${id}`;
  }
  const w = Number(width);
  const transform = Number.isFinite(w) && w > 0
    ? `w_${Math.round(w)},c_limit,f_auto,q_auto`
    : "f_auto,q_auto";
  return `https://res.cloudinary.com/${cloud}/image/upload/${transform}/${id}`;
}

export function applySiteCssVars(root = typeof document !== "undefined" ? document.documentElement : null) {
  if (!root?.style) return;
  root.style.setProperty("--site-bg", `url("${siteSrc("./bg.png", { width: 2400 })}")`);
  root.style.setProperty("--site-configure-btn", `url("${siteSrc("./configure-btn.svg")}")`);
  root.style.setProperty("--site-selector-frame", `url("${siteSrc("./selector-frame.svg")}")`);
}

export function applySiteDomImages(doc = typeof document !== "undefined" ? document : null) {
  if (!doc) return;
  const roof = doc.getElementById("roofImg");
  if (roof) roof.src = siteSrc("./roof-china.png", { width: 1400 });
  doc.querySelectorAll(".shadow__layer").forEach((img) => {
    img.src = siteSrc("./shadow.svg");
  });
  const marina = doc.querySelector(".about__photo img");
  if (marina) marina.src = siteSrc("./marina.jpg", { width: 900 });
  const icon = doc.querySelector('link[rel="icon"]');
  if (icon) icon.href = siteSrc("./favicon.svg");
  const og = doc.querySelector('meta[property="og:image"]');
  if (og) og.setAttribute("content", siteSrc("./roof-china.png", { width: 1200 }));
}
