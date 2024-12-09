// ====== Main + Imports ======
import { Game, GameConfig, StateManager } from "./state.ts";
import {
  getPlantDescription,
  getPlantTypeCssName,
  getPlantTypeName,
  PlantAction,
  PlantType,
} from "./plant.ts";
import { parse } from "toml";

import "./style.css";
import "./game.css";

// ====== Consts ======
const GAME_NAME = "CMPM 121 Final Project - Group 33";
const fileURL = import.meta.resolve("../level_conditions.toml");
async function fetchFile(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`repeat`);
  }
  return await response.text();
}
const fileContent = await fetchFile(fileURL);
const data = parse(fileContent);

const GRID_SIZE = data.starting_conditions.grid_size;
const END_DAY = data.victory_conditions.end_day;
const SCORE_GOAL = data.victory_conditions.end_score;

const GAME_CONFIG: GameConfig = {
  gridWidth: GRID_SIZE,
  gridHeight: GRID_SIZE,
};

const app = document.querySelector<HTMLDivElement>("#app")!;

// ====== Title ======
document.title = GAME_NAME;
const title = document.createElement("h1");
title.textContent = GAME_NAME;

// ====== Initialize Game State ======
const stateManager: StateManager = new StateManager(GAME_CONFIG);
let game: Game = stateManager.newGame();

// ====== Game Scoring ======
function calculateScore(): number {
  let score = 0;

  score = (game.statTracker.get("plantSown") ?? 0) * 0.5 + // 0.5 points per plant sown
    (game.statTracker.get("plantReaped") ?? 0) * 1 + // 1 point per plant reaped
    (game.statTracker.get("plantDied") ?? 0) * -1 + // -1 points per plant died
    Math.floor((game.statTracker.get("maxGridAlive") ?? 0) / 10) * 10; // 10 points per every 10 plants alive at once

  return score;
}

