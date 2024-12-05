# f0 Devlog

<!-- TODO: Write reflection -->

 by CMPM 121 - Group 33
- Jalen Suwa
- Brian Chung
- Dylan Boyer
- Jonathan Cheng
- Marvel McDowell

## [F0.a]

**Requirements**: You control a character moving over a 2D grid.

Within our game we have supplied instructions to the player on how to move around the 2D Grid. The player can use WASD or the Arrow keys to navigate the grid. We have a list of keyboard listeners with a switch case structure to allow the player to move around the grid.

## [F0.b]

**Requirements**: You advance time manually in the turn-based simulation.

Within the HUD of our game, we supply the user with a “Next Day” button to advance time manually. We achieve this with a button that when clicked, increases the day count by one and updates the grid in several ways. Each grid space has a place for a plant, a water level, and a sunlight level. Advancing the day will update each grid space accordingly. For example, planting a plant in space and advancing the day typically results in the grid space’s water level decreasing, and the plant's growth level increasing.

## [F0.c]

**Requirements**: You can reap or sow plants on grid cells only when you are near them.

The player is allowed to reap or sow plants in grid cells adjacent or directly on the player's cell. This is done with a function that we have called `isWithinRange()`. The function takes in the player's position and the target position as x and y coordinates. The function then calculates the distance between the two and if it is less than or equal to the (constant) interaction range variable we have defined as 1, then the player will be allowed to reap or sow that grid cell.

## [F0.d]

**Requirements**: Grid cells have sun and water levels. The incoming sun and water for each are randomly generated each turn. Sun energy cannot be stored in a cell (it is available per day) while water moisture can be slowly accumulated over several turns and depletes with usage.

We have stored this logic within the grid.ts file. We have a specific function called `updateEnvironment()`. The function iterates over every cell in the grid to handle the different values of the sunlight and water levels. Water in the cell can be increased but never exceeds a maximum value. While updating the water levels we account for a random retention value or a random new value for the water level. The same goes for the sunlight levels except there is no need to worry about retention, it is simply updated to a random value between 0 and 3.

## [F0.e]

**Requirements**: Each plant on the grid has a distinct type (e.g. one of 3 species) and a growth level (e.g. “level 1”, “level 2”, “level 3”).

Within our plant.ts file, we have defined 3 different species of plants for the user to reap and sow. The first is a “Green Circle” plant that takes 2 water and 2 sun resources to grow. The second is a “Yellow Triangle” plant that takes 1 water and 3 sun resources to grow. The last plant is a “Purple Square” plant that takes 3 water and only 1 sun resource to grow. There is also a 4th type but the user cannot place this one down. It is the “Withered” plant, which happens when a plant withers. This plant type will never grow and will always drain the cells of its resources. All three plants have 3 maximum growth levels (this may change in future updates).

## [F0.f]

**Requirements**: Simple spatial rules govern plant growth based on sun, water, and nearby plants (growth is unlocked by satisfying conditions).

The spatial rules are handled within the plant file. Each plant has its predefined conditions to allow an increase in growth level from day to day. There is a single function, `canGrow()` that checks for which plant it is dealing with, the water level in the cell, and the sunlight level. It then compares the cell’s values with the plant's growth conditions and increases the growth level if both conditions are met. This increase in growth level is represented by an increase in the size of the plant itself on the grid cell.

## [F0.g]

**Requirements**: A play scenario is completed when some condition is satisfied (e.g. at least X plants at growth level Y or above).

We added a function to the main file that calculates a score for the player. The player can gain points by sowing and reaping plants, but also lose points if they allow plants to die. The player gains 0.5 points per plant sown and 1 point per plant reaped. If they allow it to die then the player loses 1 point. The user will gain an extra 10 points if they have successfully grown 10 plants and they are all on the grid at the same time. The player will get one month to rack up as many points as they can. Once the game reaches the end of day 31, the game will end and the final score will be shown with an option to replay the game (this is not finished yet but it is planned to be implemented).
