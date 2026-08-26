import { query } from "./db.js";
import { asInet, HttpError } from "./http.js";
import { isSeedSlug, mergeSeedAndOverlay, slugify } from "../../src/wiki-merge.js";
import { allSeedArticles, seedArticle } from "./seed.js";

function mapSection(row) {
  const paragraphs = String(row.body || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    heading: row.heading,
    paragraphs,
    figure: row.figure_src
      ? {
          side: row.figure_side === "right" ? "right" : "left",
          src: row.figure_src,
          alt: row.figure_alt || "",
          caption: row.figure_caption || ""
        }
      : null
  };
}

function mapSource(row) {
  return {
    title: row.title || "",
    url: row.url || null
  };
}

export function mapPending(row) {
  return {
    id: row.public_id,
    type: row.type,
    status: row.status,
    targetSlug: row.target_slug,
    title: row.title,
    typology: row.typology,
    setting: row.setting,
    lead: row.lead,
    sectionHeading: row.section_heading,
    sectionBody: row.section_body,
    sourceTitle: row.source_title,
    sourceUrl: row.source_url,
    displayName: row.display_name,
    imagePublicId: row.image_public_id,
    imageUrl: row.image_url,
    createdAt: row.created_at
  };
}

async function loadDbArticle(slug) {
  const articles = await query`
    SELECT
      article_id,
      slug,
      origin,
      title,
      typology,
      setting,
      lead,
      status,
      published_at
    FROM articles
    WHERE slug = ${slug} AND status = 'published'
    LIMIT 1
  `;
  const article = articles[0];
  if (!article) return null;
  const [sections, sources] = await Promise.all([
    query`
      SELECT heading, body, sort_order, figure_side, figure_src, figure_alt, figure_caption
      FROM sections
      WHERE article_id = ${article.article_id}
      ORDER BY sort_order ASC
    `,
    query`
      SELECT title, url
      FROM sources
      WHERE article_id = ${article.article_id}
      ORDER BY source_id ASC
    `
  ]);
  return {
    articleId: article.article_id,
    slug: article.slug,
    origin: article.origin,
    name: article.title,
    title: article.title,
    typology: article.typology,
    setting: article.setting,
    lead: article.lead,
    status: article.status,
    publishedAt: article.published_at,
    sections: sections.map(mapSection),
    sources: sources.map(mapSource)
  };
}

export async function listPublishedArticles() {
  const seeds = await allSeedArticles();
  const community = await query`
    SELECT slug, title, typology, setting, lead, origin, published_at
    FROM articles
    WHERE status = 'published' AND origin = 'community'
    ORDER BY published_at DESC NULLS LAST, article_id DESC
    LIMIT 200
  `;
  const seedRows = seeds.map((s) => ({
    slug: s.slug,
    title: s.name,
    name: s.name,
    origin: "seed",
    typology: s.typology,
    setting: s.setting,
    lead: s.lead
  }));
  const extra = community.map((row) => ({
    slug: row.slug,
    title: row.title,
    name: row.title,
    origin: "community",
    typology: row.typology,
    setting: row.setting,
    lead: row.lead
  }));
  return { articles: seedRows.concat(extra) };
}

export async function getPublishedArticle(slug) {
  const clean = slugify(slug);
  if (!clean) return null;
  const seed = await seedArticle(clean);
  const overlay = await loadDbArticle(clean);
  if (seed) {
    const merged = mergeSeedAndOverlay(seed, overlay);
    return {
      slug: clean,
      name: seed.name,
      title: seed.name,
      origin: "seed",
      typology: merged.typology,
      setting: merged.setting,
      lead: merged.lead,
      sections: merged.sections,
      related: merged.related,
      sources: merged.sources
    };
  }
  if (overlay && overlay.origin === "community") {
    return overlay;
  }
  return null;
}

export async function publishedCorpus() {
  const seeds = await allSeedArticles();
  const overlays = await query`
    SELECT slug FROM articles WHERE status = 'published'
  `;
  const bySlug = new Map(seeds.map((s) => [s.slug, s]));
  for (const row of overlays) {
    const full = await getPublishedArticle(row.slug);
    if (full) bySlug.set(row.slug, full);
  }
  return [...bySlug.values()];
}

