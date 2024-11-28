// plant

export enum PlantType {
  GREEN_CIRCLE = 1,
  YELLOW_TRIANGLE = 2,
  PURPLE_SQUARE = 3,
}

export enum PlantAction {
  SOW,
  REAP,
}

export interface Plant {
  type: PlantType;
  growthLevel: number;
}
