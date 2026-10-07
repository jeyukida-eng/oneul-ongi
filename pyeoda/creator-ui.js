/* Public Books creator homes. Public profiles are separate from private account photos. */
(()=>{
 'use strict';
 const screen=document.getElementById('creator'),directory=document.getElementById('creators');
 const homeList=document.getElementById('homeCreatorList'),directoryList=document.getElementById('creatorDirectoryList');
 const profiles=new Map();let selected=null,requestVersion=0,directoryVersion=0,followBusy=false;
 const uuid=id=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id||''));
 const actor=()=>PYEODA_SERVER.authUser?.id||null;
 const pendingKey='pyeoda-books-creator-action-v1';
 function rememberCreatorAction(id){try{sessionStorage.setItem(pendingKey,JSON.stringify({id,at:Date.now()}));}catch(_){}}
 window.booksResumeCreatorAction=()=>{
  if(!readerIsSignedIn())return false;let action;
  try{action=JSON.parse(sessionStorage.getItem(pendingKey)||'null');sessionStorage.removeItem(pendingKey);}catch(_){return false;}
  if(!action||!Number.isFinite(action.at)||Date.now()-action.at>30*60*1000||action.at>Date.now()+60000)return false;
  const id=action.id==='mine'?actor():action.id;if(!uuid(id))return false;
  openCreator(id);return true;
 };
 document.getElementById('authorAuthClose')?.addEventListener('click',()=>{try{sessionStorage.removeItem(pendingKey);}catch(_){}});
 document.getElementById('authorAuthModal')?.addEventListener('click',event=>{if(event.target.id==='authorAuthModal')try{sessionStorage.removeItem(pendingKey);}catch(_){}});
 const fields='id,owner_id,age_rating,adult_review_status,title,subtitle,pen_name,category,writing_type,image_layout,genre,format,intro,author_note,cover_url,completed,published,price,episode_count,views,likes,subscriber_count,owned,created_at,updated_at';
 function catalog(){return [...PYEODA_SERVER.publicBooks,...(typeof personalLikes!=='undefined'&&personalLikes.actor===personalLikesActor()?personalLikes.items:[])];}
 function groups(){
  const map=new Map();
  for(const book of PYEODA_SERVER.publicBooks){if(!uuid(book.creatorId))continue;let row=map.get(book.creatorId);
   if(!row){row={id:book.creatorId,name:profiles.get(book.creatorId)?.display_name||book.author||'작가',books:[]};map.set(row.id,row);}row.books.push(book);
  }
  return [...map.values()];
 }
 function creatorButton(row,compact=false){
  const button=document.createElement('button');button.type='button';button.className=compact?'books-creator-chip':'books-creator-tile';
  const avatar=document.createElement('span');avatar.className='books-creator-avatar';avatar.textContent=Array.from(row.name||'P')[0];
  const text=document.createElement('span'),name=document.createElement('b'),meta=document.createElement('small');name.textContent=row.name;meta.textContent='공개 작품 '+row.books.length+'편';text.append(name,meta);button.append(avatar,text);
  button.onclick=()=>openCreator(row.id);return button;
 }
 function renderDirectory(){
  const rows=groups();homeList.replaceChildren(...rows.slice(0,4).map(row=>creatorButton(row,true)));
  document.getElementById('homeCreators').hidden=!rows.length;
  const query=document.getElementById('creatorSearch').value.trim().toLocaleLowerCase();
  const filtered=rows.filter(row=>(row.name+' '+row.books.map(b=>b.author+' '+b.title).join(' ')).toLocaleLowerCase().includes(query));
  directoryList.replaceChildren(...filtered.map(row=>creatorButton(row)));
  document.getElementById('creatorDirectoryStatus').textContent=rows.length?(filtered.length+'명의 크리에이터'):(PYEODA_SERVER.connected?'아직 공개 작품을 등록한 작가가 없습니다.':'작가 목록을 불러오는 중…');
 }
 async function refreshDirectory(){
  const version=++directoryVersion;renderDirectory();const ids=groups().map(row=>row.id);
  if(!PYEODA_SERVER.client||!ids.length)return;
  try{
   const {data,error}=await PYEODA_SERVER.client.from('book_creator_profiles').select('owner_id,display_name,bio,work_note,updated_at').in('owner_id',ids);
   if(error)throw error;if(version!==directoryVersion)return;
   profiles.clear();for(const profile of data||[])profiles.set(profile.owner_id,profile);renderDirectory();
  }catch(error){console.warn('Creator directory profiles unavailable',error);}
 }
 function renderCreator(){
  if(!selected)return;const {id,books,profile,follow,loading,error}=selected;
  const owner=id===actor(),name=profile?.display_name||books[0]?.author||(owner?currentBookData()?.pen:'')||'크리에이터';
  document.getElementById('creatorName').textContent=name;
  document.getElementById('creatorAvatar').textContent=Array.from(name)[0];
  document.getElementById('creatorBio').textContent=profile?.bio||'이 작가의 이야기를 작품으로 만나보세요.';
  document.getElementById('creatorWorkCount').textContent=books.length.toLocaleString('ko-KR');
  document.getElementById('creatorHeartTotal').textContent=books.reduce((n,b)=>n+Math.max(0,Number(b.likes)||0),0).toLocaleString('ko-KR');
  document.getElementById('creatorFollowerCount').textContent=follow?Number(follow.followers||0).toLocaleString('ko-KR'):'—';
  document.getElementById('creatorWorkNote').textContent=profile?.work_note||'아직 작업노트가 없습니다.';
  document.getElementById('creatorNoteDate').textContent=profile?.updated_at?new Date(profile.updated_at).toLocaleDateString('ko-KR'):'';
  document.getElementById('creatorSupport').hidden=owner;
  const manage=document.getElementById('creatorManage');manage.hidden=!owner;manage.disabled=loading;
  const button=document.getElementById('creatorFollow');button.hidden=owner;button.disabled=loading||followBusy;
  button.textContent=!loading&&!follow?'팔로우 다시 연결':follow?.following?'팔로잉':'＋ 팔로우';button.setAttribute('aria-pressed',String(!!follow?.following));
  document.getElementById('creatorStatus').textContent=loading?'크리에이터 홈을 불러오는 중…':error?'일부 정보를 불러오지 못했습니다. 다시 방문해 주세요.':'';
  const list=document.getElementById('creatorWorks');list.replaceChildren();
  if(!loading&&!books.length){const empty=document.createElement('p');empty.className='discover-empty';empty.textContent='아직 공개된 작품이 없습니다.';list.append(empty);}
  for(const book of books){
   const button=document.createElement('button');button.type='button';button.className='books-creator-work';
   const image=document.createElement('img');image.alt=book.title+' 표지';image.src=safeImageSource(book.cover)||'./icon-192.png?v=books1';
   const info=document.createElement('span'),title=document.createElement('b'),meta=document.createElement('small');title.textContent=book.title;meta.textContent=book.author+' · '+book.meta;
   const arrow=document.createElement('span');arrow.textContent='›';info.append(title,meta);button.append(image,info,arrow);
   button.onclick=async()=>{readerReturnScreen='creator';await openReader(book,readingStateFor(book));readerReturnScreen='creator';};list.append(button);
  }
 }
 async function openCreator(id){
  if(!uuid(id)||saveBeforeMobileNavigation()===false)return;
  const version=++requestVersion,viewer=actor();
  selected={id,books:catalog().filter(b=>b.creatorId===id),profile:profiles.get(id)||null,follow:null,loading:true,error:false};
  go('creator');renderCreator();
  try{
   if(!PYEODA_SERVER.client)throw new Error('Server unavailable');
   const results=await Promise.all([
    PYEODA_SERVER.client.from('books').select(fields).eq('owner_id',id).eq('published',true).in('age_rating',['all','15']).order('updated_at',{ascending:false}),
    PYEODA_SERVER.client.from('book_creator_profiles').select('owner_id,display_name,bio,work_note,updated_at').eq('owner_id',id).maybeSingle(),
    PYEODA_SERVER.client.rpc('get_book_creator_follow_state',{p_creator_id:id})
   ]);
   if(version!==requestVersion||selected?.id!==id)return;
   if(results[0].error)throw results[0].error;
   selected.books=(results[0].data||[]).map(serverRowToBook);
   selected.profile=results[1].error?null:results[1].data;
   if(selected.profile)profiles.set(id,selected.profile);
   selected.follow=viewer===actor()&&!results[2].error?results[2].data:null;
   selected.error=!!results[1].error||!!results[2].error;
  }catch(error){if(version===requestVersion){selected.error=true;console.warn('Creator home unavailable',error);}}
  finally{if(version===requestVersion){selected.loading=false;renderCreator();}}
 }
 window.booksOpenCreator=openCreator;
 function openMine(){
  if(saveBeforeMobileNavigation()===false)return;
  if(!readerIsSignedIn()){rememberCreatorAction('mine');openAuthorAuthModal('login','my');toast('로그인하면 내 크리에이터 홈으로 이어집니다.');return;}
  openCreator(actor());
 }
 document.querySelectorAll('[data-open-my-creator]').forEach(button=>button.onclick=openMine);
 document.querySelectorAll('[data-open-creators]').forEach(button=>button.onclick=async()=>{
  if(saveBeforeMobileNavigation()===false)return;go('creators');renderDirectory();await refreshDirectory();
 });
 document.getElementById('creatorSearch').addEventListener('input',renderDirectory);
 document.getElementById('creatorBack').onclick=()=>go('creators');
 const supportDialog=document.getElementById('creatorSupportDialog');
 document.getElementById('creatorSupport').onclick=()=>{
  document.getElementById('creatorSupportMessage').textContent=(document.getElementById('creatorName').textContent||'크리에이터')+' 작가에게 응원을 전하는 후원 공간입니다.';
  if(!supportDialog.open)supportDialog.showModal();
 };
 document.getElementById('creatorSupportClose').onclick=()=>supportDialog.close();
 supportDialog.addEventListener('click',event=>{if(event.target===supportDialog){const box=supportDialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)supportDialog.close();}});
 document.getElementById('creatorFollow').onclick=async()=>{
  if(!selected||followBusy)return;
  if(!readerIsSignedIn()){rememberCreatorAction(selected.id);openAuthorAuthModal('login','creator');toast('로그인하면 이 작가의 홈으로 돌아옵니다.');return;}
  if(!selected.follow){await openCreator(selected.id);if(!selected?.follow)toast('팔로우 연결을 확인하지 못했습니다. 잠시 후 다시 눌러 주세요.');return;}
  const id=selected.id,viewer=actor(),following=!!selected.follow?.following;
  followBusy=true;renderCreator();
  try{
   const result=following
    ?await PYEODA_SERVER.client.from('book_creator_follows').delete().eq('creator_id',id).eq('reader_id',viewer)
    :await PYEODA_SERVER.client.from('book_creator_follows').insert({creator_id:id,reader_id:viewer});
   if(result.error&&result.error.code!=='23505')throw result.error;
   const {data,error}=await PYEODA_SERVER.client.rpc('get_book_creator_follow_state',{p_creator_id:id});
   if(error)throw error;
   if(selected?.id===id&&actor()===viewer)selected.follow=data;
  }catch(error){console.warn('Creator follow unavailable',error);toast('팔로우를 저장하지 못했습니다. 다시 시도해 주세요.');}
  finally{followBusy=false;renderCreator();}
 };
 const dialog=document.getElementById('creatorEditDialog'),form=document.getElementById('creatorEditForm'),editStatus=document.getElementById('creatorEditStatus');
 let editOwner=null,saving=false;
 document.getElementById('creatorManage').onclick=()=>{
  if(!selected||selected.id!==actor())return;editOwner=actor();
  form.elements.display_name.value=document.getElementById('creatorName').textContent;
  form.elements.bio.value=selected.profile?.bio||'';form.elements.work_note.value=selected.profile?.work_note||'';
  editStatus.textContent='';dialog.showModal();
 };
 document.getElementById('creatorEditClose').onclick=()=>{if(!saving)dialog.close();};
 dialog.addEventListener('cancel',event=>{if(saving)event.preventDefault();});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(saving||!editOwner||editOwner!==actor())return;
  const name=form.elements.display_name.value.trim();if(!name){editStatus.textContent='크리에이터 이름을 입력해 주세요.';return;}
  const row={owner_id:editOwner,display_name:name,bio:form.elements.bio.value.trim(),work_note:form.elements.work_note.value.trim(),updated_at:new Date().toISOString()};
  saving=true;form.querySelector('button[type=submit]').disabled=true;editStatus.textContent='저장 중…';
  try{
   const {error}=await PYEODA_SERVER.client.from('book_creator_profiles').upsert(row,{onConflict:'owner_id'});
   if(error)throw error;if(actor()!==editOwner)return;
   profiles.set(editOwner,row);if(selected?.id===editOwner){selected.profile=row;renderCreator();}renderDirectory();dialog.close();toast('공개 크리에이터 홈을 저장했습니다.');
  }catch(error){console.warn('Creator profile save failed',error);editStatus.textContent='저장하지 못했습니다. 연결을 확인하고 다시 눌러 주세요.';}
  finally{saving=false;form.querySelector('button[type=submit]').disabled=false;}
 });
 // Delegation also covers newly rendered home, search and liked-book cards.
 document.addEventListener('click',event=>{
  const link=event.target.closest('[data-book-creator]');if(!link)return;event.preventDefault();event.stopPropagation();
  const id=link.dataset.bookCreator||catalog().find(b=>b.serverId===link.dataset.bookId)?.creatorId;if(id)openCreator(id);
 });
 document.getElementById('readerCreatorHome').onclick=()=>{const id=currentReaderBook?.creatorId||catalog().find(b=>b.serverId===currentReaderBook?.serverId)?.creatorId;if(id)openCreator(id);};
 new MutationObserver(()=>{
  const id=currentReaderBook?.creatorId||catalog().find(b=>b.serverId===currentReaderBook?.serverId)?.creatorId;
  const button=document.getElementById('readerCreatorHome');button.hidden=!id;button.textContent=(currentReaderBook?.author||'작가')+'의 크리에이터 홈';
 }).observe(document.getElementById('readerBookMeta'),{childList:true,characterData:true,subtree:true});
 let deepLinkDone=false;const deepId=new URLSearchParams(location.search).get('creator');
 window.addEventListener('pyeoda:catalog-updated',()=>{
  refreshDirectory();
  if(!deepLinkDone&&uuid(deepId)){deepLinkDone=true;openCreator(deepId);}
 });
 window.addEventListener('pyeoda:creator-auth-changed',()=>{
  if(editOwner&&editOwner!==actor()){dialog.close();editOwner=null;}
  if(selected){selected.follow=null;renderCreator();if(screen.classList.contains('active'))openCreator(selected.id);}
 });
 refreshDirectory();if(PYEODA_SERVER.connected&&uuid(deepId)){deepLinkDone=true;openCreator(deepId);}
})();


