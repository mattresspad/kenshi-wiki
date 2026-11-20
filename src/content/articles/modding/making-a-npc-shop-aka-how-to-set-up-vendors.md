---
articleId: making-a-npc-shop-aka-how-to-set-up-vendors
title: Making a NPC shop aka how to set up vendors
description: This guide entails NPC stores in towns or outposts; it does not deal with traveling trade caravans or player-owned shops.
categories:
  - WIP
  - Modding Guide
  - Modding
layout: modding
---

_**This article is a Work in Progress. It may contain out of date or incomplete information.**_

This guide entails NPC stores in towns or outposts; it does not deal with traveling trade caravans or player-owned shops.

When you are making a shop to your NPC town, you might face an odd error; the shopkeeper trade window opens, but there is nothing in it, even if you made sure the list is correctly set up. This happens because you do not have a shop counter in that chosen interior layout.

Read more about interiors and exteriors here: [Creating New Towns](/creating-new-towns)

**To function a NPC shop must have**

-   a squad with vendor list (and items in the list)
-   a shopkeeper with the dialogue
-   a house
-   a shop counter

You start with setting up the house in the game (assuming you have a town already), using the in-game editor. Next choose the exterior and interior layouts from the list or make your own. Make sure the chosen interior layout contains a shop counter.

Write the names of the interior and exterior layouts on to the squad you want to spawn in that shop house.

Choose a character of the squad to be the shopkeeper. Usually it is the leader, but anyone can be one. Set a dialogue or dialogue pack for the shopkeeper in the squad file, not as an individual character. The shopkeeper uses the squad's vendor list.

Then add how many vendor lists you want. The combined inventory item count is pulled from these lists by the chance you set up. Note also items inside vendor lists can have their own chances to spawn. For best result, it is always recommended you replace with a copy any vanilla vendor list you want to use, so you do not accidentally make changes to vanilla lists.

### Can I have multiple vendors in the same shop?

Technically yes. You can have **a bar** with caravan sellers as bar squads. The trick is the caravan must have pack beasts as item storage. But nothing prevents you from making fe. invisible pack beasts for immersion purposes. Best way to ensure you have all things you need, is to duplicate the vanilla caravan squad. What you need to do to it, is to make a copy of the dialogue and remove the conditions from the player\_talk\_to\_me.

**To function a secondary vendor must have**

-   a squad with vendor list (and items in the list)
-   a leader with the dialogue
-   a pack animal with a backpack
-   set as bar squad in the town
-   have a 'hang out in bar' AI pack (you can make your own version with additional behavior)
