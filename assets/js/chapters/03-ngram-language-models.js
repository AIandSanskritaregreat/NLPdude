// ── N-GRAM SECTION CARDS ────────────────────────────────────
const NGRAM_SEC = [
  {id:'ngdef',   num:'3.1', title:'N-Grams',                                        icon:'P', desc:'The chain rule as an interactive proof, the Markov assumption in action, and a full n-gram model you can drive.', tags:['chain rule','Markov assumption','MLE','log space']},
  {id:'ngeval',  num:'3.2', title:'Evaluating Language Models: Train & Test Sets',  icon:'S', desc:'Extrinsic vs intrinsic evaluation, and exactly what the training, development, and test splits are for.',        tags:['held-out data','extrinsic','contamination']},
  {id:'ngppl',   num:'3.3', title:'Perplexity',                                     icon:'X', desc:'What perplexity means, where it comes from, and a live lab that trains four models and evaluates them.',        tags:['perplexity','cross-entropy','branching factor']},
  {id:'ngsample',num:'3.4', title:'Sampling Sentences from a Language Model',       icon:'G', desc:'Watch the sampling distribution get unrolled onto an interval and a sentence get generated word by word.',      tags:['sampling','generation']},
  {id:'nggen',   num:'3.5', title:'Generalizing vs. Overfitting',                   icon:'O', desc:'How n-grams memorize their corpus, why unknown words break everything, and where subword tokenization fits.',   tags:['overfitting','OOV','subwords','BPE']},
  {id:'ngsmooth',num:'3.6', title:'Smoothing, Interpolation, and Backoff',          icon:'M', desc:'Laplace smoothing as a pipeline, adjusted counts, a tunable interpolation triangle, and stupid backoff.',       tags:['Laplace','adjusted counts','interpolation','backoff']},
  {id:'ngentropy',num:'3.7',title:'Entropy and Cross-Entropy',                      icon:'H', desc:'The information-theoretic foundation that perplexity comes from.',                                             tags:['entropy','cross-entropy']}
];

