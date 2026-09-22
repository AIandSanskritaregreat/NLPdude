// ── LOGISTIC REGRESSION SECTION CARDS ──────────────────────
// ═══════════════════════════════════════════════════════════
// CHAPTER 4 · LOGISTIC REGRESSION & TEXT CLASSIFICATION
// Rebuilt: 16 sections, 28 live instruments.
// ═══════════════════════════════════════════════════════════

const LR_SEC = [
  {id:'lrintro',   num:'4.1',  title:'How a Classifier Is Built',      icon:'C', desc:'Supervised learning and the four parts every classifier is made of.',        tags:['features','scoring','loss','optimizer']},
  {id:'lrsigmoid', num:'4.2',  title:'The Sigmoid',                    icon:'S', desc:'The curve that squashes any real number into a probability.',                tags:['sigmoid','log-odds','logit']},
  {id:'lrclassify',num:'4.3',  title:'Making the Decision',            icon:'P', desc:'Dot product, threshold, boundary. Includes the full review scorer.',         tags:['dot product','threshold','features','vectorizing']},
  {id:'lrlearn',   num:'4.4',  title:'How Weights Get Learned',        icon:'L', desc:'The training loop in one picture, before we open up either half.',           tags:['training loop','error signal']},
  {id:'lrloss',    num:'4.5',  title:'Cross-Entropy Loss',             icon:'H', desc:'Measuring wrongness, and why confident mistakes cost the most.',             tags:['cross-entropy','likelihood','-log']},
  {id:'lrgrad',    num:'4.6',  title:'Gradient Descent',               icon:'G', desc:'Rolling downhill. Update rule, SGD, a worked step, and batch sizes.',        tags:['gradient','learning rate','SGD','mini-batch']},
  {id:'lrmulti',   num:'4.7',  title:'More Than Two Classes',          icon:'M', desc:'Softmax, class templates, and one weight per class per feature.',           tags:['softmax','multinomial','templates']},
  {id:'lrmultilearn',num:'4.8',title:'Cross-Entropy for Many Classes', icon:'D', desc:'One-hot labels collapse the sum to a single term.',                          tags:['one-hot','K-way loss']},
  {id:'lreval',    num:'4.9',  title:'Precision, Recall, and F1',      icon:'E', desc:'Why accuracy lies, plus micro versus macro averaging.',                      tags:['confusion matrix','F1','averaging']},
  {id:'lrcrossval',num:'4.10', title:'Cross-Validation',               icon:'V', desc:'Using every example for training and for testing, without cheating.',        tags:['k-fold','dev set','leakage']},
  {id:'lrsig',     num:'4.11', title:'Is A Really Better Than B?',     icon:'T', desc:'Null hypotheses, p-values, and the bootstrap test in full.',                 tags:['p-value','bootstrap','resampling']},
  {id:'lrharms',   num:'4.12', title:'When Classifiers Cause Harm',    icon:'A', desc:'Representational and allocational harm, and what documentation fixes.',      tags:['bias','fairness','model cards']},
  {id:'lrinterp',  num:'4.13', title:'Reading the Weights',            icon:'I', desc:'Logistic regression as an instrument for analysis, not just prediction.',    tags:['interpretability','confounds']},
  {id:'lrreg',     num:'4.14', title:'Regularization',                 icon:'R', desc:'Shrinking weights to stop the model memorizing noise. L1 versus L2.',        tags:['L1','L2','overfitting','sparsity']},
  {id:'lrderiv',   num:'4.15', title:'Deriving the Gradient',          icon:'X', desc:'Where the update rule comes from, one chain-rule step at a time.',           tags:['chain rule','derivation']},
  {id:'lrrecap',   num:'4.16', title:'The Whole Pipeline, End to End',  icon:'\u2211', desc:'One pipeline that runs every stage on a live review.',   tags:['pipeline','recap']}
];

function buildLogregOverview(){
  const cards = LR_SEC.map(s=>`
    <div class="sc-card" onclick="openLrSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Classification &amp; Learning</div>
    <h1 class="lesson-h1">Logistic Regression</h1>
    <p class="lesson-intro">Logistic regression combines features, a weighted score, a probability function, and a training objective. We will build these parts, apply them to a product review, and connect them to the neural networks in later chapters.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">A classifier is four separable parts: features, a scoring function, a loss, and an optimizer. Swap any one and the others still work.</div>
        <div class="ch-sum-item">The sigmoid maps the whole real line onto the open interval between 0 and 1, so a weighted sum can be read as a probability.</div>
        <div class="ch-sum-item">Cross-entropy falls out of maximum likelihood, and it punishes confident wrong answers without limit.</div>
        <div class="ch-sum-item">The gradient of that loss is the prediction error times the feature. Everything about training follows from that one expression.</div>
        <div class="ch-sum-item">Softmax generalizes the sigmoid to many classes, and the gradient keeps exactly the same shape.</div>
        <div class="ch-sum-item">Accuracy is misleading on imbalanced data. Precision, recall, F1, cross-validation, and the bootstrap are what honest evaluation looks like.</div>
        <div class="ch-sum-item">Because the weights are readable, logistic regression is also an instrument for understanding data, and for seeing bias that an opaque model would hide.</div>
      </div>
    </div>`;
}

// ── shared palette for canvas work (viz panels use the dark scope) ──
const LRC = {
  bg:'#0B101F', s1:'#111A30', s2:'#182342', s3:'#223055',
  text:'#ECF1FF', muted:'#8E9AC4',
  acc:'#4DE3FF', pur:'#A18FFF', red:'#FF5F8E', grn:'#3DDC84', amb:'#E0A93B',
  grid:'rgba(214,226,255,0.10)', grid2:'rgba(214,226,255,0.045)'
};

// figure shell: header + empty body that an init function fills
function lrFig(label, bodyId, badge, fs){
  return '<div class="viz-container"><div class="viz-header"><span class="viz-label">' + label + '</span>' +
    '<span style="margin-left:auto;display:flex;align-items:center;gap:.55rem">' +
    (badge ? '<span style="font-family:var(--mono);font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent2);border:1px solid var(--accent2);border-radius:4px;padding:.14rem .44rem">' + badge + '</span>' : '') +
    (fs ? '<button class="viz-fs-btn" onclick="vizToggleFull(\'' + bodyId + '\')" title="Open as a full-screen explorer" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:6px;padding:.3rem .65rem;font-family:var(--mono);font-size:.62rem;cursor:pointer;white-space:nowrap">\u2922 Full screen</button>' : '') +
    '</span></div><div class="viz-body" id="' + bodyId + '"></div></div>';
}

// subsection heading
function lrH3(num, title, flag){
  return '<h3 class="lr-h3"><span class="lr-h3-num">' + num + '</span>' + title +
    (flag ? '<span class="lr-flag">' + flag + '</span>' : '') + '</h3>';
}

// hi-DPI canvas setup. returns {ctx,W,H} in CSS pixels.
function lrCanvas(id, cssH){
  const cv = document.getElementById(id);
  if (!cv) return null;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = cv.clientWidth || cv.parentElement.clientWidth || 600;
  const h = cssH || cv.clientHeight || 300;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  cv.style.height = h + 'px';
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx: ctx, W: w, H: h, cv: cv };
}

function lrSig(z){ return 1 / (1 + Math.exp(-z)); }
function lrClamp(v, a, b){ return v < a ? a : v > b ? b : v; }
function lrFmt(v, d){ return (v < 0 ? '' : '') + v.toFixed(d === undefined ? 2 : d); }
function lrMix(c1, c2, t){
  const p = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const a = p(c1), b = p(c2);
  return 'rgb(' + Math.round(a[0]+(b[0]-a[0])*t) + ',' + Math.round(a[1]+(b[1]-a[1])*t) + ',' + Math.round(a[2]+(b[2]-a[2])*t) + ')';
}
function lrEl(id){ return document.getElementById(id); }
function lrSet(id, html){ const e = lrEl(id); if (e) e.innerHTML = html; }
function lrTxt(id, s){ const e = lrEl(id); if (e) e.textContent = s; }
// registry of running timers so leaving a section stops the animation
let LR_TIMERS = [];
function lrTimer(fn, ms){ const t = setInterval(fn, ms); LR_TIMERS.push(t); return t; }
function lrStopAll(){ LR_TIMERS.forEach(clearInterval); LR_TIMERS = []; }

const LR_PAGES = {};

// ───────────────────────────────────────────────────────────
// 4.1
// ───────────────────────────────────────────────────────────
LR_PAGES.lrintro = `
<div class="lesson-chapter-label">Section 4.1</div>
<h1 class="lesson-h1">How a Classifier Is Built</h1>
<p class="lesson-intro">Classification assigns an input to a category: spam or not spam, positive or negative, or one of several topics. Start with the four parts of a classifier, then inspect how they work in logistic regression.</p>

<h2 class="lesson-h2">Supervised Learning</h2>
<p class="lesson-p">We are given a set of examples, each one a pair: an input <em>x</em> and the correct label <em>y</em> that a human assigned to it. The learner never sees the rule that produced those labels. It only sees the pairs, and its job is to produce a function that maps new, unseen inputs to labels in the same way. That is what <strong>supervised</strong> means: the supervision is the labels.</p>
<p class="lesson-p">There are two broad strategies for building such a function. A <strong>generative model</strong> learns what each class looks like and then asks which class most plausibly produced this input. A naive Bayes spam filter builds a model of spam and a model of non-spam and compares them. A <strong>discriminative model</strong> skips that and learns the boundary between the classes directly. It has no representation of what spam looks like in general; it only knows what separates spam from everything else. Logistic regression is discriminative, and that limitation is also its advantage: all of its capacity goes into the one question being asked.</p>

<h2 class="lesson-h2">The Four Components</h2>
<p class="lesson-p">Pull any supervised classifier apart and you find the same four pieces, each replaceable without disturbing the others.</p>
<div class="def-list">
<div class="def-row"><span class="def-term">Feature representation</span><span class="def-text">A way to turn a messy input into a fixed vector of numbers. For a document this might be word counts, or the six hand-designed features we will use in 4.3.1.</span></div>
<div class="def-row"><span class="def-term">Scoring function</span><span class="def-text">Something that takes the feature vector and produces an estimate of the class. For us this is a weighted sum passed through the sigmoid.</span></div>
<div class="def-row"><span class="def-term">Loss function</span><span class="def-text">A single number saying how far the predictions are from the labels. For us, cross-entropy.</span></div>
<div class="def-row"><span class="def-term">Optimization algorithm</span><span class="def-text">A procedure that changes the parameters to make the loss smaller. For us, gradient descent.</span></div>
</div>
<p class="lesson-p">The pipeline below is that list, made concrete. Click a stage to see what it does and what it hands to the next one.</p>
${lrFig('Interactive \u00b7 The four-stage classifier', 'lr-pipe')}

<h2 class="lesson-h2">Why Hand-Written Rules Break</h2>
<p class="lesson-p">It is tempting to skip the learning entirely. Just write the rules: if the review contains <em>great</em> or <em>brilliant</em>, call it positive; if it contains <em>terrible</em>, call it negative. This works on the easy cases, and then it falls apart on the third or fourth example you try, because language keeps producing sentences your rules never anticipated. <em>I don't love this</em> contains a positive word and means the opposite.</p>
<p class="lesson-p">A learned classifier does not solve this by being cleverer. It solves it by being <em>tunable</em>: instead of a rule that either fires or does not, every feature gets a real-valued weight, and the weights are set by the data rather than by you. Use the switch below to run a fixed rule set and a learned boundary on the same eight reviews.</p>
${lrFig('Interactive \u00b7 Hand-written rules versus a learned boundary', 'lr-rules')}

<div class="lesson-note"><div class="lesson-note-label">Why This Matters</div>
<p>One logistic regression unit is exactly one neuron. The weighted sum, the nonlinearity, the loss, the gradient step: all four survive intact into deep learning. A transformer is not a different idea; it is millions of these stacked and wired together. Understanding all of this completely means understanding the atom.</p></div>

<div class="quiz-block" id="qlr1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does a discriminative model learn directly?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr1','That is the generative strategy: model each class, then compare.')">What each class looks like</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr1','Correct. It learns only what separates the classes, and spends none of its capacity modelling them.')">The boundary between the classes</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr1','Modelling the probability of inputs is generative.')">The probability of each input</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr1','Here the features are designed by hand and given to the model.')">The feature representation</button>
</div><div class="quiz-explain" id="qlr1-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.2
// ───────────────────────────────────────────────────────────
LR_PAGES.lrsigmoid = `
<div class="lesson-chapter-label">Section 4.2</div>
<h1 class="lesson-h1">The Sigmoid</h1>
<p class="lesson-intro">A weighted sum of features can come out as anything: 0.4, or 1700, or minus a million. A probability has to lie between 0 and 1. The sigmoid is what converts one into the other, and it is the only nonlinear step in the whole model.</p>

<h2 class="lesson-h2">The Definition</h2>
<div class="lesson-math">\\[\\sigma(z) = \\dfrac{1}{1 + e^{-z}}\\]</div>
<p class="lesson-p">Read it from the exponential outward. When <em>z</em> is large and positive, \\(e^{-z}\\) collapses toward zero, the denominator approaches 1, and the output approaches 1. When <em>z</em> is large and negative, \\(e^{-z}\\) explodes, the denominator becomes enormous, and the output approaches 0. At \\(z = 0\\) the exponential is exactly 1, so the output is exactly one half. Those three facts are the whole curve.</p>
<p class="lesson-p">Two properties matter more than the formula. It is <strong>differentiable everywhere</strong>, which is what makes gradient descent possible at all, and it <strong>saturates</strong> at both ends: past about \\(|z| = 6\\) the output barely moves. Saturation is why the function is called a squasher, and later, in neural networks, it is also why sigmoids cause trouble.</p>

<h2 class="lesson-h2">Drive It</h2>
<p class="lesson-p">Sweep <em>z</em> and watch the output. Then enter extreme values and see how firmly they are pinned to the ends of the range: as far as the probability is concerned, a score of 40 and a score of 400 are the same answer.</p>
${lrFig('Interactive \u00b7 The squasher', 'lr-sigmoid', null, 1)}

<h2 class="lesson-h2">The Other Direction: Log-Odds</h2>
<p class="lesson-p">The sigmoid is invertible, and its inverse has a name and a meaning. If \\(p = \\sigma(z)\\), then solving for <em>z</em> gives the <strong>logit</strong>, the log of the odds:</p>
<div class="lesson-math">\\[z = \\operatorname{logit}(p) = \\ln\\dfrac{p}{1-p}\\]</div>
<p class="lesson-p">So the weighted sum is not an arbitrary score that happens to get squashed. It <em>is</em> the log-odds of the positive class. That is why the model is called logistic <em>regression</em>: it is an ordinary linear regression, performed on log-odds instead of on the probability directly. It also explains the shape of the weights. A weight of \\(+0.7\\) means "each unit of this feature multiplies the odds by \\(e^{0.7} \\approx 2\\)."</p>
<p class="lesson-p">Toggle the direction in the instrument above to run the mapping backwards, from a probability to the score that produced it. Probabilities near 0 or 1 correspond to very large scores, so pushing the model toward near-certainty requires an increasingly large change in the weighted sum.</p>

<div class="lesson-note"><div class="lesson-note-label">A Derivative Worth Memorizing</div>
<p>The sigmoid has an unusually clean derivative: \\(\\sigma'(z) = \\sigma(z)\\,(1 - \\sigma(z))\\). It is largest at \\(z = 0\\), where it equals \\(0.25\\), and it vanishes at both extremes. Section 4.15 shows how this single identity is what makes the gradient of the loss collapse to something you can write on one line.</p></div>

<div class="quiz-block" id="qlr2"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A feature has weight \\(w = 0\\). What does the sigmoid output tell you about that feature's influence?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr2','Correct. A zero weight contributes nothing to z, so the odds are multiplied by e^0 = 1: no change at all.')">It multiplies the odds by 1, so it has none</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr2','That would be a large negative weight.')">It pushes the prediction to 0</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr2','A zero weight zeroes the contribution, not the whole score.')">It forces the output to 0.5</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr2','The sigmoid is defined for every real input, including 0.')">The sigmoid is undefined</button>
</div><div class="quiz-explain" id="qlr2-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.3  (+ 4.3.1, 4.3.2, 4.3.3)
// ───────────────────────────────────────────────────────────
LR_PAGES.lrclassify = `
<div class="lesson-chapter-label">Section 4.3</div>
<h1 class="lesson-h1">Making the Decision</h1>
<p class="lesson-intro">Each feature contributes to the score in proportion to its weight. The contributions are summed, the sum is squashed into a probability, and the probability is compared against a threshold. That is the entire forward pass.</p>

<h2 class="lesson-h2">Weights, Bias, Dot Product</h2>
<p class="lesson-p">Each feature \\(x_i\\) gets a <strong>weight</strong> \\(w_i\\) recording how much evidence it carries and in which direction. A single <strong>bias</strong> term <em>b</em> shifts the whole decision, encoding how common the positive class is before you look at any feature at all. The score is their dot product plus the bias:</p>
<div class="lesson-math">\\[z = \\mathbf{w} \\cdot \\mathbf{x} + b = \\sum_{i=1}^{n} w_i x_i + b\\]</div>
<div class="lesson-math">\\[P(y = 1 \\mid \\mathbf{x}) = \\sigma(z) = \\dfrac{1}{1 + e^{-(\\mathbf{w} \\cdot \\mathbf{x} + b)}}\\]</div>
<p class="lesson-p">Because there are only two classes, the negative case needs no separate computation: \\(P(y=0 \\mid \\mathbf{x}) = 1 - \\sigma(z)\\).</p>

<h2 class="lesson-h2">The Threshold</h2>
<p class="lesson-p">A probability is not yet a decision. To get one we threshold, conventionally at one half. Since \\(\\sigma(z) \\ge 0.5\\) exactly when \\(z \\ge 0\\), the decision comes down to the sign of the score. The dial below shows the score moving between the two sides as evidence accumulates.</p>
${lrFig('Interactive \u00b7 Evidence and the 0.5 threshold', 'lr-dial')}

<h2 class="lesson-h2">The Decision Boundary</h2>
<p class="lesson-p">The set of inputs where \\(z = 0\\) is the <strong>decision boundary</strong>. In two dimensions it is a straight line; in <em>n</em> dimensions a flat hyperplane. This is why logistic regression is called a <strong>linear</strong> classifier, and it is also its one real limitation: no setting of the weights will ever bend that boundary into a curve. Neural networks are largely about what you have to add to get curves.</p>
<p class="lesson-p">The weight vector points perpendicular to the boundary, in the direction of increasing probability. The bias slides the boundary without rotating it. Confirm both by dragging.</p>
${lrFig('Interactive \u00b7 The boundary in two dimensions', 'lr-bnd', null, 1)}

${lrH3('4.3.1', 'Scoring a Real Review, Word by Word', 'flagship')}
<p class="lesson-p">Here is the model on a real example. The review below is genuinely mixed: it spends two sentences complaining about battery life and fan noise, then spends two more admitting the machine won the reviewer over. Six hand-designed features summarize it.</p>
<div class="def-list">
<div class="def-row"><span class="def-term">\\(x_1\\)</span><span class="def-text">Count of words from a positive sentiment lexicon.</span></div>
<div class="def-row"><span class="def-term">\\(x_2\\)</span><span class="def-text">Count of words from a negative sentiment lexicon.</span></div>
<div class="def-row"><span class="def-term">\\(x_3\\)</span><span class="def-text">1 if the document contains the word <em>no</em>, else 0.</span></div>
<div class="def-row"><span class="def-term">\\(x_4\\)</span><span class="def-text">Count of first and second person pronouns.</span></div>
<div class="def-row"><span class="def-term">\\(x_5\\)</span><span class="def-text">1 if the document contains an exclamation mark, else 0.</span></div>
<div class="def-row"><span class="def-term">\\(x_6\\)</span><span class="def-text">The natural log of the document length in tokens.</span></div>
</div>
<p class="lesson-p">Press play and the model reads the review one token at a time. Every token that triggers a feature increments its counter. When the scan finishes, the six values are multiplied by their weights, accumulated into <em>z</em>, and squashed. Then <strong>drag any weight</strong> and see how the answer responds: the negative-lexicon weight is doing nearly all the work holding this review down, and a small change to it flips the result.</p>
${lrFig('Interactive \u00b7 Six features, one review, live', 'lr-review')}
<p class="lesson-p">The features land at \\(x = (3, 3, 1, 3, 0, 4.01)\\), the final score comes to \\(z = 0.706\\), and \\(\\sigma(0.706) = 0.67\\), so the model calls it positive, but only just. That hesitancy is the correct response to a genuinely mixed review, and it is information a hard rule would have thrown away. Nudge \\(w_2\\) from \\(-3.3\\) to \\(-3.6\\) and the verdict flips: three clicks of one slider is all that separates the two answers.</p>

${lrH3('4.3.2', 'Designing Features for a New Task')}
<p class="lesson-p">Nothing in the machinery is specific to sentiment. Change the features and the same classifier does a different job. Consider <strong>sentence segmentation</strong>: given a period, decide whether it ends a sentence or marks an abbreviation. The features are now about the local context of the character.</p>
<p class="lesson-p">Type a sentence, toggle features on and off, and watch the verdict change. Turn off the abbreviation-dictionary feature and see <em>Prof. Smith</em> get cut in half.</p>
${lrFig('Interactive \u00b7 End-of-sentence detection sandbox', 'lr-eos')}
<p class="lesson-p">This is the practical shape of most classical NLP work: the algorithm is standard, and the domain knowledge sits in the features. It is also why representation learning was such a large change, since embeddings and neural networks replace this hand-design step with features the model finds for itself.</p>

${lrH3('4.3.3', 'From Loops to Matrices')}
<p class="lesson-p">Written as a loop, classifying <em>m</em> documents means computing <em>m</em> separate dot products. Written as linear algebra, it is a single matrix multiplication. Stack the feature vectors as rows of a matrix \\(X\\) with shape \\([m \\times f]\\), keep the weights as a column \\([f \\times 1]\\), and every score appears at once:</p>
<div class="lesson-math">\\[\\mathbf{z} = X\\mathbf{w} + b, \\qquad [m \\times f]\\cdot[f \\times 1] \\rightarrow [m \\times 1]\\]</div>
<p class="lesson-p">The arithmetic is identical. What changes is that the hardware can now do the multiplications in parallel instead of one after another, which is the difference between a model that trains overnight and one that does not finish. Run them side by side below.</p>
${lrFig('Interactive \u00b7 Loop versus matrix multiply', 'lr-vector')}

<div class="quiz-block" id="qlr3"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">The decision boundary of logistic regression is the set of points where:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr3','Correct. z = 0 is exactly where the sigmoid equals 0.5, so it is exactly where the verdict flips.')">The weighted sum \\(z\\) equals zero</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr3','The sigmoid only reaches 1 in the limit, never at a finite point.')">The sigmoid equals 1</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr3','If all weights were zero there would be no boundary at all.')">All weights are zero</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr3','The bias shifts the boundary but does not define it.')">The bias equals zero</button>
</div><div class="quiz-explain" id="qlr3-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.4
// ───────────────────────────────────────────────────────────
LR_PAGES.lrlearn = `
<div class="lesson-chapter-label">Section 4.4</div>
<h1 class="lesson-h1">How Weights Get Learned</h1>
<p class="lesson-intro">Learning replaces hand-set weights with weights estimated from labeled examples. The training loop makes predictions, computes a loss, finds its gradient, and updates the parameters.</p>

<h2 class="lesson-h2">The Loop</h2>
<p class="lesson-p">Predict, measure how wrong the prediction was, adjust every weight in the direction that would have made it less wrong, and repeat. That is the whole algorithm. The two steps that need real definitions are the measuring and the adjusting: Section 4.5 defines the measure and Section 4.6 defines the adjustment.</p>
<p class="lesson-p">Watch the loop run before either half is opened up. The gauge tracks the model's prediction moving toward the true label, and the error bar on the right is what drives every update. As the prediction gets close, the updates shrink on their own, so nothing has to tell the algorithm when to stop.</p>
${lrFig('Interactive \u00b7 Predict, measure, nudge, repeat', 'lr-loop')}

<h2 class="lesson-h2">What Makes a Loss Usable</h2>
<p class="lesson-p">The obvious way to measure wrongness is to count mistakes. It is also useless here, because counting mistakes is a step function: it does not change at all until a prediction crosses the threshold, and then it jumps. A function with no slope gives gradient descent nothing to follow.</p>
<p class="lesson-p">A differentiable loss lets gradient-based training measure how a small parameter change affects the objective. Logistic cross-entropy is also convex in the weights, so every local minimum is global. Convexity alone does not guarantee a unique or finite minimizer; unregularized training on separable data is an important exception.</p>

<div class="lesson-note"><div class="lesson-note-label">The Pattern Never Changes</div>
<p>Define a loss, compute its gradient, step downhill, repeat. This trains logistic regression and it trains the largest models ever built. What changes with scale is the number of parameters and the engineering around the loop, not the loop.</p></div>

<div class="quiz-block" id="qlr4"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is "number of misclassified examples" a poor loss function to train on?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr4','Correct. It is piecewise constant, so its gradient is zero almost everywhere and there is no downhill direction to follow.')">Its gradient is zero almost everywhere</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr4','It is perfectly easy to compute; that is not the problem.')">It is too expensive to compute</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr4','It is bounded below by zero, which is fine.')">It can go negative</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr4','It works for two classes; the issue is differentiability.')">It only works for one class</button>
</div><div class="quiz-explain" id="qlr4-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.5
// ───────────────────────────────────────────────────────────
LR_PAGES.lrloss = `
<div class="lesson-chapter-label">Section 4.5</div>
<h1 class="lesson-h1">Cross-Entropy Loss</h1>
<p class="lesson-intro">Cross-entropy follows from maximum likelihood: assign high probability to the observed labels, then take the negative logarithm to turn the objective into a loss to minimize.</p>

<h2 class="lesson-h2">Start From Likelihood</h2>
<p class="lesson-p">We want the model to assign high probability to the label that actually occurred. For one example with true label \\(y \\in \\{0,1\\}\\) and predicted positive probability \\(\\hat{y}\\), the probability the model assigned to the truth can be written in one expression:</p>
<div class="lesson-math">\\[P(y \\mid \\mathbf{x}) = \\hat{y}^{\\,y}\\,(1-\\hat{y})^{\\,1-y}\\]</div>
<p class="lesson-p">It is a trick with exponents, not a new idea. When \\(y = 1\\) the second factor becomes \\((1-\\hat{y})^0 = 1\\) and the whole thing reduces to \\(\\hat{y}\\). When \\(y = 0\\) the first factor disappears and it reduces to \\(1 - \\hat{y}\\). Either way it returns the probability of the correct answer.</p>

<h2 class="lesson-h2">Take the Log, Flip the Sign</h2>
<p class="lesson-p">Multiplying thousands of probabilities together underflows to zero on real hardware, so we take logarithms, which turn the product into a sum. Optimizers minimize by convention, so we also flip the sign. The result is the <strong>cross-entropy loss</strong> for a single example:</p>
<div class="lesson-math">\\[L_{CE}(\\hat{y}, y) = -\\big[\\, y \\log \\hat{y} + (1-y) \\log(1-\\hat{y}) \\,\\big]\\]</div>
<p class="lesson-p">Only one of the two terms ever survives. If the true label is 1 the loss is \\(-\\log \\hat{y}\\); if it is 0 the loss is \\(-\\log(1-\\hat{y})\\). In both cases the loss is the negative log of the probability assigned to the truth, which is the single sentence worth remembering about this function.</p>

<h2 class="lesson-h2">The Shape of the Penalty</h2>
<p class="lesson-p">Because \\(-\\log\\) has a vertical asymptote at zero, the penalty for being confidently wrong is unbounded. Predict 0.01 when the answer is 1 and the loss is 4.6. Predict 0.001 and it is 6.9. There is no ceiling. Meanwhile being confidently <em>right</em> earns a loss that approaches zero but never crosses it, so there is always a tiny remaining pressure to be more certain.</p>
<p class="lesson-p">Drive the prediction across the whole range and watch the penalty. Two landmarks are pinned to the curve: a reasonable guess costing 0.36, and a confused one costing 1.20.</p>
${lrFig('Interactive \u00b7 The penalty meter', 'lr-loss')}

<h2 class="lesson-h2">Over the Whole Training Set</h2>
<p class="lesson-p">The loss for a dataset is the average over its <em>m</em> examples:</p>
<div class="lesson-math">\\[L(\\mathbf{w}, b) = -\\dfrac{1}{m}\\sum_{i=1}^{m}\\Big[\\, y^{(i)} \\log \\hat{y}^{(i)} + (1-y^{(i)}) \\log(1-\\hat{y}^{(i)}) \\,\\Big]\\]</div>
<p class="lesson-p">The loss is convex in the logistic-regression weights: any local minimum is global. Uniqueness and convergence require further conditions, including a suitable learning rate. Hidden-layer networks generally have nonconvex losses, which changes the optimization problem.</p>

<div class="quiz-block" id="qlr5"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">The true label is 1 and the model predicts \\(\\hat{y} = 0.01\\). The cross-entropy loss is:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr5','That is what you would get if the prediction were nearly correct.')">Near zero</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr5','Correct. -log(0.01) = 4.6. Confident and wrong is the most expensive place to be.')">About 4.6</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr5','Cross-entropy is never negative, since probabilities never exceed 1.')">Negative</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr5','It is only undefined in the limit at exactly 0.')">Undefined</button>
</div><div class="quiz-explain" id="qlr5-explain"></div></div>`;


