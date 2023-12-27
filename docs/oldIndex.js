const canvas = document.querySelector("canvas"),
  ctx = canvas.getContext("2d"),
  w = canvas.width,
  h = canvas.height,
  generacion = document.querySelector(".botonera p"),
  btnPausa = document.getElementById("btnPausa"),
  btnClear = document.getElementById("btnClear");

var cuadritos = [],
  sizeCuadro = { ancho: 15, alto: 15 },
  color = "#FFFFFF",
  estado = 0,
  cuadrosAlRededor = 0,
  cantCuadradosX = w / sizeCuadro.ancho,
  cantCuadradosY = h / sizeCuadro.alto,
  cantCuadradosTotales = cantCuadradosX * cantCuadradosY,
  pausa = true,
  cont = 0,
  mouse = 0,
  gen = 0,
  direccion = 0; //0 = norte, 90 = este, 180 = sur, 270 = oeste;

//reglas del juego
/*
- Si está sobre un cuadrado blanco, cambia el color del cuadrado, gira noventa grados a la izquierda y avanza un cuadrado.
- Si está sobre un cuadrado negro, cambia el color del cuadrado, gira noventa grados a la derecha y avanza un cuadrado.
*/

function gameloop() {
  pintarVivos(); //PINTA LOS VIVOS
  if (!pausa) {
    setTimeout(function () {
      nextGeneration();

      window.requestAnimationFrame(gameloop);
    }, 30);
  }
}

function nextGeneration() {
  var hormiga = [];
  cuadritos.forEach(function (cuadro) {
    if (cuadro[3] == 2 || cuadro[3] == 3) hormiga = cuadro;
  });
  //console.log(hormiga);
  if (typeof hormiga != "undefined") {
    if (hormiga[3] == 2) {
      //si la hormiga esta sobre blanco
      //console.log("blanco");
      hormiga[3] = 1; //cambia el la casilla a negra

      //gira a la izquierda
      if (hormiga[4] == 0) hormiga[4] = 270;
      else hormiga[4] -= 90;

      //console.log("blanco-" + hormiga[4]);
      avanzar(hormiga[0], hormiga[1], hormiga[4]);
    } else if (hormiga[3] == 3) {
      //si la hormiga esta sobre negro
      //console.log("negro");
      hormiga[3] = 0;
      if (hormiga[4] == 360) hormiga[4] = 90;
      else hormiga[4] += 90;

      //console.log("negro-" + hormiga[4]);
      avanzar(hormiga[0], hormiga[1], hormiga[4]);
    }
  }
  gen++;
  generacion.innerHTML = "Generacion: " + gen;
}

function avanzar(x, y, direccion) {
  var cuadro;
  //console.log(direccion);
  if (direccion == 0 || direccion == 360) {
    //norte
    cuadro = cuadritos[findByXY(x, y - sizeCuadro.alto)]; //busca el cuadro al norte
    if (typeof cuadro != "undefined") {
      cuadro[3] += 2; //lo combierte en hormiga
      cuadro[4] = cuadritos[findByXY(x, y)][4]; //le setea la direccion
      //console.log("norte: " + cuadro);
    }
  }
  if (direccion == 90) {
    //este
    cuadro = cuadritos[findByXY(x + sizeCuadro.ancho, y)];
    cuadro[3] += 2;
    cuadro[4] = cuadritos[findByXY(x, y)][4];
    //console.log("este: " + cuadro);
  }
  if (direccion == 180) {
    //sur
    cuadro = cuadritos[findByXY(x, y + sizeCuadro.alto)];
    cuadro[3] += 2;
    cuadro[4] = cuadritos[findByXY(x, y)][4];
    //console.log("sur: " + cuadro);
  }
  if (direccion == 270) {
    //oeste
    cuadro = cuadritos[findByXY(x - sizeCuadro.ancho, y)];
    cuadro[3] += 2;
    cuadro[4] = cuadritos[findByXY(x, y)][4];
    //console.log("oeste: " + cuadro);
  }
}

