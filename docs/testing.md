# Tests and boundaries

## Compiler tests

`npm run test:unit` uses Node's built-in test runner. It compiles real edition fixtures and checks chapter/quotation counts, rewritten links, path and symlink confinement, duplicate IDs, missing or overlapping contents groups, exact quotations, source formatting, HTML sanitization, checksum drift and replacement of stale generated files.

Add a focused fixture when changing parsing or authoring rules. Prefer a failing input and its observable error over assertions about private helper structure. A quotation match does not establish scholarly accuracy.

## Browser tests

Build before running `npm test`; Playwright starts and stops the local preview automatically. Install the browser once with `npx playwright install chromium`. `PLAYWRIGHT_CHANNEL=chrome` can select an installed Chrome locally. CI uses Playwright's Chromium.

- `tests/framework.spec.ts`: manifest-driven cover, first chapter, notes, appearance, bookmark persistence, work navigation, source downloads, phone reflow and an automated accessibility scan. Works with either bundled edition.
- `tests/reader.spec.ts`: all 42 source texts and 156 quotations; passage saving and search; position restoration; keyboard dialogs; desktop/phone screenshots, theme, reduced motion, reflow, accessibility; Joyce italics and verse.
- `tests/refinement.spec.ts`: source-first behavior and saved IDs; chapter bookmarks; typography and paragraph retention; section-menu keyboard navigation; delayed-library loading regression.

`npm run test:starter` rebuilds the independent example and runs its generic check. Build the default edition again before deploying the default site. Do not run builds for different editions concurrently in one checkout: they share generated output paths.

Tests use fresh browser contexts. Screenshots and failure traces stay in ignored local directories. Automated accessibility checks cover detected rules, not every aspect of accessibility; manually review reading comfort, keyboard order and a phone-sized view when changing layout or motion.
