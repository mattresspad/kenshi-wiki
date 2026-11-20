---
articleId: custom-character-race-and-normal-map-displacement-map
title: Custom Character Race and Normal Map (displacement map)
description: This is a subpage for the Skin making tutorial. WIP
categories:
  - Modding
  - GGGR
  - Wip
layout: modding
---

This is a subpage for the [Skin making tutorial](/skin-making-tutorial). WIP

## Forewords

Ever wondered why your custom race has seams all over or why your character looks flat in game?

You must have noticed the vanilla characters use grayscale normal maps, but however you try, turning a normal map into a displacement map just does not work right. This is because Kenshi uses GGG+R system instead of RGB+A. This system is unique to Kenshi and no information of it is available online. It is a type of Swizzle technique, where the x-axis (red channel) is saved on the alpha channel. For compression optimization.

Technically GGGR is also a normal map, a GGGR normal map, but I am just using the term GGGR in this page for ease of typing.

> In simplified terms: The grey-scale image of the green channel serves as a left-right bump and the red channel on alpha determines the up and down bump (this is oversimplification, you can read more about y and x axis on tangent normal maps and the Swizzle method, if you want to [here](https://3dcoat.com/documentation/fi/2025/01/13/types-of-normal-maps/). People also talk about roughness when talking about the red channel image in GGGR, but that is not technically correct. Nor is 'bump' or 'displacement'.)

The developers have given us graciously typical blue normal maps to make mods with, but they have a glaring issue: the seams are wrong when converted into GGGR. This is because of the difference between OpenGL and DirectX formats. I do not know why the format in the provided files is not the correct one for Kenshi.

## How to convert a GGGR into a normal map (reverse engineering)

1.  Open the GGGR in Gimp
2.  Colors > Components > Extract components
3.  Component: Alpha - OK
4.  Turn alpha channel off (if on)
5.  Layer > New from Visible
6.  Export as RED.png
7.  Open the same GGGR again in Gimp
8.  Turn alpha channel off (if on)
9.  Layer > New from Visible
10.  Export as GREEN.png
11.  In your editing software open both RED.png and GREEN.png
12.  Create a new image, same size as the original GGGR (vanilla files are 2048x2048), this image pure white, this is the BLUE
13.  Split all three images by RGB and save the red channel from RED the green channel from GREEN and blue channel from BLUE. Close all others.
14.  Combine by RGB using the saved red, green and blue.
15.  Done

I suppose this might be possible to do entirely in Gimp too, but it is just horribly cumbersome with all the layer anchoring.

But there is no point everyone remaking the vanilla normal maps, so I have provided a Modders Resource you can download and use as is: [Steam Workshop page for Modders Resource](https://steamcommunity.com/sharedfiles/filedetails/?id=3604279048)

## How to convert a normal map into GGGR (Professional Image Editing tool)

What you need to do is:

1.  ) Create a normal map like you do. Tweak it until you have no seams. Never mind it being flat.
2.  ) Open the normal map in a sophisticated image editing software, that is able to divide the RGB into different channels and able to create an alpha mask using an image.
3.  Copy the Red channel image to a separate image (ctrl A and ctrl C)
4.  Copy the Green channel and paste it over the original Red and the Blue channel (total overwrite)
5.  Combine the image (RGB channels). You have now a grayscale image.
6.  Create a mask, or however your image editing software does it and create an alpha channel using the copy of the Red channel you made earlier as a mask.
7.  Export to .dds or open it in Gimp to export as .dds if your software does not convert to .dds. DTX5 and mipmaps on.

The red channel being the alpha is important. Kenshi uses the black and white data on the red/alpha channel as the shading map. Without it, the texture looks full bright.

Black = hollow White = bump

## How to convert a normal map into GGGR map using only Gimp

(I have been informed this is not the optimal way of doing this, so just know you can also use the extract channel for taking each. You can simply extract each channel via Colors > Components > Decompose, then recombine them via Colors > Components > Compose. I have not tested this, but assume one still needs to do the adjustment.)

1.  Open the normal map in Gimp
2.  Click Color > Components > Channel mixer
3.  All channels Red channel 0 Green channel 1 and Blue channel 0
4.  Save as something else
5.  Open the normal map again and split the channels (Colors > Components > Decompose)
6.  Select and copy the red channel image
7.  Go back to the main image and add an alpha channel Layer > Transparency > Alpha layer
8.  Add a layer mask to the main image Layer > Mask > Add Layer Masks, select 'Layer's alpha channel' and **untag Invert Mask**, click Add
9.  Paste in place (Edit > Paste in Place)
10.  Anchor mask layer (Layer > Anchor Floating Layer or Mask)
11.  KENSHI SPECIFIC ADJUSTMENT: Take the eraser tool, expand it to cover the image, hardness 100% and Opacity to 47% (this last might need adjusting so you get rid of the seam), click the image
12.  Export as dds, mipmaps enabled and DXT5 compression.
