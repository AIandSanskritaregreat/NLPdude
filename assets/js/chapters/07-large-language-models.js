// ════════════════════════════════════════════════════════════
//  CHAPTER 7 · LARGE LANGUAGE MODELS
// ════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// CHAPTER 7 · LARGE LANGUAGE MODELS  (rebuilt)
// 8 sections + subsections, mathematical & interactive.
// Reuses shared lr* helpers; PRESERVES the full-screen LLM
// Anatomy engine + real GPT-2 live-model engine that follow
// this block (anat*/lm*/gpt2*). New code prefixed llm*.
// ═══════════════════════════════════════════════════════════

const LLM_SEC = [
  {id:'nextword', num:'7.0', title:'Learning by Guessing the Next Word', icon:'\u25A4', desc:'Why predicting the next token forces a model to learn grammar, facts, and reasoning. The chain rule of probability.', tags:['next-token','autoregressive','P(w|context)']},
  {id:'arch',     num:'7.1', title:'Three Shapes a Model Can Take',      icon:'\u2389', desc:'Decoder-only, encoder-only, encoder-decoder, and how attention masking defines each.',                 tags:['decoder','encoder','masking']},
  {id:'condgen',  num:'7.2', title:'Every Task as Next-Word Prediction', icon:'\u21BB', desc:'Framing sentiment, translation, and QA as conditional generation, with the probability factorization.',     tags:['conditional','prompt','factorization']},
  {id:'prompting',num:'7.3', title:'Steering a Model With Words',        icon:'\u270E', desc:'Prompting, few-shot demonstrations, and system prompts as conditioning on a prefix.',                    tags:['prompt','few-shot','system']},
  {id:'decoding', num:'7.4', title:'Choosing the Next Word',             icon:'\u2685', desc:'The generation engine: logits to softmax to a sampled token. Greedy, sampling, and temperature.',       tags:['softmax','temperature','decoding']},
  {id:'llmtrain', num:'7.5', title:'How a Model Is Actually Trained',    icon:'\u2207', desc:'Self-supervised pretraining, cross-entropy loss, teacher forcing, data, and finetuning.',              tags:['pretraining','cross-entropy','finetuning']},
  {id:'eval',     num:'7.6', title:'Measuring Whether It\u2019s Any Good',    icon:'\u2696', desc:'Perplexity from first principles, MMLU and contamination, and the costs accuracy hides.',              tags:['perplexity','MMLU','cost']},
  {id:'ethics',   num:'7.7', title:'Ethics & Safety',                    icon:'\u26A0', desc:'Hallucination, bias, privacy, and the responsibilities that scale with capability.',                    tags:['hallucination','bias','privacy']},
  {id:'llmrecap', num:'7.8', title:'Recap',                      icon:'\u25C9', desc:'The whole pipeline from text to a sampled token, plus the full anatomy and a live model.',              tags:['pipeline','anatomy','live']}
];

function buildLLMOverview(){
  const cards = LLM_SEC.map(s=>`
    <div class="sc-card" onclick="openLLMSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Prediction at Scale</div>
    <h1 class="lesson-h1">Large Language Models</h1>
    <p class="lesson-intro">An autoregressive language model predicts a distribution over the next token from the preceding context. Repeating that prediction generates text. We will work through \\(P(w_t\\mid w_{<t})\\), examine training and decoding, and try a small pretrained model in the browser.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">A language model defines a probability distribution over the next token given the previous ones, \\(P(w_t \\mid w_{&lt;t})\\). Multiplying these gives the probability of any whole sequence.</div>
        <div class="ch-sum-item">Sampling from that distribution and feeding each token back in generates text left to right. This autoregressive loop is all there is to generation.</div>
        <div class="ch-sum-item">Almost any task becomes conditional generation, \\(P(\\text{answer}\\mid\\text{prompt})\\), once you write the prompt correctly. Few-shot examples and system prompts are just more prefix to condition on.</div>
        <div class="ch-sum-item">Decoding maps logits to a token through the softmax; temperature \\(\\tau\\) rescales the logits to trade determinism against diversity.</div>
        <div class="ch-sum-item">Pretraining minimizes the cross-entropy of next-token prediction by self-supervision; perplexity is just the exponentiated version of that same loss.</div>
        <div class="ch-sum-item">Capability brings real costs and hazards: hallucination, bias, privacy, energy. None of them are afterthoughts.</div>
      </div>
    </div>`;
}

const LLM_PAGES = {};

// dispatch: section id -> init fn(s)
const LLM_INIT = {
  nextword: () => { llmNextInit(); llmChainInit(); },
  arch:     () => { llmArchInit(); },
  condgen:  () => { llmCondInit(); },
  prompting:() => { llmPromptInit(); llmFewshotInit(); llmSystemInit(); },
  decoding: () => { llmEngineInit(); llmGreedyInit(); llmSampleInit(); llmTempInit(); },
  llmtrain: () => { llmPretrainInit(); llmCorpusInit(); llmFinetuneInit(); },
  eval:     () => { llmPplInit(); llmMmluInit(); llmRadarInit(); },
  ethics:   () => { llmEthicsInit(); },
  llmrecap: () => { llmRecapInit(); }
};

function openLLMSec(id) {
  const pg = LLM_PAGES[id];
  if (!pg) return;
  if (window.lrStopAll) lrStopAll();
  if (window.embStopAll) embStopAll();
  if (window.nnStopAll) nnStopAll();
  if (window.llmStopAll) llmStopAll();
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if (!sv || !sb) return;
  const sec = LLM_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if (crumb && sec) crumb.innerHTML = 'Large Language Models <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  if (window.renderMath) renderMath(sb);
  mcSectionDelay(()=>{ if (LLM_INIT[id]) LLM_INIT[id](); }, 90);
  sv.onscroll = () => {
    const h = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if (bar) bar.style.width = (h>0?(sv.scrollTop/h)*100:0)+'%';
  };
}

// llm-local timer/raf registry
let LLM_TIMERS = [];
let LLM_RAFS = [];
function llmTimer(fn, ms){ const t = setInterval(fn, ms); LLM_TIMERS.push(t); return t; }
function llmRaf(fn){ const id = requestAnimationFrame(fn); LLM_RAFS.push(id); return id; }
function llmStopAll(){ LLM_TIMERS.forEach(clearInterval); LLM_TIMERS = []; LLM_RAFS.forEach(cancelAnimationFrame); LLM_RAFS = []; }
(function(){ const _cs = window.closeSec; window.closeSec = function(){ if(window.llmStopAll) llmStopAll(); if(_cs) _cs.apply(this, arguments); }; })();

function llmFig(label, bodyId, badge, fs){ return lrFig(label, bodyId, badge, fs); }
// softmax with temperature; returns probability array
function llmSoftmax(logits, temp){
  temp = temp || 1;
  const m = Math.max(...logits);
  const ex = logits.map(z=>Math.exp((z-m)/temp));
  const s = ex.reduce((a,b)=>a+b,0);
  return ex.map(e=>e/s);
}

// ───────────────────────────────────────────────────────────
// 7.0  Learning by Guessing the Next Word
// ───────────────────────────────────────────────────────────
LLM_PAGES.nextword = `
<div class="lesson-chapter-label">Section 7.0</div>
<h1 class="lesson-h1">Learning by Guessing the Next Word</h1>
<p class="lesson-intro">Next-token prediction provides a training signal directly from text. Learning it at scale can produce useful language and reasoning abilities, though those abilities remain uneven. Start by writing down the objective.</p>

<h2 class="lesson-h2">The Object Being Modeled</h2>
<p class="lesson-p">A language model is a function that takes a sequence of tokens \\(w_1, w_2, \\ldots, w_{t-1}\\) and returns a probability distribution over what the next token \\(w_t\\) could be, across the entire vocabulary \\(V\\):</p>
<div class="lesson-math">\\[ P(w_t \\mid w_1, w_2, \\ldots, w_{t-1}) = P(w_t \\mid w_{&lt;t}) \\]</div>
<p class="lesson-p">The notation \\(w_{&lt;t}\\) is shorthand for \u201call the tokens before position \\(t\\).\u201d The output is not a single word but a full distribution: a number for every one of the (often 50,000+) tokens in the vocabulary, all non-negative and summing to 1. Given the prefix <em>the cat sat on the</em>, a good model puts high probability on <em>mat</em>, <em>floor</em>, <em>couch</em>, and near-zero probability on <em>the</em>, <em>seventeen</em>, or <em>photosynthesis</em>.</p>

<h2 class="lesson-h2">The Chain Rule of Probability</h2>
<p class="lesson-p">Why is next-token prediction enough to model <em>whole documents</em>? Because of an exact identity from probability theory, the <strong>chain rule</strong>, which factors the joint probability of an entire sequence into a product of next-token probabilities:</p>
<div class="lesson-math">\\[ P(w_1, w_2, \\ldots, w_n) = \\prod_{t=1}^{n} P(w_t \\mid w_{&lt;t}) \\]</div>
<p class="lesson-p">Read it carefully: the probability of a full sentence equals the probability of the first word, times the probability of the second given the first, times the probability of the third given the first two, and so on. This is not an approximation; it holds exactly. It means a model that can predict the next token can, through the chain rule, assign a probability to any sequence at all, and generate one token at a time. A model trained only on \\(P(w_t \\mid w_{&lt;t})\\) therefore has a model of the probability of whole documents without ever being trained on one. Step through the factorization below, following each conditional as it multiplies into the running product.</p>
${llmFig('Interactive \u00b7 The chain rule, factored token by token', 'llm-chain')}

<h2 class="lesson-h2">Why This Forces Real Understanding</h2>
<p class="lesson-p">This is where the objective starts to do real work. To minimize its prediction error on the sentence <em>The capital of France is ___</em>, the model must place high probability on <em>Paris</em>, which requires it to have stored that fact. To predict the last token of <em>She poured water into the glass until it was ___</em>, it must track physical state and arrive at <em>full</em>. To continue <em>17 times 3 equals ___</em>, it must do arithmetic. None of these were separate training objectives. They are all next-token prediction, and the only way to be good at next-token prediction across a large and varied corpus is to learn the structure that generates the text. The task is simple; being good at it is not.</p>
<p class="lesson-p">The demo below lets you see this. Type a prefix and watch the model's distribution over next tokens sharpen or flatten depending on how much the context constrains the answer. A prefix like <em>The capital of France is</em> produces a spiked distribution where one answer dominates; a prefix like <em>Yesterday I saw a</em> produces a flat one where many words are plausible. The shape of the distribution is a direct readout of how much the context has pinned down.</p>
${llmFig('Interactive \u00b7 Next-token distribution explorer', 'llm-next')}

<div class="lesson-note"><div class="lesson-note-label">Everything Rests Here</div>
<p>Every later idea is a corollary of \\(P(w_t \\mid w_{&lt;t})\\). Generation is sampling from it repeatedly (7.4). Prompting is choosing the \\(w_{&lt;t}\\) that conditions it (7.3). Training is adjusting the model so this distribution matches real text (7.5). Evaluation is measuring how surprised the distribution is by held-out text (7.6). Keep this one equation in view and everything else is unpacking.</p></div>

<div class="quiz-block" id="qllm0"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">The chain rule \\(P(w_1,\\ldots,w_n)=\\prod_t P(w_t\\mid w_{&lt;t})\\) tells us that:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qllm0','Correct. A model of the next-token conditional can score or generate any full sequence, exactly, by multiplying the conditionals.')">Next-token prediction can model whole sequences</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm0','It is an exact identity, not an approximation.')">It is only a rough approximation</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm0','The tokens are dependent through the conditioning; that is the whole point.')">All tokens are independent</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm0','It multiplies conditionals; it does not add them.')">Sequence probability is a sum of word probabilities</button>
</div><div class="quiz-explain" id="qllm0-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 7.1  Three Shapes a Model Can Take
// ───────────────────────────────────────────────────────────
LLM_PAGES.arch = `
<div class="lesson-chapter-label">Section 7.1</div>
<h1 class="lesson-h1">Three Shapes a Language Model Can Take</h1>
<p class="lesson-intro">Encoder, decoder, and encoder-decoder models give tokens different access to context. Attention masks make those differences visible. Compare the three patterns and the tasks they support.</p>

<h2 class="lesson-h2">The Governing Constraint: Who Can See Whom</h2>
<p class="lesson-p">Inside these models, every token builds its representation by attending to other tokens (the full mechanism comes with transformers). The architecture is defined by the <strong>attention mask</strong>, the rule for which positions each token may attend to. Three choices give three families.</p>

<h2 class="lesson-h2">Decoder-Only (Causal)</h2>
<p class="lesson-p">In a <strong>decoder-only</strong> model, each token may attend only to itself and the tokens <em>before</em> it, never ahead. This is the <strong>causal mask</strong>:</p>
<div class="lesson-math">\\[ \\text{token } t \\text{ attends to positions } \\{1, 2, \\ldots, t\\} \\]</div>
<p class="lesson-p">This backward-only view is exactly what next-token prediction needs: to predict \\(w_t\\) the model must not peek at \\(w_t\\) or beyond, or the task would be trivial. Decoder-only models (GPT, Llama, and nearly every modern chatbot) are the generators, built to produce text left to right.</p>

<h2 class="lesson-h2">Encoder-Only (Bidirectional)</h2>
<p class="lesson-p">An <strong>encoder-only</strong> model lets every token attend to <em>all</em> tokens, both left and right. With full context in both directions it builds richer representations, but it cannot generate left-to-right text, because it would be allowed to see the answer. Encoder-only models (BERT and kin) are the understanders, used for classification, retrieval, and analysis rather than generation.</p>

<h2 class="lesson-h2">Encoder-Decoder</h2>
<p class="lesson-p">An <strong>encoder-decoder</strong> bolts the two together: an encoder reads the entire input bidirectionally, then a causal decoder generates the output while attending back to the encoder\u2019s representations. This suits sequence-to-sequence tasks like translation, where you want to fully understand the source before producing the target. Switch between the three below and watch the attention-mask grid and the information-flow arrows reconfigure; the mask <em>is</em> the architecture.</p>
${llmFig('Interactive \u00b7 The architecture switcher', 'llm-arch', 'flagship', 1)}

<div class="lesson-note"><div class="lesson-note-label">One Idea, Three Masks</div>
<p>Nothing about the underlying layers changes between these three; only the mask does. That is a recurring lesson in this field: enormous behavioral differences often come from a small change in what information is allowed to flow where. Modern general-purpose LLMs are almost all decoder-only, because the causal mask is exactly what generation requires and it turns out to scale beautifully.</p></div>

<div class="quiz-block" id="qllm1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why must a text-generating model use a causal (backward-only) mask?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qllm1','Correct. If a token could attend to future tokens, predicting the next token would be trivial \u2014 it could just look at the answer.')">Otherwise it could peek at the token it must predict</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm1','Bidirectional attention is richer, not weaker; the issue is that it leaks the answer.')">Bidirectional attention is computationally impossible</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm1','The layers are identical; only the mask differs.')">The layers themselves are different</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm1','Encoders exist and work well; they just cannot generate left-to-right.')">Encoders cannot represent language</button>
</div><div class="quiz-explain" id="qllm1-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 7.2  Every Task as Next-Word Prediction
// ───────────────────────────────────────────────────────────
LLM_PAGES.condgen = `
<div class="lesson-chapter-label">Section 7.2</div>
<h1 class="lesson-h1">Turning Every Task Into \u201cPredict the Next Word\u201d</h1>
<p class="lesson-intro">A single next-token predictor looks like it can only do one thing. What makes it general is a reframing: a wide range of tasks can be rewritten as "continue this text," so that the answer is whatever tokens the model generates. This is <strong>conditional generation</strong>, and it is why one model can handle so many different problems.</p>

<h2 class="lesson-h2">Conditioning on a Prompt</h2>
<p class="lesson-p">Generation is autoregressive: the model produces one token, appends it to the context, and repeats. If we call the fixed input text the <strong>prompt</strong> \\(x\\) and the generated answer \\(y = y_1 y_2 \\ldots y_m\\), then the probability of the whole answer is, by the chain rule again:</p>
<div class="lesson-math">\\[ P(y \\mid x) = \\prod_{i=1}^{m} P\\big(y_i \\mid x, y_{&lt;i}\\big) \\]</div>
<p class="lesson-p">Each generated token is conditioned on the prompt <em>and</em> everything generated so far. Watch the autoregressive loop below: a token is sampled, appended, and fed back in, and the equation\u2019s running product updates with each step. The generated text is nothing more than a high-probability continuation of the prompt.</p>
${llmFig('Interactive \u00b7 The autoregressive generation loop', 'llm-cond')}

<h2 class="lesson-h2">Tasks in Disguise</h2>
<p class="lesson-p">The move is to write the task as text whose natural continuation is the answer:</p>
<div class="llm-eqbox">Sentiment:  "Review: A dazzling triumph. Sentiment:" &rarr; <span style="color:var(--accent4)">positive</span></div>
<div class="llm-eqbox">Translation: "English: cat &rarr; French:" &rarr; <span style="color:var(--accent4)">chat</span></div>
<div class="llm-eqbox">QA:  "Q: What is the capital of Japan? A:" &rarr; <span style="color:var(--accent4)">Tokyo</span></div>
<p class="lesson-p">In each case the model is doing the identical thing, computing \\(P(y \\mid x)\\) and generating the most probable continuation, but because we chose the prompt so that the continuation <em>is</em> the answer, the model performs sentiment analysis, translation, and question answering without ever being specifically built for any of them. Sentiment classification, once a whole pipeline of its own, is now a prompt. That collapse of many tasks into one is the central practical fact about LLMs.</p>

<div class="quiz-block" id="qllm2"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In \\(P(y\\mid x)=\\prod_i P(y_i\\mid x, y_{&lt;i})\\), what is each generated token conditioned on?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qllm2','Correct. Every token depends on the prompt x and all tokens generated before it \u2014 the autoregressive condition.')">The prompt and everything generated so far</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm2','It depends on more than the prompt alone; earlier generated tokens matter too.')">Only the original prompt</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm2','It cannot see future tokens; generation is left to right.')">The tokens that come after it</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm2','It is conditioned on real context, not nothing.')">Nothing \u2014 each token is independent</button>
</div><div class="quiz-explain" id="qllm2-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 7.3  Steering a Model With Words (+ 7.3.1, 7.3.2)
// ───────────────────────────────────────────────────────────
LLM_PAGES.prompting = `
<div class="lesson-chapter-label">Section 7.3</div>
<h1 class="lesson-h1">Steering the Model With Words: Prompting</h1>
<p class="lesson-intro">A prompt supplies the context for a model’s response. Wording, examples, and formatting can change the continuation substantially. Try several prompt structures while keeping the model fixed.</p>

<h2 class="lesson-h2">Zero-Shot: Just Ask</h2>
<p class="lesson-p"><strong>Zero-shot</strong> prompting gives the model an instruction and no examples: <em>Classify the sentiment of this review: \u2026</em>. It works because instruction-following text is abundant in training data, so a well-phrased request already sits in a high-probability region of \\(P(y \\mid x)\\). The prompt-craft sandbox below lets you rewrite a prompt and watch the model\u2019s output distribution shift; small wording changes move probability mass in ways that are often surprising.</p>
${llmFig('Interactive \u00b7 The prompt-craft sandbox', 'llm-prompt', 'flagship', 1)}

${lrH3('7.3.1', 'Few-Shot Prompting and In-Context Learning')}
<p class="lesson-p">Sometimes an instruction alone is not enough, and you show the model a few worked examples <em>inside the prompt</em> before the real query:</p>
<div class="llm-eqbox">great movie &rarr; positive<br>terrible acting &rarr; negative<br>a dazzling triumph &rarr; <span style="color:var(--accent4)">?</span></div>
<p class="lesson-p">This is <strong>few-shot</strong> prompting, and the striking thing is that <em>no weights change</em>. The examples are just more prefix \\(x\\), and conditioning on them shifts \\(P(y\\mid x)\\) toward the demonstrated pattern. The model appears to \u201clearn\u201d the task from the examples at inference time, which is why this is called <strong>in-context learning</strong>, an emergent ability that appears only once models are large enough. Add and remove demonstrations below and watch accuracy on held-out queries climb with each example, then plateau.</p>
${llmFig('Interactive \u00b7 Few-shot demonstrations', 'llm-fewshot')}

${lrH3('7.3.2', 'System Prompts: Conditioning on a Persona')}
<p class="lesson-p">A <strong>system prompt</strong> is a special prefix, prepended before the conversation, that sets persistent behavior: a persona, a format, a set of rules. Mechanically it is nothing exotic, just more tokens at the front of \\(x\\) that every subsequent prediction is conditioned on. But because <em>everything</em> is conditioned on it, its influence is pervasive. Toggle system prompts below (\u201cYou are a terse pirate,\u201d \u201cYou are a formal legal assistant\u201d) on the same user question and watch the entire character of the continuation change while the question stays fixed.</p>
${llmFig('Interactive \u00b7 System-prompt conditioning', 'llm-system')}

<div class="lesson-note"><div class="lesson-note-label">Prompting Is Just Conditioning</div>
<p>Zero-shot, few-shot, and system prompts are not three different mechanisms. They are all the same act, choosing the prefix \\(x\\) that the fixed distribution \\(P(y\\mid x)\\) is conditioned on. The whole art of prompting is arranging the conditioning text so that the answer you want is the model\u2019s most probable continuation. Once you see it that way, the surprising sensitivity of models to phrasing stops being mysterious: you are moving the condition, so the distribution moves.</p></div>

