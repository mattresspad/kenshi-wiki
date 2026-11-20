---
articleId: how-to-make-custom-hair
title: How to make custom hair
description: "If you are making hairdos for the vanilla races:"
categories:
  - WIP
  - Modding Guide
  - Modding
  - Character customization
layout: modding
---

WIP

## Hair mesh

**If you are making hairdos for the vanilla races:**

Easiest is to start your hairdo journey by editing vanilla hairdos.

There is one caveat though: after you have imported the vanilla male and female body and skeletons in Blender, you need to delete both body meshes and import the secondary body mesh for both genders. This is because the neck and head position is different in the secondary mesh and that is the body mesh that is used in Kenshi. Using the default body that comes with the skeleton causes your hair mesh to be offset in game.

You can find the secondary body files here: .\\Steam\\steamapps\\common\\Kenshi\\data\\character\\meshes\\human

**If you are not making hairdos for vanilla races**, use the custom race skeleton and mesh as the reference.

## Hair textures

Kenshi uses hair texture optimization, which means each RGB channel can have its own greyscale hair texture. So, it is three in one.

The hair alpha channel determines which channel is used for the alpha pieces (the tiny hairs) and the hair diffuse channel determines which channel is used for the texture. Depending on hair texture chosen the channel might have only whisks of hair randomly tossed on the channel, meaning it is very easy to get 'only air' for your hair prims (prim = primitive aka one single mesh piece, like a Lego block).

On the other hand, if you need both ends of the hair prim to have alpha, you might want to use the red channel as the alpha channel too.

### Alpha rejection

Kenshi has transparency on or off. There is no partial transparency, which means hair textures sometimes look like there is floating pixels in midair, because all the weaker alpha areas have been erased (rejected) from around it. Alpha rejection decides what is the strongest shade to reject. An alpha texture is greyscale, black (value 0) is 100% transparent and white is 100% opaque(value 255). So, the alpha rejection value is the value of the grey on scale 0 to 255 to cut out. So, everything BELOW that value is turned 100% alpha.

This allows the creator some wiggle room to prevent those floating pixels.

### UV layout on prim

























This is HairMod\_Male\_04 hair texture.

## Hairbases

The hairbases also use the RGBA format. You get three different 'styles', one on each channel.

G and B channels consists of a grayscale image, where black is 100% transparent. Whereas R is the opposite, white is full alpha.


For your sanity I recommend making one B&W style for all channels and just turning it negative for the Red channel.

### If you are making face paint:

For your purposes just draw your mark with a white paint/pen on the character forehead on a new layer, WITHOUT blurring the edges. And then turn the face texture off so you have a white mark on an alpha background. Merge Down, export as dds DXT5 mipmaps enabled. If you keep the image file the same size as it is in vanilla, the saw-edges are minimal. Blurring the edges will cause black lines.

If you need blurred edges, use red <255,0,0> as blur tool, The edge between red and white is what is shown on the character.
