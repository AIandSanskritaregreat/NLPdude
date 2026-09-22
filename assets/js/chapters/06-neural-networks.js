// ════════════════════════════════════════════════════════════
//  CHAPTER 6 · NEURAL NETWORKS
// ════════════════════════════════════════════════════════════

// ── NN SECTION CARDS ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════
// CHAPTER 6 · NEURAL NETWORKS  (rebuilt)
// 7 sections + subsections, live instruments.
// Reuses shared lr* helpers; keeps the full-screen playground
// engine (openNNPlayground / pg*) that follows this block.
// New code is prefixed nn* to avoid collisions.
// ═══════════════════════════════════════════════════════════

const NN_SEC = [
  {id:'neuron',   num:'6.1', title:'The Neuron',                  icon:'\u03A3', desc:'One unit: a weighted sum, a bias, and a squashing curve. Sigmoid, tanh, ReLU, and saturation.', tags:['weighted sum','activation','saturation']},
  {id:'xor',      num:'6.2', title:'Why One Neuron Isn\u2019t Enough', icon:'\u2295', desc:'The XOR problem, linear inseparability, and how a hidden layer bends space to fix it.',       tags:['XOR','separability','hidden layer']},
  {id:'ffn',      num:'6.3', title:'Stacking Units Into a Network', icon:'\u2192', desc:'Layers, full connectivity, the weight matrix, and why non-linearity is non-negotiable.',        tags:['layers','matrices','softmax']},
  {id:'nlpclass', num:'6.4', title:'Networks for Text',           icon:'C', desc:'A logistic regression sentiment model grows a hidden layer, plus live features and vectorization.', tags:['sentiment','hidden features','vectorizing']},
  {id:'embin',    num:'6.5', title:'Feeding Words In as Embeddings', icon:'E', desc:'One-hot lookup, pooling vs. concatenation, and the neural language model\u2019s generalization win.', tags:['embedding lookup','pooling','LM']},
  {id:'training', num:'6.6', title:'Training a Network',          icon:'\u2207', desc:'Cross-entropy loss, computation graphs, and backpropagation built up from nothing.',            tags:['loss','comp-graph','backprop']},
  {id:'nnrecap',  num:'6.7', title:'The Whole Network, End to End', icon:'\u25C9', desc:'Every stage stitched into one pipeline, plus a full network you can train live.',               tags:['pipeline','playground','recap']}
];

function buildNNOverview(){
  const cards = NN_SEC.map(s=>`
    <div class="sc-card" onclick="openNNSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Learning to Represent</div>
    <h1 class="lesson-h1">Neural Networks</h1>
    <p class="lesson-intro">A neural unit computes a weighted sum, adds a bias, and applies an activation function. Connecting these units into layers lets a network learn intermediate features. Start with one unit, then build and train a small network in the browser.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">A neuron is a weighted sum plus a bias, passed through a non-linear activation. It is logistic regression with a swappable curve.</div>
        <div class="ch-sum-item">A single neuron can only draw a straight boundary, so it cannot solve XOR. A hidden layer fixes this by warping the input into a space where a line suffices.</div>
        <div class="ch-sum-item">Stacking layers with a non-linearity between them is what gives depth its power. Without the non-linearity, any stack collapses back to a single layer.</div>
        <div class="ch-sum-item">The same network that classifies hand-built features can take learned word embeddings as input, looked up by a one-hot selector and then pooled or concatenated.</div>
        <div class="ch-sum-item">Training means forward pass, cross-entropy loss, then backpropagation: the chain rule run backward through a computation graph to get every weight\u2019s gradient.</div>
        <div class="ch-sum-item">Dropout, sensible initialization, and a well-chosen learning rate are what make training actually work in practice rather than only on paper.</div>
      </div>
    </div>`;
}

const NN_PAGES = {};

// dispatch: section id -> init function(s) run after the page mounts
const NN_INIT = {
  neuron:   () => { nnNeuronInit(); },
  xor:      () => { nnXorInit(); nnWarpInit(); },
  ffn:      () => { nnBuilderInit(); nnCollapseInit(); },
  nlpclass: () => { nnMorphInit(); nnSentiInit(); nnVecInit(); },
  embin:    () => { nnLookupInit(); nnGenInit(); },
  training: () => { nnDashInit(); nnLossInit(); nnFarInit(); nnGraphInit(); nnBackpropInit(); nnDropoutInit(); },
  nnrecap:  () => { nnRecapInit(); }
};

function openNNSec(id) {
  const pg = NN_PAGES[id];
  if (!pg) return;
  if (window.lrStopAll) lrStopAll();
  if (window.embStopAll) embStopAll();
  if (window.nnStopAll) nnStopAll();
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if (!sv || !sb) return;
  const sec = NN_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if (crumb && sec) crumb.innerHTML = 'Neural Networks <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  if (window.renderMath) renderMath(sb);
  mcSectionDelay(()=>{ if (NN_INIT[id]) NN_INIT[id](); }, 90);
  sv.onscroll = () => {
    const h = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if (bar) bar.style.width = (h>0?(sv.scrollTop/h)*100:0)+'%';
  };
}

// nn-local timer/raf registry (cleared on any section change)
let NN_TIMERS = [];
let NN_RAFS = [];
function nnTimer(fn, ms){ const t = setInterval(fn, ms); NN_TIMERS.push(t); return t; }
function nnRaf(fn){ const id = requestAnimationFrame(fn); NN_RAFS.push(id); return id; }
function nnStopAll(){ NN_TIMERS.forEach(clearInterval); NN_TIMERS = []; NN_RAFS.forEach(cancelAnimationFrame); NN_RAFS = []; }
(function(){ const _cs = window.closeSec; window.closeSec = function(){ if(window.nnStopAll) nnStopAll(); if(_cs) _cs.apply(this, arguments); }; })();

// activation helpers (nn-prefixed; the retained playground uses its own _sig etc.)
function nnSig(z){ return 1/(1+Math.exp(-z)); }
function nnTanh(z){ return Math.tanh(z); }
function nnRelu(z){ return Math.max(0,z); }
function nnAct(name,z){ return name==='sigmoid'?nnSig(z):name==='tanh'?nnTanh(z):nnRelu(z); }
function nnActD(name,z){ if(name==='sigmoid'){ const s=nnSig(z); return s*(1-s); } if(name==='tanh'){ const t=Math.tanh(z); return 1-t*t; } return z>0?1:0; }
function nnFig(label, bodyId, badge, fs){ return lrFig(label, bodyId, badge, fs); }

// ───────────────────────────────────────────────────────────
// 6.1  The Neuron
// ───────────────────────────────────────────────────────────
NN_PAGES.neuron = `
<div class="lesson-chapter-label">Section 6.1</div>
<h1 class="lesson-h1">The Neuron: A Weighted Sum and a Squash</h1>
<p class="lesson-intro">Start with one neural unit: inputs, weights, a bias, and an activation. Working through its arithmetic will make the later matrix equations easier to follow.</p>

<h2 class="lesson-h2">Three Steps Inside One Unit</h2>
<p class="lesson-p">A neuron receives a handful of input numbers, and it does exactly three things with them. First it forms a <strong>weighted sum</strong>: each input \\(x_i\\) is multiplied by its own weight \\(w_i\\), and the products are added together. Then it adds a single <strong>bias</strong> term \\(b\\), which shifts the whole result up or down. Call this running total \\(z\\):</p>
<div class="lesson-math">\\[ z = \\Big(\\sum_i w_i x_i\\Big) + b = \\mathbf{w}\\cdot\\mathbf{x} + b \\]</div>
<p class="lesson-p">That first part, \\(\\mathbf{w}\\cdot\\mathbf{x}\\), is a dot product, the same operation used in logistic regression and embeddings, and it measures how well the input aligns with the weights. The bias is what lets the neuron fire even when all inputs are zero, or refuse to fire until the evidence is strong. Up to here, a neuron is <em>identical</em> to the score inside logistic regression.</p>
<p class="lesson-p">The third step is the new ingredient. The raw score \\(z\\) can be any real number, from deeply negative to very large, and we pass it through a non-linear <strong>activation function</strong> \\(f\\) to produce the neuron's output \\(a = f(z)\\). The activation is what makes a neuron more than a straight line, and the choice of which one to use has more effect on training than it might appear.</p>

<h2 class="lesson-h2">Three Activations You Will Meet Everywhere</h2>
<p class="lesson-p">The <strong>sigmoid</strong> \\(\\sigma(z)\\) squashes any input into the open interval between 0 and 1, giving an S-shaped curve. It is the classic choice and the one you already know, but it has a problem we are about to see. The <strong>tanh</strong> is a rescaled sigmoid that outputs between &minus;1 and 1, centered on zero, which often trains a little better. The <strong>ReLU</strong>, or rectified linear unit, is much simpler: it outputs \\(z\\) if \\(z\\) is positive and 0 otherwise. Despite that simplicity, ReLU is the default in modern networks, for a reason that comes directly from the problem with the other two.</p>
<p class="lesson-p">Build the unit below. Set the three weights and inputs, watch each \\(x_i w_i\\) product light up and flow into \\(z\\), then swap the activation to see how the same \\(z\\) produces a different output. Load the worked preset (\\(\\mathbf{w}=[0.2,0.3,0.9]\\), \\(b=0.5\\), \\(\\mathbf{x}=[0.5,0.6,0.1]\\)) and confirm the output lands at about <strong>0.70</strong>, so you can check the arithmetic against your own pen and paper.</p>
${nnFig('Interactive \u00b7 The single-unit anatomy lab', 'nn-neuron')}

<h2 class="lesson-h2">Saturation and the Vanishing-Gradient Hazard</h2>
<p class="lesson-p">Here is why ReLU took over. Look at the sigmoid far from the middle: push \\(z\\) strongly positive and the curve flattens against 1; push it strongly negative and it flattens against 0. In these flat <strong>saturation zones</strong>, a large change in \\(z\\) barely moves the output at all. That means the <em>slope</em> of the curve, its gradient, has collapsed to nearly zero.</p>
<p class="lesson-p">Recall from logistic regression that learning happens by following gradients. A neuron whose activation has saturated sends back a gradient near zero, so it stops learning. In a deep network these small gradients get multiplied together layer after layer, shrinking toward nothing, which is the <strong>vanishing gradient</strong> problem. ReLU avoids it: for any positive input its slope is exactly 1, so gradients pass through undiminished. Toggle the saturation overlay in the lab and watch the gradient meter next to the sigmoid fall toward zero as you push \\(z\\) into the flat regions, then switch to ReLU and see the slope hold at 1.</p>

<div class="lesson-note"><div class="lesson-note-label">A Neuron Is Logistic Regression With a Curve</div>
<p>If you set the activation to sigmoid and stop there, you have rebuilt the binary classifier from logistic regression exactly. The dot product, the bias, the squash, all identical. What is genuinely new is not the neuron, it is what happens when you stack them so that the outputs of one layer become the inputs of the next. That is where the network starts inventing features, and it is where we go in 6.2.</p></div>

<div class="quiz-block" id="qnn1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does a saturated sigmoid unit stop learning?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qnn1','Correct. In the flat regions the slope is nearly zero, so the gradient it passes back is nearly zero and its weights barely update.')">Its gradient is near zero in the flat regions</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn1','The output is bounded, but that alone is not what halts learning; the vanishing slope is.')">Its output is bounded between 0 and 1</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn1','The bias still exists; saturation is about the activation\u2019s slope.')">It loses its bias term</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn1','ReLU is the one with constant positive slope; the sigmoid saturates.')">Sigmoids always have slope 1</button>
</div><div class="quiz-explain" id="qnn1-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 6.2  Why One Neuron Isn't Enough (XOR) + 6.2.1 warp
// ───────────────────────────────────────────────────────────
NN_PAGES.xor = `
<div class="lesson-chapter-label">Section 6.2</div>
<h1 class="lesson-h1">Why One Neuron Isn\u2019t Enough: XOR</h1>
<p class="lesson-intro">Four XOR examples expose a limit of a single linear decision boundary. Try separating them with a line, then see how a hidden layer changes the representation.</p>

<h2 class="lesson-h2">A Neuron Draws One Straight Line</h2>
<p class="lesson-p">A single neuron computes \\(f(\\mathbf{w}\\cdot\\mathbf{x}+b)\\), and the boundary between its \u201cyes\u201d and \u201cno\u201d outputs, the set of inputs where \\(z=0\\), is a straight line (in higher dimensions, a flat plane). Everything on one side is class 1, everything on the other is class 0. This is a <strong>linear classifier</strong>, and its reach is exactly the set of problems where a single straight cut separates the classes. Such problems are called <strong>linearly separable</strong>.</p>
<p class="lesson-p">Two of the three basic logic functions are linearly separable. <strong>AND</strong> outputs 1 only at the corner \\([1,1]\\), which you can fence off with one diagonal line. <strong>OR</strong> outputs 1 everywhere except \\([0,0]\\), again separable by a single line. Try them below: you will place the boundary easily and drive the misclassified counter to zero.</p>

<h2 class="lesson-h2">XOR Cannot Be Cut</h2>
<p class="lesson-p"><strong>XOR</strong>, exclusive-or, outputs 1 when exactly one input is 1: it is true at \\([0,1]\\) and \\([1,0]\\), false at \\([0,0]\\) and \\([1,1]\\). Now the two \u201ctrue\u201d points sit on <em>opposite</em> corners of the square, with the two \u201cfalse\u201d points on the other diagonal. No single straight line can put both true corners on one side and both false corners on the other, it is geometrically impossible. This is not a failure of cleverness; it is a theorem. XOR is <strong>not linearly separable</strong>, and a single neuron can never solve it.</p>
<p class="lesson-p">Try it yourself in the challenge below. Drag and rotate the line, switch to XOR, and try every position. The misclassified counter will not reach zero. This is why the perceptron, well regarded in the 1950s, ran into a wall, and why the field needed the idea in the next subsection.</p>
${nnFig('Interactive \u00b7 The draw-a-line challenge', 'nn-xor', 'flagship', 1)}

${lrH3('6.2.1', 'How a Hidden Layer Bends Space to Solve XOR', 'flagship')}
<p class="lesson-p">Here is the resolution, and it is the key idea here. If the input space does not allow a straight cut, change the space. A hidden layer takes the original inputs and re-represents them as new coordinates, and it can choose those coordinates so that a problem which was not separable becomes separable.</p>
<p class="lesson-p">The demonstration below shows it happening. On the left are the four XOR points in the original input space, where no line works. They then pass through a two-unit hidden layer, and the right panel shows where they land in the new <strong>hidden space</strong>. The two positive points, \\([0,1]\\) and \\([1,0]\\), are mapped to the <em>same location</em>, landing on top of each other, while the two negative points stay apart. Once the positives coincide, one straight line separates them from the negatives easily. The hidden layer did not find a better line; it changed the coordinates until a line was enough.</p>
<p class="lesson-p">This is what people mean when they say neural networks \u201clearn features\u201d or \u201clearn representations.\u201d The hidden layer\u2019s job is to transform the raw input into a new set of coordinates in which the output layer\u2019s simple linear decision suddenly works. Step through the arithmetic one input at a time to confirm exactly where each point lands, then let the animation warp the whole plane at once.</p>
${nnFig('Interactive \u00b7 Watch the hidden layer warp the plane', 'nn-warp', 'flagship', 1)}

<div class="lesson-note"><div class="lesson-note-label">The Whole Idea in One Sentence</div>
<p>Hidden layers re-represent the input into something separable. Everything else, softmax outputs, backpropagation, dropout, embeddings, is machinery in service of that one idea. When a modern network with billions of parameters classifies an image or continues a sentence, it is doing exactly what these two hidden units do to the four XOR points: warping the input, layer after layer, until the answer becomes a simple straight-line decision at the very end.</p></div>

<div class="quiz-block" id="qnn2"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">How does a hidden layer let a network solve XOR?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qnn2','Correct. It maps the inputs into a new space (here collapsing the two positive points together) where a single straight line can separate the classes.')">It transforms the inputs into a separable new space</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn2','No curved boundary is drawn in the original space; the boundary stays linear in the transformed space.')">It draws a curved line in the original space</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn2','More inputs are not added; the same four points are re-represented.')">It adds more input points</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn2','A single neuron still cannot; the hidden layer is what changes things.')">A single neuron could do it all along</button>
</div><div class="quiz-explain" id="qnn2-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 6.3  Stacking Units Into a Network + 6.3.1 collapse
// ───────────────────────────────────────────────────────────
NN_PAGES.ffn = `
<div class="lesson-chapter-label">Section 6.3</div>
<h1 class="lesson-h1">Stacking Units Into a Feedforward Network</h1>
<p class="lesson-intro">One neuron applies one transformation to its input. A layer of neurons applies several at once, and stacking layers applies them in sequence, each working on the output of the last. This section assembles individual units into a full <strong>feedforward network</strong> and writes the whole thing as matrix algebra, so the bookkeeping stays manageable.</p>

<h2 class="lesson-h2">Layers and Full Connectivity</h2>
<p class="lesson-p">A feedforward network is organized into <strong>layers</strong>. The <strong>input layer</strong> is just the raw features. One or more <strong>hidden layers</strong> sit in the middle, each a bank of neurons. The <strong>output layer</strong> produces the final answer. \u201cFeedforward\u201d means information flows in one direction, input to output, with no loops. Networks are typically <strong>fully connected</strong>, meaning every unit in a layer receives input from every unit in the previous layer, so a layer of 4 units reading from a layer of 3 has 4\u00d73 = 12 weights.</p>
<p class="lesson-p">Rather than track those weights one at a time, we collect them into a single <strong>weight matrix</strong> \\(W\\), where the entry \\(W_{ji}\\) is the weight from input unit \\(i\\) to hidden unit \\(j\\). Then the entire layer\u2019s computation, every neuron\u2019s weighted sum at once, is one matrix-vector product, and the whole layer is:</p>
<div class="lesson-math">\\[ \\mathbf{h} = f(W\\mathbf{x} + \\mathbf{b}) \\]</div>
<p class="lesson-p">That compact line hides a lot of arithmetic, so build it up visibly below. Add hidden units with the slider and \\(W\\) gains a row per unit. Hover any connection in the diagram and the corresponding matrix entry \\(W_{ji}\\) is highlighted, so the picture and the algebra stay aligned. Then send data through: \\(\\mathbf{x}\\) enters, gets multiplied and summed at each node, the activation is applied, and the final <strong>softmax</strong> turns the output scores into a probability bar that sums to 1.</p>
${nnFig('Interactive \u00b7 The network builder', 'nn-builder')}

<h2 class="lesson-h2">The Output Layer and Softmax</h2>
<p class="lesson-p">For classification, the last layer produces one score per class, and <strong>softmax</strong> (from logistic regression) turns those scores into a probability distribution: exponentiate each, divide by the total, and every output is positive and they sum to 1. The class with the largest score gets the largest probability. Turn on the shape-annotation toggle in the builder to label every arrow with its dimensions, and the matrix bookkeeping, so often a source of confusion, becomes something you can simply read off the diagram.</p>

${lrH3('6.3.1', 'Why Non-Linearity Is Non-Negotiable')}
<p class="lesson-p">It is tempting to think depth alone is what gives networks their expressive range. It does not. Depth adds expressive range only <em>because</em> of the non-linear activation between layers, and here is the proof. Suppose you stacked two layers but set their activations to the identity function, doing nothing. The first layer computes \\(W^{(1)}\\mathbf{x}\\), the second computes \\(W^{(2)}\\) times that:</p>
<div class="lesson-math">\\[ W^{(2)}\\big(W^{(1)}\\mathbf{x}\\big) = \\big(W^{(2)}W^{(1)}\\big)\\mathbf{x} = W'\\mathbf{x} \\]</div>
<p class="lesson-p">The two weight matrices multiply into a single matrix \\(W'\\). Your two-layer network is <em>mathematically identical</em> to a one-layer network with weights \\(W'\\), and no more expressive. You could stack a hundred such layers and still compute only a single linear transformation, still unable to solve XOR. Depth without a non-linearity buys nothing.</p>
<p class="lesson-p">The demonstration below makes this concrete. Two stacked layers with identity activations: press the button and \\(W^{(2)}W^{(1)}\\) collapses into one matrix \\(W'\\). Then switch the activations back on and the collapse no longer works, because a non-linearity cannot be absorbed into a matrix product. That toggle is the whole justification for every activation function used here.</p>
${nnFig('Interactive \u00b7 Collapse the linear stack', 'nn-collapse')}

<div class="quiz-block" id="qnn3"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Two layers with <em>identity</em> activations are equivalent to:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qnn3','Correct. The two weight matrices multiply into one, so the stack collapses to a single linear layer with no added power.')">A single linear layer</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn3','Without a non-linearity there is no extra expressive power, no matter how deep.')">A more powerful non-linear model</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn3','It can still only draw linear boundaries, so XOR remains impossible.')">A network that can finally solve XOR</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn3','The matrices combine cleanly; the result is not random.')">A randomly initialized network</button>
</div><div class="quiz-explain" id="qnn3-explain"></div></div>`;


