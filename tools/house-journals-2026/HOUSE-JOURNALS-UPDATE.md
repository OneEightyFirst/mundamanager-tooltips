# MundaMate 1.1.1 — House journals

Re-indexed 11 October 2026 from the two complete released N26 Underhive Journal PDFs. The 114 core entries remain unchanged; the 70 journal-owned entries were rebuilt in place, for 184 total.

## Added

- All six Finesse skills and all six Muscle skills, including their Primary access rule.
- All 11 gene-smithing upgrades, recruitment restrictions and Forge Master exception.
- All nine chem-alchemy elixirs, Cycle usage, application timing and Administer Dose.
- Auto-chem, Multi-harness, Servo-medicae, Chem Slugger and Medi Skull.
- Twelve weapon entries, including both wyld bows and their ammunition profiles.
- Variant special rules, Death Rites, Enhance Weapon, Shockwave, Stand Firm, Flex, Auto-medicate and Chem Slug.
- Searchable toolbar popup with house/category filters, even when the site has no corresponding rule text.

The tooltips preserve the existing flat rules dictionary. `house-rules.json` stores category and source metadata for new entries. Each new tooltip includes a source reference. Descriptions are concise reference summaries, not a replacement rulebook.

## Source checks

Sources are now the complete released files `Necromunda_Skirmish_journal_Esher_2026.pdf` and `Necromunda Skirmish 2026 House of Chains - Goliath Journal.pdf`. Every journal-owned entry points to the printed page and the corresponding PDF page. The complete rules sections were text-scanned, and the skill, gene-smithing, chem-alchemy, equipment and post-cycle-action pages were visually checked. The local September 2026 FAQ remains the governing errata source. No older House books or web rules were used.

The earlier screenshot/transcript consolidations are superseded and are no longer cited by the dataset. In particular, Enhance Weapon is now verified directly on printed page 48 of the released Goliath journal.

`journal-index.json` is the compact retrieval index for both books. It records section ranges, named rules and the unusual Goliath pagination: most interior spreads are duplicated on consecutive PDF pages, so the index cites the first copy of each spread.

## Boundaries

This is a local reference extension. It does not add options to Munda Manager's database, spend credits, grant skills or change stats. Use the popup for missing options, or put the rule name in an existing displayed notes field to get a tooltip.

This release indexes but does not reproduce full fighter profiles, variant roster/equipment tables, tactics, territories or side jobs. Starting skills named in the journals are not automatically assigned. Existing core entries were preserved, not comprehensively re-audited against the September FAQ.

## Behaviour and validation

Longest-name-first, single-pass DOM construction remains in use. Apostrophes and hyphen/space variants now match. Native links, buttons and editable fields are left interactive. The modal's entire subtree is excluded from injection; long descriptions scroll, and Escape closes it.

Validated the actual shipped injector and popup in Chromium: all 70 new names, overlapping names, typography variants, parameterized traits, dynamic content, protected controls, modal isolation, narrow-screen bounds, search/filter results and empty searches. All 113 original rule values were checked unchanged. Source and Chrome bundle copies are byte-identical. JavaScript syntax and existing matching tests pass.

## Load the update

If Chrome already loads this folder, open `chrome://extensions`, find MundaMate and click Reload. Refresh any open Munda Manager pages. Version should read **1.1.1**. Click MundaMate in the extensions menu for the searchable reference.

For a new installation, enable Developer mode, choose Load unpacked, and select the `chrome-extension` folder (or the packaged `MundaMate-Chrome` folder). No new extension permissions were added.
