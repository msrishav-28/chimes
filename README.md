# Chimes

Hanging-cloth doorway into countries, plus a growing architecture guide.

Repo: [github.com/msrishav-28/chimes](https://github.com/msrishav-28/chimes)

The curtain, roofs, Destinations, Play, and chimes are Marina Budarina's original experience. The Guide wiki (Ask, Improve, Add, Account, Admin inbox) is the living-wiki layer. Seed essays stay in `src/guides.js` even if Neon is offline.

## Stack (locked)

- Frontend: vanilla HTML / CSS / ES modules (no React rewrite)
- Host: Vercel (`/api/*` Node functions in `api/`, static from `src/`)
- Database: Neon Postgres (migrations in `db/migrations/`)
- Images: Cloudinary, originals stored, resized on delivery, signed upload via `/api/upload`
- Auth: email/password, HttpOnly `chimes_session` cookie, roles `visitor` / `contributor` / `admin`
- Ask: extractive search over seed + published (LLM key optional later)
- Ingest: Wikipedia allowlist, drafts only, `CRON_SECRET` required
- CI: GitHub Actions runs `npm test` on `main` and pull requests

## Run locally (frontend only)

```bash
cd dist && python3 -m http.server 8765
```

Open [http://127.0.0.1:8765/](http://127.0.0.1:8765/). Guide is `#guide`. This path has no API.

## Run the wiki locally

```bash
copy .env.example .env
# fill DATABASE_URL (Neon pooled), ADMIN_EMAIL, ADMIN_PASSWORD, CHIMES_ORIGIN
npm install
npm test
npm run migrate
npx vercel dev
```

`CHIMES_ORIGIN` must be `http://127.0.0.1:3000` locally (no trailing slash) or writes return 403.

Inbox is `#admin` after a real admin sign-in. Preview roles are local-only and cannot publish on the live API. They hide themselves once `/api/auth/me` is reachable.

## Production go-live

1. Create a Neon project. Copy the **pooled** connection string into `DATABASE_URL`.
2. Create a Cloudinary account. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
3. Import this repo into Vercel. Root directory is this folder (the one with `vercel.json`).
4. Set Vercel env for Production (and Preview separately): the Cloudinary keys, `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (once), `ADMIN_DISPLAY_NAME`, `CHIMES_ORIGIN` (the public `https://` origin, no trailing slash), and a long random `CRON_SECRET`.
5. Do not point Preview at the production database or production `CRON_SECRET`. Use a Neon branch for Preview.
6. From a trusted machine: `npm run migrate` against production `DATABASE_URL`. That creates tables and the first admin.
7. Remove `ADMIN_PASSWORD` from Vercel after the first successful migrate, unless you are intentionally rotating with `ADMIN_RESET_PASSWORD=true`.
8. Deploy. Confirm `GET /api/health` returns `{ "ok": true, "db": "up" }`.
9. Sign in, open `#admin`, and publish a test draft. Confirm cron logs show `Authorization: Bearer` on the daily `GET /api/ingest` heartbeat.

Vercel Instant Rollback is the deploy rollback. Neon point-in-time recovery is the data rollback.

## Health and rollback

- Public probe: `GET /api/health` — `200` when Neon answers, `503` if the database is missing or down. No secrets in the body.
- If a deploy is bad: Vercel dashboard, Instant Rollback to the previous deployment.
- If data is bad: restore the Neon branch from PITR; do not replay migrate as a restore.
- Seed essays are never deleted by publish. A bad community page can be left unpublished; seed copy in `src/guides.js` stays.

## Tests and static copies

```bash
npm test
npm run sync-static
```

`sync-static` copies selected `src/` files into `dist/` and `docs/` so GitHub Pages / the old static preview stay close. Vercel serves `src/`. After editing those files, run the sync.

Handshake: [`contracts/README.md`](./contracts/README.md). Team board: [`plan.md`](./plan.md).

If the API is down, Improve/Add still queue in this browser (`localStorage`) and Ask answers from the seed essays. Do not tell the public that those local drafts are live.

## Credits

- **Design and original product** — Marina Budarina. Site: [budarina.design](https://budarina.design). Instagram / X / LinkedIn as on the About panel. All rights reserved for that work; see [LICENSE.txt](./LICENSE.txt).
- **Cloth physics foundation** — Verlet string simulation adapted from [Liam Egan on CodePen](https://codepen.io/shubniggurath/pen/ZYpjorm) (MIT).
- **Wiki expansion** — [msrishav-28](https://github.com/msrishav-28).
