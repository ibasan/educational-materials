class LED extends Cell{
  static connectableType = Cell.electricPart;
  static priority = 1;

  static generateEquations(cells, connectionIds, the_first = false) {
    const self = cells[0];
    const nodeId = self.nodeId;

    //ガード節
    if (connectionIds.size == 1){
      const [oneId] = [...connectionIds];
      const IoneId = Cell.moldingBranch(oneId, nodeId, "I");
      return [{
        terms   : [
          { variable: IoneId.name, coeff: IoneId.sign },
        ],
        constant: 0
      }];
    }else if(connectionIds.size != 2){
      return [];
    }

    const off  = Cell.offset[self.direction];
    const caTHodeId = gridlist[self.y + off.dy][self.x + off.dx].nodeId;
    const aNodeId = gridlist[self.y - off.dy][self.x - off.dx].nodeId;

    const accessCalcEndFlag = "resultVnA" in self.calcEndFlag && "resultVnB" in self.calcEndFlag && "resultInA" in self.calcEndFlag;
    const checkedCalcEndFlag = accessCalcEndFlag ? (self.calcEndFlag.resultVnA - self.calcEndFlag.resultVnB >= self.fowardVoltage) : false;
    const eqs = [];

    const InA = Cell.moldingBranch(aNodeId, nodeId, "I");
    const InB = Cell.moldingBranch(caTHodeId, nodeId, "I");
    const VnA = Cell.moldingBranch(aNodeId, nodeId, "V");
    const VnB = Cell.moldingBranch(caTHodeId, nodeId, "V");

    if (accessCalcEndFlag) console.log("再計算！");

    if (accessCalcEndFlag && !checkedCalcEndFlag) {
      eqs.push({
        terms   : [
          { variable: InA.name, coeff: InA.sign },
        ],
        constant: 0
      });
      eqs.push({
        terms   : [
          { variable: InB.name, coeff: InB.sign },
        ],
        constant: 0
      });

    } else { //初回計算時 or 通電時の電流
      eqs.push({
        terms   : [
          { variable: InA.name, coeff: InA.sign },
          { variable: InB.name, coeff: InB.sign },
        ],
        constant: 0
      });

      // 通電している時
      if (accessCalcEndFlag) {
        eqs.push({
          terms   : [
            { variable: VnA.name, coeff: 1 },
            { variable: VnB.name, coeff: -1 }
          ],
          constant: self.fowardVoltage
        });
      }
    }

    if (the_first) {
      eqs.push({
        terms: [{ variable: VnB.name, coeff: 1 }],
        constant: 0
      });
    }

    return eqs;
  }

  constructor(x, y) {
    super(x, y);
    this.type = "led";
    this.direction = currentPart.split("-").length > 1 ? currentPart.split("-")[1] : "up";
    this.fowardVoltage = 2.0;
    // 内部抵抗無限で計算する

    this.el.classList.add(this.direction);

    this.allowedDirections = {
      up:    ["up", "down"],
      down:  ["up", "down"],
      left:  ["left", "right"],
      right: ["left", "right"],
    }[this.direction];
    this.render();
  }
  _clickEvent(e) {
    if (currentPart == "eraser"){
      this.deletePart();
    }

  }

  render() {
    const temp = document.getElementById("led-template");
    const clone = temp.content.cloneNode(true);
    this.el.innerHTML = "";
    this.el.appendChild(clone);
  }

  suitableOrigin() {
    if (this.connection.length == 2) return true;
    return false;
  }

  calcUpdate(result) {
    const nodeId = this.nodeId;
    if (this.connection.length != 2) return false;

    const off  = Cell.offset[this.direction];
    const caTHodeId = gridlist[this.y + off.dy][this.x + off.dx].nodeId;
    const aNodeId = gridlist[this.y - off.dy][this.x - off.dx].nodeId;

    if (aNodeId == null || caTHodeId == null) return false;

    const VnA = Cell.moldingBranch(aNodeId, nodeId, "V");
    const VnB = Cell.moldingBranch(caTHodeId, nodeId, "V");
    const InA = Cell.moldingBranch(aNodeId, nodeId, "I");

    if ("resultVnA" in this.calcEndFlag && "resultVnB" in this.calcEndFlag) {
      if (this.calcEndFlag.resultVnA == result.get(VnA.name) && this.calcEndFlag.resultVnB == result.get(VnB.name)) return false;
    }

    // 今回の情報を登録して、再計算に備える
    this.calcEndFlag = {
      "resultVnA":result.get(VnA.name),
      "resultVnB":result.get(VnB.name),
      "resultInA":result.get(InA.name),
    };
    return true;

  }

  static setButtonUI() {
    const ele = document.getElementById('ledDetails');
    if (!ele) return;
    ele.removeAttribute("style");

    document.querySelectorAll('input[name="part"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (!currentPart.startsWith('led')) {
          ele.removeAttribute('open');
        }
      });
    });


  }
}

