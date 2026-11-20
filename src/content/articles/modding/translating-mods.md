---
articleId: translating-mods
title: Translating Mods
description: Translation mods are the only mod type that warrants taking a copy of the original mod. Otherwise translating will become even mightier task, when you cannot…
categories:
  - Modding Guide
  - Modding
layout: modding
---

WIP

## How to make a translation mod

Translation mods are the only mod type that warrants taking a copy of the original mod. Otherwise translating will become even mightier task, when you cannot tell what text is vanilla game and what is new text the mod to be translated adds when every text is black.

However, you must remember to remove all IP from the mod contents and FCS files. Leave only the actual mod and rename the mod file. Delete the info and the img files too. And naturally you mark the original mod as a dependency in Steam Workshop.

All item and armor files are fine to have a link to the original mod, just make sure you do not accidentally click on the link, if you do FCS will not allow you to pass along a link to another mod.

Then you just open the changed list (top on FCS) and type in the search 'dialogue\_line' translate everything that is green or blue.

## A very handy 3rd party tool

I recently was shown this handy dandy translation helper tool. [https://kenshi-test.seesaa.net/article/500377546.html](https://kenshi-test.seesaa.net/article/500377546.html) Both the page and the tool are in Japanese, but fret not; Firefox and Chrome at least offer automatically to translate the page for you. The tool itself opens from the green ->->Please click here<-<- link top middle of the first page. And it can also be auto-translated by the browser. The tool works simply this way:

1.  Select what things you want to translate.
2.  Drag and drop your mod file (yes the actual .mod) on to the area marked with red dotted line.
3.  Click the CVS option and the system will generate a table from the contents in CVS format, which you can translate using what method you want.  


## How to be able to see special characters such as accents and tremas

For your mod's end user you either need to give them instructions how to do this manually or set up Re\_Kenshi to do this for them.

This information is from the user Naeki and is especially about French, but will probably also work with other languages, however you might have to manually add new code ranges if your language has more special characters than French does.



_"Yes, a friend and I noticed there was an error in the official game translation, accented characters weren’t taken into account, whereas the game’s internal engine actually does support them._

_The fix was to add every time that ASCII code was used._ So, you need to replace the contents of the kenshi\_fonts.xml file located in Kenshi/locale/fr\_FR/gui/fonts with:"

<?xml version="1.0" encoding="UTF-8"?>
<MyGUI type="Resource" version="1.1"\>
	<Resource type="ResourceTrueTypeFont" name="Kenshi\_StandardFont\_Small"\>
		<Property key="Source" value="Exo2-SemiBold.ttf"/>
		<Property key="Size" value="14"/>
		<Property key="Hinting" value="use\_native"/>
		<Property key="Resolution" value="50"/>
		<Property key="Antialias" value="false"/>
		<Property key="TabWidth" value="4"/>
		<Property key="OffsetHeight" value="0"/>
		<Property key="SubstituteCode" value="0"/>
		<Property key="Distance" value="2"/>
		<Codes>
			<Code range="32 255"/>
			<Code range="338 339"/>
			<Code range="8217 8217"/>
		</Codes>
	</Resource>
	<Resource type="ResourceTrueTypeFont" name="Kenshi\_StandardFont\_MediumSmall"\>
		<Property key="Source" value="Exo2-SemiBold.ttf"/>
		<Property key="Size" value="16"/>
		<Property key="Hinting" value="use\_native"/>
		<Property key="Resolution" value="50"/>
		<Property key="Antialias" value="false"/>
		<Property key="TabWidth" value="4"/>
		<Property key="OffsetHeight" value="0"/>
		<Property key="SubstituteCode" value="0"/>
		<Property key="Distance" value="2"/>
		<Codes>
			<Code range="32 255"/>
			<Code range="338 339"/>
			<Code range="8217 8217"/>
		</Codes>
	</Resource>
	<Resource type="ResourceTrueTypeFont" name="Kenshi\_StandardFont\_Medium"\>
		<Property key="Source" value="Exo2-SemiBold.ttf"/>
		<Property key="Size" value="20"/>
		<Property key="Hinting" value="use\_native"/>
		<Property key="Resolution" value="50"/>
		<Property key="Antialias" value="false"/>
		<Property key="TabWidth" value="4"/>
		<Property key="OffsetHeight" value="0"/>
		<Property key="SubstituteCode" value="0"/>
		<Property key="Distance" value="2"/>
		<Codes>
			<Code range="32 255"/>
			<Code range="338 339"/>
			<Code range="8217 8217"/>
		</Codes>
	</Resource>
	<Resource type="ResourceTrueTypeFont" name="Kenshi\_StandardFont\_Large"\>
		<Property key="Source" value="Exo2-SemiBold.ttf"/>
		<Property key="Size" value="24"/>
		<Property key="Hinting" value="use\_native"/>
		<Property key="Resolution" value="50"/>
		<Property key="Antialias" value="false"/>
		<Property key="TabWidth" value="4"/>
		<Property key="OffsetHeight" value="0"/>
		<Property key="SubstituteCode" value="0"/>
		<Property key="Distance" value="2"/>
		<Codes>
			<Code range="32 255"/>
			<Code range="338 339"/>
			<Code range="8217 8217"/>
		</Codes>
	</Resource>
	<Resource type="ResourceTrueTypeFont" name="Kenshi\_PaintedTextFont\_Small"\>
		<Property key="Source" value="Sentencia\_1.ttf"/>
		<Property key="Size" value="20"/>
		<Property key="Hinting" value="use\_native"/>
		<Property key="Resolution" value="50"/>
		<Property key="Antialias" value="false"/>
		<Property key="TabWidth" value="4"/>
		<Property key="OffsetHeight" value="0"/>
		<Property key="SubstituteCode" value="0"/>
		<Property key="Distance" value="2"/>
		<Codes>
			<Code range="32 255"/>
			<Code range="338 339"/>
			<Code range="8217 8217"/>
		</Codes>
	</Resource>
	<Resource type="ResourceTrueTypeFont" name="Kenshi\_PaintedTextFont\_Medium"\>
		<Property key="Source" value="Sentencia\_1.ttf"/>
		<Property key="Size" value="25"/>
		<Property key="Hinting" value="use\_native"/>
		<Property key="Resolution" value="50"/>
		<Property key="Antialias" value="false"/>
		<Property key="TabWidth" value="4"/>
		<Property key="OffsetHeight" value="0"/>
		<Property key="SubstituteCode" value="0"/>
		<Property key="Distance" value="2"/>
		<Codes>
			<Code range="32 255"/>
			<Code range="338 339"/>
			<Code range="8217 8217"/>
		</Codes>
	</Resource>
	<Resource type="ResourceTrueTypeFont" name="Kenshi\_PaintedTextFont\_Large"\>
		<Property key="Source" value="Sentencia\_1.ttf"/>
		<Property key="Size" value="28"/>
		<Property key="Hinting" value="use\_native"/>
		<Property key="Resolution" value="50"/>
		<Property key="Antialias" value="false"/>
		<Property key="TabWidth" value="4"/>
		<Property key="OffsetHeight" value="0"/>
		<Property key="SubstituteCode" value="0"/>
		<Property key="Distance" value="2"/>
		<Codes>
			<Code range="32 255"/>
			<Code range="338 339"/>
			<Code range="8217 8217"/>
		</Codes>
	</Resource>
	<Resource type="ResourceTrueTypeFont" name="Kenshi\_BannerTextFont"\>
		<Property key="Source" value="MailartRubberstamp-Regular.ttf"/>
		<Property key="Size" value="150"/>
		<Property key="Hinting" value="use\_native"/>
		<Property key="Resolution" value="50"/>
		<Property key="Antialias" value="false"/>
		<Property key="TabWidth" value="4"/>
		<Property key="OffsetHeight" value="0"/>
		<Property key="SubstituteCode" value="0"/>
		<Property key="Distance" value="2"/>
		<Codes>
			<Code range="32 255"/>
			<Code range="338 339"/>
			<Code range="8217 8217"/>
		</Codes>
	</Resource>
	<Resource type="ResourceTrueTypeFont" name="Kenshi\_FloaterFont\_Small"\>
		<Property key="Source" value="Exo2-SemiBold.ttf"/>
		<Property key="Size" value="20"/>
		<Property key="Hinting" value="use\_native"/>
		<Property key="Resolution" value="50"/>
		<Property key="Antialias" value="false"/>
		<Property key="TabWidth" value="4"/>
		<Property key="OffsetHeight" value="0"/>
		<Property key="SubstituteCode" value="0"/>
		<Property key="Distance" value="2"/>
		<Codes>
			<Code range="32 255"/>
			<Code range="338 339"/>
			<Code range="8217 8217"/>
		</Codes>
	</Resource>
	<Resource type="ResourceTrueTypeFont" name="Kenshi\_FloaterFont\_Medium"\>
		<Property key="Source" value="Exo2-SemiBold.ttf"/>
		<Property key="Size" value="22"/>
		<Property key="Hinting" value="use\_native"/>
		<Property key="Resolution" value="50"/>
		<Property key="Antialias" value="false"/>
		<Property key="TabWidth" value="4"/>
		<Property key="OffsetHeight" value="0"/>
		<Property key="SubstituteCode" value="0"/>
		<Property key="Distance" value="2"/>
		<Codes>
			<Code range="32 255"/>
			<Code range="338 339"/>
			<Code range="8217 8217"/>
		</Codes>
	</Resource>
	<Resource type="ResourceTrueTypeFont" name="Kenshi\_FloaterFont\_Large"\>
		<Property key="Source" value="Exo2-SemiBold.ttf"/>
		<Property key="Size" value="24"/>
		<Property key="Hinting" value="use\_native"/>
		<Property key="Resolution" value="50"/>
		<Property key="Antialias" value="false"/>
		<Property key="TabWidth" value="4"/>
		<Property key="OffsetHeight" value="0"/>
		<Property key="SubstituteCode" value="0"/>
		<Property key="Distance" value="2"/>
		<Codes>
			<Code range="32 255"/>
			<Code range="338 339"/>
			<Code range="8217 8217"/>
		</Codes>
	</Resource>
	<Resource type="ResourceTrueTypeFont" name="Kenshi\_UI\_Messages"\>
		<Property key="Source" value="MailartRubberstamp-Regular.ttf"/>
		<Property key="Size" value="110"/>
		<Property key="Hinting" value="use\_native"/>
		<Property key="Resolution" value="50"/>
		<Property key="Antialias" value="false"/>
		<Property key="TabWidth" value="4"/>
		<Property key="OffsetHeight" value="0"/>
		<Property key="SubstituteCode" value="0"/>
		<Property key="Distance" value="2"/>
		<Codes>
			<Code range="32 255"/>
			<Code range="338 339"/>
			<Code range="8217 8217"/>
		</Codes>
	</Resource>
</MyGUI>
