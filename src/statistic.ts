export type StatisticName =
  | "playerTraveled" // steps taken
  | "maxGridAlive" // max number of live plants on the grid
  | "plantSown"
  | "plantReaped"
  | "plantDied";
type StatisticValue = number | Map<string, number>;

/** A class for tracking game statistics. */
export class StatisticTracker {
  private statistics: Map<StatisticName, StatisticValue>;

  /**
   * Create a StatisticTracker.
   */
  constructor(statistics?: [StatisticName, number | [string, number][]][]) {
    if (statistics) {
      // Reconstruct from array form
      this.statistics = new Map<StatisticName, StatisticValue>(
        statistics.map(([key, value]) => {
          if (Array.isArray(value)) {
            return [key, new Map<string, number>(value)];
          }
          return [key, value];
        }),
      );
    } else {
      this.statistics = new Map<StatisticName, StatisticValue>([
        ["playerTraveled", 0],
        ["maxGridAlive", 0],
        ["plantSown", new Map<string, number>()],
        ["plantReaped", new Map<string, number>()],
        ["plantDied", new Map<string, number>()],
      ]);
    }
  }

  /** Returns a copy of all statistics as array */
  getStatisticsArray(): [StatisticName, number | [string, number][]][] {
    // Perform deep copy and conversion to array
    const copy = new Map<StatisticName, (number | [string, number][])>();
    for (const [key, value] of this.statistics) {
      copy.set(key, (typeof value === "number") ? value : Array.from(value));
    }
    const arr = Array.from(copy);

    return arr;
  }

  /** Gets the value of a statistic. */
  get(statistic: StatisticName, key?: string): number | null {
    const value = this.statistics.get(statistic);
    if (value === undefined) {
      return null;
    }

    if (typeof value === "number") {
      return value;
    }

    // if defined and not number, must be a maps
    if (value.size === 0) {
      return 0;
    }

    if (key === undefined) {
      // return sum if no key specified
      return Array.from(value.values()).reduce((sum, next) => sum + next);
    }
    // otherwise, return value for key
    return value.get(key) ?? null;
  }

  /** Increments a statistic by 1. */
  increment(statistic: StatisticName, key?: string): void {
    const value = this.statistics.get(statistic);
    if (value === undefined) {
      return;
    }
    if (typeof value === "number") {
      this.statistics.set(statistic, value + 1);
    } else if (key !== undefined) {
      // if not a number, it must be a map
      const currentValue = value.get(key) ?? 0;
      value.set(key, currentValue + 1);
    }
  }

  /** Sets a max statistic if the new value is greater than the current value. */
  setIfMax(statistic: StatisticName, value: number, key?: string): void {
    const currentValue = this.statistics.get(statistic); // checks if stat exists
    if (currentValue !== undefined) {
      if (typeof currentValue === "number") { // checks if stat is a number
        if (value > currentValue) {
          this.statistics.set(statistic, value);
        }
      } else if (key !== undefined && value > (currentValue.get(key) ?? 0)) {
        // since currentValue exists, is defined, and not a number, then it must be a map
        currentValue.set(key, value);
      }
    }
  }
}

/** A subject that can modify statistics tracked by a StatisticTracker. */
export class StatisticSubject {
  protected statisticTracker: StatisticTracker;

  /**
   * Create a StatisticSubject.
   * @param statisticTracker The StatisticTracker to use for tracking statistics.
   */
  constructor(statisticTracker: StatisticTracker) {
    this.statisticTracker = statisticTracker;
  }
}
