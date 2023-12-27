// @ts-check

const BLOCK_SIZES = { ancho: 15, alto: 15 };
const ESTADOS = {
  VIVO: "rgb(255, 0, 0)",
  MUERTO: "rgb(0, 0, 0)",
  BACKGROUND: "rgb(255, 255, 255)",
};
const DIRECTIONS = {
  ARRIBA: 0,
  DERECHA: 90,
  ABAJO: 180,
  IZQUIERDA: 270,
};

/** @type {HTMLCanvasElement} */
const doc_canvas = document.querySelector("canvas"),
  /** @type {CanvasRenderingContext2D } */
  doc_ctx = doc_canvas.getContext("2d"),
  /** @type {HTMLElement} */
  doc_generacion = document.getElementById("generacion"),
  /** @type {HTMLElement} */
  doc_btnPausa = document.getElementById("btnPausa"),
  /** @type {HTMLElement} */
  doc_btnClear = document.getElementById("btnClear"),
  /** @type {HTMLElement} */
  doc_rangeSize = document.getElementById("range_size"),
  /** @type {HTMLElement} */
  doc_rangeOutputSize = document.getElementById("rangeSpanSize"),
  /** @type {HTMLElement} */
  doc_range_time = document.getElementById("range_time"),
  /** @type {HTMLElement} */
  doc_rangeOutputTime = document.getElementById("rangeSpanTime");

/** @type {number} */
var CANVAS_SIZE = 225;
doc_canvas.width = CANVAS_SIZE;
doc_canvas.height = CANVAS_SIZE;
doc_rangeOutputSize.innerHTML = String(CANVAS_SIZE / 15);

/** @type {number} */
var TIEMPO_POR_FRAME = 500;
doc_rangeOutputTime.innerHTML = String(TIEMPO_POR_FRAME);

/**
 * @typedef {Object} Cuadrito
 * @property {number} x_position
 * @property {number} y_position
 * @property {number} number
 * @property {string} estate
 * @property {number} direction
 * @property {boolean} onBackground
 */

/**
 * @class
 */
class Game {
  constructor() {
    /** @type {Cuadrito[]} */
    this.cuadritos = [];

    /** @type {number} */
    this.cuadrosAlRededor = 0;

    /** @type {number} */
    this.generacion = 0;

    /** @type {boolean} */
    this.isPausa = true;
  }

  /**
   * Funcion que matiene ejecutando el juego dependiendo del estado isPausa
   */
  gameLoop() {
    this.pintarCuadros();
    if (!this.isPausa) {
      setTimeout(() => {
        this.nextGeneration();
        window.requestAnimationFrame(() => this.gameLoop());
      }, TIEMPO_POR_FRAME);
    }
  }

  /**
   * Funcion que dibuja la grilla y los carga en la lista cuadritos
   */
  initialGrill() {
    this.cuadritos = [];
    let columnas = [],
      filas = [],
      contador = 0;
    doc_ctx.strokeStyle = ESTADOS.BACKGROUND;
    doc_ctx.lineWidth = 1;

    // construir columnas
    columnas.push(0);
    for (let i = BLOCK_SIZES.ancho; i < CANVAS_SIZE; i += BLOCK_SIZES.ancho) {
      doc_ctx.beginPath();
      doc_ctx.moveTo(i, 0);
      doc_ctx.lineTo(i, CANVAS_SIZE);
      doc_ctx.stroke();
      columnas.push(i);
    }
    doc_ctx.closePath();

    // construir filas
    filas.push(0);
    for (let i = BLOCK_SIZES.alto; i < CANVAS_SIZE; i += BLOCK_SIZES.alto) {
      doc_ctx.beginPath();
      doc_ctx.moveTo(0, i);
      doc_ctx.lineTo(CANVAS_SIZE, i);
      doc_ctx.stroke();
      filas.push(i);
    }
    doc_ctx.closePath();

    // cargar filas y columnas al juego
    for (let y = 0; y < filas.length; y++) {
      for (let x = 0; x < columnas.length; x++) {
        /** @type {Cuadrito} */
        const cuadrito = {
          x_position: columnas[x],
          y_position: filas[y],
          number: contador,
          direction: DIRECTIONS.ARRIBA,
          estate: ESTADOS.BACKGROUND,
          onBackground: true,
        };
        contador++;
        this.cuadritos.push(cuadrito);
      }
    }

    // console.log(this.cuadritos);
  }

