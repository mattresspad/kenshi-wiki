---
articleId: how-to-regenerate-blendmap-files
title: How to regenerate blendmap files
description: This guide was compiled by Skyattraction, curated by Cattrina.
categories:
  - Modding Guide
  - Modding
  - Biomemap
  - Biome
layout: modding
---

## **How to edit biomes with BiomeSplitter**

This guide was compiled by Skyattraction, curated by Cattrina.

Kenshi developers have provided us a link to download BiomeSplitter. See [this Lo-Fi forums post for the link.](https://www.lofigames.com/phpBB3/viewtopic.php?p=67933&sid=3952eb96963a17ef57ddc595e75749fa#p67933)

1.  To make BiomeSplitter run, make sure you have setup for the same environment as for KenshiLib. You can find detailed guide at KenshiLib git repo. Before installing make sure you don't have old/standalone versions of VS2010 redistributables already installed (only one installation can exist and yes VS2010 is a must).
2.  Unpack BiomeSplitter in a separate dedicated folder in your computer.
3.  Biomes are represented by certain color indexes in biomemap files. You can find the exact value in "index" parameter of biome options in FCS. To make a new biome you should assign an unique color to it. See also: [Map Biome Areas + Region Correlation](/map-biome-areas-region-correlation) for the vanilla colors list.
4.  Make copies of both biomemap.png files from "data\\newland\\land" and "data\\newland\\land\\overlaymaps" folders and give the copies a name different from the vanilla files. The copies can remain in the vanilla folders, or you can move them if you want to.
5.  Open the copied files in a program, which doesn't compress files or alternate colors after saving, i.e Paint or Aseprite or Gimp (don't use something like Photoshop, fancy software tend to soften the edges and blend the colors).
6.  Recolor or paint new biome on both maps, check after saving that color indexes aren't changed. Make sure there is no blurring of any kind or pixelation artifacts, each color need to be raw-edged **single color with no variation** what so ever and the color index need to match either vanilla Kenshi biome entry, or your new biome entry **exactly.**
7.  Make sure the file size of your new biomemap does not exceed the vanilla file size, this is because the game allocates memory based on the vanilla size and if ReKenshi is used to swap the files, the new file needs to fit inside the allotted space. Try lossless compression [https://exif.tools/optimize](https://exif.tools/optimize).
8.  Move your recolored biomemap version to the same dedicated folder with BiomeSplitter. **Run the program** - it will generate replacement files for blendmap.png, blendinfo.dat (these you need) and debug.png (this is irrelevant). Do not rename the blendmap nor blendinfo.
9.  Paste all the new files inside your mod, preferably in identical folder structure as the vanilla files are in.
10.  You'll need to provide paths to these files from your mod folder via ReKenshi, so the game replaces the vanilla ones. You will need to replace paths for all generated files. AKA **ReKenshi JSON file** is a must to make the new biomemaps to work, so follow the instructions on ReKenshi's wiki how to set up the JSON for your mod. See [ReKenshi wiki](https://github.com/BFrizzleFoShizzle/RE_Kenshi/wiki). It is very important to follow the exact pathing.

{    "FileRebinds" : {		

".\\/data\\/newland\\/\\/land\\/blendinfo.dat": "$(modroot \\"Re\_Kenshi\_experiments\\")/newland/blendinfo.dat",		

".\\/data\\/newland\\/land\\/blendMap.png": "$(modroot \\"Re\_Kenshi\_experiments\\")/newland/blendmap.png",		

"./data/newland/land/biomemap.png": "$(modroot \\"Re\_Kenshi\_experiments\\")/newland/biomemap1.png"	

} }

Above an example of the JSON code, you need to use your mod's name instead of the Re\_Kenshi\_Experiments. And naturally the biomemap1.png with the name you have set for the new biomemap.

### Checklist

-   VS2010 development environment (same as ReKenshi lib)
-   BiomeSplitter installed in a decicated folder (possibly allowed through your antivirus)
-   make sure DevIL.dll is also in the BiomeSplitter folder, if your antivirus likes to eat dlls. It should be there when extracted.
-   new biomemaps: png format, size: 1024x1024px, file size under 57KB if your file is bigger try: [https://exif.tools/optimize](https://exif.tools/optimize)
-   new biomemaps: color indexes match FCS biome files, new color unique, no color variation or pixelation, no blurring, no lossy compression
-   ReKenshi JSON inside your mod to replace vanilla file paths with your mod's.
-   Inform your subscribers they need ReKenshi installed on your workshop page of the mod.  


## Original conversation

This conversation was held on Kenshi Community Discord on April 23th 2026 between Skyattraction, ScandisaurusRex and Genpretz. As I have not tried any of this out myself, I can only summarize what is being discussed. -Cattrina

-   You need Visual Studio 2010. If you set up ReKenshi lib and IDE for making script extension mods for Kenshi, you should already have this
-   BiomeSplitter utility is an old software, that is able to regenerate blendmap files. But it requires the Msvcr100d.dll, which is part of VS 2010. A link to get the BiomeSplitter utility at the bottom of https://www.lofigames.com/phpBB3/viewtopic.php?f=11&t=15093&p=67933 thread



**Skyattraction**

I think there's some trace of solution, i found post claiming you need to regenerate blendmap files (blendmap.png + blendinfo.dat)with BiomeSplitter utility. But I can't make it open on my system by any means, probably too old and need specific libraries. Maybe you'll be more lucky.

**ScandisaurusRex**

I'll give it a try a little later today, maybe it'll finally be cracked

**Skyattraction**

Here's that topic, with utility file  https://www.lofigames.com/phpBB3/viewtopic.php?f=11&t=15093&p=67933

**ScandisaurusRex**

Okay, I got an error code out of it at least. Msvcr100d.dll not found

And search the Kenshi folder doesn't turn up any .dll (or anything) under that name or generally under msvcr.

Apparently it's part of the Microsoft 2010 C++ redistributable

which... UGH download is no longer available with Microsoft directly


**ScandisaurusRex**

I found a safe archived version of the 2010, installed it - still getting the same error message. Might be very close to the end of the line unless someone has a 2010 machine kept in stasis lmao

**ScandisaurusRex**

Okay I may be on the cusp of figuring it out if I can find where the 2010 dll directory is

**ScandisaurusRex**

Dang. So close, got the appropriate.dll files. Those errors are gone. "application is unable to start correctly 0xc000007b"

For posterity's sake at least

And as a last ditch effort, attempting to run Kenshi having removed the blendmap and blendinfo.dat while leaving the biomesplitter executable in the newland folder results in a crash.


**ScandisaurusRex**

Tried running an old-ish 32-bit tool called dependency walker to see if I could figure out what other issues were going on - I'm 50000% out of my depth. I have no computer science background, I think I've hit the limits of what I can figure out how to do

**Skyattraction**

Yep, i hit the wall at the exact same moment as you...

**Skyattraction**

Didn't try dependency walker though

**ScandisaurusRex**

It's uh, for someone with an actual comp-sci background I think

I could not make heads or tails of the read out

**Genpretz**

I'll try an take a look and see if I can learn anything.

Here's that topic, with utility file  https://www.lofigames.com/phpBB3/viewtopic.php?f=11&t=15093&p=67933 (edited)torstai 23. huhtikuuta 2026 23.01

**Genpretz**

Amazing find btw

Oh wait, I think we already had this.

Oh wait no this is different

I thought this was the same file as joiner.exe in \\Kenshi\\data\\newland\\land\\overlaymaps since they both use the same .dll

**Genpretz**

Sweet, this thing makes a blendinfo.dat, blendmap.png, and debug.png from the biomemap.png.

Dang. So close, got the appropriate.dll files. Those errors are gone. "application is unable to start correctly 0xc000007b"  For posterity's sake at least

**Genpretz**

I'm not sure why, but I was able to run the file without having to download any extra dependencies.  I think it's probably because I have my dev environment set up for RE\_Kenshi/KenshiLib.  For compatibility, they use the same dependencies the developers would've used when making the game so I must've already installed everything.

**Skyattraction**

Ok ty, I'll try to install these mods actually

**Genpretz**

Im not referring to the mods exactly. I mean the dependencies required to compile them and make mods/plugins with them.


**Skyattraction**

I understand, just hope to find out these dependencies along installation

becuse dep walker was no help so far

**Genpretz**

I'd start here. https://github.com/allenk/WinSDK71\_VisualStudio2019 This is the only thing I could think of that would be responsible for me not having an issue when both of you did.

I was looking at it earlier for a sepereate reason so I dont remember exactly what he said, but If you follow that guide you'll see he mentions something about not installing cerain versions of the MSVC 2010 Redistributables because they aren't compatible with modern systems or something. (edited)perjantai 24. huhtikuuta 2026 8.30

"Since the VC 2010 runtime is no long compatible with Windows 10 and SDK, you should not install the old redistribution files. We will try to install new version later."

I have those files already in my PATH so they would automatically be found when opening the file.


**Skyattraction**

So after reading this, removing all manually loaded from internet dlls, uninstalling old 2010 redistributables, and installing sdk 7.1 and VS2010 with help of this page https://github.com/BFrizzleFoShizzle/KenshiLib I've finally managed BiomeSplitter to run!

Didn't test yet if generated files actually affect biomes, gotta do it later.


\[Editor's note: they tested and it worked hence the guide on top\]
