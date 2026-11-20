---
articleId: making-custom-ragdoll
title: Making Custom Ragdoll
description: This is work in process, currently poses as a notepad. Sept 10th, 2022
categories:
  - Modding
  - Skythe
layout: modding
---

This is work in process, currently poses as a notepad. Sept 10th, 2022

<table class="wikitable"><tbody><tr><th colspan="2">Glossary</th></tr><tr><td>Actor</td><td>A physics object, that has been made to its parent prim's likeness, active prim</td></tr><tr><td>Primitive (prim)</td><td>Basic building block that has not been turned into an actor yet, a mesh object without physics</td></tr></tbody></table>


Edit: 10th July 2023 I did manage to make a working ragdoll, but for an end user to be able to use it, they either have to move the rag from the Workshop folder to kenshi/data/ragdoll manually themselves, or both the mod maker and the end user need to use Re\_Kenshi, as the game engine does not load ragdoll files from mod folders, at all.

# Facts

-   IMPORTANT: if you are making a custom ragdoll for an animal race, which is unique and has no variations other people have made, just put the rag inside a ragdoll folder inside your mod and link to it directly.
-   If you are making a new ragdoll for humanoids or you want other modded similar creatures use the ragdoll, you need to either set up a .json file for Re\_Kenshi or instruct your end used to move the rag manually to the vanilla ragdoll folder. If latter, you need to also change all links that refer to the vanilla rag to point to your rag in the data folder. It might work, if all this change is done in the same mod that adds the rag you might be able to point all the links directly to your mods ragdoll folder. But if you are making a separate patch mod, you prob have to point to data.
-   You can save the ragdoll from Scythe to the vanilla data/ragdoll folder and just cut and paste it in your mod folder under ragdoll folder there and then link to it normally (it will work if the mod folder is in the user's kenshi/mods folder. If not, a manual move from mod to data/ragdoll or Re\_Kenshi is needed.
-   Same phs file name cannot exist both in the data/ragdoll and in the mods/yourmod/ragdoll folder, if you accidentally do this, you must save the ragdoll again from your master file with a new name. I have no idea why this happens.
-   Make all actors box shaped, because box is easier for the engine, thus more optimized, plus the head does not roll that way. Also if the ragdoll is lopsided, one side heavier than the other, it falls down easier on that side. <= this is why the actors should be offset and non-symmetrical. Do not make the rag symmetrical and pretty! (Tip by Boron)
-   One can only edit and **successfully save a working phs**, if the skeleton and mesh, used creating the phs, resides in the same root folder you are opening the phs from. If you see a cube with red circles, that means you cannot save a working phs. Just copy and paste your skeleton to your root folder and reopen your rag.

# How to make the actual ragdoll in Scythe

1.  Export your skeleton using [Kenshi\_IO\_Continued plugin](https://codeberg.org/Kindrad/Kenshi_IO_Continued) for Blender (replaces Kenshi import/export plugin). You need Blender 4.0. For newer Blender versions, see [Blender plugins](/modding/blender-plugins).  
    **Use a simple cube at the bottom as the mesh**, rigged to Bip01, do not alter the link in Scythe.
2.  Move the skeleton and mesh in to the data/ragdoll folder, (change your root to data/ragdoll if you have not already using the ROOT button in Scythe.)
3.  Find and insert the skeleton in Scythe using the Insert option on the right sidebar under the arrow tab/prim main tab, below the ROOT button. (Refresh to see the mesh first.)
4.  Select the skeleton using the select tool and go to the character/ragdoll tab, change the bone thickness to 4,5.
5.  Hit the 'create ragdoll' button (creates actors automatically)
6.  Delete all except the main bone's actors in the links tab, be careful to only select the one about to be deleted. (keep Bip01, arms and legs, torso, neck and head, delete hands, toes nubs and clavicles.) Jury is out on Pelvis and feet. Delete all orphaned joints. Be careful not to delete those joints you still need. **Might be easier to first reconnect the joints you need and then delete the rest.**
7.  Only the ball and hinge seem to work in game, fixed does nothing to relief the forearms flapping. Kenshi borrows the working rag from the non-carry line (in race FCS file) if carry line does not have a link to a functional rag. To test. the new rag link needs to be on all four lines (female, male, carry, non carry).
8.  Actor size DOES matter when calculating physics, however deattaching them in order to resize them using the numbers under wrench seems to break the ragdoll So just resize them using the resize tool. It seems you can unattach resize and reattach. What is important is to use the existing joints (select actor 1 or 2 respectively to reattach the joint). **Scrap that, it turns out all you need is the bone thickness to 4,5 and leave the actors untouched. Only one you need to touch is the Bip01, which you need to first reset rotation and then turn 90 degrees.**
9.  After deleting extra actors and links, you need to reconnect some links to keep the rag intact. So go to the links tab and go through them all, is there an half-orphan joint? See which is missing, 1 or 2 and use the joint tab to select the missing actor. Make sure the joint stays selected. Actor 1 seems to be the actor on top/closer to center and actor 2 is down/away from body center.
10.  Test your rag using the hammer. If it falls apart, there is an unconnected link somewhere. If the actor stays stuck midair, it means there is an orphan joint at the end of an actor chain somewhere. You need to either connect it, if the chain should continue, or delete it if your chain has ended.
11.  Now the tedious part. You need to set the link joints for every joint that is left. Open a second Scythe and copy the joint limits from the vanilla rag one by one. You will see the change on the joint, the two 'flaps' now forming an open book looking shape. The 'pages' between the flaps is the allowed area for the joint's motion.
12.  Tedious part 2. You need to also rotate each joint to correct orientation. The 'book' opening directed towards back on knees and front on elbows. Best done in 'select joint, joint limits, then rotate, next joint' fashion.
13.  When you have done all this, begins your editing journey. Play with joint limits and spring and damper, test in game. Rinse and repeat step 13. **Remember to always save with a different name**, Scythe does not save over old names. It says it does, but the result is a non-working rag. Always a new name, CUT AND PASTE to your mod's ragdoll folder. Cut, not copy. Do not forget to change the FCS race file's link with the new name.

# Journal of my Process

September 10th 2022

Figuring how to prevent the forearms from flapping when riding

-   closing the hinge limits rotation angle to 0 and 0 did not help
-   making the joint fixed did not help
-   deleting the forearms actors works, no idea if this will result in a game crash, it most likely will affect the arm severing (further testing needed). Edit: luckily it does not, everything works as they should.
-   Managed to make it work (hands do not flap) but the ragdoll seemed too light, it bounced from ground and levitated. Instead of adding more gravity to the prims, I opted for copying the vanilla limb actor sizes (bigger actors -> heavier ragdoll) however doing that detaching and reattaching actors and now the ragdoll stopped working (KOed character remains standing) so apparently this actor resizing process was wrong. **Yeah turns out one does not need to touch the actor sizes, at all.**


22nd September

I remade the entire ragdoll from scratch for the fifth time XD turns out I did too much edit previously. It is best to just keep the rag Scythe automatically generates from the skeleton. Just turn the bones to 4,5 thickness first, then delete all excess bones and joints and adjust all remaining joints to correct orientation and joint limits. Then I removed the forearm actors and joints.

The magic was to NOT resize, move or rotate any other actor than the Bip01, it needs to be turned 90 degrees. Do not make the ragdoll pretty. It needs to be offset and non-symmetrical for it to fall correctly.

**Now the current issue is** getting Kenshi to read the ragdoll when a subber is using it. Apparently, Kenshi does not load the contents of the mods/mymod/ragdoll folder. So far only manually moving the ragdoll in the data/ragdoll folder has worked.

Edit: I have come to learn there is this third-party app called RE\_Kenshi. It fixes this ragdoll not loading issue nicely. Only problem with that is it crashes the game upon first launch after the reboot of the computer. Hoping this issue gets fixed soon (edit: Nov 9 2022, this has been fixed in RE\_Kenshi version 0.2.6 however it is not public as I am writing this yet) .

I have tried:

-   calling the ragdoll with .\\data\\ragdoll\\CBTRagNoFA9.phs in the FCS race file. This only works if the ragdoll is manually moved to data/ragdoll
-   saving the ragdoll from Scythe directly to mods/mymod/ragdoll folder and calling it with \\data\\ragdoll\\CBTRagNoFA9.phs or .\\mods\\mymod\\ragdoll\\CBTRagNoFA9.phs neither worked.
-   FCS does not allow links pointing to other folders but data or mods/mymod, so I cannot point to .\\steamapps\\workshop\\content\\233860\\2866188453\\ragdoll for example.
-   Saving the rag as vanilla ragdoll name and seeing if it overwrites the vanilla one, it did not.
-   Using my ragdoll link only on the carry rag line, it did nothing
-   It looks like the game does not load the mods/mymod/ragdoll folder contents into data/ragdoll.  
    I tried to circumvent by putting the ragdoll into the mods/mymod/character/meshes/male\_skeleton folder, that did nothing either


I found out, that if you load the ragdoll to Scythe from another root than data/ragdoll, the skeleton's cube turns into with the red circle. That cannot be saved further. Only with white mesh and skeleton can. My current theory is this is because the skeleton I used resides in the ragdoll folder. -Confirmed, tested by pasting the skeleton and mesh to another folder along with the phs. Opening that from there works perfectly.
