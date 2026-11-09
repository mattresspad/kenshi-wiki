---
title: "Combat Speed"
description: "Combat Speed is a multiplier to your attack and block speed. It comes only from worn armour and backpacks (below); the multipliers of everything you wear mul…"
source:
  title: "Combat Speed"
  revision: 95981
categories: ["Combat"]
---

## Combat Speed

Combat Speed is a multiplier to your attack and block speed. It comes only from worn armour and backpacks ([below](#Item_Related)); the multipliers of everything you wear multiply together. Encumbrance and having the required strength to use a weapon also change your attack and block speed the same way, but don't show as Combat Speed.

Training your Dexterity and Attack/Defense skills are generally the primary method of increasing your attack and block speed, but this does NOT impact combat speed.

A t t a c k S p e e d \= ( 0.8 + 0.4 ∗ 0.6 ∗ D e x t e r i t y + 0.4 ∗ A t t a c k 100 ) ∗ 0.95 ∗ C o m b a t S p e e d {\\displaystyle AttackSpeed=(0.8+0.4\*{\\frac {0.6\*Dexterity+0.4\*Attack}{100}})\*0.95\*CombatSpeed}

B l o c k S p e e d \= ( 0.6 + 3.4 ∗ 0.6 ∗ D e x t e r i t y + 0.4 ∗ D e f e n s e 100 ) ∗ 0.95 ∗ C o m b a t S p e e d {\\displaystyle BlockSpeed=(0.6+3.4\*{\\frac {0.6\*Dexterity+0.4\*Defense}{100}})\*0.95\*CombatSpeed}

-   Attack speed caps at 1.2, block speed at 4.0. The cap is applied after Combat Speed.
-   Base attack speed is 0.76. Each level of attack adds 0.00152, each level of Dexterity 0.00228.
-   100 Attack and 100 Dexterity gives 1.14 attack speed. With [Wooden Sandals](/wooden-sandals) it is 1.197, still under the cap.
-   Unarmed, [Martial Arts](/martial-arts) replaces both Attack and Defense.
-   Defensive stance adds 20 to Defense for block speed.
-   Injuries lower Dexterity, and so speed (see [Skill penalties](/damage#skill-penalties)).
-   Deep water multiplies attack and block speed by 0.8, after the cap.

### Dodge

In the game code, dodges play at block speed, which includes Combat Speed. Unarmed, block speed uses [Martial Arts](/martial-arts) rather than [Dodge](/dodge); Dodge only sets the chance to dodge.

If dodges look unaffected in game, it may be because an unarmed character's Combat Speed only updates when they draw or put away a weapon or load a save. Changing armour alone doesn't update it. (Needs testing.)

### Strength requirement

Every weapon has a required Strength level to wield effectively. You can work it out from the weapon's tooltip:

R e q u i r e d S t r e n g t h \= m a x ( 40 ∗ B l u n t D a m a g e , W e i g h t ) {\\displaystyle RequiredStrength=max(40\*BluntDamage,Weight)}

So multiply the "Blunt damage" by 40. If the weapon's weight is higher than that, its weight is the requirement instead.

For most weapons this is about 2x the weight. Exceptions:

-   **Weapons that look lighter than they are**: [Staff](/staff), [Jitte](/jitte), [Heavy Jitte](/heavy-jitte), [Polearm](/polearm), [Heavy Polearm](/heavy-polearm), [Naginata](/naginata), [Naginata Katana](/naginata-katana) and [Holed Sabre](/holed-sabre). Their requirement is higher than 2x their weight, so use 40x Blunt damage.
-   **Weapons with little blunt damage** (most katanas and sabres): the requirement is their weight, not 2x.

Examples:

<table class="wikitable"><tbody><tr><th>Weapon</th><th>Blunt damage</th><th>Weight</th><th>40x Blunt damage</th><th>Required Strength</th></tr><tr><td><img class="item-icon item-icon-wide" src="/icons/items/52299-rebirth.mod.png" alt="" width="96" height="24"> <a href="/paladins-cross">Paladin's Cross</a></td><td>1.46</td><td>29 kg</td><td>58.4</td><td>58.4</td></tr><tr><td><img class="item-icon item-icon-wide" src="/icons/items/52302-rebirth.mod.png" alt="" width="96" height="24"> <a href="/staff">Staff</a></td><td>1.00</td><td>5 kg</td><td>40</td><td>40 (not 10)</td></tr><tr><td><img class="item-icon item-icon-wide" src="/icons/items/52303-rebirth.mod.png" alt="" width="96" height="24"> <a href="/jitte">Jitte</a></td><td>1.20</td><td>16 kg</td><td>48</td><td>48 (not 32)</td></tr><tr><td><img class="item-icon item-icon-wide" src="/icons/items/922-gamedata.base.png" alt="" width="96" height="24"> <a href="/nodachi">Nodachi</a></td><td>0</td><td>8 kg</td><td>0</td><td>8 (not 16)</td></tr></tbody></table>

If you don't have the required Strength, attack and block speed drop by about 2.6% for every level short, down to -47.4% at 18 or more levels short. Your Strength here is your current Strength, so injuries to your arms or torso and old age lower it.

[Martial Arts](/martial-arts) has no strength requirement.

### Encumbrance

-   No effect up to 50% encumbrance.
-   From 50% to 100%, attack and block speed drop linearly, to 72.5% of normal at 100%.
-   For [Martial Arts](/martial-arts) it instead lowers the Martial Arts skill used for speed, from the first percent.

### Item Related

Increases Combat Speed

-   [Assassin's Rags](/assassins-rags) (1.1x)
-   [Wooden Sandals](/wooden-sandals) (1.05x)

Decreases Combat Speed

-   [Backpacks](/backpacks): small (0.95x), medium (0.9x), large (0.8x), shopkeeper bags (0.5x). Thief backpacks and the coloured Medium Backpack don't.
-   [Ancient Samurai Armour](/ancient-samurai-armour) (0.94x)
-   [Empire](/empire-samurai-armour) / [Samurai Armor](/samurai-armour) (0.94x)
-   [Crab Armour](/crab-armour) (0.95x)
-   [Crab Trousers](/crab-trousers) (0.96x)
-   [Holy](/holy-chest-plate) / [Unholy Chest Plate](/unholy-chest-plate) (0.96x)
-   [Chainmail](/chainmail), [Chain Shirt](/chain-shirt), [Rusty Chainmail](/rusty-chainmail), [Rusty Chain Shirt](/rusty-chain-shirt), [Rusted Hive Shirt](/rusted-hive-shirt), [Blackened Chainmail](/blackened-chainmail), [Blackened Chain Shirt](/blackened-chain-shirt), [Blackened Chain Hive Shirt](/blackened-chain-hive-shirt), [Hiver Chain Shirt](/hiver-chain-shirt) (0.97x)
-   [Ancient Samurai Legplates](/ancient-samurai-legplates) (0.98x)
-   [Samurai Legplates](/samurai-legplates) (0.98x)
-   [Mercenary Plate](/mercenary-plate) (0.98x)
-   [Armoured Rags](/armoured-rags) (Coloured variant as well) (0.98x)

[Samurai Boots](/samurai-boots) and [Crab Shoes](/crab-shoes) don't change Combat Speed. Headgear never does. Heavy armour's penalty varies slightly with quality.

## Combat Move Speed

Combat Move Speed is how fast your character moves around while in combat. It is often confused with the Combat Speed above but is a distinctly separate and independent value. It is determined by your [Race](/races), providing bonuses or penalties depending on which one your character is.

There is no way to increase your Combat Move Speed multiplier, beyond race selection. Your actual speed is still limited by your run speed (injuries, encumbrance, athletics) and water.

(Western and Southern) Hive Prince/Hive Worker Drone - 1.2x

(Western and Southern) Hive Soldier Drone - 1.1x

Greenlander/Scorchlander/Shek - 1x

Skeleton/Soldierbot/P4 Unit - 0.9x

NOTE: This list covers playable humanoid races in Kenshi. Combat Move Speed for all races can be discovered in the [Forgotten Construction Set](/forgotten-construction-set).
