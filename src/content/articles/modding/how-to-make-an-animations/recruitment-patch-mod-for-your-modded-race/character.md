---
articleId: how-to-make-an-animations/recruitment-patch-mod-for-your-modded-race/character
title: How to make an animations/recruitment patch mod for your modded race/character
description: You may have noticed once or twice a fancy new race mod you so SO much want to play with, but oh no, it does not have a patch for your favorite animations mo…
categories:
  - Modding
  - Modding Guide
layout: modding
---

You may have noticed once or twice a fancy new race mod you so SO much want to play with, but oh no, it does not have a patch for your favorite animations mod or is not recruitable by your favorite recruitment mod. And you fear no-one might not be making a patch mod for a long long time for it.


No worries!! Today YOU get to be the helpful mod maker to make the race a patch!! I will walk you through it.

1.  First the most important part, you must move both, the race mod and the animations/recruitment mod in to your kenshi/mods folder. See here how: [How to move mods from Workshop to kenshi/mods](/how-to-move-mods-from-workshop-to-kenshi/mods)
2.  Then you need to open FCS. Do not open it from the Steam launcher (the Launch Modding Tool option) instead go to the installation folder; usually it is C:\\Program Files (x86)\\Steam\\steamapps\\common\\Kenshi (your mileage may wary). Doubleclick kenshi\_x64.exe open (you might not see the exe if you do not have the file endings active in Windows)
3.  If you have not done any modding before, you should now have only the two mods as an option below the line.
4.  You should order them here in the preferred order, usually it is race first and then animations and recruitment mod
5.  Have both mods and all the vanilla files above tagged and create a new mod (see image)
6.  Give a distinctive name to your mod, I suggest something like mod a and mod b what kind patch
7.  Now open a second FCS, On the second FCS you open ONLY the race mod (+ vanilla files, always vanilla files)
8.  Open a third FCS,on the third FCS you open ONLY the animations/recruitment mod (+ vanilla files, always vanilla files) . These are your reference files so you will be finding stuff easier.


This is where the two patch mod processes differ

RECRUITMENT PATCH

1.  Find all the characters that need to be turned recruitable. You know they all are of this new race, so fastest way to locate them, is to find the race first. If you do not know the race's name, use the second FCS where you have the race mod open and click 'changes' above. If you do not see columns, right click to see type. Scroll until you come to RACE. Copy the race name and come back to FCS 1, paste that in the search in Everything or races tab. Right click the race name and List References. You will get a list of all things where that race is used, open each character.
2.  Add a player dialogue pack to each character. This is the pack the character uses after they have been recruited,
3.  Now you need to find all squads those characters populate. Use the character file names as a search word in the squads or everything tab (yeah one by one). Right click each finding and List References, open each one.
4.  Now go to the third FCS and find a suitable recruitment dialogue pack for them. Pick one carefully minding its conditions. Copy its name.
5.  In each squad, use the drop down menu to add a leader dialogue and a squad dialogue and use the dialogue pack name as a search word.
6.  Repeat to all character squads you want to recruit
7.  SAVE
8.  Recruitment patches do not need importing, just enable it and test.

Do note, a character can only have one dialogue pack. So if the character/squad already has a pack, then consider adding only the recruitment dialogue inside their dialogue pack's PLAYER\_TALK\_TO\_ME section.

You can naturally delete their old one and replace it with the new, but before you do that, make sure the character still has all the dialogues it needs for the original mod to still function.


ANIMATIONS PATCH

1.  Find the race you want to add the animation to, open the race file
2.  Use the drop down menu to add animation files, use your third FCS to find the name if you cannot distinguish which animation is which (some animations are for animals). There is seldom more than three options usually.
3.  SAVE
4.  Animations patches do not need importing, enable and test.

See also: [How to make a face/hair patch for modded and vanilla races](/how-to-make-a-face/hair-patch-for-modded-and-vanilla-races)
