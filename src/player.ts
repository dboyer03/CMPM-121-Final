// player

import { Position } from "./position.ts";
import { Grid } from "./grid.ts";

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
}
