---
title: "How to make buildings snap together fe ramps to walls"
description: "WIP\nThere are two ways to make building items snap to each other:  using nodes or using origo alignment. Do note the third similar method is linking (or chai…"
source:
  title: "How to make buildings snap together fe ramps to walls"
  revision: 95956
categories: ["WIP","Modding Guide","Modding"]
---

WIP There are two ways to make building items snap to each other: using nodes or using origo alignment. Do note the third similar method is linking (or chaining) and that is used with draggable walls. This document focuses on the two snapping options.

HINT: Blender units DO correspond to light node distance from parent object origo. A small square is 10 units and a big square is 100. So fe. your house is 800 units long in Kenshi, it will be 80 big squares long in Blender. Do note, putting the light node at both ends of the house in Kenshi, would be 400 units from origo. So -400 and +400 respectively.

## Snapping with nodes (light node, turret node)

This type is used when you want to allow **several different non-pathway objects** to snap to **several different specific locations**, like exterior lamps or harpoon turrets. You need to use this system **if you need the later added item to maintain its own function** (again lights and turrets will not work on furniture\*).

Using these requires the house file to have nodes (Instances). We can only add new instances on to a brand new building, so you either need to start your project by duplicating a house with nodes already in the file OR you you have to make a brand new building. You cannot add more nodes on duplicated buildings. DO NOTE: light nodes and turret nodes are different. Light nodes usually exist in the main file of the building, turret nodes however must go to the level 0 exterior mesh file.

Using nodes allows you to create several spots where items can snap to. The object to be snapped will snap its origo to the node. So you need to make sure the object is oriented so it makes sense when snapped to the building. Usually this involves moving the origo so it is no longer in the center of the object, or the item would sink to the wall mid way. You can **snap ANY BUILDING to** Node Light Mount, they do not need to be lights.

Now relocating the nodes is a hassle and half. There are no tools in game to see any grid or anything that would help you to a) know which node is which and b) to which direction the node needs to be moved. So moving the nodes to the locations you want is a major PITA. You can only see the nodes when you are in building mode in game on the LIGHTING section. And you need to hold a spotlight on your mouse too. Then you can see the blue nodes.

You cannot do anything to the nodes in game, you can only type their new coordinates in FCS, and then you need to relaunch the game to see if it moved where you wanted it to. LUCKILY the Kenshi unit distance DOES correspond to Blender squares. 1 small square = 10 units in Kenshi and 1 big square = 100 units, so you can rez a small cube in Blender and move that in object mode to where you want to set the light node to, and then convert the Blender units to Kenshi units by multiplying it by 10 and just typing the values in. DO NOTE the Z and Y axis are different, so you have to remember to swap those when you type the values in FCS.

Y AXIS IS UP AND DOWN

This guide helps you to understand the rotation system, all nodes use it: [User Node rotations, quarternions](/user-node-rotations-quarternions). Luckily all vanilla house nodes are rotated in the way that makes sense, so if you maintain their respectful location to the house, you do not need to rotate them. BUT if your new house is 90 degrees rotated on the z axis compared to the vanilla house, you would have to rotate ALL NODES 90 degrees Euler, but you cannot use Euler.... Tip: make your house to have the same orientation as vanilla houses.

There is an quartenion option for rotation in Blender. It should work if you just change the decimal point to a comma. But the issue with that is AGAIN the z and Y being swapped, so you would have to rotate the source item 90 degrees euler first... I have made a rotation tool object you can rez in Blender. See [Quarternion Adjusted Rotation Pointer Object mod on Steam.](https://steamcommunity.com/sharedfiles/filedetails/?id=3793509349)

  

\*We can make light nodes to furniture, but we cannot attach furniture to furniture using light node snapping. Only Snaps to works for furniture.

## Snapping with Origo Alignment (snaps to)

This type is used when you want to allow different walkable pathways like stairs or ramps to snap to the walkway. Or you want to make a many sitter bench.

This needs to be taken into account from the start when making the actual meshes of the buildings, as you need to make sure all their origos and in the same exact 3D space in Blender. When set to snap to a main object, the game will auto-align the two origos in the game space.

Caveats; you can have only a main object and side objects. You cannot snap more items to a side object. BUT you can snap how many items to the main object you want. You just have to mind the mesh object's SIZE and ORIENTATION, both in game and in Blender.

Snapping origos is way easier for the modder, because no need to play with nodes. What you see in Blender, is what you get in the game.

### Step by step

1.  Finish your main mesh. Let's call it a platform. You want access it on all four sides with staircases or ramps.
2.  Add a new mesh, make sure it spawns at the same location as the platform's origo.
3.  In edit mode, move the mesh to one side of the platform, making sure the origo does not move.
4.  Finish building the first stairs. You can orient them to the platform how you want.
5.  Make a collision for the stairs. Note most often a ramp is best form for the stairs collision.
    -   Make sure there is no gap between the platform collision and the stairs collision and no additional steps, the tops/walk surface need to align you might use a lip to transfer the character over.
    -   Collision origo needs to ALSO be at the same 3D spot the mesh objects origos are
    -   Use collision shape mesh when you export it.
6.  In FCS make the stairs file snap to to the platform file. (No snap to in the platform file, only stairs snap to).
7.  Test in game, the game should automatically snap the stairs in place when you offer the stairs to the already built platform.
8.  When happy, you can copy both the mesh and the collision and rotate them together 90 degrees on axis z. You need to turn the collision physics properties off for this operation.

Collision and rigid body, collision shape mesh. Export as Kenshi xml, selection (not all children)

## How to make a multiple sitter bench

You need to know how to make mesh and collisions to move away from their origo. You also need to know how to make animations.

1.  Create your bench, couch etc. so it naturally divides in as many seats you want it to have. I usually make and texture the item first and then just cut it to chunks.
2.  Select one part and promote it to its own object by hitting P. This will automatically make the object to lay in the correct location in regards to the origo. Repeat for all parts.
3.  Make a separate collision for each section. Make sure none of them overlap. They can be smaller. But overlap is a no no.
4.  Make a separate furniture file for each section in the FCS. Make the central section the root. Call it something distinctive so the player knows this piece is put down first. Then set all the other sections to snap to to the middle part.

1.  Each section needs a separate sitting animation.
2.  Make the middle one first, as it is closest to the origo. Play with it and test it in world so you get it to sit correctly.
3.  Then you select every other bone except the Bip01 and move them so they sit on the next seat and save it as a separate animation strip.
4.  Repeat for all sections.
5.  If you want to you can now edit each one slightly to make them diverse, if you want to.
6.  Export one skeleton for each gender, each containing as many sitting poses you have seats.
7.  Set each animation in a separate function, one per each section furniture item in FCS.

## Glossary

<details class="collapsible" open=""><summary>Show table</summary><table class="wikitable sortable"><tbody><tr><td>Origo</td><td>Origo is the little yellow dot you see in Blender. All mesh objects have one. The location of an origo is usually in the middle of the object, but it can be 'moved' by moving the mesh around it in edit mode. Remember to export the object without Transforms.</td></tr><tr><td>Draggable wall</td><td>A draggable wall refers to the exterior defensive walls a player can build around their base. Being draggable means the player can use their mouse to draw the wall on the terrain and the game engine calculates the best type of wall segment to use to fill the drawn route. Linking type on the wall segment files tells the engine what role this mesh item serves, be it a short segment, a connector segment, a wedge segment etc. so the computer can proficiently fill the length what the player drew with segments properly, in hopes there are no gaps.</td></tr></tbody></table></details>
