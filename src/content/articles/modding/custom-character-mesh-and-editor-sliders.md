---
articleId: custom-character-mesh-and-editor-sliders
title: Custom character mesh and editor sliders
description: Bored having every character ingame looking alike? Tried editing their face in Blender, only to realize all the editor sliders on the game start from jaw up…
categories:
  - Modding
  - Character mesh
  - Sliders
  - Editor data
layout: modding
---

Bored having every character ingame looking alike? Tried editing their face in Blender, only to realize all the editor sliders on the game start from jaw up have vanished?

This is because all the shape keys for the face are missing. I recommend this video [https://www.youtube.com/watch?v=ypRhJAfJXAc&t=539s](https://www.youtube.com/watch?v=ypRhJAfJXAc&t=539s) for instructions how to add the missing keys. Timestamp: 8:59

### Basic how to

In Object data properties (triangle) under shape keys, click the +. The first click makes the current setup a base (basis). So the mesh in its current form becomes what everything else is compared to. Each click on + gives a new key to add extremes.

1.  click + to add a new key
2.  name the key using the exact case sensitive name you have in the editor data xml file
3.  move the shape key value to 1.000 (regardless if this is a low extreme or high extreme)
4.  edit the character mesh to the extreme form for that shape key. Ie. if you edited eye height, move the eyes up to the highest you want them.
5.  move the slider back to 0
6.  repeat for every slider

And when you export the character, remember to tag shape keys along with tangents, binormals, animation and skeleton



### Slider names

For the names of the keys look into the editor data xml file. You can add your own, just make sure the mesh has the same key names you put in your editor limits xml. You can also just leave any keys out from the xml, if you do not need them.

Vanilla has sometimes two extremes compared to the base, so you too can make two keys for sliders if you need.

Vanilla slider key names for the face (body sliders are bone relative):

**narrow\_cheekbones** **wide\_cheekbones**

**big\_mouth**

**wide\_mouth**

**wide\_nose**

**long\_nose**

**arch\_nose**

**high\_nose**

**tiltdown\_nose tiltup\_nose**

**low\_brow** **high\_brow**

**tiltup\_brow tiltdown\_brow**

**shallow\_eyes**

**narrow\_eyes close\_eyes**

**tiltdown\_eyes tiltup\_eyes**

**high\_eyes big\_eyes**

**underbite overbite**
