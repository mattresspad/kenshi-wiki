---
title: "How to make a color map for your armor"
description: "See also About armor textures, How to use different texture maps"
source:
  title: "How to make a color map for your armor"
  revision: 93797
categories: ["Modding"]
---

See also [About armor textures, How to use different texture maps](/about-armor-textures-how-to-use-different-texture-maps)

This beginner's tutorial aims to teach you how to make a color map for your armor.

## What is a color map?

    A color map tells the game which parts of the texture you want to color. It consists of four color options, red <255,0,0>, black <0,0,0>, green <0,255,0> and yellow <255,255.0> (any combination of R and G fe. <10,128,0>). Red is color 1, green is color 2 and yellow is a combination of the two, its mix is related to the how much red compared to green the RGB has. See more info on blue channel below, on facts. Black is no coloration.

Blue channel on the color map is reserved for metallic.

So, if you have a metalness map from texture map generating software (like substance painter), you can use the metalness map as a mask on the blue color channel of the color map.

See also: >>>>>> [Example on Color Map Process](/example-on-color-map-process) <<<<<<<

Horse Mail Armor, I want the mail to be colored blue and the attachment trim, which is brown leather to be black. But I want the hooks to stay metal colored. So I made a color map where the entire mail part is <255,0,0> the color 1 and the trim is color 2 <0,255,0>. Hooks I left black for no color <0.0.0>

And the COLOR\_DATA file would be something like this. I am washing the brown trim with dark grey, because the brown is already a dark color. True black would make it unnaturally black and all the details would be lost.

## Facts

-   Shirt/vest layer only takes red and black, mesh parts have also green and blue available
-   Color is applied over the base color the texture has. So, to get pure color\_data colors your texture needs to be light grey. If your texture(diffuse) has actual colors the result will be combination of the color wash and the base color. (Imagine dyeing a red shirt blue, the result would be purple).
-   Red (RGB 255,0.0) is for FCS color\_data file color 1, Green (RGB 0,255,0) = color 2
-   Blue (RGB 0,0,255) is for metallic parts
-   Black is absence of color, white is all colors
-   Yellow (RGB 255,255,0) is both green and red
-   Teal (RGB 0,255,255) should technically be both color 2 and metallic
-   Purple (RGB 255,0,255) should be both color 1 and metallic
-   Orange would be some murky mixture of both channels, favoring the color 1.
-   MUST use binary sizes (125x125, 256x256 ,1024x1024, 512x1024pixels)

  
Kenshi can tolerate variable changes in the color's tone, darker, lighter etc. Having the color at full 255 means it will be washed with pure color value from the color\_data channels. If the color map value is darker, Kenshi tries to adjust the values of the color\_data to fit the map tone.

## Step-by using the texture as a reference

