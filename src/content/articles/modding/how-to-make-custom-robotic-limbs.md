---
articleId: how-to-make-custom-robotic-limbs
title: How to make custom robotic limbs
description: If you know your way around Blender, you can make new robotic limbs for the characters. I'd start importing a vanilla limb on a human skeleton (use selected…
categories:
  - WIP
  - Modding
  - Modding Guide
layout: modding
---

_**This article is a Work in Progress. It may contain out of date or incomplete information.**_

If you know your way around Blender, you can make new robotic limbs for the characters. I'd start importing a vanilla limb on a human skeleton (use selected skeleton) and see how they are set up. If you do not see weights, you are probably using the wrong Blender and plugin version. At the time of writing this (11/2024) The correct version is Blender 4.0.

### Tips

-   Being robotic, they do not need to bend like organic limbs do, so often different parts should have 100% or 50% weights to a bone. A joint should have 50% weights to both bones.
-   Export the limb as you would export any piece of armor.
-   It is recommended to remove all other vertex groups from the mesh than what is absolutely needed.
-   You can take a copy of your limb, mirror it, flip its normals and move it to the other side and you have both sides done with one meshwork.
-   When editing robotic limbs already in the game, import the male skeleton model into blender first, and then with the skeleton selected import the limb. Make sure "use selected skeleton" is checked on the right side of the menu. This will use the rigging already built into the limb

### Setting up the file in FCS

In FCS, duplicate a limb file. Rename it and set the stats of the limb and link your mesh to it.

You can then put the limbs to any vendor lists or research you want. You can also just put it on a character and call it a day.

1.  Open the character
2.  Click the top pull down menu, select robotic limbs
3.  Pick the limb(s) you want the character to spawn with


The character can be an NPC or a player character, if a new game is started. Adding robot limbs to already existing characters require save editing.
