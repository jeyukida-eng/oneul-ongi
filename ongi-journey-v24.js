/* 오늘의 온기 v24 — 100일 여정: yesterday, 3-minute action, garden, weekly letter, future letter.
   Preserves existing records; all data stays on this device. No AI or external API. */
(() => {
  'use strict';
  const MAIN_KEY = 'oneul-ongi-mvp-v1';
  const KEY = 'oneul-ongi-journey-v24';
  const MOODS = {
    tired:{title:'나에게 쉬는 3분 주기',why:'지친 날에는 작은 쉼부터 시작해도 좋아요.',steps:['편안한 자리에 앉아 어깨에 힘을 빼요.','물 한 모금 마시거나 잠시 멀리 바라봐요.','지금 필요한 휴식 한 가지를 생각해 봐요.']},
    anxious:{title:'생각을 한 줄 내려놓기',why:'복잡한 생각을 잠시 종이 위에 옮기면 지금 할 일을 살피기 쉬울 수 있어요.',steps:['지금 신경 쓰이는 생각 하나를 떠올려요.','그 생각을 한 문장으로 적어 봐요.','오늘 할 수 있는 작은 일 한 가지를 골라요.']},
    mixed:{title:'마음에 이름 붙여 보기',why:'여러 감정이 함께 있어도 하나하나 살펴보는 것으로 충분해요.',steps:['지금 느끼는 감정 두 가지를 떠올려요.','어느 마음이 더 큰지 조용히 살펴봐요.','판단하지 않고 잠깐 그대로 두어요.']},
    okay:{title:'평범한 순간 살피기',why:'편안한 순간을 발견하는 것도 나를 돌보는 일이에요.',steps:['잠깐 창가나 편안한 곳에 앉아요.','지금 편안한 것 하나를 찾아봐요.','그 느낌을 한 문장으로 기억해 봐요.']},
    happy:{title:'좋았던 순간 기억하기',why:'좋은 순간을 기록하면 나중에 다시 돌아볼 수 있어요.',steps:['오늘 기뻤던 순간을 떠올려요.','무엇이 좋았는지 한 줄로 적어요.','그 기억을 천천히 즐겨 봐요.']}
  };
  const PHASES = ['회복','안정','작은 실천','성장'];
  let root, activeTab = 'today', selectedMilestone = 0, currentFocus = null;
  let secondsLeft = 180, deadline = 0, timerId = null, notice = '';
  const today = (date = new Date()) => date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const validDate = v => /^\d{4}-\d{2}-\d{2}$/.test(v);
  function getStore(key) {try {return JSON.parse(localStorage.getItem(key) || '{}') || {}} catch (_) {return {}}}
  function data() {
    const value = getStore(KEY);
    return {
      futureLetter: typeof value.futureLetter === 'string' ? value.futureLetter : '',
      futureWritten: value.futureWritten || '',
      reflections: value.reflections && typeof value.reflections === 'object' ? value.reflections : {},
      guided: value.guided && typeof value.guided === 'object' ? value.guided : {}
    };
  }
  function put(value) {
    try {localStorage.setItem(KEY,JSON.stringify(value));return true}
    catch (_) {notice='저장할 수 없어요. 브라우저 저장 공간을 확인해 주세요.';return false}
  }
  function snapshot() {
    const app = getStore(MAIN_KEY), journal=data(), set=new Set();
    const rows=app.records && typeof app.records==='object'?app.records:{};
    const growth=app.growth && typeof app.growth==='object'?app.growth:{};
    Object.entries(rows).forEach(([key,row]) => {
      if(validDate(key) && row && (
        ['tired','anxious','mixed','okay','happy'].includes(row.mood) ||
        !!row.smallDone || (typeof row.note==='string' && !!row.note.trim())
      ))set.add(key);
    });
    Object.entries(growth).forEach(([key,days]) => {
      if(validDate(key) && days && Object.values(days).some(Boolean))set.add(key);
    });
    Object.keys(journal.guided).forEach(key => {if(validDate(key) && journal.guided[key]?.at)set.add(key)});
    const dates=Array.from(set).sort();
    const completed=Math.min(100,dates.length);
    const current=Math.min(100,completed+(set.has(today())?0:1));
    return {rows,growth,journal,dates,completed,current,
      phase:PHASES[Math.min(3,Math.floor((current-1)/25))]};
  }
  function yesterday() {
    const d=new Date(); d.setHours(12,0,0,0);d.setDate(d.getDate()-1);return today(d);
  }
  function getMission(s) {
    const mood = s.rows[today()]?.mood || s.rows[yesterday()]?.mood || 'okay';
    return MOODS[mood] || MOODS.okay;
  }
  function getYesterday(s) {
    const r=s.rows[yesterday()] || {};
    if(typeof r.note==='string' && r.note.trim()) {
      if(/자살|죽고\s*싶|목숨을\s*끊|스스로\s*해치/.test(r.note)) {
        return '어제의 마음을 기록해 두었어요. 오늘 안전이 걱정된다면 가까운 사람이나 전문기관에 도움을 요청해 주세요.';
      }
      return '“' + esc(r.note.trim().slice(0,92)) + (r.note.trim().length>92?'…':'') + '”';
    }
    if(r.mood) return '어제의 기분을 기록했어요. 오늘은 내 마음에 맞는 작은 행동을 해볼까요?';
    return '어제 남긴 기록이 아직 없어요. 오늘 한 줄을 남기면 다음 날 여기에서 만날 수 있어요.';
  }
  function makeRoot() {
    if(!root) {
      root=document.getElementById('ongi-journey-root');
      if(!root) {
        root=document.createElement('div');root.id='ongi-journey-root';
        root.className='ongi-root';root.hidden=true;document.body.appendChild(root);
      }
    }
    return root;
  }
  function insertHomeLinks() {
    const page=document.querySelector('#main-content .free-home-v18');
    if(!page)return;
    const header=page.querySelector('.free-header');
    if(header && !header.querySelector('.free-back-btn')) {
      const back=document.createElement('button');
      back.type='button';back.className='free-back-btn';
      back.dataset.ongiNav='back';back.setAttribute('aria-label','이전 화면');
      back.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
      const brand=header.querySelector('.free-brand');
      if(brand)header.insertBefore(back,brand);else header.prepend(back);
    }
    if(header && !header.querySelector('.free-install-btn')) {
      const button=document.createElement('button');
      button.type='button';button.className='free-install-btn';
      button.dataset.action='install';button.setAttribute('aria-label','오늘의 온기 앱 설치하기');
      button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 16v4h14v-4"/></svg><span>설치</span>';
      const premium=header.querySelector('.free-plus-cta');
      if(premium)header.insertBefore(button,premium);else header.appendChild(button);
    }
    const progress=page.querySelector('.free-progress');
    if(progress && !progress.querySelector('.ongi-open-journey')){
      const button=document.createElement('button');
      button.type='button';button.className='ongi-open-journey';
      button.dataset.ongi='open';button.textContent='100일 여정 ›';
      button.setAttribute('aria-label','100일 온기 여정 열기');
      const track=progress.querySelector('.free-progress-track');
      if(track)progress.insertBefore(button,track);else progress.appendChild(button);
    }
  }
  function timerText() {
    return String(Math.floor(secondsLeft/60)).padStart(2,'0')+':'+String(secondsLeft%60).padStart(2,'0');
  }
  function stopTimer() {
    if(timerId)clearInterval(timerId);
    timerId=null;
    if(deadline)secondsLeft=Math.max(0,Math.ceil((deadline-Date.now())/1000));
    deadline=0;
  }
  function finishTimer() {
    if(timerId)clearInterval(timerId);
    timerId=null;deadline=0;secondsLeft=180;
    const v=data();v.guided[today()]={...(v.guided[today()]||{}),at:new Date().toISOString()};
    if(put(v)){notice='3분 실천을 기록했어요.';}
    render();
  }
  function startTimer() {
    if(timerId)return;
    if(secondsLeft<=0)secondsLeft=180;
    deadline=Date.now()+secondsLeft*1000;
    timerId=setInterval(() => {
      secondsLeft=Math.max(0,Math.ceil((deadline-Date.now())/1000));
      const timer=root?.querySelector('.ongi-time');if(timer)timer.textContent=timerText();
      if(secondsLeft===0)finishTimer();
    },250);
    render();
  }
  function contentToday(s) {
    const m=getMission(s),complete=s.journal.guided[today()];
    return [
      '<section class="ongi-panel">',
        '<span class="ongi-kicker">어제의 내가 오늘의 나에게</span>',
        '<div class="ongi-note">',getYesterday(s),'</div>',
      '</section>',
      '<section class="ongi-panel">',
        '<span class="ongi-kicker">오늘의 3분 제안 · ',esc(s.phase),'</span>',
        '<h2>',esc(m.title),'</h2>',
        '<p>',esc(m.why),'</p>',
        '<div class="ongi-step-list">',
        m.steps.map((step,i)=>'<div class="ongi-step"><b>'+(i+1)+'</b><span>'+esc(step)+'</span></div>').join(''),
        '</div>',
        complete?[
          '<div class="ongi-note">✓ 오늘의 3분을 실천했어요. 어떤 느낌이었나요?</div>',
          '<div class="ongi-feelings">',
          [['better','조금 편안해요'],['same','비슷해요'],['harder','여전히 어려워요']].map(([id,label])=>'<button type="button" data-ongi="feeling" data-feeling="'+id+'" class="'+(complete.feeling===id?'chosen':'')+'">'+label+'</button>').join(''),
          '</div>'
        ].join(''):[
          '<div class="ongi-time" aria-live="off">',timerText(),'</div>',
          '<div class="ongi-actions">',
          timerId?'<button class="ongi-btn secondary" type="button" data-ongi="pause">잠시 멈춤</button>':'<button class="ongi-btn" type="button" data-ongi="start">'+(secondsLeft<180?'이어서 시작':'3분 시작하기')+'</button>',
          secondsLeft<180?'<button class="ongi-btn secondary" type="button" data-ongi="reset">다시 시작</button>':'',
          '</div>'
        ].join(''),
      '</section>',
      '<p class="ongi-footline">쉬었다 돌아와도 괜찮아요. 기록한 날짜만 차곡차곡 쌓입니다.</p>'
    ].join('');
  }
  function contentGarden(s) {
    const stage=s.completed>=100?4:Math.min(3,Math.floor(s.completed/25));
    const growth=[28,53,80,103,103][stage],flower=stage===4;
    return [
      '<section class="ongi-panel">',
        '<span class="ongi-kicker">나의 온기 정원</span>',
        '<h2>',s.current,'일차 · ',esc(s.phase),'의 시간</h2>',
        '<div class="ongi-grow-wrap">',
          '<div class="ongi-garden" style="--stem-height:',growth,'px">',
            '<span class="ongi-sun"></span><span class="ongi-ground"></span>',
            '<span class="ongi-stem"></span>',
            '<span class="ongi-leaf" style="--leaf-y:16px"></span>',
            '<span class="ongi-leaf r" style="--leaf-y:23px"></span>',
            stage>=1?'<span class="ongi-leaf second" style="--leaf-y:47px"></span>':'',
            stage>=2?'<span class="ongi-leaf second r" style="--leaf-y:57px"></span>':'',
            flower?'<span class="ongi-flower"></span>':'',
            '<span class="ongi-ground-dot"></span><span class="ongi-ground-dot right"></span>',
          '</div>',
          '<strong>',s.completed>=100?'100일의 정원이 완성됐어요':'오늘도 조금씩 자라는 중','</strong>',
          '<span>기록한 날 ',s.completed,'일 / 100일</span>',
        '</div>',
        '<div class="ongi-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="',s.completed,'" aria-label="온기 정원 성장"><i style="width:',s.completed,'%"></i></div>',
        '<div class="ongi-milestones">',
        [25,50,75,100].map((d,i)=>'<div class="ongi-milestone '+(s.completed>=d?'passed':'')+'">'+PHASES[i]+'<br>'+d+'일</div>').join(''),
        '</div>',
        '<p class="ongi-guidance">연속 출석이 아니어도 괜찮아요. 기록한 날을 기준으로 정원이 자라요.</p>',
      '</section>',
      '<section class="ongi-panel">',
        '<span class="ongi-kicker">다음 작은 약속</span>',
        '<p>지금까지 ',s.completed,'일의 흔적이 있어요. 오늘은 나를 위해 아주 작은 행동 하나를 해보세요.</p>',
        '<button class="ongi-btn secondary" type="button" data-ongi="tab" data-tab="today">오늘의 3분 실천 보기</button>',
      '</section>'
    ].join('');
  }
  function weekLetter(s) {
    const latest=s.dates.slice(-7);
    const notes=latest.filter(d => !!s.rows[d]?.note?.trim()).length;
    const routines=latest.filter(d => !!s.rows[d]?.smallDone || !!s.journal.guided[d]?.at).length;
    const feelings=latest.filter(d => !!s.rows[d]?.mood).length;
    return {
      notes,routines,feelings,
      title:'지난 일곱 번의 기록에서',
      text:'당신은 ' + latest.length + '일 동안 자신을 돌보는 시간을 남겼어요. 마음을 살핀 날은 ' + feelings + '일, 실천을 남긴 날은 ' + routines + '일, 한 줄 기록을 적은 날은 ' + notes + '일이에요. 빠진 날보다 다시 돌아온 날에 마음을 두어도 좋아요.'
    };
  }
  function contentWeek(s) {
    const milestone=Math.floor(s.completed/7)*7,unlocked=milestone>=7;
    if(!unlocked)return [
      '<section class="ongi-panel">',
        '<span class="ongi-kicker">7일마다 도착하는 편지</span>',
        '<h2>첫 편지를 준비하고 있어요</h2>',
        '<p>기록한 날이 7일이 되면 당신의 일주일을 한 장의 편지로 돌아볼 수 있어요.</p>',
        '<div class="ongi-track"><i style="width:',Math.floor(s.completed%7/7*100),'%"></i></div>',
        '<div class="ongi-note">현재 ',s.completed,' / 7일 · ',7-s.completed,'일 남았어요.</div>',
      '</section>'
    ].join('');
    const w=weekLetter(s);
    return [
      '<section class="ongi-panel">',
        '<span class="ongi-kicker">',milestone,'일차에 도착한 편지</span>',
        '<h2>',w.title,'</h2>',
        '<div class="ongi-note">',esc(w.text),'</div>',
        '<div class="ongi-summary">',
          '<div class="ongi-metric"><strong>',w.feelings,'</strong><span>마음 기록</span></div>',
          '<div class="ongi-metric"><strong>',w.routines,'</strong><span>실천한 날</span></div>',
          '<div class="ongi-metric"><strong>',w.notes,'</strong><span>한 줄 기록</span></div>',
        '</div>',
        '<button class="ongi-btn secondary" type="button" data-ongi="copy-week">편지 복사하기</button>',
        '<p class="ongi-guidance">최근 기록한 7일을 바탕으로 쓴 편지예요. 감정의 호전 여부를 추측하지 않아요.</p>',
      '</section>'
    ].join('');
  }
  function contentFuture(s) {
    const v=s.journal;
    if(!v.futureLetter)return [
      '<section class="ongi-panel">',
        '<span class="ongi-kicker">미래의 나에게 쓰는 편지</span>',
        '<h2>100일 뒤 나에게 전하고 싶은 말</h2>',
        '<p>오늘의 마음을 적어두면 30일, 50일, 100일에 다시 읽을 수 있어요.</p>',
        '<textarea class="ongi-letterarea" id="ongi-future-input" maxlength="420" placeholder="나중의 나에게 어떤 말을 건네고 싶나요?"></textarea>',
        '<button class="ongi-btn" type="button" data-ongi="save-future">미래 편지 보관하기</button>',
        '<p class="ongi-guidance">편지는 이 기기에만 저장돼요. 기기를 바꾸거나 데이터를 지우면 사라질 수 있어요.</p>',
      '</section>'
    ].join('');
    const milestones=[30,50,100];
    return [
      '<section class="ongi-panel">',
        '<span class="ongi-kicker">나에게 보내 둔 편지</span>',
        '<h2>그날의 말을 잘 보관하고 있어요</h2>',
        '<p>처음 쓴 편지는 30·50·100일차에 열어볼 수 있어요.</p>',
        milestones.map(day=>[
          '<div class="ongi-letter-row"><span>',day,'일의 편지 · ',s.completed>=day?'열 수 있어요':'아직 '+(day-s.completed)+'일 남았어요','</span>',
          '<button type="button" data-ongi="open-letter" data-day="',day,'" ',s.completed<day?'disabled':'','>',selectedMilestone===day?'닫기':'열기','</button></div>'
        ].join('')).join(''),
        selectedMilestone && s.completed>=selectedMilestone?[
          '<div class="ongi-note">',esc(v.futureLetter),'</div>',
          '<span class="ongi-kicker">',selectedMilestone,'일의 내가 남기는 답장</span>',
          '<textarea class="ongi-letterarea" id="ongi-reflection-input" maxlength="420" placeholder="지금의 나는 어떤 마음인가요?">',
            esc(v.reflections[selectedMilestone]||''),'</textarea>',
          '<button class="ongi-btn" type="button" data-ongi="save-reflection">답장 저장하기</button>'
        ].join(''):'',
      '</section>'
    ].join('');
  }
  function render() {
    const el=makeRoot();
    if(el.hidden)return;
    const s=snapshot();
    const tabMap={today:'오늘',garden:'온기 정원',week:'7일 편지',future:'미래 편지'};
    const body={today:contentToday,garden:contentGarden,week:contentWeek,future:contentFuture}[activeTab](s);
    el.innerHTML=[
      '<div class="ongi-shell" role="dialog" aria-modal="true" aria-label="오늘의 온기 100일 여정">',
        '<header class="ongi-head">',
          '<div class="ongi-head-title"><small>SMALL STEPS · 100 DAYS</small><strong>나의 100일 온기 여정</strong></div>',
          '<button type="button" class="ongi-close" data-ongi="close" aria-label="닫기">×</button>',
        '</header>',
        '<nav class="ongi-tabs" aria-label="100일 여정 메뉴">',
        Object.entries(tabMap).map(([key,label])=>'<button type="button" role="tab" class="ongi-tab" data-ongi="tab" data-tab="'+key+'" aria-selected="'+(activeTab===key)+'">'+label+'</button>').join(''),
        '</nav>',
        '<main class="ongi-body">',
          notice?'<div class="ongi-note" role="status">'+esc(notice)+'</div>':'',
          body,
        '</main>',
      '</div>'
    ].join('');
  }
  function open(tab) {
    currentFocus=document.activeElement;
    activeTab=tab||'today';notice='';
    const el=makeRoot();el.hidden=false;
    render();
    el.querySelector('.ongi-close')?.focus();
  }
  function close() {
    stopTimer();
    const el=makeRoot();el.hidden=true;el.innerHTML='';
    notice='';selectedMilestone=0;secondsLeft=180;
    if(currentFocus?.isConnected)currentFocus.focus();
  }
  async function copyWeek() {
    const s=snapshot(),w=weekLetter(s);
    try {
      if(!navigator.clipboard?.writeText)throw new Error('unsupported');
      await navigator.clipboard.writeText(w.title+'\n'+w.text+'\n— 오늘의 온기');
      notice='편지를 복사했어요.';
    } catch (_) {notice='이 브라우저에서는 복사할 수 없어요. 편지 내용을 길게 눌러 복사해 주세요.';}
    render();
  }
  function handleAction(element) {
    const action=element.dataset.ongi;
    if(action==='open'){open('today');return}
    if(action==='close'){close();return}
    if(action==='tab'){activeTab=element.dataset.tab in {today:1,garden:1,week:1,future:1}?element.dataset.tab:'today';notice='';render();return}
    if(action==='start'){startTimer();return}
    if(action==='pause'){stopTimer();render();return}
    if(action==='reset'){stopTimer();secondsLeft=180;render();return}
    if(action==='feeling'){
      const feeling=element.dataset.feeling;
      if(!['better','same','harder'].includes(feeling))return;
      const v=data();if(!v.guided[today()]?.at)return;
      v.guided[today()].feeling=feeling;if(put(v))notice='오늘의 느낌을 기록했어요.';
      render();return;
    }
    if(action==='save-future'){
      const value=root.querySelector('#ongi-future-input')?.value.trim().slice(0,420);
      if(!value){notice='나에게 보내는 한 줄을 적어 주세요.';render();return}
      const v=data();v.futureLetter=value;v.futureWritten=new Date().toISOString();
      if(put(v)){notice='미래 편지를 보관했어요.';}render();return;
    }
    if(action==='open-letter'){
      const day=Number(element.dataset.day),s=snapshot();
      if(![30,50,100].includes(day)||s.completed<day)return;
      selectedMilestone=selectedMilestone===day?0:day;notice='';render();return;
    }
    if(action==='save-reflection'){
      if(!selectedMilestone || snapshot().completed<selectedMilestone)return;
      const value=root.querySelector('#ongi-reflection-input')?.value.trim().slice(0,420);
      if(!value){notice='지금의 나에게 답장을 적어 주세요.';render();return}
      const v=data();v.reflections[selectedMilestone]=value;
      if(put(v))notice='지금의 답장을 저장했어요.';render();return;
    }
    if(action==='copy-week'){copyWeek();return}
  }
  document.addEventListener('click', event => {
    const nav=event.target.closest('[data-ongi-nav="back"]');
    if(nav){
      const sheet=document.getElementById('sheet-root');
      const sheetBack=sheet?.querySelector('.sheet-back');
      const sheetClose=sheet?.querySelector('.sheet-close');
      if(sheet?.innerHTML?.trim() && (sheetBack||sheetClose)){(sheetBack||sheetClose).click();return}
      const personal=document.querySelector('#personal-root:not([hidden]) .a-back');
      if(personal){personal.click();return}
      const premium=document.querySelector('#premium-root:not([hidden]) .p-back');
      if(premium){premium.click();return}
      if(history.length>1){history.back();return}
      location.href='./';
      return;
    }
    const target=event.target.closest('[data-ongi]');
    if(target){handleAction(target);return}
    if(event.target.closest('[data-action="clear-data"]')){
      try {localStorage.removeItem(KEY)}catch(_){}
      close();return;
    }
    if(event.target===root&&!root.hidden)close();
  });
  document.addEventListener('keydown',event => {
    if(event.key==='Escape'&&root&&!root.hidden){close();event.preventDefault()}
  });
  const main=document.getElementById('main-content');
  if(main){
    insertHomeLinks();
    new MutationObserver(insertHomeLinks).observe(main,{childList:true,subtree:false});
  }
  // Safe to call from native screens without modifying legacy event handlers.
  window.ONGI_JOURNEY={open,summary:()=>({completed:snapshot().completed,current:snapshot().current})};
})();