// ───────────────────────────────────────────────────────────
// 4.6  (+ 4.6.1 update rule, 4.6.2 SGD, 4.6.3 by hand, 4.6.4 batch sizes)
// ───────────────────────────────────────────────────────────
LR_PAGES.lrgrad = `
<div class="lesson-chapter-label">Section 4.6</div>
<h1 class="lesson-h1">Gradient Descent</h1>
<p class="lesson-intro">Each weight setting has a loss value. You can think of those values as a surface, with training moving toward lower regions. Gradient descent uses the local slope to choose an update.</p>

<h2 class="lesson-h2">The Idea</h2>
<p class="lesson-p">The <strong>gradient</strong> is the vector of partial derivatives of the loss with respect to each weight. It points in the direction of steepest <em>increase</em>. To go down, we step the opposite way. The step size is scaled by the <strong>learning rate</strong> \\(\\eta\\):</p>
<div class="lesson-math">\\[w_i \\leftarrow w_i - \\eta \\, \\dfrac{\\partial L}{\\partial w_i}\\]</div>
<p class="lesson-p">The learning rate is the most consequential single setting in the whole procedure. Too small and training takes far longer than it needs to; too large and each step overshoots the minimum, so the parameters oscillate or diverge entirely.</p>

<h2 class="lesson-h2">The Loss Canyon</h2>
<p class="lesson-p">Place a starting point anywhere on the surface below and press step. Then adjust the learning rate: set it high and the path becomes unstable, set it low and progress slows to a crawl. This is the two-dimensional case; the full 3D explorer with four different surfaces is one click away.</p>
${lrFig('Interactive \u00b7 A ball on the loss canyon', 'lr-canyon', null, 1)}
<div style="display:flex;justify-content:center;margin:1.25rem 0 .5rem">
  <button onclick="openGDExplorer()" style="background:linear-gradient(135deg,var(--accent),#a78bfa);color:var(--bg);border:none;border-radius:9px;padding:.7rem 1.4rem;font-family:var(--mono);font-size:.8rem;font-weight:700;cursor:pointer;letter-spacing:.02em">&#9719; Open the full 3D Gradient Descent Explorer</button>
</div>

${lrH3('4.6.1', 'The Update Rule: (\u0177 \u2212 y)\u00b7x')}
<p class="lesson-p">For logistic regression with cross-entropy loss, the gradient with respect to a single weight simplifies a great deal. Section 4.15 derives it; here is the result:</p>
<div class="lesson-math">\\[\\dfrac{\\partial L_{CE}}{\\partial w_i} = (\\hat{y} - y)\\,x_i\\]</div>
<p class="lesson-p">Three parts. The <strong>prediction error</strong> \\(( \\hat{y} - y)\\) says how wrong we were and in which direction. The <strong>feature value</strong> \\(x_i\\) says how much this weight was responsible. Their product is the size of the adjustment. When a prediction is exactly right the error is zero, so the update is zero and correct predictions leave the weights alone. In the tool below, the error term shrinks as the model improves and the update goes to zero with it.</p>
${lrFig('Interactive \u00b7 The three-part update', 'lr-update')}

${lrH3('4.6.2', 'One Example at a Time (SGD)')}
<p class="lesson-p">Computing the gradient over the entire dataset before every step is expensive. <strong>Stochastic gradient descent</strong> goes to the other extreme: pick one example, compute its gradient, take a step, repeat. Each step is cheap and noisy. The path zigzags because a single example is a poor estimate of the whole dataset, but the noise is not just tolerable, it helps, since it can knock the parameters out of shallow local minima. The pseudocode below runs line by line alongside the descent path it produces.</p>
${lrFig('Interactive \u00b7 SGD, line by line', 'lr-sgd')}

${lrH3('4.6.3', 'One Step, By Hand')}
<p class="lesson-p">Every step is shown explicitly. A single training example \\(\\mathbf{x} = [3, 2]\\) with label \\(y = 1\\), all three parameters starting at zero, learning rate \\(0.1\\). Click through each arithmetic operation and watch \\(\\theta\\) move from \\([0, 0, 0]\\) to \\([0.15, 0.1, 0.05]\\). Every number that changes is animated, so you can trace where each value came from.</p>
${lrFig('Interactive \u00b7 A worked gradient step', 'lr-byhand')}

${lrH3('4.6.4', 'Stochastic, Batch, Mini-batch')}
<p class="lesson-p">Between the two extremes sits the compromise everyone actually uses. <strong>Full-batch</strong> descent averages over all examples per step: smooth, accurate, slow. <strong>Stochastic</strong> uses one: fast, jittery. <strong>Mini-batch</strong> averages over a small handful, say 32 or 64, keeping most of the speed while smoothing most of the noise. Slide the batch size and watch one path morph continuously between the jittery and the smooth.</p>
${lrFig('Interactive \u00b7 Three descent styles on one surface', 'lr-batch')}

<div class="lesson-note"><div class="lesson-note-label">Convexity Is a Gift You Are About to Lose</div>
<p>Logistic cross-entropy is convex in the weights, so it has no nonglobal local minima. Convergence still depends on the step size and other conditions, and a finite minimizer need not exist without regularization. Hidden-layer networks generally lose convexity. Compare the surfaces in the explorer below.</p></div>

<div class="quiz-block" id="qlr6"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In the update \\((\\hat{y}-y)\\,x_i\\), the model predicts \\(\\hat{y}=y\\) exactly. What happens to \\(w_i\\)?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr6','Correct. The error term is zero, so the whole update is zero. A correct prediction produces no change.')">It does not change</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr6','A high learning rate scales a zero update to a still-zero update.')">It jumps by the learning rate</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr6','The feature value multiplies a zero error, so it cannot matter.')">It changes in proportion to \\(x_i\\)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr6','The sign of a zero update is not defined by direction; it is simply zero.')">It reverses direction</button>
</div><div class="quiz-explain" id="qlr6-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.7  (+ 4.7.1 softmax, 4.7.2 templates, 4.7.3 per-class weight)
// ───────────────────────────────────────────────────────────
LR_PAGES.lrmulti = `
<div class="lesson-chapter-label">Section 4.7</div>
<h1 class="lesson-h1">More Than Two Classes</h1>
<p class="lesson-intro">Part of speech, topic, digit from 0 to 9: most real problems have more than two answers. The extension is straightforward. One sigmoid output becomes <em>K</em> competing outputs, tied together by the softmax.</p>

<h2 class="lesson-h2">From One Output to K</h2>
<p class="lesson-p">With two classes, one number was enough because \\(P(y=0)\\) was whatever probability was left over. With <em>K</em> classes, each gets its own weight vector and produces its own score \\(z_k = \\mathbf{w}_k \\cdot \\mathbf{x} + b_k\\). Now there are <em>K</em> scores, and they have to be turned into a distribution. Drag the slider below from 2 up to 5 classes and watch the single output split into several competing ones.</p>
${lrFig('Interactive \u00b7 One output splits into many', 'lr-split')}

${lrH3('4.7.1', 'Softmax: Scores Into a Probability Pie')}
<p class="lesson-p">Softmax exponentiates every score, which forces them all positive and exaggerates the gaps, then divides by the total so they sum to one:</p>
<div class="lesson-math">\\[\\text{softmax}(z_k) = \\dfrac{e^{z_k}}{\\sum_{j=1}^{K} e^{z_j}}\\]</div>
<p class="lesson-p">The largest score claims the largest slice, but every class keeps a share, which is why it is "winner take most" rather than winner take all. When \\(K = 2\\), softmax reduces algebraically to the sigmoid, so nothing from the earlier sections is being thrown away. Crank one logit up and watch it dominate while the others are suppressed.</p>
${lrFig('Interactive \u00b7 K logits, one probability pie', 'lr-softmax', null, 1)}

${lrH3('4.7.2', 'The Weight Matrix as Class Detectors')}
<p class="lesson-p">Stack the <em>K</em> weight vectors as rows of a matrix \\(W\\). Each row is a <strong>template</strong> for its class: the pattern of features that class tends to produce. Classifying an input is dot-producting it against every template and seeing which one it most resembles. This reframes classification as template matching, and it is the same idea that, scaled up, becomes the query-key mechanism of attention.</p>
${lrFig('Interactive \u00b7 Matching an input against class templates', 'lr-templates')}

${lrH3('4.7.3', 'One Feature, a Different Weight per Class')}
<p class="lesson-p">A single feature no longer has one weight; it has <em>K</em> of them, one per class, and they can point in different directions. The exclamation-mark feature might carry \\(+3.5\\) for an excited-positive class, \\(+3.1\\) for angry-negative, and \\(-5.3\\) for neutral. The same evidence raises the score of two classes and lowers a third. Toggle the feature below and watch the three scores move in their separate directions.</p>
${lrFig('Interactive \u00b7 One feature fanning out to three classes', 'lr-fanout')}

<div class="quiz-block" id="qlr7"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does the softmax output always satisfy?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr7','Outputs sit in (0,1), but that alone is not the defining property.')">Every output is negative</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr7','Correct. Every output is positive and the outputs sum to exactly 1: a valid probability distribution.')">The outputs are positive and sum to 1</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr7','That would be a hard argmax, not softmax. Softmax keeps every class nonzero.')">Exactly one output is nonzero</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr7','They sum to 1, not to K.')">The outputs sum to the number of classes</button>
</div><div class="quiz-explain" id="qlr7-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.8
// ───────────────────────────────────────────────────────────
LR_PAGES.lrmultilearn = `
<div class="lesson-chapter-label">Section 4.8</div>
<h1 class="lesson-h1">Cross-Entropy for Many Classes</h1>
<p class="lesson-intro">The multi-class loss looks like a sum over all K classes. Then the one-hot label deletes all but one term, and what survives is the same "negative log of the right answer" as before.</p>

<h2 class="lesson-h2">One-Hot Labels</h2>
<p class="lesson-p">The true label becomes a <strong>one-hot vector</strong>: 1 at the correct class, 0 everywhere else. The general cross-entropy loss sums the log-probability of every class, weighted by the label:</p>
<div class="lesson-math">\\[L_{CE} = -\\sum_{k=1}^{K} y_k \\log \\hat{y}_k\\]</div>
<p class="lesson-p">But \\(y_k\\) is 0 for every class except the correct one, so every one of those terms multiplies by zero and vanishes. Only the correct class, where \\(y_k = 1\\), survives:</p>
<div class="lesson-math">\\[L_{CE} = -\\log \\hat{y}_{\\text{correct}}\\]</div>
<p class="lesson-p">Watch the collapse below: the full K-term sum, then the wrong-class terms multiplied by zero and dropping away, leaving one term standing.</p>
${lrFig('Interactive \u00b7 The K-term sum collapses to one', 'lr-collapse')}

<h2 class="lesson-h2">The Gradient Keeps Its Shape</h2>
<p class="lesson-p">The gradient of softmax-with-cross-entropy is, once again, prediction error times feature:</p>
<div class="lesson-math">\\[\\dfrac{\\partial L_{CE}}{\\partial w_{k,i}} = (\\hat{y}_k - y_k)\\,x_i\\]</div>
<p class="lesson-p">The gradient has the same error-times-feature structure as in binary logistic regression. Combining softmax with cross-entropy produces this cancellation and also corresponds to maximum likelihood for categorical labels.</p>

<div class="quiz-block" id="qlr8"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does the K-term cross-entropy sum reduce to a single term?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr8','Correct. The one-hot label is 0 for every wrong class, zeroing those terms and leaving only the correct class.')">The one-hot label zeroes every wrong-class term</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr8','The predicted probabilities are all nonzero; it is the labels that zero the terms.')">The predicted probabilities are zero for wrong classes</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr8','The log is finite for every nonzero probability.')">The logarithm of the wrong classes is zero</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr8','Softmax never outputs exactly 1 for one class.')">Softmax outputs 1 for the correct class</button>
</div><div class="quiz-explain" id="qlr8-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.9  (+ 4.9.1 micro vs macro)
// ───────────────────────────────────────────────────────────
LR_PAGES.lreval = `
<div class="lesson-chapter-label">Section 4.9</div>
<h1 class="lesson-h1">Precision, Recall, and F1</h1>
<p class="lesson-intro">Accuracy can hide poor performance on an imbalanced dataset. If 99% of emails are not spam, a classifier that never flags anything is 99% accurate. Precision and recall show what that score misses.</p>

<h2 class="lesson-h2">The Confusion Matrix</h2>
<p class="lesson-p">Every prediction lands in one of four cells. A <strong>true positive</strong> is a positive correctly flagged. A <strong>false positive</strong> is a negative wrongly flagged. A <strong>false negative</strong> is a positive that was missed. A <strong>true negative</strong> is a negative correctly left alone. These four counts are the raw material for every honest metric.</p>
<div class="lesson-math">\\[\\text{Precision} = \\dfrac{TP}{TP + FP} \\qquad \\text{Recall} = \\dfrac{TP}{TP + FN}\\]</div>
<p class="lesson-p"><strong>Precision</strong> asks: of everything I flagged, how much was right? <strong>Recall</strong> asks: of everything I should have flagged, how much did I catch? They pull against each other. Flag everything and recall is perfect while precision collapses; flag only a few high-confidence cases and precision may improve while recall falls.</p>

<h2 class="lesson-h2">F1</h2>
<p class="lesson-p">The <strong>F1 score</strong> is the harmonic mean of the two. Unlike the plain average, it does not let a high score on one metric compensate for a low score on the other, because the harmonic mean is pulled toward the smaller number.</p>
<div class="lesson-math">\\[F_1 = \\dfrac{2 \\cdot \\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}\\]</div>
<p class="lesson-p">Slide the decision threshold across the two overlapping populations below and watch the four cells rebalance while precision, recall, F1, and accuracy recompute live. Then press the "Rare Fault" button to see a 99.99%-accuracy model that is useless.</p>
${lrFig('Interactive \u00b7 Confusion matrix with a movable threshold', 'lr-conf', null, 1)}

${lrH3('4.9.1', 'Micro versus Macro Averaging')}
<p class="lesson-p">With more than two classes, there are two ways to average a metric across them, and they answer different questions. <strong>Micro-averaging</strong> pools every decision into one confusion matrix, so a class with many examples dominates. <strong>Macro-averaging</strong> computes the metric per class and then averages those, giving every class an equal weight regardless of size. Toggle between them on a three-class camera-trap problem, where the overwhelming majority of frames catch nothing at all: the dominant empty class controls the micro number, while the macro number gives the two rare animal classes equal weight.</p>
${lrFig('Interactive \u00b7 Micro versus macro on three classes', 'lr-avg')}

<div class="quiz-block" id="qlr9"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A model flags every input as positive. Its recall is:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr9','Correct. It catches every actual positive, so recall is 1.0. Precision, meanwhile, is terrible.')">Perfect at 1.0, but precision suffers</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr9','Flagging everything catches all positives, so recall cannot be zero.')">Zero</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr9','Recall and precision are generally different; here they are far apart.')">Equal to precision</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr9','With at least one real positive present, recall is well defined.')">Undefined</button>
</div><div class="quiz-explain" id="qlr9-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.10
// ───────────────────────────────────────────────────────────
LR_PAGES.lrcrossval = `
<div class="lesson-chapter-label">Section 4.10</div>
<h1 class="lesson-h1">Cross-Validation</h1>
<p class="lesson-intro">A single train/test split gives you one number, and that number could be lucky or unlucky depending on which examples happened to land in the test set. Cross-validation gets a more reliable estimate out of limited data by rotating the test set through every part of it.</p>

<h2 class="lesson-h2">K-Fold</h2>
<p class="lesson-p">Split the data into k folds. Train on k−1 folds, evaluate on the held-out fold, and repeat so each fold is held out once. Averaging gives a less split-dependent estimate, although the scores are correlated and uncertainty remains. Preprocessing must be fitted separately within each training fold.</p>
<p class="lesson-p">Watch the dev block slide across the training bar below, one fold at a time, each run posting its own error rate into a running average.</p>
${lrFig('Interactive \u00b7 Ten-fold cross-validation', 'lr-kfold')}

<div class="lesson-note"><div class="lesson-note-label">Keep the Test Set Sacred</div>
<p>When cross-validation guides model selection, keep a separate test set for the final evaluation or use nested cross-validation. Cross-validation itself is a valid evaluation method; the bias arises when the same results are used both to choose a model and to estimate its final performance.</p></div>

<div class="quiz-block" id="qlr10"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In 10-fold cross-validation, how many times is each example used for testing?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr10','Correct. Each example sits in exactly one fold, and that fold is the test set exactly once.')">Exactly once</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr10','Testing on an example ten times would defeat the point of holding it out.')">Ten times</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr10','Every example is tested; none is skipped.')">Never</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr10','Nine is how often it is used for training, not testing.')">Nine times</button>
</div><div class="quiz-explain" id="qlr10-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.11  (+ 4.11.1 bootstrap)
// ───────────────────────────────────────────────────────────
LR_PAGES.lrsig = `
<div class="lesson-chapter-label">Section 4.11</div>
<h1 class="lesson-h1">Is A Really Better Than B?</h1>
<p class="lesson-intro">Two models can get different test scores partly because of sampling variation. Significance tests help assess the evidence for a difference, subject to the assumptions of the test.</p>

<h2 class="lesson-h2">The Null Hypothesis</h2>
<p class="lesson-p">The null hypothesis specifies what the test assumes in the absence of a difference. A p-value is the probability, under that null and the test’s assumptions, of a statistic at least as extreme as the observed one. A small value is evidence against the null, not the probability that the result is a fluke or proof of a practically important difference.</p>
<p class="lesson-p">Build the null distribution below by resampling, drop the observed \\(\\delta\\) onto it, and drag the significance threshold to see the verdict flip between significant and not.</p>
${lrFig('Interactive \u00b7 The null distribution and the p-value tail', 'lr-null')}

${lrH3('4.11.1', 'The Bootstrap', 'standout')}
<p class="lesson-p">A paired bootstrap resamples test examples with replacement and evaluates both models on each resample. The resulting differences help estimate sampling uncertainty. Resampling must respect the data’s structure, such as documents or speakers; otherwise the uncertainty can be understated.</p>
<p class="lesson-p">The tool below holds a 10-document test set. Pull the resample handle to draw a virtual set with replacement, add its \\(\\delta\\) to the growing histogram, and watch the counter track how often \\(\\delta(x^i) \\ge 2\\delta(x)\\) while the empirical p-value updates.</p>
${lrFig('Interactive \u00b7 The bootstrap slot machine', 'lr-boot')}

<div class="quiz-block" id="qlr11"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A small p-value means:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr11','Correct. Under the null, a gap this large would be rare, so we reject the null and call the difference real.')">The observed gap would be unlikely by chance</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr11','A small p-value argues against the result being random, not for it.')">The result is probably random</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr11','The p-value is not the model accuracy.')">The model is very accurate</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr11','The p-value measures unlikeliness under the null, not the raw size of the gap.')">The models are far apart</button>
</div><div class="quiz-explain" id="qlr11-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.12
// ───────────────────────────────────────────────────────────
LR_PAGES.lrharms = `
<div class="lesson-chapter-label">Section 4.12</div>
<h1 class="lesson-h1">When Classifiers Cause Harm</h1>
<p class="lesson-intro">Classification errors can affect people differently across groups. This section looks at how training data, labels, and evaluation choices can reinforce those differences.</p>

<h2 class="lesson-h2">Two Kinds of Harm</h2>
<p class="lesson-p"><strong>Representational harm</strong> is when a system demeans or stereotypes a group: a sentiment model that scores sentences more negatively simply because they mention a particular identity. <strong>Allocational harm</strong> is when a system unfairly distributes real resources or opportunities: a resume screener that quietly downranks qualified candidates from a particular background. The first is about dignity and depiction; the second is about who gets the job, the loan, the bail.</p>

<h2 class="lesson-h2">Where the Bias Comes From</h2>
<p class="lesson-p">The model is not malicious. It is reproducing the patterns in its training data, which is exactly the problem. If past hiring favored one group, a model trained on that history learns to favor it too, and the resulting bias now carries the appearance of an objective algorithm. The audit below runs the same sentence through a mock sentiment model while swapping only a name or an identity term, so you can see the score shift on a change that should be irrelevant.</p>
${lrFig('Interactive \u00b7 A bias audit: swap one word', 'lr-bias')}

<h2 class="lesson-h2">What Documentation Fixes</h2>
<p class="lesson-p">A model card documents training data, evaluation, intended uses, and known limitations. It does not remove bias, but it helps readers assess whether the evidence supports a proposed use. Fill in the template below.</p>
${lrFig('Interactive \u00b7 A model card template', 'lr-card')}

<div class="quiz-block" id="qlr12"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A resume screener that systematically downranks a qualified group is an example of:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr12','Correct. Allocational harm is the unfair distribution of real resources or opportunities, like jobs.')">Allocational harm</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr12','Representational harm is about demeaning or stereotyping, not about who gets the resource.')">Representational harm only</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr12','A biased outcome that affects livelihoods is a real harm, not neutral statistics.')">No harm, just statistics</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr12','Overfitting is a modelling problem, a different issue from this.')">Overfitting</button>
</div><div class="quiz-explain" id="qlr12-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.13
// ───────────────────────────────────────────────────────────
LR_PAGES.lrinterp = `
<div class="lesson-chapter-label">Section 4.13</div>
<h1 class="lesson-h1">Reading the Weights</h1>
<p class="lesson-intro">Logistic regression gives each feature an explicit weight. Inspecting those weights can help explain predictions, provided we account for feature scale, correlations, and the difference between association and causation.</p>

<h2 class="lesson-h2">Weights as Evidence</h2>
<p class="lesson-p">Each weight belongs to one feature and reads directly. A large positive weight means the feature strongly votes for the positive class; a large negative weight votes against; a weight near zero means the feature barely matters. Train a sentiment classifier and the most positive weights are literally the model's idea of what sounds positive. Sort the weights below and hover any bar to see its exact contribution to a specific prediction.</p>
${lrFig('Interactive \u00b7 Sortable weight contributions', 'lr-weights')}

<h2 class="lesson-h2">The Confound Trap</h2>
<p class="lesson-p">Using logistic regression to <em>explain</em> rather than to predict is where the risk lies. A feature can look influential only because it stands in for something else you did not measure. The word <em>hospital</em> might appear to predict an outcome purely because sicker people write it, not because of anything the word itself carries. Toggle the confound control below and watch a feature's apparent effect change once a correlated variable is held constant.</p>
${lrFig('Interactive \u00b7 Holding a confound constant', 'lr-confound')}

<div class="quiz-block" id="qlr13"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A feature with a large negative weight in a sentiment model:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr13','Correct. A large negative weight pushes the prediction toward the negative class.')">Strongly votes for the negative class</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr13','Positive votes come from positive weights.')">Strongly votes positive</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr13','Near-zero weights are the irrelevant ones, not large-magnitude ones.')">Is irrelevant to the decision</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr13','The sign carries clear meaning: negative means against the positive class.')">Has no interpretable meaning</button>
</div><div class="quiz-explain" id="qlr13-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.14
// ───────────────────────────────────────────────────────────
LR_PAGES.lrreg = `
<div class="lesson-chapter-label">Section 4.14</div>
<h1 class="lesson-h1">Regularization</h1>
<p class="lesson-intro">A model can fit training noise and perform poorly on new data. Regularization limits this tendency by penalizing certain parameter choices. L1 and L2 penalties do this in different ways.</p>

<h2 class="lesson-h2">The Penalty</h2>
<p class="lesson-p">Add a term to the loss that grows with the size of the weights. Now the optimizer has two goals in tension: fit the data, but keep the weights small. The result captures the real signal without contorting itself to pass through every noisy point. Slide the regularization strength below and watch a wildly overfit boundary relax into a smooth one.</p>
${lrFig('Interactive \u00b7 Regularization strength smooths the boundary', 'lr-reg')}

<h2 class="lesson-h2">L2 versus L1</h2>
<p class="lesson-p"><strong>L2</strong> penalizes the sum of squared weights. It discourages any single weight from getting large and spreads influence smoothly across features:</p>
<div class="lesson-math">\\[L = L_{CE} + \\lambda \\sum_{i} w_i^2\\]</div>
<p class="lesson-p"><strong>L1</strong> penalizes the sum of absolute values, and it has a striking side effect: it drives many weights to <em>exactly</em> zero, selecting a small subset of features and discarding the rest.</p>
<div class="lesson-math">\\[L = L_{CE} + \\lambda \\sum_{i} |w_i|\\]</div>
<p class="lesson-p">The geometry explains the difference. L2's constraint region is a circle, which a contour of the loss tends to touch at a point with all coordinates nonzero. L1's region is a diamond, whose sharp corners sit on the axes, so the contour tends to touch <em>at</em> a corner, zeroing a coordinate. Toggle between them below and watch L1 snap weights to zero while L2 merely shrinks them.</p>
${lrFig('Interactive \u00b7 L1 sparsity versus L2 shrinkage', 'lr-l1l2')}

<div class="quiz-block" id="qlr14"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Which regularizer tends to drive many weights to exactly zero?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr14','Correct. L1 produces sparse solutions, zeroing out many weights for effective feature selection.')">L1 (sum of absolute values)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr14','L2 shrinks weights smoothly but rarely to exactly zero.')">L2 (sum of squares)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr14','They behave differently: only one zeroes weights out.')">Both equally</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr14','Both penalize weights; the sparsity effect is specific to L1.')">Neither</button>
</div><div class="quiz-explain" id="qlr14-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.15
// ───────────────────────────────────────────────────────────
LR_PAGES.lrderiv = `
<div class="lesson-chapter-label">Section 4.15 &middot; Advanced</div>
<h1 class="lesson-h1">Deriving the Gradient</h1>
<p class="lesson-intro">We have been asserting that the gradient is \\((\\hat{y}-y)\\,x_i\\) without proving it. The clean result is not a coincidence: it comes from the chain rule combined with the sigmoid's own derivative, which cancels almost everything.</p>

