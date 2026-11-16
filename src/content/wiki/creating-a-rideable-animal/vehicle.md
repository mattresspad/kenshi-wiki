---
title: "Creating a rideable animal/vehicle"
description: "I claim no responsibility if you break something XD -Cattrina"
source:
  title: "Creating a rideable animal/vehicle"
  revision: 95377
categories: ["WIP","Needs cleanup","Animation","Modding","Custom race","Custom character","Portrait","Stumps","Armature","Icons"]
infobox:
  title: "Creating a rideable animal/vehicle"
  groups:
    - heading: null
      rows:
        - ["Data1","•\thead, neck and headnub exactly where the game expects them. You do not need to rig any vertices to them."]
        - ["Data2","•\tThe riding bone mid-back. This is renamed ‘Bip01 L UpperArm’ and the original L upperarm needs to be renamed something else, fe. Bip01 L UpperArm 001"]
        - ["Data3","•\ta cart bone."]
        - ["Data4","•\tAny other extra bone you think you need. Please note, that every extra bone is a burden to the game engine and should only exist if you really need one. Fe. rhino horns on the snout do not need bones, as they move with the head. A tail would need 1-3 bones to move smoothly (most animal skeletons already include these)."]
---

_**This article is a Work in Progress. It may contain out of date or incomplete information.**_

<table class="wikitable"><tbody><tr><td></td><td><div>This article is in need of a <a href="/category/needs-cleanup">clean-up</a>.<br>Please help Kenshi Wiki <a target="_blank" rel="noreferrer noopener" href="/creating-a-rideable-animal/vehicle">improve this article</a> by re-organizing parts of the page, checking grammar and spelling, and doing other helpful things to correct the content.</div></td></tr></tbody></table>

_I claim no responsibility if you break something XD_ -Cattrina

This is very very WIP. Updated 23rd October 2024 and contains my journal when making the horses

For a humanoid skeleton with a tail, I recommend not adding new bones, as it breaks the sliders. Instead unlink the left-hand prop bone and link it to pelvis. Naturally you will have to remake all 166 animations for the tail to move. (Credits to Kindrad). If you still want to do it, you have to remake the sliders. See this tutorial: [Custom character mesh and editor sliders](/custom-character-mesh-and-editor-sliders)

Read also [Riding NPCs, how to spawn a NPC already carrying another NPC](/riding-npcs-how-to-spawn-a-npc-already-carrying-another-npc) and [Character portrait appearing behind other character portraits](/character-portrait-appearing-behind-other-character-portraits)

Click here for PDF with more data about the Sage Steeds: File:About Sage Steeds and Rideable Toter Instructions.pdf

## About Skeletons and Portraits

Edit 1: September 1st 2022: I have now tested and this setup works with the portraits without any issues. Edit 2: June 5th 2023 however this set up does not work with Kenshi's game engine. The main issue is the game uses hidden animation priorities to perfectly smooth the transfer from animation to animation, meaning it expects the 'back leg bones' to be named same as human legs. When they are new bones with new names the game does not understand them to be limbs, therefore several animations play simultaneously making the toter walk funny. Back to the drawing board.

So make your toter's skeleton by adjusting the human skeleton. This naturally means you have to remake all animations, but you would have to do it anyways if you wanted to make a toter. Edit 2: Sept 2: Apparently it does not matter much where the photobooth bones are, if they are somewhat in the photobooth area, what matters more, is the location of the Bip01 bone. So you can move the horse forwards to have the front legs align with the center (from the image shown).

  
Edit 3: August 8th 2024. I have now found out, that the portrait vanishes when you misalign the mesh from its original armature. Maybe because you imported in Blender without tagging 'use selected skeleton' or you imported it with its named armature, and did not import it on vanilla armature. At least for human characters importing the mesh back to Blender using the 'use selected skeleton' and then exporting it correctly out fixes the portrait missing. Have to test on animals. I still think the main issue with the bulls is the fact the head is in the wrong place.

Edit 4: September 19th 2024. Scrap the setup show in the image above. You MUST make the armature using human legs as backlegs and human arms as front legs. Keep the head and Bip01 bones where they are, but edit all the other bones. You can add new bones as a side, but do not add new bones in the middle of the chain of the legs. I think it will be fine everywhere else, but Kenshi plays additional animations for the legs, limping, windface etc, any additional bone will not play when the other bones are changed.

