// ====== Main + Imports ======
import { Game, GameConfig, StateManager } from "./state.ts";
import { getCssName, PlantAction, PlantType, PlantTypeInfo } from "./plant.ts";
import { t, setLanguage, Language } from "./translation.ts";


import "./style.css";
import "./game.css";

// ====== Consts ======
const GAME_NAME = "CMPM 121 Final Project - Group 33";
const GRID_SIZE = 10;
const END_DAY = 31;
const GAME_CONFIG: GameConfig = {
  gridWidth: GRID_SIZE,
  gridHeight: GRID_SIZE,
};

const app = document.querySelector<HTMLDivElement>("#app")!;

// ====== Title ======
document.title = GAME_NAME;
const title = document.createElement("h1");
title.textContent = t("game_name");;

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
          getCssName(plant.type)
        } level-${plant.growthLevel}`;
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

// ====== Game HUD ======
const gameHud = document.createElement("div");
gameHud.id = "game-hud";

// ====== HUD: Selected Plant Type ======

const plantTypeDisplay = document.createElement("div");
plantTypeDisplay.className = "current-plant-type";
const initialTypeName = PlantTypeInfo[game.player.getCurrentPlantType()].name;
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
  scoreDisplay.textContent = t("score", { score: calculateScore() });
}
gameHud.appendChild(scoreDisplay);

// ====== HUD: Day Button ======
const dayControls = document.createElement("div");
dayControls.className = "controls";

const dayCounter = document.createElement("div");
dayCounter.textContent = t("day", { day: game.dayManager.getCurrentDay() });
dayCounter.style.marginBottom = "10px";

const advanceDayButton = document.createElement("button");
advanceDayButton.textContent = "Finish Day";

function updateDayDisplay(): void {
  dayCounter.textContent = t("day", { day: game.dayManager.getCurrentDay() });
}

function updateText(): void {
  // Update the game title
  title.textContent = t("game_name");

  // Update the plant type display
  const plantTypeDisplay = document.querySelector(".current-plant-type");
  if (plantTypeDisplay) {
    const typeName = PlantTypeInfo[game.player.getCurrentPlantType()].name;
    plantTypeDisplay.textContent = `${t("current_plant")}: ${typeName}`;
  }

  // Update the day button text
  advanceDayButton.textContent = t("finish_day");

  // Update save/load button text
  saveButton.textContent = t("save_game_prompt");
  loadButton.textContent = t("load_game_prompt");

  // Update undo/redo button text
  undoButton.textContent = t("undo_checkpoint");
  redoButton.textContent = t("redo_checkpoint");

  // Update instructions text
 updateInstructions();
}

function updateAllDisplays(): void {
  updateGridDisplay();
  updateDayDisplay();
  updateScoreDisplay();
  updateText();
  updateInstructions();
}

advanceDayButton.onclick = () => {
  // Game Over
  if (game.dayManager.getCurrentDay() >= END_DAY) {
    alert("Game Over! Your final score is: " + calculateScore());

    game = stateManager.newGame(GAME_CONFIG);
    updateAllDisplays();
    stateManager.clearHistory();

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
    updateAllDisplays();
  } else {
    game = stateManager.getInitialState()!;
    alert("Reset to initial state. No more days to undo.");
  }
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
instructions.id = "instructions-debug"; // Updated ID for clarity

// Create description and controls dynamically
const description = document.createElement("p");
description.id = "instructions-description"; // Add an ID for updating dynamically

instructions.innerHTML = `<h2>${t("controls")}</h2><hr>`;

const controls: { [key: string]: string } = {
  "Left Click": t("controls_left_click"),
  "Right Click": t("controls_right_click"),
  "WASD / Arrow Keys": t("controls_movement"),
  "1 / 2 / 3": t("controls_switch"),
};

// Add controls dynamically with line breaks
instructions.innerHTML += Object.entries(controls)
  .map(([input, action]) => `<p><strong>${input}</strong>: ${action}</p>`)
  .join("\n");

// Add the description dynamically
description.innerText = t("description", { end_day: END_DAY });
instructions.appendChild(description);

// Add plant-specific instructions
let i = 1;
for (const info in PlantTypeInfo) {
  if (info === "withered") continue;
  instructions.innerHTML += `<p><strong>(${i}) ${
    PlantTypeInfo[info].name
  }</strong>:<br>
  ${t("plant_instructions.plant_details", {
    index: i,
    name: PlantTypeInfo[info].name,
    water: PlantTypeInfo[info].waterToGrow,
    sunlight: PlantTypeInfo[info].sunToGrow,
    crowding: PlantTypeInfo[info].maxCrowding,
    maxGrowth: PlantTypeInfo[info].maxGrowth,
  })}</p>`;
  i++;
}

function updateInstructions(): void {
  // Locate the instructions container
  const instructions = document.querySelector("#instructions-debug") as HTMLDivElement;

  if (instructions) {
    // Clear existing content
    instructions.innerHTML = `<h2>${t("controls")}</h2><hr>`;

    // Add translated controls dynamically
    const controls: { [key: string]: string } = {
      "Left Click": t("controls_left_click"),
      "Right Click": t("controls_right_click"),
      "WASD / Arrow Keys": t("controls_movement"),
      "1 / 2 / 3": t("controls_switch"),
    };

    instructions.innerHTML += Object.entries(controls)
      .map(([input, action]) => `<p><strong>${input}</strong>: ${action}</p>`)
      .join("\n");

    // Add description text dynamically
    instructions.innerHTML += `<p id="instructions-description">${t("description", { end_day: END_DAY })}</p>`;

    // Add plant-specific instructions
    let i = 1;
    for (const key in PlantTypeInfo) {
      if (key === "withered") continue;
      const plantInfo = PlantTypeInfo[key];
      instructions.innerHTML += `<p><strong>(${i}) ${plantInfo.name}</strong>:<br>
        ${t("plant_instructions.plant_details", {
          index: i,
          name: plantInfo.name,
          water: plantInfo.waterToGrow,
          sunlight: plantInfo.sunToGrow,
          crowding: plantInfo.maxCrowding,
          maxGrowth: plantInfo.maxGrowth,
        })}</p>`;
      i++;
    }
  }
}



const languageSelector = document.createElement("select");
["en", "zh", "ar"].forEach((lang) => {
  const option = document.createElement("option");
  option.value = lang;
  option.textContent = lang.toUpperCase();
  languageSelector.appendChild(option);
});

languageSelector.onchange = (e) => {
  const selectedLanguage = (e.target as HTMLSelectElement).value as Language;
  setLanguage(selectedLanguage);

  // Update text direction for RTL languages
  document.documentElement.dir = selectedLanguage === "ar" ? "rtl" : "ltr";

  // Refresh all dynamic text
  updateAllDisplays();
};

document.body.insertBefore(languageSelector, app);


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
      game.player.setPlantType(PlantType.GREEN_CIRCLE);
      updatePlantSelect();
      break;
    case "2":
    case "num2":
      game.player.setPlantType(PlantType.YELLOW_TRIANGLE);
      updatePlantSelect();
      break;
    case "3":
    case "num3":
      game.player.setPlantType(PlantType.PURPLE_SQUARE);
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
