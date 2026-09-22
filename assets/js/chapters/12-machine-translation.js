/* ══════════════════════════════════════════════════════════════
   MACHINE TRANSLATION
   ══════════════════════════════════════════════════════════════ */

const MT_SEC = [
  {id:'mtdiv',   num:'12.1',   title:'Where Languages Refuse to Line Up', icon:'\u2261', desc:'Four ways languages differ structurally, and why each one makes translation harder.', tags:['typology','divergence']},
  {id:'mtorder', num:'12.1.1', title:'The Order Subjects, Verbs and Objects Arrive In', icon:'\u21C4', desc:'Word order, adposition side, and the cost of putting a sentence back together.', tags:['SVO/SOV','reordering']},
  {id:'mtlex',   num:'12.1.2', title:'When One Word Splits Into Several', icon:'\u25D1', desc:'Languages cut the space of meanings differently, so words rarely map one to one.', tags:['lexical gaps','many-to-many']},
  {id:'mtmorph', num:'12.1.3', title:'How Many Pieces Fit Inside a Word', icon:'\u25A6', desc:'Morphemes per word, how cleanly they separate, and why word-level vocabularies fail.', tags:['morphology','fusion']},
  {id:'mtdrop',  num:'12.1.4', title:'What Speakers Leave Out on Purpose', icon:'\u25CC', desc:'Pro-drop, referential density, and the inference a translator has to supply.', tags:['pro-drop','discourse']},
  {id:'mtenc',   num:'12.2',   title:'Mapping a Whole Sentence Onto a Whole Sentence', icon:'\u2192', desc:'The encoder-decoder: one sentence in, a context vector, one sentence out.', tags:['seq2seq','autoregressive']},
  {id:'mttok',   num:'12.2.1', title:'Cutting Text Into Subword Pieces', icon:'\u2702', desc:'BPE, wordpiece and unigram on the same input, and why the splits disagree.', tags:['BPE','unigram LM']},
  {id:'mtalign', num:'12.2.2', title:'Building the Parallel Text to Train On', icon:'\u2263', desc:'Sentence alignment is not one-to-one, and most of the work is cleaning.', tags:['bitext','alignment']},
  {id:'mtcross', num:'12.3',   title:'Inside the Encoder-Decoder Block', icon:'\u229E', desc:'The one layer the decoder has that the encoder does not, and where Q, K and V come from.', tags:['cross-attention','masks']},
  {id:'mtbeam',  num:'12.4',   title:'Keeping Several Translations Alive at Once', icon:'\u2442', desc:'Why the locally best word is often the wrong one, and how beam search hedges.', tags:['beam search','log-prob']},
  {id:'mtmbr',   num:'12.4.1', title:'Picking the Translation Everyone Else Agrees With', icon:'\u25CE', desc:'Most probable and least risky are different candidates, and usually the second is better.', tags:['MBR','utility']},
  {id:'mtlow',   num:'12.5',   title:'Translating Without Much Data', icon:'\u25E2', desc:'How bitext is distributed across the world\u2019s languages, and where the cliff falls.', tags:['low-resource','domain']},
  {id:'mtback',  num:'12.5.1', title:'Manufacturing Training Data From Monolingual Text', icon:'\u21BB', desc:'Backtranslation: a weak model in one direction produces training data for the other.', tags:['backtranslation','synthetic']},
  {id:'mtmulti', num:'12.5.2', title:'One Model, Many Language Pairs', icon:'\u2318', desc:'A prepended language token, a shared space, and the transfer that comes with it.', tags:['multilingual','transfer']},
  {id:'mtwho',   num:'12.5.3', title:'Who Builds the System, and For Whom', icon:'\u26A0', desc:'What is actually inside a scraped multilingual corpus, and who was in the room.', tags:['data audit','participation']},
  {id:'mteval',  num:'12.6',   title:'Judging Whether a Translation Is Any Good', icon:'\u229F', desc:'Adequacy and fluency are separate axes, and fluent-but-wrong is the dangerous quadrant.', tags:['adequacy','fluency']},
  {id:'mthuman', num:'12.6.1', title:'Asking People to Score Translations', icon:'\u263A', desc:'Rater disagreement, the normalization that reduces it, and post-editing as a measure.', tags:['human eval','agreement']},
  {id:'mtchrf',  num:'12.6.2', title:'Scoring by Overlap With a Human Translation', icon:'\u2696', desc:'chrF character n-grams computed by hand, and the three places the metric fails.', tags:['chrF','BLEU']},
  {id:'mtbert',  num:'12.6.3', title:'Scoring by Meaning Instead of Exact Match', icon:'\u25C8', desc:'Embedding-based metrics match cold to freezing, which character overlap cannot.', tags:['BERTScore','COMET']},
  {id:'mtbias',  num:'12.7',   title:'Whose Assumptions the System Encodes', icon:'\u2696', desc:'A gender-neutral pronoun goes in, a gendered one comes out, amplified past the statistics.', tags:['bias','amplification']},
  {id:'mtrecap', num:'12.8',   title:'Everything in One Picture', icon:'\u25C9', desc:'Corpus to tokenizer to encoder-decoder to beam search to evaluation, in one diagram.', tags:['recap','pipeline']}
];

function buildMTOverview(){
  const cards = MT_SEC.map(s=>`
    <div class="sc-card" onclick="openMTSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Moving Between Languages</div>
    <h1 class="lesson-h1">Machine Translation</h1>
    <p class="lesson-intro">Translation has to preserve meaning across differences in word order, vocabulary, morphology, and what speakers leave unstated. We will examine those differences, build an encoder-decoder model, compare decoding methods, and study how translations are evaluated.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">Languages diverge along several independent axes at once: constituent order, how meanings are carved into words, how many morphemes fit inside a word, and how much is left implicit. A language pair is difficult roughly in proportion to how many of these axes it differs on.</div>
        <div class="ch-sum-item">The encoder-decoder architecture reads the whole source sentence into a context representation and then generates the target one token at a time, with each generated token fed back as input to the next step.</div>
        <div class="ch-sum-item">Cross-attention is the only structural difference between an encoder block and a decoder block: queries come from the decoder while keys and values come from the encoder output, which is how the target sentence sees the source.</div>
        <div class="ch-sum-item">Greedy decoding takes the highest-probability token at every step and regularly misses the highest-probability sentence. Beam search keeps several partial translations alive and scores them by accumulated log probability.</div>
        <div class="ch-sum-item">Low-resource pairs are the normal case rather than the exception. Backtranslation manufactures training data from monolingual text, and multilingual models let related languages share what they have learned.</div>
        <div class="ch-sum-item">Automatic metrics based on surface overlap cannot detect a fluent translation that says the wrong thing, which is the failure mode that matters most. Embedding-based metrics catch some of it, and human judgment still catches the rest.</div>
        <div class="ch-sum-item">Translation systems assign gender and other attributes that the source sentence left unspecified, and they do so at rates that exceed the statistical skew in the underlying data.</div>
      </div>
    </div>`;
}

const MT_PAGES = {};

/* ── shared drawing helpers ──────────────────────────────── */
const MTC = {
  bg:'#EDF2FB', surf:'#FAFBFF', surf2:'#DEE7F6', surf3:'#CFDBEF',
  line:'rgba(23,27,52,0.14)', line2:'rgba(23,27,52,0.26)',
  text:'#16213B', muted:'#526080',
  a1:'#4F46E5', a2:'#9F1239', a3:'#9F1239', a4:'#0B8457', a5:'#B45309',
  panel:'#0B101F',
  mono:"'IBM Plex Mono', Consolas, monospace",
  body:"'Schibsted Grotesk', Helvetica, Arial, sans-serif"
};

function mtCtx(id, hCss){
  const c = document.getElementById(id); if(!c) return null;
  const dpr = window.devicePixelRatio || 1;
  const w = c.clientWidth || parseInt(c.getAttribute('data-w')||'660', 10);
  const h = hCss;
  c.width = Math.max(1, Math.round(w*dpr));
  c.height = Math.max(1, Math.round(h*dpr));
  c.style.height = h + 'px';
  const x = c.getContext('2d');
  if(!x) return null;
  x.setTransform(dpr,0,0,dpr,0,0);
  x.clearRect(0,0,w,h);
  return {x, w, h, cv:c};
}
function mtTxt(x, s, px, py, {size=11, col=MTC.text, align='left', base='middle', font=MTC.mono, weight=''}={}){
  x.save(); x.font = (weight?weight+' ':'') + size + 'px ' + font;
  x.fillStyle = col; x.textAlign = align; x.textBaseline = base;
  x.fillText(s, px, py); x.restore();
}
function mtRR(x, px, py, w, h, r){
  x.beginPath();
  const rr = Math.min(r, w/2, h/2);
  x.moveTo(px+rr, py);
  x.arcTo(px+w, py, px+w, py+h, rr);
  x.arcTo(px+w, py+h, px, py+h, rr);
  x.arcTo(px, py+h, px, py, rr);
  x.arcTo(px, py, px+w, py, rr);
  x.closePath();
}
function mtChip(x, px, py, w, h, fill, stroke, label, lc, size){
  mtRR(x, px, py, w, h, 6);
  if(fill){ x.fillStyle = fill; x.fill(); }
  if(stroke){ x.strokeStyle = stroke; x.lineWidth = 1; x.stroke(); }
  if(label) mtTxt(x, label, px+w/2, py+h/2+0.5, {size:size||11, col:lc||MTC.text, align:'center'});
}
function mtSet(id, html){ const e = document.getElementById(id); if(e) e.innerHTML = html; }
function mtOn(sel, cls){ document.querySelectorAll(sel).forEach(b=>b.classList.remove('is-on')); }
function mtLerp(a,b,t){ return a + (b-a)*t; }
function mtEase(t){ return t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2; }

/* small uniform button styles used across MT widgets */
const MTBTN  = 'background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.38rem .8rem;font-family:var(--mono);font-size:.66rem;cursor:pointer;transition:all .18s';
const MTBTNA = 'background:var(--accent);color:#FAFBFF;border:1px solid var(--accent);border-radius:8px;padding:.42rem 1rem;font-family:var(--mono);font-size:.68rem;font-weight:700;cursor:pointer';
const MTCAP  = 'font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem';
const MTROW  = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem;align-items:center';
const MTLBL  = 'font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em';

/* ══ 12.1 WHERE LANGUAGES REFUSE TO LINE UP ═══════════════ */
MT_PAGES.mtdiv = `
<div class="lesson-chapter-label">Section 12.1</div>
<h1 class="lesson-h1">Where Languages Refuse to Line Up</h1>
<p class="lesson-intro">Word-by-word substitution misses many of the choices a translator has to make. Languages differ in structure as well as vocabulary. This section introduces four kinds of mismatch that recur in the examples ahead.</p>

<h2 class="lesson-h2">Universals and Divergences</h2>
<p class="lesson-p">Some things really are shared. Every language has words for people, food, and being alive; every language has ways to ask questions, refuse requests, and be polite. These <strong>universals</strong> are what makes translation possible at all. But underneath them sit the <strong>divergences</strong>, the places where two languages encode the same situation with different machinery, and those are what make translation hard.</p>
<p class="lesson-p">The useful way to think about a language pair is not "how different do these look" but "which axes do they differ on, and by how much." Two languages can share a writing system, borrow vocabulary from each other, and still require heavy restructuring because their verbs land in different places. Two others can look unrelated on the page and align almost word for word.</p>
<p class="lesson-p">The chart below plots a language on four axes at once. Pick a source and a target, and the shaded area between the two lines is the work a translation system has to do. Click any axis where the gap is wide and a sentence pair drops in showing what breaks there.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Divergence Atlas</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">source</span>
      <select id="dvg-src" onchange="dvgDraw()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.35rem .6rem;font-family:var(--mono);font-size:.68rem"></select>
      <span style="${MTLBL}">target</span>
      <select id="dvg-tgt" onchange="dvgDraw()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.35rem .6rem;font-family:var(--mono);font-size:.68rem"></select>
      <button style="${MTBTN}" onclick="dvgPreset(0)">English &rarr; Japanese</button>
      <button style="${MTBTN}" onclick="dvgPreset(1)">English &rarr; German</button>
    </div>
    <canvas id="dvg-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="dvg-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">English to German shows a gap on one axis and near-agreement on the other three, which is why that pair has always been comparatively easy. English to Japanese shows a gap on all four at once: the verb moves to the end, the words carve meaning differently, the morphology packs more inside each word, and Japanese omits material that English requires. The four subsections that follow take one axis each.</p>

<div class="quiz-block" id="qmt-div"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Two languages share most of their vocabulary through borrowing. What does that tell you about how hard the pair is to translate?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-div','Correct. Shared vocabulary addresses one axis only. Order, morphology and referential density are independent of it, and a pair can share words while diverging sharply on all three.')">Very little, since vocabulary is only one of several independent axes</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-div','Shared vocabulary helps with lexical lookup but does nothing about word order or morphology.')">The pair will be easy, since most words map directly</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-div','Borrowing does not make translation harder; it simply does not settle the question.')">The pair will be harder, since borrowed words shift meaning</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-div','Vocabulary overlap is measurable and does matter for one axis; it is just not sufficient on its own.')">Vocabulary overlap is not a meaningful measurement</button>
</div><div class="quiz-explain" id="qmt-div-explain"></div></div>`;

/* ── Divergence Atlas ─────────────────────────────────────── */
const DVG_AX = [
  {k:'order', lab:'constituent order',  lo:'rigid SVO', hi:'verb-final'},
  {k:'lex',   lab:'lexical carving',    lo:'aligns with English', hi:'cuts differently'},
  {k:'morph', lab:'morphemes per word', lo:'isolating', hi:'polysynthetic'},
  {k:'ref',   lab:'referential density',lo:'says everything', hi:'omits freely'}
];
const DVG_L = {
  English:   {order:.10, lex:.05, morph:.22, ref:.06},
  German:    {order:.62, lex:.20, morph:.38, ref:.10},
  Spanish:   {order:.20, lex:.24, morph:.44, ref:.62},
  Japanese:  {order:.94, lex:.72, morph:.66, ref:.90},
  Turkish:   {order:.90, lex:.55, morph:.86, ref:.70},
  Mandarin:  {order:.34, lex:.66, morph:.06, ref:.74},
  Arabic:    {order:.72, lex:.50, morph:.70, ref:.55},
  Vietnamese:{order:.22, lex:.60, morph:.03, ref:.68}
};
const DVG_EX = {
  order:{t:'Constituent order',
    a:'EN &nbsp;<b>He</b> &nbsp;<b>wrote</b> &nbsp;<b>a letter</b>',
    b:'JA &nbsp;<b>kare wa</b> &nbsp;<b>tegami o</b> &nbsp;<b>kaita</b>',
    n:'The verb moves from second position to last, so every word after it has to be held in memory and re-emitted at the end.'},
  lex:{t:'Lexical carving',
    a:'EN &nbsp;<b>wear</b> (a coat, shoes, a hat, glasses)',
    b:'JA &nbsp;<b>kiru</b> / <b>haku</b> / <b>kaburu</b> / <b>kakeru</b> / <b>hameru</b>',
    n:'One English verb covers a region of meaning that Japanese divides among five, so choosing the right one requires knowing which part of the body is involved.'},
  morph:{t:'Morphemes per word',
    a:'EN &nbsp;<b>with the table</b> &nbsp;(3 words)',
    b:'RU &nbsp;<b>stolom</b> &nbsp;(1 word, 2 morphemes, 3 features)',
    n:'A whole English phrase collapses into one Russian word, and the suffix carries case, number and declension class together.'},
  ref:{t:'Referential density',
    a:'EN &nbsp;<b>She</b> arrived and <b>she</b> sat down',
    b:'ES &nbsp;<b>&empty;</b> Lleg&oacute; y <b>&empty;</b> se sent&oacute;',
    n:'Spanish drops the subject pronoun where English requires it, so translating into English means recovering a referent that was never written.'}
};
let _dvg = {src:'English', tgt:'Japanese', pick:null, hot:null, box:[]};

function dvgBuild(){
  const s = document.getElementById('dvg-src'), t = document.getElementById('dvg-tgt');
  if(!s || !t) return;
  const opts = Object.keys(DVG_L).map(k=>`<option value="${k}">${k}</option>`).join('');
  s.innerHTML = opts; t.innerHTML = opts;
  s.value = _dvg.src; t.value = _dvg.tgt;
  const cv = document.getElementById('dvg-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('click', e=>{
      const r = cv.getBoundingClientRect(), mx = e.clientX-r.left;
      for(const b of _dvg.box){ if(Math.abs(mx-b.x) < 46){ _dvg.pick = b.k; dvgDraw(); return; } }
    });
    cv.addEventListener('mousemove', e=>{
      const r = cv.getBoundingClientRect(), mx = e.clientX-r.left;
      let h = null;
      for(const b of _dvg.box){ if(Math.abs(mx-b.x) < 46) h = b.k; }
      if(h !== _dvg.hot){ _dvg.hot = h; dvgDraw(); }
    });
  }
  dvgDraw();
}
function dvgPreset(i){
  _dvg.src = 'English'; _dvg.tgt = i===0 ? 'Japanese' : 'German'; _dvg.pick = null;
  const s = document.getElementById('dvg-src'), t = document.getElementById('dvg-tgt');
  if(s) s.value = _dvg.src; if(t) t.value = _dvg.tgt;
  dvgDraw();
}
function dvgDraw(){
  const s = document.getElementById('dvg-src'), t = document.getElementById('dvg-tgt');
  if(s) _dvg.src = s.value; if(t) _dvg.tgt = t.value;
  const c = mtCtx('dvg-canvas', 300); if(!c) return;
  const {x, w, h} = c;
  const A = DVG_L[_dvg.src], B = DVG_L[_dvg.tgt];
  const padL = 30, padR = 30, top = 46, bot = h-64;
  const n = DVG_AX.length;
  const step = (w-padL-padR)/(n-1);
  _dvg.box = DVG_AX.map((a,i)=>({k:a.k, x:padL+i*step}));

  // axis rails
  DVG_AX.forEach((a,i)=>{
    const px = padL + i*step;
    const wide = Math.abs(A[a.k]-B[a.k]) > .3;
    x.strokeStyle = (_dvg.hot===a.k||_dvg.pick===a.k) ? MTC.a1 : MTC.line2;
    x.lineWidth = (_dvg.hot===a.k||_dvg.pick===a.k) ? 2 : 1;
    x.beginPath(); x.moveTo(px, top); x.lineTo(px, bot); x.stroke();
    for(let g=0; g<=4; g++){
      const gy = mtLerp(top, bot, g/4);
      x.strokeStyle = MTC.line; x.lineWidth = 1;
      x.beginPath(); x.moveTo(px-4, gy); x.lineTo(px+4, gy); x.stroke();
    }
    const lab = a.lab.split(' ');
    mtTxt(x, lab[0], px, bot+20, {size:9.5, col:wide?MTC.a2:MTC.muted, align:'center'});
    mtTxt(x, lab.slice(1).join(' '), px, bot+32, {size:9.5, col:wide?MTC.a2:MTC.muted, align:'center'});
    if(wide) mtTxt(x, '\u25B2 gap', px, bot+46, {size:8.5, col:MTC.a2, align:'center'});
  });
  mtTxt(x, DVG_AX[0].hi, padL-6, top-14, {size:8.5, col:MTC.muted});
  mtTxt(x, DVG_AX[0].lo, padL-6, bot+8, {size:8.5, col:MTC.muted});

  const yOf = v => mtLerp(bot, top, v);
  // shaded difficulty surface
  x.beginPath();
  DVG_AX.forEach((a,i)=>{ const px=padL+i*step; i? x.lineTo(px, yOf(A[a.k])) : x.moveTo(px, yOf(A[a.k])); });
  for(let i=n-1; i>=0; i--){ const a=DVG_AX[i], px=padL+i*step; x.lineTo(px, yOf(B[a.k])); }
  x.closePath();
  x.fillStyle = 'rgba(159,18,57,0.13)'; x.fill();

  const poly = (L, col, dash)=>{
    x.save(); x.strokeStyle = col; x.lineWidth = 2.2; x.setLineDash(dash||[]);
    x.beginPath();
    DVG_AX.forEach((a,i)=>{ const px=padL+i*step, py=yOf(L[a.k]); i? x.lineTo(px,py) : x.moveTo(px,py); });
    x.stroke(); x.restore();
    DVG_AX.forEach((a,i)=>{
      const px=padL+i*step, py=yOf(L[a.k]);
      x.beginPath(); x.arc(px, py, 4.5, 0, 7); x.fillStyle = col; x.fill();
      x.beginPath(); x.arc(px, py, 4.5, 0, 7); x.strokeStyle = MTC.surf; x.lineWidth=1.4; x.stroke();
    });
  };
  poly(A, MTC.a1); poly(B, MTC.a2, [5,4]);

  // legend
  mtChip(x, padL-6, 12, 11, 11, MTC.a1, null);
  mtTxt(x, _dvg.src, padL+12, 18, {size:10.5, col:MTC.text});
  const off = padL + 26 + x.measureText(_dvg.src).width*0.62 + 30;
  mtChip(x, off, 12, 11, 11, MTC.a2, null);
  mtTxt(x, _dvg.tgt, off+18, 18, {size:10.5, col:MTC.text});

  let tot = 0; DVG_AX.forEach(a=>tot += Math.abs(A[a.k]-B[a.k]));
  mtTxt(x, 'total divergence  ' + (tot/n).toFixed(2), w-8, 18, {size:10.5, col:MTC.a2, align:'right'});

  const e = _dvg.pick ? DVG_EX[_dvg.pick] : null;
  mtSet('dvg-cap', e
    ? `<b style="color:var(--accent)">${e.t}</b> &nbsp;gap ${Math.abs(A[_dvg.pick]-B[_dvg.pick]).toFixed(2)}<br><span style="font-size:.72rem;line-height:2">${e.a}<br>${e.b}</span><br>${e.n}`
    : 'The shaded band between the two lines is the structural distance the system has to cover. Click an axis to see a sentence pair that breaks along it.');
}

/* ══ 12.1.1 WORD ORDER ════════════════════════════════════ */
MT_PAGES.mtorder = `
<div class="lesson-chapter-label">Section 12.1.1</div>
<h1 class="lesson-h1">The Order Subjects, Verbs and Objects Arrive In</h1>
<p class="lesson-intro">The most visible divergence is the order the major sentence parts come in. English is <strong>SVO</strong>: subject, verb, object. Japanese is <strong>SOV</strong>, with the verb at the end. Irish and Classical Arabic are <strong>VSO</strong>, verb first. Roughly 40% of the world&rsquo;s languages are SOV and about 35% SVO, with the remainder split among the other four possible orders.</p>

<h2 class="lesson-h2">Reordering Has a Cost</h2>
<p class="lesson-p">Moving from one order to another is not a matter of shuffling three labels. A translation system generating target words left to right has to hold source material in memory until the position where it belongs arrives. The further a word travels, the longer it has to be held, and the more chances there are to attach it to the wrong place.</p>
<p class="lesson-p">A useful way to see this is to draw a line from each source word to its translation and count how many lines cross. Zero crossings means the two sentences run in parallel and a system can emit words as it reads them. Many crossings means the sentence has to be substantially rebuilt.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Reordering Machine</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="reo-btns"></div>
    <canvas id="reo-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="reo-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Order Predicts Other Things</h2>
<p class="lesson-p">Word order is not an isolated fact. It correlates with several other structural choices, which is useful because it means one observation predicts others. Languages that put the object after the verb tend to use <strong>prepositions</strong> (<em>to a friend</em>), while languages that put the object before the verb tend to use <strong>postpositions</strong> (<em>tomodachi ni</em>, literally <em>friend to</em>). The adposition sits on the opposite side of its noun in the two types.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Adposition Side Follows Verb Position</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="adp-btns"></div>
    <canvas id="adp-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="adp-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The same logic extends further: verb-final languages tend to place relative clauses before the noun rather than after, and to place the genitive before the possessed noun. These correlations are tendencies rather than laws, but they are strong enough that knowing one property of an unfamiliar language lets you make reasonable guesses about several others.</p>

<div class="quiz-block" id="qmt-ord"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does a high crossing count in an alignment diagram indicate a harder translation?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-ord','Correct. Crossings mean source material has to be held and emitted out of order, so the system cannot simply translate as it reads.')">Source words must be held in memory and emitted far from where they were read</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-ord','Crossings say nothing about vocabulary size; they are purely about position.')">It means the target language has a larger vocabulary</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-ord','A crossing indicates reordering, not a missing translation.')">It means some source words have no translation</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-ord','Sentence length and crossing count are independent; a short sentence can have many crossings.')">It means the sentences have different lengths</button>
</div><div class="quiz-explain" id="qmt-ord-explain"></div></div>`;

/* ── Reordering Machine ───────────────────────────────────── */
const REO = [
  {k:'ja', lab:'Japanese \u00b7 SOV', src:['He','wrote','a letter','to a friend'],
   tgt:['kare wa','tomodachi ni','tegami o','kaita'], map:[0,3,2,1],
   note:'Japanese puts the verb last and the indirect object before the direct object. Three of the four alignment lines cross.'},
  {k:'de', lab:'German \u00b7 V2 + adverb fronting', src:['He','wrote','a letter','yesterday'],
   tgt:['Gestern','schrieb','er','einen Brief'], map:[3,1,0,2],
   note:'German requires the finite verb in second position. Fronting the adverb pushes the subject after the verb, which English never does.'},
  {k:'ar', lab:'Arabic \u00b7 VSO', src:['The boy','read','the book'],
   tgt:['qara\u02BEa','al-waladu','al-kit\u0101ba'], map:[1,0,2],
   note:'Classical Arabic puts the verb first. Only the subject and verb swap, so the crossing count stays low.'},
  {k:'zh', lab:'Mandarin \u00b7 pre-verbal goal', src:['I','gave','the book','to him'],
   tgt:['w\u01D2','g\u011Bi','t\u0101','sh\u016B'], map:[0,1,3,2],
   note:'Mandarin places the goal phrase before the direct object, so the last two constituents swap.'},
  {k:'es', lab:'Spanish \u00b7 near-parallel', src:['The red','balloon','burst'],
   tgt:['Estall\u00F3','el globo','rojo'], map:[2,1,0],
   note:'Adjective follows the noun and the verb can lead, so even a close language reverses a three-word phrase.'}
];
let _reo = {i:0, t:0, raf:null};

function reoBuild(){
  const b = document.getElementById('reo-btns');
  if(b) b.innerHTML = '<span style="'+MTLBL+'">target</span>' + REO.map((r,i)=>
    `<button style="${MTBTN}" id="reo-b${i}" onclick="reoGo(${i})">${r.lab}</button>`).join('');
  _reo.i = 0; _reo.t = 0; reoDraw(); reoAnim();
}
function reoGo(i){ _reo.i = i; _reo.t = 0; reoAnim(); }
function reoAnim(){
  if(_reo.raf) cancelAnimationFrame(_reo.raf);
  const t0 = Date.now();
  const step = ()=>{
    _reo.t = Math.min(1, (Date.now()-t0)/700);
    reoDraw();
    if(_reo.t < 1) _reo.raf = requestAnimationFrame(step);
  };
  step();
}
function reoDraw(){
  const c = mtCtx('reo-canvas', 250); if(!c) return;
  const {x, w, h} = c;
  const R = REO[_reo.i], n = R.src.length;
  REO.forEach((_,i)=>{ const e=document.getElementById('reo-b'+i); if(e){
    e.style.background = i===_reo.i ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_reo.i ? '#FAFBFF' : 'var(--muted)'; } });

  const pad = 22, bw = (w-pad*2)/n - 8, yTop = 46, yBot = h-70, bh = 34;
  const e = mtEase(_reo.t);
  const srcX = i => pad + i*((w-pad*2)/n) + 4;
  // source row
  mtTxt(x, 'SOURCE \u00b7 ENGLISH SVO', pad, 22, {size:9.5, col:MTC.muted});
  R.src.forEach((s,i)=>{
    mtChip(x, srcX(i), yTop, bw, bh, MTC.surf, MTC.line2, null);
    mtTxt(x, s, srcX(i)+bw/2, yTop+bh/2, {size:10.5, col:MTC.text, align:'center'});
  });
  // target row: tile j holds source word map[j]
  mtTxt(x, R.lab.toUpperCase(), pad, yBot+bh+22, {size:9.5, col:MTC.muted});
  let cross = 0;
  for(let a=0;a<n;a++) for(let b2=a+1;b2<n;b2++){
    const pa = R.map.indexOf(a), pb = R.map.indexOf(b2);
    if(pa > pb) cross++;
  }
  // arcs
  R.map.forEach((srcI, j)=>{
    const x1 = srcX(srcI)+bw/2, y1 = yTop+bh;
    const startX = srcX(srcI)+bw/2, endX = srcX(j)+bw/2;
    const x2 = mtLerp(startX, endX, e), y2 = yBot;
    const crossed = R.map.indexOf(srcI) !== srcI;
    x.save();
    x.strokeStyle = crossed ? 'rgba(159,18,57,0.55)' : 'rgba(79,70,229,0.45)';
    x.lineWidth = 1.8;
    x.beginPath(); x.moveTo(x1, y1);
    x.bezierCurveTo(x1, y1+34, x2, y2-34, x2, y2);
    x.stroke(); x.restore();
  });
  R.map.forEach((srcI, j)=>{
    const from = srcX(srcI), to = srcX(j), px = mtLerp(from, to, e);
    mtChip(x, px, yBot, bw, bh, R.map.indexOf(srcI)!==srcI ? 'rgba(159,18,57,0.12)' : MTC.surf, MTC.line2, null);
    mtTxt(x, R.tgt[j], px+bw/2, yBot+bh/2, {size:10.5, col:MTC.text, align:'center'});
  });
  mtTxt(x, 'scramble score  ' + cross + (cross===1?' crossing':' crossings'), w-8, 22,
        {size:11, col: cross>2?MTC.a2:MTC.a1, align:'right', weight:'700'});
  mtSet('reo-cap', R.note);
}

/* ── Adposition side ──────────────────────────────────────── */
const ADP = [
  {k:'en', lab:'English \u00b7 VO', order:'verb \u2192 object', pre:true,
   ph:[['to','ADP'],['a friend','NOUN']], gloss:'preposition before the noun'},
  {k:'ja', lab:'Japanese \u00b7 OV', order:'object \u2192 verb', pre:false,
   ph:[['tomodachi','NOUN'],['ni','ADP']], gloss:'postposition after the noun'},
  {k:'tr', lab:'Turkish \u00b7 OV', order:'object \u2192 verb', pre:false,
   ph:[['ev','NOUN'],['-de','ADP']], gloss:'postposition, written as a suffix'},
  {k:'es', lab:'Spanish \u00b7 VO', order:'verb \u2192 object', pre:true,
   ph:[['a','ADP'],['un amigo','NOUN']], gloss:'preposition before the noun'}
];
let _adp = 0;
function adpBuild(){
  const b = document.getElementById('adp-btns');
  if(b) b.innerHTML = ADP.map((a,i)=>`<button style="${MTBTN}" id="adp-b${i}" onclick="adpGo(${i})">${a.lab}</button>`).join('');
  _adp = 0; adpDraw();
}
function adpGo(i){ _adp = i; adpDraw(); }
function adpDraw(){
  const c = mtCtx('adp-canvas', 170); if(!c) return;
  const {x, w, h} = c;
  const A = ADP[_adp];
  ADP.forEach((_,i)=>{ const e=document.getElementById('adp-b'+i); if(e){
    e.style.background = i===_adp ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_adp ? '#FAFBFF' : 'var(--muted)'; } });

  mtTxt(x, 'VERB / OBJECT ORDER', 22, 24, {size:9.5, col:MTC.muted});
  const vo = A.pre;
  const cw = 108, cy = 40, gap = 12;
  const seq = vo ? [['verb', MTC.a1], ['object', MTC.surf2]] : [['object', MTC.surf2], ['verb', MTC.a1]];
  seq.forEach((s,i)=>{
    const px = 22 + i*(cw+gap);
    mtChip(x, px, cy, cw, 30, s[1]===MTC.a1 ? 'rgba(79,70,229,0.14)' : MTC.surf, MTC.line2, null);
    mtTxt(x, s[0], px+cw/2, cy+15, {size:10.5, col:MTC.text, align:'center'});
  });
  x.strokeStyle = MTC.line; x.lineWidth = 1; x.setLineDash([4,4]);
  x.beginPath(); x.moveTo(22, cy+48); x.lineTo(w-22, cy+48); x.stroke(); x.setLineDash([]);

  mtTxt(x, 'ADPOSITION SIDE', 22, cy+70, {size:9.5, col:MTC.muted});
  let px = 22;
  A.ph.forEach(p=>{
    const tw = Math.max(72, p[0].length*9 + 26);
    const isAdp = p[1]==='ADP';
    mtChip(x, px, cy+82, tw, 32, isAdp ? 'rgba(159,18,57,0.14)' : MTC.surf, isAdp ? MTC.a2 : MTC.line2, null);
    mtTxt(x, p[0], px+tw/2, cy+95, {size:11, col:MTC.text, align:'center'});
    mtTxt(x, p[1], px+tw/2, cy+124, {size:8.5, col:isAdp?MTC.a2:MTC.muted, align:'center'});
    px += tw + 10;
  });
  mtTxt(x, A.pre ? 'PREPOSITION' : 'POSTPOSITION', w-8, cy+95, {size:11, col:MTC.a2, align:'right', weight:'700'});
  mtSet('adp-cap', A.order + ' &nbsp;&middot;&nbsp; ' + A.gloss + '. The two properties move together: verb-before-object goes with adposition-before-noun, and the reverse holds too.');
}