// ───────────────────────────────────────────────────────────
// 6.4  Networks for Text Classification (+ 6.4.1, 6.4.2)
// ───────────────────────────────────────────────────────────
NN_PAGES.nlpclass = `
<div class="lesson-chapter-label">Section 6.4</div>
<h1 class="lesson-h1">Feedforward Networks for Text</h1>
<p class="lesson-intro">Apply the network to sentiment classification and compare it with logistic regression. A hidden layer learns intermediate features before the final classifier makes its prediction.</p>

<h2 class="lesson-h2">Logistic Regression Grows a Hidden Layer</h2>
<p class="lesson-p">In logistic regression the sentiment model was flat: hand-designed features fed straight into a softmax. Its decision boundary was a single straight cut, so it could never capture an interaction like \u201cpositive words are good, <em>unless</em> preceded by <em>not</em>.\u201d A neural network fixes this by inserting a hidden layer between the features and the output. Those hidden units learn intermediate combinations, and the softmax then classifies <em>those</em> instead of the raw features.</p>
<p class="lesson-p">In the transition below, we start with the one-layer logistic regression classifier, then a hidden layer is inserted in the middle. The same three features, word count, positive-lexicon count, and whether <em>no</em> is present, now pass through learned intermediate units before reaching the softmax. The side panel compares the two directly: plain logistic regression draws one straight boundary, while the two-layer network can bend that boundary around non-linear interactions between features. Same inputs, same outputs, more expressive in between.</p>
${nnFig('Interactive \u00b7 A logistic regression grows a hidden layer', 'nn-morph')}

${lrH3('6.4.1', 'Hand-Built Features Through a Neural Net')}
<p class="lesson-p">To make it concrete, type a short review into the demo below. The three hand-designed features are extracted from your text, pass through the hidden layer, and come out as probability bars for positive, negative, and neutral. This is the same pipeline as logistic regression with one stage added in the middle, and it shows how a phrase with mixed signals, some positive words plus a negation, is handled by the hidden units rather than forced through a single linear rule. The features are still hand-built here; input features that the model learns for itself arrive in 6.5.</p>
${nnFig('Interactive \u00b7 Live sentiment through a hidden layer', 'nn-senti')}

${lrH3('6.4.2', 'Doing a Whole Test Set at Once (Vectorization)')}
<p class="lesson-p">Networks are trained and evaluated on thousands of examples, and processing them one at a time with a loop is painfully slow. The fix is the same one used for logistic regression, now for a whole layer. Stack every example as a row of a big matrix \\(X\\), and a single matrix multiplication computes the hidden representation of the <em>entire</em> dataset at once:</p>
<div class="lesson-math">\\[ H = f(XW^\\top + \\mathbf{b}) \\]</div>
<p class="lesson-p">The arithmetic per example is unchanged; we have only rearranged it so the hardware can do every row in parallel. Race them below: a for-loop crawls through the test set example by example on the left, while the single matrix multiply illuminates every row simultaneously on the right. The transposes and shapes are annotated so you can see why the dimensions line up, and why the matrix form is not a different computation, just a faster packaging of the same one.</p>
${nnFig('Interactive \u00b7 Loop vs. matrix race', 'nn-vec')}

<div class="quiz-block" id="qnn4"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does the hidden layer add over plain logistic regression for text?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qnn4','Correct. The hidden units learn intermediate feature combinations, letting the model capture non-linear interactions a single linear boundary cannot.')">Learned intermediate features that capture interactions</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn4','The output is still a softmax; that part is unchanged.')">A completely different output function</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn4','Vectorization is about speed, not about what the hidden layer represents.')">Faster arithmetic only, with no new power</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn4','The features can now be learned, but the key gain is modeling interactions.')">The ability to use exactly one feature</button>
</div><div class="quiz-explain" id="qnn4-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 6.5  Feeding Words In as Embeddings
// ───────────────────────────────────────────────────────────
NN_PAGES.embin = `
<div class="lesson-chapter-label">Section 6.5</div>
<h1 class="lesson-h1">Feeding Words In as Embeddings</h1>
<p class="lesson-intro">So far the network has taken hand-built features as input. Word embeddings gave us something better to feed it. This section connects the two, showing how words enter a network as vectors, and why that change is what lets neural language models generalize in ways n-grams cannot.</p>

<h2 class="lesson-h2">One-Hot Times E Is a Lookup</h2>
<p class="lesson-p">Every word in the vocabulary is assigned a row in an <strong>embedding matrix</strong> \\(E\\), which has one row per word and one column per embedding dimension. To feed a word into the network, we represent it as a <strong>one-hot vector</strong>, a long row of zeros with a single 1 at the position of that word. Multiplying that one-hot vector by \\(E\\) has a simple effect: because all but one entry is zero, the product selects the one row of \\(E\\) corresponding to the word. The matrix multiplication is a table lookup.</p>
<p class="lesson-p">This matters because it means the embedding is not computed on the fly but stored and retrieved, and it can be <em>learned</em> along with the rest of the network by treating \\(E\\)'s entries as more weights. In the animation below, type a word and watch its one-hot vector slide across \\(E\\) and select exactly one row. The lookup that every modern language model starts with is no more complicated than this.</p>
${nnFig('Interactive \u00b7 One-hot as a selector', 'nn-lookup', 'flagship', 1)}

<h2 class="lesson-h2">Pooling vs. Concatenation</h2>
<p class="lesson-p">A sentence is several words, so we get several embedding vectors, and the network needs a single fixed-size input. There are two ways to combine them, and the choice encodes what you care about. <strong>Pooling</strong> averages (or maxes) the word vectors into one blob of the same size, which throws away word order but is compact and robust, a natural fit for sentiment, where the bag of words mostly determines the tone. <strong>Concatenation</strong> lines the vectors up end to end, preserving order and position at the cost of a much longer input, which is what a language model needs because \u201cdog bites man\u201d and \u201cman bites dog\u201d must look different.</p>
<p class="lesson-p">Flip between the two modes on the same sentence in the tool and watch the input vector reshape: pooling collapses to one compact blob, concatenation stretches into a long ordered strip. The tradeoff, compact-but-orderless versus long-but-ordered, becomes something you can see rather than memorize.</p>

<h2 class="lesson-h2">The Generalization Win Over N-Grams</h2>
<p class="lesson-p">This is the property that made neural language models worth the extra cost. Recall from n-gram models that a count-based model only knows word sequences it literally saw. If training contained "the cat gets fed" but never "the dog gets fed," an n-gram model has nothing useful to say about the second. A neural model with embeddings does. Because <em>cat</em> and <em>dog</em> sit close together in embedding space, the network treats them similarly, so probability mass flows to <em>fed</em> for the dog sentence even though that exact phrase never appeared.</p>
<p class="lesson-p">The demo below shows this directly. Training sees "the cat gets fed." At test time the model is asked about "the dog gets ___." Because the two embeddings are neighbors, their predictions are shared, and the network fills in <em>fed</em> with high confidence. Two nearby vectors sharing their predictions is the entire mechanism, and it is the concrete reason embeddings outperform raw counts. It is also the basis for everything that follows in large language models.</p>
${nnFig('Interactive \u00b7 The cat/dog generalization demo', 'nn-gen')}

<div class="quiz-block" id="qnn5"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Multiplying a one-hot vector by the embedding matrix \\(E\\) is equivalent to:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qnn5','Correct. All entries but one are zero, so the product selects exactly one row of E \u2014 a lookup.')">Selecting one row of \\(E\\)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn5','It does not average rows; a one-hot picks a single row.')">Averaging all rows of \\(E\\)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn5','No non-linearity is applied by the lookup itself.')">Applying a softmax to \\(E\\)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn5','The result is one row, not a scalar.')">Producing a single number</button>
</div><div class="quiz-explain" id="qnn5-explain"></div></div>

<div class="quiz-block" id="qnn5b"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can a neural LM predict \u201cthe dog gets fed\u201d after only seeing \u201cthe cat gets fed\u201d?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qnn5b','Correct. cat and dog have nearby embeddings, so the model generalizes its prediction from one to the other \u2014 something n-grams cannot do.')"><em>cat</em> and <em>dog</em> have nearby embeddings</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn5b','An n-gram model is exactly what cannot do this; that is the contrast.')">Because it memorized the exact phrase</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn5b','Concatenation preserves order but is not why the two words share predictions.')">Because it concatenates the inputs</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn5b','Vocabulary size is not the reason; embedding proximity is.')">Because the vocabulary is small</button>
</div><div class="quiz-explain" id="qnn5b-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 6.6  Training a Network (+ 6.6.1 ... 6.6.5)
// ───────────────────────────────────────────────────────────
NN_PAGES.training = `
<div class="lesson-chapter-label">Section 6.6</div>
<h1 class="lesson-h1">Training a Network</h1>
<p class="lesson-intro">A network starts with untrained weights. Training adjusts them to reduce a loss. The loop is familiar from logistic regression; backpropagation supplies the gradients for the hidden layers.</p>

<h2 class="lesson-h2">The Loop, From Above</h2>
<p class="lesson-p">Training repeats four steps until the network stops improving. The <strong>forward pass</strong> runs an input through the network to produce a prediction \\(\\hat{y}\\). The <strong>loss</strong> measures how far \\(\\hat{y}\\) is from the true answer \\(y\\). The <strong>backward pass</strong> computes how every weight should change to reduce that loss. The <strong>update</strong> moves each weight a small step in that direction. Repeat, and the loss curve falls over epochs. The dashboard below is the overview; the subsections take each step in turn.</p>
${nnFig('Interactive \u00b7 The training-loop dashboard', 'nn-dash')}

${lrH3('6.6.1', 'The Loss Function (Cross-Entropy)')}
<p class="lesson-p">The loss for classification is <strong>cross-entropy</strong>, exactly as in logistic regression. For a single example it is the negative log of the probability the model assigned to the <em>correct</em> class:</p>
<div class="lesson-math">\\[ L_{CE} = -\\log \\hat{y}_{\\text{correct}} \\]</div>
<p class="lesson-p">Slide the predicted probability of the correct class from 0 toward 1 below and watch the penalty fall from near-infinity down to zero. Confident and right costs almost nothing; confident and wrong costs a great deal. The K-class version shows the same collapse: the one-hot label zeroes out every term except the true class, so the whole sum reduces to the negative log of the right answer. This is the same penalty from logistic regression, and it behaves identically here because a network's output layer <em>is</em> a softmax classifier.</p>
${nnFig('Interactive \u00b7 The cross-entropy penalty meter', 'nn-loss')}

${lrH3('6.6.2', 'Why One Derivative Isn\u2019t Enough')}
<p class="lesson-p">In logistic regression the loss sat next to the single layer of weights, so one derivative gave the update. In a deep network the loss is attached at the very <em>end</em>, many layers away from a weight in layer 1. Changing that early weight propagates forward through every subsequent layer before it affects the loss at all. So how do we compute the effect of a change at the start on a quantity measured at the end?</p>
<p class="lesson-p">The diagram below sets up the problem: a long chain of layers, the loss at the far end, and a question mark over a weight near the start. A single derivative cannot span that distance. What we need is a way to carry the derivative backward through the whole chain, one step at a time, which is what the chain rule provides when it is organized as backpropagation.</p>
${nnFig('Interactive \u00b7 The loss is far from the weight', 'nn-far')}

${lrH3('6.6.3', 'Computation Graphs (the Forward Pass)')}
<p class="lesson-p">To tame the chain rule we draw the computation as a <strong>graph</strong>: each operation is a node, and values flow along edges from inputs to output. Consider a small example, \\(L = c\\,(a+2b)\\). It breaks into simple nodes: multiply \\(b\\) by 2, add \\(a\\), multiply by \\(c\\). Set \\(a\\), \\(b\\), \\(c\\) with the sliders below and watch values propagate left to right, each node lighting up as it computes, arriving at \\(L\\). With \\(a=3\\), \\(b=1\\), \\(c=-2\\) you should land at \\(L=-10\\). This forward pass is the scaffold; the backward pass reuses the exact same graph.</p>
${nnFig('Interactive \u00b7 A computation graph, forward', 'nn-graph')}

${lrH3('6.6.4', 'Backpropagation: Sending the Error Backward', 'flagship')}
<p class="lesson-p">Here is the mechanism, and it is what makes the chain rule practical. After the forward pass, we run the <em>same</em> graph in reverse to compute how the loss depends on every input. Each node receives an <strong>upstream gradient</strong>, which is how much the loss depends on this node's output, multiplies it by its own <strong>local gradient</strong>, which is how much this node's output depends on its input, and passes the result <strong>downstream</strong> to its parents. That multiply-and-pass step is the chain rule, and doing it node by node through the graph is backpropagation.</p>
<p class="lesson-p">Press "backprop" below and follow the gradients right to left. Each node shows its local gradient as a label; check the numbers against the worked example, which at the default \\(a=3\\), \\(b=1\\), \\(c=-2\\) gives \\(\\partial L/\\partial a = -2\\), \\(\\partial L/\\partial b = -4\\), \\(\\partial L/\\partial c = 5\\). The sliders in 6.6.3 drive this graph too, so moving them updates every gradient here. Then press "level up" to swap in the real two-layer network graph and watch the same backward pass compute \\(\\partial L/\\partial z = a^{(2)} - y\\), the same error-times-feature gradient from logistic regression, now produced by the graph rather than derived by hand. Stepping through each multiplication in both directions on one structure is the most direct way to see what backprop is doing.</p>
${nnFig('Interactive \u00b7 Backpropagation, the reverse pass', 'nn-backprop', 'flagship', 1)}

${lrH3('6.6.5', 'Practical Training: Initialization, Dropout, Hyperparameters')}
<p class="lesson-p">Three practical ingredients separate a network that trains from one that does not. <strong>Initialization</strong>: weights start as small random numbers, never all zero, because identical weights would compute identical gradients and never differentiate. <strong>Dropout</strong>: during training we randomly switch off a fraction of units each step, forcing the network not to rely on any single unit and thereby reducing overfitting; it amounts to training a slightly different sub-network every step and averaging them all. Watch the dropout visualizer below gray out a random fraction of units each step, with the survivors renormalizing.</p>
<p class="lesson-p">Finally, <strong>hyperparameters</strong>, the settings you choose rather than learn, chief among them the learning rate. The small panel below lets you slide it and watch the loss curve respond: smooth descent when it is right, jagged divergence when it is too high, a hopeless crawl when it is too low. Weights are learned by the network; hyperparameters are chosen by you, and choosing them well is much of the practical craft.</p>
${nnFig('Interactive \u00b7 Dropout and the learning-rate dial', 'nn-dropout')}

<div class="quiz-block" id="qnn6"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In backpropagation, what does each node pass to its parents?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qnn6','Correct. It multiplies the upstream gradient by its local gradient and passes that product downstream \u2014 the chain rule, node by node.')">The upstream gradient times its local gradient</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn6','The forward value was already sent during the forward pass; backprop sends gradients.')">Its forward output value again</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn6','It passes a gradient, not the raw loss number, to each parent.')">The full loss value unchanged</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn6','Weights are updated after gradients are known, not passed between nodes during backprop.')">Its updated weights</button>
</div><div class="quiz-explain" id="qnn6-explain"></div></div>

<div class="quiz-block" id="qnn7"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What is dropout doing during training?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qnn7','Correct. Randomly switching off units each step trains a different sub-network each time, reducing over-reliance on any single unit and curbing overfitting.')">Randomly disabling units to reduce overfitting</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn7','Dropout is used at training time and turned off at test time, not the reverse.')">Permanently deleting weak units</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn7','It does not raise the learning rate; it drops units.')">Increasing the learning rate</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn7','Dropout adds regularization; it is not about speed.')">Making the forward pass faster</button>
</div><div class="quiz-explain" id="qnn7-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 6.7  Recap + live playground
// ───────────────────────────────────────────────────────────
NN_PAGES.nnrecap = `
<div class="lesson-chapter-label">Section 6.7</div>
<h1 class="lesson-h1">The Whole Network, End to End</h1>
<p class="lesson-intro">Connect the pieces into a trainable network. Use the diagram to revisit a stage, then open the playground and compare architectures and training settings.</p>

