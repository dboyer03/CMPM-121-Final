// Grid State & Environment

import { Position } from "./position.ts";
import { PlantAction, PlantType } from "./plant.ts";
import { StatisticSubject, StatisticTracker } from "./statistic.ts";

export interface Cell {
  water: number;
  sunlight: number;
}

export interface Plant {
  type: PlantType;
  growthLevel: number;
}

const CELL_PLANT_WIDTH = 4;

export type GridAction = PlantAction; // potential for expansion to other actions

export class Grid extends StatisticSubject {
  readonly width: number;
  readonly height: number;
  private state: Uint8Array; // Byte array to store grid state
  private readonly INTERACTION_RANGE = 1; // adjacent cell range
  private readonly MAX_WATER = 5; // max water
  private MAX_RAIN = 2; // max water increase per tick
  private MIN_WATER_RETENTION = 0.5; // % water retention
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

  updateEnvironment(weather: string): void {

    let livingPlants = 0;

    switch(weather){
      case("sunny"):
        this.MAX_RAIN = 2;
        this.MIN_WATER_RETENTION = 0.5;
        break;
      case("hot"):
        this.MAX_RAIN = 1;
        this.MIN_WATER_RETENTION = 0.2;
        break;
      case("rainy"):
        this.MAX_RAIN = 3;
        this.MIN_WATER_RETENTION = 0.7;
        break;
    }

    // update cell resources
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const pos: Position = { x, y };
        const cell: Cell = this.getCell(pos);

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
        if(weather == "hot"){
            cell.sunlight = Math.random() < 0.5 ? 2 : 3;
        }else{cell.sunlight = Math.floor(Math.random() * (this.MAX_SUNLIGHT + 1));}

        // update cell
        this.setCell(pos, cell);
      }
    }
  }

  updateDrought(){
    let livingPlants = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const pos: Position = { x, y };
        const cell: Cell = this.getCell(pos);
        const plant: Plant = this.getPlant(pos);

        // update plant
        if (
          plant.type !== PlantType.NONE && plant.type !== PlantType.WITHERED
        ) {
            const result = Math.random() < 0.75;
            if(result == true){
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

  isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.width &&
      pos.y >= 0 && pos.y < this.height;
  }
}
