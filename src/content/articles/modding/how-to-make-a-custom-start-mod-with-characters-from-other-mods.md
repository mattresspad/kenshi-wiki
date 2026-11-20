---
articleId: how-to-make-a-custom-start-mod-with-characters-from-other-mods
title: How to make a custom start mod with characters from other mods
description: Relevant; How to move mods from Workshop to kenshi/mods
categories:
  - Modding
layout: modding
---

This is part of the mod patch series.

Relevant; [How to move mods from Workshop to kenshi/mods](/how-to-move-mods-from-workshop-to-kenshi/mods)

So, you want to make a multicharacter start using several characters from mods you did not originally make?

Yes, this is possible. Do note though, if you want to publish the mod, the end user (the subscriber) will also need to sub to all those character/race mods to use your start. This is called _being dependent._

1.  Move all those character and race mods, that include all the necessary character data, to your kenshi/mods folder (see [the guide](/how-to-move-mods-from-workshop-to-kenshi/mods) how to do that) Make sure you get them all, hair mods, clothes mods, dialogue mods etc. IF the original modder did not include them all in their mod.
2.  Create a new mod, make sure all the dependency mods are selected, including the vanilla mods. You might have to open your mod a second time just to make sure it is last and active.
3.  Create a new start (under the tab Game Start) or duplicate a vanilla start. For beginners we recommend duplicating a vanilla start, so you can see what things is needed for a start (right click).
4.  Duplicate also the start squad or make a new start squad.
5.  You can set the town here, but I do not recommend putting a dangerous town here, since you want to test your own start first to see if everyone spawns right.
6.  Make one character the leader. A squad does not need a leader though, you can set everyone as squad members if you want. But remember, a squad can only have one leader.
7.  If you do not remember all the character names you want to add, I recommend opening a secondary FCS for each character mod, so it is easier to find their names. Do not use the launcher, open the FCSs directly from inside the installation folder.
8.  Then it is just adding each character to the squad. If you have more than 30 characters, also remember to set the global recruit limit up. Max squad size and max faction size. Max faction is 30 and squad is 20 by default.
9.  If you are satisfied with them being in their original gear, you are done. But if you want to make alternate gear for them, you must duplicate the character file, so you do not mess up the other possible starts that character is in.
10.  And remember: if the character was not originally recruitable or playable, you need to also make them playable: \*Make sure their race is set playable \*Their race is added to a race group \*They have a player dialogue pack
