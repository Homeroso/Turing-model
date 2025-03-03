let pg; // Buffer gráfico para la textura
let grid;
let next;
let model; // Variable para el modelo OBJ
let feedSlider, kSlider; // Controles para personalizar

//Parametros para la textura
let dA = 1;
let dB = 0.25;
let feed = 0.041;
let k = 0.065;
let preset = "spots";

//---------------------------
//Implementación del modelo
//---------------------------

// Inicializa la cuadrícula según el preset
function initializeGrid(preset) {
  for (let x = 0; x < pg.width; x++) {
    for (let y = 0; y < pg.height; y++) {
      grid[x][y] = { a: 1, b: 0 };
      next[x][y] = { a: 1, b: 0 };
    }
  }

  // Condiciones iniciales según el preset
  for (let x = 0; x < pg.width; x++) {
    for (let y = 0; y < pg.height; y++) {
      let sf = 8;
      let b = noise(x * (sf / pg.width), y * (sf / pg.height));
      if (preset === "spots" || preset === "cellSplitting") {
        b = b > 0.45 ? b : 0;
      } else if (preset === "stripes") {
        b *= x % 50 < 20 ? 0.75 : 0.25;
      }
      grid[x][y].b = b;
    }
  }
}

// Establece los parámetros según el preset
function setPreset(newPreset) {
  preset = newPreset;
  if (preset === "spots") {
    dB = 0.25;
    feed = 0.041;
    k = 0.065;
  } else if (preset === "stripes") {
    dB = 0.55;
    feed = 0.042;
    k = 0.062;
  } else if (preset === "cellSplitting") {
    dB = 0.5;
    feed = 0.035;
    k = 0.065;
  }
  initializeGrid(preset);
}

function setup() {
  createCanvas(600, 600, WEBGL);
  pg = createGraphics(200, 200);
  pg.pixelDensity(1);

  // Inicializar las cuadrículas
  grid = [];
  next = [];
  for (let x = 0; x < pg.width; x++) {
    grid[x] = [];
    next[x] = [];
    for (let y = 0; y < pg.height; y++) {
      grid[x][y] = { a: 1, b: 0 };
      next[x][y] = { a: 1, b: 0 };
    }
  }

  // Configurar el preset inicial
  setPreset("spots");

  // Crear botones para cambiar los patrones
  let spotsButton = createButton('Puntos');
  spotsButton.position(10, 10);
  spotsButton.mousePressed(() => setPreset("spots"));

  let stripesButton = createButton('Rayas');
  stripesButton.position(10, 40);
  stripesButton.mousePressed(() => setPreset("stripes"));

  let cellButton = createButton('Manchas');
  cellButton.position(10, 70);
  cellButton.mousePressed(() => setPreset("cellSplitting"));
}

function drawInner() {
  for (let x = 1; x < pg.width - 1; x++) {
    for (let y = 1; y < pg.height - 1; y++) {
      let a = grid[x][y].a;
      let b = grid[x][y].b;
      next[x][y].a = a + dA * laplaceA(x, y) - a * b * b + feed * (1 - a);
      next[x][y].b = b + dB * laplaceB(x, y) + a * b * b - (k + feed) * b;
      next[x][y].a = constrain(next[x][y].a, 0, 1);
      next[x][y].b = constrain(next[x][y].b, 0, 1);
    }
  }
  swap();
}

//----------------------------------
//Iluminación
//-----------------------------------


function phongIllumination() {
  
  let dx = 300; 
  let dy = 200; 
  let dz = -600; 
  let v = createVector(dx, dy, dz); 
   
  ambientLight(0, 0,255); 
    
  directionalLight(255, 20, 0, v); 
    
  shininess(255); 
  specularColor(255); 
  specularMaterial(255); 
    
  pointLight(255, 255, 255, 0, -50, 0); 
  pointLight(255, 255, 255, 200,200,30); 
}

