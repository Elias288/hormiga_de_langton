/** @type {HTMLCanvasElement} */
export const canvas = document.querySelector("canvas"),
  /** @type {CanvasRenderingContext2D } */
  ctx = canvas.getContext("2d"),
  /** @type {HTMLElement} */
  generation = document.getElementById("generation"),
  /** @type {HTMLElement} */
  btnStop = document.getElementById("btnStop"),
  /** @type {HTMLElement} */
  btnClear = document.getElementById("btnClear"),
  /** @type {any} */
  inRangeSize = document.getElementById("range_size"),
  /** @type {HTMLElement} */
  outRangeSize = document.getElementById("rangeSpanSize"),
  /** @type {any} */
  inRangeTime = document.getElementById("range_time"),
  /** @type {HTMLElement} */
  outRangeTime = document.getElementById("rangeSpanTime");