<h2 class="lesson-h2">The Setup</h2>
<p class="lesson-p">Start from the loss for one example, with \\(\\hat{y} = \\sigma(z)\\) and \\(z = \\mathbf{w}\\cdot\\mathbf{x} + b\\):</p>
<div class="lesson-math">\\[L = -\\big[\\, y \\log \\sigma(z) + (1-y) \\log(1 - \\sigma(z)) \\,\\big]\\]</div>
<p class="lesson-p">We want \\(\\partial L / \\partial w_i\\). The chain rule breaks it into three factors: how the loss depends on the prediction, how the prediction depends on the score, and how the score depends on the weight.</p>
<div class="lesson-math">\\[\\dfrac{\\partial L}{\\partial w_i} = \\dfrac{\\partial L}{\\partial \\hat{y}} \\cdot \\dfrac{\\partial \\hat{y}}{\\partial z} \\cdot \\dfrac{\\partial z}{\\partial w_i}\\]</div>

<h2 class="lesson-h2">The Three Pieces</h2>
<p class="lesson-p">Reveal them one at a time in the tool below, with the term currently being differentiated highlighted and the sigmoid-derivative identity shown in an inset. The three factors are:</p>
<div class="lesson-math">\\[\\dfrac{\\partial L}{\\partial \\hat{y}} = \\dfrac{\\hat{y} - y}{\\hat{y}(1-\\hat{y})} \\qquad \\dfrac{\\partial \\hat{y}}{\\partial z} = \\sigma(z)(1-\\sigma(z)) \\qquad \\dfrac{\\partial z}{\\partial w_i} = x_i\\]</div>
${lrFig('Interactive \u00b7 The derivation, unfolded', 'lr-deriv')}

<h2 class="lesson-h2">The Cancellation</h2>
<p class="lesson-p">Now multiply. The middle factor is \\(\\sigma(z)(1-\\sigma(z))\\), which is exactly \\(\\hat{y}(1-\\hat{y})\\), the denominator of the first factor. They cancel completely:</p>
<div class="lesson-math">\\[\\dfrac{\\partial L}{\\partial w_i} = \\dfrac{\\hat{y}-y}{\\hat{y}(1-\\hat{y})} \\cdot \\hat{y}(1-\\hat{y}) \\cdot x_i = (\\hat{y} - y)\\,x_i\\]</div>
<p class="lesson-p">The factors cancel, leaving prediction error times the feature. Cross-entropy with a sigmoid has a useful gradient even when a prediction is confidently wrong. This is one reason to prefer it to squared error for binary classification, alongside its maximum-likelihood interpretation.</p>

<div class="quiz-block" id="qlr15"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">The derivative of the sigmoid \\(\\sigma(z)\\) with respect to \\(z\\) equals:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr15','Correct. sigma(z)(1 - sigma(z)), the identity that cancels the loss denominator.')">\\(\\sigma(z)\\,(1 - \\sigma(z))\\)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr15','That is the exponential, which is its own derivative, not the sigmoid.')">\\(\\sigma(z)\\)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr15','Close, but the form is the product sigma(z)(1-sigma(z)).')">\\(1 - \\sigma(z)\\)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr15','The derivative is not simply z.')">\\(z\\)</button>
</div><div class="quiz-explain" id="qlr15-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 4.16
// ───────────────────────────────────────────────────────────
LR_PAGES.lrrecap = `
<div class="lesson-chapter-label">Section 4.16</div>
<h1 class="lesson-h1">The Whole Pipeline, End to End</h1>
<p class="lesson-intro">Enter a review and follow the calculation from features to score, probability, loss, and a weight update. Compare the loss before and after a step, and try changing the learning rate.</p>

<h2 class="lesson-h2">One Review, All the Way Through</h2>
<p class="lesson-p">The tool below is everything assembled. A review enters on the left. Features are extracted, dot-producted against the current weights, squashed by the sigmoid, and compared to the true label to produce a cross-entropy loss. One gradient step adjusts the weights, and the pipeline is ready to run again. Each stage is labelled with the section that built it, so it also works as a map back to anything you want to revisit.</p>
${lrFig('Interactive \u00b7 The end-to-end classifier', 'lr-recap')}

<div class="lesson-note"><div class="lesson-note-label">Where This Goes Next</div>
<p>Neural networks reuse the same ingredients while learning intermediate features in hidden layers. The next chapter shows how those layers change the decision boundary and how backpropagation computes their gradients.</p></div>

<div class="quiz-block" id="qlr16"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In the end-to-end loop, which quantity is the one that actually drives the weight update?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qlr16','Correct. The prediction error, times each feature, is the gradient that updates every weight.')">The prediction error, \\(\\hat{y} - y\\)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr16','The raw score feeds the sigmoid, but the update is driven by the error after it.')">The raw score \\(z\\)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr16','Document length is just one feature among six.')">The document length</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qlr16','The threshold turns a probability into a label but does not update weights.')">The 0.5 threshold</button>
</div><div class="quiz-explain" id="qlr16-explain"></div></div>`;


// ═══════════════════════════════════════════════════════════
// CHAPTER 4 · INSTRUMENT DISPATCH
// ═══════════════════════════════════════════════════════════
const LR_INIT = {
  lrintro:    () => { lrPipeInit(); lrRulesInit(); },
  lrsigmoid:  () => { lrSigmoidInit(); },
  lrclassify: () => { lrDialInit(); lrBndInit(); lrReviewInit(); lrEosInit(); lrVectorInit(); },
  lrlearn:    () => { lrLoopInit(); },
  lrloss:     () => { lrLossInit(); },
  lrgrad:     () => { lrCanyonInit(); lrUpdateInit(); lrSgdInit(); lrByhandInit(); lrBatchInit(); },
  lrmulti:    () => { lrSplitInit(); lrSoftmaxInit(); lrTemplatesInit(); lrFanoutInit(); },
  lrmultilearn:() => { lrCollapseInit(); },
  lreval:     () => { lrConfInit(); lrAvgInit(); },
  lrcrossval: () => { lrKfoldInit(); },
  lrsig:      () => { lrNullInit(); lrBootInit(); },
  lrharms:    () => { lrBiasInit(); lrCardInit(); },
  lrinterp:   () => { lrWeightsInit(); lrConfoundInit(); },
  lrreg:      () => { lrRegInit(); lrL1L2Init(); },
  lrderiv:    () => { lrDerivInit(); },
  lrrecap:    () => { lrRecapInit(); }
};

function openLrSec(id) {
  const pg = LR_PAGES[id];
  if (!pg) return;
  lrStopAll();
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if (!sv || !sb) return;
  const sec = LR_SEC.find(s => s.id === id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if (crumb && sec) crumb.innerHTML = 'Logistic Regression <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  renderMath(sb);
  mcSectionDelay(() => { if (LR_INIT[id]) LR_INIT[id](); }, 90);
  sv.onscroll = () => {
    const h = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if (bar) bar.style.width = (h > 0 ? (sv.scrollTop / h) * 100 : 0) + '%';
  };
}
// stop animations when the section view is closed too
(function(){
  const _cs = window.closeSec;
  window.closeSec = function(){ lrStopAll(); if (_cs) _cs.apply(this, arguments); };
})();

// ───────────────────────────────────────────────────────────
// 4.1 — Four-stage pipeline
// ───────────────────────────────────────────────────────────
const LR_PIPE = [
  { k:'Features', c:LRC.acc, t:'Feature representation',
    d:'Turns a raw input into a vector of numbers. Here: six hand-designed counts summarizing a review.',
    out:'x = [3, 2, 1, 3, 0, 4.19]' },
  { k:'Score', c:LRC.pur, t:'Scoring function',
    d:'A weighted sum of the features plus a bias, squashed by the sigmoid into a probability.',
    out:'\u0177 = \u03c3(w\u00b7x + b) = 0.70' },
  { k:'Loss', c:LRC.red, t:'Loss function',
    d:'Compares the prediction to the true label and returns one number: how wrong we were.',
    out:'L = \u2212log(0.70) = 0.36' },
  { k:'Optimizer', c:LRC.grn, t:'Optimization algorithm',
    d:'Adjusts every weight to shrink the loss, using the gradient. Repeats until the loss stops falling.',
    out:'w \u2190 w \u2212 \u03b7\u00b7(\u0177\u2212y)\u00b7x' }
];
let _lrPipe = 0;
function lrPipeInit(){ _lrPipe = 0; lrPipeRender(); }
function lrPipeSel(i){ _lrPipe = i; lrPipeRender(); }
function lrPipeRender(){
  const host = lrEl('lr-pipe');
  if (!host) return;
  const chips = LR_PIPE.map((s,i)=>{
    const on = i === _lrPipe;
    return '<button onclick="lrPipeSel('+i+')" style="flex:1;min-width:120px;text-align:left;background:'+(on?'var(--surface3)':'var(--surface2)')+';border:1px solid '+(on?s.c:'var(--border2)')+';border-radius:9px;padding:.7rem .8rem;cursor:pointer;transition:all .15s">'+
      '<div style="font-family:var(--mono);font-size:.58rem;color:var(--muted)">STAGE '+(i+1)+'</div>'+
      '<div style="font-family:var(--mono);font-size:.86rem;font-weight:700;color:'+(on?s.c:'var(--text)')+';margin-top:.15rem">'+s.k+'</div></button>';
  }).join('<div style="align-self:center;color:var(--muted);font-size:1.1rem">\u2192</div>');
  const s = LR_PIPE[_lrPipe];
  host.innerHTML =
    '<div style="display:flex;gap:.4rem;align-items:stretch;flex-wrap:wrap">'+chips+'</div>'+
    '<div class="lr-card" style="margin-top:1rem;border-left:3px solid '+s.c+'">'+
      '<div class="lr-card-t" style="color:'+s.c+'">'+s.t+'</div>'+
      '<div class="lr-card-b">'+s.d+'</div>'+
      '<div style="margin-top:.7rem;font-family:var(--mono);font-size:.8rem;color:'+s.c+';background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:.5rem .7rem">'+s.out+'</div>'+
    '</div>';
}

// ───────────────────────────────────────────────────────────
// 4.1 — Rules vs learned
// ───────────────────────────────────────────────────────────
const LR_RULES_DATA = [
  { t:'an absolute masterpiece, loved every minute', y:1 },
  { t:'brilliant and moving, a triumph', y:1 },
  { t:'i don\u2019t love this, honestly', y:0 },
  { t:'not bad, but not great either', y:0 },
  { t:'terrible, a complete waste of time', y:0 },
  { t:'hardly the disaster critics claim; quite good', y:1 },
  { t:'great premise, terrible execution', y:0 },
  { t:'surprisingly enjoyable despite the hype', y:1 }
];
let _lrRulesMode = 'rules';
function lrRulesInit(){ _lrRulesMode = 'rules'; lrRulesRender(); }
function lrRulesSet(m){ _lrRulesMode = m; lrRulesRender(); }
function lrRulesClassify(t){
  // toy rule: positive word present and no negation -> positive
  const pos = /(love|loved|brilliant|masterpiece|triumph|great|good|enjoyable|moving)/i.test(t);
  const neg = /(terrible|waste|disaster|bad)/i.test(t);
  const negation = /(don\u2019t|dont|not|hardly|despite)/i.test(t);
  if (_lrRulesMode === 'rules') {
    return (pos && !neg) ? 1 : 0;              // brittle: ignores negation
  }
  // "learned": a slightly smarter scorer that weighs negation and contrast
  let s = 0;
  if (pos) s += 1; if (neg) s -= 1;
  if (negation && pos) s -= 1.4;              // "don't love" flips
  if (negation && neg) s += 1.2;              // "hardly the disaster" flips up
  if (/quite good|surprisingly|enjoyable/i.test(t)) s += 0.8;
  return s >= 0 ? 1 : 0;
}
function lrRulesRender(){
  const host = lrEl('lr-rules');
  if (!host) return;
  let correct = 0;
  const rows = LR_RULES_DATA.map(d=>{
    const pred = lrRulesClassify(d.t);
    const ok = pred === d.y;
    if (ok) correct++;
    const col = ok ? LRC.grn : LRC.red;
    return '<div style="display:flex;align-items:center;gap:.7rem;padding:.5rem .7rem;background:var(--surface2);border:1px solid var(--border);border-left:3px solid '+col+';border-radius:7px">'+
      '<span style="flex:1;font-size:.82rem;color:var(--text)">'+d.t+'</span>'+
      '<span style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">said '+(pred?'POS':'NEG')+'</span>'+
      '<span style="font-family:var(--mono);font-size:.9rem;color:'+col+'">'+(ok?'\u2713':'\u2717')+'</span></div>';
  }).join('');
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem">'+
      '<button class="lr-btn '+(_lrRulesMode==='rules'?'on':'')+'" onclick="lrRulesSet(\'rules\')">Hand-written rules</button>'+
      '<button class="lr-btn '+(_lrRulesMode==='learned'?'on':'')+'" onclick="lrRulesSet(\'learned\')">Learned weights</button>'+
      '<span class="lr-stat" style="margin-left:auto"><span class="lr-stat-k">Correct</span><span class="lr-stat-v" style="color:'+(correct>=7?LRC.grn:correct>=5?LRC.amb:LRC.red)+'">'+correct+' / 8</span></span>'+
    '</div>'+
    '<div style="display:flex;flex-direction:column;gap:.4rem">'+rows+'</div>'+
    '<div class="lr-note">'+(_lrRulesMode==='rules'
      ? 'The rule fires on any positive word and ignores negation, so <em>i don\u2019t love this</em> and <em>hardly the disaster</em> both fool it.'
      : 'The learned scorer weighs negation and contrast, catching the reviews the fixed rules got backwards.')+'</div>';
}

// ───────────────────────────────────────────────────────────
// 4.2 — Sigmoid squasher (+ logit direction)
// ───────────────────────────────────────────────────────────
let _lrSig = { z:0, inv:false };
function lrSigmoidInit(){
  _lrSig = { z:0, inv:false };
  const host = lrEl('lr-sigmoid');
  if (!host) return;
  host.innerHTML =
    '<canvas id="lr-sig-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem">'+
      '<button class="lr-btn '+(!_lrSig.inv?'on':'')+'" id="lr-sig-fwd" onclick="lrSigDir(false)">z \u2192 probability</button>'+
      '<button class="lr-btn '+(_lrSig.inv?'on':'')+'" id="lr-sig-inv" onclick="lrSigDir(true)">probability \u2192 z (logit)</button>'+
      '<div class="lr-sl" style="margin-left:auto"><span id="lr-sig-lab">z</span><input id="lr-sig-in" type="range" min="-8" max="8" step="0.05" value="0" oninput="lrSigDrive(this.value)"><b id="lr-sig-v">0.00</b></div>'+
    '</div>'+
    '<div class="lr-readout" style="margin-top:.85rem">'+
      '<span class="lr-stat"><span class="lr-stat-k">z (log-odds)</span><span class="lr-stat-v" id="lr-sig-z" style="color:'+LRC.pur+'">0.00</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">\u03c3(z)</span><span class="lr-stat-v" id="lr-sig-p" style="color:'+LRC.acc+'">0.50</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">odds p/(1\u2212p)</span><span class="lr-stat-v" id="lr-sig-o" style="color:'+LRC.grn+'">1.00</span></span>'+
    '</div>'+
    '<div class="lr-note">Sweep the slider. Past |z|\u22486 the curve saturates: bigger inputs barely move the probability.</div>';
  const quick = document.createElement('div');
  quick.className = 'lr-ctl';
  quick.style.marginTop = '.6rem';
  quick.innerHTML = ['-40','-3','0','3','40'].map(v=>'<button class="lr-btn" onclick="lrSigDrive('+v+')">z = '+v+'</button>').join('');
  host.appendChild(quick);
  lrSigDraw();
}
function lrSigDir(inv){
  _lrSig.inv = inv;
  lrEl('lr-sig-fwd').classList.toggle('on', !inv);
  lrEl('lr-sig-inv').classList.toggle('on', inv);
  const inp = lrEl('lr-sig-in');
  if (inv){ inp.min=0.01; inp.max=0.99; inp.step=0.005; inp.value=lrSig(_lrSig.z).toFixed(3); lrTxt('lr-sig-lab','p'); }
  else    { inp.min=-8; inp.max=8; inp.step=0.05; inp.value=_lrSig.z.toFixed(2); lrTxt('lr-sig-lab','z'); }
  lrSigDrive(inp.value);
}
function lrSigDrive(v){
  v = parseFloat(v);
  if (_lrSig.inv){ _lrSig.z = Math.log(v/(1-v)); lrTxt('lr-sig-v', v.toFixed(2)); }
  else { _lrSig.z = lrClamp(v,-40,40); lrTxt('lr-sig-v', v.toFixed(2)); }
  const p = lrSig(_lrSig.z);
  lrTxt('lr-sig-z', _lrSig.z.toFixed(2));
  lrTxt('lr-sig-p', p.toFixed(3));
  lrTxt('lr-sig-o', (p/(1-p)).toFixed(2));
  lrSigDraw();
}
function lrSigDraw(){
  const c = lrCanvas('lr-sig-cv', 300);
  if (!c) return;
  const { ctx, W, H } = c;
  const pad = 42;
  const x0=pad, x1=W-14, y0=H-30, y1=14;
  const zMin=-8, zMax=8;
  const xm = z => x0 + (lrClamp(z,zMin,zMax)-zMin)/(zMax-zMin)*(x1-x0);
  const ym = p => y0 + p*(y1-y0);
  // grid
  ctx.strokeStyle = LRC.grid; ctx.lineWidth = 1;
  [0,0.5,1].forEach(p=>{ ctx.beginPath(); ctx.moveTo(x0,ym(p)); ctx.lineTo(x1,ym(p)); ctx.stroke(); });
  ctx.beginPath(); ctx.moveTo(xm(0),y1); ctx.lineTo(xm(0),y0); ctx.stroke();
  ctx.fillStyle = LRC.muted; ctx.font = '11px IBM Plex Mono, monospace';
  ctx.fillText('1.0', 8, ym(1)+4); ctx.fillText('0.5', 8, ym(0.5)+4); ctx.fillText('0.0', 8, ym(0)+4);
  ctx.fillText('z', x1-8, ym(0)+16);
  // curve
  ctx.strokeStyle = LRC.acc; ctx.lineWidth = 2.5; ctx.beginPath();
  for (let px=x0; px<=x1; px++){ const z=zMin+(px-x0)/(x1-x0)*(zMax-zMin); const p=lrSig(z); if(px===x0)ctx.moveTo(px,ym(p)); else ctx.lineTo(px,ym(p)); }
  ctx.stroke();
  // point
  const z = _lrSig.z, p = lrSig(z);
  ctx.strokeStyle = 'rgba(161,143,255,0.45)'; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(xm(z),y0); ctx.lineTo(xm(z),ym(p)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0,ym(p)); ctx.lineTo(xm(z),ym(p)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = LRC.pur; ctx.beginPath(); ctx.arc(xm(z),ym(p),6,0,7); ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
  // probability bar
  const bx = x1+2;
  ctx.fillStyle = LRC.s3; ctx.fillRect(W-9, y1, 6, y0-y1);
  ctx.fillStyle = LRC.acc; ctx.fillRect(W-9, ym(p), 6, y0-ym(p));
}

// ───────────────────────────────────────────────────────────
// 4.3 — Evidence dial
// ───────────────────────────────────────────────────────────
let _lrDial = { z:0, anim:null };
function lrDialInit(){
  _lrDial = { z:0, anim:null };
  const host = lrEl('lr-dial');
  if (!host) return;
  host.innerHTML =
    '<canvas id="lr-dial-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center">'+
      '<button class="lr-btn" onclick="lrDialAdd(-0.6)">\u2212 negative evidence</button>'+
      '<button class="lr-btn" onclick="lrDialReset()">reset</button>'+
      '<button class="lr-btn" onclick="lrDialAdd(0.6)">+ positive evidence</button>'+
    '</div>'+
    '<div class="lr-note" style="text-align:center">Each click adds a weighted feature. The needle crosses 0.5 exactly when the running score z crosses 0.</div>';
  lrDialDraw();
}
function lrDialReset(){ _lrDial.z = 0; lrDialDraw(); }
function lrDialAdd(d){
  const target = lrClamp(_lrDial.z + d, -6, 6);
  if (_lrDial.anim) cancelAnimationFrame(_lrDial.anim);
  const start = _lrDial.z, t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t-t0)/280);
    _lrDial.z = start + (target-start)*(1-Math.pow(1-k,3));
    lrDialDraw();
    if (k < 1) _lrDial.anim = requestAnimationFrame(step);
  };
  _lrDial.anim = requestAnimationFrame(step);
}
function lrDialDraw(){
  const c = lrCanvas('lr-dial-cv', 250);
  if (!c) return;
  const { ctx, W, H } = c;
  const cx = W/2, cy = H-34, R = Math.min(W/2-30, H-70);
  const p = lrSig(_lrDial.z);
  // arc track (semicircle)
  const a0 = Math.PI, a1 = 0;
  for (let i=0;i<=60;i++){
    const a = a0 + (a1-a0)*i/60;
    const frac = i/60;
    ctx.strokeStyle = lrMix(LRC.red, LRC.grn, frac);
    ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(cx,cy,R,a,a + (a1-a0)/60*1.15); ctx.stroke();
  }
  // 0.5 mark
  ctx.strokeStyle = LRC.text; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy-R-10); ctx.lineTo(cx, cy-R+18); ctx.stroke();
  ctx.fillStyle = LRC.muted; ctx.font = '10px IBM Plex Mono, monospace'; ctx.textAlign='center';
  ctx.fillText('0.5', cx, cy-R-16);
  ctx.textAlign='left'; ctx.fillText('NEG', cx-R-4, cy+16);
  ctx.textAlign='right'; ctx.fillText('POS', cx+R+4, cy+16);
  ctx.textAlign='start';
  // needle
  const na = a0 + (a1-a0)*p;
  ctx.strokeStyle = p>=0.5?LRC.grn:LRC.red; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(na)*(R-4), cy+Math.sin(na)*(R-4)); ctx.stroke();
  ctx.fillStyle = LRC.text; ctx.beginPath(); ctx.arc(cx,cy,6,0,7); ctx.fill();
  // readouts
  ctx.textAlign='center';
  ctx.fillStyle = LRC.pur; ctx.font = '700 22px IBM Plex Mono, monospace';
  ctx.fillText('P = '+p.toFixed(2), cx, cy-R/2);
  ctx.fillStyle = LRC.muted; ctx.font = '11px IBM Plex Mono, monospace';
  ctx.fillText('z = '+_lrDial.z.toFixed(2), cx, cy-R/2+18);
  ctx.textAlign='start';
}

