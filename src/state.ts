import { StatisticName, StatisticTracker } from "./statistic.ts";
import { Grid } from "./grid.ts";
import { Player } from "./player.ts";
import { DayManager } from "./day.ts";
import { Plant } from "./plant.ts";
import { Position } from "./position.ts";

export interface GameConfig {
  // All config should be readonly
  readonly gridWidth: number;
  readonly gridHeight: number;
}

export interface Game {
  readonly config: GameConfig;
  statTracker: StatisticTracker;
  grid: Grid;
  dayManager: DayManager;
  player: Player;
}

interface SaveData {
  config: GameConfig;
  statistics: [StatisticName, (number | [string, number][])][];
  gridState: number[];
  plants: [string, Plant][];
  playerPosition: Position;
  dayCount: number;
}

export class StateManager {
  static readonly AUTO_SLOT: string = "auto";
  private history: string[];
  private future: string[];

  constructor() {
    this.history = [];
    this.future = [];
  }

  newGame(config: GameConfig): Game {
    this.history = [];

    const game: Partial<Game> = { config };
    game.statTracker = new StatisticTracker();
    game.grid = new Grid(config.gridWidth, config.gridHeight, game.statTracker);
    game.dayManager = new DayManager(game.grid);
    game.player = new Player(game.grid, { x: 0, y: 0 }, game.statTracker);

    const fullGame: Game = game as Game;
    this.saveToHistory(fullGame); // save initial state

    return fullGame;
  }

  private static serialize(game: Game): string {
    const saveData: SaveData = {
      config: game.config,
      statistics: game.statTracker.getStatisticsArray(),
      gridState: Array.from(game.grid.getState()),
      plants: Array.from(game.grid.getPlants()),
      playerPosition: game.player.getPosition(),
      dayCount: game.dayManager.getCurrentDay(),
    };
    return JSON.stringify(saveData);
  }

  private static deserialize(data: string): Game {
    const saveData: SaveData = JSON.parse(data);
    const game: Partial<Game> = { config: saveData.config };

    game.statTracker = new StatisticTracker(saveData.statistics);
    game.grid = new Grid(
      saveData.config.gridWidth,
      saveData.config.gridHeight,
      game.statTracker,
    );
    game.grid.setState(new Uint8Array(saveData.gridState));
    game.grid.setPlants(new Map(saveData.plants));
    game.dayManager = new DayManager(game.grid, saveData.dayCount, true);
    game.player = new Player(
      game.grid,
      saveData.playerPosition,
      game.statTracker,
    );

    return game as Game;
  }

  private saveToHistory(game: Game): StateManager {
    this.history.push(StateManager.serialize(game));
    this.future = []; // Clear the future states when a new save is made
    return this;
  }

  getUndo(): Game | null {
    if (this.history.length > 0) {
      const previousState: string = this.history.pop()!;
      this.future.push(previousState);
      return StateManager.deserialize(previousState);
    }
    return null;
  }

  getRedo(): Game | null {
    if (this.future.length > 0) {
      const nextState = this.future.pop()!;
      this.history.push(nextState);
      return StateManager.deserialize(nextState);
    }
    return null;
  }

  trySaveGame(game: Game, slot: string): boolean {
    this.saveToHistory(game);
    const serializedHistory = JSON.stringify(this.history);
    try {
      localStorage.setItem(`save_${slot}`, serializedHistory);
    } catch (e) {
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        return false;
      }
    }

    return true;
  }

  autoSave(game: Game): void {
    if (!this.trySaveGame(game, StateManager.AUTO_SLOT)) {
      alert("Auto-save failed due to insufficient storage space.");
    }
  }

  static getSaveSlots(): string[] {
    return Object.keys(localStorage).filter((key) => key.startsWith("save_"))
      .map((key) => key.slice(5));
  }

  tryLoadSave(slot: string): Game | null {
    const saveData = localStorage.getItem(`save_${slot}`);
    if (saveData === null) return null;
    this.history = JSON.parse(saveData);
    const currentState: string | undefined = this.history.pop();

    return (currentState !== undefined)
      ? StateManager.deserialize(currentState)
      : null;
  }

  clearSaves(): void {
    this.history = [];
    this.future = [];
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("save_")) {
        localStorage.removeItem(key);
      }
    });
  }
}
