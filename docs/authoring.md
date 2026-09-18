# Authoring an edition

An edition is a directory containing `edition.json`, source texts, reading notes and an About page. One edition is selected at build time; it may contain multiple works and companions. It is not a multi-tenant publishing service.

## 1. Copy a working example

```sh
npm run new:edition -- my-book
```

The command copies `editions/starter`, chooses a new site name and storage key, and refuses to overwrite an existing directory. Replace the example content before publishing. You can also copy the directory yourself.

## 2. Define the book

This is a minimal manifest:

```json
{
  "version": 1,
  "site": {
    "name": "My Reading Edition",
    "title": "My Reading Edition",
    "description": "A novel with a close-reading companion.",
    "storageKey": "my-reading-edition-v1",
    "lang": "en"
  },
  "cover": {"title": "My Novel", "author": "The author", "start": "chapter-1"},
  "works": [{"id": "novel", "title": "My Novel", "unit": "Chapter", "numbering": "arabic"}],
  "chapters": [{"id": "chapter-1", "work": "novel", "number": 1, "notes": "chapter-1.md", "text": "chapter-1.txt"}],
  "about": "about.md"
}
```

Paths are relative to the manifest's directory and must remain inside it, including symlink targets. Work and chapter IDs use lowercase letters, digits and hyphens. Chapter IDs must be unique; `library`, `quotes` and `edition` are reserved output names. Numbers are positive integers, unique within each work. Chapters appear in manifest order.

Use `numbering: "roman"`, `"arabic"` or `"none"`. A notes-only companion omits `text`; it opens directly in the notes. It still requires at least one `##` section. `numbering: "none"` displays a book icon in the contents and the work's `unit` as its reading label.

Keep IDs and `site.storageKey` stable once readers have saved their place. A new independent edition should have its own storage key. The Odyssey edition retains the existing `ithaca-reading-v1` key.

### Optional display fields

| Field | Purpose |
| --- | --- |
| `site.wordmark`, `site.footer` | Header wordmark and footer sentence |
| `site.searchPlaceholder`, `site.typePreview` | Search hint and appearance sample |
| `site.lang`, `site.direction` | HTML language and text direction; interface labels remain English |
| `cover.prefix`, `description`, `caption`, `editionLine` | Cover typography and edition description |
| `cover.image` | Local image object: `src`, `alt`, `width`, `height` |
| `navLink` | Optional main navigation link: `href`, `label` |
| `works[].author`, `description`, `sourceLabel`, `sourceNote` | Attribution, contents introduction and source notice |
| `works[].plural` | Override the unit's simple plural in the chapter rail |
| `works[].groups` | Contents groups with `title`, `start` and `end`, covering each numbered chapter exactly once |
| `works[].endLink` | Final chapter destination with `href`, `label` |
| `sectionLabels` | Map full note headings to shorter menu labels |
| `frontispiece` | Optional image, caption, title, description, href and linkLabel |
| `downloads` | Array of `{file, filename, label}`; generated under `/texts/` |

Place artwork in `public/images/`, reference it as `/images/name.jpg`, and add provenance and terms to both the edition's About page and `THIRD_PARTY_NOTICES.md`. Remove unused default artwork if you do not want to distribute it. The supplied Content Security Policy expects images and fonts on the same origin.

## 3. Add the original text

Use UTF-8 `.txt` files with blank lines between paragraphs. The compiler joins line wraps within prose paragraphs, preserves blocks whose every line is indented by at least two spaces as verse, and renders `_underscores_` as emphasis. Source HTML is escaped.

The full input is preserved in the generated `source.text` field. If a file begins with a chapter heading that should not appear in the reading body, opt into `stripFirstLine: true`. This removes the first line and following whitespace. Do not enable it for a file whose first line is part of the narrative.

For manuscripts that use underscores literally or complex verse indentation, adapt the formatter and add an appropriate source-fidelity test before publication. This is a plain-text and Markdown reader, not an EPUB, PDF or TEI importer.

