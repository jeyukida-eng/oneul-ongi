/* Mobile writing uses the visible viewport; extra tools retain their original handlers. */
(()=>{
 if(!document.body.classList.contains('mobile-build'))return;
 const editor=document.getElementById('editor');if(!editor)return;
 const styles=document.createElement('style');styles.textContent=`
 body.mobile-writing{height:100dvh;overflow:hidden!important}
 .mobile-writing #editor{position:fixed;left:var(--writing-left,0px);top:var(--writing-top,90px);width:var(--writing-width,100%);height:var(--writing-height,calc(100dvh - 90px));z-index:30;overflow:hidden;background:var(--paper);box-sizing:border-box}
 .mobile-writing #editor>.section{height:100%;padding:6px 8px!important;box-sizing:border-box}
 .mobile-writing #editor>.section>.panel{height:100%;min-height:0;padding:0!important;border:0;box-shadow:none;background:transparent;display:flex;flex-direction:column;gap:5px;overflow:hidden;box-sizing:border-box}
 .mobile-writing #editor>.section>.panel>h2,.mobile-writing #editor>.section>.panel>p.meta{display:none!important}
 .mobile-writing #editor .current-book{flex:0 0 32px;height:32px;min-height:0!important;padding:0!important;margin:0!important;border:0;background:none;display:flex;align-items:center;gap:8px}
 .mobile-writing #editor .current-book-cover,.mobile-writing #editor .current-book-info>span{display:none!important}
 .mobile-writing #editor .current-book-info{flex:1;min-width:0}
 .mobile-writing #editor .current-book-info>b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .mobile-writing #editor #mobileWritingTools{min-height:32px;height:32px;padding:3px 12px;font:13px system-ui;flex-shrink:0}
 .mobile-writing #editor .editor-episode-tools{flex:0 0 30px;margin:0!important;padding:0!important;min-height:0;display:flex;justify-content:space-between}
 .mobile-writing #editor .editor-episode-navigation{width:100%;justify-content:space-between;margin:0}
 .mobile-writing #editor .editor-episode-navigation button{width:38px;height:30px;min-height:30px!important;padding:0;font-size:17px}
 .mobile-writing #editor .panel.editor{flex:1 1 0;min-height:0!important;height:auto!important;padding:6px 8px!important;margin:0;border-radius:12px;display:flex;flex-direction:column;gap:5px;overflow:hidden;box-sizing:border-box}
 .mobile-writing #editor #editorStatus{font-size:11px;line-height:16px;flex:0 0 auto;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .mobile-writing #editor .episode-head{flex:0 0 34px;display:flex;margin:0!important;gap:5px}
 .mobile-writing #editor #episodeNo{display:none!important}
 .mobile-writing #editor #title{width:100%;height:34px;min-height:0!important;font-size:16px!important;padding:4px 8px!important;box-sizing:border-box}
 .mobile-writing #editor #body{flex:1 1 0!important;min-height:0!important;height:auto!important;max-height:none!important;margin:0!important;padding:10px 8px!important;overflow:auto!important;overscroll-behavior:contain;font-size:17px!important;line-height:1.75!important;box-sizing:border-box;-webkit-overflow-scrolling:touch}
 .mobile-writing #editor .editorbar{flex:0 0 36px;min-height:0;display:flex!important;flex-direction:row!important;align-items:center!important;gap:6px!important;margin:0!important;padding:3px 0 0!important;box-sizing:border-box}
 .mobile-writing #editor .editorbar>span{flex:1;min-width:0;font-size:11px}
 .mobile-writing #editor .proof-legend{display:none!important}
 .mobile-writing #editor .editor-actions{display:flex!important;width:auto!important;margin:0;flex-shrink:0}
 .mobile-writing #editor #saveEpisodeBtn{width:auto!important;height:32px!important;min-height:32px!important;padding:4px 18px!important;font-size:13px!important}
 .mobile-writing #editor .editor-footer-navigation{display:none!important}
 .mobile-writing-tools{width:min(430px,calc(100% - 20px));max-height:85dvh;overflow:auto;box-sizing:border-box;padding:16px;border:1px solid var(--line);border-radius:16px;background:var(--paper);color:var(--ink)}
 .mobile-writing-tools::backdrop{background:#0006}
 .mobile-writing-tools>header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
 .mobile-writing-tools>header h2{margin:0;font-size:18px}
 .mobile-writing-tools #mobileWritingClose{min-height:36px;padding:4px 12px}
 .mobile-writing-tools .writer-cheatsheet{display:none!important}
 .mobile-writing-tools .editor-writing-guide,.mobile-writing-tools .episode-list,.mobile-writing-tools .manuscript-file-tools,.mobile-writing-tools .manuscript-toolbar,.mobile-writing-tools .episode-pricing{margin:8px 0!important}
 .mobile-writing-tools .editor-book-tools,.mobile-writing-tools .editor-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;width:100%!important}
 .mobile-writing-tools .editor-action{width:100%!important;min-height:38px!important;height:38px!important;font-size:13px!important;padding:4px 8px!important}
 .mobile-writing-tools .completion-next:not(.show){display:none}
 `;document.head.append(styles);
 const dialog=document.createElement('dialog');dialog.className='mobile-writing-tools';dialog.setAttribute('aria-labelledby','mobileWritingToolsTitle');dialog.innerHTML='<header><h2 id="mobileWritingToolsTitle">집필 도구</h2><button type="button" class="secondary" id="mobileWritingClose">닫기</button></header>';document.body.append(dialog);
 const button=document.createElement('button');button.id='mobileWritingTools';button.type='button';button.className='secondary';button.textContent='도구';button.onclick=()=>dialog.showModal();
 document.getElementById('mobileWritingClose').onclick=()=>dialog.close();
 const infoButton=editor.querySelector('.current-book>button');if(infoButton)dialog.append(infoButton);
 editor.querySelector('.current-book').append(button);
 for(const selector of ['#writerCheatsheet','#editorWritingGuide','.editor-book-tools','#episodeList','.manuscript-file-tools','.manuscript-viewbar','#manuscriptToolbar','#proofCard','.episode-pricing','.completion-next']){const el=editor.querySelector(selector);if(el)dialog.append(el);}
 const additional=document.createElement('div');additional.className='editor-actions';dialog.append(additional);
 for(const el of editor.querySelectorAll('.editor-actions>button:not(#saveEpisodeBtn)'))additional.append(el);
 dialog.addEventListener('click',event=>{if(event.target.closest('[data-go],#nextEpisodeBtn'))dialog.close();});
 function viewport(){
  if(!editor.classList.contains('active'))return;
  const app=document.querySelector('.app').getBoundingClientRect(),top=document.querySelector('header.top').getBoundingClientRect(),view=window.visualViewport;
  const bottom=(view?.offsetTop||0)+(view?.height||window.innerHeight),start=Math.max(top.bottom,view?.offsetTop||0);
  editor.style.setProperty('--writing-left',app.left+'px');editor.style.setProperty('--writing-width',app.width+'px');editor.style.setProperty('--writing-top',start+'px');editor.style.setProperty('--writing-height',Math.max(160,bottom-start)+'px');
 }
 function active(){const on=editor.classList.contains('active');document.body.classList.toggle('mobile-writing',on);if(!on&&dialog.open)dialog.close();if(on)requestAnimationFrame(viewport);}
 new MutationObserver(active).observe(editor,{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',viewport);window.visualViewport?.addEventListener('resize',viewport);window.visualViewport?.addEventListener('scroll',viewport);active();
})();
