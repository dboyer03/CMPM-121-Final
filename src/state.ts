// game state

export class GameState {
  private dayCount: number = 0;

  constructor() {
    this.dayCount = 0;
  }

  advanceDay(): void {
    this.dayCount++;
  }

  getCurrentDay(): number {
    return this.dayCount;
  }
}
