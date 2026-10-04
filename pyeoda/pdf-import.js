/* Local PDF import. PDF scripts, links and attachments are never executed/imported. */
(()=>{
 const script=document.currentScript;
 const base=new URL('vendor/pdfjs/',script?.src||new URL('https://jeyukida-eng.github.io/oneul-ongi/pyeoda/pdf-import.js'));
 let loader;
 async function engine(){
  if(!loader)loader=(async()=>{
   const lib=window.PyeodaPdfJs||await import(new URL('pdf.min.mjs',base).href);
   lib.GlobalWorkerOptions.workerSrc=window.PyeodaPdfWorker||new URL('pdf.worker.min.mjs',base).href;
   const assets=window.PyeodaPdfAssets||await fetch(new URL('assets.json',base)).then(r=>{if(!r.ok)throw Error('PDF 읽기 도구를 불러오지 못했습니다.');return r.json()});
   class BinaryDataFactory{async fetch({kind,filename}){
    const encoded=assets[kind]?.[filename];if(!encoded)throw Error('PDF 글꼴 또는 이미지 형식을 읽지 못했습니다.');
    return Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
   }}
   return {lib,BinaryDataFactory};
  })().catch(error=>{loader=null;throw error});
  return loader;
 }
 function pageText(items){
  let text='',last=null;
  for(const item of items){
   if(typeof item.str!=='string')continue;
   const t=item.transform||[1,0,0,1,0,0],height=Math.max(1,Math.abs(item.height||t[3]||10));
   if(last&&item.str){
    const dy=Math.abs(t[5]-last.y),gap=t[4]-last.end;
    if(dy>Math.max(height,last.height)*.5){if(!text.endsWith('\n'))text+='\n';if(dy>Math.max(height,last.height)*1.8&&!text.endsWith('\n\n'))text+='\n'}
    else if(gap>height*.15&&!/\s$/.test(text)&&!/^\s/.test(item.str))text+=' ';
   }
   text+=item.str;
   last={y:t[5],end:t[4]+(item.width||0),height};
   if(item.hasEOL&&!text.endsWith('\n'))text+='\n';
  }
  return text.replace(/\u0000/g,'').trim();
 }
 // Export the pure extractor for regression tests, without granting editor access.
 window.PyeodaPdfImportText=pageText;
 const group=document.querySelector('.markdown-import-tools');if(!group)return;
 const button=document.createElement('button');button.type='button';button.textContent='PDF 불러오기';button.id='importPdfDraft';button.className='btn';
 const input=document.createElement('input');input.type='file';input.accept='.pdf,application/pdf';input.hidden=true;
 group.prepend(button,input);
 const hint=group.querySelector('span');if(hint)hint.textContent='MD는 현재 회차에, PDF는 확인 후 새 회차로 가져옵니다.';
 // Desktop: direct access without adding a fifth button to the writing header.
 const side=document.querySelector('.web-writer-side');if(side){const shortcut=button.cloneNode(true);shortcut.removeAttribute('id');shortcut.onclick=()=>button.click();side.insertBefore(shortcut,side.querySelector('.web-writer-note'))}
 const style=document.createElement('style');style.textContent=`
 .pdf-import-dialog{width:min(680px,calc(100vw - 24px));max-height:calc(100dvh - 32px);box-sizing:border-box;border:1px solid var(--line,#ddd);border-radius:14px;padding:20px;background:#fffdf8;color:#34372e;overflow:auto;overscroll-behavior:contain}
 .pdf-import-dialog::backdrop{background:rgba(24,28,20,.45)}
 .pdf-import-dialog h2{margin:0 0 8px;font-size:20px}.pdf-import-dialog p{font-size:13px;line-height:1.6;margin:8px 0;color:#73776b}
 .pdf-import-controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:12px 0}.pdf-import-controls label{font-size:13px}.pdf-import-controls input[type=number]{width:58px;padding:6px}
 .pdf-import-preview{height:clamp(160px,38dvh,350px);overflow:auto;border:1px solid #dedfd5;border-radius:8px;padding:12px;background:white;white-space:pre-wrap;line-height:1.7;overscroll-behavior:contain}
 .pdf-import-preview img{display:block;max-width:100%;max-height:270px;margin:auto;object-fit:contain}.pdf-import-dialog footer{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}.pdf-import-dialog footer button{min-height:38px;padding:6px 14px}
 `;document.head.append(style);
 const dialog=document.createElement('dialog');dialog.className='pdf-import-dialog';dialog.setAttribute('aria-labelledby','pdfImportHeading');
 dialog.innerHTML='<h2 id="pdfImportHeading">PDF 불러오기</h2><p data-name></p><p data-status role="status" aria-live="polite"></p><div class="pdf-import-controls"><label><input type="radio" name="pdfImportMode" value="text" checked> 편집 가능한 본문</label><label><input type="radio" name="pdfImportMode" value="images"> 페이지 이미지</label></div><div class="pdf-import-controls"><label>시작 페이지 <input data-first type="number" min="1" value="1"></label><label>끝 페이지 <input data-last type="number" min="1" value="1"></label></div><p data-help>본문은 새 회차 하나에, 이미지는 페이지마다 새 회차에 넣습니다. 기존 원고는 그대로 보존됩니다.</p><div class="pdf-import-preview" tabindex="0" aria-label="가져올 원고 미리보기"></div><footer><button type="button" data-cancel>취소</button><button type="button" data-import disabled>새 회차로 가져오기</button></footer>';
 document.body.append(dialog);
 const status=dialog.querySelector('[data-status]'),preview=dialog.querySelector('.pdf-import-preview'),first=dialog.querySelector('[data-first]'),last=dialog.querySelector('[data-last]'),commit=dialog.querySelector('[data-import]');
 let session=null,previewToken=0;
 function busy(){return manuscriptImportBusy||manuscriptImageBusy||manualEpisodeSaveBusy||manuscriptComposing}
 function mode(){return dialog.querySelector('input[name=pdfImportMode]:checked').value}
 function range(){const a=Number(first.value),b=Number(last.value);if(!session?.pdf||!Number.isInteger(a)||!Number.isInteger(b)||a<1||b<a||b>session.pdf.numPages)throw Error('가져올 페이지 범위를 확인해 주세요.');return [a,b]}
 function ensure(s){if(session!==s||s.cancelled)throw Error('가져오기를 취소했습니다.');if(manuscriptImportContext()!==s.context)throw Error('책이나 회차가 바뀌었습니다. PDF를 다시 선택해 주세요.')}
 async function cleanup(){const old=session;session=null;previewToken++;if(old){old.cancelled=true;try{await old.task?.destroy()}catch(_){}}preview.replaceChildren();input.value='';button.disabled=false}
 dialog.addEventListener('close',cleanup);
 dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
 async function pageImage(s,no,edge=1200){
  ensure(s);const page=await s.pdf.getPage(no),original=page.getViewport({scale:1});
  if(!Number.isFinite(original.width)||!Number.isFinite(original.height)||original.width<=0||original.height<=0)throw Error('PDF 페이지 크기를 읽지 못했습니다.');
  const viewport=page.getViewport({scale:Math.min(2,edge/Math.max(original.width,original.height))}),canvas=document.createElement('canvas');
  canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
  try{
   await page.render({canvasContext:canvas.getContext('2d'),viewport,background:'#ffffff',annotationMode:0}).promise;ensure(s);
   for(const quality of [.88,.72,.55]){const src=canvas.toDataURL('image/jpeg',quality);if(src.length<=390000)return {src,width:canvas.width,height:canvas.height}}
   throw Error('페이지 그림 용량이 큽니다. PDF 이미지 해상도를 줄여 주세요.');
  }finally{canvas.width=canvas.height=0;page.cleanup()}
 }
 async function updatePreview(){
  const s=session;if(!s?.pdf||s.importing)return;const token=++previewToken;commit.disabled=true;preview.replaceChildren();
  try{
   const [a,b]=range();status.textContent=`전체 ${s.pdf.numPages}쪽 · ${a}–${b}쪽 선택`;
   if(mode()==='text'){
    const empty=s.texts.slice(a-1,b).filter(t=>!t.trim()).length;
    if(empty){status.textContent+=` · 글자가 없는 페이지 ${empty}쪽: 페이지 이미지로 가져오세요.`;return}
    const text=s.texts.slice(a-1,b).join('\n\n');if(text.length>500000)throw Error('본문이 많습니다. 페이지 범위를 나누어 가져와 주세요.');preview.textContent=text;
    dialog.querySelector('[data-help]').textContent='추출한 글을 새 회차 하나에 넣습니다. 표·단 나누기·장식은 달라질 수 있으니 가져온 뒤 확인해 주세요.';
   }else{
    if(b-a+1>20)throw Error('페이지 이미지는 한 번에 20쪽까지 선택해 주세요.');
    dialog.querySelector('[data-help]').textContent='그림과 글을 함께 보존하고 페이지 순서대로 새 회차를 만듭니다. 이미지 속 글은 편집되지 않습니다. 스캔 글자 인식(OCR)은 아직 지원하지 않습니다.';
    const image=await pageImage(s,a,800);if(token!==previewToken||session!==s)return;
    const img=document.createElement('img');img.src=image.src;img.alt=`${a}쪽 미리보기`;preview.append(img);
   }
   if(token===previewToken&&session===s)commit.disabled=false;
  }catch(error){if(token===previewToken&&session===s)status.textContent=error.message}
 }
 for(const el of dialog.querySelectorAll('input'))el.addEventListener('change',updatePreview);
 async function open(file){
  if(busy()){toast('입력과 저장을 마친 뒤 PDF를 불러와 주세요.');return}
  if(!String(currentBookData()?.title||'').trim()||!findEpisode(currentEpisodeNo)){toast('먼저 책과 작성할 회차를 선택해 주세요.');return}
  if(isBookCompleted()){toast('새 회차를 넣으려면 먼저 작품의 완결을 취소해 주세요.');return}
  if(!/\.pdf$/i.test(file?.name||'')||file.size>20*1024*1024){toast('20MB 이하의 PDF 파일을 선택해 주세요.');return}
  if(dialog.open)return;
  const s=session={context:manuscriptImportContext(),file,cancelled:false,texts:[],pdf:null,task:null};button.disabled=true;commit.disabled=true;
  document.querySelector('.mobile-writing-tools[open]')?.close();
  dialog.querySelector('[data-name]').textContent=file.name;status.textContent='PDF를 읽고 있습니다…';dialog.showModal();
  try{
   const {lib,BinaryDataFactory}=await engine();ensure(s);const data=new Uint8Array(await file.arrayBuffer());ensure(s);
   if(!new TextDecoder().decode(data.subarray(0,1024)).includes('%PDF-'))throw Error('올바른 PDF 파일이 아닙니다.');
   s.task=lib.getDocument({data,BinaryDataFactory,useWorkerFetch:false,isEvalSupported:false,stopAtErrors:true,enableXfa:false,maxImageSize:16000000,useWasm:true});
   s.pdf=await s.task.promise;ensure(s);
   if(s.pdf.numPages>200)throw Error('PDF는 200쪽 이하로 나누어 불러와 주세요.');
   for(let no=1;no<=s.pdf.numPages;no++){ensure(s);status.textContent=`글자 확인 중 · ${no}/${s.pdf.numPages}쪽`;const page=await s.pdf.getPage(no);s.texts.push(pageText((await page.getTextContent()).items));page.cleanup()}
   first.value=1;last.value=s.pdf.numPages;first.max=last.max=s.pdf.numPages;
   const hasEmpty=s.texts.some(t=>!t.trim());dialog.querySelector(`input[value="${hasEmpty?'images':'text'}"]`).checked=true;
   if(hasEmpty&&s.pdf.numPages>20)last.value=20;
   await updatePreview();
  }catch(error){if(session===s){status.textContent=error.name==='PasswordException'?'암호가 설정된 PDF입니다. 암호를 해제한 파일을 넣어 주세요.':error.message||'PDF를 읽지 못했습니다.';commit.disabled=true}}
 }
 button.onclick=()=>{input.value='';input.click()};input.onchange=()=>{const file=input.files?.[0];input.value='';if(file)open(file)};
 const panel=body.closest('.panel.editor');panel?.addEventListener('drop',event=>{
  const files=Array.from(event.dataTransfer?.files||[]);if(!files.some(f=>/\.pdf$/i.test(f.name)))return;
  event.preventDefault();event.stopImmediatePropagation();panel.classList.remove('markdown-drop-active');
  if(files.length!==1){toast('PDF는 한 번에 하나씩 넣어 주세요.');return}open(files[0]);
 },true);
 commit.onclick=async()=>{
  const s=session;if(!s||s.importing||busy())return;
  let old=null,oldNo=currentEpisodeNo,saved=false;
  try{
   ensure(s);if(isBookCompleted())throw Error('작품의 완결을 취소한 뒤 가져와 주세요.');const [a,b]=range(),selectedMode=mode();
   s.importing=true;manuscriptImportBusy=true;commit.disabled=true;
   for(const control of dialog.querySelectorAll('input'))control.disabled=true;
   const drafts=[];
   if(selectedMode==='text'){
    const texts=s.texts.slice(a-1,b);if(texts.some(t=>!t.trim()))throw Error('글자가 없는 페이지가 있습니다. 페이지 이미지로 가져와 주세요.');
    const text=texts.join('\n\n');if(text.length>500000)throw Error('페이지 범위를 나누어 가져와 주세요.');
    drafts.push({title:s.file.name.replace(/\.pdf$/i,''),body:text,bodyHtml:''});
   }else{
    if(b-a+1>20)throw Error('페이지 이미지는 한 번에 20쪽까지 선택해 주세요.');
    let total=0;
    for(let no=a;no<=b;no++){
     status.textContent=`페이지 준비 중 · ${no-a+1}/${b-a+1}쪽`;const image=await pageImage(s,no);total+=image.src.length;
     if(total>3000000)throw Error('그림 용량이 많습니다. 페이지 범위를 줄여 나누어 가져와 주세요.');
     const block=document.createElement('div'),img=document.createElement('img');img.src=image.src;img.width=image.width;img.height=image.height;img.alt=`PDF ${no}쪽`;block.append(img);
     drafts.push({title:`${s.file.name.replace(/\.pdf$/i,'')} · ${no}쪽`,body:'',bodyHtml:block.outerHTML});
    }
   }
   ensure(s);if(manualEpisodeSaveBusy||manuscriptImageBusy||manuscriptComposing)throw Error('입력과 저장을 마친 뒤 다시 가져와 주세요.');
   // Validate and persist the live draft first, then atomically append new unpublished episodes.
   if(!saveCurrentEpisode())throw Error('현재 원고를 먼저 저장해 주세요.');oldNo=currentEpisodeNo;
   old=episodes.map(ep=>({...ep}));const start=Math.max(0,...episodes.map(ep=>Number(ep.no)||0))+1;
   const added=drafts.map((draft,i)=>({...draft,no:start+i,published:false,price:start+i<=5?0:preferredPaidEpisodePrice()}));
   episodes=[...episodes,...added];persistEpisodes();saved=true;
   openEpisode(start,false);dialog.close();focusNewEpisodeWriting();
   editorStatus.textContent='PDF 불러옴 · 이 기기에 저장됨 · 공개 전';toast(`${added.length}개 새 회차로 가져왔습니다. 서버 반영은 각 회차에서 저장 버튼을 눌러 주세요.`);
  }catch(error){
   if(old&&!saved){episodes=old;try{persistEpisodes()}catch(_){}openEpisode(oldNo,false)}
   if(session===s)status.textContent=(error.name==='QuotaExceededError'?'기기 저장 공간이 부족합니다. 페이지를 나누어 가져와 주세요.':error.message)||'PDF를 가져오지 못했습니다.';
  }finally{
   manuscriptImportBusy=false;s.importing=false;
   for(const control of dialog.querySelectorAll('input'))control.disabled=false;
   if(session===s&&!s.cancelled)commit.disabled=false;
  }
 };
})();
