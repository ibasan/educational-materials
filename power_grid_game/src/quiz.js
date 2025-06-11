const css = document.head.appendChild(document.createElement('link'));
css.setAttribute("rel", 'stylesheet');
css.setAttribute("href", './src/quiz.css');

class QUIZ {
  static currentDialog = null;
  static #checkAnswer = ()=>{return true;};
  static mistakeReload = false;
  static question = "";
  static correctMessage = "";

  static setButtonUI(){
    const button = document.body.appendChild(document.createElement("button"));
    button.setAttribute("id", "quiz_ans");
    button.textContent = "回答する→";
    button.addEventListener("click", ()=>{
      if (QUIZ.#checkAnswer()){
        if (QUIZ.correctMessage!="") QUIZ.correctMessage = "<br>【プチ解説】"+QUIZ.correctMessage+"<br><br>"
        QUIZ.createDialog(`正解！<div style='font-size:1rem;'>${QUIZ.correctMessage}閉じるボタンを押してクイズ一覧に戻る</div>`, ()=>{
          window.location.href = "./index.html";
        });
      }else{
        QUIZ.createDialog("あれ？何かがおかしいようだ", ()=>{
          if (QUIZ.mistakeReload) {
            location.reload();
          } else {
            QUIZ.createDialog(QUIZ.question);
          }
        });
      }
    });
  }

  static createDialog(text, func = ()=>{}){
    if (QUIZ.currentDialog) {
      if (typeof QUIZ.currentDialog.close === 'function') {
        QUIZ.currentDialog.close();
      }
      QUIZ.currentDialog.remove();
      QUIZ.currentDialog = null;
    }

    const dlg = document.createElement('dialog');
    dlg.className = 'page-modal';
    dlg.innerHTML = `
      <form method="dialog">
        <div class="modal-body"><div>${text}</div></div>
        <button class="modal-close">閉じる</button>
      </form>`;
    document.body.appendChild(dlg);
    dlg.addEventListener("close", func);
    dlg.showModal();
    QUIZ.currentDialog = dlg;
  }

  static setAnswer(func){
    QUIZ.#checkAnswer = func;
  }

  static run(){
    QUIZ.createDialog(QUIZ.question);
  }
}
