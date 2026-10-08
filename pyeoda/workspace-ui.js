/* Separate discovery from the creator's working space; reuse existing guarded actions. */
(()=>{
 'use strict';
 const main=document.querySelector('.app>main'),top=document.querySelector('.top'),nav=document.querySelector('.music-bottom-nav');
 if(!main||!top||!nav)return;
 let mode='reader';
 const creatorScreens=new Set(['workspace','studio','books','register','editor','publishing','publish','paper','global','revenue']);
 const hub=document.createElement('section');hub.id='workspace';hub.className='screen';
 hub.innerHTML='<div class="section workspace-shell"><div class="workspace-heading"><small>CREATOR WORKSPACE</small><h2>나의 작업실</h2></div><button type="button" class="workspace-primary" data-workspace-go="register"><span>＋</span><div><b>새 책 쓰기</b><small>이야기의 첫 페이지를 펼치세요</small></div></button><div class="workspace-grid"><button type="button" data-workspace-go="books"><b>책 관리</b><small>작성 중 · 공개 · 완결</small></button><button type="button" data-workspace-go="studio"><b>대시보드</b><small>작품과 독자 반응</small></button><button type="button" data-workspace-go="publishing"><b>출판 센터</b><small>전자책 · 종이책 · 번역</small></button><button type="button" data-workspace-go="revenue"><b>수익·정산</b><small>판매와 정산 내역</small></button></div><button type="button" class="workspace-profile"><b>내 크리에이터 홈</b><small>소개 · 작업노트 · 팔로우 · 후원</small></button></div>';
 main.append(hub);
 const memo=document.querySelector('#home [aria-label="간단 메모"]');if(memo)hub.firstElementChild.append(memo);
 document.querySelector('#home .books-home-policy')?.remove();
 const logo=top.querySelector('.logo');
 if(logo)logo.onclick=()=>navigate(mode==='creator'?'workspace':'home');
 const back=document.createElement('button');back.type='button';back.className='space-back';back.setAttribute('aria-label','이전 화면');back.title='이전 화면';back.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>';
 const brand=document.createElement('div');brand.className='space-brand';logo.before(brand);brand.append(back,logo);
 let trail=[],lastScreen=document.querySelector('.screen.active')?.id,replayTarget=null;
 back.onclick=()=>{if(!trail.length||saveBeforeMobileNavigation()===false)return;const target=trail[trail.length-1];replayTarget=target;go(target);if(document.querySelector('.screen.active')?.id===target)trail.pop();else replayTarget=null;};
 const small=top.querySelector('.logo small');if(small)small.textContent='READ YOUR NEXT STORY';
 const switcher=document.createElement('div');switcher.className='workspace-switch';switcher.setAttribute('role','group');switcher.setAttribute('aria-label','공간 선택');switcher.innerHTML='<button type="button" data-space="reader" aria-pressed="true">독자</button><button type="button" data-space="creator" aria-pressed="false">크리에이터</button>';
 top.after(switcher);
 function navigate(id){if(saveBeforeMobileNavigation()===false)return;if(id==='register')return openNewBookRegistration();go(id);}
 hub.querySelectorAll('[data-workspace-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.workspaceGo));
 hub.querySelector('.workspace-profile').onclick=()=>document.querySelector('[data-open-my-creator]')?.click();
 const navIcons={home:'<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',discover:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',workspace:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',books:'<path d="M5 4h14v17H5zM9 4v17M12 8h4"/>',register:'<path d="M12 4v16M4 12h16"/>',publishing:'<path d="M12 5v15M3 4l9 1 9-1v15l-9 1-9-1z"/>',library:'<path d="M3 4h5v16H3zM10 4h5v16h-5zM17 5l4-1 3 15-4 1z"/>',my:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'};
 const consumer=[['home','홈'],['discover','검색'],['workspace','크리에이터'],['library','서재'],['my','MY']];
 const creator=[['workspace','작업실'],['books','책 관리'],['register','쓰기'],['publishing','출판'],['my','MY']];
 function setMode(next){if(logo)logo.setAttribute('aria-label','PYODA BOOKS '+(next==='creator'?'크리에이터 홈':'독자 홈'));if(mode!==next){mode=next;trail=[];lastScreen=null;renderNav();}document.body.classList.toggle('creator-workspace',mode==='creator');switcher.querySelectorAll('[data-space]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.space===mode)));if(small)small.textContent=mode==='creator'?'CREATOR WORKSPACE':'READ YOUR NEXT STORY';}
 function renderNav(){const rows=mode==='creator'?creator:consumer;[...nav.children].forEach((b,i)=>{b.dataset.go=rows[i][0];b.setAttribute('aria-label',rows[i][1]);b.querySelector('span').textContent=rows[i][1];b.querySelector('svg').innerHTML=navIcons[rows[i][0]];b.removeAttribute('data-register-mode');b.onclick=()=>{if(rows[i][0]==='workspace'){if(saveBeforeMobileNavigation()===false)return;setMode('creator');go('workspace');}else navigate(rows[i][0]);};});}
 function sync(){const id=document.querySelector('.screen.active')?.id;if(creatorScreens.has(id))setMode('creator');else if(['home','discover','reader','library','creators'].includes(id))setMode('reader');if(id!==lastScreen){if(id===replayTarget)replayTarget=null;else if(lastScreen)trail.push(lastScreen);lastScreen=id;}if(id===(mode==='creator'?'workspace':'home'))trail=[];back.disabled=!trail.length;
 nav.querySelectorAll('button').forEach(b=>{const on=b.dataset.go===id||(b.dataset.go==='publishing'&&['publish','paper','global'].includes(id));b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});document.querySelector('.studio-section-nav')?.setAttribute('data-space',mode);}
 switcher.querySelectorAll('[data-space]').forEach(b=>b.onclick=()=>{if(saveBeforeMobileNavigation()===false)return;setMode(b.dataset.space);go(mode==='creator'?'workspace':'home');});
 document.querySelectorAll('#my [data-music-go],#my [data-open-my-creator]').forEach(b=>b.classList.add('workspace-only'));
 const myEntry=document.createElement('button');myEntry.type='button';myEntry.className='music-menu reader-only';myEntry.textContent='크리에이터로 전환';myEntry.onclick=()=>{setMode('creator');go('workspace');};document.querySelector('#my .section').append(myEntry);
 const myLibrary=document.createElement('button');myLibrary.type='button';myLibrary.className='music-menu reader-only';myLibrary.textContent='나의 서재';myLibrary.onclick=()=>go('library');myEntry.before(myLibrary);
 renderNav();document.querySelectorAll('.screen').forEach(el=>new MutationObserver(sync).observe(el,{attributes:true,attributeFilter:['class']}));sync();
})();