<h2 class="lesson-h2">From Tokens to a Trained Model</h2>
<p class="lesson-p">Follow the whole sequence. <strong>Raw tokens</strong> enter and are turned into vectors by an <strong>embedding lookup</strong> (6.5). Those vectors pass through one or more <strong>hidden layers</strong>, each a weighted sum plus a <strong>non-linearity</strong> (6.1, 6.3), which re-represent the input into something separable (6.2). A <strong>softmax</strong> output produces class probabilities, a <strong>cross-entropy loss</strong> measures the error (6.6.1), <strong>backpropagation</strong> sends that error backward to every weight (6.6.4), and an <strong>update</strong> adjusts them. Loop until the loss settles. Click any node in the map to jump back to its section. It is laid out to match the logistic regression and embeddings recaps, so the same stages line up across topics.</p>
${nnFig('Interactive \u00b7 The full-network pipeline', 'nn-recap')}

<h2 class="lesson-h2">Open the Network and Train It Live</h2>
<p class="lesson-p">Reading about training and watching it run are different things. The full-screen playground lets you pick a dataset, add hidden layers, set the learning rate, and press play to watch the network learn a decision boundary, with the loss curve falling and every unit's activation visible. Change a weight by hand and the boundary responds. Everything covered here is running at once inside it.</p>
<div style="display:flex;justify-content:center;margin:1.25rem 0 .5rem">
  <button onclick="openNNPlayground()" style="background:linear-gradient(135deg,var(--accent),#a78bfa);color:var(--bg);border:none;border-radius:9px;padding:.7rem 1.4rem;font-family:var(--mono);font-size:.8rem;font-weight:700;cursor:pointer;letter-spacing:.02em">&#9673; Open the full Neural Network Playground</button>
</div>

<div class="lesson-note"><div class="lesson-note-label">Where This Goes Next</div>
<p>The feedforward network here reads its whole input at once, with no notion of sequence beyond what concatenation bolts on. Language is a sequence, and what comes next gives networks a way to process order natively and to let each word attend to every other. But the atom never changes: a weighted sum, a non-linearity, a softmax, a cross-entropy loss, and backpropagation to tune it all. The transformer that powers modern language models is this same machinery, wired more cleverly. You have built the engine; the rest of the book is the vehicle.</p></div>

