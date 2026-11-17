---
title: Blender plugins
description: Which Blender plugins import and export Kenshi models, skeletons, animations and collision, which Blender versions each works in, and the settings and problems to know about.
categories:
  - Modding
layout: reference
credit: teppuM
license: "4.0"
originalCommit: 7c0a6547fdfd7868d976f1189b2889dad68f12ae
headingIds:
  sources-and-history: source-history
---

Kenshi's models, skeletons, animations and collision files need a plugin before Blender can open or save them. Three plugins are maintained today, each for a different range of Blender versions.

These notes come from tests in November 2026: each plugin imported and exported 37 base game models, plus the male human with its skeleton and 174 animations, and the results were compared with the game's own files.

## Which plugin to use

| Plugin | Version | Blender versions | Tested in |
|---|---|---|---|
| [Ragnarking's kenshi_io_blender5](https://github.com/Ragnarking/kenshi_io_blender5/releases/tag/v1.4.0) | 1.4.0 | 4.4 and later | 5.2.3 |
| [Lucius64's Kenshi IO Tools](https://github.com/Lucius64/kenshi_io_blender) | 1.3.2 | 2.79, 2.80, 3.6, and 4.2 to 4.5 | 4.5.16 |
| [Kindrad's Kenshi_IO_Continued](https://codeberg.org/Kindrad/Kenshi_IO_Continued) | 2024.8.21 | 3.3 to 4.0 | 3.6.23 and 4.0.2 |

Lo-Fi's original plugin (the 2.79 and 2.80 builds on the Lo-Fi forum) is outdated and wasn't tested. Use one of the three above.

## Every plugin: vanilla animations

Re-exporting the game's existing animations shifts fast moves by a few degrees, and by 20 to 70 degrees in the worst cases. New animations are fine, but don't round-trip vanilla animations you want to keep exact.

## Ragnarking's kenshi_io_blender5

[Download version 1.4.0 on GitHub](https://github.com/Ragnarking/kenshi_io_blender5/releases/tag/v1.4.0)

- A fork of Lucius64's plugin that replaces its closed-source module with plain Python, so it runs on Blender 5. It is new (November 2026) and one person's work.
- On import, set **Merge vertices** to "not merge" and tick **Create materials**. Otherwise double-sided faces turn single-sided and materials get renamed.

## Lucius64's Kenshi IO Tools

[Kenshi IO Tools on GitHub](https://github.com/Lucius64/kenshi_io_blender)

- Won't turn on in Blender 5 (tested in 5.2, also reported for 5.1).
- Crashed Blender while exporting one small multi-part model, 5 times out of 6.
- Use the same import settings as for Ragnarking's plugin above.

## Kindrad's Kenshi_IO_Continued

[Kenshi_IO_Continued on Codeberg](https://codeberg.org/Kindrad/Kenshi_IO_Continued)

- Breaks in Blender 4.1 and later.
- Collision export does nothing in its default "Selected Children" mode. Use "Selection".
- Models with several parts sharing one material fail to export unless you pick the 1.10 converter.
- Can't import collision files, and its sphere, capsule and convex collision export is unreliable.
- Crashes on meshes that have vertex colors but no UV map, and on meshes with a single polygon.
- Vertex colors can shift very slightly.

## Sources and history

Written and tested by [teppuM](https://github.com/teppuM) in November 2026. The version and compatibility notes above describe the tests reported in the [original contribution](https://github.com/mattresspad/kenshi-wiki/blob/7c0a6547fdfd7868d976f1189b2889dad68f12ae/src/content/wiki/modding/blender-plugins.md) and [PR #43](https://github.com/mattresspad/kenshi-wiki/pull/43). Original wiki text is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
