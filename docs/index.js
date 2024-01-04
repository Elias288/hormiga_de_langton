// @ts-check

import {
  btnClear,
  btnStop,
  canvas,
  inRangeSize,
  inRangeTime,
  outRangeSize,
  outRangeTime,
} from "./Elements.js";
import Game from "./GameEngine.js";

const game = new Game();

const onRangeSizeChange = () => {
  const value = inRangeSize.value;
  if (Math.floor((value * game.BLOCK_SIZE) % 2) !== 0) {
    game.clearAll();
    outRangeSize.innerHTML = value;

    game.canvas_size = value * game.BLOCK_SIZE;
    canvas.width = value * game.BLOCK_SIZE;
    canvas.height = value * game.BLOCK_SIZE;

    game.chargeGrid();
    game.initAnt();
  }
};

const onRangeTimeChange = () => {
  const value = inRangeTime.value;
  game.frame_speed = game.MAX_FRAME_SPEED - value;
  outRangeTime.innerHTML = String(game.MAX_FRAME_SPEED - value);
};

function procesarDown(evt) {
  switch (evt.code) {
    case "ArrowUp":
      game.nextGeneration();
      game.drawBlocks();
      break;
  }
}

btnClear.addEventListener("click", () => game.clearAll());
btnStop.addEventListener("click", () => game.togglePausa());
inRangeSize.oninput = onRangeSizeChange;
inRangeTime.oninput = onRangeTimeChange;

document.addEventListener("keydown", procesarDown);
window.requestAnimationFrame(() => game.gameLoop());
