---
name: Ithaca
description: A sea-blue reading edition of Homer and a companion to Joyce.
colors:
  blue: "#123d52"
  accent: "#256680"
  paper: "#f4f5ef"
  leaf: "#fafbf7"
  ink: "#183c4b"
  muted: "#566b73"
  rule: "#cdd7d7"
  wash: "#e7ece9"
  night-paper: "#102d3a"
  night-leaf: "#153441"
  night-ink: "#e6eee9"
  night-muted: "#adbfbe"
  night-accent: "#afd4dc"
  night-rule: "#35515d"
  night-wash: "#1d3c49"
typography:
  display:
    fontFamily: "Literata Variable, Georgia, serif"
    fontSize: "clamp(76px, 7.4vw, 106px)"
    fontWeight: 400
    lineHeight: 1.03
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Literata Variable, Georgia, serif"
    fontSize: "42px"
    fontWeight: 450
    lineHeight: 1.22
    letterSpacing: "-0.032em"
  section-title:
    fontFamily: "Literata Variable, Georgia, serif"
    fontSize: "1.3em"
    fontWeight: 550
    lineHeight: 1.35
    letterSpacing: "-0.017em"
  body:
    fontFamily: "Literata Variable, Georgia, serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.78
  body-classic:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.75
  body-clear:
    fontFamily: "Manrope Variable, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.8
  passage:
    fontFamily: "Literata Variable, Georgia, serif"
    fontSize: "1.12em"
    fontWeight: 450
    lineHeight: 1.7
  navigation:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "13px"
    fontWeight: 600
rounded:
  small: "3px"
  control: "4px"
  dialog: "5px"
spacing:
  compact: "12px"
  control: "16px"
  group: "24px"
  section: "48px"
components:
  icon-button:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  icon-button-hover:
    backgroundColor: "{colors.wash}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "16px 24px"
  navigation-selected:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.small}"
    padding: "9px 7px"
  reading-leaf:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.ink}"
  chapter-bookmark:
    textColor: "{colors.muted}"
    padding: "8px 0"
  chapter-bookmark-selected:
    textColor: "{colors.accent}"
  chapter-notes-menu:
    backgroundColor: "{colors.leaf}"
    rounded: "{rounded.dialog}"
    padding: "16px"
    width: "320px"
  font-option:
    rounded: "{rounded.control}"
    padding: "15px 8px"
  font-option-selected:
    backgroundColor: "{colors.wash}"
  reader-dialog:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dialog}"
    padding: "32px 38px 38px"
---

# Design System: Ithaca

## Overview

**Creative North Star: "A sea-blue reading edition"**

A full-width Mediterranean sea photograph carries the title beneath a uniform dark scrim. A pale reading leaf follows. Literata supplies the default literary voice; Manrope identifies controls, sources and navigation. The Turner frontispiece retains its own artwork colors.

The edition opens chapters in the original text. Commentary is read one selected section at a time through a chapter-local menu or the desktop section rail. Continuous scrolling remains native within each view. Reader-selected Georgia and Manrope faces are intentional exceptions to the default serif reading voice; identity typography stays stable. The night theme retains the same surface relationships.

**Key Characteristics:**
- Full-width sea cover with a uniform scrim and a light reading leaf.
- Default literary serif prose, optional reading faces and stable sans-serif navigation.
- Flat ruled surfaces, real images and quiet state changes.
- Original text first, with separate note sections and chapter-local bookmarks.

This design reference describes the default Odyssey edition. Edition-specific text, imagery and navigation come from `editions/odyssey/edition.json`; the shared layout and motion live in `src/style.css`.

## Colors

The palette relates dark maritime blue to cool paper and blue-grey ink.

### Primary

- **Sea blue** (`blue`): the sea-related identity and cover fallback; it remains stable in both reading themes.
- **Reading accent** (`accent`, `night-accent`): prose links, chapter numbers, focus outlines and saved-state emphasis.

### Neutral

- **Paper** (`paper`, `night-paper`): outer page and navigation environment.
- **Reading leaf** (`leaf`, `night-leaf`): sustained prose and dialogs.
- **Ink** (`ink`, `night-ink`): text and selected controls.
- **Secondary ink** (`muted`, `night-muted`): metadata, source notes and inactive navigation.
- **Rule** (`rule`, `night-rule`): chapter divisions, table rows and surface boundaries.
- **Wash** (`wash`, `night-wash`): selected navigation and grouped controls.

The full-cover photograph uses a uniform `rgba(4,27,46,.43)` scrim through `.sea-leaf::after`; it is a legibility layer, not a gradient or extra brand color.

