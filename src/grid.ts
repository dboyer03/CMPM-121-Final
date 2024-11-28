// grid

import { Position } from "./position.ts";
import { Plant, PlantType } from "./plant.ts";
import { Cell } from "./cell.ts";

export class Grid {
  private width: number;
  private height: number;
  private plants: Map<string, Plant>;
  private cells: Map<string, Cell>;
  private readonly INTERACTION_RANGE = 1; // adjacent cell range
  private readonly MAX_WATER = 5; // max water
  private readonly WATER_RETENTION = 1; // % water retention
  private readonly MAX_SUNLIGHT = 3; // max sunlight

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.plants = new Map();
    this.cells = new Map();

    // init cells
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.cells.set(this.getKey({ x, y }), {
          water: 0,
          sunlight: 0,
        });
      }
    }
  }

  updateEnvironment(): void {
    // update cell resources
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const pos = { x, y };
        const key = this.getKey(pos);
        const cell = this.cells.get(key)!;
        const plant = this.plants.get(key);

        // generate water
        const newWater = Math.floor(Math.random() * 4);
        const newSunlight = Math.floor(Math.random() * 4);

        // subtract water for plant level
        const waterUsage = plant ? plant.growthLevel : 0;

        // update water
        cell.water = Math.max(
          0,
          Math.min(this.MAX_WATER, cell.water + newWater - waterUsage),
        );

        // update sunlight
        cell.sunlight = newSunlight;

        this.cells.set(key, cell);
      }
    }
  }

  getCellProperties(pos: Position): Cell {
    return this.cells.get(this.getKey(pos)) || { water: 0, sunlight: 0 };
  }

  isWithinRange(playerPos: Position, targetPos: Position): boolean {
    const dx = Math.abs(playerPos.x - targetPos.x);
    const dy = Math.abs(playerPos.y - targetPos.y);
    return dx <= this.INTERACTION_RANGE && dy <= this.INTERACTION_RANGE;
  }

  sowPlant(pos: Position, type: PlantType): boolean {
    const key = this.getKey(pos);
    if (!this.plants.has(key)) {
      this.plants.set(key, {
        type,
        growthLevel: 1,
      });
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
