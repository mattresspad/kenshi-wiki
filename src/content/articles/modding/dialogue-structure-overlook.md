---
articleId: dialogue-structure-overlook
title: Dialogue Structure Overlook
description: The dialogue system is the 'scripting' us modders have for Kenshi. It is by no means perfect or even sufficient enough to actually do anything one wants, but…
categories:
  - WIP
  - Modding
  - Dialogue
  - Guides
layout: modding
bookmarks:
  "Bar_talk_(interjectors)": "bar-talk-interjectors"
  "Interjectors": "interjectors"
  "Using_Faction_Reputations_as_Boolean": "using-faction-reputations-as-boolean"
  "Using_Fake_Factions_and_Faction_Relations_World_States_as_Boolean": "using-fake-factions-and-faction-relations-world-states-as-boolean"
---

_**This article is a Work in Progress. It may contain out of date or incomplete information.**_

by Cattrina

# Forewords

The dialogue system is the 'scripting' us modders have for Kenshi. It is by no means perfect or even sufficient enough to actually do anything one wants, but it's the one we got.

### Limitations

-   Cannot do actual scripting, only has a limited set of premade enums, effects and conditions
-   Cannot add custom effects, conditions or enums
-   Condition set up is a bit iffy, cannot rely on those conditions working 100% of the time
-   Triggers are also iffy, won't trigger reliably, mostly because the 1 thread engine drops fluff when stuttering.
-   The player faction is often considered as a whole in conditions, so it is not 'is this player character currently speaking kind' it is rather 'does the player squad have this personality character among them' regardless if they are currently speaking to the NPC or not. Same with items. The high definition of target (character or whole squad) depends on which speaker's line the condition is on. Inventory checks are always the whole squad.



Some of the limitations are, in no doubt, because of the one-thread engine of the game. Meaning it cannot keep up if multiple things are happening at once, which results the engine dropping some of the 'fluff'.

**Lesson no 1:** Keep your dialogue trees simple. It is not just easier for you to bug hunt, but it is also easier on the engine and results in less drop outs. Use loop-backs sparingly, never make an unending loop.

### Features (aka tips what you can do in the dialogue tree)

-   A dialogue line can be referenced multiple times (script loop-back) **by holding shift and dragging the line under another line** you want to loop back from. The 'to', is dragged under the 'from'.
-   Three kinds of dialogue types possible (read more below): conversation with a player, bar talk and monologue
-   A dialogue can unlock and lock other dialogues the **current speaker NPC has in their dialogue pack.** The locking and unlocking is applied to **this NPC and their squad only**. This can be used reliably in conversation, but does not trigger reliably on monologues or bar talk. A NPC cannot lock or unlock dialogues they do not have in their pack.
-   A dialogue is used to trigger and change AI events, do trigger on monologues and bar talk
-   All lines connected to the same previous line (branches from the same trunk) are treated as equal, unless a line has conditions. When a NPC speaks, a random line from the equal valid options is chosen. The player gets to pick from all the options available where conditions are met. If a condition is not met, the player does not see that option in game.

### Looking for a specific line to study or replace?

Use this guide: [How to find a specific dialogue line](/how-to-find-a-specific-dialogue-line)

# Dialogue types

### Bar talk (interjectors)

