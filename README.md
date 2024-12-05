# CMPM 121 Group 33 Final

# F0 Devlog

## How we satisfied the software requirements

[F0.a] You control a character moving over a 2D grid.

- We implemented character movement using keyboard listeners for WASD and arrow keys. The Player class in player.ts has a move method that updates the player's position on the grid. The updateGridDisplay function in main.ts visually updates the grid to reflect the player's new position.

[F0.b] You advance time manually in the turn-based simulation.

- We added a "Next Day" button in the HUD, which calls the advanceDay method of the DayManager class in day.ts. This method increments the day count and updates the grid's environment, including water and sunlight levels for each cell.

[F0.c] You can reap or sow plants on grid cells only when you are near them.

- The Player class has an interactWithPlant method that checks if the target cell is within range using the isWithinRange method of the Grid class in grid.ts. This ensures that the player can only interact with adjacent cells.

[F0.d] Grid cells have sun and water levels. The incoming sun and water for each cell is somehow randomly generated each turn. Sun energy cannot be stored in a cell (it is used immediately or lost) while water moisture can be slowly accumulated over several turns.

- The updateEnvironment method in the Grid class handles the random generation of sun and water levels for each cell. Water levels can accumulate over turns, while sunlight levels are reset each turn.

[F0.e] Each plant on the grid has a distinct type (e.g. one of 3 species) and a growth level (e.g. “level 1”, “level 2”, “level 3”).

- We defined different plant types in the PlantTypeInfo object in plant.ts. Each plant has specific growth requirements and levels. The canGrow function checks if a plant can grow based on its type and the cell's resources.

[F0.f] Simple spatial rules govern plant growth based on sun, water, and nearby plants (growth is unlocked by satisfying conditions).

- The canGrow function in plant.ts checks if a plant can grow based on the cell's water and sunlight levels. The updateEnvironment method in the Grid class also checks for overcrowding and updates plant growth accordingly.

[F0.g] A play scenario is completed when some condition is satisfied (e.g. at least X plants at growth level Y or above).

- We implemented a scoring system in the calculateScore function in main.ts. The game ends after 31 days, and the final score is displayed to the player. The score is based on the number of plants sown, reaped, and died, as well as the maximum number of plants alive at once.

## Reflection
Initially, we planned to use Unity and Blender for our game but quickly switched to HTML5 and JavaScript due to team familiarity and progress issues. It was also recommended to us that we do not attempt to switch from Unity to Unreal as it is too difficult to pull off within the project scope. We also decided to use Deno and Vite for modern runtime and build capabilities. Additionally, our roles have shifted slightly throughout the project as team members balanced other commitments but we have maintained communication and adapted to changes as they've come. Our experience so far has taught us the importance of flexibility and collaboration in achieving our goals.

# Team Formation Devlog

## Introducing the team

- Marvel McDowell - Design Lead / Production Backup
- Jonathan D Cheng - Tools Lead / Engine Backup
- Brian Chung - Tools Lead / Design Backup
- Jalen Suwa - Production Lead / Tool Backup
- Dylan Boyer - Engine Lead / Design Backup

## Tools and materials

__Tell us about what engines, libraries, frameworks, and or platforms you intend to use, and give us a tiny bit of detail about why your team chose those.__

-  We will be starting out with using just Javascript/HTML/CSS in the DOM because it is what we are all generally familiar with. Additionally, we are using Deno for runtime and Vite for building and bundling the project due to their modern features and ease of use.

__Tell us programming languages (e.g. TypeScript) and data languages (e.g. JSON) you team expects to use and why you chose them. Presumably you’ll just be using the languages expected by your previously chosen engine/platform.__

- We will be using Typescript for our Javascript/ECMAScript parts because it helps ensure better code quality. JSON will likely be used for any data storage due to its ease of use with Javascript code.

__Tell us about which tools you expect to use in the process of authoring your project. You might name the IDE for writing code, the image editor for creating visual assets, or the 3D editor you will use for building your scene. Again, briefly tell us why you made these choices. Maybe one of your teammates feels especially skilled in that tool or it represents something you all want to learn about.__

- We will be using Git for version control and VS Studio + VS Code for scripting. We are also using Deno for its modern runtime capabilities and Vite for its fast build and development server.

__Tell us about your alternate platform choice. Remember, your alternate platform must differ from your primary platform by either changing the primary primarily language used or the engine/library/framework used for building your user interface.__

- We will plan to transfer to another JS framework like React or Vue to minimize the amount of porting that needs to be done while still leveraging the benefits of a modern framework.

## Outlook

We hope to gain the ability to be flexible with onboarding onto new game engines while working within a team. Our team is aiming to create a highly interactive and visually appealing game that leverages modern web technologies like Deno and Vite for optimal performance and development speed. We anticipate that the hardest part of the project will be ensuring smooth and responsive gameplay within the constraints of the browser environment, especially as the complexity of the game increases. By using TypeScript and modern build tools, we hope to learn more about maintaining code quality and efficiency in a collaborative setting, as well as gaining deeper insights into the capabilities of these technologies for future projects.
