class Wire extends Cell{
  static connectableType = Cell.electricPart;
  static priority = 1;

  static generateEquations(cells, connectionIds, the_first = false ) {
    const nodeId = cells[0].nodeId;
    const eqs = [];

    const kcl = { terms: [], constant: 0 };
    let last_kcv = null;
    for (const other of connectionIds) {
      const wire_I = Cell.moldingBranch(other, nodeId, 'I');
      kcl.terms.push({
        variable: wire_I.name,
        coeff: wire_I.sign
      });

      // すべての電圧は同値である
      const wire_V = Cell.moldingBranch(other, nodeId, 'V');
      if (last_kcv !== null) {
        eqs.push({
          terms:[
            {
              variable: wire_V.name,
              coeff: -1
            },
            last_kcv
          ],
          constant: 0
        });
      }
      last_kcv = {variable: wire_V.name, coeff: 1};
    }

    if (kcl.terms.length) eqs.push(kcl);

    if (the_first && (last_kcv !== null)) {
      eqs.push({ terms:[last_kcv], constant: 0 });
    }

    return eqs;
  }

  constructor(x, y) {
    super(x, y);
    this.type = "wire";
    this.el.classList.add('wire');
    this.allowedDirections = ["up", "down", "left", "right"];
    this.render();
  }
  _clickEvent(e) {
    if (currentPart == "eraser") this.deletePart();
  }

  render() {
    // 既存の要素をクリア（再描画のため）
    this.el.innerHTML = "";

    if (this.connection.length === 0) {
      this.el.appendChild(Cell.createDot());
    }else{
      for (const { x, y } of this.connection) {
        const dx = x - this.x;
        const dy = y - this.y;

        let dir = null;

        if (dx === 0 && dy === -1) dir = "up";
        else if (dx === 0 && dy === 1) dir = "down";
        else if (dx === -1 && dy === 0) dir = "left";
        else if (dx === 1 && dy === 0) dir = "right";

        const line = document.createElement("div");
        line.className = `wire-line wire-${dir}`;
        this.el.appendChild(line);
      }
    }
  }

  static setButtonUI() {
    const wire_ele = document.getElementById('wireDetails');
    if (!wire_ele) return;
    wire_ele.removeAttribute("style");
  }

  calcUpdate(result) {
    const getLastValue = (a,b) => {
      const filtered = Array.from(result.entries())
        .filter(([key]) => {
        const parts = key.split('_');
        return parts.includes(a+"") && parts.includes(b+"");
      });
      return filtered.length ? filtered[filtered.length - 1][1] : undefined;
    }

    if (false || debug) {
      const preEle = this.el.getElementsByClassName('debug');
      if (preEle.length >0) preEle[0].remove();

      this.el.innerHTML += "<span class='debug' style='position: absolute; top: 0'>"+getLastValue(this.nodeId, "V")+"</span>";
    }
  }

}