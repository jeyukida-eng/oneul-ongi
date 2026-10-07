/* Shared button actions: preserve feature handlers, prevent duplicate work, report failures. */
(()=>{
 'use strict';
 const originalGo=go;
 go=function(id){
  const target=document.getElementById(id);
  if(!target?.classList.contains('screen')){toast('이 화면을 열지 못했습니다. 홈에서 다시 선택해 주세요.');return;}
  // Existing navigation handlers own manuscript saving; do not save twice.
  return originalGo(id);
 };
 document.querySelector('#home .hero .cta')?.remove();
 const busy=new WeakSet(),wrapped=new WeakMap();
 function bind(){
  for(const button of document.querySelectorAll('button')){
   const handler=button.onclick;
   if(typeof handler!=='function'||wrapped.get(button)===handler)continue;
   const action=function(event){
    if(busy.has(button))return;
    try{
     const result=handler.call(this,event);
     if(!result||typeof result.then!=='function')return result;
     busy.add(button);button.setAttribute('aria-busy','true');
     return Promise.resolve(result).catch(error=>{
      console.error('Books button action failed',button.id||button.textContent.trim(),error);
      toast('작업을 완료하지 못했습니다. 연결을 확인하고 다시 눌러 주세요.');
     }).finally(()=>{busy.delete(button);button.removeAttribute('aria-busy');});
    }catch(error){
     console.error('Books button action failed',button.id||button.textContent.trim(),error);
     toast('이 기능을 실행하지 못했습니다. 다시 눌러 주세요.');
    }
   };
   wrapped.set(button,action);button.onclick=action;
  }
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(button&&busy.has(button)){event.preventDefault();event.stopImmediatePropagation();}
 },true);
 new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
 const style=document.createElement('style');
 style.textContent='button[aria-busy="true"]{cursor:progress!important;opacity:.65}button[aria-busy="true"]:after{content:" · 처리 중";font-size:10px}';
 document.head.append(style);bind();
})();
