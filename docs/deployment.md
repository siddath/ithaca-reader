# Deploying a reader

## Vercel

1. Create a repository from the GitHub template and import it as a Vercel project.
2. Keep the repository root as the project root. The checked-in configuration selects Vite, `npm run build` and `dist`.
3. For your own edition, add `READER_EDITION=editions/my-book/edition.json` to Production and Preview build environments. With no value, the Odyssey edition builds.
4. Deploy, then open `/`, `/about` and a `/read/chapter-id` URL directly. Check image credits, downloads and a saved quotation on a phone-sized viewport.

No application secrets are needed. Use your own Vercel account/project; this repository includes no account IDs or deployment credentials. GitHub CI does not deploy: Vercel's Git integration handles previews and production after you connect your repository. Set deployment access controls in your own Vercel project according to your needs.

## Other static hosts

Run `npm ci` and `npm run build`, then upload **only `dist/`**. Configure a fallback to `/index.html` for application routes. Serve `/assets/*`, `/content/*`, `/images/*`, `/licenses/*` and `/texts/*` as real files. Assets use root-relative URLs, so this template expects a domain root. GitHub Pages project-subdirectory hosting is unsupported; use a root/custom domain or another static host.

The Vercel file includes a same-origin Content Security Policy and basic security headers. Apply equivalent headers on another host. External links are ordinary navigation; the page does not need remote scripts, remote fonts or API calls.

## Validation and rollback

```sh
BASE_URL=https://your-edition.example READER_TEST_EDITION=starter npm test
```

For the default Homer/Joyce edition, omit `READER_TEST_EDITION` to run the full suite. The tests use a clean browser profile and may save temporary preferences on that profile only.

Retain the previous successful deployment in your hosting provider. Roll back to it if a new deployment breaks chapter URLs or source downloads. Reader storage lives in each browser, so changing domains or storage keys starts a separate reading shelf. Do not share one key between incompatible editions.