See also: [Dialogue Structure Overlook#Interjectors](#Interjectors)

A bar talk is a 'monologue' with two or more NPCs, typically in a bar. It does not involve the player. It triggers when a player character arrives in the vicinity of the host NPC. It uses the EV\_I\_SEE\_NEUTRAL\_SQUAD, the EV\_BAR\_TALK trigger is not used. It is meant to give background information to the player or just to create ambiance. The dialogue is written in one dialogue window with interjectors as speakers. An interjector is chosen randomly amongst the squad members, who meets the conditions given, of the host. It is possible no NPC gets triggered, which will make the entire bar talk fail. If the talk is important, use 'is character' as interjector condition and make sure they get spawned to as squad members of the host NPC (see [Creating New Towns#Step 4: Interiors and Exteriors](/creating-new-towns#step-4-interiors-and-exteriors)).

**When to use**: Use bar talk whenever you want two or more NPCs to talk to each other. Examples of use: bar patrons discussing changes that happened by the player action (Bar patrons random faction comment on world state)

### Conversation

The main dialogue type, where a pop-up window opens and the NPC and the player portraits appear. Has all functions available. Triggers either by the player clicking on the NPC possessing the dialogue pack, or via sight of a squad mate, who then prompts talk to leader effect, which then opens EV\_PLAYER\_TALK\_TO\_ME. Always under EV\_PLAYER\_TALK\_TO\_ME.

The **first line** of the conversation must be what the NPC is saying with T\_ME as the speaker, otherwise the conversation does not start.

A three or more person conversation is possible within player conversation, see [How to make a three person conversation including player](/how-to-make-a-three-person-conversation-including-player)

See our script library here: [Script Library](/script-library)

See here Boron's marvelous dialogue making guide: [Kenshi Modding 101: FCS and Dialogue](https://steamcommunity.com/sharedfiles/filedetails/?id=1444279946)

### Monologue

Single NPC talking alone, usually prompting the player to talk directly (conversation) to the NPC. It can be triggered by sight, by campaign or by the player engaging with NPC-owned items (stealing, training dummies etc.). Is a response or a lure, can trigger campaigns.

**When to use**: use monologue when you want to make the NPC to speak at the player, without forcing them in conversation. Example uses: prayer day announcement (Priest announce), Beep sees player for the first time (beep following), bartender welcoming patrons (shop welcome customer).

If you are making a looping monologue, make sure to add the PLAYER\_TALK\_TO\_ME dialogue as an interrupt on the first line of the dialogue. Otherwise the loop continues on forever. The interrupt option is on the right side drop down menu of the effects.

_"Oh boy, how one wishes the prayer day would force you into conversation, being a monologue makes it so easy to miss!"_ -you, probably

### Interjectors

See also: [Dialogue Structure Overlook#Bar talk (interjectors)](#Bar_talk_\(interjectors\))

_Interjectors_ are **members of the same squad** with the owner of the dialogue. We have three Interjection slots available; green, blue and amber. There is also an option for the entire squad to shout something. The first line you want to belong to Interjector 1, you use add interjector button and then from it the dialogue line. You must determine who the interjector is. Either choose 'is character', or you can use any of the other conditions, like has package or my race. But note this: if the character that meets those conditions does not exist, the entire chain of dialogue deriving from the interjector node is void.

You can find nice interjector examples in the biome entry dialogues.

# Triggers/Events

A trigger is the initial event, that starts the dialogue-AI-event-tree. Starts events in motion, if you will. They are selected from the left hand list of the dialogue pack window and are marked with the nominator EV in front. Requires a loaded region (aka player character present nearby). There are several different triggers, some of them requiring other conditions to be met as well. See; [Dialogue Events](/dialogue-events) for more info.

See also [Dialogue Triggers Usage](/dialogue-triggers-usage) -a list of the triggers and their use in game.

1) First, and easiest to learn for a newbie modder is the EV\_PLAYER\_TALK\_TO\_ME. It is self-explanatory. If the player right-clicks the NPC, a conversation is triggered. **Pre-requisite**; a dialogue package with unlocked player talk dialog option has to be assigned either on a squad- or on a character level to the NPC. Also all/at least one conditions set to the dialogue must be met.

2) EV\_SEE\_NEUTRAL\_SQUAD (also SEE\_ALLY\_PLAYER and SEE\_ENEMY\_PLAYER)

This is the most 'dangerous' of the triggers, game engine burden wise, and must be carefully thought of. You see, this is a **scanner,** which returns true every time it hits a character, being it an NPC or PC. And the ray is sent multiple times a second. **It is very important** to set up as many conditions that apply as possible, to restrict the flood of positive returns, as they can **lag** the engine and cause frame rate to drop. Luckily this is a **cone**, and not a sphere, locked to the character's vision field. Requires an unlocked dialogue set to the dialogue pack's see neutral slot and the dialogue pack assigned to the NPC, either on squad or on character level. Also all/at least one conditions set to it must be met. See ally and see enemy just add automatic detection if the player is either of those, never triggering on NPCs, and thus making them slightly lighter burden wise.

You should very sparingly put an I SEE event in a player dialogue pack. It cannot be turned off, so the player would always carry an active scanner with them, and even worse multiple scanners if the same pack is shared with multiple characters. A SCANNER IS ALWAYS RUNNING, except when the dialogue is locked. In a _lot_ of cases, you can use a different trigger. Try to avoid this one.

Use the EV\_SEE\_NEUTRAL\_SQUAD with the condition T\_TARGET DC\_IS\_PLAYER == 1 to restrict the scanner to player characters only.

3) EV\_USING\_MY\_TRAINING\_EQUIPMENT

The training dummy with the function BF\_TRAINING, must be in the same town the NPC is, and the ownership of the town must belong to the same faction the NPC belongs to. The NPC also needs to be on the same side of the building the dummy is, in or out. And the usage must align with the NPCs cone of view (the NPC must witness the happening).

And as always, the unlocked dialogue must be set to the correct slot in the dialogue pack and the pack assigned to the NPC either on squad or character level. And all/at least one conditions met. This will trigger the dialogue only, if you want the NPC to react, they also need the corresponding AI pack and goal, which can be switched on (change AI) via dialogue, or it can be on always.


4) EV\_CROWD\_TRIGGERED

