# F3 Devlog

 by CMPM 121 - Group 33
- Jalen Suwa
- Brian Chung
- Dylan Boyer
- Jonathan Cheng
- Marvel McDowell

# How we satisfied the software requirements

## [F0.a]

**Requirements**: You control a character moving over a 2D grid.

No major changes reported

## [F0.b]

**Requirements**: You advance time manually in the turn-based simulation.

No major changes reported

## [F0.c]

**Requirements**: You can reap or sow plants on grid cells only when you are near them.

No major changes reported

## [F0.d]

**Requirements**: Grid cells have sun and water levels. The incoming sun and water for each cell are somehow randomly generated each turn. Sun energy cannot be stored in a cell (it is used immediately or lost) while water moisture can be slowly accumulated over several turns.

No major changes reported

## [F0.e]

**Requirements**: Each plant on the grid has a distinct type (e.g. one of 3 species) and a growth level (e.g. “level 1”, “level 2”, “level 3”).

No major changes reported

## [F0.f]

**Requirements**: Simple spatial rules govern plant growth based on sun, water, and nearby plants (growth is unlocked by satisfying conditions).

No major changes reported

## [F0.g]

**Requirements**: A play scenario is completed when some condition is satisfied (e.g. at least X plants at growth level Y or above).

No major changes reported

## [F1.a]

**Requirements**: The important state of your game's grid must be backed by a single contiguous byte array in AoS or SoA format.

No major changes reported

## [F1.b]

**Requirements**: The player must be able to manually save their progress in the game.

No major changes reported

## [F1.c]

**Requirements**: The game must implement an implicit auto-save system to support recovery from unexpected quits.

No major changes reported

## [F1.d]

**Requirements**: The player must be able to undo every major choice (all the way back to the start of play), even from a saved game.

No major changes reported

## [F2.a]

**Requirements**: External DSL for scenario designs: In separate text file or text block, designers should be able to express the design of different gameplay scenarios, e.g. starting conditions, weather randomization policy, and victory conditions. The language must be able to schedule unique events that happen at specific times.

No major changes reported

## [F2.b] 

**Requirements**:  Internal DSL for plant types and growth conditions: Within the main programming language used for the rest of your game, you should implement and use a domain-specific language for defining your different types of plants and the unique growth rules that apply to each.

No major changes reported

## [F2.c] 

**Requirements**:  Switch to an alternate platform: Change either your project's primary programming language or your primary user interface library/engine/framework. 

No major changes reported

## [f3.a]
**Requirement**: The game must be internationalized in way that allows all text visible to the player to be translated into different written languages (i.e. there are no messages that are hard-coded to display only English-language text, but it is fine for this requirement if English is the only supported display language).

Our project supports three languages: English (EN), Chinese (ZH), and Arabic (AR). For English, we utilized it as the default language. The Chinese localization was primarily supported through ChatGPT. Arabic localization followed a similar process, utilizing ChatGPT's translations with manual adjustments to account for right-to-left (RTL) text direction. Instead of having English hardcoded into the project, we handled it by storing the 3 languages into one unique file: translation.ts.  Referring to it when the user switches to a different language. The text content would then be updated on the display.

## [f3.b]
**Requirement**: The game must be localized to support three different written languages. At least one language must use a logographic. script, and at least one language must use a right-to-left script.

In this project, we chose Chinese and Arabic as our logographic and right-to-left languages. Players can choose their language using a selector in the top-left corner of the screen. For Arabic, the selector moves to the top-right to align with the right-to-left layout. The software was updated to fetch translations dynamically and adjust the text direction when switching to a new language

## [f3.d]

**Requirement**: Once installed in a mobile device, the game can be launched and satisfactorily played even when the device is not connected to the internet.

Using a web app manifest file allows the game to be played as a progressive web app. When it’s used in conjunction with a service worker, the game can be used offline. 

# Reflection
Add reflection

