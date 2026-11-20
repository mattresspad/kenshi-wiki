---
articleId: how-to-make-icons-for-kenshi
title: How to make icons for Kenshi
description: "There are two types of icons in Kenshi: inventory icons and building menu icons."
categories:
  - Clarification needed
  - Modding Guide
  - Modding
layout: modding
---

There are two types of icons in Kenshi: inventory icons and building menu icons.

**Building menu** and **weapon**_\[clarify\]_ icons need to be named like this:

{number ID}-{your mod name}.mod.png

For example:

1234-mymod.mod.png

This is the stringID name for the item in FCS, right below the actual name you gave to it. Both .mod and .png need to be there. The number is the actual ID for the item. Linking to the icon inside FCS is not needed - it does nothing.

All other inventory icons can use the icon link in the file. Only mesh objects can have automatically generated icons, like weapons or armor. Note that shirts are not mesh objects.

## Directory setup

Create an icons folder inside your main mod folder. Lowercase. If you are making furniture or other buildings, you need to make a buildings folder inside the icons folder you made. Also lowercase.

Clothes and weapon icons go in the icons folder, buildings and furniture in the buildings folder.

When testing, **remember to delete the old icon from the kenshi/data/icons folder**. Otherwise, you will not be able to see the new version of the icon you made in game. Kenshi does not load icons from a mod again if it already has a same named icon_\[clarify\]_. Icons with links should work without deleting the old one.

## Building icons

-   Size: 256x256 or 128x128 pixels
-   No partial alpha, just transparency at 100% for the background. Transparency is not mandatory - you can make a solid image if you want.
-   Export the icon as a PNG with RGB mode. 8 bit precision is not required but advised as it can reduce the icon's data size.

## Item icons

### Weapons

For weapons it is best to let the automatic system make the icons. However, you can do it manually.

Sizes (width x height in squares):

-   Main weapon 10x2
-   Side weapon 7x1

You need to make an icon for each quality (model) type of your weapon. For example, if you have a Desert Sabre and a Topper and you have three qualities: Rusted Junk, Mid-grade salvage, Meitou you need to make six icons:

-   Desert Sabre Rusted Junk
-   Desert Sabre Mid-grade salvage
-   Desert Sabre Meitou
-   Topper Rusted Junk
-   Topper Mid-grade salvage
-   Topper Meitou

The icon names must follow the pattern:

{weapon type string ID}.{Model type string ID}.png


For example:

-   Desert Sabre (52305-rebirth.mod) , Rusted Junk (913-gamedata.base):
    -   `52305-rebirth.mod.913-gamedata.base.png`
-   Desert Sabre (52305-rebirth.mod), Mid-grade salvage(918-gamedata.base):
    -   `52305-rebirth.mod.918-gamedata.base.png`
-   Topper (474-gamedata.base) , Rusted Junk (913-gamedata.base):
    -   `474-gamedata.base.913-gamedata.base.png`

### Clothing

Auto icons are taken from the male mesh. If you have no male mesh, you need to provide a manual icon. Shirt layer items do not get an automated icon, even if the item has a mesh item for men.

Sizes (width x height in squares):

-   Armor 4x6
-   Backpack 5x3
-   Belt 2x2
-   Boots 4x2
-   Headgear 4x3
-   Legs 4x5
-   Shirt slot 4x2

### Other items

Cannot have an automated icon. They are assumed to have no mesh where the automation can take a picture.

## Other advice

-   If you copied the item type from someone else's mod, you should go and change the stringID for your item in FCS to match your mod name. Just to be neat_\[clarify\]_.

## Auto-Generated Icons

For humanoid character armors you probably can use the vanilla icon camera settings and be done with it. But races that have fe. four legs you need to set the camera to shoot the correct location of the armor mesh. See [Creating a rideable animal/vehicle#Gear Icons](/creating-a-rideable-animal/vehicle#gear-icons)

### Troubleshooting

**Item icon generates, but the result is a black silhouette, not color:** you probably have the mesh texture to full specular (shinyness) and have not set any alpha on it. The icon camera cannot handle full shine, it will interpret it as no light whatsoever. So either turn your specular on the material down, or set parts of the texture to have alpha. Or both. Both is good.

**Item icon generates, but the result is a black silhouette, not color, the texture on the mesh is also black if I zoom out:** Your texture file is not binary sized. Resize your image to 512x512, 1024x1024,2048x2048 pixels **exactly**, not a single pixel wrong either side. Rectangular images are allowed, if it is still in binary sizes.

**The icon does not generate at all, the image is empty:** Your camera is shooting empty air. You either do not have a mesh at all, the mesh is not weighted to the male\_skeleton or the camera offset is incorrect. Fix the mesh or adjust the camera so it can actually see the item. Also do note that the icons are generated from the male mesh version of the item. So if you have only female mesh version, you get an empty icon.

**The icon does not generate at all, I see a red x**: This is not auto-generation issue. You have set a .png icon link for your item and the game cannot find the file. Fix the link to point where the image actually is or remove the link.

**No matter what I do or change, the icon generates the same every time:** You forgot to delete the icon from kenshi/data/icons after each change. Kenshi only generates a new icon, if there is no icon in that folder for the item.