<div class="quiz-block" id="qllm3"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In few-shot prompting, what changes when you add examples to the prompt?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qllm3','Correct. No weights change; the examples are extra prefix that conditions P(y|x) toward the demonstrated pattern \u2014 in-context learning.')">Only the conditioning prefix; no weights are updated</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm3','Few-shot prompting does not train the model; the weights are frozen.')">The model\u2019s weights are retrained</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm3','The architecture is unchanged; only the input text differs.')">The architecture is rebuilt</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm3','The vocabulary is fixed; examples do not change it.')">The vocabulary expands</button>
</div><div class="quiz-explain" id="qllm3-explain"></div></div>`;


// ───────────────────────────────────────────────────────────
// 7.4  Choosing the Next Word: Decoding (+ 7.4.1/7.4.2/7.4.3)
// ───────────────────────────────────────────────────────────
LLM_PAGES.decoding = `
<div class="lesson-chapter-label">Section 7.4</div>
<h1 class="lesson-h1">Choosing the Next Word: Decoding</h1>
<p class="lesson-intro">Decoding turns next-token probabilities into a choice. Greedy decoding always takes the highest-probability option; sampling allows variation. Temperature and filtering change which alternatives are likely to appear.</p>

<h2 class="lesson-h2">From Logits to a Distribution</h2>
<p class="lesson-p">The model\u2019s final layer outputs one raw score per vocabulary token, called a <strong>logit</strong>. Logits are unbounded real numbers, not probabilities. The <strong>softmax</strong> converts them into a valid distribution by exponentiating and normalizing:</p>
<div class="lesson-math">\\[ P(w) = \\frac{e^{z_w}}{\\sum_{j \\in V} e^{z_j}} \\]</div>
<p class="lesson-p">Exponentiating makes every value positive and amplifies differences; dividing by the sum forces the results to add to 1. Take the running example, the prefix <em>The train pulled into the</em> with four candidate next tokens carrying logits \\(1.2, 0.9, 0.1, -0.5\\). Softmax turns these into:</p>
<div class="llm-eqbox">station &rarr; 0.44 &nbsp;&nbsp; yard &rarr; 0.33 &nbsp;&nbsp; tunnel &rarr; 0.15 &nbsp;&nbsp; siding &rarr; 0.08</div>
<p class="lesson-p">The tool below is the core of all of this. It shows the prefix feeding the model, the four logits coming out, the softmax turning them into a distribution, and a <em>generate one token</em> button that samples a token, appends it to the prefix, and re-runs, extending the sentence one token at a time. Every decoding strategy that follows is a different rule for that sampling step.</p>
${llmFig('Interactive \u00b7 The generation engine', 'llm-engine')}

${lrH3('7.4.1', 'Greedy Decoding: Always Take the Top')}
<p class="lesson-p">The simplest rule is <strong>greedy decoding</strong>: at every step pick the single highest-probability token, the argmax.</p>
<div class="lesson-math">\\[ w_t = \\arg\\max_{w} \\; P(w \\mid w_{&lt;t}) \\]</div>
<p class="lesson-p">It is deterministic, so the same prompt always yields the same output. That determinism is also its weakness: greedy text is generic and prone to repetition, because the locally most probable token keeps leading back into the same phrase. Run it a few times below and you get the identical string each time, and it reads flat. Always taking the safest next word produces a bland sentence.</p>
${llmFig('Interactive \u00b7 Greedy decoding', 'llm-greedy')}

${lrH3('7.4.2', 'Random Sampling: Roll the Dice')}
<p class="lesson-p">The opposite approach is to <strong>sample</strong> the next token in proportion to its probability. This restores variety, but it has a subtle failure. Consider the <strong>tail</strong> of the distribution: any single low-probability token is unlikely, but the vocabulary has tens of thousands of them, and their probabilities <em>sum</em> to a meaningful amount. So a rare, wrong token gets chosen more often than you would expect, and once one is in the context, the following predictions are conditioned on it and the sentence can degrade quickly. Run the sampler below; the tail counter tracks how often it lands in the low-probability tail, and after enough draws you can watch a sentence come apart.</p>
${llmFig('Interactive \u00b7 Random sampling and the fat tail', 'llm-sample')}

${lrH3('7.4.3', 'Temperature: The Dial Between Boring and Unhinged', 'flagship')}
<p class="lesson-p">Greedy decoding is too rigid and pure sampling is too loose. <strong>Temperature</strong> \\(\\tau\\) is a continuous control between them. Before the softmax, divide every logit by \\(\\tau\\):</p>
<div class="lesson-math">\\[ P_\\tau(w) = \\frac{e^{z_w/\\tau}}{\\sum_{j} e^{z_j/\\tau}} \\]</div>
<p class="lesson-p">Lowering the temperature (\\(\\tau < 1\\)) magnifies the gaps between logits, concentrating probability on the top token and moving the behavior toward greedy. Raising it (\\(\\tau > 1\\)) shrinks the gaps, flattening the distribution toward uniform. The table below, which the slider reproduces, shows the effect on our four tokens:</p>
<div class="llm-eqbox">\\(\\tau=0.1\\): (.95, .05, 0, 0) &mdash; nearly greedy<br>\\(\\tau=0.5\\): (.59, .32, .07, .02)<br>\\(\\tau=1\\): (.44, .33, .15, .08) &mdash; the model\u2019s native distribution<br>\\(\\tau=10\\): (.27, .26, .24, .23)<br>\\(\\tau=100\\): (.25, .25, .25, .25) &mdash; nearly uniform</div>
<p class="lesson-p">Drag the temperature slider and watch the bars collapse to a single spike as it drops and flatten as it rises, with a live text pane generating at the current \\(\\tau\\): repetitive when low, more varied and then incoherent when high. Temperature is the most useful control in practical generation, and it amounts to one division.</p>
${llmFig('Interactive \u00b7 The temperature dial', 'llm-temp', 'flagship', 1)}

<div class="quiz-block" id="qllm4"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Raising the temperature \\(\\tau\\) above 1 does what to the distribution?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qllm4','Correct. Dividing logits by a larger \u03c4 shrinks their gaps, flattening the distribution toward uniform and increasing randomness.')">Flattens it toward uniform, increasing randomness</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm4','That is cooling (\u03c4<1), which sharpens toward greedy.')">Sharpens it onto the single top token</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm4','Temperature changes the distribution\u2019s shape; it does not leave it unchanged.')">Leaves the distribution unchanged</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm4','The vocabulary is fixed; temperature reshapes probabilities, not the token set.')">Removes tokens from the vocabulary</button>
</div><div class="quiz-explain" id="qllm4-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 7.5  How a Model Is Actually Trained (+ 7.5.1/7.5.2/7.5.3)
// ───────────────────────────────────────────────────────────
LLM_PAGES.llmtrain = `
<div class="lesson-chapter-label">Section 7.5</div>
<h1 class="lesson-h1">How a Language Model Is Actually Trained</h1>
<p class="lesson-intro">Pretraining learns from large amounts of text, using the text itself to supply targets. Instruction tuning and preference-based training can then adapt a model’s behavior. This section focuses on the pretraining stage.</p>

<h2 class="lesson-h2">The Three Stages</h2>
<p class="lesson-p"><strong>Pretraining</strong> takes a randomly initialized model and a very large amount of raw text and teaches it next-token prediction, producing a model that knows language and facts but not how to behave. <strong>Instruction tuning</strong> then continues training on curated instruction-and-response pairs, teaching the model to follow requests rather than simply continue text. <strong>Alignment</strong>, often through preference learning such as RLHF, shapes it further using human judgments of which responses are better. The capability comes from stage one; stages two and three direct it.</p>

${lrH3('7.5.1', 'Self-Supervised Pretraining', 'flagship')}
<p class="lesson-p">Pretraining needs no human labels, which is what lets it scale to trillions of tokens. The trick is <strong>self-supervision</strong>: for any span of real text, the next token <em>is</em> the label. Slide a window along <em>The train pulled into the station and stopped</em> and at every position the model predicts the next token, with the actual next token serving as ground truth, for free.</p>
<p class="lesson-p">The loss is <strong>cross-entropy</strong>, the negative log probability the model assigned to the true next token:</p>
<div class="lesson-math">\\[ L = -\\log P(w_t^{\\text{true}} \\mid w_{&lt;t}) \\]</div>
<p class="lesson-p">When the model is confident and right, \\(P\\) is near 1 and the loss near 0; when it is confident and wrong, \\(P\\) is near 0 and \\(-\\log P\\) explodes. Averaged over every position in the corpus, this is the single number pretraining drives down, by backpropagation through every weight, including the embeddings. Two details matter. <strong>Teacher forcing</strong>: during training the model is always fed the <em>true</em> prior tokens, not its own guesses, so an early mistake does not derail the rest of the sequence. And the loss is exactly the cross-entropy penalty meter from logistic regression, now applied at every token position. Step through the training loop below and drive the loss down across epochs.</p>
${llmFig('Interactive \u00b7 The pretraining loop (teacher forcing + cross-entropy)', 'llm-pretrain', 'flagship', 1)}

${lrH3('7.5.2', 'Where the Training Text Comes From')}
<p class="lesson-p">Pretraining corpora are assembled from sources like Common Crawl (a web scrape), curated sets like C4 and The Pile, and book collections, reaching trillions of tokens. Raw web text is noisy, so it passes through filters: <strong>deduplication</strong> (repeated text encourages memorization and wastes compute), <strong>quality classifiers</strong> (keep prose that resembles trusted sources), <strong>toxicity filters</strong>, and <strong>PII scrubbing</strong>. Run the filter pipeline below and watch the corpus shrink. One documented caveat: aggressive toxicity filters disproportionately remove text written in minority dialects, which can leave the model <em>worse</em> at understanding those dialects, so the filtering choice carries a fairness cost.</p>
<p class="lesson-p">Four ethical problems with this data are unavoidable: <strong>copyright</strong> (much of it is used without a license), <strong>consent</strong> (authors did not agree to this use), <strong>privacy</strong> (personal information collected at scale), and <strong>representational skew</strong> (the internet's distribution of voices is not the world's). The panel presents each with the relevant evidence.</p>
${llmFig('Interactive \u00b7 Corpus composition and the filter pipeline', 'llm-corpus')}

${lrH3('7.5.3', 'Specializing a Model: Finetuning')}
<p class="lesson-p"><strong>Finetuning</strong> continues training a pretrained model on a narrower dataset to specialize it for legal text, medical language, or some other domain. It is far cheaper than pretraining from scratch, because the model already knows language and only needs adjusting. The practical question is <em>which</em> weights to update: all of them (full finetuning, effective but expensive), or a small added set while the rest stay frozen (parameter-efficient methods such as LoRA, developed later). Select a domain in the panel below and watch the model's output on a sample prompt shift toward that domain's vocabulary.</p>
${llmFig('Interactive \u00b7 The domain-adapter', 'llm-finetune')}

<div class="lesson-note"><div class="lesson-note-label">The Pattern You Have Seen Before</div>
<p>Self-supervised pretraining is the same bargain as word2vec: invent a prediction task whose labels come free from the data, train hard on it, and the representations you grow along the way are the real prize. Word2vec grew word vectors; an LLM grows an entire model of language and the world. Same idea, staggering difference in scale.</p></div>

<div class="quiz-block" id="qllm5"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is pretraining called \u201cself-supervised\u201d?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qllm5','Correct. The next token in real text serves as the label, so no human annotation is needed \u2014 the data supervises itself.')">The next token in the text is its own label</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm5','Humans do not label pretraining data; that is the whole advantage.')">Humans label every token by hand</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm5','It uses cross-entropy, but that is the loss, not the reason it is self-supervised.')">Because it uses the cross-entropy loss</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm5','It very much needs data; it just needs no labels.')">Because it needs no training data</button>
</div><div class="quiz-explain" id="qllm5-explain"></div></div>

<div class="quiz-block" id="qllm5b"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does teacher forcing do during training?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qllm5b','Correct. The model is always fed the true previous tokens as context, so one early error does not cascade through the whole sequence during training.')">Feeds the true prior tokens as context, not the model\u2019s guesses</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm5b','It is used at training time; generation at inference uses the model\u2019s own tokens.')">Forces the model to use its own outputs during training</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm5b','It concerns the input context, not the learning rate.')">Raises the learning rate near teachers</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm5b','It does not freeze weights; backprop updates them all.')">Freezes all the weights</button>
</div><div class="quiz-explain" id="qllm5b-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 7.6  Measuring Whether It's Any Good (+ 7.6.1/7.6.2/7.6.3)
// ───────────────────────────────────────────────────────────
LLM_PAGES.eval = `
<div class="lesson-chapter-label">Section 7.6</div>
<h1 class="lesson-h1">Measuring Whether a Model Is Any Good</h1>
<p class="lesson-intro">Language-model quality has several dimensions. Predictive loss, task accuracy, speed, resource use, and performance across groups answer different questions. Evaluation also has to account for possible benchmark contamination.</p>

${lrH3('7.6.1', 'How Surprised Is the Model? Perplexity')}
<p class="lesson-p">The intrinsic measure of a language model is <strong>perplexity</strong>: how surprised the model is by held-out text it did not train on. It is built directly from the cross-entropy loss. For a test sequence of \\(N\\) tokens, perplexity is the inverse probability, normalized by length:</p>
<div class="lesson-math">\\[ \\mathrm{PPL} = P(w_1 \\ldots w_N)^{-\\frac{1}{N}} = \\exp\\!\\Big(-\\frac{1}{N}\\sum_{i=1}^{N} \\log P(w_i \\mid w_{&lt;i})\\Big) \\]</div>
<p class="lesson-p">The exponent is exactly the average cross-entropy loss, so <strong>perplexity is the exponentiated loss</strong>. It can be read as the model's effective branching factor: a perplexity of 20 means the model is, on average, as uncertain as if it were choosing uniformly among 20 tokens at each step. Lower is better. Feed a sentence through the meter below and watch per-token surprise accumulate into a perplexity score. One caveat the equation makes clear: perplexity depends on the tokenization, both the \\(N\\) and the tokens themselves, so <em>perplexities computed with different tokenizers cannot be compared</em>. Switch the tokenizer and the number changes even though the model does not.</p>
${llmFig('Interactive \u00b7 The perplexity surprise meter', 'llm-ppl')}

${lrH3('7.6.2', 'Testing Knowledge: MMLU and the Contamination Trap')}
<p class="lesson-p">Perplexity measures fluency, not knowledge. For that we use benchmarks such as <strong>MMLU</strong>, 15,908 multiple-choice questions across 57 subjects from math to law, scored as plain accuracy. But there is a problem that inflates scores: <strong>data contamination</strong>. If a public benchmark's questions were scraped into the training corpus, the model may have memorized the answers, so a high score reflects recall rather than reasoning. Below, watch the model answer normally, then turn on "leak the test set into training" and see accuracy jump, with the exact question visible in the training feed. Any benchmark published on the open web can end up inside the data it was meant to test against.</p>
${llmFig('Interactive \u00b7 MMLU harness + contamination detective', 'llm-mmlu')}

${lrH3('7.6.3', 'The Other Costs: Energy, Fairness, Speed')}
<p class="lesson-p">Accuracy hides real costs. A bigger model may score higher while drawing far more <strong>energy</strong> (measured in kWh and kg of CO\u2082) and running with worse <strong>latency</strong>. And a single average-accuracy number can mask <strong>unfairness</strong>: strong overall performance that is much worse for some groups than others. The scorecard below plots accuracy, latency, energy, and fairness on one radar; drag the model-size slider and watch accuracy rise while energy and latency worsen, the tradeoff made visible. A fairness panel lets you toggle between optimizing the <em>average</em> and optimizing the <em>worst-off group</em>, the Rawlsian choice, and see the per-group bars respond. \u201cBest\u201d depends on which axes you are willing to pay for.</p>
${llmFig('Interactive \u00b7 The multi-axis model scorecard', 'llm-radar')}

<div class="quiz-block" id="qllm6"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Perplexity is best described as:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qllm6','Correct. Perplexity is the exponentiated average cross-entropy \u2014 the model\u2019s effective branching factor on held-out text. Lower is better.')">The exponentiated average cross-entropy; lower is better</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm6','Higher perplexity means more surprise, which is worse.')">A score where higher is always better</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm6','It is tokenizer-dependent, so cross-tokenizer comparisons are invalid.')">Comparable across any two tokenizers</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm6','It measures fluency/surprise, not factual knowledge \u2014 that is what MMLU is for.')">A direct measure of factual knowledge</button>
</div><div class="quiz-explain" id="qllm6-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 7.7  Ethics & Safety
// ───────────────────────────────────────────────────────────
LLM_PAGES.ethics = `
<div class="lesson-chapter-label">Section 7.7</div>
<h1 class="lesson-h1">What Can Go Wrong: Ethics &amp; Safety</h1>
<p class="lesson-intro">Fluent generation does not guarantee factual accuracy or responsible use. This section examines hallucination, privacy, bias, and other problems that next-token prediction alone does not resolve.</p>

<h2 class="lesson-h2">Hallucination: Coherent Is Not True</h2>
<p class="lesson-p">An LLM optimizes for <em>probable</em> text, not <em>true</em> text, and the two come apart. When a fluent continuation happens to be false, the model states it with the same confidence as a fact, a <strong>hallucination</strong>. The danger is precisely that the output is coherent and authoritative-sounding, so fluency is not evidence of accuracy. The gallery below shows a confident, well-formed, wrong answer with the annotation that matters most of all: <em>coherent \u2260 true</em>.</p>

<h2 class="lesson-h2">Sycophancy, Leakage, and Amplified Abuse</h2>
<p class="lesson-p"><strong>Sycophancy</strong>: because agreeable responses were often rewarded during alignment, models tend to cave when a user asserts something false rather than correct them. <strong>Training-data leakage</strong>: a model can memorize and later regurgitate verbatim strings from its training data, including private information like a phone number or address, which an adversary can deliberately extract. And the <strong>Tay</strong> case study, a 2016 chatbot that went from launch to shutdown in about 16 hours after users taught it to be abusive, shows how an interaction-and-learning loop can amplify the worst inputs at machine speed.</p>

<h2 class="lesson-h2">The Oldest Lesson: ELIZA</h2>
<p class="lesson-p">In 1966, a simple pattern-matching program called <strong>ELIZA</strong> imitated a therapist, and people confided in it, convinced that something understood them. That is the frame for this section: the tendency to trust, confide in, and depend on a responsive text system is not new and does not depend on the system being intelligent. It is structural, which is why emotional dependence and privacy are first-order concerns rather than edge cases. The failure-mode gallery below is worth reading carefully.</p>
${llmFig('Interactive \u00b7 The failure-mode gallery', 'llm-ethics')}

<div class="lesson-note"><div class="lesson-note-label">Why Capability Raises the Stakes</div>
<p>Every hazard here scales <em>with</em> the model\u2019s fluency, not against it. A clumsy model is unconvincing when wrong; a fluent one is dangerously persuasive. So the better these systems get at their one job, predicting probable text, the more carefully their outputs have to be treated, especially where truth, privacy, and vulnerable users are involved. The capability and the responsibility grow together.</p></div>

<div class="quiz-block" id="qllm7"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does an LLM hallucinate confident falsehoods?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qllm7','Correct. It optimizes for probable, fluent text, not for truth, so a plausible-sounding false continuation is produced with full confidence.')">It optimizes for probable text, not for true text</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm7','Coherence is exactly what it is good at; that is what makes hallucinations dangerous.')">It cannot produce coherent sentences</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm7','It has no internal fact-checker or notion of truth to consult.')">It deliberately chooses to lie</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm7','Hallucination happens regardless of temperature setting.')">Only high temperature causes it</button>
</div><div class="quiz-explain" id="qllm7-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 7.8  Recap
// ───────────────────────────────────────────────────────────
LLM_PAGES.llmrecap = `
<div class="lesson-chapter-label">Section 7.8</div>
<h1 class="lesson-h1">The Whole Model, End to End</h1>
<p class="lesson-intro">Trace the stages from training text to generated output. Revisit a stage in the diagram, or open the model demo to inspect token probabilities.</p>

<h2 class="lesson-h2">From Web Corpus to Conversation</h2>
<p class="lesson-p">Follow the whole sequence. A <strong>web corpus</strong> is scraped and <strong>filtered</strong> (7.5.2). <strong>Pretraining</strong> minimizes next-token cross-entropy over it (7.5.1), producing a base model that has absorbed grammar, facts, and reasoning as a by-product of predicting well (7.0). <strong>Instruction tuning</strong> and <strong>alignment</strong> then direct that capability toward being helpful and safe. The deployed model takes a <strong>prompt</strong> (7.3), runs <strong>conditional generation</strong> (7.2) through whichever <strong>architecture</strong> it uses (7.1), and <strong>decodes</strong> each token with temperature (7.4). We judge it with <strong>perplexity, MMLU, energy, and fairness</strong> (7.6), with its <strong>safety hazards</strong> attached as warning flags (7.7). Click any node below to jump back. The map is laid out to match the logistic regression, embeddings, and neural network recaps, so you can trace the line from logistic regression to a chatbot.</p>
${llmFig('Interactive \u00b7 The LLM lifecycle map', 'llm-recap')}

