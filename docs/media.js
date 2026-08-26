/**
 * Cloudinary delivery: keep originals in the account, send a sized copy.
 * Official site paths go through siteSrc() (local until upload-site-images).
 */

import { siteSrc } from "./cloudinary-site.js";

const CLOUDINARY_HOST = /res\.cloudinary\.com/i;

function siteFallback(src, width) {
  return siteSrc(src, { width });
}

export function figureWidth() {
  if (typeof window === "undefined") return 1200;
  return window.matchMedia("(max-width: 720px)").matches ? 640 : 1200;
}

export function deliverySrc(url, width = figureWidth()) {
  const src = String(url || "");
  if (!src || src.startsWith("blob:") || src.startsWith("data:")) return src;
  if (!CLOUDINARY_HOST.test(src)) {
    if (src.startsWith("./") || /^[\w.-]+\.(png|jpe?g|webp|svg)$/i.test(src)) {
      return siteFallback(src, width);
    }
    return src;
  }
  if (/\/image\/upload\/.*\/v\d+\//.test(src) || /\/image\/upload\/w_/.test(src)) {
    return src;
  }
  const marker = "/image/upload/";
  const i = src.indexOf(marker);
  if (i === -1) return src;
  const transform = `w_${Math.round(width)},c_limit,f_auto,q_auto`;
  return `${src.slice(0, i + marker.length)}${transform}/${src.slice(i + marker.length)}`;
}
