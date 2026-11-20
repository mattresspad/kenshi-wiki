---
articleId: example-on-color-map-process
title: Example on Color Map Process
description: 1. Choose what parts you wish to color with color 1 OR which with color 2 by selecting only those UVs in Blender (choose the ones you find easier to select).
categories:
  - Modding Guide
  - Modding
layout: modding
---

**1\. Choose what parts you wish to color with color 1 OR which with color 2 by selecting only those UVs in Blender (choose the ones you find easier to select).**

Fig 1: Drifters 1 Plated Boots UVs show on the vanilla texture



Fig 2: Only Plates selected

Fig 3: Plates and straps selected

Take a **screen capture** of this and paste it on your image editing software.

**2\. In your image editing software, use the magic wand/fuzzy editing tool to select the black around the UVs.**

**3\. Make a new layer, use the bucket tool to paint it <255,0,0> red (color 1).**

**4\. Invert the selection and use the bucket tool to paint <0,255,0> green (color 2).**

Fig 4: The color map. Color 1 chosen for everything else and color 2 chosen for plates and straps

**5\. Scale the image down to as small it can be without causing fuzziness to the edges, 128x128, 256x256, 512x512 etc. DO NOT SOFTEN THE EDGES!**

**6\. Export as .dds, DXT 1 + Mipmaps enabled, if your image editing software does not support .dds, open your image in Gimp for exporting.**

**7\. In the FCS do these changes to your item file**



**8\. Put your color map .dds file inside your mod in a folder and set its link here.**




This page is a companion to: [How to make a color map for your armor](/how-to-make-a-color-map-for-your-armor)
