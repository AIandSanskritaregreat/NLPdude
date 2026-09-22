/* ══════════════════════════════════════════════════════════════
   AUTOMATIC SPEECH RECOGNITION
   ══════════════════════════════════════════════════════════════ */

const ASR_SEC = [
  {id:'asrhard',  num:'15.1',   title:'What Makes One Recognition Task Harder Than Another', icon:'\u25D4', desc:'Four independent axes of difficulty, and the corpora that sit at each point along them.', tags:['WER','corpora']},
  {id:'asrconv',  num:'15.2',   title:'Sliding a Kernel Along the Signal', icon:'\u2337', desc:'Convolution arithmetic: kernel width, padding, stride, output length, and receptive field.', tags:['convolution','receptive field']},
  {id:'asrencdec',num:'15.3',   title:'Encoder-Decoder Recognizers', icon:'\u2192', desc:'Two clocks running at different rates, and the architecture that reconciles them.', tags:['seq2seq','frame rate']},
  {id:'asrsub',   num:'15.3.1', title:'Compressing the Frame Sequence Before the Encoder', icon:'\u25BD', desc:'Three subsampling strategies on the same input, with the real Whisper and HuBERT front ends.', tags:['subsampling','strided conv']},
  {id:'asrdec',   num:'15.3.2', title:'Decoding One Character at a Time', icon:'\u229E', desc:'Where Q, K and V come from, why the attention matrix is rectangular, and how length bias is undone.', tags:['cross-attention','rescoring']},
  {id:'asrtrain', num:'15.3.3', title:'Training with Cross-Entropy and Teacher Forcing', icon:'\u2016', desc:'Gold history on one side, self-fed history on the other, and one bad character between them.', tags:['teacher forcing','scheduled sampling']},
  {id:'asrssl',   num:'15.4',   title:'Learning Speech Units Without Transcripts', icon:'\u25CC', desc:'What a transcript budget buys, and where self-supervision stops paying for itself.', tags:['self-supervision','masking']},
  {id:'asrpass',  num:'15.4.1', title:'One Forward Pass Through a Masked Speech Encoder', icon:'\u21E5', desc:'Raw samples to conv stack to transformer to a cosine fan over a hundred class embeddings.', tags:['HuBERT','temperature']},
  {id:'asrtgt',   num:'15.4.2', title:'Bootstrapping Targets, Then Replacing Them', icon:'\u21BB', desc:'MFCC clusters train the first model, the first model produces better clusters, repeat once.', tags:['two-stage','NMI']},
  {id:'asrkm',    num:'15.4.3', title:'Turning Vectors into Discrete Symbols with k-Means', icon:'\u25CE', desc:'Assignment, re-estimation, and a proof that the distortion can never go up.', tags:['k-means','distortion']},
  {id:'asrctc',   num:'15.5',   title:'Frame-Synchronous Output and the Blank Symbol', icon:'\u2205', desc:'Why collapsing repeats alone breaks on the word butter, and what one extra symbol repairs.', tags:['CTC','blank']},
  {id:'asrsum',   num:'15.5.1', title:'Summing over Alignments at Decode Time', icon:'\u2211', desc:'Eight alignments on screen, arithmetic done by hand, and best-path decoding getting it wrong.', tags:['marginalization','beam search']},
  {id:'asrfb',    num:'15.5.2', title:'The Forward-Backward Sum as a Loss', icon:'\u25A6', desc:'The alpha recursion filled cell by cell, with the skip arrow and the rule that governs it.', tags:['forward-backward','gradient']},
  {id:'asrjoint', num:'15.5.3', title:'Two Losses on One Encoder', icon:'\u2442', desc:'A frame-synchronous head and an autoregressive head disagreeing, and the score that arbitrates.', tags:['joint training','regularization']},
  {id:'asrrnnt',  num:'15.5.4', title:'Adding Output History Back for Streaming', icon:'\u21A6', desc:'One extra conditioning term turns CTC into a transducer that can emit before the audio ends.', tags:['RNN-T','latency']},
  {id:'asrwer',   num:'15.6',   title:'Counting Errors Against a Reference', icon:'\u229F', desc:'The edit-distance table and the three-row error strip shown to be the same object.', tags:['word error rate','alignment']},
  {id:'asrnorm',  num:'15.6.1', title:'Normalizing Text Before Scoring', icon:'\u2702', desc:'Five filter stages, and how much of a reported error rate is orthographic rather than acoustic.', tags:['normalization','comparability']},
  {id:'asrsig',   num:'15.6.2', title:'Deciding Whether a Difference Is Real', icon:'\u2696', desc:'Segment-level differences, a normal approximation, and the sample size it needs.', tags:['significance','MAPSSWE']},
  {id:'asrmap',   num:'15.7',   title:'Three Routes From Waveform to String', icon:'\u25C9', desc:'Encoder-decoder, CTC, and transducer drawn over one shared front end, with their trade-offs.', tags:['recap','architectures']},
  {id:'asrhist',  num:'15.8',   title:'How the Field Got Here', icon:'\u231A', desc:'Four parallel research tracks from 1952 to 2018, and the compute that gated each one.', tags:['history','timeline']},
  {id:'asrex',    num:'15.9',   title:'Test Yourself', icon:'\u270E', desc:'Convolution arithmetic, alignment counting, error-rate scoring, and k-means done by hand.', tags:['exercises','practice']}
];

function buildASROverview(){
  const cards = ASR_SEC.map(s=>`
    <div class="sc-card" onclick="openASRSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Waveforms Into Words</div>
    <h1 class="lesson-h1">Automatic Speech Recognition</h1>
    <p class="lesson-intro">The previous chapter ended with a feature vector: a short window of audio reduced to a few dozen numbers, computed once every ten milliseconds. This chapter takes that sequence and produces a string. The difficulty is that the two sequences run on different clocks. A three-second utterance is three hundred feature vectors and perhaps forty characters, the mapping between them is not given, and nothing in the audio marks where one word ends and the next begins. Three architectures solve this in three different ways: one lets a decoder attend freely over the encoder, one forces a decision at every frame and marginalizes over the alignments that this produces, and one adds output history back to the second so it can emit while the speaker is still talking. All three are built here, along with the loss functions that train them and the metric that ranks them.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">Recognition difficulty varies over vocabulary size, speaking situation, channel, and speaker match; reported error rates are only comparable when all four are held fixed, along with the text normalizer.</div>
        <div class="ch-sum-item">A convolution slides a small weight vector along the signal; output length is governed by input length, kernel width, padding and stride, and a stack of strided convolutions has a receptive field that grows as the product of the strides below it.</div>
        <div class="ch-sum-item">Encoder-decoder recognizers subsample the frame sequence by a factor of two to four, encode it, and generate output symbols autoregressively, with cross-attention supplying a soft alignment.</div>
        <div class="ch-sum-item">Self-supervised models learn from untranscribed audio by masking spans and predicting discrete units for the masked frames, where the units come from k-means over features and are refined once using the model's own representations.</div>
        <div class="ch-sum-item">CTC emits one symbol per frame from an alphabet extended with a blank, collapses the result by merging repeats and then stripping blanks, and trains by summing the probability of every alignment that collapses to the target.</div>
        <div class="ch-sum-item">The forward-backward recursion computes that sum in time proportional to the product of sequence lengths rather than exponentially, and its posterior occupancies give the gradient directly.</div>
        <div class="ch-sum-item">Word error rate is the total of insertions, substitutions and deletions divided by reference length; it is unbounded above, and differences between systems need a significance test before they mean anything.</div>
      </div>
    </div>`;
}

const ASR_PAGES = {};

/* ══ 15.1 WHAT MAKES A TASK HARD ══════════════════════════ */
ASR_PAGES.asrhard = `
<div class="lesson-chapter-label">Section 15.1</div>
<h1 class="lesson-h1">What Makes One Recognition Task Harder Than Another</h1>
<p class="lesson-intro">Speech-recognition error rates depend strongly on the recording conditions and task. Speaker variation, noise, vocabulary, and speaking style can all change the result. Compare those factors before comparing headline scores.</p>

<h2 class="lesson-h2">The Metric First</h2>
<p class="lesson-p">Everything below is measured in <strong>word error rate</strong>, the count of edits needed to turn the recognizer output into the reference transcript, divided by the length of that reference. Section 15.6 derives it properly; for now the definition is enough:</p>
<div class="lesson-math">\\[\\mathrm{WER} = 100 \\times \\frac{I + S + D}{N_{\\mathrm{ref}}}, \\qquad \\mathrm{CER} = 100 \\times \\frac{I_c + S_c + D_c}{N_{\\mathrm{ref}}^{\\,\\mathrm{chars}}}\\]</div>
<p class="lesson-p">The character variant matters because the word is not a portable unit. Mandarin is written without spaces, so word boundaries are the output of a segmenter rather than a property of the text, and a Mandarin word error rate is a statement about the segmenter as much as the recognizer. Character error rate sidesteps this, which is why Mandarin corpora report it. The consequence is that a Mandarin CER of four and an English WER of four are not the same claim, and neither one is bigger than the other in any meaningful sense.</p>

<h2 class="lesson-h2">Four Independent Axes</h2>
<p class="lesson-p">Move each slider and watch the transcript degrade. The error rate on the right is the product of four multipliers applied to a floor rate, which is roughly how these factors behave empirically: doubling the difficulty of the channel does not add ten points, it scales whatever the other three axes have already produced.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Difficulty Dial</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="sdd-ctrl"></div>
    <canvas id="sdd-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="sdd-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Vocabulary size is the axis that has moved the most historically and matters the least now. A digit recognizer picks among eleven words and can afford to be crude; an open-vocabulary system has no fixed word list at all, since subword units let it emit strings it has never seen. The other three axes have not been solved. Conversational speech is full of disfluency, overlap, and reduction that read speech does not contain. A far-field microphone in a kitchen receives the direct signal plus its reflections plus the extractor fan. And a speaker whose accent, age or speaking style is absent from training data is, from the model's point of view, a different language.</p>

<h2 class="lesson-h2">Where the Standard Corpora Sit</h2>
<p class="lesson-p">Benchmarks are positions on those axes, which is why the choice of benchmark is a claim about what problem is being solved. The shelf below places the common ones on the same error-rate axis; click a card for its coordinates.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Corpus Shelf</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="scs-ctrl"></div>
    <canvas id="scs-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="scs-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">How the Clean and Other Splits Are Defined</h2>
<p class="lesson-p">LibriSpeech reports two numbers because it was deliberately split into an easy half and a hard half, and the split is a rank statistic rather than a judgement. A recognizer is trained on held-out data and run over every speaker; each speaker <span style="white-space:nowrap">\\(m\\)</span> gets a per-speaker error rate <span style="white-space:nowrap">\\(w_m\\)</span>. Sort them:</p>
<div class="lesson-math">\\[w_1 \\le w_2 \\le \\cdots \\le w_M, \\qquad \\text{cut at } w_{\\lceil M/2 \\rceil}\\]</div>
<p class="lesson-p">Speakers below the median go to <em>clean</em>, speakers above it go to <em>other</em>. Nothing about the recording conditions is measured directly. The split is defined by how hard a particular recognizer found each speaker, which means the labels encode that recognizer's weaknesses along with any genuine acoustic difficulty. Reporting a number on <em>clean</em> alone is therefore reporting performance on the half of the speaker population that an earlier system already handled.</p>

<div class="quiz-block" id="qas-hd"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is a Mandarin character error rate of 4% not comparable to an English word error rate of 4%?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-hd','Correct. The denominators count different units, and Mandarin word boundaries are produced by a segmenter rather than being present in the text, so word-level scoring would measure the segmenter too.')">The denominators count different units, and Mandarin word boundaries come from a segmenter rather than the text</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-hd','Tonal contrasts do affect difficulty, but the incomparability here is about the unit being counted, not the phonology.')">Mandarin is tonal, so its errors are inherently more severe</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-hd','Both metrics use the same edit-distance machinery; only the unit changes.')">Character error rate uses a different alignment algorithm from word error rate</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-hd','Sampling rate varies by corpus, not by language, and it is a separate axis entirely.')">Mandarin corpora are always recorded at a lower sampling rate</button>
</div><div class="quiz-explain" id="qas-hd-explain"></div></div>`;

/* ── The Difficulty Dial ──────────────────────────────────── */
const SDD_AX = [
  {key:'vocab', lab:'vocabulary', opts:[
    {n:'digits (11 words)', m:0.34}, {n:'1k command set', m:0.62},
    {n:'10k domain', m:0.85}, {n:'open vocabulary', m:1.00}]},
  {key:'sit', lab:'speaking situation', opts:[
    {n:'read aloud', m:1.00}, {n:'dictated', m:1.35},
    {n:'two-way conversation', m:2.40}, {n:'multi-party meeting', m:3.10}]},
  {key:'chan', lab:'channel', opts:[
    {n:'close-talking mic', m:1.00}, {n:'laptop mic', m:1.70},
    {n:'far-field, kitchen', m:3.30}]},
  {key:'spk', lab:'speaker match', opts:[
    {n:'in-domain accent', m:1.00}, {n:'unseen variety', m:1.95},
    {n:'child speech', m:2.90}]}
];
const SDD_BASE = 1.35;
const SDD_SENT = ['the','kettle','is','boiling','and','the','toast','is','nearly','done','so','call','everyone','in'];
const SDD_ERR  = {kettle:'cattle', boiling:'spoiling', toast:'ghost', nearly:'merely', done:'down',
                  call:'core', everyone:'every one', the:'a', and:'in', is:'as', so:'saw', in:'and'};
let _sdd = {vocab:3, sit:2, chan:1, spk:1};
function sddBuild(){
  const host = document.getElementById('sdd-ctrl');
  if(host) host.innerHTML = SDD_AX.map(a=>
    '<div style="min-width:150px;flex:1"><div style="' + MTLBL + ';margin-bottom:4px">' + a.lab + '</div>' +
    '<input id="sdd-' + a.key + '" type="range" min="0" max="' + (a.opts.length-1) + '" step="1" value="' + _sdd[a.key] +
    '" oninput="sddUpd()" style="width:100%;accent-color:var(--accent)">' +
    '<div id="sdd-' + a.key + '-v" style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:2px"></div></div>').join('');
  sddUpd();
}
function sddUpd(){
  SDD_AX.forEach(a=>{
    const el = document.getElementById('sdd-' + a.key);
    if(el) _sdd[a.key] = Math.max(0, Math.min(a.opts.length-1, Math.round(+el.value)));
    mtSet('sdd-' + a.key + '-v', a.opts[_sdd[a.key]].n);
  });
  sddDraw();
}
function sddRate(){
  let r = SDD_BASE;
  SDD_AX.forEach(a=>{ r *= a.opts[_sdd[a.key]].m; });
  return Math.max(0.4, Math.min(58, r));
}
function sddDraw(){
  const c = mtCtx('sdd-canvas', 288); if(!c) return;
  const {x, w} = c;
  const rate = sddRate();
  const L = 130, R = 46, PW = w - L - R;
  const lo = Math.log10(0.5), hi = Math.log10(60);
  const px = v => L + PW * (Math.log10(Math.max(0.5, v)) - lo) / (hi - lo);
  // axis
  const ay = 196;
  x.strokeStyle = MTC.line2; x.lineWidth = 1.2;
  x.beginPath(); x.moveTo(L, ay); x.lineTo(L + PW, ay); x.stroke();
  [0.5, 1, 2, 5, 10, 20, 50].forEach(t=>{
    const tx = px(t);
    x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(tx, ay-5); x.lineTo(tx, ay+5); x.stroke();
    mtTxt(x, t + '%', tx, ay + 16, {size:8.5, col:MTC.muted, align:'center'});
  });
  mtTxt(x, 'word error rate, log scale', L, ay + 34, {size:8.5, col:MTC.muted});
  // per-axis contribution markers
  let running = SDD_BASE;
  const cols = [MTC.a1, MTC.a5, MTC.a2, MTC.a4];
  SDD_AX.forEach((a, i)=>{
    const before = running;
    running *= a.opts[_sdd[a.key]].m;
    const y = 60 + i * 30;
    mtTxt(x, a.lab, L - 10, y, {size:9, col:MTC.muted, align:'right'});
    const x0 = px(before), x1 = px(Math.min(58, running));
    x.strokeStyle = cols[i]; x.lineWidth = 3.5; x.globalAlpha = 0.55;
    x.beginPath(); x.moveTo(x0, y); x.lineTo(Math.max(x0 + 1, x1), y); x.stroke();
    x.globalAlpha = 1;
    x.fillStyle = cols[i];
    x.beginPath(); x.arc(x1, y, 3.6, 0, 7); x.fill();
    mtTxt(x, '\u00d7' + a.opts[_sdd[a.key]].m.toFixed(2), Math.max(x0 + 1, x1) + 8, y, {size:8.5, col:cols[i]});
  });
  // the vertical drop line to the axis
  const fx = px(rate);
  x.setLineDash([3,3]); x.strokeStyle = MTC.a2; x.lineWidth = 1.2;
  x.beginPath(); x.moveTo(fx, 54); x.lineTo(fx, ay); x.stroke(); x.setLineDash([]);
  mtChip(x, fx - 30, 24, 60, 20, 'rgba(159,18,57,0.18)', MTC.a2, rate.toFixed(1) + '%', MTC.a2, 10);
  // the sentence, corrupted at the current rate
  const nErr = Math.min(SDD_SENT.length, Math.round(SDD_SENT.length * rate / 100));
  const order = [1,3,6,9,12,8,11,4,0,7,2,13,5,10];
  const bad = {}; for(let i=0;i<nErr;i++) bad[order[i % order.length]] = 1;
  let cx = L - 118, cy = 246;
  mtTxt(x, 'output', L - 118, 228, {size:8.5, col:MTC.muted});
  x.save(); x.font = '11px ' + MTC.mono;
  SDD_SENT.forEach((wd, i)=>{
    const shown = bad[i] ? (SDD_ERR[wd] || wd.split('').reverse().join('')) : wd;
    const tw = x.measureText(shown).width;
    if(cx + tw > w - 12){ cx = L - 118; cy += 20; }
    x.fillStyle = bad[i] ? MTC.a2 : MTC.text;
    x.fillText(shown, cx, cy);
    if(bad[i]){
      x.strokeStyle = MTC.a2; x.lineWidth = 1;
      x.beginPath(); x.moveTo(cx, cy + 5); x.lineTo(cx + tw, cy + 5); x.stroke();
    }
    cx += tw + 8;
  });
  x.restore();
  mtSet('sdd-cap', 'Floor rate ' + SDD_BASE.toFixed(2) + '% multiplied by ' +
    SDD_AX.map(a=>a.opts[_sdd[a.key]].m.toFixed(2)).join(' \u00d7 ') + ' gives <b style="color:#9F1239">' +
    rate.toFixed(1) + '%</b>, so ' + nErr + ' of ' + SDD_SENT.length +
    ' words come out wrong. The axes compose multiplicatively: a hard channel scales whatever difficulty the other three have already produced rather than adding a fixed penalty.');
}

/* ── The Corpus Shelf ─────────────────────────────────────── */
const SCS_D = [
  {n:'LibriSpeech clean', h:960,  sr:16, sp:2484, wer:2.0,  cer:null, sit:'read audiobooks', note:'The easy half of a median split on per-speaker error rate. Read speech, close mic, wide speaker coverage.'},
  {n:'LibriSpeech other', h:960,  sr:16, sp:2484, wer:4.6,  cer:null, sit:'read audiobooks', note:'The same recordings, the half of speakers a held-out recognizer found harder. Same channel, same task, double the errors.'},
  {n:'Switchboard',       h:300,  sr:8,  sp:543,  wer:5.5,  cer:null, sit:'telephone conversation', note:'Two strangers on the telephone discussing an assigned topic. Narrowband, spontaneous, heavily disfluent.'},
  {n:'CALLHOME',          h:15,   sr:8,  sp:240,  wer:13.0, cer:null, sit:'telephone, familiar', note:'Calls between family and friends. Same channel as Switchboard, far more reduction and shared context, more than double the error.'},
  {n:'AMI (headset)',     h:100,  sr:16, sp:189,  wer:13.5, cer:null, sit:'meetings', note:'Multi-party meetings recorded on individual headsets. Overlap and interruption without the channel problem.'},
  {n:'AMI (array)',       h:100,  sr:16, sp:189,  wer:28.0, cer:null, sit:'meetings, far-field', note:'The identical meetings from a distant microphone array. Only the channel changed and the error rate doubled.'},
  {n:'CORAAL',            h:130,  sr:16, sp:220,  wer:21.0, cer:null, sit:'sociolinguistic interview', note:'Recorded interviews with speakers of African American Language. High error rates on systems trained mostly on mainstream varieties.'},
  {n:'CHiME-6',           h:50,   sr:16, sp:32,   wer:32.0, cer:null, sit:'dinner party, far-field', note:'Real dinner parties, distant arrays, overlapping speech, kitchen noise. Every axis set to hard at once.'},
  {n:'AISHELL-1',         h:170,  sr:16, sp:400,  wer:null, cer:4.5,  sit:'read Mandarin', note:'Read Mandarin, close mic. Scored per character because word boundaries would come from a segmenter.'},
  {n:'HKUST',             h:200,  sr:8,  sp:2100, wer:null, cer:21.0, sit:'Mandarin telephone', note:'Mandarin telephone conversation. Same character metric, conversational rather than read.'},
  {n:'Common Voice',      h:2500, sr:48, sp:9000, wer:14.0, cer:null, sit:'crowdsourced read', note:'Volunteers reading prompts on their own hardware. Enormous speaker and channel diversity, uneven audio quality.'},
  {n:'FLEURS',            h:1400, sr:16, sp:1200, wer:12.0, cer:null, sit:'read, 102 languages', note:'Parallel read speech across 102 languages, built for measuring how far coverage extends beyond English.'}
];
let _scs = {metric:'wer', sel:0};
function scsBuild(){
  _scs = {metric:'wer', sel:0};
  const host = document.getElementById('scs-ctrl');
  if(host) host.innerHTML =
    '<span style="' + MTLBL + '">scored in</span>' +
    '<button style="' + MTBTN + '" id="scs-mw" onclick="scsMetric(\'wer\')">word error rate</button>' +
    '<button style="' + MTBTN + '" id="scs-mc" onclick="scsMetric(\'cer\')">character error rate</button>';
  scsMetric('wer');
}
function scsMetric(m){
  _scs.metric = m;
  [['scs-mw','wer'],['scs-mc','cer']].forEach(([id,k])=>{
    const b = document.getElementById(id); if(!b) return;
    b.style.background = k===m ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = k===m ? '#FAFBFF' : 'var(--muted)';
  });
  scsDraw();
}
function scsVal(d){ return _scs.metric === 'wer' ? d.wer : d.cer; }
function scsDraw(){
  const c = mtCtx('scs-canvas', 330); if(!c) return;
  const {x, w, cv} = c;
  const L = 20, R = 20, PW = w - L - R;
  const lo = Math.log10(1), hi = Math.log10(40);
  const px = v => L + PW * (Math.log10(Math.max(1, v)) - lo) / (hi - lo);
  const ay = 66;
  x.strokeStyle = MTC.line2; x.lineWidth = 1.2;
  x.beginPath(); x.moveTo(L, ay); x.lineTo(L + PW, ay); x.stroke();
  [1,2,5,10,20,40].forEach(t=>{
    const tx = px(t);
    x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(tx, ay-4); x.lineTo(tx, ay+4); x.stroke();
    mtTxt(x, t + '%', tx, ay + 15, {size:8.5, col:MTC.muted, align:'center'});
  });
  mtTxt(x, _scs.metric === 'wer' ? 'word error rate' : 'character error rate',
    L, ay - 34, {size:9, col:MTC.text, weight:'700'});
  mtTxt(x, _scs.metric === 'wer'
    ? 'the two Mandarin corpora drop out: they are not scored this way'
    : 'only corpora that report a character metric appear',
    L, ay - 18, {size:8.5, col:MTC.muted});
  // markers on the axis
  _scs.hit = [];
  SCS_D.forEach((d, i)=>{
    const v = scsVal(d); if(v == null) return;
    const tx = px(v), sel = i === _scs.sel;
    x.fillStyle = sel ? MTC.a2 : MTC.a1;
    x.beginPath(); x.arc(tx, ay, sel ? 5.5 : 3.6, 0, 7); x.fill();
    if(sel){ x.strokeStyle = MTC.a2; x.lineWidth = 1;
      x.beginPath(); x.moveTo(tx, ay - 12); x.lineTo(tx, ay - 4); x.stroke(); }
  });
  // cards
  const cols = 4, cw = (PW - 9 * (cols - 1)) / cols, ch = 52;
  SCS_D.forEach((d, i)=>{
    const r = Math.floor(i / cols), cc = i % cols;
    const bx = L + cc * (cw + 9), by = 96 + r * (ch + 8);
    const v = scsVal(d), off = v == null, sel = i === _scs.sel;
    _scs.hit.push({x:bx, y:by, w:cw, h:ch, i:i});
    mtRR(x, bx, by, cw, ch, 7);
    x.fillStyle = off ? 'rgba(23,27,52,0.03)' : (sel ? 'rgba(159,18,57,0.14)' : 'rgba(79,70,229,0.07)');
    x.fill();
    x.strokeStyle = sel ? MTC.a2 : MTC.line; x.lineWidth = 1; x.stroke();
    x.save(); x.globalAlpha = off ? 0.35 : 1;
    mtTxt(x, d.n, bx + 8, by + 14, {size:9, col:sel ? MTC.a2 : MTC.text, weight:'700'});
    mtTxt(x, d.h + ' h \u00b7 ' + d.sr + ' kHz', bx + 8, by + 28, {size:8, col:MTC.muted});
    mtTxt(x, d.sp + ' speakers', bx + 8, by + 40, {size:8, col:MTC.muted});
    mtTxt(x, off ? '\u2014' : v.toFixed(1) + '%', bx + cw - 8, by + 14,
      {size:10, col: off ? MTC.muted : (sel ? MTC.a2 : MTC.a1), align:'right', weight:'700'});
    x.restore();
  });
  if(cv && !cv._scsBound){
    cv._scsBound = 1;
    cv.addEventListener('click', ev=>{
      const r = cv.getBoundingClientRect();
      const mx = ev.clientX - r.left, my = ev.clientY - r.top;
      (_scs.hit || []).forEach(h=>{ if(mx>=h.x && mx<=h.x+h.w && my>=h.y && my<=h.y+h.h){ _scs.sel = h.i; scsDraw(); } });
    });
  }
  const d = SCS_D[_scs.sel], v = scsVal(d);
  mtSet('scs-cap', '<b style="color:#9F1239">' + d.n + '</b> \u00b7 ' + d.sit + ' \u00b7 ' + d.h +
    ' hours at ' + d.sr + ' kHz from ' + d.sp + ' speakers. ' +
    (v == null ? 'Not scored in this metric.' : 'Reported around ' + v.toFixed(1) + '%.') + ' ' + d.note);
}

/* ══ 15.2 CONVOLUTION ═════════════════════════════════════ */
ASR_PAGES.asrconv = `
<div class="lesson-chapter-label">Section 15.2</div>
<h1 class="lesson-h1">Sliding a Kernel Along the Signal</h1>
<p class="lesson-intro">Convolution applies shared weights to successive windows of an input. Kernel size, stride, and padding determine the output shape. Work through them here before using convolution to shorten a speech sequence.</p>

<h2 class="lesson-h2">Building the Operation Up From Width One</h2>
<p class="lesson-p">Start with the degenerate case. A kernel of width one has a single weight \\(w_0\\), and applying it to an input \\(\\mathbf{x}\\) of length \\(t\\) scales every position independently:</p>
<div class="lesson-math">\\[z_j = x_j w_0, \\qquad \\forall j : 1 \\le j \\le t\\]</div>
<p class="lesson-p">Nothing is combined, so nothing about the sequence has been used. Widen the kernel to an odd width \\(k = 2p+1\\) so that it has a well-defined center, index the weights from \\(-p\\) to \\(p\\), and each output now mixes a neighbourhood:</p>
<div class="lesson-math">\\[z_j = \\sum_{i=-p}^{p} x_{j+i}\\, w_{i+p}\\]</div>
<p class="lesson-p">Strictly, this is <em>cross-correlation</em>. True convolution reverses the kernel before the sum. The distinction is real in signal processing and irrelevant here: the weights are learned, so a network that wants the reversed kernel simply learns it reversed, and every deep learning library calls the unreversed version a convolution. The toggle below flips \\(\\mathbf{w}\\) so you can confirm that the only consequence is a mirrored weight vector.</p>
<p class="lesson-p">Speech features are not scalars. A frame is a vector of \\(C_i\\) channels, typically 80 log-mel bins, so the kernel carries one weight vector per channel and the outputs are summed across channels:</p>
<div class="lesson-math">\\[\\mathbf{z} = \\sum_{c=1}^{C_i} \\mathbf{x}_c * \\mathbf{w}_c\\]</div>

<h2 class="lesson-h2">Output Length Is Arithmetic, Not a Guess</h2>
<p class="lesson-p">Padding \\(p\\) adds zeros to both ends; stride \\(s\\) moves the kernel by more than one position per step. Together with the kernel width they determine the output length exactly:</p>
<div class="lesson-math">\\[n = \\left\\lfloor \\frac{t + 2p - k}{s} \\right\\rfloor + 1\\]</div>
<p class="lesson-p">Setting \\(s = 1\\) and \\(p = (k-1)/2\\) gives \\(n = t\\), which is the configuration used when a layer should reshape the representation without changing the sequence length. Any other combination changes it, and over-striding a short input drives the numerator negative, which is where pipelines break.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Kernel Walk</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="skw-ctrl"></div>
    <canvas id="skw-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="skw-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">A Kernel Is a Similarity Detector</h2>
<p class="lesson-p">The sum \\(\\sum_i x_{j+i} w_{i+p}\\) is a dot product between the kernel and the window of signal it currently covers. Dot products are large when two vectors point the same way, so the output is large exactly where the local shape of the signal resembles the kernel. Tune the three weights below until the output spikes on the rising ramp planted in the signal, and the claim stops being an assertion.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Pattern Hunt</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="skd-ctrl"></div>
    <canvas id="skd-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="skd-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Parameters and Reach</h2>
<p class="lesson-p">A layer mapping \\(C_i\\) input channels to \\(C_o\\) output channels with width \\(k\\) holds a weight tensor of shape \\([C_o, C_i, k]\\) plus one bias per output channel, giving</p>
<div class="lesson-math">\\[|\\theta| = C_o C_i k + C_o\\]</div>
<p class="lesson-p">The reach of a stack matters more than the reach of any one layer. A unit in layer \\(L\\) depends on some window of the original input, and that window, the <strong>receptive field</strong>, grows by each layer's width scaled by the product of all strides beneath it:</p>
<div class="lesson-math">\\[R_L = 1 + \\sum_{\\ell=1}^{L} (k_\\ell - 1) \\prod_{j &lt; \\ell} s_j\\]</div>
<p class="lesson-p">The product term is why strided layers early in a stack buy so much reach. A stride of 5 in the first layer multiplies the contribution of every later layer by five, which is exactly how a seven-layer stack over raw 16 kHz samples reaches 25 milliseconds of audio with kernels no wider than ten.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Receptive Field Stack</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="skr-ctrl"></div>
    <canvas id="skr-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="skr-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qas-cv"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">An input of length 100 passes through a convolution with \\(k=5\\), \\(p=2\\), \\(s=2\\). What is the output length?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-cv','Correct. (100 + 4 - 5) / 2 = 49.5, floored to 49, plus 1 gives 50.')">50</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-cv','That would be the answer if padding were ignored and the division came out even; the floor and the plus one both matter.')">49</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-cv','A stride of 2 halves the length; only s = 1 with p = (k-1)/2 preserves it.')">100</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-cv','Padding adds 2p = 4 to the effective input length, not 2p per side beyond that.')">51</button>
</div><div class="quiz-explain" id="qas-cv-explain"></div></div>`;

/* ── The Kernel Walk ──────────────────────────────────────── */
const SKW_X = [2,3,5,4,2,1,1,2,4,7,9,8,5,3,2,2,3,3,2,1];
let _skw = {k:3, p:1, s:1, flip:false, pos:0};
function skwBuild(){
  _skw = {k:3, p:1, s:1, flip:false, pos:0};
  const host = document.getElementById('skw-ctrl');
  if(host) host.innerHTML =
    skwSl('k','kernel width k',1,9,2,3) + skwSl('p','padding p',0,5,1,1) + skwSl('s','stride s',1,5,1,1) +
    '<button style="' + MTBTN + '" id="skw-f" onclick="skwFlip()">flip w</button>' +
    '<button style="' + MTBTN + '" onclick="skwStep()">step \u203A</button>';
  skwUpd();
}
function skwSl(key,lab,min,max,step,val){
  return '<div style="min-width:120px"><div style="' + MTLBL + ';margin-bottom:3px">' + lab +
    ' <b id="skw-' + key + '-v" style="color:var(--accent)">' + val + '</b></div>' +
    '<input id="skw-' + key + '" type="range" min="' + min + '" max="' + max + '" step="' + step +
    '" value="' + val + '" oninput="skwUpd()" style="width:100%;accent-color:var(--accent)"></div>';
}
function skwFlip(){ _skw.flip = !_skw.flip; skwDraw(); }
function skwStep(){ _skw.pos++; skwDraw(); }
function skwUpd(){
  ['k','p','s'].forEach(key=>{
    const el = document.getElementById('skw-' + key);
    if(el) _skw[key] = Math.max(0, Math.round(+el.value));
    mtSet('skw-' + key + '-v', _skw[key]);
  });
  if(_skw.k < 1) _skw.k = 1;
  _skw.pos = 0;
  skwDraw();
}
function skwOutLen(t,k,p,s){ return Math.floor((t + 2*p - k) / s) + 1; }
function skwDraw(){
  const c = mtCtx('skw-canvas', 300); if(!c) return;
  const {x, w} = c;
  const t = SKW_X.length, k = _skw.k, p = _skw.p, s = _skw.s;
  const n = skwOutLen(t, k, p, s);
  const bad = n < 1;
  const fb = document.getElementById('skw-f');
  if(fb){ fb.style.background = _skw.flip ? 'var(--accent2)' : 'var(--surface2)';
          fb.style.color = _skw.flip ? '#FAFBFF' : 'var(--muted)'; }
  const total = t + 2*p;
  const L = 34, cw = Math.min(26, (w - L - 20) / total), gap = 2;
  const cellX = i => L + i * (cw + gap);
  // padded input row
  mtTxt(x, 'input', 6, 42, {size:8.5, col:MTC.muted});
  const padded = [];
  for(let i=0;i<p;i++) padded.push(null);
  SKW_X.forEach(v=>padded.push(v));
  for(let i=0;i<p;i++) padded.push(null);
  const pos = bad ? 0 : (_skw.pos % Math.max(1,n));
  const winStart = pos * s;
  padded.forEach((v, i)=>{
    const inWin = i >= winStart && i < winStart + k;
    const isPad = v === null;
    mtChip(x, cellX(i), 30, cw, 24,
      isPad ? 'rgba(23,27,52,0.04)' : (inWin ? 'rgba(79,70,229,0.28)' : 'rgba(79,70,229,0.08)'),
      inWin ? MTC.a1 : MTC.line, isPad ? '0' : String(v),
      isPad ? MTC.muted : MTC.text, 9.5);
  });
  // kernel weights, drawn under the current window
  const wts = [];
  for(let i=0;i<k;i++) wts.push(((i - (k-1)/2) * 0.5).toFixed(1));
  const shown = _skw.flip ? wts.slice().reverse() : wts;
  mtTxt(x, _skw.flip ? 'w reversed' : 'w', 6, 78, {size:8.5, col: _skw.flip ? MTC.a2 : MTC.muted});
  for(let i=0;i<k;i++){
    mtChip(x, cellX(winStart + i), 66, cw, 24, 'rgba(165,104,14,0.20)', MTC.a5, shown[i], MTC.a5, 9);
  }
  // bracket from window to the output cell
  if(!bad){
    const bx0 = cellX(winStart), bx1 = cellX(winStart + k - 1) + cw;
    x.strokeStyle = MTC.a5; x.lineWidth = 1.2;
    x.beginPath(); x.moveTo((bx0+bx1)/2, 92); x.lineTo((bx0+bx1)/2, 108); x.stroke();
  }
  // output row
  mtTxt(x, 'output', 6, 132, {size:8.5, col:MTC.muted});
  const ocw = Math.min(26, (w - L - 20) / Math.max(1, n));
  for(let j=0;j<Math.max(0,n);j++){
    let acc = 0;
    for(let i=0;i<k;i++){
      const v = padded[j*s + i];
      acc += (v === null ? 0 : v) * (+shown[i]);
    }
    const on = j <= pos;
    mtChip(x, L + j * (ocw + gap), 120, ocw, 24,
      on ? (j === pos ? 'rgba(159,18,57,0.26)' : 'rgba(159,18,57,0.10)') : 'rgba(23,27,52,0.03)',
      j === pos ? MTC.a2 : MTC.line, on ? acc.toFixed(1) : '', MTC.text, 8.5);
  }
  // the length formula, live
  const num = t + 2*p - k;
  mtTxt(x, 'n = floor(( t + 2p \u2212 k ) / s) + 1', 34, 178, {size:10, col:MTC.muted});
  mtTxt(x, '  = floor(( ' + t + ' + ' + (2*p) + ' \u2212 ' + k + ' ) / ' + s + ') + 1  =  floor(' +
    (num/s).toFixed(2) + ') + 1  =  ' + n,
    34, 198, {size:10.5, col: bad ? MTC.a2 : MTC.a1, weight:'700'});
  const same = (s === 1 && 2*p === k - 1);
  mtTxt(x, same ? 'same-length configuration: s = 1 and p = (k\u22121)/2, so n = t' :
    (bad ? 'the numerator has gone negative: this configuration produces nothing' :
     'length changed from ' + t + ' to ' + n + ' (ratio ' + (t/n).toFixed(2) + ')'),
    34, 220, {size:9.5, col: bad ? MTC.a2 : (same ? MTC.a4 : MTC.muted)});
  // parameter count for a realistic channel setting
  const Ci = 80, Co = 512;
  mtTxt(x, 'with C\u1d62 = 80 log-mel bins and C\u2092 = 512: tensor [512, 80, ' + k + '], parameters 512\u00b780\u00b7' + k +
    ' + 512 = ' + (Co*Ci*k + Co).toLocaleString(),
    34, 246, {size:9, col:MTC.muted});
  mtSet('skw-cap', bad
    ? 'Kernel width ' + k + ' exceeds the padded input length ' + total + ', so no output position exists. Increase padding or narrow the kernel.'
    : 'The window covers padded positions ' + (winStart+1) + ' to ' + (winStart+k) + ' and produces output cell ' +
      (pos+1) + ' of ' + n + '. Press <b>step</b> to advance by the stride. Flipping <b>w</b> swaps cross-correlation for true convolution, which reverses the weight vector and changes nothing a trained network could not absorb.');
}

/* ── The Pattern Hunt ─────────────────────────────────────── */
const SKD_SIG = (function(){
  const a = [];
  for(let i=0;i<40;i++){
    let v = 0.5 + 0.25*Math.sin(i*0.9) + 0.12*Math.sin(i*2.3+1);
    if(i>=14 && i<=19) v = 0.15 + (i-14)*0.16;   // the planted rising ramp
    a.push(v);
  }
  return a;
})();
let _skd = {w:[0,0,0]};
function skdBuild(){
  _skd = {w:[0,0,0]};
  const host = document.getElementById('skd-ctrl');
  if(host) host.innerHTML =
    [0,1,2].map(i=>'<div style="min-width:110px"><div style="' + MTLBL + ';margin-bottom:3px">w<sub>' + i +
      '</sub> <b id="skd-w' + i + '-v" style="color:var(--accent)">0.0</b></div>' +
      '<input id="skd-w' + i + '" type="range" min="-1" max="1" step="0.1" value="0" oninput="skdUpd()" style="width:100%;accent-color:var(--accent)"></div>').join('') +
    '<button style="' + MTBTN + '" onclick="skdPreset(-1,0,1)">try \u22121, 0, 1</button>' +
    '<button style="' + MTBTN + '" onclick="skdPreset(0.33,0.34,0.33)">try averaging</button>';
  skdUpd();
}
function skdPreset(a,b,c){
  [a,b,c].forEach((v,i)=>{ const el = document.getElementById('skd-w'+i); if(el) el.value = v; });
  skdUpd();
}
function skdUpd(){
  [0,1,2].forEach(i=>{
    const el = document.getElementById('skd-w'+i);
    if(el) _skd.w[i] = +el.value;
    mtSet('skd-w'+i+'-v', _skd.w[i].toFixed(1));
  });
  skdDraw();
}
function skdDraw(){
  const c = mtCtx('skd-canvas', 268); if(!c) return;
  const {x, w} = c;
  const N = SKD_SIG.length, L = 40, PW = w - L - 24;
  const bw = PW / N;
  // input signal
  mtTxt(x, 'signal', 6, 24, {size:8.5, col:MTC.muted});
  const iy0 = 20, ih = 70;
  SKD_SIG.forEach((v, i)=>{
    const h = Math.max(1, v * ih);
    const planted = i >= 14 && i <= 19;
    x.fillStyle = planted ? 'rgba(165,104,14,0.55)' : 'rgba(79,70,229,0.35)';
    x.fillRect(L + i*bw, iy0 + ih - h, bw - 1.2, h);
  });
  x.strokeStyle = MTC.a5; x.lineWidth = 1; x.setLineDash([2,2]);
  x.strokeRect(L + 14*bw - 1, iy0 - 4, 6*bw, ih + 8); x.setLineDash([]);
  mtTxt(x, 'planted rising ramp', L + 14*bw, iy0 - 10, {size:8.5, col:MTC.a5});
  // convolve, k=3, p=1, s=1
  const out = [];
  for(let j=0;j<N;j++){
    let acc = 0;
    for(let i=-1;i<=1;i++){
      const v = (j+i >= 0 && j+i < N) ? SKD_SIG[j+i] : 0;
      acc += v * _skd.w[i+1];
    }
    out.push(acc);
  }
  const mx = Math.max(0.2, ...out.map(Math.abs));
  const oy = 168, oh = 54;
  mtTxt(x, 'output', 6, oy, {size:8.5, col:MTC.muted});
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L, oy); x.lineTo(L + PW, oy); x.stroke();
  let peak = 0, peakV = -1e9;
  out.forEach((v, i)=>{
    const h = (v / mx) * oh;
    x.fillStyle = v >= 0 ? 'rgba(159,18,57,0.55)' : 'rgba(11,132,87,0.45)';
    x.fillRect(L + i*bw, h >= 0 ? oy - h : oy, bw - 1.2, Math.max(1, Math.abs(h)));
    if(v > peakV){ peakV = v; peak = i; }
  });
  x.fillStyle = MTC.a2;
  x.beginPath(); x.arc(L + peak*bw + bw/2, oy - (peakV/mx)*oh - 7, 3, 0, 7); x.fill();
  mtTxt(x, 'peak at ' + peak, L + peak*bw + bw/2, oy - (peakV/mx)*oh - 18, {size:8.5, col:MTC.a2, align:'center'});
  mtTxt(x, 'z\u2c7c = x\u2c7c\u208b\u2081w\u2080 + x\u2c7cw\u2081 + x\u2c7c\u208a\u2081w\u2082   with w = [' +
    _skd.w.map(v=>v.toFixed(1)).join(', ') + ']', L, 244, {size:9.5, col:MTC.muted});
  const onRamp = peak >= 14 && peak <= 20;
  mtSet('skd-cap', onRamp
    ? 'The peak now sits inside the planted ramp. A kernel like [\u22121, 0, 1] computes a local difference, so it is large wherever the signal is climbing and near zero wherever it is flat or oscillating symmetrically. That is the whole of what a convolutional feature detector does.'
    : 'The peak is at position ' + peak + ', outside the ramp at positions 14 to 19. The output is a dot product between w and the local window, so it is largest where the signal most resembles w. Try weights that increase from left to right.');
}

