// @ts-check

const MAX_FRAME_TIME = 201;
const ANT_SIZE = 15;
const STATES = {
  LIVE: "rgb(255, 0, 0)",
  DEAD: "rgb(0, 0, 0)",
  BACKGROUND: "rgb(255, 255, 255)",
};
const DIRECTIONS = {
  UP: 0,
  RIGHT: 90,
  DOWN: 180,
  LEFT: 270,
};

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas"),
  /** @type {CanvasRenderingContext2D } */
  ctx = canvas.getContext("2d"),
  /** @type {HTMLElement} */
  generation = document.getElementById("generation"),
  /** @type {HTMLElement} */
  btnStop = document.getElementById("btnStop"),
  /** @type {HTMLElement} */
  btnClear = document.getElementById("btnClear"),
  /** @type {HTMLElement} */
  rangeSize = document.getElementById("range_size"),
  /** @type {HTMLElement} */
  rangeOutputSize = document.getElementById("rangeSpanSize"),
  /** @type {HTMLElement} */
  range_time = document.getElementById("range_time"),
  /** @type {HTMLElement} */
  rangeOutputTime = document.getElementById("rangeSpanTime");

/** @type {number} */
var CANVAS_SIZE = 435;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
rangeOutputSize.innerHTML = String(CANVAS_SIZE / 15);

/** @type {number} */
var FRAME_TIME = 100;
rangeOutputTime.innerHTML = String(FRAME_TIME);

class Block {
  /**
   * Block builder
   * @param {number} x Position x on the grid
   * @param {number} y Position y on the grid
   * @param {number} num Number assigned to the block
   * @param {number} size Block size
   */
  constructor(x, y, num, size) {
    /** @type {number} */
    this.x_position = x;
    /** @type {number} */
    this.y_position = y;
    /** @type {number} */
    this.number = num;
    /** @type {number} */
    this.size = size;
    /** @type {number} */
    this.direction = DIRECTIONS.UP;
    /** @type {string} */
    this.state = STATES.BACKGROUND;
    /** @type {boolean} */
    this.onBackground = true;
  }

  /**
   * Change state of block
   * @param {string} state New state of Block
   */
  changeState(state) {
    this.state = state;
  }
}

/**
 * @class
 */
class Game {
  constructor() {
    /** @type {Block[]} */
    this.grid = [];

    /** @type {number} */
    this.generation = 0;

    /** @type {boolean} */
    this.isStop = true;
  }

  /**
   * Funcion que matiene ejecutando el juego dependiendo del estado isPausa
   */
  gameLoop() {
    this.drawBlocks();
    if (!this.isStop) {
      setTimeout(() => {
        this.nextGeneration();
        window.requestAnimationFrame(() => this.gameLoop());
      }, FRAME_TIME);
    }
  }

