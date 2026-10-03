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
  .mobile-build #home .hero>div:first-child{padding:0!important;background:none!important;border-radius:0!important;text-align:center!important}
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