/* ── The Receptive Field Stack ────────────────────────────── */
const SKR_PRE = {
  hubert: {lab:'HuBERT front end, raw 16 kHz', k:[10,3,3,3,3,2,2], s:[5,2,2,2,2,2,2], unit:'samples', rate:16000},
  whisper:{lab:'Whisper front end, 100 fps log-mel', k:[3,3], s:[1,2], unit:'frames', rate:100},
  deep:   {lab:'plain stack, width 3, no striding', k:[3,3,3,3,3,3,3], s:[1,1,1,1,1,1,1], unit:'frames', rate:100}
};
let _skr = 'hubert';
function skrBuild(){
  _skr = 'hubert';
  const host = document.getElementById('skr-ctrl');
  if(host) host.innerHTML = Object.keys(SKR_PRE).map(kk=>
    '<button style="' + MTBTN + '" class="skr-b" data-k="' + kk + '" onclick="skrPick(\'' + kk + '\')">' +
    SKR_PRE[kk].lab + '</button>').join('');
  skrPick('hubert');
}
function skrPick(kk){
  _skr = kk;
  document.querySelectorAll('.skr-b').forEach(b=>{
    const on = b.dataset.k === kk;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
  });
  skrDraw();
}
function skrDraw(){
  const P = SKR_PRE[_skr];
  const c = mtCtx('skr-canvas', 60 + P.k.length * 30 + 76); if(!c) return;
  const {x, w} = c;
  const L = 30, PW = w - L - 30;
  let R = 1, prod = 1;
  const rows = [];
  for(let l=0;l<P.k.length;l++){
    const contrib = (P.k[l] - 1) * prod;
    R += contrib;
    rows.push({l:l+1, k:P.k[l], s:P.s[l], prod:prod, contrib:contrib, R:R});
    prod *= P.s[l];
  }
  const maxR = R;
  mtTxt(x, 'layer', L, 26, {size:8.5, col:MTC.muted});
  mtTxt(x, 'k', L + 46, 26, {size:8.5, col:MTC.muted, align:'center'});
  mtTxt(x, 's', L + 76, 26, {size:8.5, col:MTC.muted, align:'center'});
  mtTxt(x, '\u220f s\u2c7c (j < \u2113)', L + 138, 26, {size:8.5, col:MTC.muted, align:'center'});
  mtTxt(x, 'receptive field after this layer', L + 220, 26, {size:8.5, col:MTC.muted});
  rows.forEach((r, i)=>{
    const y = 46 + i * 30;
    mtTxt(x, String(r.l), L, y + 10, {size:9.5, col:MTC.text});
    mtTxt(x, String(r.k), L + 46, y + 10, {size:9.5, col:MTC.a1, align:'center'});
    mtTxt(x, String(r.s), L + 76, y + 10, {size:9.5, col:MTC.a5, align:'center'});
    mtTxt(x, String(r.prod), L + 138, y + 10, {size:9.5, col:MTC.muted, align:'center'});
    const bw = (PW - 210) * (r.R / maxR);
    mtRR(x, L + 220, y + 2, Math.max(2, bw), 16, 4);
    x.fillStyle = 'rgba(79,70,229,' + (0.22 + 0.5 * r.R / maxR).toFixed(3) + ')'; x.fill();
    mtTxt(x, r.R + ' ' + P.unit + '  (+' + r.contrib + ')', L + 226 + Math.max(2, bw), y + 10,
      {size:8.5, col:MTC.a1});
  });
  const y2 = 46 + rows.length * 30 + 14;
  const ms = (R / P.rate) * 1000;
  const strideProd = P.s.reduce((a,b)=>a*b, 1);
  mtTxt(x, 'R = 1 + ' + rows.map(r=>'(' + r.k + '\u22121)\u00b7' + r.prod).join(' + ') + ' = ' + R + ' ' + P.unit,
    L, y2, {size:9.5, col:MTC.text, weight:'700'});
  mtTxt(x, 'total stride \u220f s\u2113 = ' + strideProd + ', so the output rate is ' +
    (P.rate / strideProd).toFixed(P.rate/strideProd < 10 ? 1 : 0) + ' Hz, one vector every ' +
    (1000 * strideProd / P.rate).toFixed(1) + ' ms',
    L, y2 + 20, {size:9.5, col:MTC.a5});
  mtTxt(x, 'each output vector summarizes ' + ms.toFixed(1) + ' ms of audio',
    L, y2 + 40, {size:9.5, col:MTC.a4});
  mtSet('skr-cap', _skr === 'hubert'
    ? 'Seven layers over raw samples. The first stride of 5 multiplies every later layer\u2019s contribution, so kernels of width 2 and 3 still reach 400 samples, and the stack lands on the same 20 ms frame rate that hand-built feature extraction uses \u2014 learned rather than specified.'
    : _skr === 'whisper'
    ? 'Two layers over an already-computed log-mel sequence at 100 frames per second. The single stride of 2 halves the sequence, giving one audio token per 20 ms. Cheap, and enough, because the mel front end has done the hard part.'
    : 'Without striding the receptive field grows only linearly, two positions per layer, and the sequence never gets shorter. Seven layers reach 15 frames, 150 ms, and the transformer above still has the full 3000-step sequence to attend over.');
}

/* ══ 15.3 ENCODER-DECODER RECOGNIZERS ═════════════════════ */
ASR_PAGES.asrencdec = `
<div class="lesson-chapter-label">Section 15.3</div>
<h1 class="lesson-h1">Encoder-Decoder Recognizers</h1>
<p class="lesson-intro">Speech recognition is a sequence-to-sequence problem with an awkward property: the two sequences run on different clocks, and neither clock is a multiple of the other. The input arrives at a fixed physical rate set by the feature extractor. The output arrives at a rate set by how fast the speaker was talking and by which output alphabet was chosen. Everything structural about the architecture follows from that mismatch.</p>

<h2 class="lesson-h2">Two Clocks, One Utterance</h2>
<p class="lesson-p">The input is a sequence of acoustic feature vectors, one every ten milliseconds:</p>
<div class="lesson-math">\\[\\mathbf{X} = x_1, \\ldots, x_t\\]</div>
<p class="lesson-p">The output is a sequence of symbols bracketed by start and end markers:</p>
<div class="lesson-math">\\[Y = (\\langle \\text{sos} \\rangle, y_1, \\ldots, y_m, \\langle \\text{eos} \\rangle)\\]</div>
<p class="lesson-p">A character-level output alphabet for English is small enough to write out in full, which is part of its appeal: no vocabulary construction, no out-of-vocabulary words, and any string the language can spell is reachable.</p>
<div class="lesson-math">\\[y_i \\in \\{a, \\ldots, z,\\; 0, \\ldots, 9,\\; \\langle \\text{space} \\rangle, \\langle \\text{comma} \\rangle, \\langle \\text{period} \\rangle, \\langle \\text{apos} \\rangle, \\langle \\text{unk} \\rangle\\}\\]</div>
<p class="lesson-p">Scrub the playhead and watch the two tracks advance at their own rates. Switching the output alphabet changes how far apart they drift, which is the first design decision in the architecture.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Two-Clock Diagram</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="stc-ctrl"></div>
    <canvas id="stc-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="stc-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">The Factorization</h2>
<p class="lesson-p">The model assigns a probability to the whole output string, and the chain rule turns that into a product of per-symbol decisions, each conditioned on everything already emitted plus the entire acoustic input:</p>
<div class="lesson-math">\\[P(Y \\mid \\mathbf{X}) = \\prod_{i=1}^{m} p(y_i \\mid y_1, \\ldots, y_{i-1}, \\mathbf{X})\\]</div>
<p class="lesson-p">Two things are worth noticing about this factorization, because the alternatives later in the chapter differ from it in exactly these two places. First, the conditioning set includes all of \\(\\mathbf{X}\\), not some aligned portion of it, so nothing forces the model to consume the audio in order. Second, it includes the full output history, so the model carries its own language model inside it. CTC gives up the second property in exchange for a monotone alignment; the transducer takes it back.</p>
<p class="lesson-p">The clicked distributions in the diagram above are cross-attention weights, and they are the reason the free conditioning on \\(\\mathbf{X}\\) is workable in practice: although nothing constrains the decoder to move forward through the audio, a trained recognizer usually does, because speech is monotone and the data says so.</p>

<div class="quiz-block" id="qas-ed"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does switching from characters to subword tokens reduce the drift between the two clocks?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-ed','Correct. Fewer output symbols cover the same audio, so the ratio of frames to symbols falls and the output sequence sits closer in length to the subsampled input.')">Fewer symbols cover the same audio, so there are fewer frames per output symbol</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-ed','The frame rate is set by the feature extractor and is unaffected by the output alphabet.')">Subword tokens make the feature extractor run at a lower frame rate</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-ed','Cross-attention is rectangular either way; the alphabet changes one dimension of it, not its existence.')">Subword tokens remove the need for cross-attention</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-ed','Subword vocabularies are far larger than a character set, not smaller.')">Subword vocabularies are smaller than character vocabularies</button>
</div><div class="quiz-explain" id="qas-ed-explain"></div></div>`;

/* ── The Two-Clock Diagram ────────────────────────────────── */
const STC_ALPH = {
  char: {lab:'characters', toks:['t','h','e','\u2423','k','e','t','t','l','e','\u2423','i','s','\u2423','b','o','i','l','i','n','g']},
  bpe:  {lab:'subword (BPE)', toks:['the','\u2581ket','tle','\u2581is','\u2581boil','ing']},
  word: {lab:'words', toks:['the','kettle','is','boiling']}
};
const STC_FRAMES = 240;
let _stc = {alph:'char', head:0.45, sel:-1};
function stcBuild(){
  _stc = {alph:'char', head:0.45, sel:-1};
  const host = document.getElementById('stc-ctrl');
  if(host) host.innerHTML =
    '<span style="' + MTLBL + '">output alphabet</span>' +
    Object.keys(STC_ALPH).map(kk=>'<button style="' + MTBTN + '" class="stc-b" data-k="' + kk +
      '" onclick="stcAlph(\'' + kk + '\')">' + STC_ALPH[kk].lab + '</button>').join('') +
    '<div style="flex:1;min-width:160px"><div style="' + MTLBL + ';margin-bottom:3px">playhead</div>' +
    '<input id="stc-h" type="range" min="0" max="1" step="0.005" value="0.45" oninput="stcHead()" style="width:100%;accent-color:var(--accent)"></div>';
  stcAlph('char');
}
function stcAlph(kk){
  _stc.alph = kk; _stc.sel = -1;
  document.querySelectorAll('.stc-b').forEach(b=>{
    const on = b.dataset.k === kk;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
  });
  stcDraw();
}
function stcHead(){
  const el = document.getElementById('stc-h');
  if(el) _stc.head = +el.value;
  stcDraw();
}
function stcWave(f){
  // deterministic amplitude envelope with four word-shaped bursts
  const seg = [[8,52],[64,124],[132,158],[166,232]];
  let env = 0.03;
  seg.forEach(([a,b])=>{
    if(f >= a && f <= b){
      const u = (f - a) / (b - a);
      env = Math.max(env, 0.25 + 0.72 * Math.sin(Math.PI * Math.pow(u, 0.8)));
    }
  });
  return env * (0.55 + 0.45 * Math.sin(f * 2.4) * Math.sin(f * 0.37));
}
function stcAttn(i, m, n){
  const ctr = n * (i + 0.5) / m, sd = Math.max(3, n / (2.6 * m));
  const a = [];
  let z = 0;
  for(let f=0; f<n; f++){ const v = Math.exp(-0.5 * Math.pow((f - ctr) / sd, 2)); a.push(v); z += v; }
  return a.map(v => v / z);
}
function stcDraw(){
  const c = mtCtx('stc-canvas', 316); if(!c) return;
  const {x, w, cv} = c;
  const toks = STC_ALPH[_stc.alph].toks, m = toks.length, n = STC_FRAMES;
  const L = 24, PW = w - L - 24;
  const fx = f => L + PW * f / n;
  // waveform
  const wy = 46, wh = 34;
  x.strokeStyle = MTC.line; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L, wy); x.lineTo(L + PW, wy); x.stroke();
  x.strokeStyle = 'rgba(79,70,229,0.7)'; x.lineWidth = 1;
  x.beginPath();
  for(let f=0; f<n; f++){
    const v = stcWave(f) * wh;
    x.moveTo(fx(f), wy - v); x.lineTo(fx(f), wy + v);
  }
  x.stroke();
  mtTxt(x, 'waveform, 2.40 s', L, 18, {size:9, col:MTC.text, weight:'700'});
  // acoustic clock
  const ay = 108;
  mtTxt(x, 'acoustic clock \u00b7 ' + n + ' frames at 10 ms', L, ay - 14, {size:8.5, col:MTC.a1});
  x.strokeStyle = 'rgba(79,70,229,0.45)'; x.lineWidth = 1;
  for(let f=0; f<n; f+=2){
    x.beginPath(); x.moveTo(fx(f), ay); x.lineTo(fx(f), ay + 10); x.stroke();
  }
  x.strokeStyle = MTC.a1; x.lineWidth = 1.4;
  for(let f=0; f<n; f+=20){
    x.beginPath(); x.moveTo(fx(f), ay - 4); x.lineTo(fx(f), ay + 14); x.stroke();
    mtTxt(x, (f/100).toFixed(1) + 's', fx(f), ay + 24, {size:7.5, col:MTC.muted, align:'center'});
  }
  // symbol clock
  const sy = 164;
  mtTxt(x, 'symbol clock \u00b7 ' + m + ' ' + STC_ALPH[_stc.alph].lab, L, sy - 14, {size:8.5, col:MTC.a2});
  const sw = PW / m;
  _stc.hit = [];
  toks.forEach((tk, i)=>{
    const bx = L + i * sw, sel = i === _stc.sel;
    mtChip(x, bx + 1, sy, sw - 2, 24, sel ? 'rgba(159,18,57,0.28)' : 'rgba(159,18,57,0.10)',
      sel ? MTC.a2 : MTC.line, tk, MTC.text, m > 12 ? 8.5 : 10);
    _stc.hit.push({x:bx, y:sy, w:sw, h:24, i:i});
  });
  // playhead across both tracks
  const hf = Math.round(_stc.head * (n - 1));
  const hi = Math.min(m - 1, Math.floor(_stc.head * m));
  const hx = fx(hf);
  x.strokeStyle = MTC.a5; x.lineWidth = 1.6;
  x.beginPath(); x.moveTo(hx, wy - wh - 6); x.lineTo(hx, sy + 30); x.stroke();
  x.fillStyle = MTC.a5;
  x.beginPath(); x.moveTo(hx, wy - wh - 10); x.lineTo(hx - 4, wy - wh - 17); x.lineTo(hx + 4, wy - wh - 17); x.closePath(); x.fill();
  const hsx = L + hi * sw + sw / 2;
  x.setLineDash([3,3]); x.strokeStyle = MTC.a5; x.lineWidth = 1;
  x.beginPath(); x.moveTo(hx, ay + 30); x.lineTo(hsx, sy - 4); x.stroke(); x.setLineDash([]);
  mtTxt(x, 'frame ' + (hf + 1), hx + 5, wy - wh - 14, {size:8.5, col:MTC.a5});
  // cross-attention strip for the selected symbol
  const py = 234;
  if(_stc.sel >= 0){
    const a = stcAttn(_stc.sel, m, n), mx = Math.max(...a);
    mtTxt(x, 'cross-attention of output step ' + (_stc.sel + 1) + ' (\u201C' + toks[_stc.sel] +
      '\u201D) over the ' + n + ' encoder positions', L, py - 10, {size:8.5, col:MTC.a2});
    x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(L, py + 40); x.lineTo(L + PW, py + 40); x.stroke();
    for(let f=0; f<n; f++){
      const h = (a[f] / mx) * 38;
      x.fillStyle = 'rgba(159,18,57,' + (0.18 + 0.62 * a[f] / mx).toFixed(3) + ')';
      x.fillRect(fx(f), py + 40 - h, Math.max(1, PW/n - 0.4), h);
    }
  } else {
    mtTxt(x, 'click a symbol above to see which acoustic region it drew from', L, py + 20,
      {size:9, col:MTC.muted});
  }
  mtTxt(x, 'frames per output symbol: ' + n + ' / ' + m + ' = ' + (n/m).toFixed(1),
    L, 300, {size:9.5, col:MTC.text, weight:'700'});
  if(cv && !cv._stcBound){
    cv._stcBound = 1;
    cv.addEventListener('click', ev=>{
      const r = cv.getBoundingClientRect();
      const mx = ev.clientX - r.left, my = ev.clientY - r.top;
      let hitOne = false;
      (_stc.hit || []).forEach(h=>{ if(mx>=h.x && mx<=h.x+h.w && my>=h.y && my<=h.y+h.h){ _stc.sel = h.i; hitOne = true; } });
      if(!hitOne) _stc.sel = -1;
      stcDraw();
    });
  }
  mtSet('stc-cap', 'The audio is fixed at ' + n + ' frames however it is transcribed, but the output length is a choice: ' +
    m + ' ' + STC_ALPH[_stc.alph].lab + ' means ' + (n/m).toFixed(1) +
    ' frames per symbol. Characters drift furthest from the acoustic clock and words least, which is why subword units sit where they do. ' +
    (_stc.sel >= 0 ? 'Step ' + (_stc.sel + 1) + ' concentrates its attention near frame ' +
      Math.round(n * (_stc.sel + 0.5) / m) + '.' : ''));
}

/* ══ 15.3.1 SUBSAMPLING THE FRAME SEQUENCE ════════════════ */
ASR_PAGES.asrsub = `
<div class="lesson-chapter-label">Section 15.3.1</div>
<h1 class="lesson-h1">Compressing the Frame Sequence Before the Encoder</h1>
<p class="lesson-intro">Feeding a raw feature sequence straight into a transformer encoder is wasteful in a way that is easy to quantify. Self-attention costs time and memory quadratic in sequence length, and the sequence is far longer than the information in it warrants. Every architecture in this chapter therefore shortens the frame sequence first, and the choice of how is a real design decision with measurable consequences.</p>

<h2 class="lesson-h2">How Much Redundancy There Is</h2>
<p class="lesson-p">Put numbers on the mismatch. An English word takes roughly 250 milliseconds, which at a 10 millisecond frame rate is 25 frames. That same word is about 5 characters, or about 1.3 subword tokens under a typical BPE vocabulary. So the ratio of input steps to output steps is</p>
<div class="lesson-math">\\[\\frac{25}{5} = 5 \\quad \\text{to} \\quad \\frac{25}{1.3} \\approx 19 \\ \\text{frames per symbol}\\]</div>
<p class="lesson-p">Between five and nineteen input positions per output position. Cutting the sequence by a factor of two to four costs little, because a 10 millisecond frame does not contain 10 milliseconds of independent information: the analysis window that produced it was 25 milliseconds wide, so adjacent frames already overlap by 60 percent of their content.</p>

<h2 class="lesson-h2">Three Ways to Shorten a Sequence</h2>
<p class="lesson-p">The three strategies below all reduce the length by the same factor and differ entirely in what they do with the frames they remove.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Shortening Bench</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="ssb-ctrl"></div>
    <canvas id="ssb-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="ssb-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Low frame rate stacking concatenates a group of adjacent frames into one wider vector and then keeps only every third of the results, so nothing is thrown away, the length divides by three and the dimension triples:</p>
<div class="lesson-math">\\[\\mathbf{x}_i = [\\,\\mathbf{f}_{i-2};\\ \\mathbf{f}_{i-1};\\ \\mathbf{f}_i\\,] \\in \\mathbb{R}^{3d}, \\qquad n = t/3\\]</div>
<p class="lesson-p">Strided convolution does the same reduction with learned weights instead of concatenation, so the compression is trained rather than fixed, at the cost of parameters. This is what production systems use.</p>

<h2 class="lesson-h2">Two Real Front Ends</h2>
<p class="lesson-p">Whisper takes a fixed 30-second window of log-mel features at 100 frames per second, giving 3000 frames, and passes it through two convolutions with stride 1 then stride 2, with a GELU between them. Apply the length formula to the second layer:</p>
<div class="lesson-math">\\[n = \\left\\lfloor \\frac{3000 + 2 - 3}{2} \\right\\rfloor + 1 = 1500 \\quad \\Longrightarrow \\quad 20 \\text{ ms per audio token}\\]</div>
<p class="lesson-p">HuBERT skips the hand-built features entirely and runs seven convolutional layers over raw 16 kHz samples, with strides \\([5,2,2,2,2,2,2]\\) and kernels \\([10,3,3,3,3,2,2]\\). The strides multiply:</p>
<div class="lesson-math">\\[\\prod_\\ell s_\\ell = 320 \\quad \\Longrightarrow \\quad \\frac{16000}{320} = 50\\ \\text{Hz} = 20 \\text{ ms frames}\\]</div>
<p class="lesson-p">And the receptive-field formula from the previous section gives the width of audio each output vector summarizes:</p>
<div class="lesson-math">\\[R_7 = 1 + 9(1) + 2(5) + 2(10) + 2(20) + 2(40) + 1(80) + 1(160) = 400 \\text{ samples} = 25 \\text{ ms}\\]</div>
<p class="lesson-p">Twenty millisecond hops over twenty-five millisecond windows. The learned front end converged on the same frame geometry that decades of hand-built feature extraction settled on, which is a useful piece of evidence that the geometry was right rather than arbitrary.</p>

<div class="quiz-block" id="qas-sb"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does low frame rate stacking preserve that naive frame dropping destroys?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-sb','Correct. Stacking concatenates the discarded frames into the surviving vector, so the content is still present, just at a higher dimension; dropping deletes it.')">The content of the removed frames, which is concatenated into the surviving vector</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-sb','Both reduce the sequence length by the same factor; that is the point of the comparison.')">The original sequence length</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-sb','Neither method has parameters at all, which is part of why the strided convolution is preferred.')">The learned parameters of the front end</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-sb','The frame rate is what both methods change; the sampling rate of the audio is upstream of both.')">The sampling rate of the underlying audio</button>
</div><div class="quiz-explain" id="qas-sb-explain"></div></div>`;

/* ── The Shortening Bench ─────────────────────────────────── */
let _ssb = {r:3, sel:2};
function ssbBuild(){
  _ssb = {r:3, sel:2};
  const host = document.getElementById('ssb-ctrl');
  if(host) host.innerHTML =
    '<span style="' + MTLBL + '">reduction factor</span>' +
    '<input id="ssb-r" type="range" min="2" max="4" step="1" value="3" oninput="ssbUpd()" style="width:110px;accent-color:var(--accent)">' +
    '<b id="ssb-r-v" style="font-family:var(--mono);font-size:.7rem;color:var(--accent)">3</b>' +
    '<button style="' + MTBTN + '" class="ssb-b" data-i="0" onclick="ssbSel(0)">frame dropping</button>' +
    '<button style="' + MTBTN + '" class="ssb-b" data-i="1" onclick="ssbSel(1)">LFR stacking</button>' +
    '<button style="' + MTBTN + '" class="ssb-b" data-i="2" onclick="ssbSel(2)">strided conv</button>';
  ssbSel(2);
}
function ssbUpd(){
  const el = document.getElementById('ssb-r');
  if(el) _ssb.r = Math.max(2, Math.min(4, Math.round(+el.value)));
  mtSet('ssb-r-v', _ssb.r);
  ssbDraw();
}
function ssbSel(i){
  _ssb.sel = i;
  document.querySelectorAll('.ssb-b').forEach(b=>{
    const on = +b.dataset.i === i;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
  });
  ssbDraw();
}
function ssbDraw(){
  const c = mtCtx('ssb-canvas', 330); if(!c) return;
  const {x, w} = c;
  const r = _ssb.r, t = 3000, d = 80, dOut = 512;
  const n = Math.floor(t / r);
  const rows = [
    {nm:'naive frame dropping', len:n, dim:d, par:0,
     info:'two of every ' + r + ' frames deleted outright'},
    {nm:'low frame rate stacking', len:n, dim:d * r, par:0,
     info:'every frame survives, concatenated into a ' + (d*r) + '-dim vector'},
    {nm:'strided convolution', len:Math.floor((t + 2 - 3) / r) + 1, dim:dOut,
     par:dOut * d * 3 + dOut,
     info:'a learned ' + d + '\u2192' + dOut + ' mixture of each width-3 window'}
  ];
  const L = 20, PW = w - L - 20;
  // the input strip, 30 blocks standing for 100 frames each
  mtTxt(x, 'input \u00b7 ' + t + ' frames at 10 ms \u00b7 ' + d + ' log-mel bins', L, 18,
    {size:9, col:MTC.text, weight:'700'});
  const nb = 30, bw = (PW - 60) / nb;
  for(let i=0;i<nb;i++){
    x.fillStyle = 'rgba(79,70,229,' + (0.20 + 0.30 * ((i*7)%5)/4).toFixed(3) + ')';
    x.fillRect(L + i*bw, 28, bw - 1.2, 18);
  }
  rows.forEach((row, i)=>{
    const y = 74 + i * 78, sel = i === _ssb.sel;
    mtRR(x, L - 6, y - 12, PW + 12, 68, 8);
    x.fillStyle = sel ? 'rgba(159,18,57,0.07)' : 'rgba(23,27,52,0.02)'; x.fill();
    x.strokeStyle = sel ? MTC.a2 : MTC.line; x.lineWidth = 1; x.stroke();
    mtTxt(x, row.nm, L, y + 2, {size:9.5, col: sel ? MTC.a2 : MTC.text, weight:'700'});
    // the output strip, rendered so the mechanism is visible
    const on = Math.floor(nb / r);
    const obw = (PW - 220) / nb;
    for(let j=0;j<on;j++){
      const bx = L + 200 + j * obw * r;
      if(i === 0){
        x.fillStyle = 'rgba(79,70,229,0.45)';
        x.fillRect(bx, y + 14, obw - 1, 20);
        x.fillStyle = 'rgba(23,27,52,0.05)';
        for(let q=1;q<r;q++) x.fillRect(bx + q*obw, y + 14, obw - 1, 20);
      } else if(i === 1){
        for(let q=0;q<r;q++){
          x.fillStyle = 'rgba(79,70,229,' + (0.28 + 0.14*q).toFixed(2) + ')';
          x.fillRect(bx, y + 14 + q * (20/r), obw*r - 1.5, 20/r - 0.6);
        }
      } else {
        x.fillStyle = 'rgba(165,104,14,0.42)';
        x.fillRect(bx, y + 14, obw*r - 1.5, 20);
      }
    }
    mtTxt(x, 'length ' + row.len.toLocaleString(), L, y + 22, {size:9, col:MTC.muted});
    mtTxt(x, 'dim ' + row.dim + ' \u00b7 params ' + (row.par ? row.par.toLocaleString() : '0'),
      L, y + 38, {size:9, col:MTC.muted});
    mtTxt(x, row.info, L + 200, y + 48, {size:8.5, col: sel ? MTC.a2 : MTC.muted});
  });
  // ratio meter
  const beforeChar = 25/5, afterChar = beforeChar / r;
  const beforeBpe = 25/1.3, afterBpe = beforeBpe / r;
  mtTxt(x, 'frames per output symbol \u00b7 characters ' + beforeChar.toFixed(1) + ' \u2192 ' +
    afterChar.toFixed(1) + ' \u00b7 subword ' + beforeBpe.toFixed(1) + ' \u2192 ' + afterBpe.toFixed(1),
    L, 316, {size:9.5, col:MTC.a4, weight:'700'});
  const sel = rows[_ssb.sel];
  mtSet('ssb-cap', '<b style="color:#9F1239">' + sel.nm + '</b> takes ' + t.toLocaleString() +
    ' frames to ' + sel.len.toLocaleString() + ', at ' + sel.dim + ' dimensions per step and ' +
    (sel.par ? sel.par.toLocaleString() + ' parameters' : 'no parameters') + '. ' +
    (_ssb.sel === 0 ? 'Cheapest and lossiest: the discarded frames are simply gone.'
     : _ssb.sel === 1 ? 'Lossless in content but not in cost: the encoder now processes vectors three times as wide, and the mixing is fixed rather than learned.'
     : 'The compression itself is trained, so the model decides what to keep. Self-attention cost falls by ' + (r*r) + '\u00d7 since it is quadratic in length.'));
}

/* ══ 15.3.2 DECODING ONE CHARACTER AT A TIME ══════════════ */
ASR_PAGES.asrdec = `
<div class="lesson-chapter-label">Section 15.3.2</div>
<h1 class="lesson-h1">Decoding One Character at a Time</h1>
<p class="lesson-intro">The decoder generates output symbols using its own preceding outputs and the encoder’s audio representations. Cross-attention connects the two. Track which representation supplies each query, key, and value.</p>

<h2 class="lesson-h2">Where Q, K and V Come From</h2>
<p class="lesson-p">In self-attention, queries, keys and values are three projections of the same input. In cross-attention they are not. The query comes down from the decoder layer below; the keys and values come sideways from the encoder output \\(\\mathbf{H}^{enc}\\), and they are the same for every decoder step:</p>
<div class="lesson-math">\\[\\mathbf{Q} = \\mathbf{H}^{dec[\\ell-1]}\\mathbf{W}^Q, \\qquad \\mathbf{K} = \\mathbf{H}^{enc}\\mathbf{W}^K, \\qquad \\mathbf{V} = \\mathbf{H}^{enc}\\mathbf{W}^V\\]</div>
<div class="lesson-math">\\[\\mathrm{CrossAttention}(\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}) = \\mathrm{softmax}\\!\\left(\\frac{\\mathbf{Q}\\mathbf{K}^{\\top}}{\\sqrt{d_k}}\\right)\\mathbf{V}\\]</div>
<p class="lesson-p">The shapes make the asymmetry concrete. With \\(\\mathbf{H}^{enc} \\in \\mathbb{R}^{n \\times d}\\) and \\(m\\) output steps, \\(\\mathbf{Q} \\in \\mathbb{R}^{m \\times d_k}\\) while \\(\\mathbf{K}, \\mathbf{V} \\in \\mathbb{R}^{n \\times d_k}\\), so the attention matrix is \\(\\mathbb{R}^{m \\times n}\\): rectangular, one row per output symbol and one column per acoustic position. Self-attention matrices are square. This one is not, and it cannot be, because the two clocks disagree.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Cross-Attention Cutaway</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="sxa-ctrl"></div>
    <canvas id="sxa-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="sxa-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Greedy Decoding and Its Bias</h2>
<p class="lesson-p">The simplest decoding rule takes the highest-probability symbol at every step and feeds it back in:</p>
<div class="lesson-math">\\[\\hat{y}_i = \\arg\\max_{c \\,\\in\\, V} P(c \\mid y_1 \\ldots y_{i-1}, \\mathbf{X})\\]</div>
<p class="lesson-p">Beam search keeps several hypotheses alive instead, and then a problem appears that is worth deriving rather than patching. Every factor in the product is a probability, so \\(p(y_i \\mid \\cdot) &lt; 1\\), and therefore</p>
<div class="lesson-math">\\[\\log P(Y \\mid \\mathbf{X}) = \\sum_{i=1}^{m} \\log p(y_i \\mid \\cdot)\\]</div>
<p class="lesson-p">is a sum of negative terms and is strictly decreasing in \\(m\\). Longer hypotheses score worse purely because they are longer, so an unmodified beam search is biased toward stopping early. Dividing by a power of the length undoes it, and a language model term can be added at the same time:</p>
<div class="lesson-math">\\[\\mathrm{score}(Y \\mid \\mathbf{X}) = \\frac{1}{|Y|^{c}} \\log P(Y \\mid \\mathbf{X}) + \\lambda \\log P_{\\mathrm{LM}}(Y)\\]</div>
<p class="lesson-p">The exponent \\(c\\) interpolates: at \\(c = 0\\) the raw log-probability is used and truncation wins; at \\(c = 1\\) the score is a per-symbol average. Move both sliders below and watch the ranking of five real competing hypotheses change.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Rescoring Bench</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="srb-ctrl"></div>
    <canvas id="srb-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="srb-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qas-dc"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is the cross-attention matrix rectangular rather than square?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-dc','Correct. Queries come from the m decoder positions and keys from the n encoder positions, and m and n are set by different clocks.')">Its rows index output symbols and its columns index encoder positions, and those counts differ</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-dc','The causal mask makes the decoder self-attention matrix triangular; it does not change its shape, which is still square.')">Because the causal mask removes the upper triangle</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-dc','The key and value projections share d_k; the head dimension is the same on both sides.')">Because keys and values use different projection dimensions</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-dc','Scaling by the square root of d_k affects magnitudes, not shape.')">Because the scaling by the square root of d_k changes the shape</button>
</div><div class="quiz-explain" id="qas-dc-explain"></div></div>`;

