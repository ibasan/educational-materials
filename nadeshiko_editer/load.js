let template_html;
let template_canvas;
let autorun_code;
const result_clear=()=>{
	navigator.nako3.reset();
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

	//地図ライブラリの読み込み
	const leaflet_css=document.head.appendChild(document.createElement('link'));
	leaflet_css.setAttribute("rel", "stylesheet");
	leaflet_css.setAttribute("href", "https://github.kasumigaura.work/nadeshiko_editer/leaflet/leaflet.css");
	const leaflet_js=document.head.appendChild(document.createElement('script'));
	leaflet_js.src="https://github.kasumigaura.work/nadeshiko_editer/leaflet/leaflet.js";

	//wnakoの読み込み
	let script=document.head.appendChild(document.createElement('script'));
	script.src="https://github.kasumigaura.work/nadeshiko_editer/wnako3/wnako3.js";
	script.onload=()=>{
		[
			"https://github.kasumigaura.work/nadeshiko_editer/wnako3/plugin_caniuse.js",
			"https://github.kasumigaura.work/nadeshiko_editer/wnako3/plugin_kansuji.js",
			"https://github.kasumigaura.work/nadeshiko_editer/wnako3/plugin_markup.js",
			"https://github.kasumigaura.work/nadeshiko_editer/wnako3/plugin_turtle.js",
			"https://github.kasumigaura.work/nadeshiko_editer/wnako3/plugin_webworker.js",

			//自作プラグインの読み込み
			"https://github.kasumigaura.work/nadeshiko_editer/wnako3/plugin_leaflet.js",
			"https://github.kasumigaura.work/nadeshiko_editer/wnako3/plugin_convenient.js"
			//"./wnako3/plugin_convenient.js"

		].forEach(wnako_plugin_url=>{
			let plugin_script=document.head.appendChild(document.createElement('script'));
			plugin_script.src=wnako_plugin_url;
		});
	}


	const nako3_init_timer=setInterval(()=>{
		if(navigator.nako3){
			clearInterval(nako3_init_timer);

			//「表示ログクリア」の動作を変更
			navigator.nako3.setFunc("表示ログクリア", [], result_clear, true);

			//「表示」出力先、エラー出力時の動作を変更
			navigator.nako3.logger.addListener('trace', (e) => {
				if(e.level==='stdout') {
					text_output.innerHTML+=e.noColor+"<br>";
				}else if(e.level==='warn' || e.level==='error') {
					if(e.noColor==='[警告]undefined') return; //意味不明なエラー?の出力を回避できるらしい
					console.log(...e.browserConsole);

					if(e.noColor.indexOf('古い形式なので正しく動作しない可能性があります')!=-1) return;
					error.innerHTML=e.html;
				}
			});

			//掛けるの文字が違う場合でも実行できるように登録
			navigator.nako3.prepare.convertTable.set(10005,"*");
			navigator.nako3.prepare.convertTable.set(10007,"*");
			navigator.nako3.prepare.convertTable.set(10008,"*");
			navigator.nako3.prepare.convertTable.set(10060,"*");
			navigator.nako3.prepare.convertTable.set(10062,"*");

			//autorun
			if(autorun_code){
				nako3_run(autorun_code);
			}
		}
	}, 100);

	const output_change_checker=setInterval(()=>{
		Array.from(output.children).forEach(e=>{
			if(e.style.display!="block"){
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
	}, 300);
});

