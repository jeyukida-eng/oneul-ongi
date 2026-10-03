/* A quiet moving sky, drawn to match Pyeoda's pencil landscape. */
(()=>{
 const hero=document.querySelector('#home .hero');
 if(!hero||hero.querySelector('.pyeoda-sky'))return;
 const css=document.createElement('style');
 css.textContent=`
 .hero{overflow:hidden;isolation:isolate}
 .hero>.pyeoda-sky{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
 .pyeoda-sky .sky-cloud{position:absolute;left:var(--x);top:var(--y);width:var(--size);opacity:.78;animation:sky-drift var(--duration) ease-in-out var(--delay) infinite;will-change:transform}
 .sky-cloud svg{display:block;width:100%;height:auto;filter:drop-shadow(0 3px 3px rgba(95,89,72,.06))}
 .pyeoda-sky .sky-star{position:absolute;left:var(--x);top:var(--y);width:var(--size);height:var(--size);color:#747d80;transform-origin:center;animation:sky-twinkle var(--duration) ease-in-out var(--delay) infinite}
 .sky-star svg{display:block;width:100%;height:100%;overflow:visible}
 @keyframes sky-drift{0%,100%{transform:translate3d(-17px,3px,0) rotate(-1deg)}50%{transform:translate3d(23px,-9px,0) rotate(1deg)}}
 @keyframes sky-twinkle{0%,100%{opacity:.22;transform:scale(.76);filter:drop-shadow(0 0 0 transparent)}45%,55%{opacity:.95;transform:scale(1.16);filter:drop-shadow(0 0 5px rgba(239,213,144,.88))}}
 @media(max-width:760px){.pyeoda-sky .sky-cloud{width:calc(var(--size)*.62);top:calc(var(--y) + 32%);opacity:.65}.pyeoda-sky .sky-star{top:calc(var(--y) + 30%);opacity:.65}}
 @media(prefers-reduced-motion:reduce){.pyeoda-sky .sky-cloud,.pyeoda-sky .sky-star{animation:none;will-change:auto}.pyeoda-sky .sky-star{opacity:.6}}
 `;
 document.head.append(css);
 if(document.body.classList.contains('mobile-build')){
  const mobileStyle=document.createElement('style');
  mobileStyle.textContent=`
  .mobile-build .top{min-height:58px!important;padding:6px 12px!important;gap:6px!important}
  .mobile-build .top .logo{font-size:19px!important;gap:4px!important}
  .mobile-build .top .nav{display:none!important}
  .mobile-build .mobile-page-controls button{min-height:34px;padding:0 9px;font-size:11px}
  .mobile-build .mobile-page-controls svg{width:18px;height:18px}
  .mobile-build .top .author-auth-btn{font-size:12px!important;min-height:36px!important;padding:6px 10px!important}
  .mobile-build .adult-switch{gap:4px;margin:0;flex-shrink:0}
  .mobile-build .adult-switch button{font-size:12px;padding:6px 10px;min-height:36px}
  .mobile-build #home .hero{height:auto!important;min-height:0!important;padding:112px 16px 18px!important;background-position:center bottom!important}
  .mobile-build #home .hero>div:first-child{padding:10px 12px!important;background:none!important;border-radius:0!important;text-align:center!important}
  .mobile-build #home .hero .eyebrow{display:none}
  .mobile-build #home .hero h1{font-size:clamp(23px,6.4vw,27px)!important;line-height:1.3!important;margin:0 0 8px!important;letter-spacing:-.045em!important}
  .mobile-build #home .hero .hero-copy{font-size:13px!important;line-height:1.6!important;text-align:center!important;font-weight:500!important}
  .mobile-build #home .hero .cta{grid-template-columns:1fr 1fr!important;gap:8px!important;margin-top:14px!important}
  .mobile-build #home .hero .cta button{min-height:44px!important;padding:8px 10px!important;font-size:14px!important}
  .mobile-build .mobile-home-details{margin:10px auto 0;max-width:440px;font:12px/1.6 system-ui,-apple-system,sans-serif;color:#596148;text-align:center}
  .mobile-build .mobile-home-details summary{cursor:pointer;min-height:32px;padding:6px;list-style-position:inside}
  .mobile-build #home .mobile-home-details p{font-size:12px!important;line-height:1.7!important;text-align:center!important;padding:8px 12px!important;background:#fffaf0e8;border-radius:10px}
  .mobile-build #home .section{padding-top:16px!important;padding-bottom:16px!important}
  .mobile-build #home .shelf-head{gap:8px!important;margin-bottom:12px!important}
  .mobile-build #home .shelf-head h2{font-size:20px;margin:0}
  .mobile-build #home #shelfDesc{display:none}
  .mobile-build #home .tabs{gap:12px!important;padding:0!important}
  .mobile-build #home .tab{min-height:36px;padding:6px 10px;font-size:13px}
  .mobile-build .book-card{font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif!important;-webkit-text-size-adjust:100%;text-size-adjust:100%}
  .mobile-build .book-card :is(h3,.book-author,.book-copy,.meta,.read-progress,.rank,.book-actions button,.book-title-link){font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif!important;letter-spacing:0!important}
  .mobile-build .book-card h3{font-weight:600!important}
  .mobile-build .book-card .book-actions button{font-weight:600!important}
  .mobile-build #home #bookGrid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:none!important;grid-auto-rows:clamp(96px,calc((100dvh - 495px)/4),112px);gap:7px!important;overflow:visible!important;padding:0!important;scroll-snap-type:none}
  .mobile-build #home #bookGrid>.book-card{width:100%!important;min-width:0!important;min-height:0!important;height:100%!important;padding:6px!important;grid-template-columns:42px minmax(0,1fr)!important;grid-template-rows:minmax(33px,1fr) 14px 28px!important;column-gap:6px!important;row-gap:2px;align-content:stretch;border-radius:10px}
  .mobile-build #home #bookGrid .cover{grid-column:1;grid-row:1/4;height:100%!important;min-height:0;align-self:stretch;border-radius:4px}
  .mobile-build #home #bookGrid h3{grid-column:2;grid-row:1;font-size:12px!important;line-height:1.35!important;margin:0!important;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;align-self:center;white-space:normal!important;word-break:keep-all;overflow-wrap:anywhere}
  .mobile-build #home #bookGrid .book-author{grid-column:2;grid-row:2;font-size:10px!important;line-height:14px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0!important}
  .mobile-build #home #bookGrid .book-copy,.mobile-build #home #bookGrid .server-book-badge,.mobile-build #home #bookGrid .book-foot>div:first-child,.mobile-build #home #bookGrid .price-tag,.mobile-build #home #bookGrid .read-progress{display:none!important}
  .mobile-build #home #bookGrid .book-foot{grid-column:2;grid-row:3;margin:0!important;padding:0!important;display:block!important;min-width:0;border:0!important}
  .mobile-build #home #bookGrid .book-actions{display:block!important;margin:0!important}
  .mobile-build #home #bookGrid .read-buttons{display:flex!important;gap:4px!important;margin:0!important;flex-wrap:nowrap!important}
  .mobile-build #home #bookGrid .read-buttons>.read-first{display:none!important}
  .mobile-build #home #bookGrid .read-buttons>button{display:block!important;flex:1 1 0;min-width:0!important;min-height:28px!important;height:28px!important;padding:2px 3px!important;font-size:9px!important;line-height:1.2;border-radius:12px}
  .mobile-build #home #bookGrid .read-buttons>.read-first{display:none!important}
  .mobile-build #home #bookGrid .read-buttons>.buy-book{flex:0 0 auto;padding:2px 7px!important}
  .mobile-build #home #bookGrid .rank{width:17px;height:17px;font-size:10px;line-height:17px;top:3px;left:3px;border:1px solid #fffdf8}
  .mobile-build #home #bookGrid .cover-placeholder{font-size:9px;line-height:1.3}
  .mobile-build #home .home-swipe-hint{display:none}
  .mobile-build #home .hero{padding:58px 14px 8px!important}
  .mobile-build #home .hero>div:first-child{padding:0!important;max-width:100%!important;width:100%}
  .mobile-build #home .hero h1{font-size:20px!important;line-height:1.2!important;margin-bottom:4px!important}
  .mobile-build #home .hero .hero-copy{display:none}
  .mobile-build #home .hero .cta{margin-top:8px!important;gap:7px!important}
  .mobile-build #home .hero .cta button{min-height:34px!important;padding:6px 8px!important;font-size:12px!important}
  .mobile-build .mobile-home-details{margin-top:4px;font-size:10px;line-height:1.3}
  .mobile-build .mobile-home-details summary{min-height:22px;padding:4px 0}
  .mobile-build #home .section{padding:10px 12px 8px!important}
  .mobile-build #home .shelf-head{flex-direction:row!important;align-items:center!important;gap:6px!important;margin-bottom:8px!important;padding-bottom:6px!important}
  .mobile-build #home .shelf-head h2{font-size:16px!important}
  .mobile-build #home .tabs{width:auto!important;gap:3px!important;flex-shrink:0}
  .mobile-build #home .tab{min-height:30px;padding:4px 6px;font-size:11px}
  .mobile-build #home .tab.active:after{bottom:-7px}
  .mobile-build #home .pyeoda-sky{height:58px;bottom:auto}
  .mobile-build .pyeoda-sky .sky-cloud{top:calc(var(--my)*.45);left:var(--mx);width:calc(var(--size)*.44);opacity:.95;animation-name:mobile-sky-drift;animation-duration:calc(var(--duration)*.65)}
  .mobile-build .pyeoda-sky .sky-star{top:calc(var(--my)*.5);left:var(--mx);width:calc(var(--size)*.85);height:calc(var(--size)*.85);color:#657060}
  .mobile-build .mobile-quick-memo{margin:0 12px;padding:6px 0 4px}
  .mobile-quick-memo .memo-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;font:11px/1.4 system-ui,sans-serif;color:#697158}
  .mobile-quick-memo .memo-head label{font-weight:700;color:#3e4436}
  .mobile-quick-memo .memo-head button{border:0;background:none;color:#697158;padding:2px 0 2px 8px;font:inherit;min-height:24px;cursor:pointer}
  .mobile-build #home .mobile-quick-memo textarea{display:block;width:100%;height:40px;min-height:40px;max-height:40px;padding:8px 10px;margin:0;border:1px solid #d6d0c4;border-radius:10px;resize:none;background:#fffdf8;color:#393c32;box-sizing:border-box;font:16px/1.4 system-ui,sans-serif}
  .mobile-memo-dialog{width:min(94vw,560px);height:min(86dvh,760px);max-height:90dvh;padding:16px;border:1px solid #d6d0c4;border-radius:18px;background:#fffdf8;color:#393c32;box-sizing:border-box}
  .mobile-memo-dialog[open]{display:flex;flex-direction:column;gap:12px}
  .mobile-memo-dialog::backdrop{background:rgba(40,37,31,.5)}
  .mobile-memo-dialog header,.mobile-memo-dialog footer{display:flex;align-items:center;justify-content:space-between;gap:10px;font:12px/1.5 system-ui,sans-serif;flex-shrink:0}
  .mobile-memo-dialog header h2{font:600 18px/1.4 system-ui,sans-serif;margin:0}
  .mobile-memo-dialog button{min-height:40px;padding:6px 14px;border:1px solid #c9c9bc;border-radius:20px;background:transparent;color:#4e5741;font:13px system-ui,sans-serif}
  .mobile-memo-dialog textarea{flex:1;min-height:0;width:100%;resize:none;padding:12px;border:1px solid #ddd7cc;border-radius:12px;background:transparent;color:#393c32;font:16px/1.8 system-ui,sans-serif;box-sizing:border-box}
  .mobile-memo-dialog footer span{font-size:11px;color:#697158}
  .mobile-build .book-title-link{display:block;width:100%;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:none!important;color:inherit!important;text-align:left;font:inherit!important;line-height:inherit!important;cursor:pointer;box-shadow:none!important}
  .mobile-build .book-title-link:focus-visible{outline:2px solid #697158;outline-offset:3px}
  .mobile-build #home .book-title-link{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
  .mobile-build #home .mobile-book-description{display:none!important}
  .mobile-build #discover #discoverGrid .book-card{height:270px!important;min-height:270px!important;grid-template-rows:auto auto minmax(0,1fr) auto!important;row-gap:6px;align-content:stretch}
  .mobile-build #discover .mobile-book-description{grid-column:2;grid-row:3;min-height:0;max-height:none;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#aeb29e transparent;padding-right:5px;line-height:1.6;-webkit-overflow-scrolling:touch}
  .mobile-build #discover .mobile-book-description:focus-visible{outline:1px solid #697158;outline-offset:2px}
  .mobile-build #discover .mobile-book-description .book-copy{display:block!important;-webkit-line-clamp:unset!important;max-height:none!important;height:auto!important;overflow:visible!important;white-space:normal!important;text-overflow:clip!important;margin:0 0 12px!important;font-size:12px!important;line-height:1.7!important}
  .mobile-build #discover .mobile-book-description .book-copy b{display:block;margin-bottom:4px;font-size:11px;color:#697158}
  .mobile-build #discover .book-foot{grid-row:4!important;grid-column:2;margin-top:0!important;min-height:0!important}
  .mobile-build #discover #discoverGrid .cover{grid-row:1/5!important;align-self:start}
  @keyframes mobile-sky-drift{0%,100%{transform:translate3d(-12px,4px,0) rotate(-2deg)}50%{transform:translate3d(18px,-7px,0) rotate(2deg)}}
  @media(prefers-reduced-motion:reduce){.mobile-build .pyeoda-sky .sky-cloud{animation:none}}
  `;
  document.head.append(mobileStyle);
  function enhanceMobileBooks(grid){
   for(const card of grid.querySelectorAll('.book-card')){
    const heading=card.querySelector('h3'),read=card.querySelector('.read');
    if(heading&&read&&!heading.querySelector('.book-title-link')){
     const titleButton=document.createElement('button');titleButton.type='button';titleButton.className='book-title-link';titleButton.setAttribute('aria-label',(read.dataset.title||heading.textContent)+' '+(read.dataset.readState==='resume'?'이어읽기':'읽기'));titleButton.append(...heading.childNodes);heading.append(titleButton);
     titleButton.onclick=()=>read.click();
    }
    if(read&&!card.dataset.mobileReadingCard){card.dataset.mobileReadingCard='true';card.style.cursor='pointer';card.addEventListener('click',e=>{if(e.target.closest('button,a,input,textarea,select,.mobile-book-description'))return;if(window.getSelection()?.toString())return;read.click();});}
    if(grid.id==='discoverGrid'&&!card.querySelector('.mobile-book-description')){
     const intro=card.querySelector('.book-copy.intro'),note=card.querySelector('.book-copy.note');if(!intro&&!note)continue;
     const description=document.createElement('div');description.className='mobile-book-description';description.tabIndex=0;description.setAttribute('role','region');description.setAttribute('aria-label',(read?.dataset.title||'작품')+' 책 소개와 작가의 말');
     if(intro)description.append(intro);if(note)description.append(note);card.insertBefore(description,card.querySelector('.book-foot'));
    }
   }
  }
  for(const id of ['bookGrid','discoverGrid']){const grid=document.getElementById(id);if(!grid)continue;enhanceMobileBooks(grid);new MutationObserver(()=>enhanceMobileBooks(grid)).observe(grid,{childList:true});}
  const copy=hero.querySelector('.hero-copy');
  const details=document.createElement('details');details.className='mobile-home-details';
  const summary=document.createElement('summary');summary.textContent='시작 비용 0원 · 4개 언어 출판 안내';
  const fullCopy=document.createElement('p');fullCopy.textContent=copy.innerText||copy.textContent;
  details.append(summary,fullCopy);copy.textContent='쓰고, 연재하고, 나만의 책으로 만드세요.';
  hero.querySelector('.cta').after(details);
  // A private, local notepad available without author login.
  const memoKey='pyeoda.quickMemo.v1';let memoValue='',storageAvailable=true;
  try{memoValue=localStorage.getItem(memoKey)||'';}catch(e){storageAvailable=false;}
  const memo=document.createElement('section');memo.className='mobile-quick-memo';memo.setAttribute('aria-label','간단 메모');
  memo.innerHTML='<div class="memo-head"><label for="quickMemoInput">간단 메모 <span id="quickMemoStatus">이 기기에 자동 저장</span></label><button type="button" id="openQuickMemo">크게 쓰기 ↗</button></div><textarea id="quickMemoInput" rows="1" placeholder="떠오른 생각을 바로 적어 보세요."></textarea>';
  hero.after(memo);
  const memoDialog=document.createElement('dialog');memoDialog.className='mobile-memo-dialog';memoDialog.setAttribute('aria-labelledby','quickMemoTitle');
  memoDialog.innerHTML='<header><h2 id="quickMemoTitle">나의 메모장</h2><button type="button" id="closeQuickMemo">닫기</button></header><textarea id="quickMemoEditor" aria-label="메모장 내용" placeholder="이야기, 아이디어, 오늘의 생각을 자유롭게 적어 보세요."></textarea><footer><span id="quickMemoEditorStatus">이 기기에 저장 · 로그인 없이 사용</span><button type="button" id="downloadQuickMemo">TXT 저장</button></footer>';
  document.body.append(memoDialog);
  const memoInput=memo.querySelector('textarea'),memoEditor=memoDialog.querySelector('textarea'),memoStatus=memo.querySelector('#quickMemoStatus'),editorStatus=memoDialog.querySelector('#quickMemoEditorStatus');
  memoInput.value=memoEditor.value=memoValue;
  function memoSave(value,source){memoValue=value;if(source!==memoInput)memoInput.value=value;if(source!==memoEditor)memoEditor.value=value;try{localStorage.setItem(memoKey,value);storageAvailable=true;}catch(e){storageAvailable=false;}memoStatus.textContent=storageAvailable?'저장됨 · 이 기기':'저장 불가 · TXT로 보관';editorStatus.textContent=storageAvailable?'이 기기에 저장됨 · '+value.length.toLocaleString()+'자':'자동 저장 불가 · TXT 저장을 눌러 보관해 주세요.';}
  if(!storageAvailable){memoStatus.textContent='저장 불가 · TXT로 보관';editorStatus.textContent='자동 저장 불가 · TXT 저장을 눌러 보관해 주세요.';}
  memoInput.addEventListener('input',()=>memoSave(memoInput.value,memoInput));memoEditor.addEventListener('input',()=>memoSave(memoEditor.value,memoEditor));
  memo.querySelector('#openQuickMemo').onclick=()=>{memoEditor.value=memoInput.value;memoDialog.showModal();memoEditor.focus();};
  memoDialog.querySelector('#closeQuickMemo').onclick=()=>memoDialog.close();memoDialog.addEventListener('close',()=>memoSave(memoEditor.value,memoEditor));
  memoDialog.querySelector('#downloadQuickMemo').onclick=()=>{const url=URL.createObjectURL(new Blob(['\uFEFF'+memoEditor.value],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='pyeoda-memo.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};


 }
 const sky=document.createElement('div');sky.className='pyeoda-sky';sky.setAttribute('aria-hidden','true');
 const outline='M19 53C8 53 5 44 10 37C14 31 20 30 27 31C27 20 36 12 47 14C53 3 72 2 80 14C93 11 107 20 107 32C119 30 130 37 130 45C130 53 122 57 113 56L23 56Z';
 const clouds=[{x:'20%',y:'24%',size:'150px',duration:'18s',delay:'-4s'},{x:'38%',y:'10%',size:'122px',duration:'23s',delay:'-13s'},{x:'50%',y:'27%',size:'166px',duration:'27s',delay:'-20s'}];
 clouds.forEach((c,i)=>{
  const cloud=document.createElement('span');cloud.className='sky-cloud';for(const [key,value] of Object.entries(c))cloud.style.setProperty('--'+key,value);
  cloud.innerHTML=`<svg viewBox="0 0 140 65" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pyeoda-cloud-${i}" x2="0" y2="1"><stop stop-color="#fffdf6"/><stop offset="1" stop-color="#eeeade"/></linearGradient></defs><path d="${outline}" fill="url(#pyeoda-cloud-${i})" stroke="#9e9e90" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><path d="${outline}" fill="none" stroke="#b2afa3" stroke-width=".6" stroke-dasharray="10 3 4 2" transform="translate(.8 -1)"/><path d="M22 50q35 6 85 0M36 48q22 4 35 2M51 15q10-5 20-1" fill="none" stroke="#bbb8aa" stroke-width=".8" opacity=".55" stroke-linecap="round"/></svg>`;
  const mobileClouds=[['8%','46px'],['38%','12px'],['67%','51px']];
  cloud.style.setProperty('--mx',mobileClouds[i][0]);cloud.style.setProperty('--my',mobileClouds[i][1]);
  sky.append(cloud);
 });
 const stars=[['7%','19%','8px','4.2s','-1s'],['17%','10%','11px','3.8s','-2.4s'],['24%','5%','14px','5.1s','-3s'],['32%','17%','9px','4.7s','-.8s'],['44%','5%','12px','4.4s','-2s'],['56%','13%','9px','5.6s','-4s']];
 stars.forEach(([x,y,size,duration,delay],i)=>{
  const star=document.createElement('span');star.className='sky-star';Object.entries({x,y,size,duration,delay}).forEach(([key,value])=>star.style.setProperty('--'+key,value));
  star.innerHTML='<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.8 14.6 9.1 22 12 14.6 14.5 12 22 9.3 14.5 2 12 9.3 9.1Z" fill="currentColor" stroke="#8e9592" stroke-width=".6" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.4" fill="#fff5ce"/></svg>';
  const mobileStars=[['6%','18px'],['27%','30px'],['36%','8px'],['60%','27px'],['77%','13px'],['91%','34px']];
  star.style.setProperty('--mx',mobileStars[i][0]);star.style.setProperty('--my',mobileStars[i][1]);
  sky.append(star);
 });
 hero.append(sky);
 // Hidden screens need not keep drawing animations.
 function sync(){sky.style.display=hero.closest('.screen')?.classList.contains('active')?'':'none';}
 new MutationObserver(sync).observe(hero.closest('.screen'),{attributes:true,attributeFilter:['class']});sync();
})();

/* Mobile registration: compact groups per page, cover creation comes last. */
(()=>{
 if(!document.body.classList.contains('mobile-build'))return;
 const screen=document.getElementById('register'),form=screen.querySelector('.register-form');
 if(form.dataset.mobileSteps)return;form.dataset.mobileSteps='true';
 const css=document.createElement('style');css.textContent=`
 .mobile-build #register .register-shell{padding:12px 14px 0!important}
 .mobile-build #register .register-head{margin:0 0 10px!important;gap:0!important}
 .mobile-build #register .register-head h2{font-size:22px!important;margin:0!important}
 .mobile-build #register .register-head p,.mobile-build #register .register-head>.meta{display:none}
 .mobile-build #register .register-layout{display:block!important}
 .mobile-build #register .register-form{padding:16px!important;display:flex;flex-direction:column;min-height:calc(100dvh - 258px);border-radius:16px}
 .mobile-build #register .mobile-step[hidden],.mobile-build #register .register-actions[hidden],.mobile-build #register .mobile-step-nav [hidden]{display:none!important}
 .mobile-build #register .mobile-step{min-width:0;flex:1}
 .mobile-build #register .mobile-step .reg-field{margin:0!important}
 .mobile-build #register .mobile-step label{font-size:17px}
 .mobile-build #register .mobile-step input:not([type=checkbox]):not([type=radio]):not([type=file]),.mobile-build #register .mobile-step select{min-height:48px;margin-top:12px}
 .mobile-build #register .mobile-step textarea{height:clamp(120px,28dvh,260px)!important;min-height:100px!important;margin-top:12px}
 .mobile-build #register .mobile-step .reg-help,.mobile-build #register .mobile-step .meta{font-size:12px;line-height:1.55}
 .mobile-build #register .mobile-step .text-limit-row{font-size:11px}
 .mobile-build #register #adultRegistrationRules{font-size:12px;line-height:1.5}
 .mobile-build #register #adultRegistrationRules p{margin:8px 0}
 .mobile-build #register #adultRegistrationRules label{font-size:13px}
 .mobile-build #register .mobile-step-progress{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;color:#68715a;font-size:12px}
 .mobile-step-progress progress{width:90px;height:5px;accent-color:#697158}
 .mobile-build #register .mobile-step-nav{display:grid;grid-template-columns:1fr 1.5fr;gap:10px;margin-top:18px;padding:10px 0 0;position:static;background:transparent;z-index:4}
 .mobile-build #register .mobile-step-nav button{min-height:46px;font:inherit;font-size:14px;border-radius:24px}
 .mobile-build #register .register-actions{margin-top:10px;padding:0;grid-template-columns:1fr!important}
 .mobile-build #register .register-actions>[data-go=studio]{display:none}
 .mobile-build #register .register-actions button{min-height:46px!important;font-size:14px}
 .mobile-build #register .register-cover-card{position:static!important;border:0;background:none;padding:0!important;gap:10px}
 .mobile-build #register .register-cover-preview{width:96px!important;max-width:96px!important;min-height:0!important;margin:0 auto!important}
 .mobile-build #register .cover-tool-buttons{display:grid;grid-template-columns:1fr 1fr!important;gap:8px}
 .mobile-build #register .cover-tool-btn{min-height:44px;padding:8px;font-size:12px!important}
 .mobile-build #register .cover-style-grid{grid-template-columns:1fr 1fr!important;gap:10px}
 .mobile-build #register .cover-style-grid span{padding:12px;font-size:13px}
 .mobile-build #register .mobile-cover-title{font-size:15px;text-align:center;margin:0 0 8px;word-break:keep-all}
 .mobile-build #register .mobile-cover-help{font-size:11px;line-height:1.5;margin:8px 0}
 .mobile-build #register .cover-ai-status{font-size:12px;line-height:1.5;margin:8px 0}
 .mobile-build #register .mobile-step-error{font-size:13px;color:#a34932;margin:10px 0 0}

 .mobile-build #register .mobile-step-fields{display:grid;gap:12px}
 .mobile-build #register .mobile-step-fields.two-columns{grid-template-columns:1fr 1fr;gap:14px 10px}
 .mobile-build #register .mobile-step-fields.two-columns .reg-field:has(#newAgeRating){grid-column:1/-1}
 .mobile-build #register .mobile-step label{font-size:14px}
 .mobile-build #register .mobile-step input:not([type=checkbox]):not([type=radio]):not([type=file]),.mobile-build #register .mobile-step select{min-height:44px;margin-top:6px;padding:8px 10px}
 .mobile-build #register .mobile-step .reg-help{font-size:11px;line-height:1.4;margin-top:4px}
 .mobile-build #register .two-columns .reg-help{display:none}
 .mobile-build #register .mobile-step details{margin-top:12px;font-size:12px}
 .mobile-build #register .mobile-step textarea{height:clamp(100px,22dvh,180px)!important;margin-top:6px}
 .mobile-build #register #newAuthorNote{height:clamp(130px,30dvh,260px)!important}
 .mobile-build #register .mobile-cover-design .cover-style-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px}
 .mobile-build #register .mobile-cover-design .cover-style-grid span{font-size:11px;padding:9px 5px}
 .mobile-build #register .mobile-cover-design .cover-style-wrap{margin-bottom:12px}
 .mobile-build #register .mobile-cover-design .reg-help{display:none}
 .mobile-build #register .mobile-cover-design #newCoverPrompt{height:clamp(90px,18dvh,150px)!important}
 .mobile-build #register .mobile-step #newBookIntro{height:clamp(90px,calc(100dvh - 590px),140px)!important;min-height:90px!important}
 .mobile-build #register .mobile-step .text-limit-row{margin-top:4px;gap:6px;line-height:1.4}
 .mobile-build #register .mobile-cover-design .cover-prompt-help{font-size:11px;line-height:1.45;margin:6px 0 0}
 .mobile-build #register .mobile-step-nav{align-items:center;padding-top:0;margin-top:14px;flex-shrink:0}
 .mobile-build #register .mobile-step-nav #startWriting{min-width:0!important;font-size:13px!important;padding:8px!important}
 .mobile-build #register .mobile-cover-top{display:grid;grid-template-columns:128px minmax(0,1fr);gap:10px;align-items:center}
 .mobile-build #register .mobile-cover-top .register-cover-preview{width:128px!important;max-width:128px!important;font-size:13px;border-radius:10px}
 .mobile-build #register .mobile-cover-design .cover-style-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:5px}
 .mobile-build #register .mobile-cover-design .cover-style-grid span{min-height:38px;padding:5px 6px;font-size:10px;gap:5px;border-radius:10px;line-height:1.3}
 .mobile-build #register .mobile-cover-design .cover-style-grid span::before{width:10px;height:10px}
 .mobile-build #register .mobile-cover-design .cover-style-wrap{gap:5px;margin:0}
 .mobile-build #register .register-cover-card .cover-tools{gap:5px}
 .mobile-build #register .register-cover-card #newCoverPrompt{height:68px!important;min-height:68px!important;padding:9px 11px;margin-top:0;resize:vertical;font-size:13px}
 .mobile-build #register .register-cover-card .cover-prompt-label{margin-bottom:5px}
 .mobile-build #register .register-cover-card .cover-prompt-help{font-size:10px;line-height:1.4;margin:3px 0 0}
 .mobile-build #register .register-cover-card .cover-ai-status{font-size:11px;line-height:1.4;margin:0;min-height:0}
 .mobile-build #register .mobile-cover-title{font-size:12px;line-height:1.4;margin:0;overflow-wrap:anywhere}
 .mobile-build #register .register-cover-card{gap:7px}
 .mobile-cover-top #newCoverPreview{cursor:zoom-in}
 .mobile-cover-top #newCoverPreview:focus-visible{outline:2px solid #697158;outline-offset:3px}
 .mobile-cover-dialog{width:min(88vw,480px);max-height:88dvh;padding:14px;border:1px solid #d6d0c4;border-radius:18px;background:#fffdf8;color:#4d4a43}
 .mobile-cover-dialog::backdrop{background:rgba(40,37,31,.55)}
 .mobile-cover-dialog header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;font:14px system-ui,sans-serif}
 .mobile-cover-dialog button{min-height:40px;padding:6px 14px;border:1px solid #d6d0c4;border-radius:20px;background:#fffdf8;color:inherit}
 .mobile-cover-dialog .register-cover-preview{width:100%!important;max-width:none!important;height:min(65dvh,600px);aspect-ratio:auto;margin:0!important}
 @media(max-height:700px){.mobile-build #register .register-form{padding:12px!important}.mobile-build #register .mobile-step-progress{margin-bottom:10px}.mobile-build #register .mobile-step-fields{gap:9px}.mobile-build #register .mobile-step-nav{margin-top:12px}.mobile-build #register .register-cover-preview{width:78px!important;max-width:78px!important}}
 `;document.head.append(css);
 const progress=document.createElement('div');progress.className='mobile-step-progress';progress.setAttribute('aria-live','polite');
 const steps=[];
 function step(node,label){const el=document.createElement('div');el.className='mobile-step';el.hidden=true;el.append(node);steps.push({el,label});return el;}
 function group(ids,label,columns=false){const grid=document.createElement('div');grid.className='mobile-step-fields'+(columns?' two-columns':'');for(const id of ids)grid.append(document.getElementById(id).closest('.reg-field'));return step(grid,label);}
 group(['newBookTitle','newBookSubtitle','newPenName'],'제목과 작가');
 group(['newCategory','newWritingType','newGenre','newFormat'],'작품 분류',true);
 const writingGuide=document.createElement('details');const guideSummary=document.createElement('summary');guideSummary.textContent='집필 기준 보기';writingGuide.append(guideSummary,document.getElementById('registrationWritingGuide'));steps[1].el.append(writingGuide);
 group(['newAudience','newPurpose','newAgeRating'],'독자와 이용등급',true);
 group(['newBookIntro','newTags'],'책 소개와 태그');
 group(['newAuthorNote'],'작가의 말');
 const cover=screen.querySelector('.register-cover-card'),tools=cover.querySelector('.cover-tools');
 const design=document.createElement('div');design.className='mobile-cover-design';design.append(cover.querySelector('.cover-style-wrap'));
 const prompt=document.getElementById('newCoverPrompt').parentElement;
 const status=document.getElementById('coverAiStatus');tools.append(status);
 const top=document.createElement('div');top.className='mobile-cover-top';top.append(cover.querySelector('.register-cover-preview'),design);cover.prepend(top);tools.prepend(prompt);
 document.getElementById('generateCoverBtn').textContent='AI 생성 · 첫 1회 무료';
 const title=document.createElement('p');title.className='mobile-cover-title';cover.prepend(title);
 const guide=cover.querySelector('.cover-guide');guide.remove();
 const billing=tools.querySelector(':scope > .cover-prompt-help');billing.classList.add('mobile-cover-help');billing.textContent='직접 올리기 무료 · 책마다 첫 AI 생성 1회 무료. 두 번째부터 비용이 발생합니다.';
 prompt.querySelector('.cover-prompt-help').textContent='제목과 필명은 자동으로 들어갑니다.';
 step(cover,'표지 만들기');
 const preview=cover.querySelector('#newCoverPreview');preview.setAttribute('role','button');preview.tabIndex=0;preview.setAttribute('aria-label','표지 미리보기 크게 보기');preview.setAttribute('aria-haspopup','dialog');
 const dialog=document.createElement('dialog');dialog.className='mobile-cover-dialog';dialog.setAttribute('aria-label','표지 크게 보기');
 const dialogHead=document.createElement('header'),dialogLabel=document.createElement('span'),close=document.createElement('button');dialogLabel.textContent='표지 미리보기';close.type='button';close.textContent='닫기';close.onclick=()=>dialog.close();dialogHead.append(dialogLabel,close);dialog.append(dialogHead);document.body.append(dialog);
 function openPreview(){dialog.querySelector('.register-cover-preview')?.remove();const large=preview.cloneNode(true);large.removeAttribute('id');large.removeAttribute('role');large.removeAttribute('tabindex');large.removeAttribute('aria-label');large.removeAttribute('aria-haspopup');dialog.append(large);dialog.showModal();}
 preview.addEventListener('click',openPreview);preview.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPreview();}});dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});

 for(const old of [...form.querySelectorAll(':scope > .form-section')])old.remove();
 steps[3].el.querySelector('#introCount').previousElementSibling.textContent='최대 1,000자';steps[4].el.querySelector('#authorNoteCount').previousElementSibling.textContent='최대 500자';steps[3].el.querySelector('#newTags').nextElementSibling.textContent='핵심 태그 3~5개 · 선택';
 const actions=form.querySelector('.register-actions');form.prepend(progress);for(const s of steps)form.insertBefore(s.el,actions);
 const error=document.createElement('p');error.className='mobile-step-error';error.setAttribute('role','alert');error.hidden=true;form.insertBefore(error,actions);
 const nav=document.createElement('div');nav.className='mobile-step-nav';nav.innerHTML='<button type="button" class="secondary">이전</button><button type="button" class="primary">다음</button>';form.insertBefore(nav,actions);
 const [prev,next]=nav.children;const finish=document.getElementById('startWriting');nav.append(finish);let current=0;
 function show(index,scroll=true){
  current=Math.max(0,Math.min(steps.length-1,index));steps.forEach((s,i)=>s.el.hidden=i!==current);
  progress.replaceChildren();const label=document.createElement('span');label.textContent=`${current+1} / ${steps.length} · ${steps[current].label}`;const bar=document.createElement('progress');bar.max=steps.length;bar.value=current+1;bar.setAttribute('aria-label','작품 등록 진행');progress.append(label,bar);
  prev.textContent=current?'이전':'취소';next.hidden=current===steps.length-1;actions.hidden=true;finish.hidden=current!==steps.length-1;
  error.hidden=true;title.textContent=`${document.getElementById('newBookTitle').value.trim()} · ${document.getElementById('newPenName').value.trim()}`;
  if(scroll){document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});}
 }
 function valid(id,message,index){if(document.getElementById(id).value.trim())return true;show(index);error.textContent=message;error.hidden=false;document.getElementById(id).focus();return false;}
 function required(){return valid('newBookTitle','책 제목을 입력해 주세요.',0)&&valid('newPenName','필명을 입력해 주세요.',0);}
 function ratingOK(){if(document.getElementById('newAgeRating').value!=='19'||document.getElementById('adultPolicyConsent').checked)return true;show(2);error.textContent='19+ 등록기준과 별도 심사에 동의해 주세요.';error.hidden=false;return false;}
 prev.onclick=()=>current?show(current-1):go('studio');
 next.onclick=()=>{if(current===0&&!required())return;if(current===2&&!ratingOK())return;show(current+1);};
 steps.forEach(s=>s.el.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'&&!['checkbox','radio','file'].includes(e.target.type)){e.preventDefault();const inputs=[...s.el.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=file]),select,textarea')];const following=inputs[inputs.indexOf(e.target)+1];if(following)following.focus();else if(current<steps.length-1)next.click();}}));
 document.getElementById('generateCoverBtn').addEventListener('click',e=>{if(!required()||!ratingOK()){e.preventDefault();e.stopImmediatePropagation();return;}if(!document.getElementById('newCoverPrompt').value.trim()){show(steps.length-1);document.getElementById('newCoverPrompt').focus();error.textContent='AI 표지에 넣을 장면을 입력해 주세요.';error.hidden=false;e.preventDefault();e.stopImmediatePropagation();}},true);
 document.getElementById('startWriting').addEventListener('click',e=>{if(!required()||!ratingOK()){e.preventDefault();e.stopImmediatePropagation();}},true);
 let active=screen.classList.contains('active');new MutationObserver(()=>{const now=screen.classList.contains('active');if(now&&!active)show(0);active=now;}).observe(screen,{attributes:true,attributeFilter:['class']});
 for(const b of document.querySelectorAll('[data-register-mode],#registeredNewBookBtn'))b.addEventListener('click',()=>show(0,false));
 show(0,false);
})();