/* ── The Cross-Attention Cutaway ──────────────────────────── */
let _sxa = 'blocks';
function sxaBuild(){
  _sxa = 'blocks';
  const host = document.getElementById('sxa-ctrl');
  if(host) host.innerHTML =
    [['blocks','the two blocks'],['qkv','Q, K, V wiring'],['masks','attention masks']].map(([k,l])=>
    '<button style="' + MTBTN + '" class="sxa-b" data-k="' + k + '" onclick="sxaMode(\'' + k + '\')">' + l + '</button>').join('');
  sxaMode('blocks');
}
function sxaMode(k){
  _sxa = k;
  document.querySelectorAll('.sxa-b').forEach(b=>{
    const on = b.dataset.k === k;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
  });
  sxaDraw();
}
function sxaDraw(){
  const c = mtCtx('sxa-canvas', 320); if(!c) return;
  const {x, w} = c;
  const n = 12, m = 8, dk = 64, d = 512;
  if(_sxa === 'masks'){
    const cell = 15, gap = 46;
    const mats = [
      {t:'encoder self-attention', r:n, cc:n, f:(i,j)=>1, col:'12,110,114',
       s:'n \u00d7 n, square, fully filled: every acoustic position may look at every other'},
      {t:'decoder self-attention', r:m, cc:m, f:(i,j)=>j<=i?1:0, col:'162,50,83',
       s:'m \u00d7 m, square, lower triangular: step i may not see the future'},
      {t:'cross-attention', r:m, cc:n, f:(i,j)=>1, col:'165,104,14',
       s:'m \u00d7 n, rectangular, fully filled: the whole utterance is already available'}
    ];
    let bx = 30;
    mats.forEach(M=>{
      mtTxt(x, M.t, bx, 26, {size:9, col:MTC.text, weight:'700'});
      for(let i=0;i<M.r;i++) for(let j=0;j<M.cc;j++){
        const on = M.f(i,j);
        x.fillStyle = on ? 'rgba(' + M.col + ',0.42)' : 'rgba(23,27,52,0.045)';
        x.fillRect(bx + j*cell, 40 + i*cell, cell - 1.5, cell - 1.5);
      }
      const bh = 40 + M.r*cell;
      mtTxt(x, M.r + ' \u00d7 ' + M.cc, bx, bh + 16, {size:9, col:MTC.muted});
      let ty = bh + 34;
      M.s.split(': ').forEach((piece, i)=>{
        mtTxt(x, (i ? '' : '') + piece, bx, ty, {size:8.5, col:MTC.muted});
        ty += 14;
      });
      bx += M.cc*cell + gap;
    });
    mtSet('sxa-cap', 'The three matrices in one architecture. Only the middle one is masked, and only the right one is rectangular. The decoder must be prevented from seeing its own future because it will not have it at inference time; the encoder has no such restriction, because the entire utterance was recorded before decoding began.');
    return;
  }
  // encoder and decoder blocks side by side
  const eb = {x:40, y:40, w:190, h:230}, db = {x:w-230, y:40, w:190, h:230};
  const dim = _sxa === 'qkv' ? 0.30 : 1;
  const eLay = [['self-attention','n \u00d7 n'],['add + layer norm',''],['feedforward',''],['add + layer norm','']];
  const dLay = [['masked self-attention','m \u00d7 m'],['add + layer norm',''],['cross-attention','m \u00d7 n'],['add + layer norm',''],['feedforward',''],['add + layer norm','']];
  const drawBlock = (B, lay, title, hi)=>{
    mtRR(x, B.x, B.y, B.w, B.h, 10);
    x.fillStyle = 'rgba(23,27,52,0.025)'; x.fill();
    x.strokeStyle = MTC.line2; x.lineWidth = 1; x.stroke();
    mtTxt(x, title, B.x + B.w/2, B.y - 12, {size:9.5, col:MTC.text, align:'center', weight:'700'});
    const lh = (B.h - 16) / lay.length;
    lay.forEach(([nm, sh], i)=>{
      const isHi = hi === i;
      x.save(); x.globalAlpha = isHi ? 1 : dim;
      mtChip(x, B.x + 10, B.y + 8 + i*lh, B.w - 20, lh - 6,
        isHi ? 'rgba(165,104,14,0.28)' : 'rgba(79,70,229,0.10)',
        isHi ? MTC.a5 : MTC.line, nm, MTC.text, 8.5);
      if(sh) mtTxt(x, sh, B.x + B.w - 16, B.y + 8 + i*lh + lh/2, {size:7.5, col:MTC.muted, align:'right'});
      x.restore();
    });
  };
  drawBlock(eb, eLay, 'encoder block', -1);
  drawBlock(db, dLay, 'decoder block', 2);
  // K and V flowing sideways from the encoder into cross-attention
  const lh = (db.h - 16) / dLay.length;
  const cy = db.y + 8 + 2*lh + lh/2;
  x.strokeStyle = MTC.a1; x.lineWidth = 2;
  x.beginPath(); x.moveTo(eb.x + eb.w, eb.y + eb.h - 30);
  x.bezierCurveTo(eb.x + eb.w + 60, eb.y + eb.h - 30, db.x - 60, cy, db.x + 8, cy);
  x.stroke();
  x.fillStyle = MTC.a1;
  x.beginPath(); x.moveTo(db.x + 10, cy); x.lineTo(db.x + 2, cy - 4); x.lineTo(db.x + 2, cy + 4); x.closePath(); x.fill();
  mtTxt(x, 'K, V  \u2190 H\u1d49\u207f\u1d9c', (eb.x + eb.w + db.x)/2, cy - 34, {size:9, col:MTC.a1, align:'center', weight:'700'});
  mtTxt(x, 'n \u00d7 d\u2096, identical at every decoder step', (eb.x + eb.w + db.x)/2, cy - 20,
    {size:8, col:MTC.muted, align:'center'});
  // Q coming down inside the decoder
  x.strokeStyle = MTC.a2; x.lineWidth = 2; x.setLineDash([4,3]);
  x.beginPath(); x.moveTo(db.x + db.w - 24, db.y + 8 + 1.6*lh); x.lineTo(db.x + db.w - 24, cy - 6); x.stroke();
  x.setLineDash([]);
  mtTxt(x, 'Q \u2193', db.x + db.w - 10, db.y + 8 + 1.9*lh, {size:9, col:MTC.a2, weight:'700'});
  if(_sxa === 'qkv'){
    const by = 286;
    mtTxt(x, 'Q = H\u1d48\u1d49\u1d9c[\u2113\u22121] W\u1d60   \u2208 \u211d^(' + m + '\u00d7' + dk + ')      K = H\u1d49\u207f\u1d9c W\u1d4f   \u2208 \u211d^(' + n + '\u00d7' + dk +
      ')      V = H\u1d49\u207f\u1d9c W\u1d5b   \u2208 \u211d^(' + n + '\u00d7' + dk + ')', 40, by, {size:9, col:MTC.text});
    mtTxt(x, 'QK\u1d40 \u2208 \u211d^(' + m + '\u00d7' + n + ')  \u2192 softmax over the ' + n +
      ' encoder positions  \u2192  \u00d7 V  \u2192  \u211d^(' + m + '\u00d7' + dk + '), one context vector per output step',
      40, by + 18, {size:9, col:MTC.a5});
  }
  mtSet('sxa-cap', _sxa === 'qkv'
    ? 'The query is a projection of the decoder state at this step, so it changes with every symbol emitted. The keys and values are projections of the encoder output, so they are computed once for the utterance and reused. That asymmetry is the whole of cross-attention.'
    : 'The encoder block and the decoder block are the same stack of components with one addition: a cross-attention layer sitting between the decoder\u2019s masked self-attention and its feedforward layer. Everything dimmed is shared. Switch views to expand the wiring or compare the three attention masks.');
}

/* ── The Rescoring Bench ──────────────────────────────────── */
const SRB_H = [
  {y:'the kettle is boiling', am:-2.40, lm:-8.10, ok:true},
  {y:'the cattle is boiling', am:-2.10, lm:-13.90, ok:false},
  {y:'the kettle is spoiling', am:-3.05, lm:-14.60, ok:false},
  {y:'the kettle is boiling now', am:-4.40, lm:-11.20, ok:false},
  {y:'the kettle', am:-2.00, lm:-6.00, ok:false}
];
let _srb = {lam:0.30, c:1.0};
function srbBuild(){
  _srb = {lam:0.30, c:1.0};
  const host = document.getElementById('srb-ctrl');
  if(host) host.innerHTML =
    '<div style="min-width:150px"><div style="' + MTLBL + ';margin-bottom:3px">LM weight \u03bb <b id="srb-l-v" style="color:var(--accent)">0.30</b></div>' +
    '<input id="srb-l" type="range" min="0" max="1" step="0.02" value="0.3" oninput="srbUpd()" style="width:100%;accent-color:var(--accent)"></div>' +
    '<div style="min-width:150px"><div style="' + MTLBL + ';margin-bottom:3px">length exponent c <b id="srb-c-v" style="color:var(--accent2)">1.00</b></div>' +
    '<input id="srb-c" type="range" min="0" max="1.5" step="0.05" value="1" oninput="srbUpd()" style="width:100%;accent-color:var(--accent2)"></div>';
  srbUpd();
}
function srbUpd(){
  const a = document.getElementById('srb-l'), b = document.getElementById('srb-c');
  if(a) _srb.lam = +a.value;
  if(b) _srb.c = +b.value;
  mtSet('srb-l-v', _srb.lam.toFixed(2));
  mtSet('srb-c-v', _srb.c.toFixed(2));
  srbDraw();
}
function srbDraw(){
  const c = mtCtx('srb-canvas', 250); if(!c) return;
  const {x, w} = c;
  const scored = SRB_H.map(h=>{
    const len = h.y.length;
    const norm = Math.pow(len, _srb.c);
    const s = h.am / norm + _srb.lam * h.lm / norm;
    return Object.assign({}, h, {len:len, s:s});
  }).sort((p,q)=>q.s - p.s);
  const lo = Math.min(...scored.map(h=>h.s)), hi = Math.max(...scored.map(h=>h.s));
  const L = 24, PW = w - L - 30;
  mtTxt(x, 'ranked hypotheses', L, 18, {size:9, col:MTC.text, weight:'700'});
  scored.forEach((h, i)=>{
    const y = 34 + i * 40;
    const frac = hi === lo ? 1 : (h.s - lo) / (hi - lo);
    const bw = 40 + (PW - 260) * frac;
    mtRR(x, L + 210, y, Math.max(4, bw), 22, 5);
    x.fillStyle = h.ok ? 'rgba(11,132,87,0.42)' : 'rgba(159,18,57,0.26)'; x.fill();
    mtTxt(x, (i+1) + '.', L, y + 14, {size:9, col:MTC.muted});
    mtTxt(x, h.y, L + 18, y + 14, {size:10, col: h.ok ? MTC.a4 : MTC.text, weight: i===0 ? '700' : ''});
    mtTxt(x, h.s.toFixed(3), L + 216 + Math.max(4, bw), y + 14, {size:9, col:MTC.muted});
    mtTxt(x, 'am ' + h.am.toFixed(2) + ' \u00b7 lm ' + h.lm.toFixed(2) + ' \u00b7 |Y| ' + h.len,
      L + 18, y + 30, {size:8, col:MTC.muted});
    if(h.ok) mtTxt(x, 'reference', L + 190, y + 14, {size:8, col:MTC.a4, align:'right'});
  });
  const top = scored[0];
  mtTxt(x, 'score = (1/|Y|^' + _srb.c.toFixed(2) + ') \u00b7 log P(Y|X) + ' + _srb.lam.toFixed(2) +
    ' \u00b7 log P_LM(Y)', L, 236, {size:9.5, col:MTC.muted});
  mtSet('srb-cap', top.ok
    ? 'The reference is on top. Two pressures are balancing: the length exponent stops the beam from preferring the truncated hypothesis, and the language model term separates <i>kettle</i> from the acoustically closer <i>cattle</i>.'
    : (top.y === 'the kettle'
      ? 'The truncated hypothesis wins. With c near 0 the raw log-probability is used, and since every extra symbol subtracts from it, stopping early is always cheaper. Raise c.'
      : 'The wrong hypothesis wins. \u201Ccattle\u201D scores better acoustically than \u201Ckettle\u201D; only the language model knows that kettles boil and cattle do not. Raise \u03bb.'));
}

/* ══ 15.3.3 TRAINING ══════════════════════════════════════ */
ASR_PAGES.asrtrain = `
<div class="lesson-chapter-label">Section 15.3.3</div>
<h1 class="lesson-h1">Training with Cross-Entropy and Teacher Forcing</h1>
<p class="lesson-intro">Paired audio and transcripts supply the basic supervised training signal. Teacher forcing uses the reference transcript as decoder history during training, while inference uses the model’s own outputs. That difference introduces exposure bias.</p>

<h2 class="lesson-h2">The Loss</h2>
<p class="lesson-p">At output step \\(i\\) the model produces a distribution over the alphabet and the transcript names the correct symbol. The loss is the negative log probability the model assigned to it:</p>
<div class="lesson-math">\\[L_{CE} = -\\log p(y_i \\mid y_1, \\ldots, y_{i-1}, \\mathbf{X})\\]</div>
<p class="lesson-p">Summed over the utterance:</p>
<div class="lesson-math">\\[L_{CE} = -\\sum_{i=1}^{m} \\log p(y_i \\mid y_1, \\ldots, y_{i-1}, \\mathbf{X})\\]</div>
<p class="lesson-p">The name is worth unpacking, because it looks like a special case rather than the general one it is. Cross-entropy between a target distribution and a model distribution is \\(H(q, p) = -\\sum_c q(c) \\log p(c)\\). Here the target is a one-hot distribution \\(\\delta_{y_i}\\) placing all its mass on the correct symbol, so</p>
<div class="lesson-math">\\[H(\\delta_{y_i}, p) = -\\sum_{c} \\delta_{y_i}(c) \\log p(c) = -\\log p(y_i)\\]</div>
<p class="lesson-p">Every term except the gold one is multiplied by zero. The sum over the vocabulary collapses to a single logarithm, which is why the loss looks like it only cares about one output when it is in fact a full distributional comparison.</p>

<h2 class="lesson-h2">Whose History Goes Into the Input</h2>
<p class="lesson-p">During training the correct previous symbol is available, so it is used: this is <strong>teacher forcing</strong>. At inference it is not available, so the model's own prediction is used instead. The two conditions differ, and the difference compounds: a model that has only ever been conditioned on correct history has no training signal for what to do after it makes a mistake. <strong>Scheduled sampling</strong> closes the gap by feeding the model's own prediction with probability \\(\\epsilon\\) during training,</p>
<div class="lesson-math">\\[\\tilde{y}_{i-1} = \\begin{cases} y_{i-1} & \\text{with probability } 1-\\epsilon \\\\ \\hat{y}_{i-1} & \\text{with probability } \\epsilon \\end{cases}\\]</div>
<div class="lesson-math">\\[L_{CE} = -\\log p(y_i \\mid \\tilde{y}_1, \\ldots, \\tilde{y}_{i-1}, \\mathbf{X})\\]</div>
<p class="lesson-p">The target is unchanged. Only the input history changes. Push \\(\\epsilon\\) up below and watch the right-hand decoder take one wrong character and fail to recover from it.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The History Switch</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="shs-ctrl"></div>
    <canvas id="shs-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="shs-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">One gradient computation covers the whole system. The loss is differentiated with respect to the decoder parameters, then back through the cross-attention layer into the encoder, then back through the convolutional front end to the features themselves. Nothing in the middle is trained separately or frozen, which is what <em>end to end</em> means here: not that the system has few parts, but that one objective reaches all of them.</p>

<div class="quiz-block" id="qas-tf"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In scheduled sampling, what does \\(\\epsilon\\) change?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-tf','Correct. The target stays the gold symbol at every step; only the history fed into the input is sometimes replaced by the model\\'s own prediction.')">Which history is fed into the input, while the target stays the gold symbol</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-tf','The target is always the gold symbol; changing it would change what the model is being asked to learn.')">Which symbol is used as the training target</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-tf','The learning rate is a separate hyperparameter entirely.')">The size of the gradient step taken at each position</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-tf','Beam width is a decoding-time setting; scheduled sampling is a training-time one.')">The width of the beam used during decoding</button>
</div><div class="quiz-explain" id="qas-tf-explain"></div></div>`;

/* ── The History Switch ───────────────────────────────────── */
const SHS_GOLD = 'the kettle is boiling'.split('');
const SHS_WRONG = {t:'d', h:'e', e:'a', k:'c', l:'i', s:'z', b:'p', o:'a', i:'e', n:'m', g:'k', ' ':'e'};
function shsR(i, salt){ const s = ((i + 1) * (9301 + salt * 131) + 49297 * (salt + 3)) % 233280; return s / 233280; }
let _shs = {eps:0.35, grad:false};
function shsBuild(){
  _shs = {eps:0.35, grad:false};
  const host = document.getElementById('shs-ctrl');
  if(host) host.innerHTML =
    '<div style="min-width:190px"><div style="' + MTLBL + ';margin-bottom:3px">self-feeding probability \u03b5 <b id="shs-e-v" style="color:var(--accent)">0.35</b></div>' +
    '<input id="shs-e" type="range" min="0" max="1" step="0.01" value="0.35" oninput="shsUpd()" style="width:100%;accent-color:var(--accent)"></div>' +
    '<button style="' + MTBTN + '" id="shs-g" onclick="shsGrad()">gradient path</button>';
  shsUpd();
}
function shsGrad(){ _shs.grad = !_shs.grad; shsDraw(); }
function shsUpd(){
  const el = document.getElementById('shs-e');
  if(el) _shs.eps = +el.value;
  mtSet('shs-e-v', _shs.eps.toFixed(2));
  shsDraw();
}
function shsSim(){
  const n = SHS_GOLD.length, steps = [];
  let derailed = false, pred = null;
  for(let i=0;i<n;i++){
    const selfFed = i > 0 && shsR(i, 1) < _shs.eps;
    const inTok = i === 0 ? '\u27e8sos\u27e9' : (selfFed ? pred : SHS_GOLD[i-1]);
    if(selfFed && i > 0 && pred !== SHS_GOLD[i-1]) derailed = true;
    if(derailed && SHS_GOLD[i] === ' ' && shsR(i, 5) < 0.30) derailed = false;
    const pGold = derailed ? 0.14 : 0.92;
    const correct = shsR(i, 2) < pGold;
    pred = correct ? SHS_GOLD[i] : (SHS_WRONG[SHS_GOLD[i]] || 'x');
    steps.push({i:i, gold:SHS_GOLD[i], inTok:inTok, selfFed:selfFed, pred:pred,
                ce:-Math.log(pGold), derailed:derailed});
  }
  return steps;
}
function shsDraw(){
  const c = mtCtx('shs-canvas', 300); if(!c) return;
  const {x, w} = c;
  const gb = document.getElementById('shs-g');
  if(gb){ gb.style.background = _shs.grad ? 'var(--accent2)' : 'var(--surface2)';
          gb.style.color = _shs.grad ? '#FAFBFF' : 'var(--muted)'; }
  const steps = shsSim(), n = steps.length;
  const L = 90, PW = w - L - 16, cw = PW / n;
  // left decoder, always gold history
  mtTxt(x, 'gold history', 6, 34, {size:8.5, col:MTC.a4, weight:'700'});
  mtTxt(x, '\u03b5 = 0', 6, 48, {size:8, col:MTC.muted});
  steps.forEach((s, i)=>{
    mtChip(x, L + i*cw, 24, cw - 1.6, 20, 'rgba(11,132,87,0.16)', MTC.line,
      s.gold === ' ' ? '\u2423' : s.gold, MTC.text, 9);
  });
  mtTxt(x, 'input', 6, 66, {size:8, col:MTC.muted});
  steps.forEach((s, i)=>{
    mtChip(x, L + i*cw, 56, cw - 1.6, 16, 'rgba(23,27,52,0.03)', MTC.line,
      i === 0 ? '\u25B7' : (SHS_GOLD[i-1] === ' ' ? '\u2423' : SHS_GOLD[i-1]), MTC.muted, 8);
  });
  // right decoder, mixed history
  mtTxt(x, 'mixed history', 6, 116, {size:8.5, col:MTC.a2, weight:'700'});
  mtTxt(x, '\u03b5 = ' + _shs.eps.toFixed(2), 6, 130, {size:8, col:MTC.muted});
  steps.forEach((s, i)=>{
    const bad = s.pred !== s.gold;
    mtChip(x, L + i*cw, 106, cw - 1.6, 20,
      bad ? 'rgba(159,18,57,0.28)' : 'rgba(11,132,87,0.16)',
      bad ? MTC.a2 : MTC.line, s.pred === ' ' ? '\u2423' : s.pred, MTC.text, 9);
  });
  mtTxt(x, 'input', 6, 148, {size:8, col:MTC.muted});
  steps.forEach((s, i)=>{
    const t = s.inTok === ' ' ? '\u2423' : (i === 0 ? '\u25B7' : s.inTok);
    mtChip(x, L + i*cw, 138, cw - 1.6, 16,
      s.selfFed ? 'rgba(165,104,14,0.26)' : 'rgba(23,27,52,0.03)',
      s.selfFed ? MTC.a5 : MTC.line, t, s.selfFed ? MTC.a5 : MTC.muted, 8);
  });
  mtTxt(x, 'amber inputs came from the model itself', L, 168, {size:8, col:MTC.a5});
  // per-step cross-entropy strip
  const cy = 236, chh = 42;
  mtTxt(x, 'per-step', 6, cy - 26, {size:8, col:MTC.muted});
  mtTxt(x, 'loss', 6, cy - 14, {size:8, col:MTC.muted});
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L, cy); x.lineTo(L + PW, cy); x.stroke();
  const ceMax = Math.max(2.2, ...steps.map(s=>s.ce));
  const goldCE = -Math.log(0.92);
  steps.forEach((s, i)=>{
    const hL = (goldCE / ceMax) * chh, hR = (s.ce / ceMax) * chh;
    x.fillStyle = 'rgba(11,132,87,0.40)';
    x.fillRect(L + i*cw, cy - hL, cw/2 - 1, hL);
    x.fillStyle = s.ce > goldCE + 0.01 ? 'rgba(159,18,57,0.55)' : 'rgba(11,132,87,0.40)';
    x.fillRect(L + i*cw + cw/2, cy - hR, cw/2 - 1, hR);
  });
  const sumL = n * goldCE, sumR = steps.reduce((a,s)=>a + s.ce, 0);
  mtTxt(x, 'L = ' + sumL.toFixed(2) + ' with gold history,  ' + sumR.toFixed(2) + ' with mixed history',
    L, cy + 20, {size:9.5, col:MTC.text, weight:'700'});
  if(_shs.grad){
    const stages = ['decoder','cross-attention','encoder','conv front end'];
    const sw = PW / stages.length;
    stages.forEach((st, i)=>{
      mtChip(x, L + i*sw, cy + 32, sw - 8, 20, 'rgba(159,18,57,0.14)', MTC.a2, st, MTC.a2, 8);
      if(i < stages.length - 1){
        x.strokeStyle = MTC.a2; x.lineWidth = 1.4;
        const ax = L + (i+1)*sw - 6;
        x.beginPath(); x.moveTo(ax, cy + 42); x.lineTo(ax - 8, cy + 42); x.stroke();
        x.beginPath(); x.moveTo(ax - 8, cy + 42); x.lineTo(ax - 4, cy + 39); x.lineTo(ax - 4, cy + 45); x.closePath();
        x.fillStyle = MTC.a2; x.fill();
      }
    });
    mtTxt(x, '\u2202L / \u2202\u03b8 flows right to left through every stage', L, cy + 64, {size:8.5, col:MTC.a2});
  }
  const nSelf = steps.filter(s=>s.selfFed).length;
  const nBad = steps.filter(s=>s.pred !== s.gold).length;
  mtSet('shs-cap', nSelf + ' of ' + n + ' steps were fed the model\u2019s own prediction, and ' + nBad +
    ' output characters came out wrong. ' +
    (nBad === 0 ? 'At this \u03b5 the model never sampled a mistake, so the two decoders are identical.'
     : 'Notice the shape of the failure: errors do not stay local. Once a wrong character enters the input, the conditioning context is off-distribution and the next prediction degrades, which feeds a worse input to the step after that. The loss strip on the right shows the cascade quantitatively.'));
}

/* ══ 15.4 LEARNING UNITS WITHOUT TRANSCRIPTS ══════════════ */
ASR_PAGES.asrssl = `
<div class="lesson-chapter-label">Section 15.4</div>
<h1 class="lesson-h1">Learning Speech Units Without Transcripts</h1>
<p class="lesson-intro">Transcribed audio is expensive. Untranscribed audio is nearly free, and there is an enormous amount of it. The question is whether audio alone can teach a model anything useful about speech, and the answer turns out to be yes, provided the training objective is chosen so that solving it requires understanding structure rather than copying the input.</p>

<h2 class="lesson-h2">What a Transcript Budget Buys</h2>
<p class="lesson-p">Two pipelines, one axis. The supervised pipeline can only consume paired audio and text, so its throughput is capped by annotation effort. The self-supervised pipeline consumes untranscribed audio for the expensive part and needs transcripts only for a short fine-tuning stage at the end. Drag the budget slider and watch what each pipeline can deliver.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Label Budget</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="slb-ctrl"></div>
    <canvas id="slb-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="slb-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The interesting part of that plot is the right-hand end. Self-supervision is not free performance; it is a way of converting cheap data into a good starting point, and its advantage shrinks as the transcript budget grows. Past several thousand hours a purely supervised system trained on that much paired data catches up and overtakes. Almost no language on earth has several thousand hours of transcribed audio, which is why the technique matters.</p>

<h2 class="lesson-h2">Masking as the Objective</h2>
<p class="lesson-p">The training signal comes from hiding part of the input and asking the model to fill it in. Spans rather than isolated frames are masked, because adjacent frames are so similar that predicting a single hidden frame from its neighbours requires no linguistic knowledge at all: interpolation would do it. Choose a fraction \\(\\pi\\) of positions as span starts and extend each to length \\(\\ell\\); the expected fraction of frames covered is</p>
<div class="lesson-math">\\[1 - (1-\\pi)^{\\ell}\\]</div>
<p class="lesson-p">With \\(\\pi = 0.08\\) and \\(\\ell = 10\\), roughly 57 percent of frames end up masked, far more than the eight percent that the start probability suggests. Paint a mask below and watch the target row: what the model must predict is not the hidden waveform but the hidden <em>unit</em>, a discrete label. Predicting the waveform would reward memorizing speaker and channel detail; predicting a unit rewards learning what was said.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Mask Painter</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="slm-ctrl"></div>
    <canvas id="slm-canvas" data-w="660" style="width:100%;display:block;cursor:crosshair"></canvas>
    <div id="slm-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qas-sl"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does the objective predict a discrete unit rather than the hidden acoustic frame?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-sl','Correct. Reconstructing the frame rewards modelling speaker and channel detail; predicting a unit forces the representation toward the phonetic content those units track.')">Reconstructing the frame would reward modelling speaker and channel detail rather than linguistic content</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-sl','Regression losses on continuous targets are entirely standard; the reason is what the target rewards, not whether it can be optimized.')">Continuous targets cannot be optimized with gradient descent</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-sl','The units come from clustering, which is an extra step rather than a saving; the payoff is in what gets learned.')">Discrete units are cheaper to compute than the original frames</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-sl','The units are not phone labels and require no transcripts at all; that is the point of the method.')">The units are phone labels taken from the transcript</button>
</div><div class="quiz-explain" id="qas-sl-explain"></div></div>`;

/* ── The Label Budget ─────────────────────────────────────── */
function slbSup(h){ return 75 * Math.pow(h, -0.331); }
function slbSsl(h){ return 4.0 + 5 * Math.pow(h, -0.35); }
let _slb = 1.7;
function slbBuild(){
  _slb = 1.7;
  const host = document.getElementById('slb-ctrl');
  if(host) host.innerHTML =
    '<div style="flex:1;min-width:200px"><div style="' + MTLBL + ';margin-bottom:3px">transcribed hours available <b id="slb-h-v" style="color:var(--accent)">50</b></div>' +
    '<input id="slb-h" type="range" min="0" max="4.7" step="0.01" value="1.7" oninput="slbUpd()" style="width:100%;accent-color:var(--accent)"></div>';
  slbUpd();
}
function slbUpd(){
  const el = document.getElementById('slb-h');
  if(el) _slb = +el.value;
  const h = Math.pow(10, _slb);
  mtSet('slb-h-v', h < 10 ? h.toFixed(1) : Math.round(h).toLocaleString());
  slbDraw();
}
function slbDraw(){
  const c = mtCtx('slb-canvas', 300); if(!c) return;
  const {x, w} = c;
  const h = Math.pow(10, _slb);
  const L = 52, R = 150, T = 22, B = 46;
  const PW = w - L - R, PH = 300 - T - B;
  const lox = 0, hix = 4.7;
  const px = lx => L + PW * (lx - lox) / (hix - lox);
  const loy = Math.log10(2), hiy = Math.log10(90);
  const py = v => T + PH * (1 - (Math.log10(Math.max(2, Math.min(90, v))) - loy) / (hiy - loy));
  // grid
  [2,5,10,20,50,90].forEach(v=>{
    const y = py(v);
    x.strokeStyle = MTC.line; x.lineWidth = 1;
    x.beginPath(); x.moveTo(L, y); x.lineTo(L + PW, y); x.stroke();
    mtTxt(x, v + '%', L - 8, y, {size:8.5, col:MTC.muted, align:'right'});
  });
  [0,1,2,3,4].forEach(e=>{
    const tx = px(e);
    x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(tx, T); x.lineTo(tx, T + PH); x.stroke();
    mtTxt(x, e === 0 ? '1 h' : (e === 1 ? '10 h' : Math.pow(10,e).toLocaleString() + ' h'),
      tx, T + PH + 16, {size:8.5, col:MTC.muted, align:'center'});
  });
  const curve = (f, col, lab)=>{
    x.strokeStyle = col; x.lineWidth = 2.2; x.beginPath();
    for(let i=0;i<=140;i++){
      const lx = lox + (hix - lox) * i / 140;
      const v = f(Math.pow(10, lx));
      const X = px(lx), Y = py(v);
      i ? x.lineTo(X, Y) : x.moveTo(X, Y);
    }
    x.stroke();
  };
  curve(slbSup, MTC.a2);
  curve(slbSsl, MTC.a1);
  // crossing point
  let cross = null;
  for(let i=0;i<400;i++){
    const lx = lox + (hix - lox) * i / 400, hh = Math.pow(10, lx);
    if(slbSup(hh) <= slbSsl(hh)){ cross = {lx:lx, h:hh, v:slbSsl(hh)}; break; }
  }
  if(cross){
    x.setLineDash([3,3]); x.strokeStyle = MTC.muted; x.lineWidth = 1;
    x.beginPath(); x.moveTo(px(cross.lx), T); x.lineTo(px(cross.lx), T + PH); x.stroke(); x.setLineDash([]);
    mtTxt(x, 'curves cross near ' + Math.round(cross.h / 100) * 100 + ' h',
      px(cross.lx) + 5, T + 12, {size:8, col:MTC.muted});
  }
  // playhead
  const hx = px(_slb), sup = slbSup(h), ssl = slbSsl(h);
  x.strokeStyle = MTC.a5; x.lineWidth = 1.5;
  x.beginPath(); x.moveTo(hx, T); x.lineTo(hx, T + PH); x.stroke();
  [[sup, MTC.a2], [ssl, MTC.a1]].forEach(([v, col])=>{
    x.fillStyle = col; x.beginPath(); x.arc(hx, py(v), 4.2, 0, 7); x.fill();
  });
  // the two pipes, drawn as gauges on the right
  const gx = L + PW + 22;
  const pipes = [
    {nm:'supervised', col:MTC.a2, v:sup, need:'paired audio + text',
     vol:Math.min(1, h / 50000), extra:'all ' + (h < 10 ? h.toFixed(1) : Math.round(h).toLocaleString()) + ' h must be transcribed'},
    {nm:'self-supervised', col:MTC.a1, v:ssl, need:'60,000 h untranscribed',
     vol:1, extra:'plus ' + (h < 10 ? h.toFixed(1) : Math.round(h).toLocaleString()) + ' h for fine-tuning'}
  ];
  pipes.forEach((p, i)=>{
    const y = T + 10 + i * 118;
    mtTxt(x, p.nm, gx, y, {size:9.5, col:p.col, weight:'700'});
    mtTxt(x, p.need, gx, y + 15, {size:8, col:MTC.muted});
    // pipe volume gauge
    mtRR(x, gx, y + 24, R - 40, 16, 5);
    x.fillStyle = 'rgba(23,27,52,0.05)'; x.fill();
    mtRR(x, gx, y + 24, Math.max(3, (R - 40) * p.vol), 16, 5);
    x.fillStyle = p.col + '66'; x.fill();
    mtTxt(x, p.extra, gx, y + 54, {size:8, col:MTC.muted});
    mtTxt(x, p.v.toFixed(1) + '%', gx, y + 78, {size:17, col:p.col, weight:'700', font:MTC.mono});
    mtTxt(x, 'word error rate', gx, y + 92, {size:8, col:MTC.muted});
  });
  mtTxt(x, 'transcribed hours, log scale', L, T + PH + 34, {size:8.5, col:MTC.muted});
  const gap = sup - ssl;
  mtSet('slb-cap', 'At ' + (h < 10 ? h.toFixed(1) : Math.round(h).toLocaleString()) + ' hours of transcription the gap is ' +
    (gap > 0 ? gap.toFixed(1) + ' points in favour of the self-supervised pipeline'
             : Math.abs(gap).toFixed(1) + ' points in favour of the supervised pipeline') +
    '. The advantage is largest where transcripts are scarcest and disappears entirely once there is enough paired data to train on directly, which is the honest summary of what pre-training buys.');
}

/* ── The Mask Painter ─────────────────────────────────────── */
let _slm = {mask:{}, pi:0.08, len:10};
function slmBuild(){
  _slm = {mask:{}, pi:0.08, len:10};
  const host = document.getElementById('slm-ctrl');
  if(host) host.innerHTML =
    '<div style="min-width:130px"><div style="' + MTLBL + ';margin-bottom:3px">start prob \u03c0 <b id="slm-p-v" style="color:var(--accent)">0.08</b></div>' +
    '<input id="slm-p" type="range" min="0.01" max="0.3" step="0.01" value="0.08" oninput="slmUpd()" style="width:100%;accent-color:var(--accent)"></div>' +
    '<div style="min-width:130px"><div style="' + MTLBL + ';margin-bottom:3px">span length \u2113 <b id="slm-l-v" style="color:var(--accent2)">10</b></div>' +
    '<input id="slm-l" type="range" min="1" max="20" step="1" value="10" oninput="slmUpd()" style="width:100%;accent-color:var(--accent2)"></div>' +
    '<button style="' + MTBTN + '" onclick="slmSample()">sample spans</button>' +
    '<button style="' + MTBTN + '" onclick="slmClear()">clear</button>';
  slmUpd();
}
function slmUpd(){
  const a = document.getElementById('slm-p'), b = document.getElementById('slm-l');
  if(a) _slm.pi = +a.value;
  if(b) _slm.len = Math.round(+b.value);
  mtSet('slm-p-v', _slm.pi.toFixed(2));
  mtSet('slm-l-v', _slm.len);
  slmDraw();
}
function slmClear(){ _slm.mask = {}; slmDraw(); }
function slmSample(){
  _slm.mask = {};
  const N = 60;
  for(let i=0;i<N;i++){
    if(shsR(i * 3 + Math.round(_slm.pi * 100), 7) < _slm.pi){
      for(let q=0;q<_slm.len && i+q<N;q++) _slm.mask[i+q] = 1;
    }
  }
  slmDraw();
}
function slmDraw(){
  const c = mtCtx('slm-canvas', 220); if(!c) return;
  const {x, w, cv} = c;
  const N = 60, L = 74, PW = w - L - 16, cw = PW / N;
  const units = [];
  for(let i=0;i<N;i++) units.push(((i*37 + Math.floor(i/4)*11) % 100));
  mtTxt(x, 'frames', 6, 42, {size:8.5, col:MTC.muted});
  for(let i=0;i<N;i++){
    const m = _slm.mask[i];
    const amp = 0.3 + 0.55 * Math.abs(Math.sin(i * 0.6) * Math.cos(i * 0.21));
    if(m){
      mtChip(x, L + i*cw, 28, cw - 0.8, 28, 'rgba(159,18,57,0.30)', MTC.a2, '', MTC.text, 7);
      mtTxt(x, 'M', L + i*cw + cw/2, 42, {size:7, col:MTC.a2, align:'center'});
    } else {
      const hh = amp * 26;
      x.fillStyle = 'rgba(79,70,229,0.35)';
      x.fillRect(L + i*cw, 28 + 28 - hh, cw - 0.8, hh);
    }
  }
  mtTxt(x, 'masked positions carry the shared MASK embedding, not the frame', L, 72, {size:8, col:MTC.muted});
  // target row
  mtTxt(x, 'target', 6, 106, {size:8.5, col:MTC.muted});
  for(let i=0;i<N;i++){
    const m = _slm.mask[i];
    mtChip(x, L + i*cw, 92, cw - 0.8, 20,
      m ? 'rgba(165,104,14,0.28)' : 'rgba(23,27,52,0.03)',
      m ? MTC.a5 : MTC.line, m ? String(units[i]) : '', MTC.a5, 6.5);
  }
  mtTxt(x, 'only masked positions contribute to the loss; unmasked positions are scored by nothing',
    L, 128, {size:8, col:MTC.muted});
  // coverage arithmetic
  const nMask = Object.keys(_slm.mask).length;
  const expected = 1 - Math.pow(1 - _slm.pi, _slm.len);
  mtTxt(x, 'expected coverage 1 \u2212 (1 \u2212 ' + _slm.pi.toFixed(2) + ')^' + _slm.len + ' = ' +
    (expected*100).toFixed(0) + '%', L, 160, {size:9.5, col:MTC.a5, weight:'700'});
  mtTxt(x, 'painted coverage ' + nMask + ' / ' + N + ' = ' + (100*nMask/N).toFixed(0) + '%',
    L, 180, {size:9.5, col:MTC.a2, weight:'700'});
  mtTxt(x, 'click any frame to toggle it, or sample spans from \u03c0 and \u2113', L, 202, {size:8.5, col:MTC.muted});
  if(cv && !cv._slmBound){
    cv._slmBound = 1;
    cv.addEventListener('click', ev=>{
      const r = cv.getBoundingClientRect();
      const mx = ev.clientX - r.left, my = ev.clientY - r.top;
      if(my < 20 || my > 116) return;
      const i = Math.floor((mx - L) / ((cv.clientWidth - L - 16) / N));
      if(i >= 0 && i < N){ if(_slm.mask[i]) delete _slm.mask[i]; else _slm.mask[i] = 1; slmDraw(); }
    });
  }
  mtSet('slm-cap', nMask === 0
    ? 'Nothing is masked, so the loss has no terms and the model learns nothing. Paint a span or press <b>sample spans</b>.'
    : 'Spans of ' + _slm.len + ' frames are long enough that interpolation from the surviving neighbours will not recover the hidden content, which is exactly the property that makes the task teach something. Single-frame masking is far too easy: adjacent 10 ms frames overlap by most of their analysis window.');
}

