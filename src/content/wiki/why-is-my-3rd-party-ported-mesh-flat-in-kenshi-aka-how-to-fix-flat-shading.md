---
title: "Why is my 3rd party ported mesh flat in Kenshi: AKA how to fix flat shading"
description: "WIP This tutorial is a sub page for the skin making page. DO NOTE: if you used the wrong Blender & plugin combination, it can also result a mesh not shading…"
source:
  title: "Why is my 3rd party ported mesh flat in Kenshi: AKA how to fix flat shading"
  revision: 95549
categories: ["WIP","Modding Guide","Modding"]
---

WIP This tutorial is a sub page for the skin making page. DO NOTE: if you used the wrong Blender & plugin combination, it can also result a mesh not shading properly. Blender 4.0 and [Kindrad's plugin](https://codeberg.org/Kindrad/Kenshi_IO_Continued) is recommended. For newer Blender versions, see [Blender plugins](/modding/blender-plugins).

You did a great effort and finally managed to port a 3rd party mesh into Kenshi, only it to look flat. No matter how much depth your normal map has, the shading never looks three dimensional. Why?

The mesh uses symmetry! All its body parts are the same! Left and right leg are using the SAME location on the UV map. This means Kenshi's shader cannot tell left and right apart. The only way to fix it properly, is to make a secondary UV set for the right side.

You can confirm if symmetry is the issue for you in texture paint in Blender. Paint right or left side, does the color appear on the other side too? If, the mirrored symmetry is used and left and right side need to be separated.

## Analyzing the mesh to see if symmetry is the cause of the issue

This is my test, I am in texture paint and I used blue to paint left and then pink to paint right. After I finished I noticed both sides are now pink. XD

This confirms symmetry is the cause of our flat character.

## Fixing the symmetrical UVs on the mesh in Blender

The fix is: move the right or left side one UDIM to the side, and then make an atlas of the textures (normal, mask and diffuse).

1.  Step 1: **select half of the character,** left or right side (but DO NOT divide individual pieces in half, always select the entire piece, even if it spans both sides, or you get a seam). I did left. This is very tedious you need to be careful to select all small pieces on the hand fe. It does not matter if you select pieces that span both sides, what matters is left and right are separated, it does not matter if shared(central) piece is part of which UDIM, what matters it is on that side ENTIRELY.
2.  Step 2: **Move selected UVs to right.** Hover your mouse on the UV side, select all UVs (A), do **G + X + 1**. This moves the selected UVs right one UDIM Now when you select all mesh on the mesh side, you see half of it is left and half right. **At this point, if you want to, you could also separate the pieces belonging to the head, and move those UP one UDIM** (G + Y + 1). Make sure it will also have the same aspect of the UVs (meaning at least one piece on right and left UDIM). If you did what I did, half of it is already on the side.
3.  Step 3: **Adjust the image aspect ratio**: New image > 2048x1024 (this does not matter what this is in Blender, as long as it is the correct aspect and in binary. It does not have to be the same size as your texture is going to be). I have the head in two parts on above UDIM.
4.  **Scale** the selected UVs sideways in half: **S + X + 0.5**
5.  **Move** the selected UVs left half a measure: **G + X + -0.5** (negative in front is important)
6.  **Export** the mesh the usual way (twice, once with the skeleton and animations and once without (armature selected in both)).

  

  

## Making texture atlases using Gimp

To adjust the textures, you need to make double wide texture and use the object alignment tool in Corel or Transform Tools > Align in Gimp to set the two identical blue normals and diffuses perfectly side by side. The following flow is for Gimp. Do this to all three; the blue normal, the diffuse and the mask. If you separated the head, you need to make a different mask for the head. See also: [Making a character with glowing eyes or body](/making-a-character-with-glowing-eyes-or-body)

1.  Create a new image (File > New) in horizontally twice the size of your original texture, but same height. Fe. if the original is 1024x1024 the new file is 2048x1024.
2.  Open the original textures twice as separate layers (you have now two identical images on top of each other).
3.  Select one layer and use Tools > Transform Tools > Align and Distribute, relative to selection and use the little tags (anchor points) to move the layer. Repeat for the second layer in the opposite direction.
4.  Crop Layers to content (Layers > Crop Layers to content) for both layers.
5.  Create new layer group (Layer > New layer group)
6.  Move both layers inside the group (in right panel layers), select the group and right click > merge visible layers select Expanded as necessary
7.  Now you can proceed to add an alpha layer for the diffuse and hit erase tool and export as dds, the usual process.
8.  For the blue normal map, you need to convert it into GGGR using this procedure: [Custom Character Race and Normal Map (displacement map)](/custom-character-race-and-normal-map-displacement-map) and export as DXT5 dds

If you moved the head up, You need to set up a head file in FCS. Put the same GGGR and diffuse on it, but it needs a separate mask, with the same rectangle aspect image. but it should be about 256x512 size. And DXT1 compression.

**About the image size;** 4096x2048 is quite large for a single character race. These textures are not that detailed to warrant that. You probably could just do 2048x1024. Or, be crazy and save it as 2048x2048. The game will automatically stretch it to match the mesh, as long as the UVs are set as the guide says above.
