---
title: "Toughness"
description: "Toughness was introduced in version 0.61.0 of Kenshi and appears to replace a stat that was previously known as \"Warrior Spirit\" (though it was never actuall…"
source:
  title: "Toughness"
  revision: 93231
categories: ["Statistics"]
---

<table class="wikitable"><tbody><tr><td>Stats Affected:</td><td rowspan="4"><span>Description:</span><br>Toughness is both physical and mental. It's how you survive out in the desert. Physically it's your ability to take a beating and survive. Mentally it's an attitude forged from harsh experience. Do you pass out from your wounds like a sissy, or do you force yourself to struggle to your feet again? Do you panic and bleed out or can you stay calm enough to lower your heart rate and let the blood clot?</td></tr><tr><td>-Damage resistance<br>-Martial arts damage<br>-Chance to resist stealth knock-outs<br>-Knockout time</td></tr><tr><td>Ways to Train:</td></tr><tr><td>-Getting hurt, getting beaten up, losing battles<br>-Not wearing armour, taking more damage<br>-Get up and fight instead of playing dead</td></tr><tr><td colspan="2"><a href="/statistics"><span>-Attributes-</span></a></td></tr></tbody></table>

  
Toughness was introduced in version 0.61.0 of Kenshi and appears to replace a [stat](/statistics) that was previously known as "Warrior Spirit" (though it was never actually implemented). Toughness determines a character's [Damage](/damage) Resistance, wound degeneration and KO point (Knock Out Point).

<details class="collapsible" open=""><summary>Racial Experience Multipliers</summary><table class="wikitable"><tbody><tr><td><span>Negative Multiplier:</span><br>There are no races which have negative experience multipliers for this stat.</td><td><span>Positive Multiplier:</span><br>-<a href="/hive-prince"><span>Hive Prince</span></a><br>-<a href="/hive-soldier-drone"><span>Hive Soldier Drone</span></a><br>-<a href="/hive-worker-drone"><span>Hive Worker Drone</span></a><br>-<a href="/shek"><span>Shek</span></a><br>-<a href="/southern-hive-soldier-drone"><span>Southern Hive Soldier Drone</span></a></td></tr><tr><td colspan="2">All multipliers are either 0.8x or 1.2x unless marked otherwise.</td></tr></tbody></table></details>

  

## **Values**

-   Damage Resistance: Starting value for a character at 0 Toughness is -65% and at level 100 is 65%. This means that each level of Toughness will increase your damage resistance by 1.3%. Until a character reaches level 50, they will take increased damage.
-   KO point: The greater the Toughness this number will grow in negative value. Current range is -10 to -85 (-85 is a character at maxed Toughness).
-   Wound Degeneration: This starts out at 1.7x at 0 Toughness and goes down to 0.03x at level 100. This is the speed at which cut damage over 20 on a bodypart "<" worsens. Certain NPCs (King, Esata, Eyegore to name a few) can spawn with over 102 Toughness leading to a negative Wound Degeneration, meaning that their injuries will actually heal on their own without the need for bandages.

## Formulas for values

-   Damage Resistance (%) = -65 + (Toughness)1.3
    -   Max of 65% DR, minimum of -65%.
-   KO point = -10 - (0.75Toughness)
    -   No min or max.
        -   Also impacts when you pass out from hunger. (100+KO Point) If you had a KO point of -50 you would randomly pass out at 50 hunger and below.
-   Wound Degeneration Speed = 1.7 - (Toughness)0.0167
    -   No min or max.

<div class="notice loading-tip"><span class="loading-tip-label">Loading screen tip:</span> If your whole squad is taken down, any survivors will play dead until the enemy is out of range. You can force them to get up anyway by giving them an order, which will also improve their Toughness stat.</div>

  

## **Improving Toughness**

The following methods are ways of improving a character's Toughness (quoted directly from In-game):

-   Getting hurt, getting beaten up, losing battles
-   Get up and fight when you should be playing dead
-   Bonuses if you are fighting critically wounded
-   Making certain (often foolish) dialogue choices
    -   "_It means starting fight with drunks, bandits, or any other usually hostile factions through dialog"_
-   Once your health drops below your KO point \[Specific to your character\] your health becomes critical and you won't be able to get back up again. You will need healing and go into a coma.

Toughness combat exp scales based on the amount of damage received relative to your toughness level, using the skill diff modifiers in the FCS. Damage that is resisted via armour or toughness itself IS still counted for this purpose, even though the damage might be nullified.

-   At 25 damage or lower than your toughness level, you will receive x0.1 the amount of exp.
-   At 10 damage over your toughness level, you will receive x2 exp. This scales up to x6 exp at 50 damage over your toughness level.