Is triggered by a dialogue event, usually from a conversation (effect condition crowd trigger), but can be also triggered from bar talk or monologue. A monologue goes in its slot. Something like 'wohoo'. It can be longer, but I have not been able to make this crowd triggered dialogue to trigger anything else (except DA\_JOIN), so end of a tree branch.

You can use this to make a random (or selected with conditions) character or several all at once, from the NPC's squad, to join the player faction. Use only DA\_JOIN\_SQUAD\_FAST, cause if you have several people join, only the first will get the editor and it is possible the joining for others fails.

Do note, if the leader joins, the my squad is broken event is triggered and a new leader is chosen, often resulting the crowd trigger chain to be broken and the conversation starting all over again. Make the leader join last by using T\_ME DC\_IS\_LEADER == 0 on the squad line and another line for the leader with T\_ME DC\_IS\_LEADER == 1 and DC\_SQUAD\_SIZE == 1.

And naturally, the unlocked dialogue must be set to the correct slot in the dialogue pack and the pack assigned to all the NPCs to be triggered either on squad or character level. Will run this dialogue on every single squad member unrelated to whether they have the dialogue in their pack. And all/at least one conditions met.

# Booleans

Now as an avid aspiring coder your ears perked up, amIright? _"Booleans oh boy, the good stuff!"_

Well, technically Kenshi does not have booleans, nor it has global values you can change and compare against from inside a dialogue in the traditional sense. What we have is _faction relations, faction reputation, world states, items and fake factions_ (the latter which is the smart way, but the others have their uses).

### Using Faction Reputations as Boolean

Note: it seems to me the reputation is ignored as a condition, so they might not work as planned. See this tutorial by Soar: [Using Faction Reputation As Variable](/using-faction-reputation-as-variable)

