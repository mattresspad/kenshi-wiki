---
title: "Code mod hooks"
description: "Every hook MeitouClient offers code mods, grouped by what it touches, with a line on what each one lets a mod do."
source: original
categories: ["Modding"]
---

A MeitouClient code mod is a C# library that the client loads beside an ordinary data mod. A mod can change almost anything by patching the game's code with Harmony, which the client ships. Hooks are the places where the client offers a supported way in instead: they keep the game's simulation repeatable, let several mods use the same feature side by side, and keep working across saves.

This page lists every hook as of MeitouClient 0.21.0 (November 2026), with a line on what each one is for and the limits you're most likely to run into. To set up a mod and see examples, follow the [code-mod guide][guide]. For the exact rules of each hook, see the [modding reference][reference] in MeitouClient's repository. If you're new to Meitou mods, start at [Meitou community mods](/modding/meitou#make-a-code-mod).

## Rules to know first

- The `Add...` calls on your mod's context work only inside your mod's `Initialize`. Interface rows are added later, from your interface extension.
- Dialogue codes, record types and job types a mod claims start at 1000, and a number another mod already claimed refuses the second mod. Weather kinds use numbers from 1000 up too, but nothing checks for clashes.
- The simulation must repeat exactly. Roll random numbers with `Rng.Hash` and your mod's `RngPurpose`, never `Random`. In the parallel parts of a tick, change only the character you're stepping. Change the rest of the world only in serial steps, and never from outside the tick.
- Watchers and filters (the hooks named `I...Observer` and `I...Filter`) read the world and change only their own state. To change the game in response, they queue a command.
- Interface code runs while a tick may be in progress, so it never touches the world. It reads what it's given and queues commands.
- A hook that throws an error is usually logged and switched off for that world or session, and the game carries on. Exceptions are noted below.

## Running your own logic

| Hook | What it lets a mod do |
|---|---|
| [`AddSystem`][systems] | Run your own system every tick, at a point you choose in the game's tick: before or after a part such as combat, or at the end. A system placed before one of the game's own sources (animations, projectiles, trade, dialogue, ragdolls) replaces it. |
| [`IStateHashed`][systems] | Put your system's state into the world's state hash, so the determinism check (`meitou-tools mod-check`) can catch mistakes. |
| `IWorldReady` | Hear once when a save has loaded or a new game has placed the player's characters, before the first tick. Use it to set up again whatever isn't saved. |
| [`IModSaveData`][savedata] | Save your system's data with the game, in a file of its own inside the save folder. The game's own save files stay untouched. |
| [Commands][commands] | Queue your own commands (`Enqueue`) from the interface or a debug row, and apply them in your system. This is how outside input changes the world safely. |
| [`AddSettings`][settings] | Show options under your mod on the Settings screen's Mods page: switches, sliders and lists, kept between runs. Settings can be grouped, and hidden until a switch turns them on; a mod that uses either sets `gameVersion`, because older clients can't read them. |
| [`AddDebugCommand`][debugrows] | Add a row to the F10 debug menu. An error shows as the menu's status line. |

## Combat

| Hook | What it lets a mod do |
|---|---|
| [`ICombatHitObserver`][combat] | Hear every landed hit and execution blow after it's resolved: the damage dealt, what armor absorbed, the body part, the attacker and the victim. |
| `ICombatHitFilter` | See each melee blow, bolt and execution blow just before it lands, before armor, and change its damage or cancel it. A cancelled blow is a miss, a cancelled bolt flies on past the victim, and a cancelled execution blow does no damage. Useful for shields, non-lethal modes and other damage rules. Hits on doors and walls aren't filtered. |
| [`AddCombatHitFeed`][combat] | Get the same hits once a frame, for display only: blood, gore, hit markers. |
| `AddCombatMove` | Choose a combat animation for a character while the game isn't playing one of its own. It lands no blow, but it does move the character, so the answer must be quick, thread-safe and the same every run. The game's own swing can take over at any tick. |

## Characters and bodies

