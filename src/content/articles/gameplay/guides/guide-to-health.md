---
articleId: guide-to-health
title: Guide to Health
description: Combat is a part of Kenshi gameplay which should be highly anticipated. However, there is more to remaining healthy in Kenshi than just bandaging wounds. Thi…
categories:
  - Guides
layout: gameplay
---

Combat is a part of Kenshi gameplay which should be highly anticipated. However, there is more to remaining healthy in Kenshi than just bandaging wounds. This **Guide to Health** should help newer users learn all information regarding Hunger, Healing, Splints, and Limb Replacement.

## Beds

Healing is slow, and it is recommended that characters rest in a [Bed](/bed) (8x Heal speed) or a [Camp Bed](/camp-bed) (4x Heal speed) if they are injured. Beds and Camp Beds can be rented at [Bars](/bar) and occasionally used for free at some locations. Camp Beds can easily be carried by characters and built in buildings or in the wilderness in order to rest.

While sleeping in a Bed or Camp Bed, the hunger meter will decrease at 0.33x the normal rate. On top of that wounds will not degrade while sleeping, this is even the case for Skeletons. However, any unbandaged/unrepaired health will not heal no matter how long you wait.

## Hunger

Over time, characters get hungry. When a character's hunger meter goes below 250, that character will eat whatever [Food](/food) has the lowest nutrition value in their inventory. A character will only eat a maximum of 50 nutrition at one time. If a character's hunger drops below 200, they will start to suffer from malnutrition, and their stats will begin to be negatively affected. If their hunger meter continues to drop below 100, they will begin to pass out regularly from hunger. This fainting will become more and more frequent as their hunger meter steadily declines. Eventually, the character will die from starvation. The hunger point at which you begin to faint is 100 - (KO Point). Your KO point can be found by checking your Toughness in a characters stat page or by expanding the UI at the bottom left side of the screen.

Each race has a modifier for rate of hunger. Skeletons do not need to eat and, therefore, their hunger rate is 0.

<table class="wikitable"><tbody><tr><th colspan="3"><a href="/hive">Hive</a></th><th colspan="2"><a href="/human">Human</a></th><th colspan="2">Skeleton</th><th rowspan="2"><a href="/shek">Shek</a></th></tr><tr><th>Prince</th><th>Soldier</th><th>Worker</th><th>Greenlander</th><th>Scorchlander</th><th><a href="/p4-unit">P4 Unit</a></th><th><a href="/skeleton">Skeleton</a></th></tr><tr><td align="right">0.50x</td><td align="right">0.60x</td><td align="right">0.50x</td><td align="right">1.00x</td><td align="right">0.90x</td><td align="right">0x</td><td align="right">0x</td><td align="right">1.25x</td></tr></tbody></table>

Characters outside the player's faction are fed by the game itself. Whenever one of them has nothing left to digest and its hunger is below a set floor, the game gives it free food up to that floor, a little at a time. For most NPCs the floor is 300, the top of the meter, so they never get hungry and never need to carry food. Characters which are enslaved are kept fed to 100, which results in major stat drainage from malnutrition. Squads whose template is marked malnourished get a random floor between 100 and 220, which is why they can show malnutrition. Prisoners not held by the player get a lower floor, 115 or 200 depending on their state. Animals are kept fed the same way only when the game's "animals eat" option is off. The player's own characters, and prisoners the player holds, get no free food and can starve.

### Nutrition

Every edible food item has a clearly labeled Nutrition amount. If characters have multiple of these items spread out among them, they can be consolidated by moving them into the same inventory (only works if they are not stolen items).

All races and beasts will cease all hunger depletion whilst eating. If a character has 300nu of food in their inventory and starts eating at 0, they will have 300 Hunger by the time all the food is eaten. Presuming, hypothetically, one should have lost 30 hunger during that time if they weren't eating, that 30 simply never happened. If food is scarce and work must be done or heavy loads carried, it is best to combine these activities with eating. Wait until your character is at least 200 before starting to eat. Doing so will eliminate normal, encumbrance and working hunger rate when it should be at its worst.

