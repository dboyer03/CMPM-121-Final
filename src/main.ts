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
const END_DAY = 31;

const app = document.querySelector<HTMLDivElement>("#app")!;

// TODO: Implement Game Over

// ====== Title ======
document.title = GAME_NAME;
const title = document.createElement("h1");
title.textContent = GAME_NAME;

// ====== Game State ======
interface Game {
  statTracker: StatisticTracker;
  grid: Grid;
  player: Player;
  dayManager: DayManager;
}

function newGame(): Game {
  const game: Partial<Game> = {};
  game.statTracker = new StatisticTracker();
  game.grid = new Grid(GRID_SIZE, GRID_SIZE, game.statTracker);
  game.player = new Player(game.grid, { x: 0, y: 0 }, game.statTracker);
  game.dayManager = new DayManager(game.grid);

  return game as Game;
}

function calculateScore(): number {
  let score = 0;

  score = (game.statTracker.get("plantSown") ?? 0) * 0.5 + // 0.5 points per plant sown
    (game.statTracker.get("plantReaped") ?? 0) * 1 + // 1 point per plant reaped
    (game.statTracker.get("plantDied") ?? 0) * -1 + // -1 points per plant died
    Math.floor((game.statTracker.get("maxGridAlive") ?? 0) / 10) * 10; // 10 points per every 10 plants alive at once

  return score;
}

// Initialize game
let game: Game = newGame();

// ====== Check for Auto-Save ======
function checkForAutoSave(): void {
  const autoSave = localStorage.getItem("save_auto");
  if (autoSave) {
    const continueGame = confirm("Do you want to continue where you left off?");
    if (continueGame) {
      game.dayManager = DayManager.deserialize(autoSave, game.grid);
      updateGridDisplay();
      alert("Game loaded from auto-save.");
    }
  }
}

