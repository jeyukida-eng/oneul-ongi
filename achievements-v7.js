/* 오늘의 온기 v7 — 성취 축하 · 누적 온기 · SNS 공유 카드
   기존 감정/미션/일기 저장 형식은 수정하지 않습니다. */
(() => {
  'use strict';
  const STORAGE = 'oneul-ongi-mvp-v1';
  const HOST_ID = 'achievement-host';
  const DATE = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const QUOTES = ['오늘도 잘했어요.', '오늘의 작은 한 걸음을 기억해요.', '나를 돌본 오늘이 소중해요.'];
  const moodIds = ['happy','okay','tired','anxious','mixed'];
  let shareFormat = 'story';
  let sharePhrase = 0;
  let includeTasks = true;
  let host, priorFocus, overlayOpen = false;
  const taskNames = () => {
    const result = {};
    for (const bank of Object.values(window.ONGI_CONTENT?.tasks || {})) {
      if (!Array.isArray(bank)) continue;
      for (const t of bank) if (t?.id && t?.title) result[t.id] = t.title;
    }
    return result;
  };
  const taskTitleMap = taskNames();
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch (_) { return {}; }
  }
  function itemsFor(state, date) {
    const row = state.records?.[date] || {};
    const tasks = Object.entries(state.growth?.[date] || {}).filter(([id,done]) => done === true && taskTitleMap[id]).map(([id]) => taskTitleMap[id]);
    const acts = [];
    if (moodIds.includes(row.mood)) acts.push('오늘의 마음 살펴보기');
    if (row.smallDone) acts.push('작은 실천 완료');
    if (typeof row.note === 'string' && row.note.trim()) acts.push('오늘의 기록 남기기');
    acts.push(...tasks);
    return acts;
  }
  function stats() {
    const state = read();
    const keys = new Set([...Object.keys(state.records || {}),...Object.keys(state.growth || {})]);
    const dated = Array.from(keys).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d) && itemsFor(state,d).length);
    let total = 0;
    for (const day of dated) total += itemsFor(state,day).length;
    const todayItems = itemsFor(state,DATE());
    const growth = Object.entries(state.growth?.[DATE()] || {}).filter(([id,done])=>done===true && taskTitleMap[id]).map(([id])=>taskTitleMap[id]);
    return {todayItems, growth, today:todayItems.length, days:dated.length, total};
  }
  const badges = ({days,total}) => [
    {name:'첫 번째 온기',needed:1,current:total,desc:'첫 성취를 남겼어요'},
    {name:'온기 10개',needed:10,current:total,desc:'열 개의 작은 성취'},
    {name:'함께한 3일',needed:3,current:days,desc:'3일의 흔적'},
    {name:'함께한 7일',needed:7,current:days,desc:'7일의 기록'},
    {name:'온기 50개',needed:50,current:total,desc:'50개의 작은 성취'},
    {name:'함께한 30일',needed:30,current:days,desc:'30일의 온기'}
  ];
  function ribbon() {
    const main = document.getElementById('main-content');
    if (!main) return;
    const routine = main.querySelector('.routine');
    if (!routine || routine.querySelector('.reward-ribbon')) return;
    const {today} = stats();
    const div = document.createElement('div');
    div.className = 'reward-ribbon';
    div.innerHTML = `<span class="reward-ribbon-symbol" aria-hidden="true">✳</span><span>오늘 모은 온기 <strong>${today}개</strong></span><button type="button" data-reward-action="open">${today?'성취 카드 보기':'나의 성취 보기'} <span aria-hidden="true">↗</span></button>`;
    routine.appendChild(div);
  }
  function augmentGrowth() {
    const root = document.getElementById('sheet-root');
    const summary = root?.querySelector('.micro-summary');
    if (!summary || summary.querySelector('[data-reward-action]')) return;
    const {today} = stats();
    const control = document.createElement('button');
    control.type = 'button'; control.className = 'reward-growth-link';
    control.dataset.rewardAction = 'open';
    control.textContent = today ? '오늘도 잘했어요 · 성취 카드 보기 ↗' : '나의 성취 보기 ↗';
    summary.appendChild(control);
  }
  function inject() { ribbon(); augmentGrowth(); }
  function ensureHost() {
    if (!host) {
      host = document.getElementById(HOST_ID);
      if (!host) {
        host = document.createElement('div'); host.id = HOST_ID;
        host.className = 'achievement-root';
        document.body.appendChild(host);
      }
    }
    return host;
  }
  const two = n=>String(n).padStart(2,'0');
  function dateLabel() {
    const d = new Date(); return `${d.getFullYear()}.${two(d.getMonth()+1)}.${two(d.getDate())}`;
  }
  function previewData(s) {
    const items = [];
    if (includeTasks) {
      const st = read(),r = st.records?.[DATE()] || {};
      if (r.smallDone) items.push('작은 실천 한 가지');
      items.push(...s.growth.slice(0,3));
    }
    return items.slice(0,3);
  }
  function preview(s) {
    const list = previewData(s);
    return `<div class="share-design share-design-${shareFormat}">
        <div class="share-logo"><span class="share-logo-glyph" aria-hidden="true">◒</span> 오늘의 온기</div>
        <div class="share-art" aria-hidden="true"><span class="share-art-glow"></span><span class="share-art-horizon"></span></div>
        <div class="share-design-middle"><div class="share-day">${dateLabel()} · 오늘의 성취</div>
        <div class="share-phrase">${esc(QUOTES[sharePhrase])}</div>
        <div class="share-number">${s.today}<span>개의 온기</span></div>
        ${list.length?`<div class="share-items">${list.map(v=>`<div><span aria-hidden="true">✓</span>${esc(v)}</div>`).join('')}</div>`:''}
        </div><div class="share-design-footer">하루에 작은 온기 하나씩 <span>ONEUL ONGI</span></div>
      </div>`;
  }
  function badgeMarkup(s) {
    return badges(s).map(({name,needed,current,desc}) => `<div class="achievement-badge ${current>=needed?'earned':'pending'}"><span class="badge-symbol" aria-hidden="true">${current>=needed?'✳':'·'}</span><strong>${esc(name)}</strong><small>${current>=needed?esc(desc):`${Math.min(current,needed)}/${needed}`}</small></div>`).join('');
  }
  function sevenDayCalendar() {
    const state=read(),week=Array.from({length:7},(_,i)=>{
      const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-6+i);
      const count=itemsFor(state,DATE(d)).length;
      return `<div class="reward-weekday"><small>${'일월화수목금토'[d.getDay()]}</small><span class="${count?'active':''}" aria-label="${d.getMonth()+1}월 ${d.getDate()}일, 온기 ${count}개">${count?'✳':'·'}</span><small>${d.getDate()}</small></div>`;
    });
    return `<div class="reward-week"><div class="reward-week-title">최근 7일의 온기 <span>쉬어 간 날도 그대로 남아요</span></div><div class="reward-week-grid">${week.join('')}</div></div>`;
  }
  function markRadio(selected, value, label, action, extra='') {
    return `<button class="reward-chip ${selected===value?'selected':''}" type="button" data-reward-action="${action}" ${extra} aria-pressed="${selected===value}">${label}</button>`;
  }
  function sheetContent(celebration=false) {
    const s = stats();
    return `<div class="achievement-sheet" role="dialog" aria-modal="true" aria-labelledby="achievement-heading" tabindex="-1">
      <header class="achievement-head"><div><span class="achievement-eyebrow">나의 온기</span><h2 id="achievement-heading">${celebration?'오늘도 잘했어요!':'오늘의 작은 성취'}</h2></div><button type="button" class="achievement-close" data-reward-action="close" aria-label="닫기">×</button></header>
      <div class="achievement-body">
        <p class="achievement-intro">${s.today?'아주 작은 한 걸음도 오늘의 성취예요.':'하나씩 나를 돌보다 보면 온기가 쌓일 거예요.'}</p>
        <div class="achievement-stats"><div><strong>${s.today}</strong><span>오늘의 온기</span></div><div><strong>${s.days}</strong><span>함께한 날</span></div><div><strong>${s.total}</strong><span>모은 온기</span></div></div>
        ${sevenDayCalendar()}
        <div class="achievement-heading-row"><strong>인스타그램 공유 카드</strong><span>내 기록 내용은 공유되지 않아요</span></div>
        <div class="reward-formats" role="group" aria-label="이미지 크기">${markRadio(shareFormat,'story','스토리 · 9:16','format','data-format="story"')}${markRadio(shareFormat,'feed','피드 · 4:5','format','data-format="feed"')}</div>
        <div class="reward-phrases" role="group" aria-label="공유 문구">${QUOTES.map((q,i)=>markRadio(sharePhrase,i,esc(q),'phrase',`data-index="${i}"`)).join('')}</div>
        <label class="reward-include"><input id="include-share-tasks" type="checkbox" ${includeTasks?'checked':''}/> 완료한 실천·미션도 카드에 표시</label>
        <div class="share-preview" aria-label="공유 이미지 미리보기">${preview(s)}</div>
        <div class="reward-share-actions"><button type="button" class="reward-primary" data-reward-action="download">이미지 저장</button><button type="button" class="reward-secondary" data-reward-action="share">휴대전화 공유 ↗</button></div>
        <p class="reward-helper">스토리 또는 피드에 올릴 수 있는 PNG 이미지로 만들어요. 휴대전화 공유 메뉴에 인스타그램이 표시되는지는 기기에 따라 달라집니다.</p>
        <h3 class="achievement-subtitle">쌓여 가는 나의 온기</h3><div class="achievement-badges">${badgeMarkup(s)}</div>
        <p class="reward-helper">하루 쉬어도 지금까지 쌓인 성취는 없어지지 않아요. 기록은 이 기기에만 저장됩니다.</p>
      </div>
    </div>`;
  }
  function open(celebration=false) {
    ensureHost(); priorFocus=document.activeElement;
    host.innerHTML=sheetContent(celebration);
    document.body.classList.add('achievement-open');
    overlayOpen=true;
    host.querySelector('.achievement-close')?.focus();
  }
  function refresh(celebration=false) {
    if (!overlayOpen) return;
    const pos=host.querySelector('.achievement-body')?.scrollTop||0;
    host.innerHTML=sheetContent(celebration);
    host.querySelector('.achievement-body').scrollTop=pos;
  }
  function close() {
    if (!overlayOpen) return;
    host.innerHTML=''; overlayOpen=false;
    document.body.classList.remove('achievement-open');
    priorFocus?.isConnected && priorFocus.focus();
  }
  function drawCard() {
    const s = stats(),story=shareFormat==='story',W=1080,H=story?1920:1350;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H;
    const c=canvas.getContext('2d');
    c.fillStyle='#F8F2E8'; c.fillRect(0,0,W,H);
    const glow=c.createRadialGradient(790,180,20,790,180,530);glow.addColorStop(0,'#FFEBD3');glow.addColorStop(1,'rgba(255,235,211,0)');c.fillStyle=glow;c.fillRect(0,0,W,630);
    c.fillStyle='#445F4B';c.font='700 35px sans-serif';c.fillText('◒   오늘의 온기',82,125);
    c.strokeStyle='#DBD9C9';c.lineWidth=2;c.beginPath();c.moveTo(82,164);c.lineTo(W-82,164);c.stroke();
    const centerX=W/2, sunY=story?500:352;
    const warm=c.createLinearGradient(centerX,sunY-175,centerX,sunY+170);warm.addColorStop(0,'#F5A978');warm.addColorStop(1,'#F8D4AA');
    c.fillStyle=warm;c.beginPath();c.arc(centerX,sunY,190,Math.PI,0,false);c.closePath();c.fill();
    c.strokeStyle='#8FA78F';c.lineWidth=7;c.beginPath();c.moveTo(255,sunY);c.quadraticCurveTo(centerX,sunY+170,825,sunY);c.stroke();
    const base=story?860:665;
    c.fillStyle='#7E8F78';c.textAlign='center';c.font='500 32px sans-serif';c.fillText(`${dateLabel()}  ·  오늘의 성취`,centerX,base);
    c.fillStyle='#324637';let phraseSize=76;c.font=`700 ${phraseSize}px sans-serif`;while(c.measureText(QUOTES[sharePhrase]).width>W-125&&phraseSize>48){phraseSize-=2;c.font=`700 ${phraseSize}px sans-serif`;}c.fillText(QUOTES[sharePhrase],centerX,base+110);
    c.fillStyle='#B47447';c.font='700 160px sans-serif';c.fillText(String(s.today),centerX,base+307);
    c.fillStyle='#697A66';c.font='500 42px sans-serif';c.fillText('개의 온기',centerX,base+365);
    const list=previewData(s);
    c.textAlign='left';c.font='500 36px sans-serif';c.fillStyle='#506550';
    const listY=base+458;
    for(const [i,line] of list.entries()) {c.fillText(`✓   ${line.length>20?line.slice(0,19)+'…':line}`,145,listY+i*78);}
    c.strokeStyle='#DDD7C8';c.beginPath();c.moveTo(85,H-145);c.lineTo(W-85,H-145);c.stroke();
    c.fillStyle='#708372';c.font='400 30px sans-serif';c.textAlign='left';c.fillText('하루에 작은 온기 하나씩',85,H-93);
    c.textAlign='right';c.font='600 27px sans-serif';c.fillText('ONEUL ONGI',W-85,H-93);
    return canvas;
  }
  const toPNG=canvas=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG 생성 실패')),'image/png'));
  function download(blob) {
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;
    a.download=`oneul-ongi-${DATE()}-${shareFormat}.png`;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),15000);
  }
  function feedback(text) {
    let box=document.getElementById('achievement-feedback');
    if(!box){box=document.createElement('div');box.id='achievement-feedback';box.className='achievement-feedback';ensureHost().appendChild(box)}
    box.textContent=text;setTimeout(()=>{if(box.isConnected)box.remove()},4500);
  }
  async function exportCard(native=false) {
    const btn=host.querySelector(native?'[data-reward-action="share"]':'[data-reward-action="download"]');if(btn)btn.disabled=true;
    try {
      const blob=await toPNG(drawCard());
      if(native && navigator.share && typeof File==='function') {
        const file=new File([blob],`oneul-ongi-${DATE()}.png`,{type:'image/png'});
        if(!navigator.canShare || navigator.canShare({files:[file]})) {
          try {await navigator.share({files:[file],title:'오늘의 온기'});feedback('공유 화면을 열었어요.');return;}
          catch(e){if(e?.name==='AbortError')return;}
        }
      }
      download(blob);feedback(native?'공유가 지원되지 않아 이미지로 저장했어요.':'공유 이미지를 저장했어요.');
    }catch(_){feedback('이미지를 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.');}
    finally{if(btn?.isConnected)btn.disabled=false;}
  }
  document.addEventListener('click', e=>{
    const action=e.target.closest('[data-reward-action]');
    if(action){
      const type=action.dataset.rewardAction;
      if(type==='open'){open();return;}
      if(type==='close'){close();return;}
      if(type==='format'){shareFormat=action.dataset.format==='feed'?'feed':'story';refresh();return;}
      if(type==='phrase'){sharePhrase=Number(action.dataset.index)||0;refresh();return;}
      if(type==='download'){exportCard(false);return;}
      if(type==='share'){exportCard(true);return;}
    }
    // These actions were already handled by v6. Read updated state after its handler.
    const mainAction=e.target.closest('[data-action]')?.dataset.action;
    if(mainAction==='done'){
      setTimeout(()=>{if(read().records?.[DATE()]?.smallDone)open(true);},0);
    }else if(mainAction==='toggle-task'){
      const id=e.target.closest('[data-action]')?.dataset.task;
      setTimeout(()=>{
        if(read().growth?.[DATE()]?.[id] && stats().today>0) {
          const summary=document.querySelector('.micro-summary');
          if(summary)summary.firstChild.textContent=`오늘도 잘했어요! 오늘 모은 온기 ${stats().today}개 `;
        }
      },0);
    }
  });
  document.addEventListener('change',e=>{if(e.target.id==='include-share-tasks'){includeTasks=e.target.checked;refresh();}});
  document.addEventListener('keydown',e=>{
    if(!overlayOpen)return;
    if(e.key==='Escape'){close();return;}
    if(e.key==='Tab'){
      const focusable=Array.from(host.querySelectorAll('button:not([disabled]), input:not([disabled])'));
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  document.addEventListener('click',e=>{if(overlayOpen && e.target===host)close();});
  const observer=new MutationObserver(()=>inject());
  observer.observe(document.getElementById('main-content'),{childList:true});
  observer.observe(document.getElementById('sheet-root'),{childList:true});
  inject();
  window.__ongiAchievements={stats,itemsFor,drawCard,open,close}; // read-only diagnostics for app tests
})();
