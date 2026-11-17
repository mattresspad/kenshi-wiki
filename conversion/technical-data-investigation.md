# Kenshi technical-data investigation

**Recommendation:** use small, versioned JSON indexes for FreshWiki's direct FCS lookups, while retaining KDC for its validated record publication and explicitly reviewed contextual answers. Narrow the integration boundary before adding new contextual calculations. The current static wiki does not need the former proposed MariaDB/Conductor/Lua delivery path to display a record.

This is a recommendation from a reproducible local investigation on 17 November 2026. No data producer, map deployment or wiki article was changed by it.

## What was pinned and exercised

The selected unmodded Kenshi 1.0.68 archive has KDT identity `56b5eb802ac4d395b67ae10da0a79c4781853aaca11fc8b76a3ec9215f809411`, ZIP SHA-256 `11c3bb87eafdd8cc65ce79dc39b129380459a84888d343fb3aea94f88961b46b`, and map publication revision `369f7e9dbb75a51cd358df91bc358016140e0d3fc9bd633c8d012b73d588c4e1`. It contains 39 members; the map exposes 36 required datasets, building locations, the optional areas map and the descriptor.

The public [map bootstrap](https://map.kenshi.wiki/map-data/vanilla.json) matched the local contract. The town, faction, race and world-state objects fetched from its immutable URLs matched the archive byte for byte and reported their R2 source. These checks are dated in the [result record](technical-data/results.json). They verify that publication, rather than assuming a README describes what is live.

The recovered compiler, extractor and map checkouts contain local changes. Their Git HEADs alone do not identify the examined implementations. [Source checksums](technical-data/source-pins.json) pin the files used, alongside the recorded HEAD and local-change list. KDC's publication implementation is substantially uncommitted relative to `f49133ad`; no claim is made that checking out that commit reproduces the examined publication. The map-store working tree has no commit yet. These repositories were inspected without modifying them.

The investigation copied compiler inputs and implementation into an ignored local evidence directory. Two isolated KDC 0.2.0 builds produced byte-identical manifests and artifacts at revision `3873bd6a61504a8f26933b5f5684aa76d8ee08f1c92c678482386c82cbfff889`: 8,623 records, 970 context rows and two context definitions. Availability counts were 27 available, 18 empty, 925 not applicable and zero incomplete.

## Responsibilities and limits

| Concern | KenshiDataTools export | KDC publication | Current KiMap consumer |
|---|---|---|---|
| Record identity | Exact `StringId`, name and dataset | Explicit `Type:StringId` plus source filename; validates identity and input contract | Indexes raw exact IDs; resolves placement and scenario references |
| Direct properties | Resolved `Values` dictionary | Preserves the complete dictionary | Uses selected properties; retains raw records |
| References | Categories with target IDs and `Value0/1/2`; reverse referrers | Preserves reference categories; raw referrers and instances remain internal | Applies its own scenario and display rules to the raw categories |
| Defaults | Values do not annotate whether each field was explicitly stored, inherited or defaulted | Does not reconstruct that field-level origin | Has consumer defaults, e.g. missing enemy threshold falls back to −10; these are consumer rules |
| Conditions | Stores linked world-state records and raw edge values | Current published contexts do not answer arbitrary town overrides, faction diplomacy or race calculations | Its supported-condition solver and town progression evaluate scenario changes |
| Provenance | Manifest version/mod list and archive/member hashes; no exporter commit in this pinned descriptor | Input/configuration inventories, schema, artifact hashes and content-derived revision | Immutable dataset URLs and bootstrap; separate executable consumer revision |

KDT's town, faction and race extractors use OpenConstructionSet to load the base layers plus enabled mods, then serialize item values and categorized references. They are extraction code, not independent proof of the runtime meaning of every numeric field.

The current KDC public contexts are `Building.biomeAssociations` and `Town.spawnsIn`. The first records foliage configuration associations. The second records nest associations and relative weights. Neither is a measurement of actual placement, population or absolute probability. The remaining draft route recipes are review material. The compiler remains useful where those reviewed semantics and evidence paths matter.

KiMap's current publisher reads the KDT archive directly. It does not require a KDC publication. Its scenario model is a separate consumer; its successful calculations do not establish every Kenshi runtime behavior.

## Three concrete examples

**Catun's override.** The ordinary town `33-gamedata.quack` links to `1533709-__world reactions Slavers.mod`. That override links to the “Lord Shiro is alive” state `1533710-__world reactions Slavers.mod` with `Value0 = 0`. The state refers to Shiro with status value 1. The exported resident and default-resident references are retained with all three values.

The actual KiMap baseline and replay functions selected ordinary Catun / United Cities initially, then the Fishmen override when Shiro was marked dead (0) or imprisoned (2). These assertions passed using all 36 pinned datasets. This is evidence about the consumer's model. It does not test building destruction in a running game or settle King Gurgler's effect on population. The consumer also reports eight conditionless world states and an ambiguous faction assignment on town record `49387-rebirth.mod`; their exact diagnostics are retained. These are outside the passing Catun sample and should remain visible in a broader integration.

**Faction relationships.** United Cities has exact ID `defaultEmpireFactionSID`, default relation 0, and directed stored relations including −100 towards the Holy Nation and +60 towards Slave Traders. A direct lookup can expose the source values and target IDs. Reverse relationships need a separate index; they must not be silently assumed symmetric. Other edge values remain available, rather than being discarded as decoration. Game-start/player relations and later changes are separate from a static faction-to-faction table.

**Race statistics.** Greenlander is `17-gamedata.quack`. The index preserved bleed rate 1 and the exported minimum/maximum blood values 75 and 150. It also retains enum-valued fields such as good/bad stats and speed properties. A reader-facing percentage, named stat, health formula or speed unit still needs a reviewed mapping or calculation. An omitted value remains distinguishable from an explicit zero; no universal default is inserted by the proposed index.

The five sampled records—Catun, its override, the Shiro state, United Cities and Greenlander—have identical values and reference categories in KDC's tracked 2025 input files and the map's 2026 export files. This comparison is limited to those records; it does not certify equality of the entire corpora.

## Smaller-index proof and adoption decision

A five-record example index is generated in the ignored evidence folder. It keeps exact typed IDs, all values and reference categories, plus the archive checksum, publication revision and source filename. A consumer reads it back and checks directed relationships and race ranges. Reversing record input order produces the same canonical index bytes. The result record includes its size and checksum.

For a first production integration, build one small index per demonstrated reader need, keyed by exact IDs. Keep source version, checksum and any transformation version with the result. Astro can read these at build time, so ordinary article requests remain static. Display qualified technical facts beside the editorial prose; do not replace prose automatically.

Retain KDC's stable record contract, deterministic validation and its two approved contexts. Add a new contextual answer there only when it needs a reviewed traversal and an explicit semantic contract. Avoid recreating all 194 draft route interpretations inside the website. Compare the proposed index against both its pinned source and the actual consumer before promoting it.

Before adopting this beyond the investigation:

1. Agree on one canonical export revision and explicitly migrate or reconcile KDC's older corpus.
2. Commit/release the inspected producer and consumer work, or continue distributing a complete checksum-pinned source snapshot internally.
3. Specify field defaults, enum labels, units and conditional semantics for each exposed fact. Preserve “unknown” where evidence is incomplete.
4. Keep source notices and publication provenance with any accepted data excerpt; the internal example is not part of the built site.
5. Add consumer failure checks for absent references and changed source revisions. Test actual in-game behavior for claims the data model cannot settle.

## Reproduction

Run the following with the recovered local tool paths and their installed dependencies:

```text
node scripts/technical-data/investigate.mjs <KDC-directory> <KDT-directory> <map-store-directory> <KiMap-directory> <pinned-ZIP> <Python-executable> --live
```

Omit `--live` for the offline build and consumer checks. The script writes an isolated compiler copy, two publications, source pins, an example index, consumer results and command logs beneath `reports/technical-data/`. It never writes to the supplied project directories. `latest.json` identifies the evidence run. The normal wiki build does not depend on any of these tool checkouts or the generated data index.
