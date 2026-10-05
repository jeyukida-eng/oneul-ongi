import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
test('downloaded HTML preloads PDF worker without blob workers or module fetches',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pyeoda-pdf-')),filename=path.join(dir,'standalone.html');
 try{
  const base='pyeoda/vendor/pdfjs/',worker=fs.readFileSync(base+'pdf.worker.min.mjs','utf8'),original=fs.readFileSync(base+'pdf.min.mjs','utf8'),core=original.slice(0,original.lastIndexOf('export{'))+'window.PyeodaPdfJs={getDocument,GlobalWorkerOptions};',assets=fs.readFileSync(base+'assets.json','utf8');
  const html='<html><head><meta name="pyeoda-security-policy" content="script-src \'self\'; worker-src \'self\' blob:;"></head><body><script type="module">'+core+'</script><script>window.PyeodaPdfWorker=URL.createObjectURL(new Blob(['+JSON.stringify(worker)+'],{type:"text/javascript"}));window.PyeodaPdfAssets='+assets+';</script></body></html>';
  fs.writeFileSync(filename,html);const fix=spawnSync('python3',['scripts/fix-standalone-pdf.py',filename],{encoding:'utf8'});assert.equal(fix.status,0,fix.stderr);
  const run=spawnSync(process.execPath,['--experimental-vm-modules','tests/standalone-pdf-runtime.mjs',filename],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);assert(run.stdout.includes('zero fetch/import/blob worker requests'));
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
