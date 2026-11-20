---
articleId: making-a-custom-world-map-terrain-characters-walk-on-and-pois
title: Making a Custom World Map (terrain characters walk on and POIs)
description: This article is a work in progress and is subjected to change.
categories:
  - WIP
  - Modding
  - Modding Guide
  - World map
layout: modding
---

This article is a work in progress and is subjected to change.

See also: [this conversation in Lo-Fi forums](https://www.lofigames.com/phpBB3/viewtopic.php?f=11&t=15093&p=67933) and this [How to regenerate blendmap files](/how-to-regenerate-blendmap-files)

## What making a custom world map entails

by BoronGorax on Steam forums: [https://steamcommunity.com/app/233860/discussions/3/4203492762831234144/](https://steamcommunity.com/app/233860/discussions/3/4203492762831234144/)

The devs used World Machine to make the map. It's a node-based program for making procedural terrain based on a 2D heightmap. Personally, I find World Machine pretty outdated and it has a far better alternative (QuadSpinner Gaea), however I use WM for Kenshi because it outputs the correct heightmap dimensions and format with no problem.

The wrong dimensions can cause terrain banding - where a lack of data or bad image compression causes slopes to become step-like (think Minecraft) rather than smooth.

I'll break down the various elements of the map. You've got:

-   fullmap.tif
-   overlays
-   areasmap.tga
-   biomemap.png
-   navtiles
-   blendmaps

### Fullmap.tif

Fullmap.tif is the heightmap output by Worldmachine (WM). By [this conversation in Lo-Fi forums](https://www.lofigames.com/phpBB3/viewtopic.php?f=11&t=15093&p=67933) this tiff can be also operated on Photoshop, no other software is compatible with Kenshi's engine. Although people do claim they have managed to set Gimp for this \[this tidbit added by Cattrina\].

The format is a 16K +1 heightmap set to 32km x 32km - the highest possible resolution output by WM. Editing in photoshop is technically possible but it's very difficult to know what you'll get like that. Never bothered to check, but I'm fairly sure the +1 pixel thing is so that you have one pixel that's precisely at the centre of the heightmap.

For the LitA map I started by painting a basic layout by hand (blobs in different shades of grey) and then smudging it for a basic layout. From there I ran it through several rounds of thermal weathering, erosion, and other effects in WM. Now I'm in the refining stage, so mostly making smaller areas in WM before overlaying them onto the main map. It's easier to do it that way and create smaller patches with proper detail individually, as working in WM or Gaea at the macro (32km x 32km) scale means you can't see much of the finer detail.

There are two types of overlay maps Kenshi uses - color overlays and "splat" maps. In the Kenshi files, the color overlays are numbered (color.0.1, color.0.2 etc) and the splatmaps are just called "newoverlay.0.1", "newoverlay.0.2" etc.

Both are also generated in WM.

### Color maps

Color maps are simple colors overlaid on top of the world terrain. They're used to tint the terrain subtly. It's why the Cannibal Plains have a red tint while the Deadlands are dark. However, that tint is mixed with the underlying textures. (That texturing is done with the splatmaps.)

These use the R, G, B, and A channels of images to tell Kenshi where to use biome textures (e.g. grass, dirt, slope). IIRC

R = dirt

G = grass

B = slope

### Base textures

"Base" textures are used where those channels are 0. "Cliff" textures aren't on the splatmaps, they're done using triplanar mapping (because you can't represent vertical data on a flat image anyway).

### Splatmaps

Splatmaps (also called texture weightmaps) are generated in WM through a mix of noise and parameters (like the steepness of slopes). You can set up some nodes so that e.g. it'll paint a bunch of blue where slopes are greater than x degrees and randomly paint red or green where the land is flat. That kinda thing.

The A channel of the splatmaps is the exception - that determines where the roads go and is projected in-game after the roads have been designed through the in-game editor.

### Areasmap

Areasmap is a simple TGA that uses color indexes to determine where the named biomes ("spawn areas") go. Where are the boundaries of The Great Desert or The Deadlands, etc.

### Biomemap

Biomemap is a weird one. Ostensibly, it splits up the biomes. While spawn areas determine weather (iirc), random/nest spawns, and the title of each biome shown to the player, biomes contain foliage and texture data.

However, changing biomemap.png ONLY affects the textures used by terrain features that use terrain mapping (ie using surrounding terrain textures that are triplanar-mapped onto features). It doesn't seem to affect where the textures used on the actual terrain go.

ATM I still have no idea where the "true" biomemap is hard-coded (editor's note: as of April 2026 we now can edit biomemaps See [How to regenerate blendmap files](/how-to-regenerate-blendmap-files)).

Eventually I'll reach out to Chris and ask about it, though for now I have a decent enough solution as a fallback; I simply combined a bunch of existing biomes (and shared the textures) to create a "new" biome map within the borders of the original. Not perfect, but completely workable as I use higher quality terrain textures at the expense of less diversity, anyway.

### Navtiles

Navtiles are how the navmesh is split up.

They're generated by Havok in-engine, and they're supposed to be adapted at run-time (e.g. player builds a house). In practice, this goes to ♥♥♥♥ when you've got a whole new world map, so when the map is 100% finished I'll have to manually regenerate each one in-game (there's a button) and then link to the new navtiles folder through rekenshi (editor's note: Re-Kenshi is a third party application that is worked on by the community. It allows modders to load files previously unobtained to be loaded in the game by a mod, such like the map files).

### Blendmaps

Blendmaps determine how the biome textures blend together at the borders. No idea how those work exactly yet, something to figure out later on. I'm not worried about it atm.

### Banding

The banding happens when there isn't enough data to properly displace the terrain. Two main causes:

\- You need the correct bit depth (Tif16) otherwise there won't be enough data

\- The heightmap needs to be rendered at 16k + 1, smaller sizes will also result in not enough data

The splatmaps are located in data/newland/land/overlaymaps:

\- colour.x.y

\- newoverlay.x.y

The x and y numbers correspond to the zone tiles, starting from the top right IIRC. Colour.x.y multiplies the colour data on top of the terrain textures; newoverlay.x.y contains the splat data

## Terrain textures

By Cattrina

Terrain has two texture layers, the base material which is painted on the surface using the normal material blend technique as in games general.

However on top of that is an overlay layer, which is made of 64 .png images sized 2048x2048 each, giving unique details to each map section.

These files can be found in the ..\\steamapps\\common\\Kenshi\\data\\newland\\land\\overlaymaps folder. These files can be replaced from a mod if identical folder structure is used, but they require a new game, import is not enough. I have used the overlay images to change the terrain color to green in the Border Zone area in my mod Greener Border Zone. At first I had an issue; black spots appearing on some zones, but not all zones. It took me way too long to figure out what was happening.

The black dots appeared BECAUSE Kenshi does not ignore the texture under 100% alpha. So when I made my terrain overlay by overlapping two alpha images, the other being the original vanilla overlay and the other just green painted on alpha background **I had actually added green paint on black background.** And when I placed that below the vanilla layer, some vanilla files covered enough terrain to cover all the black, but some had holes where the layer below could show, meant to show the underlying repeated texture. And that is when my second layer with the black background intervened.

To fix that I had to make sure all green was painted on non-alpha terrain image (same zone alpha removed) and THEN alpha added!! (I suppose it might also work if you first erase all and then just paint the green on). So it is very important if you do overlay edits, to make sure you do not add layers without the terrain texture first being there. No you cannot delete it. you can erase it 100% tho.

And when you export as .png make sure you **tag the 'save color values from transparent pixels' ON.** Remember, many fancier software may not have this option, so Gimp is recommended.
