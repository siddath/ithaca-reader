# Ithaca Reader

[![Reader checks](https://github.com/siddath/ithaca-reader/actions/workflows/ci.yml/badge.svg)](https://github.com/siddath/ithaca-reader/actions/workflows/ci.yml)

A quiet, open-source reading edition for novels and epics. Read the original text first, then move through separate sections for story, quotations, close reading, context and questions.

[Read the Odyssey edition](https://ithaca-odyssey.vercel.app) · [Make an edition](docs/authoring.md) · [Deploy](docs/deployment.md)

The included edition has all 24 books of Homer's *Odyssey* in Samuel Butler's translation, all 18 episodes of James Joyce's *Ulysses*, 42 chapter commentaries, five reading companions and 156 source-checked quotations. A small original story demonstrates how to replace this collection without changing React code.

## Start locally

Use Node 24 LTS (see `.nvmrc`; minimum Node 22.12) and npm.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. No account, database, API key or AI service is required. This is a public source template, not an npm library; `private: true` in `package.json` prevents accidental npm publication. Content is compiled from the edition files before development and production builds.

```sh
npm run build
npm run preview
```

The generated `dist/` directory is the deployable site. Keep a fallback to `index.html` for `/read/*` and `/about` routes; [Vercel configuration](vercel.json) is included.

## Make it yours

Click **Use this template** on GitHub to create an independent repository, then:

```sh
npm ci
npm run new:edition -- my-book
READER_EDITION=editions/my-book/edition.json npm run dev
```

On PowerShell, set `$env:READER_EDITION="editions/my-book/edition.json"` before running npm. On Windows Command Prompt, use `set READER_EDITION=editions/my-book/edition.json`.

Edit the generated edition's JSON manifest, `.txt` source files and `.md` reading notes. The manifest supplies branding, works, chapter order, Roman or Arabic numbering, navigation, image credits, downloads and an independent browser-storage namespace. The starter includes two chapters with different section names; no Homer-specific content is required by the reader.

To publish your edition, set `READER_EDITION` to its manifest path in your hosting project's build environment. Read the [authoring guide](docs/authoring.md) for source formatting, exact quotation checks, stable links, licensing and limitations.

## What readers get

- Original text and separate commentary sections, with direct links to each.
- Chapter bookmarks, saved quotations and a remembered reading position.
- Literata, Georgia and Manrope reading options, four sizes, day and night themes.
- Commentary search and a global Texts menu.
- Keyboard navigation, visible focus, reduced-motion support and responsive layouts.
- Local-only preferences: no reader account, analytics script or cross-device sync.

## Project layout

```text
editions/odyssey/     Complete Homer/Joyce texts, notes and source records
editions/starter/     Small original example you can copy
src/                 Shared React reader and styles
scripts/             Content compiler, validation and scaffolding
public/images/       Credited edition artwork
public/licenses/     Font notices
tests/              Browser behavior and accessibility checks
test/unit/          Content compiler checks
```

`public/content/`, `public/texts/` and `src/generated/` are build outputs. **Do not author files there:** the compiler replaces them for the selected edition. Edit inputs under `editions/` instead. Restart `npm run dev` after editing edition content.

## Check a change

```sh
npm run validate:content
npm run test:unit
npm run build
npx playwright install chromium
npm test
npm run test:starter
```

The main browser suite checks the complete default edition and reader behavior. `test:starter` rebuilds and tests the independent starter, so run `npm run build` afterward to return to the Odyssey output. CI runs both editions. For an existing deployment: `BASE_URL=https://your-site.example npm test`. See [contributing](CONTRIBUTING.md).

## Reuse and attribution

The reader code is [MIT licensed](LICENSE). Original commentary and the starter story have [CC BY 4.0 content terms](CONTENT_LICENSE.md), to the extent copyright exists. **Primary texts, images and fonts have their own terms** in [third-party notices](THIRD_PARTY_NOTICES.md). Complete Project Gutenberg downloads retain their original notices. Check the rights to any text, translation and image you add, including where you publish it.

The reading notes are AI-assisted interpretations, not a scholarly critical edition. The build verifies quotation wording against the supplied English text; it cannot establish the truth of an interpretation. Corrections with passage references are welcome.
