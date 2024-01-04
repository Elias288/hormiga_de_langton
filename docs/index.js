// @ts-check

import Game, {
  btnClear,
  btnStop,
  canvas,
  rangeOutputSize,
  rangeOutputTime,
} from "./GameEngine.js";

const game = new Game();

function procesarDown(evt) {
  switch (evt.code) {
    case "ArrowUp":
      game.nextGeneration();
      game.drawBlocks();
      break;
  }
}

const onRangeSizeChange = (value) => {
  if (Math.floor((value * game.BLOCK_SIZE) % 2) !== 0) {
    game.clearAll();
    rangeOutputSize.innerHTML = value;

    game.canvas_size = value * game.BLOCK_SIZE;
    canvas.width = value * game.BLOCK_SIZE;
    canvas.height = value * game.BLOCK_SIZE;

    game.chargeGrid();
    game.initAnt();
  }
};

const onRangeTimeChange = (value) => {
  game.frame_speed = game.MAX_FRAME_SPEED - value;
  rangeOutputTime.innerHTML = String(game.MAX_FRAME_SPEED - value);
};

btnClear.addEventListener("click", () => game.clearAll());
btnStop.addEventListener("click", () => game.togglePausa());
document.addEventListener("keydown", procesarDown);

window.requestAnimationFrame(() => game.gameLoop());
