---
articleId: weapons-fcs
title: Weapons (FCS)
description: This page contains information about modding Kenshi's weapons. Modding is done through the construction set. Weapons are a sub-category under Items.
categories:
  - Modding
layout: modding
---

This page contains information about [modding](/modifications) Kenshi's weapons. Modding is done through the [construction set](/construction-set). Weapons are a sub-category under Items.

Weapons are made up of two objects: A Weapon and a Model. A Manufacturer connects the two.

## Weapons

This is the weapon type. It includes the base stats and mesh files of the weapon.

### Base

-   Name: Pretty straightforward, this is the name which the game and construction set display for this Item.
-   Object Type: What type of Item this is (WEAPON). Can not be changed.
-   String ID: The String ID is a unique identifier for each item, it must never be the same for 2 objects. DO NOT CHANGE IT if already placed in the game world (otherwise those references will vanish). If it is already referenced by another object (eq item in a character inventory), that's ok because it will update the ID in those references. It is what determines when an item in a .mod file modifies/inherits from an item in another file (usually .base).

(rule of thumb: you will probably never need to change String ID unless you've done something very, VERY wrong)

### Craft

-   material cost: Amount of materials needed to craft.

### Damage

These attributes modify the damage inflicted by the weapon. All attributes will affect a weapon's damage, but some attributes are more important to some weapon types than others.

-   animal damage mult: Damage multiplier of damage against animals. Unaffected by quality.
-   armor penetration: Value (Percent) subtracted from the enemy armor before damage calculation. Negative values increase the effective armor of the target up to a max of 90%.
-   bleed mult: The amount of bleeding this weapon causes. It's directly related to cut damage. The higher the cut damage, the more bleed damage is dealt via this multiplier.
-   blunt damage multiplier: Weapon weight, multiplied Strength and Weapon skill.
    -   The weight of the weapon is actually the blunt dmg of the weapon x (20x"weight mult") or the "weight kg" of the weapon. Whichever is greater.
-   cut damage multiplier: Impacted by Dexterity and Weapon skill, used by sword-like weapons to calculate weapon damage.
-   human damage mult: Multiplier of damage against humans. Unaffected by quality.
-   minimum cut damage multiplier: Provides minimum damage cap, only handy for modding beginners.
-   pierce damage multiplier: Bonus Harpoon damage. Not affected by weapon quality, only stats.
    -   This adds a LOT of harpoon damage to a weapon. Commonly used for animal weapons in base game. MASSIVELY impacts the cut damage done by an animal. To give an example of the impact this has on damage...
        -   A bull with 100 all stats, age 1.0, only set to use an Old Refitted Blade quality weapon and has a backpack on so its Dexterity is not increased for being naked.
            -   Pierce mult set to 0 = 35.464 cut + 20.8 blunt damage vs 50 Toughness target.
            -   Pierce mult set to 1 = 201.464 cut + 20.8 blunt damage vs 50 Toughness target.
-   robot damage mult: Multiplier of damage against robots. Unaffected by quality.

### Files

Item models/meshes.

-   bare sword: Sword mesh only, no sheath. (mesh)
-   icon: Inventory icon image. (png)
-   mesh: Item mesh, sheathed if a weapon. (mesh)
-   physics file: Collision data for dropped items. (xml)
-   sheath: Sheath mesh only, no sword. (mesh)

### General

-   description: Description of the item that is displayed in tooltips etc.
-   length: The length of the weapon, the maximum reach.

### Inventory

-   auto icon image \[true-false\]: Actually does nothing for weapons.
-   inventory footprint height: height of the item (in tiles) in your inventory.
-   inventory footprint width: width of the item (in tiles) in your inventory.
-   slot: Allows for items to go into certain inventory slots. (ATTACH\_WEAPON for weapons)
-   value: Base monetary value of the item. The final value is affected by quality.
-   weight kg: Minimum weight of the weapon, can be overwritten by blunt damage multiplier if it is higher (Blunt dmgx20x"weight).

### Inventory icon

These values determine how the icon is generated.

-   icon offset H: horizontal alignment.
-   icon offset V: vertical alignment.
-   icon zoom: image scale, lower=bigger.

## Mod

-   attack mod: Bonus/penalty to melee attack skill.
-   defense mod: Bonus/penalty to melee defense skill.
-   indoors mod: Modifier to attack + defense if indoors.
-   weight mult: Multiplier for weight. Used to make weapons lighter without affecting the blunt damage. (Although the description continues by saying it should usually be kept at 1.0, MANY weapons have under 1.0 (All Polearms, many Sabres, 2 Blunt Weapons...))

## Models

This contains the weapon texture and modifiers for the stats. The model can also adjust the weapon size.

## Manufacturers

Manufacturers contain a list of weapons and a list of models. All permutations of the listed weapons and models are possible weapons in the game. They also contain various stat modifiers that affect the final weapon. The first value of each row in the "weapon models" list is called "model value" and it's used in the weapon stat generation, ranging from 1 to 100. In the unmodded game, it starts at 5 on "Rusted junk" and increases at intervals of 5 for each new model until it reaches 50 "Catun No. 3" at which it will skip 45 as "MK 1" is 50. It will then skip 65 as "Edge type 1" is 70. The trend continues until "Edge type 3" at 80. Meitou is 100.

As a reference, here is a table with all of the stat modifiers of each manufacturer on the base game.

<table class="wikitable"><tbody><tr><th scope="row">Manufacturer</th><th scope="col">Blunt damage mod</th><th scope="col">Cut damage mod</th><th scope="col">Min Cut damage</th><th scope="col">Weight mod</th><th>Price mod</th></tr><tr><th scope="row">Unknown</th><td>1</td><td>1</td><td>1</td><td>1</td><td>0.3</td></tr><tr><th scope="row">Ancient</th><td>1</td><td>0.9</td><td>1</td><td>0.7</td><td>0.8</td></tr><tr><th scope="row">Catun Scrapmasters</th><td>1.2</td><td>1</td><td>1</td><td>1.2</td><td>1.2</td></tr><tr><th scope="row">Skeleton Smiths</th><td>1</td><td>1</td><td>1</td><td>1</td><td>1.2</td></tr><tr><th scope="row">Edgewalkers</th><td>1</td><td>1.1</td><td>1</td><td>1</td><td>1.4</td></tr><tr><th scope="row">Cross</th><td>1</td><td>1.1</td><td>1</td><td>1</td><td>2</td></tr><tr><th scope="row">Homemade</th><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr></tbody></table>

## Price multipliers

There are additional hidden quality multipliers when calculating for weapon base price. These values are reversed engineered and double checked against the default "sword price" and "loot multiplier". Do note that some of these values may be off due to rounding issues.

<table class="wikitable"><tbody><tr><th scope="row">Quality</th><th>Level</th><th>Multiplier</th></tr><tr><th>Rusted Junk</th><th>5</th><td>18.85</td></tr><tr><th>Rusted Blade</th><th>10</th><td>20.65</td></tr><tr><th>Mid-Grade Salvage</th><th>15</th><td>23.3</td></tr><tr><th>Old Refitted Blade</th><th>20</th><td>27.05</td></tr><tr><th>Refitted Blade</th><th>25</th><td>32.275</td></tr><tr><th>Catun 1</th><th>30</th><td>39.35</td></tr><tr><th>Catun 2</th><th>35</th><td>48.55</td></tr><tr><th>Catun 3</th><th>40</th><td>59.95</td></tr><tr><th>Mk 1</th><th>50</th><td>87.5</td></tr><tr><th>Mk 2</th><th>55</th><td>101.8</td></tr><tr><th>Mk 3</th><th>60</th><td>115.025</td></tr><tr><th>Edge 1</th><th>70</th><td>135.625</td></tr><tr><th>Edge 2</th><th>75</th><td>142.7</td></tr><tr><th>Edge 3</th><th>80</th><td>147.9375</td></tr><tr><th>Meitou</th><th>100</th><td>157.392</td></tr></tbody></table>



## Stat generation formulas

To get an idea of how powerful or weak, or how expensive a given weapon is, here are some of the formulas used to generate the stats as seen in-game. The damage multipliers are taken from the damage section of the given weapon, the "weight kg" from the inventory section, and both the "model value" and "manufacturer factor" from the Manufacturer definitions.

-   **Blunt Damage**: blunt damage multiplier \* model value / 50 \* manufacture factor
-   **Cut Damage**: cut damage multiplier \* (0.3 + 0.017 \* model value)
-   **Weight**: Maxim (weight kg; 20 \* Blunt Damage \* weight mult \* manufacture factor)
-   **Price:** FCS Value \* Quality \* Manufacturer \* FCS Global Sword Price Mult \* FCS Loot Price Mult Gear (or FCS Loop Price Mult Player Weapon)

In order to use a weapon without a combat speed penalty you require a strength level equal to 40 times the blunt damage of a weapon or just the weight of the weapon, whichever is the greater value. The x2 weight rule of thumb spread around does not work for many weapons such as all Katanas, Polearms, as well as many Blunt weapons and Sabres.
