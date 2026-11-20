---
articleId: modding/meitou/porting-re-kenshi-mods
title: Does my RE_Kenshi mod need a port?
description: Separate an existing mod’s records, assets and runtime behavior, then test one feature on Meitou. Follow a community mod from its right-click menu to its game order.
categories:
  - Modding
  - Guides
layout: modding
---

MeitouClient does **not** load existing RE_Kenshi plugin DLLs. A mod that depends on one may also contain dialogue, town records, meshes or textures you can use. Pick one thing a player can do with your mod and find out which pieces make it happen. [Meitou’s code-mod guide](https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods)

## Write down one player action

Start in the original Kenshi setup where the feature works. Record the Kenshi, RE_Kenshi and mod versions, dependencies in load order, and the character, item or location you need. Perform the action. What did the player see? What should happen if the prerequisite is missing? If the feature changes the world, save, quit, and check what’s still there when you reload.

For example, “the gatekeeper recognizes my goggles” gives you a short test. Speak to the same keeper with the goggles equipped, then move them into the character’s inventory and speak again. Write down both responses. You can now test the dialogue record and the condition that chooses the line separately.

## Decide what to bring across

Use a fresh Meitou profile and a disposable save. Record the client release, enable the minimum data and dependencies for this action, then repeat it. Use the first difference you observe to choose the next step.

| Where the behavior comes from | What to try |
| --- | --- |
| FCS records or art | Load the existing data mod and its assets. Check that the right character appears, the mesh draws, or the dialogue line is reachable. Record exactly which part worked. |
| Meitou or an existing framework | Try the built-in behavior or a small pack that depends on the framework. For example, a [saddle pack](/modding/meitou/make-a-saddle-pack) chooses an animal and seat while Transport supplies the movement. |
| Code with a documented Meitou equivalent | Choose one [extension point](https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#what-you-can-register), such as a dialogue condition. Follow the [C# quickstart](https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#a-code-mod-in-five-minutes) and [manifest reference](https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#the-manifest) for the release you will test. Implement that one action and repeat the comparison. |
| An operation you can’t find on Meitou | Describe what the old plugin did, when it ran, the smallest setup that reaches it, and what the player sees on each client. An unanswered question about one operation is enough to share. |

## Follow a right-click order in Execution

Jame’s **Execution** is a Meitou-native mod. Start with its menu choice and follow it to a moving character. The steps below follow **Execution 0.5.0**, revision **8d83166**. Its author reports testing on **MeitouClient 0.20.1**. [Author’s controls and compatibility notes](https://github.com/teppuM/meitou-execution/blob/8d83166908bf802b7089e0378d6aa816e57a8d97/README.md)

1. Select a squad member and right-click a living, downed character outside your squad. The menu adds **Violence…** for an eligible target. The mod checks the target and selection when extending the client’s menu. This part depends on the menu implementation in that client version. [Menu conditions](https://github.com/teppuM/meitou-execution/blob/8d83166908bf802b7089e0378d6aa816e57a8d97/MenuPatch.cs#L60-L78)
2. Choose **Execute** in the submenu. The choice queues an `ExecuteOrder` carrying the selected character IDs and the target ID. [Submenu callback](https://github.com/teppuM/meitou-execution/blob/8d83166908bf802b7089e0378d6aa816e57a8d97/MaimMenu.cs#L119-L128)
3. The mod registers its execution system at startup. That system consumes the order and sends the nearest eligible selected character to the target. Seeing the menu and seeing the character carry out the order are two separate checks you can make in game. [System registration](https://github.com/teppuM/meitou-execution/blob/8d83166908bf802b7089e0378d6aa816e57a8d97/ExecutionMod.cs#L21-L25) · [Order handling](https://github.com/teppuM/meitou-execution/blob/8d83166908bf802b7089e0378d6aa816e57a8d97/ExecutionSystem.cs#L293-L346)

## Two field notes on checking a result

**Dune Gate · local terrain and navigation trial, Meitou 0.20.0.** One East Gate Keeper spawned as a household resident with the fallback disabled. He climbed 24 units on an authored slope. After saving on the landing and restarting the client, the same keeper returned at the recorded position and walked down. This run began with an empty navigation cache and used a private install with a generated heightmap and three authored navigation seeds. Those files were part of the local test setup.

**Stoat Scout · local two-window trial, Meitou 0.20.0.** The guest could issue an order and read changing coordinates while the Scout on its screen stood still. The later loopback trial showed the Scout walking out and back on the guest display using the host’s position, facing and animation. It exercised one assigned character in two processes on one computer and used a private snapshot hook specific to that release. The proposed two-Wanderer session is a further gameplay test. The gameplay reference was [nhoral’s KenshiCoop](https://github.com/nhoral/KenshiCoop).

## Share a tested port

If you bring a feature across, [send the wiki a before-and-after example](https://github.com/mattresspad/kenshi-wiki/issues/new?template=article-correction.yml&article=https%3A%2F%2Fkenshi.wiki%2Fmodding%2Fmeitou%2Fporting-re-kenshi-mods). Include the original mod and creator’s credit, both setups, one action another player can repeat, and what they should see. A partial result is welcome. Naming the one step that still needs an equivalent gives the next author somewhere to start.
