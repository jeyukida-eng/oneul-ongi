/* 오늘의 온기 v7 — 성취 축하 · 누적 온기 · SNS 공유 카드
   기존 감정/미션/일기 저장 형식은 수정하지 않습니다. */
(() => {
  'use strict';
  const STORAGE = 'oneul-ongi-mvp-v1';
  const HOST_ID = 'achievement-host';
  const DATE = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const QUOTES = ['오늘도 나를 잘 돌봤어요', '작은 걸음도 충분히 소중해요', '나를 돌본 오늘을 기억해요'];
  const GOODS_CARD_LINES = [
    ['오늘도 나를','놓치지 않았어요'],
    ['천천히 가도','괜찮아요'],
    ['쉬어가는 날도','나를 만드는 중이에요'],
    ['작은 걸음이','나를 바꿔요'],
    ['오늘도 여기까지','잘 왔어요'],
    ['잘하지 않아도','계속 가고 있어요'],
    ['오늘의 나를','조금 칭찬해요'],
    ['내 속도대로','가도 괜찮아요'],
    ['마음을 돌보는 것도','성장입니다'],
    ['열흘의 온기가','차곡차곡 쌓였어요']
  ];
  const GOODS_CARD_PALETTES = [
    ['#FFF8EF','#C97758','#F2D7C5','#87977C'],
    ['#FFF9F1','#B97758','#F0D8C9','#91A084'],
    ['#F8F4EF','#9A715D','#E6D9CF','#83927A'],
    ['#FFF7EC','#C57C59','#F5DBC8','#879B80'],
    ['#FFFAF4','#B86D51','#F0DED1','#8A9B85'],
    ['#FFF7F0','#A86C55','#EED7C9','#7E947A'],
    ['#FFF9F3','#BD7658','#F0D8C6','#899C82'],
    ['#FDF8F2','#A66F58','#E9DACF','#86947D'],
    ['#FFF8F1','#B87556','#F1D8C8','#84967D'],
    ['#FFF5EA','#A96149','#EECDBA','#71866C']
  ];
  const moodIds = ['happy','okay','tired','anxious','mixed'];
  let shareFormat = 'feed';
  let sharePhrase = 0;
  let includeTasks = true;
  let activeSection = 'summary';
  let host, priorFocus, overlayOpen = false;
  let previewUrl = null, previewSerial = 0;
  const shareArtwork = new Image();
  const illustrationReady = new Promise(resolve=>{
    shareArtwork.onload=()=>resolve(true);
    shareArtwork.onerror=()=>resolve(false);
    shareArtwork.src=new URL('./share-illustration-v19.webp?v=19',document.baseURI).href;
    if(shareArtwork.complete&&shareArtwork.naturalWidth)resolve(true);
  });
  let lastCelebrationDate = null;
  function celebrateOnlyAfterThree(){
    const key=DATE(), r=read().records?.[key];
    if(!r?.smallDone||!moodIds.includes(r.mood)||!r.note?.trim()||lastCelebrationDate===key)return;
    lastCelebrationDate=key;open(true);
  }
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
  function goodsDay(){
    return Math.max(0,Math.min(100,stats().days));
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
    if (moodIds.includes(r.mood)) items.push('오늘의 마음 살펴보기');
    if (r.smallDone) items.push('작은 실천 완료');
    if (typeof r.note === 'string' && r.note.trim()) items.push('한 줄 기록 남기기');
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
    const share = `<div class="achievement-panel share ${activeSection==='share'?'active':''}"><div class="achievement-heading-row"><strong>오늘의 성취 공유 카드</strong><span>인스타그램 피드 · 스토리</span></div><div class="reward-formats" role="group" aria-label="이미지 크기">${markRadio(shareFormat,'story','스토리 · 9:16','format','data-format="story"')}${markRadio(shareFormat,'feed','피드 · 4:5','format','data-format="feed"')}</div><div class="reward-phrases" role="group" aria-label="공유 문구">${QUOTES.map((q,i)=>markRadio(sharePhrase,i,esc(q),'phrase',`data-index="${i}"`)).join('')}</div><label class="reward-include"><input id="include-share-tasks" type="checkbox" ${includeTasks?'checked':''}/> 오늘의 실천과 미션을 카드에 함께 담기</label><div class="share-preview" aria-label="저장될 이미지와 동일한 공유 카드 미리보기"><span class="share-preview-loading">미리보기 준비 중…</span></div><div class="reward-share-actions"><button type="button" class="reward-primary" data-reward-action="download">이미지 저장</button><button type="button" class="reward-secondary" data-reward-action="share">휴대전화 공유 ↗</button></div><p class="reward-helper">기기에 저장한 뒤 인스타그램 스토리나 피드에 올리면 돼요. 일기 본문은 자동으로 공유되지 않아요.</p></div>`;
    return `<div class="achievement-sheet ${activeSection==='share'?'is-sharing':''}" role="dialog" aria-modal="true" aria-labelledby="achievement-heading" tabindex="-1"><header class="achievement-head"><div><span class="achievement-eyebrow">MY ONGI</span><h2 id="achievement-heading">${celebration?'오늘도 잘했어요!':'오늘의 작은 성취'}</h2></div><button type="button" class="achievement-close" data-reward-action="close" aria-label="닫기">×</button></header><div class="achievement-body">${tabs}${summary}${share}</div></div>`;
  }
  function releasePreview() {
    ++previewSerial;
    if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}
  }
  async function renderPreview() {
    const box=host.querySelector('.achievement-panel.share.active .share-preview');
    if(!box)return;
    const generation=++previewSerial;
    try {
      await illustrationReady;
      if(document.fonts?.ready)await document.fonts.ready;
      if(generation!==previewSerial||!box.isConnected)return;
      const blob=await toPNG(drawCard());
      if(generation!==previewSerial||!box.isConnected)return;
      const url=URL.createObjectURL(blob),img=document.createElement('img');
      img.className='share-preview-image';
      img.alt=`오늘 모은 온기 ${stats().today}개, ${shareFormat==='story'?'스토리':'피드'} 공유 카드 전체 이미지`;
      img.onload=()=>{
        if(generation!==previewSerial||!box.isConnected){URL.revokeObjectURL(url);return;}
        if(previewUrl)URL.revokeObjectURL(previewUrl);
        previewUrl=url;
        box.replaceChildren(img);
      };
      img.onerror=()=>{URL.revokeObjectURL(url);if(box.isConnected)box.textContent='미리보기를 불러오지 못했어요.';};
      img.src=url;
    }catch(_){if(box.isConnected)box.textContent='미리보기를 만들지 못했어요.';}
  }
  function open(celebration=false) {
    ensureHost(); priorFocus=document.activeElement;
    releasePreview();
    if(celebration) activeSection='summary';
    host.innerHTML=sheetContent(celebration);
    document.body.classList.add('achievement-open');
    overlayOpen=true;
    renderPreview();
    host.querySelector('.achievement-close')?.focus();
  }
  function refresh(celebration=false) {
    if (!overlayOpen) return;
    releasePreview();
    host.innerHTML=sheetContent(celebration);
    renderPreview();
  }
  function close() {
    if (!overlayOpen) return;
    releasePreview();
    host.innerHTML=''; overlayOpen=false;
    document.body.classList.remove('achievement-open');
    priorFocus?.isConnected && priorFocus.focus();
  }
  function drawCard() {
    const s = stats();
    const day = Math.max(0,Math.min(100,s.days));
    const story = shareFormat === 'story';
    const W = 1080, H = story ? 1920 : 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const c = canvas.getContext('2d');
    const mid = W / 2;
    const korean = '"Apple SD Gothic Neo", "Noto Sans KR", "NanumSquare", sans-serif';
    const S = (weight, px) => `${weight} ${px}px ${korean}`;
    const safeRound = (x,y,w,h,r) => {
      c.beginPath();
      if(typeof c.roundRect==='function') c.roundRect(x,y,w,h,r);
      else {c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
    };
    const rrect = (x,y,w,h,r,fill,stroke) => {
      safeRound(x,y,w,h,r);
      if(fill){c.fillStyle=fill;c.fill();}
      if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}
    };
    const center = (str, y, font, fill, maxW=930) => {
      c.font=font;c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle=fill;c.fillText(str,mid,y,maxW);
    };

    // DAY 001~010: collectible emotional-goods card. DAY is always drawn by the app, never baked into artwork.
    if(day>=1 && day<=10){
      const [paper,accent,peach,sage]=GOODS_CARD_PALETTES[day-1];
      const ink='#493B35',quiet='#806F66';
      c.fillStyle='#F3EADF';c.fillRect(0,0,W,H);
      c.save();c.shadowColor='rgba(76,49,36,.12)';c.shadowBlur=38;c.shadowOffsetY=12;
      rrect(30,28,W-60,H-56,64,paper);c.restore();

      // small editorial decorations
      c.save();safeRound(30,28,W-60,H-56,64);c.clip();
      c.fillStyle=peach;c.globalAlpha=.42;
      c.beginPath();c.ellipse(-15,story?510:395,180,120,0,0,Math.PI*2);c.fill();
      c.beginPath();c.ellipse(1090,story?780:610,170,130,0,0,Math.PI*2);c.fill();
      c.fillStyle='#EDF1E8';c.beginPath();c.ellipse(1040,H-120,165,105,0,0,Math.PI*2);c.fill();
      c.globalAlpha=1;

      // brand
      center('오늘의 온기',story?125:88,S(800,34),accent,360);
      center('FOR A WARMER YOU',story?160:122,S(600,16),quiet,300);

      // dynamic DAY badge — no fixed D-day inside the card source.
      rrect(W-292,story?88:68,210,66,33,'rgba(255,255,255,.58)',accent);
      c.font=S(700,28);c.textAlign='center';c.fillStyle=accent;c.fillText(`DAY ${String(day).padStart(3,'0')}`,W-187,story?131:111);

      const words=GOODS_CARD_LINES[day-1]||GOODS_CARD_LINES[0];
      center(words[0],story?335:245,S(800,72),accent,870);
      center(words[1],story?422:330,S(800,72),accent,900);

      // artwork panel
      const artX=68,artY=story?535:405,artW=944,artH=story?650:585;
      c.save();safeRound(artX,artY,artW,artH,54);c.clip();
      if(shareArtwork.complete&&shareArtwork.naturalWidth>0){
        const iw=shareArtwork.naturalWidth, ih=shareArtwork.naturalHeight;
        const scale=Math.max(artW/iw,artH/ih),dw=iw*scale,dh=ih*scale;
        c.drawImage(shareArtwork,artX+(artW-dw)/2,artY+(artH-dh)/2,dw,dh);
      }else{
        c.fillStyle=peach;c.fillRect(artX,artY,artW,artH);
        center('♡',artY+artH/2,S(800,110),accent);
      }
      c.restore();

      const base=read().records?.[DATE()]||{};
      const list=[];
      if(moodIds.includes(base.mood))list.push('오늘의 마음 살펴보기');
      if(base.smallDone)list.push('작은 실천 완료');
      if(typeof base.note==='string'&&base.note.trim())list.push('한 줄 기록 남기기');
      if(includeTasks&&s.growth.length)list.push(`성장 미션 ${s.growth.length}개 완료`);

      const boxY=story?1245:1030;
      c.save();c.shadowColor='rgba(70,48,39,.07)';c.shadowBlur=20;c.shadowOffsetY=6;
      rrect(126,boxY,828,story?245:190,38,'rgba(255,255,255,.88)');c.restore();
      const rows=(list.length?list:['오늘의 온기를 하나씩 모아가요']).slice(0,3);
      rows.forEach((item,i)=>{
        const yy=boxY+58+i*(story?61:48);
        rrect(172,yy-31,84,40,20,'#FFF0E7');
        c.font=S(800,25);c.fillStyle=accent;c.textAlign='center';c.fillText(list.length?'+1':'♡',214,yy-3);
        c.font=S(600,story?30:27);c.fillStyle=quiet;c.textAlign='left';c.fillText(item,285,yy,600);
      });

      center(day===10?'열흘 동안 쌓인 작은 온기를 기억해요':'작은 걸음도 나를 만드는 중',story?1620:1265,S(600,29),quiet);
      center('#오늘의온기   #100일의온기',story?1670:1310,S(700,23),accent);
      center('ONEUL ONGI',story?1815:1332,S(800,20),sage);
      c.restore();
      return canvas;
    }

    // DAY 0 and DAY 11+: existing warm share card remains as a safe fallback.
    const ink = '#463B36', terracotta = '#C9795D', warm = '#B86F50', quiet = '#7E716A', sage = '#8E9B83';
    const paper = '#FFF9F2', cream = '#FFFDF8', peach = '#F4D8C7', blush = '#F8E9E0';
    c.fillStyle=paper;c.fillRect(0,0,W,H);
    c.save();c.shadowColor='rgba(91,61,48,.10)';c.shadowBlur=46;c.shadowOffsetY=12;
    rrect(34,32,W-68,H-64,66,cream);c.restore();
    c.save();safeRound(34,32,W-68,H-64,66);c.clip();
    c.fillStyle='#FCECE2';
    [[-10,story?540:410,200,120],[1050,story?850:640,175,145],[-30,H-120,220,145]].forEach(([x,y,rx,ry])=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,2*Math.PI);c.fill();});
    c.fillStyle='#EEF1E8';c.beginPath();c.ellipse(1030,story?1510:1115,170,115,0,0,2*Math.PI);c.fill();

    const badgeY=story?108:72;
    rrect(mid-138,badgeY,276,70,35,'#F8E4D8');
    center('오늘의 온기',badgeY+48,S(800,34),terracotta,240);
    const d=new Date();
    center(`${d.getMonth()+1}월 ${d.getDate()}일 (${'일월화수목금토'[d.getDay()]})`,story?247:205,S(600,29),quiet);

    // On an active journey after day 10, show the dynamic progress day quietly.
    if(day>10){
      rrect(W-264,story?103:74,188,58,29,'#FFF6EF','#E6C4B4');
      c.font=S(700,24);c.textAlign='center';c.fillStyle=terracotta;c.fillText(`DAY ${String(day).padStart(3,'0')}`,W-170,story?141:112);
    }

    const headlines=[['오늘도 나를','잘 돌봤어요'],['작은 걸음도','충분히 소중해요'],['나를 돌본 오늘을','기억해요']];
    const chosen=headlines[sharePhrase]||headlines[0];
    center(day===0?'첫 온기를 기다리고 있어요':'오늘의 작은 성취',story?330:278,S(700,24),sage);
    const headlineY=story?420:355,headingSize=story?82:76;
    center(chosen[0],headlineY,S(800,headingSize),ink);
    center(chosen[1],headlineY+89,S(800,headingSize),ink);

    const bubbleY=story?635:495;
    c.fillStyle=peach;c.beginPath();c.ellipse(mid,bubbleY+99,256,112,0,0,2*Math.PI);c.fill();
    center(String(s.today),bubbleY+128,S(800,s.today>99?118:148),warm,260);
    center('오늘 모은 온기',bubbleY+182,S(700,29),ink,340);

    const base=read().records?.[DATE()]||{},label=[];
    if(moodIds.includes(base.mood))label.push('오늘의 기분 선택');
    if(base.smallDone)label.push('작은 실천 완료');
    if(typeof base.note==='string'&&base.note.trim())label.push('한 줄 기록 남기기');
    if(includeTasks&&s.growth.length)label.push(`성장 미션 ${s.growth.length}개 완료`);
    const sublines=[];c.font=S(600,story?35:31);
    if(!label.length)sublines.push(day===0?'첫 기록을 남기면 DAY 001이 시작돼요':'지금부터 시작해도 충분해요');
    for(const phrase of label){const i=sublines.length-1,joined=i>=0?sublines[i]+' · '+phrase:phrase;if(i>=0&&c.measureText(joined).width<=860)sublines[i]=joined;else sublines.push(phrase);}
    const y=story?910:720;sublines.slice(0,2).forEach((line,i)=>center(line,y+42*i,S(600,story?35:31),quiet));

    const artY=story?1015:785,artH=story?250:192;
    if(shareArtwork.complete&&shareArtwork.naturalWidth>0)c.drawImage(shareArtwork,74,artY,932,artH);
    else{c.fillStyle=blush;c.beginPath();c.ellipse(mid,artY+138,318,88,0,0,2*Math.PI);c.fill();center('♡',artY+151,S(800,96),terracotta);}

    const list=previewData(s),listY=story?1350:985,rowH=story?65:53,listH=list.length?Math.max(184,49+list.length*rowH):154;
    c.save();c.shadowColor='rgba(83,56,43,.07)';c.shadowBlur=20;c.shadowOffsetY=5;rrect(160,listY,760,listH,42,'#FFFFFF');c.restore();
    if(list.length){
      c.textAlign='left';c.textBaseline='alphabetic';
      list.forEach((item,i)=>{const yy=listY+53+i*rowH;rrect(207,yy-33,89,44,22,'#FFF0E7');c.fillStyle=terracotta;c.textAlign='center';c.font=S(800,28);c.fillText('+1',252,yy-2);c.fillStyle='#6F655F';c.textAlign='left';c.font=S(600,story?31:30);c.fillText(String(item).slice(0,28),324,yy,525);});
    }else center('아직 오늘의 기록이 없어요',listY+91,S(600,32),quiet,650);

    const mottoY=story?1770:1240;
    center('작은 하루가 쌓여 나를 만듭니다',mottoY,S(600,29),quiet);
    center('#오늘의온기   #작은성취',mottoY+50,S(700,24),terracotta);
    center('ONEUL ONGI',story?1860:1315,S(800,24),sage);
    c.restore();
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
      await illustrationReady;
      if(document.fonts?.ready) await document.fonts.ready;
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
    if(mainAction==='done'||mainAction==='save-note'){
      setTimeout(celebrateOnlyAfterThree,0);
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
