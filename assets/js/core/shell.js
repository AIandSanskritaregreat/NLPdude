/* ── MATHCORE SHELL CONTROLLER (tabs, curriculum, lesson chrome) ── */
(function(){

const CURRICULUM = [
  {id:'intro',        num:'CH 01', title:'Introduction to NLP',                         status:'live', vol:'1', tags:[['tag-math','foundations']]},
  {id:'tokens',       num:'CH 02', title:'Words and Tokens',                            status:'live', vol:'1', tags:[['tag-math','Herdan’s law'],['tag-code','byte-pair encoding'],['tag-viz','edit distance']]},
  {id:'ngram',        num:'CH 03', title:'N-gram Language Models',                      status:'live', vol:'1', tags:[['tag-math','chain rule'],['tag-viz','perplexity'],['tag-code','smoothing']]},
  {id:'logreg',       num:'CH 04', title:'Logistic Regression & Text Classification',  status:'live', vol:'1', tags:[['tag-math','sigmoid'],['tag-viz','cross-entropy'],['tag-code','gradient descent']]},
  {id:'embeddings',   num:'CH 05', title:'Embeddings',                                  status:'live', vol:'1', tags:[['tag-math','cosine similarity'],['tag-nlp','co-occurrence'],['tag-code','skip-gram']]},
  {id:'nn',           num:'CH 06', title:'Neural Networks',                             status:'live',  vol:'1', tags:[['tag-math','activations'],['tag-code','backpropagation'],['tag-viz','softmax']]},
  {id:'llm',          num:'CH 07', title:'Large Language Models',                       status:'live',  vol:'1', tags:[['tag-nlp','next-token prediction'],['tag-math','temperature'],['tag-viz','perplexity']]},
  {id:'transformers', num:'CH 08', title:'Transformers',                                status:'live', vol:'1', tags:[['tag-math','scaled dot-product'],['tag-nlp','multi-head attention'],['tag-viz','layer norm']]},
  {id:'posttraining', num:'CH 09', title:'Post-Training: RLHF & Alignment',             status:'live', vol:'a', tags:[['tag-math','Bradley–Terry'],['tag-viz','KL divergence'],['tag-code','policy gradient']]},
  {id:'masked',       num:'CH 10', title:'Masked Language Models',                      status:'live', vol:'a', tags:[['tag-nlp','masked objective'],['tag-math','bidirectional attention'],['tag-viz','contextual vectors']]},
  {id:'rag',          num:'CH 11', title:'Information Retrieval & RAG',                 status:'live', vol:'a', tags:[['tag-math','TF–IDF'],['tag-viz','BM25'],['tag-code','dense retrieval']]},
  {id:'mt',           num:'CH 12', title:'Machine Translation',                         status:'live', vol:'a', tags:[['tag-code','encoder–decoder'],['tag-math','cross-attention'],['tag-viz','beam search']]},
  {id:'rnn',          num:'CH 13', title:'RNNs and LSTMs',                              status:'live', vol:'a', tags:[['tag-math','recurrence'],['tag-code','LSTM gates'],['tag-viz','attention']]},
  {id:'phonetics',    num:'CH 14', title:'Phonetics & Speech Feature Extraction',       status:'live', vol:'a', tags:[['tag-math','Fourier transform'],['tag-viz','spectrograms'],['tag-nlp','MFCCs']]},
  {id:'asr',          num:'CH 15', title:'Automatic Speech Recognition',                status:'live', vol:'a', tags:[['tag-math','CTC loss'],['tag-code','beam search'],['tag-viz','word error rate']]},
  {id:'tts',         num:'CH 16', title:'Text-to-Speech',                             status:'live', vol:'a', tags:[['tag-math','residual quantization'],['tag-code','neural audio codec'],['tag-viz','straight-through estimator']]}
];

const VOL_INK  = {'1':'var(--vol1)', '2':'var(--vol2)', 'a':'var(--vola)'};
const VOL_NAME = {'1':'Language Models', '2':'Computational Linguistics', 'a':'Advanced Concepts'};
const STATUS_TXT = {live:'Live', wip:'In progress', soon:'Planned'};
const byId = {};
CURRICULUM.forEach(function(c,i){ byId[c.id] = i; });
let mcCurrent = null;

/* ── tabs ── */
const TABS = ['overview','vol1','vola','vol2','about'];
const _closeLessonRaw = window.closeLesson;

function setPanel(name){
  TABS.forEach(function(t){
    var p = document.getElementById('panel-'+t);
    var b = document.getElementById('tab-'+t);
    if (p) p.classList.toggle('active', t === name);
    if (b) b.setAttribute('aria-selected', t === name ? 'true' : 'false');
  });
}

window.showTab = function(name){
  if (typeof _closeLessonRaw === 'function') _closeLessonRaw();
  setPanel(name);
  window.scrollTo({top:0, behavior:'auto'});
};

/* closing a lesson lands on the volume tab that topic belongs to */
window.closeLesson = function(){
  if (typeof _closeLessonRaw === 'function') _closeLessonRaw();
  if (mcCurrent !== null){
    var v = CURRICULUM[byId[mcCurrent]].vol;
    setPanel(v === '1' ? 'vol1' : v === '2' ? 'vol2' : 'vola');
  }
};

/* ── card + count + toc rendering ── */
function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

function cardHTML(c){
  var tags = c.tags.map(function(t){ return '<span class="ch-tag '+t[0]+'">'+esc(t[1])+'</span>'; }).join('');
  return '<div class="chapter-card'+(c.status==='soon'?' is-soon':'')+'" style="--ink:'+VOL_INK[c.vol]+'" onclick="openLesson(\''+c.id+'\')" role="button" tabindex="0" onkeydown="if(event.key===\'Enter\')openLesson(\''+c.id+'\')">'
    + '<div class="ch-topline"><span class="ch-num"></span>'
    + '<span class="ch-status status-'+c.status+'">'+STATUS_TXT[c.status]+'</span></div>'
    + '<div class="ch-title">'+esc(c.title)+'</div>'
    + '<div class="ch-tags">'+tags+'</div></div>';
}

function renderVol(vol, gridId, countsId){
  var list = CURRICULUM.filter(function(c){ return c.vol === vol; });
  var g = document.getElementById(gridId);
  if (g) g.innerHTML = list.map(cardHTML).join('');
  var n = {live:0, wip:0, soon:0};
  list.forEach(function(c){ n[c.status]++; });
  var el = document.getElementById(countsId);
  if (el) el.innerHTML =
    '<span class="vc-live"><span class="vc-dot"></span>'+n.live+' live</span>'
    + (n.wip ? '<span class="vc-wip"><span class="vc-dot"></span>'+n.wip+' in progress</span>' : '')
    + (n.soon ? '<span class="vc-soon"><span class="vc-dot"></span>'+n.soon+' planned</span>' : '');
}

function renderTOC(){
  var host = document.getElementById('mc-toc-panel');
  if (!host) return;
  var html = '';
  [['1','Language Models'],['a','Advanced Concepts'],['2','Computational Linguistics']].forEach(function(v){
    var items = CURRICULUM.filter(function(c){ return c.vol === v[0]; });
    if (!items.length) return;
    html += '<div class="mc-toc-vol">'+v[1]+'</div>';
    items.forEach(function(c){
      html += '<button class="mc-toc-item'+(c.status==='soon'?' is-soon':'')+'" data-ch="'+c.id+'" onclick="mcTocGo(\''+c.id+'\')">'
        + '<span class="t">'+esc(c.title)+'</span></button>';
    });
  });
  host.innerHTML = html;
}

window.mcTocGo = function(id){
  var d = document.getElementById('mc-toc');
  if (d) d.removeAttribute('open');
  openLesson(id);
};

/* ── lesson chrome: wrap openLesson without touching it ── */
var _openLesson = window.openLesson;
window.openLesson = function(id){
  _openLesson(id);
  mcCurrent = (id in byId) ? id : null;
  var lv = document.getElementById('lesson-view');
  var crumb = document.getElementById('lesson-crumb');
  var prev = document.getElementById('lesson-prev');
  var next = document.getElementById('lesson-next');
  if (mcCurrent !== null){
    var i = byId[id], c = CURRICULUM[i];
    if (lv) lv.style.setProperty('--ink', VOL_INK[c.vol]);
    if (crumb) crumb.textContent = VOL_NAME[c.vol] + ' \u00b7 ' + c.num;
    if (prev) prev.disabled = (i === 0);
    if (next) next.disabled = (i === CURRICULUM.length - 1);
    var toc = document.getElementById('mc-toc-panel');
    if (toc) toc.querySelectorAll('.mc-toc-item').forEach(function(b){
      b.classList.toggle('is-current', b.getAttribute('data-ch') === id);
    });
    var lb = document.getElementById('lesson-body');
    if (lb && !lb.querySelector('.mc-lesson-foot')){
      var p = i > 0 ? CURRICULUM[i-1] : null;
      var n = i < CURRICULUM.length - 1 ? CURRICULUM[i+1] : null;
      var foot = document.createElement('div');
      foot.className = 'mc-lesson-foot';
      foot.innerHTML =
        (p ? '<button class="mc-foot-card" onclick="openLesson(\''+p.id+'\')"><span class="k">&#8592; Previous &middot; '+p.num+'</span><span class="t">'+esc(p.title)+'</span></button>'
           : '<div class="mc-foot-card empty"></div>')
        + (n ? '<button class="mc-foot-card next" onclick="openLesson(\''+n.id+'\')"><span class="k">Next &middot; '+n.num+' &#8594;</span><span class="t">'+esc(n.title)+'</span></button>'
             : '<div class="mc-foot-card empty"></div>');
      lb.appendChild(foot);
    }
  } else {
    if (crumb) crumb.textContent = '';
    if (prev) prev.disabled = true;
    if (next) next.disabled = true;
  }
};

window.mcStep = function(dir){
  if (mcCurrent === null) return;
  var i = byId[mcCurrent] + dir;
  if (i < 0 || i >= CURRICULUM.length) return;
  openLesson(CURRICULUM[i].id);
};

/* close the Contents popover when clicking elsewhere */
document.addEventListener('click', function(e){
  var d = document.getElementById('mc-toc');
  if (d && d.hasAttribute('open') && !d.contains(e.target)) d.removeAttribute('open');
});

/* ── boot ── */
renderVol('1','vol1-grid','counts-vol1');
renderVol('a','vola-grid','counts-vola');
renderTOC();

/* ── fullscreen redraw hooks for flagship figures ──────────
   When a figure toggles full screen its canvas must re-measure the
   new container width; each callback re-invokes the figure's draw
   routine (never its init, so user state is preserved). */
(function registerFsRedraws(){
  var reg = {
    'lr-sigmoid': function(){ lrSigDraw(); },
    'lr-bnd':     function(){ lrBndDraw(); },
    'lr-canyon':  function(){ lrCanDraw(); },
    'lr-softmax': function(){ lrSmCompute(); },
    'lr-conf':    function(){ if(typeof _lrConf!=='undefined'&&_lrConf.pie) lrConfDrawPie(); else lrConfDraw(); },
    'emb-cube':   function(){ embCubeDraw(); },
    'emb-cooc':   function(){ embCoocRenderBody(); },
    'emb-cos':    function(){ embCosDraw(); },
    'emb-skipgram': function(){ embSgDraw(); },
    'nn-xor':     function(){ nnXorDraw(); },
    'nn-warp':    function(){ nnWarpDrawX(); nnWarpDrawH(); },
    'nn-lookup':  function(){ nnLookupDraw(); },
    'nn-backprop':function(){ nnBpDraw(); },
    'llm-arch':   function(){ llmArchDraw(); },
    'llm-temp':   function(){ llmTempDraw(); },
    'attn-host':  function(){ attnDraw(); }
  };
  Object.keys(reg).forEach(function(k){
    vizRegisterRedraw(k, function(){ try{ reg[k](); }catch(e){} });
  });
})();

/* ── hero equation globe ──────────────────────────────────────
   A shaded sphere carrying a graticule, a node field, great-circle
   links and orbit rings, drawn on canvas. The equations are real
   LaTeX: KaTeX typesets each one into an HTML layer, and every frame
   the element is placed by projecting its 3-D anchor, so the labels
   orbit the sphere and switch off while it stands in front of them. */
(function initGlobe(){
  var cv = document.getElementById('globe-canvas');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var stage = cv.parentElement;
  var eqHost = document.getElementById('globe-eqs');
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* five bright channel inks, one per signal family */
  var HUE = [[58,224,255],[124,107,255],[255,95,162],[255,180,58],[96,240,200]];
  function rgba(c,a){ return 'rgba('+c[0]+','+c[1]+','+c[2]+','+(a<0?0:a>1?1:a).toFixed(3)+')'; }
  function mix(a,b,t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }

  /* ── equations: LaTeX source plus a plain-text fallback used
        until KaTeX has loaded (or if it never does) ── */
  var EQ_SRC = [
    ['\\operatorname{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right)V', 'softmax(QK\u1d40/\u221Ad\u2096)V'],
    ['\\theta \\leftarrow \\theta - \\eta\\,\\nabla_{\\!\\theta}\\mathcal{L}',    '\u03b8 \u2190 \u03b8 \u2212 \u03b7\u2207\u2112'],
    ['H(p,q) = -\\sum_i p_i \\log q_i',                                          'H(p,q) = \u2212\u03a3 p\u1d62 log q\u1d62'],
    ['\\sigma(z) = \\dfrac{1}{1+e^{-z}}',                                        '\u03c3(z) = 1/(1+e\u207b\u1dbb)'],
    ['\\alpha_i = \\dfrac{e^{s_i}}{\\sum_j e^{s_j}}',                            '\u03b1\u1d62 = e^s\u1d62 / \u03a3 e^s\u2c7c'],
    ['P(w_{1:n}) = \\prod_i P(w_i \\mid w_{\\lt i})',                            'P(w\u2081:\u2099) = \u220f P(w\u1d62 | w\u208d\u1d62\u208b\u2081\u208e)'],
    ['\\cos\\theta = \\dfrac{u\\cdot v}{\\lVert u\\rVert\\,\\lVert v\\rVert}',    'cos \u03b8 = u\u00b7v / \u2016u\u2016\u2016v\u2016'],
    ['\\dfrac{\\partial \\mathcal{L}}{\\partial w_{ij}}',                        '\u2202\u2112 / \u2202w\u1d62\u2c7c'],
    ['h_t = f(Wh_{t-1} + Ux_t)',                                                 'h\u209c = f(Wh\u209c\u208b\u2081 + Ux\u209c)'],
    ['\\mathrm{PMI}(w,c) = \\log\\dfrac{P(w,c)}{P(w)P(c)}',                      'PMI(w,c) = log P(w,c)/P(w)P(c)'],
    ['\\mathrm{PP}(W) = P(W)^{-1/N}',                                            'PP(W) = P(W)\u207b\u00b9\u141f\u1d3a'],
    ['\\int p(x)\\,dx = 1',                                                      '\u222b p(x) dx = 1']
  ];
  var EQS = EQ_SRC.map(function(e,i){
    var t = (i+0.5)/EQ_SRC.length;
    return {
      tex:e[0], alt:e[1],
      lat:(t-0.5)*Math.PI*0.86,
      lon:i*2.399963229 + 1.35,
      rad:1.10 + ((i*0.07)%0.20),
      col:HUE[i%HUE.length],
      bob:(i*1.31)%6.283,
      w:0, h:0
    };
  });

  /* ── geometry state ── */
  var W=0,H=0,DPR=1,cx=0,cy=0,R=0,focal=0,narrow=false;
  var ryBase=0.85, ryOff=0, ry=0.85, rx=-0.36, rxT=-0.36, ryT=0.0;
  var pointerY=0, pointerX=0, hasPointer=false;
  var clock=0;
  var cY=1,sY=0,cX=1,sX=0;
  var _p={x:0,y:0,z:0,sx:0,sy:0,s:1};

  function setRot(){ cY=Math.cos(ry); sY=Math.sin(ry); cX=Math.cos(rx); sX=Math.sin(rx); }
  function rot(p){
    var x1 =  p.x*cY + p.z*sY;
    var z1 = -p.x*sY + p.z*cY;
    var y2 =  p.y*cX - z1*sX;
    var z2 =  p.y*sX + z1*cX;
    var s  = focal/(focal - z2*R);
    _p.x=x1; _p.y=y2; _p.z=z2; _p.sx=cx + x1*R*s; _p.sy=cy + y2*R*s; _p.s=s;
    return _p;
  }

  /* ── node field: Fibonacci sphere, hue cycled so colour is spread
        evenly over the surface rather than pooled in one band ── */
  var nodes=[];
  (function buildNodes(){
    var N=260;
    for (var i=0;i<N;i++){
      var y=1-2*(i+0.5)/N;
      var r=Math.sqrt(Math.max(0,1-y*y));
      var th=i*2.399963229;
      nodes.push({x:r*Math.cos(th), y:y, z:r*Math.sin(th),
                  hue:HUE[i%HUE.length], ph:(i*1.7)%6.283,
                  sx:0, sy:0, zz:0, ss:1});
    }
  })();

  /* ── graticule ── */
  var curves=[];
  (function buildCurves(){
    var i,k,SEG,pts,lon,lat;
    SEG=64;
    for (k=0;k<14;k++){
      lon=k*Math.PI/7; pts=[];
      for (i=0;i<=SEG;i++){
        lat=-Math.PI/2 + Math.PI*i/SEG;
        pts.push({x:Math.cos(lat)*Math.sin(lon), y:Math.sin(lat), z:Math.cos(lat)*Math.cos(lon)});
      }
      curves.push({pts:pts, hue:mix(HUE[0],HUE[1],k/13), w:1.05});
    }
    SEG=96;
    for (k=-4;k<=4;k++){
      lat=k*Math.PI/10; pts=[];
      for (i=0;i<=SEG;i++){
        lon=2*Math.PI*i/SEG;
        pts.push({x:Math.cos(lat)*Math.sin(lon), y:Math.sin(lat), z:Math.cos(lat)*Math.cos(lon)});
      }
      curves.push({pts:pts, hue:mix(HUE[0],HUE[4],Math.abs(k)/4), w:(k===0?1.5:1.0)});
    }
  })();

  /* ── great-circle links between node pairs ── */
  var links=[];
  (function buildLinks(){
    for (var i=0;i<9;i++){
      var a=nodes[(i*37)%nodes.length], b=nodes[(i*91+13)%nodes.length];
      var d=a.x*b.x+a.y*b.y+a.z*b.z;
      var om=Math.acos(Math.max(-1,Math.min(1,d)));
      if (om<1e-3) continue;
      links.push({a:a,b:b,om:om,so:Math.sin(om),hue:HUE[i%HUE.length],
                  sp:0.00013+0.00007*((i*13)%7)/7, ph:(i*0.37)%1});
    }
  })();
  function slerp(l,t,out){
    var s0=Math.sin((1-t)*l.om)/l.so, s1=Math.sin(t*l.om)/l.so;
    var lift=1+0.15*Math.sin(Math.PI*t);
    out.x=(l.a.x*s0+l.b.x*s1)*lift;
    out.y=(l.a.y*s0+l.b.y*s1)*lift;
    out.z=(l.a.z*s0+l.b.z*s1)*lift;
    return out;
  }
  var _s={x:0,y:0,z:0};

  /* ── orbit rings ── */
  var rings=[];
  (function buildRings(){
    var defs=[[1.30,0.42,0.20,0,0.42],[1.52,-0.55,-0.35,2,0.36],[1.74,0.15,0.62,3,0.28]];
    for (var r=0;r<defs.length;r++){
      var d=defs[r], N=150, pts=[];
      for (var i=0;i<=N;i++){
        var t=2*Math.PI*i/N;
        var x=Math.cos(t)*d[0], y=0, z=Math.sin(t)*d[0];
        var y2=y*Math.cos(d[1])-z*Math.sin(d[1]);
        var z2=y*Math.sin(d[1])+z*Math.cos(d[1]);
        var x2=x*Math.cos(d[2])-y2*Math.sin(d[2]);
        y2=x*Math.sin(d[2])+y2*Math.cos(d[2]);
        pts.push({x:x2,y:y2,z:z2});
      }
      rings.push({pts:pts, hue:HUE[d[3]], a:d[4],
                  sp:0.00019*(r%2?-1:1)*(1+r*0.35), ph:r*2.1});
    }
  })();

  /* ── cached gradients (rebuilt only on resize) ── */
  var gBloom=null, gBody=null, gWarm=null, gLimb=null;
  var LX=-0.52, LY=-0.60;   /* light direction, screen space */

  function buildGradients(){
    gBloom=ctx.createRadialGradient(cx,cy,R*0.55,cx,cy,R*2.25);
    gBloom.addColorStop(0.00,'rgba(124,107,255,0.30)');
    gBloom.addColorStop(0.28,'rgba(58,224,255,0.14)');
    gBloom.addColorStop(0.62,'rgba(255,95,162,0.055)');
    gBloom.addColorStop(1.00,'rgba(124,107,255,0)');

    var hx=cx+LX*R*0.62, hy=cy+LY*R*0.62;
    gBody=ctx.createRadialGradient(hx,hy,R*0.04,cx,cy,R*1.02);
    gBody.addColorStop(0.00,'rgba(190,252,255,0.98)');
    gBody.addColorStop(0.10,'rgba(96,224,255,0.80)');
    gBody.addColorStop(0.42,'rgba(96,110,240,0.52)');
    gBody.addColorStop(0.72,'rgba(78,54,168,0.42)');
    gBody.addColorStop(1.00,'rgba(26,20,78,0.30)');

    gWarm=ctx.createRadialGradient(cx-LX*R*0.95, cy-LY*R*0.95, R*0.05, cx, cy, R*1.25);
    gWarm.addColorStop(0.0,'rgba(255,95,162,0.34)');
    gWarm.addColorStop(0.5,'rgba(255,140,90,0.10)');
    gWarm.addColorStop(1.0,'rgba(255,95,162,0)');

    gLimb=ctx.createRadialGradient(cx,cy,R*0.86,cx,cy,R*1.06);
    gLimb.addColorStop(0.00,'rgba(58,224,255,0)');
    gLimb.addColorStop(0.62,'rgba(58,224,255,0.28)');
    gLimb.addColorStop(0.86,'rgba(160,120,255,0.42)');
    gLimb.addColorStop(1.00,'rgba(255,95,162,0)');
  }

  function resize(){
    var r = stage.getBoundingClientRect();
    W=Math.max(1,r.width); H=Math.max(1,r.height);
    narrow = W<=1020;
    DPR=Math.min(window.devicePixelRatio||1, 1.75);
    cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    cx = narrow ? W*0.50 : W*0.665;
    cy = narrow ? H*0.42 : H*0.50;
    R  = Math.min(narrow?W*0.34:W*0.205, H*(narrow?0.30:0.375));
    focal = R*4.2;
    buildGradients();
    for (var i=0;i<EQS.length;i++){ EQS[i].w=0; EQS[i].h=0; }
  }

  /* ── LaTeX label layer ── */
  var eqEls=[];
  function buildEqs(){
    if (!eqHost) return;
    eqHost.innerHTML='';
    eqEls = EQS.map(function(e){
      var el=document.createElement('div');
      el.className='mc-geq';
      el.style.color='rgb('+e.col[0]+','+e.col[1]+','+e.col[2]+')';
      el.style.borderColor='rgba('+e.col[0]+','+e.col[1]+','+e.col[2]+',0.34)';
      var fb=document.createElement('span');
      fb.className='mc-geq-fb';
      fb.textContent=e.alt;
      el.appendChild(fb);
      eqHost.appendChild(el);
      return el;
    });
    typesetEqs();
  }
  var typesetTries=0;
  function typesetEqs(){
    if (!eqEls.length) return;
    if (!window.katex || !window.katex.renderToString){
      if (typesetTries++ < 120) setTimeout(typesetEqs, 100);
      return;
    }
    for (var i=0;i<EQS.length;i++){
      try {
        eqEls[i].innerHTML = window.katex.renderToString(EQS[i].tex, {
          throwOnError:false, displayMode:false, output:'html', strict:false
        });
        EQS[i].w=0; EQS[i].h=0;
      } catch(err){}
    }
  }

  var _slots=[];
  function layoutEqs(){
    if (!eqEls.length || !eqHost) return;
    var i, el;
    if (narrow){
      for (i=0;i<eqEls.length;i++) eqEls[i].style.opacity='0';
      return;
    }
    /* 1. project every anchor and score it for depth, occlusion and edges */
    _slots.length=0;
    for (i=0;i<EQS.length;i++){
      var e=EQS[i]; el=eqEls[i];
      var lo=e.lon + clock*0.00008;
      var bob=Math.sin(clock*0.0006 + e.bob)*0.05;
      var cc=Math.cos(e.lat), yy=Math.sin(e.lat)+bob;
      var p=rot({x:cc*Math.sin(lo)*e.rad, y:yy*e.rad, z:cc*Math.cos(lo)*e.rad});
      var sx=p.sx, sy=p.sy, pz=p.z;
      /* the sphere hides labels that pass behind it */
      var perp=Math.sqrt(p.x*p.x + p.y*p.y);
      var d=(pz/e.rad+1)/2;
      var a=(perp<1.03 && pz<0) ? 0 : (0.14 + 0.86*d);
      var sc=0.70 + 0.44*d;
      if (!e.w){ e.w=el.offsetWidth||140; e.h=el.offsetHeight||26; }
      var hw=e.w*sc/2, hh=e.h*sc/2;
      var fade=Math.min(1,(sx-hw-W*0.44)/120,(W-18-hw-sx)/110,(sy-hh-14)/48,(H-14-hh-sy)/48);
      a*=Math.max(0,Math.min(1,fade));
      _slots.push({i:i, a:a, d:d, sx:sx, sy:sy, sc:sc, hw:hw, hh:hh});
    }
    /* 2. nearest label wins any overlap, so two never sit on top of each other */
    _slots.sort(function(m,n){ return n.d-m.d; });
    for (i=0;i<_slots.length;i++){
      var s1=_slots[i];
      if (s1.a<0.02) continue;
      for (var j=0;j<i;j++){
        var s2=_slots[j];
        if (s2.a<0.02) continue;
        if (Math.abs(s1.sx-s2.sx) < (s1.hw+s2.hw+8) &&
            Math.abs(s1.sy-s2.sy) < (s1.hh+s2.hh+6)) { s1.a=0; break; }
      }
    }
    /* 3. commit */
    for (i=0;i<_slots.length;i++){
      var s=_slots[i], eq=EQS[s.i]; el=eqEls[s.i];
      if (s.a<0.02){ el.style.opacity='0'; continue; }
      el.style.opacity=s.a.toFixed(3);
      el.style.transform='translate3d('+(s.sx-eq.w/2).toFixed(1)+'px,'+(s.sy-eq.h/2).toFixed(1)+'px,0) scale('+s.sc.toFixed(3)+')';
    }
  }

  /* ── drawing ── */
  function styleBand(cu,b){
    var dd=(b+0.5)/4;
    ctx.strokeStyle=rgba(cu.hue, 0.04+0.34*dd*dd);
    ctx.lineWidth=cu.w*(0.6+0.6*dd);
  }
  function drawCurves(){
    for (var c=0;c<curves.length;c++){
      var cu=curves[c], pts=cu.pts, band=-1, open=false, p, d, b;
      for (var i=0;i<pts.length;i++){
        p=rot(pts[i]); d=(p.z+1)/2; b=(d*4)|0; if(b>3)b=3;
        if (i===0){ band=b; styleBand(cu,b); ctx.beginPath(); ctx.moveTo(p.sx,p.sy); open=true; continue; }
        ctx.lineTo(p.sx,p.sy);
        if (b!==band){ ctx.stroke(); band=b; styleBand(cu,b); ctx.beginPath(); ctx.moveTo(p.sx,p.sy); }
      }
      if (open) ctx.stroke();
    }
  }

  function drawNodes(){
    var i,n,p;
    for (i=0;i<nodes.length;i++){
      n=nodes[i]; p=rot(n);
      n.sx=p.sx; n.sy=p.sy; n.zz=p.z; n.ss=p.s;
    }
    nodes.sort(function(a,b){ return a.zz-b.zz; });
    for (i=0;i<nodes.length;i++){
      n=nodes[i];
      var d=(n.zz+1)/2;
      var pulse=0.5+0.5*Math.sin(clock*0.0012 + n.ph);
      var a=(0.06+0.62*d*d)*(0.55+0.45*pulse);
      var rr=(0.7+2.0*d)*n.ss*(0.75+0.35*pulse);
      ctx.beginPath(); ctx.fillStyle=rgba(n.hue,a);
      ctx.arc(n.sx,n.sy,rr,0,6.2832); ctx.fill();
      if (d>0.86 && pulse>0.7){
        ctx.beginPath(); ctx.fillStyle=rgba(n.hue,a*0.20);
        ctx.arc(n.sx,n.sy,rr*3.4,0,6.2832); ctx.fill();
      }
    }
  }

  function drawLinks(){
    ctx.lineCap='round';
    for (var k=0;k<links.length;k++){
      var l=links[k], N=40, prevx=0, prevy=0, prevz=0, t, p;
      for (var i=0;i<=N;i++){
        t=i/N; p=rot(slerp(l,t,_s));
        if (i>0){
          var d=(p.z+prevz)/2;
          if (d>-0.15){
            ctx.strokeStyle=rgba(l.hue, (0.10+0.60*Math.max(0,d))*Math.sin(Math.PI*t));
            ctx.lineWidth=1.6;
            ctx.beginPath(); ctx.moveTo(prevx,prevy); ctx.lineTo(p.sx,p.sy); ctx.stroke();
          }
        }
        prevx=p.sx; prevy=p.sy; prevz=p.z;
      }
      /* travelling pulse */
      var tp=(l.ph + clock*l.sp)%1;
      p=rot(slerp(l,tp,_s));
      if (p.z>-0.1){
        ctx.beginPath(); ctx.fillStyle=rgba(l.hue,0.95);
        ctx.arc(p.sx,p.sy,2.6*p.s,0,6.2832); ctx.fill();
        ctx.beginPath(); ctx.fillStyle=rgba(l.hue,0.25);
        ctx.arc(p.sx,p.sy,8*p.s,0,6.2832); ctx.fill();
      }
    }
  }

  function drawRings(){
    for (var r=0;r<rings.length;r++){
      var ring=rings[r], pts=ring.pts, prev=null, open=false;
      var px=0,py=0,pOcc=false;
      for (var i=0;i<pts.length;i++){
        var p=rot(pts[i]);
        var occ=(Math.sqrt(p.x*p.x+p.y*p.y)<1.0 && p.z<0);
        if (i>0 && !occ && !pOcc){
          var d=(p.z+1)/2;
          ctx.strokeStyle=rgba(ring.hue, ring.a*(0.20+0.80*d));
          ctx.lineWidth=1.1;
          ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(p.sx,p.sy); ctx.stroke();
        }
        px=p.sx; py=p.sy; pOcc=occ;
      }
      /* satellite */
      var ph=(ring.ph + clock*ring.sp);
      var idx=((ph/(2*Math.PI))%1+1)%1*(pts.length-1);
      var q=rot(pts[Math.round(idx)]);
      var qocc=(Math.sqrt(q.x*q.x+q.y*q.y)<1.0 && q.z<0);
      if (!qocc){
        ctx.beginPath(); ctx.fillStyle=rgba(ring.hue,0.95);
        ctx.arc(q.sx,q.sy,3.2*q.s,0,6.2832); ctx.fill();
        ctx.beginPath(); ctx.fillStyle=rgba(ring.hue,0.22);
        ctx.arc(q.sx,q.sy,10*q.s,0,6.2832); ctx.fill();
      }
    }
  }

  function draw(){
    setRot();
    ctx.clearRect(0,0,W,H);

    /* atmosphere */
    ctx.fillStyle=gBloom; ctx.fillRect(0,0,W,H);

    /* body */
    ctx.save();
    ctx.beginPath(); ctx.arc(cx,cy,R,0,6.2832); ctx.clip();
    ctx.fillStyle=gBody; ctx.fillRect(cx-R,cy-R,R*2,R*2);
    ctx.fillStyle=gWarm; ctx.fillRect(cx-R,cy-R,R*2,R*2);
    ctx.restore();

    drawCurves();
    drawNodes();
    drawLinks();

    /* limb light — a sphere's outline is a circle at every attitude */
    ctx.save();
    ctx.beginPath(); ctx.arc(cx,cy,R*1.06,0,6.2832); ctx.clip();
    ctx.fillStyle=gLimb; ctx.fillRect(cx-R*1.1,cy-R*1.1,R*2.2,R*2.2);
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx,cy,R,0,6.2832);
    ctx.strokeStyle='rgba(150,240,255,0.55)'; ctx.lineWidth=1.4; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx,cy,R*1.012,0,6.2832);
    ctx.strokeStyle='rgba(255,95,162,0.22)'; ctx.lineWidth=2.4; ctx.stroke();

    drawRings();
    layoutEqs();
  }

  /* ── loop ── */
  var running=false, raf=0, last=0;
  function tick(ts){
    if (!running) return;
    if (!last) last=ts;
    var dt=Math.min(64, ts-last); last=ts;
    clock+=dt;
    ryBase += 0.00016*dt;
    if (hasPointer){ rxT=-0.36+pointerY*0.26; ryT=pointerX*0.12; }
    else { rxT=-0.36; ryT=0; }
    rx    += (rxT-rx)*0.05;
    ryOff += (ryT-ryOff)*0.05;
    ry = ryBase + ryOff;
    draw();
    raf=requestAnimationFrame(tick);
  }
  function start(){ if (running||reduce) return; running=true; last=0; raf=requestAnimationFrame(tick); }
  function stop(){ running=false; if (raf) cancelAnimationFrame(raf); raf=0; }

  window.addEventListener('resize', function(){ resize(); draw(); }, {passive:true});
  document.addEventListener('visibilitychange', function(){ if (document.hidden) stop(); else start(); });

  if (!reduce && !('ontouchstart' in window)){
    stage.addEventListener('pointermove', function(ev){
      var r=stage.getBoundingClientRect();
      pointerX=((ev.clientX-r.left)/r.width-0.5)*2;
      pointerY=((ev.clientY-r.top)/r.height-0.5)*2;
      hasPointer=true;
    }, {passive:true});
    stage.addEventListener('pointerleave', function(){ hasPointer=false; }, {passive:true});
  }

  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(en){
      en.forEach(function(e){ if (e.isIntersecting) start(); else stop(); });
    },{threshold:0.02}).observe(stage);
  } else { start(); }

  buildEqs();
  resize();
  draw();
  if (!reduce) start();
})();


})();
