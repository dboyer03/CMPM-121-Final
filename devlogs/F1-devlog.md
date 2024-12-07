# F1 Devlog

 by CMPM 121 - Group 33
- Jalen Suwa
- Brian Chung
- Dylan Boyer
- Jonathan Cheng
- Marvel McDowell

# How we satisfied the software requirements

## [F0.a]

**Requirements**: You control a character moving over a 2D grid.

Same as last week

## [F0.b]

**Requirements**: You advance time manually in the turn-based simulation.

Same as last week

## [F0.c]

**Requirements**: You can reap or sow plants on grid cells only when you are near them.

Same as last week

## [F0.d]

**Requirements**: Grid cells have sun and water levels. The incoming sun and water for each cell is somehow randomly generated each turn. Sun energy cannot be stored in a cell (it is used immediately or lost) while water moisture can be slowly accumulated over several turns.

Same as last week

## [F0.e]

**Requirements**: Each plant on the grid has a distinct type (e.g. one of 3 species) and a growth level (e.g. “level 1”, “level 2”, “level 3”).

Same as last week

## [F0.f]

**Requirements**: Simple spatial rules govern plant growth based on sun, water, and nearby plants (growth is unlocked by satisfying conditions).

Same as last week

## [F0.g]

**Requirements**: A play scenario is completed when some condition is satisfied (e.g. at least X plants at growth level Y or above).

Same as last week

## [F1.a]

**Requirements**: The important state of your game's grid must be backed by a single contiguous byte array in AoS or SoA format.

We use an Array-of-Structures (AoS) format for our grid state. Each cell in the grid is represented by two bytes: one for water level and one for sunlight level. This is implemented in the Grid class in src/grid.ts. The byte array is updated every turn to reflect the current state of the grid.

![F1.a data structure diagram](./images/F1.a_diagram.png)

## [F1.b]

**Requirements**: The player must be able to manually save their progress in the game.

We implemented manual save functionality using the trySaveGame method in the StateManager class in src/state.ts. The player can save their game to a specified slot, which is stored in the browser's local storage.

## [F1.c]

**Requirements**: The game must implement an implicit auto-save system to support recovery from unexpected quits.

We implemented an auto-save system using the autoSave method in the StateManager class in src/state.ts. The game automatically saves progress at the end of each day. When the game is launched, it checks for an auto-save entry and prompts the player to continue from where they left off.

## [F1.d]

**Requirements**: The player must be able to undo every major choice (all the way back to the start of play), even from a saved game.

We implemented undo and redo functionality using the getUndo and getRedo methods in the StateManager class in src/state.ts. The game maintains a history of states, allowing the player to undo and redo actions multiple times.

# Reflection

Looking back on how we achieved the new F1 requirements, our team's plan has evolved significantly. Initially, we did not consider the complexity of implementing a contiguous byte array for the grid state. This requirement pushed us to rethink our data structures and optimize memory usage. We also had to enhance our save and load mechanisms to support multiple save slots and auto-save functionality. Our game design has evolved to provide more feedback to the player, such as prompts for auto-save recovery and visual indicators for undo and redo actions. These changes have improved the overall user experience and made the game more robust. Our roles have also shifted slightly, with team members taking on new responsibilities to address these additional requirements. This experience has reinforced the importance of adaptability and collaboration in game development.

