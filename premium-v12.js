/* 오늘의 온기 PLUS: opt-in local-only functional premium preview.
   No payment, entitlement or server is implemented here. */
(() => {
'use strict';
const ROOT_ID='premium-root', STORE='oneul-ongi-mvp-v1', PLUS='oneul-ongi-premium-v1';
const escape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const dateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const relativeDay=(n=0)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return d;};
const topics={
  confidence:{label:'자신감',intro:'나를 믿는 연습',color:'lilac',tasks:[
    ['내 장점 한 가지 적기','작아도 괜찮아요. 오늘 잘한 일부터 찾아보세요.'],
    ['스스로에게 응원 보내기','지금의 나에게 필요한 말을 한 문장 적어보세요.'],
    ['미뤄 둔 일 3분 시작','결과보다 첫 행동 하나를 목표로 해보세요.'],
    ['칭찬을 받아들이기','오늘 들은 좋은 말을 부정하지 않고 기억해보세요.']]},
  routine:{label:'생활 습관',intro:'작지만 꾸준한 하루',color:'blue',tasks:[
    ['내일의 첫 할 일 정하기','아침에 망설이지 않도록 한 가지만 적어두세요.'],
    ['5분 정리하기','눈에 보이는 가장 작은 공간부터 정돈해보세요.'],
    ['휴대전화 잠시 내려놓기','5분 동안 화면 밖의 시간을 가져보세요.'],
    ['오늘의 쉼표 만들기','일정 사이에 짧게 쉬는 시간을 표시해보세요.']]},
  money:{label:'경제 습관',intro:'선택의 기준 세우기',color:'peach',tasks:[
    ['오늘 쓴 돈 돌아보기','금액보다 무엇에 썼는지 가볍게 살펴보세요.'],
    ['나에게 필요한 소비 정하기','꼭 필요한 것과 잠시 기다릴 것을 구분해보세요.'],
    ['작은 저축 목표 적기','가능한 금액과 시기를 내 생활에 맞춰 정해보세요.'],
    ['구독 서비스 점검하기','계속 쓰는 서비스 하나의 필요성을 생각해보세요.']]},
  relationships:{label:'인간관계',intro:'나와 타인을 더 잘 이해하기',color:'mint',tasks:[
    ['고마웠던 사람 떠올리기','고마웠던 일을 장면 하나로 떠올려보세요.'],
    ['나의 경계 한 줄 적기','무리하지 않으려면 어떤 말이 필요한지 생각해보세요.'],
    ['안부 한마디 건네기','부담 없는 사람에게 짧은 인사를 전해보세요.'],
    ['오늘의 대화 돌아보기','좋았던 질문이나 경청의 순간 하나를 적어보세요.']]}
};
const taskIndex={};
Object.entries(topics).forEach(([topic,data])=>data.tasks.forEach(([title,description],idx)=>{
 const id=`plus_${topic}_${idx}`; taskIndex[id]={id,topic,title,description};
}));
const challenges=[
 {id:'7',days:7,title:'7일, 하루의 리듬',subtitle:'작은 생활 습관을 만드는 일주일',category:'routine',art:'rhythm',steps:['아침 첫 행동 정하기','5분 정리하기','잠깐 쉬는 시간 만들기','내일의 일정 한 가지 적기','필요 없는 알림 하나 끄기','산책하며 주변 살피기','이번 주의 작은 변화를 적기']},
 {id:'21',days:21,title:'21일, 나를 믿는 연습',subtitle:'하루 한 걸음, 내 편이 되어주기',category:'confidence',art:'steps',steps:['오늘 잘한 일 하나 찾기','나에게 응원 한마디 남기기','작은 결심을 실행하기','스스로를 비교하지 않는 시간','남은 시간을 아끼는 선택','내가 좋아하는 모습 적기','지금 필요한 휴식 고르기']},
 {id:'30',days:30,title:'30일, 나의 선택',subtitle:'생활 속 경제 습관을 차곡차곡',category:'money',art:'coins',steps:['오늘 쓴 돈 살피기','작은 저축 목표 떠올리기','필요와 취향 나누기','구독 한 가지 점검하기','다음 주 소비 계획 세우기','무지출보다 합리적 선택 생각하기','일주일의 지출 돌아보기']}
];
const ICONS={mission:'<path d="m3 11 7-7 4 4 7-6"/><path d="M16 2h5v5"/><path d="M4 19h16"/>',report:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 16v-5m4 5V8m4 8v-8"/>',challenge:'<path d="M8 20h8M12 16v4M7 4h10v6a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>',book:'<path d="M12 6c-3-2-5-2-9-1v14c4-1 6-1 9 1V6Zm0 0c3-2 5-2 9-1v14c-4-1-6-1-9 1V6Z"/>',arrow:'<path d="m9 18 6-6-6-6"/>',back:'<path d="m15 18-6-6 6-6"/>',check:'<path d="m5 12 4 4L19 6"/>',spark:'<path d="m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9z"/>'};
const icon=(type)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[type]||ICONS.spark}</svg>`;
function art(type){
 if(type==='mission')return `<svg viewBox="0 0 188 126" aria-hidden="true"><rect x="8" y="13" width="172" height="99" rx="25" fill="#E4DAFF"/><rect x="82" y="27" width="72" height="73" rx="13" fill="#FFF" stroke="#343248" stroke-width="2.3"/><path d="M94 46h32M94 58h44M94 71h30" stroke="#B9A9EE" stroke-width="6" stroke-linecap="round"/><path d="m121 83 6 6 12-13" fill="none" stroke="#7653DC" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="51" r="20" fill="#F4D2C3" stroke="#333248" stroke-width="2.7"/><path d="M33 50q12-28 35-8" stroke="#333248" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M32 77q18-18 36 0l15 23H19Z" fill="#6D69B7" stroke="#333248" stroke-width="2.7"/><path d="m65 81 18-13" stroke="#333248" stroke-width="5" stroke-linecap="round"/><path d="M45 55h.1M57 55h.1" stroke="#333248" stroke-width="4" stroke-linecap="round"/><path d="M47 63q5 4 9 0" stroke="#333248" stroke-width="2" fill="none"/></svg>`;
 if(type==='report')return `<svg viewBox="0 0 188 126" aria-hidden="true"><rect x="8" y="11" width="172" height="103" rx="24" fill="#DCECFB"/><rect x="27" y="26" width="132" height="70" rx="13" fill="#FFF" stroke="#333248" stroke-width="2"/><path d="M44 78V61M65 78V49M86 78V56M107 78V38M128 78V47" stroke="#7162D4" stroke-width="11" stroke-linecap="round"/><path d="m44 51 24-10 21 6 22-21 20 7" stroke="#E9A66F" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="143" cy="34" r="6" fill="#FFB981"/></svg>`;
 if(type==='challenge')return `<svg viewBox="0 0 188 126" aria-hidden="true"><rect x="8" y="11" width="172" height="103" rx="24" fill="#FEE7D8"/><path d="M20 96h150" stroke="#343248" stroke-width="2.5"/><path d="M51 95V78h32v17M83 95V61h30v34M113 95V39h39v56" fill="#FFD3B6" stroke="#343248" stroke-width="2.5"/><circle cx="61" cy="46" r="13" fill="#F6D2C3" stroke="#343248" stroke-width="2.7"/><path d="M45 60h30l-8 16-19-4Z" fill="#7E65C1" stroke="#343248" stroke-width="2"/><path d="M50 65 39 82m28-6 14 9M57 78l-10 17m15-17 11 17" stroke="#343248" stroke-width="3" stroke-linecap="round"/><path d="M59 44h.1M67 44h.1" stroke="#343248" stroke-width="3.5" stroke-linecap="round"/><path d="m139 25 4 7 9 1-7 5 2 8-8-4-7 4 2-8-7-5 9-1z" fill="#F0AD5D"/></svg>`;
 return `<svg viewBox="0 0 188 126" aria-hidden="true"><rect x="8" y="11" width="172" height="103" rx="24" fill="#DDEEEA"/><path d="m47 37 47-14 48 14v69L94 94l-47 12Z" fill="#FFF" stroke="#343248" stroke-width="2.5" stroke-linejoin="round"/><path d="M94 23v71M60 53h20M60 65h24M106 52h24M106 65h20" stroke="#B7CAC7" stroke-width="5" stroke-linecap="round"/><path d="m64 79 10-9 11 9-11 11z" fill="#BF9CEE"/><path d="m140 32 7-12 7 12 14 5-14 6-7 12-7-12-14-6z" fill="#ECC997" stroke="#343248" stroke-width="1.5"/></svg>`;
}
function readMain(){try{const s=JSON.parse(localStorage.getItem(STORE)||'{}');return s&&typeof s==='object'?s:{};}catch(_){return {};}}
function readPlus(){try{const s=JSON.parse(localStorage.getItem(PLUS)||'{}');return {...{goal:'confidence',minutes:5,activeChallenge:null,challenges:{}},...s};}catch(_){return {goal:'confidence',minutes:5,activeChallenge:null,challenges:{}};}}
let ps=readPlus(),root=null,active=false,screen='home',reportPeriod=7,chosenChallenge='7',bookRange=30,bookNotes=true,bookActions=true,bookTitle='오늘의 내가 남긴 기록',priorFocus=null;
function savePlus(){try{localStorage.setItem(PLUS,JSON.stringify(ps));return true}catch(_){notice('저장 공간을 확인해 주세요.');return false;}}
function saveMain(s){try{localStorage.setItem(STORE,JSON.stringify(s));return true}catch(_){notice('저장 공간을 확인해 주세요.');return false;}}
function complete(id,done){const main=readMain(),date=dateKey();main.growth=main.growth||{};main.growth[date]=main.growth[date]||{};main.growth[date][id]=done;return saveMain(main);}
function isDone(id){return !!readMain().growth?.[dateKey()]?.[id];}
function totalFor(s,key){const r=s.records?.[key]||{};return (['happy','okay','tired','anxious','mixed'].includes(r.mood)?1:0)+(r.smallDone?1:0)+(r.note?.trim()?1:0)+Object.values(s.growth?.[key]||{}).filter(v=>v===true).length;}
function daysWith(s){return [...new Set([...Object.keys(s.records||{}),...Object.keys(s.growth||{})])].filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&totalFor(s,k)>0);}
function currStats(){const s=readMain(),days=daysWith(s);return {today:totalFor(s,dateKey()),total:days.reduce((n,k)=>n+totalFor(s,k),0),days:days.length};}
function sectionHead(kicker,title,desc,svg){return `<div class="p-page-title"><div><span class="p-kicker">${escape(kicker)}</span><h2>${escape(title)}</h2><p>${escape(desc)}</p></div><div class="p-mini-art">${art(svg)}</div></div>`;}
function stat(label,num,foot=''){return `<div class="p-stat"><strong>${num}</strong><span>${label}</span>${foot?`<small>${foot}</small>`:''}</div>`;}
function hub(){const st=currStats();return `<div class="p-stack p-hub">
 <div class="p-membership"><div class="p-membership-top"><span class="p-small-brand">ONEUL ONGI <b>PLUS</b></span><span class="p-price">월 2,900원</span></div><div class="p-membership-middle"><div><h2>나의 성장을<br/>조금 더 특별하게.</h2><p>기록 너머의 변화를 만나보세요.</p></div><div class="p-hub-illustration">${art('challenge')}</div></div><div class="p-membership-foot"><span>프리미엄 기능 미리 체험</span><span>결제 준비 중</span></div></div>
 <div class="p-hub-summary">${stat('오늘의 온기',st.today)}${stat('모은 온기',st.total)}${stat('함께한 날',st.days)}</div>
 <div class="p-hub-caption"><strong>나를 위한 네 가지 공간</strong><span>하나씩 둘러보세요</span></div>
 <div class="p-feature-grid">${[['mission','맞춤 미션','내게 맞는 하루','mission'],['report','성장 리포트','이번 주의 나','report'],['challenge','심화 챌린지','함께하는 도전','challenge'],['book','기록 모음집','나만의 작은 책','book']].map(([id,label,sub,ic])=>`<button type="button" class="p-feature" data-premium-action="tab" data-tab="${id}"><span class="p-feature-ic ${ic}">${icon(ic)}</span><strong>${label}</strong><small>${sub}</small><span class="p-feature-arr">${icon('arrow')}</span></button>`).join('')}</div>
 <button type="button" class="p-free-link" data-premium-action="free">기존 온기·인스타 공유 카드 보러 가기 <span>↗</span></button>
 <p class="p-privacy">현재는 기능 체험판입니다. 기록은 이 기기에만 보관되며 실제 결제는 진행되지 않습니다.</p>
 </div>`;}
