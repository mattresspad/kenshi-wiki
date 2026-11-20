---
articleId: scripting-aka-how-to-make-a-multi-threaded-conversation
title: Scripting AKA How to make a multi-threaded conversation
description: "See here Boron's marvelous dialogue making guide: Kenshi Modding 101: FCS and Dialogue"
categories:
  - Modding
  - Dialogue
layout: modding
---

See here Boron's marvelous dialogue making guide: [Kenshi Modding 101: FCS and Dialogue](https://steamcommunity.com/sharedfiles/filedetails/?id=1444279946)

Set up:

1) You need a NPC squad spawning in a building inside a town, see [Creating New Towns#Step 4: Interiors and Exteriors](/creating-new-towns#step-4-interiors-and-exteriors)

2) Go to the dialogue pack tab in the Game World panel. Right click on the list and select 'New item', give your pack a name.

3) Open your mod in FCS and navigate to your town and to the squad you want to make the dialogue pack to. We assume you want a leader dialogue. Select 'dialog leader' from the drop down menu and find your dialogue pack's name. Save.

You are now ready to start writing your script. **Double click** the dialogue pack's name on the dialogue leader in the squad panel.

On the left we have all the possible triggers listed. But they are all greyed out. Why? Because you have not used any yet. Add new creates a non-linked new dialogue, add dialogue allows you to pick from all the dozens of dialogues already made. DO NOTE that **if you add one, you should not edit it**, as it will change the dialogue for each and every character that has that dialogue in their pack. It is linked to other characters already.

We are using the EV\_PLAYER\_TALK\_TO\_ME event, because this is a multiple-option conversation and the player can choose from the options only in conversation with a NPC, only in this event/trigger.

So, Add New and then rename the newborn dialogue with 'MAIN' on the title, for ease of use later. Also, in this stage we should make this **not an monologue**, so we do not forget to do so.

First, we start with the first line, which is the NPCs greeting to the player. So, click the word 'Dialogue' (so FCS knows on which branch this line belongs to) and type the characters speech down on the text0 line on the right panel. The **first line of each branch MUST be the NPC owning the dialogue pack** speaking or the conversation will fail to begin!

Next, we plan our conversation, what are the first options the NPC is going to offer? Click on the NPC's first line and add as many new lines to it you need options. Then type the options on each line's text0 and **change the speaker** from T\_ME to T\_TARGET\_IF\_PLAYER. The lines turn red to indicate they are player's options.



Here I have added a condition to this line, target has item; Secret Handshakes Book, which the player has no doubt stolen from somewhere. If they do not have this book, this option would not appear in game dialogue window, only the two previous ones would be seen. But before going in deep, let's untangle the two others:

First option: "_I would like to see your wares"_, will naturally open the vendor window. The vendor which is set on the squad's file. So do not forget to add a vendor list. The Effect to choose is DA\_TRADE

Second option: _"I would like to get a new haircut"_, opens a character editor, the Effect to choose is DA\_CHARACTER\_EDITOR

Now for the third, the secret handshake. I want this to unlock a new conversation.

Adding a new dialogue to the same dialogue pack, under the EV\_PLAYER\_TALK\_TO\_ME. This dialogue starts locked, so locked:TRUE and again Monologue;FALSE. Adding also the unlock and lock effects to the MAIN dialogue (you need to first create and rename the dialogue before you can add it to the unlock or lock effect).

Next time the player talks to the NPC, they will get the new HANDSHAKE dialogue instead of the old MAIN. After this, the item is no longer needed in the player inventory.

You can make however many optional dialogues in the same dialogue pack, for different NPCs in different conditions (fe. in town of) being able to use it. However, it is way less complicated if you keep one dialogue pack per one squad. You can add already made fluff dialogues to it, so you do not have to write all the screams and stuff as they have already been written once. But remember: every time you wish to custom the contents of a dialogue, you must create a new dialogue. Do not edit vanilla dialogues! (Because they are linked to existing characters and those characters might require that exact set of dialogue lines).

Now this is just the beginning of multi-thread dialogue. Add to it AI changes, war campaign triggers, world states... you can script yourself in a pickle fast. Keep a notebook, flow chart of something to keep track of your dialogue tree, the more branches you have, the harder it is to keep track what is happening where and why something is not happening. And often the issue is one 'line of code' missing where you forgot to set up a condition or an effect. And when you do these optional other dialogues, you must set up for yourself a reliable testing set up where the conditions are forced. Use a custom game start to spawn player characters with needed personalities, or items.
