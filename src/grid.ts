// grid

import { Position } from "./position.ts";
import { Plant } from "./plant.ts";

export class Grid {
  private width: number;
  private height: number;
  private plants: Map<string, Plant>;
  private readonly INTERACTION_RANGE = 1; // adjacent cells

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.plants = new Map();
  }

  isWithinRange(playerPos: Position, targetPos: Position): boolean {
    const dx = Math.abs(playerPos.x - targetPos.x);
    const dy = Math.abs(playerPos.y - targetPos.y);
    return dx <= this.INTERACTION_RANGE && dy <= this.INTERACTION_RANGE;
  }

  sowPlant(pos: Position, type: number): boolean {
    const key = this.getKey(pos);
    if (!this.plants.has(key)) {
      this.plants.set(key, { type, growthLevel: 1 });
      return true;
    }
    return false;
  }

  reapPlant(pos: Position): Plant | null {
    const key = this.getKey(pos);
    const plant = this.plants.get(key);
    if (plant) {
      this.plants.delete(key);
      return plant;
    }
    return null;
  }

  getPlant(pos: Position): Plant | undefined {
    return this.plants.get(this.getKey(pos));
  }

  isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.width &&
      pos.y >= 0 && pos.y < this.height;
  }

  getKey(pos: Position): string {
    return `${pos.x},${pos.y}`;
  }
}