There's some merit wanting to use this system. The change of it does not show to the player. Which can also be an issue, if the player cannot refresh their memory on it. For this reason it is always best to change the dialogue according to the ranking. Just lock the old one and unlock the second, so the NPC speaks differently and thus the player can stay on track. Makes a compelling and reactive conversation tho, that can change according to player's past choices. The NPC can 'remember' choices made earlier in the conversation. For best results, use the lock/unlock dialogues system. Naturally the rank affects every NPC of the same faction. For every shopkeeper to have their own ranking you would need to make separate (co-existing) factions for each. Or you could use the [world state boolean system](#Using_Fake_Factions_and_Faction_Relations_World_States_as_Boolean) below.

The downside is you need to know how many ranks to set up in the FCS faction's file. Meaning you can add to it and increase of it, but only within the rank limits you previously have set up. Meaning the rank can never go below the num negative ranks or over the num ranks. You can set up how many ranks you want.

The NPC can only check against the rank of their own faction. Faction rank can only be changed via dialogue. Use T\_TARGET\_IF\_PLAYER DC\_REPUTATION < 0 to check the value. Use Effects DA\_AFFECT\_REPUTATION -1 to change the value. You cannot reset reputation directly, so to reset it you'd need an elaborate loop that makes sure to add/subtract 1 until zero is reached. Naturally, if you have only 3 ranks to both sides, you could just make six lines 'if rank is -3, add 3, if rank is 2 subtract 2' no loop required. But if you have dozens of ranks, then loop is better,

### Using Real Faction Relations as Boolean

There are some set backs to using faction relations as boolean; it cannot be changed in secret, there will be an announcement in game when the player gets allied or removed as an ally. Also it fluctuates by happenings in game. And you cannot really build any relationship with the faction, when it needs to reset to zero to keep the script working.

It is 'ally', 'enemy' and 'neutral' to the faction of the NPC (you are talking with) you can compare against. So one faction, four booleans: is ally/is not ally, is enemy/is not enemy. So it is recommended to always have two conditions on the same dialogue line, to condition both; fe. to check if player is neutral: T\_TARGET\_IF\_PLAYER DC\_IS\_ALLY ==0 and T\_TARGET\_IF\_PLAYER DC\_IS\_ENEMY ==0

**So how does this works in a dialogue?**

A scenario:

Player clicks on the salesman:

<table class="wikitable"><tbody><tr><td><b>Bull salesman</b>: Welcome customer! Do you want to buy a bull?<p><b>Player:</b> "Yes, I would like a bull, here's the money" DA_TAKE_MONEY 6000</p><p><b>Bull salesman</b> "Excellent, thank you" effect condition; change relations with <i>bull salesman faction</i> with +100 (makes ally)</p></td></tr></tbody></table>


Player clicks on the bull, after talking to the salesman:

<table class="wikitable"><tbody><tr><td><b>Bull</b>(<i>bull salesman faction)</i><b>:</b><p>Line 1: (checks if player is ally) T_TARGET_IF_PLAYER DC_IS_ALLY ==1: "Moo" effect condition; change relations with <i>bull salesman faction</i> with -100 (removes ally)</p><p>Line 1:2 Player input: "You are mine now"</p><p>Line 1:2:1 (check if we are still allies) T_TARGET_IF_PLAYER DC_IS_ALLY ==1, change relations with <i>bull salesman faction</i> with -10 loop back to 1:2:1</p><p>Line 1:2:2 (check if we are still allies) T_TARGET_IF_PLAYER DC_IS_ALLY ==0; DA_JOIN_SQUAD_FAST</p></td></tr></tbody></table>



Now while you can change the faction relations value by smaller amounts, you cannot really control the fluctuation of it. Small things can affect it, stealing, fighting, healing, trespassing. It is far easier to deal with is ally, is not ally, than 'if faction relations > 10'. But you can, if you need to. Unfortunately we cannot reset the relations directly to 0 (that would be great), we need a back-loop checking we definitely went under ally range (50+) and taking small increments off until we are under it before the bull joins. Carefully, not to go over to the enemy range (varies what each faction thinks an enemy is, you should set yours according what you need).

You might also want to set up a pacifier or something else to counter for the happenstance if the player starts a fight with your bull salesman faction and makes themselves an enemy to the faction. That would break the bull sales boolean from operating. Unfortunately a NPC can only check against their own faction. They can alter relations to other factions, but they cannot check what the other faction relations value to player is (Using the main conditions set up, see [fake factions](#Using_Fake_Factions_and_Faction_Relations_World_States_as_Boolean) below). They cannot even check their own faction's status against another faction when they are talking to the player. They can check their own faction's relations to other NPC's factions if the target is the other NPC. So while targeting player, no checking other NPC factions (with main conditions window).

### Using Other World States as Boolean (not linked to faction ally status)

Another boolean type we have is world states. These are eternally linked to certain unique NPCs and their statuses as 'imprisoned' or 'alive'. Or a town's similar status. And as such cannot really be toggled on or off from inside a dialogue, oh no, these need to actually happen in the game world.

World states, however can alter the game world drastically! A death of the faction leader of the Brismotheens and poof now the town of Brismoth is owned by the Swamp Ninjas, who were their enemies. While the player was away... Below an actual in game example: When Seta, Esata and Valtena are dead, and Tengu and Longer are alive, Bad Teeth, which used to belong to Holy Nation, has changed owners to the UC.

What comes to dialogue making, you can use these world states to prompt up new and interesting dialogue options. Make your bar talks to reference them! Players love when their actions are under the gossip! Make your bartenders show respect and your shop vendors to venerate the player. They have heard the gossip and now they are giving the proper acknowledgement to the player.

### Checking against items in inventory

Another boolean you can use is if the player squad has a certain item in their inventory. The item must be of item type and not an article of clothing or weapon (by editing fcs.def changing the item type to armor is possible, see [A Workaround How To Give Maps, Armor or Weapons Through Dialogue](/a-workaround-how-to-give-maps-armor-or-weapons-through-dialogue)). The only exception to this is belt slot items, however they cannot be worn while checking against, they must be in inventory. Item needs to be in main inventory not in a back bag.

**How to use**: The NPC can check if the player squad has fe. the Holy Flame book before unlocking a line of dialogue.

Unfortunately the NPC cannot take items(however, re\_kenshi extensions allow this, but that is advanced modding) , they can only give non-wearable items, and check player inventory. And that is _the entire Squad's at once_. It is enough one PC has the item, the speaker need not to have it. It makes hiding contraband items in your friends pockets while the guard checks your bag a bit difficult XD. This checks for the entire squad and all members that the T\_ME has seen within the last ~hour of ingame time. If your friends have been completely out of vision, they are _not_ checked.

There is no option for 'has not' you must make sure you have all the other dialogue options designed so they'll work when the player does not have the item, and only have special result for the situation when they have the item. However you can unlock and lock dialogues for the effect they already had the item. So have dialogue 1 for the events 'characters hear about this item the first time' and dialogue 2 'we have the item', which starts as locked.

Then you can lock dialogue 1 and unlock dialogue 2, where the NPC knows they have(d) the item. Thus if they do not have it now, maybe they put it in a box I indicated. Naturally nothing prevents the player from dropping the item on the ground and then just picking it up later. Just make the item utterly useless and worthless so the player has no need selling it. Dialogue 1 being now locked forever, every time the player clicks the NPC, they get the dialogue 2, unless you make a dialogue 3 to be unlocked... If two or more dialogues are unlocked at the same time and their conditions are met, the game chooses one randomly (Altho experience has taught me it usually is the first option top of the list).

See **Target Has Item** for more info on [Dialogue Conditions & Effects](/dialogue-conditions-effects)

### Using Fake Factions and Faction Relations World States as Boolean

Now this is the best boolean we have (without re\_kenshi extensions modding), characters in dialogue can check against it and it does not matter what the NPC's own faction's status is to player faction (unless they are hostile). And as the fake faction does not actually have any characters or towns, the relations do not fluctuate by in game happenings at all (if you set up the anger and happy effect to zero).

It requires a bit hassle to set up; you have to make a fake faction and the corresponding (two) world state(s) per each boolean (shopkeeper) you need, because using the same boolean in every conversation (different shopkeepers) would defeat the purpose.

If you keep proper documentation for yourself, or you can keep track of many things at once in your head, technically you could set different numerical values to every status, fe. 'is enemy' could mean five in your script, 'neutral' 10 and 'ally' 15. You would use this fe. in bull selling situation to determine how many bulls the player paid for. Or, if you use several fake factions you could have as many values you need (naturally each value would require a line of dialogue each). As said, this gets quite complicated the more booleans you have, as you need to keep track on which line you change the value and make sure all booleans get reseted after the transaction is over.

Yes, you still need a 'is ally' == 1 change relations; Boolean Bull Sales is Ally -10 loop for every boolean you used up in this conversation, to make sure each value gets reset. Not because the faction relations to a fake faction fluctuates, but because you are human and there might be a line that you did not set right and because of that mistake, the ally value keeps on adding up instead of resetting... and it just is good practice to plan for failures.

However proper resetting gets very difficult when you have multiple booleans in operation. Sometimes one just have to trust to oneself and hope all values are reseted correctly after each transaction.

And yes, the player will get a notification in game whenever the status of a fake faction is changed. If you really do not want the player to see it, check if using [reputation](#Using_Faction_Reputations_as_Boolean) would work better. Or, you can try re\_kenshi extensions modding. Fair warning, you need to understand Visual Studio and .dlls for it.

**Setting up:**

1) Create a new faction, name it so you remember what function it is for. Fe. I am making one for bull selling, so I name it 'Boolean Bull sales' (it is good practice to have them all be sorted in a row alphabetically, so you see them all with one glance on the faction list. You can make it not real:TRUE, although it does not matter much as this faction will never get any people you can crime against. None of the values matter, you only need the name.

2) Create two world state files, one for is ally and one for is not ally (remember neutral is an option, so you need both).

To make is ally world state: Select 'player ally' from the drop down menu and pick the boolean fake faction you just created and keep the 1 after it

To make is NOT ally world state: Select 'player ally' from the drop down menu and pick the boolean fake faction you just created and change the 1 to 0.



Optionally you can make just one boolean, and use the 0 and 1 in the dialogue line to toggle it on and off, see How to use below. Just mind the three options (ally, not ally, neutral).

**How to use:** To use this on a dialogue line, select the line and then the World State condition boolean on the right drop down menu and pick the correct version of your boolean world state.



In this example we use the negative of Not Ally to make it a double-negative == is ally. If you use this method, you really only need one world state 'is ally' per fake faction.

However I find it easier to have two, ally and not ally, so both can be 1 (which is default when adding) so I can't mess it up by forgetting to change it to 0. Use whatever method works best with your brain.


**How to change the value of the world state** (to make the fake faction ally or not)

In the dialogue line, just add the 'change relations' effect condition on the right drop down menu, pick the fake faction in question and a value change you want after it. '-100' = reduce 100 from current value. '100' = add 100 to current value. If the value starts on 0, -100 makes it an enemy and +100 would make it an ally. Ally limit is the same (+50) to all factions, but enemy limit can be set separately per faction. TIP: you can change several relations at once.

For example:

<table class="wikitable"><tbody><tr><td>Bull salesman: "How many bulls you want to buy?"<p>Player options:</p><p>"One" DA_TAKE_MONEY 6000 change faction relations; Boolean One Bull +100, Boolean Two Bulls 0, Boolean Three Bulls 0, Boolean Four Bulls 0</p><p>"Two" DA_TAKE_MONEY 12000 change faction relations; Boolean One Bull 0, Boolean Two Bulls +100, Boolean Three Bulls 0, Boolean Four Bulls 0</p></td></tr></tbody></table>


And in the bull's dialogue (all bulls in the squad have this same dialogue):

<table class="wikitable"><tbody><tr><td>Bull:<p>Line 1: Condition Boolean One Bull == 1 "I am bought" change faction relations; Boolean One Bull -100 DA_JOIN_SQUAD_FAST</p><p>Line 2; Condition Boolean Two Bulls == 1 "I am bought" change faction relations; Boolean Two Bulls -100, Boolean One Bull +100 DA_JOIN_SQUAD_FAST</p><p>Line 3: Condition Boolean Three Bulls == 1 "I am bought" change faction relations; Boolean Two Bulls +100, Boolean Three Bulls -100 DA_JOIN_SQUAD_FAST</p></td></tr></tbody></table>

### Using Unlocking and Locking dialogues as Boolean

You can craft elaborate structures by unlocking and locking dialogues. You cannot check against if such and such dialogue is locked or not, but you can advance the conversation to specific directions by making all possible options in advance, keeping them locked and only unlocking them as progression goes. The dialogue must be assigned to the dialogue package for every character that needs to use it. Do note, a character can only unlock a dialogue for themselves and their squad. Only World States carry across all factions and squads (and items in possession). This means unlocking and locking dialogues is an excellent option when you want to make a progressive personal relations with a NPC. **HOWEVER unlocked and locked status of a dialogue does not persist upon import.** They will return to their original status.

Technically it is possible to make two (or more) versions of the same dialogue out of which only one is active at a time. and thus it works as if a boolean. This has one major advance on World States: it does not make a player notification. You just have to make yourself a flow chart or whatnot to keep yourself on track. And test test and test some more to make sure (un)lockings are done correctly.

# Word Swaps

When you start modding dialogue and opening vanilla dialogues to see how everything is done, you bump into lines that look like this; /MEUS/, /HELLO/. These are word swaps. There is a corresponding swap dialogue under the word swap tab with the same caps as a title. The game engine replaces the /INSERTYOURSWAPNAMEHERE/ with a single dialogue line picked up from the INSERTYOURSWAPNAMEHERE file according the conditions you set. A word swap can be just one line with multiple options, or elaborate condition tree for as many situation you want. On one dialogue line in the swap you can have as many sentences you can have with a normal dialogue line. One word trigger, but the result can be quite long.

**Limitations**

-   word swaps cannot be used as a condition, you can use conditions in them, but the result of a swap cannot be used as a condition
-   you cannot save a swap result. The next time you use the same swap a new result is randomized again from the options available according to the conditions set.

**Word swaps are used to:**

**1) To specify how the character refers to their squad, or their gender in plural or in single format.**

Fe. MEUS is used like this:

NPC: "Hi, I was wondering if you might have some work for /MEUS/ in your town?"

The MEUS word swap file has two lines. On line 1 there is 'me' and on line 2 'us' with the condition T\_ME SQUAD\_SIZE > 1. Not having a condition on the line 1 means both options are available when there is more than one character in the squad. The choice is made randomly. An alone character cannot refer themselves as 'us' using MEUS. You need to make a new swap for that without the condition, or just type the us directly on the dialogue.

So in game the player never sees the /MEUS/ written, they would see either 'me' or 'us' depending on the NPC's squad size.

There are already set up swaps for I vs. we IWE, I am vs. we are IWEARE and many many more! Use them on your dialogue.

All the non calculation ones are found under the word swap tab. Alongside them the following swaps are used. These require some code to work, so they are inbuilt to the game code:

-   /MYNAME/ - Displays current speaker’s name
-   /YOURNAME/ - Display’s current target’s name
-   /TARGETFACTION/ - Displays current target’s faction
-   /PLAYERFACTION/ - Display’s player’s faction name
-   /COST/ - Displays value used in conditions for that dialogue line






**2) To make the conversation to have varied synonyms or sentences so dialogues that will repeat many times would have a bit of variation.**

Fe. /HELLO/ has several different greetings, just under a single line there without conditions. The engine just picks one each time. In my Random Joiners mod I use this type of swap to give flare to a conversation, by listing different types of attackers a NPC might have survived from. I have listed animal and faction names there, as well as 'bandits', 'outlaws' and 'slavers'.

<table class="wikitable"><tbody><tr><td>NPC: [ the /MANWOMAN/&nbsp; looks around /HIMHER/ suspiciously]<p>"/IWEWERE/ attacked by /RANDOMATTACKER/ a bit ago, I am pretty sure they did not follow /MEUS/. Could /IWE/ maybe recuperate here a while? Please? /IWEARE/ desperate!"</p></td></tr></tbody></table>

If you need to refer to the same attacker more than once you need to make the conditions so the same option will be picked. This might be hard to do, so easiest is just to refer them once and use the 'they/them' to refer to them again later.



**3) To give either speaker's or target's personality or location based answers**