This is how the armature arrangement must be. Human skeleton in blue, new bones in orange.

  

## Rideable animals’ core issue.

September 2022

There are two-character types in Kenshi, humanoids and animals. They are treated differently by the engine.

The biggest issue regarding riding, is the fact animals cannot pick up people.

So, I had to make a human, that looks like a bull.  

### _Whatthebull? Why so many problems with the Sage Steeds bulls?_

Here a summary about the issues I encountered when making the Sage Steeds. Using a non-humanoid skeleton where the game expects a humanoid skeleton, is the main cause for the following issues:

  
A) The sage steeds do not have a portrait.

B) The game crashes whenever the game tries to read the portrait file aka NPC talk to the bull.

C) The bull's hull can be seen over the automatically generated building menu icons.

D) The bull's hull can be seen over small character's portraits.

  
The issue A is because the game expects a head mesh to be where the bull's hump is, so the ‘photobooth’ just takes a picture of empty air when the bull is kneeling and if standing the bull’s hull just covers everyone else.

The issue B is a direct result from A, this was originally ‘fixed’ by preventing all NPCs in a mod to NOT TALK to a dump personality.

This caused a lot of issues as a dumb player character could not speak to NPCs. And modded-in NPCs someone else made, still wanted to talk to the bulls, hence crashing the game. I reverted this when introducing the fix. The game crash was fixed in version 6 by adding head bones to the bull's neck where the game expects them.

  
The issues C and D are the result of the game engine's problem to place the skeleton in its proper place in the game's inbuilt photobooth. Same reason as A, the game expects a humanoid skeleton and the bull’s hull does not fit in the booth and spills over to the furniture section.

For some reason all the virtual photo booths are set in a check board like grid, right next to each other. So if I have a human on square 2-4 the chair on square 2-5 is fine. But the bull kneeling on 2-4 spills on square 2-5 and because the front is on an earlier square; the front covers the entire chair. Now, I do not claim to know this is exactly it. But makes it easier to understand what it is about (see image).

  

I really could not prevent the bull’s hull from overlapping the furniture, but making the idle animations kneeling, and all poses pulled back, I managed to barely avoid the human camera limits. The issue being all that mesh head and hump blocking the teammates’ portraits. I do not have a clue how this setup manages to not print all teammates’ images on top of each other always. I think the game might turn the skeletons in the exact same spot invisible, or something.

  

But knowing what I know, I truly recommend making a small vehicle, below chest level. Edit Sept 2022: Or make the toter roughly human sized, see the image I added at the top (second one). At least try not to have anything going in front of the photobooth area( see that the head does not spill on 2-3).

  

## How to make your very own rideable non-humanoid skeleton

You will need:

1)    Blender 4.0 (December 2024) with [Kenshi\_IO\_Continued plugin](https://codeberg.org/Kindrad/Kenshi_IO_Continued) (the official one is outdated)

2)    Enormous amounts of time, patience and snacks… no double it!

  
For the purposes of this guide, I am referring to the animal or vehicle you are about to make as a ‘toter’.  

### TIPS & FACTS

Revised Oct 2024  

