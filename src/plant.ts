// plant

const MAX_GROWTH = 3;

export interface FullPlantType {
  name: string;
  maxGrowth: number;
  waterToGrow: number;
  sunToGrow: number;
  maxCrowding: number;
}

export enum PlantType { // indices map to PlantTypeInfo
  NONE = 255, // max value of 1 byte for grid storage
  GREEN_CIRCLE = 0,
  YELLOW_TRIANGLE,
  PURPLE_SQUARE,
  WITHERED = 3, // ALWAYS add new types at the end to avoid changing indices
}

export const PlantTypeInfo: FullPlantType[] = [
  {
    name: "Green Circle",
    maxGrowth: MAX_GROWTH,
    waterToGrow: 2,
    sunToGrow: 2,
    maxCrowding: 8,
  },
  {
    name: "Yellow Triangle",
    maxGrowth: MAX_GROWTH,
    waterToGrow: 1,
    sunToGrow: 3,
    maxCrowding: 2,
  },
  {
    name: "Purple Square",
    maxGrowth: MAX_GROWTH,
    waterToGrow: 3,
    sunToGrow: 1,
    maxCrowding: 4,
  },
  {
    name: "withered",
    maxGrowth: 1,
    waterToGrow: Infinity,
    sunToGrow: Infinity,
    maxCrowding: Infinity,
  },
]; // ALWAYS add new types at the end to avoid changing indices

/** Turn plant name into css-friendly name */
export function getCssName(type: PlantType): string {
  if (type === PlantType.NONE) {
    return "none";
  }
  return PlantTypeInfo[type].name
    .split(" ")
    .map((word) => word[0].toLowerCase() + word.slice(1))
    .join("-");
}

export enum PlantAction {
  SOW,
  REAP,
}

export interface Plant {
  type: PlantType;
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
