---
articleId: modding/meitou/make-a-saddle-pack
title: "Make a saddle pack for Meitou"
description: "Give the Wandering Trader’s Pack Bull a riding fit, package it as a separate Kenshi mod, and test the ZIP on a clean Meitou profile."
layout: recipe
headingIds:
  sources-and-history: source-history
  the-fitting-file: transport-json
versions:
  - [MeitouClient 0.18.0 for Windows x64, https://github.com/VlcekM/MeitouClient/releases/tag/v0.18.0]
  - [Transport 0.3.0-playtest.4, https://github.com/mattresspad/MeitouTransport/releases/tag/v0.3.0-playtest.4]
categories: ["Modding", "Guides"]
---

Give the Pack Bull in **The Wandering Trader** a saddle of its own. Meitou Transport handles mounting, steering and dismounting. You choose the animal, fit the seat, and give another player a ZIP containing just your mod. You can make this pack with a text editor and the released sample files.

## Inspect Garru Saddle

Use an installed copy of Kenshi, [MeitouClient 0.18.0 for Windows x64](https://github.com/VlcekM/MeitouClient/releases/tag/v0.18.0), and the [Transport 0.3.0-playtest.4 handoff](https://github.com/mattresspad/MeitouTransport/releases/tag/v0.3.0-playtest.4). Unzip the handoff in a work folder. Unzip **Garru Saddle** there as your reference. Set aside the **Meitou Transport** ZIP for the player test.

Open Garru Saddle’s `transport.json`. Its two animal IDs select Garru and Pack Beast. Both share the spine bone used by this fit. To find our animal, open the [Forgotten Construction Set](/forgotten-construction-set) with the base game data and find **Pack Bull** among the animal character records in the Game World window. Check the record’s string ID is `47929-rebirth.mod`. The similarly named **Domesticated Bull** has a different record and skeleton.

## Give the Pack Bull its own fit

1. In your work folder, make a directory named **Pack Bull Saddle**. Copy the sample’s `Garru Saddle.mod` into it and rename the copy `Pack Bull Saddle.mod`. This record-free FCS file already declares the dependency on `Meitou Transport.mod`. If you create the file in FCS yourself, select Meitou Transport as a dependency and save your own file as the active mod.
2. Inside the new directory, create `meshes` and `textures`. Copy the sample’s `meshes/mvv_garru_saddle.mesh` to `meshes/trader_bull_seat.mesh` and its `textures/mvv_garru_saddle.dds` to `textures/trader_bull_seat.dds`. The distinct filenames avoid collisions with other enabled mods. These two pieces of sample art are [released under CC0](https://github.com/mattresspad/MeitouTransport/blob/v0.3.0-playtest.4/LICENSING.md).
3. Save the following as `transport.json` beside `Pack Bull Saddle.mod`. This fit comes from the [Transport pack author’s guide](https://github.com/mattresspad/MeitouTransport/blob/v0.3.0-playtest.4/AUTHORING.md#fit-a-pack-bull-saddle).

### The fitting file

```json
{
  "schemaVersion": 3,
  "packId": "trader-bull",
  "mounts": [{
    "id": "trader-bull.travelling-seat",
    "label": "Trader's Bull Saddle",
    "animalRecordIds": ["47929-rebirth.mod"],
    "anchorBone": "Bip01 Spine2",
    "saddleOffset": [0.28, 7.6, 2.2],
    "saddleRotationDegrees": [-5, 0, 0],
    "seatOffset": [0, 1.8, -0.35],
    "seatYawDegrees": 0,
    "saddleMesh": "meshes/trader_bull_seat.mesh",
    "texture": "textures/trader_bull_seat.dds"
  }]
}
```

The bull carries the saddle on `Bip01 Spine2`. Adjust `saddleOffset` to place the saddle relative to that bone. Adjust `seatOffset` to place the rider’s pelvis relative to the saddle. Positive Y is up and positive Z is forward. For your own animal, start with its record ID and a bone on its rig, then check the fit through a turn in game.

## Hand the ZIP to a player

ZIP the **Pack Bull Saddle** folder itself. Open the ZIP and check it has one top-level folder with these four files inside.

```text
Pack Bull Saddle/
  Pack Bull Saddle.mod
  transport.json
  meshes/trader_bull_seat.mesh
  textures/trader_bull_seat.dds
```

In a fresh test profile, unpack the framework and your ZIP directly into the Kenshi `mods` directory. Enable **Meitou Transport** followed by **Pack Bull Saddle**. A player needs those two mods and the matching client. Keep the Garru reference, editor and development tools in the author’s work folder.

### Turn, save and reload

1. Start **The Wandering Trader**. Select the trader beside the owned Pack Bull, then choose **F10 → Mount nearby animal**.
2. Right-click open ground. Change direction and watch the rider and saddle through the turn.
3. Save while mounted. Reload the slot. The trader should be on foot beside the same bull. Mount again, choose **F10 → Dismount**, and send the trader a few steps away on foot. [See the recorded result](#recorded-playtest).

### Recorded playtest

**Mu returned on foot beside the same bull and successfully remounted.** In the wiki’s Windows x64 playtest, Mu rode the Pack Bull through an 86.4° turn. The save was written with Mu mounted. On reload Mu was on foot 9.3 world units from the same bull, with its backpack and four inventory entries intact. Mu remounted, dismounted and walked another 19 units on foot while the bull stayed put.

<figure>
  <a href="/images/guides/pack-bull-turn.webp"><img src="/images/guides/pack-bull-turn.webp" width="640" height="400" style="max-width:100%;height:auto" loading="lazy" alt="Mu seated on the saddled Pack Bull as it turns on a slope near town."></a>
  <figcaption>Mu and the Pack Bull using the four-file saddle pack in the fresh-profile test. Only Meitou Transport and Pack Bull Saddle were enabled.</figcaption>
</figure>

[Back to the save-and-reload step](#turn-save-and-reload).

## Fitting in Maestro

<figure>
  <a href="/images/guides/maestro-garru-fit.png"><img src="/images/guides/maestro-garru-fit.png" width="620" height="385" style="max-width:100%;height:auto" loading="lazy" alt="Maestro previews the saddle on a Garru. The fit targets Garru and Pack Beast, and the review lists both art files and transport.json."></a>
  <figcaption>Garru Saddle in the locally tested Maestro Avalonia prototype on Meitou 0.18.0. The blue marker locates the attachment bone and the gold marker shows the seat and facing.</figcaption>
</figure>

In this trial the author selected the animal records, fitted the saddle, reviewed the dependency and exported **Garru Saddle.mod**, **transport.json**, **meshes/mvv_garru_saddle.mesh** and **textures/mvv_garru_saddle.dds**. The Linux editor’s ZIP was installed in a fresh Windows profile and the Garru completed a turn. The released handoff above contains the sample and everything needed for the manual recipe. Maestro was a separate local authoring trial.

## Sources and history

Original guide by **Prd (mattresspad)** under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). [Original guide commit](https://github.com/mattresspad/kenshi-wiki/blob/1ce0ec1c8121874779541500e38f25c2912e12d4/src/content/wiki/modding/meitou/make-a-saddle-pack.md) · [Recorded player test](#recorded-playtest) · [Maestro fitting image](https://github.com/mattresspad/kenshi-wiki/blob/0c9b4348592605169315b6dd613dde1c220d1237/public/images/guides/maestro-garru-fit.png). The [CC0 release](https://github.com/mattresspad/MeitouTransport/blob/v0.3.0-playtest.4/LICENSING.md) covers the sample mesh and texture.
