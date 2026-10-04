/* One book price, private watermarked PDF delivery after server-verified test checkout. */
(()=>{
 const labels={ko:'한국어',en:'영어',ja:'일본어',zh:'중국어',multi:'다국어 통합'};
 const style=document.createElement('style');style.textContent=`.book-file-dialog{width:min(480px,calc(100% - 24px));max-height:85dvh;overflow:auto;padding:22px;border:1px solid var(--line);border-radius:16px;background:var(--paper);color:var(--ink);box-sizing:border-box}.book-file-dialog::backdrop{background:#0006}.book-file-dialog h2{font-size:20px;margin:0 0 12px}.book-file-dialog p{font-size:13px;line-height:1.65}.book-file-dialog label{display:block;font-size:13px;margin:12px 0}.book-file-dialog select,.book-file-dialog input{width:100%;box-sizing:border-box;min-height:42px;padding:8px;margin-top:5px}.book-file-dialog .file-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.book-file-dialog button{min-height:42px;padding:8px 14px;border:1px solid var(--line);border-radius:8px;background:#edf0e5;color:var(--ink);cursor:pointer}.book-file-dialog button:disabled{opacity:.5;cursor:default}.book-file-dialog .file-status{white-space:pre-line}.book-file-dialog ul{padding-left:20px;font-size:13px;line-height:1.8}`;document.head.append(style);
 const dialog=document.createElement('dialog');dialog.className='book-file-dialog';dialog.setAttribute('aria-labelledby','bookDownloadTitle');dialog.innerHTML='<h2 id="bookDownloadTitle">소장하기</h2><p id="bookDownloadPrice"></p><label>PDF 언어<select id="bookDownloadFile" aria-label="다운로드할 책 파일"></select></label><p class="file-status" id="bookDownloadStatus" role="status"></p><div class="file-actions"><button type="button" id="bookDownloadAction" disabled>확인 중</button><button type="button" id="bookDownloadClose">닫기</button></div>';document.body.append(dialog);
 const select=dialog.querySelector('select'),action=dialog.querySelector('#bookDownloadAction'),status=dialog.querySelector('#bookDownloadStatus');let intent=null,catalog=null,busy=false,requestId=0;
 async function api(params,options={}){
  const client=PYEODA_SERVER.client;if(!client)throw new Error('서버 연결 후 다시 시도해 주세요.');
  const {data,error}=await client.auth.getSession();if(error)throw error;
  const headers={apikey:client.supabaseKey||window.PYEODA_SERVER_CONFIG.anonKey,...options.headers};if(data.session?.access_token)headers.Authorization='Bearer '+data.session.access_token;
  const response=await fetch(client.supabaseUrl.replace(/\/$/,'')+'/functions/v1/book-downloads?'+new URLSearchParams(params),{...options,headers});
  if(!response.ok){let message='파일을 불러오지 못했습니다.';try{message=(await response.json()).message||message}catch{}throw new Error(message)}return response;
 }
 function pending(on){busy=on;action.disabled=on||!catalog?.files?.length||(!catalog.canDownload&&catalog.price<100);select.disabled=on;dialog.querySelector('#bookDownloadClose').disabled=on}
 window.openBookOwnership=async value=>{
  intent={...value,bookDownload:true,type:'book'};catalog=null;const ticket=++requestId;status.textContent='파일을 확인하고 있습니다…';select.replaceChildren();dialog.querySelector('#bookDownloadTitle').textContent=value.title||'소장하기';action.textContent='확인 중';if(!dialog.open)dialog.showModal();pending(true);
  if(!value.serverId){status.textContent='서버에 판매 등록된 작품만 소장할 수 있습니다.';pending(false);return}
  try{
   const data=await (await api({action:'list',bookId:value.serverId})).json();if(ticket!==requestId)return;catalog=data;
   dialog.querySelector('#bookDownloadTitle').textContent=data.title;
   dialog.querySelector('#bookDownloadPrice').textContent=Number(data.price).toLocaleString('ko-KR')+'원 · 모든 언어 PDF에 같은 가격';
   for(const file of data.files){const option=document.createElement('option');option.value=file.id;option.textContent=(labels[file.language]||file.language)+' · '+file.format.toUpperCase()+' · '+(file.byte_size/1024/1024).toFixed(1)+'MB';select.append(option)}
   if(value.downloadFileId&&data.files.some(f=>f.id===value.downloadFileId))select.value=value.downloadFileId;
   action.textContent=data.canDownload?'파일 다운로드':'결제하고 소장하기';
   status.textContent=!data.files.length?'작가가 소장용 파일을 준비 중입니다. 파일 등록 후 구매할 수 있습니다.':!data.canDownload&&data.price<100?'소장 가격을 설정한 뒤 구매할 수 있습니다.':data.canDownload?(data.owner?'작가 확인용 워터마크가 들어간 PDF를 내려받습니다.':'소장한 작품입니다. 다른 언어 PDF도 추가 결제 없이 내려받을 수 있습니다. 각 페이지에 구매번호 워터마크가 표시됩니다.'):'테스트 결제 모드입니다. 실제 금액은 청구되지 않습니다. 승인 후 구매번호 워터마크가 들어간 PDF를 내려받을 수 있습니다.';
  }catch(e){if(ticket===requestId)status.textContent=e.message}finally{if(ticket===requestId)pending(false)}
 };
 dialog.querySelector('#bookDownloadClose').onclick=()=>dialog.close();
 dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault()});
 action.onclick=async()=>{
  if(busy||!catalog)return;const file=catalog.files.find(f=>f.id===select.value);if(!file)return;
  if(!catalog.canDownload){
   const purchase={...intent,downloadFileId:file.id};dialog.close();if(requireReaderLoginForPurchase(purchase))openTestPayment(purchase);return;
  }
  pending(true);status.textContent='다운로드 파일을 불러오고 있습니다…';
  try{const response=await api({action:'read',bookId:intent.serverId,id:file.id});const blob=await response.blob();downloadBlobFile(blob,file.filename);status.textContent='워터마크 PDF를 내려받았습니다. 다른 언어 PDF도 선택할 수 있습니다.'}
  catch(e){status.textContent=e.message}finally{pending(false)}
 };
 window.showPurchasedBookDownload=order=>{
  const old=document.getElementById('testPaymentDownload');if(old)old.remove();
  const context=readTestPaymentContext(),purchase=context?.intent;
  if(order?.status!=='confirmed'||order.environment!=='test'||purchase?.type!=='book'||!purchase.serverId)return;
  const b=document.createElement('button');b.type='button';b.id='testPaymentDownload';b.textContent='소장 파일 다운로드';b.onclick=()=>{document.getElementById('testPaymentDialog').close();openBookOwnership(purchase)};document.querySelector('.test-payment-actions').prepend(b);
 };
 const manager=document.createElement('dialog');manager.className='book-file-dialog';manager.innerHTML='<h2>소장 파일 등록</h2><p>완성본 PDF를 등록하세요. 구매자에게 전달할 때 구매번호 워터마크를 넣습니다. 모든 언어 PDF는 같은 소장 가격을 사용합니다. 암호 없는 PDF, 최대 600페이지를 지원합니다.</p><label>언어<select id="bookFileLanguage"><option value="ko">한국어</option><option value="en">영어</option><option value="ja">일본어</option><option value="zh">중국어</option><option value="multi">다국어 통합</option></select></label><label>PDF 파일 (20MB 이하)<input type="file" id="bookFileUpload" accept=".pdf,application/pdf"></label><ul id="bookFileList"></ul><p class="file-status" id="bookFileStatus" role="status"></p><div class="file-actions"><button type="button" id="bookFileSave">판매 파일 등록</button><button type="button" id="bookFileClose">닫기</button></div>';document.body.append(manager);
 let managingBook=null,uploading=false;
 const message=manager.querySelector('#bookFileStatus');
 async function refreshManager(){const data=await (await api({action:'list',bookId:managingBook.serverId})).json();if(!data.owner)throw new Error('본인 작품에만 파일을 등록할 수 있습니다.');const ul=manager.querySelector('ul');ul.replaceChildren();for(const file of data.files){const li=document.createElement('li');li.textContent=(labels[file.language]||file.language)+' · '+file.format.toUpperCase()+' · '+(file.byte_size/1024/1024).toFixed(1)+'MB';ul.append(li)}message.textContent='소장 가격: '+Number(data.price).toLocaleString('ko-KR')+'원'+(data.price<100?'\n책 정보에서 소장 가격을 설정해 주세요.':'')}
 const entry=document.createElement('button');entry.type='button';entry.className='secondary';entry.textContent='소장 파일 등록';entry.onclick=async()=>{if(saveBeforeMobileNavigation()===false)return;managingBook=currentBookData();if(!managingBook.serverId){toast('작품을 서버에 저장한 뒤 파일을 등록해 주세요.');return}manager.showModal();message.textContent='등록 파일을 확인하고 있습니다…';try{await refreshManager()}catch(e){message.textContent=e.message}};document.querySelector('#publishing .publish-center-head')?.append(entry);
 manager.querySelector('#bookFileClose').onclick=()=>manager.close();manager.addEventListener('cancel',e=>{if(uploading)e.preventDefault()});
 manager.querySelector('#bookFileSave').onclick=async()=>{
  if(uploading||!managingBook)return;const file=manager.querySelector('input').files[0],language=manager.querySelector('select').value,format=file?.name.split('.').pop()?.toLowerCase();if(!file||format!=='pdf'){message.textContent='PDF 파일을 선택해 주세요.';return}if(file.size>20*1024*1024){message.textContent='PDF 파일은 20MB 이하로 선택해 주세요.';return}
  uploading=true;for(const b of manager.querySelectorAll('button'))b.disabled=true;message.textContent='파일을 저장하고 확인하고 있습니다…';
  try{await api({action:'upload',bookId:managingBook.serverId,language,format},{method:'POST',headers:{'Content-Type':'application/pdf'},body:file});manager.querySelector('input').value='';await refreshManager();message.textContent+='\n판매 파일을 등록했습니다.'}
  catch(e){message.textContent=e.message}finally{uploading=false;for(const b of manager.querySelectorAll('button'))b.disabled=false}
 };
})();
