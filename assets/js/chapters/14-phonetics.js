/* ══════════════════════════════════════════════════════════════
   PHONETICS AND SPEECH FEATURE EXTRACTION
   ══════════════════════════════════════════════════════════════ */

const PH_SEC = [
  {id:'phwrite', num:'14.1',   title:'Writing Sounds Down', icon:'\u270E', desc:'Phones, the alphabets used to transcribe them, and why English spelling is a poor guide.', tags:['IPA','ARPAbet']},
  {id:'phorgan', num:'14.2',   title:'How the Mouth Shapes Air', icon:'\u25D4', desc:'The vocal tract as an instrument: voicing, the velum, and where the air is obstructed.', tags:['articulation','voicing']},
  {id:'phplace', num:'14.2.1', title:'Where the Airflow Narrows', icon:'\u2195', desc:'Place of articulation, from the lips to the glottis, with the phones made at each point.', tags:['place','coronal']},
  {id:'phman',   num:'14.2.2', title:'How Completely the Air Is Blocked', icon:'\u25D1', desc:'Manner of articulation as a continuum from full closure to open approximation.', tags:['manner','stops']},
  {id:'phvow',   num:'14.2.3', title:'Tongue Position as a Coordinate System', icon:'\u2317', desc:'Vowels as points in a height-by-frontness space, and diphthongs as paths through it.', tags:['vowels','diphthongs']},
  {id:'physyl',  num:'14.2.4', title:'Grouping Sounds Around a Vowel', icon:'\u2442', desc:'Syllable structure, onset and rime, and the rules governing which clusters are legal.', tags:['syllables','phonotactics']},
  {id:'phpros',  num:'14.3',   title:'Rhythm, Pitch, and Emphasis', icon:'\u223F', desc:'Prosody: the three acoustic channels that carry meaning above the level of the phone.', tags:['prosody','F0']},
  {id:'phprom',  num:'14.3.1', title:'What Makes a Word Stand Out', icon:'\u2191', desc:'Four levels of prominence, pitch accent, and the vowel reduction that marks the bottom.', tags:['stress','reduction']},
  {id:'phbreak', num:'14.3.2', title:'Where Sentences Break', icon:'\u2016', desc:'Prosodic phrasing, its partial alignment with syntax, and boundary prediction.', tags:['phrasing','boundaries']},
  {id:'phtune',  num:'14.3.3', title:'The Melody of an Utterance', icon:'\u2197', desc:'Intonation contours, and how a final rise or fall changes what a sentence does.', tags:['intonation','contour']},
  {id:'phtobi',  num:'14.3.4', title:'A Notation for Intonation', icon:'\u266A', desc:'ToBI: five pitch accents and four boundary tones as an alphabet for tunes.', tags:['ToBI','pitch accent']},
  {id:'phwave',  num:'14.4.1', title:'Sine Waves, Frequency, and Amplitude', icon:'\u301C', desc:'The two numbers that describe a pure tone, and the period that follows from one of them.', tags:['sine','period']},
  {id:'phdig',   num:'14.4.2', title:'Turning Air Pressure Into Numbers', icon:'\u25A6', desc:'Sampling, the Nyquist limit, aliasing, quantization, and companding.', tags:['sampling','Nyquist']},
  {id:'phperc',  num:'14.4.3', title:'From Physical Measures to What We Hear', icon:'\u25D5', desc:'F0, RMS amplitude, intensity in decibels, and the mel scale of perceived pitch.', tags:['RMS','mel scale']},
  {id:'phread',  num:'14.4.4', title:'Reading Phones Off the Waveform', icon:'\u2315', desc:'Vowels, stops and fricatives each leave a recognizable signature in the raw signal.', tags:['waveform','segmentation']},
  {id:'phfour',  num:'14.4.5', title:'Decomposing Sound Into Frequencies', icon:'\u2211', desc:'Fourier analysis, the spectrum, the spectrogram, and formants as vowel identity.', tags:['spectrum','formants']},
  {id:'phsrc',   num:'14.4.6', title:'A Buzz Shaped by a Tube', icon:'\u29B5', desc:'Source-filter theory: the glottis supplies harmonics, the tract selects among them.', tags:['source-filter','resonance']},
  {id:'phpipe',  num:'14.5',   title:'Turning Waveforms Into Feature Vectors', icon:'\u21E5', desc:'The whole feature-extraction pipeline, stage by stage, with every intermediate shown.', tags:['pipeline','features']},
  {id:'phframe', num:'14.5.2', title:'Slicing Speech Into Short Frames', icon:'\u2337', desc:'Windowing: why 25 milliseconds, why 10-millisecond steps, and why the edges are tapered.', tags:['windowing','Hamming']},
  {id:'phdft',   num:'14.5.3', title:'Measuring Energy in Each Frequency Band', icon:'\u222B', desc:'The discrete Fourier transform, complex output, and the FFT that makes it practical.', tags:['DFT','FFT']},
  {id:'phmel',   num:'14.5.4', title:'Weighting Frequencies the Way Ears Do', icon:'\u25E7', desc:'The mel filterbank, the logarithm, and normalization into a usable feature.', tags:['filterbank','log mel']},
  {id:'phcep',   num:'14.6',   title:'Separating the Vocal Tract From the Voice', icon:'\u21C5', desc:'The cepstrum splits filter from source, and assembles the classic 39-dimensional vector.', tags:['cepstrum','MFCC']},
  {id:'phmap',   num:'14.7',   title:'The Chapter in One Map', icon:'\u25C9', desc:'Articulation to acoustics to spectrum to feature vector, with one phone traced throughout.', tags:['recap','pipeline']}
];

function buildPHOverview(){
  const cards = PH_SEC.map(s=>`
    <div class="sc-card" onclick="openPHSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Sound Into Numbers</div>
    <h1 class="lesson-h1">Phonetics &amp; Speech Feature Extraction</h1>
    <p class="lesson-intro">Speech starts as a changing pressure signal. This chapter connects how sounds are produced to their waveforms, frequency content, and numerical features. You can listen to examples and inspect the representations used by speech systems.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">A phone is a speech sound, written in IPA or ARPAbet because alphabetic spelling maps to sound inconsistently, especially in English.</div>
        <div class="ch-sum-item">Consonants are classified by voicing, by place of articulation, and by manner; vowels are described by tongue height, frontness and lip rounding, with diphthongs as movements through that space.</div>
        <div class="ch-sum-item">Prosody carries meaning through three channels at once: fundamental frequency, energy, and duration, which together mark prominence, phrase boundaries and intonational meaning.</div>
        <div class="ch-sum-item">Digitizing sound requires sampling at more than twice the highest frequency of interest, or the signal aliases, and quantizing amplitude to a fixed number of bits.</div>
        <div class="ch-sum-item">Source-filter theory separates the glottal buzz, which carries pitch, from the vocal tract resonances, which carry vowel identity as formants; the two vary independently.</div>
        <div class="ch-sum-item">Feature extraction windows the signal into overlapping short frames, takes a DFT of each, warps the spectrum onto the mel scale, takes logarithms, and normalizes.</div>
        <div class="ch-sum-item">The cepstrum separates the slowly varying spectral envelope from the rapid harmonic structure, yielding decorrelated MFCC features; the classic vector is 39-dimensional.</div>
      </div>
    </div>`;
}

const PH_PAGES = {};

/* ══ 14.1 WRITING SOUNDS DOWN ═════════════════════════════ */
PH_PAGES.phwrite = `
<div class="lesson-chapter-label">Section 14.1</div>
<h1 class="lesson-h1">Writing Sounds Down</h1>
<p class="lesson-intro">A <strong>phone</strong> is a speech sound. Ordinary spelling is an unreliable guide to pronunciation, so phonetics uses symbols that describe sounds more directly. Start by comparing letters with IPA transcriptions.</p>

<h2 class="lesson-h2">Two Alphabets</h2>
<p class="lesson-p">The <strong>International Phonetic Alphabet</strong> is the universal standard, designed to write any sound in any language with one symbol per sound. Its cost is a large inventory of non-ASCII characters. <strong>ARPAbet</strong> is a plain-ASCII alternative covering American English, which is why it dominates in speech technology: it survives file formats, command lines and code without encoding trouble. The two are interchangeable for English, and this chapter uses ARPAbet.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Symbol Bridge</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pbr-btns"></div>
    <canvas id="pbr-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="pbr-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Why Spelling Will Not Do</h2>
<p class="lesson-p">English orthography is <strong>opaque</strong>: the mapping from letters to sounds is many-to-many and riddled with exceptions. The sound [k] is spelled <em>c</em> in <em>cougar</em>, <em>x</em> in <em>fox</em> (where one letter carries two phones), <em>ck</em> in <em>jackal</em>, and <em>cc</em> in <em>raccoon</em>. Running the other way, the letter sequence <em>ough</em> is pronounced differently in <em>though</em>, <em>through</em>, <em>tough</em> and <em>cough</em>. Spanish is far more transparent; the arrows below stay almost parallel.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Orthography Opacity</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pop-btns"></div>
    <canvas id="pop-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pop-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">What Real Speech Looks Like Transcribed</h2>
<p class="lesson-p">Two research corpora illustrate the range. <strong>TIMIT</strong> contains read sentences, carefully transcribed with time-aligned phone boundaries: each phone has a start and an end, and the transcription matches the dictionary. <strong>Switchboard</strong> is spontaneous telephone conversation, and it looks very different. Vowels reduce to schwa, final consonants disappear, and sounds migrate across word boundaries. In casual speech, <em>I do not know</em> can surface with almost none of its dictionary phones intact.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Read Speech Against Spontaneous Speech</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pcp-btns"></div>
    <canvas id="pcp-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pcp-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">This gap is the reason speech recognition is harder than it sounds. A system trained on dictionary pronunciations meets, in the wild, a signal in which half the phones have been reduced, deleted, or reassigned to a neighbouring syllable.</p>

<div class="quiz-block" id="qph-wr"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why do speech technology datasets often prefer ARPAbet over IPA?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-wr','Correct. ARPAbet uses only ASCII characters, so it passes through file formats, tools and code without encoding problems.')">It is pure ASCII, so it survives file formats and tooling without encoding issues</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-wr','ARPAbet is less general than IPA: it covers American English rather than every language.')">It can represent more languages than IPA</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-wr','Both aim at one symbol per sound; the difference is the character set, not the precision.')">It distinguishes sounds that IPA cannot</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-wr','Neither alphabet encodes duration by default; timing comes from separate alignment data.')">It encodes phone durations directly</button>
</div><div class="quiz-explain" id="qph-wr-explain"></div></div>`;

/* ── Symbol Bridge ────────────────────────────────────────── */
const PBR = {
  'vowels':[
    ['iy','i','beet'],['ih','\u026A','bit'],['ey','e\u026A','bait'],['eh','\u025B','bet'],
    ['ae','\u00E6','bat'],['aa','\u0251','father'],['ao','\u0254','bought'],['uw','u','boot'],
    ['uh','\u028A','book'],['ah','\u028C','but'],['ax','\u0259','about'],['er','\u025D','bird']
  ],
  'stops & nasals':[
    ['p','p','pat'],['b','b','bat'],['t','t','tap'],['d','d','dab'],
    ['k','k','cap'],['g','\u0261','gap'],['m','m','map'],['n','n','nap'],['ng','\u014B','sing']
  ],
  'fricatives':[
    ['f','f','fat'],['v','v','vat'],['th','\u03B8','thin'],['dh','\u00F0','then'],
    ['s','s','sap'],['z','z','zap'],['sh','\u0283','ship'],['zh','\u0292','measure'],['hh','h','hat']
  ],
  'others':[
    ['ch','t\u0283','chip'],['jh','d\u0292','judge'],['l','l','lap'],['r','\u0279','rap'],
    ['w','w','wap'],['y','j','yak'],['dx','\u027E','butter']
  ]
};
let _pbr = {grp:'vowels', hot:-1};
function pbrBuild(){
  const b = document.getElementById('pbr-btns');
  if(b) b.innerHTML = Object.keys(PBR).map(k=>
    `<button style="${MTBTN}" id="pbr-b-${k.replace(/[^a-z]/g,'')}" onclick="pbrGo('${k}')">${k}</button>`).join('');
  const cv = document.getElementById('pbr-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('mousemove', e=>{
      const r = cv.getBoundingClientRect();
      const i = Math.floor((e.clientY-r.top-40)/26);
      const h = (i>=0 && i<PBR[_pbr.grp].length) ? i : -1;
      if(h!==_pbr.hot){ _pbr.hot = h; pbrDraw(); }
    });
    cv.addEventListener('mouseleave', ()=>{ _pbr.hot=-1; pbrDraw(); });
  }
  _pbr = {grp:'vowels', hot:-1}; pbrDraw();
}
function pbrGo(k){ _pbr.grp = k; _pbr.hot = -1; pbrDraw(); }
function pbrDraw(){
  Object.keys(PBR).forEach(k=>{ const e = document.getElementById('pbr-b-'+k.replace(/[^a-z]/g,'')); if(e){
    e.style.background = k===_pbr.grp ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = k===_pbr.grp ? '#FAFBFF' : 'var(--muted)'; } });
  const rows = PBR[_pbr.grp];
  const c = mtCtx('pbr-canvas', 46 + rows.length*26 + 12); if(!c) return;
  const {x, w} = c;
  const cols = [['ARPAbet', 40], ['IPA', 150], ['example word', 270]];
  cols.forEach(([lab, cx])=> mtTxt(x, lab, cx, 22, {size:9, col:MTC.muted}));
  x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(20, 32); x.lineTo(w-20, 32); x.stroke();
  rows.forEach((r, i)=>{
    const y = 40 + i*26, on = i===_pbr.hot;
    if(on){ mtRR(x, 20, y, w-40, 24, 5); x.fillStyle = 'rgba(79,70,229,0.09)'; x.fill(); }
    mtTxt(x, '[' + r[0] + ']', 40, y+12, {size:11.5, col:MTC.a1, weight:'700'});
    mtTxt(x, r[1], 150, y+12, {size:13, col:MTC.a2, font:MTC.body});
    mtTxt(x, r[2].replace(/(.)/, '$1'), 270, y+12, {size:11.5, col:MTC.text, font:MTC.body});
    // tiny waveform glyph as a visual anchor
    x.strokeStyle = on ? MTC.a1 : MTC.line2; x.lineWidth = 1;
    x.beginPath();
    for(let px=0; px<70; px++){
      const amp = (r[0].match(/^(iy|ih|ey|eh|ae|aa|ao|uw|uh|ah|ax|er|m|n|ng|l|r|w|y|v|z|zh|dh|b|d|g|jh)$/)) ? 8 : 4;
      const yy = y+12 + Math.sin(px*0.55 + i)*amp*Math.exp(-Math.pow((px-35)/40,2));
      px ? x.lineTo(w-100+px, yy) : x.moveTo(w-100+px, yy);
    }
    x.stroke();
  });
  mtSet('pbr-cap', _pbr.hot>=0
    ? 'ARPAbet <b>[' + rows[_pbr.hot][0] + ']</b> is IPA <b>' + rows[_pbr.hot][1] + '</b>, the sound in <em>' + rows[_pbr.hot][2] + '</em>.'
    : 'One symbol per sound in both alphabets. ARPAbet writes everything in ASCII, using two letters where one will not do; IPA uses a dedicated character. Hover a row.');
}

/* ── Orthography Opacity ──────────────────────────────────── */
const POP = [
  {lang:'English', word:'cougar',  letters:['c','o','u','g','a','r'], phones:['k','uw','g','er'],
   map:[[0,0],[1,1],[2,1],[3,2],[4,3],[5,3]]},
  {lang:'English', word:'fox',     letters:['f','o','x'], phones:['f','aa','k','s'],
   map:[[0,0],[1,1],[2,2],[2,3]]},
  {lang:'English', word:'jackal',  letters:['j','a','c','k','a','l'], phones:['jh','ae','k','ax','l'],
   map:[[0,0],[1,1],[2,2],[3,2],[4,3],[5,4]]},
  {lang:'English', word:'raccoon', letters:['r','a','c','c','o','o','n'], phones:['r','ae','k','uw','n'],
   map:[[0,0],[1,1],[2,2],[3,2],[4,3],[5,3],[6,4]]},
  {lang:'Spanish', word:'casa',    letters:['c','a','s','a'], phones:['k','a','s','a'],
   map:[[0,0],[1,1],[2,2],[3,3]]},
  {lang:'Spanish', word:'pelota',  letters:['p','e','l','o','t','a'], phones:['p','e','l','o','t','a'],
   map:[[0,0],[1,1],[2,2],[3,3],[4,4],[5,5]]}
];
let _pop = 0;
function popBuild(){
  const b = document.getElementById('pop-btns');
  if(b) b.innerHTML = POP.map((p,i)=>
    `<button style="${MTBTN}" id="pop-b${i}" onclick="popGo(${i})">${p.word}</button>`).join('');
  _pop = 0; popDraw();
}
function popGo(i){ _pop = i; popDraw(); }
function popDraw(){
  POP.forEach((_,i)=>{ const e = document.getElementById('pop-b'+i); if(e){
    e.style.background = i===_pop ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pop ? '#FAFBFF' : 'var(--muted)'; } });
  const P = POP[_pop];
  const c = mtCtx('pop-canvas', 190); if(!c) return;
  const {x, w} = c;
  const lw = Math.min(58, (w-60)/P.letters.length);
  const pw = Math.min(58, (w-60)/P.phones.length);
  const lx = i => 30 + i*lw + (w-60-lw*P.letters.length)/2;
  const px2 = i => 30 + i*pw + (w-60-pw*P.phones.length)/2;
  mtTxt(x, 'LETTERS', 12, 30, {size:9, col:MTC.muted});
  P.letters.forEach((L, i)=>{
    mtChip(x, lx(i), 40, lw-6, 32, 'rgba(23,27,52,0.045)', MTC.line, L, MTC.text, 14);
  });
  mtTxt(x, 'PHONES', 12, 150, {size:9, col:MTC.muted});
  P.phones.forEach((ph, i)=>{
    mtChip(x, px2(i), 118, pw-6, 32, 'rgba(79,70,229,0.11)', MTC.a1, '['+ph+']', MTC.a1, 11);
  });
  // crossing count
  let cross = 0;
  for(let a=0;a<P.map.length;a++) for(let b2=a+1;b2<P.map.length;b2++){
    const [la, pa] = P.map[a], [lb, pb] = P.map[b2];
    if((la-lb)*(pa-pb) < 0) cross++;
  }
  const shared = {};
  P.map.forEach(([l,ph])=>{ shared[ph] = (shared[ph]||0)+1; });
  const manyToOne = Object.values(shared).filter(v=>v>1).length;
  const oneToMany = P.map.filter(([l])=>P.map.filter(([l2])=>l2===l).length>1).length;
  P.map.forEach(([li, pi])=>{
    const x1 = lx(li)+(lw-6)/2, x2 = px2(pi)+(pw-6)/2;
    const odd = P.map.filter(([l])=>l===li).length>1 || shared[pi]>1;
    x.strokeStyle = odd ? 'rgba(159,18,57,0.6)' : 'rgba(79,70,229,0.45)';
    x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(x1, 74); x.bezierCurveTo(x1, 96, x2, 96, x2, 116); x.stroke();
  });
  mtTxt(x, P.lang, w-12, 30, {size:10.5, col: P.lang==='Spanish'?MTC.a4:MTC.a2, align:'right', weight:'700'});
  mtTxt(x, P.letters.length + ' letters \u2192 ' + P.phones.length + ' phones', w-12, 150,
        {size:9.5, col:MTC.muted, align:'right'});
  mtSet('pop-cap', P.lang==='Spanish'
    ? 'Spanish is orthographically transparent: the arrows run nearly parallel, one letter to one phone. A reader who knows the rules can pronounce an unfamiliar word correctly on sight.'
    : 'Crimson arrows mark the trouble: either one letter carrying several phones, or several letters sharing one. In <em>fox</em> the single letter <em>x</em> produces both [k] and [s]; in <em>raccoon</em> two letters <em>cc</em> produce one [k]. The sound [k] is spelled four different ways across these words.');
}

/* ── Corpus comparison ────────────────────────────────────── */
const PCP = [
  {k:'timit', lab:'TIMIT \u00b7 read speech', text:'she had your dark suit',
   segs:[['sh',.00,.14],['iy',.14,.25],['hh',.25,.31],['ae',.31,.42],['dcl',.42,.47],['d',.47,.50],
         ['y',.50,.56],['axr',.56,.66],['dcl',.66,.71],['d',.71,.74],['aa',.74,.87],['r',.87,.95],
         ['kcl',.95,1.0]],
   note:'Read speech, carefully transcribed. Every phone in the dictionary pronunciation is present, in order, with a measurable start and end. Note the closure symbols (dcl, kcl): stops have a silent phase before the burst, and TIMIT labels them separately.'},
  {k:'swbd', lab:'Switchboard \u00b7 spontaneous', text:'I do not know \u2192 [ax n ow]',
   segs:[['ax',.00,.22],['n',.22,.40],['ow',.40,1.0]],
   note:'The same words in spontaneous conversation. The vowel in <em>I</em> has reduced to schwa, <em>do</em> has vanished entirely, the [t] of <em>not</em> is gone, and what remains is three phones where the dictionary lists eight. This is not sloppy speech; it is normal speech.'}
];
let _pcp = 0;
function pcpBuild(){
  const b = document.getElementById('pcp-btns');
  if(b) b.innerHTML = PCP.map((p,i)=>`<button style="${MTBTN}" id="pcp-b${i}" onclick="pcpGo(${i})">${p.lab}</button>`).join('');
  _pcp = 0; pcpDraw();
}
function pcpGo(i){ _pcp = i; pcpDraw(); }
function pcpDraw(){
  PCP.forEach((_,i)=>{ const e = document.getElementById('pcp-b'+i); if(e){
    e.style.background = i===_pcp ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pcp ? '#FAFBFF' : 'var(--muted)'; } });
  const P = PCP[_pcp];
  const c = mtCtx('pcp-canvas', 190); if(!c) return;
  const {x, w} = c;
  const L = 20, PW = w-40;
  mtTxt(x, P.text, L, 26, {size:13, col:MTC.text, font:MTC.body});
  // waveform sketch
  x.strokeStyle = 'rgba(79,70,229,0.5)'; x.lineWidth = 1;
  x.beginPath();
  for(let i=0;i<=PW;i++){
    const t = i/PW;
    const seg = P.segs.find(s2=>t>=s2[1] && t<s2[2]) || P.segs[0];
    const voiced = /^(iy|ae|aa|ax|ow|axr|n|m|r|l|y|d|g|b|v|z)$/.test(seg[0]);
    const amp = /cl$/.test(seg[0]) ? 1 : (voiced ? 20 : 8);
    const yy = 68 + Math.sin(i*(voiced?0.55:2.3))*amp*(0.6+0.4*Math.sin(i*0.09));
    i ? x.lineTo(L+i, yy) : x.moveTo(L+i, yy);
  }
  x.stroke();
  // phone tier
  P.segs.forEach((s2, i)=>{
    const x1 = L + s2[1]*PW, x2 = L + s2[2]*PW;
    mtChip(x, x1, 108, Math.max(2, x2-x1-2), 26,
      /cl$/.test(s2[0]) ? 'rgba(23,27,52,0.06)' : 'rgba(79,70,229,0.11)',
      MTC.line2, null);
    if(x2-x1 > 22) mtTxt(x, s2[0], (x1+x2)/2, 121, {size:9, col:MTC.text, align:'center'});
    x.strokeStyle = MTC.a2; x.lineWidth = 1;
    x.beginPath(); x.moveTo(x1, 44); x.lineTo(x1, 134); x.stroke();
  });
  // time axis
  x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, 146); x.lineTo(L+PW, 146); x.stroke();
  for(let t=0;t<=1;t+=0.25){
    const px = L+t*PW;
    x.beginPath(); x.moveTo(px, 143); x.lineTo(px, 150); x.stroke();
    mtTxt(x, (t*0.8).toFixed(2)+'s', px, 162, {size:8, col:MTC.muted, align:'center'});
  }
  mtTxt(x, P.segs.length + ' phones', w-20, 26, {size:10, col:MTC.a2, align:'right', weight:'700'});
  mtSet('pcp-cap', P.note);
}

/* ══ 14.2 THE VOCAL TRACT ═════════════════════════════════ */
PH_PAGES.phorgan = `
<div class="lesson-chapter-label">Section 14.2</div>
<h1 class="lesson-h1">How the Mouth Shapes Air</h1>
<p class="lesson-intro">Speech is made by pushing air out of the lungs and interfering with it on the way out. Everything in phonetic classification comes from three questions about that interference: is the airflow made to buzz, where is the tract narrowed, and how completely.</p>

<h2 class="lesson-h2">The Instrument</h2>
<p class="lesson-p">Air leaves the lungs through the <strong>trachea</strong> and passes the <strong>larynx</strong>, which houses the <strong>vocal folds</strong>. The gap between the folds is the <strong>glottis</strong>. Above that the tract divides: the <strong>oral tract</strong> through the mouth, and the <strong>nasal tract</strong> through the nose, with the <strong>velum</strong> (soft palate) acting as a valve that opens or seals the nasal route. Hover the diagram to name the parts.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Vocal Organ Cutaway</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" id="pvo-v" onclick="pvoVoice()">vocal folds: apart (voiceless)</button>
      <button style="${MTBTN}" id="pvo-n" onclick="pvoNasal()">velum: raised (oral)</button>
    </div>
    <canvas id="pvo-canvas" data-w="660" style="width:100%;display:block;cursor:crosshair"></canvas>
    <div id="pvo-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Voicing</h2>
<p class="lesson-p">Bring the vocal folds close together and the escaping air forces them into rapid vibration, tens to hundreds of times per second. Sounds made this way are <strong>voiced</strong>; hold the folds apart and the air passes freely, producing <strong>voiceless</strong> sounds. This single binary distinguishes many English pairs that are otherwise articulated identically: [b]/[p], [d]/[t], [g]/[k], [v]/[f], [z]/[s]. Put a finger on your larynx and alternate <em>zzzz</em> and <em>ssss</em>: the buzz appears and disappears while your tongue never moves.</p>
<p class="lesson-p">Voicing matters enormously downstream, because a voiced sound has a <strong>fundamental frequency</strong>, the rate of that vibration, and an unvoiced one simply does not. Half the acoustic measurements later in this chapter are only defined during voiced regions.</p>

<h2 class="lesson-h2">The Nasal Valve</h2>
<p class="lesson-p">Lower the velum and air is routed through the nose as well as, or instead of, the mouth. English uses this for exactly three sounds, [m], [n] and [ng], which are otherwise identical to [b], [d] and [g] respectively: same closure, same place, velum the only difference. Pinch your nose and try to say <em>mama</em> to hear the valve stuck shut.</p>

<div class="quiz-block" id="qph-or"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What is the only articulatory difference between [b] and [m]?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-or','Correct. Both are voiced bilabial closures; lowering the velum routes air through the nose and turns [b] into [m].')">The velum is lowered for [m], routing air through the nasal tract</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-or','Both are voiced; voicing is not what separates them.')">[b] is voiced and [m] is voiceless</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-or','Both are made with the two lips, so the place of articulation is identical.')">They are made at different places in the mouth</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-or','The tongue plays no distinguishing role in a bilabial closure.')">The tongue is higher for [m]</button>
</div><div class="quiz-explain" id="qph-or-explain"></div></div>`;

