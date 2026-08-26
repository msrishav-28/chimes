/**
 * Cloudinary delivery: keep originals in the account, send a sized copy.
 * Local project paths are left unchanged until those assets are migrated.
 */

const CLOUDINARY_HOST = /res\.cloudinary\.com/i;

export function figureWidth() {
  if (typeof window === "undefined") return 1200;
  return window.matchMedia("(max-width: 720px)").matches ? 640 : 1200;
}

export function deliverySrc(url, width = figureWidth()) {
  const src = String(url || "");
  if (!src || src.startsWith("blob:") || src.startsWith("data:")) return src;
  if (!CLOUDINARY_HOST.test(src)) return src;
  if (/\/image\/upload\/.*\/v\d+\//.test(src) || /\/image\/upload\/w_/.test(src)) {
    return src;
  }
  const marker = "/image/upload/";
  const i = src.indexOf(marker);
  if (i === -1) return src;
  const transform = `w_${Math.round(width)},c_limit,f_auto,q_auto`;
  return `${src.slice(0, i + marker.length)}${transform}/${src.slice(i + marker.length)}`;
}
