---
articleId: making-a-custom-melee-weapon
title: Making a Custom Melee Weapon
description: See also Creating Custom Weapons about putting the weapon in game.
categories:
  - WIP
  - Modding Guide
  - Modding
  - Weapons
layout: modding
---

_**This article is a Work in Progress. It may contain out of date or incomplete information.**_

See also [Creating Custom Weapons](/creating-custom-weapons) about putting the weapon in game.

## Tips and Facts

-   Import a vanilla weapon as a base in Blender. This gives you the correct UV mapping and orientation for the weapon in 3D space.
-   Use of vanilla UV layout is (semi)mandatory. This is because the game randomizes weapon quality in vendors and when crafting, same mesh may be used with ANY vanilla texture.
-   All player-crafted weapons in game are always of **Homemade manufacturer,** which determines the texture used by the produced quality.
-   Catun No 1 texture is default. The game uses it if there is no corresponding texture found for the quality. So fe. your weapon's lowest quality is 2 but your crafter fails and produces a level 1 product. No lvl 1 weapon model (texture) found, Catun 1 texture is used.
-   You can force a vendor to sell only certain manufacturer and certain quality, but for crafting, a failure is always a possibility. In practice you **cannot force a certain texture on player-crafted items**. Not _unless_ you replace or remove ALL VANILLA TEXTURES (from Homemade), which would make your mod not compatible with any other weapon mod.

Polycount of a weapon mesh object must be less than 8000 vertices (tricount under 4000).

A weapon object can only have one material. Even if you have separate materials set in Blender, in Kenshi they are using only the one texture.



## Texture and mesh requirements

Texture for a melee weapon should follow the vanilla UV layout. Use of vanilla UV layout is (semi)mandatory. This is because the game randomizes weapon quality in vendors and when crafting, same mesh may be used with ANY vanilla texture.

Diffuse: .dds, 90% alpha, mipmaps enabled, binary sizing (512x512, 1024x1024 etc.) and DXT5

Normal: traditional purple normal, .dds mipmaps enabled, binary sizing (512x512, 1024x1024 etc.) DXT1

Mesh: keep it relatively low poly, under 10 000 verts. Kenshi does not allow parts for melee weapons, so one mesh & one texture only.


If you absolutely want and must use custom textures, you need to make sure the weapon can only be found, given or appear in specific vendors you made yourself. A custom textured weapon can never be crafted by the player, WITHOUT breaking the vanilla crafting system. Some mods (fe. Kathun) does this, but in general it means a mod that alters the vanilla crafting system will never be possible to use with other mods. Don't do that XD

## Icons

It is **best** to use the auto-generate option when it comes to icons. This is because it will reflect the texture (quality) that can be randomized.

Any vertex color on the weapon mesh affects the auto-generated icon only, allowing you to be sure to have fe. a darker auto-generated icon.

**\-If-** you are making _an unique weapon_, with _specific_ quality (using forced method) you can make your weapon a non-auto-generated icon.

-   The icon **must** be set in perfect vanilla mimicking folder path inside your mod, namely: icon folder named _"icons"_ ( lowercase)
-   The icon **must** be named the same way auto generated icons are; the weapon named by your item stringID fe,: 10-Weapon making tutorial.mod.914-gamedata.base.
-   Let it auto-generate first, so you know what name it must be.
-   **Remember to delete the icon from your data/icons,** cause otherwise you do not see the changes in game when you edit the icon.

Putting an icon link does nothing.

## Step by step

1.  Create your 3D model or import a model you have acquired legally.
2.  Match the sword's rotation and position to the vanilla sword.
    -   When wielding, the character's hand is roughly where the origo of your model is (attaches to wrist/forearm bone).
    -   If the origo is not at the handle, you need to move the sword in the edit mode until the origo is at the handle, then go to object mode and move the sword so the origo is at crosshairs.
3.  Open UV Editing in edit mode and make sure your UV layout is the same as vanilla
    -   The texture repeats vertically, but that makes sense only for the blade
    -   Either use vanilla textures or make your own, but keep in mind **any** melee weapon mesh may use it and any texture may be put on your mesh
    -   If you are using a 3rd party mesh, you might have to compromise on texture details in favor of mesh details. **Baked in shadows** is a **no.**
4.  Make a bare sword, sheathed sword and sheath alone versions (hint you can use the item transfer panel in Blender to type in rotations (press N).
5.  Export your mesh with binormals and tangents, (color and modifiers optional). **NO WEIGHTS, NO RIGGING TO ARMATURE** (remove rigging if any)
    -   Vertex color is only visible on generated icons, not on the weapon mesh
6.  Use Gimp to convert your texture into .dds, 90% alpha, mipmaps enabled, binary sizing (512x512, 1024x1024 etc.) and DXT5
7.  Set up a vanilla like folder structure inside your mod folder
8.  Duplicate a weapon file or create a new in FCS (items - weapons)
9.  Add the weapon to (a) manufacturer(s) or create your own, exception is Homemade if you want it craftable
10.  Decide if you want the item to be a) lootable b) purchasable c) craftable d) given by a NPC e) spawned on a NPC (see details below)

