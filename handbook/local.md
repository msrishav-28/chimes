# Local development

Root of the repo is the folder that contains `vercel.json`.

## Frontend only (no API)

```bash
cd dist
python3 -m http.server 8765
```

Open [http://127.0.0.1:8765/](http://127.0.0.1:8765/). Guide is `#guide`. Improve/Add queue in `localStorage`. Ask uses the seed essays.

Vercel itself serves `src/`. After you edit files listed in `scripts/sync-static.mjs`, run `npm run sync-static` so `dist/` and `docs/` stay close.

## Wiki (Neon + API)

```bash
copy .env.example .env
```

Fill at least `DATABASE_URL` (Neon pooled), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `CHIMES_ORIGIN=http://127.0.0.1:3000` with no trailing slash. Writes return 403 if the origin is wrong.

```bash
npm install
npm test
npm run migrate
npx vercel dev
```

Inbox is `#admin` after a real admin sign-in. Preview roles cannot publish on the live API. They hide once `/api/auth/me` is reachable.

## Scripts

| Command | What it does |
| --- | --- |
| `npm test` | Node test runner (`tests/*.test.js`) |
| `npm run migrate` | Apply `db/migrations/` and seed the first admin |
| `npm run sync-static` | Copy selected `src/` files to `dist/` and `docs/` |
| `npm run upload-site-images` | Push official pictures to Cloudinary (`chimes/site`) |
| `npx vercel dev` | Local site + `/api/*` |

## Layout

- `src/` — the site Vercel serves
- `api/` — Vercel Node functions
- `db/migrations/` — Neon schema
- `dist/` / `docs/` — static clones. `docs/` is the old GitHub Pages snapshot. Pictures stay.
- `handbook/` — these notes
- `src/01-figma.html` and `src/02-strings.html` — old studio stages. Not the live site. Leave them.
