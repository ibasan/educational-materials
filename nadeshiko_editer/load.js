let template_html;
let template_canvas;
let autorun_code;
const result_clear=()=>{
	output.innerHTML=template_html;
};

const nako3_run=main=>{
	if(typeof(navigator.nako3)==="undefined") return;

	const addon="「#result_div」へDOM親要素設定\n"+
		"「#result_div」に「」をHTML設定\n"+
		"「#result_canvas」へ描画開始\n"+
		"カメ描画先=「#result_canvas」\n"+
		"\n";
	result_clear();

	//DOMのリセットの時間、待つ
	setTimeout(async ()=>{
		await navigator.nako3.loadDependencies(addon+main, "main.nako3", addon);
		await navigator.nako3.run(addon+main, "main.nako3", addon);				
	}, 100);
}

window.addEventListener("load", ()=>{
	template_html=output.innerHTML;
	template_canvas=result_canvas.toDataURL();

	const nako3_init_timer=setInterval(()=>{
		if(navigator.nako3){
			clearInterval(nako3_init_timer);
			//「表示」出力先変更
			navigator.nako3.setFunc("表示", [['と', 'を']], function (s) {
				text_output.innerHTML+=(s.replace('&', '&amp;')
					.replace('>', '&gt;')
					.replace('<', '&lt;')
					.replace('\n', '<br>'))+"<br>";
			}, true);

			//「表示ログクリア」の動作を変更
			navigator.nako3.setFunc("表示ログクリア", [], result_clear, true);

			//エラー出力時の動作を変更
			navigator.nako3.logger.addListener('trace', (e) => {
				if(e.level==='stdout') {
					text_output.innerHTML+=e.noColor+"<br>";
				}else if(e.level==='warn' || e.level==='error') {
					if(e.noColor==='[警告]undefined') return; //意味不明なエラー?の出力を回避できるらしい
					console.log(...e.browserConsole);
					error.innerHTML=e.html;
				}
			});

			//autorun
			if(autorun_code!=""){
				nako3_run(autorun_code);
			}
		}
	}, 100);

	const result_change_checker=setInterval(()=>{
		Array.from(output.children).forEach(e=>{
			if(e.style.display==""){
				if(e.tagName=="DIV"){
					if(e.innerHTML!=""){
						e.style.display="block";
					}
				}else if(e.id=="result_canvas"){
					if(template_canvas!=result_canvas.toDataURL()){
						result_canvas.style.display="block";
					}
				}
			}
		});

		//todo:リファレンス検索

	}, 300);
});

