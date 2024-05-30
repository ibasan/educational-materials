
const plugin_convenient={
	'meta': {
		type: 'const',
		value: {
			pluginName: 'plugin_convenient', // プラグインの名前
			description: '便利機能を提供するプラグイン', // プラグインの説明
			pluginVersion: '3.6.0', // プラグインのバージョン
			nakoRuntime: ['wnako'], // 対象ランタイム
			nakoVersion: '3.6.0' // 要求なでしこバージョン
		}
	},
	'画像作成': {
		type: 'func',
		josi: [['の', 'から']],
		pure: true,
		fn: function (url, sys){
			const img=sys.__exec('DOM部品作成', ['img', sys]);
			if(url.indexOf("https://drive.google.com/")!=-1){
				img.src="https://lh3.googleusercontent.com/d/"+url.split("/").slice(-2)[0];
			}else{
				img.src=url;
			}
			return img;
		}
	},
	'画像変更': {
		type: 'func',
		josi: [['を'],['に','へ']],
		fn: function (img, src, sys) {
			img.src=src;
		}
	},
	'文字色変更': {
		type: 'func',
		josi: [['を'],['に','へ']],
		fn: function (element, color, sys) {
			element.style.color=color;
		}
	},
	'背景色変更': {
		type: 'func',
		josi: [['を'],['に','へ']],
		fn: function (element, color, sys) {
			element.style.backgroundColor=color;
		}
	},

	'ドライブ埋込': {
		type: 'func',
		josi: [['の', 'を', 'から']],
		pure: true,
		fn: function (url, sys){
			const iframe=sys.__exec('DOM部品作成', ['iframe', sys]);
			const frame_url=url.split("/").slice(0,-1).join("/")+"/preview";

			iframe.src=frame_url;
			iframe.width="640";
			iframe.height="480";
			iframe.allow="autoplay";
			
			return iframe;
		}
	},

}
// モジュールのエクスポート(必ず必要)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = plugin_convenient;
}
//プラグインの自動登録
if (typeof (navigator) === 'object') {
	navigator.nako3.addPluginObject('plugin_convenient', plugin_convenient);
}