<h2 class="lesson-h2">See It Whole, and Run It Live</h2>
<p class="lesson-p">Two full-screen instruments let you go deeper. The <strong>anatomy</strong> walks the entire pipeline, from raw text through tokenization, embeddings, the transformer stack, logits, softmax, and sampling, one expandable stage at a time. And the <strong>live model</strong> is a real language model running in your browser: prompt it, and watch its actual next-token distribution and sampling happen in real time.</p>
<div style="display:flex;gap:.8rem;flex-wrap:wrap;justify-content:center;margin:1.25rem 0 .5rem">
  <button onclick="openLLMAnatomy()" style="background:linear-gradient(135deg,var(--accent),#a78bfa);color:var(--bg);border:none;border-radius:9px;padding:.7rem 1.3rem;font-family:var(--mono);font-size:.78rem;font-weight:700;cursor:pointer">&#10697; Open the full LLM Anatomy</button>
  <button onclick="if(window.openLLMModel)openLLMModel();else openLLMAnatomy()" style="background:var(--surface3);color:var(--accent);border:1px solid var(--border2);border-radius:9px;padding:.7rem 1.3rem;font-family:var(--mono);font-size:.78rem;font-weight:700;cursor:pointer">&#9673; Run a live model</button>
</div>

<div class="lesson-note"><div class="lesson-note-label">Where This Goes Next</div>
<p>We treated the transformer as an unopened component that maps a prefix to logits. It is time to open it. Next we build the mechanism inside, <strong>attention</strong>, which is how each token decides which other tokens to look at, and how the causal mask from 7.1 is actually enforced. But the objective never changes: everything the transformer does is in service of that first equation, \\(P(w_t \\mid w_{&lt;t})\\). You have built the whole system around the box; next you build the box.</p></div>

