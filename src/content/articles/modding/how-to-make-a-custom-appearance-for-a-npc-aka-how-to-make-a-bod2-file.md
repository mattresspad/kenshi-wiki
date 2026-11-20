---
articleId: how-to-make-a-custom-appearance-for-a-npc-aka-how-to-make-a-bod2-file
title: How to make a custom appearance for a NPC aka how to make a bod2 file
description: You want to make a unique non-player character (NPC) and you want to make sure they also look unique, but making a special race just for that character feels…
categories:
  - Modding Guide
  - Modding
layout: modding
---

You want to make a unique non-player character (NPC) and you want to make sure they also look unique, but making a special race just for that character feels too much. No worries, bod2 file is for you!

Kenshi's game allows saving a custom character settings straight from the character editor. You might have noticed **the export option** when customizing a character's looks. That's it, that is the bod2 file. The choices you make for the character, the skin color, hairstyle, body and face sliders, they are all saved in the bod2 file, under the name you set for the character in the name field.

By default the exported bod2 files are saved in the ..\\Kenshi\\data\\character\\bodies\\export -folder. That is fine and dandy, if you are making a custom appearance for just you. But if you want your mod subscriber to also be able to use the custom body, you need to **take a copy of it and paste the copy inside your actual mod**.

I recommend setting vanilla like folder path for it (make a character folder and inside it a bodies folder).

### Pointers when making a custom bod2 file for a mod you are going to publish:

-   make sure you only use races and hairstyles the mod subber **will also have access to**, aka only vanilla or items included with your mod (or its declared dependency). If you pick items from another mod, that mod will become a dependency to your mod (or the bod2 file is unusable).
-   export the bod2 file with descriptive name, without spaces or non-English characters (the character's name is the exported bod2 file's name)
-   do not edit the bod2 file's name in windows explorer, it might be fine, or you might corrupt it
-   you cannot edit a bod2 file, but you can import it, re-edit and then re-export with a new name (or the same name if you delete the old one)
-   remember to change the link, if you change the name!
-   misnamed, missing or corrupted bod2 file is not a problem, the game will just randomize the appearance. Yes entirely. Even if one item (like a hairdo) is missing, the entire bod2 file becomes unusable.
-   for some reason **face textures are not saved in the bod2 or platoon files,** meaning the face is always randomized from the race options.
