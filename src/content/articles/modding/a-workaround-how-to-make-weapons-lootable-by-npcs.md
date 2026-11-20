---
articleId: a-workaround-how-to-make-weapons-lootable-by-npcs
title: A Workaround How to Make Weapons Lootable by NPCs
description: This information is from Boron and Lucius.
categories:
  - WIP
layout: modding
---

_**This article is a Work in Progress. It may contain out of date or incomplete information.**_

This information is from Boron and Lucius.

## You can make weapons lootable by bandits by making Kenshi think the sword is bread.

_"It's dumb and should probably only be used for some random junk swords."_

You can edit the fcs.def file with Visual Studio Community or Notepad++.

1.  Add missing info to the base item category (ie where bread and bandages etc are) for weapons (eg sheath data, combat data)
2.  Add a weapon but make it ITEM itemtype
3.  Set the item function to FOOD\_RESTRICTED. Now the sword is inedible bread
4.  Replace an NPC or Vendor's weapon reference with the bread sword
5.  For some reason when a sword is generated, the weapon manufacturer yeets a bunch of the information (like the "possibly edible" tag) and replaces it with weapon info. So now you've got an actual sword that Bandits think is a food item, and they'll steal it



Boron: _"You need the sword to be the base ITEM type, with function set to FOOD\_RESTRICTED. You then need to copy a bunch of info from the \[WEAPON\] entry in fcs.def to the ITEM entry (can't remember exactly what you need off hand), and make a new item entry, adding the data (eg sheath mesh, bare sword mesh, etc) to your item. Then that item needs to be added to an NPC as a weapon by changing weapon: WEAPON to weapon: ITEM_

_Type of thing idk if I'll even use—if Ido it'll be for some of the low level swords only because it's not like a bandit looting it will trigger the stealing weapon dialogue. Don't want the player to miss the fact that the bandit is taking their expensive sword, that's lame. This only works with weapons, not armour. Or rather, it might work with armour, but you still have things like \[Possibly edible\] in the armour description; for some reason the weapon manufacturer data overrides a bunch of information in the UI tooltip"_





See also [A Workaround How To Give Maps, Armor or Weapons Through Dialogue](/a-workaround-how-to-give-maps-armor-or-weapons-through-dialogue)