/* ── Vocal Organ Cutaway ──────────────────────────────────── */
const PVO_PARTS = [
  {lab:'nasal cavity', x:.30, y:.16, note:'The chamber above the palate. Sealed off by the velum for most sounds, opened for [m], [n], [ng].'},
  {lab:'hard palate',  x:.40, y:.34, note:'The bony roof of the mouth. The tongue approaches it for palatal sounds such as [y].'},
  {lab:'velum',        x:.53, y:.30, note:'The soft palate. Raised, it seals the nasal tract; lowered, it opens it. Also the contact point for [k], [g], [ng].'},
  {lab:'tongue',       x:.38, y:.52, note:'The most mobile articulator. Its position front to back and high to low defines every vowel.'},
  {lab:'pharynx',      x:.60, y:.52, note:'The cavity behind the tongue joining the mouth to the larynx. Its size contributes to vowel resonance.'},
  {lab:'epiglottis',   x:.60, y:.64, note:'A flap that folds over the larynx during swallowing, keeping food out of the airway.'},
  {lab:'vocal folds',  x:.60, y:.76, note:'Two folds of tissue in the larynx. Held close, escaping air makes them vibrate: this is voicing.'},
  {lab:'larynx',       x:.68, y:.80, note:'The cartilage housing that holds the vocal folds. The visible bump in the throat.'},
  {lab:'trachea',      x:.62, y:.92, note:'The windpipe. Air from the lungs arrives here on its way to everything above.'}
];
let _pvo = {voice:false, nasal:false, hot:-1};
function pvoBuild(){
  const cv = document.getElementById('pvo-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('mousemove', e=>{
      const r = cv.getBoundingClientRect();
      const mx = (e.clientX-r.left), my = (e.clientY-r.top);
      let h = -1;
      PVO_PARTS.forEach((p,i)=>{
        const px = 90 + p.x*(r.width-260), py = 20 + p.y*240;
        if(Math.hypot(mx-px, my-py) < 26) h = i;
      });
      if(h!==_pvo.hot){ _pvo.hot = h; pvoDraw(); }
    });
    cv.addEventListener('mouseleave', ()=>{ _pvo.hot=-1; pvoDraw(); });
  }
  _pvo = {voice:false, nasal:false, hot:-1}; pvoDraw();
}
function pvoVoice(){ _pvo.voice = !_pvo.voice; pvoDraw(); }
function pvoNasal(){ _pvo.nasal = !_pvo.nasal; pvoDraw(); }
function pvoDraw(){
  const vb = document.getElementById('pvo-v'), nb = document.getElementById('pvo-n');
  if(vb){ vb.textContent = 'vocal folds: ' + (_pvo.voice?'vibrating (voiced)':'apart (voiceless)');
          vb.style.background = _pvo.voice?'var(--accent)':'var(--surface2)'; vb.style.color = _pvo.voice?'#FAFBFF':'var(--muted)'; }
  if(nb){ nb.textContent = 'velum: ' + (_pvo.nasal?'lowered (nasal)':'raised (oral)');
          nb.style.background = _pvo.nasal?'var(--accent2)':'var(--surface2)'; nb.style.color = _pvo.nasal?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('pvo-canvas', 280); if(!c) return;
  const {x, w} = c;
  const OX = 90, OW = w-260, OY = 20, OH = 240;
  const P = (px,py)=>({x: OX+px*OW, y: OY+py*OH});
  // head outline
  x.strokeStyle = MTC.line2; x.lineWidth = 1.6;
  x.beginPath();
  x.moveTo(P(0.10,0.30).x, P(0.10,0.30).y);
  x.bezierCurveTo(P(0.18,0.02).x,P(0.18,0.02).y, P(0.72,0.02).x,P(0.72,0.02).y, P(0.80,0.34).x,P(0.80,0.34).y);
  x.bezierCurveTo(P(0.84,0.60).x,P(0.84,0.60).y, P(0.80,0.86).x,P(0.80,0.86).y, P(0.72,0.99).x,P(0.72,0.99).y);
  x.stroke();
  x.beginPath();
  x.moveTo(P(0.10,0.30).x, P(0.10,0.30).y);
  x.bezierCurveTo(P(0.06,0.42).x,P(0.06,0.42).y, P(0.10,0.52).x,P(0.10,0.52).y, P(0.16,0.56).x,P(0.16,0.56).y);
  x.stroke();
  // oral cavity
  x.fillStyle = 'rgba(79,70,229,0.06)';
  x.beginPath();
  x.moveTo(P(0.14,0.42).x, P(0.14,0.42).y);
  x.lineTo(P(0.56,0.34).x, P(0.56,0.34).y);
  x.lineTo(P(0.62,0.56).x, P(0.62,0.56).y);
  x.lineTo(P(0.20,0.60).x, P(0.20,0.60).y);
  x.closePath(); x.fill();
  // nasal cavity
  x.fillStyle = _pvo.nasal ? 'rgba(159,18,57,0.20)' : 'rgba(23,27,52,0.04)';
  x.beginPath();
  x.moveTo(P(0.14,0.34).x, P(0.14,0.34).y);
  x.lineTo(P(0.54,0.12).x, P(0.54,0.12).y);
  x.lineTo(P(0.60,0.26).x, P(0.60,0.26).y);
  x.lineTo(P(0.16,0.38).x, P(0.16,0.38).y);
  x.closePath(); x.fill();
  // tongue
  x.fillStyle = 'rgba(159,18,57,0.28)';
  x.beginPath();
  x.moveTo(P(0.20,0.60).x, P(0.20,0.60).y);
  x.bezierCurveTo(P(0.34,0.44).x,P(0.34,0.44).y, P(0.52,0.46).x,P(0.52,0.46).y, P(0.60,0.58).x,P(0.60,0.58).y);
  x.lineTo(P(0.58,0.68).x, P(0.58,0.68).y);
  x.lineTo(P(0.22,0.68).x, P(0.22,0.68).y);
  x.closePath(); x.fill();
  // velum flap
  const vel = P(0.56, _pvo.nasal ? 0.40 : 0.30);
  x.strokeStyle = _pvo.nasal ? MTC.a2 : MTC.a1; x.lineWidth = 3.5;
  x.beginPath(); x.moveTo(P(0.52,0.28).x, P(0.52,0.28).y); x.lineTo(vel.x, vel.y); x.stroke();
  // pharynx + trachea tube
  x.strokeStyle = MTC.line2; x.lineWidth = 1.4;
  x.beginPath(); x.moveTo(P(0.60,0.56).x, P(0.60,0.56).y); x.lineTo(P(0.62,0.99).x, P(0.62,0.99).y); x.stroke();
  x.beginPath(); x.moveTo(P(0.70,0.60).x, P(0.70,0.60).y); x.lineTo(P(0.72,0.99).x, P(0.72,0.99).y); x.stroke();
  // vocal folds
  const vf = P(0.66, 0.76);
  if(_pvo.voice){
    for(let k=0;k<4;k++){
      x.strokeStyle = 'rgba(79,70,229,'+(0.7-k*0.15)+')'; x.lineWidth = 2;
      x.beginPath(); x.arc(vf.x, vf.y, 7+k*7, -0.9, 0.9); x.stroke();
    }
    mtChip(x, vf.x+34, vf.y-10, 62, 20, 'rgba(79,70,229,0.16)', MTC.a1, 'buzzing', MTC.a1, 8.5);
  } else {
    mtChip(x, vf.x+34, vf.y-10, 62, 20, 'rgba(23,27,52,0.05)', MTC.line, 'open', MTC.muted, 8.5);
  }
  x.strokeStyle = _pvo.voice ? MTC.a1 : MTC.line2; x.lineWidth = 3;
  x.beginPath();
  x.moveTo(vf.x-9, vf.y - (_pvo.voice?2:6)); x.lineTo(vf.x+9, vf.y - (_pvo.voice?2:6)); x.stroke();
  x.beginPath();
  x.moveTo(vf.x-9, vf.y + (_pvo.voice?2:6)); x.lineTo(vf.x+9, vf.y + (_pvo.voice?2:6)); x.stroke();
  // airflow arrows
  const flow = (pts, col)=>{
    x.strokeStyle = col; x.lineWidth = 2; x.setLineDash([4,4]);
    x.beginPath();
    pts.forEach((p,i)=>{ const q = P(p[0],p[1]); i? x.lineTo(q.x,q.y) : x.moveTo(q.x,q.y); });
    x.stroke(); x.setLineDash([]);
  };
  flow([[0.66,0.99],[0.66,0.80]], MTC.a4);
  if(_pvo.nasal) flow([[0.62,0.60],[0.56,0.44],[0.40,0.22],[0.16,0.34]], MTC.a2);
  flow([[0.62,0.60],[0.50,0.52],[0.24,0.52],[0.14,0.44]], MTC.a4);
  // labels
  PVO_PARTS.forEach((p, i)=>{
    const q = P(p.x, p.y), on = i===_pvo.hot;
    x.beginPath(); x.arc(q.x, q.y, on?5:3, 0, 7);
    x.fillStyle = on ? MTC.a2 : MTC.line2; x.fill();
    if(on){
      mtChip(x, q.x+10, q.y-11, 96, 22, MTC.surf, MTC.a2, p.lab, MTC.text, 9);
    }
  });
  const example = _pvo.nasal ? (_pvo.voice ? '[m] [n] [ng]' : '(no voiceless nasals in English)')
                             : (_pvo.voice ? '[b] [d] [g] [v] [z]' : '[p] [t] [k] [f] [s]');
  mtTxt(x, 'sounds with this configuration:', OX+OW+18, 40, {size:9, col:MTC.muted});
  mtTxt(x, example, OX+OW+18, 60, {size:11, col:MTC.a1, weight:'700'});
  mtSet('pvo-cap', _pvo.hot>=0 ? '<b>' + PVO_PARTS[_pvo.hot].lab + '.</b> ' + PVO_PARTS[_pvo.hot].note
    : 'Two valves control everything. The vocal folds decide whether the sound buzzes; the velum decides whether air escapes through the nose. Toggle both and watch the airflow path change.');
}

/* ══ 14.2.1 PLACE OF ARTICULATION ═════════════════════════ */
PH_PAGES.phplace = `
<div class="lesson-chapter-label">Section 14.2.1</div>
<h1 class="lesson-h1">Where the Airflow Narrows</h1>
<p class="lesson-intro">Consonants are made by obstructing the airflow somewhere. The <strong>place of articulation</strong> is simply where, and it runs in an orderly sequence from the lips at the front to the glottis at the back. Drag the marker through the tract and watch the phones change.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Constriction Slider</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">constriction point</span>
      <input id="pcs-p" type="range" min="0" max="7" step="1" value="0" oninput="pcsDraw()" style="width:220px;accent-color:var(--accent)">
    </div>
    <canvas id="pcs-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pcs-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">A Useful Grouping</h2>
<p class="lesson-p">Dental and alveolar sounds, plus the palato-alveolars, are collectively called <strong>coronal</strong>, meaning they are made with the front (blade or tip) of the tongue. The grouping earns its keep because coronals behave alike in phonological rules across many languages: they assimilate to neighbours, they are the sounds most often deleted in fast speech, and they are acquired early by children. Naming the class lets a rule be stated once instead of five times.</p>
<p class="lesson-p">One entry deserves a note. The <strong>glottal stop</strong> [q] is made by closing the vocal folds themselves, so its place of articulation <em>is</em> the glottis. English does not treat it as a distinct phoneme, but every speaker produces it constantly: it is the catch in the middle of <em>uh-oh</em>, and in many dialects it replaces the [t] in <em>button</em> or <em>Latin</em>.</p>

<div class="quiz-block" id="qph-pl"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is <em>coronal</em> a useful category rather than an arbitrary grouping?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-pl','Correct. Coronals pattern together in phonological processes, so rules can be stated once for the class instead of separately for each place.')">Coronal sounds pattern together in phonological rules across languages</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-pl','Coronals span several distinct places; that they are adjacent is the observation, not the justification.')">They are all made at exactly the same place</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-pl','Coronals include stops, fricatives, affricates and more; manner varies freely within the class.')">They all share the same manner of articulation</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-pl','Voicing cuts across the class: [s] is voiceless, [z] is voiced, both coronal.')">They are all voiceless</button>
</div><div class="quiz-explain" id="qph-pl-explain"></div></div>`;

/* ── Constriction Slider ──────────────────────────────────── */
const PCS = [
  {p:.10, lab:'bilabial',        ph:['p','b','m'],           note:'Both lips press together. The frontmost place, and the easiest to see: watch a speaker say <em>papa</em>.'},
  {p:.18, lab:'labiodental',     ph:['f','v'],               note:'Lower lip against upper teeth. Air escapes through the gap as friction.'},
  {p:.27, lab:'dental',          ph:['th','dh'],             note:'Tongue tip at or between the teeth. The two English <em>th</em> sounds: voiceless in <em>thin</em>, voiced in <em>then</em>.'},
  {p:.38, lab:'alveolar',        ph:['t','d','s','z','n','l'], note:'Tongue against the alveolar ridge just behind the teeth. The busiest place in English by a wide margin.'},
  {p:.50, lab:'palato-alveolar', ph:['sh','zh','ch','jh'],   note:'Tongue blade slightly further back, against the front of the palate. The <em>sh</em> in <em>ship</em> and the <em>j</em> in <em>judge</em>.'},
  {p:.60, lab:'palatal',         ph:['y'],                   note:'Tongue body raised toward the hard palate. English has one: the [y] of <em>yak</em>.'},
  {p:.72, lab:'velar',           ph:['k','g','ng'],          note:'Back of the tongue against the velum. Note that [ng] shares this place with [k] and [g] and differs only by the nasal valve.'},
  {p:.86, lab:'glottal',         ph:['q','hh'],              note:'The constriction is the glottis itself. [q] is a full closure of the vocal folds; [hh] is turbulent air passing through an open glottis.'}
];
function pcsDraw(){
  const i = Math.max(0, Math.min(7, Math.round(+(document.getElementById('pcs-p')||{value:0}).value)));
  const c = mtCtx('pcs-canvas', 236); if(!c) return;
  const {x, w} = c;
  const L = 40, PW = w-80, ty = 88;
  // tract profile
  x.strokeStyle = MTC.line2; x.lineWidth = 1.6;
  x.beginPath();
  x.moveTo(L, ty-30);
  x.bezierCurveTo(L+PW*0.35, ty-46, L+PW*0.65, ty-40, L+PW, ty-6);
  x.stroke();
  x.beginPath();
  x.moveTo(L, ty+30);
  x.bezierCurveTo(L+PW*0.35, ty+22, L+PW*0.62, ty+34, L+PW, ty+40);
  x.stroke();
  x.fillStyle = 'rgba(79,70,229,0.06)';
  x.beginPath();
  x.moveTo(L, ty-30);
  x.bezierCurveTo(L+PW*0.35, ty-46, L+PW*0.65, ty-40, L+PW, ty-6);
  x.lineTo(L+PW, ty+40);
  x.bezierCurveTo(L+PW*0.62, ty+34, L+PW*0.35, ty+22, L, ty+30);
  x.closePath(); x.fill();
  mtTxt(x, 'lips', L, ty+62, {size:9, col:MTC.muted});
  mtTxt(x, 'glottis', L+PW, ty+62, {size:9, col:MTC.muted, align:'right'});
  // all places as ticks
  PCS.forEach((s2, k)=>{
    const px = L + s2.p*PW, on = k===i;
    x.strokeStyle = on ? MTC.a2 : MTC.line;
    x.lineWidth = on ? 2.4 : 1;
    x.beginPath(); x.moveTo(px, ty-42); x.lineTo(px, ty+38); x.stroke();
    if(on){
      x.beginPath(); x.arc(px, ty, 13, 0, 7);
      x.fillStyle = 'rgba(159,18,57,0.28)'; x.fill();
      x.beginPath(); x.arc(px, ty, 13, 0, 7);
      x.strokeStyle = MTC.a2; x.lineWidth = 2; x.stroke();
    }
  });
  const S = PCS[i];
  const px = L + S.p*PW;
  mtTxt(x, S.lab, px, ty-56, {size:12.5, col:MTC.a2, align:'center', weight:'700'});
  // phones
  let cx2 = w/2 - (S.ph.length*54)/2;
  S.ph.forEach(p=>{
    mtChip(x, cx2, 170, 48, 30, 'rgba(79,70,229,0.12)', MTC.a1, '['+p+']', MTC.a1, 12);
    cx2 += 54;
  });
  // coronal bracket
  const c1 = L + PCS[2].p*PW - 12, c2 = L + PCS[4].p*PW + 12;
  x.strokeStyle = MTC.a5; x.lineWidth = 1.6;
  x.beginPath();
  x.moveTo(c1, ty+76); x.lineTo(c1, ty+84); x.lineTo(c2, ty+84); x.lineTo(c2, ty+76);
  x.stroke();
  mtTxt(x, 'coronal', (c1+c2)/2, ty+96, {size:9, col:MTC.a5, align:'center'});
  mtSet('pcs-cap', S.note);
}

/* ══ 14.2.2 MANNER ════════════════════════════════════════ */
PH_PAGES.phman = `
<div class="lesson-chapter-label">Section 14.2.2</div>
<h1 class="lesson-h1">How Completely the Air Is Blocked</h1>
<p class="lesson-intro">Place says where the tract narrows. <strong>Manner</strong> says how much, and the answer forms a continuum from total blockage to barely any. Each point on that continuum produces a recognizably different kind of sound, with a different signature in the waveform.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Obstruction Dial</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">degree of closure</span>
      <input id="pob-m" type="range" min="0" max="4" step="1" value="0" oninput="pobDraw()" style="width:200px;accent-color:var(--accent)">
      <button style="${MTBTN}" id="pob-n" onclick="pobNasal()">velum lowered</button>
    </div>
    <canvas id="pob-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pob-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Place Times Manner</h2>
<p class="lesson-p">Place and manner are independent, so the consonant inventory is naturally a grid. Most of the interesting facts about a language&rsquo;s sound system are visible as holes in that grid: combinations that are physically possible but happen not to be used. Click an empty cell to see why.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Place &times; Manner Grid</span></div>
  <div class="viz-body">
    <canvas id="pgm-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="pgm-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Two cross-cutting labels are worth knowing. <strong>Sibilants</strong> ([s], [z], [sh], [zh]) are the fricatives with a sharp high-frequency hiss, produced by aiming the airstream at the teeth; they are the loudest consonants and the easiest to spot in a spectrogram. <strong>Lateral</strong> describes [l], where the tongue tip touches the alveolar ridge but air escapes around the sides rather than over the top.</p>

<div class="quiz-block" id="qph-mn"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What is an affricate?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-mn','Correct. An affricate is a stop closure released into a fricative rather than into open air, as in the [ch] of chip.')">A stop released into a fricative rather than straight into open air</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-mn','That describes a nasal, where the velum lowers and air leaves through the nose.')">A stop made with the nasal tract open</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-mn','That is an approximant: a narrowing too gentle to produce turbulence.')">A narrowing that produces no turbulence at all</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-mn','That is a tap or flap, a single brief contact as in the middle of butter.')">A single very brief contact of the tongue</button>
</div><div class="quiz-explain" id="qph-mn-explain"></div></div>`;

/* ── Obstruction Dial ─────────────────────────────────────── */
const POB = [
  {lab:'stop', gap:0, ph:'[p] [b] [t] [d] [k] [g]',
   note:'Complete closure. Air pressure builds behind the blockage, then releases in a burst. In the waveform this is unmistakable: a stretch of near silence followed by a sharp spike.'},
  {lab:'affricate', gap:0.12, ph:'[ch] [jh]',
   note:'A stop that does not release cleanly. The closure opens just enough to produce friction, so the waveform shows silence, then a burst, then a stretch of noise: two manners in sequence.'},
  {lab:'fricative', gap:0.3, ph:'[f] [v] [th] [s] [z] [sh]',
   note:'The tract is narrowed enough to make the airflow turbulent but never sealed. The waveform is continuous irregular noise with no periodicity if voiceless.'},
  {lab:'tap / flap', gap:0.5, ph:'[dx]',
   note:'One very brief contact, too fast to build pressure. The [t] in American <em>butter</em> is a flap, which is why it sounds nothing like the [t] in <em>top</em>.'},
  {lab:'approximant', gap:0.7, ph:'[y] [r] [w] [l]',
   note:'The articulators approach but the gap stays wide enough that airflow remains smooth. No turbulence, no closure: acoustically these behave almost like vowels.'}
];
let _pob = {nasal:false};
function pobNasal(){ _pob.nasal = !_pob.nasal; pobDraw(); }
function pobDraw(){
  const i = Math.max(0, Math.min(4, Math.round(+(document.getElementById('pob-m')||{value:0}).value)));
  const nb = document.getElementById('pob-n');
  const canNasal = i===0;
  if(nb){ nb.style.background = (_pob.nasal&&canNasal)?'var(--accent2)':'var(--surface2)';
          nb.style.color = (_pob.nasal&&canNasal)?'#FAFBFF':'var(--muted)';
          nb.style.opacity = canNasal ? '1' : '0.4'; }
  const c = mtCtx('pob-canvas', 250); if(!c) return;
  const {x, w} = c;
  const M = POB[i];
  const nasal = _pob.nasal && canNasal;
  // cross-section of the constriction
  const cx2 = 150, cy = 90, R = 52;
  x.strokeStyle = MTC.line2; x.lineWidth = 1.5;
  x.beginPath(); x.arc(cx2, cy, R, 0, 7); x.stroke();
  const gapPx = M.gap*R*1.5;
  x.fillStyle = 'rgba(159,18,57,0.30)';
  x.beginPath(); x.arc(cx2, cy, R, -Math.PI/2 + 0.001, Math.PI/2, false);
  x.lineTo(cx2, cy+R-gapPx*0+0); x.closePath(); x.fill();
  // upper and lower articulator
  x.fillStyle = 'rgba(159,18,57,0.35)';
  x.beginPath(); x.moveTo(cx2-R, cy-R); x.lineTo(cx2+R, cy-R);
  x.lineTo(cx2+R, cy-gapPx/2); x.lineTo(cx2-R, cy-gapPx/2); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(cx2-R, cy+R); x.lineTo(cx2+R, cy+R);
  x.lineTo(cx2+R, cy+gapPx/2); x.lineTo(cx2-R, cy+gapPx/2); x.closePath(); x.fill();
  mtTxt(x, gapPx<2 ? 'sealed' : 'gap', cx2, cy, {size:9.5, col: gapPx<2?MTC.a2:MTC.a4, align:'center', weight:'700'});
  mtTxt(x, M.lab, cx2, cy-R-14, {size:12.5, col:MTC.a2, align:'center', weight:'700'});
  // waveform signature
  const wx = 270, ww = w-wx-24, wy = 90;
  mtTxt(x, 'WAVEFORM SIGNATURE', wx, 30, {size:9, col:MTC.muted});
  x.strokeStyle = MTC.a1; x.lineWidth = 1.2;
  x.beginPath();
  for(let p=0;p<ww;p++){
    const t = p/ww;
    let amp = 0;
    if(i===0) amp = t<0.55 ? 0.5 : (t<0.62 ? 40*Math.exp(-(t-0.55)*60) : 14*Math.exp(-(t-0.62)*8));
    else if(i===1) amp = t<0.35 ? 0.5 : (t<0.42 ? 38*Math.exp(-(t-0.35)*70) : 16);
    else if(i===2) amp = 15;
    else if(i===3) amp = (t>0.45 && t<0.52) ? 2 : 20;
    else amp = 22;
    const noisy = (i===2) || (i===1 && t>0.42) || (i===0 && t>0.62 && t<0.7);
    const yy = wy + (noisy ? (Math.random()-0.5)*amp*2 : Math.sin(p*0.5)*amp);
    p ? x.lineTo(wx+p, yy) : x.moveTo(wx+p, yy);
  }
  x.stroke();
  const sig = ['silence \u2192 burst', 'silence \u2192 burst \u2192 noise', 'continuous noise', 'brief dip', 'smooth, vowel-like'][i];
  mtTxt(x, sig, wx, wy+52, {size:9.5, col:MTC.a1});
  // phones
  mtChip(x, 24, 190, w-48, 34, 'rgba(79,70,229,0.08)', MTC.line,
    nasal ? '[m] [n] [ng]  \u00b7  nasal branch' : M.ph, MTC.a1, 12);
  mtSet('pob-cap', nasal
    ? 'With the velum lowered, a full closure in the mouth is not a stop but a <b>nasal</b>. The oral tract is sealed exactly as for [b], [d], [g], and the air simply leaves by the other route. Same place, same closure, different valve.'
    : M.note + (canNasal ? ' Lower the velum to see the nasal branch off this position.' : ''));
}

/* ── Place x Manner Grid ──────────────────────────────────── */
const PGM_PL = ['bilab','labiodent','dental','alveolar','pal-alv','palatal','velar','glottal'];
const PGM_MN = ['stop','nasal','fricative','affricate','approx'];
const PGM_CELL = {
  'stop|bilab':'p b', 'stop|alveolar':'t d', 'stop|velar':'k g', 'stop|glottal':'q',
  'nasal|bilab':'m', 'nasal|alveolar':'n', 'nasal|velar':'ng',
  'fricative|labiodent':'f v', 'fricative|dental':'th dh', 'fricative|alveolar':'s z',
  'fricative|pal-alv':'sh zh', 'fricative|glottal':'hh',
  'affricate|pal-alv':'ch jh',
  'approx|palatal':'y', 'approx|alveolar':'r l', 'approx|bilab':'w'
};
const PGM_WHY = {
  'stop|labiodent':'A full closure of lip against teeth is possible but rare across languages; the seal is hard to make airtight, so most languages use the fricatives [f] and [v] here instead.',
  'stop|dental':'Many languages do have dental stops; English simply uses alveolar [t] and [d] for that region, and reserves the dental place for the two <em>th</em> fricatives.',
  'stop|pal-alv':'English fills this cell with affricates ([ch], [jh]) rather than plain stops. The closure is made, but the release is always fricated.',
  'nasal|dental':'Nasals are made at the same places as stops in a given language. English has stops at bilabial, alveolar and velar, so it has exactly those three nasals.',
  'nasal|glottal':'Physically impossible: a nasal requires the oral tract to be sealed while air flows through the nose, and a glottal closure would stop the airflow entirely.',
  'fricative|bilab':'Possible, and used in Spanish (the soft <em>b</em> in <em>haber</em>), but English has no bilabial fricative; it uses labiodental [f] and [v] for that acoustic territory.',
  'fricative|velar':'Common in German (<em>Bach</em>) and Scottish English (<em>loch</em>), absent from most American English inventories.',
  'affricate|alveolar':'Present in German and Italian ([ts]); English speakers produce the sequence in <em>cats</em> but treat it as two phones rather than one.',
  'approx|glottal':'The glottis cannot form a gentle approximation while remaining a glottis; [hh] is the closest thing and is classified as a fricative.'
};
let _pgm = {sel:null};
function pgmBuild(){
  const cv = document.getElementById('pgm-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('click', e=>{
      const r = cv.getBoundingClientRect();
      const L = 86, cw = (r.width-L-14)/PGM_PL.length, rh = 30, T = 46;
      const j = Math.floor((e.clientX-r.left-L)/cw), i = Math.floor((e.clientY-r.top-T)/rh);
      if(j>=0 && j<PGM_PL.length && i>=0 && i<PGM_MN.length){
        _pgm.sel = PGM_MN[i]+'|'+PGM_PL[j]; pgmDraw();
      }
    });
  }
  _pgm = {sel:null}; pgmDraw();
}
function pgmDraw(){
  const c = mtCtx('pgm-canvas', 46 + PGM_MN.length*30 + 20); if(!c) return;
  const {x, w} = c;
  const L = 86, cw = (w-L-14)/PGM_PL.length, rh = 30, T = 46;
  PGM_PL.forEach((p, j)=>{
    x.save(); x.translate(L + j*cw + cw/2, 38); x.rotate(-Math.PI/7);
    mtTxt(x, p, 0, 0, {size:8, col:MTC.muted, align:'center'}); x.restore();
  });
  PGM_MN.forEach((m, i)=>{
    mtTxt(x, m, L-8, T + i*rh + rh/2, {size:9, col:MTC.muted, align:'right'});
    PGM_PL.forEach((p, j)=>{
      const key = m+'|'+p, val = PGM_CELL[key];
      const px = L + j*cw, py = T + i*rh;
      const sel = _pgm.sel===key;
      const sib = /^(s z|sh zh)$/.test(val||'');
      x.fillStyle = val ? (sib ? 'rgba(165,104,14,0.20)' : 'rgba(79,70,229,0.16)') : 'rgba(23,27,52,0.035)';
      mtRR(x, px, py, cw-2, rh-2, 3); x.fill();
      if(sel){ x.strokeStyle = MTC.a2; x.lineWidth = 2; x.stroke(); }
      if(val) mtTxt(x, val, px+(cw-2)/2, py+(rh-2)/2, {size:8.5, col:MTC.text, align:'center'});
    });
  });
  mtChip(x, L, T+PGM_MN.length*rh+6, 12, 10, 'rgba(165,104,14,0.20)', null);
  mtTxt(x, 'sibilant', L+18, T+PGM_MN.length*rh+11, {size:8, col:MTC.muted});
  mtTxt(x, '[l] is the lateral: tongue tip contacts, air escapes at the sides', L+120, T+PGM_MN.length*rh+11, {size:8, col:MTC.muted});
  const sel = _pgm.sel;
  mtSet('pgm-cap', sel
    ? (PGM_CELL[sel]
       ? '<b>' + sel.replace('|', ' + ') + '</b> \u2192 [' + PGM_CELL[sel].split(' ').join('] [') + ']. Filled cells are the sounds English actually uses.'
       : '<b>' + sel.replace('|', ' + ') + '</b> is empty in English. ' + (PGM_WHY[sel] || 'This combination is either physically awkward or simply unused in this language; other languages may fill it.'))
    : 'Place across the top, manner down the side. Every filled cell is an English consonant, and the empty ones are the interesting part: click any of them.');
}

/* ══ 14.2.3 VOWELS ════════════════════════════════════════ */
PH_PAGES.phvow = `
<div class="lesson-chapter-label">Section 14.2.3</div>
<h1 class="lesson-h1">Tongue Position as a Coordinate System</h1>
<p class="lesson-intro">Vowels are produced without the complete closure or strong turbulent constriction typical of many consonants. Tongue height, tongue position, and lip rounding provide a useful first description; other features also distinguish vowels.</p>

<h2 class="lesson-h2">Two Axes and a Switch</h2>
<p class="lesson-p"><strong>Height</strong> is how close the tongue body comes to the roof of the mouth: high for the [iy] of <em>beet</em>, low for the [ae] of <em>bat</em>. <strong>Frontness</strong> is how far forward the tongue is bunched: front for [iy], back for the [uw] of <em>boot</em>. <strong>Rounding</strong> is whether the lips are protruded, which in English accompanies most back vowels.</p>
<p class="lesson-p">Because both axes are continuous, vowels do not fall into neat boxes the way consonants do; they occupy a space. Drag the point and watch the tract cross-section follow.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Vowel Space Navigator</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" id="pvs-r" onclick="pvsRound()">lip rounding: off</button>
      <span style="${MTLBL}">drag the point, or click a vowel</span>
    </div>
    <canvas id="pvs-canvas" data-w="660" style="width:100%;display:block;cursor:crosshair"></canvas>
    <div id="pvs-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Points and Paths</h2>
<p class="lesson-p">Some vowels hold one position throughout; these are <strong>monophthongs</strong>, single points in the space. Others move: the tongue starts at one position and glides to another during the vowel, and these are <strong>diphthongs</strong>, better drawn as arrows than as dots. The [ay] of <em>bite</em> travels from a low back start toward a high front finish. English has five clear diphthongs, and two vowels ([ey], [ow]) that are usually diphthongal in American English even though the spelling and the transcription treat them as single units.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Diphthong Tracer</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pdt-btns"></div>
    <canvas id="pdt-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pdt-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qph-vw"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What makes a diphthong different from a monophthong?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-vw','Correct. A diphthong is a movement through the vowel space during a single vowel, so it is a path rather than a point.')">The tongue moves during the vowel, tracing a path rather than holding a point</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-vw','Length varies with many factors; movement, not duration, is the defining property.')">It is simply held for longer</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-vw','Both kinds are voiced in English; voicing does not distinguish them.')">It is voiceless while a monophthong is voiced</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-vw','Both are written with a single ARPAbet symbol, such as [ay]; the spelling is not the criterion.')">It is written with two letters instead of one</button>
</div><div class="quiz-explain" id="qph-vw-explain"></div></div>`;

