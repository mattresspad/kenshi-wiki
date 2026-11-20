---
articleId: riding-npcs-how-to-spawn-a-npc-already-carrying-another-npc
title: Riding NPCs, how to spawn a NPC already carrying another NPC.
description: "This is an additional page for my toter guide: Creating a rideable animal/vehicle"
categories:
  - WIP
  - NPC
  - Riding NPC
  - Custom towns
layout: modding
---

This is an additional page for my toter guide: [Creating a rideable animal/vehicle](/creating-a-rideable-animal/vehicle)

Toter: horse or vehicle

## How to spawn an NPC rider + toter duo

**1)** Create a new squad. Leader: any humanoid Squad: one toter

**2)** Create new AI\_PACKAGE for the squad

> Name for the package: Pickup Leader
> 
> Clears existing jobs: false
> 
> Signal func: SIGNAL\_NONE (happens at the beginning of the game)
> 
> Unloaded func: UPJOB\_NONE (or any)

**3)** Inside the new AI package:

No Leader goals.

Squad AI Goals:

Create new AI\_TASK

> Name: Pickup leader goal
> 
> classification: TP\_URGENT
> 
> ending: TEE\_NOTHING
> 
> targeting: target leader
> 
> enum: LIFT\_PERSON\_PLAYER\_ORDER



This handles the initial picking up the leader. Now we need to change the mount's AI, so it begins patrolling. For this we make a new dialogue pack and take advantage of the EV\_SEE triggers.


**4)** Create new DIALOGUE\_PACKAGE inside the toter's file

on the EV\_SEE\_NEUTRAL\_SQUAD, make a new dialogue.

Conditions: T\_TARGET\_IF\_PLAYER

Add one line (yes there needs to be at least a space of text on the line) and make the line change AI on the right most side Effects (whereby default reads AI contract) put there the vanilla patrol AI, or any you want.



I kind of assume you can do all sorts of AI changes later on, but I have not yet learnt how to make the rider back on the horse if they fall off. Maybe with intricate locking and unlocking dialogues.

EDIT: yes, confirmed. I made a squad with vanilla patrol AI, then AI change upon see neutral for picking up leader and then on another see neutral continue patrolling. Both AI change dialogues lock themselves, the first one unlocks the second one (which starts locked).
