---
articleId: global-game-settings
title: Global Game Settings
description: The point of this guide is to explain what editing the Global game settings (GLOBAL CONSTANTS) does in FCS. This page was created with Kenshi v1.0.68 and FCS…
categories:
  - Guides
layout: modding
---

The point of this guide is to explain what editing the Global game settings (GLOBAL CONSTANTS) does in FCS. This page was created with Kenshi v1.0.68 and FCS v2.0.

### WIP

## Block success

-   base block chance - Chance to block vs opponent when defenders defense = attack(or martial arts)
-   block chance increase per 10levels - If defence is 10 levels over opponents attack the chance to block successfully goes up by this much. The Maximum chance is 95%
-   block chance reduction per 10levels - If defence is 10 levels under opponents attack the chance to block successfully goes down by this much. The Minimum chance is 5%.

## Combat balance

-   attack chance factor - How often unit will attack over another if their attack skill is higher. 1 + ("attack chance factor") (attack levels higher than opponent) = chance of attacking.
-   max num attack slots - The description is a bit misleading. Multiple enemies can and will attack you at once even with 1 set due to a ton of different factors. The higher the Attack slots the more it rewards giant groups.

## Combat damage

-   blunt damage 1 -
-   blunt damage 99 -
-   blunt permanent organ damage - Causes blunt damage to do part flesh "organ" damage (what cut normally does). If the value is 0 then it does stun damage like normal. If it is 1 then it deals flesh "organ" damage.
-   bow damage 1 - This value is multiplied by the "Pierce damage min 0" and "Pierce damage min 1" of a Crossbow to determine the minimum damage of a Crossbow.
-   bow damage 99 - This value is multiplied by the "Pierce damage max 0" and "Pierce damage max 1" of a Crossbow to determine the maximum damage of a Crossbow.
-   cut damage 1 - "cut damage 1" x "damage multiplier" = Minimum cut damage for cut majority weapons. For cut damage weapons you also take ("cut damage 99" - "cut damage 1") x "global damage mult" to determine the scaling cut damage gained for each 1.0 cut damage a cut majority weapon has. Half of this value is given for every 100 Dex, half is given for every 100 Weapon skill)
-   cut damage 99 -
-   damage resistance max - Damage Reduction at 100 Toughness. 1 = 100%. 0 = 0%, -1 = -100% and so on. Does not scale past level 100 Toughness. If this is set over 1 then a target will heal from damage taken when they reach that level.
-   damage resistance min - Damage Reduction at 0 Toughness. 1 = 100%, 0 = 0%, -1 = -100% and so on. Does not scale below level 0 Toughness.
-   immediate blood loss - (Cut dmg done)(Weapon Blood Loss)(Racial Bleedrate of target hit)("immediate blood loss") = How much blood/oil a character will lose instantly upon taking damage.
-   pierce damage multiplier - Multiplier for the scaling pierce damage (Harpoon damage) on weapons. It is also multiplied by the global "damage multiplier". In base game this is on every animal weapon except Gorillos. This makes up a TON of animal damage and is why animals have insanely high damage when trained. However, it is hard countered by armour.
-   stumble damage max - When hit you will always be staggered, however stumble is the long animation which plays if you receive too much damage. The description is misleading. It is actually "stumble damage max" x "damage multiplier". By default, this value is set to 80 which means that at 100 Toughness the result is 52.
-   unarmed damage mult - Another description which lies. It states it affects all damage calculations for this damage type however it only affects the damage gain from Toughness for Martial Arts.

## Faction

-   max faction size - Maximum characters the player can have in their faction.
-   max squad size - Max number of characters a player can drag into a squad.
-   max squads - Max squads the player can have at a given time.

## GAME SPEEDS

-   build speed - The higher this value, the faster you can build.
-   prison time - The higher this value, the longer the jail sentence.
-   production speed - The higher this value, the faster crafting will be.
-   research level increase rate - The higher this value, the longer higher-level technologies will take.
-   research rate - The lower this value, the faster research speed will be.

## General

