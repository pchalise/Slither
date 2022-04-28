let canvas;
let grph;
let MIDW, MIDH;
let TILE_SIZE;
let PCLRS;
let bots = new Set();

let SIM_STEPS = 0;
let HIST = [0];
let INIT = true;

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
  frameRate(60);
  MIDW = windowWidth / 2;
  MIDH = windowHeight / 2;
  PCLRS = [color(244, 92, 78), color(71, 125, 239), color(55, 126, 127)];

  const width = +dim_in.get("width") || 10;
  const height = +dim_in.get("height") || 15;
  const p_num = +dim_in.get("players") || 2;
  const bot_in = dim_in.get("bots") || "";
  const sim = +dim_in.get("sim") || "no";

  if (sim !== "no" && INIT) {
    INIT = false;
    HIST = new Array(p_num).fill(0);
    SIM_STEPS = sim;
  }

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
    bot_move.edge = grph.edges[Math.floor(random(grph.edges.length))];
    [bot_move.nax, bot_move.nay, bot_move.nbx, bot_move.nby] =
      grph.convertEdgeXY(bot_move.edge.na, bot_move.edge.nb);
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

function showLosses() {
  textSize(20);
  textAlign(LEFT);
  stroke(250);
  strokeWeight(0);
  fill(250);
  const total = HIST.reduce((a, b) => a + b);
  const loss_hist_txt = HIST.map((e) => Math.floor(100 * (e / total))).join(
    " "
  );
  text(loss_hist_txt + " (LOSSES)", 20, 30);
  text(`Left: ${SIM_STEPS}`, 20, 50);
  const win_hist_txt = HIST.map((e) => Math.floor(100 * (1 - e / total))).join(
    " "
  );
  text(win_hist_txt + " (WINS)", 20, 70);
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
  if (!INIT) showLosses();
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
  if (SIM_STEPS > 0) {
    // background(0);
    SIM_STEPS--;
    HIST[LOSER]++;
    gameState = gameSetup;
    return;
  }
  textAlign(CENTER);
  textSize(TILE_SIZE / 2);
  stroke(0);
  strokeWeight(4);
  fill(PCLRS[Math.min(LOSER, PCLRS.length - 1)]);
  const loser_text = (bots.has(LOSER) ? "Computer " : "") + (LOSER + 1);
  text(`${loser_text} loses!`, windowWidth / 2, windowHeight / 2);
}