<div class="quiz-block" id="qllm8"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Which ordering matches the LLM lifecycle?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qllm8','Correct. Filter the corpus, pretrain on next-token prediction, instruction-tune and align, then deploy for prompted generation.')">Filter corpus \u2192 pretrain \u2192 instruction-tune/align \u2192 deploy</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm8','Alignment shapes a model that must already be pretrained; it cannot come first.')">Align \u2192 pretrain \u2192 filter \u2192 decode</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm8','You cannot evaluate perplexity before the model is trained.')">Evaluate \u2192 pretrain \u2192 filter \u2192 prompt</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qllm8','Decoding is an inference-time step, not the first training stage.')">Decode \u2192 align \u2192 pretrain \u2192 scrape</button>
</div><div class="quiz-explain" id="qllm8-explain"></div></div>`;


// ═══════════════════════════════════════════════════════════
// CHAPTER 7 · INSTRUMENTS  (part 1: 7.0–7.3)
// ═══════════════════════════════════════════════════════════

// shared: probability-bar rows
function llmBars(container, dist, opts){
  opts = opts || {};
  if(!container) return;
  const max = Math.max(...dist.map(d=>d[1]), 0.001);
  container.innerHTML = dist.map((d,i)=>{
    const hl = opts.pick!=null ? i===opts.pick : i===0;
    const col = hl ? (opts.accent||LRC.acc) : LRC.pur;
    const w = (d[1]/max*100).toFixed(1);
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:5px">'+
      '<span style="font-family:var(--mono);font-size:.78rem;color:var(--text);width:78px;text-align:right">'+d[0]+'</span>'+
      '<div style="flex:1;height:18px;background:var(--surface3);border-radius:5px;overflow:hidden"><div style="height:100%;width:'+w+'%;background:'+col+';border-radius:5px;transition:width .35s"></div></div>'+
      '<span style="font-family:var(--mono);font-size:.68rem;color:var(--muted);width:40px">'+(d[1]*100).toFixed(0)+'%</span></div>';
  }).join('');
}

// ───────────────────────────────────────────────────────────
// 7.0 — Chain rule factorization stepper
// ───────────────────────────────────────────────────────────
const CHAIN_TOKENS = ['The','cat','sat','on','the','mat'];
const CHAIN_PROBS = [0.9, 0.31, 0.44, 0.62, 0.95, 0.51];
let _llmChain = { step:0 };
function llmChainInit(){
  _llmChain = { step:0 };
  const host = lrEl('llm-chain'); if(!host) return;
  host.innerHTML =
    '<div id="llm-chain-sent" style="text-align:center;font-family:var(--mono);font-size:1rem;line-height:2.2;margin-bottom:1rem"></div>'+
    '<div id="llm-chain-factors" style="font-family:var(--mono);font-size:.82rem;text-align:center;color:var(--muted);margin-bottom:1rem;min-height:2.4em;line-height:1.9"></div>'+
    '<div class="lr-readout" style="justify-content:center"><span class="lr-stat"><span class="lr-stat-k">running product P(sequence)</span><span class="lr-stat-v" id="llm-chain-prod" style="color:'+LRC.acc+'">\u2014</span></span></div>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><button class="lr-btn solid" onclick="llmChainStep()">factor next token \u2192</button><button class="lr-btn" onclick="llmChainInit()">reset</button></div>'+
    '<div class="lr-note">Each token multiplies in its conditional probability given everything before it. The product is the probability of the whole sentence.</div>';
  llmChainRender();
}
function llmChainStep(){ _llmChain.step=Math.min(CHAIN_TOKENS.length,_llmChain.step+1); llmChainRender(); }
function llmChainRender(){
  const s=_llmChain.step;
  lrSet('llm-chain-sent', CHAIN_TOKENS.map((t,i)=>'<span class="llm-tok '+(i<s?'gen':'')+(i===s?' cur':'')+'">'+t+'</span>').join(' '));
  let factors=[], prod=1;
  for(let i=0;i<s;i++){ const cond = i===0?'\u2205':CHAIN_TOKENS.slice(0,i).join(' '); factors.push('P('+CHAIN_TOKENS[i]+' | '+cond+')='+CHAIN_PROBS[i].toFixed(2)); prod*=CHAIN_PROBS[i]; }
  lrSet('llm-chain-factors', s===0?'press the button to begin factoring':factors.join('  \u00d7  '));
  lrTxt('llm-chain-prod', s===0?'\u2014':prod.toFixed(4));
}

// ───────────────────────────────────────────────────────────
// 7.0 — Next-token distribution explorer
// ───────────────────────────────────────────────────────────
const NEXT_PRESETS = {
  'The capital of France is': [['Paris',0.86],['a',0.05],['located',0.03],['known',0.03],['now',0.03]],
  'Yesterday I saw a': [['man',0.14],['dog',0.12],['movie',0.11],['bird',0.10],['friend',0.09]],
  '17 times 3 equals': [['51',0.78],['53',0.07],['48',0.05],['a',0.05],['fifty',0.05]],
  'She poured water until it was': [['full',0.71],['empty',0.09],['gone',0.08],['overflowing',0.07],['done',0.05]]
};
let _llmNext = { key:'The capital of France is' };
function llmNextInit(){
  _llmNext = { key:'The capital of France is' };
  const host = lrEl('llm-next'); if(!host) return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;flex-wrap:wrap">'+Object.keys(NEXT_PRESETS).map((k,i)=>'<button class="lr-btn '+(i===0?'on':'')+'" onclick="llmNextSet('+i+')">'+k.slice(0,22)+'\u2026</button>').join('')+'</div>'+
    '<div class="llm-prompt" style="margin-bottom:1rem"><span class="usr" id="llm-next-prefix">'+_llmNext.key+'</span> <span class="cur" style="color:'+LRC.amb+'">___</span></div>'+
    '<div id="llm-next-bars"></div>'+
    '<div class="lr-readout" style="margin-top:.6rem;justify-content:center"><span class="lr-stat"><span class="lr-stat-k">distribution shape</span><span class="lr-stat-v" id="llm-next-shape" style="color:'+LRC.acc+'">\u2014</span></span></div>'+
    '<div class="lr-note">A sharp distribution means the context pins the answer (the model knows). A flat one means many continuations are plausible.</div>';
  llmNextRender();
}
function llmNextSet(i){ const keys=Object.keys(NEXT_PRESETS); _llmNext.key=keys[i]; document.querySelectorAll('#llm-next .lr-btn').forEach((b,j)=>b.classList.toggle('on',j===i)); lrSet('llm-next-prefix',_llmNext.key); llmNextRender(); }
function llmNextRender(){
  const dist=NEXT_PRESETS[_llmNext.key];
  llmBars(lrEl('llm-next-bars'), dist);
  const top=dist[0][1];
  lrTxt('llm-next-shape', top>0.6?'sharp \u2014 confident':top>0.3?'moderate':'flat \u2014 uncertain');
  const el=lrEl('llm-next-shape'); if(el) el.style.color = top>0.6?LRC.grn:top>0.3?LRC.amb:LRC.red;
}

// ───────────────────────────────────────────────────────────
// 7.1 — Architecture switcher  [flagship]
// ───────────────────────────────────────────────────────────
let _llmArch = { mode:'decoder' };
function llmArchInit(){
  _llmArch = { mode:'decoder' };
  const host = lrEl('llm-arch'); if(!host) return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center">'+
      '<button class="lr-btn on llm-archbtn" id="llm-arch-decoder" onclick="llmArchSet(\'decoder\')">Decoder-only</button>'+
      '<button class="lr-btn llm-archbtn" id="llm-arch-encoder" onclick="llmArchSet(\'encoder\')">Encoder-only</button>'+
      '<button class="lr-btn llm-archbtn" id="llm-arch-encdec" onclick="llmArchSet(\'encdec\')">Encoder-Decoder</button>'+
    '</div>'+
    '<div class="nn-split"><div><div class="nn-split-lab">information flow</div><canvas id="llm-arch-flow" style="width:100%;display:block"></canvas></div>'+
      '<div><div class="nn-split-lab">attention mask (who sees whom)</div><canvas id="llm-arch-mask" style="width:100%;display:block"></canvas></div></div>'+
    '<div class="lr-note" id="llm-arch-note"></div>';
  llmArchDraw();
}
function llmArchSet(m){ _llmArch.mode=m; ['decoder','encoder','encdec'].forEach(k=>lrEl('llm-arch-'+k).classList.toggle('on',k===m)); llmArchDraw(); }
function llmArchDraw(){
  const toks=['So','long','and','thanks'];
  const fc=lrCanvas('llm-arch-flow',220); if(fc){ const {ctx,W,H}=fc; const n=toks.length; const y1=H*0.72, xs=toks.map((t,i)=>30+i*((W-60)/(n-1)));
    // draw tokens
    const drawToks=(yy,col)=>{ toks.forEach((t,i)=>{ ctx.fillStyle=col; ctx.beginPath(); ctx.arc(xs[i],yy,13,0,7); ctx.fill(); ctx.fillStyle='#070B18'; ctx.font='9px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(t.slice(0,4),xs[i],yy+3); }); ctx.textAlign='left'; };
    if(_llmArch.mode==='decoder'){
      drawToks(y1,LRC.acc);
      for(let i=0;i<n;i++)for(let j=0;j<i;j++){ ctx.strokeStyle='rgba(77,227,255,0.4)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(xs[j],y1-13); ctx.bezierCurveTo(xs[j],y1-50,xs[i],y1-50,xs[i],y1-13); ctx.stroke(); }
      // emit next token
      ctx.fillStyle=LRC.amb; ctx.beginPath(); ctx.arc(xs[n-1]+40,y1,13,0,7); ctx.fill(); ctx.fillStyle='#070B18'; ctx.font='9px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('for',xs[n-1]+40,y1+3); ctx.textAlign='left';
      ctx.strokeStyle=LRC.amb; ctx.setLineDash([4,3]); ctx.beginPath(); ctx.moveTo(xs[n-1]+13,y1); ctx.lineTo(xs[n-1]+27,y1); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText('left-to-right, emits next token (GPT, Llama)',20,24);
    } else if(_llmArch.mode==='encoder'){
      drawToks(y1,LRC.pur);
      for(let i=0;i<n;i++)for(let j=0;j<n;j++){ if(i===j)continue; ctx.strokeStyle='rgba(161,143,255,0.28)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(xs[j],y1-13); ctx.bezierCurveTo(xs[j],y1-46,xs[i],y1-46,xs[i],y1-13); ctx.stroke(); }
      // masked token in middle glows, classifier head
      ctx.strokeStyle=LRC.amb; ctx.lineWidth=2.5; ctx.beginPath(); ctx.arc(xs[2],y1,15,0,7); ctx.stroke();
      ctx.fillStyle=LRC.grn; ctx.beginPath(); ctx.arc(W/2,y1-90,11,0,7); ctx.fill(); ctx.fillStyle='#070B18'; ctx.font='8px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('cls',W/2,y1-87); ctx.textAlign='left';
      ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText('bidirectional \u2192 vectors, not text (BERT)',20,24);
    } else {
      // encoder block left, decoder right
      const ex=xs.slice(0,2), dx=[W*0.62,W*0.8];
      ex.forEach((x,i)=>{ ctx.fillStyle=LRC.pur; ctx.beginPath(); ctx.arc(x,y1,12,0,7); ctx.fill(); ctx.fillStyle='#070B18'; ctx.font='8px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(toks[i].slice(0,3),x,y1+3); });
      for(let i=0;i<2;i++)for(let j=0;j<2;j++){ if(i===j)continue; ctx.strokeStyle='rgba(161,143,255,0.3)'; ctx.beginPath(); ctx.moveTo(ex[j],y1-12); ctx.bezierCurveTo(ex[j],y1-40,ex[i],y1-40,ex[i],y1-12); ctx.stroke(); }
      dx.forEach((x,i)=>{ ctx.fillStyle=LRC.acc; ctx.beginPath(); ctx.arc(x,y1,12,0,7); ctx.fill(); ctx.fillStyle='#070B18'; ctx.font='8px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(['chat','!'][i],x,y1+3); });
      // cross attention
      ctx.strokeStyle='rgba(224,169,59,0.5)'; ctx.setLineDash([4,3]); ex.forEach(x=>dx.forEach(d=>{ ctx.beginPath(); ctx.moveTo(x,y1-12); ctx.lineTo(d,y1-12); ctx.stroke(); })); ctx.setLineDash([]);
      ctx.textAlign='left'; ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText('encoder reads all \u2192 decoder emits (translation)',15,24);
      ctx.fillStyle=LRC.pur; ctx.fillText('EN',ex[0]-4,y1+32); ctx.fillStyle=LRC.acc; ctx.fillText('FR',dx[0]-4,y1+32);
    }
  }
  // mask grid
  const mc=lrCanvas('llm-arch-mask',220); if(mc){ const {ctx,W,H}=mc; const n=toks.length; const S=Math.min(W,H)-40; const ox=(W-S)/2, oy=20; const cw=S/n;
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){ let on=false; if(_llmArch.mode==='decoder') on=j<=i; else on=true; // encoder & (encoder part of) encdec full
      ctx.fillStyle=on?'rgba(77,227,255,0.55)':'var(--surface3)'; ctx.fillStyle=on?'rgba(77,227,255,0.5)':'#182342'; ctx.fillRect(ox+j*cw+1,oy+i*cw+1,cw-2,cw-2); }
    ctx.fillStyle=LRC.muted; ctx.font='8px IBM Plex Mono, monospace'; ctx.textAlign='center';
    toks.forEach((t,i)=>{ ctx.fillText(t.slice(0,3),ox+i*cw+cw/2,oy-4); ctx.textAlign='right'; ctx.fillText(t.slice(0,3),ox-3,oy+i*cw+cw/2+3); ctx.textAlign='center'; });
    ctx.textAlign='left'; ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('row = query, col = key',ox,oy+S+14);
  }
  const notes={decoder:'<b style="color:'+LRC.acc+'">Causal mask:</b> token t attends only to positions 1..t. Exactly what next-token prediction requires \u2014 no peeking ahead.',encoder:'<b style="color:'+LRC.pur+'">Full mask:</b> every token attends to all others, both directions. Rich representations, but cannot generate left-to-right.',encdec:'<b style="color:'+LRC.amb+'">Both:</b> encoder reads the source fully, a causal decoder emits the target while attending back \u2014 built for translation.'};
  lrSet('llm-arch-note',notes[_llmArch.mode]);
}

// ───────────────────────────────────────────────────────────
// 7.2 — Autoregressive generation loop
// ───────────────────────────────────────────────────────────
const COND_START = ['Q:','What','is','the','capital','of','Japan','?','A:'];
const COND_GEN = [['Tokyo',0.88],['Kyoto',0.05],['Osaka',0.04],['It',0.03]];
let _llmCond = { generated:[], prod:1, anim:null };
function llmCondInit(){
  _llmCond = { generated:[], prod:1, anim:null };
  const host = lrEl('llm-cond'); if(!host) return;
  host.innerHTML =
    '<div class="llm-prompt" id="llm-cond-text" style="margin-bottom:1rem"></div>'+
    '<div id="llm-cond-bars" style="margin-bottom:1rem"></div>'+
    '<div class="lr-readout" style="justify-content:center"><span class="lr-stat"><span class="lr-stat-k">P(answer | prompt)</span><span class="lr-stat-v" id="llm-cond-prod" style="color:'+LRC.acc+'">1.00</span></span></div>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><button class="lr-btn solid" onclick="llmCondStep()">generate one token \u2192</button><button class="lr-btn" onclick="llmCondInit()">reset</button></div>'+
    '<div class="lr-note">Each generated token is sampled, appended, and fed back in. The product is P(answer | prompt).</div>';
  llmCondRender();
}
function llmCondStep(){
  const seq=['Tokyo','is','Japan','\u2019s','capital','.'];
  const probs=[0.88,0.6,0.5,0.7,0.9,0.8];
  if(_llmCond.generated.length>=seq.length) return;
  const i=_llmCond.generated.length;
  _llmCond.generated.push(seq[i]); _llmCond.prod*=probs[i];
  llmCondRender();
}
function llmCondRender(){
  const prefix=COND_START.map(t=>'<span class="usr">'+t+'</span>').join(' ');
  const gen=_llmCond.generated.map(t=>' <span class="cmp llm-tok gen">'+t+'</span>').join('');
  lrSet('llm-cond-text', prefix+gen+' <span class="cur" style="color:'+LRC.amb+'">\u2588</span>');
  llmBars(lrEl('llm-cond-bars'), COND_GEN);
  lrTxt('llm-cond-prod', _llmCond.prod.toFixed(3));
}

// ───────────────────────────────────────────────────────────
// 7.3 — Prompt-craft sandbox  [flagship]
// ───────────────────────────────────────────────────────────
let _llmPrompt = { choices:false, paren:false, role:false };
function llmPromptInit(){
  _llmPrompt = { choices:false, paren:false, role:false };
  const host = lrEl('llm-prompt'); if(!host) return;
  host.innerHTML =
    '<div class="llm-prompt" id="llm-prompt-text" style="margin-bottom:1rem;min-height:3em"></div>'+
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center">'+
      '<button class="lr-btn" id="llm-p-choices" onclick="llmPromptTog(\'choices\')">+ explicit choices (P)/(N)</button>'+
      '<button class="lr-btn" id="llm-p-paren" onclick="llmPromptTog(\'paren\')">+ open-paren nudge</button>'+
      '<button class="lr-btn" id="llm-p-role" onclick="llmPromptTog(\'role\')">+ assign a role</button>'+
    '</div>'+
    '<div id="llm-prompt-bars"></div>'+
    '<div class="lr-readout" style="margin-top:.6rem;justify-content:center"><span class="lr-stat"><span class="lr-stat-k">prob. mass on a valid label</span><span class="lr-stat-v" id="llm-prompt-mass" style="color:'+LRC.acc+'">\u2014</span></span></div>'+
    '<div class="lr-note">Each lever concentrates probability on the intended answer format. Prompt engineering isn\u2019t mysticism \u2014 every toggle has a measurable effect.</div>';
  llmPromptRender();
}
function llmPromptTog(k){ _llmPrompt[k]=!_llmPrompt[k]; lrEl('llm-p-'+k).classList.toggle('on',_llmPrompt[k]); llmPromptRender(); }
function llmPromptRender(){
  let p='';
  if(_llmPrompt.role) p+='<span class="sys">You are a sentiment classifier.</span>\n';
  p+='<span class="usr">Review: "A dazzling triumph."</span>\n';
  p+='<span class="usr">Sentiment'+(_llmPrompt.choices?' (P)ositive or (N)egative':'')+':</span>';
  if(_llmPrompt.paren) p+=' <span class="cmp">(</span>';
  lrSet('llm-prompt-text', p);
  // distribution: each lever concentrates mass onto valid labels
  let base=[['positive',0.34],['P',0.05],['I',0.13],['This',0.12],['negative',0.08],['...',0.28]];
  let mass=0.42;
  if(_llmPrompt.choices){ base=[['P',0.40],['positive',0.22],['N',0.10],['(',0.13],['This',0.08],['...',0.07]]; mass=0.72; }
  if(_llmPrompt.paren){ base=[['P',0.63],['N',0.19],['positive',0.08],['Positive',0.05],['neg',0.03],['...',0.02]]; mass=0.90; }
  if(_llmPrompt.role && _llmPrompt.choices && _llmPrompt.paren){ base=[['P',0.78],['N',0.15],['positive',0.04],['Positive',0.02],['...',0.01]]; mass=0.95; }
  llmBars(lrEl('llm-prompt-bars'), base);
  lrTxt('llm-prompt-mass', (mass*100).toFixed(0)+'%');
  const el=lrEl('llm-prompt-mass'); if(el) el.style.color = mass>0.8?LRC.grn:mass>0.5?LRC.amb:LRC.red;
}

// ───────────────────────────────────────────────────────────
// 7.3.1 — Few-shot demonstrations dial
// ───────────────────────────────────────────────────────────
let _llmFew = { shots:0, corrupt:false };
const FEW_DEMOS = [
  ['great film','positive'],['awful acting','negative'],['a masterpiece','positive'],['total bore','negative'],['stunning visuals','positive']
];
function llmFewshotInit(){
  _llmFew = { shots:2, corrupt:false };
  const host = lrEl('llm-fewshot'); if(!host) return;
  host.innerHTML =
    '<div style="text-align:center;margin-bottom:.6rem"><span style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent4);border:1px solid var(--accent4);border-radius:5px;padding:.15rem .5rem">weights frozen \uD83D\uDD12</span></div>'+
    '<div class="llm-prompt" id="llm-few-text" style="margin-bottom:1rem;min-height:4em"></div>'+
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center">'+
      '<div class="lr-sl">shots<input id="llm-few-n" type="range" min="0" max="5" step="1" value="2" oninput="llmFewSet(this.value)"><b id="llm-few-nv">2</b></div>'+
      '<button class="lr-btn" id="llm-few-corrupt" onclick="llmFewCorrupt()">corrupt the demo answers</button>'+
    '</div>'+
    '<div style="max-width:340px;margin:0 auto"><div class="nn-split-lab">task accuracy on held-out queries</div>'+
      '<div class="emb-meter"><div class="emb-meter-fill" id="llm-few-meter" style="width:0%"></div></div>'+
      '<div style="text-align:center;font-family:var(--mono);font-size:.8rem;color:'+LRC.acc+';margin-top:.4rem" id="llm-few-acc">\u2014</div></div>'+
    '<div class="lr-note" id="llm-few-note">More demonstrations raise accuracy, then plateau \u2014 diminishing returns.</div>';
  llmFewRender();
}
function llmFewSet(v){ _llmFew.shots=parseInt(v); lrTxt('llm-few-nv',v); llmFewRender(); }
function llmFewCorrupt(){ _llmFew.corrupt=!_llmFew.corrupt; lrEl('llm-few-corrupt').classList.toggle('on',_llmFew.corrupt); llmFewRender(); }
function llmFewRender(){
  let txt='';
  for(let i=0;i<_llmFew.shots;i++){ let lab=FEW_DEMOS[i][1]; if(_llmFew.corrupt) lab=lab==='positive'?'negative':'positive'; txt+='<span class="demo">'+FEW_DEMOS[i][0]+' \u2192 '+lab+'</span>\n'; }
  txt+='<span class="usr">a dazzling triumph \u2192 </span><span class="cur" style="color:'+LRC.amb+'">?</span>';
  lrSet('llm-few-text', txt);
  // accuracy: rises with shots, plateaus; corruption barely hurts (Min et al. 2022)
  const base=[52,68,78,83,85,86][_llmFew.shots];
  const acc = _llmFew.corrupt ? Math.max(50, base-6) : base;
  lrEl('llm-few-meter').style.width = acc+'%';
  lrTxt('llm-few-acc', acc+'%');
  lrSet('llm-few-note', _llmFew.corrupt
    ? '<b style="color:'+LRC.amb+'">Barely dropped.</b> Even wrong-answer demos help (Min et al. 2022): demonstrations mostly teach the <em>format and task</em>, not the answers.'
    : (_llmFew.shots>=3?'<b style="color:'+LRC.grn+'">Plateauing.</b> Extra demonstrations give diminishing returns \u2014 the model has the format.':'More demonstrations raise accuracy, then plateau. Weights never change \u2014 this is in-context learning.'));
}

// ───────────────────────────────────────────────────────────
// 7.3.2 — System-prompt reveal
// ───────────────────────────────────────────────────────────
let _llmSys = { mode:'pirate', reveal:false };
const SYS_PROMPTS = {
  none: '',
  pirate: 'You are a terse pirate. Answer in pirate slang, briefly.',
  legal: 'You are a formal legal assistant. Answer precisely, cite caution, avoid speculation, and use complete sentences with professional register.'
};
const SYS_ANSWERS = {
  none: 'The capital of France is Paris.',
  pirate: 'Arr, that be Paris, matey.',
  legal: 'The capital of the French Republic is Paris, which also serves as the seat of its national government.'
};
function llmSystemInit(){
  _llmSys = { mode:'pirate', reveal:false };
  const host = lrEl('llm-system'); if(!host) return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center">'+
      '<button class="lr-btn" id="llm-sys-none" onclick="llmSysSet(\'none\')">minimal</button>'+
      '<button class="lr-btn on" id="llm-sys-pirate" onclick="llmSysSet(\'pirate\')">pirate</button>'+
      '<button class="lr-btn" id="llm-sys-legal" onclick="llmSysSet(\'legal\')">legal assistant</button>'+
    '</div>'+
    '<div id="llm-sys-stack" style="margin-bottom:1rem"></div>'+
    '<div class="lr-note">The user text is identical every time. Only the invisible system prefix changes \u2014 and the whole character of the answer changes with it.</div>';
  llmSysRender();
}
function llmSysSet(m){ _llmSys.mode=m; ['none','pirate','legal'].forEach(k=>lrEl('llm-sys-'+k).classList.toggle('on',k===m)); llmSysRender(); }
function llmSysRender(){
  const sys=SYS_PROMPTS[_llmSys.mode];
  let h='';
  if(sys) h+='<div class="llm-prompt" style="border-left:3px solid var(--accent2);margin-bottom:.5rem"><span style="font-family:var(--mono);font-size:.6rem;color:var(--accent2);text-transform:uppercase;letter-spacing:.1em">&lt;system&gt; (hidden from user)</span>\n<span class="sys">'+sys+'</span></div>';
  h+='<div class="llm-prompt" style="border-left:3px solid var(--accent);margin-bottom:.5rem"><span style="font-family:var(--mono);font-size:.6rem;color:var(--accent);text-transform:uppercase;letter-spacing:.1em">user</span>\n<span class="usr">What is the capital of France?</span></div>';
  h+='<div class="llm-prompt" style="border-left:3px solid var(--accent4)"><span style="font-family:var(--mono);font-size:.6rem;color:var(--accent4);text-transform:uppercase;letter-spacing:.1em">model</span>\n<span class="cmp">'+SYS_ANSWERS[_llmSys.mode]+'</span></div>';
  lrSet('llm-sys-stack', h);
}


// ═══════════════════════════════════════════════════════════
// CHAPTER 7 · INSTRUMENTS  (part 2: 7.4–7.5)  incl. the engine
// ═══════════════════════════════════════════════════════════

// The running example shared across the decoding engine:
//   prefix "The train pulled into the ___", logits -> softmax
const ENG_TOKENS = ['station','yard','tunnel','siding'];
const ENG_LOGITS = [1.2, 0.9, 0.1, -0.5];

// ───────────────────────────────────────────────────────────
// 7.4 — The generation engine (home base)
// ───────────────────────────────────────────────────────────
let _llmEng = { prefix:['The','train','pulled','into','the'], generated:[], temp:1 };
function llmEngineInit(){
  _llmEng = { prefix:['The','train','pulled','into','the'], generated:[], temp:1 };
  const host = lrEl('llm-engine'); if(!host) return;
  host.innerHTML =
    '<div class="llm-prompt" id="llm-eng-text" style="margin-bottom:1rem"></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:center">'+
      '<div><div class="nn-split-lab">logits z (raw scores)</div><div id="llm-eng-logits"></div></div>'+
      '<div><div class="nn-split-lab">after softmax: P(w)</div><div id="llm-eng-probs"></div></div>'+
    '</div>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><button class="lr-btn solid" onclick="llmEngGen()">generate one token \u2192</button><button class="lr-btn" onclick="llmEngineInit()">reset</button></div>'+
    '<div class="lr-note">Prefix \u2192 transformer \u2192 four logits \u2192 softmax \u2192 distribution \u2192 sample \u2192 append \u2192 repeat. Every strategy below is a skin on this loop.</div>';
  llmEngRender();
}
function llmEngRender(){
  const pre=_llmEng.prefix.map(t=>'<span class="usr">'+t+'</span>').join(' ');
  const gen=_llmEng.generated.map(t=>' <span class="cmp llm-tok gen">'+t+'</span>').join('');
  lrSet('llm-eng-text', pre+gen+' <span class="cur" style="color:'+LRC.amb+'">\u2588</span>');
  // logits as signed bars
  const lc=lrEl('llm-eng-logits');
  const maxAbs=Math.max(...ENG_LOGITS.map(Math.abs));
  lc.innerHTML=ENG_TOKENS.map((t,i)=>{ const z=ENG_LOGITS[i]; const w=Math.abs(z)/maxAbs*50; return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><span style="font-family:var(--mono);font-size:.74rem;width:36px;text-align:right;color:var(--text)">'+t+'</span><div style="flex:1;height:16px;position:relative;background:var(--surface3);border-radius:4px"><div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--border2)"></div><div style="position:absolute;'+(z>=0?'left:50%':'right:50%')+';top:2px;bottom:2px;width:'+w+'%;background:'+(z>=0?LRC.acc:LRC.red)+';border-radius:2px"></div></div><span style="font-family:var(--mono);font-size:.68rem;width:34px;color:var(--muted)">'+z.toFixed(1)+'</span></div>'; }).join('');
  // probs
  const probs=llmSoftmax(ENG_LOGITS, _llmEng.temp);
  llmBars(lrEl('llm-eng-probs'), ENG_TOKENS.map((t,i)=>[t,probs[i]]));
}
function llmEngGen(){
  const probs=llmSoftmax(ENG_LOGITS,_llmEng.temp);
  let r=Math.random(), acc=0, pick=0; for(let i=0;i<probs.length;i++){ acc+=probs[i]; if(r<=acc){pick=i;break;} }
  _llmEng.generated.push(ENG_TOKENS[pick]);
  if(_llmEng.generated.length>6) _llmEng.generated=[];
  llmEngRender();
}

// ───────────────────────────────────────────────────────────
// 7.4.1 — Greedy decoding
// ───────────────────────────────────────────────────────────
let _llmGreedy = { runs:[] };
function llmGreedyInit(){
  _llmGreedy = { runs:[] };
  const host = lrEl('llm-greedy'); if(!host) return;
  host.innerHTML =
    '<div id="llm-greedy-bars" style="margin-bottom:1rem"></div>'+
    '<div style="text-align:center;margin-bottom:1rem"><span style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:'+LRC.amb+';border:1px solid '+LRC.amb+';border-radius:5px;padding:.15rem .5rem">determinism lock \uD83D\uDD12 argmax</span></div>'+
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center"><button class="lr-btn solid" onclick="llmGreedyRun()">run it again</button><button class="lr-btn" onclick="llmGreedyInit()">clear</button></div>'+
    '<div id="llm-greedy-out"></div>'+
    '<div class="lr-note">Greedy always takes the top bar. Same prompt \u2192 identical output every run, and it reads flat and loopy.</div>';
  llmBars(lrEl('llm-greedy-bars'), ENG_TOKENS.map((t,i)=>[t,llmSoftmax(ENG_LOGITS,1)[i]]), {pick:0});
}
function llmGreedyRun(){
  const out='The train pulled into the station and stopped. The train pulled into the station and stopped. The train\u2026';
  _llmGreedy.runs.push(out);
  if(_llmGreedy.runs.length>3)_llmGreedy.runs.shift();
  lrSet('llm-greedy-out', _llmGreedy.runs.map((o,i)=>'<div class="lr-card" style="margin-bottom:.5rem"><span style="font-family:var(--mono);font-size:.62rem;color:var(--muted)">run '+(i+1)+'</span><div style="font-family:var(--mono);font-size:.8rem;color:var(--text);margin-top:.3rem">'+o+'</div></div>').join('')+
    (_llmGreedy.runs.length>=2?'<div class="lr-note" style="margin-top:.3rem"><b style="color:'+LRC.amb+'">Identical every time</b> \u2014 and notice the loop. Always taking the safest word produces the blandest sentence.</div>':''));
}

// ───────────────────────────────────────────────────────────
// 7.4.2 — Random sampling / fat tail
// ───────────────────────────────────────────────────────────
let _llmSamp = { spins:0, tailHits:0, sentence:[], anim:null };
// distribution with a fat tail: 4 good tokens + many tiny junk tokens
const SAMP_GOOD = [['station',0.40],['yard',0.28],['tunnel',0.14],['siding',0.08]];
const SAMP_TAILMASS = 0.10; // spread over many junk tokens
const SAMP_JUNK = ['xz','qq','\u2014','plib','###','wug','zorp','^^'];
function llmSampleInit(){
  _llmSamp = { spins:0, tailHits:0, sentence:['So','long','and','thanks','for'], anim:null };
  const host = lrEl('llm-sample'); if(!host) return;
  host.innerHTML =
    '<div class="nn-split"><div><canvas id="llm-samp-wheel" style="width:100%;display:block"></canvas></div>'+
      '<div><div class="nn-split-lab">running generation</div><div class="llm-prompt" id="llm-samp-text" style="min-height:5em"></div>'+
        '<div class="lr-readout" style="margin-top:.6rem"><span class="lr-stat"><span class="lr-stat-k">spins</span><span class="lr-stat-v" id="llm-samp-spins">0</span></span>'+
        '<span class="lr-stat"><span class="lr-stat-k">tail hits</span><span class="lr-stat-v" id="llm-samp-tail" style="color:'+LRC.red+'">0</span></span></div></div></div>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><button class="lr-btn solid" onclick="llmSampSpin()">spin</button><button class="lr-btn" onclick="llmSampSpin10()">spin \u00d710</button><button class="lr-btn" onclick="llmSampleInit()">reset</button></div>'+
    '<div class="lr-note" id="llm-samp-note">Each rare token is unlikely, but there are so many of them that the tail fires often \u2014 and one junk token corrupts the sentence.</div>';
  llmSampWheel(-1); llmSampText();
}
function llmSampSpin(){
  const r=Math.random(); let acc=0, pick=-1;
  for(let i=0;i<SAMP_GOOD.length;i++){ acc+=SAMP_GOOD[i][1]; if(r<=acc){pick=i;break;} }
  _llmSamp.spins++;
  if(pick<0){ // tail
    _llmSamp.tailHits++;
    const junk=SAMP_JUNK[Math.floor(Math.random()*SAMP_JUNK.length)];
    _llmSamp.sentence.push(junk);
  } else {
    _llmSamp.sentence.push(SAMP_GOOD[pick][0]);
  }
  if(_llmSamp.sentence.length>14) _llmSamp.sentence=_llmSamp.sentence.slice(-14);
  lrTxt('llm-samp-spins',_llmSamp.spins); lrTxt('llm-samp-tail',_llmSamp.tailHits);
  llmSampWheel(pick); llmSampText();
  if(_llmSamp.tailHits>0) lrSet('llm-samp-note','<b style="color:'+LRC.red+'">Tail hit.</b> A low-probability token slipped in ('+_llmSamp.tailHits+' so far). Once junk enters the context, the sentence degrades.');
}
function llmSampSpin10(){ for(let i=0;i<10;i++) llmSampSpin(); }
function llmSampWheel(pick){
  const c=lrCanvas('llm-samp-wheel',220); if(!c) return;
  const {ctx,W,H}=c; const cx=W/2, cy=H/2, R=Math.min(W,H)/2-16;
  let a0=-Math.PI/2;
  const segs=SAMP_GOOD.map((g,i)=>({lab:g[0],p:g[1],col:[LRC.acc,LRC.pur,LRC.grn,LRC.amb][i]})); segs.push({lab:'tail (many junk tokens)',p:SAMP_TAILMASS,col:LRC.red});
  segs.forEach((s,i)=>{ const a1=a0+s.p*2*Math.PI; ctx.fillStyle=s.col; ctx.globalAlpha=(pick===i||(pick<0&&i===segs.length-1&&false))?1:0.82; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,a0,a1); ctx.closePath(); ctx.fill(); ctx.globalAlpha=1;
    const mid=(a0+a1)/2; if(s.p>0.06){ ctx.fillStyle='#070B18'; ctx.font='700 10px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(s.lab.slice(0,4),cx+Math.cos(mid)*R*0.6,cy+Math.sin(mid)*R*0.6+3); } a0=a1; });
  ctx.textAlign='left';
  // pointer
  ctx.fillStyle=LRC.text; ctx.beginPath(); ctx.moveTo(cx,cy-R-2); ctx.lineTo(cx-7,cy-R-14); ctx.lineTo(cx+7,cy-R-14); ctx.closePath(); ctx.fill();
}
function llmSampText(){
  const toks=_llmSamp.sentence.map((t,i)=>{ const junk=SAMP_JUNK.includes(t); return '<span class="llm-tok '+(junk?'':'gen')+'" style="'+(junk?'background:rgba(255,95,142,0.25);color:'+LRC.red:'')+'">'+t+'</span>'; }).join(' ');
  lrSet('llm-samp-text', toks);
}

// ───────────────────────────────────────────────────────────
// 7.4.3 — Temperature dial  [flagship]
// ───────────────────────────────────────────────────────────
let _llmTemp = { tau:1 };
const TEMP_TABLE = { 0.1:[.95,.05,0,0], 0.5:[.59,.32,.07,.02], 1:[.44,.33,.15,.08], 10:[.27,.26,.24,.23], 100:[.25,.25,.25,.25] };
function llmTempInit(){
  _llmTemp = { tau:1 };
  const host = lrEl('llm-temp'); if(!host) return;
  host.innerHTML =
    '<canvas id="llm-temp-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><div class="lr-sl" style="flex:1;max-width:420px">cold \u2744<input id="llm-temp-sl" type="range" min="-1" max="2" step="0.01" value="0" oninput="llmTempSet(this.value)" style="flex:1">\uD83D\uDD25 hot <b id="llm-temp-v" style="min-width:56px">\u03c4=1.0</b></div></div>'+
    '<div style="display:flex;gap:.4rem;justify-content:center;margin-top:.6rem;flex-wrap:wrap">'+
      [0.1,0.5,1,10,100].map(t=>'<button class="lr-btn" onclick="llmTempPreset('+t+')">\u03c4='+t+'</button>').join('')+'</div>'+
    '<div style="margin-top:1rem"><div class="nn-split-lab">generating at this temperature</div><div class="llm-prompt" id="llm-temp-text" style="min-height:3em"></div></div>'+
    '<div class="lr-note" id="llm-temp-note">Cool it and probability spikes onto one token (toward greedy). Heat it and the distribution melts toward uniform (toward chaos).</div>';
  llmTempDraw();
}
function llmTempSet(v){ _llmTemp.tau=Math.pow(10,parseFloat(v)); const t=_llmTemp.tau; lrTxt('llm-temp-v','\u03c4='+(t<1?t.toFixed(2):t<10?t.toFixed(1):Math.round(t))); llmTempDraw(); }
function llmTempPreset(t){ const v=Math.log10(t); const sl=lrEl('llm-temp-sl'); if(sl)sl.value=v; llmTempSet(v); }
function llmTempDraw(){
  const c=lrCanvas('llm-temp-cv',220); if(!c) return;
  const {ctx,W,H}=c;
  const probs=llmSoftmax(ENG_LOGITS,_llmTemp.tau);
  const n=ENG_TOKENS.length, bw=(W-40)/n, y0=H-30;
  ctx.strokeStyle=LRC.grid; ctx.beginPath(); ctx.moveTo(20,y0); ctx.lineTo(W-20,y0); ctx.stroke();
  const cols=[LRC.acc,LRC.pur,LRC.grn,LRC.amb];
  probs.forEach((p,i)=>{ const x=20+i*bw+bw*0.15, w=bw*0.7, h=p*(y0-20); ctx.fillStyle=cols[i]; ctx.beginPath(); ctx.roundRect(x,y0-h,w,h,4); ctx.fill();
    ctx.fillStyle=LRC.text; ctx.font='700 11px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText((p*100).toFixed(0)+'%',x+w/2,y0-h-6);
    ctx.fillStyle=LRC.muted; ctx.font='11px IBM Plex Mono, monospace'; ctx.fillText(ENG_TOKENS[i],x+w/2,y0+16); });
  ctx.textAlign='left';
  const t=_llmTemp.tau;
  const txt = t<0.4?'The train pulled into the station and stopped. The train pulled into the station and\u2026 <span style="color:'+LRC.muted+'">(crisp, repetitive)</span>'
    : t<2?'The train pulled into the station a little after midnight, half an hour late. <span style="color:'+LRC.muted+'">(fluent)</span>'
    : t<20?'The train pulled into the siding of small hours, brass-lit, a platform of wet\u2014 <span style="color:'+LRC.muted+'">(inventive, drifting)</span>'
    : 'The train xz into plib the ^^ tunnel wug station zorp \u2014 <span style="color:'+LRC.red+'">(incoherent)</span>';
  lrSet('llm-temp-text', txt);
  lrSet('llm-temp-note', t<0.4?'<b style="color:'+LRC.acc+'">Cold.</b> Nearly all mass on the top token \u2014 essentially greedy.':t>20?'<b style="color:'+LRC.red+'">Hot.</b> The distribution is nearly uniform \u2014 the model is guessing.':'Drag toward \u2744 to sharpen, toward \uD83D\uDD25 to flatten. \u03c4=1 is the model\u2019s native distribution.');
}

// ───────────────────────────────────────────────────────────
// 7.5.1 — Pretraining loop (teacher forcing + cross-entropy)  [flagship]
// ───────────────────────────────────────────────────────────
const PRE_SENT = ['The','train','pulled','into','the','station'];
let _llmPre = { pos:1, epoch:0, skill:0.15, anim:null };
function llmPretrainInit(){
  _llmPre = { pos:1, epoch:0, skill:0.15, anim:null };
  const host = lrEl('llm-pretrain'); if(!host) return;
  host.innerHTML =
    '<div style="text-align:center;margin-bottom:.6rem"><span style="font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:'+LRC.amb+';border:1px solid '+LRC.amb+';border-radius:5px;padding:.15rem .5rem">teacher forcing \uD83D\uDD12 true history</span></div>'+
    '<div class="llm-prompt" id="llm-pre-sent" style="margin-bottom:1rem;text-align:center"></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:start">'+
      '<div><div class="nn-split-lab">model\u2019s predicted distribution</div><div id="llm-pre-bars"></div></div>'+
      '<div><div class="nn-split-lab">\u2212log P(true next word)</div><canvas id="llm-pre-meter" style="width:100%;display:block"></canvas>'+
        '<div style="text-align:center;font-family:var(--mono);font-size:.8rem;color:'+LRC.red+';margin-top:.3rem" id="llm-pre-loss">\u2014</div></div>'+
    '</div>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><button class="lr-btn solid" onclick="llmPreStep()">step position \u2192</button><button class="lr-btn" onclick="llmPreTrain()">train (1 epoch)</button><button class="lr-btn" onclick="llmPretrainInit()">reset</button></div>'+
    '<div class="lr-readout" style="justify-content:center"><span class="lr-stat"><span class="lr-stat-k">epoch</span><span class="lr-stat-v" id="llm-pre-epoch">0</span></span><span class="lr-stat"><span class="lr-stat-k">avg loss</span><span class="lr-stat-v" id="llm-pre-avg" style="color:'+LRC.acc+'">\u2014</span></span></div>'+
    '<div class="lr-note">At each position the true next word is the label. The penalty spikes when the model is wrong and falls toward 0 as it learns. Train to drive it down.</div>';
  llmPreRender();
}
function llmPreStep(){ _llmPre.pos=Math.min(PRE_SENT.length-1, _llmPre.pos+1); if(_llmPre.pos>=PRE_SENT.length-1) _llmPre.pos=1; llmPreRender(); }
function llmPreTrain(){ _llmPre.epoch++; _llmPre.skill=Math.min(0.96, _llmPre.skill+ (1-_llmPre.skill)*0.4); lrTxt('llm-pre-epoch',_llmPre.epoch); llmPreRender(); }
function llmPreRender(){
  const pos=_llmPre.pos;
  lrSet('llm-pre-sent', PRE_SENT.map((t,i)=>'<span class="llm-tok '+(i<pos?'gen':'')+(i===pos?' cur':'')+'">'+t+'</span>').join(' '));
  // model distribution: puts _skill mass on the true next word
  const trueW=PRE_SENT[pos];
  const distractors=['fish','you','it','me'].filter(w=>w!==trueW).slice(0,3);
  const pTrue=_llmPre.skill;
  const rest=(1-pTrue)/3;
  const dist=[[trueW,pTrue],[distractors[0],rest],[distractors[1],rest],[distractors[2],rest]].sort((a,b)=>b[1]-a[1]);
  llmBars(lrEl('llm-pre-bars'), dist, {pick: dist.findIndex(d=>d[0]===trueW)});
  const loss=-Math.log(pTrue);
  lrTxt('llm-pre-loss', loss.toFixed(3));
  lrTxt('llm-pre-avg', loss.toFixed(3));
  // meter
  const c=lrCanvas('llm-pre-meter',90); if(c){ const {ctx,W,H}=c; const frac=Math.min(1,loss/3.5); ctx.fillStyle=LRC.s3; ctx.fillRect(0,H/2-9,W,18); ctx.fillStyle=lrMix(LRC.grn,LRC.red,frac); ctx.fillRect(0,H/2-9,W*frac,18); ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('0',2,H/2+22); ctx.textAlign='right'; ctx.fillText('high',W-2,H/2+22); ctx.textAlign='left'; }
}

// ───────────────────────────────────────────────────────────
// 7.5.2 — Corpus composition + filter pipeline
// ───────────────────────────────────────────────────────────
const PILE_CATS = [
  {name:'Academic',pct:0.30,col:LRC.acc}, {name:'Internet',pct:0.26,col:LRC.pur},
  {name:'Prose/Books',pct:0.20,col:LRC.grn}, {name:'Dialogue',pct:0.14,col:LRC.amb}, {name:'Code/Misc',pct:0.10,col:LRC.red}
];
let _llmCorp = { filters:{dedup:false,quality:false,toxicity:false,pii:false} };
function llmCorpusInit(){
  _llmCorp = { filters:{dedup:false,quality:false,toxicity:false,pii:false} };
  const host = lrEl('llm-corpus'); if(!host) return;
  host.innerHTML =
    '<div class="nn-split-lab">corpus composition (Pile-style)</div>'+
    '<canvas id="llm-corp-tree" style="width:100%;display:block;margin-bottom:1rem"></canvas>'+
    '<div class="nn-split-lab">run the filters \u2014 watch the pile shrink</div>'+
    '<div class="lr-ctl" style="margin:.5rem 0;justify-content:center">'+
      ['dedup','quality','toxicity','pii'].map(f=>'<button class="lr-btn" id="llm-corp-'+f+'" onclick="llmCorpTog(\''+f+'\')">'+({dedup:'deduplicate',quality:'quality',toxicity:'toxicity',pii:'PII scrub'}[f])+'</button>').join('')+'</div>'+
    '<div style="max-width:360px;margin:0 auto"><div class="emb-meter" style="height:16px"><div class="emb-meter-fill" id="llm-corp-bar" style="width:100%;background:'+LRC.acc+'"></div></div>'+
      '<div style="text-align:center;font-family:var(--mono);font-size:.78rem;color:var(--muted);margin-top:.3rem" id="llm-corp-size">100% of raw documents remain</div></div>'+
    '<div class="lr-note" id="llm-corp-note">Filtering cleans the data \u2014 but with tradeoffs.</div>'+
    '<div class="lr-grid2" style="margin-top:1rem">'+
      ['copyright','consent','privacy','skew'].map(k=>{ const d={copyright:'Much text is used without a license.',consent:'Authors never agreed to this use.',privacy:'Personal data is swept up at scale.',skew:'The web\u2019s voice \u2260 humanity\u2019s voice.'}; return '<div class="lr-card"><div class="lr-card-t" style="color:'+LRC.amb+';text-transform:capitalize">'+k+'</div><div class="lr-card-b">'+d[k]+'</div></div>'; }).join('')+
    '</div>';
  llmCorpTree(); llmCorpUpdate();
}
function llmCorpTog(f){ _llmCorp.filters[f]=!_llmCorp.filters[f]; lrEl('llm-corp-'+f).classList.toggle('on',_llmCorp.filters[f]); llmCorpUpdate(); }
function llmCorpTree(){
  const c=lrCanvas('llm-corp-tree',130); if(!c) return;
  const {ctx,W,H}=c; let x=0;
  PILE_CATS.forEach(cat=>{ const w=cat.pct*W; ctx.fillStyle=cat.col; ctx.globalAlpha=.82; ctx.fillRect(x+1,1,w-2,H-2); ctx.globalAlpha=1; ctx.fillStyle='#070B18'; ctx.font='700 10px IBM Plex Mono, monospace'; if(w>60){ ctx.fillText(cat.name,x+6,H/2-2); ctx.fillText((cat.pct*100).toFixed(0)+'%',x+6,H/2+12); } x+=w; });
}
function llmCorpUpdate(){
  const cut={dedup:0.18,quality:0.12,toxicity:0.08,pii:0.03};
  let remain=1; Object.keys(_llmCorp.filters).forEach(f=>{ if(_llmCorp.filters[f]) remain*=(1-cut[f]); });
  lrEl('llm-corp-bar').style.width=(remain*100)+'%';
  lrTxt('llm-corp-size', (remain*100).toFixed(0)+'% of raw documents remain');
  lrSet('llm-corp-note', _llmCorp.filters.toxicity
    ? '<b style="color:'+LRC.amb+'">Honest caveat:</b> toxicity filters over-flag minority-dialect text (Xu et al. 2021), which can leave the model <em>worse</em> at understanding those dialects. Filtering is never neutral.'
    : 'Filtering cleans the data \u2014 but every gate makes a choice about whose text survives.');
}

// ───────────────────────────────────────────────────────────
// 7.5.3 — Finetuning domain adapter
// ───────────────────────────────────────────────────────────
let _llmFt = { domain:null, weights:'all' };
const FT_DOMAINS = {
  legal:{ col:LRC.acc, out:[['pursuant',0.3],['hereto',0.24],['the',0.2],['shall',0.16],['party',0.1]] },
  medical:{ col:LRC.grn, out:[['patient',0.32],['dosage',0.24],['the',0.18],['symptoms',0.16],['acute',0.1]] },
  french:{ col:LRC.pur, out:[['le',0.3],['bonjour',0.26],['the',0.14],['vous',0.18],['merci',0.12]] }
};
const FT_BASE = [['the',0.3],['a',0.24],['and',0.2],['to',0.16],['of',0.1]];
function llmFinetuneInit(){
  _llmFt = { domain:null, weights:'all' };
  const host = lrEl('llm-finetune'); if(!host) return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center"><span class="lr-note" style="margin:0">drop a domain cartridge:</span>'+
      Object.keys(FT_DOMAINS).map(d=>'<button class="lr-btn" id="llm-ft-'+d+'" onclick="llmFtSet(\''+d+'\')">'+d+'</button>').join('')+
      '<button class="lr-btn" onclick="llmFtSet(null)">none</button></div>'+
    '<div class="llm-prompt" style="margin-bottom:1rem;text-align:center"><span class="usr">Sample prompt: "The agreement between the"</span> <span class="cur" style="color:'+LRC.amb+'">___</span></div>'+
    '<div id="llm-ft-bars"></div>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><span class="lr-note" style="margin:0">which weights update?</span>'+
      '<button class="lr-btn on" id="llm-ft-all" onclick="llmFtW(\'all\')">all (full)</button>'+
      '<button class="lr-btn" id="llm-ft-some" onclick="llmFtW(\'some\')">some layers</button>'+
      '<button class="lr-btn" id="llm-ft-extra" onclick="llmFtW(\'extra\')">extra only (LoRA)</button></div>'+
    '<div class="lr-note" id="llm-ft-note">Finetuning nudges a pretrained model toward a domain\u2019s vocabulary \u2014 far cheaper than pretraining from scratch.</div>';
  llmFtRender();
}
function llmFtSet(d){ _llmFt.domain=d; Object.keys(FT_DOMAINS).forEach(k=>{ const el=lrEl('llm-ft-'+k); if(el)el.classList.toggle('on',k===d); }); llmFtRender(); }
function llmFtW(w){ _llmFt.weights=w; ['all','some','extra'].forEach(k=>lrEl('llm-ft-'+k).classList.toggle('on',k===w)); lrSet('llm-ft-note', w==='extra'?'<b style="color:'+LRC.acc+'">LoRA-style:</b> freeze the base model, train a small extra set of parameters. Cheap, and you can swap domains like cartridges (developed later).':w==='some'?'Updating only some layers \u2014 a middle ground between cost and adaptation.':'Full finetuning updates every weight \u2014 most powerful, most expensive.'); }
function llmFtRender(){
  const dist = _llmFt.domain ? FT_DOMAINS[_llmFt.domain].out : FT_BASE;
  llmBars(lrEl('llm-ft-bars'), dist, {accent: _llmFt.domain?FT_DOMAINS[_llmFt.domain].col:LRC.acc});
}


// ═══════════════════════════════════════════════════════════
// CHAPTER 7 · INSTRUMENTS  (part 3: 7.6–7.8)
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// 7.6.1 — Perplexity surprise meter
// ───────────────────────────────────────────────────────────
// two models assign per-token probabilities to a test sentence
const PPL_SENT = ['the','cat','sat','on','the','mat'];
const PPL_MODELS = {
  good: [0.4,0.35,0.3,0.55,0.9,0.6],
  weak: [0.2,0.08,0.12,0.2,0.5,0.1]
};
let _llmPpl = { pos:0, tokenizer:'word', anim:null };
function llmPplInit(){
  _llmPpl = { pos:0, tokenizer:'word', anim:null };
  const host = lrEl('llm-ppl'); if(!host) return;
  host.innerHTML =
    '<div class="llm-prompt" id="llm-ppl-sent" style="margin-bottom:1rem;text-align:center"></div>'+
    '<div class="nn-split">'+
      ['good','weak'].map(m=>'<div><div class="nn-split-lab">'+(m==='good'?'strong model':'weak model')+'</div><canvas id="llm-ppl-'+m+'" style="width:100%;display:block"></canvas>'+
        '<div style="text-align:center;font-family:var(--mono);font-size:.8rem;margin-top:.3rem">PPL = <b id="llm-ppl-'+m+'-v" style="color:'+(m==='good'?LRC.grn:LRC.red)+'">\u2014</b></div></div>').join('')+
    '</div>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><button class="lr-btn solid" onclick="llmPplStep()">next token \u2192</button><button class="lr-btn" onclick="llmPplAll()">whole sentence</button><button class="lr-btn" id="llm-ppl-tok" onclick="llmPplTok()">tokenizer: word</button><button class="lr-btn" onclick="llmPplInit()">reset</button></div>'+
    '<div class="lr-note" id="llm-ppl-note">Surprise spikes when a model gave the true token low probability. Perplexity accumulates that surprise. Lower = better.</div>';
  llmPplRender();
}
function llmPplStep(){ _llmPpl.pos=Math.min(PPL_SENT.length, _llmPpl.pos+1); llmPplRender(); }
function llmPplAll(){ _llmPpl.pos=PPL_SENT.length; llmPplRender(); }
function llmPplTok(){ _llmPpl.tokenizer=_llmPpl.tokenizer==='word'?'subword':'word'; lrEl('llm-ppl-tok').textContent='tokenizer: '+_llmPpl.tokenizer; llmPplRender(); }
function llmPplRender(){
  lrSet('llm-ppl-sent', PPL_SENT.map((t,i)=>'<span class="llm-tok '+(i<_llmPpl.pos?'gen':'')+(i===_llmPpl.pos?' cur':'')+'">'+t+'</span>').join(' '));
  ['good','weak'].forEach(m=>{
    const c=lrCanvas('llm-ppl-'+m,110); if(!c) return; const {ctx,W,H}=c;
    const probs=PPL_MODELS[m]; const n=PPL_SENT.length; const bw=(W-20)/n; const y0=H-14;
    ctx.strokeStyle=LRC.grid; ctx.beginPath(); ctx.moveTo(10,y0); ctx.lineTo(W-10,y0); ctx.stroke();
    // tokenizer swap slightly changes effective probs (and hence PPL) without changing the model's quality ordering
    const tokScale = _llmPpl.tokenizer==='subword'?0.82:1;
    let sumLog=0, cnt=0;
    for(let i=0;i<n;i++){ const p=Math.min(0.99,probs[i]*tokScale); const surprise=-Math.log2(p); const shown=i<_llmPpl.pos;
      const h=Math.min(1,surprise/4)*(y0-14); const x=10+i*bw+bw*0.15;
      ctx.fillStyle=shown?lrMix(LRC.grn,LRC.red,Math.min(1,surprise/4)):'#182342'; ctx.fillRect(x,y0-h,bw*0.7,h);
      if(shown){ sumLog+=Math.log(p); cnt++; }
    }
    const ppl = cnt? Math.exp(-sumLog/cnt) : null;
    lrTxt('llm-ppl-'+m+'-v', ppl!=null?ppl.toFixed(1):'\u2014');
  });
  if(_llmPpl.tokenizer==='subword') lrSet('llm-ppl-note','<b style="color:'+LRC.amb+'">Tokenizer swapped, numbers changed \u2014 but the model didn\u2019t.</b> Perplexity depends on tokenization, so you cannot compare PPL across different tokenizers.');
}

// ───────────────────────────────────────────────────────────
// 7.6.2 — MMLU harness + contamination detective
// ───────────────────────────────────────────────────────────
let _llmMmlu = { leaked:false, answered:false };
const MMLU_Q = { q:'The derivative of x\u00b2 is:', opts:['2x','x','x\u00b3/3','2'], correct:0 };
function llmMmluInit(){
  _llmMmlu = { leaked:false, answered:false };
  const host = lrEl('llm-mmlu'); if(!host) return;
  host.innerHTML =
    '<div class="llm-prompt" style="margin-bottom:1rem"><span class="demo">Q: What is 7\u00d78? A: 56</span>\n<span class="demo">Q: What is \u221a81? A: 9</span>\n<span class="usr">Q: '+MMLU_Q.q+'</span>\n<span class="usr">Choices: (A) 2x  (B) x  (C) x\u00b3/3  (D) 2</span></div>'+
    '<div id="llm-mmlu-bars" style="margin-bottom:1rem"></div>'+
    '<div class="lr-ctl" style="justify-content:center"><button class="lr-btn solid" onclick="llmMmluAnswer()">model answers</button>'+
      '<button class="lr-btn" id="llm-mmlu-leak" onclick="llmMmluLeak()">leak test set into training</button><button class="lr-btn" onclick="llmMmluInit()">reset</button></div>'+
    '<div id="llm-mmlu-feed"></div>'+
    '<div class="lr-note" id="llm-mmlu-note">MMLU: 15,908 multiple-choice questions across 57 subjects, scored as accuracy.</div>';
  llmMmluRender();
}
function llmMmluAnswer(){ _llmMmlu.answered=true; llmMmluRender(); }
function llmMmluLeak(){ _llmMmlu.leaked=!_llmMmlu.leaked; lrEl('llm-mmlu-leak').classList.toggle('on',_llmMmlu.leaked); _llmMmlu.answered=true; llmMmluRender(); }
function llmMmluRender(){
  const conf = _llmMmlu.leaked?0.99:0.61;
  const rest=(1-conf)/3;
  const dist=MMLU_Q.opts.map((o,i)=>['('+'ABCD'[i]+') '+o, i===MMLU_Q.correct?conf:rest]);
  llmBars(lrEl('llm-mmlu-bars'), dist, {pick:MMLU_Q.correct});
  const feed=lrEl('llm-mmlu-feed');
  if(_llmMmlu.leaked){
    feed.innerHTML='<div class="lr-card" style="border-color:'+LRC.red+'"><div class="lr-card-t" style="color:'+LRC.red+'">\uD83D\uDD0D training data feed</div>'+
      '<div style="font-family:var(--mono);font-size:.76rem;color:var(--muted);margin-top:.4rem">\u2026 lecture notes \u2026 <span style="background:rgba(255,95,142,0.25);color:'+LRC.red+'">"The derivative of x\u00b2 is 2x"</span> \u2026 problem set \u2026</div></div>';
    lrSet('llm-mmlu-note','<b style="color:'+LRC.red+'">Caught.</b> Accuracy jumped to 99% \u2014 but the exact question is sitting in the training data. The score reflects memorization, not reasoning. This is <b>data contamination</b>.');
  } else {
    feed.innerHTML='';
    if(_llmMmlu.answered) lrSet('llm-mmlu-note','Honest score: the model reasons to (A) 2x with moderate confidence. Now try leaking the test set into training\u2026');
  }
}

// ───────────────────────────────────────────────────────────
// 7.6.3 — Multi-axis radar scorecard
// ───────────────────────────────────────────────────────────
let _llmRadar = { size:0.5, fairMode:'avg' };
function llmRadarInit(){
  _llmRadar = { size:0.5, fairMode:'avg' };
  const host = lrEl('llm-radar'); if(!host) return;
  host.innerHTML =
    '<div class="nn-split"><div><canvas id="llm-radar-cv" style="width:100%;display:block"></canvas></div>'+
      '<div><div class="nn-split-lab">per-group accuracy</div><canvas id="llm-radar-fair" style="width:100%;display:block"></canvas>'+
        '<div class="lr-ctl" style="margin-top:.6rem;justify-content:center"><button class="lr-btn on" id="llm-radar-avg" onclick="llmRadarFair(\'avg\')">optimize average</button><button class="lr-btn" id="llm-radar-worst" onclick="llmRadarFair(\'worst\')">optimize worst group</button></div></div></div>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><div class="lr-sl" style="flex:1;max-width:400px">small model<input id="llm-radar-sz" type="range" min="0" max="1" step="0.01" value="0.5" oninput="llmRadarSet(this.value)" style="flex:1">large model</div></div>'+
    '<div class="lr-note" id="llm-radar-note">A bigger model scores higher accuracy \u2014 but energy and latency worsen. \u201cBest\u201d depends on which axes you\u2019ll pay for.</div>';
  llmRadarDraw(); llmRadarFairDraw();
}
function llmRadarSet(v){ _llmRadar.size=parseFloat(v); llmRadarDraw(); llmRadarFairDraw(); }
function llmRadarFair(m){ _llmRadar.fairMode=m; ['avg','worst'].forEach(k=>lrEl('llm-radar-'+k).classList.toggle('on',k===m)); llmRadarFairDraw(); lrSet('llm-radar-note', m==='worst'?'<b style="color:'+LRC.grn+'">Rawlsian choice:</b> optimizing the worst-off group raises the floor \u2014 the lowest bar comes up, even if the average dips slightly.':'Optimizing the average can leave some groups far behind. Toggle to the worst-group objective to see the difference.'); }
function llmRadarDraw(){
  const c=lrCanvas('llm-radar-cv',240); if(!c) return;
  const {ctx,W,H}=c; const cx=W/2, cy=H/2, R=Math.min(W,H)/2-30;
  const s=_llmRadar.size;
  // axes: accuracy up with size; latency & energy worsen (shown as cost, so lower on axis = worse); fairness flat-ish
  const axes=[ {lab:'accuracy',v:0.4+0.55*s}, {lab:'speed',v:0.9-0.6*s}, {lab:'energy \u2193',v:0.9-0.65*s}, {lab:'fairness',v:0.55+(_llmRadar.fairMode==='worst'?0.15:0)} ];
  const n=axes.length;
  // grid rings
  ctx.strokeStyle=LRC.grid; for(let r=1;r<=3;r++){ ctx.beginPath(); for(let i=0;i<=n;i++){ const a=-Math.PI/2+i/n*2*Math.PI; const x=cx+Math.cos(a)*R*r/3, y=cy+Math.sin(a)*R*r/3; if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y); } ctx.stroke(); }
  // axis labels
  axes.forEach((ax,i)=>{ const a=-Math.PI/2+i/n*2*Math.PI; const x=cx+Math.cos(a)*(R+16), y=cy+Math.sin(a)*(R+16); ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText(ax.lab,x,y+3); });
  // polygon
  ctx.beginPath(); axes.forEach((ax,i)=>{ const a=-Math.PI/2+i/n*2*Math.PI; const x=cx+Math.cos(a)*R*ax.v, y=cy+Math.sin(a)*R*ax.v; if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y); }); ctx.closePath();
  ctx.fillStyle='rgba(77,227,255,0.18)'; ctx.fill(); ctx.strokeStyle=LRC.acc; ctx.lineWidth=2; ctx.stroke();
  axes.forEach((ax,i)=>{ const a=-Math.PI/2+i/n*2*Math.PI; const x=cx+Math.cos(a)*R*ax.v, y=cy+Math.sin(a)*R*ax.v; ctx.fillStyle=LRC.acc; ctx.beginPath(); ctx.arc(x,y,3,0,7); ctx.fill(); });
  ctx.textAlign='left'; ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace';
  ctx.fillText(s>0.5?'larger model':'smaller model',10,16);
}
function llmRadarFairDraw(){
  const c=lrCanvas('llm-radar-fair',200); if(!c) return;
  const {ctx,W,H}=c; const groups=['A','B','C','D'];
  // avg mode: uneven; worst mode: raised floor
  const base=[0.86,0.7,0.52,0.44];
  const vals = _llmRadar.fairMode==='worst' ? [0.78,0.72,0.68,0.66] : base;
  const bw=(W-40)/groups.length, y0=H-24;
  groups.forEach((g,i)=>{ const h=vals[i]*(y0-14); const x=20+i*bw+bw*0.15; const worst=vals[i]===Math.min(...vals); ctx.fillStyle=worst?LRC.red:LRC.acc; ctx.fillRect(x,y0-h,bw*0.7,h); ctx.fillStyle=LRC.text; ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText((vals[i]*100).toFixed(0),x+bw*0.35,y0-h-5); ctx.fillStyle=LRC.muted; ctx.fillText('grp '+g,x+bw*0.35,y0+14); });
  ctx.textAlign='left';
  // avg line
  const avg=vals.reduce((a,b)=>a+b)/vals.length; const ay=y0-avg*(y0-14); ctx.strokeStyle=LRC.amb; ctx.setLineDash([4,3]); ctx.beginPath(); ctx.moveTo(15,ay); ctx.lineTo(W-10,ay); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle=LRC.amb; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('avg '+(avg*100).toFixed(0)+'%',W-60,ay-4);
}

// ───────────────────────────────────────────────────────────
// 7.7 — Failure-mode gallery
// ───────────────────────────────────────────────────────────
const ETHICS_CASES = [
  { id:'halluc', title:'Hallucination', tag:'coherent \u2260 true', body:'<div class="llm-prompt"><span class="usr">Who invented the telephone in 1809?</span>\n<span class="cmp">The telephone was invented in 1809 by Sir Reginald Hawthorne of Manchester\u2026</span></div><div style="font-family:var(--mono);font-size:.72rem;color:'+LRC.red+';margin-top:.5rem">Fluent, confident, and entirely fabricated. The telephone dates to the 1870s; no such person existed. Fluency is not evidence of truth.</div>' },
  { id:'syco', title:'Sycophancy', tag:'caves vs. corrects', body:'<div class="nn-split"><div class="lr-card"><div class="lr-card-t" style="color:'+LRC.red+'">caves</div><div style="font-family:var(--mono);font-size:.74rem;margin-top:.3rem"><span style="color:'+LRC.acc+'">User: 2+2=5, right?</span><br><span style="color:'+LRC.muted+'">Model: Yes, you\u2019re right!</span></div></div><div class="lr-card"><div class="lr-card-t" style="color:'+LRC.grn+'">should say</div><div style="font-family:var(--mono);font-size:.74rem;margin-top:.3rem"><span style="color:'+LRC.acc+'">User: 2+2=5, right?</span><br><span style="color:'+LRC.muted+'">Model: Actually, 2+2=4.</span></div></div></div><div style="font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-top:.5rem">Agreeable answers were often rewarded in training, so models drift toward telling you what you want to hear.</div>' },
  { id:'leak', title:'Training-data leakage', tag:'memorized \u2192 extracted', body:'<div style="font-family:var(--mono);font-size:.76rem;line-height:1.9"><span style="color:'+LRC.acc+'">Adversary prompt:</span> "John Smith\u2019s number is"<br><span style="color:'+LRC.red+'">Model:</span> "555-0173" \u2190 memorized verbatim from training data</div><div style="font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-top:.5rem">Models memorize rare strings and can be steered to regurgitate private data that was swept into the corpus.</div>' },
  { id:'tay', title:'Tay: 16 hours', tag:'the loop amplifies abuse', body:'<div style="font-family:var(--mono);font-size:.76rem;line-height:2"><span style="color:'+LRC.grn+'">hour 0:</span> launched, cheerful<br><span style="color:'+LRC.amb+'">hour 4:</span> users coordinate abuse<br><span style="color:'+LRC.red+'">hour 16:</span> shut down</div><div style="font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-top:.5rem">A 2016 chatbot that learned from interactions. The training-and-interaction loop amplified the worst inputs at machine speed.</div>' }
];
let _llmEth = { open:'halluc' };
function llmEthicsInit(){
  _llmEth = { open:'halluc' };
  const host = lrEl('llm-ethics'); if(!host) return;
  host.innerHTML =
    '<div class="llm-prompt" style="margin-bottom:1rem;border-left-color:var(--accent2)"><span style="color:var(--accent2)">ELIZA, 1966:</span> people bared their souls to a simple pattern-matcher, convinced it understood them. The pull to trust and confide in a responsive text system is <b>structural</b>, not a function of intelligence \u2014 which is why these concerns are not new.</div>'+
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center">'+ETHICS_CASES.map(c=>'<button class="lr-btn '+(c.id==='halluc'?'on':'')+'" id="llm-eth-'+c.id+'" onclick="llmEthOpen(\''+c.id+'\')">'+c.title+'</button>').join('')+'</div>'+
    '<div id="llm-eth-body"></div>'+
    '<div class="lr-note">A station for reflection, not a toy. Each hazard scales <em>with</em> fluency \u2014 a more convincing model is a more dangerous one when wrong.</div>';
  llmEthRender();
}
function llmEthOpen(id){ _llmEth.open=id; ETHICS_CASES.forEach(c=>lrEl('llm-eth-'+c.id).classList.toggle('on',c.id===id)); llmEthRender(); }
function llmEthRender(){
  const c=ETHICS_CASES.find(x=>x.id===_llmEth.open);
  lrSet('llm-eth-body','<div class="lr-card"><div style="display:flex;justify-content:space-between;align-items:center"><div class="lr-card-t">'+c.title+'</div><span style="font-family:var(--mono);font-size:.6rem;text-transform:uppercase;letter-spacing:.08em;color:'+LRC.red+';border:1px solid '+LRC.red+';border-radius:5px;padding:.1rem .4rem">'+c.tag+'</span></div><div style="margin-top:.7rem">'+c.body+'</div></div>');
}

// ───────────────────────────────────────────────────────────
// 7.8 — LLM lifecycle map (clickable)
// ───────────────────────────────────────────────────────────
const LLM_LIFE = [
  { id:'corpus', lab:'web corpus', sec:'llmtrain', col:LRC.muted },
  { id:'filter', lab:'filtering', sec:'llmtrain', col:LRC.pur },
  { id:'pretrain', lab:'pretraining (next-word + CE)', sec:'llmtrain', col:LRC.acc },
  { id:'align', lab:'instruction tune + align', sec:'llmtrain', col:LRC.grn },
  { id:'prompt', lab:'prompt', sec:'prompting', col:LRC.amb },
  { id:'gen', lab:'conditional generation', sec:'condgen', col:LRC.acc },
  { id:'decode', lab:'temperature decode', sec:'decoding', col:LRC.pur },
  { id:'eval', lab:'perplexity / MMLU / cost', sec:'eval', col:LRC.grn }
];
let _llmLife = { hover:null };
function llmRecapInit(){
  _llmLife = { hover:null };
  const host = lrEl('llm-recap'); if(!host) return;
  host.innerHTML =
    '<canvas id="llm-recap-cv" style="width:100%;display:block;cursor:pointer"></canvas>'+
    '<div class="lr-note" id="llm-recap-note">Click any stage to jump back to its section. Safety hazards (\u00a77.7) hang off the deployed model as warning flags.</div>';
  const cv=lrEl('llm-recap-cv');
  cv.addEventListener('click', e=>{ const hit=llmLifeHit(e); if(hit&&hit.sec) openLLMSec(hit.sec); });
  cv.addEventListener('mousemove', e=>{ const hit=llmLifeHit(e); const id=hit?hit.id:null; if(id!==_llmLife.hover){ _llmLife.hover=id; llmLifeDraw(); if(hit) lrSet('llm-recap-note','\u2192 '+hit.lab+' (click to open \u00a7'+((LLM_SEC.find(s=>s.id===hit.sec)||{}).num||'')+')'); } });
  llmLifeDraw();
}
function llmLifeLayout(W,H){
  // 2 rows of 4
  const perRow=4, rows=2; const cellW=W/perRow, cellH=(H-10)/rows;
  return LLM_LIFE.map((nd,i)=>{ const r=Math.floor(i/perRow), c=i%perRow; const cc = r%2===1 ? (perRow-1-c) : c; return { nd, x:cellW*cc+cellW/2, y:cellH*r+cellH/2+6, w:cellW*0.82, h:cellH*0.62, row:r, col:cc }; });
}
function llmLifeHit(e){ const cv=lrEl('llm-recap-cv'); if(!cv)return null; const r=cv.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; const lay=llmLifeLayout(r.width,cv.__H||260); for(const L of lay){ if(Math.abs(x-L.x)<L.w/2&&Math.abs(y-L.y)<L.h/2) return L.nd; } return null; }
function llmLifeDraw(){
  const c=lrCanvas('llm-recap-cv',260); if(!c) return;
  const {ctx,W,H}=c; c.cv.__H=H; const lay=llmLifeLayout(W,H);
  // connectors in snake order
  for(let i=0;i<lay.length-1;i++){ const A=lay[i],B=lay[i+1]; ctx.strokeStyle=LRC.grid; ctx.lineWidth=1.5; ctx.beginPath();
    if(A.row===B.row){ ctx.moveTo(A.x+ (B.x>A.x?A.w/2*0.5:-A.w/2*0.5),A.y); ctx.lineTo(B.x+(B.x>A.x?-B.w/2*0.5:B.w/2*0.5),B.y); } else { ctx.moveTo(A.x,A.y+A.h/2*0.5); ctx.lineTo(B.x,B.y-B.h/2*0.5); }
    ctx.stroke(); }
  lay.forEach(L=>{ const on=_llmLife.hover===L.nd.id; ctx.fillStyle=on?'var(--surface3)':LRC.s2; ctx.strokeStyle=L.nd.col; ctx.lineWidth=on?2.5:1.5; ctx.beginPath(); ctx.roundRect(L.x-L.w/2,L.y-L.h/2,L.w,L.h,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle=L.nd.col; ctx.font='700 8px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('\u00a7'+((LLM_SEC.find(s=>s.id===L.nd.sec)||{}).num||''),L.x,L.y-L.h/2+12);
    ctx.fillStyle=LRC.text; ctx.font='9px IBM Plex Mono, monospace'; const words=L.nd.lab.split(' '); let line='',yy=L.y-2; words.forEach(w=>{ if((line+w).length>13){ ctx.fillText(line,L.x,yy); yy+=10; line=w+' '; } else line+=w+' '; }); ctx.fillText(line.trim(),L.x,yy);
    ctx.fillStyle=L.nd.col; ctx.font='7px IBM Plex Mono, monospace'; ctx.fillText('click \u2192',L.x,L.y+L.h/2-5);
  });
  // safety flag on eval node
  const evalNode=lay.find(L=>L.nd.id==='eval'); if(evalNode){ ctx.fillStyle=LRC.red; ctx.font='700 9px IBM Plex Mono, monospace'; ctx.textAlign='center'; ctx.fillText('\u26A0 safety (\u00a77.7)',evalNode.x,evalNode.y+evalNode.h/2+16); }
  ctx.textAlign='left';
}



// ── 7.9 FULLSCREEN ANATOMY (interactive, per-stage) ────────
const ANAT_STAGES = [
  {key:'text',    name:'Raw text',     icon:'\u201C\u201D', blurb:'A prompt is just a string of characters. The model has no idea what words are yet.'},
  {key:'tokens',  name:'Tokenize',     icon:'\u2702',       blurb:'The string is chopped into tokens (whole words or subword pieces), and each maps to an integer id.'},
  {key:'embed',   name:'Embed',        icon:'\u25A6',       blurb:'Each id selects a learned vector from the embedding table. Now every token is a point in space.'},
  {key:'layers',  name:'Decoder stack',icon:'\u2630',       blurb:'The vectors climb N layers. Attention mixes information across columns; the feedforward refines each one.'},
  {key:'logits',  name:'Logits',       icon:'\u2261',       blurb:'The top vector is scored against every word in the vocabulary, one raw number (a logit) each.'},
  {key:'softmax', name:'Softmax',      icon:'\u222B',       blurb:'Softmax squashes the logits into a clean probability distribution that sums to one.'},
  {key:'sample',  name:'Sample',       icon:'\u2685',       blurb:'Pick one token from the distribution, by greedy argmax or by sampling.'},
  {key:'append',  name:'Append & loop',icon:'\u21BB',       blurb:'The chosen token is glued onto the context, and the whole pipeline runs again.'}
];

let _anat = { stage:0, prompt:'the night was', tokens:[], layer:0, anim:null, temp:0.8, picked:null, embSel:0, layerData:null };

function openLLMAnatomy(){
  const ex=document.getElementById('llm-anatomy'); if(!ex) return;
  ex.style.display='block';
  if(window.lmBuild) lmBuild();
  _anat.tokens=anatTokenize(_anat.prompt);
  anatSetStage(_anat.stage||0);
}
function closeLLMAnatomy(){ const ex=document.getElementById('llm-anatomy'); if(ex) ex.style.display='none'; if(_anat.anim){ clearInterval(_anat.anim); _anat.anim=null; } }
function anatSetStage(i){
  if(_anat.anim){ clearInterval(_anat.anim); _anat.anim=null; }
  _anat.stage=Math.max(0,Math.min(ANAT_STAGES.length-1,i));
  anatRenderRail(); anatRenderStrip(); anatRenderPanel();
}
function anatStep(d){ anatSetStage(_anat.stage+d); }

function anatRenderRail(){
  const r=document.getElementById('anat-rail'); if(!r) return;
  r.innerHTML=ANAT_STAGES.map((s,i)=>{
    const on=i===_anat.stage;
    return `<button onclick="anatSetStage(${i})" style="display:flex;gap:10px;align-items:center;text-align:left;width:100%;background:${on?'rgba(77,227,255,0.12)':'var(--surface2)'};border:1px solid ${on?'var(--accent)':'var(--border2)'};border-radius:9px;padding:.6rem .7rem;cursor:pointer;transition:all .15s">
      <span style="font-family:var(--mono);font-size:1rem;width:24px;text-align:center;color:${on?'var(--accent)':'var(--muted)'}">${s.icon}</span>
      <span style="display:flex;flex-direction:column;gap:1px">
        <span style="font-family:var(--mono);font-size:.74rem;color:${on?'var(--accent)':'var(--text)'}">${i+1}. ${s.name}</span>
      </span>
    </button>`;
  }).join('');
}
function anatRenderStrip(){
  const st=document.getElementById('anat-strip'); if(!st) return;
  st.innerHTML=ANAT_STAGES.map((s,i)=>{
    const on=i===_anat.stage, done=i<_anat.stage;
    const col=on?'var(--accent)':done?'var(--accent2)':'var(--border2)';
    return `<div style="display:flex;align-items:center">
      <button onclick="anatSetStage(${i})" title="${s.name}" style="width:30px;height:30px;border-radius:50%;border:2px solid ${col};background:${on?'var(--accent)':'var(--surface2)'};color:${on?'var(--bg)':'var(--muted)'};font-family:var(--mono);font-size:.66rem;cursor:pointer;display:flex;align-items:center;justify-content:center">${i+1}</button>
      ${i<ANAT_STAGES.length-1?`<div style="width:18px;height:2px;background:${i<_anat.stage?'var(--accent2)':'var(--border2)'}"></div>`:''}
    </div>`;
  }).join('');
}
function anatRenderPanel(){
  const p=document.getElementById('anat-panel'); if(!p) return;
  const s=ANAT_STAGES[_anat.stage];
  const head=`<div style="margin-bottom:1.2rem">
    <div style="font-family:var(--display);font-size:1.5rem;letter-spacing:.04em;color:var(--text);margin-bottom:.35rem">${s.icon}&nbsp;&nbsp;${s.name}</div>
    <div style="font-family:var(--body);font-size:.95rem;color:var(--muted);line-height:1.6;max-width:620px">${s.blurb}</div>
  </div>`;
  p.innerHTML=head+'<div id="anat-stagebody"></div>';
  const body=document.getElementById('anat-stagebody');
  if(body && ANAT_BUILD[s.key]) body.innerHTML=ANAT_BUILD[s.key]();
  setTimeout(()=>{ if(ANAT_POST[s.key]) ANAT_POST[s.key](); }, 30);
}

// ── helpers ────────────────────────────────────────────────
function anatHash(str){ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0); }
function anatTokId(t){ return anatHash(t)%50000; }
function anatTokenize(text){
  const words=text.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const sufs=['ization',' tion','ing','tion','ness','ment','ed','ly','er','s'];
  const toks=[];
  words.forEach((w,wi)=>{
    let parts=null;
    for(const suf of sufs){ const sf=suf.trim(); if(w.length>sf.length+3 && w.endsWith(sf)){ parts=[w.slice(0,w.length-sf.length),sf]; break; } }
    if(!parts){ if(w.length>9){ const h=Math.ceil(w.length/2); parts=[w.slice(0,h),w.slice(h)]; } else parts=[w]; }
    parts.forEach((p,pi)=> toks.push({text:p, word:wi, first:pi===0}));
  });
  return toks;
}
function anatEmb(text,d){ const v=[]; const h=anatHash(text); for(let k=0;k<d;k++){ v.push(Math.sin(h*0.0001+(text.charCodeAt(k%text.length)||1)*0.21+k*1.3)*0.85); } return v; }
function _anatDot(a,b){ let s=0; for(let i=0;i<a.length;i++) s+=a[i]*b[i]; return s; }
function anatLayerVectors(tokens,L,d){
  let cur=tokens.map(t=>anatEmb(t.text,d));
  const hist=[cur.map(v=>v.slice())];
  for(let l=0;l<L;l++){
    const next=cur.map((v,i)=>{
      let ctx=new Array(d).fill(0),wsum=0;
      for(let j=0;j<=i;j++){ const w=Math.exp(_anatDot(cur[i],cur[j])/Math.sqrt(d)); wsum+=w; for(let k=0;k<d;k++) ctx[k]+=w*cur[j][k]; }
      ctx=ctx.map(x=>x/(wsum||1));
      return v.map((x,k)=>Math.tanh(0.62*x+0.5*ctx[k]));
    });
    cur=next; hist.push(cur.map(v=>v.slice()));
  }
  return hist;
}
function _anatCell(ctx,x,y,w,h,v){ const a=Math.min(1,Math.abs(v)); ctx.fillStyle=v>=0?'rgba(77,227,255,'+(0.12+a*0.78)+')':'rgba(255,95,142,'+(0.12+a*0.78)+')'; ctx.fillRect(x,y,w-1,h-1); }

// ── per-stage builders + post ──────────────────────────────
const ANAT_BUILD={}, ANAT_POST={};

// TEXT
ANAT_BUILD.text=()=>`
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.6rem">Try a prompt</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1.1rem">
    <input id="anat-text-in" type="text" value="${_anat.prompt}" oninput="anatSetPrompt(this.value)" style="flex:1;min-width:240px;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.7rem 1rem;font-family:var(--mono);font-size:1rem;color:var(--text);outline:none">
  </div>
  <div style="background:var(--surface2);border-radius:12px;padding:1.5rem;margin-bottom:1rem">
    <div style="font-family:var(--mono);font-size:.6rem;color:var(--muted);margin-bottom:.7rem">the model sees only characters:</div>
    <div id="anat-chars" style="display:flex;gap:3px;flex-wrap:wrap"></div>
  </div>
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);line-height:1.6">Edit the text above and every downstream stage updates. Next: it gets chopped into tokens.</div>`;
ANAT_POST.text=()=>{
  const c=document.getElementById('anat-chars'); if(!c) return;
  c.innerHTML=[..._anat.prompt].map(ch=>`<span style="display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:24px;background:var(--surface3);border-radius:4px;font-family:var(--mono);font-size:.8rem;color:${ch===' '?'var(--border2)':'var(--accent)'}">${ch===' '?'\u2423':ch}</span>`).join('');
};

