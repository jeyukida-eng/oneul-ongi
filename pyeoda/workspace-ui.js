/* Separate discovery from the creator's working space; reuse existing guarded actions. */
(()=>{
 'use strict';
 const main=document.querySelector('.app>main'),top=document.querySelector('.top'),nav=document.querySelector('.music-bottom-nav');
 if(!main||!top||!nav)return;
 let mode='reader';
 const creatorScreens=new Set(['workspace','studio','books','register','editor','publishing','publish','paper','global','revenue']);
 const hub=document.createElement('section');hub.id='workspace';hub.className='screen';
 hub.innerHTML='<div class="section workspace-shell"><div class="workspace-heading"><small>CREATOR WORKSPACE</small><h2>나의 작업실</h2><p>오늘의 문장을 작품으로.</p></div><button type="button" class="workspace-primary" data-workspace-go="register"><span>＋</span><div><b>새 책 쓰기</b><small>이야기의 첫 페이지를 펼치세요</small></div></button><div class="workspace-grid"><button type="button" data-workspace-go="books"><b>책 관리</b><small>작성 중 · 공개 · 완결</small></button><button type="button" data-workspace-go="studio"><b>대시보드</b><small>작품과 독자 반응</small></button><button type="button" data-workspace-go="publishing"><b>출판 센터</b><small>전자책 · 종이책 · 번역</small></button><button type="button" data-workspace-go="revenue"><b>수익·정산</b><small>판매와 정산 내역</small></button></div><button type="button" class="workspace-profile"><b>내 크리에이터 홈</b><small>소개 · 작업노트 · 팔로우 · 후원</small></button></div>';
 main.append(hub);
 const memo=document.querySelector('#home [aria-label="간단 메모"]');if(memo)hub.firstElementChild.append(memo);
 document.querySelector('#home .books-home-policy')?.remove();
 const small=top.querySelector('.logo small');if(small)small.textContent='READ YOUR NEXT STORY';
 const switcher=document.createElement('div');switcher.className='workspace-switch';switcher.setAttribute('role','group');switcher.setAttribute('aria-label','공간 선택');switcher.innerHTML='<button type="button" data-space="reader" aria-pressed="true">독자</button><button type="button" data-space="creator" aria-pressed="false">크리에이터</button>';
 top.after(switcher);
 function navigate(id){if(saveBeforeMobileNavigation()===false)return;if(id==='register')return openNewBookRegistration();go(id);}
 hub.querySelectorAll('[data-workspace-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.workspaceGo));
 hub.querySelector('.workspace-profile').onclick=()=>document.querySelector('[data-open-my-creator]')?.click();
 const consumer=[['home','홈'],['discover','검색'],['workspace','크리에이터'],['library','서재'],['my','MY']];
 const creator=[['workspace','작업실'],['books','책 관리'],['register','쓰기'],['publishing','출판'],['my','MY']];
 function setMode(next){if(mode!==next){mode=next;renderNav();}document.body.classList.toggle('creator-workspace',mode==='creator');switcher.querySelectorAll('[data-space]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.space===mode)));if(small)small.textContent=mode==='creator'?'CREATOR WORKSPACE':'READ YOUR NEXT STORY';}
 function renderNav(){const rows=mode==='creator'?creator:consumer;[...nav.children].forEach((b,i)=>{b.dataset.go=rows[i][0];b.setAttribute('aria-label',rows[i][1]);b.querySelector('span').textContent=rows[i][1];b.removeAttribute('data-register-mode');b.onclick=()=>{if(rows[i][0]==='workspace'){if(saveBeforeMobileNavigation()===false)return;setMode('creator');go('workspace');}else navigate(rows[i][0]);};});}
 function sync(){const id=document.querySelector('.screen.active')?.id;if(creatorScreens.has(id))setMode('creator');else if(['home','discover','reader','library','creators'].includes(id))setMode('reader');nav.querySelectorAll('button').forEach(b=>{const on=b.dataset.go===id||(b.dataset.go==='publishing'&&['publish','paper','global'].includes(id));b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});document.querySelector('.studio-section-nav')?.setAttribute('data-space',mode);}
 switcher.querySelectorAll('[data-space]').forEach(b=>b.onclick=()=>{if(saveBeforeMobileNavigation()===false)return;setMode(b.dataset.space);go(mode==='creator'?'workspace':'home');});
 document.querySelectorAll('#my [data-music-go],#my [data-open-my-creator]').forEach(b=>b.classList.add('workspace-only'));
 const myEntry=document.createElement('button');myEntry.type='button';myEntry.className='music-menu reader-only';myEntry.textContent='크리에이터로 전환';myEntry.onclick=()=>{setMode('creator');go('workspace');};document.querySelector('#my .section').append(myEntry);
 const myLibrary=document.createElement('button');myLibrary.type='button';myLibrary.className='music-menu reader-only';myLibrary.textContent='나의 서재';myLibrary.onclick=()=>go('library');myEntry.before(myLibrary);
 renderNav();document.querySelectorAll('.screen').forEach(el=>new MutationObserver(sync).observe(el,{attributes:true,attributeFilter:['class']}));sync();
})();
