/* 오늘의 온기 v6 — 400 original sentences, 186 original microstories (including six v5),
   240 growth missions, + emotion-specific daily messages. Local only; no AI API. */
(() => {
  'use strict';
  const moods = {
    tired: { label:'지쳐요', emoji:'😮‍💨', title:'쉬어가도 괜찮은 날', messages:[
      '지금은 무언가를 더 해내기보다, 여기까지 온 나를 잠깐 돌봐줘도 좋아요. 오늘은 아주 작은 일 하나면 충분해요.',
      '마음에도 체력이 필요해요. 오늘의 속도가 느리더라도 지금 쉬어가는 시간은 헛되지 않아요.',
      '온종일 잘 해내지 않아도 괜찮아요. 지금 내게 필요한 만큼의 여유를 조금만 남겨둬요.'
    ], routines:[
      {emoji:'🥛',title:'물 한 잔 마시기',detail:'자리에서 잠깐 일어나 물 한 잔을 천천히 마셔봐요.',minute:'1분'},
      {emoji:'🌿',title:'창밖 바라보기',detail:'창밖이나 멀리 있는 풍경을 보며 잠시 눈을 쉬게 해주세요.',minute:'2분'},
      {emoji:'🚶',title:'가볍게 몸 풀기',detail:'어깨를 돌리고 방 안을 천천히 한 바퀴 걸어봐요.',minute:'3분'}
    ]},
    anxious: { label:'불안해요', emoji:'🥺', title:'지금 할 수 있는 것부터', messages:[
      '생각이 복잡한 순간에는 모든 답을 지금 찾지 않아도 돼요. 당장 손에 닿는 작은 일 하나에만 집중해봐요.',
      '걱정이 밀려올 때는 마음속 생각을 짧게 적어봐도 좋아요. 오늘 해결할 수 있는 일과 나중에 해도 되는 일을 구분해봐요.',
      '아직 일어나지 않은 일까지 오늘 모두 감당할 필요는 없어요. 지금 이 순간을 조금 더 편안하게 만드는 것부터 시작해요.'
    ], routines:[
      {emoji:'📝',title:'생각 한 줄 적기',detail:'가장 신경 쓰이는 일을 딱 한 줄로 적어봐요.',minute:'2분'},
      {emoji:'🫧',title:'잠깐 호흡 느끼기',detail:'편안한 자세로 앉아 억지로 조절하지 말고 자연스러운 호흡을 느껴봐요.',minute:'2분'},
      {emoji:'🪴',title:'주변 정리 한 칸',detail:'책상이나 침대 옆에서 물건 하나만 제자리에 놓아봐요.',minute:'3분'}
    ]},
    okay: { label:'괜찮아요', emoji:'🙂', title:'평범한 하루의 온도', messages:[
      '특별한 일이 없어도 좋은 하루가 될 수 있어요. 오늘 내게 편안했던 순간 하나를 찾아봐요.',
      '오늘 마음이 잔잔하다면 그 느낌을 잠깐 누려봐요. 꼭 바쁘게 채우지 않아도 괜찮아요.',
      '조용한 날은 평소 하고 싶었던 작은 일을 시작하기 좋은 날일지도 몰라요. 가볍게 하나만 골라봐요.'
    ], routines:[
      {emoji:'☀️',title:'햇빛 가까이 가기',detail:'커튼을 열거나 창가에 서서 바깥 풍경을 살펴봐요.',minute:'2분'},
      {emoji:'💌',title:'안부 한 마디',detail:'생각나는 사람에게 짧은 안부를 보내도 좋아요.',minute:'3분'},
      {emoji:'🫖',title:'따뜻한 차 한 잔',detail:'좋아하는 음료를 마시며 잠깐 앉아 있어봐요.',minute:'5분'}
    ]},
    happy: { label:'기뻐요', emoji:'🥰', title:'좋은 마음을 조금 더 오래', messages:[
      '반가운 기분을 그냥 지나치지 말고 오늘 무엇이 좋았는지 한 줄 남겨봐요. 기쁜 기억이 오늘의 작은 선물이 될 거예요.',
      '좋은 일이 있었군요. 이 마음을 천천히 누려봐요. 나중에 다시 꺼내 볼 수 있게 작은 기록을 남겨도 좋겠어요.',
      '기분 좋은 에너지가 느껴지는 날이네요. 너무 큰 계획 말고, 즐거운 마음으로 할 수 있는 일 하나를 시작해봐요.'
    ], routines:[
      {emoji:'📷',title:'좋았던 순간 남기기',detail:'오늘 좋았던 순간을 한 문장으로 기록해봐요.',minute:'2분'},
      {emoji:'💬',title:'기쁨 나누기',detail:'좋았던 일을 소중한 사람에게 짧게 이야기해봐요.',minute:'3분'},
      {emoji:'🎵',title:'좋아하는 노래 듣기',detail:'기분에 어울리는 노래 한 곡을 골라 들어봐요.',minute:'4분'}
    ]},
    mixed: { label:'복잡해요', emoji:'🌧️', title:'여러 마음이 함께 있는 날', messages:[
      '하나의 말로 정리되지 않는 날도 있어요. 마음을 꼭 결론 내리지 말고, 가장 크게 느껴지는 생각부터 천천히 바라봐요.',
      '좋은 마음과 어려운 마음이 동시에 찾아올 수 있어요. 오늘은 어느 쪽도 밀어내지 말고 잠깐 쉬어가도 괜찮아요.',
      '모든 감정에 이름을 붙이지 않아도 좋아요. 한 가지씩 차근차근 들여다볼 수 있는 시간부터 만들어봐요.'
    ], routines:[
      {emoji:'📓',title:'지금 마음 적기',detail:'머릿속에 맴도는 생각을 순서 없이 세 줄만 적어봐요.',minute:'3분'},
      {emoji:'🍃',title:'짧은 바람 쐬기',detail:'가능하다면 가까운 창문을 열거나 잠깐 밖에 나가봐요.',minute:'3분'},
      {emoji:'🧹',title:'작은 자리 정돈',detail:'눈에 보이는 물건 세 개를 정리해봐요.',minute:'3분'}
    ]}
  };
  const growthCategories = {
    reading:{label:'독서',emoji:'📚',intro:'부담 없이 펼치는 한 페이지가 시작이에요.',tasks:[
      {id:'read-2',emoji:'📖',title:'책 두 쪽 읽기',description:'책을 펼치고 두 쪽만 읽어봐요.'},
      {id:'read-line',emoji:'✍️',title:'남기고 싶은 문장 하나',description:'마음에 남는 문장을 한 줄 적어봐요.'},
      {id:'read-next',emoji:'🔖',title:'내일 읽을 곳 표시하기',description:'책갈피를 꽂거나 읽을 곳을 정해봐요.'}
    ]},
    study:{label:'공부·일',emoji:'🧭',intro:'중요한 일도 아주 작게 쪼개면 시작하기 쉬워져요.',tasks:[
      {id:'study-open',emoji:'💻',title:'해야 할 자료 열기',description:'문서나 공부할 페이지를 열어두세요.'},
      {id:'study-five',emoji:'⏱️',title:'딱 5분 집중하기',description:'타이머 없이도 좋아요. 작은 일 하나를 시작해요.'},
      {id:'study-one',emoji:'✅',title:'오늘 할 일 하나 정하기',description:'지금 할 수 있는 일 하나를 골라 적어봐요.'}
    ]},
    habits:{label:'생활습관',emoji:'🌱',intro:'생활을 바꾸는 일도 작은 한 번부터 시작돼요.',tasks:[
      {id:'habit-water',emoji:'💧',title:'물 한 잔 챙기기',description:'지금 손이 닿는 곳에 물을 두고 마셔봐요.'},
      {id:'habit-tidy',emoji:'🪴',title:'내 공간 한 군데 정리',description:'넓게 말고 한 군데만 골라 정리해봐요.'},
      {id:'habit-tomorrow',emoji:'📝',title:'내일의 작은 일 적기',description:'내일 해볼 작은 일 하나를 정해요.'}
    ]}
  };
  const stories = [
    {id:'window',category:'마음 이야기',emoji:'🪟',color:'#edf1e7',title:'창문을 여는 일',summary:'아무것도 달라지지 않은 것 같던 하루',body:'아침부터 해야 할 일은 가득했지만, 손은 좀처럼 움직이지 않았습니다.\n\n그는 한참 책상 앞에 앉아 있다가 창문부터 열었습니다. 바람이 들어오고 커튼이 조금 흔들렸습니다.\n\n해야 할 일이 없어지지는 않았습니다. 하지만 잠깐 멈춰 서서 지금 할 수 있는 일 하나를 떠올릴 수 있었습니다.\n\n그날 그가 시작한 첫 번째 일은, 책상 위에 놓인 빈 컵을 씻는 일이었습니다.'},
    {id:'steps',category:'작은 실천',emoji:'👟',color:'#f7efe6',title:'열 걸음만',summary:'멀리 가지 않아도 시작할 수 있는 일',body:'산책을 하기로 했지만 문밖으로 나가는 일이 유난히 어려운 날이었습니다.\n\n그는 멀리 가겠다는 계획을 접고 현관문 앞에서 신발을 신었습니다. 집 앞을 조금 걷다가 돌아와도 된다고 생각했습니다.\n\n처음 열 걸음은 느렸습니다. 그다음 열 걸음은 조금 덜 망설여졌습니다.\n\n얼마나 걸었는지보다, 자신에게 맞는 속도를 다시 찾았다는 사실이 그날의 기록이 되었습니다.'},
    {id:'cup',category:'쉬어가는 글',emoji:'🍵',color:'#f0eee4',title:'한 잔의 빈자리',summary:'나에게도 잠깐의 자리를 내어주는 마음',body:'언제나 다른 사람들의 부탁을 먼저 챙기는 사람이 있었습니다.\n\n어느 날 그는 따뜻한 차를 두 잔 준비하다가 하나를 자기 앞에 놓았습니다.\n\n차가 식는 동안 아무 일도 하지 않았습니다. 처음에는 어색했지만, 잠시 후 조용한 시간이 편안해졌습니다.\n\n다른 사람을 챙기듯 자기 자신에게도 작은 자리를 내어주는 일. 생각보다 멀리 있지 않았습니다.'},
    {id:'seed',category:'성장 이야기',emoji:'🌱',color:'#e6f0e5',title:'아주 작은 씨앗',summary:'조용히 쌓이는 변화에 관하여',body:'식탁 구석에 놓인 작은 화분에 씨앗을 심었습니다.\n\n첫날도 둘째 날도 아무 변화가 보이지 않았습니다. 그래도 그는 물이 부족하지 않은지만 살폈습니다.\n\n어느 아침 흙 위로 아주 작은 초록색이 올라왔습니다.\n\n변화는 눈에 보이지 않을 때에도 조금씩 준비되고 있었습니다. 그는 그날 노트 첫 장에 한 문장을 적었습니다. 오늘도 작은 일을 하나 해보자고.'},
    {id:'night',category:'밤의 위로',emoji:'🌙',color:'#e9ebf0',title:'오늘을 접는 시간',summary:'하루가 마음에 들지 않는 밤에도',body:'잠자리에 들기 전 그는 오늘 한 일보다 못한 일을 더 오래 떠올렸습니다.\n\n생각을 잠깐 멈추고 종이를 꺼냈습니다. 아침에 일어난 일, 식사를 챙긴 일, 연락을 한 일. 사소한 세 가지가 종이 위에 남았습니다.\n\n아쉬운 일은 내일 다시 살펴보기로 했습니다. 오늘은 잠을 자는 일까지가 하루의 할 일이었습니다.'},
    {id:'rain',category:'마음 이야기',emoji:'☂️',color:'#edf2f0',title:'비가 그친 뒤에',summary:'좋지 않은 하루를 지나가는 방법',body:'오후 내내 비가 내렸습니다. 그는 약속을 취소하고 집에 머물렀습니다.\n\n처음에는 계획대로 흘러가지 않은 하루가 아까웠지만, 따뜻한 음식을 만들어 먹고 한동안 읽지 못했던 책을 펼쳤습니다.\n\n저녁 무렵 비가 멈췄습니다. 계획과 다른 하루에도 나름의 장면이 남아 있었습니다.\n\n그는 창밖이 밝아지는 모습을 보다가, 내일은 또 어떤 하루가 올지 생각했습니다.'}
  ];
  const quotes = [
    '오늘의 속도가 느려도, 오늘의 가치는 줄어들지 않아요.',
    '큰 변화는 때때로 아주 작은 시작의 모양을 하고 있어요.',
    '멈추어 선 시간에도 나를 돌보는 일이 남아 있어요.',
    '내가 할 수 있는 만큼의 한 걸음이면 오늘은 충분해요.',
    '생각이 많을 땐, 지금 할 수 있는 일 하나만 떠올려요.',
    '바쁜 하루 속에도 나를 위한 작은 빈자리를 남겨둬요.',
    '기분이 좋은 날에는 그 이유를 마음에 살짝 적어둬요.',
    '모든 날이 특별할 필요는 없어요. 평범함도 소중해요.',
    '다음 걸음의 크기는 남이 아니라 내가 정해도 돼요.',
    '천천히 가는 날도 나의 하루에 포함되어 있어요.',
    '작은 일을 끝내고 나면 잠시 그 기쁨을 느껴봐요.',
    '내 마음을 정리하는 데 꼭 정확한 말이 필요한 건 아니에요.',
    '어제와 비교하기보다 오늘의 나에게 필요한 걸 살펴봐요.',
    '하루의 끝에서는 잘한 일을 하나쯤 떠올려도 좋아요.'
  ];
  // New editorial assets are separate from the user's private records.
  const content=window.ONGI_CONTENT;
  if(!content)throw new Error('일일 콘텐츠 파일을 읽지 못했습니다. content-v6.js를 함께 배포해 주세요.');
  for(const [k,values] of Object.entries(content.tasks)) growthCategories[k].tasks=values;
  for(const [k,values] of Object.entries(content.emotionMessages)) moods[k].messages.push(...values);
  for(const [k,values] of Object.entries(content.emotionRoutines)) moods[k].routines.push(...values);
  stories.push(...content.stories);
  // Preserve the previous v4/v5 storage key so updates don't lose journal history.

  const STORE_KEY='oneul-ongi-mvp-v1';
  const validMoods=Object.keys(moods);
  const $=id=>document.getElementById(id);
  const main=$('main-content'),root=$('sheet-root'),toast=$('toast');
  const todayKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const esc=(v='')=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const validDate=k=>/^\d{4}-\d{2}-\d{2}$/.test(k);
  const emptyState=()=>({version:1,records:{},growth:{},interest:'reading',routineChoice:{}});
  function readState(){
    try{
      const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
      if(saved?.version===1&&saved.records&&typeof saved.records==='object')return {...emptyState(),...saved,interest:growthCategories[saved.interest]?saved.interest:'reading',growth:saved.growth&&typeof saved.growth==='object'?saved.growth:{},routineChoice:saved.routineChoice&&typeof saved.routineChoice==='object'?saved.routineChoice:{}};
      const merged=emptyState(),mapping={good:'happy',neutral:'okay',tired:'tired',mixed:'mixed'};
      for(const key of ['oneul-ongi-clean-v3','oneul-ongi-simple-v2']){
        const old=JSON.parse(localStorage.getItem(key)||'null');
        if(!old?.records)continue;
        for(const [date,r] of Object.entries(old.records)){
          if(!validDate(date)||!r||merged.records[date]||!mapping[r.mood])continue;
          merged.records[date]={mood:mapping[r.mood],note:String(r.note||'').slice(0,240),smallDone:!!r.done};
        }
      }
      return merged;
    }catch(_e){return emptyState()}
  }
  let state=readState();
  let chosen=validMoods.includes(state.records[todayKey()]?.mood)?state.records[todayKey()].mood:null;
  let draft=state.records[todayKey()]?.note||'';
  let sheetType=null,activeArticle=null,activeArticlePage=0,deferredInstallPrompt=null,toastTimer=null;
  // UTC ordinal computed from the user's LOCAL calendar date; stable throughout one day.
  const daySerial=(date=new Date())=>Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000);
  const dailyQuoteEntry=(date=new Date())=>content.quotes[daySerial(date)%content.quotes.length];
  const dailyQuote=()=>dailyQuoteEntry().text;
  const dailyStory=(date=new Date())=>stories[daySerial(date)%stories.length];
  // Three daily missions per interest. Different prime cycles give many distinct
  // daily triples, and avoid showing three copies of one task on the same day.
  function dailyTasks(interest,date=new Date()){
    const bank=growthCategories[interest].tasks;
    const day=daySerial(date),indices=[day%bank.length,(day*7+17)%79,(day*11+43)%73];
    for(let i=0;i<indices.length;i++)while(indices.slice(0,i).includes(indices[i]))indices[i]=(indices[i]+1)%bank.length;
    return indices.map(i=>bank[i]);
  }

  const entry=()=>state.records[todayKey()]||null;
  const dayHash=()=>Number(todayKey().replace(/-/g,''));
  const completeGrowthCount=(key=todayKey())=>Object.values(state.growth[key]||{}).filter(Boolean).length;
  function routineFor(r){if(!r||!moods[r.mood])return null;const options=moods[r.mood].routines;return options[(state.routineChoice[todayKey()]??daySerial())%options.length]}
  function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));return true}catch(_e){say('기록을 저장하지 못했어요. 저장 공간을 확인해 주세요.');return false}}
  function say(message){toast.textContent=message;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true},2600)}
  const worryPattern=/죽고\s*싶|자살|목숨을\s*끊|스스로\s*해치/;
  function supportBox(){return `<div class="help-box">혼자 감당하기 어렵거나 지금 안전이 걱정된다면 가까운 사람 또는 전문기관에 도움을 요청하세요.<br><a href="tel:109">자살예방상담 109</a> · <a href="tel:15770199">정신건강상담 1577-0199</a> · <a href="tel:119">긴급 119</a></div>`}
  function recentMini(){
    const keys=Object.keys(state.records).filter(k=>validDate(k)&&(state.records[k]?.note||validMoods.includes(state.records[k]?.mood))).sort().reverse().slice(0,2);
    if(!keys.length)return `<div class="short-placeholder">첫 기록을 남기면 여기에 보여드려요.</div>`;
    return keys.map(key=>{
      const r=state.records[key],m=moods[r.mood],date=key===todayKey()?'오늘':key.slice(5).replace('-','. '),note=r.note?.trim();
      return `<div class="recent-row"><span class="recent-date">${esc(date)}</span><span class="recent-mood">${esc(m?.label||'메모')}</span><span class="recent-note">${esc(note||'오늘의 기분을 남겼어요.')}</span></div>`;
    }).join('');
  }
  function ongiCount(key=todayKey()){
    const row=state.records[key]||{};
    return (validMoods.includes(row.mood)?1:0) + (row.smallDone?1:0) + ((row.note||'').trim()?1:0) + completeGrowthCount(key);
  }
  function countDays(){
    const keys=new Set([...Object.keys(state.records),...Object.keys(state.growth)]);
    return Array.from(keys).filter(k=>validDate(k) && (ongiCount(k)>0)).length;
  }
  function heroArt(){
    return `<svg viewBox="0 0 220 150" aria-hidden="true"><rect x="0" y="0" width="220" height="150" rx="28" fill="#efe9ff"/><circle cx="163" cy="38" r="18" fill="#c8b4ff"/><path d="M142 112c0-20 14-36 31-36s31 16 31 36" fill="#5c5f88"/><path d="M148 111V89c0-16 12-28 28-28s28 12 28 28v22" fill="#665f96"/><circle cx="176" cy="55" r="20" fill="#f8d6c5" stroke="#2f3344" stroke-width="2.8"/><path d="M162 54c6-11 28-13 36 2" fill="none" stroke="#2f3344" stroke-width="2.8" stroke-linecap="round"/><circle cx="170" cy="56" r="2.5" fill="#2f3344"/><circle cx="184" cy="56" r="2.5" fill="#2f3344"/><path d="M171 67c3 3 10 3 13 0" fill="none" stroke="#2f3344" stroke-width="2.8" stroke-linecap="round"/><rect x="18" y="78" width="94" height="47" rx="18" fill="#fff"/><path d="M31 94h47" stroke="#a3a8c7" stroke-width="6" stroke-linecap="round"/><path d="M31 108h36" stroke="#d1d4e8" stroke-width="6" stroke-linecap="round"/><circle cx="93" cy="101" r="11" fill="#8f6bff"/><path d="M93 95v12M87 101h12" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/><path d="M117 31c9 1 16 8 17 16" fill="none" stroke="#8f6bff" stroke-width="4" stroke-linecap="round"/><path d="M108 24c4 0 7 2 8 6" fill="none" stroke="#8f6bff" stroke-width="4" stroke-linecap="round"/></svg>`;
  }
  function routineArt(){
    return `<svg viewBox="0 0 96 96" aria-hidden="true"><rect width="96" height="96" rx="24" fill="#f0f0ff"/><circle cx="33" cy="30" r="10" fill="#f9d5c4" stroke="#2f3344" stroke-width="2.5"/><path d="M25 25c4-8 18-8 22 1" fill="none" stroke="#2f3344" stroke-width="2.5" stroke-linecap="round"/><path d="M33 40v18" stroke="#2f3344" stroke-width="3" stroke-linecap="round"/><path d="M33 48l-10 7M33 48l11 8" stroke="#2f3344" stroke-width="3" stroke-linecap="round"/><path d="M33 58l-8 15M33 58l10 15" stroke="#2f3344" stroke-width="3" stroke-linecap="round"/><rect x="52" y="24" width="20" height="26" rx="5" fill="#fff" stroke="#2f3344" stroke-width="2.5"/><path d="M57 31h10M57 38h7" stroke="#b1b5d3" stroke-width="3" stroke-linecap="round"/><circle cx="62" cy="65" r="12" fill="#8f6bff" opacity=".15"/><path d="M55 65l5 5 10-12" fill="none" stroke="#8f6bff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function storyArt(){
    return `<svg viewBox="0 0 120 88" aria-hidden="true"><rect width="120" height="88" rx="22" fill="#eef3ff"/><rect x="22" y="19" width="76" height="50" rx="12" fill="#fff" stroke="#2f3344" stroke-width="2.4"/><path d="M60 19v50" stroke="#2f3344" stroke-width="2.4"/><path d="M36 34h14M36 43h18M69 34h15M69 43h10" stroke="#c0c9ec" stroke-width="4" stroke-linecap="round"/><circle cx="25" cy="72" r="5" fill="#8f6bff"/><circle cx="95" cy="15" r="4" fill="#8f6bff" opacity=".6"/></svg>`;
  }
  function recordArt(){
    return `<svg viewBox="0 0 92 92" aria-hidden="true"><rect width="92" height="92" rx="24" fill="#fff2f0"/><rect x="20" y="19" width="50" height="54" rx="10" fill="#fff" stroke="#2f3344" stroke-width="2.5"/><path d="M29 34h26M29 44h21M29 54h24" stroke="#ddb2ab" stroke-width="4" stroke-linecap="round"/><path d="M61 61l11-11 8 8-11 11-10 2z" fill="#8f6bff" opacity=".7"/><path d="M58 64l11-11 8 8" fill="none" stroke="#2f3344" stroke-width="2.5" stroke-linejoin="round"/><path d="M59 65l-1 6 6-1" fill="none" stroke="#2f3344" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  }
  function renderHome(){
    const r=entry(),m=r&&moods[r.mood],routine=routineFor(r),todayStory=dailyStory(),todayQuoteText=dailyQuote(),todayOngi=ongiCount(),days=countDays(),growthDone=completeGrowthCount();
    const phrase=m?m.messages[daySerial()%m.messages.length]:'기분을 먼저 고르면 오늘의 문장과 작은 실천이 더 잘 맞춰져요.';
    const title=m?m.title:'오늘 마음을 먼저 살펴보는 시간';
    const flagged=worryPattern.test(r?.note||'');
    main.innerHTML=`
      <div class="app-home-v9">
        <header class="hero-bar">
          <div class="hero-brand hero-brand-textonly"><strong>오늘의 온기</strong><small>${esc(new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date()))}</small></div>
          <div class="hero-tools"><button class="circle-tool" type="button" data-action="sheet" data-sheet="install" aria-label="설치"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11"/><path d="m8 10 4 4 4-4"/><path d="M5 17v3h14v-3"/></svg></button><button class="circle-tool" type="button" data-action="sheet" data-sheet="records" aria-label="기록"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 4h9l3 3v13H6z"/><path d="M15 4v4h4M9 12h6M9 16h6"/></svg></button></div>
        </header>

        <section class="service-card home-hero" aria-labelledby="hero-title">
          <div class="card-topline"><span class="tiny-label">TODAY</span><button class="premium-hero-entry" type="button" data-premium-action="open" aria-label="프리미엄 PLUS 월 2,900원 맞춤 성장 화면 열기"><span class="premium-hero-glyph" aria-hidden="true">✦</span><span class="premium-hero-copy"><strong>프리미엄 <em>PLUS</em></strong><small>월 2,900원 · 맞춤 성장</small></span><span class="premium-hero-arrow" aria-hidden="true">›</span></button></div>
          <div class="hero-body"><div class="hero-copy"><h1 id="hero-title">${esc(title)}</h1><p>${esc(phrase)}</p></div><div class="hero-art">${heroArt()}</div></div>
          <div class="quote-strip"><span>오늘의 문장</span><strong>“${esc(todayQuoteText)}”</strong></div>
          <div class="mood-pills" role="group" aria-label="오늘의 기분 선택">${Object.entries(moods).map(([k,v])=>`<button class="mood-pill" type="button" data-action="mood" data-mood="${k}" aria-pressed="${chosen===k}">${esc(v.label)}</button>`).join('')}</div>
        </section>

        <div class="home-row">
          <section class="service-card home-mini routine" aria-label="오늘의 작은 실천">
            <div class="mini-head"><div><span class="card-kicker">작은 실천</span><h2>${esc(routine?routine.title:'기분을 먼저 골라주세요')}</h2></div><div class="mini-art">${routineArt()}</div></div>
            <p class="mini-copy">${esc(routine?routine.detail:'부담 없는 실천 하나를 추천해 드릴게요.')}</p>
            <div class="mini-foot">${r?.smallDone?'<span class="state-badge done">완료됨</span>':`<span class="state-badge">${routine?esc(routine.minute):'1~5분'}</span><div class="mini-buttons"><button class="ghost-btn" type="button" data-action="swap" ${!routine?'disabled':''}>바꾸기</button><button class="primary-btn" type="button" data-action="done" ${!routine?'disabled':''}>완료</button></div>`}</div>
          </section>

          <section class="service-card home-mini note-card" aria-label="오늘 한 줄 기록">
            <div class="mini-head"><div><span class="card-kicker">한 줄 기록</span><h2>오늘의 마음 남기기</h2></div><div class="mini-art">${recordArt()}</div></div>
            <div class="note-stack"><textarea id="note" class="note-input note-input-v9" rows="2" maxlength="240" placeholder="오늘 있었던 일이나 마음을 한 줄로 적어보세요.">${esc(draft)}</textarea><button class="primary-btn block" type="button" data-action="save-note">저장</button></div>
            ${flagged?`<div class="safety-inline compact">혼자 감당하기 어렵다면 <a href="tel:109">109</a> 또는 <a href="tel:119">119</a></div>`:''}
          </section>
        </div>

        <div class="home-row bottom-row">
          <section class="service-card home-mini story-card" aria-label="오늘의 이야기">
            <div class="mini-head"><div><span class="card-kicker">오늘의 이야기</span><h2>${esc(todayStory.title)}</h2></div><div class="mini-art mini-art-story">${storyArt()}</div></div>
            <p class="mini-copy">${esc(todayStory.summary)}</p>
            <div class="mini-foot"><span class="state-badge light">${esc(todayStory.category)}</span><button class="link-btn" type="button" data-action="article" data-id="${esc(todayStory.id)}">읽기 ↗</button></div>
          </section>

          <section class="service-card home-mini ongi-card" aria-label="나의 온기">
            <div class="mini-head"><div><span class="card-kicker">나의 온기</span><h2>차곡차곡 쌓이는 성취</h2></div><div class="today-bubble"><strong>${todayOngi}</strong><span>today</span></div></div>
            <div class="stat-line"><div><b>${days}</b><span>함께한 날</span></div><div><b>${growthDone}</b><span>오늘 미션</span></div><div><b>${Object.keys(state.records).filter(validDate).length}</b><span>기록 수</span></div></div>
            <div class="mini-foot"><button class="ghost-btn" type="button" data-action="sheet" data-sheet="growth">미션 보기</button><button class="primary-btn" type="button" data-reward-action="open">성취 카드</button></div>
          </section>
        </div>

        <nav class="dock-nav" aria-label="주요 메뉴">
          <button type="button" class="dock-item" data-action="sheet" data-sheet="growth"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 21v-9m0 3c-5 0-8-3-8-8 5 0 8 3 8 8Zm0-4c0-5 3-8 8-8 0 5-3 8-8 8Z"/></svg><span>실천</span></button>
          <button type="button" class="dock-item" data-reward-action="open"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 6h10v4a5 5 0 0 1-10 0Z"/><path d="M9 20h6M12 15v5M5 8H3a2 2 0 0 0 2 2M19 8h2a2 2 0 0 1-2 2"/></svg><span>온기</span></button>
          <button type="button" class="dock-item center current" data-action="home"><span class="home-fab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/></svg></span><span>홈</span></button>
          <button type="button" class="dock-item" data-action="sheet" data-sheet="stories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 5c3-1 5-.8 8 1v14c-3-2-5-2-8-1V5Zm8 1c3-1.8 5-2 8-1v14c-3-1-5-1-8 1"/></svg><span>이야기</span></button>
          <button type="button" class="dock-item" data-action="sheet" data-sheet="records"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 4h9l3 3v13H6z"/><path d="M9 12h6M9 16h6"/></svg><span>기록</span></button>
          <button type="button" class="dock-item dock-premium" data-premium-action="open" aria-label="프리미엄 PLUS 열기"><span class="dock-premium-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 2.9 6.1 6.7.9-4.9 4.8 1.2 6.8-5.9-3.2-5.9 3.2 1.2-6.8-4.9-4.8 6.7-.9z"/></svg></span><span class="dock-premium-name">프리미엄</span></button>
        </nav>
      </div>`;
  }
  function sheetShell(title,body,back){
    root.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><div class="sheet-head">${back?`<button class="sheet-back" type="button" data-action="sheet" data-sheet="${back}" aria-label="뒤로">‹</button>`:''}<h2 id="sheet-title">${esc(title)}</h2><button class="sheet-close" type="button" data-action="close" aria-label="닫기">×</button></div><div class="sheet-body">${body}</div></div>`;
    document.body.style.overflow='hidden';root.querySelector('.sheet-close')?.focus();
  }
  function growthSheet(){
    const cat=growthCategories[state.interest],done=state.growth[todayKey()]||{},todayTasks=dailyTasks(state.interest);
    const tabs=Object.entries(growthCategories).map(([id,v])=>`<button class="category-tab" type="button" aria-pressed="${state.interest===id}" data-action="interest" data-interest="${id}">${esc(v.label)}</button>`).join('');
    sheetShell('오늘의 작은 성장',`<p>큰 목표 말고, 지금 할 수 있는 것 하나부터.</p><div class="category-tabs" role="group" aria-label="관심사">${tabs}</div><div class="panel"><p>${esc(cat.intro)} · 오늘의 추천 3개 / 이 분야 ${cat.tasks.length}개</p>${todayTasks.map((t,i)=>`<div class="mission-row"><span class="mission-number">0${i+1}</span><div class="mission-main"><strong>${esc(t.title)}</strong><p>${esc(t.description)}</p></div><button class="task-check" type="button" data-action="toggle-task" data-task="${t.id}" aria-pressed="${!!done[t.id]}" aria-label="${esc(t.title)} ${done[t.id]?'완료 취소':'완료'}">${done[t.id]?'✓':'+'}</button></div>`).join('')}</div><div class="micro-summary">오늘 완료한 미션 ${completeGrowthCount()}개</div>`);
  }
  function storiesSheet(){
    const today=dailyStory(),prior=Array.from({length:2},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(i+1));return {date:d,story:dailyStory(d)}});
    const todayQuote=dailyQuoteEntry();
    const recent=prior.map(({date,story})=>`<button class="story-row compact" type="button" data-action="article" data-id="${esc(story.id)}"><span class="story-index">${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}</span><span class="story-main"><strong>${esc(story.title)}</strong><small>${esc(story.category)}</small></span><span aria-hidden="true">↗</span></button>`).join('');
    sheetShell('마음에 머무는 이야기',`<div class="panel panel-tight story-hero"><div class="article-kicker">오늘의 문장</div><h3>“${esc(todayQuote.text)}”</h3><p class="theme-caption">영감을 받은 주제: ${esc(todayQuote.theme)}</p></div><div class="panel panel-tight daily-feature story-feature"><div class="article-kicker">오늘의 이야기 · ${esc(today.category)}</div><h3>${esc(today.title)}</h3><p>${esc(today.summary)}</p><div class="story-actions"><button class="solid-btn" type="button" data-action="article" data-id="${esc(today.id)}">오늘 이야기 읽기</button><button class="soft-btn" type="button" data-action="sheet" data-sheet="records">내 기록 보기</button></div></div><div class="panel panel-tight compact-list"><div class="section-mini-head"><h3>지난 이야기 2편</h3><small>가볍게 이어 읽기</small></div>${recent}</div><small class="copyright-note">짧고 가볍게 읽는 오늘의 위로 이야기예요.</small>`);
  }
  function splitStoryPages(body){
    const paras=String(body||'').split(/\n\n+/).filter(Boolean);
    const pages=[]; let current=[]; let length=0;
    for(const para of paras){
      const nextLength=length+para.length;
      if(current.length && nextLength>140){pages.push(current.join('\n\n'));current=[para];length=para.length;}
      else {current.push(para);length=nextLength;}
    }
    if(current.length)pages.push(current.join('\n\n'));
    return pages.length?pages:[String(body||'')];
  }
  function articleSheet(id,pageIndex=activeArticlePage){
    const s=stories.find(t=>t.id===id);if(!s){storiesSheet();return;}
    activeArticle=id;
    const pages=splitStoryPages(s.body);
    activeArticlePage=Math.max(0,Math.min(pageIndex,pages.length-1));
    const page=pages[activeArticlePage];
    sheetShell(s.title,`<div class="article-kicker">${esc(s.category)} · 오늘의 온기 이야기</div><div class="panel panel-tight article-panel article-panel-v10"><p class="article-summary">${esc(s.summary)}</p><article class="article-copy article-page-copy">${esc(page)}</article></div><div class="story-pager story-pager-v10"><button class="soft-btn" type="button" data-action="article-page" data-direction="-1" ${activeArticlePage===0?'disabled':''}>이전</button><span>${activeArticlePage+1} / ${pages.length}</span><button class="solid-btn" type="button" data-action="article-page" data-direction="1" ${activeArticlePage===pages.length-1?'disabled':''}>다음</button></div><div class="story-actions"><button class="soft-btn" type="button" data-action="sheet" data-sheet="stories">목록으로</button><button class="soft-btn" type="button" data-action="sheet" data-sheet="records">내 기록</button></div>`,'stories');
  }
  function recordsSheet(){
    const keys=Object.keys(state.records).filter(validDate).sort().reverse();
    const count=keys.filter(k=>validMoods.includes(state.records[k]?.mood)).length;
    const routines=keys.filter(k=>state.records[k]?.smallDone).length;
    const growth=Object.values(state.growth).reduce((n,m)=>n+Object.values(m||{}).filter(Boolean).length,0);
    const week=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-6+i);return {d,row:state.records[todayKey(d)]}});
    const history=keys.filter(k=>{const r=state.records[k];return validMoods.includes(r?.mood)||r?.note?.trim()}).slice(0,5);
    sheetShell('나의 기록',`<div class="stats compact-stats records-stats-v10"><div class="stat"><strong>${count}</strong><span>마음</span></div><div class="stat"><strong>${routines}</strong><span>실천</span></div><div class="stat"><strong>${growth}</strong><span>성장</span></div></div><div class="panel panel-tight"><div class="section-mini-head"><h3>최근 7일</h3><small>차곡차곡 쌓인 온기</small></div><div class="week-grid">${week.map(({d,row})=>`<div class="week-day"><span>${'일월화수목금토'[d.getDay()]}</span><span class="week-dot ${validMoods.includes(row?.mood)?'filled':''}">${validMoods.includes(row?.mood)?'✓':'·'}</span><span>${d.getDate()}</span></div>`).join('')}</div></div><div class="panel panel-tight compact-list"><div class="section-mini-head"><h3>최근 기록 5개</h3><small>오늘의 나를 가볍게 돌아봐요</small></div>${history.length?history.map(k=>{const r=state.records[k];return `<div class="record-row compact"><span class="record-day">${esc(k.slice(5).replace('-','. '))}</span><div class="record-info"><strong>${esc(moods[r.mood]?.label||'메모')}${r.smallDone?' · 실천':''}</strong><span>${esc((r.note?.trim()||'오늘의 기분을 남겼어요.').slice(0,42))}</span></div></div>`}).join(''):`<p>아직 기록이 없어요. 오늘의 마음부터 시작해 보세요.</p>`}</div><div class="manage-actions stacked"><button class="soft-btn" type="button" data-action="backup">기록 백업</button><button class="soft-btn" type="button" data-action="install">앱 설치 안내</button><button class="soft-btn danger" type="button" data-action="clear-confirm">기록 삭제</button></div><small>모든 기록은 이 기기에만 저장됩니다.</small>`);
  }
  function installApp(){
    if(deferredInstallPrompt){const evt=deferredInstallPrompt;deferredInstallPrompt=null;evt.prompt();evt.userChoice.catch(()=>{});return}
    sheetShell('홈 화면에 설치하기',`<div class="panel"><h3>아이폰 Safari</h3><p>아래 공유 버튼을 누른 뒤 ‘홈 화면에 추가’를 선택하세요.</p></div><div class="panel"><h3>안드로이드 Chrome</h3><p>오른쪽 위 메뉴(⋮)에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택하세요.</p></div><p>설치하려면 이 앱을 HTTPS 주소에 배포해야 합니다. 다운로드한 HTML 파일 자체는 설치형 앱이 아닙니다.</p>`);
  }
  function openSheet(type){sheetType=type;if(type==='growth')growthSheet();else if(type==='stories')storiesSheet();else if(type==='records')recordsSheet();else if(type==='install')installApp();}
  function closeSheet(){root.innerHTML='';document.body.style.overflow='';sheetType=null;activeArticle=null;activeArticlePage=0;}
  function refreshSheet(){if(sheetType==='growth')growthSheet();else if(sheetType==='records')recordsSheet();else if(sheetType==='stories')storiesSheet();}
  function backup(){
    const data=JSON.stringify({app:'오늘의 온기',exportedAt:new Date().toISOString(),...state},null,2);
    const blob=new Blob([data],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`oneul-ongi-backup-${todayKey()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);say('기록 백업 파일을 저장했어요.');
  }
  function saveNote(){
    const text=draft.trim().slice(0,240),prior=entry();
    if(!text){say('한 줄을 적고 저장해 주세요.');return;}
    state.records[todayKey()]={mood:prior?.mood||null,note:text,smallDone:!!prior?.smallDone,updatedAt:new Date().toISOString()};
    if(save()){renderHome();say('한 줄을 저장했어요.');if(worryPattern.test(text))say('지금 안전이 걱정된다면 109 또는 119에 연락해 주세요.');}
  }
  function selectMood(key){
    if(!validMoods.includes(key))return;
    const prior=entry();
    state.records[todayKey()]={mood:key,note:prior?.note||'',smallDone:prior?.mood===key?!!prior.smallDone:false,updatedAt:new Date().toISOString()};
    if(prior?.mood!==key)state.routineChoice[todayKey()]=daySerial()%moods[key].routines.length;
    if(save()){chosen=key;renderHome();say('오늘의 기분을 기록했어요.');}
  }
  document.addEventListener('input',event=>{if(event.target?.id==='note')draft=event.target.value.slice(0,240)});
  document.addEventListener('click',event=>{
    const el=event.target.closest('[data-action]');if(!el)return;
    const action=el.dataset.action;
    if(action==='home'){renderHome();closeSheet();return}
    if(action==='mood'){selectMood(el.dataset.mood);return}
    if(action==='save-note'){saveNote();return}
    if(action==='swap'){const r=entry();if(!r||r.smallDone)return;state.routineChoice[todayKey()]=((state.routineChoice[todayKey()]??daySerial())+1)%moods[r.mood].routines.length;if(save())renderHome();return}
    if(action==='done'){const r=entry();if(!r||r.smallDone)return;r.smallDone=true;r.completedAt=new Date().toISOString();if(save()){renderHome();say('작은 실천 완료!')}}
    if(action==='sheet'){openSheet(el.dataset.sheet);return}
    if(action==='close'){closeSheet();return}
    if(action==='interest'){if(growthCategories[el.dataset.interest]){state.interest=el.dataset.interest;if(save())growthSheet()}return}
    if(action==='toggle-task'){const id=el.dataset.task;if(!Object.values(growthCategories).some(c=>c.tasks.some(t=>t.id===id)))return;state.growth[todayKey()]=state.growth[todayKey()]||{};state.growth[todayKey()][id]=!state.growth[todayKey()][id];if(save()){growthSheet();renderHome()}return}
    if(action==='article'){activeArticlePage=0;articleSheet(el.dataset.id);return}
    if(action==='article-page'){if(activeArticle)articleSheet(activeArticle,activeArticlePage+Number(el.dataset.direction||0));return}
    if(action==='backup'){backup();return}
    if(action==='install'){installApp();return}
    if(action==='clear-confirm'){sheetShell('저장된 기록을 지울까요?',`<p>이 기기에 저장된 감정·일기·미션 기록이 모두 삭제됩니다. 되돌릴 수 없으니 먼저 백업해 주세요.</p><div class="manage-actions"><button class="soft-btn" type="button" data-action="sheet" data-sheet="records">돌아가기</button><button class="solid-btn" type="button" data-action="clear-data">모두 삭제</button></div>`,'records');return}
    if(action==='clear-data'){try{localStorage.removeItem(STORE_KEY);localStorage.removeItem('oneul-ongi-clean-v3');localStorage.removeItem('oneul-ongi-simple-v2');localStorage.removeItem('oneul-ongi-premium-v1');state=emptyState();chosen=null;draft='';renderHome();closeSheet();say('이 기기의 기록을 삭제했어요.')}catch(_err){say('삭제하지 못했어요. 브라우저 설정을 확인해 주세요.')}return}
  });
  root.addEventListener('click',event=>{if(event.target===root)closeSheet()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&root.innerHTML)closeSheet()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)return;const r=entry();if(validMoods.includes(r?.mood)){chosen=r.mood;draft=r.note||''}renderHome()});
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event});
  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  renderHome();
  window.__ongiPremiumRefresh=()=>{state=readState();const r=entry();chosen=validMoods.includes(r?.mood)?r.mood:null;draft=r?.note||'';renderHome();};
  window.__ongiV6Checks={todayKey,daySerial,dailyQuoteEntry,dailyStory,dailyTasks,validMoods,stories:stories.length,quotes:content.quotes.length,growthTasks:Object.values(growthCategories).reduce((a,c)=>a+c.tasks.length,0),emotionMessages:Object.fromEntries(Object.entries(moods).map(([k,v])=>[k,v.messages.length])),emotionRoutines:Object.fromEntries(Object.entries(moods).map(([k,v])=>[k,v.routines.length]))};
})();