/* ══ 15.4.1 ONE FORWARD PASS ══════════════════════════════ */
ASR_PAGES.asrpass = `
<div class="lesson-chapter-label">Section 15.4.1</div>
<h1 class="lesson-h1">One Forward Pass Through a Masked Speech Encoder</h1>
<p class="lesson-intro">The architecture is easier to follow as a single trace than as a block diagram. Pick one position in the waveform and follow the number that comes out of it all the way to a distribution over a hundred learned classes, watching the shape of the representation change at every stage.</p>

<h2 class="lesson-h2">Comparing by Angle, Not Distance</h2>
<p class="lesson-p">The final stage compares a projected hidden state against a codebook of class embeddings, and the comparison is a cosine:</p>
<div class="lesson-math">\\[\\mathrm{sim}(\\mathbf{a}, \\mathbf{b}) = \\frac{\\mathbf{a} \\cdot \\mathbf{b}}{\\lVert \\mathbf{a} \\rVert \\, \\lVert \\mathbf{b} \\rVert}\\]</div>
<p class="lesson-p">Cosine ignores magnitude, which matters because loudness should not decide which speech unit was uttered. The similarities become a distribution through a softmax with a temperature \\(\\tau\\):</p>
<div class="lesson-math">\\[p(c \\mid \\mathbf{X}, t) = \\frac{\\exp\\!\\left(\\mathrm{sim}(\\mathbf{A}\\mathbf{h}_t, \\mathbf{e}_c)/\\tau\\right)}{\\sum_{c'=1}^{|C|} \\exp\\!\\left(\\mathrm{sim}(\\mathbf{A}\\mathbf{h}_t, \\mathbf{e}_{c'})/\\tau\\right)}\\]</div>
<p class="lesson-p">The temperature is not cosmetic, and its effect can be bounded exactly. Cosine similarity lies in \\([-1, 1]\\), so with \\(\\tau = 0.1\\) the logits are confined to \\([-10, 10]\\). The sharpest distribution obtainable with \\(|C| = 100\\) classes therefore puts one logit at \\(10\\) and the remaining ninety-nine at \\(-10\\):</p>
<div class="lesson-math">\\[p_{\\max} = \\frac{e^{10}}{e^{10} + 99e^{-10}} \\approx 1 - 99e^{-20}\\]</div>
<p class="lesson-p">Which is within two parts in ten million of certainty. Without the temperature the same logits would be confined to \\([-1, 1]\\), and the sharpest achievable posterior would be about \\(e/(e + 99e^{-1}) \\approx 0.069\\): the model could not express confidence even when it had it. Turn the dial and watch the bars collapse.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Stack Tracer</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="sst-ctrl"></div>
    <canvas id="sst-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="sst-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qas-st"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is a temperature needed at all when the scores are cosine similarities?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-st','Correct. Cosine is bounded in [-1,1], so without dividing by a small temperature the softmax over 100 classes cannot produce a confident distribution however clear the evidence.')">Cosine is bounded in [-1, 1], so the softmax could not express confidence without rescaling</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-st','Cosine similarity is already scale-invariant in its inputs; the temperature acts on the output logits.')">It normalizes the hidden state to unit length</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-st','The number of classes is fixed by the clustering step, not by the temperature.')">It controls how many classes the codebook contains</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-st','Masking is applied to the input before the transformer; the temperature is applied to the output logits.')">It decides which frames get masked</button>
</div><div class="quiz-explain" id="qas-st-explain"></div></div>`;

/* ── The Stack Tracer ─────────────────────────────────────── */
const SST_K = [10,3,3,3,3,2,2], SST_S = [5,2,2,2,2,2,2];
let _sst = {t:18, tau:0.1, masked:false};
function sstBuild(){
  _sst = {t:18, tau:0.1, masked:false};
  const host = document.getElementById('sst-ctrl');
  if(host) host.innerHTML =
    '<div style="min-width:150px"><div style="' + MTLBL + ';margin-bottom:3px">temperature \u03c4 <b id="sst-t-v" style="color:var(--accent)">0.10</b></div>' +
    '<input id="sst-t" type="range" min="0.02" max="1" step="0.01" value="0.1" oninput="sstUpd()" style="width:100%;accent-color:var(--accent)"></div>' +
    '<button style="' + MTBTN + '" id="sst-m" onclick="sstMask()">mask this frame</button>';
  sstUpd();
}
function sstMask(){ _sst.masked = !_sst.masked; sstDraw(); }
function sstUpd(){
  const el = document.getElementById('sst-t');
  if(el) _sst.tau = +el.value;
  mtSet('sst-t-v', _sst.tau.toFixed(2));
  sstDraw();
}
function sstSims(t, masked){
  const a = [];
  for(let c=0;c<100;c++){
    let v = Math.sin(c * 1.7 + t * 0.31) * 0.42 + Math.cos(c * 0.53 - t * 0.11) * 0.28;
    if(!masked && c === ((t * 7) % 100)) v = 0.93;
    if(masked && c === ((t * 7 + 3) % 100)) v = 0.61;
    a.push(Math.max(-1, Math.min(1, v)));
  }
  return a;
}
function sstDraw(){
  const c = mtCtx('sst-canvas', 366); if(!c) return;
  const {x, w, cv} = c;
  const mb = document.getElementById('sst-m');
  if(mb){ mb.style.background = _sst.masked ? 'var(--accent2)' : 'var(--surface2)';
          mb.style.color = _sst.masked ? '#FAFBFF' : 'var(--muted)'; }
  const L = 24, PW = w - L - 24;
  const NF = 40;                                  // output vectors shown
  const fw = PW / NF;
  // stage 1: raw waveform
  mtTxt(x, 'raw waveform \u00b7 16 kHz \u00b7 ' + (NF * 320) + ' samples', L, 16, {size:9, col:MTC.text, weight:'700'});
  const wy = 40, wh = 18;
  x.strokeStyle = 'rgba(79,70,229,0.55)'; x.lineWidth = 1;
  x.beginPath();
  for(let i=0;i<PW;i+=1){
    const s = i / PW * 40;
    const v = (Math.sin(s*9.1) * 0.5 + Math.sin(s*23.7) * 0.3 + Math.sin(s*3.3) * 0.4) *
              (0.35 + 0.6 * Math.abs(Math.sin(s*0.42))) * wh;
    x.moveTo(L + i, wy - v); x.lineTo(L + i, wy + v);
  }
  x.stroke();
  // receptive-field bracket back onto the waveform
  let prod = 1, R = 1;
  for(let l=0;l<7;l++){ R += (SST_K[l]-1)*prod; prod *= SST_S[l]; }
  const rfW = (R / 320) * fw;
  const cx = L + _sst.t * fw + fw/2;
  x.strokeStyle = MTC.a5; x.lineWidth = 1.4;
  x.beginPath();
  x.moveTo(cx - rfW/2, wy + wh + 6); x.lineTo(cx - rfW/2, wy + wh + 11);
  x.lineTo(cx + rfW/2, wy + wh + 11); x.lineTo(cx + rfW/2, wy + wh + 6);
  x.stroke();
  mtTxt(x, 'R\u2087 = ' + R + ' samples = 25 ms', cx + rfW/2 + 6, wy + wh + 11, {size:8, col:MTC.a5});
  // stage 2: conv output
  const cy2 = 86;
  mtTxt(x, '7 strided convolutions \u00b7 \u220f s = ' + prod + ' \u00b7 one vector per 20 ms',
    L, cy2 - 8, {size:8.5, col:MTC.a1});
  _sst.hit = {y:cy2, h:22, fw:fw, L:L, N:NF};
  for(let i=0;i<NF;i++){
    const sel = i === _sst.t;
    const m = sel && _sst.masked;
    mtChip(x, L + i*fw, cy2, fw - 1, 22,
      m ? 'rgba(159,18,57,0.35)' : (sel ? 'rgba(165,104,14,0.35)' : 'rgba(79,70,229,0.14)'),
      sel ? (m ? MTC.a2 : MTC.a5) : MTC.line, m ? 'M' : '', MTC.a2, 7);
  }
  mtTxt(x, 'click any position to trace it', L + PW, cy2 + 34, {size:8, col:MTC.muted, align:'right'});
  // stage 3: transformer
  const ty = 132;
  mtChip(x, L, ty, PW, 26, 'rgba(79,70,229,0.10)', MTC.line,
    'transformer encoder \u00b7 12 blocks \u00b7 d = 768 \u00b7 every position sees every other', MTC.text, 9);
  // stage 4: projection
  const py = 172;
  mtChip(x, L, py, PW * 0.44, 22, 'rgba(79,70,229,0.14)', MTC.line,
    'h\u209c \u2208 \u211d\u2077\u2076\u2078', MTC.text, 9);
  mtChip(x, L + PW * 0.48, py, PW * 0.52, 22, 'rgba(165,104,14,0.20)', MTC.a5,
    'A h\u209c \u2208 \u211d\u00b2\u2075\u2076   (projection A: 768 \u2192 256)', MTC.a5, 9);
  // stage 5: cosine fan + softmax
  const sims = sstSims(_sst.t, _sst.masked);
  const logits = sims.map(v=>v / _sst.tau);
  const mx = Math.max(...logits);
  const ex = logits.map(v=>Math.exp(v - mx));
  const z = ex.reduce((a,b)=>a+b, 0);
  const post = ex.map(v=>v / z);
  const idx = post.map((p,i)=>[p,i]).sort((a,b)=>b[0]-a[0]).slice(0, 14);
  const by = 240, bh = 74;
  mtTxt(x, 'cosine against 100 class embeddings, then softmax at \u03c4 = ' + _sst.tau.toFixed(2) +
    ' \u00b7 top 14 shown', L, by - 10, {size:8.5, col:MTC.a2});
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L, by + bh); x.lineTo(L + PW, by + bh); x.stroke();
  const bw2 = PW / 14;
  idx.forEach(([p, ci], j)=>{
    const hh = Math.max(1, p * bh);
    x.fillStyle = j === 0 ? 'rgba(159,18,57,0.62)' : 'rgba(79,70,229,0.34)';
    x.fillRect(L + j*bw2 + 4, by + bh - hh, bw2 - 9, hh);
    mtTxt(x, 'c' + ci, L + j*bw2 + bw2/2, by + bh + 12, {size:7.5, col:MTC.muted, align:'center'});
    if(j < 4) mtTxt(x, (p*100).toFixed(p > 0.1 ? 0 : 1) + '%',
      L + j*bw2 + bw2/2, by + bh - hh - 8, {size:7.5, col:MTC.text, align:'center'});
  });
  const top = idx[0];
  const pmaxTheory = Math.exp(1/_sst.tau) / (Math.exp(1/_sst.tau) + 99*Math.exp(-1/_sst.tau));
  mtTxt(x, 'top similarity ' + sims[top[1]].toFixed(2) + ' \u2192 logit ' +
    (sims[top[1]]/_sst.tau).toFixed(1) + ' \u2192 posterior ' + (top[0]*100).toFixed(2) + '%',
    L, by + bh + 34, {size:9.5, col:MTC.text, weight:'700'});
  mtTxt(x, 'ceiling at this \u03c4, with logits pinned to \u00b11/\u03c4: ' + (pmaxTheory*100).toFixed(4) + '%',
    L, by + bh + 52, {size:9, col:MTC.a5});
  if(cv && !cv._sstBound){
    cv._sstBound = 1;
    cv.addEventListener('click', ev=>{
      const r = cv.getBoundingClientRect();
      const mx2 = ev.clientX - r.left, my = ev.clientY - r.top;
      const H = _sst.hit;
      if(H && my >= H.y - 6 && my <= H.y + H.h + 6){
        const i = Math.floor((mx2 - L) / ((cv.clientWidth - 48) / NF));
        if(i >= 0 && i < NF){ _sst.t = i; sstDraw(); }
      }
    });
  }
  mtSet('sst-cap', (_sst.masked
    ? 'Position ' + (_sst.t+1) + ' is masked, so its convolutional output is replaced by the shared MASK embedding before the transformer runs. The distribution flattens: the model has to infer the unit from surrounding context alone, which is precisely the task the objective sets. '
    : 'Position ' + (_sst.t+1) + ' passes through unmasked, so the transformer sees its own acoustic evidence and the posterior is sharp. ') +
    'Lowering \u03c4 stretches the bounded cosine range into usable logits; raising it toward 1 compresses every class toward uniform.');
}

/* ══ 15.4.2 BOOTSTRAPPING TARGETS ═════════════════════════ */
ASR_PAGES.asrtgt = `
<div class="lesson-chapter-label">Section 15.4.2</div>
<h1 class="lesson-h1">Bootstrapping Targets, Then Replacing Them</h1>
<p class="lesson-intro">There is an obvious objection to the previous section. The model is trained to predict discrete units, but the units were supposed to be what the model was learning. Where does the first set come from? The answer is that they come from somewhere crude, they are good enough to get started, and then they are thrown away and replaced with better ones derived from the partly-trained model.</p>

<h2 class="lesson-h2">The Loss Is Restricted to Masked Positions</h2>
<p class="lesson-p">With \\(M\\) the set of masked time steps and \\(z_t\\) the target unit at step \\(t\\):</p>
<div class="lesson-math">\\[L = -\\sum_{t \\in M} \\log p(z_t \\mid \\mathbf{X}, t)\\]</div>
<p class="lesson-p">The restriction is load-bearing. If unmasked positions were also scored, the model could satisfy most of the objective by learning to reproduce the unit assignment of a frame it can see directly, which is a lookup rather than a model. Scoring only hidden positions forces every gradient to come from an inference about something absent.</p>

<h2 class="lesson-h2">Two Stages</h2>
<p class="lesson-p">Stage one clusters plain MFCC vectors over the whole corpus. These features carry phonetic information but also carry speaker and channel information, so the clusters are noisy. Stage two runs the audio through the model trained on those noisy targets, pulls out an intermediate layer, and clusters that instead. The representations at that layer have already had context applied to them, so the resulting units track linguistic content more closely.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Target Swap</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="sts-ctrl"></div>
    <canvas id="sts-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="sts-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The quantity being improved is measurable without ever using the units as phone labels. Take a corpus that does have phone annotations \\(\\phi\\), and measure how much knowing the cluster assignment \\(z\\) tells you about the phone, normalized so the number does not simply grow with the number of clusters:</p>
<div class="lesson-math">\\[\\mathrm{NMI}(z, \\phi) = \\frac{2\\,I(z; \\phi)}{H(z) + H(\\phi)}\\]</div>
<p class="lesson-p">Nothing in training uses \\(\\phi\\). It is an evaluation instrument only, and the fact that the number rises between stages is the entire empirical justification for doing the clustering twice rather than once.</p>

<h2 class="lesson-h2">What Happens After Pre-training</h2>
<p class="lesson-p">The projection and the cosine comparison are discarded. In their place goes a linear layer onto the actual output alphabet, 26 letters plus a few symbols and a blank, which for a character-level system is</p>
<div class="lesson-math">\\[\\mathbf{W} \\in \\mathbb{R}^{29 \\times d}\\]</div>
<p class="lesson-p">The convolutional layers are frozen, since their job of turning samples into frames is already done and fine-tuning them on a small transcript set risks damaging it. The rest is trained with the CTC loss of the next section.</p>

<div class="quiz-block" id="qas-tg"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is the loss computed only over masked positions?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-tg','Correct. Scoring visible positions would let the model satisfy the objective by reproducing an assignment it can read off the input, which teaches nothing.')">Scoring visible positions would let the model succeed by copying an assignment it can already see</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-tg','Computing the extra terms is cheap; the reason is what those terms would reward.')">Computing the loss at every position would be too expensive</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-tg','Every position has a cluster assignment, masked or not; the targets exist either way.')">Unmasked positions have no target units assigned to them</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-tg','Gradients flow through the whole sequence regardless; the restriction is on where loss terms are placed.')">Gradients cannot propagate through unmasked positions</button>
</div><div class="quiz-explain" id="qas-tg-explain"></div></div>`;

/* ── The Target Swap ──────────────────────────────────────── */
let _sts = {stage:1, everything:false};
function stsBuild(){
  _sts = {stage:1, everything:false};
  const host = document.getElementById('sts-ctrl');
  if(host) host.innerHTML =
    '<button style="' + MTBTN + '" class="sts-b" data-s="1" onclick="stsStage(1)">stage 1 \u00b7 MFCC clusters</button>' +
    '<button style="' + MTBTN + '" class="sts-b" data-s="2" onclick="stsStage(2)">stage 2 \u00b7 layer-6 clusters</button>' +
    '<button style="' + MTBTN + '" id="sts-e" onclick="stsEvery()">score everything instead</button>';
  stsStage(1);
}
function stsEvery(){ _sts.everything = !_sts.everything; stsDraw(); }
function stsStage(s){
  _sts.stage = s;
  document.querySelectorAll('.sts-b').forEach(b=>{
    const on = +b.dataset.s === s;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
  });
  stsDraw();
}
function stsDraw(){
  const c = mtCtx('sts-canvas', 300); if(!c) return;
  const {x, w} = c;
  const eb = document.getElementById('sts-e');
  if(eb){ eb.style.background = _sts.everything ? 'var(--accent3)' : 'var(--surface2)';
          eb.style.color = _sts.everything ? '#FAFBFF' : 'var(--muted)'; }
  const L = 24, PW = w - L - 24;
  const S = _sts.stage === 1
    ? {src:'MFCC frames', dim:39, K:100, N:'1.7 \u00d7 10\u2078 vectors', nmi:0.34,
       from:'raw feature extraction', note:'speaker and channel variation sits in these features alongside the phonetic content, so the clusters mix them'}
    : {src:'layer-6 activations', dim:768, K:500, N:'0.1 \u00d7 1.7 \u00d7 10\u2078 vectors', nmi:0.63,
       from:'the model trained on stage-1 targets', note:'context has already been applied at layer 6, so the clusters track what was said far more closely'};
  // pipeline row
  const boxes = [
    {t:S.src, s:'\u211d^' + S.dim, col:'12,110,114'},
    {t:'k-means', s:'K = ' + S.K, col:'165,104,14'},
    {t:'codebook', s:S.K + ' entries', col:'165,104,14'},
    {t:'targets z\u209c', s:S.N, col:'162,50,83'}
  ];
  const bw = (PW - 3*44) / 4;
  boxes.forEach((b, i)=>{
    const bx = L + i*(bw + 44);
    mtChip(x, bx, 44, bw, 44, 'rgba(' + b.col + ',0.14)', 'rgba(' + b.col + ',0.55)', '', MTC.text, 9);
    mtTxt(x, b.t, bx + bw/2, 60, {size:9, col:MTC.text, align:'center', weight:'700'});
    mtTxt(x, b.s, bx + bw/2, 76, {size:8, col:MTC.muted, align:'center'});
    if(i < 3){
      x.strokeStyle = MTC.line2; x.lineWidth = 1.4;
      x.beginPath(); x.moveTo(bx + bw + 6, 66); x.lineTo(bx + bw + 36, 66); x.stroke();
      x.fillStyle = MTC.line2;
      x.beginPath(); x.moveTo(bx + bw + 38, 66); x.lineTo(bx + bw + 32, 63); x.lineTo(bx + bw + 32, 69); x.closePath(); x.fill();
    }
  });
  mtTxt(x, 'source: ' + S.from, L, 24, {size:9, col:MTC.a1, weight:'700'});
  // NMI meter
  const my = 122;
  mtTxt(x, 'cluster quality against held-out phone labels, NMI', L, my, {size:9, col:MTC.text, weight:'700'});
  const mw = PW * 0.6;
  mtRR(x, L, my + 10, mw, 18, 5); x.fillStyle = 'rgba(23,27,52,0.05)'; x.fill();
  mtRR(x, L, my + 10, mw * 0.34, 18, 5); x.fillStyle = 'rgba(79,70,229,0.35)'; x.fill();
  if(_sts.stage === 2){
    mtRR(x, L + mw*0.34, my + 10, mw * (0.63 - 0.34), 18, 5);
    x.fillStyle = 'rgba(11,132,87,0.55)'; x.fill();
  }
  mtTxt(x, S.nmi.toFixed(2), L + mw + 10, my + 19, {size:11, col: _sts.stage === 2 ? MTC.a4 : MTC.a1, weight:'700'});
  mtTxt(x, _sts.stage === 2 ? 'up from 0.34 after one refinement' : 'starting point',
    L + mw + 46, my + 19, {size:8.5, col:MTC.muted});
  // loss coverage strip
  const ly = 186, N = 48, cw = PW / N;
  mtTxt(x, _sts.everything ? 'loss over every position (the degenerate variant)' : 'loss over masked positions only',
    L, ly, {size:9, col: _sts.everything ? MTC.a3 : MTC.a5, weight:'700'});
  const maskSet = {};
  [6,7,8,9,10,11,12,20,21,22,23,24,25,26,27,28,36,37,38,39,40,41].forEach(i=>maskSet[i]=1);
  for(let i=0;i<N;i++){
    const m = maskSet[i], scored = _sts.everything || m;
    mtChip(x, L + i*cw, ly + 10, cw - 0.8, 20,
      m ? 'rgba(159,18,57,0.28)' : 'rgba(79,70,229,0.12)',
      MTC.line, '', MTC.text, 7);
    if(scored){
      x.fillStyle = _sts.everything && !m ? 'rgba(178,58,91,0.65)' : 'rgba(165,104,14,0.75)';
      x.fillRect(L + i*cw, ly + 34, cw - 0.8, 5);
    }
  }
  mtTxt(x, 'amber marks positions that contribute a loss term', L, ly + 54, {size:8, col:MTC.muted});
  mtTxt(x, 'after pre-training: drop A and the cosine head, attach W \u2208 \u211d\u00b2\u2079\u02e3\u1d48, freeze the conv layers, train with CTC',
    L, 282, {size:9, col:MTC.a4});
  mtSet('sts-cap', _sts.everything
    ? 'With every position scored, most of the loss comes from positions whose frame the model can see. It can satisfy those terms by learning the mapping from a visible frame to its own cluster id, which is a lookup table, and the masked positions get lost in the average. The objective stops teaching anything about context.'
    : S.note + '. Nothing in training touches phone labels; NMI is measured afterwards purely to check that the refinement did what it was supposed to do.');
}

/* ══ 15.4.3 k-MEANS ═══════════════════════════════════════ */
ASR_PAGES.asrkm = `
<div class="lesson-chapter-label">Section 15.4.3</div>
<h1 class="lesson-h1">Turning Vectors into Discrete Symbols with k-Means</h1>
<p class="lesson-intro">K-means turns continuous feature vectors into a finite set of cluster labels. We will work through assignment and centroid updates, then show why each step cannot increase the clustering objective. That guarantee does not imply a global optimum.</p>

<h2 class="lesson-h2">The Two Half-Steps</h2>
<p class="lesson-p">Start with \\(K\\) centroids \\(\\mu_k \\in \\mathbb{R}^d\\) placed at random, with \\(N \\gg K\\) data vectors. The algorithm then alternates. Assign every vector to its nearest centroid under squared Euclidean distance:</p>
<div class="lesson-math">\\[\\mathrm{cluster}(i) = \\arg\\min_{1 \\le j \\le K} \\lVert \\mathbf{v}^{(i)} - \\mu_j \\rVert^2, \\qquad \\lVert \\mathbf{v} \\rVert^2 = \\sum_{j=1}^{d} v_j^2\\]</div>
<p class="lesson-p">Then move every centroid to the mean of the vectors currently assigned to it, writing \\(S_i\\) for that set:</p>
<div class="lesson-math">\\[\\mu_i = \\frac{1}{|S_i|}\\sum_{\\mathbf{v} \\in S_i} \\mathbf{v}\\]</div>
<p class="lesson-p">Both half-steps are minimizing the same quantity, the total squared distortion:</p>
<div class="lesson-math">\\[J = \\sum_{i=1}^{N} \\lVert \\mathbf{v}^{(i)} - \\mu_{\\mathrm{cluster}(i)} \\rVert^2\\]</div>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Codebook Builder</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="skm-ctrl"></div>
    <canvas id="skm-canvas" data-w="660" style="width:100%;display:block;cursor:crosshair"></canvas>
    <div id="skm-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Why It Converges</h2>
<p class="lesson-p">The distortion counter above never rises, and the reason is that each half-step is an exact minimization of \\(J\\) over one of its two arguments while the other is held fixed. The assignment step is immediate: with centroids fixed, \\(J\\) is a sum of independent terms, one per vector, and assigning each vector to its nearest centroid minimizes its own term, so it minimizes the sum. The re-estimation step needs one derivative. Holding the assignments fixed, differentiate the contribution of cluster \\(i\\) with respect to its centroid:</p>
<div class="lesson-math">\\[\\frac{\\partial}{\\partial \\mu_i} \\sum_{\\mathbf{v} \\in S_i} \\lVert \\mathbf{v} - \\mu_i \\rVert^2 = -2\\sum_{\\mathbf{v} \\in S_i} (\\mathbf{v} - \\mu_i) = 0 \\quad \\Longrightarrow \\quad \\mu_i = \\bar{\\mathbf{v}}_{S_i}\\]</div>
<p class="lesson-p">So the mean is not a heuristic choice; it is the unique stationary point, and since the objective is a positive-definite quadratic in \\(\\mu_i\\) it is the minimum. Both steps are therefore non-increasing in \\(J\\), and \\(J \\ge 0\\) is bounded below, so the sequence of distortion values converges.</p>
<p class="lesson-p">What it converges to is a different question. The guarantee is only that no single step makes things worse, which is a statement about local behaviour. Different initializations reach different fixed points, sometimes markedly different ones. Press <em>re-seed</em> a few times and watch the final distortion land on different values from the same data.</p>
<p class="lesson-p">Each iteration compares every vector against every centroid, which costs</p>
<div class="lesson-math">\\[O(NKd)\\]</div>
<p class="lesson-p">With \\(N \\approx 1.7 \\times 10^8\\) MFCC vectors, \\(K = 100\\) and \\(d = 39\\), one iteration is about \\(6.6 \\times 10^{11}\\) multiply-accumulates, which is why the second-stage clustering runs on a tenth of the data.</p>

<div class="quiz-block" id="qas-km"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What exactly does the convergence argument guarantee?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-km','Correct. Each half-step exactly minimizes J over one argument with the other fixed, so J never increases, and being bounded below it converges \\u2014 to a local minimum that depends on the initialization.')">That the distortion never increases and therefore converges, to a point that depends on the initialization</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-km','Nothing in the argument rules out better partitions; different seeds demonstrably reach different distortions.')">That the partition found minimizes distortion over all possible partitions</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-km','The number of iterations is not bounded by the argument, only the monotonicity of the objective.')">That convergence happens within K iterations</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-km','Cluster sizes can be wildly unequal, and empty clusters are a real failure mode that implementations handle explicitly.')">That every cluster ends up with the same number of vectors</button>
</div><div class="quiz-explain" id="qas-km-explain"></div></div>`;

