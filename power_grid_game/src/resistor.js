class Resistor extends Cell{
  static connectableType = Cell.electricPart;
  static priority = 1;

  static generateEquations(cells, connectionIds, the_first = false) {
    const nodeId = cells[0].nodeId;

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

    const [nA, nB] = [...connectionIds];
    const InA = Cell.moldingBranch(nA, nodeId, "I");
    const InB = Cell.moldingBranch(nB, nodeId, "I");

    const eqs = [{
      terms   : [
        { variable: InA.name, coeff: InA.sign },
        { variable: InB.name, coeff: InB.sign },
      ],
      constant: 0
    }];

    const VnA = Cell.moldingBranch(nA, nodeId, "V");
    const VnB = Cell.moldingBranch(nB, nodeId, "V");
    const R = cells[0].resistance;

    eqs.push({
      terms   : [
        { variable: VnA.name, coeff: 1 },
        { variable: VnB.name, coeff: -1 },
        { variable: InB.name, coeff: -InB.sign*R }
      ],
      constant: 0
    });

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
    this.type = "resistor";
    this.direction = currentPart.split("-").length > 1 ? currentPart.split("-")[1] : "up";
    this.resistance = 5;

    this.el.classList.add(this.direction);

    this.allowedDirections = {
      up:    ["up", "down"],
      left:  ["left", "right"],
    }[this.direction];
    this.render();
  }
  _clickEvent(e) {
    if (currentPart == "eraser"){
      this.deletePart();
    }else{
      this.resistance = Cell.changeDialog("抵抗の大きさを変更します", this.resistance);
    }

  }

  render() {
    this.el.innerHTML = "";
    const resistor = document.createElement("div");
    resistor.className = `resistor`;
    this.el.appendChild(resistor);
  }

  suitableOrigin() {
    if (this.connection.length == 2) return true;
    return false;
  }

  static setButtonUI() {
    const resi_ele = document.getElementById('resistorDetails');
    if (!resi_ele) return;
    resi_ele.removeAttribute("style");

    document.querySelectorAll('input[name="part"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (!currentPart.startsWith('resistor')) {
          resistorDetails.removeAttribute('open');
        }
      });
    });


  }
}

