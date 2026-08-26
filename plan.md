# Chimes living architecture wiki — master plan

Last updated: 2026-08-26 (ops studio Cloudinary media pass).

**Sync status:** product UI + Neon API + ops floor **are in the repo** (import fixes, `/api/health`, CI, HSTS/CSP, preview-role hide). The **living wiki is not public** until someone with the accounts fills Neon / Cloudinary / Vercel env, runs migrate, and deploys. Preview of the curtain + seed Guide can run without that.

Repo: [https://github.com/msrishav-28/chimes](https://github.com/msrishav-28/chimes)
Owner: [https://github.com/msrishav-28](https://github.com/msrishav-28)
Host: **Vercel** (`vercel.json` serves `src/` + `/api/*`)
Database: **Neon (Postgres)**
Images: **Cloudinary** (store originals, resize on delivery)
Frontend: vanilla HTML / CSS / ES modules. No React rewrite.

Visual law: parchment, ink, PP Eiko, JetBrains Mono, wavy frames, roofs. Not Wikipedia chrome.

If a later wish conflicts with this file, update this file first, then code.

Handshake for routes: `contracts/README.md`.

---

## How to read this file

- **DONE** — in the repo, reviewable.
- **OPS** — code exists; needs keys / Neon project / Vercel project.
- **TODO** — not built, still in scope.
- **DEFERRED** — discussed, parked on purpose. Do not start unless the owner asks.
- **Comment** — note for the team that owns the next step.

---

## 0. One-sentence product

A hanging-cloth doorway into countries, with a growing architecture-and-history wiki behind it, that people can contribute to, that an AI guide can answer from, and that can propose new material from the open web **as drafts only**.

**Comment (all teams):** live Ask is extractive over seed + published. That is enough for launch. A paid LLM is a later TODO, not a missing launch piece.

---

## 1. Locked decisions (do not reopen)

1. No full frontend rewrite. Curtain, Destinations, Play, chimes stay vanilla.
2. Plan A: curtain is the cover. Guide is the reading room. Destinations is a roof picker (motion unchanged). Contributions cloth stays and also leads to add-a-page.
3. Carousel focus / 3D coverflow is **dropped**.
4. Seed essays in `src/guides.js` stay. Neon overlays and extends. Seed sections are never deleted by a publish.
5. Wikipedia's job (public writing, history, growth), not its furniture.
6. Crawlers file **pending drafts** only. Humans publish.
7. **Neon**, not Firebase.
8. **Cloudinary** for official site pictures (`chimes/site`) and user roofs (`chimes/drafts`, `chimes/roofs`). Originals stored. Delivery resized (`w_*,c_limit,f_auto,q_auto`). Do not send 5MB originals to phones. Do not delete git originals until the owner says so.
9. Roles: visitor may suggest; contributor may upload; admin publishes. Preview roles in the Account sheet are **local only** and are not security.
10. Community articles appear in the **Guide index**, not in Destinations (Destinations needs roof art we have).
11. Secrets never in the browser.

---

## 2. Team board (who owns what now)

### Frontend studio — mostly DONE

- Home / Destinations / cloth / chimes / About still work.
- Guide essays (13 seed), left/right figures, `#guide/<slug>`.
- Toolbar: Ask, Improve, Add a page, Add a roof, Account.
- Search on the Guide index.
- Not-found page for unknown slugs (no longer falls back to China).
- Loading state while fetching a published page.
- Contribute forms + Cloudinary file input.
- Account: sign in/out against `/api/auth/*`, preview roles, **My drafts** (this-browser queue).
- Admin inbox `#admin` (live list needs a real admin session).
- `src/media.js` delivery helper.
- `src/wiki-api.js` talks to `/api/*`, falls back to `localStorage` (`chimes-pending`) if API is down.
- `src/wiki-merge.js` shared with the API (append-only seed rule).
- Pause Home cloth rAF when not on Home.
- Reduced motion on country slide / title blur.
- Skip link, meta description, `100dvh`, wrapping nav.
- Country-slide direction uses all 13 countries (was hardcoded to 3).
- Sources render in the Guide footer when the API returns them.

**Comment (frontend):** do not add a fifth mobile tab. Tools stay in Guide. Preview visitor / contributor / admin hide when `/api/auth/me` is reachable. Preview stays for local review only.
**Comment (frontend):** `src/`, `dist/`, and `docs/` drift. After editing `src/`, run `npm run sync-static` (or edit only `src/` and treat Vercel as source of truth). Favicon, OG tags, About focus trap, and Home arrow keys shipped 2026-08-26.

### Backend / data — DONE in repo, OPS to turn on

- Neon schema + migrations: `db/migrations/001_init.sql`, `002_publish_pending.sql`.
- `scripts/migrate.mjs`, `npm run migrate`.
- Vercel functions under `api/` (see section 5).
- HttpOnly `chimes_session` cookie, roles visitor / contributor / admin.
- Signed Cloudinary upload (`chimes/roofs` admin, `chimes/drafts` contributor).
- Extractive Ask over seed + published (no paid LLM required).
- Ingest route `/api/ingest`, drafts only, `CRON_SECRET`. Daily Vercel cron is a **heartbeat** unless a POST body lists Wikipedia URLs/titles.
- Rate limits, https source URLs, upload magic-byte + 6MB cap.
- Tests: `npm test`.

**Comment (backend):** first admin user is created on migrate from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Do not leave the example password in production. Preview-admin in the UI cannot call GET `/api/pending`.
**Comment (backend):** for `type: page`, publish slugifies the **title**. The form may still send the current Guide slug as `targetSlug`; the database prefers the title. Do not "fix" one side without the other.
**Comment (backend):** writes need a correct `CHIMES_ORIGIN` (no trailing slash) or they 403.
**Comment (ops):** 2026-08-26 landed the migrate `splitSqlStatements` import, the `asInet` import in `wiki.js`, and the Cloudinary `publicId` fallback. Tests now assert those imports stay.

### Ops — DONE in repo; live keys still block public wiki
- `/api/health`, pinned GitHub Actions CI, Dependabot, HSTS/CSP/COOP.
Still needs a human with the accounts:
- Create Neon project; set **pooled** `DATABASE_URL`.
- Copy `.env.example` to `.env` / Vercel env.
- Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CHIMES_ORIGIN` (no trailing slash).
- Set Cloudinary `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Set `CRON_SECRET` for ingest.
- Run `npm run migrate`.
- Deploy Vercel from this folder (rewrites already point `/` to `/src/index.html`).
- Confirm cron Authorization header uses `Bearer $CRON_SECRET`.

**Comment (ops):** Python `cd dist && python3 -m http.server` is frontend-only. Wiki API needs `npx vercel dev` or a Vercel deploy.
**Comment (ops):** the daily cron will not fill the inbox by itself. It only proves `CRON_SECRET`. A default Wikipedia list is not configured. Ops will not add a default crawl list unless the owner asks (auto-ingest of the open web is DEFERRED).
**Comment (ops):** 2026-08-26 shipped `/api/health`, pinned GitHub Actions CI, Dependabot, HSTS/CSP/COOP. Unset `ADMIN_PASSWORD` after first migrate. Do not share prod `DATABASE_URL` / `CRON_SECRET` with preview (use a Neon branch). Uptime alerting still needs the live URL. Error tracking stays a backend post-launch TODO.

---

## 3. Status by feature

### DONE — curtain / original experience

- Home hanging cloth, roofs, side countries, Play (Tweakpane), About, chimes.
- Destinations carousel (behaviour unchanged; no 3D focus).
- Contributions name-cloth + Write a page.

### DONE — Guide reading

- Seed dossiers in `src/guides.js` (do not delete).
- Overlay merge: seed body stays, Neon sections/sources append.
- `#guide` and `#guide/<slug>`.
- Search, not-found, loading.
- Hydrate on load: `/api/auth/me` + `/api/articles` + `/api/articles/:slug`.

### DONE — contribute / moderate UI

- Improve / Add page / Add roof sheets.
- Queue via POST `/api/pending` when API is up; else localStorage.
- New page slug comes from the **title** on publish (API slugifies). Form `targetSlug` may still be the page you were reading.
- Roof upload POST `/api/upload` (contributor/admin). Visitors get a clear error.
- Admin publish/reject. Publish refreshes the article list.
- Account drafts list = local queue only.

### DONE — Ask (extractive)

- Sheet UI.
- POST `/api/ask` when API is up (seed + published only).
- Local keyword stub over `guides.js` if API is down.

**Comment:** this is the live "AI guide." Do not treat a missing LLM key as a launch blocker.

### OPS — living wiki go-live

- Env + migrate + Vercel (accounts / keys). Repo-side ops floor is done.
- Without the live keys, Improve/Ask/Admin look wired but cannot persist.

### TODO — still in scope, not built

Frontend (small):

- Suggest-a-URL form on Contribute (ingest today is cron/admin only).

Backend:

- Public signup (only seeded admin exists).
- Admin invite / create-contributor (today only the migrate admin can sign in).
- GET contributor my-drafts from Neon (Account drafts are localStorage).
- Revision history API + diff UI.
- Optional paid LLM for Ask (`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` already named in `.env.example`).
- Error tracking (Sentry or equivalent). Not a launch blocker.

Media:

- Official site catalog and `npm run upload-site-images` shipped 2026-08-26. Git originals stay. Live upload still needs Cloudinary keys in `.env`.

### DEFERRED — parked on purpose

- React / Next rewrite of the curtain.
- Carousel focus takes the stage / coverflow.
- Wikipedia infobox / left TOC / white-black skin.
- Fifth mobile nav tab.
- Restoring Home aside poem under 960px (hides so the roof still fits).
- Auto-publish crawlers (illegal/spam risk). Open-web scrape. Paywalled fetch.
- Community pages inside Destinations.
- Compressing `bg.png` in place in this repo.
- Talk pages, 20 user groups, IP patrol.

---

## 4. Information architecture (shipped)

- Home `#home` — curtain, Play, About, Read — DONE
- Destinations `#destinations` — roof carousel — DONE
- Guide `#guide`, `#guide/<slug>` — essay + tools + search — DONE
- Contributions `#contributions` — name cloth + write a page — DONE
- Admin `#admin` — inbox — DONE UI; live data needs admin session

Nav: Home · Destinations · Guide · Contributions. Admin is not in the main nav.

---

## 5. Neon model (backend DONE)

Migrations in `db/migrations/`. Spirit: articles, sections, sources, revisions, pending, users, sessions, assets, audit.

**Comment:** publish is one Postgres path: lock draft, append section, never rewrite seed lead/title.

---

## 6. Vercel / local

**DONE in repo:** `vercel.json`, `package.json`, `.env.example`, `/api/health`, `.github/workflows/ci.yml`.

Local wiki:

```
copy .env.example .env
npm install
npm test
npm run migrate
npx vercel dev
```

Frontend-only (no API):

```
cd dist && python3 -m http.server 8765
```

`npm run sync-static` copies selected `src/` files to `dist/` and `docs/`.

**Comment (ops):** `docs/` is still a site clone for now. Retiring it as GitHub Pages is optional later. Developer how-to lives in `handbook/`, not in `docs/`. Root `README.md` is the product brief.

---

## 7. Credits

- Design, roofs, cloth, chimes, About: Marina Budarina. Physics: Liam Egan (MIT).
- Wiki expansion and repo: msrishav-28.
- Do not strip About or marina.jpg unless the owner asks.

---

## 8. Launch gate

Call it a **private preview** of doors + seed Guide: yes, anytime.

Call it a **public living wiki**: no, until the live-keys checklist in section 2 is green (`/api/health` returns `ok` on the production URL).

Do not tell users they can publish to the world while drafts only live in `localStorage`.

---

## 9. Next actions (pick a lane)

1. **Live keys:** Neon + Cloudinary + Vercel env, migrate, production URL, then unset `ADMIN_PASSWORD`.
2. **Frontend (optional):** Suggest-a-URL sheet.
3. **Backend (after go-live):** invite/create contributor, signup, Neon my-drafts, history API, optional LLM Ask, error tracking.
4. **Media:** Cloudinary copies of existing roofs; keep git originals.

Default if the owner says just launch the wiki: do (1) first. Do not start (4) by deleting PNGs.
