# Operations

## Health

`GET /api/health` — public, no secrets.

- `200` `{ ok: true, db: "up", upload: "configured"|"unconfigured" }`
- `503` if `DATABASE_URL` is missing or Neon does not answer

Point an uptime checker (Better Stack, Checkly, or Vercel Monitoring) at that URL after the first production deploy.

## Rollback

- **Bad deploy:** Vercel dashboard, Instant Rollback to the previous deployment.
- **Bad data:** Neon point-in-time recovery on the branch. Do not replay `npm run migrate` as a restore.
- **Bad community page:** leave it unpublished, or stop linking it. Seed copy in `src/guides.js` is never deleted by publish.

## Secrets

| Name | Where | Note |
| --- | --- | --- |
| `DATABASE_URL` | Vercel + local `.env` | Pooled. Preview uses a Neon branch. |
| `ADMIN_PASSWORD` | Vercel once | Unset after first migrate. |
| `CRON_SECRET` | Vercel | Daily ingest heartbeat. Separate for Preview. |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Vercel + local `.env` | Never in the browser. |
| `CLOUDINARY_CLOUD_NAME` | Vercel + `src/site-cloud.js` | Public. |

`.env` is gitignored. `.env.example` is the checklist.

## CI

`.github/workflows/ci.yml` runs `npm ci` and `npm test` on `main` and pull requests. Actions are SHA-pinned. Dependabot watches npm and GitHub Actions weekly.

## Cron

Vercel hits `GET /api/ingest` daily at 06:00 UTC with `Authorization: Bearer $CRON_SECRET`. That is a heartbeat. `POST` with Wikipedia URLs or titles files drafts only. Humans still publish. There is no default crawl list.