-   Do all bone additions and renames to the skeleton BEFORE recreating the animations, as you will need to redo them every time you add or rename a bone. **Think ahead**. Is your toter needed to pull a cart? Add a bone for the cart and wheels from the beginning. Ears? Tail?
-   Make the first standing pose as the **rest** pose. Pose > Apply > Apply as a rest pose in Pose mode.
-   Make sure the Bip01 is located at the crossing of x and y axes, or at least near. Z axis does not matter. The origo of both the armature and the mesh need to also be at the x and y crossing (not for the game, but for your sanity). I actually ended up pulling the horse a bit behind, so the head is at crosshairs (origo too). This made it go smoother on turns, looks more natural.
-   The center of the front and back legs should align with the origo (x and y). This ensures best terrain hill tolerance and best turning effect in game. Also the feet dust is projected from the origo location.
-   If you are using a non-humanoid skeleton as a base, you need to grow **identical bones for the neck**, **head** and **headnub** in the exact same position the humanoid skeleton has, to prevent the game crashing when a NPC tries to talk to the toter.  Use a humanoid skeleton as a reference but DO NOT COPY the bones, you need to GROW identical bones and rename them to fit. This also means the actual head neck and headnub bones the skeleton has, you need to rename something else. OR PREFERABLY use the human skeleton and just add bones where you need. **I do not recommend using non-humanoid skeleton.**
-   If the hull/mesh is larger than the humanoid skeleton, the hull will most likely overlap the toter’s teammate portrait pics. To compensate this, I made the bull to stay low when idle. The game keeps taking portraits so often, even a short time standing the bull’s hull would appear over every portrait. **Consider making your toter stand lower than chest height if its hull is large.**
-   **Do not mess with the bone link chain.** Do not DELETE bones or cut the parenting link chain any way in the middle of the chain. This will result a non-exportable skeleton and you need to start all over. No, you cannot redo the chain. You would need to know the exact order the devs added the bones in the first place. Luckily you can ADD bones anywhere, except between the limb bones (bc animations). And you can move and re-parent bones from the end of the chain, like toe nubs.
-   Because the riding pose is the same pose as carrying, you will have to make a compromise on both. Also, your mod will overwrite all the above mods’ riding poses, so a subber can only effectively use one toter mod. Unless a community standard for a riding/carrying pose is used.
-   If you are using the vanilla ragdoll, the hands of the rider will flap. The game nicely prevents other body parts from flapping, but the hands were designed to sway while carried. The gravity physics of the hands is down (from head towards hands) and when the character is posed upwards on a toter, the ‘wind’ created by going forward plays against the ‘gravity’ and this is why the hands flail. Removing the ragdoll completely fixes this, but then the character stays up standing when KOed. EDIT: I have managed to make a custom ragdoll, it is available as a modder's resource on Steam Workshop. You should just gently guide your subbers to using it, so there will be only one copy of it per user.
-   Do not forget to export your custom skeleton with 'Apply Transform' selected. Otherwise, the mesh may rotate in the game engine. This appears to be false. Good practice anyways though.
-   You might have to also adjust the combat anatomy. But be careful, if the 'collapse part' (vanilla part) does not match the bones you listed, the game will crash. Same if you have not included all body parts or if you have too many. For a vehicle I think you could just keep the vanilla combat anatomy.
-   The portrait is taken by the Bip01 location at the Bip01 Head bone. Make sure the photobooth bones are at the correct height. You have some adjustment room by manually trial and erroring with the portrait image height and distance. But the further the bones are from the vanilla human photobooth bones' (head) location, the harder it is for you to find the head by adjusting the camera height and distance in FCS.
-   If Bip01 is not where the origo of the armature is (x and y), the character will not have a portrait. This is not true.

## How to add bones

### The bone for rider on the toter's back

1)    Import the skeleton you want to add a carry bone to Blender

2)    Click on the skeleton and go to edit mode

3)    Select Add – Single Bone (or you can select an existing bone as a source and hit F)

4)    Move the bone where you want to place it. Do not rotate as it makes it more difficult for you to set the character pose. Click the bone, hold shift and click another bone on the back you wish the carry bone to follow, click CTRL + P, make. I usually use offset.

Do not adjust rotations. Make all animations first, do not save a keyframe for the carry bone in any. The rotations are unique for the skeleton you used as a base and relevant to the bone you chose as a link and to the carry me animation set up.

Fe. If you are using my pose and the bull skeleton I made, the riding bone rotations are:

  

5)    Navigate to the Bip01 L UpperArm and rename it fe. Bip01 L UpperArm 001 etc. Do notice the odd Bip01 BullNeck and BullHead bones. These were renamed after adding the ‘photobooth bones’ aka new set on human like neck, head and headnub bones.

  

  
6)    Make sure you have the ‘photobooth bones’ added and renamed (if you did not use human skeleton as a base).

7)    Add any additional bones you need.

8)    Create animations for the skeleton. If it already had animations, save keyframes for each new bone you added and for the newly named Bip01 L UpperArm.001 bone.

### The entire linked bone-chain behind a male\_skeleton (Sept 2022)

1) Import the human male\_skeleton and optional 3d model reference of the animal shape, might be the final or something roughly similar.

2) Click the skeleton and edit. Create a new bone the same way as mentioned in the previous section. This will be your assistant bone.

3) Move the assistant bone roughly where you want the hind end of the future bone to be, do not rotate the bone.

