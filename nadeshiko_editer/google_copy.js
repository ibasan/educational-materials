const get_googlesite_copy=()=>{
	const domain='https://github.kasumigaura.work/nadeshiko_editer/';
	
	return "<html><body><div id='output'><div style='display:none' id='error'></div><div style='display:none' id='text_output'></div><div style='display:none' id='result_div'></div><canvas style='display:none' id='result_canvas' width='500' height='400'></canvas></div><script type='text/javascript' src='"+domain+"load.js'></script><script id='main' type='なでしこ'>"+code_getText()+"</script><script>setTimeout(()=>{autorun_code=document.getElementById('main').innerText;}, 0);</script></body></html>";
}