let replace_flag=true;
let old_find_key={};

const code_getText=()=>{
	let code_innerText="";
	Array.from(code.children).forEach(e=>{
		code_innerText+=e.innerText.replace(/\n$/,"")+"\n";
	});
	return code_innerText;
};
const has_scroll_bar=(element)=>{
	return element.clientHeight==element.offsetHeight;
};
const toHalfWidth=(str)=>{
	// 全角英数字を半角に変換
	str = str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
	return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
	});
	return str;
}

window.addEventListener("load", ()=>{
	const control_button_dis=(target, new_text)=>{
		const old_text=target.textContent;
		target.style.width=target.offsetWidth+"px";
		target.textContent=new_text;
		target.disabled=true;
		setTimeout(()=>{
			target.textContent=old_text;
			target.disabled=false;
			target.style.width="";
		}, 5*1000);
	};
	const code_insert=data=>{
		//挿入処理
		const node_spliter="【DO NOT EDIT】この文字が表示された場合は、管理者にご連絡ください【LONGIC】";
		const split_data=data.replace(/\r\n|\n|\r/gu, node_spliter);
		const selection=window.getSelection();
		if(!selection || !selection.rangeCount) return;
		selection.deleteFromDocument();
		const range=selection.getRangeAt(0);
		range.insertNode(document.createTextNode(split_data));

		//カーソルの現時点の位置を取得
		let node_add_flag=false;
		let node_after_counter=1;
		let now_node_after_counter=0;
		code.childNodes.forEach(node=>{
			if(node_add_flag){
				node_after_counter++;
			}else if(node==range.endContainer){
				node_add_flag=true;
				Array.from(range.endContainer.childNodes).slice(range.endOffset).forEach(e=>{
					now_node_after_counter+=e.length||0;
				});
			}
		});

		//改行を置き換え
		code.innerHTML=code.innerHTML.replaceAll(node_spliter, "</div><div>");

		//カーソルの位置を戻す
		const code_children=code.childNodes;
		const target_node=code_children[code_children.length - node_after_counter].childNodes[0];
		if(target_node){
			range.setStart(target_node, target_node.length - now_node_after_counter);
			range.setEnd(target_node, target_node.length - now_node_after_counter);
		}else{
			range.setStart(code_children[code_children.length - node_after_counter], 0);
			range.setEnd(code_children[code_children.length - node_after_counter], 0);
		}

	};

	const unload=(event)=>{
		event.preventDefault();
		event.returnValue="";
	};

	const code_settings=setInterval(()=>{
		//すべて消えてしまった時用の復元処理
		if(code.getElementsByTagName("div").length==0){
			code.innerHTML="<div></div>";
		}

		//リファレンス検索
		const now_code=code.innerHTML.replaceAll(/「.*?」|《.*?》/g, "");
		const find_key=Object.keys(wnako3_reference).filter(key=>now_code.indexOf(key)!=-1);

		if(!_.isEqual(old_find_key, find_key)){
			old_find_key=find_key;
			reference.innerHTML="";
			find_key.forEach(key=>{
				if(reference.innerText.indexOf(key)==-1){
					const click_div=reference.appendChild(document.createElement("div"));
					click_div.textContent=key;
					click_div.onclick=()=>{
						if(typeof wnako3_reference[key]=="string"){
							window.open(wnako3_reference[key]);
						}else{
							reference_dialog.innerHTML="<h3>"+key+"</h3><div>使い方：<br>"+wnako3_reference[key][0]+"</div><br><div>説明：<br>"+wnako3_reference[key][1]+"</div>";
							message_dialog_setting("reference");
							message_dialog_show();
						}
					}
					click_div.classList.add("click_div");
				}
			});
		}
		konami_check();

	}, 100);
	
	window.addEventListener("keydown", event=>{
		if(event.ctrlKey && event.key==='s') {
			event.preventDefault();
			save.click();
		}else if(event.ctrlKey && event.key==='r') {
			event.preventDefault();
			run.click();
		}
	});
	code.addEventListener('compositionstart', ()=>{replace_flag=false;});
	code.addEventListener('compositionend', ()=>{replace_flag=true;});
	code.addEventListener("keydown", event=>{
		if(code.childElementCount==1 && (event.key=="Backspace" || event.key=="Delete")){
			if(code.children[0].innerText.length==1){
				code.children[0].innerText="\n";
			}
			if(code.innerText=="" || code.innerText=="\n"){
				event.preventDefault();
				return;
			}
		}else if(event.key=="Tab"){
			event.preventDefault();
			code_insert("　　");
		}
		window.addEventListener("beforeunload", unload);
	});
	code.addEventListener("paste", event=>{
		event.preventDefault();
		code_insert(event.clipboardData.getData("text/plain"));
	});

	fontsize_plus.addEventListener("click", ()=>{
		code.style.fontSize=(code.style.fontSize||"1em").slice(0,-2)-0+0.1+"em";
		localStorage.setItem('LONGIC_fontsize', code.style.fontSize);
	});
	fontsize_minus.addEventListener("click", ()=>{
		code.style.fontSize=(code.style.fontSize||"1em").slice(0,-2)-0.1+"em";
		localStorage.setItem('LONGIC_fontsize', code.style.fontSize);
	});
	clear.addEventListener("click", ()=>{
		result_clear();
	});
	code_clear.addEventListener("click", ()=>{
		if(confirm("現在編集中のプログラムが削除しますか？")){
			code.innerHTML="<div></div>";
			result_clear();
		}
	});
	copy.addEventListener("click", ()=>{
		navigator.clipboard.writeText(code_getText());
		control_button_dis(copy, "コピーしました！");
	});
	auto_push.addEventListener("click", ()=>{
		message_dialog_setting("auto_push");
		message_dialog_show();
	});
	var_push.addEventListener("click", ()=>{
		code_insert("《》");
	});
	save.addEventListener("click", ()=>{
		localStorage.setItem('LONGIC_save', code.innerHTML);
		window.removeEventListener("beforeunload", unload);
		control_button_dis(save, "保存しました");
	});
	download.addEventListener("click", ()=>{
		const blob=new Blob([code_getText()], {"type":"text/plain"});
		const aTag=document.createElement('a');
		aTag.href=URL.createObjectURL(blob);
		aTag.target='_blank';
		aTag.download="なでしこ"+(new Date().toISOString().slice(0,10))+".txt";
		aTag.click();
		URL.revokeObjectURL(aTag.href);
	});
	run.addEventListener("click", ()=>{
		//自動保存
		localStorage.setItem('LONGIC_save', code.innerHTML);
		window.removeEventListener("beforeunload", unload);
		control_button_dis(save, "自動保存完了...");

		//実行
		setTimeout(()=>{control_button_dis(run, "開始しています...");}, 500);
		nako3_run(code.innerText);
	});
	google_copy.addEventListener("click", ()=>{
		navigator.clipboard.writeText(get_googlesite_copy());
		control_button_dis(google_copy, "コピーしました！");
		message_dialog_setting("google_copy");
		message_dialog_show();
	});

	code.innerHTML=localStorage.getItem("LONGIC_save")||"<div><br></div>";
	code.style.fontSize=localStorage.getItem("LONGIC_fontsize")||"1em";


	//メッセージダイアログ関係
	//開く際には、message_dialog_show()を、
	//閉じる際には、message_dialog_close()を呼び出すこと。

	const message_dialog_show=()=>{
		message_dialog.showModal();
	};
	const message_dialog_close=()=>{
		message_dialog.close();
	};
	const message_dialog_setting=(event_name)=>{
		Array.from(document.getElementsByClassName('dialog_item')).forEach(e=>{
			e.style.display="none";
		});
		if(event_name=="google_copy"){
			//google site用コピー
			google_copy_dialog.style.display="block";
			copy_code.textContent=get_googlesite_copy();

		}else if(event_name=="auto_push"){
			//コードの自動挿入のトップ画面
			code_auto_push_list_dialog.style.display="block";

		}else if(event_name=="spreadsheets_auto_push"){
			//コードの自動挿入のスプレッドシート関係API
			target_spreadsheets_url.value="";
			target_cell.value="";
			spreadsheets_auto_push_dialog.style.display="block";

		}else if(event_name=="weather_auto_push"){
			//天気予報API
			weather_item_type.options[0].selected=true;
			weather_item_type.dispatchEvent(new Event("change"));
			weather_auto_push_dialog.style.display="block";
			setTimeout(()=>{map_list[0].invalidateSize()}, 100);

		}else if(event_name=="bulletin_auto_push"){
			//掲示板API
			target_bulletin_url.value="";
			bulletin_type.options[0].selected=true;
			bulletin_type.dispatchEvent(new Event("change"));
			bulletin_auto_push_dialog.style.display="block";

		}else if(event_name=="reference"){
			//reference表示
			reference_dialog.style.display="block";

		}else if(event_name=="map_auto_push"){
			//地図挿入時
			map_auto_push_dialog.style.display="block";
			setTimeout(()=>{map_list[1].invalidateSize()}, 100);
		}
	};
	message_dialog_inner.addEventListener("click", event=>{
		event.stopPropagation();
	});
	message_dialog.addEventListener("click", event=>{
		message_dialog_close();
	});
	dialog_close.addEventListener("click", ()=>{
		message_dialog_close();
	});

	//コードの自動挿入関連
	const code_auto_insert=(push_code)=>{
		code.innerHTML=push_code+code.innerHTML;
		window.addEventListener("beforeunload", unload);
	};
	send_mail_auto_push.addEventListener("click", ()=>{
		code_auto_insert(
			"<div>《キーワード》に「◯◯◯◯」を代入</div>"+
			"<div>《本文》に「◯◯◯◯◯◯◯◯◯◯◯」を代入</div>"+
			"<div></div>"+
			"<div>「"+api_url_list.mail_send+"?keyword={《キーワード》}&message={《本文》}」を《URL》に代入</div>"+
			"<div>《URL》からHTTP取得して、JSONデコードして、《データ》に代入</div>"+
			"<div></div>"+
			"<div>《データ》を表示</div>"+
			"<div></div>"+
			"<div></div>"
		);
		message_dialog_close();
	});
	copy_only_latlng.addEventListener("click", ()=>{
		navigator.clipboard.writeText((marker_list[1]._latlng.lat||34.91268472990215)+"，"+(marker_list[1]._latlng.lng||134.9806876365492));
		message_dialog_close();
	});
	incert_mapcode.addEventListener('click', ()=>{
		code_auto_insert(
			"<div>「"+(marker_list[1]._latlng.lat||34.91268472990215)+"、"+(marker_list[1]._latlng.lng||134.9806876365492)+"」を《座標》に代入</div>"+
			"<div>《座標》の地図作成して，《地図》に代入</div>"+
			"<div></div>"+
			"<div>《地図》を15にズーム倍率変更</div>"+
			"<div>《地図》の《座標》にピン設置して《ピン1》に代入</div>"+
			"<div>《ピン1》に「附属中学校はここです」をピンクリック時表示</div>"+
			"<div>《ピン1》を強制表示</div>"+
			"<div></div>"+
			"<div></div>"
		);
		message_dialog_close();
	});
	incert_read_spreadsheets.addEventListener("click", ()=>{
		code_auto_insert(
			"<div>《取得したいURL》に「"+(target_spreadsheets_url.value||"◯◯◯◯◯◯◯◯◯◯")+"」を代入</div>"+
			"<div>《指定範囲》に「"+(toHalfWidth(target_cell.value)||"◯◯")+"」を代入</div>"+
			"<div></div>"+
			"<div>「"+api_url_list.spreadsheets_read+"?select={《指定範囲》}&url={《取得したいURL》}」を《URL》に代入</div>"+
			"<div>《URL》からHTTP取得して、JSONデコードして、《データ》に代入</div>"+
			"<div></div>"+
			"<div>《データ》を表示</div>"+
			"<div></div>"+
			"<div></div>"
		);
		message_dialog_close();
	});
	incert_write_spreadsheets.addEventListener("click", ()=>{
		code_auto_insert(
			"<div>《取得したいURL》に「"+(target_spreadsheets_url.value||"◯◯◯◯◯◯◯◯◯◯")+"」を代入</div>"+
			"<div>《指定範囲》に「"+(toHalfWidth(target_cell.value)||"◯◯")+"」を代入</div>"+
			"<div>《書き込みたい内容》に「◯◯◯◯◯◯」を代入</div>"+
			"<div></div>"+
			"<div>「"+api_url_list.spreadsheets_write+"?select={《指定範囲》}&data={《書き込みたい内容》}&url={《取得したいURL》}」を《URL》に代入</div>"+
			"<div>《URL》からHTTP取得して、JSONデコードして、《データ》に代入</div>"+
			"<div></div>"+
			"<div>《データ》を表示</div>"+
			"<div></div>"+
			"<div></div>"
		);
		message_dialog_close();
	});
	incert_weather.addEventListener("click", ()=>{
		let add_insert="";
		let result_insert="";
		if(weather_item_day.value!="minus"){
			add_insert+="<div>《何日後のデータ？》に"+(weather_item_day.value||"◯")+"を代入</div>";
			result_insert="[《何日後のデータ？》]";
		}
		if(weather_item_time.value!="minus"){
			add_insert+="<div>《何時のデータ？》に"+(weather_item_time.value||"◯")+"を代入</div>";
			result_insert="[《何日後のデータ？》×24+《何時のデータ？》]";
		}
		code_auto_insert(
			"<div>《北緯》に「"+(marker_list[0]._latlng.lat||34.91268472990215)+"」を代入</div>"+
			"<div>《東経》に「"+(marker_list[0]._latlng.lng||134.9806876365492)+"」を代入</div>"+
			"<div>《情報の形式》に「"+(weather_item_type.value||"◯◯◯◯◯◯◯")+"」を代入</div>"+
			"<div>《取得したい情報》に「"+(weather_item_infoname.value||"◯◯◯◯◯◯◯")+"」を代入</div>"+
			add_insert+
			"<div></div>"+
			"<div>「"+api_url_list.weather_api+"?timezone=Asia%2FTokyo&latitude={《北緯》}&longitude={《東経》}&{《情報の形式》}={《取得したい情報》}」を《URL》に代入</div>"+
			"<div>《URL》からHTTP取得して、JSONデコードして、《そのままのデータ》に代入</div>"+
			"<div>《そのままのデータ》[《情報の形式》][《取得したい情報》]"+result_insert+"を《データ》に代入</div>"+
			"<div></div>"+
			"<div>《データ》を表示</div>"+
			"<div></div>"+
			"<div></div>"
		);
		message_dialog_close();
	});
	incert_bulletin.addEventListener("click", ()=>{
		const bulletin_input_data=bulletin_type.value.split(":");
		if(bulletin_input_data.length!=2) bulletin_input_data[1]=(bulletin_data.value||"◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯");
		code_auto_insert(
			"<div>《掲示板のデータ保存URL》に「"+(target_bulletin_url.value||"◯◯◯◯◯◯◯◯◯◯")+"」を代入</div>"+
			"<div>《読み込み？書き込み？》に「"+(bulletin_input_data[0])+"」を代入</div>"+
			"<div>《送信データ》に「"+(bulletin_input_data[1])+"」を代入</div>"+
			"<div></div>"+
			"<div>「"+api_url_list.bulletin+"?request={《読み込み？書き込み？》}&data={《送信データ》}&url={《掲示板のデータ保存URL》}」を《URL》に代入</div>"+
			"<div>《URL》からHTTP取得して、JSONデコードして、《データ》に代入</div>"+
			"<div></div>"+
			"<div>《データ》を表示</div>"+
			"<div></div>"+
			"<div></div>"
		);
		message_dialog_close();
	});


	//コードの自動挿入の設定画面
	map_auto_push.addEventListener("click", ()=>{
		message_dialog_setting("map_auto_push");
	});
	spreadsheets_auto_push.addEventListener("click", ()=>{
		message_dialog_setting("spreadsheets_auto_push");
	});
	weather_auto_push.addEventListener("click", ()=>{
		map_reset();
		message_dialog_setting("weather_auto_push");
	});

	chat_auto_push.addEventListener("click", ()=>{
		message_dialog_setting("bulletin_auto_push");
	});

	//掲示板API関連
	bulletin_type.addEventListener("change", ()=>{
		if(bulletin_type.value=="write"){
			bulletin_data_div.classList.remove("non_select");
			bulletin_data.disabled=false;
			bulletin_data.placeholder="";
		}else{
			bulletin_data_div.classList.add("non_select");
			bulletin_data.disabled=true;
			bulletin_data.placeholder="現在使用できません";
		}
		bulletin_data.value="";

	});


	//天気予報API関連
	for(let i=0; i<24; i++){
		const selecter=weather_item_time.appendChild(document.createElement("option"));
		selecter.innerText=i+"時";
		selecter.value=i;
	}

	weather_item_type.addEventListener("change", event=>{
		const select_rebuild=(target, object_data)=>{
			if(target.tagName!="SELECT") return;
			target.innerHTML="";
			for(const [key, value] of Object.entries(object_data)){
				const selecter=target.appendChild(document.createElement("option"));
				selecter.value=key;
				selecter.innerText=value;
			}
		};
		const non_select=(target, flag)=>{
			const target_select=target.getElementsByTagName("select")[0];
			if(!target_select) return;
			if(target_select.disabled==flag) return;

			if(flag){
				target.classList.add("non_select");
				target_select.disabled=true;

				const not_select=target_select.appendChild(document.createElement("option"));
				not_select.innerText="----";
				not_select.value="minus";
				not_select.classList.add("minus");
				not_select.hidden=true;
				not_select.selected=true;
			}else{
				target.classList.remove("non_select");
				target_select.disabled=false;

				Array.from(target_select.getElementsByClassName("minus")).forEach(e=>{
					e.remove();
				});
				target_select.options[0].selected=true;
			}
		}

		const weather_select=weather_setting.getElementsByTagName("select");
		const weather_item_predata={
			"current": {
				"temperature_2m": "現在の気温(℃)",
				"relative_humidity_2m": "現在の湿度(%)",
				"precipitation": "降水量(mm)",
				"wind_speed_10m": "風速(km/h)"
			},
			"hourly": {
				"temperature_2m": "1時間ごとの気温(℃)",
				"relative_humidity_2m": "1時間ごとの湿度(%)",
				"precipitation_probability": "1時間ごとの降水確率(%)",
				"pressure_msl": "気圧(hPa)",
				"wind_speed_10m": "風速(km/h)"
			},
			"daily": {
				"temperature_2m_max": "最高気温(℃)",
				"temperature_2m_min": "最低気温(℃)",
				"sunrise": "日出時刻(日付T時刻)",
				"sunset": "日没時刻(日付T時刻)",
				"uv_index_max": "UVインデックス",
				"precipitation_sum": "降水量の合計(mm)",
				"precipitation_probability_max": "最大降水確率(%)",
				"wind_speed_10m_max": "最大風速(km/h)"
			}
		};
		const now_no0_value=weather_select[0].value;
		select_rebuild(weather_select[1], weather_item_predata[now_no0_value]);
		if(now_no0_value=="current"){
			non_select(weather_setting_day_div, true);
			non_select(weather_setting_time_div, true);
		}else if(now_no0_value=="hourly"){
			non_select(weather_setting_day_div, false);
			non_select(weather_setting_time_div, false);
		}else if(now_no0_value=="daily"){
			non_select(weather_setting_day_div, false);
			non_select(weather_setting_time_div, true);
		}else{
			select_rebuild(weather_select[0], {
				"current": "現在の情報",
				"hourly": "時間ごとの情報",
				"daily": "1日ごとの情報"
			});
			weather_select[0].options[0].selected=true;
		}
	});


	//地図関連
	const map_list=[L.map('pin_map'), L.map('map')];
	let marker_list=[];

	map_list.forEach((e, index)=>{

		L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
		}).addTo(e);
		e.on("click", e_click=>{
			map_set(index, e_click.latlng);
		});

	});

	const map_reset=()=>{
		map_list.forEach((e, index)=>{
			e.setView([34.91268472990215, 134.9806876365492], 16);
			map_set(index, [34.91268472990215, 134.9806876365492]);
		});
	}
	const map_set=(id, latlng)=>{
		if(marker_list[id]){
			map_list[id].removeLayer(marker_list[id]);
		}
		marker_list[id]=L.marker(latlng).addTo(map_list[id]);
	}
	
	map_reset();
});