// Plant Internal DSL
import { Cell, Grid, Plant } from "./grid.ts";
import { Position } from "./position.ts";
import { StatisticTracker } from "./statistic.ts";

export const enum PlantAction {
  SOW,
  REAP,
}

export enum PlantType { // indices map to PlantTypeInfo
  NONE = 255, // max value of 1 byte for grid storage
  Corn = 0,
  Cactus,
  Flower,
  Withered = 3,
  Weed,
} // ALWAYS add new types at the end to avoid changing indices

export interface PlantTypeDefinition {
  name: keyof typeof PlantType;
  // deno-lint-ignore no-explicit-any
  [property: string]: any; // allow any other properties needed to process
  canGrow(grid: Grid, pos: Position): boolean;
  canReap(grid: Grid, pos: Position): boolean;
  process(grid: Grid, pos: Position): void;
  getDescription(): string;
}

const CENTER_INDEX = 4;
function getPlantArea(grid: Grid, pos: Position): Plant[] {
  const plantArea: Plant[] = [];
  for (let y = pos.y - 1; y <= pos.y + 1; y++) {
    for (let x = pos.x - 1; x <= pos.x + 1; x++) {
      if (grid.isValidPosition({ x, y })) {
        plantArea.push(grid.getPlant({ x, y }));
      }
    }
  }
  return plantArea;
}

// TODO: diversify CanGrow behaviors
const commonCanGrow = function (
  this: PlantTypeDefinition,
  grid: Grid,
  pos: Position,
): boolean {
  const plant: Plant = grid.getPlant(pos);
  const cell: Cell = grid.getCell(pos);
  return plant.growthLevel < this.maxGrowth &&
    cell.water >= this.waterToGrow &&
    cell.sunlight >= this.sunToGrow;
};

// TODO: diversify CanReap behaviors
const commonCanReap = function (
  this: PlantTypeDefinition,
  grid: Grid,
  pos: Position,
): boolean {
  return grid.getPlant(pos).growthLevel === this.maxGrowth;
};

// TODO: diversify process behaviors
const commonProcess = function (
  this: PlantTypeDefinition,
  grid: Grid,
  pos: Position,
): void {
  const plantArea: Plant[] = getPlantArea(grid, pos);
  const currPlant: Plant = grid.getPlant(pos);

  let crowdCount = 0;
  if (currPlant.type !== PlantType.NONE) {
    plantArea.forEach((plant, i) => {
      if ((plant.type !== PlantType.NONE) && (i !== CENTER_INDEX)) {
        crowdCount++;
      }
    });
  }

  if (crowdCount > this.maxCrowding) {
    // kill if crowded
    grid.setPlant(pos, WITHERED);
  } else if (this.canGrow(grid, pos)) {
    // take growth resources
    const thisCell: Cell = grid.getCell(pos);
    thisCell.water = Math.max(0, thisCell.water - this.waterToGrow);
    grid.setCell(pos, thisCell);

    // grow plant
    grid.setPlant(pos, {
      type: PlantType[this.name],
      growthLevel: currPlant.growthLevel + 1,
    });
  }
};

// TODO: diversify instructions
const commonDescription = function (this: PlantTypeDefinition): string {
  return `<p><strong>${this.name}</strong>:<br>` +
    `To Grow:<br> ${this.waterToGrow} water,<br>` +
    `${this.sunToGrow} sunlight,<br>` +
    `${this.maxCrowding} maximum adjacent plants<br>` +
    `Can sow at level ${this.maxGrowth}</p>`;
};