More complicated food items have the most Nutrition values, such as [Foodcubes](/foodcube), [Gohan](/gohan), and [Ration Packs](/ration-pack).

### Sharing Food

If working with many characters, it can be time consuming and tedious to add food to each individual inventory. By purchasing a stacking [Backpack](/backpacks) and filling it with as many food items as possible, the need for distributing food is mitigated. All Player Characters in the same squad who are nearby the character wearing the backpack filled with food will eat food out of it if their hunger is low enough to trigger eating. If the player wants to avoid the negative stats of wearing a backpack, they can easily remove the backpack from the backpack slot and regularly put it on for a second in order to feed all characters at once or use a [Small Thieves Backpack](/small-thieves-backpack). This technique will only work if all characters are in the same squad. To feed members of another squad a character with the backpack full of food should also exist in another squad.

Domesticated Animal player characters will also eat out of another player character's backpack, provided they are a part of the same squad. Characters can also eat food from a livestock backpack which can be worn on [Domesticated Bulls](/domesticated-bull) and [Pack Beasts](/pack-beast). More about animal player characters can be found on [Guide to Animals](/guide-to-animals).

## Healing

Characters of all non-animal races will need to be bandaged/repaired if they take cutting [Damage](/damage) during fights. Characters will need the corresponding [Medical Item](/medical-items) for their race. The other type of damage is stun. It is received from blunt damage, or from armour mitigating cut damage into stun through cut resist and cut efficiency. This damage appears as lost limb health, and regenerates without the need of a bandage.

The [Field Medic](/field-medic) skill governs the speed of bandaging and how many charges you consume when using your medical supplies, while the [Robotics](/robotics) skill governs the same but for robots/using robotic supplies. This is dependent on the level of the first aid kit in use. Kits which are in a character's inventory will be used before ones in a backpack. Kits which have the least charges left will be used first (like how the person eats lower quality food first). Using lower quality kits will allow a character to level more while healing well as it limits the speed of the medic or roboticist. Higher level skilled people will not only bandage/repair faster, but they will also bandage/repair more with the same kit as they use less charges.

### Bleeding and Triage

All characters have blood, although for Skeletons this is called "Oil." The blood is the top line on the health pane. If you see arrows (<) over a character's blood, then they are bleeding. The more arrows the more severe the bleeding. The amount of blood lost over time greatly increases as you accumulate more bleeding. As losing a limb causes around 6-30 instant blood loss no matter the bleed rate, Hivers (50 Blood) are extremely vulnerable to being KOed from blood loss. Clotting occurs naturally after taking damage, as you only bleed at the maximum rate for a few seconds. Death from blood loss occurs when reaching below your maximum blood value as a negative. Examples are a Hiver reaching -50.0001 blood, Skeleton reaching -100.0001 Oil, etc... The difficulty settings in the game settings determine if a natural limb is removed if they reach -100% of their maximum health. If your game setting for limb loss is set to frequent, then any natural limb which goes below -100% will instantly pop off. By default, this value is set to rare, which requires an actual attack to remove the limb when below -100% health.

When a character has received at least 20% of their maximum health in cut damage on a part of their body it begins to degenerate. When you receive 20 or more cut damage an "<" will appear. If your maximum health is over 100 seeing this arrow does not always indicated the injury is worsening. The wound will degenerate based off the amount of cut damage in total on the part along with character's Toughness level. If you have over 100% of your total health as cut damage you will see, "<<" and the wound will worsen at a MUCH faster rate. The speed appears to be x4 as fast as 90% of your total health as cut damage. People die when those body parts reach below -100% so it is very important to bandage cuts to avoid succumbing to your wounds.

A character will get knocked out when their vital (Head, Chest or Stomach) body parts drop below 0 from damage in combat and will enter a recovery coma when an injury goes under their KO Point (KO Point = 10+([Toughness](/toughness))0.75). The coma ends when their vital health rises above 0. If a unit's blood level drops below 0, they will also be knocked out. After being knocked out by reaching 0 blood, you will only be knocked out again through bloodloss/bleeding upon reaching -25 blood. If an animal attempts to eat a unit who is knocked out from bloodloss (But not below -25 blood) they will be able to get back up instantly. It's recommended to quickly sneak and bandage yourself up if this occurs as most animals will flee if their meal turns out to still be alive.

