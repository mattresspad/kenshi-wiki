---
articleId: special-tools
title: Special Tools
description: A special tool is a prop that appears from nowhere when a character performs an action, fe. mines ore (Pickaxe) etc.
categories:
  - Modding
  - Props
  - Animation
layout: modding
---

2nd May 2021 by Cattrina

A special tool is a prop that appears from nowhere when a character performs an action, fe. mines ore (Pickaxe) etc.

The prop is not carried in the character's inventory and as such cannot be lost or sold. At this time, we have not been able to set special tools to appear 'on the journey'. They have been working only with a furniture item the character interacts with, like nodes. So, we do not know if on journey special tools are even possible. By my own toying with them the tools seem to need the mesh object's origo to spawn in correct orientation making also sure the animation played is oriented the same way. So, I would say a node/mesh object is always required.

### Making a Special Tool

Special tool is a mesh object that is **not rigged** to a character. Rigging the object to character will cause a crash in game. Instead, it follows the prop bone in the right hand of the character's skeleton. The origo of the object follows the center of the prop bone.

For easier administration, position the object in Blender so the origo is aligned with the handle, or the spot you want the character to hold it of. That way you can just align the prop bone to the center of the hand when you are making the animation. I also recommend making first a static pose so you can test the alignment and rotation of your mesh item in game. Only after you have decided the object sits in hand well, proceed to making the rest of the animation. Carefully making sure each time you rotate the hand bone, you shift click also the prop bone and move them together.

### About textures

A special tool is regarded as an item of clothing, even though you do not rig it to the armature. For this reason, the rules for making textures to clothing apply, same shininess and transparency rules.

### Special tool and animations folder

Kenshi saves special tool rotational data somewhere in the animation skeleton folder path. I do not know how or why, but if you change the location of the animations, even with correct reference link in Animation Files, the rotation of the special tool brakes. Restoring the original folder structure repairs the issue. It is strongly suggested that you use the vanilla folder path structure from the start, so you do not have to face this issue later.

Making a completely new animation file and adding that to races did not fix this issue, nor did making new functions with old special tool nor recreating it from scratch.

### Furniture Function

You can spawn a special tool if BF\_TRAINING is selected, but for cases where you need the furniture item, character pose and the tool to align, using BF\_TRAINING will not work, as the character is randomly placed around the furniture object. However, you can use BF\_CHAIR or BF\_THRONE and using the specific skill to train with special tool. You can't have a progress bar. It does not show the TRAIN as an option when selecting the item. And it does not have a training cap. Using BF\_THRONE seems to reduce the number of NPCs sitting in but not the PCs idling on the item.

BF\_MINE does use special tool, but, same as BF\_TRAINING, the character is randomly rotated around the object, so fe. lifting weights looks funny.

BF\_FLUFF does nothing.