/* ── Vowel Space Navigator ────────────────────────────────── */
const PVS_V = [
  {p:'iy', w:'beet', f:.08, h:.06, r:false}, {p:'ih', w:'bit',  f:.20, h:.24, r:false},
  {p:'ey', w:'bait', f:.16, h:.36, r:false}, {p:'eh', w:'bet',  f:.24, h:.52, r:false},
  {p:'ae', w:'bat',  f:.26, h:.86, r:false}, {p:'aa', w:'father', f:.72, h:.92, r:false},
  {p:'ao', w:'bought', f:.86, h:.66, r:true}, {p:'ow', w:'boat', f:.84, h:.40, r:true},
  {p:'uh', w:'book', f:.74, h:.24, r:true},  {p:'uw', w:'boot', f:.90, h:.06, r:true},
  {p:'ah', w:'but',  f:.54, h:.58, r:false}, {p:'ax', w:'about', f:.50, h:.48, r:false}
];
let _pvs = {f:.08, h:.06, round:false, drag:false};
function pvsBuild(){
  const cv = document.getElementById('pvs-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    const set = e=>{
      const r = cv.getBoundingClientRect();
      const L = 40, T = 34, PW = Math.min(320, r.width-300), PH = 190;
      _pvs.f = Math.max(0, Math.min(1, (e.clientX-r.left-L)/PW));
      _pvs.h = Math.max(0, Math.min(1, (e.clientY-r.top-T)/PH));
      pvsDraw();
    };
    cv.addEventListener('mousedown', e=>{ _pvs.drag = true; set(e); });
    cv.addEventListener('mousemove', e=>{ if(_pvs.drag) set(e); });
    cv.addEventListener('mouseup', ()=>{ _pvs.drag = false; });
    cv.addEventListener('mouseleave', ()=>{ _pvs.drag = false; });
    cv.addEventListener('click', set);
  }
  _pvs = {f:.08, h:.06, round:false, drag:false}; pvsDraw();
}
function pvsRound(){ _pvs.round = !_pvs.round; pvsDraw(); }
function pvsDraw(){
  const rb = document.getElementById('pvs-r');
  if(rb){ rb.textContent = 'lip rounding: ' + (_pvs.round?'on':'off');
          rb.style.background = _pvs.round?'var(--accent2)':'var(--surface2)'; rb.style.color = _pvs.round?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('pvs-canvas', 260); if(!c) return;
  const {x, w} = c;
  const L = 40, T = 34, PW = Math.min(320, w-300), PH = 190;
  // trapezoid
  x.beginPath();
  x.moveTo(L, T); x.lineTo(L+PW, T);
  x.lineTo(L+PW*0.86, T+PH); x.lineTo(L+PW*0.22, T+PH);
  x.closePath();
  x.fillStyle = 'rgba(79,70,229,0.05)'; x.fill();
  x.strokeStyle = MTC.line2; x.lineWidth = 1.2; x.stroke();
  mtTxt(x, 'front', L, T-12, {size:9, col:MTC.muted});
  mtTxt(x, 'back', L+PW, T-12, {size:9, col:MTC.muted, align:'right'});
  x.save(); x.translate(L-16, T+PH/2); x.rotate(-Math.PI/2);
  mtTxt(x, 'high \u2190 height \u2192 low', 0, 0, {size:9, col:MTC.muted, align:'center'}); x.restore();
  // vowels
  let nearest = PVS_V[0], best = 9;
  PVS_V.forEach(v=>{
    const px = L + v.f*PW, py = T + v.h*PH;
    const d = Math.hypot(v.f-_pvs.f, v.h-_pvs.h);
    if(d < best){ best = d; nearest = v; }
    x.beginPath(); x.arc(px, py, 4, 0, 7);
    x.fillStyle = v.r ? MTC.a5 : MTC.a1; x.fill();
    mtTxt(x, v.p, px+7, py, {size:8.5, col:MTC.muted});
  });
  // cursor
  const cxp = L + _pvs.f*PW, cyp = T + _pvs.h*PH;
  x.beginPath(); x.arc(cxp, cyp, 9, 0, 7);
  x.strokeStyle = MTC.a2; x.lineWidth = 2.4; x.stroke();
  // tract cross-section
  const TX = L+PW+40, TW = w-TX-24, TY = 60;
  x.strokeStyle = MTC.line2; x.lineWidth = 1.4;
  x.beginPath(); x.moveTo(TX, TY); x.bezierCurveTo(TX+TW*0.4, TY-16, TX+TW*0.7, TY-8, TX+TW, TY+16); x.stroke();
  x.beginPath(); x.moveTo(TX, TY+80); x.lineTo(TX+TW, TY+96); x.stroke();
  // tongue hump: position from frontness, height from height
  const humpX = TX + (1-_pvs.f)*TW*0.72 + TW*0.12;
  const humpY = TY + 16 + _pvs.h*46;
  x.fillStyle = 'rgba(159,18,57,0.30)';
  x.beginPath();
  x.moveTo(TX, TY+80);
  x.bezierCurveTo(humpX-40, TY+80, humpX-30, humpY, humpX, humpY);
  x.bezierCurveTo(humpX+30, humpY, humpX+40, TY+84, TX+TW, TY+96);
  x.lineTo(TX+TW, TY+110); x.lineTo(TX, TY+96); x.closePath(); x.fill();
  // lips
  const lipGap = _pvs.round ? 8 : 20;
  x.strokeStyle = _pvs.round ? MTC.a5 : MTC.line2; x.lineWidth = _pvs.round?3:2;
  x.beginPath(); x.moveTo(TX-4, TY+2); x.lineTo(TX-4, TY+40-lipGap/2); x.stroke();
  x.beginPath(); x.moveTo(TX-4, TY+40+lipGap/2); x.lineTo(TX-4, TY+80); x.stroke();
  mtTxt(x, _pvs.round?'rounded':'unrounded', TX+TW/2, TY+126, {size:9, col: _pvs.round?MTC.a5:MTC.muted, align:'center'});
  mtTxt(x, 'VOCAL TRACT', TX, 30, {size:9, col:MTC.muted});
  // readout
  const hLab = _pvs.h<0.33?'high':_pvs.h<0.66?'mid':'low';
  const fLab = _pvs.f<0.33?'front':_pvs.f<0.66?'central':'back';
  mtTxt(x, hLab + ' ' + fLab + (_pvs.round?' rounded':''), L, T+PH+26, {size:11, col:MTC.a2, weight:'700'});
  mtTxt(x, 'nearest: [' + nearest.p + '] as in ' + nearest.w, L, T+PH+44, {size:10, col:MTC.text});
  mtSet('pvs-cap', 'Tongue <b>' + hLab + '</b>, bunched <b>' + fLab + '</b>: the nearest English vowel is <b>[' + nearest.p + ']</b>, the vowel of <em>' + nearest.w + '</em>. Notice how the cross-section on the right changes shape rather than closing: vowels never obstruct the tract, they only reshape it, and that shape is what the formants in Section 14.4.5 measure.');
}

/* ── Diphthong Tracer ─────────────────────────────────────── */
const PDT = [
  {p:'ay', w:'bite', from:[.55,.90], to:[.16,.16]},
  {p:'aw', w:'bout', from:[.50,.90], to:[.84,.16]},
  {p:'oy', w:'boy',  from:[.86,.66], to:[.18,.22]},
  {p:'ey', w:'bait', from:[.22,.48], to:[.14,.20]},
  {p:'ow', w:'boat', from:[.78,.56], to:[.88,.14]},
  {p:'iy', w:'beet (a point vowel, for contrast)', from:[.08,.06], to:[.08,.06]}
];
let _pdt = {i:0, t:0, raf:null};
function pdtBuild(){
  const b = document.getElementById('pdt-btns');
  if(b) b.innerHTML = PDT.map((d,i)=>`<button style="${MTBTN}" id="pdt-b${i}" onclick="pdtGo(${i})">[${d.p}]</button>`).join('');
  _pdt = {i:0, t:0, raf:null}; pdtGo(0);
}
function pdtGo(i){
  _pdt.i = i; _pdt.t = 0;
  if(_pdt.raf) cancelAnimationFrame(_pdt.raf);
  const t0 = Date.now();
  const step = ()=>{ _pdt.t = Math.min(1, (Date.now()-t0)/1200); pdtDraw();
    if(_pdt.t < 1) _pdt.raf = requestAnimationFrame(step); };
  step();
}
function pdtDraw(){
  PDT.forEach((_,i)=>{ const e = document.getElementById('pdt-b'+i); if(e){
    e.style.background = i===_pdt.i ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pdt.i ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('pdt-canvas', 240); if(!c) return;
  const {x, w} = c;
  const L = 40, T = 26, PW = Math.min(340, w-260), PH = 176;
  x.beginPath();
  x.moveTo(L, T); x.lineTo(L+PW, T);
  x.lineTo(L+PW*0.86, T+PH); x.lineTo(L+PW*0.22, T+PH);
  x.closePath();
  x.fillStyle = 'rgba(79,70,229,0.05)'; x.fill();
  x.strokeStyle = MTC.line2; x.lineWidth = 1.2; x.stroke();
  PVS_V.forEach(v=>{
    const px = L + v.f*PW, py = T + v.h*PH;
    x.beginPath(); x.arc(px, py, 2.6, 0, 7); x.fillStyle = MTC.line2; x.fill();
    mtTxt(x, v.p, px+6, py, {size:7.5, col:MTC.muted});
  });
  const D = PDT[_pdt.i];
  const p1 = {x: L+D.from[0]*PW, y: T+D.from[1]*PH};
  const p2 = {x: L+D.to[0]*PW,   y: T+D.to[1]*PH};
  const isPoint = D.from[0]===D.to[0] && D.from[1]===D.to[1];
  if(!isPoint){
    x.strokeStyle = 'rgba(159,18,57,0.30)'; x.lineWidth = 2.5;
    x.beginPath(); x.moveTo(p1.x, p1.y); x.lineTo(p2.x, p2.y); x.stroke();
    const e = mtEase(_pdt.t);
    const cur = {x: mtLerp(p1.x, p2.x, e), y: mtLerp(p1.y, p2.y, e)};
    x.strokeStyle = MTC.a2; x.lineWidth = 3;
    x.beginPath(); x.moveTo(p1.x, p1.y); x.lineTo(cur.x, cur.y); x.stroke();
    x.beginPath(); x.arc(cur.x, cur.y, 7, 0, 7); x.fillStyle = MTC.a2; x.fill();
    x.beginPath(); x.arc(p1.x, p1.y, 4, 0, 7); x.fillStyle = MTC.a4; x.fill();
    mtTxt(x, 'start', p1.x+9, p1.y+10, {size:8, col:MTC.a4});
    mtTxt(x, 'end', p2.x+9, p2.y-8, {size:8, col:MTC.a2});
  } else {
    x.beginPath(); x.arc(p1.x, p1.y, 8, 0, 7); x.fillStyle = MTC.a1; x.fill();
  }
  // side timeline
  const TX = L+PW+34, TW = w-TX-24;
  mtTxt(x, 'TONGUE POSITION OVER TIME', TX, 30, {size:9, col:MTC.muted});
  ['frontness','height'].forEach((lab, k)=>{
    const y = 54 + k*64;
    mtTxt(x, lab, TX, y-8, {size:8.5, col:MTC.muted});
    x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(TX, y+40); x.lineTo(TX+TW, y+40); x.stroke();
    x.strokeStyle = k? MTC.a5 : MTC.a1; x.lineWidth = 2;
    x.beginPath();
    for(let p=0;p<=TW;p++){
      const t = p/TW;
      const v = isPoint ? D.from[k] : mtLerp(D.from[k], D.to[k], mtEase(Math.min(1, t/0.9)));
      const yy = y + v*40;
      p ? x.lineTo(TX+p, yy) : x.moveTo(TX+p, yy);
    }
    x.stroke();
  });
  mtTxt(x, '[' + D.p + '] as in ' + D.w, L, T+PH+28, {size:11.5, col:MTC.a2, weight:'700'});
  mtSet('pdt-cap', isPoint
    ? '[iy] is a <b>point vowel</b>: both traces on the right are flat, because the tongue holds one position for the duration. Compare any of the diphthongs.'
    : '[' + D.p + '] is a <b>path</b>. The traces on the right show frontness and height changing continuously during a single vowel, which is why one symbol has to stand for a movement rather than a position.');
}

/* ══ 14.2.4 SYLLABLES ═════════════════════════════════════ */
PH_PAGES.physyl = `
<div class="lesson-chapter-label">Section 14.2.4</div>
<h1 class="lesson-h1">Grouping Sounds Around a Vowel</h1>
<p class="lesson-intro">Phones group into syllables, usually around a vowel but sometimes around a syllabic consonant. Syllable structure helps describe stress, rhythm, and the sound sequences a language permits.</p>

<h2 class="lesson-h2">The Anatomy of a Syllable</h2>
<p class="lesson-p">A syllable has a <strong>nucleus</strong>, almost always a vowel, which is the loud core. Consonants before it are the <strong>onset</strong>; consonants after it are the <strong>coda</strong>. The nucleus and coda together form the <strong>rime</strong>, the unit that rhyming depends on: <em>ham</em> and <em>ram</em> rhyme because they share a rime, regardless of onset.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Syllable Tree Builder</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="psy-btns"></div>
    <canvas id="psy-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="psy-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Which Clusters Are Legal</h2>
<p class="lesson-p">Every language restricts which consonant sequences may occupy an onset or coda, and those restrictions are its <strong>phonotactics</strong>. English permits three-consonant onsets, but only on a strict template: [s], then a voiceless stop, then a liquid or glide. That template licenses <em>strike</em>, <em>splash</em> and <em>scream</em>, and rules out [zdr] or [tsp], which are perfectly pronounceable and simply not English.</p>
<p class="lesson-p">This knowledge is unconscious and reliable: an English speaker who has never studied phonology will still judge <em>blick</em> a possible word and <em>bnick</em> an impossible one. Speech recognizers exploit the same constraints to prune hypotheses that could not be English regardless of what the acoustics suggest.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Phonotactic Gate</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="ppg-btns"></div>
    <canvas id="ppg-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="ppg-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qph-sy"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why do <em>ham</em> and <em>ram</em> rhyme?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-sy','Correct. Rhyme depends on the rime, the nucleus plus coda; the onset is free to differ.')">They share a rime, the nucleus plus coda, and differ only in onset</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-sy','Their onsets are [h] and [r], which are different; that is precisely what rhyme allows.')">They share an onset</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-sy','Phone count is incidental; many rhyming pairs differ in length.')">They contain the same number of phones</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-sy','Spelling is not the criterion: <em>rough</em> and <em>cuff</em> rhyme despite dissimilar spelling.')">They are spelled similarly</button>
</div><div class="quiz-explain" id="qph-sy-explain"></div></div>`;

/* ── Syllable Tree ────────────────────────────────────────── */
const PSY = [
  {w:'ham',    onset:['hh'],        nuc:['ae'], coda:['m'],       note:'The simplest shape: one consonant either side of the vowel.'},
  {w:'green',  onset:['g','r'],     nuc:['iy'], coda:['n'],       note:'A two-consonant onset. English allows a stop followed by a liquid, which is why <em>green</em> and <em>bring</em> are fine.'},
  {w:'eggs',   onset:[],            nuc:['eh'], coda:['g','z'],   note:'An empty onset. Nothing requires a syllable to begin with a consonant, and the coda here carries two.'},
  {w:'strike', onset:['s','t','r'], nuc:['ay'], coda:['k'],       note:'The maximal English onset: [s] plus voiceless stop plus liquid. No English word begins with four consonants.'}
];
let _psy = 0;
function psyBuild(){
  const b = document.getElementById('psy-btns');
  if(b) b.innerHTML = PSY.map((s2,i)=>`<button style="${MTBTN}" id="psy-b${i}" onclick="psyGo(${i})">${s2.w}</button>`).join('');
  _psy = 0; psyDraw(); ppgBuild();
}
function psyGo(i){ _psy = i; psyDraw(); }
function psyDraw(){
  PSY.forEach((_,i)=>{ const e = document.getElementById('psy-b'+i); if(e){
    e.style.background = i===_psy ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_psy ? '#FAFBFF' : 'var(--muted)'; } });
  const S = PSY[_psy];
  const c = mtCtx('psy-canvas', 250); if(!c) return;
  const {x, w} = c;
  const cx2 = w/2;
  const node = (px, py, lab, col, wide)=>{
    const bw = wide||64;
    mtChip(x, px-bw/2, py, bw, 26, col+'1C', col, lab, col, 10);
    return {x:px, y:py, h:26};
  };
  const link = (a, b2)=>{
    x.strokeStyle = MTC.line2; x.lineWidth = 1.2;
    x.beginPath(); x.moveTo(a.x, a.y+a.h); x.lineTo(b2.x, b2.y); x.stroke();
  };
  const sig = node(cx2, 20, '\u03C3', MTC.a2, 44);
  const onX = cx2 - 130, rimeX = cx2 + 90;
  const on = node(onX, 74, 'Onset', MTC.a1, 74);
  const rime = node(rimeX, 74, 'Rime', MTC.a5, 74);
  link(sig, on); link(sig, rime);
  const nuc = node(rimeX-52, 128, 'Nucleus', MTC.a4, 78);
  const cod = node(rimeX+52, 128, 'Coda', MTC.a4, 70);
  link(rime, nuc); link(rime, cod);
  const drop = (parent, phones, y)=>{
    if(!phones.length){
      mtTxt(x, '\u2205', parent.x, y+14, {size:14, col:MTC.muted, align:'center'});
      return;
    }
    const totalW = phones.length*46;
    phones.forEach((p, i)=>{
      const px = parent.x - totalW/2 + i*46 + 23;
      mtChip(x, px-20, y, 40, 26, 'rgba(23,27,52,0.05)', MTC.line2, '['+p+']', MTC.text, 10);
      x.strokeStyle = MTC.line; x.lineWidth = 1;
      x.beginPath(); x.moveTo(parent.x, parent.y+parent.h); x.lineTo(px, y); x.stroke();
    });
  };
  drop(on, S.onset, 128);
  drop(nuc, S.nuc, 182);
  drop(cod, S.coda, 182);
  // linear form
  const all = S.onset.concat(S.nuc, S.coda);
  mtTxt(x, S.w + '  \u2192  [' + all.join(' ') + ']', 16, 232, {size:12, col:MTC.text});
  mtSet('psy-cap', S.note + ' The rime (' + S.nuc.concat(S.coda).map(p=>'['+p+']').join(' ') + ') is what rhyming depends on.');
}

/* ── Phonotactic Gate ─────────────────────────────────────── */
const PPG = [
  {c:['s','t','r'], ok:true,  ex:'strike',  why:'[s] + voiceless stop + liquid. The maximal English onset template, and every three-consonant onset in the language fits it.'},
  {c:['s','p','l'], ok:true,  ex:'splash',  why:'Same template with [p] and [l] substituted. Legal.'},
  {c:['s','k','r'], ok:true,  ex:'scream',  why:'Same template again. English has exactly three stops available for the middle slot: [p], [t], [k].'},
  {c:['z','d','r'], ok:false, ex:'\u2014',  why:'Voiced [z] cannot open a cluster in English, and the middle stop must be voiceless. Perfectly pronounceable, and used in other languages, but not English.'},
  {c:['t','s','p'], ok:false, ex:'\u2014',  why:'Wrong order entirely: the fricative must come first. [ts] does occur word-initially in German and Japanese.'},
  {c:['b','l'],     ok:true,  ex:'blick',   why:'Stop plus liquid, a legal two-consonant onset. <em>Blick</em> is not a word, but every English speaker judges it a possible one.'},
  {c:['b','n'],     ok:false, ex:'\u2014',  why:'Stop plus nasal is not a legal English onset, which is why <em>bnick</em> feels impossible while <em>blick</em> does not. Neither is a real word; only one could be.'}
];
let _ppg = 0;
function ppgBuild(){
  const b = document.getElementById('ppg-btns');
  if(b) b.innerHTML = PPG.map((p,i)=>
    `<button style="${MTBTN}" id="ppg-b${i}" onclick="ppgGo(${i})">[${p.c.join(' ')}]</button>`).join('');
  _ppg = 0; ppgDraw();
}
function ppgGo(i){ _ppg = i; ppgDraw(); }
function ppgDraw(){
  PPG.forEach((_,i)=>{ const e = document.getElementById('ppg-b'+i); if(e){
    e.style.background = i===_ppg ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_ppg ? '#FAFBFF' : 'var(--muted)'; } });
  const P = PPG[_ppg];
  const c = mtCtx('ppg-canvas', 176); if(!c) return;
  const {x, w} = c;
  // template slots
  const slots = [['s only','fricative'], ['p t k','voiceless stop'], ['l r w y','liquid/glide']];
  const sw = 118;
  const startX = (w - slots.length*(sw+14))/2;
  slots.forEach(([allow, lab], i)=>{
    const px = startX + i*(sw+14);
    const filled = P.c[i];
    const good = filled && allow.split(' ').includes(filled);
    mtChip(x, px, 40, sw, 34, good?'rgba(11,132,87,0.13)':(filled?'rgba(159,18,57,0.13)':'rgba(23,27,52,0.04)'),
      good?MTC.a4:(filled?MTC.a2:MTC.line), filled?'['+filled+']':'\u2205', MTC.text, 12);
    mtTxt(x, lab, px+sw/2, 88, {size:8.5, col:MTC.muted, align:'center'});
    mtTxt(x, 'allowed: ' + allow, px+sw/2, 102, {size:8, col:MTC.muted, align:'center'});
    if(filled && !good) mtTxt(x, '\u2717', px+sw-14, 57, {size:12, col:MTC.a2});
  });
  mtTxt(x, 'ENGLISH ONSET TEMPLATE', startX, 28, {size:9, col:MTC.muted});
  // verdict
  mtChip(x, startX, 124, slots.length*(sw+14)-14, 34,
    P.ok?'rgba(11,132,87,0.16)':'rgba(159,18,57,0.16)', P.ok?MTC.a4:MTC.a2,
    P.ok ? 'LEGAL  \u00b7  ' + P.ex : 'ILLEGAL IN ENGLISH', P.ok?MTC.a4:MTC.a2, 11);
  mtSet('ppg-cap', P.why);
}

/* ══ 14.3 PROSODY ═════════════════════════════════════════ */
PH_PAGES.phpros = `
<div class="lesson-chapter-label">Section 14.3</div>
<h1 class="lesson-h1">Rhythm, Pitch, and Emphasis</h1>
<p class="lesson-intro">Everything so far concerned individual phones. But meaning also rides on properties that stretch across whole syllables, words and sentences: which words are emphasized, where the speaker pauses, whether the melody rises or falls. This layer is <strong>prosody</strong>, and it is carried by three acoustic channels working simultaneously.</p>

<h2 class="lesson-h2">Three Channels, One Signal</h2>
<p class="lesson-p"><strong>Fundamental frequency</strong> (F0) is the rate of vocal fold vibration, heard as pitch. <strong>Energy</strong> is the amount of acoustic power, heard as loudness. <strong>Duration</strong> is how long each segment lasts, heard as rhythm and tempo. Prosodic phenomena almost never use just one: a stressed syllable is typically higher in pitch <em>and</em> louder <em>and</em> longer, and listeners integrate all three.</p>
<p class="lesson-p">Toggle the tracks below to isolate each contribution and see how much of the prosodic picture survives when one channel is removed.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Prosody Triptych</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" id="ptr-f0" onclick="ptrTog('f0')">F0 contour</button>
      <button style="${MTBTN}" id="ptr-en" onclick="ptrTog('en')">energy envelope</button>
      <button style="${MTBTN}" id="ptr-du" onclick="ptrTog('du')">duration</button>
    </div>
    <canvas id="pros-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="ptr-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Because these channels are continuous and always present, prosody is where a great deal of speaker meaning lives that text simply cannot record. The same words, with different prosody, can be a question, a statement, a correction, or sarcasm.</p>

<div class="quiz-block" id="qph-pr"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Which acoustic property corresponds to perceived pitch?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-pr','Correct. Fundamental frequency is the vocal fold vibration rate, and pitch is its perceptual correlate.')">Fundamental frequency, the rate of vocal fold vibration</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-pr','Amplitude corresponds to loudness, not pitch.')">Amplitude</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-pr','Duration corresponds to length and rhythm.')">Duration</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-pr','Formants determine vowel identity, not pitch; they can stay fixed while pitch changes.')">Formant frequency</button>
</div><div class="quiz-explain" id="qph-pr-explain"></div></div>`;

/* ── Prosody Triptych ─────────────────────────────────────── */
const PTR_W = [
  {w:'the',   d:.06, f0:.42, en:.30},
  {w:'CAT',   d:.16, f0:.86, en:.92},
  {w:'sat',   d:.13, f0:.55, en:.62},
  {w:'on',    d:.07, f0:.40, en:.34},
  {w:'the',   d:.06, f0:.38, en:.30},
  {w:'mat',   d:.20, f0:.22, en:.58}
];
let _ptro = {f0:true, en:true, du:true};
function ptrBuild(){ _ptro = {f0:true, en:true, du:true}; ptrDraw(); }
function ptrTog(k){ _ptro[k] = !_ptro[k]; ptrDraw(); }
function ptrDraw(){
  ['f0','en','du'].forEach(k=>{ const e = document.getElementById('ptr-'+k); if(e){
    e.style.background = _ptro[k] ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = _ptro[k] ? '#FAFBFF' : 'var(--muted)'; } });
  const rows = ['f0','en','du'].filter(k=>_ptro[k]);
  const c = mtCtx('pros-canvas', 60 + rows.length*66 + 34); if(!c) return;
  const {x, w} = c;
  const L = 46, PW = w-L-20;
  const totalD = PTR_W.reduce((a,v)=>a+v.d, 0);
  const spans = [];
  let acc = 0;
  PTR_W.forEach(v=>{
    const wd = _ptro.du ? (v.d/totalD)*PW : PW/PTR_W.length;
    spans.push({x: L+acc, w: wd, v});
    acc += wd;
  });
  let y = 20;
  rows.forEach(k=>{
    const lab = {f0:'F0 (Hz)', en:'ENERGY', du:'DURATION'}[k];
    const col = {f0:MTC.a1, en:MTC.a5, du:MTC.a4}[k];
    mtTxt(x, lab, 6, y+8, {size:8.5, col:MTC.muted});
    if(k==='f0'){
      x.strokeStyle = col; x.lineWidth = 2.2;
      x.beginPath();
      spans.forEach((s2, i)=>{
        for(let p=0;p<=s2.w;p+=2){
          const t = p/s2.w;
          const prev = i? spans[i-1].v.f0 : s2.v.f0;
          const val = mtLerp(prev, s2.v.f0, Math.min(1, t*1.6));
          const yy = y + 46 - val*40;
          (i===0 && p===0) ? x.moveTo(s2.x+p, yy) : x.lineTo(s2.x+p, yy);
        }
      });
      x.stroke();
      mtTxt(x, '260', 40, y+8, {size:7.5, col:MTC.muted, align:'right'});
      mtTxt(x, '80', 40, y+46, {size:7.5, col:MTC.muted, align:'right'});
    } else if(k==='en'){
      spans.forEach(s2=>{
        const h = s2.v.en*42;
        x.fillStyle = col+'AA';
        mtRR(x, s2.x+2, y+48-h, s2.w-4, h, 3); x.fill();
      });
    } else {
      spans.forEach(s2=>{
        mtRR(x, s2.x+2, y+16, s2.w-4, 20, 3); x.fillStyle = col+'55'; x.fill();
        if(s2.w>34) mtTxt(x, (s2.v.d*1000).toFixed(0)+'ms', s2.x+s2.w/2, y+26, {size:7.5, col:MTC.text, align:'center'});
      });
    }
    y += 66;
  });
  // word row
  spans.forEach(s2=>{
    const stressed = s2.v.w === s2.v.w.toUpperCase();
    mtChip(x, s2.x+2, y, s2.w-4, 26,
      stressed?'rgba(159,18,57,0.13)':'rgba(23,27,52,0.04)', stressed?MTC.a2:MTC.line,
      s2.v.w.toLowerCase(), MTC.text, 10);
  });
  const active = rows.length;
  mtSet('ptr-cap', active===3
    ? 'All three channels agree on <em>cat</em>: it is the highest in pitch, the loudest, and among the longest. That convergence is what makes it hear as emphasized.'
    : active===0 ? 'With every channel off there is no prosody left, only a string of words. This is what a text-only model receives.'
    : 'Only ' + rows.map(k=>({f0:'pitch',en:'loudness',du:'timing'}[k])).join(' and ') + ' remaining. Prominence is still partly recoverable, because the channels are redundant: listeners can identify a stressed syllable from any one of them, though less reliably than from all three.');
}

/* ══ 14.3.1 PROMINENCE ════════════════════════════════════ */
PH_PAGES.phprom = `
<div class="lesson-chapter-label">Section 14.3.1</div>
<h1 class="lesson-h1">What Makes a Word Stand Out</h1>
<p class="lesson-intro">Prominence is not binary. English syllables occupy a continuum with at least four useful levels, and where a syllable lands depends on both its fixed lexical properties and the speaker&rsquo;s momentary intent.</p>

<h2 class="lesson-h2">Four Levels</h2>
<p class="lesson-p">At the top, an <strong>accented</strong> syllable carries a pitch movement the speaker placed there to mark the word as important right now. Below it, a <strong>stressed</strong> syllable is the one the dictionary marks as the strong syllable of that word, whether or not it is accented in this utterance. Below that, a syllable with a <strong>full vowel</strong> but no stress. At the bottom, a <strong>reduced</strong> syllable whose vowel has collapsed to schwa [ax].</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Prominence Ladder</span></div>
  <div class="viz-body">
    <canvas id="ppl-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="ppl-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Accent Lands on the Stressed Syllable</h2>
<p class="lesson-p">These two levels interact in a specific way: when a speaker accents a word, the accent does not float freely, it docks onto whichever syllable the lexicon marks as stressed. You can emphasize <em>surprised</em> as much as you like and the pitch movement will still land on <em>-prised</em>. Producing SUR-prised instead does not sound like emphasis, it sounds like a mispronunciation.</p>
<p class="lesson-p">In a few English pairs, the position of lexical stress is the only thing distinguishing two words, which makes the lexical layer impossible to dismiss as decoration.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Where the Accent Docks</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pac-btns"></div>
    <canvas id="pac-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pac-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Reduction</h2>
<p class="lesson-p">The bottom of the ladder deserves its own attention because it is where most of the trouble for speech recognition originates. An unstressed vowel tends to lose its distinctive articulation and drift toward the neutral centre of the vowel space, becoming schwa [ax]. The tongue simply does not travel all the way to the target before it has to leave for the next sound.</p>
<p class="lesson-p">Drag the dial below to watch a full vowel reduce. The consequence is that the same word has different phone sequences depending on stress: the vowel in <em>parakeet</em>&rsquo;s second syllable is a schwa, and the [uw] of <em>to</em> collapses to [ax] the moment the word is unstressed, as in <em>going to the shop</em>. A recognizer matching against dictionary pronunciations meets reduced forms constantly.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Reduction Dial</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">stress \u2192 reduction</span>
      <input id="prd-r" type="range" min="0" max="1" step="0.05" value="0" oninput="prdDraw()" style="width:200px;accent-color:var(--accent)">
      <span id="prd-l" style="${MTLBL}"></span>
    </div>
    <canvas id="prd-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="prd-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qph-pm"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does vowel reduction complicate speech recognition?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-pm','Correct. The realized phone sequence departs from the dictionary pronunciation, so acoustic evidence must be matched against a form that was never listed.')">The realized phones differ from the dictionary pronunciation the system matches against</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-pm','Reduced vowels are quieter and shorter but remain audible; the issue is identity, not audibility.')">Reduced vowels are completely inaudible</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-pm','Reduction typically shortens words rather than lengthening them.')">Reduction makes words longer than expected</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-pm','Reduction affects vowels; consonants undergo separate processes such as deletion and flapping.')">It changes consonants into vowels</button>
</div><div class="quiz-explain" id="qph-pm-explain"></div></div>`;

/* ── Prominence Ladder ────────────────────────────────────── */
const PPL_SYL = [
  {s:'I\u2019m', lvl:2, v:'ay'}, {s:'a', lvl:0, v:'ax'}, {s:'LIT', lvl:3, v:'ih'}, {s:'tle', lvl:0, v:'ax'},
  {s:'sur', lvl:1, v:'er'}, {s:'PRISED', lvl:3, v:'ay'}, {s:'to', lvl:0, v:'ax'}, {s:'hear', lvl:2, v:'iy'},
  {s:'it', lvl:0, v:'ih'}, {s:'char', lvl:1, v:'eh'}, {s:'ac', lvl:1, v:'ax'}, {s:'ter', lvl:0, v:'ax'},
  {s:'ized', lvl:1, v:'ay'}, {s:'as', lvl:0, v:'ax'}, {s:'HAP', lvl:3, v:'ae'}, {s:'py', lvl:1, v:'iy'}
];
const PPL_LVL = ['reduced', 'full vowel', 'stressed', 'accented'];
let _ppl = -1;
function pplBuild(){
  const cv = document.getElementById('ppl-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('mousemove', e=>{
      const r = cv.getBoundingClientRect();
      const cw = (r.width-70)/PPL_SYL.length;
      const i = Math.floor((e.clientX-r.left-60)/cw);
      const h = (i>=0 && i<PPL_SYL.length) ? i : -1;
      if(h!==_ppl){ _ppl = h; pplDraw(); }
    });
    cv.addEventListener('mouseleave', ()=>{ _ppl=-1; pplDraw(); });
  }
  _ppl = -1; pplDraw();
}
function pplDraw(){
  const c = mtCtx('ppl-canvas', 236); if(!c) return;
  const {x, w} = c;
  const L = 60, PW = w-L-14, cw = PW/PPL_SYL.length;
  PPL_LVL.forEach((lab, k)=>{
    const y = 176 - k*44;
    x.strokeStyle = MTC.line; x.lineWidth = 1;
    x.beginPath(); x.moveTo(L, y); x.lineTo(L+PW, y); x.stroke();
    mtTxt(x, lab, L-6, y, {size:8.5, col: k===3?MTC.a2:MTC.muted, align:'right'});
  });
  PPL_SYL.forEach((s2, i)=>{
    const px = L + i*cw, y = 176 - s2.lvl*44;
    const on = i===_ppl;
    const col = s2.lvl===3 ? MTC.a2 : s2.lvl===2 ? MTC.a5 : s2.lvl===1 ? MTC.a1 : MTC.muted;
    x.beginPath(); x.arc(px+cw/2, y, on?7:5, 0, 7);
    x.fillStyle = col; x.fill();
    if(i>0){
      const py = 176 - PPL_SYL[i-1].lvl*44;
      x.strokeStyle = 'rgba(23,27,52,0.15)'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(px-cw/2, py); x.lineTo(px+cw/2, y); x.stroke();
    }
    x.save(); x.translate(px+cw/2, 200); x.rotate(-Math.PI/3.4);
    mtTxt(x, s2.s, 0, 0, {size:8.5, col: s2.lvl>=2?MTC.text:MTC.muted}); x.restore();
  });
  mtSet('ppl-cap', _ppl>=0
    ? '<b>' + PPL_SYL[_ppl].s + '</b> \u00b7 ' + PPL_LVL[PPL_SYL[_ppl].lvl] + ', vowel [' + PPL_SYL[_ppl].v + ']' +
      (PPL_SYL[_ppl].lvl===0 ? '. Reduced to schwa: the tongue never reaches a distinct target.' : '')
    : 'One sentence across four levels. The three accented syllables carry the speaker\u2019s emphasis; the reduced ones, all schwa, are where the signal gives a recognizer least to work with. Hover any syllable.');
}

/* ── Accent docking ───────────────────────────────────────── */
const PAC = [
  {w:'surprised', syl:['sur','prised'], stress:1, alt:0,
   note:'Lexical stress is on the second syllable. Accenting the word makes the pitch peak land there; forcing it onto <em>sur-</em> does not sound emphatic, it sounds wrong.'},
  {w:'content (noun)', syl:['CON','tent'], stress:0, alt:1, arp:'[K AA1 N T EH0 N T]',
   note:'As a noun meaning <em>what is inside</em>, stress falls on the first syllable. The digits in the ARPAbet transcription encode stress level: 1 for primary, 0 for unstressed.'},
  {w:'content (adjective)', syl:['con','TENT'], stress:1, alt:0, arp:'[K AA0 N T EH1 N T]',
   note:'As an adjective meaning <em>satisfied</em>, stress moves to the second syllable. Identical phones, different stress, different word: proof that lexical stress carries meaning.'},
  {w:'parakeet', syl:['PAR','a','keet'], stress:0, alt:2, arp:'[P AE1 R AX0 K IY2 T]',
   note:'Stress on the first syllable, and note the middle vowel: [ax], a schwa. It is unstressed, so it reduces.'}
];
let _pac = 0;
function pacBuild(){
  const b = document.getElementById('pac-btns');
  if(b) b.innerHTML = PAC.map((p,i)=>`<button style="${MTBTN}" id="pac-b${i}" onclick="pacGo(${i})">${p.w}</button>`).join('');
  _pac = 0; pacDraw();
}
function pacGo(i){ _pac = i; pacDraw(); }
function pacDraw(){
  PAC.forEach((_,i)=>{ const e = document.getElementById('pac-b'+i); if(e){
    e.style.background = i===_pac ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pac ? '#FAFBFF' : 'var(--muted)'; } });
  const P = PAC[_pac];
  const c = mtCtx('pac-canvas', 200); if(!c) return;
  const {x, w} = c;
  const n = P.syl.length;
  const sw = Math.min(120, (w-80)/n);
  const startX = (w - sw*n)/2;
  // F0 contour with peak at stressed syllable
  x.strokeStyle = MTC.a1; x.lineWidth = 2.4;
  x.beginPath();
  for(let p=0;p<=sw*n;p++){
    const t = p/(sw*n);
    const peak = (P.stress+0.5)/n;
    const yy = 92 - 40*Math.exp(-Math.pow((t-peak)*4.2, 2)) + 12*t;
    p ? x.lineTo(startX+p, yy) : x.moveTo(startX+p, yy);
  }
  x.stroke();
  mtTxt(x, 'F0', startX-24, 70, {size:9, col:MTC.a1});
  P.syl.forEach((s2, i)=>{
    const px = startX + i*sw;
    const on = i===P.stress;
    mtChip(x, px+3, 110, sw-6, 34, on?'rgba(159,18,57,0.14)':'rgba(23,27,52,0.04)', on?MTC.a2:MTC.line,
      s2, MTC.text, on?13:11);
    if(on){
      x.strokeStyle = MTC.a2; x.lineWidth = 1.4; x.setLineDash([3,3]);
      x.beginPath(); x.moveTo(px+sw/2, 106); x.lineTo(px+sw/2, 56); x.stroke(); x.setLineDash([]);
      mtTxt(x, 'accent docks here', px+sw/2, 46, {size:8.5, col:MTC.a2, align:'center'});
    }
  });
  if(P.arp) mtTxt(x, P.arp, w/2, 168, {size:11, col:MTC.a5, align:'center'});
  mtSet('pac-cap', P.note);
}

/* ── Reduction Dial ───────────────────────────────────────── */
function prdDraw(){
  const r = +(document.getElementById('prd-r')||{value:0}).value;
  mtSet('prd-l', r<0.2?'full vowel':r<0.7?'partly reduced':'schwa');
  const c = mtCtx('prd-canvas', 210); if(!c) return;
  const {x, w} = c;
  // vowel space with the vowel migrating to centre
  const L = 46, T = 24, PW = Math.min(260, w-330), PH = 130;
  x.beginPath();
  x.moveTo(L, T); x.lineTo(L+PW, T);
  x.lineTo(L+PW*0.86, T+PH); x.lineTo(L+PW*0.22, T+PH); x.closePath();
  x.fillStyle = 'rgba(79,70,229,0.05)'; x.fill();
  x.strokeStyle = MTC.line2; x.stroke();
  const from = {f:.08, h:.06}, to = {f:.50, h:.48};
  const cf = mtLerp(from.f, to.f, r), ch = mtLerp(from.h, to.h, r);
  x.beginPath(); x.arc(L+to.f*PW, T+to.h*PH, 5, 0, 7); x.fillStyle = MTC.line2; x.fill();
  mtTxt(x, 'ax', L+to.f*PW+8, T+to.h*PH, {size:8.5, col:MTC.muted});
  x.beginPath(); x.arc(L+from.f*PW, T+from.h*PH, 4, 0, 7); x.fillStyle = 'rgba(79,70,229,0.35)'; x.fill();
  mtTxt(x, 'iy', L+from.f*PW+8, T+from.h*PH, {size:8.5, col:MTC.muted});
  x.strokeStyle = 'rgba(159,18,57,0.35)'; x.lineWidth = 1.5; x.setLineDash([4,4]);
  x.beginPath(); x.moveTo(L+from.f*PW, T+from.h*PH); x.lineTo(L+to.f*PW, T+to.h*PH); x.stroke(); x.setLineDash([]);
  x.beginPath(); x.arc(L+cf*PW, T+ch*PH, 8, 0, 7); x.fillStyle = MTC.a2; x.fill();
  mtTxt(x, 'VOWEL SPACE', L, T-8, {size:9, col:MTC.muted});
  // articulatory gesture size + duration + energy
  const RX = L+PW+50, RW = w-RX-24;
  const bars = [
    ['gesture size', 1-r*0.72, MTC.a1],
    ['duration',     1-r*0.62, MTC.a4],
    ['energy',       1-r*0.55, MTC.a5]
  ];
  bars.forEach(([lab, v, col], i)=>{
    const y = 44 + i*38;
    mtTxt(x, lab, RX, y-8, {size:8.5, col:MTC.muted});
    mtRR(x, RX, y, RW, 18, 5); x.fillStyle='rgba(23,27,52,0.05)'; x.fill();
    mtRR(x, RX, y, Math.max(4, RW*v), 18, 5); x.fillStyle = col+'CC'; x.fill();
    mtTxt(x, (v*100).toFixed(0)+'%', RX+RW+6, y+9, {size:8.5, col:MTC.muted});
  });
  mtTxt(x, r<0.5 ? '[iy]' : '[ax]', RX+RW/2, 186, {size:20, col: r<0.5?MTC.a1:MTC.a2, align:'center', weight:'700'});
  mtSet('prd-cap', r<0.2
    ? 'A fully stressed [iy]: the tongue reaches its high front target, the vowel is long, and it is clearly identifiable.'
    : r<0.7 ? 'Partly reduced. The tongue is no longer reaching the target; the vowel is drifting toward the centre of the space and shortening.'
    : 'Fully reduced to schwa [ax], the centre of the vowel space. The gesture never arrives anywhere in particular, which is exactly why schwa is the most common vowel in English running speech and the least informative for a recognizer.');
}

/* ══ 14.3.2 PHRASING ══════════════════════════════════════ */
PH_PAGES.phbreak = `
<div class="lesson-chapter-label">Section 14.3.2</div>
<h1 class="lesson-h1">Where Sentences Break</h1>
<p class="lesson-intro">Speakers do not produce sentences as unbroken streams. They group words into <strong>prosodic phrases</strong>, marked by pauses, by lengthening of the final syllable, and by pitch movements at the edges. Those groupings tell the listener how the sentence is structured.</p>

<h2 class="lesson-h2">Two Sizes of Break</h2>
<p class="lesson-p">The larger unit is the <strong>intonation phrase</strong>, typically ending in a clear pause and a pitch movement that signals whether more is coming. Inside it sit smaller <strong>intermediate phrases</strong>, with weaker boundaries: some final lengthening, a slight pitch reset, usually no silence at all.</p>
<p class="lesson-p">Place your own breaks in the sentence below before revealing where a speaker actually put them.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Phrase Bracket Placer</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="pbkReveal()">reveal the speaker&rsquo;s breaks</button>
      <button style="${MTBTN}" onclick="pbkClear()">clear</button>
      <button style="${MTBTN}" id="pbk-sx" onclick="pbkSyn()">overlay syntax</button>
    </div>
    <canvas id="pbk-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="pbk-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Prosody and Syntax Agree, But Not Reliably</h2>
<p class="lesson-p">Prosodic boundaries tend to fall at syntactic boundaries, which is why the comma in this sentence attracts the largest break. But the correspondence is loose in both directions. Speakers insert breaks that no parse tree predicts, often to manage breathing or to buy planning time, and they run straight through syntactic boundaries when constituents are short. Turn on the syntax overlay to see the two structures line up in some places and diverge in others.</p>
<p class="lesson-p">For a system, this makes boundary placement a prediction problem rather than a lookup. The standard formulation makes a binary decision at every word juncture, break or no break, using the surrounding words, part-of-speech tags, punctuation, and the distance from the last break as features.</p>

<div class="quiz-block" id="qph-bk"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What is the relationship between prosodic and syntactic boundaries?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-bk','Correct. They correlate strongly but neither determines the other, so boundary placement has to be predicted rather than read off a parse.')">They correlate strongly but neither one determines the other</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-bk','Speakers routinely break where no syntactic boundary exists, and run through boundaries that do exist.')">Prosodic boundaries occur exactly at syntactic boundaries</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-bk','The correlation is far too strong to be accidental; syntax is one of the best predictors available.')">They are unrelated</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-bk','Punctuation is a useful cue but is a written convention, not the source of prosodic phrasing.')">Prosodic boundaries are determined entirely by punctuation</button>
</div><div class="quiz-explain" id="qph-bk-explain"></div></div>`;

/* ── Phrase Bracket Placer ────────────────────────────────── */
const PBK_W = ['I','wanted','to','go','to','London,','but','could','only','get','tickets','for','France'];
const PBK_GOLD = {1:1, 3:1, 5:2, 9:1};   // index after which a break falls; 2 = intonation phrase
const PBK_SYN  = {0:'NP', 1:'VP', 5:'PP', 6:'CONJ', 10:'NP'};
let _pbk = {marks:{}, rev:false, syn:false};
function pbkBuild(){
  const cv = document.getElementById('pbk-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('click', e=>{
      const r = cv.getBoundingClientRect();
      const mx = e.clientX-r.left;
      const L = 20, cw = (r.width-40)/PBK_W.length;
      const i = Math.round((mx-L)/cw) - 1;
      if(i>=0 && i<PBK_W.length-1){
        _pbk.marks[i] = _pbk.marks[i] ? 0 : 1;
        pbkDraw();
      }
    });
  }
  _pbk = {marks:{}, rev:false, syn:false}; pbkDraw();
}
function pbkReveal(){ _pbk.rev = !_pbk.rev; pbkDraw(); }
function pbkClear(){ _pbk.marks = {}; _pbk.rev = false; pbkDraw(); }
function pbkSyn(){ _pbk.syn = !_pbk.syn; pbkDraw(); }
function pbkDraw(){
  const b = document.getElementById('pbk-sx');
  if(b){ b.style.background = _pbk.syn?'var(--accent)':'var(--surface2)'; b.style.color = _pbk.syn?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('pbk-canvas', 210); if(!c) return;
  const {x, w} = c;
  const L = 20, PW = w-40, cw = PW/PBK_W.length;
  PBK_W.forEach((wd, i)=>{
    const px = L + i*cw;
    mtChip(x, px+2, 74, cw-4, 28, 'rgba(23,27,52,0.04)', MTC.line, null);
    x.save(); x.font='9px '+MTC.mono; x.fillStyle=MTC.text;
    x.textAlign='center'; x.textBaseline='middle';
    x.fillText(wd.length>8?wd.slice(0,7)+'\u2026':wd, px+cw/2, 88); x.restore();
    // user marks
    if(_pbk.marks[i]){
      x.strokeStyle = MTC.a1; x.lineWidth = 2.4;
      x.beginPath(); x.moveTo(px+cw, 66); x.lineTo(px+cw, 110); x.stroke();
    }
    // gold
    if(_pbk.rev && PBK_GOLD[i]){
      const big = PBK_GOLD[i]===2;
      x.strokeStyle = MTC.a2; x.lineWidth = big?3.5:1.8;
      x.setLineDash(big?[]:[4,3]);
      x.beginPath(); x.moveTo(px+cw+3, 60); x.lineTo(px+cw+3, 118); x.stroke(); x.setLineDash([]);
      mtTxt(x, big?'IP':'ip', px+cw+3, 50, {size:8, col:MTC.a2, align:'center', weight: big?'700':''});
    }
    // syntax
    if(_pbk.syn && PBK_SYN[i]){
      mtChip(x, px+2, 128, cw*(i===1?4:i===5?1:i===10?3:1)-4, 20, 'rgba(165,104,14,0.10)', MTC.a5, PBK_SYN[i], MTC.a5, 8);
    }
  });
  mtTxt(x, 'click between words to place a break', L, 30, {size:9, col:MTC.muted});
  if(_pbk.syn) mtTxt(x, 'syntactic constituents', L, 162, {size:9, col:MTC.a5});
  const mine = Object.keys(_pbk.marks).filter(k=>_pbk.marks[k]).map(Number);
  const gold = Object.keys(PBK_GOLD).map(Number);
  const hit = mine.filter(m=>gold.includes(m)).length;
  mtSet('pbk-cap', _pbk.rev
    ? 'The speaker placed one <b>intonation phrase</b> boundary at the comma (solid, marked IP) and three weaker <b>intermediate</b> boundaries (dashed, ip): <em>I | wanted to go | to London, || but could only get | tickets for France</em>. You matched ' + hit + ' of ' + gold.length + '. The strongest break sits at the largest syntactic seam, but the weaker ones subdivide constituents that no parse would split.'
    : (mine.length ? mine.length + ' break' + (mine.length===1?'':'s') + ' placed. Reveal when ready.'
       : 'Read the sentence aloud and mark where you naturally pause or slow down.'));
}

/* ══ 14.3.3 INTONATION ════════════════════════════════════ */
PH_PAGES.phtune = `
<div class="lesson-chapter-label">Section 14.3.3</div>
<h1 class="lesson-h1">The Melody of an Utterance</h1>
<p class="lesson-intro">Intonation describes pitch patterns across an utterance. A final rise can help signal a question, and a fall can help signal completion, but the interpretation depends on the language and context. Listen to what changes when the words stay the same.</p>

<h2 class="lesson-h2">The Tune Carries the Speech Act</h2>
<p class="lesson-p">Draw a contour on the sentence below and watch the punctuation follow. This is more than a party trick: it is why a text-to-speech system needs to decide on a contour before it can speak a sentence, and why a spoken-language understanding system that ignores F0 will mistake questions for statements.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Contour Drawer</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pcd-btns"></div>
    <canvas id="pcd-canvas" data-w="660" style="width:100%;display:block;cursor:crosshair"></canvas>
    <div id="pcd-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">A few contours recur often enough to have names. The <strong>final fall</strong> ends low and signals completion. The <strong>question rise</strong> ends high, marking a yes-no question. The <strong>continuation rise</strong> ends slightly up, meaning the speaker has more to say, which is what happens on each item of a spoken list except the last. Other contours mark contradiction, surprise, or uncertainty, and speakers deploy them without ever having been taught the inventory.</p>

<div class="quiz-block" id="qph-tn"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A speaker lists three items and each of the first two ends with a slight pitch rise. What does that rise signal?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-tn','Correct. A continuation rise tells the listener the utterance is not finished; the final item takes a fall instead.')">That the utterance is not finished and more is coming</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-tn','A full question rise is larger and ends the utterance; a continuation rise is smaller and signals incompleteness.')">That each item is a separate question</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-tn','Uncertainty has its own contours; a list-internal rise is about structure rather than doubt.')">That the speaker is uncertain about those items</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-tn','Emphasis is carried by pitch accents on the accented syllable, not by the phrase-final boundary movement.')">That those items are emphasized</button>
</div><div class="quiz-explain" id="qph-tn-explain"></div></div>`;

/* ── Contour Drawer ───────────────────────────────────────── */
const PCD_PRE = [
  {k:'fall', lab:'final fall', pts:[.62,.70,.58,.30,.14], punct:'.', mean:'A statement. Ending low signals that the utterance is complete and the speaker is yielding the floor.'},
  {k:'qrise', lab:'question rise', pts:[.44,.48,.42,.60,.92], punct:'?', mean:'A yes-no question. The final rise hands the turn to the listener and requests an answer.'},
  {k:'cont', lab:'continuation rise', pts:[.50,.56,.52,.58,.66], punct:',', mean:'More is coming. This is what appears on every item of a spoken list except the last.'},
  {k:'contra', lab:'contradiction', pts:[.40,.86,.34,.44,.22], punct:'!', mean:'A sharp early peak on the contradicted word, then a fall. Used to correct something just said.'},
  {k:'surp', lab:'surprise', pts:[.36,.44,.90,.72,.80], punct:'?!', mean:'A late high peak with a raised ending: disbelief rather than a genuine request for information.'}
];
let _pcd = {pts:[.62,.70,.58,.30,.14], k:'fall', drag:-1};
function pcdBuild(){
  const b = document.getElementById('pcd-btns');
  if(b) b.innerHTML = PCD_PRE.map(p=>`<button style="${MTBTN}" id="pcd-b-${p.k}" onclick="pcdGo('${p.k}')">${p.lab}</button>`).join('');
  const cv = document.getElementById('pcd-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    const set = e=>{
      const r = cv.getBoundingClientRect();
      const L = 40, PW = r.width-70, T = 30, PH = 110;
      const i = Math.round(((e.clientX-r.left)-L)/(PW/4));
      if(i<0 || i>4) return;
      _pcd.pts = _pcd.pts.slice();
      _pcd.pts[i] = Math.max(0, Math.min(1, 1-((e.clientY-r.top)-T)/PH));
      _pcd.k = 'custom';
      pcdDraw();
    };
    cv.addEventListener('mousedown', e=>{ _pcd.drag = 1; set(e); });
    cv.addEventListener('mousemove', e=>{ if(_pcd.drag>0) set(e); });
    cv.addEventListener('mouseup', ()=>{ _pcd.drag = -1; });
    cv.addEventListener('mouseleave', ()=>{ _pcd.drag = -1; });
  }
  pcdGo('fall');
}
function pcdGo(k){
  const P = PCD_PRE.find(p=>p.k===k);
  if(P){ _pcd.pts = P.pts.slice(); _pcd.k = k; }
  pcdDraw();
}
function pcdDraw(){
  PCD_PRE.forEach(p=>{ const e = document.getElementById('pcd-b-'+p.k); if(e){
    e.style.background = p.k===_pcd.k ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = p.k===_pcd.k ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('pcd-canvas', 220); if(!c) return;
  const {x, w} = c;
  const L = 40, PW = w-70, T = 30, PH = 110;
  const words = ['you','know','what','I','mean'];
  // grid
  [0,0.5,1].forEach(g=>{
    const y = T + PH*(1-g);
    x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, y); x.lineTo(L+PW, y); x.stroke();
    mtTxt(x, (80+g*180).toFixed(0), L-6, y, {size:8, col:MTC.muted, align:'right'});
  });
  mtTxt(x, 'F0 (Hz)', 6, T-12, {size:8.5, col:MTC.muted});
  // contour
  x.strokeStyle = MTC.a1; x.lineWidth = 3;
  x.beginPath();
  for(let p=0;p<=PW;p++){
    const t = (p/PW)*4;
    const i = Math.min(3, Math.floor(t));
    const v = mtLerp(_pcd.pts[i], _pcd.pts[i+1], mtEase(t-i));
    const y = T + PH*(1-v);
    p ? x.lineTo(L+p, y) : x.moveTo(L+p, y);
  }
  x.stroke();
  _pcd.pts.forEach((v, i)=>{
    const px = L + (i/4)*PW, py = T + PH*(1-v);
    x.beginPath(); x.arc(px, py, 6, 0, 7);
    x.fillStyle = MTC.surf; x.fill();
    x.strokeStyle = MTC.a2; x.lineWidth = 2; x.stroke();
    mtTxt(x, words[i], px, T+PH+22, {size:9.5, col:MTC.text, align:'center'});
  });
  // punctuation verdict
  const last = _pcd.pts[4], prev = _pcd.pts[3];
  const delta = last - prev;
  const punct = delta > 0.18 ? '?' : delta < -0.10 ? '.' : ',';
  const meaning = delta > 0.18 ? 'question' : delta < -0.10 ? 'statement' : 'continuation';
  mtChip(x, w-56, T+8, 42, 42, 'rgba(159,18,57,0.14)', MTC.a2, punct, MTC.a2, 22);
  mtTxt(x, meaning, w-35, T+62, {size:8.5, col:MTC.a2, align:'center'});
  const pre = PCD_PRE.find(p=>p.k===_pcd.k);
  mtSet('pcd-cap', pre ? '<b>' + pre.lab + '.</b> ' + pre.mean
    : 'Custom contour. The final movement is what the punctuation tracks: a rise of ' + (delta*100).toFixed(0) + ' units reads as a <b>' + meaning + '</b>. Drag any point to reshape the tune.');
}

/* ══ 14.3.4 ToBI ══════════════════════════════════════════ */
PH_PAGES.phtobi = `
<div class="lesson-chapter-label">Section 14.3.4</div>
<h1 class="lesson-h1">A Notation for Intonation</h1>
<p class="lesson-intro">ToBI, or Tones and Break Indices, provides labels for pitch events and phrase boundaries. It gives researchers a consistent annotation system alongside the continuous pitch track.</p>

<h2 class="lesson-h2">Two Kinds of Symbol</h2>
<p class="lesson-p">ToBI decomposes a contour into two independent inventories. <strong>Pitch accents</strong> attach to prominent syllables and describe the local pitch movement there: a high peak, a low valley, or one of several rise and fall shapes. <strong>Boundary tones</strong> attach to phrase edges and describe how the phrase ends.</p>
<p class="lesson-p">This factoring is what makes the notation useful. A contour is not memorized as a whole shape; it is assembled from a few accents at the prominent syllables plus a boundary tone at the end. Click the accent points below and cycle through the options.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The ToBI Labeler</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="ptb-btns"></div>
    <canvas id="ptb-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="ptb-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The asterisk in H* and L* marks the tone as aligned with the accented syllable itself. In two-tone accents such as L+H*, the starred tone is the one that lands on the syllable and the other leads or trails it. The boundary tones use two symbols because they mark two levels of edge at once: the phrase accent (L- or H-) for the intermediate phrase, and the final tone (L% or H%) for the intonation phrase. L-L% is the ordinary declarative ending; H-H% is the yes-no question rise.</p>

<div class="quiz-block" id="qph-tb"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does the asterisk in the ToBI label L+H* indicate?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-tb','Correct. The starred tone is the one aligned with the accented syllable; the other tone leads into or trails out of it.')">The H tone is the one aligned with the accented syllable</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-tb','Both tones are realized; the asterisk marks alignment, not presence.')">Only the H tone is actually pronounced</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-tb','Loudness is not encoded by ToBI tone labels at all.')">The H tone is louder than the L tone</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-tb','Boundary tones use the percent and dash notation; the asterisk marks pitch accents.')">The label marks a phrase boundary</button>
</div><div class="quiz-explain" id="qph-tb-explain"></div></div>`;

/* ── ToBI Labeler ─────────────────────────────────────────── */
const PTB_ACC = [
  {k:'H*',    shape:[0,.9,.5],  note:'A simple high peak on the accented syllable. The most common English pitch accent, used for ordinary new information.'},
  {k:'L*',    shape:[.4,.05,.3], note:'A low target on the accented syllable. Common in yes-no questions and in expressions of uncertainty.'},
  {k:'L*+H',  shape:[.1,.15,.85], note:'A scooped accent: low on the syllable, rising sharply afterwards. Often conveys incredulity or contrast.'},
  {k:'L+H*',  shape:[.15,.9,.55], note:'A rising peak: the rise starts before the syllable and the high lands on it. Typically marks contrastive focus.'},
  {k:'H+!H*', shape:[.85,.45,.35], note:'A step down: high before, then a downstepped high on the syllable. Signals that the information is already given or expected.'}
];
const PTB_BND = [
  {k:'L-L%', shape:[.3,.1],  note:'Final fall: a completed declarative.'},
  {k:'L-H%', shape:[.25,.6], note:'Continuation rise: more to come.'},
  {k:'H-H%', shape:[.55,.95], note:'Question rise: a yes-no question.'},
  {k:'H-L%', shape:[.7,.6],  note:'Final plateau: level ending, often signalling routine or list-final neutrality.'}
];
let _ptb = {acc:[0,0], bnd:0, sel:0};
function ptbBuild(){
  const b = document.getElementById('ptb-btns');
  if(b) b.innerHTML = '<span style="'+MTLBL+'">boundary tone</span>' +
    PTB_BND.map((t,i)=>`<button style="${MTBTN}" id="ptb-b${i}" onclick="ptbBnd(${i})">${t.k}</button>`).join('');
  const cv = document.getElementById('ptb-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('click', e=>{
      const r = cv.getBoundingClientRect();
      const L = 46, PW = r.width-90;
      const p1 = L + PW*0.22, p2 = L + PW*0.62;
      const mx = e.clientX-r.left;
      if(Math.abs(mx-p1) < 60) { _ptb.acc[0] = (_ptb.acc[0]+1)%PTB_ACC.length; _ptb.sel = 0; }
      else if(Math.abs(mx-p2) < 60) { _ptb.acc[1] = (_ptb.acc[1]+1)%PTB_ACC.length; _ptb.sel = 1; }
      ptbDraw();
    });
  }
  _ptb = {acc:[0,0], bnd:0, sel:0}; ptbDraw();
}
function ptbBnd(i){ _ptb.bnd = i; _ptb.sel = 2; ptbDraw(); }
function ptbDraw(){
  PTB_BND.forEach((_,i)=>{ const e = document.getElementById('ptb-b'+i); if(e){
    e.style.background = i===_ptb.bnd ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_ptb.bnd ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('ptb-canvas', 232); if(!c) return;
  const {x, w} = c;
  const L = 46, PW = w-90, T = 34, PH = 108;
  const words = ['Marianna','made','the','marmalade'];
  const A1 = PTB_ACC[_ptb.acc[0]], A2 = PTB_ACC[_ptb.acc[1]], B = PTB_BND[_ptb.bnd];
  // assemble the contour from segments
  const knots = [
    [0.00, 0.42],
    [0.14, A1.shape[0]], [0.22, A1.shape[1]], [0.30, A1.shape[2]],
    [0.46, 0.40],
    [0.54, A2.shape[0]], [0.62, A2.shape[1]], [0.70, A2.shape[2]],
    [0.86, B.shape[0]], [1.00, B.shape[1]]
  ];
  [0,0.5,1].forEach(g=>{
    const y = T + PH*(1-g);
    x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, y); x.lineTo(L+PW, y); x.stroke();
  });
  mtTxt(x, 'high', L-6, T, {size:8, col:MTC.muted, align:'right'});
  mtTxt(x, 'low', L-6, T+PH, {size:8, col:MTC.muted, align:'right'});
  x.strokeStyle = MTC.a1; x.lineWidth = 3;
  x.beginPath();
  for(let p=0;p<=PW;p++){
    const t = p/PW;
    let i = 0;
    while(i < knots.length-2 && knots[i+1][0] < t) i++;
    const [t0,v0] = knots[i], [t1,v1] = knots[i+1];
    const u = t1===t0 ? 0 : (t-t0)/(t1-t0);
    const v = mtLerp(v0, v1, mtEase(Math.max(0, Math.min(1, u))));
    const y = T + PH*(1-v);
    p ? x.lineTo(L+p, y) : x.moveTo(L+p, y);
  }
  x.stroke();
  // accent markers
  [[0.22, A1, 0], [0.62, A2, 1]].forEach(([t, A, idx])=>{
    const px = L + t*PW, py = T + PH*(1-A.shape[1]);
    x.beginPath(); x.arc(px, py, 8, 0, 7);
    x.fillStyle = MTC.surf; x.fill();
    x.strokeStyle = _ptb.sel===idx ? MTC.a2 : MTC.a5; x.lineWidth = 2.4; x.stroke();
    mtChip(x, px-30, py-34, 60, 22, 'rgba(165,104,14,0.14)', MTC.a5, A.k, MTC.a5, 10);
  });
  // boundary marker
  const bx = L+PW;
  x.strokeStyle = MTC.a2; x.lineWidth = 2; x.setLineDash([4,3]);
  x.beginPath(); x.moveTo(bx, T-6); x.lineTo(bx, T+PH+6); x.stroke(); x.setLineDash([]);
  mtChip(x, bx+4, T+PH/2-11, 42, 22, 'rgba(159,18,57,0.14)', MTC.a2, B.k, MTC.a2, 9);
  // words
  words.forEach((wd, i)=>{
    const px = L + (i+0.5)*(PW/words.length);
    const acc = i===0 || i===3;
    mtTxt(x, wd, px, T+PH+24, {size:10, col: acc?MTC.text:MTC.muted, align:'center', weight: acc?'700':''});
  });
  mtTxt(x, 'click either accent point to cycle through the five pitch accents', L, 22, {size:8.5, col:MTC.muted});
  const full = A1.k + ' ... ' + A2.k + ' ' + B.k;
  mtTxt(x, full, L, T+PH+52, {size:12, col:MTC.a1, weight:'700'});
  const note = _ptb.sel===2 ? B.note : (_ptb.sel===0 ? A1.note : A2.note);
  mtSet('ptb-cap', '<b>' + (_ptb.sel===2 ? B.k : (_ptb.sel===0?A1.k:A2.k)) + '.</b> ' + note + ' The full annotation for this utterance is <b>' + full + '</b>: two accents and a boundary tone, and that string is enough for a synthesizer to reconstruct the tune.');
}

/* ══ 14.4.1 SINE WAVES ════════════════════════════════════ */
PH_PAGES.phwave = `
<div class="lesson-chapter-label">Section 14.4.1</div>
<h1 class="lesson-h1">Sine Waves, Frequency, and Amplitude</h1>
<p class="lesson-intro">Everything from here on treats sound as a physical signal rather than a linguistic object. A sound is a variation in air pressure travelling outward from its source, and the simplest such variation, the one every other sound can be built from, is the sine wave.</p>

<h2 class="lesson-h2">Two Numbers</h2>
<p class="lesson-p">A pure tone is fully described by two quantities:</p>
<div class="lesson-math">\\[y = A \\sin(2\\pi f t)\\]</div>
<p class="lesson-p">The <strong>amplitude</strong> \\(A\\) is how far the pressure swings from rest, perceived as loudness. The <strong>frequency</strong> \\(f\\) is how many complete cycles occur per second, measured in hertz and perceived as pitch. The factor \\(2\\pi\\) is there because the sine function completes one cycle over \\(2\\pi\\) radians, so multiplying by \\(2\\pi f\\) makes the argument advance through exactly \\(f\\) full cycles in one second of \\(t\\).</p>
<p class="lesson-p">The <strong>period</strong> follows immediately: if there are \\(f\\) cycles per second, one cycle takes</p>
<div class="lesson-math">\\[T = \\frac{1}{f}\\]</div>
<p class="lesson-p">so a 100 Hz tone repeats every 0.01 seconds. This reciprocal is worth internalizing, because measuring frequency from a waveform is done by measuring \\(T\\) and inverting it, a technique used repeatedly later in this chapter.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Wave Workbench</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">amplitude A</span>
      <input id="pww-a" type="range" min="0.1" max="1" step="0.05" value="0.7" oninput="pwwDraw()" style="width:120px;accent-color:var(--accent)">
      <span style="${MTLBL}">frequency f</span>
      <input id="pww-f" type="range" min="2" max="40" step="1" value="10" oninput="pwwDraw()" style="width:150px;accent-color:var(--accent)">
      <span id="pww-l" style="${MTLBL}"></span>
    </div>
    <canvas id="pww-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pww-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Real speech is never a single sine wave. But every complex sound can be decomposed into a sum of sine waves at different frequencies and amplitudes, which is the result Section 14.4.5 relies on, and it is why the humble sine deserves this much attention.</p>

<div class="quiz-block" id="qph-wv"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A waveform completes 10 cycles in 0.04 seconds. What is its frequency?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-wv','Correct. One cycle takes 0.004 s, so T = 0.004 and f = 1/T = 250 Hz.')">250 Hz</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-wv','That would be the count of cycles, not the rate; you need cycles per second.')">10 Hz</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-wv','That is the period of the whole 10-cycle stretch expressed as a rate, not the frequency of one cycle.')">25 Hz</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-wv','Check the arithmetic: 10 cycles in 0.04 s is 10/0.04.')">400 Hz</button>
</div><div class="quiz-explain" id="qph-wv-explain"></div></div>`;

/* ── Wave Workbench ───────────────────────────────────────── */
function pwwDraw(){
  const A = +(document.getElementById('pww-a')||{value:0.7}).value;
  const f = Math.round(+(document.getElementById('pww-f')||{value:10}).value);
  const T = 1/f;
  mtSet('pww-l', f + ' Hz \u00b7 T = ' + T.toFixed(4) + ' s');
  const c = mtCtx('pww-canvas', 220); if(!c) return;
  const {x, w} = c;
  const L = 44, PW = w-L-24, MY = 100, AMP = 66;
  x.strokeStyle = MTC.line; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L, MY); x.lineTo(L+PW, MY); x.stroke();
  // window is 0.5 s
  const WIN = 0.5;
  x.strokeStyle = MTC.a1; x.lineWidth = 2;
  x.beginPath();
  for(let p=0;p<=PW;p++){
    const t = (p/PW)*WIN;
    const y = MY - A*AMP*Math.sin(2*Math.PI*f*t);
    p ? x.lineTo(L+p, y) : x.moveTo(L+p, y);
  }
  x.stroke();
  // amplitude bracket
  x.strokeStyle = MTC.a2; x.lineWidth = 1.4;
  x.beginPath(); x.moveTo(L-14, MY); x.lineTo(L-14, MY-A*AMP); x.stroke();
  x.beginPath(); x.moveTo(L-18, MY-A*AMP); x.lineTo(L-10, MY-A*AMP); x.stroke();
  mtTxt(x, 'A', L-22, MY-A*AMP/2, {size:10, col:MTC.a2, align:'right', weight:'700'});
  // period bracket on the first cycle
  const cycPx = (T/WIN)*PW;
  if(cycPx > 8){
    x.strokeStyle = MTC.a5; x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(L, MY+AMP+16); x.lineTo(L+cycPx, MY+AMP+16); x.stroke();
    x.beginPath(); x.moveTo(L, MY+AMP+12); x.lineTo(L, MY+AMP+20); x.stroke();
    x.beginPath(); x.moveTo(L+cycPx, MY+AMP+12); x.lineTo(L+cycPx, MY+AMP+20); x.stroke();
    mtTxt(x, 'T = 1/f = ' + T.toFixed(4) + 's', L+cycPx+8, MY+AMP+16, {size:9, col:MTC.a5});
  }
  mtTxt(x, '0', L, MY+AMP+40, {size:8.5, col:MTC.muted, align:'center'});
  mtTxt(x, '0.5 s', L+PW, MY+AMP+40, {size:8.5, col:MTC.muted, align:'center'});
  const cycles = f*WIN;
  mtTxt(x, cycles + ' cycles in this 0.5 s window', L, 24, {size:10, col:MTC.a1});
  mtSet('pww-cap', 'y = ' + A.toFixed(2) + ' sin(2\u03C0 \u00b7 ' + f + ' \u00b7 t). Amplitude sets the height and nothing else; frequency sets how tightly the cycles pack. Because f and T are reciprocals, doubling the frequency exactly halves the period, and the bracket on the first cycle shrinks accordingly.');
}

/* ══ 14.4.2 DIGITIZING ════════════════════════════════════ */
PH_PAGES.phdig = `
<div class="lesson-chapter-label">Section 14.4.2</div>
<h1 class="lesson-h1">Turning Air Pressure Into Numbers</h1>
<p class="lesson-intro">A microphone converts pressure variation into a continuously varying voltage. A computer cannot store a continuous anything, so two separate discretizations are required: one along the time axis, one along the amplitude axis. Each has a characteristic failure mode.</p>

<h2 class="lesson-h2">Sampling, and the Limit That Governs It</h2>
<p class="lesson-p"><strong>Sampling</strong> measures the signal at regular intervals, and the <strong>sampling rate</strong> is how many measurements per second. The critical fact is that a sampling rate does not merely give a rougher picture of high frequencies, it gives a <em>wrong</em> one. To capture a wave you need at least two samples per cycle, one for the peak and one for the trough. Sample more slowly and the reconstructed wave is a different, lower-frequency wave entirely: this is <strong>aliasing</strong>.</p>
<p class="lesson-p">The maximum frequency recoverable at a given rate is therefore half of it, the <strong>Nyquist frequency</strong>. This is why telephone speech is sampled at 8000 Hz, capturing up to 4000 Hz and filtering out everything above, while a microphone recording at 16000 Hz reaches 8000 Hz. Drag the sample rate below the line and watch the wave alias.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Sampling Grid</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">signal frequency</span>
      <input id="psg-f" type="range" min="1" max="12" step="1" value="4" oninput="psgDraw()" style="width:120px;accent-color:var(--accent)">
      <span style="${MTLBL}">sample rate</span>
      <input id="psg-s" type="range" min="3" max="40" step="1" value="32" oninput="psgDraw()" style="width:150px;accent-color:var(--accent)">
      <span id="psg-l" style="${MTLBL}"></span>
    </div>
    <canvas id="psg-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="psg-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Quantization</h2>
<p class="lesson-p">Each sample also has to become an integer. <strong>Quantization</strong> snaps the measured amplitude to the nearest of a fixed set of levels: 8-bit storage gives 256 levels (\u2212128 to 127), 16-bit gives 65,536 (\u221232768 to 32767). The error introduced is quantization noise, and it is proportionally worst for quiet signals, since a soft passage may span only a handful of levels while a loud one spans thousands.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Quantization Staircase</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" id="pqz-b0" onclick="pqzGo(3)">3-bit (8 levels, for visibility)</button>
      <button style="${MTBTN}" id="pqz-b1" onclick="pqzGo(4)">4-bit (16 levels)</button>
      <button style="${MTBTN}" id="pqz-b2" onclick="pqzGo(6)">6-bit (64 levels)</button>
      <span style="${MTLBL}">signal level</span>
      <input id="pqz-a" type="range" min="0.1" max="1" step="0.05" value="0.9" oninput="pqzDraw()" style="width:110px;accent-color:var(--accent)">
    </div>
    <canvas id="pqz-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pqz-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Companding</h2>
<p class="lesson-p">Because quiet passages suffer most, telephone systems do not space their levels evenly. <strong>&mu;-law</strong> encoding compresses the amplitude range with a logarithmic curve before quantizing, so that levels are packed densely near zero and sparsely at the extremes:</p>
<div class="lesson-math">\\[F(x) = \\text{sgn}(x)\\,\\frac{\\log(1 + \\mu|x|)}{\\log(1 + \\mu)}, \\qquad -1 \\le x \\le 1\\]</div>
<p class="lesson-p">with \\(\\mu = 255\\) for 8-bit audio. The \\(\\text{sgn}(x)\\) factor preserves the sign while the logarithm acts on the magnitude, and the denominator normalizes so that an input of 1 maps to an output of 1. The effect is that 8 bits with &mu;-law sound roughly like 12 bits without it, which is why the technique survived into every telephone network on earth.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The &mu;-law Curve</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">&mu;</span>
      <input id="pmu-m" type="range" min="0" max="255" step="5" value="255" oninput="pmuDraw()" style="width:180px;accent-color:var(--accent)">
      <span id="pmu-l" style="${MTLBL}"></span>
    </div>
    <canvas id="pmu-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pmu-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qph-dg"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is telephone speech sampled at 8000 Hz specifically?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-dg','Correct. Twice 4000 Hz, which is the bandwidth the telephone network transmits; sampling below twice the highest frequency would alias.')">It is twice the 4000 Hz upper limit the network transmits</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-dg','8000 Hz is well above the fundamental frequency of any voice; the constraint is the highest frequency present, not the pitch.')">It matches the fundamental frequency of the human voice</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-dg','Higher rates are entirely possible; the choice reflects bandwidth economics and the Nyquist limit.')">It is the highest rate hardware can achieve</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-dg','Bit depth is a separate axis from sampling rate.')">It gives exactly 8 bits per sample</button>
</div><div class="quiz-explain" id="qph-dg-explain"></div></div>`;

/* ── Sampling Grid ────────────────────────────────────────── */
function psgDraw(){
  const f = Math.round(+(document.getElementById('psg-f')||{value:4}).value);
  const sr = Math.round(+(document.getElementById('psg-s')||{value:32}).value);
  const nyq = sr/2;
  const aliased = f > nyq;
  const apparent = aliased ? Math.abs(sr*Math.round(f/sr) - f) : f;
  mtSet('psg-l', sr + ' samples/s \u00b7 Nyquist ' + nyq);
  const c = mtCtx('psg-canvas', 236); if(!c) return;
  const {x, w} = c;
  const L = 30, PW = w-L-24, MY = 96, AMP = 56;
  x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, MY); x.lineTo(L+PW, MY); x.stroke();
  // true signal
  x.strokeStyle = 'rgba(79,70,229,0.55)'; x.lineWidth = 2;
  x.beginPath();
  for(let p=0;p<=PW;p++){
    const t = p/PW;
    const y = MY - AMP*Math.sin(2*Math.PI*f*t);
    p ? x.lineTo(L+p, y) : x.moveTo(L+p, y);
  }
  x.stroke();
  // samples
  const pts = [];
  for(let k=0;k<=sr;k++){
    const t = k/sr;
    if(t > 1) break;
    const px = L + t*PW, py = MY - AMP*Math.sin(2*Math.PI*f*t);
    pts.push([px, py]);
    x.strokeStyle = MTC.line2; x.lineWidth = 1;
    x.beginPath(); x.moveTo(px, MY); x.lineTo(px, py); x.stroke();
    x.beginPath(); x.arc(px, py, 3, 0, 7); x.fillStyle = MTC.a5; x.fill();
  }
  // reconstruction
  x.strokeStyle = aliased ? MTC.a2 : MTC.a4; x.lineWidth = 2;
  x.setLineDash(aliased?[]:[5,4]);
  x.beginPath();
  pts.forEach(([px,py], i)=> i? x.lineTo(px,py) : x.moveTo(px,py));
  x.stroke(); x.setLineDash([]);
  mtTxt(x, 'true signal ' + f + ' Hz', L, 22, {size:9, col:MTC.a1});
  mtTxt(x, aliased ? 'reconstructed: ' + apparent + ' Hz \u2014 WRONG' : 'reconstructed correctly',
        L+PW, 22, {size:9.5, col: aliased?MTC.a2:MTC.a4, align:'right', weight: aliased?'700':''});
  // nyquist bar
  const by = 190;
  mtTxt(x, 'FREQUENCY AXIS', L, by-16, {size:8.5, col:MTC.muted});
  mtRR(x, L, by, PW, 16, 5); x.fillStyle='rgba(23,27,52,0.05)'; x.fill();
  const maxF = 42;
  const nx = L + (nyq/maxF)*PW;
  mtRR(x, L, by, Math.max(2, (nyq/maxF)*PW), 16, 5); x.fillStyle='rgba(11,132,87,0.24)'; x.fill();
  x.strokeStyle = MTC.a2; x.lineWidth = 2;
  x.beginPath(); x.moveTo(nx, by-6); x.lineTo(nx, by+22); x.stroke();
  mtTxt(x, 'Nyquist = ' + nyq, nx+5, by+32, {size:8.5, col:MTC.a2});
  const fx = L + (f/maxF)*PW;
  x.beginPath(); x.arc(fx, by+8, 5, 0, 7); x.fillStyle = aliased?MTC.a2:MTC.a4; x.fill();
  mtTxt(x, 'signal', fx, by-6, {size:8, col:MTC.muted, align:'center'});
  mtSet('psg-cap', aliased
    ? '<b style="color:var(--accent2)">Aliased.</b> At ' + sr + ' samples per second only frequencies below ' + nyq + ' Hz can be recovered. The ' + f + ' Hz signal folds back and the samples are indistinguishable from a ' + apparent + ' Hz wave. Nothing downstream can undo this, which is why anti-aliasing filters are applied <em>before</em> sampling, not after.'
    : 'Above the Nyquist line: with ' + sr + ' samples per second and a ' + f + ' Hz signal there are ' + (sr/f).toFixed(1) + ' samples per cycle, comfortably more than the two required, so the original wave is recoverable exactly.');
}