/* ══ 12.1.2 LEXICAL DIVERGENCE ════════════════════════════ */
MT_PAGES.mtlex = `
<div class="lesson-chapter-label">Section 12.1.2</div>
<h1 class="lesson-h1">When One Word Splits Into Several</h1>
<p class="lesson-intro">A dictionary suggests that words in two languages pair off. They do not. Each language divides the space of possible meanings into words in its own way, and the divisions do not line up. This is why a translation system cannot simply look words up, and why the correct target word often depends on information the source sentence never states.</p>

<h2 class="lesson-h2">The Same Space, Cut Differently</h2>
<p class="lesson-p">Consider the region of meaning that English covers with <em>wear</em>. You wear a coat, trousers, shoes, a hat, glasses, and a ring, and the verb never changes. Japanese has no word for that region. It uses <em>kiru</em> for garments put on the upper body, <em>haku</em> for anything worn below the waist including shoes, <em>kaburu</em> for what goes over the head, <em>kakeru</em> for glasses, and <em>hameru</em> for what slips onto a hand or finger. Spanish, like English, gets by with a single verb, <em>llevar</em>. Neither language is more precise in general; they simply drew the boundaries in different places.</p>
<p class="lesson-p">In the display below, each dot is a specific sense. The translucent shapes are word boundaries. Switch languages and watch the same dots get regrouped.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Concept Carving</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="carv-btns"></div>
    <canvas id="carv-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="carv-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Gaps and Many-to-Many Mappings</h2>
<p class="lesson-p">Sometimes a sense falls outside every word boundary in the target language, which is a <strong>lexical gap</strong>. Mandarin <em>xi&agrave;o</em> covers a form of respect and duty toward one&rsquo;s parents that English has no single word for; the usual rendering is the three-word phrase <em>filial piety</em>, which is a paraphrase rather than a translation. Japanese <em>komorebi</em>, sunlight filtered through leaves, is another. In the tool above, turn on <strong>gap mode</strong> to see a dot sitting under no target shape at all.</p>
<p class="lesson-p">The mapping also runs both ways at once. Add a third language and a single English word may correspond to several words in one language while several English words collapse into one word in another. The counter in the tool reports how many target words each source word touches. Once that number is above one, the choice cannot be made from the word alone: it requires context, which is exactly what the models in the rest of this chapter provide.</p>

<div class="quiz-block" id="qmt-lex"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">English <em>wear</em> maps onto five different Japanese verbs. What does a translation system need in order to choose correctly?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-lex','Correct. The choice depends on what is being worn, which is information in the surrounding sentence rather than in the verb itself.')">The surrounding context, since the word alone does not determine the sense</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-lex','A larger dictionary lists all five options but does not say which one applies here.')">A larger bilingual dictionary</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-lex','Frequency picks the most common sense, which is wrong whenever the sentence means one of the others.')">The most frequent Japanese translation</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-lex','Neither language is more precise overall; they divide the space differently.')">Nothing, since Japanese is simply more precise</button>
</div><div class="quiz-explain" id="qmt-lex-explain"></div></div>`;

/* ── Concept Carving ──────────────────────────────────────── */
const CARV_S = [
  {id:0, lab:'a coat',           x:.18, y:.26},
  {id:1, lab:'trousers',         x:.16, y:.62},
  {id:2, lab:'shoes',            x:.44, y:.20},
  {id:3, lab:'a hat',            x:.46, y:.58},
  {id:4, lab:'glasses',          x:.70, y:.30},
  {id:5, lab:'a ring',           x:.78, y:.72},
  {id:6, lab:'respect for parents', x:.30, y:.88, gap:true}
];
const CARV_L = {
  English:  [{w:'wear', s:[0,1,2,3,4,5], c:'#4F46E5'}],
  Japanese: [{w:'kiru', s:[0], c:'#4F46E5'}, {w:'haku', s:[1,2], c:'#0B8457'}, {w:'kaburu', s:[3], c:'#B45309'}, {w:'kakeru', s:[4], c:'#9F1239'}, {w:'hameru', s:[5], c:'#5B4B8A'}],
  Spanish:  [{w:'llevar', s:[0,1,2,3,4,5], c:'#4F46E5'}]
};
let _carv = {lang:'English', gap:false, hot:null};

function carvBuild(){
  const b = document.getElementById('carv-btns');
  if(b) b.innerHTML = '<span style="'+MTLBL+'">word boundaries of</span>' +
    Object.keys(CARV_L).map(k=>`<button style="${MTBTN}" id="carv-b-${k}" onclick="carvGo('${k}')">${k}</button>`).join('') +
    `<button style="${MTBTN}" id="carv-gap" onclick="carvGap()">gap mode</button>`;
  const cv = document.getElementById('carv-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('mousemove', e=>{
      const r = cv.getBoundingClientRect();
      const mx = e.clientX-r.left, my = e.clientY-r.top;
      let hit = null;
      CARV_S.forEach(s=>{ const p = carvPt(s, r.width); if(Math.hypot(mx-p.x, my-p.y) < 16) hit = s.id; });
      if(hit !== _carv.hot){ _carv.hot = hit; carvDraw(); }
    });
    cv.addEventListener('mouseleave', ()=>{ _carv.hot = null; carvDraw(); });
  }
  _carv.lang = 'English'; _carv.gap = false; carvDraw();
}
function carvPt(s, w){ const pad=64; return {x: pad + s.x*(w-pad*2), y: 46 + s.y*168}; }
function carvGo(k){ _carv.lang = k; carvDraw(); }
function carvGap(){ _carv.gap = !_carv.gap; carvDraw(); }
function carvDraw(){
  const c = mtCtx('carv-canvas', 268); if(!c) return;
  const {x, w, h} = c;
  Object.keys(CARV_L).forEach(k=>{ const e = document.getElementById('carv-b-'+k); if(e){
    e.style.background = k===_carv.lang ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = k===_carv.lang ? '#FAFBFF' : 'var(--muted)'; } });
  const g = document.getElementById('carv-gap');
  if(g){ g.style.background = _carv.gap ? 'var(--accent2)' : 'var(--surface2)';
         g.style.color = _carv.gap ? '#FAFBFF' : 'var(--muted)'; }

  const senses = CARV_S.filter(s=>!s.gap || _carv.gap);
  const words = CARV_L[_carv.lang];

  // blobs
  words.forEach(word=>{
    const pts = word.s.map(i=>carvPt(CARV_S[i], w)).filter(Boolean);
    if(!pts.length) return;
    x.save();
    x.beginPath();
    if(pts.length === 1){ x.arc(pts[0].x, pts[0].y, 40, 0, 7); }
    else {
      const cx = pts.reduce((a,p)=>a+p.x,0)/pts.length, cy = pts.reduce((a,p)=>a+p.y,0)/pts.length;
      const sorted = pts.slice().sort((a,b)=>Math.atan2(a.y-cy,a.x-cx)-Math.atan2(b.y-cy,b.x-cx));
      sorted.forEach((p,i)=>{
        const ex = cx + (p.x-cx)*1.45, ey = cy + (p.y-cy)*1.45;
        i ? x.lineTo(ex, ey) : x.moveTo(ex, ey);
      });
      x.closePath();
    }
    x.fillStyle = word.c + '22'; x.fill();
    x.strokeStyle = word.c + '99'; x.lineWidth = 1.6; x.setLineDash([6,4]); x.stroke();
    x.restore();
    const anchor = pts.reduce((a,p)=>({x:a.x+p.x/pts.length, y:a.y+p.y/pts.length}), {x:0,y:0});
    mtTxt(x, word.w, anchor.x, anchor.y - 46, {size:10.5, col:word.c, align:'center', weight:'700'});
  });

  // sense dots
  senses.forEach(s=>{
    const p = carvPt(s, w);
    const covered = words.some(word=>word.s.includes(s.id));
    x.beginPath(); x.arc(p.x, p.y, _carv.hot===s.id ? 7.5 : 5.5, 0, 7);
    x.fillStyle = covered ? MTC.text : MTC.a2; x.fill();
    if(!covered){ x.beginPath(); x.arc(p.x, p.y, 12, 0, 7); x.strokeStyle = MTC.a2; x.lineWidth = 1.5; x.setLineDash([3,3]); x.stroke(); x.setLineDash([]); }
    if(_carv.hot===s.id || !covered)
      mtTxt(x, s.lab, p.x, p.y + 20, {size:9.5, col: covered?MTC.text:MTC.a2, align:'center'});
  });

  mtTxt(x, 'THE SPACE OF SENSES', 12, 20, {size:9.5, col:MTC.muted});
  let many = 0;
  CARV_S.forEach(s=>{ if(s.gap && !_carv.gap) return;
    const n = words.filter(word=>word.s.includes(s.id)).length; if(n>1) many++; });
  const uncovered = senses.filter(s=>!words.some(word=>word.s.includes(s.id))).length;
  mtTxt(x, words.length + ' words cover ' + (senses.length-uncovered) + ' of ' + senses.length + ' senses',
        w-8, 20, {size:10.5, col: uncovered?MTC.a2:MTC.a1, align:'right'});

  mtSet('carv-cap', uncovered
    ? `<b style="color:var(--accent2)">Lexical gap.</b> One sense sits under no word boundary at all. ${_carv.lang} has to reach for a phrase instead of a word, and the translation becomes a paraphrase.`
    : `${_carv.lang} divides this region into ${words.length} words. Switch languages and the dots regroup: the senses stay fixed, the boundaries move. A word-for-word lookup between two of these partitions cannot be correct in general.`);
}

/* ══ 12.1.3 MORPHOLOGY ═══════════════════════════════════ */
MT_PAGES.mtmorph = `
<div class="lesson-chapter-label">Section 12.1.3</div>
<h1 class="lesson-h1">How Many Pieces Fit Inside a Word</h1>
<p class="lesson-intro">Languages differ in how much grammar they pack inside a single word. Vietnamese words are typically one morpheme each, so grammar lives in separate words and word order. Siberian Yupik can express what English needs a full sentence for inside one long word. This axis matters for translation because it decides how much information a single token carries, and therefore how badly a word-level vocabulary fails.</p>

<h2 class="lesson-h2">Two Independent Questions</h2>
<p class="lesson-p">The first question is <strong>how many</strong> morphemes fit in a word. Languages at the low end are called <strong>isolating</strong>; at the high end, <strong>polysynthetic</strong>.</p>
<p class="lesson-p">The second question is separate and often confused with the first: <strong>how cleanly</strong> those morphemes come apart. In an <strong>agglutinative</strong> language such as Turkish, each morpheme is a distinct piece with one job, and a long word can be cut at visible seams. In a <strong>fusional</strong> language such as Russian, a single suffix carries several grammatical categories at once and cannot be split further.</p>
<p class="lesson-p">The demonstration below places languages on both axes. Click a point and a real word drops onto the bench and breaks apart, or resists breaking.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Morpheme Bench</span></div>
  <div class="viz-body">
    <canvas id="mrf-map" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div style="display:flex;gap:8px;margin:.9rem 0 .6rem;align-items:center">
      <button style="${MTBTNA}" onclick="mrfBreak()">break the word apart</button>
      <span id="mrf-name" style="${MTLBL}"></span>
    </div>
    <canvas id="mrf-bench" data-w="660" style="width:100%;display:block"></canvas>
    <div id="mrf-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Why This Breaks Word-Level Vocabularies</h2>
<p class="lesson-p">Turkish combines suffixes productively, so the number of distinct word forms is effectively unbounded: a vocabulary built from whole words will always meet forms it has never seen. Russian is worse in a different way. The word <em>stolom</em> is <em>stol</em> plus <em>-om</em>, and that one suffix carries instrumental case, singular number, and first-declension class simultaneously. There is no way to cut it into three pieces, so even a morpheme-aware system cannot isolate the individual features.</p>
<p class="lesson-p">Both problems point the same direction. If whole words are the unit, the vocabulary is too large and still incomplete. The fix is to stop using words as the unit, which is what the next section on subword tokenization does.</p>

<div class="quiz-block" id="qmt-mrf"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Russian <em>-om</em> marks instrumental case, singular number, and declension class at once. What is that an example of?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-mrf','Correct. Fusion means one affix conflates several grammatical categories that cannot be separated into distinct pieces.')">Fusion, where one affix conflates several categories</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-mrf','Agglutination means clean, separable boundaries with one morpheme per category, which is the opposite case.')">Agglutination, since several categories are present</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-mrf','Isolating languages use roughly one morpheme per word and put grammar in separate words.')">An isolating structure</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-mrf','Polysynthesis is about how many morphemes fit in a word, not about whether they separate cleanly.')">Polysynthesis</button>
</div><div class="quiz-explain" id="qmt-mrf-explain"></div></div>`;

/* ── Morpheme Bench ───────────────────────────────────────── */
const MRF = [
  {k:'vi', lab:'Vietnamese', mx:.04, sep:.95, word:'t\u00F4i \u0111i',
   parts:[{t:'t\u00F4i',g:'I'},{t:'\u0111i',g:'go'}], fuse:false,
   note:'One morpheme per word. Grammar is carried by separate words and by order, so nothing has to be split at all.'},
  {k:'en', lab:'English', mx:.20, sep:.72, word:'unhappiness',
   parts:[{t:'un',g:'NEG'},{t:'happy',g:'ROOT'},{t:'ness',g:'NOUN'}], fuse:false,
   note:'English is mildly synthetic. Derivational affixes come apart cleanly, but inflection is sparse.'},
  {k:'ru', lab:'Russian', mx:.42, sep:.16, word:'stolom',
   parts:[{t:'stol',g:'table'},{t:'om',g:'INSTR \u00b7 SG \u00b7 DECL-1', fuse:true}], fuse:true,
   note:'Fusional. Pull at the suffix and it stays whole: instrumental case, singular number and declension class are conflated in two letters that cannot be cut apart.'},
  {k:'tr', lab:'Turkish', mx:.62, sep:.96, word:'evlerimizden',
   parts:[{t:'ev',g:'house'},{t:'ler',g:'PL'},{t:'imiz',g:'our'},{t:'den',g:'ABL'}], fuse:false,
   note:'Agglutinative. Each suffix does exactly one job and snaps off at a clean seam, so a long word decomposes without ambiguity.'},
  {k:'fi', lab:'Finnish', mx:.55, sep:.80, word:'taloissani',
   parts:[{t:'talo',g:'house'},{t:'i',g:'PL'},{t:'ssa',g:'INESS'},{t:'ni',g:'my'}], fuse:false,
   note:'Also agglutinative, with a long chain of case and possessive suffixes on a single stem.'},
  {k:'yu', lab:'Siberian Yupik', mx:.95, sep:.62, word:'angyaghllangyugtuq',
   parts:[{t:'angyagh',g:'boat'},{t:'llang',g:'big'},{t:'yug',g:'want'},{t:'tuq',g:'3SG'}], fuse:false,
   note:'Polysynthetic. A single word carries what English needs a full clause for: he wants to acquire a big boat.'}
];
let _mrf = {i:3, broke:false, t:0, raf:null};

function mrfBuild(){
  const cv = document.getElementById('mrf-map');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('click', e=>{
      const r = cv.getBoundingClientRect();
      const mx = e.clientX-r.left, my = e.clientY-r.top;
      MRF.forEach((m,i)=>{ const p = mrfPt(m, r.width);
        if(Math.hypot(mx-p.x, my-p.y) < 18){ _mrf.i = i; _mrf.broke = false; _mrf.t = 0; mrfDraw(); } });
    });
  }
  _mrf.i = 3; _mrf.broke = false; _mrf.t = 0; mrfDraw();
}
function mrfPt(m, w){ const pad = 74; return {x: pad + m.mx*(w-pad*2-30), y: 40 + (1-m.sep)*140}; }
function mrfBreak(){
  _mrf.broke = true; _mrf.t = 0;
  if(_mrf.raf) cancelAnimationFrame(_mrf.raf);
  const t0 = Date.now();
  const step = ()=>{ _mrf.t = Math.min(1, (Date.now()-t0)/650); mrfDraw();
    if(_mrf.t < 1) _mrf.raf = requestAnimationFrame(step); };
  step();
}
function mrfDraw(){
  const c1 = mtCtx('mrf-map', 214);
  if(c1){
    const {x, w} = c1;
    // axes
    x.strokeStyle = MTC.line2; x.lineWidth = 1;
    x.beginPath(); x.moveTo(60, 182); x.lineTo(w-20, 182); x.stroke();
    x.beginPath(); x.moveTo(60, 182); x.lineTo(60, 30); x.stroke();
    mtTxt(x, 'morphemes per word \u2192', w-20, 198, {size:9.5, col:MTC.muted, align:'right'});
    mtTxt(x, 'isolating', 62, 198, {size:9, col:MTC.muted});
    x.save(); x.translate(16, 108); x.rotate(-Math.PI/2);
    mtTxt(x, 'separate cleanly \u2192', 0, 0, {size:9.5, col:MTC.muted, align:'center'});
    x.restore();
    mtTxt(x, 'fusional', 54, 176, {size:9, col:MTC.muted, align:'right'});
    mtTxt(x, 'agglutinative', 54, 36, {size:9, col:MTC.muted, align:'right'});
    MRF.forEach((m,i)=>{
      const p = mrfPt(m, w), on = i===_mrf.i;
      x.beginPath(); x.arc(p.x, p.y, on?8:5.5, 0, 7);
      x.fillStyle = on ? MTC.a1 : (m.fuse ? MTC.a2 : MTC.muted); x.fill();
      if(on){ x.beginPath(); x.arc(p.x, p.y, 14, 0, 7); x.strokeStyle = MTC.a1; x.lineWidth=1.4; x.stroke(); }
      mtTxt(x, m.lab, p.x, p.y - (on?22:15), {size: on?10.5:9.5, col: on?MTC.a1:MTC.muted, align:'center', weight: on?'700':''});
    });
  }
  const M = MRF[_mrf.i];
  mtSet('mrf-name', M.lab.toUpperCase() + ' \u00b7 ' + M.word);
  const c2 = mtCtx('mrf-bench', 132);
  if(c2){
    const {x, w} = c2;
    x.fillStyle = MTC.surf; mtRR(x, 8, 8, w-16, 116, 10); x.fill();
    x.strokeStyle = MTC.line; x.lineWidth = 1; x.stroke();
    const e = mtEase(_mrf.t), n = M.parts.length;
    const widths = M.parts.map(p=>Math.max(56, p.t.length*11 + 22));
    const totalW = widths.reduce((a,b)=>a+b, 0);
    const spread = _mrf.broke ? 14*e : 0;
    let px = (w - totalW - spread*(n-1))/2;
    M.parts.forEach((p,i)=>{
      const pw = widths[i];
      const wob = (_mrf.broke && p.fuse) ? Math.sin(_mrf.t*34)*3*(1-e) : 0;
      const fill = p.fuse ? 'rgba(159,18,57,0.16)' : (i%2 ? 'rgba(79,70,229,0.10)' : 'rgba(11,132,87,0.10)');
      const strk = p.fuse ? MTC.a2 : MTC.line2;
      mtChip(x, px+wob, 30, pw, 40, fill, strk, null);
      mtTxt(x, p.t, px+wob+pw/2, 50, {size:12.5, col:MTC.text, align:'center', weight:'700'});
      const gl = p.g.split(' \u00b7 ');
      gl.forEach((gg,k)=> mtTxt(x, gg, px+wob+pw/2, 84 + k*13, {size:8.5, col: p.fuse?MTC.a2:MTC.muted, align:'center'}));
      if(_mrf.broke && i<n-1 && !M.fuse){
        x.strokeStyle = MTC.a4; x.lineWidth = 1; x.setLineDash([2,3]);
        x.beginPath(); x.moveTo(px+pw+spread/2, 26); x.lineTo(px+pw+spread/2, 74); x.stroke(); x.setLineDash([]);
      }
      px += pw + spread;
    });
    if(_mrf.broke && M.fuse)
      mtTxt(x, 'resists \u2014 cannot be cut further', w-16, 20, {size:9.5, col:MTC.a2, align:'right'});
  }
  mtSet('mrf-cap', M.note);
}

/* ══ 12.1.4 REFERENTIAL DENSITY ══════════════════════════ */
MT_PAGES.mtdrop = `
<div class="lesson-chapter-label">Section 12.1.4</div>
<h1 class="lesson-h1">What Speakers Leave Out on Purpose</h1>
<p class="lesson-intro">The last axis is about what a language allows a speaker to omit. English requires an explicit subject in almost every clause. Spanish does not, because the verb ending already identifies the subject. Japanese omits far more than that, dropping subjects, objects and possessives whenever the context makes them recoverable. Translating out of a language that omits into one that requires means supplying material that was never written down.</p>

<h2 class="lesson-h2">Pro-Drop and Referential Density</h2>
<p class="lesson-p">Languages that allow the subject pronoun to be dropped are called <strong>pro-drop</strong>. The broader property is <strong>referential density</strong>: what fraction of the entities a sentence is about are actually mentioned in it. Languages that mention most of them are sometimes called <em>cold</em>, because the reader is given the material directly. Languages that mention fewer are called <em>hot</em>, because the reader has to do inference to fill the gaps.</p>
<p class="lesson-p">The reader burden is real and measurable. In the passage below, the empty slots mark places where a pronoun was dropped. Guess each referent before revealing it, and the meter tracks how much work the reading took.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Fill the Gap</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="gap-btns"></div>
    <div id="gap-text" style="background:var(--panel);border-radius:10px;padding:1rem 1.1rem;font-family:var(--mono);font-size:.78rem;line-height:2.4;color:#ECF1FF;min-height:5rem;margin-bottom:.9rem"></div>
    <div id="gap-opts" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:.9rem"></div>
    <canvas id="gap-meter" data-w="660" style="width:100%;display:block"></canvas>
    <div id="gap-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">What the System Faces</h2>
<p class="lesson-p">A translation system working sentence by sentence sees only one sentence at a time, so the referent it needs is often in a previous sentence it was never given. Faced with a dropped subject and no discourse context, it has to guess, and its guess comes from whatever is most frequent in the training data rather than from the actual antecedent. This is one of the clearest cases where sentence-level translation is structurally insufficient, and it is the same gap that produces the gender-assignment behaviour in the section on bias.</p>

<div class="quiz-block" id="qmt-drop"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is translating from a pro-drop language into English harder than the reverse?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-drop','Correct. The target requires a pronoun the source never wrote, so the system has to recover a referent from context it may not have.')">The target requires material the source omitted, which must be recovered from context</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-drop','Dropping material is straightforward; recovering it is the hard direction.')">Dropping a pronoun is harder than inserting one</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-drop','Vocabulary size is a separate axis and is not what makes this direction hard.')">Pro-drop languages have larger vocabularies</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-drop','Both directions involve the same pair; the asymmetry is about which side omits.')">The two directions are equally hard in practice</button>
</div><div class="quiz-explain" id="qmt-drop-explain"></div></div>`;

/* ── Fill the Gap ─────────────────────────────────────────── */
const GAP = {
  Spanish: {burden:.5, toks:[
    {t:'Mar\u00EDa lleg\u00F3 tarde a la reuni\u00F3n.'},
    {t:'\u2205', slot:'she (Mar\u00eda)', opts:['she (Mar\u00eda)','he (the chair)','they'], note:'Spanish drops the subject; the verb ending carries person and number.'},
    {t:'Se disculp\u00F3 y'},
    {t:'\u2205', slot:'she (Mar\u00eda)', opts:['she (Mar\u00eda)','the meeting','someone else'], note:'The second clause drops it again, still referring to Mar\u00eda.'},
    {t:'se sent\u00F3.'}
  ], en:'Maria arrived late to the meeting. She apologised and she sat down.'},
  Japanese: {burden:1, toks:[
    {t:'\u2205', slot:'I', opts:['I','she','the teacher'], note:'Japanese drops the subject with no verb agreement to recover it from. Only context decides.'},
    {t:'ky\u014D'},
    {t:'\u2205', slot:'the report', opts:['the report','the room','a letter'], note:'The object is dropped too, which Spanish would not do.'},
    {t:'yomimashita.'},
    {t:'Totemo'},
    {t:'\u2205', slot:'it (the report)', opts:['it (the report)','he','the day'], note:'A third omission, now referring back two clauses.'},
    {t:'omoshirokatta desu.'}
  ], en:'I read the report today. It was very interesting.'},
  English: {burden:.05, toks:[
    {t:'Maria arrived late to the meeting. She apologised and she sat down.'}
  ], en:'Every argument is stated. There is nothing to recover.'}
};
let _gap = {lang:'Spanish', at:0, done:[], wrong:0};

function gapBuild(){
  const b = document.getElementById('gap-btns');
  if(b) b.innerHTML = '<span style="'+MTLBL+'">source language</span>' +
    Object.keys(GAP).map(k=>`<button style="${MTBTN}" id="gap-b-${k}" onclick="gapGo('${k}')">${k}</button>`).join('');
  gapGo('Spanish');
}
function gapGo(k){ _gap.lang = k; _gap.at = 0; _gap.done = []; _gap.wrong = 0; gapRender(); }
function gapPick(i){
  const G = GAP[_gap.lang], slots = G.toks.filter(t=>t.slot);
  const cur = slots[_gap.at];
  if(!cur) return;
  if(cur.opts[i] !== cur.slot) _gap.wrong++;
  _gap.done.push({txt:cur.opts[i], ok:cur.opts[i]===cur.slot, note:cur.note});
  _gap.at++;
  gapRender();
}
function gapRender(){
  const G = GAP[_gap.lang];
  Object.keys(GAP).forEach(k=>{ const e = document.getElementById('gap-b-'+k); if(e){
    e.style.background = k===_gap.lang ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = k===_gap.lang ? '#FAFBFF' : 'var(--muted)'; } });
  let si = 0;
  const html = G.toks.map(t=>{
    if(!t.slot) return `<span>${t.t}</span>`;
    const idx = si++;
    if(idx < _gap.done.length){
      const d = _gap.done[idx];
      return `<span style="color:${d.ok?'#7FD4B0':'#E2879E'};border-bottom:1px solid ${d.ok?'#7FD4B0':'#E2879E'}">${d.txt}</span>`;
    }
    if(idx === _gap.at) return `<span style="background:rgba(159,18,57,.4);border-radius:4px;padding:1px 10px;color:#F3D6DE">?</span>`;
    return `<span style="opacity:.45">\u2205</span>`;
  }).join(' ');
  mtSet('gap-text', html);
  const slots = G.toks.filter(t=>t.slot);
  const cur = slots[_gap.at];
  mtSet('gap-opts', cur
    ? `<span style="${MTLBL}">who or what is missing here?</span>` + cur.opts.map((o,i)=>
        `<button style="${MTBTN}" onclick="gapPick(${i})">${o}</button>`).join('')
    : (slots.length ? `<button style="${MTBTN}" onclick="gapGo('${_gap.lang}')">reset</button>` : ''));
  gapMeter();
  const last = _gap.done[_gap.done.length-1];
  mtSet('gap-cap', slots.length===0
    ? 'English states every argument explicitly, so there are no slots to fill and the inference burden is close to zero.'
    : (last ? last.note + (_gap.at>=slots.length ? ` <br><b style="color:var(--accent)">English needs:</b> ${G.en}` : '')
            : `${slots.length} referents were omitted in this passage. Guess each one before moving on.`));
}
function gapMeter(){
  const c = mtCtx('gap-meter', 74); if(!c) return;
  const {x, w} = c;
  const G = GAP[_gap.lang], slots = G.toks.filter(t=>t.slot).length;
  const filled = slots ? _gap.done.length/slots : 0;
  const level = G.burden * (slots ? mtLerp(.35, 1, filled) : 1);
  mtTxt(x, 'INFERENCE BURDEN', 4, 14, {size:9.5, col:MTC.muted});
  const bw = w-8, bh = 18, by = 26;
  mtRR(x, 4, by, bw, bh, 9); x.fillStyle = MTC.surf2; x.fill();
  const grad = x.createLinearGradient(4, 0, 4+bw, 0);
  grad.addColorStop(0, MTC.a1); grad.addColorStop(.55, MTC.a5); grad.addColorStop(1, MTC.a2);
  mtRR(x, 4, by, Math.max(10, bw*level), bh, 9); x.fillStyle = grad; x.fill();
  mtTxt(x, 'cold \u00b7 says everything', 6, by+bh+16, {size:8.5, col:MTC.muted});
  mtTxt(x, 'hot \u00b7 omits freely', w-6, by+bh+16, {size:8.5, col:MTC.muted, align:'right'});
  mtTxt(x, slots ? _gap.done.length + ' / ' + slots + ' recovered' : 'no gaps',
        w-6, 14, {size:9.5, col:MTC.a1, align:'right'});
}

