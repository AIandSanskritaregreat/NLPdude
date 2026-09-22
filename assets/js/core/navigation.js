// Shared navigation and lifecycle helpers for the standalone course.
function mcSectionDelay(fn, delay) {
  const host=document.getElementById('sub-body');
  const marker=host && host.firstElementChild;
  setTimeout(()=>{
    const view=document.getElementById('subsection-view');
    if(marker && marker.isConnected && host.firstElementChild===marker && view.style.display!=='none') fn();
  },delay);
}
(function(){
  const sectionOpeners=['openSec','openNgramSec','openLrSec','openEmbSec','openNNSec','openLLMSec','openTXSec','openPTSec','openMLSec','openIRSec','openMTSec','openRNSec','openPHSec','openASRSec','openTTSSec'];
  let returnFocus=null, revision=0;
  const visible=el=>el && el.getClientRects().length && getComputedStyle(el).visibility!=='hidden';
  function stopSection(){
    revision++;
    [ngStopAnims,lrStopAll,embStopAll,nnStopAll,llmStopAll].forEach(stop=>stop());
    if(_nge.timer)clearTimeout(_nge.timer);_nge.timer=null;_nge.playing=false;
    _ngsa.auto=false;
    [[_bt,'_t'],[_cot,'timer'],[_tcm,'timer'],[_rib,'anim'],[_ragl,'anim'],[_kv,'anim']].forEach(([state,key])=>{if(state[key])clearInterval(state[key]);state[key]=null;});
    [[_lrDial,'anim'],[_attn,'anim'],[_ride,'anim'],[_txfullPre,'anim'],[_loo,'anim'],[_gvu,'anim'],[_wsd,'anim'],[_ani,'anim'],[_blend,'anim'],[_lnv,'anim'],[_mix,'anim'],[_pack,'anim'],[_reo,'raf'],[_mrf,'raf'],[_rbp,'raf'],[_rfu,'raf'],[_pdt,'raf']].forEach(([state,key])=>{if(state[key])cancelAnimationFrame(state[key]);state[key]=null;});
    [closeGDExplorer,closeNNPlayground,closeLLMAnatomy,closeLLMModel,closeTXFull,closeTXModel].forEach(close=>close());
    if(window.mathcoreAudioSource){try{window.mathcoreAudioSource.stop();}catch{}window.mathcoreAudioSource=null;}
    document.querySelectorAll('.viz-fullscreen').forEach(el=>el.classList.remove('viz-fullscreen'));
    _hs.full=false;_mph.full=false;
    document.body.style.overflow='';
  }
  function accessibility(){
    document.querySelectorAll('.sc-card:not([role])').forEach(el=>{el.setAttribute('role','button');el.tabIndex=0;});
    document.querySelectorAll('.quiz-explain:not([aria-live])').forEach(el=>{el.setAttribute('aria-live','polite');el.setAttribute('aria-atomic','true');});
    document.querySelectorAll('#sub-body table.lr-table').forEach(el=>{
      if(el.closest('.mc-table-scroll'))return;
      const wrap=document.createElement('div');wrap.className='mc-table-scroll';el.before(wrap);wrap.append(el);
    });
    document.querySelectorAll('#sub-body canvas:not([aria-label])').forEach(el=>{
      const container=el.closest('.viz-container');
      const label=container?.querySelector('.viz-label')?.textContent.trim();
      if(label){el.setAttribute('role','img');el.setAttribute('aria-label',label);}
    });
  }
  function syncViews(){
    const lesson=document.getElementById('lesson-view'),sub=document.getElementById('subsection-view');
    const lessonOn=lesson.style.display==='block',subOn=sub.style.display==='block';
    document.querySelector('.mc-top').inert=lessonOn||subOn;
    document.querySelector('.mc-skip').hidden=lessonOn||subOn;
    document.getElementById('home-view').inert=lessonOn||subOn;
    lesson.inert=subOn;sub.inert=!subOn;
    for(const [el,on] of [[lesson,lessonOn&&!subOn],[sub,subOn]]){
      el.setAttribute('role','dialog');el.setAttribute('aria-modal',on?'true':'false');
      el.setAttribute('aria-label',el.querySelector('h1')?.textContent||'Lesson');
    }
    accessibility();
  }
  function focusHeading(view){
    const token=revision;
    requestAnimationFrame(()=>{
      if(token!==revision)return;
      const h=document.querySelector(view+' h1');
      if(h){h.tabIndex=-1;h.focus({preventScroll:true});}
    });
  }
  for(const name of sectionOpeners){
    const open=window[name];
    window[name]=function(...args){
      returnFocus=document.activeElement;stopSection();
      const bar=document.getElementById('sub-progress');bar.style.width='0%';
      const result=open.apply(this,args);syncViews();focusHeading('#sub-body');return result;
    };
  }
  const openLesson=window.openLesson;
  window.openLesson=function(...args){
    stopSection();document.getElementById('subsection-view').style.display='none';
    document.getElementById('sub-body').replaceChildren();
    document.getElementById('lesson-progress').style.width='0%';
    const result=openLesson.apply(this,args);syncViews();focusHeading('#lesson-body');return result;
  };
  const closeSec=window.closeSec;
  window.closeSec=function(...args){
    stopSection();const result=closeSec.apply(this,args);document.getElementById('sub-body').replaceChildren();syncViews();
    if(returnFocus?.isConnected && visible(returnFocus))returnFocus.focus({preventScroll:true});else focusHeading('#lesson-body');
    return result;
  };
  for(const name of ['closeLesson','showTab']){
    const old=window[name];window[name]=function(...args){stopSection();const result=old.apply(this,args);document.getElementById('sub-body').replaceChildren();syncViews();if(name==='closeLesson')document.querySelector('.mc-tab[aria-selected="true"]')?.focus({preventScroll:true});return result;};
  }
  const tabs=[...document.querySelectorAll('.mc-tab')];
  const panels=[...document.querySelectorAll('.mc-panel')];
  function tabState(){tabs.forEach(el=>{el.tabIndex=el.getAttribute('aria-selected')==='true'?0:-1;el.setAttribute('aria-controls',el.id.replace('tab-','panel-'));});panels.forEach(el=>{el.setAttribute('aria-labelledby',el.id.replace('panel-','tab-'));});}
  new MutationObserver(tabState).observe(document.querySelector('.mc-tabs'),{subtree:true,attributes:true,attributeFilter:['aria-selected']});tabState();
  document.querySelector('.mc-tabs').addEventListener('keydown',event=>{
    const index=tabs.indexOf(document.activeElement);if(index<0)return;
    let next=index;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=tabs.length-1;
    else return;
    event.preventDefault();tabs[next].click();tabs[next].focus();tabs[next].scrollIntoView({block:'nearest',inline:'nearest'});
  });
  document.addEventListener('keydown',event=>{
    const card=event.target.closest?.('.sc-card,.chapter-card');
    if(card && (event.key===' '||event.key==='Enter')){event.preventDefault();event.stopPropagation();card.click();return;}
    if(event.key==='Escape'){
      const ids=[['tx-model',closeTXModel],['tx-full',closeTXFull],['llm-model',closeLLMModel],['llm-anatomy',closeLLMAnatomy],['nn-playground',closeNNPlayground],['gd-explorer',closeGDExplorer]];
      const pair=ids.find(([id])=>visible(document.getElementById(id)));
      if(pair){event.preventDefault();pair[1]();focusHeading('#sub-body');return;}
      if(document.querySelector('.viz-fullscreen'))return;
      document.getElementById('mc-toc')?.removeAttribute('open');
    }
  },true);
  let pending=false;
  const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;accessibility();});});
  for(const id of ['lesson-body','sub-body'])observer.observe(document.getElementById(id),{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&window.mathcoreAudioSource){try{window.mathcoreAudioSource.stop();}catch{}window.mathcoreAudioSource=null;}});
  syncViews();
})();