  /**
   * Function that draws the grid and loads them into the game list.
   */
  initialGrill() {
    // reset the grid
    this.grid = [];
    let columns = [],
      rows = [],
      counter = 0;
    ctx.strokeStyle = STATES.BACKGROUND;
    ctx.lineWidth = 1;

    // Charge columns
    columns.push(0);
    for (let i = ANT_SIZE; i < CANVAS_SIZE; i += ANT_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      columns.push(i);
    }
    ctx.closePath();

    // Charge rows
    rows.push(0);
    for (let i = ANT_SIZE; i < CANVAS_SIZE; i += ANT_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
      rows.push(i);
    }
    ctx.closePath();

    // Combines rows and columns
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < columns.length; x++) {
        const blocks = new Block(columns[x], rows[y], counter, ANT_SIZE);
        counter++;
        this.grid.push(blocks);
      }
    }

    // console.log(this.cuadritos);
  }

  /**
   * Paint the corresponding color of the blocks according to their statuses
   */
  drawBlocks() {
    this.grid.forEach((block) => {
      switch (block.state) {
        case STATES.LIVE:
          ctx.fillStyle = STATES.LIVE;
          ctx.fillRect(block.x_position, block.y_position, ANT_SIZE, ANT_SIZE);
          // console.log(JSON.stringify(cuadro, null, 4));
          break;
        case STATES.DEAD:
          ctx.fillStyle = STATES.DEAD;
          ctx.fillRect(block.x_position, block.y_position, ANT_SIZE, ANT_SIZE);
          break;
        case STATES.BACKGROUND:
          ctx.fillStyle = STATES.BACKGROUND;
          ctx.fillRect(block.x_position, block.y_position, ANT_SIZE, ANT_SIZE);

          // lines
          ctx.strokeStyle = "rgb(245, 245, 245)";
          ctx.strokeRect(
            block.x_position,
            block.y_position,
            ANT_SIZE,
            ANT_SIZE
          );
          break;

        default:
          break;
      }
    });
  }

  /**
   * Searches and changes the status of a block in the grid.
   * @param {number} blockNumber posicion del cuadrito al que se le va a cambiar el estado
   * @param {string} state nuevo estado para el cuadrito
   */
  changeStateOfBlock(blockNumber, state) {
    const newGrid = this.grid.map((block) => {
      if (block.number === blockNumber) {
        block.changeState(state);
        return block;
      }

      return block;
    });

    this.grid = newGrid;
  }

  /**
   * Charge to the next generation
   */
  nextGeneration() {
    /** @type {Block} */
    const ant = this.grid.find((cuadro) => cuadro.state === STATES.LIVE);

    // calculates the new direction
    const newDireccion = this.normalizeDegrees(
      ant.onBackground
        ? // if the ant is on a white block
          ant.direction - 90
        : // if the ant is on a black block
          ant.direction + 90
    );

    /** @type {Block} */
    const nextAntPosition = this.findNextAntPosition(
      newDireccion,
      ant.x_position,
      ant.y_position
    );

    if (!nextAntPosition) {
      this.togglePausa();
      return;
    }

    // executes the motion logic and loads it to the grid
    this.grid = this.motionLogic(ant, nextAntPosition, newDireccion);

    this.generation++;
    generation.textContent = `${this.generation}`;
  }

  /**
   * Function that normalizes angles between 0 and 360
   * @param {number} angle Value to be normalized to degrees between 0 and 360
   * @returns {number} normalizeDegree
   */
  normalizeDegrees(angle) {
    angle = angle % 360;
    if (angle < 0) {
      angle += 360;
    }
    return angle;
  }

  /**
   * Function that maps the position of the ant according to the rules.
   * @param {Block} ant current ant information
   * @param {Block} nextAnt next ant position information
   * @param {number} direction new direction to where the ant is looking at
   * @returns {Array<Block>} grid with the new calculated positions
   */
  motionLogic(ant, nextAnt, direction) {
    return this.grid.map((block) => {
      // Ant
      if (block.number === ant.number) {
        // if the ant is on white, it becomes black, otherwise it returns to white.
        block.onBackground
          ? (block.state = STATES.DEAD)
          : (block.state = STATES.BACKGROUND);
      }

      // nextAnt
      if (block.number === nextAnt.number) {
        // if the next position is black change the onBackground status to false, otherwise true
        block.state === STATES.DEAD
          ? (block.onBackground = false)
          : (block.onBackground = true);

        block.state = STATES.LIVE;
        block.direction = direction;
      }

      return block;
    });
  }

  /**
   * Function that calculates the next position of the ant according to its direction
   * @param {number} direction ant direction
   * @param {number} x current "x" position of the ant
   * @param {number} y current "y" position of the ant
   * @returns {Block} next ant position
   */
  findNextAntPosition(direction, x, y) {
    switch (direction) {
      case DIRECTIONS.UP:
        return this.findByCoordinates(x, y - ANT_SIZE);
      case DIRECTIONS.RIGHT:
        return this.findByCoordinates(x + ANT_SIZE, y);
      case DIRECTIONS.DOWN:
        return this.findByCoordinates(x, y + ANT_SIZE);
      case DIRECTIONS.LEFT:
        return this.findByCoordinates(x - ANT_SIZE, y);
    }
  }

  /**
   * Function that searches for a square by its coordinates.
   * @param {number} x x position
   * @param {number} y y position
   * @returns {Block} block at position x y
   */
  findByCoordinates(x, y) {
    return this.grid.find(
      (cuadro) => cuadro.x_position === x && cuadro.y_position === y
    );
  }

  /**
   * Function that exchanges the isPause property
   */
  togglePausa() {
    this.isStop = !this.isStop;

    if (!this.isStop) {
      btnStop.innerHTML = "Pause";
      window.requestAnimationFrame(() => game.gameLoop());
    }

    if (this.isStop) {
      btnStop.innerHTML = "Start";
    }
  }

  /**
   * Function that returns the game to its initial state.
   */
  clearAll() {
    this.isStop = true;
    btnStop.innerHTML = "Start";

    this.generation = 0;
    this.isStop = true;
    generation.textContent = "0";

    setTimeout(() => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      this.initialGrill();
      this.changeStateOfBlock(this.calculateMiddle(), STATES.LIVE);
      this.drawBlocks();
    }, 50);
  }

  /**
   * Function that calculates the position of the central block.
   * @returns {number} central block number
   */
  calculateMiddle() {
    return Math.floor(Math.pow(CANVAS_SIZE / ANT_SIZE, 2) / 2);
  }
}

const game = new Game();

game.initialGrill();
game.changeStateOfBlock(game.calculateMiddle(), STATES.LIVE);

function procesarDown(evt) {
  switch (evt.code) {
    case "ArrowUp":
      game.nextGeneration();
      game.drawBlocks();
      break;
  }
}

const onRangeSizeChange = (value) => {
  if (Math.floor((value * ANT_SIZE) % 2) !== 0) {
    game.clearAll();
    rangeOutputSize.innerHTML = value;
    CANVAS_SIZE = value * ANT_SIZE;
    canvas.width = value * ANT_SIZE;
    canvas.height = value * ANT_SIZE;

    game.initialGrill();
    game.changeStateOfBlock(game.calculateMiddle(), STATES.LIVE);
    game.drawBlocks();
  }
};

const onRangeTimeChange = (value) => {
  FRAME_TIME = MAX_FRAME_TIME - value;
  rangeOutputTime.innerHTML = String(MAX_FRAME_TIME - value);
};

btnClear.addEventListener("click", () => game.clearAll());
btnStop.addEventListener("click", () => game.togglePausa());
document.addEventListener("keydown", procesarDown);
window.requestAnimationFrame(() => game.gameLoop());
