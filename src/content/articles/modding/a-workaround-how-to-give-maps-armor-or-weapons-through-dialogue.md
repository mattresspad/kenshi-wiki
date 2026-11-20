---
articleId: a-workaround-how-to-give-maps-armor-or-weapons-through-dialogue
title: A Workaround How To Give Maps, Armor or Weapons Through Dialogue
description: The item given is conjured from nothing, does not need to be in the NPC's possession.
categories:
  - Modding Guide
  - Modding
  - Dialogue
  - Give item
layout: modding
---

WIP

This information is from Boron & Lucius.

The item given is conjured from nothing, does not need to be in the NPC's possession.

## How to give maps, weapons or armor via dialogue

This is based on the fact, that through dialogue an object is given using its StringID. The game only checks if an item is 'givable' when the modder adds the item on the dialogue using the give item drop down. The list is populated by object type, _**defined in the fcs.def**_ file (in Kenshi installation folder). Although the fcs.def allows only one object type listed there, one can change that **any time** as long as they restart the FCS each time they want to change object types.

Thus, it is possible for one single NPC, **in one dialogue give multiple different types of objects**. Each item just has to be set on a different _dialogue line._ And one must take care to not accidentally change the item once the fcs.def is changed for a different type (or you would have to do the change again).

1.  Set up your NPC and their dialogue normally. Set a separate line of dialogue for each item.
2.  When you are ready to add the item, open its file and see what object type it is.
3.  Save and close fcs entirely.
4.  Click open fcs.def (you need either Visual Studio Community or Notepad++)
5.  Edit line 875; give item (in yellow below) Replace the word ITEM (in blue below) with the object type you want, all caps with underlines if any. Do not change the boolean (1).
6.  Save the fcs.def and open FCS again.
7.  Add the desired object to the dialogue line normally using the give item feature. The drop down menu is now populated with your chosen object type.
8.  Repeat steps 5 to 7 for each item type you want to give to the player. It may be this NPC only gives armor, if then you do not need another change.
9.  Do not forget to change the fcs.def line 875 back to ITEM after you finish.

### Weapons

Weapons are a bit trickier, as they are divided into Manufacturer groups. Meaning you can only put the WEAPON\_MANUFACTURER on the fcs.def file, and doing so your give item list will only be populated with weapon manufacturers. But that is the ONLY WAY to get textured weapons, because the texture is attached to the manufacturer of the weapon. So if you put WEAPON on the line 875, you would get the mesh reference, and not a weapon with stats and a texture. **It will also crash the game.** HOWEVER this means you cannot pick one special weapon to be given UNLESS you make a special manufacturer with only that one weapon in the list.

### What Object Types are compatible?

Any item that can be put inside the player inventory. I would assume buildables will probably crash the game.

If you find it under the Item category in FCS, it should work, excluding naturally the material files and such sub files. Containers below refer to bags.

ITEM, MAP\_ITEM, ARMOR, CONTAINER, WEAPON\_MANUFACTURER, CROSSBOW, NEST\_ITEM, CHARACTER\_PHYSICS\_ATTACHMENT, LIMB\_REPLACEMENT

And YES the same trick also applies to **target has item** on the line 886. But the item may not be equipped when the NPC does the testing.

Note we have not tested all these, so please comment below if you crash or something. Rumor has it one can also give RESEARCH. These works also as special items, but alas RESEARCH crashes the game as special items.

Speaking of, yes this method works as both research cost and material cost in machines. In theory, I did not test if they make the game crash.

Lucius also has this info [https://steamcommunity.com/workshop/filedetails/discussion/2909495250/3887227031502321150/](https://steamcommunity.com/workshop/filedetails/discussion/2909495250/3887227031502321150/)

_"\[Note that changing item type like this, given\] crossbows and prosthetic limbs are level 0 and are displayed as prototype grade._

_Armor is also level 0, but is treated as level 100, so it will have a performance level higher than the masterwork level 95. (The grade is not displayed, but the price and weight follow the inventory settings.)"_



See also [A Workaround How to Make Weapons Lootable by NPCs](/a-workaround-how-to-make-weapons-lootable-by-npcs)

### List of FCS.def file lines where you can use this workaround

Always remember to change it back after, so you do not forget you changed it later when you wonder why you do not get items for your inventory.

<details class="collapsible" open=""><summary>Show table</summary><table class="wikitable sortable"><caption></caption><tbody><tr><th>Description</th><th>Line</th><th>Original Type</th><th>Tested?</th><th>Notes</th></tr><tr><td>NPC shopping list</td><td>595</td><td>ITEM</td><td>PARTIALLY</td><td>Not all types tested</td></tr><tr><td>Dialogue: NPC give item to player</td><td>875</td><td>ITEM</td><td>YES</td><td>Target must have enough inventory space.</td></tr><tr><td>Dialogue condition: target has item</td><td>886</td><td>ITEM</td><td>PARTIALLY</td><td>Must not be equipped, not all types tested</td></tr><tr><td>Character: inventory</td><td>592</td><td>ITEM</td><td>YES</td><td>Character must have enough inventory space.</td></tr><tr><td>Race: special food</td><td>1500</td><td>ITEM</td><td>NO</td><td>We have no idea what would happen if a character ate a prosthetic limb XD<p>I would assume it would not be eaten when equipped.</p></td></tr><tr><td>Race: severed limbs</td><td>1498</td><td>ITEM</td><td>NO</td><td>Would be funny to drop armor, but there is a crash risk with rigged items and physics. Do test and report back.</td></tr><tr><td>Research: cost</td><td>1587</td><td>ITEM</td><td>YES</td><td>Note: studying an object will consume it</td></tr><tr><td>Research: enable item</td><td>1593</td><td>ITEM</td><td>NO</td><td>All object types already have their own research unlock</td></tr><tr><td>Character: death items</td><td>94</td><td>ITEM</td><td>NO</td><td></td></tr><tr><td>Building: construction cost</td><td>413</td><td>ITEM</td><td>NO</td><td></td></tr><tr><td>Building func: consumes</td><td>516</td><td>ITEM</td><td>PARTIALLY</td><td>Should work regardless</td></tr><tr><td>Building func: item crafts</td><td>518</td><td>ITEM</td><td>NO</td><td>Most items already have their own category.</td></tr><tr><td>Building func: produces</td><td>519</td><td>ITEM</td><td>NO</td><td>Do note there already is a separate type for prosthetics, armor and weapon crafts.</td></tr><tr><td>Building func: special tool</td><td>521</td><td>ITEM</td><td>NO</td><td>See <a href="/special-tools">Special Tools</a>. Must be a non-rigged mesh object. Cannot use meshless items. I would venture this is one of the lines you actually cannot use any other object type.</td></tr></tbody></table></details>
