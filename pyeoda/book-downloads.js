/* Automatic PDF ownership: approved book -> source/translation -> PDF -> server watermark. */
(()=>{
 const labels={ko:'한국어',en:'영어',ja:'일본어',zh:'중국어'};
 const style=document.createElement('style');style.textContent=`.book-file-dialog{width:min(480px,calc(100% - 24px));max-height:85dvh;overflow:auto;padding:22px;border:1px solid var(--line);border-radius:16px;background:var(--paper);color:var(--ink);box-sizing:border-box}.book-file-dialog::backdrop{background:#0006}.book-file-dialog h2{font-size:20px;margin:0 0 12px}.book-file-dialog p{font-size:13px;line-height:1.65}.book-file-dialog label{display:block;font-size:13px;margin:12px 0}.book-file-dialog select{width:100%;box-sizing:border-box;min-height:42px;padding:8px;margin-top:5px}.book-file-dialog .file-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.book-file-dialog button{min-height:42px;padding:8px 14px;border:1px solid var(--line);border-radius:8px;background:#edf0e5;color:var(--ink);cursor:pointer}.book-file-dialog button:disabled{opacity:.5;cursor:default}.book-file-dialog .file-status{white-space:pre-line}`;document.head.append(style);
 const dialog=document.createElement('dialog');dialog.className='book-file-dialog';dialog.setAttribute('aria-labelledby','bookDownloadTitle');dialog.innerHTML='<h2 id="bookDownloadTitle">소장하기</h2><p id="bookDownloadPrice"></p><label>다운로드 언어<select id="bookDownloadFile" aria-label="PDF 언어"></select></label><p class="file-status" id="bookDownloadStatus" role="status"></p><div class="file-actions"><button type="button" id="bookDownloadAction" disabled>확인 중</button><button type="button" id="bookDownloadClose">닫기</button></div>';document.body.append(dialog);
 const select=dialog.querySelector('select'),action=dialog.querySelector('#bookDownloadAction'),status=dialog.querySelector('#bookDownloadStatus'),close=dialog.querySelector('#bookDownloadClose');let intent=null,catalog=null,busy=false,requestId=0,cancelled=false;
 async function api(params,options={}){
  const client=PYEODA_SERVER.client;if(!client)throw new Error('서버 연결 후 다시 시도해 주세요.');
  const {data,error}=await client.auth.getSession();if(error)throw error;
  const headers={apikey:client.supabaseKey||window.PYEODA_SERVER_CONFIG.anonKey,...options.headers};if(data.session?.access_token)headers.Authorization='Bearer '+data.session.access_token;
  const response=await fetch(client.supabaseUrl.replace(/\/$/,'')+'/functions/v1/book-downloads?'+new URLSearchParams(params),{...options,headers});
  if(!response.ok){let message='PDF를 생성하지 못했습니다.';try{message=(await response.json()).message||message}catch{}throw new Error(message)}return response;
 }
 function pending(on){busy=on;action.disabled=on||!catalog?.hasSource||(!catalog.canDownload&&catalog.price<100);select.disabled=on;close.textContent=on?'생성 중단':'닫기'}
 function checkCancelled(){if(cancelled)throw new Error('생성을 중단했습니다. 다시 누르면 완료된 번역부터 이어서 진행합니다.')}
 window.openBookOwnership=async value=>{
  intent={...value,bookDownload:true,automaticPdf:true,type:'book'};delete intent.downloadFileId;catalog=null;const ticket=++requestId;cancelled=false;status.textContent='소장 정보를 확인하고 있습니다…';select.replaceChildren();dialog.querySelector('#bookDownloadTitle').textContent=value.title||'소장하기';action.textContent='확인 중';if(!dialog.open)dialog.showModal();pending(true);
  if(!value.serverId){status.textContent='서버에 공개된 완결 작품만 소장할 수 있습니다.';pending(false);return}
  try{
   const data=await(await api({action:'catalog',bookId:value.serverId})).json();if(ticket!==requestId)return;catalog=data;
   dialog.querySelector('#bookDownloadTitle').textContent=data.title;dialog.querySelector('#bookDownloadPrice').textContent=data.price>=100?Number(data.price).toLocaleString('ko-KR')+'원 · 모든 언어 PDF에 같은 가격':'소장 가격 준비 중';
   for(const lang of data.languages){const option=document.createElement('option');option.value=lang;option.textContent=labels[lang]+' PDF'+(lang!=='ko'?' · 자동 번역':'');select.append(option)}
   select.value=data.languages.includes(value.downloadLanguage)?value.downloadLanguage:'ko';
   action.textContent=data.canDownload?'PDF 생성·다운로드':'결제하고 소장하기';
   status.textContent=!data.hasSource?'공개된 원고가 없습니다.':!data.canDownload&&data.price<100?'작가가 소장 가격을 설정하면 구매할 수 있습니다.':data.canDownload?'선택한 언어로 PDF를 자동 생성합니다. 모든 페이지에 구매번호 워터마크가 표시됩니다.\n다른 언어도 추가 결제 없이 받을 수 있습니다.':'테스트 결제 모드입니다. 실제 금액은 청구되지 않습니다.\n승인 후 선택한 언어의 워터마크 PDF를 자동 생성합니다.';
   if(!data.translationAvailable)status.textContent+='\n외국어 자동 번역 연결이 준비 중입니다. 한국어 PDF는 생성할 수 있습니다.';
  }catch(e){if(ticket===requestId)status.textContent=e.message}finally{if(ticket===requestId)pending(false)}
  if(ticket===requestId&&value.generateNow&&catalog?.canDownload&&catalog.hasSource)await generateDownload();
 };
 close.onclick=()=>{if(busy){cancelled=true;close.disabled=true;status.textContent='현재 처리 중인 단계가 끝나면 중단합니다…';}else dialog.close()};
 dialog.addEventListener('cancel',e=>{if(busy){e.preventDefault();cancelled=true;}});
 function buildPages(publication,items,lang){
  const spec=localPdfSpec(lang),pages=[],translated=new Map(items.map(x=>[x.id,x.text]));
  const text=item=>{if(lang!=='ko'&&!['image','author'].includes(item.type)&&!translated.has(item.id))throw new Error('번역 일부가 누락되었습니다. 다시 생성해 주세요.');return translated.get(item.id)||item.text;};
  const title=publication.items.find(x=>x.type==='title'),author=publication.items.find(x=>x.type==='author');
  const cover=safeImageSource(publication.cover||'');
  if(cover)pages.push(`<div style="height:100%;display:flex;align-items:center;justify-content:center"><img src="${htmlEscape(cover)}" style="max-width:100%;max-height:100%;object-fit:contain" alt=""/></div>`);
  pages.push(`<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center"><h1 style="font-size:34px;line-height:1.4;margin:0 0 18px">${htmlEscape(text(title))}</h1><div>${htmlEscape(author?.text||'')}</div><div style="margin-top:32px;font-size:12px;color:#777">${labels[lang]}${lang!=='ko'?' · AI 번역본':''}</div></div>`);
  const sections={ko:['책 소개','작가의 말','화'],en:['About this book',"Author's note",'Chapter'],ja:['本の紹介','著者より','章'],zh:['内容简介','作者的话','章']}[lang];
  let paras=[],heading=null;
  const flush=()=>{if(paras.length||heading)paginateLocalParagraphs(paras,spec,lang,pages,heading);paras=[];heading=null;};
  for(const item of publication.items){
   if(['title','author'].includes(item.type))continue;
   if(item.type==='chapter'){flush();heading=localPdfHeading(text(item),lang==='ko'?item.no+'화':sections[2]+' '+item.no);continue;}
   if(item.type==='intro'||item.type==='note'){flush();heading=localPdfHeading(item.type==='intro'?sections[0]:sections[1]);paras.push({type:'narration',text:text(item)});flush();continue;}
   if(item.type==='image'){
    flush();const asset=item.assetId&&PyeodaAssets.UUID.test(item.assetId),src=asset?PyeodaAssets.PLACEHOLDER:safeImageSource(item.src||'');
    if(!src)throw new Error('원고 그림을 불러오지 못했습니다. 그림을 확인한 뒤 다시 생성해 주세요.');
    pages.push(`<div style="height:100%;display:flex;align-items:center;justify-content:center"><img ${asset?'data-pyeoda-asset="'+item.assetId+'"':''} src="${htmlEscape(src)}" style="max-width:100%;max-height:100%;object-fit:contain" alt=""/></div>`);continue;
   }
   const content=text(item);paras.push({type:/^[“"「『]/.test(content)?'dialogue':'narration',text:content});
  }flush();if(pages.length>600)throw new Error('PDF가 600페이지를 넘었습니다. 관리자에게 문의해 주세요.');return {pages,spec,title:text(title)};
 }
 async function generateDownload(){
  if(busy||!catalog?.canDownload)return;
  const lang=select.value;if(!labels[lang])return;
  if(lang!=='ko'&&!catalog.translationAvailable){status.textContent='자동 번역 연결이 준비되지 않았습니다. 한국어 PDF는 내려받을 수 있습니다.';return;}
  pending(true);cancelled=false;close.disabled=false;
  try{
   status.textContent='저장된 원고를 불러오는 중…';const source=await(await api({action:'source',bookId:intent.serverId})).json();checkCancelled();
   const translated=[];
   if(lang!=='ko')for(let i=0;i<source.chunkCount;i++){
    checkCancelled();status.textContent=labels[lang]+` 번역 ${i+1}/${source.chunkCount} · 첫 생성은 시간이 걸릴 수 있습니다.`;
    let part;
    for(;;){checkCancelled();part=await(await api({action:'translate',bookId:intent.serverId,language:lang,chunk:i,sourceHash:source.sourceHash},{method:'POST'})).json();if(!part.processing)break;await new Promise(r=>setTimeout(r,1000));}
    translated.push(...part.items);
   }
   checkCancelled();const built=buildPages(source.publication,translated,lang),images=[];
   for(let i=0;i<built.pages.length;i++){
    checkCancelled();status.textContent=`${labels[lang]} PDF 생성 ${i+1}/${built.pages.length}쪽`;
    images.push(await svgMarkupToJpeg(localPdfPageSvg(built.pages[i],built.spec,lang),900,1350,.88));
    if(i%3===0)await new Promise(r=>setTimeout(r,0));
   }
   checkCancelled();const pdf=buildJpegPdf(images,432,648);if(pdf.size>20*1024*1024)throw new Error('생성된 PDF가 20MB를 넘었습니다. 관리자에게 문의해 주세요.');
   images.length=0;status.textContent='구매번호 워터마크를 넣는 중…';
   const response=await api({action:'stamp',bookId:intent.serverId},{method:'POST',headers:{'Content-Type':'application/pdf'},body:pdf});checkCancelled();
   downloadBlobFile(await response.blob(),sanitizeDownloadName(built.title)+'_'+lang+'.pdf');
   status.textContent=labels[lang]+' 워터마크 PDF를 내려받았습니다. 다른 언어도 추가 결제 없이 생성할 수 있습니다.';
  }catch(e){status.textContent=e.message}finally{close.disabled=false;pending(false)}
 }
 action.onclick=async()=>{
  if(busy||!catalog?.hasSource)return;
  if(catalog.canDownload)return generateDownload();
  if(select.value!=='ko'&&!catalog.translationAvailable){status.textContent='자동 번역 연결이 준비되지 않았습니다. 한국어 PDF를 선택해 주세요.';return;}
  const purchase={...intent,automaticPdf:true,downloadLanguage:select.value};delete purchase.downloadFileId;dialog.close();if(requireReaderLoginForPurchase(purchase))openTestPayment(purchase);
 };
 window.showPurchasedBookDownload=order=>{
  document.getElementById('testPaymentDownload')?.remove();const purchase=readTestPaymentContext()?.intent;
  if(order?.status!=='confirmed'||order.environment!=='test'||purchase?.type!=='book'||!purchase.serverId)return;
  const b=document.createElement('button');b.type='button';b.id='testPaymentDownload';b.textContent='소장 PDF 다운로드';b.onclick=()=>{document.getElementById('testPaymentDialog').close();openBookOwnership(purchase)};document.querySelector('.test-payment-actions').prepend(b);
  if(purchase.automaticPdf)setTimeout(()=>{const payment=document.getElementById('testPaymentDialog');if(payment.open){payment.close();openBookOwnership({...purchase,generateNow:true});}},0);
 };
})();