// ───────────────────────────────────────────────────────────
// 4.3 — Decision boundary (2D)
// ───────────────────────────────────────────────────────────
let _lrBnd = { w1:1, w2:1, b:0, pts:[] };
function lrBndInit(){
  _lrBnd.w1=1; _lrBnd.w2=1; _lrBnd.b=0;
  if (!_lrBnd.pts.length){
    for(let i=0;i<16;i++) _lrBnd.pts.push({x:-1.3+Math.random()*1.4, y:-1.3+Math.random()*1.5, c:0});
    for(let i=0;i<16;i++) _lrBnd.pts.push({x:0.0+Math.random()*1.5, y:0.0+Math.random()*1.5, c:1});
  }
  const host = lrEl('lr-bnd');
  if (!host) return;
  host.innerHTML =
    '<canvas id="lr-bnd-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-grid3" style="margin-top:1rem">'+
      lrSlider('lr-bnd-w1','w\u2081 (x weight)',-3,3,0.1,1,LRC.red)+
      lrSlider('lr-bnd-w2','w\u2082 (y weight)',-3,3,0.1,1,LRC.acc)+
      lrSlider('lr-bnd-b','b (bias)',-3,3,0.1,0,LRC.pur)+
    '</div>'+
    '<div class="lr-note">The shaded field is the predicted probability. The weight vector (arrow) points perpendicular to the boundary, toward the positive side.</div>';
  ['w1','w2','b'].forEach(k=>{ const el=lrEl('lr-bnd-'+k); if(el) el.addEventListener('input',()=>lrBndUpd()); });
  lrBndDraw();
}
function lrSlider(id,label,min,max,step,val,col){
  return '<div><div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;margin-bottom:4px"><span>'+label+'</span><span id="'+id+'-v" style="color:'+col+'">'+(+val).toFixed(1)+'</span></div>'+
    '<input id="'+id+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'" style="width:100%;accent-color:'+col+'"></div>';
}
function lrBndUpd(){
  _lrBnd.w1=+lrEl('lr-bnd-w1').value; _lrBnd.w2=+lrEl('lr-bnd-w2').value; _lrBnd.b=+lrEl('lr-bnd-b').value;
  lrTxt('lr-bnd-w1-v',_lrBnd.w1.toFixed(1)); lrTxt('lr-bnd-w2-v',_lrBnd.w2.toFixed(1)); lrTxt('lr-bnd-b-v',_lrBnd.b.toFixed(1));
  lrBndDraw();
}
function lrBndDraw(){
  const c = lrCanvas('lr-bnd-cv', 340);
  if (!c) return;
  const { ctx, W, H } = c;
  const S = Math.min(W,H), ox=(W-S)/2;
  const mn=-2, mx=2.5;
  const sx = x => ox + (x-mn)/(mx-mn)*S;
  const sy = y => (mx-y)/(mx-mn)*S;
  // probability field
  const step = 10;
  for(let px=0;px<S;px+=step) for(let py=0;py<S;py+=step){
    const x = mn+(px/S)*(mx-mn), y = mx-(py/S)*(mx-mn);
    const z = _lrBnd.w1*x + _lrBnd.w2*y + _lrBnd.b;
    const p = lrSig(z);
    ctx.fillStyle = 'rgba('+Math.round(255-p*194)+','+Math.round(92+p*128)+','+Math.round(126+p*6)+',0.16)';
    ctx.fillRect(ox+px,py,step,step);
  }
  // boundary line w1 x + w2 y + b = 0
  ctx.strokeStyle = LRC.text; ctx.lineWidth = 2; ctx.beginPath();
  if (Math.abs(_lrBnd.w2) > 1e-4){
    const yA = -(_lrBnd.w1*mn + _lrBnd.b)/_lrBnd.w2, yB = -(_lrBnd.w1*mx + _lrBnd.b)/_lrBnd.w2;
    ctx.moveTo(sx(mn),sy(yA)); ctx.lineTo(sx(mx),sy(yB));
  } else {
    const xV = -_lrBnd.b/_lrBnd.w1; ctx.moveTo(sx(xV),sy(mn)); ctx.lineTo(sx(xV),sy(mx));
  }
  ctx.stroke();
  // weight vector arrow from origin
  const nrm = Math.hypot(_lrBnd.w1,_lrBnd.w2) || 1;
  const ax = _lrBnd.w1/nrm, ay = _lrBnd.w2/nrm;
  ctx.strokeStyle = LRC.pur; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(sx(0),sy(0)); ctx.lineTo(sx(ax),sy(ay)); ctx.stroke();
  const hx=sx(ax), hy=sy(ay), ang=Math.atan2(hy-sy(0),hx-sx(0));
  ctx.fillStyle = LRC.pur; ctx.beginPath();
  ctx.moveTo(hx,hy); ctx.lineTo(hx-9*Math.cos(ang-0.4),hy-9*Math.sin(ang-0.4)); ctx.lineTo(hx-9*Math.cos(ang+0.4),hy-9*Math.sin(ang+0.4)); ctx.closePath(); ctx.fill();
  // points
  _lrBnd.pts.forEach(pt=>{
    ctx.fillStyle = pt.c ? LRC.grn : LRC.red;
    ctx.beginPath(); ctx.arc(sx(pt.x),sy(pt.y),5,0,7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth=1; ctx.stroke();
  });
}

// ───────────────────────────────────────────────────────────
// 4.3.1 — The flagship review scorer
// ───────────────────────────────────────────────────────────
const LR_REVIEW = {
  // a deliberately mixed laptop review: complaints first, verdict second
  tokens: "The battery barely lasts a day , and the fan is loud enough to hear from the next room . No , this is not a quiet machine . But the keyboard is superb , the screen is gorgeous , and I have not missed my old laptop once . It won me over .".split(' '),
  posLex: ['superb','gorgeous','won'],
  negLex: ['barely','loud','no'],
  weights: { w1:2.1, w2:-2.6, w3:-0.9, w4:0.3, w5:1.6, w6:0.6, b:-0.2 },
  // feature values computed from the text above, not hand-entered
  feats: null
};
function lrReviewFeats(){
  const t = LR_REVIEW.tokens.map(w=>w.toLowerCase());
  let x1=0,x2=0,x4=0;
  t.forEach(w=>{
    if (LR_REVIEW.posLex.includes(w)) x1++;
    if (LR_REVIEW.negLex.includes(w)) x2++;
    if (['i','you','me','my','your','we'].includes(w)) x4++;
  });
  const x3 = t.includes('no') ? 1 : 0;
  const x5 = LR_REVIEW.tokens.join(' ').includes('!') ? 1 : 0;
  const x6 = +Math.log(t.length).toFixed(2);
  return { x1, x2, x3, x4, x5, x6 };
}
let _lrRev = { i:-1, anim:null, W:null };
function lrReviewInit(){
  LR_REVIEW.feats = lrReviewFeats();
  _lrRev = { i:-1, anim:null, W:Object.assign({}, LR_REVIEW.weights) };
  const host = lrEl('lr-review');
  if (!host) return;
  host.innerHTML =
    '<div id="lr-rev-text" style="font-size:.9rem;line-height:2;color:var(--muted);margin-bottom:1rem"></div>'+
    '<div class="lr-ctl" style="margin-bottom:1rem">'+
      '<button class="lr-btn solid" id="lr-rev-play" onclick="lrReviewPlay()">\u25b6 Scan the review</button>'+
      '<button class="lr-btn" onclick="lrReviewReset()">reset</button>'+
    '</div>'+
    '<div class="lr-grid2">'+
      '<div><div class="lr-card-t">Features &times; weights</div><div id="lr-rev-feats"></div></div>'+
      '<div><div class="lr-card-t">Score \u2192 probability</div><div id="lr-rev-score"></div></div>'+
    '</div>';
  lrReviewRenderText();
  lrReviewRenderFeats();
  lrReviewRenderScore();
}
function lrReviewRenderText(){
  const host = lrEl('lr-rev-text');
  if (!host) return;
  host.innerHTML = LR_REVIEW.tokens.map((w,i)=>{
    const lw = w.toLowerCase();
    let cls = 'lr-tok';
    if (i <= _lrRev.i) {
      if (LR_REVIEW.posLex.includes(lw)) cls += ' hit';
    }
    let style = '';
    if (i <= _lrRev.i){
      if (LR_REVIEW.posLex.includes(lw)) style='background:rgba(61,220,132,0.18);color:'+LRC.grn;
      else if (LR_REVIEW.negLex.includes(lw)) style='background:rgba(255,95,142,0.18);color:'+LRC.red;
      else if (['i','you','me','my','your','we'].includes(lw)) style='background:rgba(161,143,255,0.16);color:'+LRC.pur;
      else style='color:var(--text)';
    }
    return '<span class="lr-tok" style="'+style+'">'+w+'</span>';
  }).join(' ');
}
function lrReviewCountUpTo(i){
  const t = LR_REVIEW.tokens.map(w=>w.toLowerCase()).slice(0,i+1);
  let x1=0,x2=0,x4=0;
  t.forEach(w=>{
    if (LR_REVIEW.posLex.includes(w)) x1++;
    if (LR_REVIEW.negLex.includes(w)) x2++;
    if (['i','you','me','my','your','we'].includes(w)) x4++;
  });
  return {
    x1, x2,
    x3: t.includes('no') ? 1 : 0,
    x4,
    x5: LR_REVIEW.tokens.slice(0,i+1).join(' ').includes('!') ? 1 : 0,
    x6: LR_REVIEW.feats.x6
  };
}
function lrReviewRenderFeats(){
  const host = lrEl('lr-rev-feats');
  if (!host) return;
  const f = _lrRev.i < 0 ? {x1:0,x2:0,x3:0,x4:0,x5:0,x6:LR_REVIEW.feats.x6} : lrReviewCountUpTo(_lrRev.i);
  const W = _lrRev.W;
  const rows = [
    ['x\u2081 pos words', f.x1, W.w1, 'w1'],
    ['x\u2082 neg words', f.x2, W.w2, 'w2'],
    ['x\u2083 has \u201cno\u201d', f.x3, W.w3, 'w3'],
    ['x\u2084 pronouns', f.x4, W.w4, 'w4'],
    ['x\u2085 has \u201c!\u201d', f.x5, W.w5, 'w5'],
    ['x\u2086 log(len)', f.x6, W.w6, 'w6']
  ];
  host.innerHTML = '<table class="lr-table"><tr><th>feature</th><th>value</th><th>weight</th><th>contrib</th></tr>'+
    rows.map(([n,v,w,key])=>{
      const contrib = v*w;
      return '<tr><td>'+n+'</td><td style="color:var(--text)">'+(typeof v==='number'?(Number.isInteger(v)?v:v.toFixed(2)):v)+'</td>'+
        '<td><input type="range" min="-6" max="6" step="0.1" value="'+w+'" oninput="lrReviewW(\''+key+'\',this.value)" style="width:64px;accent-color:'+(w>=0?LRC.grn:LRC.red)+';vertical-align:middle"> <span style="color:'+(w>=0?LRC.grn:LRC.red)+'">'+(w>=0?'+':'')+w.toFixed(1)+'</span></td>'+
        '<td style="color:'+(contrib>=0?LRC.grn:LRC.red)+'">'+(contrib>=0?'+':'')+contrib.toFixed(2)+'</td></tr>';
    }).join('')+'</table>';
}
function lrReviewW(k,v){ _lrRev.W[k]=parseFloat(v); lrReviewRenderFeats(); lrReviewRenderScore(); }
function lrReviewRenderScore(){
  const host = lrEl('lr-rev-score');
  if (!host) return;
  const f = _lrRev.i < 0 ? {x1:0,x2:0,x3:0,x4:0,x5:0,x6:0} : lrReviewCountUpTo(_lrRev.i);
  const W = _lrRev.W;
  const z = f.x1*W.w1 + f.x2*W.w2 + f.x3*W.w3 + f.x4*W.w4 + f.x5*W.w5 + f.x6*W.w6 + W.b;
  const p = lrSig(z);
  host.innerHTML =
    '<div style="font-family:var(--mono);font-size:.8rem;color:var(--text);line-height:1.8">z = '+z.toFixed(3)+'</div>'+
    '<div style="font-family:var(--mono);font-size:.8rem;color:var(--muted);margin:.3rem 0 .8rem">\u03c3('+z.toFixed(2)+') = '+p.toFixed(2)+'</div>'+
    '<div style="height:26px;background:var(--surface3);border-radius:6px;overflow:hidden;position:relative">'+
      '<div style="height:100%;width:'+(p*100).toFixed(0)+'%;background:'+(p>=0.5?'rgba(61,220,132,0.5)':'rgba(255,95,142,0.5)')+';transition:width .3s"></div>'+
      '<div style="position:absolute;left:50%;top:0;bottom:0;width:2px;background:var(--text);opacity:.4"></div>'+
    '</div>'+
    '<div style="margin-top:.7rem;font-family:var(--mono);font-size:.9rem;font-weight:700;color:'+(p>=0.5?LRC.grn:LRC.red)+'">'+(p>=0.5?'POSITIVE':'NEGATIVE')+' \u00b7 '+(p*100).toFixed(0)+'% confident</div>';
}
function lrReviewReset(){
  if (_lrRev.anim) clearInterval(_lrRev.anim);
  _lrRev.i = -1;
  lrReviewRenderText(); lrReviewRenderFeats(); lrReviewRenderScore();
  const b = lrEl('lr-rev-play'); if (b) b.textContent = '\u25b6 Scan the review';
}
function lrReviewPlay(){
  if (_lrRev.anim){ clearInterval(_lrRev.anim); _lrRev.anim=null; const b=lrEl('lr-rev-play'); if(b)b.textContent='\u25b6 Resume'; return; }
  if (_lrRev.i >= LR_REVIEW.tokens.length-1) _lrRev.i = -1;
  const b = lrEl('lr-rev-play'); if (b) b.textContent = '\u2759\u2759 Pause';
  _lrRev.anim = lrTimer(()=>{
    _lrRev.i++;
    lrReviewRenderText(); lrReviewRenderFeats(); lrReviewRenderScore();
    if (_lrRev.i >= LR_REVIEW.tokens.length-1){ clearInterval(_lrRev.anim); _lrRev.anim=null; const bb=lrEl('lr-rev-play'); if(bb)bb.textContent='\u21ba Replay'; }
  }, 130);
}

// ───────────────────────────────────────────────────────────
// 4.3.2 — EOS detection sandbox
// ───────────────────────────────────────────────────────────
let _lrEos = { text:'Prof. Smith left at 3 p.m. She waved.', feats:{lower:true,abbr:true,st:true,cap:true} };
function lrEosInit(){
  const host = lrEl('lr-eos');
  if (!host) return;
  host.innerHTML =
    '<input id="lr-eos-in" value="'+_lrEos.text+'" oninput="lrEosSet(this.value)" style="width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.6rem .8rem;font-family:var(--mono);font-size:.82rem;color:var(--text);outline:none;box-sizing:border-box;margin-bottom:1rem">'+
    '<div class="lr-ctl" style="margin-bottom:1rem">'+
      lrToggle('lower','lowercase-before')+lrToggle('abbr','in-abbrev-dict')+lrToggle('st','St.-rule')+lrToggle('cap','capital-after')+
    '</div>'+
    '<div id="lr-eos-out"></div>'+
    '<div class="lr-note">Each period is judged end-of-sentence (green) or not (grey). Turn off <em>in-abbrev-dict</em> and watch <em>Prof.</em> and <em>p.m.</em> get wrongly cut.</div>';
  lrEosRender();
}
function lrToggle(k,label){
  const on = _lrEos.feats[k];
  return '<button class="lr-btn '+(on?'on':'')+'" onclick="lrEosToggle(\''+k+'\')">'+label+'</button>';
}
function lrEosSet(v){ _lrEos.text=v; lrEosRender(); }
function lrEosToggle(k){ _lrEos.feats[k]=!_lrEos.feats[k]; lrEosInit(); }
function lrEosRender(){
  const host = lrEl('lr-eos-out');
  if (!host) return;
  const abbrevs = ['prof.','dr.','mr.','mrs.','ms.','p.m.','a.m.','st.','inc.','vs.','e.g.','i.e.'];
  const words = _lrEos.text.split(/\s+/);
  const out = words.map((w,i)=>{
    if (!/[.!?]$/.test(w)) return '<span style="color:var(--text)">'+w+'</span>';
    const lw = w.toLowerCase();
    const next = words[i+1] || '';
    // decide EOS
    let eos = true;
    if (_lrEos.feats.abbr && abbrevs.includes(lw)) eos = false;
    if (_lrEos.feats.st && lw==='st.') eos = false;
    if (_lrEos.feats.cap && next && !/^[A-Z]/.test(next)) eos = false;
    if (_lrEos.feats.lower && abbrevs.includes(lw)) eos = false;
    const col = eos ? LRC.grn : LRC.muted;
    const tag = eos ? 'EOS' : 'not';
    return '<span style="display:inline-block;padding:.1rem .35rem;border-radius:5px;background:'+(eos?'rgba(61,220,132,0.16)':'var(--surface3)')+';color:'+col+'">'+w+'<sub style="font-size:.6em;opacity:.8"> '+tag+'</sub></span>';
  }).join(' ');
  host.innerHTML = '<div style="font-family:var(--mono);font-size:.86rem;line-height:2.2">'+out+'</div>';
}

// ───────────────────────────────────────────────────────────
// 4.3.3 — Loop vs matrix race
// ───────────────────────────────────────────────────────────
let _lrVec = { anim:null };
function lrVectorInit(){
  const host = lrEl('lr-vector');
  if (!host) return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem"><button class="lr-btn solid" onclick="lrVectorRace()">\u25b6 Race them</button><span class="lr-note" style="margin:0">6 documents, 4 features each.</span></div>'+
    '<div class="lr-grid2">'+
      '<div class="lr-card"><div class="lr-card-t">for-loop \u2014 one row at a time</div><div id="lr-vec-loop" style="margin-top:.6rem"></div><div id="lr-vec-loop-t" style="font-family:var(--mono);font-size:.72rem;color:'+LRC.amb+';margin-top:.5rem">idle</div></div>'+
      '<div class="lr-card"><div class="lr-card-t">matrix multiply \u2014 all rows at once</div><div id="lr-vec-mat" style="margin-top:.6rem"></div><div id="lr-vec-mat-t" style="font-family:var(--mono);font-size:.72rem;color:'+LRC.acc+';margin-top:.5rem">idle</div></div>'+
    '</div>'+
    '<div class="lr-note">[m\u00d7f]\u00b7[f\u00d71] \u2192 [m\u00d71]. The arithmetic is identical; the matrix form lets the hardware do every row in parallel.</div>';
  lrVecRows('lr-vec-loop', -1); lrVecRows('lr-vec-mat', -1);
}
function lrVecRows(id, active){
  const host = lrEl(id);
  if (!host) return;
  let h='';
  for(let i=0;i<6;i++){
    const on = (id.includes('mat')) ? (active>=0) : (i===active);
    const done = (id.includes('mat')) ? false : (i<active);
    const col = on ? LRC.acc : done ? LRC.grn : LRC.s3;
    h += '<div style="height:12px;border-radius:3px;background:'+col+';margin-bottom:4px;opacity:'+(on||done?1:.5)+';transition:all .1s"></div>';
  }
  host.innerHTML = h;
}
function lrVectorRace(){
  if (_lrVec.anim) clearInterval(_lrVec.anim);
  let i=0; const t0=performance.now();
  lrVecRows('lr-vec-mat', 1);
  lrTxt('lr-vec-mat-t', 'done in 1 tick');
  lrTxt('lr-vec-loop-t','running...');
  _lrVec.anim = lrTimer(()=>{
    lrVecRows('lr-vec-loop', i);
    if (i>=6){ clearInterval(_lrVec.anim); _lrVec.anim=null; lrTxt('lr-vec-loop-t','done in 6 ticks \u2014 6\u00d7 slower'); return; }
    i++;
  }, 240);
}


// ───────────────────────────────────────────────────────────
// 4.4 — Training loop gauge
// ───────────────────────────────────────────────────────────
let _lrLoop = { yhat:0.1, y:1, anim:null, phase:0, iter:0 };
function lrLoopInit(){
  _lrLoop = { yhat:0.12, y:1, anim:null, phase:0, iter:0 };
  const host = lrEl('lr-loop');
  if (!host) return;
  host.innerHTML =
    '<canvas id="lr-loop-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center">'+
      '<button class="lr-btn solid" id="lr-loop-play" onclick="lrLoopPlay()">\u25b6 Run the loop</button>'+
      '<button class="lr-btn" onclick="lrLoopStep()">step once</button>'+
      '<button class="lr-btn" onclick="lrLoopReset()">reset</button>'+
    '</div>'+
    '<div class="lr-note" style="text-align:center">The four stages light in turn. The error bar on the right is what drives the nudge, and it shrinks itself to nothing.</div>';
  lrLoopDraw();
}
function lrLoopReset(){ if(_lrLoop.anim){clearInterval(_lrLoop.anim);_lrLoop.anim=null;} _lrLoop.yhat=0.12; _lrLoop.iter=0; _lrLoop.phase=0; lrLoopDraw(); const b=lrEl('lr-loop-play'); if(b)b.textContent='\u25b6 Run the loop'; }
function lrLoopStep(){
  _lrLoop.phase = (_lrLoop.phase+1)%4;
  if (_lrLoop.phase===0){ const err=_lrLoop.y-_lrLoop.yhat; _lrLoop.yhat += err*0.28; _lrLoop.iter++; }
  lrLoopDraw();
}
function lrLoopPlay(){
  if (_lrLoop.anim){ clearInterval(_lrLoop.anim); _lrLoop.anim=null; const b=lrEl('lr-loop-play'); if(b)b.textContent='\u25b6 Resume'; return; }
  const b=lrEl('lr-loop-play'); if(b)b.textContent='\u2759\u2759 Pause';
  _lrLoop.anim = lrTimer(()=>{
    lrLoopStep();
    if (Math.abs(_lrLoop.y-_lrLoop.yhat)<0.01){ clearInterval(_lrLoop.anim); _lrLoop.anim=null; const bb=lrEl('lr-loop-play'); if(bb)bb.textContent='\u21ba Replay'; }
  }, 420);
}
function lrLoopDraw(){
  const c = lrCanvas('lr-loop-cv', 260);
  if (!c) return;
  const { ctx, W, H } = c;
  const stages = [
    {n:'Predict', c:LRC.acc}, {n:'Measure', c:LRC.red}, {n:'Nudge', c:LRC.grn}, {n:'Repeat', c:LRC.pur}
  ];
  const cx=W*0.36, cy=H/2, R=Math.min(W*0.28,H*0.36);
  // ring of 4 nodes
  stages.forEach((s,i)=>{
    const a = -Math.PI/2 + i*Math.PI/2;
    const x=cx+Math.cos(a)*R, y=cy+Math.sin(a)*R;
    const on = i===_lrLoop.phase;
    // arrow to next
    const a2=-Math.PI/2+((i+1)%4)*Math.PI/2;
    ctx.strokeStyle='rgba(134,144,137,0.35)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(cx,cy,R,a+0.35,a2-0.35); ctx.stroke();
    ctx.fillStyle = on ? s.c : LRC.s2;
    ctx.beginPath(); ctx.arc(x,y,on?24:19,0,7); ctx.fill();
    ctx.strokeStyle = on ? '#fff' : LRC.border2 || 'rgba(214,226,255,0.25)'; ctx.lineWidth=on?2:1; ctx.stroke();
    ctx.fillStyle = on ? '#070B18' : LRC.muted; ctx.font = (on?'700 ':'')+'11px IBM Plex Mono, monospace'; ctx.textAlign='center';
    ctx.fillText(s.n, x, y+4);
  });
  ctx.textAlign='start';
  // prediction gauge + error bar on right
  const gx=W*0.74, gy0=H*0.2, gy1=H*0.8, gw=26;
  ctx.fillStyle=LRC.s3; ctx.fillRect(gx,gy0,gw,gy1-gy0);
  const py = gy1 - _lrLoop.yhat*(gy1-gy0);
  // true label line
  const ty = gy1 - _lrLoop.y*(gy1-gy0);
  ctx.strokeStyle=LRC.grn; ctx.lineWidth=2; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(gx-8,ty); ctx.lineTo(gx+gw+8,ty); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle=LRC.acc; ctx.fillRect(gx,py,gw,gy1-py);
  // error bracket
  const ex = gx+gw+22;
  ctx.strokeStyle=LRC.red; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(ex,py); ctx.lineTo(ex,ty); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ex-4,py); ctx.lineTo(ex+4,py); ctx.moveTo(ex-4,ty); ctx.lineTo(ex+4,ty); ctx.stroke();
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace';
  ctx.fillText('\u0177='+_lrLoop.yhat.toFixed(2), gx-4, gy1+16);
  ctx.fillStyle=LRC.grn; ctx.fillText('y='+_lrLoop.y, gx+gw+4, ty-6);
  ctx.fillStyle=LRC.red; ctx.fillText('err='+(_lrLoop.y-_lrLoop.yhat).toFixed(2), ex+7, (py+ty)/2);
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace';
  ctx.fillText('iteration '+_lrLoop.iter, W*0.68, H*0.12);
}

