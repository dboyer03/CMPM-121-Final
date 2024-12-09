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

// localization
import { Language, setLanguage, t, tl } from "./translation.ts";
import plantTranslations from "./plant-translation.json" with { type: "json" };

import "./style.css";
import "./game.css";

async function main() {
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
  const EVENT_DAY = data.events.drought_day;

  const GAME_CONFIG: GameConfig = {
    gridWidth: GRID_SIZE,
    gridHeight: GRID_SIZE,
  };

  const app = document.querySelector<HTMLDivElement>("#app")!;

  // ====== Title ======
  document.title = GAME_NAME;
  const title = document.createElement("h1");
  title.textContent = t("game_name");

  // ====== Initialize Game State ======
  const stateManager: StateManager = new StateManager(GAME_CONFIG);
  let game: Game = stateManager.newGame();
  let CURRENT_WEATHER = game.dayManager.getCurrentWeather();

  function weatherSelect(): string {
    const WEATHER_OPTIONS = [
      { weather: "sunny", weight: data.starting_conditions.sunny_chances },
      { weather: "rainy", weight: data.starting_conditions.rainy_chances },
      { weather: "hot", weight: data.starting_conditions.hot_chances },
    ];

    const totalWeight = WEATHER_OPTIONS.reduce(
      (sum, WEATHER_OPTIONS) => sum + WEATHER_OPTIONS.weight,
      0,
    );
    const random = Math.random() * totalWeight;

    let cumulativeWeight = 0;
    for (const option of WEATHER_OPTIONS) {
      cumulativeWeight += option.weight;
      if (random <= cumulativeWeight) {
        return option.weather;
      }
    }

    throw new Error("Invalid weight configuration");
  }

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

  function updatePlantSelect(): void {
    const plantTypeDisplay = document.querySelector(".current-plant-type");
    if (plantTypeDisplay) {
      plantTypeDisplay.textContent = `${t("current_plant")}: ${
        tl(plantTranslations.names, game.player.getCurrentPlantType())
      }`;
    }
  }
  gameHud.appendChild(plantTypeDisplay);

  // ====== HUD: Score ======
  const scoreDisplay = document.createElement("p");
  scoreDisplay.className = "score";

  function updateScoreDisplay(): void {
    scoreDisplay.textContent = t("score", { score: calculateScore() });
  }
  gameHud.appendChild(scoreDisplay);

  const weatherDisplay = document.createElement("p");
  weatherDisplay.className = "weather";
  function updateWeatherDisplay(): void {
    weatherDisplay.textContent =
      `Current Weather: ${game.dayManager.getCurrentWeather()}`;
  }
  gameHud.appendChild(weatherDisplay);

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
    updatePlantSelect();

    // Update the score display
    updateScoreDisplay();

    // Update the day button text
    advanceDayButton.textContent = t("finish_day");

    // Update save/load button text
    // FIXME: Using prompt and not button text. Also need to translate the prompt text.
    // saveButton.textContent = t("save_game_prompt");
    // loadButton.textContent = t("load_game_prompt");

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
    updateWeatherDisplay();
  }

  advanceDayButton.onclick = () => {
    // Game Over: Reached Score Goal
    if (calculateScore() >= SCORE_GOAL) {
      alert(
        "Game Over! You surpassed the goal! Youe final score: " +
          calculateScore(),
      );

      game = stateManager.newGame(GAME_CONFIG);
      updateAllDisplays();
      stateManager.clearHistory();

      return;
    }

    // Game Over: Reached End Day
    if (game.dayManager.getCurrentDay() >= END_DAY) {
      alert("Game Over! Your final score is: " + calculateScore());

      game = stateManager.newGame(GAME_CONFIG);
      updateAllDisplays();
      stateManager.clearHistory();
      stateManager.deleteAutoSave();

      return;
    }

    // Next day
    CURRENT_WEATHER = weatherSelect();
    game.dayManager.advanceDay(CURRENT_WEATHER, EVENT_DAY);
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
        slots
          .map((s) => s.replace("save_", ""))
          .join("\n")
      }`,
    );
    if (slot) {
      const loadSave = stateManager.tryLoadSave(slot);
      if (loadSave) {
        game = loadSave;
        updateAllDisplays();
        alert(`Game loaded from slot ${slot}`);
      } else {
        alert(`No save found for slot ${slot}`);
      }
    }
  }

  function checkForAutoSave(): void {
    if (StateManager.getSaveSlots().includes(StateManager.AUTO_SLOT)) {
      const continueGame = confirm(
        "Do you want to continue where you left off?",
      );
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

  dayControls.append(
    dayCounter,
    advanceDayButton,
    saveButton,
    loadButton,
    undoButton,
    redoButton,
  );
  gameHud.appendChild(dayControls);

  // ====== Instructions ======
  const instructions = document.createElement("div");
  instructions.id = "instructions-debug"; // Updated ID for clarity

  // Create description and controls dynamically
  const description = document.createElement("p");
  description.id = "instructions-description"; // Add an ID for updating dynamically
  instructions.appendChild(description);

  function updateInstructions(): void {
    // Locate the instructions container
    const instructions = document.querySelector(
      "#instructions-debug",
    ) as HTMLDivElement;

    if (instructions) {
      // Clear existing content
      instructions.innerHTML = `<h2>${t("controls")}</h2><hr>`;

      // Add translated controls dynamically
      const controls: Map<string, string> = new Map([
        [t("left_click"), t("controls_left_click")],
        [t("right_click"), t("controls_right_click")],
        [t("arrowsWasd"), t("controls_movement")],
        [t("cycle_plant"), t("controls_switch")],
      ]);

      for (const [input, action] of controls) {
        instructions.innerHTML += `<p><strong>${input}</strong>: ${action}</p>`;
      }

      // Add description text dynamically
      instructions.innerHTML += `<p id="instructions-description">${
        t("description", { end_day: END_DAY })
      }</p>`;

      // Update plant-specific instructions
      for (const type in PlantType) {
        if (!isNaN(Number(type))) {
          const typeNum: number = Number(type);
          if (typeNum === PlantType.Withered) continue;
          const description = getPlantDescription(typeNum);
          if (description) {
            instructions.innerHTML += description;
          }
        }
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
    updateText();
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
      case "-":
        game.player.cyclePlantType(false);
        updatePlantSelect();
        break;
      case "2":
      case "num2":
      case "=":
        game.player.cyclePlantType(true);
        updatePlantSelect();
        break;
    }
  });

  // ====== Initialize DOM display ======
  app.append(
    title,
    gameGrid,
    gameHud,
    instructions,
  );

  updatePlantSelect();
  updateAllDisplays();
  updateText();

  checkForAutoSave(); // Check for auto-save on launch
}

main();
