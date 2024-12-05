import { Grid } from "./grid.ts";

export class DayManager {
  private dayCount: number;
  private grid: Grid;
  private postDayCallbacks: (() => void)[];
  private history: string[] = [];
  private future: string[] = [];

  constructor(grid: Grid, dayCount: number = 1) {
    this.dayCount = dayCount;
    this.grid = grid;
    this.postDayCallbacks = [];
    this.grid.updateEnvironment();
    this.saveState();
  }

  addPostDayCallback(fn: () => void): void {
    this.postDayCallbacks.push(fn);
  }

  advanceDay(): void {
    this.dayCount++;
    this.grid.updateEnvironment();
    this.postDayCallbacks.forEach((fn) => fn());
    this.saveState();
    this.autoSave();
  }

  getCurrentDay(): number {
    return this.dayCount;
  }

  serialize(): string {
    return JSON.stringify({
      dayCount: this.dayCount,
      gridState: Array.from(this.grid.getState()),
      plants: Array.from(this.grid.getPlants()),
    });
  }

  static deserialize(data: string, grid: Grid): DayManager {
    const parsed = JSON.parse(data);
    const dayManager = new DayManager(grid, parsed.dayCount);
    grid.setState(new Uint8Array(parsed.gridState));
    grid.setPlants(new Map(parsed.plants));
    return dayManager;
  }

  private autoSave(): void {
    const serializedState = this.serialize();
    localStorage.setItem("save_auto", serializedState);
  }

  public saveState(): void {
    this.history.push(this.serialize());
    this.future = []; // Clear the future states when a new action is taken
  }

  undo(): boolean {
    if (this.history.length > 1) {
      this.future.push(this.history.pop()!);
      const previousState = this.history[this.history.length - 1];
      this.loadState(previousState);
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.future.length > 0) {
      const nextState = this.future.pop()!;
      this.history.push(nextState);
      this.loadState(nextState);
      return true;
    }
    return false;
  }

  private loadState(state: string): void {
    const parsed = JSON.parse(state);
    this.dayCount = parsed.dayCount;
    this.grid.setState(new Uint8Array(parsed.gridState));
    this.grid.setPlants(new Map(parsed.plants));
  }
}