## 4. Write the reading notes

```markdown
# An unexpected visitor

Edition/source information goes here, before the first section.

## Story {#story}

[T] What the narrator actually tells us.

## Quotations {#quotations}

> An exact sentence from the chapter's source file.

[I] An interpretation supported by the passage.

## Questions {#questions}

- What changes when we read this from another character's perspective?
```

The `#` heading is the chapter's title; a manifest `title` can override it. Each `##` heading creates a separate reading section. Optional `{#stable-id}` keeps the URL stable when you revise the heading. Without it the compiler generates an indexed slug. IDs should use lowercase letters, digits and hyphens.

Blockquotes become savable passages. When the chapter has a source text, every blockquote must match a contiguous substring of that text after whitespace normalization and removing source underscore emphasis markers. Punctuation and spelling must match. Do not add ellipses or editorial brackets unless they are in the source. Use ordinary paragraphs for paraphrases. For a clearly documented exceptional chapter, `verifyQuotes: false` disables this check; it does not prove quotation accuracy. Notes-only companions have no source to verify against.

Quote IDs are chapter ID plus blockquote order (`chapter-1-q1`). Reordering quotations can change what an existing bookmark points to, so append new quotes or version the storage key when making incompatible editorial changes.

Optional evidence labels render as small inline markers: `[T]` text, `[C]` context, `[I]` interpretation, `[A]` another reading, `[M]` comparison and `[U]` open question. The starter demonstrates these distinctions; you need not use every category.

Relative links to another chapter's Markdown file resolve to its reader route. Relative links to declared downloads resolve to `/texts/…`. Other unresolved local file links lead to `/about`; validate your links in the browser. Use `/read/chapter-id#section-id` for precise links and `https://…` for scholarship. HTML is sanitized; scripts and event handlers are not allowed.

## 5. Credit the edition

`about.md` uses the same heading convention. Include source edition, translator, provenance, image/font credits, content terms and the limits of your commentary. Use `{#reading-key}` and `{#images}` for the built-in reading-key and image-credit links. Preserve required notices in complete downloads; an old literary work does not make every modern translation public domain.

### Optional source checksums

Set `checksums` to a JSON file containing records with `path` (relative to the edition directory), `bytes` and `sha256`. The compiler verifies these on every build, and rejects changed source files before generating output. The Odyssey edition includes all 44 source files in its checksum list. Checksums establish file identity, not the correctness of a translation.

After deliberately changing your source edition, review the new provenance and regenerate the records from those reviewed files. Do not automatically accept a checksum mismatch in CI. You can create a record in Node using `fs.readFileSync`, the buffer's `length`, and `createHash('sha256').update(buffer).digest('hex')`.

## 6. Preview and check

```sh
READER_EDITION=editions/my-book/edition.json npm run validate:content
READER_EDITION=editions/my-book/edition.json npm run dev
READER_EDITION=editions/my-book/edition.json npm run build
```

Restart the dev server after editing content; the compiler runs at startup, not on each Markdown save. Use the generic browser check against your built edition:

```sh
READER_TEST_EDITION=starter npm test
```

That flag selects the edition-independent smoke test and skips assertions about the default Odyssey collection. The smoke test reads the generated manifest, follows its first chapter, changes appearance, opens notes and tests a bookmark.

## Appearance and limits

The shared Mediterranean palette is defined by CSS custom properties at the beginning of `src/style.css`, with a night-theme block alongside it. Change both sets together and verify contrast, focus visibility and long titles at phone widths. [DESIGN.md](../DESIGN.md) explains the reading layout and motion.

The compiler accepts Unicode content and the page can set a language/direction, but bundled font coverage and the English interface are not a complete localization system. Right-to-left and non-Latin editions require font, layout and accessibility review before release. Search covers notes and titles, not the full source text. There is no backend, authentication, annotations editor, cloud sync or DRM. Text and generated search data are downloaded by the browser; build-time source files are public if you publish this repository.
