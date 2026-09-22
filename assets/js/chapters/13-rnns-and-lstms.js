/* ══════════════════════════════════════════════════════════════
   RNNs AND LSTMs
   ══════════════════════════════════════════════════════════════ */

const RN_SEC = [
  {id:'rnloop',  num:'13.1',   title:'A Network That Remembers Where It Has Been', icon:'\u21BA', desc:'One recurrent connection turns a feedforward network into a machine with memory.', tags:['hidden state','recurrence']},
  {id:'rnfwd',   num:'13.1.1', title:'Running a Sequence Forward, One Step at a Time', icon:'\u2192', desc:'The forward pass is a strict left-to-right loop, and why it cannot be parallelized.', tags:['forward pass','sequential']},
  {id:'rnbptt',  num:'13.1.2', title:'Sending the Error Signal Backward Through Time', icon:'\u21A9', desc:'Backpropagation through time: two error sources at every state, and truncation.', tags:['BPTT','truncation']},
  {id:'rnlm',    num:'13.2',   title:'Predicting the Next Word Without a Window', icon:'\u221E', desc:'N-grams and feedforward models see a fixed window; a recurrent state has no horizon.', tags:['language model','context']},
  {id:'rninf',   num:'13.2.1', title:'Forward Inference in a Recurrent Language Model', icon:'\u25A4', desc:'Every tensor with its shape attached, from one-hot input to softmax output.', tags:['shapes','softmax']},
  {id:'rntrain', num:'13.2.2', title:'Learning From Raw Text With No Labels', icon:'\u229F', desc:'The next word is its own answer key: self-supervision and the cross-entropy loss.', tags:['self-supervision','cross-entropy']},
  {id:'rntie',   num:'13.2.3', title:'Using One Embedding Matrix Twice', icon:'\u22A4', desc:'The output layer is the embedding matrix transposed, and the parameters it saves.', tags:['weight tying','E transpose']},
  {id:'rnjobs',  num:'13.3',   title:'Four Jobs for One Architecture', icon:'\u2318', desc:'Labeling, classification, generation, and translation differ only in the output wiring.', tags:['architectures','loss placement']},
  {id:'rntag',   num:'13.3.1', title:'Attaching a Label to Every Token', icon:'\u2263', desc:'Sequence labeling: one softmax per position over a tagset, and ambiguity in the raw counts.', tags:['POS tagging','per-token loss']},
  {id:'rncls',   num:'13.3.2', title:'Compressing a Whole Text Into One Vector', icon:'\u25BD', desc:'Text classification reads only the final state, unless pooling widens the funnel.', tags:['classification','pooling']},
  {id:'rngen',   num:'13.3.3', title:'Sampling Text One Word at a Time', icon:'\u21BB', desc:'Autoregressive generation: the output loops back as the next input, with a temperature dial.', tags:['generation','temperature']},
  {id:'rnstack', num:'13.4.1', title:'Feeding One Recurrent Layer Into Another', icon:'\u2261', desc:'Stacked RNNs: each layer re-represents the one below, at a rising training cost.', tags:['stacking','depth']},
  {id:'rnbi',    num:'13.4.2', title:'Reading the Sentence From Both Ends', icon:'\u21C4', desc:'Bidirectional RNNs concatenate a forward and a backward sweep at every position.', tags:['bidirectional','concatenation']},
  {id:'rnlstm',  num:'13.5',   title:'Why Long-Distance Information Gets Lost', icon:'\u26A0', desc:'Vanishing gradients, measured; then the LSTM built one gate at a time.', tags:['vanishing gradient','LSTM gates']},
  {id:'rnunit',  num:'13.5.1', title:'Hiding the Complexity Inside the Unit', icon:'\u25A3', desc:'Feedforward, simple recurrent, and LSTM units at the same scale; the wiring outside barely changes.', tags:['modularity','cell state']},
  {id:'rngrid',  num:'13.6',   title:'The Four Shapes, Side by Side', icon:'\u229E', desc:'A two-by-two grid of input-output patterns, and which task belongs in which cell.', tags:['taxonomy','task mapping']},
  {id:'rnenc',   num:'13.7',   title:'When Input and Output Do Not Line Up', icon:'\u2442', desc:'From one-to-one labeling to encoder-decoder: the concatenation trick and the context handoff.', tags:['encoder-decoder','context vector']},
  {id:'rnteach', num:'13.7.1', title:'Training on Paired Strings', icon:'\u2016', desc:'Teacher forcing on the left, self-feeding on the right, and one injected error to tell them apart.', tags:['teacher forcing','exposure bias']},
  {id:'rnattn',  num:'13.8',   title:'Letting the Decoder Look Anywhere in the Source', icon:'\u25CE', desc:'The bottleneck squeezed until it fails, then attention derived in four steps.', tags:['attention','soft alignment']},
  {id:'rnmap',   num:'13.9',   title:'The Chapter in One Map', icon:'\u25C9', desc:'Problem, fix, new problem, new fix: the chain from recurrence to attention.', tags:['recap','map']}
];