  /**
   * Pinta del color correspondiente a los cuadraditos segun sus estados
   */
  pintarCuadros() {
    this.cuadritos.forEach((cuadro) => {
      switch (cuadro.estate) {
        case ESTADOS.VIVO:
          doc_ctx.fillStyle = ESTADOS.VIVO;
          doc_ctx.fillRect(
            cuadro.x_position,
            cuadro.y_position,
            BLOCK_SIZES.ancho,
            BLOCK_SIZES.alto
          );
          // console.log(JSON.stringify(cuadro, null, 4));
          break;
        case ESTADOS.MUERTO:
          doc_ctx.fillStyle = ESTADOS.MUERTO;
          doc_ctx.fillRect(
            cuadro.x_position,
            cuadro.y_position,
            BLOCK_SIZES.ancho,
            BLOCK_SIZES.alto
          );
          break;
        case ESTADOS.BACKGROUND:
          doc_ctx.fillStyle = ESTADOS.BACKGROUND;
          doc_ctx.fillRect(
            cuadro.x_position,
            cuadro.y_position,
            BLOCK_SIZES.ancho,
            BLOCK_SIZES.alto
          );

          // lineas
          doc_ctx.strokeStyle = "rgb(245, 245, 245)";
          doc_ctx.strokeRect(
            cuadro.x_position,
            cuadro.y_position,
            BLOCK_SIZES.ancho,
            BLOCK_SIZES.alto
          );
          break;

        default:
          break;
      }
    });
  }

  /**
   *
   * @param {number} numero_de_cuadrito posicion del cuadrito al que se le va a cambiar el estado
   * @param {string} estado nuevo estado para el cuadrito
   */
  changeStateOfCuadrito(numero_de_cuadrito, estado) {
    const newCuadritos = this.cuadritos.map((cuadrito) => {
      return cuadrito.number === numero_de_cuadrito
        ? { ...cuadrito, estate: estado }
        : cuadrito;
    });

    this.cuadritos = newCuadritos;
  }

  /**
   * se encarga de ejecutar las generaciones
   */
  nextGeneration() {
    /** @type {Cuadrito} */
    let hormiga = this.cuadritos.find(
      (cuadro) => cuadro.estate === ESTADOS.VIVO
    );

    // calcula la nueva dirección
    const newDireccion = this.normalizarGrados(
      hormiga.onBackground
        ? // si la hormiga esta sobre blanco
          hormiga.direction - 90
        : // si la hormiga esta sobre negro
          hormiga.direction + 90
    );

    // busca la nueva posicion de la hormiga
    /** @type {Cuadrito} */
    const nextHormiga = this.buscarSiguienteHormiga(
      newDireccion,
      hormiga.x_position,
      hormiga.y_position
    );

    // si no la encuentra finaliza
    if (!nextHormiga) {
      this.togglePausa();
      return;
    }

    // ejecuta la logica de movimiento y la carga a la lista de cuadritos
    this.cuadritos = this.logicaDeMovimiento(
      hormiga,
      nextHormiga,
      newDireccion
    );

    this.generacion++;
    doc_generacion.textContent = `${this.generacion}`;
  }

  /**
   * Funcion que normaliza angulos entro 0 y 360
   * @param {number} angulo Valor que se quiera normalizar a grados entre 0 y 360
   * @returns number
   */
  normalizarGrados(angulo) {
    angulo = angulo % 360;
    if (angulo < 0) {
      angulo += 360;
    }
    return angulo;
  }

