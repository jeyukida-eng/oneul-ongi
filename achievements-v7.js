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
  let activeSection = 'summary';
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
  function ribbon() { return; }
  function augmentGrowth() { return; }
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
    const st = read(),r = st.records?.[DATE()] || {};
    const items = [];
    if (moodIds.includes(r.mood)) items.push('오늘 마음 기록');
    if (r.smallDone) items.push('작은 실천 완료');
    if (typeof r.note === 'string' && r.note.trim()) items.push('한 줄 기록 저장');
    if (includeTasks) items.push(...s.growth);
    return items.slice(0,4);
  }
  function preview(s) {
    const list = previewData(s);
    const chips = list.length ? `<div class="share-card-list">${list.map(v=>`<div><span aria-hidden="true">+1</span>${esc(v)}</div>`).join('')}</div>` : '';
    return `<div class="share-card share-card-${shareFormat}">
        <div class="share-card-top"><div class="share-card-brand">오늘의 온기</div><div class="share-card-date">${dateLabel()}</div></div>
        <div class="share-card-badge">SMALL STEPS, BIG WARMTH</div>
        <div class="share-card-hero"><div class="share-card-dot"></div><div class="share-card-copy">${esc(QUOTES[sharePhrase])}</div></div>
        <div class="share-card-count"><strong>${s.today}</strong><span>오늘 모은 온기</span></div>
        ${chips}
        <div class="share-card-foot"><span>ONEUL ONGI</span><span>share your tiny win</span></div>
      </div>`;
  }
  function badgeMarkup(s) {
    return badges(s).map(({name,needed,current,desc}) => `<div class="achievement-badge ${current>=needed?'earned':'pending'}"><span class="badge-symbol" aria-hidden="true">${current>=needed?'✦':'○'}</span><strong>${esc(name)}</strong><small>${current>=needed?esc(desc):`${Math.min(current,needed)}/${needed}`}</small></div>`).join('');
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
    const todayList = s.todayItems.slice(0,4).map(v=>`<div class="today-chip"><span>+1</span>${esc(v)}</div>`).join('') || '<div class="today-empty">아직 쌓인 온기가 없어요.</div>';
    const tabs = `<div class="achievement-tabs" role="tablist" aria-label="성취 카드 메뉴"><button type="button" class="achievement-tab ${activeSection==='summary'?'selected':''}" data-reward-action="tab" data-tab="summary" aria-pressed="${activeSection==='summary'}">온기 요약</button><button type="button" class="achievement-tab ${activeSection==='share'?'selected':''}" data-reward-action="tab" data-tab="share" aria-pressed="${activeSection==='share'}">공유 카드</button></div>`;
    const summary = `<div class="achievement-panel summary ${activeSection==='summary'?'active':''}"><p class="achievement-intro">${s.today?'아주 작은 한 걸음도 오늘의 성취예요.':'하나씩 나를 돌보다 보면 온기가 차곡차곡 쌓여요.'}</p><div class="achievement-stats"><div><strong>${s.today}</strong><span>오늘의 온기</span></div><div><strong>${s.days}</strong><span>함께한 날</span></div><div><strong>${s.total}</strong><span>모은 온기</span></div></div><div class="achievement-flow">기분 선택 +1 · 작은 실천 완료 +1 · 한 줄 기록 +1 · 미션 완료 1개마다 +1</div><div class="today-chip-grid">${todayList}</div>${sevenDayCalendar()}<h3 class="achievement-subtitle">쌓여 가는 MY ONGI</h3><div class="achievement-badges">${badgeMarkup(s)}</div><button type="button" class="reward-primary full" data-reward-action="tab" data-tab="share">예쁜 공유 카드 만들기</button></div>`;
    const share = `<div class="achievement-panel share ${activeSection==='share'?'active':''}"><div class="achievement-heading-row"><strong>오늘의 작은 성취 카드</strong><span>인스타 스토리·피드 저장</span></div><div class="reward-formats" role="group" aria-label="이미지 크기">${markRadio(shareFormat,'story','스토리 · 9:16','format','data-format="story"')}${markRadio(shareFormat,'feed','피드 · 4:5','format','data-format="feed"')}</div><div class="reward-phrases" role="group" aria-label="공유 문구">${QUOTES.map((q,i)=>markRadio(sharePhrase,i,esc(q),'phrase',`data-index="${i}"`)).join('')}</div><label class="reward-include"><input id="include-share-tasks" type="checkbox" ${includeTasks?'checked':''}/> 오늘의 실천과 미션을 카드에 함께 담기</label><div class="share-preview" aria-label="공유 이미지 미리보기">${preview(s)}</div><div class="reward-share-actions"><button type="button" class="reward-primary" data-reward-action="download">이미지 저장</button><button type="button" class="reward-secondary" data-reward-action="share">휴대전화 공유 ↗</button></div><p class="reward-helper">기기에 저장한 뒤 인스타그램 스토리나 피드에 올리면 돼요. 일기 본문은 자동으로 공유되지 않아요.</p></div>`;
    return `<div class="achievement-sheet" role="dialog" aria-modal="true" aria-labelledby="achievement-heading" tabindex="-1"><header class="achievement-head"><div><span class="achievement-eyebrow">MY ONGI</span><h2 id="achievement-heading">${celebration?'오늘도 잘했어요!':'오늘의 작은 성취'}</h2></div><button type="button" class="achievement-close" data-reward-action="close" aria-label="닫기">×</button></header><div class="achievement-body">${tabs}${summary}${share}</div></div>`;
  }
  function open(celebration=false) {
    ensureHost(); priorFocus=document.activeElement;
    if(celebration) activeSection='summary';
    host.innerHTML=sheetContent(celebration);
    document.body.classList.add('achievement-open');
    overlayOpen=true;
    host.querySelector('.achievement-close')?.focus();
  }
  function refresh(celebration=false) {
    if (!overlayOpen) return;
    host.innerHTML=sheetContent(celebration);
  }
  function close() {
    if (!overlayOpen) return;
    host.innerHTML=''; overlayOpen=false;
    document.body.classList.remove('achievement-open');
    priorFocus?.isConnected && priorFocus.focus();
  }
  function drawCard() {
    const s = stats(), story = shareFormat === 'story', W = 1080, H = story ? 1920 : 1350;
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const c = canvas.getContext('2d');
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#F7F8FC'); bg.addColorStop(1, '#EEEFF7');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);

    const panelX = 64, panelY = 64, panelW = W - 128, panelH = H - 128, r = 44;
    c.fillStyle = '#FFFFFF'; roundRect(c, panelX, panelY, panelW, panelH, r, true, false);
    c.strokeStyle = '#E7E9F2'; c.lineWidth = 2; roundRect(c, panelX, panelY, panelW, panelH, r, false, true);

    // top bar
    c.fillStyle = '#252A35'; c.font = '800 34px sans-serif'; c.textAlign = 'left'; c.fillText('오늘의 온기', panelX + 46, panelY + 62);
    c.fillStyle = '#8A91A2'; c.font = '500 26px sans-serif'; c.textAlign = 'right'; c.fillText(dateLabel(), panelX + panelW - 46, panelY + 62);

    // badge pill
    c.fillStyle = '#F1ECFF'; roundRect(c, panelX + 46, panelY + 92, 310, 50, 25, true, false);
    c.fillStyle = '#7D5BEE'; c.font = '700 22px sans-serif'; c.textAlign = 'center'; c.fillText('SMALL STEPS, BIG WARMTH', panelX + 201, panelY + 125);

    // illustration area
    const heroTop = panelY + 180;
    c.fillStyle = '#F6F2FF'; roundRect(c, panelX + 46, heroTop, panelW - 92, story ? 270 : 200, 36, true, false);
    const cx = W/2;
    c.fillStyle = '#D9CCFF'; c.beginPath(); c.arc(cx + 160, heroTop + 72, 34, 0, Math.PI*2); c.fill();
    c.fillStyle = '#8D67FF'; roundRect(c, cx - 290, heroTop + 130, 170, 78, 28, true, false);
    c.fillStyle = '#FFFFFF'; c.font = '700 34px sans-serif'; c.textAlign = 'center'; c.fillText('+1', cx - 205, heroTop + 180);
    c.fillStyle = '#242A36';
    c.beginPath(); c.arc(cx + 40, heroTop + 116, 52, 0, Math.PI*2); c.fill();
    c.fillStyle = '#FFDCCE'; c.beginPath(); c.arc(cx + 40, heroTop + 104, 44, 0, Math.PI*2); c.fill();
    c.fillStyle = '#5F648B'; roundRect(c, cx - 10, heroTop + 144, 102, 86, 30, true, false);
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(cx + 22, heroTop + 102, 4, 0, Math.PI*2); c.arc(cx + 56, heroTop + 102, 4, 0, Math.PI*2); c.fill();
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx + 26, heroTop + 126); c.quadraticCurveTo(cx + 40, heroTop + 136, cx + 54, heroTop + 126); c.stroke();
    c.fillStyle = '#EDE7FF'; roundRect(c, cx + 120, heroTop + 132, 118, 70, 26, true, false);
    c.fillStyle = '#7D5BEE'; c.font = '700 32px sans-serif'; c.fillText('완료', cx + 179, heroTop + 177);

    // phrase and count
    const phraseY = heroTop + (story ? 360 : 280);
    c.textAlign = 'center'; c.fillStyle = '#2A3140'; c.font = '800 72px sans-serif';
    let phrase = QUOTES[sharePhrase], size = 72; while(c.measureText(phrase).width > panelW - 150 && size > 48){ size -= 2; c.font = `800 ${size}px sans-serif`; }
    c.fillText(phrase, cx, phraseY);
    c.fillStyle = '#7D5BEE'; c.font = '900 182px sans-serif'; c.fillText(String(s.today), cx, phraseY + 205);
    c.fillStyle = '#7D8598'; c.font = '700 38px sans-serif'; c.fillText('오늘 모은 온기', cx, phraseY + 260);

    const list = previewData(s);
    if (list.length) {
      const listTop = phraseY + 328, listH = Math.min(list.length, 4) * 72 + 28;
      c.fillStyle = '#F7F8FC'; roundRect(c, panelX + 70, listTop, panelW - 140, listH, 30, true, false);
      c.textAlign = 'left'; c.font = '600 30px sans-serif';
      list.slice(0,4).forEach((line, i) => {
        const y = listTop + 50 + i * 72;
        c.fillStyle = '#8D67FF'; c.fillText('+1', panelX + 110, y);
        c.fillStyle = '#505869'; c.fillText(line.length > 26 ? line.slice(0, 25) + '…' : line, panelX + 185, y);
      });
    }

    c.strokeStyle = '#E9EBF3'; c.beginPath(); c.moveTo(panelX + 46, H - 150); c.lineTo(panelX + panelW - 46, H - 150); c.stroke();
    c.fillStyle = '#9097A7'; c.font = '600 26px sans-serif'; c.textAlign = 'left'; c.fillText('share your tiny win', panelX + 46, H - 108);
    c.textAlign = 'right'; c.font = '800 26px sans-serif'; c.fillText('ONEUL ONGI', panelX + panelW - 46, H - 108);
    return canvas;
  }
  function roundRect(c,x,y,w,h,r,fill,stroke){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();if(fill)c.fill();if(stroke)c.stroke();}
  function drawLeaf(c,x,y,dir){c.save();c.translate(x,y);c.rotate(dir);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(42,-34,78,0);c.quadraticCurveTo(42,34,0,0);c.closePath();c.fill();c.restore();}

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
      if(type==='tab'){activeSection=action.dataset.tab==='share'?'share':'summary';refresh();return;}
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