function dayTasks(){const bank=Object.values(taskIndex).filter(t=>t.topic===ps.goal),d=Math.floor(Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())/86400000);return [bank[d%bank.length],bank[(d+2)%bank.length]];}
function missions(){const done=dayTasks().filter(t=>isDone(t.id)).length;return `<div class="p-stack p-missions">${sectionHead('01 · FOR ME','나에게 맞는 오늘','원하는 방향을 고르면 오늘의 미션이 달라져요.','mission')}
 <div class="p-white p-goal-card"><div class="p-cardline"><strong>요즘 가장 신경 쓰는 것</strong><span>나중에 바꿔도 돼요</span></div><div class="p-goals">${Object.entries(topics).map(([id,t])=>`<button type="button" data-premium-action="goal" data-goal="${id}" class="p-goal ${ps.goal===id?'selected':''}" aria-pressed="${ps.goal===id}">${escape(t.label)}</button>`).join('')}</div><div class="p-time"><span>오늘 투자할 시간</span>${[3,5,10].map(n=>`<button type="button" data-premium-action="minutes" data-minutes="${n}" class="${ps.minutes===n?'selected':''}" aria-pressed="${ps.minutes===n}">${n}분</button>`).join('')}</div></div>
 <div class="p-cardline p-mission-caption"><strong>오늘의 맞춤 미션</strong><span>${done}/2개 완료</span></div>
 <div class="p-mission-list">${dayTasks().map((t,i)=>`<div class="p-task ${isDone(t.id)?'done':''}"><div class="p-task-index">0${i+1}</div><div class="p-task-main"><b>${escape(t.title)}</b><span>${escape(t.description)}</span></div><button class="p-task-toggle" type="button" data-premium-action="task" data-id="${t.id}" aria-label="${escape(t.title)} ${isDone(t.id)?'완료 취소':'완료'}" aria-pressed="${isDone(t.id)}">${isDone(t.id)?icon('check'):'+'}</button></div>`).join('')}</div>
 <div class="p-mission-bottom"><div><b>${ps.minutes}분이면 충분해요.</b><span>나에게 맞는 속도로 천천히 가요.</span></div><span class="p-earn-pill">완료할 때마다 +1 온기</span></div>
 </div>`;}
