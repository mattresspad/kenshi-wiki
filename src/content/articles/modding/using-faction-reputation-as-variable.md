---
articleId: using-faction-reputation-as-variable
title: Using Faction Reputation As Variable
description: "Cattrina's note on resetting to 0: you may have to make an elaborate check dialogue where it reads the reputation, and if the reputation is above 1000, subtr…"
categories:
  - Modding
  - Dialogue
  - Guides
  - Quest
layout: modding
---

## Using Faction Reputation as variable storage

By Soar

### Limitations

1.  Only T\_ME can use DA\_AFFECT\_REPUTATION to modify the reputation _of the player, towards their **own**_ _faction_. Cannot check or alter other faction relations.
2.  Values are lost if you restart or import the game. Saving & Loading does not affect it.
3.  Maximum amount we can affect it by in one line is 100.000 (Both positive and negative)
4.  Maximum amount we can evaluate against is 1.000.000 (Both positive and negative)
5.  Maximum amount stored can go above these, it is not clamped nor does it overflow.
6.  Can be evaluated/used as condition on T\_TARGET dialogue line, but _not_ affected. Can be changed only on T\_Me line.
7.  No easy way to reset back to 0 (unless you instruct the player to restart their game, and they listen, which they won't.)

Cattrina's note on resetting to 0: you may have to make an elaborate check dialogue where it reads the reputation, and if the reputation is above 1000, subtract 1000 and when value drops below 1000 subtract 100 and last when under 100 subtract one, and after each loop back to line 1 to run the test again.

### Advantages

1.  Any changes to these values are completely hidden from the player, we can silently keep track of certain values.
2.  Whilst we cannot directly fetch the amount our reputation is currently at, checking for what it is, along with some smart use of score bonus can give us a lot of control in using this for progression within something.
3.  Applies to one faction only, so you can make progression of relations inside one people, which does not affect global values. Make a one person faction and you can make a romantic partner, or a nemesis. Or track a quest line (although you might wanna save important stages in a world state).

### Things to note

Operators seem slightly bugged.

\> and = BOTH purely evaluate ">=". They are functionally identical, which one you use is up to personal preference. < works completely fine and as expected.

This means that if we want to check whether T\_TARGET Reputation = 5, we need to do the following:

T\_TARGET DC\_REPUTATION < 5
AND
T\_TARGET DC\_REPUTATION \> 5
OR
T\_TARGET DC\_REPUTATION \= 5



Using DA\_AFFECT\_REPUTATION, we can use positive values to increase, or negative values to decrease the total. Once again keeping in mind this can only be done on T\_ME dialogue line.

We _can_ affect the reputation for the player faction, by putting DA\_AFFECT\_REPUTATION in a dialogue that is used by a player character, however due to interactive dialogue always being owned by the NPC, we have to handle this through other EV\_ such as EV\_I\_SEE\_NEUTRAL\_SQUAD or such.

### Sample

Whilst I haven't yet thought of many use-cases for this technique, I have applied it to my currently WIP mod.

The issue was:

I have 10 world states that need to be evaluated against one another and seen which 'side' has been picked more often.

1.  We start off by checking whether the world state "Sample Value" = 1. If so, we DA\_AFFECT\_REPUTATION 1.
2.  If the world state is not 1, we go to the line seen at 2. where we check for Sample Value 0, and if so, DA\_AFFECT\_REPUTATION -1.
3.  Do this for every value, and at the end we will end up with a value that is either >0 or <0 (because we have an uneven amount).
4.  If you have an even amount, you need to decide whether you want to make a tie default to positive or negative, or how to handle it.
5.  Remember you can check for 0 by combining < 1 with > or = 0.



1.  This is the line we're currently viewing, this would also be the line where the rest of your dialogue goes that requires Positive > Negative.
2.  We check for T\_ME DC\_REPUTATION > 1
3.  If you recall, > _actually_ means >=, so if we want to know its 1 or above, and not 0, we need to check > 1 (or = 1).
4.  Don't forget to reference all your \_lines by **SHIFT + dragging** them so that all of them will be possible to reach and evaluate, otherwise outside of a very specific input, you will never reach your evaluating value.






_**Remember that if you do not reset the value back to 0 through any method, you cannot use this faction's reputation as a tracker again unless you can guarantee the player has restarted their game.**_
