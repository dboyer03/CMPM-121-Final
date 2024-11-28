// player

import { Position } from "./position.ts";
import { Grid } from "./grid.ts";
import { PlantAction, PlantType } from "./plant.ts";

export class Player {
  private position: Position;
  private grid: Grid;

  constructor(grid: Grid, startPos: Position) {
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
      return true;
    }
    return false;
  }

  getPosition(): Position {
    return { ...this.position };
  }

  interactWithPlant(action: PlantAction, targetPos: Position): boolean {
    if (!this.grid.isWithinRange(this.position, targetPos)) {
      return false;
    }

    if (action === PlantAction.SOW) {
      return this.grid.sowPlant(targetPos, PlantType.GREEN_CIRCLE);
    } else {
      return this.grid.reapPlant(targetPos) !== null;
    }
  }
}