// ───────────────────────────────────────────────────────────
// 4.5 — Penalty meter
// ───────────────────────────────────────────────────────────
let _lrLoss = { p:0.5, y:1 };
function lrLossInit(){
  _lrLoss = { p:0.5, y:1 };
  const host = lrEl('lr-loss');
  if (!host) return;
  host.innerHTML =
    '<canvas id="lr-loss-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem">'+
      '<button class="lr-btn '+(_lrLoss.y===1?'on':'')+'" id="lr-loss-y1" onclick="lrLossY(1)">true label = 1</button>'+
      '<button class="lr-btn '+(_lrLoss.y===0?'on':'')+'" id="lr-loss-y0" onclick="lrLossY(0)">true label = 0</button>'+
      '<div class="lr-sl" style="margin-left:auto">predicted \u0177 <input id="lr-loss-p" type="range" min="0.01" max="0.99" step="0.01" value="0.5" oninput="lrLossDrive(this.value)"><b id="lr-loss-pv">0.50</b></div>'+
    '</div>'+
    '<div class="lr-readout" style="margin-top:.85rem">'+
      '<span class="lr-stat"><span class="lr-stat-k">Loss \u2212log</span><span class="lr-stat-v" id="lr-loss-v" style="color:'+LRC.red+'">0.69</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">Good guess</span><span class="lr-stat-v" style="color:'+LRC.grn+'">0.36</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">Confused</span><span class="lr-stat-v" style="color:'+LRC.amb+'">1.20</span></span>'+
    '</div>'+
    '<div class="lr-note">Drag \u0177 confidently toward the wrong answer and the penalty rockets toward infinity.</div>';
  lrLossDraw();
}
function lrLossY(y){ _lrLoss.y=y; lrEl('lr-loss-y1').classList.toggle('on',y===1); lrEl('lr-loss-y0').classList.toggle('on',y===0); lrLossDraw(); }
function lrLossDrive(v){ _lrLoss.p=parseFloat(v); lrTxt('lr-loss-pv',_lrLoss.p.toFixed(2)); lrLossDraw(); }
function lrLossDraw(){
  const c = lrCanvas('lr-loss-cv', 280);
  if (!c) return;
  const { ctx, W, H } = c;
  const pad=42, x0=pad, x1=W-14, y0=H-28, y1=14;
  const Lmax=4.7;
  const xm = p => x0 + p*(x1-x0);
  const ym = L => y0 - Math.min(L,Lmax)/Lmax*(y0-y1);
  ctx.strokeStyle=LRC.grid; ctx.lineWidth=1;
  [0,1,2,3,4].forEach(L=>{ ctx.beginPath(); ctx.moveTo(x0,ym(L)); ctx.lineTo(x1,ym(L)); ctx.stroke(); ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText(L.toFixed(0),8,ym(L)+3); });
  // curve L = -log(p) if y=1 else -log(1-p)
  ctx.strokeStyle=LRC.red; ctx.lineWidth=2.5; ctx.beginPath();
  let first=true;
  for(let px=x0;px<=x1;px++){ const p=(px-x0)/(x1-x0); const pp=lrClamp(p,0.001,0.999); const L=_lrLoss.y===1?-Math.log(pp):-Math.log(1-pp); if(L>Lmax){first=true;continue;} if(first){ctx.moveTo(px,ym(L));first=false;}else ctx.lineTo(px,ym(L)); }
  ctx.stroke();
  // landmarks 0.36 and 1.20
  [[0.36,LRC.grn],[1.20,LRC.amb]].forEach(([L,col])=>{
    const pMark = _lrLoss.y===1 ? Math.exp(-L) : 1-Math.exp(-L);
    ctx.fillStyle=col; ctx.beginPath(); ctx.arc(xm(pMark),ym(L),4,0,7); ctx.fill();
  });
  // current point
  const p=_lrLoss.p, L=_lrLoss.y===1?-Math.log(p):-Math.log(1-p);
  lrTxt('lr-loss-v', L.toFixed(2));
  ctx.strokeStyle='rgba(255,95,142,0.4)'; ctx.setLineDash([4,4]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(xm(p),y0); ctx.lineTo(xm(p),ym(Math.min(L,Lmax))); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle=LRC.red; ctx.beginPath(); ctx.arc(xm(p),ym(Math.min(L,Lmax)),6,0,7); ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='center';
  ctx.fillText('\u0177',x1-4,y0+15); ctx.fillText('0',x0,y0+15); ctx.fillText('1',x1-14,y0+15);
  ctx.textAlign='start';
}

// ───────────────────────────────────────────────────────────
// 4.6 — 2D loss canyon (kept + improved)
// ───────────────────────────────────────────────────────────
let _lrCan = { w:2.4, b:1.6, lr:0.25, path:[], anim:null };
const canOpt = { w:0, b:0 };
function canLoss(w,b){ return 0.5*((w-canOpt.w)**2 + 1.4*(b-canOpt.b)**2); }
function canGrad(w,b){ return [ (w-canOpt.w), 1.4*(b-canOpt.b) ]; }
function lrCanyonInit(){
  _lrCan = { w:(Math.random()-0.5)*4.5, b:(Math.random()-0.5)*4.5, lr:0.25, path:[], anim:null };
  _lrCan.path=[[_lrCan.w,_lrCan.b]];
  const host = lrEl('lr-canyon');
  if (!host) return;
  host.innerHTML =
    '<canvas id="lr-can-cv" style="width:100%;display:block;cursor:crosshair;touch-action:none"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem">'+
      '<button class="lr-btn solid" id="lr-can-play" onclick="lrCanPlay()">\u25b6 Descend</button>'+
      '<button class="lr-btn" onclick="lrCanStep()">step</button>'+
      '<button class="lr-btn" onclick="lrCanNew()">new start</button>'+
      '<div class="lr-sl" style="margin-left:auto">learning rate <input id="lr-can-lr" type="range" min="0.02" max="1.05" step="0.01" value="0.25" oninput="lrCanLr(this.value)"><b id="lr-can-lrv">0.25</b></div>'+
    '</div>'+
    '<div class="lr-readout" style="margin-top:.6rem">'+
      '<span class="lr-stat"><span class="lr-stat-k">step</span><span class="lr-stat-v" id="lr-can-step">0</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">loss</span><span class="lr-stat-v" id="lr-can-loss" style="color:'+LRC.red+'">\u2014</span></span>'+
    '</div>'+
    '<div class="lr-note">Click the canyon to drop the ball anywhere. Set the rate above ~1.0 and watch it overshoot the walls.</div>';
  const cv = lrEl('lr-can-cv');
  cv.addEventListener('click', e=>{
    const r=cv.getBoundingClientRect(); const S=Math.min(r.width,r.height); const ox=(r.width-S)/2;
    const mx=(e.clientX-r.left-ox)/S, my=(e.clientY-r.top)/S;
    _lrCan.w = -3+mx*6; _lrCan.b = 3-my*6; _lrCan.path=[[_lrCan.w,_lrCan.b]]; _lrCan.step=0;
    lrCanDraw();
  });
  lrCanNew();
}
function lrCanNew(){ if(_lrCan.anim){clearInterval(_lrCan.anim);_lrCan.anim=null;} _lrCan.w=(Math.random()-0.5)*5; _lrCan.b=(Math.random()-0.5)*5; _lrCan.path=[[_lrCan.w,_lrCan.b]]; _lrCan.step=0; lrTxt('lr-can-step','0'); lrCanDraw(); }
function lrCanLr(v){ _lrCan.lr=parseFloat(v); lrTxt('lr-can-lrv',_lrCan.lr.toFixed(2)); }
function lrCanStep(){
  const g=canGrad(_lrCan.w,_lrCan.b);
  _lrCan.w -= _lrCan.lr*g[0]; _lrCan.b -= _lrCan.lr*g[1];
  _lrCan.w=lrClamp(_lrCan.w,-6,6); _lrCan.b=lrClamp(_lrCan.b,-6,6);
  _lrCan.path.push([_lrCan.w,_lrCan.b]); if(_lrCan.path.length>120)_lrCan.path.shift();
  _lrCan.step=(_lrCan.step||0)+1; lrTxt('lr-can-step',_lrCan.step);
  lrCanDraw();
}
function lrCanPlay(){
  if(_lrCan.anim){clearInterval(_lrCan.anim);_lrCan.anim=null;const b=lrEl('lr-can-play');if(b)b.textContent='\u25b6 Descend';return;}
  const b=lrEl('lr-can-play'); if(b)b.textContent='\u2759\u2759 Pause';
  _lrCan.anim=lrTimer(()=>{ lrCanStep(); if(canLoss(_lrCan.w,_lrCan.b)<0.0004||_lrCan.step>200){clearInterval(_lrCan.anim);_lrCan.anim=null;const bb=lrEl('lr-can-play');if(bb)bb.textContent='\u21ba Again';} },140);
}
function lrCanDraw(){
  const c = lrCanvas('lr-can-cv', 340);
  if (!c) return;
  const { ctx, W, H } = c;
  const S=Math.min(W,H), ox=(W-S)/2;
  const sx=w=>ox+(w+3)/6*S, sy=b=>(3-b)/6*S;
  // contour fill
  const step=8;
  for(let px=0;px<S;px+=step) for(let py=0;py<S;py+=step){
    const w=-3+(px/S)*6, b=3-(py/S)*6; const L=canLoss(w,b); const t=Math.min(1,L/9);
    ctx.fillStyle='rgba('+Math.round(19+t*210)+','+Math.round(28+t*30)+','+Math.round(32+t*94)+',0.9)';
    ctx.fillRect(ox+px,py,step,step);
  }
  // contour rings
  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;
  for(let lvl=0.4;lvl<9;lvl*=1.8){
    ctx.beginPath();
    for(let a=0;a<=64;a++){ const th=a/64*7; const rw=Math.sqrt(2*lvl), rb=Math.sqrt(2*lvl/1.4); const w=Math.cos(th)*rw, b=Math.sin(th)*rb; if(a===0)ctx.moveTo(sx(w),sy(b)); else ctx.lineTo(sx(w),sy(b)); }
    ctx.stroke();
  }
  // minimum
  ctx.fillStyle=LRC.grn; ctx.beginPath(); ctx.arc(sx(0),sy(0),4,0,7); ctx.fill();
  // path
  if(_lrCan.path.length>1){
    ctx.strokeStyle=LRC.acc; ctx.lineWidth=2; ctx.beginPath();
    _lrCan.path.forEach((p,i)=>{ if(i===0)ctx.moveTo(sx(p[0]),sy(p[1])); else ctx.lineTo(sx(p[0]),sy(p[1])); });
    ctx.stroke();
    _lrCan.path.forEach(p=>{ ctx.fillStyle='rgba(77,227,255,0.5)'; ctx.beginPath(); ctx.arc(sx(p[0]),sy(p[1]),2,0,7); ctx.fill(); });
  }
  // ball
  ctx.fillStyle=LRC.red; ctx.beginPath(); ctx.arc(sx(_lrCan.w),sy(_lrCan.b),7,0,7); ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
  lrTxt('lr-can-loss', canLoss(_lrCan.w,_lrCan.b).toFixed(3));
}

// ───────────────────────────────────────────────────────────
// 4.6.1 — Three-part update
// ───────────────────────────────────────────────────────────
let _lrUpd = { yhat:0.2, y:1, x:1.5, anim:null };
function lrUpdateInit(){
  _lrUpd = { yhat:0.2, y:1, x:1.5, anim:null };
  const host = lrEl('lr-update');
  if (!host) return;
  host.innerHTML =
    '<canvas id="lr-upd-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem">'+
      '<button class="lr-btn solid" id="lr-upd-play" onclick="lrUpdPlay()">\u25b6 Train to convergence</button>'+
      '<button class="lr-btn" onclick="lrUpdStep()">one step</button>'+
      '<button class="lr-btn" onclick="lrUpdReset()">reset</button>'+
      '<div class="lr-sl" style="margin-left:auto">feature x <input id="lr-upd-x" type="range" min="0.2" max="3" step="0.1" value="1.5" oninput="lrUpdX(this.value)"><b id="lr-upd-xv">1.5</b></div>'+
    '</div>'+
    '<div class="lr-note">nudge = (\u0177 \u2212 y) \u00d7 x. As the error shrinks, the nudge fades to zero on its own.</div>';
  lrUpdDraw();
}
function lrUpdReset(){ if(_lrUpd.anim){clearInterval(_lrUpd.anim);_lrUpd.anim=null;} _lrUpd.yhat=0.2; lrUpdDraw(); const b=lrEl('lr-upd-play'); if(b)b.textContent='\u25b6 Train to convergence'; }
function lrUpdX(v){ _lrUpd.x=parseFloat(v); lrTxt('lr-upd-xv',_lrUpd.x.toFixed(1)); lrUpdDraw(); }
function lrUpdStep(){ const err=_lrUpd.yhat-_lrUpd.y; _lrUpd.yhat -= 0.32*err; lrUpdDraw(); }
function lrUpdPlay(){
  if(_lrUpd.anim){clearInterval(_lrUpd.anim);_lrUpd.anim=null;const b=lrEl('lr-upd-play');if(b)b.textContent='\u25b6 Resume';return;}
  const b=lrEl('lr-upd-play'); if(b)b.textContent='\u2759\u2759 Pause';
  _lrUpd.anim=lrTimer(()=>{ lrUpdStep(); if(Math.abs(_lrUpd.yhat-_lrUpd.y)<0.008){clearInterval(_lrUpd.anim);_lrUpd.anim=null;const bb=lrEl('lr-upd-play');if(bb)bb.textContent='\u21ba Replay';} },380);
}
function lrUpdDraw(){
  const c = lrCanvas('lr-upd-cv', 200);
  if (!c) return;
  const { ctx, W, H } = c;
  const err = _lrUpd.yhat-_lrUpd.y, nudge = err*_lrUpd.x;
  const bars = [
    { n:'error (\u0177\u2212y)', v:err, max:1, col:LRC.red },
    { n:'feature x', v:_lrUpd.x, max:3, col:LRC.pur },
    { n:'nudge = product', v:nudge, max:3, col:LRC.acc }
  ];
  const bw=W/3, mid=H*0.52;
  bars.forEach((bar,i)=>{
    const cx=bw*i+bw/2;
    ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='center';
    ctx.fillText(bar.n,cx,H-8);
    const hgt=Math.abs(bar.v)/bar.max*(H*0.32);
    ctx.fillStyle=bar.col;
    if(bar.v>=0) ctx.fillRect(cx-22,mid-hgt,44,hgt); else ctx.fillRect(cx-22,mid,44,hgt);
    ctx.fillStyle=LRC.text; ctx.font='700 13px IBM Plex Mono, monospace';
    ctx.fillText(bar.v.toFixed(2),cx,bar.v>=0?mid-hgt-6:mid+hgt+16);
  });
  ctx.strokeStyle=LRC.grid; ctx.beginPath(); ctx.moveTo(0,mid); ctx.lineTo(W,mid); ctx.stroke();
  ctx.textAlign='start';
}

// ───────────────────────────────────────────────────────────
// 4.6.2 — SGD line by line
// ───────────────────────────────────────────────────────────
const SGD_CODE = [
  'for epoch in range(E):',
  '  shuffle(training_data)',
  '  for (x, y) in training_data:',
  '    \u0177 = \u03c3(w\u00b7x + b)',
  '    error = \u0177 \u2212 y',
  '    w \u2190 w \u2212 \u03b7 \u00b7 error \u00b7 x',
  '    b \u2190 b \u2212 \u03b7 \u00b7 error'
];
let _lrSgd = { line:0, w:2.3, b:2.0, path:[], anim:null, di:0 };
const SGD_DATA = [];
function lrSgdInit(){
  if (!SGD_DATA.length) for(let i=0;i<24;i++) SGD_DATA.push([ (Math.random()-0.5)*1.2, (Math.random()-0.5)*1.2 ]);
  _lrSgd = { line:0, w:2.3, b:2.0, path:[[2.3,2.0]], anim:null, di:0 };
  const host = lrEl('lr-sgd');
  if (!host) return;
  host.innerHTML =
    '<div class="lr-grid2">'+
      '<div class="lr-card"><div id="lr-sgd-code" style="font-family:var(--mono);font-size:.76rem;line-height:1.9"></div></div>'+
      '<div><canvas id="lr-sgd-cv" style="width:100%;display:block"></canvas></div>'+
    '</div>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><button class="lr-btn solid" id="lr-sgd-play" onclick="lrSgdPlay()">\u25b6 Run SGD</button><button class="lr-btn" onclick="lrSgdReset()">reset</button></div>'+
    '<div class="lr-note" style="text-align:center">One example per update. The path zigzags because a single point is a noisy estimate of the whole.</div>';
  lrSgdRenderCode(); lrSgdDraw();
}
function lrSgdReset(){ if(_lrSgd.anim){clearInterval(_lrSgd.anim);_lrSgd.anim=null;} _lrSgd.w=2.3;_lrSgd.b=2.0;_lrSgd.path=[[2.3,2.0]];_lrSgd.line=0;_lrSgd.di=0; lrSgdRenderCode(); lrSgdDraw(); const b=lrEl('lr-sgd-play');if(b)b.textContent='\u25b6 Run SGD'; }
function lrSgdRenderCode(){
  const host=lrEl('lr-sgd-code'); if(!host)return;
  host.innerHTML=SGD_CODE.map((l,i)=>{
    const on=i===_lrSgd.line;
    return '<div style="padding:.05rem .3rem;border-radius:4px;white-space:pre;background:'+(on?'rgba(77,227,255,0.14)':'transparent')+';color:'+(on?LRC.acc:LRC.muted)+'">'+l.replace(/</g,'&lt;')+'</div>';
  }).join('');
}
function lrSgdPlay(){
  if(_lrSgd.anim){clearInterval(_lrSgd.anim);_lrSgd.anim=null;const b=lrEl('lr-sgd-play');if(b)b.textContent='\u25b6 Resume';return;}
  const b=lrEl('lr-sgd-play'); if(b)b.textContent='\u2759\u2759 Pause';
  _lrSgd.anim=lrTimer(()=>{
    _lrSgd.line=(_lrSgd.line+1)%SGD_CODE.length;
    if(_lrSgd.line>=3){ // an update happens across the compute lines
      const d=SGD_DATA[_lrSgd.di%SGD_DATA.length];
      const gw=(_lrSgd.w)-d[0], gb=(_lrSgd.b)-d[1];
      _lrSgd.w-=0.18*gw + (Math.random()-0.5)*0.15;
      _lrSgd.b-=0.18*gb + (Math.random()-0.5)*0.15;
      _lrSgd.path.push([_lrSgd.w,_lrSgd.b]); if(_lrSgd.path.length>60)_lrSgd.path.shift();
      _lrSgd.di++;
    }
    lrSgdRenderCode(); lrSgdDraw();
  }, 260);
}
function lrSgdDraw(){
  const c=lrCanvas('lr-sgd-cv',220); if(!c)return;
  const {ctx,W,H}=c; const S=Math.min(W,H),ox=(W-S)/2;
  const sx=w=>ox+(w+3)/6*S, sy=b=>(3-b)/6*S;
  const step=10;
  for(let px=0;px<S;px+=step)for(let py=0;py<S;py+=step){ const w=-3+(px/S)*6,b=3-(py/S)*6; const L=0.5*(w*w+b*b); const t=Math.min(1,L/6); ctx.fillStyle='rgba('+Math.round(19+t*210)+','+Math.round(28+t*30)+','+Math.round(32+t*94)+',0.9)'; ctx.fillRect(ox+px,py,step,step); }
  ctx.fillStyle=LRC.grn; ctx.beginPath(); ctx.arc(sx(0),sy(0),4,0,7); ctx.fill();
  if(_lrSgd.path.length>1){ ctx.strokeStyle=LRC.acc; ctx.lineWidth=1.6; ctx.beginPath(); _lrSgd.path.forEach((p,i)=>{i===0?ctx.moveTo(sx(p[0]),sy(p[1])):ctx.lineTo(sx(p[0]),sy(p[1]));}); ctx.stroke(); }
  ctx.fillStyle=LRC.red; ctx.beginPath(); ctx.arc(sx(_lrSgd.w),sy(_lrSgd.b),6,0,7); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
}

// ───────────────────────────────────────────────────────────
// 4.6.3 — Worked gradient step by hand
// ───────────────────────────────────────────────────────────
const BYHAND = [
  { t:'Start: \u03b8 = [b, w\u2081, w\u2082] = [0, 0, 0], x = [1, 3, 2], y = 1, \u03b7 = 0.1', hl:null },
  { t:'z = 0\u00b71 + 0\u00b73 + 0\u00b72 = 0', hl:'z' },
  { t:'\u0177 = \u03c3(0) = 0.5', hl:'yhat' },
  { t:'error = \u0177 \u2212 y = 0.5 \u2212 1 = \u22120.5', hl:'err' },
  { t:'gradient = error \u00b7 x = \u22120.5 \u00b7 [1, 3, 2] = [\u22120.5, \u22121.5, \u22121.0]', hl:'grad' },
  { t:'\u03b8 \u2190 \u03b8 \u2212 \u03b7 \u00b7 gradient = [0,0,0] \u2212 0.1\u00b7[\u22120.5,\u22121.5,\u22121.0]', hl:'upd' },
  { t:'\u03b8 = [0.05, 0.15, 0.10]', hl:'final' }
];
let _lrBy = { step:0 };
function lrByhandInit(){
  _lrBy = { step:0 };
  const host = lrEl('lr-byhand');
  if (!host) return;
  host.innerHTML =
    '<div id="lr-by-lines" style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:1rem"></div>'+
    '<div class="lr-ctl" style="justify-content:center"><button class="lr-btn" onclick="lrByStep(-1)">\u2190 back</button><button class="lr-btn solid" onclick="lrByStep(1)">next step \u2192</button><button class="lr-btn" onclick="lrByReset()">reset</button></div>'+
    '<div class="lr-note" style="text-align:center">Note the final \u03b8=[0.05,0.15,0.10]; textbook conventions that fold the bias differently land at [0.15,0.10,0.05]. Same arithmetic, different ordering.</div>';
  lrByRender();
}
function lrByReset(){ _lrBy.step=0; lrByRender(); }
function lrByStep(d){ _lrBy.step=lrClamp(_lrBy.step+d,0,BYHAND.length-1); lrByRender(); }
function lrByRender(){
  const host=lrEl('lr-by-lines'); if(!host)return;
  host.innerHTML=BYHAND.slice(0,_lrBy.step+1).map((s,i)=>{
    const on=i===_lrBy.step;
    return '<div style="font-family:var(--mono);font-size:.84rem;padding:.55rem .8rem;border-radius:7px;background:'+(on?'var(--surface3)':'var(--surface2)')+';border:1px solid '+(on?LRC.acc:'var(--border)')+';color:'+(on?LRC.text:LRC.muted)+';transition:all .2s">'+s.t+'</div>';
  }).join('');
}

// ───────────────────────────────────────────────────────────
// 4.6.4 — Batch size morph
// ───────────────────────────────────────────────────────────
let _lrBatch = { size:1, anim:null };
const BATCH_DATA = [];
function lrBatchInit(){
  if(!BATCH_DATA.length) for(let i=0;i<64;i++) BATCH_DATA.push([(Math.random()-0.5)*1.4,(Math.random()-0.5)*1.4]);
  _lrBatch = { size:1, anim:null };
  const host = lrEl('lr-batch');
  if (!host) return;
  host.innerHTML =
    '<canvas id="lr-batch-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem">'+
      '<button class="lr-btn solid" id="lr-batch-play" onclick="lrBatchPlay()">\u25b6 Descend</button>'+
      '<div class="lr-sl" style="margin-left:auto">batch size <input id="lr-batch-sz" type="range" min="1" max="64" step="1" value="1" oninput="lrBatchSz(this.value)"><b id="lr-batch-szv">1</b></div>'+
    '</div>'+
    '<div class="lr-note" id="lr-batch-lab">Batch size 1 = stochastic: jittery. Slide toward 64 = full batch: smooth but slower per unit progress.</div>';
  lrBatchDraw([]);
}
function lrBatchSz(v){ _lrBatch.size=parseInt(v); lrTxt('lr-batch-szv',v);
  const lab=lrEl('lr-batch-lab');
  if(lab){ lab.innerHTML = _lrBatch.size<=2?'Batch size '+v+' \u2014 <b style="color:'+LRC.red+'">stochastic</b>: cheap, jittery steps.':_lrBatch.size>=48?'Batch size '+v+' \u2014 <b style="color:'+LRC.acc+'">full batch</b>: smooth, accurate, slower.':'Batch size '+v+' \u2014 <b style="color:'+LRC.pur+'">mini-batch</b>: most of the speed, most of the smoothness.'; }
}
function lrBatchPlay(){
  if(_lrBatch.anim){clearInterval(_lrBatch.anim);_lrBatch.anim=null;const b=lrEl('lr-batch-play');if(b)b.textContent='\u25b6 Descend';}
  let w=2.4,b=2.2,path=[[w,b]];
  const b2=lrEl('lr-batch-play'); if(b2)b2.textContent='\u2759\u2759 Running';
  let n=0;
  _lrBatch.anim=lrTimer(()=>{
    // average gradient over a random batch of size
    let gw=0,gb=0;
    for(let i=0;i<_lrBatch.size;i++){ const d=BATCH_DATA[Math.floor(Math.random()*BATCH_DATA.length)]; gw+=(w-d[0]); gb+=(b-d[1]); }
    gw/=_lrBatch.size; gb/=_lrBatch.size;
    const noise = 0.35/Math.sqrt(_lrBatch.size);
    w-=0.2*gw+(Math.random()-0.5)*noise; b-=0.2*gb+(Math.random()-0.5)*noise;
    path.push([w,b]); if(path.length>90)path.shift();
    lrBatchDraw(path); n++;
    if(n>90){clearInterval(_lrBatch.anim);_lrBatch.anim=null;const bb=lrEl('lr-batch-play');if(bb)bb.textContent='\u21ba Again';}
  },90);
}
function lrBatchDraw(path){
  const c=lrCanvas('lr-batch-cv',300); if(!c)return;
  const {ctx,W,H}=c; const S=Math.min(W,H),ox=(W-S)/2;
  const sx=w=>ox+(w+3)/6*S, sy=b=>(3-b)/6*S;
  const step=10;
  for(let px=0;px<S;px+=step)for(let py=0;py<S;py+=step){ const w=-3+(px/S)*6,b=3-(py/S)*6; const L=0.5*(w*w+b*b); const t=Math.min(1,L/6); ctx.fillStyle='rgba('+Math.round(19+t*210)+','+Math.round(28+t*30)+','+Math.round(32+t*94)+',0.9)'; ctx.fillRect(ox+px,py,step,step); }
  ctx.fillStyle=LRC.grn; ctx.beginPath(); ctx.arc(sx(0),sy(0),4,0,7); ctx.fill();
  if(path.length>1){ ctx.strokeStyle=LRC.acc; ctx.lineWidth=1.8; ctx.beginPath(); path.forEach((p,i)=>{i===0?ctx.moveTo(sx(p[0]),sy(p[1])):ctx.lineTo(sx(p[0]),sy(p[1]));}); ctx.stroke();
    const last=path[path.length-1]; ctx.fillStyle=LRC.red; ctx.beginPath(); ctx.arc(sx(last[0]),sy(last[1]),6,0,7); ctx.fill(); ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
  }
}


// ───────────────────────────────────────────────────────────
// 4.7 — One output splits into K
// ───────────────────────────────────────────────────────────
let _lrSplit = { k:2 };
function lrSplitInit(){
  _lrSplit={k:2};
  const host=lrEl('lr-split'); if(!host)return;
  host.innerHTML =
    '<canvas id="lr-split-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><div class="lr-sl">classes K <input id="lr-split-k" type="range" min="2" max="5" step="1" value="2" oninput="lrSplitK(this.value)"><b id="lr-split-kv">2</b></div></div>'+
    '<div class="lr-note" style="text-align:center">At K=2 there is one sigmoid output. Add classes and it fans into K competing softmax outputs.</div>';
  lrSplitDraw();
}
function lrSplitK(v){ _lrSplit.k=parseInt(v); lrTxt('lr-split-kv',v); lrSplitDraw(); }
function lrSplitDraw(){
  const c=lrCanvas('lr-split-cv',220); if(!c)return;
  const {ctx,W,H}=c; const K=_lrSplit.k;
  const inx=W*0.16, iny=H/2;
  ctx.fillStyle=LRC.pur; ctx.beginPath(); ctx.arc(inx,iny,16,0,7); ctx.fill();
  ctx.fillStyle='#070B18'; ctx.font='700 11px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('x',inx,iny+4);
  const cols=[LRC.acc,LRC.grn,LRC.red,LRC.pur,LRC.amb];
  const outx=W*0.8;
  for(let i=0;i<K;i++){
    const y=H*0.2+(H*0.6)*(K===1?0.5:i/(K-1));
    ctx.strokeStyle=cols[i]; ctx.lineWidth=2; ctx.globalAlpha=.7;
    ctx.beginPath(); ctx.moveTo(inx+16,iny); ctx.lineTo(outx-16,y); ctx.stroke(); ctx.globalAlpha=1;
    ctx.fillStyle=cols[i]; ctx.beginPath(); ctx.arc(outx,y,14,0,7); ctx.fill();
    ctx.fillStyle='#070B18'; ctx.font='700 10px IBM Plex Mono, monospace'; ctx.fillText('z'+(i+1),outx,y+3);
  }
  ctx.fillStyle=LRC.muted; ctx.font='11px IBM Plex Mono, monospace';
  ctx.fillText(K===2?'sigmoid':'softmax over '+K,W/2,H-8);
  ctx.textAlign='start';
}

// ───────────────────────────────────────────────────────────
// 4.7.1 — Softmax pie
// ───────────────────────────────────────────────────────────
let _lrSm = { z:{cat:2.0,dog:1.0,bird:0.5,fish:-0.5} };
const SM_COLS = {cat:'#4DE3FF',dog:'#3DDC84',bird:'#FF5F8E',fish:'#A18FFF'};
function lrSoftmaxInit(){
  _lrSm={z:{cat:2.0,dog:1.0,bird:0.5,fish:-0.5}};
  const host=lrEl('lr-softmax'); if(!host)return;
  host.innerHTML =
    '<div class="lr-grid2">'+
    '<div><div id="lr-sm-sliders" style="display:flex;flex-direction:column;gap:.7rem"></div></div>'+
    '<div><canvas id="lr-sm-cv" style="width:100%;display:block"></canvas></div>'+
    '</div>'+
    '<div id="lr-sm-bars" style="margin-top:1rem"></div>';
  lrEl('lr-sm-sliders').innerHTML=Object.keys(_lrSm.z).map(k=>
    '<div style="display:flex;align-items:center;gap:.7rem"><span style="font-family:var(--mono);font-size:.78rem;color:'+SM_COLS[k]+';width:42px;font-weight:700">'+k+'</span>'+
    '<input type="range" min="-3" max="4" step="0.1" value="'+_lrSm.z[k]+'" oninput="lrSmSet(\''+k+'\',this.value)" style="flex:1;accent-color:'+SM_COLS[k]+'">'+
    '<span id="lr-sm-z-'+k+'" style="font-family:var(--mono);font-size:.74rem;color:var(--muted);width:34px">'+_lrSm.z[k].toFixed(1)+'</span></div>'
  ).join('');
  lrSmCompute();
}
function lrSmSet(k,v){ _lrSm.z[k]=parseFloat(v); lrTxt('lr-sm-z-'+k,_lrSm.z[k].toFixed(1)); lrSmCompute(); }
function lrSmCompute(){
  const ks=Object.keys(_lrSm.z);
  const ex=ks.map(k=>Math.exp(_lrSm.z[k])); const tot=ex.reduce((a,b)=>a+b,0);
  const p=ks.map((k,i)=>ex[i]/tot);
  // bars
  lrEl('lr-sm-bars').innerHTML=ks.map((k,i)=>
    '<div style="display:flex;align-items:center;gap:.7rem;margin-bottom:.4rem"><span style="font-family:var(--mono);font-size:.72rem;color:'+SM_COLS[k]+';width:42px">'+k+'</span>'+
    '<div style="flex:1;height:20px;background:var(--surface3);border-radius:5px;overflow:hidden"><div style="height:100%;width:'+(p[i]*100).toFixed(1)+'%;background:'+SM_COLS[k]+';transition:width .2s"></div></div>'+
    '<span style="font-family:var(--mono);font-size:.74rem;color:var(--text);width:48px;text-align:right">'+(p[i]*100).toFixed(1)+'%</span></div>'
  ).join('');
  // pie
  const c=lrCanvas('lr-sm-cv',200); if(!c)return;
  const {ctx,W,H}=c; const cx=W/2,cy=H/2,R=Math.min(W,H)/2-16;
  let a=-Math.PI/2;
  ks.forEach((k,i)=>{ const ang=p[i]*7.0; ctx.fillStyle=SM_COLS[k]; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,a,a+ang); ctx.closePath(); ctx.fill(); a+=ang; });
  ctx.fillStyle=LRC.bg; ctx.beginPath(); ctx.arc(cx,cy,R*0.5,0,7); ctx.fill();
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('sums to',cx,cy-4); ctx.fillStyle=LRC.text; ctx.font='700 13px IBM Plex Mono, monospace'; ctx.fillText('100%',cx,cy+12); ctx.textAlign='start';
}

