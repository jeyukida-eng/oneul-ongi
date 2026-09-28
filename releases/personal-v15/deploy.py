from pathlib import Path
import base64, brotli, hashlib, io, tarfile, re
root=Path('.')
parts=[(root/f'releases/personal-v15/part-{i}.b64').read_text().strip() for i in range(6)]
payload=base64.b64decode(''.join(parts),validate=True)
expected='be601a4dc57fc807d9c7a6aad804ba3dcb529d0a3cba6ce03c6edac7261a800b'
assert hashlib.sha256(payload).hexdigest()==expected, 'Personal release archive checksum mismatch'
raw=brotli.decompress(payload)
checks={'premium-personal-v15.js':'db22a8ce4c3885860138902866bbb9cc0e400c6eab58db17dccd14cb1f99e75b','premium-personal-v15.css':'fb389528afddd01d4b0693ba902d3ec763b5627e439c1a9ed4d6186c342b8176'}
with tarfile.open(fileobj=io.BytesIO(raw),mode='r:') as tar:
    assert set(tar.getnames())==set(checks), tar.getnames()
    for item in tar:
        assert item.isfile() and item.name in checks
        content=tar.extractfile(item).read()
        assert hashlib.sha256(content).hexdigest()==checks[item.name], item.name
        (root/item.name).write_bytes(content)
index=root/'index.html'
html=index.read_text(encoding='utf-8')
css_old=re.search(r'<link rel="stylesheet" href="\./premium-v12\.css(?:\?v=\d+)?">',html)
js_old=re.search(r'<script src="\./premium-v12\.js(?:\?v=\d+)?" defer></script>',html)
assert css_old and js_old, 'Missing existing PLUS assets'
if 'premium-personal-v15.css' not in html:
    html=html.replace(css_old.group(0),css_old.group(0)+'\n  <link rel="stylesheet" href="./premium-personal-v15.css?v=15">')
if 'premium-personal-v15.js' not in html:
    html=html.replace(js_old.group(0),js_old.group(0)+'\n  <script src="./premium-personal-v15.js?v=15" defer></script>')
html=html.replace('src="./app.js?v=14"','src="./app.js?v=15"')
html=html.replace('ongi-v14-reloaded','ongi-v15-reloaded')
index.write_text(html,encoding='utf-8')
app=root/'app.js'
src=app.read_text(encoding='utf-8')
old="localStorage.removeItem('oneul-ongi-premium-v1');state=emptyState();"
if "localStorage.removeItem('oneul-ongi-personal-v1');state=emptyState();" not in src:
    assert src.count(old)==1, 'Reset action needs review'
    src=src.replace(old,"localStorage.removeItem('oneul-ongi-premium-v1');localStorage.removeItem('oneul-ongi-personal-v1');state=emptyState();")
app.write_text(src,encoding='utf-8')
sw=root/'sw.js'
worker=sw.read_text(encoding='utf-8')
worker,n=re.subn(r"const CACHE_NAME='oneul-ongi-[^']+'","const CACHE_NAME='oneul-ongi-v15.0.0-adaptive-personal'",worker,count=1)
assert n==1,'Unexpected service worker version'
for filename in ('premium-personal-v15.css','premium-personal-v15.js'):
    if f"'./{filename}?v=15'" not in worker:
        pos="'./premium-v12.js?v=14'"
        assert pos in worker, 'Unknown service worker asset list'
        worker=worker.replace(pos,pos+f",'./{filename}?v=15'")
worker=worker.replace("'./app.js?v=14'","'./app.js?v=15'")
sw.write_text(worker,encoding='utf-8')
readme=root/'README.md'
r=readme.read_text(encoding='utf-8')
if '## v15 personalized preview' not in r:
    r+='\n\n## v15 personalized preview\n\nGoal, minutes and self-selected energy are used with recent completion and difficulty feedback to recommend daily tasks. Six goals, rule-based adaptive difficulty, 7/30-day report, goal-aligned 7/21/30-day challenge and optional private print-to-PDF booklet are available. Mobile screens do not require scrolling at tested sizes. Records remain on this device. Monthly 2,900 KRW is only a planned price: billing, paid access control, server sync and a real AI advisor are not implemented.\n'
    readme.write_text(r,encoding='utf-8')
print('Verified v15 SHA-256, both module files, app reset and versioned SW cache')
