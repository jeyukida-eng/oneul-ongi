import {PDFDocument,StandardFonts,rgb,degrees,pushGraphicsState,popGraphicsState,concatTransformationMatrix} from 'npm:pdf-lib@1.17.1';
export const PDF_LIMIT=20*1024*1024;
export const PAGE_LIMIT=600;
export async function loadPublication(bytes:Uint8Array){
 if(bytes.length>PDF_LIMIT)throw new Error('FILE_TOO_LARGE');
 try{
 const doc=await PDFDocument.load(bytes,{updateMetadata:false});
 if(doc.isEncrypted||doc.getPageCount()<1||doc.getPageCount()>PAGE_LIMIT)throw new Error('INVALID_PDF');
 for(const page of doc.getPages()){
  const box=page.getCropBox();
  if(![box.x,box.y,box.width,box.height].every(Number.isFinite)||box.width<72||box.height<72||box.width>14400||box.height>14400)throw new Error('INVALID_PDF');
 }
 return doc;
 }catch{throw new Error('INVALID_PDF');}
}
export async function watermarkPdf(bytes:Uint8Array,reference:string){
 // Only server-derived order UUIDs or the owner's preview label may enter the PDF.
 if(!/^(ORDER [0-9a-f-]{36}|AUTHOR PREVIEW)$/.test(reference))throw new Error('INVALID_REFERENCE');
 const doc=await loadPublication(bytes),font=await doc.embedFont(StandardFonts.Helvetica);
 const mark='PYEODA | '+reference;
 for(const [i,page] of doc.getPages().entries()){
  const {x,y,width:w,height:h}=page.getCropBox(),rotation=((page.getRotation().angle%360)+360)%360;
  const width=rotation%180?h:w,height=rotation%180?w:h;
  const matrix=rotation===90?[0,1,-1,0,x+w,y]:rotation===180?[-1,0,0,-1,x+w,y+h]:rotation===270?[0,-1,1,0,x,y+h]:[1,0,0,1,x,y];
  page.pushOperators(pushGraphicsState(),concatTransformationMatrix(...matrix as [number,number,number,number,number,number]));
  const size=Math.min(23,(width*.82)/font.widthOfTextAtSize(mark,1)),length=font.widthOfTextAtSize(mark,size);
  page.drawText(mark,{x:(width-length*Math.cos(Math.PI/6))/2,y:height/2-length*.25,font,size,rotate:degrees(30),color:rgb(.35,.35,.35),opacity:.12});
  const footer=mark+' | PERSONAL COPY | '+(i+1)+'/'+doc.getPageCount();
  const footerSize=Math.min(7,(width-24)/font.widthOfTextAtSize(footer,1));
  page.drawRectangle({x:0,y:0,width,height:14,color:rgb(1,1,1),opacity:.78});
  page.drawText(footer,{x:(width-font.widthOfTextAtSize(footer,footerSize))/2,y:4,font,size:footerSize,color:rgb(.3,.3,.3),opacity:.85});
  page.pushOperators(popGraphicsState());
 }
 return doc.save({useObjectStreams:true,objectsPerTick:40});
}