This is to aid your dialogue to be clean. If you want different personalities to have different words used, you set up a swap so you do not have to make a line for each variation on the actual dialogue. This way you can be sure all variations will have the exact same next step, be it a player's reply or an event. If you had several line options (one per personality) you might by accident forget to add the next step to it, thus creating a bug.

How to use:

Fe:

Line on dialogue: "I do not care /PERSONALITYMUCH/ about your crops"

The choices in PERSONALITYMUCH file could be:

Line 1: T\_ME DC\_PERSONALITY\_TAG == 1 PT\_WARM\_KIND "a lot"

Line 2: T\_ME DC\_PERSONALITY\_TAG == 1 PT\_COLD\_CRUEL "a fuckton"

etc.



If you wanted the player to use those options, you would make it to have T\_TARGET\_IF\_PLAYER instead. T\_ME refers always to the NPC speaker.


**4) To allow multiple dialogue branches to end up with the same varied ending, without using a loop-back (see features on top).**

# Targeting

Targeting is important for the AI to be able to determine on what the action should be directed against. You cannot change the target for AI from inside a dialogue. The target is always chosen **via the trigger event.** Target inside a PLAYER\_TALK\_TO\_ME dialogue is used to determine which side conditions to be checked against, player side or NPC side. There is never a third option. Only scan events (aka I see) can have animals or other NPCs as targets.

