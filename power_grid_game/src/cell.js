window.lastCalcAns = new Map();

class Cell {
  static originPriority = {priority: Number.MIN_SAFE_INTEGER, x: -1, y:-1};
  static kclEquations = [];
  static collectRenewCell = new Set();

  static offset = {
    up:    { dx: 0, dy: -1 },
    down:  { dx: 0, dy: 1 },
    left:  { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 }
  };
  static createDot = () => Object.assign(document.createElement('div'), { className: 'center-dot' });
  static inBounds = (x, y) => { //範囲内か判定
    return x >= 0 && y >= 0 && x < gridSize && y < gridSize;
  };
  static branchKey(n1, n2, prefix) {
    const low  = Math.min(n1, n2);
    const high = Math.max(n1, n2);
    return { low, high, name: `${prefix}_${low}_${high}` };
  }
  static changeDialog (text, nowValue) {
    const parseNum = result => {
      return parseFloat(
        result
          .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
          .replace(/．/g, '.')
          .replace(/[−ー－]/g, '-')
          .replace(/,/g, '')
          .match(/[-+]?[0-9]+(\.[0-9]+)?/)?.[0] ?? 'NaN'
      );
    };
    const ansString = prompt(text, nowValue);
    if (typeof ansString != "string") return nowValue;
    const ansNum = parseNum(ansString);
    return (isNaN(ansNum)||ansNum == 0)?nowValue:ansNum;
  }
  static moldingBranch (other, nodeId, IorV) {
    const resp = Cell.branchKey(other, nodeId, IorV);
    //流出側に揃える
    resp.sign = (nodeId === resp.low ?  1 : -1);
    return resp;
  }
  static EPS = 1e-9;
  static fix(v){
    const ans = Math.abs(v - Math.round(v)) < Cell.EPS
      ? Math.round(v)
      : Number(Math.round(v*1e4)/1e4);
    //マイナスゼロ除け
    return ans+0;
  }

  static connectableType = [];
  static electricPart = ["wire", "battery", "resistor", "led", "switch"];
  static priority = 0;
  static nextNodeId = 0;
  static update = [];

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = null;
    this.connection = [];
    this.editable = true;
    this.voltage = null;
    this.allowedDirections = [];
    this.resetTimeStamp = 0;
    this.calcEndFlag = {};

    // DOM要素の作成
    this.el = document.createElement('div');
    this.el.classList.add('cell');
    this.el.dataset.x = x;
    this.el.dataset.y = y;