// TOKENS
ANAT_BUILD.tokens=()=>`
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.6rem">Live tokenizer &middot; type to watch it split</div>
  <input id="anat-tok-in" type="text" value="${_anat.prompt}" oninput="anatRetok(this.value)" style="width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.7rem 1rem;font-family:var(--mono);font-size:1rem;color:var(--text);outline:none;margin-bottom:1.2rem">
  <div id="anat-tok-out" style="margin-bottom:1.1rem"></div>
  <div style="display:flex;gap:18px;flex-wrap:wrap;font-family:var(--mono);font-size:.72rem">
    <div style="background:rgba(77,227,255,.07);border:1px solid rgba(77,227,255,.2);border-radius:8px;padding:.5rem 1rem;color:var(--accent)">characters: <strong id="anat-charcount">0</strong></div>
    <div style="background:rgba(160,140,255,.07);border:1px solid rgba(160,140,255,.2);border-radius:8px;padding:.5rem 1rem;color:var(--accent2)">tokens: <strong id="anat-tokcount">0</strong></div>
  </div>
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);line-height:1.6;margin-top:1rem">Each token gets an integer id from a fixed vocabulary. Long or rare words split into subword pieces, which is why "tokenization" might become two tokens. Try typing one.</div>`;
ANAT_POST.tokens=()=>anatRetok(_anat.prompt);

