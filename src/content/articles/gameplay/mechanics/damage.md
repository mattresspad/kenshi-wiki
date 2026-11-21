---
articleId: damage
title: Damage
description: Kenshi has a complex damage system where types of damage and the affected bodypart have different results for the character. This includes factors such as KO…
categories:
  - Guides
  - Combat
layout: gameplay
bookmarks:
  "Damage_floaters": "damage-floaters"
---

Kenshi has a complex damage system where types of damage and the affected bodypart have different results for the character. This includes factors such as KO times and which skills get penalties.

A hit that takes a vital limb (head, chest, stomach) below 0 health knocks the character out. Below their KO point, a negative health value set by [Toughness](/toughness) (-10 at 0 Toughness to -85 at 100), they enter a **Recovery coma**: they stay down until every vital limb is back above 0, whatever the KO timer says.

## Stun Damage

**Stun damage** (commonly referred to as **Blunt Damage**) is an inflicted damage type. When a character is hit with a weapon dealing blunt damage, it decreases the condition bar of that targeted area without causing bleeding. This damage does not need to be bandaged with First Aid Kits and will heal on its own, conscious or not.

## Cutting Damage

**Cutting damage** is an inflicted damage type. When a character is hit with a weapon dealing cutting damage, it causes them to bleed. Cutting damage worsens over time if it exceeds 20% of the limb's maximum health. Therefore it is important to bandage cuts with [First Aid Kits](/medical-items) (or [Skeleton Repair Kits](/skeleton-repair-kit) if the damaged limb or character are robotic).

Wound degeneration speed has a baseline (1x) at 30% of the limb's maximum health in unbandaged damage. Every 10% extra adds +1x, up to 7x at 90%. For example, at 80% cut damage you would worsen 6x faster than at 30%. At 100% or more it runs 4x faster again. As such, at very high cut damage your injuries may worsen faster than you can heal, leading to death.

-   Wound degeneration is not active when laying in any type of bed.
-   Races that heal on their own (most animals) are not affected by it unless they are unconscious.
-   Arms and legs of skeletons and robotic limbs never degenerate. Skeletons' head, chest and stomach do.

Note: sometimes you might see the term "**Negative Bandaged Health**". This relates to cut damage which goes over 100% of a limb's health getting bandaged; this is not shown in the game's UI, as the bars only go down to 0 and the numbers next to them only show the current total health.

## Damage Calculations

The damage that you take is cut damage/stun damage modified by your armor and toughness. See [Resistances](/resistances) for additional information. Cut resistance and Blunt resistance are from worn armour.

B l u n t D a m a g e \= R a w B l u n t D a m a g e ∗ ( 1 − B l u n t R e s i s t a n c e ) ∗ ( 1 − D a m a g e R e s i s t a n c e ) ∗ G l o b a l D a m a g e M u l t {\\displaystyle BluntDamage=RawBluntDamage\*(1-BluntResistance)\*(1-DamageResistance)\*GlobalDamageMult}

C u t D a m a g e \= R a w C u t D a m a g e ∗ ( 1 − C u t R e s i s t a n c e ) ∗ ( 1 − D a m a g e R e s i s t a n c e ) ∗ G l o b a l D a m a g e M u l t {\\displaystyle CutDamage=RawCutDamage\*(1-CutResistance)\*(1-DamageResistance)\*GlobalDamageMult}

-   **DamageResistance** comes from [Toughness](/toughness). It runs from -65% at 0 Toughness to +65% at 100, so a low Toughness character takes _extra_ damage. It is applied once, after all armour.
-   **GlobalDamageMult** is the "Global damage multiplier" new game setting (0.5x to 4x).
-   A weapon's armour penetration lowers each armour's resistance by that percentage.
-   An armour piece only protects a limb on a given hit with a chance equal to its coverage of that limb.

The resulting cut damage is used again for the next armour piece. The raw cut damage that already was resisted by armour cannot be reduced further. For example, if an armour piece had 80% Cut resist the next armour piece would only be able to resist the remaining 20% of the cut damage. Blunt resistance stacks the same way.

Armor also has a Cut Resistance efficiency. This is the amount of cut damage that is converted into stun damage.

A d d i t i o n a l S t u n D a m a g e \= R a w C u t D a m a g e ∗ C u t R e s i s t a n c e ∗ ( 1 − C u t R e s i s t a n c e E f f i c i e n c y ) {\\displaystyle AdditionalStunDamage=RawCutDamage\*CutResistance\*(1-CutResistanceEfficiency)}

With several layers, each piece converts the cut damage it stopped. The additional stun damage is not reduced by armour, but [Toughness](/toughness) and the global damage multiplier still apply.

### Damage floaters

Depends on the "Show damage floaters" setting:

