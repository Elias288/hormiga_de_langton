// @ts-check

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

class Block {
  /**
   * Block builder
   * @param {number} x Position x on the grid
   * @param {number} y Position y on the grid
   * @param {number} num Number assigned to the block
   * @param {number} [size=15] Block size
   */
  constructor(x, y, num, size) {
    /** @type {number} */
    this.x_position = x;
    /** @type {number} */
    this.y_position = y;
    /** @type {number} */
    this.number = num;
    /** @type {number} */
    this.size = size ? size : 15;
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
    /** @constant {number} */
    this.BLOCK_SIZE = 15;
    /** @constant {number} */
    this.MAX_FRAME_SPEED = 201;

    /** @type {number} */
    this.canvas_size = 435;
    /** @type {number} */
    this.frame_speed = 100;
    /** @type {number} */
    this.middle_of_the_grid = 0;
    /** @type {number} */
    this.generation = 0;
    /** @type {Block[]} */
    this.grid = [];
    /** @type {boolean} */
    this.isStop = true;

    rangeOutputSize.innerHTML = String(this.canvas_size / this.BLOCK_SIZE);
    rangeOutputTime.innerHTML = String(this.frame_speed);

    canvas.width = this.canvas_size;
    canvas.height = this.canvas_size;

    this.chargeGrid();
    this.initAnt();
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
      }, this.frame_speed);
    }
  }

  /**
   * Function that draws the grid and loads them into the game list.
   */
  chargeGrid() {
    // reset the grid
    this.grid = [];
    let counter = 0;
    ctx.strokeStyle = STATES.BACKGROUND;
    const cantBlocks = this.canvas_size / this.BLOCK_SIZE;
    ctx.lineWidth = 1;

    for (let y = 0; y < cantBlocks; y++) {
      for (let x = 0; x < cantBlocks; x++) {
        const blocks = new Block(
          x * this.BLOCK_SIZE,
          y * this.BLOCK_SIZE,
          counter
        );

        counter++;
        this.grid.push(blocks);
      }
    }

    // set the middle of the grid
    this.middle_of_the_grid = Math.floor(
      Math.pow(this.canvas_size / this.BLOCK_SIZE, 2) / 2
    );

    // console.log(this.grid);
  }

  /**
   * Paint the corresponding color of the blocks according to their statuses
   */
  drawBlocks() {
    this.grid.forEach((block) => {
      switch (block.state) {
        case STATES.LIVE:
          ctx.fillStyle = STATES.LIVE;
          ctx.fillRect(
            block.x_position,
            block.y_position,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
          );
          // console.log(JSON.stringify(cuadro, null, 4));
          break;
        case STATES.DEAD:
          ctx.fillStyle = STATES.DEAD;
          ctx.fillRect(
            block.x_position,
            block.y_position,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
          );
          break;
        case STATES.BACKGROUND:
          ctx.fillStyle = STATES.BACKGROUND;
          ctx.fillRect(
            block.x_position,
            block.y_position,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
          );

          // lines
          ctx.strokeStyle = "rgb(245, 245, 245)";
          ctx.strokeRect(
            block.x_position,
            block.y_position,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
          );

          /* ctx.fillStyle = "#000";
          ctx.font = "7px Arial";
          ctx.fillText(
            String(block.number),
            block.x_position,
            block.y_position - 8
          ); */
          break;

        default:
          break;
      }
    });
  }

  /**
   * Funtion that initialize the ant
   */
  initAnt() {
    this.grid.map((block) => {
      if (block.number === this.middle_of_the_grid) {
        block.changeState(STATES.LIVE);
      }
    });
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
        return this.findByCoordinates(x, y - this.BLOCK_SIZE);
      case DIRECTIONS.RIGHT:
        return this.findByCoordinates(x + this.BLOCK_SIZE, y);
      case DIRECTIONS.DOWN:
        return this.findByCoordinates(x, y + this.BLOCK_SIZE);
      case DIRECTIONS.LEFT:
        return this.findByCoordinates(x - this.BLOCK_SIZE, y);
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
      ctx.clearRect(0, 0, this.canvas_size, this.canvas_size);
      this.chargeGrid();
      this.initAnt();
      this.drawBlocks();
    }, 50);
  }
}

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