| Hook | What it lets a mod do |
|---|---|
| `AddSkill` | Add a skill to the stats window, saved with each character. Your code trains it on the game's own curve; the game's own actions never do. |
| `AddMedicalMeter` | Add a bar to the medical panel below Hunger, such as an illness or a need. It isn't saved, so your mod keeps the value and sets the bar again after a load. All mods together can add four. |
| `Stats.Modifiers` | Give a character a bonus or penalty to a stat (+10 strength, -5 dexterity) until your mod removes it. It's never trained in or saved, so set it again after a load. |
| `DrawAnchor` | Draw a character on another character's bone, such as a rider on a mount. Display only, and not saved: set it again after a load. |
| `SetBoneMesh` | Hang a rigid mesh on a character's bone, such as a saddle. Display only, not saved, and several mods can each add their own. |
| Weather kinds | Define a new kind of weather hazard in data. Weather and effect types numbered outside the game's 1 to 5 are kept, along with matching armor protection and race immunity values, and your code decides what the hazard does to characters. The game still treats it as weather: it cuts sight like any other. |

## Items and trade

| Hook | What it lets a mod do |
|---|---|
| [`AddEquipmentSlot`][slots] | Add a worn-gear slot holding one item, for items whose FCS `slot` you choose (4, 10, 11, or 15 and up), so the items themselves stay an ordinary data mod. You place it in the character window, which doesn't grow. Animals get none. |
| `AddWearRule` | Stop a race wearing an item, everywhere the item's own race lists are checked, without editing any item records. It can only refuse what those lists allow. It's asked about weapons and bags too, so a rule meant for clothing checks the item's type. An error counts as yes. |
| `AddItemUse` | Run your code when the player right-clicks an item in a character's own inventory, outside trade, such as reading a note or opening a parcel. One mod per item. `ModTag` marks a single item; a tag is saved, and items with different tags don't stack. |
| `IItemUseObserver` | Hear every item that gets used up: food eaten, first aid, crossbow shots, building materials, tools broken on locks, maps and blueprints read, machine inputs and research costs. |
| `IGoodsTakenObserver` | Hear when the player's characters take goods that aren't theirs by hand, including takes the game doesn't count as a crime, so a mod can apply its own law. Taking everything from a body at once, and money, aren't reported. |
| `ITradePriceFilter` | Adjust the prices the game asks, in the trade window and when NPCs buy from a shop: discounts, markups and so on. Undoing a trade in the open window keeps its price. |

## Dialogue and factions

| Hook | What it lets a mod do |
|---|---|
| [`AddDialogueCondition`, `AddDialogueEffect`][dialogue] | Add dialogue conditions and effects. You use their numbers in FCS dialogue data, and your code decides the answer or what happens. |
| `IRelationChangeObserver` | Hear when a faction relation changes in play, with the value before and after and the cause: a deed, a witnessed crime, a captive sold, dialogue, war declared or ended, or a debug command. |
| [`AddRecordType`][records] | Claim a record type number for your own records, and list the loaded ones. |

## The player's squads

| Hook | What it lets a mod do |
|---|---|
| `SetSquadAutonomy` | Let the AI run one of the player's squads on AI packages (`ChangeAi`, `StartContract`), with a home (`SetSquadHome`). An independent squad stays in the player's faction, but the player doesn't lead it: for staff, caravans or companions. A home in one of the player's outposts makes that outpost the squad's town. |
| `SetSquadUncounted` | Keep a squad out of the faction size limit, so characters a mod adds don't block recruiting. |
| `SetSquadPurse` | Give a squad its own money. When its members shop the way NPCs do, they pay from it, and a shop the squad owns keeps its takings. The trade window still uses the player's money. |
| `SetSquadDormant` | Put a squad to sleep, so its area can unload while the player is elsewhere. The mod decides when, and catches the squad up itself when it wakes. |
| `SpawnIntoPlayerSquad` | Make a new character from a record, the way a new game makes the player's, and add it to a player squad: settlers, children, reinforcements. |
| `JoinPlayerSquad` | Move an existing character into a player squad, as recruiting does. |
| `ModTags` | Tag the player's squads and outposts, one tag per mod, saved with them. Their ids change at every load, so a tag is how a mod finds its own again. |
| `AddJobType` | Add a job type of your own. It shows in the jobs panel and is kept in saves. Your mod carries it out through `RegisterJob`, and it runs only while the character's jobs are switched on. |
| `IDecisionOwner` | Add a behavior to how the player's characters decide what to do next (orders, jobs, goals, idling), without patching. |
| `PlayerBedRent` | Let NPCs pay to sleep in the player's indoor beds, from their squad's money. |
| `VisitTown` | Send a wandering trader's squad to a player town for a stay. |

