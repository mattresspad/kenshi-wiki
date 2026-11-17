---
articleId: how-to-make-a-new-race
title: How to make a new race
description: Every humanoid race must have an editor limits file set to it. The game will crash without. If you duplicated an existing race, your new race has a vanilla e…
categories:
  - WIP
  - Modding
  - Character
  - Race
  - Races
layout: race
---

## Tips

-   use the vanilla folder structure in your mod. If you do not, the game may occasionally forget where a file is and the player thinks your mod is broken. This happens often with animations
-   Do not be afraid of shape keys or animations, they have a learning curve, but the reward is great!
-   Making a race is one thing, but adding the race to the game world makes the mod! What is the lore? Where are they from? What faction they belong to? Who hates them? What unique characters of this race roams the world? Can the player recruit them?

## Creating a new race in the FCS

1.  Open FCS
2.  Navigate to the Races tab.
3.  Duplicate an existing race. This way you see what things you need to make for the race. Also having vanilla files there allows you to test the race without the fear of the game doing some weird stuff if a file contents is missing.
4.  Add the race to a race group, or make a new one. NOTE: this is important for two reasons, without adding it to a race group a player cannot select that race for their starting characters (and you cannot test them) plus race group is what dictates many NPC dialogue options. If you make a new race group, you should also consider adding it to all of the Holy Nation dialogues, unless you WANT them to treat the race as evil. Most people just add their new race as a part of the human race and call it a day.

## Editor limits AKA editor\_data.xml file and about Shape Keys/Sliders

Every humanoid race must have an editor limits file set to it. The game will crash without. If you duplicated an existing race, your new race has a vanilla editor limits file assigned to it. If you are using vanilla skeleton and mesh, you can just leave it as is.

But for the common modder the editor\_data.xml is where they make their race look different. **Skin color, height and girth limits are set here.**

You need either Visual Studio Community or a Notepad++ to open and edit editor limits files.

When you open the file, you see a bunch of names numbers and brackets. **Do not touch the brackets!** If you by accident delete or add one, the entire file stops working and the game will crash.

Editor limits file is divided in two, male and female side. If you are making only one gender race, male is the one the game will use.

### Sliders/Shape Keys (advanced modding)

All the values you see on the editor limits file are linked to the sliders in the game start character customization AND NPC randomization. They decide how far each feature can go.

Basically the race developer creates these slider options in Blender when making the race meshes. They are called Shape Keys in Blender. If you are using the vanilla mesh, **and you did not add new bones**, then you can use the vanilla slider names and editor limits. You cannot overextend vanilla values. The max they can go is the max shape the original sculptor of the mesh created. If you want exaggerated features, you must redo **all** shape keys.