The EV\_PLAYER\_TALK\_TO\_ME event will always set the player character currently selected, as the target for the AI, except for inventory check which is always the whole squad. The EV\_I\_SEE\_NEUTRAL\_SQUAD event can target also NPCs, so if you use it, make sure to direct it to the player with the condition T\_TARGET\_IF\_PLAYER or DC\_IS\_PLAYER == 1.

Do note, that if you set your target with EV\_I\_SEE\_NEUTRAL\_SQUAD and T\_TARGET DC\_IS\_PLAYER == 0 you will get multiple positive hits a second and might not get the exact NPC as target you wanted. Fe. it might actually take the police as target where you wanted the criminal to be targeted. So careful condition set up needed (you can use 'is character' as a condition). All NPC vs. NPC interaction also requires an active region ie. a PC nearby to happen.

In **dialogue** targeting is used mostly to specify which side conditions we are looking at, the speaker NPC, or the player squad. Target for AI is not the same thing as target in conditions for dialogue. In dialogue the player target is always the entire squad. But for the AI events, the target is the PC currently speaking.

If you want to check against the player character's personality, the T\_TARGET\_IF\_PLAYER DC\_PERSONALITY\_TAG == 1 condition must be set on the player's dialogue line (the selection of replies). If you put it on the NPC host's (dialogue owner) line the condition either does not apply or it applies to the entire squad. So it would not be 'is this player character currently speaking kind' it is rather 'does the player squad have this personality character among them' regardless if they are currently speaking to the NPC or not.

