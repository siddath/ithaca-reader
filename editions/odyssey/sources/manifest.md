# Sources, editions and evidence boundaries

Research date: 18 September 2026. Primary works saved locally for reproducible reading and quotation checks. Original downloads retain their Gutenberg metadata and licence. Individual book/episode extracts are derived reading copies, not independent editions. Their checksums are in [checksums.json](checksums.json).

| ID | Work and version | Online source | Local copy and use |
|---|---|---|---|
| H-BUTLER | Homer, *Odyssey*, Samuel Butler's English prose translation (1900); Gutenberg eBook 1727, update dated 2 December 2023 | [Gutenberg catalogue](https://www.gutenberg.org/ebooks/1727), [downloaded plain text](https://www.gutenberg.org/ebooks/1727.txt.utf-8) | `odyssey-butler.txt`; `odyssey-01.txt` through `odyssey-24.txt`. All dossier Homer quotations use this translation. |
| H-MIT | Internet Classics Archive presentation of Butler | [24-book contents](https://classics.mit.edu/Homer/odyssey.html) | Book-specific links in dossiers provide convenient online reading. Exact matching uses the saved Gutenberg version, which can differ in typography and note markers. |
| J-1922 | James Joyce, *Ulysses*, Gutenberg 4300, described by Gutenberg as based on pre-1923 print editions; updated 27 November 2025 | [Catalogue](https://www.gutenberg.org/ebooks/4300), [downloaded text](https://www.gutenberg.org/ebooks/4300.txt.utf-8) | `ulysses-joyce.txt`; `ulysses-01.txt` through `ulysses-18.txt`. No Gabler edition line numbers claimed. |
| HES-EW | Hesiod, *Theogony*, H. G. Evelyn-White translation (1914), displayed by Theoi | [Primary text](https://www.theoi.com/Text/HesiodTheogony.html) | Consulted for the wider divine genealogy in foundations. This is a different ancient work, not missing Odyssey chapters. |

## How to locate a quotation

The quote, translation and book/episode are stated in the dossier. [quotation-ledger.csv](../quotation-ledger.csv) supplies the matching location in each split source. Some dossiers also provide lines in the full downloaded source or book extract. These are local text-file coordinates, **not ancient Greek verse numbers or scholarly Joyce edition numbers**. [ulysses-boundaries.json](ulysses-boundaries.json) maps Joyce's numbered sections to full-file lines. Whitespace alone is normalised in the automatic check; no silent replacement of wording is accepted.

The archive uses public-domain base texts. Butler is accessible and reusable but dated: he uses Roman divine names, sometimes Christian-sounding English, interpretively strong idioms and speculative notes. The analytical prose uses Greek names where helpful; quotations retain the source. This dossier has not collated the Greek manuscripts or compared every passage with a contemporary translation. Murray's Perseus edition was discovered as a possible comparator but its book-text endpoint was not reliably accessible in this run; no full Murray cross-check is claimed.

Butler's introduction and footnotes are preserved in the complete source file, separated from the 24 narrative extracts. His ideas about authorship and geographical identification are not treated as the narrator's statements or current scholarly consensus. The final book ends before `FOOTNOTES:`.

## Scholarly and contextual sources

- [Gregory Nagy, *A Sampling of Comments on the Homeric Iliad and Odyssey*, CHS](https://www-current.chs.harvard.edu/curated-article/gregory-nagy-a-sampling-of-comments-on-the-iliad-and-odyssey/): passage-oriented philological and interpretive reference. Its proposed readings are attributed, not treated as a universal decoding key. Most dossier close readings are explicitly our own arguments from the primary text.
- [Gregory Nagy, *Oral Traditions, Written Texts, and Questions of Authorship*, CHS](https://www-current.chs.harvard.edu/curated-article/gregory-nagy-oral-traditions-written-texts-and-questions-of-authorship/): scholarly account of oral tradition and authorship; consulted for method, without claiming its model ends the debate.
- [Sheila Murnaghan, *Disguise and Recognition in the Odyssey*, chapter 1, CHS](https://www-current.chs.harvard.edu/sheila-murnaghan-disguise-and-recognition-in-the-odyssey-chapter-1/): recognition, identity and the household; used selectively and with attribution.
- [Stamatia Dova, *Kind Like a Father: On Mentors and Kings in the Odyssey*, CHS](https://www-current.chs.harvard.edu/stamatia-dova-kind-like-a-father-on-mentors-and-kings-in-the-odyssey/): Mentor and paternal authority; helps distinguish the human figure from Athena's impersonation.
- [The Homeric Odyssey and the Cultivation of Justice, CHS discussion series](https://www-current.chs.harvard.edu/discussion-series-the-homeric-odyssey-and-the-cultivation-of-justice/): thematic context and an avenue for further reading; a programme description is not equivalent to reviewing every discussion in the series.
- [Stephanie West, *Laertes revisited*, Cambridge](https://www.cambridge.org/core/journals/cambridge-classical-journal/article/abs/laertes-revisited/7AA7517F52220278BC6D5E140E1652E9): the accessible extract discusses the contested evidence for an ancient end-point at 23.296. The full paywalled article was not consulted.
- [Irene de Jong, *Book Twenty-four*, Cambridge](https://www.cambridge.org/core/books/abs/narratological-commentary-on-the-odyssey/book-twentyfour/19D26074C1456AC81AE089BF835AEB90): accessible chapter extract on the final book's structure and closure, not a claim of access to the entire commentary.
- [Colette and Seán Hemingway, *Greek Gods and Religious Practices*, Metropolitan Museum](https://www.metmuseum.org/essays/greek-gods-and-religious-practices): overview of gods and cult practice; foundation context, not a projection of all Classical institutions into Homer.
- [The Joyce Project, schema note](https://joyceproject.com/notes/zU-bJZUBeQi-aLQfd66b): explains the history and interpretive use of Joyce's schemas. Primary novel passages remain the evidence for episode events and wording.
- [University at Buffalo, Linati schema manuscript catalogue](https://library.buffalo.edu/jamesjoyce/catalog/v-ulysses/va1a.html): directly inspected archival record of Joyce's 1920 scheme, its 18 episodes and differences from later schemas. The catalogue cautions that some proposed parallels are hard to locate in the completed novel.
- [The Morgan Library, Joyce's schema](https://www.themorgan.org/exhibitions/online/ulysses/schema-ulysses): archival object catalogue located through search. Direct opening returned 403 in the root session; treat as an archival lead/search-visible description unless a chapter names separately inspected evidence.

## Limits and reproducibility

This is a comprehensive book-by-book **reading dossier**, not an exhaustive literature review of Homeric or Joycean scholarship. Exact quotation checking cannot by itself validate interpretation, attribution or scene boundaries; the original independent editorial review examined those. Interpretive disagreement is retained where the primary text or scholarship does not justify closure.

This edition compares Homer with James Joyce’s novel. It includes no film comparison. Original publication notices remain in the complete source files.
