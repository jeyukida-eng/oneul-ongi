/* Writing stays within the visible viewport; tools retain their original handlers. */
(()=>{
 const editor=document.getElementById('editor');if(!editor)return;
 const styles=document.createElement('style');styles.textContent=`
 body.mobile-writing{height:100dvh;overflow:hidden!important}
 .mobile-writing #editor{position:fixed;left:var(--writing-left,0px);top:var(--writing-top,90px);width:var(--writing-width,100%)!important;max-width:var(--writing-width,100%)!important;min-width:0!important;height:var(--writing-height,calc(100dvh - 90px));z-index:30;overflow:hidden;background:var(--paper);box-sizing:border-box}
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

 @media(min-width:761px){
 body:not(.mobile-build).mobile-writing #editor>.section{max-width:1460px;margin:auto;padding:12px 24px!important}
 body:not(.mobile-build).mobile-writing #editor .current-book{flex-basis:38px;height:38px}
 body:not(.mobile-build).mobile-writing #editor .current-book-info>b{font-size:18px}
 body:not(.mobile-build).mobile-writing #editor .panel.editor{padding:10px 16px!important;gap:8px}
 body:not(.mobile-build).mobile-writing #editor .episode-head{flex-basis:40px}
 body:not(.mobile-build).mobile-writing #editor #title{height:40px;font-size:20px!important}
 body:not(.mobile-build).mobile-writing #editor #body{padding:12px 16px!important;font-size:18px!important;line-height:1.9!important;scrollbar-gutter:stable}
 body:not(.mobile-build).mobile-writing #editor .editorbar{flex-basis:44px}
 body:not(.mobile-build).mobile-writing #editor #saveEpisodeBtn{height:38px!important;min-height:38px!important;padding:6px 24px!important;font-size:14px!important}
 body:not(.mobile-build) .mobile-writing-tools{width:min(760px,calc(100% - 32px))}
 body:not(.mobile-build) .mobile-writing-tools .writer-cheatsheet{display:block!important}
 }
 .mobile-writing-tools{font:14px/1.55 system-ui,-apple-system,"Noto Sans KR",sans-serif;text-align:left}
 .mobile-writing-tools *{box-sizing:border-box}
 .mobile-writing-tools button,.mobile-writing-tools input,.mobile-writing-tools select,.mobile-writing-tools textarea{font-family:inherit!important;font-size:13px!important;line-height:1.4!important}
 .mobile-writing-tools button{min-height:38px!important;padding:7px 12px!important;border:1px solid var(--line)!important;border-radius:12px!important;background:var(--paper)!important;color:var(--ink)!important;box-shadow:none!important;white-space:normal;cursor:pointer;font-weight:600!important}
 .mobile-writing-tools button:disabled{opacity:.5;cursor:default}
 .mobile-writing-tools button:focus-visible{outline:2px solid var(--olive,#59614c);outline-offset:2px}
 .mobile-writing-tools button.active,.mobile-writing-tools button[aria-pressed="true"],.mobile-writing-tools #completeBook,.mobile-writing-tools #publishEpisode,.mobile-writing-tools #nextEpisodeBtn{background:var(--olive,#59614c)!important;color:#fffdf8!important;border-color:var(--olive,#59614c)!important}
 .mobile-writing-tools #deleteEpisode{color:#985c48!important;border-color:#d8c6bb!important}
 .mobile-writing-tools>header{position:sticky;top:-16px;z-index:1;background:var(--paper);padding:8px 0;border-bottom:1px solid var(--line)}
 .mobile-writing-tools>header h2{font:600 17px/1.4 system-ui,-apple-system,"Noto Sans KR",sans-serif}
 .mobile-writing-tools>button{width:100%;margin:0 0 8px}
 .mobile-writing-tools .editor-writing-guide{padding:10px 12px!important;border-radius:12px!important;font:13px/1.5 system-ui,-apple-system,"Noto Sans KR",sans-serif!important}
 .mobile-writing-tools .editor-writing-guide summary{font:inherit!important;display:flex;flex-wrap:wrap;gap:4px 10px}
 .mobile-writing-tools .editor-writing-guide summary strong{font-size:13px!important}
 .mobile-writing-tools .editor-writing-guide summary span{font-size:12px!important}
 .mobile-writing-tools .episode-list{display:flex;flex-wrap:wrap;gap:6px!important}
 .mobile-writing-tools .manuscript-file-tools{padding:10px!important;gap:10px!important;border-radius:12px!important}
 .mobile-writing-tools .manuscript-file-tools button{width:100%}
 .mobile-writing-tools .manuscript-file-tools span,.mobile-writing-tools .manuscript-viewbar p,.mobile-writing-tools .manuscript-toolbar p,.mobile-writing-tools .episode-pricing p{font:12px/1.6 system-ui,-apple-system,"Noto Sans KR",sans-serif!important}
 .mobile-writing-tools .manuscript-view-buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}
 .mobile-writing-tools .manuscript-viewbar,.mobile-writing-tools .manuscript-toolbar{padding:10px!important;border:1px solid var(--line);border-radius:12px;background:#f4f4ec}
 .mobile-writing-tools .manuscript-toolbar-row{gap:6px}
 `;document.head.append(styles);
 const dialog=document.createElement('dialog');dialog.className='mobile-writing-tools';dialog.setAttribute('aria-labelledby','mobileWritingToolsTitle');dialog.innerHTML='<header><h2 id="mobileWritingToolsTitle">집필 도구</h2><button type="button" class="secondary" id="mobileWritingClose">닫기</button></header>';document.body.append(dialog);
 const button=document.createElement('button');button.id='mobileWritingTools';button.type='button';button.className='secondary';button.textContent='도구';button.onclick=()=>dialog.showModal();
 document.getElementById('mobileWritingClose').onclick=()=>dialog.close();
 const infoButton=editor.querySelector('.current-book>button');if(infoButton)dialog.append(infoButton);
 editor.querySelector('.current-book').append(button);
 for(const selector of ['#writerCheatsheet','#editorWritingGuide','.editor-book-tools','#episodeList','.manuscript-file-tools','.manuscript-viewbar','#manuscriptToolbar','#proofCard','.episode-pricing','.completion-next']){const el=editor.querySelector(selector);if(el)dialog.append(el);}
 const additional=document.createElement('div');additional.className='editor-actions';dialog.append(additional);
 for(const el of editor.querySelectorAll('.editor-actions>button:not(#saveEpisodeBtn)'))additional.append(el);
 // Close the modal before commands restore a selection in the editor behind it.
 dialog.addEventListener('click',event=>{if(event.target.closest('[data-go],[data-rich-command],#manuscriptGridView,#manuscriptPlainView,#nextEpisodeBtn,#addEpisode,#importMarkdownDraft,#importPdfDraft,#insertManuscriptImage,#restoreMarkdownDraft,#removeManuscriptImage,#aiBtn,#applyProof,#ignoreProof'))dialog.close();},true);
 for(const select of dialog.querySelectorAll('#manuscriptFont,#manuscriptSize'))select.addEventListener('change',()=>dialog.close(),true);
 function viewport(){
  if(!editor.classList.contains('active'))return;
  const app=document.querySelector('.app').getBoundingClientRect(),top=document.querySelector('header.top').getBoundingClientRect(),view=window.visualViewport;
  const bottom=(view?.offsetTop||0)+(view?.height||window.innerHeight),start=Math.max(top.bottom,view?.offsetTop||0);
  editor.style.setProperty('--writing-left',app.left+'px');editor.style.setProperty('--writing-width',app.width+'px');editor.style.setProperty('--writing-top',start+'px');editor.style.setProperty('--writing-height',Math.max(160,bottom-start)+'px');
 }
 function active(){const on=editor.classList.contains('active');document.body.classList.toggle('mobile-writing',on);if(!on&&dialog.open)dialog.close();if(on){window.scrollTo({top:0,behavior:'instant'});requestAnimationFrame(viewport);}}
 new MutationObserver(active).observe(editor,{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',viewport);window.visualViewport?.addEventListener('resize',viewport);window.visualViewport?.addEventListener('scroll',viewport);active();
})();