/* ── The Codebook Builder ─────────────────────────────────── */
function skmRnd(seed){ let s = seed; return function(){ s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; }
const SKM_PTS = (function(){
  const r = skmRnd(20260823), pts = [];
  const blobs = [[0.22,0.28],[0.68,0.22],[0.46,0.62],[0.80,0.72],[0.16,0.76]];
  blobs.forEach((b, bi)=>{
    for(let i=0;i<30;i++){
      const a = r() * 6.2832, m = Math.pow(r(), 0.7) * (0.075 + 0.05 * (bi % 2));
      pts.push({x:b[0] + Math.cos(a)*m, y:b[1] + Math.sin(a)*m*0.85, b:bi});
    }
  });
  return pts;
})();
let _skm = {k:4, cent:[], asg:[], J:0, hist:[], seed:7, iters:0, mode:'cluster', elbow:null};
function skmDist(p, c){ const dx = p.x - c.x, dy = p.y - c.y; return dx*dx + dy*dy; }
function skmSeed(k, seed){
  const r = skmRnd(seed), cs = [];
  for(let i=0;i<k;i++) cs.push({x:0.12 + r()*0.76, y:0.12 + r()*0.76});
  return cs;
}
function skmAssignArr(pts, cent){
  return pts.map(p=>{
    let best = 0, bd = 1e9;
    cent.forEach((c, j)=>{ const d = skmDist(p, c); if(d < bd){ bd = d; best = j; } });
    return best;
  });
}
function skmJ(pts, cent, asg){
  let J = 0;
  pts.forEach((p, i)=>{ J += skmDist(p, cent[asg[i]]); });
  return J;
}
function skmRecentre(pts, cent, asg){
  const sx = cent.map(()=>0), sy = cent.map(()=>0), n = cent.map(()=>0);
  pts.forEach((p, i)=>{ sx[asg[i]] += p.x; sy[asg[i]] += p.y; n[asg[i]]++; });
  return cent.map((c, j)=> n[j] ? {x:sx[j]/n[j], y:sy[j]/n[j]} : c);
}
function skmFull(k, seed, iters){
  let cent = skmSeed(k, seed), asg = skmAssignArr(SKM_PTS, cent);
  for(let i=0;i<iters;i++){
    cent = skmRecentre(SKM_PTS, cent, asg);
    asg = skmAssignArr(SKM_PTS, cent);
  }
  return {cent:cent, asg:asg, J:skmJ(SKM_PTS, cent, asg)};
}
function skmBuild(){
  _skm = {k:4, cent:[], asg:[], J:0, hist:[], seed:7, iters:0, mode:'cluster', elbow:null};
  const host = document.getElementById('skm-ctrl');
  if(host) host.innerHTML =
    '<div style="min-width:110px"><div style="' + MTLBL + ';margin-bottom:3px">K <b id="skm-k-v" style="color:var(--accent)">4</b></div>' +
    '<input id="skm-k" type="range" min="2" max="8" step="1" value="4" oninput="skmK()" style="width:100%;accent-color:var(--accent)"></div>' +
    '<button style="' + MTBTN + '" onclick="skmStep(0)">assign</button>' +
    '<button style="' + MTBTN + '" onclick="skmStep(1)">re-estimate</button>' +
    '<button style="' + MTBTN + '" onclick="skmRun()">run 10</button>' +
    '<button style="' + MTBTN + '" onclick="skmReseed()">re-seed</button>' +
    '<button style="' + MTBTN + '" id="skm-q" onclick="skmMode()">quantize an utterance</button>';
  skmReset();
}
function skmReset(){
  _skm.cent = skmSeed(_skm.k, _skm.seed);
  _skm.asg = skmAssignArr(SKM_PTS, _skm.cent);
  _skm.J = skmJ(SKM_PTS, _skm.cent, _skm.asg);
  _skm.hist = [_skm.J]; _skm.iters = 0;
  skmDraw();
}
function skmK(){
  const el = document.getElementById('skm-k');
  if(el) _skm.k = Math.max(2, Math.min(8, Math.round(+el.value)));
  mtSet('skm-k-v', _skm.k);
  skmReset();
}
function skmReseed(){ _skm.seed = (_skm.seed * 31 + 17) % 99991; skmReset(); }
function skmMode(){
  _skm.mode = _skm.mode === 'cluster' ? 'quant' : 'cluster';
  const b = document.getElementById('skm-q');
  if(b){ b.style.background = _skm.mode === 'quant' ? 'var(--accent2)' : 'var(--surface2)';
         b.style.color = _skm.mode === 'quant' ? '#FAFBFF' : 'var(--muted)'; }
  skmDraw();
}
function skmStep(which){
  if(which === 0) _skm.asg = skmAssignArr(SKM_PTS, _skm.cent);
  else { _skm.cent = skmRecentre(SKM_PTS, _skm.cent, _skm.asg); _skm.iters++; }
  _skm.J = skmJ(SKM_PTS, _skm.cent, _skm.asg);
  _skm.hist.push(_skm.J);
  if(_skm.hist.length > 40) _skm.hist.shift();
  skmDraw();
}
function skmRun(){ for(let i=0;i<10;i++){ skmStep(1); skmStep(0); } }
function skmCols(){ return ['#4F46E5','#9F1239','#B45309','#0B8457','#5B4B9E','#9F1239','#2E7D8F','#7A5C1E']; }
function skmDraw(){
  const c = mtCtx('skm-canvas', 340); if(!c) return;
  const {x, w, cv} = c;
  const cols = skmCols();
  const PS = 300, L = 16, T = 22;
  const sx = v => L + v * PS, sy = v => T + (1 - v) * (PS - 40);
  if(_skm.mode === 'cluster'){
    // Voronoi shading, sampled on a coarse grid
    for(let gx=0; gx<PS; gx+=7) for(let gy=0; gy<PS-40; gy+=7){
      const p = {x:gx/PS, y:1 - gy/(PS-40)};
      let best = 0, bd = 1e9;
      _skm.cent.forEach((cc, j)=>{ const d = skmDist(p, cc); if(d < bd){ bd = d; best = j; } });
      x.fillStyle = cols[best % cols.length] + '14';
      x.fillRect(L + gx, T + gy, 7, 7);
    }
    // points
    SKM_PTS.forEach((p, i)=>{
      x.fillStyle = cols[_skm.asg[i] % cols.length] + 'AA';
      x.beginPath(); x.arc(sx(p.x), sy(p.y), 2.6, 0, 7); x.fill();
    });
    // centroids
    _skm.cent.forEach((cc, j)=>{
      x.fillStyle = cols[j % cols.length];
      x.strokeStyle = '#FAFBFF'; x.lineWidth = 2;
      x.beginPath(); x.arc(sx(cc.x), sy(cc.y), 6.5, 0, 7); x.fill(); x.stroke();
      mtTxt(x, String(j), sx(cc.x), sy(cc.y), {size:8, col:'#FAFBFF', align:'center', weight:'700'});
    });
    mtTxt(x, 'click anywhere to drag the nearest centroid there', L, T + PS - 26, {size:8, col:MTC.muted});
  } else {
    // quantize a synthetic utterance: 90 frames coloured by assignment
    const NF = 90, fw = PS / NF;
    mtTxt(x, 'a 1.8 s utterance quantized against the current codebook', L, T + 6, {size:9, col:MTC.text, weight:'700'});
    const syms = [];
    for(let i=0;i<NF;i++){
      const t = i / NF;
      const p = {x:0.5 + 0.36*Math.sin(t*7.1) + 0.1*Math.sin(t*23), y:0.5 + 0.33*Math.cos(t*5.3 + 1)};
      let best = 0, bd = 1e9;
      _skm.cent.forEach((cc, j)=>{ const d = skmDist(p, cc); if(d < bd){ bd = d; best = j; } });
      syms.push(best);
      x.fillStyle = cols[best % cols.length] + 'BB';
      x.fillRect(L + i*fw, T + 20, fw - 0.4, 40);
    }
    // run-length collapsed symbol string
    const runs = [];
    syms.forEach(s=>{ if(!runs.length || runs[runs.length-1] !== s) runs.push(s); });
    mtTxt(x, 'per-frame units', L, T + 76, {size:8.5, col:MTC.muted});
    mtTxt(x, syms.slice(0, 45).join(' '), L, T + 92, {size:8, col:MTC.text});
    mtTxt(x, 'repeats collapsed \u00b7 ' + runs.length + ' symbols', L, T + 120, {size:8.5, col:MTC.a2});
    mtTxt(x, runs.join(' '), L, T + 136, {size:9, col:MTC.a2, weight:'700'});
    mtTxt(x, 'continuous audio now has a discrete description, which is what makes', L, T + 172, {size:9, col:MTC.muted});
    mtTxt(x, 'the masked-prediction objective of the previous section well posed.', L, T + 188, {size:9, col:MTC.muted});
  }
  // right panel: distortion history and elbow plot
  const RX = L + PS + 30, RW = w - RX - 18;
  mtTxt(x, 'distortion J', RX, 22, {size:9, col:MTC.text, weight:'700'});
  mtTxt(x, _skm.J.toFixed(4), RX, 44, {size:17, col:MTC.a2, weight:'700', font:MTC.mono});
  mtTxt(x, _skm.iters + ' re-estimation steps', RX, 60, {size:8, col:MTC.muted});
  // history sparkline
  const hh = 46, hy = 76;
  const hmax = Math.max(..._skm.hist), hmin = Math.min(..._skm.hist);
  x.strokeStyle = MTC.line; x.lineWidth = 1;
  x.strokeRect(RX, hy, RW, hh);
  x.strokeStyle = MTC.a2; x.lineWidth = 1.6; x.beginPath();
  _skm.hist.forEach((v, i)=>{
    const X = RX + RW * (i / Math.max(1, _skm.hist.length - 1));
    const Y = hy + hh - hh * (hmax === hmin ? 0.5 : (v - hmin) / (hmax - hmin));
    i ? x.lineTo(X, Y) : x.moveTo(X, Y);
  });
  x.stroke();
  mtTxt(x, 'never increases', RX, hy + hh + 12, {size:8, col:MTC.muted});
  // elbow
  if(!_skm.elbow){
    _skm.elbow = [];
    for(let k=1;k<=8;k++) _skm.elbow.push(skmFull(k, 7, 30).J);
  }
  const ey = 152, eh = 80;
  mtTxt(x, 'final J against K', RX, ey - 6, {size:9, col:MTC.text, weight:'700'});
  const emax = _skm.elbow[0];
  x.strokeStyle = MTC.line; x.lineWidth = 1;
  x.beginPath(); x.moveTo(RX, ey + eh); x.lineTo(RX + RW, ey + eh); x.stroke();
  x.strokeStyle = MTC.a1; x.lineWidth = 1.8; x.beginPath();
  _skm.elbow.forEach((v, i)=>{
    const X = RX + RW * (i / 7), Y = ey + eh - eh * (v / emax);
    i ? x.lineTo(X, Y) : x.moveTo(X, Y);
  });
  x.stroke();
  _skm.elbow.forEach((v, i)=>{
    const X = RX + RW * (i / 7), Y = ey + eh - eh * (v / emax);
    const on = (i + 1) === _skm.k;
    x.fillStyle = on ? MTC.a2 : MTC.a1;
    x.beginPath(); x.arc(X, Y, on ? 4 : 2.4, 0, 7); x.fill();
    if(on) mtTxt(x, 'K = ' + _skm.k, X, Y - 12, {size:8, col:MTC.a2, align:'center'});
  });
  mtTxt(x, 'K = 1', RX, ey + eh + 12, {size:7.5, col:MTC.muted});
  mtTxt(x, 'K = 8', RX + RW, ey + eh + 12, {size:7.5, col:MTC.muted, align:'right'});
  mtTxt(x, 'cost per iteration', RX, 272, {size:9, col:MTC.text, weight:'700'});
  mtTxt(x, 'O(N K d) = ' + SKM_PTS.length + ' \u00b7 ' + _skm.k + ' \u00b7 2', RX, 288, {size:9, col:MTC.muted});
  mtTxt(x, '= ' + (SKM_PTS.length * _skm.k * 2).toLocaleString() + ' operations here', RX, 304, {size:9, col:MTC.a5});
  mtTxt(x, 'and 6.6 \u00d7 10\u00b9\u00b9 on the real corpus', RX, 320, {size:8, col:MTC.muted});
  if(cv && !cv._skmBound){
    cv._skmBound = 1;
    cv.addEventListener('click', ev=>{
      if(_skm.mode !== 'cluster') return;
      const r = cv.getBoundingClientRect();
      const mx = ev.clientX - r.left, my = ev.clientY - r.top;
      if(mx > L + PS || my > T + PS - 40) return;
      const p = {x:(mx - L)/PS, y:1 - (my - T)/(PS - 40)};
      let best = 0, bd = 1e9;
      _skm.cent.forEach((cc, j)=>{ const d = skmDist(p, cc); if(d < bd){ bd = d; best = j; } });
      _skm.cent[best] = p;
      _skm.J = skmJ(SKM_PTS, _skm.cent, _skm.asg);
      _skm.hist.push(_skm.J);
      skmDraw();
    });
  }
  mtSet('skm-cap', _skm.mode === 'quant'
    ? 'Every frame is replaced by the index of its nearest centroid. That index is the discrete unit the masked-prediction objective asks the model to recover, and the collapsed string beneath it already looks like a transcript in an alphabet nobody chose.'
    : 'Distortion is ' + _skm.J.toFixed(4) + ' after ' + _skm.iters + ' re-estimation steps. Dragging a centroid by hand raises J, and the next assign-and-re-estimate pair pulls it back down: the guarantee is about the algorithm\u2019s own steps, not about arbitrary interference. Re-seed to land in a different local minimum with the same data and the same K.');
}

/* ══ 15.5 THE BLANK SYMBOL ════════════════════════════════ */
ASR_PAGES.asrctc = `
<div class="lesson-chapter-label">Section 15.5</div>
<h1 class="lesson-h1">Frame-Synchronous Output and the Blank Symbol</h1>
<p class="lesson-intro">CTC predicts a distribution at each encoder timestep, then combines repeated labels and blanks into a shorter output. It learns without frame-level alignment labels by summing over valid alignments. Streaming is possible when the encoder also respects the available audio context.</p>

<h2 class="lesson-h2">Why Merging Repeats Is Not Enough</h2>
<p class="lesson-p">If the network emits a symbol at every frame, the same symbol will repeat for as long as the sound lasts, so the obvious repair is to merge consecutive duplicates. That works until a word contains a genuine double letter. Run the naive collapser on <em>butter</em> below and watch the second <em>t</em> disappear.</p>
<p class="lesson-p">The fix is an extra symbol, the <strong>blank</strong> \\(\\epsilon\\), which the network may emit at any frame and which means <em>no output here</em>. Placing one blank between the two <em>t</em> frames blocks the merge. The same symbol also solves a second problem: the silence at the start and end of a recording has to be labelled with something, and there is no letter that means silence.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Collapse Machine</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="scm-ctrl"></div>
    <canvas id="scm-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="scm-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">The Collapsing Function</h2>
<p class="lesson-p">Write \\(A\\) for an alignment, a string of length \\(T\\) over the alphabet extended with the blank, and \\(B\\) for the function that turns it into an output string:</p>
<div class="lesson-math">\\[B : A \\rightarrow Y, \\qquad B(A) = \\mathrm{stripblanks}\\big(\\mathrm{mergerepeats}(A)\\big)\\]</div>
<p class="lesson-p">The order is not a convention that could be reversed. Blanks have to survive until after the merge, because their only job is to sit between two identical symbols and prevent them being combined. Strip them first and <em>t</em> \\(\\epsilon\\) <em>t</em> becomes <em>tt</em>, which then merges to a single <em>t</em>, and the blank has accomplished nothing.</p>
<p class="lesson-p">\\(B\\) is many-to-one, and it is worth seeing how far from one-to-one it is. The set of alignments mapping to a given output is</p>
<div class="lesson-math">\\[B^{-1}(Y) = \\{A \\in (V \\cup \\{\\epsilon\\})^{T} : B(A) = Y\\}\\]</div>
<p class="lesson-p">Before any constraint from \\(Y\\), the number of possible alignments is \\((|V|+1)^{T}\\). For a 29-symbol alphabet over three seconds of audio at 20 millisecond frames, that is \\(30^{150}\\), a number with 222 digits. The next section is about how to sum over that set without enumerating it.</p>

<h2 class="lesson-h2">When an Output Is Reachable at All</h2>
<p class="lesson-p">Not every target can be produced from every input length. Take a target \\(\\ell\\) of length \\(U\\) and interleave blanks around and between its symbols:</p>
<div class="lesson-math">\\[\\ell' = (\\epsilon, \\ell_1, \\epsilon, \\ell_2, \\epsilon, \\ldots, \\ell_U, \\epsilon), \\qquad |\\ell'| = 2U + 1\\]</div>
<p class="lesson-p">A valid alignment has to pass through every \\(\\ell_u\\) in order, and where two adjacent target symbols are identical it must additionally spend a frame on the blank between them. With \\(r\\) adjacent repeated pairs in the target, the minimum number of frames is therefore \\(U + r\\), so feasibility requires</p>
<div class="lesson-math">\\[T \\ge U + r\\]</div>
<p class="lesson-p">For <em>butter</em>, \\(U = 6\\) and \\(r = 1\\), so at least 7 frames are needed however fast the speaker was.</p>

<div class="quiz-block" id="qas-ct"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why must merging happen before blanks are stripped?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-ct','Correct. The blank exists to separate two identical symbols during the merge; removing it first would let them become adjacent and be merged away.')">A blank separating two identical symbols must still be present when the merge runs</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-ct','Both operations are linear scans; neither ordering is more efficient.')">Merging first is computationally cheaper</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-ct','Nothing about blanks makes them mergeable in a special way; consecutive blanks merge like anything else.')">Blanks cannot be merged with each other</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-ct','The output length is whatever the collapse produces; there is no length target being matched.')">Stripping first would give the wrong output length</button>
</div><div class="quiz-explain" id="qas-ct-explain"></div></div>`;

/* ── The Collapse Machine ─────────────────────────────────── */
const SCM_EPS = '\u03b5';
const SCM_ALPH = ['b','u','t','e','r',SCM_EPS];
const SCM_WITH = [SCM_EPS,'b','b','u','t','t',SCM_EPS,'t','e','r','r',SCM_EPS];
const SCM_NAIVE = ['b','b','b','u','t','t','t','t','e','r','r','r'];
let _scm = {mode:'naive', pass:0, frames:SCM_NAIVE.slice()};
function scmBuild(){
  _scm = {mode:'naive', pass:0, frames:SCM_NAIVE.slice()};
  const host = document.getElementById('scm-ctrl');
  if(host) host.innerHTML =
    '<button style="' + MTBTN + '" class="scm-b" data-m="naive" onclick="scmMode(\'naive\')">no blank available</button>' +
    '<button style="' + MTBTN + '" class="scm-b" data-m="blank" onclick="scmMode(\'blank\')">with the blank</button>' +
    '<button style="' + MTBTN + '" class="scm-b" data-m="free" onclick="scmMode(\'free\')">free play</button>' +
    '<button style="' + MTBTN + '" onclick="scmPass()">apply B step by step</button>';
  scmMode('naive');
}
function scmMode(m){
  _scm.mode = m; _scm.pass = 0;
  if(m === 'naive') _scm.frames = SCM_NAIVE.slice();
  else if(m === 'blank') _scm.frames = SCM_WITH.slice();
  document.querySelectorAll('.scm-b').forEach(b=>{
    const on = b.dataset.m === m;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
  });
  scmDraw();
}
function scmPass(){ _scm.pass = (_scm.pass + 1) % 3; scmDraw(); }
function scmMerge(a){
  const out = [];
  a.forEach(s=>{ if(!out.length || out[out.length-1] !== s) out.push(s); });
  return out;
}
function scmStrip(a){ return a.filter(s=>s !== SCM_EPS); }
function scmDraw(){
  const c = mtCtx('scm-canvas', 268); if(!c) return;
  const {x, w, cv} = c;
  const A = _scm.frames, T = A.length;
  const L = 96, PW = w - L - 20, cw = Math.min(46, PW / T);
  const merged = scmMerge(A), stripped = scmStrip(merged);
  // row 1: the alignment
  mtTxt(x, 'alignment A', 6, 42, {size:8.5, col:MTC.muted});
  mtTxt(x, 'T = ' + T, 6, 56, {size:8, col:MTC.muted});
  A.forEach((s, i)=>{
    const isEps = s === SCM_EPS;
    mtChip(x, L + i*cw, 30, cw - 3, 28,
      isEps ? 'rgba(23,27,52,0.05)' : 'rgba(79,70,229,0.20)',
      isEps ? MTC.line2 : MTC.a1, s, isEps ? MTC.muted : MTC.text, 12);
  });
  if(_scm.mode === 'free') mtTxt(x, 'click a frame to cycle its symbol', L, 74, {size:8, col:MTC.muted});
  // row 2: after merge
  const showMerge = _scm.pass >= 1;
  mtTxt(x, 'merge repeats', 6, 118, {size:8.5, col: showMerge ? MTC.a5 : MTC.muted});
  if(showMerge){
    merged.forEach((s, i)=>{
      const isEps = s === SCM_EPS;
      mtChip(x, L + i*cw, 106, cw - 3, 28,
        isEps ? 'rgba(23,27,52,0.05)' : 'rgba(165,104,14,0.22)',
        isEps ? MTC.line2 : MTC.a5, s, isEps ? MTC.muted : MTC.text, 12);
    });
    mtTxt(x, T + ' \u2192 ' + merged.length, L + merged.length*cw + 10, 120, {size:8.5, col:MTC.muted});
  } else {
    mtTxt(x, 'press the button to run the first pass', L, 120, {size:9, col:MTC.muted});
  }
  // row 3: after strip
  const showStrip = _scm.pass >= 2;
  mtTxt(x, 'strip blanks', 6, 194, {size:8.5, col: showStrip ? MTC.a2 : MTC.muted});
  if(showStrip){
    stripped.forEach((s, i)=>{
      mtChip(x, L + i*cw, 182, cw - 3, 28, 'rgba(159,18,57,0.22)', MTC.a2, s, MTC.text, 12);
    });
    mtTxt(x, merged.length + ' \u2192 ' + stripped.length, L + stripped.length*cw + 10, 196, {size:8.5, col:MTC.muted});
  } else if(showMerge){
    mtTxt(x, 'press again to run the second pass', L, 196, {size:9, col:MTC.muted});
  }
  // verdict
  const out = stripped.join('');
  const ok = out === 'butter';
  mtTxt(x, 'B(A) = ' + (showStrip ? '\u201C' + out + '\u201D' : '\u2014'), L, 240,
    {size:13, col: showStrip ? (ok ? MTC.a4 : MTC.a2) : MTC.muted, weight:'700'});
  if(showStrip) mtTxt(x, ok ? 'correct' : 'wrong: target was \u201Cbutter\u201D',
    L + 150, 240, {size:9.5, col: ok ? MTC.a4 : MTC.a2});
  const U = 6, r = 1;
  mtTxt(x, 'feasibility: T \u2265 U + r = ' + U + ' + ' + r + ' = ' + (U+r) + ', and T = ' + T +
    (T >= U + r ? ' \u2713' : ' \u2717'), L, 260, {size:9, col: T >= U+r ? MTC.muted : MTC.a2});
  if(cv && !cv._scmBound){
    cv._scmBound = 1;
    cv.addEventListener('click', ev=>{
      if(_scm.mode !== 'free') return;
      const r2 = cv.getBoundingClientRect();
      const mx = ev.clientX - r2.left, my = ev.clientY - r2.top;
      if(my < 24 || my > 64) return;
      const cw2 = Math.min(46, (cv.clientWidth - 116) / _scm.frames.length);
      const i = Math.floor((mx - 96) / cw2);
      if(i >= 0 && i < _scm.frames.length){
        const k = SCM_ALPH.indexOf(_scm.frames[i]);
        _scm.frames[i] = SCM_ALPH[(k + 1) % SCM_ALPH.length];
        _scm.pass = 0;
        scmDraw();
      }
    });
  }
  mtSet('scm-cap', _scm.mode === 'naive'
    ? 'Without a blank there is no way to write two consecutive identical letters. Every frame in the middle carries a t, they all merge into one, and the output is \u201Cbuter\u201D. The information the model needed to convey \u2014 that there were two separate t sounds \u2014 has no representation in the alignment alphabet.'
    : _scm.mode === 'blank'
    ? 'One blank between the two runs of t survives the merge and separates them, and the strip pass then removes it. The leading and trailing blanks label the silence, which no letter could. The whole of CTC\u2019s output machinery is these two passes in this order.'
    : 'Author any alignment you like. Watch what happens if you put the blank in the wrong place, or take out the one between the t runs, or add blanks in the middle of a letter\u2019s run \u2014 that last case splits one sound into two output symbols.');
}

/* ══ 15.5.1 SUMMING OVER ALIGNMENTS ═══════════════════════ */
ASR_PAGES.asrsum = `
<div class="lesson-chapter-label">Section 15.5.1</div>
<h1 class="lesson-h1">Summing over Alignments at Decode Time</h1>
<p class="lesson-intro">Because \\(B\\) is many-to-one, the probability of an output string is not the probability of any one alignment. It is the total over every alignment that collapses to it, and the difference between those two quantities is not a technicality. On the worked example below, they select different answers.</p>

<h2 class="lesson-h2">The Independence Assumption</h2>
<p class="lesson-p">CTC scores an alignment by multiplying the per-frame probabilities together, with no conditioning between frames:</p>
<div class="lesson-math">\\[P_{\\mathrm{CTC}}(A \\mid \\mathbf{X}) = \\prod_{t=1}^{T} p(a_t \\mid \\mathbf{X})\\]</div>
<p class="lesson-p">This is a strong assumption and a deliberate one. It is what allows the sum over alignments to be computed efficiently, and it is why CTC has no output-side language model of its own: the symbol emitted at frame \\(t\\) does not know what was emitted at frame \\(t-1\\).</p>

<h2 class="lesson-h2">Two Decoding Rules That Disagree</h2>
<p class="lesson-p">The cheap rule takes the most probable symbol at every frame independently and collapses the result:</p>
<div class="lesson-math">\\[\\hat{a}_t = \\arg\\max_{c \\in C} p_t(c \\mid \\mathbf{X})\\]</div>
<p class="lesson-p">The correct rule marginalizes first and then takes the best string:</p>
<div class="lesson-math">\\[P_{\\mathrm{CTC}}(Y \\mid \\mathbf{X}) = \\sum_{A \\in B^{-1}(Y)} \\prod_{t=1}^{T} p(a_t \\mid \\mathbf{h}_t), \\qquad \\hat{Y} = \\arg\\max_{Y} P_{\\mathrm{CTC}}(Y \\mid \\mathbf{X})\\]</div>
<p class="lesson-p">These need not agree, and the ledger below is small enough to check by hand: three frames, an alphabet of one real symbol plus the blank, eight alignments in total. The single highest-probability row and the highest-probability group are marked in different colours, and they are different.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Alignment Ledger</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="sled-ctrl"></div>
    <canvas id="sled-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="sled-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The reason for the disagreement is structural rather than accidental. A single alignment can be individually more probable than any other single alignment while the family it belongs to is small, and a string reached by many moderately probable alignments accumulates more total mass than a string reached by one very probable one. Best-path decoding compares members; the correct rule compares families.</p>

<h2 class="lesson-h2">The Language Model Term Is Not Optional</h2>
<p class="lesson-p">In practice the sum is approximated by a beam search over prefixes, and the score includes two extra terms:</p>
<div class="lesson-math">\\[\\mathrm{score}_{\\mathrm{CTC}}(Y \\mid \\mathbf{X}) = \\log P_{\\mathrm{CTC}}(Y \\mid \\mathbf{X}) + \\lambda_1 \\log P_{\\mathrm{LM}}(Y) + \\lambda_2 L(Y)\\]</div>
<p class="lesson-p">For the encoder-decoder the language model term was an optional improvement, since that model already conditions on its own output history. Here it is load-bearing. The conditional independence assumption means the acoustic model contains no information at all about which symbol sequences are plausible English, so without \\(P_{\\mathrm{LM}}\\) nothing prevents the beam from producing a phonetically reasonable non-word. The \\(\\lambda_2 L(Y)\\) term is a per-symbol bonus offsetting the same length bias derived in Section 15.3.2.</p>

<div class="quiz-block" id="qas-sm"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does CTC depend on an external language model more heavily than an encoder-decoder does?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-sm','Correct. The conditional independence assumption means each frame\\'s symbol is predicted without reference to the others, so nothing inside the model represents which symbol sequences are plausible.')">Its frames are predicted independently, so the model itself has no notion of a plausible symbol sequence</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-sm','CTC alphabets are typically the same size or smaller; alphabet size is not the issue.')">Its output alphabet is much larger</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-sm','CTC is usually trained on exactly the same paired data as an encoder-decoder.')">It is trained on less data</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-sm','Beam search is used with both architectures; the difference is what the model knows, not how it is searched.')">It cannot use beam search</button>
</div><div class="quiz-explain" id="qas-sm-explain"></div></div>`;

/* ── The Alignment Ledger ─────────────────────────────────── */
const SLED_P = [{a:0.40, e:0.60}, {a:0.35, e:0.65}, {a:0.40, e:0.60}];
let _sled = {beam:8};
function sledBuild(){
  _sled = {beam:8};
  const host = document.getElementById('sled-ctrl');
  if(host) host.innerHTML =
    '<span style="' + MTLBL + '">beam width</span>' +
    [1,2,3,8].map(b=>'<button style="' + MTBTN + '" class="sled-b" data-b="' + b +
      '" onclick="sledBeam(' + b + ')">' + (b === 8 ? 'exact' : b) + '</button>').join('');
  sledBeam(8);
}
function sledBeam(b){
  _sled.beam = b;
  document.querySelectorAll('.sled-b').forEach(el=>{
    const on = +el.dataset.b === b;
    el.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    el.style.color = on ? '#FAFBFF' : 'var(--muted)';
  });
  sledDraw();
}
function sledRows(){
  const rows = [];
  for(let m=0;m<8;m++){
    const A = [], ps = [];
    for(let t=0;t<3;t++){
      const isA = (m >> (2 - t)) & 1;
      A.push(isA ? 'a' : SCM_EPS);
      ps.push(isA ? SLED_P[t].a : SLED_P[t].e);
    }
    rows.push({A:A, ps:ps, p:ps[0]*ps[1]*ps[2], y:scmStrip(scmMerge(A)).join('')});
  }
  return rows;
}
function sledPrefixBeam(W){
  let beams = {'':{b:1, nb:0}};
  for(let t=0;t<3;t++){
    const nxt = {};
    const touch = k => { if(!nxt[k]) nxt[k] = {b:0, nb:0}; return nxt[k]; };
    Object.keys(beams).forEach(pre=>{
      const {b:pb, nb:pnb} = beams[pre];
      touch(pre).b += (pb + pnb) * SLED_P[t].e;
      const last = pre.length ? pre[pre.length-1] : null;
      if(last === 'a'){
        touch(pre).nb += pnb * SLED_P[t].a;
        touch(pre + 'a').nb += pb * SLED_P[t].a;
      } else {
        touch(pre + 'a').nb += (pb + pnb) * SLED_P[t].a;
      }
    });
    const keys = Object.keys(nxt).sort((p,q)=>(nxt[q].b + nxt[q].nb) - (nxt[p].b + nxt[p].nb)).slice(0, W);
    beams = {};
    keys.forEach(k=>{ beams[k] = nxt[k]; });
  }
  return Object.keys(beams).map(k=>({y:k, p:beams[k].b + beams[k].nb}))
    .filter(h=>h.p > 1e-9).sort((p,q)=>q.p - p.p);
}
function sledDraw(){
  const c = mtCtx('sled-canvas', 372); if(!c) return;
  const {x, w} = c;
  const rows = sledRows();
  const best = rows.reduce((a,b)=>b.p > a.p ? b : a);
  const grp = {};
  rows.forEach(r=>{ grp[r.y] = (grp[r.y] || 0) + r.p; });
  const gk = Object.keys(grp).sort((p,q)=>grp[q] - grp[p]);
  const bestGrp = gk[0];
  const L = 20, CW = 34;
  mtTxt(x, 'every alignment of length 3 over {a, \u03b5}', L, 16, {size:9, col:MTC.text, weight:'700'});
  mtTxt(x, 'p\u209c(a) = 0.40, 0.35, 0.40', L + 300, 16, {size:8.5, col:MTC.muted});
  ['t\u2081','t\u2082','t\u2083'].forEach((t,i)=> mtTxt(x, t, L + 8 + i*CW + CW/2, 34, {size:8, col:MTC.muted, align:'center'}));
  mtTxt(x, 'product', L + 3*CW + 26, 34, {size:8, col:MTC.muted});
  mtTxt(x, 'B(A)', L + 3*CW + 108, 34, {size:8, col:MTC.muted});
  rows.forEach((r, i)=>{
    const y = 44 + i * 26;
    const isBest = r === best, inGrp = r.y === bestGrp;
    if(inGrp){ mtRR(x, L, y, 3*CW + 190, 22, 4); x.fillStyle = 'rgba(11,132,87,0.10)'; x.fill(); }
    r.A.forEach((s, t)=>{
      mtChip(x, L + 8 + t*CW, y + 1, CW - 6, 20,
        s === 'a' ? 'rgba(79,70,229,0.22)' : 'rgba(23,27,52,0.05)',
        isBest ? MTC.a5 : MTC.line, s, MTC.text, 10);
    });
    mtTxt(x, r.ps.map(v=>v.toFixed(2)).join(' \u00d7 ') + ' = ', L + 3*CW + 16, y + 12, {size:8, col:MTC.muted});
    mtTxt(x, r.p.toFixed(3), L + 3*CW + 122, y + 12,
      {size:9.5, col: isBest ? MTC.a5 : MTC.text, weight: isBest ? '700' : ''});
    mtTxt(x, '\u201C' + r.y + '\u201D', L + 3*CW + 168, y + 12,
      {size:9.5, col: inGrp ? MTC.a4 : MTC.muted, weight: inGrp ? '700' : ''});
    if(isBest) mtTxt(x, '\u2190 highest single alignment', L + 3*CW + 220, y + 12, {size:8.5, col:MTC.a5});
  });
  // grouped totals
  const GX = L + 3*CW + 300;
  mtTxt(x, 'grouped by output string', GX, 16, {size:9, col:MTC.text, weight:'700'});
  gk.forEach((k, i)=>{
    const y = 44 + i * 34, on = k === bestGrp;
    mtChip(x, GX, y, 60, 24, on ? 'rgba(11,132,87,0.24)' : 'rgba(23,27,52,0.04)',
      on ? MTC.a4 : MTC.line, '\u201C' + k + '\u201D', MTC.text, 10);
    const bw = 90 * (grp[k] / Math.max(...gk.map(q=>grp[q])));
    x.fillStyle = on ? 'rgba(11,132,87,0.5)' : 'rgba(23,27,52,0.12)';
    x.fillRect(GX + 68, y + 4, Math.max(2, bw), 16);
    mtTxt(x, grp[k].toFixed(3), GX + 68 + Math.max(2, bw) + 6, y + 12,
      {size:9.5, col: on ? MTC.a4 : MTC.muted, weight: on ? '700' : ''});
  });
  mtTxt(x, 'total ' + Object.keys(grp).reduce((a,k)=>a + grp[k], 0).toFixed(3),
    GX, 44 + gk.length*34 + 8, {size:8.5, col:MTC.muted});
  // the disagreement, stated
  const dy = 258;
  mtChip(x, L, dy, 300, 26, 'rgba(165,104,14,0.14)', MTC.a5, '', MTC.text, 9);
  mtTxt(x, 'best path picks \u201C' + best.y + '\u201D  (p = ' + best.p.toFixed(3) + ')',
    L + 10, dy + 13, {size:9.5, col:MTC.a5, weight:'700'});
  mtChip(x, L, dy + 32, 300, 26, 'rgba(11,132,87,0.14)', MTC.a4, '', MTC.text, 9);
  mtTxt(x, 'marginalizing picks \u201C' + bestGrp + '\u201D  (p = ' + grp[bestGrp].toFixed(3) + ')',
    L + 10, dy + 45, {size:9.5, col:MTC.a4, weight:'700'});
  // beam approximation
  const bm = sledPrefixBeam(_sled.beam);
  mtTxt(x, 'prefix beam search at width ' + (_sled.beam === 8 ? 'exact' : _sled.beam), GX, dy,
    {size:9, col:MTC.text, weight:'700'});
  bm.slice(0, 4).forEach((h, i)=>{
    mtTxt(x, (i+1) + '. \u201C' + h.y + '\u201D  ' + h.p.toFixed(3), GX, dy + 18 + i*16,
      {size:9, col: i === 0 ? MTC.a2 : MTC.muted});
  });
  mtTxt(x, 'total alignments before constraint: (|V| + 1)\u1d40 = 2\u00b3 = 8', L, 356, {size:9, col:MTC.muted});
  mtSet('sled-cap', 'The single most probable alignment is \u03b5\u03b5\u03b5 at ' + best.p.toFixed(3) +
    ', which collapses to the empty string. But six separate alignments collapse to \u201Ca\u201D and together they carry ' +
    grp['a'].toFixed(3) + ', nearly three times as much. Best-path decoding compares individual alignments and gets the answer wrong; the marginal compares output strings and gets it right. ' +
    (_sled.beam < 8 ? 'At beam width ' + _sled.beam + ' the search keeps only the top ' + _sled.beam +
      ' prefixes at each step, which is how the exact sum is approximated when the alphabet is 29 symbols rather than 2.'
      : 'With the beam set to exact, prefix beam search recovers the grouped totals exactly.'));
}

/* ══ 15.5.2 THE FORWARD-BACKWARD LOSS ═════════════════════ */
ASR_PAGES.asrfb = `
<div class="lesson-chapter-label">Section 15.5.2</div>
<h1 class="lesson-h1">The Forward-Backward Sum as a Loss</h1>
<p class="lesson-intro">CTC training needs the sum of probabilities over all alignments that produce the target transcript. Dynamic programming computes it in O(TU) time, where T is the number of encoder timesteps and U is the target length. That avoids enumerating an exponentially large set of paths.</p>

<h2 class="lesson-h2">The Objective</h2>
<p class="lesson-p">Over a dataset of paired utterances and transcripts:</p>
<div class="lesson-math">\\[L_{\\mathrm{CTC}} = \\sum_{(\\mathbf{X}, Y) \\in D} -\\log P_{\\mathrm{CTC}}(Y \\mid \\mathbf{X})\\]</div>
<p class="lesson-p">Note what is absent. No alignment is required, no forced alignment is computed in advance, and no frame is ever told which symbol it should have emitted. The supervision is the transcript and nothing else, and the model is free to distribute the symbols across the frames however it likes as long as the total comes out right.</p>

<h2 class="lesson-h2">The Forward Recursion</h2>
<p class="lesson-p">Define \\(\\alpha_t(s)\\) as the total probability of all alignment prefixes that have consumed \\(t\\) frames and arrived at position \\(s\\) of the extended label sequence \\(\\ell'\\). Writing \\(y^t_{k}\\) for the network's probability of symbol \\(k\\) at frame \\(t\\):</p>
<div class="lesson-math">\\[\\alpha_t(s) = y^{t}_{\\ell'_s}\\Big(\\alpha_{t-1}(s) + \\alpha_{t-1}(s-1) + \\mathbb{1}\\big[\\ell'_s \\ne \\epsilon \\;\\wedge\\; \\ell'_s \\ne \\ell'_{s-2}\\big]\\,\\alpha_{t-1}(s-2)\\Big)\\]</div>
<p class="lesson-p">Three ways to arrive: stay where you are, advance one position, or skip a blank. The third is conditional. A blank may be skipped over between two <em>different</em> symbols, since nothing needs separating; between two <em>identical</em> symbols the blank is exactly what stops them merging, so skipping it would produce an alignment that collapses to the wrong string.</p>
<p class="lesson-p">The recursion starts on the first two positions, since an alignment may begin either on the leading blank or directly on the first symbol:</p>
<div class="lesson-math">\\[\\alpha_1(1) = y^{1}_{\\epsilon}, \\qquad \\alpha_1(2) = y^{1}_{\\ell_1}, \\qquad \\alpha_1(s) = 0 \\text{ for } s &gt; 2\\]</div>
<p class="lesson-p">and ends on the last two, since it may finish on the final symbol or on the trailing blank:</p>
<div class="lesson-math">\\[P_{\\mathrm{CTC}}(Y \\mid \\mathbf{X}) = \\alpha_T(2U+1) + \\alpha_T(2U)\\]</div>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Lattice Filler</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="slf-ctrl"></div>
    <canvas id="slf-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="slf-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Backward, and the Gradient</h2>
<p class="lesson-p">A symmetric recursion runs from the end, with \\(\\beta_t(s)\\) the total probability of all continuations from position \\(s\\) at frame \\(t\\) to a valid finish. The product of the two is the total mass of every complete alignment passing through that cell, and dividing by the total gives a proper distribution over positions at each frame, the <strong>posterior occupancy</strong>:</p>
<div class="lesson-math">\\[\\gamma_t(s) = \\frac{\\alpha_t(s)\\,\\beta_t(s)}{P_{\\mathrm{CTC}}(Y \\mid \\mathbf{X})}\\]</div>
<p class="lesson-p">This is where the payoff arrives. The derivative of the loss with respect to the pre-softmax logit for symbol \\(k\\) at frame \\(t\\) is the difference between what the network predicted and how much occupancy that symbol actually received:</p>
<div class="lesson-math">\\[\\frac{\\partial(-\\log P_{\\mathrm{CTC}})}{\\partial u^{t}_{k}} = y^{t}_{k} - \\sum_{s \\,:\\, \\ell'_s = k} \\gamma_t(s)\\]</div>
<p class="lesson-p">Exactly the form of an ordinary softmax cross-entropy gradient, prediction minus target, with a soft target computed by the recursion rather than supplied by an annotator. Where a frame is confidently inside a symbol, its occupancy is near one and the frame is trained as if labelled. Where a frame is ambiguous, occupancy is spread and so is the gradient. The alignment is never decided; it is integrated over.</p>
<p class="lesson-p">Both recursions visit \\((2U+1) \\times T\\) cells and do constant work at each, so the cost is</p>
<div class="lesson-math">\\[O(TU)\\]</div>
<p class="lesson-p">rather than the exponential cost of enumeration.</p>

<div class="quiz-block" id="qas-fb"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">When is the skip transition, from \\(s-2\\) to \\(s\\), forbidden?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-fb','Correct. The blank between two identical symbols is what prevents them merging, so an alignment that skips it would collapse to a single symbol instead of two.')">When the two symbols either side of the skipped blank are identical</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-fb','Skips near the start are fine; only the identity of the neighbouring symbols matters.')">During the first two frames of the utterance</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-fb','The probabilities scale the transition but never disable it; the constraint is combinatorial.')">When the network assigns low probability to the blank</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-fb','Skips are always into a non-blank position by construction of the extended sequence.')">When the target position holds a blank</button>
</div><div class="quiz-explain" id="qas-fb-explain"></div></div>`;

/* ── The Lattice Filler ───────────────────────────────────── */
const SLF_Y = [
  {a:0.50, b:0.20, e:0.30},
  {a:0.30, b:0.20, e:0.50},
  {a:0.20, b:0.50, e:0.30},
  {a:0.10, b:0.60, e:0.30},
  {a:0.10, b:0.30, e:0.60}
];
let _slf = {tgt:'ab', step:0, gamma:false};
function slfExt(tgt){
  const L = [SCM_EPS];
  tgt.split('').forEach(ch=>{ L.push(ch); L.push(SCM_EPS); });
  return L;
}
function slfProb(t, sym){ const r = SLF_Y[t]; return sym === SCM_EPS ? r.e : r[sym]; }
function slfSkipOK(ext, s){ return s >= 2 && ext[s] !== SCM_EPS && ext[s] !== ext[s-2]; }
function slfAlpha(tgt, unit){
  const ext = slfExt(tgt), S = ext.length, T = SLF_Y.length;
  const A = [];
  for(let t=0;t<T;t++) A.push(new Array(S).fill(0));
  const py = (t, s) => unit ? 1 : slfProb(t, ext[s]);
  A[0][0] = py(0, 0);
  if(S > 1) A[0][1] = py(0, 1);
  for(let t=1;t<T;t++) for(let s=0;s<S;s++){
    let acc = A[t-1][s];
    if(s >= 1) acc += A[t-1][s-1];
    if(slfSkipOK(ext, s)) acc += A[t-1][s-2];
    A[t][s] = py(t, s) * acc;
  }
  return {A:A, ext:ext, S:S, T:T};
}
function slfBeta(tgt){
  const ext = slfExt(tgt), S = ext.length, T = SLF_Y.length;
  const B = [];
  for(let t=0;t<T;t++) B.push(new Array(S).fill(0));
  B[T-1][S-1] = 1; if(S >= 2) B[T-1][S-2] = 1;
  for(let t=T-2;t>=0;t--) for(let s=0;s<S;s++){
    let acc = B[t+1][s] * slfProb(t+1, ext[s]);
    if(s+1 < S) acc += B[t+1][s+1] * slfProb(t+1, ext[s+1]);
    if(s+2 < S && slfSkipOK(ext, s+2)) acc += B[t+1][s+2] * slfProb(t+1, ext[s+2]);
    B[t][s] = acc;
  }
  return B;
}
function slfBuild(){
  _slf = {tgt:'ab', step:0, gamma:false};
  const host = document.getElementById('slf-ctrl');
  if(host) host.innerHTML =
    '<span style="' + MTLBL + '">target</span>' +
    '<button style="' + MTBTN + '" class="slf-t" data-t="ab" onclick="slfTgt(\'ab\')">a b</button>' +
    '<button style="' + MTBTN + '" class="slf-t" data-t="aa" onclick="slfTgt(\'aa\')">a a (repeat)</button>' +
    '<button style="' + MTBTN + '" onclick="slfStep()">fill next column</button>' +
    '<button style="' + MTBTN + '" onclick="slfAll()">fill all</button>' +
    '<button style="' + MTBTN + '" id="slf-g" onclick="slfGamma()">posterior occupancy</button>';
  slfTgt('ab');
}
function slfTgt(t){
  _slf.tgt = t; _slf.step = 0;
  document.querySelectorAll('.slf-t').forEach(b=>{
    const on = b.dataset.t === t;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
  });
  slfDraw();
}
function slfStep(){ _slf.step = Math.min(SLF_Y.length, _slf.step + 1); slfDraw(); }
function slfAll(){ _slf.step = SLF_Y.length; slfDraw(); }
function slfGamma(){
  _slf.gamma = !_slf.gamma;
  if(_slf.gamma) _slf.step = SLF_Y.length;
  const b = document.getElementById('slf-g');
  if(b){ b.style.background = _slf.gamma ? 'var(--accent2)' : 'var(--surface2)';
         b.style.color = _slf.gamma ? '#FAFBFF' : 'var(--muted)'; }
  slfDraw();
}
function slfDraw(){
  const c = mtCtx('slf-canvas', 340); if(!c) return;
  const {x, w} = c;
  const {A, ext, S, T} = slfAlpha(_slf.tgt, false);
  const cnt = slfAlpha(_slf.tgt, true).A;
  const B = slfBeta(_slf.tgt);
  const P = A[T-1][S-1] + A[T-1][S-2];
  const paths = cnt[T-1][S-1] + cnt[T-1][S-2];
  const L = 86, TT = 56, cw = 66, chh = 42;
  // header row
  for(let t=0;t<T;t++)
    mtTxt(x, 't = ' + (t+1), L + t*cw + cw/2, TT - 12, {size:8.5, col:MTC.muted, align:'center'});
  // extended label column
  for(let s=0;s<S;s++){
    const isEps = ext[s] === SCM_EPS;
    mtChip(x, 22, TT + s*chh + 6, 54, 28,
      isEps ? 'rgba(23,27,52,0.04)' : 'rgba(79,70,229,0.18)',
      isEps ? MTC.line2 : MTC.a1, "\u2113'" + (s+1) + ' = ' + ext[s], MTC.text, 8.5);
  }
  // cells
  const gmax = _slf.gamma ? Math.max(...A.map((row,t)=>Math.max(...row.map((v,s)=>v*B[t][s])))) : 1;
  for(let t=0;t<T;t++) for(let s=0;s<S;s++){
    const filled = t < _slf.step;
    const v = A[t][s];
    const g = P > 0 ? (A[t][s] * B[t][s]) / P : 0;
    let fill = 'rgba(23,27,52,0.025)';
    if(filled){
      if(_slf.gamma) fill = 'rgba(159,18,57,' + (0.06 + 0.72 * g).toFixed(3) + ')';
      else fill = v > 0 ? 'rgba(79,70,229,' + (0.08 + 0.55 * Math.pow(v / Math.max(...A[t]), 0.6)).toFixed(3) + ')'
                        : 'rgba(23,27,52,0.02)';
    }
    mtRR(x, L + t*cw + 2, TT + s*chh + 6, cw - 6, chh - 10, 4);
    x.fillStyle = fill; x.fill();
    x.strokeStyle = filled ? MTC.line2 : MTC.line; x.lineWidth = 1; x.stroke();
    if(filled){
      const show = _slf.gamma ? g.toFixed(3) : (v === 0 ? '0' : v.toFixed(4));
      mtTxt(x, show, L + t*cw + cw/2 - 2, TT + s*chh + 6 + (chh-10)/2,
        {size:8, col: v === 0 && !_slf.gamma ? MTC.muted : MTC.text, align:'center'});
    }
  }
  // transition arrows into the most recently filled column
  if(_slf.step >= 2 && !_slf.gamma){
    const t = _slf.step - 1;
    for(let s=0;s<S;s++){
      if(A[t][s] === 0) continue;
      const tx = L + t*cw + 2, ty = TT + s*chh + 6 + (chh-10)/2;
      const froms = [[s, MTC.a1], [s-1, MTC.a5]];
      if(slfSkipOK(ext, s)) froms.push([s-2, MTC.a2]);
      froms.forEach(([fs, col])=>{
        if(fs < 0 || A[t-1][fs] === 0) return;
        x.strokeStyle = col; x.lineWidth = 1.2; x.globalAlpha = 0.75;
        x.beginPath();
        x.moveTo(L + (t-1)*cw + cw - 4, TT + fs*chh + 6 + (chh-10)/2);
        x.lineTo(tx - 2, ty);
        x.stroke(); x.globalAlpha = 1;
      });
    }
    mtTxt(x, 'stay', L + slfLegX(w, 0), TT + S*chh + 20, {size:8, col:MTC.a1});
    mtTxt(x, 'advance one', L + slfLegX(w, 1), TT + S*chh + 20, {size:8, col:MTC.a5});
    mtTxt(x, 'skip a blank', L + slfLegX(w, 2), TT + S*chh + 20, {size:8, col:MTC.a2});
  }
  // per-frame emission probabilities
  mtTxt(x, 'y\u1d57', 22, 32, {size:8.5, col:MTC.muted});
  for(let t=0;t<T;t++)
    mtTxt(x, 'a ' + SLF_Y[t].a.toFixed(2) + '  b ' + SLF_Y[t].b.toFixed(2) + '  \u03b5 ' + SLF_Y[t].e.toFixed(2),
      L + t*cw + cw/2, 32, {size:6.8, col:MTC.muted, align:'center'});
  const by = TT + S*chh + 44;
  if(_slf.step >= T){
    mtTxt(x, 'P(Y|X) = \u03b1\u209c(' + S + ') + \u03b1\u209c(' + (S-1) + ') = ' +
      A[T-1][S-1].toFixed(5) + ' + ' + A[T-1][S-2].toFixed(5) + ' = ' + P.toFixed(5),
      22, by, {size:10, col:MTC.a4, weight:'700'});
    mtTxt(x, 'that single number represents ' + paths + ' distinct alignments, out of ' +
      Math.pow(3, T) + ' strings of length ' + T + ' over {a, b, \u03b5}', 22, by + 20, {size:9, col:MTC.muted});
    mtTxt(x, 'cost: (2U+1) \u00b7 T = ' + S + ' \u00b7 ' + T + ' = ' + (S*T) +
      ' cells, each with at most three additions', 22, by + 38, {size:9, col:MTC.muted});
  } else {
    mtTxt(x, 'column ' + _slf.step + ' of ' + T + ' filled', 22, by, {size:10, col:MTC.muted});
  }
  mtSet('slf-cap', _slf.gamma
    ? 'Each column of \u03b3 is a distribution over label positions, summing to one: at this frame, how much of the total alignment mass sits on each position. That vector is the soft target in the gradient, and no annotator ever produced it.'
    : _slf.tgt === 'aa'
    ? 'With a repeated target the skip arrow into the second <b>a</b> is gone. Skipping the blank between two identical symbols would let them merge, collapsing \u201Caa\u201D into \u201Ca\u201D, so that path is not part of B\u207b\u00b9(Y) and the recursion must not count it. This is also why feasibility needs T \u2265 U + r.'
    : 'Every arrow into a cell is one way of arriving there, and the cell stores the total probability of all of them. Alignments that share a prefix share the work of scoring it exactly once, which is what turns an exponential sum into a table with ' +
      (S*T) + ' entries. The skip arrow into <b>b</b> is legal because the symbol before it differs.');
}
function slfLegX(w, i){ return 40 + i * 120; }

/* ══ 15.5.3 TWO LOSSES ON ONE ENCODER ═════════════════════ */
ASR_PAGES.asrjoint = `
<div class="lesson-chapter-label">Section 15.5.3</div>
<h1 class="lesson-h1">Two Losses on One Encoder</h1>
<p class="lesson-intro">An attention decoder uses output history and can attend across the audio. CTC instead factorizes frame predictions conditional on the encoded input and sums monotonic alignments. Training both heads on one encoder combines these constraints.</p>

<h2 class="lesson-h2">The Combined Objective</h2>
<p class="lesson-p">One encoder, two output heads, one weighted sum of two negative log-likelihoods:</p>
<div class="lesson-math">\\[L = -\\lambda \\log P_{\\mathrm{encdec}}(Y \\mid \\mathbf{X}) - (1-\\lambda)\\log P_{\\mathrm{ctc}}(Y \\mid \\mathbf{X})\\]</div>
<p class="lesson-p">The same weighting can be applied again at decoding time, with a language model brought in as a third term:</p>
<div class="lesson-math">\\[\\hat{Y} = \\arg\\max_{Y}\\Big[\\lambda \\log P_{\\mathrm{encdec}}(Y \\mid \\mathbf{X}) + (1-\\lambda)\\log P_{\\mathrm{CTC}}(Y \\mid \\mathbf{X}) + \\gamma \\log P_{\\mathrm{LM}}(Y)\\Big]\\]</div>

<h2 class="lesson-h2">Why the Two Terms Are Not Redundant</h2>
<p class="lesson-p">It would be reasonable to expect that two models of the same conditional distribution, trained on the same data through the same encoder, would supply nearly the same information. They do not, and the reason is visible in the factorizations. \\(P_{\\mathrm{encdec}}\\) factors over output position \\(i\\); \\(P_{\\mathrm{CTC}}\\) factors over input frame \\(t\\). They decompose the same probability along different axes, so their errors are structurally different.</p>
<p class="lesson-p">The practical consequence is that CTC acts as a regularizer on attention. Nothing in the encoder-decoder objective requires the decoder to consume the audio in order, and an attention distribution that jumps backwards or gets stuck produces the characteristic failures of that architecture: a phrase repeated, or a stretch of audio skipped entirely with a fluent output covering the gap. The CTC branch cannot do either, because its alignment is monotone by construction, and sharing an encoder forces the representation to support both.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Shared Trunk</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="sht-ctrl"></div>
    <canvas id="sht-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="sht-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The utterance in the bench is chosen so the two heads fail in their characteristic ways at once. The CTC branch drops a short unstressed function word, which is the error a frame-synchronous model makes when a word occupies few frames and carries little acoustic energy. The attention branch produces a fluent ending that was never said, which is the error a model with a strong internal language model makes when the acoustic evidence gets weak. Neither failure survives the other head's vote.</p>

<div class="quiz-block" id="qas-jt"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In what sense does the CTC branch regularize the attention branch?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-jt','Correct. CTC\\'s alignment is monotone by construction, so an encoder that must also support the CTC head cannot represent the audio in a way that permits skipping or repeating.')">Its alignment is monotone by construction, so the shared encoder cannot support skipping or repeating audio</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-jt','Both heads read the same encoder output; neither restricts what the other may attend to directly.')">It restricts which encoder positions the decoder is allowed to attend to</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-jt','Weight decay and dropout are separate mechanisms; nothing here penalizes parameter magnitude.')">It adds a penalty on the magnitude of the decoder weights</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-jt','The two heads have separate parameters; only the encoder is shared.')">It shares its output projection with the decoder</button>
</div><div class="quiz-explain" id="qas-jt-explain"></div></div>`;

/* ── The Shared Trunk ─────────────────────────────────────── */
const SHT_H = [
  {y:'she said the plan is fine',   ed:-3.2, ctc:-4.6, lm:-9.5,  tag:'reference'},
  {y:'she said plan is fine',       ed:-5.8, ctc:-3.1, lm:-13.2, tag:'function word dropped'},
  {y:'she said the plan is final',  ed:-2.4, ctc:-6.9, lm:-10.4, tag:'fluent wrong ending'},
  {y:'she said the plans fine',     ed:-4.6, ctc:-5.2, lm:-12.1, tag:''},
  {y:'she said the plan is find',   ed:-5.1, ctc:-5.0, lm:-14.0, tag:''}
];
let _sht = {lam:0.5, gam:0.3};
function shtBuild(){
  _sht = {lam:0.5, gam:0.3};
  const host = document.getElementById('sht-ctrl');
  if(host) host.innerHTML =
    '<div style="min-width:160px"><div style="' + MTLBL + ';margin-bottom:3px">\u03bb, weight on the decoder <b id="sht-l-v" style="color:var(--accent)">0.50</b></div>' +
    '<input id="sht-l" type="range" min="0" max="1" step="0.02" value="0.5" oninput="shtUpd()" style="width:100%;accent-color:var(--accent)"></div>' +
    '<div style="min-width:150px"><div style="' + MTLBL + ';margin-bottom:3px">\u03b3, weight on the LM <b id="sht-g-v" style="color:var(--accent2)">0.30</b></div>' +
    '<input id="sht-g" type="range" min="0" max="1" step="0.02" value="0.3" oninput="shtUpd()" style="width:100%;accent-color:var(--accent2)"></div>' +
    '<button style="' + MTBTN + '" onclick="shtPre(0)">CTC only</button>' +
    '<button style="' + MTBTN + '" onclick="shtPre(1)">decoder only</button>' +
    '<button style="' + MTBTN + '" onclick="shtPre(0.5)">joint</button>';
  shtUpd();
}
function shtPre(v){
  const el = document.getElementById('sht-l');
  if(el) el.value = v;
  shtUpd();
}
function shtUpd(){
  const a = document.getElementById('sht-l'), b = document.getElementById('sht-g');
  if(a) _sht.lam = +a.value;
  if(b) _sht.gam = +b.value;
  mtSet('sht-l-v', _sht.lam.toFixed(2));
  mtSet('sht-g-v', _sht.gam.toFixed(2));
  shtDraw();
}
function shtDraw(){
  const c = mtCtx('sht-canvas', 348); if(!c) return;
  const {x, w} = c;
  const L = 20, lam = _sht.lam, gam = _sht.gam;
  // the fork
  const ex = L, ey = 34, ew = 150, eh = 46;
  mtChip(x, ex, ey, ew, eh, 'rgba(79,70,229,0.16)', MTC.a1, '', MTC.text, 9);
  mtTxt(x, 'shared encoder', ex + ew/2, ey + 18, {size:9.5, col:MTC.a1, align:'center', weight:'700'});
  mtTxt(x, 'H\u1d49\u207f\u1d9c \u2208 \u211d\u207f\u02e3\u1d48', ex + ew/2, ey + 33, {size:8, col:MTC.muted, align:'center'});
  const heads = [
    {nm:'CTC head', s:'frame-synchronous, n outputs', col:MTC.a5, wgt:1 - lam, y:ey - 14},
    {nm:'decoder head', s:'autoregressive, m outputs', col:MTC.a2, wgt:lam, y:ey + 48}
  ];
  heads.forEach(h=>{
    const hx = ex + ew + 70;
    x.strokeStyle = h.col; x.lineWidth = 1 + 3 * h.wgt; x.globalAlpha = 0.35 + 0.6 * h.wgt;
    x.beginPath();
    x.moveTo(ex + ew, ey + eh/2);
    x.bezierCurveTo(ex + ew + 30, ey + eh/2, hx - 30, h.y + 16, hx, h.y + 16);
    x.stroke(); x.globalAlpha = 1;
    mtChip(x, hx, h.y, 168, 32, 'rgba(23,27,52,0.03)', h.col, '', MTC.text, 9);
    mtTxt(x, h.nm, hx + 8, h.y + 13, {size:9, col:h.col, weight:'700'});
    mtTxt(x, h.s, hx + 8, h.y + 25, {size:7.5, col:MTC.muted});
    mtTxt(x, (h.wgt).toFixed(2), hx + 176, h.y + 16, {size:10, col:h.col, weight:'700'});
  });
  // stacked composite loss bar
  const refH = SHT_H[0];
  const lCtc = -refH.ctc, lEd = -refH.ed;
  const compo = lam * lEd + (1 - lam) * lCtc;
  const bx = ex + ew + 300, bwid = w - bx - 20;
  mtTxt(x, 'composite training loss', bx, 22, {size:9, col:MTC.text, weight:'700'});
  const totalW = bwid, unit = totalW / Math.max(lCtc, lEd, compo, 1);
  x.fillStyle = 'rgba(165,104,14,0.5)';
  x.fillRect(bx, 34, Math.max(1, (1-lam) * lCtc * unit), 22);
  x.fillStyle = 'rgba(159,18,57,0.5)';
  x.fillRect(bx + Math.max(1, (1-lam) * lCtc * unit), 34, Math.max(1, lam * lEd * unit), 22);
  mtTxt(x, 'L = ' + compo.toFixed(2), bx, 72, {size:10, col:MTC.text, weight:'700'});
  mtTxt(x, '(1\u2212\u03bb)\u00b7' + lCtc.toFixed(1) + ' + \u03bb\u00b7' + lEd.toFixed(1), bx, 88, {size:8.5, col:MTC.muted});
  // decoding bench
  const dy = 132;
  mtTxt(x, 'n-best rescored with the current \u03bb and \u03b3', L, dy, {size:9, col:MTC.text, weight:'700'});
  const scored = SHT_H.map(h=>Object.assign({}, h, {
    s: lam * h.ed + (1 - lam) * h.ctc + gam * h.lm
  })).sort((p,q)=>q.s - p.s);
  const lo = Math.min(...scored.map(h=>h.s)), hi = Math.max(...scored.map(h=>h.s));
  scored.forEach((h, i)=>{
    const y = dy + 16 + i * 36;
    const frac = hi === lo ? 1 : (h.s - lo) / (hi - lo);
    const bw2 = 30 + (w - 330) * frac;
    const isRef = h.tag === 'reference';
    x.fillStyle = isRef ? 'rgba(11,132,87,0.40)' : 'rgba(159,18,57,0.22)';
    x.fillRect(L + 250, y, Math.max(4, bw2), 20);
    mtTxt(x, (i+1) + '.', L, y + 13, {size:9, col:MTC.muted});
    mtTxt(x, h.y, L + 18, y + 13, {size:10, col: isRef ? MTC.a4 : MTC.text, weight: i === 0 ? '700' : ''});
    mtTxt(x, h.s.toFixed(2), L + 256 + Math.max(4, bw2), y + 13, {size:9, col:MTC.muted});
    mtTxt(x, 'ed ' + h.ed.toFixed(1) + '  ctc ' + h.ctc.toFixed(1) + '  lm ' + h.lm.toFixed(1) +
      (h.tag ? '   \u00b7 ' + h.tag : ''), L + 18, y + 28, {size:7.5, col:MTC.muted});
  });
  const top = scored[0];
  mtSet('sht-cap', top.tag === 'reference'
    ? 'Both heads voting together recover the reference. Neither one does alone: the ranking above reorders as \u03bb moves, and the correct string only reaches the top when both factorizations agree on it.'
    : top.tag === 'function word dropped'
    ? 'With all the weight on the CTC head, the winning hypothesis has lost the word <i>the</i>. A frame-synchronous model with no output history has nothing telling it that the phrase needs a determiner; the acoustic evidence for one unstressed 40 ms word is thin, and it goes.'
    : top.tag === 'fluent wrong ending'
    ? 'With all the weight on the decoder, the winner ends on a word that was never spoken. The decoder\u2019s internal language model finds <i>final</i> more probable than <i>fine</i> in this context and the weak acoustic evidence at the end of the utterance does not override it. The CTC head scores this hypothesis 2.3 nats worse.'
    : 'This weighting favours a hypothesis that neither head prefers on its own.');
}

/* ══ 15.5.4 RNN-T AND STREAMING ═══════════════════════════ */
ASR_PAGES.asrrnnt = `
<div class="lesson-chapter-label">Section 15.5.4</div>
<h1 class="lesson-h1">Adding Output History Back for Streaming</h1>
<p class="lesson-intro">A full-context attention recognizer waits for the complete utterance. Streaming designs limit that context. A transducer offers another approach: combine acoustic state with output history and allow emissions as audio arrives, provided the encoder is also suitable for streaming.</p>

<h2 class="lesson-h2">One Extra Conditioning Term</h2>
<p class="lesson-p">Compare the two per-frame distributions directly. CTC predicts</p>
<div class="lesson-math">\\[p(a_t \\mid \\mathbf{h}_t)\\]</div>
<p class="lesson-p">and the transducer predicts</p>
<div class="lesson-math">\\[p(a_t \\mid \\mathbf{h}_t,\\; y_{&lt;u_t})\\]</div>
<p class="lesson-p">That is the entire architectural difference. The extra term is supplied by a <strong>predictor</strong> network, a language model over output symbols alone that never sees the audio, and a <strong>joint</strong> network combines the two streams:</p>
<div class="lesson-math">\\[\\mathbf{z}_{t,u} = \\mathbf{W}^{out}\\tanh\\!\\left(\\mathbf{W}^{enc}\\mathbf{h}^{enc}_t + \\mathbf{W}^{pred}\\mathbf{h}^{pred}_u + \\mathbf{b}\\right), \\qquad P(y_{t,u}) = \\mathrm{softmax}(\\mathbf{z}_{t,u})\\]</div>
<p class="lesson-p">The output probability is still a sum over alignments, with each alignment now scored using its own output history:</p>
<div class="lesson-math">\\[P_{\\text{RNN-T}}(Y \\mid \\mathbf{X}) = \\sum_{A \\in B^{-1}(Y)} \\prod_{t=1}^{T} p(a_t \\mid \\mathbf{h}_t,\\; y_{&lt;u_t})\\]</div>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Latency Race</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="slr-ctrl"></div>
    <canvas id="slr-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="slr-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">A Two-Dimensional Lattice</h2>
<p class="lesson-p">Because the state now has both a time index and an output index, the alignment lattice is a grid rather than a strip. A horizontal move emits a blank and advances time; a vertical move emits a symbol and advances the output. Any monotone staircase from one corner to the other is a valid alignment, and the forward recursion accumulates over all of them:</p>
<div class="lesson-math">\\[\\alpha(t,u) = \\alpha(t-1,u)\\,P(\\epsilon \\mid t-1, u) + \\alpha(t,u-1)\\,P(y_u \\mid t, u-1)\\]</div>
<p class="lesson-p">with \\(\\alpha(1,0) = 1\\) and the total read off the far corner:</p>
<div class="lesson-math">\\[P_{\\text{RNN-T}}(Y \\mid \\mathbf{X}) = \\alpha(T,U)\\,P(\\epsilon \\mid T,U)\\]</div>
<p class="lesson-p">The time cost is \\(O(TU)\\), the same as CTC. The memory cost is not. A softmax over the full output vocabulary has to be evaluated at every node of the grid rather than at every frame, so the tensor being held is</p>
<div class="lesson-math">\\[O(TU|V|)\\]</div>
<p class="lesson-p">which for a long utterance and a subword vocabulary is the practical constraint on training transducers, and the reason a great deal of engineering effort goes into computing this loss without materializing that tensor.</p>

<div class="quiz-block" id="qas-rt"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What happens to a transducer if the predictor network is removed?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-rt','Correct. Without the predictor term the per-frame distribution depends only on the encoder state, which is exactly CTC\\'s conditional independence assumption.')">It reduces to CTC, since the per-frame distribution then depends on the encoder state alone</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-rt','Attention is absent from both architectures; that is what makes them streamable.')">It becomes an attention-based encoder-decoder</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-rt','The lattice recursion is what marginalizes over alignments, and it does not depend on the predictor existing.')">It can no longer sum over alignments</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-rt','Streaming comes from the monotone frame-synchronous structure, which survives removing the predictor.')">It loses the ability to stream</button>
</div><div class="quiz-explain" id="qas-rt-explain"></div></div>`;

/* ── The Latency Race ─────────────────────────────────────── */
const SLR_TOK = [
  {w:'she',  end:0.35}, {w:'said', end:0.72}, {w:'the', end:0.88},
  {w:'plan', end:1.35}, {w:'is',   end:1.55}, {w:'fine', end:2.10}
];
const SLR_DUR = 2.40;
let _slr = {t:1.0, pred:true};
function slrBuild(){
  _slr = {t:1.0, pred:true};
  const host = document.getElementById('slr-ctrl');
  if(host) host.innerHTML =
    '<div style="flex:1;min-width:180px"><div style="' + MTLBL + ';margin-bottom:3px">wall clock <b id="slr-t-v" style="color:var(--accent)">1.00 s</b></div>' +
    '<input id="slr-t" type="range" min="0" max="2.7" step="0.01" value="1" oninput="slrUpd()" style="width:100%;accent-color:var(--accent)"></div>' +
    '<button style="' + MTBTN + '" id="slr-p" onclick="slrPred()">predictor on</button>';
  slrUpd();
}
function slrPred(){ _slr.pred = !_slr.pred; slrDraw(); }
function slrUpd(){
  const el = document.getElementById('slr-t');
  if(el) _slr.t = +el.value;
  mtSet('slr-t-v', _slr.t.toFixed(2) + ' s');
  slrDraw();
}
function slrDraw(){
  const c = mtCtx('slr-canvas', 386); if(!c) return;
  const {x, w} = c;
  const pb = document.getElementById('slr-p');
  if(pb){ pb.style.background = _slr.pred ? 'var(--accent)' : 'var(--accent3)';
          pb.style.color = '#FAFBFF';
          pb.textContent = _slr.pred ? 'predictor on' : 'predictor off (= CTC)'; }
  const L = 96, PW = w - L - 24, tx = t => L + PW * t / 2.7;
  const now = _slr.t;
  // timeline
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L, 28); x.lineTo(L + PW, 28); x.stroke();
  for(let s=0; s<=2.5; s+=0.5){
    x.strokeStyle = MTC.line;
    x.beginPath(); x.moveTo(tx(s), 24); x.lineTo(tx(s), 32); x.stroke();
    mtTxt(x, s.toFixed(1) + 's', tx(s), 16, {size:7.5, col:MTC.muted, align:'center'});
  }
  // spoken words
  mtTxt(x, 'spoken', 6, 50, {size:8.5, col:MTC.muted});
  let prev = 0;
  SLR_TOK.forEach(tk=>{
    const heard = now >= tk.end;
    mtChip(x, tx(prev) + 1, 40, tx(tk.end) - tx(prev) - 2, 20,
      heard ? 'rgba(79,70,229,0.22)' : 'rgba(23,27,52,0.04)',
      MTC.line, tk.w, heard ? MTC.text : MTC.muted, 9);
    prev = tk.end;
  });
  x.strokeStyle = MTC.line; x.setLineDash([2,3]);
  x.beginPath(); x.moveTo(tx(SLR_DUR), 34); x.lineTo(tx(SLR_DUR), 200); x.stroke(); x.setLineDash([]);
  mtTxt(x, 'audio ends', tx(SLR_DUR) + 4, 196, {size:7.5, col:MTC.muted});
  // transducer output
  const trLat = 0.12;
  mtTxt(x, 'transducer', 6, 92, {size:8.5, col:MTC.a4, weight:'700'});
  mtTxt(x, 'streaming', 6, 104, {size:7.5, col:MTC.muted});
  SLR_TOK.forEach(tk=>{
    const at = tk.end + trLat;
    if(now >= at) mtChip(x, tx(at), 82, 46, 20, 'rgba(11,132,87,0.30)', MTC.a4, tk.w, MTC.text, 8.5);
  });
  // attention output
  const atLat = 0.18;
  mtTxt(x, 'attention', 6, 140, {size:8.5, col:MTC.a2, weight:'700'});
  mtTxt(x, 'offline', 6, 152, {size:7.5, col:MTC.muted});
  if(now >= SLR_DUR + atLat){
    let ax = tx(SLR_DUR + atLat);
    SLR_TOK.forEach(tk=>{
      mtChip(x, ax, 130, 40, 20, 'rgba(159,18,57,0.30)', MTC.a2, tk.w, MTC.text, 8);
      ax += 42;
    });
  } else {
    mtChip(x, L, 130, 120, 20, 'rgba(23,27,52,0.04)', MTC.line, 'nothing yet', MTC.muted, 8.5);
  }
  // playhead
  x.strokeStyle = MTC.a5; x.lineWidth = 1.6;
  x.beginPath(); x.moveTo(tx(now), 20); x.lineTo(tx(now), 200); x.stroke();
  // latency histogram
  const hy = 178;
  mtTxt(x, 'per-token delay from when the word finished', L, hy, {size:8.5, col:MTC.muted});
  SLR_TOK.forEach((tk, i)=>{
    const bx = L + i * 46;
    x.fillStyle = 'rgba(11,132,87,0.55)';
    x.fillRect(bx, hy + 24 - trLat*40, 18, trLat*40);
    const aLat = (SLR_DUR + atLat) - tk.end;
    x.fillStyle = 'rgba(159,18,57,0.45)';
    x.fillRect(bx + 20, hy + 24 - Math.min(20, aLat*10), 18, Math.min(20, aLat*10));
    mtTxt(x, tk.w, bx + 19, hy + 34, {size:7, col:MTC.muted, align:'center'});
  });
  mtTxt(x, 'transducer: ' + (trLat*1000).toFixed(0) + ' ms, flat', L + 300, hy + 14, {size:8.5, col:MTC.a4});
  mtTxt(x, 'attention: ' + (((SLR_DUR + atLat) - SLR_TOK[0].end)*1000).toFixed(0) + ' ms for the first word',
    L + 300, hy + 28, {size:8.5, col:MTC.a2});
  // the T x U lattice
  const gy = 236, T = 9, U = 5, cw = 42, chh = 26;
  const gx = 96;
  mtTxt(x, 'the T \u00d7 U alignment lattice', 6, gy - 8, {size:9, col:MTC.text, weight:'700'});
  for(let u=0; u<=U; u++)
    mtTxt(x, u === 0 ? '\u27e8sos\u27e9' : SLR_TOK[u-1].w, gx - 8, gy + (U-u)*chh + 12,
      {size:7.5, col:MTC.muted, align:'right'});
  for(let t=0; t<T; t++)
    mtTxt(x, 't' + (t+1), gx + t*cw + cw/2, gy + (U+1)*chh + 4, {size:7, col:MTC.muted, align:'center'});
  for(let t=0; t<T; t++) for(let u=0; u<=U; u++){
    x.strokeStyle = MTC.line; x.lineWidth = 1;
    x.strokeRect(gx + t*cw, gy + (U-u)*chh, cw, chh);
  }
  // a monotone staircase
  const path = [[0,0],[1,0],[1,1],[2,1],[3,1],[3,2],[4,2],[4,3],[5,3],[6,3],[6,4],[7,4],[7,5],[8,5]];
  x.strokeStyle = MTC.a4; x.lineWidth = 2.6;
  x.beginPath();
  path.forEach(([t,u], i)=>{
    const X = gx + t*cw + cw/2, Y = gy + (U-u)*chh + chh/2;
    i ? x.lineTo(X, Y) : x.moveTo(X, Y);
  });
  x.stroke();
  path.forEach(([t,u], i)=>{
    if(i === 0) return;
    const [pt, pu] = path[i-1];
    const X = gx + t*cw + cw/2, Y = gy + (U-u)*chh + chh/2;
    const vertical = pu !== u;
    x.fillStyle = vertical ? MTC.a2 : MTC.a5;
    x.beginPath(); x.arc(X, Y, 3.4, 0, 7); x.fill();
    if(vertical) mtTxt(x, SLR_TOK[u-1].w.slice(0,3), X, Y - 10, {size:6.5, col:MTC.a2, align:'center'});
    else mtTxt(x, '\u03b5', X, Y + 10, {size:7, col:MTC.a5, align:'center'});
  });
  const ly = gy + (U+1)*chh + 22;
  mtTxt(x, 'horizontal: emit \u03b5, advance time', gx, ly, {size:8, col:MTC.a5});
  mtTxt(x, 'vertical: emit a symbol, advance output', gx + 190, ly, {size:8, col:MTC.a2});
  mtTxt(x, _slr.pred
    ? 'joint network sees h\u209c\u1d49\u207f\u1d9c and h\u1d64\u1d56\u02b3\u1d49\u1d48 \u00b7 p(a\u209c | h\u209c, y<u)'
    : 'joint network sees h\u209c\u1d49\u207f\u1d9c only \u00b7 p(a\u209c | h\u209c)',
    gx + 420, ly, {size:8, col: _slr.pred ? MTC.a1 : MTC.a3});
  mtSet('slr-cap', !_slr.pred
    ? 'With the predictor removed, every node in the lattice depends only on the encoder state at that frame. The conditional independence assumption is back, the model no longer knows what it has already emitted, and the architecture is CTC drawn on a two-dimensional grid instead of a one-dimensional strip.'
    : now < SLR_TOK[0].end + 0.12
    ? 'Neither model has emitted anything yet. Advance the clock past the end of the first word and watch only one of them respond.'
    : now < SLR_DUR + 0.18
    ? 'The transducer has already committed to ' + SLR_TOK.filter(t=>now >= t.end + 0.12).length +
      ' words while the attention model has emitted nothing at all. It cannot: its decoder is conditioned on an encoder representation of the whole utterance, and the utterance is still being spoken.'
    : 'Both have finished. The transducer\u2019s delay is a flat 120 ms per token; the attention model\u2019s delay depends on how early in the utterance the word occurred, so the first word waited ' +
      (((SLR_DUR + 0.18) - SLR_TOK[0].end)*1000).toFixed(0) + ' ms.');
}

