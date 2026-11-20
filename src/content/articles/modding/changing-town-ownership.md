---
articleId: changing-town-ownership
title: Changing Town Ownership
description: This is a guide to how to alter the controlling faction of a town before starting a game and while having already started a game by fiddling with the save fi…
categories:
  - Modding
layout: modding
---

This is a guide to how to [alter](/category/modding) the controlling [faction](/faction) of a town before starting a game and while having already started a game by fiddling with the save file with the use of the [Forgotten Construction Set](/forgotten-construction-set).

See also: [Making a town that expands and grows according to world states](/making-a-town-that-expands-and-grows-according-to-world-states)

## To make the town originally of another faction

Before having started any game, to change the town ownership in the FCS one has to:

1.  Open the FCS and create a new mod while having the 4 base files loaded.
2.  Click "done" and go to the "Towns" menu.
3.  Double-click on the town you want to edit and add the new faction that is going to control the town in the "faction" option.
4.  Remove the old faction.

## To make the town change ownership mid game upon player interaction using World States

1.  Take a duplicate of the town in FCS or make a brand new town. Override towns are always named the same as the original town.
2.  Change the things in that duplicate to your liking, the new faction, building replacements etc.
3.  Add the new town as an override in the original town file
4.  Set up a world state, usually it is an unique NPC that needs to be dead
5.  Put that world state as a condition on the duplicate town
6.  Test; Import or start a new game, kill the world state NPC, go away so the town unloads and then go back to see the town changed!





## How to change the ownership of the town mid game manually without using World States

After having started a game, to change the town ownership in the FCS one has to:

1.  Open the FCS and load the save file in "open any".
2.  Use the search bar to find a town of the recipient faction.
3.  Open the town state for any town you want the recipient faction to own (the Hub, for example) and change the controlling faction to the recipient faction.

These methods work the same way to make the player faction (Nameless) the new owner of the town.

Do note that it was never intended for the player to gain ownership of towns, so all these are cheats and may cause unforeseen problems. Also, this is a "good" way to avoid raids, as the raiders get confused where your outpost is if you build another one besides the town.

It is heavily advised when changing the town ownership to the player faction (when using the manual method) to do the following:

1.  Go to town you want to claim.
2.  Open the ingame editor with "SHIFT + F12".
3.  Select Town Placement and search for the name of the town you are in.
4.  Click on the name of the town you are in and then the town marker statue should vanish.
5.  Find "Your outpost" in the town placement menu and place it where the old town marker was.
6.  Save the changes to your mod, save the game and reload the save so that changes are applied.

Do note, that if the town marker change is not saved to a mod, it is very likely next time you import the town ownership goes back to original owner.
