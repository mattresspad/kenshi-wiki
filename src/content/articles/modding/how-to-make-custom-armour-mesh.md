---
articleId: how-to-make-custom-armour-mesh
title: How to make custom armour mesh
description: Rigging a 3rd party character; From A pose to I pose  this video talks about the character mesh, but the process is the exact same if you are porting a 3rd p…
categories:
  - Modding Guide
  - Modding
  - Armour
layout: modding
---

### Video guides:

[Rigging a 3rd party character; From A pose to I pose](https://www.youtube.com/watch?v=OJhFajivYDE) this video talks about the character mesh, but the process is the exact same if you are porting a 3rd party mesh for Kenshi.

[Clothing Basics for Kenshi, a Blender and FCS Tutorial (Clothing 101 )](https://www.youtube.com/watch?v=B8ZYVEhSBjo)

[Kenshi Clothing Basics | Fusing Two Armors Tutorial | Part 1: Meshwork](https://www.youtube.com/watch?v=zaAXFlJSbcs) this tutorial shows how you can edit vanilla meshes to create something new.

[Kenshi Clothing Basics | Fusing Two Armors Tutorial | Part 2: Textures](https://www.youtube.com/watch?v=HWbGeOl0AmA)


See also: [How to make a color map for your armor](/how-to-make-a-color-map-for-your-armor)

## Steps for a completely new, made from scratch armor mesh

1.  Import the female and/or male mesh from kenshi/character/female\_skeleton or kenshi/character/male\_skeleton
2.  Edit the mesh, select all and hit P to promote the selection to a new object.
3.  Hide the original mesh (you need it to see if the body is glitching through the armor) and rename the copy of the mesh with your garment's name.
4.  You have now an identical mesh with correct weights
5.  Make the mesh 1.1 times larger on x and y axis (s x 1.1 and s y 1.1). Do not scale z axis.
6.  A Do your edits to create the garment. Pull vertices, use the knife tool (K) and copy relevant bodyparts if you are making pockets etc, to keep the weights. B add basic mesh pieces and manually paint the weights on them. C add basic mesh pieces, but merge their vertices to the base mesh, so they will get a continuation of that spot's weights.
7.  Unwrap (U) mesh UVs when they are in their simplest form, you can select areas of faces to unwrap them together, you do not necessarily need seams.
8.  Work editing your mesh and your UV map at the same time, UV map need to change every time you add a new piece on the mesh. Sometimes you can use the same part of texture for multiple mesh pieces, fe. buttons do not all need to be separate on the UV map, they can all be placed on top of each other. Belt can borrow your trim texture, or hat can use the back of the jacket. Provided you do not intend to make detailed normal maps and shadows for these pieces.
9.  When you are done, select the mesh, hold shift and select the skeleton. Export with tangents, binormals, apply transform and modifiers.
10.  Make a folder for your meshes in your mod and paste the mesh there.
11.  Duplicate an existing vanilla armor, that covers the same area as the armor you made. This saves you from having to toy with the icon settings.
12.  Change the link to your mod's folder and the item you made.
13.  Make a custom start, with custom squad and set the armor you made as the only clothing option.
14.  Launch the game using your start and run around, walk, sit etc. to see how the mesh and weights perform, do you need to change something etc.
15.  Do your edits
16.  repeat 14 and 15 until you are happy.
17.  Duplicate the normals around the mesh's collar, hem and sleeve edge and turn those inside out.
18.  Export the mesh the last time and test how it looks with the normals flipped. You might have missed a normal and the player can see through the garment etc. Fix if needed.
19.  Import the opposite sex mesh to the same, or another Blender project.
20.  Select the skeleton and import your armor, remember to tag 'use selected skeleton'
21.  Edit the vertex groups, if the old was male and new is female: delete jaw and jawnub vertex groups. If the old was female and the new is male: delete both boob vertex groups.
22.  Test in pose mode if the armor is correctly following the skeleton. If not, you need to parent it. Use empty groups.
23.  Do gender specific alterations to the mesh. Repeat steps 14 and 15 and so on.