/* ══ 15.6 COUNTING ERRORS ═════════════════════════════════ */
ASR_PAGES.asrwer = `
<div class="lesson-chapter-label">Section 15.6</div>
<h1 class="lesson-h1">Counting Errors Against a Reference</h1>
<p class="lesson-intro">Every claim in this chapter about one system being better than another rests on a single metric, and the metric has more structure inside it than its formula suggests. It is not a count of wrong words. It is the cost of the cheapest edit sequence turning one string into another, which means an alignment has to be computed before anything can be counted.</p>

<h2 class="lesson-h2">The Definition</h2>
<div class="lesson-math">\\[\\mathrm{WER} = 100 \\times \\frac{\\text{Insertions} + \\text{Substitutions} + \\text{Deletions}}{\\text{Total Words in Reference}}\\]</div>
<p class="lesson-p">The three error types are not interchangeable even though they are added with equal weight. A substitution means a word was heard as a different word; a deletion means it was not heard at all; an insertion means a word was produced with nothing behind it. Different failure modes produce different mixtures, which is why serious evaluation reports the three counts and not only their total.</p>

<h2 class="lesson-h2">The Alignment Is the Metric</h2>
<p class="lesson-p">The counts come from the minimum-cost alignment, computed with the same dynamic program used for edit distance:</p>
<div class="lesson-math">\\[D[i,j] = \\min \\begin{cases} D[i-1,j] + c_{\\mathrm{del}} \\\\ D[i,j-1] + c_{\\mathrm{ins}} \\\\ D[i-1,j-1] + c_{\\mathrm{sub}} \\cdot \\mathbb{1}[r_i \\ne h_j] \\end{cases}\\]</div>
<p class="lesson-p">The table below fills in from that recurrence, the backtrace walks the cheapest route through it, and the familiar three-row error strip is drawn from exactly the same path. They are one object shown two ways. Change the costs and the alignment itself changes, which is worth doing once to see that the metric is a modelling choice rather than a fact.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Alignment Grid</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="sag-ctrl"></div>
    <canvas id="sag-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="sag-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Working the standard example by hand: three substitutions, <em>think</em> heard as <em>thought</em>, <em>moved</em> as <em>removed</em>, <em>tuesday</em> as <em>two</em>; one insertion, <em>day</em>; no deletions; against a nine-word reference.</p>
<div class="lesson-math">\\[\\mathrm{WER} = 100 \\times \\frac{1 + 3 + 0}{9} = 44.4\\%\\]</div>

<h2 class="lesson-h2">The Metric Has No Ceiling</h2>
<p class="lesson-p">A rate that is normally quoted as a percentage invites the assumption that it lies between 0 and 100, and it does not. The denominator \\(N_{\\mathrm{ref}}\\) is fixed by the reference, while \\(I\\) counts words the recognizer produced and is bounded only by how much it produced. A system that emits fifty words against a nine-word reference can accumulate more than nine errors, so</p>
<div class="lesson-math">\\[\\mathrm{WER} > 100 \\text{ is attainable}\\]</div>
<p class="lesson-p">This is not a curiosity. Recognizers that fall into a repeating loop, or that transcribe background speech nobody was asked about, routinely score above 100 percent, and any evaluation harness that clips the value at 100 is discarding information about how badly the failure went. Press the button in the bench above to pad the hypothesis and watch the number climb past it.</p>

<h2 class="lesson-h2">A Coarser Companion</h2>
<p class="lesson-p">Some applications do not care how many words in a sentence were wrong, only whether the sentence was right. Sentence error rate reports that:</p>
<div class="lesson-math">\\[\\mathrm{SER} = 100 \\times \\frac{\\#\\{\\text{sentences with} \\ge 1 \\text{ word error}\\}}{\\#\\text{sentences}}\\]</div>
<p class="lesson-p">It is much less sensitive, since a single misheard article condemns an otherwise perfect sentence, and it is the right metric when the transcript feeds a command interpreter that will either parse or fail.</p>

<div class="quiz-block" id="qas-wr"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can word error rate exceed 100 percent?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-wr','Correct. Insertions count words the system produced, and that count has no upper bound, while the denominator is fixed by the reference length.')">Insertions are unbounded while the reference length in the denominator is fixed</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-wr','Substitutions are bounded by the reference length; only insertions can drive the total past it.')">Substitutions can be counted more than once per word</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-wr','The dynamic program finds the minimum-cost alignment, so it never inflates the count.')">The alignment algorithm sometimes finds a suboptimal path</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-wr','Deletions are bounded above by the reference length too.')">Deletions are counted against the hypothesis length</button>
</div><div class="quiz-explain" id="qas-wr-explain"></div></div>`;

