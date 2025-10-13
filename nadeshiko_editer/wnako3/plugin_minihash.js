
const plugin_minihash={
	'meta': {
		type: 'const',
		value: {
			pluginName: 'plugin_minihash', // プラグインの名前
			description: 'ハッシュ機能を提供するプラグイン', // プラグインの説明
			pluginVersion: '3.6.0', // プラグインのバージョン
			nakoRuntime: ['wnako'], // 対象ランタイム
			nakoVersion: '3.6.0' // 要求なでしこバージョン
		}
	},


	'ハッシュ値': {
		type: 'func',
		josi: [['の', 'を']],
		pure: true,
		fn: function (string, sys){
			return sys.__exec('大文字変換', [window.xxhash(string), sys]);
		}
	},

	'ハッシュ化': {
		type: 'func',
		josi: [['の', 'を']],
		pure: true,
		fn: function (string, sys){
			return sys.__exec('ハッシュ値', [string, sys]);
		}
	},
	'ハッシュ': {
		type: 'func',
		josi: [['の', 'を']],
		pure: true,
		fn: function (string, sys){
			return sys.__exec('ハッシュ値', [string, sys]);
		}
	},

}
// モジュールのエクスポート(必ず必要)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = plugin_minihash;
}
//プラグインの自動登録
if (typeof (navigator) === 'object') {
	navigator.nako3.addPluginObject('plugin_minihash', plugin_minihash);
	xxhash().then(xx_hash=>{
		window.xxhash=xx_hash.h32ToString;
	});
}