function draw() { 
  
  // Actualizar la simulación
  for (let i = 0; i < 10; i++) {
    drawInner();
  }

  // Generar la textura en el buffer
  pg.loadPixels();
  for (let x = 0; x < pg.width; x++) {
    for (let y = 0; y < pg.height; y++) {
      let pix = (x + y * pg.width) * 4;
      let a = next[x][y].a;
      let b = next[x][y].b;
      let c = floor((a - b) * 255);
      c = constrain(c, 0, 255);
      pg.pixels[pix + 0] = c;     // R (rojo)
      pg.pixels[pix + 1] = c;     // G (verde)
      pg.pixels[pix + 2] = 0;     // B (azul)
      pg.pixels[pix + 3] = 255;   // A (alfa)
    }
  }
  pg.updatePixels();

  
  orbitControl()

  phongIllumination();

  background(0); 
  
  push(); 
  translate(0,0,0)
  texture(pg);
  createTiger(); 
  pop();
  
}

// Funciones auxiliares
function laplaceA(x, y) {
  let sumA = 0;
  sumA += grid[x][y].a * -1;
  sumA += grid[x - 1][y].a * 0.2;
  sumA += grid[x + 1][y].a * 0.2;
  sumA += grid[x][y + 1].a * 0.2;
  sumA += grid[x][y - 1].a * 0.2;
  sumA += grid[x - 1][y - 1].a * 0.05;
  sumA += grid[x + 1][y - 1].a * 0.05;
  sumA += grid[x + 1][y + 1].a * 0.05;
  sumA += grid[x - 1][y + 1].a * 0.05;
  return sumA;
}

function laplaceB(x, y) {
  let sumB = 0;
  sumB += grid[x][y].b * -1;
  sumB += grid[x - 1][y].b * 0.2;
  sumB += grid[x + 1][y].b * 0.2;
  sumB += grid[x][y + 1].b * 0.2;
  sumB += grid[x][y - 1].b * 0.2;
  sumB += grid[x - 1][y - 1].b * 0.05;
  sumB += grid[x + 1][y - 1].b * 0.05;
  sumB += grid[x + 1][y + 1].b * 0.05;
  sumB += grid[x - 1][y + 1].b * 0.05;
  return sumB;
}

function swap() {
  let temp = grid;
  grid = next;
  next = temp;
}

//----------------------------------
//Modelo del "tigre"
//----------------------------------


function createTiger(){
  noStroke();
  
  // Tiger's body
  push();
  translate(0, 20, 0);
  scale(1.5, 0.8, 1);
  ellipsoid(30, 50, 80);
  
  pop();
  
  // Head
  push();
  translate(0, -20, 80);
  sphere(30);
  
  // Eyes
  push();
  translate(-12, -8, 25);
  fill(255);
  sphere(5);
  pop();
  
  push();
  translate(12, -8, 25);
  fill(255);
  sphere(5);
  pop();
  
  // Nose
  push();
  translate(0, 5, 25);
  fill(0);
  sphere(6);
  pop();
  
  // Mouth
  push();
  translate(0, 15, 20);
  rotateX(90);
  fill(200, 0, 0);
  cylinder(10, 5);
  pop();
  
  // Ears
  push();
  translate(-20, -25, 0);
  rotateZ(45);
  fill(255, 165, 0);
  cone(10, 20);
  pop();
  
  push();
  translate(20, -25, 0);
  rotateZ(-45);
  fill(255, 165, 0);
  cone(10, 20);
  pop();
  
  pop();
  
  // Legs
  drawLeg(-30, 60, -30);
  drawLeg(30, 60, -30);
  drawLeg(-30, 60, 30);
  drawLeg(30, 60, 30);
  
  // Tail
  push();
  translate(0, 20, -80);
  rotateX(90);

  fill(255, 165, 0);
  cylinder(5, 60);
  pop();

}

function drawLeg(x, y, z) {
  push();
  translate(x, y, z);
  fill(255, 165, 0);
  cylinder(8, 80);
  
  // Paw
  translate(0, 40, 0);
  fill(200);
  sphere(10);
  pop();
}