-   **Simple info** (default): one whole number, cut + pierce + blunt + stun. A stun amount below 1 shows as 0.
-   **Full info**: stun is hidden whenever blunt damage is below 1.

## Blood loss

Each hit with cut or pierce damage opens a wound with its own bleed value:

B l e e d i n g \= m a x ( C u t D a m a g e , P i e r c e D a m a g e ) ∗ W e a p o n B l o o d L o s s 1000 {\\displaystyle Bleeding={\\frac {max(CutDamage,PierceDamage)\*WeaponBloodLoss}{1000}}}

Cut and pierce here are after armour and Toughness. Each wound clots steadily and closes when its bleed reaches 0. Blood loss per second is the sum of all open wounds:

B l o o d L o s s P e r S e c o n d \= S u m ( B l e e d i n g ) ∗ 1.2 ∗ R a c i a l B l e e d r a t e {\\displaystyle BloodLossPerSecond=Sum(Bleeding)\*1.2\*RacialBleedrate}

This is scaled by the new game setting for how likely characters are to die.

-   **Instant loss**: each hit also removes 20% of its cut + pierce damage from the blood meter at once (times the weapon's blood loss and the racial bleed rate).
-   **Arrows**: the blood meter shows one arrow per 0.05 blood per second. One to three is the usual range.
-   **Blood Loss KO**: at an empty blood meter (0). After waking from one, it takes -25 to be knocked out again, until blood is back above 25.
-   **Bleeding out**: death at -100% of the blood meter (twice your max blood lost).
-   Bandaging first stops each wound's bleeding, newest first, then bandages the damage.
-   Robots are also susceptible to this, their blood meter is just labelled as Oil.
-   Cut damage on robotic limbs of biological characters does apply bleeding.
-   Unarmed and [Martial Arts](/martial-arts) hits never cause bleeding.

Due to the amount of bleeding depending on the amount of cut damage, weapons with high Blood Loss multipliers but very little or no cut damage will not apply much bleeding. For example:

-   [Jitte](/jitte) not only has 0.1x BL but no cut damage. Blunt majority weapons still deal a minimum of 5.2 cut damage, so they bleed a little.
-   [Spiked Club](/spiked-club) has 2x BL but only 0.3x cut damage, effectively only giving a small amount of bleed.
-   Crossbows always have a 2x BL multiplier, regardless of what they actually display.
-   [Nodachi](/nodachi) has the joint highest cut damage and a 1.2x BL, making them possibly the highest melee dealers of bleeding in the game (turrets cause the most blood loss by far).

Because every wound clots at the same steady rate, the total blood one untreated wound loses grows with the square of its bleed:

T o t a l B l o o d L o s s O f O n e W o u n d \= B l e e d i n g 2 ∗ 705.83 ∗ R a c i a l B l e e d r a t e {\\displaystyle TotalBloodLossOfOneWound=Bleeding^{2}\*705.83\*RacialBleedrate}

Twice the bleed loses 4x the blood. One big hit is far more dangerous than several small ones. At high bleed it is possible to die of blood loss before being able to bandage it, similarly to wound degeneration. However, getting a life-threatening bleed amount is very rare. It happens almost exclusively to characters with very low [Toughness](/toughness) (because it dictates the amount of damage), due to limb loss, and when getting hit with **pierce damage** (mainly turrets and animals, crossbows aren't as dangerous).

## Pierce Damage

**Pierce damage** is a special type of cut damage which bypasses cut resistance of regular armours, and as a result it inflicts a massive amount of cut damage and bleeding. It is dealt by crossbows, turrets and most animals (including robotic spiders). Armour with **Harpoon resistance** stops the specified amount of damage from being applied as cut damage but still converts it to stun damage via cut resistance efficiency. The remaining damage passes without any protection. For example:

-   You have a Masterwork [Dustcoat](/dustcoat) (44% Cut Resist, 60% Cut Efficiency, 35pts Harpoon Resist)
-   You got shot by a Crossbow which deals 50 Harpoon damage.
-   35pts of damage goes through the cut resistance efficiency calculation (35 x 0.44 x (1-0.6)) and becomes 6.16 stun damage. Unlike regular cut damage, the 56% (1-0.44) of damage which your armour did not mitigate is not applied as cut damage. In other words, the 6.16 stun damage is all you get from those 35.
-   You take the remaining 15 pierce damage as direct cut damage (without applying any armour resistances) for a total of 15 cut damage and 6.16 stun damage.
-   Toughness is then applied to the damage you take to reduce it further.

Harpoon resistance adds up across every armour piece covering the hit limb. Plate armour (35) and chainmail (20) together stop 55.

Notes:

-   When struck by arrows the damage floaters may show 0 damage taken, but you will still take the stun damage (see [Damage floaters](#Damage_floaters)).
-   Samurai Boots and Heart Protector have 100% Cut Efficiency, which causes no stun damage to be taken from the mitigated damage.

## Losing a limb

_Main article: [Robot Limbs](/robot-limbs)_

Non-vital limbs (i.e. legs and arms) can be lost after receiving too much damage, but the way it happens depends on the game setting called "Dismemberment":

-   Frequent: limbs are lost when they reach below -100% health (i.e. they lose 2x their max health). Stun damage counts toward this.
-   Rare (default): on top of the above, the limb needs to receive damage to be lost.
-   Never

Being eaten or put in a peeler machine can also take limbs, on Rare and Frequent.

Losing a limb removes 5-30 blood at once and opens a wound that bleeds like a 200 damage cut. A lost limb (stump) needs bandaging or immediately wearing a robotic limb to avoid bleeding out. A stump has only 5 max health and arms and legs add KO time once below 0, so at low [Toughness](/toughness) levels a KO from vital damage shortly after can reach values such as 2000-6000s. Skeletons can lose limbs just like humans, however this is exceedingly rare in normal gameplay, as their limbs have 200 health, requiring a massive 400 damage to be applied to lose them.

## Wear and Tear Damage

[Robot Limbs](/robot-limbs) and [Skeleton](/skeleton) characters experience **Wear and Tear damage** after being hurt, meaning that their total health is lowered for the affected body part. A character's wear damage can be tracked by hovering over the condition bar of the affected body part. However, only wear damage above 5 points will be displayed when hovering over the limb's health bar. Above 40 points the tooltip says "The manual recommends you find a Skeleton Bed for maintenance." Wear and Tear damage is fixed only through [Skeleton Repair Beds](/skeleton-repair-bed).

Wear damage is equal to 4% of the cut, pierce and blunt damage taken. Stun converted from cuts does not count. The damage is applied when hit, and is not extra damage added on. So, if a fully healed Skeleton was struck for 200 damage their health would show as 0 and once healed, would only be able to reach 192 health until they sleep in a repair bed. Only weapon hits add wear: wound degeneration, peeler machines, acid rain and fire do not. Animals (including robotic spiders) take no wear.

## Hitmult

See also: [health and hit chances for each limb by race](/damage/limb-data)

Hitmult is a per-body-part counter which causes the chance to be hit in that body part to increase by a factor of the hitmult value.

-   It starts at 1. Each hit to a body part adds 1 while it is below 4, so repeated hits stop at 4.
-   It decays by 1 every 100 seconds at normal game speed.
-   While a body part is below 0 health, hitmult is capped at 2. While it has negative health from cuts, it resets to 1.
-   Body parts below -100% health can't be hit.
-   Ranged hits ignore hitmult when picking the body part, but still raise it.

Example: if a [Hive Solder Drone](/hive-soldier-drone) is struck in the chest (which has a hit chance of 140), the new chance they will be hit in the chest becomes 280. The relative chance to be hit in the chest goes from 25% to 40%. If hit again, it becomes 50% and so on. This could be interpreted as a wounded body part becoming a higher priority target of the attacking enemies.

## KO times

The time for which a character stays unconscious differs depending on the damaged limb and the type of damage taken. The KO timer is recalculated from scratch on each hit that leaves a vital limb below 0. Base KO time is set by [Toughness](/toughness). KO time calculations can be split into two brackets:

-   Vital limb at more than 0% health
    -   Cut damage increases KO time by 0.25 \* base KO time per 1% of the limb's health lost
    -   Stun damage _**decreases**_ KO time by 0.25 \* base KO time per 1%

-   Below 0% health (i.e. more than 100% damage taken, the health bars are "empty" and start showing negative health). Any further damage to that limb adds significantly more KO time now, at a rate which depends on the limb:
    -   Head: 2.25x for cut, 1.75x for stun
    -   Chest and stomach: 1.25x for cut, 0.75x for stun
    -   Arms and legs: 0.5x for both

Missing blood also adds KO time.

## Skill penalties

Damaged limbs penalise skills, depending on the body part:

-   **Arms and torso** (best arm × most damaged of chest and stomach): strength, dexterity, labouring, engineering, smithing, farming, melee attack, martial arts and swimming.
-   **Head only**: science, robotics, cooking, field medic, turrets, perception and crossbows.
-   **Arms and head**: melee defence.
-   **Legs** reduce run speed rather than the athletics skill. There is no penalty above 55.6% leg health. Swimming speed is also reduced for each disabled arm.
-   Leg and torso damage reduce stealth.
-   Weapons skills (Katana, Sabre etc.) aren't affected by this, but note that a reduction in strength and dexterity from getting damaged reduces a character's ability to wield their weapons effectively.

## Footnotes
