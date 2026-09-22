// ════════════════════════════════════════════════════════════
//  CHAPTER 8 · TRANSFORMERS
// ════════════════════════════════════════════════════════════

const TX_SEC = [
  {id:'tokenride',num:'8.0', title:'One Token Up the Stack', icon:'\u2191', desc:'The orientation ride: a token becomes a vector, climbs the residual stream floor by floor, and exits as a next-word distribution.', tags:['residual stream','end to end','orientation']},
  {id:'attn',    num:'8.1', title:'Attention',                 icon:'\u273B', desc:'How a token builds its meaning by attending to the other tokens around it.',          tags:['query/key/value','dot product','softmax']},
  {id:'block',   num:'8.2', title:'Transformer Blocks',        icon:'\u25A4', desc:'The residual stream: attention and feedforward layers adding into a running sum.',     tags:['residual stream','layer norm','feedforward']},
  {id:'parallel',num:'8.3', title:'Parallelizing with X',      icon:'\u25A6', desc:'The whole sequence at once as one matrix, and the masked QKᵀ score grid.',            tags:['QKᵀ matrix','causal mask','parallel']},
  {id:'inputenc',num:'8.4', title:'Token & Position',          icon:'\u2295', desc:'Building the input: a token embedding plus a positional embedding, added together.',   tags:['embedding','position','sinusoid']},
  {id:'lmhead',  num:'8.5', title:'Language Modeling Head',     icon:'\u2387', desc:'Turning the final vector into logits and a distribution, reusing the embedding matrix.', tags:['unembedding','weight tying','logits']},
  {id:'moresamp',num:'8.6', title:'More on Sampling',          icon:'\u2702', desc:'Trimming the distribution before sampling: top-k and nucleus top-p.',                  tags:['top-k','top-p','quality vs diversity']},
  {id:'txtrain', num:'8.7', title:'Training',                  icon:'\u2207', desc:'Why transformers train every position in parallel, with one loss per token.',         tags:['cross-entropy','parallel','batches']},
  {id:'scale',   num:'8.8', title:'Dealing with Scale',        icon:'\u29C9', desc:'Scaling laws, the KV cache, and low-rank finetuning with LoRA.',                      tags:['scaling laws','KV cache','LoRA']},
  {id:'interp',  num:'8.9', title:'Interpreting Transformers', icon:'\u26ED', desc:'Looking inside: induction heads that complete patterns, and the logit lens.',         tags:['induction heads','logit lens','circuits']},
  {id:'txfull',  num:'8.10',title:'The Whole Transformer',     icon:'\u2630', desc:'The full decoder stack end to end, embedding to next token. Expandable.',              tags:['full stack','residual stream','interactive']},
  {id:'txmodel', num:'8.11',title:'Build a Transformer',       icon:'\u25C9', desc:'A real attention forward pass you drive: set tokens, watch the heads attend live.',     tags:['interactive','real attention','forward pass']}
];

