import fs from 'node:fs';import {spawnSync} from 'node:child_process';import vm from 'node:vm';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';import {test} from 'node:test';
const variants=['pyeoda/index.html','pyeoda-app/index.html','pyeoda-app/mobile-preview.html','downloads/pyeoda-mobile-latest.html'];
for(const file of variants){
 let source=fs.readFileSync(file,'utf8');if(file.includes('mobile-preview'))source=source.match(/<script[^>]*id=["']mobile-source["'][^>]*>([\s\S]*?)<\/script>/)[1].replaceAll('<\\/script','</script');
 const escape=source.match(/function htmlEscape\(value\)\{[\s\S]*?\n\}/)[0];
 const helpers=source.slice(source.indexOf('function safeImageSource('),source.indexOf('function renderShelf('));
 const c=vm.createContext({URL,location:{href:'https://jeyukida-eng.github.io/oneul-ongi/pyeoda/',origin:'https://jeyukida-eng.github.io'},readingStateFor:()=>null,readLabel:()=> '첫 화 보기',readHint:()=>'',purchasableVersionFor:()=>null,publicMetricForBook:()=>''});vm.runInContext(escape+'\n'+helpers,c);
 test(file+': public metadata cannot create tags or event attributes',()=>{
  const bad='<img src=x onerror="void(0)"><script>void(0)</script>';
  const h=c.cardHTML({title:bad,author:bad,meta:bad,intro:bad,note:bad,cover:'x" onerror="void(0)',serverId:'a" onclick="void(0)'},0,'popular');
  const parsed=spawnSync('python3',['-c',`import sys,json
from html.parser import HTMLParser
class Check(HTMLParser):
 def __init__(self): super().__init__();self.unsafe=[]
 def handle_starttag(self,tag,attrs):
  if tag in ['script','iframe','svg','object']:self.unsafe.append(tag)
  self.unsafe.extend(name for name,value in attrs if name.lower().startswith('on'))
p=Check();p.feed(sys.stdin.read());print(json.dumps(p.unsafe))`],{input:h,encoding:'utf8'});
  assert.equal(parsed.status,0);assert.deepEqual(JSON.parse(parsed.stdout),[]);assert(h.includes('&lt;img'));assert(h.includes('&quot;'));assert(h.includes('소장하기'));
 });
 test(file+': executable image sources are rejected',()=>{for(const bad of ['javascript:void(0)','data:text/html,hi','data:image/svg+xml,<svg/>','blob:https://attacker.invalid/a'])assert.equal(c.safeImageSource(bad),'');assert(c.safeImageSource('data:image/png;base64,aGVsbG8='));assert.equal(c.safeImageSource('https://images.example/a.jpg'),'https://images.example/a.jpg');});
 test(file+': CSP hashes match every executable inline script',()=>{
  const policy=source.match(/name="pyeoda-security-policy"[^>]*content="([^"]+)"/)[1];assert(policy.includes("object-src 'none'"));assert(!policy.match(/script-src[^;]*unsafe-inline/));
  for(const script of source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(script[1].includes('src=')||script[1].includes('text/plain')||!script[2].trim())continue;assert(policy.includes('sha256-'+createHash('sha256').update(script[2]).digest('base64')));new vm.Script(script[2]);}
  assert(source.includes('supabase-js@2.57.4/dist/umd/supabase.min.js'));assert(source.includes('sandbox="allow-same-origin"'));
 });
}
