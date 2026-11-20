---
articleId: collision-in-context-of-furniture-with-animations
title: Collision in context of furniture with animations
description: Why is my character yeeted upwards when standing up?
categories:
  - Collision
  - Props
  - Animation
  - Furniture
  - Modding
layout: modding
---

_**Why is my character yeeted upwards when standing up?**_

Kenshi does not like overlapping collisions or overlapping meshes. The yeeting happens when the two collisions expel each other.

**How to fix**

When you make the animation, make sure the Bip01 bone stays at center, but move all the other bones to the side. Make the mesh object to match the offset.

When you make the collision for the mesh object, move the origo to match the offset (result: animation and mesh origoes at center and mesh collision origo to the side), This way the collision origo and the animation origo do not overlap at animation end (when character is clicked to stand up) and the character will not be yeeted upwards.

See my youtube tutorial [Kenshi Furniture Tutorial: Custom Collision](https://www.youtube.com/watch?v=ng0qJcjKbco)
