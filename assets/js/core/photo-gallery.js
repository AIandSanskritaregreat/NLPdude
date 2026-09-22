// Classroom photo gallery: opens a photo and its caption in the lightbox dialog.
(()=>{
 const dialog=document.getElementById('teaching-photo-dialog');
 const image=document.getElementById('teaching-dialog-image');
 const caption=document.getElementById('teaching-dialog-caption');
 let oldOverflow='';
 document.querySelectorAll('.teaching-photo-open').forEach(button=>button.addEventListener('click',()=>{
   const original=button.querySelector('img');
   image.src=original.src; image.alt=original.alt;
   caption.textContent=button.closest('figure').querySelector('figcaption').textContent;
   oldOverflow=document.body.style.overflow;
   dialog.showModal(); document.body.style.overflow='hidden';
 }));
 dialog.querySelector('.teaching-dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;image.removeAttribute('src');});
})();
