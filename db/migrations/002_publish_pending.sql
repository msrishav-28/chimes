-- Atomic publish: append-only for seed overlays, never deletes sections.

CREATE OR REPLACE FUNCTION publish_pending(
  p_public_id uuid,
  p_actor bigint,
  p_is_seed boolean
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  p pending%ROWTYPE;
  a articles%ROWTYPE;
  new_slug text;
  heading text;
  body text;
  next_ord integer;
  action text;
  created_new boolean := false;
BEGIN
  SELECT * INTO p
  FROM pending
  WHERE public_id = p_public_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'pending_not_found';
  END IF;

  IF p.status <> 'pending' THEN
    RAISE EXCEPTION 'pending_not_open';
  END IF;

  new_slug := NULLIF(btrim(coalesce(p.target_slug, '')), '');
  IF new_slug IS NULL OR p.type IN ('page', 'ingest') THEN
    IF p.type IN ('page', 'ingest') THEN
      new_slug := trim(both '-' FROM regexp_replace(lower(coalesce(p.title, '')), '[^a-z0-9]+', '-', 'g'));
      new_slug := left(new_slug, 48);
    END IF;
  END IF;

  IF new_slug IS NULL OR new_slug = '' THEN
    RAISE EXCEPTION 'missing_slug';
  END IF;

  SELECT * INTO a
  FROM articles
  WHERE slug = new_slug
  FOR UPDATE;

  heading := NULLIF(btrim(p.section_heading), '');
  body := NULLIF(btrim(p.section_body), '');
  IF body IS NULL AND p.type = 'improve' THEN
    body := NULLIF(btrim(p.lead), '');
  END IF;
  IF heading IS NULL THEN
    heading := CASE p.type WHEN 'roof' THEN 'Roof' ELSE 'Note' END;
  END IF;

  IF a.article_id IS NULL THEN
    INSERT INTO articles (
      slug,
      origin,
      title,
      typology,
      setting,
      lead,
      status,
      published_at
    )
    VALUES (
      new_slug,
      CASE WHEN p_is_seed THEN 'seed' ELSE 'community' END,
      CASE
        WHEN p_is_seed THEN coalesce(NULLIF(btrim(p.title), ''), new_slug)
        ELSE coalesce(NULLIF(btrim(p.title), ''), new_slug)
      END,
      coalesce(p.typology, ''),
      coalesce(p.setting, ''),
      CASE WHEN p_is_seed THEN '' ELSE coalesce(p.lead, '') END,
      'published',
      now()
    )
    RETURNING * INTO a;
    created_new := true;
    action := 'create';
  ELSE
    -- Existing rows are append-only. Seed lead/title never change.
    IF a.origin = 'community' THEN
      UPDATE articles
      SET
        typology = CASE WHEN btrim(p.typology) = '' THEN typology ELSE p.typology END,
        setting = CASE WHEN btrim(p.setting) = '' THEN setting ELSE p.setting END,
        updated_at = now()
      WHERE article_id = a.article_id
      RETURNING * INTO a;
    ELSE
      UPDATE articles
      SET updated_at = now()
      WHERE article_id = a.article_id
      RETURNING * INTO a;
    END IF;
    action := CASE p.type
      WHEN 'roof' THEN 'attach_figure'
      ELSE 'append_section'
    END;
  END IF;

  IF body IS NOT NULL OR p.image_url IS NOT NULL OR p.type = 'roof' THEN
    SELECT coalesce(max(sort_order), -1) + 1
    INTO next_ord
    FROM sections
    WHERE article_id = a.article_id;

    INSERT INTO sections (
      article_id,
      heading,
      body,
      sort_order,
      figure_side,
      figure_src,
      figure_alt,
      figure_caption
    )
    VALUES (
      a.article_id,
      heading,
      coalesce(body, ''),
      next_ord,
      CASE WHEN p.image_url IS NOT NULL THEN 'left' ELSE NULL END,
      p.image_url,
      coalesce(NULLIF(btrim(p.title), ''), heading),
      coalesce(p.typology, '')
    );
  END IF;

  IF NULLIF(btrim(p.source_title), '') IS NOT NULL OR p.source_url IS NOT NULL THEN
    INSERT INTO sources (article_id, title, url)
    VALUES (a.article_id, coalesce(p.source_title, ''), p.source_url);
  END IF;

  UPDATE pending
  SET
    status = 'published',
    reviewed_by = p_actor,
    reviewed_at = now()
  WHERE pending_id = p.pending_id;

  INSERT INTO revisions (
    article_id,
    pending_id,
    actor_user_id,
    action,
    summary,
    snapshot
  )
  VALUES (
    a.article_id,
    p.pending_id,
    p_actor,
    action,
    left(coalesce(p.title, a.title, a.slug), 400),
    jsonb_build_object(
      'pendingId', p.public_id,
      'type', p.type,
      'slug', a.slug,
      'created', created_new
    )
  );

  INSERT INTO audit_events (event_type, actor_user_id, meta)
  VALUES (
    'publish',
    p_actor,
    jsonb_build_object('pendingId', p.public_id, 'slug', a.slug, 'type', p.type)
  );

  RETURN jsonb_build_object(
    'id', p.public_id,
    'status', 'published',
    'slug', a.slug,
    'articleId', a.article_id,
    'created', created_new
  );
END;
$$;
