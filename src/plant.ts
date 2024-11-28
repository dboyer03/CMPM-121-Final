// plant

const MAX_GROWTH = 3;

export interface PlantType {
  name: string;
  maxGrowth: number;
  waterToGrow: number;
  sunToGrow: number;
  maxCrowding: number;
}

export const PlantTypeInfo: { [key: string]: PlantType } = {
  "green-circle": {
    name: "Green Circle",
    maxGrowth: MAX_GROWTH,
    waterToGrow: 2,
    sunToGrow: 2,
    maxCrowding: 8,
  },
  "yellow-triangle": {
    name: "Yellow Triangle",
    maxGrowth: MAX_GROWTH,
    waterToGrow: 1,
    sunToGrow: 3,
    maxCrowding: 2,
  },
  "purple-square": {
    name: "Purple Square",
    maxGrowth: MAX_GROWTH,
    waterToGrow: 3,
    sunToGrow: 1,
    maxCrowding: 4,
  },
  "withered": {
    name: "withered",
    maxGrowth: 1,
    waterToGrow: Infinity,
    sunToGrow: Infinity,
    maxCrowding: Infinity,
  },
};

export enum PlantAction {
  SOW,
  REAP,
}

export interface Plant {
  type: string;
  growthLevel: number;
}

export function canGrow(
  plant: Plant,
  water: number,
  sunlight: number,
): boolean {
  const plantType = PlantTypeInfo[plant.type];

  return plant.growthLevel < plantType.maxGrowth &&
    water >= plantType.waterToGrow &&
    sunlight >= plantType.sunToGrow;
}
