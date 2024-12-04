// game state

import { Grid } from "./grid.ts";

export class DayManager {
  private dayCount: number;
  private grid: Grid;

  constructor(grid: Grid) {
    this.dayCount = 1;
    this.grid = grid;
    this.grid.updateEnvironment();
  }

  advanceDay(): void {
    this.dayCount++;
    this.grid.updateEnvironment();
  }

  getCurrentDay(): number {
    return this.dayCount;
  }
}
