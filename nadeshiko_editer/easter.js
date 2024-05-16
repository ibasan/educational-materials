const konami_keyArr=[];
const konamiCommand=[
	'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft',
	'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'
];
let now_konami_flag=localStorage.getItem('LONGIC_konami')=="true";

const konami_key_down=(e)=>{
	konami_keyArr.push(e.code);
	if (konami_keyArr.length>10) {
		konami_keyArr.shift();
	}
	

	if(_.isEqual(konami_keyArr, konamiCommand)){
		now_konami_flag=!now_konami_flag;
		localStorage.setItem('LONGIC_konami', now_konami_flag);
	}
};
const konami_check=()=>{
	const konami_element=document.getElementById('konami');
	if(now_konami_flag && !konami_element){
		const click_div=reference.appendChild(document.createElement("div"));
		click_div.id="konami";
		click_div.textContent="コナミコマンド";
		click_div.onclick=()=>{window.open("https://ja.wikipedia.org/wiki/%E3%82%B3%E3%83%8A%E3%83%9F%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89");}
		click_div.classList.add("click_div");
		click_div.style.backgroundColor="rgb(255 209 209)";
	}else if(!now_konami_flag && konami_element){
		konami_element.remove();
	}
};

document.addEventListener('keydown', konami_key_down);