// ====== Game Grid ======
const gameGrid = document.createElement("div");
gameGrid.id = "game-grid";
gameGrid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 32px)`;

function updateGridDisplay(): void {
  gameGrid.innerHTML = "";

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      const pos = { x, y };

      const cellProperties = game.grid.getCellProperties(pos);

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

      const plant = game.grid.getPlant(pos);
      if (plant) {
        const plantElement = document.createElement("div");
        plantElement.className =
          `plant type-${plant.type} level-${plant.growthLevel}`;
        cell.appendChild(plantElement);
      }

      // Add click handlers for plant interactions
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault(); // prevent default right-click menu
        game.player.interactWithPlant(PlantAction.REAP, pos);
        updateGridDisplay();
      });

      cell.addEventListener("click", (_e) => {
        game.player.interactWithPlant(PlantAction.SOW, pos);
        updateGridDisplay();
      });

      // Add player if position matches
      const playerPos = game.player.getPosition();
      if (playerPos.x === x && playerPos.y === y) {
        const playerElement = document.createElement("div");
        playerElement.className = "player";
        playerElement.textContent = "👨‍🌾";
        cell.appendChild(playerElement);
      }

      gameGrid.appendChild(cell);
    }
  }
}

// ====== Save and Load Functions ======
function saveGame(slot: string): void {
  const serializedState = game.dayManager.serialize();
  localStorage.setItem(`save_${slot}`, serializedState);
  alert(`Game saved to slot ${slot}`);
}

function loadGame(): void {
  const slots = Object.keys(localStorage).filter(key => key.startsWith("save_"));
  if (slots.length === 0) {
    alert("No save slots available.");
    return;
  }

  const slot = prompt(`Enter save slot name:\nAvailable slots:\n${slots.map(s => s.replace("save_", "")).join("\n")}`);
  if (slot) {
    const serializedState = localStorage.getItem(`save_${slot}`);
    if (serializedState) {
      game.dayManager = DayManager.deserialize(serializedState, game.grid);
      updateGridDisplay();
      alert(`Game loaded from slot ${slot}`);
    } else {
      alert(`No save found in slot ${slot}`);
    }
  }
}

// ====== Game HUD ======
const gameHud = document.createElement("div");
gameHud.id = "game-hud";

// ====== HUD: Selected Plant Type ======

const plantTypeDisplay = document.createElement("div");
plantTypeDisplay.className = "current-plant-type";
const initialTypeName = "Green Circle"; // default plant type
plantTypeDisplay.textContent = `Current Plant: ${initialTypeName}`;
gameHud.appendChild(plantTypeDisplay);

function updatePlantSelect(): void {
  const plantTypeDisplay = document.querySelector(".current-plant-type");
  if (plantTypeDisplay) {
    const typeName = PlantTypeInfo[game.player.getCurrentPlantType()].name;
    plantTypeDisplay.textContent = `Current Plant: ${typeName}`;
  }
}

// ====== HUD: Score ======
const scoreDisplay = document.createElement("p");
scoreDisplay.className = "score";

function updateScoreDisplay(): void {
  scoreDisplay.textContent = `Score: ${calculateScore()}`;
}
gameHud.appendChild(scoreDisplay);
game.dayManager.addPostDayCallback(updateScoreDisplay);

// ====== HUD: Day Button ======
const dayControls = document.createElement("div");
dayControls.className = "controls";

const dayCounter = document.createElement("div");
dayCounter.textContent = `Day: ${game.dayManager.getCurrentDay()}`;
dayCounter.style.marginBottom = "10px";

const advanceDayButton = document.createElement("button");
advanceDayButton.textContent = "Next Day";

function updateDayDisplay(): void {
  dayCounter.textContent = `Day: ${game.dayManager.getCurrentDay()}`;
}

advanceDayButton.onclick = () => {
  // Game Over
  if (game.dayManager.getCurrentDay() >= END_DAY) {
    alert("Game Over! Your final score is: " + calculateScore());

    game = newGame();
    game.dayManager.addPostDayCallback(updateScoreDisplay);
    updateGridDisplay();
    updateDayDisplay();
    updateScoreDisplay();

    return;
  }

  // Next day
  game.dayManager.advanceDay();
  dayCounter.textContent = `Day: ${game.dayManager.getCurrentDay()}`;
  updateGridDisplay();
};

// ====== Save and Load Buttons ======
const saveButton = document.createElement("button");
saveButton.textContent = "Save Game";
saveButton.onclick = () => {
  const slot = prompt("Enter save slot name:");
  if (slot) {
    saveGame(slot);
  }
};

const loadButton = document.createElement("button");
loadButton.textContent = "Load Game";
loadButton.onclick = () => {
  loadGame();
};

dayControls.appendChild(dayCounter);
dayControls.appendChild(advanceDayButton);
dayControls.appendChild(saveButton);
dayControls.appendChild(loadButton);
gameHud.appendChild(dayControls);

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
  description.textContent =
    `Click the cells current or adjacent to the farmer to sow or reap plants. \
    Click the Next Day button to advance the day. Plants require water and sunlight to grow. \
    Different plants have different requirements (see below). \
    Don't overcrowd plants or they will die (Black squares, reap to clear). \
    See how high of a score you can get in ${END_DAY} days!`;
  instructions.appendChild(description);
  {
    let i = 1;
    for (const info in PlantTypeInfo) {
      if (info === "withered") continue;
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
      game.player.move("up");
      updateGridDisplay();
      break;
    case "ArrowDown":
    case "s":
      game.player.move("down");
      updateGridDisplay();
      break;
    case "ArrowLeft":
    case "a":
      game.player.move("left");
      updateGridDisplay();
      break;
    case "ArrowRight":
    case "d":
      game.player.move("right");
      updateGridDisplay();
      break;
    case "1":
    case "num1":
      game.player.setPlantType("green-circle");
      updatePlantSelect();
      break;
    case "2":
    case "num2":
      game.player.setPlantType("yellow-triangle");
      updatePlantSelect();
      break;
    case "3":
    case "num3":
      game.player.setPlantType("purple-square");
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

// ====== Check for Auto-Save on Launch ======
checkForAutoSave();
