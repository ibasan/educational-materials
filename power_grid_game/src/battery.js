class Battery extends Cell{
  static connectableType = Cell.electricPart;
  static priority = 5;
  static resistance = 0.0001;

  static generateEquations(cells, connectionIds, the_first = false) {

    const self = cells[0];
    const nodeId = self.nodeId;
    const off  = Cell.offset[self.direction];

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

    

    const plusNodeId = gridlist[self.y + off.dy][self.x + off.dx].nodeId;
    const minusNodeId = gridlist[self.y - off.dy][self.x - off.dx].nodeId;

    // nodeIdが無い場合は、正しく接続されていない
    if (plusNodeId == null || minusNodeId == null) return [];
    // 同じNodeIdの場合は、ショートしている
    // if (plusNodeId == minusNodeId) throw new Error("FindShort!");

    const InA = Cell.moldingBranch(plusNodeId, nodeId, "I");
    const InB = Cell.moldingBranch(minusNodeId, nodeId, "I");

    const eqs = [{
      terms   : [
        { variable: InA.name, coeff: InA.sign },
        { variable: InB.name, coeff: InB.sign },
      ],
      constant: 0
    }];

    const VnA = Cell.moldingBranch(plusNodeId, nodeId, "V");
    const VnB = Cell.moldingBranch(minusNodeId, nodeId, "V");
    eqs.push({
      terms   : [
        { variable: VnA.name, coeff: 1 },
        { variable: VnB.name, coeff: -1 }
      ],
      constant: self.voltage
    });

    if (the_first) {
      eqs.push({
        terms: [{ variable: VnB.name, coeff: VnB.sign }],
        constant: 0
      });
    }

    return eqs;
  }


  constructor(x, y) {
    super(x, y);
    this.type = "battery";
    this.direction = currentPart.split("-").length > 1 ? currentPart.split("-")[1] : "up";
    this.voltage = 5;

    this.el.classList.add("battery");
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
    }else{
      this.voltage = Cell.changeDialog("起電力の大きさを変更します", this.voltage);
    }
  }

  suitableOrigin() {
    if (this.connection.length == 2) return true;
    return false;
  }

  render() {
    const temp = document.getElementById("battery-template");
    const clone = temp.content.cloneNode(true);
    this.el.innerHTML = "";
    this.el.appendChild(clone);
  }

  static setButtonUI() {
    const batt_ele = document.getElementById('batteryDetails');
    if (!batt_ele) return;
    batt_ele.removeAttribute("style");

    document.querySelectorAll('input[name="part"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (!currentPart.startsWith('battery')) {
          batteryDetails.removeAttribute('open');
        }
      });
    });
  }

  static simpleShortCircuitCheck() {
    const shotBattery = gridlist.flat().filter(cell => {
      if (cell.type !== "battery") return false;
      if (cell.connection.length != 2) return false;

      const [A, B] = cell.connection;
      return gridlist[A.y][A.x].nodeId==gridlist[B.y][B.x].nodeId;
    });
    return shotBattery.length == 0;
  }
}