/* ── Quantization Staircase ───────────────────────────────── */
let _pqz = 3;
function pqzGo(b){ _pqz = b; pqzDraw(); }
function pqzDraw(){
  const A = +(document.getElementById('pqz-a')||{value:0.9}).value;
  [[3,0],[4,1],[6,2]].forEach(([b,i])=>{ const e = document.getElementById('pqz-b'+i); if(e){
    e.style.background = b===_pqz ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = b===_pqz ? '#FAFBFF' : 'var(--muted)'; } });
  const levels = Math.pow(2, _pqz);
  const c = mtCtx('pqz-canvas', 216); if(!c) return;
  const {x, w} = c;
  const L = 60, PW = w-L-120, MY = 98, AMP = 70;
  // level lines
  for(let k=0;k<levels;k++){
    const v = -1 + (2*k)/(levels-1);
    const y = MY - v*AMP;
    x.strokeStyle = MTC.line; x.lineWidth = 0.7;
    x.beginPath(); x.moveTo(L, y); x.lineTo(L+PW, y); x.stroke();
  }
  // continuous
  x.strokeStyle = 'rgba(79,70,229,0.4)'; x.lineWidth = 1.6;
  x.beginPath();
  for(let p=0;p<=PW;p++){
    const t = p/PW;
    const y = MY - A*AMP*Math.sin(2*Math.PI*2*t);
    p ? x.lineTo(L+p, y) : x.moveTo(L+p, y);
  }
  x.stroke();
  // quantized staircase
  const step = 2/(levels-1);
  x.strokeStyle = MTC.a2; x.lineWidth = 2;
  x.beginPath();
  let err = 0, n = 0;
  for(let p=0;p<=PW;p+=6){
    const t = p/PW;
    const v = A*Math.sin(2*Math.PI*2*t);
    const q = Math.round(v/step)*step;
    err += Math.abs(v-q); n++;
    const y = MY - q*AMP;
    p ? x.lineTo(L+p, y) : x.moveTo(L+p, y);
    x.lineTo(L+p+6, y);
  }
  x.stroke();
  mtTxt(x, levels + ' levels', L, 24, {size:10, col:MTC.a2, weight:'700'});
  mtTxt(x, 'quantum = ' + (step).toFixed(3), L+120, 24, {size:9, col:MTC.muted});
  // error readout
  const RX = L+PW+24;
  const snr = 20*Math.log10(A/(err/n || 1e-6));
  mtTxt(x, 'mean error', RX, 60, {size:8.5, col:MTC.muted});
  mtTxt(x, (err/n).toFixed(4), RX, 78, {size:13, col:MTC.a2, weight:'700'});
  mtTxt(x, 'signal level', RX, 110, {size:8.5, col:MTC.muted});
  mtTxt(x, (A*100).toFixed(0)+'%', RX, 128, {size:13, col:MTC.a1, weight:'700'});
  mtTxt(x, 'levels used', RX, 160, {size:8.5, col:MTC.muted});
  mtTxt(x, Math.max(1, Math.round(A*(levels-1))) + ' of ' + levels, RX, 178, {size:13, col: A<0.3?MTC.a2:MTC.a4, weight:'700'});
  mtSet('pqz-cap', A < 0.35
    ? '<b style="color:var(--accent2)">A quiet signal is the problem case.</b> At ' + (A*100).toFixed(0) + '% amplitude the waveform only spans ' + Math.max(1,Math.round(A*(levels-1))) + ' of the ' + levels + ' available levels, so the staircase is coarse relative to the signal and the quantization noise is proportionally large. This is exactly what \u03BC-law encoding fixes.'
    : 'Each sample snaps to the nearest horizontal line. More bits means more lines and a finer staircase; the error is bounded by half a quantum. Notice what happens when you drag the signal level down.');
}

/* ── mu-law Curve ─────────────────────────────────────────── */
function pmuDraw(){
  const mu = +(document.getElementById('pmu-m')||{value:255}).value;
  mtSet('pmu-l', '\u03BC = ' + mu + (mu===0?' (no companding)':''));
  const c = mtCtx('pmu-canvas', 226); if(!c) return;
  const {x, w} = c;
  const S = Math.min(180, w-300), L = 50, T = 22;
  // axes
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.strokeRect(L, T, S, S);
  mtTxt(x, 'input x', L+S/2, T+S+18, {size:9, col:MTC.muted, align:'center'});
  x.save(); x.translate(L-16, T+S/2); x.rotate(-Math.PI/2);
  mtTxt(x, 'output F(x)', 0, 0, {size:9, col:MTC.muted, align:'center'}); x.restore();
  // diagonal reference
  x.strokeStyle = MTC.line; x.setLineDash([3,3]);
  x.beginPath(); x.moveTo(L, T+S); x.lineTo(L+S, T); x.stroke(); x.setLineDash([]);
  const F = v => mu===0 ? v : Math.log(1+mu*Math.abs(v))/Math.log(1+mu);
  x.strokeStyle = MTC.a1; x.lineWidth = 2.6;
  x.beginPath();
  for(let p=0;p<=S;p++){
    const v = p/S;
    const y = T + S*(1-F(v));
    p ? x.lineTo(L+p, y) : x.moveTo(L+p, y);
  }
  x.stroke();
  // level spacing comparison
  const RX = L+S+50, RW = w-RX-24;
  mtTxt(x, 'WHERE THE 16 LEVELS LAND', RX, 30, {size:8.5, col:MTC.muted});
  [['uniform', v=>v, MTC.muted, 56], ['\u03BC-law', F, MTC.a1, 116]].forEach(([lab, fn, col, y])=>{
    mtTxt(x, lab, RX, y-10, {size:8.5, col:col});
    x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(RX, y+14); x.lineTo(RX+RW, y+14); x.stroke();
    for(let k=0;k<=15;k++){
      const out = k/15;
      // invert: find x such that fn(x)=out
      let lo=0, hi=1;
      for(let it=0;it<30;it++){ const mid=(lo+hi)/2; if(fn(mid)<out) lo=mid; else hi=mid; }
      const px = RX + lo*RW;
      x.strokeStyle = col; x.lineWidth = 1.4;
      x.beginPath(); x.moveTo(px, y+6); x.lineTo(px, y+22); x.stroke();
    }
  });
  mtTxt(x, 'quiet \u2192', RX, 158, {size:8, col:MTC.muted});
  mtTxt(x, '\u2190 loud', RX+RW, 158, {size:8, col:MTC.muted, align:'right'});
  const eff = mu===0 ? 8 : 8 + Math.round(Math.log2(1+mu)/2);
  mtTxt(x, 'perceptual quality \u2248 ' + eff + ' bits', RX, 186, {size:10.5, col:MTC.a4, weight:'700'});
  mtSet('pmu-cap', mu===0
    ? 'With \u03BC = 0 the curve is the diagonal and the levels are evenly spaced: ordinary uniform quantization, in which quiet passages get as few levels as their small amplitude warrants.'
    : 'The logarithmic curve is steep near zero and flat near one, so equal steps in the <em>output</em> correspond to fine steps in quiet input and coarse steps in loud input. The tick marks on the right make this concrete: the \u03BC-law levels crowd toward the quiet end, which is where the ear is most sensitive to noise. Eight bits companded sounds like roughly twelve uncompanded.');
}