1.  Finish the making of the garment, have at least its UV map layout done and locked. Finish the texture layout.
2.  Open the texture in a painting program, that allows you to paint with pure colors. All free programs do this. Gimp recommended.
3.  You have two colors and combinations of them in your color palette: red and green (and blue).
4.  Draw or otherwise paint pure red on a new layer on the map (the original texture remains as background layer) on those spots you wish to be colored with the color 1 from a color\_data file. Do the same with green (color 2). You can paint black on everywhere else (== use the color the texture has) and just have the colors 1 and 2 be special decorative bits, like edges or emblems.
5.  Keep the size of the color map as small as you can. A single color map can be like 128x128 pixels. Of course, if you need small details you have to keep the color map larger.
6.  Export as .dds, compression DTX1, mipmaps enabled (Not all paint programs have these available, but Gimp does), **use only binary size** 512x512/1024x1024/512x1024 pixels etc.
7.  Move the .dds in your mod's textures folder and link to it in the garment's FCS file.
8.  **Set 'don't colorize' to false on the FCS** file of the garment, you need to do this with all pieces (pants, top, boots etc).
9.  If you want the garment to use faction colors, you are done. But if you want to make several color variations of the garment, then you'll use the pull down menu and add 'color' (color\_data) file. Just add any and then replace it with a copy.
10.  Set the color 1 and color 2 RGB values. You can eyeball them, or use a color picker and see its RGB value in your paint program. However you do it, you prob. have to relaunch the game several times to see how it looks in game in different lighting settings. (Do not forget to add the garment to your test start's character).

## Step-by using the UV map as a reference

1.  Import the item mesh in Blender and open them in UV edit mode to see how they are laid out.
2.  Select all the pieces on the actual mesh you want to see colored with color 1, which allows you to isolate them from everything else.
3.  Click + New on the UV side to obtain a black background. If you use A here, you can turn all selected UVs orange. Take a screenshot of this UV layout (no unwrapping). (The other method is to export the UV layout, but you would need to turn UV sync off first)
4.  Put the screenshot in your image editor, edit the excess edges so you get a perfect square. Then pixel size must be a power of 2 (512x512 or 1024x1024 for example)
5.  In your image editor tool, select all pieces you want to color and paint them Red (If you use a new layer the paint can won't paint only the lattice. You want a solid color on the selection)
6.  Invert selection and paint it green
7.  Turn the red and green layer off so you can see underneath and select all the areas you want to be left without coloring (or if you want to use the combination colors somewhere add the yellow in this phase). Turn the layer back on and hit delete to cause holes on the green. (If you want to use a combination of color 1 and color 2 add the yellow in this phase.)
8.  Add a new layer and paint that totally black and position it under the red and green layer (or just paint the deleted areas black, whichever is more convenient).
9.  Merge all layers.
10.  Export as .dds, compression DTX1, mipmaps enabled (Not all paint programs have these available, but Gimp does), **use only binary size** 512x512/1024x1024/512x1024 pixels etc.
11.  Make a duplicate of the armour file in FCS
12.  Replace the "material" with a copy
13.  Edit the material copy and put your color map link to it
14.  In the Armour file in the FCS **put "Don't colorize" as false**
15.  Add a color from the drop down, or make a new one

## Glossary

<table class="wikitable"><caption></caption><tbody><tr><td><b>Color channel</b></td><td>Refers to the RGB channels. R is red, G is green, B is blue. On the color map the color 1 is linked to the red channel, and color 2 is linked to the green channel. Blue channel is for metallic. Color wash values for each channel are set in a color_data file set for the armor. Blue channel gets no color wash, it is treated as metallic.</td></tr><tr><td><b>Color_data</b></td><td>A file type in the FCS, has two channels: color 1 (red) and color 2 (green), input in RGB values. Usually used in faction colors.</td></tr><tr><td><b>Color map</b></td><td>A RGB layout of colors. Each color (Red, green,blue) matches the layout of the actual texture (diffuse) layout of the garment. This is used to allow the garment to be colored fe. by the faction colors, or just to make several color variations of the item without the need of a new mesh or a new texture for each color variation. Works on garments only. Buildings and furniture use vertex painting.</td></tr><tr><td><b>Color wash</b></td><td>A term originated in yarn dyeing, a semi-translucent color (very watery) that is either poured over or yarn is dipped in it, to generate a new color combination, a mixture of the base color of the yarn and the color wash. Tarnishing, if you will. In Kenshi all color_data colors are washes, even though they can be so dark sometimes the base color does not show much. And vice versa, also texture can be too dark to not show the color wash.</td></tr><tr><td><b>Shirt/vest layer</b></td><td>A characters outfit usually consists of mesh pieces (body, legs) and an undershirt. The undershirt is the shirt layer. It uses the character skin layout and is texture only. In FCS there is a separate place for shirt layer texture links. They do not get a material file. (Editor's note, a shirt layer CAN have mesh parts and use the material files, in vanilla they just do not use this anywhere).</td></tr><tr><td><b>UV map</b></td><td>UV is on a texture map same as X and Y are on a traditional coordinate display, except the values cannot be negative. Each U and V display one vertex' location on the map and all the connections to its neighboring vertices forming a lattice of <i>edges.</i> The entire whole of all UVs in the lattice is called an <i>UV map.</i> It is the 3D mesh object cut in pieces by seams and laid flat, mapping where each vertex sits.</td></tr></tbody></table>