// ====== Game Grid Display ======
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

      const cellProperties = game.grid.getCell(pos);

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
      if (plant.type !== PlantType.NONE) {
        const plantElement = document.createElement("div");
        plantElement.className = `plant type-${
          getPlantTypeCssName(plant.type)
        } level-${plant.growthLevel}`;
        cell.appendChild(plantElement);
      }

      // Add click handlers for plant interactions
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault(); // prevent default right-click menu
        if (game.player.interactWithPlant(PlantAction.REAP, pos)) {
          updateGridDisplay();
          updateScoreDisplay();
        }
      });

      cell.addEventListener("click", (_e) => {
        if (game.player.interactWithPlant(PlantAction.SOW, pos)) {
          updateGridDisplay();
          updateScoreDisplay();
        }
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

// ====== Game HUD ======
const gameHud = document.createElement("div");
gameHud.id = "game-hud";

// ====== HUD: Selected Plant Type ======

const plantTypeDisplay = document.createElement("div");
plantTypeDisplay.className = "current-plant-type";
const initialTypeName = getPlantTypeName(game.player.getCurrentPlantType());
plantTypeDisplay.textContent = `Current Plant: ${initialTypeName}`;
gameHud.appendChild(plantTypeDisplay);

function updatePlantSelect(): void {
  const plantTypeDisplay = document.querySelector(".current-plant-type");
  if (plantTypeDisplay) {
    const typeName = getPlantTypeName(game.player.getCurrentPlantType());
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

// ====== HUD: Day Button ======
const dayControls = document.createElement("div");
dayControls.className = "controls";

const dayCounter = document.createElement("div");
dayCounter.textContent = `Day: ${game.dayManager.getCurrentDay()}`;
dayCounter.style.marginBottom = "10px";

const advanceDayButton = document.createElement("button");
advanceDayButton.textContent = "Finish Day";

function updateDayDisplay(): void {
  dayCounter.textContent = `Day: ${game.dayManager.getCurrentDay()}`;
}

function updateAllDisplays(): void {

  updateGridDisplay();
  updateDayDisplay();
  updateScoreDisplay();
}

advanceDayButton.onclick = () => {
  // Game Over
  if (calculateScore() >= SCORE_GOAL){
    alert("Game Over! You surpassed the goal! Youe final score: " + calculateScore());

    game = stateManager.newGame(GAME_CONFIG);
    updateAllDisplays();
    stateManager.clearHistory();

    return;
  }
  if (game.dayManager.getCurrentDay() >= END_DAY) {
    alert("Game Over! Your final score is: " + calculateScore());

    game = stateManager.newGame(GAME_CONFIG);
    updateAllDisplays();
    stateManager.clearHistory();
    stateManager.deleteAutoSave();

    return;
  }

  // Next day
  game.dayManager.advanceDay();
  stateManager.autoSave(game);
  updateAllDisplays();
};

// ====== Save and Load Handlers ======
function handleSave(slot: string): void {
  if (stateManager.trySaveGame(game, slot)) {
    alert(`Game saved to slot ${slot}`);
  } else {
    alert(`Failed to save game to slot ${slot}. Insufficient storage space.`);
  }
}

function handleLoad(): void {
  const slots = StateManager.getSaveSlots();
  if (slots.length === 0) {
    alert("No save slots available.");
    return;
  }

  const slot = prompt(
    `Enter save slot name:\nAvailable slots:\n${
      slots.map((s) => s.replace("save_", "")).join("\n")
    }`,
  );
  if (slot) {
    const loadSave = stateManager.tryLoadSave(slot);
    if (loadSave) {
      game = loadSave;
      updateAllDisplays();
      alert(`Game loaded from slot ${slot}`);
    } else {
      alert(`No save found in slot ${slot}`);
    }
  }
}

function checkForAutoSave(): void {
  if (StateManager.getSaveSlots().includes(StateManager.AUTO_SLOT)) {
    const continueGame = confirm("Do you want to continue where you left off?");
    if (continueGame) {
      game = stateManager.tryLoadSave(StateManager.AUTO_SLOT)!;
      updateAllDisplays();
      alert("Game loaded from auto-save.");
    }
  }
}

// ====== Save and Load Buttons ======
const saveButton = document.createElement("button");
saveButton.textContent = "Save Game";
saveButton.onclick = () => {
  const slot = prompt("Enter save slot name:");
  if (slot) {
    handleSave(slot);
  }
};

const loadButton = document.createElement("button");
loadButton.textContent = "Load Game";
loadButton.onclick = () => {
  handleLoad();
};

// ====== Undo and Redo Buttons ======
const undoButton = document.createElement("button");
undoButton.textContent = "Undo Checkpoint";
undoButton.onclick = () => {
  const undoState = stateManager.getUndo();
  if (undoState !== null) {
    game = undoState;
  } else {
    game = stateManager.getInitialState()!;
    alert("Resetting to initial state. No more days to undo.");
  }
  updateAllDisplays();
};

const redoButton = document.createElement("button");
redoButton.textContent = "Redo Checkpoint";
redoButton.onclick = () => {
  const redoState = stateManager.getRedo();
  if (redoState !== null) {
    game = redoState;
    updateAllDisplays();
  } else {
    alert("No more days to redo.");
  }
};

dayControls.appendChild(dayCounter);
dayControls.appendChild(advanceDayButton);
dayControls.appendChild(saveButton);
dayControls.appendChild(loadButton);
dayControls.appendChild(undoButton);
dayControls.appendChild(redoButton);
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
  description.innerText =
    `Click the cells current or adjacent to the farmer to sow or reap plants. \
    Click the Finish Day button to end your turn, advance the day, and autosave a checkpoint. \
    You can use the Undo and Redo Checkpoint buttons if you want to replay a day/checkpoint. \
    You can also manually create and load saves mid-day, creating more checkpoints for extra granularity. \
    \n
    Plants require water and sunlight to grow. \
    Different plants have different requirements (see below). \
    Don't overcrowd plants or they will die (Black squares, reap to clear). \
    See how high of a score you can get in ${END_DAY} days!`;
  instructions.appendChild(description);
  for (const type in PlantType) {
    if (!isNaN(Number(type))) {
      const typeNum: number = Number(type);
      const description = getPlantDescription(typeNum);
      if (description) {
        instructions.innerHTML += description;
      }
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
      game.player.setCurrentPlantType(PlantType.Corn);
      updatePlantSelect();
      break;
    case "2":
    case "num2":
      game.player.setCurrentPlantType(PlantType.Cactus);
      updatePlantSelect();
      break;
    case "3":
    case "num3":
      game.player.setCurrentPlantType(PlantType.Flower);
      updatePlantSelect();
      break;
  }
});

// ====== Initialize DOM display ======
app.appendChild(title);
app.appendChild(gameGrid);
app.appendChild(gameHud);
app.appendChild(instructions);
updateAllDisplays();

checkForAutoSave(); // Check for auto-save on launch