/* ══ 12.2 THE ENCODER-DECODER ═════════════════════════════ */
MT_PAGES.mtenc = `
<div class="lesson-chapter-label">Section 12.2</div>
<h1 class="lesson-h1">Mapping a Whole Sentence Onto a Whole Sentence</h1>
<p class="lesson-intro">The information needed for a target word may appear much later in the source sentence. An encoder-decoder model represents the source before generating the target, giving the decoder access to that wider context. Simultaneous translation uses additional strategies to work with partial input.</p>

<h2 class="lesson-h2">Two Halves and a Handoff</h2>
<p class="lesson-p">The <strong>encoder</strong> reads the source sentence and produces a representation of it. The <strong>decoder</strong> generates the target sentence one token at a time, and at every step it can look at two things: the encoder&rsquo;s representation of the whole source, and the target tokens it has already produced. Nothing else.</p>

<h2 class="lesson-h2">The Objective, Written Out</h2>
<p class="lesson-p">Translation is a conditional probability problem. Given a source sentence \\(x = x_1 \\ldots x_n\\), the system defines a distribution over target sentences \\(y = y_1 \\ldots y_m\\) and outputs the most probable one:</p>
<div class="lesson-math">\\[\\hat{y} = \\arg\\max_{y} \\; P(y \\mid x)\\]</div>
<p class="lesson-p">A distribution over entire sentences is too large to represent directly, so it is factored. By the definition of conditional probability, \\(P(a, b) = P(a)\\,P(b \\mid a)\\), so a two-token sentence satisfies \\(P(y_1, y_2 \\mid x) = P(y_1 \\mid x)\\,P(y_2 \\mid y_1, x)\\). Applying the same step to peel off one token at a time gives the chain rule:</p>
<div class="lesson-math">\\[P(y \\mid x) = \\prod_{t=1}^{m} P\\left(y_t \\mid y_{&lt;t},\\, x\\right)\\]</div>
<p class="lesson-p">Note what is and is not an assumption here. The factorization itself is exact: any distribution over sequences can be written this way, so nothing has been lost yet. The modelling assumption enters afterwards, when a network with finite capacity is asked to represent each factor. Every factor is a next-token distribution conditioned on the source and the target prefix, which is precisely the shape of computation the decoder performs.</p>
<p class="lesson-p">Generation is <strong>autoregressive</strong>, meaning each output token is fed back in as input for the next step. The model produces a distribution over the target vocabulary, a token is selected from it, and that token becomes part of the context for the following prediction. This continues until the model emits an end-of-sequence token.</p>

<p class="lesson-p">The network realizes each factor in two stages. The encoder maps the source tokens to a stack of contextual vectors; at each step the decoder combines that stack with the prefix to produce a hidden state, and a final linear layer plus a softmax turn the hidden state into a distribution over the vocabulary:</p>
<div class="lesson-math">\\[\\mathbf{H}^{enc} = \\text{Enc}(x), \\qquad \\mathbf{z}_t = \\text{Dec}\\left(y_{&lt;t},\\, \\mathbf{H}^{enc}\\right), \\qquad \\hat{\\mathbf{y}}_t = \\text{softmax}\\left(\\mathbf{W}\\,\\mathbf{z}_t + \\mathbf{b}\\right)\\]</div>
<p class="lesson-p">where \\(\\text{softmax}(\\mathbf{u})_v = e^{u_v} / \\sum_{v'} e^{u_{v'}}\\) converts arbitrary real scores into a probability distribution, and \\(\\mathbf{W}\\) has one row per vocabulary item. The probability the model assigns to a particular token \\(w\\) at step \\(t\\) is the entry \\(\\hat{\\mathbf{y}}_t[w]\\), which is the quantity the training loss will inspect.</p>
<p class="lesson-p">Step through it below. The spotlight shows exactly what the decoder can see at the timestep you have scrubbed to.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Bottleneck Walkthrough</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="encStep()">step \u2192</button>
      <button style="${MTBTN}" onclick="encReset()">reset</button>
      <span style="${MTLBL}">timestep</span>
      <input id="enc-t" type="range" min="0" max="5" step="1" value="0" oninput="encScrub(this.value)" style="width:150px;accent-color:var(--accent)">
      <button style="${MTBTN}" id="enc-tf" onclick="encTF()">teacher forcing: on</button>
      <button style="${MTBTN}" id="enc-ml" onclick="encML()">language tokens: off</button>
    </div>
    <canvas id="enc-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="enc-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Teacher Forcing</h2>
<p class="lesson-p">During training there is a choice about what to feed back in. <strong>Teacher forcing</strong> feeds the correct target token from the reference translation, regardless of what the model actually predicted. The alternative feeds the model its own output. Teacher forcing trains faster and more stably, because one early mistake does not corrupt the rest of the sentence. Its cost is a mismatch with inference, where no reference exists and the model must consume its own possibly wrong outputs. Turn the toggle off above and watch a single early error propagate.</p>

<h2 class="lesson-h2">The Bottleneck</h2>
<p class="lesson-p">In the earliest encoder-decoder models the entire source sentence was compressed into one fixed-length vector, and everything the decoder knew about the source had to pass through it. This is the <strong>bottleneck</strong>, and it degrades badly on long sentences: a single vector of a few hundred numbers cannot retain the detail of a forty-word sentence. Attention removes the bottleneck by letting the decoder look back at every source position individually, which is the subject of the section on cross-attention.</p>

<div class="quiz-block" id="qmt-enc"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">At timestep t, what can the decoder see?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-enc','Correct. The full source is available through the encoder, but on the target side only tokens already generated are visible.')">The whole source, plus the target tokens generated so far</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-enc','The decoder sees the whole source, not only the aligned position; that is the point of encoding it first.')">Only the source token at position t</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-enc','Future target tokens do not exist yet at generation time and are masked during training.')">The whole source and the whole target</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-enc','Previous target tokens are exactly what autoregressive generation feeds back in.')">Only the previous target token, not the source</button>
</div><div class="quiz-explain" id="qmt-enc-explain"></div></div>`;

/* ── Bottleneck Walkthrough ───────────────────────────────── */
const ENC_SRC = ['The','red','balloon','burst'];
const ENC_TGT = ['Estall\u00F3','el','globo','rojo','&lt;/s&gt;'];
const ENC_BAD = ['Estall\u00F3','un','globo','viejo','&lt;/s&gt;'];
let _enc = {t:0, tf:true, ml:false};

function encBuild(){ _enc = {t:0, tf:true, ml:false}; encSync(); encDraw(); }
function encStep(){ _enc.t = Math.min(ENC_TGT.length, _enc.t+1); encSync(); encDraw(); }
function encReset(){ _enc.t = 0; encSync(); encDraw(); }
function encScrub(v){ _enc.t = Math.max(0, Math.min(5, Math.round(+v))); encDraw(); }
function encTF(){ _enc.tf = !_enc.tf; encDraw(); }
function encML(){ _enc.ml = !_enc.ml; encDraw(); }
function encSync(){ const s = document.getElementById('enc-t'); if(s) s.value = _enc.t; }
function encDraw(){
  const c = mtCtx('enc-canvas', 330); if(!c) return;
  const {x, w, h} = c;
  const tf = document.getElementById('enc-tf'), ml = document.getElementById('enc-ml');
  if(tf){ tf.textContent = 'teacher forcing: ' + (_enc.tf?'on':'off');
          tf.style.background = _enc.tf?'var(--accent)':'var(--surface2)'; tf.style.color = _enc.tf?'#FAFBFF':'var(--muted)'; }
  if(ml){ ml.textContent = 'language tokens: ' + (_enc.ml?'on':'off');
          ml.style.background = _enc.ml?'var(--accent)':'var(--surface2)'; ml.style.color = _enc.ml?'#FAFBFF':'var(--muted)'; }

  const src = _enc.ml ? ['&lt;2es&gt;'].concat(ENC_SRC) : ENC_SRC.slice();
  const out = _enc.tf ? ENC_TGT : ENC_BAD;
  const pad = 20, bh = 30;
  const sw = Math.min(96, (w-pad*2)/src.length - 6);
  const sx = i => pad + i*(sw+6);

  // ── encoder
  mtTxt(x, 'ENCODER \u00b7 reads everything at once', pad, 18, {size:9.5, col:MTC.muted});
  src.forEach((s,i)=>{
    const isLang = _enc.ml && i===0;
    mtChip(x, sx(i), 28, sw, bh, isLang?'rgba(165,104,14,0.16)':'rgba(79,70,229,0.10)', isLang?MTC.a5:MTC.line2, null);
    mtTxt(x, s.replace('&lt;','<').replace('&gt;','>'), sx(i)+sw/2, 43, {size:10, col:MTC.text, align:'center'});
  });
  const encY = 78, ctxY = 100;
  src.forEach((s,i)=>{
    x.strokeStyle = 'rgba(79,70,229,0.35)'; x.lineWidth = 1.2;
    x.beginPath(); x.moveTo(sx(i)+sw/2, 58); x.lineTo(w/2, ctxY-4); x.stroke();
  });
  // context vector
  const cvW = 172, cvX = w/2 - cvW/2;
  mtChip(x, cvX, ctxY, cvW, 26, 'rgba(79,70,229,0.20)', MTC.a1, null);
  mtTxt(x, 'context  h', cvX+cvW/2, ctxY+13, {size:10.5, col:MTC.a1, align:'center', weight:'700'});
  for(let i=0;i<14;i++){
    const bx = cvX+10+i*11, v = 0.3+0.7*Math.abs(Math.sin(i*1.7+ (_enc.ml?1:0)));
    x.fillStyle = 'rgba(79,70,229,'+(0.25+v*0.5)+')';
    x.fillRect(bx, ctxY+30, 7, 8*v+2);
  }

  // ── decoder
  const dY = 168;
  mtTxt(x, 'DECODER \u00b7 one token at a time', pad, dY-10, {size:9.5, col:MTC.muted});
  const tw = Math.min(98, (w-pad*2)/out.length - 6);
  const tx = i => pad + i*(tw+6);
  out.forEach((o,i)=>{
    const emitted = i < _enc.t;
    const active = i === _enc.t;
    const wrong = !_enc.tf && i===1 && emitted;
    let fill = 'transparent', strk = MTC.line;
    if(emitted) fill = wrong ? 'rgba(159,18,57,0.16)' : 'rgba(11,132,87,0.12)';
    if(active) { fill = 'rgba(165,104,14,0.16)'; strk = MTC.a5; }
    mtChip(x, tx(i), dY, tw, bh, fill, emitted?(wrong?MTC.a2:MTC.a4):strk, null);
    mtTxt(x, emitted||active ? o.replace('&lt;','<').replace('&gt;','>') : '\u00b7',
          tx(i)+tw/2, dY+15, {size:10, col: emitted?MTC.text:MTC.muted, align:'center'});
    if(emitted && i < out.length-1){
      x.strokeStyle = 'rgba(11,132,87,0.45)'; x.lineWidth = 1.2;
      x.beginPath();
      x.moveTo(tx(i)+tw/2, dY+bh);
      x.bezierCurveTo(tx(i)+tw/2, dY+bh+22, tx(i+1)+tw/2, dY+bh+22, tx(i+1)+tw/2, dY+bh+2);
      x.stroke();
      mtTxt(x, '\u21B3 fed back', tx(i)+tw/2+6, dY+bh+30, {size:8, col:MTC.a4});
    }
  });
  // spotlight
  if(_enc.t < out.length){
    x.save();
    x.fillStyle = 'rgba(165,104,14,0.07)';
    mtRR(x, pad-6, 22, w-pad*2+12, 44, 8); x.fill();
    x.fillStyle = 'rgba(165,104,14,0.07)';
    if(_enc.t>0){ mtRR(x, tx(0)-4, dY-4, (tw+6)*_enc.t, bh+8, 8); x.fill(); }
    x.restore();
    x.strokeStyle = MTC.a5; x.lineWidth = 1.4; x.setLineDash([4,4]);
    x.beginPath(); x.moveTo(cvX+cvW/2, ctxY+42); x.lineTo(tx(_enc.t)+tw/2, dY-6); x.stroke();
    x.setLineDash([]);
  }
  mtTxt(x, 't = ' + _enc.t, w-8, dY-10, {size:10.5, col:MTC.a5, align:'right', weight:'700'});

  const seen = out.slice(0, _enc.t).map(o=>o.replace('&lt;','<').replace('&gt;','>')).join(' ') || '(nothing yet)';
  mtSet('enc-cap', _enc.t >= out.length
    ? 'End-of-sequence emitted, so generation stops. ' + (_enc.tf ? '' : '<b style="color:var(--accent2)">Without teacher forcing the wrong second token stayed in the context and the rest of the sentence was generated conditioned on it.</b>')
    : `At t = ${_enc.t} the decoder sees <b>the entire source</b> through h, plus the target tokens already produced: <b>${seen}</b>. It cannot see any target token to the right of the highlight.`);
}

/* ══ 12.2.1 SUBWORD TOKENIZATION ══════════════════════════ */
MT_PAGES.mttok = `
<div class="lesson-chapter-label">Section 12.2.1</div>
<h1 class="lesson-h1">Cutting Text Into Subword Pieces</h1>
<p class="lesson-intro">Subword tokenization represents words as reusable pieces. Frequent words may remain whole, while rarer ones split into familiar fragments. Covering every possible character requires an appropriate base alphabet or byte fallback.</p>

<h2 class="lesson-h2">Three Algorithms, Same Job</h2>
<p class="lesson-p"><strong>BPE</strong> starts from characters and repeatedly merges the most frequent adjacent pair, recording each merge as a rule. At encoding time it replays those merges in the order they were learned. <strong>WordPiece</strong> keeps a vocabulary and matches the longest piece it can at each position, marking continuation pieces with <code>##</code>. <strong>Unigram</strong> works in reverse: it holds a vocabulary with a probability for each piece and picks the segmentation with the highest total probability, which lets it consider several splits and choose the best one rather than committing greedily.</p>
<p class="lesson-p">Type into the box and watch the three disagree.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Tokenizer Bake-off</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <input id="tok-in" value="Completely preposterous suggestions" oninput="tokDraw()" style="flex:1;min-width:220px;background:var(--surface);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .7rem;font-family:var(--mono);font-size:.74rem">
    </div>
    <div style="${MTROW}">
      <button style="${MTBTN}" onclick="tokSet('corrupted')">corrupted</button>
      <button style="${MTBTN}" onclick="tokSet('Completely preposterous suggestions')">preposterous</button>
      <button style="${MTBTN}" onclick="tokSet('unhappiness evlerimizden')">morphology</button>
      <span style="${MTLBL}">vocabulary size</span>
      <input id="tok-v" type="range" min="0" max="3" step="1" value="3" oninput="tokDraw()" style="width:130px;accent-color:var(--accent)">
      <span id="tok-vl" style="${MTLBL}"></span>
    </div>
    <canvas id="tok-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tok-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Where the Splits Matter</h2>
<p class="lesson-p">The differences are not cosmetic. BPE merges by raw frequency, so it can cut straight through a morpheme boundary: <em>corrupted</em> may come out as <em>cor</em> + <em>rupted</em>, which severs the root from the past-tense suffix. Unigram, choosing the highest-probability segmentation rather than a greedy one, is more likely to produce <em>corrupt</em> + <em>ed</em>. A split that respects morphology gives the model pieces whose meaning is stable across words, and there is evidence that this helps downstream.</p>
<p class="lesson-p">Translation systems normally learn <strong>one shared vocabulary</strong> over both languages. This has a useful consequence: a proper name, a number, or a technical term that appears in both languages gets the same token on both sides and can be copied straight across. It also means a language with no spaces, such as Chinese, is handled by the same machinery, since the algorithm never depended on whitespace in the first place.</p>

<div class="quiz-block" id="qmt-tok"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can a subword tokenizer never produce an unknown token?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-tok','Correct. Individual characters are in the vocabulary, so in the worst case any string is spelled out one character at a time.')">Single characters are in the vocabulary, so any string can be spelled out</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-tok','No vocabulary contains every word; that is the problem subwords solve.')">The vocabulary contains every word in the language</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-tok','Unknown pieces are not added at inference; the vocabulary is frozen after training.')">New pieces are added whenever an unknown word appears</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-tok','Unknown tokens are avoided entirely rather than mapped to a placeholder.')">Unknown words are mapped to a special placeholder token</button>
</div><div class="quiz-explain" id="qmt-tok-explain"></div></div>`;

/* ── Tokenizer bake-off ───────────────────────────────────── */
const TOK_MERGES = [['e','d'],['i','n'],['t','h'],['e','r'],['o','n'],['r','e'],['a','n'],['t','i'],['e','s'],['o','r'],
  ['s','t'],['c','o'],['s','u'],['p','r'],['l','y'],['n','g'],['u','s'],['co','r'],['cor','r'],['ru','p'],
  ['corr','up'],['corrup','ted'],['pr','e'],['pre','pos'],['ter','ous'],['sugg','est'],['ion','s'],['ment','s'],
  ['un','h'],['happ','y'],['ness',''],['ev','ler'],['imiz','den']];
const TOK_VOCAB = ['completely','complete','preposterous','posterous','suggestions','suggestion','suggest','corrupted','corrupt',
  'unhappiness','happiness','happy','evlerimizden','ever','ness','ment','tion','sion','ing','ous','ted','est','ely','ly','ed','er','es','en','al','ic','un','re','de','pre','post','cor','rupt','pos','ter','ions','gest','sug','com','plete','im','iz','den','ler','ev'];
function tokSet(s){ const e = document.getElementById('tok-in'); if(e){ e.value = s; tokDraw(); } }
function tokCap(n){ return [900, 3000, 12000, 32000][n]; }
function tokKeep(piece, n){
  const cap = [3, 4, 6, 99][n];
  return piece.length <= cap;
}
function tokBPE(word, n){
  let sym = word.split('');
  for(const [a,b] of TOK_MERGES){
    if(!b) continue;
    if(!tokKeep(a+b, n)) continue;
    let i = 0;
    while(i < sym.length-1){
      if(sym[i]===a && sym[i+1]===b){ sym.splice(i, 2, a+b); } else i++;
    }
  }
  return sym;
}
function tokWordPiece(word, n){
  const out = []; let i = 0;
  const vocab = TOK_VOCAB.filter(v=>tokKeep(v, n));
  while(i < word.length){
    let hit = null;
    for(let j = word.length; j > i; j--){
      const p = word.slice(i, j);
      if(vocab.includes(p) && (i===0 || p.length>1)){ hit = p; break; }
    }
    if(!hit){ hit = word[i]; }
    out.push(i===0 ? hit : '##'+hit);
    i += hit.length;
  }
  return out;
}
function tokUnigram(word, n){
  const vocab = TOK_VOCAB.filter(v=>tokKeep(v, n));
  const cost = p => vocab.includes(p) ? -Math.log((p.length*p.length+4)/900) : 14;
  const N = word.length;
  const best = new Array(N+1).fill(1e9), back = new Array(N+1).fill(0);
  best[0] = 0;
  for(let i=1;i<=N;i++) for(let j=Math.max(0,i-13);j<i;j++){
    const c = best[j] + cost(word.slice(j,i));
    if(c < best[i]){ best[i] = c; back[i] = j; }
  }
  const out = []; let i = N;
  while(i>0){ out.unshift(word.slice(back[i], i)); i = back[i]; }
  return out;
}
function tokDraw(){
  const inp = document.getElementById('tok-in');
  const vs = document.getElementById('tok-v');
  if(!inp) return;
  const n = Math.max(0, Math.min(3, vs ? Math.round(+vs.value) : 3));
  mtSet('tok-vl', tokCap(n).toLocaleString() + ' pieces');
  const words = (inp.value || '').toLowerCase().split(/\s+/).filter(Boolean).slice(0, 5);
  const rows = [
    {lab:'BPE',       f:tokBPE,       col:MTC.a1},
    {lab:'WordPiece', f:tokWordPiece, col:MTC.a5},
    {lab:'Unigram',   f:tokUnigram,   col:MTC.a4}
  ];
  const c = mtCtx('tok-canvas', 40 + rows.length*62); if(!c) return;
  const {x, w} = c;
  const counts = [];
  rows.forEach((r, ri)=>{
    const y = 30 + ri*62;
    mtTxt(x, r.lab.toUpperCase(), 4, y-8, {size:9.5, col:r.col, weight:'700'});
    let px = 4, total = 0;
    words.forEach((word, wi)=>{
      const pieces = r.f(word, n);
      total += pieces.length;
      pieces.forEach(p=>{
        const disp = p;
        const pw = Math.max(24, disp.length*8.2 + 14);
        if(px + pw > w-4){ return; }
        const cont = disp.startsWith('##');
        mtChip(x, px, y, pw, 26, cont ? 'rgba(23,27,52,0.05)' : r.col+'1F', cont ? MTC.line : r.col+'80', null);
        mtTxt(x, disp, px+pw/2, y+13, {size:10, col:MTC.text, align:'center'});
        px += pw + 4;
      });
      px += 8;
    });
    counts.push(total);
    mtTxt(x, total + ' tokens', w-4, y-8, {size:9.5, col:MTC.muted, align:'right'});
  });
  const same = counts.every(v=>v===counts[0]);
  mtSet('tok-cap', same
    ? 'All three produce the same number of pieces on this input. Try a longer or rarer word, or drag the vocabulary size down, and they will separate.'
    : `The three algorithms disagree: ${counts[0]}, ${counts[1]} and ${counts[2]} pieces for the same text. Fewer pieces is not automatically better; what matters is whether the pieces line up with units of meaning that recur in other words.`);
}

/* ══ 12.2.2 BUILDING THE BITEXT ═══════════════════════════ */
MT_PAGES.mtalign = `
<div class="lesson-chapter-label">Section 12.2.2</div>
<h1 class="lesson-h1">Building the Parallel Text to Train On</h1>
<p class="lesson-intro">An encoder-decoder learns from <strong>parallel text</strong>, or bitext: the same content in two languages, aligned sentence to sentence. Parliamentary proceedings, translated books, subtitles and multilingual news are the usual sources. Getting from a pair of documents to a clean list of sentence pairs is most of the work, and the first assumption most people make about it is wrong.</p>

<h2 class="lesson-h2">Alignment Is Not One-to-One</h2>
<p class="lesson-p">Translators do not preserve sentence boundaries. A long source sentence may be split into two; two short ones may be merged into one; a sentence may be added for clarity or dropped as redundant. Any alignment procedure has to allow for all of these, not just the one-to-one case.</p>
<p class="lesson-p">Try aligning the passage below by hand before revealing the correct answer. Click a sentence on the left, then its partner on the right.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Alignment Table</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="algReveal()">reveal gold alignment</button>
      <button style="${MTBTN}" onclick="algReset()">clear</button>
      <button style="${MTBTN}" id="alg-hm" onclick="algHeat()">show similarity matrix</button>
    </div>
    <div id="alg-wrap"><canvas id="alg-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas></div>
    <div id="alg-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The mechanism behind the automatic version is straightforward. Encode every sentence on both sides with a multilingual sentence encoder, compute cosine similarity between every cross-language pair, and then find the highest-scoring path through that grid that never goes backwards. Because translations preserve order, the correct alignment is a monotonic path, and dynamic programming finds the best one. Turn on the similarity matrix above to see the path traced through the grid.</p>

<h2 class="lesson-h2">Most of the Work Is Removal</h2>
<p class="lesson-p">Raw aligned bitext is noisy, and the standard filters are blunt. Discard pairs whose length ratio is implausible, since a three-word sentence does not translate into forty words. Discard pairs where one side is not in the expected language, which happens constantly with scraped web data. Discard near-duplicates, boilerplate, and pairs where the two sides are identical, since an identical pair usually means the page was never translated at all.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Cleanup Filter</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">max length ratio</span><input id="cln-r" type="range" min="1.2" max="6" step="0.2" value="6" oninput="clnDraw()" style="width:110px;accent-color:var(--accent)">
      <span style="${MTLBL}">min similarity</span><input id="cln-s" type="range" min="0" max="0.9" step="0.05" value="0" oninput="clnDraw()" style="width:110px;accent-color:var(--accent)">
      <button style="${MTBTN}" id="cln-d" onclick="clnDup()">drop identical pairs: off</button>
    </div>
    <canvas id="cln-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="cln-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qmt-alg"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can dynamic programming find the best sentence alignment efficiently?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-alg','Correct. Translations preserve document order, so the alignment is monotonic and the best path to each cell is built from best paths to earlier cells.')">Translations preserve order, so the alignment is a monotonic path through the grid</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-alg','One-to-one alignment is exactly the assumption that fails; merges, splits and nulls are common.')">Because every sentence aligns to exactly one sentence</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-alg','Sentence counts frequently differ between the two sides.')">Because both documents have the same number of sentences</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-alg','Similarity scores come from an encoder and are real-valued, not binary.')">Because similarity scores are binary</button>
</div><div class="quiz-explain" id="qmt-alg-explain"></div></div>`;

/* ── Alignment table ──────────────────────────────────────── */
const ALG_E = ['The little prince sat down on a stone.','He raised his eyes toward the sky.','It was empty.',
  'A flower had once grown there.','Now nothing remained.','He remembered the fox.','And he wept.'];
const ALG_F = ['Le petit prince s\u2019assit sur une pierre et leva les yeux vers le ciel.','Il \u00E9tait vide.',
  'Une fleur y avait pouss\u00E9 autrefois.','Il ne restait plus rien.','Le vent soufflait doucement.',
  'Il se souvint du renard.','Et il pleura.'];
const ALG_GOLD = [[0,0],[1,0],[2,1],[3,2],[4,3],[5,5],[6,6]];  // f[4] is null-aligned
let _alg = {links:[], sel:null, rev:false, heat:false};

function algBuild(){
  const cv = document.getElementById('alg-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('click', e=>{
      if(_alg.heat) return;
      const r = cv.getBoundingClientRect();
      const mx = e.clientX-r.left, my = e.clientY-r.top;
      const rowH = 30, top = 34;
      const i = Math.floor((my-top)/rowH);
      if(i < 0) return;
      if(mx < r.width/2 - 10){ if(i < ALG_E.length) _alg.sel = i; }
      else if(mx > r.width/2 + 10){
        if(_alg.sel !== null && i < ALG_F.length){
          _alg.links = _alg.links.filter(l=>!(l[0]===_alg.sel && l[1]===i));
          _alg.links.push([_alg.sel, i]); _alg.sel = null;
        }
      }
      algDraw();
    });
  }
  _alg = {links:[], sel:null, rev:false, heat:false};
  algDraw(); clnBuild();
}
function algReveal(){ _alg.rev = !_alg.rev; algDraw(); }
function algReset(){ _alg.links = []; _alg.sel = null; _alg.rev = false; algDraw(); }
function algHeat(){ _alg.heat = !_alg.heat; algDraw(); }
function algSim(i,j){
  const g = ALG_GOLD.find(p=>p[0]===i);
  const base = (g && g[1]===j) ? 0.86 : 0.12;
  return Math.min(0.97, Math.max(0.03, base + 0.16*Math.sin(i*2.3+j*1.7)));
}
function algDraw(){
  const b = document.getElementById('alg-hm');
  if(b){ b.style.background = _alg.heat?'var(--accent)':'var(--surface2)'; b.style.color = _alg.heat?'#FAFBFF':'var(--muted)'; }
  if(_alg.heat){ algHeatDraw(); return; }
  const rows = Math.max(ALG_E.length, ALG_F.length);
  const c = mtCtx('alg-canvas', 34 + rows*30 + 14); if(!c) return;
  const {x, w} = c;
  const rowH = 30, top = 34, cw = w/2 - 30;
  mtTxt(x, 'ENGLISH', 8, 18, {size:9.5, col:MTC.muted});
  mtTxt(x, 'FRENCH', w/2+22, 18, {size:9.5, col:MTC.muted});
  const clip = (s, max)=> s.length>max ? s.slice(0,max-1)+'\u2026' : s;
  ALG_E.forEach((s,i)=>{
    const on = _alg.sel===i;
    mtChip(x, 8, top+i*rowH, cw, 25, on?'rgba(79,70,229,0.16)':MTC.surf, on?MTC.a1:MTC.line, null);
    mtTxt(x, clip(s, Math.floor(cw/5.6)), 15, top+i*rowH+12.5, {size:9.5, col:MTC.text});
  });
  ALG_F.forEach((s,i)=>{
    const linked = _alg.links.some(l=>l[1]===i) || (_alg.rev && ALG_GOLD.some(g=>g[1]===i));
    const nul = _alg.rev && !ALG_GOLD.some(g=>g[1]===i);
    mtChip(x, w/2+22, top+i*rowH, cw, 25, nul?'rgba(159,18,57,0.12)':MTC.surf, nul?MTC.a2:MTC.line, null);
    mtTxt(x, clip(s, Math.floor(cw/5.6)), w/2+29, top+i*rowH+12.5, {size:9.5, col:MTC.text});
    if(nul) mtTxt(x, 'null', w-6, top+i*rowH+12.5, {size:8.5, col:MTC.a2, align:'right'});
  });
  const drawLink = (i,j,col,dash)=>{
    x.save(); x.strokeStyle = col; x.lineWidth = 1.8; x.setLineDash(dash||[]);
    const x1 = 8+cw, y1 = top+i*rowH+12.5, x2 = w/2+22, y2 = top+j*rowH+12.5;
    x.beginPath(); x.moveTo(x1,y1); x.bezierCurveTo(x1+18,y1,x2-18,y2,x2,y2); x.stroke(); x.restore();
  };
  _alg.links.forEach(l=>drawLink(l[0], l[1], 'rgba(79,70,229,0.55)'));
  if(_alg.rev) ALG_GOLD.forEach(g=>drawLink(g[0], g[1], 'rgba(159,18,57,0.75)', [5,3]));
  let merges = 0; const seen = {};
  ALG_GOLD.forEach(g=>{ seen[g[1]] = (seen[g[1]]||0)+1; });
  Object.values(seen).forEach(v=>{ if(v>1) merges++; });
  mtSet('alg-cap', _alg.rev
    ? `The gold alignment has ${merges} merge (two English sentences into one French sentence) and one French sentence with no English partner at all. If you assumed one-to-one, every link after the merge was shifted by one.`
    : (_alg.sel!==null ? 'Now click the French sentence it corresponds to.'
       : `Click an English sentence, then its French partner. ${_alg.links.length} link${_alg.links.length===1?'':'s'} placed.`));
}
function algHeatDraw(){
  const n = ALG_E.length, m = ALG_F.length;
  const c = mtCtx('alg-canvas', 40 + m*26 + 20); if(!c) return;
  const {x, w} = c;
  const left = 40, cell = Math.min(52, (w-left-16)/n), top = 34;
  mtTxt(x, 'COSINE SIMILARITY \u00b7 multilingual sentence embeddings', 4, 16, {size:9.5, col:MTC.muted});
  for(let i=0;i<n;i++) for(let j=0;j<m;j++){
    const v = algSim(i,j);
    x.fillStyle = 'rgba(79,70,229,' + (v*0.85).toFixed(3) + ')';
    x.fillRect(left+i*cell, top+j*26, cell-2, 24);
    if(v > 0.6) mtTxt(x, v.toFixed(2), left+i*cell+(cell-2)/2, top+j*26+12, {size:8.5, col:'#FAFBFF', align:'center'});
  }
  for(let i=0;i<n;i++) mtTxt(x, 'e'+(i+1), left+i*cell+(cell-2)/2, 28, {size:8.5, col:MTC.muted, align:'center'});
  for(let j=0;j<m;j++) mtTxt(x, 'f'+(j+1), left-6, top+j*26+12, {size:8.5, col:MTC.muted, align:'right'});
  // DP staircase
  x.save(); x.strokeStyle = MTC.a2; x.lineWidth = 2.4;
  x.beginPath();
  ALG_GOLD.forEach((g,k)=>{
    const px = left+g[0]*cell+(cell-2)/2, py = top+g[1]*26+12;
    k ? x.lineTo(px,py) : x.moveTo(px,py);
  });
  x.stroke(); x.restore();
  ALG_GOLD.forEach(g=>{
    x.beginPath(); x.arc(left+g[0]*cell+(cell-2)/2, top+g[1]*26+12, 4, 0, 7);
    x.fillStyle = MTC.a2; x.fill();
  });
  mtSet('alg-cap', 'The best monotonic path through the grid is the alignment. It steps right without stepping back, which is what makes dynamic programming applicable: the best path into any cell is built from the best paths into the cells above and to the left.');
}