function reportData(n){const s=readMain(),byDay=Array.from({length:n},(_,i)=>{const d=relativeDay(i-(n-1));const k=dateKey(d);return {key:k,date:d,score:totalFor(s,k),record:s.records?.[k]||{}};});const prior=Array.from({length:n},(_,i)=>totalFor(s,dateKey(relativeDay(i-(n*2-1)))));const sum=byDay.reduce((v,r)=>v+r.score,0),prev=prior.reduce((a,b)=>a+b,0),active=byDay.filter(x=>x.score>0).length;const moodCount={};byDay.forEach(x=>{if(x.record.mood)moodCount[x.record.mood]=(moodCount[x.record.mood]||0)+1;});const moodMap={happy:'좋음',okay:'보통',tired:'피곤',anxious:'불안',mixed:'복잡함'};const mood=Object.entries(moodCount).sort((a,b)=>b[1]-a[1])[0];return {rows:byDay,sum,prev,active,mood:mood?moodMap[mood[0]]||'-':null};}
function reports(){const d=reportData(reportPeriod),today=currStats().today;const max=Math.max(1,...d.rows.map(x=>x.score));const grouped=reportPeriod===7?d.rows:d.rows.reduce((out,row,i)=>{const idx=Math.floor(i/6);if(!out[idx])out[idx]={date:row.date,score:0};out[idx].score+=row.score;return out;},[]);const maxG=Math.max(1,...grouped.map(x=>x.score));const weekLabels=['일','월','화','수','목','금','토'];const insight=d.sum===0?'아직 기록이 없어요. 오늘의 작은 실천부터 시작해 보세요.':d.prev===0?'첫 비교 기간의 기록이에요. 지금부터의 변화를 모아볼까요?':d.sum>d.prev?'이전 기간보다 온기가 더 많이 쌓였어요.':'조금 쉬어간 날도 기록의 일부예요.';
 return `<div class="p-stack p-report">${sectionHead('02 · MY GROWTH','나의 성장 리포트','내가 남긴 기록만으로 오늘의 변화를 보여줘요.','report')}
 <div class="p-periods" role="group" aria-label="리포트 기간">${[7,30].map(n=>`<button type="button" data-premium-action="period" data-period="${n}" class="${reportPeriod===n?'selected':''}" aria-pressed="${reportPeriod===n}">${n===7?'최근 7일':'최근 30일'}</button>`).join('')}</div>
 <div class="p-report-metrics">${stat('모은 온기',d.sum,'이번 기간')}${stat('실천한 날',d.active,'빠짐없이 세지 않아요')}${stat('오늘의 온기',today,'지금까지')}</div>
 <div class="p-white p-chart-card"><div class="p-cardline"><strong>온기 흐름</strong><span>${reportPeriod===7?'최근 7일':'6일 단위, 5구간'}</span></div><div class="p-bars" role="img" aria-label="${reportPeriod===7?'최근 7일':'최근 30일 6일씩'} 온기 막대그래프">${grouped.map((r,i)=>`<div class="p-bar-col"><div class="p-bar-tower"><span class="p-bar-fill ${i===grouped.length-1?'recent':''}" style="height:${r.score?Math.max(10,Math.round(r.score/maxG*100)):4}%"></span></div><small>${reportPeriod===7?weekLabels[r.date.getDay()]:String(i+1)+'주차'}</small></div>`).join('')}</div></div>
 <div class="p-report-insight"><span class="p-lightbulb">${icon('spark')}</span><div><strong>이번 기간에 남긴 작은 흔적</strong><p>${escape(insight)}</p><small>${d.mood?`가장 자주 선택한 기분: ${escape(d.mood)}`:'기분을 기록하면 여기에서도 확인할 수 있어요.'}</small></div></div>
 <button type="button" class="p-slim-link" data-premium-action="free">내 성취 카드에서도 확인하기 ${icon('arrow')}</button>
 </div>`;}
