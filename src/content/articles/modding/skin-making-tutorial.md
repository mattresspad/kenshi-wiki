---
articleId: skin-making-tutorial
title: Skin making tutorial
description: "See also:  About GGGR and normal maps,  Why is my 3rd party ported mesh flat in Kenshi: AKA how to fix flat shading, Making a character with glowing eyes or…"
categories:
  - Modding
  - Skin
  - Race
  - Custom skin
  - Custom race
layout: modding
factTitle: ""
factGroups:
  - heading: null
    rows:
      - - Row1
        - "TIP:"
        - break: true
        - When editing a face texture resize the image to 1400px X 1024  it makes it easier to edit the eyes. Resize back to 1024X1024 before exporting.
---

See also: [About GGGR and normal maps](/custom-character-race-and-normal-map-displacement-map), [Why is my 3rd party ported mesh flat in Kenshi: AKA how to fix flat shading](/why-is-my-3rd-party-ported-mesh-flat-in-kenshi-aka-how-to-fix-flat-shading), [Making a character with glowing eyes or body](/making-a-character-with-glowing-eyes-or-body) (about the head mask)

### To make a custom head skin texture variations for the existing vanilla mesh

I assume you have already made a race file for your custom race and added it to a race group (fe humans, shek, your own) and you have installed and opened Gimp.

NOTE: the texture files in the **heads** folder are wrong. Edit only the files in human\_male or human\_female etc. folders.

#### STEP 1 - Create head variation files for your custom race

When opening your race file, duplicate all head files you wish to replace with a custom texture. Remove all head files you do not want to be available for your race.

Open one of the variations and copy the texture map path


Open your computer's file manager and navigate to your Kenshi folder (usually C:\\Program Filesx86\\Steam\\steamapps\\common\\Kenshi)

And edit the path by pasting the copied texture map path at the end of it.

So, it looks like:

C:\\Program Filesx86\\Steam\\steamapps\\common\\Kenshi.\\data\\character\\skins\\human\_female\\human\_female\_head\_variant6\_diffuse\_HI.dds

Remove the . away from between the Kenshi and \\data

Then hit enter it takes a while, but Gimp is opening the file. Remove the x from the Load mipmaps and hit OK.



#### STEP 2 - Removing transparency

Now a warning. The image you open has transparency. I am going to show you how to remove it, BUT USE IT ONLY ON VANILLA TEXTURES or TEXTURES YOU HAVE THE CREATOR'S PERMISSION TO EDIT. This a copy rights thing. Do not edit files you haven't got permission to edit. If you do, do not publish them.

How to remove transparency from dds files:

1.  Open the dds file on Gimp.
2.  On your right, switch to channels. Turn alpha off (eye icon).
3.  Go to Layer > New from Visible
4.  Export as .png
5.  Close the vanilla dds (export does not change the file that was exported)
6.  Open the png in your preferred editing software

I'M SERIOUS DO THIS ONLY TO LEARN. DO NOT ALTER OTHER PEOPLE'S WORK AND PASS IT ON AS YOUR OWN.

#### STEP 3 - Edit the file, add transparency, export as .dds



1.  Do your edits and then **add transparency to the png**. Make sure it has an active alpha layer (Layer > Transparency > add alpha channel).
2.  Use the selection tool or some other method to select which parts you want with what transparency level. (In vanilla the eye will have 0 transparency).
3.  Pick eraser tool, make it 5000 pixels wide and opacity to 0.90. Move mouse cursor on the characters nose and hit enter.
4.  Export as .dds and BC3/DTX5 compression, GENERATE MIPMAPS (without mipmaps your texture will be black). DO NOT USE RXGB!

IF YOU ARE MAKING A LARGE IMAGE SIZE (larger than 1024x1024) you might end up with a black texture, even if you added mipmaps to it. Then you might have to make transparency mask from the red channel of your texture. For me the 90% opacity has been enough.

#### STEP 4 - Correct folder path for the file

Move the file you made to a heads folder in your mod folder. If you are making **alternate faces for vanilla characters** the folder path needs to be exact: character > skins > human\_female .\\mods\\yourmodname\\character\\skins\\human\_female\\filename.dds

If you are making a custom race the path is: .\\mods\\yourmodname\\character\\skins\\**YourRaceName**\\filename.dds



#### STEP 5 - Replace each variation texture map path

Replace each variation texture map path (link) with the correct path referencing where your new texture is. For each variation a different texture map.
