# Backend handshake

`/api/*` is implemented in this repo (Vercel + Neon). If the API is down, the UI still queues work in `localStorage` (`chimes-pending`) and answers Ask from seed essays.

See `plan.md` for product rules. Seed essays in `src/guides.js` are never deleted.

## Stack

- Neon Postgres (use the pooled connection string on Vercel)
- Cloudinary signed upload, folders `chimes/roofs` and `chimes/drafts`
- Resize on delivery: `w_{n},c_limit,f_auto,q_auto`
- HttpOnly `chimes_session` cookie
- Errors: `{ error: { code, message }, requestId }`
- Health: `{ ok, db, upload }`
- Secrets only on the server

## Routes

| Method | Path | Who | Body / notes |
| --- | --- | --- | --- |
| GET | `/api/health` | public | `{ ok, db, upload }`. `200` if Neon answers, `503` otherwise. No secrets. |
| GET | `/api/articles` | public | `{ articles: Article[] }` published only |
| GET | `/api/articles/:slug` | public | seed + overlay, or a community article. `404` if unpublished |
| POST | `/api/pending` | public | `{ type, targetSlug, title, typology, setting, lead, sectionHeading, sectionBody, sourceTitle, sourceUrl, displayName, imagePublicId }` |
| GET | `/api/pending` | admin session | inbox |
| POST | `/api/upload` | contributor/admin | multipart `file` → `{ publicId, url }` |
| POST | `/api/ask` | public | `{ question, slug }` → `{ answer, citations }` from published + seed only |
| POST | `/api/auth/login` | public | `{ email, password }` sets cookie |
| POST | `/api/auth/logout` | session | clears cookie |
| GET | `/api/auth/me` | public | `{ email, displayName, role }` (`visitor` if unsigned) |
| POST | `/api/publish` | admin | `{ pendingId }` append-only. Seed sections stay. |
| POST | `/api/reject` | admin | `{ pendingId }` |
| GET/POST | `/api/ingest` | `Authorization: Bearer $CRON_SECRET` | GET is the daily heartbeat. POST writes pending only. Never publishes. |

`type` is one of `improve` | `page` | `roof` | `ingest`.

Writes need `Origin` or `Referer` matching `CHIMES_ORIGIN` (or the current host). Missing origin on POST is `403`.

## Database rules

- Unique slugs. Seed overlay rows cannot be deleted.
- Publish is one Postgres function: lock the draft, append a section, never rewrite seed lead/title.
- For `type: page`, publish slugifies the **title**. The form may still send the current Guide slug as `targetSlug`.
- Source URLs must be `https://` and not private hosts.
- Uploads are JPEG/PNG/WebP, 6 MB, magic-byte checked.

## Frontend helpers

- `src/wiki-merge.js` — seed append rule, shared with the API
- `src/media.js` — `deliverySrc(url, width)`
- `src/wiki-api.js` — client + local fallback
- `src/wiki-ui.js` — sheets and admin list
