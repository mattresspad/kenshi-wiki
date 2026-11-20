---
articleId: how-to-make-a-three-person-conversation-including-player
title: How to make a three person conversation including player
description: You can make a dialogue between three persons, including a player character.
categories:
  - Dialogue
  - Modding
layout: modding
---

You can make a dialogue between three persons, including a player character.

For this to function, you need a host character, that does not take part in the conversation, but the player clicks on. They have the first line(s), but the moment you change the speaker they cannot talk again. They cannot be added as an interjector.

You can then alternate between interjectors and the player. You cannot have interjectors to talk each other; you need a player input after each interjector line. You could put something like \[continue listening\] for the player line. I would also recommend an option to exit the conversation.

All affects (like da join squad fast) apply to the host.

I noticed this works best if you have the interjectors as specific characters, because if you do not use 'is character' it is possible someone else to be triggered instead.

And, of course, the entire chain breaks if there is no NPC to interject.


This article is part of the [Dialogue Structure Overlook](/dialogue-structure-overlook) guide.