export async function insertPending(payload, { userId = null, ip = null, userAgent = null } = {}) {
  const rows = await query`
    INSERT INTO pending (
      type,
      target_slug,
      title,
      typology,
      setting,
      lead,
      section_heading,
      section_body,
      source_title,
      source_url,
      display_name,
      image_public_id,
      image_url,
      ingest_url,
      submitted_by,
      ip,
      user_agent
    )
    VALUES (
      ${payload.type},
      ${payload.targetSlug},
      ${payload.title},
      ${payload.typology},
      ${payload.setting},
      ${payload.lead},
      ${payload.sectionHeading},
      ${payload.sectionBody},
      ${payload.sourceTitle},
      ${payload.sourceUrl},
      ${payload.displayName},
      ${payload.imagePublicId || null},
      ${payload.imageUrl},
      ${payload.ingestUrl || null},
      ${userId},
      ${asInet(ip)},
      ${userAgent}
    )
    RETURNING
      public_id,
      type,
      status,
      target_slug,
      title,
      typology,
      setting,
      lead,
      section_heading,
      section_body,
      source_title,
      source_url,
      display_name,
      image_public_id,
      image_url,
      created_at
  `;
  return mapPending(rows[0]);
}

export async function listInbox({ limit = 80 } = {}) {
  const rows = await query`
    SELECT
      public_id,
      type,
      status,
      target_slug,
      title,
      typology,
      setting,
      lead,
      section_heading,
      section_body,
      source_title,
      source_url,
      display_name,
      image_public_id,
      image_url,
      created_at
    FROM pending
    ORDER BY
      CASE status WHEN 'pending' THEN 0 WHEN 'published' THEN 1 ELSE 2 END,
      created_at DESC
    LIMIT ${limit}
  `;
  return rows.map(mapPending);
}

export async function rejectPending(publicId, actorUserId) {
  const rows = await query`
    UPDATE pending
    SET
      status = 'rejected',
      reviewed_by = ${actorUserId},
      reviewed_at = now()
    WHERE public_id = ${publicId} AND status = 'pending'
    RETURNING public_id, status
  `;
  if (!rows[0]) {
    throw new HttpError(404, "not_found", "That draft is not waiting in the inbox.");
  }
  await query`
    INSERT INTO revisions (pending_id, actor_user_id, action, summary, snapshot)
    SELECT pending_id, ${actorUserId}, 'reject', left(coalesce(title, type), 400),
           jsonb_build_object('pendingId', public_id)
    FROM pending
    WHERE public_id = ${publicId}
  `;
  await query`
    INSERT INTO audit_events (event_type, actor_user_id, meta)
    VALUES ('reject', ${actorUserId}, jsonb_build_object('pendingId', ${publicId}::uuid))
  `;
  return { id: rows[0].public_id, status: "rejected" };
}

export async function publishPending(publicId, actorUserId) {
  const existing = await query`
    SELECT type, target_slug, title, status
    FROM pending
    WHERE public_id = ${publicId}
    LIMIT 1
  `;
  const row = existing[0];
  if (!row) throw new HttpError(404, "not_found", "That draft is not in the inbox.");
  if (row.status !== "pending") {
    throw new HttpError(409, "not_pending", "That draft was already reviewed.");
  }

  let slug = row.target_slug;
  if (row.type === "page" || row.type === "ingest" || !slug) {
    slug = slugify(row.title) || slug;
  }
  const seed = isSeedSlug(slug);

  try {
    const rows = await query`
      SELECT publish_pending(${publicId}::uuid, ${actorUserId}::bigint, ${seed}::boolean) AS result
    `;
    return rows[0]?.result || { id: publicId, status: "published", slug };
  } catch (err) {
    const msg = String(err?.message || "");
    if (msg.includes("pending_not_found")) {
      throw new HttpError(404, "not_found", "That draft is not in the inbox.");
    }
    if (msg.includes("pending_not_open")) {
      throw new HttpError(409, "not_pending", "That draft was already reviewed.");
    }
    if (msg.includes("missing_slug")) {
      throw new HttpError(400, "invalid_input", "That draft needs a title or target page.");
    }
    throw err;
  }
}

export async function recordAsset({ publicId, url, folder, contentType, byteSize, userId }) {
  await query`
    INSERT INTO assets (public_id, url, folder, content_type, byte_size, uploaded_by)
    VALUES (${publicId}, ${url}, ${folder}, ${contentType}, ${byteSize}, ${userId})
  `;
}

export async function recordAudit(eventType, { userId = null, ip = null, meta = {} } = {}) {
  await query`
    INSERT INTO audit_events (event_type, actor_user_id, ip, meta)
    VALUES (${eventType}, ${userId}, ${ip}, ${JSON.stringify(meta)}::jsonb)
  `.catch((err) => {
    console.error(JSON.stringify({ level: "error", event: "audit_failed", message: err?.message }));
  });
}
