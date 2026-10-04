export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const LANGUAGES=['ko','en','ja','zh','multi'];
export function publicationMime(bytes:Uint8Array,format:string){
 const text=(a:number,b:number)=>new TextDecoder().decode(bytes.slice(a,b));
 if(format==='pdf'&&bytes.length>=8&&text(0,5)==='%PDF-')return 'application/pdf';
 // EPUB's first ZIP entry must be the uncompressed mimetype with no extra field.
 if(format==='epub'&&bytes.length>=58&&bytes[0]===80&&bytes[1]===75&&bytes[2]===3&&bytes[3]===4&&bytes[8]===0&&bytes[9]===0&&bytes[26]===8&&bytes[27]===0&&bytes[28]===0&&bytes[29]===0&&text(30,38)==='mimetype'&&text(38,58)==='application/epub+zip')return 'application/epub+zip';
 return null;
}
export function canDownload({book,user,orders,adultVerified=false}:any){
 if(!book||!user||user.is_anonymous)return false;
 if(user.id===book.owner_id)return true;
 if(!book.published||!book.completed)return false;
 if(book.age_rating==='19'&&(book.adult_review_status!=='approved'||!adultVerified))return false;
 // This endpoint matches the existing TEST checkout. Test access is never a live-sale entitlement.
 return orders?.some((o:any)=>o.buyer_id===user.id&&o.book_id===book.id&&o.product_key==='book:'+book.id&&o.status==='confirmed'&&o.environment==='test')===true;
}
export async function boundedBytes(req:Request,limit:number){
 if(Number(req.headers.get('content-length'))>limit)throw new Error('FILE_TOO_LARGE');
 const reader=req.body?.getReader();if(!reader)throw new Error('EMPTY_FILE');
 const parts:Uint8Array[]=[];let size=0;
 for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new Error('FILE_TOO_LARGE')}parts.push(value)}
 if(!size)throw new Error('EMPTY_FILE');const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length}return bytes;
}
