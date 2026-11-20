---
articleId: re-kenshi-extra-extensions-modding-how-to-use-the-silent-world-states-and-variables
title: "Re Kenshi Extra Extensions Modding: How to use the silent world states and variables"
description: Re_Kenshi is not new, but modding with its script extender is new, only few months old at the time of writing this (April 2026). For this reason the how to g…
categories:
  - Wip
  - Modding Guide
  - ReKenshi
  - Variables
  - Modding
layout: modding
---

This is a very very WIP


Re\_Kenshi is not new, but modding with its script extender is new, only few months old at the time of writing this (April 2026). For this reason the how to guides will probably lack accurate information and they are subject to be changed a lot, at least until the entire system stabilizes. I myself started using this system recently, so I apologize for possible errors -Cattrina

### What do you need in order to start making mods with Re\_Kenshi's new system (for extra extensions)

-   Re\_Kenshi ver 3 onwards (Nexus)
-   Re\_Kenshi extra extensions mod (Steam), manually moved to your kenshi/mods folder
-   FCS\_Extended (Nexus), zip extracted to your kenshi installation folder (main)

BFrizz has a link on his workshop mods to these as well as his wiki ([https://github.com/BFrizzleFoShizzle/BFrizz\_Extra\_Extensions/wiki](https://github.com/BFrizzleFoShizzle/BFrizz_Extra_Extensions/wiki)) the links may change. Do note, that all of these contain exe and dll files and may be considered a threat by your antivirus or firewall. At least FSecure antivirus automatically deletes unknown exe and dll files. Be warned tho, it is not recommended to allow the entire internet through your firewall. Be tactical, be safe. Only allow what you know is safe.

Re\_Kenshi automatically downgrades your kenshi.exe to previous version, this has only one noticeable drawback: the free cam stops working, however, there is a mod available on Steam that reinstates the free cam. Edit: May 2026 I hear the free cam is now also part of ReKenshi without the mod.

### How to install

1.  Install Re\_Kenshi. Re\_Kenshi itself has a very detailed instructions on installation on its Nexus page. Follow them to the letter.
2.  Subscribe to Re\_Kenshi extra extensions mod on Steam. Do not COPY it to your kenshi/mods. AT THIS TIME extra extensions is subject to get updated frequently, so you need to maintain the sub to it. You should not have two extra extensions folders in your computer at the same time\*.
3.  Download the FCS\_Extended from Nexus and unzip it **directly** in the ..\\Steam\\steamapps\\common\\Kenshi folder. Not kenshi/mods, the main installation folder.
4.  Run FCS\_extended.exe to use the new improved FCS with the new variables option at the end of the game world window. Instead of vanilla FCS. Do note, Steam has to be **on** to use the FCS\_extended.

(\*If you are having issues fe. with antivirus killing your dlls, you can **CUT** the extra extensions folder to your kenshi/mods. See [How to move mods from Workshop to kenshi/mods](/how-to-move-mods-from-workshop-to-kenshi/mods) and **unsub**. Do not move it if you have no issues. Remember to check for updates regularly if you move it.)

You do not need Visual Studio or know how to code with C++ to use FCS\_extended and the new silent variables. But if you want to make your own enums or UI behaviors, things that cannot be done using the traditional modding with FCS, you do. I am going to make a tutorial about that too, as long as I have learned that myself. Might take awhile.

### Silent Variables

Traditional Kenshi modding only offers limited possibilities for booleans and variables. Noticeably the best boolean we've had so far is the fake faction ally status. The major hindrance with that is it will announce to the player every time the boolean is toggled with the 'faction x is now you allies' notification. And you cannot really do complex dialogue coding if you have to constantly be aware of how many notifications gets spammed on the screen.

With Re\_Kenshi extra extensions you can now make variables that can be toggled on and off without the player noticing. Plus numerical calculations, fe. calculating remaining debt (do note, however, the player basically could import their game and nullify the progress thus becoming debt free, so...(see bottom of this page))

#### The usage

1.  Use the FCS\_extended.exe (FCSE) instead of vanilla FCS (VFCS). A CMD prompt opens. If you get an error talking about Steam, you forgot to turn Steam on.
2.  Tag on BFrizz's Extra Extensions from the extension panel If that is not an option, you either do not have the mod in the workshop or in kenshi/mods or you are missing some of the dlls that should be inside.
3.  Open any mod or create a new one, just like vanilla FCS
4.  There is a new variables category at the bottom of Game World category list, after Effects and Everything. If you do not see it, you are not using FCSE.
5.  Create a new variable. This is a similar window as world states have, but you do not link anything here. This is just to host your value. The variable type is Integer 32 bit and you add to or subtract from it inside the dialogue, just like you do with faction relations. Give it a distinctive name you remember.
6.  Now how you use your variable is up to you, but simplest way is to make a world state (or several) for it. BFrizz has kindly added variables as options in the world state drop menu. Usage is the same as world states in VFCS. The options include ==, <, > and 'all these variables combined equal'
7.  Open your dialogue where you want to use your variable. On the line where you want to change the value use 'add to variable' on the drop down menu furthest to the right. Negative values subtract. On the line you want to check that value you have three options; you can set the world state you made as a condition (just like VFCS), use the ==, <, > and 'all equal', or you could make yourself a _**custom dialogue condition**_ and use that. Do note the latter option requires the full Visual Studio and C++ coding shebang. So if you are a beginner, I recommend not to do that.
8.  In the far right drop down menu you also have the ==, <, > and 'all equal' options, plus you also have a 'set value' which you can use to reset the variable or set the variable to specific value you want.



IMPORTANT!! Variables are persistent through normal gameplay, but are reseted upon an import. AT THIS TIME even variables saved as world states are NOT persistent through an import. Make a traditional fake faction 'is ally' to save data through an import.
