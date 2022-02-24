let canvas;
let grph;
let MIDW, MIDH;
let TILE_SIZE;

let gameState;

let WINNER;

const dim_in = new URLSearchParams(window.location.search);

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  MIDW = windowWidth / 2;
  MIDH = windowHeight / 2;

  ctx = canvas.elt.getContext("2d");
  // noSmooth();
  // ctx.mozImageSmoothingEnabled = false;
  // ctx.webkitImageSmoothingEnabled = false;
  // ctx.msImageSmoothingEnabled = false;
  // ctx.imageSmoothingEnabled = false;
  background(0);

  const width = +dim_in.get("width") || 10;
  const height = +dim_in.get("height") || 15;

  const PADW = width + 0.5;
  const PADH = height + 0.5;
  let size = Math.min(windowHeight, windowWidth) / Math.max(PADH, PADW);
  TILE_SIZE = size;

  const param = {
    x: Math.floor(MIDW - ((width - 1) * size) / 2),
    y: Math.floor(MIDH - ((height - 1) * size) / 2),
    width,
    height,
    size,
    p_num: 2,
  };

  grph = new ChessGraph(param);
  gameState = playGame;
}

function mouseClicked() {
  grph.handleMouseClick();
}

function draw() {
  gameState();
}

function playGame() {
  background(0);
  if (grph.valid_moves.length === 0 && !grph.isFirstClick) {
    gameState = endGame;
    WINNER = grph.move_number % grph.p_num;
  }
  grph.draw();
}

function endGame() {
  textAlign(CENTER);
  textSize(TILE_SIZE / 2);
  stroke(0);
  strokeWeight(4);
  fill(200);
  text(`${WINNER} wins!`, windowWidth / 2, windowHeight / 2);
}
