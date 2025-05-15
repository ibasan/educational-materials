
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
	'円周率': { type: 'const', value: Math.PI },
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
			return img;
		}
	},
	'文字色変更': {
		type: 'func',
		josi: [['を'],['に','へ']],
		fn: function (element, color, sys) {
			element.style.color=color;
			return element;
		}
	},
	'文字サイズ変更': {
		type: 'func',
		josi: [['を'],['に','へ']],
		fn: function (element, size, sys) {
			element.style.fontSize=size;
			return element;
		}
	},
	'背景色変更': {
		type: 'func',
		josi: [['を'],['に','へ']],
		fn: function (element, color, sys) {
			element.style.backgroundColor=color;
			return element;
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
	'リンク作成': {
		type: 'func',
		josi: [['で'],['の']],
		pure: true,
		fn: function (dom, url, sys){
			//ref: https://stackoverflow.com/questions/384286/how-do-you-check-if-a-javascript-object-is-a-dom-object/384380#384380
			const dom_check=((o)=>{
				return (
				typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
				o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
				);
			})(dom);

			if(dom_check){
				sys.__addEvent(dom, 'click', ()=>{
					open(url, "_blank");
				}, null);
				return dom;
			}else{
				const a=sys.__exec('DOM部品作成', ['a', sys]);
				a.innerHTML=dom;
				a.href=url;
				a.target="_blank";
				return a;
			}

		}
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
			const candidate_name=[];

			json.forEach(item=>{
				if(item["properties"]["title"]==name){
					perfect.push(item["geometry"]["coordinates"].reverse().join("、"));
				}else if(item["properties"]["title"].indexOf(name)!=-1){
					candidate.push(item["geometry"]["coordinates"].reverse().join("、"));
					candidate_name.push(item["properties"]["title"]);
				}
			});

			if(perfect.length!=0){
				return [perfect[0]];
			}else if(candidate.length==1){
				return candidate;
			}else{
				return candidate_name;
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