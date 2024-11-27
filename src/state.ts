// game state

import { Grid } from "./grid.ts";

export class GameState {
  private dayCount: number = 0;
  private grid: Grid;

  constructor(grid: Grid) {
    this.dayCount = 0;
    this.grid = grid;
  }

  advanceDay(): void {
    this.dayCount++;
    this.grid.updateEnvironment();
  }

  getCurrentDay(): number {
    return this.dayCount;
  }
}
