import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SEED_SLUGS } from "../../src/wiki-merge.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const TITLES = {
  vietnam: "Vietnam",
  china: "China",
  japan: "Japan",
  kazakhstan: "Kazakhstan",
  russia: "Russia",
  france: "France",
  india: "India",
  uk: "UK",
  norway: "Norway",
  italy: "Italy",
  usa: "USA",
  brazil: "Brazil",
  iran: "Iran"
};

let guidesPromise;

async function loadGuides() {
  if (!guidesPromise) {
    guidesPromise = import(pathToFileURL(join(ROOT, "src", "guides.js")).href);
  }
  return guidesPromise;
}

export async function seedArticle(slug) {
  const { getGuide } = await loadGuides();
  if (!SEED_SLUGS.includes(slug)) return null;
  const guide = getGuide(slug);
  return {
    slug,
    name: TITLES[slug] || slug,
    origin: "seed",
    typology: guide.typology,
    setting: guide.setting,
    lead: guide.lead,
    sections: guide.sections || [],
    related: guide.related || [],
    sources: []
  };
}

export async function allSeedArticles() {
  const out = [];
  for (const slug of SEED_SLUGS) {
    out.push(await seedArticle(slug));
  }
  return out;
}

export function tokens(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((w) => w.length > 2);
}

export function scoreCorpus(question, articles, preferSlug) {
  const q = tokens(question);
  if (!q.length) return [];
  const scored = [];
  for (const article of articles) {
    const blob = [
      article.name,
      article.typology,
      article.setting,
      article.lead,
      ...(article.sections || []).flatMap((s) => [s.heading, ...(s.paragraphs || [])])
    ].join(" ");
    const hay = new Set(tokens(blob));
    let n = 0;
    for (const w of q) if (hay.has(w)) n += 1;
    if (article.slug === preferSlug) n += 2;
    if (n) scored.push({ article, n });
  }
  scored.sort((a, b) => b.n - a.n);
  return scored;
}

export function extractiveAnswer(question, articles, preferSlug) {
  const scored = scoreCorpus(question, articles, preferSlug);
  const top = scored.slice(0, 2);
  if (!top.length) {
    return {
      answer:
        "That is not in the published guide yet. Improve a page or add a page, and it can be reviewed into the wiki.",
      citations: []
    };
  }
  const lines = top.map((hit) => {
    const first = hit.article.sections?.[0]?.paragraphs?.[0] || hit.article.lead;
    return `${hit.article.name}. ${first}`;
  });
  return {
    answer: lines.join(" "),
    citations: top.map((hit) => ({ slug: hit.article.slug, title: hit.article.name }))
  };
}

export function seedFileExists() {
  readFileSync(join(ROOT, "src", "guides.js"), "utf8");
  return true;
}
