---
articleId: making-a-character-with-glowing-eyes-or-body
title: Making a character with glowing eyes or body
description: A head mask should not have any transparency added to it. You should also be very careful with the size of the mask and the compression chosen, because if it…
categories:
  - Modding Guide
  - Modding
  - Custom character
  - Mask
layout: modding
---

## How to make a proper head mask

A head mask should **not** have any transparency added to it. You should also be very careful with the size of the mask and the compression chosen, because if it gets too pixelated you can cause artifacts on the character's face. Use BC1/DXT1 or BC3/DXT5 and do not make the mask too small. 1024x1024 pixels is perfectly fine. You should probably not go under 512x512. Well, naturally if your mask is all magenta, go for 128x128 but any details added you are safer with a 512 or 1024. The opposite is also true, do not make the mask too big either.

It's also important to note: dds is a compressed packed file type. It is far better to make your own mask than edit a mask someone else made, **because you are accumulating pixelating errors** if you repack once packed file. Especially if the original mask is of a small size. Now with dds this issue is not as bad as it is with jpg, but you will definitely see all the pixelation on the character's face, if you get them. And yeah, the artifacts can also appear as 3D protrusions.

Remember, the mipmaps are smaller, more pixelated versions of the main image. So if your image is originally small, the mipmaps will be even smaller and even more pixelated.

### Colors:

-   Magenta <255,0,255> = all the parts you want to have the skin color wash added
-   Black <0,0,0> = all the parts you do not want any skin color wash
-   Dark Magenta colors between <0,0,0> - <255,0,255>, partial skin color wash
-   White <255,255,255>, Green <0,255,0>, Yellow <255,255,0> and any variations between <0,0,0> and <255,255,255> = glowing bits (the key being any value on green channel)
-   Blue <0,0,255> not really used on head mask as is.

## Glowing Eyes

Vanilla Scorchlanders have slightly glowing eyes. This is achieved by color green over their eyes in the head mask texture. Also colors white, grey and yellow show glowing on the head texture. Mixing in black will dilute the glow brightness. But as you see on the grey-scale you need to put quite a lot black in to see a difference. So maybe it just is the darkness of the color that does the diluting and not necessarily the amount of black.













Testing different colors gave this result.



## Glowing Body/The Body Mask

### Colors:

-   White <255,255,255> = skin color wash
-   Black <0,0,0> = no color wash
-   Any value between black and white = partial color wash

Unfortunately, there is no glow color for the body, so if you need glowing parts on the character body, you have to move all the mesh UVs you want to glow to the head texture location, aka moving the UVs to UDIM one up.

Do note, if you move the entire body UVs up, you will mess up the part map and thus also all the blood splatters the game paints on the character. Meaning the character cannot have its parts invisible under clothing and no blood splatter on its skin. It also makes it impossible for the character to wear shirts. But, I would say if you have small glowing bits like buttons or LEDs it probably won't matter much if you can see them through clothing.
