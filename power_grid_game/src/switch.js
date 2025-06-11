class Switch extends Cell{
  static connectableType = Cell.electricPart;
  static priority = 1;

  static generateEquations(cells, connectionIds, the_first = false ) {
    const nodeId = cells[0].nodeId;
    const eqs = [];

    const kcl = { terms: [], constant: 0 };
    let last_kcv = null;

    const createOneEquation = (oneId)=>{
      const IoneId = Cell.moldingBranch(oneId, nodeId, "I");
      return {
        terms   : [
          { variable: IoneId.name, coeff: IoneId.sign },
        ],
        constant: 0
      };
    };

    // ガード節
    if (connectionIds.size == 1){
      const [oneId] = [...connectionIds];
      return [createOneEquation(oneId)];
    }else if(connectionIds.size != 2){
      return [];
    }

    const [IdA, IdB] = [...connectionIds];

    if (cells[0].open) {
      eqs.push(createOneEquation(IdA));
      eqs.push(createOneEquation(IdB));

    } else { // 閉じている時
      const Ia = Cell.moldingBranch(IdA, nodeId, 'I');
      const Ib = Cell.moldingBranch(IdB, nodeId, 'I');

      eqs.push({
        terms   : [
          { variable: Ia.name, coeff: Ia.sign },
          { variable: Ib.name, coeff: Ib.sign },
        ],
        constant: 0
      });

      const Va = Cell.moldingBranch(IdA, nodeId, 'V');
      const Vb = Cell.moldingBranch(IdB, nodeId, 'V');

      eqs.push({
        terms   : [
          { variable: Va.name, coeff: 1 },
          { variable: Vb.name, coeff: -1 },
        ],
        constant: 0
      });
    }

    return eqs;
  }

  constructor(x, y) {
    super(x, y);
    this.type = "switch";
    this.direction = currentPart.split("-").length > 1 ? currentPart.split("-")[1] : "up";
    this.open = true;

    this.el.classList.add(this.direction);

    this.allowedDirections = {
      up:    ["up", "down"],
      left:  ["left", "right"],
    }[this.direction];
    this.render();
  }
  _clickEvent(e) {
    if (currentPart == "eraser") {
      this.deletePart();
    } else {
      this._switch();
    }
  }

  _switch(flag = null) {
    if (flag === null) flag = !this.open;
    if (flag == this.open ) return;
    if (flag) {
      this.el.classList.remove("close");
    } else {
      this.el.classList.add("close");
    }
    this.open = flag;
    Cell.reBuildNodes(this);
  }

  suitableOrigin() {
    if (this.connection.length == 2) return true;
    return false;
  }

  render() {
    const temp = document.getElementById("switch-template");
    const clone = temp.content.cloneNode(true);
    this.el.innerHTML = "";
    this.el.appendChild(clone);
  }

  static setButtonUI() {
    const ele = document.getElementById('switchDetails');
    if (!ele) return;
    ele.removeAttribute("style");

    document.querySelectorAll('input[name="part"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (!currentPart.startsWith('switch')) {
          switchDetails.removeAttribute('open');
        }
      });
    });
  }

}