A NPC currently in contract with the player considers all other NPCs they meet ON THE PLAYER'S PERSPECTIVE. Meaning if the NPC they meet is allied to the player or enemies with the player, the I\_SEE\_NEUTRAL\_SQUAD **will not trigger.** So you cannot make the bodyguards warn from upcoming enemies using this trigger.

See also [Dialogue Targeting](/dialogue-targeting)

See also [A Workaround How To Give Maps, Armor or Weapons Through Dialogue](/a-workaround-how-to-give-maps-armor-or-weapons-through-dialogue)



# Text formatting

One can only use color to make dialogue text emphasis. See [Dialogue text formatting](/dialogue-text-formatting-colors-italics-etc).

# Conditions and Effects, Dialogue priority

See [Dialogue Conditions & Effects](/dialogue-conditions-effects)

If you have several dialogues in a pack you might wonder how the character chooses which one to use. It is only random when all dialogues are equal. If one dialogue has conditions and the others do not, the one with conditions WILL play every time the conditions are met. Score is only used if two dialogues or two lines are equal on conditions. So you can tweak the priority a bit. But you cannot make a dialogue with no conditions play above a dialogue with met conditions with only score. Score is merely a weighted die, the dialogue cannot win a die roll if the die gets never tossed!

Here is the priority list