### 10 a: how to make the weapon lootable from ruins

#### Ruins, scattered about the building floor (no interior layout, no storage items):

1.  The ruin needs a resident squad, one squad per building
2.  The squad needs a nest which is of town type
3.  inside the nest you put a loot spawn, which is a vendor list
4.  in that list you pick weapons from the drop down and your weapon type (fe, katana, topper, ringed sabre etc.)
5.  Weapon manufacturers from the vendor list drop down menu determine all possible manufacturers, if none chosen any can be randomized.
6.  if you want random loot plus one unique weapon, then you should set separate vendor lists, one for the random and one which contains only the UW, and set both to the same squad nest loot spawn. For the UW vendor list you put min 1 max 1

#### Towns, ruins with storage items:

-   Storage -loot goes in vendors list inside a resident squad
-   Spawnable loot is determined when the interior layout was made. You cannot see what spawn group(s) were used, but you can guess and add your loot to those. You can also make your own interior layout (in game) and then use your own spawned loot group (Items - Placeable groups).
-   Shop owner's storage == selling inventory == loot inventory what they sell is also lootable from containers
-   None-shop-owner-residents vendor list contents will be spawn inside containers in their chosen interior layout
-   Special items guarantee said items to be somewhere as loot, so that would be best option for your unique weapon

### 10 b: how to make the weapon purchasable from a shop

1.  Decide which town and which shop will sell this weapon and open the corresponding resident squad
2.  **Do not** edit a **vanilla squad** to **only** sell your weapon manufacturer, instead make a new vendor list and add that to the squad, so the squad has the untouched vanilla vendor list + the vendor list for your unique weapon/manufacturer. You might need to adjust the item amount and chance %.
3.  If you want a seller that only sells your manufacturer or UW, make a new squad and have them a resident of a new building.

### 10 c: how to make the weapon craftable

1.  Add the weapon type and weapon model(s) to the Homemade manufacturer.
2.  Adjust the qualities and chance % so your models get their proper place in the quality hierarchy.
    -   Any overlap means both or all textures are possible in that quality.
    -   The quality range is always from the previously listed to the next listed. The number set is the preferred, so quality tends to randomize close to that number, but it can be as low as previous item or as high as next item. (fe. in vanilla Homemade Rusted Junk has 5, the next item is Rusting Blade 10. So a weapon can spawn as rusted junk with qualities 0 to 10, strong emphasis on lvl 5, if crafter lvl matches)
    -   aka it is possible to get rusted junk, that has better quality than a Rusting Blade. A level 5 to 10 item can be either.
    -   However, if you added a quality 8 weapon model to the list, a rusted junk would never be able to be level 10 and Rusting Blade would never go below 8.
3.  Add the weapon model(s) to a crafting bench functionality. You can make a new crafting bench (functionality) with only your weapon model as an option. **Do note** the player chooses a weapon **type** when beginning smithing (and all weapon types he can craft are in the Homemade), so they need to be communicated they need to use this specific bench to get this quality and texture. This is the reason there is mk I to mk III versions of the smiths, To avoid confusion it would be best if your weapon would fit this structure. But, as said, nothing prevents you from making a special bench. Just name it according, do not make it just an another smithy.
4.  Add the weapon type(s) and weapon model(s) to a research
5.  To be able to craft the item, the player must have finished the research and they must have a crafter on level matching the quality number, or preferably, above. And obviously the materials for it and built the bench.

### 10 d: how to make a NPC to give a weapon to the player

This is a community trick. It is not illegal nor does it cause any game play or performance issues.

Normally a NPC can only give objects of item type via a dialogue. However the community found out, this is just a matter of FCS definition editing to be able to give weapons, armor or any items to the player (including maps).

See: [A Workaround How To Give Maps, Armor or Weapons Through Dialogue](/a-workaround-how-to-give-maps-armor-or-weapons-through-dialogue)

### 10 e: how to spawn the weapon on a recruit or a character

1.  Open the character file
2.  Scroll down and see if they already have a weapon, if, remove it
3.  Add your weapon from the drop down menu
4.  Set the weapon level to your Manufacturer or make them a new one only containing the one weapon texture option.
5.  Check that the character spawns with stats matching the weapon requirements.
6.  Save

## Manufacturers, Weapon models and Weapon type explained

I do not know why it was designed like this, but this is very much the worst way to name things to lessen confusion.

That said, we have a settled way to speak about these in chat and forums to try to keep the confusion in minimum.

When talking about the _mesh object_ (3D model), we call it either mesh, mesh object or mesh model. It is never just model and never 'weapon model'. This is because in FCS a 'weapon model' refers to the material aka texture file (and to the quality of the weapon).

### Manufacturer

#### Manufacturer, explanation

