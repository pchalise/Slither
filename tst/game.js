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

  const width = +dim_in.get("width") || 10;
  const height = +dim_in.get("height") || 15;

  const PADW = width + 2;
  const PADH = height + 2;
  let size = Math.min(windowHeight, windowWidth) / Math.min(PADH, PADW);

  const param = {
    x: Math.floor(MIDW - ((width - 1) * size) / 2),
    y: Math.floor(MIDH - ((height - 1) * size) / 2),
    width,
    height,
    size,
    p_num: 2,
  };

  grph = new ChessGraph(param);
}

function mouseClicked() {
  grph.handleMouseClick();
}

function draw() {
  background(0);
  // console.log(mouseX - MIDW, mouseY - MIDH);
  grph.draw();
}
