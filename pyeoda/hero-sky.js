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
 const sky=document.createElement('div');sky.className='pyeoda-sky';sky.setAttribute('aria-hidden','true');
 const outline='M19 53C8 53 5 44 10 37C14 31 20 30 27 31C27 20 36 12 47 14C53 3 72 2 80 14C93 11 107 20 107 32C119 30 130 37 130 45C130 53 122 57 113 56L23 56Z';
 const clouds=[{x:'20%',y:'24%',size:'150px',duration:'18s',delay:'-4s'},{x:'38%',y:'10%',size:'122px',duration:'23s',delay:'-13s'},{x:'50%',y:'27%',size:'166px',duration:'27s',delay:'-20s'}];
 clouds.forEach((c,i)=>{
  const cloud=document.createElement('span');cloud.className='sky-cloud';for(const [key,value] of Object.entries(c))cloud.style.setProperty('--'+key,value);
  cloud.innerHTML=`<svg viewBox="0 0 140 65" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pyeoda-cloud-${i}" x2="0" y2="1"><stop stop-color="#fffdf6"/><stop offset="1" stop-color="#eeeade"/></linearGradient></defs><path d="${outline}" fill="url(#pyeoda-cloud-${i})" stroke="#9e9e90" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><path d="${outline}" fill="none" stroke="#b2afa3" stroke-width=".6" stroke-dasharray="10 3 4 2" transform="translate(.8 -1)"/><path d="M22 50q35 6 85 0M36 48q22 4 35 2M51 15q10-5 20-1" fill="none" stroke="#bbb8aa" stroke-width=".8" opacity=".55" stroke-linecap="round"/></svg>`;
  sky.append(cloud);
 });
 const stars=[['7%','19%','8px','4.2s','-1s'],['17%','10%','11px','3.8s','-2.4s'],['24%','5%','14px','5.1s','-3s'],['32%','17%','9px','4.7s','-.8s'],['44%','5%','12px','4.4s','-2s'],['56%','13%','9px','5.6s','-4s']];
 stars.forEach(([x,y,size,duration,delay])=>{
  const star=document.createElement('span');star.className='sky-star';Object.entries({x,y,size,duration,delay}).forEach(([key,value])=>star.style.setProperty('--'+key,value));
  star.innerHTML='<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.8 14.6 9.1 22 12 14.6 14.5 12 22 9.3 14.5 2 12 9.3 9.1Z" fill="currentColor" stroke="#8e9592" stroke-width=".6" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.4" fill="#fff5ce"/></svg>';
  sky.append(star);
 });
 hero.append(sky);
 // Hidden screens need not keep drawing animations.
 function sync(){sky.style.display=hero.closest('.screen')?.classList.contains('active')?'':'none';}
 new MutationObserver(sync).observe(hero.closest('.screen'),{attributes:true,attributeFilter:['class']});sync();
})();