The night tokens replace their day counterparts through `data-theme=night`; components use the same semantic CSS properties in either theme. Artwork retains its own colors.

**The Reading Leaf Rule.** Keep literary text on the reading leaf; use the sea cover for the edition identity and the accent for links and interaction.

## Typography

**Identity font:** Literata Variable, Georgia, serif, self-hosted with real italics and optical sizing.
**Navigation font:** Manrope Variable, sans-serif, self-hosted.
**Reading faces:** Literata by default; Georgia with Times New Roman/serif fallbacks for Classic; Manrope with Arial/sans-serif fallbacks for Clear. Georgia is a system font, not a bundled third font.

The hierarchy is editorial rather than a fixed mathematical scale. `--reading-font`, `--reading-size` and `--reading-leading` control prose, appearance preview and saved quotations. `data-font=classic` and `data-font=clear` replace the default font and leading. User sizes are 18, 20, 22 and 24 pixels, with 20 standard; the selected size now applies unchanged on phones. These font choices are an intentional user-authorized exception to the default serif prose role, not a change to identity or navigation typography.

At the standard desktop size, Literata resolves to 20 / 35.6 pixels, Classic to 20 / 35 pixels and Clear to 20 / 36 pixels. Night prose adds .04 to each face's leading and .003em tracking. The current phone cascade sets day prose leading to 1.75 for all faces; the more-specific night rule retains each face's leading plus .04. The phone preview separately uses 1.7 leading. These current overrides are observations, not an invitation to invent more type scales.

Section headings inherit the selected reading face at 1.3em / 1.35 (26 / 35.1 pixels at the standard size). Chapter headings retain Literata, weight 450, with responsive sizes of 42, 39, 35, 34 and 31 pixels before the later phone override resolves the narrowest heading to 34 pixels. The sea-cover title uses the frontmatter display ramp and later phone sizes of 76 and 67 pixels. Smaller supporting metadata does not establish a universal minimum. Prose emphasis uses weight 650; source italics and verse line breaks remain intact, with verse paragraphs inset 1.4em. The original text no longer uses a drop cap. Its primary heading is the book or episode number, with the work name above it; notes retain the descriptive chapter title. Literata and Georgia supply their available italic faces. Because bundled Manrope has no italic face, Clear deliberately enables `font-synthesis:style` on prose, preview and saved quotations to preserve source emphasis.

**The Two Voices Rule.** Keep identity headings in Literata and controls in Manrope. Let the explicit reading preference choose Literata, Georgia or Manrope for prose, previews and saved quotations; preserve source italics, verse breaks and punctuation.

## Layout

The desktop reader has three columns: a chapter rail, a bounded reading leaf and a section rail. The base grid is `245px minmax(0,820px) minmax(170px,1fr)` within a 1520-pixel maximum. The reading leaf's base horizontal padding is 56 pixels; with its two one-pixel rules, a full 820-pixel track leaves 706 pixels for content. At 1450 pixels and above the padding becomes 65 pixels, leaving 688 pixels in that full track. The prose adds an actual `max-width:68ch`, centered within the available reading leaf; both the grid and that cap constrain measure.

At 1350 pixels the grid tightens. At 1150 pixels the section rail disappears; the chapter-local Reading notes menu remains available at all widths. At 900 pixels the chapter rail narrows. At 700 pixels the reader becomes a single column with 25-pixel horizontal padding, chapter access remains in the global Texts menu and the masthead is 64 pixels high. At 370 pixels the reading padding resolves to 20 pixels. Selecting a reading view changes the hash, closes the notes menu and moves to the selected content. Only that note section is rendered. Source paragraphs, section headings, quotations and edition-note anchors reserve 170 pixels of scroll clearance on desktop and 155 pixels on phones for the sticky controls.

The home contents use two columns and become one column on phones. The title overlays the full-width photograph at every breakpoint. The cover is 610 pixels tall by default, 570 pixels at 1150 pixels and below, and 550 pixels on phones; it never becomes a split photograph/title pair. Repeated spacing values in frontmatter are observed steps, not a claim that the entire CSS uses a rigid spacing scale. Text tables scroll within the prose width. Native scrolling remains available throughout.

## Elevation & Depth

Page surfaces are flat, distinguished by color and fine rules. Raised depth belongs to dialogs, the chapter notes menu, transient status feedback and the selected type-size control. The selected font option uses an inset accent line. Exact shadow values live in the stylesheet. Photography and painting provide visual depth without decorative texture overlays.

**The Still Page Rule.** Prose, chapters, search results and keyboard actions stay still. Motion belongs to controls, menus, dialog entry and transient status feedback.

