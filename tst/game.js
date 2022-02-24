let canvas;
let grph;
let MIDW, MIDH;
let TILE_SIZE;
let PCLRS;
let bots = new Set();

let gameState;

let LOSER;

const dim_in = new URLSearchParams(window.location.search);

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

  ctx = canvas.elt.getContext("2d");
  // noSmooth();
  // ctx.mozImageSmoothingEnabled = false;
  // ctx.webkitImageSmoothingEnabled = false;
  // ctx.msImageSmoothingEnabled = false;
  // ctx.imageSmoothingEnabled = false;
  background(0);
  gameSetup();
}

function gameSetup() {
  MIDW = windowWidth / 2;
  MIDH = windowHeight / 2;
  PCLRS = [color(20, 20, 160), color(160, 20, 20), color(20, 160, 20)];

  const width = +dim_in.get("width") || 10;
  const height = +dim_in.get("height") || 15;
  const p_num = +dim_in.get("players") || 2;
  const bot_in = dim_in.get("bots") || "";

  bot_in.split(",").forEach((b) => bots.add(+b - 1));

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
    p_num,
  };

  grph = new ChessGraph(param);
  gameState = playGame;
}

function getBotMove() {
  let bot_move = {};
  if (grph.isFirstClick) {
    bot_move.nax = 0;
    bot_move.nay = 0;

    bot_move.nbx = 1;
    bot_move.nby = 0;
    bot_move.edge = grph.getEdge(bot_move);
  } else {
    const move_setup = () => {
      const move_index = Math.floor(random(grph.valid_moves.length));
      const target_node = grph.valid_moves[move_index];

      const [source_node] = grph.neighborsOf(
        target_node[0],
        target_node[1],
        ON
      );
      bot_move.nax = source_node[0];
      bot_move.nay = source_node[1];

      bot_move.nbx = target_node[0];
      bot_move.nby = target_node[1];
      bot_move.edge = grph.getEdge(bot_move);
    };
    crash_count = 0;
    do {
      move_setup();
      crash_count++;
    } while (bot_move.edge === undefined && crash_count < 20);
  }
  return bot_move;
}

function mouseClicked() {
  if (gameState === endGame) {
    gameState = gameSetup;
  }
  let type = "player";
  let bot_move = {};
  if (bots.has(grph.curr_p)) {
    type = "no";
  }

  grph.handleInput(type, bot_move);
}

function draw() {
  gameState();
}

function playGame() {
  background(0);
  if (bots.has(grph.curr_p)) {
    let type = grph.curr_p;
    let bot_move = getBotMove();
    grph.handleInput(type, bot_move);
  }
  if (grph.valid_moves.length === 0 && !grph.isFirstClick) {
    gameState = endGame;
    LOSER = grph.curr_p;
  }
  grph.draw();
}

function endGame() {
  textAlign(CENTER);
  textSize(TILE_SIZE / 2);
  stroke(0);
  strokeWeight(4);
  fill(PCLRS[Math.min(LOSER, PCLRS.length - 1)]);
  text(`${LOSER + 1} loses!`, windowWidth / 2, windowHeight / 2);
}
