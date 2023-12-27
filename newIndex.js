// @ts-check

/** @type {HTMLCanvasElement} */
const doc_canvas = document.querySelector("canvas"),
  /** @type {CanvasRenderingContext2D } */
  doc_ctx = doc_canvas.getContext("2d"),
  canvas_width = doc_canvas.width,
  canvas_height = doc_canvas.height,
  /** @type {HTMLElement} */
  doc_generacion = document.getElementById("generacion"),
  doc_btnPausa = document.getElementById("btnPausa"),
  doc_btnClear = document.getElementById("btnClear");

const SIZES = { ancho: 15, alto: 15 };
const CANT_CUADROS_HORIZONTAL = canvas_width / SIZES.ancho;
const CANT_CUADROS_VERTICAL = canvas_height / SIZES.alto;
const TIEMPO_POR_FRAME = 10;
const CANT_CUADROS_TOTALES = CANT_CUADROS_HORIZONTAL * CANT_CUADROS_VERTICAL;

const ESTADOS = {
  VIVO: "#FF0000",
  MUERTO: "#000000",
  BACKGROUND: "#FFFFFF",
};
const DIRECTIONS = {
  ARRIBA: 0,
  DERECHA: 90,
  ABAJO: 180,
  IZQUIERDA: 270,
};

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
    let columnas = [],
      filas = [],
      contador = 0;
    doc_ctx.strokeStyle = ESTADOS.BACKGROUND;
    doc_ctx.lineWidth = 1;

    // construir columnas
    columnas.push(0);
    for (let i = SIZES.ancho; i < canvas_width; i += SIZES.ancho) {
      doc_ctx.beginPath();
      doc_ctx.moveTo(i, 0);
      doc_ctx.lineTo(i, canvas_height);
      doc_ctx.stroke();
      columnas.push(i);
    }
    doc_ctx.closePath();

    // construir filas
    filas.push(0);
    for (let i = SIZES.alto; i < canvas_height; i += SIZES.alto) {
      doc_ctx.beginPath();
      doc_ctx.moveTo(0, i);
      doc_ctx.lineTo(canvas_width, i);
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
            SIZES.ancho,
            SIZES.alto
          );
          // console.log(JSON.stringify(cuadro, null, 4));
          break;
        case ESTADOS.MUERTO:
          doc_ctx.fillStyle = ESTADOS.MUERTO;
          doc_ctx.fillRect(
            cuadro.x_position,
            cuadro.y_position,
            SIZES.ancho,
            SIZES.alto
          );
          break;
        case ESTADOS.BACKGROUND:
          doc_ctx.fillStyle = ESTADOS.BACKGROUND;
          doc_ctx.fillRect(
            cuadro.x_position,
            cuadro.y_position,
            SIZES.ancho,
            SIZES.alto
          );

          // lineas
          doc_ctx.strokeStyle = "#a2a2a2";
          doc_ctx.strokeRect(
            cuadro.x_position,
            cuadro.y_position,
            SIZES.ancho,
            SIZES.alto
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
        return this.buscarPorCoordenadas(x, y - SIZES.alto);
      case DIRECTIONS.DERECHA:
        return this.buscarPorCoordenadas(x + SIZES.ancho, y);
      case DIRECTIONS.ABAJO:
        return this.buscarPorCoordenadas(x, y + SIZES.alto);
      case DIRECTIONS.IZQUIERDA:
        return this.buscarPorCoordenadas(x - SIZES.ancho, y);
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
    this.generacion = 0;
    this.isPausa = true;
    doc_generacion.textContent = "0";

    doc_ctx.clearRect(0, 0, canvas_width, canvas_height);
    this.initialGrill();
    this.changeStateOfCuadrito(
      Math.round(CANT_CUADROS_TOTALES / 2),
      ESTADOS.VIVO
    );
    this.pintarCuadros();
  }
}

const game = new Game();
game.initialGrill();
// console.log(Math.round(CANT_CUADROS_TOTALES / 2));
game.changeStateOfCuadrito(Math.round(CANT_CUADROS_TOTALES / 2), ESTADOS.VIVO);

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
