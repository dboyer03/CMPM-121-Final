import { StatisticName, StatisticTracker } from "./statistic.ts";
import { Grid } from "./grid.ts";
import { Player } from "./player.ts";
import { DayManager } from "./day.ts";
import { PlantType } from "./plant.ts";
import { Position } from "./position.ts";

export interface GameConfig {
  // All config should be readonly
  readonly gridWidth: number;
  readonly gridHeight: number;
  //readonly startingPosition: Position;
}

export interface Game {
  statTracker: StatisticTracker;
  grid: Grid;
  dayManager: DayManager;
  player: Player;
  weather: string,
}

interface Checkpoint {
  statistics: [StatisticName, (number | [PlantType, number][])][];
  gridState: string; // base64-encoded Uint8Array of 4-byte structs represent cell and plant states
  playerPosition: Position;
  dayCount: number;
  weather: string;
}

interface SaveData {
  config: GameConfig;
  history: Checkpoint[];
}

export class StateManager {
  static readonly AUTO_SLOT: string = "auto";
  private history: Checkpoint[];
  private current: number; // points to index of current save state
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.history = [];
    this.current = -1;
    this.config = config;
  }

  isGameLoaded(): boolean { // auto-initializes after running newGame
    return this.history.length > 0 && this.current >= 0;
  }

  private static createCheckpoint(game: Game): Checkpoint {
    const checkpoint: Checkpoint = {
      statistics: game.statTracker.getStatisticsArray(),
      gridState: btoa(
        game.grid.getState().reduce(
          (acc, val) => acc + String.fromCharCode(val),
          "",
        ),
      ),
      playerPosition: game.player.getPosition(),
      dayCount: game.dayManager.getCurrentDay(),
      weather: game.dayManager.getCurrentWeather(),
    };

    return checkpoint;
  }

  private loadCheckpoint(checkpoint: Checkpoint): Game {
    const game: Partial<Game> = {};

    game.statTracker = new StatisticTracker(checkpoint.statistics);
    game.grid = new Grid(
      this.config!.gridWidth,
      this.config!.gridHeight,
      game.statTracker,
    );
    game.grid.setState(
      Uint8Array.from(atob(checkpoint.gridState), (c) => c.charCodeAt(0)),
    );
    game.dayManager = new DayManager(game.grid, checkpoint.dayCount, checkpoint.weather, true);
    console.log(checkpoint.weather);
    game.player = new Player(
      game.grid,
      checkpoint.playerPosition,
      game.statTracker,
    );

    return game as Game;
  }

  private pushToHistory(game: Game): StateManager {
    if ((this.current + 1) < this.history.length) {
      // if it exists, remove future
      this.history.splice(this.current + 1, Infinity);
    }
    this.history.push(StateManager.createCheckpoint(game));
    this.current = this.history.length - 1;
    return this;
  }

  newGame(config?: GameConfig): Game {
    if (config !== undefined) config = this.config;
    this.history = [];

    const game: Partial<Game> = {};
    game.statTracker = new StatisticTracker();
    game.grid = new Grid(
      this.config.gridWidth,
      this.config.gridHeight,
      game.statTracker,
    );
    game.dayManager = new DayManager(game.grid);
    game.player = new Player(game.grid, { x: 0, y: 0 }, game.statTracker);

    const fullGame: Game = game as Game;
    this.pushToHistory(fullGame); // save initial state

    return fullGame;
  }

  getInitialState(): Game | null {
    if (this.isGameLoaded()) {
      return this.loadCheckpoint(this.history[0]);
    }
    throw new Error("No game loaded.");
  }

  getUndo(): Game | null {
    if (this.current > 0) {
      return this.loadCheckpoint(this.history[--this.current]);
    }
    return null;
  }

  getRedo(): Game | null {
    if (
      this.history.length > 0 &&
      ((this.current + 1) < this.history.length)
    ) {
      return this.loadCheckpoint(this.history[++this.current]);
    }
    return null;
  }

  clearHistory(): void {
    this.history = [];
    this.current = -1;
  }

  trySaveGame(game: Game, slot: string): boolean {
    this.pushToHistory(game);
    const saveData: SaveData = {
      config: this.config,
      history: this.history,
    };
    try {
      localStorage.setItem(`save_${slot}`, JSON.stringify(saveData));
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
    const jsonSave: string | null = localStorage.getItem(`save_${slot}`);
    if (jsonSave === null) return null;

    const saveData: SaveData = JSON.parse(jsonSave);
    if (saveData === null) return null;
    this.config = saveData.config;
    this.history = saveData.history;
    this.current = this.history.length - 1;

    return (this.isGameLoaded())
      ? this.loadCheckpoint(this.history[this.current])
      : null;
  }
}