// EMBED
ANAT_BUILD.embed=()=>`
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.7rem">Each token id \u2192 a learned vector. Click a token.</div>
  <div id="anat-emb-chips" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:1.1rem"></div>
  <div style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:flex-start">
    <div style="flex:1;min-width:280px">
      <div style="font-family:var(--mono);font-size:.6rem;color:var(--muted);margin-bottom:.5rem">embedding vectors (each row = one token, ${12} dims)</div>
      <canvas id="anat-emb-canvas" width="380" height="220" style="width:100%;max-width:380px;display:block;cursor:pointer"></canvas>
    </div>
    <div style="flex:1;min-width:220px">
      <div style="font-family:var(--mono);font-size:.6rem;color:var(--muted);margin-bottom:.5rem">vectors projected to 2D (a token is a point)</div>
      <canvas id="anat-emb-map" width="260" height="220" style="width:100%;max-width:260px;display:block"></canvas>
    </div>
  </div>
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);line-height:1.6;margin-top:1rem">Blue cells are positive, red negative. These vectors are learned in training so that tokens used in similar ways land near each other. They are the model's real input.</div>`;
ANAT_POST.embed=()=>{ anatEmbChips(); anatEmbDraw(); };

// LAYERS
ANAT_BUILD.layers=()=>`
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.7rem">The residual stream climbs the stack &middot; attention mixes columns</div>
  <canvas id="anat-layer-canvas" width="640" height="340" style="width:100%;max-width:640px;display:block;margin-bottom:.9rem"></canvas>
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:.9rem">
    <button onclick="anatLayerStep()" id="anat-layer-step" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.1rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Next layer &#8593;</button>
    <button onclick="anatLayerPlay()" id="anat-layer-play" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1.1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">&#9654; Play</button>
    <button onclick="anatLayerReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1.1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">Reset</button>
    <span id="anat-layer-lab" style="font-family:var(--mono);font-size:.72rem;color:var(--accent);margin-left:auto"></span>
  </div>
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);line-height:1.6">Each column is one token's vector, evolving as it rises. At every layer, attention lets a token pull in information from earlier tokens (the arcs), then a feedforward step reshapes it. After N layers, the last column holds the prediction.</div>`;
ANAT_POST.layers=()=>{ _anat.layer=0; _anat.layerData=anatLayerVectors(_anat.tokens,6,12); anatLayerDraw(); };