/* ── Cleanup filter ───────────────────────────────────────── */
const CLN = [
  {e:'The meeting begins at nine.', f:'La r\u00E9union commence \u00E0 neuf heures.', el:5, fl:6, sim:.91, ok:true},
  {e:'Yes.', f:'Nous tenons \u00E0 vous informer que la proc\u00E9dure a chang\u00E9 depuis.', el:1, fl:11, sim:.21, ok:false, why:'length ratio 11:1'},
  {e:'Click here to accept cookies', f:'Click here to accept cookies', el:5, fl:5, sim:1.0, ok:false, why:'identical \u2014 untranslated boilerplate'},
  {e:'She sold the house last year.', f:'Elle a vendu la maison l\u2019an dernier.', el:6, fl:7, sim:.88, ok:true},
  {e:'Privacy policy', f:'Politique de confidentialit\u00E9', el:2, fl:3, sim:.83, ok:true},
  {e:'The report was delayed.', f:'Der Bericht wurde versp\u00E4tet.', el:4, fl:4, sim:.79, ok:false, why:'wrong language on the target side'},
  {e:'He walked to the station.', f:'Bonjour tout le monde.', el:5, fl:4, sim:.14, ok:false, why:'similarity far too low \u2014 misaligned'},
  {e:'Please sign the form.', f:'Veuillez signer le formulaire.', el:4, fl:4, sim:.93, ok:true},
  {e:'http://example.com/page', f:'http://example.com/page', el:1, fl:1, sim:1.0, ok:false, why:'identical URL'},
  {e:'They arrived before dawn.', f:'Ils sont arriv\u00E9s avant l\u2019aube.', el:4, fl:6, sim:.90, ok:true}
];
let _cln = {dup:false};
function clnBuild(){ _cln.dup = false; clnDraw(); }
function clnDup(){ _cln.dup = !_cln.dup; clnDraw(); }
function clnDraw(){
  const r = +(document.getElementById('cln-r')||{value:6}).value;
  const s = +(document.getElementById('cln-s')||{value:0}).value;
  const d = document.getElementById('cln-d');
  if(d){ d.textContent = 'drop identical pairs: ' + (_cln.dup?'on':'off');
         d.style.background = _cln.dup?'var(--accent)':'var(--surface2)'; d.style.color = _cln.dup?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('cln-canvas', 30 + CLN.length*26 + 16); if(!c) return;
  const {x, w} = c;
  let kept = 0, killedGood = 0;
  CLN.forEach((p,i)=>{
    const ratio = Math.max(p.el,p.fl)/Math.min(p.el,p.fl);
    const identical = p.e === p.f;
    let drop = false, why = '';
    if(ratio > r){ drop = true; why = 'length ratio ' + ratio.toFixed(1); }
    else if(p.sim < s){ drop = true; why = 'similarity ' + p.sim.toFixed(2); }
    else if(_cln.dup && identical){ drop = true; why = 'identical sides'; }
    if(!drop) kept++; else if(p.ok) killedGood++;
    const y = 26 + i*26;
    x.globalAlpha = drop ? 0.32 : 1;
    mtChip(x, 4, y, w-8, 23, drop ? 'rgba(159,18,57,0.10)' : (p.ok?'rgba(11,132,87,0.08)':'rgba(165,104,14,0.10)'),
           drop ? MTC.a2 : MTC.line, null);
    const half = (w-40)/2;
    mtTxt(x, p.e.length>34?p.e.slice(0,33)+'\u2026':p.e, 12, y+11.5, {size:9, col:MTC.text});
    mtTxt(x, p.f.length>34?p.f.slice(0,33)+'\u2026':p.f, 20+half, y+11.5, {size:9, col:MTC.text});
    if(drop){ x.strokeStyle = MTC.a2; x.lineWidth = 1; x.beginPath(); x.moveTo(10, y+11.5); x.lineTo(w-12, y+11.5); x.stroke(); }
    x.globalAlpha = 1;
    if(drop) mtTxt(x, why, w-12, y+11.5, {size:8, col:MTC.a2, align:'right'});
  });
  const bad = CLN.filter(p=>!p.ok).length;
  mtSet('cln-cap', `${kept} of ${CLN.length} pairs kept. ${bad} pairs in this sample are genuinely bad. ` +
    (killedGood ? `<b style="color:var(--accent2)">The current settings also discard ${killedGood} good pair${killedGood===1?'':'s'}.</b> ` : '') +
    'Filters are blunt instruments, and tightening them always costs some usable data.');
}

/* ══ 12.3 INSIDE THE ENCODER-DECODER BLOCK ════════════════ */
MT_PAGES.mtcross = `
<div class="lesson-chapter-label">Section 12.3</div>
<h1 class="lesson-h1">Inside the Encoder-Decoder Block</h1>
<p class="lesson-intro">An encoder-decoder transformer’s decoder adds cross-attention to the source representations. It also uses causal self-attention, unlike a bidirectional encoder. Follow where the queries, keys, and values come from in each attention layer.</p>

<h2 class="lesson-h2">Where Q, K and V Come From</h2>
<p class="lesson-p">In ordinary self-attention, queries, keys and values are all computed from the same input. <strong>Cross-attention</strong> breaks that symmetry. The queries come from the previous decoder layer, so they represent the target sentence as generated so far. The keys and values come from the encoder&rsquo;s final output, so they represent the source. Each target position asks a question and searches the source for an answer:</p>
<div class="lesson-math">\\[\\mathbf{Q} = \\mathbf{H}^{dec}\\mathbf{W}^{Q}, \\qquad \\mathbf{K} = \\mathbf{H}^{enc}\\mathbf{W}^{K}, \\qquad \\mathbf{V} = \\mathbf{H}^{enc}\\mathbf{W}^{V}\\]</div>
<p class="lesson-p">The computation that follows is scaled dot-product attention, unchanged from the transformer chapter. Each target position \\(i\\) scores every source position \\(j\\) by the dot product of its query with that position&rsquo;s key; the scores are scaled, normalized into weights by a softmax over the source positions, and used to take a weighted average of the values:</p>
<div class="lesson-math">\\[\\alpha_{ij} = \\frac{\\exp\\left(\\mathbf{q}_i \\cdot \\mathbf{k}_j / \\sqrt{d_k}\\right)}{\\sum_{j'=1}^{n} \\exp\\left(\\mathbf{q}_i \\cdot \\mathbf{k}_{j'} / \\sqrt{d_k}\\right)}, \\qquad \\mathbf{o}_i = \\sum_{j=1}^{n} \\alpha_{ij}\\, \\mathbf{v}_j\\]</div>
<p class="lesson-p">The \\(\\sqrt{d_k}\\) deserves a derivation rather than a shrug. Suppose the components of \\(\\mathbf{q}\\) and \\(\\mathbf{k}\\) are independent with mean 0 and variance 1. The dot product \\(\\mathbf{q} \\cdot \\mathbf{k} = \\sum_{c=1}^{d_k} q_c k_c\\) is then a sum of \\(d_k\\) independent terms, each with mean 0 and variance 1, so the sum has variance \\(d_k\\) and typical magnitude \\(\\sqrt{d_k}\\). At \\(d_k = 64\\) that is scores of around \\(\\pm 8\\) before any learning has happened, and a softmax fed values that far apart saturates: one weight goes to 1, the rest to 0, and the gradient through the flat region vanishes. Dividing by \\(\\sqrt{d_k}\\) restores unit variance whatever the dimension, keeping the softmax in the range where it can still be trained.</p>
<p class="lesson-p">Since where the three inputs come from is the entire content of the layer, the demonstration below lets you wire them yourself and get it wrong.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Cross-Attention Cutaway</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="xat-btns"></div>
    <canvas id="xat-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="xat-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Three Masks, Three Rules</h2>
<p class="lesson-p">The three attention layers in the architecture differ only in what they are allowed to look at, and each restriction is a mask. <strong>Encoder self-attention</strong> is unmasked and square: every source position sees every other, in both directions, because the whole source is available at once. <strong>Decoder self-attention</strong> is a lower triangle: position <em>t</em> may look at positions up to <em>t</em> but not beyond, because at generation time the later tokens do not exist yet. <strong>Cross-attention</strong> is a full rectangle of shape <em>n</em>&times;<em>m</em> with no mask at all: every target position may look at every source position, since the source is complete before decoding starts.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Three Attention Masks</span></div>
  <div class="viz-body">
    <canvas id="msk-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="msk-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">The Training Loss</h2>
<p class="lesson-p">Training uses the cross-entropy loss from the language modelling chapters, unchanged. At each target position the model produces a distribution over the vocabulary, and the loss is the negative log probability it assigned to the correct next token:</p>
<div class="lesson-math">\\[L_{CE} = -\\sum_{t=1}^{m} \\log \\hat{y}_{t}[w_{t+1}]\\]</div>
<p class="lesson-p">This loss is maximum likelihood estimation in disguise, and the identity is worth walking through once. Training wants the model to assign high probability to the reference translation, which means maximizing \\(P(y \\mid x) = \\prod_{t} \\hat{y}_{t}[w_{t+1}]\\), the product of the probabilities it gave the correct token at every step. The logarithm is strictly increasing, so maximizing the log leaves the winner unchanged while turning the product into a sum: \\(\\log \\prod_t \\hat{y}_t[w_{t+1}] = \\sum_t \\log \\hat{y}_t[w_{t+1}]\\). Flipping the sign converts maximization into minimization, and what remains is exactly \\(L_{CE}\\). Minimizing cross-entropy and maximizing the likelihood of the reference are the same operation described from opposite ends.</p>
<p class="lesson-p">Scrub through the timesteps below and watch the loss accumulate. A confident correct prediction adds almost nothing; a confident wrong one adds a great deal.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Cross-Entropy Across Timesteps</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">timestep</span>
      <input id="tfl-t" type="range" min="0" max="4" step="1" value="4" oninput="tflDraw()" style="width:170px;accent-color:var(--accent)">
    </div>
    <canvas id="tfl-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tfl-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qmt-xat"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In cross-attention, where do the keys and values come from?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-xat','Correct. Keys and values come from the encoder output, which is how the decoder gains access to the source sentence.')">The encoder&rsquo;s final output</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-xat','That is where the queries come from. If keys came from there too, the layer would be ordinary self-attention and the source would be invisible.')">The previous decoder layer</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-xat','The embedding matrix supplies the initial token vectors, not the attention inputs of a mid-stack layer.')">The target embedding matrix</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-xat','Q comes from the decoder and K, V from the encoder; they are not all from one place.')">All three come from the same place, as in self-attention</button>
</div><div class="quiz-explain" id="qmt-xat-explain"></div></div>`;

/* ── Cross-attention cutaway ──────────────────────────────── */
let _xat = {q:'dec', k:'enc', v:'enc'};
function xatBuild(){
  const b = document.getElementById('xat-btns');
  if(b) b.innerHTML =
    ['q','k','v'].map(s=>`<span style="${MTLBL}">${s.toUpperCase()} from</span>
      <button style="${MTBTN}" id="xat-${s}-dec" onclick="xatSet('${s}','dec')">decoder</button>
      <button style="${MTBTN}" id="xat-${s}-enc" onclick="xatSet('${s}','enc')">encoder</button>`).join('') +
    `<button style="${MTBTN}" onclick="xatSet('reset')">correct wiring</button>`;
  _xat = {q:'dec', k:'enc', v:'enc'}; xatDraw();
}
function xatSet(s, val){
  if(s==='reset') _xat = {q:'dec', k:'enc', v:'enc'}; else _xat[s] = val;
  xatDraw();
}
function xatDraw(){
  ['q','k','v'].forEach(s=>['dec','enc'].forEach(v=>{
    const e = document.getElementById('xat-'+s+'-'+v); if(!e) return;
    const on = _xat[s]===v;
    e.style.background = on ? (v==='enc'?'var(--accent2)':'var(--accent)') : 'var(--surface2)';
    e.style.color = on ? '#FAFBFF' : 'var(--muted)';
  }));
  const c = mtCtx('xat-canvas', 262); if(!c) return;
  const {x, w} = c;
  const bw = Math.min(215, w/2 - 40), encX = 20, decX = w - bw - 20;
  const layers = [['self-attention', false], ['cross-attention', true], ['feedforward', false]];

  const block = (px, title, isDec)=>{
    mtChip(x, px, 34, bw, 190, MTC.surf, MTC.line2, null);
    mtTxt(x, title, px+bw/2, 22, {size:10, col:MTC.muted, align:'center'});
    let y = 48;
    layers.forEach(([lab, cross])=>{
      if(cross && !isDec) return;
      const hot = cross;
      mtChip(x, px+12, y, bw-24, 36, hot?'rgba(159,18,57,0.16)':'rgba(23,27,52,0.04)', hot?MTC.a2:MTC.line, null);
      mtTxt(x, lab, px+bw/2, y+18, {size:9.5, col:hot?MTC.a2:MTC.muted, align:'center', weight:hot?'700':''});
      y += 48;
    });
    if(!isDec){ mtTxt(x, '(no cross-attention)', px+bw/2, 154, {size:8.5, col:MTC.muted, align:'center'}); }
    // residual stream
    x.strokeStyle = MTC.line2; x.lineWidth = 1; x.setLineDash([3,3]);
    x.beginPath(); x.moveTo(px+6, 40); x.lineTo(px+6, 218); x.stroke(); x.setLineDash([]);
  };
  block(encX, 'ENCODER BLOCK', false);
  block(decX, 'DECODER BLOCK', true);

  // cables into the cross-attention layer of the decoder
  const target = {x: decX+12, y: 96+18};
  const cable = (label, from, col, dy)=>{
    const start = from==='enc' ? {x:encX+bw, y:210} : {x:decX+bw-4, y:60};
    x.save(); x.strokeStyle = col; x.lineWidth = 2.4;
    x.beginPath(); x.moveTo(start.x, start.y);
    x.bezierCurveTo(start.x+40, start.y, target.x-40, target.y+dy, target.x, target.y+dy);
    x.stroke(); x.restore();
    x.beginPath(); x.arc(target.x, target.y+dy, 3.5, 0, 7); x.fillStyle = col; x.fill();
    mtTxt(x, label, target.x-12, target.y+dy, {size:10, col:col, align:'right', weight:'700'});
  };
  cable('Q', _xat.q, _xat.q==='dec'?MTC.a1:MTC.a3, -13);
  cable('K', _xat.k, _xat.k==='enc'?MTC.a2:MTC.a3, 0);
  cable('V', _xat.v, _xat.v==='enc'?MTC.a2:MTC.a3, 13);

  const ok = _xat.q==='dec' && _xat.k==='enc' && _xat.v==='enc';
  mtTxt(x, ok ? 'wiring correct' : 'wiring broken', w/2, 244,
        {size:11, col: ok?MTC.a4:MTC.a2, align:'center', weight:'700'});

  let msg;
  if(ok) msg = 'Queries from the decoder, keys and values from the encoder output. Each target position forms a query and searches the source representations for the information it needs.';
  else if(_xat.k==='dec' && _xat.v==='dec') msg = '<b style="color:var(--accent2)">Keys and values came from the decoder.</b> The layer is now ordinary self-attention over the target, and the model can no longer see the source sentence at all.';
  else if(_xat.k==='dec') msg = '<b style="color:var(--accent2)">Keys came from the decoder.</b> The queries score against target positions but then retrieve source values, so the retrieved content has nothing to do with what was matched.';
  else if(_xat.v==='dec') msg = '<b style="color:var(--accent2)">Values came from the decoder.</b> The model finds the right source position and then returns target content from it, so the alignment is computed and immediately discarded.';
  else msg = '<b style="color:var(--accent2)">Queries came from the encoder.</b> The source is now querying itself, and nothing about the partially generated target influences what gets retrieved.';
  mtSet('xat-cap', msg);
}

/* ── Three masks ──────────────────────────────────────────── */
function mskDraw(){
  const c = mtCtx('msk-canvas', 210); if(!c) return;
  const {x, w} = c;
  const specs = [
    {t:'ENCODER SELF-ATTN', n:5, m:5, rule:(i,j)=>true,  sub:'n \u00d7 n, unmasked', col:MTC.a1},
    {t:'DECODER SELF-ATTN', n:5, m:5, rule:(i,j)=>j<=i, sub:'m \u00d7 m, causal', col:MTC.a5},
    {t:'CROSS-ATTENTION',   n:5, m:7, rule:(i,j)=>true, sub:'m \u00d7 n, unmasked', col:MTC.a2}
  ];
  const gw = (w-40)/3;
  specs.forEach((s, si)=>{
    const ox = 12 + si*gw, cell = Math.min(16, (gw-24)/Math.max(s.n, s.m));
    mtTxt(x, s.t, ox, 18, {size:9, col:s.col, weight:'700'});
    for(let i=0;i<s.m;i++) for(let j=0;j<s.n;j++){
      const on = s.rule(i,j);
      x.fillStyle = on ? s.col+'CC' : 'rgba(23,27,52,0.05)';
      x.fillRect(ox + j*cell, 32 + i*cell, cell-1.5, cell-1.5);
    }
    mtTxt(x, s.sub, ox, 32 + s.m*cell + 16, {size:9, col:MTC.muted});
    const keyLab = si===2 ? 'source positions \u2192' : 'keys \u2192';
    mtTxt(x, keyLab, ox, 32 + s.m*cell + 30, {size:8.5, col:MTC.muted});
  });
  mtSet('msk-cap', 'Three layers, three shapes. The decoder\u2019s triangle is what forces generation to be left to right. The cross-attention rectangle is not square because the source and target sentences do not have to be the same length, which is exactly the freedom translation needs.');
}

/* ── Teacher-forcing loss ─────────────────────────────────── */
const TFL = [
  {gold:'Estall\u00F3', dist:[['Estall\u00F3',.62],['Revent\u00F3',.19],['Explot\u00F3',.11],['El',.08]]},
  {gold:'el',     dist:[['el',.71],['un',.17],['ese',.07],['globo',.05]]},
  {gold:'globo',  dist:[['globo',.44],['bal\u00F3n',.31],['juguete',.15],['rojo',.10]]},
  {gold:'rojo',   dist:[['rojo',.83],['viejo',.09],['peque\u00F1o',.05],['.',.03]]},
  {gold:'&lt;/s&gt;', dist:[['&lt;/s&gt;',.90],['.',.06],['y',.03],['el',.01]]}
];
function tflDraw(){
  const t = Math.max(0, Math.min(4, Math.round(+(document.getElementById('tfl-t')||{value:4}).value)));
  const c = mtCtx('tfl-canvas', 230); if(!c) return;
  const {x, w} = c;
  const colW = (w-24)/TFL.length;
  let cum = 0;
  TFL.forEach((s, i)=>{
    const ox = 12 + i*colW, active = i===t, shown = i<=t;
    const loss = -Math.log(s.dist.find(d=>d[0]===s.gold)[1]);
    if(shown) cum += loss;
    x.globalAlpha = shown ? 1 : 0.25;
    mtTxt(x, 't=' + i, ox, 16, {size:9, col: active?MTC.a5:MTC.muted, weight: active?'700':''});
    s.dist.forEach((d, j)=>{
      const y = 26 + j*22, bw = (colW-16)*d[1];
      const isGold = d[0]===s.gold;
      mtChip(x, ox, y, colW-16, 18, 'rgba(23,27,52,0.04)', null);
      x.fillStyle = isGold ? 'rgba(11,132,87,0.55)' : 'rgba(79,70,229,0.22)';
      mtRR(x, ox, y, Math.max(2,bw), 18, 4); x.fill();
      mtTxt(x, d[0].replace('&lt;','<').replace('&gt;','>'), ox+5, y+9.5, {size:8.5, col:MTC.text});
      if(isGold) mtTxt(x, '\u2713', ox+colW-22, y+9.5, {size:9, col:MTC.a4});
    });
    mtTxt(x, '\u2212log ' + s.dist.find(d=>d[0]===s.gold)[1].toFixed(2), ox, 128, {size:8.5, col:MTC.muted});
    mtTxt(x, '= ' + loss.toFixed(3), ox, 141, {size:9.5, col: active?MTC.a5:MTC.text, weight: active?'700':''});
    x.globalAlpha = 1;
    // running bar
    const bh = loss*46;
    x.fillStyle = shown ? (active ? MTC.a5 : 'rgba(79,70,229,0.5)') : 'rgba(23,27,52,0.08)';
    mtRR(x, ox+8, 206-bh, colW-32, bh, 3); x.fill();
  });
  x.strokeStyle = MTC.line; x.lineWidth = 1;
  x.beginPath(); x.moveTo(12, 206); x.lineTo(w-12, 206); x.stroke();
  mtTxt(x, 'per-token loss', 12, 220, {size:8.5, col:MTC.muted});
  mtTxt(x, 'L = ' + cum.toFixed(3) + '  over ' + (t+1) + ' token' + (t?'s':''), w-12, 220,
        {size:10.5, col:MTC.a2, align:'right', weight:'700'});
  mtSet('tfl-cap', 'The gold token is marked at each step. Step 3 is the expensive one: the model split its confidence between <em>globo</em> and <em>bal&oacute;n</em>, both defensible translations of <em>balloon</em>, and the loss punishes it for the uncertainty even though the prediction was correct.');
}

/* ══ 12.4 BEAM SEARCH ═════════════════════════════════════ */
MT_PAGES.mtbeam = `
<div class="lesson-chapter-label">Section 12.4</div>
<h1 class="lesson-h1">Keeping Several Translations Alive at Once</h1>
<p class="lesson-intro">Decoding searches for an output sequence using the model’s next-token probabilities. Choosing the best token at every step need not produce the highest-probability complete sequence. A small example shows why.</p>

<h2 class="lesson-h2">Why the Greedy Choice Fails</h2>
<p class="lesson-p">Greedy decoding takes the highest-probability token at every step. This maximizes the probability of each token individually, which is not the same as maximizing the probability of the sentence. A token that looks slightly worse now can lead to a continuation that is much better, and by the time that becomes apparent the greedy path has already committed.</p>
<p class="lesson-p">The tree below is small enough to check by hand. Walk it greedily first, always taking the fattest edge, and note where you end up. Then reveal every path.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Greedy Trap</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="grdReset()">walk it greedily</button>
      <button style="${MTBTN}" onclick="grdAll()">show all paths</button>
    </div>
    <canvas id="grd-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="grd-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Why Exact Search Is Off the Table</h2>
<p class="lesson-p">Before fixing greedy decoding, it is worth seeing why the problem cannot simply be solved outright. Decoding asks for \\(\\hat{y} = \\arg\\max_y \\prod_t P(y_t \\mid y_{&lt;t}, x)\\), which in principle means considering every possible target sequence. With vocabulary size \\(V\\) and sentences up to length \\(m\\) there are \\(V^m\\) of them; at \\(V = 32{,}000\\) and \\(m = 20\\) that is roughly \\(10^{90}\\) sequences. And unlike the sentence-alignment problem earlier in the chapter, this search has no dynamic-programming shortcut: the probability of each next token depends on the entire prefix through the network, not on a small local state that subproblems could share. Every practical decoder is therefore a heuristic exploring a vanishingly small sliver of the space.</p>

<h2 class="lesson-h2">Beam Search</h2>
<p class="lesson-p">Beam search hedges. Instead of keeping one partial sentence, it keeps the best <em>k</em>, where <em>k</em> is the <strong>beam width</strong>. At each step every surviving hypothesis is extended by every vocabulary item, producing <em>k</em>&times;<em>V</em> candidates, and the best <em>k</em> of those survive to the next step. Scores are accumulated log probabilities, since adding logs is equivalent to multiplying probabilities and does not underflow:</p>
<div class="lesson-math">\\[\\text{score}(y_{1:t}) = \\sum_{i=1}^{t} \\log P(y_i \\mid y_{&lt;i}, x)\\]</div>
<p class="lesson-p">Two separate facts justify the move to logarithms, and they are worth keeping apart. The first is numerical: a probability of a long sentence is a product of many numbers below one, and by thirty or forty tokens the product underflows even double-precision floating point. The second is that nothing is lost by the switch: \\(\\log\\) is strictly increasing, so \\(\\arg\\max_y \\prod_t P(y_t \\mid \\cdot) = \\arg\\max_y \\sum_t \\log P(y_t \\mid \\cdot)\\), and the ranking of hypotheses is identical. Since every \\(\\log P \\le 0\\), all scores are negative and less negative is better. The score also obeys the recurrence \\(\\text{score}(y_{1:t}) = \\text{score}(y_{1:t-1}) + \\log P(y_t \\mid y_{&lt;t}, x)\\), an addition per step, which is what the running sums in the explorer are displaying.</p>
<p class="lesson-p">Setting <em>k</em> = 1 recovers greedy decoding exactly, which the slider below makes visible.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Beam Explorer</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">beam width k</span>
      <input id="bm-k" type="range" min="1" max="6" step="1" value="3" oninput="bmDraw()" style="width:140px;accent-color:var(--accent)">
      <span id="bm-kl" style="${MTLBL}"></span>
      <button style="${MTBTN}" id="bm-n" onclick="bmNorm()">length normalization: off</button>
    </div>
    <canvas id="bm-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="bm-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Length Normalization</h2>
<p class="lesson-p">Extending a particular prefix multiplies its probability by another value at most 1, so its log score cannot increase. This does not mean every longer sentence is less probable than every shorter one, but raw sequence scores can favor early stopping. Length normalization is one way to adjust that preference:</p>
<div class="lesson-math">\\[\\text{score}(y) = \\frac{1}{|y|}\\sum_{i=1}^{|y|} \\log P(y_i \\mid y_{&lt;i}, x)\\]</div>
<p class="lesson-p">Turn the toggle on above and watch a longer, more complete translation overtake the truncated one that was winning.</p>

<p class="lesson-p">The bias itself is a one-line derivation. If per-token log probabilities hover around some typical value \\(c &lt; 0\\), then a hypothesis of length \\(|y|\\) scores roughly \\(c\\,|y|\\): more negative in direct proportion to length, regardless of quality. Dividing by \\(|y|\\) compares hypotheses by average per-token log probability instead, which removes the proportionality. Some systems normalize only partially, dividing by \\((5 + |y|)^{\\alpha} / 6^{\\alpha}\\) with \\(\\alpha \\approx 0.6\\); setting \\(\\alpha = 0\\) recovers the raw sum and \\(\\alpha = 1\\) is close to the full average, so \\(\\alpha\\) is a dial between the two.</p>

<div class="quiz-block" id="qmt-bm"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does beam search find better translations than greedy decoding?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-bm','Correct. Keeping several hypotheses alive lets a locally worse token survive long enough for its better continuation to appear.')">It delays commitment, so a locally worse token can win on its continuation</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-bm','The model and its probabilities are unchanged; only the search over them differs.')">It uses a better trained model</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-bm','Beam search is not exhaustive; it prunes to k hypotheses at every step and can still miss the best sentence.')">It searches every possible sentence exhaustively</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-bm','Beam search is more expensive than greedy, not less; the cost buys the improvement.')">It is faster, so more steps fit in the same budget</button>
</div><div class="quiz-explain" id="qmt-bm-explain"></div></div>`;

/* ── Greedy trap ──────────────────────────────────────────── */
const GRD = {
  root:{lab:'start', kids:[['yes',.5],['ok',.4],['&lt;/s&gt;',.1]]},
  yes:{kids:[['yes',.3],['ok',.3],['&lt;/s&gt;',.4]]},
  ok:{kids:[['ok',.7],['yes',.2],['&lt;/s&gt;',.1]]}
};
let _grd = {all:false, path:[]};
function grdBuild(){ _grd = {all:false, path:[]}; grdDraw(); }
function grdReset(){ _grd = {all:false, path:['yes','yes']}; grdDraw(); }
function grdAll(){ _grd.all = !_grd.all; grdDraw(); }
function grdDraw(){
  const c = mtCtx('grd-canvas', 250); if(!c) return;
  const {x, w} = c;
  const rootX = 60, l1X = w*0.42, l2X = w*0.80;
  const l1 = GRD.root.kids;
  const y1 = i => 50 + i*70;
  mtChip(x, rootX-32, 108, 64, 30, MTC.surf, MTC.line2, 'start', MTC.text, 10);

  const paths = [];
  l1.forEach((k, i)=>{
    const py = y1(i);
    const isEnd = k[0].startsWith('&lt;');
    const onGreedy = _grd.path[0]===k[0];
    x.strokeStyle = onGreedy ? MTC.a2 : 'rgba(23,27,52,0.22)';
    x.lineWidth = 1 + k[1]*7;
    x.beginPath(); x.moveTo(rootX+32, 123); x.lineTo(l1X-34, py+15); x.stroke();
    mtTxt(x, k[1].toFixed(2), (rootX+l1X)/2, (123+py+15)/2 - 9, {size:9, col: onGreedy?MTC.a2:MTC.muted, align:'center'});
    mtChip(x, l1X-34, py, 68, 30, onGreedy?'rgba(159,18,57,0.14)':MTC.surf, onGreedy?MTC.a2:MTC.line2, null);
    mtTxt(x, k[0].replace('&lt;','<').replace('&gt;','>'), l1X, py+15, {size:10, col:MTC.text, align:'center'});
    if(isEnd){ paths.push({s:k[0], p:k[1]}); return; }
    const kids = GRD[k[0]].kids;
    kids.forEach((k2, j)=>{
      const py2 = py - 22 + j*22;
      const prob = k[1]*k2[1];
      paths.push({s:k[0]+' '+k2[0], p:prob});
      const onG = onGreedy && _grd.path[1]===k2[0];
      const show = _grd.all || onGreedy;
      x.globalAlpha = show ? 1 : 0.18;
      x.strokeStyle = onG ? MTC.a2 : 'rgba(23,27,52,0.2)';
      x.lineWidth = 1 + k2[1]*5;
      x.beginPath(); x.moveTo(l1X+34, py+15); x.lineTo(l2X-30, py2+10); x.stroke();
      const best = _grd.all && Math.abs(prob-0.28) < 1e-9;
      mtChip(x, l2X-30, py2, 60, 20, best?'rgba(11,132,87,0.18)':(onG?'rgba(159,18,57,0.12)':MTC.surf),
             best?MTC.a4:(onG?MTC.a2:MTC.line), null);
      mtTxt(x, k2[0].replace('&lt;','<').replace('&gt;','>'), l2X, py2+10, {size:9, col:MTC.text, align:'center'});
      if(show) mtTxt(x, prob.toFixed(2), l2X+36, py2+10, {size:9, col: best?MTC.a4:MTC.muted, weight: best?'700':''});
      x.globalAlpha = 1;
    });
  });
  mtTxt(x, 'step 1', l1X, 20, {size:9, col:MTC.muted, align:'center'});
  mtTxt(x, 'step 2', l2X, 20, {size:9, col:MTC.muted, align:'center'});

  mtSet('grd-cap', _grd.all
    ? 'The greedy path <b style="color:var(--accent2)">yes yes</b> scores 0.15. The best path <b style="color:var(--accent4)">ok ok</b> scores 0.28, nearly double, and it was reachable the whole time. Greedy lost it at the very first step by taking 0.5 over 0.4.'
    : (_grd.path.length ? 'Greedy takes <b>yes</b> (0.5 beats 0.4), then from there takes <b>yes</b> again. Final probability 0.5 &times; 0.3 = <b style="color:var(--accent2)">0.15</b>. Now reveal the other paths.'
       : 'Press the button to walk the tree greedily, always taking the thickest edge.'));
}

/* ── Beam explorer ────────────────────────────────────────── */
const BM_STEP = [
  [['Estall\u00F3',-0.51],['Revent\u00F3',-0.92],['El',-1.20],['Explot\u00F3',-2.10]],
  [['el',-0.35],['un',-1.30],['globo',-1.90],['&lt;/s&gt;',-2.60]],
  [['globo',-0.28],['bal\u00F3n',-1.40],['juguete',-2.30],['&lt;/s&gt;',-3.10]],
  [['rojo',-0.22],['viejo',-2.00],['&lt;/s&gt;',-1.10],['peque\u00F1o',-3.00]],
  [['&lt;/s&gt;',-0.09],['.',-2.70],['y',-3.40],['ah\u00ED',-4.10]]
];
let _bm = {norm:false};
function bmBuild(){ _bm.norm = false; bmDraw(); }
function bmNorm(){ _bm.norm = !_bm.norm; bmDraw(); }
function bmDraw(){
  const k = +(document.getElementById('bm-k')||{value:3}).value;
  mtSet('bm-kl', 'k = ' + k + (k===1 ? '  \u2192 identical to greedy' : ''));
  const nb = document.getElementById('bm-n');
  if(nb){ nb.textContent = 'length normalization: ' + (_bm.norm?'on':'off');
          nb.style.background = _bm.norm?'var(--accent)':'var(--surface2)'; nb.style.color = _bm.norm?'#FAFBFF':'var(--muted)'; }
  // run beam search
  let beams = [{toks:[], score:0, done:false}];
  const hist = [];
  for(let t=0; t<BM_STEP.length; t++){
    const cand = [];
    beams.forEach(b=>{
      if(b.done){ cand.push(b); return; }
      BM_STEP[t].forEach(([tok, lp])=>{
        cand.push({toks:b.toks.concat([tok]), score:b.score+lp, done:tok.startsWith('&lt;')});
      });
    });
    const key = b => _bm.norm ? b.score/Math.max(1,b.toks.length) : b.score;
    cand.sort((a,b)=>key(b)-key(a));
    beams = cand.slice(0, k);
    hist.push({t, kept:beams.map(b=>({toks:b.toks.slice(), score:b.score, done:b.done})), n:cand.length});
  }
  const c = mtCtx('bm-canvas', 60 + k*30 + 60); if(!c) return;
  const {x, w} = c;
  const colW = (w-20)/BM_STEP.length;
  hist.forEach((hh, t)=>{
    const ox = 10 + t*colW;
    mtTxt(x, 't=' + (t+1), ox, 16, {size:9, col:MTC.muted});
    mtTxt(x, hh.n + '\u2192' + hh.kept.length, ox+colW-14, 16, {size:8, col:MTC.a5, align:'right'});
    hh.kept.forEach((b, i)=>{
      const y = 26 + i*30;
      const last = b.toks[b.toks.length-1].replace('&lt;','<').replace('&gt;','>');
      mtChip(x, ox, y, colW-10, 25, b.done ? 'rgba(11,132,87,0.14)' : 'rgba(79,70,229,0.09)',
             b.done ? MTC.a4 : MTC.line, null);
      mtTxt(x, last, ox+5, y+9, {size:9, col:MTC.text});
      mtTxt(x, b.score.toFixed(2), ox+5, y+19, {size:8, col:MTC.muted});
    });
  });
  const y0 = 26 + k*30 + 14;
  x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(10, y0); x.lineTo(w-10, y0); x.stroke();
  const fin = hist[hist.length-1].kept;
  const key = b => _bm.norm ? b.score/Math.max(1,b.toks.length) : b.score;
  const best = fin.slice().sort((a,b)=>key(b)-key(a))[0];
  const clean = t => t.replace('&lt;/s&gt;','').trim();
  mtTxt(x, 'BEST HYPOTHESIS', 10, y0+16, {size:9, col:MTC.muted});
  mtTxt(x, clean(best.toks.join(' ')), 10, y0+34, {size:13, col:MTC.a1, weight:'700'});
  mtTxt(x, (_bm.norm ? 'normalized ' : 'total ') + 'score ' + key(best).toFixed(3),
        w-10, y0+34, {size:10, col:MTC.a2, align:'right'});
  mtSet('bm-cap', k===1
    ? 'With k = 1 there is one hypothesis and no pruning decision to make at all, which is greedy decoding under a different name.'
    : `Each step expands ${k} hypotheses into ${k}\u00d7V candidates and prunes back to ${k}. ` +
      (_bm.norm ? 'With normalization the score is a per-token average, so a longer complete translation is no longer penalized simply for being longer.'
                : 'Without normalization, every extra token subtracts more log probability, so short truncated hypotheses are unfairly favoured. Turn normalization on to see the ranking change.'));
}

/* ══ 12.4.1 MINIMUM BAYES RISK ════════════════════════════ */
MT_PAGES.mtmbr = `
<div class="lesson-chapter-label">Section 12.4.1</div>
<h1 class="lesson-h1">Picking the Translation Everyone Else Agrees With</h1>
<p class="lesson-intro">Beam search returns the most probable translation the model can find. There is a reason to want something else. Model probabilities are imperfect, and the single highest-scoring output is sometimes an outlier that the model happens to like for the wrong reason. An alternative is to ask which candidate is most similar to all the other candidates the model considers plausible.</p>

<h2 class="lesson-h2">Most Probable Versus Least Risky</h2>
<p class="lesson-p"><strong>Minimum Bayes risk</strong> decoding samples a pool of candidate translations, then scores each candidate not by its own probability but by its average similarity to every other candidate. The candidate the rest of the pool agrees with is the one selected:</p>
<div class="lesson-math">\\[\\hat{y} = \\arg\\max_{y \\in \\mathcal{Y}} \\frac{1}{|\\mathcal{Y}|}\\sum_{y' \\in \\mathcal{Y}} \\text{util}(y, y')\\]</div>
<p class="lesson-p">The reasoning is that a mistake tends to be idiosyncratic. If the model hallucinates a clause, that clause will appear in one candidate and not the others, so the hallucinating candidate sits alone and its average similarity is low. A correct translation, by contrast, has many near-neighbours that say the same thing in slightly different words.</p>

<h2 class="lesson-h2">Where the Formula Comes From</h2>
<p class="lesson-p">The name is from decision theory, and the formula above is the last line of a short derivation. Define the <strong>risk</strong> of committing to a candidate \\(y\\) as the expected loss against the true translation, which is unknown, so the model&rsquo;s own distribution stands in for the uncertainty. With loss taken as one minus a utility such as chrF:</p>
<div class="lesson-math">\\[R(y) = \\mathbb{E}_{y' \\sim P(\\cdot \\mid x)}\\left[\\, 1 - \\text{util}(y, y') \\,\\right]\\]</div>
<p class="lesson-p">Minimizing risk is the same as maximizing expected utility, since the constant 1 shifts every candidate equally and cannot change the argmax. The expectation ranges over every possible translation, which is intractable, so it is estimated by Monte Carlo: draw \\(N\\) samples \\(y^{(1)}, \\ldots, y^{(N)}\\) from the model and average,</p>
<div class="lesson-math">\\[\\mathbb{E}_{y'}\\left[\\text{util}(y, y')\\right] \\;\\approx\\; \\frac{1}{N} \\sum_{i=1}^{N} \\text{util}\\left(y, y^{(i)}\\right)\\]</div>
<p class="lesson-p">which recovers the selection rule above, with the sampled pool standing in for the distribution. The error of a Monte Carlo estimate shrinks like \\(1/\\sqrt{N}\\), which is the mathematical reason the returns flatten in the demonstration: quadrupling the candidate count only halves the noise in the expectation, while the cost of the pairwise utility computation grows as \\(N^2\\).</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Consensus Cloud</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">candidates</span>
      <input id="mbr-n" type="range" min="8" max="64" step="8" value="32" oninput="mbrDraw()" style="width:120px;accent-color:var(--accent)">
      <span id="mbr-nl" style="${MTLBL}"></span>
      <span style="${MTLBL}">utility</span>
      <select id="mbr-u" onchange="mbrDraw()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.32rem .55rem;font-family:var(--mono);font-size:.66rem">
        <option value="chrf">chrF</option><option value="bleu">BLEU</option><option value="bert">BERTScore</option>
      </select>
    </div>
    <canvas id="mbr-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="mbr-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Note what this costs. Beam search runs the model once and returns an answer. MBR requires sampling dozens of candidates and then computing a similarity score for every pair, which is quadratic in the pool size. The returns also flatten: going from 8 candidates to 32 helps considerably, and going from 32 to 64 usually does not.</p>

<div class="quiz-block" id="qmt-mbr"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does a hallucinated translation tend to score poorly under MBR even when the model assigns it high probability?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-mbr','Correct. Errors are idiosyncratic, so a hallucinating candidate has few near-neighbours and its average similarity to the pool is low.')">Its errors are idiosyncratic, so few other candidates resemble it</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-mbr','MBR does not use the model probability of the candidate at all when ranking; it uses similarity to the pool.')">MBR assigns it a lower model probability</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-mbr','No reference translation is available at inference time, which is the whole point.')">It is compared against the reference translation</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-mbr','Length is not what MBR measures, and a hallucination need not be longer.')">Hallucinated translations are always longer</button>
</div><div class="quiz-explain" id="qmt-mbr-explain"></div></div>`;

/* ── Consensus cloud ──────────────────────────────────────── */
function mbrPts(n, seed){
  const pts = [];
  let s = seed;
  const rnd = ()=>{ s = (s*9301+49297)%233280; return s/233280; };
  for(let i=0;i<n;i++){
    const cluster = rnd();
    let px, py;
    if(cluster < .62){ px = .42 + (rnd()-.5)*.26; py = .5 + (rnd()-.5)*.30; }
    else if(cluster < .88){ px = .68 + (rnd()-.5)*.22; py = .42 + (rnd()-.5)*.30; }
    else { px = .12 + rnd()*.12; py = .16 + rnd()*.66; }
    pts.push({x:px, y:py, lp: -0.6 - rnd()*2.4});
  }
  // the outlier: highest model probability, no neighbours
  pts[0] = {x:.10, y:.20, lp:-0.25, outlier:true};
  return pts;
}
function mbrDraw(){
  const n = +(document.getElementById('mbr-n')||{value:32}).value;
  const u = (document.getElementById('mbr-u')||{value:'chrf'}).value;
  mtSet('mbr-nl', n + ' sampled');
  const c = mtCtx('mbr-canvas', 300); if(!c) return;
  const {x, w, h} = c;
  const pts = mbrPts(n, {chrf:7, bleu:31, bert:97}[u]);
  const pad = 34, PW = w-pad*2, PH = h-pad*2-16;
  const px = p => pad + p.x*PW, py = p => pad + p.y*PH;
  const wpow = {chrf:1.0, bleu:1.7, bert:0.65}[u];
  // utility = mean similarity to all others
  pts.forEach(p=>{
    let s = 0;
    pts.forEach(q=>{ if(q===p) return; const d = Math.hypot(p.x-q.x, p.y-q.y); s += Math.exp(-Math.pow(d*3.4, wpow)); });
    p.util = s/Math.max(1, pts.length-1);
  });
  const mostProb = pts.reduce((a,b)=> b.lp>a.lp?b:a);
  const bestUtil = pts.reduce((a,b)=> b.util>a.util?b:a);
  // frame
  x.strokeStyle = MTC.line; x.lineWidth = 1;
  mtRR(x, pad-14, pad-14, PW+28, PH+28, 10); x.stroke();
  mtTxt(x, 'CANDIDATE SPACE \u00b7 pairwise similarity', pad-14, 18, {size:9.5, col:MTC.muted});
  // links from the consensus winner
  pts.forEach(p=>{
    const d = Math.hypot(p.x-bestUtil.x, p.y-bestUtil.y);
    if(d < .22 && p!==bestUtil){
      x.strokeStyle = 'rgba(11,132,87,0.20)'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(px(bestUtil), py(bestUtil)); x.lineTo(px(p), py(p)); x.stroke();
    }
  });
  pts.forEach(p=>{
    const r = 3 + p.util*9;
    x.beginPath(); x.arc(px(p), py(p), r, 0, 7);
    x.fillStyle = 'rgba(79,70,229,' + (0.20 + p.util*0.55).toFixed(3) + ')'; x.fill();
  });
  const mark = (p, col, lab, dy)=>{
    x.beginPath(); x.arc(px(p), py(p), 11, 0, 7); x.strokeStyle = col; x.lineWidth = 2.2; x.stroke();
    x.beginPath(); x.arc(px(p), py(p), 4, 0, 7); x.fillStyle = col; x.fill();
    mtTxt(x, lab, px(p), py(p)+dy, {size:9.5, col:col, align:'center', weight:'700'});
  };
  mark(mostProb, MTC.a2, 'most probable', -20);
  mark(bestUtil, MTC.a4, 'highest utility', 26);
  mtTxt(x, 'util = ' + u, w-pad+10, 18, {size:9.5, col:MTC.muted, align:'right'});
  const same = mostProb === bestUtil;
  mtSet('mbr-cap', same
    ? 'On this sample the two criteria agree. That happens, but it is not the common case; resample or change the utility function and they separate again.'
    : `The two criteria pick different candidates. The most probable one sits away from the crowd with almost no support: the model liked it, and nothing else the model produced resembles it. The highest-utility candidate sits inside the dense region where many independent samples said roughly the same thing. Switching the utility function from chrF to BERTScore changes what counts as similar, and can move the winner again.`);
}

/* ══ 12.5 LOW-RESOURCE TRANSLATION ════════════════════════ */
MT_PAGES.mtlow = `
<div class="lesson-chapter-label">Section 12.5</div>
<h1 class="lesson-h1">Translating Without Much Data</h1>
<p class="lesson-intro">Everything so far assumed a large parallel corpus. For a handful of language pairs that assumption holds. For most of the world&rsquo;s roughly seven thousand languages it does not, and the shortfall is not marginal but several orders of magnitude. Low-resource translation is the normal case, and the techniques in this section exist because of it.</p>

<h2 class="lesson-h2">How Bitext Is Distributed</h2>
<p class="lesson-p">Available parallel text is concentrated in a small number of pairs. European Union and United Nations proceedings supply enormous volumes for a few dozen official languages. Everything else falls away quickly, and the tail is very long.</p>
<p class="lesson-p">The chart below is on a logarithmic axis, which is the only way to fit the range on a screen. Hover a point for the sentence-pair count.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Resource Cliff</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" id="cliff-d" onclick="cliffDom()">restrict to a narrow domain: off</button>
      <span style="${MTLBL}">viable-system threshold</span>
      <input id="cliff-t" type="range" min="4" max="7" step="0.25" value="5.5" oninput="cliffDraw()" style="width:130px;accent-color:var(--accent)">
    </div>
    <canvas id="cliff-canvas" data-w="660" style="width:100%;display:block;cursor:crosshair"></canvas>
    <div id="cliff-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">It Is Not Only About the Language</h2>
<p class="lesson-p">A pair can be high-resource in general and low-resource for the text you actually care about. English and French have hundreds of millions of aligned sentences, but very few of them are radiology reports, and a system trained on parliamentary proceedings will mistranslate clinical language confidently. Turn on the domain restriction above and watch a well-resourced pair drop below the line.</p>
<p class="lesson-p">This matters because the resource problem is usually described as a property of languages, when it is really a property of language-and-domain pairs. Most practical translation work involves a domain where almost nobody has parallel data, regardless of which languages are involved.</p>

<div class="quiz-block" id="qmt-low"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A system trained on European Parliament proceedings translates a medical discharge summary poorly. What is the problem?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-low','Correct. The language pair is high-resource but the domain is not, and vocabulary and register both shift.')">A domain mismatch: the pair is high-resource, the domain is not</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-low','The pair itself has abundant bitext; the shortfall is in this particular genre.')">The language pair is low-resource</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-low','Beam width affects search, not whether the model has seen clinical language.')">The beam width is too small</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-low','Subword tokenization handles unseen strings; it does not supply the missing domain knowledge.')">The tokenizer cannot represent medical words</button>
</div><div class="quiz-explain" id="qmt-low-explain"></div></div>`;

/* ── Resource cliff ───────────────────────────────────────── */
const CLIFF = [
  {n:'French', v:8.4}, {n:'Spanish', v:8.3}, {n:'German', v:8.2}, {n:'Chinese', v:7.9},
  {n:'Russian', v:7.8}, {n:'Arabic', v:7.6}, {n:'Portuguese', v:7.5}, {n:'Italian', v:7.4},
  {n:'Japanese', v:7.2}, {n:'Dutch', v:7.1}, {n:'Polish', v:6.9}, {n:'Turkish', v:6.6},
  {n:'Vietnamese', v:6.4}, {n:'Hindi', v:6.1}, {n:'Indonesian', v:6.0}, {n:'Greek', v:5.9},
  {n:'Hebrew', v:5.7}, {n:'Thai', v:5.5}, {n:'Bengali', v:5.2}, {n:'Swahili', v:4.9},
  {n:'Nepali', v:4.5}, {n:'Yoruba', v:4.2}, {n:'Amharic', v:4.0}, {n:'Igbo', v:3.7},
  {n:'Navajo', v:3.4}, {n:'Quechua', v:3.2}, {n:'Wolof', v:2.9}, {n:'Tigrinya', v:2.7}
];
let _cliff = {dom:false, hot:-1};
function cliffBuild(){
  const cv = document.getElementById('cliff-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('mousemove', e=>{
      const r = cv.getBoundingClientRect();
      const i = Math.round(((e.clientX-r.left)-46)/((r.width-70)/(CLIFF.length-1)));
      const h = (i>=0 && i<CLIFF.length) ? i : -1;
      if(h!==_cliff.hot){ _cliff.hot = h; cliffDraw(); }
    });
    cv.addEventListener('mouseleave', ()=>{ _cliff.hot = -1; cliffDraw(); });
  }
  _cliff.dom = false; cliffDraw();
}
function cliffDom(){ _cliff.dom = !_cliff.dom; cliffDraw(); }
function cliffDraw(){
  const th = +(document.getElementById('cliff-t')||{value:5.5}).value;
  const d = document.getElementById('cliff-d');
  if(d){ d.textContent = 'restrict to a narrow domain: ' + (_cliff.dom?'on':'off');
         d.style.background = _cliff.dom?'var(--accent2)':'var(--surface2)'; d.style.color = _cliff.dom?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('cliff-canvas', 268); if(!c) return;
  const {x, w, h} = c;
  const L = 46, R = 24, T = 30, B = 66;
  const PW = w-L-R, PH = h-T-B;
  const drop = _cliff.dom ? 2.9 : 0;
  const yOf = v => T + PH*(1 - (v-2)/7);
  const xOf = i => L + i*(PW/(CLIFF.length-1));
  // grid
  for(let g=2; g<=9; g++){
    const gy = yOf(g);
    x.strokeStyle = MTC.line; x.lineWidth = 1;
    x.beginPath(); x.moveTo(L, gy); x.lineTo(L+PW, gy); x.stroke();
    mtTxt(x, '10' + ['\u00B2','\u00B3','\u2074','\u2075','\u2076','\u2077','\u2078','\u2079'][g-2], L-6, gy, {size:8.5, col:MTC.muted, align:'right'});
  }
  // area under curve
  x.beginPath(); x.moveTo(xOf(0), yOf(CLIFF[0].v-drop));
  CLIFF.forEach((p,i)=> x.lineTo(xOf(i), yOf(Math.max(2, p.v-drop))));
  x.lineTo(xOf(CLIFF.length-1), T+PH); x.lineTo(xOf(0), T+PH); x.closePath();
  x.fillStyle = 'rgba(79,70,229,0.10)'; x.fill();
  // curve
  x.beginPath();
  CLIFF.forEach((p,i)=>{ const py = yOf(Math.max(2, p.v-drop)); i? x.lineTo(xOf(i), py) : x.moveTo(xOf(i), py); });
  x.strokeStyle = MTC.a1; x.lineWidth = 2.2; x.stroke();
  // threshold
  x.save(); x.setLineDash([6,4]); x.strokeStyle = MTC.a2; x.lineWidth = 1.6;
  x.beginPath(); x.moveTo(L, yOf(th)); x.lineTo(L+PW, yOf(th)); x.stroke(); x.restore();
  mtTxt(x, 'what a usable system needs', L+4, yOf(th)-8, {size:9, col:MTC.a2});
  // points
  CLIFF.forEach((p,i)=>{
    const v = Math.max(2, p.v-drop), py = yOf(v), on = i===_cliff.hot;
    x.beginPath(); x.arc(xOf(i), py, on?6:3.4, 0, 7);
    x.fillStyle = v<th ? MTC.a2 : MTC.a1; x.fill();
    if(on){
      mtTxt(x, p.n, xOf(i), py-16, {size:10, col:MTC.text, align:'center', weight:'700'});
      mtTxt(x, Math.round(Math.pow(10,v)).toLocaleString() + ' pairs', xOf(i), py-29, {size:9, col:MTC.muted, align:'center'});
    }
  });
  // rotated labels for a few
  [0, 8, 16, 22, 27].forEach(i=>{
    x.save(); x.translate(xOf(i), T+PH+10); x.rotate(Math.PI/4);
    mtTxt(x, CLIFF[i].n, 0, 0, {size:8.5, col:MTC.muted}); x.restore();
  });
  const below = CLIFF.filter(p=>Math.max(2,p.v-drop) < th).length;
  mtTxt(x, below + ' of ' + CLIFF.length + ' below the line', w-R, 18, {size:10.5, col:MTC.a2, align:'right', weight:'700'});
  mtSet('cliff-cap', _cliff.dom
    ? 'Restricting to a narrow domain drops every language by roughly three orders of magnitude. Pairs that were comfortably above the line are now below it, which is why domain mismatch behaves like a low-resource problem even for the best-served languages.'
    : 'The curve falls steeply and the tail is much longer than this sample shows: these 28 languages are drawn from about seven thousand. Drag the threshold to see how few pairs clear any given bar.');
}

/* ══ 12.5.1 BACKTRANSLATION ═══════════════════════════════ */
MT_PAGES.mtback = `
<div class="lesson-chapter-label">Section 12.5.1</div>
<h1 class="lesson-h1">Manufacturing Training Data From Monolingual Text</h1>
<p class="lesson-intro">Backtranslation turns monolingual target-language text into additional training pairs. A reverse translation model supplies a synthetic source sentence, while the original text provides a human-written target.</p>

<h2 class="lesson-h2">The Loop</h2>
<p class="lesson-p">Suppose the goal is a Quechua-to-English system and only a small Quechua&ndash;English bitext exists. The procedure is:</p>
<p class="lesson-p">Train a weak model in the <em>opposite</em> direction, English to Quechua, on the small bitext. Run it over a large pile of monolingual English. Take each machine-produced Quechua sentence and pair it with the real English sentence it came from. Add those pairs to the training data and retrain the Quechua-to-English model.</p>
<p class="lesson-p">The synthetic side is the source: a reverse model translates target-language text into the source language. The original human-written target remains the training target. This preserves fluent target text while adding examples, although poor synthetic sources can still reduce the benefit.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Backtranslation Loop</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="mbtStep()">advance the loop</button>
      <button style="${MTBTN}" onclick="mbtReset()">reset</button>
      <span style="${MTLBL}">synthetic : real ratio</span>
      <input id="bt-r" type="range" min="0" max="8" step="1" value="3" oninput="mbtDraw()" style="width:120px;accent-color:var(--accent)">
      <span id="bt-rl" style="${MTLBL}"></span>
    </div>
    <canvas id="mbt-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="bt-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">How Much It Buys</h2>
<p class="lesson-p">Synthetic data is not as good as real bitext, and the gain flattens once synthetic sentences substantially outnumber real ones. Published results put the benefit at roughly two thirds of what the same volume of genuine parallel text would deliver, which is a large fraction of something that would otherwise not exist at all. Pushing the ratio too high makes things worse, because the model begins fitting the quirks of its own earlier output.</p>
<p class="lesson-p">Formally there is nothing new in the objective. The retrained model minimizes the usual cross-entropy over the union of the two pools,</p>
<div class="lesson-math">\\[L = \\sum_{(x,\\, y)\\, \\in\\, D_{\\text{real}}} L_{CE}(x, y) \\; + \\sum_{(\\tilde{x},\\, y)\\, \\in\\, D_{\\text{synth}}} L_{CE}(\\tilde{x}, y)\\]</div>
<p class="lesson-p">where \\(\\tilde{x}\\) marks a machine-generated source. The loss does not distinguish the two kinds of pair; the only control is the ratio between the pools, which is what the slider adjusts, and upsampling the real bitext is how that ratio is kept from drifting too far toward the synthetic side.</p>
<p class="lesson-p">The decoding strategy used to generate the synthetic side also matters, and not in the direction you might expect. Beam search produces the highest-quality individual sentences but they are all similar to one another, so the training signal is narrow. Sampling produces noisier sentences with far more variety, and that variety usually trains a better model.</p>

<div class="quiz-block" id="qmt-bt"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In backtranslated training pairs, which side is machine-generated?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-bt','Correct. The source side is synthetic and the target side is real text, so the decoder only ever learns to imitate human output.')">The source side, while the target side is real human text</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-bt','That is backwards, and it would teach the decoder to reproduce machine-quality text.')">The target side, while the source side is real</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-bt','Only one side is generated; the other is the monolingual text you started from.')">Both sides are generated</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-bt','If neither side were synthetic it would simply be ordinary bitext, which is what is missing.')">Neither, the pairs are drawn from existing bitext</button>
</div><div class="quiz-explain" id="qmt-bt-explain"></div></div>`;

/* ── Backtranslation loop ─────────────────────────────────── */
let _mbt = {stage:0};
function mbtBuild(){ _mbt.stage = 0; mbtDraw(); }
function mbtStep(){ _mbt.stage = (_mbt.stage+1) % 6; mbtDraw(); }
function mbtReset(){ _mbt.stage = 0; mbtDraw(); }
function mbtDraw(){
  const r = +(document.getElementById('bt-r')||{value:3}).value;
  mtSet('bt-rl', r + ' : 1');
  const c = mtCtx('mbt-canvas', 292); if(!c) return;
  const {x, w, h} = c;
  const cx = w/2, cy = 128, rx = Math.min(232, w/2-70), ry = 82;
  const nodes = [
    {a:-Math.PI/2,   t:'small real bitext',       s:'Quechua \u2013 English', kind:'real'},
    {a:-Math.PI/6,   t:'train reverse model',     s:'English \u2192 Quechua', kind:'model'},
    {a: Math.PI/6,   t:'monolingual English',     s:'millions of sentences', kind:'real'},
    {a: Math.PI/2,   t:'synthetic Quechua',        s:'machine output', kind:'synth'},
    {a: 5*Math.PI/6, t:'pair back with source',   s:'synth \u2192 real', kind:'pair'},
    {a:-5*Math.PI/6, t:'retrain forward model',   s:'Quechua \u2192 English', kind:'model'}
  ];
  // ring
  x.save(); x.strokeStyle = MTC.line2; x.lineWidth = 1; x.setLineDash([4,5]);
  x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 7); x.stroke(); x.restore();
  // arrow along ring
  for(let i=0;i<nodes.length;i++){
    const a0 = nodes[i].a, a1 = nodes[(i+1)%nodes.length].a;
    const on = i === _mbt.stage;
    if(!on) continue;
    x.save(); x.strokeStyle = MTC.a5; x.lineWidth = 2.6;
    x.beginPath();
    let aa = a0, ab = a1; if(ab < aa) ab += Math.PI*2;
    x.ellipse(cx, cy, rx, ry, 0, aa, ab); x.stroke(); x.restore();
  }
  nodes.forEach((nd, i)=>{
    const nx = cx + Math.cos(nd.a)*rx, ny = cy + Math.sin(nd.a)*ry;
    const on = i === _mbt.stage || i === (_mbt.stage+1)%nodes.length;
    const col = nd.kind==='synth' ? MTC.a2 : nd.kind==='model' ? MTC.a1 : nd.kind==='pair' ? MTC.a5 : MTC.a4;
    const bw = 128, bh = 40;
    mtChip(x, nx-bw/2, ny-bh/2, bw, bh, on ? col+'26' : MTC.surf, on ? col : MTC.line, null);
    mtTxt(x, nd.t, nx, ny-6, {size:9.5, col: on?MTC.text:MTC.muted, align:'center', weight: on?'700':''});
    mtTxt(x, nd.s, nx, ny+8, {size:8.5, col: col, align:'center'});
  });
  // legend for which side is synthetic
  const ly = h-52;
  mtChip(x, 8, ly, 150, 22, 'rgba(159,18,57,0.14)', MTC.a2, null);
  mtTxt(x, 'SOURCE \u00b7 synthetic', 83, ly+11, {size:9, col:MTC.a2, align:'center'});
  mtChip(x, 166, ly, 150, 22, 'rgba(11,132,87,0.14)', MTC.a4, null);
  mtTxt(x, 'TARGET \u00b7 real human text', 241, ly+11, {size:9, col:MTC.a4, align:'center'});
  // quality readout
  const gain = 0.67 * (1 - Math.exp(-r/2.2)) * (r>6 ? 1-(r-6)*0.10 : 1);
  const bx = w-176, bw2 = 168;
  mtTxt(x, 'GAIN VS. REAL BITEXT', bx, ly-6, {size:9, col:MTC.muted});
  mtRR(x, bx, ly, bw2, 22, 6); x.fillStyle = MTC.surf2; x.fill();
  mtRR(x, bx, ly, Math.max(4, bw2*Math.max(0,gain)), 22, 6); x.fillStyle = MTC.a1; x.fill();
  mtTxt(x, (gain*100).toFixed(0) + '%', bx+bw2-8, ly+11, {size:9.5, col:MTC.text, align:'right'});

  const notes = [
    'Start with the small amount of genuine parallel text that exists.',
    'Train a model in the reverse direction on it. It will be weak, and that is acceptable.',
    'Collect a large pile of ordinary monolingual text in the high-resource language.',
    'Run the reverse model over it. The output is imperfect machine-generated Quechua.',
    'Pair each synthetic sentence with the real English it was produced from. Note the direction: synthetic is the source, real is the target.',
    'Retrain the forward model on the enlarged pool. The decoder still only ever imitates real human English.'
  ];
  mtSet('bt-cap', notes[_mbt.stage] + (r>6 ? ' <b style="color:var(--accent2)">At this ratio the synthetic data dominates and quality starts to fall back.</b>' : ''));
}

