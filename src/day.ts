import { Grid } from "./grid.ts";

export class DayManager {
  private dayCount: number;
  private grid: Grid;
  private postDayCallbacks: (() => void)[];

  constructor(grid: Grid) {
    this.dayCount = 1;
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
}
