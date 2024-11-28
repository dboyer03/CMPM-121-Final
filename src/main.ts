// ====== Main + Imports ======
import { Grid } from "./grid.ts";
import { Player } from "./player.ts";
import { GameState } from "./state.ts";
import { PlantAction } from "./plant.ts";

import "./style.css";
import "./game.css";

// ====== Consts ======
const GAME_NAME = "CMPM 121 Final Project - Group 33";
const GRID_SIZE = 10;

const app = document.querySelector<HTMLDivElement>("#app")!;

// ====== Title ======
document.title = GAME_NAME;
const title = document.createElement("h1");
title.innerText = GAME_NAME;

// ====== Game State ======
const grid = new Grid(GRID_SIZE, GRID_SIZE);
const player = new Player(grid, { x: 0, y: 0 });
const gameState = new GameState(grid);

// ====== Game Grid ======
const gameGrid = document.createElement("div");
gameGrid.id = "game-grid";
gameGrid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 32px)`;

function updateGrid() {
  gameGrid.innerHTML = "";

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      const pos = { x, y };

      const cellProperties = grid.getCellProperties(pos);

      // water segments (top o cell)
      for (let i = 0; i < cellProperties.water; i++) {
        const segment = document.createElement("div");
        segment.className = "water-segment";
        segment.classList.add(`segment-${i}`);
        cell.appendChild(segment);
      }

      // sun segments (bottom o cell)
      for (let i = 0; i < cellProperties.sunlight; i++) {
        const segment = document.createElement("div");
        segment.className = "sun-segment";
        segment.classList.add(`segment-${i}`);
        cell.appendChild(segment);
      }

      const plant = grid.getPlant(pos);
      if (plant) {
        const plantElement = document.createElement("div");
        plantElement.className =
          `plant type-${plant.type} level-${plant.growthLevel}`;
        cell.appendChild(plantElement);
      }

      // Add click handlers for plant interactions
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault(); // prevent default right-click menu
        player.interactWithPlant(PlantAction.REAP, pos);
        updateGrid();
      });

      cell.addEventListener("click", (_e) => {
        player.interactWithPlant(PlantAction.SOW, pos);
        updateGrid();
      });

      // Add player if position matches
      const playerPos = player.getPosition();
      if (playerPos.x === x && playerPos.y === y) {
        const playerElement = document.createElement("div");
        playerElement.className = "player";
        cell.appendChild(playerElement);
      }

      gameGrid.appendChild(cell);
    }
  }
}

// ====== Game HUD ======
const gameHud = document.createElement("div");
gameHud.id = "game-hud";

// ====== HUD: Day Button ======
const dayControls = document.createElement("div");
dayControls.className = "controls";

const dayCounter = document.createElement("div");
dayCounter.textContent = `Day: ${gameState.getCurrentDay()}`;
dayCounter.style.marginBottom = "10px";

const advanceDayButton = document.createElement("button");
advanceDayButton.textContent = "Next Day";

function advanceDayPlant() {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const plant = grid.getPlant({ x, y });
      if (plant && plant.growthLevel < 3) {
        plant.growthLevel++;
      }
    }
  }
}

advanceDayButton.onclick = () => {
  gameState.advanceDay();
  dayCounter.textContent = `Day: ${gameState.getCurrentDay()}`;
  advanceDayPlant();
  updateGrid();
};

dayControls.appendChild(dayCounter);
dayControls.appendChild(advanceDayButton);
gameHud.appendChild(dayControls);

// ====== Instructions ======
const instructions = document.createElement("div");
const description = document.createElement("p");

const controls: { [key: string]: string } = {
  "Left Click": "Sow a nearby plant",
  "Right Click": "Reap a nearby plant",
  "WASD / Arrow Keys": "Move player",
};

instructions.innerHTML = "<h2>Instructions</h2><hr>";
for (const [input, action] of Object.entries(controls)) {
  instructions.innerHTML += `<p><strong>${input}</strong>: ${action}</p>`;
}

// TODO: Describe mechanics and limitations (e.g. player reach, plant growth, water/sunlight, etc.)
description.innerText = "Plant seeds, water them, and watch them grow!";
instructions.appendChild(description);

// ====== Keyboard Listeners ======
document.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "arrowup":
    case "w":
      player.move("up");
      break;
    case "arrowdown":
    case "s":
      player.move("down");
      break;
    case "arrowleft":
    case "a":
      player.move("left");
      break;
    case "arrowright":
    case "d":
      player.move("right");
      break;
  }
  updateGrid();
});

// ====== Initialize DOM display ======
app.appendChild(title);
app.appendChild(gameGrid);
app.appendChild(gameHud);
app.appendChild(instructions);
updateGrid();