// ───────────────────────────────────────────────────────────
// 4.7.2 — Class templates
// ───────────────────────────────────────────────────────────
const TMPL = {
  sports:  [0.9, 0.1, 0.8, 0.2, 0.7],
  politics:[0.2, 0.9, 0.3, 0.8, 0.1],
  tech:    [0.3, 0.2, 0.4, 0.3, 0.9]
};
const TMPL_F = ['team','vote','score','policy','chip'];
let _lrTmpl = { input:[0.8,0.2,0.7,0.3,0.4] };
function lrTemplatesInit(){
  _lrTmpl={input:[0.8,0.2,0.7,0.3,0.4]};
  const host=lrEl('lr-templates'); if(!host)return;
  host.innerHTML =
    '<div class="lr-card-t">Input document (drag the feature bars)</div>'+
    '<div id="lr-tmpl-input" style="display:flex;gap:.5rem;margin:.6rem 0 1.2rem;align-items:flex-end;height:70px"></div>'+
    '<div class="lr-grid3" id="lr-tmpl-classes"></div>'+
    '<div class="lr-note">Each class row is a template. The input is dot-producted against all three; the most similar wins.</div>';
  lrTmplRender();
}
function lrTmplBar(i){
  const v=_lrTmpl.input[i];
  return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;cursor:ns-resize" onmousedown="lrTmplDrag(event,'+i+')">'+
    '<div style="width:70%;background:'+LRC.acc+';border-radius:3px 3px 0 0;height:'+(v*56+4)+'px"></div>'+
    '<span style="font-family:var(--mono);font-size:.56rem;color:var(--muted);margin-top:3px">'+TMPL_F[i]+'</span></div>';
}
function lrTmplRender(){
  const inp=lrEl('lr-tmpl-input'); if(!inp)return;
  inp.innerHTML=_lrTmpl.input.map((v,i)=>lrTmplBar(i)).join('');
  // scores
  const scores={}; let best=null,bestv=-1e9;
  Object.keys(TMPL).forEach(cls=>{ let s=0; for(let i=0;i<5;i++)s+=TMPL[cls][i]*_lrTmpl.input[i]; scores[cls]=s; if(s>bestv){bestv=s;best=cls;} });
  lrEl('lr-tmpl-classes').innerHTML=Object.keys(TMPL).map(cls=>{
    const win=cls===best;
    const bars=TMPL[cls].map((v,i)=>'<div style="flex:1;height:'+(v*30+3)+'px;background:'+(win?LRC.grn:LRC.s3)+';border-radius:2px"></div>').join('');
    return '<div class="lr-card" style="border-color:'+(win?LRC.grn:'var(--border)')+'">'+
      '<div class="lr-card-t" style="color:'+(win?LRC.grn:LRC.acc)+'">'+cls+(win?' \u2713 match':'')+'</div>'+
      '<div style="display:flex;gap:2px;align-items:flex-end;height:34px;margin:.4rem 0">'+bars+'</div>'+
      '<div style="font-family:var(--mono);font-size:.72rem;color:'+(win?LRC.grn:LRC.muted)+'">score '+scores[cls].toFixed(2)+'</div></div>';
  }).join('');
}
function lrTmplDrag(e,i){
  e.preventDefault();
  const move=(ev)=>{ const y=(ev.touches?ev.touches[0]:ev).clientY; const bar=e.target.closest('div[onmousedown]')||e.currentTarget; const r=bar.getBoundingClientRect(); let v=1-(y-r.top)/r.height; _lrTmpl.input[i]=lrClamp(v,0,1); lrTmplRender(); };
  const up=()=>{ window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up); };
  window.addEventListener('mousemove',move); window.addEventListener('mouseup',up);
}

// ───────────────────────────────────────────────────────────
// 4.7.3 — One feature fanning to 3 classes
// ───────────────────────────────────────────────────────────
let _lrFan = { on:true };
const FAN_W = { 'excited-pos':3.5, 'angry-neg':3.1, 'neutral':-5.3 };
function lrFanoutInit(){
  _lrFan={on:true};
  const host=lrEl('lr-fanout'); if(!host)return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center"><button class="lr-btn on" id="lr-fan-btn" onclick="lrFanToggle()">\u201c!\u201d feature: ON</button></div>'+
    '<canvas id="lr-fan-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-note" style="text-align:center">The same exclamation mark argues <em>for</em> excited-positive and angry-negative, and hard <em>against</em> neutral.</div>';
  lrFanDraw();
}
function lrFanToggle(){ _lrFan.on=!_lrFan.on; const b=lrEl('lr-fan-btn'); if(b){b.textContent='\u201c!\u201d feature: '+(_lrFan.on?'ON':'OFF'); b.classList.toggle('on',_lrFan.on);} lrFanDraw(); }
function lrFanDraw(){
  const c=lrCanvas('lr-fan-cv',220); if(!c)return;
  const {ctx,W,H}=c; const srcx=W*0.16, srcy=H/2;
  ctx.fillStyle=_lrFan.on?LRC.amb:LRC.s3; ctx.beginPath(); ctx.arc(srcx,srcy,18,0,7); ctx.fill();
  ctx.fillStyle=_lrFan.on?'#070B18':LRC.muted; ctx.font='700 16px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('!',srcx,srcy+6);
  const ks=Object.keys(FAN_W), outx=W*0.72;
  ks.forEach((k,i)=>{
    const y=H*0.22+(H*0.56)*(i/(ks.length-1));
    const w=FAN_W[k], contrib=_lrFan.on?w:0;
    const col=w>=0?LRC.grn:LRC.red;
    ctx.strokeStyle=_lrFan.on?col:LRC.s3; ctx.lineWidth=Math.abs(w)/1.5; ctx.globalAlpha=_lrFan.on?0.75:0.3;
    ctx.beginPath(); ctx.moveTo(srcx+18,srcy); ctx.lineTo(outx-70,y); ctx.stroke(); ctx.globalAlpha=1;
    // class box + contribution bar
    ctx.fillStyle=LRC.s2; ctx.fillRect(outx-64,y-16,128,32);
    ctx.strokeStyle='var(--border)';
    ctx.fillStyle=LRC.text; ctx.font='11px IBM Plex Mono, monospace'; ctx.textAlign='left'; ctx.fillText(k,outx-58,y-2);
    ctx.fillStyle=col; ctx.font='700 12px IBM Plex Mono, monospace'; ctx.fillText((contrib>=0?'+':'')+contrib.toFixed(1),outx-58,y+12);
  });
  ctx.textAlign='start';
}

// ───────────────────────────────────────────────────────────
// 4.8 — K-term collapse
// ───────────────────────────────────────────────────────────
let _lrColl = { revealed:false };
function lrCollapseInit(){
  _lrColl={revealed:false};
  const host=lrEl('lr-collapse'); if(!host)return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center"><button class="lr-btn solid" onclick="lrCollGo()">\u25b6 Multiply by the one-hot label</button><button class="lr-btn" onclick="lrCollReset()">reset</button></div>'+
    '<div id="lr-coll-body"></div>';
  lrCollRender();
}
function lrCollReset(){ _lrColl.revealed=false; lrCollRender(); }
function lrCollGo(){ _lrColl.revealed=true; lrCollRender(); }
function lrCollRender(){
  const host=lrEl('lr-coll-body'); if(!host)return;
  const classes=['sports','politics','tech','arts'];
  const yhat=[0.55,0.20,0.15,0.10]; const y=[1,0,0,0];
  host.innerHTML='<table class="lr-table"><tr><th>class</th><th>\u0177\u2096</th><th>y\u2096 (one-hot)</th><th>\u2212 y\u2096 log \u0177\u2096</th></tr>'+
    classes.map((c,i)=>{
      const term=-y[i]*Math.log(yhat[i]);
      const dead=_lrColl.revealed && y[i]===0;
      return '<tr style="opacity:'+(dead?0.28:1)+';transition:opacity .4s"><td>'+c+'</td><td>'+yhat[i].toFixed(2)+'</td><td style="color:'+(y[i]?LRC.grn:LRC.muted)+'">'+y[i]+'</td>'+
        '<td style="color:'+(y[i]?LRC.acc:LRC.muted)+'">'+(dead?'0 (gone)':term.toFixed(3))+'</td></tr>';
    }).join('')+'</table>'+
    '<div class="lr-note">'+(_lrColl.revealed
      ? 'Every wrong-class term multiplied by 0 and vanished. What remains is \u2212log \u0177 for the correct class = <b style="color:'+LRC.acc+'">0.598</b>.'
      : 'The full four-term sum. Press the button to multiply each row by its one-hot label.')+'</div>';
}

// ───────────────────────────────────────────────────────────
// 4.9 — Confusion matrix with threshold
// ───────────────────────────────────────────────────────────
let _lrConf = { thr:0.5, pie:false };
const CONF_POS=[]; const CONF_NEG=[];
function lrConfInit(){
  if(!CONF_POS.length){ for(let i=0;i<80;i++){CONF_POS.push(lrClamp(0.62+lrRandn()*0.16,0,1));} for(let i=0;i<80;i++){CONF_NEG.push(lrClamp(0.38+lrRandn()*0.16,0,1));} }
  _lrConf={thr:0.5,pie:false};
  const host=lrEl('lr-conf'); if(!host)return;
  host.innerHTML =
    '<canvas id="lr-conf-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem"><div class="lr-sl">threshold <input id="lr-conf-thr" type="range" min="0.05" max="0.95" step="0.01" value="0.5" oninput="lrConfThr(this.value)"><b id="lr-conf-thrv">0.50</b></div>'+
      '<button class="lr-btn" style="margin-left:auto" onclick="lrConfPie()">\u26A0 \u201cRare Fault\u201d trap</button></div>'+
    '<div id="lr-conf-metrics" class="lr-readout" style="margin-top:.85rem"></div>'+
    '<div class="lr-note" id="lr-conf-note">Slide the threshold and watch the four cells rebalance. Precision and recall trade off; F1 tracks the weaker one.</div>';
  lrConfDraw();
}
function lrRandn(){ let u=0,v=0; while(!u)u=Math.random(); while(!v)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function lrConfThr(v){ _lrConf.thr=parseFloat(v); _lrConf.pie=false; lrTxt('lr-conf-thrv',_lrConf.thr.toFixed(2)); lrConfDraw(); }
function lrConfPie(){
  _lrConf.pie=true;
  lrSet('lr-conf-note','The <b>Rare Fault</b> detector calls every turbine reading normal on a dataset where 99.99% of readings are normal. Accuracy: 99.99%. Recall on the faults it exists to catch: 0%. Accuracy lied; F1 told the truth.');
  lrConfDrawPie();
}
function lrConfDraw(){
  const c=lrCanvas('lr-conf-cv',260); if(!c)return;
  const {ctx,W,H}=c;
  // two distributions with threshold line
  const x0=30,x1=W-20,y0=H-40,y1=20;
  const xm=p=>x0+p*(x1-x0);
  // histogram
  const bins=40; const hp=new Array(bins).fill(0),hn=new Array(bins).fill(0);
  CONF_POS.forEach(v=>hp[Math.min(bins-1,Math.floor(v*bins))]++);
  CONF_NEG.forEach(v=>hn[Math.min(bins-1,Math.floor(v*bins))]++);
  const mx=Math.max(...hp,...hn);
  for(let i=0;i<bins;i++){
    const x=x0+(i/bins)*(x1-x0), bw=(x1-x0)/bins;
    ctx.fillStyle='rgba(255,95,142,0.5)'; ctx.fillRect(x,y0-hn[i]/mx*(y0-y1),bw-1,hn[i]/mx*(y0-y1));
    ctx.fillStyle='rgba(61,220,132,0.5)'; ctx.fillRect(x,y0-hp[i]/mx*(y0-y1),bw-1,hp[i]/mx*(y0-y1));
  }
  ctx.strokeStyle=LRC.text; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(xm(_lrConf.thr),y1-4); ctx.lineTo(xm(_lrConf.thr),y0); ctx.stroke();
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='center';
  ctx.fillText('threshold',xm(_lrConf.thr),y1-8); ctx.fillText('flagged \u2192',x1-40,y0+16); ctx.fillText('\u2190 not flagged',x0+50,y0+16);
  ctx.textAlign='start';
  // compute metrics
  let tp=0,fp=0,fn=0,tn=0;
  CONF_POS.forEach(v=>{ if(v>=_lrConf.thr)tp++; else fn++; });
  CONF_NEG.forEach(v=>{ if(v>=_lrConf.thr)fp++; else tn++; });
  const prec=tp/(tp+fp||1), rec=tp/(tp+fn||1), f1=2*prec*rec/((prec+rec)||1), acc=(tp+tn)/(tp+fp+fn+tn);
  lrSet('lr-conf-metrics',
    lrStat('TP',tp,LRC.grn)+lrStat('FP',fp,LRC.red)+lrStat('FN',fn,LRC.amb)+lrStat('TN',tn,LRC.muted)+
    lrStat('Precision',prec.toFixed(2),LRC.acc)+lrStat('Recall',rec.toFixed(2),LRC.pur)+lrStat('F1',f1.toFixed(2),LRC.grn)+lrStat('Accuracy',acc.toFixed(2),LRC.text));
}
function lrConfDrawPie(){
  const c=lrCanvas('lr-conf-cv',260); if(!c)return;
  const {ctx,W,H}=c;
  ctx.fillStyle=LRC.muted; ctx.font='13px IBM Plex Mono, monospace'; ctx.textAlign='center';
  ctx.fillText('10,000 examples: 9,999 negative, 1 positive',W/2,H/2-24);
  ctx.fillStyle=LRC.grn; ctx.font='700 30px IBM Plex Mono, monospace';
  ctx.fillText('accuracy = 99.99%',W/2,H/2+8);
  ctx.fillStyle=LRC.red; ctx.font='700 18px IBM Plex Mono, monospace';
  ctx.fillText('recall = 0%   F1 = 0',W/2,H/2+40);
  ctx.textAlign='start';
  lrSet('lr-conf-metrics', lrStat('TP',0,LRC.grn)+lrStat('FP',0,LRC.red)+lrStat('FN',1,LRC.amb)+lrStat('TN',9999,LRC.muted)+lrStat('Accuracy','1.00',LRC.grn)+lrStat('F1','0.00',LRC.red));
}
function lrStat(k,v,col){ return '<span class="lr-stat"><span class="lr-stat-k">'+k+'</span><span class="lr-stat-v" style="color:'+(col||LRC.text)+'">'+v+'</span></span>'; }

// ───────────────────────────────────────────────────────────
// 4.9.1 — Micro vs macro
// ───────────────────────────────────────────────────────────
let _lrAvg = { mode:'macro' };
const AVG_DATA = {
  lynx:  { tp:8, fp:3, fn:4 },
  deer:  { tp:12, fp:6, fn:5 },
  empty: { tp:180, fp:12, fn:8 }
};
function lrAvgInit(){
  _lrAvg={mode:'macro'};
  const host=lrEl('lr-avg'); if(!host)return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center">'+
      '<button class="lr-btn '+(_lrAvg.mode==='micro'?'on':'')+'" id="lr-avg-micro" onclick="lrAvgSet(\'micro\')">micro-average</button>'+
      '<button class="lr-btn '+(_lrAvg.mode==='macro'?'on':'')+'" id="lr-avg-macro" onclick="lrAvgSet(\'macro\')">macro-average</button>'+
    '</div>'+
    '<div id="lr-avg-body"></div>';
  lrAvgRender();
}
function lrAvgSet(m){ _lrAvg.mode=m; lrEl('lr-avg-micro').classList.toggle('on',m==='micro'); lrEl('lr-avg-macro').classList.toggle('on',m==='macro'); lrAvgRender(); }
function lrAvgRender(){
  const host=lrEl('lr-avg-body'); if(!host)return;
  const cls=Object.keys(AVG_DATA);
  const perF1=cls.map(c=>{ const d=AVG_DATA[c]; const p=d.tp/(d.tp+d.fp), r=d.tp/(d.tp+d.fn); return 2*p*r/(p+r); });
  let result;
  if(_lrAvg.mode==='macro'){ result=perF1.reduce((a,b)=>a+b,0)/cls.length; }
  else { let tp=0,fp=0,fn=0; cls.forEach(c=>{tp+=AVG_DATA[c].tp;fp+=AVG_DATA[c].fp;fn+=AVG_DATA[c].fn;}); const p=tp/(tp+fp),r=tp/(tp+fn); result=2*p*r/(p+r); }
  host.innerHTML='<table class="lr-table"><tr><th>class</th><th>support</th><th>F1</th></tr>'+
    cls.map((c,i)=>{ const d=AVG_DATA[c]; const dom=c==='empty'; return '<tr><td style="color:'+(dom?LRC.amb:'var(--text)')+'">'+c+(dom?' (dominant)':'')+'</td><td>'+(d.tp+d.fn)+'</td><td>'+perF1[i].toFixed(3)+'</td></tr>'; }).join('')+'</table>'+
    '<div class="lr-readout" style="margin-top:.9rem;justify-content:center">'+lrStat(_lrAvg.mode+' F1',result.toFixed(3),_lrAvg.mode==='micro'?LRC.amb:LRC.acc)+'</div>'+
    '<div class="lr-note" style="text-align:center">'+(_lrAvg.mode==='micro'
      ? 'Micro pools every decision, so the huge <b>empty</b> class dominates and the score looks great while the two animal classes are ignored.'
      : 'Macro averages the per-class F1 equally, so the weak <b>lynx</b> and <b>deer</b> classes drag the number down where it belongs.')+'</div>';
}

// ───────────────────────────────────────────────────────────
// 4.10 — K-fold cross-validation
// ───────────────────────────────────────────────────────────
let _lrKf = { fold:0, scores:[], anim:null };
function lrKfoldInit(){
  _lrKf={fold:0,scores:[],anim:null};
  const host=lrEl('lr-kfold'); if(!host)return;
  host.innerHTML =
    '<canvas id="lr-kf-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><button class="lr-btn solid" id="lr-kf-play" onclick="lrKfPlay()">\u25b6 Run all 10 folds</button><button class="lr-btn" onclick="lrKfReset()">reset</button></div>'+
    '<div class="lr-readout" style="margin-top:.6rem;justify-content:center"><span class="lr-stat"><span class="lr-stat-k">running mean error</span><span class="lr-stat-v" id="lr-kf-mean" style="color:'+LRC.acc+'">\u2014</span></span></div>';
  lrKfDraw();
}
function lrKfReset(){ if(_lrKf.anim){clearInterval(_lrKf.anim);_lrKf.anim=null;} _lrKf.fold=0;_lrKf.scores=[]; lrTxt('lr-kf-mean','\u2014'); lrKfDraw(); }
function lrKfPlay(){
  lrKfReset();
  _lrKf.anim=lrTimer(()=>{
    if(_lrKf.fold>=10){ clearInterval(_lrKf.anim);_lrKf.anim=null; return; }
    _lrKf.scores.push(+(0.12+Math.random()*0.09).toFixed(3));
    _lrKf.fold++;
    const mean=_lrKf.scores.reduce((a,b)=>a+b,0)/_lrKf.scores.length;
    lrTxt('lr-kf-mean',mean.toFixed(3));
    lrKfDraw();
  }, 420);
}
function lrKfDraw(){
  const c=lrCanvas('lr-kf-cv',220); if(!c)return;
  const {ctx,W,H}=c; const K=10;
  const barY=30, barH=30, x0=20, x1=W-20, cw=(x1-x0)/K;
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText('training bar \u2014 dev block slides across',x0,20);
  for(let i=0;i<K;i++){
    const dev=i===Math.min(_lrKf.fold,K-1) && _lrKf.fold<K;
    const done=i<_lrKf.fold;
    ctx.fillStyle=dev?LRC.amb:done?'rgba(77,227,255,0.3)':LRC.s3;
    ctx.fillRect(x0+i*cw+1,barY,cw-2,barH);
  }
  ctx.fillStyle=LRC.amb; ctx.font='9px IBM Plex Mono, monospace';
  if(_lrKf.fold<K) ctx.fillText('DEV',x0+Math.min(_lrKf.fold,K-1)*cw+cw/2-8,barY+barH+12);
  // error dots
  const py0=H-20, py1=barY+barH+30;
  ctx.strokeStyle=LRC.grid; ctx.beginPath(); ctx.moveTo(x0,py0); ctx.lineTo(x1,py0); ctx.stroke();
  _lrKf.scores.forEach((s,i)=>{ const x=x0+i*cw+cw/2, y=py0-(s/0.25)*(py0-py1); ctx.fillStyle=LRC.acc; ctx.beginPath(); ctx.arc(x,y,4,0,7); ctx.fill(); ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText(s.toFixed(2),x-8,y-8); });
  if(_lrKf.scores.length){ const mean=_lrKf.scores.reduce((a,b)=>a+b)/_lrKf.scores.length; const y=py0-(mean/0.25)*(py0-py1); ctx.strokeStyle=LRC.grn; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke(); ctx.setLineDash([]); }
}

// ───────────────────────────────────────────────────────────
// 4.11 — Null distribution & p-value
// ───────────────────────────────────────────────────────────
let _lrNull = { alpha:0.05, samples:[], delta:0.042, anim:null };
function lrNullInit(){
  _lrNull={alpha:0.05,samples:[],delta:0.042,anim:null};
  const host=lrEl('lr-null'); if(!host)return;
  host.innerHTML =
    '<canvas id="lr-null-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem"><button class="lr-btn solid" onclick="lrNullBuild()">\u25b6 Build null distribution</button>'+
      '<div class="lr-sl" style="margin-left:auto">significance \u03b1 <input id="lr-null-a" type="range" min="0.01" max="0.1" step="0.01" value="0.05" oninput="lrNullA(this.value)"><b id="lr-null-av">0.05</b></div></div>'+
    '<div class="lr-readout" style="margin-top:.6rem"><span class="lr-stat"><span class="lr-stat-k">observed \u03b4</span><span class="lr-stat-v" style="color:'+LRC.acc+'">0.042</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">p-value</span><span class="lr-stat-v" id="lr-null-p" style="color:'+LRC.pur+'">\u2014</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">verdict</span><span class="lr-stat-v" id="lr-null-v">\u2014</span></span></div>';
  lrNullDraw();
}
function lrNullA(v){ _lrNull.alpha=parseFloat(v); lrTxt('lr-null-av',_lrNull.alpha.toFixed(2)); lrNullDraw(); }
function lrNullBuild(){
  _lrNull.samples=[];
  if(_lrNull.anim)clearInterval(_lrNull.anim);
  _lrNull.anim=lrTimer(()=>{
    for(let i=0;i<40;i++) _lrNull.samples.push(lrRandn()*0.025);
    if(_lrNull.samples.length>=2000){clearInterval(_lrNull.anim);_lrNull.anim=null;}
    lrNullDraw();
  },40);
}
function lrNullDraw(){
  const c=lrCanvas('lr-null-cv',240); if(!c)return;
  const {ctx,W,H}=c; const x0=20,x1=W-20,y0=H-24,y1=20;
  const dmin=-0.09,dmax=0.09; const xm=d=>x0+(d-dmin)/(dmax-dmin)*(x1-x0);
  const bins=45; const h=new Array(bins).fill(0);
  _lrNull.samples.forEach(s=>{ const b=Math.floor((s-dmin)/(dmax-dmin)*bins); if(b>=0&&b<bins)h[b]++; });
  const mx=Math.max(1,...h);
  for(let i=0;i<bins;i++){ const d=dmin+(i/bins)*(dmax-dmin); const x=xm(d), bw=(x1-x0)/bins; const tail=d>=_lrNull.delta; ctx.fillStyle=tail?'rgba(255,95,142,0.6)':'rgba(134,144,137,0.5)'; ctx.fillRect(x,y0-h[i]/mx*(y0-y1),bw-1,h[i]/mx*(y0-y1)); }
  // observed delta line
  ctx.strokeStyle=LRC.acc; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(xm(_lrNull.delta),y1); ctx.lineTo(xm(_lrNull.delta),y0); ctx.stroke();
  ctx.fillStyle=LRC.acc; ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('\u03b4 observed',xm(_lrNull.delta),y1-6); ctx.textAlign='start';
  ctx.fillStyle=LRC.muted; ctx.fillText('0',xm(0)-3,y0+14);
  // p-value
  if(_lrNull.samples.length){
    const tail=_lrNull.samples.filter(s=>s>=_lrNull.delta).length;
    const p=tail/_lrNull.samples.length;
    lrTxt('lr-null-p',p.toFixed(3));
    const sig=p<_lrNull.alpha;
    const vEl=lrEl('lr-null-v'); if(vEl){ vEl.textContent=sig?'significant':'not sig.'; vEl.style.color=sig?LRC.grn:LRC.red; }
  }
}

// ───────────────────────────────────────────────────────────
// 4.11.1 — Bootstrap slot machine
// ───────────────────────────────────────────────────────────
const BOOT_DOCS = [ {a:1,b:0},{a:1,b:1},{a:0,b:0},{a:1,b:0},{a:1,b:1},{a:0,b:0},{a:1,b:0},{a:1,b:1},{a:1,b:0},{a:0,b:1} ];
let _lrBoot = { deltas:[], count:0, anim:null };
function lrBootBaseDelta(){ let a=0,b=0; BOOT_DOCS.forEach(d=>{a+=d.a;b+=d.b;}); return (a-b)/BOOT_DOCS.length; }
function lrBootInit(){
  _lrBoot={deltas:[],count:0,anim:null};
  const host=lrEl('lr-boot'); if(!host)return;
  host.innerHTML =
    '<canvas id="lr-boot-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><button class="lr-btn solid" onclick="lrBootResample(1)">\uD83C\uDFB0 Resample once</button><button class="lr-btn" onclick="lrBootResample(500)">\u00d7500 fast</button><button class="lr-btn" onclick="lrBootInit()">reset</button></div>'+
    '<div class="lr-readout" style="margin-top:.6rem;justify-content:center">'+
      '<span class="lr-stat"><span class="lr-stat-k">resamples</span><span class="lr-stat-v" id="lr-boot-n">0</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">\u03b4(x\u2071) \u2265 2\u03b4(x)</span><span class="lr-stat-v" id="lr-boot-c" style="color:'+LRC.red+'">0</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">empirical p</span><span class="lr-stat-v" id="lr-boot-p" style="color:'+LRC.pur+'">\u2014</span></span></div>'+
    '<div class="lr-note" style="text-align:center">Draw a virtual test set with replacement; its \u03b4 drops onto the histogram. The p-value is how often the resampled gap reaches twice the observed one.</div>';
  lrBootDraw();
}
function lrBootResample(n){
  const base=lrBootBaseDelta();
  for(let k=0;k<n;k++){
    let a=0,b=0;
    for(let i=0;i<BOOT_DOCS.length;i++){ const d=BOOT_DOCS[Math.floor(Math.random()*BOOT_DOCS.length)]; a+=d.a; b+=d.b; }
    const delta=(a-b)/BOOT_DOCS.length;
    _lrBoot.deltas.push(delta);
    if(delta>=2*base) _lrBoot.count++;
  }
  lrTxt('lr-boot-n',_lrBoot.deltas.length);
  lrTxt('lr-boot-c',_lrBoot.count);
  lrTxt('lr-boot-p',(_lrBoot.count/_lrBoot.deltas.length).toFixed(3));
  lrBootDraw();
}
function lrBootDraw(){
  const c=lrCanvas('lr-boot-cv',220); if(!c)return;
  const {ctx,W,H}=c; const x0=20,x1=W-20,y0=H-24,y1=20;
  const base=lrBootBaseDelta(); const dmin=-0.2,dmax=0.6; const xm=d=>x0+(d-dmin)/(dmax-dmin)*(x1-x0);
  const bins=40, h=new Array(bins).fill(0);
  _lrBoot.deltas.forEach(s=>{ const b=Math.floor((s-dmin)/(dmax-dmin)*bins); if(b>=0&&b<bins)h[b]++; });
  const mx=Math.max(1,...h);
  for(let i=0;i<bins;i++){ const d=dmin+(i/bins)*(dmax-dmin); const x=xm(d),bw=(x1-x0)/bins; ctx.fillStyle=d>=2*base?'rgba(255,95,142,0.6)':'rgba(77,227,255,0.45)'; ctx.fillRect(x,y0-h[i]/mx*(y0-y1),bw-1,h[i]/mx*(y0-y1)); }
  [[base,LRC.acc,'\u03b4'],[2*base,LRC.red,'2\u03b4']].forEach(([d,col,lab])=>{ ctx.strokeStyle=col; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(xm(d),y1); ctx.lineTo(xm(d),y0); ctx.stroke(); ctx.fillStyle=col; ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(lab,xm(d),y1-4); });
  ctx.textAlign='start';
}


// ───────────────────────────────────────────────────────────
// 4.12 — Bias audit: swap one word
// ───────────────────────────────────────────────────────────
const BIAS_NAMES = ['Emily','Greg','Lakisha','Jamal','Mei','Aaliyah'];
const BIAS_BASE = { 'Emily':0.0,'Greg':0.0,'Lakisha':-0.28,'Jamal':-0.31,'Mei':-0.12,'Aaliyah':-0.24 };
let _lrBias = { name:'Emily' };
function lrBiasInit(){
  _lrBias={name:'Emily'};
  const host=lrEl('lr-bias'); if(!host)return;
  host.innerHTML =
    '<div style="font-size:.95rem;color:var(--text);margin-bottom:1rem;line-height:1.7">\u201c<span id="lr-bias-name" style="color:'+LRC.acc+';font-weight:700">Emily</span> is applying for the software engineering role and seems like a strong candidate.\u201d</div>'+
    '<div class="lr-ctl" style="margin-bottom:1rem">'+BIAS_NAMES.map(n=>'<button class="lr-btn '+(n==='Emily'?'on':'')+'" onclick="lrBiasSet(\''+n+'\')">'+n+'</button>').join('')+'</div>'+
    '<canvas id="lr-bias-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-note">Only the name changes. A fair model would return an identical score every time; this one does not, and that gap is the bias.</div>';
  lrBiasDraw();
}
function lrBiasSet(n){ _lrBias.name=n; lrTxt('lr-bias-name',n); document.querySelectorAll('#lr-bias .lr-btn').forEach(b=>b.classList.toggle('on',b.textContent===n)); lrBiasDraw(); }
function lrBiasDraw(){
  const c=lrCanvas('lr-bias-cv',150); if(!c)return;
  const {ctx,W,H}=c; const base=0.72; const score=lrClamp(base+BIAS_BASE[_lrBias.name],0,1);
  const x0=20,x1=W-90,y=H/2;
  ctx.fillStyle=LRC.s3; ctx.fillRect(x0,y-16,x1-x0,32);
  // reference (Emily) marker
  ctx.strokeStyle=LRC.muted; ctx.setLineDash([4,4]); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x0+base*(x1-x0),y-24); ctx.lineTo(x0+base*(x1-x0),y+24); ctx.stroke(); ctx.setLineDash([]);
  const col=score>=base-0.02?LRC.grn:LRC.red;
  ctx.fillStyle=col; ctx.fillRect(x0,y-16,score*(x1-x0),32);
  ctx.fillStyle=LRC.text; ctx.font='700 18px IBM Plex Mono, monospace'; ctx.textAlign='left';
  ctx.fillText(score.toFixed(2),x1+14,y+6);
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace';
  const gap=score-base;
  if(Math.abs(gap)>0.001){ ctx.fillStyle=LRC.red; ctx.fillText((gap>0?'+':'')+gap.toFixed(2)+' vs Emily',x1+14,y+24); }
  else { ctx.fillStyle=LRC.muted; ctx.fillText('reference',x1+14,y+24); }
  ctx.textAlign='start';
}