/* ── The Alignment Grid ───────────────────────────────────── */
const SAG_REF = 'i think the meeting was moved to tuesday morning'.split(' ');
const SAG_HYP = 'i thought the meeting was removed to two day morning'.split(' ');
const SAG_PAD = ['and','then','she','said','it','again','and','again'];
let _sag = {cs:1, ci:1, cd:1, pad:false};
function sagBuild(){
  _sag = {cs:1, ci:1, cd:1, pad:false};
  const host = document.getElementById('sag-ctrl');
  if(host) host.innerHTML =
    ['cs,substitution cost,var(--accent)','ci,insertion cost,var(--accent2)','cd,deletion cost,var(--accent3)']
    .map(spec=>{ const [k, lab, col] = spec.split(',');
      return '<div style="min-width:120px"><div style="' + MTLBL + ';margin-bottom:3px">' + lab +
        ' <b id="sag-' + k + '-v" style="color:' + col + '">1.0</b></div>' +
        '<input id="sag-' + k + '" type="range" min="0.5" max="3" step="0.5" value="1" oninput="sagUpd()" style="width:100%;accent-color:' + col + '"></div>';
    }).join('') +
    '<button style="' + MTBTN + '" id="sag-p" onclick="sagPad()">pad the hypothesis</button>';
  sagUpd();
}
function sagPad(){ _sag.pad = !_sag.pad; sagDraw(); }
function sagUpd(){
  ['cs','ci','cd'].forEach(k=>{
    const el = document.getElementById('sag-' + k);
    if(el) _sag[k] = +el.value;
    mtSet('sag-' + k + '-v', _sag[k].toFixed(1));
  });
  sagDraw();
}
function sagAlign(ref, hyp, cs, ci, cd){
  const R = ref.length, H = hyp.length;
  const D = [], BP = [];
  for(let i=0;i<=R;i++){ D.push(new Array(H+1).fill(0)); BP.push(new Array(H+1).fill('')); }
  for(let i=1;i<=R;i++){ D[i][0] = i*cd; BP[i][0] = 'D'; }
  for(let j=1;j<=H;j++){ D[0][j] = j*ci; BP[0][j] = 'I'; }
  for(let i=1;i<=R;i++) for(let j=1;j<=H;j++){
    const same = ref[i-1] === hyp[j-1];
    const sub = D[i-1][j-1] + (same ? 0 : cs);
    const del = D[i-1][j] + cd;
    const ins = D[i][j-1] + ci;
    let best = sub, op = same ? 'C' : 'S';
    if(del < best - 1e-9){ best = del; op = 'D'; }
    if(ins < best - 1e-9){ best = ins; op = 'I'; }
    D[i][j] = best; BP[i][j] = op;
  }
  const ops = [];
  let i = R, j = H;
  while(i > 0 || j > 0){
    const op = (i === 0) ? 'I' : (j === 0) ? 'D' : BP[i][j];
    if(op === 'I'){ ops.unshift({op:'I', r:null, h:hyp[j-1], i:i, j:j}); j--; }
    else if(op === 'D'){ ops.unshift({op:'D', r:ref[i-1], h:null, i:i, j:j}); i--; }
    else { ops.unshift({op:op, r:ref[i-1], h:hyp[j-1], i:i, j:j}); i--; j--; }
  }
  return {D:D, ops:ops};
}
function sagDraw(){
  const c = mtCtx('sag-canvas', 396); if(!c) return;
  const {x, w} = c;
  const pb = document.getElementById('sag-p');
  if(pb){ pb.style.background = _sag.pad ? 'var(--accent3)' : 'var(--surface2)';
          pb.style.color = _sag.pad ? '#FAFBFF' : 'var(--muted)'; }
  const hyp = _sag.pad ? SAG_HYP.concat(SAG_PAD) : SAG_HYP;
  const {D, ops} = sagAlign(SAG_REF, hyp, _sag.cs, _sag.ci, _sag.cd);
  const R = SAG_REF.length, H = hyp.length;
  const L = 74, TT = 46;
  const cw = Math.min(34, (w - L - 16) / (H + 1)), chh = 20;
  // column headers
  mtTxt(x, '\u2205', L + cw/2, TT - 12, {size:7.5, col:MTC.muted, align:'center'});
  hyp.forEach((h, j)=> mtTxt(x, h.slice(0,4), L + (j+1)*cw + cw/2, TT - 12,
    {size:6.5, col:MTC.muted, align:'center'}));
  mtTxt(x, 'hypothesis \u2192', L, TT - 26, {size:8.5, col:MTC.a2, weight:'700'});
  mtTxt(x, 'reference', 6, TT - 12, {size:8.5, col:MTC.a1, weight:'700'});
  // the table
  const onPath = {};
  ops.forEach(o=>{ onPath[o.i + ',' + o.j] = o.op; });
  onPath['0,0'] = 'start';
  const dmax = D[R][H] || 1;
  for(let i=0;i<=R;i++){
    if(i > 0) mtTxt(x, SAG_REF[i-1].slice(0,7), L - 6, TT + i*chh + chh/2,
      {size:6.5, col:MTC.muted, align:'right'});
    else mtTxt(x, '\u2205', L - 6, TT + chh/2, {size:7.5, col:MTC.muted, align:'right'});
    for(let j=0;j<=H;j++){
      const p = onPath[i + ',' + j];
      const col = p === 'C' ? 'rgba(11,132,87,0.34)' : p === 'S' ? 'rgba(159,18,57,0.34)'
        : p === 'I' ? 'rgba(178,58,91,0.28)' : p === 'D' ? 'rgba(165,104,14,0.30)'
        : p === 'start' ? 'rgba(79,70,229,0.20)' : 'rgba(79,70,229,' + (0.02 + 0.14*D[i][j]/dmax).toFixed(3) + ')';
      x.fillStyle = col;
      x.fillRect(L + j*cw, TT + i*chh, cw - 1, chh - 1);
      mtTxt(x, D[i][j] % 1 === 0 ? String(D[i][j]) : D[i][j].toFixed(1),
        L + j*cw + cw/2, TT + i*chh + chh/2, {size:6.5, col: p ? MTC.text : MTC.muted, align:'center'});
    }
  }
  // the three-row strip, drawn from the same ops
  const sy = TT + (R+1)*chh + 26;
  mtTxt(x, 'the same path as a REF / HYP / EVAL strip', 6, sy - 12, {size:8.5, col:MTC.text, weight:'700'});
  const sw = Math.min(58, (w - 60) / ops.length);
  ['REF','HYP','EVAL'].forEach((lab, row)=>{
    mtTxt(x, lab, 6, sy + row*22 + 11, {size:8, col:MTC.muted});
    ops.forEach((o, k)=>{
      const txt = row === 0 ? (o.r || '*'.repeat(Math.max(1, (o.h||'').length)))
                : row === 1 ? (o.h || '*'.repeat(Math.max(1, (o.r||'').length)))
                : (o.op === 'C' ? '' : o.op);
      const col = o.op === 'C' ? MTC.muted
        : o.op === 'S' ? MTC.a2 : o.op === 'I' ? MTC.a3 : MTC.a5;
      if(row === 2 && txt){
        mtChip(x, 40 + k*sw, sy + row*22, sw - 3, 16,
          o.op === 'S' ? 'rgba(159,18,57,0.22)' : o.op === 'I' ? 'rgba(178,58,91,0.22)' : 'rgba(165,104,14,0.24)',
          col, txt, col, 8);
      } else if(txt){
        mtTxt(x, txt.slice(0,7), 40 + k*sw, sy + row*22 + 11, {size:7.5, col: row === 2 ? col : (o.op === 'C' ? MTC.muted : col)});
      }
    });
  });
  // counts
  const S = ops.filter(o=>o.op === 'S').length;
  const I = ops.filter(o=>o.op === 'I').length;
  const Dl = ops.filter(o=>o.op === 'D').length;
  const wer = 100 * (S + I + Dl) / R;
  const cy = sy + 82;
  mtTxt(x, 'WER = 100 \u00d7 (' + I + ' + ' + S + ' + ' + Dl + ') / ' + R + ' = ',
    6, cy, {size:11, col:MTC.text});
  mtTxt(x, wer.toFixed(1) + '%', 300, cy, {size:15, col: wer > 100 ? MTC.a3 : MTC.a2, weight:'700', font:MTC.mono});
  mtTxt(x, 'substitutions ' + S + '   insertions ' + I + '   deletions ' + Dl +
    '   correct ' + ops.filter(o=>o.op === 'C').length, 6, cy + 20, {size:9, col:MTC.muted});
  if(wer > 100) mtTxt(x, 'above 100%, and correctly so', 380, cy, {size:9, col:MTC.a3});
  mtSet('sag-cap', _sag.pad
    ? 'Eight extra words appended to the hypothesis add eight insertions against an unchanged nine-word reference, and the rate goes to ' +
      wer.toFixed(1) + '%. Nothing is broken: the numerator counts what the system produced and the denominator counts what it should have produced, and those are different quantities.'
    : (_sag.cs === 1 && _sag.ci === 1 && _sag.cd === 1
      ? 'The standard costs give ' + S + ' substitutions, ' + I + ' insertion and ' + Dl + ' deletions against a ' + R +
        '-word reference: ' + wer.toFixed(1) + '%. Follow the coloured staircase through the table and read the same decisions off the strip below it.'
      : 'With substitution at ' + _sag.cs.toFixed(1) + ', insertion at ' + _sag.ci.toFixed(1) + ' and deletion at ' + _sag.cd.toFixed(1) +
        ', the cheapest path changes and so do the counts. Making substitution expensive, for instance, pushes the aligner toward describing a misheard word as a deletion followed by an insertion.'));
}

/* ══ 15.6.1 NORMALIZATION ═════════════════════════════════ */
ASR_PAGES.asrnorm = `
<div class="lesson-chapter-label">Section 15.6.1</div>
<h1 class="lesson-h1">Normalizing Text Before Scoring</h1>
<p class="lesson-intro">A recognizer that writes <em>15</em> where the reference says <em>fifteen</em> has heard the utterance correctly and will be charged a substitution for it. So will one that writes <em>colours</em>, or <em>y'know</em>, or that includes the filled pause the speaker actually produced. Before scoring, both strings pass through a normalizer, and a surprising fraction of any published error rate is decided by what that normalizer does.</p>

<h2 class="lesson-h2">Five Stages</h2>
<p class="lesson-p">Toggle each stage and watch the rate move. The hypothesis below carries one instance of every common problem at once.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Normalization Pipeline</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="snp-ctrl"></div>
    <canvas id="snp-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="snp-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">What Normalization Can and Cannot Do</h2>
<p class="lesson-p">Formally the normalizer is a deterministic map applied to both sides before the edit distance is computed:</p>
<div class="lesson-math">\\[\\mathrm{WER}_N = 100 \\times \\frac{\\mathrm{EditOps}\\big(N(R), N(H)\\big)}{|N(R)|}\\]</div>
<p class="lesson-p">A normalizer that maps each token independently to one token cannot increase unit-cost edit distance: applying the same map preserves matches and can turn substitutions into matches. It also preserves reference length. Under those specific conditions, and for a nonempty reference,</p>
<div class="lesson-math">\\[\\mathrm{WER}_N \\le \\mathrm{WER}\\]</div>
<p class="lesson-p">A general normalizer can delete, split, or expand tokens, so the inequality need not hold. For example, deleting a shared “uh” from reference “uh cat dog” and hypothesis “uh cat frog” raises WER from 1/3 to 1/2: the error count stays at one while the reference gets shorter. Report the normalization rules whenever you compare systems.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Two Systems, Two Normalizers</span></div>
  <div class="viz-body">
    <canvas id="snq-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="snq-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qas-nm"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Under which condition is normalized WER guaranteed not to increase?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-nm','Correct. Applying the same one-token-to-one-token map preserves matches and lengths while it may merge substitutions.')">The same mapping that replaces each token with exactly one token is applied to both strings</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-nm','It is applied to both sides symmetrically; that is what makes the comparison meaningful.')">It is applied only to the hypothesis, never to the reference</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-nm','The same edit-distance algorithm is used. General normalization can change the alignment and reference length.')">It replaces the edit-distance alignment with a looser one</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-nm','Deleting a shared correct token can shorten the reference without removing an error, which can increase WER.')">It always shortens the hypothesis more than the reference</button>
</div><div class="quiz-explain" id="qas-nm-explain"></div></div>`;

/* ── The Normalization Pipeline ───────────────────────────── */
const SNP_REF = 'the co-op ordered fifteen colors you know';
const SNP_RAW = '[noise] Uh the co-op ordered 15 colours, y\u2019know';
const SNP_NUM = {'15':'fifteen','20':'twenty','3':'three','1990':'nineteen ninety'};
const SNP_SPELL = {'colours':'colors','centre':'center','realise':'realize','organisation':'organization'};
const SNP_CONTR = {'y\u2019know':'you know',"y'know":'you know','gonna':'going to','wanna':'want to'};
const SNP_FILL = {'uh':1,'um':1,'er':1,'mm':1,'hmm':1,'ah':1};
const SNP_STAGES = [
  {k:'tags',  nm:'bracketed transcription notes', ex:'[noise] \u2192 (removed)'},
  {k:'fill',  nm:'filled pauses',                 ex:'Uh \u2192 (removed)'},
  {k:'case',  nm:'case and punctuation',          ex:'Uh, \u2192 uh'},
  {k:'num',   nm:'numerals to words',             ex:'15 \u2192 fifteen'},
  {k:'var',   nm:'spelling and contractions',     ex:'colours \u2192 colors'}
];
let _snp = {on:{tags:false, fill:false, case:false, num:false, var:false}};
function snpTok(s){ return s.split(/\s+/).filter(t=>t.length); }
function snpApply(s, on){
  let toks = snpTok(s);
  if(on.tags) toks = toks.filter(t=>!/^[\[<].*[\]>][,.]?$/.test(t));
  if(on.case) toks = toks.map(t=>t.toLowerCase().replace(/[,.?!;:]+$/g, ''));
  if(on.fill) toks = toks.filter(t=>!SNP_FILL[t.toLowerCase().replace(/[,.?!;:]+$/g,'')]);
  if(on.num){
    const out = [];
    toks.forEach(t=>{ const key = t.replace(/[,.?!;:]+$/g,'');
      if(SNP_NUM[key]) SNP_NUM[key].split(' ').forEach(p=>out.push(p)); else out.push(t); });
    toks = out;
  }
  if(on['var']){
    const out = [];
    toks.forEach(t=>{ const key = t.toLowerCase().replace(/[,.?!;:]+$/g,'');
      if(SNP_SPELL[key]) out.push(SNP_SPELL[key]);
      else if(SNP_CONTR[key]) SNP_CONTR[key].split(' ').forEach(p=>out.push(p));
      else out.push(t); });
    toks = out;
  }
  return toks;
}
function snpWer(refToks, hypToks){
  const {ops} = sagAlign(refToks, hypToks, 1, 1, 1);
  const S = ops.filter(o=>o.op === 'S').length;
  const I = ops.filter(o=>o.op === 'I').length;
  const D = ops.filter(o=>o.op === 'D').length;
  return {S:S, I:I, D:D, wer: 100 * (S + I + D) / Math.max(1, refToks.length), ops:ops};
}
function snpBuild(){
  _snp = {on:{tags:false, fill:false, case:false, num:false, var:false}};
  const host = document.getElementById('snp-ctrl');
  if(host) host.innerHTML = SNP_STAGES.map(s=>
    '<button style="' + MTBTN + '" class="snp-b" data-k="' + s.k + '" onclick="snpTog(\'' + s.k + '\')">' +
    s.nm + '</button>').join('') +
    '<button style="' + MTBTN + '" onclick="snpAll(1)">all on</button>' +
    '<button style="' + MTBTN + '" onclick="snpAll(0)">all off</button>';
  snpDraw(); snqDraw();
}
function snpTog(k){ _snp.on[k] = !_snp.on[k]; snpDraw(); }
function snpAll(v){ SNP_STAGES.forEach(s=>{ _snp.on[s.k] = !!v; }); snpDraw(); }
function snpDraw(){
  const c = mtCtx('snp-canvas', 316); if(!c) return;
  const {x, w} = c;
  document.querySelectorAll('.snp-b').forEach(b=>{
    const on = _snp.on[b.dataset.k];
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
  });
  const L = 20;
  mtTxt(x, 'reference', L, 18, {size:8.5, col:MTC.a1, weight:'700'});
  mtTxt(x, SNP_REF, L + 80, 18, {size:10, col:MTC.text});
  mtTxt(x, 'raw hypothesis', L, 38, {size:8.5, col:MTC.a2, weight:'700'});
  mtTxt(x, SNP_RAW, L + 80, 38, {size:10, col:MTC.text});
  // stage-by-stage
  let acc = {tags:false, fill:false, case:false, num:false, var:false};
  const refFull = snpApply(SNP_REF, {tags:1, fill:0, case:1, num:1, var:1});
  SNP_STAGES.forEach((s, i)=>{
    const y = 66 + i * 40;
    acc = Object.assign({}, acc);
    const before = snpApply(SNP_RAW, acc).join(' ');
    acc[s.k] = _snp.on[s.k];
    const after = snpApply(SNP_RAW, acc).join(' ');
    const active = _snp.on[s.k], changed = before !== after;
    mtChip(x, L, y, 22, 30, active ? 'rgba(79,70,229,0.25)' : 'rgba(23,27,52,0.04)',
      active ? MTC.a1 : MTC.line, active ? '\u2713' : '', MTC.a1, 10);
    mtTxt(x, s.nm, L + 30, y + 11, {size:9, col: active ? MTC.text : MTC.muted, weight: active ? '700' : ''});
    mtTxt(x, s.ex, L + 30, y + 24, {size:7.5, col:MTC.muted});
    mtTxt(x, after, L + 220, y + 16,
      {size:9, col: active && changed ? MTC.a1 : MTC.muted});
    if(active && changed) mtTxt(x, '\u2190 changed', L + 220 + Math.min(340, after.length * 5.4) + 8, y + 16,
      {size:7.5, col:MTC.a5});
  });
  const hypOut = snpApply(SNP_RAW, _snp.on);
  const nOn = SNP_STAGES.filter(s=>_snp.on[s.k]).length;
  const refOut = nOn === 5 ? refFull : snpApply(SNP_REF, _snp.on);
  const r = snpWer(refOut, hypOut);
  const y2 = 66 + 5*40 + 14;
  mtTxt(x, 'scored: ' + hypOut.join(' '), L, y2, {size:9.5, col:MTC.text});
  mtTxt(x, 'against: ' + refOut.join(' '), L, y2 + 16, {size:9.5, col:MTC.muted});
  mtTxt(x, 'WER = 100 \u00d7 (' + r.I + ' + ' + r.S + ' + ' + r.D + ') / ' + refOut.length + ' = ' +
    r.wer.toFixed(1) + '%', L, y2 + 38, {size:12, col: r.wer > 0 ? MTC.a2 : MTC.a4, weight:'700'});
  mtSet('snp-cap', r.wer === 0
    ? 'Every stage on, and the error rate is zero. The recognizer heard this utterance perfectly; with all five filters off it was charged for five errors it did not acoustically make. That difference is entirely orthographic, and it is a real component of published numbers.'
    : nOn === 0
    ? 'With no normalization the recognizer is charged for a transcription note it was right to emit, a filled pause the speaker did make, a numeral, a spelling variant and a contraction. None of these is a recognition error, and together they account for the whole of the ' +
      r.wer.toFixed(1) + '% shown.'
    : nOn + ' of 5 stages on. ' + r.wer.toFixed(1) + '% remains, from ' + r.S + ' substitutions, ' +
      r.I + ' insertions and ' + r.D + ' deletions.');
}
function snqDraw(){
  const c = mtCtx('snq-canvas', 210); if(!c) return;
  const {x, w} = c;
  const light = {tags:1, fill:1, case:0, num:0, var:0};
  const full  = {tags:1, fill:1, case:1, num:1, var:1};
  const sysA = '[noise] the co-op ordered 15 colours y\u2019know';
  const sysB = 'uh the coop ordered fifteen colors you no';
  const L = 20;
  mtTxt(x, 'reference: ' + SNP_REF, L, 18, {size:9, col:MTC.a1, weight:'700'});
  const rows = [
    {nm:'system A', hyp:sysA, note:'orthographically messy, acoustically perfect'},
    {nm:'system B', hyp:sysB, note:'clean orthography, two real mishearings'}
  ];
  const cols = [{nm:'light normalizer', n:light}, {nm:'full normalizer', n:full}];
  mtTxt(x, 'hypothesis', L + 78, 44, {size:8, col:MTC.muted});
  cols.forEach((cl, j)=> mtTxt(x, cl.nm, L + 420 + j*110, 44, {size:8, col:MTC.muted, align:'center'}));
  const vals = [];
  rows.forEach((rw, i)=>{
    const y = 60 + i * 46;
    mtTxt(x, rw.nm, L, y + 10, {size:9.5, col:MTC.text, weight:'700'});
    mtTxt(x, rw.hyp, L + 78, y + 6, {size:8.5, col:MTC.text});
    mtTxt(x, rw.note, L + 78, y + 20, {size:7.5, col:MTC.muted});
    vals.push(cols.map(cl=>{
      const rr = snpWer(snpApply(SNP_REF, cl.n), snpApply(rw.hyp, cl.n));
      return rr.wer;
    }));
  });
  vals.forEach((vr, i)=>{
    const y = 60 + i * 46;
    vr.forEach((v, j)=>{
      const other = vals[1-i][j];
      const better = v < other;
      mtChip(x, L + 420 + j*110 - 38, y, 76, 26,
        better ? 'rgba(11,132,87,0.22)' : 'rgba(159,18,57,0.14)',
        better ? MTC.a4 : MTC.line, v.toFixed(1) + '%', better ? MTC.a4 : MTC.text, 10);
    });
  });
  mtTxt(x, 'the light normalizer strips tags and filled pauses only; the full one also folds case, punctuation, numerals, spelling and contractions',
    L, 168, {size:8.5, col:MTC.muted});
  const flip = (vals[0][0] > vals[1][0]) !== (vals[0][1] > vals[1][1]);
  // name the winner the numbers actually give, rather than asserting one
  const winner = j => vals[0][j] < vals[1][j] ? 'A' : 'B';
  mtSet('snq-cap', flip
    ? 'The ranking inverts. Under the light normalizer system ' + winner(0) + ' wins by ' +
      Math.abs(vals[0][0] - vals[1][0]).toFixed(1) + ' points; under the full one system ' + winner(1) + ' wins by ' +
      Math.abs(vals[0][1] - vals[1][1]).toFixed(1) + '. Neither system changed. Two papers reporting these numbers without naming their normalizer would appear to contradict each other while both being correct.'
    : 'Both normalizers agree on the ranking here.');
}

/* ══ 15.6.2 SIGNIFICANCE ══════════════════════════════════ */
ASR_PAGES.asrsig = `
<div class="lesson-chapter-label">Section 15.6.2</div>
<h1 class="lesson-h1">Deciding Whether a Difference Is Real</h1>
<p class="lesson-intro">Two systems score 12.4 and 12.1 on the same test set. Whether that gap means anything depends on how many opportunities to differ there were and how consistently one system won them, and answering it requires a unit of comparison smaller than the whole test set but larger than the individual word.</p>

<h2 class="lesson-h2">Segments as the Unit</h2>
<p class="lesson-p">Individual words are not independent: recognition errors arrive in bursts, because whatever caused one error, a burst of noise or an unfamiliar accent, is still present a word later. The standard test therefore cuts the utterance at points where <em>both</em> systems were correct, on the argument that a word both systems got right is a place where whatever was going wrong has stopped going wrong. Within each of the \\(n\\) resulting segments, count each system's errors and take the difference:</p>
<div class="lesson-math">\\[Z_i = N_A^i - N_B^i, \\qquad i = 1, \\ldots, n\\]</div>
<p class="lesson-p">Then the sample mean and the unbiased sample variance:</p>
<div class="lesson-math">\\[\\hat{\\mu}_z = \\frac{1}{n}\\sum_{i=1}^{n} Z_i, \\qquad \\sigma_z^2 = \\frac{1}{n-1}\\sum_{i=1}^{n} (Z_i - \\mu_z)^2\\]</div>
<p class="lesson-p">and the test statistic, which is the mean measured in units of its own standard error:</p>
<div class="lesson-math">\\[W = \\frac{\\hat{\\mu}_z}{\\sigma_z / \\sqrt{n}}\\]</div>
<p class="lesson-p">Under the null hypothesis \\(H_0 : \\mu_z = 0\\), the two systems make the same number of errors per segment on average, and \\(W\\) is approximately standard normal provided \\(n\\) is large enough, conventionally above 50. Reject when</p>
<div class="lesson-math">\\[2P(Z \\ge |w|) \\le 0.05\\]</div>
<p class="lesson-p">for a two-tailed test, or \\(P(Z \\ge |w|) \\le 0.05\\) if the direction was predicted in advance.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Segment Ledger</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="sgl-ctrl"></div>
    <canvas id="sgl-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="sgl-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">A Worked Example That Fails</h2>
<p class="lesson-p">Take four segments with \\(Z = \\{1, -1, 2, 0\\}\\). The mean is \\(\\hat{\\mu}_z = 0.5\\), so system A made half an error more per segment. The variance is</p>
<div class="lesson-math">\\[\\sigma_z^2 = \\frac{1}{3}\\left[(0.5)^2 + (1.5)^2 + (1.5)^2 + (0.5)^2\\right] = \\frac{5}{3}, \\qquad \\sigma_z \\approx 1.29\\]</div>
<div class="lesson-math">\\[W = \\frac{0.5}{1.29/\\sqrt{4}} \\approx 0.775\\]</div>
<p class="lesson-p">Nowhere near the 1.96 needed at the five percent level, and in any case the normal approximation has no business being applied at \\(n = 4\\). The example is here because it is the shape of a great many informal comparisons: a difference in the right direction, on too little evidence to distinguish from noise.</p>

<h2 class="lesson-h2">Why Not a Word-Level Test</h2>
<p class="lesson-p">It is tempting to build a contingency table over individual words, count how often A was right where B was wrong and vice versa, and run McNemar's test on the off-diagonal. That test assumes the paired observations are independent, and word-level recognition errors are not. The panel below measures the correlation between adjacent word errors directly, and it is nowhere near zero, which is exactly why the segment-level test exists.</p>

<div class="quiz-block" id="qas-sg"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why are segment boundaries placed at words both systems got right?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-sg','Correct. A word both systems recognized is evidence that whatever was causing errors has stopped, which is the argument for treating the segments either side of it as independent.')">A word both systems got right marks a point where the local cause of errors has passed, which supports treating segments as independent</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-sg','The segments are deliberately unequal in length; equality is not the goal and would not help.')">It makes every segment the same length</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-sg','Correct words are included in the segments; only the boundary words are set aside as pins.')">It removes correct words from the error counts</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-sg','The statistic is a mean of differences and works for any n; the normal approximation is what needs a large n.')">The test statistic is only defined when segment counts are equal</button>
</div><div class="quiz-explain" id="qas-sg-explain"></div></div>`;

/* ── The Segment Ledger ───────────────────────────────────── */
const SGL_W = [[-3,0.04],[-2,0.07],[-1,0.13],[0,0.28],[1,0.24],[2,0.15],[3,0.09]];
function sglZ(i){
  let u = shsR(i, 11), acc = 0;
  for(let k=0;k<SGL_W.length;k++){ acc += SGL_W[k][1]; if(u <= acc) return SGL_W[k][0]; }
  return 0;
}
function sglErf(z){
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const y = 1 - (((((1.061405429*t - 1.453152027)*t) + 1.421413741)*t - 0.284496736)*t + 0.254829592)*t*Math.exp(-z*z);
  return z >= 0 ? y : -y;
}
function sglTail(wv){ return 0.5 * (1 - sglErf(Math.abs(wv) / Math.SQRT2)); }
let _sgl = 60;
function sglBuild(){
  _sgl = 60;
  const host = document.getElementById('sgl-ctrl');
  if(host) host.innerHTML =
    '<div style="flex:1;min-width:200px"><div style="' + MTLBL + ';margin-bottom:3px">segments n <b id="sgl-n-v" style="color:var(--accent)">60</b></div>' +
    '<input id="sgl-n" type="range" min="4" max="200" step="1" value="60" oninput="sglUpd()" style="width:100%;accent-color:var(--accent)"></div>' +
    '<button style="' + MTBTN + '" onclick="sglSet(4)">the n = 4 example</button>';
  sglUpd();
}
function sglSet(v){ const el = document.getElementById('sgl-n'); if(el) el.value = v; sglUpd(); }
function sglUpd(){
  const el = document.getElementById('sgl-n');
  if(el) _sgl = Math.max(4, Math.round(+el.value));
  mtSet('sgl-n-v', _sgl);
  sglDraw();
}
function sglDraw(){
  const c = mtCtx('sgl-canvas', 330); if(!c) return;
  const {x, w} = c;
  const n = _sgl;
  const Z = (n === 4) ? [1,-1,2,0] : [];
  if(n !== 4) for(let i=0;i<n;i++) Z.push(sglZ(i));
  const mu = Z.reduce((a,b)=>a+b, 0) / n;
  const varz = n > 1 ? Z.reduce((a,b)=>a + (b-mu)*(b-mu), 0) / (n-1) : 0;
  const sd = Math.sqrt(varz);
  const W = sd > 0 ? mu / (sd / Math.sqrt(n)) : 0;
  const p2 = 2 * sglTail(W);
  const L = 20;
  // segment strip
  mtTxt(x, 'segments, cut at words both systems got right', L, 16, {size:9, col:MTC.text, weight:'700'});
  const show = Math.min(n, 40), sw = (w - L - 20) / show;
  for(let i=0;i<show;i++){
    const z = Z[i];
    const col = z > 0 ? 'rgba(159,18,57,' + (0.15 + 0.2*Math.min(3,z)).toFixed(2) + ')'
      : z < 0 ? 'rgba(11,132,87,' + (0.15 + 0.2*Math.min(3,-z)).toFixed(2) + ')'
      : 'rgba(23,27,52,0.05)';
    mtChip(x, L + i*sw, 26, sw - 1.4, 26, col, MTC.line, String(z), MTC.text, sw > 16 ? 8.5 : 6.5);
    // the locked boundary pin
    x.fillStyle = MTC.a1;
    x.fillRect(L + i*sw + sw - 2, 24, 1.6, 30);
  }
  mtTxt(x, 'teal pins are the boundary words both systems recognized', L, 66, {size:8, col:MTC.muted});
  if(n > show) mtTxt(x, 'first ' + show + ' of ' + n + ' shown', w - 20, 66, {size:8, col:MTC.muted, align:'right'});
  // statistics
  const sy = 92;
  mtTxt(x, '\u03bc\u0302_z = ' + mu.toFixed(4), L, sy, {size:10, col:MTC.text});
  mtTxt(x, '\u03c3\u00b2_z = ' + varz.toFixed(4) + '   \u03c3_z = ' + sd.toFixed(4), L, sy + 18, {size:10, col:MTC.text});
  mtTxt(x, 'W = \u03bc\u0302_z / (\u03c3_z / \u221a' + n + ') = ' + W.toFixed(3), L, sy + 36,
    {size:11, col:MTC.a2, weight:'700'});
  mtTxt(x, 'two-tailed p = ' + (p2 < 0.0001 ? '< 0.0001' : p2.toFixed(4)), L, sy + 56,
    {size:11, col: p2 <= 0.05 ? MTC.a4 : MTC.a3, weight:'700'});
  mtTxt(x, p2 <= 0.05 ? 'reject H\u2080: the difference is unlikely under chance'
    : 'do not reject H\u2080: consistent with no real difference', L, sy + 74, {size:9, col:MTC.muted});
  mtTxt(x, n < 50 ? 'n = ' + n + ' < 50: the normal approximation is not yet trustworthy'
    : 'n = ' + n + ' \u2265 50: the normal approximation is reasonable',
    L, sy + 92, {size:9, col: n < 50 ? MTC.a3 : MTC.a4});
  // normal curve with rejection regions
  const gx = 320, gw = w - gx - 20, gy = 100, gh = 100;
  const px = z => gx + gw * (z + 4) / 8;
  const dens = z => Math.exp(-z*z/2) / Math.sqrt(2*Math.PI);
  const dmax = dens(0);
  // shaded tails
  x.fillStyle = 'rgba(178,58,91,0.16)';
  [[-4,-1.96],[1.96,4]].forEach(([a,b])=>{
    x.beginPath(); x.moveTo(px(a), gy + gh);
    for(let z=a; z<=b; z+=0.05) x.lineTo(px(z), gy + gh - gh*dens(z)/dmax);
    x.lineTo(px(b), gy + gh); x.closePath(); x.fill();
  });
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(gx, gy + gh); x.lineTo(gx + gw, gy + gh); x.stroke();
  x.strokeStyle = MTC.a1; x.lineWidth = 1.8; x.beginPath();
  for(let z=-4; z<=4; z+=0.05){
    const X = px(z), Y = gy + gh - gh*dens(z)/dmax;
    z === -4 ? x.moveTo(X, Y) : x.lineTo(X, Y);
  }
  x.stroke();
  [-1.96, 1.96].forEach(z=>{
    x.setLineDash([2,3]); x.strokeStyle = MTC.a3; x.lineWidth = 1;
    x.beginPath(); x.moveTo(px(z), gy); x.lineTo(px(z), gy + gh); x.stroke(); x.setLineDash([]);
    mtTxt(x, z.toFixed(2), px(z), gy + gh + 12, {size:7.5, col:MTC.a3, align:'center'});
  });
  const wc = Math.max(-4, Math.min(4, W));
  x.strokeStyle = MTC.a2; x.lineWidth = 2.2;
  x.beginPath(); x.moveTo(px(wc), gy - 8); x.lineTo(px(wc), gy + gh); x.stroke();
  mtTxt(x, 'W', px(wc), gy - 14, {size:9, col:MTC.a2, align:'center', weight:'700'});
  mtTxt(x, 'standard normal, 5% rejection regions shaded', gx, gy - 24, {size:8.5, col:MTC.muted});
  // McNemar side note with a real correlation readout
  const my = 232;
  mtTxt(x, 'why not a word-level McNemar test', L, my, {size:9, col:MTC.text, weight:'700'});
  let n11 = 0, n10 = 0, n01 = 0, n00 = 0, pairs = 0, both = 0, sA = 0, sB = 0;
  for(let i=0;i<400;i++){
    const burst = shsR(Math.floor(i/6), 13) < 0.25;
    const a = shsR(i, 17) < (burst ? 0.55 : 0.06);
    const b = shsR(i, 19) < (burst ? 0.50 : 0.05);
    if(a && b) n11++; else if(a && !b) n10++; else if(!a && b) n01++; else n00++;
    if(i > 0){
      const pburst = shsR(Math.floor((i-1)/6), 13) < 0.25;
      const pa = shsR(i-1, 17) < (pburst ? 0.55 : 0.06);
      pairs++; both += (a && pa) ? 1 : 0; sA += a ? 1 : 0; sB += pa ? 1 : 0;
    }
  }
  const pA = sA/pairs, pB = sB/pairs, pAB = both/pairs;
  const denom = Math.sqrt(pA*(1-pA)*pB*(1-pB));
  const phi = denom > 0 ? (pAB - pA*pB) / denom : 0;
  const cellW = 66;
  [['both wrong', n11], ['A only', n10], ['B only', n01], ['both right', n00]].forEach(([lab, v], i)=>{
    const bx = L + i*(cellW + 8);
    mtChip(x, bx, my + 10, cellW, 30, 'rgba(79,70,229,0.10)', MTC.line, String(v), MTC.text, 10);
    mtTxt(x, lab, bx + cellW/2, my + 50, {size:7.5, col:MTC.muted, align:'center'});
  });
  mtTxt(x, 'correlation between adjacent word errors: \u03c6 = ' + phi.toFixed(3),
    L + 4*(cellW + 8) + 10, my + 22, {size:9.5, col: Math.abs(phi) > 0.1 ? MTC.a3 : MTC.a4, weight:'700'});
  mtTxt(x, 'McNemar assumes these are independent, and they are not',
    L + 4*(cellW + 8) + 10, my + 38, {size:8.5, col:MTC.muted});
  mtSet('sgl-cap', n === 4
    ? 'The four-segment example: \u03bc\u0302 = 0.5 in the right direction, but \u03c3 = 1.29 across only four observations gives W = 0.775 and a two-tailed p of ' +
      p2.toFixed(3) + '. There is no evidence of a difference here, and at n = 4 the normal approximation would not license a conclusion even if there were.'
    : 'With n = ' + n + ' segments, W = ' + W.toFixed(3) + ' and p = ' + (p2 < 0.0001 ? '< 0.0001' : p2.toFixed(4)) +
      '. The per-segment difference \u03bc\u0302 = ' + mu.toFixed(3) + ' bounces at small n and settles as n grows, because it estimates a fixed property of the two systems. What changes steadily is the standard error, which shrinks as \u221an, so the same real difference becomes detectable once there are enough segments to see it against the noise.');
}

/* ══ 15.7 THE ARCHITECTURE MAP ════════════════════════════ */
ASR_PAGES.asrmap = `
<div class="lesson-chapter-label">Section 15.7</div>
<h1 class="lesson-h1">Three Routes from Waveform to Words</h1>
<p class="lesson-intro">Compare how encoder-decoder, CTC, and transducer systems factorize the probability of a transcript. Their treatment of output history and alignment explains several differences in training and decoding; encoder design also affects latency.</p>

<h2 class="lesson-h2">The Three Factorizations</h2>
<p class="lesson-p">The encoder-decoder conditions each output symbol on all previous symbols and, through attention, on the whole utterance:</p>
<div class="lesson-math">\\[P(Y \\mid \\mathbf{X}) = \\prod_{i=1}^{m} P(y_i \\mid y_{&lt;i},\\; \\mathbf{X})\\]</div>
<p class="lesson-p">CTC conditions each frame on nothing but that frame's encoder state, and sums over alignments:</p>
<div class="lesson-math">\\[P(Y \\mid \\mathbf{X}) = \\sum_{A \\in B^{-1}(Y)} \\prod_{t=1}^{T} p(a_t \\mid \\mathbf{h}_t)\\]</div>
<p class="lesson-p">The transducer keeps the sum over alignments and restores the output history:</p>
<div class="lesson-math">\\[P(Y \\mid \\mathbf{X}) = \\sum_{A \\in B^{-1}(Y)} \\prod_{t=1}^{T} p(a_t \\mid \\mathbf{h}_t,\\; y_{&lt;u_t})\\]</div>
<p class="lesson-p">Read them in order and the pattern is clear. Moving from the first to the second buys frame synchrony, and therefore streaming, at the cost of the output history. Moving from the second to the third buys the history back at the cost of a two-dimensional lattice and the memory that comes with it.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Architecture Map</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="smp-ctrl"></div>
    <canvas id="smp-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="smp-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">What Is Actually Shared</h2>
<p class="lesson-p">The front end is common to all three and to the self-supervised encoders that pretrain them. A stack of strided convolutions takes 16 kHz samples down to a frame rate near 50 Hz, a transformer encoder contextualizes those frames, and everything above that line is the choice of factorization. This is why a single pretrained encoder can be fine-tuned into any of the three, and why the self-supervised pretraining in this chapter is not a fourth architecture but a way of initializing the shared part of the other three.</p>

<div class="quiz-block" id="qas-mp"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Which single property distinguishes the three architectures?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-mp','Correct. All three share the front end and encoder; they differ in what the per-step output distribution is conditioned on, and everything else follows from that.')">What the per-step output distribution is conditioned on</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-mp','All three commonly use the same convolutional front end and the same target inventory.')">The feature extraction front end they use</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-mp','All three can be trained on the same paired speech and text.')">The kind of training data they require</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-mp','Any of them can be trained with characters, subwords or whole words.')">Whether the output units are characters or subwords</button>
</div><div class="quiz-explain" id="qas-mp-explain"></div></div>`;