Races respond to bleeding damage at a different rate. Weapons have their own Bloodloss values. For instance, a [Nodachi](/nodachi) has a Bloodloss of 1.2x which means it will deal 20% more bloodloss/bleeding than a 1.0 Bloodloss weapon. Hivers and skeletons have low bleedrates and as such are quite resistant to the bloodloss applied from weapons.

<table class="wikitable"><tbody><tr><th colspan="3"><a href="/hive">Hive</a></th><th colspan="2"><a href="/human">Human</a></th><th colspan="2">Skeleton</th><th rowspan="2"><a href="/shek">Shek</a></th></tr><tr><th>Prince</th><th>Soldier</th><th>Worker</th><th>Greenlander</th><th>Scorchlander</th><th><a href="/p4-unit">P4 Unit</a></th><th><a href="/skeleton">Skeleton</a></th></tr><tr><td align="right">0.3x</td><td align="right">0.3x</td><td align="right">0.3x</td><td align="right">1.0x</td><td align="right">0.9x</td><td align="right">0.1x</td><td align="right">0.1x</td><td align="right">0.9x</td></tr></tbody></table>

You will not regenerate blood until you stop bleeding. You recover blood twice as fast when resting in any type of bed.

### Bandaging Cuts

Cut damage on humanoid characters never heals by itself, unless using mods which add self-healing to the race. Some characters can spawn with above the max level of Toughness achievable by the player (Such as Esata/Eyegore) which results in their wounds never degenerating and instead healing as their Degeneration rate is in the negatives. However, without a bandage their injuries will never heal the last 20% cut damage.

In order to bandage cuts, non-robotic characters must use a [First Aid Kit](/first-aid-kit). These items are easily found across Kenshi as many non-player characters will be holding a Basic First Aid Kit, and they are often stocked in stores. Characters can use a First Aid Kit while it is in their inventory or inside the backpack they are wearing. A character will use whichever (Still follows the same lower quality kits first rule) kit is first in their inventory, followed by backpack. When applying first aid a unit's wounds will be bandaged from top to bottom. (Blood/Oil>Head>Chest/Stomach(Whichever is first, they sometimes flip)>Stomach/Chest>Left Arm>Right Arm>Left Leg>Right Leg)

There are a few methods for healing player characters. The first is to right click on the wounded character. The mouse tooltip will become a green plus (+) symbol when a hurt character is moused over. The wounded character can heal themselves as long as they have not become unconscious from their wounds. First Aid is also an option in the right-click-hold menu for that character and selecting that will also trigger the same action.

The second method is to click the Medic button in the [User Interface](/guide-to-ui-and-controls). This will command the currently selected character(s) to heal any other player characters immediately nearby. When this button is shift-clicked, the job of Medic is assigned to the selected character(s). This job can get your characters into trouble when they have allies nearby to heal, as characters will leave the "playing dead" stance, to perform that job. If alone a character may bandage/repair themselves whilst playing dead. You can also hotkey the Medic command in your settings.

\*(Due to a bug Skeletons usually will not repair themselves when playing dead. To trigger it you will need to issue a repair command while still unconscious or save the game while unconscious as a Skeleton if Robotics is assigned as a job and then load. By doing so the Skeleton will repair themselves once they begin to play dead)

The third method is to lay down in a Skeleton Repair Bed which actually bandages you at a speed of around 1 health every 0.345 in game minutes.

### Repairing Robotics

