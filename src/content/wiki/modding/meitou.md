---
title: "Meitou community mods"
description: "Find community mods for MeitouClient, see what each adds to Kenshi, and learn how to write a code mod or suggest a release."
source: original
categories: ["Modding"]
---

Kenshi Wiki maintains this directory of community mods for [MeitouClient](https://meitou.kenshi.wiki/). Each mod title opens the creator’s Steam Workshop listing, where you can find screenshots, downloads, and compatibility notes.

[Suggest a mod][suggest] with its public release link, the creator’s preferred credit, what it changes, and any requirements. If you’re starting a project of your own, jump to [Make a code mod](#make-a-code-mod).

## Browse mods

<div class="community-mod-list">

- ### [Execution][execution]

  By Jame

  Adds a Meitou context-menu order that lets a squad member execute a downed opponent. [Source code](https://github.com/teppuM/meitou-execution).

- ### [Guild & Quests][guild]

  By BeatTheCount

  Join the Adventurers Guild in 20 towns. Meitou powers its quest boards and trials, where your squad can climb the guild ranks.

- ### [Kenshi Ultimate Overhaul][overhaul]

  By BeatTheCount

  Changes who takes over towns as faction leaders fall. On Meitou, nations can also go to war. Requires Universal Wasteland Expansion, Kenshi Kaizo, and their compatibility patch.

- ### [Landmark Banners][banners]

  By BeatTheCount

  Meitou adds colored signs to town buildings so you can spot a bar, doctor, or shop from the street. The symbol on each banner identifies the service.

- ### [TimeLight Map][timelight]

  By pizzy

  A live 3D minimap follows your squad. Match the download to your Meitou version when choosing a build on Workshop or [Nexus Mods](https://www.nexusmods.com/kenshi/mods/2285). [Source code](https://github.com/pizzy00/timelight-map).

</div>

You can also meet authors and discuss releases in the **meitou-mods** channel on the [Meitou Discord](https://discord.gg/DVAHH2n9DR).

## Make a code mod

Bringing an existing mod? [Assess one RE_Kenshi feature](/modding/meitou/porting-re-kenshi-mods). To try making a dependent mod, [fit a saddle to a Pack Bull](/modding/meitou/make-a-saddle-pack) and hand the ZIP to another player.

Ordinary Kenshi mods can change game records in the [Forgotten Construction Set](/forgotten-construction-set) or supply new assets. Meitou code mods can also run C# inside the client. Follow the [MeitouClient code-mod guide][guide] for setup instructions that match your client version.

1. [Create your first mod][quickstart]. Build a C# library against your installed client and identify its entry type in the [`meitou.json` manifest][manifest].
2. [Choose what it changes][extensions]. The guide shows how to add a dialogue condition, react to a combat hit, or extend the interface. [Code mod hooks](/modding/meitou/code-mod-hooks) lists every hook the client offers.
3. [Check it in game][check]. Enable the mod in the launcher and try the feature. To check that simulation results repeat, run `meitou-tools mod-check` on a save. It compares three runs and reports the first tick that differs. See [troubleshooting][troubleshooting] if the mod fails to load.

[suggest]: https://github.com/mattresspad/kenshi-wiki/issues/new?template=article-correction.yml&article=https%3A%2F%2Fkenshi.wiki%2Fmodding%2Fmeitou
[execution]: https://steamcommunity.com/sharedfiles/filedetails/?id=3838346946
[guild]: https://steamcommunity.com/sharedfiles/filedetails/?id=3834435274
[overhaul]: https://steamcommunity.com/sharedfiles/filedetails/?id=3837593428
[banners]: https://steamcommunity.com/sharedfiles/filedetails/?id=3839659223
[timelight]: https://steamcommunity.com/sharedfiles/filedetails/?id=3839458940
[guide]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods
[quickstart]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#a-code-mod-in-five-minutes
[manifest]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#the-manifest
[extensions]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#what-you-can-register
[check]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#checking-your-mod
[troubleshooting]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#troubleshooting
