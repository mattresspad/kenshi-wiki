---
articleId: armor-stats
title: Armor Stats
description: On individual item pages for Armour, one can find stats for each type and quality level of armor items. The stats listed may appear different than in game. T…
categories:
  - WIP
  - Modding
layout: modding
---

_**This article is a Work in Progress. It may contain out of date or incomplete information.**_

On individual item pages for [Armour](/armour), one can find stats for each type and quality level of armor items. The stats listed may appear different than in game. This is because the game displays some values incorrectly. ([Katanas](/katanas) showing as having -39% robot damage as an example)

These stats, however, are determined internally by the following formulae<sup id="cite_ref-1" class="reference"><a href="#cite_note-1"><span class="cite-bracket">[</span>1<span class="cite-bracket">]</span></a></sup>: (Important to add that items cannot have more than 90% Cut resistance or Blunt resistance. Items which would have higher than 90% (Masterwork [Samurai Helmet](/samurai-helmet) as an example) will stop at 90% Cut resistance.

Cut Resistance = (Level +/- Level Bonus) \* (Class \* Material+ Def Bonus) + (Material Bonus \* Class)

Blunt Resistance = (Level +/- Level Bonus) \* (Class \* Material+ Def Bonus) + (Material Bonus \* Class)

Harpoon Resistance = (Level +/- Level Bonus) \*Material\*armors multiplier

Athletics, combat speed, and stealth all use the same formula to calculate their bonuses ; S t a t E f f e c t \= A r m o r s M u l t i p l i e r ∗ ( ( C l a s s M a x − C l a s s M i n ) ∗ ( L e v e l ± L e v e l B o n u s 100 ) + C l a s s M i n ) ∗ . . . {\\displaystyle StatEffect = Armors Multiplier \* ((ClassMax-ClassMin)\* \\left ( \\frac{Level \\pm Level Bonus}{100} \\right ) +ClassMin)\* ...}

. . . ( ( M a t e r i a l M a x − M a t e r i a l M i n ) ∗ ( L e v e l ± L e v e l B o n u s 100 ) + M a t e r i a l M i n ) {\\displaystyle ... ((Material Max-Material Min)\*\\left ( \\frac{Level \\pm Level Bonus} {100} \\right ) +Material Min)}

Headgear does not negatively affect athletics, combat speed, or stealth. Only legwear and footwear affect athletics.

Shirts have their resistances multiplied by 0.8.

Armors multiplier of Harpoon Resistance is assigned to each armor. (It is usually 1.0)

The weight of an armour piece is dependent on its coverage amount, the slot it fills and the type of Material it is made of. The following values shown in the below table were obtained by modding items to have coverage values such as 100,000 for certain parts to check their weights then changing around the material types. Using Metal Plate to compare against the others you will find that Chainmail weighs 0.9x, Leather 0.25, and Cloth 0.1x. Comparing the Armour/Pants/Boots Slots against Head and Shirt you will find that Head Slot items weigh 1.5x and Shirt Slot items weigh 0.5x. The weight set on an armour piece is only used if an item has no coverage. As for the coverage values chest adds 50% more to the weight of an item than the other coverage parts. If an item weight does not exceed 1 kg using these values, as an example a [Holy Servant Rags](/holy-servant-rags) they will be set to 1 kg.

<table class="wikitable"><caption>Weight added per 1% coverage by material and slot</caption><tbody><tr><th></th><th>Head</th><th>Chest</th><th>Stomach</th><th>Left Arm</th><th>Right Arm</th><th>Left Leg</th><th>Right Leg</th></tr><tr><td>[Metal Plate] Head Slot</td><td>0.0625 kg</td><td>0.09375 kg</td><td>0.0625 kg</td><td>0.0625 kg</td><td>0.0625 kg</td><td>0.0625 kg</td><td>0.0625 kg</td></tr><tr><td>[Metal Plate] Armor/Pants/Boots Slot</td><td>0.05 kg</td><td>0.075 kg</td><td>0.05 kg</td><td>0.05 kg</td><td>0.05 kg</td><td>0.05 kg</td><td>0.05 kg</td></tr><tr><td>[Metal Plate] Shirt Slot</td><td>0.025 kg</td><td>0.0375 kg</td><td>0.025 kg</td><td>0.025 kg</td><td>0.025 kg</td><td>0.025 kg</td><td>0.025 kg</td></tr><tr><td>[Chain] Head Slot</td><td>0.05625 kg</td><td>0.084375 kg</td><td>0.05625 kg</td><td>0.05625 kg</td><td>0.05625 kg</td><td>0.05625 kg</td><td>0.05625 kg</td></tr><tr><td>[Chain] Armor/Pants/Boots Slot</td><td>0.045 kg</td><td>0.0675 kg</td><td>0.045 kg</td><td>0.045 kg</td><td>0.045 kg</td><td>0.045 kg</td><td>0.045 kg</td></tr><tr><td>[Chain] Shirt Slot</td><td>0.0225 kg</td><td>0.03375 kg</td><td>0.0225 kg</td><td>0.0225 kg</td><td>0.0225 kg</td><td>0.0225 kg</td><td>0.0225 kg</td></tr><tr><td>[Leather] Head Slot</td><td>0.015625 kg</td><td>0.0234375 kg</td><td>0.015625 kg</td><td>0.015625 kg</td><td>0.015625 kg</td><td>0.015625 kg</td><td>0.015625 kg</td></tr><tr><td>[Leather] Armor/Pants/Boots Slot</td><td>0.0125 kg</td><td>0.01875 kg</td><td>0.0125 kg</td><td>0.0125 kg</td><td>0.0125 kg</td><td>0.0125 kg</td><td>0.0125 kg</td></tr><tr><td>[Leather] Shirt Slot</td><td>0.00625 kg</td><td>0.009375 kg</td><td>0.00625 kg</td><td>0.00625 kg</td><td>0.00625 kg</td><td>0.00625 kg</td><td>0.00625 kg</td></tr><tr><td>[Cloth] Head Slot</td><td>0.00625 kg</td><td>0.009375 kg</td><td>0.00625 kg</td><td>0.00625 kg</td><td>0.00625 kg</td><td>0.00625 kg</td><td>0.00625 kg</td></tr><tr><td>[Cloth] Armor/Pants/Boots Slot</td><td>0.005 kg</td><td>0.0075 kg</td><td>0.005 kg</td><td>0.005 kg</td><td>0.005 kg</td><td>0.005 kg</td><td>0.005 kg</td></tr><tr><td>[Cloth] Shirt Slot</td><td>0.0025 kg</td><td>0.00375 kg</td><td>0.0025 kg</td><td>0.0025 kg</td><td>0.0025 kg</td><td>0.0025 kg</td><td>0.0025 kg</td></tr></tbody></table>

<table class="wikitable"><tbody><tr><td>Quality</td><td>Prototype</td><td>Shoddy</td><td>Standard</td><td>High</td><td>Specialist</td><td>Masterwork</td></tr><tr><td>Level</td><td>5</td><td>20</td><td>40</td><td>60</td><td>80</td><td>95</td></tr></tbody></table>

<table class="wikitable"><tbody><tr><td>Armour Class</td><td></td><td>Cloth</td><td>Light</td><td>Medium</td><td>Heavy</td></tr><tr><td>Class</td><td>(Cut Resistance)</td><td>0.4</td><td>0.8</td><td>0.9</td><td>1.0</td></tr><tr><td></td><td>(Blunt Resistance)</td><td>0.03</td><td>0.21</td><td>0.27</td><td>0.3</td></tr><tr><td>Class Stat Effects</td><td>(Athletics Min)</td><td>1</td><td>1</td><td>0.85</td><td>0.8</td></tr><tr><td></td><td>(Athletics Max)</td><td>1</td><td>1</td><td>1</td><td>0.95</td></tr><tr><td></td><td>(Combat Speed Min)</td><td>1</td><td>1</td><td>1</td><td>0.9</td></tr><tr><td></td><td>(Combat Speed Max)</td><td>1</td><td>1</td><td>1</td><td>1</td></tr><tr><td></td><td>(Stealth Min)</td><td>1</td><td>1</td><td>0.9</td><td>0</td></tr><tr><td></td><td>(Stealth Max)</td><td>1</td><td>1</td><td>0.9</td><td>0.4</td></tr></tbody></table>

<table class="wikitable"><tbody><tr><td>Material Type</td><td></td><td>Cloth</td><td>Leather</td><td>Chain</td><td>Plate</td></tr><tr><td>Material</td><td>(Cut Resistance)</td><td>0.1</td><td>0.55</td><td>0.6</td><td>0.75</td></tr><tr><td></td><td>(Blunt Resistance)</td><td>1</td><td>1.33...</td><td>1</td><td>2</td></tr><tr><td></td><td>(Harpoon Resistance)</td><td>0</td><td>0.35</td><td>0.6</td><td>0.9</td></tr><tr><td>Material Bonus</td><td>(Cut Resistance)</td><td>0</td><td>0</td><td>5</td><td>10</td></tr><tr><td></td><td>(Blunt Resistance)</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>Material Stat Effects</td><td>(Athletics Min)</td><td>1</td><td>1</td><td>1</td><td>1</td></tr><tr><td></td><td>(Athletics Max)</td><td>1</td><td>1</td><td>1</td><td>1</td></tr><tr><td></td><td>(Combat Speed Min)</td><td>1</td><td>1</td><td>1</td><td>1</td></tr><tr><td></td><td>(Combat Speed Max)</td><td>1</td><td>1</td><td>1</td><td>1</td></tr><tr><td></td><td>(Stealth Min)</td><td>1</td><td>1</td><td>0.3</td><td>0.1</td></tr><tr><td></td><td>(Stealth Max)</td><td>1</td><td>1</td><td>0.7</td><td>0.8</td></tr></tbody></table>

Each type of armour item is assigned "Level bonus", "Cut Def Bonus" and "Blunt Def Bonus", (and a parameter for Cut resistance Efficiency) thus items sharing the same "Class" and "Material Type" may have different Cut resistance and Blunt resistance.

<ol class="references"><li id="cite_note-1"><span class="mw-cite-backlink"><a href="#cite_ref-1">↑</a></span> <span class="reference-text"><a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://steamcommunity.com/app/233860/discussions/3/1752394382346346068/">Comment on Steam Forums by Shidan</a></span></li></ol>