4) Click a bone end on the human skeleton, hold shift and click an end of the assistant bone, hit F. This will create a bone LINKED to the human skeleton and it will follow the movements of the bone you chose. Might be easier to just pick the Bip01 as it does not move that much.

5) Move the assisting bone to next bone's position and link the end of the previous new bone to the end of the assistant bone.

6) Repeat step 5 until you have all the bones you need. **Remember**: The more bones a character has, the more burden on the game engine, so keep it as low as possible.

7) Give each new bone a unique name. Delete the assistant bone(s).

8) Create a weight group for each new bone. (Blender usually knows how to make weight groups automatically, but in case just rigging with automated weights does not work.) )

9) Rig the toter mesh to the skeleton. Select the mesh, hold shift, select the skeleton/armature and Object-Parent-Armature Deform with automated weights.

10) Now redo all weights to suit your model best. It will have odd deformities in the area where the humanoid bones are, I have not tested, but it should work if you just unweight all the human spine bones etc. Head (photobooth) bones should be weighted to the toter's actual head in this scenario.

## Stumps and Combat Anatomy

If you export any stumps, same rule apply as with robotic limbs, they may not have any foreign vertex groups, or the game will crash.

Now because the left UpperArm bone has been renamed, the game will crash if you make a separate replacement stump for the left front leg (left arm). This happens because the Bip01 L UpperArm does not belong to the front left leg any more. We cannot change what bone the stump want to attach to, therefore we have to resort to gimmicks.

You must include the stump of the left front leg (arm) within the mesh itself. For the other legs you can make separate stumps that cover all the missing normals the game does when replacing the legs with stumps. This vanishing of normals is based on the weights to the bone, named on the combat anatomy.

I ended up just building the stumps in with the actual mesh (hidden inside the legs). This required some detailed weights work, as I had to make sure the stumps did not have any weights belonging to the bones named on the combat anatomy. Naturally this also meant the robotic limbs attachment need to have same weights as the stump has, or clipping issues happen. Luckily them being robotic limbs mean they need no organic movement, so this worked in my favor.

Bones named on the combat anatomy determines what normals vanish (by weights). All the normals belonging to the bone chain after the bones mentioned in the combat anatomy will also turn invisible.

## Renaming Bones Mid-Project

I myself had to rename also the right upperarm bone, which resulted me doing some animation re-doing. If you also do this, remember to add a new bone for the Bip01 R UpperArm, otherwise the game will crash. You also need to add the new bones as vertex groups for the weights. I actually did not need to do this, as I found out I can just change the bones in the combat anatomy file without the game crashing. Leaving this instruction here in case you have to rename a bone mid-project.

Since v 4.0 Blender now knows how to rename strip channels to match the new bone name. What you have to do, is adjust the walk, run, jog uppers.

I think Kenshi exporter need to refresh the animation strips or something. I just used it on each strip's first keyframe, to 'make a change' and it seemed to work, without actually moving any bones in the pose.

## Robotic Limbs

To prevent the game from crashing, the robotic limbs **need to be exported without any foreign vertex groups**. Meaning it can only have exactly the same amount of vertex groups the vanilla skeleton has (or less). Renamed bones seem fine, but no extras.

This however breaks the walking animations, this needs more testing. It has something to do with combat anatomy well they need to match the skeleton bones, so if I export the limb with human skeleton, it has the wrong anatomy ie. bone structure, if I export using the horse skeleton, the game crashes.

This was an error assumption on my part. The animations did not break. Kenshi plays limping animation when there is asymmetry on the two leg sides: too good robotic limb and a good normal leg. And I had not made any limp animation for the horse yet, so the animation that got played was the default stand.

  
EDIT: I solved the crashing issue too!! The crash happens if the robotic limb has foreign vertex groups. Make sure it only has vertex groups belonging to the vanilla bone chain.

EDIT EDIT: confirmed; renamed vanilla bones are not an issue. Only vertex groups belonging to the extra bones that are not part of the original bone chain are.

  

This means you do not have to use the human armature to export the limbs, you just have to pay attention to the vertex groups.

  

## Shoes

I noticed when making horseshoes, also the same side front shoe vanishes when the back leg has a robotic limb. Idk at this time why. It would make sense to go by weights but apparently not. That would prob also mean the front shoe does not vanish when the arm is amputated. If I attach the shoes to the legs slot, none of the shoes vanish, which means I have to rethink if I am adding any shoes or leg wraps at all.