// ───────────────────────────────────────────────────────────
// 4.12 — Model card template
// ───────────────────────────────────────────────────────────
const CARD_FIELDS = [
  { k:'Training data', v:'2.1M product reviews, English, 2019\u20132023' },
  { k:'Intended use', v:'Sentiment triage for customer support queues' },
  { k:'Out-of-scope', v:'Medical, legal, or safety-critical decisions' },
  { k:'Evaluation', v:'F1 = 0.88 overall; 0.71 on non-English names' },
  { k:'Known limitations', v:'Underperforms on sarcasm and code-switching' },
  { k:'Ethical review', v:'Bias audit across name/dialect completed 2024-Q1' }
];
let _lrCard = { shown:0 };
function lrCardInit(){
  _lrCard={shown:0};
  const host=lrEl('lr-card'); if(!host)return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center"><button class="lr-btn solid" onclick="lrCardReveal()">+ reveal next field</button><button class="lr-btn" onclick="lrCardInit()">reset</button></div>'+
    '<div id="lr-card-body" style="display:flex;flex-direction:column;gap:.5rem"></div>';
  lrCardRender();
}
function lrCardReveal(){ _lrCard.shown=Math.min(CARD_FIELDS.length,_lrCard.shown+1); lrCardRender(); }
function lrCardRender(){
  const host=lrEl('lr-card-body'); if(!host)return;
  host.innerHTML=CARD_FIELDS.map((f,i)=>{
    const shown=i<_lrCard.shown;
    return '<div style="display:flex;gap:1rem;padding:.6rem .9rem;background:var(--surface2);border:1px solid var(--border);border-left:3px solid '+(shown?LRC.acc:LRC.s3)+';border-radius:7px;opacity:'+(shown?1:0.35)+';transition:all .3s">'+
      '<span style="font-family:var(--mono);font-size:.68rem;color:'+(shown?LRC.acc:LRC.muted)+';text-transform:uppercase;min-width:130px">'+f.k+'</span>'+
      '<span style="font-size:.82rem;color:var(--text)">'+(shown?f.v:'\u2014')+'</span></div>';
  }).join('');
}

// ───────────────────────────────────────────────────────────
// 4.13 — Sortable weight contributions
// ───────────────────────────────────────────────────────────
const WEIGHTS_DATA = [
  {f:'amazing',w:2.4},{f:'love',w:2.0},{f:'great',w:1.6},{f:'good',w:1.1},{f:'fine',w:0.3},
  {f:'okay',w:0.1},{f:'meh',w:-0.6},{f:'boring',w:-1.5},{f:'bad',w:-1.8},{f:'terrible',w:-2.2},{f:'hate',w:-2.5}
];
let _lrW = { sort:'signed', hover:null };
function lrWeightsInit(){
  _lrW={sort:'signed',hover:null};
  const host=lrEl('lr-weights'); if(!host)return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem">'+
      '<button class="lr-btn on" id="lr-w-signed" onclick="lrWSort(\'signed\')">by value</button>'+
      '<button class="lr-btn" id="lr-w-mag" onclick="lrWSort(\'mag\')">by magnitude</button>'+
      '<button class="lr-btn" id="lr-w-alpha" onclick="lrWSort(\'alpha\')">alphabetical</button>'+
    '</div>'+
    '<div id="lr-w-body"></div>'+
    '<div class="lr-note">Hover any bar for its contribution to a review where the word appears twice. Positive weights are literally the model\u2019s vocabulary of praise.</div>';
  lrWRender();
}
function lrWSort(s){ _lrW.sort=s; ['signed','mag','alpha'].forEach(k=>lrEl('lr-w-'+k).classList.toggle('on',k===s)); lrWRender(); }
function lrWRender(){
  const host=lrEl('lr-w-body'); if(!host)return;
  let data=[...WEIGHTS_DATA];
  if(_lrW.sort==='signed')data.sort((a,b)=>b.w-a.w);
  else if(_lrW.sort==='mag')data.sort((a,b)=>Math.abs(b.w)-Math.abs(a.w));
  else data.sort((a,b)=>a.f.localeCompare(b.f));
  const maxW=2.5;
  host.innerHTML=data.map(d=>{
    const pct=Math.abs(d.w)/maxW*50;
    const pos=d.w>=0;
    return '<div onmouseenter="lrWHover(\''+d.f+'\')" onmouseleave="lrWHover(null)" style="display:flex;align-items:center;gap:.6rem;padding:.25rem 0;cursor:default">'+
      '<span style="font-family:var(--mono);font-size:.74rem;color:var(--muted);width:70px;text-align:right">'+d.f+'</span>'+
      '<div style="flex:1;height:20px;position:relative;background:var(--surface2);border-radius:4px">'+
        '<div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--border2)"></div>'+
        '<div style="position:absolute;'+(pos?'left:50%':'right:50%')+';top:2px;bottom:2px;width:'+pct+'%;background:'+(pos?LRC.grn:LRC.red)+';border-radius:3px"></div>'+
        (_lrW.hover===d.f?'<div style="position:absolute;'+(pos?'left':'right')+':calc(50% + '+pct+'%);top:-24px;font-family:var(--mono);font-size:.68rem;color:'+(pos?LRC.grn:LRC.red)+';white-space:nowrap;padding:0 6px">contrib: '+(pos?'+':'')+(d.w*2).toFixed(1)+' (\u00d72)</div>':'')+
      '</div>'+
      '<span style="font-family:var(--mono);font-size:.72rem;color:'+(pos?LRC.grn:LRC.red)+';width:42px">'+(pos?'+':'')+d.w.toFixed(1)+'</span></div>';
  }).join('');
}
function lrWHover(f){ _lrW.hover=f; lrWRender(); }

// ───────────────────────────────────────────────────────────
// 4.13 — Confound toggle
// ───────────────────────────────────────────────────────────
let _lrCf = { adjusted:false };
function lrConfoundInit(){
  _lrCf={adjusted:false};
  const host=lrEl('lr-confound'); if(!host)return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center"><button class="lr-btn" id="lr-cf-btn" onclick="lrCfToggle()">Hold \u201cillness severity\u201d constant: OFF</button></div>'+
    '<canvas id="lr-cf-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-note" id="lr-cf-note">The word <em>hospital</em> looks like it strongly predicts the outcome. But does the word carry the signal, or the sickness behind it?</div>';
  lrCfDraw();
}
function lrCfToggle(){ _lrCf.adjusted=!_lrCf.adjusted; const b=lrEl('lr-cf-btn'); if(b)b.textContent='Hold \u201cillness severity\u201d constant: '+(_lrCf.adjusted?'ON':'OFF');
  lrSet('lr-cf-note',_lrCf.adjusted
    ? 'Once severity is held constant, the apparent effect of <em>hospital</em> collapses. The word was a stand-in for being sick, not a cause of anything.'
    : 'The word <em>hospital</em> looks like it strongly predicts the outcome. But does the word carry the signal, or the sickness behind it?');
  lrCfDraw();
}
function lrCfDraw(){
  const c=lrCanvas('lr-cf-cv',160); if(!c)return;
  const {ctx,W,H}=c; const raw=2.1, adj=0.3; const val=_lrCf.adjusted?adj:raw;
  const x0=30,y=H/2,maxW=W-120;
  ctx.fillStyle=LRC.muted; ctx.font='11px IBM Plex Mono, monospace'; ctx.fillText('apparent weight of \u201chospital\u201d',x0,24);
  ctx.fillStyle=LRC.s3; ctx.fillRect(x0,y-18,maxW,36);
  ctx.fillStyle=_lrCf.adjusted?LRC.muted:LRC.acc; ctx.fillRect(x0,y-18,val/2.5*maxW,36);
  ctx.fillStyle=LRC.text; ctx.font='700 22px IBM Plex Mono, monospace'; ctx.textAlign='left'; ctx.fillText('+'+val.toFixed(1),x0+maxW+16,y+8);
  if(_lrCf.adjusted){ ctx.strokeStyle=LRC.red; ctx.setLineDash([4,4]); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x0+raw/2.5*maxW,y-26); ctx.lineTo(x0+raw/2.5*maxW,y+26); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle=LRC.red; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('was +2.1',x0+raw/2.5*maxW-20,y-30); }
  ctx.textAlign='start';
}

// ───────────────────────────────────────────────────────────
// 4.14 — Regularization strength
// ───────────────────────────────────────────────────────────
let _lrReg = { lambda:0.0 };
const REG_PTS = [];
function lrRegInit(){
  if(!REG_PTS.length){ for(let i=0;i<40;i++){ const x=(Math.random()-0.5)*2.6, y=(Math.random()-0.5)*2.6; const base=(x*x*0.5 - y > -0.2)?1:0; const c=Math.random()<0.12?1-base:base; REG_PTS.push({x,y,c}); } }
  _lrReg={lambda:0.0};
  const host=lrEl('lr-reg'); if(!host)return;
  host.innerHTML =
    '<canvas id="lr-reg-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><div class="lr-sl">\u03bb strength <input id="lr-reg-l" type="range" min="0" max="1" step="0.02" value="0" oninput="lrRegL(this.value)"><b id="lr-reg-lv">0.00</b></div></div>'+
    '<div class="lr-note" id="lr-reg-note">\u03bb=0: the boundary contorts through every noisy point (overfit). Raise \u03bb and it relaxes toward a smooth, general shape.</div>';
  lrRegDraw();
}
function lrRegL(v){ _lrReg.lambda=parseFloat(v); lrTxt('lr-reg-lv',_lrReg.lambda.toFixed(2));
  const n=lrEl('lr-reg-note'); if(n)n.innerHTML=_lrReg.lambda<0.15?'\u03bb small: the boundary contorts through every noisy point (<b style="color:'+LRC.red+'">overfit</b>).':_lrReg.lambda>0.7?'\u03bb large: the boundary is very smooth, possibly <b style="color:'+LRC.amb+'">underfit</b> now.':'\u03bb balanced: a <b style="color:'+LRC.grn+'">smooth boundary</b> that captures the real trend.';
  lrRegDraw();
}
function lrRegDraw(){
  const c=lrCanvas('lr-reg-cv',320); if(!c)return;
  const {ctx,W,H}=c; const S=Math.min(W,H),ox=(W-S)/2;
  const sx=x=>ox+(x+1.6)/3.2*S, sy=y=>(1.6-y)/3.2*S;
  const wiggle=(1-_lrReg.lambda);
  // decision field: wiggly quadratic morphs to a straight line as lambda grows
  const step=8;
  for(let px=0;px<S;px+=step)for(let py=0;py<S;py+=step){
    const x=-1.6+(px/S)*3.2, y=1.6-(py/S)*3.2;
    const boundary = wiggle*(0.5*x*x + 0.6*Math.sin(x*3)*wiggle) - 0.2 + (1-wiggle)*(x*0.4);
    const z = (y - boundary)* (2+_lrReg.lambda*2);
    const p=lrSig(-z);
    ctx.fillStyle='rgba('+Math.round(255-p*194)+','+Math.round(92+p*128)+','+Math.round(126+p*6)+',0.15)';
    ctx.fillRect(ox+px,py,step,step);
  }
  REG_PTS.forEach(pt=>{ ctx.fillStyle=pt.c?LRC.grn:LRC.red; ctx.beginPath(); ctx.arc(sx(pt.x),sy(pt.y),4,0,7); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=1; ctx.stroke(); });
}

// ───────────────────────────────────────────────────────────
// 4.14 — L1 vs L2 geometry
// ───────────────────────────────────────────────────────────
let _lrL = { mode:'l2' };
function lrL1L2Init(){
  _lrL={mode:'l2'};
  const host=lrEl('lr-l1l2'); if(!host)return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center">'+
      '<button class="lr-btn '+(_lrL.mode==='l2'?'on':'')+'" id="lr-l-l2" onclick="lrLSet(\'l2\')">L2 (circle)</button>'+
      '<button class="lr-btn '+(_lrL.mode==='l1'?'on':'')+'" id="lr-l-l1" onclick="lrLSet(\'l1\')">L1 (diamond)</button>'+
    '</div>'+
    '<div class="lr-grid2">'+
      '<div><canvas id="lr-l-cv" style="width:100%;display:block"></canvas></div>'+
      '<div><div class="lr-card-t">Resulting weights</div><div id="lr-l-bars" style="margin-top:.6rem"></div></div>'+
    '</div>'+
    '<div class="lr-note" id="lr-l-note"></div>';
  lrLDraw();
}
function lrLSet(m){ _lrL.mode=m; lrEl('lr-l-l2').classList.toggle('on',m==='l2'); lrEl('lr-l-l1').classList.toggle('on',m==='l1'); lrLDraw(); }
function lrLDraw(){
  const c=lrCanvas('lr-l-cv',240); if(!c)return;
  const {ctx,W,H}=c; const S=Math.min(W,H),ox=(W-S)/2,cx=ox+S/2,cy=S/2,R=S*0.3;
  // axes
  ctx.strokeStyle=LRC.grid; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(ox,cy); ctx.lineTo(ox+S,cy); ctx.moveTo(cx,0); ctx.lineTo(cx,S); ctx.stroke();
  // constraint region
  ctx.strokeStyle=LRC.pur; ctx.lineWidth=2; ctx.fillStyle='rgba(161,143,255,0.12)';
  ctx.beginPath();
  if(_lrL.mode==='l2'){ ctx.arc(cx,cy,R,0,7); }
  else { ctx.moveTo(cx,cy-R); ctx.lineTo(cx+R,cy); ctx.lineTo(cx,cy+R); ctx.lineTo(cx-R,cy); ctx.closePath(); }
  ctx.fill(); ctx.stroke();
  // loss contours (ellipses) centered off-axis
  const lx=cx+R*1.1, ly=cy-R*0.9;
  ctx.strokeStyle='rgba(77,227,255,0.5)'; ctx.lineWidth=1.3;
  for(let r=0.5;r<3;r+=0.6){ ctx.beginPath(); ctx.ellipse(lx,ly,r*R*0.55,r*R*0.4,0.5,0,7); ctx.stroke(); }
  // touch point
  let tx,ty;
  if(_lrL.mode==='l2'){ const ang=Math.atan2(ly-cy,lx-cx); tx=cx+Math.cos(ang)*R; ty=cy+Math.sin(ang)*R; }
  else { tx=cx; ty=cy-R; } // corner on axis -> w1=0
  ctx.fillStyle=LRC.red; ctx.beginPath(); ctx.arc(tx,ty,6,0,7); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText('w\u2081',ox+S-16,cy-6); ctx.fillText('w\u2082',cx+6,12);
  // bars
  const w1=_lrL.mode==='l1'?0:0.6, w2=_lrL.mode==='l1'?1.0:0.7;
  lrSet('lr-l-bars',
    lrLBar('w\u2081',w1,_lrL.mode==='l1')+lrLBar('w\u2082',w2,false));
  lrSet('lr-l-note',_lrL.mode==='l1'
    ? 'The diamond\u2019s corner sits on the axis, so the loss contour touches where <b style="color:'+LRC.red+'">w\u2081 = 0 exactly</b>. L1 selects features by zeroing them.'
    : 'The circle has no corners, so the contour touches at a point where <b>both weights are nonzero</b>. L2 shrinks but rarely zeroes.');
}
function lrLBar(name,v,zero){
  return '<div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem"><span style="font-family:var(--mono);font-size:.74rem;color:var(--muted);width:24px">'+name+'</span>'+
    '<div style="flex:1;height:20px;background:var(--surface3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+(v*100)+'%;background:'+(zero?LRC.red:LRC.acc)+';transition:width .3s"></div></div>'+
    '<span style="font-family:var(--mono);font-size:.72rem;color:'+(zero?LRC.red:LRC.text)+';width:60px">'+(zero?'0 (dropped)':v.toFixed(2))+'</span></div>';
}

// ───────────────────────────────────────────────────────────
// 4.15 — The derivation, unfolded
// ───────────────────────────────────────────────────────────
const DERIV_STEPS = [
  { t:'\\frac{\\partial L}{\\partial w_i} = \\frac{\\partial L}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w_i}', note:'The chain rule: three factors linked from loss back to weight.' },
  { t:'\\frac{\\partial L}{\\partial \\hat{y}} = \\frac{\\hat{y}-y}{\\hat{y}(1-\\hat{y})}', note:'Factor 1: derivative of cross-entropy w.r.t. the prediction.' },
  { t:'\\frac{\\partial \\hat{y}}{\\partial z} = \\sigma(z)(1-\\sigma(z)) = \\hat{y}(1-\\hat{y})', note:'Factor 2: the sigmoid\u2019s own derivative \u2014 the key identity.' },
  { t:'\\frac{\\partial z}{\\partial w_i} = x_i', note:'Factor 3: the score is linear in the weights.' },
  { t:'\\frac{\\hat{y}-y}{\\hat{y}(1-\\hat{y})} \\cdot \\hat{y}(1-\\hat{y}) \\cdot x_i', note:'Multiply. The denominator and factor 2 are identical.' },
  { t:'\\frac{\\partial L}{\\partial w_i} = (\\hat{y}-y)\\,x_i', note:'Everything cancels. Prediction error times feature. Done.' }
];
let _lrDeriv = { step:0 };
function lrDerivInit(){
  _lrDeriv={step:0};
  const host=lrEl('lr-deriv'); if(!host)return;
  host.innerHTML =
    '<div id="lr-deriv-body" style="min-height:180px;display:flex;flex-direction:column;gap:.7rem;margin-bottom:1rem"></div>'+
    '<div class="lr-ctl" style="justify-content:center"><button class="lr-btn" onclick="lrDerivStep(-1)">\u2190 back</button><button class="lr-btn solid" onclick="lrDerivStep(1)">reveal next \u2192</button><button class="lr-btn" onclick="lrDerivReset()">reset</button></div>'+
    '<div style="margin-top:1rem;padding:1rem;background:var(--surface2);border-radius:9px;border:1px solid var(--border)"><div class="lr-card-t">The sigmoid derivative</div><div id="lr-deriv-inset" style="text-align:center;margin-top:.5rem"></div></div>';
  lrDerivRender();
}
function lrDerivReset(){ _lrDeriv.step=0; lrDerivRender(); }
function lrDerivStep(d){ _lrDeriv.step=lrClamp(_lrDeriv.step+d,0,DERIV_STEPS.length-1); lrDerivRender(); }
function lrDerivRender(){
  const host=lrEl('lr-deriv-body'); if(!host)return;
  host.innerHTML=DERIV_STEPS.slice(0,_lrDeriv.step+1).map((s,i)=>{
    const on=i===_lrDeriv.step;
    return '<div style="padding:.7rem 1rem;border-radius:8px;background:'+(on?'var(--surface3)':'transparent')+';border:1px solid '+(on?LRC.acc:'transparent')+';transition:all .25s">'+
      '<div style="text-align:center;color:'+(on?LRC.text:LRC.muted)+'">\\['+s.t+'\\]</div>'+
      (on?'<div style="font-family:var(--mono);font-size:.7rem;color:'+LRC.acc+';text-align:center;margin-top:.4rem">'+s.note+'</div>':'')+
    '</div>';
  }).join('');
  const inset=lrEl('lr-deriv-inset');
  if(inset){ inset.innerHTML='\\[\\sigma\'(z) = \\sigma(z)\\,(1-\\sigma(z))\\]'; }
  if(window.renderMath){ const sv=lrEl('lr-deriv'); if(sv)renderMath(sv); }
}