    // イベントハンドラ
    this.el.addEventListener('click', (event)=>{
      if (!currentPart || wasDragged) return;
      event.preventDefault();
      if (this.editable) this._clickEvent(event);
    }, { passive: false });
    this.el.addEventListener('touchstart', (event)=>{
      if (!currentPart || wasDragged) return;
      event.preventDefault();
      if (this.editable) this._clickEvent(event);
    }, { passive: false });
  }

  // 指定方向のセルのタイプを確認
  #getDirectionType(direction) {
    const { dx, dy } = Cell.offset[direction];
    const nx = this.x + dx;
    const ny = this.y + dy;
    return gridlist[ny][nx].type;
  }

  #replace_obj(obj){
    gridlist[this.y][this.x].el.replaceWith(obj.el);
    gridlist[this.y][this.x]=obj;

    // 外部に対して盤面の更新通知を行う
    Cell.update.forEach(f => f(obj));
  }

  static reBuildNodes(obj) { //再構築するコード
    Cell.originPriority = {
      priority: Number.MIN_SAFE_INTEGER,
      x: 0, y:0
    };
    Cell.collectRenewCell = new Set();
    obj.checkConnection();

    const resetTime = Date.now();
    obj.resetNodeId(resetTime-1);
    obj.resetEquationsSignal(resetTime);

    return Cell.calc();
  }

  static calc() {
    Cell.generateAllEquations(); //方程式をたてる
    let resultTemp = Cell.calcAllEquations();
    if (resultTemp !== null){
      Object.entries(resultTemp).forEach(([key, value]) => window.lastCalcAns.set(key, value)); //方程式を解く
    }
    console.log(resultTemp);

    const tempCollect = Array.from(Cell.collectRenewCell);
    const reCalcRequest = tempCollect.filter(cell => cell.calcUpdate(window.lastCalcAns)); //計算結果の通知
    if (reCalcRequest.length !=0 ) {
      return Cell.calc();
    } else {
      tempCollect.forEach(cell => cell.calcEndFlag = {});
      return resultTemp;
    }
  }

  static generateAllEquations() {
    Cell.kclEquations = [];
    const originNodeId = gridlist[Cell.originPriority.y][Cell.originPriority.x].nodeId || 0;

    const nodes = new Map();
    for (const cell of Cell.collectRenewCell) {
      if (!nodes.has(cell.nodeId)) {
        nodes.set(cell.nodeId, {
          "main": [],
          "connection_other": new Set()
        });
      }
      const comrade = nodes.get(cell.nodeId);
      comrade.main.push(cell);
      for (const nxt of cell.connection) {
        const neighbor = gridlist[nxt.y][nxt.x];
        if (neighbor.nodeId != cell.nodeId) {
          comrade.connection_other.add(neighbor.nodeId);
        }
      }

    }

    for (const [nodeId, cellsInfo] of nodes) {
      const cells = cellsInfo.main;
      const connectionIds = cellsInfo.connection_other;
      const cls = cells[0].constructor;
      if (typeof cls.generateEquations === 'function') {
        const the_first = originNodeId === nodeId;
        const eqs = cls.generateEquations(cells, connectionIds, the_first);
        Cell.kclEquations = Cell.kclEquations.concat(...eqs);
      }
    }
  }


  static calcAllEquations() {
    //generateAllEquationsの直後に呼び出されることが期待される

    const vars = [...new Set(
      Cell.kclEquations.flatMap(eq =>
        (eq.terms ?? [])
          .filter(t => 'variable' in t)
          .map(t => t.variable)
      )
    )];
    const vIndex = Object.fromEntries(vars.map((v, i) => [v, i]));

    const A = [];
    const b = [];

    Cell.kclEquations.forEach(eq => {
      const row = Array(vars.length).fill(0);
      let rhs = eq.constant ?? 0;

      for (const { variable, coeff = 0 } of eq.terms ?? []) {
        if (variable) {
          row[vIndex[variable]] += coeff;
        } else {
          rhs -= coeff;
        }
      }
      A.push(row);
      b.push(rhs);
    });

    const A_mat = math.matrix(A);
    const b_vec = math.matrix(b);

    try {
      let x;
      if (A.length === vars.length) {
        // 方程式数 = 変数数 の場合は直接解く
        x = math.lusolve(A_mat, b_vec);
      } else {
        // 方程式数 ≠ 変数数 の場合は最小二乗解
        const At = math.transpose(A_mat);
        const AtA = math.multiply(At, A_mat);
        const n = math.size(AtA).get([0]);
        const I = math.identity(n);
        const regularized = math.add(AtA, math.multiply(1e-8, I));
        const Atb = math.multiply(At, b_vec);
        x = math.lusolve(regularized, Atb);
      }

      const solArray = math.flatten(x).toArray();
      const solution = {};
      vars.forEach((v, i) => solution[v] = Cell.fix(solArray[i]));
      return solution;
    } catch (err) {
      console.error("❌ 解の計算に失敗しました:", err);
      return null;
    }
  }


  overrideCell(type){
    const nowCurrent = currentPart;
    currentPart = type;
    this.deletePart();
    gridlist[this.y][this.x]._clickEvent(null);
    currentPart = nowCurrent;
  }

  _clickEvent(e){
    let new_obj = null;

    if(currentPart.startsWith("wire")){
      new_obj = new Wire(this.x, this.y);
    }else if(currentPart.startsWith("battery")){
      new_obj = new Battery(this.x, this.y);
    }else if(currentPart.startsWith("resistor")){
      new_obj = new Resistor(this.x, this.y);
    }else if(currentPart.startsWith("led")){
      new_obj = new LED(this.x, this.y);
    }else if(currentPart.startsWith("switch")){
      new_obj = new Switch(this.x, this.y);
    }

    if (new_obj !== null) {
      this.#replace_obj(new_obj);
      Cell.reBuildNodes(new_obj);
    }
  }

  deletePart(){ //削除時に外部から呼び出される
    const new_obj = new Cell(this.x, this.y);
    this.#replace_obj(new_obj);
    this.updateConnectionPart();
  }
  updateConnectionPart(){
    this.connection.forEach(({ x, y }) => {
      gridlist[y][x].checkConnection();
    });
    this.connection.forEach(({ x, y }) => {
      Cell.reBuildNodes(gridlist[y][x]);
    });
  }

  switchEditable(flag = null){
    if(flag === null) flag = !this.editable;
    this.editable = flag;
    if (flag) {
      this.el.classList.remove("non-edit-cell");
    }else{
      this.el.classList.add("non-edit-cell");
    }
  }

  connectionRequest(x, y){ //接続可能か外部から呼び出される
    if (!Cell.inBounds(x, y)) return false;

    const dx = x - this.x;
    const dy = y - this.y;

    const isAdjacent = Math.abs(dx) + Math.abs(dy) === 1;
    if (!isAdjacent) return false;

    let incomingDirection = null;
    for (const [dir, offset] of Object.entries(Cell.offset)) {
      if (offset.dx === dx && offset.dy === dy) {
        incomingDirection = dir;
        break;
      }
    }

    if (!this.allowedDirections.includes(incomingDirection)) return false;

    const target = gridlist[y][x];
    return this.constructor.connectableType.includes(target.type);
  }

  checkConnection(){ //接続しているセルを更新する
    this.connection = [];

    for (const [dir, offset] of Object.entries(Cell.offset)) {
      if (!this.allowedDirections.includes(dir)) continue;

      const nx = this.x + offset.dx;
      const ny = this.y + offset.dy;

      if (!Cell.inBounds(nx, ny)) continue;

      const target = gridlist[ny][nx];
      if (target.connectionRequest(this.x, this.y)) {
        const alreadyConnected = this.connection.some(c => c.x === nx && c.y === ny);
        if (!alreadyConnected) {
          this.connection.push({ x: nx, y: ny });
        }

        const reverseConnected = target.connection.some(c => c.x === this.x && c.y === this.y);
        if (!reverseConnected) {
          target.connection.push({ x: this.x, y: this.y });
          target.render();
        }
      }
    }
    this.render();
  }

  resetNodeId(resetTime, baseId = null){
    //同一NodeIdにのみ伝播する
    const spreadNodeType = ["wire"];

    if (this.type === null) return;
    if (this.resetTimeStamp === resetTime) return;
    this.resetTimeStamp = resetTime;

    //はじめての部品はNodeIdを割り当て直す
    if (baseId === null) {
      baseId = Cell.nextNodeId++;
    }
    this.nodeId = baseId;
    this.el.dataset.nodeId = baseId;

    //if (debug) this.el.innerHTML += "<span style='position: absolute; top: 0'>"+baseId+"</span>";

    for (const { x, y } of this.connection) {
      const nxt=gridlist[y][x];
      if (spreadNodeType.includes(this.type) && spreadNodeType.includes(nxt.type)) {
        nxt.resetNodeId(resetTime, baseId);
      }
    }
  }

  resetEquationsSignal(resetTime){
    //0Vの点を探しつつ，Cell.collectRenewCellをセットする
    //接続されている全ての部品に伝播する
    if (this.type === null) return;

    if (this.resetTimeStamp === resetTime) return;
    this.resetTimeStamp = resetTime;

    //0Vの点を決める
    if (this.constructor.priority > Cell.originPriority.priority && this.suitableOrigin()){
      Cell.originPriority.priority = this.constructor.priority;
      Cell.originPriority.x = this.x;
      Cell.originPriority.y = this.y;
    }

    Cell.collectRenewCell.add(this);

    for (const { x, y } of this.connection) {
      const nxt=gridlist[y][x];
      nxt.resetEquationsSignal(resetTime);
    }
  }

  suitableOrigin() { return true; } //0V点に成り得るかどうかを返す
  calcUpdate(result){
    return false;
  } //計算後、呼び出され、再計算が必要か返す
  generateEquations(){} //キルヒホッフの法則に基づく式を生成する
  render(){} //セルの描画を行う
}