/* ══ 14.4.3 PERCEPTUAL MEASURES ═══════════════════════════ */
PH_PAGES.phperc = `
<div class="lesson-chapter-label">Section 14.4.3</div>
<h1 class="lesson-h1">From Physical Measures to What We Hear</h1>
<p class="lesson-intro">The physical quantities of the previous sections do not map linearly onto perception. This section covers the four measurements that matter for speech, and in each case the definition is shaped by how hearing actually works rather than by what is easiest to compute.</p>

<h2 class="lesson-h2">Fundamental Frequency</h2>
<p class="lesson-p">During voiced speech the vocal folds open and close periodically, and that repetition rate is the <strong>fundamental frequency</strong>, F0. You can read it straight off a waveform: find a stretch containing several repetitions, count them, and divide. Ten repetitions in 0.03875 seconds gives a period of 0.003875 s and therefore \\(F_0 = 1/T \\approx 258\\) Hz.</p>
<p class="lesson-p">A <strong>pitch track</strong> plots F0 over time, and it has a characteristic feature worth expecting: gaps. During voiceless sounds and silences there is no periodic vibration, so F0 is undefined and the track simply drops out.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Reading F0 From the Waveform</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pf0-btns"></div>
    <canvas id="pf0-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pf0-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Amplitude, Power, and Intensity</h2>
<p class="lesson-p">Averaging the raw samples is useless: a waveform swings symmetrically about zero, so the positive and negative values cancel and the mean of any reasonable stretch is approximately zero. Squaring first removes the sign, and taking the square root at the end restores the original units, giving <strong>RMS amplitude</strong>:</p>
<div class="lesson-math">\\[\\text{RMS} = \\sqrt{\\frac{1}{N}\\sum_{i=1}^{N} x_i^{2}}\\]</div>
<p class="lesson-p"><strong>Power</strong> is the same quantity without the square root, and <strong>intensity</strong> normalizes power against the threshold of human hearing and converts to decibels, because loudness perception is logarithmic rather than linear:</p>
<div class="lesson-math">\\[\\text{Power} = \\frac{1}{N}\\sum_{i=1}^{N} x_i^{2}, \\qquad \\text{Intensity} = 10 \\log_{10} \\frac{1}{N P_0}\\sum_{i=1}^{N} x_i^{2}\\]</div>
<p class="lesson-p">where \\(P_0 = 2 \\times 10^{-5}\\) pascals is the quietest audible sound at 1000 Hz. The logarithm is what compresses an enormous physical range into the manageable numbers we call decibels: a jet engine is not a hundred times a whisper in pressure terms, it is more like ten million times.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Why the Raw Average Fails</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="prm-btns"></div>
    <canvas id="prm-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="prm-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">The Mel Scale</h2>
<p class="lesson-p">Pitch perception is also non-linear. The gap between 200 and 300 Hz sounds much larger than the gap between 5000 and 5100 Hz, even though both are 100 Hz. The <strong>mel scale</strong> is a warping of frequency so that equal distances in mels sound like equal distances in pitch:</p>
<div class="lesson-math">\\[m = 1127 \\ln\\left(1 + \\frac{f}{700}\\right)\\]</div>
<p class="lesson-p">The two constants are chosen together so that 1000 Hz lands on exactly 1000 mels, and that is the only frequency where the two scales read the same number. Below it mels run ahead of hertz &mdash; 500 Hz already sits at 607 mels &mdash; and above it the curve compresses hard, so that the entire span from 1 to 8 kHz is worth only another 1840 mels. This single formula reappears in Section 14.5.4 as the basis for the filterbank, and the reason to use it there is exactly the reason to introduce it here: a feature that spends its resolution the way the ear does is a better input than one that spreads it evenly.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Mel Curve</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">equal mel steps</span>
      <input id="pml-n" type="range" min="3" max="10" step="1" value="6" oninput="pmlDraw()" style="width:150px;accent-color:var(--accent)">
      <span id="pml-l" style="${MTLBL}"></span>
    </div>
    <canvas id="pml-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pml-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qph-pc"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is the raw mean of the samples not a useful measure of loudness?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-pc','Correct. The waveform swings symmetrically about zero, so positive and negative samples cancel and the mean is near zero regardless of how loud the sound is.')">Positive and negative samples cancel, so the mean is near zero at any loudness</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-pc','Averaging is cheap; correctness, not cost, is the problem.')">It is too slow to compute</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-pc','Sample count affects the estimate\u2019s stability but not the cancellation problem.')">There are too few samples to average</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-pc','Quantization noise is a minor contribution compared with the cancellation issue.')">Quantization noise dominates the average</button>
</div><div class="quiz-explain" id="qph-pc-explain"></div></div>`;

/* ── F0 reading ───────────────────────────────────────────── */
const PF0 = [
  {k:'count', lab:'count the repetitions', note:''},
  {k:'track', lab:'pitch track over an utterance', note:''}
];
let _pf0 = 0;
function pf0Build(){
  const b = document.getElementById('pf0-btns');
  if(b) b.innerHTML = PF0.map((p,i)=>`<button style="${MTBTN}" id="pf0-b${i}" onclick="pf0Go(${i})">${p.lab}</button>`).join('');
  _pf0 = 0; pf0Draw();
}
function pf0Go(i){ _pf0 = i; pf0Draw(); }
function pf0Draw(){
  PF0.forEach((_,i)=>{ const e = document.getElementById('pf0-b'+i); if(e){
    e.style.background = i===_pf0 ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pf0 ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('pf0-canvas', 226); if(!c) return;
  const {x, w} = c;
  const L = 34, PW = w-L-24;
  if(_pf0===0){
    const MY = 88, AMP = 52, reps = 10;
    x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, MY); x.lineTo(L+PW, MY); x.stroke();
    x.strokeStyle = MTC.a1; x.lineWidth = 1.8;
    x.beginPath();
    for(let p=0;p<=PW;p++){
      const t = p/PW;
      // glottal-ish pulse train
      const ph = (t*reps)%1;
      const v = Math.exp(-ph*3.2)*Math.sin(2*Math.PI*ph*1.0) + 0.28*Math.sin(2*Math.PI*ph*4.0)*Math.exp(-ph*2);
      const y = MY - AMP*v*1.4;
      p ? x.lineTo(L+p, y) : x.moveTo(L+p, y);
    }
    x.stroke();
    for(let k=0;k<=reps;k++){
      const px = L + (k/reps)*PW;
      x.strokeStyle = 'rgba(159,18,57,0.4)'; x.lineWidth = 1; x.setLineDash([3,3]);
      x.beginPath(); x.moveTo(px, MY-AMP-8); x.lineTo(px, MY+AMP+8); x.stroke(); x.setLineDash([]);
      if(k<reps) mtTxt(x, String(k+1), px+(PW/reps)/2, MY-AMP-16, {size:8, col:MTC.a2, align:'center'});
    }
    x.strokeStyle = MTC.a5; x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(L, MY+AMP+24); x.lineTo(L+PW, MY+AMP+24); x.stroke();
    mtTxt(x, '0.03875 s', L+PW/2, MY+AMP+38, {size:9.5, col:MTC.a5, align:'center'});
    mtTxt(x, 'the vowel [iy]', L, 22, {size:9.5, col:MTC.muted});
    const per = 0.03875/10, f0 = 1/per;
    mtTxt(x, '10 repetitions \u00f7 0.03875 s', L, 186, {size:10, col:MTC.text});
    mtTxt(x, 'T = ' + per.toFixed(5) + ' s', L, 204, {size:10, col:MTC.text});
    mtTxt(x, 'F0 = 1/T = ' + f0.toFixed(0) + ' Hz', L+240, 204, {size:13, col:MTC.a2, weight:'700'});
    mtSet('pf0-cap', 'Each dashed division is one glottal cycle: one complete open-and-close of the vocal folds. Counting ten of them across a measured span and inverting gives the fundamental frequency directly from the time domain, with no spectral analysis required.');
  } else {
    // "Three o'clock?" pitch track with dropout
    const segs = [
      {w:'Three', a:.02, b:.24, voiced:false, f0:null, lab:'[th] unvoiced'},
      {w:'',      a:.24, b:.36, voiced:true,  f0:[.45,.52]},
      {w:'o\u2019', a:.36, b:.46, voiced:true, f0:[.52,.48]},
      {w:'',      a:.46, b:.56, voiced:false, f0:null, lab:'[k] closure'},
      {w:'clock?',a:.56, b:.94, voiced:true,  f0:[.44,.92]}
    ];
    const MY = 66, AMP = 34;
    x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, MY); x.lineTo(L+PW, MY); x.stroke();
    x.strokeStyle = 'rgba(79,70,229,0.5)'; x.lineWidth = 1;
    x.beginPath();
    for(let p=0;p<=PW;p++){
      const t = p/PW;
      const s2 = segs.find(q=>t>=q.a && t<q.b);
      const amp = !s2 ? 1 : (s2.voiced ? AMP : (s2.lab&&s2.lab.includes('closure') ? 2 : AMP*0.35));
      const y = MY - amp*Math.sin(p*(s2&&s2.voiced?0.42:2.6))*(0.6+0.4*Math.sin(p*0.05));
      p ? x.lineTo(L+p, y) : x.moveTo(L+p, y);
    }
    x.stroke();
    // pitch track
    const TY = 150, TH = 56;
    x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, TY+TH); x.lineTo(L+PW, TY+TH); x.stroke();
    mtTxt(x, 'F0', 6, TY+10, {size:9, col:MTC.a1});
    mtTxt(x, '300', L-6, TY, {size:8, col:MTC.muted, align:'right'});
    mtTxt(x, '80', L-6, TY+TH, {size:8, col:MTC.muted, align:'right'});
    segs.forEach(s2=>{
      if(!s2.voiced){
        mtRR(x, L+s2.a*PW, TY, (s2.b-s2.a)*PW, TH, 3); x.fillStyle = 'rgba(159,18,57,0.07)'; x.fill();
        mtTxt(x, 'no F0', L+((s2.a+s2.b)/2)*PW, TY+TH/2, {size:8, col:MTC.a2, align:'center'});
        return;
      }
      x.strokeStyle = MTC.a1; x.lineWidth = 2.4;
      x.beginPath();
      for(let p=0;p<=(s2.b-s2.a)*PW;p++){
        const u = p/((s2.b-s2.a)*PW);
        const v = mtLerp(s2.f0[0], s2.f0[1], mtEase(u));
        const y = TY + TH*(1-v);
        p ? x.lineTo(L+s2.a*PW+p, y) : x.moveTo(L+s2.a*PW+p, y);
      }
      x.stroke();
    });
    mtTxt(x, 'Three o\u2019clock?', L, 22, {size:12, col:MTC.text, font:MTC.body});
    mtSet('pf0-cap', 'The pitch track has holes in it. During the [th] at the start and the [k] closure in the middle there is no vocal fold vibration, so F0 is not merely hard to measure, it does not exist. Every pitch-tracking algorithm has to decide voiced from unvoiced first, and every downstream model has to tolerate the gaps. The final rise across <em>clock</em> is what makes this a question.');
  }
}

/* ── RMS demonstration ────────────────────────────────────── */
const PRM = [
  {k:'raw', lab:'raw average'}, {k:'sq', lab:'square first'}, {k:'rms', lab:'RMS'}
];
let _prm = 0;
function prmBuild(){
  const b = document.getElementById('prm-btns');
  if(b) b.innerHTML = PRM.map((p,i)=>`<button style="${MTBTN}" id="prm-b${i}" onclick="prmGo(${i})">${p.lab}</button>`).join('');
  _prm = 0; prmDraw();
}
function prmGo(i){ _prm = i; prmDraw(); }
function prmDraw(){
  PRM.forEach((_,i)=>{ const e = document.getElementById('prm-b'+i); if(e){
    e.style.background = i===_prm ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_prm ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('prm-canvas', 216); if(!c) return;
  const {x, w} = c;
  const L = 40, PW = w-L-150, MY = 92, AMP = 58;
  const N = 24;
  const xs = [];
  for(let i=0;i<N;i++) xs.push(0.85*Math.sin(2*Math.PI*2.5*i/N));
  x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, MY); x.lineTo(L+PW, MY); x.stroke();
  const bw = PW/N;
  xs.forEach((v, i)=>{
    const px = L + i*bw;
    const shown = _prm===0 ? v : v*v*Math.sign(1);
    const h = shown*AMP*(_prm===0?1:1.1);
    x.fillStyle = _prm===0 ? (v>=0 ? 'rgba(79,70,229,0.6)' : 'rgba(159,18,57,0.6)') : 'rgba(11,132,87,0.6)';
    if(_prm===0) mtRR(x, px+1, Math.min(MY, MY-h), bw-2, Math.abs(h), 2);
    else mtRR(x, px+1, MY-h, bw-2, h, 2);
    x.fill();
  });
  const mean = xs.reduce((a,v)=>a+v,0)/N;
  const power = xs.reduce((a,v)=>a+v*v,0)/N;
  const rms = Math.sqrt(power);
  const RX = L+PW+24;
  const rows = [
    ['\u03A3 x\u1D62 / N', mean.toFixed(4), _prm===0?MTC.a2:MTC.muted],
    ['\u03A3 x\u1D62\u00b2 / N', power.toFixed(4), _prm===1?MTC.a4:MTC.muted],
    ['\u221A(\u03A3 x\u1D62\u00b2/N)', rms.toFixed(4), _prm===2?MTC.a1:MTC.muted]
  ];
  rows.forEach(([lab, v, col], i)=>{
    const y = 56 + i*44;
    mtTxt(x, lab, RX, y, {size:9, col:MTC.muted});
    mtTxt(x, v, RX, y+18, {size:14, col:col, weight:'700'});
  });
  const notes = [
    'The raw samples: positive bars in teal, negative in crimson. They are nearly balanced, so their sum is essentially zero no matter how loud the sound is. The average of a waveform measures its DC offset, not its loudness.',
    'Squaring makes every value positive, so nothing cancels. The mean of the squares is the <b>power</b>, a genuine measure of energy, but it is in squared units.',
    'Taking the square root returns the measure to the original amplitude units, giving <b>RMS amplitude</b>: the loudness measure actually used, and the quantity the energy feature in Section 14.6 is built from.'
  ];
  mtSet('prm-cap', notes[_prm]);
}

/* ── Mel Curve ────────────────────────────────────────────── */
function pmlDraw(){
  const n = Math.max(3, Math.min(10, Math.round(+(document.getElementById('pml-n')||{value:6}).value)));
  mtSet('pml-l', n + ' equal steps');
  const c = mtCtx('pml-canvas', 240); if(!c) return;
  const {x, w} = c;
  const L = 54, T = 20, PW = Math.min(300, w-300), PH = 150;
  const FMAX = 8000;
  const mel = f => 1127*Math.log(1+f/700);
  const MMAX = mel(FMAX);
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L, T); x.lineTo(L, T+PH); x.lineTo(L+PW, T+PH); x.stroke();
  mtTxt(x, 'Hz', L+PW, T+PH+18, {size:9, col:MTC.muted, align:'right'});
  x.save(); x.translate(L-30, T+PH/2); x.rotate(-Math.PI/2);
  mtTxt(x, 'mel', 0, 0, {size:9, col:MTC.muted, align:'center'}); x.restore();
  // curve
  x.strokeStyle = MTC.a1; x.lineWidth = 2.6;
  x.beginPath();
  for(let p=0;p<=PW;p++){
    const f = (p/PW)*FMAX;
    const y = T + PH*(1 - mel(f)/MMAX);
    p ? x.lineTo(L+p, y) : x.moveTo(L+p, y);
  }
  x.stroke();
  // linear reference
  x.strokeStyle = MTC.line; x.setLineDash([3,3]);
  x.beginPath(); x.moveTo(L, T+PH); x.lineTo(L+PW, T); x.stroke(); x.setLineDash([]);
  // equal mel steps -> unequal Hz
  const invMel = m => 700*(Math.exp(m/1127)-1);
  const hzs = [];
  for(let k=0;k<=n;k++){
    const m = (k/n)*MMAX;
    const f = invMel(m);
    hzs.push(f);
    const px = L + (f/FMAX)*PW, py = T + PH*(1-m/MMAX);
    x.strokeStyle = 'rgba(159,18,57,0.4)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(L, py); x.lineTo(px, py); x.stroke();
    x.beginPath(); x.moveTo(px, py); x.lineTo(px, T+PH); x.stroke();
    x.beginPath(); x.arc(px, py, 3.2, 0, 7); x.fillStyle = MTC.a2; x.fill();
  }
  // Hz spacing bar
  const RX = L+PW+50, RW = w-RX-24;
  mtTxt(x, 'THE SAME STEPS ON A HZ AXIS', RX, 30, {size:8.5, col:MTC.muted});
  x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(RX, 60); x.lineTo(RX+RW, 60); x.stroke();
  hzs.forEach((f, k)=>{
    const px = RX + (f/FMAX)*RW;
    x.strokeStyle = MTC.a2; x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(px, 50); x.lineTo(px, 70); x.stroke();
  });
  mtTxt(x, '0', RX, 84, {size:8, col:MTC.muted});
  mtTxt(x, '8000 Hz', RX+RW, 84, {size:8, col:MTC.muted, align:'right'});
  const gaps = hzs.slice(1).map((f,i)=>f-hzs[i]);
  mtTxt(x, 'first step: ' + gaps[0].toFixed(0) + ' Hz', RX, 118, {size:10, col:MTC.a4});
  mtTxt(x, 'last step: ' + gaps[gaps.length-1].toFixed(0) + ' Hz', RX, 138, {size:10, col:MTC.a2});
  mtTxt(x, (gaps[gaps.length-1]/gaps[0]).toFixed(1) + '\u00d7 wider', RX, 162, {size:12, col:MTC.a2, weight:'700'});
  mtSet('pml-cap', 'Every step is the same size in mels, meaning every step sounds like the same pitch increase. On the hertz axis at the right, the same steps are visibly unequal: the first spans ' + gaps[0].toFixed(0) + ' Hz and the last spans ' + gaps[gaps.length-1].toFixed(0) + ' Hz, ' + (gaps[gaps.length-1]/gaps[0]).toFixed(1) + ' times wider. The curve only hugs a straight line over the first couple of hundred hertz, where the logarithm is still close to its argument; by 500 Hz it has bent well away. The two axes read the same number at exactly one frequency, 1000 Hz, which is where the constants 1127 and 700 put the crossing.');
}

/* ══ 14.4.4 READING PHONES OFF THE WAVEFORM ═══════════════ */
PH_PAGES.phread = `
<div class="lesson-chapter-label">Section 14.4.4</div>
<h1 class="lesson-h1">Reading Phones Off the Waveform</h1>
<p class="lesson-intro">Before any transform is applied, a surprising amount can be read directly off the raw waveform. The three broad classes of English phone leave visually distinct signatures, and learning to spot them is the fastest way to understand what the signal actually contains.</p>

<h2 class="lesson-h2">Three Signatures</h2>
<p class="lesson-p"><strong>Vowels</strong> are loud and <em>periodic</em>. The vocal folds are vibrating and the tract is open, so the trace shows large regular repeating cycles, one per glottal pulse. They are the tallest regions in any utterance, which makes them the easiest landmarks to find.</p>
<p class="lesson-p"><strong>Stops</strong> such as [b], [d] and [k] have a two-part signature that is unmistakable once seen: a stretch of near-silence while the tract is fully closed and no air escapes, followed by an abrupt <em>burst</em> when the closure is released. Silence in the middle of a word almost always means a stop.</p>
<p class="lesson-p"><strong>Fricatives</strong> such as [s] and [sh] are noisy and <em>aperiodic</em>. Air is forced through a narrow gap, producing turbulence, and the trace shows irregular high-frequency wiggle with no repeating pattern. Moderate amplitude, no periodicity.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Waveform Detective</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="pwdReveal()">reveal the labels</button>
      <button style="${MTBTN}" id="pwd-m" onclick="pwdMag()">magnify the sh/iy boundary</button>
    </div>
    <canvas id="pwd-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="pwd-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The magnified view makes the periodic-versus-aperiodic distinction concrete. Within a few milliseconds the signal changes character completely: to the left of the boundary, random noise with no repeating structure; to the right, a clean pattern repeating at the rate of vocal fold vibration. That transition <em>is</em> the phone boundary, and it is why an alignment tool can place segment edges without understanding a word of the language.</p>

<div class="quiz-block" id="qph-r"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A region of near-silence appears in the middle of a word. What is the most likely cause?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-r','Correct. During the closure phase of a stop the tract is sealed and almost no sound escapes, which appears as a silent gap followed by a burst.')">The closure phase of a stop consonant</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-r','Fricatives are continuous turbulent noise, not silence; they show moderate irregular amplitude.')">A fricative</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-r','Vowels are the loudest parts of the signal, not the quietest.')">A vowel spoken quietly</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-r','A word boundary need not be silent at all; connected speech usually runs words together without gaps.')">A word boundary</button>
</div><div class="quiz-explain" id="qph-r-explain"></div></div>`;

/* ── Waveform Detective ───────────────────────────────────── */
const PWD_SEG = [
  {p:'sh', t0:.00, t1:.14, kind:'fric',  word:'she'},
  {p:'iy', t0:.14, t1:.26, kind:'vowel', word:'she'},
  {p:'jh', t0:.26, t1:.33, kind:'stop',  word:'just'},
  {p:'ax', t0:.33, t1:.40, kind:'vowel', word:'just'},
  {p:'s',  t0:.40, t1:.52, kind:'fric',  word:'just'},
  {p:'t',  t0:.52, t1:.58, kind:'stop',  word:'just'},
  {p:'hh', t0:.58, t1:.64, kind:'fric',  word:'had'},
  {p:'ae', t0:.64, t1:.78, kind:'vowel', word:'had'},
  {p:'d',  t0:.78, t1:.85, kind:'stop',  word:'had'},
  {p:'ax', t0:.85, t1:.92, kind:'vowel', word:'a'},
  {p:'b',  t0:.92, t1:1.02,kind:'stop',  word:'baby'},
  {p:'ey', t0:1.02,t1:1.18,kind:'vowel', word:'baby'},
  {p:'b',  t0:1.18,t1:1.28,kind:'stop',  word:'baby'},
  {p:'iy', t0:1.28,t1:1.44,kind:'vowel', word:'baby'}
];
let _pwd = {rev:false, mag:false, hot:-1};
function pwdBuild(){
  const cv = document.getElementById('pwd-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('mousemove', e=>{
      if(_pwd.mag) return;
      const r = cv.getBoundingClientRect();
      const dur = 1.44;
      const t = (e.clientX - r.left - 20)/(r.width-40)*dur;
      let h = -1; PWD_SEG.forEach((s,j)=>{ if(t>=s.t0 && t<s.t1) h = j; });
      if(h!==_pwd.hot){ _pwd.hot = h; pwdDraw(); }
    });
    cv.addEventListener('mouseleave', ()=>{ _pwd.hot = -1; pwdDraw(); });
  }
  _pwd = {rev:false, mag:false, hot:-1}; pwdDraw();
}
function pwdReveal(){ _pwd.rev = !_pwd.rev; pwdDraw(); }
function pwdMag(){ _pwd.mag = !_pwd.mag; pwdDraw(); }
function pwdSample(t){
  const s = PWD_SEG.find(g=>t>=g.t0 && t<g.t1);
  if(!s) return 0;
  const local = (t - s.t0)/(s.t1 - s.t0);
  const env = Math.sin(Math.PI*Math.min(1,Math.max(0,local)));
  if(s.kind==='vowel'){
    const f0 = 210;
    return env*(0.62*Math.sin(2*Math.PI*f0*t) + 0.26*Math.sin(4*Math.PI*f0*t) + 0.14*Math.sin(6*Math.PI*f0*t));
  }
  if(s.kind==='fric'){
    return env*0.26*(Math.sin(t*8100)+Math.sin(t*12700)+Math.sin(t*17300))/2.4;
  }
  // stop: silence then burst
  if(local < 0.72) return 0.012*Math.sin(t*9000);
  const b = (local-0.72)/0.28;
  return 0.55*Math.exp(-b*7)*(Math.sin(t*15000)+Math.sin(t*9400))/2;
}
function pwdDraw(){
  const m = document.getElementById('pwd-m');
  if(m){ m.style.background = _pwd.mag?'var(--accent)':'var(--surface2)'; m.style.color = _pwd.mag?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('pwd-canvas', _pwd.mag ? 232 : 256); if(!c) return;
  const {x, w} = c;
  const L = 20, PW = w-40;
  if(_pwd.mag){
    const t0 = 0.125, t1 = 0.158;
    mtTxt(x, 'MAGNIFIED \u00b7 the [sh] \u2192 [iy] boundary, 33 ms', L, 22, {size:9.5, col:MTC.muted});
    const wy = 96, amp = 62;
    x.strokeStyle = MTC.a1; x.lineWidth = 1.2;
    x.beginPath();
    for(let px=0; px<PW; px++){
      const t = t0 + (px/PW)*(t1-t0);
      const v = pwdSample(t);
      px? x.lineTo(L+px, wy - v*amp) : x.moveTo(L+px, wy - v*amp);
    }
    x.stroke();
    const bx = L + ((0.14-t0)/(t1-t0))*PW;
    x.strokeStyle = MTC.a2; x.lineWidth = 2; x.setLineDash([5,4]);
    x.beginPath(); x.moveTo(bx, 34); x.lineTo(bx, 168); x.stroke(); x.setLineDash([]);
    mtChip(x, L+8, 178, (bx-L-16), 30, 'rgba(165,104,14,0.10)', MTC.a5, null);
    mtTxt(x, '[sh] \u00b7 aperiodic noise, no repeating pattern', (L+bx)/2, 193, {size:9.5, col:MTC.a5, align:'center'});
    mtChip(x, bx+8, 178, (L+PW-bx-16), 30, 'rgba(11,132,87,0.10)', MTC.a4, null);
    mtTxt(x, '[iy] \u00b7 periodic, one cycle per glottal pulse', (bx+L+PW)/2, 193, {size:9.5, col:MTC.a4, align:'center'});
    mtSet('pwd-cap', 'Within a few milliseconds the signal changes category. Left of the line the wiggle is random: sampling any two stretches gives unrelated shapes. Right of it a single shape repeats at a fixed rate. That change of character is the phone boundary, and it is detectable without knowing the language.');
    return;
  }
  // full utterance
  const dur = 1.44, wy = 108, amp = 62;
  mtTxt(x, '\u201Cshe just had a baby\u201D', L, 22, {size:12.5, col:MTC.text, font:MTC.body});
  x.strokeStyle = MTC.line; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L, wy); x.lineTo(L+PW, wy); x.stroke();
  x.strokeStyle = 'rgba(79,70,229,0.75)'; x.lineWidth = 1;
  x.beginPath();
  for(let px=0; px<PW; px++){
    const t = (px/PW)*dur;
    const v = pwdSample(t);
    px? x.lineTo(L+px, wy - v*amp) : x.moveTo(L+px, wy - v*amp);
  }
  x.stroke();
  if(_pwd.hot >= 0){
    const s = PWD_SEG[_pwd.hot];
    x.fillStyle = 'rgba(165,104,14,0.14)';
    x.fillRect(L + (s.t0/dur)*PW, 40, ((s.t1-s.t0)/dur)*PW, 140);
  }
  // tiers
  const KIND_COL = {vowel:MTC.a4, fric:MTC.a5, stop:MTC.a2};
  PWD_SEG.forEach((s, j)=>{
    const x1 = L + (s.t0/dur)*PW, x2 = L + (s.t1/dur)*PW;
    x.strokeStyle = MTC.line; x.lineWidth = 0.7;
    x.beginPath(); x.moveTo(x1, 42); x.lineTo(x1, 178); x.stroke();
    if(_pwd.rev){
      mtChip(x, x1+1, 186, Math.max(4, x2-x1-2), 26, KIND_COL[s.kind]+'22', KIND_COL[s.kind], null);
      if(x2-x1 > 15) mtTxt(x, s.p, (x1+x2)/2, 199, {size:9, col:MTC.text, align:'center'});
    }
  });
  if(_pwd.rev){
    // word tier
    const words = [];
    PWD_SEG.forEach(s=>{ const last = words[words.length-1];
      if(last && last.w===s.word) last.t1 = s.t1; else words.push({w:s.word, t0:s.t0, t1:s.t1}); });
    words.forEach(wd=>{
      const x1 = L + (wd.t0/dur)*PW, x2 = L + (wd.t1/dur)*PW;
      mtChip(x, x1+1, 218, Math.max(4, x2-x1-2), 24, 'rgba(23,27,52,0.05)', MTC.line2, null);
      if(x2-x1 > 22) mtTxt(x, wd.w, (x1+x2)/2, 230, {size:9.5, col:MTC.text, align:'center'});
    });
    // legend
    mtTxt(x, 'vowel', L, 250, {size:8.5, col:MTC.a4});
    mtTxt(x, 'fricative', L+58, 250, {size:8.5, col:MTC.a5});
    mtTxt(x, 'stop', L+130, 250, {size:8.5, col:MTC.a2});
  } else {
    mtTxt(x, 'Before revealing: find the six vowels by their tall regular cycles, the two [b] sounds in "baby" by silence-then-burst, and the [sh] by its noisy texture.',
          L, 200, {size:9, col:MTC.muted});
  }
  const s = _pwd.hot>=0 ? PWD_SEG[_pwd.hot] : null;
  mtSet('pwd-cap', s
    ? '<b style="color:' + KIND_COL[s.kind] + '">[' + s.p + ']</b> in <em>' + s.word + '</em>, a ' +
      (s.kind==='vowel'?'vowel: large regular cycles, the loudest thing in the signal.'
       : s.kind==='fric'?'fricative: moderate amplitude, irregular, no repeating pattern.'
       : 'stop: a silent closure followed by a sharp release burst.') +
      ' Duration ' + ((s.t1-s.t0)*1000).toFixed(0) + ' ms.'
    : (_pwd.rev
      ? 'The six vowels line up with the six tall periodic regions. Both [b] sounds show the silence-then-burst pattern, and the [sh] at the start is visibly noisy rather than periodic. Hover any segment for detail.'
      : 'Hover the trace to inspect regions, then reveal the labels to check yourself.'));
}

/* ══ 14.4.5 FOURIER ═══════════════════════════════════════ */
PH_PAGES.phfour = `
<div class="lesson-chapter-label">Section 14.4.5</div>
<h1 class="lesson-h1">Decomposing Sound Into Frequencies</h1>
<p class="lesson-intro">A speech waveform is not a sine wave. It is, however, a <em>sum</em> of sine waves, and that fact is the foundation of everything that follows. Fourier analysis recovers which frequencies are present and how much of each, and once the signal is described that way, the properties that distinguish one vowel from another become directly visible.</p>

<h2 class="lesson-h2">Building a Complex Wave From Simple Ones</h2>
<p class="lesson-p">Start with the reverse operation. Add a 10 Hz sine to a 100 Hz sine and the result is a wave that is neither: a slow undulation with fast ripple riding on it. Its <strong>spectrum</strong>, a plot of amplitude against frequency, has exactly two spikes, one at each input frequency. The spectrum discards when things happened and keeps only what was present and how much.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Fourier Adder</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">10 Hz amplitude</span>
      <input id="pfa-a" type="range" min="0" max="1" step="0.05" value="0.7" oninput="pfaDraw()" style="width:120px;accent-color:var(--accent)">
      <span style="${MTLBL}">100 Hz amplitude</span>
      <input id="pfa-b" type="range" min="0" max="1" step="0.05" value="0.35" oninput="pfaDraw()" style="width:120px;accent-color:var(--accent)">
    </div>
    <canvas id="pfa-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pfa-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Counting Frequencies By Hand</h2>
<p class="lesson-p">Real speech works the same way, with more components. Take the vowel [ae] from <em>had</em>. Counting the large cycles gives the fundamental: 10 repetitions in 0.0427 seconds is 234 Hz, which is \\(F_0\\). Look closer and each large cycle contains about four smaller peaks, roughly 936 Hz, and each of those contains two smaller still, roughly 1872 Hz. Those nested periodicities are the higher-frequency components, and a discrete Fourier transform of the same signal shows them directly as peaks near 930, 1860 and 3020 Hz.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Counting Cycles Against the Spectrum</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pcy-btns"></div>
    <canvas id="pcy-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pcy-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">From Spectrum to Spectrogram</h2>
<p class="lesson-p">A spectrum describes one instant. Speech changes constantly, so the useful move is to compute a spectrum for each short slice of the signal, then lay the results side by side: rotate each spectrum a quarter turn so frequency runs up the page, place them in time order, and encode amplitude as darkness. The result is a <strong>spectrogram</strong>, a picture of three quantities at once, with time along one axis, frequency along the other, and energy as ink.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Spectrogram Stacker</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">stack</span>
      <input id="pss-t" type="range" min="0" max="1" step="0.02" value="0" oninput="pssDraw()" style="width:200px;accent-color:var(--accent)">
      <span id="pss-l" style="${MTLBL}"></span>
    </div>
    <canvas id="pss-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pss-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Formants</h2>
<p class="lesson-p">In the spectrogram of a vowel, the energy is not spread evenly. It clusters into dark horizontal bands called <strong>formants</strong>, numbered upward from the lowest: \\(F_1\\), \\(F_2\\), and so on. These bands are resonances of the vocal tract, and their frequencies are set by the shape of the mouth, which means <em>they identify the vowel</em>. The first two are almost enough on their own: \\(F_1\\) tracks tongue height, falling as the tongue rises, and \\(F_2\\) tracks frontness, rising as the tongue moves forward.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Formant Comparator</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pfm-btns"></div>
    <canvas id="pfm-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pfm-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Plot vowels as points with \\(F_1\\) on one axis and \\(F_2\\) on the other and the result is recognizable: it is the vowel trapezoid from Section 14.2.3, arrived at from the acoustics instead of from the articulation. The tongue position a speaker chooses and the resonances a listener hears are two descriptions of one event.</p>

<div class="quiz-block" id="qph-f"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What do the dark horizontal bands in a vowel spectrogram represent?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-f','Correct. Formants are vocal tract resonances; their frequencies depend on the shape of the tract and therefore identify the vowel.')">Formants: resonances of the vocal tract that identify the vowel</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-f','F0 is a single low frequency set by the vocal folds; the bands sit far above it and are set by the tract shape.')">Repetitions of the fundamental frequency</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-f','Word boundaries would appear as vertical structure in time, not horizontal bands in frequency.')">Word boundaries in the utterance</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-f','Noise appears as diffuse energy without clear banding; formants are structured resonances.')">Background noise in the recording</button>
</div><div class="quiz-explain" id="qph-f-explain"></div></div>`;