The video [Blender Tutorial - Shape Key Basics](https://www.youtube.com/watch?v=7WGtmADZCzU) by Eve Sculpts shows the process. The difference for Kenshi are the shape key **names.** The shape key names must match the names of the sliders on the editor\_data.xml file. You can rename the sliders in the file to match the names in your Blender, or vice versa. One caveat: all slider names for Kenshi must be one word, no spaces.

You can also opt not to make any Shape Keys for your race. If it is just one character (or you do not care if the world is filled with identical people) you can just not make any Shape Keys.

Do not forget to export your mesh with export shape keys ticked.

### Important about exporting mesh and skeleton files

You need to export your race mesh twice, if you made custom animations for it. first with skeleton and animations selected and second time without those two. The second one needs a different name. The second one will be the actual race mesh in the race file and the first export skeleton set to a base animations animation file for that race (which is added to the race.)

If you did not make custom animations for it, you only need to export it with the second way, without skeleton and animations.

The first mesh goes into female\_skeleton or male\_skeleton folder with the skeleton.

The second mesh goes into a secondary folder inside the character/meshes folder. For vanilla humans it is the human folder.

Make sure there is no folder beginning with the two first letters already, if you decide to make your own. I would suggest using the human folder and hu filenames prefix, just because in that way there will never be a conflict with another mod. If you make xxchun folder and someone else makes xxtopic folder and you both use xx as prefix, the game engine might look from the wrong folder. It is better to just use the vanilla folder name so all your meshes are in the one folder where the game looks them for.

You still select the mesh, hold shift and export, like normally. You just give it another name and choose to not export the animations and skeleton the second time.

The second type of exporting prevents weird issues such as missing portraits or sometimes even animations playing weirdly.

## How to make a new race/edit character mesh



### Mesh and character body

1.  Import a vanilla character model with its skeleton into Blender (if they are in the same folder, the skeleton will come automatically when you select the mesh)
2.  Edit the mesh until you like its appearance. (This includes rigging 3rd party mesh to it)
    -   If you are making a giant: Select both skeleton and the mesh and go to edit mode, scale them up
    -   If you are making a non-standard race and need a tail etc. make your add-ons to the skeleton
3.  If you are not making a giant, or have a tail etc., skip this step. If you are making a non-standard race: Re-record every animation in the skeleton to match the new scale (this is the tedious part)
4.  Do steps 1-3 to both genders
5.  Export the mesh with the skeleton and paste them inside your mod to character/meshes/female\_skeleton and male\_skeleton folders respectively
6.  Export both meshes (female and male) again **without** the skeleton with different name. Put those in a folder inside your mod that is not the male\_skeleton or female\_skeleton (this mesh is used as the main mesh on the race file)
7.  Open FCS and make a new race file, set its mesh to be the new mesh(es) without skeleton you just made for both genders
8.  Make a new animations file and add the new skeleton to that. Add that new animation file to the new race
9.  Make a new custom start and have a character spawn as this new race. Test everything works. If they do, you can stop here.
10.  For minutiae details: Edit the appearance in the start character editor until you are happy how the character looks like. You might have to adjust the editor\_limits file for this race and redo this step a few times to get the minutiae to your liking. Fe. if you want special skin colors, you need to adjust the editor\_limits file. Use notepad++ or Visual studio to edit the file.
11.  Export the character body (unique name so you know which it is)
12.  Navigate to your ..\\Kenshi\\data\\character\\bodies\\export folder and move the body file you just made inside your mod's character\\bodies folder. (If you do not have one, make one)
13.  Open FCS and create a new character file. Add this new bod to the character. Add the new race to it. Add a stats file to your character. You need to adjust its strength and moving speed up a lot to meet the expectations of a large creature.
14.  Make a new custom start or just edit the start you already made. Make the start have this new character.

See also videos: [Rigging a 3rd party character; From A pose to I pose](https://www.youtube.com/watch?v=OJhFajivYDE) and [Kenshi Blender 4.0 Tutorial - 3rd Party Mesh For a Character | Part1: Swapping Heads, Meshwork](https://www.youtube.com/watch?v=X4arrclUJZ0)

### Skin texture

If you edited a vanilla mesh, you probably can use a vanilla skin texture as a base. Skins can be found in the ..\\Steam\\steamapps\\common\\Kenshi\\data\\character\\skins\\human\_female or human\_male (or shek) folder. The head files are NOT in 'hu'. The head files are in human\_female or human\_male folders.

1.  Open Gimp and double-click a vanilla skin texture file to open. Untag 'load mipmaps'
2.  Go to channels on the right side panel (next to layers) and untag alpha. Take a screeshot of this (or go to layer - new from visible and export that as png). DO NOT COPY SOMEONE ELSE'S TEXTURES AND LOAD THEM TO STEAM AS YOUR OWN!!! THIS IS ILLEGAL IN MANY COUNTRIES. Only vanilla files can be used like this. You may look what others have made, but you may not copy.
3.  Paste that to your preferred image editor as a new image. Crop it to be perfectly square.
4.  Do the same to the head texture.
5.  Make your changes
6.  Open them back in Gimp and export as .dds with DXT5 compression. Even tho Photoshop and many other program can do .dds. very often they are too fancy for Kenshi. Kenshi does not support partial transparency on diffuse images and fancier programs very often automatically add a soft edge to your images. Resulting in a texture you cannot use in Kenshi.
7.  Paste the textures in their correct folders inside your mod folder and link to them in the race file in FCS.

### Bump map (normal map)

Kenshi uses GGG+R. Create (or have) an usual normal map. Then you just split it in RGB channels, save the R channel separately and then replace the original B and R channels with the G channel. Rebind back to a single image. Then you use the saved R channel as an alpha mask.

I have noticed the vanilla normal maps available in the \\Steam\\steamapps\\common\\Kenshi\\data\\character\\skins\\hu -folder result in seams on the body. Unfortunately that means you have to either manually make seamless ones yourself, or edit the GGG+R dds versions directly in Gimp.

See [Custom Character Race and Normal Map (displacement map)](/custom-character-race-and-normal-map-displacement-map) See: [Kenshi Blender 4.0 Tutorial - 3rd Party Mesh For a Character | Part 2: Swapping Heads, Textures](https://www.youtube.com/watch?v=hPp8jRXzpm8)

### Masks

You need two mask textures for your race: 1. for the head and 2. for the body

The head mask must be magenta (<255,0255>) in all areas that get the skin color wash and black on the areas where it only gets white. Green parts on the mask will glow. On the body same with black, all the areas that do not get the skin color wash, like underpants. Everything else white on the body mask. Body mask has no glow option.

See also: [Making a character with glowing eyes or body](/making-a-character-with-glowing-eyes-or-body)

### Hair

see [How to make custom hair](/how-to-make-custom-hair)

### Secondary skeletal mesh

When you are done with your edits, you will have to export the race mesh one more time. See [Character portrait appearing behind other character portraits](/character-portrait-appearing-behind-other-character-portraits)

## Make characters of the custom race and make them recruitable, or add them to a start.

Now it is time to make a decision, shall characters of this race be recruitable in the world, or are they available only in a game start.

If you are making the character(s) recruitable, then you need to make a squad for them and set that squad to spawn somewhere (maybe as a town resident or add them to an already existing recruitables list)