1.  Dialogue with met conditions (this includes race, 'is character', 'has pack' and 'has item' etc.)
2.  Inherited Dialogue with met conditions \*
3.  Dialogue with or without score, winning the die toss (score is just weighted die)

\* Inherited dialogues are often played as if they are equal with characters own dialogues and I have not been able to find out why not always. I would venture to guess it is a die toss thing with weight on character's own. So for your mental health, I suggest treating inherited dialogue as equal.

Arrival dialogues follow normal priority order inside the dialogue, but they are played in the order of the spawn area arrival dialogue order, if they are equal.

# Glossary

<table class="wikitable"><tbody><tr><td><b>Branch</b></td><td>In scripting a dialogue, a branch is the (unique) follow up of a dialogue option, a path. It can branch onwards, but it usually has its unique ending. <b>A branch must either have an ending or it has to loop back.</b></td></tr><tr><td><b>Dialogue pack, Dialogue, Dialogue line</b></td><td>Dialogue pack is the main file with all the triggers, it contains all the dialogues for all the characters who use the same pack. A Dialogue is one dialogue window which contains the actual writing of the piece. A Dialogue line is one step on the path, one entity of speech.</td></tr><tr><td><b>Dialogue tree</b></td><td>The map of paths/branches the conversation can take. All the options, all the results. It is traditionally contained in one dialogue window, but in complex scripting a dialogue tree can amass several dialogues, each locked and unlocked in turn. It is a good practice to name all dialogues in the same tree consecutively.</td></tr><tr><td><b>Host</b></td><td>The NPC who has the dialogue pack (or single dialogue) on their file. Usually a leader, but can be any squad member, prisoner or slave. It can also be an animal, however animals only can use the PLAYER_TALK_TO_ME trigger.</td></tr><tr><td><b>Interjector</b></td><td>A randomly chosen (conditions apply) NPC from the host's squad file, to say pieces of conversation in the middle of a host's monologue. Is used to make the monologue to look like a conversation for flare.</td></tr><tr><td><b>Line</b></td><td>In dialogue, a line is one set of speech spoken at once by one speaker (Player or NPC). A line can branch out to have more branches, have a single row of single lines following it (alternating speakers) or it can be the end of a branch (or to loop back).</td></tr><tr><td><b>Loop back</b></td><td>The branchline has ended without conclusion, so a loop back to an earlier option is added. Meaning the player gets to see the chosen line of dialogue again, and maybe follow a different path this time. Hold shift and drag the earlier line under the last line of the branch.</td></tr><tr><td><b>Root/Trunk</b></td><td>In scripting a dialogue, the root of the dialogue is the word 'dialogue' on the beginning of a dialogue window. On word swaps it is the word 'Word Swaps'. A trunk is any line of the main bunch of options, more important than a branch. A dialogue tree can have several trunks or branches, but only one root.</td></tr><tr><td><b>Scripting</b></td><td>In Kenshi, the act of writing a dialogue with AI effects and condition syntax, thus making the dialogue more akin to coding than just mere creative writing. It's all scripting in Kenshi, a piece of dialogue is never just dialogue, you always set at least some conditions.</td></tr><tr><td><b>Slot</b></td><td>Not an official term. I use it with events/triggers to emphasize the fact there is space for several dialogues under the tab of each event. Click open the event and you see the 'slot'.</td></tr><tr><td><b>Trigger/Event</b></td><td>These are used interchangeably. Technically an event is the action that triggers the dialogue. You can find the triggers on the left of a Dialogue Pack. In front on a trigger's name is 'EV_'. A line in dialogue can cause an event AKA trigger next dialogue tree or an AI event.</td></tr><tr><td><b>Equal line/Equal dialogue</b></td><td>In this guide an equal line or dialogue has the same priority weight as the one we are comparing it to. Two lines with conditions are equal, but a line with score and no conditions is less than a line with conditions.</td></tr></tbody></table>