/* ══ 12.5.2 MULTILINGUAL MODELS ═══════════════════════════ */
MT_PAGES.mtmulti = `
<div class="lesson-chapter-label">Section 12.5.2</div>
<h1 class="lesson-h1">One Model, Many Language Pairs</h1>
<p class="lesson-intro">Training a separate model for every language pair does not scale: a hundred languages would mean nearly ten thousand models. The alternative is one model trained on many pairs at once, with the desired output language specified as part of the input.</p>

<h2 class="lesson-h2">A Token Is the Whole Interface</h2>
<p class="lesson-p">The mechanism is almost trivially simple. Prepend a token naming the target language to the source sentence, so the input becomes <code>&lt;2es&gt; The red balloon burst</code>, and train on data from many pairs mixed together. The model learns to condition its output language on that token. Some systems also prepend a source-language token, though the model can usually identify the source language on its own.</p>
<p class="lesson-p">Change the target token below on an otherwise identical source sentence.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Language Token Switchboard</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="sw-btns"></div>
    <canvas id="sw-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="sw-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Transfer, and What It Costs</h2>
<p class="lesson-p">The reason to do this is not just convenience. Training many languages together forces them into a shared representation space, and related languages end up near one another in it. A low-resource language then inherits structure from its high-resource neighbours: Galician has relatively little bitext, but it sits close to Spanish and Portuguese, and a multilingual model can apply what it learned there.</p>
<p class="lesson-p">This is not free. Model capacity is finite and shared, so the languages with the most data give up a little accuracy to make room. The trade is usually worth taking, since the loss at the top is small and the gain at the bottom is large, but it should be stated rather than hidden.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Transfer Tax</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" id="tt-m" onclick="ttTog()">multilingual training: off</button>
    </div>
    <canvas id="tt-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tt-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qmt-mul"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In a multilingual model, why do the highest-resource languages sometimes get slightly worse?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-mul','Correct. Capacity is shared across all the languages, so the ones that previously had it to themselves give some up.')">Model capacity is shared, so they give some up to the others</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-mul','Their training data is unchanged; what changes is how much of the model is devoted to it.')">Their training data is removed</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-mul','The language token is prepended to the input and does not interfere with the source text.')">The language token corrupts the source sentence</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-mul','Low-resource languages gain; that gain is not taken from accuracy in a zero-sum way but from shared capacity.')">Low-resource languages produce worse translations overall</button>
</div><div class="quiz-explain" id="qmt-mul-explain"></div></div>`;

