---
articleId: creating-a-new-game-start
title: Creating a New Game Start
description: This guide will help you create a new game start.
categories:
  - Modding
layout: modding
---

This guide will help you create a new [game start](/game-starts).

Step 1: Open the ‘[Forgotten Construction Set](/forgotten-construction-set); and click the ‘Create New Mod File’ button.

Step 2: If you have any other mods installed (as you can see, I have the ‘Zombie Land’ mod) be sure you uncheck them, so that your mod is the only one that is ticked and “ACTIVE”.

DO NOT uncheck any of the files in the top section, these are the actual game data files. This is very important!

Step 3: Click the DONE button to open your mod. For this mod, I’m going to duplicate the existing ‘Wanderer’ start (and make a few changes to it).

Note: NEVER edit existing data, always make new entries.

In the left side column, select 'Game Starts', then ‘right click’ on the ‘Wanderer’ and select ‘Duplicate Item’.

Step 4: Change the name. I called mine ‘My Game Start’. Just for fun, let’s change the starting town to 'Mongrel' instead of 'The Hub'. Click the drop down menu and select ‘town’ then click the ‘Add’ button.

Scroll down the list and select ‘Mongrel’.

Now right click on ‘The Hub’ entry under 'town' and select ‘Remove from list’. This should leave just ‘Mongrel’ listed under ‘town’. However, if you want to leave both entries, then the game will randomly start you in either ‘The Hub’ or ‘Mongrel’.

Step 5: I want to make some changes to the Wanderer character, but I don’t want to mess up the existing Wanderer, so I’m going to make a new character.

In the left side column, select ‘Characters’ then scroll down the list until you find ‘Wanderer’. Right click and select ‘Duplicate Item’.

Change the name. I called mine ‘My Wanderer’. Now, there are a few things we can change here. Let’s change the armour/clothing quality. On the left side where it says, ‘amour grade’ let’s change it from ‘GEAR\_CHEAP’ to ‘GEAR\_GOOD’ (this will make all our armour Green: High Grade).

Ok, let’s change the quality of the weapon. On the right side, click the drop down menu and select ‘weapon level’.

Click the ‘Add’ button. From the list, select ‘Cross’ (this is the absolute best quality in the game). Now right click on the ‘Unknown’ entry and select ‘Remove from list’ so that ‘Cross’ is the only entry under ‘weapon level’.

Let’s change the weapon itself. Click the drop down menu and select ‘weapons’. Click the ‘Add’ button. From the list, select ‘Katana’ (or whatever you like). Then right click on the ‘Iron Club’ entry and select ‘Remove from list’ so that ‘Katana’ is now the only weapon listed.

For clothing, I’m going to remove everything from the list and replace it with a Drifter's Leather set (you should know how to do this now).

As this is a stealthy, thief type character, I'm going to give him some custom stats. Click the drop down menu and select 'Stats' then click the 'Add' button.

There is already an entry called 'thief' that suits my purpose, so all I have to do is select that from the list.

Note: If you want to create your own custom stats, in the left side column, expand 'Characters' and select 'Stats'. Then duplicate one of the existing entries and change whatever you please. When you're finished, just add it to your character (as in the step above).

Ok, that’s my new character finished. Now I need to create a new squad.

Step 6: Expand the Faction section and select ‘Squads’. Scroll down the list until you find ‘startoff - Wanderer squad’. Right click on it and duplicate it.

Give it a new name. I called mine ‘startoff - My Game Start’. Use the drop down menu to change the ‘leader’ to your new character and delete the existing ‘Wanderer’ entry.

Go back to ‘Game Starts’ and open your custom game start. Use the drop down menu to change the ‘squad’ to the squad you just made and delete the existing ‘startoff - Wanderer squad’ entry. Your game start should now look like this:

There you go. All done! You can change the description if you want to and maybe give yourself some more starting money. Be sure to click the ‘Save’ button on the top toolbar before you close the construction set.

To test your mod, open the launcher and activate your mod.

Good luck!
