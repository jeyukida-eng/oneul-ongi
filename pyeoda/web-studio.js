/* Desktop studio. Existing editing controls and their handlers are reused. */
(()=>{
 if(document.body.classList.contains('mobile-build'))return;
 const editor=document.getElementById('editor'),section=editor?.querySelector('.section'),panel=section?.querySelector(':scope>.panel');
 if(!panel)return;
 const style=document.createElement('style');style.textContent=`
 @media(min-width:1051px){
 .mobile-writing #editor>.section{max-width:none!important;padding:14px 20px!important;display:grid;grid-template-columns:170px minmax(0,1fr) 270px;gap:14px;margin:0!important}
 .mobile-writing #editor>.section>.panel{border:1px solid var(--line)!important;background:#fffdf8!important;border-radius:12px;gap:0!important;padding:0!important}
 .web-writer-side,.web-writer-library{display:flex;flex-direction:column;min-height:0;overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fffdf8;padding:16px;box-sizing:border-box}
 .web-writer-side h2,.web-writer-library h2{font-size:15px;margin:0 0 16px}
 .web-writer-side button{width:100%;min-height:40px;text-align:left;padding:9px 12px;margin-bottom:5px;border:0;background:transparent;border-radius:8px;color:#66685d;cursor:pointer;font-size:13px}
 .web-writer-side button:first-of-type{background:#eceee4;color:#404a32;font-weight:600}
 .web-writer-side .web-writer-note{margin-top:auto;font-size:11px;line-height:1.7;color:#888}
 .mobile-writing #editor .current-book{height:60px!important;flex-basis:60px!important;margin:0!important;padding:10px 14px!important;border-bottom:1px solid var(--line);box-sizing:border-box;gap:7px}
 .mobile-writing #editor .current-book-info>b{font-size:15px!important}
 .mobile-writing #editor .current-book button{height:34px!important;min-height:34px!important;width:auto!important;padding:0 11px!important;font-size:12px!important;border-radius:8px!important;white-space:nowrap}
 .mobile-writing #editor #mobileWritingTools{order:2}
 .mobile-writing #editor .web-writer-top-actions{display:grid;grid-template-columns:repeat(4,96px);gap:8px;flex-shrink:0}
 body:not(.mobile-build).mobile-writing #editor .web-writer-top-actions>:is(#saveEpisodeBtn,#publishEpisode,#mobileWritingTools,button){width:96px!important;height:36px!important;min-height:36px!important;min-width:0!important;box-sizing:border-box!important;border-width:1px!important;border-style:solid!important;border-radius:8px!important;padding:0 6px!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:12px!important;line-height:1.2!important}
 body:not(.mobile-build).mobile-writing #editor .web-writer-top-actions>:is(#saveEpisodeBtn,#publishEpisode,#mobileWritingTools,button):focus-visible{outline:2px solid var(--olive);outline-offset:2px}
 .mobile-writing #editor .editor-episode-tools{display:none!important}
 .mobile-writing #editor .panel.editor{border:0!important;border-radius:0!important;padding:10px 18px!important;gap:6px!important}
 .mobile-writing #editor #editorStatus{font-size:11px!important;font-weight:400!important;color:#85877d}
 .mobile-writing #editor .episode-head{flex-basis:38px!important;margin:0!important}
 .mobile-writing #editor #title{font-size:19px!important;border:0;border-radius:0;background:transparent;padding:4px 8px!important;height:38px!important}
 .mobile-writing #editor #body:not(.manuscript-grid){background:#fffdf8!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:14px 12px!important;font-size:18px!important;line-height:1.9!important;outline:none}
 .mobile-writing #editor .manuscript-viewbar{flex:0 0 auto;margin:0!important;padding:5px 8px;border-bottom:1px solid var(--line);gap:8px}
 .mobile-writing #editor .manuscript-viewbar p{font-size:11px}
 .mobile-writing #editor .manuscript-view-buttons button{min-height:28px;height:28px;padding:2px 10px;font-size:11px}
 body:not(.mobile-build).mobile-writing #editor #body.manuscript-grid{padding:0 0 32px!important;font-size:16px!important;line-height:32px!important;letter-spacing:0!important;word-spacing:0!important;background-color:#fffdf5!important;background-attachment:local!important;border:1px solid rgba(164,107,76,.35)!important;border-radius:0!important}
 body:not(.mobile-build).mobile-writing #editor #body.manuscript-grid :is(div,p,span,font,b,strong,i,em,u,s,strike,blockquote,li,sub,sup){line-height:32px!important;font-size:16px!important}
 .mobile-writing #editor .manuscript-format-buttons button[aria-pressed='true']{background:#e6eadc;color:#3f4a32}
 .mobile-writing #editor .editorbar{flex-basis:28px!important;border-top:1px solid var(--line);padding-top:7px!important}
 .mobile-writing #editor .editorbar>.editor-actions:empty{display:none!important}
 .mobile-writing #editor #manuscriptToolbar{flex:0 0 auto;padding:6px!important;margin:0!important;border:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);border-radius:0;background:transparent}
 .mobile-writing #editor #manuscriptToolbar p{display:none}
 .mobile-writing #editor .manuscript-format-selects{display:flex;gap:8px;margin:0 0 4px}
 .mobile-writing #editor .manuscript-format-selects label{font-size:11px;display:flex;align-items:center;gap:4px}
 .mobile-writing #editor .manuscript-format-selects select{width:auto;min-height:26px;font-size:11px;padding:2px 6px}
 .mobile-writing #editor .manuscript-format-buttons{display:flex;flex-wrap:wrap;gap:3px}
 .mobile-writing #editor .manuscript-format-buttons button{min-height:28px;height:28px;font-size:11px;padding:0 6px;border:0;background:transparent;border-radius:4px}
 .mobile-writing #editor .manuscript-format-buttons button:hover{background:#eceee4}
 .web-writer-library-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}
 .web-writer-library-heading h2{margin:0}
 .web-writer-library-heading button{border:1px solid var(--line);background:transparent;border-radius:7px;padding:5px 9px;font-size:12px;cursor:pointer}
 .web-writer-booklist{max-height:38%;overflow:auto;flex:0 1 auto;overscroll-behavior:contain}
 .web-writer-book{display:flex;gap:9px;padding:10px 4px;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:transparent;cursor:pointer;border-radius:0;font-size:12px}
 .web-writer-book img{width:36px;height:52px;object-fit:contain;background:#f3f0e6}
 .web-writer-book span{display:block;min-width:0;flex:1}
 .web-writer-book b{display:block;font-size:12px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
 .web-writer-book small{display:block;color:#888;font-size:10px;margin-top:6px}
 .web-writer-library h3{font-size:12px;margin:18px 0 8px;padding-top:12px;border-top:1px solid var(--line)}
 .web-writer-library #episodeList{display:flex;flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;flex-direction:column;flex-wrap:nowrap;gap:5px;margin:0}
 .web-writer-library #episodeList button{width:100%;min-height:36px;flex-shrink:0;text-align:left;border:0;border-radius:7px;padding:8px 10px;font-size:12px;background:#f8f7f1}
 .web-writer-library #episodeList button.active{background:#e6eadc;color:#3f4a32}
 .web-writer-empty{font-size:12px;color:#929389;line-height:1.7;padding:12px 0}
 .mobile-writing #editor>.section.web-library-hidden{grid-template-columns:170px minmax(0,1fr)}
 .web-library-hidden .web-writer-library{display:none}
 }
 @media(max-width:1050px){.web-writer-side,.web-writer-library{display:none}.mobile-writing #editor .web-writer-top-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;width:100%;flex-basis:100%}body:not(.mobile-build).mobile-writing #editor .web-writer-top-actions>:is(#saveEpisodeBtn,#publishEpisode,#mobileWritingTools,button){width:100%!important;min-width:0!important;height:36px!important;min-height:36px!important;box-sizing:border-box!important;border-width:1px!important;border-style:solid!important;border-radius:8px!important;padding:0 4px!important;font-size:12px!important;line-height:1.2!important;display:flex!important;align-items:center!important;justify-content:center!important}.mobile-writing #editor .current-book{flex-wrap:wrap;height:auto!important;flex-basis:auto!important;min-height:38px!important}.mobile-writing #editor #manuscriptToolbar{display:none}}
 `;document.head.append(style);
 const left=document.createElement('aside');left.className='web-writer-side';left.setAttribute('aria-label','집필 관리 메뉴');
 const heading=document.createElement('h2');heading.textContent='작가 스튜디오';left.append(heading);
 for(const [label,target]of[['✎  집필하기','editor'],['▤  내 작품','books'],['▦  스튜디오','studio'],['▧  출판 센터','publishing']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>{if(saveBeforeMobileNavigation()!==false)go(target)};left.append(b)}
 const info=document.createElement('button');info.type='button';info.textContent='⚙  책 정보';info.onclick=()=>{if(saveBeforeMobileNavigation()!==false)openCurrentBookRegistration()};left.append(info);
 const note=document.createElement('p');note.className='web-writer-note';note.textContent='한 화면에서 집필하고, 작품과 회차를 바로 찾으세요.';left.append(note);section.prepend(left);
 const right=document.createElement('aside');right.className='web-writer-library';right.setAttribute('aria-label','내 작품과 회차 목록');
 const rh=document.createElement('div');rh.className='web-writer-library-heading';rh.innerHTML='<h2>내 작품</h2>';
 const add=document.createElement('button');add.type='button';add.textContent='+ 새 작품';add.onclick=()=>{if(saveBeforeMobileNavigation()!==false)openNewBookRegistration()};rh.append(add);right.append(rh);
 const list=document.createElement('div');list.className='web-writer-booklist';right.append(list);
 const chapters=document.createElement('h3');chapters.textContent='회차 목록';right.append(chapters);
 const eps=document.getElementById('episodeList');if(eps)right.append(eps);section.append(right);
 const header=editor.querySelector('.current-book');const actions=document.createElement('div');actions.className='web-writer-top-actions';
 for(const id of ['saveEpisodeBtn','publishEpisode']){const b=document.getElementById(id);if(b){b.textContent=id==='saveEpisodeBtn'?'저장하기':'공개하기';actions.append(b)}}header.append(actions);
 const toggle=document.createElement('button');toggle.type='button';toggle.textContent='목록 접기';toggle.setAttribute('aria-expanded','true');toggle.onclick=()=>{const hidden=section.classList.toggle('web-library-hidden');toggle.textContent=hidden?'목록 열기':'목록 접기';toggle.setAttribute('aria-expanded',String(!hidden))};actions.append(toggle);
 const tool=document.getElementById('mobileWritingTools');if(tool){tool.textContent='책 정보·도구';actions.append(tool);}
 const toolbar=document.getElementById('manuscriptToolbar'),body=document.getElementById('body'),viewbar=document.querySelector('.manuscript-viewbar'),dialog=document.querySelector('.mobile-writing-tools');
 const desktop=matchMedia('(min-width:1051px)');
 function placeTools(){
  if(desktop.matches){if(toolbar)body.before(toolbar);if(viewbar)body.before(viewbar);if(eps)right.append(eps)}
  else if(dialog){if(toolbar)dialog.append(toolbar);if(viewbar)dialog.append(viewbar);if(eps)dialog.append(eps)}
  requestAnimationFrame(fitManuscriptPaperWidth);
 }
 desktop.addEventListener('change',placeTools);placeTools();
 new MutationObserver(()=>{if(editor.classList.contains('active'))requestAnimationFrame(fitManuscriptPaperWidth)}).observe(editor,{attributes:true,attributeFilter:['class']});
 function renderLibrary(){
  const rows=resolveRegisteredBooks();list.replaceChildren();
  if(!rows.length){const empty=document.createElement('p');empty.className='web-writer-empty';empty.textContent='등록한 작품이 없습니다. 새 작품을 등록해 집필을 시작하세요.';list.append(empty);return}
  for(const row of rows){const b=document.createElement('button');b.type='button';b.className='web-writer-book';
   if(row.cover){const img=document.createElement('img');img.src=safeImageSource(row.cover);img.alt='';b.append(img)}
   const text=document.createElement('span'),title=document.createElement('b'),meta=document.createElement('small');title.textContent=row.title||'제목 없는 책';meta.textContent=(row.completed?'완결':'작성 중')+' · '+(row.episodeCount||0)+'화';text.append(title,meta);b.append(text);
   b.onclick=async()=>{if(saveBeforeMobileNavigation()===false)return;b.disabled=true;try{if(await activateRegisteredBook(row))go('editor')}finally{b.disabled=false}};list.append(b)
  }
 }
 const source=document.getElementById('registeredBookList');if(source)new MutationObserver(renderLibrary).observe(source,{childList:true});renderLibrary();
})();