function currentChallenge(){return challenges.find(c=>c.id===chosenChallenge)||challenges[0];}
function chState(id){return ps.challenges?.[id]||null;}
function challengeStep(c,started){const st=chState(c.id);const count=st?Object.keys(st.dates||{}).filter(k=>st.dates[k]).length:0;const index=st?Math.min(c.days-1,Math.max(0,Math.round((new Date(dateKey()+'T12:00')-new Date(st.start+'T12:00'))/86400000))):0;return {count,index,task:c.steps[index%c.steps.length]};}
function challengePage(){const c=currentChallenge(),started=chState(c.id),step=challengeStep(c);return `<div class="p-stack p-challenge">${sectionHead('03 · NEXT LEVEL','나만의 심화 챌린지','쌓아 가는 과정도 분명한 성취예요.','challenge')}
 <div class="p-choice-cards" role="group" aria-label="도전 기간">${challenges.map(o=>`<button type="button" data-premium-action="select-challenge" data-challenge="${o.id}" class="${o.id===c.id?'selected':''}" aria-pressed="${o.id===c.id}"><strong>${o.days}일</strong><small>${o.days===7?'습관':o.days===21?'자신감':'경제'}</small></button>`).join('')}</div>
 <div class="p-challenge-feature"><div class="p-challenge-visual">${art('challenge')}</div><div><span class="p-feature-overline">${started?'ONGOING CHALLENGE':'NEW CHALLENGE'}</span><h3>${escape(c.title)}</h3><p>${escape(c.subtitle)}</p></div></div>
 <div class="p-white p-progress-card"><div class="p-cardline"><strong>나의 진행 현황</strong><span>${step.count}/${c.days}일</span></div><div class="p-progress-track"><span style="width:${step.count/c.days*100}%"></span></div><div class="p-mini-steps">${Array.from({length:7},(_,i)=>`<span class="${i<Math.min(step.count,7)?'filled':''}">${i<Math.min(step.count,7)?'✓':i+1}</span>`).join('')}</div><small>하루 쉬어도 지금까지의 기록은 남아요.</small></div>
 <div class="p-challenge-today"><span>${started?'오늘의 도전':'시작하면 이런 도전을 만나요'}</span><strong>${escape(step.task)}</strong><p>매일 작은 행동 하나를 실천하고 나에게 표시해요.</p></div>
 ${!started?`<button type="button" class="p-cta" data-premium-action="start-challenge" data-challenge="${c.id}">${c.days}일 챌린지 시작하기 ${icon('arrow')}</button>`:`<button type="button" class="p-cta ${isDone('plus_challenge_'+c.id)?'finished':''}" data-premium-action="check-challenge" data-challenge="${c.id}" ${isDone('plus_challenge_'+c.id)?'disabled':''}>${isDone('plus_challenge_'+c.id)?'오늘 인증 완료 ✓':'오늘의 도전 완료 · 온기 +1'} ${icon('arrow')}</button>`}
 </div>`;}
