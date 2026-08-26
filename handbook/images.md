# Images

Two kinds of picture. They never share a Cloudinary folder.

| Kind | Folder | How it gets there |
| --- | --- | --- |
| Official site (roofs, selectors, `bg.png`, About photo, shadows, favicon) | `chimes/site` | `npm run upload-site-images` |
| Future user images | `chimes/drafts` (contributor) or `chimes/roofs` (admin) | `POST /api/upload` |

Git originals stay in `src/`. Do not delete them until the owner says so. `docs/` and `dist/` may still hold copies for the static preview.

## Official site upload

`.env` needs `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Those last two stay on the server.

```bash
npm run upload-site-images
```

The script signs each file, writes it to `chimes/site/<stem>`, then writes the **public** cloud name into `src/site-cloud.js`. That file is not a secret. Until the command has been run, `SITE_CLOUD_NAME` is empty and the site serves local `./` paths.

Phones get a resized copy (`w_*,c_limit,f_auto,q_auto`). SVGs are delivered untransformed.

Catalog: `src/cloudinary-site.js` (`SITE_FILES`). Add a new official file there, put the original in `src/`, rerun the upload.

## Future user images

Visitors may queue text. They cannot upload. Contributors and admins post a JPEG, PNG, or WebP (magic-byte checked, 6 MB cap) to `/api/upload`. The API signs the upload. Secrets never reach the browser.

If the API is down, the UI may keep a local blob preview. That is not live, and it is not Cloudinary.

## Delivery in the app

- `siteSrc()` — official files
- `deliverySrc()` — Cloudinary URLs already returned by the API (user roofs, published figures)

CSS backgrounds (`bg.png`, Play button, selector frame) use `--site-*` custom properties, with a local `url()` fallback.
