---
articleId: making-a-food-mod-nutrition-value
title: Making a Food mod, nutrition value
description: "It is very simple: it is the charges of the item."
categories:
  - Nutrition
  - Modding Guide
  - Modding
layout: modding
---

## How is the food nutrition value determined?

It is very simple: it is the charges of the item.

Do note, there is a global multiplier of 0.5 that effectively makes all food item nut half of the charges value.

Also, you cannot see the nutrition value correctly when you spawn the items directly to inventory. That is pure randomization by the game engine, rolling each time how many nu is left of the max charges.

## How is food value determined?

Food price/value is calculated by the value of its ingredients.

Do note, each time a new game begins the global prices get randomized.

Fe. Food ingredients are in %, so 800 means 8. So, if your food takes 8 cactus (1 cat) and one riceweed (2 cats) to make, the item will then cost 10 cats. Adjusted by the quality of the item.
