// grid 

import { Position } from './position.ts';

export class Grid {
  private width: number;
  private height: number;
  private cells: Map<string, boolean>;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cells = new Map();
  }

  isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.width && 
           pos.y >= 0 && pos.y < this.height;
  }

  getKey(pos: Position): string {
    return `${pos.x},${pos.y}`;
  }
}