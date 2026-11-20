---
articleId: creating-a-special-placeable/lootable-item-for-your-town
title: Creating a Special Placeable/Lootable Item for Your Town
description: When making a new town you might want to spice it up with items, that the player can pick up/loot from it.
categories:
  - Modding
  - Town making
layout: modding
---

By Cattrina

When making a new town you might want to spice it up with items, that the player can pick up/loot from it.

Your first initial might be to have a character spawn with the item, take it to a building and then drop the item. However the game has an auto-despawn to all dropped items upon a reload of the region and dropped items are never saved to a mod. What you need to do, is to make a placeable object of the item. Placeables are saved to mods.


Here's a **step by step guide** how to make a placeable clothing item, but it applies to any item in general.

You need a floor mesh for the item, so the player understands what it is. The base game just has this general bundle and the player will prob disregard it. So it has to be special for them to notice. It is preferred it uses the same texture as the garment.


After you have created an armor/garment file in FCS for it:

**Step 1)** create a **low-poly** mesh item to serve as a floor mesh for the garment and add that to your garment file. If you do not how, see this tutorial video series for basics; [Furniture Tutorial Basics](https://www.youtube.com/watch?v=8_QGDOf2xoE)

**Step 2)** Go to items, Placeable Groups in the FCS and create a new file

**Step 3)** Add clothing and a link to your garment

**Step 4)** Load a save of your town, move a char in the building you want the garment in, sift+12 edit interiors and Items

**Step 5)** Find the name of your Placeable and use the ingame editor to place it carefully in the scene.

**Step 6)** When you are happy of the location, save the interior layout to your mod. If you are just adding this item to already existing house you really need to make the house a custom interior layout following this guide (steps 4 and 5) so your item actually spawns along with the interior. https://kenshi.fandom.com/wiki/Creating\_New\_Towns

If the house is in ruins, I think it only has an exterior layout, I might be wrong. So in that case save as exterior layout.
