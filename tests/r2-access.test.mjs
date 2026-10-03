import test from 'node:test';
import assert from 'node:assert/strict';
import { canReadAsset, boundedBytes, imageMime } from '../supabase/functions/manuscript-assets/access.ts';
const id='e1681ea4-7b32-4e76-a640-a4c5d288d1d6';
const book={id:'book',owner_id:'owner',published:true,age_rating:'all'};
const episode={published:true,episode_no:6,price:0,body_html:`<img data-pyeoda-asset="${id}">`};
const context={book,episode,assetId:id,purchases:new Set()};
test('public free image requires a published book, episode and live reference',()=>{
 assert.equal(canReadAsset(context),true);
 for(const changes of [{book:{...book,published:false}},{episode:{...episode,published:false}},{episode:{...episode,body_html:''}},{book:null}])assert.equal(canReadAsset({...context,...changes}),false);
});
test('only the actual author can read draft and unreferenced images',()=>{
 const draft={...context,book:{...book,published:false},episode:null};
 assert.equal(canReadAsset({...draft,user:{id:'owner'}}),true);
 assert.equal(canReadAsset({...draft,user:{id:'other'}}),false);
 assert.equal(canReadAsset({...draft,user:{id:'owner',is_anonymous:true}}),false);
});
test('paid image matches the existing test purchase gate and first five free episodes',()=>{
 const paid={...context,episode:{...episode,price:100}};
 assert.equal(canReadAsset(paid),false);
 assert.equal(canReadAsset({...paid,user:{id:'buyer'},purchases:new Set(['book:book'])}),true);
 assert.equal(canReadAsset({...paid,user:{id:'buyer'},purchases:new Set(['episode:book:6'])}),true);
 assert.equal(canReadAsset({...paid,user:{id:'buyer'},purchases:new Set(['episode:book:7'])}),false);
 assert.equal(canReadAsset({...paid,user:{id:'buyer',is_anonymous:true},purchases:new Set(['book:book'])}),false);
 assert.equal(canReadAsset({...paid,episode:{...paid.episode,episode_no:5}}),true);
});
test('19+ always requires approval and current verification for readers',()=>{
 const adult={...context,book:{...book,age_rating:'19',adult_review_status:'approved'}};
 assert.equal(canReadAsset(adult),false);
 assert.equal(canReadAsset({...adult,user:{id:'reader'},adultVerified:true}),true);
 assert.equal(canReadAsset({...adult,user:{id:'reader'},adultVerified:false}),false);
 assert.equal(canReadAsset({...adult,user:{id:'reader',is_anonymous:true},adultVerified:true}),false);
 assert.equal(canReadAsset({...adult,book:{...adult.book,adult_review_status:'pending'},user:{id:'reader'},adultVerified:true}),false);
});
test('bounded upload protects against absent or dishonest length headers',async()=>{
 assert.deepEqual(await boundedBytes(new Request('https://local',{method:'POST',body:new Uint8Array([1,2,3])}),3),new Uint8Array([1,2,3]));
 await assert.rejects(boundedBytes(new Request('https://local',{method:'POST',headers:{'content-length':'1'},body:new Uint8Array(4)}),3),/SIZE_LIMIT/);
 await assert.rejects(boundedBytes(new Request('https://local',{method:'POST',body:new Uint8Array(0)}),3),/EMPTY/);
});
test('raster signatures reject SVG and HTML masquerading as images',()=>{
 assert.equal(imageMime(new TextEncoder().encode('<svg></svg>')),null);
 assert.equal(imageMime(new Uint8Array([137,80,78,71,13,10,26,10])),'image/png');
 assert.equal(imageMime(new Uint8Array([255,216,255])),'image/jpeg');
 assert.equal(imageMime(new TextEncoder().encode('RIFFxxxxWEBP')),'image/webp');
});
