// grid

import { Position } from "./position.ts";
import { canGrow, Plant, PlantTypeInfo } from "./plant.ts";
import { Cell } from "./cell.ts";

export class Grid {
  private width: number;
  private height: number;
  private plants: Map<string, Plant>;
  private cells: Map<string, Cell>;
  private readonly INTERACTION_RANGE = 1; // adjacent cell range
  private readonly MAX_WATER = 5; // max water
  private readonly MAX_RAIN = 2; // max water increase per tick
  private readonly MIN_WATER_RETENTION = 0.5; // % water retention
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

        // update water (rain)
        if (cell.water < this.MAX_WATER) {
          cell.water = Math.min(
            Math.round(
              cell.water * Math.min(Math.random(), this.MIN_WATER_RETENTION),
            ) +
              Math.ceil(Math.random() * this.MAX_RAIN),
            this.MAX_WATER,
          );
        }

        // update sunlight
        cell.sunlight = Math.floor(Math.random() * (this.MAX_SUNLIGHT + 1));

        // update plant growth
        if (plant && canGrow(plant, cell.water, cell.sunlight)) {
          plant.growthLevel++;
          cell.water -= PlantTypeInfo[plant.type].waterToGrow;
        }

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

  sowPlant(pos: Position, type: string): boolean {
    const key = this.getKey(pos);
    const cell = this.getCellProperties(pos);
    const plant = {
      type,
      growthLevel: 1,
    };
    if (!this.plants.has(key) && canGrow(plant, cell.water, cell.sunlight)) {
      this.plants.set(key, plant);
      cell.water -= PlantTypeInfo[type].waterToGrow;
      return true;
    }
    return false;
  }

  reapPlant(pos: Position): Plant | null {
    const key = this.getKey(pos);
    const plant = this.plants.get(key);
    if (plant && plant.growthLevel === PlantTypeInfo[plant.type].maxGrowth) {
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
