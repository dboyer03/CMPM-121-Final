// grid

import { Position } from "./position.ts";
import { canGrow, Plant, PlantType, PlantTypeInfo } from "./plant.ts";
import { StatisticSubject, StatisticTracker } from "./statistic.ts";

interface Cell {
  water: number;
  sunlight: number;
}

const CELL_PLANT_WIDTH = 4;

export class Grid extends StatisticSubject {
  readonly width: number;
  readonly height: number;
  private state: Uint8Array; // Byte array to store grid state
  private readonly INTERACTION_RANGE = 1; // adjacent cell range
  private readonly MAX_WATER = 5; // max water
  private readonly MAX_RAIN = 2; // max water increase per tick
  private readonly MIN_WATER_RETENTION = 0.5; // % water retention
  private readonly MAX_SUNLIGHT = 3; // max sunlight

  constructor(width: number, height: number, statTracker: StatisticTracker) {
    super(statTracker);
    this.width = width;
    this.height = height;
    this.state = new Uint8Array(width * height * CELL_PLANT_WIDTH);
    // Each cell has water, sunlight, plant type, and growth level as 1 byte each

    // Initialize state
    for (let i = 0; i < this.state.length; i += CELL_PLANT_WIDTH) {
      this.state[i] = 0; // water
      this.state[i + 1] = 0; // sunlight
      this.state[i + 2] = PlantType.NONE; // plant type
      this.state[i + 3] = 0; // growth level
    }
  }

  private getIndex(pos: Position): number {
    return (pos.y * this.width + pos.x) * CELL_PLANT_WIDTH;
  }

  getCell(pos: Position): Cell {
    const index = this.getIndex(pos);
    return {
      water: this.state[index],
      sunlight: this.state[index + 1],
    };
  }

  getPlant(pos: Position): Plant {
    const index = this.getIndex(pos);
    return {
      type: this.state[index + 2],
      growthLevel: this.state[index + 3],
    };
  }

  setCell(pos: Position, cell: Cell): void {
    const index = this.getIndex(pos);
    this.state[index] = cell.water;
    this.state[index + 1] = cell.sunlight;
  }

  setPlant(pos: Position, plant: Plant): void {
    const index = this.getIndex(pos);
    this.state[index + 2] = plant.type;
    this.state[index + 3] = plant.growthLevel;
  }

  getState(): Uint8Array {
    return this.state;
  }

  setState(state: Uint8Array): void {
    this.state = state;
  }

  updateEnvironment(): void {
    let livingPlants = 0;

    // update cell resources
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const pos: Position = { x, y };
        const cell: Cell = this.getCell(pos);
        const plant: Plant = this.getPlant(pos);

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
        if (
          plant.type !== PlantType.NONE && plant.type !== PlantType.WITHERED
        ) {
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
            this.setPlant(pos, { type: PlantType.WITHERED, growthLevel: 1 });
          } else {
            // plant didn't die
            this.setPlant(pos, plant);
            livingPlants++;
          }
        }

        this.setCell(pos, cell);
      }
    }
    this.statisticTracker.setIfMax("maxGridAlive", livingPlants);
  }

  isWithinRange(playerPos: Position, targetPos: Position): boolean {
    const dx = Math.abs(playerPos.x - targetPos.x);
    const dy = Math.abs(playerPos.y - targetPos.y);
    return dx <= this.INTERACTION_RANGE && dy <= this.INTERACTION_RANGE;
  }

  sowPlant(pos: Position, type: PlantType): boolean {
    const cell = this.getCell(pos);
    const newPlant: Plant = {
      type,
      growthLevel: 1,
    };
    if (
      (this.getPlant(pos).type === PlantType.NONE) &&
      canGrow(newPlant, cell.water, cell.sunlight)
    ) {
      this.setPlant(pos, newPlant);
      cell.water -= PlantTypeInfo[type].waterToGrow;
      this.statisticTracker.increment("plantSown", type);
      this.setCell(pos, cell);
      return true;
    }
    return false;
  }

  reapPlant(pos: Position): Plant | null {
    const plant = this.getPlant(pos);
    if (
      (this.getPlant(pos).type !== PlantType.NONE) &&
      (plant.growthLevel === PlantTypeInfo[plant.type].maxGrowth)
    ) {
      this.setPlant(pos, { type: PlantType.NONE, growthLevel: 0 });
      if (plant.type !== PlantType.WITHERED) {
        this.statisticTracker.increment("plantReaped", plant.type);
      }
      return plant;
    }
    return null;
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
          (this.getPlant({ x, y }).type !== PlantType.NONE)
        ) {
          count++;
        }
      }
    }
    return count;
  }
}
