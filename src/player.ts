// player

import { Position } from "./position.ts";
import { Grid } from "./grid.ts";
import { PlantAction, PlantType } from "./plant.ts";
import { StatisticSubject, StatisticTracker } from "./statistic.ts";

export class Player extends StatisticSubject {
  private position: Position;
  private grid: Grid;
  private currentPlantType: PlantType = PlantType.GREEN_CIRCLE;

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

  setPlantType(type: PlantType) {
    this.currentPlantType = type;
  }

  getCurrentPlantType(): PlantType {
    return this.currentPlantType;
  }

  interactWithPlant(action: PlantAction, targetPos: Position): boolean {
    if (!this.grid.isWithinRange(this.position, targetPos)) {
      return false;
    }

    let result = false;
    if (action === PlantAction.SOW) {
      result = this.grid.sowPlant(targetPos, this.currentPlantType);
    } else {
      result = this.grid.reapPlant(targetPos) !== null;
    }

    return result;
  }
}
