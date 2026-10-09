/* Home-only PYODA wordmark. No dependencies and no changes to navigation. */
(()=>{
 'use strict';
 const scriptURL=new URL(document.currentScript.src);
 const base=new URL('./logo-3d/',scriptURL);
 const isBooks=!!document.getElementById('home');
 const kind=isBooks?'books':'music';
 const live=new WeakMap();
 const vertex=`attribute vec3 position;attribute vec3 normal;uniform float yaw;uniform float aspect;uniform float center;uniform float scale;uniform float footprintScale;uniform float xOffset;varying vec3 N;varying vec3 P;void main(){float c=cos(yaw),s=sin(yaw);mat3 r=mat3(c,0.,-s,0.,1.,0.,s,0.,c);vec3 p=r*(position-vec3(0.,center,0.));N=r*normal;P=p;gl_Position=vec4((p.x-xOffset)*footprintScale/scale,p.y*aspect/scale,-p.z*.15,1.);}`;
 const fragment=`precision highp float;varying vec3 N;varying vec3 P;void main(){vec3 n=normalize(N);vec3 l=normalize(vec3(-2.,3.2,5.)-P);vec3 l2=normalize(vec3(3.,.8,3.)-P);float diff=max(dot(n,l),0.);float fill=max(dot(n,l2),0.);float spec=pow(max(dot(n,normalize(l+vec3(0.,0.,1.))),0.),32.);float edge=pow(1.-abs(n.z),3.);vec3 color=vec3(.70,.72,.75)*(.38+.55*diff+.12*fill)+vec3(.23)*spec+vec3(.05)*edge;gl_FragColor=vec4(color,1.);}`;
 function bytes(b64){return Uint8Array.from(atob(b64),c=>c.charCodeAt(0)).buffer;}
 function decoded(b64,scale){return Float32Array.from(new Int16Array(bytes(b64)),v=>v/scale);}
 let dataPromise;
 function data(){return dataPromise||=(fetch(new URL(kind+'-v4.json',base)).then(r=>{if(!r.ok)throw new Error('Logo unavailable');return r.json();}));}
 async function start(frame){
  const canvas=frame.querySelector('canvas'),fallback=frame.querySelector('img');
  const gl=canvas.getContext('webgl',{antialias:true,alpha:true,premultipliedAlpha:false,powerPreference:'low-power'});
  if(!gl)return;
  let raf=0,disposed=false,visible=false,last=0,phase=-Math.PI/2;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const buffers=[];
  const resize=new ResizeObserver(()=>{last=0;if(visible)draw();});
  const intersection=new IntersectionObserver(e=>{visible=e[0].isIntersecting;last=0;if(visible)draw();});
  let program,geometry,count,loc;
  function release(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);resize.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);for(const b of buffers)gl.deleteBuffer(b);if(program)gl.deleteProgram(program);}
  live.set(frame,{release});
  function visibility(){last=0;if(!document.hidden&&visible)draw();}
  function compile(type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error('Logo shader unavailable');return sh;}
  function draw(){
   if(!program||disposed||!canvas.isConnected||!canvas.clientWidth)return;
   const dpr=Math.min(devicePixelRatio||1,3),w=Math.max(1,Math.min(1800,Math.round(canvas.clientWidth*dpr))),h=Math.max(1,Math.round(w*canvas.clientHeight/canvas.clientWidth));
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   const a=.28*Math.sin(phase),c=Math.cos(a),s=Math.sin(a);let lo=Infinity,hi=-Infinity;
   for(const [x,z] of geometry.hull){const xx=x*c+z*s;lo=Math.min(lo,xx);hi=Math.max(hi,xx);}
   gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   for(const [key,value]of Object.entries({yaw:a,aspect:w/h,center:geometry.center,scale:geometry.scale,footprintScale:geometry.width/(hi-lo),xOffset:(hi+lo)/2}))gl.uniform1f(loc[key],value);
   gl.drawElements(gl.TRIANGLES,count,gl.UNSIGNED_SHORT,0);
  }
  function tick(time){if(disposed)return;if(!canvas.isConnected){release();return;}if(visible&&!document.hidden){if(last&&!reduced.matches)phase+=Math.min(time-last,50)/1000*Math.PI*2/20;draw();}last=time;raf=requestAnimationFrame(tick);}
  try{
   geometry=await data();if(!canvas.isConnected){release();return;}
   program=gl.createProgram();const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Logo program unavailable');gl.useProgram(program);
   for(const [name,key,scale] of [['position','positions',10000],['normal','normals',32767]]){const buffer=gl.createBuffer();buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,decoded(geometry[key],scale),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,3,gl.FLOAT,false,0,0);}
   const indices=new Uint16Array(bytes(geometry.indices));count=indices.length;const index=gl.createBuffer();buffers.push(index);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
   loc=Object.fromEntries(['yaw','aspect','center','scale','footprintScale','xOffset'].map(k=>[k,gl.getUniformLocation(program,k)]));gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
   draw();fallback.hidden=true;canvas.hidden=false;resize.observe(frame);intersection.observe(frame);document.addEventListener('visibilitychange',visibility);raf=requestAnimationFrame(tick);
   canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();release();canvas.hidden=true;fallback.hidden=false;},{once:true});
  }catch{release();canvas.hidden=true;fallback.hidden=false;dataPromise=null;}
 }
 function mount(){
  const hero=document.querySelector(isBooks?'#home .hero':'#screen>.listenerHero');if(!hero||hero.querySelector('.pyodaLogoFrame'))return;
  const frame=document.createElement('div');frame.className='pyodaLogoFrame';
  const img=document.createElement('img');img.src=new URL(kind+'-v4.png',base);img.alt='PYODA '+kind.toUpperCase();img.width=1450;img.height=470;
  const canvas=document.createElement('canvas');canvas.hidden=true;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','천천히 움직이는 PYODA '+kind.toUpperCase()+' 로고');frame.append(img,canvas);
  hero.classList.add('pyodaLogoHero');
  if(isBooks)hero.querySelector('div').prepend(frame);else hero.replaceChildren(frame);
  start(frame);
 }
 mount();const observer=new MutationObserver(mount);observer.observe(isBooks?document.getElementById('home'):document.getElementById('screen'),{childList:true,subtree:false});
})();
