// ====== Main + Imports ======
import { Grid } from "./grid.ts";
import { Player } from "./player.ts";
import { DayManager } from "./day.ts";
import { PlantAction, PlantTypeInfo } from "./plant.ts";
import { StatisticTracker } from "./statistic.ts";

import "./style.css";
import "./game.css";

// ====== Consts ======
const GAME_NAME = "CMPM 121 Final Project - Group 33";
const GRID_SIZE = 10;

const app = document.querySelector<HTMLDivElement>("#app")!;

// TODO: Implement Game Over

// ====== Title ======
document.title = GAME_NAME;
const title = document.createElement("h1");
title.innerText = GAME_NAME;

// ====== Game State ======
const statTracker = new StatisticTracker();
const grid = new Grid(GRID_SIZE, GRID_SIZE, statTracker);
const player = new Player(grid, { x: 0, y: 0 }, statTracker);
const dayManager = new DayManager(grid);

// ====== Game Grid ======
const gameGrid = document.createElement("div");
gameGrid.id = "game-grid";
gameGrid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 32px)`;

function updateGridDisplay() {
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
        updateGridDisplay();
      });

      cell.addEventListener("click", (_e) => {
        player.interactWithPlant(PlantAction.SOW, pos);
        updateGridDisplay();
      });

      // Add player if position matches
      const playerPos = player.getPosition();
      if (playerPos.x === x && playerPos.y === y) {
        const playerElement = document.createElement("div");
        playerElement.className = "player";
        playerElement.innerText = "👨‍🌾";
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
dayCounter.textContent = `Day: ${dayManager.getCurrentDay()}`;
dayCounter.style.marginBottom = "10px";

const advanceDayButton = document.createElement("button");
advanceDayButton.textContent = "Next Day";

advanceDayButton.onclick = () => {
  dayManager.advanceDay();
  dayCounter.textContent = `Day: ${dayManager.getCurrentDay()}`;
  updateGridDisplay();
};

dayControls.appendChild(dayCounter);
dayControls.appendChild(advanceDayButton);
gameHud.appendChild(dayControls);

// ====== HUD: Selected Plant Type ======

const plantTypeDisplay = document.createElement("div");
plantTypeDisplay.className = "current-plant-type";
const initialTypeName = "Green Circle"; // default plant type
plantTypeDisplay.textContent = `Current Plant: ${initialTypeName}`;
gameHud.appendChild(plantTypeDisplay);

function updatePlantSelect() {
  const plantTypeDisplay = document.querySelector(".current-plant-type");
  if (plantTypeDisplay) {
    const typeName = PlantTypeInfo[player.getCurrentPlantType()].name;
    plantTypeDisplay.textContent = `Current Plant: ${typeName}`;
  }
}

// ====== HUD: Score ======
// TODO: f0.g Implement scoring system
function calculateScore(): number {
  let score = 0;
  console.log("Plants sown: " + statTracker.get("plantSown"));

  score = (statTracker.get("plantSown") ?? 0) * 0.5 + // 0.5 points per plant sown
    (statTracker.get("plantReaped") ?? 0) * 1 + // 1 point per plant reaped
    (statTracker.get("plantDied") ?? 0) * -1 + // -1 points per plant died
    Math.floor((statTracker.get("maxGridAlive") ?? 0) / 10) * 10; // 10 points per every 10 plants alive at once

  return score;
}

const scoreDisplay = document.createElement("p");
scoreDisplay.className = "score";

function updateScoreDisplay(): void {
  console.log("Score: " + calculateScore());
  scoreDisplay.textContent = `Score: ${calculateScore()}`;
}
dayManager.addPostDayCallback(updateScoreDisplay);
gameHud.appendChild(scoreDisplay);

// ====== Instructions ======
const instructions = document.createElement("div");
{
  const description = document.createElement("p");

  const controls: { [key: string]: string } = {
    "Left Click": "Sow a nearby plant",
    "Right Click": "Reap a nearby plant",
    "WASD / Arrow Keys": "Move player",
    "1 / 2 / 3": "Switch plant type",
  };

  instructions.innerHTML = "<h2>Instructions</h2><hr>";
  for (const [input, action] of Object.entries(controls)) {
    instructions.innerHTML += `<p><strong>${input}</strong>: ${action}</p>`;
  }

  // TODO: Describe mechanics and limitations (e.g. player reach, plant growth, water/sunlight, etc.)
  description.innerText =
    `Click the cells current or adjacent to the farmer to sow or reap plants. Click the Next Day button to advance the day. Plants require water and sunlight to grow. Different plants have different requirements (see below). Don't overcrowd plants or they will die.`;
  instructions.appendChild(description);
  {
    let i = 1;
    for (const info in PlantTypeInfo) {
      instructions.innerHTML += `<p><strong>(${i}) ${
        PlantTypeInfo[info].name
      }</strong>:<br>
      To Grow: ${PlantTypeInfo[info].waterToGrow} water,
      ${PlantTypeInfo[info].sunToGrow} sunlight,
      ${PlantTypeInfo[info].maxCrowding} maximum adjacent plants
    <br>
      Can sow at level ${PlantTypeInfo[info].maxGrowth}</p>`;
      i++;
    }
  }
}

// ====== Keyboard Listeners ======
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w":
      player.move("up");
      updateGridDisplay();
      break;
    case "ArrowDown":
    case "s":
      player.move("down");
      updateGridDisplay();
      break;
    case "ArrowLeft":
    case "a":
      player.move("left");
      updateGridDisplay();
      break;
    case "ArrowRight":
    case "d":
      player.move("right");
      updateGridDisplay();
      break;
    case "1":
    case "num1":
      player.setPlantType("green-circle");
      updatePlantSelect();
      break;
    case "2":
    case "num2":
      player.setPlantType("yellow-triangle");
      updatePlantSelect();
      break;
    case "3":
    case "num3":
      player.setPlantType("purple-square");
      updatePlantSelect();
      break;
  }
});

// ====== Initialize DOM display ======
app.appendChild(title);
app.appendChild(gameGrid);
app.appendChild(gameHud);
app.appendChild(instructions);
updateGridDisplay();
updateScoreDisplay();