function buildRNOverview(){
  const cards = RN_SEC.map(s=>`
    <div class="sc-card" onclick="openRNSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Memory Across Time</div>
    <h1 class="lesson-h1">RNNs and LSTMs</h1>
    <p class="lesson-intro">An RNN carries a hidden state from one step to the next, allowing earlier inputs to influence later predictions. We will build the recurrence, study how gradients behave over long sequences, then introduce LSTM gates and attention.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">An RNN maintains a hidden state updated at every step from the current input and the previous state, with the same three weight matrices reused at every position, so one network handles sequences of any length.</div>
        <div class="ch-sum-item">The forward pass is inherently sequential because each state depends on the previous one, and training unrolls the network through time so the error at each state arrives from two directions: the output above and the future to the right.</div>
        <div class="ch-sum-item">As a language model the recurrent state carries information from the entire prefix, removing the fixed context window of n-gram and feedforward models, and it trains on raw text because the next word is its own label.</div>
        <div class="ch-sum-item">One architecture serves four tasks by rewiring the outputs: read every state for labeling, only the last for classification, feed each output back for generation, and chain two networks for translation.</div>
        <div class="ch-sum-item">Gradients shrink multiplicatively with distance, so simple RNNs cannot learn long-distance dependencies. The LSTM routes a separate cell state through additive updates controlled by learned gates, which keeps the gradient path open.</div>
        <div class="ch-sum-item">The encoder-decoder compresses the source into a single context vector, which becomes a bottleneck on long inputs. Attention replaces it with a fresh weighted average of all encoder states at every decoder step.</div>
      </div>
    </div>`;
}

const RN_PAGES = {};

/* ══ 13.1 A NETWORK THAT REMEMBERS ════════════════════════ */
RN_PAGES.rnloop = `
<div class="lesson-chapter-label">Section 13.1</div>
<h1 class="lesson-h1">A Network That Remembers Where It Has Been</h1>
<p class="lesson-intro">Add a connection from the previous hidden state to the current computation. The network now has memory: its output depends on the current input and a learned summary of earlier inputs.</p>

<h2 class="lesson-h2">The Recurrence, in Two Equations</h2>
<p class="lesson-p">At each timestep \\(t\\) the network receives an input vector \\(\\mathbf{x}_t\\) and computes a new hidden state from two ingredients: the current input, and its own hidden state from the previous step. An output is then read off the hidden state:</p>
<div class="lesson-math">\\[\\mathbf{h}_t = g\\left(\\mathbf{U}\\,\\mathbf{h}_{t-1} + \\mathbf{W}\\,\\mathbf{x}_t\\right), \\qquad \\mathbf{y}_t = f\\left(\\mathbf{V}\\,\\mathbf{h}_t\\right)\\]</div>
<p class="lesson-p">Three matrices, three jobs. \\(\\mathbf{W} \\in \\mathbb{R}^{d_h \\times d_{in}}\\) reads the current input. \\(\\mathbf{U} \\in \\mathbb{R}^{d_h \\times d_h}\\) carries the past forward: it decides what of the previous state survives into the present. \\(\\mathbf{V} \\in \\mathbb{R}^{d_{out} \\times d_h}\\) turns the state into an output. The nonlinearity \\(g\\) is typically tanh, and \\(f\\) depends on the task.</p>
<p class="lesson-p">The important fact is what is <em>not</em> indexed by \\(t\\): the matrices. The same \\(\\mathbf{U}\\), \\(\\mathbf{W}\\), \\(\\mathbf{V}\\) are applied at every step. The network does not have one set of weights for position 3 and another for position 7; it has one rule for &ldquo;how to update memory given new evidence,&rdquo; applied over and over. This is what lets a fixed number of parameters handle a sentence of any length, and it is the recurrent analogue of a convolution sharing its filter across an image.</p>

<h2 class="lesson-h2">The Loop, Unrolled</h2>
<p class="lesson-p">There are two equivalent ways to draw this network, and moving between them is the key skill of the chapter. Drawn compactly, the hidden layer has a loop into itself. Unrolled, the loop becomes a chain: one copy of the network per timestep, with the hidden state passed left to right, and every copy sharing the same weights. Drag the slider and watch one picture become the other.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Loop Unfolder</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">unroll</span>
      <input id="ruf-t" type="range" min="1" max="4" step="1" value="1" oninput="rufDraw()" style="width:190px;accent-color:var(--accent)">
      <span id="ruf-l" style="${MTLBL}"></span>
    </div>
    <canvas id="ruf-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="ruf-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The unrolled picture is not a metaphor; it is literally the computation graph that training will differentiate. A sentence of ten words produces an unrolled graph ten copies deep, and gradient descent treats it as one large feedforward network with a weight-sharing constraint. Everything difficult about recurrent networks, and everything the LSTM later fixes, is visible in that chain.</p>

<div class="quiz-block" id="qrn-loop"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">The matrices U, W, V carry no time index. What does that imply?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-loop','Correct. The same weights are applied at every position, so one fixed set of parameters processes sequences of any length.')">The same weights are reused at every timestep, so sequence length is unbounded</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-loop','The state h changes at every step; it is the weights that stay fixed.')">The hidden state is the same at every timestep</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-loop','Weights change during training; what they do not change across is position within a sequence.')">The weights never change, even during training</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-loop','Sequence length is limited by memory and gradient behaviour, not by the parameter count, precisely because weights are shared.')">Longer sequences require more parameters</button>
</div><div class="quiz-explain" id="qrn-loop-explain"></div></div>`;

/* ── Loop Unfolder ────────────────────────────────────────── */
function rufDraw(){
  const k = +(document.getElementById('ruf-t')||{value:1}).value;
  mtSet('ruf-l', k===1 ? 'compact (loop)' : k + ' timesteps');
  const c = mtCtx('ruf-canvas', 260); if(!c) return;
  const {x, w} = c;
  const cw = 88, chh = 46;
  const colU = MTC.a2, colW = MTC.a1, colV = MTC.a5;
  const cell = (px, py, sub)=>{
    mtChip(x, px, py, cw, chh, MTC.surf, MTC.line2, null);
    mtTxt(x, 'h' + (sub!==undefined ? sub : ''), px+cw/2, py+chh/2, {size:13, col:MTC.text, align:'center', weight:'700'});
  };
  const arrow = (x1,y1,x2,y2,col,lab)=>{
    x.strokeStyle = col; x.lineWidth = 2;
    x.beginPath(); x.moveTo(x1,y1); x.lineTo(x2,y2); x.stroke();
    const a = Math.atan2(y2-y1, x2-x1);
    x.beginPath(); x.moveTo(x2,y2);
    x.lineTo(x2-8*Math.cos(a-0.4), y2-8*Math.sin(a-0.4));
    x.lineTo(x2-8*Math.cos(a+0.4), y2-8*Math.sin(a+0.4));
    x.closePath(); x.fillStyle = col; x.fill();
    if(lab) mtTxt(x, lab, (x1+x2)/2 + 10, (y1+y2)/2, {size:10, col:col, weight:'700'});
  };
  if(k === 1){
    const px = w/2 - cw/2, py = 106;
    // self loop
    x.strokeStyle = colU; x.lineWidth = 2.2;
    x.beginPath(); x.arc(px+cw/2, py-16, 30, 0.25*Math.PI, 0.78*Math.PI, true); x.stroke();
    const ex = px+cw/2 - 30*Math.cos(0.78*Math.PI+Math.PI), ey = py-16 - 30*Math.sin(0.78*Math.PI+Math.PI);
    mtTxt(x, 'U', px+cw/2, py-58, {size:12, col:colU, align:'center', weight:'700'});
    x.beginPath(); x.arc(px+cw/2+21, py-38, 3.4, 0, 7); x.fillStyle=colU; x.fill();
    cell(px, py, 't');
    arrow(px+cw/2, py+108, px+cw/2, py+chh+4, colW, '');
    mtTxt(x, 'W', px+cw/2+12, py+chh+30, {size:11, col:colW, weight:'700'});
    mtChip(x, px+6, py+114, cw-12, 26, 'rgba(79,70,229,0.10)', MTC.line, 'x\u209C', MTC.text, 11);
    arrow(px+cw/2, py-2, px+cw/2, py-2, colV);
    arrow(px+cw/2, py, px+cw/2, py-0.01, colV);
    // output arrow up
    x.strokeStyle = colV; x.lineWidth = 2;
    x.beginPath(); x.moveTo(px+cw+2, py+chh/2); x.lineTo(px+cw+42, py+chh/2); x.stroke();
    x.beginPath(); x.moveTo(px+cw+42, py+chh/2); x.lineTo(px+cw+34, py+chh/2-5); x.lineTo(px+cw+34, py+chh/2+5); x.closePath(); x.fillStyle=colV; x.fill();
    mtChip(x, px+cw+46, py+10, 52, 26, 'rgba(165,104,14,0.12)', MTC.line, 'y\u209C', MTC.text, 11);
    mtTxt(x, 'V', px+cw+20, py+chh/2-12, {size:11, col:colV, weight:'700'});
    mtSet('ruf-cap', 'The compact drawing. The arc labelled <b style="color:var(--accent2)">U</b> is the entire innovation: the hidden layer feeds itself. Drag the slider to unroll it.');
  } else {
    const gap = Math.min(150, (w-60)/k);
    const startX = (w - gap*(k-1) - cw)/2;
    const py = 96;
    for(let i=0;i<k;i++){
      const px = startX + i*gap;
      if(i>0) arrow(px-gap+cw+2, py+chh/2, px-2, py+chh/2, colU, 'U');
      cell(px, py, '\u2081\u2082\u2083\u2084'[i]);
      // input
      x.strokeStyle = colW; x.lineWidth = 2;
      x.beginPath(); x.moveTo(px+cw/2, py+96); x.lineTo(px+cw/2, py+chh+4); x.stroke();
      x.beginPath(); x.moveTo(px+cw/2, py+chh+4); x.lineTo(px+cw/2-5, py+chh+12); x.lineTo(px+cw/2+5, py+chh+12); x.closePath(); x.fillStyle=colW; x.fill();
      mtChip(x, px+8, py+100, cw-16, 24, 'rgba(79,70,229,0.10)', MTC.line, 'x' + '\u2081\u2082\u2083\u2084'[i], MTC.text, 10);
      // output
      x.strokeStyle = colV;
      x.beginPath(); x.moveTo(px+cw/2, py-4); x.lineTo(px+cw/2, py-30); x.stroke();
      x.beginPath(); x.moveTo(px+cw/2, py-32); x.lineTo(px+cw/2-5, py-24); x.lineTo(px+cw/2+5, py-24); x.closePath(); x.fillStyle=colV; x.fill();
      mtChip(x, px+8, py-60, cw-16, 24, 'rgba(165,104,14,0.12)', MTC.line, 'y' + '\u2081\u2082\u2083\u2084'[i], MTC.text, 10);
    }
    // shared-weight bracket
    x.strokeStyle = MTC.line2; x.lineWidth = 1; x.setLineDash([4,4]);
    x.beginPath(); x.moveTo(startX, py+150); x.lineTo(startX + gap*(k-1) + cw, py+150); x.stroke(); x.setLineDash([]);
    mtTxt(x, 'one shared U, W, V across all ' + k + ' copies', w/2, py+164, {size:9.5, col:MTC.muted, align:'center'});
    mtSet('ruf-cap', 'The unrolled view: one copy of the cell per timestep, the state handed left to right along the <b style="color:var(--accent2)">U</b> arrows. The copies are not different networks; every <b style="color:var(--accent2)">U</b>, <b style="color:var(--accent)">W</b> and <b style="color:#B45309">V</b> here is the same matrix drawn ' + k + ' times. This chain is the actual computation graph that training differentiates.');
  }
}

/* ══ 13.1.1 FORWARD PASS ══════════════════════════════════ */
RN_PAGES.rnfwd = `
<div class="lesson-chapter-label">Section 13.1.1</div>
<h1 class="lesson-h1">Running a Sequence Forward, One Step at a Time</h1>
<p class="lesson-intro">A standard RNN computes each hidden state from the previous one, so timesteps in a sequence must be processed in order. Batches and operations within a step can still run in parallel. Trace the recurrence below.</p>

<h2 class="lesson-h2">The Algorithm</h2>
<p class="lesson-p">Initialize the state to zeros, then march left to right. At every position, combine the previous state with the current input, squash, and optionally read off an output:</p>
<div style="background:var(--panel);border-radius:10px;padding:1rem 1.2rem;font-family:var(--mono);font-size:.76rem;line-height:2.1;color:#ECF1FF;margin:1.4rem 0">
<span style="color:#93A2CC">function</span> ForwardRNN(x, network):<br>
&nbsp;&nbsp;h\u2080 \u2190 <span style="color:#A9D6FF">0</span><br>
&nbsp;&nbsp;<span style="color:#93A2CC">for</span> t \u2190 1 <span style="color:#93A2CC">to</span> n <span style="color:#93A2CC">do</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;h\u209C \u2190 g(U h\u209C\u208B\u2081 + W x\u209C)<br>
&nbsp;&nbsp;&nbsp;&nbsp;y\u209C \u2190 softmax(V h\u209C)<br>
&nbsp;&nbsp;<span style="color:#93A2CC">return</span> y</div>
<p class="lesson-p">Each iteration is cheap: two matrix-vector products, an addition, a nonlinearity. What is expensive is the dependency structure. The value of \\(\\mathbf{h}_3\\) is an input to \\(\\mathbf{h}_4\\), so \\(\\mathbf{h}_4\\) cannot begin until \\(\\mathbf{h}_3\\) is finished, and so on down the chain. A GPU with ten thousand idle cores still has to compute a fifty-word sentence in fifty strictly ordered steps.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Sequential Ratchet</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="rsqStep()">next step</button>
      <button style="${MTBTN}" onclick="rsqReset()">reset</button>
      <button style="${MTBTN}" id="rsq-par" onclick="rsqPar()">try to compute all at once</button>
    </div>
    <canvas id="rsq-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rsq-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Contrast this with a feedforward network over a window, where every window position is independent and the whole batch can run at once, or with the transformer of a later chapter, where all positions attend to each other in a single parallel operation. The RNN&rsquo;s memory is exactly what serializes it: state must be carried, and carrying takes an ordered walk. This trade, memory for parallelism, is the central tension the rest of the book keeps returning to.</p>

<div class="quiz-block" id="qrn-fwd"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can the forward pass of an RNN not be parallelized across timesteps?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-fwd','Correct. Each state is an input to the next, so the computation is a chain of strict dependencies regardless of available hardware.')">Each state depends on the previous state, forming a strict dependency chain</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-fwd','The per-step cost is small; the problem is ordering, not size.')">The matrix multiplications are too large to fit on one device</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-fwd','Weight sharing is orthogonal to parallelism; convolutions share weights and parallelize fine.')">Because the weights are shared across timesteps</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-fwd','The softmax is applied per step and is not the bottleneck; the recurrence is.')">The softmax must normalize over the whole sequence</button>
</div><div class="quiz-explain" id="qrn-fwd-explain"></div></div>`;

/* ── Sequential Ratchet ───────────────────────────────────── */
const RSQ_TOKS = ['the','flights','were','late'];
let _rsq = {stage:0, par:false};   // stage counts micro-steps: 3 per token
function rsqBuild(){ _rsq = {stage:0, par:false}; rsqDraw(); }
function rsqStep(){ _rsq.par = false; _rsq.stage = Math.min(RSQ_TOKS.length*3, _rsq.stage+1); rsqDraw(); }
function rsqReset(){ _rsq = {stage:0, par:false}; rsqDraw(); }
function rsqPar(){ _rsq.par = !_rsq.par; rsqDraw(); }
function rsqDraw(){
  const p = document.getElementById('rsq-par');
  if(p){ p.style.background = _rsq.par?'var(--accent2)':'var(--surface2)'; p.style.color = _rsq.par?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('rsq-canvas', 250); if(!c) return;
  const {x, w} = c;
  const n = RSQ_TOKS.length;
  const gap = Math.min(150, (w-40)/n), cw = Math.min(96, gap-16);
  const startX = (w - gap*(n-1) - cw)/2, hy = 96;
  const tok = Math.floor(_rsq.stage/3), micro = _rsq.stage%3;
  for(let i=0;i<n;i++){
    const px = startX + i*gap;
    const doneH = i < tok || (i===tok && micro>=1);
    const doneY = i < tok || (i===tok && micro>=2);
    const activeX = i===tok && micro===0 && _rsq.stage < n*3;
    const activeH = i===tok && micro===1;
    const activeY = i===tok && micro===2;
    // input
    mtChip(x, px+6, hy+92, cw-12, 26,
      activeX ? 'rgba(165,104,14,0.22)' : 'rgba(79,70,229,0.10)',
      activeX ? MTC.a5 : MTC.line, RSQ_TOKS[i], MTC.text, 10);
    x.strokeStyle = (doneH||activeH) ? MTC.a1 : MTC.line; x.lineWidth = (activeH)?2.4:1.6;
    x.beginPath(); x.moveTo(px+cw/2, hy+88); x.lineTo(px+cw/2, hy+52); x.stroke();
    // h cell
    mtChip(x, px, hy, cw, 46,
      activeH ? 'rgba(165,104,14,0.20)' : (doneH ? 'rgba(79,70,229,0.13)' : 'rgba(23,27,52,0.03)'),
      activeH ? MTC.a5 : (doneH ? MTC.a1 : MTC.line), null);
    mtTxt(x, 'h'+'\u2081\u2082\u2083\u2084'[i], px+cw/2, hy+23, {size:12, col: doneH||activeH?MTC.text:MTC.muted, align:'center', weight:'700'});
    // recurrent arrow
    if(i>0){
      const on = (i<=tok && !(i===tok && micro===0)) || (i===tok && micro>=1);
      x.strokeStyle = on ? MTC.a2 : MTC.line; x.lineWidth = on?2.2:1.2;
      x.beginPath(); x.moveTo(px-gap+cw+2, hy+23); x.lineTo(px-3, hy+23); x.stroke();
      x.beginPath(); x.moveTo(px-3, hy+23); x.lineTo(px-11, hy+18); x.lineTo(px-11, hy+28); x.closePath();
      x.fillStyle = on?MTC.a2:MTC.line; x.fill();
    }
    // output
    x.strokeStyle = (doneY||activeY) ? MTC.a5 : MTC.line; x.lineWidth = activeY?2.4:1.6;
    x.beginPath(); x.moveTo(px+cw/2, hy-4); x.lineTo(px+cw/2, hy-30); x.stroke();
    mtChip(x, px+6, hy-58, cw-12, 26,
      activeY ? 'rgba(165,104,14,0.22)' : (doneY ? 'rgba(11,132,87,0.12)' : 'rgba(23,27,52,0.03)'),
      activeY ? MTC.a5 : (doneY ? MTC.a4 : MTC.line), 'y'+'\u2081\u2082\u2083\u2084'[i], doneY||activeY?MTC.text:MTC.muted, 10);
    if(_rsq.par && i>tok){
      mtTxt(x, '\u2298', px+cw/2, hy+23, {size:16, col:MTC.a2, align:'center'});
    }
  }
  mtTxt(x, 'h\u2080 = 0', startX-8, hy+23, {size:9.5, col:MTC.muted, align:'right'});
  const msgs = ['reading x', 'computing h = g(U h\u209B\u209A + W x)', 'reading y = softmax(V h)'];
  mtSet('rsq-cap', _rsq.par
    ? '<b style="color:var(--accent2)">Blocked.</b> To compute h\u2083 right now you need h\u2082, which needs h\u2081, which needs h\u2080. The dependency chain forces one ordered pass no matter how many processors are available. This is the cost of carrying state.'
    : (_rsq.stage >= n*3
      ? 'Sequence complete: ' + n + ' tokens took ' + n + ' strictly ordered iterations. A feedforward window model would have processed all positions simultaneously.'
      : 'Step ' + (tok+1) + ' of ' + n + ' \u00b7 ' + msgs[micro] + '. Each highlight must finish before the next can begin.'));
}

/* ══ 13.1.2 BPTT ══════════════════════════════════════════ */
RN_PAGES.rnbptt = `
<div class="lesson-chapter-label">Section 13.1.2</div>
<h1 class="lesson-h1">Sending the Error Signal Backward Through Time</h1>
<p class="lesson-intro">Backpropagation through time applies ordinary backpropagation to an unrolled recurrent network. The weights are shared across timesteps, so their gradient accumulates contributions from several points in the sequence.</p>

<h2 class="lesson-h2">Two Errors Arrive at Every State</h2>
<p class="lesson-p">In a feedforward network, each hidden layer receives error from exactly one place: the layer above. In the unrolled RNN, the hidden state \\(\\mathbf{h}_t\\) influenced two things during the forward pass, and so during the backward pass it is billed for both. It produced the output \\(\\mathbf{y}_t\\), so error flows down from above. And it fed into \\(\\mathbf{h}_{t+1}\\), so error flows back from the right, carrying the consequences \\(\\mathbf{h}_t\\) had for every later prediction. Writing \\(\\boldsymbol{\\delta}_t\\) for the error at \\(\\mathbf{h}_t\\):</p>
<div class="lesson-math">\\[\\boldsymbol{\\delta}_t = \\underbrace{\\mathbf{V}^{\\top} \\frac{\\partial L_t}{\\partial \\mathbf{y}_t}}_{\\text{from the output above}} \\; + \\; \\underbrace{\\mathbf{U}^{\\top} \\boldsymbol{\\delta}_{t+1} \\odot g'}_{\\text{from the future, to the right}}\\]</div>
<p class="lesson-p">The second term is the interesting one. It means a word&rsquo;s hidden state is corrected not just for the prediction made at that word, but for every downstream prediction it contaminated. And because that term contains \\(\\boldsymbol{\\delta}_{t+1}\\), which contains \\(\\boldsymbol{\\delta}_{t+2}\\), the backward pass is itself a right-to-left recurrence, the mirror image of the forward loop. Two ordered sweeps, one in each direction.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Two-Pass Sweep</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="rbpRun()">run both passes</button>
      <button style="${MTBTN}" id="rbp-tr" onclick="rbpTrunc()">truncation: off</button>
    </div>
    <canvas id="rbp-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rbp-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Truncation</h2>
<p class="lesson-p">Because each weight update requires a full forward and backward sweep over the sequence, memory and time grow with sequence length: every intermediate \\(\\mathbf{h}_t\\) must be cached for the backward pass. For very long sequences the standard compromise is <strong>truncated BPTT</strong>: chop the sequence into fixed-length segments, carry the hidden state forward across the boundary so the model still <em>reads</em> the full history, but stop the gradient at the boundary so the error signal never travels further back than one segment. The model remembers across the cut; it just does not learn across it. Toggle truncation above to see where the red arrows stop.</p>

<div class="quiz-block" id="qrn-bptt"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">During BPTT, why does the error at h\u209C have two components?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-bptt','Correct. The state fed both the output at its own step and the next hidden state, so it is responsible for both downstream paths.')">h\u209C influenced both its own output and the next hidden state during the forward pass</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-bptt','There is one loss function; the two components are two paths through the graph, not two objectives.')">Because the network has two loss functions</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-bptt','The forward pass runs once; the two components arrive during a single backward sweep.')">Because the forward pass is run twice</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-bptt','U and W both receive gradient, but that is true of any layer; the two components at h come from output and future.')">Because U and W are different matrices</button>
</div><div class="quiz-explain" id="qrn-bptt-explain"></div></div>`;

/* ── Two-Pass Sweep ───────────────────────────────────────── */
let _rbp = {t:0, trunc:false, raf:null};
function rbpBuild(){ _rbp = {t:0, trunc:false, raf:null}; rbpDraw(); }
function rbpTrunc(){ _rbp.trunc = !_rbp.trunc; rbpDraw(); }
function rbpRun(){
  if(_rbp.raf) cancelAnimationFrame(_rbp.raf);
  const t0 = Date.now();
  const step = ()=>{ _rbp.t = Math.min(2, (Date.now()-t0)/1600); rbpDraw();
    if(_rbp.t < 2) _rbp.raf = requestAnimationFrame(step); };
  step();
}
function rbpDraw(){
  const b = document.getElementById('rbp-tr');
  if(b){ b.textContent = 'truncation: ' + (_rbp.trunc?'on (segments of 3)':'off');
         b.style.background = _rbp.trunc?'var(--accent)':'var(--surface2)'; b.style.color = _rbp.trunc?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('rbp-canvas', 240); if(!c) return;
  const {x, w} = c;
  const n = 6, gap = Math.min(104, (w-40)/n), cw = Math.min(70, gap-12);
  const startX = (w - gap*(n-1) - cw)/2, hy = 100;
  const fwd = Math.min(1, _rbp.t);          // 0..1 forward progress
  const bwd = Math.max(0, _rbp.t - 1);      // 0..1 backward progress
  for(let i=0;i<n;i++){
    const px = startX + i*gap;
    const fOn = fwd*n >= i+0.5;
    const bOn = bwd*n >= (n-i)-0.5;
    mtChip(x, px, hy, cw, 42, fOn?'rgba(79,70,229,0.13)':'rgba(23,27,52,0.03)',
           bOn?MTC.a2:(fOn?MTC.a1:MTC.line), null);
    mtTxt(x, 'h'+String(i+1), px+cw/2, hy+21, {size:11.5, col:fOn?MTC.text:MTC.muted, align:'center', weight:'700'});
    mtChip(x, px+4, hy+80, cw-8, 22, 'rgba(79,70,229,0.08)', MTC.line, 'x'+(i+1), MTC.muted, 9);
    mtChip(x, px+4, hy-58, cw-8, 22, fOn?'rgba(11,132,87,0.10)':'rgba(23,27,52,0.03)', MTC.line, 'y'+(i+1), MTC.muted, 9);
    // forward arrows
    if(i>0 && fwd*n >= i+0.2){
      x.strokeStyle = MTC.a1; x.lineWidth = 2;
      x.beginPath(); x.moveTo(px-gap+cw+2, hy+14); x.lineTo(px-3, hy+14); x.stroke();
      x.beginPath(); x.moveTo(px-3, hy+14); x.lineTo(px-10, hy+10); x.lineTo(px-10, hy+18); x.closePath(); x.fillStyle=MTC.a1; x.fill();
    }
    // backward arrows
    if(bOn){
      // from output above
      x.strokeStyle = MTC.a2; x.lineWidth = 1.8;
      x.beginPath(); x.moveTo(px+cw/2+9, hy-34); x.lineTo(px+cw/2+9, hy-4); x.stroke();
      x.beginPath(); x.moveTo(px+cw/2+9, hy-4); x.lineTo(px+cw/2+5, hy-11); x.lineTo(px+cw/2+13, hy-11); x.closePath(); x.fillStyle=MTC.a2; x.fill();
      // from the right (future)
      const cut = _rbp.trunc && ((i+1) % 3 === 0);
      if(i<n-1 && !cut){
        x.strokeStyle = MTC.a2; x.lineWidth = 1.8;
        x.beginPath(); x.moveTo(px+gap-3, hy+30); x.lineTo(px+cw+2, hy+30); x.stroke();
        x.beginPath(); x.moveTo(px+cw+2, hy+30); x.lineTo(px+cw+9, hy+26); x.lineTo(px+cw+9, hy+34); x.closePath(); x.fillStyle=MTC.a2; x.fill();
      }
      if(i<n-1 && cut){
        x.strokeStyle = MTC.a2; x.lineWidth = 2; x.setLineDash([2,3]);
        x.beginPath(); x.moveTo(px+cw+12, hy+22); x.lineTo(px+cw+12, hy+38); x.stroke(); x.setLineDash([]);
        mtTxt(x, 'stop', px+cw+12, hy+48, {size:8, col:MTC.a2, align:'center'});
      }
    }
    if(_rbp.trunc && (i % 3 === 0) && i>0){
      x.strokeStyle = MTC.line2; x.lineWidth = 1; x.setLineDash([5,4]);
      x.beginPath(); x.moveTo(px-gap/2+cw/2, hy-70); x.lineTo(px-gap/2+cw/2, hy+110); x.stroke(); x.setLineDash([]);
    }
  }
  mtTxt(x, 'FORWARD \u2192 compute and cache', startX, 24, {size:9.5, col:MTC.a1});
  mtTxt(x, '\u2190 BACKWARD  two arrows at every state', w-8, 24, {size:9.5, col:MTC.a2, align:'right'});
  mtSet('rbp-cap', bwd >= 1
    ? (_rbp.trunc
      ? 'With truncation, the hidden state still crosses the dashed boundary during the forward pass, so the model reads the full history. The gradient does not: the red flow stops at each segment edge, so nothing before the boundary is ever corrected for errors after it.'
      : 'Both passes complete. Note the two red arrivals at every interior state: one from its own prediction, one from the future it influenced. The backward pass is a right-to-left recurrence, mirroring the forward one.')
    : (fwd > 0 ? 'Forward pass running left to right, caching every h\u209C for later.' : 'Press run to watch the forward pass, then the backward pass with its two error sources.'));
}

/* ══ 13.2 RNN AS LANGUAGE MODEL ═══════════════════════════ */
RN_PAGES.rnlm = `
<div class="lesson-chapter-label">Section 13.2</div>
<h1 class="lesson-h1">Predicting the Next Word Without a Window</h1>
<p class="lesson-intro">A language model assigns a probability to a sequence of words by predicting each word from the ones before it:</p>
<div class="lesson-math">\\[P(w_{1:n}) = \\prod_{i=1}^{n} P\\left(w_i \\mid w_{&lt;i}\\right)\\]</div>
<p class="lesson-intro">The chain-rule factorization is exact. What varies is the model used to estimate \\(P(w_i\\mid w_{<i})\\). N-gram and fixed-window feedforward models truncate the context; an RNN carries a recurrent summary of the prefix. A causal transformer, introduced earlier, accesses a prefix through attention.</p>

<h2 class="lesson-h2">Three Models, Three Horizons</h2>
<p class="lesson-p">An <strong>n-gram model</strong> conditions on exactly \\(n-1\\) previous words, a hard cutoff: a trigram model looking at word 40 sees words 38 and 39 and literally nothing else. The <strong>feedforward language model</strong> softened the statistics with embeddings but kept the window: a fixed number of previous embeddings are concatenated and fed to the network, and the window slides. The word just outside it might as well not exist.</p>
<p class="lesson-p">The <strong>recurrent language model</strong> has no window because it does not condition on words directly. It conditions on the hidden state, and the hidden state is a function of the previous state, which is a function of the one before it, all the way back to \\(\\mathbf{h}_0\\). Formally, every word in the prefix has a path into the current prediction. Nothing was discarded by design; the model&rsquo;s memory is a learned compression of the entire history rather than a truncation of it.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Context Horizon</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">predicting word at position</span>
      <input id="rch-p" type="range" min="4" max="13" step="1" value="8" oninput="rchDraw()" style="width:190px;accent-color:var(--accent)">
    </div>
    <canvas id="rch-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rch-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The honest caveat, and the reason this chapter does not end here: &ldquo;every word has a path into the prediction&rdquo; is a statement about connectivity, not about signal strength. The shading in the RNN row fades with distance for a reason that Section 13.5 will measure precisely, and the fading is the flaw the LSTM exists to repair. In principle unbounded; in practice, leaky.</p>

<div class="quiz-block" id="qrn-lm"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">How does a recurrent language model gain access to words outside any fixed window?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-lm','Correct. The prediction conditions on the hidden state, and the hidden state is built recursively from the entire prefix.')">It conditions on a hidden state that recursively summarizes the whole prefix</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-lm','The RNN never concatenates the history; that would grow without bound. It compresses it into a fixed-size state.')">It concatenates all previous word embeddings into one long input</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-lm','The window is not enlarged; it is eliminated. No position is excluded by design.')">It uses a much larger window than the feedforward model</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-lm','Storing counts for all prefixes is the n-gram approach and is exactly what fails at scale.')">It stores a probability table for every possible prefix</button>
</div><div class="quiz-explain" id="qrn-lm-explain"></div></div>`;

/* ── Context Horizon ──────────────────────────────────────── */
const RCH_TXT = ['the','pilot','who','had','flown','the','morning','route','through','heavy','fog','finally','landed','safely'];
function rchDraw(){
  const p = Math.max(4, Math.min(13, Math.round(+(document.getElementById('rch-p')||{value:8}).value)));
  const c = mtCtx('rch-canvas', 240); if(!c) return;
  const {x, w} = c;
  const n = RCH_TXT.length;
  const cw = (w-16)/n;
  const rows = [
    {lab:'TRIGRAM \u00b7 hard window of 2', y:36,  f:i=> (i>=p-2 && i<p) ? 1 : 0},
    {lab:'FEEDFORWARD \u00b7 window of 5',  y:104, f:i=> (i>=p-5 && i<p) ? 1 : 0},
    {lab:'RNN \u00b7 no window',            y:172, f:i=> i<p ? Math.pow(0.82, p-1-i)*0.92+0.08 : 0}
  ];
  rows.forEach(r=>{
    mtTxt(x, r.lab, 8, r.y-10, {size:9.5, col:MTC.muted});
    RCH_TXT.forEach((tkn, i)=>{
      const v = r.f(i), tx2 = 8+i*cw;
      const target = i===p;
      let fill = 'rgba(23,27,52,0.035)';
      if(target) fill = 'rgba(165,104,14,0.25)';
      else if(v>0) fill = 'rgba(79,70,229,'+(0.08+0.5*v).toFixed(3)+')';
      mtRR(x, tx2, r.y, cw-3, 30, 4); x.fillStyle = fill; x.fill();
      if(target){ x.strokeStyle = MTC.a5; x.lineWidth = 1.5; x.stroke(); }
      x.save(); x.translate(tx2+(cw-3)/2, r.y+15);
      x.font = '8.5px ' + MTC.mono; x.fillStyle = (v>0.55||target) ? '#FAFBFF' : MTC.muted;
      x.textAlign='center'; x.textBaseline='middle';
      x.fillText(tkn.length>7?tkn.slice(0,6)+'\u2026':tkn, 0, 0); x.restore();
    });
  });
  const outside3 = Math.max(0, p-2), outside5 = Math.max(0, p-5);
  mtSet('rch-cap', `Predicting <b>${RCH_TXT[p]||'?'}</b>. The trigram model has discarded ${outside3} of ${p} context words; the feedforward model ${outside5}. The RNN row shades every prefix word because every one has a path into the state, but notice the fade: connectivity is not the same as signal strength, and Section 13.5 measures exactly how fast that shading decays.`);
}

/* ══ 13.2.1 FORWARD INFERENCE ═════════════════════════════ */
RN_PAGES.rninf = `
<div class="lesson-chapter-label">Section 13.2.1</div>
<h1 class="lesson-h1">Forward Inference in a Recurrent Language Model</h1>
<p class="lesson-intro">The best way to be sure you understand an architecture is to track the shape of every tensor through it. This section does that for one timestep of a recurrent language model, with the intermediate shapes shown.</p>

<h2 class="lesson-h2">The Four Steps</h2>
<p class="lesson-p">The input word arrives as a one-hot vector \\(\\mathbf{x}_t\\) of length \\(|V|\\): all zeros except a single 1 at the word&rsquo;s index. Multiplying the embedding matrix by a one-hot vector simply selects a column, so the first step is a lookup wearing a matrix costume:</p>
<div class="lesson-math">\\[\\mathbf{e}_t = \\mathbf{E}\\,\\mathbf{x}_t\\]</div>
<p class="lesson-p">The recurrence then folds this embedding into the running state, and the output layer expands the state back to vocabulary size, where a softmax turns scores into a distribution:</p>
<div class="lesson-math">\\[\\mathbf{h}_t = g\\left(\\mathbf{U}\\,\\mathbf{h}_{t-1} + \\mathbf{W}\\,\\mathbf{e}_t\\right), \\qquad \\hat{\\mathbf{y}}_t = \\text{softmax}\\left(\\mathbf{V}\\,\\mathbf{h}_t\\right)\\]</div>
<p class="lesson-p">The entry of that distribution at index \\(k\\) is the model&rsquo;s probability that the next word is word \\(k\\):</p>
<div class="lesson-math">\\[P\\left(w_{t+1} = k \\mid w_1, \\ldots, w_t\\right) = \\hat{\\mathbf{y}}_t[k]\\]</div>
<p class="lesson-p">and the probability of an entire sequence is the product of these lookups, one per position, which is the chain-rule factorization made concrete:</p>
<div class="lesson-math">\\[P(w_{1:n}) = \\prod_{i=1}^{n} P\\left(w_i \\mid w_{1:i-1}\\right) = \\prod_{i=1}^{n} \\hat{\\mathbf{y}}_i[w_i]\\]</div>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Shape Tracker</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">|V|</span>
      <input id="rsh-v" type="range" min="10000" max="50000" step="5000" value="30000" oninput="rshDraw()" style="width:130px;accent-color:var(--accent)">
      <span style="${MTLBL}">d</span>
      <input id="rsh-d" type="range" min="64" max="512" step="64" value="256" oninput="rshDraw()" style="width:130px;accent-color:var(--accent)">
      <span id="rsh-l" style="${MTLBL}"></span>
    </div>
    <canvas id="rsh-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rsh-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Move the sliders and watch where the parameters live. The two recurrent matrices cost \\(2d^2\\) between them, but the two vocabulary-facing matrices cost \\(2\\,d\\,|V|\\), and since \\(|V|\\) is typically a hundred times larger than \\(d\\), the vocabulary interfaces dominate the budget completely. That observation is the setup for the next section, which cuts the bill nearly in half with one transpose.</p>

<div class="quiz-block" id="qrn-inf"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is multiplying E by a one-hot vector equivalent to a lookup?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-inf','Correct. The single 1 selects one column of E and the zeros eliminate every other column, so the product is exactly that column.')">The single 1 selects one column of E; the zeros wipe out all the others</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-inf','No approximation is involved; the product is exactly the selected column.')">Because the multiplication approximates the lookup with small error</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-inf','E is dense; it is the input vector that is sparse.')">Because E is a sparse matrix</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-inf','The softmax is at the output end; the embedding lookup happens before any normalization.')">Because the softmax normalizes the result</button>
</div><div class="quiz-explain" id="qrn-inf-explain"></div></div>`;

/* ── Shape Tracker ────────────────────────────────────────── */
function rshDraw(){
  const V = +(document.getElementById('rsh-v')||{value:30000}).value;
  const d = +(document.getElementById('rsh-d')||{value:256}).value;
  const pE = d*V, pW = d*d, pU = d*d, pV = V*d;
  const tot = pE+pW+pU+pV;
  mtSet('rsh-l', (tot/1e6).toFixed(1) + 'M parameters');
  const c = mtCtx('rsh-canvas', 246); if(!c) return;
  const {x, w} = c;
  const stages = [
    {lab:'x\u209C', dim:'['+V.toLocaleString()+' \u00d7 1]', sub:'one-hot', col:MTC.muted},
    {lab:'e\u209C = E x\u209C', dim:'['+d+' \u00d7 1]', sub:'embedding', col:MTC.a1},
    {lab:'h\u209C', dim:'['+d+' \u00d7 1]', sub:'g(U h + W e)', col:MTC.a1},
    {lab:'V h\u209C', dim:'['+V.toLocaleString()+' \u00d7 1]', sub:'scores', col:MTC.a5},
    {lab:'\u0177\u209C', dim:'['+V.toLocaleString()+' \u00d7 1]', sub:'softmax', col:MTC.a4}
  ];
  const bw = Math.min(118, (w-40)/stages.length - 8);
  stages.forEach((s, i)=>{
    const px = 14 + i*((w-28)/stages.length);
    const tall = s.dim.includes(V.toLocaleString());
    const bh = tall ? 84 : 44;
    const py = 118 - bh/2;
    mtChip(x, px, py, bw, bh, s.col==='#526080'?'rgba(23,27,52,0.05)':s.col+'1C', s.col, null);
    mtTxt(x, s.lab, px+bw/2, py+bh/2-8, {size:11, col:MTC.text, align:'center', weight:'700'});
    mtTxt(x, s.dim, px+bw/2, py+bh/2+8, {size:8.5, col:s.col, align:'center'});
    mtTxt(x, s.sub, px+bw/2, py+bh+14, {size:8.5, col:MTC.muted, align:'center'});
    if(i<stages.length-1){
      x.strokeStyle = MTC.line2; x.lineWidth = 1.6;
      const ax = px+bw+3, bx2 = px + ((w-28)/stages.length) - 4;
      x.beginPath(); x.moveTo(ax, 118); x.lineTo(bx2, 118); x.stroke();
      x.beginPath(); x.moveTo(bx2, 118); x.lineTo(bx2-7, 114); x.lineTo(bx2-7, 122); x.closePath(); x.fillStyle=MTC.line2; x.fill();
    }
  });
  // parameter bars
  const items = [['E  (d\u00d7|V|)', pE, MTC.a1], ['W  (d\u00d7d)', pW, MTC.a4], ['U  (d\u00d7d)', pU, MTC.a4], ['V  (|V|\u00d7d)', pV, MTC.a5]];
  const L = 106, PW = w-L-84, by = 196;
  items.forEach(([lab, v, col], i)=>{
    const y = by + i*13 - 13;
    mtTxt(x, lab, L-8, y+5, {size:8, col:MTC.muted, align:'right'});
    mtRR(x, L, y, Math.max(2, PW*(v/tot)), 9, 3); x.fillStyle = col+'CC'; x.fill();
    mtTxt(x, (v/1e6).toFixed(1)+'M', L+PW*(v/tot)+6, y+5, {size:8, col:MTC.text});
  });
  mtSet('rsh-cap', `The vector expands from ${V.toLocaleString()} down to ${d}, is carried at ${d}, and expands back to ${V.toLocaleString()}. The two vocabulary interfaces, E and V, hold ${(100*(pE+pV)/tot).toFixed(0)}% of all parameters; the recurrence itself is comparatively tiny.`);
}

/* ══ 13.2.2 SELF-SUPERVISED TRAINING ══════════════════════ */
RN_PAGES.rntrain = `
<div class="lesson-chapter-label">Section 13.2.2</div>
<h1 class="lesson-h1">Learning From Raw Text With No Labels</h1>
<p class="lesson-intro">For next-word prediction, the next word in the text supplies the target. Shifting a token sequence by one position creates input-target pairs without manual labels. This is self-supervised learning; collecting and preparing suitable text still matters.</p>

<h2 class="lesson-h2">The Loss, Derived From First Principles</h2>
<p class="lesson-p">Cross-entropy measures the distance between the distribution the model predicted, \\(\\hat{\\mathbf{y}}_t\\), and the true distribution \\(\\mathbf{y}_t\\), summing over the whole vocabulary:</p>
<div class="lesson-math">\\[L_{CE}\\left(\\hat{\\mathbf{y}}_t, \\mathbf{y}_t\\right) = -\\sum_{w \\in V} \\mathbf{y}_t[w] \\, \\log \\hat{\\mathbf{y}}_t[w]\\]</div>
<p class="lesson-p">Now use what we know about the true distribution. The correct next word is a specific word \\(w_{t+1}\\), so \\(\\mathbf{y}_t\\) is one-hot: it is 1 at \\(w_{t+1}\\) and 0 everywhere else. In the sum, every term with \\(\\mathbf{y}_t[w] = 0\\) vanishes, and the single surviving term has coefficient 1. The entire sum over a fifty-thousand-word vocabulary collapses to one lookup:</p>
<div class="lesson-math">\\[L_{CE}\\left(\\hat{\\mathbf{y}}_t, \\mathbf{y}_t\\right) = -\\log \\hat{\\mathbf{y}}_t\\left[w_{t+1}\\right]\\]</div>
<p class="lesson-p">Read it in words: the loss at each step is how surprised the model was by the word that actually came next. Assign the true word probability 1 and the loss is 0; assign it probability 0.01 and the loss is 4.6. Averaging over a sequence of length \\(T\\) gives the training objective:</p>
<div class="lesson-math">\\[L = \\frac{1}{T} \\sum_{t=1}^{T} -\\log \\hat{\\mathbf{y}}_t\\left[w_{t+1}\\right]\\]</div>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Sliding Answer Key</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="rsaStep()">next position</button>
      <button style="${MTBTN}" onclick="rsaReset()">reset</button>
      <button style="${MTBTN}" id="rsa-tf" onclick="rsaTF()">teacher forcing: on</button>
    </div>
    <canvas id="rsa-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rsa-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Teacher Forcing, Again</h2>
<p class="lesson-p">At each training step there is a choice of what to feed in next: the word the model just predicted, or the word the corpus actually contains. Feeding the true word is <strong>teacher forcing</strong>, and it is standard for the reason the toggle above makes visible. Without it, one early wrong prediction becomes the input to the next step, which conditions the following prediction on garbage, and losses compound down the rest of the sequence. With it, every position is trained against an honest context. The price, a mismatch with generation time when no gold text exists, reappears in Section 13.7.1.</p>

<div class="quiz-block" id="qrn-tr"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does the cross-entropy sum over the vocabulary collapse to a single term?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-tr','Correct. The true distribution is one-hot, so every term except the one at the correct word is multiplied by zero.')">The true distribution is one-hot, so all but one term is multiplied by zero</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-tr','The predicted distribution assigns nonzero probability to many words; it is the true distribution that is one-hot.')">The model assigns zero probability to all wrong words</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-tr','The collapse is exact algebra, not an approximation for speed.')">The other terms are dropped as an approximation to save computation</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-tr','The softmax guarantees a distribution but does not make any term vanish; the one-hot target does that.')">The softmax removes the other terms during normalization</button>
</div><div class="quiz-explain" id="qrn-tr-explain"></div></div>`;

/* ── Sliding Answer Key ───────────────────────────────────── */
const RSA_TOKS = ['&lt;s&gt;','the','keeper','arrived','early'];
const RSA_P    = [0.42, 0.61, 0.33, 0.55];     // prob assigned to gold with TF
const RSA_PBAD = [0.42, 0.61, 0.09, 0.04];     // drift without TF after wrong step 2
let _rsa = {t:0, tf:true};
function rsaBuild(){ _rsa = {t:0, tf:true}; rsaDraw(); }
function rsaStep(){ _rsa.t = Math.min(RSA_P.length, _rsa.t+1); rsaDraw(); }
function rsaReset(){ _rsa.t = 0; rsaDraw(); }
function rsaTF(){ _rsa.tf = !_rsa.tf; rsaDraw(); }
function rsaDraw(){
  const b = document.getElementById('rsa-tf');
  if(b){ b.textContent = 'teacher forcing: ' + (_rsa.tf?'on':'off');
         b.style.background = _rsa.tf?'var(--accent)':'var(--surface2)'; b.style.color = _rsa.tf?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('rsa-canvas', 250); if(!c) return;
  const {x, w} = c;
  const probs = _rsa.tf ? RSA_P : RSA_PBAD;
  const n = RSA_P.length;
  const gap = Math.min(150, (w-30)/n), cw = Math.min(110, gap-14);
  const startX = (w - gap*(n-1) - cw)/2;
  mtTxt(x, 'INPUT', startX-8, 52, {size:9, col:MTC.muted, align:'right'});
  mtTxt(x, 'TARGET (input shifted by one)', startX-8, 96, {size:9, col:MTC.muted, align:'right'});
  let cum = 0;
  for(let i=0;i<n;i++){
    const px = startX + i*gap;
    const shown = i < _rsa.t, active = i === _rsa.t;
    const drift = !_rsa.tf && i>=2;
    const inTok = (drift && i>=3 && shown||drift&&i>=3&&active) ? 'ok ok' : RSA_TOKS[i];
    mtChip(x, px, 38, cw, 28, active?'rgba(165,104,14,0.2)':(shown?'rgba(79,70,229,0.10)':'rgba(23,27,52,0.03)'),
      (drift&&i>=3&&(shown||active))?MTC.a2:(active?MTC.a5:MTC.line),
      inTok.replace('&lt;','<').replace('&gt;','>'), MTC.text, 10);
    mtChip(x, px, 82, cw, 28, 'rgba(11,132,87,0.08)', shown||active?MTC.a4:MTC.line,
      RSA_TOKS[i+1].replace('&lt;','<').replace('&gt;','>'), MTC.text, 10);
    // offset arrow
    x.strokeStyle = MTC.line2; x.lineWidth = 1; x.setLineDash([3,3]);
    x.beginPath(); x.moveTo(px+cw/2, 68); x.lineTo(px+cw/2, 80); x.stroke(); x.setLineDash([]);
    if(shown || active){
      const p = probs[i], loss = -Math.log(p);
      if(shown) cum += loss;
      const bh = Math.min(86, loss*30);
      x.fillStyle = shown ? ((drift&&i>=2)?'rgba(159,18,57,0.7)':'rgba(79,70,229,0.6)') : 'rgba(165,104,14,0.55)';
      mtRR(x, px+cw/2-14, 212-bh, 28, bh, 3); x.fill();
      mtTxt(x, '\u2212log '+p.toFixed(2), px+cw/2, 132, {size:8.5, col:MTC.muted, align:'center'});
      mtTxt(x, '= '+loss.toFixed(2), px+cw/2, 145, {size:9.5, col:(drift&&i>=2)?MTC.a2:MTC.text, align:'center', weight: active?'700':''});
    }
  }
  x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(startX-10, 212); x.lineTo(w-20, 212); x.stroke();
  mtTxt(x, 'per-position loss', startX-8, 226, {size:8.5, col:MTC.muted});
  const total = probs.slice(0, _rsa.t).reduce((a,p)=>a-Math.log(p), 0);
  mtTxt(x, 'L = ' + (_rsa.t? (total/_rsa.t).toFixed(3) : '\u2013') + '  (mean over ' + _rsa.t + ')',
        w-20, 226, {size:10.5, col:MTC.a2, align:'right', weight:'700'});
  mtSet('rsa-cap', _rsa.tf
    ? 'The target row is nothing but the input row shifted one place left: the answer key was inside the text all along. Each bar is the surprise at one gold word.'
    : '<b style="color:var(--accent2)">Teacher forcing off.</b> The model predicted a wrong word at position 3, that word became the next input, and every later prediction is now conditioned on a context that never occurred in the corpus. Watch the loss bars jump.');
}

/* ══ 13.2.3 WEIGHT TYING ══════════════════════════════════ */
RN_PAGES.rntie = `
<div class="lesson-chapter-label">Section 13.2.3</div>
<h1 class="lesson-h1">Using One Embedding Matrix Twice</h1>
<p class="lesson-intro">The embedding and output matrices both connect vocabulary entries with hidden representations, but they are not inverse functions. When their dimensions agree, weight tying shares their parameters, reducing the parameter count and linking the two representations.</p>

<h2 class="lesson-h2">Two Matrices, One Job</h2>
<p class="lesson-p">The embedding matrix \\(\\mathbf{E}\\), shape \\(d \\times |V|\\), stores one column per word: it maps a word identity <em>into</em> the network&rsquo;s vector space. The output matrix \\(\\mathbf{V}\\), shape \\(|V| \\times d\\), stores one row per word: it scores how well the hidden state matches each word, mapping <em>out</em> of the vector space. Column \\(w\\) of \\(\\mathbf{E}\\) says &ldquo;this is what word \\(w\\) looks like as a vector.&rdquo; Row \\(w\\) of \\(\\mathbf{V}\\) says &ldquo;score high when the state looks like word \\(w\\).&rdquo; These are the same piece of knowledge stored twice.</p>
<p class="lesson-p"><strong>Weight tying</strong> stops paying for it twice: delete \\(\\mathbf{V}\\) and use the transpose of \\(\\mathbf{E}\\) in its place. The shapes agree, \\(\\mathbf{E}^{\\top}\\) is \\(|V| \\times d\\), and the score for word \\(w\\) becomes the dot product between the hidden state and word \\(w\\)&rsquo;s own embedding:</p>
<div class="lesson-math">\\[\\mathbf{e}_t = \\mathbf{E}\\,\\mathbf{x}_t, \\qquad \\mathbf{h}_t = g\\left(\\mathbf{U}\\,\\mathbf{h}_{t-1} + \\mathbf{W}\\,\\mathbf{e}_t\\right), \\qquad \\hat{\\mathbf{y}}_t = \\text{softmax}\\left(\\mathbf{E}^{\\top}\\mathbf{h}_t\\right)\\]</div>
<p class="lesson-p">This removes \\(d \\times |V|\\) parameters, close to half the model at realistic sizes, and it usually <em>improves</em> the model rather than merely shrinking it. The tied matrix receives gradient from both roles, input and output, so every occurrence of a word trains its representation twice over, and the model is forced into the sensible commitment that a word&rsquo;s meaning going in is the same as its meaning coming out.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Transpose Fold</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" id="rtf-b" onclick="rtfTie()">tie the weights</button>
      <span style="${MTLBL}">inspect word</span>
      <button style="${MTBTN}" onclick="rtfWord(1)">keeper</button>
      <button style="${MTBTN}" onclick="rtfWord(3)">arrived</button>
    </div>
    <canvas id="rtf-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rtf-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qrn-tie"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Under weight tying, what is the pre-softmax score for word w?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-tie','Correct. Row w of E-transpose is word w\u2019s embedding, so the score is the dot product between the hidden state and that embedding.')">The dot product between the hidden state and word w&rsquo;s own embedding</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-tie','Distances and dot products differ; the linear layer computes the dot product, with larger meaning more similar.')">The Euclidean distance between the state and the embedding</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-tie','Frequency is not consulted at the output layer; the score comes from the geometry of the state.')">The corpus frequency of word w</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-tie','A separate matrix is exactly what tying eliminates.')">A learned score from a separate output matrix</button>
</div><div class="quiz-explain" id="qrn-tie-explain"></div></div>`;

/* ── Transpose Fold ───────────────────────────────────────── */
const RTF_WORDS = ['the','keeper','harbour','arrived','early','\u2026'];
let _rtf = {tied:false, word:1};
function rtfBuild(){ _rtf = {tied:false, word:1}; rtfDraw(); }
function rtfTie(){ _rtf.tied = !_rtf.tied; rtfDraw(); }
function rtfWord(i){ _rtf.word = i; rtfDraw(); }
function rtfDraw(){
  const b = document.getElementById('rtf-b');
  if(b) b.textContent = _rtf.tied ? 'untie them again' : 'tie the weights';
  const c = mtCtx('rtf-canvas', 260); if(!c) return;
  const {x, w} = c;
  const d = 5, V = RTF_WORDS.length;
  const cell = 17;
  const grid = (px, py, rows, cols, hlRow, hlCol, col)=>{
    for(let r=0;r<rows;r++) for(let cc=0;cc<cols;cc++){
      const hl = (hlRow===r) || (hlCol===cc);
      x.fillStyle = hl ? col+'B8' : 'rgba(23,27,52,'+(0.06+0.10*Math.abs(Math.sin(r*2.1+cc*1.3))).toFixed(3)+')';
      x.fillRect(px+cc*cell, py+r*cell, cell-2, cell-2);
    }
  };
  const eX = 60, eY = 62;
  mtTxt(x, 'E   [d \u00d7 |V|]', eX, eY-14, {size:10, col:MTC.a1, weight:'700'});
  grid(eX, eY, d, V, -1, _rtf.word, MTC.a1);
  RTF_WORDS.forEach((wd,i)=> { if(i===_rtf.word) mtTxt(x, wd, eX+i*cell+cell/2-1, eY+d*cell+12, {size:8.5, col:MTC.a1, align:'center'}); });
  mtTxt(x, 'column '+_rtf.word+' = embedding of \u201C'+RTF_WORDS[_rtf.word]+'\u201D (input role)', eX, eY+d*cell+30, {size:8.5, col:MTC.muted});

  const vX = w-60-(_rtf.tied?V:d)*cell, vY = 62;
  if(!_rtf.tied){
    mtTxt(x, 'V   [|V| \u00d7 d]   separate matrix', vX, vY-14, {size:10, col:MTC.a5, weight:'700'});
    grid(vX, vY, V, d, _rtf.word, -1, MTC.a5);
    mtTxt(x, 'row '+_rtf.word+' = scorer for \u201C'+RTF_WORDS[_rtf.word]+'\u201D (output role)', vX, vY+V*cell+14, {size:8.5, col:MTC.muted});
  } else {
    mtTxt(x, 'E\u1D40  [|V| \u00d7 d]   the same storage, transposed', vX, vY-14, {size:10, col:MTC.a2, weight:'700'});
    grid(vX, vY, V, d, _rtf.word, -1, MTC.a2);
    mtTxt(x, 'row '+_rtf.word+' IS column '+_rtf.word+' of E, read sideways', vX, vY+V*cell+14, {size:8.5, col:MTC.a2});
    x.strokeStyle = MTC.a2; x.lineWidth = 1.6; x.setLineDash([5,4]);
    x.beginPath(); x.moveTo(eX+V*cell+8, eY+d*cell/2); x.lineTo(vX-10, vY+V*cell/2); x.stroke(); x.setLineDash([]);
  }
  // parameter counter
  const dReal = 256, VReal = 30000;
  const before = 2*dReal*VReal + 2*dReal*dReal, after = dReal*VReal + 2*dReal*dReal;
  const now = _rtf.tied ? after : before;
  const py2 = 216;
  mtTxt(x, 'PARAMETERS at d=256, |V|=30k', 60, py2, {size:9, col:MTC.muted});
  const PW = w-260;
  mtRR(x, 60, py2+8, PW, 16, 6); x.fillStyle='rgba(23,27,52,0.05)'; x.fill();
  mtRR(x, 60, py2+8, PW*(now/before), 16, 6); x.fillStyle = _rtf.tied?MTC.a4:MTC.a5; x.fill();
  mtTxt(x, (now/1e6).toFixed(1)+'M' + (_rtf.tied ? '  (\u2212'+((before-after)/1e6).toFixed(1)+'M)' : ''),
        70+PW, py2+16, {size:10, col:_rtf.tied?MTC.a4:MTC.text, weight:'700'});
  mtSet('rtf-cap', _rtf.tied
    ? 'Tied. The output layer is now literally the embedding matrix read sideways: the highlighted row and the highlighted column are the same stored numbers. Gradient reaches them from both roles, so every occurrence of the word trains the representation twice.'
    : 'Untied: two matrices, and the highlighted column of E and row of V encode the same fact about the same word in two places. Press the button to fold them together.');
}

/* ══ 13.3 FOUR JOBS ═══════════════════════════════════════ */
RN_PAGES.rnjobs = `
<div class="lesson-chapter-label">Section 13.3</div>
<h1 class="lesson-h1">Four Jobs for One Architecture</h1>
<p class="lesson-intro">The same recurrent machinery supports several tasks. What changes is which outputs we read and where we attach a loss. Compare the input-output patterns below.</p>

<h2 class="lesson-h2">The Wiring Decisions</h2>
<p class="lesson-p"><strong>Sequence labeling</strong> reads an output at every position and attaches a loss at every position: one tag per token, as in part-of-speech tagging. <strong>Classification</strong> ignores every intermediate output and reads only the final state, which by then has absorbed the whole text; a single loss attaches at the end. <strong>Language modelling</strong> reads every output, but each output is compared against the <em>next</em> input, and at generation time each output loops back to become that input. <strong>Encoder-decoder</strong> chains two RNNs, one that only reads and one that only writes, with the state handed between them.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Output Wiring Switchboard</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="rws-btns"></div>
    <canvas id="rws-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rws-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The lesson of the switchboard is worth stating plainly: the recurrence never changes. The same equation \\(\\mathbf{h}_t = g(\\mathbf{U}\\mathbf{h}_{t-1} + \\mathbf{W}\\mathbf{x}_t)\\) runs in all four modes. Architecture design at this level is loss placement, and the next three sections take the first three modes one at a time; the fourth gets Section 13.7 to itself.</p>

<div class="quiz-block" id="qrn-jobs"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What distinguishes text classification from sequence labeling in this framework?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-jobs','Correct. Labeling reads and penalizes every position; classification reads only the final state and attaches one loss there.')">Which outputs are read and where the loss attaches, not the recurrence itself</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-jobs','Both use the identical state-update equation; only the output wiring differs.')">Classification uses a different hidden-state update rule</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-jobs','Both process the sequence in order; classification simply defers its single readout to the end.')">Classification processes tokens in reverse order</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-jobs','Both train by backpropagation through time; the number of loss attachment points is what differs.')">Sequence labeling does not require backpropagation</button>
</div><div class="quiz-explain" id="qrn-jobs-explain"></div></div>`;

/* ── Output Wiring Switchboard ────────────────────────────── */
const RWS = [
  {k:'label', lab:'sequence labeling', readAll:true, lossAll:true, shift:false, feed:false,
   note:'Every state produces an output and every output carries a loss against that position\u2019s gold tag. n inputs, n outputs, n loss attachments.'},
  {k:'cls', lab:'classification', readAll:false, lossAll:false, shift:false, feed:false,
   note:'The intermediate outputs are never computed. Only the final state, which has read the entire text, feeds a classifier, and one loss attaches at the end. The single error signal then backpropagates through every step.'},
  {k:'lm', lab:'language modeling', readAll:true, lossAll:true, shift:true, feed:false,
   note:'Every position outputs a distribution over the next word, compared against the input shifted by one. Same wiring as labeling, but the answer key is the text itself.'},
  {k:'ed', lab:'encoder-decoder', readAll:false, lossAll:false, shift:false, feed:true,
   note:'Two chains. The encoder reads and produces no outputs; its final state is handed to the decoder, which generates with each output fed back as the next input, loss at every generated position.'}
];
let _rws = 0;
function rwsBuild(){
  const b = document.getElementById('rws-btns');
  if(b) b.innerHTML = RWS.map((m,i)=>`<button style="${MTBTN}" id="rws-b${i}" onclick="rwsGo(${i})">${m.lab}</button>`).join('');
  _rws = 0; rwsDraw();
}
function rwsGo(i){ _rws = i; rwsDraw(); }
function rwsDraw(){
  RWS.forEach((_,i)=>{ const e = document.getElementById('rws-b'+i); if(e){
    e.style.background = i===_rws ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_rws ? '#FAFBFF' : 'var(--muted)'; } });
  const M = RWS[_rws];
  const c = mtCtx('rws-canvas', 226); if(!c) return;
  const {x, w} = c;
  const two = M.feed;
  const n = two ? 3 : 5;
  const half = two ? (w-60)/2 : w-40;
  const drawChain = (ox, count, mode)=>{  // mode: enc | dec | plain
    const gap = Math.min(112, half/count), cw = Math.min(64, gap-12);
    for(let i=0;i<count;i++){
      const px = ox + i*gap, hy = 110;
      if(i>0){
        x.strokeStyle = MTC.a2; x.lineWidth = 1.8;
        x.beginPath(); x.moveTo(px-gap+cw+2, hy+17); x.lineTo(px-3, hy+17); x.stroke();
      }
      mtChip(x, px, hy, cw, 34, 'rgba(79,70,229,0.10)', MTC.a1, 'h', MTC.text, 11);
      // input
      const showIn = mode!=='dec' || true;
      x.strokeStyle = MTC.line2; x.lineWidth = 1.3;
      x.beginPath(); x.moveTo(px+cw/2, hy+72); x.lineTo(px+cw/2, hy+38); x.stroke();
      mtChip(x, px+4, hy+76, cw-8, 20, 'rgba(79,70,229,0.07)', MTC.line, mode==='dec'?'\u0177\u208B\u2081':'x', MTC.muted, 9);
      // output
      const read = mode==='dec' ? true : (M.readAll || (mode!=='enc' && i===count-1 && !M.feed));
      const loss = mode==='dec' ? true : (M.lossAll || (i===count-1 && !M.feed && !M.readAll));
      if(mode==='enc'){ continue; }
      if(read){
        x.strokeStyle = MTC.a5; x.lineWidth = 1.5;
        x.beginPath(); x.moveTo(px+cw/2, hy-4); x.lineTo(px+cw/2, hy-24); x.stroke();
        mtChip(x, px+4, hy-48, cw-8, 20, 'rgba(165,104,14,0.13)', MTC.a5, M.shift?'w\u209C\u208A\u2081':'y', MTC.text, 9);
        if(loss){
          x.beginPath(); x.arc(px+cw/2, hy-62, 6, 0, 7);
          x.fillStyle = 'rgba(159,18,57,0.85)'; x.fill();
          mtTxt(x, 'L', px+cw/2, hy-62, {size:8, col:'#FAFBFF', align:'center', weight:'700'});
        }
        if(mode==='dec' && i<count-1){
          x.strokeStyle = MTC.a4; x.lineWidth = 1.4; x.setLineDash([3,3]);
          x.beginPath(); x.moveTo(px+cw/2+8, hy-30); x.bezierCurveTo(px+gap, hy-40, px+gap+cw/2, hy+110, px+gap+cw/2, hy+74); x.stroke(); x.setLineDash([]);
        }
      } else {
        mtTxt(x, '\u00b7', px+cw/2, hy-30, {size:14, col:MTC.line2, align:'center'});
      }
    }
    return ox + (count-1)*gap + cw;
  };
  if(!two){
    drawChain((w-Math.min(112,(half)/n)*(n-1)-64)/2, n, 'plain');
  } else {
    const endX = drawChain(26, n, 'enc');
    mtTxt(x, 'ENCODER (no outputs)', 26, 74, {size:9, col:MTC.muted});
    // context handoff
    x.strokeStyle = MTC.a4; x.lineWidth = 2.4;
    x.beginPath(); x.moveTo(endX+4, 127); x.lineTo(endX+42, 127); x.stroke();
    mtChip(x, endX+8, 96, 30, 20, 'rgba(11,132,87,0.2)', MTC.a4, 'c', MTC.a4, 10);
    drawChain(endX+52, n, 'dec');
    mtTxt(x, 'DECODER (outputs fed back)', endX+52, 74, {size:9, col:MTC.muted});
  }
  mtSet('rws-cap', M.note);
}

/* ══ 13.3.1 SEQUENCE LABELING ═════════════════════════════ */
RN_PAGES.rntag = `
<div class="lesson-chapter-label">Section 13.3.1</div>
<h1 class="lesson-h1">Attaching a Label to Every Token</h1>
<p class="lesson-intro">Sequence labeling is the most direct use of the machinery: for every input token, output one label from a small fixed set. Part-of-speech tagging is the canonical case, and it also supplies the best illustration of why context matters, because English is full of words whose tag cannot be determined from the word alone.</p>

<h2 class="lesson-h2">A Softmax Per Position</h2>
<p class="lesson-p">The wiring from the switchboard: at every position the hidden state, which has read the sentence up to that token, passes through the output layer and a softmax over the tagset rather than the vocabulary:</p>
<div class="lesson-math">\\[\\hat{\\mathbf{y}}_t = \\text{softmax}\\left(\\mathbf{V}\\,\\mathbf{h}_t\\right)\\]</div>
<p class="lesson-p">with \\(\\mathbf{V}\\) now \\(|T| \\times d_h\\) for a tagset of size \\(|T|\\), and a cross-entropy loss at every single position, summed over the sentence. The predicted tag is the argmax of each distribution.</p>
<p class="lesson-p">The word <em>back</em> is the standard stress test: it is a noun in <em>the back door</em>, an adverb in <em>win the voters back</em>, and a verb in <em>I will back you</em>. A tagger with no context assigns it whatever tag is most frequent and is wrong the rest of the time. A recurrent tagger&rsquo;s state at <em>back</em> contains the words before it, and the distribution shifts accordingly.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Tag Ladder</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="rtl-btns"></div>
    <canvas id="rtl-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="rtl-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qrn-tag"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can a recurrent tagger disambiguate the word <em>back</em> where a word-frequency tagger cannot?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-tag','Correct. The hidden state at back encodes the preceding words, and the tag distribution is computed from that state rather than from the word in isolation.')">Its hidden state at that position encodes the preceding context</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-tag','A larger tagset adds options; it does not add the contextual evidence needed to choose among them.')">It uses a larger tagset</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-tag','Memorizing per-word tags is exactly the frequency baseline being improved on.')">It memorizes the correct tag for each word during training</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-tag','A unidirectional tagger sees only the left context; the following words require the bidirectional model of 13.4.2.')">It reads the words that come after back</button>
</div><div class="quiz-explain" id="qrn-tag-explain"></div></div>`;

/* ── Tag Ladder ───────────────────────────────────────────── */
const RTL = [
  {lab:'\u201Cthe back door\u201D', toks:['the','back','door'],
   dist:[{DT:.96,NN:.01,VB:.01,RB:.01,JJ:.01},{DT:.01,NN:.62,VB:.07,RB:.09,JJ:.21},{DT:.01,NN:.93,VB:.02,RB:.02,JJ:.02}]},
  {lab:'\u201CI will back you\u201D', toks:['I','will','back','you'],
   dist:[{PRP:.97,NN:.01,VB:.01,RB:.01},{MD:.91,NN:.05,VB:.03,RB:.01},{VB:.71,NN:.11,RB:.15,JJ:.03},{PRP:.95,NN:.03,VB:.01,RB:.01}]},
  {lab:'\u201Cwin them back\u201D', toks:['win','them','back'],
   dist:[{VB:.88,NN:.09,RB:.02,JJ:.01},{PRP:.95,NN:.03,VB:.01,RB:.01},{RB:.66,VB:.14,NN:.16,JJ:.04}]}
];
let _rtl = {s:0, hot:-1};
function rtlBuild(){
  const b = document.getElementById('rtl-btns');
  if(b) b.innerHTML = RTL.map((r,i)=>`<button style="${MTBTN}" id="rtl-b${i}" onclick="rtlGo(${i})">${r.lab}</button>`).join('');
  const cv = document.getElementById('rtl-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('mousemove', e=>{
      const r = cv.getBoundingClientRect();
      const R = RTL[_rtl.s], n = R.toks.length;
      const gap = Math.min(170, (r.width-40)/n), cw = Math.min(120, gap-16);
      const startX = (r.width - gap*(n-1) - cw)/2;
      let h = -1;
      for(let i=0;i<n;i++){ const px = startX+i*gap; if(e.clientX-r.left > px && e.clientX-r.left < px+cw) h = i; }
      if(h!==_rtl.hot){ _rtl.hot = h; rtlDraw(); }
    });
  }
  _rtl = {s:0, hot:-1}; rtlDraw();
}
function rtlGo(i){ _rtl.s = i; _rtl.hot = -1; rtlDraw(); }
function rtlDraw(){
  RTL.forEach((_,i)=>{ const e = document.getElementById('rtl-b'+i); if(e){
    e.style.background = i===_rtl.s ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_rtl.s ? '#FAFBFF' : 'var(--muted)'; } });
  const R = RTL[_rtl.s];
  const c = mtCtx('rtl-canvas', 250); if(!c) return;
  const {x, w} = c;
  const n = R.toks.length;
  const gap = Math.min(170, (w-40)/n), cw = Math.min(120, gap-16);
  const startX = (w - gap*(n-1) - cw)/2;
  R.toks.forEach((tkn, i)=>{
    const px = startX + i*gap;
    const amb = tkn==='back';
    const hov = _rtl.hot===i;
    mtChip(x, px, 196, cw, 30, amb?'rgba(159,18,57,0.12)':'rgba(79,70,229,0.09)', amb?MTC.a2:MTC.line2, tkn, MTC.text, 11);
    const dist = Object.entries(R.dist[i]).sort((a,b2)=>b2[1]-a[1]);
    const show = hov ? dist : dist.slice(0, 3);
    show.forEach(([tag, p], j)=>{
      const y = 168 - j*30;
      const bw = (cw-10)*p;
      x.fillStyle = j===0 ? 'rgba(79,70,229,0.7)' : 'rgba(23,27,52,0.14)';
      mtRR(x, px+5, y, Math.max(3,bw), 22, 4); x.fill();
      mtTxt(x, tag, px+10, y+11, {size:9, col: j===0?'#FAFBFF':MTC.muted});
      mtTxt(x, (p*100).toFixed(0)+'%', px+cw-8, y+11, {size:8.5, col:MTC.muted, align:'right'});
    });
    mtTxt(x, dist[0][0], px+cw/2, 30, {size:11, col:MTC.a4, align:'center', weight:'700'});
  });
  mtTxt(x, 'argmax tag', 12, 30, {size:9, col:MTC.muted});
  const bi = R.toks.indexOf('back');
  const bd = Object.entries(R.dist[bi]).sort((a,b2)=>b2[1]-a[1]);
  mtSet('rtl-cap', 'The word <b>back</b> receives a different distribution in each sentence, because the state feeding the softmax has read the preceding words. Here its top tag is <b>' + bd[0][0] + '</b> at ' + (bd[0][1]*100).toFixed(0) + '%, with real mass left on ' + bd[1][0] + '. Hover a token for its full distribution.');
}

/* ══ 13.3.2 CLASSIFICATION ════════════════════════════════ */
RN_PAGES.rncls = `
<div class="lesson-chapter-label">Section 13.3.2</div>
<h1 class="lesson-h1">Compressing a Whole Text Into One Vector</h1>
<p class="lesson-intro">Text classification asks one question about a whole passage: spam or not, positive or negative, which topic. The recurrent answer is direct: run the sequence through, throw away every intermediate output, and read only the final state, because by the last word that state has been folded through the entire text.</p>

<h2 class="lesson-h2">One Loss, Backpropagated Through Everything</h2>
<p class="lesson-p">The final state \\(\\mathbf{h}_n\\) feeds a small feedforward classifier and a softmax over the classes, and a single cross-entropy loss attaches there. During training that lone error signal travels backward through every timestep, so a word at the beginning of the text is still corrected for its contribution to the verdict at the end. The gradient path is long, which is exactly the setting where the vanishing problem of Section 13.5 bites hardest.</p>

<h2 class="lesson-h2">Widening the Funnel</h2>
<p class="lesson-p">Trusting one vector to remember everything is a lot to ask, particularly of early words. A standard improvement is <strong>pooling</strong>: instead of the last state alone, aggregate all of them, either by element-wise mean or element-wise max:</p>
<div class="lesson-math">\\[\\mathbf{h}_{\\text{mean}} = \\frac{1}{n} \\sum_{i=1}^{n} \\mathbf{h}_i\\]</div>
<p class="lesson-p">Mean pooling gives every position an equal, direct route into the classifier, and equally importantly an equal, direct route for the gradient to flow back, rather than one path threaded through the whole chain.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Funnel</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">readout</span>
      <button style="${MTBTN}" id="rfu-b0" onclick="rfuGo(0)">last state</button>
      <button style="${MTBTN}" id="rfu-b1" onclick="rfuGo(1)">mean pool</button>
      <button style="${MTBTN}" id="rfu-b2" onclick="rfuGo(2)">max pool</button>
      <button style="${MTBTNA}" onclick="rfuTrain()">send the error back</button>
    </div>
    <canvas id="rfu-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rfu-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qrn-cls"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In last-state classification, how does a word at the start of the text influence the prediction?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-cls','Correct. Its only route to the classifier is through the chain of state updates, which is also the only route the gradient has back to it.')">Only through the chain of hidden-state updates that carries it to h\u2099</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-cls','Intermediate outputs are discarded in this mode; nothing but the final state reaches the classifier.')">Through its own softmax output at that position</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-cls','A direct connection from every state is what mean pooling adds; plain last-state readout lacks it.')">Through a direct connection from every state to the classifier</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-cls','Early words do influence the outcome; the question is by what route, and the route is the state chain.')">It has no influence on the prediction</button>
</div><div class="quiz-explain" id="qrn-cls-explain"></div></div>`;

/* ── Funnel ───────────────────────────────────────────────── */
let _rfu = {mode:0, t:0, raf:null};
function rfuBuild(){ _rfu = {mode:0, t:0, raf:null}; rfuDraw(); }
function rfuGo(m){ _rfu.mode = m; _rfu.t = 0; rfuDraw(); }
function rfuTrain(){
  if(_rfu.raf) cancelAnimationFrame(_rfu.raf);
  const t0 = Date.now();
  const step = ()=>{ _rfu.t = Math.min(1, (Date.now()-t0)/1100); rfuDraw();
    if(_rfu.t < 1) _rfu.raf = requestAnimationFrame(step); };
  step();
}
function rfuDraw(){
  [0,1,2].forEach(m=>{ const e = document.getElementById('rfu-b'+m); if(e){
    e.style.background = m===_rfu.mode ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = m===_rfu.mode ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('rfu-canvas', 240); if(!c) return;
  const {x, w} = c;
  const toks = ['this','film','was','quietly','devastating'];
  const n = toks.length;
  const gap = Math.min(118, (w-40)/n), cw = Math.min(84, gap-12);
  const startX = (w - gap*(n-1) - cw)/2, hy = 128;
  const clsX = w/2-52, clsY = 26;
  const contrib = i => _rfu.mode===0 ? (i===n-1?1:0) : _rfu.mode===1 ? 1/n : [0.1,0.15,0.05,0.25,0.45][i];
  for(let i=0;i<n;i++){
    const px = startX + i*gap;
    const cv2 = contrib(i);
    if(i>0){
      x.strokeStyle = _rfu.t>0 && _rfu.mode===0 ? 'rgba(159,18,57,'+(0.25+0.55*_rfu.t*(1-(i/n))).toFixed(2)+')' : MTC.a1;
      x.lineWidth = 1.8;
      x.beginPath(); x.moveTo(px-gap+cw+2, hy+17); x.lineTo(px-3, hy+17); x.stroke();
    }
    mtChip(x, px, hy, cw, 34, cv2>0 ? 'rgba(79,70,229,'+(0.06+cv2*0.5).toFixed(2)+')' : 'rgba(23,27,52,0.03)',
           cv2>0 ? MTC.a1 : MTC.line, null);
    mtTxt(x, 'h'+(i+1), px+cw/2, hy+17, {size:11, col:MTC.text, align:'center', weight:'700'});
    if(_rfu.mode!==0 && cv2>0)
      mtTxt(x, _rfu.mode===1 ? '1/'+n : cv2.toFixed(2), px+cw/2, hy+46, {size:8.5, col:MTC.a4, align:'center'});
    mtChip(x, px+4, hy+58+(_rfu.mode!==0?8:0), cw-8, 22, 'rgba(79,70,229,0.07)', MTC.line, toks[i], MTC.muted, 8.5);
    // routes to classifier
    if(cv2>0){
      x.strokeStyle = 'rgba(11,132,87,'+(0.25+cv2*0.6).toFixed(2)+')'; x.lineWidth = 1+cv2*2.4;
      x.beginPath(); x.moveTo(px+cw/2, hy-4);
      x.bezierCurveTo(px+cw/2, hy-40, clsX+52, clsY+70, clsX+52, clsY+46); x.stroke();
    }
    if(_rfu.t>0 && cv2>0){
      x.strokeStyle = 'rgba(159,18,57,'+(0.85*_rfu.t).toFixed(2)+')'; x.lineWidth = 1.6; x.setLineDash([3,4]);
      x.beginPath(); x.moveTo(clsX+52, clsY+46);
      x.bezierCurveTo(clsX+52, clsY+70, px+cw/2, hy-40, px+cw/2, hy-4); x.stroke(); x.setLineDash([]);
    }
  }
  mtChip(x, clsX, clsY, 104, 42, 'rgba(11,132,87,0.13)', MTC.a4, null);
  mtTxt(x, 'FFN + softmax', clsX+52, clsY+15, {size:9.5, col:MTC.text, align:'center'});
  mtTxt(x, 'positive 0.84', clsX+52, clsY+30, {size:9, col:MTC.a4, align:'center', weight:'700'});
  if(_rfu.t>0){
    x.beginPath(); x.arc(clsX+118, clsY+21, 7, 0, 7); x.fillStyle='rgba(159,18,57,0.9)'; x.fill();
    mtTxt(x, 'L', clsX+118, clsY+21, {size:8.5, col:'#FAFBFF', align:'center', weight:'700'});
  }
  const notes = [
    'Only h\u2085 reaches the classifier; the earlier states contribute solely by having shaped it. When the error flows back (press the button), it must thread the entire chain, weakening at every hop.',
    'Mean pooling: every state gets an equal direct route in, and, symmetrically, an equal direct route for the gradient back. No word depends on surviving the chain to be heard.',
    'Max pooling: each dimension of the summary takes its largest value across positions, so the states with the strongest features dominate. Here \u201Cdevastating\u201D carries the most weight.'
  ];
  mtSet('rfu-cap', notes[_rfu.mode]);
}

/* ══ 13.3.3 GENERATION ════════════════════════════════════ */
RN_PAGES.rngen = `
<div class="lesson-chapter-label">Section 13.3.3</div>
<h1 class="lesson-h1">Sampling Text One Word at a Time</h1>
<p class="lesson-intro">A language model gives the probability of the next word. Run that in a loop, feeding each choice back in as input, and the model stops being an evaluator and becomes a writer. This loop, <strong>autoregressive generation</strong>, is mechanically identical in the RNN of this chapter and in every large language model that came after; only the network in the middle changed.</p>

<h2 class="lesson-h2">The Crank</h2>
<p class="lesson-p">Begin with the start symbol. Embed it, update the state, take the softmax, and <em>sample</em> a word from the resulting distribution. The sampled word&rsquo;s embedding becomes the next input, the state updates again, and the crank turns until the end symbol is drawn. Sampling rather than argmaxing is what makes each run different, and a <strong>temperature</strong> parameter \\(\\tau\\) controls how adventurous the draw is by rescaling the scores before the softmax: \\(\\text{softmax}(\\mathbf{z}/\\tau)\\). At \\(\\tau \\to 0\\) the distribution sharpens toward the single most likely word; at large \\(\\tau\\) it flattens toward uniform.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Feedback Crank</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="rfcRoll()">generate</button>
      <span style="${MTLBL}">temperature \u03C4</span>
      <input id="rfc-t" type="range" min="0.2" max="2" step="0.1" value="0.8" oninput="rfcRoll()" style="width:130px;accent-color:var(--accent)">
      <span id="rfc-tl" style="${MTLBL}"></span>
      <span style="${MTLBL}">prime</span>
      <select id="rfc-p" onchange="rfcRoll()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.32rem .55rem;font-family:var(--mono);font-size:.66rem">
        <option value="s">&lt;s&gt;</option><option value="the">the keeper</option><option value="a">a storm</option>
      </select>
    </div>
    <canvas id="rfc-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rfc-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Priming Is Conditioning</h2>
<p class="lesson-p">Replace the bare start symbol with a chosen prefix, and generation continues <em>from</em> that prefix, because the state after reading it already encodes it. This one observation carries surprising freight: feed in a source sentence followed by a separator and the &ldquo;continuation&rdquo; is a translation; feed in an article and the continuation is a summary. Conditioned generation is just generation from a prepared state, and Section 13.7 builds translation out of exactly this trick.</p>

<div class="quiz-block" id="qrn-gen"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does raising the temperature do to the sampling distribution?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-gen','Correct. Dividing the scores by a larger \u03C4 shrinks their differences, so the softmax output flattens toward uniform and unlikely words are drawn more often.')">Flattens it toward uniform, making low-probability words more likely to be drawn</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-gen','Sharpening toward the argmax is what happens as \u03C4 approaches zero, the opposite direction.')">Sharpens it toward the single most likely word</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-gen','Temperature rescales scores before the softmax; the vocabulary itself is unchanged.')">Adds new words to the vocabulary</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-gen','Sequence length is governed by when the end symbol is drawn, which temperature affects only indirectly.')">Directly sets the length of the generated text</button>
</div><div class="quiz-explain" id="qrn-gen-explain"></div></div>`;

/* ── Feedback Crank ───────────────────────────────────────── */
const RFC_LM = {
  '<s>':      [['the',.5],['a',.3],['rain',.2]],
  'the':      [['keeper',.4],['storm',.3],['door',.3]],
  'a':        [['storm',.45],['keeper',.3],['light',.25]],
  'keeper':   [['arrived',.5],['waited',.3],['vanished',.2]],
  'storm':    [['broke',.5],['passed',.3],['arrived',.2]],
  'door':     [['opened',.6],['closed',.4]],
  'light':    [['faded',.6],['returned',.4]],
  'rain':     [['fell',.7],['stopped',.3]],
  'arrived':  [['</s>',.5],['early',.3],['quietly',.2]],
  'waited':   [['</s>',.6],['outside',.4]],
  'vanished': [['</s>',.8],['again',.2]],
  'broke':    [['</s>',.6],['suddenly',.4]],
  'passed':   [['</s>',.7],['slowly',.3]],
  'opened':   [['</s>',.7],['slowly',.3]],
  'closed':   [['</s>',.8],['again',.2]],
  'faded':    [['</s>',.9],['slowly',.1]],
  'returned': [['</s>',.9],['again',.1]],
  'fell':     [['</s>',.7],['softly',.3]],
  'stopped':  [['</s>',1]],
  'early':    [['</s>',1]], 'quietly':[['</s>',1]], 'outside':[['</s>',1]],
  'again':    [['</s>',1]], 'suddenly':[['</s>',1]], 'slowly':[['</s>',1]], 'softly':[['</s>',1]]
};
let _rfc = {seq:[], dists:[]};
function rfcRoll(){
  const tau = +(document.getElementById('rfc-t')||{value:0.8}).value;
  mtSet('rfc-tl', '\u03C4 = ' + tau.toFixed(1));
  const prime = (document.getElementById('rfc-p')||{value:'s'}).value;
  const start = prime==='s' ? ['<s>'] : prime==='the' ? ['the','keeper'] : ['a','storm'];
  const seq = start.slice(), dists = [];
  let cur = seq[seq.length-1];
  for(let i=0;i<7;i++){
    const opts = RFC_LM[cur] || [['</s>',1]];
    const scaled = opts.map(([wd,p])=>[wd, Math.pow(p, 1/tau)]);
    const Z = scaled.reduce((a,[,p])=>a+p, 0);
    const norm = scaled.map(([wd,p])=>[wd, p/Z]);
    dists.push({at:cur, d:norm});
    let r = Math.random(), pick = norm[norm.length-1][0];
    for(const [wd,p] of norm){ if(r < p){ pick = wd; break; } r -= p; }
    seq.push(pick);
    if(pick==='</s>') break;
    cur = pick;
  }
  _rfc = {seq, dists};
  rfcDraw();
}
function rfcDraw(){
  const c = mtCtx('rfc-canvas', 232); if(!c) return;
  const {x, w} = c;
  if(!_rfc.seq.length){ mtSet('rfc-cap','Press generate.'); return; }
  let px = 12;
  _rfc.seq.forEach((tkn, i)=>{
    const isEnd = tkn==='</s>' || tkn==='<s>';
    const tw = Math.max(40, tkn.length*8.6+16);
    if(px+tw > w-8) return;
    mtChip(x, px, 30, tw, 30, isEnd?'rgba(23,27,52,0.05)':'rgba(79,70,229,0.11)', isEnd?MTC.line:MTC.a1, tkn, MTC.text, 10);
    if(i < _rfc.seq.length-1){
      x.strokeStyle = MTC.a4; x.lineWidth = 1.3; x.setLineDash([3,3]);
      x.beginPath(); x.moveTo(px+tw/2+8, 62); x.bezierCurveTo(px+tw+8, 78, px+tw+8, 78, px+tw+16, 62); x.stroke(); x.setLineDash([]);
    }
    px += tw + 14;
  });
  mtTxt(x, '\u21B3 each sampled word loops back as the next input', 12, 88, {size:9, col:MTC.a4});
  // last meaningful distribution
  const D = _rfc.dists[_rfc.dists.length-1];
  if(D){
    mtTxt(x, 'SOFTMAX AT \u201C'+D.at+'\u201D AFTER TEMPERATURE', 12, 122, {size:9.5, col:MTC.muted});
    const L = 110, PW = w-L-70;
    D.d.slice(0,4).forEach(([wd,p], j)=>{
      const y = 136 + j*22;
      mtTxt(x, wd, L-8, y+8, {size:9.5, col:MTC.text, align:'right'});
      mtRR(x, L, y, Math.max(3, PW*p), 16, 4); x.fillStyle = j===0?'rgba(79,70,229,0.7)':'rgba(23,27,52,0.14)'; x.fill();
      mtTxt(x, (p*100).toFixed(0)+'%', L+PW*p+6, y+8, {size:9, col:MTC.muted});
    });
  }
  const tau = +(document.getElementById('rfc-t')||{value:0.8}).value;
  mtSet('rfc-cap', (tau<0.5
    ? 'Low temperature: the distribution is sharpened nearly to the argmax, so repeated runs produce almost the same sentence.'
    : tau>1.4 ? 'High temperature: the distribution is flattened toward uniform, and rare continuations are drawn often enough to derail the sentence.'
    : 'Moderate temperature: likely words dominate but variety survives.') + ' Generate again for a different draw from the same distributions.');
}

/* ══ 13.4.1 STACKED RNNs ══════════════════════════════════ */
RN_PAGES.rnstack = `
<div class="lesson-chapter-label">Section 13.4.1</div>
<h1 class="lesson-h1">Feeding One Recurrent Layer Into Another</h1>
<p class="lesson-intro">Nothing about the recurrence says its input has to be a word embedding. The input at each step can just as well be the output of <em>another</em> recurrent layer running underneath, and stacking layers this way is how recurrent networks get deep.</p>

<h2 class="lesson-h2">Layers as Levels of Description</h2>
<p class="lesson-p">In a stack, layer 1 reads the embeddings and produces a sequence of states; layer 2 reads that sequence of states as its input and produces its own; layer 3 reads layer 2&rsquo;s. Each layer sees the sentence only through the representation the layer below built, which is exactly the arrangement that produced feature hierarchies in feedforward networks. Empirically the layers divide the labour the same way: lower layers end up sensitive to short-range, surface patterns like morphology and local syntax, while higher layers respond to longer-range, more abstract structure. Nobody assigns those roles; they emerge because each layer can only refine what it is given.</p>
<p class="lesson-p">The cost is not subtle. Each added layer adds its own \\(\\mathbf{U}\\) and \\(\\mathbf{W}\\), and, worse, the strict left-to-right dependency of Section 13.1.1 now applies per layer: the sequential bottleneck is multiplied by depth. Accuracy rises with diminishing returns while training time rises steadily, and for most recurrent systems the crossover lands at two to four layers.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Abstraction Stack</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">depth</span>
      <input id="rst-d" type="range" min="1" max="4" step="1" value="1" oninput="rstDraw()" style="width:170px;accent-color:var(--accent)">
      <span id="rst-l" style="${MTLBL}"></span>
    </div>
    <canvas id="rst-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rst-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qrn-st"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does layer 2 of a stacked RNN receive as its input at each timestep?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-st','Correct. Each layer\u2019s input sequence is the hidden-state sequence produced by the layer below it.')">The hidden state layer 1 produced at that timestep</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-st','Only layer 1 sees the embeddings; higher layers see only the representations built beneath them.')">The word embedding, same as layer 1</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-st','Concatenating all previous states would grow with sequence length; each layer reads one state per step.')">All of layer 1&rsquo;s states concatenated</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-st','The final state alone is the classification readout; stacking passes the full sequence upward.')">Only layer 1&rsquo;s final state</button>
</div><div class="quiz-explain" id="qrn-st-explain"></div></div>`;

/* ── Abstraction Stack ────────────────────────────────────── */
function rstDraw(){
  const depth = Math.max(1, Math.min(4, Math.round(+(document.getElementById('rst-d')||{value:1}).value)));
  const acc = [71.0, 76.4, 78.1, 78.7][depth-1];
  const cost = [1, 2.1, 3.4, 4.9][depth-1];
  mtSet('rst-l', depth + (depth===1?' layer':' layers'));
  const c = mtCtx('rst-canvas', 118 + depth*46 + 60); if(!c) return;
  const {x, w} = c;
  const n = 5, gap = Math.min(104, (w-140)/n), cw = Math.min(66, gap-12);
  const startX = 24;
  const roles = ['morphology, local order', 'phrases, agreement', 'clause structure', 'long-range discourse'];
  for(let L = 0; L < depth; L++){
    const hy = 40 + (depth-1-L)*46;
    for(let i=0;i<n;i++){
      const px = startX + i*gap;
      if(i>0){
        x.strokeStyle = MTC.a2; x.lineWidth = 1.5;
        x.beginPath(); x.moveTo(px-gap+cw+2, hy+15); x.lineTo(px-3, hy+15); x.stroke();
      }
      mtChip(x, px, hy, cw, 30, 'rgba(79,70,229,'+(0.07+L*0.05)+')', MTC.a1, null);
      mtTxt(x, 'h'+String(i+1), px+cw/2, hy+15, {size:9.5, col:MTC.text, align:'center'});
      // vertical feed
      x.strokeStyle = MTC.line2; x.lineWidth = 1.2;
      x.beginPath(); x.moveTo(px+cw/2, hy+42); x.lineTo(px+cw/2, hy+34); x.stroke();
    }
    mtTxt(x, 'layer '+(L+1)+' \u00b7 '+roles[L], startX + n*gap + 6, 40 + (depth-1-L)*46 + 15, {size:8.5, col:MTC.muted});
  }
  const inY = 40 + depth*46;
  for(let i=0;i<n;i++){
    mtChip(x, startX + i*gap + 4, inY, cw-8, 22, 'rgba(79,70,229,0.06)', MTC.line, 'e'+(i+1), MTC.muted, 8.5);
  }
  mtTxt(x, 'embeddings', startX + n*gap + 6, inY+11, {size:8.5, col:MTC.muted});
  // meters
  const my = inY + 42, L2 = 118, PW = w-L2-90;
  [['task accuracy', acc, 82, MTC.a4, '%'], ['training cost', cost, 5, MTC.a2, '\u00d7']].forEach(([lab, v, max, col, unit], i)=>{
    const y = my + i*24;
    mtTxt(x, lab, L2-8, y+9, {size:9, col:MTC.muted, align:'right'});
    mtRR(x, L2, y, PW, 16, 5); x.fillStyle='rgba(23,27,52,0.05)'; x.fill();
    mtRR(x, L2, y, Math.max(4, PW*(v/max)), 16, 5); x.fillStyle = col+'CC'; x.fill();
    mtTxt(x, v.toFixed(1)+unit, L2+PW+8, y+9, {size:9.5, col:col, weight:'700'});
  });
  mtSet('rst-cap', depth===1
    ? 'One layer: the state does every job at once. Add layers and watch the two meters move in opposite directions.'
    : 'Accuracy gained from layer ' + (depth-1) + ' to ' + depth + ': ' + ([0,5.4,1.7,0.6][depth-1]).toFixed(1) + ' points, while cost rose to ' + cost.toFixed(1) + '\u00d7. The returns diminish because each layer refines rather than replaces, and the sequential bottleneck now applies once per layer.');
}

/* ══ 13.4.2 BIDIRECTIONAL RNNs ════════════════════════════ */
RN_PAGES.rnbi = `
<div class="lesson-chapter-label">Section 13.4.2</div>
<h1 class="lesson-h1">Reading the Sentence From Both Ends</h1>
<p class="lesson-intro">A left-to-right RNN has a structural blind spot: at position \\(t\\) it has read words 1 through \\(t\\) and knows nothing about what follows, even when the disambiguating evidence sits one word to the right. For generation that constraint is the point; the future genuinely does not exist yet. But for labeling or classification the whole sentence is available from the start, and refusing to read ahead is a self-imposed handicap.</p>

<h2 class="lesson-h2">Two Sweeps, Concatenated</h2>
<p class="lesson-p">The fix is symmetric and slightly audacious: run a second, independent RNN over the sequence in reverse. The forward network summarizes everything up to \\(t\\); the backward network, reading right to left with its own separate weights, summarizes everything from \\(t\\) onward. At each position the two states are concatenated into one representation informed by both directions:</p>
<div class="lesson-math">\\[\\mathbf{h}_t^{f} = \\text{RNN}_{\\text{forward}}\\left(\\mathbf{x}_1, \\ldots, \\mathbf{x}_t\\right), \\qquad \\mathbf{h}_t^{b} = \\text{RNN}_{\\text{backward}}\\left(\\mathbf{x}_t, \\ldots, \\mathbf{x}_n\\right)\\]</div>
<div class="lesson-math">\\[\\mathbf{h}_t = \\left[\\mathbf{h}_t^{f};\\, \\mathbf{h}_t^{b}\\right] = \\mathbf{h}_t^{f} \\oplus \\mathbf{h}_t^{b}\\]</div>
<p class="lesson-p">Nothing is shared between the two networks except the input; each has its own \\(\\mathbf{U}\\) and \\(\\mathbf{W}\\), and the concatenation doubles the state dimension handed to whatever sits above. For classification, a common readout concatenates the two ends that have each read everything: the forward network&rsquo;s last state with the backward network&rsquo;s first.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Two-Sweep Merge</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="rbi-btns"></div>
    <canvas id="rbi-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rbi-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The demonstration uses the classic case. In <em>he sat by the bank of the river</em>, the forward state at <em>bank</em> has read only <em>he sat by the</em>, which is compatible with both the financial and the geographic reading; the disambiguating phrase <em>of the river</em> lies entirely in the future. The backward state has read exactly that phrase. Neither sweep alone settles the word; the concatenation does. The one thing a bidirectional network cannot do is generate, since the backward sweep requires the completed future, and that is why the decoders later in this chapter, and the GPT-style models later in the book, stay resolutely one-directional.</p>

<div class="quiz-block" id="qrn-bi"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can a bidirectional RNN not be used for autoregressive generation?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-bi','Correct. The backward sweep runs from the end of the sequence, and during generation the end does not exist yet.')">The backward sweep needs the complete future, which does not exist during generation</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-bi','The doubled dimension is a modest cost and does not prevent generation; the causality of the backward sweep does.')">The concatenated state is too large to feed a softmax</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-bi','The two networks are trained jointly without difficulty; training is not the obstacle.')">The two directions cannot be trained at the same time</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-bi','Vanishing gradients afflict both directions equally and are a separate issue from causality.')">Backward RNNs suffer worse vanishing gradients</button>
</div><div class="quiz-explain" id="qrn-bi-explain"></div></div>`;

/* ── Two-Sweep Merge ──────────────────────────────────────── */
const RBI = [
  {lab:'\u201Cby the bank of the river\u201D', toks:['he','sat','by','the','bank','of','the','river'], at:4,
   fwd:{river:.5, money:.5}, bwd:{river:.93, money:.07}, both:{river:.96, money:.04}},
  {lab:'\u201Ccash at the bank today\u201D', toks:['he','left','cash','at','the','bank','today'], at:5,
   fwd:{money:.81, river:.19}, bwd:{money:.62, river:.38}, both:{money:.95, river:.05}}
];
let _rbi = 0;
function rbiBuild(){
  const b = document.getElementById('rbi-btns');
  if(b) b.innerHTML = RBI.map((r,i)=>`<button style="${MTBTN}" id="rbi-b${i}" onclick="rbiGo(${i})">${r.lab}</button>`).join('');
  _rbi = 0; rbiDraw();
}
function rbiGo(i){ _rbi = i; rbiDraw(); }
function rbiDraw(){
  RBI.forEach((_,i)=>{ const e = document.getElementById('rbi-b'+i); if(e){
    e.style.background = i===_rbi ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_rbi ? '#FAFBFF' : 'var(--muted)'; } });
  const R = RBI[_rbi];
  const c = mtCtx('rbi-canvas', 268); if(!c) return;
  const {x, w} = c;
  const n = R.toks.length;
  const gap = Math.min(84, (w-30)/n), cw = Math.min(58, gap-8);
  const startX = (w - gap*(n-1) - cw)/2;
  // token row
  R.toks.forEach((tkn, i)=>{
    const px = startX + i*gap;
    const amb = i===R.at;
    mtChip(x, px, 112, cw, 28, amb?'rgba(159,18,57,0.13)':'rgba(23,27,52,0.04)', amb?MTC.a2:MTC.line, tkn, MTC.text, 9.5);
  });
  // forward sweep above
  mtTxt(x, 'FORWARD \u2192 has read the left context', startX, 30, {size:9, col:MTC.a1});
  R.toks.forEach((tkn, i)=>{
    const px = startX + i*gap;
    const seen = i<=R.at;
    if(i>0){
      x.strokeStyle = seen ? MTC.a1 : MTC.line; x.lineWidth = seen?2:1;
      x.beginPath(); x.moveTo(px-gap+cw+1, 58); x.lineTo(px-2, 58); x.stroke();
      x.beginPath(); x.moveTo(px-2, 58); x.lineTo(px-9, 54); x.lineTo(px-9, 62); x.closePath(); x.fillStyle = seen?MTC.a1:MTC.line; x.fill();
    }
    mtChip(x, px+cw/2-13, 44, 26, 26, seen?'rgba(79,70,229,0.16)':'rgba(23,27,52,0.03)', seen?MTC.a1:MTC.line, 'f', seen?MTC.a1:MTC.muted, 9);
  });
  // backward sweep below
  mtTxt(x, '\u2190 BACKWARD  has read the right context', w-startX, 262, {size:9, col:MTC.a5, align:'right'});
  R.toks.forEach((tkn, i)=>{
    const px = startX + i*gap;
    const seen = i>=R.at;
    if(i<n-1){
      x.strokeStyle = seen ? MTC.a5 : MTC.line; x.lineWidth = seen?2:1;
      x.beginPath(); x.moveTo(px+gap-1, 200); x.lineTo(px+cw+2, 200); x.stroke();
      x.beginPath(); x.moveTo(px+cw+2, 200); x.lineTo(px+cw+9, 196); x.lineTo(px+cw+9, 204); x.closePath(); x.fillStyle = seen?MTC.a5:MTC.line; x.fill();
    }
    mtChip(x, px+cw/2-13, 186, 26, 26, seen?'rgba(165,104,14,0.16)':'rgba(23,27,52,0.03)', seen?MTC.a5:MTC.line, 'b', seen?MTC.a5:MTC.muted, 9);
  });
  // concat at ambiguous position
  const ax = startX + R.at*gap + cw/2;
  x.strokeStyle = MTC.a2; x.lineWidth = 1.6; x.setLineDash([3,3]);
  x.beginPath(); x.moveTo(ax, 72); x.lineTo(ax, 110); x.stroke();
  x.beginPath(); x.moveTo(ax, 184); x.lineTo(ax, 142); x.stroke(); x.setLineDash([]);
  // distribution readout
  const senses = Object.keys(R.both);
  const dx = w - 178, dy = 30;
  [['f alone', R.fwd, MTC.a1], ['b alone', R.bwd, MTC.a5], ['[f ; b]', R.both, MTC.a4]].forEach(([lab, d, col], r)=>{
    const y = dy + r*32;
    mtTxt(x, lab, dx-6, y+10, {size:9, col:col, align:'right', weight:'700'});
    senses.forEach((s2, j)=>{
      const bw2 = 64*d[s2];
      mtRR(x, dx + j*78, y, Math.max(2,bw2), 18, 4); x.fillStyle = col+(d[s2]>0.5?'CC':'44'); x.fill();
      if(r===0) mtTxt(x, s2, dx + j*78 + 32, dy-8, {size:8.5, col:MTC.muted, align:'center'});
      mtTxt(x, (d[s2]*100).toFixed(0), dx + j*78 + 2, y+9, {size:8, col:MTC.text});
    });
  });
  const top = senses.sort((a,b2)=>R.both[b2]-R.both[a])[0];
  mtSet('rbi-cap', 'At \u201C' + R.toks[R.at] + '\u201D the forward state alone gives ' + Object.entries(R.fwd).map(([k,v])=>k+' '+(v*100).toFixed(0)+'%').join(' / ') + ': the deciding words lie to its right. The backward state has read exactly those words. Concatenated, the ambiguity resolves to <b>' + top + '</b> at ' + (R.both[top]*100).toFixed(0) + '%.');
}

/* ══ 13.5 VANISHING GRADIENTS AND THE LSTM ════════════════ */
RN_PAGES.rnlstm = `
<div class="lesson-chapter-label">Section 13.5</div>
<h1 class="lesson-h1">Why Long-Distance Information Gets Lost</h1>
<p class="lesson-intro">Section 13.2 promised that every prefix word has a path into the current prediction, and then warned that a path is not a signal. This section makes the warning quantitative, watches a simple RNN fail on a real sentence, and then builds the repair, the LSTM, one gate at a time.</p>

<h2 class="lesson-h2">A Failure You Can Point To</h2>
<p class="lesson-p">English subject-verb agreement can span arbitrary distance. In <em>the crates the porter was stacking were heavy</em>, the verb <em>were</em> must agree with <em>crates</em>, five positions back, while the singular <em>porter</em> sits temptingly adjacent. A model whose memory of <em>crates</em> has decayed below its memory of <em>porter</em> will confidently produce <em>was</em>, and a simple RNN does exactly that.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Agreement Stress Test</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">predict the verb at</span>
      <button style="${MTBTN}" id="rag-b0" onclick="ragGo(0)">\u201Cwas\u201D (distance 1)</button>
      <button style="${MTBTN}" id="rag-b1" onclick="ragGo(1)">\u201Cwere\u201D (distance 5)</button>
    </div>
    <canvas id="rag-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rag-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">The Derivation: Why Gradients Vanish</h2>
<p class="lesson-p">The failure is not bad luck; it follows from the chain rule. To learn a dependency spanning \\(k\\) steps, the gradient must travel from the loss back to the state \\(k\\) steps earlier, and each of those steps multiplies in one Jacobian of the recurrence:</p>
<div class="lesson-math">\\[\\frac{\\partial \\mathbf{h}_t}{\\partial \\mathbf{h}_{t-k}} = \\prod_{j=t-k+1}^{t} \\frac{\\partial \\mathbf{h}_j}{\\partial \\mathbf{h}_{j-1}} = \\prod_{j} \\mathbf{U}^{\\top} \\text{diag}\\left(g'(\\cdot)\\right)\\]</div>
<p class="lesson-p">A product of \\(k\\) similar matrices behaves like a matrix raised to the \\(k\\)-th power, so its size is governed by \\(\\gamma^{k}\\), where \\(\\gamma\\) reflects the largest singular value of \\(\\mathbf{U}\\) damped by the derivative of the nonlinearity. And tanh guarantees damping: \\(g' \\le 1\\) everywhere, and well below 1 whenever the unit is saturated. With \\(\\gamma = 0.9\\), a modest-sounding decay, the gradient across 40 steps is \\(0.9^{40} \\approx 0.015\\): the learning signal for a 40-step dependency arrives at one and a half percent strength. If \\(\\gamma &gt; 1\\) instead, the same power law explodes, which is why the same derivation yields both the vanishing and the exploding gradient problems; exploding is handled crudely by clipping, vanishing needs architecture.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Gradient Decay Meter</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">sequence length</span>
      <input id="rgd-n" type="range" min="10" max="60" step="5" value="40" oninput="rgdDraw()" style="width:160px;accent-color:var(--accent)">
      <span id="rgd-l" style="${MTLBL}"></span>
    </div>
    <canvas id="rgd-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rgd-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Building the Repair, One Gate at a Time</h2>
<p class="lesson-p">The diagnosis names the cure. Gradients die because information is forced through a multiplicative squash at every step; the fix is a second channel, the <strong>cell state</strong> \\(\\mathbf{c}_t\\), updated by <em>addition</em>, with learned <strong>gates</strong> deciding what enters and leaves it. A gate is nothing exotic: a small feedforward layer with a sigmoid, producing a vector of values in \\((0,1)\\) that multiplies element-wise against another vector, a soft mask that can pass, block, or scale each dimension independently. Writing \\(\\odot\\) for that element-wise (Hadamard) product, the LSTM is four gates around one addition.</p>
<p class="lesson-p">The <strong>forget gate</strong> reads the current input and previous hidden state and decides, per dimension, how much of the old cell state survives:</p>
<div class="lesson-math">\\[\\mathbf{f}_t = \\sigma\\left(\\mathbf{U}_f\\,\\mathbf{h}_{t-1} + \\mathbf{W}_f\\,\\mathbf{x}_t\\right), \\qquad \\mathbf{k}_t = \\mathbf{c}_{t-1} \\odot \\mathbf{f}_t\\]</div>
<p class="lesson-p">A candidate update is computed exactly as a simple RNN would compute its state, and the <strong>add gate</strong> (or input gate) selects which parts of it are worth writing:</p>
<div class="lesson-math">\\[\\mathbf{g}_t = \\tanh\\left(\\mathbf{U}_g\\,\\mathbf{h}_{t-1} + \\mathbf{W}_g\\,\\mathbf{x}_t\\right), \\qquad \\mathbf{i}_t = \\sigma\\left(\\mathbf{U}_i\\,\\mathbf{h}_{t-1} + \\mathbf{W}_i\\,\\mathbf{x}_t\\right), \\qquad \\mathbf{j}_t = \\mathbf{g}_t \\odot \\mathbf{i}_t\\]</div>
<p class="lesson-p">The new cell state is simply what survived plus what was selected, and this line is the entire trick:</p>
<div class="lesson-math">\\[\\mathbf{c}_t = \\mathbf{j}_t + \\mathbf{k}_t\\]</div>
<p class="lesson-p">Finally the <strong>output gate</strong> decides how much of the cell state is exposed as the hidden state for this step&rsquo;s prediction, since not everything worth remembering is worth saying right now:</p>
<div class="lesson-math">\\[\\mathbf{o}_t = \\sigma\\left(\\mathbf{U}_o\\,\\mathbf{h}_{t-1} + \\mathbf{W}_o\\,\\mathbf{x}_t\\right), \\qquad \\mathbf{h}_t = \\mathbf{o}_t \\odot \\tanh\\left(\\mathbf{c}_t\\right)\\]</div>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Gate Bench</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="rgb-btns"></div>
    <canvas id="rgb-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rgb-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Why This Fixes the Gradient</h2>
<p class="lesson-p">Differentiate the cell update. Because \\(\\mathbf{c}_t = \\mathbf{f}_t \\odot \\mathbf{c}_{t-1} + \\mathbf{j}_t\\), the Jacobian along the cell path is</p>
<div class="lesson-math">\\[\\frac{\\partial \\mathbf{c}_t}{\\partial \\mathbf{c}_{t-1}} = \\text{diag}\\left(\\mathbf{f}_t\\right)\\]</div>
<p class="lesson-p">No \\(\\mathbf{U}\\), no tanh derivative: the gradient across \\(k\\) steps of cell state is a product of forget-gate values, and the network can <em>learn</em> to hold those values near 1 for dimensions carrying long-range information. Where the simple RNN&rsquo;s decay rate was fixed by its weights and nonlinearity, the LSTM&rsquo;s decay rate is itself a trained, input-dependent decision, per dimension, per step. That is the entire content of the architecture: it turns &ldquo;how fast do I forget&rdquo; from a bug into a parameter.</p>

<div class="quiz-block" id="qrn-ls"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does the additive cell-state update prevent the gradient from vanishing?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-ls','Correct. The Jacobian along the cell path is just diag(f), so the decay per step is a learned gate value that can be held near 1, not a fixed multiplicative squash.')">The gradient along the cell path is scaled only by the forget gate, which can learn to stay near 1</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-ls','The LSTM has more matrices, not fewer; what changes is the path the gradient takes, not the amount of multiplication overall.')">The LSTM removes all matrix multiplications from the network</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-ls','Sigmoids appear in every gate; the point is where they sit, off the main cell highway.')">The LSTM replaces sigmoid with a linear activation everywhere</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-ls','Storing all states is what BPTT already does for caching; it does not change the decay of the signal.')">The cell state stores a copy of every previous hidden state</button>
</div><div class="quiz-explain" id="qrn-ls-explain"></div></div>`;

/* ── Agreement Stress Test ────────────────────────────────── */
const RAG_TOKS = ['the','crates','the','porter','was','stacking','were','heavy'];
let _rag = 1;
function ragBuild(){ _rag = 1; ragDraw(); }
function ragGo(i){ _rag = i; ragDraw(); }
function ragDraw(){
  [0,1].forEach(i=>{ const e = document.getElementById('rag-b'+i); if(e){
    e.style.background = i===_rag ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_rag ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('rag-canvas', 250); if(!c) return;
  const {x, w} = c;
  const at = _rag===0 ? 4 : 6;                   // position of the verb
  const head = _rag===0 ? 3 : 1;                 // agreement controller
  const n = RAG_TOKS.length;
  const gap = Math.min(82, (w-30)/n), cw = Math.min(66, gap-8);
  const startX = (w - gap*(n-1) - cw)/2;
  RAG_TOKS.forEach((tkn, i)=>{
    const px = startX + i*gap;
    const decay = i<at ? Math.pow(0.62, at-1-i) : 0;
    const isVerb = i===at, isHead = i===head;
    let fill = 'rgba(23,27,52,0.04)';
    if(isVerb) fill = 'rgba(165,104,14,0.22)';
    else if(i<at) fill = 'rgba(79,70,229,'+(0.05+decay*0.55).toFixed(3)+')';
    mtChip(x, px, 44, cw, 30, fill, isVerb?MTC.a5:(isHead?MTC.a2:MTC.line), null);
    x.save(); x.font='9px '+MTC.mono; x.fillStyle = decay>0.4||isVerb ? '#141A3A' : MTC.muted;
    x.textAlign='center'; x.textBaseline='middle';
    x.fillText(tkn, px+cw/2, 59); x.restore();
    if(isHead) mtTxt(x, 'controller', px+cw/2, 30, {size:8, col:MTC.a2, align:'center'});
    if(isVerb) mtTxt(x, 'predict here', px+cw/2, 88, {size:8, col:MTC.a5, align:'center'});
    if(i<at) mtTxt(x, decay.toFixed(2), px+cw/2, 102, {size:7.5, col:MTC.muted, align:'center'});
  });
  mtTxt(x, 'SRN memory strength at prediction time (decay 0.62 per step)', startX, 118, {size:8.5, col:MTC.muted});
  // predictions
  const dist = at-head;
  const srnRight = dist<=3 ? 0.86 : 0.31;
  const lstmRight = dist<=3 ? 0.91 : 0.84;
  const L2 = 150, PW = w-L2-120, by = 148;
  const correct = _rag===0 ? 'was (sg)' : 'were (pl)';
  const wrong = _rag===0 ? 'were (pl)' : 'was (sg)';
  [['simple RNN', srnRight, srnRight>0.5?MTC.a4:MTC.a2], ['LSTM', lstmRight, MTC.a4]].forEach(([lab, p, col], i)=>{
    const y = by + i*38;
    mtTxt(x, lab, L2-8, y+10, {size:9.5, col:MTC.text, align:'right'});
    mtRR(x, L2, y, PW, 20, 5); x.fillStyle='rgba(23,27,52,0.05)'; x.fill();
    mtRR(x, L2, y, Math.max(4, PW*p), 20, 5); x.fillStyle = col+'CC'; x.fill();
    mtTxt(x, 'P('+correct+') = '+(p*100).toFixed(0)+'%', L2+PW+8, y+10, {size:9, col:col, weight:'700'});
    if(p<0.5) mtTxt(x, 'predicts '+wrong, L2+6, y+10, {size:8.5, col:'#FAFBFF'});
  });
  mtSet('rag-cap', _rag===0
    ? 'At \u201Cwas\u201D the controller \u201Cporter\u201D is the immediately preceding word and still bright in the SRN\u2019s memory: both models agree comfortably.'
    : 'At \u201Cwere\u201D the controller \u201Ccrates\u201D is five steps back and has decayed to ' + Math.pow(0.62, at-1-head).toFixed(2) + ' strength, while the singular \u201Cporter\u201D sits recent and bright and misleading. The SRN follows the brightness and picks \u201Cwas\u201D. The LSTM\u2019s cell state carried the plural feature across the gap.');
}

/* ── Gradient Decay Meter ─────────────────────────────────── */
function rgdDraw(){
  const N = +(document.getElementById('rgd-n')||{value:40}).value;
  mtSet('rgd-l', N + ' steps');
  const c = mtCtx('rgd-canvas', 236); if(!c) return;
  const {x, w} = c;
  const L2 = 62, R2 = 20, T2 = 22, B2 = 44;
  const PW = w-L2-R2, PH = 236-T2-B2;
  // log axis: 10^0 down to 10^-8
  for(let e2=0; e2>=-8; e2-=2){
    const y = T2 + PH*(-e2/8);
    x.strokeStyle = MTC.line; x.lineWidth = 1;
    x.beginPath(); x.moveTo(L2, y); x.lineTo(L2+PW, y); x.stroke();
    mtTxt(x, '10'+(e2===0?'\u2070':'\u207B'+String(-e2)), L2-6, y, {size:8.5, col:MTC.muted, align:'right'});
  }
  const curve = (gamma, col, lab)=>{
    x.strokeStyle = col; x.lineWidth = 2.2;
    x.beginPath();
    for(let k=0;k<=N;k++){
      const v = Math.pow(gamma, k);
      const lg = Math.max(-8, Math.log10(Math.max(1e-12, v)));
      const px = L2 + (k/N)*PW, py = T2 + PH*(-lg/8);
      k? x.lineTo(px, py) : x.moveTo(px, py);
    }
    x.stroke();
    const vEnd = Math.pow(gamma, N);
    const lgE = Math.max(-8, Math.log10(Math.max(1e-12, vEnd)));
    mtTxt(x, lab, L2+PW-4, T2 + PH*(-lgE/8) - 10, {size:9.5, col:col, align:'right', weight:'700'});
  };
  curve(0.90, MTC.a2, 'SRN  \u03B3 = 0.90');
  curve(0.985, MTC.a4, 'LSTM cell path  f \u2248 0.985');
  mtTxt(x, 'distance k between loss and state \u2192', L2+PW/2, 236-14, {size:9, col:MTC.muted, align:'center'});
  x.save(); x.translate(14, T2+PH/2); x.rotate(-Math.PI/2);
  mtTxt(x, '|gradient|', 0, 0, {size:9, col:MTC.muted, align:'center'}); x.restore();
  const srnEnd = Math.pow(0.90, N), lstmEnd = Math.pow(0.985, N);
  mtSet('rgd-cap', 'At distance ' + N + ', the SRN gradient has fallen to ' + srnEnd.toExponential(1) + ' of its strength; the LSTM cell path, whose per-step factor is a learned forget-gate value near 1, retains ' + (lstmEnd*100).toFixed(0) + '%. On a log axis both are straight lines, because both are pure powers: the whole difference is the base.');
}

/* ── Gate Bench ───────────────────────────────────────────── */
const RGB_STAGES = ['raw carry', '+ forget gate', '+ add gate', '+ output gate'];
let _rgb = 0;
function rgbBuild(){
  const b = document.getElementById('rgb-btns');
  if(b) b.innerHTML = '<span style="'+MTLBL+'">build stage</span>' + RGB_STAGES.map((s2,i)=>
    `<button style="${MTBTN}" id="rgb-b${i}" onclick="rgbGo(${i})">${s2}</button>`).join('');
  _rgb = 0; rgbDraw();
}
function rgbGo(i){ _rgb = i; rgbDraw(); }
function rgbDraw(){
  RGB_STAGES.forEach((_,i)=>{ const e = document.getElementById('rgb-b'+i); if(e){
    e.style.background = i===_rgb ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = i===_rgb ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('rgb-canvas', 262); if(!c) return;
  const {x, w} = c;
  const d = 8;
  const cellW = Math.min(40, (w-260)/d);
  const cPrev = [0.8, -0.3, 0.6, 0.1, -0.7, 0.9, -0.2, 0.4];
  const f =    [0.97, 0.12, 0.94, 0.55, 0.08, 0.99, 0.30, 0.85];
  const g2 =   [0.2, 0.7, -0.4, 0.5, 0.8, -0.1, 0.6, -0.5];
  const i2 =   [0.15, 0.88, 0.20, 0.70, 0.92, 0.05, 0.60, 0.40];
  const o2 =   [0.9, 0.2, 0.85, 0.5, 0.3, 0.95, 0.4, 0.7];
  const vecRow = (lab, vals, y, mode, col)=>{
    mtTxt(x, lab, 118, y+cellW/2, {size:9.5, col:MTC.text, align:'right'});
    vals.forEach((v, j)=>{
      const px = 128 + j*cellW;
      let fill;
      if(mode==='gate') fill = 'rgba(159,18,57,'+(v*0.75).toFixed(2)+')';
      else fill = v>=0 ? 'rgba(79,70,229,'+(Math.abs(v)*0.7).toFixed(2)+')' : 'rgba(165,104,14,'+(Math.abs(v)*0.7).toFixed(2)+')';
      mtRR(x, px, y, cellW-3, cellW-3, 3); x.fillStyle = fill; x.fill();
      x.strokeStyle = MTC.line; x.lineWidth = 0.6; x.stroke();
      x.save(); x.font='7.5px '+MTC.mono; x.fillStyle = Math.abs(v)>0.55?'#FAFBFF':MTC.muted;
      x.textAlign='center'; x.textBaseline='middle';
      x.fillText(v.toFixed(1).replace('0.','.'), px+(cellW-3)/2, y+(cellW-3)/2); x.restore();
    });
    if(col) mtTxt(x, col, 132 + d*cellW + 4, y+cellW/2, {size:8.5, col:MTC.muted});
  };
  const mul = (a,b2)=>a.map((v,j)=>v*b2[j]);
  const add = (a,b2)=>a.map((v,j)=>v+b2[j]);
  if(_rgb===0){
    vecRow('c\u209C\u208B\u2081', cPrev, 40, 'val', 'the memory highway');
    vecRow('c\u209C = c\u209C\u208B\u2081', cPrev, 120, 'val', 'carried unchanged');
    mtSet('rgb-cap', 'Stage 0: the cell state as pure carry. If nothing ever modified it, memory would be perfect and useless. The gates that follow are controlled ways to modify it without breaking the additive highway.');
  } else if(_rgb===1){
    vecRow('c\u209C\u208B\u2081', cPrev, 34, 'val');
    vecRow('f\u209C = \u03C3(U_f h + W_f x)', f, 34+cellW+18, 'gate', 'soft mask, 0 to 1');
    vecRow('k\u209C = c\u209C\u208B\u2081 \u2299 f\u209C', mul(cPrev, f), 34+(cellW+18)*2+8, 'val', 'what survives');
    mtTxt(x, '\u2299  element-wise', 60, 34+cellW+18+cellW/2, {size:8.5, col:MTC.a2});
    mtSet('rgb-cap', 'The forget gate. The middle row is a sigmoid output: each entry between 0 and 1, shading from block to pass. Multiplied element-wise against the old cell state, it deletes dimension 2 and 5 (dark entries near 0) while passing dimensions 1, 3 and 6 nearly untouched. Per-dimension, learned, input-dependent forgetting.');
  } else if(_rgb===2){
    const k2 = mul(cPrev, f), j2 = mul(g2, i2);
    vecRow('g\u209C = tanh(\u00b7)', g2, 26, 'val', 'candidate info');
    vecRow('i\u209C = \u03C3(\u00b7)', i2, 26+cellW+12, 'gate', 'add gate');
    vecRow('j\u209C = g\u209C \u2299 i\u209C', j2, 26+(cellW+12)*2, 'val', 'what gets written');
    vecRow('c\u209C = j\u209C + k\u209C', add(j2,k2), 26+(cellW+12)*3+10, 'val', 'ADDITION, not squash');
    mtSet('rgb-cap', 'The add gate. A candidate update g\u209C is computed exactly as a simple RNN would, then the gate i\u209C selects which of its dimensions are worth writing. The final line is the whole architecture: the new cell state is what survived plus what was selected, one addition, no tanh in the path.');
  } else {
    const k2 = mul(cPrev, f), j2 = mul(g2, i2), ct = add(j2, k2);
    const th = ct.map(v=>Math.tanh(v));
    vecRow('c\u209C', ct, 26, 'val', 'full memory');
    vecRow('o\u209C = \u03C3(\u00b7)', o2, 26+cellW+12, 'gate', 'output gate');
    vecRow('h\u209C = o\u209C \u2299 tanh(c\u209C)', mul(o2, th), 26+(cellW+12)*2, 'val', 'what this step exposes');
    mtSet('rgb-cap', 'The output gate. The cell state is the archive; the hidden state is what this timestep chooses to say. Dimensions 2 and 5 are carried in memory but masked from the output, because not everything worth remembering is worth reporting right now. Two channels, two jobs: c\u209C for storage, h\u209C for speech.');
  }
}

/* ══ 13.5.1 THE UNIT AS A MODULE ══════════════════════════ */
RN_PAGES.rnunit = `
<div class="lesson-chapter-label">Section 13.5.1</div>
<h1 class="lesson-h1">Hiding the Complexity Inside the Unit</h1>
<p class="lesson-intro">The LSTM equations are long, but their structure is contained. Everything complicated lives <em>inside</em> the unit; from the outside it is still a box that takes what came before and the current input, and produces state. That encapsulation is why the LSTM slotted into every architecture in this chapter without redesigning any of them.</p>

<h2 class="lesson-h2">Three Units at the Same Scale</h2>
<p class="lesson-p">Line the three units up. A feedforward unit takes one input vector and one weight set and produces one activation. A simple recurrent unit adds a second input, the previous hidden state, and a second weight matrix, but is otherwise the same computation. The LSTM takes three inputs, \\(\\mathbf{c}_{t-1}\\), \\(\\mathbf{h}_{t-1}\\), \\(\\mathbf{x}_t\\), runs four internal gate computations, and emits two outputs, \\(\\mathbf{c}_t\\) and \\(\\mathbf{h}_t\\). More plumbing, same interface pattern: state in, state out.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Unit Zoom</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" id="ruz-b" onclick="ruzSwap()">swap SRN units for LSTM units in a network</button>
    </div>
    <canvas id="ruz-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="ruz-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">This modularity is why the rest of the chapter, and most published work, says &ldquo;RNN&rdquo; and means whichever unit fits: the stacked networks of 13.4.1, the bidirectional networks of 13.4.2, and the encoder-decoders of 13.7 all accept LSTM cells by direct substitution. The only visible difference in a diagram is that each recurrent connection carries two wires, \\(\\mathbf{c}\\) and \\(\\mathbf{h}\\), instead of one.</p>

<div class="quiz-block" id="qrn-un"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What changes in an architecture diagram when SRN units are replaced with LSTM units?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-un','Correct. The gates are internal to the unit; externally each recurrent connection simply carries the cell state alongside the hidden state.')">Each recurrent connection carries two vectors, c and h, instead of one</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-un','The gates live inside the unit and do not appear as separate nodes in the outer wiring.')">Four new gate layers appear between every pair of timesteps</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-un','Left-to-right processing is unchanged; the LSTM alters what flows, not the direction of flow.')">The network must now process the sequence in both directions</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-un','The output interface is identical, which is precisely what makes the substitution drop-in.')">The softmax must be replaced with a different output function</button>
</div><div class="quiz-explain" id="qrn-un-explain"></div></div>`;

/* ── Unit Zoom ────────────────────────────────────────────── */
let _ruz = false;
function ruzBuild(){ _ruz = false; ruzDraw(); }
function ruzSwap(){ _ruz = !_ruz; ruzDraw(); }
function ruzDraw(){
  const b = document.getElementById('ruz-b');
  if(b){ b.textContent = _ruz ? 'swap back to SRN units' : 'swap SRN units for LSTM units in a network';
         b.style.background = _ruz?'var(--accent)':'var(--surface2)'; b.style.color = _ruz?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('ruz-canvas', 268); if(!c) return;
  const {x, w} = c;
  if(!_ruz){
    const bw = Math.min(180, (w-80)/3);
    const units = [
      {t:'FEEDFORWARD', ins:['x'], outs:['h'], inner:'g(Wx)', col:MTC.muted},
      {t:'SIMPLE RECURRENT', ins:['x\u209C','h\u209C\u208B\u2081'], outs:['h\u209C'], inner:'g(Uh + Wx)', col:MTC.a1},
      {t:'LSTM', ins:['x\u209C','h\u209C\u208B\u2081','c\u209C\u208B\u2081'], outs:['h\u209C','c\u209C'], inner:'4 gates, 1 addition', col:MTC.a2}
    ];
    units.forEach((u, i)=>{
      const px = 24 + i*((w-48)/3);
      const py = 74, bh = 96;
      mtTxt(x, u.t, px+bw/2, 30, {size:9, col:u.col, align:'center', weight:'700'});
      mtChip(x, px, py, bw, bh, u.col==='#526080'?'rgba(23,27,52,0.05)':u.col+'14', u.col, null);
      mtTxt(x, u.inner, px+bw/2, py+bh/2, {size:9.5, col:u.col==='#526080'?MTC.text:u.col, align:'center'});
      if(i===2) mtTxt(x, '(opaque from outside)', px+bw/2, py+bh/2+16, {size:8, col:MTC.muted, align:'center'});
      u.ins.forEach((lab, j)=>{
        const iy = py+bh+18;
        const ix = px + bw*(j+1)/(u.ins.length+1);
        x.strokeStyle = MTC.line2; x.lineWidth = 1.4;
        x.beginPath(); x.moveTo(ix, iy+14); x.lineTo(ix, py+bh+2); x.stroke();
        x.beginPath(); x.moveTo(ix, py+bh+2); x.lineTo(ix-4, py+bh+9); x.lineTo(ix+4, py+bh+9); x.closePath(); x.fillStyle=MTC.line2; x.fill();
        mtTxt(x, lab, ix, iy+24, {size:9, col:MTC.muted, align:'center'});
      });
      u.outs.forEach((lab, j)=>{
        const ox2 = px + bw*(j+1)/(u.outs.length+1);
        x.strokeStyle = u.col; x.lineWidth = 1.6;
        x.beginPath(); x.moveTo(ox2, py-2); x.lineTo(ox2, py-22); x.stroke();
        x.beginPath(); x.moveTo(ox2, py-24); x.lineTo(ox2-4, py-16); x.lineTo(ox2+4, py-16); x.closePath(); x.fillStyle=u.col; x.fill();
        mtTxt(x, lab, ox2, py-34, {size:9, col:u.col, align:'center'});
      });
    });
    mtSet('ruz-cap', 'Left to right: one input, then two, then three; one output, then one, then two. The LSTM\u2019s four gates never leave the box. Press the button to see what substitution looks like inside a real network.');
  } else {
    const n = 4;
    const gap = Math.min(140, (w-60)/n), cw = Math.min(86, gap-16);
    const startX = (w - gap*(n-1) - cw)/2, hy = 110;
    for(let i=0;i<n;i++){
      const px = startX + i*gap;
      if(i>0){
        x.strokeStyle = MTC.a1; x.lineWidth = 2;
        x.beginPath(); x.moveTo(px-gap+cw+2, hy+12); x.lineTo(px-3, hy+12); x.stroke();
        x.strokeStyle = MTC.a2; x.lineWidth = 2;
        x.beginPath(); x.moveTo(px-gap+cw+2, hy+30); x.lineTo(px-3, hy+30); x.stroke();
      }
      mtChip(x, px, hy, cw, 44, 'rgba(159,18,57,0.10)', MTC.a2, 'LSTM', MTC.text, 10);
      x.strokeStyle = MTC.line2; x.lineWidth = 1.2;
      x.beginPath(); x.moveTo(px+cw/2, hy+82); x.lineTo(px+cw/2, hy+48); x.stroke();
      mtChip(x, px+6, hy+86, cw-12, 22, 'rgba(79,70,229,0.07)', MTC.line, 'x'+(i+1), MTC.muted, 9);
      x.strokeStyle = MTC.a5; x.lineWidth = 1.4;
      x.beginPath(); x.moveTo(px+cw/2, hy-4); x.lineTo(px+cw/2, hy-24); x.stroke();
      mtChip(x, px+6, hy-48, cw-12, 22, 'rgba(165,104,14,0.10)', MTC.line, 'y'+(i+1), MTC.muted, 9);
    }
    mtTxt(x, 'h (teal) and c (crimson): two wires per hop, nothing else changed', w/2, hy+140, {size:9.5, col:MTC.muted, align:'center'});
    mtSet('ruz-cap', 'The same chain from Section 13.1, with LSTM cells dropped in. The outer architecture, the inputs, the outputs, and the training procedure are untouched; the only visible difference is the second wire carrying the cell state between timesteps.');
  }
}

/* ══ 13.6 THE FOUR SHAPES ═════════════════════════════════ */
RN_PAGES.rngrid = `
<div class="lesson-chapter-label">Section 13.6</div>
<h1 class="lesson-h1">The Four Shapes, Side by Side</h1>
<p class="lesson-intro">Review the four input-output patterns and match each to a task. The shape helps determine which states produce outputs and where training losses belong.</p>

<h2 class="lesson-h2">The Grid</h2>
<p class="lesson-p">The four cells: <strong>sequence labeling</strong> maps \\(n\\) inputs to \\(n\\) aligned outputs, one loss per position. <strong>Classification</strong> maps \\(n\\) inputs to one output, one loss at the end. <strong>Language modelling</strong> maps \\(n\\) inputs to \\(n\\) outputs where each output is the next input, so the sequence supervises itself. <strong>Encoder-decoder</strong> maps \\(n\\) inputs to \\(m\\) outputs with no alignment between them, which is the shape of translation, summarization, and dialogue.</p>
<p class="lesson-p">Sort the tasks below into their cells. Some are less obvious than they look, and the misfilings are instructive: speech-to-text feels like labeling until you notice the input frames and output characters do not line up one to one.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Task Sorter</span></div>
  <div class="viz-body">
    <div id="rgr-task" style="background:var(--panel);border-radius:10px;padding:.9rem 1.1rem;color:#ECF1FF;margin-bottom:.9rem;min-height:3.2rem;font-family:var(--mono);font-size:.78rem"></div>
    <div id="rgr-btns" style="${MTROW}"></div>
    <canvas id="rgr-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rgr-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qrn-gr"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Summarization takes a long document and produces a short abstract. Which shape is it?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-gr','Correct. Input and output are both sequences, of different lengths, with no positional alignment between them: the defining features of the encoder-decoder shape.')">Encoder-decoder: two sequences of different lengths with no alignment</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-gr','Labeling requires one output per input position; a 500-word document does not map to a 40-word abstract position by position.')">Sequence labeling, one output per input word</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-gr','Classification produces a single label, not a text; an abstract is a generated sequence.')">Classification, since the abstract summarizes one document</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-gr','Pure language modelling has no separate input to condition on; summarization is generation conditioned on a source document.')">Language modelling with a shorter output</button>
</div><div class="quiz-explain" id="qrn-gr-explain"></div></div>`;

/* ── Task Sorter ──────────────────────────────────────────── */
const RGR_Q = [
  ['sequence labeling',  'n \u2192 n aligned', 'POS tagging'],
  ['classification',     'n \u2192 1',        'sentiment analysis'],
  ['language modeling',  'n \u2192 n shifted', 'autocomplete'],
  ['encoder-decoder',    'n \u2192 m',        'machine translation']
];
const RGR_TASKS = [
  {t:'named entity recognition', a:0, why:'One BIO tag per token, aligned one to one with the input.'},
  {t:'spam detection', a:1, why:'The whole message collapses to a single label.'},
  {t:'next-word suggestion on a keyboard', a:2, why:'Predict the next token from the prefix; the text supervises itself.'},
  {t:'summarization', a:3, why:'Document in, shorter unaligned text out: two sequences, different lengths.'},
  {t:'speech-to-text', a:3, why:'Feels like labeling, but audio frames and output characters do not align one to one, so it is an encoder-decoder shape.'},
  {t:'language identification', a:1, why:'One label for the whole input.'}
];
let _rgr = {i:0, right:0};
function rgrBuild(){ _rgr = {i:0, right:0}; rgrRender(); }
function rgrPick(k){
  if(_rgr.i >= RGR_TASKS.length) return;
  const T = RGR_TASKS[_rgr.i];
  T.got = k;
  if(k === T.a) _rgr.right++;
  _rgr.i++;
  rgrRender();
}
function rgrRender(){
  const done = _rgr.i >= RGR_TASKS.length;
  const T = RGR_TASKS[_rgr.i];
  mtSet('rgr-task', done
    ? 'All sorted. ' + _rgr.right + ' of ' + RGR_TASKS.length + ' on the first try.'
    : 'TASK ' + (_rgr.i+1) + ' OF ' + RGR_TASKS.length + ':  <b style="color:#A9D6FF">' + T.t + '</b>  \u2014 which shape?');
  mtSet('rgr-btns', done
    ? `<button style="${MTBTN}" onclick="rgrBuild()">sort again</button>`
    : RGR_Q.map((q,k)=>`<button style="${MTBTN}" onclick="rgrPick(${k})">${q[0]}</button>`).join(''));
  rgrDraw();
  const last = _rgr.i>0 ? RGR_TASKS[_rgr.i-1] : null;
  mtSet('rgr-cap', done
    ? 'The grid is the takeaway of the chapter so far: the recurrence is constant, and task design is choosing a cell.'
    : (last ? (last.got===last.a ? '<b style="color:var(--accent4)">Right.</b> ' : '<b style="color:var(--accent2)">It belongs in ' + RGR_Q[last.a][0] + '.</b> ') + last.why
            : 'Read the task, pick its input-output shape.'));
}
function rgrDraw(){
  const c = mtCtx('rgr-canvas', 210); if(!c) return;
  const {x, w} = c;
  const gw = (w-36)/2, gh = 88;
  RGR_Q.forEach((q, k)=>{
    const px = 12 + (k%2)*(gw+12), py = 10 + Math.floor(k/2)*(gh+12);
    mtChip(x, px, py, gw, gh, 'rgba(79,70,229,0.05)', MTC.line2, null);
    mtTxt(x, q[0], px+12, py+18, {size:10.5, col:MTC.a1, weight:'700'});
    mtTxt(x, q[1], px+gw-12, py+18, {size:9.5, col:MTC.a2, align:'right'});
    mtTxt(x, 'e.g. ' + q[2], px+12, py+36, {size:8.5, col:MTC.muted});
    const placed = RGR_TASKS.filter((t,i)=> i<_rgr.i && t.a===k);
    placed.forEach((t, j)=>{
      mtTxt(x, (t.got===t.a?'\u2713 ':'\u2192 ') + t.t, px+12, py+54+j*14,
            {size:8.5, col: t.got===t.a?MTC.a4:MTC.a5});
    });
  });
}

/* ══ 13.7 ENCODER-DECODER ═════════════════════════════════ */
RN_PAGES.rnenc = `
<div class="lesson-chapter-label">Section 13.7</div>
<h1 class="lesson-h1">When Input and Output Do Not Line Up</h1>
<p class="lesson-intro">Translation takes one sequence and produces another that can differ in length and order. An encoder summarizes the input, and a decoder uses that information to generate the output.</p>

<h2 class="lesson-h2">Why Labeling Machinery Fails Here</h2>
<p class="lesson-p">Sequence labeling worked because output \\(t\\) belonged to input \\(t\\). Translation breaks that everywhere at once: <em>the red balloon burst</em> has four words, <em>estall&oacute; el globo rojo</em> has four too, but the verb has moved from last to first, and in general the lengths will not even match. There is no position-by-position mapping to learn.</p>

<h2 class="lesson-h2">The Concatenation Trick</h2>
<p class="lesson-p">Section 13.3.3 observed that priming a generator with a prefix conditions everything after on it. Now use that observation industrially. Take the training pairs and simply concatenate each one: source, a separator token, target, all as one stream fed to one recurrent language model. Train as usual. At inference, feed the source plus separator and let the model &ldquo;continue&rdquo;: the continuation is the translation. During the source portion the model&rsquo;s outputs are computed and thrown away; it is only reading, building up state. After the separator its outputs become the point.</p>
<p class="lesson-p">Formally the model is still doing nothing but next-token prediction. The chain rule over the target,</p>
<div class="lesson-math">\\[p(y) = p(y_1)\\, p(y_2 \\mid y_1)\\, p(y_3 \\mid y_1, y_2) \\cdots p(y_m \\mid y_1, \\ldots, y_{m-1})\\]</div>
<p class="lesson-p">becomes, once the source \\(x\\) sits in the context before the separator, a <em>conditioned</em> factorization: every factor now gets the source for free, because the state that computes it has read the source:</p>
<div class="lesson-math">\\[p(y \\mid x) = p(y_1 \\mid x)\\, p(y_2 \\mid y_1, x) \\cdots p(y_m \\mid y_1, \\ldots, y_{m-1}, x)\\]</div>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; One Stream, Two Roles</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="rlmStep()">step</button>
      <button style="${MTBTN}" onclick="rlmReset()">reset</button>
    </div>
    <canvas id="rlm-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rlm-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">The Handoff, Made Explicit</h2>
<p class="lesson-p">The trick works, and abstracting it gives the clean version. Split the single network into two with separate weights: an <strong>encoder</strong>, which reads the source and whose outputs nobody looks at, and a <strong>decoder</strong>, which generates the target. The encoder&rsquo;s final state, the moment where the whole source has been read and nothing has been generated, is promoted to a named object: the <strong>context vector</strong> \\(\\mathbf{c}\\), the decoder&rsquo;s starting state:</p>
<div class="lesson-math">\\[\\mathbf{c} = \\mathbf{h}_n^{e}, \\qquad \\mathbf{h}_0^{d} = \\mathbf{c}, \\qquad \\mathbf{h}_t^{d} = g\\left(\\hat{y}_{t-1},\\, \\mathbf{h}_{t-1}^{d},\\, \\mathbf{c}\\right), \\qquad \\hat{\\mathbf{y}}_t = \\text{softmax}\\left(\\mathbf{h}_t^{d}\\right)\\]</div>
<p class="lesson-p">Note the extra \\(\\mathbf{c}\\) inside the decoder update: rather than trusting the context to survive being passed state-to-state through the whole target, better systems re-supply it at every step. The toggle below shows why: with \\(\\mathbf{c}\\) given only to the first state, its influence decays multiplicatively down the decoder, which is the vanishing story of 13.5 all over again, in miniature.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Context Handoff</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTN}" id="rcx-b0" onclick="rcxGo(0)">c to first state only</button>
      <button style="${MTBTN}" id="rcx-b1" onclick="rcxGo(1)">c to every state</button>
    </div>
    <canvas id="rcx-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rcx-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qrn-enc"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In the concatenation trick, what happens to the model&rsquo;s outputs while it reads the source portion?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-enc','Correct. During the source the model is only accumulating state; its next-token outputs are computed by the machinery but ignored, and generation begins after the separator.')">They are ignored; the model is only building up state until the separator</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-enc','If they were the translation, output position would have to align with source position, which is exactly what translation lacks.')">They are the translation, produced word by word during reading</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-enc','The outputs are not stored anywhere; the state alone carries the source forward.')">They are stored in a buffer and emitted after the separator</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-enc','Losses on the source portion are typically masked out, not doubled.')">They are compared against the source itself for an extra loss</button>
</div><div class="quiz-explain" id="qrn-enc-explain"></div></div>`;

/* ── One Stream, Two Roles ────────────────────────────────── */
const RLM_TOKS = ['the','red','balloon','burst','&lt;s&gt;','estall\u00F3','el','globo','rojo'];
const RLM_SEP = 4;
let _rlm = 0;
function rlmBuild(){ _rlm = 0; rlmDraw(); }
function rlmStep(){ _rlm = Math.min(RLM_TOKS.length, _rlm+1); rlmDraw(); }
function rlmReset(){ _rlm = 0; rlmDraw(); }
function rlmDraw(){
  const c = mtCtx('rlm-canvas', 210); if(!c) return;
  const {x, w} = c;
  const n = RLM_TOKS.length;
  const gap = Math.min(76, (w-24)/n), cw = Math.min(62, gap-6);
  const startX = (w - gap*(n-1) - cw)/2, hy = 96;
  for(let i=0;i<n;i++){
    const px = startX + i*gap;
    const read = i < _rlm, active = i === _rlm;
    const isSep = i===RLM_SEP, isSrc = i<RLM_SEP;
    if(i>0){
      x.strokeStyle = read||active ? MTC.a2 : MTC.line; x.lineWidth = read||active?1.8:1;
      x.beginPath(); x.moveTo(px-gap+cw+1, hy+15); x.lineTo(px-2, hy+15); x.stroke();
    }
    mtChip(x, px, hy, cw, 30,
      active ? 'rgba(165,104,14,0.2)' : (read ? (isSrc||isSep?'rgba(79,70,229,0.10)':'rgba(11,132,87,0.13)') : 'rgba(23,27,52,0.03)'),
      isSep ? MTC.a5 : (read||active ? (isSrc?MTC.a1:MTC.a4) : MTC.line),
      RLM_TOKS[i].replace('&lt;','<').replace('&gt;','>'), MTC.text, 9);
    // softmax output above
    const grey = isSrc || isSep;
    x.strokeStyle = grey ? MTC.line : MTC.a4; x.lineWidth = 1.2;
    if(read || active){
      x.beginPath(); x.moveTo(px+cw/2, hy-4); x.lineTo(px+cw/2, hy-22); x.stroke();
      mtChip(x, px+4, hy-46, cw-8, 22, grey?'rgba(23,27,52,0.04)':'rgba(11,132,87,0.12)',
             grey?MTC.line:MTC.a4, grey?'\u2298':'\u0177', grey?MTC.muted:MTC.a4, 9.5);
    }
  }
  mtTxt(x, 'SOURCE \u00b7 outputs ignored', startX, 30, {size:9, col:MTC.a1});
  mtTxt(x, 'TARGET \u00b7 outputs are the point', w-startX, 30, {size:9, col:MTC.a4, align:'right'});
  x.strokeStyle = MTC.a5; x.lineWidth = 1; x.setLineDash([4,4]);
  const sepX = startX + RLM_SEP*gap + cw/2;
  x.beginPath(); x.moveTo(sepX, 44); x.lineTo(sepX, 168); x.stroke(); x.setLineDash([]);
  mtSet('rlm-cap', _rlm===0 ? 'One recurrent language model, one stream: source, separator, target. Step through it.'
    : _rlm <= RLM_SEP
      ? 'Reading the source. The \u2298 marks show outputs the machinery computes but nothing consumes; the only product of this phase is the state.'
      : 'Past the separator. The state that entered this phase had read the entire source, so every prediction from here is conditioned on it: the continuation of the stream is the translation.');
}

/* ── Context Handoff ──────────────────────────────────────── */
let _rcx = 0;
function rcxBuild(){ _rcx = 0; rcxDraw(); }
function rcxGo(m){ _rcx = m; rcxDraw(); }
function rcxDraw(){
  [0,1].forEach(m=>{ const e = document.getElementById('rcx-b'+m); if(e){
    e.style.background = m===_rcx ? 'var(--accent)' : 'var(--surface2)';
    e.style.color = m===_rcx ? '#FAFBFF' : 'var(--muted)'; } });
  const c = mtCtx('rcx-canvas', 240); if(!c) return;
  const {x, w} = c;
  const nE = 3, nD = 4;
  const gap = Math.min(92, (w-140)/(nE+nD)), cw = Math.min(60, gap-10);
  const startX = 20, hy = 88;
  // encoder
  for(let i=0;i<nE;i++){
    const px = startX + i*gap;
    if(i>0){ x.strokeStyle = MTC.a1; x.lineWidth = 1.8;
      x.beginPath(); x.moveTo(px-gap+cw+1, hy+15); x.lineTo(px-2, hy+15); x.stroke(); }
    mtChip(x, px, hy, cw, 30, 'rgba(79,70,229,0.10)', MTC.a1, 'h\u1D49'+(i+1), MTC.text, 9);
  }
  mtTxt(x, 'ENCODER', startX, 66, {size:9, col:MTC.a1});
  // context
  const cx2 = startX + (nE-1)*gap + cw + 14;
  mtChip(x, cx2, hy+2, 34, 26, 'rgba(11,132,87,0.22)', MTC.a4, 'c', MTC.a4, 12);
  mtTxt(x, '= h\u1D49\u2099, renamed', cx2+17, hy+44, {size:8, col:MTC.a4, align:'center'});
  x.strokeStyle = MTC.a4; x.lineWidth = 2.2;
  x.beginPath(); x.moveTo(startX+(nE-1)*gap+cw+1, hy+15); x.lineTo(cx2-2, hy+15); x.stroke();
  // decoder
  const dStart = cx2 + 48;
  for(let i=0;i<nD;i++){
    const px = dStart + i*gap;
    if(i>0){ x.strokeStyle = MTC.a2; x.lineWidth = 1.8;
      x.beginPath(); x.moveTo(px-gap+cw+1, hy+15); x.lineTo(px-2, hy+15); x.stroke(); }
    const infl = _rcx===1 ? 1 : Math.pow(0.62, i);
    mtChip(x, px, hy, cw, 30, 'rgba(159,18,57,'+(0.05+infl*0.14).toFixed(3)+')', MTC.a2, 'h\u1D48'+(i+1), MTC.text, 9);
    // c feed arrows
    const feed = _rcx===1 || i===0;
    if(feed){
      x.strokeStyle = 'rgba(11,132,87,'+(_rcx===1?0.8:0.9)+')'; x.lineWidth = 1.6; x.setLineDash(_rcx===1&&i>0?[3,3]:[]);
      x.beginPath(); x.moveTo(cx2+17, hy+30);
      x.bezierCurveTo(cx2+17, hy+72, px+cw/2, hy+72, px+cw/2, hy+32); x.stroke(); x.setLineDash([]);
    }
    // influence meter
    mtRR(x, px+6, hy+96, cw-12, 10, 3); x.fillStyle='rgba(23,27,52,0.05)'; x.fill();
    mtRR(x, px+6, hy+96, Math.max(2,(cw-12)*infl), 10, 3); x.fillStyle = MTC.a4; x.fill();
    mtTxt(x, (infl*100).toFixed(0)+'%', px+cw/2, hy+120, {size:7.5, col:MTC.muted, align:'center'});
  }
  mtTxt(x, 'DECODER', dStart, 66, {size:9, col:MTC.a2});
  mtTxt(x, 'influence of c on each step', dStart, hy+140, {size:8.5, col:MTC.muted});
  mtSet('rcx-cap', _rcx===0
    ? 'The context enters only as h\u1D48\u2080 and must survive being passed state to state. By the fourth generated word its influence has decayed to a fraction, and long targets drift away from the source: the vanishing problem, replayed inside the decoder.'
    : 'Re-supplying c at every decoder step keeps the source at full strength throughout generation. This is the standard wiring, and it sets up the final question of the chapter: if re-supplying one fixed summary helps, what about a summary tailored to each step?');
}

/* ══ 13.7.1 TRAINING THE PAIR ═════════════════════════════ */
RN_PAGES.rnteach = `
<div class="lesson-chapter-label">Section 13.7.1</div>
<h1 class="lesson-h1">Training on Paired Strings</h1>
<p class="lesson-intro">Training the encoder-decoder needs a corpus of source-target pairs and the same cross-entropy machinery as always: total loss is the average of the per-word surprises along the gold target,</p>
<div class="lesson-math">\\[L = \\frac{1}{T} \\sum_{i=1}^{T} L_i, \\qquad L_i = -\\log P\\left(y_i\\right)\\]</div>
<p class="lesson-intro">The one genuinely new issue is a mismatch between how the decoder is trained and how it must eventually run, and the cleanest way to see it is to run both regimes on the same sentence simultaneously.</p>

<h2 class="lesson-h2">Two Regimes, One Model</h2>
<p class="lesson-p">During <strong>training</strong>, teacher forcing feeds the decoder the gold target token at every step regardless of what it predicted, so each position learns against an honest context and one mistake stays one mistake. During <strong>inference</strong> there is no gold target; the decoder&rsquo;s own sampled output at step \\(t\\) becomes its input at step \\(t+1\\), so an error does not stay put. It enters the state, conditions the next prediction, and compounds.</p>
<p class="lesson-p">The model therefore trains in a world where its inputs are always correct and runs in a world where they are only as good as its own last guess, a gap known as <strong>exposure bias</strong>. The split screen below injects one error into both regimes and lets you watch it be absorbed on one side and metastasize on the other.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Training vs. Inference, in Lockstep</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="rspStep()">step both</button>
      <button style="${MTBTN}" onclick="rspReset()">reset</button>
      <button style="${MTBTN}" id="rsp-inj" onclick="rspInject()">inject an error at step 2</button>
    </div>
    <canvas id="rsp-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rsp-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qrn-te"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What is exposure bias?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-te','Correct. Teacher forcing trains every step against gold context, but at inference the context is the model\u2019s own possibly wrong output, a distribution it never trained on.')">The model trains on gold contexts but runs on its own, possibly wrong, outputs</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-te','Data skew is a real problem but a different one; exposure bias exists even with perfectly balanced data.')">The model sees some training examples more often than others</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-te','Overfitting concerns generalization across examples; exposure bias is a train-time versus run-time mismatch within each example.')">The model memorizes the training targets</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-te','The encoder behaves identically in both regimes; the mismatch lives entirely in the decoder\u2019s input.')">The encoder is exposed to longer sequences than the decoder</button>
</div><div class="quiz-explain" id="qrn-te-explain"></div></div>`;

/* ── Split Screen ─────────────────────────────────────────── */
const RSP_GOLD = ['estall\u00F3','el','globo','rojo'];
const RSP_DRIFT = ['estall\u00F3','un','juguete','viejo'];
const RSP_LOSS_OK = [0.4, 0.5, 0.6, 0.3];
const RSP_LOSS_TR = [0.4, 2.3, 0.7, 0.4];
const RSP_LOSS_IN = [0.4, 2.3, 1.9, 2.6];
let _rsp = {t:0, inj:false};
function rspBuild(){ _rsp = {t:0, inj:false}; rspDraw(); }
function rspStep(){ _rsp.t = Math.min(RSP_GOLD.length, _rsp.t+1); rspDraw(); }
function rspReset(){ _rsp = {t:0, inj:false}; rspDraw(); }
function rspInject(){ _rsp.inj = !_rsp.inj; rspDraw(); }
function rspDraw(){
  const b = document.getElementById('rsp-inj');
  if(b){ b.style.background = _rsp.inj?'var(--accent2)':'var(--surface2)'; b.style.color = _rsp.inj?'#FAFBFF':'var(--muted)'; }
  const c = mtCtx('rsp-canvas', 260); if(!c) return;
  const {x, w} = c;
  const half = (w-40)/2;
  const panel = (ox, title, toks, losses, feedsSelf)=>{
    mtTxt(x, title, ox, 22, {size:9.5, col: feedsSelf?MTC.a2:MTC.a1, weight:'700'});
    const n = RSP_GOLD.length;
    const gap = Math.min(84, (half-10)/n), cw2 = Math.min(64, gap-8);
    for(let i=0;i<n;i++){
      const px = ox + i*gap;
      const shown = i < _rsp.t;
      const wrong = _rsp.inj && ((feedsSelf && i>=1) || (!feedsSelf && i===1));
      // input row: what feeds the decoder
      const inTok = !feedsSelf ? RSP_GOLD[i] : (_rsp.inj && i>=1 ? RSP_DRIFT[i] : RSP_GOLD[i]);
      mtChip(x, px, 40, cw2, 26, shown ? (wrong&&(feedsSelf?i>=1:false) ? 'rgba(159,18,57,0.14)' : 'rgba(79,70,229,0.09)') : 'rgba(23,27,52,0.03)',
        shown && feedsSelf && _rsp.inj && i>=1 ? MTC.a2 : MTC.line, shown ? inTok : '\u00b7', MTC.text, 8.5);
      // prediction row
      const outTok = feedsSelf && _rsp.inj && i>=1 ? RSP_DRIFT[Math.min(i+0, RSP_DRIFT.length-1)] : RSP_GOLD[i];
      mtChip(x, px, 92, cw2, 26, shown ? (wrong ? 'rgba(159,18,57,0.14)' : 'rgba(11,132,87,0.10)') : 'rgba(23,27,52,0.03)',
        shown ? (wrong ? MTC.a2 : MTC.a4) : MTC.line, shown ? outTok : '\u00b7', MTC.text, 8.5);
      if(feedsSelf && shown && i<n-1){
        x.strokeStyle = MTC.a2; x.lineWidth = 1.2; x.setLineDash([2,3]);
        x.beginPath(); x.moveTo(px+cw2/2+6, 118); x.bezierCurveTo(px+gap, 134, px+gap, 134, px+gap+cw2/2-6, 68); x.stroke(); x.setLineDash([]);
      }
      // loss bar
      if(shown){
        const L2 = losses[i], bh = Math.min(64, L2*24);
        x.fillStyle = L2 > 1 ? 'rgba(159,18,57,0.75)' : 'rgba(79,70,229,0.6)';
        mtRR(x, px+cw2/2-11, 208-bh, 22, bh, 3); x.fill();
        mtTxt(x, L2.toFixed(1), px+cw2/2, 220, {size:8, col: L2>1?MTC.a2:MTC.muted, align:'center'});
      }
    }
    mtTxt(x, feedsSelf ? 'input = own previous output' : 'input = gold token', ox, 78, {size:8, col:MTC.muted});
    const tot = losses.slice(0, _rsp.t).reduce((a,v)=>a+v, 0);
    mtTxt(x, 'L = ' + (_rsp.t? (tot/_rsp.t).toFixed(2) : '\u2013'), ox+half-14, 22, {size:10, col: tot/_rsp.t>1?MTC.a2:MTC.a4, align:'right', weight:'700'});
  };
  panel(16, 'TRAINING \u00b7 teacher forcing', RSP_GOLD, _rsp.inj?RSP_LOSS_TR:RSP_LOSS_OK, false);
  x.strokeStyle = MTC.line2; x.lineWidth = 1; x.setLineDash([4,4]);
  x.beginPath(); x.moveTo(w/2, 14); x.lineTo(w/2, 240); x.stroke(); x.setLineDash([]);
  panel(w/2+16, 'INFERENCE \u00b7 self-feeding', RSP_GOLD, _rsp.inj?RSP_LOSS_IN:RSP_LOSS_OK, true);
  mtSet('rsp-cap', !_rsp.inj
    ? 'With no errors the two regimes are indistinguishable. Inject one at step 2 and step through again.'
    : 'The same error, two fates. On the left the next input is the gold token regardless, so the damage is one bad loss and it ends there. On the right the wrong word became the next input: every later state is conditioned on text that drifts further from the target, and the losses climb instead of recovering. This is the regime gap the model must survive at run time.');
}

/* ══ 13.8 ATTENTION ═══════════════════════════════════════ */
RN_PAGES.rnattn = `
<div class="lesson-chapter-label">Section 13.8</div>
<h1 class="lesson-h1">Letting the Decoder Look Anywhere in the Source</h1>
<p class="lesson-intro">The encoder-decoder has one remaining structural flaw, and it is the same flaw wearing its third costume: everything the decoder will ever know about the source must fit through the single fixed-size vector \\(\\mathbf{c}\\). For a six-word sentence, fine. For a sixty-word sentence, a few hundred numbers are being asked to hold sixty words&rsquo; worth of detail, and something has to be thrown away.</p>

<h2 class="lesson-h2">Squeezing the Bottleneck</h2>
<p class="lesson-p">The failure has a signature: quality degrades with source length, and the <em>beginning</em> of the source degrades first, since it has been folded through the most state updates by the time \\(\\mathbf{c}\\) is read off the end. Drag the slider and watch the pinch.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Bottleneck, Squeezed</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <span style="${MTLBL}">source length</span>
      <input id="rbn-n" type="range" min="4" max="20" step="2" value="6" oninput="rbnDraw()" style="width:170px;accent-color:var(--accent)">
      <span id="rbn-l" style="${MTLBL}"></span>
    </div>
    <canvas id="rbn-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="rbn-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">The Fix, Derived in Four Steps</h2>
<p class="lesson-p">The wasteful part is obvious in hindsight: the encoder computed a state at <em>every</em> source position, a whole sequence of per-word summaries, and then the handoff kept only the last one. <strong>Attention</strong> keeps them all, and replaces the fixed \\(\\mathbf{c}\\) with a context \\(\\mathbf{c}_i\\) rebuilt fresh for each decoder step \\(i\\), so the decoder update becomes</p>
<div class="lesson-math">\\[\\mathbf{h}_i^{d} = g\\left(\\hat{y}_{i-1},\\, \\mathbf{h}_{i-1}^{d},\\, \\mathbf{c}_i\\right)\\]</div>
<p class="lesson-p"><strong>Step 1, score.</strong> How relevant is each source position \\(j\\) to what the decoder is about to do? The simplest relevance measure between two vectors is their dot product, taken against the decoder&rsquo;s current situation \\(\\mathbf{h}_{i-1}^{d}\\):</p>
<div class="lesson-math">\\[\\text{score}\\left(\\mathbf{h}_{i-1}^{d}, \\mathbf{h}_j^{e}\\right) = \\mathbf{h}_{i-1}^{d} \\cdot \\mathbf{h}_j^{e}\\]</div>
<p class="lesson-p"><strong>Step 2, normalize.</strong> Raw scores are arbitrary reals; a softmax turns them into a proper distribution over source positions, weights that are positive and sum to 1:</p>
<div class="lesson-math">\\[\\alpha_{ij} = \\frac{\\exp\\left(\\text{score}\\left(\\mathbf{h}_{i-1}^{d}, \\mathbf{h}_j^{e}\\right)\\right)}{\\sum_{k} \\exp\\left(\\text{score}\\left(\\mathbf{h}_{i-1}^{d}, \\mathbf{h}_k^{e}\\right)\\right)}\\]</div>
<p class="lesson-p"><strong>Steps 3 and 4, weight and sum.</strong> Scale each encoder state by its weight and add them up. The result is a context vector that is mostly whatever the decoder currently needs:</p>
<div class="lesson-math">\\[\\mathbf{c}_i = \\sum_{j} \\alpha_{ij}\\, \\mathbf{h}_j^{e}\\]</div>
<p class="lesson-p">The fixed bottleneck is gone: no single vector ever has to hold the whole source, because each step retrieves its own mixture. And since the weights \\(\\alpha_{ij}\\) say which source words mattered for which target words, laying them out as a grid draws, for free, a soft alignment between the two sentences.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Attention Spotlight</span></div>
  <div class="viz-body">
    <div style="${MTROW}">
      <button style="${MTBTNA}" onclick="rasStage()">advance stage</button>
      <span style="${MTLBL}">decoder step</span>
      <input id="ras-i" type="range" min="0" max="3" step="1" value="0" oninput="rasScrub(this.value)" style="width:120px;accent-color:var(--accent)">
      <button style="${MTBTN}" id="ras-bl" onclick="rasBil()">scoring: dot product</button>
    </div>
    <canvas id="ras-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="ras-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">A More Flexible Score</h2>
<p class="lesson-p">The dot product demands that the two vectors live in the same space with the same dimensionality, and it hard-codes the assumption that similarity equals relevance. Inserting a learned matrix between them relaxes both constraints at once:</p>
<div class="lesson-math">\\[\\text{score}\\left(\\mathbf{h}_{i-1}^{d}, \\mathbf{h}_j^{e}\\right) = \\mathbf{h}_{i-1}^{d}\\, \\mathbf{W}_s\\, \\mathbf{h}_j^{e}\\]</div>
<p class="lesson-p">With \\(\\mathbf{W}_s\\) of shape \\(d_d \\times d_e\\), the decoder and encoder may use different dimensions, and the network <em>learns</em> what counts as relevant rather than inheriting raw geometric similarity. Toggle the scoring function above to see \\(\\mathbf{W}_s\\) slot into the circuit. This bilinear form is one small step from the full query-key-value attention of the transformer chapter, where both sides get their own learned projection and the recurrence is removed entirely; this section is the hinge on which the book turns.</p>

<div class="quiz-block" id="qrn-at"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">How does attention eliminate the fixed-vector bottleneck?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qrn-at','Correct. All encoder states are kept, and every decoder step computes its own weighted mixture of them, so no single vector must summarize the entire source.')">Each decoder step builds a fresh weighted average over all encoder states</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-at','Enlarging c postpones the problem at growing cost; attention removes the single-summary requirement instead.')">It makes the context vector much larger</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-at','The encoder runs exactly as before; what changes is that its intermediate states are finally used.')">It replaces the encoder with a second decoder</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qrn-at','Attention weights are recomputed from scratch at every step from the current decoder state, not fixed in advance.')">It assigns each source word a fixed weight before decoding begins</button>
</div><div class="quiz-explain" id="qrn-at-explain"></div></div>`;

/* ── Bottleneck Squeezed ──────────────────────────────────── */
function rbnDraw(){
  const n = +(document.getElementById('rbn-n')||{value:6}).value;
  mtSet('rbn-l', n + ' words');
  const c = mtCtx('rbn-canvas', 210); if(!c) return;
  const {x, w} = c;
  const cw = Math.min(52, (w-160)/n - 4);
  const startX = 20, ty = 40;
  const cap = 6;   // vector "slots"
  for(let i=0;i<n;i++){
    const px = startX + i*(cw+4);
    const keep = Math.min(1, cap/n) * Math.pow(0.94, n-1-i) * (n<=cap?1:1);
    const retention = Math.min(1, (cap/n)) * Math.pow(1.35, (i-(n-1))/(n));
    const r = Math.min(1, (cap/n) * Math.pow(2.2, (i/(n-1))-1) * 1.6);
    mtChip(x, px, ty, cw, 28, 'rgba(79,70,229,'+(0.06+r*0.5).toFixed(3)+')', MTC.line, 'w'+(i+1), r>0.4?MTC.text:MTC.muted, 8.5);
    mtRR(x, px+4, ty+36, cw-8, 8, 2); x.fillStyle='rgba(23,27,52,0.05)'; x.fill();
    mtRR(x, px+4, ty+36, Math.max(1,(cw-8)*r), 8, 2); x.fillStyle = r<0.35?MTC.a2:MTC.a4; x.fill();
    // funnel lines
    x.strokeStyle = 'rgba(79,70,229,'+(0.12+r*0.3).toFixed(2)+')'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(px+cw/2, ty+50); x.lineTo(w/2, 152); x.stroke();
  }
  mtTxt(x, 'per-word retention inside c', startX, ty+62, {size:8.5, col:MTC.muted});
  // the vector
  const vx = w/2-70;
  mtChip(x, vx, 152, 140, 30, 'rgba(11,132,87,0.16)', MTC.a4, null);
  for(let s2=0;s2<cap;s2++){
    x.fillStyle = 'rgba(11,132,87,0.5)';
    x.fillRect(vx+10+s2*21, 160, 16, 14);
  }
  mtTxt(x, 'c \u00b7 fixed size, ' + cap + ' slots', w/2, 196, {size:9, col:MTC.a4, align:'center'});
  const lost = Math.max(0, n-cap);
  mtSet('rbn-cap', n<=cap
    ? 'At ' + n + ' words the source fits: every word keeps a healthy share of the vector.'
    : 'The vector did not grow; the sentence did. Roughly ' + lost + ' words\u2019 worth of detail now has nowhere to live, and the red bars show who pays: the earliest words, folded through the most updates before c was read, fade first. Quality on long sentences falls exactly this way.');
}

/* ── Attention Spotlight ──────────────────────────────────── */
const RAS_SRC = ['the','red','balloon','burst'];
const RAS_TGT = ['estall\u00F3','el','globo','rojo'];
const RAS_A_DOT = [
  [0.08,0.05,0.17,0.70],
  [0.62,0.08,0.22,0.08],
  [0.06,0.10,0.76,0.08],
  [0.07,0.74,0.13,0.06]
];
const RAS_A_BIL = [
  [0.04,0.03,0.09,0.84],
  [0.71,0.05,0.18,0.06],
  [0.04,0.06,0.85,0.05],
  [0.04,0.83,0.09,0.04]
];
let _ras = {i:0, stage:0, bil:false};
function rasBuild(){ _ras = {i:0, stage:0, bil:false}; rasDraw(); }
function rasStage(){ _ras.stage = (_ras.stage+1)%4; rasDraw(); }
function rasScrub(v){ _ras.i = Math.max(0, Math.min(3, Math.round(+v))); _ras.stage = 3; rasDraw(); }
function rasBil(){ _ras.bil = !_ras.bil; rasDraw(); }
function rasDraw(){
  const b = document.getElementById('ras-bl');
  if(b){ b.textContent = 'scoring: ' + (_ras.bil ? 'bilinear h W\u209B h' : 'dot product');
         b.style.background = _ras.bil?'var(--accent)':'var(--surface2)'; b.style.color = _ras.bil?'#FAFBFF':'var(--muted)'; }
  const sl = document.getElementById('ras-i'); if(sl) sl.value = _ras.i;
  const c = mtCtx('ras-canvas', 300); if(!c) return;
  const {x, w} = c;
  const A = (_ras.bil ? RAS_A_BIL : RAS_A_DOT)[_ras.i];
  const n = RAS_SRC.length;
  const gap = Math.min(96, (w-260)/n), cw = Math.min(70, gap-10);
  const startX = 20, ey = 92;
  const stages = ['1 \u00b7 SCORE', '2 \u00b7 NORMALIZE', '3 \u00b7 WEIGHT', '4 \u00b7 SUM'];
  mtTxt(x, 'STAGE ' + stages[_ras.stage] + ' \u00b7 generating \u201C' + RAS_TGT[_ras.i] + '\u201D', 20, 22, {size:10, col:MTC.a5, weight:'700'});
  // decoder state
  const dx = 20, dy2 = 216;
  mtChip(x, dx, dy2, 96, 30, 'rgba(159,18,57,0.13)', MTC.a2, 'h\u1D48 (step '+(_ras.i+1)+')', MTC.text, 9);
  // encoder states
  const raw = A.map(a=>Math.log(a*40+0.5));
  RAS_SRC.forEach((tkn, j)=>{
    const px = startX + j*gap;
    const a = A[j];
    const wt = _ras.stage>=2 ? a : 1;
    mtChip(x, px, ey, cw, 30, 'rgba(79,70,229,'+(0.06+(_ras.stage>=2? a*0.6 : 0.12)).toFixed(3)+')', MTC.a1, null);
    mtTxt(x, 'h\u1D49'+(j+1), px+cw/2, ey+15, {size:9.5, col:MTC.text, align:'center'});
    mtChip(x, px+6, ey+38, cw-12, 20, 'transparent', null, tkn, MTC.muted, 8.5);
    // score line from decoder
    if(_ras.stage>=0){
      x.strokeStyle = 'rgba(159,18,57,'+(_ras.stage>=2 ? (0.15+a*0.7) : 0.4).toFixed(2)+')';
      x.lineWidth = _ras.stage>=2 ? 1+a*4 : 1.4;
      x.beginPath(); x.moveTo(dx+48, dy2-2);
      if(_ras.bil){
        x.lineTo(dx+48, 178); x.lineTo(px+cw/2, 148); x.lineTo(px+cw/2, ey+32);
      } else {
        x.bezierCurveTo(dx+48, 160, px+cw/2, 160, px+cw/2, ey+32);
      }
      x.stroke();
    }
    // numbers
    if(_ras.stage===0) mtTxt(x, raw[j].toFixed(2), px+cw/2, ey-14, {size:9, col:MTC.a2, align:'center'});
    if(_ras.stage>=1) mtTxt(x, '\u03B1='+a.toFixed(2), px+cw/2, ey-14, {size:9, col: a>0.4?MTC.a2:MTC.muted, align:'center', weight: a>0.4?'700':''});
  });
  if(_ras.bil){
    mtChip(x, dx+20, 140, 56, 24, 'rgba(165,104,14,0.16)', MTC.a5, 'W\u209B', MTC.a5, 10);
    mtTxt(x, 'd_d \u00d7 d_e', dx+48, 178, {size:7.5, col:MTC.muted, align:'center'});
  }
  // context vector
  if(_ras.stage>=3){
    const cx2 = w-210;
    mtChip(x, cx2, ey-2, 92, 32, 'rgba(11,132,87,0.18)', MTC.a4, 'c'+(_ras.i+1), MTC.a4, 12);
    mtTxt(x, '= \u03A3 \u03B1 h\u1D49', cx2+46, ey+44, {size:9, col:MTC.a4, align:'center'});
    x.strokeStyle = MTC.a4; x.lineWidth = 2;
    x.beginPath(); x.moveTo(startX+(n-1)*gap+cw+4, ey+14); x.lineTo(cx2-4, ey+14); x.stroke();
  }
  // heatmap of visited steps
  const hx = w-108, hy2 = 150, cell = 22;
  mtTxt(x, '\u03B1 grid', hx, hy2-10, {size:8.5, col:MTC.muted});
  const M = _ras.bil ? RAS_A_BIL : RAS_A_DOT;
  for(let i2=0;i2<4;i2++) for(let j=0;j<4;j++){
    const on = i2 <= _ras.i;
    x.fillStyle = on ? 'rgba(79,70,229,'+(M[i2][j]*0.9).toFixed(2)+')' : 'rgba(23,27,52,0.04)';
    x.fillRect(hx+j*cell, hy2+i2*cell, cell-2, cell-2);
  }
  RAS_SRC.forEach((s2,j)=> mtTxt(x, s2[0], hx+j*cell+cell/2-1, hy2-0+4*cell+8, {size:7.5, col:MTC.muted, align:'center'}));
  RAS_TGT.forEach((t2,i2)=> mtTxt(x, t2.slice(0,4), hx-4, hy2+i2*cell+cell/2, {size:7.5, col:MTC.muted, align:'right'}));
  const caps = [
    'Score: the decoder\u2019s current state is compared against every encoder state' + (_ras.bil ? ' through the learned matrix W\u209B, which also reconciles their dimensions.' : ' by dot product; same dimension required on both sides.'),
    'Normalize: a softmax turns the raw scores into weights \u03B1 that are positive and sum to 1, a distribution over source positions.',
    'Weight: each encoder state is scaled by its \u03B1; line thickness now shows where this step\u2019s spotlight fell. Generating \u201C' + RAS_TGT[_ras.i] + '\u201D pulls hardest on \u201C' + RAS_SRC[A.indexOf(Math.max(...A))] + '\u201D.',
    'Sum: the weighted states collapse into c'+(_ras.i+1)+', a context built for this step alone. Scrub the decoder step and the spotlight moves; the accumulating grid on the right is a soft alignment between the sentences, produced as a side effect.'
  ];
  mtSet('ras-cap', caps[_ras.stage]);
}

/* ══ 13.9 RECAP MAP ═══════════════════════════════════════ */
RN_PAGES.rnmap = `
<div class="lesson-chapter-label">Section 13.9</div>
<h1 class="lesson-h1">The Chapter in One Map</h1>
<p class="lesson-intro">Review how the recurrent architectures fit together, from a simple hidden state to gates and attention. Each node links to the section that explains it.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Recurrence Map</span></div>
  <div class="viz-body">
    <canvas id="rmp-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="rmp-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Read it left to right. Sequences need memory, and a single recurrent edge provides it (13.1), at the price of strictly sequential computation (13.1.1) and an error signal that must travel backward through time (13.1.2). As a language model the state removes the fixed window (13.2), but the gradient derivation shows long-range signal decaying as \\(\\gamma^k\\) (13.5), so the LSTM re-routes memory through an additive, gated cell state whose decay is learned rather than fixed. One architecture then serves four output wirings (13.3, 13.6), and the hardest wiring, sequence to unaligned sequence, is solved by the encoder-decoder handoff (13.7), whose single context vector immediately becomes the new bottleneck (13.8), which attention removes by rebuilding the context at every step from all encoder states.</p>
<p class="lesson-p">One sentence of foreshadowing, because it is the point of everything above: attention began as a patch on the recurrent bottleneck, and then the transformer asked what remains if the recurrence is deleted and attention is all that is left. The answer is the next part of this course, and both of the problems this chapter fought hardest, the sequential bottleneck of 13.1.1 and the decay of 13.5, disappear with the recurrence that caused them.</p>`;

/* ── Recurrence Map ───────────────────────────────────────── */
const RMP_N = [
  {id:'rnloop',  lab:'sequences need memory', sub:'13.1',  kind:'p', x:.05, y:.18},
  {id:'rnloop',  lab:'RNN: recurrent state',  sub:'13.1',  kind:'f', x:.26, y:.18},
  {id:'rnlstm',  lab:'long context decays',   sub:'13.5',  kind:'p', x:.47, y:.18},
  {id:'rnlstm',  lab:'LSTM: gated cell',      sub:'13.5',  kind:'f', x:.68, y:.18},
  {id:'rnenc',   lab:'lengths do not match',  sub:'13.7',  kind:'p', x:.26, y:.62},
  {id:'rnenc',   lab:'encoder-decoder',       sub:'13.7',  kind:'f', x:.47, y:.62},
  {id:'rnattn',  lab:'c is a bottleneck',     sub:'13.8',  kind:'p', x:.68, y:.62},
  {id:'rnattn',  lab:'attention',             sub:'13.8',  kind:'f', x:.88, y:.62}
];
const RMP_E = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]];
let _rmp = {hot:null};
function rmpBuild(){
  const cv = document.getElementById('rmp-canvas');
  if(cv && !cv._mt){
    cv._mt = 1;
    cv.addEventListener('mousemove', e=>{
      const r = cv.getBoundingClientRect();
      const hit = rmpHit(e.clientX-r.left, e.clientY-r.top, r.width, cv.clientHeight||220);
      if(hit !== _rmp.hot){ _rmp.hot = hit; rmpDraw(); }
    });
    cv.addEventListener('click', e=>{
      const r = cv.getBoundingClientRect();
      const hit = rmpHit(e.clientX-r.left, e.clientY-r.top, r.width, cv.clientHeight||220);
      if(hit !== null) openRNSec(RMP_N[hit].id);
    });
  }
  rmpDraw();
}
function rmpPt(nd, w, h){ return {x: 16 + nd.x*(w-130), y: 20 + nd.y*(h-70)}; }
function rmpHit(mx, my, w, h){
  let hit = null;
  RMP_N.forEach((nd, i)=>{ const p = rmpPt(nd, w, h);
    if(mx > p.x-6 && mx < p.x+112 && my > p.y-6 && my < p.y+36) hit = i; });
  return hit;
}
function rmpDraw(){
  const c = mtCtx('rmp-canvas', 230); if(!c) return;
  const {x, w, h} = c;
  RMP_E.forEach(([a, b])=>{
    const pa = rmpPt(RMP_N[a], w, h), pb = rmpPt(RMP_N[b], w, h);
    const on = _rmp.hot===a || _rmp.hot===b;
    x.strokeStyle = on ? MTC.a1 : 'rgba(23,27,52,0.18)';
    x.lineWidth = on ? 1.8 : 1;
    x.beginPath(); x.moveTo(pa.x+104, pa.y+15);
    x.bezierCurveTo(pa.x+130, pa.y+15, pb.x-26, pb.y+15, pb.x-2, pb.y+15);
    x.stroke();
    x.beginPath(); x.moveTo(pb.x-2, pb.y+15); x.lineTo(pb.x-9, pb.y+11); x.lineTo(pb.x-9, pb.y+19); x.closePath();
    x.fillStyle = on ? MTC.a1 : 'rgba(23,27,52,0.18)'; x.fill();
  });
  RMP_N.forEach((nd, i)=>{
    const p = rmpPt(nd, w, h), on = _rmp.hot===i;
    const prob = nd.kind==='p';
    mtChip(x, p.x, p.y, 104, 30,
      on ? (prob?'rgba(159,18,57,0.16)':'rgba(11,132,87,0.16)') : (prob?'rgba(159,18,57,0.06)':'rgba(11,132,87,0.07)'),
      prob ? MTC.a2 : MTC.a4, null);
    mtTxt(x, nd.lab, p.x+52, p.y+11, {size:8, col:MTC.text, align:'center', weight: on?'700':''});
    mtTxt(x, (prob?'problem \u00b7 ':'fix \u00b7 ') + nd.sub, p.x+52, p.y+23, {size:7, col: prob?MTC.a2:MTC.a4, align:'center'});
  });
  mtSet('rmp-cap', _rmp.hot !== null
    ? 'Click to open <b>' + RMP_N[_rmp.hot].lab + '</b> (' + RMP_N[_rmp.hot].sub + ').'
    : 'Crimson nodes are problems, green nodes are fixes, and every fix creates the next problem. Click any node to revisit its section.');
}

/* ── SECTION OPENER ───────────────────────────────────────── */
function openRNSec(id){
  const pg = RN_PAGES[id];
  if(!pg) return;
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if(!sv || !sb) return;
  const sec = RN_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if(crumb && sec) crumb.innerHTML = 'RNNs and LSTMs <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  renderMath(sb);
  mcSectionDelay(()=>{
    if(id==='rnloop')  rufDraw();
    if(id==='rnfwd')   rsqBuild();
    if(id==='rnbptt')  rbpBuild();
    if(id==='rnlm')    rchDraw();
    if(id==='rninf')   rshDraw();
    if(id==='rntrain') rsaBuild();
    if(id==='rntie')   rtfBuild();
    if(id==='rnjobs')  rwsBuild();
    if(id==='rntag')   rtlBuild();
    if(id==='rncls')   rfuBuild();
    if(id==='rngen')   rfcRoll();
    if(id==='rnstack') rstDraw();
    if(id==='rnbi')    rbiBuild();
    if(id==='rnlstm'){ ragBuild(); rgdDraw(); rgbBuild(); }
    if(id==='rnunit')  ruzBuild();
    if(id==='rngrid')  rgrBuild();
    if(id==='rnenc'){  rlmBuild(); rcxBuild(); }
    if(id==='rnteach') rspBuild();
    if(id==='rnattn'){ rbnDraw(); rasBuild(); }
    if(id==='rnmap')   rmpBuild();
  }, 120);
  sv.onscroll = () => {
    const hh = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if(bar) bar.style.width = (hh>0?(sv.scrollTop/hh)*100:0)+'%';
  };
}
