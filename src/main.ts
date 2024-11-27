// ====== Main + Imports ======
import "./style.css";
import { Grid } from "./grid.ts";
import { Player } from "./player.ts";
import { GameState } from "./state.ts";
import { PlantAction } from "./plant.ts";

// ====== Consts ======
const GAME_NAME = "CMPM 121 Final Project - Group 33";
const GRID_SIZE = 10;

const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = GAME_NAME;

const grid = new Grid(GRID_SIZE, GRID_SIZE);
const player = new Player(grid, { x: 0, y: 0 });
const gameState = new GameState();

// ====== DOM Container ======
const gameLayout = document.createElement("div");
gameLayout.style.display = "flex";
gameLayout.style.flexDirection = "column"; 
gameLayout.style.alignItems = "center"; 
gameLayout.style.gap = "10px"; 

// ====== Game Grid ======
const gameContainer = document.createElement("div");
gameContainer.style.display = "grid";
gameContainer.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 32px)`;
gameContainer.style.gap = "1px";
gameContainer.style.backgroundColor = "#ccc";

gameLayout.appendChild(gameContainer);  
updateDisplay();

// ====== Day Button ======
const dayControls = document.createElement("div");
dayControls.className = "controls";

const dayCounter = document.createElement("div");
dayCounter.textContent = `Day: ${gameState.getCurrentDay()}`;
dayCounter.style.marginBottom = "10px";

const advanceDayButton = document.createElement("button");
advanceDayButton.textContent = "Next Day";
advanceDayButton.onclick = () => {
  gameState.advanceDay();
  dayCounter.textContent = `Day: ${gameState.getCurrentDay()}`;
  advanceDayPlant();
  updateDisplay();
};

dayControls.appendChild(dayCounter);
dayControls.appendChild(advanceDayButton);
gameLayout.appendChild(dayControls);

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
  updateDisplay();
});

// ====== Functions ======
function updateDisplay() {
  gameContainer.innerHTML = "";

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      const pos = { x, y };

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
        updateDisplay();
      });

      cell.addEventListener("click", (e) => {
        player.interactWithPlant(PlantAction.SOW, pos);
        updateDisplay();
      });

      // Add player if position matches
      const playerPos = player.getPosition();
      if (playerPos.x === x && playerPos.y === y) {
        const playerElement = document.createElement("div");
        playerElement.className = "player";
        cell.appendChild(playerElement);
      }

      gameContainer.appendChild(cell);
    }
  }
}

function advanceDayPlant() {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const plant = grid.getPlant({ x, y });
      if (plant) {
        if (plant.growthLevel < 3) {
          plant.growthLevel++;
        }
      }
    }
  }
}


app.appendChild(gameLayout);