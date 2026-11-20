---
articleId: how-to-use-the-part-map-aka-how-to-make-the-skin-invisible-under-clothes
title: How to use the part map aka how to make the skin invisible under clothes
description: A part map/invisibility map is a mask, which tells the engine which parts of the character skin texture corresponds to which color entry. This is used in the…
categories:
  - WIP
  - Modding
layout: modding
factTitle: A mod loaded after yours, may overwrite the part map
factGroups:
  - heading: null
    rows:
      - - Row1
        - If another mod with a different part map is loaded after your mod, it will overwrite the part map in your mod. And who knows how the colors are put on that map.
      - - Row2
        - So suddenly the green on the stomach might be covering the hands. And if your mod uses the green to prevent the stomach from clipping through; tada unintentional invisible hands.
      - - Row3
        - Using the community part map helps, as if everyone uses that then there are no clashes.
      - - Row4
        - However, it is known the Community Part Map is limited and does not have allowance fe. to hide genitalia of nude mods.
---

_**This article is a Work in Progress. It may contain out of date or incomplete information.**_

### What is a part map?

A part map/invisibility map is a _mask,_ which tells the engine which parts of the character skin texture corresponds to which color entry. This is used in the armor FCS file to mark which parts the user wants to make invisible to prevent the skin from showing through the clothes (clipping).

Unfortunately this system in Kenshi has major limitations; firstly you cannot set a part map for every clothing item, you can only have one part map **per race** for males and one for females and the part map has to suit all clothes. This would be fine, if we had more colors, but we have access to only the nine: _**white, red, yellow, magenta, green, cyan, blue, purple and orange.**_ For this reason we cannot have allowance for different length of sleeves, pants, boots, necklines or gloves.

The biggest issue with it used to be different mods using different part maps, causing armor A from mod A in combination of mod B to cause hands to disappear. And this is still the case for some nudity mod users, as the nudity mod makers need to shuffle the colors about to get a free color for the genitalia.



The issue was communally mitigated by releasing the Community Part Map. So majority of mod creators will use that to make parts invisible under their armor.

Above you see the vanilla part map. It only hides armpits, chest and stomach. The Community Part Map below grants more options for invisibility.





### How to use the Community Part Map

You have two options, you can either include the Community Part Map as a part of your mod, or you can state on your mod's Workshop page the Community Part Map mod is a dependency the subscriber need to also subscribe to.

In the first case, you make a folder inside your mod named 'character' and inside that folder you make another folder named 'skins' and inside that a third folder named 'masks'. All lowercase. In the masks folder you put the copies of all the part maps you want to use. The Community Part Maps are already named the same as the vanilla masks, so every race using the vanilla part maps will automatically use the Community Part Maps.

### How to set up the colors to your armor

When you open the armor file in FCS, you can select colors from the hide parts menu and the engine will turn all the body parts corresponding to the colors invisible, when wearing your armor.

Be careful not to set your pants to use any of the torso colors or vice versa.



## FAQ

#### Q: Do I need to use the part map?

**A**: No, and it is actually better for your subscribers if you do not, just because there is always the possibility some other mod replaces the community part map and makes your armor unintentionally turn fe, the arms invisible.

#### Q: Why does clipping happen in the first place?

**A**: Clipping happens because the clothing mesh and the body mesh do not have the exact same weights and exact the same vertex layout. When an animation plays, the body moves differently from the armor.

This is the situation in all cases if you are porting a 3rd party armor mesh or you made the armor without copying the body mesh. Only clothing made from editing the actual character body mesh **can** be 100% no clipping without a part map. **The other option is large and baggy clothing**, which allows unaligned movement.

Naturally adding sliders to the mix will complicate the clipping issue. To have a 100% no clipping armor, you need a 100% matching mesh to the body mesh AND the same sliders applied to the armor as the body has.

Add custom character races to the mix and you see why most modders either ignore clipping issues, use the Community Part Map or just make the armor baggy.

#### Q: Why people do not just add more colors to the list?

**A:** We can add color names to the list, but we **cannot** make the new color names to function, the nine colors are hard-coded to the game engine and we cannot add new functional ones.
