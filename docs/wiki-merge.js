/** Shared by the Guide UI and the Vercel API. Seed bodies stay in guides.js. */

export const SEED_SLUGS = Object.freeze([
  "vietnam",
  "china",
  "japan",
  "kazakhstan",
  "russia",
  "france",
  "india",
  "uk",
  "norway",
  "italy",
  "usa",
  "brazil",
  "iran"
]);

export const SEED_SLUG_SET = new Set(SEED_SLUGS);

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function isSeedSlug(slug) {
  return SEED_SLUG_SET.has(String(slug || ""));
}

/**
 * Seed essays are never replaced. Neon may only append sections/sources.
 */
export function mergeSeedAndOverlay(seed, overlay) {
  const base = seed
    ? {
        typology: seed.typology || "",
        setting: seed.setting || "",
        lead: seed.lead || "",
        sections: Array.isArray(seed.sections) ? seed.sections.slice() : [],
        related: Array.isArray(seed.related) ? seed.related.slice() : [],
        sources: Array.isArray(seed.sources) ? seed.sources.slice() : []
      }
    : {
        typology: "",
        setting: "",
        lead: "",
        sections: [],
        related: [],
        sources: []
      };

  if (!overlay) return base;

  const extraSections = Array.isArray(overlay.sections) ? overlay.sections : [];
  const extraSources = Array.isArray(overlay.sources) ? overlay.sources : [];

  return {
    ...base,
    sections: base.sections.concat(extraSections),
    sources: base.sources.concat(extraSources)
  };
}

export function sectionFromPending(row) {
  const heading = String(row.sectionHeading || row.section_heading || "").trim();
  const body = String(row.sectionBody || row.section_body || "").trim();
  const lead = String(row.lead || "").trim();
  const imageUrl = row.imageUrl || row.image_url || "";
  const paragraphs = [];
  if (lead && row.type !== "improve") paragraphs.push(lead);
  if (body) paragraphs.push(body);
  if (!paragraphs.length && imageUrl) paragraphs.push("A roof image queued for this page.");
  if (!heading && !paragraphs.length && !imageUrl) return null;
  return {
    heading: heading || (row.type === "roof" ? "Roof" : "Note"),
    paragraphs,
    figure: imageUrl
      ? {
          side: "left",
          src: imageUrl,
          alt: String(row.title || heading || "Roof"),
          caption: String(row.typology || "")
        }
      : null
  };
}