function bookRows(){const s=readMain();return Array.from({length:bookRange},(_,i)=>{const d=relativeDay(i-(bookRange-1)),key=dateKey(d),r=s.records?.[key]||{};return {key,r,score:totalFor(s,key)};}).filter(x=>bookNotes&&x.r.note?.trim()||bookActions&&x.score>0);}
function books(){const rows=bookRows(),notes=rows.filter(x=>x.r.note?.trim()).length,days=rows.length;return `<div class="p-stack p-book">${sectionHead('04 · MY STORY','나의 기록 모음집','흩어진 기록을 한 권의 작은 책으로.','book')}
 <div class="p-book-stage"><div class="p-book-cover"><div class="p-book-cover-top">ONEUL ONGI <span>·</span> PRIVATE EDITION</div><div class="p-book-cover-art">${art('book')}</div><strong>${escape(bookTitle||'오늘의 내가 남긴 기록')}</strong><div class="p-book-cover-line"></div><small>나에게 선물하는 작은 기록</small><span class="p-book-cover-footer">${new Date().getFullYear()}</span></div><div class="p-book-summary"><span>내가 쓴 이야기를 담아</span><strong>${days}일의 기록</strong><p>${notes}개의 한 줄 기록이 포함되어 있어요.</p><div class="p-book-spark">✦ ✧ ✦</div></div></div>
 <div class="p-white p-book-options"><div class="p-cardline"><strong>담을 기간</strong><span>선택한 기록만 포함</span></div><div class="p-periods">${[7,30,100].map(n=>`<button type="button" data-premium-action="range" data-range="${n}" class="${bookRange===n?'selected':''}" aria-pressed="${bookRange===n}">${n}일</button>`).join('')}</div><label class="p-book-label" for="p-book-title">나의 책 제목</label><input id="p-book-title" type="text" maxlength="34" value="${escape(bookTitle)}" placeholder="기록 모음집 제목"/><div class="p-book-toggles"><label><input type="checkbox" data-premium-action="book-notes" ${bookNotes?'checked':''}/> 한 줄 기록</label><label><input type="checkbox" data-premium-action="book-actions" ${bookActions?'checked':''}/> 온기·성취</label></div></div>
 <button type="button" class="p-cta" data-premium-action="export-book" ${!days?'disabled':''}>PDF로 저장하기 ${icon('book')}</button><p class="p-book-note">${days?'인쇄 화면에서 ‘PDF로 저장’을 선택하세요.':'선택한 기간에 기록이 생기면 책을 만들 수 있어요.'} 내용은 외부 서버로 전송되지 않습니다.</p>
 </div>`;}