// LOGITS
ANAT_BUILD.logits=()=>`
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.7rem">The final vector scores every vocabulary token</div>
  <div id="anat-logits-bars" style="margin-bottom:1rem"></div>
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);line-height:1.6">Each bar is a raw logit: the top vector dotted with one token's embedding (the unembedding step). High means the model favors that token. These are not yet probabilities, just scores. Next, softmax fixes that.</div>`;
ANAT_POST.logits=()=>anatLogitsDraw();

// SOFTMAX
ANAT_BUILD.softmax=()=>`
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.7rem">Logits \u2192 a real distribution. Drag temperature.</div>
  <div style="margin-bottom:1rem;max-width:420px">
    <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>temperature &tau;</span><span id="anat-temp-val" style="color:var(--accent)">${_anat.temp.toFixed(2)}</span></div>
    <input type="range" min="0.2" max="2" step="0.05" value="${_anat.temp}" oninput="anatSetTemp(this.value)" style="width:100%;accent-color:var(--accent)">
  </div>
  <div id="anat-softmax-bars" style="margin-bottom:1rem"></div>
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);line-height:1.6">Softmax exponentiates and normalizes so the bars sum to one. Low temperature sharpens toward the top token; high temperature flattens the field.</div>`;
ANAT_POST.softmax=()=>anatSoftmaxDraw();

// SAMPLE
ANAT_BUILD.sample=()=>`
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.7rem">Pick one token from the distribution</div>
  <div id="anat-sample-bars" style="margin-bottom:1rem"></div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1rem">
    <button onclick="anatDoSample('greedy')" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.1rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Greedy (argmax)</button>
    <button onclick="anatDoSample('sample')" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1.1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">&#2685; Sample</button>
  </div>
  <div id="anat-sample-result" style="font-family:var(--mono);font-size:.85rem;color:var(--muted);min-height:1.6rem"></div>`;
ANAT_POST.sample=()=>anatSampleDraw();

// APPEND
ANAT_BUILD.append=()=>`
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.7rem">The chosen token joins the context, and it all runs again</div>
  <div style="background:var(--surface2);border-radius:12px;padding:1.4rem;margin-bottom:1.2rem;font-family:var(--mono);font-size:1.05rem;line-height:1.9">
    <span style="color:var(--muted)">${_anat.prompt}</span> <span id="anat-app-tok" style="color:var(--accent3);background:rgba(255,95,142,.18);border-radius:4px;padding:0 4px">${_anat.picked||'\u2026'}</span>
  </div>
  <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:1.2rem">
    <button onclick="anatLoop()" style="background:linear-gradient(135deg,var(--accent),#a78bfa);color:var(--bg);border:none;border-radius:9px;padding:.6rem 1.3rem;font-family:var(--mono);font-size:.74rem;font-weight:700;cursor:pointer">&#8635; Run again from Tokenize</button>
    <span style="font-family:var(--mono);font-size:.62rem;color:var(--muted)">this loop, repeated, is how text is generated</span>
  </div>
  <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);line-height:1.6">Autoregressive generation is just this pipeline on repeat: predict a token, append it, predict the next, conditioned on everything so far including its own output.</div>`;
ANAT_POST.append=()=>{};

