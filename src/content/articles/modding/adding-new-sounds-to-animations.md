---
articleId: adding-new-sounds-to-animations
title: Adding New Sounds to Animations
description: "This page is a direct translation from Japanese of this page: https://wiki3.jp/kenshijp/page/612"
categories:
  - Modding Guide
  - Modding
  - WIP
layout: modding
---

This page is a direct translation from Japanese of this page: [https://wiki3.jp/kenshijp/page/612](https://wiki3.jp/kenshijp/page/612)

Credit & images: Momayo



## Preparing the necessary software

### Installing RE\_Kenshi

Download and install RE\_Kenshi from this page: https://www.nexusmods.com/kenshi/mods/847 Check out the sound modification method published on the RE\_Kenshi Wiki on this page. For the basics of sound modification, please refer to [https://github.com/BFrizzleFoShizzle/RE\_Kenshi/wiki/Using-RE\_Kenshi-to-mod-sound-banks](https://github.com/BFrizzleFoShizzle/RE_Kenshi/wiki/Using-RE_Kenshi-to-mod-sound-banks)

### Installing Wwise version 2014.1.3

You can download and install it from this page [https://wiki.totalwar.com/w/Wwise\_-\_Audio\_Moding](https://wiki.totalwar.com/w/Wwise_-_Audio_Moding). Please be sure to check the license terms before downloading. The package available for download from this page is distributed for the game Total War: ROME II.

It seems that any version of Wise prior to 2015.1.9 should be fine (unconfirmed). Currently (July 2023), the oldest version of Wwise officially available from Audiokinetic is 2016.1.6, but Kenshi was unable to load the version using this.

After installing Wwise 2014.1.3, if you receive the error "The application could not be started due to an incorrect side-by-side configuration" upon launch, please install Microsoft Visual C++ 2008.

You will also need a sound editing software.

### Format

The audio files used for sound editing are in .wav format with a sampling frequency of 44100hz. Use these software programs to edit and convert audio files: Audacity [https://www.audacityteam.org/](https://www.audacityteam.org/) Sound Engine (link removed) Windows version (link removed) \[Cattrina: these links seem to no longer work\]

### Get the sound event name

Basically, you can edit the sound by following the instructions in the RE\_Kenshi WIKI above. However, this alone will not tell you the necessary Kenshi sound event name, so you will need to get it.

-   After installing RE\_Kenshi, start the game. The RE\_Kenshi Menu will appear, so check \[Log audio IDs/events/switches/states\].
-   If the RE\_Kenshi Menu does not appear or if you have closed the window, you can make it appear again by going to \[Options\] → \[MOD\] → \[RE\_Kenshi settings\].
-   When \[Log audio IDs/events/switches/states\] is checked, the sound event name will be output to the Debug log tab of RE\_Kenshi Menu the first time a sound is played in the game. You can see that
-   the sound event name for the sound made when you hover the mouse cursor over each button on the title screen is "Hover," the sound made when you click is "General\_Click," and the "jaggiiiiiiing" sound made when a starting new game or loading is "Create\_or\_Load\_Game." This is the string after event: in the log.
-   While looking at the Debug log tab, proceed until the desired sound is played in the game, and identify the sound event name.
-   Sounds that can be triggered at any time, such as stealth, are not played automatically by NPCs and are easy to identify.
-   Once you have obtained the sound event name, you can proceed as described on the RE\_Kenshi Wiki.
-   The RE\_Kenshi debug log is output to RE\_Kenshi\_log.txt in the Kenshi installation folder.
-   This log is overwritten every time the game is started, so be sure to save the log separately once you have obtained a good sound event name.

## Setting up FCS and adding sound events

It has been discovered that it is possible to edit and add sounds to specific animations by editing the FCS Animation Event item.

The object types to which Animation Event items can be added are ANIMATION, ANIMAL\_ANIMATION, and COMBAT\_TECHNIQUE (there may be others as well).

As an example, we will edit the sound of the two-stage slash in the vanilla sword animation and add separate sounds for the first and second strikes.

In preparation, we used voice synthesis software to prepare audio files for the lines "Nidan!" and "Giri!"

-   Create a new Animation Event item and set a unique name for the Audio event.
-   The name you set here will also be used in Wwise. Make sure it does not overlap with other event names of the Combat Techniques items, Downward combo is the two-stage animation we will be editing this time.
-   Delete Attack and Attack 2 from the events on the right and set the two Animation Events you created earlier instead.
-   The number to the right of the item name is likely the frame number on which the sound event will occur. Enter the numbers for Attack and Attack 2 that you deleted.

-   Open Wwise and create an event with the same name as the event you entered.

-   The rest of the process is the same as in the RE\_Kenshi Wiki.
-   In this successful example, during the two-stage sword slash motion, we were able to have the synthesized voice say "Nidan!" For the first strike and "Giri!" For the second strike.
-   Sounds like this can be added to almost any animation, not just weapons motions, but also when using furniture or during standby motions.
-   The sounds you add are not limited to lines, and you can add a variety of sounds depending on your ideas.
-   Please be sure to check the terms and conditions when using sound materials.
-   If you want to add sound to an existing animation, if the total number of frames in that animation is 1 (still animation), the sound will continue to play every frame, which won't work.
-   In that case, you can solve the problem by editing the animation using Blender and increasing the number of frames.
-   You may also be able to adjust the frequency at which the sound reaches the frame of the animation where it will be played by adjusting the play speed in the FCS settings.

## Sound volume attenuation setting based on camera distance

-   If you don't do this, the custom sound will sound quite loud.
-   Select the sound you want to set from the Audio tab and open the Positioning tab of the Sound Property Editor.
-   Select 3D, select New... from Attenuation \[>>\], give it a name, and select Edit... to open the Attenuation Editor.

-   (It seems that the Mode and Position Source can be configured to do more advanced things, but this has not been investigated yet. Please do as shown in the image.)

-   The Attenuation Editor allows you to set the distance and intensity curve for each property.
-   Generally, it sounds good to leave the default Output Bus volume as a straight line sloping downward to the right.
-   You can also change the maximum distance (length of the horizontal axis) in the Max distance box at the bottom right.

-   Right-click on the curve to change the curve type and double-click to add a point.

-   Of the properties on the bottom left, setting the low-pass filter will naturally muffle the sound as the camera moves farther away from the sound source. This tends to give a better effect than just using the Output Bus volume.
-   The low-pass filter curve rises to the right because it indicates how well it affects the camera as the distance increases.

-   To easily check how the low-pass filter will sound, return to the Sound Property Editor and increase the Low-pass filter appropriately in the General Settings tab.

## Switch Configuration

Some sound events are set to change the sound that is played depending on the conditions when the sound occurs.

This setting is called a switch.

The voice that is played when a humanoid character is hit is the event name "VO\_Get\_Hit", but the sound that is played is determined by the switch group "VO\_Races" for the race and gender of the character that was hit. A

fairly rough conceptual diagram

If you see Switch: XXX YYY in the RE\_Kenshi log, XXX is the switch group name, and the YYY next to it, separated by a space, is the switch name.

-   Event: ZZZ and Switch: XXX YYY can be output in different places in the log, so it can be a bit difficult to figure out which event has which switch.
-   Please note that sound editing using RE\_Kenshi and Wwise involves overwriting and adding on an event-by-event basis.
-   For an event where a switch is set, all sounds within that switch group must be set.
-   For example, if you create an event that replaces only the sound for the Hive in the switch group, the sounds for other races when hit will disappear.
-   If you want to change only a specific part of a switch group and leave the rest as vanilla, you will need to extract the vanilla sound bank, identify the relevant sound file, and then re-set it within the switch group.
-   Regarding extracting the vanilla sound bank, please refer to the instructions in the editing section.

Below are screenshots of the Audio settings, Game Syncs settings, and Events settings that I used to successfully switch on the sound when hit During editing.



This page was very helpful for setting up the switches:

Adding Footsteps in Unity & Wwise - OtObOx's Blog [https://otobox.hatenablog.com/entry/2020/01/16/192906](https://otobox.hatenablog.com/entry/2020/01/16/192906)

## Sound Event Name List

<details class="collapsible"><summary>Show table</summary><table class="wikitable sortable"><caption></caption><tbody><tr><td>Event Name</td><td>Switch Group</td><td>Event Details</td><td>remarks</td></tr><tr><td>Boot_Up_Game</td><td></td><td>The main theme played on the title screen</td><td>If you simply set up a loop in Wwise, it will continue to play even after the game starts.</td></tr><tr><td>Hover</td><td></td><td>The sound that is played when you place the mouse cursor over a button on the title screen</td><td></td></tr><tr><td>General_Click</td><td></td><td>Button click sound</td><td></td></tr><tr><td>Create_or_Load_Game</td><td></td><td>The sound when starting a new game or loading</td><td></td></tr><tr><td>Create_Character</td><td></td><td>Sound when exiting the character creation screen</td><td></td></tr><tr><td>Pause_Game</td><td></td><td>Sound when paused</td><td></td></tr><tr><td>Resume_Game</td><td></td><td>Sound when paused</td><td></td></tr><tr><td>Right_Click</td><td></td><td>The sound made when you right-click to specify the character's movement location or action.</td><td>It will not play when you right-click on the map to instruct movement.</td></tr><tr><td>Attack</td><td></td><td>Wind noise when attacking</td><td>This event name applies not only to weapon attacks but also to animal attacks.</td></tr><tr><td>Map_Open</td><td></td><td>Sound when opening a map</td><td></td></tr><tr><td>Map_Close</td><td></td><td>Sound when closing the map</td><td></td></tr><tr><td>Tab</td><td></td><td>The sound when switching tabs in windows such as maps and powers</td><td></td></tr><tr><td>Inventory_Open</td><td></td><td>Inventory opening sound</td><td></td></tr><tr><td>Inventory_Close</td><td></td><td>Inventory closing sound</td><td></td></tr><tr><td>Item_Lift</td><td>Inventory_Items</td><td>The sound when grabbing an item in the inventory</td><td></td></tr><tr><td>Initiate_Conversation</td><td></td><td>The sound when starting a conversation</td><td></td></tr><tr><td>Dialogue_Choice</td><td>Dialogue_Choice</td><td>During a conversation, a sound is played each time the conversation progresses.</td><td></td></tr><tr><td>Building_Click</td><td>Building_Click</td><td>Sounds when clicking buildings and furniture</td><td></td></tr><tr><td>VO_Get_Hit</td><td>VO_Races</td><td>Humanoid race hit sound</td><td></td></tr><tr><td>VO_Creature_Take_Damage</td><td>Creature_VO</td><td>The sounds animals make when hit</td><td></td></tr></tbody></table></details>

## Switch List

<details class="collapsible"><summary>Show table</summary><table class="wikitable sortable"><caption></caption><tbody><tr><td>witch Group</td><td>switch</td><td>remarks</td><td></td></tr><tr><td>Inventory_Items</td><td>Fabric<p>Food Luxury Kits Rum and others</p></td><td>It appears that it will have the same name as FCS's inventory sound.</td><td></td></tr><tr><td>Dialogue_Choice</td><td>Continue_Conversation</td><td>Continue_Conversation also plays when the conversation ends.</td><td></td></tr><tr><td>Building_Click</td><td>Bed<p>House Wind_Generator and others</p></td><td>It seems that it will have the same name as FCS's select sound.</td><td></td></tr><tr><td>VO_Races</td><td>HIve<p>Human_Female Human_Male Robot Robot_Female Shek_Female Shek_Male</p></td><td>It seems to be determined by the audio sounds in the FCS Race.<p>For example, if the sounds are HUMAN and the character is male, Human_Male will be played.</p></td><td></td></tr><tr><td>Creature_VO</td><td>Dog<p>Goat Gar and others</p></td><td>It seems that unused races such as Duck can also be used.</td><td></td></tr></tbody></table></details>



Reference: Mods that change the sound

(Beta) Project Kathun - A Kenshi Star Wars Mod https://steamcommunity.com/sharedfiles/filedetails/? id=2840444811

The British Soldiers https://steamcommunity.com/sharedfiles/filedetails/? id=2968968078