## Gear Icons

If you want to use the in game auto icon image feature, you need to adjust the offsets to fit your toter.

## Animation

The vanilla humanoid skeleton has 166 animations. For your toter to work, you need to make at least the mandatory animations to your skeleton (see name list below). They need to be named exactly the same, case and space sensitive. You might get issues if you are lacking the vanilla animation strip names, so it is best to use the vanilla skeleton as a base and not delete strips, just **empty** them.

I recommend using the vanilla humanoid skeleton there for the sake of expected bone names and animations, as a base. Empty strips the toter does not need. Which would mean nothing would happen when such animation were called by the game engine. _It is possible the co-animations may need at least one keyframe._ Frankly, I would still prefer a copy of the rest pose first keyframe written over the futile anims, so at least the character would not pause in weird pose mid-action.

The game knows how to pause main animation file action for the vanilla bones, but for any added bone (or renamed one) the animations can cumulate. So make sure only one strip is moving an added on bone at a time. Also the Extrapolation, Blending and Influence have affect on non-vanilla bones. The game handles those for vanilla bones, but for any additional bone you need to set these in Blender (the default settings in Blender work fine, so change these only if you must).

FOR THE RENAMED OLD Bip01 L UpperArm, you must make the run upper & jog upper strips to have less exaggerated movement in keyframes that you see in Blender. As mentioned above, the game knows how to handle the vanilla limb movement, but the renamed bone is no longer one of them, so it gets exaggerated movement IF both upper and lower animation strips have keyframes on it.

**Do not forget** to make an animation file in FCS for your toter and add(assign) it in the race file using the pull down menu.

