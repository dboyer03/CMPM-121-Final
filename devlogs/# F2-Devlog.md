# F2 Devlog

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

We moved all the reap and sow logic from the grid.ts file into the plant.ts file instead.

## [F0.d]

**Requirements**: Grid cells have sun and water levels. The incoming sun and water for each cell are somehow randomly generated each turn. Sun energy cannot be stored in a cell (it is used immediately or lost) while water moisture can be slowly accumulated over several turns.

We changed the water retention and sun levels based on the weather conditions. They are no longer constant values, rather values that can be changed depending on what weather is present on a given day.

## [F0.e]

**Requirements**: Each plant on the grid has a distinct type (e.g. one of 3 species) and a growth level (e.g. “level 1”, “level 2”, “level 3”).

We added a new plant type, the "weed" cannot be placed by the user, but could have been used for an event.

## [F0.f]

**Requirements**: Simple spatial rules govern plant growth based on sun, water, and nearby plants (growth is unlocked by satisfying conditions).

No major changes reported

## [F0.g]

**Requirements**: A play scenario is completed when some condition is satisfied (e.g. at least X plants at growth level Y or above).

We added one new win condition, if the player reaches a certain score before the day limit is reached, then the game ends and a victory message is displayed on the screen.

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

The external DSL is based off of the TOML language. TOML is simple and very readable compared to the other two. YAML and JSON lacks stricter rules and generated more errors in testing than TOML. The TOML document is very simple and the format follows this.

[category]
item = value

An example is in the code we have 2 victory conditions and they are defined in the same fashion as the definition I have provided.

[victory_conditions]
end_day = 31
end_score = 34

In the example if the player reaches day 31 the game will automatically end and display the users current score. In the second line, if the player reaches that score before they reach the day limit, the current score will be displayed and a victory message along with it. 

## [F2.b] 

**Requirements**:  Internal DSL for plant types and growth conditions: Within the main programming language used for the rest of your game, you should implement and use a domain-specific language for defining your different types of plants and the unique growth rules that apply to each.

```typescript
const plantDefinitions: PlantTypeDefinition[] = [
  {
    name: "Corn",
    waterToGrow: 2,
    sunToGrow: 2,
    maxCrowding: 8,
    maxGrowth: 4,
    canGrow: function (grid, pos) {
      return commonCanGrow.call(this, grid, pos);
    },
    process: function (grid, pos) {
      commonProcess.call(this, grid, pos);
    },
    getDescription: function () {
      return commonDescription.call(this);
    },
  },
  {
    name: "Cactus",
    waterToGrow: 1,
    sunToGrow: 3,
    maxCrowding: 2,
    maxGrowth: 3,
    canGrow: function (grid, pos) {
      return commonCanGrow.call(this, grid, pos);
    },
    process: function (grid, pos) {
      commonProcess.call(this, grid, pos);
    },
    getDescription: function () {
      return commonDescription.call(this);
    },
  },
];
```
Typescript is being used here. In this example, we are defining the different plant types and the conditions that need to be met in order for them to increase their growth level. The internal DSL showed itself to be the better option for the plant logic because most of the plant's functions are used in this specific file. There was no need to add this to the main file, it would only cause more confusion and clutter and take away from the readability of the code. Defining it here gives the user a clear idea of what the file is for and what it does, which is to determine what plants can be planted in the game and how each of them can grow to give the player more plants. It can also easily be modified and more plants could be added by using the existing 3 plants as a template.

## [F2.c] 

**Requirements**:  Switch to an alternate platform: Change either your project's primary programming language or your primary user interface library/engine/framework. 

Due to time constraints we did not implement this requirement. We had originally planned to make the switch to phaser, but time did not allow for us to follow through with said plan/requirement.


# Reflection
After learning and utilizing external and internal DSL we have a newfound respect for the idea of catering to both the readability and ease of modification of our code. Going forward we may even add more events and starting/ending conditions because it seems simple to define more of these items and make our game grow. After adding these DSL it also allowed for the birth of new mechanics and ideas. We previously were interested in creating a weather system and in completing this part of the project we were able to implement it with ease. We also found that moving the logic for the reap and sow functions into the plant file made a lot more sense. It decluttered the grid function and now the user can understand that it's not the grid we are reaping and sowing, it is the plants themselves.

