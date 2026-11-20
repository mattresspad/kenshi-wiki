---
articleId: follow-player
title: Follow Player
description: To make a NPC follow the player, one needs first to establish target (easiest is to use PLAYER_TALK_TO_ME) and then either
categories:
  - Modding
  - Dialogue
layout: modding
---

by Cattrina

To make a NPC follow the player, one needs first to establish target (easiest is to use PLAYER\_TALK\_TO\_ME) and then either

A) An AI contract (bodyguard) or B) an effect DA\_FOLLOW\_WHILE TALKING

### Option A

See 'Bodyguard' dialogue in FCS. Using AI contract has its limits, for one, it has a set time limit the NPC follows. If you want 'follow me until I say to stop' then use option B

**You need**: an AI assigned to the NPC, that includes the AI goal 'follow mission target' and the AI contract set to trigger from a dialogue line.

Tip: you can duplicate the Bodyguard AI, assign that to your NPC and then just remove the bodyguard part from the AI task list, if you only want the follow.

### **Option B**

You can copy the set up from my mod [NPC Barber Droid](https://steamcommunity.com/sharedfiles/filedetails/?id=2212261158)

**You need**: to toggle between unlock and lock dialogues. You can use this basis to also toggle AIs (instead of locking, you use 'change AI').

1.  A main PLAYER\_TALK\_TO\_ME dialogue, in which the player can select if they want the NPC to follow.
2.  Follow player dialogue (DA\_FOLLOW\_PLAYER\_WHILE\_TALKING) with timer (DA\_FORCE\_SPEECH\_TIMER) making the NPC say '.' every minute. The follow while talking requires the NPC to say something every 2 minutes the least, but I noticed Kenshi's ticks are not regular. Sometimes they either slow or speed up a bit and it made 120 ticks unreliable, thus the follow\_while\_talking timer stopping abruptly. This is why I chose 60 ticks, it has room to fail both directions and the following continues without breaking, every 3-minute loop renewing it three times (lines 2-4 in repeat loop).
3.  NPC stops when the player clicks to talk to it again. The timer loop stops when it is locked.
