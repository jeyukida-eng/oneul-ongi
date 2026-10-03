export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function imageMime(bytes: Uint8Array): string | null {
 if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';
 if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 const text=(start:number,end:number)=>String.fromCharCode(...bytes.slice(start,end));
 if(bytes.length>=12&&text(0,4)==='RIFF'&&text(8,12)==='WEBP')return 'image/webp';
 return null;
}
// This mirrors public-episodes' existing TEST entitlement model. No real-sale
// entitlement is inferred from a test order; switch both endpoints together.
export function canReadAsset({book,episode,user,adultVerified,purchases,assetId}: any): boolean {
 if(!book)return false;
 if(user?.id===book.owner_id&&!user.is_anonymous)return true;
 if(!book.published||!episode?.published)return false;
 if(book.age_rating==='19'&&(book.adult_review_status!=='approved'||!user||user.is_anonymous||!adultVerified))return false;
 const price=episode.episode_no<=5?0:Number(episode.price);
 if(price!==0&&(!user||user.is_anonymous||!(purchases?.has('book:'+book.id)||purchases?.has(`episode:${book.id}:${episode.episode_no}`))))return false;
 // An orphaned/replaced asset cannot be read by guessing its ID.
 return typeof episode.body_html==='string'&&episode.body_html.includes(`data-pyeoda-asset="${assetId}"`);
}
export async function boundedBytes(request: Request, limit: number): Promise<Uint8Array> {
 const declared=Number(request.headers.get('content-length'));
 if(declared>limit)throw new Error('ASSET_SIZE_LIMIT');
 const reader=request.body?.getReader();if(!reader)throw new Error('ASSET_EMPTY');
 const chunks:Uint8Array[]=[];let size=0;
 for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new Error('ASSET_SIZE_LIMIT');}chunks.push(value);}
 if(!size)throw new Error('ASSET_EMPTY');
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes;
}