**Do not forget** to make a new rest pose for the toter! In the pose you chose, in pose mode, select all bones, go to Pose > Apply > Apply as a rest pose. This is used as the reference for all other animations and it is far easier for you to animate, when the bones are oriented the correct way, and not like on the human armature.

 [See a YouTube video of cart wheels turning](https://youtu.be/97BfsRxFcH0)

  
Make sure the origo is in the middle of the front and back legs. This allows the best hill tolerance. Although eventually either front or back legs are gonna be in the air or sunk into the ground. Not much we can do about it. But having the mesh centered to origo gives the best result possible. Well, yeah for terrain, but having the origo at the center also makes NPCs walk inside each other in formation, and when fighting they will overlap other characters. So those are way more annoying than the back legs being in the air. So, I eventually decided to move the mesh and skeleton backwards. This, obviously, meant I had to redo all gear positioning as well and redo the icon image offsets. This also meant I had to redo those animations, that are used with furniture. _Dang it Cattrina, plan ahead!_

  

  

### Vanilla Animation Names List

Mandatory animations are **in bold** (game breaks or crashes without). You can of course just have a 1 frame pose for each, as long the file have something to play when the game calls.

Click here to see [Vanilla Animation Names](/vanilla-animation-names) list.

## Textures

For the head to be able to have different textures for UDIM (you do not need to have separate textures if you do not want) the folder patch needs to be character/skins/human\_male or human\_female. I tried to use a folder named 'horse\_male' but the engine cannot find the face texture then. It only works if you use the vanilla folder names for humanoid races.

Body and head masks determine which parts of the body can be colorized using the editor limits xml.

You need to use [GGG+R](/custom-character-race-and-normal-map-displacement-map) for the normals/pump map

## Troubleshooting

**Q:** Why is my toter's skin suddenly emissive/full bright?

**A**: You saved your game, then made changes to the texture and now the game cannot find the texture shaders. Just start a new game any time you want to see the changes in the texture.

**Q:** Why is my toter's behind curving down?

**A**: This happens if you did not use human legs as backlegs and instead, made new bones for the backlegs. You might be able to fix it leaving the coanimations without any keyframes. You have one of the main animation strips not done aka the new bones at the aft are not included in the main strips that is played currently. Also you may have keyframes for those bones in any of the co-animations, where they should not be. Or you have slightly different rotation of one bone in any of the co-animations. Co-animations are 'ref08', 'postures', 'none', 'stand1', 'breathing nonarms', 'neckset, 'shoulder set' and the two turnheads. Make sure every main animation strip has data for each bone, and every co-animation strip only data for the vanilla bones (the game knows how to turn these off on the main strip) and any expressive bone, such as tail and ears (no data on main file for the expressive bones). Also check the strip influence. The combination of strips playing together should result to 1. If you have two strips with influence of one playing at the same time you get issues. Remember to set the blending to 'combine'. Leaving the old instructions in case. If you made your toter with human legs, you won´t have this issue.

  

**Q**: None of my animations are playing, the character hovers above ground unmoving.

**A**: Make sure all the animation strip names are clean and do not have a .001 or a extra space at the end. Also, did you remember to make an animations file in FCS and assign the file to the race of the character? Did you export the mesh one animation strip clicked on (star is white)? Did you by accident select some other mesh with the skeleton, that is not parented to it? Did you export the mesh with Rest Pose active on the armature? Did the armature get renamed?

  

**Q**: Some animations work, some don't, especially walking

**A:** Did you adjust the combat anatomy? This can affect animations. Especially the bone names.

**Q**: An animation keeps on playing even though the character has stopped walking (or whichever animation it was).

**A**: Your animation strip has the wrong frames per second setting. Fe. the game plays walking anim at 25 frames/sec. If you have set your walk anim fe. 20 frames/sec the animation continues to play until all frames have been played. And as the game plays the stand pose at the end of walking, it has only 2 frames, so the frames 30 to 35 of the walk anim keep on playing beyond the stand pose. Always use the same frame rate as vanilla animations, 24 frames/sec. At least make sure both walk upper and walk lower have the same framerate,

Sometimes Kenshi also plays as default the animation strip topmost of the list, so make sure you have a one-frame animation at the top.

  

**Q**: The toter's backlegs sink in the ground

**A**: Yeah, not much we can do about this. This is because the toter is effectively a two-legged human. So the game has no idea it needs to adjust the standing angle on slopes. You can make it so the toter walks in the air a bit, giving the terrain some tolerance. It is a fine balance though between floating too high and sinking to ground. Yeah, you need to decide before you make all your animations. But, also vanilla animals have this issue, so... I am setting the 'ground' to be 1 (g+z+1) square up on Blender from the green line. Keep the Bip01 where it is in vanilla human.

**Q**: The left front leg moves on its own even though the toter has stopped moving (idle)

**A**: This is because the Bip01 L UpperArm has been renamed (because it is the carry me bone for the rider). You must add the old but renamed upperarm bone (whatever its name is now) as a keyframe to the breathing animation.

  
**Q**: My animal walks and runs funnily

**A**: Check all of the animations playing together (neckset, shoulder set etc,) and make sure the back legs do not have keyframes on the co-animations. In the same vain, make sure walk, jog and running animations have only the front legs (human lower) saved on lower file and the back legs only on upper file. The game knows how to play bones named with vanilla Bip01 etc. but they cannot automatically tone in the new back legs. Remember, the front legs are the lower legs of a human, back legs are new.

  

**Q**: Suddenly one of the body parts of the animal is huge compared to other body parts

**A**: This may be one (or more) of the animation strips affecting that body part is corrupted. You have to redo those strips I am afraid.

  

# Glossary

<table class="wikitable"><caption></caption><tbody><tr><td><b>Assigning Animations</b></td><td>The act of opening the race file and adding the animation reference to it using the drop down menu.</td></tr><tr><td><b>Assistant Bone</b></td><td>A bone you created just to aid you making bone link chains. Delete after use.</td></tr><tr><td><b>Co-Animations</b></td><td>My umbrella name for all the animations that Kenshi plays with the main animation. These are: Breathing, Breathing noarms, Neckset, Shoulder set, Postures, Ref08 and turnhead and idle_turnhead. 'none' is not a co-animation, it is a pose reset.</td></tr><tr><td><b>Expressive bones</b></td><td>All bones that are included to provide fluff, such as tails and ears. Maybe wings. Wings are tough, you need to include their movement to every pose, cannot put them to co-animations or you would not get the result you want.</td></tr><tr><td><b>Photobooth bones</b></td><td>My petname for the three bones, that prevent the game crashing when a NPC is talking to the toter. The bones are Bip01 Neck, Bip01 Head and Bip01 HeadNub, set in a humanoid figuration in correct height. If you used the human as base and grow more bones to it, these are already in correct place.</td></tr><tr><td><b>Toter</b> &nbsp;</td><td>A combination word for a rideable animal or vehicle, much less cumbersome to write.</td></tr></tbody></table>