The shared strong ease-out is `cubic-bezier(.23,1,.32,1)`. The implemented control vocabulary uses `--feedback-time:140ms` for the bookmark icon, 180 milliseconds for mode underlines, chevrons, the cover action arrow and notes-menu entry, and `--panel-time:220ms` for dialog entry. The global button press scales to .97 over the same 140-millisecond feedback duration; transient status entry uses 160 milliseconds. Dialog entry combines opacity with an eight-pixel translation and scale from .985. Keyboard input disables transitions and animations; reduced motion removes those durations and decorative transforms. Selected-state cues remain visible without animation. No page-turn animation is part of this system.

## Shapes

Reading leaves, contents and quotation blocks remain rectangular. Fine horizontal rules frame quotations and delimit navigation. Small radii belong to compact controls, selected rail items and dialogs, as recorded in frontmatter. There is no recurring marketing-card component or pill-chip system to carry forward.

## Components

### Buttons

Controls are compact and typographic. The begin-reading action is an underlined row with an arrow over the sea photograph. Icon buttons have gently rounded corners, a wash on pointer hover and an accent focus outline. The filled primary button is used for recovery actions. Selected work buttons use ink, increased weight and an underline; reading modes use a two-pixel accent underline animated from the left; save-passage actions use underlined text and change color when saved.

Keyboard focus on interactive controls uses a two-pixel accent outline with a five-pixel offset. Pointer hover styles are restricted to fine pointers with hover support. Do not infer a universal touch-target guarantee from the base icon-button dimensions: some responsive controls have narrower overrides.

### Inputs / Fields

Search is a borderless Literata input within a ruled row. It inherits theme ink, has a muted placeholder and visible focus. Search results are separated with rules and have literary titles. The dialog search field receives focus on opening; Escape closes the panel even with a nonempty search value.

### Navigation

The global Texts menu selects the Odyssey, Ulysses or companions. The separate Saved action opens the reading shelf. The chapter rail uses Roman numerals, muted labels and a wash-backed current page. The toolbar stays sticky below the masthead (72 pixels on desktop, 64 on phones) and offers Original text and a Reading notes menu; the notes menu lists individually rendered sections. Its selected button has a wash and visible arrow. The desktop section rail also selects Original text or individual note sections using buttons with current-page states. Below its breakpoint the toolbar menu retains this access. Section pagination advances between the original text and commentary sections; chapter navigation remains a separate ruled footer.

### Chapter bookmark and reading shelf

A bookmark action beside the chapter heading saves the chapter independently of quotation saves. Its pressed state uses an accent color, filled icon and slight icon lift. The reading shelf has separate Bookmarked chapters and Saved quotations groups, each with removal controls. Both stay on the current device.

### Reader dialog

A native modal dialog contains Texts, search, the reading shelf or appearance controls. It uses the leaf surface, a small corner radius, a dimmed backdrop and a bounded scrolling area. Close controls, Escape and focus behavior belong to this component. On phones its width becomes the viewport minus 24 pixels and its maximum height is 88dvh. Appearance controls offer three named typefaces, explicit day/night choices and four text sizes. Typeface options form a three-column grid and use wash, accent border and inset underline to mark selection.

### Quotation passage

A passage is a ruled figure with a larger blockquote in the selected reading face and a save action. Its focus destination has an accent outline separated from the text. Saved passages are stored on the current device and linked back to their original context. Source punctuation, emphasis and verse form remain content, not interface copy to restyle or rewrite.

### Reading leaf and source disclosure

The leaf holds the chapter heading, source disclosure and prose. Evidence labels remain inline sans-serif distinctions. The original-text view has an edition note and source-preserving paragraphs. Its opening paragraph uses the same text size as the rest of the prose. Source disclosures use native details/summary behavior and a rotated chevron in the open state.

## Do's and Don'ts

### Do:
- Do keep the reading column independent of navigation rails.
- Do keep the chapter Reading notes menu available when the right rail disappears.
- Do preserve source emphasis with available italic faces or the explicit Clear-mode style synthesis, along with verse formatting, original quotation punctuation and evidence distinctions.
- Do use semantic buttons, links, disclosure controls and a native dialog with visible keyboard focus.
- Do keep image credits and the full day/night surface relationships.
- Do honor the selected reading face and size on phones, keeping chapter bookmarks distinct from quotation saves.

### Don't:
- Don't animate the reading text, chapter changes or keyboard interactions.
- Don't replace continuous scrolling with simulated page curls or blocked scrolling.
- Don't turn artwork colors into extra interface accents.
- Don't present the compact metadata sizes as a universal minimum for future controls.
