// player

import { Position } from "./position.ts";
import { Grid } from "./grid.ts";
import { PlantAction } from "./plant.ts";
import { StatisticSubject, StatisticTracker } from "./statistic.ts";

export class Player extends StatisticSubject {
  private position: Position;
  private grid: Grid;
  private currentPlantType: string = "green-circle";

  constructor(grid: Grid, startPos: Position, statTracker: StatisticTracker) {
    super(statTracker);
    this.grid = grid;
    this.position = startPos;
  }

  move(direction: "up" | "down" | "left" | "right"): boolean {
    const newPos: Position = { ...this.position };

    switch (direction) {
      case "up":
        newPos.y--;
        break;
      case "down":
        newPos.y++;
        break;
      case "left":
        newPos.x--;
        break;
      case "right":
        newPos.x++;
        break;
    }

    if (this.grid.isValidPosition(newPos)) {
      this.position = newPos;
      this.statisticTracker.increment("playerTraveled");
      return true;
    }
    return false;
  }

  getPosition(): Position {
    return { ...this.position };
  }

  setPlantType(type: string) {
    this.currentPlantType = type;
  }

  getCurrentPlantType(): string {
    return this.currentPlantType;
  }

  interactWithPlant(action: PlantAction, targetPos: Position): boolean {
    if (!this.grid.isWithinRange(this.position, targetPos)) {
      return false;
    }

    if (action === PlantAction.SOW) {
      return this.grid.sowPlant(targetPos, this.currentPlantType);
    } else {
      return this.grid.reapPlant(targetPos) !== null;
    }
  }
}
