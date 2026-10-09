/* Reveal BOOKS only after its shared home UI and initial layout are ready. */
(()=>{
 const root=document.documentElement;
 root.classList.add('books-starting');
 const reveal=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.remove('books-starting')));
 const ready=()=>{
  if(document.fonts)Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,1500))]).then(reveal,reveal);
  else reveal();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
