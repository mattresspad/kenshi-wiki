---
articleId: how-to-make-a-war-campaign-or-trader-visit-about-ai-campaigns
title: How to make a War Campaign or Trader Visit About AI Campaigns
description: "You have two options for sending an AI campaign: territorial or dialogue."
categories:
  - Modding Guide
  - Modding
  - Wip
layout: modding
---

WIP


You have two options for sending an AI campaign: territorial or dialogue.

**Territorial campaigns** trigger on their own based on the frequency and distance set in the trigger file (FACTION\_CAMPAIGN).

**Dialogue campaigns** trigger from a dialogue, usually PLAYER\_TALK\_TO\_ME but they can be triggered from any of the dialogue events.

Both are set up exactly the same on the trigger file, but Territorial Campaigns require **a town set to that faction** somewhere in the world. The town does not need residents of buildings, just a town marker somewhere. Do note, that even TOWN\_NULL will trigger a 'Discovered <INSERT TOWN NAME>' notification to the player. The faction must also have the campaign set to it for it to trigger and the squads used must have suitable AI packs, at least patrol map.

Dialogue Campaigns require a **NPC of that faction** to trigger the campaign.

There can be **only one campaign** coming/active from a faction at a time. So try not to make new campaigns for vanilla factions. If you do, make sure the world states prevent two campaigns to be possible at the same time. And this naturally means your mod is incompatible with other mods who add campaigns to the same faction.

### How to set up the campaign

1.  Copy any of the vanilla campaigns, try to pick one closest to the type you are meaning to do: **trader, tax or attack**
2.  Change the squads used or keep them
3.  **Victory Trigger:** what happens when this squad wins in the fight against the player, does it trigger a new campaign? The same campaign? Nothing? Does not trigger if the squad leaves peacefully.
4.  **Loss Trigger:** what happens when this squad loses in the fight against the player, does it trigger a new campaign? The same campaign? Nothing? Does not trigger if the squad leaves peacefully.
5.  **Announcement**: very important, this makes or breaks your campaign. It is a monologue with interrupt to a PLAYER\_TALK\_TO\_ME dialogue. It is up to you what you put in these dialogues, but the important bit is they need Dialogue Actions of DA\_RETREAT\_PHASE, DA\_ASSAULT\_PHASE or DA\_VICTORY\_PHASE. The latter triggers also the _Victory Trigger._