/* ── Language token switchboard ───────────────────────────── */
const SW = [
  {tok:'&lt;2es&gt;', lang:'Spanish',    out:'Estall\u00F3 el globo rojo'},
  {tok:'&lt;2pt&gt;', lang:'Portuguese', out:'O bal\u00E3o vermelho estourou'},
  {tok:'&lt;2fr&gt;', lang:'French',     out:'Le ballon rouge a \u00E9clat\u00E9'},
  {tok:'&lt;2de&gt;', lang:'German',     out:'Der rote Luftballon platzte'},
  {tok:'&lt;2ja&gt;', lang:'Japanese',   out:'akai fusen ga hajiketa'}
];
let _sw = 0;
function swBuild(){
  const b = document.getElementById('sw-btns');
  if(b) b.innerHTML = '<span style="'+MTLBL+'">target language token</span>' +
    SW.map((s,i)=>`<button style="${MTBTN}" id="sw-b${i}" onclick="swGo(${i})">${s.tok}</button>`).join('');
  _sw = 0; swDraw();
}
function swGo(i){ _sw = i; swDraw(); }
function swDraw(){
  SW.forEach((_,i)=>{ const e = document.getElementById('sw-b'+i); if(e){
    e.style.background = i===_sw ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_sw ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('sw-canvas', 168); if(!c) return;
  const {x, w} = c;
  const S = SW[_sw];
  mtTxt(x, 'INPUT \u00b7 identical every time except the first token', 8, 18, {size:9.5, col:MTC.muted});
  const toks = [S.tok, 'The', 'red', 'balloon', 'burst'];
  let px = 8;
  toks.forEach((t, i)=>{
    const disp = t.replace('&lt;','<').replace('&gt;','>');
    const tw = Math.max(52, disp.length*8.4 + 18);
    mtChip(x, px, 28, tw, 30, i===0?'rgba(165,104,14,0.20)':'rgba(79,70,229,0.09)', i===0?MTC.a5:MTC.line2, null);
    mtTxt(x, disp, px+tw/2, 43, {size:10, col:MTC.text, align:'center', weight: i===0?'700':''});
    px += tw + 5;
  });
  x.strokeStyle = MTC.line2; x.lineWidth = 1.4; x.setLineDash([4,4]);
  x.beginPath(); x.moveTo(w/2, 66); x.lineTo(w/2, 92); x.stroke(); x.setLineDash([]);
  mtChip(x, w/2-84, 92, 168, 26, 'rgba(79,70,229,0.16)', MTC.a1, 'one shared model', MTC.a1, 10);
  mtTxt(x, 'OUTPUT \u00b7 ' + S.lang.toUpperCase(), 8, 138, {size:9.5, col:MTC.muted});
  mtTxt(x, S.out, 8, 156, {size:15, col:MTC.a1, font:MTC.body, weight:'700'});
  mtSet('sw-cap', 'The source sentence, the weights, and every other input are unchanged. The only difference between a Spanish output and a Portuguese one is the single token at the front.');
}

/* ── Transfer tax ─────────────────────────────────────────── */
const TT = [
  {n:'Spanish',    res:'high', mono:41.2, multi:40.6},
  {n:'French',     res:'high', mono:39.8, multi:39.3},
  {n:'German',     res:'high', mono:36.4, multi:36.0},
  {n:'Romanian',   res:'mid',  mono:28.1, multi:29.7},
  {n:'Catalan',    res:'mid',  mono:24.6, multi:28.9},
  {n:'Galician',   res:'low',  mono:11.3, multi:24.8},
  {n:'Asturian',   res:'low',  mono: 7.9, multi:19.4}
];
let _tt = false;
function ttBuild(){ _tt = false; ttDraw(); }
function ttTog(){ _tt = !_tt; ttDraw(); }
function ttDraw(){
  const b = document.getElementById('tt-m');
  if(b){ b.textContent = 'multilingual training: ' + (_tt?'on':'off');
         b.style.background = _tt?'var(--accent)':'var(--surface2)'; b.style.color = _tt?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('tt-canvas', 232); if(!c) return;
  const {x, w} = c;
  const L = 78, T = 26, PH = 150, PW = w-L-56;
  mtTxt(x, 'TRANSLATION QUALITY (chrF)', 8, 16, {size:9.5, col:MTC.muted});
  TT.forEach((t, i)=>{
    const y = T + i*(PH/TT.length);
    const bh = PH/TT.length - 6;
    const v = _tt ? t.multi : t.mono;
    const bw = PW * (v/45);
    const col = t.res==='low' ? MTC.a4 : t.res==='mid' ? MTC.a5 : MTC.a1;
    mtTxt(x, t.n, L-6, y+bh/2, {size:9.5, col:MTC.text, align:'right'});
    mtRR(x, L, y, PW, bh, 4); x.fillStyle = 'rgba(23,27,52,0.045)'; x.fill();
    mtRR(x, L, y, Math.max(3, bw), bh, 4); x.fillStyle = col+'CC'; x.fill();
    mtTxt(x, v.toFixed(1), L+bw+6, y+bh/2, {size:9, col:MTC.text});
    const delta = t.multi - t.mono;
    if(_tt) mtTxt(x, (delta>0?'+':'') + delta.toFixed(1), w-8, y+bh/2,
      {size:9.5, col: delta>0?MTC.a4:MTC.a2, align:'right', weight:'700'});
    mtTxt(x, t.res, L-6, y+bh/2+11, {size:7.5, col:MTC.muted, align:'right'});
  });
  mtSet('tt-cap', _tt
    ? 'Galician gains more than thirteen points, Asturian more than eleven, and Romanian and Catalan gain several each. Spanish, French and German each lose about half a point. That is the trade: a small, real cost at the top in exchange for a large gain at the bottom.'
    : 'Each language trained on its own data alone. The low-resource ones have too little bitext to reach usable quality. Turn multilingual training on.');
}

/* ══ 12.5.3 WHO BUILDS THE SYSTEM ═════════════════════════ */
MT_PAGES.mtwho = `
<div class="lesson-chapter-label">Section 12.5.3</div>
<h1 class="lesson-h1">Who Builds the System, and For Whom</h1>
<p class="lesson-intro">Multilingual web corpora can contain mislabeled languages, poor translations, duplicates, and unrelated text. Dataset audits help reveal what a model is actually learning from.</p>

<h2 class="lesson-h2">What Is Actually in the Corpus</h2>
<p class="lesson-p">A 2022 audit by Kreutzer and colleagues examined several major multilingual corpora by hand. For many of the lower-resource languages, fewer than half the sentences were acceptable translations. The rest were web boilerplate, text in the wrong language entirely, duplicated lines, pornographic content, or nonsense produced by an automatic language identifier that had guessed incorrectly.</p>
<p class="lesson-p">Classify the sample below yourself before seeing the published figures. The exercise is short and the point of doing it by hand is that the number means something different once you have seen the sentences.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Data Provenance Audit</span></div>
  <div class="viz-body">
    <div id="aud-item" style="background:var(--panel);border-radius:10px;padding:1rem 1.1rem;color:#ECF1FF;margin-bottom:.9rem;min-height:5.4rem"></div>
    <div id="aud-btns" style="${MTROW}"></div>
    <canvas id="aud-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="aud-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Who Is in the Room</h2>
<p class="lesson-p">There is a second issue, separate from data quality. Most multilingual systems route through English: to translate Igbo to Nepali, the system effectively passes through an English-shaped representation, because that is where the training data is. Recent large models aim at genuinely many-to-many coverage, which removes the detour.</p>
<p class="lesson-p">Underneath that is a question about participation. Building a translation system for a language involves several stages: choosing what content to gather, building the technology, and evaluating the result. Speakers of the language can be involved at all of those stages, some of them, or none. Work such as the Masakhane project has argued that participation at every stage produces better systems as well as more legitimate ones, since native speakers catch problems in the data that no automatic filter detects.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Participation Across the Pipeline</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="par-btns"></div>
    <canvas id="par-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="par-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qmt-who"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Automatic language identification labelled a sentence as Igbo, but it is actually English boilerplate. What is the downstream effect?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-who','Correct. The pair teaches the model an incorrect correspondence, and in a low-resource language a small number of such pairs is a large fraction of the data.')">It becomes a training pair that teaches an incorrect correspondence</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-who','Nothing in the pipeline detects this automatically; that is why hand audits found it.')">The tokenizer will detect and discard it</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-who','Extra data is not harmless when it is wrong, especially where the total is small.')">It is harmless, since more data is always better</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-who','A length-ratio filter catches implausible lengths, not wrong-language content of normal length.')">The length-ratio filter removes it</button>
</div><div class="quiz-explain" id="qmt-who-explain"></div></div>`;

/* ── Data provenance audit ────────────────────────────────── */
const AUD = [
  {a:'Ndewo, kedu ka \u1EE5 mere?', b:'Hello, how are you?', gold:'usable', why:'A real translation pair.'},
  {a:'Click here to accept all cookies and continue', b:'Click here to accept all cookies and continue', gold:'boilerplate', why:'Identical web boilerplate on both sides. Never translated.'},
  {a:'Der Bericht wurde ver\u00F6ffentlicht.', b:'The report was published.', gold:'wrong language', why:'Labelled Igbo by an automatic identifier. It is German.'},
  {a:'Hello, how are you?', b:'Hello, how are you?', gold:'duplicate', why:'A line that appears thousands of times across the corpus.'},
  {a:'\u1ECAt\u1EE5r\u1EE5 aha ya b\u1EE5 Chidi.', b:'The weather in Lagos is warm today.', gold:'mismatched', why:'Aligned pair whose two sides are unrelated.'},
  {a:'Aha m b\u1EE5 Amaka.', b:'My name is Amaka.', gold:'usable', why:'A real translation pair.'},
  {a:'123 456 789 000', b:'123 456 789 000', gold:'boilerplate', why:'Numeric noise from a scraped table.'},
  {a:'\u1ECC na-agba \u1ECDs\u1ECD \u1ECDs\u1ECD \u1ECDs\u1ECD.', b:'He runs.', gold:'usable', why:'Imperfect but usable.'}
];
const AUD_LAB = ['usable','boilerplate','wrong language','duplicate','mismatched'];
let _aud = {i:0, marks:[]};
function audBuild(){ _aud = {i:0, marks:[]}; audRender(); }
function audMark(k){
  if(_aud.i >= AUD.length) return;
  _aud.marks.push({got:AUD_LAB[k], gold:AUD[_aud.i].gold, why:AUD[_aud.i].why});
  _aud.i++; audRender();
}
function audRender(){
  const done = _aud.i >= AUD.length;
  const it = AUD[_aud.i];
  mtSet('aud-item', done
    ? '<div style="font-family:var(--mono);font-size:.72rem;line-height:1.9">Audit complete.</div>'
    : `<div style="font-family:var(--mono);font-size:.62rem;color:#93A2CC;letter-spacing:.1em">PAIR ${_aud.i+1} OF ${AUD.length}</div>
       <div style="font-family:var(--mono);font-size:.8rem;margin-top:.5rem;line-height:1.9">${it.a}</div>
       <div style="font-family:var(--mono);font-size:.8rem;color:#A9D6FF;line-height:1.9">${it.b}</div>`);
  mtSet('aud-btns', done
    ? `<button style="${MTBTN}" onclick="audBuild()">run it again</button>`
    : `<span style="${MTLBL}">classify this pair</span>` + AUD_LAB.map((l,i)=>
        `<button style="${MTBTN}" onclick="audMark(${i})">${l}</button>`).join(''));
  audDraw();
  const last = _aud.marks[_aud.marks.length-1];
  mtSet('aud-cap', done
    ? 'Your tally sits beside the published figure. Kreutzer et al. (2022) found that for many lower-resource languages in widely used corpora, <b>under half</b> the sentence pairs were acceptable translations, and for some languages the usable fraction was in the single digits.'
    : (last ? (last.got===last.gold ? '<b style="color:var(--accent4)">Agreed.</b> ' : `<b style="color:var(--accent2)">Marked as ${last.gold}.</b> `) + last.why
            : 'Read each pair and decide what it is. Five categories, eight pairs.'));
}
function audDraw(){
  const c = mtCtx('aud-canvas', 132); if(!c) return;
  const {x, w} = c;
  const counts = {}; AUD_LAB.forEach(l=>counts[l]=0);
  _aud.marks.forEach(m=>counts[m.gold]++);
  const total = Math.max(1, _aud.marks.length);
  mtTxt(x, 'YOUR TALLY', 4, 14, {size:9.5, col:MTC.muted});
  const bw2 = (w-8)/AUD_LAB.length;
  AUD_LAB.forEach((l, i)=>{
    const v = counts[l], bh = (v/AUD.length)*56;
    const col = l==='usable' ? MTC.a4 : MTC.a2;
    x.fillStyle = 'rgba(23,27,52,0.04)'; mtRR(x, 4+i*bw2, 24, bw2-6, 56, 4); x.fill();
    x.fillStyle = col+'CC'; mtRR(x, 4+i*bw2, 80-bh, bw2-6, bh, 4); x.fill();
    mtTxt(x, l, 4+i*bw2+(bw2-6)/2, 92, {size:8, col:MTC.muted, align:'center'});
    if(v) mtTxt(x, String(v), 4+i*bw2+(bw2-6)/2, 74-bh, {size:9.5, col:col, align:'center', weight:'700'});
  });
  const usableFrac = _aud.marks.length ? counts['usable']/total : 0;
  mtTxt(x, 'usable so far: ' + (usableFrac*100).toFixed(0) + '%', 4, 118, {size:10.5, col:MTC.a1, weight:'700'});
  mtTxt(x, 'published audit: under 50% for many low-resource languages', w-4, 118, {size:9, col:MTC.a2, align:'right'});
}

/* ── Participation checklist ──────────────────────────────── */
const PAR = [
  {k:'content', lab:'content selection', note:'Deciding what gets collected and translated in the first place.'},
  {k:'build',   lab:'technology building', note:'Writing the tooling, training the model, choosing the architecture.'},
  {k:'eval',    lab:'evaluation', note:'Judging whether the output is actually good in the target language.'}
];
let _par = {content:false, build:false, eval:false};
function parBuild(){ _par = {content:false, build:false, eval:false}; parDraw(); }
function parTog(k){ _par[k] = !_par[k]; parDraw(); }
function parDraw(){
  const b = document.getElementById('par-btns');
  if(b) b.innerHTML = '<span style="'+MTLBL+'">native speakers involved in</span>' + PAR.map(p=>
    `<button style="${MTBTN}" id="par-${p.k}" onclick="parTog('${p.k}')">${p.lab}</button>`).join('');
  PAR.forEach(p=>{ const e = document.getElementById('par-'+p.k); if(e){
    e.style.background = _par[p.k] ? 'var(--accent4)' : 'var(--surface2)';
    e.style.color = _par[p.k] ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('par-canvas', 168); if(!c) return;
  const {x, w} = c;
  const n = PAR.length, bw = (w-40)/n;
  PAR.forEach((p, i)=>{
    const on = _par[p.k], px = 12 + i*bw;
    mtChip(x, px, 26, bw-14, 44, on?'rgba(11,132,87,0.16)':'rgba(23,27,52,0.04)', on?MTC.a4:MTC.line, null);
    mtTxt(x, p.lab, px+(bw-14)/2, 42, {size:10, col: on?MTC.text:MTC.muted, align:'center', weight: on?'700':''});
    mtTxt(x, on?'\u2713 involved':'not involved', px+(bw-14)/2, 58, {size:8.5, col: on?MTC.a4:MTC.a2, align:'center'});
    if(i<n-1){
      x.strokeStyle = MTC.line2; x.lineWidth = 1;
      x.beginPath(); x.moveTo(px+bw-12, 48); x.lineTo(px+bw-2, 48); x.stroke();
    }
  });
  const k = PAR.filter(p=>_par[p.k]).length;
  const q = [0.34, 0.52, 0.71, 0.89][k];
  mtTxt(x, 'DOWNSTREAM QUALITY INDICATOR', 12, 96, {size:9.5, col:MTC.muted});
  mtRR(x, 12, 106, w-24, 22, 7); x.fillStyle = MTC.surf2; x.fill();
  const g = x.createLinearGradient(12, 0, w-12, 0);
  g.addColorStop(0, MTC.a2); g.addColorStop(1, MTC.a4);
  mtRR(x, 12, 106, Math.max(8, (w-24)*q), 22, 7); x.fillStyle = g; x.fill();
  mtTxt(x, k + ' of 3 stages', w-20, 117, {size:9.5, col:MTC.text, align:'right'});
  mtSet('par-cap', k===3
    ? 'Speakers involved at every stage. This is what participatory approaches such as Masakhane argue for, and the case is practical as well as ethical: native speakers catch data problems that no automatic filter detects.'
    : (k===0 ? 'A system built entirely without speakers of the target language. The data is whatever the scrape returned, and nobody involved can tell whether the output is fluent.'
             : 'Partial involvement. The stages left out are where the undetected problems accumulate, and evaluation is the one most often skipped.'));
}

/* ══ 12.6 EVALUATING A TRANSLATION ════════════════════════ */
MT_PAGES.mteval = `
<div class="lesson-chapter-label">Section 12.6</div>
<h1 class="lesson-h1">Judging Whether a Translation Is Any Good</h1>
<p class="lesson-intro">Two things can be wrong with a translation, and they are independent. It can fail to say what the source said, or it can say it in a way no native speaker would. A translation can fail on one axis while succeeding on the other, which is why a single quality score hides more than it reveals.</p>

<h2 class="lesson-h2">Adequacy and Fluency</h2>
<p class="lesson-p"><strong>Adequacy</strong> asks whether the translation carries the meaning of the source: is the information there, complete, and unaltered. <strong>Fluency</strong> asks whether the output is natural in the target language: grammatical, idiomatic, and readable by someone who never sees the source.</p>
<p class="lesson-p">Place each translation below into a quadrant before revealing where an expert put it.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Two-Axis Grid</span></div>
  <div class="viz-body">
    <div id="qad-item" style="background:var(--panel);border-radius:10px;padding:1rem 1.1rem;color:#ECF1FF;margin-bottom:.9rem;min-height:4.6rem"></div>
    <div id="qad-btns" style="${MTROW}"></div>
    <canvas id="qad-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="qad-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">The Dangerous Quadrant</h2>
<p class="lesson-p">Fluent-but-wrong is the failure mode that matters most, for two reasons. A reader who does not know the source language has no way to detect it, because everything about the output looks correct. And it is exactly the case that automatic overlap metrics are worst at catching, since a fluent wrong translation uses ordinary target-language vocabulary and will share a great deal of surface material with the reference.</p>
<p class="lesson-p">Clunky-but-accurate is the opposite: irritating to read, easy to spot, and rarely harmful. A system that produces awkward correct translations is safer than one that produces smooth incorrect ones, which is not how quality scores usually rank them.</p>

<div class="quiz-block" id="qmt-ev"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is a fluent but inaccurate translation more dangerous than an awkward but accurate one?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-ev','Correct. A reader without the source has no signal that anything is wrong, and surface-overlap metrics also miss it.')">A reader who lacks the source cannot detect it, and overlap metrics miss it too</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-ev','Fluent output is generally shorter or comparable; length is not the issue.')">It is usually much longer</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-ev','Both take the same time to produce; the difference is in detectability.')">It takes longer for the model to generate</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-ev','Awkward translations are easy to spot precisely because they read badly.')">Awkward translations are harder for readers to notice</button>
</div><div class="quiz-explain" id="qmt-ev-explain"></div></div>`;

/* ── Two-axis grid ────────────────────────────────────────── */
const QAD = [
  {t:'The red balloon burst over the market at noon.', src:'El globo rojo estall\u00F3 sobre el mercado al mediod\u00EDa.',
   adq:.90, flu:.92, lab:'good at both', why:'Complete and natural. This is the target.'},
  {t:'The red balloon rose over the market at noon.', src:'El globo rojo estall\u00F3 sobre el mercado al mediod\u00EDa.',
   adq:.18, flu:.94, lab:'fluent but wrong', why:'Perfectly natural English that replaces bursting with rising. Nothing in the output signals the error.'},
  {t:'The balloon of red colour did burst above the market at the hour of midday.', src:'El globo rojo estall\u00F3 sobre el mercado al mediod\u00EDa.',
   adq:.86, flu:.22, lab:'accurate but clunky', why:'Every piece of meaning survives; the English is stilted. Annoying, not dangerous.'},
  {t:'Red burst market noon the of.', src:'El globo rojo estall\u00F3 sobre el mercado al mediod\u00EDa.',
   adq:.20, flu:.08, lab:'bad at both', why:'Broken on both axes, and therefore obvious.'}
];
const QAD_LAB = ['good at both','fluent but wrong','accurate but clunky','bad at both'];
let _qad = {i:0, done:[]};
function qadBuild(){ _qad = {i:0, done:[]}; qadRender(); }
function qadPick(k){
  if(_qad.i >= QAD.length) return;
  _qad.done.push({guess:QAD_LAB[k], gold:QAD[_qad.i].lab, why:QAD[_qad.i].why});
  _qad.i++; qadRender();
}
function qadRender(){
  const done = _qad.i >= QAD.length, it = QAD[_qad.i];
  mtSet('qad-item', done ? '<div style="font-family:var(--mono);font-size:.72rem">All four placed.</div>'
    : `<div style="font-family:var(--mono);font-size:.62rem;color:#93A2CC;letter-spacing:.1em">SOURCE</div>
       <div style="font-family:var(--mono);font-size:.76rem;line-height:1.9">${it.src}</div>
       <div style="font-family:var(--mono);font-size:.62rem;color:#93A2CC;letter-spacing:.1em;margin-top:.5rem">TRANSLATION ${_qad.i+1} OF ${QAD.length}</div>
       <div style="font-family:var(--mono);font-size:.76rem;color:#A9D6FF;line-height:1.9">${it.t}</div>`);
  mtSet('qad-btns', done ? `<button style="${MTBTN}" onclick="qadBuild()">try again</button>`
    : `<span style="${MTLBL}">which quadrant?</span>` + QAD_LAB.map((l,i)=>
        `<button style="${MTBTN}" onclick="qadPick(${i})">${l}</button>`).join(''));
  qadDraw();
  const last = _qad.done[_qad.done.length-1];
  mtSet('qad-cap', done
    ? 'The top-left quadrant, fluent but wrong, is the one to dwell on. It is invisible to a monolingual reader and nearly invisible to the metrics in the next two sections.'
    : (last ? (last.guess===last.gold ? '<b style="color:var(--accent4)">Agreed.</b> ' : `<b style="color:var(--accent2)">Placed as ${last.gold}.</b> `) + last.why
            : 'Read the source and the translation, then choose a quadrant.'));
}
function qadDraw(){
  const c = mtCtx('qad-canvas', 262); if(!c) return;
  const {x, w} = c;
  const S = Math.min(220, w-160), ox = 68, oy = 18;
  x.fillStyle = 'rgba(159,18,57,0.07)'; x.fillRect(ox, oy, S/2, S/2);
  x.fillStyle = 'rgba(11,132,87,0.09)'; x.fillRect(ox+S/2, oy, S/2, S/2);
  x.fillStyle = 'rgba(23,27,52,0.04)'; x.fillRect(ox, oy+S/2, S/2, S/2);
  x.fillStyle = 'rgba(165,104,14,0.07)'; x.fillRect(ox+S/2, oy+S/2, S/2, S/2);
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.strokeRect(ox, oy, S, S);
  x.beginPath(); x.moveTo(ox+S/2, oy); x.lineTo(ox+S/2, oy+S); x.stroke();
  x.beginPath(); x.moveTo(ox, oy+S/2); x.lineTo(ox+S, oy+S/2); x.stroke();
  mtTxt(x, 'fluent but wrong', ox+S/4, oy+12, {size:8.5, col:MTC.a2, align:'center'});
  mtTxt(x, 'good at both', ox+3*S/4, oy+12, {size:8.5, col:MTC.a4, align:'center'});
  mtTxt(x, 'bad at both', ox+S/4, oy+S-8, {size:8.5, col:MTC.muted, align:'center'});
  mtTxt(x, 'accurate, clunky', ox+3*S/4, oy+S-8, {size:8.5, col:MTC.a5, align:'center'});
  mtTxt(x, 'adequacy \u2192', ox+S/2, oy+S+16, {size:9.5, col:MTC.muted, align:'center'});
  x.save(); x.translate(ox-30, oy+S/2); x.rotate(-Math.PI/2);
  mtTxt(x, 'fluency \u2192', 0, 0, {size:9.5, col:MTC.muted, align:'center'}); x.restore();
  QAD.forEach((q, i)=>{
    if(i >= _qad.done.length) return;
    const px = ox + q.adq*S, py = oy + (1-q.flu)*S;
    x.beginPath(); x.arc(px, py, 7, 0, 7);
    x.fillStyle = q.lab==='fluent but wrong' ? MTC.a2 : q.lab==='good at both' ? MTC.a4 : MTC.a5;
    x.fill();
    mtTxt(x, String(i+1), px, py, {size:9, col:'#FAFBFF', align:'center', weight:'700'});
  });
  const lx = ox + S + 22;
  QAD.forEach((q, i)=>{
    if(i >= _qad.done.length) return;
    mtTxt(x, (i+1) + '. ' + q.lab, lx, 30 + i*20, {size:9, col:MTC.muted});
  });
}

/* ══ 12.6.1 HUMAN EVALUATION ══════════════════════════════ */
MT_PAGES.mthuman = `
<div class="lesson-chapter-label">Section 12.6.1</div>
<h1 class="lesson-h1">Asking People to Score Translations</h1>
<p class="lesson-intro">Human judgment is the standard every automatic metric is measured against, which makes it worth understanding how noisy it is. Raters disagree with each other, individual raters use the scale differently, and both problems are large enough to swamp the difference between two systems if they are not corrected for.</p>

<h2 class="lesson-h2">Rating, and the Spread That Follows</h2>
<p class="lesson-p">The usual protocol asks raters to score a translation on a fixed scale, typically 1 to 5 or 0 to 100, separately for fluency and for adequacy. Fluency can be judged without the source; adequacy requires either the source or a reference translation.</p>
<p class="lesson-p">Score the translation below, then see where a panel of other raters landed.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Be the Rater</span></div>
  <div class="viz-body">
    <div id="rat-item" style="background:var(--panel);border-radius:10px;padding:1rem 1.1rem;color:#ECF1FF;margin-bottom:.9rem;min-height:4.4rem"></div>
    <div id="rat-btns" style="${MTROW}"></div>
    <div style="${MTROW}">
      <button style="${MTBTN}" id="rat-n0" onclick="ratNorm(0)">raw scores</button>
      <button style="${MTBTN}" id="rat-n1" onclick="ratNorm(1)">drop outlier raters</button>
      <button style="${MTBTN}" id="rat-n2" onclick="ratNorm(2)">+ subtract each rater&rsquo;s mean</button>
      <button style="${MTBTN}" id="rat-n3" onclick="ratNorm(3)">+ divide by variance</button>
    </div>
    <canvas id="rat-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rat-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">The Normalization, Written Out</h2>
<p class="lesson-p">The corrections in the demonstration have a standard algebraic form. Let \\(x_{ij}\\) be the raw score rater \\(i\\) gave item \\(j\\), over \\(J\\) items. The z-normalized score subtracts that rater&rsquo;s own mean and divides by their own standard deviation:</p>
<div class="lesson-math">\\[x'_{ij} = \\frac{x_{ij} - \\mu_i}{\\sigma_i}, \\qquad \\mu_i = \\frac{1}{J}\\sum_{j=1}^{J} x_{ij}, \\qquad \\sigma_i^2 = \\frac{1}{J}\\sum_{j=1}^{J} \\left(x_{ij} - \\mu_i\\right)^2\\]</div>
<p class="lesson-p">Each piece removes one nuisance quantity. Subtracting \\(\\mu_i\\) removes systematic generosity or harshness, so a rater whose scores all sit one point high stops pulling every item up. Dividing by \\(\\sigma_i\\) equalizes how much of the scale each rater uses, so someone who scores everything between 3 and 4 counts the same as someone who ranges from 1 to 5. What survives is each rater&rsquo;s judgment of this item relative to their own baseline, which is the part that carries information about the translation rather than about the rater.</p>

<h2 class="lesson-h2">Ranking Beats Scoring</h2>
<p class="lesson-p">Asking someone to place a translation on an absolute scale requires them to hold a calibration in their head, and different people hold different ones. Asking which of two translations is better removes that requirement entirely, and inter-rater agreement rises sharply as a result. Most modern evaluation campaigns use pairwise comparison for this reason.</p>

<h2 class="lesson-h2">Post-Editing as a Measure</h2>
<p class="lesson-p">A third approach sidesteps opinion altogether. Give a rater the machine output and ask them to edit it, changing as little as possible, until it is correct. Then measure the edit distance between what the machine produced and what the human ended up with. The result is a quality score in units of work: how much repair the output needed. It is more expensive to collect than a rating, and considerably harder to argue with.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Post-Editing Distance</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">machine output</span>
    </div>
    <div id="pe-mt" style="background:var(--panel);border-radius:10px;padding:.8rem 1rem;font-family:var(--mono);font-size:.76rem;color:#ECF1FF;margin-bottom:.7rem"></div>
    <input id="pe-in" oninput="peDraw()" style="width:100%;background:var(--surface);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.55rem .7rem;font-family:var(--mono);font-size:.76rem;margin-bottom:.8rem">
    <canvas id="pe-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pe-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qmt-hum"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does pairwise ranking produce higher inter-rater agreement than absolute scoring?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-hum','Correct. A comparison needs no shared calibration of the scale, so a large source of between-rater variance disappears.')">It removes the need for raters to share a calibration of the scale</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-hum','Ranking takes comparable time; the gain is in consistency, not speed.')">It is much faster, so raters concentrate better</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-hum','Both protocols can be run with the source available; that is not the difference.')">It does not require access to the source sentence</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-hum','Ranking yields an ordering rather than a magnitude, which is a limitation rather than the reason for the agreement.')">It produces a numeric score with more precision</button>
</div><div class="quiz-explain" id="qmt-hum-explain"></div></div>`;

/* ── Be the rater ─────────────────────────────────────────── */
const RAT_PANEL = [
  {n:'R1', bias:+0.9, var:0.7, s:[]}, {n:'R2', bias:-0.6, var:1.0, s:[]},
  {n:'R3', bias:+0.1, var:0.5, s:[]}, {n:'R4', bias:-0.2, var:1.4, s:[]},
  {n:'R5', bias:+2.0, var:1.9, s:[], outlier:true}, {n:'R6', bias:-0.1, var:0.6, s:[]}
];
const RAT_ITEM = {src:'El globo rojo estall\u00F3 sobre el mercado al mediod\u00EDa.',
                  mt:'The balloon of red colour did burst above the market at the hour of midday.',
                  ref:'The red balloon burst over the market at noon.', truth:3.1};
let _rat = {mine:null, mode:0};
function ratBuild(){ _rat = {mine:null, mode:0}; ratRender(); peBuild(); }
function ratScore(v){ _rat.mine = v; ratRender(); }
function ratNorm(m){ _rat.mode = m; ratRender(); }
function ratRender(){
  mtSet('rat-item', `<div style="font-family:var(--mono);font-size:.62rem;color:#93A2CC;letter-spacing:.1em">SOURCE</div>
     <div style="font-family:var(--mono);font-size:.76rem;line-height:1.9">${RAT_ITEM.src}</div>
     <div style="font-family:var(--mono);font-size:.62rem;color:#93A2CC;letter-spacing:.1em;margin-top:.4rem">MACHINE TRANSLATION</div>
     <div style="font-family:var(--mono);font-size:.76rem;color:#A9D6FF;line-height:1.9">${RAT_ITEM.mt}</div>`);
  mtSet('rat-btns', `<span style="${MTLBL}">your adequacy score</span>` +
    [1,2,3,4,5].map(v=>`<button style="${MTBTN};${_rat.mine===v?'background:var(--accent);color:#FAFBFF':''}" onclick="ratScore(${v})">${v}</button>`).join(''));
  [0,1,2,3].forEach(m=>{ const e = document.getElementById('rat-n'+m); if(e){
    e.style.background = m===_rat.mode ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = m===_rat.mode ? '#FAFBFF' : 'var(--muted)'; } });
  ratDraw();
}
function ratDraw(){
  const c = mtCtx('rat-canvas', 176); if(!c) return;
  const {x, w} = c;
  let panel = RAT_PANEL.map(r=>({...r, raw: Math.max(1, Math.min(5, RAT_ITEM.truth + r.bias))}));
  if(_rat.mine) panel = panel.concat([{n:'you', raw:_rat.mine, mine:true, var:0.8}]);
  let vals = panel.map(p=>p.raw);
  if(_rat.mode >= 1) panel = panel.filter(p=>!p.outlier);
  if(_rat.mode >= 2){ const mu = panel.reduce((a,p)=>a+p.raw,0)/panel.length;
    panel = panel.map(p=>({...p, raw: RAT_ITEM.truth + (p.raw - mu)*0.75})); }
  if(_rat.mode >= 3) panel = panel.map(p=>({...p, raw: RAT_ITEM.truth + (p.raw-RAT_ITEM.truth)/Math.max(.6, p.var)}));
  vals = panel.map(p=>p.raw);
  const mean = vals.reduce((a,b)=>a+b,0)/vals.length;
  const sd = Math.sqrt(vals.reduce((a,b)=>a+(b-mean)*(b-mean),0)/vals.length);
  const L = 30, PW = w-L-30;
  const xo = v => L + ((v-1)/4)*PW;
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L, 104); x.lineTo(L+PW, 104); x.stroke();
  for(let v=1; v<=5; v++){
    x.beginPath(); x.moveTo(xo(v), 100); x.lineTo(xo(v), 108); x.stroke();
    mtTxt(x, String(v), xo(v), 120, {size:9, col:MTC.muted, align:'center'});
  }
  // spread band
  x.fillStyle = 'rgba(159,18,57,0.10)';
  x.fillRect(xo(Math.max(1, mean-sd)), 46, xo(Math.min(5, mean+sd))-xo(Math.max(1, mean-sd)), 52);
  panel.forEach((p, i)=>{
    const px = xo(p.raw), py = 62 + (i%4)*11;
    x.beginPath(); x.arc(px, py, p.mine?6:4.2, 0, 7);
    x.fillStyle = p.mine ? MTC.a5 : (p.outlier ? MTC.a2 : MTC.a1); x.fill();
    mtTxt(x, p.n, px, py-11, {size:8, col: p.mine?MTC.a5:MTC.muted, align:'center'});
  });
  x.strokeStyle = MTC.a4; x.lineWidth = 2;
  x.beginPath(); x.moveTo(xo(mean), 44); x.lineTo(xo(mean), 110); x.stroke();
  mtTxt(x, 'mean ' + mean.toFixed(2), xo(mean), 36, {size:9.5, col:MTC.a4, align:'center', weight:'700'});
  mtTxt(x, 'ADEQUACY, 1 TO 5', 4, 18, {size:9.5, col:MTC.muted});
  const agree = Math.max(0, Math.min(1, 1 - sd/1.4));
  mtTxt(x, 'spread \u03C3 = ' + sd.toFixed(2), w-4, 18, {size:10, col: sd>0.8?MTC.a2:MTC.a4, align:'right', weight:'700'});
  mtRR(x, L, 142, PW, 14, 6); x.fillStyle = MTC.surf2; x.fill();
  mtRR(x, L, 142, Math.max(6, PW*agree), 14, 6); x.fillStyle = MTC.a4; x.fill();
  mtTxt(x, 'inter-rater agreement', 4, 149, {size:8.5, col:MTC.muted});
  mtTxt(x, (agree*100).toFixed(0) + '%', w-4, 149, {size:9, col:MTC.text, align:'right'});
  const notes = [
    'Raw scores. R5 is consistently generous and R2 consistently harsh, so the spread is wide even though everyone is looking at the same translation.',
    'Dropping the outlier rater tightens things immediately. This is the crudest of the three corrections and often the most effective.',
    'Subtracting each rater\u2019s own mean removes systematic generosity and harshness, leaving only differences in judgment about this particular item.',
    'Dividing by each rater\u2019s variance equalizes how much of the scale they use. The spread is now close to genuine disagreement about the translation.'
  ];
  mtSet('rat-cap', notes[_rat.mode]);
}

/* ── Post-editing distance ────────────────────────────────── */
function peBuild(){
  const m = document.getElementById('pe-mt'), i = document.getElementById('pe-in');
  if(m) m.textContent = RAT_ITEM.mt;
  if(i && !i.value) i.value = RAT_ITEM.mt;
  peDraw();
}
function peEdit(a, b){
  const A = a.split(/\s+/).filter(Boolean), B = b.split(/\s+/).filter(Boolean);
  const d = Array.from({length:A.length+1}, (_,i)=>Array.from({length:B.length+1}, (_,j)=> i===0?j : j===0?i : 0));
  for(let i=1;i<=A.length;i++) for(let j=1;j<=B.length;j++)
    d[i][j] = Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1] + (A[i-1]===B[j-1]?0:1));
  return {d:d[A.length][B.length], n:Math.max(A.length, B.length)};
}
function peDraw(){
  const inp = document.getElementById('pe-in'); if(!inp) return;
  const r = peEdit(RAT_ITEM.mt, inp.value);
  const ref = peEdit(RAT_ITEM.mt, RAT_ITEM.ref);
  const c = mtCtx('pe-canvas', 108); if(!c) return;
  const {x, w} = c;
  const L = 4, PW = w-8;
  const rate = r.n ? r.d/r.n : 0;
  mtTxt(x, 'EDIT DISTANCE FROM MACHINE OUTPUT', L, 14, {size:9.5, col:MTC.muted});
  mtRR(x, L, 24, PW, 22, 7); x.fillStyle = MTC.surf2; x.fill();
  const g = x.createLinearGradient(L, 0, L+PW, 0);
  g.addColorStop(0, MTC.a4); g.addColorStop(1, MTC.a2);
  mtRR(x, L, 24, Math.max(6, PW*Math.min(1, rate)), 22, 7); x.fillStyle = g; x.fill();
  mtTxt(x, r.d + ' word edit' + (r.d===1?'':'s'), L+8, 35, {size:10, col:'#FAFBFF', weight:'700'});
  mtTxt(x, (rate*100).toFixed(0) + '% of the sentence touched', w-8, 35, {size:9.5, col:MTC.text, align:'right'});
  x.save(); x.setLineDash([4,3]); x.strokeStyle = MTC.a1; x.lineWidth = 1.5;
  const rx = L + PW*Math.min(1, ref.d/ref.n);
  x.beginPath(); x.moveTo(rx, 20); x.lineTo(rx, 50); x.stroke(); x.restore();
  mtTxt(x, 'a professional post-edit lands near here (' + ref.d + ' edits)', L, 66, {size:9, col:MTC.a1});
  mtTxt(x, 'Lower is better: it means the machine output needed less repair.', L, 86, {size:9, col:MTC.muted});
  mtSet('pe-cap', r.d===0
    ? 'No edits yet. Fix the translation in the box above, changing as little as you can, and the distance becomes your quality score.'
    : `You made ${r.d} word-level edit${r.d===1?'':'s'}. The score is in units of work rather than opinion, which is what makes it hard to argue with.`);
}

/* ══ 12.6.2 chrF ══════════════════════════════════════════ */
MT_PAGES.mtchrf = `
<div class="lesson-chapter-label">Section 12.6.2</div>
<h1 class="lesson-h1">Scoring by Overlap With a Human Translation</h1>
<p class="lesson-intro">Human evaluation is slow and expensive, so automatic metrics exist to approximate it. The oldest family works by measuring how much surface material a candidate translation shares with a human reference. <strong>chrF</strong> does this at the character level, which turns out to matter a great deal.</p>

<h2 class="lesson-h2">Character n-grams</h2>
<p class="lesson-p">chrF computes precision and recall over character n-grams up to some order <em>k</em>, ignoring whitespace. <strong>chrP</strong> is the percentage of character n-grams in the candidate that appear in the reference; <strong>chrR</strong> is the percentage of those in the reference that appear in the candidate. The two are combined with a weighted harmonic mean:</p>
<p class="lesson-p">Formally, with \\(\\text{ngr}_n(s)\\) the multiset of character n-grams of order \\(n\\) in string \\(s\\) after whitespace is removed, and matches counted with multiplicity (an n-gram appearing twice in the candidate can match at most twice in the reference):</p>
<div class="lesson-math">\\[\\text{chrP} = \\frac{1}{k}\\sum_{n=1}^{k} \\frac{\\left|\\text{ngr}_n(\\text{hyp}) \\cap \\text{ngr}_n(\\text{ref})\\right|}{\\left|\\text{ngr}_n(\\text{hyp})\\right|}, \\qquad \\text{chrR} = \\frac{1}{k}\\sum_{n=1}^{k} \\frac{\\left|\\text{ngr}_n(\\text{hyp}) \\cap \\text{ngr}_n(\\text{ref})\\right|}{\\left|\\text{ngr}_n(\\text{ref})\\right|}\\]</div>
<p class="lesson-p">The averaging over orders matters: each n-gram length contributes equally to the final precision and recall, rather than the (far more numerous) short n-grams dominating. The two averages are then combined:</p>
<div class="lesson-math">\\[\\text{chrF}\\beta = (1+\\beta^{2})\\,\\frac{\\text{chrP}\\cdot\\text{chrR}}{\\beta^{2}\\cdot\\text{chrP}+\\text{chrR}}\\]</div>
<p class="lesson-p">This is the weighted harmonic mean, and its limiting behaviour explains what \\(\\beta\\) does. Divide the numerator and denominator by \\(\\beta^2\\):</p>
<div class="lesson-math">\\[\\text{chrF}\\beta = \\frac{\\left(1 + \\tfrac{1}{\\beta^2}\\right)\\text{chrP}\\cdot\\text{chrR}}{\\text{chrP} + \\tfrac{1}{\\beta^2}\\,\\text{chrR}}\\]</div>
<p class="lesson-p">As \\(\\beta \\to \\infty\\) the \\(1/\\beta^2\\) terms vanish and the expression collapses to \\(\\text{chrR}\\) alone; as \\(\\beta \\to 0\\) the same algebra on the original form collapses it to \\(\\text{chrP}\\); and \\(\\beta = 1\\) gives the balanced F1. The standard choice \\(\\beta = 2\\) therefore says that covering the reference matters more than avoiding unsupported material, which fits translation: an output that silently omits half the meaning is worse than one that includes a redundant word. Step through the calculation below on a real pair.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The chrF Calculator</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" onclick="chrPick(0)">HYP1: witness of the past,</button>
      <button style="${MTBTN}" onclick="chrPick(1)">HYP2: past witness,</button>
      <span style="${MTLBL}">order k</span><input id="chr-k" type="range" min="1" max="4" step="1" value="2" oninput="chrDraw()" style="width:90px;accent-color:var(--accent)">
      <span style="${MTLBL}">&beta;</span><input id="chr-b" type="range" min="1" max="3" step="1" value="2" oninput="chrDraw()" style="width:70px;accent-color:var(--accent)">
    </div>
    <canvas id="chr-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="chr-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Why Characters Rather Than Words</h2>
<p class="lesson-p"><strong>BLEU</strong>, the older standard, counts word n-grams and adds a brevity penalty to stop short outputs scoring well on precision alone. Word-level counting has two problems. It depends entirely on how the text was tokenized, so the same translation scores differently under different tokenizers and BLEU numbers from different papers are frequently not comparable. And in a morphologically rich language, a correct translation that differs only in an inflectional suffix counts as a complete miss, since the word forms do not match.</p>
<p class="lesson-p">For comparison, here is BLEU in full. It computes modified word n-gram precisions \\(p_n\\) up to order \\(N = 4\\), where <em>modified</em> means each candidate n-gram&rsquo;s count is clipped at the number of times it appears in the reference, so repeating a correct word cannot inflate the score. The precisions are combined by geometric mean and multiplied by a brevity penalty, with \\(c\\) the candidate length and \\(r\\) the reference length:</p>
<div class="lesson-math">\\[\\text{BLEU} = \\text{BP} \\cdot \\exp\\left(\\frac{1}{N}\\sum_{n=1}^{N} \\log p_n\\right), \\qquad \\text{BP} = \\begin{cases} 1 &amp; c &gt; r \\\\ e^{\\,1 - r/c} &amp; c \\le r \\end{cases}\\]</div>
<p class="lesson-p">BLEU uses a brevity penalty to discourage overly short candidates, which could otherwise gain favorable precision scores by omitting difficult material. Its geometric mean becomes zero if any included n-gram precision is zero. Corpus-level aggregation reduces that problem; sentence-level BLEU usually needs a specified smoothing convention.</p>
<p class="lesson-p">Character n-grams avoid both. They do not need tokenization, and a word that is nearly right still shares most of its characters.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Tokenization Sensitivity</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="tks-btns"></div>
    <canvas id="tks-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tks-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Where Overlap Metrics Fail</h2>
<p class="lesson-p">Three stress tests below show the limits. Moving a large phrase to a different position barely changes the character n-gram counts, so the metric hardly notices a reordering that changes meaning. Comparing two architecturally different systems can rank them incorrectly, because one may happen to use vocabulary closer to the reference without being a better translation. And a document whose sentences are individually fine but do not cohere scores well on every sentence, because the metric never looks beyond the sentence.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Three Stress Tests</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="lim-btns"></div>
    <canvas id="lim-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="lim-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Is the Difference Real?</h2>
<p class="lesson-p">System A scores a little above System B on the test set. That could be a genuine difference or an easier test set. The bootstrap answers it: resample the test set with replacement several thousand times, score both systems on each pseudo-test-set, and count how often A wins. This is the same procedure used for classifiers, applied to translation output.</p>
<p class="lesson-p">The quantity reported is a p-value estimated by counting. Let \\(\\delta^{(b)}\\) be the score difference between the systems on the \\(b\\)-th of \\(B\\) resampled test sets. Then</p>
<div class="lesson-math">\\[\\hat{p} = \\frac{1}{B} \\sum_{b=1}^{B} \\mathbf{1}\\left[\\, \\delta^{(b)} \\le 0 \\,\\right]\\]</div>
<p class="lesson-p">is the fraction of plausible test sets on which the advantage disappears or reverses. A small \\(\\hat{p}\\) means the observed gap is stable under resampling; a large one means the gap is an accident of which sentences happened to land in the test set.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Bootstrap Tester</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="bootRun(2000)">resample 2000 times</button>
      <button style="${MTBTN}" onclick="bootReset()">reset</button>
      <span style="${MTLBL}">test set size</span>
      <input id="boot-n" type="range" min="20" max="500" step="20" value="120" oninput="bootReset()" style="width:120px;accent-color:var(--accent)">
      <span id="boot-nl" style="${MTLBL}"></span>
    </div>
    <canvas id="boot-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="boot-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qmt-chr"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why are BLEU scores from two different papers often not comparable?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-chr','Correct. BLEU counts word n-grams, so the score depends on how the text was split into words, and that choice varies between implementations.')">BLEU depends on tokenization, which differs between implementations</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-chr','The brevity penalty is part of the standard definition and is applied consistently.')">The brevity penalty is optional</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-chr','BLEU is deterministic given the same inputs and settings.')">BLEU includes a random component</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-chr','Reference count matters but is usually reported; tokenization usually is not.')">BLEU requires exactly one reference translation</button>
</div><div class="quiz-explain" id="qmt-chr-explain"></div></div>`;

/* ── chrF calculator ──────────────────────────────────────── */
const CHR_REF = 'witness for the past,';
const CHR_HYP = ['witness of the past,', 'past witness,'];
let _chr = 0;
function chrPick(i){ _chr = i; chrDraw(); }
function chrNG(s, n){
  const t = s.replace(/\s+/g, '');
  const out = [];
  for(let i=0; i+n<=t.length; i++) out.push(t.slice(i, i+n));
  return out;
}
function chrMatch(a, b){
  const bag = {}; b.forEach(g=>bag[g] = (bag[g]||0)+1);
  let m = 0; a.forEach(g=>{ if(bag[g] > 0){ m++; bag[g]--; } });
  return m;
}
function chrDraw(){
  const k = +(document.getElementById('chr-k')||{value:2}).value;
  const beta = +(document.getElementById('chr-b')||{value:2}).value;
  const hyp = CHR_HYP[_chr];
  const rows = [];
  let sp = 0, sr = 0;
  for(let n=1; n<=k; n++){
    const H = chrNG(hyp, n), R = chrNG(CHR_REF, n);
    const m = chrMatch(H, R);
    const p = H.length ? m/H.length : 0, r = R.length ? m/R.length : 0;
    rows.push({n, m, hl:H.length, rl:R.length, p, r});
    sp += p; sr += r;
  }
  const chrP = sp/k, chrR = sr/k;
  const b2 = beta*beta;
  const F = (chrP+chrR) ? (1+b2)*chrP*chrR/(b2*chrP + chrR) : 0;
  const c = mtCtx('chr-canvas', 100 + rows.length*24 + 62); if(!c) return;
  const {x, w} = c;
  mtTxt(x, 'REF', 8, 18, {size:9, col:MTC.muted});
  mtTxt(x, CHR_REF, 46, 18, {size:12, col:MTC.text});
  mtTxt(x, 'HYP', 8, 38, {size:9, col:MTC.muted});
  mtTxt(x, hyp, 46, 38, {size:12, col:MTC.a1});
  mtTxt(x, 'spaces removed \u2192  ' + CHR_REF.replace(/\s+/g,'') + '   /   ' + hyp.replace(/\s+/g,''),
        8, 58, {size:9, col:MTC.muted});
  const hdr = 82;
  ['n','matches','in hyp','in ref','chrP','chrR'].forEach((t, i)=>
    mtTxt(x, t, 40 + i*Math.min(96,(w-60)/6), hdr, {size:8.5, col:MTC.muted}));
  rows.forEach((r, i)=>{
    const y = hdr + 20 + i*24;
    const cw = Math.min(96, (w-60)/6);
    mtChip(x, 8, y-11, w-16, 21, i%2 ? 'rgba(23,27,52,0.03)' : 'transparent', null);
    [String(r.n), String(r.m), String(r.hl), String(r.rl), (r.p*100).toFixed(1)+'%', (r.r*100).toFixed(1)+'%']
      .forEach((t, j)=> mtTxt(x, t, 40 + j*cw, y, {size:10, col: j>3?MTC.a1:MTC.text}));
  });
  const fy = hdr + 26 + rows.length*24;
  x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(8, fy); x.lineTo(w-8, fy); x.stroke();
  mtTxt(x, 'chrP = ' + (chrP*100).toFixed(1) + '%    chrR = ' + (chrR*100).toFixed(1) + '%    \u03B2 = ' + beta,
        8, fy+20, {size:10.5, col:MTC.muted});
  mtTxt(x, 'chrF' + beta + ' = ' + F.toFixed(3), 8, fy+44, {size:16, col:MTC.a2, weight:'700'});
  const bw = Math.min(220, w-240);
  mtRR(x, w-8-bw, fy+30, bw, 18, 6); x.fillStyle = MTC.surf2; x.fill();
  mtRR(x, w-8-bw, fy+30, Math.max(4, bw*F), 18, 6); x.fillStyle = MTC.a2; x.fill();
  mtSet('chr-cap', _chr===1
    ? 'HYP2 keeps almost the same characters but reorders them and drops a word, and chrF falls to 0.64 at k = 2. Character unigram precision stays at a perfect 1.000, because every character in the candidate does appear in the reference; the entire penalty comes from recall. That split is worth noticing: precision alone would have called this translation flawless.'
    : 'Raise the order k and the score falls, because longer character sequences are harder to match. Raise \u03B2 and recall matters more, which favours candidates that cover the reference rather than ones that merely avoid saying anything wrong.');
}

/* ── Tokenization sensitivity ─────────────────────────────── */
const TKS = [
  {lab:'plain whitespace', bleu:38.2, chrf:61.4},
  {lab:'aggressive punctuation split', bleu:31.7, chrf:61.1},
  {lab:'subword (BPE)', bleu:44.6, chrf:61.6},
  {lab:'no tokenization at all', bleu:22.3, chrf:61.3}
];
let _tks = 0;
function tksBuild(){
  const b = document.getElementById('tks-btns');
  if(b) b.innerHTML = '<span style="'+MTLBL+'">tokenizer</span>' + TKS.map((t,i)=>
    `<button style="${MTBTN}" id="tks-b${i}" onclick="tksGo(${i})">${t.lab}</button>`).join('');
  _tks = 0; tksDraw();
}
function tksGo(i){ _tks = i; tksDraw(); }
function tksDraw(){
  TKS.forEach((_,i)=>{ const e = document.getElementById('tks-b'+i); if(e){
    e.style.background = i===_tks ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_tks ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('tks-canvas', 160); if(!c) return;
  const {x, w} = c;
  const T = TKS[_tks];
  const L = 96, PW = w-L-70;
  mtTxt(x, 'SAME TRANSLATION, SAME REFERENCE, DIFFERENT TOKENIZER', 8, 16, {size:9.5, col:MTC.muted});
  [['BLEU', T.bleu, MTC.a2, 50, 50], ['chrF', T.chrf, MTC.a1, 100, 70]].forEach(([lab, v, col, y, max])=>{
    mtTxt(x, lab, L-8, y+11, {size:10.5, col:MTC.text, align:'right'});
    mtRR(x, L, y, PW, 22, 6); x.fillStyle = 'rgba(23,27,52,0.045)'; x.fill();
    mtRR(x, L, y, Math.max(6, PW*(v/max)), 22, 6); x.fillStyle = col+'CC'; x.fill();
    mtTxt(x, v.toFixed(1), L+PW+8, y+11, {size:11, col:col, weight:'700'});
  });
  const bl = TKS.map(t=>t.bleu), cf = TKS.map(t=>t.chrf);
  mtTxt(x, 'BLEU range across tokenizers: ' + (Math.max(...bl)-Math.min(...bl)).toFixed(1) + ' points',
        8, 138, {size:9.5, col:MTC.a2});
  mtTxt(x, 'chrF range: ' + (Math.max(...cf)-Math.min(...cf)).toFixed(1) + ' points',
        w-8, 138, {size:9.5, col:MTC.a1, align:'right'});
  mtSet('tks-cap', 'Nothing about the translation changed. BLEU moves more than twenty points purely on the tokenizer, while chrF moves half a point, because it never used word boundaries in the first place.');
}

/* ── Limits panel ─────────────────────────────────────────── */
const LIM = [
  {lab:'phrase moved', ref:'The committee approved the proposal after a long debate.',
   hyp:'After a long debate the committee approved the proposal.',
   chrf:.79, human:.96, note:'The sentence means the same thing and reads well, so a human scores it high. chrF barely moves, which here is correct. The failure is the reverse case below.'},
  {lab:'meaning reversed', ref:'The committee approved the proposal after a long debate.',
   hyp:'The committee rejected the proposal after a long debate.',
   chrf:.87, human:.05, note:'One word changed and the meaning inverted. chrF scores it <b>higher</b> than the harmless reordering above, because almost every character n-gram still matches. This is the fluent-but-wrong quadrant, and the metric cannot see it.'},
  {lab:'discourse broken', ref:'She opened the door. Then she went inside and sat down.',
   hyp:'She opened the door. Then he went inside and sat down.',
   chrf:.96, human:.30, note:'Each sentence is fine on its own, and a sentence-level metric scores each one near perfect. The referent changed between sentences, which nothing in the metric ever looks at.'}
];
let _lim = 0;
function limBuild(){
  const b = document.getElementById('lim-btns');
  if(b) b.innerHTML = LIM.map((l,i)=>`<button style="${MTBTN}" id="lim-b${i}" onclick="limGo(${i})">${l.lab}</button>`).join('');
  _lim = 0; limDraw();
}
function limGo(i){ _lim = i; limDraw(); }
function limDraw(){
  LIM.forEach((_,i)=>{ const e = document.getElementById('lim-b'+i); if(e){
    e.style.background = i===_lim ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_lim ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('lim-canvas', 168); if(!c) return;
  const {x, w} = c;
  const L = LIM[_lim];
  mtTxt(x, 'REF', 8, 18, {size:9, col:MTC.muted});
  mtTxt(x, L.ref, 44, 18, {size:10.5, col:MTC.text});
  mtTxt(x, 'HYP', 8, 38, {size:9, col:MTC.muted});
  mtTxt(x, L.hyp, 44, 38, {size:10.5, col:MTC.a1});
  const BL = 96, PW = w-BL-72;
  [['chrF', L.chrf, MTC.a1, 70], ['human', L.human, MTC.a2, 108]].forEach(([lab, v, col, y])=>{
    mtTxt(x, lab, BL-8, y+11, {size:10.5, col:MTC.text, align:'right'});
    mtRR(x, BL, y, PW, 22, 6); x.fillStyle = 'rgba(23,27,52,0.045)'; x.fill();
    mtRR(x, BL, y, Math.max(6, PW*v), 22, 6); x.fillStyle = col+'CC'; x.fill();
    mtTxt(x, (v*100).toFixed(0), BL+PW+8, y+11, {size:11, col:col, weight:'700'});
  });
  const gapv = Math.abs(L.chrf - L.human);
  mtTxt(x, 'disagreement ' + (gapv*100).toFixed(0) + ' points', w-8, 152,
        {size:10, col: gapv>.4?MTC.a2:MTC.muted, align:'right', weight: gapv>.4?'700':''});
  mtSet('lim-cap', L.note);
}

/* ── Bootstrap tester ─────────────────────────────────────── */
let _boot = {hist:[], wins:0, runs:0};
function bootBuild(){ bootReset(); }
function bootReset(){ _boot = {hist:[], wins:0, runs:0}; bootDraw(); }
function bootRun(n){
  const N = +(document.getElementById('boot-n')||{value:120}).value;
  let s = 12345;
  const rnd = ()=>{ s = (s*1103515245+12345) & 0x7fffffff; return s/0x7fffffff; };
  const A = [], B = [];
  for(let i=0;i<N;i++){ A.push(0.58 + (rnd()-0.5)*0.34); B.push(0.55 + (rnd()-0.5)*0.34); }
  const hist = new Array(41).fill(0);
  let wins = 0;
  for(let r=0;r<n;r++){
    let sa = 0, sb = 0;
    for(let i=0;i<N;i++){ const j = Math.floor(rnd()*N); sa += A[j]; sb += B[j]; }
    const d = (sa-sb)/N;
    if(d > 0) wins++;
    const bin = Math.max(0, Math.min(40, Math.round((d+0.10)/0.20*40)));
    hist[bin]++;
  }
  _boot = {hist, wins, runs:n, N};
  bootDraw();
}
function bootDraw(){
  const N = +(document.getElementById('boot-n')||{value:120}).value;
  mtSet('boot-nl', N + ' sentences');
  const c = mtCtx('boot-canvas', 190); if(!c) return;
  const {x, w} = c;
  const L = 22, PW = w-L-22, T = 26, PH = 116;
  x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, T+PH); x.lineTo(L+PW, T+PH); x.stroke();
  const zero = L + PW*0.5;
  x.save(); x.setLineDash([4,4]); x.strokeStyle = MTC.line2;
  x.beginPath(); x.moveTo(zero, T); x.lineTo(zero, T+PH); x.stroke(); x.restore();
  mtTxt(x, '\u03B4 = 0', zero, T+PH+16, {size:9, col:MTC.muted, align:'center'});
  mtTxt(x, 'A worse', L+4, T+PH+16, {size:9, col:MTC.muted});
  mtTxt(x, 'A better', L+PW-4, T+PH+16, {size:9, col:MTC.muted, align:'right'});
  mtTxt(x, 'BOOTSTRAP DISTRIBUTION OF \u03B4 = score(A) \u2212 score(B)', 4, 16, {size:9.5, col:MTC.muted});
  if(_boot.runs){
    const mx = Math.max(..._boot.hist);
    const bw = PW/_boot.hist.length;
    _boot.hist.forEach((v, i)=>{
      const bh = (v/mx)*PH;
      const px = L + i*bw;
      x.fillStyle = (i >= _boot.hist.length/2) ? 'rgba(11,132,87,0.75)' : 'rgba(159,18,57,0.65)';
      x.fillRect(px, T+PH-bh, bw-1, bh);
    });
    const p = 1 - _boot.wins/_boot.runs;
    mtTxt(x, 'A wins in ' + (_boot.wins/_boot.runs*100).toFixed(1) + '% of resamples', 4, T+PH+34, {size:10, col:MTC.a4});
    mtTxt(x, 'p \u2248 ' + p.toFixed(3) + (p<0.05 ? '  \u00b7 significant at 0.05' : '  \u00b7 not significant'),
          w-4, T+PH+34, {size:10.5, col: p<0.05?MTC.a4:MTC.a2, align:'right', weight:'700'});
    mtSet('boot-cap', p<0.05
      ? `With ${N} test sentences the difference holds up: A beats B in the large majority of resampled test sets, so the observed gap is unlikely to be an artefact of which sentences landed in the test set.`
      : `With only ${N} test sentences the distribution straddles zero, so A and B cannot be separated. Increase the test set size and the distribution narrows, because each resample is a better estimate of the true difference.`);
  } else {
    mtSet('boot-cap', 'System A scores about 3 chrF points above System B on the test set. Press resample to find out whether that difference survives.');
  }
}

/* ══ 12.6.3 EMBEDDING-BASED METRICS ═══════════════════════ */
MT_PAGES.mtbert = `
<div class="lesson-chapter-label">Section 12.6.3</div>
<h1 class="lesson-h1">Scoring by Meaning Instead of Exact Match</h1>
<p class="lesson-intro">Embedding-based metrics compare representations of a candidate and reference, which can recognize similarities missed by literal overlap. They are useful proxies for meaning, but can still miss important errors.</p>

<h2 class="lesson-h2">BERTScore</h2>
<p class="lesson-p">Encode every token of the reference and of the candidate with a contextual encoder, then build the matrix of cosine similarities between every reference token and every candidate token. For recall, each reference token takes its best match among the candidate tokens; for precision, the reverse. Average, and combine into an F score.</p>
<p class="lesson-p">Written out, with \\(\\mathbf{x}_i\\) the contextual embedding of the \\(i\\)-th reference token and \\(\\hat{\\mathbf{y}}_j\\) that of the \\(j\\)-th candidate token, all normalized to unit length so the dot product equals the cosine similarity:</p>
<div class="lesson-math">\\[R_{\\text{BERT}} = \\frac{1}{|x|}\\sum_{x_i \\in x}\\, \\max_{\\hat{y}_j \\in \\hat{y}} \\mathbf{x}_i^{\\top}\\hat{\\mathbf{y}}_j, \\qquad P_{\\text{BERT}} = \\frac{1}{|\\hat{y}|}\\sum_{\\hat{y}_j \\in \\hat{y}}\\, \\max_{x_i \\in x} \\mathbf{x}_i^{\\top}\\hat{\\mathbf{y}}_j\\]</div>
<div class="lesson-math">\\[F_{\\text{BERT}} = \\frac{2\\, P_{\\text{BERT}}\\, R_{\\text{BERT}}}{P_{\\text{BERT}} + R_{\\text{BERT}}}\\]</div>
<p class="lesson-p">The max is a greedy matching: each token simply takes its best counterpart, with no requirement that the matching be one-to-one. That keeps the computation a single pass over the similarity matrix rather than an assignment problem.</p>
<p class="lesson-p">The pair below is the standard illustration. <em>cold</em> and <em>freezing</em> share almost no characters, so chrF scores the pair poorly, but their embeddings are close.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The BERTScore Matrix</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" id="bs-d" onclick="bsDir()">direction: recall</button>
      <button style="${MTBTN}" id="bs-i" onclick="bsIdf()">idf weighting: off</button>
    </div>
    <canvas id="bs-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="bs-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The idf toggle in the matrix corresponds to replacing the plain average with a weighted one. Rare words get high weight, ubiquitous ones get almost none:</p>
<div class="lesson-math">\\[R_{\\text{BERT}} = \\frac{\\sum_{x_i \\in x} \\text{idf}(x_i)\\, \\max_{\\hat{y}_j} \\mathbf{x}_i^{\\top}\\hat{\\mathbf{y}}_j}{\\sum_{x_i \\in x} \\text{idf}(x_i)}, \\qquad \\text{idf}(w) = \\log \\frac{M}{\\left|\\{\\, d : w \\in d \\,\\}\\right|}\\]</div>
<p class="lesson-p">computed over a collection of \\(M\\) reference sentences. A word appearing in every sentence gets \\(\\log 1 = 0\\) and drops out of the score entirely, which is exactly what happens to <em>the</em> and <em>is</em> when the toggle is on.</p>

<h2 class="lesson-h2">Trained Metrics</h2>
<p class="lesson-p">BERTScore uses embeddings but is not itself trained to predict human judgments. <strong>COMET</strong> and <strong>BLEURT</strong> go further: they take the source, the candidate, and the reference, encode all three, and pass the result through a regression head trained directly on human quality ratings. The metric is a model whose target is what a human rater would have said.</p>
<p class="lesson-p">The chart below compares how well each metric&rsquo;s scores correlate with human ratings on the same data.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Correlation With Human Judgment</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="cor-btns"></div>
    <canvas id="cor-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="cor-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Trained metrics correlate better with human judgment, which is the thing anyone actually cares about. The cost is that they are models, with all that implies: they inherit the biases of their training ratings, they can be gamed by systems optimized against them, and when they fail there is no simple count you can inspect to work out why. A character n-gram overlap is crude, but you can always recompute it by hand.</p>

<div class="quiz-block" id="qmt-bs"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does BERTScore rate <em>it is freezing today</em> highly against the reference <em>the weather is cold today</em>?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-bs','Correct. The comparison is between contextual embeddings, and cold and freezing sit close together in that space despite sharing no characters.')">Because <em>cold</em> and <em>freezing</em> have similar embeddings despite different spellings</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-bs','The two share almost no character n-grams, which is exactly why chrF scores the pair poorly.')">Because the two sentences share most of their characters</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-bs','Length is not what the matrix measures, and the two sentences differ in length.')">Because the two sentences are the same length</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-bs','BERTScore is not trained on human ratings; COMET and BLEURT are.')">Because it was trained directly on human quality ratings</button>
</div><div class="quiz-explain" id="qmt-bs-explain"></div></div>`;

/* ── BERTScore matrix ─────────────────────────────────────── */
const BS_REF = ['the','weather','is','cold','today'];
const BS_CAN = ['it','is','freezing','today'];
const BS_SIM = [
  [0.62,0.28,0.31,0.22],
  [0.30,0.26,0.41,0.35],
  [0.27,0.98,0.24,0.29],
  [0.24,0.25,0.83,0.26],
  [0.21,0.30,0.28,0.99]
];
const BS_IDF = [0.18, 0.92, 0.21, 0.95, 0.74];
let _bs = {dir:'recall', idf:false};
function bsBuild(){ _bs = {dir:'recall', idf:false}; bsDraw(); }
function bsDir(){ _bs.dir = _bs.dir==='recall' ? 'precision' : 'recall'; bsDraw(); }
function bsIdf(){ _bs.idf = !_bs.idf; bsDraw(); }
function bsDraw(){
  const d = document.getElementById('bs-d'), i2 = document.getElementById('bs-i');
  if(d) d.textContent = 'direction: ' + _bs.dir;
  if(i2){ i2.textContent = 'idf weighting: ' + (_bs.idf?'on':'off');
          i2.style.background = _bs.idf?'var(--accent)':'var(--surface2)'; i2.style.color = _bs.idf?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('bs-canvas', 230); if(!c) return;
  const {x, w} = c;
  const L = 86, T = 44, cell = Math.min(62, (w-L-90)/BS_CAN.length), rh = 28;
  BS_CAN.forEach((t, j)=> mtTxt(x, t, L + j*cell + cell/2, 34, {size:9.5, col:MTC.muted, align:'center'}));
  mtTxt(x, 'candidate \u2192', L, 16, {size:9, col:MTC.muted});
  mtTxt(x, 'reference \u2193', 6, 16, {size:9, col:MTC.muted});
  const rec = _bs.dir==='recall';
  let num = 0, den = 0;
  BS_REF.forEach((rt, i)=>{
    mtTxt(x, rt, L-8, T + i*rh + rh/2, {size:9.5, col:MTC.text, align:'right'});
    let bestJ = 0;
    BS_SIM[i].forEach((v, j)=>{ if(v > BS_SIM[i][bestJ]) bestJ = j; });
    BS_SIM[i].forEach((v, j)=>{
      const px = L + j*cell, py = T + i*rh;
      x.fillStyle = 'rgba(79,70,229,' + (v*0.85).toFixed(3) + ')';
      x.fillRect(px, py, cell-2, rh-2);
      mtTxt(x, v.toFixed(2), px+(cell-2)/2, py+(rh-2)/2, {size:8.5, col: v>0.5?'#FAFBFF':MTC.text, align:'center'});
      if(rec && j===bestJ){
        x.strokeStyle = MTC.a5; x.lineWidth = 2; x.strokeRect(px, py, cell-2, rh-2);
      }
    });
    if(rec){
      const wgt = _bs.idf ? BS_IDF[i] : 1;
      num += BS_SIM[i][bestJ]*wgt; den += wgt;
      if(_bs.idf) mtTxt(x, 'idf ' + BS_IDF[i].toFixed(2), L + BS_CAN.length*cell + 8, T + i*rh + rh/2,
                        {size:8.5, col: BS_IDF[i]>0.5?MTC.a2:MTC.muted});
    }
  });
  if(!rec){
    BS_CAN.forEach((ct, j)=>{
      let bestI = 0;
      BS_REF.forEach((_, i)=>{ if(BS_SIM[i][j] > BS_SIM[bestI][j]) bestI = i; });
      x.strokeStyle = MTC.a5; x.lineWidth = 2;
      x.strokeRect(L + j*cell, T + bestI*rh, cell-2, rh-2);
      num += BS_SIM[bestI][j]; den += 1;
    });
  }
  const score = den ? num/den : 0;
  const fy = T + BS_REF.length*rh + 22;
  mtTxt(x, 'BERTScore ' + _bs.dir + ' = ' + score.toFixed(3), 6, fy, {size:13, col:MTC.a1, weight:'700'});
  mtTxt(x, 'chrF on the same pair = 0.21', w-6, fy, {size:11, col:MTC.a2, align:'right', weight:'700'});
  mtSet('bs-cap', _bs.idf
    ? 'With idf weighting, <em>the</em> and <em>is</em> contribute almost nothing while <em>cold</em>, <em>weather</em> and <em>today</em> dominate. The score now reflects whether the content survived rather than whether the function words matched.'
    : (rec ? 'Each reference token takes its best match in the candidate. <em>cold</em> finds <em>freezing</em> at 0.83, which is the entire argument for embedding-based metrics: chrF scores this pair at 0.21 because the two words share no characters.'
           : 'Precision reverses the direction: each candidate token finds its best reference match. Switching direction changes which tokens go unmatched, which is why the F combination of both is what gets reported.'));
}

/* ── Metric correlation ───────────────────────────────────── */
const COR = [
  {n:'BLEU',      r:0.31, seed:3},
  {n:'chrF',      r:0.48, seed:11},
  {n:'BERTScore', r:0.66, seed:23},
  {n:'COMET',     r:0.83, seed:41}
];
let _cor = 3;
function corBuild(){
  const b = document.getElementById('cor-btns');
  if(b) b.innerHTML = '<span style="'+MTLBL+'">metric</span>' + COR.map((m,i)=>
    `<button style="${MTBTN}" id="cor-b${i}" onclick="corGo(${i})">${m.n}</button>`).join('');
  _cor = 3; corDraw();
}
function corGo(i){ _cor = i; corDraw(); }
function corDraw(){
  COR.forEach((_,i)=>{ const e = document.getElementById('cor-b'+i); if(e){
    e.style.background = i===_cor ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_cor ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('cor-canvas', 240); if(!c) return;
  const {x, w} = c;
  const M = COR[_cor];
  const S = Math.min(180, w-260), ox = 54, oy = 24;
  x.strokeStyle = MTC.line2; x.lineWidth = 1; x.strokeRect(ox, oy, S, S);
  mtTxt(x, 'human rating \u2192', ox+S/2, oy+S+18, {size:9.5, col:MTC.muted, align:'center'});
  x.save(); x.translate(ox-24, oy+S/2); x.rotate(-Math.PI/2);
  mtTxt(x, 'metric score \u2192', 0, 0, {size:9.5, col:MTC.muted, align:'center'}); x.restore();
  let s = M.seed;
  const rnd = ()=>{ s = (s*9301+49297)%233280; return s/233280; };
  for(let i=0;i<90;i++){
    const h = rnd();
    const noise = (rnd()+rnd()+rnd())/3 - 0.5;
    const m = Math.max(0, Math.min(1, h*M.r + 0.5*(1-M.r) + noise*(1-M.r)*1.5));
    x.beginPath(); x.arc(ox + h*S, oy + (1-m)*S, 2.6, 0, 7);
    x.fillStyle = 'rgba(79,70,229,0.45)'; x.fill();
  }
  x.strokeStyle = MTC.a2; x.lineWidth = 2;
  x.beginPath(); x.moveTo(ox, oy+S*(1-(0.5*(1-M.r)))); x.lineTo(ox+S, oy+S*(1-(M.r+0.5*(1-M.r)))); x.stroke();
  const lx = ox + S + 30;
  mtTxt(x, 'PEARSON r', lx, oy+16, {size:9.5, col:MTC.muted});
  mtTxt(x, M.r.toFixed(2), lx, oy+44, {size:26, col:MTC.a1, weight:'700'});
  COR.forEach((m, i)=>{
    const y = oy + 78 + i*22;
    const bw = Math.min(120, w-lx-40);
    mtTxt(x, m.n, lx, y, {size:9, col: i===_cor?MTC.a1:MTC.muted});
    mtRR(x, lx+62, y-7, bw*0.55, 12, 4); x.fillStyle = 'rgba(23,27,52,0.05)'; x.fill();
    mtRR(x, lx+62, y-7, Math.max(3, bw*0.55*m.r), 12, 4);
    x.fillStyle = i===_cor ? MTC.a1 : 'rgba(23,27,52,0.22)'; x.fill();
  });
  mtSet('cor-cap', M.r > 0.7
    ? 'A trained metric correlates most closely with human judgment, which is what an automatic metric is for. It is also a model, so it inherits the biases of the ratings it was trained on and can be gamed by systems tuned against it.'
    : 'The scatter is wide: this metric and human raters frequently disagree about the same translation. Move up the list and the cloud tightens around the line.');
}

/* ══ 12.7 BIAS ════════════════════════════════════════════ */
MT_PAGES.mtbias = `
<div class="lesson-chapter-label">Section 12.7</div>
<h1 class="lesson-h1">Whose Assumptions the System Encodes</h1>
<p class="lesson-intro">A translation sometimes has to state information that the source leaves open, including gender. Training-data associations can influence those choices. Examine the evidence and the effect on different groups.</p>

<h2 class="lesson-h2">A Neutral Pronoun Goes In</h2>
<p class="lesson-p">Hungarian <em>&#337;</em> is gender-neutral. Translating a Hungarian sentence into English forces a choice between <em>he</em>, <em>she</em>, and <em>they</em>, and nothing in the source settles it. What the system produces instead reflects the statistical association between the occupation and a gender in its training data.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Pronoun Default</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pro-btns"></div>
    <canvas id="pro-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pro-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Amplification, Not Just Reflection</h2>
<p class="lesson-p">The important finding is not that systems reproduce the skew in their data. It is that they exceed it. Prates and colleagues compared translation output against labour statistics for each occupation and found the machine assignment rate consistently more extreme than the real-world figure. A profession that is 70% one gender in the workforce might be assigned that gender 90% of the time by the system.</p>
<p class="lesson-p">This happens because training sharpens frequent patterns into confident predictions. A model that hedged in proportion to the real distribution would produce lower-probability outputs, and nothing in the objective rewards that. The two bars in the chart above make the gap visible: the statistic and the system rate are different quantities, and the second is further from parity than the first.</p>
<p class="lesson-p">As a measurement this is one subtraction. Let \\(p_{\\text{stat}}\\) be the workforce fraction of the majority gender for an occupation and \\(p_{\\text{sys}}\\) the rate at which the system assigns that gender. The amplification is \\(A = p_{\\text{sys}} - p_{\\text{stat}}\\), and the empirical finding is that \\(A &gt; 0\\) nearly everywhere the statistic itself is skewed: the system does not merely inherit the skew, it moves further from parity than its own training world.</p>

<h2 class="lesson-h2">Measuring It: WinoMT</h2>
<p class="lesson-p">The <strong>WinoMT</strong> benchmark isolates the effect. It pairs sentences that differ only in whether the gender role is stereotypical, and measures accuracy separately on each. A system with no stereotype bias would score the same on both. Real systems score far higher on the stereotypical half.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The WinoMT Challenge</span></div>
  <div class="viz-body">
    <div id="win-item" style="background:var(--panel);border-radius:10px;padding:1rem 1.1rem;color:#ECF1FF;margin-bottom:.9rem;min-height:4.2rem"></div>
    <div id="win-btns" style="${MTROW}"></div>
    <canvas id="win-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="win-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Knowing What You Do Not Know</h2>
<p class="lesson-p">One response to a forced choice under uncertainty is to decline to make it. A system that reports low confidence can abstain, flag the ambiguity, or offer both readings rather than silently picking one. In a medical or legal setting that is often the correct behaviour, and the trade-off is explicit: coverage falls, and so does the number of confidently wrong translations reaching someone who cannot check them.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Abstention Threshold</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">confidence threshold</span>
      <input id="abs-t" type="range" min="0" max="0.95" step="0.05" value="0" oninput="absDraw()" style="width:170px;accent-color:var(--accent)">
      <span id="abs-tl" style="${MTLBL}"></span>
    </div>
    <canvas id="abs-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="abs-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qmt-bias"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does it mean to say that a translation system <em>amplifies</em> a bias rather than reflecting it?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qmt-bias','Correct. Amplification means the system assigns the stereotypical option more often than the real-world statistic, not merely as often.')">It assigns the stereotypical option more often than the underlying statistic</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-bias','Reproducing the rate exactly would be reflection; amplification is the case where the rate is exceeded.')">It reproduces the training distribution exactly</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-bias','The effect is measured in ordinary output, not only under adversarial input.')">It only occurs on deliberately adversarial inputs</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qmt-bias','Volume of output is not what is being measured; the rate of the choice is.')">It produces more output than it was asked for</button>
</div><div class="quiz-explain" id="qmt-bias-explain"></div></div>`;

/* ── Pronoun default ──────────────────────────────────────── */
const PRO = [
  {occ:'nurse',      hu:'\u0151 egy \u00E1pol\u00F3', out:'she is a nurse',    p:'she', stat:0.87, sys:0.97},
  {occ:'CEO',        hu:'\u0151 egy vez\u00E9rigazgat\u00F3', out:'he is a CEO', p:'he', stat:0.73, sys:0.94},
  {occ:'engineer',   hu:'\u0151 egy m\u00E9rn\u00F6k', out:'he is an engineer', p:'he', stat:0.84, sys:0.98},
  {occ:'teacher',    hu:'\u0151 egy tan\u00E1r', out:'she is a teacher',  p:'she', stat:0.74, sys:0.89},
  {occ:'scientist',  hu:'\u0151 egy tud\u00F3s', out:'he is a scientist', p:'he', stat:0.72, sys:0.93},
  {occ:'cleaner',    hu:'\u0151 egy takar\u00EDt\u00F3', out:'she is a cleaner', p:'she', stat:0.88, sys:0.96},
  {occ:'doctor',     hu:'\u0151 egy orvos', out:'he is a doctor',   p:'he', stat:0.63, sys:0.91}
];
let _pro = 0;
function proBuild(){
  const b = document.getElementById('pro-btns');
  if(b) b.innerHTML = '<span style="'+MTLBL+'">occupation</span>' + PRO.map((p,i)=>
    `<button style="${MTBTN}" id="pro-b${i}" onclick="proGo(${i})">${p.occ}</button>`).join('');
  _pro = 0; proDraw();
}
function proGo(i){ _pro = i; proDraw(); }
function proDraw(){
  PRO.forEach((_,i)=>{ const e = document.getElementById('pro-b'+i); if(e){
    e.style.background = i===_pro ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pro ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('pro-canvas', 218); if(!c) return;
  const {x, w} = c;
  const P = PRO[_pro];
  mtTxt(x, 'HUNGARIAN \u00b7 \u0151 is gender-neutral', 8, 18, {size:9.5, col:MTC.muted});
  mtTxt(x, P.hu, 8, 42, {size:15, col:MTC.text, font:MTC.body});
  x.strokeStyle = MTC.line2; x.lineWidth = 1.4;
  x.beginPath(); x.moveTo(24, 54); x.lineTo(24, 72); x.stroke();
  mtTxt(x, 'ENGLISH \u00b7 a gendered pronoun is now required', 8, 88, {size:9.5, col:MTC.muted});
  const out = P.out.split(' ');
  let px = 8;
  out.forEach(o=>{
    const isPro = o===P.p;
    const tw = Math.max(36, o.length*9 + 16);
    mtChip(x, px, 98, tw, 30, isPro?'rgba(159,18,57,0.18)':'transparent', isPro?MTC.a2:MTC.line, null);
    mtTxt(x, o, px+tw/2, 113, {size:12, col: isPro?MTC.a2:MTC.text, align:'center', weight: isPro?'700':''});
    px += tw + 5;
  });
  mtTxt(x, '\u2191 chosen by the system, not by the source', 8, 144, {size:9, col:MTC.a2});
  // two bars
  const L = 132, PW = w-L-60, T = 160;
  [['workforce statistic', P.stat, MTC.a1, 0], ['system assignment rate', P.sys, MTC.a2, 26]].forEach(([lab, v, col, dy])=>{
    mtTxt(x, lab, L-8, T+dy+9, {size:9, col:MTC.muted, align:'right'});
    mtRR(x, L, T+dy, PW, 18, 5); x.fillStyle = 'rgba(23,27,52,0.045)'; x.fill();
    mtRR(x, L, T+dy, Math.max(4, PW*v), 18, 5); x.fillStyle = col+'CC'; x.fill();
    mtTxt(x, (v*100).toFixed(0) + '%', L+PW+8, T+dy+9, {size:10, col:col, weight:'700'});
  });
  const amp = (P.sys - P.stat)*100;
  x.save(); x.setLineDash([3,3]); x.strokeStyle = MTC.a2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L+PW*P.stat, T-4); x.lineTo(L+PW*P.stat, T+48); x.stroke(); x.restore();
  mtSet('pro-cap', `The workforce is ${(P.stat*100).toFixed(0)}% ${P.p==='she'?'women':'men'} in this occupation. The system assigns <em>${P.p}</em> ${(P.sys*100).toFixed(0)}% of the time. The gap of <b style="color:var(--accent2)">${amp.toFixed(0)} points</b> is amplification: the output is more skewed than the world it was trained on.`);
}

/* ── WinoMT ───────────────────────────────────────────────── */
const WIN = [
  {s:'The doctor asked the nurse to help her with the procedure.', ref:'her \u2192 the doctor', stereo:false, ok:false,
   why:'Anti-stereotypical: <em>her</em> refers to the doctor. The system attaches it to the nurse instead.'},
  {s:'The doctor asked the nurse to help him with the procedure.', ref:'him \u2192 the doctor', stereo:true, ok:true,
   why:'Stereotypical: <em>him</em> matches the expected gender for doctor, and the system resolves it correctly.'},
  {s:'The developer argued with the designer because she did not like the layout.', ref:'she \u2192 the developer', stereo:false, ok:false,
   why:'Anti-stereotypical: <em>she</em> refers to the developer. The system assigns it to the designer.'},
  {s:'The mechanic greeted the receptionist because he was standing by the door.', ref:'he \u2192 the mechanic', stereo:true, ok:true,
   why:'Stereotypical, and resolved correctly.'}
];
let _win = {i:0, done:[]};
function winBuild(){ _win = {i:0, done:[]}; winRender(); }
function winPredict(ok){
  if(_win.i >= WIN.length) return;
  _win.done.push({guess:ok, actual:WIN[_win.i].ok, why:WIN[_win.i].why});
  _win.i++; winRender();
}
function winRender(){
  const done = _win.i >= WIN.length, it = WIN[_win.i];
  mtSet('win-item', done ? '<div style="font-family:var(--mono);font-size:.72rem">All four seen.</div>'
    : `<div style="font-family:var(--mono);font-size:.62rem;color:#93A2CC;letter-spacing:.1em">SENTENCE ${_win.i+1} OF ${WIN.length} \u00b7 ${it.stereo?'STEREOTYPICAL':'ANTI-STEREOTYPICAL'}</div>
       <div style="font-family:var(--mono);font-size:.78rem;line-height:1.9;margin-top:.4rem">${it.s}</div>
       <div style="font-family:var(--mono);font-size:.7rem;color:#A9D6FF;margin-top:.4rem">correct resolution: ${it.ref}</div>`);
  mtSet('win-btns', done ? `<button style="${MTBTN}" onclick="winBuild()">run again</button>`
    : `<span style="${MTLBL}">will the system get it right?</span>
       <button style="${MTBTN}" onclick="winPredict(true)">yes</button>
       <button style="${MTBTN}" onclick="winPredict(false)">no</button>`);
  winDraw();
  const last = _win.done[_win.done.length-1];
  mtSet('win-cap', done
    ? 'The pattern is the finding. Systems resolve stereotypical cases well and anti-stereotypical ones poorly, and the gap between the two is the measurement WinoMT reports.'
    : (last ? (last.guess===last.actual ? '<b style="color:var(--accent4)">Right.</b> ' : '<b style="color:var(--accent2)">Not quite.</b> ') + last.why
            : 'Read the sentence and predict whether a typical system resolves the pronoun correctly.'));
}
function winDraw(){
  const c = mtCtx('win-canvas', 128); if(!c) return;
  const {x, w} = c;
  const st = WIN.filter((v,i)=> i<_win.i && v.stereo), an = WIN.filter((v,i)=> i<_win.i && !v.stereo);
  const acc = arr => arr.length ? arr.filter(v=>v.ok).length/arr.length : 0;
  const L = 152, PW = w-L-60;
  mtTxt(x, 'SYSTEM ACCURACY BY CONDITION', 8, 16, {size:9.5, col:MTC.muted});
  [['stereotypical', st, MTC.a1, 32], ['anti-stereotypical', an, MTC.a2, 64]].forEach(([lab, arr, col, y])=>{
    const v = acc(arr);
    mtTxt(x, lab, L-8, y+10, {size:9.5, col:MTC.text, align:'right'});
    mtRR(x, L, y, PW, 20, 6); x.fillStyle = 'rgba(23,27,52,0.045)'; x.fill();
    mtRR(x, L, y, Math.max(4, PW*v), 20, 6); x.fillStyle = col+'CC'; x.fill();
    mtTxt(x, arr.length ? (v*100).toFixed(0)+'%' : '\u2013', L+PW+8, y+10, {size:10.5, col:col, weight:'700'});
    mtTxt(x, arr.length + ' seen', L+6, y+10, {size:8.5, col:'#FAFBFF'});
  });
  const gapv = acc(st) - acc(an);
  mtTxt(x, st.length && an.length ? 'gap ' + (gapv*100).toFixed(0) + ' points' : 'keep going to fill both bars',
        8, 108, {size:10, col: gapv>0.3?MTC.a2:MTC.muted, weight: gapv>0.3?'700':''});
}

/* ── Abstention ───────────────────────────────────────────── */
function absDraw(){
  const t = +(document.getElementById('abs-t')||{value:0}).value;
  mtSet('abs-tl', t.toFixed(2));
  const c = mtCtx('abs-canvas', 210); if(!c) return;
  const {x, w} = c;
  const N = 60;
  let s = 777;
  const rnd = ()=>{ s = (s*9301+49297)%233280; return s/233280; };
  const items = [];
  for(let i=0;i<N;i++){
    const conf = rnd();
    const correct = rnd() < 0.42 + conf*0.44;
    items.push({conf, correct});
  }
  const cols = 20, cw = (w-16)/cols, rh = 22;
  let kept = 0, wrongKept = 0, abst = 0;
  items.forEach((it, i)=>{
    const cx2 = 8 + (i%cols)*cw, cy2 = 30 + Math.floor(i/cols)*rh;
    const on = it.conf >= t;
    if(on){ kept++; if(!it.correct) wrongKept++; } else abst++;
    let fill;
    if(!on) fill = 'rgba(23,27,52,0.06)';
    else fill = it.correct ? 'rgba(11,132,87,0.65)' : 'rgba(159,18,57,0.75)';
    mtRR(x, cx2, cy2, cw-3, rh-4, 3); x.fillStyle = fill; x.fill();
  });
  mtTxt(x, 'EACH BLOCK IS ONE TRANSLATION IN A CLINICAL SETTING', 8, 16, {size:9.5, col:MTC.muted});
  const by = 30 + Math.ceil(N/cols)*rh + 14;
  const stat = (lab, v, col, dy)=>{
    mtTxt(x, lab, 8, by+dy, {size:9.5, col:MTC.muted});
    mtTxt(x, v, 250, by+dy, {size:11, col:col, weight:'700'});
  };
  stat('translations delivered', kept + ' of ' + N, MTC.a1, 0);
  stat('confidently wrong, delivered anyway', String(wrongKept), MTC.a2, 20);
  stat('declined \u2014 flagged for a human', String(abst), MTC.a4, 40);
  mtSet('abs-cap', t === 0
    ? 'With no threshold the system answers everything, including the cases it has no basis for. Every red block is a wrong translation that reached a patient with nothing marking it as uncertain.'
    : `At a threshold of ${t.toFixed(2)} the system declines ${abst} of ${N} translations and delivers ${wrongKept} wrong ones instead of ${items.filter(i=>!i.correct).length}. Coverage falls and so does harm, and where that balance should sit is a decision about the setting rather than about the model.`);
}

/* ══ 12.8 RECAP ═══════════════════════════════════════════ */
MT_PAGES.mtrecap = `
<div class="lesson-chapter-label">Section 12.8</div>
<h1 class="lesson-h1">Everything in One Picture</h1>
<p class="lesson-intro">Follow the translation workflow from parallel data to decoding and evaluation. Select a stage to return to its lesson.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Pipeline Map</span></div>
  <div class="viz-body">
    <canvas id="map-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="map-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Follow the sequence. A <strong>parallel corpus</strong> is collected, aligned at the sentence level, and filtered (12.2.2), which is possible at all only because the structural divergences between the two languages (12.1) are consistent enough to learn. A shared <strong>subword vocabulary</strong> is learned over both sides and then frozen (12.2.1). The <strong>encoder-decoder</strong> is trained on the result with cross-entropy under teacher forcing (12.2, 12.3), and <strong>cross-attention</strong> is what lets each target position read the source. Where bitext is scarce, <strong>backtranslation</strong> and <strong>multilingual training</strong> supply what the corpus does not (12.5.1, 12.5.2). At inference, <strong>beam search</strong> or <strong>MBR</strong> selects one output from the distribution (12.4, 12.4.1). The result is judged by <strong>human raters</strong>, by <strong>overlap metrics</strong>, and by <strong>trained metrics</strong> (12.6), and audited for the assumptions it encodes (12.7).</p>

<p class="lesson-p">Two things are worth carrying out of this chapter. The first is that the architecture is not translation-specific: an encoder-decoder with cross-attention is a general mechanism for mapping one sequence to another, and translation is simply the case where the mapping happens to be between languages. The second is that evaluation remains the unsolved part. We can train systems faster than we can reliably tell which of them is better, and every metric in Section 12.6 is a proxy for a judgment that only a fluent bilingual reader can actually make.</p>`;

/* ── Pipeline map ─────────────────────────────────────────── */
const MAP_N = [
  {id:'mtdiv',   lab:'divergences',    sub:'12.1',   x:.07, y:.24},
  {id:'mtalign', lab:'parallel corpus', sub:'12.2.2', x:.24, y:.24},
  {id:'mttok',   lab:'subword vocab',  sub:'12.2.1', x:.41, y:.24},
  {id:'mtenc',   lab:'encoder-decoder',sub:'12.2',   x:.60, y:.24},
  {id:'mtcross', lab:'cross-attention',sub:'12.3',   x:.79, y:.24},
  {id:'mtback',  lab:'backtranslation',sub:'12.5.1', x:.24, y:.62},
  {id:'mtmulti', lab:'multilingual',   sub:'12.5.2', x:.41, y:.62},
  {id:'mtbeam',  lab:'beam search',    sub:'12.4',   x:.60, y:.62},
  {id:'mtmbr',   lab:'MBR',            sub:'12.4.1', x:.72, y:.62},
  {id:'mteval',  lab:'evaluation',     sub:'12.6',   x:.86, y:.62},
  {id:'mtbias',  lab:'bias audit',     sub:'12.7',   x:.86, y:.88}
];
const MAP_E = [[0,1],[1,2],[2,3],[3,4],[5,3],[6,3],[3,7],[7,8],[7,9],[8,9],[9,10]];
let _map = {hot:null};
function mapBuild(){
  const cv = document.getElementById('map-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('mousemove', e=>{
      const r = cv.getBoundingClientRect();
      const hit = mapHit(e.clientX-r.left, e.clientY-r.top, r.width, cv.clientHeight||240);
      if(hit !== _map.hot){ _map.hot = hit; mapDraw(); }
    });
    cv.addEventListener('click', e=>{
      const r = cv.getBoundingClientRect();
      const hit = mapHit(e.clientX-r.left, e.clientY-r.top, r.width, cv.clientHeight||240);
      if(hit !== null) openMTSec(MAP_N[hit].id);
    });
  }
  mapDraw();
}
function mapPt(n, w, h){ return {x: 30 + n.x*(w-90), y: 26 + n.y*(h-70)}; }
function mapHit(mx, my, w, h){
  let hit = null;
  MAP_N.forEach((n, i)=>{ const p = mapPt(n, w, h);
    if(mx > p.x-8 && mx < p.x+94 && my > p.y-6 && my < p.y+34) hit = i; });
  return hit;
}
function mapDraw(){
  const c = mtCtx('map-canvas', 250); if(!c) return;
  const {x, w, h} = c;
  MAP_E.forEach(([a, b])=>{
    const pa = mapPt(MAP_N[a], w, h), pb = mapPt(MAP_N[b], w, h);
    x.strokeStyle = (_map.hot===a || _map.hot===b) ? MTC.a1 : 'rgba(23,27,52,0.16)';
    x.lineWidth = (_map.hot===a || _map.hot===b) ? 1.8 : 1;
    x.beginPath(); x.moveTo(pa.x+86, pa.y+14);
    x.bezierCurveTo(pa.x+110, pa.y+14, pb.x-24, pb.y+14, pb.x, pb.y+14);
    x.stroke();
  });
  MAP_N.forEach((n, i)=>{
    const p = mapPt(n, w, h), on = _map.hot===i;
    mtChip(x, p.x, p.y, 86, 28, on ? 'rgba(79,70,229,0.18)' : MTC.surf, on ? MTC.a1 : MTC.line2, null);
    mtTxt(x, n.lab, p.x+43, p.y+11, {size:9, col:MTC.text, align:'center', weight: on?'700':''});
    mtTxt(x, n.sub, p.x+43, p.y+22, {size:7.5, col: on?MTC.a1:MTC.muted, align:'center'});
  });
  mtSet('map-cap', _map.hot !== null
    ? 'Click to open <b>' + MAP_N[_map.hot].lab + '</b> (' + MAP_N[_map.hot].sub + ').'
    : 'Every node is a section of this chapter. Click any of them to jump back.');
}

/* ── SECTION OPENER ───────────────────────────────────────── */
function openMTSec(id){
  const pg = MT_PAGES[id];
  if(!pg) return;
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if(!sv || !sb) return;
  const sec = MT_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if(crumb && sec) crumb.innerHTML = 'Machine Translation <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  renderMath(sb);
  mcSectionDelay(()=>{
    if(id==='mtdiv')   dvgBuild();
    if(id==='mtorder'){ reoBuild(); adpBuild(); }
    if(id==='mtlex')   carvBuild();
    if(id==='mtmorph') mrfBuild();
    if(id==='mtdrop')  gapBuild();
    if(id==='mtenc')   encBuild();
    if(id==='mttok')   tokDraw();
    if(id==='mtalign') algBuild();
    if(id==='mtcross'){ xatBuild(); mskDraw(); tflDraw(); }
    if(id==='mtbeam'){ grdBuild(); bmBuild(); }
    if(id==='mtmbr')   mbrDraw();
    if(id==='mtlow')   cliffBuild();
    if(id==='mtback')  mbtBuild();
    if(id==='mtmulti'){ swBuild(); ttBuild(); }
    if(id==='mtwho'){  audBuild(); parBuild(); }
    if(id==='mteval')  qadBuild();
    if(id==='mthuman') ratBuild();
    if(id==='mtchrf'){ chrDraw(); tksBuild(); limBuild(); bootBuild(); }
    if(id==='mtbert'){ bsBuild(); corBuild(); }
    if(id==='mtbias'){ proBuild(); winBuild(); absDraw(); }
    if(id==='mtrecap') mapBuild();
  }, 120);
  sv.onscroll = () => {
    const hh = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if(bar) bar.style.width = (hh>0?(sv.scrollTop/hh)*100:0)+'%';
  };
}
window.addEventListener('resize', ()=>{
  const sb = document.getElementById('sub-body');
  if(!sb || !sb.querySelector('canvas[id^="dvg"],canvas[id^="reo"],canvas[id^="map"]')) return;
});
