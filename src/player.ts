// player

import { Position } from "./position.ts";
import { Grid, GridAction } from "./grid.ts";
import { PlantAction, PlantType, tryReap, trySow } from "./plant.ts";
import { StatisticSubject, StatisticTracker } from "./statistic.ts";

function wrapNumber(value: number, min: number, max: number): number {
  const range = max - min + 1;
  return ((value - min) % range + range) % range + min;
}

export class Player extends StatisticSubject {
  private position: Position;
  private grid: Grid;
  private currentPlantType: PlantType = PlantType.Corn;

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

  setCurrentPlantType(type: PlantType) {
    this.currentPlantType = type;
  }

  getCurrentPlantType(): PlantType {
    return this.currentPlantType;
  }

  cyclePlantType(up: boolean): void {
    const plantTypes = Math.floor((Object.keys(PlantType).length - 1) / 2);
    const direction = up ? 1 : -1;
    this.currentPlantType = wrapNumber(
      this.currentPlantType + direction,
      0,
      plantTypes - 1,
    );

    // skip non-plantable types
    if (
      this.currentPlantType === PlantType.NONE ||
      this.currentPlantType === PlantType.Weed ||
      this.currentPlantType === PlantType.Withered
    ) {
      this.cyclePlantType(up);
    }
  }

  // FIXME: Consider refactoring to support other types of interactions.
  //   For now, only plant interactions are supported but have been extracted to plant.ts
  interactWithPlant(action: GridAction, targetPos: Position): boolean {
    if (!this.grid.isWithinRange(this.position, targetPos)) {
      return false;
    }

    let result = false;
    if (action === PlantAction.SOW) {
      result = trySow(this.grid, targetPos, this.currentPlantType);
      if (result) {
        this.statisticTracker.increment("plantSown", this.currentPlantType);
      }
    } else {
      const originalType: PlantType = this.grid.getPlant(targetPos).type;
      result = tryReap(this.grid, targetPos);
      if (
        result &&
        originalType !== PlantType.Withered &&
        originalType !== PlantType.Weed
      ) {
        this.statisticTracker.increment("plantReaped", this.currentPlantType);
      }
    }

    return result;
  }
}
