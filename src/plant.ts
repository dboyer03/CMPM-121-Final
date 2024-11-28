// plant

const MAX_GROWTH = 3;

export interface PlantType {
  name: string;
  maxGrowth: number;
  waterToGrow: number;
  sunToGrow: number;
}

export const PlantTypeInfo: { [key: string]: PlantType } = {
  "green-circle": {
    name: "Green Circle",
    waterToGrow: 2,
    maxGrowth: MAX_GROWTH,
    sunToGrow: 2,
  },
  "yellow-triangle": {
    name: "Yellow Triangle",
    waterToGrow: 1,
    maxGrowth: MAX_GROWTH,
    sunToGrow: 3,
  },
  "purple-square": {
    name: "Purple Square",
    waterToGrow: 3,
    maxGrowth: MAX_GROWTH,
    sunToGrow: 1,
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

export function createPlant(type: string): Plant {
  return {
    type,
    growthLevel: 0,
  };
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
