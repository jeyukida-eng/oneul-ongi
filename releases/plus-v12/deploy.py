from pathlib import Path
import base64,brotli,hashlib,io,tarfile,re
root=Path('.')
parts=[(root/f'releases/plus-v12/part-{i}.b64').read_text().strip() for i in range(5)]
data=base64.b64decode(''.join(parts),validate=True)
expected='e9032637ec105a60173f138b02cabf5eaf7fd53f1ff173e0e35d65d24f89c722'
assert hashlib.sha256(data).hexdigest()==expected,'Archive verification failed'
raw=brotli.decompress(data)
with tarfile.open(fileobj=io.BytesIO(raw),mode='r:') as tar:
 assert set(tar.getnames())=={'premium-v12.js','premium-v12.css'},tar.getnames()
 for item in tar:
  assert item.isfile() and '/' not in item.name
  (root/item.name).write_bytes(tar.extractfile(item).read())
app=(root/'app.js').read_text()
old='<button type="button" class="dock-item" data-reward-action="open"><svg'
new='<button type="button" class="dock-item" data-premium-action="open"><svg'
assert app.count(old)==1, 'Unexpected dock nav version'
app=app.replace(old,new)
clear="localStorage.removeItem('oneul-ongi-simple-v2');state=emptyState();"
assert clear in app, 'Missing clear action'
app=app.replace(clear,"localStorage.removeItem('oneul-ongi-simple-v2');localStorage.removeItem('oneul-ongi-premium-v1');state=emptyState();")
needle='  renderHome();\n  window.__ongiV6Checks='
assert app.count(needle)==1, 'Missing safe refresh insertion point'
app=app.replace(needle,"  renderHome();\n  window.__ongiPremiumRefresh=()=>{state=readState();const r=entry();chosen=validMoods.includes(r?.mood)?r.mood:null;draft=r?.note||'';renderHome();};\n  window.__ongiV6Checks=")
(root/'app.js').write_text(app)
index=(root/'index.html').read_text()
style='<link rel="stylesheet" href="./achievements-v7.css">'
source='<script src="./achievements-v7.js" defer></script>'
assert index.count(style)==1 and index.count(source)==1,'Unexpected index version'
index=index.replace(style,style+'\n  <link rel="stylesheet" href="./premium-v12.css">')
index=index.replace(source,'<script src="./premium-v12.js" defer></script>\n  '+source)
(root/'index.html').write_text(index)
sw=(root/'sw.js').read_text()
sw,n=re.subn(r'oneul-ongi-v\d+(?:\.\d+)*(?:-[\w-]+)?','oneul-ongi-v12.0.0-premium-preview',sw,count=1)
assert n==1, 'Unknown service worker version'
assert sw.count("'./achievements-v7.css'")==1
sw=sw.replace("'./achievements-v7.css'","'./achievements-v7.css','./premium-v12.css','./premium-v12.js'")
(root/'sw.js').write_text(sw)
readme=root/'README.md'
readme.write_text(readme.read_text()+'\n\n## v12 PLUS (preview only)\n\nBottom 온기 navigation opens a four-screen premium preview: personalized mission, 7/30-day growth report, 7/21/30-day challenge and printable 7/30/100-day record booklet. All data is stored on-device. Monthly ₩2,900 is an intended price; billing, subscriptions and server sync are not connected.\n')
print('Verified archive SHA256',expected,'and deployed premium source files')
