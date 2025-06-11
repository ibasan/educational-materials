const mainBody = `
  <template id="battery-template">
    <div class="battery-with-wires">
      <div class="wire-top"></div>
      <div class="battery-symbol"></div>
      <div class="wire-bottom"></div>
    </div>
  </template>
  <template id="led-template">
    <div class="led-symbol">
      <div class="led-wire"></div>
      <span class="led-ray led-ray1"></span>
      <span class="led-ray led-ray2"></span>
	  <span class="mask"></span>
    </div>
  </template>
  <template id="switch-template">
    <div class="switch-2point">
      <div class="arm"></div>
    </div>
  </template>

  <div id="toolbar">
    <label>
      <input type="radio" name="part" value="none" checked>
      なし
    </label>
    <details class="options-block" id="batteryDetails" style="display: none">
      <summary class="dummy-radio">
        電池
      </summary>
      <div class="options">
        <div class="radio-wrapper">
          <input type="radio" name="part" value="battery-up">
          <div class="mini mini-battery up"></div>
        </div>
        <div class="radio-wrapper">
          <input type="radio" name="part" value="battery-down">
          <div class="mini mini-battery down"></div>
        </div>
        <div class="radio-wrapper">
          <input type="radio" name="part" value="battery-right">
          <div class="mini mini-battery right"></div>
        </div>
        <div class="radio-wrapper">
          <input type="radio" name="part" value="battery-left">
          <div class="mini mini-battery left"></div>
        </div>
      </div>
    </details>

    <details class="options-block" id="resistorDetails" style="display: none">
      <summary class="dummy-radio">
        抵抗
      </summary>
      <div class="options">
        <div class="radio-wrapper">
          <input type="radio" name="part" value="resistor-up">
          <div class="mini mini-resistor up"></div>
        </div>
        <div class="radio-wrapper">
          <input type="radio" name="part" value="resistor-left">
          <div class="mini mini-resistor left"></div>
        </div>
      </div>
    </details>

    <details class="options-block" id="ledDetails" style="display: none">
      <summary class="dummy-radio">
        発光ダイオード
      </summary>
      <div class="options">
        <div class="radio-wrapper">
          <input type="radio" name="part" value="led-up">
          <div class="mini mini-led up"></div>
        </div>
        <div class="radio-wrapper">
          <input type="radio" name="part" value="led-down">
          <div class="mini mini-led down"></div>
        </div>
        <div class="radio-wrapper">
          <input type="radio" name="part" value="led-right">
          <div class="mini mini-led right"></div>
        </div>
        <div class="radio-wrapper">
          <input type="radio" name="part" value="led-left">
          <div class="mini mini-led left"></div>
        </div>
      </div>
    </details>

    <details class="options-block" id="switchDetails" style="display: none">
      <summary class="dummy-radio">
        スイッチ
      </summary>
      <div class="options">
        <div class="radio-wrapper">
          <input type="radio" name="part" value="switch-left">
          <div class="mini mini-switch left"></div>
        </div>
        <div class="radio-wrapper">
          <input type="radio" name="part" value="switch-up">
          <div class="mini mini-switch up"></div>
        </div>
      </div>
    </details>

    <label id="wireDetails" style="display: none">
      <input type="radio" name="part" value="wire">
      導線
    </label>
    <label>
      <input type="radio" name="part" value="eraser">
      消しゴム
    </label>
    <button onclick="userClearAllGrid()">クリア</button>
  </div>

  <div id="viewport">
    <div id="grid"></div>
  </div>
`;
document.body.innerHTML = mainBody + document.body.innerHTML;

const scripts = [
  "control.js", "cell.js",
	"wire.js",
	"resistor.js",
	"battery.js",
	"led.js",
  "switch.js"
];

Promise.all(
  scripts.map(src => new Promise(resolve => {
    const temp = document.createElement("script");
    temp.async = false;
    temp.src = "./src/" + src;
    temp.onload = resolve;
    temp.onerror = resolve;
    document.body.prepend(temp);
  }))
).then(() => {
  window.dispatchEvent(new Event("ready"));
});