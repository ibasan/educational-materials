let currentPart = '';
let gridlist = [];
let translate = {
  x: (window.outerWidth-40*gridSize*scale)/2,
  y: (window.innerHeight-40*gridSize*scale)/2
};

const clearAllGrid = (flag = true) => {
  gridlist.flat().forEach(cell => {
    if (cell.editable || flag) cell.deletePart();
  });
};
const userClearAllGrid = () => clearAllGrid(false);


function createGrid() {
  grid.style.gridTemplateColumns = "repeat(" +gridSize+ ", 40px)";
  grid.style.gridTemplateRows = "repeat(" +gridSize+ ", 40px)";
  gridlist = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = new Cell(x, y);
      grid.appendChild(cell.el);
      gridlist[y][x] = cell;
    }
  }

  if (typeof gridlistRequest !== "undefined") {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (gridlistRequest[y] && gridlistRequest[y][x]) {
          gridlist[y][x].overrideCell(gridlistRequest[y][x]);
        }
      }
    }
  }

}


// viewを動かす
function applyTransform() {
  grid.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
}

viewport.addEventListener('wheel', e => {
  e.preventDefault();
  const rect = grid.getBoundingClientRect();
  const [ox, oy] = [e.clientX - rect.left, e.clientY - rect.top];
  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  const nextScale = Math.min(Math.max(scale + delta, 0.5), 5);
  const ratio = nextScale / scale;
  translate.x -= ox * (ratio - 1);
  translate.y -= oy * (ratio - 1);
  scale = nextScale;
  applyTransform();
}, { passive: false });

let isDragging = false;
let wasDragged = false;
let dragStart = { x: 0, y: 0 };

const dragThreshold = 5;

const startDrag = (x, y) => {
  isDragging = true;
  wasDragged = false;
  dragStart.x = x - translate.x;
  dragStart.y = y - translate.y;
};

const moveDrag = (x, y) => {
  if (!isDragging) return;

  const dx = x - (dragStart.x + translate.x);
  const dy = y - (dragStart.y + translate.y);
  if (Math.hypot(dx, dy) > dragThreshold) {
    wasDragged = true;
  }

  translate.x = x - dragStart.x;
  translate.y = y - dragStart.y;
  applyTransform();
};

const endDrag = e => {
  isDragging = false;
};

viewport.addEventListener('mousedown', e => {
  startDrag(e.clientX, e.clientY);
});
viewport.addEventListener('mousemove', e => {
  moveDrag(e.clientX, e.clientY);
});
viewport.addEventListener('mouseup', endDrag);
viewport.addEventListener('mouseleave', endDrag);

viewport.addEventListener('touchstart', e => {
  e.preventDefault();
  if (e.touches.length === 1) {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }
}, { passive: false });

viewport.addEventListener('touchmove', e => {
  if (e.touches.length === 1) {
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }
}, { passive: false });

viewport.addEventListener('touchend', endDrag);
viewport.addEventListener('touchcancel', endDrag);

document.querySelectorAll('input[name="part"]').forEach(radio => {
  radio.addEventListener('change', () => {
    currentPart = radio.value;
  });
});


// 以下，メニュー内の図を配置
(()=>{
  Array.from(document.getElementsByClassName('mini-battery')).forEach(ele=>{
    const temp = document.getElementById("battery-template");
    const clone = temp.content.cloneNode(true);
    ele.appendChild(clone);
  });
  Array.from(document.getElementsByClassName('mini-resistor')).forEach(ele=>{
    const resistor = document.createElement("div");
    resistor.className = `resistor`;
    ele.appendChild(resistor);
  });
  Array.from(document.getElementsByClassName('mini-led')).forEach(ele=>{
    const temp = document.getElementById("led-template");
    const clone = temp.content.cloneNode(true);
    ele.appendChild(clone);
  });
  Array.from(document.getElementsByClassName('mini-switch')).forEach(ele=>{
    const temp = document.getElementById("switch-template");
    const clone = temp.content.cloneNode(true);
    ele.appendChild(clone);
  });
})();

document.querySelectorAll('.radio-wrapper').forEach(div => {
  div.addEventListener('click', function(e) {
    const input = this.querySelector('input[type="radio"]');
    if (input && !input.disabled) {
      input.checked = true;
      input.dispatchEvent(new Event('change', {bubbles:true}));
    }
  });
  div.addEventListener('keydown', function(e) {
    if (e.key === " " || e.key === "Enter") {
      this.click();
      e.preventDefault();
    }
  });
});
