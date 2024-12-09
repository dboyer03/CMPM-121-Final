import { Grid } from "./grid.ts";
import { StatisticTracker } from "./statistic.ts";
import { plantProcessor } from "./plant.ts";

export class DayManager {
  private dayCount: number;
  private grid: Grid;
  private statTracker: StatisticTracker;
  private weather: string;

  constructor(
    grid: Grid,
    statTracker: StatisticTracker,
    dayCount: number = 1,
    weather: string = "sunny",
    preserveEnvironment: boolean = false,
  ) {
    this.dayCount = dayCount;
    this.grid = grid;
    this.statTracker = statTracker;
    this.weather = weather;

    // preserveEnvironment flag can be used when loading a save state
    // false by default to allow environment initialize
    if (!preserveEnvironment) this.grid.updateEnvironment(weather);
  }

  advanceDay(weather: string): void {
    this.dayCount++;
    this.grid.updateEnvironment(weather);
    this.weather = weather;
    plantProcessor(this.grid, this.statTracker);
  }

  getCurrentDay(): number {
    return this.dayCount;
  }

  getCurrentWeather(): string {
    return this.weather;
  }
}