// ───────────────────────────────────────────────────────────
// 4.16 — End-to-end pipeline
// ───────────────────────────────────────────────────────────
const RECAP_REVIEWS = [
  { t:'brilliant, funny, and genuinely moving', y:1 },
  { t:'a dull, lifeless slog from start to end', y:0 },
  { t:'not bad, but i wanted to love it more', y:0 },
  { t:'the best film i have seen all year', y:1 }
];
let _lrRecap = { ri:0, w:[0.8,-0.9,0.5,0.3], b:0.0, stage:0, anim:null, loss:[] };
const RECAP_SEC = ['\u00a74.1 features','\u00a74.3 score','\u00a74.2 sigmoid','\u00a74.5 loss','\u00a74.6 gradient','\u00a74.4 update'];
function lrRecapFeats(t){
  const pos=(t.match(/brilliant|funny|moving|best|love|great|good/g)||[]).length;
  const neg=(t.match(/dull|lifeless|slog|bad|boring|worst/g)||[]).length;
  const neg2=/not|n't/.test(t)?1:0;
  const len=+Math.log(t.split(' ').length).toFixed(2);
  return [pos,neg,neg2,len];
}
function lrRecapInit(){
  _lrRecap={ri:0,w:[0.8,-0.9,0.5,0.3],b:0.0,stage:0,anim:null,loss:[]};
  const host=lrEl('lr-recap'); if(!host)return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem"><button class="lr-btn solid" id="lr-recap-run" onclick="lrRecapRun()">\u25b6 Run one review through</button><button class="lr-btn" onclick="lrRecapTrain()">\u26a1 train on all 4</button><button class="lr-btn" onclick="lrRecapInit()">reset weights</button></div>'+
    '<canvas id="lr-recap-cv" style="width:100%;display:block"></canvas>'+
    '<div id="lr-recap-loss" class="lr-readout" style="margin-top:.6rem;justify-content:center"></div>'+
    '<div class="lr-note">Each stage is labelled with the section that built it. Train on all four reviews and watch the loss come down as the weights learn.</div>';
  lrRecapDraw();
}
function lrRecapCompute(ri){
  const r=RECAP_REVIEWS[ri]; const x=lrRecapFeats(r.t);
  let z=_lrRecap.b; for(let i=0;i<4;i++)z+=_lrRecap.w[i]*x[i];
  const yhat=lrSig(z); const loss=-(r.y*Math.log(yhat)+(1-r.y)*Math.log(1-yhat));
  return {x,z,yhat,loss,y:r.y};
}
function lrRecapRun(){
  const r=lrRecapCompute(_lrRecap.ri);
  // one gradient step
  const err=r.yhat-r.y;
  for(let i=0;i<4;i++)_lrRecap.w[i]-=0.2*err*r.x[i];
  _lrRecap.b-=0.2*err;
  _lrRecap.loss.push(r.loss); if(_lrRecap.loss.length>40)_lrRecap.loss.shift();
  _lrRecap.ri=(_lrRecap.ri+1)%RECAP_REVIEWS.length;
  lrRecapDraw();
}
function lrRecapTrain(){
  if(_lrRecap.anim)clearInterval(_lrRecap.anim);
  let n=0;
  _lrRecap.anim=lrTimer(()=>{ lrRecapRun(); n++; if(n>60){clearInterval(_lrRecap.anim);_lrRecap.anim=null;} },160);
}
function lrRecapDraw(){
  const c=lrCanvas('lr-recap-cv',260); if(!c)return;
  const {ctx,W,H}=c;
  const r=lrRecapCompute(_lrRecap.ri);
  const stages=[
    {lab:'REVIEW',val:'\u201c'+RECAP_REVIEWS[_lrRecap.ri].t.slice(0,22)+'\u2026\u201d',col:LRC.muted},
    {lab:RECAP_SEC[0],val:'x=['+r.x.map(v=>v.toFixed(1)).join(',')+']',col:LRC.acc},
    {lab:RECAP_SEC[1],val:'z='+r.z.toFixed(2),col:LRC.pur},
    {lab:RECAP_SEC[2],val:'\u0177='+r.yhat.toFixed(2),col:LRC.acc},
    {lab:RECAP_SEC[3],val:'L='+r.loss.toFixed(2),col:LRC.red},
    {lab:RECAP_SEC[4],val:'(\u0177\u2212y)='+(r.yhat-r.y).toFixed(2),col:LRC.grn},
    {lab:RECAP_SEC[5],val:'w \u2190 w \u2212 \u03b7g',col:LRC.grn}
  ];
  const n=stages.length, bw=W/n;
  stages.forEach((s,i)=>{
    const cx=bw*i+bw/2, cy=H/2;
    if(i<n-1){ ctx.strokeStyle=LRC.grid; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(cx+bw*0.32,cy); ctx.lineTo(cx+bw*0.68,cy); ctx.stroke();
      ctx.fillStyle=LRC.grid; ctx.beginPath(); ctx.moveTo(cx+bw*0.68,cy); ctx.lineTo(cx+bw*0.6,cy-4); ctx.lineTo(cx+bw*0.6,cy+4); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle=LRC.s2; ctx.strokeStyle=s.col; ctx.lineWidth=1.5;
    const bw2=bw*0.62, bh=54;
    ctx.beginPath(); ctx.roundRect(cx-bw2/2,cy-bh/2,bw2,bh,7); ctx.fill(); ctx.stroke();
    ctx.fillStyle=s.col; ctx.font='8px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(s.lab,cx,cy-bh/2+12);
    ctx.fillStyle=LRC.text; ctx.font='9px IBM Plex Mono, monospace';
    const words=s.val.split(' '); let yy=cy-2; words.forEach(w=>{ ctx.fillText(w,cx,yy); yy+=11; });
  });
  ctx.textAlign='start';
  // loss sparkline
  const lossHost=lrEl('lr-recap-loss');
  if(lossHost){ const last=_lrRecap.loss.length?_lrRecap.loss[_lrRecap.loss.length-1]:r.loss; const avg=_lrRecap.loss.length?_lrRecap.loss.reduce((a,b)=>a+b)/_lrRecap.loss.length:r.loss;
    lossHost.innerHTML=lrStat('current loss',last.toFixed(3),LRC.red)+lrStat('steps taken',_lrRecap.loss.length,LRC.muted); }
}




// ═══════════════════════════════════════════════════════════
// FULL-SCREEN GRADIENT DESCENT EXPLORER
// ═══════════════════════════════════════════════════════════
const GDE_SURFACES = {
  bowl: {
    name: 'Convex Bowl',
    sub: 'logistic regression loss',
    loss: (x,y) => 0.5*(x*x + 1.4*y*y),
    grad: (x,y) => [x, 1.4*y],
    opt: [0,0],
    optLab: 'global minimum',
    range: 3.2,
    desc: 'This is the loss surface of logistic regression. It is convex, meaning it has exactly one minimum and no false valleys. Gradient descent is guaranteed to find the global best from any starting point. Watch how the ball always rolls straight to the bottom.'
  },
  saddle: {
    name: 'Saddle Point',
    sub: 'the deep learning challenge',
    loss: (x,y) => 0.12*(x*x - y*y) + 0.6,
    grad: (x,y) => [0.24*x, -0.24*y],
    opt: [0,0],
    optLab: 'saddle point \u2014 gradient zero, not a minimum',
    range: 3.4,
    desc: 'A saddle point curves up in one direction and down in another, like a horse saddle. The gradient is zero at the center even though it is not a minimum. These are everywhere in neural network loss surfaces, and they are why naive gradient descent can stall. Modern optimizers add momentum to escape them.'
  },
  ravine: {
    name: 'Narrow Ravine',
    sub: 'why learning rates matter',
    loss: (x,y) => 0.04*x*x + 1.6*y*y,
    grad: (x,y) => [0.08*x, 3.2*y],
    opt: [0,0],
    optLab: 'global minimum, at the end of a long flat floor',
    range: 3.4,
    desc: 'A ravine is steep in one direction and nearly flat in another. With a high learning rate the ball bounces wildly across the steep walls while barely moving along the flat valley floor. This is one of the most common real-world training problems, and it motivated adaptive optimizers like Adam.'
  },
  bumpy: {
    name: 'Many Minima',
    sub: 'non-convex landscape',
    loss: (x,y) => 0.6 + 0.18*(x*x+y*y) - 0.7*Math.cos(2.2*x)*Math.cos(2.2*y),
    grad: (x,y) => [0.36*x + 1.54*Math.sin(2.2*x)*Math.cos(2.2*y), 0.36*y + 1.54*Math.cos(2.2*x)*Math.sin(2.2*y)],
    opt: [0,0],
    optLab: 'global minimum \u2014 only one basin of many',
    range: 3.2,
    desc: 'A non-convex surface with many local minima and bumps. Where the ball ends up depends entirely on where it started. This is the true nature of neural network optimization, and it is why the same model trained twice can land in different places. Hit reset a few times and watch it settle into different valleys.'
  }
};

let gde = {
  key: 'bowl', rotX: -0.55, rotZ: 0.7, zoom: 1, dragging: false, lastX: 0, lastY: 0,
  w1: 0, w2: 0, bias: 0, path: [], step: 0, lr: 0.1, anim: null, rotAnim: null
};

function openGDExplorer() {
  const ex = document.getElementById('gd-explorer');
  if (!ex) return;
  ex.style.display = 'block';
  gde.bias = 0;
  const bSlider = document.getElementById('gde-b');
  if (bSlider) bSlider.value = 0;
  const bVal = document.getElementById('gde-bval');
  if (bVal) bVal.textContent = '0.0';
  gdeBuildSurfaceList();
  gdeSelectSurface('bowl');
  gdeBindCanvas();
  // initialize the N-dim info text without selecting it
  const ndInfo = document.getElementById('gde-nd-info');
  if (ndInfo && !ndInfo.innerHTML) ndInfo.innerHTML = 'Drag the slider to choose how many weight dimensions the loss lives in, then watch it project down to a viewable 3D surface.';
  setTimeout(gdeResize, 50);
}
function closeGDExplorer() {
  const ex = document.getElementById('gd-explorer');
  if (ex) ex.style.display = 'none';
  if (gde.anim) { clearInterval(gde.anim); gde.anim = null; }
  if (gde.rotAnim) { cancelAnimationFrame(gde.rotAnim); gde.rotAnim = null; }
}

function gdeBuildSurfaceList() {
  const wrap = document.getElementById('gde-surfaces');
  if (!wrap) return;
  wrap.innerHTML = Object.keys(GDE_SURFACES).map(k=>{
    const s = GDE_SURFACES[k];
    const active = k === gde.key;
    return `<button onclick="gdeSelectSurface('${k}')" style="text-align:left;background:${active?'rgba(77,227,255,0.1)':'var(--surface2)'};border:1px solid ${active?'var(--accent)':'var(--border2)'};border-radius:10px;padding:.7rem .85rem;cursor:pointer">
      <div style="font-family:var(--mono);font-size:.82rem;color:${active?'var(--accent)':'var(--text)'};font-weight:${active?'700':'400'}">${s.name}</div>
      <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:2px">${s.sub}</div>
    </button>`;
  }).join('');
}

function gdeSelectSurface(key) {
  gde.key = key;
  gdeBuildSurfaceList();
  const s = GDE_SURFACES[key];
  const d = document.getElementById('gde-description');
  if (d) d.textContent = s.desc;
  gdeReset();
}

function gdeResize() {
  const cv = document.getElementById('gde-canvas');
  if (!cv) return;
  const rect = cv.getBoundingClientRect();
  cv.width = rect.width;
  cv.height = rect.height;
  gdeDraw();
}

function gdeBindCanvas() {
  const cv = document.getElementById('gde-canvas');
  if (!cv || cv._bound) return;
  cv._bound = true;
  const getXY = e => { const r = cv.getBoundingClientRect(); const t = e.touches?e.touches[0]:e; return [t.clientX-r.left, t.clientY-r.top]; };
  cv.addEventListener('mousedown', e=>{ gde.dragging=true; [gde.lastX,gde.lastY]=getXY(e); cv.style.cursor='grabbing'; });
  window.addEventListener('mousemove', e=>{ if(!gde.dragging)return; const [x,y]=getXY(e); gde.rotZ+=(x-gde.lastX)*0.008; gde.rotX+=(y-gde.lastY)*0.008; gde.rotX=Math.max(-1.5,Math.min(-0.02,gde.rotX)); gde.lastX=x; gde.lastY=y; gdeDraw(); });
  window.addEventListener('mouseup', ()=>{ gde.dragging=false; cv.style.cursor='grab'; });
  cv.addEventListener('wheel', e=>{ e.preventDefault(); gde.zoom*=e.deltaY>0?0.93:1.07; gde.zoom=Math.max(0.5,Math.min(2.5,gde.zoom)); gdeDraw(); }, {passive:false});
  cv.addEventListener('touchstart', e=>{ gde.dragging=true; [gde.lastX,gde.lastY]=getXY(e); e.preventDefault(); }, {passive:false});
  cv.addEventListener('touchmove', e=>{ if(!gde.dragging)return; const [x,y]=getXY(e); gde.rotZ+=(x-gde.lastX)*0.008; gde.rotX+=(y-gde.lastY)*0.008; gde.rotX=Math.max(-1.5,Math.min(-0.02,gde.rotX)); gde.lastX=x; gde.lastY=y; gdeDraw(); e.preventDefault(); }, {passive:false});
  cv.addEventListener('touchend', ()=>{ gde.dragging=false; });
  window.addEventListener('resize', ()=>{ if(document.getElementById('gd-explorer').style.display!=='none') gdeResize(); });
}

function gdeProject(x, y, z) {
  const s = GDE_SURFACES[gde.key];
  const range = s.range;
  let px = x/range, py = y/range, pz = -(z/4) + 0.4;
  const cz=Math.cos(gde.rotZ), sz=Math.sin(gde.rotZ);
  let x1=px*cz - py*sz, y1=px*sz + py*cz, z1=pz;
  const cx=Math.cos(gde.rotX), sx=Math.sin(gde.rotX);
  let y2=y1*cx - z1*sx, z2=y1*sx + z1*cx, x2=x1;
  const cv = document.getElementById('gde-canvas');
  const W=cv.width, H=cv.height, scale=Math.min(W,H)*0.42*gde.zoom;
  return [ W/2 + x2*scale, H/2 + y2*scale, z2 ];
}

// bias shifts the surface optimum along the w1=w2 diagonal
function gdeBiasedLoss(x, y) {
  const s = GDE_SURFACES[gde.key];
  return s.loss(x - gde.bias, y - gde.bias);
}
function gdeBiasedGrad(x, y) {
  const s = GDE_SURFACES[gde.key];
  return s.grad(x - gde.bias, y - gde.bias);
}
function gdeBiasedOpt() {
  const s = GDE_SURFACES[gde.key];
  return [s.opt[0] + gde.bias, s.opt[1] + gde.bias];
}

function gdeDraw() {
  const cv = document.getElementById('gde-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const s = GDE_SURFACES[gde.key];
  const range = s.range, N = 26;
  // surface quads
  const quads = [];
  for (let i=0;i<N;i++){
    for (let j=0;j<N;j++){
      const xa=-range+i/N*2*range, xb=-range+(i+1)/N*2*range;
      const ya=-range+j/N*2*range, yb=-range+(j+1)/N*2*range;
      const corners=[[xa,ya],[xb,ya],[xb,yb],[xa,yb]];
      const pts=corners.map(([a,b])=>gdeProject(a,b,gdeBiasedLoss(a,b)));
      const avgZ=pts.reduce((q,p)=>q+p[2],0)/4;
      const avgL=(gdeBiasedLoss(xa,ya)+gdeBiasedLoss(xb,yb))/2;
      quads.push({pts,avgZ,avgL});
    }
  }
  quads.sort((a,b)=>a.avgZ-b.avgZ);
  let maxL=0; for(let a=-range;a<=range;a+=range/4) for(let b=-range;b<=range;b+=range/4) maxL=Math.max(maxL,gdeBiasedLoss(a,b));
  quads.forEach(q=>{
    const t=Math.min(1,q.avgL/maxL);
    const r=Math.round(18+t*210), g=Math.round(70+t*30), b=Math.round(130+t*90);
    ctx.fillStyle=`rgba(${r},${g},${b},0.85)`;
    ctx.strokeStyle='rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.moveTo(q.pts[0][0],q.pts[0][1]);
    for(let k=1;k<4;k++) ctx.lineTo(q.pts[k][0],q.pts[k][1]);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  });
  gdeDrawAxes(ctx, range);
  // descent path
  if (gde.path.length>1){
    ctx.strokeStyle='#4DE3FF'; ctx.lineWidth=3; ctx.beginPath();
    gde.path.forEach((p,idx)=>{
      const pr=gdeProject(p[0],p[1],gdeBiasedLoss(p[0],p[1])+0.06);
      if(idx===0) ctx.moveTo(pr[0],pr[1]); else ctx.lineTo(pr[0],pr[1]);
    });
    ctx.stroke();
    gde.path.forEach(p=>{
      const pr=gdeProject(p[0],p[1],gdeBiasedLoss(p[0],p[1])+0.06);
      ctx.fillStyle='rgba(77,227,255,0.5)';
      ctx.beginPath(); ctx.arc(pr[0],pr[1],2.5,0,2*Math.PI); ctx.fill();
    });
  }
  // optimum marker
  const bOpt=gdeBiasedOpt();
  const optPr=gdeProject(bOpt[0],bOpt[1],gdeBiasedLoss(bOpt[0],bOpt[1])+0.04);
  ctx.fillStyle='rgba(61,220,132,0.6)';
  ctx.beginPath(); ctx.arc(optPr[0],optPr[1],5,0,2*Math.PI); ctx.fill();
  if(s.optLab){
    ctx.fillStyle='rgba(61,220,132,0.85)';
    ctx.font='11px ui-monospace,SFMono-Regular,Menlo,monospace';
    ctx.textAlign='left'; ctx.textBaseline='middle';
    ctx.fillText(s.optLab, Math.min(optPr[0]+10, W-8-ctx.measureText(s.optLab).width), optPr[1]-10);
    ctx.textAlign='start'; ctx.textBaseline='alphabetic';
  }
  // current ball
  const pr=gdeProject(gde.w1,gde.w2,gdeBiasedLoss(gde.w1,gde.w2)+0.1);
  ctx.fillStyle='#FF5F8E';
  ctx.beginPath(); ctx.arc(pr[0],pr[1],9,0,2*Math.PI); ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
}

function gdeDrawAxes(ctx, range) {
  const s = GDE_SURFACES[gde.key];
  // origin at corner of the grid floor
  const o = gdeProject(-range, -range, 0);
  const xEnd = gdeProject(range, -range, 0);
  const yEnd = gdeProject(-range, range, 0);
  const zEnd = gdeProject(-range, -range, s.loss(-range,-range)+1.5);
  // X axis (w1) - red
  ctx.strokeStyle='rgba(255,95,142,0.7)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(o[0],o[1]); ctx.lineTo(xEnd[0],xEnd[1]); ctx.stroke();
  // Y axis (w2) - cyan
  ctx.strokeStyle='rgba(77,227,255,0.7)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(o[0],o[1]); ctx.lineTo(yEnd[0],yEnd[1]); ctx.stroke();
  // Z axis (loss) - purple
  ctx.strokeStyle='rgba(167,139,250,0.7)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(o[0],o[1]); ctx.lineTo(zEnd[0],zEnd[1]); ctx.stroke();
  // labels
  ctx.font='bold 14px monospace';
  ctx.fillStyle='#FF5F8E'; ctx.fillText('w\u2081', xEnd[0]+6, xEnd[1]+4);
  ctx.fillStyle='#4DE3FF'; ctx.fillText('w\u2082', yEnd[0]+6, yEnd[1]+4);
  ctx.fillStyle='#a78bfa'; ctx.fillText('Loss', zEnd[0]+6, zEnd[1]);
}

function gdeReset() {
  const s = GDE_SURFACES[gde.key];
  gde.w1 = (Math.random()-0.5)*2*s.range*0.8;
  gde.w2 = (Math.random()-0.5)*2*s.range*0.8;
  gde.path = [[gde.w1, gde.w2]];
  gde.step = 0;
  if (gde.anim) { clearInterval(gde.anim); gde.anim=null; }
  const pb=document.getElementById('gde-play'); if(pb) pb.innerHTML='&#9654; Play';
  gdeUpdateStats();
  gdeDraw();
}
function gdeUpdateStats() {
  const s = GDE_SURFACES[gde.key];
  const g = gdeBiasedGrad(gde.w1, gde.w2);
  const se=document.getElementById('gde-step'); if(se) se.textContent=gde.step;
  const le=document.getElementById('gde-loss'); if(le) le.textContent=gdeBiasedLoss(gde.w1,gde.w2).toFixed(3);
  const we=document.getElementById('gde-w'); if(we) we.textContent=gde.w1.toFixed(2)+', '+gde.w2.toFixed(2);
  const bs=document.getElementById('gde-bstat'); if(bs) bs.textContent=gde.bias.toFixed(1);
  const ge=document.getElementById('gde-grad'); if(ge) ge.textContent=g[0].toFixed(2)+', '+g[1].toFixed(2);
}
function gdeLrUpdate() {
  gde.lr = parseFloat(document.getElementById('gde-lr').value);
  document.getElementById('gde-lrval').textContent=gde.lr.toFixed(2);
}
function gdeBiasUpdate() {
  gde.bias = parseFloat(document.getElementById('gde-b').value);
  const bv = document.getElementById('gde-bval');
  if (bv) bv.textContent = gde.bias.toFixed(1);
  gdeDraw();
}
function gdeStep() {
  const s = GDE_SURFACES[gde.key];
  const g = gdeBiasedGrad(gde.w1, gde.w2);
  gde.w1 -= gde.lr*g[0];
  gde.w2 -= gde.lr*g[1];
  // clamp to avoid flying off
  gde.w1=Math.max(-s.range*1.3,Math.min(s.range*1.3,gde.w1));
  gde.w2=Math.max(-s.range*1.3,Math.min(s.range*1.3,gde.w2));
  gde.path.push([gde.w1, gde.w2]);
  gde.step++;
  if (gde.path.length>140) gde.path.shift();
  gdeUpdateStats();
  gdeDraw();
}
function gdeStart() {
  const pb=document.getElementById('gde-play');
  if (gde.anim) { clearInterval(gde.anim); gde.anim=null; if(pb) pb.innerHTML='&#9654; Play'; return; }
  if(pb) pb.innerHTML='&#10073;&#10073; Pause';
  gde.anim=setInterval(()=>{
    gdeStep();
    const g=gdeBiasedGrad(gde.w1,gde.w2);
    if ((Math.abs(g[0])<0.002 && Math.abs(g[1])<0.002) || gde.step>200) {
      clearInterval(gde.anim); gde.anim=null; if(pb) pb.innerHTML='&#9654; Play';
    }
  }, 150);
}
function gdeAutoRotate() {
  const btn=document.getElementById('gde-rotate');
  if (gde.rotAnim) { cancelAnimationFrame(gde.rotAnim); gde.rotAnim=null; if(btn){btn.style.background='var(--surface2)';btn.style.color='var(--muted)';} return; }
  if(btn){btn.style.background='rgba(77,227,255,0.1)';btn.style.color='var(--accent)';}
  const spin=()=>{ gde.rotZ+=0.006; gdeDraw(); gde.rotAnim=requestAnimationFrame(spin); };
  spin();
}
function gdeTopView() {
  gde.rotX=-1.45; gde.rotZ=0; gdeDraw();
}



// ── CUSTOM FUNCTION PARSER (safe, no eval of arbitrary code) ──
function gdeParseExpr(expr) {
  const text=String(expr).toLowerCase();
  if(text.length>500) throw new Error('expression is too long');
  const tokens=[]; let at=0;
  while(at<text.length){
    if(/\s/.test(text[at])){at++;continue;}
    const part=text.slice(at);
    const number=part.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/);
    const word=part.match(/^[a-z]+/);
    const token=number ? number[0] : word ? word[0] : text[at];
    if(!number && !word && !'+-*/^(),'.includes(token)) throw new Error('unsupported character');
    tokens.push(token);at+=token.length;
  }
  if(!tokens.length || tokens.length>200) throw new Error('enter a shorter expression');
  let pos=0;
  const funcs={sin:Math.sin,cos:Math.cos,tan:Math.tan,exp:Math.exp,log:Math.log,sqrt:Math.sqrt,abs:Math.abs};
  function primary(){
    const t=tokens[pos++];
    if(t==='('){const f=add();if(tokens[pos++]!==')')throw new Error('missing closing parenthesis');return f;}
    if(t==='x')return (x,y)=>x;
    if(t==='y')return (x,y)=>y;
    if(t==='pi')return ()=>Math.PI;
    if(t==='e')return ()=>Math.E;
    if(Object.hasOwn(funcs,t)){
      if(tokens[pos++]!=='(')throw new Error(t+' needs parentheses');
      const f=add();if(tokens[pos++]!==')')throw new Error('missing closing parenthesis');
      return (x,y)=>funcs[t](f(x,y));
    }
    if(t!==undefined && /^(?:\d|\.)/.test(t)){const n=Number(t);if(Number.isFinite(n))return ()=>n;}
    throw new Error('expected a number, x, y, or a supported function');
  }
  function power(){let f=primary();if(tokens[pos]==='^'){pos++;const g=unary(),left=f;f=(x,y)=>Math.pow(left(x,y),g(x,y));}return f;}
  function unary(){if(tokens[pos]==='+'){pos++;return unary();}if(tokens[pos]==='-'){pos++;const f=unary();return(x,y)=>-f(x,y);}return power();}
  function multiply(){let f=unary();while(tokens[pos]==='*'||tokens[pos]==='/'){const op=tokens[pos++],g=unary(),left=f;f=op==='*'?(x,y)=>left(x,y)*g(x,y):(x,y)=>left(x,y)/g(x,y);}return f;}
  function add(){let f=multiply();while(tokens[pos]==='+'||tokens[pos]==='-'){const op=tokens[pos++],g=multiply(),left=f;f=op==='+'?(x,y)=>left(x,y)+g(x,y):(x,y)=>left(x,y)-g(x,y);}return f;}
  const f=add();
  if(pos!==tokens.length)throw new Error('unexpected token: '+tokens[pos]);
  if(!Number.isFinite(f(0.5,0.5)))throw new Error('expression is not finite at (0.5, 0.5)');
  return f;
}

// numerical gradient via finite differences
function gdeNumGrad(f, x, y) {
  const h = 1e-4;
  const dx = (f(x+h,y) - f(x-h,y))/(2*h);
  const dy = (f(x,y+h) - f(x,y-h))/(2*h);
  return [dx, dy];
}

function gdeApplyCustom() {
  const inp = document.getElementById('gde-custom-input');
  const err = document.getElementById('gde-custom-err');
  if (!inp) return;
  let f;
  try {
    f = gdeParseExpr(inp.value);
  } catch(e) {
    if (err) err.textContent = 'Could not parse that function. Check your syntax.';
    return;
  }
  if (err) err.textContent = '';
  // register as a temporary surface
  GDE_SURFACES.custom = {
    name: 'Custom: ' + inp.value,
    sub: 'your function',
    loss: (x,y) => { const v=f(x,y); return isFinite(v)?v:0; },
    grad: (x,y) => gdeNumGrad(f, x, y),
    opt: [0,0],
    optLab: 'origin (not necessarily this function\u2019s minimum)',
    range: 3.2,
    desc: 'This is your own function f(x,y) = ' + inp.value + '. Gradient descent uses a numerically estimated gradient (finite differences) to roll downhill. Note that for non-convex functions, where the ball lands depends on where it starts. Hit Reset to try different starting points.'
  };
  gde.key = 'custom';
  gdeBuildSurfaceList();
  const d = document.getElementById('gde-description');
  if (d) d.textContent = GDE_SURFACES.custom.desc;
  gdeReset();
}

// ── N-DIMENSIONAL PROJECTION ───────────────────────────────
// Demonstrates compressing an N-dim loss into a 3D-viewable slice.
// We build an N-dim quadratic bowl with random axis scales, then project
// to the 2 directions of highest curvature (like PCA picks top components).
let gdeNDim = { n: 2, scales: null, basis: null };

function gdeNdUpdate() {
  const n = parseInt(document.getElementById('gde-nd').value);
  gdeNDim.n = n;
  document.getElementById('gde-ndval').textContent = n;
  // build random positive curvatures for n dimensions
  gdeNDim.scales = [];
  for (let i=0;i<n;i++) gdeNDim.scales.push(0.3 + Math.random()*2.5);
  // sort descending so the top 2 are the steepest (most informative) directions
  gdeNDim.scales.sort((a,b)=>b-a);

  const info = document.getElementById('gde-nd-info');
  if (info) {
    const shown = gdeNDim.scales.slice(0,2).map(s=>s.toFixed(1)).join(', ');
    const hidden = n - 2;
    info.innerHTML = `A ${n}-dimensional loss bowl has ${n} weight axes. We keep the <span style="color:#a78bfa">2 steepest directions</span> (curvatures ${shown}) and draw loss as height. ` +
      (hidden>0 ? `The other <span style="color:var(--accent3)">${hidden} dimension${hidden>1?'s are':' is'}</span> dropped, the same bargain PCA strikes when it reduces ${n}D data to a viewable picture: keep two axes, discard the rest. The criterion differs, though. PCA keeps the directions of greatest variance, which for a bowl like this one would be the <em>flattest</em> directions, not the steepest.` : `With n=2 nothing is hidden: this is the full surface.`);
  }

  // register the projected surface using the top-2 curvatures
  const k1 = gdeNDim.scales[0], k2 = gdeNDim.scales[1] || gdeNDim.scales[0];
  // residual energy from hidden dims adds a constant floor (shows information loss)
  let residual = 0;
  for (let i=2;i<n;i++) residual += gdeNDim.scales[i]*0.04;
  GDE_SURFACES.ndim = {
    name: n + 'D \u2192 3D Projection',
    sub: 'top-2 components shown',
    loss: (x,y) => 0.5*(k1*x*x + k2*y*y) + residual,
    grad: (x,y) => [k1*x, k2*y],
    opt: [0,0],
    range: 3.0,
    desc: `You are looking at a ${n}-dimensional quadratic loss bowl, reduced to its two steepest axes and rendered as a 3D surface. The ${n>2?(n-2)+' hidden dimensions are not sitting at their own minima, and the loss they still carry shows up here as a constant floor under the visible surface. Slide the ball to the centre of this picture and the loss does not reach zero, because the axes you cannot see are still some distance from theirs.':'full surface is shown since n=2.'} This is the core trick behind visualizing any high-dimensional model: pick two directions, draw those, and keep in mind what the other axes are doing. Real networks have millions of dimensions; we only ever see their shadows.`
  };
  gde.key = 'ndim';
  gdeBuildSurfaceList();
  const d = document.getElementById('gde-description');
  if (d) d.textContent = GDE_SURFACES.ndim.desc;
  gdeReset();
}
