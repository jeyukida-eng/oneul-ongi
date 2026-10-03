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
  .mobile-build #home #bookGrid{display:flex!important;overflow-x:auto!important;scroll-snap-type:x mandatory;gap:12px!important;padding:0 0 8px!important;scrollbar-width:thin;scrollbar-color:#aeb69b transparent}
  .mobile-build #home #bookGrid>.book-card{flex:0 0 calc(100% - 22px);scroll-snap-align:start;grid-template-columns:78px minmax(0,1fr)!important}
  .mobile-build #home #bookGrid .cover{height:120px!important}
  .mobile-build .home-swipe-hint{font-size:11px;color:#777d6c;margin:0 0 8px;text-align:right}
  .mobile-build #home .pyeoda-sky{height:108px;bottom:auto}
  .mobile-build .pyeoda-sky .sky-cloud{top:var(--my);left:var(--mx);width:calc(var(--size)*.68);opacity:.95;animation-name:mobile-sky-drift;animation-duration:calc(var(--duration)*.65)}
  .mobile-build .pyeoda-sky .sky-star{top:var(--my);left:var(--mx);width:calc(var(--size)*1.2);height:calc(var(--size)*1.2);color:#657060}
  @keyframes mobile-sky-drift{0%,100%{transform:translate3d(-12px,4px,0) rotate(-2deg)}50%{transform:translate3d(18px,-7px,0) rotate(2deg)}}
  @media(prefers-reduced-motion:reduce){.mobile-build .pyeoda-sky .sky-cloud{animation:none}}
  `;
  document.head.append(mobileStyle);
  const copy=hero.querySelector('.hero-copy');
  const details=document.createElement('details');details.className='mobile-home-details';
  const summary=document.createElement('summary');summary.textContent='시작 비용 0원 · 4개 언어 출판 안내';
  const fullCopy=document.createElement('p');fullCopy.textContent=copy.innerText||copy.textContent;
  details.append(summary,fullCopy);copy.textContent='쓰고, 연재하고, 나만의 책으로 만드세요.';
  hero.querySelector('.cta').after(details);
  const hint=document.createElement('p');hint.className='home-swipe-hint';hint.textContent='옆으로 넘겨 작품을 만나보세요 →';
  document.getElementById('bookGrid').before(hint);
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
 design.append(prompt);step(design,'표지 스타일과 장면');
 const title=document.createElement('p');title.className='mobile-cover-title';cover.prepend(title);
 const guide=cover.querySelector('.cover-guide');guide.remove();
 const billing=tools.querySelector(':scope > .cover-prompt-help');billing.classList.add('mobile-cover-help');billing.textContent='직접 올리기 무료 · 책마다 첫 AI 생성 1회 무료. 두 번째부터 비용이 발생합니다.';
 prompt.querySelector('.cover-prompt-help').textContent='장소 · 분위기 · 핵심 사물을 적어 주세요. 제목과 필명은 앞에서 입력한 내용으로 표지에 들어갑니다.';
 step(cover,'표지 완성');
 for(const old of [...form.querySelectorAll(':scope > .form-section')])old.remove();
 document.querySelector('#introCount').previousElementSibling.textContent='최대 1,000자';document.querySelector('#authorNoteCount').previousElementSibling.textContent='최대 500자';document.getElementById('newTags').nextElementSibling.textContent='핵심 태그 3~5개 · 선택';
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
 document.getElementById('generateCoverBtn').addEventListener('click',e=>{if(!required()||!ratingOK()){e.preventDefault();e.stopImmediatePropagation();return;}if(!document.getElementById('newCoverPrompt').value.trim()){show(steps.length-2);error.textContent='AI 표지에 넣을 장면을 입력해 주세요.';error.hidden=false;e.preventDefault();e.stopImmediatePropagation();}},true);
 document.getElementById('startWriting').addEventListener('click',e=>{if(!required()||!ratingOK()){e.preventDefault();e.stopImmediatePropagation();}},true);
 let active=screen.classList.contains('active');new MutationObserver(()=>{const now=screen.classList.contains('active');if(now&&!active)show(0);active=now;}).observe(screen,{attributes:true,attributeFilter:['class']});
 for(const b of document.querySelectorAll('[data-register-mode],#registeredNewBookBtn'))b.addEventListener('click',()=>show(0,false));
 show(0,false);
})();