/* ── Fourier Adder ────────────────────────────────────────── */
function pfaDraw(){
  const A = +(document.getElementById('pfa-a')||{value:0.7}).value;
  const B = +(document.getElementById('pfa-b')||{value:0.35}).value;
  const c = mtCtx('pfa-canvas', 250); if(!c) return;
  const {x, w} = c;
  const L = 20, PW = (w-70)*0.62, SX = L+PW+40, SW = w-SX-16;
  const dur = 0.2;
  const trace = (y, amp, f, col, lab)=>{
    x.strokeStyle = MTC.line; x.lineWidth = 1;
    x.beginPath(); x.moveTo(L, y); x.lineTo(L+PW, y); x.stroke();
    x.strokeStyle = col; x.lineWidth = 1.4;
    x.beginPath();
    for(let px=0; px<PW; px++){
      const t = (px/PW)*dur;
      const v = typeof f === 'function' ? f(t) : amp*Math.sin(2*Math.PI*f*t);
      px? x.lineTo(L+px, y - v*26) : x.moveTo(L+px, y - v*26);
    }
    x.stroke();
    mtTxt(x, lab, L, y-34, {size:9, col:col});
  };
  trace(46, A, 10, MTC.a1, '10 Hz  \u00b7  amplitude ' + A.toFixed(2));
  trace(126, B, 100, MTC.a5, '100 Hz  \u00b7  amplitude ' + B.toFixed(2));
  trace(212, 1, t => A*Math.sin(2*Math.PI*10*t) + B*Math.sin(2*Math.PI*100*t), MTC.a2, 'sum of the two');
  // spectrum
  mtTxt(x, 'SPECTRUM', SX, 24, {size:9, col:MTC.muted});
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(SX, 212); x.lineTo(SX+SW, 212); x.stroke();
  x.beginPath(); x.moveTo(SX, 212); x.lineTo(SX, 40); x.stroke();
  [[10, A, MTC.a1], [100, B, MTC.a5]].forEach(([f, a, col])=>{
    const px = SX + (f/130)*SW;
    x.strokeStyle = col; x.lineWidth = 5; x.lineCap='round';
    x.beginPath(); x.moveTo(px, 212); x.lineTo(px, 212 - a*150); x.stroke();
    mtTxt(x, f+' Hz', px, 226, {size:8.5, col:MTC.muted, align:'center'});
    if(a>0.02) mtTxt(x, a.toFixed(2), px, 212-a*150-10, {size:8.5, col:col, align:'center'});
  });
  mtTxt(x, 'amplitude', SX-4, 34, {size:8, col:MTC.muted});
  mtTxt(x, 'frequency \u2192', SX+SW, 240, {size:8, col:MTC.muted, align:'right'});
  mtSet('pfa-cap', 'The sum at the bottom is neither a 10 Hz nor a 100 Hz wave, but it contains both, and the spectrum on the right says exactly that with two spikes. Drag either amplitude to zero and the corresponding spike disappears while the other survives untouched: the two components never interfere in the frequency description, however tangled they look in the time description.');
}

/* ── Cycle counting ───────────────────────────────────────── */
const PCY = [
  {lab:'large cycles \u2192 F0', n:10, dur:.0427, f:234, note:'Ten full repetitions of the overall pattern occupy 0.0427 seconds, so the pattern repeats 10/0.0427 = 234 times a second. That is F0, the rate the vocal folds are vibrating.'},
  {lab:'medium peaks', n:4, dur:.00427, f:936, note:'Inside each large cycle sit roughly four smaller peaks. Four peaks per 0.00427-second cycle is about 936 Hz, a component near the fourth harmonic and close to the first formant region.'},
  {lab:'smallest peaks', n:2, dur:.001068, f:1872, note:'Each medium peak contains about two smaller ones, roughly 1872 Hz. Counting nested periodicities by eye recovers, approximately, what the Fourier transform computes exactly.'}
];
let _pcy = 0;
function pcyBuild(){
  const b = document.getElementById('pcy-btns');
  if(b) b.innerHTML = PCY.map((p,i)=>`<button style="${MTBTN}" id="pcy-b${i}" onclick="pcyGo(${i})">${p.lab}</button>`).join('');
  _pcy = 0; pcyDraw();
}
function pcyGo(i){ _pcy = i; pcyDraw(); }
function pcyDraw(){
  PCY.forEach((_,i)=>{ const e = document.getElementById('pcy-b'+i); if(e){
    e.style.background = i===_pcy ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pcy ? '#FAFBFF' : 'var(--muted)'; } });
  const P = PCY[_pcy];
  const c = mtCtx('pcy-canvas', 244); if(!c) return;
  const {x, w} = c;
  const L = 20, PW = (w-60)*0.58, SX = L+PW+34, SW = w-SX-16;
  const dur = 0.0427;
  const f0 = 234;
  const sig = t => 0.60*Math.sin(2*Math.PI*f0*t) + 0.30*Math.sin(2*Math.PI*936*t)
                 + 0.16*Math.sin(2*Math.PI*1872*t) + 0.09*Math.sin(2*Math.PI*3020*t);
  mtTxt(x, 'THE VOWEL [ae] FROM \u201Chad\u201D', L, 22, {size:9.5, col:MTC.muted});
  const wy = 96;
  x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, wy); x.lineTo(L+PW, wy); x.stroke();
  x.strokeStyle = MTC.a1; x.lineWidth = 1.3;
  x.beginPath();
  for(let px=0; px<PW; px++){
    const t = (px/PW)*dur;
    px? x.lineTo(L+px, wy - sig(t)*46) : x.moveTo(L+px, wy - sig(t)*46);
  }
  x.stroke();
  // count markers
  const period = 1/P.f;
  const nMark = Math.min(40, Math.round(dur/period));
  for(let k=0;k<=nMark;k++){
    const t = k*period;
    if(t > dur) break;
    const px = L + (t/dur)*PW;
    x.strokeStyle = MTC.a2; x.lineWidth = _pcy===0?1.4:0.9;
    x.setLineDash([2,3]);
    x.beginPath(); x.moveTo(px, wy-52); x.lineTo(px, wy+52); x.stroke(); x.setLineDash([]);
  }
  x.strokeStyle = MTC.a5; x.lineWidth = 1.6;
  x.beginPath(); x.moveTo(L, wy+62); x.lineTo(L+PW, wy+62); x.stroke();
  mtTxt(x, dur.toFixed(4) + ' s', L+PW/2, wy+76, {size:9, col:MTC.a5, align:'center'});
  mtTxt(x, nMark + ' cycles \u00f7 ' + dur.toFixed(4) + ' s = ' + P.f + ' Hz', L, wy+100, {size:11, col:MTC.a2, weight:'700'});
  // spectrum beside
  mtTxt(x, 'DFT SPECTRUM', SX, 22, {size:9, col:MTC.muted});
  const peaks = [[234,.60],[930,.30],[1860,.16],[3020,.09]];
  const FMAX = 3600;
  x.strokeStyle = MTC.line2; x.beginPath(); x.moveTo(SX, 190); x.lineTo(SX+SW, 190); x.stroke();
  // envelope
  x.strokeStyle = 'rgba(79,70,229,0.35)'; x.lineWidth = 1;
  x.beginPath();
  for(let px=0; px<SW; px++){
    const f = (px/SW)*FMAX;
    let v = 0.02;
    peaks.forEach(([pf, pa])=>{ v += pa*Math.exp(-Math.pow((f-pf)/95, 2)); });
    px? x.lineTo(SX+px, 190 - v*140) : x.moveTo(SX+px, 190 - v*140);
  }
  x.stroke();
  peaks.forEach(([pf, pa], i)=>{
    const px = SX + (pf/FMAX)*SW;
    const near = Math.abs(pf - P.f) < 160;
    x.strokeStyle = near ? MTC.a2 : 'rgba(79,70,229,0.5)'; x.lineWidth = near?3:1.6;
    x.beginPath(); x.moveTo(px, 190); x.lineTo(px, 190 - pa*140); x.stroke();
    mtTxt(x, pf + '', px, 204, {size:8, col: near?MTC.a2:MTC.muted, align:'center'});
  });
  mtTxt(x, 'Hz \u2192', SX+SW, 220, {size:8, col:MTC.muted, align:'right'});
  mtSet('pcy-cap', P.note);
}

/* ── Spectrogram Stacker ──────────────────────────────────── */
function pssDraw(){
  const t = +(document.getElementById('pss-t')||{value:0}).value;
  mtSet('pss-l', t < 0.05 ? 'separate spectra' : t > 0.95 ? 'spectrogram' : 'rotating and stacking');
  const c = mtCtx('pss-canvas', 260); if(!c) return;
  const {x, w} = c;
  const N = 12;
  const L = 26, PW = w-L-40, T = 30, PH = 176;
  // formant tracks over time (a diphthong-ish sweep)
  const F1 = i => 420 + 300*Math.sin(i/N*Math.PI*0.9);
  const F2 = i => 2200 - 900*Math.sin(i/N*Math.PI*0.75);
  const FMAX = 3600;
  const amp = (i, f) => {
    let v = 0.04;
    [[F1(i), 0.9], [F2(i), 0.7], [2900, 0.35]].forEach(([cf, a])=>{
      v += a*Math.exp(-Math.pow((f-cf)/130, 2));
    });
    return Math.min(1, v);
  };
  const colW = PW/N;
  for(let i=0;i<N;i++){
    const ox = L + i*colW;
    if(t < 0.5){
      // separate spectra, upright, rotating
      const rot = (t/0.5) * Math.PI/2;
      x.save();
      x.translate(ox + colW/2, T + PH);
      x.rotate(-rot);
      x.strokeStyle = 'rgba(79,70,229,0.75)'; x.lineWidth = 1.2;
      x.beginPath();
      for(let px=0; px<colW-6; px++){
        const f = (px/(colW-6))*FMAX;
        const v = amp(i, f);
        px ? x.lineTo(px - (colW-6)/2, -v*(PH-20)) : x.moveTo(px - (colW-6)/2, -v*(PH-20));
      }
      x.stroke();
      x.restore();
    }
    if(t > 0.35){
      // heat columns fading in
      const a = Math.min(1, (t-0.35)/0.5);
      for(let py=0; py<PH; py++){
        const f = (1 - py/PH)*FMAX;
        const v = amp(i, f);
        x.fillStyle = 'rgba(13,20,23,' + (v*0.92*a).toFixed(3) + ')';
        x.fillRect(ox, T+py, colW-0.6, 1.2);
      }
    }
  }
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.strokeRect(L, T, PW, PH);
  mtTxt(x, 'time \u2192', L+PW/2, T+PH+20, {size:9, col:MTC.muted, align:'center'});
  x.save(); x.translate(12, T+PH/2); x.rotate(-Math.PI/2);
  mtTxt(x, 'frequency \u2192', 0, 0, {size:9, col:MTC.muted, align:'center'}); x.restore();
  [0,1000,2000,3000].forEach(f=>{
    const py = T + PH*(1 - f/FMAX);
    mtTxt(x, f===0?'0':(f/1000)+'k', L-5, py, {size:8, col:MTC.muted, align:'right'});
  });
  if(t > 0.9){
    mtTxt(x, 'F2', L+PW+6, T + PH*(1 - F2(N-1)/FMAX), {size:9.5, col:MTC.a5, weight:'700'});
    mtTxt(x, 'F1', L+PW+6, T + PH*(1 - F1(N-1)/FMAX), {size:9.5, col:MTC.a5, weight:'700'});
  }
  mtSet('pss-cap', t < 0.05
    ? 'Twelve spectra, one per short slice of the signal, drawn the usual way with amplitude going up. Each is a snapshot: it says what frequencies were present during its slice and says nothing about any other slice.'
    : t < 0.9
      ? 'Each spectrum rotates a quarter turn so that frequency runs up the page instead of across, and amplitude becomes darkness rather than height. Keep dragging.'
      : 'Placed side by side in time order, the rotated spectra become a spectrogram: time across, frequency up, energy as ink. The two dark bands sweeping through the middle are formants, and their movement is the tongue changing position during the vowel.');
}

/* ── Formant Comparator ───────────────────────────────────── */
const PFM = [
  {p:'ih', word:'bit',  F1:470, F2:2100, note:'High front, but lax: the tongue sits a little lower and a little less far forward than for [iy], so F1 comes up and F2 comes down relative to it.'},
  {p:'ae', word:'bat',  F1:800, F2:1860, note:'Low front. The tongue drops, so F1 rises sharply. F2 stays fairly high since the tongue is still forward.'},
  {p:'aa', word:'bot',  F1:730, F2:1090, note:'Low back. The jaw is open about as far as for [ae], so F1 is similarly high, but the tongue has retracted and F2 has fallen by nearly 800 Hz.'},
  {p:'iy', word:'beet', F1:270, F2:2400, note:'The highest and frontest vowel: lowest F1 paired with the highest F2 of the set.'},
  {p:'uw', word:'boot', F1:320, F2:900,  note:'High back and rounded. Both formants are low, which is as far from [iy] as English gets.'}
];
let _pfm = 0;
function pfmBuild(){
  const b = document.getElementById('pfm-btns');
  if(b) b.innerHTML = PFM.map((p,i)=>
    `<button style="${MTBTN}" id="pfm-b${i}" onclick="pfmGo(${i})">[${p.p}] ${p.word}</button>`).join('');
  _pfm = 0; pfmDraw();
}
function pfmGo(i){ _pfm = i; pfmDraw(); }
function pfmDraw(){
  PFM.forEach((_,i)=>{ const e = document.getElementById('pfm-b'+i); if(e){
    e.style.background = i===_pfm ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pfm ? '#FAFBFF' : 'var(--muted)'; } });
  const P = PFM[_pfm];
  const c = mtCtx('pfm-canvas', 262); if(!c) return;
  const {x, w} = c;
  const FMAX = 3200;
  const L = 40, GW = (w-L-40)*0.46, T = 30, PH = 176;
  // spectrogram patch
  for(let px=0; px<GW; px++) for(let py=0; py<PH; py+=1.4){
    const f = (1 - py/PH)*FMAX;
    let v = 0.05;
    [[P.F1,0.95],[P.F2,0.75],[2950,0.3]].forEach(([cf,a])=>{ v += a*Math.exp(-Math.pow((f-cf)/120,2)); });
    // vertical striation from harmonics
    v *= 0.75 + 0.25*Math.abs(Math.sin(py*0.9));
    x.fillStyle = 'rgba(13,20,23,'+Math.min(0.95, v*0.9).toFixed(3)+')';
    x.fillRect(L+px, T+py, 1.2, 1.6);
  }
  x.strokeStyle = MTC.line2; x.strokeRect(L, T, GW, PH);
  [['F1', P.F1], ['F2', P.F2]].forEach(([lab, f])=>{
    const py = T + PH*(1 - f/FMAX);
    x.strokeStyle = MTC.a5; x.lineWidth = 2; x.setLineDash([6,3]);
    x.beginPath(); x.moveTo(L, py); x.lineTo(L+GW, py); x.stroke(); x.setLineDash([]);
    mtTxt(x, lab + ' = ' + f, L+GW+6, py, {size:9.5, col:MTC.a5, weight:'700'});
  });
  [0,1000,2000,3000].forEach(f=>{
    mtTxt(x, f===0?'0':(f/1000)+'k', L-5, T + PH*(1-f/FMAX), {size:8, col:MTC.muted, align:'right'});
  });
  mtTxt(x, 'time \u2192', L+GW/2, T+PH+18, {size:8.5, col:MTC.muted, align:'center'});
  // F1xF2 scatter
  const SX = L + GW + 96, SW = w-SX-20, SH = 150;
  mtTxt(x, 'F1 \u00d7 F2 SPACE', SX, 24, {size:9, col:MTC.muted});
  x.strokeStyle = MTC.line2; x.strokeRect(SX, T, SW, SH);
  // axes inverted so it looks like the vowel trapezoid
  const sx = f2 => SX + SW*(1 - (f2-700)/2100);
  const sy = f1 => T + SH*((f1-250)/700);
  PFM.forEach((v, i)=>{
    const px = sx(v.F2), py = sy(v.F1), on = i===_pfm;
    x.beginPath(); x.arc(px, py, on?6:3.5, 0, 7);
    x.fillStyle = on ? MTC.a2 : 'rgba(23,27,52,0.35)'; x.fill();
    mtTxt(x, '['+v.p+']', px, py - (on?14:10), {size: on?10:8.5, col: on?MTC.a2:MTC.muted, align:'center', weight: on?'700':''});
  });
  mtTxt(x, 'F2 high (front)', SX+4, T+SH+14, {size:7.5, col:MTC.muted});
  mtTxt(x, 'F2 low (back)', SX+SW-4, T+SH+14, {size:7.5, col:MTC.muted, align:'right'});
  x.save(); x.translate(SX-8, T+SH/2); x.rotate(-Math.PI/2);
  mtTxt(x, 'F1 \u2192 (lower = higher tongue)', 0, 0, {size:7.5, col:MTC.muted, align:'center'}); x.restore();
  mtSet('pfm-cap', '<b>[' + P.p + ']</b> as in <em>' + P.word + '</em>: F1 = ' + P.F1 + ' Hz, F2 = ' + P.F2 + ' Hz. ' + P.note + ' The scatter on the right plots all five, and with the axes reversed it reproduces the articulatory vowel trapezoid from earlier in the chapter, this time measured from the acoustics.');
}

/* ══ 14.4.6 SOURCE-FILTER ═════════════════════════════════ */
PH_PAGES.phsrc = `
<div class="lesson-chapter-label">Section 14.4.6</div>
<h1 class="lesson-h1">A Buzz Shaped by a Tube</h1>
<p class="lesson-intro">Two facts sit uneasily together. Formants determine which vowel is heard, and \\(F_0\\) determines how high the voice sounds, yet a speaker can sing the same vowel across an octave and can say every vowel on a single pitch. The explanation is that speech production has two approximately separable stages, and separating them is one of the most useful ideas in acoustic phonetics.</p>

<h2 class="lesson-h2">The Source</h2>
<p class="lesson-p">The vocal folds vibrating produce the <strong>source</strong>: a buzz that is periodic but far from a pure tone. Its spectrum is a stack of evenly spaced <strong>harmonics</strong> at integer multiples of the fundamental. If \\(F_0\\) is 115 Hz, there is energy at 115, 230, 345, 460 Hz and so on upward, with amplitude falling steadily as frequency rises. The source carries pitch, and nothing else that matters here: it sounds the same regardless of what the mouth is doing.</p>

<h2 class="lesson-h2">The Filter</h2>
<p class="lesson-p">The tract above the larynx is a tube of air, and any tube has <strong>resonances</strong>, frequencies at which it responds strongly. Change the shape of the tube by moving the tongue and jaw and the resonances move. This is the <strong>filter</strong>: it amplifies source harmonics that fall near a resonance and attenuates those that do not. The output spectrum is the source spectrum multiplied by the filter response, and the peaks that survive are the formants.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Source-Filter Bench</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">F0</span>
      <input id="psf-f" type="range" min="80" max="260" step="5" value="115" oninput="psfDraw()" style="width:140px;accent-color:var(--accent)">
      <span id="psf-fl" style="${MTLBL}"></span>
      <span style="${MTLBL}">vowel</span>
      <button style="${MTBTN}" id="psf-b0" onclick="psfGo(0)">[iy] tea</button>
      <button style="${MTBTN}" id="psf-b1" onclick="psfGo(1)">[ae] cat</button>
      <button style="${MTBTN}" id="psf-b2" onclick="psfGo(2)">[uw] moo</button>
    </div>
    <canvas id="psf-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="psf-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Independence</h2>
<p class="lesson-p">This is the payoff. Hold the vowel fixed and sweep \\(F_0\\): the harmonics slide along the frequency axis, packing closer together or spreading apart, while the formant peaks <em>stay exactly where they are</em>, because the tube has not changed shape. Conversely, hold \\(F_0\\) fixed and switch vowels: the harmonics do not move at all, but the envelope shifts and different harmonics are selected for amplification.</p>
<p class="lesson-p">Pitch and vowel identity are therefore carried by different physical mechanisms and can be varied independently, which is what lets a language use pitch for intonation without disturbing which words are being said. It also explains a practical problem in speech recognition: a system must learn to read the envelope while ignoring the harmonic spacing, and the cepstral processing in Section 14.6 exists largely to make that separation explicit.</p>

<div class="quiz-block" id="qph-s"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A speaker sings the vowel [ae] at a higher pitch. What happens to the formants?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-s','Correct. Formants are resonances of the tract shape, and raising pitch changes the source, not the shape, so the formant frequencies stay put while the harmonics move.')">They stay where they are, while the harmonics spread further apart</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-s','If formants rose with pitch, the vowel identity would change with pitch, and singers could not hold a vowel across a scale.')">They rise in proportion with the fundamental</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-s','Formants persist as long as the tract has a shape, which is always.')">They disappear at high pitch</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-s','F1 and F2 are set by tongue height and frontness respectively; pitch does not exchange them.')">F1 and F2 swap places</button>
</div><div class="quiz-explain" id="qph-s-explain"></div></div>`;

/* ── Source-Filter Bench ──────────────────────────────────── */
const PSF_V = [
  {p:'iy', word:'tea', F1:268, F2:2416, note:'The tongue is high and far forward, which produces a very low F1 and a very high F2, the widest separation in English.'},
  {p:'ae', word:'cat', F1:903, F2:1695, note:'The tongue is low and forward. F1 rises with the open jaw and F2 sits in the middle.'},
  {p:'uw', word:'moo', F1:295, F2:817,  note:'High and back with rounded lips. Both resonances are low and close together, the opposite configuration to [iy].'}
];
let _psf = 0;
function psfBuild(){ _psf = 0; psfDraw(); }
function psfGo(i){ _psf = i; psfDraw(); }
function psfDraw(){
  const F0 = +(document.getElementById('psf-f')||{value:115}).value;
  mtSet('psf-fl', F0 + ' Hz');
  [0,1,2].forEach(i=>{ const e = document.getElementById('psf-b'+i); if(e){
    e.style.background = i===_psf ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_psf ? '#FAFBFF' : 'var(--muted)'; } });
  const V = PSF_V[_psf];
  const c = mtCtx('psf-canvas', 330); if(!c) return;
  const {x, w} = c;
  const L = 46, PW = w-L-24, FMAX = 3400;
  const px = f => L + (f/FMAX)*PW;
  const filt = f => {
    let v = 0.06;
    [[V.F1, 1.0, 90], [V.F2, 0.72, 130], [2900, 0.3, 180]].forEach(([cf, a, bw])=>{
      v += a/(1 + Math.pow((f-cf)/bw, 2));
    });
    return Math.min(1.1, v);
  };
  const srcAmp = k => Math.pow(0.86, k-1)/1.0;
  const panel = (y, h2, lab)=>{
    mtTxt(x, lab, L-38, y-8, {size:9, col:MTC.muted});
    x.strokeStyle = MTC.line2; x.lineWidth = 1;
    x.beginPath(); x.moveTo(L, y+h2); x.lineTo(L+PW, y+h2); x.stroke();
  };
  // source
  panel(28, 66, 'SOURCE');
  for(let k=1; k*F0 < FMAX; k++){
    const f = k*F0, a = srcAmp(k);
    x.strokeStyle = 'rgba(79,70,229,0.75)'; x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(px(f), 94); x.lineTo(px(f), 94 - a*60); x.stroke();
  }
  mtTxt(x, 'harmonics every ' + F0 + ' Hz', L+4, 40, {size:8.5, col:MTC.a1});
  // filter
  panel(122, 66, 'FILTER');
  x.strokeStyle = MTC.a5; x.lineWidth = 2;
  x.beginPath();
  for(let p=0; p<PW; p++){
    const f = (p/PW)*FMAX, v = filt(f);
    p ? x.lineTo(L+p, 188 - v*58) : x.moveTo(L+p, 188 - v*58);
  }
  x.stroke();
  [['F1',V.F1],['F2',V.F2]].forEach(([lb, f])=>{
    x.strokeStyle = 'rgba(165,104,14,0.4)'; x.lineWidth = 1; x.setLineDash([3,3]);
    x.beginPath(); x.moveTo(px(f), 122); x.lineTo(px(f), 188); x.stroke(); x.setLineDash([]);
    mtTxt(x, lb, px(f), 134, {size:9, col:MTC.a5, align:'center', weight:'700'});
  });
  mtTxt(x, 'tract resonances \u00b7 set by tongue position', L+4, 134, {size:8.5, col:MTC.muted});
  // output
  panel(216, 76, 'OUTPUT');
  x.strokeStyle = 'rgba(165,104,14,0.35)'; x.lineWidth = 1.2;
  x.beginPath();
  for(let p=0; p<PW; p++){
    const f = (p/PW)*FMAX, v = filt(f);
    p ? x.lineTo(L+p, 292 - v*66) : x.moveTo(L+p, 292 - v*66);
  }
  x.stroke();
  for(let k=1; k*F0 < FMAX; k++){
    const f = k*F0, a = srcAmp(k)*filt(f);
    const tall = a > 0.42;
    x.strokeStyle = tall ? MTC.a2 : 'rgba(79,70,229,0.6)'; x.lineWidth = tall?2.6:1.6;
    x.beginPath(); x.moveTo(px(f), 292); x.lineTo(px(f), 292 - Math.min(1,a)*66); x.stroke();
  }
  [0,1000,2000,3000].forEach(f=>
    mtTxt(x, f===0?'0':(f/1000)+'k', px(f), 306, {size:8, col:MTC.muted, align:'center'}));
  mtTxt(x, 'Hz \u2192', L+PW, 320, {size:8, col:MTC.muted, align:'right'});
  mtTxt(x, 'source \u00d7 filter: peaks survive where a harmonic meets a resonance', L+4, 228, {size:8.5, col:MTC.a2});
  const nH = Math.floor(FMAX/F0);
  mtSet('psf-cap', '<b>[' + V.p + ']</b> at F0 = ' + F0 + ' Hz. ' + V.note + ' There are ' + nH + ' harmonics below 3.4 kHz, spaced ' + F0 + ' Hz apart. Drag F0 and watch the spikes slide while the orange envelope, and therefore the vowel, stays fixed; switch vowels and the reverse happens.');
}

/* ══ 14.5 THE PIPELINE ════════════════════════════════════ */
PH_PAGES.phpipe = `
<div class="lesson-chapter-label">Section 14.5</div>
<h1 class="lesson-h1">Turning Waveforms Into Feature Vectors</h1>
<p class="lesson-intro">Many speech recognizers use a sequence of acoustic feature vectors, often computed every ten milliseconds. Others learn directly from waveform input. This section follows a conventional feature-extraction pipeline, then opens each stage in more detail.</p>

<h2 class="lesson-h2">Why Not Feed In the Waveform</h2>
<p class="lesson-p">One second of 16 kHz audio is sixteen thousand numbers. Almost all of that detail is irrelevant to which word was said: the absolute phase of the waveform, the exact loudness, the harmonic spacing that reflects the speaker&rsquo;s pitch rather than their words. The pipeline exists to discard the irrelevant variation and keep the informative structure, ending with roughly forty numbers per frame instead of a hundred and sixty.</p>
<p class="lesson-p">Every stage has one job. Digitizing turns pressure into integers. Windowing chops the stream into short frames over which the signal is roughly stationary. The DFT converts each frame from a time description to a frequency description. The mel filterbank warps and pools frequencies the way the ear does. The logarithm compresses amplitude the way loudness perception does. Normalization removes channel and speaker offsets. Optionally a cepstral transform then decorrelates the result.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Pipeline Conveyor</span></div>
  <div class="viz-body">
    <canvas id="ppc-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="ppc-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Two design notes worth carrying forward. First, the pipeline is <em>lossy by intention</em>: every stage throws something away, and the art is in discarding exactly what does not distinguish words. Second, modern end-to-end systems often stop after the log mel stage and let the neural network learn the rest, since a network can discover its own decorrelation. The cepstral stage in Section 14.6 remains worth understanding because it explains what the earlier systems were doing and why the mel spectrum has the structure it does.</p>

<div class="quiz-block" id="qph-p"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What is the main purpose of the feature extraction pipeline?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-p','Correct. The pipeline is a sequence of deliberate reductions, each removing variation that does not help distinguish words.')">To discard variation that does not distinguish words while keeping what does</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-p','Nothing in the pipeline improves fidelity; every stage removes information.')">To improve the audio quality of the recording</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-p','Compression for storage is a different problem with different goals; features are not reconstructible back to audio.')">To compress the audio for efficient storage</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-p','Phone identification is the job of the model that consumes the features, not of the extraction itself.')">To identify which phone was spoken in each frame</button>
</div><div class="quiz-explain" id="qph-p-explain"></div></div>`;

/* ── Pipeline Conveyor ────────────────────────────────────── */
const PPC = [
  {lab:'waveform',     sub:'continuous pressure', open:null,
   note:'Air pressure varying over time, still analogue. Everything downstream is a reduction of this.'},
  {lab:'sample + quantize', sub:'16 kHz, 16 bit', open:'phdig',
   note:'Measure the pressure 16,000 times a second and round each measurement to one of 65,536 levels. Output: a long list of integers x[n].'},
  {lab:'window',       sub:'25 ms every 10 ms', open:'phframe',
   note:'Cut the stream into overlapping frames short enough that the vocal tract has barely moved within one, and taper the edges so the cut does not create artefacts.'},
  {lab:'DFT',          sub:'time \u2192 frequency', open:'phdft',
   note:'Convert each frame into a spectrum: how much energy sat at each frequency during that 25 ms.'},
  {lab:'mel filterbank', sub:'80 channels', open:'phmel',
   note:'Pool the spectrum into channels spaced the way the ear resolves pitch: narrow and dense low down, wide and sparse high up.'},
  {lab:'log',          sub:'compress amplitude', open:'phmel',
   note:'Take the logarithm of each channel, matching the roughly logarithmic relation between physical intensity and perceived loudness, and making the features robust to recording level.'},
  {lab:'normalize',    sub:'zero mean, unit range', open:'phmel',
   note:'Subtract the per-channel mean over the utterance, which removes constant offsets introduced by the microphone and room.'},
  {lab:'feature vector', sub:'\u2248 40 numbers/frame', open:'phcep',
   note:'The output: one vector per 10 ms, ready for a recognizer. Optionally a cepstral transform is applied first to decorrelate the dimensions, yielding classic 39-dimensional MFCCs.'}
];
let _ppc = -1;
function ppcBuild(){
  const cv = document.getElementById('ppc-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('mousemove', e=>{
      const r = cv.getBoundingClientRect();
      const h = ppcHit(e.clientX-r.left, e.clientY-r.top, r.width);
      if(h!==_ppc){ _ppc = h; ppcDraw(); }
    });
    cv.addEventListener('click', e=>{
      const r = cv.getBoundingClientRect();
      const h = ppcHit(e.clientX-r.left, e.clientY-r.top, r.width);
      if(h>=0 && PPC[h].open) openPHSec(PPC[h].open);
    });
    cv.addEventListener('mouseleave', ()=>{ _ppc = -1; ppcDraw(); });
  }
  _ppc = -1; ppcDraw();
}
function ppcHit(mx, my, w){
  const n = PPC.length, cols = 4;
  const bw = (w-40)/cols;
  let hit = -1;
  for(let i=0;i<n;i++){
    const cx = 20 + (i%cols)*bw, cy = 30 + Math.floor(i/cols)*104;
    if(mx>cx && mx<cx+bw-14 && my>cy && my<cy+66) hit = i;
  }
  return hit;
}
function ppcDraw(){
  const c = mtCtx('ppc-canvas', 250); if(!c) return;
  const {x, w} = c;
  const cols = 4, bw = (w-40)/cols;
  PPC.forEach((s, i)=>{
    const cx = 20 + (i%cols)*bw, cy = 30 + Math.floor(i/cols)*104;
    const on = i===_ppc;
    const last = i===PPC.length-1;
    mtChip(x, cx, cy, bw-14, 66,
      on ? 'rgba(79,70,229,0.16)' : (last?'rgba(11,132,87,0.10)':'rgba(23,27,52,0.04)'),
      on ? MTC.a1 : (last?MTC.a4:MTC.line2), null);
    mtTxt(x, s.lab, cx+(bw-14)/2, cy+24, {size:10, col:MTC.text, align:'center', weight: on?'700':''});
    mtTxt(x, s.sub, cx+(bw-14)/2, cy+42, {size:8, col: on?MTC.a1:MTC.muted, align:'center'});
    // mini preview of the representation
    const py = cy+56;
    x.save();
    if(i===0 || i===1){
      x.strokeStyle = on?MTC.a1:'rgba(23,27,52,0.3)'; x.lineWidth = 1;
      x.beginPath();
      for(let p=0;p<bw-30;p++){
        const v = 6*Math.sin(p*0.5)*Math.sin(p*0.07);
        const vv = i===1 ? Math.round(v/2)*2 : v;
        p? x.lineTo(cx+8+p, py+vv) : x.moveTo(cx+8+p, py+vv);
      }
      x.stroke();
    } else if(i===2){
      x.fillStyle = on?'rgba(79,70,229,0.3)':'rgba(23,27,52,0.12)';
      x.fillRect(cx+8, py-7, (bw-30)*0.42, 14);
      x.fillStyle = on?'rgba(165,104,14,0.35)':'rgba(23,27,52,0.08)';
      x.fillRect(cx+8+(bw-30)*0.3, py-7, (bw-30)*0.42, 14);
    } else if(i===3 || i===4){
      for(let k=0;k<10;k++){
        const hh = (i===3? Math.abs(Math.sin(k*1.4))*12 : Math.abs(Math.sin(k*0.8))*12);
        x.fillStyle = on?MTC.a1:'rgba(23,27,52,0.25)';
        x.fillRect(cx+10+k*((bw-34)/10), py+6-hh, (bw-34)/10-2, hh);
      }
    } else {
      for(let k=0;k<10;k++){
        const hh = 4 + Math.abs(Math.sin(k*1.1+i))*8;
        x.fillStyle = on?(last?MTC.a4:MTC.a1):'rgba(23,27,52,0.25)';
        x.fillRect(cx+10+k*((bw-34)/10), py+6-hh, (bw-34)/10-2, hh);
      }
    }
    x.restore();
    // arrow to next
    if(i < PPC.length-1){
      const sameRow = Math.floor((i+1)/cols) === Math.floor(i/cols);
      x.strokeStyle = MTC.line2; x.lineWidth = 1.4;
      if(sameRow){
        x.beginPath(); x.moveTo(cx+bw-13, cy+33); x.lineTo(cx+bw-3, cy+33); x.stroke();
        x.beginPath(); x.moveTo(cx+bw-3, cy+33); x.lineTo(cx+bw-9, cy+29); x.lineTo(cx+bw-9, cy+37); x.closePath();
        x.fillStyle = MTC.line2; x.fill();
      } else {
        x.beginPath(); x.moveTo(cx+(bw-14)/2, cy+68); x.lineTo(cx+(bw-14)/2, cy+90);
        x.lineTo(24+(bw-14)/2, cy+90); x.lineTo(24+(bw-14)/2, cy+102); x.stroke();
      }
    }
  });
  mtSet('ppc-cap', _ppc>=0
    ? '<b style="color:var(--accent)">' + PPC[_ppc].lab + '.</b> ' + PPC[_ppc].note +
      (PPC[_ppc].open ? ' <em>Click to open that section.</em>' : '')
    : 'Eight stages from pressure wave to feature vector, with a sketch of the representation at each. Hover for what a stage does; click to open its section.');
}