function buildTXOverview(){
  const cards = TX_SEC.map(s=>`
    <div class="sc-card" onclick="openTXSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Attention Is the Engine</div>
    <h1 class="lesson-h1">Transformers</h1>
    <p class="lesson-intro">A transformer uses attention to combine information across token positions. We will start with query-key dot products, then build attention heads, residual connections, feedforward layers, and the output head.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">Attention builds a contextual representation of each token as a weighted sum of the other tokens, weighted by query-key similarity.</div>
        <div class="ch-sum-item">A transformer block is a residual stream: attention and a feedforward network add their outputs to a running vector, with normalization applied around those sublayers.</div>
        <div class="ch-sum-item">Packing the sequence into one matrix X lets the whole thing run in parallel, with a causal mask hiding future tokens in the QKᵀ score grid.</div>
        <div class="ch-sum-item">The input is a token embedding plus a positional embedding; the output head reuses the embedding matrix transposed to produce logits.</div>
        <div class="ch-sum-item">Sampling can be sharpened with top-k or top-p, and the whole thing is trained in parallel with cross-entropy loss.</div>
        <div class="ch-sum-item">Scale is managed with scaling laws, the KV cache, and LoRA, and we can peer inside with induction heads and the logit lens.</div>
      </div>
    </div>`;
}

const TX_PAGES = {};
const TX_EQ = {};

// ── 8.0 ONE TOKEN UP THE STACK ─────────────────────────────
TX_PAGES.tokenride = `
<div class="lesson-chapter-label">Section 8.0</div>
<h1 class="lesson-h1">One Token Up the Stack</h1>
<p class="lesson-intro">Before taking any single component apart, it helps to see the whole path once. A token enters at the bottom as an id and becomes a vector. That vector then passes up through a stack of transformer blocks along what is called the <strong>residual stream</strong>. At each block, a module reads the current vector and adds its own contribution to it. At the top, the vector is unembedded and softmaxed into a distribution over the next word. Every section that follows is a closer look at one stage of that path.</p>

<h2 class="lesson-h2">The Whole Path in One Line</h2>
<div class="lesson-math" id="tx-ride-eq">\\[x = \\mathbf{E}[\\mathrm{id}] + \\mathbf{P}[\\mathrm{pos}] \\;\\longrightarrow\\; h^{1} \\longrightarrow \\cdots \\longrightarrow h^{L} \\;\\longrightarrow\\; u = h^{L}\\mathbf{E}^{\\top} \\;\\longrightarrow\\; y = \\mathrm{softmax}(u)\\]</div>
<p class="lesson-p">Pick a token and press play. The colored strip is the token's running vector; it changes as normalization, attention, and feedforward computations transform or update the representation. Then zoom out: every position in the context runs through the same stack in parallel, each producing its own next-token prediction, and attention is the only module that passes information between positions.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Residual-Stream Elevator</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
      <span style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">rider:</span>
      <span id="ride-chips" style="display:flex;gap:6px;flex-wrap:wrap"></span>
      <button onclick="ridePlay()" id="ride-play" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.45rem 1rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer;margin-left:auto">&#9654; Ride</button>
      <button onclick="rideZoom()" id="ride-zoom" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.45rem 1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">Zoom out</button>
    </div>
    <canvas id="ride-canvas" width="640" height="380" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="ride-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;text-align:center;min-height:2rem"></div>
  </div>
</div>

<p class="lesson-p">Keep this structure in mind. Section 8.1 covers attention, 8.2 walks through a full block, 8.4 covers the input, and 8.5 the output. The residual stream is what everything else attaches to.</p>

<div class="quiz-block" id="qtx-ride"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In the zoomed-out view, why do the elevators need sideways connections at all?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qtx-ride','Correct. Attention is the only module that lets one token read from the others; without it, each position would climb in total isolation.')">Attention lets each token pull in information from the other positions</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-ride','The feedforward layer acts on each stream alone; it never reaches sideways.')">The feedforward layers share weights sideways</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-ride','Positions are injected once at the bottom, not passed between shafts.')">To pass positional embeddings between tokens</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-ride','The softmax happens independently at the top of each shaft.')">To share one softmax across all positions</button>
</div><div class="quiz-explain" id="qtx-ride-explain"></div></div>`;

// ── 8.1 ATTENTION ──────────────────────────────────────────
TX_PAGES.attn = `
<div class="lesson-chapter-label">Section 8.1</div>
<h1 class="lesson-h1">Attention</h1>
<p class="lesson-intro">A static embedding gives a word the same starting vector in every context. Attention lets a token combine information from other positions, helping the network build a context-sensitive representation.</p>

<h2 class="lesson-h2">The Problem: Meaning Depends on Context</h2>
<p class="lesson-p">Read these two sentences: <em>The ladder did not reach the window because it was too short</em>, and <em>The ladder did not reach the window because it was too high</em>. The word <em>it</em> points to the ladder in the first and the window in the second. Nothing in the first eight words differs; only the final adjective decides. To represent <em>it</em> correctly, the model must look back and pull meaning from the right earlier word. Attention is how it does that: when building the representation for <em>it</em>, the model attends most strongly to <em>ladder</em> and <em>window</em>, the two candidates it might be referring to.</p>
<p class="lesson-p">In a causal decoder, the representation at <em>it</em> cannot use an adjective that comes later. It therefore sees the same prefix in both examples, although that does not require equal scores for the two candidates. At the adjective’s position, the model can use both the adjective and the preceding sentence. Compare the two query positions below.</p>

<h2 class="lesson-h2">Attention as a Weighted Sum</h2>
<p class="lesson-p">Attention is a weighted sum of the earlier tokens. The output for token <em>i</em> is a blend of all the tokens up to and including <em>i</em>, where the weight on each token says how much it should contribute.</p>
<div class="lesson-math" id="tx-attn-simple">\\[a_i = \\sum_{j \\le i} \\alpha_{ij}\\, x_j\\]</div>
<p class="lesson-p">How do we set the weights? By similarity. We compare the current token to each earlier token with a dot product, which is large when two vectors point the same way, then normalize the scores with a softmax so they form a clean distribution.</p>
<div class="lesson-math" id="tx-attn-score">\\[\\mathrm{score}(x_i, x_j) = x_i \\cdot x_j\\]</div>
<div class="lesson-math" id="tx-attn-alpha">\\[\\alpha_{ij} = \\mathrm{softmax}(\\mathrm{score}(x_i, x_j)) \\quad \\forall\\, j \\le i\\]</div>
<p class="lesson-p">Pick a query token below and watch it score every earlier token by similarity, soften those scores into attention weights, and blend the earlier tokens into a new contextual vector.</p>

<div class="viz-container" id="attn-host">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Self-Attention Weights</span><button class="viz-fs-btn" onclick="vizToggleFull('attn-host')" style="margin-left:auto;background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:6px;padding:.3rem .65rem;font-family:var(--mono);font-size:.62rem;cursor:pointer">&#10530; Full screen</button></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:.9rem;align-items:center">
      <span style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">ending:</span>
      <button class="attn-ctx-btn" data-ctx="short" onclick="attnSetContext('short')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">&hellip;it was too short</button>
      <button class="attn-ctx-btn" data-ctx="high" onclick="attnSetContext('high')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">&hellip;it was too high</button>
      <button class="attn-ctx-btn" data-ctx="open" onclick="attnSetContext('open')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">stop at &ldquo;it&rdquo; (unresolved)</button>
    </div>
    <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.7rem">Click a token to make it the query</div>
    <div id="attn-tokens" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:1.2rem"></div>
    <canvas id="attn-canvas" width="600" height="220" style="width:100%;max-width:600px;display:block;margin:0 auto"></canvas>
    <div id="attn-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;text-align:center;min-height:2rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Query, Key, Value</h2>
<p class="lesson-p">Real attention adds a refinement. Each token plays three roles, and gets a distinct vector for each. As the <strong>query</strong>, it is the current token doing the looking. As a <strong>key</strong>, it is an earlier token being compared against. As a <strong>value</strong>, it is the content that actually gets summed up. Three weight matrices project the token into these three roles.</p>
<div class="lesson-math" id="tx-attn-qkv">\\[q_i = x_i W^Q, \\qquad k_j = x_j W^K, \\qquad v_j = x_j W^V\\]</div>
<p class="lesson-p">Now the similarity score is the query dotted with the key, divided by the square root of the key dimension to keep the numbers from blowing up. The softmax weights then multiply the value vectors, and a final output matrix reshapes the result.</p>
<div class="lesson-math" id="tx-attn-scaled">\\[\\mathrm{score}(x_i, x_j) = \\dfrac{q_i \\cdot k_j}{\\sqrt{d_k}}\\]</div>
<div class="lesson-math" id="tx-attn-head">\\[\\mathrm{head}_i = \\sum_{j \\le i} \\alpha_{ij}\\, v_j, \\qquad a_i = \\mathrm{head}_i\\, W^O\\]</div>
<p class="lesson-p">One head can only track one kind of relationship. So transformers run several <strong>heads</strong> in parallel, each with its own query, key, and value matrices, each free to attend for a different reason: one head for syntax, another for coreference, another for some pattern we may never name. Their outputs are concatenated and projected back down.</p>
<div class="lesson-math" id="tx-attn-multi">\\[a_i = (\\mathrm{head}_1 \\oplus \\mathrm{head}_2 \\oplus \\cdots \\oplus \\mathrm{head}_A)\\, W^O\\]</div>

<h2 class="lesson-h2">The Computation, One Stage at a Time</h2>
<p class="lesson-p">The equations above compress eight separate operations into three lines. The walkthrough below separates them again, computing the real attention output for the third token of a three-token sequence with every number visible. Step through it: the inputs, the three projections, the raw scores, the division by &radic;d<sub>k</sub>, the softmax, the weighted values, the sum, and the final W<sup>O</sup> projection. There is nothing to memorize here; the point is to see where each number comes from.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The 8-Stage Attention Assembly Line</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:1rem">
      <button onclick="qkvStep(-1)" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">&#8592; Back</button>
      <button onclick="qkvStep(1)" id="qkv-next" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Next stage &#8594;</button>
      <span id="qkv-stage" style="font-family:var(--mono);font-size:.72rem;color:var(--accent)">stage 1 / 8</span>
      <label style="font-family:var(--mono);font-size:.66rem;color:var(--muted);display:flex;align-items:center;gap:6px;margin-left:auto"><input type="checkbox" id="qkv-noscale" onchange="qkvDraw()"> pretend d<sub>k</sub> is large (skip &radic;d<sub>k</sub>)</label>
    </div>
    <canvas id="qkv-canvas" width="640" height="330" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="qkv-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;text-align:center;min-height:2.6rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Watching Heads Specialize</h2>
<p class="lesson-p">Why run several heads instead of one bigger one? Because language holds several kinds of relationship at once, and one softmax can only concentrate in one place. Below, four heads read the same sentence, each drawn in its own color. Toggle them and watch the concatenated output assemble from their separate contributions.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Four Heads, Four Jobs</span></div>
  <div class="viz-body">
    <div id="mh-toggles" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1rem"></div>
    <canvas id="mh-canvas" width="640" height="260" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div style="font-family:var(--mono);font-size:.6rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center">Honest caveat: real heads are rarely this cleanly labeled. Interpretable jobs like these do show up, but most heads learn mixed, unnamed patterns. The point is the architecture: parallel heads, each free to attend for its own reason.</div>
  </div>
</div>

<div class="quiz-block" id="qtx-attn"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In a single attention head, what determines how much an earlier token contributes to the current token's output?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qtx-attn','Correct. The weight is the softmax of the scaled dot product between the current token\\'s query and the earlier token\\'s key.')">The softmax of the query-key dot product</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-attn','Position matters only through positional embeddings, not directly in the attention weight.')">Its absolute position in the sentence</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-attn','The value vector is what gets summed, but the weight comes from query and key.')">The size of its value vector</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-attn','All tokens are not weighted equally; that is the whole point of attention.')">Every token contributes equally</button>
</div><div class="quiz-explain" id="qtx-attn-explain"></div></div>`;

// ── 8.2 TRANSFORMER BLOCKS ─────────────────────────────────
TX_PAGES.block = `
<div class="lesson-chapter-label">Section 8.2</div>
<h1 class="lesson-h1">Transformer Blocks</h1>
<p class="lesson-intro">A transformer block combines attention, a feedforward network, normalization, and residual connections. Track the residual stream: the running vector for each token, to which the attention and feedforward outputs are added.</p>

<h2 class="lesson-h2">The Residual Stream</h2>
<p class="lesson-p">Each token carries a running vector up through the block. It starts as the input embedding. A layer norm and an attention layer read it, and their output is added back. Then another layer norm and a feedforward network read the updated vector, and their output is added back again. Nothing overwrites the stream; everything contributes to it. This additive design is what lets gradients flow cleanly through very deep stacks.</p>
<div class="lesson-math" id="tx-block-eqs1">\\[t^1_i = \\mathrm{LayerNorm}(x_i), \\quad t^2_i = \\mathrm{MHA}(t^1_i), \\quad t^3_i = t^2_i + x_i\\]</div>
<div class="lesson-math" id="tx-block-eqs2">\\[t^4_i = \\mathrm{LayerNorm}(t^3_i), \\quad t^5_i = \\mathrm{FFN}(t^4_i), \\quad h_i = t^5_i + t^3_i\\]</div>
<p class="lesson-p">Step through the block below and watch the residual stream grow as each component adds its contribution. Notice that attention is the only component that reads from other tokens; the feedforward and layer norms act on each token's stream alone.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Walk the Residual Stream</span></div>
  <div class="viz-body">
    <canvas id="block-canvas" width="600" height="360" style="width:100%;max-width:600px;display:block;margin:0 auto"></canvas>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:1rem">
      <button onclick="blockStep()" id="block-step" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.55rem 1.2rem;font-family:var(--mono);font-size:.74rem;font-weight:700;cursor:pointer">Next step &#8593;</button>
      <button onclick="blockReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.55rem 1.2rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">Reset</button>
    </div>
    <div id="block-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;text-align:center;min-height:2rem"></div>
  </div>
</div>


<h2 class="lesson-h2">Attention Moves Information Between Streams</h2>
<p class="lesson-p">This is the residual-stream view made concrete. Each token's stream runs straight up. When an attention head fires, it takes information out of one stream and adds it into another. That is all attention does from the stream's point of view: it moves information sideways between columns that are otherwise independent. This same motion returns in 8.9 as the mechanism behind induction heads.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Copying Between Streams</span></div>
  <div class="viz-body">
    <canvas id="mix-canvas" width="600" height="220" style="width:100%;max-width:600px;display:block;margin:0 auto"></canvas>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:1rem">
      <button onclick="mixPlay()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">&#9654; Fire the head</button>
    </div>
    <div id="mix-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;text-align:center;min-height:1.6rem">Two residual streams. Attention will copy information from token A&rsquo;s stream into token B&rsquo;s.</div>
  </div>
</div>

<h2 class="lesson-h2">Feedforward and Layer Norm</h2>
<p class="lesson-p">The <strong>feedforward</strong> layer is exactly the two-layer network from neural networks, applied to each token independently. It usually widens to a larger hidden size and back, giving the model room to transform each token's representation.</p>
<div class="lesson-math" id="tx-block-ffn">\\[\\mathrm{FFN}(x_i) = \\mathrm{ReLU}(x_i W_1 + b_1)\\, W_2 + b_2\\]</div>
<p class="lesson-p"><strong>Layer norm</strong> keeps the numbers well-behaved. It is a z-score applied to a single token's vector: subtract the mean, divide by the standard deviation, then scale and shift by two learned parameters. Stable statistics make deep networks far easier to train.</p>
<div class="lesson-math" id="tx-block-lnstats">\\[\\mu = \\dfrac{1}{d}\\sum_{i=1}^{d} x_i, \\qquad \\sigma = \\sqrt{\\dfrac{1}{d}\\sum_{i=1}^{d}(x_i - \\mu)^2}\\]</div>
<div class="lesson-math" id="tx-block-ln">\\[\\mathrm{LayerNorm}(x) = \\gamma\\, \\dfrac{x - \\mu}{\\sigma} + \\beta\\]</div>


<p class="lesson-p">Watch layer norm operate on an actual vector below. Press normalize and the values re-center to mean 0 and rescale to standard deviation 1, then &gamma; and &beta; stretch and shift the result. The toggle shows the one architectural choice here: <strong>prenorm</strong> places the layer norm before each component, which is the modern default and trains more stably, while <strong>postnorm</strong>, the original design, placed it after the residual add.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Layer Norm Inspector</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:1rem">
      <button onclick="lnvGo()" id="lnv-go" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.1rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Normalize &#8594;</button>
      <button onclick="lnvReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">&#8635; New vector</button>
      <label style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">&gamma; <input type="range" min="0.4" max="2" step="0.05" value="1" oninput="lnvSet('g',this.value)" style="width:80px;accent-color:var(--accent);vertical-align:middle"> <span id="lnv-gv" style="color:var(--accent)">1.00</span></label>
      <label style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">&beta; <input type="range" min="-1" max="1" step="0.05" value="0" oninput="lnvSet('b',this.value)" style="width:80px;accent-color:var(--accent);vertical-align:middle"> <span id="lnv-bv" style="color:var(--accent)">0.00</span></label>
      <button id="lnv-pre" onclick="lnvTogglePre()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.45rem .9rem;font-family:var(--mono);font-size:.66rem;cursor:pointer;margin-left:auto">prenorm</button>
    </div>
    <canvas id="lnv-canvas" width="620" height="240" style="width:100%;max-width:620px;display:block;margin:0 auto"></canvas>
    <div id="lnv-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center;min-height:1.6rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Stack It</h2>
<p class="lesson-p">One block maps an [N &times; d] input to an [N &times; d] output. Same shape in, same shape out, which is why blocks stack: the output of block k feeds directly into block k+1. Modern models repeat this from 12 times to well over a hundred. Drag the slider to see the depth build up.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Depth Dial</span></div>
  <div class="viz-body">
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>number of blocks L</span><span id="stk-val" style="color:var(--accent)">12</span></div>
      <input id="stk-slider" type="range" min="1" max="126" step="1" value="12" oninput="stkSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <canvas id="stk-canvas" width="620" height="230" style="width:100%;max-width:620px;display:block;margin:0 auto"></canvas>
    <div id="stk-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center"></div>
  </div>
</div>

<div class="quiz-block" id="qtx-block"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Within a transformer block, which component is the only one that moves information between different tokens?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qtx-block','Correct. Only multi-head attention reads from other token streams; the feedforward and layer norms operate on each token independently.')">Multi-head attention</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-block','The feedforward layer acts on each token independently.')">The feedforward layer</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-block','Layer norm normalizes a single token vector, not across tokens.')">Layer norm</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-block','The residual connection just carries one stream upward; it does not mix tokens.')">The residual connection</button>
</div><div class="quiz-explain" id="qtx-block-explain"></div></div>`;

// ── 8.3 PARALLELIZING WITH X ───────────────────────────────
TX_PAGES.parallel = `
<div class="lesson-chapter-label">Section 8.3</div>
<h1 class="lesson-h1">Parallelizing with a Single Matrix</h1>
<p class="lesson-intro">During training, all input positions are available at once. Stacking them into a matrix lets attention process them together using matrix multiplication. Autoregressive generation still produces new tokens sequentially.</p>

<h2 class="lesson-h2">One Matrix for the Whole Sequence</h2>
<p class="lesson-p">Pack the N token embeddings as the rows of a single matrix X. Multiplying X by the three weight matrices produces all the queries, keys, and values in one shot.</p>
<div class="lesson-math" id="tx-par-qkv">\\[\\mathbf{Q} = \\mathbf{X} W^Q, \\qquad \\mathbf{K} = \\mathbf{X} W^K, \\qquad \\mathbf{V} = \\mathbf{X} W^V\\]</div>
<p class="lesson-p">Now the step that does the work. Multiply the query matrix by the transpose of the key matrix and you get every query-key dot product at once: an N by N grid where entry (i, j) is how much token <em>i</em> attends to token <em>j</em>. Scale, softmax each row, and multiply by the values.</p>
<div class="lesson-math" id="tx-par-head">\\[\\mathrm{head} = \\mathrm{softmax}\\!\\left(\\mathrm{mask}\\!\\left(\\dfrac{\\mathbf{Q}\\mathbf{K}^{\\top}}{\\sqrt{d_k}}\\right)\\right)\\mathbf{V}\\]</div>

<h2 class="lesson-h2">Masking Out the Future</h2>
<p class="lesson-p">There is a catch for language modeling. The full grid lets token <em>i</em> see tokens that come after it, which would be cheating: predicting the next word is easy if you already peeked at it. So we apply a <strong>causal mask</strong>, setting the upper triangle of the grid to negative infinity. The softmax turns those into zero, and each token can attend only to itself and the past.</p>
<div class="lesson-math" id="tx-par-mask">\\[M_{ij} = \\begin{cases} -\\infty & j > i \\\\ 0 & j \\le i \\end{cases}\\]</div>
<p class="lesson-p">Toggle the mask below on the live QKᵀ score grid. Watch the upper triangle vanish and each row renormalize over only the allowed tokens. Each row is one token's attention distribution.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Masked QKᵀ Grid</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;margin-bottom:1rem;flex-wrap:wrap;align-items:center">
      <button onclick="pmatToggleMask()" id="pmat-mask-btn" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.1rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Causal mask: ON</button>
      <button onclick="pmatReseed()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">&#8635; New scores</button>
      <label style="font-family:var(--mono);font-size:.7rem;color:var(--muted);display:flex;align-items:center;gap:6px;margin-left:auto"><input type="checkbox" id="pmat-soft" checked onchange="pmatDraw()"> show softmax</label>
    </div>
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>context length N</span><span id="pmat-nval" style="color:var(--accent)">5</span></div>
      <input id="pmat-nslider" type="range" min="3" max="14" step="1" value="5" oninput="pmatSetN(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <canvas id="pmat-canvas" width="560" height="360" style="width:100%;max-width:560px;display:block;margin:0 auto"></canvas>
    <div id="pmat-cost" style="margin-top:.9rem"></div>
    <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center">Row i is the query token, column j the key. With the softmax shown, each row sums to one. Attention is quadratic: this grid is N by N, which is why very long contexts are expensive.</div>
  </div>
</div>

<div class="quiz-block" id="qtx-par"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does causal language modeling set the upper triangle of the QKᵀ matrix to negative infinity?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qtx-par','Correct. It prevents a token from attending to future tokens, so the model cannot peek at the answer it is trying to predict.')">To stop each token from attending to tokens that come after it</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-par','The scaling by sqrt(dk) handles magnitude; masking is about direction of information.')">To keep the dot products from getting too large</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-par','Masking does not reduce the quadratic cost; the grid is still N by N.')">To make attention cheaper than quadratic</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-par','The softmax already normalizes rows; that is separate from masking.')">To make each row sum to one</button>
</div><div class="quiz-explain" id="qtx-par-explain"></div></div>`;

// ── 8.4 TOKEN & POSITION ───────────────────────────────────
TX_PAGES.inputenc = `
<div class="lesson-chapter-label">Section 8.4</div>
<h1 class="lesson-h1">The Input: Token and Position</h1>
<p class="lesson-intro">Before any attention happens, we have to turn a string of tokens into the matrix X. A transformer does this in two parts: a vector for what the token is, and a vector for where it sits. Added together, they become the input.</p>

<h2 class="lesson-h2">Token Embeddings</h2>
<p class="lesson-p">Every token owns a row in the embedding matrix E. Looking up a token is selecting its row, which is the same as multiplying a one-hot vector by E. Stack the lookups for a whole sequence and you get the token-embedding matrix.</p>
<div class="lesson-math" id="tx-ie-shapes">\\[\\mathbf{E} \\in \\mathbb{R}^{|V| \\times d}, \\qquad \\mathbf{P} \\in \\mathbb{R}^{N \\times d}, \\qquad \\mathbf{X} \\in \\mathbb{R}^{N \\times d}\\]</div>

<h2 class="lesson-h2">Why Position Has to Be Added</h2>
<p class="lesson-p">Here is a subtle problem. Attention is a weighted sum, and a sum does not care about order. Without help, a transformer would see <em>dog bites man</em> and <em>man bites dog</em> as the same bag of tokens. So we add a <strong>positional embedding</strong>: a separate vector for each slot in the sequence. Slot 1 has its own vector, slot 2 has another, and so on. The composite input is simply the token vector plus the position vector.</p>
<div class="lesson-math" id="tx-ie-composite">\\[\\mathbf{X}[i] = \\mathbf{E}[\\mathrm{id}(i)] + \\mathbf{P}[i]\\]</div>
<p class="lesson-p">Positions can be learned, one vector per slot, or set with a fixed pattern of sines and cosines at different frequencies, which generalizes to lengths never seen in training. Build an input below: choose tokens, and watch each token embedding add to its positional embedding to form the composite row that enters the first block.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Token + Position = Input</span></div>
  <div class="viz-body">
    <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.7rem">Pick the tokens in the window</div>
    <div id="ie-words" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem"></div>
    <div style="display:flex;gap:8px;margin-bottom:1rem;flex-wrap:wrap">
      <button class="ie-mode-btn" data-mode="learned" onclick="ieSetMode('learned')">learned positions</button>
      <button class="ie-mode-btn" data-mode="sinusoid" onclick="ieSetMode('sinusoid')">sinusoidal positions</button>
      <button onclick="ieShuffle()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.45rem .9rem;font-family:var(--mono);font-size:.7rem;cursor:pointer">&#8646; shuffle order</button>
      <button id="ie-pos-btn" onclick="ieTogglePos()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.45rem .9rem;font-family:var(--mono);font-size:.7rem;cursor:pointer">positions: ON</button>
    </div>
    <canvas id="ie-canvas" width="600" height="360" style="width:100%;max-width:600px;display:block;margin:0 auto"></canvas>
    <div id="ie-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center"></div>
  </div>
</div>

<div class="quiz-block" id="qtx-ie"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why must a transformer add positional embeddings to its token embeddings?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qtx-ie','Correct. Attention is a weighted sum, which is order-agnostic, so position must be injected explicitly or the model cannot tell word orderings apart.')">Attention is a sum and ignores order, so position must be added in</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-ie','Embeddings are already dense vectors; position is a separate concern.')">To make the embeddings dense instead of one-hot</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-ie','The vocabulary size is set by E, not by positions.')">To increase the vocabulary size</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-ie','Normalization is the job of layer norm, not positional embeddings.')">To normalize the input vectors</button>
</div><div class="quiz-explain" id="qtx-ie-explain"></div></div>`;

// ── 8.5 LANGUAGE MODELING HEAD ─────────────────────────────
TX_PAGES.lmhead = `
<div class="lesson-chapter-label">Section 8.5</div>
<h1 class="lesson-h1">The Language Modeling Head</h1>
<p class="lesson-intro">After the final transformer block, each token has a rich d-dimensional vector. The language modeling head is the small piece of circuitry that turns the last token's vector into a probability distribution over the whole vocabulary, so we can predict and generate.</p>

<h2 class="lesson-h2">From a Vector to a Distribution</h2>
<p class="lesson-p">The head has two steps. First a linear layer projects the final d-dimensional vector up to a logit for every word in the vocabulary. Then a softmax turns those logits into probabilities.</p>
<div class="lesson-math" id="tx-lmh-eq">\\[\\mathbf{u} = \\mathbf{h}^L_N \\mathbf{E}^{\\top}, \\qquad \\mathbf{y} = \\mathrm{softmax}(\\mathbf{u})\\]</div>
<p class="lesson-p">The standard shortcut here is <strong>weight tying</strong>. Rather than learn a separate projection matrix, we reuse the embedding matrix E, transposed. At the input, E maps a one-hot token to a d-dimensional vector. At the output, E transposed maps a d-dimensional vector back to a score for every token. The same matrix does both jobs, which is why the transpose is called the <strong>unembedding</strong> layer. Feed a final hidden vector through the head below and watch the logits and the resulting distribution form.</p>

<p class="lesson-p">The tying itself is worth seeing first. Below, the embedding matrix E is drawn once. Click a token: on the left, its one-hot vector selects that token's <em>row</em> on the way in; on the right, the hidden vector h is dotted against that same row on the way out. One matrix, used at both ends of the stack.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; One Matrix, Two Jobs</span></div>
  <div class="viz-body">
    <div id="mir-chips" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:1rem"></div>
    <canvas id="mir-canvas" width="620" height="240" style="width:100%;max-width:620px;display:block;margin:0 auto"></canvas>
    <div id="mir-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center"></div>
  </div>
</div>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Unembedding to a Distribution</span></div>
  <div class="viz-body">
    <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.7rem">Nudge the final hidden vector h</div>
    <div id="lmh-sliders" style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:1.1rem"></div>
    <canvas id="lmh-canvas" width="600" height="260" style="width:100%;max-width:600px;display:block;margin:0 auto"></canvas>
    <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center">Left: the hidden vector h dotted against each token's embedding row gives a logit. Right: softmax turns the logits into the next-token distribution. Tied weights mean a token whose embedding points the same way as h gets a high score.</div>
  </div>
</div>

<div class="quiz-block" id="qtx-lmh"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does weight tying mean in the language modeling head?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qtx-lmh','Correct. The unembedding layer reuses the transpose of the input embedding matrix E, so one matrix serves both directions.')">The unembedding layer reuses the transposed embedding matrix E</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-lmh','Heads are not forced to share weights with each other in this sense.')">All attention heads share the same weights</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-lmh','Layers do differ; tying is specifically about the embedding and unembedding.')">Every layer uses identical weights</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-lmh','Weights are learned, not frozen, by tying.')">The weights are frozen during training</button>
</div><div class="quiz-explain" id="qtx-lmh-explain"></div></div>`;

// ── 8.6 MORE ON SAMPLING ───────────────────────────────────
TX_PAGES.moresamp = `
<div class="lesson-chapter-label">Section 8.6</div>
<h1 class="lesson-h1">More on Sampling</h1>
<p class="lesson-intro">Temperature was introduced earlier. Here are two more knobs for the same tension: quality versus diversity. Lean too hard on the top tokens and the text is accurate but dull. Reach too far into the tail and it gets creative but starts to wander. Top-k and top-p both work by trimming the distribution before sampling.</p>

<h2 class="lesson-h2">Top-k Sampling</h2>
<p class="lesson-p"><strong>Top-k</strong> sampling keeps only the k most probable tokens, throws away the rest, renormalizes what remains into a clean distribution, and samples from that. With k equal to one it is just greedy decoding. Make k larger and you allow some surprise, but only among tokens that were already plausible.</p>

<h2 class="lesson-h2">Top-p (Nucleus) Sampling</h2>
<p class="lesson-p">Top-k has a weakness: a fixed k is too many tokens when the model is confident and too few when it is unsure. <strong>Top-p</strong>, or nucleus sampling, fixes the probability mass instead of the count. Keep the smallest set of top tokens whose probabilities add up to at least p, then sample from that set. The pool grows and shrinks automatically with the model's confidence.</p>
<div class="lesson-math" id="tx-samp-topp">\\[V^{(p)} = \\text{smallest set with } \\sum_{w \\in V^{(p)}} P(w \\mid w_{&lt;t}) \\ge p\\]</div>
<p class="lesson-p">Switch between the two below and drag the threshold. Watch which tokens survive the cut, get renormalized, and become eligible to sample.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Top-k and Top-p</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;margin-bottom:1rem;flex-wrap:wrap">
      <button class="kp-mode-btn" data-mode="topk" onclick="kpSetMode('topk')">top-k</button>
      <button class="kp-mode-btn" data-mode="topp" onclick="kpSetMode('topp')">top-p (nucleus)</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:1rem;flex-wrap:wrap;align-items:center">
      <span style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">context:</span>
      <button class="kp-ctx-btn" data-ctx="peaked" onclick="kpSetCtx('peaked')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">confident &middot; &ldquo;The capital of France is ___&rdquo;</button>
      <button class="kp-ctx-btn" data-ctx="flat" onclick="kpSetCtx('flat')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">uncertain &middot; &ldquo;She ___ across the field&rdquo;</button>
    </div>
    <div style="margin-bottom:1.1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span id="kp-label">k</span><span id="kp-val" style="color:var(--accent)">3</span></div>
      <input id="kp-slider" type="range" min="1" max="10" step="1" value="3" oninput="kpSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <div id="kp-bars" style="display:flex;gap:6px;align-items:flex-end;height:170px;margin-bottom:.6rem"></div>
    <div id="kp-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);line-height:1.6;text-align:center"></div>
  </div>
</div>

<div class="quiz-block" id="qtx-samp"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What advantage does top-p sampling have over top-k?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qtx-samp','Correct. Top-p fixes the probability mass, so the candidate pool grows when the model is uncertain and shrinks when it is confident.')">Its candidate pool adapts to the model's confidence in each context</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-samp','Both renormalize the surviving tokens; that is not the difference.')">Only top-p renormalizes the remaining tokens</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-samp','Neither is inherently deterministic; both sample.')">Top-p is always deterministic</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-samp','Temperature is a separate knob from both.')">Top-p removes the need for a softmax</button>
</div><div class="quiz-explain" id="qtx-samp-explain"></div></div>`;

// ── 8.7 TRAINING ───────────────────────────────────────────
TX_PAGES.txtrain = `
<div class="lesson-chapter-label">Section 8.7</div>
<h1 class="lesson-h1">Training the Transformer</h1>
<p class="lesson-intro">The training objective is the same cross-entropy loss as before: minimize the negative log probability of the true next token. What changes with transformers is the efficiency. Because every position is computed independently, a transformer can score every next-token prediction in a sequence at the same time.</p>

<h2 class="lesson-h2">Every Position at Once</h2>
<p class="lesson-p">Feed in a training sequence. At each position the model produces a distribution over the next token, the loss is the negative log probability it gave the true next token, and the sequence loss is the average over all positions.</p>
<div class="lesson-math" id="tx-train-loss">\\[L_{CE} = \\dfrac{1}{T}\\sum_{t=1}^{T} -\\log y_t[w_{t+1}]\\]</div>
<p class="lesson-p">The recurrent models of earlier eras had to process a sequence step by step, each step waiting on the last. A transformer has no such dependency: thanks to the causal mask, position 5 already cannot see position 6, so all positions can be scored in one parallel pass. This is the practical reason transformers train so much faster, and it is why they scaled. Watch the parallel training pass below: every position lights up its loss at once.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Parallel Training</span></div>
  <div class="viz-body">
    <canvas id="ptrain-canvas" width="620" height="280" style="width:100%;max-width:620px;display:block;margin:0 auto"></canvas>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:1rem">
      <button onclick="ptrainRun()" id="ptrain-btn" style="background:var(--accent4);color:var(--bg);border:none;border-radius:8px;padding:.55rem 1.2rem;font-family:var(--mono);font-size:.74rem;font-weight:700;cursor:pointer">Compute all losses &#8595;</button>
      <button onclick="ptrainReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.55rem 1.2rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">Reset</button>
    </div>
    <div id="ptrain-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;text-align:center;min-height:1.8rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Packing the Context Window</h2>
<p class="lesson-p">One more piece of training machinery. Real documents come in very different lengths, but the model wants full context windows. So training data is <strong>packed</strong>: short documents are placed end to end in one window, separated by an end-of-text token, until all 4096 slots are full. Multiply by hundreds of windows per batch and the totals get large. GPT-3 trained on roughly 3.2 million tokens per batch.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Stuff the Window</span></div>
  <div class="viz-body">
    <canvas id="pack-canvas" width="640" height="130" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:1rem;align-items:center;flex-wrap:wrap">
      <button onclick="packGo()" style="background:var(--accent4);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Pack a window</button>
      <span id="pack-count" style="font-family:var(--mono);font-size:.7rem;color:var(--muted)"></span>
    </div>
    <div id="pack-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center">Documents (colored) packed into one 4096-token window, divided by &lt;|endoftext|&gt; markers (white ticks).</div>
  </div>
</div>

<div class="quiz-block" id="qtx-train"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can a transformer compute the loss for every position in a training sequence in parallel?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qtx-train','Correct. Each position\\'s output is computed independently, and the causal mask already prevents seeing the future, so all positions can be scored at once.')">Each position's prediction is computed independently, with the mask preventing peeking</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-train','Transformers use cross-entropy, the same as before; the parallelism is structural.')">Because it uses a different loss function</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-train','Recurrence is exactly what transformers avoid; that is the point.')">Because it processes tokens recurrently one at a time</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-train','It does predict the next token; that is the objective.')">Because it does not predict the next token during training</button>
</div><div class="quiz-explain" id="qtx-train-explain"></div></div>`;

// ── 8.8 DEALING WITH SCALE ─────────────────────────────────
TX_PAGES.scale = `
<div class="lesson-chapter-label">Section 8.8</div>
<h1 class="lesson-h1">Dealing with Scale</h1>
<p class="lesson-intro">Large language models are large enough that scale becomes its own engineering problem. A frontier model can have hundreds of billions of parameters, dozens of layers, and a model dimension in the tens of thousands. Three ideas make that tractable: knowing how performance grows with scale, caching what you already computed, and finetuning without touching every weight.</p>

<h2 class="lesson-h2">Scaling Laws</h2>
<p class="lesson-p">Performance turns out to be predictable. The loss falls as a smooth <strong>power law</strong> in three quantities: the number of parameters N, the dataset size D, and the compute budget C. Each of them, holding the others fixed, drives the loss down along a straight line on a log-log plot.</p>
<div class="lesson-math" id="tx-scale-laws">\\[L(N) = \\left(\\dfrac{N_c}{N}\\right)^{\\alpha_N}, \\quad L(D) = \\left(\\dfrac{D_c}{D}\\right)^{\\alpha_D}, \\quad L(C) = \\left(\\dfrac{C_c}{C}\\right)^{\\alpha_C}\\]</div>
<p class="lesson-p">The parameter count itself has a tidy approximation. Ignoring embeddings and biases, a transformer's parameters scale with the number of layers times the square of the model dimension.</p>
<div class="lesson-math" id="tx-scale-params">\\[N \\approx 12\\, n_{\\text{layer}}\\, d^2\\]</div>
<p class="lesson-p">Drag the model size below and watch the loss slide down the power-law curve. The straight line on the log-log axes is the signature of a power law, and it is what lets labs predict a big model's loss from small experiments.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Scaling Law Curve</span></div>
  <div class="viz-body">
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>parameters N</span><span id="scale-nval" style="color:var(--accent)">1.0B</span></div>
      <input id="scale-slider" type="range" min="6" max="12" step="0.05" value="9" oninput="scaleSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <canvas id="scale-canvas" width="600" height="300" style="width:100%;max-width:600px;display:block;margin:0 auto"></canvas>
    <div id="scale-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center"></div>
  </div>
</div>


<h2 class="lesson-h2">Where the Parameter Counts Come From</h2>
<p class="lesson-p">The approximation N &asymp; 12&thinsp;n<sub>layer</sub>&thinsp;d&sup2; is worth experimenting with, because it explains where headline model sizes come from. Enter GPT-3's 96 layers at d = 12{,}288 and the counter reaches roughly 175B. Enter Llama 3.1's 126 layers at d = 16{,}384 and it lands near 405B.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Parameter Counter</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
      <button onclick="pcPreset(12,768)" class="pc-preset" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">GPT-2 small</button>
      <button onclick="pcPreset(96,12288)" class="pc-preset" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">GPT-3</button>
      <button onclick="pcPreset(126,16384)" class="pc-preset" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">Llama 3.1 405B</button>
    </div>
    <div style="margin-bottom:.8rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:4px"><span>layers n<sub>layer</sub></span><span id="pc-lv" style="color:var(--accent)">12</span></div>
      <input id="pc-layers" type="range" min="1" max="130" step="1" value="12" oninput="pcCalc()" style="width:100%;accent-color:var(--accent)">
    </div>
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:4px"><span>model dimension d</span><span id="pc-dv" style="color:var(--accent)">768</span></div>
      <input id="pc-d" type="range" min="7" max="14.1" step="0.05" value="9.585" oninput="pcCalc()" style="width:100%;accent-color:var(--accent)">
    </div>
    <div id="pc-out" style="font-family:var(--mono);font-size:1.1rem;color:var(--accent);text-align:center;padding:.8rem;background:var(--surface2);border-radius:10px"></div>
  </div>
</div>
<h2 class="lesson-h2">Two Efficiency Tricks</h2>
<p class="lesson-p">The <strong>KV cache</strong> attacks a waste in generation. When you generate token by token, each new token needs to attend to all the earlier ones, but the keys and values for those earlier tokens were already computed at previous steps. Rather than recompute them, store them in a cache and reuse them. Only the new token's query, key, and value are fresh.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Cache vs. Recompute</span></div>
  <div class="viz-body">
    <canvas id="kv-canvas" width="640" height="250" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:1rem">
      <button onclick="kvPlay()" id="kv-play" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">&#9654; Generate 12 tokens</button>
      <button onclick="kvReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">Reset</button>
    </div>
    <div id="kv-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center;min-height:1.6rem">Two op counters, same generation. The naive lane re-derives every earlier K and V at every step. The cached lane computes each exactly once.</div>
  </div>
</div>

<p class="lesson-p"><strong>LoRA</strong> addresses the cost of finetuning. Updating every weight of a large model is expensive. LoRA freezes the original weight matrix and learns a small low-rank update instead: two thin matrices whose product has the same shape as the weight but a small fraction of the parameters.</p>
<div class="lesson-math" id="tx-scale-lora">\\[h = xW + xAB, \\qquad A \\in \\mathbb{R}^{k \\times r},\\; B \\in \\mathbb{R}^{r \\times d},\\; r \\ll \\min(d, k)\\]</div>
<p class="lesson-p">Because the update is small and adds in cleanly, you can train it cheaply, swap different LoRA modules in and out for different domains, and pay no extra cost at inference time.</p>


<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Rank Dial</span></div>
  <div class="viz-body">
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>LoRA rank r</span><span id="lora-rv" style="color:var(--accent)">8</span></div>
      <input id="lora-slider" type="range" min="1" max="64" step="1" value="8" oninput="loraSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <canvas id="lora-canvas" width="640" height="240" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="lora-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center"></div>
  </div>
</div>

<div class="quiz-block" id="qtx-scale"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What problem does the KV cache solve?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qtx-scale','Correct. During generation the keys and values of earlier tokens were already computed, so caching them avoids recomputing them at every new step.')">Recomputing the keys and values of earlier tokens at every generation step</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-scale','LoRA, not the KV cache, reduces finetuning cost.')">The cost of updating all weights during finetuning</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-scale','Scaling laws describe loss versus resources; that is separate.')">Predicting the loss from model size</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-scale','The quadratic cost of attention is a different issue the cache does not remove.')">Making attention sub-quadratic</button>
</div><div class="quiz-explain" id="qtx-scale-explain"></div></div>`;

// ── 8.9 INTERPRETING THE TRANSFORMER ───────────────────────
TX_PAGES.interp = `
<div class="lesson-chapter-label">Section 8.9</div>
<h1 class="lesson-h1">Interpreting the Transformer</h1>
<p class="lesson-intro">A trained transformer works, but the reasons are not obvious from the weights. Mechanistic interpretability tries to reverse-engineer the actual circuits inside the network. Two results stand out: a specific attention pattern that may explain in-context learning, and a simple method for reading off the model's prediction layer by layer.</p>

<h2 class="lesson-h2">Induction Heads</h2>
<p class="lesson-p">Some attention heads learn a strikingly clean algorithm. Given a sequence containing the pattern <em>A B ... A</em>, an <strong>induction head</strong> predicts that <em>B</em> comes next. It completes the pattern by copying.</p>
<div class="lesson-math" id="tx-interp-induction">\\[A\\, B\\, \\ldots\\, A \\;\\longrightarrow\\; B\\]</div>
<p class="lesson-p">It works in two moves. The <strong>prefix matching</strong> step looks at the current token A, searches back through the context for the earlier place A appeared, and attends to the token right after it. The <strong>copying</strong> step then raises the probability of that following token. This single circuit, found even in tiny one and two head models, may be a big part of why models can learn from examples in their prompt without any weight updates. Step through an induction head completing a repeated pattern below.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; An Induction Head at Work</span></div>
  <div class="viz-body">
    <canvas id="ind-canvas" width="620" height="220" style="width:100%;max-width:620px;display:block;margin:0 auto"></canvas>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:1rem">
      <button onclick="indStep()" id="ind-step" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.55rem 1.2rem;font-family:var(--mono);font-size:.74rem;font-weight:700;cursor:pointer">Next step &#8594;</button>
      <button onclick="indReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.55rem 1.2rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">Reset</button>
      <label style="font-family:var(--mono);font-size:.7rem;color:var(--accent3);display:flex;align-items:center;gap:6px"><input type="checkbox" id="ind-ablate" onchange="indToggleAblate(this.checked)"> knock out this head</label>
    </div>
    <div id="ind-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;text-align:center;min-height:2rem"></div>
  </div>
</div>

<h2 class="lesson-h2">The Logit Lens</h2>
<p class="lesson-p">The idea here is simple. The unembedding matrix turns a final-layer vector into a distribution over words. What happens if we apply it to an <em>intermediate</em> layer's vector instead, as though that layer were the last one? We get a reading of what the model is leaning toward at that depth.</p>
<div class="lesson-math" id="tx-interp-logitlens">\\[\\mathrm{logits}^{(\\ell)} = \\mathbf{h}^{(\\ell)}\\, \\mathbf{E}^{\\top}\\]</div>
<p class="lesson-p">Run the logit lens down a stack and the prediction usually sharpens layer by layer: early layers are vague, and the guess narrows as the vector climbs. It is an imperfect measurement, since the network was never trained for its middle layers to be read this way, but it does show how the prediction develops.</p>

<p class="lesson-p">Scrub through the layers below. The context is <em>&ldquo;The Eiffel Tower is located in the city of&rdquo;</em>, and at each depth the lens shows the top five words the model would predict if that layer were the last. The prediction narrows as you go up: early layers surface generic function words, middle layers start producing candidate cities, and by the top the answer has settled.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Logit Lens, Layer by Layer</span></div>
  <div class="viz-body">
    <div style="font-family:var(--mono);font-size:.72rem;color:var(--text);margin-bottom:1rem;text-align:center">&ldquo;The Eiffel Tower is located in the city of <span style="color:var(--accent3)">___</span>&rdquo;</div>
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>read the stream at layer &ell;</span><span id="lens-val" style="color:var(--accent)">0</span></div>
      <input id="lens-slider" type="range" min="0" max="12" step="1" value="0" oninput="lensSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <div id="lens-bars" style="display:flex;flex-direction:column;gap:8px;max-width:460px;margin:0 auto"></div>
    <div id="lens-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:1rem;line-height:1.6;text-align:center"></div>
  </div>
</div>

<div class="quiz-block" id="qtx-interp"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does an induction head do when it sees the pattern A B ... A?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qtx-interp','Correct. It matches the earlier A, attends to what followed it, and copies that token (B) as the prediction.')">It finds the earlier A and predicts that B, which followed it, comes next</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-interp','It does not erase context; it reads from it.')">It deletes the repeated token from the context</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-interp','That describes the logit lens, a separate tool.')">It reads out the distribution at each intermediate layer</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-interp','Induction heads predict the next token; they do not update weights.')">It performs a gradient update on the weights</button>
</div><div class="quiz-explain" id="qtx-interp-explain"></div></div>`;

// ── 8.10 THE WHOLE TRANSFORMER (launch fullscreen) ─────────
TX_PAGES.txfull = `
<div class="lesson-chapter-label">Section 8.10</div>
<h1 class="lesson-h1">The Whole Transformer</h1>
<p class="lesson-intro">Every component fits into one stack. Here it is end to end: a token enters at the bottom, passes through N identical blocks along its residual stream, and comes out at the top as a distribution over the next token. Open the full diagram to walk through every stage.</p>

<h2 class="lesson-h2">One Column, Many Blocks</h2>
<p class="lesson-p">Reading bottom to top: the input token is embedded and given a position, then enters the first transformer block. Inside each block the residual stream passes through a layer norm and multi-head attention, gets that result added back, then through another layer norm and a feedforward network, added back again. That output becomes the input to the next block, and the pattern repeats N times. A final layer norm, the unembedding, and a softmax turn the top vector into next-token probabilities. The full view below lets you click any stage to see its role and the shape of the data flowing through it.</p>

<div class="viz-container">
  <div class="viz-header">
    <span class="viz-label">Interactive &middot; The Full Decoder Stack</span>
    <button onclick="openTXFull()" style="background:linear-gradient(135deg,var(--accent),#a78bfa);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.1rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">&#9719; Open Full Stack</button>
  </div>
  <div class="viz-body">
    <canvas id="txfull-pre-canvas" width="600" height="320" style="width:100%;max-width:600px;display:block;margin:0 auto;cursor:pointer" onclick="openTXFull()"></canvas>
    <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center">A preview of the full decoder stack. Click it or the button to expand into the interactive architecture, where each stage lights up and explains itself.</div>
  </div>
</div>

<div class="quiz-block" id="qtx-full"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In the full stack, what is the input to transformer block number k?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qtx-full','Correct. Each block takes the output H of the previous block as its input, which is why the dimensions must match so blocks can stack.')">The output of block k minus 1</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-full','Only the first block sees the raw token-plus-position embedding.')">The raw token embedding, always</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-full','The logits appear only at the very top, after the last block.')">The final logit vector</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-full','The unembedding is applied once at the top, not between blocks.')">The unembedding of the previous block</button>
</div><div class="quiz-explain" id="qtx-full-explain"></div></div>`;

// ── 8.11 BUILD A TRANSFORMER (launch fullscreen) ───────────
TX_PAGES.txmodel = `
<div class="lesson-chapter-label">Section 8.11</div>
<h1 class="lesson-h1">Build a Transformer</h1>
<p class="lesson-intro">Now run a real one. This is an actual self-attention forward pass executing in your browser: real query, key, and value projections, real scaled dot-product scores, a real causal mask, real softmax weights, and a real weighted sum of values. Set the input tokens and watch the heads attend.</p>

<h2 class="lesson-h2">A Working Attention Engine</h2>
<p class="lesson-p">The model is tiny and its weights are fixed rather than trained, so it will not write poetry. That is exactly the point: because it is small, every number is visible. Choose the tokens in the context, pick how many heads run, toggle the causal mask, and click any token to make it the query. The panel shows its query-key scores, the softmax attention weights over the allowed tokens, and the resulting next-token distribution from the language modeling head. This is the whole thing, live and inspectable.</p>

<div class="viz-container">
  <div class="viz-header">
    <span class="viz-label">Interactive &middot; Run a Real Transformer</span>
    <button onclick="openTXModel()" style="background:linear-gradient(135deg,var(--accent),#a78bfa);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.1rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">&#9719; Open the Model</button>
  </div>
  <div class="viz-body">
    <div onclick="openTXModel()" style="cursor:pointer;background:var(--surface2);border-radius:12px;padding:1.5rem;text-align:center">
      <div style="font-family:var(--mono);font-size:.85rem;color:var(--text);line-height:1.8">the <span style="color:var(--accent)">cat</span> sat on the <span style="color:var(--accent3)">?</span></div>
      <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:1rem">Click to open the live transformer: set tokens, choose heads, toggle the mask, and click a query token to inspect its real attention.</div>
    </div>
  </div>
</div>

<div class="quiz-block" id="qtx-model"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In this real forward pass, when you click a query token with the causal mask on, which tokens can it attend to?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qtx-model','Correct. With the causal mask on, a token attends only to itself and the tokens before it.')">Only itself and the tokens to its left</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-model','That is what happens with the mask off, not on.')">Every token in the sequence</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-model','It can attend to several tokens, weighted by the softmax, not just one.')">Only the single most similar token</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qtx-model','Future tokens are exactly what the causal mask blocks.')">Only the tokens to its right</button>
</div><div class="quiz-explain" id="qtx-model-explain"></div></div>`;

// ── TX EQUATIONS ───────────────────────────────────────────
TX_EQ.tokenride = {
  'tx-ride-eq': 'x = \\mathbf{E}[\\mathrm{id}] + \\mathbf{P}[\\mathrm{pos}] \\;\\longrightarrow\\; h^{1} \\longrightarrow \\cdots \\longrightarrow h^{L} \\;\\longrightarrow\\; u = h^{L}\\mathbf{E}^{\\top} \\;\\longrightarrow\\; y = \\mathrm{softmax}(u)'
};
TX_EQ.attn = {
  'tx-attn-simple': 'a_i = \\sum_{j \\le i} \\alpha_{ij}\\, x_j',
  'tx-attn-score': '\\mathrm{score}(x_i, x_j) = x_i \\cdot x_j',
  'tx-attn-alpha': '\\alpha_{ij} = \\mathrm{softmax}(\\mathrm{score}(x_i, x_j)) \\quad \\forall\\, j \\le i',
  'tx-attn-qkv': 'q_i = x_i W^Q, \\qquad k_j = x_j W^K, \\qquad v_j = x_j W^V',
  'tx-attn-scaled': '\\mathrm{score}(x_i, x_j) = \\dfrac{q_i \\cdot k_j}{\\sqrt{d_k}}',
  'tx-attn-head': '\\mathrm{head}_i = \\sum_{j \\le i} \\alpha_{ij}\\, v_j, \\qquad a_i = \\mathrm{head}_i\\, W^O',
  'tx-attn-multi': 'a_i = (\\mathrm{head}_1 \\oplus \\mathrm{head}_2 \\oplus \\cdots \\oplus \\mathrm{head}_A)\\, W^O'
};
TX_EQ.block = {
  'tx-block-eqs1': 't^1_i = \\mathrm{LayerNorm}(x_i), \\quad t^2_i = \\mathrm{MHA}(t^1_i), \\quad t^3_i = t^2_i + x_i',
  'tx-block-eqs2': 't^4_i = \\mathrm{LayerNorm}(t^3_i), \\quad t^5_i = \\mathrm{FFN}(t^4_i), \\quad h_i = t^5_i + t^3_i',
  'tx-block-ffn': '\\mathrm{FFN}(x_i) = \\mathrm{ReLU}(x_i W_1 + b_1)\\, W_2 + b_2',
  'tx-block-lnstats': '\\mu = \\dfrac{1}{d}\\sum_{i=1}^{d} x_i, \\qquad \\sigma = \\sqrt{\\dfrac{1}{d}\\sum_{i=1}^{d}(x_i - \\mu)^2}',
  'tx-block-ln': '\\mathrm{LayerNorm}(x) = \\gamma\\, \\dfrac{x - \\mu}{\\sigma} + \\beta'
};
TX_EQ.parallel = {
  'tx-par-qkv': '\\mathbf{Q} = \\mathbf{X} W^Q, \\qquad \\mathbf{K} = \\mathbf{X} W^K, \\qquad \\mathbf{V} = \\mathbf{X} W^V',
  'tx-par-head': '\\mathrm{head} = \\mathrm{softmax}\\!\\left(\\mathrm{mask}\\!\\left(\\dfrac{\\mathbf{Q}\\mathbf{K}^{\\top}}{\\sqrt{d_k}}\\right)\\right)\\mathbf{V}',
  'tx-par-mask': 'M_{ij} = \\begin{cases} -\\infty & j > i \\\\ 0 & j \\le i \\end{cases}'
};
TX_EQ.inputenc = {
  'tx-ie-shapes': '\\mathbf{E} \\in \\mathbb{R}^{|V| \\times d}, \\qquad \\mathbf{P} \\in \\mathbb{R}^{N \\times d}, \\qquad \\mathbf{X} \\in \\mathbb{R}^{N \\times d}',
  'tx-ie-composite': '\\mathbf{X}[i] = \\mathbf{E}[\\mathrm{id}(i)] + \\mathbf{P}[i]'
};
TX_EQ.lmhead = {
  'tx-lmh-eq': '\\mathbf{u} = \\mathbf{h}^L_N \\mathbf{E}^{\\top}, \\qquad \\mathbf{y} = \\mathrm{softmax}(\\mathbf{u})'
};
TX_EQ.moresamp = {
  'tx-samp-topp': 'V^{(p)} = \\text{smallest set with } \\sum_{w \\in V^{(p)}} P(w \\mid w_{<t}) \\ge p'
};
TX_EQ.txtrain = {
  'tx-train-loss': 'L_{CE} = \\dfrac{1}{T}\\sum_{t=1}^{T} -\\log y_t[w_{t+1}]'
};
TX_EQ.scale = {
  'tx-scale-laws': 'L(N) = \\left(\\dfrac{N_c}{N}\\right)^{\\alpha_N}, \\quad L(D) = \\left(\\dfrac{D_c}{D}\\right)^{\\alpha_D}, \\quad L(C) = \\left(\\dfrac{C_c}{C}\\right)^{\\alpha_C}',
  'tx-scale-params': 'N \\approx 12\\, n_{\\text{layer}}\\, d^2',
  'tx-scale-lora': 'h = xW + xAB, \\qquad A \\in \\mathbb{R}^{k \\times r},\\; B \\in \\mathbb{R}^{r \\times d},\\; r \\ll \\min(d, k)'
};
TX_EQ.interp = {
  'tx-interp-induction': 'A\\, B\\, \\ldots\\, A \\;\\longrightarrow\\; B',
  'tx-interp-logitlens': '\\mathrm{logits}^{(\\ell)} = \\mathbf{h}^{(\\ell)}\\, \\mathbf{E}^{\\top}'
};

// ── OPEN TX SECTION ────────────────────────────────────────
function openTXSec(id){
  const pg = TX_PAGES[id];
  if(!pg) return;
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if(!sv || !sb) return;
  const sec = TX_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if(crumb && sec) crumb.innerHTML = 'Transformers <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  renderMath(sb);
  mcSectionDelay(()=>{
    if(id==='tokenride') rideBuild();
    if(id==='attn'){ attnBuild(); qkvBuild(); mhBuild(); }
    if(id==='block'){ blockBuild(); lnvBuild(); mixBuild(); stkBuild(); }
    if(id==='parallel') pmatBuild();
    if(id==='inputenc') ieBuild();
    if(id==='lmhead'){ lmhBuild(); mirBuild(); }
    if(id==='moresamp') kpBuild();
    if(id==='txtrain'){ ptrainBuild(); packBuild(); }
    if(id==='scale'){ scaleBuild(); pcBuild(); kvBuild(); loraBuild(); }
    if(id==='interp'){ indBuild(); lensBuild(); }
    if(id==='txfull') txFullPreBuild();
    if(id==='txmodel') {}
  }, 120);
  sv.onscroll = () => {
    const h = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if(bar) bar.style.width = (h>0?(sv.scrollTop/h)*100:0)+'%';
  };
}
// ── 8.1 VIZ: SELF-ATTENTION ────────────────────────────────
const ATTN_BASE_TOK = ['The','ladder','did','not','reach','the','window','because'];
const ATTN_BASE_VEC = [[0.1,0.1,0.2,0.6],[2,0,0,0.3],[0,0,0.9,0.3],[0,0,0.8,0.4],[0.1,0.1,1.0,0.1],[0.1,0.1,0.2,0.6],[0,2,0,0.3],[0,0,0.5,0.5]];
/* "it" is the same vector in every mode: at its own position a causal model
   cannot see the adjective that follows, so its attention must not depend on
   which ending is selected. The resolution shows up at the adjective instead. */
const ATTN_IT = [1.0,1.0,0,0.2];
const ATTN_MODES = {
  short: { it:ATTN_IT, tail:[['was',[0,0,0.6,0.5]],['too',[0,0,0.4,0.6]],['short',[1.2,0.1,0.3,0.2]]] },
  high:  { it:ATTN_IT, tail:[['was',[0,0,0.6,0.5]],['too',[0,0,0.4,0.6]],['high',[0.1,1.2,0.3,0.2]]] },
  open:  { it:ATTN_IT, tail:[] }
};
let ATTN_TOKENS = [], ATTN_VEC = [];
let _attn = { q:11, ctx:'short', anim:null };
function attnSetContext(ctx){
  _attn.ctx = ctx;
  const m = ATTN_MODES[ctx];
  ATTN_TOKENS = ATTN_BASE_TOK.concat(['it'], m.tail.map(t=>t[0]));
  ATTN_VEC = ATTN_BASE_VEC.concat([m.it], m.tail.map(t=>t[1]));
  document.querySelectorAll('.attn-ctx-btn').forEach(b=>{ const on=b.dataset.ctx===ctx; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  const t=document.getElementById('attn-tokens');
  if(t) t.innerHTML=ATTN_TOKENS.map((w,i)=>'<button class="attn-tok" data-i="'+i+'" onclick="attnSetQuery('+i+')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .7rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">'+w+'</button>').join('');
  attnSetQuery(ATTN_TOKENS.length-1);
}
function attnBuild(){
  const t=document.getElementById('attn-tokens'); if(!t) return;
  attnSetContext(_attn.ctx||'short');
  if(_attn.anim) cancelAnimationFrame(_attn.anim);
  const loop=()=>{ const c=document.getElementById('attn-canvas'); if(!c){ _attn.anim=null; return; } attnDraw(); _attn.anim=requestAnimationFrame(loop); };
  loop();
}
function _attnDist(qi){
  if(!ATTN_VEC.length) return [1];
  qi=Math.max(0,Math.min(ATTN_VEC.length-1,Math.round(qi)||0));
  const dk=ATTN_VEC[0].length;
  const scores=[];
  for(let j=0;j<=qi;j++){ let s=0; for(let d=0;d<dk;d++) s+=ATTN_VEC[qi][d]*ATTN_VEC[j][d]; scores.push(s/Math.sqrt(dk)); }
  const mx=Math.max(...scores), ex=scores.map(s=>Math.exp(s-mx)), Z=ex.reduce((a,b)=>a+b,0);
  return ex.map(e=>e/Z);
}
function attnSetQuery(qi){
  _attn.q=Math.max(0,Math.min(Math.max(0,ATTN_TOKENS.length-1),Math.round(qi)||0));
  qi=_attn.q;
  document.querySelectorAll('.attn-tok').forEach(b=>{ const on=+b.dataset.i===qi; b.style.background=on?'var(--accent3)':'var(--surface2)'; b.style.color=on?'#fff':'var(--muted)'; b.style.borderColor=on?'var(--accent3)':'var(--border2)'; });
  attnDraw();
}
function attnDraw(){
  const cv=document.getElementById('attn-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const T=performance.now()/1000;
  const qi=Math.max(0,Math.min(Math.max(0,ATTN_VEC.length-1),Math.round(_attn.q)||0)), dist=_attnDist(qi);
  const n=ATTN_TOKENS.length, pad=24, bw=(W-2*pad)/n, yTok=H-30, yQ=46;
  const qx=pad+qi*bw+bw/2;
  // find top for caption
  let topj=0,topv=0;
  for(let j=0;j<=qi;j++){ if(dist[j]>topv){ topv=dist[j]; topj=j; } }
  // a genuine tie has no single winner; mark every key within half a point of the max
  const tied=[]; for(let j=0;j<=qi;j++) if(dist[j] > topv-0.005) tied.push(j);

  // ── curved attention links with flowing particles (behind nodes) ──
  for(let j=0;j<=qi;j++){
    const x=pad+j*bw+bw/2, a=dist[j];
    const x0=qx, y0=yQ+15, x1=x, y1=yTok-14;
    const mx=(x0+x1)/2, my=(y0+y1)/2-Math.min(46,Math.abs(x1-x0)*0.35); // control point bows the curve
    // link
    const lg=ctx.createLinearGradient(x0,y0,x1,y1);
    lg.addColorStop(0,`rgba(255,95,142,${0.1+a*0.55})`);
    lg.addColorStop(1,`rgba(77,227,255,${0.1+a*0.75})`);
    ctx.strokeStyle=lg; ctx.lineWidth=0.5+a*7; ctx.lineCap='round';
    if(a>0.12){ ctx.shadowBlur=8; ctx.shadowColor=`rgba(77,227,255,${a*0.6})`; } else ctx.shadowBlur=0;
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.quadraticCurveTo(mx,my,x1,y1); ctx.stroke();
    ctx.shadowBlur=0;
    // particles travelling query -> key along the curve
    if(a>0.05){
      const np=1+Math.round(a*4);
      for(let p=0;p<np;p++){
        let f=((T*0.5)+(p/np)+j*0.13)%1;
        const u=1-f; // bezier
        const bx=u*u*x0+2*u*f*mx+f*f*x1, by=u*u*y0+2*u*f*my+f*f*y1;
        const fade=Math.sin(f*Math.PI);
        ctx.fillStyle=`rgba(77,227,255,${fade*(0.5+a*0.5)})`;
        ctx.shadowBlur=6; ctx.shadowColor='rgba(77,227,255,0.8)';
        ctx.beginPath(); ctx.arc(bx,by,1.6+a*2,0,2*Math.PI); ctx.fill();
      }
      ctx.shadowBlur=0;
    }
  }

  // ── query node (glowing) ──
  ctx.shadowBlur=14; ctx.shadowColor='rgba(255,95,142,0.7)';
  const qg=ctx.createLinearGradient(qx-30,yQ,qx+30,yQ);
  qg.addColorStop(0,'rgba(255,95,142,0.95)'); qg.addColorStop(1,'rgba(255,95,142,0.7)');
  ctx.fillStyle=qg; roundRect(ctx,qx-30,yQ-14,60,28,8); ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='#fff'; ctx.font='bold 12px monospace'; ctx.textAlign='center'; ctx.fillText(ATTN_TOKENS[qi],qx,yQ+4);
  ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='9px monospace'; ctx.fillText('query',qx,yQ-21);

  // ── token row ──
  for(let j=0;j<n;j++){
    const x=pad+j*bw+bw/2, allowed=j<=qi, a=allowed?dist[j]:0;
    const isTop=allowed&&tied.indexOf(j)>=0&&a>0.05;
    if(allowed && a>0.12){ ctx.shadowBlur=10*a; ctx.shadowColor=`rgba(77,227,255,${a*0.7})`; } else ctx.shadowBlur=0;
    const tg=ctx.createLinearGradient(0,yTok-13,0,yTok+13);
    if(j===qi){ tg.addColorStop(0,'rgba(255,95,142,0.4)'); tg.addColorStop(1,'rgba(255,95,142,0.18)'); }
    else if(allowed){ tg.addColorStop(0,`rgba(77,227,255,${0.14+a*0.7})`); tg.addColorStop(1,`rgba(77,227,255,${0.06+a*0.4})`); }
    else { tg.addColorStop(0,'rgba(255,255,255,0.05)'); tg.addColorStop(1,'rgba(255,255,255,0.02)'); }
    ctx.fillStyle=tg;
    roundRect(ctx,x-bw*0.42,yTok-13,bw*0.84,26,6); ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle=isTop?'rgba(77,227,255,0.9)':(allowed?'rgba(255,255,255,0.22)':'rgba(255,255,255,0.07)'); ctx.lineWidth=isTop?2:1;
    roundRect(ctx,x-bw*0.42,yTok-13,bw*0.84,26,6); ctx.stroke();
    ctx.shadowBlur=3; ctx.shadowColor='rgba(0,0,0,0.85)'; ctx.shadowOffsetY=1;
    ctx.fillStyle=allowed?'#ffffff':'rgba(255,255,255,0.3)'; ctx.font=(isTop?'bold ':'600 ')+'10px monospace'; ctx.textAlign='center';
    ctx.fillText(ATTN_TOKENS[j],x,yTok+4);
    ctx.shadowBlur=0; ctx.shadowOffsetY=0;
    if(allowed && a>0.08){ ctx.fillStyle=`rgba(77,227,255,${0.6+a*0.4})`; ctx.font='bold 9px monospace'; ctx.fillText((a*100).toFixed(0)+'%',x,yTok+21); }
  }
  ctx.textAlign='left';
  const cap=document.getElementById('attn-caption');
  if(cap){
    const isLast = qi===ATTN_TOKENS.length-1;
    if(ATTN_TOKENS[qi]==='it'){
      cap.innerHTML='&ldquo;<span style="color:var(--accent3)">it</span>&rdquo; is at position 8, and the mask lets it see only positions 0 to 8. Its beam splits evenly between <span style="color:var(--accent)">ladder</span> and <span style="color:var(--accent)">window</span> \u2014 '+(dist[1]*100).toFixed(1)+'% each \u2014 and it splits the same way whichever ending you pick above, because a causal model genuinely cannot read ahead. '+(_attn.ctx==='open' ? 'Here nothing follows it at all.' : 'Click the last word to see where the ambiguity is actually settled.');
    }
    else if(isLast && _attn.ctx==='short') cap.innerHTML='&ldquo;<span style="color:var(--accent3)">short</span>&rdquo; is the word that settles it, and being last it can look back over the whole sentence. Its beam lands on <span style="color:var(--accent)">ladder</span> ('+(dist[1]*100).toFixed(0)+'%) rather than window ('+(dist[6]*100).toFixed(0)+'%): ladders are too short, windows are not.';
    else if(isLast && _attn.ctx==='high') cap.innerHTML='&ldquo;<span style="color:var(--accent3)">high</span>&rdquo; re-aims the same machinery at <span style="color:var(--accent)">window</span> ('+(dist[6]*100).toFixed(0)+'%) over ladder ('+(dist[1]*100).toFixed(0)+'%). Only the final adjective changed, and only the queries that can see it changed with it.';
    else if(tied.length>1) cap.innerHTML='"<span style="color:var(--accent3)">'+ATTN_TOKENS[qi]+'</span>" divides its attention evenly between '+tied.map(j=>'"<span style="color:var(--accent)">'+ATTN_TOKENS[j]+'</span>"').join(' and ')+' ('+(topv*100).toFixed(0)+'% each). Only tokens up to and including the query are visible: this is causal attention.';
    else cap.innerHTML='"<span style="color:var(--accent3)">'+ATTN_TOKENS[qi]+'</span>" attends most to "<span style="color:var(--accent)">'+ATTN_TOKENS[topj]+'</span>" ('+(topv*100).toFixed(0)+'%). Only tokens up to and including the query are visible: this is causal attention.';
  }
}

// ── 8.2 VIZ: RESIDUAL STREAM WALKTHROUGH ───────────────────
const BLOCK_STEPS = [
  {lab:'input', desc:'The residual stream starts as the input vector x for this token.'},
  {lab:'layernorm1', desc:'Layer norm normalizes x into t1, a clean zero-mean unit-variance version.'},
  {lab:'attention', desc:'Multi-head attention reads t1 AND the other token streams, producing t2. This is the only step that mixes tokens.'},
  {lab:'add1', desc:'t3 = t2 + x. The attention output is added back into the stream; nothing is overwritten.'},
  {lab:'layernorm2', desc:'A second layer norm normalizes t3 into t4.'},
  {lab:'feedforward', desc:'The feedforward network transforms t4 into t5, acting on this token alone.'},
  {lab:'add2', desc:'h = t5 + t3. The feedforward output is added back. h is the block output, ready for the next block.'}
];
let _block = { step:0 };
function blockBuild(){ blockReset(); }
function blockReset(){ _block.step=0; blockDraw(); const c=document.getElementById('block-caption'); if(c) c.textContent=BLOCK_STEPS[0].desc; }
function blockStep(){ if(_block.step<BLOCK_STEPS.length-1){ _block.step++; blockDraw(); const c=document.getElementById('block-caption'); if(c) c.textContent=BLOCK_STEPS[_block.step].desc; } }
function blockDraw(){
  const cv=document.getElementById('block-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const sx=W*0.32, top=30, bot=H-30, st=_block.step;
  // residual stream (vertical bar)
  const streamH=(BLOCK_STEPS.length-1);
  const yAt=k=>bot-(k/streamH)*(bot-top);
  ctx.strokeStyle='rgba(77,227,255,0.5)'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(sx,bot); ctx.lineTo(sx,yAt(st)); ctx.stroke();
  ctx.strokeStyle='rgba(77,227,255,0.12)';
  ctx.beginPath(); ctx.moveTo(sx,yAt(st)); ctx.lineTo(sx,top); ctx.stroke();
  // labels along stream
  ctx.font='9px monospace'; ctx.textAlign='right';
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fillText('residual stream',sx-14,top-8);
  // components branching right
  const comps=[{k:1,name:'Layer Norm',col:'#fde047'},{k:2,name:'MultiHead Attention',col:'#ff8c42'},{k:4,name:'Layer Norm',col:'#fde047'},{k:5,name:'Feedforward',col:'#4DE3FF'}];
  const adds=[3,6];
  comps.forEach(c=>{
    const y=yAt(c.k-0.5), on=st>=c.k, cx=sx+90;
    ctx.globalAlpha=on?1:0.3;
    ctx.fillStyle=c.col; ctx.globalAlpha=on?0.2:0.08; roundRect(ctx,cx,y-15,180,30,6); ctx.fill();
    ctx.globalAlpha=on?1:0.3; ctx.strokeStyle=c.col; ctx.lineWidth=1.4; roundRect(ctx,cx,y-15,180,30,6); ctx.stroke();
    ctx.fillStyle=on?'#fff':'rgba(255,255,255,0.4)'; ctx.font='11px monospace'; ctx.textAlign='center'; ctx.fillText(c.name,cx+90,y+4);
    // read arrow from stream
    ctx.strokeStyle=on?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.12)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(sx,y); ctx.lineTo(cx,y); ctx.stroke();
    // MHA neighbor arrows
    if(c.name.indexOf('Attention')>=0 && on){
      ctx.strokeStyle='rgba(255,140,66,0.5)'; ctx.setLineDash([4,3]); ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(cx+180,y-8); ctx.lineTo(W-12,y-8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+180,y+8); ctx.lineTo(W-12,y+8); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='rgba(255,140,66,0.7)'; ctx.font='8px monospace'; ctx.textAlign='left'; ctx.fillText('other tokens',W-86,y-12);
    }
    ctx.globalAlpha=1;
  });
  // add nodes
  adds.forEach(k=>{ const y=yAt(k), on=st>=k; ctx.fillStyle=on?'#3DDC84':'rgba(61,220,132,0.2)'; ctx.beginPath(); ctx.arc(sx,y,9,0,2*Math.PI); ctx.fill(); ctx.fillStyle=on?'#0B101F':'rgba(0,0,0,0.3)'; ctx.font='bold 12px monospace'; ctx.textAlign='center'; ctx.fillText('+',sx,y+4); });
  // input / output markers
  ctx.fillStyle='rgba(160,140,255,0.8)'; ctx.beginPath(); ctx.arc(sx,bot,7,0,2*Math.PI); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='10px monospace'; ctx.textAlign='right'; ctx.fillText('x  (input)',sx-12,bot+4);
  if(st>=6){ ctx.fillStyle='rgba(61,220,132,0.9)'; ctx.font='11px monospace'; ctx.textAlign='right'; ctx.fillText('h  (output)',sx-12,top+4); }
  ctx.textAlign='left';
}

// ── 8.3 VIZ: MASKED QKᵀ GRID ───────────────────────────────
const PMAT_BANK = ['So','long','and','thanks','for','all','the','fish','so','sad','that','it','should','come'];
let PMAT_TOKENS = PMAT_BANK.slice(0,5);
let _pmat = { mask:true, scores:null };
function pmatBuild(){ pmatReseed(); }
function pmatReseed(){
  const n=PMAT_TOKENS.length; _pmat.scores=[];
  for(let i=0;i<n;i++){ const row=[]; for(let j=0;j<n;j++){ row.push(0.3+Math.random()*2.2 + (i===j?0.8:0)); } _pmat.scores.push(row); }
  pmatDraw();
}
function pmatToggleMask(){ _pmat.mask=!_pmat.mask; const b=document.getElementById('pmat-mask-btn'); if(b) b.textContent='Causal mask: '+(_pmat.mask?'ON':'OFF'); pmatDraw(); }
function pmatDraw(){
  const cv=document.getElementById('pmat-canvas'); if(!cv||!_pmat.scores) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const n=PMAT_TOKENS.length, pad=70, gs=Math.min((W-pad-20),(H-pad-20))/n;
  const soft=document.getElementById('pmat-soft'); const showSoft=soft?soft.checked:true;
  // compute display values per row
  for(let i=0;i<n;i++){
    let rowvals=[];
    for(let j=0;j<n;j++){
      let v=_pmat.scores[i][j];
      if(_pmat.mask && j>i) v=-Infinity;
      rowvals.push(v);
    }
    if(showSoft){
      const valid=rowvals.filter(v=>v>-Infinity);
      const mx=Math.max(...valid), ex=rowvals.map(v=>v===-Infinity?0:Math.exp(v-mx)), Z=ex.reduce((a,b)=>a+b,0);
      rowvals=ex.map(e=>e/Z);
    }
    for(let j=0;j<n;j++){
      const x=pad+j*gs, y=pad+i*gs, masked=_pmat.mask&&j>i;
      if(masked){ ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.fillRect(x,y,gs-2,gs-2);
        if(gs>22){ ctx.fillStyle='rgba(255,95,142,0.4)'; ctx.font=(gs*0.22)+'px monospace'; ctx.textAlign='center'; ctx.fillText('\u2212\u221e',x+gs/2,y+gs/2+4); }
      } else {
        const v=rowvals[j];
        const intensity = showSoft ? v : Math.min(1,v/3.2);
        ctx.fillStyle='rgba(77,227,255,'+(0.08+intensity*0.85)+')'; ctx.fillRect(x,y,gs-2,gs-2);
        if(gs>22){ ctx.fillStyle=intensity>0.5?'#050A1C':'rgba(255,255,255,0.75)'; ctx.font=(gs*0.2)+'px monospace'; ctx.textAlign='center';
        ctx.fillText(showSoft?v.toFixed(2):v.toFixed(1),x+gs/2,y+gs/2+4); }
      }
    }
  }
  // labels
  ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='11px monospace';
  ctx.textAlign='right';
  ctx.font=(n>9?'8px':'11px')+' monospace';
  for(let i=0;i<n;i++) ctx.fillText(PMAT_TOKENS[i],pad-8,pad+i*gs+gs/2+4);
  ctx.textAlign='center'; ctx.save(); 
  for(let j=0;j<n;j++){ ctx.fillText(PMAT_TOKENS[j],pad+j*gs+gs/2,pad-10); }
  ctx.restore();
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('key j \u2192',pad,pad-28);
  ctx.save(); ctx.translate(pad-44,pad+n*gs/2); ctx.rotate(-Math.PI/2); ctx.textAlign='center'; ctx.fillText('query i \u2192',0,0); ctx.restore();
  pmatCost();
}
function pmatSetN(v){
  const n=parseInt(v);
  PMAT_TOKENS = PMAT_BANK.slice(0,n);
  const e=document.getElementById('pmat-nval'); if(e) e.textContent=n;
  pmatReseed();
}
function pmatCost(){
  const el=document.getElementById('pmat-cost'); if(!el) return;
  const n=PMAT_TOKENS.length, c=n*n, maxC=14*14;
  el.innerHTML='<div style="display:flex;align-items:center;gap:10px"><span style="font-family:var(--mono);font-size:.66rem;color:var(--muted);white-space:nowrap">cost meter</span>'
    +'<div style="flex:1;height:14px;background:var(--surface3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+(c/maxC*100).toFixed(1)+'%;background:linear-gradient(90deg,#4DE3FF,#FF5F8E);border-radius:4px;transition:width .25s"></div></div>'
    +'<span style="font-family:var(--mono);font-size:.66rem;color:var(--accent3);white-space:nowrap">N&sup2; = '+c+' score cells</span></div>'
    +'<div style="font-family:var(--mono);font-size:.58rem;color:var(--muted);margin-top:4px">Drag N and watch the grid grow quadratically. Doubling the context quadruples the attention work: this is why long context is expensive.</div>';
}

// ── 8.4 VIZ: TOKEN + POSITION ──────────────────────────────
const IE_VOCAB = ['dog','bites','man','the','fox','sees','a','hound'];
const IE_D = 8;
let _ie = { mode:'learned', slots:[0,1,2], posOn:true };
function _ieWordEmb(wi){ const v=[]; for(let d=0;d<IE_D;d++) v.push(Math.sin(wi*1.7+d*0.9)*0.8); return v; }
function _iePosEmb(pos){ const v=[]; for(let d=0;d<IE_D;d++){ if(_ie.mode==='sinusoid'){ const freq=Math.pow(10000,-(2*Math.floor(d/2))/IE_D); v.push(d%2===0?Math.sin(pos*freq):Math.cos(pos*freq)); } else { v.push(Math.sin(pos*2.3+d*1.4+11)*0.8); } } return v; }
function ieBuild(){
  const w=document.getElementById('ie-words'); if(!w) return;
  w.innerHTML=_ie.slots.map((wi,p)=>`<button onclick="ieCycle(${p})" style="background:var(--surface2);border:1px solid var(--border2);border-radius:7px;padding:.4rem .7rem;font-family:var(--mono);font-size:.74rem;color:var(--accent);cursor:pointer">${IE_VOCAB[wi]}<span style="color:var(--muted);font-size:.6rem">  #${p+1}</span></button>`).join('');
  ieSetMode(_ie.mode||'learned');
}
function ieCycle(p){ _ie.slots[p]=(_ie.slots[p]+1)%IE_VOCAB.length; ieBuild(); }
function ieSetMode(m){
  _ie.mode=m;
  document.querySelectorAll('.ie-mode-btn').forEach(b=>{ const on=b.dataset.mode===m; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  ieDraw();
}
function _ieCell(ctx,x,y,cw,ch,v){ const a=Math.min(1,Math.abs(v)); ctx.fillStyle=v>=0?'rgba(77,227,255,'+(0.15+a*0.7)+')':'rgba(255,95,142,'+(0.15+a*0.7)+')'; ctx.fillRect(x,y,cw-1,ch-1); }
function ieDraw(){
  const cv=document.getElementById('ie-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const n=_ie.slots.length, padL=78, padT=26, cw=(W-padL-20)/IE_D, rowH=20, gap=12;
  const labels=['word E', _ie.posOn?'+ pos P':'+ pos (OFF)', '= input X'];
  const fp=new Array(IE_D).fill(0);
  for(let p=0;p<n;p++){
    const word=_ieWordEmb(_ie.slots[p]);
    const pos=_ie.posOn?_iePosEmb(p):new Array(IE_D).fill(0);
    const comp=word.map((v,d)=>v+pos[d]);
    comp.forEach((v,d)=>fp[d]+=v);
    const rows=[word,pos,comp];
    const blockTop=padT+p*(rowH*3+gap+8);
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='10px monospace'; ctx.textAlign='left';
    ctx.fillText(IE_VOCAB[_ie.slots[p]]+'  #'+(p+1),4,blockTop+rowH);
    rows.forEach((r,ri)=>{
      const y=blockTop+ri*rowH;
      for(let d=0;d<IE_D;d++) _ieCell(ctx,padL+d*cw,y,cw,rowH,r[d]);
      ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace'; ctx.textAlign='right'; ctx.fillText(labels[ri],padL-6,y+rowH*0.7);
      if(ri<2){ ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='12px monospace'; ctx.textAlign='center'; ctx.fillText(ri===0?'+':'=',padL+IE_D*cw+12,y+rowH); }
    });
  }
  // order fingerprint: the sum over composite rows (what a pure bag-of-tokens sees)
  const fy=padT+n*(rowH*3+gap+8)+14;
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(4,fy-10); ctx.lineTo(W-10,fy-10); ctx.stroke();
  ctx.fillStyle='rgba(253,224,71,0.85)'; ctx.font='10px monospace'; ctx.textAlign='left'; ctx.fillText('order fingerprint  \u03a3 X[i]',4,fy+rowH*0.7-4);
  for(let d=0;d<IE_D;d++) _ieCell(ctx,padL+d*cw,fy,cw,rowH,fp[d]/2.2);
  const cap=document.getElementById('ie-caption');
  if(cap){
    let t=_ie.mode==='sinusoid' ? 'Sinusoidal positions: fixed sine and cosine waves at different frequencies; they generalize to unseen lengths. ' : 'Learned positions: one trained vector per slot. ';
    t+=_ie.posOn ? 'Try shuffle: with positions ON, the composite rows and the yellow fingerprint change, so word order is visible to the model.'
                 : 'Positions are OFF. Now hit shuffle: the fingerprint row never changes, dog-bites-man equals man-bites-dog. This is the bag-of-words failure positions exist to fix.';
    cap.textContent=t;
  }
}
function ieShuffle(){
  for(let i=_ie.slots.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=_ie.slots[i]; _ie.slots[i]=_ie.slots[j]; _ie.slots[j]=t; }
  ieBuild();
}
function ieTogglePos(){
  _ie.posOn=!_ie.posOn;
  const b=document.getElementById('ie-pos-btn');
  if(b){ b.textContent='positions: '+(_ie.posOn?'ON':'OFF'); b.style.color=_ie.posOn?'var(--text)':'var(--accent3)'; b.style.borderColor=_ie.posOn?'var(--border2)':'var(--accent3)'; }
  ieDraw();
}

// ── 8.5 VIZ: UNEMBEDDING HEAD ──────────────────────────────
const LMH_VOCAB=['fish','chips','rice','beans','toast','water'];
const LMH_E=[[0.9,0.2,-0.3,0.1],[0.7,0.4,-0.1,0.2],[-0.2,0.8,0.3,-0.1],[-0.4,0.6,0.5,0],[0.1,-0.3,0.7,0.4],[-0.6,-0.2,0.1,0.8]];
let _lmh={ h:[0.8,0.3,-0.2,0.1] };
function lmhBuild(){
  const s=document.getElementById('lmh-sliders'); if(!s) return;
  s.innerHTML=_lmh.h.map((v,i)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:3px">
    <span style="font-family:var(--mono);font-size:.6rem;color:var(--muted)">h[${i+1}]</span>
    <input type="range" min="-1" max="1" step="0.05" value="${v}" oninput="lmhSet(${i},this.value)" style="width:80px;accent-color:var(--accent)">
  </div>`).join('');
  lmhDraw();
}
function lmhSet(i,v){ _lmh.h[i]=parseFloat(v); lmhDraw(); }
function lmhDraw(){
  const cv=document.getElementById('lmh-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const logits=LMH_E.map(row=>row.reduce((s,e,d)=>s+e*_lmh.h[d],0));
  const mx=Math.max(...logits), ex=logits.map(l=>Math.exp(l-mx)), Z=ex.reduce((a,b)=>a+b,0), probs=ex.map(e=>e/Z);
  const n=LMH_VOCAB.length, rowH=(H-40)/n, midX=W/2;
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('logits  u = h\u00b7E\u1d40',W*0.26,18); ctx.fillText('softmax  y',W*0.76,18);
  const maxAbsL=Math.max(...logits.map(Math.abs),0.5);
  for(let i=0;i<n;i++){
    const y=30+i*rowH+rowH*0.2, bh=rowH*0.6;
    // logit bar (centered at midX-ish), grows left
    const lw=(logits[i]/maxAbsL)*(W*0.2);
    ctx.fillStyle=logits[i]>=0?'rgba(253,224,71,0.7)':'rgba(255,95,142,0.6)';
    const baseX=W*0.42;
    ctx.fillRect(Math.min(baseX,baseX+lw),y,Math.abs(lw),bh);
    ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText(LMH_VOCAB[i],midX,y+bh*0.7);
    // prob bar (right)
    const pw=probs[i]*(W*0.34);
    ctx.fillStyle=i===probs.indexOf(Math.max(...probs))?'#4DE3FF':'rgba(160,140,255,0.7)';
    ctx.fillRect(W*0.56,y,pw,bh);
    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText((probs[i]*100).toFixed(0)+'%',W*0.56+pw+4,y+bh*0.7);
  }
}

// ── 8.6 VIZ: TOP-K / TOP-P ─────────────────────────────────
const KP_CTX={
  peaked:[['Paris',.62],['France',.11],['a',.07],['the',.05],['Lyon',.04],['Nice',.03],['it',.03],['my',.02],['old',.02],['blue',.01]],
  flat:[['walked',.14],['ran',.13],['strolled',.12],['wandered',.11],['hurried',.10],['ambled',.10],['marched',.09],['crept',.08],['skipped',.07],['drifted',.06]]
};
let KP_DIST=KP_CTX.peaked;
let _kp={ mode:'topk', val:3, ctx:'peaked' };
function kpSetCtx(c){
  _kp.ctx=c; KP_DIST=KP_CTX[c];
  document.querySelectorAll('.kp-ctx-btn').forEach(b=>{ const on=b.dataset.ctx===c; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  kpDraw();
}
function kpBuild(){ kpSetCtx('peaked'); kpSetMode('topk'); }
function kpSetMode(m){
  _kp.mode=m;
  document.querySelectorAll('.kp-mode-btn').forEach(b=>{ const on=b.dataset.mode===m; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  const sl=document.getElementById('kp-slider'), lbl=document.getElementById('kp-label');
  if(!sl) return;
  if(m==='topk'){ sl.min=1; sl.max=10; sl.step=1; sl.value=3; _kp.val=3; if(lbl) lbl.textContent='k'; }
  else { sl.min=0.1; sl.max=1; sl.step=0.05; sl.value=0.7; _kp.val=0.7; if(lbl) lbl.textContent='p'; }
  kpSet(sl.value);
}
function kpSet(v){
  _kp.val=parseFloat(v);
  const vv=document.getElementById('kp-val'); if(vv) vv.textContent=_kp.mode==='topk'?String(Math.round(_kp.val)):_kp.val.toFixed(2);
  kpDraw();
}
function kpDraw(){
  const bars=document.getElementById('kp-bars'); if(!bars) return;
  let kept=new Array(KP_DIST.length).fill(false);
  if(_kp.mode==='topk'){ for(let i=0;i<Math.round(_kp.val);i++) kept[i]=true; }
  else { let cum=0; for(let i=0;i<KP_DIST.length;i++){ kept[i]=true; cum+=KP_DIST[i][1]; if(cum>=_kp.val) break; } }
  const keptSum=KP_DIST.reduce((s,d,i)=>s+(kept[i]?d[1]:0),0);
  const max=KP_DIST[0][1];
  bars.innerHTML=KP_DIST.map((d,i)=>{
    const h=(d[1]/max*100).toFixed(0);
    const renorm=kept[i]?(d[1]/keptSum*100).toFixed(0)+'%':'cut';
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end">
      <div style="font-family:var(--mono);font-size:.54rem;color:${kept[i]?'var(--accent)':'var(--muted)'}">${renorm}</div>
      <div style="width:74%;height:${h}%;background:${kept[i]?'linear-gradient(180deg,#4DE3FF,#A18FFF)':'rgba(255,255,255,0.08)'};border-radius:3px 3px 0 0;transition:all .2s"></div>
      <div style="font-family:var(--mono);font-size:.58rem;color:${kept[i]?'var(--text)':'rgba(255,255,255,0.25)'};margin-top:3px">${d[0]}</div>
    </div>`;
  }).join('');
  const cap=document.getElementById('kp-caption');
  const nkept=kept.filter(Boolean).length;
  if(cap){
    let t=_kp.mode==='topk' ? 'Top-k keeps the '+Math.round(_kp.val)+' most probable tokens ('+nkept+' shown), drops the rest, and renormalizes. k=1 is greedy decoding.' : 'Top-p keeps the smallest set whose probabilities reach '+_kp.val.toFixed(2)+': here '+nkept+' token'+(nkept>1?'s':'')+'.';
    if(_kp.mode==='topk' && _kp.ctx==='peaked' && Math.round(_kp.val)>=5) t+=' On this confident distribution, a fixed k is dragging in junk the model already ruled out.';
    if(_kp.mode==='topk' && _kp.ctx==='flat' && Math.round(_kp.val)<=3) t+=' On this flat distribution, the same fixed k chops off perfectly good candidates.';
    if(_kp.mode==='topp') t+=' Now flip the context: same p, different pool size. The nucleus breathes with the model\u2019s confidence, which is exactly what a fixed k cannot do.';
    cap.textContent=t;
  }
}

// ── 8.7 VIZ: PARALLEL TRAINING ─────────────────────────────
const PTRAIN_IN=['The','kettle','began','to','whistle'];
const PTRAIN_NEXT=['kettle','began','to','whistle','loudly'];
const PTRAIN_P=[0.06,0.22,0.81,0.35,0.44];
let _ptrain={ on:false };
function ptrainBuild(){ ptrainReset(); }
function ptrainReset(){ _ptrain.on=false; ptrainDraw(); const c=document.getElementById('ptrain-caption'); if(c) c.textContent='Each position predicts its next token. Press the button to score every position at once, the way a transformer trains.'; }
function ptrainRun(){ _ptrain.on=true; ptrainDraw(); const c=document.getElementById('ptrain-caption'); const avg=PTRAIN_P.reduce((s,p)=>s-Math.log(p),0)/PTRAIN_P.length; if(c) c.innerHTML='All '+PTRAIN_P.length+' losses computed in one parallel pass. Average cross-entropy = <span style="color:var(--accent3)">'+avg.toFixed(3)+'</span>. No position waited on another.'; }
function ptrainDraw(){
  const cv=document.getElementById('ptrain-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const n=PTRAIN_IN.length, pad=40, bw=(W-2*pad)/n, yIn=H-40, yLoss=60;
  for(let i=0;i<n;i++){
    const x=pad+i*bw+bw/2;
    // input token
    ctx.fillStyle='rgba(160,140,255,0.5)'; ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    roundRect(ctx,x-30,yIn-13,60,26,5); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='11px monospace'; ctx.textAlign='center'; ctx.fillText(PTRAIN_IN[i],x,yIn+4);
    // arrow up
    ctx.strokeStyle=_ptrain.on?'rgba(77,227,255,0.5)':'rgba(255,255,255,0.15)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(x,yIn-13); ctx.lineTo(x,yLoss+18); ctx.stroke();
    // loss cell
    const loss=-Math.log(PTRAIN_P[i]);
    ctx.fillStyle=_ptrain.on?'rgba(255,95,142,0.25)':'rgba(255,255,255,0.05)';
    roundRect(ctx,x-34,yLoss-18,68,36,6); ctx.fill();
    ctx.strokeStyle=_ptrain.on?'rgba(255,95,142,0.5)':'rgba(255,255,255,0.12)'; ctx.lineWidth=1; roundRect(ctx,x-34,yLoss-18,68,36,6); ctx.stroke();
    ctx.fillStyle=_ptrain.on?'#ff8aa0':'rgba(255,255,255,0.3)'; ctx.font='8px monospace';
    ctx.fillText('\u2212log y['+PTRAIN_NEXT[i]+']',x,yLoss-4);
    ctx.fillStyle=_ptrain.on?'#fff':'rgba(255,255,255,0.3)'; ctx.font='bold 12px monospace';
    ctx.fillText(_ptrain.on?loss.toFixed(2):'?',x,yLoss+12);
  }
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px monospace'; ctx.textAlign='left';
  ctx.fillText('per-token loss (all at once)',pad-10,24);
  ctx.fillText('input sequence',pad-10,H-10);
}

// ── 8.8 VIZ: SCALING LAW ───────────────────────────────────
const SCALE_NC=8.8e13, SCALE_AN=0.076;
let _scale={ logN:9 };
function _scaleLoss(logN){ const N=Math.pow(10,logN); return Math.pow(SCALE_NC/N, SCALE_AN); }
function _fmtN(logN){ const N=Math.pow(10,logN); if(N>=1e12) return (N/1e12).toFixed(1)+'T'; if(N>=1e9) return (N/1e9).toFixed(1)+'B'; if(N>=1e6) return (N/1e6).toFixed(0)+'M'; return N.toExponential(1); }
function scaleBuild(){ scaleSet(9); }
function scaleSet(v){ _scale.logN=parseFloat(v); const e=document.getElementById('scale-nval'); if(e) e.textContent=_fmtN(_scale.logN); scaleDraw(); }
function scaleDraw(){
  const cv=document.getElementById('scale-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, P=46;
  ctx.clearRect(0,0,W,H);
  const x0=6,x1=12, lossAt6=_scaleLoss(6), lossAt12=_scaleLoss(12);
  const yMax=lossAt6*1.05, yMin=lossAt12*0.92;
  const X=ln=>P+(ln-x0)/(x1-x0)*(W-P-20);
  const Y=l=>P-6+(yMax-l)/(yMax-yMin)*(H-P-30);
  // axes
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(P,P-6); ctx.lineTo(P,H-24); ctx.lineTo(W-20,H-24); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px monospace'; ctx.textAlign='center';
  for(let lx=6;lx<=12;lx++){ const x=X(lx); ctx.fillText('10^'+lx,x,H-8); ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(x,P-6); ctx.lineTo(x,H-24); ctx.stroke(); }
  ctx.save(); ctx.translate(14,H/2); ctx.rotate(-Math.PI/2); ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fillText('loss (log scale)',0,0); ctx.restore();
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fillText('parameters N (log scale)',W/2,H-8);
  // power-law line (straight on log-log)
  ctx.strokeStyle='#A18FFF'; ctx.lineWidth=2.5; ctx.beginPath();
  for(let lx=x0;lx<=x1;lx+=0.05){ const x=X(lx),y=Y(_scaleLoss(lx)); if(lx===x0)ctx.moveTo(x,y); else ctx.lineTo(x,y); }
  ctx.stroke();
  // marker
  const lx=_scale.logN, l=_scaleLoss(lx), mx=X(lx), my=Y(l);
  ctx.strokeStyle='rgba(77,227,255,0.4)'; ctx.setLineDash([4,3]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(mx,my); ctx.lineTo(mx,H-24); ctx.stroke(); ctx.beginPath(); ctx.moveTo(P,my); ctx.lineTo(mx,my); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#4DE3FF'; ctx.beginPath(); ctx.arc(mx,my,6,0,2*Math.PI); ctx.fill();
  ctx.fillStyle='#4DE3FF'; ctx.font='bold 11px monospace'; ctx.textAlign='left'; ctx.fillText('loss '+l.toFixed(2),mx+10,my-6);
  const cap=document.getElementById('scale-caption');
  if(cap) cap.textContent='A power law is a straight line on log-log axes. Doubling parameters gives a small, predictable drop in loss, which is how labs forecast a big model from small runs.';
}

// ── 8.9 VIZ: INDUCTION HEAD ────────────────────────────────
const IND_TOKENS=['vintage','cars','were','rare','then','she','bought','vintage'];
const IND_A=7, IND_PRIOR=0, IND_B=1;
let _ind={ step:0, ablate:false };
function indToggleAblate(on){ _ind.ablate=on; indDraw(); const c=document.getElementById('ind-caption'); if(c && _ind.step>0){ c.innerHTML = on ? 'Head knocked out: its W\u1d3c contribution is zeroed. Watch the prediction at the final step.' : 'Head restored. Step through again to watch the circuit fire.'; } }
function indBuild(){ indReset(); }
function indReset(){ _ind.step=0; indDraw(); const c=document.getElementById('ind-caption'); if(c) c.innerHTML='The current token is "<span style="color:var(--accent3)">vintage</span>" (call it A). The induction head will try to complete a repeated pattern.'; }
function indStep(){ if(_ind.step<3){ _ind.step++; indDraw(); const c=document.getElementById('ind-caption');
  const msg=['',
    'Prefix matching: scan back for an earlier "<span style="color:var(--accent)">vintage</span>". Found it near the start, and attend to it.',
    'Look at the token that came right after that earlier "vintage": it was "<span style="color:var(--accent4)">cars</span>" (call it B).',
    'Copying: raise the probability of "<span style="color:var(--accent4)">cars</span>". Prediction: <span style="color:var(--accent4)">cars</span>. The rule is A B \u2026 A \u2192 B.'];
  const msgAb=['',
    'The head tries to fire, but its output has been zeroed: the prefix-matching beam carries nothing.',
    'With the head ablated, nothing attends to what followed the earlier "vintage". The circuit is severed.',
    'No copying happens. The prediction collapses to a vague prior, the pattern-completion ability is gone. This is how researchers prove a circuit matters: remove it and measure what breaks.'];
  if(c) c.innerHTML=(_ind.ablate?msgAb:msg)[_ind.step]; } }
function indDraw(){
  const cv=document.getElementById('ind-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const n=IND_TOKENS.length, pad=20, bw=(W-2*pad)/n, y=H/2;
  const st=_ind.step;
  for(let i=0;i<n;i++){
    const x=pad+i*bw+bw/2;
    let col='rgba(255,255,255,0.06)', tcol='rgba(255,255,255,0.5)';
    if(i===IND_A){ col='rgba(255,95,142,0.3)'; tcol='#ff8aa0'; }
    if(st>=1 && i===IND_PRIOR){ col='rgba(77,227,255,0.3)'; tcol='#4DE3FF'; }
    if(st>=2 && i===IND_B){ col='rgba(61,220,132,0.3)'; tcol='#3DDC84'; }
    ctx.fillStyle=col; ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
    roundRect(ctx,x-bw*0.44,y-16,bw*0.88,32,6); ctx.fill(); ctx.stroke();
    ctx.fillStyle=tcol; ctx.font='10px monospace'; ctx.textAlign='center'; ctx.fillText(IND_TOKENS[i],x,y+4);
  }
  const ab=_ind.ablate;
  // prefix matching arc (A -> prior A)
  if(st>=1){
    const xa=pad+IND_A*bw+bw/2, xp=pad+IND_PRIOR*bw+bw/2;
    ctx.strokeStyle=ab?'rgba(255,255,255,0.18)':'rgba(77,227,255,0.7)'; ctx.lineWidth=2;
    if(ab) ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(xa,y-18); ctx.bezierCurveTo(xa,y-70,xp,y-70,xp,y-18); ctx.stroke(); ctx.setLineDash([]);
    if(!ab){
      ctx.fillStyle='rgba(77,227,255,0.7)'; ctx.beginPath(); ctx.moveTo(xp,y-18); ctx.lineTo(xp-4,y-26); ctx.lineTo(xp+4,y-26); ctx.fill();
    }
    ctx.fillStyle=ab?'rgba(255,95,142,0.85)':'rgba(77,227,255,0.7)'; ctx.font=ab?'bold 10px monospace':'9px monospace'; ctx.textAlign='center';
    ctx.fillText(ab?'\u2715 head ablated (W\u1d3c = 0)':'prefix matching',(xa+xp)/2,y-58);
  }
  // copying arc (B -> output)
  if(st>=2 && !ab){
    const xb=pad+IND_B*bw+bw/2;
    ctx.strokeStyle='rgba(61,220,132,0.6)'; ctx.setLineDash([4,3]); ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(xb,y+18); ctx.lineTo(xb,y+50); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='rgba(61,220,132,0.7)'; ctx.font='9px monospace'; ctx.textAlign='center'; ctx.fillText('copying',xb,y+64);
  }
  if(st>=3){
    if(!ab){
      ctx.fillStyle='rgba(61,220,132,0.9)'; ctx.font='bold 13px monospace'; ctx.textAlign='right';
      ctx.fillText('predict: cars',W-14,y+58);
    } else {
      // collapsed prediction: flat mini distribution
      ctx.fillStyle='rgba(255,95,142,0.9)'; ctx.font='bold 12px monospace'; ctx.textAlign='right';
      ctx.fillText('predict: ??? (uniform)',W-14,y+44);
      const words=['cars','the','a','old','were'];
      for(let i=0;i<5;i++){
        ctx.fillStyle='rgba(255,255,255,0.18)';
        ctx.fillRect(W-14-110+i*22,y+52,16,12);
      }
      ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='7px monospace'; ctx.textAlign='center';
      for(let i=0;i<5;i++) ctx.fillText(words[i],W-14-110+i*22+8,y+74);
    }
  }
}

// ── 8.0 VIZ: TOKEN ELEVATOR ────────────────────────────────
const RIDE_TOKENS=['So','long','and','thanks','for'];
const RIDE_NEXT={So:'long',long:'and',and:'thanks',thanks:'for','for':'all'};
const RIDE_FLOORS=['token id','embed + pos','block 1','block 2','block 3','final layer norm','unembed E\u1d40','softmax'];
let _ride={ tok:4, t:0, playing:false, zoom:false, anim:null };
function _rideSeed(a,b){ return Math.sin(a*12.9898+b*78.233)*0.9; }
function rideBuild(){
  const ch=document.getElementById('ride-chips'); if(!ch) return;
  ch.innerHTML=RIDE_TOKENS.map((w,i)=>'<button class="ride-chip" data-i="'+i+'" onclick="rideSetTok('+i+')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.35rem .7rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">'+w+'</button>').join('');
  _ride.t=0; _ride.playing=false; _ride.zoom=false;
  rideSetTok(4);
  if(_ride.anim) cancelAnimationFrame(_ride.anim);
  const loop=()=>{ const c=document.getElementById('ride-canvas'); if(!c){ _ride.anim=null; return; }
    if(_ride.playing){ _ride.t=Math.min(1,_ride.t+0.0045); if(_ride.t>=1) _ride.playing=false; }
    rideDraw(); _ride.anim=requestAnimationFrame(loop); };
  loop();
}
function rideSetTok(i){
  _ride.tok=i; _ride.t=0; _ride.playing=false;
  document.querySelectorAll('.ride-chip').forEach(b=>{ const on=+b.dataset.i===i; b.style.background=on?'var(--accent3)':'var(--surface2)'; b.style.color=on?'#fff':'var(--muted)'; b.style.borderColor=on?'var(--accent3)':'var(--border2)'; });
  rideDraw();
}
function ridePlay(){ if(_ride.zoom){ rideZoom(); } _ride.t=0; _ride.playing=true; }
function rideZoom(){
  _ride.zoom=!_ride.zoom;
  const b=document.getElementById('ride-zoom');
  if(b){ b.textContent=_ride.zoom?'Zoom in':'Zoom out'; b.style.color=_ride.zoom?'var(--accent)':'var(--muted)'; b.style.borderColor=_ride.zoom?'var(--accent)':'var(--border2)'; }
  rideDraw();
}
function _rideVecStrip(ctx,x,y,w,h,tok,floorF){
  const cells=6;
  for(let c=0;c<cells;c++){
    const f0=Math.floor(floorF), f1=Math.min(RIDE_FLOORS.length-1,f0+1), u=floorF-f0;
    const v0=_rideSeed(tok*7+c,f0*3), v1=_rideSeed(tok*7+c,f1*3);
    const v=v0*(1-u)+v1*u, a=Math.min(1,Math.abs(v));
    ctx.fillStyle=v>=0?'rgba(77,227,255,'+(0.2+a*0.7)+')':'rgba(255,95,142,'+(0.2+a*0.7)+')';
    ctx.fillRect(x+c*(w/cells),y,w/cells-1.5,h);
  }
  ctx.strokeStyle='rgba(255,255,255,0.35)'; ctx.lineWidth=1; ctx.strokeRect(x,y,w,h);
}
function rideDraw(){
  const cv=document.getElementById('ride-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const nF=RIDE_FLOORS.length, top=34, bot=H-34;
  const yAt=f=>bot-(f/(nF-1))*(bot-top);
  if(!_ride.zoom){
    // single shaft
    const sx=W*0.34;
    // shaft walls
    ctx.strokeStyle='rgba(77,227,255,0.22)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(sx-58,top-14); ctx.lineTo(sx-58,bot+14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx+58,top-14); ctx.lineTo(sx+58,bot+14); ctx.stroke();
    // floors + labels
    for(let f=0;f<nF;f++){
      const y=yAt(f), passed=_ride.t*(nF-1)>=f-0.02;
      ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(sx-58,y); ctx.lineTo(sx+58,y); ctx.stroke();
      const isBlock=f>=2&&f<=4;
      ctx.fillStyle=passed?(isBlock?'#ff8c42':'#4DE3FF'):'rgba(255,255,255,0.3)';
      ctx.font=(passed?'bold ':'')+'10px monospace'; ctx.textAlign='left';
      ctx.fillText(RIDE_FLOORS[f],sx+72,y+4);
      if(isBlock&&passed){ ctx.fillStyle='rgba(255,140,66,0.55)'; ctx.font='8px monospace'; ctx.fillText('LN \u2192 attention \u2192 + \u2192 LN \u2192 FFN \u2192 +',sx+72,y+15); }
    }
    // rider
    const f=_ride.t*(nF-1), y=yAt(f);
    ctx.shadowBlur=12; ctx.shadowColor='rgba(77,227,255,0.6)';
    _rideVecStrip(ctx,sx-45,y-11,90,22,_ride.tok,f);
    ctx.shadowBlur=0;
    ctx.fillStyle='#fff'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
    ctx.fillText(RIDE_TOKENS[_ride.tok],sx,y-17);
    // distribution at top when arrived
    if(_ride.t>=1){
      const nxt=RIDE_NEXT[RIDE_TOKENS[_ride.tok]];
      const words=[nxt,'the','and','so','it'];
      const probs=[0.52,0.16,0.12,0.11,0.09];
      const bx=W*0.70, bw=(W-bx-24)/5;
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='9px monospace'; ctx.textAlign='left';
      ctx.fillText('next-token distribution',bx,top-16);
      for(let i=0;i<5;i++){
        const bh=probs[i]*90, x=bx+i*bw;
        ctx.fillStyle=i===0?'#3DDC84':'rgba(160,140,255,0.55)';
        ctx.fillRect(x,top+92-bh,bw*0.7,bh);
        ctx.fillStyle='rgba(255,255,255,0.65)'; ctx.font='8px monospace'; ctx.textAlign='center';
        ctx.fillText(words[i],x+bw*0.35,top+104);
      }
    }
    const cap=document.getElementById('ride-caption');
    if(cap){
      if(_ride.t<=0) cap.innerHTML='Press <b>Ride</b>. The strip is the token&rsquo;s running vector; each floor will visibly change it.';
      else if(_ride.t<1){ const f2=Math.min(nF-1,Math.round(_ride.t*(nF-1))); cap.innerHTML='Floor: <span style="color:var(--accent)">'+RIDE_FLOORS[f2]+'</span> &mdash; the module reads the stream and adds its contribution back in. The vector you see is the residual stream itself.'; }
      else cap.innerHTML='Arrived. The top vector went through E\u1d40 and softmax, and out came a distribution: &ldquo;'+RIDE_TOKENS[_ride.tok]+'&rdquo; \u2192 most likely &ldquo;<span style="color:var(--accent4)">'+RIDE_NEXT[RIDE_TOKENS[_ride.tok]]+'</span>&rdquo;. Now zoom out.';
    }
  } else {
    // five parallel shafts
    const n=RIDE_TOKENS.length, pad=54, sw=(W-2*pad)/n;
    const T=performance.now()/1000;
    for(let s=0;s<n;s++){
      const sx=pad+s*sw+sw/2;
      ctx.strokeStyle='rgba(77,227,255,0.35)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(sx,bot+6); ctx.lineTo(sx,top+22); ctx.stroke();
      // bottom token
      ctx.fillStyle='rgba(160,140,255,0.7)'; roundRect(ctx,sx-28,bot+2,56,22,5); ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='10px monospace'; ctx.textAlign='center'; ctx.fillText(RIDE_TOKENS[s],sx,bot+17);
      // top prediction
      ctx.fillStyle='rgba(61,220,132,0.25)'; roundRect(ctx,sx-30,top-8,60,22,5); ctx.fill();
      ctx.strokeStyle='rgba(61,220,132,0.6)'; ctx.lineWidth=1; roundRect(ctx,sx-30,top-8,60,22,5); ctx.stroke();
      ctx.fillStyle='#3DDC84'; ctx.font='9px monospace'; ctx.fillText('\u2192 '+RIDE_NEXT[RIDE_TOKENS[s]],sx,top+7);
    }
    // sideways attention arrows at block heights (reach left only: causal)
    ctx.setLineDash([4,4]); ctx.lineDashOffset=-((T*24)%16);
    for(let f=2;f<=4;f++){
      const y=yAt(f);
      for(let s=1;s<n;s++){
        const x1=pad+s*sw+sw/2, tgt=(s+f)%s, x0=pad+tgt*sw+sw/2;
        ctx.strokeStyle='rgba(255,140,66,'+(0.16+0.1*((s+f)%2))+')'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(x1-6,y); ctx.quadraticCurveTo((x0+x1)/2,y-18,x0+6,y); ctx.stroke();
      }
      ctx.fillStyle='rgba(255,140,66,0.5)'; ctx.font='8px monospace'; ctx.textAlign='left';
      ctx.fillText('block '+(f-1)+': attention reaches sideways (left only)',8,y-4);
    }
    ctx.setLineDash([]);
    const cap=document.getElementById('ride-caption');
    if(cap) cap.innerHTML='The zoomed-out truth: every position rides its own elevator <b>in parallel</b>, each emitting its own prediction. The dashed orange arcs are attention, the only module that crosses between shafts, and it only reaches backwards: causal.';
  }
}

// ── 8.1 VIZ: QKV ASSEMBLY LINE ─────────────────────────────
const QKV_TOK=['the','cat','sat'];
const QKV_X=[[0.6,0.1,-0.4,0.2],[-0.2,0.5,0.3,-0.1],[0.4,-0.3,0.2,0.5]];
const QKV_WQ=[[0.5,-0.3],[0.2,0.6],[-0.4,0.1],[0.3,0.2]];
const QKV_WK=[[0.3,0.4],[-0.5,0.2],[0.2,-0.3],[0.1,0.5]];
const QKV_WV=[[0.4,0.1],[0.2,-0.4],[-0.3,0.3],[0.5,0.2]];
const QKV_WO=[[0.5,-0.2,0.3,0.1],[-0.1,0.4,0.2,-0.3]];
function _mv(x,Wm){ const out=[]; for(let c=0;c<Wm[0].length;c++){ let s=0; for(let r=0;r<x.length;r++) s+=x[r]*Wm[r][c]; out.push(s); } return out; }
function _dot(a,b){ return a.reduce((s,v,i)=>s+v*b[i],0); }
let _qkv={ step:0 };
const QKV_CAPS=[
  'Stage 1 &mdash; the bench. Three token vectors x\u2081, x\u2082, x\u2083, each of shape [1\u00d7d] with d = 4. We will compute the attention output a\u2083 for the last token.',
  'Stage 2 &mdash; three jobs. W\u1d40, W\u1d37, W\u1d5b project each token into its roles: x\u2083 becomes the <b>query</b> q\u2083 (the one asking); every token contributes a <b>key</b> (what it advertises) and a <b>value</b> (what it will hand over). Shapes: [1\u00d7d\u2096] with d\u2096 = 2.',
  'Stage 3 &mdash; raw scores. The query is dotted against each key: s\u2c7c = q\u2083 \u00b7 k\u2c7c. Bigger dot product = the key advertises something the query wants.',
  'Stage 4 &mdash; the \u221ad\u2096 rescue. Divide each score by \u221a2. With big d\u2096, raw dot products grow large and the softmax saturates into a one-hot; scaling keeps it soft. Try the checkbox to see the failure.',
  'Stage 5 &mdash; softmax. The scaled scores become the attention weights \u03b1\u2083,\u2c7c: positive, summing to one. This is the distribution you saw as beams in the demo above.',
  'Stage 6 &mdash; weigh the values. Each value vector is scaled by its weight: \u03b1\u2083,\u2c7c v\u2c7c. High-attention tokens hand over more of their content.',
  'Stage 7 &mdash; the sum. Add the weighted values: head\u2083 = \u03a3 \u03b1\u2083,\u2c7c v\u2c7c, shape [1\u00d7d\u1d65]. Attention really is just a weighted average of the past.',
  'Stage 8 &mdash; W\u1d3c reshapes head\u2083 back to [1\u00d7d], giving a\u2083, ready to be added into the residual stream. Done: eight moves, no mysteries.'
];
function qkvBuild(){ _qkv.step=0; qkvDraw(); }
function qkvStep(d){ _qkv.step=Math.max(0,Math.min(7,_qkv.step+d)); qkvDraw(); }
function _qkvChip(ctx,x,y,vals,lab,col,shape){
  const cw=26, h=20;
  for(let i=0;i<vals.length;i++){
    const v=vals[i], a=Math.min(1,Math.abs(v)*1.4);
    ctx.fillStyle=v>=0?'rgba(77,227,255,'+(0.15+a*0.6)+')':'rgba(255,95,142,'+(0.15+a*0.6)+')';
    ctx.fillRect(x+i*cw,y,cw-1,h);
    ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.font='8px monospace'; ctx.textAlign='center';
    ctx.fillText(v.toFixed(1),x+i*cw+cw/2,y+13);
  }
  ctx.strokeStyle=col; ctx.lineWidth=1; ctx.strokeRect(x,y,cw*vals.length,h);
  ctx.fillStyle=col; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText(lab,x+cw*vals.length/2,y-5);
  if(shape){ ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='7px monospace'; ctx.fillText(shape,x+cw*vals.length/2,y+h+9); }
}
function qkvDraw(){
  const cv=document.getElementById('qkv-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, st=_qkv.step;
  ctx.clearRect(0,0,W,H);
  const si=document.getElementById('qkv-stage'); if(si) si.textContent='stage '+(st+1)+' / 8';
  const nos=document.getElementById('qkv-noscale'); const noscale=nos?nos.checked:false;
  const q3=_mv(QKV_X[2],QKV_WQ), ks=QKV_X.map(x=>_mv(x,QKV_WK)), vs=QKV_X.map(x=>_mv(x,QKV_WV));
  const raw=ks.map(k=>_dot(q3,k));
  const eff=raw.map(s=>noscale?s*3.2:s/Math.sqrt(2));
  const mx=Math.max(...eff), ex=eff.map(s=>Math.exp(s-mx)), Z=ex.reduce((a,b)=>a+b,0), al=ex.map(e=>e/Z);
  const wv=vs.map((v,j)=>v.map(c=>c*al[j]));
  const head=[0,1].map(c=>wv.reduce((s,v)=>s+v[c],0));
  const a3=_mv(head,QKV_WO);
  // bench: inputs bottom
  const by=H-46;
  for(let j=0;j<3;j++) _qkvChip(ctx,26+j*140,by,QKV_X[j],'x'+(j+1)+' \u00b7 '+QKV_TOK[j],'rgba(160,140,255,0.8)','[1\u00d7d]');
  if(st>=1){
    const py=H-118;
    _qkvChip(ctx,470,by,q3,'q\u2083','#FF5F8E','[1\u00d7d\u2096]');
    for(let j=0;j<3;j++){ _qkvChip(ctx,26+j*140,py,ks[j],'k'+(j+1),'#fde047',null); _qkvChip(ctx,96+j*140-4,py,vs[j],'v'+(j+1),'#4DE3FF',null); }
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='8px monospace'; ctx.textAlign='left';
    ctx.fillText('projection lenses: W\u1d40  W\u1d37  W\u1d5b',26,py+34);
  }
  if(st>=2){
    const sy=H-176;
    for(let j=0;j<3;j++){
      const x=26+j*140+26;
      ctx.strokeStyle='rgba(255,95,142,0.45)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(496,by-4); ctx.lineTo(x+16,sy+26); ctx.stroke();
      const show=(st===2)?raw[j]:eff[j];
      ctx.fillStyle='rgba(255,255,255,0.08)'; roundRect(ctx,x-14,sy,62,20,5); ctx.fill();
      ctx.strokeStyle=st===3?(noscale?'#FF5F8E':'#4DE3FF'):'rgba(255,255,255,0.25)'; roundRect(ctx,x-14,sy,62,20,5); ctx.stroke();
      ctx.fillStyle='#fff'; ctx.font='9px monospace'; ctx.textAlign='center';
      ctx.fillText('s'+(j+1)+' = '+show.toFixed(2),x+17,sy+13);
    }
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText(st===2?'raw scores  q\u2083\u00b7k\u2c7c':(noscale?'UNSCALED (pretend d\u2096 large)':'scaled  q\u2083\u00b7k\u2c7c / \u221ad\u2096'),26,sy-6);
  }
  if(st>=4){
    const ay=34, bw=54;
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText('softmax \u2192 attention weights \u03b1\u2083,\u2c7c'+(noscale?'  (saturated!)':''),26,ay-8);
    for(let j=0;j<3;j++){
      const x=26+j*140;
      ctx.fillStyle=noscale?'rgba(255,95,142,0.75)':'rgba(77,227,255,0.75)';
      ctx.fillRect(x,ay+40-al[j]*38,bw,al[j]*38);
      ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.strokeRect(x,ay+2,bw,38);
      ctx.fillStyle='#fff'; ctx.font='9px monospace'; ctx.textAlign='center';
      ctx.fillText('\u03b1='+al[j].toFixed(2),x+bw/2,ay+52);
    }
  }
  if(st>=5){
    for(let j=0;j<3;j++) _qkvChip(ctx,26+j*140+66,34+2,wv[j],'\u03b1v'+(j+1),'rgba(77,227,255,0.6)',null);
  }
  if(st>=6) _qkvChip(ctx,470,70,head,'head\u2083 = \u03a3','#A18FFF','[1\u00d7d\u1d65]');
  if(st>=7){
    ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.moveTo(500,96); ctx.lineTo(500,120); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace'; ctx.textAlign='center'; ctx.fillText('\u00d7 W\u1d3c',516,110);
    ctx.shadowBlur=10; ctx.shadowColor='rgba(61,220,132,0.6)';
    _qkvChip(ctx,470-26,126,a3,'a\u2083  (output!)','#3DDC84','[1\u00d7d]');
    ctx.shadowBlur=0;
  }
  const cap=document.getElementById('qkv-caption'); if(cap) cap.innerHTML=QKV_CAPS[st];
}

// ── 8.1 VIZ: MULTI-HEAD SPECIALIZATION ─────────────────────
const MH_TOK=['the','quick','bird','saw','the','worms','and','ate','them'];
const MH_HEADS=[
  {name:'coreference', col:'#FF5F8E', arcs:[[8,5,0.9]]},
  {name:'verb \u2192 subject', col:'#ff8c42', arcs:[[3,2,0.8],[7,2,0.75]]},
  {name:'adjective \u2192 noun', col:'#fde047', arcs:[[1,2,0.85]]},
  {name:'previous token', col:'#4DE3FF', arcs:[[1,0,0.5],[2,1,0.5],[3,2,0.5],[4,3,0.5],[5,4,0.5],[6,5,0.5],[7,6,0.5],[8,7,0.5]]}
];
let _mh={ on:[true,true,true,true] };
function mhBuild(){
  const t=document.getElementById('mh-toggles'); if(!t) return;
  t.innerHTML=MH_HEADS.map((h,i)=>'<label style="display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:.68rem;color:'+h.col+';cursor:pointer"><input type="checkbox" checked onchange="mhToggle('+i+',this.checked)" style="accent-color:'+h.col+'"> head '+(i+1)+' \u00b7 '+h.name+'</label>').join('');
  _mh.on=[true,true,true,true];
  mhDraw();
}
function mhToggle(i,on){ _mh.on[i]=on; mhDraw(); }
function mhDraw(){
  const cv=document.getElementById('mh-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const n=MH_TOK.length, pad=24, bw=(W-2*pad)/n, yTok=H-96;
  // arcs
  MH_HEADS.forEach((h,hi)=>{
    if(!_mh.on[hi]) return;
    h.arcs.forEach(([a,b,w])=>{
      const xa=pad+a*bw+bw/2, xb=pad+b*bw+bw/2;
      const lift=26+hi*16+Math.abs(xa-xb)*0.12;
      ctx.strokeStyle=h.col; ctx.globalAlpha=0.35+w*0.5; ctx.lineWidth=0.8+w*2.4;
      ctx.beginPath(); ctx.moveTo(xa,yTok-14); ctx.quadraticCurveTo((xa+xb)/2,yTok-14-lift,xb,yTok-14); ctx.stroke();
      ctx.globalAlpha=0.9; ctx.fillStyle=h.col;
      ctx.beginPath(); ctx.arc(xb,yTok-14,2.4,0,2*Math.PI); ctx.fill();
      ctx.globalAlpha=1;
    });
  });
  // tokens
  for(let i=0;i<n;i++){
    const x=pad+i*bw+bw/2;
    ctx.fillStyle='rgba(255,255,255,0.07)'; roundRect(ctx,x-bw*0.44,yTok-12,bw*0.88,24,5); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=1; roundRect(ctx,x-bw*0.44,yTok-12,bw*0.88,24,5); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText(MH_TOK[i],x,yTok+4);
  }
  // concat bar -> WO -> a_i
  const cy=yTok+40, cw=280, cx=(W-cw)/2, seg=cw/4;
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText('concatenated head outputs',W/2,cy-8);
  MH_HEADS.forEach((h,hi)=>{
    const x=cx+hi*seg;
    if(_mh.on[hi]){ ctx.fillStyle=h.col; ctx.globalAlpha=0.75; ctx.fillRect(x,cy,seg-2,18); ctx.globalAlpha=1; }
    else {
      ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.strokeRect(x,cy,seg-2,18);
      ctx.strokeStyle='rgba(255,255,255,0.12)';
      for(let s=0;s<seg;s+=7){ ctx.beginPath(); ctx.moveTo(x+s,cy+18); ctx.lineTo(Math.min(x+s+8,x+seg-2),cy+18-Math.min(18,8)); ctx.stroke(); }
    }
    ctx.fillStyle=_mh.on[hi]?'#0B101F':'rgba(255,255,255,0.3)'; ctx.font='bold 8px monospace';
    ctx.fillText('h'+(hi+1),x+seg/2,cy+12);
  });
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='11px monospace';
  ctx.fillText('\u2192  W\u1d3c  \u2192',cx+cw+42,cy+13);
  const non=_mh.on.filter(Boolean).length;
  ctx.fillStyle=non>0?'#3DDC84':'rgba(255,255,255,0.25)'; ctx.font='bold 11px monospace';
  ctx.fillText('a\u1d62',cx+cw+96,cy+13);
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace';
  ctx.fillText(non+' of 4 heads contributing',W/2,cy+36);
}

// ── 8.2 VIZ: LAYER NORM INSPECTOR ──────────────────────────
let _lnv={ x:[3.1,2.2,4.0,1.4,2.8,3.6,0.9,2.5], t:0, g:1, b:0, pre:true, anim:null };
function lnvBuild(){ _lnv.t=0; lnvDraw(); }
function lnvReset(){ _lnv.x=_lnv.x.map(()=>+(Math.random()*4).toFixed(1)); _lnv.t=0; lnvDraw(); }
function lnvSet(k,v){ _lnv[k]=parseFloat(v); const e=document.getElementById('lnv-'+k+'v'); if(e) e.textContent=_lnv[k].toFixed(2); lnvDraw(); }
function lnvTogglePre(){ _lnv.pre=!_lnv.pre; const b=document.getElementById('lnv-pre'); if(b){ b.textContent=_lnv.pre?'prenorm':'postnorm'; b.style.color=_lnv.pre?'var(--accent)':'var(--accent3)'; b.style.borderColor=_lnv.pre?'var(--accent)':'var(--accent3)'; } lnvDraw(); }
function lnvGo(){
  if(_lnv.anim) cancelAnimationFrame(_lnv.anim);
  const t0=performance.now();
  const loop=now=>{ _lnv.t=Math.min(1,(now-t0)/900); lnvDraw(); if(_lnv.t<1) _lnv.anim=requestAnimationFrame(loop); else _lnv.anim=null; };
  _lnv.anim=requestAnimationFrame(loop);
}
function lnvDraw(){
  const cv=document.getElementById('lnv-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const x=_lnv.x, d=x.length;
  const mu=x.reduce((a,b)=>a+b,0)/d;
  const sg=Math.sqrt(x.reduce((s,v)=>s+(v-mu)*(v-mu),0)/d)||1;
  const z=x.map(v=>(v-mu)/sg);
  const out=z.map(v=>_lnv.g*v+_lnv.b);
  const disp=x.map((v,i)=>v*(1-_lnv.t)+out[i]*_lnv.t);
  const plotW=W*0.62, bw=plotW/d, x0=36, midY=H*0.52, scale=26;
  // zero line
  ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x0-8,midY); ctx.lineTo(x0+plotW,midY); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace'; ctx.textAlign='right'; ctx.fillText('0',x0-12,midY+3);
  // bars
  for(let i=0;i<d;i++){
    const v=disp[i], h=v*scale, bx=x0+i*bw;
    ctx.fillStyle=v>=0?'rgba(77,227,255,0.7)':'rgba(255,95,142,0.7)';
    ctx.fillRect(bx,Math.min(midY,midY-h),bw*0.7,Math.abs(h));
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='8px monospace'; ctx.textAlign='center';
    ctx.fillText(v.toFixed(1),bx+bw*0.35,midY-h+(v>=0?-4:11));
  }
  // mean marker on displayed values
  const dmu=disp.reduce((a,b)=>a+b,0)/d;
  const dsg=Math.sqrt(disp.reduce((s,v)=>s+(v-dmu)*(v-dmu),0)/d);
  ctx.strokeStyle='rgba(253,224,71,0.7)'; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(x0-8,midY-dmu*scale); ctx.lineTo(x0+plotW,midY-dmu*scale); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#fde047'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('\u03bc = '+dmu.toFixed(2)+'   \u03c3 = '+dsg.toFixed(2),x0,20);
  // pre/post schematic on the right
  const px=W*0.72, pw=W-px-14;
  ctx.fillStyle='rgba(255,255,255,0.06)'; roundRect(ctx,px,26,pw,H-52,8); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace'; ctx.textAlign='center';
  ctx.fillText(_lnv.pre?'PRENORM (modern)':'POSTNORM (original)',px+pw/2,42);
  const cxm=px+pw/2, steps=_lnv.pre?['LN','attn','+ x']:['attn','+ x','LN'];
  steps.forEach((s,i)=>{
    const y=64+i*46;
    ctx.fillStyle=s==='LN'?'rgba(253,224,71,0.25)':(s==='attn'?'rgba(255,140,66,0.25)':'rgba(61,220,132,0.25)');
    roundRect(ctx,cxm-34,y,68,26,5); ctx.fill();
    ctx.strokeStyle=s==='LN'?'#fde047':(s==='attn'?'#ff8c42':'#3DDC84'); ctx.lineWidth=1; roundRect(ctx,cxm-34,y,68,26,5); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='9px monospace'; ctx.fillText(s,cxm,y+16);
    if(i<2){ ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.moveTo(cxm,y+26); ctx.lineTo(cxm,y+46); ctx.stroke(); }
  });
  const cap=document.getElementById('lnv-caption');
  if(cap){
    if(_lnv.t<=0) cap.innerHTML='A raw d-dimensional vector with messy statistics. Press <b>Normalize</b> to watch the z-score happen.';
    else if(_lnv.t<1) cap.innerHTML='Re-centering to mean 0, rescaling to std 1\u2026';
    else cap.innerHTML='Normalized. Note the output stats: \u03bc = \u03b2 = '+_lnv.b.toFixed(2)+' and \u03c3 = \u03b3 = '+_lnv.g.toFixed(2)+'. The learned \u03b3 and \u03b2 give the network back the freedom the z-score took away. '+(_lnv.pre?'Prenorm feeds this clean vector INTO each component; it trains more stably and is the modern default.':'Postnorm normalizes AFTER the residual add, the original 2017 design, harder to train at depth.');
  }
}

// ── 8.2 VIZ: TOKEN-MIXING RIBBON ───────────────────────────
let _mix={ t:-1, anim:null };
function mixBuild(){ _mix.t=-1; mixDraw(); }
function mixPlay(){
  if(_mix.anim) cancelAnimationFrame(_mix.anim);
  const t0=performance.now();
  const loop=now=>{ _mix.t=Math.min(1.6,(now-t0)/1100); mixDraw(); if(_mix.t<1.6) _mix.anim=requestAnimationFrame(loop); else _mix.anim=null; };
  _mix.anim=requestAnimationFrame(loop);
}
function mixDraw(){
  const cv=document.getElementById('mix-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const xa=W*0.3, xb=W*0.7, top=26, bot=H-30;
  [[xa,'token A','#A18FFF'],[xb,'token B','#4DE3FF']].forEach(([x,lab,col])=>{
    ctx.strokeStyle=col; ctx.globalAlpha=0.55; ctx.lineWidth=4; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(x,bot); ctx.lineTo(x,top); ctx.stroke(); ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText(lab,x,bot+18);
    ctx.fillText('residual stream',x,top-10);
  });
  const y0=bot-58, y1=bot-96;
  if(_mix.t>=0){
    const f=Math.min(1,_mix.t);
    // ribbon path
    ctx.strokeStyle='rgba(255,95,142,0.6)'; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(xa,y0);
    const mxx=(xa+xb)/2, mxy=(y0+y1)/2-34;
    const steps=30, upto=Math.floor(steps*f);
    for(let s=1;s<=upto;s++){
      const u=s/steps, iu=1-u;
      ctx.lineTo(iu*iu*xa+2*iu*u*mxx+u*u*xb, iu*iu*y0+2*iu*u*mxy+u*u*y1);
    }
    ctx.stroke();
    // particles
    for(let p=0;p<4;p++){
      const u=Math.max(0,Math.min(1,f-p*0.08)); const iu=1-u;
      const px2=iu*iu*xa+2*iu*u*mxx+u*u*xb, py2=iu*iu*y0+2*iu*u*mxy+u*u*y1;
      ctx.fillStyle='rgba(255,95,142,0.9)'; ctx.shadowBlur=8; ctx.shadowColor='rgba(255,95,142,0.8)';
      ctx.beginPath(); ctx.arc(px2,py2,3.4,0,2*Math.PI); ctx.fill(); ctx.shadowBlur=0;
    }
    if(_mix.t>=1){
      const glow=Math.min(1,(_mix.t-1)/0.5);
      ctx.strokeStyle='rgba(255,95,142,'+(0.7*glow)+')'; ctx.lineWidth=7; ctx.globalAlpha=0.5;
      ctx.beginPath(); ctx.moveTo(xb,y1); ctx.lineTo(xb,top); ctx.stroke(); ctx.globalAlpha=1;
      ctx.fillStyle='rgba(255,95,142,0.9)'; ctx.font='9px monospace'; ctx.textAlign='left';
      ctx.fillText('B now carries A\u2019s information upward',xb+14,y1-8);
    }
  }
  ctx.fillStyle='rgba(255,140,66,0.7)'; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText('attention head',(xa+xb)/2,(y0+y1)/2-40);
  const cap=document.getElementById('mix-caption');
  if(cap && _mix.t>=1.5) cap.innerHTML='The head read from A\u2019s stream, transformed it through W\u1d5b and W\u1d3c, and <b>added</b> the result into B\u2019s stream. B\u2019s original content is untouched underneath: streams accumulate, they are never overwritten.';
}

// ── 8.2 VIZ: STACK SLIDER ──────────────────────────────────
let _stk={ n:12 };
function stkBuild(){ stkSet(12); }
function stkSet(v){ _stk.n=parseInt(v); const e=document.getElementById('stk-val'); if(e) e.textContent=_stk.n; stkDraw(); }
function stkDraw(){
  const cv=document.getElementById('stk-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, n=_stk.n;
  ctx.clearRect(0,0,W,H);
  const cx=W*0.32, top=18, bot=H-30, avail=bot-top;
  const bh=Math.min(16,(avail-4)/n), colW=150;
  for(let i=0;i<n;i++){
    const y=bot-(i+1)*(avail/n);
    ctx.fillStyle='rgba(255,140,66,'+(0.14+0.5*(i/Math.max(1,n-1)))+')';
    ctx.fillRect(cx-colW/2,y+1,colW,Math.max(1.5,avail/n-2));
  }
  ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=1;
  ctx.strokeRect(cx-colW/2,top,colW,avail);
  ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('[N\u00d7d] in',cx,bot+16);
  ctx.fillText('[N\u00d7d] out',cx,top-6);
  // reference marks
  const marks=[[12,'GPT-2 small'],[96,'GPT-3'],[126,'Llama 3.1 405B']];
  ctx.textAlign='left';
  marks.forEach(([m,lab])=>{
    const y=bot-(m/126)*avail;
    ctx.strokeStyle=n>=m?'rgba(77,227,255,0.5)':'rgba(255,255,255,0.12)';
    ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(cx+colW/2+8,y); ctx.lineTo(cx+colW/2+40,y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle=n>=m?'#4DE3FF':'rgba(255,255,255,0.3)'; ctx.font='9px monospace';
    ctx.fillText(m+' \u00b7 '+lab,cx+colW/2+46,y+3);
  });
  const cap=document.getElementById('stk-caption');
  if(cap) cap.textContent=n+' identical blocks stacked. Same shape in, same shape out, so depth is free to grow: the only cost is compute.';
}

// ── 8.5 VIZ: WEIGHT-TYING MIRROR ───────────────────────────
let _mir={ sel:1 };
function mirBuild(){
  const c=document.getElementById('mir-chips'); if(!c) return;
  c.innerHTML=LMH_VOCAB.map((w,i)=>'<button class="mir-chip" data-i="'+i+'" onclick="mirSel('+i+')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.35rem .7rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">'+w+'</button>').join('');
  mirSel(1);
}
function mirSel(i){
  _mir.sel=i;
  document.querySelectorAll('.mir-chip').forEach(b=>{ const on=+b.dataset.i===i; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  mirDraw();
}
function mirDraw(){
  const cv=document.getElementById('mir-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, sel=_mir.sel;
  ctx.clearRect(0,0,W,H);
  const rows=LMH_E.length, cols=4, cw=30, rh=24;
  const gx=(W-cols*cw)/2, gy=(H-rows*rh)/2;
  // matrix E
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const v=LMH_E[r][c], a=Math.min(1,Math.abs(v)*1.1);
    ctx.fillStyle=v>=0?'rgba(77,227,255,'+(0.12+a*0.5)+')':'rgba(255,95,142,'+(0.12+a*0.5)+')';
    ctx.fillRect(gx+c*cw,gy+r*rh,cw-1.5,rh-1.5);
  }
  // selected row highlight
  ctx.strokeStyle='#fde047'; ctx.lineWidth=2;
  ctx.strokeRect(gx-2,gy+sel*rh-2,cols*cw+3,rh+2);
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('E  (the ONE matrix)',gx+cols*cw/2,gy-12);
  for(let r=0;r<rows;r++){ ctx.fillStyle=r===sel?'#fde047':'rgba(255,255,255,0.35)'; ctx.font='9px monospace'; ctx.textAlign='right'; ctx.fillText(LMH_VOCAB[r],gx-10,gy+r*rh+rh*0.65); }
  // LEFT: embedding direction
  const ly=gy+sel*rh+rh/2;
  ctx.strokeStyle='rgba(160,140,255,0.7)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(48,ly); ctx.lineTo(gx-56,ly); ctx.stroke();
  ctx.fillStyle='rgba(160,140,255,0.7)'; ctx.beginPath(); ctx.moveTo(gx-56,ly); ctx.lineTo(gx-64,ly-4); ctx.lineTo(gx-64,ly+4); ctx.fill();
  ctx.fillStyle='#A18FFF'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('IN: one-hot \u00d7 E',12,ly-26);
  ctx.fillText('picks ROW '+(sel+1),12,ly-14);
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='8px monospace';
  ctx.fillText('"'+LMH_VOCAB[sel]+'" \u2192 [1\u00d7d] vector',12,ly+18);
  // RIGHT: unembedding direction
  ctx.strokeStyle='rgba(61,220,132,0.7)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(gx+cols*cw+56,ly); ctx.lineTo(gx+cols*cw+8,ly); ctx.stroke();
  ctx.fillStyle='rgba(61,220,132,0.7)'; ctx.beginPath(); ctx.moveTo(gx+cols*cw+8,ly); ctx.lineTo(gx+cols*cw+16,ly-4); ctx.lineTo(gx+cols*cw+16,ly+4); ctx.fill();
  ctx.fillStyle='#3DDC84'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('OUT: h \u00b7 (row '+(sel+1)+')',gx+cols*cw+64,ly-14);
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='8px monospace';
  ctx.fillText('= logit for "'+LMH_VOCAB[sel]+'"',gx+cols*cw+64,ly+2);
  ctx.fillText('(E\u1d40 = the mirror)',gx+cols*cw+64,ly+18);
  const cap=document.getElementById('mir-caption');
  if(cap) cap.innerHTML='The row for &ldquo;'+LMH_VOCAB[sel]+'&rdquo; is used twice: going in, a one-hot selects it as the embedding; coming out, h is dotted against it to score &ldquo;'+LMH_VOCAB[sel]+'&rdquo; as the next word. A token whose embedding points the same way as h wins. One matrix, learned once, doing both jobs.';
}

// ── 8.7 VIZ: PACK THE WINDOW ───────────────────────────────
let _pack={ segs:[], f:0, batch:0, anim:null };
const PACK_COLS=['rgba(77,227,255,0.65)','rgba(160,140,255,0.65)','rgba(255,140,66,0.65)','rgba(61,220,132,0.65)','rgba(253,224,71,0.6)','rgba(255,95,142,0.6)'];
function packBuild(){ _pack.segs=[]; _pack.f=0; _pack.batch=0; packDraw(); const c=document.getElementById('pack-count'); if(c) c.textContent='windows packed: 0'; }
function packGo(){
  const segs=[]; let tot=0;
  while(tot<4096){ let L=300+Math.floor(Math.random()*1200); if(tot+L>4096) L=4096-tot; segs.push(L); tot+=L; }
  _pack.segs=segs; _pack.f=0;
  if(_pack.anim) cancelAnimationFrame(_pack.anim);
  const t0=performance.now();
  const loop=now=>{
    _pack.f=Math.min(1,(now-t0)/900); packDraw();
    if(_pack.f<1) _pack.anim=requestAnimationFrame(loop);
    else { _pack.anim=null; _pack.batch++;
      const c=document.getElementById('pack-count');
      if(c) c.innerHTML='windows packed: <span style="color:var(--accent)">'+_pack.batch+'</span> \u00b7 tokens: <span style="color:var(--accent)">'+(_pack.batch*4096).toLocaleString()+'</span> \u00b7 one GPT-3 batch \u2248 781 windows \u2248 <span style="color:var(--accent3)">3.2M tokens</span>';
    }
  };
  _pack.anim=requestAnimationFrame(loop);
}
function packDraw(){
  const cv=document.getElementById('pack-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const bx=20, bw=W-40, by=40, bh=40;
  ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=1.5; ctx.strokeRect(bx,by,bw,bh);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('one context window \u00b7 4096 tokens',bx,by-10);
  const doneW=bw*_pack.f;
  let acc=0;
  _pack.segs.forEach((L,i)=>{
    const segX=bx+(acc/4096)*bw, segW=(L/4096)*bw;
    const visW=Math.max(0,Math.min(segW,doneW-(segX-bx)));
    if(visW>0){
      ctx.fillStyle=PACK_COLS[i%PACK_COLS.length];
      ctx.fillRect(segX,by+2,visW,bh-4);
      if(visW>=segW-0.5 && i<_pack.segs.length-1){
        ctx.fillStyle='rgba(255,255,255,0.9)';
        ctx.fillRect(segX+segW-1.5,by,3,bh);
      }
      if(segW>50 && visW>40){
        ctx.fillStyle='rgba(13,20,23,0.85)'; ctx.font='8px monospace'; ctx.textAlign='center';
        ctx.fillText('doc \u00b7 '+L,segX+segW/2,by+bh/2+3);
      }
    }
    acc+=L;
  });
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('white ticks = <|endoftext|> separators',bx,by+bh+18);
}

// ── 8.8 VIZ: PARAM COUNTER ─────────────────────────────────
function pcBuild(){ pcPreset(12,768); }
function pcPreset(nl,d){
  const ls=document.getElementById('pc-layers'), ds=document.getElementById('pc-d');
  if(ls) ls.value=nl;
  if(ds) ds.value=Math.log2(d);
  pcCalc();
}
function pcCalc(){
  const ls=document.getElementById('pc-layers'), ds=document.getElementById('pc-d');
  if(!ls||!ds) return;
  const nl=parseInt(ls.value), d=Math.round(Math.pow(2,parseFloat(ds.value))/16)*16;
  const N=12*nl*d*d;
  const lv=document.getElementById('pc-lv'); if(lv) lv.textContent=nl;
  const dv=document.getElementById('pc-dv'); if(dv) dv.textContent=d.toLocaleString();
  const fmt=N>=1e12?(N/1e12).toFixed(2)+'T':N>=1e9?(N/1e9).toFixed(1)+'B':(N/1e6).toFixed(0)+'M';
  const out=document.getElementById('pc-out');
  if(out) out.innerHTML='N \u2248 12 \u00d7 '+nl+' \u00d7 '+d.toLocaleString()+'\u00b2 = <span style="font-size:1.35rem;font-weight:700">'+fmt+'</span> parameters';
}

// ── 8.8 VIZ: KV CACHE RACE ─────────────────────────────────
let _kv={ step:0, anim:null };
function kvBuild(){ kvReset(); }
function kvReset(){ if(_kv.anim){ clearInterval(_kv.anim); _kv.anim=null; } _kv.step=0; kvDraw(); }
function kvPlay(){
  kvReset();
  _kv.anim=setInterval(()=>{ _kv.step++; kvDraw(); if(_kv.step>=12){ clearInterval(_kv.anim); _kv.anim=null; } },320);
}
function kvDraw(){
  const cv=document.getElementById('kv-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, n=12, s=_kv.step;
  ctx.clearRect(0,0,W,H);
  let naive=0, cached=0;
  for(let i=1;i<=s;i++){ naive+=i; cached+=1; }
  const lanes=[['NAIVE: recompute every K,V each step','#FF5F8E',56,i=>i],['KV CACHE: compute each K,V once','#4DE3FF',150,i=>1]];
  lanes.forEach(([lab,col,ly,opFn])=>{
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText(lab,20,ly-14);
    for(let i=1;i<=n;i++){
      const x=20+(i-1)*46;
      const ops=opFn(i), done=i<=s;
      // per-step op stack
      for(let o=0;o<ops;o++){
        ctx.fillStyle=done?(o===ops-1&&col==='#FF5F8E'&&ops>1?'rgba(255,95,142,0.35)':col):'rgba(255,255,255,0.06)';
        ctx.globalAlpha=done?(col==='#FF5F8E'?0.28+0.04*o:0.75):1;
        ctx.fillRect(x,ly+40-4-(o+1)*3.0,36,2.2);
        ctx.globalAlpha=1;
      }
      ctx.strokeStyle=done?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.08)';
      ctx.strokeRect(x,ly,36,40);
      ctx.fillStyle=done?'rgba(255,255,255,0.6)':'rgba(255,255,255,0.2)'; ctx.font='8px monospace'; ctx.textAlign='center';
      ctx.fillText('t'+i,x+18,ly+50);
      if(done){ ctx.fillStyle=col; ctx.font='8px monospace'; ctx.fillText(ops+' op'+(ops>1?'s':''),x+18,ly+10); }
    }
  });
  // counters
  ctx.textAlign='left'; ctx.font='bold 12px monospace';
  ctx.fillStyle='#FF5F8E'; ctx.fillText('total K/V computations: '+naive,20,H-14);
  ctx.fillStyle='#4DE3FF'; ctx.fillText('total K/V computations: '+cached,340,H-14);
  const cap=document.getElementById('kv-caption');
  if(cap && s>=12) cap.innerHTML='After 12 tokens: <span style="color:var(--accent3)">78 recomputations</span> versus <span style="color:var(--accent)">12</span>. The gap is quadratic vs. linear, and it is why every serving stack caches keys and values. Only the newest token\u2019s q, k, v are ever fresh.';
  else if(cap && s===0) cap.innerHTML='Two op counters, same generation. The naive lane re-derives every earlier K and V at every step. The cached lane computes each exactly once.';
}

// ── 8.8 VIZ: LORA RANK DIAL ────────────────────────────────
function loraBuild(){ loraSet(8); }
function loraSet(v){
  const r=parseInt(v);
  const e=document.getElementById('lora-rv'); if(e) e.textContent=r;
  const cv=document.getElementById('lora-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const k=512, d=512, full=k*d, lora=r*(k+d), pct=(lora/full*100);
  const sq=150, wy=(H-sq)/2, wx=40;
  // frozen W
  ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(wx,wy,sq,sq);
  ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=1.5; ctx.strokeRect(wx,wy,sq,sq);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='11px monospace'; ctx.textAlign='center';
  ctx.fillText('W  (frozen)',wx+sq/2,wy+sq/2-8);
  ctx.font='16px monospace'; ctx.fillText('\ud83d\udd12',wx+sq/2,wy+sq/2+16);
  ctx.font='8px monospace'; ctx.fillText('512 \u00d7 512',wx+sq/2,wy+sq+14);
  // plus
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='18px monospace'; ctx.fillText('+',wx+sq+34,wy+sq/2+6);
  // A (k x r): tall skinny — width prop to r
  const rw=Math.max(4,(r/64)*44);
  const ax=wx+sq+64;
  ctx.fillStyle='rgba(77,227,255,0.55)'; ctx.fillRect(ax,wy,rw,sq);
  ctx.strokeStyle='#4DE3FF'; ctx.lineWidth=1; ctx.strokeRect(ax,wy,rw,sq);
  ctx.fillStyle='#4DE3FF'; ctx.font='9px monospace'; ctx.fillText('A',ax+rw/2,wy-6);
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.fillText('512\u00d7'+r,ax+rw/2,wy+sq+14);
  // times
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='13px monospace'; ctx.fillText('\u00d7',ax+rw+18,wy+sq/2+4);
  // B (r x d): wide skinny — height prop to r
  const bx2=ax+rw+34, bh2=Math.max(4,(r/64)*44);
  ctx.fillStyle='rgba(160,140,255,0.55)'; ctx.fillRect(bx2,wy+sq/2-bh2/2,sq,bh2);
  ctx.strokeStyle='#A18FFF'; ctx.lineWidth=1; ctx.strokeRect(bx2,wy+sq/2-bh2/2,sq,bh2);
  ctx.fillStyle='#A18FFF'; ctx.font='9px monospace'; ctx.fillText('B',bx2+sq/2,wy+sq/2-bh2/2-6);
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.fillText(r+'\u00d7512',bx2+sq/2,wy+sq/2+bh2/2+14);
  // budget readout
  ctx.textAlign='left'; ctx.font='10px monospace';
  ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.fillText('full finetune: '+full.toLocaleString()+' trainable',wx,H-30);
  ctx.fillStyle='#4DE3FF'; ctx.fillText('LoRA (r='+r+'): '+lora.toLocaleString()+' trainable  \u2248 '+pct.toFixed(1)+'%',wx,H-14);
  // pct bar
  ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(380,H-38,220,10);
  ctx.fillStyle='#4DE3FF'; ctx.fillRect(380,H-38,Math.max(2,220*pct/100),10);
  const cap=document.getElementById('lora-caption');
  if(cap) cap.innerHTML='At rank '+r+', the update AB has the same 512\u00d7512 shape as W but only '+pct.toFixed(1)+'% of the trainable parameters. Because xW + xAB adds cleanly, adapters can be trained cheaply, swapped per domain, and merged into W for zero inference cost.';
}

// ── 8.9 VIZ: LOGIT LENS ────────────────────────────────────
const LENS_KEYS={
  0:[['the',.18],['a',.14],['of',.12],['in',.10],['and',.08]],
  3:[['the',.16],['a',.12],['Paris',.10],['France',.09],['London',.07]],
  6:[['Paris',.34],['France',.16],['London',.10],['the',.08],['Lyon',.06]],
  9:[['Paris',.62],['France',.10],['Lyon',.05],['London',.04],['Marseille',.03]],
  12:[['Paris',.86],['France',.05],['Lyon',.02],['London',.01],['Marseille',.01]]
};
function lensBuild(){ lensSet(0); }
function lensSet(v){
  const L=parseInt(v);
  const e=document.getElementById('lens-val'); if(e) e.textContent=L;
  const keys=[0,3,6,9,12];
  let k0=0,k1=12;
  for(let i=0;i<keys.length-1;i++){ if(L>=keys[i]&&L<=keys[i+1]){ k0=keys[i]; k1=keys[i+1]; break; } }
  const u=k1===k0?0:(L-k0)/(k1-k0);
  const words={};
  LENS_KEYS[k0].forEach(([w,p])=>{ words[w]=(words[w]||0)+p*(1-u); });
  LENS_KEYS[k1].forEach(([w,p])=>{ words[w]=(words[w]||0)+p*u; });
  const top=Object.entries(words).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const mxp=top[0][1];
  const bars=document.getElementById('lens-bars');
  if(bars) bars.innerHTML=top.map(([w,p],i)=>
    '<div style="display:flex;align-items:center;gap:10px">'
    +'<span style="font-family:var(--mono);font-size:.74rem;color:'+(i===0?'var(--accent)':'var(--text)')+';width:80px;text-align:right">'+w+'</span>'
    +'<div style="flex:1;height:18px;background:var(--surface3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+(p/mxp*100).toFixed(1)+'%;background:'+(i===0?'linear-gradient(90deg,#4DE3FF,#3DDC84)':'rgba(160,140,255,0.55)')+';border-radius:4px;transition:width .18s"></div></div>'
    +'<span style="font-family:var(--mono);font-size:.64rem;color:var(--muted);width:44px">'+(p*100).toFixed(1)+'%</span></div>'
  ).join('');
  const cap=document.getElementById('lens-caption');
  if(cap){
    if(L<=2) cap.textContent='Early layers: the vector, read through E\u1d40, mostly encodes surface statistics, generic function words dominate.';
    else if(L<=7) cap.textContent='Middle layers: candidate cities start to surface. The semantic content is being assembled but not yet resolved.';
    else cap.textContent='Late layers: the prediction has crystallized on Paris. The model\u2019s guess sharpened as the vector climbed, exactly what the lens is for.';
  }
}

// ── TRANSFORMER STACK RENDERER (preview + fullscreen) ──────
const TXSTACK = [
  {key:'input',  name:'Input token',        col:'#9a9ab8', shape:'id',        block:false, desc:'A token id enters at the bottom of the column. This is one position in the context window.'},
  {key:'embed',  name:'Embed + Position',   col:'#A18FFF', shape:'[1\u00d7d]', block:false, desc:'The embedding matrix E turns the id into a d-vector, and the positional embedding for this slot is added on. This sum is the input X to the first block.'},
  {key:'ln1',    name:'Layer Norm',         col:'#fde047', shape:'[1\u00d7d]', block:true,  desc:'Inside the block: layer norm normalizes the residual stream before attention (prenorm).'},
  {key:'mha',    name:'MultiHead Attention',col:'#ff8c42', shape:'[1\u00d7d]', block:true,  desc:'Multi-head attention reads this stream and all earlier streams, mixing in context. Its output is added back into the residual stream.'},
  {key:'add1',   name:'+  residual',        col:'#3DDC84', shape:'[1\u00d7d]', block:true,  desc:'The attention output is added to the stream. The original vector is preserved and enriched, not replaced.'},
  {key:'ln2',    name:'Layer Norm',         col:'#fde047', shape:'[1\u00d7d]', block:true,  desc:'A second layer norm normalizes the stream before the feedforward network.'},
  {key:'ffn',    name:'Feedforward',        col:'#4DE3FF', shape:'[1\u00d7d]', block:true,  desc:'A two-layer feedforward network transforms this token alone, widening to a larger hidden size and back.'},
  {key:'add2',   name:'+  residual',        col:'#3DDC84', shape:'[1\u00d7d]', block:true,  desc:'The feedforward output is added back. This is the block output h, and it becomes the input to the next block. Blocks 3 through 8 repeat N times.'},
  {key:'finaln', name:'Final Layer Norm',   col:'#fde047', shape:'[1\u00d7d]', block:false, desc:'After the last block, one extra layer norm cleans up the top vector (a quirk of the prenorm design).'},
  {key:'unembed',name:'Unembedding  E\u1d40',col:'#a78bfa', shape:'[1\u00d7|V|]',block:false, desc:'The transposed embedding matrix projects the d-vector to a logit for every token in the vocabulary.'},
  {key:'softmax',name:'Softmax \u2192 next', col:'#FF5F8E', shape:'[1\u00d7|V|]',block:false, desc:'Softmax turns the logits into a probability distribution over the next token. Sample from it to generate.'}
];
// '#RRGGBB' (or '#RGB') -> [r,g,b]
function _hx2rgb(hex){
  var h=String(hex||'').replace('#','');
  if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  var n=parseInt(h,16);
  if(isNaN(n)) return [255,255,255];
  return [(n>>16)&255,(n>>8)&255,n&255];
}
// path helper: begins a rounded-rect path (caller fills/strokes). Falls back
// to arcTo when the native canvas roundRect API is unavailable.
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  if(typeof ctx.roundRect==='function'){ ctx.roundRect(x,y,w,h,r); return; }
  r=Math.max(0,Math.min(r,w/2,h/2));
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function drawTransformerStack(ctx,W,H,opts){
  opts=opts||{};
  ctx.clearRect(0,0,W,H);
  const n=TXSTACK.length, compact=opts.compact, active=opts.active;
  const padT=compact?22:34, padB=compact?22:34, bh=(H-padT-padB)/n;
  const cx=W*0.42, bw=compact?184:248;
  const T=performance.now()/1000;
  const blockIdx=TXSTACK.map((s,i)=>s.block?i:-1).filter(i=>i>=0);
  const yAt=i=>H-padB-(i+0.5)*bh;
  const streamX=cx-bw/2-(compact?12:20);
  const y0=yAt(0)+bh*0.4, y1=yAt(n-1);

  // ── residual stream: glowing vertical conduit ──
  const sg=ctx.createLinearGradient(0,y0,0,y1);
  sg.addColorStop(0,'rgba(77,227,255,0.05)');
  sg.addColorStop(0.5,'rgba(77,227,255,0.5)');
  sg.addColorStop(1,'rgba(160,140,255,0.6)');
  ctx.strokeStyle=sg; ctx.lineWidth=compact?3:4; ctx.lineCap='round';
  ctx.shadowBlur=compact?8:14; ctx.shadowColor='rgba(77,227,255,0.5)';
  ctx.beginPath(); ctx.moveTo(streamX,y0); ctx.lineTo(streamX,y1); ctx.stroke();
  ctx.shadowBlur=0;
  // pulses travelling UP the residual stream
  const np=compact?3:4;
  for(let p=0;p<np;p++){
    let f=((T*0.32)+(p/np))%1;
    const py=y0+(y1-y0)*f; // f=0 bottom -> top
    const fade=Math.sin(f*Math.PI);
    ctx.fillStyle=`rgba(77,227,255,${fade*0.9})`;
    ctx.shadowBlur=10; ctx.shadowColor='rgba(77,227,255,0.9)';
    ctx.beginPath(); ctx.arc(streamX,py,compact?2.4:3.2,0,2*Math.PI); ctx.fill();
  }
  ctx.shadowBlur=0;

  // ── ×N bracket around block region ──
  if(blockIdx.length){
    const yb0=yAt(blockIdx[blockIdx.length-1])-bh*0.5, yb1=yAt(blockIdx[0])+bh*0.5, bx=cx+bw/2+(compact?10:18);
    // faint block-region backdrop
    ctx.fillStyle='rgba(255,140,66,0.04)';
    roundRect(ctx,cx-bw/2-6,yb0-4,bw+12+(compact?20:30),yb1-yb0+8,10); ctx.fill();
    ctx.strokeStyle='rgba(255,140,66,0.7)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(bx,yb0); ctx.lineTo(bx+8,yb0); ctx.lineTo(bx+8,yb1); ctx.lineTo(bx,yb1); ctx.stroke();
    ctx.fillStyle='rgba(255,140,66,0.95)'; ctx.font='bold '+(compact?'9px':'12px')+' monospace'; ctx.textAlign='left';
    ctx.save(); ctx.translate(bx+(compact?15:22),(yb0+yb1)/2); ctx.fillText('\u00d7 N blocks',0,0); ctx.restore();
  }

  for(let i=0;i<n;i++){
    const s=TXSTACK[i], y=yAt(i), on=(active===undefined||active===i);
    const c=_hx2rgb(s.col);
    const pulse=active===i?(0.5+0.5*Math.sin(T*3)):0;
    const by=y-bh*0.36, bhh=bh*0.72;
    // connector arrow up into this block
    if(i<n-1){ ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,y-bh*0.36); ctx.lineTo(cx,y-bh*0.64); ctx.stroke(); }
    // depth shadow + gradient block
    ctx.globalAlpha=on?1:0.5;
    if(on){ ctx.shadowBlur=active===i?(16+pulse*12):8; ctx.shadowColor=`rgba(${c[0]},${c[1]},${c[2]},${active===i?0.6:0.22})`; ctx.shadowOffsetX=3; }
    const g=ctx.createLinearGradient(cx-bw/2,0,cx+bw/2,0);
    g.addColorStop(0,`rgba(${c[0]},${c[1]},${c[2]},${on?0.24:0.06})`);
    g.addColorStop(1,`rgba(${c[0]},${c[1]},${c[2]},${on?0.1:0.03})`);
    ctx.fillStyle=g; roundRect(ctx,cx-bw/2,by,bw,bhh,7); ctx.fill();
    ctx.shadowBlur=0; ctx.shadowOffsetX=0;
    // left accent rail
    ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${on?0.95:0.4})`;
    roundRect(ctx,cx-bw/2+4,by+5,compact?2.5:3.5,bhh-10,2); ctx.fill();
    // border
    ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${on?(0.65+pulse*0.35):0.4})`;
    ctx.lineWidth=active===i?2.4:1.1; roundRect(ctx,cx-bw/2,by,bw,bhh,7); ctx.stroke();
    // label (dark shadow keeps it legible over any block colour)
    ctx.shadowBlur=4; ctx.shadowColor='rgba(0,0,0,0.85)'; ctx.shadowOffsetX=0; ctx.shadowOffsetY=1;
    ctx.fillStyle=on?'#ffffff':'rgba(255,255,255,0.7)'; ctx.font='600 '+(compact?'10px':'13px')+' monospace'; ctx.textAlign='center';
    ctx.fillText(s.name,cx+(compact?4:6),y+4);
    ctx.shadowBlur=0; ctx.shadowOffsetY=0;
    if(!compact){ ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},0.7)`; ctx.font='10px monospace'; ctx.textAlign='right'; ctx.fillText(s.shape,cx+bw/2-12,y-bh*0.16); }
    ctx.globalAlpha=1;
  }
  ctx.textAlign='left';
}
let _txfullPre={anim:null};
function txFullPreBuild(){
  const cv=document.getElementById('txfull-pre-canvas'); if(!cv) return;
  if(_txfullPre.anim) cancelAnimationFrame(_txfullPre.anim);
  const loop=()=>{
    const c=document.getElementById('txfull-pre-canvas'); if(!c){ _txfullPre.anim=null; return; }
    drawTransformerStack(c.getContext('2d'),c.width,c.height,{compact:true});
    _txfullPre.anim=requestAnimationFrame(loop);
  };
  loop();
}

// ── 8.10 FULLSCREEN STACK ──────────────────────────────────
let _txfull={ stage:0, anim:null };
function openTXFull(){ const ex=document.getElementById('tx-full'); if(!ex) return; ex.style.display='block'; _txfull.stage=0; setTimeout(()=>{ txFullResize(); txFullStages(); txFullLoop(); },50); window.addEventListener('resize',txFullResizeOnce); }
function txFullResizeOnce(){ const ex=document.getElementById('tx-full'); if(ex&&ex.style.display!=='none') txFullResize(); }
function closeTXFull(){ const ex=document.getElementById('tx-full'); if(ex) ex.style.display='none'; if(_txfull.anim){ cancelAnimationFrame(_txfull.anim); _txfull.anim=null; } }
function txFullResize(){ const cv=document.getElementById('txfull-canvas'); if(!cv) return; const r=cv.getBoundingClientRect(); cv.width=r.width; cv.height=r.height; txFullDraw(); }
function txFullDraw(){ const cv=document.getElementById('txfull-canvas'); if(!cv) return; drawTransformerStack(cv.getContext('2d'),cv.width,cv.height,{active:_txfull.stage}); }
function txFullLoop(){ const ex=document.getElementById('tx-full'); if(!ex||ex.style.display==='none'){ _txfull.anim=null; return; } txFullDraw(); _txfull.anim=requestAnimationFrame(txFullLoop); }
function txFullSetStage(i){ _txfull.stage=Math.max(0,Math.min(TXSTACK.length-1,i)); txFullDraw(); txFullStages(); }
function txFullStep(d){ txFullSetStage(_txfull.stage+d); }
function txFullStages(){
  const list=document.getElementById('txfull-stagelist');
  if(list) list.innerHTML=TXSTACK.map((s,i)=>`<button onclick="txFullSetStage(${i})" style="text-align:left;background:${i===_txfull.stage?'rgba(77,227,255,0.12)':'var(--surface2)'};border:1px solid ${i===_txfull.stage?'var(--accent)':'var(--border2)'};border-left:3px solid ${s.col};border-radius:7px;padding:.5rem .65rem;cursor:pointer;font-family:var(--mono);font-size:.68rem;color:${i===_txfull.stage?'var(--accent)':'var(--text)'}">${s.name}</button>`).join('');
  const d=document.getElementById('txfull-desc');
  if(d){ const s=TXSTACK[_txfull.stage]; d.innerHTML='<div style="font-family:var(--mono);font-size:.7rem;color:'+s.col+';text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem">'+s.name+'  &middot;  '+s.shape+'</div>'+s.desc; }
}

// ── 8.11 REAL TRANSFORMER ENGINE ───────────────────────────
function _txRng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function _txMat(rows,cols,rng){ const m=[]; for(let i=0;i<rows;i++){ const r=[]; for(let j=0;j<cols;j++) r.push((rng()*2-1)*0.7); m.push(r); } return m; }
function _txVecMat(v,M){ const cols=M[0].length, out=new Array(cols).fill(0); for(let j=0;j<cols;j++){ let s=0; for(let i=0;i<v.length;i++) s+=v[i]*M[i][j]; out[j]=s; } return out; }
function _txDot(a,b){ let s=0; for(let i=0;i<a.length;i++) s+=a[i]*b[i]; return s; }
function _txLN(v){ const m=v.reduce((a,b)=>a+b,0)/v.length; const sd=Math.sqrt(v.reduce((a,b)=>a+(b-m)*(b-m),0)/v.length)+1e-6; return v.map(x=>(x-m)/sd); }
function _txRelu(v){ return v.map(x=>Math.max(0,x)); }

const TXM_VOCAB=['the','cat','sat','on','mat','dog','ran','fast'];
const TXM_D=8;
let TXM=null;
function _txEmb(w){ const v=[]; for(let k=0;k<TXM_D;k++) v.push(Math.sin(w*1.7+k*0.9)*0.55 + (w%2===0?0.12:-0.12)); return v; }
function _txPos(p){ const v=[]; for(let k=0;k<TXM_D;k++){ const freq=Math.pow(10000,-(2*Math.floor(k/2))/TXM_D); v.push((k%2===0?Math.sin(p*freq):Math.cos(p*freq))*0.4); } return v; }
function txmBuildWeights(A){
  const rng=_txRng(12345+A*97), dh=TXM_D/A;
  const WQ=[],WK=[],WV=[];
  for(let c=0;c<A;c++){ WQ.push(_txMat(TXM_D,dh,rng)); WK.push(_txMat(TXM_D,dh,rng)); WV.push(_txMat(TXM_D,dh,rng)); }
  const WO=_txMat(A*dh,TXM_D,rng), dff=TXM_D*2;
  const W1=_txMat(TXM_D,dff,rng), b1=Array.from({length:dff},()=>(rng()*2-1)*0.2);
  const W2=_txMat(dff,TXM_D,rng), b2=Array.from({length:TXM_D},()=>(rng()*2-1)*0.2);
  TXM={A,dh,WQ,WK,WV,WO,W1,b1,W2,b2,E:TXM_VOCAB.map((_,w)=>_txEmb(w))};
}
function txmForward(ids,opts){
  const A=opts.heads, mask=opts.mask, temp=opts.temp||1;
  if(!TXM||TXM.A!==A) txmBuildWeights(A);
  const dh=TXM.dh, N=ids.length;
  const X=ids.map((id,p)=>_txEmb(id).map((e,k)=>e+_txPos(p)[k]));
  const ln=X.map(_txLN);
  const attn=[],scores=[],headOut=[];
  for(let c=0;c<A;c++){
    const Q=ln.map(x=>_txVecMat(x,TXM.WQ[c])), K=ln.map(x=>_txVecMat(x,TXM.WK[c])), V=ln.map(x=>_txVecMat(x,TXM.WV[c]));
    const sc=[],at=[];
    for(let i=0;i<N;i++){
      const row=[]; for(let j=0;j<N;j++){ let v=(mask&&j>i)?-Infinity:_txDot(Q[i],K[j])/Math.sqrt(dh); row.push(v); }
      sc.push(row.slice());
      const valid=row.filter(v=>v>-Infinity); const mx=Math.max(...valid);
      const ex=row.map(v=>v===-Infinity?0:Math.exp(v-mx)); const Z=ex.reduce((a,b)=>a+b,0);
      at.push(ex.map(e=>e/Z));
    }
    scores.push(sc); attn.push(at);
    // per-position head output
    const hc=[]; for(let i=0;i<N;i++){ const o=new Array(dh).fill(0); for(let j=0;j<N;j++) for(let k=0;k<dh;k++) o[k]+=at[i][j]*V[j][k]; hc.push(o); }
    headOut.push(hc);
  }
  // concat heads, project WO, residual, FFN
  const H=[];
  for(let i=0;i<N;i++){
    const concat=[]; for(let c=0;c<A;c++) for(let k=0;k<dh;k++) concat.push(headOut[c][i][k]);
    const a=_txVecMat(concat,TXM.WO);
    const O=X[i].map((x,k)=>x+a[k]);
    const o2=_txLN(O);
    const ff=_txVecMat(_txRelu(_txVecMat(o2,TXM.W1).map((v,k)=>v+TXM.b1[k])),TXM.W2).map((v,k)=>v+TXM.b2[k]);
    H.push(O.map((o,k)=>o+ff[k]));
  }
  // LM head on last token
  const logits=TXM.E.map(row=>_txDot(H[N-1],row));
  const mx=Math.max(...logits), ex=logits.map(l=>Math.exp((l-mx)/temp)), Z=ex.reduce((a,b)=>a+b,0);
  const dist=TXM_VOCAB.map((w,i)=>[w,ex[i]/Z]).sort((a,b)=>b[1]-a[1]);
  return {attn,scores,N,A,dist};
}

// ── 8.11 UI ────────────────────────────────────────────────
let _txm={ ids:[0,1,2,3,0], heads:2, mask:true, temp:1, head:0, query:4, out:null };
function openTXModel(){ const ex=document.getElementById('tx-model'); if(!ex) return; ex.style.display='block'; txmRender(); }
function closeTXModel(){ const ex=document.getElementById('tx-model'); if(ex) ex.style.display='none'; }
function txmCycle(slot){ _txm.ids[slot]=(_txm.ids[slot]+1)%TXM_VOCAB.length; if(_txm.query>=_txm.ids.length) _txm.query=_txm.ids.length-1; txmRender(); }
function txmAddTok(){ if(_txm.ids.length<7){ _txm.ids.push(0); txmRender(); } }
function txmDelTok(){ if(_txm.ids.length>2){ _txm.ids.pop(); if(_txm.query>=_txm.ids.length)_txm.query=_txm.ids.length-1; txmRender(); } }
function txmSetHeads(A){ _txm.heads=A; if(_txm.head>=A)_txm.head=0; txmRender(); }
function txmToggleMask(){ _txm.mask=!_txm.mask; txmRender(); }
function txmSetTemp(v){ _txm.temp=parseFloat(v); const e=document.getElementById('txm-tempval'); if(e) e.textContent=_txm.temp.toFixed(2); txmRender(); }
function txmSetHead(c){ _txm.head=c; txmRender(); }
function txmSelectQuery(i){ _txm.query=i; txmRender(); }
function txmRender(){
  const out=txmForward(_txm.ids,{heads:_txm.heads,mask:_txm.mask,temp:_txm.temp});
  _txm.out=out;
  // token chips
  const chips=document.getElementById('txm-tokens');
  if(chips) chips.innerHTML=_txm.ids.map((id,p)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:3px">
    <button onclick="txmSelectQuery(${p})" style="background:${p===_txm.query?'var(--accent3)':'var(--surface2)'};color:${p===_txm.query?'#fff':'var(--text)'};border:1px solid ${p===_txm.query?'var(--accent3)':'var(--border2)'};border-radius:7px;padding:.4rem .7rem;font-family:var(--mono);font-size:.78rem;cursor:pointer">${TXM_VOCAB[id]}</button>
    <button onclick="txmCycle(${p})" style="background:none;border:none;color:var(--muted);font-family:var(--mono);font-size:.58rem;cursor:pointer">&#8635; #${p+1}</button>
  </div>`).join('');
  // head selector
  const hs=document.getElementById('txm-heads-sel');
  if(hs) hs.innerHTML=Array.from({length:_txm.heads},(_,c)=>`<button onclick="txmSetHead(${c})" style="background:${c===_txm.head?'var(--accent)':'var(--surface2)'};color:${c===_txm.head?'var(--bg)':'var(--muted)'};border:1px solid ${c===_txm.head?'var(--accent)':'var(--border2)'};border-radius:6px;padding:.3rem .7rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">head ${c+1}</button>`).join('');
  // heads count buttons
  document.querySelectorAll('.txm-h-btn').forEach(b=>{ const on=+b.dataset.h===_txm.heads; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  const mb=document.getElementById('txm-mask-btn'); if(mb){ mb.textContent='causal mask: '+(_txm.mask?'ON':'OFF'); }
  txmDrawMatrix();
  txmDrawPanels();
}
function txmDrawMatrix(){
  const cv=document.getElementById('txm-matrix'); if(!cv||!_txm.out) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, o=_txm.out, N=o.N;
  ctx.clearRect(0,0,W,H);
  const A=o.attn[_txm.head], pad=58, gs=Math.min((W-pad-14),(H-pad-14))/N;
  for(let i=0;i<N;i++) for(let j=0;j<N;j++){
    const x=pad+j*gs, y=pad+i*gs, masked=_txm.mask&&j>i, a=A[i][j];
    if(masked){ ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.fillRect(x,y,gs-2,gs-2); }
    else { ctx.fillStyle='rgba(77,227,255,'+(0.06+a*0.9)+')'; ctx.fillRect(x,y,gs-2,gs-2);
      if(gs>30){ ctx.fillStyle=a>0.5?'#050A1C':'rgba(255,255,255,0.7)'; ctx.font=(gs*0.24)+'px monospace'; ctx.textAlign='center'; ctx.fillText(a.toFixed(2),x+gs/2,y+gs/2+4); } }
    if(i===_txm.query){ ctx.strokeStyle='var(--accent3)'; ctx.strokeStyle='#FF5F8E'; ctx.lineWidth=2; ctx.strokeRect(x+1,y+1,gs-3,gs-3); }
  }
  ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font=Math.min(12,gs*0.32)+'px monospace';
  ctx.textAlign='right'; for(let i=0;i<N;i++) ctx.fillText(TXM_VOCAB[_txm.ids[i]],pad-6,pad+i*gs+gs/2+4);
  ctx.textAlign='center'; for(let j=0;j<N;j++){ ctx.save(); ctx.translate(pad+j*gs+gs/2,pad-8); ctx.fillText(TXM_VOCAB[_txm.ids[j]],0,0); ctx.restore(); }
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('key \u2192',pad,pad-26); ctx.save(); ctx.translate(pad-40,pad+N*gs/2); ctx.rotate(-Math.PI/2); ctx.textAlign='center'; ctx.fillText('query (click a token)',0,0); ctx.restore();
}
function txmDrawPanels(){
  const o=_txm.out; if(!o) return;
  const qi=_txm.query, A=o.attn[_txm.head][qi], S=o.scores[_txm.head][qi];
  // attention weights for selected query
  const wp=document.getElementById('txm-weights');
  if(wp){
    let html='';
    for(let j=0;j<o.N;j++){
      const masked=_txm.mask&&j>qi;
      const a=masked?0:A[j], sc=masked?null:S[j];
      html+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="font-family:var(--mono);font-size:.66rem;color:${masked?'rgba(255,255,255,0.25)':'var(--text)'};width:54px;text-align:right">${TXM_VOCAB[_txm.ids[j]]}</span>
        <div style="flex:1;height:14px;background:var(--surface3);border-radius:4px;overflow:hidden"><div style="height:100%;width:${(a*100).toFixed(0)}%;background:${j===qi?'#FF5F8E':'#4DE3FF'};border-radius:4px"></div></div>
        <span style="font-family:var(--mono);font-size:.58rem;color:var(--muted);width:64px">${masked?'masked':(sc.toFixed(2)+' \u2192 '+(a*100).toFixed(0)+'%')}</span>
      </div>`;
    }
    wp.innerHTML=html;
  }
  // next-token distribution
  const np=document.getElementById('txm-next');
  if(np){
    const top=o.dist.slice(0,6), max=top[0][1];
    np.innerHTML=top.map((d,i)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
      <span style="font-family:var(--mono);font-size:.66rem;color:var(--text);width:54px;text-align:right">${d[0]}</span>
      <div style="flex:1;height:14px;background:var(--surface3);border-radius:4px;overflow:hidden"><div style="height:100%;width:${(d[1]/max*100).toFixed(0)}%;background:${i===0?'#3DDC84':'#A18FFF'};border-radius:4px"></div></div>
      <span style="font-family:var(--mono);font-size:.58rem;color:var(--muted);width:34px">${(d[1]*100).toFixed(0)}%</span>
    </div>`).join('');
  }
  const ql=document.getElementById('txm-qlabel'); if(ql) ql.textContent='"'+TXM_VOCAB[_txm.ids[qi]]+'" (position '+(qi+1)+')';
}
