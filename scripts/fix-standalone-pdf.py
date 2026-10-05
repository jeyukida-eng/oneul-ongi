"""Preload the bundled PDF worker inline for opaque file:// and srcdoc origins."""
from pathlib import Path
import re,hashlib,base64,sys
repo=Path(__file__).resolve().parents[1]
worker=(repo/'pyeoda/vendor/pdfjs/pdf.worker.min.mjs').read_text().replace('</script','<\\/script')
for argument in sys.argv[1:]:
 p=Path(argument);html=p.read_text()
 html,count=re.subn(r'window\.PyeodaPdfWorker=URL\.createObjectURL\(new Blob\(\[[\s\S]*?\],\{type:"text/javascript"\}\)\);','',html)
 if count!=1:raise ValueError(f'{p}: expected exactly one old worker bootstrap, found {count}')
 marker='<script type="module">'
 if marker not in html:raise ValueError(f'{p}: PDF core module missing')
 html=html.replace(marker,'<script type="module" data-pyeoda-pdf-worker>'+worker+'</script>'+marker,1)
 # WorkerMessageHandler is now preloaded in this document. No blob execution is needed.
 html=html.replace("worker-src 'self' blob:;","worker-src 'self';",1)
 values=["'sha256-"+base64.b64encode(hashlib.sha256(m[2].encode()).digest()).decode()+"'" for m in re.finditer(r'<script([^>]*)>([\s\S]*?)</script>',html) if 'src=' not in m[1] and 'text/plain' not in m[1] and m[2].strip()]
 html=re.sub(r'script-src [^;]+',lambda m:re.sub(r"\s*'sha256-[^']+'",'',m[0]).rstrip()+' '+' '.join(sorted(set(values))),html,count=1)
 p.write_text(html)
 print(p.name,': inline PDF worker ready')
