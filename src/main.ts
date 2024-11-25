import "./style.css";

const GAME_NAME = "CMPM 121 Final Project - Group 33";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = GAME_NAME;

const titleElement = document.createElement("h1");
titleElement.textContent = GAME_NAME;
app.appendChild(titleElement);
