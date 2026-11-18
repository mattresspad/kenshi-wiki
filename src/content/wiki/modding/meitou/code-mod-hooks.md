---
title: "Code mod hooks"
description: "Every hook MeitouClient offers code mods, grouped by what it touches, with a line on what each one lets a mod do."
source: original
categories: ["Modding"]
---

A MeitouClient code mod is a C# library that the client loads beside an ordinary data mod. A mod can change almost anything by patching the game's code with Harmony, which the client ships. Hooks are the places where the client offers a supported way in instead: they keep the game's simulation repeatable, let several mods use the same feature side by side, and keep working across saves.

This page lists every hook in MeitouClient 0.22.1 (November 2026), plus the hooks merged since then, which are marked *(next release)* until a release carries them. Each gets a line on what it's for and the limits you're most likely to run into. To set up a mod and see examples, follow the [code-mod guide][guide]. For the exact rules of each hook, see the [modding reference][reference] in MeitouClient's repository. If you're new to Meitou mods, start at [Meitou community mods](/modding/meitou#make-a-code-mod).

You don't need a game install to build a code mod. From the next release on, every release publishes a `Meitou.References` package on NuGet, versioned like the game. A mod's project references that package and nothing else. Its publicized set also lets a mod reach the game's internal code, which can change between any two releases. [How to use it][refpack]

## Rules to know first

- The `Add...` calls on your mod's context work only inside your mod's `Initialize`. Interface rows are added later, from your interface extension.
- Don't change game records in `Initialize`: by then much is already built from them. Change them in the data phase (below).
- Dialogue codes, record types, job types and NPC goal types a mod claims start at 1000, and a number another mod already claimed refuses the second mod. One mod may use the same number as both its job type and its goal type. Weather kinds use numbers from 1000 up too, but nothing checks for clashes.
- Names that every mod shares, such as carry modifier keys, status effect ids and weapon class names, should start with your mod's id (`mymod.whip`), so two mods never pick the same one.
- A character's id changes at every load. Keep data about a character under its lasting id (below), never under its ordinary id.
- The simulation must repeat exactly. Roll random numbers with `Rng.Hash` and your mod's `RngPurpose`, never `Random`. In the parallel parts of a tick, change only the character you're stepping. Change the rest of the world only in serial steps, and never from outside the tick.
- Watchers and filters (the hooks named `I...Observer` and `I...Filter`) read the world and change only their own state. To change the game in response, they queue a command.
- Interface code runs while a tick may be in progress, so it never touches the world. It reads what it's given and queues commands.
- A hook that throws an error is usually logged and switched off for that world or session, and the game carries on. A system that throws stops on its own, and the player gets a notice. Exceptions are noted below.

## Running your own logic

| Hook | What it lets a mod do |
|---|---|
| [`IModDataPhase`][dataphase] | Add, change or remove game records in code while the data loads, before anything is built from them, the way a `.mod` file would. Your changes merge in mod-list order, after every data file. A mod that throws here is left out, and changes it already merged stay for the session. *(next release)* |
| [`AddSystem`][systems] | Run your own system every tick, at a point you choose in the game's tick: before or after a part such as combat, or at the end. A system placed before one of the game's own sources (animations, projectiles, trade, dialogue, ragdolls) replaces it. |
| [`IStateHashed`][systems] | Put your system's state into the world's state hash, so the determinism check (`meitou-tools mod-check`) can catch mistakes. |
| `IWorldReady` | Hear once when a save has loaded or a new game has placed the player's characters, before the first tick. Use it to set up again whatever isn't saved. |
| [`IModSaveData`][savedata] | Save your system's data with the game, in a file of its own inside the save folder. The game's own save files stay untouched. |
| [Commands][commands] | Queue your own commands (`Enqueue`) from the interface or a debug row, and apply them in your system. This is how outside input changes the world safely. Each mod's command types are its own: another mod's system sees them only if the two share them through a dependency. |
| [`AddSettings`][settings] | Show options under your mod on the Settings screen's Mods page: switches, sliders and lists, kept between runs. Settings can be grouped, and hidden until a switch turns them on; a mod that uses either sets `gameVersion`, because older clients can't read them. Your code can also change a setting itself, such as a window's position, and it's kept the same way. *(next release, for setting it from code)* |
| [`AddDebugCommand`][debugrows] | Add a row to the F10 debug menu. An error shows as the menu's status line. |

## Combat

| Hook | What it lets a mod do |
|---|---|
| [`ICombatHitObserver`][combat] | Hear every landed hit and execution blow after it's resolved: the damage dealt, what armor absorbed, the body part, the attacker and the victim. |
| `ICombatHitFilter` | See each melee blow, bolt and execution blow just before it lands, before armor, and change its damage or cancel it. A cancelled blow is a miss, a cancelled bolt flies on past the victim, and a cancelled execution blow does no damage. Useful for shields, non-lethal modes and other damage rules. Hits on doors and walls aren't filtered. |
| [`AddCombatHitFeed`][combat] | Get the same hits once a frame, for display only: blood, gore, hit markers. |
| `AddCombatMove` | Choose a combat animation for a character while the game isn't playing one of its own. It lands no blow, but it does move the character, so the answer must be quick, thread-safe and the same every run. The game's own swing can take over at any tick. |
| [Weapon skills][weapons] (`meitou skill`) | Give a weapon a skill your mod added with `AddSkill`. The weapon then uses and trains that skill wherever a weapon uses its own class's skill: damage, which attacks it can use, and the HUD's Current Skill line. Its attacks and stance still follow its ordinary class. It's a data field, so the original game ignores it. *(next release)* |
| [Weapon classes][weapons] (`meitou class`) | Make a new weapon class with attacks, blocks and dodges of its own, with no code at all: name the class on its weapons and its combat techniques. A class needs attacks with reach to match the unarmed ones, or its wielders mix in kicks and punches; one with no blocks or dodges of its own never blocks or dodges. *(next release)* |
| [Ammunition][ammo] (`meitou ammo`) | Let a crossbow or gun load several kinds of ammunition, in the order it prefers them, and give each kind its own damage, bleeding, range and speed, plus its own mesh in flight. Data only. The player can't pick a kind except by what the character carries. *(next release)* |

## Characters and bodies

| Hook | What it lets a mod do |
|---|---|
| `AddSkill` | Add a skill to the stats window, saved with each character. Your code trains it on the game's own curve, and fighting with a weapon that names it trains it too. |
| [`IExperienceFilter`][experience] | Scale or cancel any experience the game gives, by character, squad, faction, skill or what earned it (combat, sneaking, building, first aid and so on). It runs on many threads at once, so it must be quick and only read. Skills added by mods aren't filtered. *(next release)* |
| [`ICharacterDeathObserver`][deaths] | Hear every death once: the cause, where it happened (a blow, a bolt, an execution, being eaten, the rack and so on), and the killer if there was one, including whole squads wiped out off screen. *(next release)* |
| [`AddStatusEffect`][effects] | Add a named effect with a timer, such as a poison, a drug or a blessing, that changes a character's stats while it lasts. It can refresh, extend or stack when applied again, shows on the HUD's State line and its tooltip, and is saved with the character. An effect whose mod is gone is kept, frozen, until removed. *(next release)* |
| [`CarryModifiers`][carry] | Change how much a character can carry, by a fraction or by kilograms, without touching strength: for a race trait or a frame pack. Every carry readout uses it. Not saved: set it again after a load. *(next release)* |
| `AddMedicalMeter` | Add a bar to the medical panel below Hunger, such as an illness or a need. It isn't saved, so your mod keeps the value and sets the bar again after a load. All mods together can add four. |
| `Stats.Modifiers` | Give a character a bonus or penalty to a stat (+10 strength, -5 dexterity) until your mod removes it. It's never trained in or saved, so set it again after a load. |
| [Lasting ids][lasting] | Give a character an id that stays with it for life, across saves, squad changes, recruiting and capture, so a mod can keep data about it. Every mod shares the same id. *(next release)* |
| [Task bars][taskbars] (`ModTaskBar`) | Show the floating progress bar the game draws over someone picking a lock, with your own caption and fill, over any character. Display only, and not saved. |
| `DrawAnchor` | Draw a character on another character's bone, such as a rider on a mount. Display only, and not saved: set it again after a load. |
| `SetBoneMesh` | Hang a rigid mesh on a character's bone, such as a saddle. Display only, not saved, and several mods can each add their own. |
| Weather kinds | Define a new kind of weather hazard in data. Weather and effect types numbered outside the game's 1 to 5 are kept, along with matching armor protection and race immunity values, and your code decides what the hazard does to characters. The game still treats it as weather: it cuts sight like any other. |
| [Body shapes][bodies] | Give a race more or fewer body parts, or new kinds of part such as a tail, in data alone. The medical panel scrolls when a body has more parts than it has rows. *(next release)* |

## Items and trade

| Hook | What it lets a mod do |
|---|---|
| [`AddEquipmentSlot`][slots] | Add a worn-gear slot holding one item, for items whose FCS `slot` you choose (4, 10, 11, or 15 and up), so the items themselves stay an ordinary data mod. You place it in the character window, which doesn't grow. Animals get none. |
| `AddWearRule` | Stop a race wearing an item, everywhere the item's own race lists are checked, without editing any item records. It can only refuse what those lists allow. It's asked about weapons and bags too, so a rule meant for clothing checks the item's type. An error counts as yes. |
| `AddItemUse` | Run your code when the player right-clicks an item in a character's own inventory, outside trade, such as reading a note or opening a parcel. One mod per item. `ModTag` marks a single item; a tag is saved, and items with different tags don't stack. |
| `IItemUseObserver` | Hear every item that gets used up: food eaten, first aid, crossbow shots, building materials, tools broken on locks, maps and blueprints read, machine inputs and research costs. |
| `IGoodsTakenObserver` | Hear when the player's characters take goods that aren't theirs by hand, including takes the game doesn't count as a crime, so a mod can apply its own law. Taking everything from a body at once, and money, aren't reported. |
| `ITradePriceFilter` | Adjust the prices the game asks, in the trade window and when NPCs buy from a shop: discounts, markups and so on. Undoing a trade in the open window keeps its price. |

## Dialogue, crime and factions

| Hook | What it lets a mod do |
|---|---|
| [`AddDialogueCondition`, `AddDialogueEffect`][dialogue] | Add dialogue conditions and effects. You use their numbers in FCS dialogue data, and your code decides the answer or what happens. |
| [`AddWorldState`][worldstates] | Take over one of the world states that dialogue, squad spawns, town takeovers and faction campaigns check, and switch it on or off from code. The game's own story states can be claimed too. Be careful: whatever the game decides while your value is set (a town replaced, a squad spawned, a campaign started) stays in the save after your mod is removed. *(next release)* |
| [`ICrimeObserver`][crimes] | Hear every change to crimes and bounties: a crime committed, the first witness, a bounty booked, a crime lapsing, a bounty expiring or being paid off. *(next release)* |
| `IRelationChangeObserver` | Hear when a faction relation changes in play, with the value before and after and the cause: a deed, a witnessed crime, a captive sold, dialogue, war declared or ended, or a debug command. |
| [`AddRecordType`][records] | Claim a record type number for your own records, and list the loaded ones. |

## The player's squads

| Hook | What it lets a mod do |
|---|---|
| `SetSquadAutonomy` | Let the AI run one of the player's squads on AI packages (`ChangeAi`, `StartContract`), with a home (`SetSquadHome`). An independent squad stays in the player's faction, but the player doesn't lead it: for staff, caravans or companions. A home in one of the player's outposts makes that outpost the squad's town. Its right-click menu has no inventory row, but your mod can add one that opens the member's inventory (`OpenLootOrder`), for handing out uniforms. |
| [`SetSquadShop`][shops] | Turn an independent squad of the player's faction, with its own purse, into shopkeepers the player trades with in the ordinary trade window. The shop uses the squad's own money, never the player's, and its stock comes from a trader's squad template or from your mod. NPC shoppers don't buy from it. *(next release)* |
| `SetSquadUncounted` | Keep a squad out of the faction size limit, so characters a mod adds don't block recruiting. |
| `SetSquadPurse` | Give a squad its own money. When its members shop the way NPCs do, they pay from it, and a shop the squad owns keeps its takings. The trade window still uses the player's money, except with a squad's own shop. |
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
| [NPC goals][npcgoals] (`AddGoalType`, `INpcGoalOwner`) | Add a goal that NPCs weigh in the AI's own chooser beside their other goals, wherever their AI package lists it. Your code says how much each character wants it and starts the work when it wins. A fight still takes over, and without your mod the goal is never chosen. *(next release)* |
| [Duties][duties] | Give NPCs work your mod hands out itself rather than through the chooser: the AI package lists a goal of your own number, and your code finds who has it now and walks them. *(next release)* |
| [`ITaskOwner`][tasks] | Decide what happens when a character starts, finishes or stops a task row of your own, or replace how one of the game's own tasks is acted out. |
| [`IGoalSource`][claims] | Tell the game's work finders what your characters are already working on (a body to loot, a patient, a site), so their squad mates don't take it too. |
| `SpawnPlatoon` | Add an NPC squad from a squad template near a point, with money. It's saved and loads like a roaming squad, and its `ModTag` finds it again after a load. |
| `RequestCampaign` | Ask for a faction campaign against a town, as a dialogue trigger does. The game's usual checks still decide whether it starts. |
| `HoldPlatoon`, `SendPlatoon` | Stop a roaming squad's travel, then send it toward a point or a character while it's off screen. From the next release, while a held squad is loaded, its members stop following their AI package and only fight, so your mod can walk them. The hold isn't saved: find the squad by its tag and hold it again after a load. |
| `EndContract`, `AnyRange` | End an AI contract early, or let a contract's attack reach its target anywhere on the map. |
| `Engaged` | Keep the AI off one character, so your code can drive it with the game's own actions: walking, sneaking, picking locks, pickpocketing, carrying, taking a captive to a cage, and marking it as spotted or unseen. It still defends itself when attacked. Dialogue, trading, arrests and other game systems use the same switch, so take only characters the AI holds now, and clear only what your mod set. |
| `FedTo` | Keep a character's hunger at a level of your choosing, such as a captive your squad carries. Not saved. |

## Interface and sound

| Hook | What it lets a mod do |
|---|---|
| [`AddUi`][interface] | Add your own styles, controls and actions, override the game's, and add to the HUD, including pictures from your mod's folder and character portraits. The next four hooks are registered from this same interface extension. |
| `AddCharacterMenuVerbs` | Add rows to a character's right-click menu. |
| `AddSquadAiOptions` | Add tick boxes to the squad overview's AI tab. Your mod keeps and saves what each one is set to. |
| `AddMapMarkers` | Put markers on the world map, with a tint, a label and a tooltip, using the game's marker images or a picture of your own from your mod's folder. |
| [`AddBuildingActions`][buildingbuttons] | Add buttons to the panel of a selected building, placed piece or piece of furniture, after the game's own lines. The panel has room for about six lines, so keep to one or two. *(next release)* |
| [`AddKeyAction`][keys] | Add an action the player binds to a key on the Controls page, like the game's own, with a default key of your choosing. A default never takes a key the player already uses. *(next release)* |
| [`PostSound`][sounds] | Play any sound event the loaded sound banks hold, the game's or your mod's own, on a character, at a point in the world, or on the interface. *(next release)* |
| `ArrangeFactionList` | Reorder, rename, hide or group the factions on the Faction tab. This one is called from `Initialize`, like the other `Add...` calls. |

## Working with other mods

| Hook | What it lets a mod do |
|---|---|
| [Dependencies][dependencies] | List in `meitou.json` the mods yours needs, loads after or can't run with, and the game versions it was built for. Nothing reorders the mod list: if the order is wrong, your mod is refused with a message saying what to move. A mod can use another mod's code directly (`Dependency<T>`), so a shared framework loads only once. `IModDependents` tells a framework when a mod built on it fails to start. |
| [Harmony][harmony] | Patch the game's code for anything no hook covers. The client loads one copy of Harmony and gives it to every mod. |

A data mod that reshapes the whole game, such as a conversion, should edit the [records the engine looks up by id or name][fixedids] in place rather than removing or renaming them. That list says what each one is for, and what happens without it.

Data mods can also swap game files and add sound banks through `RE_Kenshi.json` without any code. MeitouClient reads its `SoundBanks` and its `FileRebinds`, which swap the map files, the map's color tiles and files found through the game's resource groups. From the next release, a rebind also reaches meshes, skeletons, textures, icons, interface layouts and collision files, and can hide a file. MeitouClient never runs RE_Kenshi plugins. Instead, a plugin gets ported as a code mod of its own on the Steam Workshop, and the launcher offers to subscribe to the ports Meitou endorses. To bring an RE_Kenshi mod over, see [Does my RE_Kenshi mod need a port?](/modding/meitou/porting-re-kenshi-mods)

[guide]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods
[reference]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[refpack]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#reference-package
[dataphase]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#data-phase
[fixedids]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#fixed-record-ids
[systems]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#simulation-systems
[savedata]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#save-data
[commands]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#commands
[settings]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#settings
[debugrows]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#debug-menu-rows
[combat]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#combat-hits
[weapons]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[ammo]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[experience]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[deaths]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[effects]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[carry]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[lasting]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[taskbars]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[bodies]: https://github.com/VlcekM/MeitouClient/blob/master/docs/game/character-stats.md#bodies-of-other-shapes-meitou
[slots]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#equipment-slots
[dialogue]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#dialogue-conditions-and-effects
[worldstates]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[crimes]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[records]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#your-own-record-types
[shops]: https://github.com/VlcekM/MeitouClient/blob/master/docs/simulation.md#shopkeepers-of-the-players-faction-meitou-only
[npcgoals]: https://github.com/VlcekM/MeitouClient/blob/master/docs/simulation.md#mod-goals
[duties]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[tasks]: https://github.com/VlcekM/MeitouClient/blob/master/docs/simulation.md#task-starts
[claims]: https://github.com/VlcekM/MeitouClient/blob/master/docs/game/ai-tasks.md#perma-jobs
[interface]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#interface
[buildingbuttons]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[keys]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[sounds]: https://github.com/VlcekM/MeitouClient/blob/master/docs/modding.md#registration-surface
[dependencies]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#depending-on-another-mod
[harmony]: https://github.com/VlcekM/MeitouClient/wiki/Writing-code-mods#harmony