When a mod passes its own id as `Owner` while changing a squad's settings, a save loaded without that mod puts the squad back to normal, with a notice. That way, removing the mod never strands the squad. A setting made without an `Owner` stays as it was saved.

## NPCs and the world

| Hook | What it lets a mod do |
|---|---|
| `SpawnPlatoon` | Add an NPC squad from a squad template near a point, with money. It's saved and loads like a roaming squad, and its `ModTag` finds it again after a load. |
| `RequestCampaign` | Ask for a faction campaign against a town, as a dialogue trigger does. The game's usual checks still decide whether it starts. |
| `HoldPlatoon`, `SendPlatoon` | Stop a roaming squad's travel, then send it toward a point or a character while it's off screen. Once it's loaded, your mod walks its members. The hold isn't saved: find the squad by its tag and hold it again after a load. |
| `EndContract`, `AnyRange` | End an AI contract early, or let a contract's attack reach its target anywhere on the map. |
| `Engaged` | Keep the AI off one character, so your code can drive it with the game's own actions: walking, sneaking, picking locks, pickpocketing, carrying, taking a captive to a cage, and marking it as spotted or unseen. It still defends itself when attacked. |
| `FedTo` | Keep a character's hunger at a level of your choosing, such as a captive your squad carries. Not saved. |

## Interface

| Hook | What it lets a mod do |
|---|---|
| [`AddUi`][interface] | Add your own styles, controls and actions, override the game's, and add to the HUD, including pictures from your mod's folder and character portraits. The next three hooks are registered from this same interface extension. |
| `AddCharacterMenuVerbs` | Add rows to a character's right-click menu. |
| `AddSquadAiOptions` | Add tick boxes to the squad overview's AI tab. Your mod keeps and saves what each one is set to. |
| `AddMapMarkers` | Put markers on the world map, using the game's marker images with a tint, a label and a tooltip. |
| `ArrangeFactionList` | Reorder, rename, hide or group the factions on the Faction tab. This one is called from `Initialize`, like the other `Add...` calls. |

## Working with other mods

| Hook | What it lets a mod do |
|---|---|
| [Dependencies][dependencies] | List in `meitou.json` the mods yours needs, loads after or can't run with, and the game versions it was built for. Nothing reorders the mod list: if the order is wrong, your mod is refused with a message saying what to move. A mod can use another mod's code directly (`Dependency<T>`), so a shared framework loads only once. `IModDependents` tells a framework when a mod built on it fails to start. |
| [Harmony][harmony] | Patch the game's code for anything no hook covers. The client loads one copy of Harmony and gives it to every mod. |

A mod's system can also join two of the game's open lists that the modding reference doesn't cover yet: `ITaskOwner`, which registers how a task is acted out and can replace the game's own, and `IGoalSource`, which tells the game's work finders what your characters are already working on so they don't take it too.

Data mods can also swap game files and add sound banks through `RE_Kenshi.json` without any code. MeitouClient reads its `FileRebinds` (map files, the map's color tiles and anything found through the game's resource folders) and `SoundBanks` entries, but never runs RE_Kenshi plugins. To bring an RE_Kenshi mod over, see [Does my RE_Kenshi mod need a port?](/modding/meitou/porting-re-kenshi-mods)

[guide]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods
[reference]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[systems]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#simulation-systems
[savedata]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#save-data
[commands]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#commands
[settings]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#settings
[debugrows]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#debug-menu-rows
[combat]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#combat-hits
[slots]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#equipment-slots
[dialogue]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#dialogue-conditions-and-effects
[records]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#your-own-record-types
[interface]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#interface
[dependencies]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#depending-on-another-mod
[harmony]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#harmony
