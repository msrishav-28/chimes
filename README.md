# Chimes

A hanging-cloth doorway into countries — then a quiet architecture guide behind it.

Each destination is a roof, a cloth of language, and a short essay. You can ask the guide, improve a page, or propose a new one. Nothing from the open web, and nothing a visitor types, goes live until a person publishes it.

**Design and original experience** — [Marina Budarina](https://budarina.design).  
**Repo** — [github.com/msrishav-28/chimes](https://github.com/msrishav-28/chimes)

The living wiki is in this repository. It is not public until Neon, Cloudinary, and Vercel keys are filled and migrate has been run. The curtain and seed Guide can be previewed without that.

## The rooms

- **Home** — one country at a time. A cloth hangs under the roof. Play opens the physics. About is Marina's note.
- **Destinations** — the same roofs in a carousel. Motion is the original, not a coverflow rewrite.
- **Guide** — thirteen seed essays, plus community pages after an admin publishes them. Ask, Improve, Add a page, Add a roof, Account.
- **Contributions** — hang a country name on a cloth, or start a new page.
- **Inbox** (`#admin`) — drafts wait here. Seed paragraphs are never deleted by a publish.

Visual law: parchment, ink, PP Eiko, JetBrains Mono, wavy frames, roofs. Not Wikipedia chrome.

## What is locked

- Vanilla HTML, CSS, and ES modules. No React rewrite of the curtain.
- Seed essays stay in `src/guides.js`. The database may only append.
- Visitors may suggest. Contributors may upload images. Admins publish.
- Preview roles in the Account sheet are local costume, not security.
- Secrets never ship in the browser.
- Official pictures and future user pictures live on Cloudinary. Git keeps the original site files until the owner says otherwise.

## Stack

Vercel (static `src/` + `/api/*`) · Neon Postgres · Cloudinary · GitHub Actions.

Ask, today, is extractive search over the seed essays and published pages. A paid LLM is optional later, not a missing launch piece.

## Documentation

| Who | Read |
| --- | --- |
| Anyone | this file |
| Studio / product | [`plan.md`](./plan.md) |
| API contract | [`contracts/README.md`](./contracts/README.md) |
| Run it on a laptop | [`handbook/local.md`](./handbook/local.md) |
| Ship it | [`handbook/deploy.md`](./handbook/deploy.md) |
| Pictures | [`handbook/images.md`](./handbook/images.md) |
| Health and rollback | [`handbook/operations.md`](./handbook/operations.md) |

`docs/` in this repo is a static copy of the site, not the handbook.

## Credits

- **Design, roofs, cloth, chimes, About** — Marina Budarina. [budarina.design](https://budarina.design). All rights reserved for that work; see [LICENSE.txt](./LICENSE.txt).
- **Cloth physics foundation** — Verlet string simulation adapted from [Liam Egan on CodePen](https://codepen.io/shubniggurath/pen/ZYpjorm) (MIT).
- **Wiki expansion and repo** — [msrishav-28](https://github.com/msrishav-28).