function nav(){return `<nav class="p-bottom" aria-label="프리미엄 기능">${[['mission','미션'],['report','리포트'],['challenge','챌린지'],['book','모음집']].map(([id,label])=>`<button type="button" data-premium-action="tab" data-tab="${id}" class="p-navitem ${screen===id?'active':''}" aria-current="${screen===id?'page':'false'}"><span>${icon(id)}</span><small>${label}</small></button>`).join('')}</nav>`;}
function render(){if(!root)root=document.getElementById(ROOT_ID);if(!root)return;root.innerHTML=`<div class="p-app" role="dialog" aria-modal="true" aria-labelledby="p-screen-title"><header class="p-header"><button type="button" class="p-back" data-premium-action="${screen==='home'?'close':'tab'}" ${screen==='home'?'':'data-tab="home"'} aria-label="${screen==='home'?'홈으로 돌아가기':'프리미엄 첫 화면'}">${icon('back')}</button><div class="p-header-name"><span>오늘의 온기</span><strong id="p-screen-title">${screen==='home'?'나의 온기 PLUS':({mission:'맞춤형 성장 미션',report:'성장 리포트',challenge:'심화 챌린지',book:'기록 모음집'}[screen])}</strong></div><span class="p-header-tag">PLUS</span></header><main class="p-main">${({home:hub,mission:missions,report:reports,challenge:challengePage,book:books}[screen]||hub)()}</main>${nav()}<div class="p-toast" role="status" aria-live="polite" hidden></div></div>`;}
let toastTimer=null;function notice(s){if(!root)return;const t=root.querySelector('.p-toast');if(!t)return;t.textContent=s;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{if(t.isConnected)t.hidden=true},2600);}
function show(tab='home'){root=document.getElementById(ROOT_ID);if(!root){root=document.createElement('div');root.id=ROOT_ID;document.body.appendChild(root);}priorFocus=document.activeElement;active=true;screen=tab;ps=readPlus();root.hidden=false;document.body.classList.add('premium-open');render();root.querySelector('.p-back')?.focus();}
function close(){if(!active)return;active=false;root.hidden=true;root.replaceChildren();document.body.classList.remove('premium-open');window.__ongiPremiumRefresh?.();if(priorFocus?.isConnected)priorFocus.focus();}
function exportBook(){const rows=bookRows();if(!rows.length){notice('아직 담을 기록이 없어요.');return;}const displayDate=k=>`${k.slice(0,4)}년 ${Number(k.slice(5,7))}월 ${Number(k.slice(8,10))}일`;const mood={happy:'기분 좋음',okay:'보통',tired:'지침',anxious:'불안',mixed:'복잡함'};const title=escape(bookTitle.trim()||'오늘의 내가 남긴 기록');const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>@page{size:A5;margin:0}*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;margin:0;color:#272b38;background:#fff}.cover{height:210mm;padding:24mm 17mm;background:#f5efff;display:flex;flex-direction:column;justify-content:space-between;break-after:page}.mark{font-size:12px;letter-spacing:3px;color:#8767d5;font-weight:800}.cover h1{font-size:32px;line-height:1.4;word-break:keep-all}.cover p{font-size:14px;color:#756b8c}.cover footer{font-size:11px;color:#85769d}.contents{padding:18mm 17mm}.heading{font-size:24px;margin:0 0 18px;border-bottom:1px solid #eae4f2;padding-bottom:15px}.day{break-inside:avoid;padding:0 0 13px;margin-bottom:20px;border-bottom:1px solid #eee}.date{font-size:11px;font-weight:800;letter-spacing:1px;color:#8467be}.note{font-size:14px;line-height:1.85;white-space:pre-wrap;overflow-wrap:anywhere;margin:9px 0}.meta{font-size:11px;color:#7e7e8a;margin-top:9px}.end{text-align:center;margin:25mm auto;font-size:12px;color:#9e90b5}@media screen{body{width:148mm;margin:0 auto;box-shadow:0 0 18px #ddd}.cover{min-height:210mm}}</style></head><body><section class="cover"><div class="mark">ONEUL ONGI · PRIVATE EDITION</div><div><h1>${title}</h1><p>${bookRange}일 중 ${rows.length}일의 나를 기록했어요.</p></div><footer>${new Date().getFullYear()} · 나에게 주는 작은 선물</footer></section><main class="contents"><h2 class="heading">나의 기록</h2>${rows.map(({key,r,score})=>`<section class="day"><div class="date">${displayDate(key)}</div>${bookNotes&&r.note?.trim()?`<p class="note">${escape(r.note.trim())}</p>`:''}${bookActions&&score?`<p class="meta">${mood[r.mood]?escape(mood[r.mood])+' · ':''}이날 모은 온기 ${score}개</p>`:''}</section>`).join('')}<div class="end">오늘도 잘했어요.</div></main></body></html>`;
 const popup=window.open('','_blank');if(!popup){notice('팝업 허용 후 다시 시도해 주세요.');return;}popup.document.open();popup.document.write(html);popup.document.close();popup.focus();popup.onload=()=>{popup.print();};}
