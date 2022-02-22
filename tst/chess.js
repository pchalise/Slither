class Edge {
  constructor(na, nb) {
    this.na = na;
    this.nb = nb;
    this.state = 0;
    this.strk = [5, 8, 8, 8];
    this.color = [
      color(100, 100, 100, 50),
      color(100, 100, 100, 90),
      color(120, 120, 250),
      color(250, 120, 120),
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
    0 - unreachable state
    1 - reachable state
    2 - off state

    An edge can be created if one of its nodes is reachable and
    nonde of them is off
    */
    this.node_colors = [
      color(250, 100, 100),
      color(100, 250, 100),
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

    this.buildNetwork();
  }

  canReach(a, b) {
    return (a === 1) ^ (b === 1) && a !== 2 && b !== 2;
  }

  handleMouseClick() {
    const edge = this.edges[this.hoverIndex];
    const { na, nb } = edge;
    const [nax, nay] = [
      Math.floor(na.x / this.size),
      Math.floor(na.y / this.size),
    ];
    const node_a = this.nodes[nax][nay];

    const [nbx, nby] = [
      Math.floor(nb.x / this.size),
      Math.floor(nb.y / this.size),
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

      this.curr_p = (this.curr_p + 1) % this.p_num;
      this.isFirstClick = false;
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
        fill(this.node_colors[node]);
        circle(x * this.size + this.X, y * this.size + this.Y, 5);
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