The idea of a manufacturer was to allow RP in game, to have 'master craftsmen' who in 'ancient times produced swords and you can still find in the world' to allow a visual hierarchy so the player could just gaze upon a sword a NPC is holding and see its maker and estimate how much damage the NPC is possibly going to make and perhaps pick your targets according if you wanted to steal the sword or evade the fight in the first place. However the textures ended up being so close together visually it is actually hard to see which is which in distance.

The intended RP is why the texture of a sword is tightly locked to the quality and stats of a weapon. The player was supposed to see the texture and understand if the weapon is going to do a lot of damage plus the overall skill level of the wielder.

#### **Manufacturer in FCS**

The Homemade manufacturer has all possible qualities (except Meitou in vanilla), because the player's crafting results vary. All the other manufacturers have strict quality restrictions. **Manufacturer is the file that marries the texture (weapon models) to the mesh item (weapon types), you can find it under Items - Weapons - Manufacturer**

FCS hierarchy:

### Weapon Models (FCS)

All the texture(quality) options a weapon manufacturer can have. These are the vanilla ones.

Each name of a manufacturer is a hyperlink to more info.

[Homemade](/homemade) (player made, has all textures exc. Meitou) lvl 0 - 80  

[Unknown (manufacturer)](/unknown-manufacturer) lvl 5-10  


[Ancient (Manufacturer)](/ancient-manufacturer) lvl 15-25  


[Catun Scrapmaster (Manufacturer)](/catun-scrapmaster-manufacturer) lvl 30-40  


[Skeleton Smiths (Manufacturer)](/skeleton-smiths-manufacturer) lvl 50-60  


[Edgewalkers](/edgewalkers) lvl 70-80  


[Cross](/cross) (Meitou) lvl 100  

### Weapon Type

Mesh object files. Also determines the weapon's stats.

#### How much damage does my weapon do? AKA Weapon Stats

Shidan has kindly shared a calculator: [Shidan's Public Google Docs Weapon Damage Calculator](https://docs.google.com/spreadsheets/d/1LcykPT2i2pBM6-4NC-nhmW4ZvkS-Eb8ZN_Hs6pUhH8w/edit?usp=sharing) go to **File and make a copy of it** and add your specs. Do not request edit rights.

This following info is also from Shidan:

**Racial damage multipliers** fall into 4 categories. The first three are in the main multipliers on the left side of the weapon's entry in the FCS. The last is in the dropdown in the top right.

**Animal** - Any organic "ANIMAL\_CHARACTER" entity.,**Human** - Any organic "CHARACTER" entity.,**Robot** - Any inorganic "ANIMAL\_CHARACTER" or "CHARACTER" entity.,  
**Race damage** - This one is a subrace specific modifier. Unlike the others this one is a percent value, instead of a multiplier. So 125 is 125%, or a 25% damage bonus.,

**Armour penetration** is a multiplier for how much of the weapon's damage is affected by armour. It does accept negative values, which make the weapon less effective against armour. While positive numbers make it ignore armour. If set above 1.0 it will cause characters who are wearing armour to actually take more damage than if they were wearing nothing at all.

**Pierce damage multiplier** should stay at 0 the vast majority of the time. It does work, but it is not intended for melee weapons. It will not show up in the tooltip in-game, but it causes the weapon to deal harpoon damage. Which is defended against by the harpoon resistance value on armour, instead of the normal cut/blunt resistance. This does not scale with quality and is insanely powerful. A weapon with a pierce damage multiplier of 1 will add 10 minimum damage and an additional 156 damage when at 200 combined Dexterity and Weapon Skill. This damage type is only seen on animals and is why they hit so hard and are hard countered by armour.

**Min cut damage mult** is a value that does nothing at all. It should be ignored. Was supposed to give a weapon bonus damage for low level characters, but it is broken.

**Length** is the weapon's reach in decimeters. So, a 25 length is a range of 2.5 meters.

**Value.** We don't actually have the full weapon price formula. Higher numbers equal a higher price for the weapon, but the exact relation isn't really known. Best to compare to existing weapons and go from there. All vanilla weapons range from 40 to 600, so probably good to stay around there.

**Weight** kg is a misleading value. This is NOT the weight of the weapon. This is actually the minimum weight, used as part of the strength requirement calculation.

**Strength requirement** is never mentioned in FCS, nor shown in-game. You need 40x the blunt damage value of the weapon to use it properly, otherwise you suffer from speed penalties. My damage calculator above can help with calculating each quality level's requirement. In the event of 40x blunt damage being lower than the minimum weight, the required strength level will be equal to minimum weight of the weapon. The blunt multiplier in the FCS x80 is equal to the requirement at max level (unless that goes below minimum weight of course), ideally you will not want that requirement to go over 100, as that makes the user unable to use the weapon without robotic limbs.

**Weight mult,** multiplies the final weight of the weapon by this number. This does not affect the strength requirement though. So even if a weapon is very light due to this multiplier, it can still have a high requirement if it has a lot of blunt damage.

On the manufacturer's modifiers, in the manufacturer's entry. Most of them are standard multipliers. But the min cut one does nothing, just like on the weapon. While the weight mod is actually modifying the minimum weight, not the final weight, so it sees limited effect in-game.