When [Skeletons](/skeleton) or units with [Robot Limbs](/robot-limbs) take cutting damage it must also be repaired to heal just like organic health. In order to conduct repairs, characters must be holding a [Skeleton Repair Kit or Authentic Skeleton Repair Kit](/medical-items). These items are primarily found in stores but can also be found through looting many Skeleton non-player characters or [Ancient Labs](/ancient-labs). Characters can use a Repair Kit while it is in their inventory or inside the backpack they are wearing. You may also use a Skeleton Repair Bed to repair cut injuries. If you wish to assign Robotics as a goal/job as an organic race make sure to have the Repair Kit in your inventory and not in a bag, then shift + right click medic at the bottom right. After assigning it as a goal/job you can put the Repair Kits in your bag like normal.

The methods for repairing [Skeleton](/skeleton) characters and Robot Limbs are the same as the methods for First Aid, except the name for the action is Repairs in the right-click-hold menu.

Robotic health which is repaired (cut damage) will heal at 250x the normal rate. (So 250xhealrate)

Whenever a robotic body part receives damage the maximum health of that part is reduced by 4% of the damage received. This is called wear damage and can only be removed with a [Skeleton Repair Bed](/skeleton-repair-bed). If a character is a non-skeleton, their non-robotic body parts will be bandaged at a high rate while sleeping on a Repair Bed as well.

## Splints

Splints are a near instant way to rig up to 51 hit (26 for small splints) points, on a unit's limbs when below 47.5 HP. A splint cannot be used to go above 50 effective HP, even if you have not used the full 50 points of splint value, it will stop at 50 HP if it gets there. The [small splint kit](/splint-kit) only rigs up to 26 HP, if the Field medic skill of the player is also at least 25. You won't be able to see the effect of a splint if the character's health is too far into the negative.

Putting Splinting in the jobs list is particularly useful. Character with splinted legs can often run at close to full speed, and splints on limbs can prevent limb loss as splinting adds to the hit points of the limb.

Hive Workers and Hive Princes are the only races that can run at full speed with splints. Running at full speed requires 55.6% leg health, and Hive Workers and Hive Princes can achieve this number due to having lower max HP on their legs. The 50 HP splint cap is more than 55% of their max HP, allowing them to run their normal speed.

## Limb Replacement

If a character's limb is hit beyond a negative value equivalent to their normal max health, it will be amputated. Amputated limbs will require a robotic replacement in order to function normally when fighting or, if a leg is lost, when doing almost anything. Robotic limbs require repairing in the same way as a [Skeleton](/skeleton)'s body does. They also suffer wear and tear damage which can only be healed through use of a [Skeleton Repair Bed](/skeleton-repair-bed).

[Robot Limbs](/robot-limbs) can be purchased in a [Robotics Shop](/robotics-shop), a [Robotics Workshop](/robotics-workshop), a [Travel and Repairs Shop](/travel-and-repairs-shop), and a [Hive Robotics Shop](/hive-robotics-shop) or found in locations as [Artifacts](/artifacts). Always make sure that you are purchasing the correct limb, as the icon designs for (right) and (left) limbs are not distinctly different. Robot Limbs are equipment, not trade goods, so they can be sold for 0.5x of their value.

In order to equip a Robot Limb, you need to first click the Limbs button found in your amputee character's inventory. After opening the Limbs inventory, you can click and drag the limb to its correct slot or simply right click it from your character's inventory. Characters which are not amputees will not allow you to make use of this button for obvious reasons.

## Extra tips

-   There is an exploit to heal [robotic limbs](/robot-limbs) to full health, wear damage and all. If you remove your damaged robotics limbs and place them into your inventory/bag, save and then load the that save they will be fully healed.
    -   This works because the game does not keep track of the health of the limb itself but your character's health. By removing the limb and saving the game does not keep track of the current health of the limb you removed thus healing it fully.
-   When you lose a limb, you receive a rather large amount steady bleeding (Bleeding that does not go away unless the limb itself is bandaged) for each point of unbandaged cut damage under 0 health. By putting a robotic limb in its place you can cut down on a LOT of the blood lost. (You can even remove it right after)
-   Rarely when a Skeleton loses a limb the game can bug and they will continue to lose oil at a very slow rate even when repaired to full. If this bug occurs you will either need to find a replacement limb or lay down in a Skeleton Repair Bed to fix it. (Or edit your health using FCS but this can be a bit complicated for anyone without modding experience)