<div class="quiz-block" id="qnn8"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What is the correct order of the training loop?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qnn8','Correct. Forward pass produces a prediction, the loss measures error, backprop computes gradients, and the update nudges the weights \u2014 then repeat.')">Forward \u2192 loss \u2192 backprop \u2192 update</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn8','You cannot compute a loss before a prediction exists.')">Loss \u2192 forward \u2192 update \u2192 backprop</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn8','Backprop needs a loss to send backward, so it cannot come first.')">Backprop \u2192 forward \u2192 loss \u2192 update</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qnn8','Updating before computing gradients would have nothing to apply.')">Update \u2192 backprop \u2192 loss \u2192 forward</button>
</div><div class="quiz-explain" id="qnn8-explain"></div></div>`;


// ═══════════════════════════════════════════════════════════
// CHAPTER 6 · INSTRUMENTS  (part 1: 6.1–6.3)
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// 6.1 — Single-neuron anatomy lab
// ───────────────────────────────────────────────────────────
let _nnNeuron = { w:[0.2,0.3,0.9], x:[0.5,0.6,0.1], b:0.5, act:'sigmoid', showSat:false };
function nnNeuronInit(){
  _nnNeuron = { w:[0.2,0.3,0.9], x:[0.5,0.6,0.1], b:0.5, act:'sigmoid', showSat:false };
  const host = lrEl('nn-neuron'); if(!host) return;
  host.innerHTML =
    '<div class="nn-split"><div>'+
      '<canvas id="nn-neuron-cv" style="width:100%;display:block"></canvas></div>'+
      '<div><div id="nn-neuron-ctrl"></div></div></div>'+
    '<div class="lr-ctl" style="margin-top:1rem">'+
      '<button class="lr-btn '+(_nnNeuron.act==='sigmoid'?'on':'')+'" id="nn-act-sigmoid" onclick="nnNeuronAct(\'sigmoid\')">sigmoid</button>'+
      '<button class="lr-btn '+(_nnNeuron.act==='tanh'?'on':'')+'" id="nn-act-tanh" onclick="nnNeuronAct(\'tanh\')">tanh</button>'+
      '<button class="lr-btn '+(_nnNeuron.act==='relu'?'on':'')+'" id="nn-act-relu" onclick="nnNeuronAct(\'relu\')">ReLU</button>'+
      '<button class="lr-btn" style="margin-left:auto" onclick="nnNeuronPreset()">load worked preset</button>'+
      '<button class="lr-btn" id="nn-sat-btn" onclick="nnNeuronSat()">saturation overlay: off</button>'+
    '</div>'+
    '<div class="lr-readout" style="margin-top:.85rem">'+
      '<span class="lr-stat"><span class="lr-stat-k">z = w\u00b7x + b</span><span class="lr-stat-v" id="nn-neuron-z" style="color:'+LRC.pur+'">\u2014</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">a = f(z)</span><span class="lr-stat-v" id="nn-neuron-a" style="color:'+LRC.acc+'">\u2014</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">slope f\u2032(z)</span><span class="lr-stat-v" id="nn-neuron-g" style="color:'+LRC.grn+'">\u2014</span></span>'+
    '</div>'+
    '<div class="lr-note" id="nn-neuron-note">Set weights and inputs; each product feeds z, then the activation squashes it. Push z into the flats to see the slope vanish.</div>';
  nnNeuronCtrl();
  nnNeuronDraw();
}
function nnNeuronCtrl(){
  const c=lrEl('nn-neuron-ctrl'); if(!c) return;
  const rows=[
    {k:'w',i:0,lbl:'w\u2081',min:-2,max:2,step:0.1,col:LRC.acc},
    {k:'w',i:1,lbl:'w\u2082',min:-2,max:2,step:0.1,col:LRC.acc},
    {k:'w',i:2,lbl:'w\u2083',min:-2,max:2,step:0.1,col:LRC.acc},
    {k:'b',i:0,lbl:'bias b',min:-2,max:2,step:0.1,col:LRC.grn},
    {k:'x',i:0,lbl:'x\u2081',min:0,max:1,step:0.05,col:LRC.pur},
    {k:'x',i:1,lbl:'x\u2082',min:0,max:1,step:0.05,col:LRC.pur},
    {k:'x',i:2,lbl:'x\u2083',min:0,max:1,step:0.05,col:LRC.pur}
  ];
  c.innerHTML=rows.map((r,idx)=>{
    const val=r.k==='b'?_nnNeuron.b:_nnNeuron[r.k][r.i];
    return '<div style="margin-bottom:.5rem"><div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-bottom:2px"><span>'+r.lbl+'</span><span id="nn-nv-'+idx+'" style="color:'+r.col+'">'+val.toFixed(2)+'</span></div>'+
      '<input type="range" min="'+r.min+'" max="'+r.max+'" step="'+r.step+'" value="'+val+'" oninput="nnNeuronSet('+idx+',\''+r.k+'\','+r.i+',this.value)" style="width:100%;accent-color:'+r.col+'"></div>';
  }).join('');
}
function nnNeuronSet(idx,k,i,v){ v=parseFloat(v); if(k==='b')_nnNeuron.b=v; else _nnNeuron[k][i]=v; lrTxt('nn-nv-'+idx,v.toFixed(2)); nnNeuronDraw(); }
function nnNeuronAct(a){ _nnNeuron.act=a; ['sigmoid','tanh','relu'].forEach(k=>lrEl('nn-act-'+k).classList.toggle('on',k===a)); nnNeuronDraw(); }
function nnNeuronPreset(){ _nnNeuron.w=[0.2,0.3,0.9]; _nnNeuron.x=[0.5,0.6,0.1]; _nnNeuron.b=0.5; _nnNeuron.act='sigmoid'; nnNeuronAct('sigmoid'); nnNeuronCtrl(); nnNeuronDraw(); }
function nnNeuronSat(){ _nnNeuron.showSat=!_nnNeuron.showSat; lrEl('nn-sat-btn').textContent='saturation overlay: '+(_nnNeuron.showSat?'on':'off'); nnNeuronDraw(); }
function nnNeuronDraw(){
  const z = _nnNeuron.w[0]*_nnNeuron.x[0]+_nnNeuron.w[1]*_nnNeuron.x[1]+_nnNeuron.w[2]*_nnNeuron.x[2]+_nnNeuron.b;
  const a = nnAct(_nnNeuron.act,z), g = nnActD(_nnNeuron.act,z);
  lrTxt('nn-neuron-z', z.toFixed(3)); lrTxt('nn-neuron-a', a.toFixed(3)); lrTxt('nn-neuron-g', g.toFixed(3));
  const gEl=lrEl('nn-neuron-g'); if(gEl) gEl.style.color = g<0.05?LRC.red:LRC.grn;
  // wire diagram
  const c=lrCanvas('nn-neuron-cv',260); if(!c) return;
  const {ctx,W,H}=c;
  const inx=W*0.12, sumx=W*0.52, actx=W*0.8;
  const ys=[H*0.25,H*0.5,H*0.75];
  // input nodes + weighted wires
  ys.forEach((y,i)=>{
    ctx.fillStyle=LRC.pur; ctx.beginPath(); ctx.arc(inx,y,14,0,7); ctx.fill();
    ctx.fillStyle='#070B18'; ctx.font='700 11px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(_nnNeuron.x[i].toFixed(1),inx,y+4);
    const prod=_nnNeuron.w[i]*_nnNeuron.x[i];
    ctx.strokeStyle = _nnNeuron.w[i]>=0?LRC.acc:LRC.red; ctx.lineWidth=Math.max(1,Math.abs(_nnNeuron.w[i])*2.5); ctx.globalAlpha=.7;
    ctx.beginPath(); ctx.moveTo(inx+14,y); ctx.lineTo(sumx-16,H*0.5); ctx.stroke(); ctx.globalAlpha=1;
    ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.textAlign='left'; ctx.fillText('\u00d7'+_nnNeuron.w[i].toFixed(1)+'='+prod.toFixed(2),(inx+sumx)/2-20,y+(i===1?-6:(i===0?-2:14)));
  });
  // sum node
  ctx.fillStyle=LRC.s3; ctx.strokeStyle=LRC.pur; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(sumx,H*0.5,18,0,7); ctx.fill(); ctx.stroke();
  ctx.fillStyle=LRC.text; ctx.font='700 13px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('\u03a3',sumx,H*0.5+5);
  ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('+b='+_nnNeuron.b.toFixed(1),sumx,H*0.5+34);
  ctx.fillStyle=LRC.pur; ctx.font='700 10px IBM Plex Mono, monospace'; ctx.fillText('z='+z.toFixed(2),sumx,H*0.5-26);
  // wire to activation
  ctx.strokeStyle=LRC.muted; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(sumx+18,H*0.5); ctx.lineTo(actx-30,H*0.5); ctx.stroke();
  // mini activation curve box
  const bx=actx-30, by=H*0.5-40, bw=58, bh=80;
  ctx.strokeStyle=LRC.grid; ctx.strokeRect(bx,by,bw,bh);
  ctx.strokeStyle=LRC.acc; ctx.lineWidth=2; ctx.beginPath();
  for(let px=0;px<=bw;px++){ const zz=(px/bw)*12-6; const av=nnAct(_nnNeuron.act,zz); const yy = _nnNeuron.act==='relu' ? by+bh-(Math.min(av,6)/6)*bh : by+bh-av*bh; if(px===0)ctx.moveTo(bx+px,yy); else ctx.lineTo(bx+px,yy); }
  ctx.stroke();
  // saturation shading
  if(_nnNeuron.showSat && _nnNeuron.act!=='relu'){ ctx.fillStyle='rgba(255,95,142,0.15)'; ctx.fillRect(bx,by,bw*0.18,bh); ctx.fillRect(bx+bw*0.82,by,bw*0.18,bh); }
  // point on curve
  const zc=lrClamp(z,-6,6); const ac = _nnNeuron.act==='relu'?Math.min(nnAct('relu',zc),6)/6:nnAct(_nnNeuron.act,zc);
  const ptx=bx+((zc+6)/12)*bw, pty=by+bh-ac*bh;
  ctx.fillStyle=LRC.red; ctx.beginPath(); ctx.arc(ptx,pty,4,0,7); ctx.fill();
  // output node
  ctx.fillStyle=LRC.acc; ctx.beginPath(); ctx.arc(actx+40,H*0.5,16,0,7); ctx.fill();
  ctx.fillStyle='#070B18'; ctx.font='700 11px IBM Plex Mono, monospace'; ctx.fillText(a.toFixed(2),actx+40,H*0.5+4);
  ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('output a',actx+40,H*0.5+30);
  ctx.textAlign='left';
  if(_nnNeuron.showSat){ lrSet('nn-neuron-note', g<0.05?'<b style="color:'+LRC.red+'">Saturated.</b> The slope has collapsed toward zero \u2014 this unit would barely learn. Switch to ReLU: its slope stays at 1 for any positive z.':'Slide a weight or input to push z toward \u00b16 and watch the slope (green) fall into the red saturation zones.'); }
}

// ───────────────────────────────────────────────────────────
// 6.2 — Draw-a-line XOR challenge  [flagship]
// ───────────────────────────────────────────────────────────
const XOR_FNS = {
  AND:[[0,0,0],[0,1,0],[1,0,0],[1,1,1]],
  OR: [[0,0,0],[0,1,1],[1,0,1],[1,1,1]],
  XOR:[[0,0,0],[0,1,1],[1,0,1],[1,1,0]]
};
let _nnXor = { fn:'AND', angle:0.6, offset:0.5, drag:false };
function nnXorInit(){
  _nnXor = { fn:'AND', angle:-0.785, offset:1.5, drag:false };
  const host = lrEl('nn-xor'); if(!host) return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center">'+
      ['AND','OR','XOR'].map(f=>'<button class="lr-btn '+(f==='AND'?'on':'')+'" id="nn-xor-'+f+'" onclick="nnXorFn(\''+f+'\')">'+f+'</button>').join('')+
    '</div>'+
    '<canvas id="nn-xor-cv" style="width:100%;display:block;cursor:grab;touch-action:none"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem">'+
      '<div class="lr-sl">rotate<input id="nn-xor-ang" type="range" min="-3.14" max="3.14" step="0.02" value="-0.785" oninput="nnXorAng(this.value)"></div>'+
      '<div class="lr-sl">shift<input id="nn-xor-off" type="range" min="-1" max="3" step="0.02" value="1.5" oninput="nnXorOff(this.value)"></div>'+
      '<span class="lr-stat" style="margin-left:auto"><span class="lr-stat-k">misclassified</span><span class="lr-stat-v" id="nn-xor-miss" style="color:'+LRC.red+'">\u2014</span></span>'+
    '</div>'+
    '<div class="lr-note" id="nn-xor-note">Separate the filled dots from the open ones. AND and OR yield easily. Try XOR \u2014 the counter will not reach zero.</div>';
  const cv=lrEl('nn-xor-cv');
  const down=()=>{ _nnXor.drag=true; cv.style.cursor='grabbing'; };
  const up=()=>{ _nnXor.drag=false; cv.style.cursor='grab'; };
  cv.addEventListener('mousedown',down); window.addEventListener('mouseup',up);
  cv.addEventListener('mousemove',e=>{ if(!_nnXor.drag)return; const r=cv.getBoundingClientRect(); const S=Math.min(r.width,r.height); const ox=(r.width-S)/2; const gx=(e.clientX-r.left-ox)/S*3-0.5; const gy=(r.height-(e.clientY-r.top))/S*3-0.5; _nnXor.angle=Math.atan2(gy-0.5,gx-0.5); nnXorSync(); nnXorDraw(); });
  nnXorDraw();
}
function nnXorFn(f){ _nnXor.fn=f; ['AND','OR','XOR'].forEach(k=>lrEl('nn-xor-'+k).classList.toggle('on',k===f)); nnXorDraw(); }
function nnXorAng(v){ _nnXor.angle=parseFloat(v); nnXorDraw(); }
function nnXorOff(v){ _nnXor.offset=parseFloat(v); nnXorDraw(); }
function nnXorSync(){ const a=lrEl('nn-xor-ang'); if(a) a.value=_nnXor.angle; }
function nnXorDraw(){
  const c=lrCanvas('nn-xor-cv',300); if(!c) return;
  const {ctx,W,H}=c; const S=Math.min(W,H), ox=(W-S)/2;
  const sx=x=>ox+(x+0.5)/3*S, sy=y=>H-((y+0.5)/3*S);
  // line normal from angle; classify side by sign of (cos,sin)·(x,y) - offset
  const nx=Math.cos(_nnXor.angle), ny=Math.sin(_nnXor.angle);
  // shaded half-planes
  const step=10;
  for(let px=0;px<S;px+=step)for(let py=0;py<S;py+=step){ const gx=(px/S)*3-0.5, gy=(1-py/S)*3-0.5; const side=nx*gx+ny*gy-_nnXor.offset; ctx.fillStyle=side>=0?'rgba(61,220,132,0.10)':'rgba(255,95,142,0.10)'; ctx.fillRect(ox+px,py,step,step); }
  // the line
  ctx.strokeStyle=LRC.text; ctx.lineWidth=2;
  // line: nx*x+ny*y=offset -> param
  const tx=-ny, ty=nx; const cxp=nx*_nnXor.offset, cyp=ny*_nnXor.offset;
  ctx.beginPath(); ctx.moveTo(sx(cxp-tx*3),sy(cyp-ty*3)); ctx.lineTo(sx(cxp+tx*3),sy(cyp+ty*3)); ctx.stroke();
  // points
  let miss=0;
  XOR_FNS[_nnXor.fn].forEach(([x,y,label])=>{
    const side=nx*x+ny*y-_nnXor.offset; const pred=side>=0?1:0; if(pred!==label)miss++;
    ctx.beginPath(); ctx.arc(sx(x),sy(y),11,0,7);
    if(label===1){ ctx.fillStyle=LRC.acc; ctx.fill(); } else { ctx.strokeStyle=LRC.acc; ctx.lineWidth=2.5; ctx.stroke(); ctx.fillStyle=LRC.bg; ctx.fill(); ctx.strokeStyle=LRC.acc; ctx.stroke(); }
    if(pred!==label){ ctx.strokeStyle=LRC.red; ctx.lineWidth=2.5; ctx.beginPath(); ctx.arc(sx(x),sy(y),15,0,7); ctx.stroke(); }
  });
  lrTxt('nn-xor-miss', miss+' / 4');
  const mEl=lrEl('nn-xor-miss'); if(mEl) mEl.style.color=miss===0?LRC.grn:LRC.red;
  if(_nnXor.fn==='XOR' && miss>0) lrSet('nn-xor-note','<b style="color:'+LRC.red+'">XOR is not linearly separable.</b> No straight line works \u2014 the true corners are diagonal. This is the wall a single neuron hits. \u00a76.2.1 shows the fix.');
  else if(miss===0) lrSet('nn-xor-note','<b style="color:'+LRC.grn+'">Solved.</b> '+_nnXor.fn+' is linearly separable \u2014 one line suffices. Now switch to XOR and try again.');
}

// ───────────────────────────────────────────────────────────
// 6.2.1 — Space-warp: hidden layer solves XOR  [flagship]
// ───────────────────────────────────────────────────────────
// hidden layer (from J&M fig 6.6): h = ReLU(W x + b), W=[[1,1],[1,1]], b=[0,-1], then it collapses [0,1]&[1,0]
let _nnWarp = { t:0, anim:null, stepIdx:-1 };
const WARP_PTS = [ {x:0,y:0,c:0}, {x:0,y:1,c:1}, {x:1,y:0,c:1}, {x:1,y:1,c:0} ];
function nnWarpHidden(x,y){
  // two hidden units
  const h1 = nnRelu(1*x + 1*y + 0);    // fires on how many inputs are 1
  const h2 = nnRelu(1*x + 1*y - 1);    // fires only when both are 1
  return [h1, h2];
}
function nnWarpInit(){
  _nnWarp = { t:0, anim:null, stepIdx:-1 };
  const host = lrEl('nn-warp'); if(!host) return;
  host.innerHTML =
    '<div class="nn-split">'+
      '<div><div class="nn-split-lab">original x-space (no line works)</div><canvas id="nn-warp-x" style="width:100%;display:block"></canvas></div>'+
      '<div><div class="nn-split-lab">hidden h-space (now separable)</div><canvas id="nn-warp-h" style="width:100%;display:block"></canvas></div>'+
    '</div>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center">'+
      '<button class="lr-btn solid" id="nn-warp-play" onclick="nnWarpPlay()">\u25b6 Warp the space</button>'+
      '<button class="lr-btn" onclick="nnWarpStep()">step one point</button>'+
      '<button class="lr-btn" onclick="nnWarpReset()">reset</button>'+
    '</div>'+
    '<div class="lr-note" id="nn-warp-note">The two positive points [0,1] and [1,0] slide together onto the same hidden point, and suddenly one line separates the classes.</div>';
  nnWarpDrawX(); nnWarpDrawH();
}
function nnWarpReset(){ if(_nnWarp.anim)cancelAnimationFrame(_nnWarp.anim); _nnWarp.t=0; _nnWarp.stepIdx=-1; nnWarpDrawX(); nnWarpDrawH(); }
function nnWarpPlay(){
  if(_nnWarp.anim){ cancelAnimationFrame(_nnWarp.anim); _nnWarp.anim=null; }
  const t0=performance.now();
  const step=(t)=>{ _nnWarp.t=Math.min(1,(t-t0)/1100); nnWarpDrawH(); if(_nnWarp.t<1) _nnWarp.anim=nnRaf(step); else lrSet('nn-warp-note','<b style="color:'+LRC.grn+'">Done.</b> [0,1] and [1,0] both landed on the hidden point [1,0]. Now the two classes are on opposite sides of a single line \u2014 XOR solved by re-representation.'); };
  _nnWarp.anim=nnRaf(step);
}
function nnWarpStep(){ _nnWarp.stepIdx=(_nnWarp.stepIdx+1)%4; _nnWarp.t=1; nnWarpDrawX(); nnWarpDrawH(); const p=WARP_PTS[_nnWarp.stepIdx]; const h=nnWarpHidden(p.x,p.y); lrSet('nn-warp-note','Input ['+p.x+','+p.y+'] \u2192 hidden ['+h[0]+','+h[1]+']. '+(p.c===1?'A positive point.':'A negative point.')); }
function nnWarpDrawX(){
  const c=lrCanvas('nn-warp-x',240); if(!c) return; const {ctx,W,H}=c; const S=Math.min(W,H),ox=(W-S)/2;
  const sx=x=>ox+(x+0.3)/1.6*S, sy=y=>H-((y+0.3)/1.6*S);
  ctx.strokeStyle=LRC.grid; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(sx(0),sy(-0.3)); ctx.lineTo(sx(0),sy(1.3)); ctx.moveTo(sx(-0.3),sy(0)); ctx.lineTo(sx(1.3),sy(0)); ctx.stroke();
  WARP_PTS.forEach((p,i)=>{ const hl=_nnWarp.stepIdx===i; nnWarpDot(ctx,sx(p.x),sy(p.y),p.c,hl,'['+p.x+','+p.y+']'); });
}
function nnWarpDrawH(){
  const c=lrCanvas('nn-warp-h',240); if(!c) return; const {ctx,W,H}=c; const S=Math.min(W,H),ox=(W-S)/2;
  const sx=x=>ox+(x+0.3)/2.6*S, sy=y=>H-((y+0.3)/2.6*S);
  ctx.strokeStyle=LRC.grid; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(sx(0),sy(-0.3)); ctx.lineTo(sx(0),sy(2.3)); ctx.moveTo(sx(-0.3),sy(0)); ctx.lineTo(sx(2.3),sy(0)); ctx.stroke();
  // separating line in h-space once warped: h1 - 2*h2 = 0.5 works to separate the collapsed positive from negatives
  if(_nnWarp.t>0.5){ ctx.strokeStyle='rgba(61,220,132,0.5)'; ctx.lineWidth=2; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.moveTo(sx(0.5),sy(-0.3)); ctx.lineTo(sx(0.5),sy(2.3)); ctx.stroke(); ctx.setLineDash([]); }
  WARP_PTS.forEach((p,i)=>{
    const h=nnWarpHidden(p.x,p.y);
    // interpolate from original position to hidden position
    const startx=p.x, starty=p.y;
    const cx=startx+(h[0]-startx)*_nnWarp.t, cy=starty+(h[1]-starty)*_nnWarp.t;
    const hl=_nnWarp.stepIdx===i;
    nnWarpDot(ctx,sx(cx),sy(cy),p.c,hl, _nnWarp.t>0.8?('['+h[0]+','+h[1]+']'):'');
  });
}
function nnWarpDot(ctx,x,y,cls,hl,lab){
  ctx.beginPath(); ctx.arc(x,y,hl?13:10,0,7);
  if(cls===1){ ctx.fillStyle=LRC.acc; ctx.fill(); } else { ctx.fillStyle=LRC.bg; ctx.fill(); ctx.strokeStyle=LRC.acc; ctx.lineWidth=2.5; ctx.stroke(); }
  if(hl){ ctx.strokeStyle=LRC.amb; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,16,0,7); ctx.stroke(); }
  if(lab){ ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(lab,x,y-16); ctx.textAlign='left'; }
}

// ───────────────────────────────────────────────────────────
// 6.3 — Network builder
// ───────────────────────────────────────────────────────────
let _nnBuild = { hidden:3, showShapes:false, pulse:0, anim:null };
function nnBuilderInit(){
  _nnBuild = { hidden:3, showShapes:false, pulse:0, anim:null };
  const host = lrEl('nn-builder'); if(!host) return;
  host.innerHTML =
    '<div class="nn-split"><div><canvas id="nn-build-cv" style="width:100%;display:block"></canvas></div>'+
      '<div><div class="nn-split-lab">weight matrix W (hidden \u00d7 input)</div><div id="nn-build-mat"></div>'+
        '<div class="nn-split-lab" style="margin-top:1rem">softmax output</div><div id="nn-build-out"></div></div></div>'+
    '<div class="lr-ctl" style="margin-top:1rem">'+
      '<div class="lr-sl">hidden units<input id="nn-build-h" type="range" min="1" max="6" step="1" value="3" oninput="nnBuildH(this.value)"><b id="nn-build-hv">3</b></div>'+
      '<button class="lr-btn solid" style="margin-left:auto" onclick="nnBuildPulse()">\u25b6 send a pulse</button>'+
      '<button class="lr-btn" id="nn-build-shapes" onclick="nnBuildShapes()">shapes: off</button>'+
    '</div>'+
    '<div class="lr-note">Add units and watch W grow a row each. Every arrow is one weight W\u2c7c\u1d62; the softmax bar always sums to 1.</div>';
  nnBuildDraw(); nnBuildMat(); nnBuildOut();
}
function nnBuildH(v){ _nnBuild.hidden=parseInt(v); lrTxt('nn-build-hv',v); nnBuildDraw(); nnBuildMat(); nnBuildOut(); }
function nnBuildShapes(){ _nnBuild.showShapes=!_nnBuild.showShapes; lrEl('nn-build-shapes').textContent='shapes: '+(_nnBuild.showShapes?'on':'off'); nnBuildDraw(); }
function nnBuildPulse(){ if(_nnBuild.anim)cancelAnimationFrame(_nnBuild.anim); _nnBuild.pulse=0; const t0=performance.now(); const step=(t)=>{ _nnBuild.pulse=Math.min(1,(t-t0)/1200); nnBuildDraw(); if(_nnBuild.pulse<1)_nnBuild.anim=nnRaf(step); }; _nnBuild.anim=nnRaf(step); }
function nnBuildDraw(){
  const c=lrCanvas('nn-build-cv',300); if(!c) return;
  const {ctx,W,H}=c; const nin=3, nh=_nnBuild.hidden, nout=3;
  const cols=[{n:nin,x:W*0.14,c:LRC.pur,lab:'input'},{n:nh,x:W*0.5,c:LRC.acc,lab:'hidden'},{n:nout,x:W*0.86,c:LRC.grn,lab:'output'}];
  const nodePos=cols.map(col=>{ const ys=[]; for(let i=0;i<col.n;i++) ys.push(H*0.14 + (H*0.72)*(col.n===1?0.5:i/(col.n-1))); return ys; });
  // edges
  for(let l=0;l<2;l++){ nodePos[l].forEach((y1,i)=>nodePos[l+1].forEach((y2,j)=>{
    const on = _nnBuild.pulse>0 && _nnBuild.pulse>(l*0.5) && _nnBuild.pulse<(l*0.5+0.6);
    ctx.strokeStyle= on?LRC.acc:'rgba(214,226,255,0.12)'; ctx.lineWidth=on?2:1; ctx.beginPath(); ctx.moveTo(cols[l].x+12,y1); ctx.lineTo(cols[l+1].x-12,y2); ctx.stroke();
    if(_nnBuild.showShapes && l===0 && i===0 && j===0){ ctx.fillStyle=LRC.muted; ctx.font='8px IBM Plex Mono, monospace'; ctx.fillText('W\u2c7c\u1d62',(cols[0].x+cols[1].x)/2-8,(y1+y2)/2-4); }
  })); }
  // nodes
  cols.forEach((col,l)=>{ nodePos[l].forEach(y=>{ ctx.fillStyle=col.c; ctx.beginPath(); ctx.arc(col.x,y,11,0,7); ctx.fill(); });
    ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(col.lab,col.x,H-6);
    if(_nnBuild.showShapes){ ctx.fillStyle=col.c; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('['+col.n+']',col.x,20); }
    ctx.textAlign='left';
  });
}
function nnBuildMat(){
  const host=lrEl('nn-build-mat'); if(!host) return;
  const nh=_nnBuild.hidden;
  let rows='';
  for(let j=0;j<nh;j++){ let cells=''; for(let i=0;i<3;i++){ const v=(Math.sin(j*1.7+i*2.3)*0.6).toFixed(1); cells+='<td style="padding:.25rem .45rem;font-family:var(--mono);font-size:.7rem;color:'+(v>=0?LRC.acc:LRC.red)+'">'+v+'</td>'; } rows+='<tr>'+cells+'</tr>'; }
  host.innerHTML='<table style="border-collapse:collapse;margin:0 auto;border:1px solid var(--border2)"><tbody>'+rows+'</tbody></table>'+
    '<div style="font-family:var(--mono);font-size:.66rem;color:var(--muted);text-align:center;margin-top:.4rem">'+nh+' \u00d7 3 = '+(nh*3)+' weights</div>';
}
function nnBuildOut(){
  const host=lrEl('nn-build-out'); if(!host) return;
  // fake logits -> softmax
  const logits=[0.6,1.4,-0.3]; const ex=logits.map(Math.exp); const tot=ex.reduce((a,b)=>a+b); const p=ex.map(e=>e/tot);
  const labels=['pos','neg','neu']; const cols=[LRC.grn,LRC.red,LRC.muted];
  host.innerHTML=labels.map((l,i)=>'<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.35rem"><span style="font-family:var(--mono);font-size:.7rem;width:28px;color:'+cols[i]+'">'+l+'</span><div style="flex:1;height:16px;background:var(--surface3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+(p[i]*100).toFixed(0)+'%;background:'+cols[i]+'"></div></div><span style="font-family:var(--mono);font-size:.68rem;color:var(--muted);width:36px">'+(p[i]*100).toFixed(0)+'%</span></div>').join('')+
    '<div style="font-family:var(--mono);font-size:.66rem;color:var(--muted);text-align:center;margin-top:.3rem">\u03a3 = 100%</div>';
}

// ───────────────────────────────────────────────────────────
// 6.3.1 — Collapse the linear stack
// ───────────────────────────────────────────────────────────
let _nnCollapse = { nonlin:false, collapsed:false };
function nnCollapseInit(){
  _nnCollapse = { nonlin:false, collapsed:false };
  const host = lrEl('nn-collapse'); if(!host) return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center">'+
      '<button class="lr-btn" id="nn-col-act" onclick="nnCollapseAct()">activation: identity (linear)</button>'+
      '<button class="lr-btn solid" id="nn-col-go" onclick="nnCollapseGo()">\u25b6 try to merge W\u00b2W\u00b9</button>'+
      '<button class="lr-btn" onclick="nnCollapseInit()">reset</button>'+
    '</div>'+
    '<canvas id="nn-col-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-note" id="nn-col-note">Two stacked layers with identity activations. Press merge and watch them collapse into one matrix W\u2032.</div>';
  nnCollapseDraw();
}
function nnCollapseAct(){ _nnCollapse.nonlin=!_nnCollapse.nonlin; _nnCollapse.collapsed=false; lrEl('nn-col-act').textContent='activation: '+(_nnCollapse.nonlin?'ReLU (non-linear)':'identity (linear)'); lrEl('nn-col-act').classList.toggle('on',_nnCollapse.nonlin); nnCollapseDraw(); lrSet('nn-col-note',_nnCollapse.nonlin?'With a real non-linearity between them, the layers <b>cannot</b> be merged \u2014 try it.':'Two stacked layers with identity activations. Press merge and watch them collapse into one matrix W\u2032.'); }
function nnCollapseGo(){
  if(_nnCollapse.nonlin){ lrSet('nn-col-note','<b style="color:'+LRC.red+'">Cannot merge.</b> A non-linearity sits between the matrices; no single matrix W\u2032 reproduces ReLU(W\u00b9x) then W\u00b2. The layers stay distinct \u2014 that is why depth needs non-linearity.'); nnCollapseDraw(true); return; }
  _nnCollapse.collapsed=true; lrSet('nn-col-note','<b style="color:'+LRC.grn+'">Collapsed.</b> W\u00b2W\u00b9 = W\u2032, a single matrix. The two linear layers were secretly one all along \u2014 no extra power gained.'); nnCollapseDraw();
}
function nnCollapseDraw(shake){
  const c=lrCanvas('nn-col-cv',220); if(!c) return;
  const {ctx,W,H}=c; const cy=H/2;
  if(_nnCollapse.collapsed && !_nnCollapse.nonlin){
    // single merged matrix
    ctx.fillStyle=LRC.s3; ctx.strokeStyle=LRC.grn; ctx.lineWidth=2; const bw=90,bh=70; ctx.beginPath(); ctx.roundRect(W/2-bw/2,cy-bh/2,bw,bh,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle=LRC.grn; ctx.font='700 20px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('W\u2032',W/2,cy+7);
    ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText('one linear layer',W/2,cy+bh/2+18); ctx.textAlign='left';
    return;
  }
  const boxes=[{lab:'W\u00b9',x:W*0.26,col:LRC.acc},{lab:_nnCollapse.nonlin?'ReLU':'id',x:W*0.5,col:_nnCollapse.nonlin?LRC.amb:LRC.muted},{lab:'W\u00b2',x:W*0.74,col:LRC.pur}];
  const jitter = shake? (Math.random()-0.5)*6 : 0;
  boxes.forEach((b,i)=>{
    if(i<boxes.length-1){ ctx.strokeStyle=LRC.grid; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(b.x+30,cy); ctx.lineTo(boxes[i+1].x-30,cy); ctx.stroke(); }
    const isAct=i===1;
    ctx.fillStyle=LRC.s2; ctx.strokeStyle=b.col; ctx.lineWidth=2;
    const bw=isAct?54:66, bh=isAct?54:60;
    ctx.beginPath(); ctx.roundRect(b.x-bw/2+(isAct?jitter:0),cy-bh/2,bw,bh, isAct?27:8); ctx.fill(); ctx.stroke();
    ctx.fillStyle=b.col; ctx.font='700 15px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(b.lab,b.x+(isAct?jitter:0),cy+5); ctx.textAlign='left';
  });
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('x',W*0.08,cy+4); ctx.fillText('output',W*0.92,cy+4); ctx.textAlign='left';
}


// ═══════════════════════════════════════════════════════════
// CHAPTER 6 · INSTRUMENTS  (part 2: 6.4–6.5)
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// 6.4 — Logistic regression grows a hidden layer (morph)
// ───────────────────────────────────────────────────────────
let _nnMorph = { t:0, anim:null };
function nnMorphInit(){
  _nnMorph = { t:0, anim:null };
  const host = lrEl('nn-morph'); if(!host) return;
  host.innerHTML =
    '<canvas id="nn-morph-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center">'+
      '<button class="lr-btn solid" onclick="nnMorphGo(1)">\u25b6 grow a hidden layer</button>'+
      '<button class="lr-btn" onclick="nnMorphGo(0)">back to logistic regression</button>'+
    '</div>'+
    '<div class="nn-split" style="margin-top:1rem">'+
      '<div class="lr-card"><div class="lr-card-t">plain logistic regression</div><div class="lr-card-b">one straight boundary; features go directly to softmax.</div></div>'+
      '<div class="lr-card"><div class="lr-card-t" style="color:'+LRC.acc+'">2-layer network</div><div class="lr-card-b">hidden units learn feature interactions; boundary can bend.</div></div>'+
    '</div>';
  nnMorphDraw();
}
function nnMorphGo(dir){ if(_nnMorph.anim)cancelAnimationFrame(_nnMorph.anim); const from=_nnMorph.t, to=dir, t0=performance.now(); const step=(t)=>{ let k=Math.min(1,(t-t0)/700); _nnMorph.t=from+(to-from)*(1-Math.pow(1-k,3)); nnMorphDraw(); if(k<1)_nnMorph.anim=nnRaf(step); }; _nnMorph.anim=nnRaf(step); }
function nnMorphDraw(){
  const c=lrCanvas('nn-morph-cv',240); if(!c) return;
  const {ctx,W,H}=c; const t=_nnMorph.t;
  const inx=W*0.12, midx=W*0.5, outx=W*0.88;
  const inys=[H*0.28,H*0.5,H*0.72];
  const feats=['count','pos-lex','\u201cno\u201d?'];
  // input nodes
  inys.forEach((y,i)=>{ ctx.fillStyle=LRC.pur; ctx.beginPath(); ctx.arc(inx,y,12,0,7); ctx.fill(); ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.textAlign='right'; ctx.fillText(feats[i],inx-16,y+3); ctx.textAlign='left'; });
  // hidden nodes fade in with t
  const hys=[H*0.32,H*0.5,H*0.68];
  if(t>0.02){ ctx.globalAlpha=t; hys.forEach(y=>{ ctx.fillStyle=LRC.acc; ctx.beginPath(); ctx.arc(midx,y,11,0,7); ctx.fill(); }); ctx.globalAlpha=1; }
  // output
  ctx.fillStyle=LRC.grn; ctx.beginPath(); ctx.arc(outx,H*0.5,13,0,7); ctx.fill();
  ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('softmax',outx-18,H*0.5+28);
  // edges: direct (fade out with t) vs via hidden (fade in)
  inys.forEach(y1=>{ ctx.strokeStyle='rgba(214,226,255,'+(0.18*(1-t))+')'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(inx+12,y1); ctx.lineTo(outx-13,H*0.5); ctx.stroke(); });
  if(t>0.02){ ctx.globalAlpha=t; inys.forEach(y1=>hys.forEach(y2=>{ ctx.strokeStyle='rgba(77,227,255,0.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(inx+12,y1); ctx.lineTo(midx-11,y2); ctx.stroke(); })); hys.forEach(y2=>{ ctx.strokeStyle='rgba(61,220,132,0.25)'; ctx.beginPath(); ctx.moveTo(midx+11,y2); ctx.lineTo(outx-13,H*0.5); ctx.stroke(); }); ctx.globalAlpha=1; }
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='center';
  ctx.fillText(t<0.5?'logistic regression: features \u2192 softmax':'neural net: features \u2192 hidden layer \u2192 softmax',W/2,H-8); ctx.textAlign='left';
}

// ───────────────────────────────────────────────────────────
// 6.4.1 — Live sentiment through a hidden layer
// ───────────────────────────────────────────────────────────
const NN_SENTI_POS=['great','love','amazing','excellent','good','wonderful','best','fun','brilliant'];
const NN_SENTI_NEG=['bad','hate','terrible','awful','worst','boring','poor','waste'];
let _nnSenti = { text:'not bad but not great either' };
function nnSentiInit(){
  _nnSenti = { text:'not bad but not great either' };
  const host = lrEl('nn-senti'); if(!host) return;
  host.innerHTML =
    '<input id="nn-senti-in" value="'+_nnSenti.text+'" oninput="nnSentiSet(this.value)" style="width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.6rem .8rem;font-family:var(--mono);font-size:.85rem;color:var(--text);outline:none;box-sizing:border-box;margin-bottom:1rem">'+
    '<div class="nn-split"><div><div class="nn-split-lab">extracted features</div><div id="nn-senti-feats"></div></div>'+
      '<div><div class="nn-split-lab">prediction</div><div id="nn-senti-out"></div></div></div>';
  nnSentiRender();
}
function nnSentiSet(v){ _nnSenti.text=v; nnSentiRender(); }
function nnSentiRender(){
  const toks=_nnSenti.text.toLowerCase().split(/\s+/).filter(Boolean);
  const count=toks.length;
  const pos=toks.filter(w=>NN_SENTI_POS.includes(w)).length;
  const neg=toks.filter(w=>NN_SENTI_NEG.includes(w)).length;
  const hasNo=/\b(no|not|never|n't)\b/.test(_nnSenti.text.toLowerCase())?1:0;
  lrSet('nn-senti-feats',
    nnSentiFeat('word count',count,count/12)+
    nnSentiFeat('positive words',pos,pos/4,LRC.grn)+
    nnSentiFeat('negative words',neg,neg/4,LRC.red)+
    nnSentiFeat('has negation',hasNo,hasNo,LRC.amb));
  // hidden layer + softmax (toy): negation flips positive contribution
  let sPos = pos*1.4 - neg*1.2 - (hasNo&&pos?1.5:0);
  let sNeg = neg*1.4 - pos*1.0 + (hasNo&&pos?0.8:0);
  let sNeu = 0.6 - Math.abs(pos-neg)*0.5 + (hasNo?0.6:0);
  const ex=[Math.exp(sPos),Math.exp(sNeg),Math.exp(sNeu)]; const tot=ex.reduce((a,b)=>a+b); const p=ex.map(e=>e/tot);
  const labs=['positive','negative','neutral'], cols=[LRC.grn,LRC.red,LRC.muted];
  lrSet('nn-senti-out', labs.map((l,i)=>'<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem"><span style="font-family:var(--mono);font-size:.72rem;width:58px;color:'+cols[i]+'">'+l+'</span><div style="flex:1;height:20px;background:var(--surface3);border-radius:5px;overflow:hidden"><div style="height:100%;width:'+(p[i]*100).toFixed(0)+'%;background:'+cols[i]+';transition:width .3s"></div></div><span style="font-family:var(--mono);font-size:.72rem;color:var(--text);width:36px">'+(p[i]*100).toFixed(0)+'%</span></div>').join('')+
    '<div class="lr-note" style="margin-top:.6rem">Negation before a positive word is handled by the hidden layer, not a single linear rule.</div>');
}
function nnSentiFeat(name,val,frac,col){
  col=col||LRC.acc; frac=lrClamp(frac,0,1);
  return '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem"><span style="font-family:var(--mono);font-size:.68rem;color:var(--muted);width:100px">'+name+'</span><div style="flex:1;height:16px;background:var(--surface3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+(frac*100).toFixed(0)+'%;background:'+col+'"></div></div><span style="font-family:var(--mono);font-size:.72rem;color:'+col+';width:24px">'+val+'</span></div>';
}

// ───────────────────────────────────────────────────────────
// 6.4.2 — Loop vs matrix race
// ───────────────────────────────────────────────────────────
let _nnVec = { anim:null };
function nnVecInit(){
  const host = lrEl('nn-vec'); if(!host) return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem"><button class="lr-btn solid" onclick="nnVecRace()">\u25b6 Race them</button><span class="lr-note" style="margin:0">8 examples, one hidden layer.</span></div>'+
    '<div class="nn-split">'+
      '<div class="lr-card"><div class="lr-card-t">for-loop \u2014 one row at a time</div><div id="nn-vec-loop" style="margin-top:.6rem"></div><div id="nn-vec-loop-t" style="font-family:var(--mono);font-size:.72rem;color:'+LRC.amb+';margin-top:.5rem">idle</div></div>'+
      '<div class="lr-card"><div class="lr-card-t">H = f(XW\u1d40+b) \u2014 all rows at once</div><div id="nn-vec-mat" style="margin-top:.6rem"></div><div id="nn-vec-mat-t" style="font-family:var(--mono);font-size:.72rem;color:'+LRC.acc+';margin-top:.5rem">idle</div></div>'+
    '</div>'+
    '<div class="lr-note">Same arithmetic per row; the matrix form lets the hardware compute every example in parallel.</div>';
  nnVecRows('nn-vec-loop',-1); nnVecRows('nn-vec-mat',-1);
}
function nnVecRows(id,active){
  const host=lrEl(id); if(!host) return; let h='';
  for(let i=0;i<8;i++){ const isMat=id.includes('mat'); const on=isMat?(active>=0):(i===active); const done=isMat?false:(i<active); const col=on?LRC.acc:done?LRC.grn:LRC.s3; h+='<div style="height:11px;border-radius:3px;background:'+col+';margin-bottom:3px;opacity:'+(on||done?1:.5)+'"></div>'; }
  host.innerHTML=h;
}
function nnVecRace(){
  if(_nnVec.anim)clearInterval(_nnVec.anim); let i=0;
  nnVecRows('nn-vec-mat',1); lrTxt('nn-vec-mat-t','done in 1 matmul');
  lrTxt('nn-vec-loop-t','running...');
  _nnVec.anim=nnTimer(()=>{ nnVecRows('nn-vec-loop',i); if(i>=8){ clearInterval(_nnVec.anim); _nnVec.anim=null; lrTxt('nn-vec-loop-t','done in 8 iterations \u2014 8\u00d7 slower'); return; } i++; }, 200);
}

// ───────────────────────────────────────────────────────────
// 6.5 — One-hot as a selector  [flagship]
// ───────────────────────────────────────────────────────────
const LOOKUP_VOCAB=['the','cat','dog','sat','ran','fed'];
const LOOKUP_E = LOOKUP_VOCAB.map((w,i)=>[ +(Math.sin(i*1.3)*0.8).toFixed(2), +(Math.cos(i*0.9)*0.8).toFixed(2), +(Math.sin(i*2.1+1)*0.8).toFixed(2), +(Math.cos(i*1.7)*0.8).toFixed(2) ]);
let _nnLookup = { word:'cat', mode:'pool', sentence:['the','cat','sat'] };
function nnLookupInit(){
  _nnLookup = { word:'cat', mode:'pool', sentence:['the','cat','sat'] };
  const host = lrEl('nn-lookup'); if(!host) return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem"><span class="lr-note" style="margin:0">Look up a word:</span>'+
      LOOKUP_VOCAB.map(w=>'<button class="lr-btn '+(w==='cat'?'on':'')+'" onclick="nnLookupWord(\''+w+'\')">'+w+'</button>').join('')+'</div>'+
    '<canvas id="nn-lookup-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1.2rem;justify-content:center"><span class="lr-note" style="margin:0">Combine sentence \u201cthe cat sat\u201d by:</span>'+
      '<button class="lr-btn on" id="nn-look-pool" onclick="nnLookupMode(\'pool\')">pooling</button>'+
      '<button class="lr-btn" id="nn-look-concat" onclick="nnLookupMode(\'concat\')">concatenation</button></div>'+
    '<div id="nn-lookup-combine"></div>';
  nnLookupDraw(); nnLookupCombine();
}
function nnLookupWord(w){ _nnLookup.word=w; document.querySelectorAll('#nn-lookup .lr-btn').forEach(b=>{ if(LOOKUP_VOCAB.includes(b.textContent)) b.classList.toggle('on',b.textContent===w); }); nnLookupDraw(); }
function nnLookupMode(m){ _nnLookup.mode=m; lrEl('nn-look-pool').classList.toggle('on',m==='pool'); lrEl('nn-look-concat').classList.toggle('on',m==='concat'); nnLookupCombine(); }
function nnLookupDraw(){
  const c=lrCanvas('nn-lookup-cv',240); if(!c) return;
  const {ctx,W,H}=c; const wi=LOOKUP_VOCAB.indexOf(_nnLookup.word);
  // one-hot vector (left)
  const ohx=20, ohw=26, cellH=(H-60)/LOOKUP_VOCAB.length;
  ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('one-hot',ohx,24);
  LOOKUP_VOCAB.forEach((w,i)=>{ const on=i===wi; ctx.fillStyle=on?LRC.amb:LRC.s3; ctx.fillRect(ohx,40+i*cellH,ohw,cellH-3); ctx.fillStyle=on?'#070B18':LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(on?'1':'0',ohx+ohw/2,40+i*cellH+cellH/2+3); ctx.textAlign='left'; });
  // E matrix (middle)
  const ex=90, ecw=34, dcols=4;
  ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('embedding matrix E',ex,24);
  LOOKUP_VOCAB.forEach((w,i)=>{ const on=i===wi; for(let d=0;d<dcols;d++){ ctx.fillStyle=on?'rgba(77,227,255,0.32)':'var(--surface3)'; ctx.fillStyle=on?'rgba(77,227,255,0.3)':'#182342'; ctx.fillRect(ex+d*ecw,40+i*cellH,ecw-2,cellH-3); ctx.fillStyle=on?LRC.acc:LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(LOOKUP_E[i][d].toFixed(1),ex+d*ecw+ecw/2-1,40+i*cellH+cellH/2+3); ctx.textAlign='left'; }
    ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText(w,ex+dcols*ecw+4,40+i*cellH+cellH/2+3); });
  // arrow to result
  const resx=ex+dcols*ecw+70;
  ctx.strokeStyle=LRC.amb; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(ex+dcols*ecw+40,40+wi*cellH+cellH/2); ctx.lineTo(resx-6,H*0.5); ctx.stroke();
  // plucked row
  ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('selected row = embedding("'+_nnLookup.word+'")',resx-10,H*0.5-22);
  for(let d=0;d<dcols;d++){ ctx.fillStyle=lrMix('#223055',LRC.acc,(LOOKUP_E[wi][d]+0.8)/1.6); ctx.fillRect(resx+d*ecw,H*0.5-12,ecw-2,24); ctx.fillStyle=LRC.text; ctx.font='9px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(LOOKUP_E[wi][d].toFixed(1),resx+d*ecw+ecw/2-1,H*0.5+3); ctx.textAlign='left'; }
}
function nnLookupCombine(){
  const host=lrEl('nn-lookup-combine'); if(!host) return;
  const vecs=_nnLookup.sentence.map(w=>LOOKUP_E[LOOKUP_VOCAB.indexOf(w)]);
  if(_nnLookup.mode==='pool'){
    const avg=[0,1,2,3].map(d=>vecs.reduce((s,v)=>s+v[d],0)/vecs.length);
    host.innerHTML='<div style="text-align:center;margin-top:.4rem"><div style="font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:.4rem">average of 3 word vectors \u2192 one blob (order lost)</div>'+
      '<div style="display:inline-flex;gap:3px">'+avg.map(v=>'<div style="width:40px;height:26px;background:'+lrMix('#223055',LRC.acc,(v+0.8)/1.6)+';border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:.7rem;color:var(--text)">'+v.toFixed(1)+'</div>').join('')+'</div>'+
      '<div class="lr-note">Compact and order-free \u2014 good for sentiment.</div></div>';
  } else {
    host.innerHTML='<div style="text-align:center;margin-top:.4rem"><div style="font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:.4rem">3 vectors end-to-end \u2192 long ordered strip (order kept)</div>'+
      '<div style="display:inline-flex;gap:6px;flex-wrap:wrap;justify-content:center">'+vecs.map((v,wi)=>'<div style="display:flex;gap:2px;border:1px solid var(--border2);border-radius:5px;padding:2px">'+v.map(x=>'<div style="width:26px;height:24px;background:'+lrMix('#223055',LRC.pur,(x+0.8)/1.6)+';border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:.62rem;color:var(--text)">'+x.toFixed(1)+'</div>').join('')+'</div>').join('')+'</div>'+
      '<div class="lr-note">Long but position-aware \u2014 needed for a language model.</div></div>';
  }
}

// ───────────────────────────────────────────────────────────
// 6.5 — cat/dog generalization demo
// ───────────────────────────────────────────────────────────
let _nnGen = { subject:'dog' };
function nnGenInit(){
  _nnGen = { subject:'dog' };
  const host = lrEl('nn-gen'); if(!host) return;
  host.innerHTML =
    '<div class="lr-card" style="margin-bottom:1rem"><div class="lr-card-t">training saw</div><div style="font-family:var(--mono);font-size:.9rem;color:var(--text);margin-top:.3rem">the <span style="color:'+LRC.grn+'">cat</span> gets fed</div></div>'+
    '<div class="lr-ctl" style="margin-bottom:1rem"><span class="lr-note" style="margin:0">test-time subject:</span>'+
      '<button class="lr-btn '+(_nnGen.subject==='dog'?'on':'')+'" onclick="nnGenSub(\'dog\')">dog</button>'+
      '<button class="lr-btn" onclick="nnGenSub(\'car\')">car</button>'+
      '<button class="lr-btn" onclick="nnGenSub(\'cat\')">cat</button></div>'+
    '<canvas id="nn-gen-cv" style="width:100%;display:block"></canvas>'+
    '<div id="nn-gen-out"></div>';
  nnGenDraw(); nnGenOut();
}
function nnGenSub(s){ _nnGen.subject=s; document.querySelectorAll('#nn-gen .lr-btn').forEach(b=>b.classList.toggle('on',b.textContent===s)); nnGenDraw(); nnGenOut(); }
function nnGenDraw(){
  const c=lrCanvas('nn-gen-cv',180); if(!c) return;
  const {ctx,W,H}=c;
  // embedding space: cat and dog close, car far
  const pts={ cat:[0.3,0.6], dog:[0.42,0.52], car:[0.85,0.2] };
  const sx=x=>40+x*(W-80), sy=y=>H-30-y*(H-60);
  Object.keys(pts).forEach(w=>{ const on=w===_nnGen.subject||w==='cat'; ctx.fillStyle=w==='cat'?LRC.grn:(w===_nnGen.subject?LRC.acc:LRC.muted); ctx.beginPath(); ctx.arc(sx(pts[w][0]),sy(pts[w][1]),on?8:6,0,7); ctx.fill(); ctx.fillStyle=LRC.text; ctx.font='11px IBM Plex Mono, monospace'; ctx.fillText(w,sx(pts[w][0])+10,sy(pts[w][1])+3); });
  // distance line from cat to subject
  if(_nnGen.subject!=='cat'){ const a=pts.cat, b=pts[_nnGen.subject]; ctx.strokeStyle='rgba(77,227,255,0.4)'; ctx.setLineDash([4,4]); ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(sx(a[0]),sy(a[1])); ctx.lineTo(sx(b[0]),sy(b[1])); ctx.stroke(); ctx.setLineDash([]); }
  ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('embedding space',10,16);
}
function nnGenOut(){
  const host=lrEl('nn-gen-out'); if(!host) return;
  const dist={dog:0.14,car:0.68,cat:0}[_nnGen.subject];
  const pFed=lrClamp(0.95-dist*1.1,0.05,0.95);
  host.innerHTML='<div style="font-family:var(--mono);font-size:.9rem;color:var(--text);text-align:center;margin:.6rem 0">the <span style="color:'+LRC.acc+'">'+_nnGen.subject+'</span> gets <span style="color:'+LRC.grn+'">___</span></div>'+
    '<div style="display:flex;align-items:center;gap:.5rem;max-width:360px;margin:0 auto"><span style="font-family:var(--mono);font-size:.74rem;width:40px;color:'+LRC.grn+'">fed</span><div style="flex:1;height:20px;background:var(--surface3);border-radius:5px;overflow:hidden"><div style="height:100%;width:'+(pFed*100).toFixed(0)+'%;background:'+LRC.grn+';transition:width .3s"></div></div><span style="font-family:var(--mono);font-size:.74rem;width:36px">'+(pFed*100).toFixed(0)+'%</span></div>'+
    '<div class="lr-note" style="text-align:center">'+(_nnGen.subject==='dog'?'<b style="color:'+LRC.grn+'">dog</b> sits near <b style="color:'+LRC.grn+'">cat</b>, so \u201cfed\u201d gets high probability though the exact phrase was never seen. An n-gram model would be helpless here.':_nnGen.subject==='car'?'<b style="color:'+LRC.red+'">car</b> is far from cat in embedding space, so \u201cfed\u201d gets little mass \u2014 correctly, cars don\u2019t get fed.':'the exact training phrase \u2014 of course \u201cfed\u201d is confident.')+'</div>';
}


// ═══════════════════════════════════════════════════════════
// CHAPTER 6 · INSTRUMENTS  (part 3: 6.6–6.7)
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// 6.6 — Training-loop dashboard
// ───────────────────────────────────────────────────────────
let _nnDash = { epoch:0, loss:2.3, hist:[], anim:null, phase:0 };
function nnDashInit(){
  _nnDash = { epoch:0, loss:2.3, hist:[2.3], anim:null, phase:0 };
  const host = lrEl('nn-dash'); if(!host) return;
  host.innerHTML =
    '<canvas id="nn-dash-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center">'+
      '<button class="lr-btn solid" id="nn-dash-play" onclick="nnDashPlay()">\u25b6 Run training</button>'+
      '<button class="lr-btn" onclick="nnDashStep()">one epoch</button>'+
      '<button class="lr-btn" onclick="nnDashInit()">reset</button>'+
    '</div>'+
    '<div class="lr-readout" style="margin-top:.6rem;justify-content:center">'+
      '<span class="lr-stat"><span class="lr-stat-k">epoch</span><span class="lr-stat-v" id="nn-dash-ep">0</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">loss</span><span class="lr-stat-v" id="nn-dash-loss" style="color:'+LRC.red+'">2.30</span></span>'+
    '</div>'+
    '<div class="lr-note">forward \u2192 loss \u2192 backprop \u2192 update, repeated each epoch. The subsections open up each organ.</div>';
  nnDashDraw();
}
function nnDashStep(){
  _nnDash.epoch++;
  _nnDash.loss = Math.max(0.06, _nnDash.loss*0.82 + (Math.random()-0.5)*0.05);
  _nnDash.hist.push(_nnDash.loss); if(_nnDash.hist.length>60)_nnDash.hist.shift();
  lrTxt('nn-dash-ep',_nnDash.epoch); lrTxt('nn-dash-loss',_nnDash.loss.toFixed(2));
  nnDashDraw();
}
function nnDashPlay(){
  if(_nnDash.anim){clearInterval(_nnDash.anim);_nnDash.anim=null;const b=lrEl('nn-dash-play');if(b)b.textContent='\u25b6 Run training';return;}
  const b=lrEl('nn-dash-play'); if(b)b.textContent='\u2759\u2759 Pause';
  _nnDash.anim=nnTimer(()=>{ nnDashStep(); if(_nnDash.loss<0.1||_nnDash.epoch>50){clearInterval(_nnDash.anim);_nnDash.anim=null;const bb=lrEl('nn-dash-play');if(bb)bb.textContent='\u21ba Again';} }, 240);
}
function nnDashDraw(){
  const c=lrCanvas('nn-dash-cv',240); if(!c) return;
  const {ctx,W,H}=c;
  // top: 4-stage loop ribbon
  const stages=[{n:'forward',c:LRC.acc},{n:'loss',c:LRC.red},{n:'backprop',c:LRC.pur},{n:'update',c:LRC.grn}];
  const ribH=52, bw=W/4;
  stages.forEach((s,i)=>{ const x=bw*i; ctx.fillStyle=LRC.s2; ctx.strokeStyle=s.c; ctx.lineWidth=1.5; ctx.beginPath(); ctx.roundRect(x+8,10,bw-16,ribH-14,8); ctx.fill(); ctx.stroke(); ctx.fillStyle=s.c; ctx.font='700 11px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(s.n,x+bw/2,10+ribH/2); if(i<3){ ctx.fillStyle=LRC.muted; ctx.fillText('\u2192',x+bw-4,10+ribH/2+1);} });
  ctx.textAlign='left';
  // loss curve
  const gx0=40,gx1=W-16,gy0=H-24,gy1=ribH+16;
  ctx.strokeStyle=LRC.grid; ctx.strokeRect(gx0,gy1,gx1-gx0,gy0-gy1);
  ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('loss',6,gy1+10); ctx.fillText('epoch \u2192',gx1-40,gy0+14);
  if(_nnDash.hist.length>1){ ctx.strokeStyle=LRC.acc; ctx.lineWidth=2; ctx.beginPath(); _nnDash.hist.forEach((l,i)=>{ const x=gx0+(i/(Math.max(1,_nnDash.hist.length-1)))*(gx1-gx0); const y=gy0-(Math.min(l,2.5)/2.5)*(gy0-gy1); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y); }); ctx.stroke(); }
}

// ───────────────────────────────────────────────────────────
// 6.6.1 — Cross-entropy penalty meter
// ───────────────────────────────────────────────────────────
let _nnLoss = { p:0.5 };
function nnLossInit(){
  _nnLoss = { p:0.5 };
  const host = lrEl('nn-loss'); if(!host) return;
  host.innerHTML =
    '<canvas id="nn-loss-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem"><div class="lr-sl" style="flex:1">p(correct class)<input id="nn-loss-p" type="range" min="0.01" max="0.99" step="0.01" value="0.5" oninput="nnLossSet(this.value)"><b id="nn-loss-pv">0.50</b></div></div>'+
    '<div class="lr-readout" style="margin-top:.6rem;justify-content:center"><span class="lr-stat"><span class="lr-stat-k">\u2212log(p)</span><span class="lr-stat-v" id="nn-loss-v" style="color:'+LRC.red+'">0.69</span></span></div>'+
    '<div style="margin-top:1rem"><div class="nn-split-lab">K-class: one-hot label zeroes every term but the true class</div><div id="nn-loss-kclass"></div></div>'+
    '<div class="lr-note">Confident-and-right costs almost nothing; confident-and-wrong costs enormously.</div>';
  nnLossDraw(); nnLossKclass();
}
function nnLossSet(v){ _nnLoss.p=parseFloat(v); lrTxt('nn-loss-pv',_nnLoss.p.toFixed(2)); nnLossDraw(); }
function nnLossDraw(){
  const c=lrCanvas('nn-loss-cv',220); if(!c) return;
  const {ctx,W,H}=c; const pad=40,x0=pad,x1=W-14,y0=H-26,y1=14; const Lmax=4.7;
  const xm=p=>x0+p*(x1-x0), ym=L=>y0-Math.min(L,Lmax)/Lmax*(y0-y1);
  ctx.strokeStyle=LRC.grid; ctx.lineWidth=1; [0,1,2,3,4].forEach(L=>{ ctx.beginPath(); ctx.moveTo(x0,ym(L)); ctx.lineTo(x1,ym(L)); ctx.stroke(); ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText(L,6,ym(L)+3); });
  ctx.strokeStyle=LRC.red; ctx.lineWidth=2.5; ctx.beginPath(); let first=true;
  for(let px=x0;px<=x1;px++){ const p=lrClamp((px-x0)/(x1-x0),0.001,0.999); const L=-Math.log(p); if(L>Lmax){first=true;continue;} if(first){ctx.moveTo(px,ym(L));first=false;}else ctx.lineTo(px,ym(L)); }
  ctx.stroke();
  const p=_nnLoss.p, L=-Math.log(p); lrTxt('nn-loss-v',L.toFixed(2));
  ctx.strokeStyle='rgba(255,95,142,0.4)'; ctx.setLineDash([4,4]); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(xm(p),y0); ctx.lineTo(xm(p),ym(Math.min(L,Lmax))); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle=LRC.red; ctx.beginPath(); ctx.arc(xm(p),ym(Math.min(L,Lmax)),6,0,7); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('p(correct) \u2192',x1-40,y0+15); ctx.textAlign='left';
}
function nnLossKclass(){
  const host=lrEl('nn-loss-kclass'); if(!host) return;
  const classes=['A','B','C','D']; const yhat=[_nnLoss.p,0.2,0.15,0.1]; const y=[1,0,0,0];
  host.innerHTML='<table class="lr-table" style="width:100%"><tr><th>class</th><th>\u0177</th><th>y (one-hot)</th><th>\u2212y\u00b7log \u0177</th></tr>'+
    classes.map((cl,i)=>{ const term=-y[i]*Math.log(i===0?_nnLoss.p:yhat[i]); const dead=y[i]===0; return '<tr style="opacity:'+(dead?0.4:1)+'"><td>'+cl+'</td><td>'+(i===0?_nnLoss.p.toFixed(2):yhat[i].toFixed(2))+'</td><td style="color:'+(y[i]?LRC.grn:LRC.muted)+'">'+y[i]+'</td><td style="color:'+(y[i]?LRC.acc:LRC.muted)+'">'+(dead?'0':term.toFixed(2))+'</td></tr>'; }).join('')+'</table>';
}

// ───────────────────────────────────────────────────────────
// 6.6.2 — Loss is far from the weight
// ───────────────────────────────────────────────────────────
function nnFarInit(){
  const host = lrEl('nn-far'); if(!host) return;
  host.innerHTML = '<canvas id="nn-far-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-note">A weight in layer 1 affects the loss only after rippling through every later layer. One derivative can\u2019t reach that far \u2014 we need the chain rule, run backward.</div>';
  const c=lrCanvas('nn-far-cv',180); if(!c) return;
  const {ctx,W,H}=c; const L=5; const cy=H/2; const gap=(W-80)/(L);
  for(let i=0;i<L;i++){ const x=40+i*gap; if(i<L-1){ ctx.strokeStyle=LRC.grid; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(x+18,cy); ctx.lineTo(x+gap-18,cy); ctx.stroke(); }
    ctx.fillStyle=i===0?LRC.amb:LRC.s2; ctx.strokeStyle=i===0?LRC.amb:LRC.acc; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(x,cy,16,0,7); ctx.fill(); ctx.stroke();
    ctx.fillStyle=i===0?'#070B18':LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('L'+(i+1),x,cy+4); }
  // question mark over layer 1 weight
  ctx.fillStyle=LRC.amb; ctx.font='700 22px IBM Plex Mono, monospace'; ctx.fillText('?',40,cy-26);
  ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('weight here',40,cy+34);
  // loss at the end
  ctx.fillStyle=LRC.red; ctx.beginPath(); ctx.arc(40+(L-1)*gap+40,cy,16,0,7); ctx.fill(); ctx.fillStyle='#070B18'; ctx.font='700 11px IBM Plex Mono, monospace'; ctx.fillText('L',40+(L-1)*gap+40,cy+4);
  ctx.strokeStyle=LRC.grid; ctx.beginPath(); ctx.moveTo(40+(L-1)*gap+18,cy); ctx.lineTo(40+(L-1)*gap+24,cy); ctx.stroke();
  ctx.textAlign='left';
}

// ───────────────────────────────────────────────────────────
// 6.6.3 — Computation graph (forward)
// ───────────────────────────────────────────────────────────
let _nnGraph = { a:3, b:1, c:-2 };
function nnGraphInit(){
  _nnGraph = { a:3, b:1, c:-2 };
  const host = lrEl('nn-graph'); if(!host) return;
  host.innerHTML =
    '<canvas id="nn-graph-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-grid3" style="margin-top:1rem">'+
      lrSlider('nn-g-a','a',-5,5,1,3,LRC.acc)+lrSlider('nn-g-b','b',-5,5,1,1,LRC.pur)+lrSlider('nn-g-c','c',-5,5,1,-2,LRC.grn)+
    '</div>'+
    '<div class="lr-note">L = c(a + 2b). With a=3, b=1, c=\u22122 you should land at L = \u221210. Same graph runs backward in 6.6.4.</div>';
  ['a','b','c'].forEach(k=>{ const el=lrEl('nn-g-'+k); if(el) el.addEventListener('input',()=>nnGraphUpd()); });
  nnGraphDraw();
}
function nnGraphUpd(){ _nnGraph.a=+lrEl('nn-g-a').value; _nnGraph.b=+lrEl('nn-g-b').value; _nnGraph.c=+lrEl('nn-g-c').value; lrTxt('nn-g-a-v',_nnGraph.a.toFixed(0)); lrTxt('nn-g-b-v',_nnGraph.b.toFixed(0)); lrTxt('nn-g-c-v',_nnGraph.c.toFixed(0)); nnGraphDraw(); if(lrEl('nn-bp-cv') && !_nnBp.net2) nnBpDraw(); }
function nnGraphNodes(){
  const {a,b,c}=_nnGraph; const d=2*b; const e=a+d; const L=c*e;
  return { a,b,c,d,e,L };
}
function nnGraphDraw(){
  const c2=lrCanvas('nn-graph-cv',240); if(!c2) return;
  const {ctx,W,H}=c2; const N=nnGraphNodes();
  // layout: inputs left, ops middle, L right
  const nodes=[
    {id:'a',lab:'a',val:N.a,x:W*0.1,y:H*0.25,col:LRC.acc},
    {id:'b',lab:'b',val:N.b,x:W*0.1,y:H*0.72,col:LRC.pur},
    {id:'c',lab:'c',val:N.c,x:W*0.1,y:H*0.5,col:LRC.grn},
    {id:'d',lab:'\u00d72',val:N.d,x:W*0.38,y:H*0.72,col:LRC.muted},
    {id:'e',lab:'+',val:N.e,x:W*0.62,y:H*0.45,col:LRC.muted},
    {id:'L',lab:'\u00d7',val:N.L,x:W*0.87,y:H*0.5,col:LRC.red}
  ];
  const NB={}; nodes.forEach(n=>NB[n.id]=n);
  const edges=[['b','d'],['a','e'],['d','e'],['e','L'],['c','L']];
  edges.forEach(([f,t])=>{ ctx.strokeStyle='rgba(214,226,255,0.2)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(NB[f].x+18,NB[f].y); ctx.lineTo(NB[t].x-18,NB[t].y); ctx.stroke();
    ctx.fillStyle=LRC.grid; const ax=NB[t].x-18,ay=NB[t].y; const ang=Math.atan2(ay-NB[f].y,ax-NB[f].x); ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax-8*Math.cos(ang-0.4),ay-8*Math.sin(ang-0.4)); ctx.lineTo(ax-8*Math.cos(ang+0.4),ay-8*Math.sin(ang+0.4)); ctx.closePath(); ctx.fill(); });
  nodes.forEach(n=>{ const isOp=['d','e','L'].includes(n.id); ctx.fillStyle=isOp?LRC.s3:LRC.s2; ctx.strokeStyle=n.col; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(n.x,n.y,18,0,7); ctx.fill(); ctx.stroke();
    ctx.fillStyle=n.col; ctx.font='700 12px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(n.lab,n.x,n.y-2); ctx.fillStyle=LRC.text; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText(n.val,n.x,n.y+11); });
  ctx.fillStyle=LRC.red; ctx.font='700 12px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('L = '+N.L,NB.L.x,NB.L.y-26); ctx.textAlign='left';
}

// ───────────────────────────────────────────────────────────
// 6.6.4 — Backpropagation (reverse pass)  [flagship]
// ───────────────────────────────────────────────────────────
let _nnBp = { mode:'simple', revealed:0, net2:false };
function nnBackpropInit(){
  _nnBp = { mode:'simple', revealed:0, net2:false };
  const host = lrEl('nn-backprop'); if(!host) return;
  host.innerHTML =
    '<canvas id="nn-bp-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center">'+
      '<button class="lr-btn solid" id="nn-bp-go" onclick="nnBpStep()">\u25c0 backprop one step</button>'+
      '<button class="lr-btn" onclick="nnBpReset()">reset</button>'+
      '<button class="lr-btn" id="nn-bp-level" onclick="nnBpLevel()">level up: real 2-layer net</button>'+
    '</div>'+
    '<div class="lr-note" id="nn-bp-note">Forward pass done. Press backprop and watch gradients flow right-to-left: each node multiplies the upstream gradient by its local gradient.</div>';
  nnBpDraw();
}
function nnBpReset(){ _nnBp.revealed=0; nnBpDraw(); lrSet('nn-bp-note','Forward pass done. Press backprop and watch gradients flow right-to-left.'); }
function nnBpLevel(){ _nnBp.net2=!_nnBp.net2; _nnBp.revealed=0; lrEl('nn-bp-level').classList.toggle('on',_nnBp.net2); lrEl('nn-bp-level').textContent=_nnBp.net2?'back to simple graph':'level up: real 2-layer net'; nnBpDraw(); lrSet('nn-bp-note',_nnBp.net2?'The real 2-layer network graph. The same backward flow computes \u2202L/\u2202z = a\u207d\u00b2\u207e \u2212 y \u2014 the error-times-feature gradient from logistic regression.':'Forward pass done. Press backprop and watch gradients flow right-to-left.'); }
function nnBpStep(){
  const maxSteps = _nnBp.net2 ? 4 : 5;
  _nnBp.revealed = Math.min(maxSteps, _nnBp.revealed+1);
  nnBpDraw();
  if(_nnBp.revealed>=maxSteps){ lrSet('nn-bp-note', _nnBp.net2
    ? '<b style="color:'+LRC.grn+'">Complete.</b> The output-layer gradient is \u2202L/\u2202z = a\u207d\u00b2\u207e \u2212 y. Backprop carried the chain rule to every weight automatically.'
    : (()=>{ const N=nnGraphNodes(), n=v=>(v<0?'\u2212'+Math.abs(v):''+v);
        return '<b style="color:'+LRC.grn+'">Complete.</b> \u2202L/\u2202a = '+n(N.c)+', \u2202L/\u2202b = '+n(2*N.c)+', \u2202L/\u2202c = '+n(N.e)+'. Each was upstream \u00d7 local gradient \u2014 the chain rule as a relay. Move the sliders in 6.6.3 and these follow.'; })()); }
}
function nnBpDraw(){
  if(_nnBp.net2){ nnBpDrawNet2(); return; }
  const c=lrCanvas('nn-bp-cv',260); if(!c) return;
  const {ctx,W,H}=c;
  // the very graph 6.6.3 is showing, read from the same state and differentiated
  const N=nnGraphNodes(), a=N.a, b=N.b, c3=N.c, d=N.d, e=N.e, L=N.L;
  const neg=v=>(v<0?'\u2212'+Math.abs(v):''+v);
  const nodes=[
    {id:'a',lab:'a',val:a,x:W*0.1,y:H*0.22,col:LRC.acc,grad:c3,loc:'\u2202e/\u2202a=1'},
    {id:'b',lab:'b',val:b,x:W*0.1,y:H*0.72,col:LRC.pur,grad:2*c3,loc:'\u2202d/\u2202b=2'},
    {id:'c',lab:'c',val:c3,x:W*0.1,y:H*0.47,col:LRC.grn,grad:e,loc:'\u2202L/\u2202c=e='+neg(e)},
    {id:'d',lab:'\u00d72',val:d,x:W*0.38,y:H*0.72,col:LRC.muted,grad:c3,loc:'\u2202e/\u2202d=1'},
    {id:'e',lab:'+',val:e,x:W*0.62,y:H*0.42,col:LRC.muted,grad:c3,loc:'\u2202L/\u2202e=c='+neg(c3)},
    {id:'L',lab:'\u00d7',val:L,x:W*0.87,y:H*0.47,col:LRC.red,grad:1,loc:'seed=1'}
  ];
  const NB={}; nodes.forEach(n=>NB[n.id]=n);
  const edges=[['b','d'],['a','e'],['d','e'],['e','L'],['c','L']];
  // reveal order right-to-left: L(0), e&c(1), d(2), a(3), b(4)
  const revealMap={L:1,e:2,c:2,d:3,a:4,b:5};
  edges.forEach(([f,t])=>{ const active=_nnBp.revealed>=(revealMap[f]||9); ctx.strokeStyle=active?'rgba(255,95,142,0.6)':'rgba(214,226,255,0.15)'; ctx.lineWidth=active?2.5:1.5; ctx.beginPath(); ctx.moveTo(NB[t].x-18,NB[t].y); ctx.lineTo(NB[f].x+18,NB[f].y); ctx.stroke();
    if(active){ ctx.fillStyle=LRC.red; const ax=NB[f].x+18,ay=NB[f].y; const ang=Math.atan2(ay-NB[t].y,ax-NB[t].x); ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax-9*Math.cos(ang-0.4),ay-9*Math.sin(ang-0.4)); ctx.lineTo(ax-9*Math.cos(ang+0.4),ay-9*Math.sin(ang+0.4)); ctx.closePath(); ctx.fill(); } });
  nodes.forEach(n=>{ const shown=_nnBp.revealed>=(revealMap[n.id]||9); const isOp=['d','e','L'].includes(n.id);
    ctx.fillStyle=isOp?LRC.s3:LRC.s2; ctx.strokeStyle=shown?LRC.red:n.col; ctx.lineWidth=shown?2.5:2; ctx.beginPath(); ctx.arc(n.x,n.y,18,0,7); ctx.fill(); ctx.stroke();
    ctx.fillStyle=n.col; ctx.font='700 12px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(n.lab,n.x,n.y-2); ctx.fillStyle=LRC.text; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText(n.val,n.x,n.y+10);
    if(shown){ ctx.fillStyle=LRC.red; ctx.font='700 10px IBM Plex Mono, monospace'; ctx.fillText('\u2202L/\u2202'+n.id+'='+n.grad,n.x,n.y+32); }
    ctx.fillStyle=LRC.muted; ctx.font='8px IBM Plex Mono, monospace'; ctx.fillText(n.loc,n.x,n.y-24);
  });
  ctx.textAlign='left';
}
function nnBpDrawNet2(){
  const c=lrCanvas('nn-bp-cv',260); if(!c) return;
  const {ctx,W,H}=c;
  // simplified 2-layer: x -> [W1] -> h -> [W2] -> z -> softmax -> L, showing dL/dz = a2 - y
  const nodes=[
    {id:'x',lab:'x',x:W*0.08,y:H*0.5,col:LRC.pur},
    {id:'h',lab:'h',x:W*0.32,y:H*0.5,col:LRC.acc},
    {id:'z',lab:'z',x:W*0.56,y:H*0.5,col:LRC.amb},
    {id:'a',lab:'a\u207d\u00b2\u207e',x:W*0.76,y:H*0.5,col:LRC.grn},
    {id:'L',lab:'L',x:W*0.92,y:H*0.5,col:LRC.red}
  ];
  const NB={}; nodes.forEach(n=>NB[n.id]=n);
  const wlabels={'x-h':'W\u00b9','h-z':'W\u00b2','z-a':'softmax','a-L':'cross-ent'};
  const order=['L','a','z','h']; // reveal right to left
  for(let i=0;i<nodes.length-1;i++){ const f=nodes[i],t=nodes[i+1]; ctx.strokeStyle='rgba(214,226,255,0.2)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(f.x+18,f.y); ctx.lineTo(t.x-18,t.y); ctx.stroke(); ctx.fillStyle=LRC.muted; ctx.font='8px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(wlabels[f.id+'-'+t.id]||'',(f.x+t.x)/2,f.y-8); }
  // backward arrows revealed
  for(let s=0;s<_nnBp.revealed;s++){ const idx=nodes.length-2-s; if(idx<0)break; const f=nodes[idx+1],t=nodes[idx]; ctx.strokeStyle='rgba(255,95,142,0.6)'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(f.x-18,f.y+6); ctx.lineTo(t.x+18,t.y+6); ctx.stroke(); }
  nodes.forEach((n,i)=>{ const shown=_nnBp.revealed>=(nodes.length-1-i); ctx.fillStyle=LRC.s2; ctx.strokeStyle=shown?LRC.red:n.col; ctx.lineWidth=shown?2.5:2; ctx.beginPath(); ctx.arc(n.x,n.y,18,0,7); ctx.fill(); ctx.stroke(); ctx.fillStyle=n.col; ctx.font='700 12px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(n.lab,n.x,n.y+4); });
  // the key gradient annotation
  if(_nnBp.revealed>=2){ ctx.fillStyle=LRC.grn; ctx.font='700 12px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('\u2202L/\u2202z = a\u207d\u00b2\u207e \u2212 y',W*0.56,H*0.82); }
  ctx.textAlign='left';
}

// ───────────────────────────────────────────────────────────
// 6.6.5 — Dropout + learning-rate dial
// ───────────────────────────────────────────────────────────
let _nnDrop = { p:0.4, lr:'good', anim:null, mask:null };
function nnDropoutInit(){
  _nnDrop = { p:0.4, lr:'good', anim:null, mask:null };
  const host = lrEl('nn-dropout'); if(!host) return;
  host.innerHTML =
    '<div class="nn-split"><div><div class="nn-split-lab">dropout: a different sub-network each step</div><canvas id="nn-drop-cv" style="width:100%;display:block"></canvas>'+
      '<div class="lr-ctl" style="margin-top:.6rem;justify-content:center"><button class="lr-btn solid" id="nn-drop-play" onclick="nnDropPlay()">\u25b6 training steps</button><div class="lr-sl">p<input id="nn-drop-p" type="range" min="0" max="0.7" step="0.05" value="0.4" oninput="nnDropP(this.value)"><b id="nn-drop-pv">0.40</b></div></div></div>'+
      '<div><div class="nn-split-lab">learning-rate dial vs. loss curve</div><canvas id="nn-drop-lr" style="width:100%;display:block"></canvas>'+
      '<div class="lr-ctl" style="margin-top:.6rem;justify-content:center">'+
        '<button class="lr-btn" id="nn-lr-low" onclick="nnDropLr(\'low\')">too low</button>'+
        '<button class="lr-btn on" id="nn-lr-good" onclick="nnDropLr(\'good\')">just right</button>'+
        '<button class="lr-btn" id="nn-lr-high" onclick="nnDropLr(\'high\')">too high</button></div></div></div>'+
    '<div class="lr-note">Dropout = training a slightly different network each step, so no unit becomes indispensable. The learning rate is a hyperparameter you choose, not a weight the net learns.</div>';
  nnDropMask(); nnDropDraw(); nnDropLrDraw();
}
function nnDropMask(){ _nnDrop.mask = Array.from({length:12},()=>Math.random()>_nnDrop.p); }
function nnDropP(v){ _nnDrop.p=parseFloat(v); lrTxt('nn-drop-pv',_nnDrop.p.toFixed(2)); nnDropMask(); nnDropDraw(); }
function nnDropLr(m){ _nnDrop.lr=m; ['low','good','high'].forEach(k=>lrEl('nn-lr-'+k).classList.toggle('on',k===m)); nnDropLrDraw(); }
function nnDropPlay(){ if(_nnDrop.anim){clearInterval(_nnDrop.anim);_nnDrop.anim=null;const b=lrEl('nn-drop-play');if(b)b.textContent='\u25b6 training steps';return;} const b=lrEl('nn-drop-play'); if(b)b.textContent='\u2759\u2759 stepping'; let n=0; _nnDrop.anim=nnTimer(()=>{ nnDropMask(); nnDropDraw(); n++; if(n>30){clearInterval(_nnDrop.anim);_nnDrop.anim=null;const bb=lrEl('nn-drop-play');if(bb)bb.textContent='\u21ba again';} }, 400); }
function nnDropDraw(){
  const c=lrCanvas('nn-drop-cv',200); if(!c) return;
  const {ctx,W,H}=c;
  const layers=[3,5,4]; const cx=[W*0.2,W*0.5,W*0.8]; let idx=0; const pos=[];
  layers.forEach((n,li)=>{ const ys=[]; for(let i=0;i<n;i++){ ys.push({x:cx[li], y:H*0.15+(H*0.7)*(n===1?0.5:i/(n-1)), on:_nnDrop.mask?_nnDrop.mask[idx++]:true}); } pos.push(ys); });
  // edges among on-units
  for(let l=0;l<pos.length-1;l++) pos[l].forEach(p1=>pos[l+1].forEach(p2=>{ const on=p1.on&&p2.on; ctx.strokeStyle=on?'rgba(77,227,255,0.28)':'rgba(214,226,255,0.05)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke(); }));
  pos.forEach(layer=>layer.forEach(p=>{ ctx.fillStyle=p.on?LRC.acc:'#2a2f33'; ctx.beginPath(); ctx.arc(p.x,p.y,8,0,7); ctx.fill(); if(!p.on){ ctx.strokeStyle=LRC.muted; ctx.lineWidth=1; ctx.setLineDash([2,2]); ctx.stroke(); ctx.setLineDash([]); } }));
}
function nnDropLrDraw(){
  const c=lrCanvas('nn-drop-lr',200); if(!c) return;
  const {ctx,W,H}=c; const x0=30,x1=W-12,y0=H-22,y1=12;
  ctx.strokeStyle=LRC.grid; ctx.strokeRect(x0,y1,x1-x0,y0-y1);
  ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('loss',6,y1+9); ctx.fillText('epoch',x1-34,y0+13);
  ctx.lineWidth=2; ctx.beginPath();
  for(let i=0;i<=60;i++){ const t=i/60; const x=x0+t*(x1-x0); let L;
    if(_nnDrop.lr==='good'){ L=2.3*Math.exp(-3*t)+0.08; ctx.strokeStyle=LRC.grn; }
    else if(_nnDrop.lr==='low'){ L=2.3-0.5*t; ctx.strokeStyle=LRC.amb; }
    else { L=1.2+0.9*Math.sin(i*0.9)*Math.min(1,t*2)+0.4*t; ctx.strokeStyle=LRC.red; }
    const y=y0-(Math.min(L,2.5)/2.5)*(y0-y1); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();
  ctx.fillStyle=_nnDrop.lr==='good'?LRC.grn:_nnDrop.lr==='low'?LRC.amb:LRC.red; ctx.font='10px IBM Plex Mono, monospace';
  ctx.fillText(_nnDrop.lr==='good'?'smooth descent':_nnDrop.lr==='low'?'crawling':'jagged / diverging', x0+8, y1+16);
}

// ───────────────────────────────────────────────────────────
// 6.7 — Full-network recap pipeline (clickable)
// ───────────────────────────────────────────────────────────
const NN_RECAP_NODES = [
  { id:'tok', lab:'raw tokens', sec:null, col:LRC.muted },
  { id:'emb', lab:'embedding lookup', sec:'embin', col:LRC.pur },
  { id:'hid', lab:'hidden layer', sec:'ffn', col:LRC.acc },
  { id:'act', lab:'non-linearity', sec:'neuron', col:LRC.amb },
  { id:'soft', lab:'softmax', sec:'ffn', col:LRC.grn },
  { id:'loss', lab:'cross-entropy', sec:'training', col:LRC.red },
  { id:'bp', lab:'backprop + update', sec:'training', col:LRC.pur }
];
let _nnRecap = { hover:null };
function nnRecapInit(){
  _nnRecap = { hover:null };
  const host = lrEl('nn-recap'); if(!host) return;
  host.innerHTML =
    '<canvas id="nn-recap-cv" style="width:100%;display:block;cursor:pointer"></canvas>'+
    '<div class="lr-note" id="nn-recap-note">Click any stage to jump back to its section.</div>';
  const cv=lrEl('nn-recap-cv');
  cv.addEventListener('click', e=>{ const hit=nnRecapHit(e); if(hit&&hit.sec) openNNSec(hit.sec); });
  cv.addEventListener('mousemove', e=>{ const hit=nnRecapHit(e); const nn=hit?hit.id:null; if(nn!==_nnRecap.hover){ _nnRecap.hover=nn; nnRecapDraw(); if(hit) lrSet('nn-recap-note', hit.sec?'\u2192 '+hit.lab+' (click to open \u00a7'+((NN_SEC.find(s=>s.id===hit.sec)||{}).num||'')+')':'the starting point: raw tokens'); } });
  nnRecapDraw();
}
function nnRecapLayout(W,H){ const n=NN_RECAP_NODES.length; const bw=W/n; const cy=H/2; return NN_RECAP_NODES.map((nd,i)=>({nd,x:bw*i+bw/2,y:cy,w:bw*0.74,h:54})); }
function nnRecapHit(e){ const cv=lrEl('nn-recap-cv'); if(!cv)return null; const r=cv.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; const lay=nnRecapLayout(r.width,cv.__H||220); for(const L of lay){ if(Math.abs(x-L.x)<L.w/2&&Math.abs(y-L.y)<L.h/2) return L.nd; } return null; }
function nnRecapDraw(){
  const c=lrCanvas('nn-recap-cv',220); if(!c) return;
  const {ctx,W,H}=c; c.cv.__H=H; const lay=nnRecapLayout(W,H);
  lay.forEach((L,i)=>{ if(i<lay.length-1){ const N=lay[i+1]; ctx.strokeStyle=LRC.grid; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(L.x+L.w/2*0.5,L.y); ctx.lineTo(N.x-N.w/2*0.5,N.y); ctx.stroke(); ctx.fillStyle=LRC.grid; const ax=N.x-N.w/2*0.5; ctx.beginPath(); ctx.moveTo(ax,N.y); ctx.lineTo(ax-7,N.y-4); ctx.lineTo(ax-7,N.y+4); ctx.closePath(); ctx.fill(); } });
  lay.forEach(L=>{ const on=_nnRecap.hover===L.nd.id; ctx.fillStyle=on?'var(--surface3)':LRC.s2; ctx.strokeStyle=L.nd.col; ctx.lineWidth=on?2.5:1.5; ctx.beginPath(); ctx.roundRect(L.x-L.w/2,L.y-L.h/2,L.w,L.h,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle=L.nd.col; ctx.font='700 8px IBM Plex Mono, monospace'; ctx.textAlign='center'; const num=L.nd.sec?'\u00a7'+((NN_SEC.find(s=>s.id===L.nd.sec)||{}).num||''):'start'; ctx.fillText(num,L.x,L.y-L.h/2+13);
    ctx.fillStyle=LRC.text; ctx.font='10px IBM Plex Mono, monospace'; const words=L.nd.lab.split(' '); let line='',yy=L.y-1; words.forEach(w=>{ if((line+w).length>11){ ctx.fillText(line,L.x,yy); yy+=11; line=w+' '; } else line+=w+' '; }); ctx.fillText(line.trim(),L.x,yy);
    if(L.nd.sec){ ctx.fillStyle=L.nd.col; ctx.font='7px IBM Plex Mono, monospace'; ctx.fillText('click \u2192',L.x,L.y+L.h/2-6); } });
  ctx.textAlign='left';
}



// ── 6.7 FULL PLAYGROUND ENGINE ─────────────────────────────
// ── Playground engine: a real trainable MLP ────────────────
// sizes e.g. [2,4,4,1]; hidden activation by name; sigmoid output.
// W[l][i][j] = weight into neuron i of layer l+1 from neuron j of layer l
// (the neuron-inspector reads and writes this layout directly).
class MLP {
  constructor(sizes, act){
    this.sizes = sizes.slice();
    this.act = act || 'tanh';
    this.lastLoss = null;
    this.W = []; this.b = [];
    for(let l=0;l<sizes.length-1;l++){
      const fanIn = sizes[l], fanOut = sizes[l+1];
      const s = Math.sqrt(2/(fanIn+fanOut));            // Xavier/Glorot
      this.W.push(Array.from({length:fanOut},()=>
        Array.from({length:fanIn},()=> (Math.random()*2-1)*s*1.8 )));
      this.b.push(Array.from({length:fanOut},()=> 0));
    }
  }
  _h(z){ return nnAct(this.act, z); }
  _hd(z){ return nnActD(this.act, z); }
  // forward pass keeping every layer's pre-activations and activations
  forwardAll(x){
    const A=[x.slice()], Z=[];
    let a=x;
    for(let l=0;l<this.W.length;l++){
      const last = l===this.W.length-1;
      const z = this.W[l].map((row,i)=> row.reduce((s,w,j)=> s+w*a[j], this.b[l][i]));
      const out = z.map(v=> last ? nnSig(v) : this._h(v));
      Z.push(z); A.push(out); a=out;
    }
    return {A, Z};
  }
  predict(x){ const {A}=this.forwardAll(x); return A[A.length-1][0]; }
  // one epoch of per-sample SGD with backprop; records mean BCE loss
  trainEpoch(data, lr){
    let loss=0;
    const order = data.map((_,i)=>i);
    for(let i=order.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; const t=order[i]; order[i]=order[j]; order[j]=t; }
    for(const idx of order){
      const {x,y}=data[idx];
      const {A,Z}=this.forwardAll(x);
      const p=A[A.length-1][0];
      loss += -(y*Math.log(p+1e-9) + (1-y)*Math.log(1-p+1e-9));
      // output delta for sigmoid + cross-entropy collapses to (p - y)
      let delta=[p-y];
      for(let l=this.W.length-1;l>=0;l--){
        const aPrev=A[l];
        const dPrev=new Array(aPrev.length).fill(0);
        for(let i=0;i<this.W[l].length;i++){
          const d=delta[i];
          for(let j=0;j<aPrev.length;j++){
            dPrev[j]+=this.W[l][i][j]*d;
            this.W[l][i][j]-=lr*d*aPrev[j];
          }
          this.b[l][i]-=lr*d;
        }
        if(l>0) delta=dPrev.map((s,j)=> s*this._hd(Z[l-1][j]));
      }
    }
    this.lastLoss = loss/data.length;
    return this.lastLoss;
  }
}

// deterministic-ish 2-D toy datasets in the boundary canvas domain [-1.3, 1.3]
function makeData(name){
  const pts=[];
  const R=()=>Math.random();
  const noise=(s)=> (R()+R()+R()-1.5)*s;   // approx gaussian
  if(name==='circle'){
    for(let i=0;i<70;i++){ const t=R()*2*Math.PI, r=Math.sqrt(R())*0.52; pts.push({x:[Math.cos(t)*r+noise(0.05), Math.sin(t)*r+noise(0.05)], y:1}); }
    for(let i=0;i<70;i++){ const t=R()*2*Math.PI, r=0.82+R()*0.4;        pts.push({x:[Math.cos(t)*r+noise(0.06), Math.sin(t)*r+noise(0.06)], y:0}); }
  } else if(name==='spiral'){
    for(let cls=0;cls<2;cls++) for(let i=0;i<70;i++){
      const t=i/70*3.2*Math.PI*0.85 + (cls?Math.PI:0);
      const r=0.12+i/70*1.05;
      pts.push({x:[Math.cos(t)*r+noise(0.07), Math.sin(t)*r+noise(0.07)], y:cls});
    }
  } else { // xor
    const blob=(cx,cy,y)=>{ for(let i=0;i<35;i++) pts.push({x:[cx+noise(0.24), cy+noise(0.24)], y}); };
    blob( 0.65, 0.65,1); blob(-0.65,-0.65,1);
    blob(-0.65, 0.65,0); blob( 0.65,-0.65,0);
  }
  return pts;
}

// draws the network for probe input `input`, returns hit boxes
// [{layer, idx, x, y, r, act}] for the click-to-inspect interaction.
function drawNetwork(ctx,W,H,net,input,opts){
  opts=opts||{};
  ctx.clearRect(0,0,W,H);
  const {A}=net.forwardAll(input);
  const L=net.sizes.length;
  const padX=Math.max(60,W*0.09), padY=34;
  const xAt=l=> padX + l/(L-1)*(W-2*padX);
  const yAt=(l,i)=>{ const n=net.sizes[l]; return H/2 + (i-(n-1)/2)*Math.min(74,(H-2*padY)/Math.max(1,n-1||1)); };
  const r=Math.max(11,Math.min(17,H*0.028));
  const T=performance.now()/1000;
  // edges
  for(let l=0;l<net.W.length;l++){
    for(let i=0;i<net.W[l].length;i++) for(let j=0;j<net.sizes[l];j++){
      const w=net.W[l][i][j];
      const x1=xAt(l), y1=yAt(l,j), x2=xAt(l+1), y2=yAt(l+1,i);
      const mag=Math.min(1,Math.abs(w)/2.2);
      ctx.strokeStyle=w>=0?`rgba(77,227,255,${0.10+mag*0.55})`:`rgba(255,95,142,${0.10+mag*0.55})`;
      ctx.lineWidth=0.6+mag*3;
      ctx.beginPath(); ctx.moveTo(x1+r,y1); ctx.lineTo(x2-r,y2); ctx.stroke();
      // signal particles flowing along the strongest edges
      if(opts.flow && mag>0.12){
        const k=((T*0.55 + (i*7+j*13)*0.137)%1);
        const px=x1+r+(x2-x1-2*r)*k, py=y1+(y2-y1)*k;
        ctx.fillStyle=w>=0?`rgba(77,227,255,${0.5*mag+0.2})`:`rgba(255,95,142,${0.5*mag+0.2})`;
        ctx.beginPath(); ctx.arc(px,py,1.4+mag*1.3,0,2*Math.PI); ctx.fill();
      }
    }
  }
  // nodes
  const boxes=[];
  for(let l=0;l<L;l++){
    const isIn=l===0, isOut=l===L-1;
    for(let i=0;i<net.sizes[l];i++){
      const x=xAt(l), y=yAt(l,i), a=A[l][i];
      const bright=isIn?0.5+0.5*Math.min(1,Math.abs(a)) : Math.max(0,Math.min(1,(a+1)/2));
      ctx.beginPath(); ctx.arc(x,y,r,0,2*Math.PI);
      ctx.fillStyle=isOut?`rgba(61,220,132,${0.14+bright*0.6})`:`rgba(77,227,255,${0.10+bright*0.5})`;
      ctx.fill();
      ctx.strokeStyle=isOut?'rgba(61,220,132,0.9)':'rgba(77,227,255,0.75)';
      ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='rgba(233,238,236,0.92)'; ctx.font='600 10px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(isIn?('x'+(i+1)) : a.toFixed(2).replace('0.','.'), x, y);
      boxes.push({layer:l, idx:i, x, y, r, act:a});
    }
  }
  // layer captions
  ctx.fillStyle='rgba(134,144,137,0.9)'; ctx.font='9px IBM Plex Mono, monospace'; ctx.textBaseline='alphabetic';
  for(let l=0;l<L;l++){
    const lab = l===0?'input' : l===L-1?'output \u03c3' : 'hidden '+l+' \u00b7 '+net.act;
    ctx.textAlign='center'; ctx.fillText(lab, xAt(l), H-10);
  }
  return boxes;
}

let _pg = { net:null, data:null, dataset:'xor', hidden:[4,4], act:'tanh', lr:0.08, running:false, anim:null, epoch:0, lossHist:[], selected:null, boxes:[] };

function openNNPlayground(){
  const ex=document.getElementById('nn-playground'); if(!ex) return;
  ex.style.display='block';
  pgRebuild();
  pgBindNetCanvas();
  pgObserveResize();
  // wait for the overlay to actually lay out before sizing the canvases,
  // otherwise they get measured at 0 and render tiny
  requestAnimationFrame(()=>requestAnimationFrame(pgResizeAll));
  pgFlowLoop();
}
function pgObserveResize(){
  if(_pg._ro || typeof ResizeObserver==='undefined') return;
  _pg._ro=new ResizeObserver(()=>{
    const ex=document.getElementById('nn-playground');
    if(ex && ex.style.display!=='none') pgDrawAll();
  });
  ['pg-net-canvas','pg-bound-canvas','pg-loss-canvas'].forEach(id=>{
    const cv=document.getElementById(id); if(cv) _pg._ro.observe(cv);
  });
}
function pgFlowLoop(ts){
  const ex=document.getElementById('nn-playground');
  if(!ex || ex.style.display==='none'){ _pg.flowAnim=null; return; }
  // while not training, redraw at ~30fps so signal particles flow without hammering the CPU
  if(!_pg.running){ if(!_pg._lastFlow || ts-_pg._lastFlow>33){ _pg._lastFlow=ts; pgDrawNet(); } }
  _pg.flowAnim=requestAnimationFrame(pgFlowLoop);
}
function closeNNPlayground(){
  const ex=document.getElementById('nn-playground'); if(ex) ex.style.display='none';
  _pg.running=false;
  if(_pg.anim){ cancelAnimationFrame(_pg.anim); _pg.anim=null; }
  if(_pg.flowAnim){ cancelAnimationFrame(_pg.flowAnim); _pg.flowAnim=null; }
  const pb=document.getElementById('pg-play'); if(pb) pb.innerHTML='&#9654; Play';
}
function pgRebuild(){
  _pg.net=new MLP([2].concat(_pg.hidden).concat([1]), _pg.act);
  _pg.data=makeData(_pg.dataset);
  _pg.epoch=0; _pg.lossHist=[]; _pg.selected=null; _pg.running=false;
  const pb=document.getElementById('pg-play'); if(pb) pb.innerHTML='&#9654; Play';
  pgSyncControls();
  pgDrawAll();
}
function pgSyncControls(){
  // dataset buttons
  document.querySelectorAll('.pg-ds-btn').forEach(b=>{ const on=b.dataset.ds===_pg.dataset; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  document.querySelectorAll('.pg-act-btn').forEach(b=>{ const on=b.dataset.act===_pg.act; b.style.background=on?'#A18FFF':'var(--surface2)'; b.style.color=on?'#fff':'var(--muted)'; b.style.borderColor=on?'#A18FFF':'var(--border2)'; });
  const arch=document.getElementById('pg-arch'); if(arch) arch.textContent='[2, '+_pg.hidden.join(', ')+', 1]';
  // hidden layer controls
  const hc=document.getElementById('pg-hidden-ctrl');
  if(hc){
    hc.innerHTML=_pg.hidden.map((u,i)=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
      <span style="font-family:var(--mono);font-size:.66rem;color:var(--muted);width:54px">layer ${i+1}</span>
      <button onclick="pgNeurons(${i},-1)" style="width:24px;height:24px;background:var(--surface2);border:1px solid var(--border2);border-radius:5px;color:var(--text);cursor:pointer;font-family:var(--mono)">&#8722;</button>
      <span style="font-family:var(--mono);font-size:.78rem;color:var(--accent);width:20px;text-align:center">${u}</span>
      <button onclick="pgNeurons(${i},1)" style="width:24px;height:24px;background:var(--surface2);border:1px solid var(--border2);border-radius:5px;color:var(--text);cursor:pointer;font-family:var(--mono)">+</button>
      ${_pg.hidden.length>1?`<button onclick="pgRemoveLayer(${i})" style="margin-left:auto;background:none;border:none;color:var(--accent3);cursor:pointer;font-family:var(--mono);font-size:.66rem">remove</button>`:''}
    </div>`).join('');
  }
}
function pgSetDataset(d){ _pg.dataset=d; pgRebuild(); }
function pgSetAct(a){ _pg.act=a; pgRebuild(); }
function pgNeurons(i,delta){ _pg.hidden[i]=Math.max(1,Math.min(8,_pg.hidden[i]+delta)); pgRebuild(); }
function pgAddLayer(){ if(_pg.hidden.length<4){ _pg.hidden.push(4); pgRebuild(); } }
function pgRemoveLayer(i){ if(_pg.hidden.length>1){ _pg.hidden.splice(i,1); pgRebuild(); } }
function pgSetLr(v){ _pg.lr=parseFloat(v); const e=document.getElementById('pg-lrval'); if(e) e.textContent=_pg.lr.toFixed(3); }
function pgPlay(){
  _pg.running=!_pg.running;
  const pb=document.getElementById('pg-play'); if(pb) pb.innerHTML=_pg.running?'&#10073;&#10073; Pause':'&#9654; Play';
  if(_pg.running) pgLoop();
}
function pgStep(){ for(let k=0;k<5;k++){ _pg.net.trainEpoch(_pg.data,_pg.lr); _pg.epoch++; } _pg.lossHist.push(_pg.net.lastLoss); pgDrawAll(); }
function pgReset(){ pgRebuild(); }
function pgLoop(){
  if(!_pg.running) return;
  for(let k=0;k<3;k++){ _pg.net.trainEpoch(_pg.data,_pg.lr); _pg.epoch++; }
  _pg.lossHist.push(_pg.net.lastLoss);
  if(_pg.lossHist.length>400) _pg.lossHist.shift();
  pgDrawAll();
  if(document.getElementById('nn-playground') && document.getElementById('nn-playground').style.display!=='none') _pg.anim=requestAnimationFrame(pgLoop);
  else { _pg.running=false; _pg.anim=null; }
}
function pgResizeAll(){ pgDrawAll(); }
function pgDrawAll(){ pgDrawNet(); pgDrawBoundary(); pgDrawLoss(); pgDrawStats(); }
function pgFit(cv){
  if(!cv) return [0,0];
  const r=cv.getBoundingClientRect();
  const dpr=Math.max(1, window.devicePixelRatio||1);
  const cw=Math.max(1,Math.round(r.width)), ch=Math.max(1,Math.round(r.height));
  const bw=Math.round(cw*dpr), bh=Math.round(ch*dpr);
  if(cv.width!==bw||cv.height!==bh){ cv.width=bw; cv.height=bh; }
  const ctx=cv.getContext('2d');
  // draw in CSS pixels; the backing store is dpr-scaled for sharpness
  ctx.setTransform(dpr,0,0,dpr,0,0);
  cv._cssW=cw; cv._cssH=ch;
  return [cw,ch];
}
function pgDrawNet(){
  const cv=document.getElementById('pg-net-canvas'); if(!cv||!_pg.net) return;
  const [W,H]=pgFit(cv);
  const ctx=cv.getContext('2d');
  // probe input: center of data domain
  _pg.boxes=drawNetwork(ctx,W,H,_pg.net,[0,0],{compact:false,flow:true});
  // highlight selected
  if(_pg.selected){
    const b=_pg.boxes.find(x=>x.layer===_pg.selected.layer&&x.idx===_pg.selected.idx);
    if(b){ ctx.strokeStyle='#fde047'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(b.x,b.y,b.r+4,0,2*Math.PI); ctx.stroke(); }
  }
}
function pgDrawBoundary(){
  const cv=document.getElementById('pg-bound-canvas'); if(!cv||!_pg.net) return;
  const [W,H]=pgFit(cv);
  const ctx=cv.getContext('2d');
  ctx.clearRect(0,0,W,H);
  const rng=1.3, step=Math.max(6,Math.floor(W/44));
  const toData=(px,py)=>[ (px/W*2-1)*rng, -(py/H*2-1)*rng ];
  for(let px=0;px<W;px+=step) for(let py=0;py<H;py+=step){
    const [dx,dy]=toData(px+step/2,py+step/2);
    const p=_pg.net.predict([dx,dy]);
    const r=Math.round(255*(1-p)*0.55+20), g=Math.round(120+p*60), b=Math.round(40+p*180);
    ctx.fillStyle=`rgba(${Math.round(20+ (1-p)*235)},${Math.round(60+p*100)},${Math.round(60+p*180)},0.85)`;
    ctx.fillStyle = p>=0.5 ? `rgba(77,227,255,${0.10+(p-0.5)*0.7})` : `rgba(255,95,142,${0.10+(0.5-p)*0.7})`;
    ctx.fillRect(px,py,step,step);
  }
  // data points
  const X=dx=>(dx/rng+1)/2*W, Y=dy=>(-dy/rng+1)/2*H;
  _pg.data.forEach(pt=>{
    ctx.beginPath(); ctx.arc(X(pt.x[0]),Y(pt.x[1]),4,0,2*Math.PI);
    ctx.fillStyle=pt.y===1?'#4DE3FF':'#FF5F8E'; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=1; ctx.stroke();
  });
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='10px monospace'; ctx.fillText('decision boundary (input space)',8,16);
}
function pgDrawLoss(){
  const cv=document.getElementById('pg-loss-canvas'); if(!cv) return;
  const [W,H]=pgFit(cv);
  const ctx=cv.getContext('2d'), P=24;
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(P,H-P); ctx.lineTo(W-6,H-P); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(P,6); ctx.lineTo(P,H-P); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='9px monospace'; ctx.fillText('loss',4,14);
  const hist=_pg.lossHist; if(hist.length<2){ return; }
  const maxL=Math.max(...hist,0.7), minL=Math.min(...hist,0);
  const X=i=>P+i/(hist.length-1)*(W-P-6);
  const Y=l=>H-P-(l-minL)/(maxL-minL+1e-9)*(H-P-6);
  ctx.strokeStyle='#3DDC84'; ctx.lineWidth=2; ctx.beginPath();
  hist.forEach((l,i)=>{ const px=X(i),py=Y(l); if(i===0)ctx.moveTo(px,py); else ctx.lineTo(px,py); });
  ctx.stroke();
}
function pgDrawStats(){
  const e=document.getElementById('pg-epoch'); if(e) e.textContent=_pg.epoch;
  const l=document.getElementById('pg-loss'); if(l) l.textContent=_pg.net&&_pg.net.lastLoss!=null?_pg.net.lastLoss.toFixed(4):'\u2014';
  // selected neuron inspector
  const ins=document.getElementById('pg-inspector'); if(!ins) return;
  if(!_pg.selected){ ins.innerHTML='<div style="font-family:var(--mono);font-size:.66rem;color:var(--muted);line-height:1.6">Click any neuron in the network to inspect and rewire its incoming weights.</div>'; return; }
  const {layer,idx}=_pg.selected;
  if(layer===0){ ins.innerHTML='<div style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">Input x'+(idx+1)+'. Inputs have no incoming weights. Pick a hidden or output neuron.</div>'; return; }
  const wRow=_pg.net.W[layer-1][idx];
  const rows=wRow.map((w,j)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
    <span style="font-family:var(--mono);font-size:.62rem;color:var(--muted);width:34px">w${j+1}</span>
    <input type="range" min="-3" max="3" step="0.05" value="${w}" oninput="pgSetWeight(${layer},${idx},${j},this.value)" style="flex:1;accent-color:${w>=0?'#4DE3FF':'#FF5F8E'}">
    <span style="font-family:var(--mono);font-size:.62rem;color:${w>=0?'#4DE3FF':'#FF5F8E'};width:38px;text-align:right">${w.toFixed(2)}</span>
  </div>`).join('');
  ins.innerHTML='<div style="font-family:var(--mono);font-size:.66rem;color:#fde047;margin-bottom:.6rem">'+(layer===_pg.net.W.length?'output neuron':'hidden L'+layer+' neuron '+(idx+1))+'  \u00b7  a = '+_pg.selected.act.toFixed(3)+'</div>'+rows+'<div style="font-family:var(--mono);font-size:.58rem;color:var(--muted);margin-top:.4rem;line-height:1.5">Drag a weight and watch the boundary respond instantly.</div>';
}
function pgSetWeight(layer,idx,j,v){ _pg.net.W[layer-1][idx][j]=parseFloat(v); pgDrawAll(); }
function pgBindNetCanvas(){
  const cv=document.getElementById('pg-net-canvas'); if(!cv||cv._bound) return; cv._bound=true;
  cv.addEventListener('click',e=>{
    const r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left), my=(e.clientY-r.top);
    let hit=null;
    _pg.boxes.forEach(b=>{ if(Math.hypot(b.x-mx,b.y-my)<=b.r+3) hit=b; });
    if(hit){ _pg.selected={layer:hit.layer,idx:hit.idx,act:hit.act}; pgDrawAll(); }
  });
  window.addEventListener('resize',()=>{ const ex=document.getElementById('nn-playground'); if(ex&&ex.style.display!=='none') pgResizeAll(); });
}