const plantDefinitions: PlantTypeDefinition[] = [
  {
    name: "Corn",
    waterToGrow: 2,
    sunToGrow: 2,
    maxCrowding: 8,
    maxGrowth: 4,
    canGrow: function (grid: Grid, pos: Position): boolean {
      return commonCanGrow.call(this, grid, pos);
    },
    canReap: function (grid: Grid, pos: Position): boolean {
      return commonCanReap.call(this, grid, pos);
    },
    process: function (grid: Grid, pos: Position): void {
      commonProcess.call(this, grid, pos);
    },
    getDescription: function (): string {
      return commonDescription.call(this);
    },
  },
  {
    name: "Cactus",
    waterToGrow: 1,
    sunToGrow: 3,
    maxCrowding: 2,
    maxGrowth: 3,
    canGrow: function (grid: Grid, pos: Position): boolean {
      return commonCanGrow.call(this, grid, pos);
    },
    canReap: function (grid: Grid, pos: Position): boolean {
      return commonCanReap.call(this, grid, pos);
    },
    process: function (grid: Grid, pos: Position): void {
      commonProcess.call(this, grid, pos);
    },
    getDescription: function (): string {
      return commonDescription.call(this);
    },
  },
  {
    name: "Flower",
    waterToGrow: 3,
    sunToGrow: 1,
    maxCrowding: 4,
    maxGrowth: 2,
    canGrow: function (grid: Grid, pos: Position): boolean {
      return commonCanGrow.call(this, grid, pos);
    },
    canReap: function (grid: Grid, pos: Position): boolean {
      return commonCanReap.call(this, grid, pos);
    },
    process: function (grid: Grid, pos: Position): void {
      commonProcess.call(this, grid, pos);
    },
    getDescription: function (): string {
      return commonDescription.call(this);
    },
  },
  {
    name: "Withered",
    canGrow: function (): boolean {
      return false;
    },
    canReap: function (): boolean {
      return true;
    },
    process: function (): void {},
    getDescription: function (): string {
      return "";
    },
  },
  {
    name: "Weed",
    maxGrowth: 2,
    spreadChance: 0.05,
    canGrow: function (grid: Grid, pos: Position): boolean {
      return grid.getPlant(pos).growthLevel < this.maxGrowth;
    },
    canReap: function (): boolean {
      return true;
    },
    process: function (grid: Grid, pos: Position): void {
      const thisPlant: Plant = grid.getPlant(pos);
      if (thisPlant.growthLevel < this.maxGrowth) {
        grid.setPlant(pos, {
          type: PlantType.Weed,
          growthLevel: thisPlant.growthLevel + 1,
        });
        return; // only grow
      }

      // once max growth, try to spread
      const plantArea: Plant[] = getPlantArea(grid, pos);
      for (let i = 0; i < plantArea.length; i++) {
        if (
          plantArea[i].type === PlantType.NONE &&
          Math.random() < this.spreadChance
        ) {
          const spreadTo: Position = {
            x: pos.x + i % 3 - 1,
            y: pos.y + Math.floor(i / 3) - 1,
          };
          grid.setPlant(spreadTo, {
            type: PlantType.Weed,
            growthLevel: 1,
          });
        }
      }
    },
    getDescription: function (): string {
      return `<p><strong>${this.name}</strong>:<br>` +
        `To Grow:<br> In any conditions` +
        `Growth maxes out at ${this.maxGrowth}<br>` +
        `Can remove at any level` +
        `Will crowd out other plants and spread</p>`;
    },
  },
]; // ALWAYS add new types at the end to avoid changing indices

const EMPTY: Plant = {
  type: PlantType.NONE,
  growthLevel: 0,
};

const WITHERED: Plant = {
  type: PlantType.Withered,
  growthLevel: 0,
};

export function getPlantTypeName(type: PlantType): string {
  if (type === PlantType.NONE) return "";
  return PlantType[type];
}

export function getPlantDescription(type: PlantType): string {
  if (type === PlantType.NONE) return "";
  return plantDefinitions[type].getDescription();
}

export function getPlantTypeCssName(type: PlantType): string {
  if (type === PlantType.NONE) return "";
  return plantDefinitions[type].name
    .split(" ")
    .map((word) => word[0].toLowerCase() + word.slice(1))
    .join("-");
}

export function plantProcessor(
  grid: Grid,
  statTracker: StatisticTracker,
): void {
  let livingPlants = 0;
  for (let x = 0; x < grid.width; x++) {
    for (let y = 0; y < grid.height; y++) {
      const thisType = grid.getPlant({ x, y }).type;
      if (thisType === PlantType.NONE) continue;
      plantDefinitions[thisType].process(grid, { x, y });

      const newType: PlantType = grid.getPlant({ x, y }).type;

      if (newType !== thisType && newType === PlantType.Withered) {
        statTracker.increment("plantDied");
      } else if (newType !== PlantType.NONE) {
        livingPlants++;
      }
    }
  }

  statTracker.setIfMax("maxGridAlive", livingPlants);
}

export function trySow(grid: Grid, pos: Position, sowType: PlantType): boolean {
  const currPlantType = grid.getPlant(pos).type;
  const sowPlantDef = plantDefinitions[sowType];
  if (currPlantType === PlantType.NONE && sowType !== PlantType.NONE) {
    // process should handle sowing like growing
    sowPlantDef.process(grid, pos);
  }
  return (currPlantType === PlantType.NONE &&
    grid.getPlant(pos).type !== PlantType.NONE);
}

export function tryReap(grid: Grid, pos: Position): boolean {
  const currPlantType = grid.getPlant(pos).type;
  const currPlantDef = plantDefinitions[currPlantType];
  if (currPlantDef.canReap(grid, pos)) {
    grid.setPlant(pos, EMPTY);
    return true;
  }
  return false;
}
