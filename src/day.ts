import { Grid } from "./grid.ts";

export class DayManager {
  private dayCount: number;
  private grid: Grid;
  private postDayCallbacks: (() => void)[];

  constructor(grid: Grid, dayCount: number = 1) {
    this.dayCount = dayCount;
    this.grid = grid;
    this.postDayCallbacks = [];
    this.grid.updateEnvironment();
  }

  addPostDayCallback(fn: () => void): void {
    this.postDayCallbacks.push(fn);
  }

  advanceDay(): void {
    this.dayCount++;
    this.grid.updateEnvironment();
    this.postDayCallbacks.forEach((fn) => fn());
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
    const gameState = new DayManager(grid, parsed.dayCount);
    grid.setState(new Uint8Array(parsed.gridState));
    grid.setPlants(new Map(parsed.plants));
    return gameState;
  }
}
