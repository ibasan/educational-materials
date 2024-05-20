
const plugin_convenient={
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

}
// モジュールのエクスポート(必ず必要)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = plugin_convenient;
}
//プラグインの自動登録
if (typeof (navigator) === 'object') {
	navigator.nako3.addPluginObject('plugin_convenient', plugin_convenient);
}