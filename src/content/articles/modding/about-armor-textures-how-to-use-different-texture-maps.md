---
articleId: about-armor-textures-how-to-use-different-texture-maps
title: About armor textures, How to use different texture maps
description: A map is a 2D representation of the garment topography. Easiest to understand by thinking about the UV map. UV map being the key, determining all the other m…
categories:
  - Modding
  - Mod making
  - Wip
layout: modding
---

## What is a texture map

A map is a 2D representation of the garment topography. Easiest to understand by thinking about the UV map. UV map being the key, determining all the other maps for the same garment.

Traditionally a 3D object (our garment) can have multiple maps; diffuse, normal, roughness, metalness, ambient occlusion, mask. Kenshi uses only three for a garment; the color map (a mask), the normal map and the diffuse aka texture map. Kenshi CAN use a roughness map, but it **must be set as an alpha mask on the diffuse map.**

## Diffuse map aka the texture

Diffuse is the main texture of the garment. It contains the colors of the garment (or neutral base one can paint color on with a color map). This is where most manual effort is usually put.

### Defining shininess/roughness on the diffuse map

Kenshi takes its cue how shiny an item is from the alpha channel of the diffuse map. If you have no alpha at all, Kenshi interprets it fully shiny and you see dark shiny film over your garment in game.

There are following methods you can use to mitigate the shiny:

1.  Newb: ignore it altogether and just turn the specular value to zero in FCS. The result is 100% matte and a bit boring.
2.  Beginner: turn the entire thing 100% transparent (select all, hit del). Same result as 1.
3.  Median: use the selection tool to make separate areas for different transparency values, creating better suited shininess for parts of the garment that are shiny, like metal, and parts that are not that shiny like fabric and the eraser tool to 'delete' with corresponding % value. This is perfectly acceptable as an end result for a mod.
4.  Advanced: using the eraser tool to paint variations of transparency on the alpha channel, can be a pro-option if you are very good.
5.  Pro: using a roughness map as an alpha mask

#### 1: How to turn specular off

1.  Open [FCS](/forgotten-construction-set) and the item file of the garment and the material file of the garment.
2.  Go to specular field
3.  Turn the value to 0

#### 2: How to turn the diffuse map/texture 100% alpha in Gimp

You need an image editing software, preferably something that can export in .dds format with mipmaps. We recommend Gimp, it is free and deals natively with the same values as Kenshi does, so you do not have to adjust your workspace settings.

1.  Open the image of the texture in Gimp. It can be of .png, .jpg or many other formats.
2.  Go to Layer - Transparency - Add alpha channel
3.  Ctrl + A selects everything
4.  Hit the delete button. This will turn the entire image 100% transparent (not shiny).
5.  Export as .dds (replace png with dds), DXT5 compression and mipmaps enabled

#### 3: How to use the selection and eraser tools to make different parts of the image to have different alpha values

1.  Open the image of the texture in Gimp. It can be of .png, .jpg or many other formats.
2.  Go to Layer - Transparency - Add alpha channel
3.  Pick the selection tool, any of them and select one area to be edited
4.  If you are using the loop selection tool, finalize selecting with enter.
5.  Pick the eraser tool and change the opacity value to what you want for this area (0 == totally shiny, 100 == totally matte).
6.  Adjust the hardness to 100%
7.  Change the size of the eraser tool to cover the entire texture
8.  Click ONCE on the image.
9.  Do this to all the different areas you want different transparency values on.
10.  Export as .dds (replace png with dds), DXT5 compression and mipmaps enabled

#### 4: How to use the eraser tool to paint variation on the alpha layer

You can also use the eraser tool as a paint brush to make things less shiny. You just have to use your artistic skill to determine which parts you want less shiny and which parts can remain fully (or whatever your starting value is) shiny.

Generally, edges are shinier on metal objects and undersides are not shiny at all or barely shiny.

This method is not really used that often, because most software used to generate textures automatically can generate a roughness map. But if you for some reason need to, you know you can manually draw with the eraser tool.



#### 5: How to use a roughness map in Gimp for Kenshi

Now if you are a machine texture generator user, like fe. substance painter, you get your hands on an automatically generated roughness map.

Naturally one can make such manually as well, if one knows their way around the paint brushes etc. and knows the UV map of the garment, which part is which.

For Kenshi the roughness is set in the alpha channel of the diffuse map. Basically, you use the roughness as an alpha mask.

Black = 100% alpha (full matte) White = 0% alpha (fully shiny). You might have to invert your roughness map if it is generated the opposite way.

1.  Roughness/mask image: Select the image you want to use as the mask and copy it to the clipboard (ctrl + A, ctrl + C).
2.  Open the target texture image in Gimp. It can be of .png, .jpg or many other formats.
3.  Go to Layer - Transparency - Add alpha channel
4.  In the Layers selection, right-click on the layer you want to mask and select Add Layer Mask (you should have only one layer).
5.  In the 'Add a Mask to the Layer' menu, choose an initialization option, such as 'White (full opacity)', and click Add.
6.  Click on the mask thumbnail in the Layers dialog to make it the active editing element.
7.  With the layer mask active, paste the image from the clipboard onto the mask.
8.  Right-click the floating selection in the Layers dialog and select Anchor Layer or click the anchor icon in the Layers dialog to merge it with the layer mask.
9.  Export as .dds (replace png with dds), DXT5 compression and mipmaps enabled

## Normal map

Normal map is the purplish-blue texture. Normal map acts like the bump map of old, it generates lighting and shadow values on the texture as if the 3D model had more details on its geometry. It fakes 3D details, saving computational burden from the physics engine. It does not have to calculate how this 3D text on the garment behaves.

The colors in general are: purple = up and teal = down, pink = right and blue = left. But Kenshi is somewhat ambiguous with these and can independently decide which is which, if the geometry of the garment is easy to interpret. Purple and Teal values are usually the only ones you need to manually change, if any.

Normal map usage is very straight forward: you export it as .dds, mipmaps enabled and set the link on the garment's material file to point to it in the mod folders.

### Transparency on a normal map

In Kenshi a garment can have some parts transparent on it, like a crack on an armor or a hole on a shirt. This can be achieved by cutting those bits away on the normal map in image editing software and setting the material to ALPHA.

Kenshi however supports only full transparency on a normal map, so no fuzzy edges, sorry.

The only exception to this is the **shirt layer**, where the vest normal map can have partial transparency.

## Color Map

In depth how to for beginners is available here: [How to make a color map for your armor](/how-to-make-a-color-map-for-your-armor)

Blue channel on the color map is reserved for metallic.

So, if you have a metalness map from texture map generating software (like substance painter), you can just use the metalness map as a mask on the blue color channel of the color map.
