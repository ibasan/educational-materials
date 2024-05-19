
const plugin_convenient={
	'画像変更': {
		type: 'func',
		josi: [['を'],['に']],
		fn: function (img, src, sys) {
			img.src=src;
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