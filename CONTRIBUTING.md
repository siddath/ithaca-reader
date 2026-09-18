# Contributing

For an independent book edition, use the repository template. For improvements to the shared reader or corrections to the included edition, open an issue or a pull request.

## Local checks

Use Node 24 and `npm ci`. Run `npm run test:unit`, `npm run build`, then `npm test` after installing Chromium with `npx playwright install chromium`. Run `npm run test:starter` when changing compilation, routing or shared UI. CI checks both the full Odyssey edition and the independent starter.

Keep authored content under `editions/`; generated JSON and build outputs are ignored. Do not commit `.env`, `.vercel`, browser state, deployment credentials or personal research files. Use your own edition directory and browser storage key for new books.

For reader changes, test observable behavior: open a chapter directly, switch sections, save a quote, change typography, use the keyboard, and check phone reflow. Preserve reduced-motion support and source formatting. Avoid changing existing chapter, section or quote IDs without explaining how saved links are affected.

## Editorial corrections

Name the work, chapter, quoted text or claim, source edition, and a passage or scholarly reference supporting the correction. Distinguish narrative fact from interpretation. A passing quotation check proves a substring match, not a philosophical or historical claim.

Keep interpretations provisional where the source permits alternatives. Do not replace licensed source text with another translation without updating provenance and terms. Add artwork credits and license information alongside the edition.

## Pull requests

Explain the problem, resulting behavior and validation performed. Screenshots help for visual changes. State any checks that could not run. Contributions use the repository's MIT code terms and CC BY 4.0 original-content terms as applicable; third-party material must retain its own notices.
