-- Chimes wiki — initial schema.
-- Seed essay bodies stay in src/guides.js. Neon stores overlays, community
-- pages, users, sessions, the review inbox, and audit.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('contributor', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  failed_login_count INTEGER NOT NULL DEFAULT 0 CHECK (failed_login_count >= 0),
  locked_until TIMESTAMPTZ,
  CHECK (email = lower(btrim(email))),
  CHECK (char_length(email) BETWEEN 3 AND 320),
  CHECK (char_length(display_name) BETWEEN 1 AND 80),
  CHECK (position('@' IN email) > 1)
);

CREATE UNIQUE INDEX users_email_uidx ON users (email);

CREATE TABLE sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip INET,
  CHECK (expires_at > created_at),
  CHECK (char_length(token_hash) = 64)
);

CREATE UNIQUE INDEX sessions_token_hash_uidx ON sessions (token_hash);
CREATE INDEX sessions_user_id_idx ON sessions (user_id);
CREATE INDEX sessions_active_expires_idx ON sessions (expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE articles (
  article_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('seed', 'community')),
  title TEXT NOT NULL,
  typology TEXT NOT NULL DEFAULT '',
  setting TEXT NOT NULL DEFAULT '',
  lead TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CHECK (char_length(slug) BETWEEN 1 AND 48),
  CHECK (char_length(title) BETWEEN 1 AND 120),
  CHECK (char_length(typology) <= 120),
  CHECK (char_length(setting) <= 160),
  CHECK (char_length(lead) <= 4000),
  CHECK (origin <> 'seed' OR status = 'published')
);

CREATE UNIQUE INDEX articles_slug_uidx ON articles (slug);
CREATE INDEX articles_published_idx ON articles (status, origin, published_at DESC);

CREATE TABLE sections (
  section_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES articles (article_id) ON DELETE CASCADE,
  heading TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  figure_side TEXT CHECK (figure_side IN ('left', 'right')),
  figure_src TEXT,
  figure_alt TEXT NOT NULL DEFAULT '',
  figure_caption TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (char_length(heading) BETWEEN 1 AND 120),
  CHECK (char_length(body) <= 20000),
  CHECK (char_length(figure_alt) <= 240),
  CHECK (char_length(figure_caption) <= 240),
  UNIQUE (article_id, sort_order)
);

CREATE INDEX sections_article_id_idx ON sections (article_id);

CREATE TABLE sources (
  source_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES articles (article_id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (char_length(title) <= 160),
  CHECK (url IS NULL OR url ~ '^https://'),
  CHECK (url IS NULL OR char_length(url) <= 400)
);

CREATE INDEX sources_article_id_idx ON sources (article_id);

CREATE TABLE pending (
  pending_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id UUID NOT NULL DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('improve', 'page', 'roof', 'ingest')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  target_slug TEXT,
  title TEXT NOT NULL DEFAULT '',
  typology TEXT NOT NULL DEFAULT '',
  setting TEXT NOT NULL DEFAULT '',
  lead TEXT NOT NULL DEFAULT '',
  section_heading TEXT NOT NULL DEFAULT '',
  section_body TEXT NOT NULL DEFAULT '',
  source_title TEXT NOT NULL DEFAULT '',
  source_url TEXT,
  display_name TEXT NOT NULL DEFAULT '',
  image_public_id TEXT,
  image_url TEXT,
  ingest_url TEXT,
  submitted_by BIGINT REFERENCES users (user_id) ON DELETE SET NULL,
  reviewed_by BIGINT REFERENCES users (user_id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip INET,
  user_agent TEXT,
  CHECK (target_slug IS NULL OR target_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CHECK (char_length(coalesce(target_slug, '')) <= 48),
  CHECK (char_length(title) <= 120),
  CHECK (char_length(typology) <= 120),
  CHECK (char_length(setting) <= 160),
  CHECK (char_length(lead) <= 1200),
  CHECK (char_length(section_heading) <= 120),
  CHECK (char_length(section_body) <= 4000),
  CHECK (char_length(source_title) <= 160),
  CHECK (source_url IS NULL OR source_url ~ '^https://'),
  CHECK (source_url IS NULL OR char_length(source_url) <= 400),
  CHECK (ingest_url IS NULL OR ingest_url ~ '^https://'),
  CHECK (char_length(display_name) <= 80),
  CHECK (
    reviewed_at IS NULL
    OR (status IN ('published', 'rejected') AND reviewed_by IS NOT NULL)
  )
);

CREATE UNIQUE INDEX pending_public_id_uidx ON pending (public_id);
CREATE INDEX pending_inbox_idx ON pending (status, created_at DESC);
CREATE INDEX pending_submitted_by_idx ON pending (submitted_by);

CREATE TABLE revisions (
  revision_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_id BIGINT REFERENCES articles (article_id) ON DELETE SET NULL,
  pending_id BIGINT REFERENCES pending (pending_id) ON DELETE SET NULL,
  actor_user_id BIGINT REFERENCES users (user_id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (
    action IN (
      'create',
      'append_section',
      'attach_figure',
      'publish',
      'reject'
    )
  ),
  summary TEXT NOT NULL DEFAULT '',
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(snapshot) = 'object'),
  CHECK (char_length(summary) <= 400)
);

CREATE INDEX revisions_article_id_idx ON revisions (article_id, created_at DESC);
CREATE INDEX revisions_pending_id_idx ON revisions (pending_id);

CREATE TABLE assets (
  asset_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id TEXT NOT NULL,
  url TEXT NOT NULL,
  folder TEXT NOT NULL CHECK (folder IN ('chimes/roofs', 'chimes/drafts')),
  content_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size > 0 AND byte_size <= 8388608),
  uploaded_by BIGINT REFERENCES users (user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (public_id ~ '^chimes/(roofs|drafts)/'),
  CHECK (url ~ '^https://res\\.cloudinary\\.com/'),
  CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp'))
);

CREATE UNIQUE INDEX assets_public_id_uidx ON assets (public_id);
CREATE INDEX assets_uploaded_by_idx ON assets (uploaded_by);

CREATE TABLE rate_buckets (
  bucket_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0 CHECK (hit_count >= 0),
  PRIMARY KEY (bucket_key, window_start)
);

CREATE TABLE audit_events (
  event_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor_user_id BIGINT REFERENCES users (user_id) ON DELETE SET NULL,
  ip INET,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(meta) = 'object'),
  CHECK (char_length(event_type) BETWEEN 1 AND 64)
);

CREATE INDEX audit_events_created_idx ON audit_events (created_at DESC);
CREATE INDEX audit_events_type_idx ON audit_events (event_type, created_at DESC);

-- Seed-origin rows may only gain sections. The application never DELETEs
-- sections during publish; this trigger blocks accidental wipes of a seed overlay.
CREATE OR REPLACE FUNCTION forbid_seed_article_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'seed overlay articles cannot be deleted';
END;
$$;

CREATE TRIGGER articles_no_delete_seed
  BEFORE DELETE ON articles
  FOR EACH ROW
  WHEN (OLD.origin = 'seed')
  EXECUTE FUNCTION forbid_seed_article_delete();
