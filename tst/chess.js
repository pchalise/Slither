const [REACH, ON, OFF] = [0, 1, 2];
class Edge {
  constructor(na, nb) {
    this.na = na;
    this.nb = nb;
    this.state = 0;
    this.strk = [9, 12, 12, 12];
    this.color = [
      color(100, 100, 100, 50),
      color(100, 100, 100, 90),
      color(20, 20, 160),
      color(160, 20, 20),
    ];
    this.max_state = this.strk.length;

    this.isHover = true;
  }

  draw() {
    const { na, nb, strk, state, color } = this;
    strokeWeight(strk[state]);
    stroke(color[state]);
    line(na.x, na.y, nb.x, nb.y);
  }

  handleClick(p) {
    if (this.handleMouse) {
      this.state = p;
      this.isHover = false;
    }
  }

  handleMouse() {
    if (!this.isHover) return;
    const strk = this.strk[this.state];
    if (
      mouseX > this.na.x - strk &&
      mouseY > this.na.y - strk &&
      mouseX < this.nb.x + strk &&
      mouseY < this.nb.y + strk
    ) {
      this.state = 1;
      return true;
    } else this.state = 0;
    return false;
  }
}

class ChessGraph {
  constructor(
    params = { x: 20, y: 20, width: 10, height: 10, size: 50, p_num: 2 }
  ) {
    const { x, y, width, height, size, p_num } = params;
    this.p_num = p_num;
    this.width = width;
    this.height = height;
    this.size = size;
    this.X = x;
    this.Y = y;
    /*
    0 - reach state
    1 - on state
    2 - off state

    An edge can be created if one of its nodes is reachable and
    nonde of them is off
    */
    this.node_colors = [
      color(120, 50, 50),
      color(50, 120, 50),
      color(220, 220, 220),
    ];

    this.nodes = Array(width)
      .fill(null)
      .map(() => Array(height).fill(1));
    this.edges = new Array((width - 1) * height + (height - 1) * width);
    this.isHovering = false;
    this.hoverIndex = -1;
    this.curr_p = 0;
    this.isFirstClick = true;

    this.tips = [
      [-1, -1],
      [-1, -1],
    ];
    this.ctip = 0;
    this.move_number = 0;

    this.valid_moves = [];

    this.buildNetwork();
  }

  canReach(a, b) {
    return (a === ON) ^ (b === ON) && a !== OFF && b !== OFF;
  }

  updateReach() {
    const { nodes } = this;
    this.valid_moves = [];
    nodes.forEach((row, x) => {
      row.forEach((node, y) => {
        if (node === ON) {
          if (x > 0 && nodes[x - 1][y] === REACH)
            this.valid_moves.push([x - 1, y]);
          if (y > 0 && nodes[x][y - 1] === REACH)
            this.valid_moves.push([x, y - 1]);
          if (x < this.width - 1 && nodes[x + 1][y] === REACH)
            this.valid_moves.push([x + 1, y]);
          if (y < this.height - 1 && nodes[x][y + 1] === REACH)
            this.valid_moves.push([x, y + 1]);
        }
      });
    });
  }

  handleMouseClick() {
    const edge = this.edges[this.hoverIndex];
    const { na, nb } = edge;

    const dx = this.X - 1,
      dy = this.Y - 1;

    const [nax, nay] = [
      Math.floor((na.x - dx) / this.size),
      Math.floor((na.y - dy) / this.size),
    ];
    const node_a = this.nodes[nax][nay];

    const [nbx, nby] = [
      Math.floor((nb.x - dx) / this.size),
      Math.floor((nb.y - dy) / this.size),
    ];
    const node_b = this.nodes[nbx][nby];

    if (
      this.isHovering &&
      (this.canReach(node_a, node_b) || this.isFirstClick)
    ) {
      if (this.isFirstClick) {
        this.nodes = Array(this.width)
          .fill(null)
          .map(() => Array(this.height).fill(0));
      }
      edge.handleClick(this.curr_p + 2);
      this.nodes[nax][nay]++;
      this.nodes[nbx][nby]++;

      this.updateReach();
      this.curr_p = (this.curr_p + 1) % this.p_num;

      this.isFirstClick = false;

      this.move_number++;
    }
  }

  handleMouse() {
    if (this.isHovering) {
      this.isHovering = this.edges[this.hoverIndex].handleMouse();
    } else
      this.edges.forEach((edge, i) => {
        if (this.isHovering || !edge.isHover) return;
        this.isHovering = edge.handleMouse();
        this.hoverIndex = i;
      });
  }

  draw() {
    this.edges.forEach((edge) => {
      edge.draw();
    });
    this.nodes.forEach((lin, x) =>
      lin.forEach((node, y) => {
        noStroke();
        let clr = this.node_colors[node];
        let radius = 10;

        if (node === ON) {
          this.tips[this.ctip][0] = x;
          this.tips[this.ctip][1] = y;
          this.ctip = (this.ctip + 1) % 2;
        }
        if (this.valid_moves.some((n) => n[0] === x && n[1] === y)) {
          radius = 15;
          clr = this.node_colors[1];
          stroke(200);
          strokeWeight(2);
        }
        fill(clr);
        circle(x * this.size + this.X, y * this.size + this.Y, radius);
      })
    );
    this.handleMouse();
  }

  buildNetwork() {
    const { width, height, size, X, Y } = this;

    let ce = 0;
    new Array(width * height).fill(0).forEach((node, index) => {
      const x = index % width;
      const y = Math.floor(index / width);
      // edges only added right and down
      if (y < height - 1) {
        this.edges[ce++] = new Edge(
          { x: X + x * size, y: Y + y * size },
          { x: X + x * size, y: Y + (y + 1) * size }
        );
      }
      if (x < width - 1) {
        this.edges[ce++] = new Edge(
          { x: X + x * size, y: Y + y * size },
          { x: X + (x + 1) * size, y: Y + y * size }
        );
      }
    });
  }
}
