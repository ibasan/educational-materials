/**
* なでしこ3  leafletプラグイン
* ・ leaflet(https://leafletjs.com/)
* ・なでしこ(https://nadesi.com/)
*/

const Plugin_leaflet={
	'meta': {
		type: 'const',
		value: {
			pluginName: 'Plugin_leaflet', // プラグインの名前
			description: '地図作成を補助する機能を提供するプラグイン', // プラグインの説明
			pluginVersion: '3.6.0', // プラグインのバージョン
			nakoRuntime: ['wnako'], // 対象ランタイム
			nakoVersion: '3.6.0' // 要求なでしこバージョン
		}
	},
	'地図作成': {
		type: 'func',
		josi: [['で','の']],
		fn: function (latlng, sys) {
			let lat=34.91268472990215;
			let lng=134.9806876365492;
			if(typeof latlng === 'string'){
				[lat, lng]=latlng.split(/[:：,，、\s+]/);
			}else if(Array.isArray(latlng)){
				lat=latlng[0];
				lng=latlng[1];
			}else{
				return false;
			}

			const map_div=sys.__exec('DOM部品作成', ['div', sys]);
			map_div.id="地図作成"+Math.random().toString(32).substring(2);
			map_div.style.height="300px";
			const mymap=L.map(map_div.id);
			L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
				maxZoom: 18,
				attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
			}).addTo(mymap);
			mymap.setView([lat, lng], 16);
			setTimeout(()=>{mymap.invalidateSize();},500);
			return mymap;
		}
	},
	"表示位置変更": {
		type: 'func',
		josi: [['の','を'],['に']],
		fn: function(mymap, latlng, sys) {
			let lat=34.91268472990215;
			let lng=134.9806876365492;
			if(typeof latlng === 'string'){
				[lat, lng]=latlng.split(/[:：,，、\s+]/);
			}else if(Array.isArray(latlng)){
				lat=latlng[0];
				lng=latlng[1];
			}else{
				return false;
			}
			mymap.setView([lat, lng]);
		}
	},
	"ズーム倍率変更": {
		type: 'func',
		josi: [['の','を'],['に']],
		fn: function(mymap, zoomlevel, sys) {
			mymap.setZoom(zoomlevel);
		}
	},
	"地図再表示": {
		type: 'func',
		josi: [['の']],
		fn: function(mymap, sys) {
			mymap.invalidateSize();
		}
	},
	"地図DOM取得": {
		type: 'func',
		josi: [['の']],
		fn: function (mymap, sys) {
			return mymap._container;
		}
	},
	"操作禁止": {
		type: 'func',
		josi: [['の','を','は']],
		fn: function (mymap, sys) {
			mymap.dragging.disable();
			mymap.touchZoom.disable();
			mymap.scrollWheelZoom.disable();
			mymap.doubleClickZoom.disable();
			mymap.boxZoom.disable();
			mymap.tapHold.disable();
			mymap.keyboard.disable();
			mymap.zoomControl.disable();
			return mymap;
		}
	},
	"ピン設置": {
		type: 'func',
		josi: [['の'],['に']],
		fn: function (mymap, latlng, sys) {
			let lat=34.91268472990215;
			let lng=134.9806876365492;
			if(typeof latlng === 'string'){
				[lat, lng]=latlng.split(/[:：,，、\s+]/);
			}else if(Array.isArray(latlng)){
				lat=latlng[0];
				lng=latlng[1];
			}else{
				return false;
			}
			return L.marker([lat, lng]).addTo(mymap);
		}
	},

	"ピンクリック時表示": {
		type: 'func',
		josi: [['に'],['で','を']],
		fn: function (mypin, text, sys) {
			mypin.bindPopup(text, {autoClose:false});
			return mypin;
		}
	},
	"強制表示": {
		type: 'func',
		josi: [['を']],
		fn: function (mypin, sys) {
			setTimeout(()=>{mypin.openPopup();}, 500);
		}
	},
	"強制非表示": {
		type: 'func',
		josi: [['を']],
		fn: function (mypin, sys) {
			setTimeout(()=>{mypin.closePopup();}, 500);
		}
	},

}
// モジュールのエクスポート(必ず必要)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = Plugin_leaflet;
}
//プラグインの自動登録
if (typeof (navigator) === 'object') {
	navigator.nako3.addPluginObject('Plugin_leaflet', Plugin_leaflet);
}