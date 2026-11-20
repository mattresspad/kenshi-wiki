---
articleId: how-to-move-mods-from-workshop-to-kenshi/mods
title: How to move mods from Workshop to kenshi/mods
description: When you subscribe to a mod on the workshop, it's saved to Steam\steamapps\workshop\content\233860, under its steam ID number as the mod folder's name. For e…
categories:
  - Moving mods
  - Modding Guide
  - Modding
  - Copy the number part
layout: modding
---

When you subscribe to a mod on the workshop, it's saved to Steam\\steamapps\\workshop\\content\\233860, under its steam ID number as the mod folder's name. For example, this mod's [https://steamcommunity.com/sharedfiles/filedetails/?id=2385662816](https://steamcommunity.com/sharedfiles/filedetails/?id=2385662816) Steam number is [2385662816](https://steamcommunity.com/sharedfiles/filedetails/?id=2385662816).



For you to be able to edit a mod or to make a patch for it, you need a copy of it in the

..\\Steam\\steamapps\\common\\Kenshi\\mods folder, and the mod folder's name needs to be changed to the exact same name as the .mod file inside it (without the actual file extension).

1.  First copy the number part you see on the mod's (you want to edit) steam page's link (open Kenshi workshop and the mod page) like steamcommunity .com/sharedfiles/filedetails/?id=2319337000 so copy the number part '2319337000' (whatever it is for your mod in question). Make sure you have Steam on and you have subscribed to the mod.
2.  Go to file explorer in your computer and navigate to the Kenshi installation folder. Go back to steamapps folder and click open the ..\\Steam\\steamapps\\workshop\\content\\233860 folder.
3.  use search within the 233860 folder with the number you copied. You'll find the original mod. Allow it to load entirely. Copy the folder.
4.  Go back to Kenshi/mods and paste the copied numbered folder there.
5.  Open the folder and copy the name of the .mod file.
6.  Go back to kenshi/mods and **rename the numbered folder** with the copied mod name. Or alternatively rename the mod file and the folder something else. If you want, you can unsub from the original mod. The **mod folder needs to be _exactly_ the same name as .mod file** (without the .mod file extension)**, otherwise FCS won't recognize it.**
    -   If you stay subscribed to the original mod, the version you moved into the mods folder will prevent the workshop version from being used.
7.  Now you can open the copy mod in FCS and edit it to your heart's content or use it as a dependency for your patch.
