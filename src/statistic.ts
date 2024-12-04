export type StatisticName =
  | "playerTraveled" // steps taken
  | "maxGridFilled" // max number of live plants on the grid
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
  constructor() {
    this.statistics = new Map<StatisticName, StatisticValue>([
      ["playerTraveled", 0],
      ["maxGridFilled", 0],
      ["plantSown", new Map<string, number>()],
      ["plantReaped", new Map<string, number>()],
      ["plantDied", new Map<string, number>()],
    ]);
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

    if (Object.hasOwn(value, "size")) {
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

    return null;
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
      const count = value.get(key) ?? 0;
      value.set(key, count + 1);
    }
  }

  /** Sets a max statistic if the new value is greater than the current value. */
  setMax(statistic: StatisticName, value: number, key?: string): void {
    const currentValue = this.get(statistic, key); // checks if stat exists
    if (currentValue !== null && value > currentValue) {
      if (typeof this.statistics.get(statistic) === "number") {
        this.statistics.set(statistic, value);
      } else if (key !== undefined) {
        // since currentValue exists, is not null, and not a number, it must be a map
        (this.statistics.get(statistic)! as Map<string, number>).set(
          key,
          value,
        );
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