/* ── The Architecture Map ─────────────────────────────────── */
const SMP_R = [
  {k:'ed', nm:'encoder-decoder', col:'a2', sec:'asrencdec',
   nodes:['cross-attention', 'autoregressive decoder', 'beam search + rescoring'],
   loss:'cross-entropy with teacher forcing',
   acc:0.92, lat:0.10, lm:0.85, cost:0.60,
   note:'Attention over the whole utterance and a full output history give the strongest language modelling of the three, and make streaming impossible.'},
  {k:'ctc', nm:'CTC', col:'a5', sec:'asrctc',
   nodes:['per-frame softmax', 'blank symbol', 'collapse B(A)'],
   loss:'forward-backward sum over alignments',
   acc:0.78, lat:0.92, lm:0.15, cost:0.35,
   note:'Conditional independence across frames makes the loss cheap and the model streamable, and leaves it with no idea what it has already emitted.'},
  {k:'rnnt', nm:'transducer', col:'a4', sec:'asrrnnt',
   nodes:['predictor network', 'joint network', 'T \u00d7 U lattice'],
   loss:'forward sum over a two-dimensional lattice',
   acc:0.88, lat:0.88, lm:0.60, cost:0.90,
   note:'Streaming with an output history, paid for with an O(TU|V|) tensor during training.'}
];
let _smp = 'ctc';
function smpBuild(){
  _smp = 'ctc';
  const host = document.getElementById('smp-ctrl');
  if(host) host.innerHTML = SMP_R.map(r=>
    '<button style="' + MTBTN + '" class="smp-b" data-k="' + r.k + '" onclick="smpPick(\'' + r.k + '\')">' +
    r.nm + '</button>').join('') +
    '<span style="' + MTLBL + '">click a stage below to open the section that builds it</span>';
  smpDraw();
}
function smpPick(k){ _smp = k; smpDraw(); }
function smpGo(sec){ if(typeof openASRSec === 'function') openASRSec(sec); }
function smpDraw(){
  const c = mtCtx('smp-canvas', 322); if(!c) return;
  const {x, w, cv} = c;
  document.querySelectorAll('.smp-b').forEach(b=>{
    const on = b.dataset.k === _smp;
    const r = SMP_R.find(z=>z.k === b.dataset.k);
    b.style.background = on ? MTC[r.col] : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
  });
  const L = 20;
  // the shared trunk
  const shared = [
    {nm:'waveform', s:'16 kHz samples', sec:'asrhard'},
    {nm:'strided conv front end', s:'\u220fs = 320, 50 Hz frames', sec:'asrconv'},
    {nm:'transformer encoder', s:'H \u2208 \u211d\u207f\u02e3\u1d48', sec:'asrsub'}
  ];
  mtTxt(x, 'shared by all three', L, 16, {size:8.5, col:MTC.a1, weight:'700'});
  const boxes = [];
  shared.forEach((s, i)=>{
    const bx = L + i * 175;
    mtChip(x, bx, 24, 160, 40, 'rgba(79,70,229,0.14)', MTC.a1, '', MTC.text, 9);
    mtTxt(x, s.nm, bx + 80, 40, {size:9, col:MTC.a1, align:'center', weight:'700'});
    mtTxt(x, s.s, bx + 80, 54, {size:7.5, col:MTC.muted, align:'center'});
    boxes.push({x:bx, y:24, w:160, h:40, sec:s.sec});
    if(i < 2){
      x.strokeStyle = MTC.line2; x.lineWidth = 1.4;
      x.beginPath(); x.moveTo(bx + 160, 44); x.lineTo(bx + 175, 44); x.stroke();
    }
  });
  // the fork
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L + 2*175 + 160, 44); x.lineTo(L + 2*175 + 180, 44); x.stroke();
  const cur = SMP_R.find(r=>r.k === _smp);
  SMP_R.forEach((r, i)=>{
    const y = 88 + i * 52, on = r.k === _smp;
    x.strokeStyle = MTC[r.col]; x.lineWidth = on ? 2.4 : 1; x.globalAlpha = on ? 1 : 0.3;
    x.beginPath();
    x.moveTo(L + 2*175 + 180, 44);
    x.bezierCurveTo(L + 2*175 + 200, 44, L + 6, y + 14, L + 30, y + 14);
    x.stroke(); x.globalAlpha = 1;
    mtChip(x, L + 30, y, 108, 28, on ? 'rgba(23,27,52,0.05)' : 'transparent',
      MTC[r.col], r.nm, on ? MTC.text : MTC.muted, 9.5);
    boxes.push({x:L + 30, y:y, w:108, h:28, sec:r.sec});
    r.nodes.forEach((nd, j)=>{
      const nx = L + 150 + j * 146;
      x.globalAlpha = on ? 1 : 0.28;
      mtChip(x, nx, y, 138, 28, on ? 'rgba(23,27,52,0.03)' : 'transparent',
        on ? MTC[r.col] : MTC.line, nd, on ? MTC.text : MTC.muted, 8);
      x.globalAlpha = 1;
      if(on) boxes.push({x:nx, y:y, w:138, h:28, sec:r.sec});
    });
  });
  cv._smpBoxes = boxes;
  if(!cv._smpWired){
    cv._smpWired = true;
    cv.style.cursor = 'pointer';
    cv.addEventListener('click', ev=>{
      const rect = cv.getBoundingClientRect();
      const sx = (ev.clientX - rect.left) * (cv.width / (window.devicePixelRatio || 1)) / rect.width;
      const sy = (ev.clientY - rect.top) * (cv.height / (window.devicePixelRatio || 1)) / rect.height;
      const hit = (cv._smpBoxes || []).find(b=> sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h);
      if(hit) smpGo(hit.sec);
    });
  }
  // comparison strip
  const sy = 254;
  mtTxt(x, 'loss: ' + cur.loss, L, sy - 12, {size:9, col:MTC[cur.col], weight:'700'});
  const dims = [['accuracy','acc'],['streaming','lat'],['internal LM','lm'],['training cost','cost']];
  dims.forEach((d, i)=>{
    const bx = L + i * 152;
    mtTxt(x, d[0], bx, sy, {size:8, col:MTC.muted});
    SMP_R.forEach((r, j)=>{
      const on = r.k === _smp;
      x.fillStyle = on ? MTC[r.col] : 'rgba(23,27,52,0.10)';
      x.globalAlpha = on ? 0.6 : 1;
      x.fillRect(bx, sy + 8 + j*13, 120 * r[d[1]], 9);
      x.globalAlpha = 1;
      if(on) mtTxt(x, r.nm, bx + 124, sy + 16 + j*13, {size:7, col:MTC[r.col]});
    });
  });
  mtSet('smp-cap', cur.note + ' Everything to the left of the fork is identical across the three, which is what makes a single self-supervised encoder useful to all of them.');
}

/* ══ 15.8 HOW THE FIELD GOT HERE ══════════════════════════ */
ASR_PAGES.asrhist = `
<div class="lesson-chapter-label">Section 15.8</div>
<h1 class="lesson-h1">How the Field Got Here</h1>
<p class="lesson-intro">Recognition has been attempted since 1952 and has been reinvented from the ground up at least four times. Each paradigm was displaced not because its ideas were wrong but because a different set of ideas scaled better with the compute and data that became available, which is worth keeping in mind while reading the current one.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Paradigm Timeline</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="spt-ctrl"></div>
    <canvas id="spt-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="spt-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Two Equations That Outlived Their Architectures</h2>
<p class="lesson-p">Vintsyuk's 1968 dynamic time warping aligned a test utterance to a stored template by minimizing accumulated distance over a monotone path:</p>
<div class="lesson-math">\\[D(i,j) = d(x_i, y_j) + \\min\\big\\{D(i-1,j),\\; D(i,j-1),\\; D(i-1,j-1)\\big\\}\\]</div>
<p class="lesson-p">Templates are gone, but that recursion is structurally the CTC forward recursion of this chapter, with a min replaced by a sum and distances replaced by log probabilities. The 1976 noisy channel formulation split recognition into two separately estimated distributions:</p>
<div class="lesson-math">\\[\\hat{W} = \\arg\\max_{W} P(A \\mid W)\\,P(W)\\]</div>
<p class="lesson-p">End-to-end training folded \\(P(A \\mid W)\\) and \\(P(W)\\) into one network, and then shallow fusion put the second term back as an additive \\(\\gamma \\log P_{\\mathrm{LM}}(Y)\\) at decoding time. Fifty years on, the same factorization is still doing the same job in the same place.</p>

<h2 class="lesson-h2">The Recurring Shape</h2>
<p class="lesson-p">Each transition follows the same pattern. Something that had been hand-specified becomes learned, and the hand-specified version stops being competitive. Template matching gave way to statistical modelling when the templates could not be enumerated. Gaussian mixtures gave way to neural acoustic models when there was enough compute to train the networks that had already been proposed a decade earlier. Pronunciation dictionaries and separately trained language models gave way to end-to-end training when the paired data was large enough to learn what the dictionaries encoded. Supervised training itself has partly given way to self-supervision for the same reason: unlabelled audio is far more abundant than transcribed audio.</p>
<p class="lesson-p">Several ideas persist across architectures: dynamic programming for alignments, frequency-based features, and separate language-model scores. The chapter’s CTC recurrence uses the same strategy of sharing computation across paths, though it is not the same objective as dynamic time warping.</p>

<div class="quiz-block" id="qas-hs"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Neural acoustic models were proposed in the late 1980s but did not displace Gaussian mixtures until around 2012. What changed?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-hs','Correct. The architectures were largely already described; what arrived was the compute and the data to train them at a scale where they beat the mixtures.')">Compute and training data reached a scale at which the same architectures became competitive</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-hs','Backpropagation was published in the 1980s and was used in the early hybrid systems.')">Backpropagation had not yet been discovered</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-hs','The early hybrid systems kept the HMM and replaced only the observation model, so the HMM framework was not what had to go.')">The HMM framework had to be abandoned first</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-hs','MFCCs were standard long before 2012 and were the input to both the mixtures and the early neural models.')">Mel-frequency cepstral coefficients had not been invented</button>
</div><div class="quiz-explain" id="qas-hs-explain"></div></div>`;

/* ── The Paradigm Timeline ────────────────────────────────── */
const SPT_TR = [
  {nm:'pattern matching', col:'a5', ev:[
    {y:1952, t:'Davis, Biddulph and Balashek: spoken digits at Bell Labs'},
    {y:1959, t:'Fry and Denes add phoneme transition statistics'},
    {y:1968, t:'Vintsyuk proposes dynamic time warping'},
    {y:1971, t:'Sakoe and Chiba and Itakura refine DTW alignment'}]},
  {nm:'signal processing', col:'a1', ev:[
    {y:1965, t:'Cooley and Tukey publish the fast Fourier transform'},
    {y:1968, t:'the cepstrum enters speech analysis'},
    {y:1971, t:'linear predictive coding gives a compact spectral model'},
    {y:1975, t:'LPC features combined with dynamic programming'},
    {y:1980, t:'mel-frequency cepstral coefficients become standard'}]},
  {nm:'statistical modelling', col:'a2', ev:[
    {y:1972, t:'HMMs applied to speech independently at IDA and CMU'},
    {y:1975, t:'Jelinek\u2019s stack decoding; Baker\u2019s Viterbi decoding'},
    {y:1976, t:'the noisy channel formulation with a separate language model'},
    {y:1988, t:'ARPA evaluations set the benchmark culture'},
    {y:1995, t:'HMM with Gaussian mixture observation models dominates'}]},
  {nm:'neural', col:'a4', ev:[
    {y:1989, t:'time-delay neural networks for phoneme classification'},
    {y:1991, t:'recurrent networks applied to acoustic modelling'},
    {y:1994, t:'hybrid HMM systems with an MLP observation model'},
    {y:2006, t:'connectionist temporal classification'},
    {y:2009, t:'deep belief networks revive deep acoustic models'},
    {y:2012, t:'neural acoustic models overtake Gaussian mixtures'},
    {y:2013, t:'the recurrent neural network transducer'},
    {y:2015, t:'listen, attend and spell: attention end to end'},
    {y:2018, t:'transformer encoders replace recurrent ones'},
    {y:2021, t:'self-supervised pretraining on unlabelled audio'}]}
];
const SPT_C = [
  {y:1952, f:1e-8}, {y:1970, f:1e-5}, {y:1985, f:1e-3}, {y:1995, f:0.05},
  {y:2005, f:0.3}, {y:2012, f:2}, {y:2018, f:30}, {y:2024, f:100}
];
let _spt = 1990;
function sptBuild(){
  _spt = 1990;
  const host = document.getElementById('spt-ctrl');
  if(host) host.innerHTML =
    '<div style="flex:1;min-width:220px"><div style="' + MTLBL + ';margin-bottom:3px">year <b id="spt-y-v" style="color:var(--accent)">1990</b></div>' +
    '<input id="spt-y" type="range" min="1952" max="2024" step="1" value="1990" oninput="sptUpd()" style="width:100%;accent-color:var(--accent)"></div>' +
    '<button style="' + MTBTN + '" onclick="sptSet(1975)">1975</button>' +
    '<button style="' + MTBTN + '" onclick="sptSet(1995)">1995</button>' +
    '<button style="' + MTBTN + '" onclick="sptSet(2012)">2012</button>' +
    '<button style="' + MTBTN + '" onclick="sptSet(2024)">2024</button>';
  sptUpd();
}
function sptSet(v){ const el = document.getElementById('spt-y'); if(el) el.value = v; sptUpd(); }
function sptUpd(){
  const el = document.getElementById('spt-y');
  if(el) _spt = Math.max(1952, Math.min(2024, Math.round(+el.value)));
  mtSet('spt-y-v', _spt);
  sptDraw();
}
function sptDraw(){
  const c = mtCtx('spt-canvas', 344); if(!c) return;
  const {x, w} = c;
  const L = 120, PW = w - L - 24;
  const tx = y => L + PW * (y - 1952) / (2024 - 1952);
  // axis
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(L, 26); x.lineTo(L + PW, 26); x.stroke();
  for(let y=1960; y<=2020; y+=10){
    x.strokeStyle = MTC.line;
    x.beginPath(); x.moveTo(tx(y), 22); x.lineTo(tx(y), 30); x.stroke();
    mtTxt(x, String(y), tx(y), 16, {size:7.5, col:MTC.muted, align:'center'});
  }
  // compute overlay
  const cy0 = 42, chh = 26;
  x.strokeStyle = 'rgba(79,70,229,0.35)'; x.lineWidth = 1.4;
  x.beginPath();
  SPT_C.forEach((p, i)=>{
    const X = tx(p.y), Y = cy0 + chh - chh * (Math.log10(p.f) + 8) / 10;
    i ? x.lineTo(X, Y) : x.moveTo(X, Y);
  });
  x.stroke();
  mtTxt(x, 'available compute', 6, cy0 + 10, {size:8, col:MTC.a1});
  mtTxt(x, 'log scale', 6, cy0 + 21, {size:7, col:MTC.muted});
  // tracks
  let ty = 84;
  const revealed = [];
  SPT_TR.forEach(tr=>{
    mtTxt(x, tr.nm, 6, ty + 10, {size:8.5, col:MTC[tr.col], weight:'700'});
    const yrs = tr.ev.map(e=>e.y);
    const y0 = Math.min(...yrs), y1 = Math.max(...yrs);
    x.fillStyle = 'rgba(23,27,52,0.04)';
    x.fillRect(tx(y0) - 6, ty, tx(y1) - tx(y0) + 12, 18);
    const upto = Math.min(_spt, y1);
    if(_spt >= y0){
      x.fillStyle = MTC[tr.col]; x.globalAlpha = 0.22;
      x.fillRect(tx(y0) - 6, ty, tx(upto) - tx(y0) + 12, 18);
      x.globalAlpha = 1;
    }
    tr.ev.forEach(e=>{
      const on = e.y <= _spt;
      x.fillStyle = on ? MTC[tr.col] : 'rgba(23,27,52,0.16)';
      x.beginPath(); x.arc(tx(e.y), ty + 9, on ? 4 : 2.6, 0, 7); x.fill();
      if(on) revealed.push({y:e.y, t:e.t, col:tr.col, nm:tr.nm});
    });
    ty += 30;
  });
  // playhead
  x.strokeStyle = MTC.a3; x.lineWidth = 1.6;
  x.beginPath(); x.moveTo(tx(_spt), 22); x.lineTo(tx(_spt), ty - 8); x.stroke();
  mtTxt(x, String(_spt), tx(_spt), ty + 4, {size:9, col:MTC.a3, align:'center', weight:'700'});
  // the most recent events
  revealed.sort((p,q)=>q.y - p.y);
  const recent = revealed.slice(0, 5).reverse();
  mtTxt(x, 'most recent developments as of ' + _spt, 6, ty + 26, {size:9, col:MTC.text, weight:'700'});
  recent.forEach((e, i)=>{
    const y = ty + 42 + i * 18;
    mtTxt(x, String(e.y), 6, y, {size:9, col:MTC[e.col], weight:'700', font:MTC.mono});
    mtTxt(x, e.t, 52, y, {size:9, col:MTC.text});
  });
  const era = _spt < 1968 ? 'Recognition means matching a stored template. Vocabularies are a few dozen words, and every speaker needs their own templates.'
    : _spt < 1975 ? 'Dynamic programming solves the alignment problem, and the same recursion is still the loss function used to train recognizers today.'
    : _spt < 1990 ? 'The noisy channel formulation splits the problem into an acoustic model and a separately estimated language model, a division that survives into the rescoring stage of modern beam search.'
    : _spt < 2009 ? 'HMMs with Gaussian mixture observation models are the standard. Neural acoustic models exist and are not yet competitive.'
    : _spt < 2016 ? 'Compute catches up with architectures proposed twenty years earlier. Neural acoustic models overtake mixtures, and CTC removes the need for a separate alignment step.'
    : 'Attention replaces recurrence, the pronunciation dictionary and the separate language model become optional, and self-supervised pretraining on unlabelled audio cuts the transcribed data requirement by orders of magnitude.';
  mtSet('spt-cap', era);
}

/* ══ 15.9 EXERCISES ═══════════════════════════════════════ */
ASR_PAGES.asrex = `
<div class="lesson-chapter-label">Section 15.9</div>
<h1 class="lesson-h1">Working the Mathematics by Hand</h1>
<p class="lesson-intro">Try the four exercises on paper, then reveal the answers. Use the randomizer for another example once you understand the calculation.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Exercise Benches</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="sxb-ctrl"></div>
    <canvas id="sxb-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="sxb-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Bench One: Convolution Arithmetic</h2>
<p class="lesson-p">Given input length \\(n\\), kernel width \\(k\\), padding \\(p\\) and stride \\(s\\), the output length is</p>
<div class="lesson-math">\\[n_{\\mathrm{out}} = \\left\\lfloor \\frac{n + 2p - k}{s} \\right\\rfloor + 1\\]</div>
<p class="lesson-p">and for a stack of \\(L\\) layers the receptive field of one output unit, measured in input samples, is</p>
<div class="lesson-math">\\[R_L = 1 + \\sum_{\\ell=1}^{L}(k_\\ell - 1)\\prod_{j &lt; \\ell} s_j\\]</div>

<h2 class="lesson-h2">Bench Two: Counting Alignments</h2>
<p class="lesson-p">For target \\(Y\\) of length \\(U\\) over \\(T\\) frames, the number of valid CTC alignments is the path count through the extended lattice of length \\(2U+1\\), obeying the recursion</p>
<div class="lesson-math">\\[N_t(s) = N_{t-1}(s) + N_{t-1}(s-1) + \\mathbb{1}\\!\\left[\\ell'_s \\ne \\epsilon \\;\\wedge\\; \\ell'_s \\ne \\ell'_{s-2}\\right] N_{t-1}(s-2)\\]</div>
<p class="lesson-p">Compare it against the unconstrained \\(|C|^T\\) to see how small a fraction of frame labellings survive the constraint.</p>

<h2 class="lesson-h2">Bench Three: Scoring a Transcript</h2>
<p class="lesson-p">Align, count, divide. One of the three pairs is constructed so the answer exceeds 100 percent.</p>
<div class="lesson-math">\\[\\mathrm{WER} = 100 \\times \\frac{I + S + D}{N_{\\mathrm{ref}}}\\]</div>

<h2 class="lesson-h2">Bench Four: k-Means by Hand</h2>
<p class="lesson-p">Eight points, \\(K = 2\\). Run assignment and re-estimation until nothing moves, then restart from the other initialization and observe that the objective</p>
<div class="lesson-math">\\[J = \\sum_{i=1}^{K}\\sum_{\\mathbf{z} \\in C_i} \\|\\mathbf{z} - \\boldsymbol{\\mu}_i\\|^2\\]</div>
<p class="lesson-p">converges to a different value. The algorithm is monotone in \\(J\\) and therefore always converges, but nothing makes the point it converges to the global optimum.</p>

<div class="quiz-block" id="qas-ex"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A stack of three layers has widths \\(k = [5, 3, 3]\\) and strides \\(s = [2, 2, 1]\\). What is the receptive field of one output unit?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qas-ex','Correct. 1 + (5\u22121)\u00b71 + (3\u22121)\u00b72 + (3\u22121)\u00b74 = 1 + 4 + 4 + 8 = 17.')">17 samples</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-ex','That is the sum of the widths, which ignores the stride products that scale each later layer\u2019s contribution.')">11 samples</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-ex','That would be the answer if every stride were 1, giving 1 + 4 + 2 + 2.')">9 samples</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qas-ex','The stride product for layer \u2113 runs over layers strictly before \u2113, so the third layer is scaled by 4 and not by 8.')">25 samples</button>
</div><div class="quiz-explain" id="qas-ex-explain"></div></div>`;

/* ── The Exercise Benches ─────────────────────────────────── */
const SXB_WER = [
  {r:'she left the keys on the table', h:'he left the keys on a table'},
  {r:'call marcus at four', h:'call marcus at four thirty on friday if he is around'},
  {r:'the report is due monday', h:'the report is due on monday morning'}
];
const SXB_PTS = [[1.0,1.4],[1.6,2.8],[2.0,1.0],[1.2,2.2],[4.2,1.6],[4.6,2.6],[8.6,2.8],[9.2,1.4]];
let _sxb = {b:0, seed:0, rev:false, wi:0, ki:0, kIter:0, kAssign:null, kMu:null};
function sxbBuild(){
  _sxb = {b:0, seed:0, rev:false, wi:0, ki:0, kIter:0, kAssign:null, kMu:null};
  const host = document.getElementById('sxb-ctrl');
  if(host) host.innerHTML =
    ['convolution','alignments','word error rate','k-means'].map((nm, i)=>
      '<button style="' + MTBTN + '" class="sxb-b" data-i="' + i + '" onclick="sxbPick(' + i + ')">' + nm + '</button>').join('') +
    '<button style="' + MTBTN + '" onclick="sxbNew()">new problem</button>' +
    '<button style="' + MTBTN + '" id="sxb-r" onclick="sxbRev()">reveal</button>';
  sxbDraw();
}
function sxbPick(i){ _sxb.b = i; _sxb.rev = false; if(i === 3) sxbKReset(); sxbDraw(); }
function sxbNew(){
  _sxb.rev = false;
  if(_sxb.b === 2) _sxb.wi = (_sxb.wi + 1) % SXB_WER.length;
  else if(_sxb.b === 3){ _sxb.ki = (_sxb.ki + 1) % 2; sxbKReset(); }
  else _sxb.seed++;
  sxbDraw();
}
function sxbRev(){
  if(_sxb.b === 3){ sxbKStep(); return; }
  _sxb.rev = !_sxb.rev; sxbDraw();
}
function sxbKReset(){
  _sxb.kIter = 0;
  _sxb.kMu = _sxb.ki === 0 ? [[1.0,1.5],[1.0,3.0]] : [[1.0,1.0],[1.0,1.5]];
  _sxb.kAssign = null;
}
function sxbKStep(){
  const P = SXB_PTS, mu = _sxb.kMu;
  const a = P.map(p=>{
    let bi = 0, bd = Infinity;
    mu.forEach((m, i)=>{ const d = (p[0]-m[0])**2 + (p[1]-m[1])**2; if(d < bd){ bd = d; bi = i; } });
    return bi;
  });
  _sxb.kAssign = a;
  mu.forEach((m, i)=>{
    const mem = P.filter((p, j)=>a[j] === i);
    if(mem.length){
      m[0] = mem.reduce((s,p)=>s+p[0],0)/mem.length;
      m[1] = mem.reduce((s,p)=>s+p[1],0)/mem.length;
    }
  });
  _sxb.kIter++;
  sxbDraw();
}
function sxbJ(){
  if(!_sxb.kAssign) return null;
  return SXB_PTS.reduce((s,p,j)=>{
    const m = _sxb.kMu[_sxb.kAssign[j]];
    return s + (p[0]-m[0])**2 + (p[1]-m[1])**2;
  }, 0);
}
function sxbCtcPaths(T, tgt){
  const ext = [SCM_EPS];
  tgt.split('').forEach(ch=>{ ext.push(ch); ext.push(SCM_EPS); });
  const S = ext.length;
  let N = new Array(S).fill(0);
  N[0] = 1; if(S > 1) N[1] = 1;
  for(let t=1;t<T;t++){
    const M = new Array(S).fill(0);
    for(let s=0;s<S;s++){
      let acc = N[s];
      if(s >= 1) acc += N[s-1];
      if(s >= 2 && ext[s] !== SCM_EPS && ext[s] !== ext[s-2]) acc += N[s-2];
      M[s] = acc;
    }
    N = M;
  }
  return N[S-1] + (S >= 2 ? N[S-2] : 0);
}
function sxbDraw(){
  const c = mtCtx('sxb-canvas', 306); if(!c) return;
  const {x, w} = c;
  document.querySelectorAll('.sxb-b').forEach(b=>{
    const on = +b.dataset.i === _sxb.b;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
  });
  const rb = document.getElementById('sxb-r');
  if(rb) rb.textContent = _sxb.b === 3 ? 'assign + re-estimate' : (_sxb.rev ? 'hide' : 'reveal');
  const L = 20;
  if(_sxb.b === 0){
    const ks = [3,5,7,9], ss = [1,2,2,3,4], ps = [0,1,2,3];
    const k = ks[Math.floor(shsR(_sxb.seed, 31) * ks.length)];
    const s = ss[Math.floor(shsR(_sxb.seed, 37) * ss.length)];
    const p = ps[Math.floor(shsR(_sxb.seed, 41) * ps.length)];
    const n = 40 + Math.floor(shsR(_sxb.seed, 43) * 160);
    mtTxt(x, 'Bench one', L, 20, {size:9, col:MTC.a1, weight:'700'});
    mtTxt(x, 'An input of length n = ' + n + ' passes through one convolution with', L, 44, {size:11, col:MTC.text});
    mtTxt(x, 'kernel width k = ' + k + ', padding p = ' + p + ', stride s = ' + s + '.', L, 64, {size:11, col:MTC.text});
    mtTxt(x, 'What is the output length? Is the length preserved?', L, 84, {size:11, col:MTC.text});
    const out = Math.floor((n + 2*p - k)/s) + 1;
    const ks2 = [10,3,3,3,3,2,2], ss2 = [5,2,2,2,2,2,2];
    let R = 1, prod = 1;
    ks2.forEach((kk, i)=>{ R += (kk - 1) * prod; prod *= ss2[i]; });
    mtTxt(x, 'Then: a seven-layer stack with k = [10,3,3,3,3,2,2] and s = [5,2,2,2,2,2,2].', L, 116, {size:11, col:MTC.text});
    mtTxt(x, 'What is the receptive field in samples, and in milliseconds at 16 kHz?', L, 136, {size:11, col:MTC.text});
    if(_sxb.rev){
      mtChip(x, L, 162, w - 2*L, 110, 'rgba(11,132,87,0.10)', MTC.a4, '', MTC.text, 9);
      mtTxt(x, 'n_out = \u230a(' + n + ' + 2\u00b7' + p + ' \u2212 ' + k + ') / ' + s + '\u230b + 1 = \u230a' +
        ((n + 2*p - k)/s).toFixed(3) + '\u230b + 1 = ' + out, L + 12, 184, {size:11, col:MTC.a4, weight:'700'});
      mtTxt(x, 'length ' + (out === n ? 'is preserved' : 'is not preserved') +
        (s === 1 ? '; with s = 1 it is preserved exactly when 2p = k \u2212 1, and here 2p = ' + (2*p) + ', k \u2212 1 = ' + (k-1)
                 : '; with s = ' + s + ' > 1 preservation is impossible'),
        L + 12, 204, {size:10, col:MTC.text});
      mtTxt(x, 'R\u2087 = 1 + ' + ks2.map((kk,i)=>'(' + kk + '\u22121)\u00b7' + ss2.slice(0,i).reduce((a,b)=>a*b,1)).join(' + '),
        L + 12, 228, {size:9.5, col:MTC.text});
      mtTxt(x, '     = ' + R + ' samples = ' + (1000*R/16000).toFixed(1) + ' ms at 16 kHz',
        L + 12, 248, {size:11, col:MTC.a4, weight:'700'});
      mtTxt(x, 'and \u220fs = ' + prod + ', so the frame rate is 16000 / ' + prod + ' = ' +
        (16000/prod).toFixed(0) + ' Hz', L + 12, 266, {size:10, col:MTC.muted});
    }
    mtSet('sxb-cap', 'Press "new problem" for a different n, k, p and s. The seven-layer stack is the wav2vec 2.0 and HuBERT front end and does not change.');
  } else if(_sxb.b === 1){
    const tgts = ['ab','aab','abc','aa'];
    // reaches down past T = U + r so the feasibility case actually occurs;
    // at T >= 4 no target here can violate it and that branch stayed dead
    const T = 2 + Math.floor(shsR(_sxb.seed, 47) * 6);
    const tgt = tgts[Math.floor(shsR(_sxb.seed, 53) * tgts.length)];
    const V = 3;
    mtTxt(x, 'Bench two', L, 20, {size:9, col:MTC.a1, weight:'700'});
    mtTxt(x, 'Target Y = "' + tgt + '", U = ' + tgt.length + ', over T = ' + T + ' frames,', L, 44, {size:11, col:MTC.text});
    mtTxt(x, 'with an output alphabet of ' + V + ' symbols plus blank.', L, 64, {size:11, col:MTC.text});
    mtTxt(x, 'How many valid CTC alignments collapse to Y? How many frame', L, 88, {size:11, col:MTC.text});
    mtTxt(x, 'labellings are there in total, and what fraction survives?', L, 108, {size:11, col:MTC.text});
    const ext = [SCM_EPS];
    tgt.split('').forEach(ch=>{ ext.push(ch); ext.push(SCM_EPS); });
    const feasible = T >= tgt.length + (tgt.split('').filter((ch,i)=>i>0 && ch===tgt[i-1]).length);
    const paths = feasible ? sxbCtcPaths(T, tgt) : 0;
    const total = Math.pow(V + 1, T);
    // the extended lattice
    const gx = L, gy = 136, cw = Math.min(46, (w - 2*L) / T), chh = 18;
    ext.forEach((s, i)=>{
      mtTxt(x, s, gx - 8, gy + i*chh + 12, {size:8.5, col: s === SCM_EPS ? MTC.muted : MTC.a2, align:'right'});
      for(let t=0;t<T;t++){
        x.strokeStyle = MTC.line;
        x.strokeRect(gx + t*cw, gy + i*chh, cw, chh);
      }
    });
    for(let t=0;t<T;t++) mtTxt(x, 't' + (t+1), gx + t*cw + cw/2, gy + ext.length*chh + 12,
      {size:7, col:MTC.muted, align:'center'});
    mtTxt(x, 'extended target \u2113\u2032, length 2U+1 = ' + ext.length, gx + T*cw + 16, gy + 14, {size:9, col:MTC.muted});
    if(_sxb.rev){
      mtTxt(x, 'valid alignments: ' + paths, gx + T*cw + 16, gy + 38, {size:12, col:MTC.a4, weight:'700'});
      mtTxt(x, 'total labellings: ' + V + '+1 = 4, 4^' + T + ' = ' + total,
        gx + T*cw + 16, gy + 58, {size:10, col:MTC.text});
      mtTxt(x, 'fraction: ' + (100*paths/total).toFixed(3) + '%', gx + T*cw + 16, gy + 76, {size:10, col:MTC.a2});
      if(!feasible) mtTxt(x, 'T is too small: T \u2265 U + r is violated', gx + T*cw + 16, gy + 94, {size:9, col:MTC.a3});
    }
    mtSet('sxb-cap', 'Fill the lattice column by column with the three-term recursion. The skip term is allowed only when the current symbol is not blank and differs from the one two rows above it, which is what forbids merging a doubled letter.');
  } else if(_sxb.b === 2){
    const pair = SXB_WER[_sxb.wi];
    const R = pair.r.split(' '), H = pair.h.split(' ');
    mtTxt(x, 'Bench three', L, 20, {size:9, col:MTC.a1, weight:'700'});
    mtTxt(x, 'REF  ' + pair.r, L, 48, {size:11.5, col:MTC.a1});
    mtTxt(x, 'HYP  ' + pair.h, L, 72, {size:11.5, col:MTC.a2});
    mtTxt(x, 'Align the two, count insertions, substitutions and deletions,', L, 100, {size:11, col:MTC.text});
    mtTxt(x, 'and compute the word error rate. Reference length is ' + R.length + '.', L, 120, {size:11, col:MTC.text});
    if(_sxb.rev){
      const {ops} = sagAlign(R, H, 1, 1, 1);
      const S = ops.filter(o=>o.op === 'S').length;
      const I = ops.filter(o=>o.op === 'I').length;
      const D = ops.filter(o=>o.op === 'D').length;
      const wer = 100*(S+I+D)/R.length;
      const sw = Math.min(54, (w - 60) / ops.length);
      ['REF','HYP','EVAL'].forEach((lab, row)=>{
        mtTxt(x, lab, 6, 156 + row*22 + 11, {size:8, col:MTC.muted});
        ops.forEach((o, k)=>{
          const txt = row === 0 ? (o.r || '***') : row === 1 ? (o.h || '***') : (o.op === 'C' ? '' : o.op);
          const col = o.op === 'C' ? MTC.muted : o.op === 'S' ? MTC.a2 : o.op === 'I' ? MTC.a3 : MTC.a5;
          if(txt) mtTxt(x, txt.slice(0,7), 40 + k*sw, 156 + row*22 + 11, {size:7.5, col:col});
        });
      });
      mtTxt(x, 'WER = 100 \u00d7 (' + I + ' + ' + S + ' + ' + D + ') / ' + R.length + ' = ' + wer.toFixed(1) + '%',
        L, 244, {size:13, col: wer > 100 ? MTC.a3 : MTC.a4, weight:'700'});
      if(wer > 100) mtTxt(x, 'over 100%: seven insertions against a four-word reference', L, 266, {size:9.5, col:MTC.a3});
    }
    mtSet('sxb-cap', 'Three pairs. Press "new problem" to cycle through them; one is constructed so the rate exceeds 100 percent.');
  } else {
    mtTxt(x, 'Bench four', L, 20, {size:9, col:MTC.a1, weight:'700'});
    mtTxt(x, 'Eight points, K = 2. Initialization ' + (_sxb.ki === 0 ? 'A: \u03bc = (1.0, 1.5) and (1.0, 3.0)' : 'B: \u03bc = (1.0, 1.0) and (1.0, 1.5)'),
      L, 44, {size:11, col:MTC.text});
    mtTxt(x, 'Press "assign + re-estimate" until nothing moves, then press "new', L, 64, {size:11, col:MTC.text});
    mtTxt(x, 'problem" to restart from the other initialization.', L, 84, {size:11, col:MTC.text});
    const px0 = 300, py0 = 108;
    const PX = p => px0 + p[0]*22, PY = p => py0 + 150 - p[1]*42;
    x.strokeStyle = MTC.line; x.lineWidth = 1;
    x.strokeRect(px0 - 10, py0, 240, 160);
    SXB_PTS.forEach((p, j)=>{
      const a = _sxb.kAssign ? _sxb.kAssign[j] : null;
      x.fillStyle = a === 0 ? MTC.a1 : a === 1 ? MTC.a2 : 'rgba(23,27,52,0.30)';
      x.beginPath(); x.arc(PX(p), PY(p), 4.2, 0, 7); x.fill();
    });
    (_sxb.kMu || []).forEach((m, i)=>{
      x.strokeStyle = i === 0 ? MTC.a1 : MTC.a2; x.lineWidth = 2;
      x.beginPath(); x.arc(PX(m), PY(m), 7, 0, 7); x.stroke();
      x.beginPath();
      x.moveTo(PX(m) - 9, PY(m)); x.lineTo(PX(m) + 9, PY(m));
      x.moveTo(PX(m), PY(m) - 9); x.lineTo(PX(m), PY(m) + 9);
      x.stroke();
      mtTxt(x, '\u03bc' + (i+1) + ' = (' + m[0].toFixed(2) + ', ' + m[1].toFixed(2) + ')',
        L, 130 + i*20, {size:10, col: i === 0 ? MTC.a1 : MTC.a2, weight:'700'});
    });
    mtTxt(x, 'iteration ' + _sxb.kIter, L, 186, {size:10, col:MTC.muted});
    const J = sxbJ();
    if(J !== null) mtTxt(x, 'J = ' + J.toFixed(3), L, 208, {size:13, col:MTC.a4, weight:'700'});
    mtSet('sxb-cap', _sxb.ki === 0
      ? 'Initialization A separates after three rounds and settles at J = 15.967, which an exhaustive search over all 127 two-way partitions confirms is the global optimum. The split puts the six left and middle points together and the two far-right points on their own.'
      : 'Initialization B settles after two rounds at J = 24.530, cutting between the left group and the middle group instead. Nothing has gone wrong: J decreased at every step and the result is a genuine fixed point, where no point wants to switch and no centroid wants to move. It is simply 8.6 worse than the optimum, which is the whole difficulty with k-means. Monotone convergence guarantees a fixed point, not a good one.');
  }
}

/* ══ SECTION ROUTER ═══════════════════════════════════════ */
function openASRSec(id){
  const pg = ASR_PAGES[id];
  if(!pg) return;
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if(!sv || !sb) return;
  const sec = ASR_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if(crumb && sec) crumb.innerHTML = 'Automatic Speech Recognition <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  renderMath(sb);
  mcSectionDelay(()=>{
    if(id==='asrhard'){ sddBuild(); scsBuild(); }
    if(id==='asrconv'){ skwBuild(); skdBuild(); skrBuild(); }
    if(id==='asrencdec') stcBuild();
    if(id==='asrsub') ssbBuild();
    if(id==='asrdec'){ sxaBuild(); srbBuild(); }
    if(id==='asrtrain') shsBuild();
    if(id==='asrssl'){ slbBuild(); slmBuild(); }
    if(id==='asrpass') sstBuild();
    if(id==='asrtgt') stsBuild();
    if(id==='asrkm') skmBuild();
    if(id==='asrctc') scmBuild();
    if(id==='asrsum') sledBuild();
    if(id==='asrfb') slfBuild();
    if(id==='asrjoint') shtBuild();
    if(id==='asrrnnt') slrBuild();
    if(id==='asrwer') sagBuild();
    if(id==='asrnorm') snpBuild();
    if(id==='asrsig') sglBuild();
    if(id==='asrmap') smpBuild();
    if(id==='asrhist') sptBuild();
    if(id==='asrex') sxbBuild();
  }, 120);
  sv.onscroll = () => {
    const hh = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if(bar) bar.style.width = (hh>0?(sv.scrollTop/hh)*100:0)+'%';
  };
}
