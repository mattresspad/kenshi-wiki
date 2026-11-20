---
articleId: creating-an-animal-race
title: Creating an Animal Race
description: Put the AI goals of the animal in the race.
categories:
  - WIP
  - Modding Guide
  - Modding
layout: modding
---

_**This article is a Work in Progress. It may contain out of date or incomplete information.**_

## Race

Put the AI goals of the animal in the race.

Such as:

-   Eating corpses
-   Eating on the ground
-   Eating any bodies
-   Dogs grabbing severed limbs
-   Dogs running around with severed limbs
-   Dogs chasing dogs with severed limbs

### **Combat Anatomy**

Do note combat anatomy is truly bone name relative. So, if you have a custom skeleton and custom bone names, you might have to make custom combat anatomy. Be very careful, **mismatch with the armature and the combat anatomy will cause crashes.** And it might even assume vanilla bone names for the limbs. I highly recommend using vanilla bone names where-ever possible.

Only humanoid characters can lose limbs, so animal characters will not be using the collapse or severe features of the combat anatomy.

## Ragdoll

All creatures in Kenshi, humans and animals alike, need a ragdoll. Without a ragdoll characters will stay standing after they are KOed or killed.

Characters will also turn into ragdolls when carried.

There are two approaches: if you are using a vanilla skeleton as is, without moving the bones around, you probably can use the original ragdoll without any issues. Even if you added couple of bones.

But, if your armature is completely custom, you need to also make a custom ragdoll: See [Making Custom Ragdoll](/making-custom-ragdoll)

## Mesh and Textures

Making an animal mesh or texture is the exact same process as making a humanoid one, the only exception is animals do not need a secondary mesh.

See [How to make a new race](/how-to-make-a-new-race)

## Animations

Animals have far less animations than humanoids do. Usually, 5 to 10.

-   attack1
-   attack2
-   gotosleep
-   idle1
-   run
-   sleep
-   strafeleft
-   straferight
-   walk

Animations are assumed to reside in the armature and it is mandatory that the skeleton file inside Blender is named the same as the animal. So, if you are using the human skeleton as a base, you have to delete a lot of animations and rename the skeleton in Blender. If you import fe. the bull in Blender, you see the armature is named bull. So, if you are using the bull as a base and are now making a Hippo, you rename the armature from bull to hippo.

**Animal characters** are a bit different from humanoid characters, as animal characters need animal animation files listed for each animation strip, they have. Each strip needs to be named identically to vanilla anim strip names, or otherwise they will not be called. If you made your own animations, you need to create also new animal animation files for your race, as you probably want to adjust the animation play speed etc.

Animal characters also have the option to add a custom strafe and custom turning animation. Especially large creatures often could benefit to have these made custom.

## Animal Character

See also [How to make a custom name database for a custom race](/how-to-make-a-custom-name-database-for-a-custom-race)

### Animal attack

Unfortunately, we cannot add new animal attack types, but you should be able to find something suitable from the selection we already have.

Attack type possibly determines the distance from character center to target. And maybe if the attack comes from above or from front. I am unsure on these both (Cattrina).

### Animal Weapon

Animal weapon is the teeth, the claws, the beak they use to cause damage to targets. Animals cannot lose their weapon. The **skill category** of the animal weapon MUST MATCH the chosen animal attack type. The animal character will also need a weapon level.

## Spawning

When you are done with your animal, you want to bring it to the world of Kenshi.

You have a few options how the animal can appear. They are:

1.  Game start, as a companion to a human or even alone (do note animals cannot recruit humans).
2.  Animal trader in game.
3.  Spawning in nests
4.  Spawning as homeless squads.
5.  Spawning as companions in NPC squads\*
6.  Spawning as residents in towns\*

\*Do note many animals cannot go inside buildings, so to set them as residents may cause issues.

### 1\. Game start, as a companion to a human

Just add an animal character from the drop down menu to the start squad. If you have not made any characters for your race yet, just pick any and replace it with a copy. This will be your first animal character of this race.

### 2\. Animal trader in game

Squad leader needs a dialogue with the CHOOSE\_ANIMALS\_BUYING effect on a dialogue line. The animals in the animal section of the squad will be listed as for sale. DO NOTE if your animal character does not have a Bip01 Neck and Bip01 Head bone in somewhat normal head location, the game will crash when making the listing portrait images.

### 3\. Spawning in nests and Spawning as homeless squads

Nests are automatically generated from a template and randomly placed in the game world. **The modder does not need to place them manually**. Use 'nest' as a search word in towns to see how different nest templates look like. There are many different ones. Gurgler Nest is a good example to look at.

Loot, Debris and debris buildings are randomly generated when the nest is, debris have a navmesh, debris buildings do not have a navmesh. Roaming squads are the animals 'living' in this nest. Meaning they will roam nearby. That is what spawns the animals. Nests support world states. Kill the Gurgler boss and the nests (and their contents and residents) stop spawning.

1.  Create a new town or duplicate an existing nest in the Towns tab.
2.  Give it a distinctive name so you can find it easily.
3.  Set up the contents of the nest, debris and roaming squads etc.
4.  Set the town type to TOWN\_NEST.
5.  Decide in which region this nest will spawn, open that region's Spawn Area file. It is under Biomes.
6.  Add your newly created nest to the Spawn Area from the drop down menu. The number is chance to spawn.

Homeless spawns/squads go also in the Spawn Area; they are just wandering in the area without a central point. You can do both or either as you wish.

See also [Map Biome Areas + Region Correlation](/map-biome-areas-region-correlation)

### 4 and 5. Spawning as companions or residents

Just add animals in the NPC squad. Do note many animals cannot go inside buildings, so this may cause some issues, if you set a big animal as a resident in a house.
