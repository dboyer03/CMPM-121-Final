import { Grid } from "./grid.ts";

export class DayManager {
  private dayCount: number;
  private grid: Grid;

  constructor(
    grid: Grid,
    dayCount: number = 1,
    preserveEnvironment: boolean = false,
  ) {
    this.dayCount = dayCount;
    this.grid = grid;

    // preserveEnvironment flag can be used when loading a save state
    // false by default to allow environment initialize
    if (!preserveEnvironment) this.grid.updateEnvironment();
  }

  advanceDay(): void {
    this.dayCount++;
    this.grid.updateEnvironment();
  }

  getCurrentDay(): number {
    return this.dayCount;
  }
}