  /**
   * Funcion que mapea la posicion de la hormiga
   * @param {Cuadrito} hormiga
   * @param {Cuadrito} nextHormiga
   * @param {number} direccion
   * @returns {Array<Cuadrito>}
   */
  logicaDeMovimiento(hormiga, nextHormiga, direccion) {
    return this.cuadritos.map((cuadro) => {
      // si es la hormiga
      if (cuadro.number === hormiga.number) {
        // si la hormiga está sobre blanco se convierte en negro, sino vuelve a blanco
        cuadro.onBackground
          ? (cuadro.estate = ESTADOS.MUERTO)
          : (cuadro.estate = ESTADOS.BACKGROUND);
      }

      // la siguiente posicion de la hormiga
      if (cuadro.number === nextHormiga.number) {
        // si la siguiente posicion es negro cambia el estado onBackground a false, sino true
        cuadro.estate === ESTADOS.MUERTO
          ? (cuadro.onBackground = false)
          : (cuadro.onBackground = true);

        cuadro.estate = ESTADOS.VIVO;
        cuadro.direction = direccion;
      }

      return cuadro;
    });
  }

  /**
   * Funcion que calcula la siguiente posicion de la hormiga segun su direccion
   * @param {number} direccion direccion de la hormiga
   * @param {number} x posicion "x" actual de la hormiga
   * @param {number} y posicion "y" actual de la hormiga
   * @returns Cuadrito
   */
  buscarSiguienteHormiga(direccion, x, y) {
    switch (direccion) {
      case DIRECTIONS.ARRIBA:
        return this.buscarPorCoordenadas(x, y - BLOCK_SIZES.alto);
      case DIRECTIONS.DERECHA:
        return this.buscarPorCoordenadas(x + BLOCK_SIZES.ancho, y);
      case DIRECTIONS.ABAJO:
        return this.buscarPorCoordenadas(x, y + BLOCK_SIZES.alto);
      case DIRECTIONS.IZQUIERDA:
        return this.buscarPorCoordenadas(x - BLOCK_SIZES.ancho, y);
    }
  }

  /**
   * Funcion que busca un cuadrito por sus coordenadas
   * @param {number} x Posición x
   * @param {number} y Posición y
   * @returns {Cuadrito}
   */
  buscarPorCoordenadas(x, y) {
    return this.cuadritos.find(
      (cuadro) => cuadro.x_position === x && cuadro.y_position === y
    );
  }

  togglePausa() {
    this.isPausa = !this.isPausa;

    if (!this.isPausa) {
      btnPausa.innerHTML = "Pausar";
      window.requestAnimationFrame(() => game.gameLoop());
    }

    if (this.isPausa) {
      btnPausa.innerHTML = "Iniciar";
    }
  }

  clearAll() {
    this.isPausa = true;
    btnPausa.innerHTML = "Iniciar";

    this.generacion = 0;
    this.isPausa = true;
    doc_generacion.textContent = "0";

    setTimeout(() => {
      doc_ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      this.initialGrill();
      this.changeStateOfCuadrito(this.calculateMiddle(), ESTADOS.VIVO);
      this.pintarCuadros();
    }, 50);
  }

  /**
   * Funcion que calcula la posicion del cuadro central
   * @returns {number}
   */
  calculateMiddle() {
    return Math.floor(Math.pow(CANVAS_SIZE / 15, 2) / 2);
  }
}

const game = new Game();
game.initialGrill();

// console.log(game.calculateMiddle());

game.changeStateOfCuadrito(game.calculateMiddle(), ESTADOS.VIVO);

window.requestAnimationFrame(() => game.gameLoop());

btnClear.addEventListener("click", () => game.clearAll());
btnPausa.addEventListener("click", () => game.togglePausa());

function procesarDown(evt) {
  switch (evt.code) {
    case "Space":
      game.nextGeneration();
      game.pintarCuadros();
      break;
  }
}
document.addEventListener("keydown", procesarDown);

const onRangeSizeChange = (value) => {
  if (Math.floor((value * 15) % 2) !== 0) {
    game.clearAll();
    doc_rangeOutputSize.innerHTML = value;
    CANVAS_SIZE = value * 15;
    doc_canvas.width = value * 15;
    doc_canvas.height = value * 15;

    game.initialGrill();
    game.changeStateOfCuadrito(game.calculateMiddle(), ESTADOS.VIVO);
    game.pintarCuadros();
  }
};

const onRangeTimeChange = (value) => {
  TIEMPO_POR_FRAME = 1020 - value;
  doc_rangeOutputTime.innerHTML = String(1020 - value);
};