function goFree(){close();window.__ongiAchievements?.open?.();}
document.addEventListener('click',event=>{
 const trigger=event.target.closest('.dock-nav [data-premium-action="open"], .premium-hero-entry[data-premium-action="open"]');if(trigger){event.preventDefault();show('home');return;}
 if(!active)return;const a=event.target.closest('[data-premium-action]');if(!a||!root.contains(a))return;
 const kind=a.dataset.premiumAction;
 if(kind==='close'){close();return;}
 if(kind==='tab'){screen=a.dataset.tab||'home';render();return;}
 if(kind==='free'){goFree();return;}
 if(kind==='goal'&&topics[a.dataset.goal]){ps.goal=a.dataset.goal;savePlus();render();return;}
 if(kind==='minutes'){ps.minutes=[3,5,10].includes(+a.dataset.minutes)?+a.dataset.minutes:5;savePlus();render();return;}
 if(kind==='task'&&taskIndex[a.dataset.id]){const id=a.dataset.id;if(complete(id,!isDone(id))){render();}return;}
 if(kind==='period'){reportPeriod=a.dataset.period==='30'?30:7;render();return;}
 if(kind==='select-challenge'){chosenChallenge=challenges.some(c=>c.id===a.dataset.challenge)?a.dataset.challenge:'7';render();return;}
 if(kind==='start-challenge'){const id=a.dataset.challenge;if(!challenges.some(c=>c.id===id))return;ps.challenges=ps.challenges||{};if(!ps.challenges[id])ps.challenges[id]={start:dateKey(),dates:{}};ps.activeChallenge=id;savePlus();render();return;}
 if(kind==='check-challenge'){const id=a.dataset.challenge;const current=ps.challenges?.[id];if(!current||isDone('plus_challenge_'+id))return;const saved=complete('plus_challenge_'+id,true);if(!saved)return;current.dates[dateKey()]=true;savePlus();render();return;}
 if(kind==='range'){bookRange=[7,30,100].includes(+a.dataset.range)?+a.dataset.range:30;render();return;}
 if(kind==='export-book'){exportBook();return;}
});
document.addEventListener('change',event=>{if(!active)return;if(event.target.matches('[data-premium-action="book-notes"]')){bookNotes=event.target.checked;render();}if(event.target.matches('[data-premium-action="book-actions"]')){bookActions=event.target.checked;render();}});
document.addEventListener('input',event=>{if(active&&event.target.id==='p-book-title')bookTitle=event.target.value.slice(0,34);});
document.addEventListener('keydown',event=>{if(!active)return;if(event.key==='Escape'){close();return;}if(event.key==='Tab'){const focusable=[...root.querySelectorAll('button:not([disabled]),input:not([disabled])')];const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
// Premium missions and challenge completions count as regular 온기 in the existing free achievement card.
window.ONGI_CONTENT.tasks.premium=Object.values(taskIndex).map(({id,title})=>({id,title})).concat(challenges.map(c=>({id:'plus_challenge_'+c.id,title:c.title})));
window.__ongiPremium={show,close,readPlus,readMain,reportData,dayTasks,bookRows,topics,challenges};
// Direct preview link for users whose installed app is still displaying old cached navigation.
if(new URLSearchParams(location.search).get('premium')==='1') {
  window.addEventListener('load',()=>show('home'),{once:true});
}

})();