/* ══ 14.5.2 WINDOWING ═════════════════════════════════════ */
PH_PAGES.phframe = `
<div class="lesson-chapter-label">Section 14.5.2</div>
<h1 class="lesson-h1">Slicing Speech Into Short Frames</h1>
<p class="lesson-intro">A Fourier transform can analyze a changing signal, but a single spectrum does not show when its frequencies occur. Short-time analysis applies it to small, overlapping windows so we can track changes in speech. Window length controls the trade-off between time and frequency resolution.</p>

<h2 class="lesson-h2">Twenty-Five Milliseconds, Every Ten</h2>
<p class="lesson-p">The standard frame is 25 ms long, taken every 10 ms. The length is a compromise. Too short and there is not enough signal to resolve low frequencies: a 10 ms window cannot see a 100 Hz period cleanly because it barely contains one. Too long and the vocal tract has visibly moved during the frame, smearing two configurations into one spectrum. Twenty-five milliseconds contains several glottal periods at typical pitches while being brief enough that articulation is roughly frozen.</p>
<p class="lesson-p">The <strong>stride</strong> of 10 ms is shorter than the frame, so consecutive frames overlap by 15 ms. This is deliberate. Without overlap, an event falling at a frame boundary would be split across two analyses and represented well in neither; with overlap, every instant sits comfortably inside some frame. It also yields a smooth output rate of 100 frames per second regardless of the frame length.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Sliding Frame</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">position</span>
      <input id="psl-p" type="range" min="0" max="1" step="0.01" value="0.25" oninput="pslDraw()" style="width:130px;accent-color:var(--accent)">
      <span style="${MTLBL}">frame ms</span>
      <input id="psl-w" type="range" min="10" max="50" step="5" value="25" oninput="pslDraw()" style="width:110px;accent-color:var(--accent)">
      <span style="${MTLBL}">stride ms</span>
      <input id="psl-s" type="range" min="5" max="25" step="5" value="10" oninput="pslDraw()" style="width:110px;accent-color:var(--accent)">
      <span id="psl-l" style="${MTLBL}"></span>
    </div>
    <canvas id="psl-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="psl-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Why the Window Is Not Square</h2>
<p class="lesson-p">Extracting a frame means multiplying the signal by a <strong>window function</strong> that is nonzero over the frame and zero elsewhere:</p>
<div class="lesson-math">\\[y[n] = w[n]\\, s[n]\\]</div>
<p class="lesson-p">The obvious choice is a rectangle, which keeps the signal untouched inside the frame and discards everything outside:</p>
<div class="lesson-math">\\[w[n] = \\begin{cases} 1 &amp; 0 \\le n \\le L-1 \\\\ 0 &amp; \\text{otherwise} \\end{cases}\\]</div>
<p class="lesson-p">The problem is at the edges. A rectangular cut almost always slices through the middle of a cycle, leaving an abrupt step at each end of the frame. A sharp step is a broadband event: the Fourier transform reports energy across many frequencies to account for it, and those spurious components, called spectral leakage, are entirely an artefact of where the cut fell.</p>
<p class="lesson-p">The <strong>Hamming window</strong> avoids this by tapering smoothly to near zero at both ends:</p>
<div class="lesson-math">\\[w[n] = \\begin{cases} 0.54 - 0.46 \\cos\\left(\\dfrac{2\\pi n}{L}\\right) &amp; 0 \\le n \\le L-1 \\\\ 0 &amp; \\text{otherwise} \\end{cases}\\]</div>
<p class="lesson-p">The signal is faded in and faded out, so there is no discontinuity for the transform to misreport. The cost is that samples near the edges contribute less than those in the middle, which is precisely why frames overlap: what one frame de-emphasizes at its edge sits at the centre of its neighbour.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Rectangular Against Hamming</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" id="pwn-b0" onclick="pwnGo(0)">rectangular</button>
      <button style="${MTBTN}" id="pwn-b1" onclick="pwnGo(1)">Hamming</button>
    </div>
    <canvas id="pwn-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pwn-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qph-fr"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is a tapered window preferred over a rectangular one?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-fr','Correct. A rectangular cut leaves abrupt steps at the frame edges, and the transform reports those artificial discontinuities as broadband energy that was never in the signal.')">A rectangular cut creates edge discontinuities that appear as spurious frequencies</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-fr','Both windows have the same length and cost essentially the same to apply.')">A tapered window is faster to compute</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-fr','Tapering reduces the contribution of edge samples rather than capturing more signal.')">A tapered window captures more of the signal</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-fr','Overlap is determined by the stride, not by the window shape.')">A tapered window removes the need for overlapping frames</button>
</div><div class="quiz-explain" id="qph-fr-explain"></div></div>`;

/* ── Sliding Frame ────────────────────────────────────────── */
function pslDraw(){
  const pos = +(document.getElementById('psl-p')||{value:0.25}).value;
  const fms = +(document.getElementById('psl-w')||{value:25}).value;
  const sms = +(document.getElementById('psl-s')||{value:10}).value;
  mtSet('psl-l', (1000/sms).toFixed(0) + ' frames/sec');
  const c = mtCtx('psl-canvas', 250); if(!c) return;
  const {x, w} = c;
  const L = 20, PW = w-40, totalMs = 200;
  const sig = t => 0.6*Math.sin(2*Math.PI*160*t)*(0.6+0.4*Math.sin(2*Math.PI*7*t))
                 + 0.25*Math.sin(2*Math.PI*640*t);
  const wy = 76;
  // frames as shaded bands
  const nF = Math.floor((totalMs - fms)/sms) + 1;
  for(let i=0;i<nF;i++){
    const t0 = i*sms, t1 = t0+fms;
    const x1 = L + (t0/totalMs)*PW, x2 = L + (t1/totalMs)*PW;
    x.fillStyle = (i%2) ? 'rgba(79,70,229,0.05)' : 'rgba(165,104,14,0.05)';
    x.fillRect(x1, 30, x2-x1, 96);
  }
  // waveform
  x.strokeStyle = 'rgba(23,27,52,0.5)'; x.lineWidth = 1;
  x.beginPath();
  for(let p=0;p<PW;p++){
    const t = (p/PW)*totalMs/1000;
    p? x.lineTo(L+p, wy - sig(t)*38) : x.moveTo(L+p, wy - sig(t)*38);
  }
  x.stroke();
  // the selected frame
  const startMs = pos*(totalMs-fms);
  const fx1 = L + (startMs/totalMs)*PW, fx2 = L + ((startMs+fms)/totalMs)*PW;
  x.fillStyle = 'rgba(159,18,57,0.13)'; x.fillRect(fx1, 30, fx2-fx1, 96);
  x.strokeStyle = MTC.a2; x.lineWidth = 1.8; x.strokeRect(fx1, 30, fx2-fx1, 96);
  // overlap with neighbour
  const nx1 = L + ((startMs+sms)/totalMs)*PW, nx2 = L + ((startMs+sms+fms)/totalMs)*PW;
  if(nx1 < L+PW){
    x.fillStyle = 'rgba(11,132,87,0.12)';
    x.fillRect(nx1, 30, Math.min(fx2,nx2)-nx1, 96);
    x.strokeStyle = 'rgba(11,132,87,0.7)'; x.lineWidth = 1; x.setLineDash([4,3]);
    x.strokeRect(nx1, 30, nx2-nx1, 96); x.setLineDash([]);
    mtTxt(x, 'overlap ' + (fms-sms) + ' ms', (nx1+Math.min(fx2,nx2))/2, 140, {size:8.5, col:MTC.a4, align:'center'});
  }
  mtTxt(x, 'frame ' + fms + ' ms', (fx1+fx2)/2, 22, {size:9, col:MTC.a2, align:'center'});
  // time axis
  x.strokeStyle = MTC.line2; x.beginPath(); x.moveTo(L, 126); x.lineTo(L+PW, 126); x.stroke();
  for(let t=0;t<=totalMs;t+=25){
    const px = L + (t/totalMs)*PW;
    x.beginPath(); x.moveTo(px, 126); x.lineTo(px, 131); x.stroke();
    mtTxt(x, t+'', px, 142, {size:7.5, col:MTC.muted, align:'center'});
  }
  mtTxt(x, 'milliseconds', L+PW, 156, {size:8, col:MTC.muted, align:'right'});
  // magnified frame
  mtTxt(x, 'EXTRACTED FRAME', L, 178, {size:9, col:MTC.muted});
  const my = 216, MW = PW;
  x.strokeStyle = MTC.a2; x.lineWidth = 1.3;
  x.beginPath();
  for(let p=0;p<MW;p++){
    const t = (startMs + (p/MW)*fms)/1000;
    p? x.lineTo(L+p, my - sig(t)*30) : x.moveTo(L+p, my - sig(t)*30);
  }
  x.stroke();
  const nCyc = (fms/1000)*160;
  mtSet('psl-cap', `A ${fms} ms frame taken every ${sms} ms gives ${(1000/sms).toFixed(0)} frames per second and ${fms-sms} ms of overlap between neighbours. This frame contains about ${nCyc.toFixed(1)} cycles of the ${160} Hz fundamental. ` + (fms < 15 ? '<b style="color:var(--accent2)">At this length the frame barely spans one low-frequency period, so the transform cannot resolve the fundamental.</b>' : fms > 40 ? '<b style="color:var(--accent2)">At this length the articulators move noticeably within a single frame, so two configurations get smeared into one spectrum.</b>' : 'That is enough periods to measure the low frequencies while the articulators stay nearly fixed.'));
}

/* ── Window comparator ────────────────────────────────────── */
let _pwn = 0;
function pwnBuild(){ _pwn = 0; pwnDraw(); }
function pwnGo(i){ _pwn = i; pwnDraw(); }
function pwnDraw(){
  [0,1].forEach(i=>{ const e = document.getElementById('pwn-b'+i); if(e){
    e.style.background = i===_pwn ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pwn ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('pwn-canvas', 272); if(!c) return;
  const {x, w} = c;
  const L = 24, PW = (w-70)*0.60, SX = L+PW+42, SW = w-SX-18;
  const N = 220;
  const win = n => _pwn===0 ? 1 : 0.54 - 0.46*Math.cos(2*Math.PI*n/N);
  const sig = n => Math.sin(2*Math.PI*8.35*n/N);   // non-integer cycles: edges won't match
  // window shape
  mtTxt(x, 'WINDOW w[n]', L, 22, {size:9, col:MTC.muted});
  x.strokeStyle = MTC.a5; x.lineWidth = 1.8;
  x.beginPath();
  for(let p=0;p<=PW;p++){
    const n = (p/PW)*N, v = win(n);
    p? x.lineTo(L+p, 62 - v*32) : x.moveTo(L+p, 62 - v*32);
  }
  x.stroke();
  x.strokeStyle = MTC.line; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L, 62); x.lineTo(L+PW, 62); x.stroke();
  // windowed signal
  mtTxt(x, 'y[n] = w[n] s[n]', L, 108, {size:9, col:MTC.muted});
  x.strokeStyle = MTC.a1; x.lineWidth = 1.3;
  x.beginPath();
  for(let p=0;p<=PW;p++){
    const n = (p/PW)*N, v = sig(n)*win(n);
    p? x.lineTo(L+p, 152 - v*34) : x.moveTo(L+p, 152 - v*34);
  }
  x.stroke();
  x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, 152); x.lineTo(L+PW, 152); x.stroke();
  // edge markers
  if(_pwn===0){
    [[L, sig(0)],[L+PW, sig(N)]].forEach(([px, v])=>{
      x.beginPath(); x.arc(px, 152 - v*34, 4.5, 0, 7); x.fillStyle = MTC.a2; x.fill();
    });
    mtTxt(x, 'abrupt step at each edge', L, 200, {size:9, col:MTC.a2});
    x.strokeStyle = MTC.a2; x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(L, 152 - sig(0)*34); x.lineTo(L, 152); x.stroke();
    x.beginPath(); x.moveTo(L+PW, 152 - sig(N)*34); x.lineTo(L+PW, 152); x.stroke();
  } else {
    mtTxt(x, 'faded to zero at both edges', L, 200, {size:9, col:MTC.a4});
  }
  // resulting spectrum
  mtTxt(x, 'SPECTRUM', SX, 22, {size:9, col:MTC.muted});
  x.strokeStyle = MTC.line2; x.beginPath(); x.moveTo(SX, 212); x.lineTo(SX+SW, 212); x.stroke();
  const peakBin = 0.34;
  x.strokeStyle = _pwn===0 ? MTC.a2 : MTC.a4; x.lineWidth = 1.4;
  x.beginPath();
  for(let p=0;p<SW;p++){
    const f = p/SW;
    const d = Math.abs(f - peakBin);
    let v;
    if(_pwn===0){
      v = Math.exp(-Math.pow(d*44, 2)) + 0.16*Math.abs(Math.sin(d*95))/(1+d*24);
    } else {
      v = Math.exp(-Math.pow(d*33, 2)) + 0.012*Math.abs(Math.sin(d*70))/(1+d*90);
    }
    const y = 212 - Math.min(1, v)*150;
    p? x.lineTo(SX+p, y) : x.moveTo(SX+p, y);
  }
  x.stroke();
  mtTxt(x, 'frequency \u2192', SX+SW, 232, {size:8, col:MTC.muted, align:'right'});
  if(_pwn===0) mtTxt(x, 'leakage skirts', SX+SW*0.62, 150, {size:8.5, col:MTC.a2});
  mtTxt(x, 'true content: one pure tone', SX, 250, {size:8.5, col:MTC.muted});
  mtSet('pwn-cap', _pwn===0
    ? 'The input is a single pure tone, so the correct spectrum is one spike. The rectangular cut does not land on a whole number of cycles, so the frame begins and ends mid-cycle, and those two steps are broadband events. The transform accounts for them by reporting energy at frequencies that were never present, the ripples spreading either side of the peak.'
    : 'The Hamming window fades the same signal in and out, so there is no step at either edge and nothing artificial for the transform to explain. The peak is slightly broader, which is the price, and the spurious skirts are gone. Samples near the edges are attenuated, which is exactly why consecutive frames overlap.');
}

/* ══ 14.5.3 THE DFT ═══════════════════════════════════════ */
PH_PAGES.phdft = `
<div class="lesson-chapter-label">Section 14.5.3</div>
<h1 class="lesson-h1">Measuring Energy in Each Frequency Band</h1>
<p class="lesson-intro">With a windowed frame in hand, the next step converts it from a description in time to a description in frequency. The tool is the <strong>discrete Fourier transform</strong>, and although the formula looks forbidding, what it does is simple enough to state in a sentence: it measures how strongly the signal correlates with each of a set of test frequencies.</p>

<h2 class="lesson-h2">The Formula, and What Each Piece Does</h2>
<p class="lesson-p">For a frame of \\(N\\) samples, the DFT produces \\(N\\) values \\(X[k]\\), one per frequency band:</p>
<div class="lesson-math">\\[X[k] = \\sum_{n=0}^{N-1} x[n]\\, e^{-j\\frac{2\\pi}{N}kn}\\]</div>
<p class="lesson-p">Read it from the inside out. The exponential is a rotating unit vector, by Euler&rsquo;s formula:</p>
<div class="lesson-math">\\[e^{j\\theta} = \\cos\\theta + j \\sin\\theta\\]</div>
<p class="lesson-p">so \\(e^{-j 2\\pi k n / N}\\) is a point on the unit circle that goes around \\(k\\) times as \\(n\\) runs across the frame. Multiplying each sample by that rotating point and summing asks: does the signal rise and fall in step with a wave of \\(k\\) cycles per frame? If yes, the products reinforce and the sum is large. If the signal has no component at that rate, the products point in all directions and cancel to nearly zero. The DFT is \\(N\\) such correlation tests, one for each \\(k\\).</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Euler Circle</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">angle \u03B8</span>
      <input id="peu-t" type="range" min="0" max="6.28" step="0.02" value="0.9" oninput="peuDraw()" style="width:190px;accent-color:var(--accent)">
      <span id="peu-l" style="${MTLBL}"></span>
    </div>
    <canvas id="peu-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="peu-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Magnitude and Phase</h2>
<p class="lesson-p">Each \\(X[k]\\) is a complex number, which carries two pieces of information: a <strong>magnitude</strong>, how much of that frequency is present, and a <strong>phase</strong>, where in its cycle that component started. Speech features use the magnitude and discard the phase, for a practical reason: shifting the frame by a fraction of a period changes every phase completely while changing nothing about which sounds were made. Phase is largely an accident of where the window fell.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The DFT Box</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" id="pdf-b" onclick="pdfPhase()">show: magnitude only</button>
      <span style="${MTLBL}">frame shift</span>
      <input id="pdf-s" type="range" min="0" max="1" step="0.05" value="0" oninput="pdfDraw()" style="width:130px;accent-color:var(--accent)">
    </div>
    <canvas id="pdf-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pdf-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Why the FFT Matters</h2>
<p class="lesson-p">Computed directly, the DFT needs \\(N\\) multiply-and-add operations for each of \\(N\\) outputs, so the cost grows as \\(N^2\\). The <strong>fast Fourier transform</strong> is an algorithm that computes exactly the same result in \\(N \\log_2 N\\) operations by recursively reusing shared subcomputations. It is not an approximation; the output is identical. The one constraint is that \\(N\\) should be a power of two, which is why frames are commonly zero-padded up to 256, 512 or 1024 samples.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Naive DFT Against FFT</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">frame size N</span>
      <input id="pff-n" type="range" min="6" max="12" step="1" value="9" oninput="pffDraw()" style="width:170px;accent-color:var(--accent)">
      <span id="pff-l" style="${MTLBL}"></span>
    </div>
    <canvas id="pff-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pff-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qph-d"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why do speech features keep the magnitude of X[k] and discard the phase?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-d','Correct. Phase depends on exactly where the window happened to fall, so it varies wildly between frames of identical speech.')">Phase depends on where the window fell, not on which sound was made</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-d','Phase is produced by the same transform at no extra cost; expense is not the reason.')">Phase is expensive to compute</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-d','Phase is well defined for every bin; it is just not informative about phone identity.')">Phase is undefined for most frequency bins</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-d','Magnitude and phase are independent; one cannot be recovered from the other.')">Phase can be reconstructed exactly from the magnitude</button>
</div><div class="quiz-explain" id="qph-d-explain"></div></div>`;

/* ── Euler Circle ─────────────────────────────────────────── */
function peuDraw(){
  const th = +(document.getElementById('peu-t')||{value:0.9}).value;
  mtSet('peu-l', '\u03B8 = ' + th.toFixed(2) + ' rad');
  const c = mtCtx('peu-canvas', 230); if(!c) return;
  const {x, w} = c;
  const R = 78, cx = 110, cy = 112;
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
  x.beginPath(); x.moveTo(cx-R-12, cy); x.lineTo(cx+R+12, cy); x.stroke();
  x.beginPath(); x.moveTo(cx, cy-R-12); x.lineTo(cx, cy+R+12); x.stroke();
  const ptx = cx + R*Math.cos(th), pty = cy - R*Math.sin(th);
  x.strokeStyle = MTC.a2; x.lineWidth = 2;
  x.beginPath(); x.moveTo(cx, cy); x.lineTo(ptx, pty); x.stroke();
  x.beginPath(); x.arc(ptx, pty, 5, 0, 7); x.fillStyle = MTC.a2; x.fill();
  // projections
  x.strokeStyle = MTC.a1; x.lineWidth = 1.4; x.setLineDash([3,3]);
  x.beginPath(); x.moveTo(ptx, pty); x.lineTo(ptx, cy); x.stroke();
  x.strokeStyle = MTC.a5;
  x.beginPath(); x.moveTo(ptx, pty); x.lineTo(cx, pty); x.stroke();
  x.setLineDash([]);
  x.strokeStyle = MTC.a1; x.lineWidth = 3;
  x.beginPath(); x.moveTo(cx, cy); x.lineTo(ptx, cy); x.stroke();
  x.strokeStyle = MTC.a5; x.lineWidth = 3;
  x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx, pty); x.stroke();
  mtTxt(x, 'cos \u03B8', (cx+ptx)/2, cy+16, {size:9, col:MTC.a1, align:'center'});
  mtTxt(x, 'sin \u03B8', cx-16, (cy+pty)/2, {size:9, col:MTC.a5, align:'right'});
  mtTxt(x, 'real', cx+R+16, cy+4, {size:8.5, col:MTC.muted});
  mtTxt(x, 'imaginary', cx+4, cy-R-18, {size:8.5, col:MTC.muted});
  // traces
  const TX = 250, TW = w-TX-24;
  ['cos','sin'].forEach((fn, i)=>{
    const y = 74 + i*80;
    const col = i===0 ? MTC.a1 : MTC.a5;
    x.strokeStyle = MTC.line; x.lineWidth = 1;
    x.beginPath(); x.moveTo(TX, y); x.lineTo(TX+TW, y); x.stroke();
    x.strokeStyle = col; x.lineWidth = 1.5;
    x.beginPath();
    for(let p=0;p<=TW;p++){
      const a = (p/TW)*2*Math.PI;
      const v = i===0 ? Math.cos(a) : Math.sin(a);
      p? x.lineTo(TX+p, y - v*28) : x.moveTo(TX+p, y - v*28);
    }
    x.stroke();
    const mx = TX + (th/(2*Math.PI))*TW;
    const mv = i===0 ? Math.cos(th) : Math.sin(th);
    x.beginPath(); x.arc(mx, y - mv*28, 4, 0, 7); x.fillStyle = col; x.fill();
    mtTxt(x, fn + ' \u03B8 = ' + mv.toFixed(3), TX, y-42, {size:9.5, col:col});
  });
  mtSet('peu-cap', 'A point travelling around the unit circle projects to a cosine on the real axis and a sine on the imaginary axis at the same time, which is the content of e<sup>j\u03B8</sup> = cos \u03B8 + j sin \u03B8. In the DFT, k controls how many times this point circles the origin while the frame is traversed, so each k tests the signal against a different rate of rotation.');
}

/* ── DFT Box ──────────────────────────────────────────────── */
let _pdf = false;
function pdfBuild(){ _pdf = false; pdfDraw(); }
function pdfPhase(){ _pdf = !_pdf; pdfDraw(); }
function pdfDraw(){
  const shift = +(document.getElementById('pdf-s')||{value:0}).value;
  const b = document.getElementById('pdf-b');
  if(b){ b.textContent = 'show: ' + (_pdf ? 'magnitude and phase' : 'magnitude only');
         b.style.background = _pdf?'var(--accent)':'var(--surface2)'; b.style.color = _pdf?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('pdf-canvas', _pdf ? 268 : 218); if(!c) return;
  const {x, w} = c;
  const L = 24, PW = (w-64)*0.42, SX = L+PW+40, SW = w-SX-20;
  const comps = [[3,0.9],[6,0.45],[9,0.3],[14,0.18]];
  const sig = n => comps.reduce((a,[k,amp])=> a + amp*Math.sin(2*Math.PI*k*(n+shift*0.25)), 0)/1.6;
  mtTxt(x, 'WINDOWED FRAME \u00b7 [iy], 25 ms', L, 22, {size:9, col:MTC.muted});
  x.strokeStyle = MTC.a1; x.lineWidth = 1.2;
  x.beginPath();
  for(let p=0;p<=PW;p++){
    const n = p/PW;
    const wnd = 0.54 - 0.46*Math.cos(2*Math.PI*n);
    p? x.lineTo(L+p, 92 - sig(n)*wnd*44) : x.moveTo(L+p, 92 - sig(n)*wnd*44);
  }
  x.stroke();
  x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, 92); x.lineTo(L+PW, 92); x.stroke();
  mtTxt(x, 'x[n]', L, 152, {size:9.5, col:MTC.a1});
  // arrow
  x.strokeStyle = MTC.line2; x.lineWidth = 1.6;
  x.beginPath(); x.moveTo(L+PW+8, 92); x.lineTo(SX-10, 92); x.stroke();
  x.beginPath(); x.moveTo(SX-10, 92); x.lineTo(SX-18, 88); x.lineTo(SX-18, 96); x.closePath();
  x.fillStyle = MTC.line2; x.fill();
  mtTxt(x, 'DFT', (L+PW+SX)/2, 78, {size:9, col:MTC.muted, align:'center'});
  // magnitude spectrum
  mtTxt(x, '|X[k]|  MAGNITUDE', SX, 22, {size:9, col:MTC.muted});
  x.strokeStyle = MTC.line2; x.beginPath(); x.moveTo(SX, 140); x.lineTo(SX+SW, 140); x.stroke();
  const NB = 20;
  for(let k=1;k<=NB;k++){
    const comp = comps.find(cc=>cc[0]===k);
    const a = comp ? comp[1] : 0.02 + 0.02*Math.abs(Math.sin(k*2.3));
    const px = SX + (k/NB)*SW*0.92;
    x.strokeStyle = comp ? MTC.a1 : 'rgba(23,27,52,0.2)'; x.lineWidth = comp?4:2;
    x.beginPath(); x.moveTo(px, 140); x.lineTo(px, 140 - a*100); x.stroke();
  }
  mtTxt(x, 'k \u2192', SX+SW, 158, {size:8, col:MTC.muted, align:'right'});
  mtTxt(x, 'unchanged by the shift', SX, 176, {size:9, col:MTC.a4});
  if(_pdf){
    mtTxt(x, '\u2220X[k]  PHASE', SX, 202, {size:9, col:MTC.muted});
    x.strokeStyle = MTC.line2; x.beginPath(); x.moveTo(SX, 236); x.lineTo(SX+SW, 236); x.stroke();
    for(let k=1;k<=NB;k++){
      const comp = comps.find(cc=>cc[0]===k);
      const ph = ((k*shift*1.9 + k*0.7) % (2*Math.PI)) - Math.PI;
      const px = SX + (k/NB)*SW*0.92;
      x.strokeStyle = comp ? MTC.a2 : 'rgba(23,27,52,0.2)'; x.lineWidth = comp?4:2;
      x.beginPath(); x.moveTo(px, 236); x.lineTo(px, 236 - (ph/Math.PI)*26); x.stroke();
    }
    mtTxt(x, 'scrambled by the shift', SX, 262, {size:9, col:MTC.a2});
    mtTxt(x, 'x[n]  shifted by ' + (shift*0.25).toFixed(2) + ' period', L, 176, {size:9, col:MTC.a2});
  }
  mtSet('pdf-cap', _pdf
    ? 'Drag the frame shift. The magnitude spectrum barely moves, because the same frequencies are present whatever the alignment. The phase values jump around freely, because they record where in its cycle each component happened to be when the window opened. The speech content is in the first plot; the second is mostly bookkeeping about the cut.'
    : 'Each bar is one |X[k]|, the strength of the correlation between this frame and a wave completing k cycles across it. Four bands stand out, corresponding to the harmonics present in the vowel. Turn on the phase display and drag the shift to see why phase is discarded.');
}

/* ── FFT cost ─────────────────────────────────────────────── */
function pffDraw(){
  const p2 = Math.round(+(document.getElementById('pff-n')||{value:9}).value);
  const N = Math.pow(2, p2);
  mtSet('pff-l', 'N = ' + N);
  const c = mtCtx('pff-canvas', 200); if(!c) return;
  const {x, w} = c;
  const naive = N*N, fft = N*Math.log2(N);
  const L = 116, PW = w-L-120;
  const maxV = Math.pow(2,12)*Math.pow(2,12);
  const scale = v => Math.log10(v)/Math.log10(maxV);
  [['naive DFT', naive, MTC.a2, 'N\u00b2'], ['FFT', fft, MTC.a4, 'N log\u2082 N']].forEach(([lab, v, col, form], i)=>{
    const y = 46 + i*54;
    mtTxt(x, lab, L-8, y+13, {size:10, col:MTC.text, align:'right'});
    mtTxt(x, form, L-8, y+27, {size:8, col:MTC.muted, align:'right'});
    mtRR(x, L, y, PW, 24, 6); x.fillStyle='rgba(23,27,52,0.05)'; x.fill();
    mtRR(x, L, y, Math.max(4, PW*scale(v)), 24, 6); x.fillStyle = col+'CC'; x.fill();
    mtTxt(x, v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(1)+'k' : v.toFixed(0),
          L+PW+10, y+13, {size:10.5, col:col, weight:'700'});
  });
  mtTxt(x, 'operations per frame (log scale)', L, 30, {size:9, col:MTC.muted});
  const ratio = naive/fft;
  mtTxt(x, ratio.toFixed(0) + '\u00d7 fewer operations', L, 172, {size:13, col:MTC.a4, weight:'700'});
  mtTxt(x, 'at 100 frames per second, that is ' + ((naive-fft)*100/1e6).toFixed(1) + 'M operations saved every second of audio',
        L, 192, {size:9, col:MTC.muted});
  mtSet('pff-cap', 'At N = ' + N + ' the naive transform needs ' + (naive/1e3).toFixed(0) + 'k operations and the FFT needs ' + (fft/1e3).toFixed(1) + 'k, a factor of ' + ratio.toFixed(0) + '. Both compute the identical answer. The saving comes from noticing that the naive sum recomputes the same partial products many times, and arranging the calculation so each is computed once.');
}

/* ══ 14.5.4 MEL FILTERBANK ════════════════════════════════ */
PH_PAGES.phmel = `
<div class="lesson-chapter-label">Section 14.5.4</div>
<h1 class="lesson-h1">Weighting Frequencies the Way Ears Do</h1>
<p class="lesson-intro">The DFT gives every frequency band equal treatment. Human hearing does not. We resolve differences at low frequencies far more finely than at high ones, and a feature representation that mirrors that bias works better than one that does not, because it spends its resolution where the distinguishing information actually lies.</p>

<h2 class="lesson-h2">The Mel Scale</h2>
<p class="lesson-p">The <strong>mel scale</strong> is a mapping from physical frequency to perceived pitch, calibrated so that equal steps in mels sound like equal steps in pitch:</p>
<div class="lesson-math">\\[\\text{mel}(f) = 1127 \\ln\\left(1 + \\frac{f}{700}\\right)\\]</div>
<p class="lesson-p">The constants are calibrated so that the two scales cross at 1000 Hz, which is also 1000 mels, and that crossing is the one place they agree: 500 Hz is 607 mels, while 4000 Hz is only 2146. Above the crossing the curve flattens, meaning ever-larger jumps in hertz are needed to produce the same perceived change in pitch. The interval from 200 to 300 Hz is clearly audible as a pitch change; the interval from 7000 to 7100 Hz is barely noticeable at all.</p>

<h2 class="lesson-h2">The Filterbank</h2>
<p class="lesson-p">To apply that warping, the spectrum is pooled through a bank of overlapping triangular filters whose centres are equally spaced <em>in mels</em>, and therefore unequally spaced in hertz: narrow and closely packed at low frequencies, broad and sparse at high ones. Each filter multiplies the spectrum by its triangle and sums, collapsing a whole region into a single number \\(m_i\\). Implementations normally divide each channel by the width of its triangle, so that a broad high-frequency filter is not credited with more energy merely for covering more hertz; the figure below follows that convention. Eighty channels is a common choice, reducing several hundred DFT bins to eighty values that are better matched to perception.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Filterbank Overlay</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">channels</span>
      <button style="${MTBTN}" id="pfb-b0" onclick="pfbCh(10)">10</button>
      <button style="${MTBTN}" id="pfb-b1" onclick="pfbCh(20)">20</button>
      <button style="${MTBTN}" id="pfb-b2" onclick="pfbCh(40)">40</button>
      <span style="${MTLBL}">inspect filter</span>
      <input id="pfb-i" type="range" min="0" max="9" step="1" value="2" oninput="pfbDraw()" style="width:120px;accent-color:var(--accent)">
    </div>
    <canvas id="pfb-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pfb-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">The Logarithm</h2>
<p class="lesson-p">The final perceptual step takes the logarithm of each channel value. This mirrors loudness perception, which is also roughly logarithmic: doubling the physical power does not double the perceived loudness. It has a second benefit that matters more in practice. Moving a microphone closer multiplies the whole spectrum by a constant, and under a logarithm a multiplicative change becomes an <em>additive</em> one, which a model can absorb far more easily, and which a simple mean subtraction can remove outright.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Why the Logarithm</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">microphone distance</span>
      <input id="plg-d" type="range" min="0.3" max="3" step="0.1" value="1" oninput="plgDraw()" style="width:160px;accent-color:var(--accent)">
      <span id="plg-l" style="${MTLBL}"></span>
      <button style="${MTBTN}" id="plg-n" onclick="plgNorm()">mean normalization: off</button>
    </div>
    <canvas id="plg-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="plg-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qph-m"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why are the mel filters narrow at low frequencies and wide at high ones?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-m','Correct. Hearing resolves low frequencies more finely, so the filterbank spends more channels there and pools aggressively where the ear cannot discriminate anyway.')">Human hearing resolves low frequencies more finely than high ones</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-m','Speech energy is concentrated low down, but the spacing follows perceptual resolution rather than raw energy.')">There is no energy above a few kilohertz in speech</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-m','The DFT provides uniform resolution across the whole range; the warping is imposed deliberately afterwards.')">The DFT is less accurate at high frequencies</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-m','Any spacing with the same channel count costs the same to compute.')">Wide filters are cheaper to compute</button>
</div><div class="quiz-explain" id="qph-m-explain"></div></div>`;

