# Deploy

Call it a **private preview** of doors + seed Guide: yes, anytime (see [local.md](./local.md)).

Call it a **public living wiki**: no, until this list is green and `GET /api/health` returns `ok` on the production URL.

Do not tell users they can publish to the world while drafts only live in `localStorage`.

## Accounts

1. Create a Neon project. Copy the **pooled** connection string into `DATABASE_URL`.
2. Create a Cloudinary account. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
3. Import [github.com/msrishav-28/chimes](https://github.com/msrishav-28/chimes) into Vercel. Root directory is this folder (the one with `vercel.json`).

## Environment

Set these on Vercel for Production, and a **separate** set for Preview:

- `DATABASE_URL` — Neon pooled. Preview should use a Neon branch, not production.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (once), `ADMIN_DISPLAY_NAME`
- `CHIMES_ORIGIN` — public `https://` origin, no trailing slash. Comma-separate preview + prod if both must write.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `CRON_SECRET` — long random string. Do not share production's secret with Preview.

Optional later: `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `ASK_MODEL`. Extractive Ask works without them.

## First migrate

From a trusted machine, with production `DATABASE_URL` in `.env`:

```bash
npm run migrate
```

That creates tables and the first admin if the email does not exist. Then **unset `ADMIN_PASSWORD`** in Vercel unless you are rotating with `ADMIN_RESET_PASSWORD=true`.

## After deploy

1. `GET /api/health` should return `{ "ok": true, "db": "up" }`.
2. Sign in, open `#admin`, queue and publish a test draft.
3. Confirm Vercel cron logs show `Authorization: Bearer` on the daily `GET /api/ingest` heartbeat. That heartbeat does not fill the inbox. It only proves the secret.
4. Official pictures: `npm run upload-site-images` (see [images.md](./images.md)).

Rollback: [operations.md](./operations.md).
