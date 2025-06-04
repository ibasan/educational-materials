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
        <label><input type="radio" name="part" value="battery-up"> 上</label>
        <label><input type="radio" name="part" value="battery-right"> 右</label>
        <label><input type="radio" name="part" value="battery-down"> 下</label>
        <label><input type="radio" name="part" value="battery-left"> 左</label>
      </div>
    </details>

    <details class="options-block" id="resistorDetails" style="display: none">
      <summary class="dummy-radio">
        抵抗
      </summary>
      <div class="options">
        <label><input type="radio" name="part" value="resistor-up"> 縦</label>
        <label><input type="radio" name="part" value="resistor-left"> 横</label>
      </div>
    </details>

    <details class="options-block" id="ledDetails" style="display: none">
      <summary class="dummy-radio">
        発光ダイオード
      </summary>
      <div class="options">
        <label><input type="radio" name="part" value="led-up"> 上</label>
        <label><input type="radio" name="part" value="led-right"> 右</label>
        <label><input type="radio" name="part" value="led-down"> 下</label>
        <label><input type="radio" name="part" value="led-left"> 左</label>
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

["control.js", "cell.js",
	"wire.js",
	"resistor.js",
	"battery.js",
	"led.js"
].forEach(src => {
	const temp = document.createElement("script");
	temp.async = false;
	temp.src = "./src/" + src;
	document.body.prepend(temp);
});