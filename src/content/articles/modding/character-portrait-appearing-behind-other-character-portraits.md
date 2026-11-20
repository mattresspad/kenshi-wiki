---
articleId: character-portrait-appearing-behind-other-character-portraits
title: Character portrait appearing behind other character portraits
description: I have now figured out why a custom race's portrait is missing and why the character appears behind everyone else's portrait.
categories:
  - Portrait
  - Custom Character/Race
  - Modding
  - How to change animation strip name
  - Blender
layout: modding
---

_I have now figured out why a custom race's portrait is missing and why the character appears behind everyone else's portrait._

There are two reasons and two fixes:

## Reason: No additional skeletonless mesh

This is an easy fix.

#### RACES WITH VANILLA ARMATURE

1.  After you have exported the skeleton and mesh proper, and inserted them in the female\_skeleton and male\_skeleton folders inside your mod, create a **third folder** under character/meshes called **human**
2.  Export each custom mesh a second time **WITHOUT exporting the skeleton**/armature. You MUST export this with another name than the mesh proper. Untag both export animations and export skeleton. The armature needs to still be selected last, just do not export it the second time.
3.  Copy the secondary meshes to the human folder inside your mod.
4.  Change the reference of the race's mesh in FCS race file to point to the mesh inside your human folder.

This one will also fix the no character portrait issue, if the race actually has the photobooth (aka head) bone in the correct location and there are some normals assigned to those bones. Cannot take a faceshot if no face, yeah?

#### RACES WITH A CUSTOM ARMATURE

1.  You MUST rename the skeleton in Blender and export the mesh with the skeleton normally
2.  Put the mesh and skeleton inside identically named folder that is located in character/meshes. So, if you renamed the armature in Blender horse\_skeleton, then the folder needs to be called horse\_skeleton as well.
3.  Yes. Make also a secondary mesh.

## Reason: skeleton and mesh disjoint

_it is because you have at one point imported already imported mesh and skeleton in Blender. When you import once exported mesh&skeleton, Blender automatically saves the naming of the skeleton to your custom name. Renaming the skeleton in Blender does not help as the name change happens when you export the thing the first time._ Also renaming the mesh and skeleton after exporting, will cause the portrait to not work. Edit 12 dec 2024: if it is a humanoid race the armature in Blender must be either female\_skeleton or male\_skeleton (and you want the race to be able to use animations others have made). But if it is a custom armature, then you must name the armature something else in Blender and they cannot use 3rd party animation mods (unless specially made for this race) -Cattrina

To circumvent this

1.  Export the char as male\_skeleton or female\_skeleton respectively.
2.  Then import it to a Blender session that already has a vanilla/untainted skeleton imported.
3.  If your skeleton has custom animations, copy the animation data to the old skeleton
4.  No parenting, delete both meshes and the tainted skeleton.
5.  Rename all the animation tracks so they do not have .001 at the end.
6.  Select the untainted/vanilla skeleton and import the custom mesh again. This time select the option to 'Use selected Skeleton'. No parenting.
7.  Now you can export the custom character mesh with the untainted/vanilla skeleton


I am wary if this can be used to fix custom skeletons. It looks like this works only if you have an untainted version of the custom skeleton saved you can use. You would have had to have done that intentionally to save a backup, and frankly if you were not aware of this issue, why would you have done so? Just exporting it as (fe)male\_skeleton, importing in clean blender and re-exporting as proper name, is not enough.

If that does not work, then open a file with the untainted skeleton and import your latest skeleton in it.

You can transfer animations from your latest skeleton to the untainted one, assuming both skeletons have the exact same skeleton structure and bone names.

### How to copy animation data

1.  Import the original untainted skeleton to Blender, delete all animations in it (this is to save the strip names from changing).
2.  Import the tainted skeleton (Yes it has to be done in this order! The first skeleton on scene will get to keep its name.)
3.  Select the recipient skeleton (untainted) hold shift and select the donor skeleton (tainted), Object - Link/Transfer Data - Link Animation Data

This replaces all animations from the receiver skeleton to the donor skeleton ones. No, you cannot just add one animation to it. It erases old ones first automatically. If you forgot to delete the animations from the untainted skeleton, you might find now that the animation strip names on the tainted skeleton have changed names with .001 at the end. Which means Kenshi cannot play them. You can either redo the process starting from importing the untainted skeleton or you can just rename each strip. For humanoid characters have 166 animations, it can be daunting, but for animals it is usually easy enough.

### How to change animation strip names in Blender

This eluded me ages and google did not help much, as most search results are from forums with misinformation. Managed to spot the correct one, finally.

This is a bit tricky, but you need to open the tools options from the Nonlinear animation window. It is tricky because the scroll down bar is in the way, so the cursor clicks on that instead of pulling the small arrow. That was my issue I tried to pull. Do not pull, **double-click it to open** (since I learnt you can open this with the n key)











Select the strip (in yellow) you wish to rename. Click the name to open edit.

Do note, if you have not selected a strip, the tray opens as dark grey sidebar without text. So, you might end up succeeding opening it without your knowledge. Try selecting a strip to see if it opened.

If you are making a person (or toter), you will have to rename any and all 166 animation strips so none of them have .001 at the end of the strip names. Animals, thank Okran, have a lot fewer animations.