function findByXY(x, y) {
  return cuadritos.findIndex(
    (cuadro) =>
      x >= cuadro[0] &&
      x < cuadro[0] + sizeCuadro.ancho &&
      y >= cuadro[1] &&
      y < cuadro[1] + sizeCuadro.alto
  );
}

function pintarVivos() {
  cuadritos.forEach(function (cuadro) {
    if (cuadro[3] == 0) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(cuadro[0], cuadro[1], sizeCuadro.ancho, sizeCuadro.alto); //x, y, ancho, alto
    } else if (cuadro[3] == 1) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(cuadro[0], cuadro[1], sizeCuadro.ancho, sizeCuadro.alto); //x, y, ancho, alto
    } else if (cuadro[3] == 2 || cuadro[3] == 3) {
      ctx.fillStyle = "#FF0000";
      ctx.fillRect(cuadro[0], cuadro[1], sizeCuadro.ancho, sizeCuadro.alto); //x, y, ancho, alto
    }
  });
}

function Estado(cuadrito, estado) {
  //recibe cuadrito y define segun estado
  //0 = blanco, 1 = negro, 2 = 3 = rojo;
  //2 = rojo sobre blanco, 3 = rojo sobre negro;
  cuadritos[cuadrito][3] = estado;
  if (estado == 2 || estado == 3) {
    cuadritos[cuadrito][4] = 360;
  }
}

function Estados(cuad) {
  //recibe cuadrito y cambia su estado
  var cuadrito = cuadritos[cuad];
  cuadrito[3] == 1 ? (cuadrito[3] = 0) : (cuadrito[3] = 1);
}

/*canvas.onclick = function(e){
var canvaspos = canvas.getBoundingClientRect();
//console.log(findByXY(e.clientX - canvaspos.left, e.clientY - canvaspos.top));
Estados(findByXY(e.clientX - canvaspos.left, e.clientY - canvaspos.top), 2);

ctx.clearRect(0, 0, w, h); //limpia Canvas
dibujarCuadrilla(sizeCuadro.ancho, sizeCuadro.alto, 1, color, 0);
pintarVivos();
};*/

//DIBUJA CUADRILLA
function dibujarCuadrilla(disX, disY, anchoLinea, color, lista) {
  ctx.strokeStyle = color;
  ctx.lineWidth = anchoLinea;
  var columnas = [],
    filas = [];
  columnas.push(0);
  filas.push(0);

  for (let i = disX; i < w; i += disX) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, h);
    ctx.stroke();
    columnas.push(i);
  }

  ctx.closePath();
  for (let i = disY; i < h; i += disY) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(w, i);
    ctx.stroke();
    filas.push(i);
  }

  if (lista == 1) {
    for (let y = 0; y < filas.length; y++) {
      for (let x = 0; x < columnas.length; x++) {
        //x, y, num, estado, direccion;
        cuadritos.push([columnas[x], filas[y], 0, estado, 0]);
      }
    }
  }
}

dibujarCuadrilla(sizeCuadro.ancho, sizeCuadro.alto, 1, color, 1);

Estado(594, 2);
//Estado(0, 2);

btnPausa.addEventListener("click", () => {
  if (pausa == false) {
    pausa = true;
    btnPausa.innerHTML = "Reanudar";
  } else {
    pausa = false;
    btnPausa.innerHTML = "Pausa";
    window.requestAnimationFrame(gameloop);
  }
});
btnClear.addEventListener("click", () => {
  pausa = true;
  btnPausa.innerHTML = "Reanudar";
  generacion.innerHTML = "Generacion: 0";
  cuadritos.length = 0;
  gen = 0;
  ctx.clearRect(0, 0, w, h); //limpia Canvas
  dibujarCuadrilla(sizeCuadro.ancho, sizeCuadro.alto, 1, color, 1);
  Estado(594, 2);
  pintarVivos();
});

///////////////////////TECLAS///////////////////////
function procesarDown(evt) {
  switch (evt.code) {
    case "KeyS":
      nextGeneration();
      pintarVivos(); //PINTA LOS VIVOS
      break;
  }
}

document.addEventListener("keydown", procesarDown);

window.requestAnimationFrame(gameloop);
