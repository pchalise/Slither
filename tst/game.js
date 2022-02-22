let canvas;
let grph;
let MIDW, MIDH;

const dim_in = new URLSearchParams(window.location.search);

function setup() {
  pixelDensity(0.5);
  canvas = createCanvas(windowWidth, windowHeight);
  MIDW = windowWidth / 2;
  MIDH = windowHeight / 2;
  ctx = canvas.elt.getContext("2d");
  noSmooth();
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  background(0);
  const param = {
    x: 20,
    y: 20,
    width: dim_in.get("width") ?? 10,
    height: dim_in.get("height") ?? 10,
    size: 50,
    p_num: 2,
  };
  grph = new ChessGraph(param);
}

function mouseClicked() {
  grph.handleMouseClick();
}

function draw() {
  background(0);
  grph.draw();
}
