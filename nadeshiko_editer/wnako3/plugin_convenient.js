
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


	'無限': { type: 'const', value: Infinity },
	'画像作成': {
		type: 'func',
		josi: [['の', 'から']],
		pure: true,
		fn: function (url, sys){
			const img=sys.__exec('DOM部品作成', ['img', sys]);
			sys.__exec('画像変更', [img, url, sys]);
			return img;
		}
	},
	'画像変更': {
		type: 'func',
		josi: [['を'],['に','へ']],
		fn: function (img, url, sys) {
			if(url.indexOf("https://drive.google.com/")!=-1){
				img.src="https://lh3.googleusercontent.com/d/"+url.split("/").slice(-2)[0];
			}else{
				img.src=url;
			}
		}
	},
	'文字色変更': {
		type: 'func',
		josi: [['を'],['に','へ']],
		fn: function (element, color, sys) {
			element.style.color=color;
		}
	},
	'文字サイズ変更': {
		type: 'func',
		josi: [['を'],['に','へ']],
		fn: function (element, size, sys) {
			element.style.fontSize=size;
		}
	},
	'背景色変更': {
		type: 'func',
		josi: [['を'],['に','へ']],
		fn: function (element, color, sys) {
			element.style.backgroundColor=color;
		}
	},

	'埋込': {
		type: 'func',
		josi: [['を']],
		fn: function (src, sys) {
			const iframe=sys.__exec('DOM部品作成', ['iframe', sys]);
			iframe.src=src;
			iframe.width="640";
			iframe.height="480";

			return iframe;
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
	'時刻選択ボックス作成': {
		type: 'func',
		josi: [],
		pure: true,
		fn: function (sys) {
			const inp = sys.__exec('DOM部品作成', ['input', sys]);
			inp.type = 'time';
			return inp;
		}
	},
	'変更時': {
		type: 'func',
		josi: [['で'], ['を']],
		pure: true,
		fn: function (func, dom, sys) {
			sys.__addEvent(dom, 'change', func, null);
		},
		return_none: true
	},

	'地図名称検索': {
		type: 'func',
		josi: [['を','の']],
		pure: true,
		asyncFn: true,
		fn: async function (name, sys) {
			const url="https://msearch.gsi.go.jp/address-search/AddressSearch?q="+name;
			const http=await sys.__exec('HTTP取得', [url, sys]);
			const json=await sys.__exec('JSONデコード', [http, sys]);

			const perfect=[];
			const candidate=[];

			json.forEach(item=>{
				if(item["properties"]["title"]==name){
					perfect.push(item["geometry"]["coordinates"].join(","));
				}else if(item["properties"]["title"].indexOf(name)!=-1){
					candidate.push(item["geometry"]["coordinates"].join(","));
				}
			});

			if(perfect.length!=0){
				return perfect;
			}else{
				return candidate;
			}
		}
		
	}

}
// モジュールのエクスポート(必ず必要)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = plugin_convenient;
}
//プラグインの自動登録
if (typeof (navigator) === 'object') {
	navigator.nako3.addPluginObject('plugin_convenient', plugin_convenient);
}