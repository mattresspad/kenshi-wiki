---
articleId: particle-effects
title: Particle Effects
description: This page is work in progress, I report here whenever I have new info - Cattrina
categories:
  - Pages with syntax highlighting errors
  - Modding
  - Modding Guide
layout: modding
---

_This page is work in progress, I report here whenever I have new info - Cattrina_


Kenshi uses semi-custom scripting language called Particle Universe. The ending .pu.

The cool part of .pu is you can just edit it with any text editor, like notepad, and then after finishing you can just rename it as .pu and it works. Although Notepad++ and Visual Studio are recommended.

There is a visual particle editor available here: [External forum with download link](https://forums.ogre3d.org/viewtopic.php?t=81206) It comes with several script examples. Although it looks as of now 2025 to not have working links, only the ogre plugin link at the end still works.

## Facts

-   Particles are emitted from the origo of the object by local coordinates, but the orientation of the particle is always upright. So if you have 5 flames coming from the center and four corners of the square plate, turning the plate to stand on it's edge will still spew flames from each corner and the center, but the flame is still upright according to gravity, like real life flame.
-   It looks like side particle size cannot be adjusted, which is a bummer.
-   Multiple emitters per script is not allowed, but you can have multiple techniques. Which might be the reason side particles stay tiny.

## Folder setup for custom particle effects

1.  In your mod's folder create a new folder called particles (lowercase).
2.  Inside particles folder create three folders called **textures**, **materials** and **scripts** (all lowercase).
3.  In the **textures** folder goes the texture you want each particle to have. Fe. if you want to have autumn leaves falling there goes the picture of the leaf in png format. Binary sizing recommended (256x256).
4.  In the **scripts** folder goes the .pu file, that contains your system code.
5.  In the **materials** folder you set up the marriage of the script and texture. Create as a new .txt file and when done change the .txt ending to .material. If you are content using any vanilla image, you do not need the texture and materials folder, just the scripts folder.

material falling\_leaves// <<<exact material name, called in the .pu file
{
   technique
   {
       pass
       {
           vertex\_program\_ref Basic\_Coloured\_Texture\_VP {}
           fragment\_program\_ref Basic\_Texture\_FP {}
           
           lighting off //full bright off 
           scene\_blend alpha\_blend //allows transparency
           depth\_write off //double side material!!
           cull\_hardware none
           texture\_unit autumnleaf.png //the image file in textures folder
           {
               texture\_alias autumnleaf.png
               texture autumnleaf.png
               tex\_address\_mode clamp
           }
       }
   }
}

## Important

When you open any .pu file in the vanilla folders kenshi/data/particles/scripts, you soon realize the script name is not the important bit, the important bit is the name of the system, given to the script on line 1 of each script. However it is recommended to name your script with the system name, for it makes it easier to find the corresponding script. I also recommend adding your initials in front of the system name and the script name. See troubleshooting.

The game will transfer the script from your mod to the vanilla scripts folder, so DO NOT use a vanilla system name, unless you actually want to override all vanilla items using that script.

1 system kenshi\_fire2\_torch  <<<<<THIS IS THE SYSTEM NAME
2 {
3     category                                    kenshi\_particles
4     technique 

\[cut\]


Make your effects file first, then you can add it to a new building part. We cannot change or delete effects set on building parts, so replacing the building part with a copy does not aid us in this matter. **It has to be a new building part**. or a building part without an existing effect.

1.  Open a vanilla .pu script, preferrably something that is already close to the effect you desire
2.  Replace the system name, case sensitive, no spaces, (add your initials in front)
3.  Inside your mod's folder, create a new folder named particles, lowercase.
4.  Inside the particles folder create a new folder named scripts, lowercase.
5.  Save as the .pu script inside the scripts folder in your mod. Save as the system name chosen.
6.  In FCS, go to the Effects tab and create a new Effects file, or duplicate a vanilla one. Give it a distinctive name. Maybe the same as the system name?
7.  Open or create the building object you want to set this particle effect to. Add a new building part without pre-existing particle effect.
8.  Open the new building part you just added, give it a distinctive name, use the drop down menu on top to add the effect file we just made.
9.  I recommend setting the effect Y position to something like 10 to 20 at the start, cause it is possible your effect may show underground at first.
10.  Add your building to a building category, so you can find it in the build menu.
11.  Start a new game and use the ingame editor Shift + F12 to build your object. Close the editor and you should see particles right away.
12.  Do one change to the script, save and test ingame. Repeat.

## Troubleshooting

If you do not see the particles or change in the particles, consider the following:

-   Is the size too small, rotation distance too big/small or position too low so the particles hide under ground or ingame objects?
-   Is the system name spelled correctly and identically on the script and on the effect file? No extra spaces in front or after?
-   Did you add the effect on a correct building part, or did you add the correct building part to your object/building?
-   Did you actually built the object in the game that contains your effect?
-   Does your building part actually have a mesh?
-   Is the script broken, did you by accident delete one of the { } ?
-   Do you have two systems named identically? Remember the duplicate system can also reside in the vanilla scripts folder or in another enabled mod. DO NOT USE GENERIC NAMES WHEN NAMING YOUR SYSTEMS. It is very possible another modder uses that and then we have two systems named the same, either not working correctly. So instead of torch\_flame use your initials with the name: fe. YTG\_torch\_flame.

## Particles and their effect on FPS

Particles and lights are traditionally one of the things that can cause lag or frame drops in older computers. It is recommended to keep the amount of emitters and the amount of particles each spews at minimum. It will accumulate fast.

Do note, that the how many flames there is in one torch is the same as equal amount of torches. You do not gain anything FPS wise by stacking effects into one object, BUT you save on physics calculations. There has to be at least one mesh and collision, so you can set up your emitter object and for the player to be able to delete it. Having multiple effects per one object saves you (and the player) from multiple clicks and it saves the game engine from having to calculate multiple meshes and collisions.

### Multiple effects on the root or multiple parts each with an effect?

You absolutely can pack several effects to a single root object and call it a day. HOWEVER we still cannot edit or remove added effects later. Setting each effect on a separate building part (without mesh and without collision) allows you to make different variations on the fly. Same goes for the player. Maybe they want to reduce the amount of flames? If you stack all flame effects on the root, the player cannot do any changes without having to delete the object from the layouts and manually replace them with a lesser one. So if you still want to put several effects to one item, at least do one building part inside the root object. This way, whoever wants to edit it later, does not have to manually replace all objects in the world.

## Experiments and Sample Scripts

See [Particle Script Examples and Experiments](/particle-script-examples-and-experiments)

## Glossary

<details class="collapsible" open=""><summary>Show table</summary><table class="wikitable sortable"><caption></caption><tbody><tr><th>Term</th><th>Description</th></tr><tr><td>Script</td><td>In Kenshi this refers to ParticleUniverse (.pu) language code, that is used to write the particle system's parameters and behavior. Commonly used to refer any code, particulary short standalone piece of coding that is embedded or linked to a specific virtual object.<p>One script can contain several systems, but in Kenshi usually contain just the one. Technically a script is the vessel that holds the code. Think of it as if it is a piece of parchment that contains one whole story, or multiple whole stories. Without the writing a scroll does nothing. If you have only one page of a long story, the scroll is useless.</p></td></tr><tr><td>Brackets (curly)</td><td>In ParticleUniverse script these { } are called brackets. Start and end brackets specifically. Used in multiple coding languages, the curly brackets can break your script, if one of them is missing.</td></tr><tr><td>Emitter<p>(system)</p></td><td>A traditional name for items that spew effects in game worlds. The source of. Usually 'system' is used to refer to the script and 'emitter' to the object in the game world that contains the script. In casual speech often regarded as a synonym to any scripted item built in game world that causes effects to happen, regardless if it is a standalone or not. In Kenshi fog is spewed from emitters, but rain is not.<p>The word emitter inside the script defines the emitter type, is it coming from a single spot, rotating around etc.</p></td></tr><tr><td>Effect</td><td>Technically an effect can be any sound, particle or light, emitted in the game world or otherwise happening for the player to experience. In Kenshi however Effect is usually used to only refer to particles, where as Lights and Sounds are used to refer to the other two.</td></tr><tr><td>Technique</td><td>In ParticleUniverse Script a Technique is a self-sufficient container of one effect. It packages all the features together, containing such things as the emitter type, color of particles and all general aspects of this one emitter. Although multiple techniques are supported in Kenshi, it looks like only the techniques located close to the object origo get the size edit. This may be the case with other edits as well.</td></tr><tr><td>Root/root object</td><td>In Kenshi modding a root object is the building one actually builds in the world. The root object usually contains the effects, but it is BETTER to have building parts added to the root with the effects instead. This way one can remove unwanted effects later.</td></tr></tbody></table></details>
