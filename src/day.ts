import { Grid } from "./grid.ts";
import { StatisticTracker } from "./statistic.ts";
import { plantProcessor } from "./plant.ts";

export class DayManager {
  private dayCount: number;
  private grid: Grid;
  private statTracker: StatisticTracker;

  constructor(
    grid: Grid,
    statTracker: StatisticTracker,
    dayCount: number = 1,
    preserveEnvironment: boolean = false,
  ) {
    this.dayCount = dayCount;
    this.grid = grid;
    this.statTracker = statTracker;

    // preserveEnvironment flag can be used when loading a save state
    //   false by default to allow environment to initialize
    if (!preserveEnvironment) this.grid.updateEnvironment();
  }

  advanceDay(): void {
    this.dayCount++;
    this.grid.updateEnvironment();
    plantProcessor(this.grid, this.statTracker);
  }

  getCurrentDay(): number {
    return this.dayCount;
  }
}
