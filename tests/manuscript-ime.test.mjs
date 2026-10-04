import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const source=fs.readFileSync('pyeoda/index.html','utf8');
const paper=source.slice(source.indexOf('let manuscriptComposing=false;'),source.indexOf('function bindRichEditorToolbar()'));
// A small DOM fixture exercises native event ordering without synthesizing IME keys.
function fixture(){
 class Item{
  constructor(text=null){this.nodeType=text===null?1:3;this.data=text;this.childNodes=[];this.parentNode=null;this.classes=new Set();this.style={removeProperty(k){delete this[k]}};this.listeners={};this.clientWidth=674;this.classList={contains:c=>this.classes.has(c),add:c=>this.classes.add(c),remove:c=>this.classes.delete(c),replace:(a,b)=>{this.classes.delete(a);this.classes.add(b)},toggle:(c,on)=>on?this.classes.add(c):this.classes.delete(c)};}
  set className(v){this.classes=new Set(v.split(' ').filter(Boolean))}
  get parentElement(){return this.parentNode?.nodeType===1?this.parentNode:null}
  get firstChild(){return this.childNodes[0]||null}
  get textContent(){return this.nodeType===3?this.data:this.childNodes.map(n=>n.textContent).join('')}
  append(...nodes){for(const n of nodes){if(n.nodeType===11){this.append(...[...n.childNodes]);continue}if(n.parentNode)n.parentNode.childNodes.splice(n.parentNode.childNodes.indexOf(n),1);n.parentNode=this;this.childNodes.push(n)}}
  replaceWith(...nodes){const parent=this.parentNode,flat=nodes.flatMap(n=>n.nodeType===11?[...n.childNodes]:[n]);for(const n of flat){if(n.parentNode)n.parentNode.childNodes.splice(n.parentNode.childNodes.indexOf(n),1)}const index=parent.childNodes.indexOf(this);parent.childNodes.splice(index,1,...flat);for(const n of flat)n.parentNode=parent;this.parentNode=null;}
  contains(n){return n===this||this.childNodes.some(c=>c.contains(n))}
  querySelectorAll(selector){const classes=selector.split(',').map(s=>s.trim().slice(1)),found=[];function walk(n){for(const child of n.childNodes){if(classes.some(c=>child.classes.has(c)))found.push(child);walk(child)}}walk(this);return found}
  addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
  emit(name,event={}){for(const fn of this.listeners[name]||[])fn(event)}
  setAttribute(){}
 }
 const body=new Item(),parent=new Item();body.className='manuscript-grid';parent.append(body);
 const selection={anchorNode:null,focusNode:null,anchorOffset:0,focusOffset:0,setBaseAndExtent(a,ao,f,fo){Object.assign(this,{anchorNode:a,anchorOffset:ao,focusNode:f,focusOffset:fo})}};
 const frames=new Map();let next=0,saves=0,rewrites=0;
 const context=vm.createContext({Intl,body,Node:{TEXT_NODE:3},NodeFilter:{SHOW_TEXT:4},localStorage:{getItem:()=>null,setItem(){}},
  window:{getSelection:()=>selection,addEventListener(){}},getComputedStyle:()=>({paddingLeft:'0',paddingRight:'0'}),rememberRichEditorSelection(){},queueTypewriterCaret(){},wc(){},autosaveEpisode(){saves++},
  requestAnimationFrame(fn){const id=++next;frames.set(id,fn);return id},cancelAnimationFrame(id){frames.delete(id)},
  MutationObserver:class{constructor(fn){this.fn=fn}observe(){}disconnect(){}},
  document:{getElementById:()=>new Item(),createTextNode:t=>new Item(t),createElement:()=>new Item(),createDocumentFragment:()=>{const n=new Item();n.nodeType=11;return n},createTreeWalker(root){rewrites++;const nodes=[];function walk(n){for(const child of n.childNodes){if(child.nodeType===3)nodes.push(child);else walk(child)}}walk(root);let index=0;return{currentNode:null,nextNode(){this.currentNode=nodes[index++];return !!this.currentNode}}}}
 });
 vm.runInContext(paper+'\nbindManuscriptPaperView();',context);
 function cell(text){const el=new Item();el.className='manuscript-cell';el.append(new Item(text));return el}
 return {body,cell,Item,selection,run:code=>vm.runInContext(code,context),flush(){for(const [id,fn]of [...frames]){frames.delete(id);fn()}},get saves(){return saves},get rewrites(){return rewrites}};
}
test('Korean composition keeps native text nodes intact until final input has committed',()=>{
 const f=fixture(),old=f.cell('한');f.body.append(old);const text=old.firstChild;
 f.body.emit('compositionstart');text.data='한글';f.body.emit('input',{isComposing:true});f.run('layoutManuscriptCells()');
 assert.equal(old.firstChild,text);assert.equal(f.body.textContent,'한글');assert(f.body.classList.contains('manuscript-composing'));
 const before=f.rewrites;f.body.emit('compositionend');text.data='한글로';f.body.emit('input',{isComposing:false});f.run('layoutManuscriptCells()');
 assert.equal(f.rewrites,before);assert.equal(old.firstChild,text);
 Object.assign(f.selection,{anchorNode:text,focusNode:text,anchorOffset:3,focusOffset:3});f.flush();
 assert.deepEqual(f.body.querySelectorAll('.manuscript-cell').map(n=>n.textContent),['한','글','로']);assert.equal(f.body.querySelectorAll('.manuscript-cell-fragment').length,0);
 assert.equal(f.body.textContent,'한글로');assert.equal(f.selection.anchorNode.data,'로');assert.equal(f.selection.anchorOffset,1);assert.equal(f.saves,1);assert(!f.body.classList.contains('manuscript-composing'));
});
test('a new Korean composition cancels an older pending normalization',()=>{
 const f=fixture(),old=f.cell('가');f.body.append(old);f.body.emit('compositionstart');f.body.emit('compositionend');f.body.emit('compositionstart');old.firstChild.data='가나';f.flush();
 assert.equal(f.body.firstChild,old);assert.equal(f.saves,0);assert(f.body.classList.contains('manuscript-composing'));
 f.body.emit('compositionend');f.flush();assert.deepEqual(f.body.querySelectorAll('.manuscript-cell').map(n=>n.textContent),['가','나']);
});
test('split native text nodes and copied cell widths do not leave nested fixed-width cells',()=>{
 const f=fixture(),old=f.cell('한');old.style.width='32px';old.append(new f.Item('글'));f.body.append(old);f.run('layoutManuscriptCells()');
 assert.equal(f.body.childNodes.length,2);assert.deepEqual(f.body.childNodes.map(n=>n.textContent),['한','글']);assert(f.body.childNodes.every(n=>n.parentNode===f.body));
});
test('decomposed Hangul and emoji remain one grapheme per cell with text preserved',()=>{
 const f=fixture(),text='한글 👩‍👩‍👧‍👦';f.body.append(new f.Item(text));f.run('layoutManuscriptCells()');
 assert.deepEqual(f.body.querySelectorAll('.manuscript-cell').map(n=>n.textContent),['한','글',' ','👩‍👩‍👧‍👦']);assert.equal(f.body.textContent,text);
});
