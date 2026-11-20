---
articleId: dialogue-targeting
title: Dialogue Targeting
description: This page expands the dialogue guide, see the main page Dialogue Structure Overlook
categories:
  - Dialogue
  - Modding
layout: modding
---

This page expands the dialogue guide, see the main page [Dialogue Structure Overlook](/dialogue-structure-overlook)

### Target options in Conditions



#### T\_ME

The host NPC to whom the dialogue is attached to (owner of dialogue), is always a NPC  

#### T\_TARGET

Can be a NPC or player, requires some trigger that determines the target, fe. ev\_see\_neutral\_squad.

Is the Player, if happened through ev\_player\_talk\_to\_me event  

#### T\_TARGET\_IF\_PLAYER

Specifies that the target is actually a player character. Handy when doing broad scans like ev\_see\_neutral\_squad  

#### T\_INTERJECTOR (1,2,3)

Makes interjector the target, please note that an interjector is seldom a specific character as it is randomly (with conditions) selected from the available NPCs around the speaker. Interjectors work only on free speech (monologue, bar talk), they do not work in conversation dialogues where player gets options, unless set carefully like this: [How to make a three person conversation including player](/how-to-make-a-three-person-conversation-including-player).

As interjector must be decided somewhere at the beginning of the dialogue, interjector cannot be the target on root level.

An interjector is also always a member of the same squad as the host, so interjector is never selected via I\_SEE event.




T\_TARGET\_WITH\_RACE

Triggers if the targeted character has this race person in their squad. Not necessarily target themselves.
