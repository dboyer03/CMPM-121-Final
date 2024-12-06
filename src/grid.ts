// grid

import { Position } from "./position.ts";
import { canGrow, Plant, PlantTypeInfo } from "./plant.ts";
import { Cell } from "./cell.ts";
import { StatisticSubject, StatisticTracker } from "./statistic.ts";

export class Grid extends StatisticSubject {
  readonly width: number;
  readonly height: number;
  private state: Uint8Array; // Byte array to store grid state
  private plants: Map<string, Plant>;
  private readonly INTERACTION_RANGE = 1; // adjacent cell range
  private readonly MAX_WATER = 5; // max water
  private readonly MAX_RAIN = 2; // max water increase per tick
  private readonly MIN_WATER_RETENTION = 0.5; // % water retention
  private readonly MAX_SUNLIGHT = 3; // max sunlight

  constructor(width: number, height: number, statTracker: StatisticTracker) {
    super(statTracker);
    this.width = width;
    this.height = height;
    this.state = new Uint8Array(width * height * 2); // Each cell has water and sunlight
    this.plants = new Map();

    // Initialize state
    for (let i = 0; i < this.state.length; i += 2) {
      this.state[i] = 0; // water
      this.state[i + 1] = 0; // sunlight
    }
  }

  private getIndex(pos: Position): number {
    return (pos.y * this.width + pos.x) * 2;
  }

  getCellProperties(pos: Position): Cell {
    const index = this.getIndex(pos);
    return {
      water: this.state[index],
      sunlight: this.state[index + 1],
    };
  }

  setCellProperties(pos: Position, cell: Cell): void {
    const index = this.getIndex(pos);
    this.state[index] = cell.water;
    this.state[index + 1] = cell.sunlight;
  }

  getState(): Uint8Array {
    return this.state;
  }

  setState(state: Uint8Array): void {
    this.state = state;
  }

  getPlants(): Map<string, Plant> {
    return this.plants;
  }

  setPlants(plants: Map<string, Plant>): void {
    this.plants = plants;
  }

  updateEnvironment(): void {
    let livingPlants = 0;

    // update cell resources
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const pos = { x, y };
        const key = this.getPlantKey(pos);
        const cell = this.getCellProperties(pos);
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

        // update plant
        if (plant) {
          // update plant growth
          if (canGrow(plant, cell.water, cell.sunlight)) {
            plant.growthLevel++;
            cell.water -= PlantTypeInfo[plant.type].waterToGrow;
          }

          // check for crowding
          if (
            this.countAdjacentPlants(pos) >
              PlantTypeInfo[plant.type].maxCrowding
          ) {
            // kill plant
            this.statisticTracker.increment("plantDied", plant.type); // notify before modification
            this.plants.set(key, { type: "withered", growthLevel: 1 });
          } else {
            // plant didn't die
            livingPlants++;
          }
        }

        this.setCellProperties(pos, cell);
      }
    }
    this.statisticTracker.setIfMax("maxGridAlive", livingPlants);
  }

  isWithinRange(playerPos: Position, targetPos: Position): boolean {
    const dx = Math.abs(playerPos.x - targetPos.x);
    const dy = Math.abs(playerPos.y - targetPos.y);
    return dx <= this.INTERACTION_RANGE && dy <= this.INTERACTION_RANGE;
  }

  sowPlant(pos: Position, type: string): boolean {
    const key = this.getPlantKey(pos);
    const cell = this.getCellProperties(pos);
    const plant = {
      type,
      growthLevel: 1,
    };
    if (!this.plants.has(key) && canGrow(plant, cell.water, cell.sunlight)) {
      this.plants.set(key, plant);
      cell.water -= PlantTypeInfo[type].waterToGrow;
      this.statisticTracker.increment("plantSown", type);
      this.setCellProperties(pos, cell);
      return true;
    }
    return false;
  }

  reapPlant(pos: Position): Plant | null {
    const key = this.getPlantKey(pos);
    const plant = this.plants.get(key);
    if (plant && plant.growthLevel === PlantTypeInfo[plant.type].maxGrowth) {
      this.plants.delete(key);
      if (plant.type !== "withered") {
        this.statisticTracker.increment("plantReaped", plant.type);
      }
      return plant;
    }
    return null;
  }

  getPlantKey(pos: Position): string {
    return `${pos.x},${pos.y}`;
  }

  getPlant(pos: Position): Plant | undefined {
    return this.plants.get(this.getPlantKey(pos));
  }

  isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.width &&
      pos.y >= 0 && pos.y < this.height;
  }

  countAdjacentPlants(pos: Position): number {
    let count = 0;
    for (let y = pos.y - 1; y <= pos.y + 1; y++) {
      for (let x = pos.x - 1; x <= pos.x + 1; x++) {
        if (
          this.isValidPosition({ x, y }) &&
          !(x === pos.x && y === pos.y) &&
          this.getPlant({ x, y })
        ) {
          count++;
        }
      }
    }
    return count;
  }
}