function buildNgramOverview(){
  const cards = NGRAM_SEC.map(s=>`
    <div class="sc-card" onclick="openNgramSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Probability &amp; Language</div>
    <h1 class="lesson-h1">N-gram Language Models</h1>
    <p class="lesson-intro">N-gram models estimate the next word from a short window of context. They provide a useful starting point for training and test sets, perplexity, sampling, and smoothing. The demos use a small harbor-themed corpus stored in this page, so you can inspect the counts behind each result.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">A language model assigns a probability to a sequence and predicts the next word from preceding ones.</div>
        <div class="ch-sum-item">N-grams use the Markov assumption: approximate the full history by the last n-1 words.</div>
        <div class="ch-sum-item">Parameters are estimated by counting and normalizing (maximum likelihood estimation), and computed in log space.</div>
        <div class="ch-sum-item">Models are trained on a training set, tuned on a development set, and evaluated once on a held-out test set.</div>
        <div class="ch-sum-item">Perplexity is the standard intrinsic metric: the inverse probability of the test set, normalized by length, and equal to two raised to the cross-entropy.</div>
        <div class="ch-sum-item">Smoothing, interpolation, and backoff redistribute probability mass so the model never assigns zero to unseen events.</div>
      </div>
    </div>`;
}

// ── THE SALTMARSH HARBOR CORPUS ─────────────────────────────
// An original miniature world written for this topic. Heavy, deliberate
// repetition gives the n-gram statistics real structure.
const NG_TRAIN = [
"the tide rolls in at dawn","the tide rolls out at dusk","the tide rises under the pier","the tide falls before the storm",
"the tide carries the boats to the sea","the tide turns in the evening","the tide leaves salt on the stones","the tide rolls in from the sea",
"the fog rolls in from the sea","the fog drifts over the harbor","the fog hides the lighthouse at dawn","the fog settles on the pier",
"the fog rolls in before the rain","the fog fades in the morning sun","the fog drifts past the ferry","the fog covers the nets on the pier",
"the gulls circle over the boats","the gulls cry above the market","the gulls follow the ferry to the harbor","the gulls rest on the pier at dusk",
"the gulls circle over the nets","the gulls cry in the morning wind","the gulls follow the fishermen to the sea","the gulls scatter when the bell rings",
"the fishermen haul the nets at dawn","the fishermen mend the nets on the pier","the fishermen sail before the storm","the fishermen return with the tide",
"the fishermen sell the catch at the market","the fishermen watch the sky for rain","the fishermen haul the crates to the market","the fishermen rest when the fog rolls in",
"the keeper lights the lamp at dusk","the keeper climbs the tower at night","the keeper watches the sea from the tower","the keeper trims the wick before dawn",
"the keeper rings the bell in the fog","the keeper sleeps when the sun rises","the keeper lights the lamp before the storm","the keeper watches the boats return",
"the ferry leaves the harbor at noon","the ferry returns before the storm","the ferry carries the crates to the island","the ferry waits for the fog to lift",
"the ferry rocks in the evening swell","the ferry sounds the horn in the fog","the ferry crosses the bay at dawn","the ferry ties up at the pier",
"the market opens when the boats return","the market smells of salt and fish","the women sell bread at the market","the crates of fish fill the market",
"the market closes before the rain","the children run through the market","the merchants weigh the catch at the market","the market hums in the morning",
"the lighthouse beam sweeps across the bay","the lighthouse stands on the rocks","the lighthouse warns the boats in the fog","the beam turns slowly in the night",
"the lighthouse shines over the water","the beam sweeps across the rocks at night","the lighthouse guides the ferry to the harbor","the light fades when the sun rises",
"the storm gathers over the sea","the wind rises before the storm","the rain falls on the harbor at night","the storm breaks the calm of the bay",
"the wind shakes the ropes on the pier","the storm passes before the dawn","the waves crash on the rocks in the storm","the wind carries the cry of the gulls",
"the boats creak against the pier","the boats return with the evening tide","the boats carry the nets to the sea","the old boats rest in the shallow water",
"the boats leave the harbor before dawn","the boats follow the light to the harbor","the sails swell in the morning wind","the boats rock in the swell",
"the morning sun warms the stones","the evening light falls on the water","the harbor wakes before the sun rises","the village sleeps when the lamp burns",
"the bell rings across the bay at noon","the smoke rises from the cottages at dusk","the stars appear over the quiet harbor","the day begins with the cry of the gulls",
"the nets dry on the pier in the sun","the ropes creak when the wind rises","the salt stains the wood of the boats","the anchor sinks into the dark water",
"the catch shines silver in the crates","the oars dip into the calm water","the children watch the boats from the pier","the dog sleeps by the crates of fish",
"the fog rolls in at dusk","the tide rolls in before the storm","the fog rolls in over the bay","the tide rolls out before dawn",
"the gulls circle over the harbor","the fishermen haul the nets before the storm","the keeper lights the lamp when the fog rolls in","the ferry returns to the harbor at dusk",
"the bay lies calm under the stars","the harbor glows in the evening light","the water mirrors the light of the lamp","the pier stands quiet in the fog",
"the sea speaks in the voice of the wind","the island waits beyond the fog","the catch feeds the village through the winter","the lamp burns until the dawn"
];
const NG_DEV = [
"the fog rolls in before dusk","the fishermen mend the sails at noon","the tide carries the crates to the pier","the gulls rest on the rocks in the sun",
"the keeper watches the storm from the tower","the ferry waits at the pier in the fog","the boats return before the rain falls","the market opens at dawn in the summer",
"the bell rings when the ferry returns","the light sweeps across the quiet bay","the children sell bread by the harbor","the wind fades when the sun rises"
];
const NG_TEST = [
"the tide rolls in over the rocks","the fog hides the boats in the bay","the keeper rings the bell before the storm","the gulls follow the boats to the harbor",
"the fishermen sail when the tide turns","the ferry carries the catch to the market","the lamp shines over the dark water","the storm gathers beyond the island",
"the nets dry in the morning sun","the village wakes with the cry of the gulls","the rain falls softly on the pier","the boats creak in the evening swell"
];
const NG_OOD = [
"the committee approved the quarterly budget on tuesday","traffic slowed near the downtown exit this morning","the index closed higher after the earnings report",
"engineers deployed the update to the payment system","the council debated the new parking regulations","analysts expect inflation to ease next quarter",
"the subway line reopened after routine maintenance","shareholders questioned the merger during the meeting"
];

// ── N-GRAM ENGINE ───────────────────────────────────────────
const NG_SEP = '\u0001';
function ngTok(line){ return line.toLowerCase().replace(/[^a-z' ]/g,' ').split(/\s+/).filter(Boolean); }
function ngRng(seed){ let a=seed>>>0; return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

// Train a single fixed-order model. Contexts are the exact (n-1)-word histories.
function ngTrainModel(sents, n){
  const ctx = new Map(), uni = new Map(), vocab = new Set();
  let uniTot = 0;
  sents.forEach(line=>{
    const toks = ngTok(line); if(!toks.length) return;
    toks.forEach(t=>vocab.add(t));
    const pad = []; for(let i=0;i<Math.max(1,n-1);i++) pad.push('<s>');
    const seq = pad.concat(toks, ['</s>']);
    for(let i=Math.max(1,n-1); i<seq.length; i++){
      const w = seq[i], key = n===1 ? '' : seq.slice(i-(n-1), i).join(NG_SEP);
      let e = ctx.get(key); if(!e){ e = {tot:0, next:new Map()}; ctx.set(key, e); }
      e.tot++; e.next.set(w, (e.next.get(w)||0)+1);
    }
    toks.concat(['</s>']).forEach(w=>{ uni.set(w,(uni.get(w)||0)+1); uniTot++; });
  });
  vocab.add('</s>'); vocab.add('<unk>');
  return {n, ctx, uni, uniTot, vocab, V: vocab.size};
}
// A suite is models of order 1..4 trained on the same sentences.
function ngTrainSuite(sents){ return [null, ngTrainModel(sents,1), ngTrainModel(sents,2), ngTrainModel(sents,3), ngTrainModel(sents,4)]; }
function ngMapUnk(toks, vocab){ return toks.map(t=> vocab.has(t) ? t : '<unk>'); }
function ngCount(m, ctxArr, w){ const e = m.ctx.get(m.n===1?'':ctxArr.join(NG_SEP)); return e ? (e.next.get(w)||0) : 0; }
function ngCtxTot(m, ctxArr){ const e = m.ctx.get(m.n===1?'':ctxArr.join(NG_SEP)); return e ? e.tot : 0; }

// Probability of w given context array (length n-1) under a mode.
// modes: 'mle' | 'addk' (params.k) | 'interp' (params.lam = weights for orders 1..n, sums to 1)
function ngProb(suite, n, ctxArr, w, mode, params){
  const m = suite[n];
  if(mode==='mle'){ const t = ngCtxTot(m,ctxArr); return t ? ngCount(m,ctxArr,w)/t : 0; }
  if(mode==='addk'){ const k = params && params.k!=null ? params.k : 1; return (ngCount(m,ctxArr,w)+k)/(ngCtxTot(m,ctxArr)+k*m.V); }
  if(mode==='interp'){
    const lam = params.lam; let p = 0;
    for(let o=1;o<=n;o++){
      const mo = suite[o], sub = o===1 ? [] : ctxArr.slice(ctxArr.length-(o-1));
      let po;
      if(o===1){ po = (ngCount(mo,[],w)+1)/(mo.uniTot+mo.V); }           // add-one floor on the unigram component
      else { const t = ngCtxTot(mo,sub); po = t ? ngCount(mo,sub,w)/t : 0; }
      p += (lam[o-1]||0)*po;
    }
    return p;
  }
  return 0;
}
// Stupid backoff score (not a probability). Returns {s, path:[{order,c,tot,used,factor}]}
function ngBackoff(suite, n, ctxArr, w, alpha){
  alpha = alpha==null ? 0.4 : alpha;
  const path = [];
  let factor = 1;
  for(let o=n;o>=1;o--){
    const m = suite[o], sub = o===1 ? [] : ctxArr.slice(ctxArr.length-(o-1));
    const c = ngCount(m,sub,w), tot = o===1 ? m.uniTot : ngCtxTot(m,sub);
    if(o>1 && tot>0 && c>0){ path.push({order:o,c,tot,used:true,factor}); return {s:factor*c/tot, path}; }
    if(o===1){ const p = c>0 ? c/tot : 1/(m.uniTot+m.V); path.push({order:1,c,tot,used:true,factor}); return {s:factor*p, path}; }
    path.push({order:o,c,tot,used:false,factor});
    factor *= alpha;
  }
  return {s:0, path};
}
// Distribution over next words for a context (sorted desc). mode as in ngProb.
function ngDist(suite, n, ctxArr, mode, params){
  const m = suite[n];
  if(mode==='mle'){
    const e = m.ctx.get(m.n===1?'':ctxArr.join(NG_SEP));
    if(!e) return [];
    const out = []; e.next.forEach((c,w)=>out.push({w, c, p: c/e.tot}));
    out.sort((a,b)=>b.p-a.p || a.w.localeCompare(b.w));
    return out;
  }
  const out = [];
  m.vocab.forEach(w=>{ if(w==='<unk>') return; const p = ngProb(suite,n,ctxArr,w,mode,params); if(p>0) out.push({w, c: ngCount(m,ctxArr,w), p}); });
  out.sort((a,b)=>b.p-a.p || a.w.localeCompare(b.w));
  return out;
}
// Log-2 probability of one tokenized sentence (tokens already <unk>-mapped). Scores every token plus </s>.
function ngScoreSentence(suite, n, toks, mode, params){
  const pad = []; for(let i=0;i<Math.max(1,n-1);i++) pad.push('<s>');
  const seq = pad.concat(toks, ['</s>']);
  let lp = 0, N = 0; const steps = [];
  for(let i=Math.max(1,n-1); i<seq.length; i++){
    const w = seq[i], ctxArr = n===1 ? [] : seq.slice(i-(n-1), i);
    const p = ngProb(suite, n, ctxArr, w, mode, params);
    steps.push({w, ctx: ctxArr.slice(), p});
    if(p<=0){ lp = -Infinity; } else if(lp!==-Infinity){ lp += Math.log2(p); }
    N++;
  }
  return {lp, N, steps};
}
// Perplexity over a set of sentences. Returns {pp, N, zeros, oov, toks}
function ngPerplexity(suite, n, sents, mode, params){
  const vocab = suite[1].vocab;
  let lp = 0, N = 0, zeros = 0, oov = 0, tot = 0;
  sents.forEach(line=>{
    const raw = ngTok(line); if(!raw.length) return;
    raw.forEach(t=>{ tot++; if(!vocab.has(t)) oov++; });
    const toks = ngMapUnk(raw, vocab);
    const r = ngScoreSentence(suite, n, toks, mode, params);
    if(r.lp===-Infinity){ zeros++; lp = -Infinity; } else if(lp!==-Infinity){ lp += r.lp; }
    N += r.N;
  });
  const pp = (lp===-Infinity || N===0) ? Infinity : Math.pow(2, -lp/N);
  return {pp, N, zeros, oov, tot, h: (lp===-Infinity||N===0)? Infinity : -lp/N};
}
// Sample one sentence. Returns {toks, trace:[{ctx,dist,u,pick}]}
function ngSampleSentence(suite, n, mode, params, rng, maxLen){
  maxLen = maxLen||18;
  const ctxArr = []; for(let i=0;i<Math.max(0,n-1);i++) ctxArr.push('<s>');
  const toks = [], trace = [];
  for(let step=0; step<maxLen; step++){
    let dist = ngDist(suite, n, ctxArr, mode, params);
    if(!dist.length) dist = ngDist(suite, 1, [], 'mle', null);
    const u = rng(); let acc = 0, pick = dist[dist.length-1];
    for(const d of dist){ acc += d.p; if(u <= acc + 1e-12){ pick = d; break; } }
    trace.push({ctx: ctxArr.slice(), dist, u, pick: pick.w});
    if(pick.w==='</s>') break;
    toks.push(pick.w);
    if(n>1){ ctxArr.shift(); ctxArr.push(pick.w); }
  }
  return {toks, trace};
}
// Longest training-set overlap ending at each generated position (token level).
function ngOverlapProfile(genToks, trainGramSet, maxK){
  return genToks.map((_,i)=>{
    let best = 0;
    for(let k=1;k<=Math.min(maxK,i+1);k++){
      const gram = genToks.slice(i-k+1, i+1).join(' ');
      if(trainGramSet.has(gram)) best = k; else break;
    }
    return best;
  });
}
function ngBuildGramSet(sents, maxK){
  const set = new Set();
  sents.forEach(line=>{
    const t = ngTok(line);
    for(let k=1;k<=maxK;k++) for(let i=0;i+k<=t.length;i++) set.add(t.slice(i,i+k).join(' '));
  });
  return set;
}

// ── MINI BPE (trained on NG_TRAIN only) ─────────────────────
function ngBpeTrain(sents, numMerges){
  const wordFreq = new Map();
  sents.forEach(l=>ngTok(l).forEach(w=>wordFreq.set(w,(wordFreq.get(w)||0)+1)));
  let words = []; wordFreq.forEach((f,w)=>words.push({sym: w.split('').concat(['_']), f}));
  const merges = [];
  for(let it=0; it<numMerges; it++){
    const pairs = new Map();
    words.forEach(({sym,f})=>{ for(let i=0;i<sym.length-1;i++){ const k=sym[i]+NG_SEP+sym[i+1]; pairs.set(k,(pairs.get(k)||0)+f); } });
    let best=null, bestC=0;
    pairs.forEach((c,k)=>{ if(c>bestC || (c===bestC && best!==null && k<best)){ best=k; bestC=c; } });
    if(!best || bestC<2) break;
    const [a,b] = best.split(NG_SEP);
    merges.push([a,b]);
    words = words.map(({sym,f})=>{
      const out=[]; let i=0;
      while(i<sym.length){ if(i<sym.length-1 && sym[i]===a && sym[i+1]===b){ out.push(a+b); i+=2; } else { out.push(sym[i]); i++; } }
      return {sym:out, f};
    });
  }
  const vocab = new Set(); words.forEach(({sym})=>sym.forEach(s=>vocab.add(s)));
  return {merges, vocab};
}
function ngBpeEncode(word, merges){
  let sym = word.toLowerCase().split('').concat(['_']);
  merges.forEach(([a,b])=>{
    const out=[]; let i=0;
    while(i<sym.length){ if(i<sym.length-1 && sym[i]===a && sym[i+1]===b){ out.push(a+b); i+=2; } else { out.push(sym[i]); i++; } }
    sym = out;
  });
  return sym;
}

// ── SHARED CANVAS / ANIM HELPERS ────────────────────────────
const NG_ANIM = {};
function ngStopAnims(){ Object.keys(NG_ANIM).forEach(k=>{ if(NG_ANIM[k]){ cancelAnimationFrame(NG_ANIM[k]); NG_ANIM[k]=null; } }); }
function ngLoop(key, elId, draw){
  if(NG_ANIM[key]) cancelAnimationFrame(NG_ANIM[key]);
  const tick = (ts)=>{
    const el = document.getElementById(elId);
    if(!el){ NG_ANIM[key]=null; return; }
    draw(ts);
    NG_ANIM[key] = requestAnimationFrame(tick);
  };
  NG_ANIM[key] = requestAnimationFrame(tick);
}
function ngCV(id, hCss){
  const cv = document.getElementById(id); if(!cv) return null;
  const dpr = window.devicePixelRatio||1;
  const w = cv.clientWidth || cv.parentElement.clientWidth || 600;
  const h = hCss || cv.clientHeight || 300;
  cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr);
  cv.style.height = h+'px';
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
  return {cv, ctx, W:w, H:h};
}
const NG_COL = {bg:'#0B101F', surface:'#111A30', surface2:'#182342', surface3:'#223055', border:'rgba(255,255,255,0.07)', border2:'rgba(255,255,255,0.12)', accent:'#4DE3FF', accent2:'#A18FFF', accent3:'#FF5F8E', accent4:'#3DDC84', text:'#ECF1FF', muted:'#8E9AC4', amber:'#ffb020'};
function ngFmtP(p){
  if(p===0) return '0';
  if(!isFinite(p)) return '&infin;';
  if(p>=0.01) return p.toFixed(3);
  if(p>=1e-4) return p.toFixed(5);
  return p.toExponential(2).replace('e','&times;10^').replace('^-','^&minus;');
}
function ngEsc(w){ return w==='<s>'?'&lt;s&gt;':w==='</s>'?'&lt;/s&gt;':w==='<unk>'?'&lt;unk&gt;':w; }
function ngPPfmt(pp){ return isFinite(pp) ? (pp>=100? pp.toFixed(0) : pp.toFixed(1)) : '&infin;'; }

// ── LAZY GLOBAL SUITE (orders 1..5, trained once on NG_TRAIN) ──
let NG_S = null;
function ngEnsure(){ if(!NG_S){ NG_S = [null]; for(let n=1;n<=5;n++) NG_S.push(ngTrainModel(NG_TRAIN, n)); } return NG_S; }

const NGRAM_PAGES = {};

// ════════════════════════════════════════════════════════════
// 3.1  N-GRAMS
// ════════════════════════════════════════════════════════════
NGRAM_PAGES.ngdef = `
<div class="lesson-chapter-label">Section 3.1</div>
<h1 class="lesson-h1">N-Grams</h1>
<p class="lesson-intro">Language modeling starts from one question: given the words so far, what comes next? Making that question precise, and then making it computable, is what the rest of this topic is about.</p>

<h2 class="lesson-h2">The Goal</h2>
<p class="lesson-p">Suppose a sentence begins "the lighthouse beam swept across the". A good model of English puts high probability on continuations like <em>bay</em>, <em>rocks</em>, or <em>water</em>, and almost none on <em>spreadsheet</em>. What we want is the conditional probability of a word given its entire preceding history:</p>
<div class="lesson-math">\\[P(w_n \\mid w_1, w_2, \\ldots, w_{n-1})\\]</div>
<p class="lesson-p">The obvious plan is to count: take a large corpus, count how often the full history appears, count how often it is followed by the target word, and divide. That fails because most sentences of any length have never been written before, so the count for a long history is almost always zero. The entire web is not large enough to fix this. Two ideas get us past it: a way to break a sentence into smaller pieces (the chain rule), and a way to make each piece estimable (the Markov assumption).</p>

<h2 class="lesson-h2">The Chain Rule, as a Proof You Can Run</h2>
<p class="lesson-p">The chain rule of probability decomposes a joint probability into a product of conditionals, and it is <em>exact</em>, with no approximation involved. The proof is the definition of conditional probability, \\(P(A, B) = P(B \\mid A)\\,P(A)\\), applied repeatedly. Rather than read the proof, step through it. Each press of the button applies that identity once, splitting off one more factor.</p>

<div class="viz-container" id="ngc-host">
  <div class="viz-header"><span class="viz-label">Interactive Proof &middot; The Chain Rule</span>
    <div style="display:flex;gap:.5rem;align-items:center">
      <select id="ngc-ex" onchange="ngcReset()" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.45rem .7rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">
        <option value="0">the fog rolls in</option>
        <option value="1">the keeper lights the lamp</option>
        <option value="2">the gulls follow the ferry</option>
      </select>
    </div>
  </div>
  <div class="viz-body">
    <div id="ngc-stage" style="min-height:120px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;padding:1rem .5rem;transition:all .3s"></div>
    <div id="ngc-eq" class="lesson-math" style="margin:1.2rem 0;text-align:center;overflow-x:auto"></div>
    <div id="ngc-note" style="font-family:var(--mono);font-size:.7rem;color:var(--muted);text-align:center;min-height:2.2em;line-height:1.7;margin-bottom:1rem"></div>
    <div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap">
      <button id="ngc-btn" onclick="ngcStep()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.6rem 1.4rem;font-family:var(--mono);font-size:.76rem;font-weight:700;cursor:pointer">Peel one factor &#8594;</button>
      <button id="ngc-markov" onclick="ngcMarkov()" style="display:none;background:var(--accent2);color:#fff;border:none;border-radius:8px;padding:.6rem 1.4rem;font-family:var(--mono);font-size:.76rem;font-weight:700;cursor:pointer">Apply the Markov assumption &#8594;</button>
      <button onclick="ngcReset()" style="background:var(--surface3);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.6rem 1rem;font-family:var(--mono);font-size:.76rem;cursor:pointer">&#8634; Reset</button>
    </div>
    <div id="ngc-stats" style="margin-top:1.4rem"></div>
  </div>
</div>

<h2 class="lesson-h2">The Markov Assumption</h2>
<p class="lesson-p">The chain rule is exact but not yet useful: its last factor still conditions on the entire history, which is the thing we cannot count. The way around this is the <strong>Markov assumption</strong>: treat the next word as depending only on the last few words rather than the whole past. A <strong>bigram</strong> model keeps one word of history, a <strong>trigram</strong> keeps two, and in general an <strong>n-gram</strong> keeps n&minus;1:</p>
<div class="lesson-math">\\[P(w_n \\mid w_1, \\ldots, w_{n-1}) \\;\\approx\\; P(w_n \\mid w_{n-N+1}, \\ldots, w_{n-1})\\]</div>
<p class="lesson-p">The tool below shows what the assumption discards. Words inside the context window are what the model is allowed to see; everything to the left of it is dropped. Adjust the order, switch examples, and click any word to make it the prediction target. The fourth example is chosen to show a case where the assumption <em>fails</em>: the word that determines the verb sits far outside any small window.</p>

<div class="viz-container" id="ngm-host">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Markov Window</span>
    <div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap">
      <button class="viz-fs-btn" onclick="vizToggleFull('ngm-host')" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .9rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">&#10530; Full screen</button>
      <select id="ngm-ex" onchange="ngmSetEx()" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.45rem .7rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">
        <option value="0">the fog rolls in from the sea</option>
        <option value="1">the keeper lights the lamp at dusk</option>
        <option value="2">the ferry carries the crates to the island</option>
        <option value="3">failure case: long-distance agreement</option>
      </select>
      <span style="font-family:var(--mono);font-size:.68rem;color:var(--muted)">n =</span>
      <input id="ngm-n" type="range" min="1" max="5" value="2" oninput="ngmDraw(true)" style="width:110px;accent-color:var(--accent)">
      <span id="ngm-nlab" style="font-family:var(--mono);font-size:.8rem;color:var(--accent);font-weight:700;min-width:1.2em">2</span>
    </div>
  </div>
  <div class="viz-body">
    <canvas id="ngm-canvas" style="width:100%;display:block"></canvas>
    <div id="ngm-eq" class="lesson-math" style="margin:1rem 0 .4rem;text-align:center;overflow-x:auto"></div>
    <div id="ngm-note" style="font-family:var(--mono);font-size:.7rem;color:var(--muted);text-align:center;min-height:2.4em;line-height:1.7"></div>
    <div id="ngm-params" style="margin-top:1rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Estimating the Probabilities: MLE</h2>
<p class="lesson-p">Where do the numbers come from? From counting, then normalizing. This is <strong>maximum likelihood estimation</strong>: among all possible parameter settings, the counts-divided-by-counts estimate is the one that makes the training corpus most probable. For a bigram:</p>
<div class="lesson-math">\\[P(w_n \\mid w_{n-1}) \\;=\\; \\frac{C(w_{n-1}\\, w_n)}{C(w_{n-1})}\\]</div>
<p class="lesson-p">A worked example on a three-sentence corpus, where each sentence is wrapped in a start token and an end token so the model can also learn how sentences begin and end:</p>
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;font-family:var(--mono);font-size:.8rem;line-height:1.9;margin:1rem 0">
&lt;s&gt; the tide rolls in &lt;/s&gt;<br>
&lt;s&gt; the fog rolls in &lt;/s&gt;<br>
&lt;s&gt; gulls follow the boats &lt;/s&gt;
</div>
<p class="lesson-p">Read the estimates straight off the counts. Sentences start with <em>the</em> twice out of three, so \\(P(\\text{the} \\mid \\langle s\\rangle) = \\tfrac{2}{3}\\). The word <em>rolls</em> is followed by <em>in</em> both times it occurs, so \\(P(\\text{in} \\mid \\text{rolls}) = \\tfrac{2}{2} = 1\\). And <em>the</em> occurs three times, followed once each by <em>tide</em>, <em>fog</em>, and <em>boats</em>:</p>
<div class="lesson-math">\\[P(\\text{tide} \\mid \\text{the}) = P(\\text{fog} \\mid \\text{the}) = P(\\text{boats} \\mid \\text{the}) = \\tfrac{1}{3}\\]</div>

<h2 class="lesson-h2">A Real Model You Can Drive</h2>
<p class="lesson-p">Three sentences make the arithmetic easy to follow, but they do not make a model. Below is a full n-gram model trained on the <strong>Saltmarsh Harbor corpus</strong>, the 112-sentence collection everything here runs on. Pick an order from 1 to 5 and inspect any context; the model shows its raw counts, the MLE division with the actual numbers substituted in, and the resulting distribution over next words. Everything from the sections above is visible in it: the padding tokens, the counts, the normalization.</p>

<div class="viz-container" id="ngx-host">
  <div class="viz-header"><span class="viz-label">Interactive Lab &middot; The Harbor Model</span>
    <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
      <div id="ngx-nbtns" style="display:flex;gap:4px"></div>
      <button class="viz-fs-btn" onclick="vizToggleFull('ngx-host')" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .9rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">&#10530; Full screen</button>
    </div>
  </div>
  <div class="viz-body" id="ngx-body">
    <div id="ngx-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.25rem">
      <div>
        <div id="ngx-stats" style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem"></div>
        <div style="font-family:var(--mono);font-size:.63rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem">Top <span id="ngx-toplab">n-grams</span> by count</div>
        <div id="ngx-top"></div>
        <div style="font-family:var(--mono);font-size:.63rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:1.2rem 0 .5rem">Training corpus (112 sentences)</div>
        <div id="ngx-corpus" style="max-height:170px;overflow-y:auto;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.7rem .9rem;font-family:var(--mono);font-size:.66rem;line-height:1.8;color:var(--muted)"></div>
      </div>
      <div>
        <div style="font-family:var(--mono);font-size:.63rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem">Context inspector &mdash; <span style="color:var(--accent)">click a suggestion, or click words in the corpus</span></div>
        <div id="ngx-ctx" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-height:44px;background:var(--surface2);border:1px solid var(--border2);border-radius:10px;padding:.55rem .7rem;margin-bottom:.6rem"></div>
        <div id="ngx-sugg" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:1rem"></div>
        <div id="ngx-mle" class="lesson-math" style="margin:.6rem 0;text-align:center;overflow-x:auto;background:var(--surface2);border-radius:10px;padding:.6rem"></div>
        <div id="ngx-cont" style="max-height:300px;overflow-y:auto"></div>
        <div style="display:flex;gap:.6rem;align-items:center;margin-top:1rem;flex-wrap:wrap">
          <button onclick="ngxExtend()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.55rem 1.1rem;font-family:var(--mono);font-size:.74rem;font-weight:700;cursor:pointer">&#127922; Sample next word</button>
          <button onclick="ngxUndo()" style="background:var(--surface3);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.55rem .9rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">&#8617; Undo</button>
          <span id="ngx-genlab" style="font-family:var(--mono);font-size:.68rem;color:var(--muted)"></span>
        </div>
      </div>
    </div>
    <div id="ngx-heatwrap" style="margin-top:1.4rem">
      <div style="font-family:var(--mono);font-size:.63rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem">Bigram count heatmap &mdash; 24 most frequent words &middot; hover a cell</div>
      <canvas id="ngx-heat" style="width:100%;display:block;border-radius:10px;cursor:crosshair"></canvas>
      <div id="ngx-heattip" style="font-family:var(--mono);font-size:.7rem;color:var(--text);min-height:1.6em;margin-top:.5rem"></div>
    </div>
  </div>
</div>

<h2 class="lesson-h2">Log Probabilities</h2>
<p class="lesson-p">Multiplying many small probabilities can underflow: the stored result rounds to zero. JavaScript numbers have a smallest positive value near \\(5\\times10^{-324}\\), with reduced precision below roughly \\(2.2\\times10^{-308}\\). Working with log probabilities avoids forming that tiny product:</p>
<div class="lesson-math">\\[\\log(p_1 \\, p_2 \\, p_3 \\cdots p_N) \\;=\\; \\log p_1 + \\log p_2 + \\log p_3 + \\cdots + \\log p_N\\]</div>
<p class="lesson-p">In log space, products become sums. This greatly extends the range of sequence lengths we can score, although floating-point rounding still applies. The demo compares the raw product with the log sum; for long enough text, the product rounds to zero while the log score remains usable.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Underflow Race</span>
    <div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap">
      <label style="font-family:var(--mono);font-size:.68rem;color:var(--muted);display:flex;align-items:center;gap:5px;cursor:pointer"><input id="ngl-f32" type="checkbox" onchange="nglReset()" style="accent-color:var(--accent3)"> float32 limits</label>
      <button id="ngl-play" onclick="nglPlay()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.1rem;font-family:var(--mono);font-size:.74rem;font-weight:700;cursor:pointer">&#9654; Score the text</button>
      <button onclick="nglReset()" style="background:var(--surface3);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem .9rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">&#8634;</button>
    </div>
  </div>
  <div class="viz-body">
    <canvas id="ngl-canvas" style="width:100%;display:block"></canvas>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem">
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.8rem 1rem">
        <div style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent3);margin-bottom:.4rem">Raw product &nbsp;&Pi; p&#7522;</div>
        <div id="ngl-prod" style="font-family:var(--mono);font-size:1.05rem;color:var(--text);word-break:break-all">1.0</div>
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.8rem 1rem">
        <div style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent4);margin-bottom:.4rem">Log sum &nbsp;&Sigma; log&#8322; p&#7522;</div>
        <div id="ngl-logsum" style="font-family:var(--mono);font-size:1.05rem;color:var(--text)">0.0</div>
      </div>
    </div>
    <div id="ngl-note" style="font-family:var(--mono);font-size:.7rem;color:var(--muted);margin-top:.8rem;min-height:1.6em;text-align:center"></div>
  </div>
</div>

<div class="lesson-note"><div class="lesson-note-label">Why the End Token Matters</div>
<p>The end token is not decoration. Without it, probabilities would only be comparable among sentences of the same length: you would have a separate distribution for each length rather than one distribution over all sentences. The end token lets the model spend probability on stopping, which is what makes the whole thing a single coherent distribution.</p></div>

<div class="quiz-block" id="qng1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In the harbor corpus, C(the) = 249 and C(the fog) = 18. What is the bigram MLE estimate of P(fog | the)?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qng1','Correct. MLE just divides: C(the fog)/C(the) = 18/249 &asymp; 0.072. You can verify it in the Harbor Model above.')">18 / 249 &asymp; 0.072</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng1','That inverts the conditioning: it would estimate P(the | fog) using the wrong denominator.')">249 / 18</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng1','Dividing by the corpus size gives the joint probability P(the, fog), not the conditional.')">18 / 911</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng1','MLE assigns zero only to events never seen in training; this bigram occurs 18 times.')">0</button>
</div><div class="quiz-explain" id="qng1-explain"></div></div>

<div class="quiz-block" id="qng1b"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">The chain rule decomposition of P(w&#8321;...w&#8345;) is exact, yet n-gram models are approximations. Where exactly does the approximation enter?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng1b','The chain rule itself is an identity of probability theory; it introduces no error.')">In the chain rule factorization</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qng1b','Correct. The chain rule is exact; error enters only when each conditional P(w | full history) is replaced by P(w | last n-1 words). That replacement is the Markov assumption.')">When each factor's history is truncated to n&minus;1 words</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng1b','Working in log space is numerically exact up to floating point; it changes representation, not the model.')">When probabilities are converted to logs</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng1b','Padding defines start-of-sentence context; it is part of the model, not an approximation.')">When sentences are padded with &lt;s&gt;</button>
</div><div class="quiz-explain" id="qng1b-explain"></div></div>`;

// ── 3.1 VIZ 1: CHAIN RULE INTERACTIVE PROOF ─────────────────
const NGC_EX = [['the','fog','rolls','in'],['the','keeper','lights','the','lamp'],['the','gulls','follow','the','ferry']];
let _ngc = {toks:NGC_EX[0], step:0, phase:'peel', order:2};
function ngcReset(){
  const sel = document.getElementById('ngc-ex');
  _ngc = {toks: NGC_EX[sel?+sel.value:0], step:0, phase:'peel', order:2};
  const mb = document.getElementById('ngc-markov'); if(mb) mb.style.display='none';
  const pb = document.getElementById('ngc-btn'); if(pb){ pb.style.display='inline-block'; pb.innerHTML='Peel one factor &#8594;'; }
  ngcRender();
}
function ngcStep(){
  if(_ngc.phase!=='peel') return;
  if(_ngc.step < _ngc.toks.length-1){ _ngc.step++; }
  if(_ngc.step >= _ngc.toks.length-1){
    _ngc.phase='done';
    const pb=document.getElementById('ngc-btn'); if(pb) pb.style.display='none';
    const mb=document.getElementById('ngc-markov'); if(mb) mb.style.display='inline-block';
  }
  ngcRender();
}
function ngcMarkov(){ _ngc.phase='markov'; ngcRender(); }
function ngcSetOrder(o){ _ngc.order=o; ngcRender(); }
function ngcChip(html, kind){
  const border = kind==='joint' ? NG_COL.accent : kind==='cond' ? NG_COL.accent2 : NG_COL.border2;
  const glow = kind==='new' ? `box-shadow:0 0 18px ${NG_COL.accent2}66;` : '';
  return `<div style="border:1.5px solid ${border};${glow}border-radius:10px;padding:.5rem .8rem;font-family:var(--mono);font-size:.78rem;color:var(--text);background:var(--surface2);transition:all .3s">${html}</div>`;
}
function ngcRender(){
  const stage=document.getElementById('ngc-stage'); if(!stage) return;
  const T=_ngc.toks, n=T.length, s=Math.min(_ngc.step, n-1);
  const esc=w=>w, tx=a=>a.join(' ');
  let chips=[], eqParts=[];
  if(_ngc.phase!=='markov'){
    const jointWords = T.slice(0, n-s);
    if(jointWords.length>1){
      chips.push(ngcChip(`P(&nbsp;${tx(jointWords)}&nbsp;)`, 'joint'));
      eqParts.push(`P(\\text{${tx(jointWords)}})`);
    } else {
      chips.push(ngcChip(`P(&nbsp;${T[0]}&nbsp;)`, 'cond'));
      eqParts.push(`P(\\text{${T[0]}})`);
    }
    for(let k=n-s; k<n; k++){
      const isNew = (k===n-s) && s>0;
      chips.push(`<div style="font-family:var(--mono);color:var(--muted);font-size:1rem">&times;</div>`);
      chips.push(ngcChip(`P(&nbsp;<span style="color:${NG_COL.accent4}">${T[k]}</span>&nbsp;|&nbsp;${tx(T.slice(0,k))}&nbsp;)`, isNew?'new':'cond'));
      eqParts.push(`P(\\text{${T[k]}} \\mid \\text{${tx(T.slice(0,k))}})`);
    }
    stage.innerHTML=chips.join('');
    const eq=document.getElementById('ngc-eq');
    eq.innerHTML = `\\[P(\\text{${tx(T)}}) = ${eqParts.join('\\; \\cdot \\;')}\\]`;
    const note=document.getElementById('ngc-note');
    if(s===0) note.innerHTML=`The joint probability of the whole sentence, unfactored. Press the button to apply \\(P(A,B)=P(B \\mid A)\\,P(A)\\) once, peeling the last word into its own conditional factor.`;
    else if(_ngc.phase==='peel') note.innerHTML=`Applied the identity ${s} time${s>1?'s':''}. Each factor so far is <em>exact</em> &mdash; the product still equals the original joint probability precisely.`;
    else note.innerHTML=`<span style="color:${NG_COL.accent4}">Fully factored, still exact.</span> But the rightmost factor conditions on ${n-1} words &mdash; a history we can never count reliably. Time for the approximation.`;
    ngcStats(false);
  } else {
    const o=_ngc.order;
    chips.push(ngcChip(`P(&nbsp;${T[0]}&nbsp;)`, 'cond'));
    eqParts.push(`P(\\text{${T[0]}})`);
    for(let k=1;k<n;k++){
      const keep=T.slice(Math.max(0,k-(o-1)), k), drop=T.slice(0, Math.max(0,k-(o-1)));
      chips.push(`<div style="font-family:var(--mono);color:var(--muted);font-size:1rem">&times;</div>`);
      const dropHtml = drop.length? `<span style="text-decoration:line-through;opacity:.3">${tx(drop)}</span> `:'';
      const keepHtml = keep.length? `<span style="color:${NG_COL.accent}">${tx(keep)}</span>` : `<span style="color:var(--muted)">&empty;</span>`;
      chips.push(ngcChip(`P(&nbsp;<span style="color:${NG_COL.accent4}">${T[k]}</span>&nbsp;|&nbsp;${dropHtml}${keepHtml}&nbsp;)`, 'cond'));
      eqParts.push(keep.length? `P(\\text{${T[k]}} \\mid \\text{${tx(keep)}})` : `P(\\text{${T[k]}})`);
    }
    stage.innerHTML=chips.join('');
    document.getElementById('ngc-eq').innerHTML=`\\[P(\\text{${tx(T)}}) \\;\\approx\\; ${eqParts.join('\\; \\cdot \\;')}\\]`;
    const oname = o===1?'unigram':o===2?'bigram':'trigram';
    document.getElementById('ngc-note').innerHTML=
      `The <span style="color:${NG_COL.accent}">${oname}</span> Markov assumption: each factor now sees only the last ${o-1} word${o===2?'':'s'}. `+
      `Struck-through history is <em>discarded</em>. The equality became an approximation &mdash; that &asymp; is where all n-gram error lives. &nbsp; Order: `+
      [1,2,3].map(x=>`<button onclick="ngcSetOrder(${x})" style="background:${x===o?'var(--accent)':'var(--surface3)'};color:${x===o?'var(--bg)':'var(--muted)'};border:1px solid var(--border2);border-radius:6px;padding:2px 9px;font-family:var(--mono);font-size:.68rem;cursor:pointer;margin:0 2px">${x===1?'uni':x===2?'bi':'tri'}</button>`).join('');
    ngcStats(true);
  }
  if(typeof renderMath==='function') renderMath(document.getElementById('ngc-eq'));
  if(typeof renderMath==='function') renderMath(document.getElementById('ngc-note'));
}
function ngcStats(markov){
  const el=document.getElementById('ngc-stats'); if(!el) return;
  const V=162, n=_ngc.toks.length;
  const fullCells = Math.pow(V, n-1)*V;
  const rows=[{lab:`Exact model &mdash; table for the last factor: V<sup>${n-1}</sup> contexts &times; V words`, val:fullCells, col:NG_COL.accent3}];
  if(markov){
    const o=_ngc.order, mk=Math.pow(V,o-1)*V;
    rows.push({lab:`${o===1?'Unigram':o===2?'Bigram':'Trigram'} model &mdash; V<sup>${o-1}</sup> contexts &times; V words, <em>independent of sentence length</em>`, val:mk, col:NG_COL.accent4});
  }
  const maxLog=Math.log10(fullCells);
  el.innerHTML = `<div style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem">Parameters needed (V = 162, harbor vocabulary) &mdash; log scale</div>`+
    rows.map(r=>{
      const w=Math.max(4, Math.log10(r.val)/maxLog*100);
      const disp = r.val>=1e6 ? r.val.toExponential(1).replace('e+','&times;10^') : Math.round(r.val).toLocaleString();
      return `<div style="margin-bottom:.5rem"><div style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-bottom:3px">${r.lab}</div>
        <div style="display:flex;align-items:center;gap:8px"><div style="height:10px;border-radius:5px;background:linear-gradient(90deg,${r.col}44,${r.col});width:${w}%;box-shadow:0 0 10px ${r.col}55"></div>
        <span style="font-family:var(--mono);font-size:.72rem;color:${r.col};font-weight:700;white-space:nowrap">${disp} cells</span></div></div>`;
    }).join('');
}

// ── 3.1 VIZ 2: MARKOV WINDOW MACHINE ────────────────────────
const NGM_EX = [
  {toks:['the','fog','rolls','in','from','the','sea'], target:6, note:''},
  {toks:['the','keeper','lights','the','lamp','at','dusk'], target:6, note:''},
  {toks:['the','ferry','carries','the','crates','to','the','island'], target:7, note:''},
  {toks:['the','gulls','that','circled','the','lonely','lighthouse','before','dawn','were','hungry'], target:9,
   note:`Long-distance dependency: only <em>gulls</em>, nine words back, licenses the plural <em>were</em>. A bigram window sees just <em>dawn</em>; even a 5-gram misses the subject. This is the price of the Markov assumption.`}
];
let _ngm = {ex:0, target:6, rects:[], alpha:{}, particles:[], lastT:0};
function ngmSetEx(){
  const sel=document.getElementById('ngm-ex');
  _ngm.ex = sel?+sel.value:0;
  _ngm.target = NGM_EX[_ngm.ex].target;
  _ngm.alpha = {}; _ngm.particles = [];
  ngmDraw(true);
}
function ngmDraw(force){
  const nEl=document.getElementById('ngm-n'); if(!nEl) return;
  const n=+nEl.value;
  const lab=document.getElementById('ngm-nlab'); if(lab) lab.textContent=n;
  const ex=NGM_EX[_ngm.ex], T=ex.toks, tgt=_ngm.target;
  const winStart=Math.max(0, tgt-(n-1));
  const padCount=Math.max(0,(n-1)-tgt);
  // equation
  const full = tgt>0 ? T.slice(0,tgt).join(' ') : '\\langle s\\rangle';
  const winArr = []; for(let i=0;i<padCount;i++) winArr.push('\\langle s\\rangle');
  const winTxt = winArr.map(x=>x).concat(T.slice(winStart,tgt).map(w=>`\\text{${w}}`)).join('\\,');
  const eqEl=document.getElementById('ngm-eq');
  if(eqEl){
    const lhs = tgt>0 ? `P(\\text{${T[tgt]}} \\mid \\text{${full}})` : `P(\\text{${T[tgt]}} \\mid \\langle s\\rangle)`;
    const rhs = (n===1) ? `P(\\text{${T[tgt]}})` : `P(\\text{${T[tgt]}} \\mid ${winTxt})`;
    eqEl.innerHTML = `\\[${lhs} \\;\\approx\\; ${rhs}\\]`;
    if(typeof renderMath==='function') renderMath(eqEl);
  }
  const dropped=Math.max(0, tgt-(n-1));
  const note=document.getElementById('ngm-note');
  if(note) note.innerHTML = (ex.note?ex.note+'<br>':'') +
    `<span style="color:${NG_COL.accent}">window:</span> ${n-1} word${n===2?'':'s'} of context &nbsp;&middot;&nbsp; <span style="color:${NG_COL.accent3}">history discarded:</span> ${dropped} word${dropped===1?'':'s'} &nbsp;&middot;&nbsp; click any word to predict it instead`;
  const pEl=document.getElementById('ngm-params');
  if(pEl){
    const V=162, cells=Math.pow(V,n-1)*V;
    const disp=cells>=1e6?cells.toExponential(1).replace('e+','&times;10^'):Math.round(cells).toLocaleString();
    const w=Math.max(4, (n-1)/4*100);
    pEl.innerHTML=`<div style="display:flex;align-items:center;gap:10px"><span style="font-family:var(--mono);font-size:.64rem;color:var(--muted)">table size at n=${n}:</span>
      <div style="flex:1;max-width:260px;height:9px;border-radius:5px;background:var(--surface3);overflow:hidden"><div style="height:100%;width:${w}%;background:linear-gradient(90deg,${NG_COL.accent},${NG_COL.accent2});box-shadow:0 0 8px ${NG_COL.accent}77;transition:width .4s"></div></div>
      <span style="font-family:var(--mono);font-size:.7rem;color:${NG_COL.accent};font-weight:700">${disp} cells</span></div>`;
  }
  if(force) ngmStartLoop();
}
function ngmStartLoop(){
  ngLoop('ngm','ngm-canvas',(ts)=>{
    const nEl=document.getElementById('ngm-n'); if(!nEl) return;
    const n=+nEl.value, ex=NGM_EX[_ngm.ex], T=ex.toks, tgt=_ngm.target;
    const winStart=Math.max(0,tgt-(n-1)), padCount=Math.max(0,(n-1)-tgt);
    const items=[]; for(let i=0;i<padCount;i++) items.push({w:'<s>',kind:'pad'});
    T.forEach((w,i)=>items.push({w, kind: i===tgt?'target': (i>=winStart&&i<tgt)?'win': i<tgt?'drop':'future', idx:i}));
    const c=ngCV('ngm-canvas', 150); if(!c) return;
    const {ctx,W,H}=c;
    ctx.clearRect(0,0,W,H);
    ctx.font='600 13px "IBM Plex Mono", monospace';
    const padX=14, gap=8; let widths=items.map(it=>ctx.measureText(it.w==='<s>'?'⟨s⟩':it.w).width+padX*2);
    let total=widths.reduce((a,b)=>a+b,0)+gap*(items.length-1);
    let scale=Math.min(1, (W-24)/total);
    ctx.font=`600 ${13*scale}px "IBM Plex Mono", monospace`;
    widths=items.map(it=>ctx.measureText(it.w==='<s>'?'⟨s⟩':it.w).width+padX*2*scale);
    total=widths.reduce((a,b)=>a+b,0)+gap*(items.length-1);
    let x=(W-total)/2, y=H/2-19, bh=38;
    const dt=Math.min(50, ts-(_ngm.lastT||ts)); _ngm.lastT=ts;
    _ngm.rects=[];
    items.forEach((it,k)=>{
      const bw=widths[k];
      const key=k+':'+it.kind;
      const targetA = it.kind==='drop'?0.22 : it.kind==='pad'?0.5 : 1;
      _ngm.alpha[key]=_ngm.alpha[key]==null?targetA:_ngm.alpha[key]+(targetA-_ngm.alpha[key])*Math.min(1,dt/180);
      const a=_ngm.alpha[key];
      ctx.save(); ctx.globalAlpha=a;
      let stroke=NG_COL.border2, fill='rgba(255,255,255,0.03)', txt=NG_COL.text, blur=0;
      if(it.kind==='target'){ stroke=NG_COL.accent4; fill='rgba(61,220,132,0.09)'; txt=NG_COL.accent4; blur=14; }
      else if(it.kind==='win'){ stroke=NG_COL.accent; fill='rgba(77,227,255,0.09)'; txt=NG_COL.accent; blur=9; }
      else if(it.kind==='pad'){ stroke=NG_COL.accent+'66'; txt=NG_COL.muted; }
      else if(it.kind==='drop'){ txt=NG_COL.muted; }
      if(blur){ ctx.shadowColor=stroke; ctx.shadowBlur=blur; }
      ctx.beginPath(); ctx.roundRect(x,y,bw,bh,9);
      ctx.fillStyle=fill; ctx.fill();
      ctx.lineWidth=1.4; ctx.strokeStyle=stroke; ctx.stroke();
      ctx.shadowBlur=0;
      ctx.fillStyle=txt; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(it.w==='<s>'?'⟨s⟩':it.w, x+bw/2, y+bh/2);
      ctx.restore();
      if(it.idx!=null) _ngm.rects.push({x,y,w:bw,h:bh,idx:it.idx});
      // spawn dissolve particles from dropped words
      if(it.kind==='drop' && Math.random()<0.10){
        _ngm.particles.push({x:x+Math.random()*bw, y:y+Math.random()*bh, vx:-(0.12+Math.random()*0.25), vy:-(0.15+Math.random()*0.3), life:1});
      }
      x+=bw+gap;
    });
    // window bracket
    const winRects=_ngm.rects.filter(r=>{ const it=items.find(i=>i.idx===r.idx); return false; });
    // particles
    _ngm.particles=_ngm.particles.filter(p=>p.life>0);
    if(_ngm.particles.length>140)_ngm.particles.splice(0,_ngm.particles.length-140);
    _ngm.particles.forEach(p=>{
      p.x+=p.vx*dt*0.06; p.y+=p.vy*dt*0.06; p.life-=dt*0.0009;
      ctx.globalAlpha=Math.max(0,p.life)*0.5;
      ctx.fillStyle=NG_COL.muted;
      ctx.beginPath(); ctx.arc(p.x,p.y,1.3,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=1;
    // labels
    ctx.font='500 9.5px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.muted; ctx.textAlign='center';
    ctx.fillText('FORGOTTEN', W/2-((W-total)/2)/1, 16);
    ctx.save(); ctx.fillStyle=NG_COL.accent; ctx.fillText('CONTEXT WINDOW  (n−1 = '+(n-1)+')', W/2, H-12); ctx.restore();
  });
  const cv=document.getElementById('ngm-canvas');
  if(cv && !cv._ngmBound){
    cv._ngmBound=true;
    cv.addEventListener('click',(e)=>{
      const r=cv.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top;
      const hit=_ngm.rects.find(b=>mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h);
      if(hit){ _ngm.target=hit.idx; _ngm.alpha={}; ngmDraw(false); }
    });
  }
}

// ── 3.1 VIZ 3: THE HARBOR MODEL EXPLORER ────────────────────
let _ngx = {n:2, ctx:[], sel:null, tape:[], rng:null, hover:null, heat:null};
function ngxInit(){
  ngEnsure();
  _ngx = {n:2, ctx:['the'], sel:null, tape:[], rng:ngRng(42), hover:null, heat:null};
  const nb=document.getElementById('ngx-nbtns');
  if(nb) nb.innerHTML=[1,2,3,4,5].map(x=>`<button id="ngx-nb${x}" onclick="ngxSetN(${x})" style="background:${x===_ngx.n?'var(--accent)':'var(--surface3)'};color:${x===_ngx.n?'var(--bg)':'var(--muted)'};border:1px solid var(--border2);border-radius:7px;padding:.4rem .7rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">n=${x}</button>`).join('');
  const cp=document.getElementById('ngx-corpus');
  if(cp) cp.innerHTML=NG_TRAIN.map(s=>'<div>'+s.split(' ').map(w=>`<span onclick="ngxWord('${w}')" style="cursor:pointer;border-radius:3px;padding:0 1px" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color=''">${w}</span>`).join(' ')+'</div>').join('');
  ngxRefresh();
}
function ngxSetN(n){
  _ngx.n=n; _ngx.sel=null;
  _ngx.ctx=_ngx.ctx.slice(-(Math.max(0,n-1)));
  [1,2,3,4,5].forEach(x=>{ const b=document.getElementById('ngx-nb'+x); if(b){ b.style.background=x===n?'var(--accent)':'var(--surface3)'; b.style.color=x===n?'var(--bg)':'var(--muted)'; } });
  ngxRefresh();
}
function ngxWord(w){ const k=Math.max(0,_ngx.n-1); _ngx.ctx.push(w); _ngx.ctx=_ngx.ctx.slice(-k); _ngx.sel=null; _ngx.tape=[]; ngxRefresh(); }
function ngxSetCtx(key){ _ngx.ctx = key==='' ? [] : key.split(NG_SEP); _ngx.sel=null; _ngx.tape=[]; ngxRefresh(); }
function ngxUndo(){ _ngx.ctx.pop(); _ngx.sel=null; _ngx.tape.pop(); ngxRefresh(); }
function ngxPad(){ const k=Math.max(0,_ngx.n-1); const c=_ngx.ctx.slice(-k); while(c.length<k) c.unshift('<s>'); return c; }
function ngxExtend(){
  const S=ngEnsure(), n=_ngx.n, eff=ngxPad();
  let dist=ngDist(S,n,eff,'mle');
  if(!dist.length) dist=ngDist(S,1,[],'mle');
  const u=_ngx.rng(); let acc=0, pick=dist[dist.length-1];
  for(const d of dist){ acc+=d.p; if(u<=acc+1e-12){ pick=d; break; } }
  if(pick.w==='</s>'){ _ngx.tape.push('</s>'); _ngx.ctx=[]; }
  else { _ngx.tape.push(pick.w); const k=Math.max(0,n-1); _ngx.ctx.push(pick.w); _ngx.ctx=_ngx.ctx.slice(-k); }
  _ngx.sel=pick.w;
  ngxRefresh();
}
function ngxRefresh(){
  const S=ngEnsure(), n=_ngx.n, m=S[n];
  // stats
  let grams=0; m.ctx.forEach(e=>grams+=e.next.size);
  const st=document.getElementById('ngx-stats');
  const chip=(l,v,c)=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.4rem .7rem"><div style="font-family:var(--mono);font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">${l}</div><div style="font-family:var(--mono);font-size:.85rem;font-weight:700;color:${c||'var(--text)'}">${v}</div></div>`;
  if(st) st.innerHTML=chip('sentences',NG_TRAIN.length)+chip('tokens',m.uniTot)+chip('vocabulary',m.V)+chip('distinct contexts',m.n===1?1:m.ctx.size,NG_COL.accent)+chip('distinct '+n+'-grams',grams,NG_COL.accent2);
  const tl=document.getElementById('ngx-toplab'); if(tl) tl.textContent=(n===1?'unigrams':n===2?'bigrams':n===3?'trigrams':n+'-grams');
  // top n-grams
  const rows=[];
  m.ctx.forEach((e,key)=>e.next.forEach((c,w)=>rows.push({key,w,c})));
  rows.sort((a,b)=>b.c-a.c || (a.key+a.w).localeCompare(b.key+b.w));
  const top=rows.slice(0,12), mx=top.length?top[0].c:1;
  const te=document.getElementById('ngx-top');
  if(te) te.innerHTML=top.map(r=>{
    const gram=(r.key?r.key.split(NG_SEP).map(ngEsc).join(' ')+' ':'')+ngEsc(r.w);
    return `<div onclick="ngxSetCtx('${r.key.replace(/'/g,"\\'")}')" style="display:flex;align-items:center;gap:8px;margin-bottom:5px;cursor:pointer">
      <div style="flex:0 0 46%;font-family:var(--mono);font-size:.68rem;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${gram}</div>
      <div style="flex:1;height:9px;border-radius:5px;background:var(--surface3);overflow:hidden"><div style="height:100%;width:${r.c/mx*100}%;background:linear-gradient(90deg,${NG_COL.accent}55,${NG_COL.accent});box-shadow:0 0 8px ${NG_COL.accent}44"></div></div>
      <div style="font-family:var(--mono);font-size:.68rem;color:${NG_COL.accent};font-weight:700;min-width:2em;text-align:right">${r.c}</div></div>`;
  }).join('');
  // context chips
  const eff=ngxPad(), ce=document.getElementById('ngx-ctx');
  if(ce){
    if(n===1) ce.innerHTML=`<span style="font-family:var(--mono);font-size:.72rem;color:var(--muted)">no context &mdash; a unigram model conditions on nothing</span>`;
    else ce.innerHTML=eff.map((w,i)=>{
      const isPad=w==='<s>'&&i<eff.length-_ngx.ctx.length;
      return `<span style="font-family:var(--mono);font-size:.78rem;padding:.32rem .6rem;border-radius:7px;border:1.4px solid ${isPad?'var(--border2)':'var(--accent)'};color:${isPad?'var(--muted)':'var(--accent)'};background:${isPad?'transparent':'rgba(77,227,255,0.07)'}">${ngEsc(w)}</span>`;
    }).join('')+`<span style="font-family:var(--mono);font-size:.9rem;color:var(--accent4);font-weight:700;margin-left:2px">?</span>`;
  }
  // suggestions
  const sg=document.getElementById('ngx-sugg');
  if(sg){
    if(n===1) sg.innerHTML='';
    else {
      const ctxs=[]; m.ctx.forEach((e,key)=>ctxs.push({key,tot:e.tot}));
      ctxs.sort((a,b)=>b.tot-a.tot);
      sg.innerHTML='<span style="font-family:var(--mono);font-size:.6rem;color:var(--muted);align-self:center">try:</span>'+ctxs.slice(0,8).map(c=>`<button onclick="ngxSetCtx('${c.key.replace(/'/g,"\\'")}')" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:6px;padding:.28rem .55rem;font-family:var(--mono);font-size:.64rem;cursor:pointer">${c.key.split(NG_SEP).map(ngEsc).join(' ')}</button>`).join('');
    }
  }
  // continuation table + MLE formula
  const e=m.ctx.get(n===1?'':eff.join(NG_SEP));
  const cont=document.getElementById('ngx-cont'), mle=document.getElementById('ngx-mle');
  if(!e){
    if(cont) cont.innerHTML=`<div style="font-family:var(--mono);font-size:.72rem;color:${NG_COL.accent3};padding:.8rem;background:rgba(255,95,142,0.06);border:1px solid rgba(255,95,142,0.25);border-radius:10px;line-height:1.7">This context never occurs in training: C(${eff.map(ngEsc).join(' ')}) = 0. The MLE is undefined and the model is stuck &mdash; exactly the failure that smoothing (&sect;3.6) exists to fix.</div>`;
    if(mle) mle.innerHTML='';
  } else {
    const list=[]; e.next.forEach((c,w)=>list.push({w,c,p:c/e.tot}));
    list.sort((a,b)=>b.p-a.p||a.w.localeCompare(b.w));
    if(_ngx.sel==null || !list.find(x=>x.w===_ngx.sel)) _ngx.sel=list[0].w;
    const pick=list.find(x=>x.w===_ngx.sel);
    if(mle){
      const ctxTex = n===1 ? '' : ' \\mid ' + eff.map(w=>w==='<s>'?'\\langle s\\rangle':`\\text{${w}}`).join('\\,');
      const cw = _ngx.sel==='</s>' ? '\\langle/s\\rangle' : `\\text{${_ngx.sel}}`;
      const ctxC = n===1 ? '\\bullet' : eff.map(w=>w==='<s>'?'\\langle s\\rangle':`\\text{${w}}`).join('\\,');
      mle.innerHTML = n===1
        ? `\\[P(${cw}) = \\frac{C(${cw})}{N} = \\frac{${pick.c}}{${e.tot}} = ${(pick.p).toFixed(4)}\\]`
        : `\\[P(${cw}${ctxTex}) = \\frac{C(${ctxC}\\;${cw})}{C(${ctxC})} = \\frac{${pick.c}}{${e.tot}} = ${(pick.p).toFixed(4)}\\]`;
      if(typeof renderMath==='function') renderMath(mle);
    }
    if(cont){
      const mx2=list[0].p;
      cont.innerHTML=`<div style="font-family:var(--mono);font-size:.6rem;color:var(--muted);margin-bottom:6px">C(context) = ${e.tot} &nbsp;&middot;&nbsp; ${list.length} distinct continuations &nbsp;&middot;&nbsp; click a row for its MLE arithmetic</div>`+
        list.slice(0,40).map(r=>{
          const on=r.w===_ngx.sel;
          return `<div onclick="_ngx.sel='${r.w.replace(/'/g,"\\'")}';ngxRefresh()" style="display:flex;align-items:center;gap:8px;margin-bottom:4px;cursor:pointer;padding:3px 6px;border-radius:7px;background:${on?'rgba(77,227,255,0.08)':'transparent'};border:1px solid ${on?'rgba(77,227,255,0.35)':'transparent'}">
            <div style="flex:0 0 26%;font-family:var(--mono);font-size:.72rem;color:${on?'var(--accent)':'var(--text)'};font-weight:${on?700:400}">${ngEsc(r.w)}</div>
            <div style="flex:0 0 3.4em;font-family:var(--mono);font-size:.66rem;color:var(--muted)">${r.c}/${e.tot}</div>
            <div style="flex:1;height:8px;border-radius:4px;background:var(--surface3);overflow:hidden"><div style="height:100%;width:${r.p/mx2*100}%;background:linear-gradient(90deg,${NG_COL.accent2}66,${NG_COL.accent2});box-shadow:0 0 7px ${NG_COL.accent2}55"></div></div>
            <div style="flex:0 0 3.6em;font-family:var(--mono);font-size:.68rem;color:${NG_COL.accent2};text-align:right">${r.p.toFixed(3)}</div></div>`;
        }).join('');
    }
  }
  const gl=document.getElementById('ngx-genlab');
  if(gl) gl.innerHTML=_ngx.tape.length?('generated: <span style="color:var(--accent4)">'+_ngx.tape.map(ngEsc).join(' ')+'</span>'):'';
  // heatmap only for n=2
  const hw=document.getElementById('ngx-heatwrap');
  if(hw) hw.style.display = n===2 ? 'block' : 'none';
  if(n===2) ngxHeat();
}
function ngxHeat(){
  const S=ngEnsure(), m1=S[1], m2=S[2];
  const words=[]; m1.uni.forEach((c,w)=>{ if(w!=='</s>') words.push({w,c}); });
  words.sort((a,b)=>b.c-a.c); const top=words.slice(0,24).map(x=>x.w);
  const c=ngCV('ngx-heat', 460); if(!c) return;
  const {cv,ctx,W,H}=c;
  const left=76, topPad=66, cell=Math.min((W-left-8)/24, (H-topPad-8)/24);
  let mx=1; const grid=[];
  top.forEach((r,i)=>{ grid[i]=[]; top.forEach((col,j)=>{ const v=ngCount(m2,[r],col); grid[i][j]=v; if(v>mx)mx=v; }); });
  _ngx.heat={top,left,topPad,cell,grid};
  ctx.clearRect(0,0,W,H);
  ctx.font='500 9px "IBM Plex Mono", monospace';
  top.forEach((w,i)=>{
    ctx.fillStyle=(_ngx.hover&&_ngx.hover.i===i)?NG_COL.accent:NG_COL.muted;
    ctx.textAlign='right'; ctx.textBaseline='middle';
    ctx.fillText(w, left-6, topPad+i*cell+cell/2);
    ctx.save(); ctx.translate(left+i*cell+cell/2, topPad-6); ctx.rotate(-Math.PI/3);
    ctx.textAlign='left'; ctx.textBaseline='middle';
    ctx.fillStyle=(_ngx.hover&&_ngx.hover.j===i)?NG_COL.accent:NG_COL.muted;
    ctx.fillText(w,0,0); ctx.restore();
  });
  for(let i=0;i<24;i++) for(let j=0;j<24;j++){
    const v=grid[i][j], t=Math.log(1+v)/Math.log(1+mx);
    const x=left+j*cell, y=topPad+i*cell;
    if(v>0){
      const r1=Math.round(0+123*t), g1=Math.round(229-132*t), b1=255;
      ctx.fillStyle=`rgba(${r1},${g1},${b1},${0.15+0.85*t})`;
      if(t>0.65){ ctx.shadowColor=NG_COL.accent; ctx.shadowBlur=7; }
      ctx.fillRect(x+1,y+1,cell-2,cell-2);
      ctx.shadowBlur=0;
    } else { ctx.fillStyle='rgba(255,255,255,0.025)'; ctx.fillRect(x+1,y+1,cell-2,cell-2); }
  }
  if(_ngx.hover){
    const {i,j}=_ngx.hover;
    ctx.strokeStyle=NG_COL.accent4; ctx.lineWidth=1.6;
    ctx.strokeRect(left+j*cell+0.5, topPad+i*cell+0.5, cell-1, cell-1);
  }
  ctx.fillStyle=NG_COL.muted; ctx.font='500 9.5px "IBM Plex Mono", monospace'; ctx.textAlign='left';
  ctx.fillText('row = first word, column = next word · brightness = log count', left, H-4);
  if(!cv._ngxBound){
    cv._ngxBound=true;
    cv.addEventListener('mousemove',(e)=>{
      const r=cv.getBoundingClientRect(), h=_ngx.heat; if(!h) return;
      const mx2=e.clientX-r.left, my=e.clientY-r.top;
      const j=Math.floor((mx2-h.left)/h.cell), i=Math.floor((my-h.topPad)/h.cell);
      const tip=document.getElementById('ngx-heattip');
      if(i>=0&&i<24&&j>=0&&j<24){
        _ngx.hover={i,j};
        const S2=ngEnsure(), cN=h.grid[i][j], tot=ngCtxTot(S2[2],[h.top[i]]);
        if(tip) tip.innerHTML=`C(<span style="color:var(--accent)">${h.top[i]} ${h.top[j]}</span>) = <strong>${cN}</strong> &nbsp;&middot;&nbsp; P(${h.top[j]} | ${h.top[i]}) = ${cN}/${tot} = <span style="color:var(--accent2)">${(cN/tot).toFixed(4)}</span>`;
      } else { _ngx.hover=null; if(tip) tip.innerHTML=''; }
      ngxHeat();
    });
    cv.addEventListener('click',()=>{ if(_ngx.hover&&_ngx.heat){ ngxSetCtx(_ngx.heat.top[_ngx.hover.i]); } });
  }
}

// ── 3.1 VIZ 4: THE UNDERFLOW RACE ───────────────────────────
let _ngl = {probs:[], i:0, prod:1, prod32:1, lsum:0, playing:false, dead:-1, flash:0};
function nglBuild(){
  ngEnsure();
  const sents=[]; for(let r=0;r<4;r++) sents.push(...NG_TEST, ...NG_DEV);
  const probs=[];
  sents.forEach(line=>{
    const toks=ngMapUnk(ngTok(line), NG_S[1].vocab);
    ngScoreSentence(NG_S,2,toks,'addk',{k:0.05}).steps.forEach(s=>probs.push(s.p));
  });
  return probs;
}
function nglReset(){
  _ngl={probs:nglBuild(), i:0, prod:1, prod32:1, lsum:0, playing:false, dead:-1, flash:0};
  const b=document.getElementById('ngl-play'); if(b) b.innerHTML='&#9654; Score the text';
  nglLoopStart();
}
function nglPlay(){
  _ngl.playing=!_ngl.playing;
  const b=document.getElementById('ngl-play'); if(b) b.innerHTML=_ngl.playing?'&#10074;&#10074; Pause':'&#9654; Score the text';
  if(_ngl.i>=_ngl.probs.length){ nglReset(); _ngl.playing=true; const b2=document.getElementById('ngl-play'); if(b2) b2.innerHTML='&#10074;&#10074; Pause'; }
  nglLoopStart();
}
function nglLoopStart(){
  ngLoop('ngl','ngl-canvas',()=>{
    const f32=document.getElementById('ngl-f32'); if(!f32) return;
    const use32=f32.checked;
    if(_ngl.playing && _ngl.i<_ngl.probs.length){
      for(let k=0;k<3 && _ngl.i<_ngl.probs.length;k++){
        const p=_ngl.probs[_ngl.i];
        if(use32){ _ngl.prod32=Math.fround(_ngl.prod32*Math.fround(p)); if(_ngl.prod32===0&&_ngl.dead<0){_ngl.dead=_ngl.i;_ngl.flash=1;} }
        else { _ngl.prod=_ngl.prod*p; if(_ngl.prod===0&&_ngl.dead<0){_ngl.dead=_ngl.i;_ngl.flash=1;} }
        _ngl.lsum+=Math.log2(p);
        _ngl.i++;
      }
      if(_ngl.i>=_ngl.probs.length) _ngl.playing=false;
    }
    nglDraw(use32);
  });
}
function nglDraw(use32){
  const c=ngCV('ngl-canvas', 240); if(!c) return;
  const {ctx,W,H}=c;
  ctx.clearRect(0,0,W,H);
  const N=_ngl.probs.length, padL=56, padR=14, padT=16, padB=26;
  const pw=W-padL-padR, ph=H-padT-padB;
  const yMin = use32 ? -50 : -340;
  const xAt=i=>padL+i/N*pw, yAt=v=>padT+Math.min(1,Math.max(0,(0-v)/(0-yMin)))*ph;
  if(_ngl.flash>0){ ctx.fillStyle=`rgba(255,95,142,${_ngl.flash*0.14})`; ctx.fillRect(0,0,W,H); _ngl.flash=Math.max(0,_ngl.flash-0.02); }
  // axes
  ctx.strokeStyle=NG_COL.border2; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(padL,padT); ctx.lineTo(padL,padT+ph); ctx.lineTo(padL+pw,padT+ph); ctx.stroke();
  ctx.font='500 9px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.muted; ctx.textAlign='right';
  for(let v=0;v>=yMin;v-= (use32?10:50)){ ctx.fillText('1e'+v, padL-6, yAt(v)+3); ctx.strokeStyle=NG_COL.border; ctx.beginPath(); ctx.moveTo(padL,yAt(v)); ctx.lineTo(padL+pw,yAt(v)); ctx.stroke(); }
  ctx.textAlign='center'; ctx.fillText('tokens scored →', padL+pw/2, H-6);
  // underflow line
  const uf = use32 ? Math.log10(1.4e-45) : Math.log10(5e-324);
  ctx.strokeStyle=NG_COL.accent3; ctx.setLineDash([5,4]); ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(padL, yAt(uf)); ctx.lineTo(padL+pw, yAt(uf)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle=NG_COL.accent3; ctx.textAlign='left';
  ctx.fillText('smallest positive float'+(use32?'32':'64'), padL+6, yAt(uf)-5);
  // curves (recompute cumulative log10 for drawing)
  let l10=0, dead=false;
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.strokeStyle=NG_COL.accent3; ctx.shadowColor=NG_COL.accent3; ctx.shadowBlur=6;
  for(let i=0;i<_ngl.i;i++){
    l10+=Math.log10(_ngl.probs[i]);
    const isDead = _ngl.dead>=0 && i>=_ngl.dead;
    const y = isDead ? padT+ph : yAt(l10);
    if(i===0) ctx.moveTo(xAt(i),y); else ctx.lineTo(xAt(i),y);
    if(isDead && !dead){ dead=true; ctx.stroke(); ctx.beginPath(); ctx.moveTo(xAt(i), padT+ph); }
  }
  ctx.stroke(); ctx.shadowBlur=0;
  if(_ngl.dead>=0){
    ctx.fillStyle=NG_COL.accent3; ctx.font='700 10px "IBM Plex Mono", monospace'; ctx.textAlign='center';
    ctx.fillText('⚡ UNDERFLOW — stored value is now exactly 0.0', xAt(_ngl.dead), Math.min(padT+ph-8, yAt(uf)+18));
  }
  // log-sum curve: same shape but represented as healthy (draw slightly offset via bits axis mapped onto same range)
  let ls=0;
  ctx.beginPath(); ctx.strokeStyle=NG_COL.accent4; ctx.shadowColor=NG_COL.accent4; ctx.shadowBlur=6; ctx.lineWidth=2;
  for(let i=0;i<_ngl.i;i++){
    ls+=Math.log2(_ngl.probs[i]);
    const asL10=ls*Math.log10(2);
    const y=yAt(Math.max(yMin+2, asL10));
    if(i===0) ctx.moveTo(xAt(i),y); else ctx.lineTo(xAt(i),y);
  }
  ctx.stroke(); ctx.shadowBlur=0;
  ctx.font='600 9.5px "IBM Plex Mono", monospace'; ctx.textAlign='left';
  ctx.fillStyle=NG_COL.accent3; ctx.fillText('raw product (what the float stores)', padL+8, padT+12);
  ctx.fillStyle=NG_COL.accent4; ctx.fillText('log sum (never dies — clamped to axis)', padL+8, padT+26);
  // readouts
  const pr=document.getElementById('ngl-prod'), lsr=document.getElementById('ngl-logsum'), note=document.getElementById('ngl-note');
  const val=use32?_ngl.prod32:_ngl.prod;
  if(pr) pr.innerHTML = _ngl.i===0 ? '1.0' : (val===0 ? '<span style="color:var(--accent3);font-weight:700">0.0 &nbsp;(underflow — all information destroyed)</span>' : val.toExponential(3).replace('e-','&times;10^&minus;'));
  if(lsr) lsr.innerHTML = _ngl.lsum.toFixed(1)+' bits <span style="color:var(--muted);font-size:.7rem">(= '+( _ngl.i? (_ngl.lsum/_ngl.i).toFixed(2):'0')+' bits/word)</span>';
  if(note){
    if(_ngl.dead>=0) note.innerHTML=`the product died after <strong style="color:var(--accent3)">${_ngl.dead}</strong> tokens; the log sum is still exact at token ${_ngl.i} of ${N} &mdash; and adding logs is all that perplexity (&sect;3.3) will need`;
    else note.innerHTML = _ngl.i? `token ${_ngl.i} of ${N} &middot; every token multiplies in one more probability &asymp; makes the product exponentially smaller`:`press play &mdash; the same ${N}-token harbor text is scored on both tracks with the same bigram model`;
  }
}

// ════════════════════════════════════════════════════════════
// 3.2  EVALUATING LANGUAGE MODELS: TRAIN & TEST SETS
// ════════════════════════════════════════════════════════════
NGRAM_PAGES.ngeval = `
<div class="lesson-chapter-label">Section 3.2</div>
<h1 class="lesson-h1">Evaluating Language Models: Train &amp; Test Sets</h1>
<p class="lesson-intro">A model that reproduces its training data perfectly but fails on anything new is not useful. Measuring real quality means measuring on data the model has never seen, and being careful about which data plays which role.</p>

<h2 class="lesson-h2">Two Ways to Evaluate</h2>
<p class="lesson-p"><strong>Extrinsic evaluation</strong> puts the language model inside a real application, such as a spelling corrector, a translation system, or a speech recognizer, and measures whether that application improves. It is the standard we actually care about, because it measures the thing we actually want. It is also slow and expensive, since you have to run the whole pipeline end to end for every model variant you want to compare. <strong>Intrinsic evaluation</strong> instead measures a property of the model itself, independent of any application. For language models the standard intrinsic metric is perplexity, the subject of the next section. Intrinsic metrics are fast and cheap, but they are proxies: an improvement in perplexity is worth something only to the extent that it predicts an improvement on a real task.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Extrinsic Evaluation: Two Models, One Task</span>
    <div style="display:flex;gap:.6rem;align-items:center">
      <button id="nge-play" onclick="ngePlay()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.1rem;font-family:var(--mono);font-size:.74rem;font-weight:700;cursor:pointer">&#9654; Run the task</button>
      <button onclick="ngeReset()" style="background:var(--surface3);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem .9rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">&#8634;</button>
    </div>
  </div>
  <div class="viz-body">
    <p style="font-family:var(--body);font-size:.85rem;color:var(--muted);margin:0 0 1rem;line-height:1.7">The downstream task: a correction system hits a garbled word and must choose among three repair candidates. Each model scores the three full sentences and picks its favorite. Neither model is told the answer. We simply count which one helps the task more. Watch which one earns its keep.</p>
    <div id="nge-item" style="min-height:130px;background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:1rem 1.2rem;margin-bottom:1rem"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:.9rem 1.1rem">
        <div style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:.4rem">Model A &middot; trigram (uses context)</div>
        <div id="nge-accA" style="font-family:var(--mono);font-size:1.3rem;font-weight:700;color:var(--text)">0 / 0</div>
        <div id="nge-barA" style="height:9px;border-radius:5px;background:var(--surface3);overflow:hidden;margin-top:.5rem"><div style="height:100%;width:0%;background:linear-gradient(90deg,#4DE3FF66,#4DE3FF);transition:width .4s"></div></div>
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:.9rem 1.1rem">
        <div style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent3);margin-bottom:.4rem">Model B &middot; unigram (ignores context)</div>
        <div id="nge-accB" style="font-family:var(--mono);font-size:1.3rem;font-weight:700;color:var(--text)">0 / 0</div>
        <div id="nge-barB" style="height:9px;border-radius:5px;background:var(--surface3);overflow:hidden;margin-top:.5rem"><div style="height:100%;width:0%;background:linear-gradient(90deg,#FF5F8E66,#FF5F8E);transition:width .4s"></div></div>
      </div>
    </div>
    <div id="nge-verdict" style="font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-top:1rem;min-height:2.2em;text-align:center;line-height:1.7"></div>
  </div>
</div>

<h2 class="lesson-h2">Three Datasets, Three Jobs</h2>
<p class="lesson-p">Intrinsic evaluation needs held-out data, and in practice you need <em>two</em> kinds of held-out data. So the corpus is split three ways, and each split has one job:</p>
<p class="lesson-p">The <strong>training set</strong> is what the model learns from; for an n-gram model, it is the text you take counts from. You may look at it as much as you like. The <strong>development set</strong> (dev set, or validation set) is held-out data used for the decisions <em>you</em> make while building the model: choosing n, tuning smoothing constants, picking interpolation weights. You will evaluate on it dozens of times, and that is what it is for. The <strong>test set</strong> is held-out data that answers one question, once, at the end: how good is the finished model on text it has never seen? As soon as you start making choices based on test-set numbers, it has become a second dev set and stopped measuring generalization.</p>
<p class="lesson-p">Below, the whole harbor corpus is laid out block by block. Each panel scores one real sentence from its split under the <em>same</em> trained trigram model, word by word, so you can see with actual numbers what it means to say that a model fits its training data better than unseen data. Then try the contamination experiment.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Anatomy of a Split</span>
    <div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap">
      <button id="ngs-leak" onclick="ngsLeak()" style="background:var(--surface3);color:var(--accent3);border:1px solid rgba(255,95,142,0.4);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">&#9760; Leak a test sentence into training</button>
    </div>
  </div>
  <div class="viz-body">
    <canvas id="ngs-canvas" style="width:100%;display:block"></canvas>
    <div id="ngs-banner" style="display:none;margin:1rem 0 0;background:rgba(255,95,142,0.08);border:1px solid rgba(255,95,142,0.35);border-radius:10px;padding:.8rem 1rem;font-family:var(--mono);font-size:.72rem;color:var(--accent3);line-height:1.8"></div>
    <div id="ngs-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;margin-top:1.2rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Matching the Domain</h2>
<p class="lesson-p">Held-out data should resemble the text you actually care about. A model intended for chemistry lectures should be tested on chemistry lectures; a model for social media should be tested on social media. The harbor model meets an out-of-domain test set in the next section, and the difference in perplexity is large. For a general-purpose model, draw training and test data from many sources, and split at the document level so the test set does not end up being one author, one topic, or one day of news.</p>

<div class="lesson-note"><div class="lesson-note-label">Data Contamination</div>
<p>If test sentences appear in training, evaluation can overstate performance on new text. Repeatedly choosing model settings from test results creates a related problem: the settings adapt to that test set. Use validation data for those decisions and reserve the test set for the final comparison.</p></div>

<div class="quiz-block" id="qng2"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">You compare k = 0.05, 0.5, and 1.0 for add-k smoothing by computing perplexity on a held-out set, pick the winner, and then report a final number. Which data should each step use?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qng2','Correct. Model choices (like k) are tuned on dev; the untouched test set is used once for the final report, so it still measures true generalization.')">Tune k on the dev set; report once on the test set</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng2','Choosing k by test perplexity is fitting the test set: the final number will be optimistically biased.')">Tune k on the test set; report on the test set</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng2','Training-set perplexity rewards memorization and cannot compare generalization at all.')">Tune k on the training set; report on the training set</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng2','Reporting on dev leaks your tuning choices into the reported number; it is systematically too rosy.')">Tune k on the dev set; report on the dev set</button>
</div><div class="quiz-explain" id="qng2-explain"></div></div>`;

// ── 3.2 VIZ 1: EXTRINSIC EVALUATION RACE ────────────────────
const NGE_ITEMS = [
  {pre:'the keeper lights the', post:'at dusk', bad:'lomp', cands:['lamp','sea','harbor'], ans:'lamp'},
  {pre:'the fishermen haul the', post:'at dawn', bad:'nots', cands:['nets','the','boats'], ans:'nets'},
  {pre:'the fog rolls in from the', post:'', bad:'sae', cands:['sea','fog','tide'], ans:'sea'},
  {pre:'the gulls circle over the', post:'', bad:'boots', cands:['boats','storm','morning'], ans:'boats'},
  {pre:'the ferry returns to the', post:'at dusk', bad:'harbr', cands:['harbor','sea','gulls'], ans:'harbor'},
  {pre:'the keeper rings the', post:'in the fog', bad:'bell', cands:['bell','pier','water'], ans:'bell'},
  {pre:'the tide rolls', post:'at dawn', bad:'inn', cands:['in','the','over'], ans:'in'},
  {pre:'the beam sweeps across the', post:'at night', bad:'rockz', cands:['rocks','keeper','fishermen'], ans:'rocks'},
  {pre:'the market opens when the boats', post:'', bad:'retorn', cands:['return','rolls','harbor'], ans:'return'},
  {pre:'the wind rises before the', post:'', bad:'strom', cands:['storm','pier','market'], ans:'storm'}
];
let _nge = {i:0, a:0, b:0, playing:false, timer:null};
function ngeScore(sent, n){
  const S=ngEnsure();
  const toks=ngMapUnk(ngTok(sent), S[1].vocab);
  return ngScoreSentence(S, n, toks, 'addk', {k:0.05}).lp;
}
function ngeReset(){
  _nge={i:0,a:0,b:0,playing:false,timer:null};
  if(_nge.timer) clearTimeout(_nge.timer);
  const b=document.getElementById('nge-play'); if(b) b.innerHTML='&#9654; Run the task';
  const it=document.getElementById('nge-item');
  if(it) it.innerHTML='<div style="font-family:var(--mono);font-size:.72rem;color:var(--muted);text-align:center;padding:2rem 0">ten garbled sentences are waiting &mdash; press run</div>';
  ngeCounters(); const v=document.getElementById('nge-verdict'); if(v) v.innerHTML='';
}
function ngePlay(){
  if(_nge.playing) return;
  if(_nge.i>=NGE_ITEMS.length){ ngeReset(); }
  _nge.playing=true;
  const b=document.getElementById('nge-play'); if(b) b.innerHTML='running&hellip;';
  ngeStep();
}
function ngeStep(){
  if(!document.getElementById('nge-item')){ _nge.playing=false; return; }
  if(_nge.i>=NGE_ITEMS.length){
    _nge.playing=false;
    const b=document.getElementById('nge-play'); if(b) b.innerHTML='&#9654; Run again';
    const v=document.getElementById('nge-verdict');
    if(v) v.innerHTML=`<span style="color:var(--accent)">Model A: ${_nge.a}/10</span> vs <span style="color:var(--accent3)">Model B: ${_nge.b}/10</span>. That gap <em>is</em> the extrinsic evaluation: the trigram is the better model because it makes the task better. No probabilities were compared directly &mdash; only task accuracy.`;
    return;
  }
  const item=NGE_ITEMS[_nge.i];
  const scored=item.cands.map(c=>{
    const sent=(item.pre+' '+c+' '+item.post).trim();
    return {c, sA:ngeScore(sent,3), sB:ngeScore(sent,1)};
  });
  const pickA=scored.reduce((m,x)=>x.sA>m.sA?x:m).c;
  const pickB=scored.reduce((m,x)=>x.sB>m.sB?x:m).c;
  const okA=pickA===item.ans, okB=pickB===item.ans;
  if(okA)_nge.a++; if(okB)_nge.b++;
  const maxA=Math.max(...scored.map(s=>s.sA)), minA=Math.min(...scored.map(s=>s.sA));
  const maxB=Math.max(...scored.map(s=>s.sB)), minB=Math.min(...scored.map(s=>s.sB));
  const row=(m,pick,ok,col)=>scored.map(s=>{
    const sc=m==='A'?s.sA:s.sB, mx=m==='A'?maxA:maxB, mn=m==='A'?minA:minB;
    const w=mx===mn?100:8+92*(sc-mn)/(mx-mn);
    const on=s.c===pick;
    return `<div style="display:flex;align-items:center;gap:7px;margin-bottom:3px">
      <div style="flex:0 0 5.2em;font-family:var(--mono);font-size:.7rem;color:${on?col:'var(--muted)'};font-weight:${on?700:400}">${s.c}${on?(ok?' ✓':' ✗'):''}</div>
      <div style="flex:1;height:7px;border-radius:4px;background:var(--surface3);overflow:hidden"><div style="height:100%;width:${w}%;background:${col}${on?'':'44'}"></div></div>
      <div style="flex:0 0 4.6em;font-family:var(--mono);font-size:.62rem;color:var(--muted);text-align:right">${sc.toFixed(1)} bits</div></div>`;
  }).join('');
  const it=document.getElementById('nge-item');
  if(it) it.innerHTML=`
    <div style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-bottom:.5rem">item ${_nge.i+1}/10 &mdash; garbled input:</div>
    <div style="font-family:var(--mono);font-size:.85rem;color:var(--text);margin-bottom:.9rem">${item.pre} <span style="color:var(--accent3);text-decoration:underline wavy">${item.bad}</span> ${item.post}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.2rem">
      <div><div style="font-family:var(--mono);font-size:.6rem;color:var(--accent);text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px">A scores (trigram, log&#8322;)</div>${row('A',pickA,okA,'#4DE3FF')}</div>
      <div><div style="font-family:var(--mono);font-size:.6rem;color:var(--accent3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px">B scores (unigram, log&#8322;)</div>${row('B',pickB,okB,'#FF5F8E')}</div>
    </div>`;
  _nge.i++;
  ngeCounters();
  _nge.timer=setTimeout(ngeStep, 1600);
}
function ngeCounters(){
  const aa=document.getElementById('nge-accA'), bb=document.getElementById('nge-accB');
  if(aa) aa.textContent=_nge.a+' / '+_nge.i;
  if(bb) bb.textContent=_nge.b+' / '+_nge.i;
  const ba=document.getElementById('nge-barA'), bb2=document.getElementById('nge-barB');
  if(ba) ba.firstElementChild.style.width=(_nge.i?_nge.a/NGE_ITEMS.length*100:0)+'%';
  if(bb2) bb2.firstElementChild.style.width=(_nge.i?_nge.b/NGE_ITEMS.length*100:0)+'%';
}

// ── 3.2 VIZ 2: ANATOMY OF A SPLIT ───────────────────────────
let _ngs = {leaked:false, flow:[], lastT:0};
function ngsInit(){ _ngs={leaked:false, flow:[], lastT:0}; ngsCards(); ngsLoopStart(); const bn=document.getElementById('ngs-banner'); if(bn) bn.style.display='none'; }
function ngsLeak(){
  _ngs.leaked=!_ngs.leaked;
  const btn=document.getElementById('ngs-leak');
  if(btn) btn.innerHTML=_ngs.leaked?'&#8634; Undo the leak':'&#9760; Leak a test sentence into training';
  ngsCards();
}
function ngsModel(leaked){
  const train = leaked ? NG_TRAIN.concat([NG_TEST[2]]) : NG_TRAIN;
  const suite=[null]; for(let n=1;n<=3;n++) suite.push(ngTrainModel(train,n));
  return suite;
}
function ngsCards(){
  const el=document.getElementById('ngs-cards'); if(!el) return;
  const lam=[0.2,0.55,0.25];
  const S=ngsModel(_ngs.leaked);
  const sents={train:NG_TRAIN[8], dev:NG_DEV[0], test:NG_TEST[2]};
  const meta=[
    {key:'train', name:'TRAINING SET', n:NG_TRAIN.length, col:'#4DE3FF', job:'counts are taken from here', touch:'read freely, forever'},
    {key:'dev', name:'DEV SET', n:NG_DEV.length, col:'#ffb020', job:'tune n, k, and &lambda; here', touch:'evaluate as often as you like'},
    {key:'test', name:'TEST SET', n:NG_TEST.length, col:'#FF5F8E', job:'final generalization number', touch:'opened once, at the end'}
  ];
  const ppTest=ngPerplexity(S,3,NG_TEST,'interp',{lam}).pp;
  el.innerHTML=meta.map(mt=>{
    const line=sents[mt.key];
    const toks=ngMapUnk(ngTok(line), S[1].vocab);
    const r=ngScoreSentence(S,3,toks,'interp',{lam});
    const avg=Math.pow(2, r.lp/r.N);
    const chips=r.steps.map(s=>{
      const heat=Math.min(1, Math.max(0, (Math.log2(Math.max(s.p,1e-9))+9)/9));
      return `<span title="P = ${s.p.toFixed(4)}" style="font-family:var(--mono);font-size:.64rem;padding:2px 5px;border-radius:5px;margin:1px;display:inline-block;background:${mt.col}${Math.round(10+heat*45).toString(16).padStart(2,'0')};color:var(--text)">${ngEsc(s.w)}<span style="opacity:.65;font-size:.55rem"> ${s.p>=0.995?'1.0':s.p.toFixed(2).replace('0.','.')}</span></span>`;
    }).join('');
    const leakNote = mt.key==='test' && _ngs.leaked ? `<div style="color:var(--accent3);font-size:.62rem;margin-top:.4rem">⚠ this exact sentence is now in the training counts</div>`:'';
    return `<div style="background:var(--surface2);border:1px solid ${mt.col}33;border-radius:12px;padding:.9rem 1rem">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.3rem">
        <span style="font-family:var(--mono);font-size:.64rem;letter-spacing:.12em;color:${mt.col};font-weight:700">${mt.name}</span>
        <span style="font-family:var(--mono);font-size:.6rem;color:var(--muted)">${mt.n} sentences</span></div>
      <div style="font-family:var(--mono);font-size:.62rem;color:var(--text);line-height:1.7;margin-bottom:.15rem">job: ${mt.job}</div>
      <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);line-height:1.7;margin-bottom:.6rem">access: ${mt.touch}</div>
      <div style="font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:4px">one of its sentences, scored by the same trigram:</div>
      <div style="line-height:2">${chips}</div>
      <div style="font-family:var(--mono);font-size:.66rem;color:${mt.col};margin-top:.5rem">avg per-word probability &asymp; <strong>${avg.toFixed(3)}</strong> &nbsp;(${(r.lp).toFixed(1)} bits total)</div>
      ${leakNote}</div>`;
  }).join('');
  const bn=document.getElementById('ngs-banner');
  if(bn){
    if(_ngs.leaked){
      const clean=ngsModel(false);
      const ppClean=ngPerplexity(clean,3,NG_TEST,'interp',{lam}).pp;
      bn.style.display='block';
      bn.innerHTML=`Test perplexity just "improved" from <strong>${ppClean.toFixed(1)}</strong> to <strong>${ppTest.toFixed(1)}</strong> &mdash; but the model is not one bit better at unseen language. The leaked sentence's per-word probabilities above jumped because the model has simply <em>seen the answers</em>. This is why the test set stays sealed: the number must measure the model, not the leak.`;
    } else bn.style.display='none';
  }
}
function ngsLoopStart(){
  ngLoop('ngs','ngs-canvas',(ts)=>{
    const c=ngCV('ngs-canvas', 120); if(!c) return;
    const {ctx,W,H}=c;
    ctx.clearRect(0,0,W,H);
    const total=NG_TRAIN.length+NG_DEV.length+NG_TEST.length;
    const gap=1.4, bw=(W-24-gap*(total-1))/total;
    let x=12;
    const dt=Math.min(60, ts-(_ngs.lastT||ts)); _ngs.lastT=ts;
    const seg=[{n:NG_TRAIN.length,col:'#4DE3FF',lab:'TRAIN 82%'},{n:NG_DEV.length,col:'#ffb020',lab:'DEV 9%'},{n:NG_TEST.length,col:'#FF5F8E',lab:'TEST 9%'}];
    seg.forEach((s,si)=>{
      const x0=x;
      for(let i=0;i<s.n;i++){
        const pulse=0.72+0.28*Math.sin(ts/700+ (x/40));
        ctx.fillStyle=s.col; ctx.globalAlpha=(si===2?0.85:0.7)*pulse;
        ctx.fillRect(x, 34, bw, 30);
        x+=bw+gap;
      }
      ctx.globalAlpha=1;
      ctx.font='700 10px "IBM Plex Mono", monospace'; ctx.fillStyle=s.col; ctx.textAlign='center';
      ctx.fillText(s.lab, (x0+x-gap)/2, 24);
      if(si===2){
        ctx.font='600 12px "IBM Plex Mono", monospace';
        ctx.fillText(_ngs.leaked?'⚠':'🔒', (x0+x-gap)/2, 84);
      } else {
        ctx.font='500 9px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.muted;
        ctx.fillText(si===0?'→ counts':'→ tuning', (x0+x-gap)/2, 82);
      }
    });
    if(_ngs.leaked){
      // animated leak arc: from test region to train region
      if(Math.random()<0.15) _ngs.flow.push({t:0});
      _ngs.flow=_ngs.flow.filter(p=>p.t<1);
      _ngs.flow.forEach(p=>{
        p.t+=dt*0.0006;
        const sx=W-70, sy=50, ex=W*0.35, ey=50;
        const mx=(sx+ex)/2, my=-10;
        const t=p.t, ix=(1-t)*(1-t)*sx+2*(1-t)*t*mx+t*t*ex, iy=(1-t)*(1-t)*sy+2*(1-t)*t*my+t*t*ey;
        ctx.fillStyle=NG_COL.accent3; ctx.globalAlpha=0.9;
        ctx.shadowColor=NG_COL.accent3; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.arc(ix,iy,2.4,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=0; ctx.globalAlpha=1;
      });
    }
    ctx.font='500 9.5px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.muted; ctx.textAlign='center';
    ctx.fillText('the harbor corpus — one block per sentence · 112 / 12 / 12', W/2, H-6);
  });
}

// ════════════════════════════════════════════════════════════
// 3.3  PERPLEXITY
// ════════════════════════════════════════════════════════════
NGRAM_PAGES.ngppl = `
<div class="lesson-chapter-label">Section 3.3</div>
<h1 class="lesson-h1">Perplexity</h1>
<p class="lesson-intro">A sequence’s probability usually shrinks as it gets longer. Perplexity uses average log probability per token to account for length. It is useful for comparing models evaluated with the same tokenization on the same text.</p>

<h2 class="lesson-h2">The Definition</h2>
<p class="lesson-p">The perplexity of a model on a test set W of N words is the inverse probability of the test set, normalized by taking the Nth root:</p>
<div class="lesson-math">\\[\\text{PP}(W) \\;=\\; P(w_1 w_2 \\ldots w_N)^{-\\frac{1}{N}} \\;=\\; \\sqrt[N]{\\frac{1}{P(w_1 w_2 \\ldots w_N)}}\\]</div>
<p class="lesson-p">Higher probability on the test text means lower perplexity. Taking the Nth root makes perplexity a per-token measure, but comparable numbers still require the same tokenization and evaluation conditions. A short test set will also give a less stable estimate.</p>

<h2 class="lesson-h2">What the Number Means</h2>
<p class="lesson-p">Perplexity has a concrete reading: it is the <strong>effective branching factor</strong> of the language under the model. A model with perplexity 30 is, on average, as uncertain as if it were choosing uniformly among 30 equally likely next words at every step. The simplest case is a language of ten digits, each with probability 1/10, which has perplexity exactly 10. If the digits are <em>not</em> equally likely, uncertainty drops and perplexity drops with it, even though the vocabulary is still ten items. Sharpen the distribution below and the number of effective branches falls.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Perplexity as a Branching Factor</span>
    <div style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap">
      <button onclick="ngpPreset('uniform')" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.4rem .7rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">uniform digits</button>
      <button onclick="ngpPreset('favorite')" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.4rem .7rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">one favorite</button>
      <button onclick="ngpPreset('harbor')" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.4rem .7rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">P(&middot;|the) from the harbor</button>
    </div>
  </div>
  <div class="viz-body">
    <canvas id="ngp-canvas" style="width:100%;display:block"></canvas>
    <div style="display:flex;gap:1rem;align-items:center;margin-top:.9rem;flex-wrap:wrap">
      <span style="font-family:var(--mono);font-size:.68rem;color:var(--muted)">sharpness</span>
      <input id="ngp-sharp" type="range" min="0" max="100" value="0" oninput="ngpFromSlider()" style="flex:1;min-width:150px;accent-color:var(--accent)">
      <span id="ngp-read" style="font-family:var(--mono);font-size:.82rem;color:var(--accent4);font-weight:700"></span>
    </div>
    <div id="ngp-models" style="margin-top:1.2rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Where the Formula Comes From</h2>
<p class="lesson-p">The definition is not arbitrary. Perplexity is the exponential of <strong>cross-entropy</strong>, it is a <strong>geometric mean</strong> of the per-word inverse probabilities, and its inverse relationship with probability is what makes it usable as a training objective. The derivation map below walks each route one step at a time; the third tab computes the geometric mean on the harbor test set so you can confirm it lands on the same number as the perplexity.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Derivation Map &middot; Three Routes to the Same Number</span>
    <div id="ngd-tabs" style="display:flex;gap:4px"></div>
  </div>
  <div class="viz-body">
    <div id="ngd-steps"></div>
    <div style="display:flex;gap:.6rem;justify-content:center;margin-top:1rem">
      <button id="ngd-next" onclick="ngdNext()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.55rem 1.3rem;font-family:var(--mono);font-size:.74rem;font-weight:700;cursor:pointer">Next step &#8594;</button>
      <button onclick="ngdReset()" style="background:var(--surface3);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.55rem 1rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">&#8634;</button>
    </div>
  </div>
</div>

<h2 class="lesson-h2">The Perplexity Lab</h2>
<p class="lesson-p">The lab below holds all three splits of the harbor corpus in editable text boxes. Press <em>train &amp; evaluate</em> and it trains four models, unigram through 4-gram, on the training box, then measures perplexity on all three sets. Start with MLE: the held-out columns go to &infin;, because one unseen n-gram is enough to zero out the whole product. Switch to add-k, then to interpolation, and use the dev column, never the test column, to pick the best setting. Then turn on the out-of-domain test set to see what domain mismatch does to a language model.</p>

<div class="viz-container" id="ngv-host">
  <div class="viz-header"><span class="viz-label">Interactive Lab &middot; Train Four Models, Evaluate Honestly</span>
    <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
      <button onclick="ngvRun()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.74rem;font-weight:700;cursor:pointer">&#9654; Train &amp; evaluate</button>
      <button class="viz-fs-btn" onclick="vizToggleFull('ngv-host')" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .9rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">&#10530; Full screen</button>
    </div>
  </div>
  <div class="viz-body">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-bottom:1rem">
      <div><div style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:#4DE3FF;margin-bottom:5px">Training set</div>
        <textarea id="ngv-train" rows="6" style="width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.6rem .8rem;font-family:var(--mono);font-size:.68rem;color:var(--text);outline:none;resize:vertical;line-height:1.6"></textarea></div>
      <div><div style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:#ffb020;margin-bottom:5px">Dev set</div>
        <textarea id="ngv-dev" rows="6" style="width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.6rem .8rem;font-family:var(--mono);font-size:.68rem;color:var(--text);outline:none;resize:vertical;line-height:1.6"></textarea></div>
      <div><div style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:#FF5F8E;margin-bottom:5px">Test set <label style="font-size:.58rem;color:var(--muted);text-transform:none;letter-spacing:0;margin-left:8px;cursor:pointer"><input id="ngv-ood" type="checkbox" onchange="ngvOod()" style="accent-color:var(--accent3);vertical-align:-2px"> out-of-domain</label></div>
        <textarea id="ngv-test" rows="6" style="width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.6rem .8rem;font-family:var(--mono);font-size:.68rem;color:var(--text);outline:none;resize:vertical;line-height:1.6"></textarea></div>
    </div>
    <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem">
      <span style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">estimator:</span>
      <div id="ngv-modes" style="display:flex;gap:4px"></div>
      <span id="ngv-kwrap" style="display:none;font-family:var(--mono);font-size:.66rem;color:var(--muted)">k = <input id="ngv-k" type="range" min="1" max="100" value="5" oninput="document.getElementById('ngv-klab').textContent=(this.value/100).toFixed(2);ngvRun()" style="width:110px;accent-color:var(--accent);vertical-align:middle"> <span id="ngv-klab" style="color:var(--accent)">0.05</span></span>
      <span id="ngv-note" style="font-family:var(--mono);font-size:.64rem;color:var(--muted)"></span>
    </div>
    <canvas id="ngv-chart" style="width:100%;display:block"></canvas>
    <div id="ngv-table" style="margin-top:1rem;overflow-x:auto"></div>
    <div id="ngv-verdict" style="font-family:var(--mono);font-size:.72rem;color:var(--text);margin-top:.8rem;line-height:1.9;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.8rem 1rem"></div>
  </div>
</div>

<div class="lesson-note"><div class="lesson-note-label">Compare Perplexities Only on Equal Terms</div>
<p>Perplexity comparisons are meaningful only between models sharing the same vocabulary and the same test set. A model can lower its perplexity by shrinking its vocabulary (fewer choices means less surprise), and different test sets have wildly different inherent difficulty. In the lab above, all four models share one vocabulary and one test box, so the comparison is fair.</p></div>

<div class="quiz-block" id="qng3"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A test text consists of digits 0&ndash;9, but the digit 0 appears far more often than the rest. Compared to the uniform case, the perplexity of a model matching the true frequencies is:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng3','Perplexity 10 is the uniform-uncertainty ceiling here; skew reduces uncertainty below it.')">Exactly 10, since there are 10 digits</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qng3','Correct. Skewed frequencies mean less average uncertainty per symbol, so the effective branching factor drops below the vocabulary size of 10.')">Less than 10</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng3','More surprise would require the model to be worse than uniform, not better matched.')">More than 10</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng3','Perplexity is well-defined for any distribution the model assigns nonzero probabilities under.')">Undefined</button>
</div><div class="quiz-explain" id="qng3-explain"></div></div>

<div class="quiz-block" id="qng3b"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In the lab, the 4-gram model usually has the <em>lowest training</em> perplexity yet loses on the dev set. The correct conclusion is:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng3b','Training perplexity rewards memorization; the 4-gram is fitting noise, not language.')">Pick the 4-gram: best training perplexity wins</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qng3b','Correct. Model selection happens on dev. Low train + high dev perplexity is the signature of overfitting, so a lower-order or interpolated model is chosen instead.')">Pick the dev-set winner: the 4-gram is overfitting</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng3b','The test column is opened once for the final report, never for choosing between models.')">Pick whichever wins on the test set</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng3b','The disagreement is informative, not broken: it is exactly what overfitting looks like.')">The lab is broken; the columns must agree</button>
</div><div class="quiz-explain" id="qng3b-explain"></div></div>`;

// ── 3.3 VIZ 1: BRANCHING FACTOR MACHINE ─────────────────────
let _ngp = {probs:[], labels:[], preset:'uniform'};
function ngpPreset(name){
  _ngp.preset=name;
  const sl=document.getElementById('ngp-sharp');
  if(name==='uniform'){ _ngp.labels=['0','1','2','3','4','5','6','7','8','9']; _ngp.probs=Array(10).fill(0.1); if(sl) sl.value=0; }
  else if(name==='favorite'){ _ngp.labels=['0','1','2','3','4','5','6','7','8','9']; if(sl) sl.value=70; ngpFromSlider(true); return; }
  else {
    ngEnsure();
    const d=ngDist(NG_S,2,['the'],'mle').slice(0,10);
    const z=d.reduce((a,x)=>a+x.p,0);
    _ngp.labels=d.map(x=>x.w); _ngp.probs=d.map(x=>x.p/z);
    if(sl) sl.value=0;
  }
  ngpLoopStart();
}
function ngpFromSlider(skip){
  const sl=document.getElementById('ngp-sharp'); if(!sl) return;
  const t=+sl.value/100;
  if(_ngp.preset==='harbor' && !skip){
    ngEnsure();
    const d=ngDist(NG_S,2,['the'],'mle').slice(0,10);
    const z0=d.reduce((a,x)=>a+x.p,0);
    let raw=d.map(x=>Math.pow(x.p/z0, 1+4*t));
    const z=raw.reduce((a,b)=>a+b,0);
    _ngp.probs=raw.map(x=>x/z); _ngp.labels=d.map(x=>x.w);
  } else {
    // interpolate uniform -> heavily peaked on one symbol
    const K=10, peak=0.1+0.89*t;
    const rest=(1-peak)/(K-1);
    _ngp.probs=Array.from({length:K},(_,i)=>i===0?peak:rest);
    _ngp.labels=['0','1','2','3','4','5','6','7','8','9'];
  }
  ngpLoopStart();
}
function ngpLoopStart(){
  ngLoop('ngp','ngp-canvas',(ts)=>{
    const c=ngCV('ngp-canvas', 250); if(!c) return;
    const {ctx,W,H}=c;
    ctx.clearRect(0,0,W,H);
    const P=_ngp.probs, L=_ngp.labels;
    const H2 = -P.reduce((a,p)=>a+(p>0?p*Math.log2(p):0),0);
    const pp = Math.pow(2,H2);
    // left: distribution bars
    const bx=44, bw=Math.min(34,(W*0.46-bx)/P.length-6), maxP=Math.max(...P);
    ctx.font='500 9px "IBM Plex Mono", monospace';
    P.forEach((p,i)=>{
      const x=bx+i*(bw+6), h=(H-90)*(p/Math.max(maxP,0.001)), y=H-46-h;
      const grad=ctx.createLinearGradient(0,y,0,y+h);
      grad.addColorStop(0,NG_COL.accent); grad.addColorStop(1,NG_COL.accent+'33');
      ctx.fillStyle=grad; ctx.shadowColor=NG_COL.accent; ctx.shadowBlur=6;
      ctx.fillRect(x,y,bw,h); ctx.shadowBlur=0;
      ctx.fillStyle=NG_COL.muted; ctx.textAlign='center';
      ctx.save(); ctx.translate(x+bw/2,H-34); ctx.rotate(-Math.PI/4); ctx.textAlign='right'; ctx.fillText(L[i],0,0); ctx.restore();
      ctx.fillStyle=NG_COL.accent; ctx.fillText(p.toFixed(2).replace('0.','.'), x+bw/2, y-5);
    });
    ctx.fillStyle=NG_COL.muted; ctx.textAlign='left'; ctx.font='500 9.5px "IBM Plex Mono", monospace';
    ctx.fillText('the next-word distribution', bx, 14);
    // right: branch fan
    const cx=W*0.72, cy=H/2-6, R=Math.min(W*0.24, H/2-34);
    const nBranches=Math.min(30, pp);
    const whole=Math.floor(nBranches), frac=nBranches-whole;
    ctx.save();
    for(let i=0;i<whole+ (frac>0.02?1:0); i++){
      const total=whole+(frac>0.02?1:0);
      const a=-Math.PI/2 + (total===1?0:(i/(total-1)-0.5)*Math.PI*1.25);
      const alpha=(i<whole?1:frac)*0.9;
      const wob=Math.sin(ts/900+i*1.7)*0.02;
      const ex=cx+Math.cos(a+wob)*R, ey=cy+Math.sin(a+wob)*R;
      ctx.globalAlpha=alpha;
      ctx.strokeStyle=NG_COL.accent2; ctx.lineWidth=2; ctx.shadowColor=NG_COL.accent2; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex,ey); ctx.stroke();
      ctx.fillStyle=NG_COL.accent2;
      ctx.beginPath(); ctx.arc(ex,ey,4,0,Math.PI*2); ctx.fill();
    }
    ctx.restore(); ctx.shadowBlur=0; ctx.globalAlpha=1;
    ctx.fillStyle=NG_COL.text;
    ctx.beginPath(); ctx.arc(cx,cy,7,0,Math.PI*2); ctx.fill();
    ctx.font='700 24px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.accent4; ctx.textAlign='center';
    ctx.shadowColor=NG_COL.accent4; ctx.shadowBlur=12;
    ctx.fillText('PP = '+pp.toFixed(2), cx, H-24);
    ctx.shadowBlur=0;
    ctx.font='500 9.5px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.muted;
    ctx.fillText('as uncertain as a uniform choice among '+pp.toFixed(1)+' words', cx, H-8);
    ctx.fillText('effective branches', cx, 14);
    const rd=document.getElementById('ngp-read');
    if(rd) rd.innerHTML='H = '+H2.toFixed(3)+' bits &nbsp;&rarr;&nbsp; PP = 2<sup>H</sup> = '+pp.toFixed(2);
  });
  ngpModels();
}
function ngpModels(){
  const el=document.getElementById('ngp-models'); if(!el) return;
  ngEnsure();
  const rows=[
    {lab:'unigram (add-k)', pp:ngPerplexity(NG_S,1,NG_TEST,'addk',{k:0.05}).pp},
    {lab:'bigram (add-k)',  pp:ngPerplexity(NG_S,2,NG_TEST,'addk',{k:0.05}).pp},
    {lab:'trigram (interpolated)', pp:ngPerplexity(NG_S,3,NG_TEST,'interp',{lam:[0.2,0.55,0.25]}).pp}
  ];
  const mx=Math.max(...rows.map(r=>r.pp));
  el.innerHTML='<div style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem">the harbor models on the real test set &mdash; lower is better</div>'+
    rows.map((r,i)=>{
      const col=[NG_COL.accent3,NG_COL.amber,NG_COL.accent4][i];
      return `<div style="display:flex;align-items:center;gap:9px;margin-bottom:5px">
        <div style="flex:0 0 30%;font-family:var(--mono);font-size:.68rem;color:var(--text)">${r.lab}</div>
        <div style="flex:1;height:10px;border-radius:5px;background:var(--surface3);overflow:hidden"><div style="height:100%;width:${r.pp/mx*100}%;background:linear-gradient(90deg,${col}55,${col});box-shadow:0 0 8px ${col}66"></div></div>
        <div style="flex:0 0 4.5em;font-family:var(--mono);font-size:.72rem;color:${col};font-weight:700;text-align:right">${r.pp.toFixed(1)}</div></div>`;
    }).join('');
}

// ── 3.3 VIZ 2: DERIVATION MAP (TABS) ────────────────────────
function ngdSteps(){
  ngEnsure();
  // live geometric-vs-arithmetic numbers for tab 2
  let inv=[], lp=0, N=0;
  NG_TEST.forEach(line=>{
    const toks=ngMapUnk(ngTok(line), NG_S[1].vocab);
    ngScoreSentence(NG_S,3,toks,'interp',{lam:[0.2,0.55,0.25]}).steps.forEach(s=>{ inv.push(1/s.p); lp+=Math.log2(s.p); N++; });
  });
  const geo=Math.exp(inv.reduce((a,x)=>a+Math.log(x),0)/N);
  const ari=inv.reduce((a,b)=>a+b,0)/N;
  const pp=Math.pow(2,-lp/N);
  _ngd.geo=geo; _ngd.ari=ari; _ngd.pp=pp; _ngd.inv=inv; _ngd.N=N;
  return {
    ce:[
      {tex:'H(W) \\;=\\; -\\tfrac{1}{N} \\log_2 P(w_1 w_2 \\ldots w_N)', note:'Cross-entropy of the model on the data: the average number of bits the model needs to encode each word. A model that finds the text predictable spends few bits; a confused model spends many. (Section 3.7 derives this from first principles; a theorem of Shannon, McMillan, and Breiman is what licenses estimating it from one long sample.)'},
      {tex:'H(W) \\text{ is bits per word} \\;\\Rightarrow\\; 2^{H(W)} \\text{ is a count of choices}', note:'Exponentiating bits turns them back into a number of equally likely alternatives: 3 bits ⇔ 8 options. So 2 to the cross-entropy is an effective vocabulary size — a branching factor.'},
      {tex:'\\text{PP}(W) \\;:=\\; 2^{H(W)}', note:'That is the definition. Perplexity is nothing more than cross-entropy pulled out of log space.'},
      {tex:'\\text{PP}(W) = 2^{-\\frac{1}{N}\\log_2 P(W)} = \\left(2^{\\log_2 P(W)}\\right)^{-\\frac{1}{N}} = P(w_1 \\ldots w_N)^{-\\frac{1}{N}}', note:'Substitute and simplify: the inverse-probability formula from the top of the page falls straight out. Minimizing perplexity, minimizing cross-entropy, and maximizing test-set probability are one objective wearing three outfits.'}
    ],
    geo:[
      {tex:'\\text{PP}(W) = P(w_1 \\ldots w_N)^{-\\frac{1}{N}} = \\left(\\prod_{i=1}^{N} P(w_i \\mid \\text{history})\\right)^{-\\frac{1}{N}}', note:'Expand the sequence probability with the chain rule from Section 3.1.'},
      {tex:'\\text{PP}(W) = \\left(\\prod_{i=1}^{N} \\frac{1}{P(w_i \\mid \\text{history})}\\right)^{\\frac{1}{N}} = \\sqrt[N]{\\tfrac{1}{p_1}\\cdot\\tfrac{1}{p_2}\\cdots\\tfrac{1}{p_N}}', note:'Pull the minus sign inside: the Nth root of a product of N per-word inverse probabilities. That is, by definition, their geometric mean. Each 1/p&#7522; is the local branching factor at word i — how many "equally likely" options the model was effectively weighing there.'},
      {tex:'\\text{geometric mean} \\;=\\; 2^{\\;\\frac{1}{N}\\sum_i \\log_2 \\frac{1}{p_i}}', note:'Why geometric and not arithmetic? Because the geometric mean is the exponential of the average of logs — the only mean consistent with the log-space arithmetic of Section 3.1 and with cross-entropy. And it has the right sensitivity: one near-zero p&#7522; drags the whole mean up, exactly as one impossible word should ruin a model\'s score.', live:'geo'},
      {tex:'', note:'', live:'geobars'}
    ],
    inv:[
      {tex:'P(W) \\uparrow \\;\\;\\Longleftrightarrow\\;\\; \\text{PP}(W) \\downarrow', note:'The exponent −1/N is negative, so perplexity moves strictly opposite to test-set probability. "Which model gives the test set higher probability?" and "which model has lower perplexity?" are the same question.'},
      {tex:'\\text{PP} = \\bar{p}^{\\,-1} \\quad\\text{when every word has probability } \\bar{p}', note:'The cleanest special case: if the model assigns each word the same probability p̄, perplexity is exactly 1/p̄. Assign every word 1/30 and your perplexity is 30. Drag the slider to feel the inverse.', live:'seesaw'}
    ]
  };
}
let _ngd = {tab:'ce', step:1, data:null};
function ngdInit(){ _ngd={tab:'ce', step:1, data:null}; _ngd.data=ngdSteps(); ngdTabs(); ngdRender(); }
function ngdTabs(){
  const el=document.getElementById('ngd-tabs'); if(!el) return;
  const T=[['ce','from cross-entropy'],['geo','why a geometric mean'],['inv','why inverse probability']];
  el.innerHTML=T.map(([k,l])=>`<button onclick="ngdTab('${k}')" style="background:${_ngd.tab===k?'var(--accent)':'var(--surface3)'};color:${_ngd.tab===k?'var(--bg)':'var(--muted)'};border:1px solid var(--border2);border-radius:7px;padding:.42rem .7rem;font-family:var(--mono);font-size:.66rem;font-weight:700;cursor:pointer">${l}</button>`).join('');
}
function ngdTab(k){ _ngd.tab=k; _ngd.step=1; ngdTabs(); ngdRender(); }
function ngdNext(){ const steps=_ngd.data[_ngd.tab]; if(_ngd.step<steps.length) _ngd.step++; ngdRender(); }
function ngdReset(){ _ngd.step=1; ngdRender(); }
function ngdRender(){
  const host=document.getElementById('ngd-steps'); if(!host) return;
  const steps=_ngd.data[_ngd.tab];
  host.innerHTML=steps.slice(0,_ngd.step).map((s,i)=>{
    const last=i===_ngd.step-1;
    let extra='';
    if(s.live==='geo'){
      extra=`<div style="font-family:var(--mono);font-size:.68rem;color:var(--text);margin-top:.5rem;line-height:1.9">Live, on the harbor test set (N = ${_ngd.N} scored tokens, interpolated trigram): geometric mean of the 1/p&#7522; = <strong style="color:var(--accent4)">${_ngd.geo.toFixed(2)}</strong> &nbsp;=&nbsp; the measured perplexity <strong style="color:var(--accent4)">${_ngd.pp.toFixed(2)}</strong>. The arithmetic mean of the same numbers is <strong style="color:var(--accent3)">${_ngd.ari.toFixed(1)}</strong> &mdash; blown upward by a handful of hard words, and connected to nothing.</div>`;
    }
    if(s.live==='geobars'){
      const bars=_ngd.inv.slice().sort((a,b)=>a-b);
      const step=Math.max(1,Math.floor(bars.length/60));
      const shown=bars.filter((_,j)=>j%step===0);
      const mx=Math.log10(Math.max(...shown));
      return `<div style="margin:.4rem 0 1rem">
        <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:6px">every per-word 1/p&#7522; on the test set, sorted (log scale) &mdash; the two means, marked:</div>
        <div style="display:flex;align-items:flex-end;gap:1.5px;height:90px;position:relative">
          ${shown.map(v=>`<div style="flex:1;background:linear-gradient(180deg,var(--accent2),var(--accent2)33);height:${Math.max(3,Math.log10(v)/mx*100)}%;border-radius:2px 2px 0 0"></div>`).join('')}
          <div style="position:absolute;left:0;right:0;bottom:${Math.log10(_ngd.geo)/mx*100}%;border-top:2px solid var(--accent4);box-shadow:0 0 8px #3DDC8466"><span style="position:absolute;right:0;top:-15px;font-family:var(--mono);font-size:.6rem;color:var(--accent4)">geometric = PP = ${_ngd.geo.toFixed(1)}</span></div>
          <div style="position:absolute;left:0;right:0;bottom:${Math.log10(_ngd.ari)/mx*100}%;border-top:2px dashed var(--accent3)"><span style="position:absolute;left:0;top:-15px;font-family:var(--mono);font-size:.6rem;color:var(--accent3)">arithmetic = ${_ngd.ari.toFixed(0)}</span></div>
        </div></div>`;
    }
    if(s.live==='seesaw'){
      extra=`<div style="display:flex;gap:1rem;align-items:center;margin-top:.6rem;flex-wrap:wrap">
        <span style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">p&#772; =</span>
        <input type="range" min="1" max="100" value="20" oninput="ngdSeesaw(this.value)" style="flex:1;min-width:140px;accent-color:var(--accent)">
        <span id="ngd-see" style="font-family:var(--mono);font-size:.78rem;color:var(--accent4);font-weight:700">p&#772; = 0.20 &nbsp;&rarr;&nbsp; PP = 5.0</span></div>`;
    }
    return `<div style="opacity:${last?1:.45};transition:opacity .3s;margin-bottom:1rem;border-left:2px solid ${last?'var(--accent)':'var(--border2)'};padding-left:1rem">
      ${s.tex?`<div class="lesson-math" style="text-align:left;overflow-x:auto">\\[${s.tex}\\]</div>`:''}
      <div style="font-family:var(--body);font-size:.84rem;color:${last?'var(--text)':'var(--muted)'};line-height:1.75">${s.note}</div>${extra}</div>`;
  }).join('');
  const btn=document.getElementById('ngd-next');
  if(btn) btn.style.display=_ngd.step>=steps.length?'none':'inline-block';
  if(typeof renderMath==='function') renderMath(host);
}
function ngdSeesaw(v){
  const p=v/100, el=document.getElementById('ngd-see');
  if(el) el.innerHTML='p&#772; = '+p.toFixed(2)+' &nbsp;&rarr;&nbsp; PP = '+(1/p).toFixed(1);
}

// ── 3.3 VIZ 3: THE PERPLEXITY LAB ───────────────────────────
let _ngv = {mode:'mle', res:null, lam:{}, anim:0};
function ngvInit(){
  _ngv={mode:'mle', res:null, lam:{}, anim:0};
  const t=document.getElementById('ngv-train'), d=document.getElementById('ngv-dev'), e=document.getElementById('ngv-test');
  if(t&&!t.value) t.value=NG_TRAIN.join('\n');
  if(d&&!d.value) d.value=NG_DEV.join('\n');
  if(e&&!e.value) e.value=NG_TEST.join('\n');
  ngvModes(); ngvRun();
}
function ngvModes(){
  const el=document.getElementById('ngv-modes'); if(!el) return;
  const M=[['mle','MLE'],['addk','add-k'],['interp','interpolation']];
  el.innerHTML=M.map(([k,l])=>`<button onclick="ngvMode('${k}')" style="background:${_ngv.mode===k?'var(--accent)':'var(--surface3)'};color:${_ngv.mode===k?'var(--bg)':'var(--muted)'};border:1px solid var(--border2);border-radius:7px;padding:.4rem .75rem;font-family:var(--mono);font-size:.68rem;font-weight:700;cursor:pointer">${l}</button>`).join('');
  const kw=document.getElementById('ngv-kwrap'); if(kw) kw.style.display=_ngv.mode==='addk'?'inline':'none';
}
function ngvMode(k){ _ngv.mode=k; ngvModes(); ngvRun(); }
function ngvOod(){
  const cb=document.getElementById('ngv-ood'), e=document.getElementById('ngv-test');
  if(e) e.value=(cb&&cb.checked?NG_OOD:NG_TEST).join('\n');
  ngvRun();
}
function ngvLines(id){ const el=document.getElementById(id); if(!el) return []; return el.value.split('\n').map(l=>l.trim()).filter(Boolean).slice(0,400); }
function ngvRun(){
  const tr=ngvLines('ngv-train'), dv=ngvLines('ngv-dev'), te=ngvLines('ngv-test');
  if(!tr.length) return;
  const suite=[null]; for(let n=1;n<=4;n++) suite.push(ngTrainModel(tr,n));
  const kEl=document.getElementById('ngv-k'); const k=kEl?+kEl.value/100:0.05;
  const res=[]; _ngv.lam={};
  for(let n=1;n<=4;n++){
    let mode=_ngv.mode, params=null;
    if(mode==='addk') params={k};
    if(mode==='interp'){
      if(n===1){ mode='addk'; params={k:1}; }
      else { params={lam:ngvTune(suite,n,dv)}; _ngv.lam[n]=params.lam; }
    }
    res.push({n,
      train:ngPerplexity(suite,n,tr,mode,params),
      dev:ngPerplexity(suite,n,dv,mode,params),
      test:ngPerplexity(suite,n,te,mode,params)});
  }
  _ngv.res=res; _ngv.anim=0;
  ngvTable(res, te);
  ngvChartStart();
}
function ngvTune(suite,n,dv){
  let best=null, bestPP=Infinity;
  const step= n===2?0.05 : n===3?0.1 : 0.2;
  const rec=(rem, left, cur)=>{
    if(left===1){ const lam=cur.concat([+rem.toFixed(3)]); const pp=ngPerplexity(suite,n,dv,'interp',{lam}).pp; if(pp<bestPP){bestPP=pp;best=lam;} return; }
    for(let v=0; v<=rem+1e-9; v+=step) rec(+(rem-v).toFixed(3), left-1, cur.concat([+v.toFixed(3)]));
  };
  rec(1, n, []);
  return best||Array(n).fill(1/n);
}
function ngvTable(res, te){
  const el=document.getElementById('ngv-table'); if(!el) return;
  const name=n=>n===1?'unigram':n===2?'bigram':n===3?'trigram':'4-gram';
  const bestDev=res.reduce((m,r)=>isFinite(r.dev.pp)&&r.dev.pp<m.dev.pp?r:m, {dev:{pp:Infinity}});
  let h=`<table style="border-collapse:collapse;font-family:var(--mono);font-size:.72rem;width:100%"><tr>
    <td style="padding:6px 10px;color:var(--muted)">model</td>
    <td style="padding:6px 10px;color:#4DE3FF;text-align:right">train PP</td>
    <td style="padding:6px 10px;color:#ffb020;text-align:right">dev PP</td>
    <td style="padding:6px 10px;color:#FF5F8E;text-align:right">test PP</td>
    <td style="padding:6px 10px;color:var(--muted)">zero-prob events / &lambda;</td></tr>`;
  res.forEach(r=>{
    const isBest=isFinite(bestDev.dev.pp)&&r.n===bestDev.n;
    const extra = _ngv.mode==='mle'
      ? `<span style="color:var(--accent3)">${r.dev.zeros+r.test.zeros} held-out sentences hit P = 0</span>`
      : (_ngv.mode==='interp'&&_ngv.lam[r.n]? '&lambda; = ('+_ngv.lam[r.n].map(x=>x.toFixed(2)).join(', ')+')':'&mdash;');
    h+=`<tr style="background:${isBest?'rgba(61,220,132,0.05)':'transparent'};border-top:1px solid var(--border)">
      <td style="padding:6px 10px;color:var(--text);font-weight:${isBest?700:400}">${name(r.n)}${isBest?' <span style="color:var(--accent4)">← dev pick</span>':''}</td>
      <td style="padding:6px 10px;text-align:right;color:var(--text)">${ngPPfmt(r.train.pp)}</td>
      <td style="padding:6px 10px;text-align:right;color:var(--text);font-weight:${isBest?700:400}">${ngPPfmt(r.dev.pp)}</td>
      <td style="padding:6px 10px;text-align:right;color:var(--text)">${ngPPfmt(r.test.pp)}</td>
      <td style="padding:6px 10px;color:var(--muted);font-size:.64rem">${extra}</td></tr>`;
  });
  h+='</table>';
  el.innerHTML=h;
  const v=document.getElementById('ngv-verdict');
  if(v){
    const oov=res[0].test;
    const oovPct=oov.tot?Math.round(oov.oov/oov.tot*100):0;
    if(_ngv.mode==='mle'){
      v.innerHTML=`Every held-out column is <strong style="color:var(--accent3)">&infin;</strong>: at least one word or n-gram in dev/test never occurred in training, MLE gives it probability 0, and one zero annihilates the whole product &mdash; the geometric mean has no mercy. Real evaluation is impossible without smoothing. Switch the estimator to <strong>add-k</strong> or <strong>interpolation</strong>.`;
    } else if(!isFinite(bestDev.dev.pp)){
      v.innerHTML='No finite dev perplexity — check that the dev box has text.';
    } else {
      const nm=name(bestDev.n);
      const over=res.find(r=>r.n===4), tr4=over?over.train.pp:0, dv4=over?over.dev.pp:0;
      v.innerHTML=`Model selection, done honestly: the <strong style="color:var(--accent4)">${nm}</strong> wins on dev (${ngPPfmt(bestDev.dev.pp)}), so <em>that</em> is the model, and its test perplexity &mdash; <strong>${ngPPfmt(bestDev.test.pp)}</strong> &mdash; is the one number you may report. Notice the 4-gram: train ${ngPPfmt(tr4)} vs dev ${ngPPfmt(dv4)} &mdash; the widening gap is overfitting in its purest visible form (more in &sect;3.5). ${oovPct>20?`<span style="color:var(--accent3)">And with ${oovPct}% of test tokens out-of-vocabulary, this test set is from another world: domain mismatch turns a comfortable model into a lost one.</span>`:`Out-of-vocabulary rate on this test set: ${oovPct}%.`}`;
    }
  }
}
function ngvChartStart(){
  ngLoop('ngv','ngv-chart',()=>{
    const c=ngCV('ngv-chart', 240); if(!c||!_ngv.res) return;
    const {ctx,W,H}=c;
    ctx.clearRect(0,0,W,H);
    _ngv.anim=Math.min(1,_ngv.anim+0.04);
    const a=1-Math.pow(1-_ngv.anim,3);
    const padL=50,padB=34,padT=18, pw=W-padL-16, ph=H-padT-padB;
    const vals=[]; _ngv.res.forEach(r=>['train','dev','test'].forEach(s=>{ if(isFinite(r[s].pp)) vals.push(r[s].pp); }));
    const mx=Math.max(10, ...vals), mn=1;
    const yAt=v=>padT+ph*(1-(Math.log10(v)-Math.log10(mn))/(Math.log10(mx*1.3)-Math.log10(mn)));
    ctx.font='500 9px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.muted;
    [1,10,100,1000].filter(v=>v<=mx*1.3).forEach(v=>{
      ctx.textAlign='right'; ctx.fillText(v, padL-6, yAt(v)+3);
      ctx.strokeStyle=NG_COL.border; ctx.beginPath(); ctx.moveTo(padL,yAt(v)); ctx.lineTo(padL+pw,yAt(v)); ctx.stroke();
    });
    ctx.save(); ctx.translate(12,padT+ph/2); ctx.rotate(-Math.PI/2); ctx.textAlign='center'; ctx.fillText('perplexity (log scale)',0,0); ctx.restore();
    const cols={train:'#4DE3FF',dev:'#ffb020',test:'#FF5F8E'};
    const gw=pw/4;
    _ngv.res.forEach((r,gi)=>{
      const gx=padL+gi*gw;
      ['train','dev','test'].forEach((s,si)=>{
        const bw=gw/4.6, x=gx+gw/2+(si-1)*(bw+4)-bw/2;
        const pp=r[s].pp;
        if(isFinite(pp)){
          const y=yAt(Math.pow(pp,a)*Math.pow(1,1-a)), h2=padT+ph-y;
          const grad=ctx.createLinearGradient(0,y,0,y+h2);
          grad.addColorStop(0,cols[s]); grad.addColorStop(1,cols[s]+'22');
          ctx.fillStyle=grad; ctx.shadowColor=cols[s]; ctx.shadowBlur=7;
          ctx.fillRect(x,y,bw,h2); ctx.shadowBlur=0;
          if(a>0.95){ ctx.fillStyle=cols[s]; ctx.font='600 9px "IBM Plex Mono", monospace'; ctx.textAlign='center'; ctx.fillText(pp>=100?pp.toFixed(0):pp.toFixed(1), x+bw/2, y-4); }
        } else {
          ctx.strokeStyle=cols[s]; ctx.setLineDash([4,3]); ctx.lineWidth=1.4;
          ctx.strokeRect(x, padT+4, bw, ph-4); ctx.setLineDash([]);
          ctx.fillStyle=cols[s]; ctx.font='700 13px "IBM Plex Mono", monospace'; ctx.textAlign='center';
          ctx.fillText('∞', x+bw/2, padT+18);
        }
      });
      ctx.fillStyle=NG_COL.text; ctx.font='600 10px "IBM Plex Mono", monospace'; ctx.textAlign='center';
      ctx.fillText(['unigram','bigram','trigram','4-gram'][gi], gx+gw/2, H-16);
    });
    let lx=padL;
    Object.entries(cols).forEach(([s,col])=>{
      ctx.fillStyle=col; ctx.fillRect(lx, H-8, 9, 5);
      ctx.font='500 9px "IBM Plex Mono", monospace'; ctx.textAlign='left';
      ctx.fillText(s, lx+13, H-3); lx+=ctx.measureText(s).width+34;
    });
  });
}

// ════════════════════════════════════════════════════════════
// 3.4  SAMPLING SENTENCES FROM A LANGUAGE MODEL
// ════════════════════════════════════════════════════════════
NGRAM_PAGES.ngsample = `
<div class="lesson-chapter-label">Section 3.4</div>
<h1 class="lesson-h1">Sampling Sentences from a Language Model</h1>
<p class="lesson-intro">Sampling lets us inspect a language model by drawing words from its predicted distributions. The output reveals local patterns, repetition, and gaps that a single score can hide.</p>

<h2 class="lesson-h2">How Sampling Works</h2>
<p class="lesson-p">To <strong>sample</strong> a word is to pick it at random <em>in proportion to its probability</em>. The mechanism is straightforward. Take the model's distribution over next words and lay it out along the number line from 0 to 1, giving each word a segment as wide as its probability. High-probability words get wide segments, rare words get narrow ones, and together the segments cover the interval exactly, because the probabilities sum to one. Now draw a uniform random number between 0 and 1 and output whichever word's segment contains it. Wide segments are hit often and narrow ones rarely, so each word is chosen with exactly its probability.</p>
<p class="lesson-p">Generating a whole sentence repeats this <em>autoregressively</em>. Start from the start-of-sentence context, sample a first word, slide it into the context window, sample again from the new conditional distribution, and continue until the sample lands on the end token. The tool below runs that loop on the harbor model. Notice that the interval is re-divided after every word, because the context, and therefore the distribution, is different at every step.</p>

<div class="viz-container" id="ngsa-host">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Sampling Machine</span>
    <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
      <div id="ngsa-nbtns" style="display:flex;gap:4px"></div>
      <button class="viz-fs-btn" onclick="vizToggleFull('ngsa-host')" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .9rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">&#10530; Full screen</button>
      <button onclick="ngsaStep()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Throw a dart</button>
      <button id="ngsa-auto" onclick="ngsaAuto()" style="background:var(--accent2);color:#fff;border:none;border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">&#9654; Auto</button>
      <button onclick="ngsaReset()" style="background:var(--surface3);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem .9rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">&#8634;</button>
      <label style="display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:.66rem;color:var(--muted)">&tau; <input id="ngsa-temp" type="range" min="0.3" max="2" step="0.05" value="1" oninput="ngsaSetTemp(this.value)" style="width:90px;accent-color:var(--accent4)"><span id="ngsa-tempv" style="color:var(--accent4);width:2.2em">1.00</span></label>
    </div>
  </div>
  <div class="viz-body">
    <canvas id="ngsa-canvas" style="width:100%;display:block"></canvas>
    <div id="ngsa-dist" style="margin-top:1rem"></div>
    <div id="ngsa-note" style="font-family:var(--mono);font-size:.7rem;color:var(--muted);margin-top:.8rem;min-height:1.8em;line-height:1.8;text-align:center"></div>
  </div>
</div>

<h2 class="lesson-h2">What the Samples Reveal</h2>
<p class="lesson-p">Run the tool at each order and read the output as a diagnostic. Unigram samples have real vocabulary but no structure at all, because a unigram model conditions on nothing. Bigram samples are locally coherent, since every adjacent <em>pair</em> is fluent, but they have no memory past one word. Trigram and 4-gram samples read like real harbor sentences, and the reason is less impressive than it looks: with only 112 training sentences, the high-order distributions are so sharp that there are usually only one or two segments to land in, so the model is largely replaying its training data. That is fluency by memorization, and it is the subject of the next section.</p>

<div class="lesson-note"><div class="lesson-note-label">Sampling Is a Mirror</div>
<p>Whatever the model was trained on is what comes out. A model built on maritime sentences samples maritime sentences; one built on legal contracts samples legalese. Sampling is one of the fastest ways to discover what a corpus actually contains, including things you might not have realized were in it.</p></div>

<div class="quiz-block" id="qng4"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In the interval trick, a word whose probability is 0.30 is sampled how?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qng4','Correct. Its segment covers 30% of [0,1], so a uniform draw lands there 30% of the time — probability-proportional sampling with one random number.')">A uniform draw in [0,1] lands in its 0.30-wide segment 30% of the time</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng4','That describes greedy decoding, which always takes the argmax and involves no randomness.')">It is chosen whenever it is the most probable word</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng4','Every word with nonzero probability owns a segment; nothing is excluded.')">Words below 0.5 can never be sampled</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng4','The draw is uniform on the interval, but the segment widths make the outcome non-uniform over words.')">Each word is sampled with equal probability</button>
</div><div class="quiz-explain" id="qng4-explain"></div></div>`;

// ── 3.4 VIZ: THE SAMPLING MACHINE ───────────────────────────
let _ngsa = {n:2, ctx:[], toks:[], rng:null, dist:[], phase:'idle', u:0, t:0, pick:null, auto:false, done:false, lp:0, temp:1};
function ngsaInit(){
  ngEnsure();
  _ngsa={n:2, ctx:['<s>'], toks:[], rng:ngRng(Date.now()%100000), dist:[], phase:'idle', u:0, t:0, pick:null, auto:false, done:false, lp:0, temp:1};
  ngsaNbtns(); ngsaDist(); ngsaLoopStart();
}
function ngsaSetTemp(v){
  _ngsa.temp=parseFloat(v);
  const el=document.getElementById('ngsa-tempv'); if(el) el.textContent=_ngsa.temp.toFixed(2);
  if(_ngsa.phase==='idle') ngsaDist();
}
function ngsaTemper(d){
  const T=_ngsa.temp||1;
  if(Math.abs(T-1)<1e-9 || !d.length) return d;
  let Z=0; const q=d.map(function(r){ const w=Math.pow(Math.max(r.p,1e-12),1/T); Z+=w; return {w:r.w, p:w}; });
  for(const r of q) r.p/=Z;
  q.sort((a,b)=>b.p-a.p);
  return q;
}
function ngsaNbtns(){
  const el=document.getElementById('ngsa-nbtns'); if(!el) return;
  el.innerHTML=[1,2,3,4].map(x=>`<button onclick="ngsaSetN(${x})" style="background:${x===_ngsa.n?'var(--accent)':'var(--surface3)'};color:${x===_ngsa.n?'var(--bg)':'var(--muted)'};border:1px solid var(--border2);border-radius:7px;padding:.4rem .65rem;font-family:var(--mono);font-size:.7rem;font-weight:700;cursor:pointer">n=${x}</button>`).join('');
}
function ngsaSetN(n){ _ngsa.n=n; ngsaReset(); }
function ngsaReset(){
  const n=_ngsa.n, T=_ngsa.temp;
  _ngsa.ctx=[]; for(let i=0;i<Math.max(0,n-1);i++) _ngsa.ctx.push('<s>');
  _ngsa.toks=[]; _ngsa.phase='idle'; _ngsa.pick=null; _ngsa.done=false; _ngsa.auto=false; _ngsa.lp=0; _ngsa.temp=T;
  const ab=document.getElementById('ngsa-auto'); if(ab) ab.innerHTML='&#9654; Auto';
  ngsaNbtns(); ngsaDist(); ngsaLoopStart();
}
function ngsaCurDist(){
  let d=ngDist(NG_S,_ngsa.n,_ngsa.ctx,'mle');
  if(!d.length) d=ngDist(NG_S,1,[],'mle');
  return ngsaTemper(d);
}
function ngsaStep(){
  if(_ngsa.done){ ngsaReset(); return; }
  if(_ngsa.phase!=='idle') return;
  _ngsa.dist=ngsaCurDist();
  _ngsa.u=_ngsa.rng();
  let acc=0; _ngsa.pick=_ngsa.dist[_ngsa.dist.length-1];
  for(const d of _ngsa.dist){ acc+=d.p; if(_ngsa.u<=acc+1e-12){ _ngsa.pick=d; break; } }
  _ngsa.phase='drop'; _ngsa.t=0;
}
function ngsaAuto(){
  _ngsa.auto=!_ngsa.auto;
  const ab=document.getElementById('ngsa-auto'); if(ab) ab.innerHTML=_ngsa.auto?'&#10074;&#10074; Pause':'&#9654; Auto';
  if(_ngsa.auto && _ngsa.done) ngsaReset(), _ngsa.auto=true;
  if(_ngsa.auto && _ngsa.phase==='idle') ngsaStep();
}
function ngsaCommit(){
  const w=_ngsa.pick.w;
  _ngsa.lp+=Math.log2(_ngsa.pick.p);
  if(w==='</s>'){ _ngsa.done=true; _ngsa.auto=false; const ab=document.getElementById('ngsa-auto'); if(ab) ab.innerHTML='&#9654; Auto'; }
  else {
    _ngsa.toks.push(w);
    if(_ngsa.n>1){ _ngsa.ctx.shift(); _ngsa.ctx.push(w); }
    if(_ngsa.toks.length>=20) _ngsa.done=true;
  }
  _ngsa.phase='idle'; _ngsa.pick=null;
  ngsaDist();
  if(_ngsa.auto && !_ngsa.done) setTimeout(()=>{ if(_ngsa.auto) ngsaStep(); }, 160);
}
function ngsaDist(){
  const el=document.getElementById('ngsa-dist'); if(!el) return;
  const d=ngsaCurDist().slice(0,10);
  const mx=d.length?d[0].p:1;
  el.innerHTML='<div style="font-family:var(--mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:5px">the current distribution '+(_ngsa.n>1?('P( &middot; | '+_ngsa.ctx.map(ngEsc).join(' ')+' )'):'P( &middot; )')+' &mdash; top 10 of '+ngsaCurDist().length
    +(Math.abs((_ngsa.temp||1)-1)>1e-9?(' <span style="color:var(--accent4)">&middot; &tau;='+(_ngsa.temp).toFixed(2)+' '+(_ngsa.temp<1?'(sharpened &rarr; greedier)':'(flattened &rarr; more random)')+'</span>'):' <span style="color:var(--muted)">&middot; &tau;=1 (true probabilities)</span>')
    +'</div>'+
    d.map(r=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
      <div style="flex:0 0 5.5em;font-family:var(--mono);font-size:.68rem;color:var(--text)">${ngEsc(r.w)}</div>
      <div style="flex:1;height:8px;border-radius:4px;background:var(--surface3);overflow:hidden"><div style="height:100%;width:${r.p/mx*100}%;background:linear-gradient(90deg,${NG_COL.accent2}66,${NG_COL.accent2})"></div></div>
      <div style="flex:0 0 3.4em;font-family:var(--mono);font-size:.66rem;color:${NG_COL.accent2};text-align:right">${r.p.toFixed(3)}</div></div>`).join('');
}
function ngsaLoopStart(){
  ngLoop('ngsa','ngsa-canvas',(ts)=>{
    const c=ngCV('ngsa-canvas', 268); if(!c) return;
    const {ctx,W,H}=c;
    ctx.clearRect(0,0,W,H);
    const padX=16, sw=W-padX*2, sy=64, sh=40;
    const d=_ngsa.phase==='idle'?ngsaCurDist():_ngsa.dist;
    // context readout
    ctx.font='500 10px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.muted; ctx.textAlign='left';
    ctx.fillText('context window:', padX, 18);
    let cx0=padX+96;
    ctx.font='600 11px "IBM Plex Mono", monospace';
    (_ngsa.n===1?['(none)']:_ngsa.ctx).forEach(w=>{
      const t=w==='<s>'?'⟨s⟩':w, tw=ctx.measureText(t).width+14;
      ctx.strokeStyle=NG_COL.accent; ctx.fillStyle='rgba(77,227,255,0.08)';
      ctx.beginPath(); ctx.roundRect(cx0,6,tw,18,5); ctx.fill(); ctx.stroke();
      ctx.fillStyle=NG_COL.accent; ctx.textAlign='center'; ctx.fillText(t, cx0+tw/2, 19);
      cx0+=tw+6; ctx.textAlign='left';
    });
    // the interval strip
    let x=padX; const segs=[];
    const PALETTE=['#4DE3FF','#A18FFF','#3DDC84','#ffb020','#FF5F8E','#4dd2ff','#b28bff','#8dff6a','#ffd260','#ff87a0'];
    d.forEach((r,i)=>{
      const w=r.p*sw;
      segs.push({x, w, r});
      const col=PALETTE[i%PALETTE.length];
      const isPick=_ngsa.pick && r.w===_ngsa.pick.w && _ngsa.phase!=='idle' && _ngsa.t>0.55;
      ctx.fillStyle=col; ctx.globalAlpha=isPick?1:0.62;
      if(isPick){ ctx.shadowColor=col; ctx.shadowBlur=16; }
      ctx.fillRect(x, sy, Math.max(0.6,w-0.8), sh);
      ctx.shadowBlur=0; ctx.globalAlpha=1;
      if(w>34){
        ctx.fillStyle='#080C18'; ctx.font='700 10px "IBM Plex Mono", monospace'; ctx.textAlign='center';
        ctx.fillText(r.w==='</s>'?'⟨/s⟩':r.w, x+w/2, sy+sh/2+3.5);
      }
      x+=w;
    });
    ctx.strokeStyle=NG_COL.border2; ctx.strokeRect(padX, sy, sw, sh);
    ctx.font='500 9px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.muted;
    ctx.textAlign='left'; ctx.fillText('0', padX, sy+sh+13);
    ctx.textAlign='right'; ctx.fillText('1', padX+sw, sy+sh+13);
    ctx.textAlign='center'; ctx.fillText('each word owns a segment as wide as its probability', padX+sw/2, sy+sh+13);
    // dart
    if(_ngsa.phase==='drop'){
      _ngsa.t=Math.min(1,_ngsa.t+0.045);
      const ux=padX+_ngsa.u*sw;
      const e=1-Math.pow(1-Math.min(1,_ngsa.t/0.55),3);
      const dy=30+(sy-30)*e;
      ctx.strokeStyle=NG_COL.text; ctx.lineWidth=1.6;
      ctx.shadowColor=NG_COL.text; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.moveTo(ux, dy-14); ctx.lineTo(ux, dy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ux-4.5, dy-8); ctx.lineTo(ux, dy); ctx.lineTo(ux+4.5, dy-8); ctx.closePath();
      ctx.fillStyle=NG_COL.text; ctx.fill(); ctx.shadowBlur=0;
      ctx.font='600 10px "IBM Plex Mono", monospace'; ctx.textAlign='center'; ctx.fillStyle=NG_COL.accent4;
      ctx.fillText('u = '+_ngsa.u.toFixed(3), ux, 26);
      if(_ngsa.t>=1) ngsaCommit();
    }
    // sentence tape
    const ty=sy+sh+42;
    ctx.font='500 10px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.muted; ctx.textAlign='left';
    ctx.fillText('generated so far:', padX, ty-10);
    let tx=padX; let tyy=ty;
    ctx.font='600 12px "IBM Plex Mono", monospace';
    const all=_ngsa.toks.concat(_ngsa.done&&_ngsa.pick===null?['</s>']:[]);
    _ngsa.toks.forEach((w)=>{
      const tw=ctx.measureText(w).width+16;
      if(tx+tw>W-padX){ tx=padX; tyy+=30; }
      ctx.strokeStyle=NG_COL.border2; ctx.fillStyle='rgba(255,255,255,0.03)';
      ctx.beginPath(); ctx.roundRect(tx,tyy,tw,22,6); ctx.fill(); ctx.stroke();
      ctx.fillStyle=NG_COL.text; ctx.textAlign='center'; ctx.fillText(w, tx+tw/2, tyy+15);
      tx+=tw+7; ctx.textAlign='left';
    });
    if(_ngsa.done){
      ctx.fillStyle=NG_COL.accent4; ctx.textAlign='left'; ctx.font='700 12px "IBM Plex Mono", monospace';
      ctx.fillText('⟨/s⟩', tx+3, tyy+15);
    } else if(_ngsa.phase==='idle'){
      const blink=0.4+0.6*Math.abs(Math.sin(ts/450));
      ctx.globalAlpha=blink; ctx.fillStyle=NG_COL.accent4; ctx.font='700 14px "IBM Plex Mono", monospace';
      ctx.fillText('▮', tx+3, tyy+16); ctx.globalAlpha=1;
    }
    const note=document.getElementById('ngsa-note');
    if(note){
      if(_ngsa.done) note.innerHTML=`sentence complete &mdash; total log&#8322; probability <strong style="color:var(--accent4)">${_ngsa.lp.toFixed(1)} bits</strong> (${_ngsa.toks.length+1} draws). Press reset or a dart to sample another; switch n and compare the texture.`;
      else if(_ngsa.phase==='idle' && _ngsa.toks.length===0) note.innerHTML='the interval is tiled by the current distribution &mdash; throw a dart, or press auto and watch the loop run';
      else if(_ngsa.phase==='idle') note.innerHTML=(_ngsa.n>=3 && d.length<=2)?`only ${d.length} segment${d.length===1?'':'s'} to land in &mdash; at n=${_ngsa.n} this tiny corpus makes the distribution nearly deterministic (memorization, &sect;3.5)`:`re-tiled: the context changed, so the distribution changed`;
    }
  });
}

// ════════════════════════════════════════════════════════════
// 3.5  GENERALIZING VS. OVERFITTING
// ════════════════════════════════════════════════════════════
NGRAM_PAGES.nggen = `
<div class="lesson-chapter-label">Section 3.5</div>
<h1 class="lesson-h1">Generalizing vs. Overfitting</h1>
<p class="lesson-intro">The perplexity lab showed the symptom: training perplexity keeps falling as n grows while held-out perplexity turns around and climbs. This section covers what is actually going wrong, and the two places generalization breaks down: sequences the model has memorized, and words it has never seen.</p>

<h2 class="lesson-h2">Memorization, Made Visible</h2>
<p class="lesson-p">An n-gram model does not learn grammar; it learns its corpus. As the order grows, contexts become so specific that they occurred only once in training, which means the distribution after them has a single option with probability 1. Sampling from such a model does not compose new language, it replays old language. The tool below generates eight sentences at whatever order you pick, then colors every word by the length of the training-set span it sits inside. Cool colors mark words being combined in new ways; hot colors mark words inside long verbatim stretches of the training data. Raise n and the output gets progressively hotter.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Memorization Meter</span>
    <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
      <div id="ngo-nbtns" style="display:flex;gap:4px"></div>
      <button onclick="ngoGen()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">&#127922; Generate 8 sentences</button>
    </div>
  </div>
  <div class="viz-body">
    <div id="ngo-out" style="min-height:120px"></div>
    <div id="ngo-stats" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem"></div>
    <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem">heat = length of the training-corpus span this word sits inside: <span style="color:var(--text)">1&ndash;2 fresh</span> &middot; <span style="color:#ffb020">3&ndash;4 familiar</span> &middot; <span style="color:#FF5F8E">5+ verbatim quote</span></div>
  </div>
</div>

<h2 class="lesson-h2">The Other Failure: Words You Have Never Seen</h2>
<p class="lesson-p">Memorization is overfitting to sequences. The second failure is more basic: <strong>out-of-vocabulary (OOV)</strong> words. The harbor dev set contains <em>summer</em> and the test set contains <em>softly</em>, ordinary words that simply never occur in the 112 training sentences. To every model here their probability is built from a count of zero, and that single missing word is what sent even the unigram MLE row to &infin; in the perplexity lab. The standard patch is to reserve a pseudo-word <strong>&lt;unk&gt;</strong>, map every unknown word to it, and give it probability mass through smoothing. It works, but it is crude: <em>summer</em>, <em>softly</em>, and <em>zygomorphic</em> all collapse into the same token, and everything the spelling of a word tells you is discarded.</p>

<h2 class="lesson-h2">The Real Fix: Subword Tokenization</h2>
<p class="lesson-p">Subword tokenization reduces the unknown-word problem by splitting unfamiliar words into smaller pieces. Complete byte coverage or byte fallback can eliminate unknown tokens for valid text. The tokenizer is learned from training data and then frozen: fitting it to the test set would leak evaluation information into the model.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Subword Pipeline</span></div>
  <div class="viz-body">
    <div id="ngw-pipe" style="margin-bottom:1.3rem"></div>
    <div style="display:flex;gap:.8rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem">
      <span style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">type any word:</span>
      <input id="ngw-word" value="unfoggiest" oninput="ngwRender()" style="background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.5rem .8rem;font-family:var(--mono);font-size:.8rem;color:var(--text);outline:none;width:170px">
      <span style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">BPE merges: <span id="ngw-mlab" style="color:var(--accent)">60</span></span>
      <input id="ngw-merges" type="range" min="0" max="60" value="60" oninput="ngwRender()" style="flex:1;min-width:130px;accent-color:var(--accent)">
    </div>
    <div id="ngw-rows"></div>
    <div id="ngw-table" style="margin-top:1.2rem;overflow-x:auto"></div>
  </div>
</div>

<div class="lesson-note"><div class="lesson-note-label">Where You Have Seen This Before</div>
<p>The BPE demo uses the same training-and-encoding distinction as the tokenization chapter. Learn merges on the training split, then apply those fixed rules to new text. Many language models use BPE; others use different subword methods.</p></div>

<div class="quiz-block" id="qng5"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why must the subword vocabulary be learned from the training set only, never from dev or test?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qng5','Correct. Tokenization happens before counting, so it is part of the model. Learning merges from held-out text leaks information about it into the model — contamination, just like training on test sentences.')">Tokenization is part of the model, so fitting it on held-out data is contamination</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng5','Speed is unaffected; the merge rules apply equally fast wherever they were learned.')">Learning on test data would be too slow</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng5','BPE runs fine on any text; the problem is what its use would do to the evaluation, not that it fails.')">BPE cannot run on held-out text</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng5','Dev and test are usually smaller, but that is not the issue; even a huge test set must stay untouched.')">Dev and test sets are too small for BPE</button>
</div><div class="quiz-explain" id="qng5-explain"></div></div>`;

// ── 3.5 VIZ 1: MEMORIZATION METER ───────────────────────────
let _ngo = {n:2, seed:11, gramSet:null};
function ngoInit(){ ngEnsure(); _ngo={n:2, seed:11, gramSet:ngBuildGramSet(NG_TRAIN,12)}; ngoNbtns(); ngoGen(); }
function ngoNbtns(){
  const el=document.getElementById('ngo-nbtns'); if(!el) return;
  el.innerHTML=[1,2,3,4].map(x=>`<button onclick="_ngo.n=${x};ngoNbtns();ngoGen()" style="background:${x===_ngo.n?'var(--accent)':'var(--surface3)'};color:${x===_ngo.n?'var(--bg)':'var(--muted)'};border:1px solid var(--border2);border-radius:7px;padding:.4rem .65rem;font-family:var(--mono);font-size:.7rem;font-weight:700;cursor:pointer">n=${x}</button>`).join('');
}
function ngoGen(){
  const out=document.getElementById('ngo-out'); if(!out) return;
  _ngo.seed=(_ngo.seed*7+13)%100000;
  const rng=ngRng(_ngo.seed);
  const sents=[]; let triFound=0, triTot=0, longest=0;
  for(let i=0;i<8;i++){
    const g=ngSampleSentence(NG_S,_ngo.n,'mle',null,rng).toks;
    if(!g.length){ i--; continue; }
    const prof=ngOverlapProfile(g,_ngo.gramSet,12);
    longest=Math.max(longest, ...prof, 0);
    for(let j=0;j+3<=g.length;j++){ triTot++; if(_ngo.gramSet.has(g.slice(j,j+3).join(' '))) triFound++; }
    sents.push({g,prof});
  }
  out.innerHTML=sents.map(({g,prof})=>'<div style="margin-bottom:7px;line-height:2">'+g.map((w,i)=>{
    const r=prof[i];
    let bg='rgba(255,255,255,0.04)', col='var(--text)', glow='';
    if(r>=5){ bg='rgba(255,95,142,'+Math.min(0.5,0.16+0.05*r)+')'; col='#ffb8c6'; glow='box-shadow:0 0 8px rgba(255,95,142,.3);'; }
    else if(r>=3){ bg='rgba(255,176,32,0.16)'; col='#ffd58a'; }
    return `<span title="inside a training span of length ${r}" style="font-family:var(--mono);font-size:.74rem;padding:3px 7px;border-radius:6px;margin:1px;display:inline-block;background:${bg};color:${col};${glow}">${w}</span>`;
  }).join('')+'</div>').join('');
  const st=document.getElementById('ngo-stats');
  if(st){
    const pct=triTot?Math.round(triFound/triTot*100):0;
    const gauge=(lab,val,max,col,txt)=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem .9rem">
      <div style="font-family:var(--mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:5px">${lab}</div>
      <div style="height:10px;border-radius:5px;background:var(--surface3);overflow:hidden"><div style="height:100%;width:${Math.min(100,val/max*100)}%;background:linear-gradient(90deg,${col}55,${col});box-shadow:0 0 8px ${col}66;transition:width .5s"></div></div>
      <div style="font-family:var(--mono);font-size:.78rem;color:${col};font-weight:700;margin-top:5px">${txt}</div></div>`;
    st.innerHTML=gauge('generated 3-grams found verbatim in training', pct, 100, pct>70?'#FF5F8E':pct>35?'#ffb020':'#3DDC84', pct+'%')+
      gauge('longest verbatim span produced', longest, 10, longest>=7?'#FF5F8E':longest>=4?'#ffb020':'#3DDC84', longest+' words');
  }
}

// ── 3.5 VIZ 2: SUBWORD PIPELINE MAP ─────────────────────────
let NG_BPE=null;
function ngwEnsure(){ if(!NG_BPE) NG_BPE=ngBpeTrain(NG_TRAIN,60); return NG_BPE; }
function ngwInit(){ ngwEnsure(); ngwPipe(); ngwRender(); }
function ngwPipe(){
  const el=document.getElementById('ngw-pipe'); if(!el) return;
  const box=(t,sub,col,lock)=>`<div style="background:var(--surface2);border:1.4px solid ${col};border-radius:10px;padding:.55rem .8rem;text-align:center;min-width:90px">
    <div style="font-family:var(--mono);font-size:.66rem;color:${col};font-weight:700">${lock?'&#128274; ':''}${t}</div>
    <div style="font-family:var(--mono);font-size:.55rem;color:var(--muted);margin-top:2px">${sub}</div></div>`;
  const arrow=(t)=>`<div style="display:flex;flex-direction:column;align-items:center;color:var(--muted)"><span style="font-size:1rem">&#8594;</span><span style="font-family:var(--mono);font-size:.52rem;white-space:nowrap">${t}</span></div>`;
  el.innerHTML=`<div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;justify-content:center">
    ${box('TRAINING TEXT','112 sentences','#4DE3FF')}
    ${arrow('learn merges<br>(train only)')}
    ${box('FROZEN VOCAB','merge rules fixed','#3DDC84',true)}
    ${arrow('applied identically')}
    <div style="display:flex;gap:.45rem;flex-wrap:wrap">
      ${box('TRAIN','counted','#4DE3FF')}${box('DEV','tuned on','#ffb020')}${box('TEST','scored once','#FF5F8E')}${box('PRODUCTION','every future input','#A18FFF')}
    </div></div>
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-align:center;margin-top:.6rem">the tokenizer sits <em>before</em> counting &mdash; learned once, on the left; only ever <em>applied</em> on the right</div>`;
}
function ngwRender(){
  const rowsEl=document.getElementById('ngw-rows'); if(!rowsEl) return;
  const bpe=ngwEnsure();
  const wEl=document.getElementById('ngw-word');
  const word=(wEl?wEl.value:'unfoggiest').toLowerCase().replace(/[^a-z']/g,'').slice(0,24)||'fog';
  const mEl=document.getElementById('ngw-merges');
  const m=mEl?+mEl.value:60;
  const ml=document.getElementById('ngw-mlab'); if(ml) ml.textContent=m;
  ngEnsure();
  const inVocab=NG_S[1].vocab.has(word);
  const chips=(arr,col)=>arr.map(p=>`<span style="font-family:var(--mono);font-size:.76rem;padding:3px 8px;border-radius:6px;margin:2px;display:inline-block;background:${col}1f;border:1px solid ${col}66;color:${col}">${p}</span>`).join('');
  const pieces=ngBpeEncode(word, bpe.merges.slice(0,m));
  const row=(name,content,note,col)=>`<div style="display:grid;grid-template-columns:120px 1fr;gap:.8rem;align-items:center;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.6rem .9rem;margin-bottom:.5rem">
    <div><div style="font-family:var(--mono);font-size:.66rem;color:${col};font-weight:700">${name}</div><div style="font-family:var(--mono);font-size:.55rem;color:var(--muted)">${note}</div></div>
    <div style="line-height:2.1">${content}</div></div>`;
  rowsEl.innerHTML=
    row('word-level', inVocab?chips([word],'#3DDC84')+`<span style="font-family:var(--mono);font-size:.6rem;color:var(--muted);margin-left:6px">in the training vocabulary</span>`
                             :chips(['&lt;unk&gt;'],'#FF5F8E')+`<span style="font-family:var(--mono);font-size:.6rem;color:var(--muted);margin-left:6px">"${word}" is OOV &rarr; identity destroyed</span>`,
        'atoms = whole words','#4DE3FF')+
    row('character-level', chips(word.split(''),'#ffb020'), 'atoms = letters &middot; never OOV, but long', '#ffb020')+
    row('BPE ('+m+' merges)', chips(pieces.map(p=>p.replace('_','&#9601;')),'#3DDC84'), 'atoms = learned pieces &middot; never OOV', '#3DDC84');
  const tb=document.getElementById('ngw-table');
  if(tb){
    const wordV=NG_S[1].vocab.size-2;
    const charV=27;
    const bpeV=ngBpeTrain(NG_TRAIN,m).vocab.size;
    tb.innerHTML=`<table style="border-collapse:collapse;font-family:var(--mono);font-size:.7rem;width:100%">
      <tr><td style="padding:5px 10px;color:var(--muted)">tokenizer</td><td style="padding:5px 10px;color:var(--muted);text-align:right">vocab size</td><td style="padding:5px 10px;color:var(--muted);text-align:right">pieces for "${word}"</td><td style="padding:5px 10px;color:var(--muted)">can hit &lt;unk&gt;?</td></tr>
      <tr style="border-top:1px solid var(--border)"><td style="padding:5px 10px;color:#4DE3FF">word-level</td><td style="padding:5px 10px;text-align:right;color:var(--text)">${wordV}</td><td style="padding:5px 10px;text-align:right;color:var(--text)">1</td><td style="padding:5px 10px;color:#FF5F8E">yes — fails on new words</td></tr>
      <tr style="border-top:1px solid var(--border)"><td style="padding:5px 10px;color:#ffb020">character-level</td><td style="padding:5px 10px;text-align:right;color:var(--text)">${charV}</td><td style="padding:5px 10px;text-align:right;color:var(--text)">${word.length}</td><td style="padding:5px 10px;color:#3DDC84">never</td></tr>
      <tr style="border-top:1px solid var(--border)"><td style="padding:5px 10px;color:#3DDC84">BPE</td><td style="padding:5px 10px;text-align:right;color:var(--text)">${bpeV}</td><td style="padding:5px 10px;text-align:right;color:var(--text)">${pieces.length}</td><td style="padding:5px 10px;color:#3DDC84">never</td></tr></table>
    <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.5rem">slide the merge count down to 0 and BPE degenerates into the character tokenizer; slide it up and frequent harbor words fuse back into single pieces &mdash; BPE interpolates between the two worlds.</div>`;
  }
}

// ════════════════════════════════════════════════════════════
// 3.6  SMOOTHING, INTERPOLATION, AND BACKOFF
// ════════════════════════════════════════════════════════════
NGRAM_PAGES.ngsmooth = `
<div class="lesson-chapter-label">Section 3.6</div>
<h1 class="lesson-h1">Smoothing, Interpolation, and Backoff</h1>
<p class="lesson-intro">A zero count creates a zero probability under maximum likelihood estimation. One such event then makes the whole sequence probability zero. Smoothing reserves some probability for unseen events, reducing the probability assigned to observed ones.</p>

<h2 class="lesson-h2">Laplace (Add-One) Smoothing</h2>
<p class="lesson-p">The oldest fix is to pretend you saw everything once more than you did. Add 1 to every count in the table, including all the zeros, and renormalize. Since each of the V vocabulary words gained one imaginary count, the denominator grows by V:</p>
<div class="lesson-math">\\[P_{\\text{Laplace}}(w_n \\mid w_{n-1}) \\;=\\; \\frac{C(w_{n-1} w_n) + 1}{C(w_{n-1}) + V}\\]</div>
<p class="lesson-p">Two questions matter here. <em>Where</em> in the pipeline does this happen? At estimation time, on training counts, which means smoothing is part of the model, so the strength k is tuned on dev and the test set only consumes the resulting probabilities. And <em>how much</em> mass moves? More than most people expect. The tool below computes it exactly for real harbor contexts and shows the transfer.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Laplace: The Pipeline and the Mass Transfer</span>
    <div id="ngla-btns" style="display:flex;gap:4px;flex-wrap:wrap"></div>
  </div>
  <div class="viz-body">
    <div id="ngla-pipe" style="margin-bottom:1.2rem"></div>
    <canvas id="ngla-canvas" style="width:100%;display:block"></canvas>
    <div id="ngla-read" style="font-family:var(--mono);font-size:.7rem;color:var(--text);margin-top:.8rem;line-height:1.9;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem 1rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Adjusted Counts: Seeing What Smoothing Did</h2>
<p class="lesson-p">A clarifying trick: instead of asking what probability smoothing produced, ask what <em>count</em> would have produced that probability under plain MLE. Solving backwards gives the <strong>adjusted count</strong>:</p>
<div class="lesson-math">\\[c^{*}(w_{n-1} w_n) \\;=\\; \\frac{\\left(C(w_{n-1} w_n)+1\\right) \\cdot C(w_{n-1})}{C(w_{n-1}) + V}\\]</div>
<p class="lesson-p">Adjusted counts show smoothing in the same units as the raw data: zeros rise above zero, and every observed count is <em>discounted</em> to pay for it. The three matrices below are computed from the harbor bigrams: raw counts, smoothed probabilities, and reconstituted counts. Hover any cell to see its full arithmetic, and drag k below 1 to see why <strong>add-k</strong> with a small fraction is the gentler and more common variant. Even tuned add-k is a blunt instrument for n-grams, since it moves mass uniformly and ignores which unseen events are plausible, which is why the two better ideas below exist.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Raw &rarr; Smoothed &rarr; Adjusted</span>
    <div style="display:flex;gap:.7rem;align-items:center">
      <span style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">k = <span id="ngadj-klab" style="color:var(--accent)">1.00</span></span>
      <input id="ngadj-k" type="range" min="5" max="100" value="100" oninput="ngadjRender()" style="width:130px;accent-color:var(--accent)">
    </div>
  </div>
  <div class="viz-body">
    <div id="ngadj-grids" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.1rem"></div>
    <div id="ngadj-hover" style="font-family:var(--mono);font-size:.7rem;color:var(--text);margin-top:1rem;min-height:2.4em;line-height:1.9;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem 1rem">hover any cell to see its arithmetic</div>
  </div>
</div>

<h2 class="lesson-h2">Interpolation: Mix All the Orders</h2>
<p class="lesson-p">Smoothing rescues zeros but throws away information: when the trigram count is missing, the bigram and unigram counts usually are not, and they carry real evidence. <strong>Linear interpolation</strong> uses all of them, blended with weights that sum to one:</p>
<div class="lesson-math">\\[\\hat{P}(w_n \\mid w_{n-2} w_{n-1}) \\;=\\; \\lambda_1 P(w_n) \\;+\\; \\lambda_2 P(w_n \\mid w_{n-1}) \\;+\\; \\lambda_3 P(w_n \\mid w_{n-2} w_{n-1})\\]</div>
<p class="lesson-p">Every possible &lambda; setting is a point inside a triangle whose corners are the pure unigram, bigram, and trigram models. The map below colors the whole triangle by the dev-set perplexity of each mixture and lets you drag through it. Then press the toggle to tune &lambda; on the <em>training</em> set instead: the optimum moves straight into the trigram corner, which is the overfitting answer. Held-out data is what keeps the weights honest. In practice they are fit on dev with the EM algorithm rather than a grid search, and more elaborate versions let &lambda; depend on how often the context was seen.</p>

<div class="viz-container" id="ngi-host">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Interpolation Triangle</span>
    <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
      <div id="ngi-btns" style="display:flex;gap:4px"></div>
      <button class="viz-fs-btn" onclick="vizToggleFull('ngi-host')" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .9rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">&#10530; Full screen</button>
    </div>
  </div>
  <div class="viz-body">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.2rem" id="ngi-grid">
      <canvas id="ngi-canvas" style="width:100%;display:block;cursor:grab;touch-action:none"></canvas>
      <div>
        <div id="ngi-read"></div>
        <div id="ngi-stack" style="margin-top:1rem"></div>
      </div>
    </div>
  </div>
</div>

<h2 class="lesson-h2">Stupid Backoff: Fall Down the Ladder</h2>
<p class="lesson-p">Interpolation always mixes. <strong>Backoff</strong> commits instead: use the highest-order estimate that has evidence, and fall back to a shorter context only when the count is zero. Doing this while keeping a proper probability distribution requires careful discounting, which is Katz backoff. At web scale, a much cruder shortcut works nearly as well: skip the discounting, multiply by a flat 0.4 each time you fall back, and accept that the result is a <em>score</em> rather than a probability. Its authors called it <strong>stupid backoff</strong>:</p>
<div class="lesson-math">\\[S(w_n \\mid w_{n-2} w_{n-1}) = \\begin{cases} \\dfrac{C(w_{n-2} w_{n-1} w_n)}{C(w_{n-2} w_{n-1})} & \\text{if } C(w_{n-2} w_{n-1} w_n) > 0 \\\\[1.2em] 0.4 \\cdot S(w_n \\mid w_{n-1}) & \\text{otherwise} \\end{cases}\\]</div>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Backoff Waterfall</span>
    <div id="ngb-btns" style="display:flex;gap:4px;flex-wrap:wrap"></div>
  </div>
  <div class="viz-body">
    <div style="display:flex;gap:.7rem;align-items:center;flex-wrap:wrap;margin-bottom:.9rem">
      <span style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">context + target:</span>
      <input id="ngb-in" value="the island rolls" onkeydown="if(event.key==='Enter')ngbGo()" style="background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.5rem .8rem;font-family:var(--mono);font-size:.78rem;color:var(--text);outline:none;width:230px">
      <button onclick="ngbGo()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Drop</button>
    </div>
    <canvas id="ngb-canvas" style="width:100%;display:block"></canvas>
    <div id="ngb-read" style="font-family:var(--mono);font-size:.7rem;color:var(--text);margin-top:.8rem;min-height:2.2em;line-height:1.9;text-align:center"></div>
  </div>
</div>

<div class="lesson-note"><div class="lesson-note-label">Why "Stupid" Works</div>
<p>The scores do not sum to one over the vocabulary, so this is not a probability model and perplexity is not even defined for it. But ranking candidates, which is all a search engine, recognizer, or translator needs from its language model, only requires consistent scores, and with trillions of training words the highest available order is almost always well estimated. Its creators reported it close to more sophisticated methods on their evaluation at a fraction of the cost.</p></div>

<div class="quiz-block" id="qng6"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Under add-one smoothing with C(the) = 249 and V = 162, the seen bigram "the fog" (count 18) goes from P = 18/249 &asymp; 0.072 to P = 19/411 &asymp; 0.046. Where did the missing probability go?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qng6','Correct. Smoothing is a zero-sum transfer: every seen continuation of &quot;the&quot; is discounted, and the collected mass is spread across all vocabulary words never seen after &quot;the&quot;.')">Redistributed to the unseen continuations of "the"</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng6','Probabilities over the same context must still sum to one; mass cannot vanish.')">It vanished; probabilities need not sum to one</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng6','Smoothing one context&rsquo;s distribution does not move mass to other contexts.')">Transferred to other contexts like "a" and "an"</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng6','&lt;/s&gt; is just one of the V outcomes; it gains only its own +1 share.')">All of it went to the end token</button>
</div><div class="quiz-explain" id="qng6-explain"></div></div>

<div class="quiz-block" id="qng6b"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Tuning interpolation weights on the training set drives &lambda;&#8323; (the trigram weight) toward 1. Why?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng6b','On training data the trigram is the best fit, not the worst; that is exactly the trap.')">Because the trigram fits training data worst</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qng6b','Correct. On its own training data the highest order has the sharpest (most memorized) estimates, so pure trigram maximizes training likelihood — classic overfitting. Held-out data reveals that unseen contexts need the lower orders, pulling the optimum inside the triangle.')">The trigram memorizes training data, so training likelihood rewards it &mdash; overfitting</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng6b','The constraint only requires the three weights to sum to one; the interior is fully allowed.')">The &lambda;'s are constrained to be 0 or 1</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng6b','Unigram weight collapses toward 0 on training data, not 1.')">Because &lambda;&#8321; must equal &lambda;&#8323;</button>
</div><div class="quiz-explain" id="qng6b-explain"></div></div>`;

// ── 3.6 VIZ 1: LAPLACE PIPELINE + MASS TRANSFER ─────────────
let _ngla = {ctxWord:'the', parts:[]};
function nglaInit(){ ngEnsure(); _ngla={ctxWord:'the', parts:[]}; nglaBtns(); nglaPipe(); nglaLoopStart(); nglaRead(); }
function nglaBtns(){
  const el=document.getElementById('ngla-btns'); if(!el) return;
  el.innerHTML=['the','fog','rolls','keeper'].map(w=>`<button onclick="_ngla.ctxWord='${w}';nglaBtns();nglaRead()" style="background:${w===_ngla.ctxWord?'var(--accent)':'var(--surface3)'};color:${w===_ngla.ctxWord?'var(--bg)':'var(--muted)'};border:1px solid var(--border2);border-radius:7px;padding:.4rem .7rem;font-family:var(--mono);font-size:.66rem;font-weight:700;cursor:pointer">context: ${w}</button>`).join('');
}
function nglaPipe(){
  const el=document.getElementById('ngla-pipe'); if(!el) return;
  const box=(t,sub,col,glow)=>`<div style="background:var(--surface2);border:1.4px solid ${col};border-radius:10px;padding:.55rem .8rem;text-align:center;${glow?'box-shadow:0 0 14px '+col+'44;':''}">
    <div style="font-family:var(--mono);font-size:.64rem;color:${col};font-weight:700">${t}</div>
    <div style="font-family:var(--mono);font-size:.54rem;color:var(--muted);margin-top:2px">${sub}</div></div>`;
  const arrow=t=>`<div style="display:flex;flex-direction:column;align-items:center;color:var(--muted)"><span style="font-size:1rem">&#8594;</span><span style="font-family:var(--mono);font-size:.52rem;white-space:nowrap">${t}</span></div>`;
  el.innerHTML=`<div style="display:flex;gap:.55rem;align-items:center;flex-wrap:wrap;justify-content:center">
    ${box('TRAIN','raw counts C','#4DE3FF')}
    ${arrow('+k to every cell')}
    ${box('SMOOTH','all V cells &ge; k','#3DDC84',true)}
    ${arrow('&divide; (C + kV)')}
    ${box('PROBABILITIES','no zeros anywhere','#A18FFF')}
    ${arrow('consumed by')}
    ${box('DEV','picks k','#ffb020')}
    ${box('TEST','scored once','#FF5F8E')}
  </div>
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-align:center;margin-top:.6rem">smoothing lives at <em>estimation</em>: it reshapes training counts &mdash; dev tunes its strength, test only reads the result</div>`;
}
function nglaData(){
  const m=NG_S[2], e=m.ctx.get(_ngla.ctxWord);
  const tot=e?e.tot:0, seen=e?e.next.size:0, V=m.V;
  return {tot, seen, V, seenMass:(tot+seen)/(tot+V), unseenMass:(V-seen)/(tot+V), e};
}
function nglaRead(){
  const el=document.getElementById('ngla-read'); if(!el) return;
  const {tot,seen,V,seenMass,unseenMass,e}=nglaData();
  let loser='';
  if(e){
    let bw=null,bc=0; e.next.forEach((c,w)=>{ if(c>bc){bc=c;bw=w;} });
    const p0=bc/tot, p1=(bc+1)/(tot+V);
    loser=` The single biggest loser: P(${ngEsc(bw)} | ${_ngla.ctxWord}) falls from ${bc}/${tot} = <strong>${p0.toFixed(3)}</strong> to ${bc+1}/${tot+V} = <strong>${p1.toFixed(3)}</strong> &mdash; a ${(100*(1-p1/p0)).toFixed(0)}% smoothing tax.`;
  }
  el.innerHTML=`C(${_ngla.ctxWord}) = <strong>${tot}</strong>; it is followed by <strong>${seen}</strong> distinct words, leaving <strong style="color:var(--accent3)">${162-seen}</strong> vocabulary words never seen after it. Add-one hands each of those a count of 1, so the unseen pool now owns <strong style="color:var(--accent3)">(${162-seen} &times; 1) / (${tot} + 162) = ${(unseenMass*100).toFixed(1)}%</strong> of the distribution &mdash; paid for entirely by the seen words, whose share drops from 100% to ${(seenMass*100).toFixed(1)}%.${loser}`;
}
function nglaLoopStart(){
  ngLoop('ngla','ngla-canvas',(ts)=>{
    const c=ngCV('ngla-canvas', 190); if(!c) return;
    const {ctx,W,H}=c;
    ctx.clearRect(0,0,W,H);
    const {seenMass}=nglaData();
    const padX=18, bw=W-padX*2, bh=30;
    const rows=[{y:34, seen:1, lab:'before smoothing'},{y:118, seen:seenMass, lab:'after add-one'}];
    rows.forEach(r=>{
      const sw=r.seen*bw;
      ctx.fillStyle='rgba(77,227,255,0.75)'; ctx.shadowColor=NG_COL.accent; ctx.shadowBlur=8;
      ctx.fillRect(padX, r.y, sw, bh); ctx.shadowBlur=0;
      if(r.seen<1){ ctx.fillStyle='rgba(255,95,142,0.7)'; ctx.shadowColor=NG_COL.accent3; ctx.shadowBlur=8; ctx.fillRect(padX+sw, r.y, bw-sw, bh); ctx.shadowBlur=0; }
      ctx.strokeStyle=NG_COL.border2; ctx.strokeRect(padX, r.y, bw, bh);
      ctx.font='500 9.5px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.muted; ctx.textAlign='left';
      ctx.fillText(r.lab, padX, r.y-7);
      ctx.fillStyle='#080C18'; ctx.font='700 10px "IBM Plex Mono", monospace';
      if(r.seen*bw>150) ctx.fillText('seen continuations '+(r.seen*100).toFixed(1)+'%', padX+8, r.y+bh/2+3.5);
      if(r.seen<1 && (1-r.seen)*bw>90){ ctx.textAlign='right'; ctx.fillText('unseen '+((1-r.seen)*100).toFixed(1)+'%', padX+bw-8, r.y+bh/2+3.5); ctx.textAlign='left'; }
    });
    // particles: seen (top) -> unseen (bottom right)
    if(Math.random()<0.35) _ngla.parts.push({t:0, x0:padX+Math.random()*seenMass*bw});
    _ngla.parts=_ngla.parts.filter(p=>p.t<1);
    _ngla.parts.forEach(p=>{
      p.t+=0.012;
      const x1=padX+(seenMass+(1-seenMass)*Math.random()*0.9)*bw;
      const sx=p.x0, sy=34+30, ex=Math.max(x1, padX+seenMass*bw+6), ey=118;
      const mx=(sx+ex)/2, my=(sy+ey)/2+26;
      const t=p.t;
      const ix=(1-t)*(1-t)*sx+2*(1-t)*t*mx+t*t*ex, iy=(1-t)*(1-t)*sy+2*(1-t)*t*my+t*t*ey;
      ctx.globalAlpha=0.85*Math.sin(Math.PI*t);
      ctx.fillStyle='#ffd260'; ctx.shadowColor='#ffd260'; ctx.shadowBlur=7;
      ctx.beginPath(); ctx.arc(ix,iy,2,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0; ctx.globalAlpha=1;
    });
    ctx.font='500 9.5px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.muted; ctx.textAlign='center';
    ctx.fillText('probability mass over the '+162+'-word vocabulary, for the context "'+_ngla.ctxWord+'"', W/2, H-8);
  });
}

// ── 3.6 VIZ 2: ADJUSTED COUNT MATRICES ──────────────────────
const NGADJ_ROWS=['the','fog','tide','rolls','keeper','ferry','gulls','boats'];
const NGADJ_COLS=['rolls','in','the','fog','lights','returns','circle','sea'];
function ngadjInit(){ ngEnsure(); ngadjRender(); }
function ngadjK(){ const el=document.getElementById('ngadj-k'); return el?+el.value/100:1; }
function ngadjRender(){
  const host=document.getElementById('ngadj-grids'); if(!host) return;
  const k=ngadjK();
  const kl=document.getElementById('ngadj-klab'); if(kl) kl.textContent=k.toFixed(2);
  const m=NG_S[2], V=m.V;
  const C=(r,c)=>ngCount(m,[r],c), T=r=>ngCtxTot(m,[r]);
  const mkTable=(title,col,cellFn,fmt,maxFn)=>{
    let mx=0.0001;
    NGADJ_ROWS.forEach(r=>NGADJ_COLS.forEach(cc=>{ mx=Math.max(mx, maxFn(cellFn(r,cc))); }));
    let h=`<div><div style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:${col};margin-bottom:6px">${title}</div>
    <table style="border-collapse:collapse;font-family:var(--mono);font-size:.6rem;width:100%"><tr><td></td>${NGADJ_COLS.map(cc=>`<td style="padding:2px 3px;color:var(--muted);text-align:center;font-size:.54rem">${cc}</td>`).join('')}</tr>`;
    NGADJ_ROWS.forEach(r=>{
      h+=`<tr><td style="padding:2px 4px;color:var(--muted);font-size:.54rem">${r}</td>`;
      NGADJ_COLS.forEach(cc=>{
        const v=cellFn(r,cc), t=maxFn(v)/mx;
        h+=`<td onmouseover="ngadjHover('${r}','${cc}')" style="padding:4px 3px;text-align:center;cursor:crosshair;border:1px solid var(--border);background:${col}${Math.round(8+t*52).toString(16).padStart(2,'0')};color:var(--text)">${fmt(v)}</td>`;
      });
      h+='</tr>';
    });
    return h+'</table></div>';
  };
  host.innerHTML=
    mkTable('raw counts C','#4DE3FF',(r,c)=>C(r,c),v=>v,v=>Math.log(1+v))+
    mkTable('smoothed P (add-k)','#A18FFF',(r,c)=>(C(r,c)+k)/(T(r)+k*V),v=>v<0.01?v.toFixed(3).slice(1):v.toFixed(2),v=>Math.sqrt(v))+
    mkTable('adjusted count c*','#ffb020',(r,c)=>(C(r,c)+k)*T(r)/(T(r)+k*V),v=>v<10?v.toFixed(1):v.toFixed(0),v=>Math.log(1+v));
}
function ngadjHover(r,c){
  const el=document.getElementById('ngadj-hover'); if(!el) return;
  const k=ngadjK(), m=NG_S[2], V=m.V;
  const cnt=ngCount(m,[r],c), tot=ngCtxTot(m,[r]);
  const p=(cnt+k)/(tot+k*V), cs=(cnt+k)*tot/(tot+k*V);
  const disc=cnt>0?(cs/cnt):null;
  el.innerHTML=`<strong style="color:var(--accent)">("${r}" &rarr; "${c}")</strong> &nbsp; C = ${cnt}, &nbsp; C(${r}) = ${tot} &nbsp;&middot;&nbsp; P* = (${cnt} + ${k.toFixed(2)}) / (${tot} + ${k.toFixed(2)}&times;${V}) = <strong style="color:var(--accent2)">${p.toFixed(4)}</strong> &nbsp;&middot;&nbsp; c* = (${cnt} + ${k.toFixed(2)}) &times; ${tot} / (${tot} + ${k.toFixed(2)}&times;${V}) = <strong style="color:#ffb020">${cs.toFixed(2)}</strong>${disc!=null?` &nbsp;&middot;&nbsp; discount c*/c = <strong style="color:${disc<0.75?'var(--accent3)':'var(--accent4)'}">${disc.toFixed(2)}</strong>`:` &nbsp;&middot;&nbsp; <strong style="color:var(--accent4)">a zero was rescued: 0 &rarr; ${cs.toFixed(2)}</strong>`}`;
}

// ── 3.6 VIZ 3: THE INTERPOLATION TRIANGLE ───────────────────
let _ngi = {mode:'dev', lam:[0.2,0.55,0.25], grids:null, best:null, drag:false, geom:null};
function ngiInit(){
  ngEnsure();
  _ngi={mode:'dev', lam:[0.2,0.55,0.25], grids:null, best:null, drag:false, geom:null};
  _ngi.grids={dev:ngiGrid(NG_DEV), train:ngiGrid(NG_TRAIN.slice(0,40))};
  _ngi.best={dev:ngiBest('dev'), train:ngiBest('train')};
  ngiBtns(); ngiLoopStart(); ngiSide();
}
function ngiGrid(sents){
  const pts=[];
  for(let a=0;a<=20;a++) for(let b=0;a+b<=20;b++){
    const lam=[a/20, b/20, (20-a-b)/20];
    pts.push({lam, pp:ngPerplexity(NG_S,3,sents,'interp',{lam}).pp});
  }
  return pts;
}
function ngiBest(mode){
  let best=null; _ngi.grids[mode].forEach(p=>{ if(!best||p.pp<best.pp) best=p; });
  return best;
}
function ngiBtns(){
  const el=document.getElementById('ngi-btns'); if(!el) return;
  el.innerHTML=[['dev','tune on dev (honest)'],['train','tune on train (trap)']].map(([k,l])=>`<button onclick="_ngi.mode='${k}';ngiBtns();ngiSide()" style="background:${_ngi.mode===k?(k==='dev'?'var(--accent)':'var(--accent3)'):'var(--surface3)'};color:${_ngi.mode===k?'var(--bg)':'var(--muted)'};border:1px solid var(--border2);border-radius:7px;padding:.4rem .7rem;font-family:var(--mono);font-size:.64rem;font-weight:700;cursor:pointer">${l}</button>`).join('');
}
function ngiXY(lam, g){ // barycentric -> canvas.  A=uni bottom-left, B=bi bottom-right, C=tri top
  return {x: lam[0]*g.ax + lam[1]*g.bx + lam[2]*g.cx, y: lam[0]*g.ay + lam[1]*g.by + lam[2]*g.cy};
}
function ngiLam(x,y,g){ // canvas -> barycentric (clamped)
  const det=(g.by-g.cy)*(g.ax-g.cx)+(g.cx-g.bx)*(g.ay-g.cy);
  let l0=((g.by-g.cy)*(x-g.cx)+(g.cx-g.bx)*(y-g.cy))/det;
  let l1=((g.cy-g.ay)*(x-g.cx)+(g.ax-g.cx)*(y-g.cy))/det;
  let l2=1-l0-l1;
  l0=Math.max(0,l0); l1=Math.max(0,l1); l2=Math.max(0,l2);
  const s=l0+l1+l2||1;
  return [l0/s,l1/s,l2/s];
}
function ngiColor(pp, mn, mx){
  const t=Math.min(1,Math.max(0,(Math.log(pp)-Math.log(mn))/(Math.log(mx)-Math.log(mn))));
  // green -> cyan -> purple -> red
  const stops=[[57,255,20],[0,229,255],[123,97,255],[255,77,109]];
  const seg=Math.min(2.999,t*3), i=Math.floor(seg), f=seg-i;
  const c0=stops[i], c1=stops[i+1];
  return `rgb(${Math.round(c0[0]+(c1[0]-c0[0])*f)},${Math.round(c0[1]+(c1[1]-c0[1])*f)},${Math.round(c0[2]+(c1[2]-c0[2])*f)})`;
}
function ngiLoopStart(){
  ngLoop('ngi','ngi-canvas',(ts)=>{
    const c=ngCV('ngi-canvas', 320); if(!c) return;
    const {cv,ctx,W,H}=c;
    const pad=34;
    const g={ax:pad, ay:H-pad, bx:W-pad, by:H-pad, cx:W/2, cy:pad};
    _ngi.geom=g;
    ctx.clearRect(0,0,W,H);
    const grid=_ngi.grids[_ngi.mode];
    let mn=Infinity, mx=0; grid.forEach(p=>{ if(isFinite(p.pp)){ mn=Math.min(mn,p.pp); mx=Math.max(mx,p.pp);} });
    const r=(g.bx-g.ax)/20/1.8;
    grid.forEach(p=>{
      const {x,y}=ngiXY(p.lam,g);
      ctx.fillStyle=isFinite(p.pp)?ngiColor(p.pp,mn,mx):'#3a0d18';
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    });
    // triangle edges
    ctx.strokeStyle=NG_COL.border2; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(g.ax,g.ay); ctx.lineTo(g.bx,g.by); ctx.lineTo(g.cx,g.cy); ctx.closePath(); ctx.stroke();
    // corner labels
    ctx.font='600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle=NG_COL.text; ctx.textAlign='left'; ctx.fillText('λ₁ = 1  (pure unigram)', g.ax-14, g.ay+18);
    ctx.textAlign='right'; ctx.fillText('λ₂ = 1  (pure bigram)', g.bx+14, g.by+18);
    ctx.textAlign='center'; ctx.fillText('λ₃ = 1  (pure trigram)', g.cx, g.cy-12);
    // optimum star
    const best=_ngi.best[_ngi.mode];
    const bs=ngiXY(best.lam,g);
    const pulse=1+0.15*Math.sin(ts/300);
    ctx.save(); ctx.translate(bs.x,bs.y); ctx.scale(pulse,pulse);
    ctx.fillStyle='#fff'; ctx.shadowColor='#fff'; ctx.shadowBlur=12;
    ctx.beginPath();
    for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rr=i%2===0?7:3; ctx.lineTo(Math.cos(a)*rr, Math.sin(a)*rr); }
    ctx.closePath(); ctx.fill(); ctx.restore(); ctx.shadowBlur=0;
    // draggable marker
    const mp=ngiXY(_ngi.lam,g);
    ctx.strokeStyle='#080C18'; ctx.lineWidth=2;
    ctx.fillStyle=NG_COL.accent4; ctx.shadowColor=NG_COL.accent4; ctx.shadowBlur=14;
    ctx.beginPath(); ctx.arc(mp.x,mp.y,8,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
    ctx.font='500 9px "IBM Plex Mono", monospace'; ctx.fillStyle=NG_COL.muted; ctx.textAlign='center';
    ctx.fillText('★ = optimum for this objective · drag the green dot', W/2, H-6);
    if(!cv._ngiBound){
      cv._ngiBound=true;
      const move=(x,y)=>{ const rct=cv.getBoundingClientRect(); _ngi.lam=ngiLam(x-rct.left,y-rct.top,_ngi.geom); ngiSide(); };
      cv.addEventListener('pointerdown',e=>{ _ngi.drag=true; cv.setPointerCapture(e.pointerId); move(e.clientX,e.clientY); });
      cv.addEventListener('pointermove',e=>{ if(_ngi.drag) move(e.clientX,e.clientY); });
      cv.addEventListener('pointerup',()=>{ _ngi.drag=false; });
    }
  });
}
function ngiSide(){
  const el=document.getElementById('ngi-read'); if(!el) return;
  const lam=_ngi.lam;
  const dev=ngPerplexity(NG_S,3,NG_DEV,'interp',{lam}).pp;
  const test=ngPerplexity(NG_S,3,NG_TEST,'interp',{lam}).pp;
  const train=ngPerplexity(NG_S,3,NG_TRAIN,'interp',{lam}).pp;
  const row=(l,v,c)=>`<div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;padding:3px 0"><span style="color:var(--muted)">${l}</span><span style="color:${c};font-weight:700">${v}</span></div>`;
  el.innerHTML=`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.8rem 1rem">
    ${row('λ₁ unigram', lam[0].toFixed(2),'#3DDC84')}${row('λ₂ bigram', lam[1].toFixed(2),'#3DDC84')}${row('λ₃ trigram', lam[2].toFixed(2),'#3DDC84')}
    <div style="border-top:1px solid var(--border);margin:6px 0"></div>
    ${row('train PP', ngPPfmt(train),'#4DE3FF')}${row('dev PP', ngPPfmt(dev),'#ffb020')}${row('test PP', ngPPfmt(test),'#FF5F8E')}
    <div style="font-family:var(--mono);font-size:.6rem;color:var(--muted);margin-top:6px;line-height:1.7">${_ngi.mode==='train'?'the ★ has fled to the trigram corner — training likelihood rewards memorization':'the ★ sits mid-triangle: held-out data demands all three orders'}</div></div>`;
  // stacked probe bar
  const st=document.getElementById('ngi-stack'); if(!st) return;
  const comps=[
    {l:'λ₁·P(rolls)', v:lam[0]*((ngCount(NG_S[1],[],'rolls')+1)/(NG_S[1].uniTot+NG_S[1].V)), c:'#3DDC84'},
    {l:'λ₂·P(rolls|tide)', v:lam[1]*(ngCtxTot(NG_S[2],['tide'])?ngCount(NG_S[2],['tide'],'rolls')/ngCtxTot(NG_S[2],['tide']):0), c:'#4DE3FF'},
    {l:'λ₃·P(rolls|the tide)', v:lam[2]*(ngCtxTot(NG_S[3],['the','tide'])?ngCount(NG_S[3],['the','tide'],'rolls')/ngCtxTot(NG_S[3],['the','tide']):0), c:'#A18FFF'}
  ];
  const tot=comps.reduce((a,x)=>a+x.v,0);
  st.innerHTML=`<div style="font-family:var(--mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px">the blend, live: P&#770;(rolls | the tide)</div>
    <div style="display:flex;height:22px;border-radius:6px;overflow:hidden;border:1px solid var(--border2)">${comps.map(x=>`<div style="width:${tot?x.v/tot*100:0}%;background:${x.c};opacity:.85"></div>`).join('')}</div>
    ${comps.map(x=>`<div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.64rem;padding:2px 0"><span style="color:${x.c}">${x.l}</span><span style="color:var(--text)">${x.v.toFixed(3)}</span></div>`).join('')}
    <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.68rem;border-top:1px solid var(--border);padding-top:3px;margin-top:2px"><span style="color:var(--muted)">P&#770; total</span><span style="color:var(--accent4);font-weight:700">${tot.toFixed(3)}</span></div>`;
}

// ── 3.6 VIZ 4: THE BACKOFF WATERFALL ────────────────────────
let _ngb = {levels:[], t:0, phase:'idle', result:null, query:null};
function ngbInit(){
  ngEnsure();
  _ngb={levels:[],t:0,phase:'idle',result:null,query:null};
  const el=document.getElementById('ngb-btns');
  if(el) el.innerHTML=[['the tide rolls','hit at trigram'],['over the tide','falls once'],['the island rolls','falls twice']].map(([q,l])=>`<button onclick="document.getElementById('ngb-in').value='${q}';ngbGo()" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.4rem .65rem;font-family:var(--mono);font-size:.62rem;cursor:pointer" title="${l}">${q}</button>`).join('');
  ngbGo();
}
function ngbGo(){
  const inp=document.getElementById('ngb-in'); if(!inp) return;
  const toks=ngTok(inp.value);
  if(toks.length<1) return;
  const w=toks[toks.length-1], ctxArr=toks.slice(0,-1).slice(-2);
  const res=ngBackoff(NG_S, Math.min(3, ctxArr.length+1), ctxArr, w, 0.4);
  _ngb.query={ctxArr,w};
  _ngb.levels=res.path.map(p=>{
    const sub=p.order===1?[]:ctxArr.slice(ctxArr.length-(p.order-1));
    return {order:p.order, ctx:sub, c:p.c, tot:p.tot, used:p.used, factor:p.factor};
  });
  _ngb.result=res.s; _ngb.t=0; _ngb.phase='drop';
  ngbLoopStart();
}
function ngbLoopStart(){
  ngLoop('ngb','ngb-canvas',()=>{
    const c=ngCV('ngb-canvas', 270); if(!c||!_ngb.query) return;
    const {ctx,W,H}=c;
    ctx.clearRect(0,0,W,H);
    if(_ngb.phase==='drop') _ngb.t=Math.min(_ngb.levels.length,_ngb.t+0.03);
    const lh=(H-40)/3;
    const nameOf=o=>o===3?'TRIGRAM':o===2?'BIGRAM':'UNIGRAM';
    _ngb.levels.forEach((L,i)=>{
      const y=24+i*lh+lh-24;
      const reached=_ngb.t>=i+0.5;
      const isRest=L.used&&_ngb.t>=i+0.9;
      const col=!reached?NG_COL.border2 : L.used?NG_COL.accent4:NG_COL.accent3;
      ctx.strokeStyle=col; ctx.lineWidth=2;
      if(isRest){ ctx.shadowColor=col; ctx.shadowBlur=10; }
      if(reached&&!L.used){
        // broken platform
        ctx.setLineDash([7,6]);
      }
      ctx.beginPath(); ctx.moveTo(60,y); ctx.lineTo(W-24,y); ctx.stroke();
      ctx.setLineDash([]); ctx.shadowBlur=0;
      ctx.font='700 10px "IBM Plex Mono", monospace'; ctx.fillStyle=col; ctx.textAlign='left';
      const q = L.order===1 ? `C(${_ngb.query.w}) = ${L.c} of ${L.tot} tokens` : `C(${L.ctx.join(' ')} ${_ngb.query.w}) = ${L.c}   ·   C(${L.ctx.join(' ')}) = ${L.tot}`;
      ctx.fillText(nameOf(L.order), 60, y-26);
      ctx.font='500 9.5px "IBM Plex Mono", monospace'; ctx.fillStyle=reached?NG_COL.text:NG_COL.muted;
      ctx.fillText(q, 60, y-12);
      if(reached&&!L.used){
        ctx.fillStyle=NG_COL.accent3; ctx.font='700 10px "IBM Plex Mono", monospace'; ctx.textAlign='right';
        ctx.fillText('count = 0 → fall, score × 0.4', W-24, y-12);
        ctx.textAlign='left';
      }
    });
    // ball
    const prog=Math.min(_ngb.t, _ngb.levels.findIndex(l=>l.used)+0.9);
    const li=Math.min(Math.floor(prog), _ngb.levels.length-1);
    const frac=prog-li;
    const yTop=24+li*lh+lh-24, yPrev=li===0?6:24+(li-1)*lh+lh-24;
    const by=yPrev+(yTop-yPrev)*Math.min(1,frac/0.9)-8;
    ctx.fillStyle='#fff'; ctx.shadowColor='#fff'; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.arc(40, by, 7, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    const read=document.getElementById('ngb-read');
    if(read){
      const usedL=_ngb.levels.find(l=>l.used);
      const done=_ngb.t>=_ngb.levels.findIndex(l=>l.used)+0.9;
      if(done&&usedL){
        const falls=_ngb.levels.findIndex(l=>l.used);
        const base = usedL.order===1&&usedL.c===0 ? `1/(N+V)` : `${usedL.c}/${usedL.tot}`;
        read.innerHTML=`S(${_ngb.query.w} | ${_ngb.query.ctxArr.join(' ')}) = ${falls?('0.4'+(falls>1?'<sup>'+falls+'</sup>':'')+' × '):''}${base} = <strong style="color:var(--accent4);font-size:.9rem">${_ngb.result<0.001?_ngb.result.toExponential(2):_ngb.result.toFixed(4)}</strong> &nbsp;&middot;&nbsp; ${falls===0?'the trigram had evidence — no fall needed':falls===1?'one fall: the bigram caught it':'two falls: only the unigram had evidence'}`;
      } else read.innerHTML='searching for evidence, top order first&hellip;';
    }
  });
}
NGRAM_PAGES.ngentropy = `
<div class="lesson-chapter-label">Section 3.7</div>
<h1 class="lesson-h1">Entropy and Cross-Entropy</h1>
<p class="lesson-intro">Perplexity is not arbitrary. It comes directly from cross-entropy, a concept from information theory that explains why perplexity is defined the way it is.</p>
<h2 class="lesson-h2">Entropy</h2>
<p class="lesson-p">Entropy measures information, or equivalently, uncertainty. For a random variable X with probability function p, the entropy is:</p>
<div class="lesson-math" id="ng-math-entropy">\\[H(X) = -\\sum_{x \\in \\chi} p(x) \\log_2 p(x)\\]</div>
<p class="lesson-p">When computed in log base 2, entropy is measured in bits, and it has a direct interpretation: it is the lower bound on the average number of bits needed to encode an outcome under an optimal coding scheme. The standard example is betting on eight horses. If all eight are equally likely, you need 3 bits to name one. If one horse is heavily favored, you can give it a short code and the rare ones longer codes, dropping the average below 3 bits.</p>
<h2 class="lesson-h2">Entropy Rate</h2>
<p class="lesson-p">For sequences rather than single events, we care about the per-word entropy, or entropy rate: the entropy of a sequence divided by its length. To measure the true entropy of a language we take this to the limit of infinitely long sequences:</p>
<div class="lesson-math" id="ng-math-entropyrate">\\[H(L) = -\\lim_{n \\to \\infty} \\dfrac{1}{n} \\sum_{W \\in L} p(w_{1:n}) \\log p(w_{1:n})\\]</div>
<h2 class="lesson-h2">Cross-Entropy</h2>
<p class="lesson-p">We almost never know the true distribution p that generates language. Cross-entropy measures how well a <em>model</em> m approximates that true p: we draw text according to the real p, but score it using our model m.</p>
<div class="lesson-math" id="ng-math-crossentropy">\\[H(p, m) = -\\lim_{n \\to \\infty} \\dfrac{1}{n} \\sum_{W \\in L} p(w_{1:n}) \\log m(w_{1:n})\\]</div>
<p class="lesson-p">The key fact is that cross-entropy is always an upper bound on the true entropy. The more accurate your model, the closer its cross-entropy gets to the true entropy. So between two models, the one with lower cross-entropy is more accurate, which gives us a clean way to compare them.</p>
<h2 class="lesson-h2">The Connection to Perplexity</h2>
<p class="lesson-p">With cross-entropy measured in bits, perplexity is 2 raised to that cross-entropy. If we use natural logarithms instead, the base is e:</p>
<div class="lesson-math" id="ng-math-pplentropy">\\[\\text{Perplexity}(W) = 2^{H(W)} = P(w_1 w_2 \\ldots w_N)^{-\\frac{1}{N}}\\]</div>
<div class="lesson-note"><div class="lesson-note-label">Why This Matters</div>
<p>On a fixed evaluation set, reducing average next-token cross-entropy also reduces perplexity. This connects the evaluation metric to the loss used to train autoregressive language models.</p></div>
<div class="quiz-block" id="qng7"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What is the relationship between perplexity and cross-entropy?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qng7','Correct! Perplexity is 2 raised to the cross-entropy, which is exactly why perplexity involves an inverse probability.')">Perplexity is 2 to the power of cross-entropy</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng7','They are not equal; one is the exponent of the other.')">They are the same number</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng7','Cross-entropy is the exponent, not the log.')">Perplexity is the log of cross-entropy</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qng7','There is a precise mathematical link.')">They are unrelated</button>
</div><div class="quiz-explain" id="qng7-explain"></div></div>`;

// ── OPEN N-GRAM SECTION ─────────────────────────────────────
function openNgramSec(id) {
  const pg = NGRAM_PAGES[id];
  if (!pg) return;
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if (!sv || !sb) return;
  ngStopAnims();
  const sec = NGRAM_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if (crumb && sec) crumb.innerHTML = 'N-gram Language Models <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  renderMath(sb);
  mcSectionDelay(()=>{
    if (id==='ngdef'){ ngcReset(); ngmSetEx(); ngxInit(); nglReset(); }
    if (id==='ngeval'){ ngeReset(); ngsInit(); }
    if (id==='ngppl'){ ngpPreset('uniform'); ngdInit(); ngvInit(); }
    if (id==='ngsample'){ ngsaInit(); }
    if (id==='nggen'){ ngoInit(); ngwInit(); }
    if (id==='ngsmooth'){ nglaInit(); ngadjInit(); ngiInit(); ngbInit(); }
  }, 100);
  sv.onscroll = () => {
    const h = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if (bar) bar.style.width = (h>0?(sv.scrollTop/h)*100:0)+'%';
  };
}