/* ── Filterbank Overlay ───────────────────────────────────── */
let _pfb = {n:10};
function pfbBuild(){ _pfb = {n:10}; pfbDraw(); }
function pfbCh(n){
  _pfb.n = n;
  const s = document.getElementById('pfb-i');
  if(s){ s.max = n-1; if(+s.value > n-1) s.value = Math.floor(n/3); }
  pfbDraw();
}
function pfbDraw(){
  const sel = Math.max(0, Math.min(_pfb.n-1, Math.round(+(document.getElementById('pfb-i')||{value:2}).value)));
  [[0,10],[1,20],[2,40]].forEach(([i,n])=>{ const e = document.getElementById('pfb-b'+i); if(e){
    e.style.background = n===_pfb.n ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = n===_pfb.n ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('pfb-canvas', 268); if(!c) return;
  const {x, w} = c;
  const FMAX = 8000, N = _pfb.n;
  const L = 34, PW = w-L-24, T = 30, PH = 130;
  const mel = f => 1127*Math.log(1+f/700);
  const imel = m => 700*(Math.exp(m/1127)-1);
  const px = f => L + (f/FMAX)*PW;
  const edges = [];
  const mMax = mel(FMAX);
  for(let i=0;i<=N+1;i++) edges.push(imel(mMax*i/(N+1)));
  // spectrum underneath
  const spec = f => {
    let v = 0.05;
    [[520,0.85],[1480,0.6],[2600,0.4],[3400,0.22]].forEach(([cf,a])=>{
      v += a*Math.exp(-Math.pow((f-cf)/210,2)); });
    return Math.min(1, v*(0.7+0.3*Math.abs(Math.sin(f*0.02))));
  };
  x.strokeStyle = 'rgba(23,27,52,0.35)'; x.lineWidth = 1;
  x.beginPath();
  for(let p=0;p<PW;p++){
    const f = (p/PW)*FMAX, v = spec(f);
    p? x.lineTo(L+p, T+PH - v*PH) : x.moveTo(L+p, T+PH - v*PH);
  }
  x.stroke();
  // triangles
  for(let i=0;i<N;i++){
    const lo = edges[i], ce = edges[i+1], hi = edges[i+2];
    const on = i===sel;
    x.beginPath();
    x.moveTo(px(lo), T+PH); x.lineTo(px(ce), T+PH-PH*0.82); x.lineTo(px(hi), T+PH);
    x.closePath();
    x.fillStyle = on ? 'rgba(159,18,57,0.30)' : 'rgba(79,70,229,0.10)';
    x.fill();
    x.strokeStyle = on ? MTC.a2 : 'rgba(79,70,229,0.45)'; x.lineWidth = on?1.8:0.9;
    x.stroke();
  }
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L, T+PH); x.lineTo(L+PW, T+PH); x.stroke();
  [0,2000,4000,6000,8000].forEach(f=>
    mtTxt(x, f===0?'0':(f/1000)+'k', px(f), T+PH+14, {size:8, col:MTC.muted, align:'center'}));
  mtTxt(x, 'Hz \u2192', L+PW, T+PH+30, {size:8, col:MTC.muted, align:'right'});
  mtTxt(x, N + ' TRIANGULAR FILTERS, EQUALLY SPACED IN MELS', L, 22, {size:9, col:MTC.muted});
  // output bank
  const by = T+PH+44, bh = 42;
  const bw = Math.min(26, (PW)/N - 2);
  for(let i=0;i<N;i++){
    const lo = edges[i], ce = edges[i+1], hi = edges[i+2];
    // integrate spectrum against triangle
    // a fixed count, not a fixed Hz step: the narrowest low-frequency
    // triangles are only tens of hertz wide and a coarse step under-integrates them
    const STEPS = 64;
    let acc = 0;
    for(let t=0; t<STEPS; t++){
      const f = lo + (hi-lo)*(t+0.5)/STEPS;
      const tri = f < ce ? (f-lo)/(ce-lo) : 1-(f-ce)/(hi-ce);
      acc += spec(f)*Math.max(0,tri);
    }
    const v = acc/STEPS;
    const bx = L + i*((PW)/N);
    const on = i===sel;
    mtRR(x, bx, by+bh - v*bh*2.2, Math.max(3,bw), Math.max(2, v*bh*2.2), 3);
    x.fillStyle = on ? MTC.a2 : 'rgba(79,70,229,0.55)'; x.fill();
    if(on) mtTxt(x, 'm'+(i+1), bx+bw/2, by+bh+14, {size:8.5, col:MTC.a2, align:'center'});
  }
  mtTxt(x, 'ONE SCALAR PER CHANNEL', L, by-6, {size:9, col:MTC.muted});
  const lo = edges[sel], hi = edges[sel+2];
  mtSet('pfb-cap', `Filter <b style="color:var(--accent2)">m${sel+1}</b> spans ${lo.toFixed(0)} to ${hi.toFixed(0)} Hz, a width of ${(hi-lo).toFixed(0)} Hz. Compare it with the last filter, which spans ${(edges[N+1]-edges[N-1]).toFixed(0)} Hz: the same perceptual distance costs many times more hertz up there. Each triangle multiplies the spectrum beneath it and averages the result into one number, width-normalised so that broad channels are not flattered by their span, and so ${N} filters replace several hundred DFT bins.`);
}

/* ── Log compression ──────────────────────────────────────── */
let _plg = false;
function plgBuild(){ _plg = false; plgDraw(); }
function plgNorm(){ _plg = !_plg; plgDraw(); }
function plgDraw(){
  const d = +(document.getElementById('plg-d')||{value:1}).value;
  mtSet('plg-l', d.toFixed(1) + ' m');
  const b = document.getElementById('plg-n');
  if(b){ b.textContent = 'mean normalization: ' + (_plg?'on':'off');
         b.style.background = _plg?'var(--accent)':'var(--surface2)'; b.style.color = _plg?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('plg-canvas', 226); if(!c) return;
  const {x, w} = c;
  const N = 14;
  const base = i => 0.12 + 0.86*Math.exp(-Math.pow((i-3.4)/2.6, 2)) + 0.4*Math.exp(-Math.pow((i-9)/2.2, 2));
  const gain = 1/(d*d);
  const half = (w-60)/2;
  const panel = (ox, title, vals, col, ymid, scale)=>{
    mtTxt(x, title, ox, 22, {size:9, col:MTC.muted});
    const bw = half/N;
    x.strokeStyle = MTC.line; x.lineWidth = 1;
    x.beginPath(); x.moveTo(ox, ymid); x.lineTo(ox+half-8, ymid); x.stroke();
    vals.forEach((v, i)=>{
      const h2 = v*scale;
      mtRR(x, ox+i*bw+1, h2>=0 ? ymid-h2 : ymid, bw-3, Math.max(2,Math.abs(h2)), 2);
      x.fillStyle = col+'CC'; x.fill();
    });
  };
  const lin = [], lg = [];
  for(let i=0;i<N;i++){ const v = base(i)*gain; lin.push(v); lg.push(Math.log(v+1e-3)); }
  let show = lg.slice();
  if(_plg){ const mu = show.reduce((a,v)=>a+v,0)/N; show = show.map(v=>v-mu); }
  panel(24, 'LINEAR MEL SPECTRUM', lin, MTC.a2, 132, 66);
  panel(24+half+12, _plg ? 'LOG MEL, MEAN-NORMALIZED' : 'LOG MEL SPECTRUM', show, MTC.a4, _plg?118:170, _plg?26:15);
  const linRange = (Math.max(...lin) - Math.min(...lin)).toFixed(2);
  mtTxt(x, 'peak = ' + Math.max(...lin).toFixed(2), 24, 166, {size:9, col:MTC.a2});
  mtTxt(x, 'shape ' + (Math.abs(gain-1)<0.05 ? 'as recorded' : (gain>1?'scaled up ':'scaled down ') + gain.toFixed(2) + '\u00d7'),
        24, 182, {size:9, col:MTC.muted});
  mtTxt(x, 'spacing between bars unchanged', 24+half+12, 200, {size:9, col:MTC.a4});
  mtSet('plg-cap', 'Moving the microphone multiplies every channel by the same factor. On the left that rescales the whole picture, so a model trained at one distance sees different numbers at another. On the right the logarithm has turned that multiplication into a constant offset: every bar moves up or down together and the <em>differences</em> between channels, which carry the phonetic information, are untouched. ' + (_plg ? 'With mean normalization on, even the offset is removed and the two distances become indistinguishable.' : 'Turn on mean normalization to subtract that offset entirely.'));
}

/* ══ 14.6 CEPSTRUM ════════════════════════════════════════ */
PH_PAGES.phcep = `
<div class="lesson-chapter-label">Section 14.6</div>
<h1 class="lesson-h1">Separating the Vocal Tract From the Voice</h1>
<p class="lesson-intro">The source-filter model separates the excitation from the vocal-tract response. Taking logarithms turns their spectral product into a sum; a further transform helps separate their contributions. This leads to the cepstrum and, with mel filtering, MFCCs.</p>

<h2 class="lesson-h2">The Trick</h2>
<p class="lesson-p">Take the log magnitude spectrum and, instead of reading it as a spectrum, <em>pretend it is a waveform</em>. Strip the axis labels and it looks like one: a wiggly line. And like any waveform it has fast components and slow ones. The fast ripple, repeating roughly eight times per thousand samples of the plot, is the harmonic comb from the glottis. The slow undulation, four or so broad humps across the whole plot, is the formant envelope from the tract.</p>
<p class="lesson-p">Two different rates of variation, physically produced by two different organs, sitting in one plot. And separating a signal into rates of variation is exactly what a Fourier transform does. So take the transform of the log spectrum:</p>
<div class="lesson-math">\\[c[n] = \\sum_{k=0}^{N-1} \\log\\left(\\left|\\sum_{m=0}^{N-1} x[m]\\, e^{-j\\frac{2\\pi}{N}km}\\right|\\right) e^{j\\frac{2\\pi}{N}kn}\\]</div>
<p class="lesson-p">The result is the <strong>cepstrum</strong>, a name obtained by reversing the first syllable of &ldquo;spectrum,&rdquo; in keeping with a tradition of transforming words alongside the signals. Its horizontal axis is not frequency but <em>quefrency</em>, measured in samples, and low quefrency corresponds to slowly varying spectral structure while high quefrency corresponds to rapid structure.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Cepstrum Ladder</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pcl-btns"></div>
    <canvas id="pcl-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pcl-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">The Split</h2>
<p class="lesson-p">In the cepstrum the two structures land in different places. The formant envelope, being slow, sits in the first dozen or so coefficients. The harmonic comb, being fast, produces a single sharp spike at the quefrency matching the pitch period: for a 100 Hz voice sampled at 16 kHz, near sample 160. They are now separated by position rather than tangled together, so a cutoff can keep one and discard the other.</p>
<p class="lesson-p">Keeping the first 12 coefficients retains the vocal tract information and throws away pitch, which is what a phone recognizer wants, since the identity of a vowel does not depend on how high the speaker was talking. Keeping the spike instead gives a pitch tracker.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Cepstral Splitter</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">cutoff quefrency</span>
      <input id="pcq-q" type="range" min="4" max="200" step="2" value="12" oninput="pcqDraw()" style="width:180px;accent-color:var(--accent)">
      <span id="pcq-l" style="${MTLBL}"></span>
    </div>
    <canvas id="pcq-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pcq-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Decorrelation</h2>
<p class="lesson-p">There is a second benefit, and historically it was the decisive one. Adjacent mel channels are strongly correlated, since a formant is wide enough to raise several neighbouring channels together. Statistical models of the era, particularly Gaussian mixtures with diagonal covariance, assumed dimensions were independent and were badly served by that correlation. Cepstral coefficients are close to uncorrelated, so the assumption becomes tenable. Neural networks have no such requirement, which is why modern systems often stop at log mel and skip this step entirely.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Correlation Before and After</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" id="pdc-b0" onclick="pdcGo(0)">mel channels</button>
      <button style="${MTBTN}" id="pdc-b1" onclick="pdcGo(1)">cepstral coefficients</button>
    </div>
    <canvas id="pdc-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pdc-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Assembling the Vector</h2>
<p class="lesson-p">The classic MFCC feature vector is built in three blocks. Take the first 12 cepstral coefficients, and add frame energy as a thirteenth, computed straight from the samples:</p>
<div class="lesson-math">\\[\\text{Energy} = \\sum_{t=t_1}^{t_2} x^2[t]\\]</div>
<p class="lesson-p">Those 13 describe a single frame in isolation, which leaves out something important: speech is defined as much by change as by state, and a stop burst or a formant transition is an event <em>between</em> frames. So each of the 13 is supplemented by its <strong>delta</strong>, the difference from the neighbouring frames, and its <strong>double delta</strong>, the change in that change. Thirteen becomes thirty-nine.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Feature Vector Assembler</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pva-btns"></div>
    <canvas id="pva-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="pva-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qph-c"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does taking only the first 12 cepstral coefficients discard pitch information?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qph-c','Correct. The harmonic comb varies rapidly across the log spectrum, so it lands at high quefrency, well beyond the first dozen coefficients.')">Pitch appears as rapid variation, which lands at high quefrency</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-c','Pitch is present in the log spectrum as the harmonic comb; the cepstrum relocates it rather than removing it.')">Pitch was already removed by the mel filterbank</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-c','The first coefficients carry the slow envelope, which is the tract, not the source.')">The first coefficients contain only energy</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qph-c','Twelve coefficients are ample for the envelope; the cut is chosen to separate structures, not for lack of room.')">Twelve coefficients are too few to represent any pitch</button>
</div><div class="quiz-explain" id="qph-c-explain"></div></div>`;

/* ── Cepstrum helpers ─────────────────────────────────────── */
const PCEP_F0 = 120, PCEP_NB = 256;
function pcepLogSpec(k){
  const f = (k/PCEP_NB)*8000;
  let env = 0.08;
  [[500,1.0,180],[1700,0.72,220],[2600,0.42,240],[3500,0.25,300]].forEach(([cf,a,bw])=>{
    env += a/(1+Math.pow((f-cf)/bw,2)); });
  const harm = 0.55 + 0.45*Math.cos(2*Math.PI*f/PCEP_F0);
  return Math.log(env*(0.35+0.65*harm) + 0.02);
}
/* ── Cepstrum Ladder ──────────────────────────────────────── */
const PCL_STEP = ['magnitude spectrum','log magnitude','as a pseudo-signal','cepstrum'];
let _pcl = 0;
function pclBuild(){
  const b = document.getElementById('pcl-btns');
  if(b) b.innerHTML = PCL_STEP.map((s,i)=>`<button style="${MTBTN}" id="pcl-b${i}" onclick="pclGo(${i})">${i+1}. ${s}</button>`).join('');
  _pcl = 0; pclDraw();
}
function pclGo(i){ _pcl = i; pclDraw(); }
function pclDraw(){
  PCL_STEP.forEach((_,i)=>{ const e = document.getElementById('pcl-b'+i); if(e){
    e.style.background = i===_pcl ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pcl ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('pcl-canvas', 250); if(!c) return;
  const {x, w} = c;
  const L = 40, PW = w-L-24, T = 40, PH = 150;
  if(_pcl <= 2){
    const vals = [];
    for(let k=0;k<PCEP_NB;k++) vals.push(_pcl===0 ? Math.exp(pcepLogSpec(k)) : pcepLogSpec(k));
    const mn = Math.min(...vals), mx = Math.max(...vals);
    x.strokeStyle = MTC.a1; x.lineWidth = 1.2;
    x.beginPath();
    vals.forEach((v, k)=>{
      const px = L + (k/PCEP_NB)*PW;
      const py = T+PH - ((v-mn)/(mx-mn))*PH;
      k? x.lineTo(px, py) : x.moveTo(px, py);
    });
    x.stroke();
    if(_pcl===0){
      // envelope overlay
      x.strokeStyle = MTC.a5; x.lineWidth = 2; x.setLineDash([5,4]);
      x.beginPath();
      for(let k=0;k<PCEP_NB;k++){
        const f = (k/PCEP_NB)*8000;
        let env = 0.08;
        [[500,1.0,180],[1700,0.72,220],[2600,0.42,240],[3500,0.25,300]].forEach(([cf,a,bw])=>{
          env += a/(1+Math.pow((f-cf)/bw,2)); });
        const py = T+PH - ((env-Math.exp(mn))/(Math.exp(mx)-Math.exp(mn)))*PH*0.62;
        k? x.lineTo(L+(k/PCEP_NB)*PW, py) : x.moveTo(L+(k/PCEP_NB)*PW, py);
      }
      x.stroke(); x.setLineDash([]);
      mtTxt(x, 'spectral envelope', L+PW-6, T+18, {size:9, col:MTC.a5, align:'right'});
    }
    if(_pcl===2){
      mtTxt(x, 'fast ripple \u2192 harmonics (the voice)', L+4, T+16, {size:9.5, col:MTC.a2});
      mtTxt(x, 'slow humps \u2192 formants (the tract)', L+4, T+32, {size:9.5, col:MTC.a5});
      // mark humps
      [500,1700,2600,3500].forEach(cf=>{
        const px = L + (cf/8000)*PW;
        x.strokeStyle = 'rgba(165,104,14,0.5)'; x.lineWidth = 1; x.setLineDash([3,3]);
        x.beginPath(); x.moveTo(px, T); x.lineTo(px, T+PH); x.stroke(); x.setLineDash([]);
      });
    }
    x.strokeStyle = MTC.line2; x.beginPath(); x.moveTo(L, T+PH); x.lineTo(L+PW, T+PH); x.stroke();
    if(_pcl < 2){
      [0,2000,4000,6000,8000].forEach(f=>
        mtTxt(x, f===0?'0':(f/1000)+'k', L+(f/8000)*PW, T+PH+14, {size:8, col:MTC.muted, align:'center'}));
      mtTxt(x, 'frequency (Hz)', L+PW, T+PH+30, {size:8.5, col:MTC.muted, align:'right'});
    } else {
      mtTxt(x, 'axis labels removed \u2014 read it as a waveform', L, T+PH+20, {size:9, col:MTC.a2});
    }
  } else {
    // cepstrum
    const NC = 220;
    const cep = [];
    for(let n=0;n<NC;n++){
      // every bin: the harmonic ripple is 3.84 bins wide, so sampling every
      // other bin would fall below Nyquist and alias the pitch spike in two
      let s = 0;
      for(let k=0;k<PCEP_NB;k++) s += pcepLogSpec(k)*Math.cos(Math.PI*n*(k+0.5)/PCEP_NB);
      cep.push(s/PCEP_NB*2);
    }
    const mx = Math.max(...cep.slice(2).map(Math.abs));
    x.strokeStyle = MTC.line2; x.beginPath();
    x.moveTo(L, T+PH/2); x.lineTo(L+PW, T+PH/2); x.stroke();
    cep.forEach((v, n)=>{
      if(n<1) return;
      const px = L + (n/NC)*PW;
      const h2 = (v/mx)*(PH/2)*0.9;
      const hi = n > 90;
      x.strokeStyle = hi ? MTC.a2 : MTC.a5; x.lineWidth = 1.6;
      x.beginPath(); x.moveTo(px, T+PH/2); x.lineTo(px, T+PH/2 - h2); x.stroke();
    });
    mtTxt(x, 'low quefrency \u00b7 the envelope', L+4, T+16, {size:9.5, col:MTC.a5});
    mtTxt(x, 'spike \u00b7 the pitch period', L+PW-6, T+16, {size:9.5, col:MTC.a2, align:'right'});
    [0,50,100,150,200].forEach(n=>
      mtTxt(x, n+'', L+(n/NC)*PW, T+PH+14, {size:8, col:MTC.muted, align:'center'}));
    mtTxt(x, 'quefrency (samples)', L+PW, T+PH+30, {size:8.5, col:MTC.muted, align:'right'});
  }
  const caps = [
    'The magnitude spectrum of one frame of a vowel. Two structures are superimposed: a rapid comb of harmonics spaced at the pitch, and a slow envelope with peaks at the formants. The dashed line traces the envelope alone.',
    'Taking logs compresses the vertical range, bringing the weak high-frequency detail into view alongside the strong low-frequency peaks. The two superimposed structures are now equally visible.',
    'Now the trick: ignore what the axes mean and look at the shape. This is a wiggly line with a fast component and a slow component, which is to say, it has its own frequency content. Roughly sixty-seven fast ripples span the plot, one for each harmonic of a 120 Hz voice crossing an 8 kHz range; four broad humps come from the formants.',
    'Transforming the pseudo-signal separates the two rates. The slow envelope lands in the first few coefficients on the left; the fast harmonic comb produces the isolated spike on the right, at quefrency 133, which is 16000/120, the pitch period of this 120 Hz voice in samples. Physically separate organs, now numerically separate coefficients.'
  ];
  mtSet('pcl-cap', caps[_pcl]);
}

/* ── Cepstral Splitter ────────────────────────────────────── */
function pcqDraw(){
  const q = Math.round(+(document.getElementById('pcq-q')||{value:12}).value);
  mtSet('pcq-l', 'keep first ' + q);
  const c = mtCtx('pcq-canvas', 250); if(!c) return;
  const {x, w} = c;
  const NC = 220, L = 34, PW = w-L-24;
  const cep = [];
  for(let n=0;n<NC;n++){
    let s = 0;
    for(let k=0;k<PCEP_NB;k++) s += pcepLogSpec(k)*Math.cos(Math.PI*n*(k+0.5)/PCEP_NB);
    cep.push(s/PCEP_NB*2);
  }
  const mx = Math.max(...cep.slice(2).map(Math.abs));
  mtTxt(x, 'CEPSTRUM WITH CUTOFF', L, 20, {size:9, col:MTC.muted});
  const T = 30, PH = 84;
  x.fillStyle = 'rgba(165,104,14,0.10)'; x.fillRect(L, T, (q/NC)*PW, PH);
  x.fillStyle = 'rgba(159,18,57,0.07)'; x.fillRect(L+(q/NC)*PW, T, PW-(q/NC)*PW, PH);
  x.strokeStyle = MTC.line2; x.beginPath(); x.moveTo(L, T+PH/2); x.lineTo(L+PW, T+PH/2); x.stroke();
  cep.forEach((v, n)=>{
    if(n<1) return;
    const px = L + (n/NC)*PW;
    const h2 = (v/mx)*(PH/2)*0.9;
    x.strokeStyle = n < q ? MTC.a5 : 'rgba(159,18,57,0.75)'; x.lineWidth = 1.4;
    x.beginPath(); x.moveTo(px, T+PH/2); x.lineTo(px, T+PH/2 - h2); x.stroke();
  });
  x.strokeStyle = MTC.a1; x.lineWidth = 2; x.setLineDash([4,3]);
  x.beginPath(); x.moveTo(L+(q/NC)*PW, T-6); x.lineTo(L+(q/NC)*PW, T+PH+6); x.stroke(); x.setLineDash([]);
  // reconstructions
  const recon = (keepLow)=>{
    const out = [];
    for(let k=0;k<PCEP_NB;k++){
      let s = cep[0]/2;
      for(let n=1;n<NC;n++){
        if(keepLow ? n>=q : n<q) continue;
        s += cep[n]*Math.cos(Math.PI*n*(k+0.5)/PCEP_NB);
      }
      out.push(s);
    }
    return out;
  };
  const lo = recon(true), hi = recon(false);
  const drawR = (vals, y, h2, col, lab)=>{
    const mn = Math.min(...vals), mxx = Math.max(...vals);
    mtTxt(x, lab, L, y-6, {size:9, col:col});
    x.strokeStyle = col; x.lineWidth = 1.4;
    x.beginPath();
    vals.forEach((v, i)=>{
      const px = L + (i/vals.length)*PW;
      const py = y + h2 - ((v-mn)/((mxx-mn)||1))*h2;
      i? x.lineTo(px, py) : x.moveTo(px, py);
    });
    x.stroke();
  };
  drawR(lo, 148, 40, MTC.a5, 'LOW SIDE REBUILT \u2192 the vocal tract filter, formants only');
  drawR(hi, 212, 32, MTC.a2, 'HIGH SIDE REBUILT \u2192 the harmonic comb, pitch only');
  mtSet('pcq-cap', q <= 20
    ? 'Keeping the first ' + q + ' coefficients rebuilds a smooth envelope with the formant peaks intact and no trace of the harmonic ripple. This is what a phone recognizer wants: vowel identity without the speaker\u2019s pitch. The discarded high side, rebuilt separately below, is the pitch information.'
    : (q > 133
      ? 'The cutoff has now swallowed the pitch spike at quefrency 133, so the harmonic comb is back in the low side and the reconstruction has its ripple again. The separation is gone. Twelve to thirteen coefficients is the usual choice because it captures the envelope while staying well clear of that spike.'
      : 'With the cutoff this high the low side is picking up detail finer than a formant, though the pitch spike at quefrency 133 is still outside it. Twelve to thirteen coefficients is the usual choice because it captures the envelope while staying well clear of that spike.'));
}

/* ── Decorrelation ────────────────────────────────────────── */
let _pdc = 0;
function pdcBuild(){ _pdc = 0; pdcDraw(); }
function pdcGo(i){ _pdc = i; pdcDraw(); }
function pdcDraw(){
  [0,1].forEach(i=>{ const e = document.getElementById('pdc-b'+i); if(e){
    e.style.background = i===_pdc ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pdc ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('pdc-canvas', 226); if(!c) return;
  const {x, w} = c;
  const N = 16, cell = Math.min(12, 168/N);
  const S = N*cell;
  const ox = (w-S)/2 - 40, oy = 26;
  let offDiag = 0;
  for(let i=0;i<N;i++) for(let j=0;j<N;j++){
    let v;
    if(_pdc===0){
      v = Math.exp(-Math.pow((i-j)/2.1, 2));
      if(Math.abs(i-j)>4) v += 0.12*Math.abs(Math.sin(i*0.9+j*0.7));
    } else {
      v = i===j ? 1 : 0.05*Math.abs(Math.sin(i*2.7+j*1.9));
    }
    if(i!==j) offDiag += v;
    x.fillStyle = 'rgba(79,70,229,' + Math.min(0.95, v).toFixed(3) + ')';
    x.fillRect(ox+j*cell, oy+i*cell, cell-0.8, cell-0.8);
  }
  x.strokeStyle = MTC.line2; x.lineWidth = 1; x.strokeRect(ox, oy, S, S);
  mtTxt(x, _pdc===0 ? 'MEL CHANNEL COVARIANCE' : 'CEPSTRAL COEFFICIENT COVARIANCE', ox, 18, {size:9, col:MTC.muted});
  mtTxt(x, 'dimension j \u2192', ox+S/2, oy+S+16, {size:8.5, col:MTC.muted, align:'center'});
  const RX = ox + S + 34;
  const avg = offDiag/(N*N-N);
  mtTxt(x, 'mean off-diagonal', RX, 46, {size:9, col:MTC.muted});
  mtTxt(x, avg.toFixed(3), RX, 72, {size:22, col: avg>0.15?MTC.a2:MTC.a4, weight:'700'});
  mtTxt(x, avg>0.15 ? 'strongly correlated' : 'nearly independent', RX, 94, {size:9.5, col: avg>0.15?MTC.a2:MTC.a4});
  mtTxt(x, 'diagonal-covariance', RX, 132, {size:9, col:MTC.muted});
  mtTxt(x, 'Gaussian assumption:', RX, 146, {size:9, col:MTC.muted});
  mtTxt(x, avg>0.15 ? 'violated' : 'reasonable', RX, 168, {size:13, col: avg>0.15?MTC.a2:MTC.a4, weight:'700'});
  mtSet('pdc-cap', _pdc===0
    ? 'A bright band runs along the diagonal and spreads several cells either side: neighbouring mel channels rise and fall together, because a single formant is wide enough to excite several adjacent filters at once. A model that assumes independent dimensions is being lied to.'
    : 'After the cepstral transform the off-diagonal mass has mostly vanished and the matrix is close to diagonal. The dimensions now carry largely separate information, which is what made diagonal-covariance Gaussian models workable. Neural networks do not need this, which is why modern pipelines often stop at log mel.');
}

/* ── Feature Vector Assembler ─────────────────────────────── */
const PVA_B = [
  {lab:'12 cepstral coefficients', n:12, col:'#4F46E5',
   note:'The vocal tract envelope, low quefrency only. These carry which phone is being articulated.'},
  {lab:'+ 1 energy', n:1, col:'#0B8457',
   note:'Total energy in the frame, computed directly from the samples as the sum of squares. Distinguishes loud from quiet segments, which matters for stops and silence.'},
  {lab:'+ 12 delta cepstral', n:12, col:'#B45309',
   note:'The frame-to-frame change in each coefficient. A formant transition is an event between frames, invisible to any single frame, and deltas make it explicit.'},
  {lab:'+ 1 delta energy', n:1, col:'#B45309', note:'How fast the energy is changing: a stop release is a sudden jump, silence is flat.'},
  {lab:'+ 12 double delta', n:12, col:'#9F1239',
   note:'The change in the change: acceleration. Captures curvature in the trajectory rather than just its slope.'},
  {lab:'+ 1 double delta energy', n:1, col:'#9F1239', note:'Acceleration of the energy contour, completing the vector at 39 dimensions.'}
];
let _pva = -1;
function pvaBuild(){
  const b = document.getElementById('pva-btns');
  if(b) b.innerHTML = PVA_B.map((s,i)=>
    `<button style="${MTBTN}" id="pva-b${i}" onclick="pvaGo(${i})">${s.lab}</button>`).join('');
  _pva = -1; pvaDraw();
}
function pvaGo(i){ _pva = (_pva===i ? -1 : i); pvaDraw(); }
function pvaDraw(){
  PVA_B.forEach((_,i)=>{ const e = document.getElementById('pva-b'+i); if(e){
    e.style.background = i===_pva ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pva ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('pva-canvas', 190); if(!c) return;
  const {x, w} = c;
  const total = 39;
  const L = 20, PW = w-40;
  const cw = PW/total;
  let idx = 0;
  PVA_B.forEach((blk, bi)=>{
    const on = bi===_pva;
    for(let k=0;k<blk.n;k++){
      const px = L + idx*cw;
      const v = 0.28 + 0.62*Math.abs(Math.sin(idx*1.31+bi));
      const h2 = v*64;
      x.fillStyle = on ? blk.col : blk.col+'55';
      mtRR(x, px+0.6, 116-h2, cw-1.6, h2, 2); x.fill();
      idx++;
    }
    const x1 = L + (idx-blk.n)*cw, x2 = L + idx*cw;
    x.strokeStyle = on ? blk.col : MTC.line;
    x.lineWidth = on ? 1.8 : 1;
    x.beginPath(); x.moveTo(x1, 124); x.lineTo(x1, 132); x.lineTo(x2-2, 132); x.lineTo(x2-2, 124); x.stroke();
    if(blk.n > 4 || on)
      mtTxt(x, blk.n + '', (x1+x2)/2, 144, {size:9, col: on?blk.col:MTC.muted, align:'center', weight: on?'700':''});
  });
  mtTxt(x, 'ONE FRAME \u00b7 39 DIMENSIONS', L, 24, {size:9.5, col:MTC.muted});
  mtTxt(x, '13 static  +  13 delta  +  13 double delta', L, 168, {size:10, col:MTC.text});
  mtTxt(x, '100 of these per second', w-20, 168, {size:9.5, col:MTC.a1, align:'right'});
  mtSet('pva-cap', _pva>=0
    ? '<b style="color:' + PVA_B[_pva].col + '">' + PVA_B[_pva].lab + '.</b> ' + PVA_B[_pva].note
    : 'The classic MFCC vector: 13 numbers describing the frame, then the same 13 quantities differentiated once, then twice. Two thirds of the vector is therefore about change rather than state, which reflects how much of phonetic identity lives in movement. Click a block for what it contributes.');
}

/* ══ 14.7 CHAPTER MAP ═════════════════════════════════════ */
PH_PAGES.phmap = `
<div class="lesson-chapter-label">Section 14.7</div>
<h1 class="lesson-h1">The Chapter in One Map</h1>
<p class="lesson-intro">Compare four descriptions of the same phone: articulation, waveform, spectrum, and extracted features. The diagram connects the stages and links back to their explanations.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Phonetics Pipeline</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="pmp-btns"></div>
    <canvas id="pmp-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="pmp-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Read left to right and the chain is causal. A speaker positions the tongue and vibrates the vocal folds, which is <strong>articulation</strong> (14.2). That gesture produces a pressure wave whose periodicity, amplitude and noise character are directly readable, which is <strong>acoustics</strong> (14.4). Decomposing the wave into frequencies exposes the tract resonances as formants, which is the <strong>spectral</strong> description (14.4.5), and source-filter theory explains why the resonances and the pitch are independent (14.4.6). Finally the spectrum is warped, compressed and reduced into <strong>feature vectors</strong> (14.5, 14.6) that a recognizer can consume.</p>
<p class="lesson-p">Read right to left and it is a synthesis pipeline: text-to-speech systems predict features, convert them to a spectrum, and reconstruct a waveform. The same chain, walked backwards, which is why the two problems have always been studied together.</p>
<p class="lesson-p">One theme is worth taking away above the others. Every stage of the analysis pipeline is a deliberate loss of information, and each loss was chosen because the discarded variation does not distinguish words: phase, because it depends on where the window fell; fine high-frequency resolution, because the ear cannot use it; absolute level, because it depends on the microphone; pitch, because a vowel is the same vowel however high it is sung. What remains after all that discarding is close to the smallest description that still determines what was said.</p>`;

/* ── Phonetics Pipeline map ───────────────────────────────── */
const PMP_N = [
  {id:'phorgan', lab:'articulation',  sub:'14.2',   x:.03, y:.30},
  {id:'phread',  lab:'acoustics',     sub:'14.4.4', x:.27, y:.30},
  {id:'phfour',  lab:'spectrum',      sub:'14.4.5', x:.51, y:.30},
  {id:'phmel',   lab:'log mel',       sub:'14.5.4', x:.75, y:.30},
  {id:'phcep',   lab:'MFCC vector',   sub:'14.6',   x:.75, y:.72},
  {id:'phsrc',   lab:'source-filter', sub:'14.4.6', x:.51, y:.72},
  {id:'phdig',   lab:'digitize',      sub:'14.4.2', x:.27, y:.72},
  {id:'phframe', lab:'window + DFT',  sub:'14.5.2', x:.03, y:.72}
];
const PMP_E = [[0,1],[1,2],[2,3],[3,4],[5,2],[6,1],[7,2]];
const PMP_PHONE = [
  {lab:'[iy] as in beet', art:'tongue high and front, folds vibrating', ac:'strong regular periodicity, high amplitude', sp:'F1 low near 270, F2 high near 2400', ft:'low-quefrency envelope with widely separated peaks'},
  {lab:'[s] as in see',   art:'tongue near alveolar ridge, folds apart', ac:'irregular noise, no periodicity, moderate amplitude', sp:'broad energy above 4 kHz, no formant bands', ft:'flat low coefficients, energy concentrated in high channels'},
  {lab:'[b] as in baby',  art:'lips closed then released, folds vibrating', ac:'silence then a sharp burst', sp:'brief broadband transient followed by formant onset', ft:'sharp delta coefficients at the release, near-zero energy before'}
];
let _pmp = {hot:null, ph:0};
function pmpBuild(){
  const b = document.getElementById('pmp-btns');
  if(b) b.innerHTML = '<span style="'+MTLBL+'">trace one phone</span>' + PMP_PHONE.map((p,i)=>
    `<button style="${MTBTN}" id="pmp-b${i}" onclick="pmpGo(${i})">${p.lab}</button>`).join('');
  const cv = document.getElementById('pmp-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('mousemove', e=>{
      const r = cv.getBoundingClientRect();
      const h = pmpHit(e.clientX-r.left, e.clientY-r.top, r.width, cv.clientHeight||240);
      if(h!==_pmp.hot){ _pmp.hot = h; pmpDraw(); }
    });
    cv.addEventListener('click', e=>{
      const r = cv.getBoundingClientRect();
      const h = pmpHit(e.clientX-r.left, e.clientY-r.top, r.width, cv.clientHeight||240);
      if(h!==null) openPHSec(PMP_N[h].id);
    });
  }
  _pmp = {hot:null, ph:0}; pmpDraw();
}
function pmpGo(i){ _pmp.ph = i; pmpDraw(); }
function pmpPt(nd, w, h){ return {x: 20 + nd.x*(w-140), y: 26 + nd.y*(h-80)}; }
function pmpHit(mx, my, w, h){
  let hit = null;
  PMP_N.forEach((nd, i)=>{ const p = pmpPt(nd, w, h);
    if(mx>p.x-6 && mx<p.x+118 && my>p.y-6 && my<p.y+40) hit = i; });
  return hit;
}
function pmpDraw(){
  PMP_PHONE.forEach((_,i)=>{ const e = document.getElementById('pmp-b'+i); if(e){
    e.style.background = i===_pmp.ph ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_pmp.ph ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('pmp-canvas', 240); if(!c) return;
  const {x, w, h} = c;
  PMP_E.forEach(([a, b])=>{
    const pa = pmpPt(PMP_N[a], w, h), pb = pmpPt(PMP_N[b], w, h);
    const on = _pmp.hot===a || _pmp.hot===b;
    x.strokeStyle = on ? MTC.a1 : 'rgba(23,27,52,0.16)';
    x.lineWidth = on ? 1.8 : 1;
    x.beginPath(); x.moveTo(pa.x+110, pa.y+17);
    x.bezierCurveTo(pa.x+134, pa.y+17, pb.x-24, pb.y+17, pb.x-3, pb.y+17);
    x.stroke();
    x.beginPath(); x.moveTo(pb.x-3, pb.y+17); x.lineTo(pb.x-10, pb.y+13); x.lineTo(pb.x-10, pb.y+21); x.closePath();
    x.fillStyle = on ? MTC.a1 : 'rgba(23,27,52,0.16)'; x.fill();
  });
  PMP_N.forEach((nd, i)=>{
    const p = pmpPt(nd, w, h), on = _pmp.hot===i;
    const main = i<=4;
    mtChip(x, p.x, p.y, 110, 34, on ? 'rgba(79,70,229,0.18)' : (main?'rgba(79,70,229,0.06)':'rgba(23,27,52,0.04)'),
           on ? MTC.a1 : MTC.line2, null);
    mtTxt(x, nd.lab, p.x+55, p.y+13, {size:9.5, col:MTC.text, align:'center', weight: on?'700':''});
    mtTxt(x, nd.sub, p.x+55, p.y+26, {size:8, col: on?MTC.a1:MTC.muted, align:'center'});
  });
  const P = PMP_PHONE[_pmp.ph];
  mtSet('pmp-cap', _pmp.hot !== null
    ? 'Click to open <b>' + PMP_N[_pmp.hot].lab + '</b> (' + PMP_N[_pmp.hot].sub + ').'
    : `<b>${P.lab}</b> at each stage \u2014 <b style="color:var(--accent)">articulation:</b> ${P.art}. <b style="color:var(--accent)">acoustics:</b> ${P.ac}. <b style="color:var(--accent)">spectrum:</b> ${P.sp}. <b style="color:var(--accent)">features:</b> ${P.ft}.`);
}

/* ── SECTION OPENER ───────────────────────────────────────── */
function openPHSec(id){
  const pg = PH_PAGES[id];
  if(!pg) return;
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if(!sv || !sb) return;
  const sec = PH_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if(crumb && sec) crumb.innerHTML = 'Phonetics &amp; Speech Feature Extraction <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  renderMath(sb);
  mcSectionDelay(()=>{
    if(id==='phwrite'){ pbrBuild(); popBuild(); pcpBuild(); }
    if(id==='phorgan') pvoBuild();
    if(id==='phplace') pcsDraw();
    if(id==='phman'){ pobDraw(); pgmBuild(); }
    if(id==='phvow'){ pvsBuild(); pdtBuild(); }
    if(id==='physyl'){ psyBuild(); ppgBuild(); }
    if(id==='phpros') ptrBuild();
    if(id==='phprom'){ pplBuild(); pacBuild(); prdDraw(); }
    if(id==='phbreak') pbkBuild();
    if(id==='phtune') pcdBuild();
    if(id==='phtobi') ptbBuild();
    if(id==='phwave') pwwDraw();
    if(id==='phdig'){ psgDraw(); pqzDraw(); pmuDraw(); }
    if(id==='phperc'){ pf0Build(); prmBuild(); pmlDraw(); }
    if(id==='phread') pwdBuild();
    if(id==='phfour'){ pfaDraw(); pcyBuild(); pssDraw(); pfmBuild(); }
    if(id==='phsrc') psfBuild();
    if(id==='phpipe') ppcBuild();
    if(id==='phframe'){ pslDraw(); pwnBuild(); }
    if(id==='phdft'){ peuDraw(); pdfBuild(); pffDraw(); }
    if(id==='phmel'){ pfbBuild(); plgBuild(); }
    if(id==='phcep'){ pclBuild(); pcqDraw(); pdcBuild(); pvaBuild(); }
    if(id==='phmap') pmpBuild();
  }, 120);
  sv.onscroll = () => {
    const hh = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if(bar) bar.style.width = (hh>0?(sv.scrollTop/hh)*100:0)+'%';
  };
}
