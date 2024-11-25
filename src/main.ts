// main

import "./style.css";
import { Grid } from './grid.ts';
import { Player } from './player.ts';

const GAME_NAME = "CMPM 121 Final Project - Group 33";
const GRID_SIZE = 10;

const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = GAME_NAME;

const grid = new Grid(GRID_SIZE, GRID_SIZE);
const player = new Player(grid, { x: 0, y: 0 });

// setup game display
const gameContainer = document.createElement("div");
gameContainer.style.display = "grid";
gameContainer.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 32px)`;
gameContainer.style.gap = "1px";
gameContainer.style.backgroundColor = "#ccc";

// add container to DOM
app.appendChild(gameContainer);

// create initial display
updateDisplay();

// add keyboard controls
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp': player.move('up'); break;
    case 'ArrowDown': player.move('down'); break;
    case 'ArrowLeft': player.move('left'); break;
    case 'ArrowRight': player.move('right'); break;
  }
  updateDisplay();
});

function updateDisplay() {
  // clear previous display
  gameContainer.innerHTML = '';
  
  // create grid cells
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      
      // add player if position matches
      const playerPos = player.getPosition();
      if (playerPos.x === x && playerPos.y === y) {
        const playerElement = document.createElement('div');
        playerElement.className = 'player';
        cell.appendChild(playerElement);
      }
      
      gameContainer.appendChild(cell);
    }
  }
}
