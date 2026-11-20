---
articleId: why-load-order-matters-and-other-faq-about-using-mods
title: Why load order matters and other FAQ about using mods
description: Kenshi can only be modded by using the Forgotten Construction set, which contains several hundred values and files from the game. It does not contain everyth…
categories:
  - Guides
layout: modding
---

### Why load order matters?

#### **The primary issue**

Kenshi can only be modded by using the Forgotten Construction set, which contains several hundred values and files from the game. It does not contain everything though, so some things remain outside the mod maker's reach, like editing character inventory size.

This means naturally, being only limited number of values to change, there is a possibility two mods affect the same values. And only one mod at a time can affect one value at a time. fe. katana reach; mod A can make it a 100 but if mod B makes it 20, it will be 20 as B is loaded later.

So, primary issue: **if two mods edit the same (fe. vanilla) value, then the mod loaded AFTER, will override the value above it.**

Consider this: I have subscribed to six 'more names' mods on workshop. The game only takes one name list. How many name mods should I keep? Answer: one. Either one of the six, or you need a patch that fuses all six into one.

### Mod Terminology

#### **Safe mods**

Mods, that only add new content and do not touch a single vanilla value, are safe to be loaded anywhere in the load order (if a mod edits a value of another mod, then these are called **patches**, see below). This does not make them safe as in no bugs or corrupted files (any digital value can get corrupter it just is nature's law), but they are safe in the meaning they won't be overriding your other mods.

#### Addition/ Child mods

These are not patches, IF they only **build upon** someone else's mod, to add content to that mod, but do not CHANGE anything about the original mod. These require the original mod to function. They must be loaded after their parent mod.

#### Collection / Package mods

These are different from mod collections. A collection mod is one single mod, that contains several other mods inside it. These are usually huge overhaul mods (like Genesis, Project Kathun or UWE) and do not necessarily play well with other mods. Safe mods may be fine, but it is recommended to take caution when adding mods on top of a Collection mod. Collection mods usually function best if loaded **the very last**, just before the 256 recruitment limit. But, if you wanted to play with all those mods in a Collection mod, you best bet is to use the Collection mod, as those are play tested and patched to work on the go.

#### Mod collections/Mod lists

Mod list is usually the mods.cfg file in your installation folder, that saves your mods and their load order. You can edit it with a notepad. Just copy and paste to change order. A Mod collection is a list of mods someone has curated on Steam workshop and deemed to function together. Just do not trust that blindly. If the mod collection does not come with a pre-made mod list or load order, you need to order them yourself, manually. They **never come working as is** in the alphabetical order Steam puts them in.

#### **Patches**

Patches are usually made to fix an error on someone else's mod. Or just to fuse two mods together, avoiding the primary issue. Meaning a patch selects the best value of the two mods or edits the value so both mods work. Patches need to be loaded after all mods it affects.

### How to avoid loading order issues?

-   **Know what you are subscribing to**, do not sub to every mod on a mod list without checking if there is a loading order suggested. Steam puts all mod list in alphabetical order and loading them in that order is a bad idea at best, at worst you cannot launch the game.
-   When evaluating whether you should sub or not, **do not be afraid to err!** Fixing it is just a disabling away. You cannot destroy your base game with mods. No, really you cannot.
-   **If you sub to a mod, always sub to its prerequisite mods too.** Some mod makers forget to mention prerequisite mods on the Steam page. This is often due a language barrier. Be kind.

[Click here to see the community load order guide](https://steamcommunity.com/sharedfiles/filedetails/?id=1850250979)