-   min dismantle materials percent - Number of materials that are dropped when dismantling a structure. When dismantling an item with 1 material it will give that 1 material back, if the amount is not exact, it may give the amount rounded up or down.
-   minimum lockpick chance - Minimum % chance to attempt to unlock a container. (5% by default

## Global balance

-   damage multiplier - Multiplier for many formulas including scaling piercing/cut/blunt damage, minimum cut/blunt damage, stumble damage max. Does not affect the damage of Crossbows, Turrets or Martial Arts.

## Hunger

-   bed hunger rate - Multiplier for the speed at which hunger drains when sleeping.
-   encumbrance hunger rate - Multiplier for hunger rate when fully (100%) encumbered. (1 = 2x hunger speed)
-   fed recovery rate mult - Multiplier for the speed your hunger fills after eating food.
-   food quality mult - The "charges" value on a food item multiplied by this value = Nu total on the item.
-   starvation time - Time it takes for lose 100 Hunger, the higher this value, the slower hunger will drain.

## Medic

-   heal rate mult -
-   medic speed mult -
-   medkit drain 1 - Multiplier for how quickly you use medical supplies at skill level 0.
-   medkit drain 99 - Multiplier for how quickly you use medical supplies at skill level 125.
-   resting heal rate mult - Multiplier for blood regeneration when sleeping. (Does NOT affect bodypart heal rate)
-   robot wear rate - If this value is over 0 then combat damage taken on robotic health will decrease the maximum health of that bodypart. A value of 1 (default) means a health decrease of 4% of the damage taken.
-   XP rate medic 1 - How fast you level field medic and robotics at level 0. (Every 15 is around 11 minutes of gametime)
-   XP rate medic 99 - How fast you level field medic and robotics at level 100. (Every 15 is around 11 minutes of gametime)

## Medical

-   bleed rate - The higher this value the more bleeding received from being hit by cut damage. (Suggest not touching, scales pretty insanely)
-   bleeding clot rate - The higher this value, the faster your bleeding will stop on its own.
-   blood recovery rate - 8(blood recovery rate)(healrate) is how much blood/oil a character will regenerate over 22minutes of gametime. By default, this value is 0.4 so a Greenlander would regenerate 3.2 blood/22 minutes. As 8(0.4)(1) is 3.2.
-   bodypart degeneration rate - The higher this value, the quicker wounds overall will worsen.
-   degeneration mult 1 - Degeneration rate at 0 Toughness.
-   degeneration mult 99 - Degeneration rate at 100 Toughness.
-   extra blood loss from bodyparts -
-   knockout mult 1 - KO multiplier at 0 Toughness.
-   knockout mult 99 - KO multiplier at 100 Toughness.
-   knockout time base - "base" KO time.
-   max toughness ko point - KO point at 100 Toughness.
-   min toughness ko point - KO point at 0 Toughness.
-   stun recovery rate - Healing multiplier for stun (blunt) damage.

## Prices

-   armor price mult - Multiplier for armour prices.
-   blueprint price mult - Multiplier for the cost of Armour blueprints. No effected by other price mults. Armour blueprint prices are the cost of a Standard piece of the armour (At 1.0x armour price mult) multiplied by this value.
-   clothing price mult - Multiplier on clothing. (Clothes without coverage)
-   crossbow price mult - This is not a typo... This effects the price of Robotic Limbs.
-   food price mult - Multiplier on crops, water and food items.
-   global price mult - Multiplier on "most" items.
    -   Blueprints, Backpacks and research artifacts are not included.
-   loot price mult - Food and stolen item sell value multipliers.
-   loot price mult GEAR - Multiplier for the price of Armour/Weapons compared to their value.
-   loot price mult player armour - Multiplier for the price of armour you make.
-   loot price mult player weapons - Multiplier for the price of weapons you make.
-   robotics price mult - This is not a typo... This effects the price of Crossbows.
-   sword price mult - Multiplier for the value and sell value of weapons.
-   trade price mult - Multiplier for many trade items. Default value is 0.6. So, Beak Thing Eggs which are set to have a value of c.7,000 instead have their value reduced down to c.4,200.
-   trade profit margins - Mark up can go this much lower or higher. Default is 0.3 meaning items which are impacted by mark up can range between 70% to 130% of the default value. The distance from one town to another impacts how much this can change.

## Weather

-   exposure max -
-   exposure min -
-   latitude -
-   night darkness -
-   sunrise - The time when the sun starts to rise. (Stealth becomes harder)
-   sunset - The time when the sun goes down. (Stealth becomes easier)

## Weight

-   carry person weight - Weight added when carrying another unit.
-   carry weight mult 0
-   encumbrance base - Carry weight for a 0 Strength unit.
-   weapon inventory weight mult - If blunt damage x 40 x this value is higher than the default weight of the weapon, it will use that value as the weight of the weapon.

## XP

-   exp gain multiplier - Multiplier for \*almost\* all XP gains.
    -   Does not impact lockpicking xp.
-   min strength xp mult - XO rate when using a weapon, which you meet the Strength requirement to use.
-   skill diff xp 0x penalty - Level over opponent where XP equals 0.
    -   XP cannot actually equal 0, the minimum it can reach is 10% which means that the minimum XP gained is reached at 90% of this value.
-   skill diff xp 2x bonus - Level under opponent where XP is increased by 1x.
    -   Caps at 1x+5x so a total maximum of 6x XP.
-   weight strength diff 1x - Strength level under the required level to use a weapon. If all settings are default and you are under this many levels, you get +100% Strength XP totaling 110%.
-   weight strength diff max - The max Strength XP gained for being too low of a level. If all values were default except for this set at 1.5 then using a weapon which required 30 more Strength than you had would result in +150% XP, for a grand total of 160% Strength XP.
-   xp rate athletics - Athletics XP multiplier.
-   xp rate strength - Multiplier for Strength XP for hitting/blocking/being hit in combat.
-   xp rate strength from walking - This value x 100 is the max Strength XP gained when walking. (If carrying another unit, if not then it's this value x 50)
-   xp rate toughness - XP multiplier for Toughness when taking damage in combat. Does not affect getting up when playing dead XP boost.
    -   Does not impact XP gained from losing a limb.
