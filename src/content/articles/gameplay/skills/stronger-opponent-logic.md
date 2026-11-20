---
articleId: stronger-opponent-logic
title: Stronger Opponent Logic
description: Some skills have their experience rate modified by the "strength" of your opponent. The logic behind this is never explained in-game, leaving many players in…
categories:
  - Statistics
layout: gameplay
---

## Overview

Some skills have their experience rate modified by the "strength" of your opponent. The logic behind this is never explained in-game, leaving many players in the dark about how it works. This page is an attempt to explain exactly what it's checking to determine these modifiers.

When an attacker swings their weapon, a check is run against their stats to determine the multiplier. This check is always run between two skills, one from each character, though the specific skills changes depending on the role of the character in the engagement and their fighting style (more on this later). This exp rate multiplier scales from x0.1 at 22.5 levels (The value is set for 0% XP at 25 levels over your opponent's skill however it has a minimal XP % of 10% which is achieved at 22.5) above the opponent's opposing skill, to x6.0 at 50 levels below the opponent's opposing skill.

As of right now there are eleven known stats that are affected by this logic.

-   [Melee Attack](/melee-attack)
-   [Melee Defense](/melee-defense)
-   [Martial Arts](/martial-arts)
-   [Dodge](/dodge)
-   [Dexterity](/dexterity)
-   [Blunt](/blunt-weapons)
-   [Hackers](/hackers)
-   [Heavy Weapons](/heavy-weapons)
-   [Katanas](/katanas)
-   [Polearms](/polearms)
-   [Sabres](/sabres)

When a unit is hit the defense experience is given to that unit first, and then attack experience is given based on the new defense value. Dodging can sometimes reduce exp gain to 0, as the attack needs to make contact with their hitbox to trigger exp gain at all for either side, and some dodges will cause the character's hitbox to avoid the attack altogether.

## Combat Styles

The skill checks used to determine how much your XP gained is multiplied by are explained below. Unless stated otherwise the value used is based off your modified level. So, if you have 50 attack and have a Tin Can equipped which reduces it by 5, 45 would be used.

### Weapon Skills

The experience gained is based off your weapon skill level vs your opponent's defense/martial arts level.

If an attack is blocked, you'll only be given 40% of the XP that landing a hit would grant.

When blocking an attack, you gain XP based off your opponent's def/martial arts (If they are unarmed) level. Important to note that the experience gained when blocking is much smaller than the XP gained when attacking.

### Attack

This skill will use your [Melee Attack](/melee-attack) level to challenge the opponent's [Melee Defense](/melee-defense) if they have a weapon, or [Martial Arts](/martial-arts) skill if they are unarmed.

If an attack is blocked, you'll only be given half the XP that landing a hit grants.

### Defense

This skill will use your [Melee Defense](/melee-defense) level to challenge the opponent's [Melee Attack](/melee-attack) if they have a weapon, and their [Martial Arts](/martial-arts) skill if they are unarmed.

Failing to block an attack results in 8x the amount of XP that successfully blocking grants.

### Martial Arts

This skill will use your [Martial Arts](/martial-arts) to challenge the opponent's [Melee Defense](/melee-defense) if they have a weapon, or [Martial Arts](/martial-arts) if they are unarmed.

If an attack is blocked, you'll only be given half the XP that landing a hit would grant.

### Dodge

This skill will use your [Dodge](/dodge) level to challenge the opponent's [Melee Attack](/melee-attack) if they have a weapon, and [Martial Arts](/martial-arts) if they are unarmed.

Getting hit seems to grant 2x the XP that successfully dodging grants however on occasion it can trigger more than once.

### Animals

Animals are mostly identical to the weapons combat style, with a notable exception. Animals will use [Melee Attack](/melee-attack) as their offensive stat when being challenged by someone else's defensive stat, however when determining their own exp gain they will challenge both their [Melee Attack](/melee-attack) and [Martial Arts](/martial-arts) skills against the opponent's defensive skill, and both skills will gain exp independently of each other (i.e. one could gain 4x exp rate, and the other 0.5x).

Defensively, they just use [Melee Defense](/melee-defense) as their defensive skill.

## Dexterity

[Dexterity](/dexterity) is unusual, as it is never actually used in any of this logic. It is however modified by the **Attack** or **Martial Arts** challenge mentioned above. It will check your Attack or Martial Arts (Depending on if you using a weapon or not) and challenge the opponent's Defense or (If they are unarmed) Martial Arts. If using a weapon, then the experience gained is then multiplied by the ratio of cut damage to total damage on a weapon. Cut damage / (Cut damage + Blunt damage) To give an example, (If all skills are at the same level) if landing an attack when using a weapon with 0.3 cut damage and 0.1 blunt damage results in 45% of an attack level then the unit will also gain 33.75% Dexterity experience. (As 0.3/0.4 is 0.75 and then 0.75 x 45 results in 33.75) If unarmed the cut damage will be treated as 1 and blunt damage as 0 leading to a 1x mutliplier.

## Stat Modifiers

The following modifiers will affect Stronger Opponent Logic calculations. (With examples)

-   Armour Modifiers
    -   Tin Can giving -5 attack, Samurai Armour giving -8 attack.
-   Backpack penalties
    -   Large Backpack giving -10 attack/defense.
-   Encumbrance penalties
    -   Encumbrance reduces MA by a percent equal to 0.8x Encumbrance %. So, if 100% encumbered MA will be reduced to 20%.
    -   Dodge XP is reduced by a % equal to Encumbrance %. If you were encumbered by 50% that would lead to 50% dodge XP.
-   Indoor bonuses/penalties
    -   Heavy weapons giving -6 attack/defense indoors increasing XP gain through SOL.
    -   Wakizashi giving +4 attack/defense or Martial Arts granting +8 Martial Arts indoors reducing XP gain through SOL.
-   Injuries (though the penalties themselves are only applied to [Dodge](/dodge))
-   Weather penalties
    -   Up to -10 Attack/Martial Arts in the most powerful duststorms.
-   Weapon modifiers (though obviously only weapon users get the modifiers themselves)
    -   Foreign Sabre reducing attack by 4 increasing SOL XP gain.
    -   Nodachi increasing attack by 4 reducing SOL XP gain.
-   BLOCK enabled.
    -   Reduces dodge XP gain oddly enough, defense is unaffected.

## Extra notes about XP gain

-   After SOL is applied your actual level will determine the % you get in the end. The XP is multiplied by (1-level/101)².
-   Being outnumbered in combat multiplies the XP gained by +10% for each enemy which outnumbers a single unit. So, if fighting 1 v 4 you'll get 1.3x XP.
    -   This caps at 1 v 8 + with a maximum multiplier of 1.666...x XP.
-   When hitting animals the game will use their defense level if they were age 1.0.
-   When being hit by animals the game will use their attack level based off their current age.