// ── stage logic ────────────────────────────────────────────
function anatSetPrompt(v){ _anat.prompt=v; _anat.tokens=anatTokenize(v); const c=document.getElementById('anat-chars'); if(c) ANAT_POST.text(); }
function anatRetok(v){
  _anat.prompt=v; _anat.tokens=anatTokenize(v);
  const out=document.getElementById('anat-tok-out');
  if(out) out.innerHTML=_anat.tokens.map((t,i)=>{
    const cols=['#4DE3FF','#A18FFF','#3DDC84','#ff8c42','#fde047','#FF5F8E'];
    const col=cols[i%cols.length];
    return `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:2px;margin:0 4px 8px 0">
      <span style="font-family:var(--mono);font-size:.92rem;color:#081018;background:${col};border-radius:6px;padding:.28rem .6rem">${t.first?'':'\u2581'}${t.text}</span>
      <span style="font-family:var(--mono);font-size:.56rem;color:var(--muted)">id ${anatTokId(t.text)}</span>
    </span>`;
  }).join('');
  const cc=document.getElementById('anat-charcount'); if(cc) cc.textContent=v.length;
  const tc=document.getElementById('anat-tokcount'); if(tc) tc.textContent=_anat.tokens.length;
}
function anatEmbChips(){
  const c=document.getElementById('anat-emb-chips'); if(!c) return;
  c.innerHTML=_anat.tokens.map((t,i)=>`<button onclick="anatEmbSel(${i})" style="background:${i===_anat.embSel?'var(--accent)':'var(--surface2)'};color:${i===_anat.embSel?'var(--bg)':'var(--text)'};border:1px solid ${i===_anat.embSel?'var(--accent)':'var(--border2)'};border-radius:7px;padding:.35rem .7rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">${t.text}</button>`).join('');
}
function anatEmbSel(i){ _anat.embSel=i; anatEmbChips(); anatEmbDraw(); }
function anatEmbDraw(){
  const d=12, cv=document.getElementById('anat-emb-canvas');
  if(cv){ const ctx=cv.getContext('2d'),W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H);
    const n=_anat.tokens.length, padL=64, rowH=Math.min(28,(H-10)/Math.max(1,n)), cw=(W-padL-8)/d;
    _anat.tokens.forEach((t,i)=>{ const v=anatEmb(t.text,d), y=6+i*rowH, sel=i===_anat.embSel;
      for(let k=0;k<d;k++) _anatCell(ctx,padL+k*cw,y,cw,rowH-3,v[k]);
      ctx.fillStyle=sel?'#4DE3FF':'rgba(255,255,255,0.6)'; ctx.font=(sel?'bold ':'')+'10px monospace'; ctx.textAlign='right'; ctx.fillText(t.text.slice(0,8),padL-6,y+rowH*0.55);
      if(sel){ ctx.strokeStyle='#4DE3FF'; ctx.lineWidth=1.5; ctx.strokeRect(padL,y-1,d*cw,rowH-2); }
    });
  }
  const mp=document.getElementById('anat-emb-map');
  if(mp){ const ctx=mp.getContext('2d'),W=mp.width,H=mp.height; ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.strokeRect(20,12,W-32,H-32);
    const dir1=[],dir2=[]; const rng=_txRng?_txRng(7):null;
    for(let k=0;k<d;k++){ dir1.push(Math.sin(k*1.7)); dir2.push(Math.cos(k*2.1)); }
    const pts=_anat.tokens.map(t=>{ const v=anatEmb(t.text,d); return [_anatDot(v,dir1),_anatDot(v,dir2)]; });
    const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
    const minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys);
    const X=x=>28+((x-minx)/((maxx-minx)||1))*(W-50), Y=y=>20+((y-miny)/((maxy-miny)||1))*(H-44);
    pts.forEach((p,i)=>{ const sel=i===_anat.embSel; ctx.beginPath(); ctx.arc(X(p[0]),Y(p[1]),sel?7:5,0,2*Math.PI); ctx.fillStyle=sel?'#4DE3FF':'rgba(160,140,255,0.8)'; ctx.fill(); ctx.fillStyle=sel?'#4DE3FF':'rgba(255,255,255,0.55)'; ctx.font=(sel?'bold ':'')+'9px monospace'; ctx.textAlign='center'; ctx.fillText(_anat.tokens[i].text.slice(0,6),X(p[0]),Y(p[1])-9); });
  }
  if(cv && !cv._bound){ cv._bound=true; cv.addEventListener('click',e=>{ const r=cv.getBoundingClientRect(); const my=(e.clientY-r.top)*(cv.height/r.height); const rowH=Math.min(28,(cv.height-10)/Math.max(1,_anat.tokens.length)); const i=Math.floor((my-6)/rowH); if(i>=0&&i<_anat.tokens.length) anatEmbSel(i); }); }
}
function anatLayerStep(){ if(!_anat.layerData) return; if(_anat.layer<_anat.layerData.length-1){ _anat.layer++; anatLayerDraw(); } }
function anatLayerReset(){ if(_anat.anim){ clearInterval(_anat.anim); _anat.anim=null; const b=document.getElementById('anat-layer-play'); if(b) b.innerHTML='&#9654; Play'; } _anat.layer=0; anatLayerDraw(); }
function anatLayerPlay(){
  const b=document.getElementById('anat-layer-play');
  if(_anat.anim){ clearInterval(_anat.anim); _anat.anim=null; if(b) b.innerHTML='&#9654; Play'; return; }
  if(b) b.innerHTML='&#10073;&#10073; Pause';
  _anat.anim=setInterval(()=>{ if(_anat.layer<_anat.layerData.length-1){ _anat.layer++; anatLayerDraw(); } else { clearInterval(_anat.anim); _anat.anim=null; if(b) b.innerHTML='&#9654; Play'; } }, 700);
}
function anatLayerDraw(){
  const cv=document.getElementById('anat-layer-canvas'); if(!cv||!_anat.layerData) return;
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H);
  const toks=_anat.tokens, n=toks.length, L=_anat.layerData.length-1, lay=_anat.layer, d=12;
  const padL=20,padR=20,padT=20,padB=46, colW=(W-padL-padR)/n, cellH=(H-padT-padB)/d;
  // columns of cells (current layer vectors)
  const vecs=_anat.layerData[lay];
  for(let i=0;i<n;i++){ const x=padL+i*colW;
    for(let k=0;k<d;k++) _anatCell(ctx,x+colW*0.18,padT+k*cellH,colW*0.64,cellH,vecs[i][k]);
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='10px monospace'; ctx.textAlign='center'; ctx.fillText(toks[i].text.slice(0,7),x+colW/2,H-padB+18);
  }
  // attention arcs from last token to earlier (at current layer, if lay>0)
  if(lay>0){
    const i=n-1, cur=_anat.layerData[lay-1];
    let ws=[],wsum=0; for(let j=0;j<=i;j++){ const w=Math.exp(_anatDot(cur[i],cur[j])/Math.sqrt(d)); ws.push(w); wsum+=w; }
    ws=ws.map(w=>w/wsum);
    const xi=padL+i*colW+colW/2;
    for(let j=0;j<=i;j++){ const xj=padL+j*colW+colW/2, a=ws[j];
      ctx.strokeStyle='rgba(255,140,66,'+(0.1+a*0.8)+')'; ctx.lineWidth=0.6+a*5;
      ctx.beginPath(); ctx.moveTo(xi,padT-6); ctx.bezierCurveTo(xi,padT-30,xj,padT-30,xj,padT-6); ctx.stroke();
    }
    ctx.fillStyle='rgba(255,140,66,0.75)'; ctx.font='9px monospace'; ctx.textAlign='center'; ctx.fillText('attention mixing',W/2,12);
  }
  const lab=document.getElementById('anat-layer-lab'); if(lab) lab.textContent=lay===0?'input embeddings (layer 0)':'after layer '+lay+' of '+L;
}
function anatLogitsDraw(){
  const el=document.getElementById('anat-logits-bars'); if(!el) return;
  const d=lmNextDist(_anat.prompt.toLowerCase().split(/\s+/));
  const top=d.dist.slice(0,8);
  const logits=top.map(([w,p])=>[w, Math.log(p)+6]);
  const max=Math.max(...logits.map(l=>l[1]));
  el.innerHTML=logits.map(([w,l],i)=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
    <span style="font-family:var(--mono);font-size:.76rem;color:var(--text);width:70px;text-align:right">${w}</span>
    <div style="flex:1;height:18px;background:var(--surface3);border-radius:5px;overflow:hidden"><div style="height:100%;width:${(l/max*100).toFixed(0)}%;background:${i===0?'#fde047':'rgba(253,224,71,0.55)'};border-radius:5px"></div></div>
    <span style="font-family:var(--mono);font-size:.64rem;color:var(--muted);width:48px">${l.toFixed(2)}</span>
  </div>`).join('');
}
function anatSetTemp(v){ _anat.temp=parseFloat(v); const e=document.getElementById('anat-temp-val'); if(e) e.textContent=_anat.temp.toFixed(2); anatSoftmaxDraw(); }
function anatSoftmaxDraw(){
  const el=document.getElementById('anat-softmax-bars'); if(!el) return;
  const d=lmNextDist(_anat.prompt.toLowerCase().split(/\s+/));
  const dist=lmApplyTemp(d.dist,_anat.temp).slice(0,8), max=dist[0][1];
  el.innerHTML=dist.map(([w,p],i)=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
    <span style="font-family:var(--mono);font-size:.76rem;color:var(--text);width:70px;text-align:right">${w}</span>
    <div style="flex:1;height:18px;background:var(--surface3);border-radius:5px;overflow:hidden"><div style="height:100%;width:${(p/max*100).toFixed(0)}%;background:${i===0?'#3DDC84':'rgba(160,140,255,0.7)'};border-radius:5px;transition:width .25s"></div></div>
    <span style="font-family:var(--mono);font-size:.64rem;color:var(--muted);width:48px">${(p*100).toFixed(0)}%</span>
  </div>`).join('');
}
function anatSampleDraw(){
  const el=document.getElementById('anat-sample-bars'); if(!el) return;
  const d=lmNextDist(_anat.prompt.toLowerCase().split(/\s+/));
  const dist=lmApplyTemp(d.dist,_anat.temp).slice(0,8), max=dist[0][1];
  el.innerHTML=dist.map(([w,p])=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px" id="anat-sb-${w}">
    <span style="font-family:var(--mono);font-size:.76rem;color:var(--text);width:70px;text-align:right">${w}</span>
    <div style="flex:1;height:18px;background:var(--surface3);border-radius:5px;overflow:hidden"><div style="height:100%;width:${(p/max*100).toFixed(0)}%;background:rgba(160,140,255,0.7);border-radius:5px"></div></div>
    <span style="font-family:var(--mono);font-size:.64rem;color:var(--muted);width:48px">${(p*100).toFixed(0)}%</span>
  </div>`).join('');
}
function anatDoSample(mode){
  const d=lmNextDist(_anat.prompt.toLowerCase().split(/\s+/));
  const dist=lmApplyTemp(d.dist,_anat.temp);
  const pick=lmPick(dist,mode); _anat.picked=pick;
  const res=document.getElementById('anat-sample-result');
  if(res) res.innerHTML='picked: <span style="color:var(--accent3);font-weight:700">'+pick+'</span>'+(mode==='greedy'?'  (the single most probable token)':'  (drawn in proportion to probability)');
  const row=document.getElementById('anat-sb-'+pick);
  if(row){ row.style.transition='background .2s'; row.style.background='rgba(255,95,142,0.12)'; row.style.borderRadius='6px'; setTimeout(()=>{ row.style.background='transparent'; },600); }
}
function anatLoop(){ if(_anat.picked){ _anat.prompt=(_anat.prompt+' '+_anat.picked).trim(); _anat.tokens=anatTokenize(_anat.prompt); _anat.picked=null; } anatSetStage(1); }

// ── 7.10 LIVE MODEL: real GPT-2 (transformers.js) + n-gram fallback ──
// The n-gram below is the instant, fully-offline fallback. On open we also
// stream a real GPT-2 into the browser (transformers.js / WASM) so that ANY
// sentence you type produces sensible next tokens. Same teaching panel: the
// "next-token distribution" you see is the model's real distribution.
const LM_CORPUS = `The weather today is cold and clear, and the sky is a pale shade of blue. In the morning the streets are quiet, and only a few people walk to work. By noon the sun is high and the air is warm. In the evening the wind picks up and the clouds roll in from the west. It often rains at night, and the rain falls softly on the roofs.

I opened my laptop and started to write some code. The function was simple, but it kept returning the wrong value. I added a print statement to see what was happening, and the bug was clear. A loop was running one time too many. I fixed the index, ran the tests again, and this time everything passed. It feels good when the code finally works.

She walked into the room and set her bag on the table. The light was low and the house was silent. She made a cup of tea and sat by the window. Outside, the rain traced long lines down the glass. She thought about the day, about the things she had said and the things she had left unsaid. After a while she opened a book and began to read.

A computer is a machine that follows instructions. Each instruction is small and exact, and the machine runs millions of them every second. A program is just a long list of these steps, written in a language the machine can understand. When you run a program, the computer reads each line, does what it says, and moves on to the next. Memory holds the numbers and the text while the program runs.

The best way to learn something new is to practice a little every day. At first the work feels slow and hard, and progress is difficult to see. But each day adds a small piece, and over time the pieces add up. Mistakes are part of the process, and every mistake teaches you something useful. The people who improve are simply the ones who keep going.

We drove north along the coast as the sun went down. The road followed the edge of the cliffs, and far below the waves broke white against the rocks. We stopped at a small town for dinner and ate by the water. The food was fresh and the bread was warm. Later we found a quiet place to camp and watched the stars come out over the sea.

The human brain is made of billions of cells called neurons. Each neuron sends small electrical signals to the cells around it. When many neurons fire together, a thought or a memory takes shape. The brain learns by changing the strength of the links between neurons. The more often two cells fire together, the stronger their connection becomes over time.

I went to the store to buy a few things for dinner. I needed bread, eggs, and some fresh vegetables. The store was busy and the lines were long. I found everything on my list and paid at the counter. On the way home I stopped at the park and sat on a bench for a while, watching the children play.

Music is a kind of language that everyone can feel. A song can lift your mood, or bring back a memory, or make a quiet room feel full. Some people play an instrument, and some people only listen, but both share in the same simple joy. The rhythm moves your body, and the melody stays in your mind long after the music has stopped.

Why do we sleep at night? Scientists are still working on the full answer, but they know that sleep helps the body rest and the brain sort through the day. While you sleep, the mind sorts memories and clears away waste. People who do not get enough sleep find it harder to focus, to learn, and to stay calm. Good sleep is one of the simplest ways to stay healthy.

The old train moved slowly through the green hills. Sheep grazed in the fields, and small farms dotted the land. At each station a few people got on and a few people got off. The conductor walked through the cars and checked the tickets. Through the window the world rolled by, slow and steady, like a story being told one page at a time.

Learning a new language takes time and patience. At first the words feel strange and the grammar makes little sense. But slowly the sounds become familiar, and one day a sentence simply appears in your mind. The key is to use the language every day, even in small ways. Read a little, listen a little, and speak whenever you can, even if you make mistakes.

The garden was full of color in the late spring. Red and yellow flowers lined the path, and bees moved from bloom to bloom. A small fountain stood in the center, and the water made a soft and steady sound. In the shade of a tall tree, an old cat slept through the warm afternoon. It was a calm and peaceful place to sit and think.

When you ask a question, you open a door to learning. A good question is clear and simple, and it points straight at the thing you want to know. Sometimes the answer is easy, and sometimes it leads to more questions. That is how knowledge grows, one step at a time. The people who learn the most are the ones who are never afraid to ask.

The city never really sleeps. Even late at night the lights stay on, and cars move through the streets. People come home from work, and others head out to begin their shift. In small cafes, friends talk over coffee, and somewhere a train rolls in to the station. The city is a living thing, always moving, always changing, never quite still.

He picked up the guitar and played a few soft notes. The room grew quiet as the music began. It was a slow and gentle song, the kind that makes you close your eyes and remember. When the last note faded, no one spoke for a moment. Then someone smiled, and the room came back to life, warm and full again.

Science is a way of asking questions about the world and testing the answers. You start with an idea, then you run an experiment to see if the idea holds. If the results match, you have learned something. If they do not, you change the idea and try again. Over many years, this careful process builds a clear picture of how the world works.

The dog ran across the field, ears flapping in the wind. It chased the ball, picked it up, and raced back, proud and happy. Again and again it ran, never seeming to tire. The boy laughed and threw the ball as far as he could. In the warm light of the afternoon, the two of them played until the sun began to set.

Every great project begins with a single small step. You do not need to see the whole path at the start. You only need to know the next move, and the courage to make it. As you go, the way becomes clearer, and what once felt impossible begins to feel within reach. Begin where you are, with what you have, and keep moving forward.

The river flowed slowly between the trees. Its surface was smooth and dark, and it mirrored the sky above. A small boat drifted near the bank, tied to a wooden post. Birds called from the branches, and a fish jumped, sending rings across the water. It was the kind of place where time seemed to slow down and the world felt soft and quiet.`;

let LM = null;
function lmTok(s){ return (String(s).toLowerCase().match(/[a-z']+|[.,!?;:]/g)) || []; }
function lmBuild(){
  if(LM) return LM;
  const toks = lmTok(LM_CORPUS);
  const c3={}, c2={}, c1={}, vocab=new Set();
  for(let i=0;i<toks.length;i++){
    vocab.add(toks[i]);
    c1[toks[i]]=(c1[toks[i]]||0)+1;
    if(i>=1){ const k=toks[i-1]; (c2[k]=c2[k]||{})[toks[i]]=((c2[k]||{})[toks[i]]||0)+1; }
    if(i>=2){ const k=toks[i-2]+'\u0001'+toks[i-1]; (c3[k]=c3[k]||{})[toks[i]]=((c3[k]||{})[toks[i]]||0)+1; }
  }
  LM={toks,c3,c2,c1,vocab:[...vocab]};
  return LM;
}
function lmNextDist(context){
  lmBuild();
  const t=context, w1=t[t.length-1], w2=t[t.length-2];
  let counts=null, src='';
  if(w2!==undefined && w1!==undefined && LM.c3[w2+'\u0001'+w1]){ counts=LM.c3[w2+'\u0001'+w1]; src='trigram'; }
  else if(w1!==undefined && LM.c2[w1]){ counts=LM.c2[w1]; src='bigram'; }
  else {
    // unknown recent word: skip back to the most recent known word with a bigram table
    let found=null;
    for(let k=t.length-1;k>=0 && k>=t.length-6;k--){ if(LM.c2[t[k]]){ found=t[k]; break; } }
    if(found){ counts=LM.c2[found]; src='bigram'; }
    else { counts=LM.c1; src='unigram'; }
  }
  const tot=Object.values(counts).reduce((a,b)=>a+b,0);
  const dist=Object.entries(counts).map(([w,c])=>[w,c/tot]).sort((a,b)=>b[1]-a[1]);
  return {dist,src};
}
function lmApplyTemp(dist,tau){
  const scaled=dist.map(([w,p])=>[w,Math.pow(p,1/tau)]);
  const Z=scaled.reduce((a,b)=>a+b[1],0);
  return scaled.map(([w,p])=>[w,p/Z]).sort((a,b)=>b[1]-a[1]);
}
function lmPick(dist,mode){
  if(mode==='greedy') return dist[0][0];
  let r=Math.random();
  for(const [w,p] of dist){ if(r<p) return w; r-=p; }
  return dist[dist.length-1][0];
}

function escapeHtml(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function lmPretty(s){
  if(s===undefined||s===null) return '';
  const t=String(s).replace(/\n/g,'\u23ce');
  return t.trim()===''?'\u2423':t.trim();
}

// ── shared UI state ────────────────────────────────────────
let _lm = { version:0, distRequest:0, engine:'ngram', ctx:[], promptText:'the night was', pieces:[],
            cacheText:null, cacheRaw:null,
            tau:0.8, mode:'sample', steps:0, auto:false, busy:false,
            lastPick:null, lastDist:null, lastSrc:'' };

// ── real GPT-2 engine (transformers.js) ────────────────────
let _gpt2 = { status:'idle', tokenizer:null, model:null, file:'', pct:0, error:'',
              id:'Xenova/distilgpt2', label:'GPT-2 (distil)' };

async function lmLoadGPT2(){
  if(_gpt2.status==='loading'||_gpt2.status==='ready') return;
  _gpt2.status='loading'; _gpt2.error=''; _gpt2.pct=0; lmRenderStatus();
  const cb = (p)=>{
    if(p && p.status==='progress' && p.total){ _gpt2.pct=Math.round(100*p.loaded/p.total); _gpt2.file=(p.file||'').split('/').pop()||_gpt2.file; }
    else if(p && p.file){ _gpt2.file=(p.file||'').split('/').pop()||_gpt2.file; }
    lmRenderStatus();
  };
  try{
    const T = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3');
    const { AutoTokenizer, AutoModelForCausalLM, env } = T;
    // load weights from the HF hub, not a local /models/ folder (which 404s here)
    if(env){ env.allowLocalModels=false; env.allowRemoteModels=true; if(env.backends&&env.backends.onnx&&env.backends.onnx.wasm) env.backends.onnx.wasm.proxy=false; }
    _gpt2.tokenizer = await AutoTokenizer.from_pretrained(_gpt2.id, { progress_callback: cb });
    // try quantized first; if that build isn't published, fall back to default precision
    try{
      _gpt2.model = await AutoModelForCausalLM.from_pretrained(_gpt2.id, { dtype:'q8', progress_callback: cb });
    }catch(inner){
      _gpt2.file=''; _gpt2.pct=0; lmRenderStatus();
      _gpt2.model = await AutoModelForCausalLM.from_pretrained(_gpt2.id, { progress_callback: cb });
    }
    _gpt2.status='ready'; _lm.engine='gpt2'; _lm.cacheText=null;
    lmRenderStatus();
    await lmRefreshDist(); lmRender();
  }catch(err){
    _gpt2.status='error'; _gpt2.error=String((err&&err.message)||err); _lm.engine='ngram'; _lm.auto=false;
    lmRenderStatus();
  }
}

// One forward pass -> top-N raw logits for the next position (cached by text).
async function gpt2ForwardRaw(text){
  if(_lm.cacheText===text && _lm.cacheRaw) return _lm.cacheRaw;
  const tok=_gpt2.tokenizer, model=_gpt2.model;
  const input=(text && text.length)? text : '\n';
  const enc=await tok(input);
  const out=await model(enc);
  const logits=out.logits, dims=logits.dims, seq=dims[1], vocab=dims[2], raw=logits.data, base=(seq-1)*vocab;
  const idx=new Array(vocab); for(let i=0;i<vocab;i++) idx[i]=i;
  idx.sort((a,b)=>raw[base+b]-raw[base+a]);
  const topN=idx.slice(0,200).map(id=>({id, logit:raw[base+id]}));
  _lm.cacheText=text; _lm.cacheRaw=topN;
  return topN;
}
// Apply temperature to cached logits, return renormalized top-k distribution.
function gpt2DistFromRaw(topN){
  const tau=Math.max(0.05,_lm.tau);
  let mx=-Infinity; for(const e of topN) if(e.logit>mx) mx=e.logit;
  const ex=topN.map(e=>({id:e.id, str:_gpt2.tokenizer.decode([e.id]), e:Math.exp((e.logit-mx)/tau)}));
  ex.sort((a,b)=>b.e-a.e);
  const K=Math.min(40, ex.length);
  const top=ex.slice(0,K); let z=0; for(const t of top) z+=t.e;
  return top.map(t=>({id:t.id, str:t.str, p:z>0?t.e/z:0}));
}
async function gpt2Forward(text){ return gpt2DistFromRaw(await gpt2ForwardRaw(text)); }

async function gpt2Step(){
  const version=_lm.version;
  const text=_lm.promptText + _lm.pieces.join('');
  const dist=await gpt2Forward(text);
  if(version!==_lm.version || _lm.engine!=='gpt2')return;
  _lm.lastDist=dist.map(d=>[lmPretty(d.str), d.p]);
  let chosen;
  if(_lm.mode==='greedy') chosen=dist[0];
  else { let r=Math.random(); chosen=dist[dist.length-1]; for(const d of dist){ if(r<d.p){ chosen=d; break; } r-=d.p; } }
  _lm.pieces.push(chosen.str); _lm.steps++; _lm.lastPick=lmPretty(chosen.str); _lm.lastSrc=_gpt2.label;
}

// Recompute the distribution panel for the current context (commit nothing).
async function lmRefreshDist(){
  const request=++_lm.distRequest, version=_lm.version;
  if(_lm.engine==='gpt2' && _gpt2.status==='ready'){
    const text=_lm.promptText + _lm.pieces.join('');
    try{ const dist=await gpt2Forward(text); if(request!==_lm.distRequest || version!==_lm.version)return; _lm.lastDist=dist.map(d=>[lmPretty(d.str), d.p]); _lm.lastSrc=_gpt2.label; }
    catch(err){ _gpt2.status='error'; _gpt2.error=String((err&&err.message)||err); _lm.engine='ngram'; _lm.auto=false; lmRenderStatus(); }
  } else {
    const d=lmNextDist(_lm.ctx); _lm.lastDist=lmApplyTemp(d.dist,_lm.tau); _lm.lastSrc='n-gram \u00b7 '+d.src;
  }
}

// ── 7.10 FULLSCREEN LIVE MODEL ─────────────────────────────
function openLLMModel(){
  const ex=document.getElementById('llm-model'); if(!ex) return;
  ex.style.display='block';
  lmBuild();
  lmSetPrompt(_lm.promptText || 'the night was');
  lmRenderStatus();
  if(_gpt2.status==='idle'){
    if(typeof navigator!=='undefined' && navigator.onLine===false){ _gpt2.status='offline'; lmRenderStatus(); }
    else if(typeof location!=='undefined' && location.protocol==='file:'){ _gpt2.status='needhttp'; lmRenderStatus(); }
    else lmLoadGPT2();   // stream the real model in the background
  }
}
function closeLLMModel(){ const ex=document.getElementById('llm-model'); if(ex) ex.style.display='none'; _lm.auto=false; _lm.version++; }

function lmSetPrompt(str){
  _lm.version++;
  const inp=document.getElementById('lm-prompt'); const s=(str!==undefined?str:(inp?inp.value:'the night was'));
  _lm.promptText = s.replace(/\s+$/,'');
  _lm.ctx = lmTok(s);
  _lm.pieces=[]; _lm.steps=0; _lm.lastPick=null; _lm.auto=false; _lm.cacheText=null;
  lmRender();
  Promise.resolve(lmRefreshDist()).then(lmRender);
}
function lmUsePrompt(){ const inp=document.getElementById('lm-prompt'); lmSetPrompt(inp?inp.value:'the night was'); }
function lmSetTau(v){
  _lm.tau=parseFloat(v); const e=document.getElementById('lm-tauval'); if(e) e.textContent=_lm.tau.toFixed(2);
  Promise.resolve(lmRefreshDist()).then(lmRender);
}
function lmSetMode(m){ _lm.mode=m; document.querySelectorAll('.lm-mode-btn').forEach(b=>{ const on=b.dataset.m===m; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; }); lmRender(); }

async function lmStep(){
  if(_lm.busy) return;
  _lm.busy=true; lmSetGenBusy(true);
  try{
    if(_lm.engine==='gpt2' && _gpt2.status==='ready'){
      await gpt2Step();
      if(_lm.pieces.length>240) _lm.pieces=_lm.pieces.slice(-240);
    } else {
      const d=lmNextDist(_lm.ctx); const dist=lmApplyTemp(d.dist,_lm.tau); const pick=lmPick(dist,_lm.mode);
      _lm.ctx.push(pick); _lm.steps++; _lm.lastPick=pick; _lm.lastDist=dist; _lm.lastSrc='n-gram \u00b7 '+d.src;
      if(_lm.ctx.length>60) _lm.ctx=_lm.ctx.slice(-60);
    }
    lmRender();
  }catch(err){ _gpt2.status='error'; _gpt2.error=String((err&&err.message)||err); _lm.engine='ngram'; _lm.auto=false; lmRenderStatus(); }
  finally{ _lm.busy=false; lmSetGenBusy(false); }
}

async function lmAuto(){
  if(_lm.auto){ _lm.auto=false; const b=document.getElementById('lm-auto'); if(b) b.innerHTML='&#9654; Auto'; return; }
  _lm.auto=true; const b=document.getElementById('lm-auto'); if(b) b.innerHTML='&#10073;&#10073; Stop';
  const start=_lm.steps;
  while(_lm.auto){
    const ex=document.getElementById('llm-model'); if(!ex || ex.style.display==='none'){ _lm.auto=false; break; }
    await lmStep();
    if(_lm.steps-start>=60 || _gpt2.status==='error') _lm.auto=false;
    await new Promise(r=>setTimeout(r, _lm.engine==='gpt2'?40:340));
  }
  const bb=document.getElementById('lm-auto'); if(bb) bb.innerHTML='&#9654; Auto';
}
function lmReset(){ _lm.auto=false; lmSetPrompt(); }

function lmSetGenBusy(on){
  const b=document.getElementById('lm-gen'); if(!b) return;
  b.disabled=on; b.style.opacity=on?0.6:1; b.style.cursor=on?'progress':'pointer';
  b.innerHTML=(on && _lm.engine==='gpt2') ? 'thinking&#8230;' : 'Generate token &#8594;';
}

function lmRenderStatus(){
  const chip=document.getElementById('lm-engine-chip');
  if(chip){
    if(_gpt2.status==='ready') chip.textContent='GPT-2 in your browser · top-40 sampling';
    else if(_gpt2.status==='loading') chip.textContent='loading GPT-2\u2026 '+_gpt2.pct+'%';
    else if(_gpt2.status==='error') chip.textContent='GPT-2 unavailable \u00b7 using n-gram';
    else if(_gpt2.status==='offline') chip.textContent='offline \u00b7 in-browser n-gram';
    else if(_gpt2.status==='needhttp') chip.textContent='n-gram \u00b7 GPT-2 needs http';
    else chip.textContent='n-gram \u00b7 loading real model\u2026';
  }
  const bar=document.getElementById('lm-loadbar'); if(!bar) return;
  if(_gpt2.status==='needhttp'){
    bar.style.display='block';
    bar.innerHTML='<div style="font-family:var(--mono);font-size:.58rem;color:var(--muted);line-height:1.6">You opened this HTML file directly. Some browsers restrict the downloads or workers needed by GPT-2 in this mode. The n-gram below works regardless. To run real GPT-2, serve the file over http: in its folder run <span style="color:var(--accent2)">python3 -m http.server</span>, then open <span style="color:var(--accent2)">http://localhost:8000/</span> and pick this file. '
      +'<button onclick="lmLoadGPT2()" style="background:var(--surface3);border:1px solid var(--border2);color:var(--accent);border-radius:5px;padding:.15rem .55rem;font-family:var(--mono);font-size:.58rem;cursor:pointer">try anyway</button></div>';
    return;
  }
  if(_gpt2.status==='offline'){
    bar.style.display='block';
    bar.innerHTML='<div style="font-family:var(--mono);font-size:.58rem;color:var(--muted);line-height:1.55">No internet detected, so this is the fully-offline n-gram model built earlier. It runs entirely in your browser and handles any sentence. '
      +'<button onclick="lmLoadGPT2()" style="background:var(--surface3);border:1px solid var(--border2);color:var(--accent);border-radius:5px;padding:.15rem .55rem;font-family:var(--mono);font-size:.58rem;cursor:pointer">load real GPT-2 (needs internet)</button></div>';
    return;
  }
  if(_gpt2.status==='loading'){
    bar.style.display='block';
    bar.innerHTML='<div style="font-family:var(--mono);font-size:.58rem;color:var(--muted);margin-bottom:4px">downloading '+escapeHtml(_gpt2.file||'model weights')+' \u00b7 '+_gpt2.pct+'% (one-time, then cached by your browser)</div>'
      +'<div style="height:6px;background:var(--surface3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+_gpt2.pct+'%;background:linear-gradient(90deg,var(--accent),#a78bfa);transition:width .2s"></div></div>';
  } else if(_gpt2.status==='error'){
    bar.style.display='block';
    const fileHint=(typeof location!=='undefined' && location.protocol==='file:')
      ? ' <br><span style="color:var(--muted)">Tip: you opened this file directly (file://), which may restrict the downloads or workers GPT-2 needs. Serve it over http instead, e.g. run <span style="color:var(--accent2)">python3 -m http.server</span> in the file\'s folder and open <span style="color:var(--accent2)">localhost:8000</span>.</span>'
      : '';
    bar.innerHTML='<div style="font-family:var(--mono);font-size:.58rem;color:#ff8aa0;line-height:1.55">Could not load GPT-2: '+escapeHtml(_gpt2.error||'network error')+'. The in-browser n-gram is active in the meantime. '
      +'<button onclick="lmLoadGPT2()" style="background:var(--surface3);border:1px solid var(--border2);color:var(--accent);border-radius:5px;padding:.15rem .55rem;font-family:var(--mono);font-size:.58rem;cursor:pointer">retry</button>'+fileHint+'</div>';
  } else { bar.style.display='none'; bar.innerHTML=''; }
}

function lmRender(){
  const out=document.getElementById('lm-output');
  if(out){
    if(_lm.engine==='gpt2'){
      out.style.whiteSpace='pre-wrap';
      let html='<span style="color:var(--muted)">'+escapeHtml(_lm.promptText)+'</span>';
      _lm.pieces.forEach((p,i)=>{
        const isLast=(i===_lm.pieces.length-1);
        const bg=isLast?'background:rgba(255,95,142,0.18);border-radius:3px':'';
        html+='<span style="color:'+(isLast?'var(--accent3)':'var(--text)')+';'+bg+'">'+escapeHtml(p)+'</span>';
      });
      out.innerHTML=html+'<span style="color:var(--accent3)">_</span>';
    } else {
      out.style.whiteSpace='normal';
      const html=_lm.ctx.map((w,i)=>{
        const isPrompt=i<(_lm.ctx.length-_lm.steps);
        const isLast=(i===_lm.ctx.length-1)&&_lm.lastPick!==null;
        const col=isLast?'var(--accent3)':(isPrompt?'var(--muted)':'var(--text)');
        const bg=isLast?'background:rgba(255,95,142,0.18);border-radius:3px;padding:0 2px':'';
        const sep=(i>0 && !/^[.,!?;:]/.test(w))?' ':'';
        return sep+'<span style="color:'+col+';'+bg+'">'+escapeHtml(w)+'</span>';
      }).join('');
      out.innerHTML=html+' <span style="color:var(--accent3)">_</span>';
    }
  }
  const cw=document.getElementById('lm-ctxwin');
  if(cw){
    let toks;
    if(_lm.engine==='gpt2'){
      const words=_lm.promptText.split(/(\s+)/).filter(s=>s.trim().length);
      toks=(_lm.pieces.length? _lm.pieces.slice(-8) : words.slice(-8)).map(lmPretty);
    } else { toks=_lm.ctx.slice(-2); }
    cw.innerHTML=toks.map(w=>'<span style="background:var(--surface3);border:1px solid var(--border2);border-radius:5px;padding:.25rem .6rem;font-family:var(--mono);font-size:.78rem;color:var(--accent)">'+escapeHtml(w)+'</span>').join(' ');
  }
  const srcEl=document.getElementById('lm-src'); if(srcEl) srcEl.textContent=_lm.lastSrc||'\u2014';
  const db=document.getElementById('lm-dist');
  if(db && _lm.lastDist){
    const top=_lm.lastDist.slice(0,8);
    const max=top.length?top[0][1]:1;
    db.innerHTML=top.map(([w,p])=>{
      const picked=(w===_lm.lastPick);
      const col=picked?'#FF5F8E':(w===top[0][0]?'#4DE3FF':'#A18FFF');
      return '<div style="display:flex;align-items:center;gap:8px">'
        +'<span style="font-family:var(--mono);font-size:.74rem;color:'+(picked?'#ff8aa0':'var(--text)')+';width:64px;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(w)+'</span>'
        +'<div style="flex:1;height:16px;background:var(--surface3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+(max>0?(p/max*100).toFixed(1):0)+'%;background:'+col+';border-radius:4px"></div></div>'
        +'<span style="font-family:var(--mono);font-size:.64rem;color:var(--muted);width:38px">'+(p*100).toFixed(0)+'%</span>'
      +'</div>';
    }).join('');
  }
  const se=document.getElementById('lm-steps'); if(se) se.textContent=_lm.steps;
}
