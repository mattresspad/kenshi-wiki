---
articleId: creating-custom-weapons
title: Creating Custom Weapons
description: The purpose of this tutorial is to explain the process behind adding custom weapons to the game using the Forgotten Construction Set. The goal is to add a wa…
categories:
  - Modding
  - Modding Guide
layout: modding
---

The purpose of this tutorial is to explain the process behind adding custom weapons to the game using the [Forgotten Construction Set](/forgotten-construction-set). The goal is to add a war hammer to the game, as seen in the image.

See also [Making a Custom Melee Weapon](/making-a-custom-melee-weapon) about textures

# Melee Weapons

### Rules

1.  The mesh may not be weighted/rigged to the armature (skeleton)
2.  Relatively low poly, max 20 000 vertices. Preferably under 10 000. The less, the better.
3.  If you want the weapon to be craftable or bought from vanilla vendors, it needs to follow vanilla texture UV layout
4.  No emissive/glow for melee weapons, only glossy on the albedo/diffuse alpha channel.
5.  The weapon will be held from the mesh origin (If the origin is far from the handle, move the weapon in edit mode.)
6.  You can have separate sheathed mesh for proper back/hip carrying location. Also not rigged. If such is not set, the game will use the main mesh for this.

## How to set up the melee weapon in FCS

### Requirements

Before starting, a mesh is required for the weapon. Since mesh creation will not be covered in this tutorial, the war hammer mesh can be [downloaded here.](https://kenshi-modding-files.s3.amazonaws.com/KenshiCustomWeapon.zip)

When making a mesh from scratch, it is important to remember that the weapon will be held at the mesh's origin.

### Adding The Weapon

Open up the Forgotten Construction Set and create a new mod.

In the Game World window, navigate to the Items>Weapons category. Add a new weapon or duplicate a vanilla one.

Fill out all of the weapon's attributes. A screenshot of recommended values can be seen on the right, however experimentation is encouraged. For a detailed explanation as to what each attribute does, see [Weapons](/weapons-fcs).

### Adding a mesh to the weapon

The FCS can only read files that have been placed in the Kenshi folder, so any files that the mod will reference, such as the weapon's .mesh file, must be placed in the same folder as the .mod file.

In the "Files" section of the attributes menu, click on the "..." button next to the "Bare Sword" attribute and navigate to the .mesh file. Do the same for "Mesh".

Weapons of similar types typically use the same collision files, so for the "Physics File" attribute, navigate to "Kenshi/data/items/weapons/phs/chopper01.xml". Without a physics file, it will be impossible for the player to select the dropped weapon in-game.

At this point, the weapon should be ready for use, however there is currently no way for the player to obtain it in normal gameplay.

### Creating a new research

All weapon types have to be researched before they can be crafted. Navigate to the "Research" category and create a new research.

The screenshot to the right provides the recommended values for this tutorial, however experimentation is recommended. For an explanation of each attribute and reference, see [Research](/research-fcs).

The two references here are very important. The first is "Enable Weapon Type", which makes it possible for the player to craft the selected weapon when the research is complete. The next is "Requirements", which defines prerequisite research.

At this point, the mod should be ready for use in-game.



# Ranged weapons

### Rules

Ranged weapons rules are different from melee weapons.

1.  The icon (inventory footprint) width cannot be less than 6 units. We do not know why, but if the width of the icon is <6 squares, characters stop shooting the weapon or they shoot once and never again. We strongly urge you to set it to 8, as in some cases even 6 is too small.
2.  There MUST be a live ammo projectile set to the weapon.
3.  Setting up in game ammunition IS required. Even though the FCS says otherwise. Infinite ammo would be nice, but it just does not work. But you can set the ammo to have very high amount of charges. (Rekenshi does make infinite ammo possible).
4.  Do not make the aim time too low, or it will also prevent proper use of the weapon. 1 works. 0.5 does not.
5.  Also if you want to use a special animation, then you need to set the reload time properly to include the shoot.

### Projectile AKA Live Ammo

This is the actual flying item that will hit enemies and stuck to them. So it HAS TO BE very low poly. I have used a microscopic tiny cube for this, so the projectile is invisible. Aerodynamics or mesh size do not matter, it can be an elephant if poly count allows. It has to be 3D tho, a 2D (or 1D) plane does not work.

The projectile uses the same texture as the actual weapon does, so if you are using emissive it CAN glow. But it will get stuck on the target like arrows, so...

If a special extra mesh loaded is not linked, the game will use the actual projectile mesh and match its position to the weapons origin WITH OFFSET. If an extra mesh loaded is set up, the game will use that instead.

**Barrel Pos:** This determines the location in relevance to main weapon origo for the live ammo, when the weapon is loaded.

### Textures

Ranged weapons use emissive on the alpha channel of the albedo/diffuse map and glossy/metallic on a separate metallic map. The projectile uses the same material as the actual weapon does. Ranged weapons DO NOT use any transparency. It will always be 100% opaque.

**Emissive:** black (100% alpha) == non emissive white (0% alpha) == glow export as .dds DXT5/BC3 in binary size (fe. 512x512, 1024x512, 1024x1024px).

**Metallic:** Black and white image, white is shiny/glossy and black is not shiny. Export as .dds DXT1/BC1 in binary size.

### Animations

All ranged weapons use the same four animations:

-   aimcrossH
-   aimshoot
-   aimwalk
-   shoot

These animations are set inside the main male\_skeleton and female\_skeleton files. You can replace them with an additional animation skeleton, but you cannot set them specific to a weapon. They will ALL use the same ones. The vanilla shoot animations are made for two-handed crossbow.

What we CAN set specific per ranged weapon, is the reload animation. Some people have been able to make it work by including the actual weapon specific shooting as a continuation of the reload anim. But what happens is the vanilla shoot animation WILL play afterwards. So, to circumvent that, you need to replace the vanilla shoot and aimshoot animations with something that works for all ranged weapons.

The result of this is a visible delay with the shooting animation and the projectile leaving the weapon. It can be slightly adjusted with projectile speed and reload timing settings, but not entirely compensated.

What we are left then, are the two other aim animations, which would need to be replaced with something that can work with all weapon types... Not an easy task.

AND if you do this to ONE weapon you will have to do it to ALL ranged weapons. The mere minimum would be to make a vanilla reload + shooting animation in addition to your specific animation and then set that as the reload for all vanilla weapons. Otherwise none of the vanilla weapons would have any shooting animations. Well, technically you only need to add the shoot animation after the reload 1, 2 and 3 animations in your skeleton and be done.
