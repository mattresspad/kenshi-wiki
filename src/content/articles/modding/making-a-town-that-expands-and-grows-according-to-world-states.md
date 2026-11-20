---
articleId: making-a-town-that-expands-and-grows-according-to-world-states
title: Making a town that expands and grows according to world states
description: This is a sub article for the Creating New Towns guide.
categories:
  - Modding Guide
  - Modding
  - Making towns
layout: modding
---

This is a sub article for the [Creating New Towns](/creating-new-towns) guide.

## How to make a town that reacts and changes throughout the game

You cannot actually make the game to add houses to the game, but you can swap invisible houses to visible ones, and thus make the town appear to be growing.

For the invisible houses I recommend a tiny flat mesh with totally invisible texture. You can use this one: [https://steamcommunity.com/sharedfiles/filedetails/?id=3375727227](https://steamcommunity.com/sharedfiles/filedetails/?id=3375727227)

This guide assumes you already know how to make towns and use world states as a boolean (see [Dialogue Structure Overlook#Booleans](/dialogue-structure-overlook#booleans)) and understand how squads select the houses they spawn in.

### Getting started and building the town

1.  Make or acquire a tiny house mesh and invisible texture
2.  In FCS buildings tab, make a new file or make a copy of the above mod's building file. See image.
3.  Make a plan on how the town changes on which event and who lives in it. Keep a flow chart. The more events you have the more boolean world states can be true at the same time. Keep it simple. I suggest allowing the town to grow, but not shrink. If the town has less resident squads in the future, the old houses just become for sale.
4.  Create a new town in FCS. One cannot change the town name with overrides, so make a name that works in all its states. I suggest a location based name, like 'Rocky Hills'.
5.  You can use vanilla houses, but I recommend making your own copies of them so you can make custom interiors and know exactly who lives in which house.
    -   If you use vanilla houses, you may not have full control which houses are left for sale.
    -   Also if you swap out vanilla houses, all said houses INCLUDING THE HOUSES IN THE CENTER (A0 tier) will be swapped.
    -   For the illusion to work you need the town to grow from its center outwards and using vanilla houses might result in huge gaps between inhabited houses.
    -   Also for you to be able to control what houses get replaced, they all need to be uniquely named so you will need more options than just the vanilla ones. They can all be copies of vanilla houses, you just need the unique stringIDs to control the swapping.
    -   I recommend planning ahead and creating a new house per vanilla house for each tier. Fe, A bar would be A0Bar when the player first spawns in the game. After event A1 all bars in Rock Hill would be then swapped to A1Bars, then A2Bars and so forth. You would need A0-A3 versions out of all shops, inns and residential houses not forgetting barracks, gates, walls, wells, street lamps and turrets if ya wanna swap them too.
6.  Decide where this town is situated and create a temporary custom game start that spawns in a town near the chosen location and run there. Save the game.
7.  Place the town marker. Build the maximum version of the town by your design.
    -   You must have a plan which houses get to be replaced with what.
    -   Generally you want in the middle of the town the houses that are always there, the second tier made out of your 2nd tier houses a ring around that and the third expansion a ring around that.
    -   Be careful, you do not want accidentally swapping the outer ring before the middle ring etc. Use the largest houses that can ever be swapped there. This ensures there never will be houses overlapping.
8.  Save to your mod.

### Setting up the town overrides and building swaps

1.  Plan what events you want to affect the town and make a boolean faction and a world state for each.
2.  You need to make one override town per each event you want to change the town.
    -   Technically you can have two or more boolean world states as a condition for an override, but it means they all have to be true for the override to apply.
    -   Meaning; the more events that can happen at the same time, the more town overrides you have to set up. Fe. you have conditions A1 A2 and A3, after A1 event the town gains a new tier (circle) of houses, same happens after A2 and A3. Straightforward, you only need 3 overrides.
    -   But what if you also have an event B1? Lets say B1 allows a new faction, the Nabateans, also live in this town. So you would have to make SIX overrides: A1, A2, A3, and A1B1, A2B1, A3B1.
    -   Adding an event C1 where the HN bully the Nabateans, so you need to add Holy Nation squads to the mix as well. That makes NINE overrides to make: A1, A2, A3, A1B1, A2B1, A3B1 and A1B1C1 , A2B1C1 , A3B1C1 . Luckily you can remove the Holy Nation from the town by simply turning the C1 world state off. Just be careful not to turn any of the A conditions off. Set the chosen boolean world states as a condition for each override town.
3.  Create a **town owning tool faction** for each override.
    -   And YES the town needs to be owned by a different faction after **each** override. This is because building replacing is faction based.
    -   You do not have to set the residents to belong to this faction, each squad can belong to any.
    -   This tool faction name will be seen on every building the player left-clicks on to, so make it something immersive.
    -   Technically all the factions can be named identically fe, 'Rocky Hills' which is the town name. You just need to somehow keep track which is which while you set them up. Maybe use numbers and just remove the numbers just before release.
4.  Create building swaps for each **tool faction** that owns the town after each override event.
    -   The **building replacements** are set in the faction panel, not in the town panel.
    -   You need to make a new item per each house type separately. Under _to replace_ goes the item that goes away and under _replace with_ the new building.
    -   So in the A1 case, where the town grows a tier, all the invisible houses that you have named as A0Bar will be replaced with houses you have named A1Bar. And naturally the event A2 makes all A1Bars to A2Bars etc.
    -   You cannot have all houses in the second ring be copies of one single invisible house, cause the building replacements would turn them all into the same houses after the swap. They would all be the same on every override. If they are just residential, maybe that is fine, but it would look very boring them all to be fe, storm houses, no variation at all.
5.  ,,,,

Remember, the building replacements swaps the houses **that you built in the game**. So if you built using the largest house possible that is your A3Bar then you must set up the swaps to change from A3 to A0 on game start and then all events will do from A3 to A1, then A3 -> A2 and so forth. A0 houses would be the tiny invisible houses, except the ones you want to always be there at the center, if any.
