/* Pyeoda: one shared service, separately gated adult catalog. */
function syncAdultRegistration(){
 document.getElementById('adultRegistrationRules').hidden=document.getElementById('newAgeRating').value!=='19';
}
(()=>{
 const adultCatalogEnabled=window.PYEODA_SERVER_CONFIG?.adultCatalogEnabled===true;
 document.body.classList.toggle('general-catalog-only',!adultCatalogEnabled);
 let section='general', verifiedUntil=0, verifiedUser='', genre='전체', rank='popular';
 window.pyeodaAdultSection=()=>section;
 const user=()=>PYEODA_SERVER.authUser||PYEODA_SERVER.user;
 const admin=()=>user()?.app_metadata?.pyeoda_admin===true;
 const verified=()=>!!user()?.id&&!user()?.is_anonymous&&verifiedUser===user().id&&verifiedUntil>Date.now();
 window.canReadAdultBook=verified;
 const labels={pending:'심사 대기',approved:'승인',rejected:'반려',suspended:'노출 중지'};
 const style=document.createElement('style');style.textContent=`.general-catalog-only .adult-switch,.general-catalog-only .reg-field:has(#newAgeRating){display:none!important}.adult-switch[hidden]{display:none!important}.adult-switch{display:flex;gap:5px;margin:0 10px}.adult-switch button{min-height:36px;padding:6px 13px;border:1px solid var(--line);border-radius:20px;background:transparent;color:var(--ink);font:inherit;font-size:13px;white-space:nowrap}.adult-switch .active{background:var(--ink);color:var(--paper,#fff)}.adult-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.adult-toolbar[hidden],.adult-active .tabs,.adult-active .discover-categories{display:none!important}.adult-toolbar button{border:1px solid var(--line);border-radius:16px;padding:7px 12px;background:var(--paper,#fff);color:var(--ink);font:inherit}.adult-toolbar button.active{background:var(--ink);color:#fff}.adult-dialog{max-width:560px;width:calc(100% - 36px);border:1px solid var(--line);border-radius:18px;background:var(--paper,#fffaf1);color:var(--ink);padding:24px;box-sizing:border-box}.adult-dialog::backdrop{background:#0006}.adult-dialog p{line-height:1.65}.adult-admin-row{border-bottom:1px solid var(--line);padding:16px 0}.adult-admin-row button{margin:5px}.adult-switch [hidden]{display:none}@media(max-width:700px){.adult-switch{margin:5px 0;flex-shrink:0}.top{flex-wrap:wrap}.adult-dialog{padding:20px}}`;document.head.append(style);
 const toggle=document.createElement('div');toggle.className='adult-switch';toggle.hidden=!adultCatalogEnabled;toggle.setAttribute('role','group');toggle.setAttribute('aria-label','작품관 선택');toggle.innerHTML=`<button class='active' data-section='general' aria-pressed='true'>일반</button><button data-section='adult' aria-pressed='false'>19+</button><button id='adultAdminMenu' hidden>19+ 작품 관리</button>`;document.querySelector('header.top').append(toggle);
 const dialog=document.createElement('dialog');dialog.className='adult-dialog';dialog.innerHTML=`<h2>19+관 입장 안내</h2><p>19+관은 성인인증을 완료한 계정만 이용할 수 있습니다.</p><p id='adultGateMessage'></p><div class='adult-toolbar'><button id='adultGateLogin'>로그인</button><button id='adultGateCheck'>인증 상태 확인</button><button id='adultGateClose'>일반관으로</button></div>`;document.body.append(dialog);
 document.getElementById('adultGateClose').onclick=()=>dialog.close();document.getElementById('adultGateLogin').onclick=()=>{dialog.close();openReaderAuthModal({});};
 async function checkVerification(){
  verifiedUntil=0;verifiedUser='';const uid=user()?.id;if(!uid||!PYEODA_SERVER.client||user()?.is_anonymous)return false;
  const {data,error}=await PYEODA_SERVER.client.from('adult_verifications').select('expires_at,revoked_at').eq('user_id',uid).maybeSingle();
  if(!error&&data&&!data.revoked_at&&user()?.id===uid){verifiedUntil=Date.parse(data.expires_at);verifiedUser=uid;}
  return verified();
 }
 function gate(){document.getElementById('adultGateMessage').textContent=user()?.id?'현재 성인 본인인증 서비스 연결을 준비 중입니다. 연결 전에는 입장할 수 없습니다.':'먼저 로그인해 주세요. 성인 본인인증 서비스 연결 전에는 19+관 입장이 제한됩니다.';if(!dialog.open)dialog.showModal();}
 function updateToggle(){document.body.classList.toggle('adult-active',section==='adult');toggle.querySelectorAll('[data-section]').forEach(b=>{const on=b.dataset.section===section;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});document.getElementById('adultAdminMenu').hidden=!adultCatalogEnabled||!admin();document.querySelector('.discover-categories').hidden=section==='adult';document.querySelector('.tabs').hidden=section==='adult';}
 async function enter(target){
  if(target==='adult'&&!adultCatalogEnabled)return;
  if(target==='adult'&&!await checkVerification()){gate();return;}
  section=target;genre='전체';updateToggle();await refreshServerLibrary({silent:true});go('home');renderShelf('popular');renderDiscover();
 }
 toggle.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>enter(b.dataset.section));document.getElementById('adultGateCheck').onclick=async()=>{if(await checkVerification()){dialog.close();await enter('adult');}else gate();};
 const inSection=b=>section==='adult'?verified()&&b.ageRating==='19'&&b.adultReviewStatus==='approved':b.ageRating!=='19';
 const oldPublic=currentPublicBooks;currentPublicBooks=()=>oldPublic().filter(inSection);
 const oldShelf=publicShelfItems;publicShelfItems=type=>oldShelf(type).filter(inSection);
 const oldDiscover=publicDiscoverBooks;publicDiscoverBooks=()=>oldDiscover().filter(inSection);
 const oldShelfRender=renderShelf,oldDiscoverRender=renderDiscover;
 function adultItems(){
  let items=currentPublicBooks().filter(b=>genre==='전체'||b.genre===genre);
  if(rank==='completed')items=items.filter(b=>b.completed);
  return items.sort(rank==='popular'?(a,b)=>(b.views+b.likes*5)-(a.views+a.likes*5):(a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
 }
 function toolbar(parent,id){
  let el=document.getElementById(id);if(!el){el=document.createElement('div');el.id=id;el.className='adult-toolbar';parent.prepend(el);}
  el.hidden=section!=='adult';el.replaceChildren();
  for(const [value,label] of [['popular','인기'],['new','신작'],['completed','완결']]){const b=document.createElement('button');b.textContent=label;b.classList.toggle('active',rank===value);b.onclick=()=>{rank=value;renderShelf('popular');renderDiscover();};el.append(b);}
  for(const value of ['전체','로맨스','로판','BL','판타지','현대판타지','기타']){const b=document.createElement('button');b.textContent=value;b.classList.toggle('active',genre===value);b.onclick=()=>{genre=value;renderShelf('popular');renderDiscover();};el.append(b);}
 }
 function renderAdult(grid){const items=adultItems();grid.innerHTML=items.length?items.map((b,i)=>cardHTML(b,i,rank==='popular'?'popular':'discover')).join(''):'<div class="discover-empty">아직 공개된 19+ 작품이 없습니다.</div>';bindReads();}
 renderShelf=function(type='popular'){
  if(section==='adult'&&!verified()){section='general';updateToggle();}
  toolbar(document.getElementById('bookGrid').parentElement,'adultHomeTools');
  if(section!=='adult'){oldShelfRender(type);return;}
  document.getElementById('shelfTitle').textContent='펴다 19+관';document.getElementById('shelfDesc').textContent='성인인증 독자에게만 공개되는, 심사를 통과한 작품입니다.';renderAdult(document.getElementById('bookGrid'));
 };
 renderDiscover=function(...args){
  toolbar(document.getElementById('discoverGrid').parentElement,'adultDiscoverTools');
  if(section!=='adult'){oldDiscoverRender(...args);return;}
  document.getElementById('discoverSubcategoryWrap').hidden=true;document.getElementById('discoverEmpty').hidden=true;document.getElementById('discoverCount').textContent=`19+ ${adultItems().length}권`;document.getElementById('discoverCategoryNote').textContent='일반관과 분리된 성인 전용 목록';renderAdult(document.getElementById('discoverGrid'));
 };
 const oldOpen=openReader;openReader=async function(b,state){
  if(b?.serverId){const {data,error}=await PYEODA_SERVER.client.from('books').select('age_rating,adult_review_status').eq('id',b.serverId).maybeSingle();if(error||!data){toast('공개 작품을 찾을 수 없습니다.');return;}if(data.age_rating==='19'&&!adultCatalogEnabled){toast('19+관은 본인인증 서비스 연결 후 열립니다.');return;}if(data.age_rating==='19'&&(!await checkVerification()||data.adult_review_status!=='approved')){gate();return;}}
  return oldOpen(b,state);
 };
 function leaveAdult(){section='general';if(typeof currentReaderBook!=='undefined'&&currentReaderBook?.ageRating==='19'){currentReaderBook=null;currentServerEpisodes=[];document.getElementById('readerBody')?.replaceChildren();go('home');}updateToggle();renderShelf('popular');renderDiscover();}
 const oldSession=applyAuthorSession;applyAuthorSession=async function(...args){verifiedUntil=0;verifiedUser='';leaveAdult();if(panel?.open)panel.close();const result=await oldSession(...args);updateToggle();renderShelf('popular');renderDiscover();return result;};
 const panel=document.createElement('dialog');panel.className='adult-dialog';panel.innerHTML=`<h2>19+ 작품 관리</h2><p>심사 · 신고 · 제재 이력</p><div id='adultAdminContent'></div><button id='adultAdminClose' class='secondary'>닫기</button>`;document.body.append(panel);document.getElementById('adultAdminClose').onclick=()=>panel.close();
 async function renderAdmin(){
  if(!admin())return;const target=document.getElementById('adultAdminContent');target.textContent='불러오는 중…';
  const {data,error}=await PYEODA_SERVER.client.from('books').select('id,title,age_rating,adult_review_status,adult_review_note').eq('age_rating','19').order('updated_at',{ascending:false});if(error){target.textContent='관리자 권한을 확인해 주세요.';return;}target.replaceChildren();
  for(const book of data){const row=document.createElement('div');row.className='adult-admin-row';const title=document.createElement('b');title.textContent=`${book.title} · ${labels[book.adult_review_status]}`;row.append(title);
   const read=document.createElement('button');read.textContent='본문 검토';read.onclick=async()=>{const eps=await fetchServerEpisodes(book.id,{owner:true});const text=document.createElement('pre');text.style.whiteSpace='pre-wrap';text.textContent=eps.map(e=>`${e.episode_no}화 ${e.title}\n${e.body}`).join('\n\n');row.append(text);};row.append(read);
   for(const [status,label] of [['approved','승인'],['rejected','반려'],['suspended','노출 중지']]){const b=document.createElement('button');b.textContent=label;b.onclick=async()=>{const note=prompt(`${label} 사유를 입력해 주세요.`);if(!note?.trim())return;const {error}=await PYEODA_SERVER.client.from('books').update({adult_review_status:status,adult_review_note:note.trim()}).eq('id',book.id);if(error){toast('심사 저장에 실패했습니다.');return;}await renderAdmin();await refreshServerLibrary({silent:true});};row.append(b);}target.append(row);
  }
  if(!data.length)target.textContent='심사할 19+ 작품이 없습니다.';
  for(const [table,label] of [['adult_reports','신고'],['adult_review_history','심사·제재 이력']]){const h=document.createElement('h3');h.textContent=label;target.append(h);const {data:rows,error}=await PYEODA_SERVER.client.from(table).select('*').order('created_at',{ascending:false}).limit(50);if(error)continue;for(const r of rows){const p=document.createElement('p');p.textContent=`${r.book_id} · ${r.reason||r.note||''} · ${r.status||labels[r.new_status]||''}`;target.append(p);if(table==='adult_reports'&&r.status==='open'){const b=document.createElement('button');b.textContent='처리 완료';b.onclick=async()=>{await PYEODA_SERVER.client.from(table).update({status:'resolved'}).eq('id',r.id);renderAdmin();};target.append(b);}}}
 }
 document.getElementById('adultAdminMenu').onclick=()=>{if(!admin())return;panel.showModal();renderAdmin();};
 const report=document.createElement('button');report.textContent='19+ 작품 신고';report.className='secondary';report.hidden=true;document.querySelector('.reader-book-head').append(report);
 const oldRenderReader=renderReader;renderReader=function(...args){oldRenderReader(...args);report.hidden=currentReaderBook?.ageRating!=='19';};
 report.onclick=async()=>{if(!user()?.id)return gate();const reason=prompt('신고 사유를 5자 이상 입력해 주세요.');if(!reason||reason.trim().length<5)return;const {error}=await PYEODA_SERVER.client.from('adult_reports').insert({book_id:currentReaderBook.serverId,reporter_id:user().id,reason:reason.trim()});toast(error?'신고를 접수하지 못했습니다.':'신고가 접수되었습니다.');};
 const authorStatus=document.createElement('p');authorStatus.className='meta';document.getElementById('adultRegistrationRules').append(authorStatus);
 const oldMyRender=renderMyServerBooks;renderMyServerBooks=function(...args){oldMyRender(...args);const b=currentBookData(),row=PYEODA_SERVER.myBooks.find(r=>r.id===b.serverId);authorStatus.textContent=b.ageRating==='19'?`19+ ${labels[row?.adult_review_status||'pending']}${row?.adult_review_note?' · '+row.adult_review_note:''}`:'';};
 syncAdultRegistration();updateToggle();renderShelf('popular');renderDiscover();
 setInterval(()=>{if(section==='adult'&&!verified())leaveAdult();},15000);
})();
