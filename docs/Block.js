// @ts-check

export const STATES = {
    LIVE: "rgb(255, 0, 0)",
    DEAD: "rgb(0, 0, 0)",
    BACKGROUND: "rgb(255, 255, 255)",
  },
  DIRECTIONS = {
    UP: 0,
    RIGHT: 90,
    DOWN: 180,
    LEFT: 270,
  };

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

export default Block;
