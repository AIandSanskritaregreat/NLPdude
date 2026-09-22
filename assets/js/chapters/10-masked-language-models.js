// ════════════════════════════════════════════════════════════
//  CHAPTER 10 · MASKED LANGUAGE MODELS
// ════════════════════════════════════════════════════════════

const ML_SEC = [
  {id:'mlintro',  num:'10.0',   title:'Encoders vs. Decoders',        icon:'\u21C4', desc:'Two uses of the same transformer: producing language and computing representations of it.', tags:['encoder-only','decoder-only','BERT vs GPT']},
  {id:'bidir',    num:'10.1',   title:'Bidirectional Attention',      icon:'\u2194', desc:'Remove the causal mask and every token can attend in both directions. That is the entire architectural change.', tags:['no mask','QK\u1d40 grid','model sizes']},
  {id:'mlm',      num:'10.2',   title:'Masked Language Modeling',     icon:'\u2588', desc:'Training by filling in blanks: corrupt tokens, predict the originals from both sides.', tags:['cloze','denoising','15%']},
  {id:'maskrec',  num:'10.2.1', title:'The 80/10/10 Masking Rule',  icon:'\u2684', desc:'Why selected tokens are not always replaced by [MASK]: avoiding a train-test mismatch.', tags:['[MASK]','random swap','unchanged']},
  {id:'nsp',      num:'10.2.2', title:'Next Sentence Prediction',     icon:'\u2016', desc:'A second objective: does sentence B actually follow sentence A? The [CLS] token and segment embeddings.', tags:['[CLS]','[SEP]','segments']},
  {id:'multiling',num:'10.2.3', title:'Training on Many Languages',   icon:'\u25D0', desc:'Reweighting the language mixture so English does not dominate the tokenizer, and what it costs.', tags:['\u03b1 = 0.3','XLM-R','multilinguality']},
  {id:'ctx',      num:'10.3',   title:'Contextual Embeddings',        icon:'\u273F', desc:'One vector per word instance, not per word type. Senses separate geometrically.', tags:['per-instance','sense clusters','word2vec vs BERT']},
  {id:'wsd',      num:'10.3.1', title:'Word Sense Disambiguation',    icon:'?',      desc:'Pick the intended sense by nearest-neighbor cosine against averaged sense embeddings.', tags:['WordNet','1-NN','cosine']},
  {id:'aniso',    num:'10.3.2', title:'Anisotropy',                   icon:'\u25E3', desc:'Raw contextual vectors crowd into a narrow cone. Standardizing restores meaningful cosines.', tags:['z-score','rogue dimensions','isotropy']},
  {id:'finetune', num:'10.4',   title:'Finetuning With a Task Head',  icon:'\u2295', desc:'A small classifier on top of the pretrained encoder: sequence and sentence-pair classification.', tags:['[CLS] head','sentiment','NLI']},
  {id:'ner',      num:'10.5',   title:'Named Entity Recognition',     icon:'\u25A3', desc:'A label for every token: entities, the BIO scheme, subword alignment, and entity-level F1.', tags:['PER/ORG/LOC','BIO','entity F1']},
  {id:'mlrecap',  num:'10.6',   title:'Recap',                icon:'\u25C9', desc:'The full encoder pipeline, and how it sits beside the decoder pipeline.', tags:['pipeline','recap']}
];

function buildMLOverview(){
  const cards = ML_SEC.map(s=>`
    <div class="sc-card" onclick="openMLSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Reading Rather Than Writing</div>
    <h1 class="lesson-h1">Masked Language Models</h1>
    <p class="lesson-intro">Masked language models such as BERT read context on both sides of a token. They are commonly used to produce representations for classification, labeling, and retrieval. We will compare bidirectional and causal attention, derive the masked-token objective, and attach task-specific output heads.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">An encoder-only transformer is the standard transformer architecture with the causal mask removed, so each token attends to context on both sides.</div>
        <div class="ch-sum-item">Because next-word prediction is trivial with bidirectional attention, training instead masks tokens and predicts them from surrounding context, with loss computed only on the corrupted positions.</div>
        <div class="ch-sum-item">Selected tokens become [MASK] only 80% of the time; 10% become a random token and 10% stay unchanged, so the model must represent every position, not just the marked ones.</div>
        <div class="ch-sum-item">Each instance of a word gets its own contextual embedding, and instances of different senses form separate clusters, which supports nearest-neighbor word sense disambiguation once anisotropy is corrected.</div>
        <div class="ch-sum-item">Finetuning adds a small task head, most often on the [CLS] vector for whole-sequence tasks or one softmax per token for sequence labeling such as NER.</div>
        <div class="ch-sum-item">Entity-level F1 is the standard NER metric, and it is strict: a partially matched span counts as both a false positive and a false negative.</div>
      </div>
    </div>`;
}

const ML_PAGES = {};
const ML_EQ = {};

// ── 10.0 ENCODERS VS DECODERS ──────────────────────────────
ML_PAGES.mlintro = `
<div class="lesson-chapter-label">Section 10.0</div>
<h1 class="lesson-h1">Encoders vs. Decoders</h1>
<p class="lesson-intro">The transformer architecture can be deployed in two configurations that serve different purposes. The decoder-only configuration, used by GPT and Llama and every model covered so far, processes text left to right under a causal mask and is trained to predict the next token; its natural output is more text. The encoder-only configuration, introduced by BERT (Devlin et al., 2019), removes the causal mask, reads an entire input at once, and produces a contextual representation vector for every position; its natural output is those vectors, which downstream components then use for classification, labeling, comparison, or retrieval.</p>

<h2 class="lesson-h2">Two Jobs, Two Shapes of Output</h2>
<p class="lesson-p">The distinction is worth internalizing before any mechanics, because it determines what each model family is for. A decoder is evaluated by the text it produces, so it is the right tool for chat, summarization, translation, and any task framed as generation. An encoder never produces text at all during normal use; it is evaluated by how useful its representation vectors are, so it is the right tool for sentiment classification, natural language inference, named entity recognition, and semantic search, where the answer is a label or a score rather than a passage. The demonstration below runs both configurations on the same sentence. The decoder emits tokens one at a time, each conditioned only on what came before it. The encoder consumes the whole sentence in a single pass and produces all of its output vectors simultaneously, each one informed by the entire sentence.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Generate vs. Represent</span></div>
  <div class="viz-body">
    <div style="display:flex;justify-content:center;margin-bottom:1rem"><button onclick="gvuRun()" id="gvu-btn" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">&#9654; Run both</button></div>
    <canvas id="gvu-canvas" width="640" height="250" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="gvu-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;text-align:center;min-height:2.6rem">Left: a decoder produces tokens sequentially. Right: an encoder produces one representation per token, all at once.</div>
  </div>
</div>

<p class="lesson-p">One practical note that everything below will confirm: encoder models are small. BERT has about 110 million parameters, roughly a thousandth the size of a frontier decoder model, which makes encoders cheap to run and cheap to finetune. That economy, combined with the quality of their representations, is why encoder models remain standard components in production systems for classification and retrieval even in a period dominated by large generative models.</p>

<div class="quiz-block" id="qml-intro"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What is the natural output of an encoder-only model?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qml-intro','Correct. An encoder produces a contextual representation vector for every input position; downstream heads turn those vectors into labels, scores, or matches.')">A representation vector for every input token</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-intro','Generating continuation text is the decoder configuration, trained with the causal mask.')">A continuation of the input text</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-intro','A single class label is produced by a task head added on top, not by the encoder itself.')">A single class label</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-intro','Encoders read text; they do not produce audio.')">A speech waveform</button>
</div><div class="quiz-explain" id="qml-intro-explain"></div></div>`;

// ── 10.1 BIDIRECTIONAL ATTENTION ───────────────────────────
ML_PAGES.bidir = `
<div class="lesson-chapter-label">Section 10.1</div>
<h1 class="lesson-h1">Bidirectional Attention</h1>
<p class="lesson-intro">The key attention difference is the mask. A causal decoder hides future positions; a bidirectional encoder allows attention in both directions. Actual model families also differ in normalization, position handling, training objectives, and other design choices. Here we isolate the mask:</p>
<div class="lesson-math" id="ml-bidir-head">\\[\\mathrm{head} = \\mathrm{softmax}\\!\\left(\\dfrac{\\mathbf{Q}\\mathbf{K}^{\\top}}{\\sqrt{d_k}}\\right)\\mathbf{V}\\]</div>
<p class="lesson-p">Compare this with the decoder version in Section 8.3, which wraps the scaled scores in a mask function before the softmax. With the mask gone, every entry of the attention matrix is live: token 3 can attend to token 7 just as easily as to token 1. The representation computed for each token is therefore conditioned on the whole input, words before it and words after it. Everything else in the architecture, the blocks, the residual stream, the feedforward layers, the layer norms, the token and position embeddings, is unchanged from the decoder transformer.</p>
<p class="lesson-p">In the demonstration below, the grid is the same masked QK&#7488; grid you used in Section 8.3, over a six-token sentence. In causal mode the upper triangle is blocked and the arrows above the grid show the selected token receiving information only from the left. Switch to bidirectional mode: the blocked cells fill in, each row renormalizes over all positions, and the arrows fan out in both directions. Click different tokens to change which row is illustrated.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Removing the Causal Mask</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
      <button class="bam-mode" data-m="causal" onclick="bamMode('causal')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">causal (decoder, Ch. 8)</button>
      <button class="bam-mode" data-m="bidir" onclick="bamMode('bidir')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">bidirectional (encoder)</button>
    </div>
    <canvas id="bam-canvas" width="640" height="330" style="width:100%;max-width:640px;display:block;margin:0 auto;cursor:pointer"></canvas>
    <div id="bam-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Concrete Sizes</h2>
<p class="lesson-p">It helps to know the actual numbers. The original BERT base model uses a WordPiece vocabulary of about 30,000 subword types, a maximum input length of 512 tokens, hidden dimension d = 768, 12 layers, and 12 attention heads, for roughly 110 million parameters. Multilingual encoders are larger to accommodate their vocabularies: XLM-RoBERTa large uses a 250,000-item SentencePiece vocabulary, d = 1024, and 24 layers, for about 550 million parameters. Both are small by the standards of Part II of this course: Llama 3.1 at 405 billion parameters is roughly a thousand times the size of BERT. The comparison below is drawn on a logarithmic parameter scale; click each model for its dimensions.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Encoder and Decoder Model Sizes</span></div>
  <div class="viz-body">
    <canvas id="msc-canvas" width="640" height="250" style="width:100%;max-width:640px;display:block;margin:0 auto;cursor:pointer"></canvas>
    <div id="msc-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.2rem">Click a model. The vertical bars are drawn on a log parameter scale.</div>
  </div>
</div>

<div class="quiz-block" id="qml-bidir"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Architecturally, what distinguishes a bidirectional encoder from a decoder transformer?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qml-bidir','Correct. The causal mask is removed from the attention computation; blocks, feedforward layers, layer norms, and embeddings are all unchanged.')">Only the removal of the causal mask in attention</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-bidir','The feedforward layers are identical in both configurations.')">A different feedforward design</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-bidir','Both use the same token-plus-position input scheme; the encoder later adds segment embeddings for pair tasks, but that is an input detail, not the defining change.')">A completely different embedding scheme</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-bidir','Encoders are typically SMALLER than modern decoders, and size is not the architectural distinction.')">Many more parameters</button>
</div><div class="quiz-explain" id="qml-bidir-explain"></div></div>`;

// ── 10.2 MASKED LANGUAGE MODELING ──────────────────────────
ML_PAGES.mlm = `
<div class="lesson-chapter-label">Section 10.2</div>
<h1 class="lesson-h1">Masked Language Modeling</h1>
<p class="lesson-intro">Removing the causal mask creates a training problem. The decoder objective, predict the next token, only works because the mask hides the future: without it, the answer to &ldquo;what is token t+1&rdquo; is sitting in the input at position t+1, and the model would learn nothing except to copy it. Bidirectional models therefore need a different self-supervised objective, and the one BERT introduced is <strong>masked language modeling</strong> (MLM): hide some of the input tokens and train the model to reconstruct them from the visible context on both sides.</p>

<h2 class="lesson-h2">The Cloze Objective</h2>
<p class="lesson-p">The procedure is a fill-in-the-blank task, known in psychology as a cloze task, and it can equally be described as denoising: corrupt the input, then train the model to recover the original. For each training sequence, a random 15% of tokens are selected for corruption (the exact treatment of selected tokens is the subject of the next section). The model encodes the corrupted sequence, and at each selected position i, the final hidden vector z&#7522; is passed through the language-modeling head from Section 8.5, the unembedding E&#7488; followed by a softmax, to produce a distribution over the vocabulary:</p>
<div class="lesson-math" id="ml-mlm-head">\\[\\mathbf{y}_i = \\mathrm{softmax}\\big(\\mathbf{z}_i\\, \\mathbf{E}^{\\top}\\big)\\]</div>
<p class="lesson-p">The loss is the familiar cross-entropy, the negative log probability assigned to the true original token, but averaged only over the set M of selected positions. Unselected tokens contribute nothing to the loss:</p>
<div class="lesson-math" id="ml-mlm-loss">\\[L_{MLM}(\\theta) = -\\frac{1}{|M|}\\sum_{i \\in M} \\log p_\\theta\\big(x_i \\mid \\mathbf{z}_i\\big)\\]</div>
<p class="lesson-p">The important property of this objective is which information the prediction can use. A masked token in the middle of a sentence is predicted from words on its left <em>and</em> its right, and both sides genuinely help: knowing what comes after a blank often constrains it more than what comes before. That is the property that makes the resulting representations good for understanding tasks. The demonstration below corrupts a sentence and shows the model&rsquo;s reconstruction of each blank; use the toggle to hide the right-hand context and watch the same predictions become both less confident and less accurate, which is the direct evidence for why bidirectionality matters.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Cloze Trainer</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
      <button onclick="clozeGo()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Corrupt &amp; predict &#8635;</button>
      <label style="font-family:var(--mono);font-size:.68rem;color:var(--muted);display:flex;align-items:center;gap:6px;margin-left:auto"><input type="checkbox" id="cloze-left" onchange="clozeDraw()"> hide the right-hand context</label>
    </div>
    <canvas id="cloze-canvas" width="640" height="250" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="cloze-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<div class="quiz-block" id="qml-mlm"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can a bidirectional model not simply be trained on next-word prediction?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qml-mlm','Correct. Without the causal mask, the next token is visible in the input, so the model would learn to copy it rather than to model language. Masking removes the answer from the input.')">Without a causal mask the next token is visible, so the model would just copy it</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-mlm','The softmax and cross-entropy work identically; the problem is information leakage, not the loss.')">The cross-entropy loss is undefined for encoders</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-mlm','Encoders handle sequences of the same lengths; length is not the issue.')">Encoders cannot process long sequences</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-mlm','Position embeddings are present in both configurations.')">Encoders have no position information</button>
</div><div class="quiz-explain" id="qml-mlm-explain"></div></div>`;

// ── 10.2.1 THE 80/10/10 RECIPE ─────────────────────────────
ML_PAGES.maskrec = `
<div class="lesson-chapter-label">Section 10.2.1</div>
<h1 class="lesson-h1">The 80/10/10 Masking Rule</h1>
<p class="lesson-intro">Saying &ldquo;15% of tokens are masked&rdquo; is a simplification. BERT selects 15% of token positions for prediction, but what happens to a selected token is randomized three ways: with probability 0.8 it is replaced by the special [MASK] token, with probability 0.1 it is replaced by a random vocabulary token, and with probability 0.1 it is left unchanged. In every case the model is still trained to predict the original token at that position.</p>

<h2 class="lesson-h2">Why Not Always [MASK]?</h2>
<p class="lesson-p">The reason for the two 10% cases is a train-test mismatch. The [MASK] token is absent from many downstream classification and labeling inputs, although masked-token tasks and prompting can still use it. If every selected position were replaced by [MASK], the model could learn a shortcut: build careful representations at [MASK] positions, where predictions are demanded, and weaker representations everywhere else. Such a model would degrade exactly when it is deployed, on inputs with no [MASK] tokens. The random-replacement case forces the model to notice when a visible token does not fit its context and to represent what should be there instead. The unchanged case forces it to maintain full representations even for tokens that look perfectly normal, since any position might be one it is asked to predict. Together the three cases ensure the encoder computes a genuine contextual representation at every position of every input, which is precisely the property downstream tasks rely on.</p>
<p class="lesson-p">Roll the corruption procedure repeatedly below on the sentence &ldquo;lunch was delicious&rdquo; with the token <em>delicious</em> selected. The tally converges to the 80/10/10 distribution, and the caption tracks which failure each branch is preventing.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Corruption Dice</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1rem">
      <button onclick="mrecRoll(1)" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Roll once</button>
      <button onclick="mrecRoll(50)" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">Roll &times;50</button>
      <button onclick="mrecReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">Reset tally</button>
    </div>
    <div id="mrec-out" style="background:var(--panel);border-radius:10px;padding:.9rem 1rem;font-family:var(--mono);font-size:.78rem;line-height:1.8;color:#ECF1FF;min-height:2.6rem;margin-bottom:1rem"></div>
    <canvas id="mrec-canvas" width="640" height="150" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="mrec-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.2rem">The target is always the original token, whatever the corruption branch.</div>
  </div>
</div>

<div class="quiz-block" id="qml-rec"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why are 10% of selected tokens left completely unchanged?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qml-rec','Correct. Since any normal-looking position might be one the model must predict, it has to maintain a full contextual representation at every position, matching the [MASK]-free inputs seen downstream.')">So the model must represent every position well, since [MASK] never appears downstream</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-rec','Compute cost is essentially unchanged by the corruption branch.')">To save computation on those tokens</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-rec','Those positions ARE still predicted; that is the point of keeping them in the selected set.')">Because those tokens are not predicted</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-rec','Vocabulary size is unrelated to the corruption recipe.')">To reduce the vocabulary size</button>
</div><div class="quiz-explain" id="qml-rec-explain"></div></div>`;

// ── 10.2.2 NEXT SENTENCE PREDICTION ────────────────────────
ML_PAGES.nsp = `
<div class="lesson-chapter-label">Section 10.2.2</div>
<h1 class="lesson-h1">Next Sentence Prediction</h1>
<p class="lesson-intro">Many downstream tasks operate on pairs of sentences: does a hypothesis follow from a premise, are two questions paraphrases, is this passage relevant to that query. To prepare for such tasks, BERT added a second pretraining objective alongside MLM. In <strong>next sentence prediction</strong> (NSP), the model is given two sentences and must decide whether the second actually followed the first in the source text (label IsNext) or was drawn at random from elsewhere in the corpus (label NotNext); training pairs are constructed half and half.</p>

<h2 class="lesson-h2">Special Tokens and the Three-Part Input</h2>
<p class="lesson-p">Sentence-pair inputs introduce the special tokens that BERT is known for. The input is assembled as [CLS], the tokens of sentence A, [SEP], the tokens of sentence B, [SEP]. The [CLS] token is a placeholder whose final-layer vector serves as a representation of the whole input; the [SEP] tokens mark the boundary. To tell the model which segment each token belongs to, a third embedding is added to the input sum: alongside the token embedding and position embedding of Section 8.4, each position receives a <strong>segment embedding</strong>, one learned vector for segment A and another for segment B:</p>
<div class="lesson-math" id="ml-nsp-input">\\[\\mathbf{X}[i] = \\mathbf{E}_{tok}(x_i) + \\mathbf{E}_{pos}(i) + \\mathbf{E}_{seg}(s_i)\\]</div>
<p class="lesson-p">The NSP prediction itself is a two-way classifier on the final [CLS] vector, trained with cross-entropy:</p>
<div class="lesson-math" id="ml-nsp-head">\\[\\mathbf{y} = \\mathrm{softmax}\\big(\\mathbf{z}_{CLS}\\, \\mathbf{W}_{NSP}\\big), \\qquad \\mathbf{W}_{NSP} \\in \\mathbb{R}^{d \\times 2}\\]</div>
<p class="lesson-p">One honest historical note: later work found NSP to be dispensable. RoBERTa (Liu et al., 2019) removed the objective entirely and trained with MLM alone on more data, and performance did not suffer; on several benchmarks it improved. NSP is still worth understanding because it introduced [CLS], [SEP], and segment embeddings, all of which survived and are central to the finetuning recipes of Section 10.4, even though the pretraining objective that motivated them did not. In the demonstration below, the coin flip constructs an IsNext or NotNext pair, the three-row strip shows the token, position, and segment embeddings summing into the input, and the [CLS] classifier renders its verdict.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Sentence-Pair Coherence</span></div>
  <div class="viz-body">
    <div style="display:flex;justify-content:center;margin-bottom:1rem"><button onclick="nspFlip()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">&#127937; Construct a pair (50/50)</button></div>
    <canvas id="nsp-canvas" width="640" height="270" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="nsp-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem">Press the button to construct a training pair.</div>
  </div>
</div>

<div class="quiz-block" id="qml-nsp"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Which vector does the NSP classifier read its decision from?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qml-nsp','Correct. The final-layer vector of the [CLS] token serves as the whole-input representation, and the NSP head is a two-way softmax on it.')">The final-layer vector of the [CLS] token</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-nsp','[SEP] marks boundaries; the classification vector is [CLS].')">The vector of the [SEP] token</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-nsp','Averaging is one pooling option in other systems, but BERT NSP uses the [CLS] vector.')">The average of all token vectors</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-nsp','Segment embeddings are inputs that mark which sentence a token belongs to, not outputs.')">The segment embedding of sentence B</button>
</div><div class="quiz-explain" id="qml-nsp-explain"></div></div>`;

// ── 10.2.3 MANY LANGUAGES ──────────────────────────────────
ML_PAGES.multiling = `
<div class="lesson-chapter-label">Section 10.2.3</div>
<h1 class="lesson-h1">Training on Many Languages</h1>
<p class="lesson-intro">Multilingual encoders such as mBERT and XLM-RoBERTa are trained on text from a hundred or more languages at once, with a single shared subword vocabulary. This raises a data-balance problem that has to be solved before training even starts, at the tokenizer level: the raw web is overwhelmingly dominated by a few languages, English above all. A tokenizer trained on raw proportions would spend nearly its whole vocabulary budget on English, leaving low-resource languages tokenized into tiny fragments, characters or short byte sequences, which both wastes sequence length and starves those languages of good representations.</p>

<h2 class="lesson-h2">Exponential Reweighting</h2>
<p class="lesson-p">The standard fix rescales the language sampling distribution. If q&#7522; is language i&rsquo;s share of the raw corpus, sampling for vocabulary construction and training instead uses probabilities proportional to q&#7522; raised to a power &alpha; between 0 and 1:</p>
<div class="lesson-math" id="ml-alpha">\\[p_i = \\frac{q_i^{\\,\\alpha}}{\\sum_{j} q_j^{\\,\\alpha}}\\]</div>
<p class="lesson-p">At &alpha; = 1 this is the raw distribution; at &alpha; = 0 every language is sampled equally regardless of size; XLM-RoBERTa uses &alpha; = 0.3, which substantially raises low-resource languages while still sampling high-resource ones more often. (The same exponent trick appeared with word2vec, which raised unigram frequencies to the power 0.75 to reweight negative samples; the mechanism is identical.) Drag &alpha; below and watch the sampling shares move.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The &alpha; Reweighting</span></div>
  <div class="viz-body">
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>exponent &alpha;</span><span id="alpha-v" style="color:var(--accent)">1.00</span></div>
      <input id="alpha-slider" type="range" min="0" max="1" step="0.02" value="1" oninput="alphaSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <canvas id="alpha-canvas" width="640" height="230" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="alpha-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.2rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Two Costs Worth Knowing</h2>
<p class="lesson-p">Multilingual training is not free, and two of its costs have names. The <strong>curse of multilinguality</strong>: for a fixed model capacity, adding more languages eventually lowers per-language quality, because the languages compete for the same parameters; XLM-R accepts a measurable drop in English performance relative to a monolingual model of the same size in exchange for covering a hundred languages. And the <strong>accent effect</strong>: because high-resource languages dominate even after reweighting, the shared representations are subtly biased toward their structures, so a multilingual model&rsquo;s representation of a low-resource language can drift toward, for example, English-like word order and constructions. Both effects are active research problems rather than solved ones, and both are direct consequences of the shared-capacity design.</p>

<div class="quiz-block" id="qml-alpha"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does setting &alpha; below 1 accomplish in multilingual training?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qml-alpha','Correct. Raising shares to a power below 1 compresses the gap between large and small languages, so low-resource languages are sampled more than their raw share and get usable subword coverage.')">It raises the sampling share of low-resource languages relative to raw proportions</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-alpha','Alpha changes sampling proportions; it does not change model capacity or remove the multilinguality tradeoff.')">It eliminates the curse of multilinguality</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-alpha','Vocabulary SIZE is chosen separately; alpha changes what the vocabulary is trained on.')">It increases the vocabulary size</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-alpha','At alpha = 0 sampling is uniform; below 1 it is flattened, not reversed.')">It makes small languages dominate large ones</button>
</div><div class="quiz-explain" id="qml-alpha-explain"></div></div>`;


// ── 10.3 CONTEXTUAL EMBEDDINGS ─────────────────────────────
ML_PAGES.ctx = `
<div class="lesson-chapter-label">Section 10.3</div>
<h1 class="lesson-h1">Contextual Embeddings</h1>
<p class="lesson-intro">A static embedding gives every occurrence of <em>bank</em> the same vector. A contextual encoder produces a vector that depends on the surrounding text, allowing riverbank and financial uses to differ. Inspect how those representations move across sentences.</p>

<h2 class="lesson-h2">Senses Separate Geometrically</h2>
<p class="lesson-p">The consequence is visible when many instances are plotted together. Take the string <em>die</em> and collect hundreds of sentences containing it: English sentences where it is the verb (to die), English sentences where it is the noun (a die, one of a pair of dice), and German sentences where it is the definite article (die Katze). Encode each sentence, take the vector at the position of <em>die</em>, and project the vectors to two dimensions. The instances do not land in one place. They form separate clusters, one per sense, because the surrounding context that attention mixed into each vector differs systematically by sense. Nothing told the model about senses; the clusters are a byproduct of predicting masked words well.</p>
<p class="lesson-p">The demonstration below shows this for several ambiguous words. Each point is one sentence; move the pointer near a point to read its sentence. The slider interpolates between the static view, in which all instances of a word collapse to a single point, and the contextual view, in which they spread into sense clusters. That interpolation is the type-versus-token distinction drawn as a picture, and it is the central claim here.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Contextual Embedding Map</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
      <span style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">word:</span>
      <span id="cmap-words" style="display:flex;gap:6px;flex-wrap:wrap"></span>
    </div>
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>static (one vector per type) &#8596; contextual (one vector per instance)</span><span id="cmap-tv" style="color:var(--accent)">contextual</span></div>
      <input id="cmap-slider" type="range" min="0" max="1" step="0.01" value="1" oninput="cmapSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <canvas id="cmap-canvas" width="640" height="300" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="cmap-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.2rem">Move the pointer near a point to read the sentence it came from.</div>
  </div>
</div>

<div class="quiz-block" id="qml-ctx"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">How does a contextual embedding differ from a word2vec embedding?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qml-ctx','Correct. word2vec assigns one vector per word type; an encoder computes a distinct vector for each occurrence, conditioned on its sentence, so different senses land in different regions.')">It is computed per occurrence, so the same word gets different vectors in different sentences</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-ctx','Dimensionality is a design choice for both; it is not the distinction.')">It always has more dimensions</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-ctx','Both kinds of embeddings are learned from unlabeled text.')">It requires sense-labeled training data</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-ctx','Contextual embeddings are real-valued vectors just like static ones.')">It is a discrete symbol rather than a vector</button>
</div><div class="quiz-explain" id="qml-ctx-explain"></div></div>`;

// ── 10.3.1 WORD SENSE DISAMBIGUATION ───────────────────────
ML_PAGES.wsd = `
<div class="lesson-chapter-label">Section 10.3.1</div>
<h1 class="lesson-h1">Word Sense Disambiguation</h1>
<p class="lesson-intro">If sense clusters exist in the embedding space, they can be used. <strong>Word sense disambiguation</strong> (WSD) is the task of deciding which dictionary sense a word instance carries: given <em>bass</em> in a sentence, is it the low frequency range, the fish, or the instrument? Sense inventories such as WordNet list the candidate senses discretely; contextual embeddings supply a continuous geometry; WSD connects the two.</p>

<h2 class="lesson-h2">The Nearest-Neighbor Algorithm</h2>
<p class="lesson-p">The standard embedding-based algorithm is one-nearest-neighbor over sense centroids. In a preparation step, take a corpus annotated with senses (such as SemCor), encode every annotated instance, and average the contextual vectors of all instances of each sense s to obtain one <strong>sense embedding</strong> v&#8347; per sense:</p>
<div class="lesson-math" id="ml-wsd-avg">\\[\\mathbf{v}_s = \\frac{1}{n_s} \\sum_{i \\,:\\, \\mathrm{sense}(i) = s} \\mathbf{z}_i\\]</div>
<p class="lesson-p">At test time, encode the target instance to get its contextual vector z, compute the cosine similarity to every candidate sense embedding of that word, and choose the closest:</p>
<div class="lesson-math" id="ml-wsd-argmax">\\[\\hat{s} = \\operatorname*{argmax}_{s}\\; \\cos\\big(\\mathbf{z}, \\mathbf{v}_s\\big)\\]</div>
<p class="lesson-p">This is the same cosine similarity from embeddings, doing new work: there it measured relatedness between word types; here it resolves the meaning of one specific occurrence. Despite its simplicity, this method reaches accuracy comparable to much more elaborate WSD systems, which is itself evidence for how much sense information the contextual vectors contain. Below, three sense centroids for <em>bass</em> are placed in the plane. Choose a sentence; its instance vector drops into the space, cosines to each centroid are computed, and the highest-cosine sense wins. Switching sentences moves the instance and flips the winning sense.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Nearest-Neighbor Sense Selection</span></div>
  <div class="viz-body">
    <div id="wsd-sents" style="display:flex;flex-direction:column;gap:6px;margin-bottom:1rem"></div>
    <canvas id="wsd-canvas" width="640" height="270" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="wsd-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.2rem"></div>
  </div>
</div>

<div class="quiz-block" id="qml-wsd"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In the nearest-neighbor WSD algorithm, what is a sense embedding?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qml-wsd','Correct. Each sense is represented by the average of the contextual vectors of its labeled instances in a sense-annotated corpus; test instances are matched to the nearest such average by cosine.')">The average of the contextual vectors of a sense&rsquo;s labeled training instances</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-wsd','Static type vectors are exactly what cannot distinguish senses; the method uses contextual instance vectors.')">The word2vec vector of the word type</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-wsd','Definitions can be encoded in other variants, but the standard method here averages labeled instances.')">A one-hot code of the WordNet sense number</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-wsd','The [CLS] vector summarizes a whole input; sense embeddings are built from the target word position.')">The [CLS] vector of the sentence</button>
</div><div class="quiz-explain" id="qml-wsd-explain"></div></div>`;

// ── 10.3.2 ANISOTROPY ──────────────────────────────────────
ML_PAGES.aniso = `
<div class="lesson-chapter-label">Section 10.3.2</div>
<h1 class="lesson-h1">Anisotropy</h1>
<p class="lesson-intro">Contextual embeddings are often <strong>anisotropic</strong>: their directions are unevenly distributed. A shared component can make unrelated tokens appear similar under cosine similarity. The size of the effect varies by model and layer. The demo shows why centering or other post-processing can change the comparison.</p>

<h2 class="lesson-h2">Standardization as the Fix</h2>
<p class="lesson-p">A large share of the anisotropy is traceable to a small number of <strong>rogue dimensions</strong>: coordinates with means far from zero and variances far larger than the rest, which drag every vector in the same direction. The repair is the z-score standardization already familiar from layer normalization in Section 8.2, applied per dimension across a reference corpus. Compute the corpus mean and standard deviation of each dimension d:</p>
<div class="lesson-math" id="ml-aniso-stats">\\[\\mu_d = \\frac{1}{n}\\sum_{i=1}^{n} z_{i,d}, \\qquad \\sigma_d = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n} (z_{i,d} - \\mu_d)^2}\\]</div>
<p class="lesson-p">and standardize every vector coordinate-wise:</p>
<div class="lesson-math" id="ml-aniso-z">\\[\\hat{z}_{i,d} = \\frac{z_{i,d} - \\mu_d}{\\sigma_d}\\]</div>
<p class="lesson-p">Subtracting the means recenters the cloud at the origin, removing the shared offset, and dividing by the standard deviations equalizes the rogue dimensions with the rest. After standardization, random-pair cosines fall toward zero and cosine similarity again measures what it should. In the demonstration below, the left readout tracks the average cosine between random pairs, and the bar chart shows the per-dimension variances with the rogue dimensions visible; press standardize and watch both the geometry and the statistic correct themselves.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; From Anisotropic to Isotropic</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1rem">
      <button onclick="anisoGo()" id="aniso-go" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Standardize &#8594;</button>
      <button onclick="anisoReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">Reset</button>
    </div>
    <canvas id="aniso-canvas" width="640" height="260" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="aniso-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.2rem"></div>
  </div>
</div>

<div class="quiz-block" id="qml-aniso"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What symptom indicates that raw contextual embeddings are anisotropic?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qml-aniso','Correct. In an isotropic space random pairs would have cosine near zero; raw contextual vectors crowd into a narrow region, so random pairs score misleadingly high.')">Randomly chosen word pairs have cosine similarity near 1 instead of near 0</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-aniso','Vector length varies but is not the defining symptom; direction crowding is.')">All vectors have exactly unit length</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-aniso','Sense clusters still exist; the problem is a shared offset inflating all cosines.')">Sense clusters disappear entirely</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-aniso','Anisotropy is a geometric property of the embeddings, not a training divergence.')">The training loss diverges</button>
</div><div class="quiz-explain" id="qml-aniso-explain"></div></div>`;

// ── 10.4 FINETUNING ────────────────────────────────────────
ML_PAGES.finetune = `
<div class="lesson-chapter-label">Section 10.4</div>
<h1 class="lesson-h1">Finetuning With a Task Head</h1>
<p class="lesson-intro">Pretraining gives the encoder general-purpose representations; finetuning turns them into a system for a specific task. The procedure is the task-head option from the comparison in Section 9.1: keep the pretrained encoder, add a small task-specific classifier, called a <strong>head</strong>, on top of its outputs, and train on labeled data for the task. The head is tiny, often a single weight matrix, and the labeled dataset can be small, because the hard work of representing language was already done during pretraining. The encoder&rsquo;s own weights are either frozen or updated with a small learning rate.</p>

<h2 class="lesson-h2">Sequence Classification</h2>
<p class="lesson-p">For tasks with one label per input, such as sentiment classification, the standard summary of the whole sequence is the final [CLS] vector, the same vector NSP used in Section 10.2.2. During finetuning it learns to aggregate whatever the task needs from the rest of the sequence, which it can do because [CLS] attends to every token. The head is a single matrix mapping that vector to K class logits:</p>
<div class="lesson-math" id="ml-ft-cls">\\[\\mathbf{y} = \\mathrm{softmax}\\big(\\mathbf{z}_{CLS}\\, \\mathbf{W}_C\\big), \\qquad \\mathbf{W}_C \\in \\mathbb{R}^{d \\times K}\\]</div>
<p class="lesson-p">Training minimizes classification cross-entropy against the gold labels, exactly the multiclass setup from logistic regression, with the encoder supplying the features.</p>

<h2 class="lesson-h2">Sentence-Pair Classification</h2>
<p class="lesson-p">Tasks over two sentences use the same machinery with the pair-input format of Section 10.2.2: [CLS], premise, [SEP], hypothesis, [SEP], with segment embeddings distinguishing the two. The canonical example is <strong>natural language inference</strong> (NLI): decide whether the premise entails the hypothesis, contradicts it, or neither (neutral). Because [CLS] attends across the [SEP] boundary, its vector can encode the relationship between the sentences, not just their individual contents, and a three-way head on it makes the decision. The bench below has both heads mounted on one frozen encoder. Switch heads and inputs, and note that everything below the head, the entire encoder, is shared and unchanged between the two tasks; that reuse is the economic argument for the whole paradigm.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Head-Swapping Bench</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
      <button class="bench-mode" data-m="sent" onclick="benchMode('sent')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">sentiment head</button>
      <button class="bench-mode" data-m="nli" onclick="benchMode('nli')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">NLI head</button>
    </div>
    <div id="bench-inputs" style="display:flex;flex-direction:column;gap:6px;margin-bottom:1rem"></div>
    <canvas id="bench-canvas" width="640" height="240" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="bench-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.2rem"></div>
  </div>
</div>

<div class="quiz-block" id="qml-ft"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can the [CLS] vector serve as a summary of the whole input?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qml-ft','Correct. With bidirectional attention, [CLS] attends to every token in the input, and during finetuning its representation learns to aggregate the information the task head needs.')">Bidirectional attention lets it read every token, and finetuning teaches it to aggregate</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-ft','[CLS] is a special placeholder token with no fixed dictionary meaning.')">Because [CLS] is a common English word</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-ft','It sits at position 0, but position alone confers nothing; attention access does.')">Because the first position is always most important</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-ft','Its embedding is trained like every other parameter.')">Because its embedding is fixed at zero</button>
</div><div class="quiz-explain" id="qml-ft-explain"></div></div>`;

// ── 10.5 NAMED ENTITY RECOGNITION ──────────────────────────
ML_PAGES.ner = `
<div class="lesson-chapter-label">Section 10.5</div>
<h1 class="lesson-h1">Named Entity Recognition</h1>
<p class="lesson-intro">Sequence classification produces one label per input. The other major finetuning pattern is <strong>sequence labeling</strong>: one label per token. Its canonical task is named entity recognition (NER), finding the spans of text that name entities and typing them, most commonly as persons (PER), organizations (ORG), locations (LOC), and geopolitical entities (GPE), often extended with dates, times, and monetary amounts. NER is harder than it first appears for two reasons: <strong>segmentation</strong>, since entities are multi-token spans whose boundaries must be found, and <strong>type ambiguity</strong>, since the same string can name different kinds of entity. The string Jordan can be a person, a country, a river, or the metonymic name of a government, and only context decides which.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Entity Highlighter</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:.8rem" id="ner-presets"></div>
    <input id="ner-input" type="text" value="Priya Raghunathan of Meridian Freight Holdings closed the deal with Jordan on Tuesday for $4 million" oninput="nerRender()" style="width:100%;background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.6rem .8rem;font-family:var(--mono);font-size:.74rem;box-sizing:border-box">
    <div id="ner-out" style="background:var(--panel);border-radius:10px;padding:1rem;font-family:var(--mono);font-size:.78rem;line-height:2.1;color:#ECF1FF;margin-top:.8rem;min-height:3rem"></div>
    <div id="ner-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.7rem;line-height:1.6">Edit the sentence, or use the Jordan presets to see the same string receive different entity types from context.</div>
  </div>
</div>

<h2 class="lesson-h2">BIO Tagging: Spans as Per-Token Labels</h2>
<p class="lesson-p">A per-token classifier outputs one label per token, but entities are spans. The <strong>BIO scheme</strong> bridges the mismatch by encoding spans in the labels themselves: the first token of an entity of type T is tagged B-T (begin), subsequent tokens of the same entity are tagged I-T (inside), and every non-entity token is tagged O (outside). Span finding is thereby recast as ordinary per-token classification, and the spans are recovered by reading the tags left to right. Two variants trade off simplicity against information. The IO scheme drops the B/I distinction, which loses the boundary between two adjacent entities of the same type. The BIOES scheme adds E (end) and S (single-token entity) tags, marking boundaries even more explicitly at the cost of a larger tag set. Switch schemes below and watch the same spans re-encode.</p>
<p class="lesson-p">One further practical wrinkle comes from subword tokenization: a single word such as Raghunathan may be split into pieces like Rag and ##hun, but gold labels are per word. The standard convention assigns the word&rsquo;s tag to all of its subwords during training, and at decoding time reads the prediction from the first subword of each word, ignoring the rest. The subword panel in the demonstration shows both directions of that convention.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; BIO Encoding</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
      <button class="bio-mode" data-m="IO" onclick="bioMode('IO')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">IO</button>
      <button class="bio-mode" data-m="BIO" onclick="bioMode('BIO')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">BIO</button>
      <button class="bio-mode" data-m="BIOES" onclick="bioMode('BIOES')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">BIOES</button>
      <label style="font-family:var(--mono);font-size:.66rem;color:var(--muted);display:flex;align-items:center;gap:6px;margin-left:auto"><input type="checkbox" id="bio-sub" onchange="bioRender()"> show subword alignment</label>
    </div>
    <div id="bio-out" style="background:var(--panel);border-radius:10px;padding:1rem;font-family:var(--mono);font-size:.7rem;line-height:1.9;color:#ECF1FF;min-height:5rem"></div>
    <div id="bio-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.7rem;line-height:1.6"></div>
  </div>
</div>

<h2 class="lesson-h2">The NER Head and Entity-Level F1</h2>
<p class="lesson-p">The finetuning architecture is the per-token analogue of Section 10.4: instead of one head on [CLS], a shared classifier is applied to <em>every</em> token&rsquo;s output vector, producing a distribution over the tag set at each position, with the tag chosen by argmax:</p>
<div class="lesson-math" id="ml-ner-head">\\[\\mathbf{y}_i = \\mathrm{softmax}\\big(\\mathbf{z}_i\\, \\mathbf{W}_T\\big), \\qquad t_i = \\operatorname*{argmax}_{k}\\; \\mathbf{y}_i[k]\\]</div>
<p class="lesson-p">Evaluation, however, is not per-token accuracy, which would be inflated by the overwhelming majority of easy O tags. NER is scored at the <strong>entity level</strong> with the precision, recall, and F1 defined earlier: a predicted entity counts as correct only if both its span boundaries and its type exactly match a gold entity. This makes the metric strict in a specific way worth internalizing: if the gold entity is Priya Raghunathan (PER) and the system tags only Priya (PER), the prediction is not partially right. It is a false positive (the system produced an entity that matches no gold entity) and simultaneously a false negative (a gold entity was not produced), so one boundary mistake costs twice:</p>
<div class="lesson-math" id="ml-ner-f1">\\[P = \\frac{\\text{correct entities}}{\\text{predicted entities}}, \\qquad R = \\frac{\\text{correct entities}}{\\text{gold entities}}, \\qquad F_1 = \\frac{2PR}{P + R}\\]</div>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Entity-Level Scoring</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
      <button class="nf1-mode" data-m="partial" onclick="nf1Mode('partial')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">system A: partial boundary</button>
      <button class="nf1-mode" data-m="exact" onclick="nf1Mode('exact')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">system B: exact match</button>
    </div>
    <div id="nf1-out" style="background:var(--panel);border-radius:10px;padding:1rem;font-family:var(--mono);font-size:.72rem;line-height:1.9;color:#ECF1FF;min-height:6rem"></div>
    <div id="nf1-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.7rem;line-height:1.6"></div>
  </div>
</div>

<div class="quiz-block" id="qml-ner"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Under entity-level scoring, what does tagging only &ldquo;Priya&rdquo; when the gold entity is &ldquo;Priya Raghunathan&rdquo; count as?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qml-ner','Correct. The predicted span matches no gold entity (false positive) and the gold entity was not produced (false negative), so a single boundary error is penalized twice.')">Both a false positive and a false negative</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-ner','Entity-level scoring has no partial credit; boundaries and type must match exactly.')">A half-correct prediction</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-ner','It is also a false negative: the gold entity Priya Raghunathan was never produced.')">Only a false positive</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-ner','It is also a false positive: the span Jane matches no gold entity.')">Only a false negative</button>
</div><div class="quiz-explain" id="qml-ner-explain"></div></div>`;

// ── 10.6 CHAPTER RECAP ─────────────────────────────────────
ML_PAGES.mlrecap = `
<div class="lesson-chapter-label">Section 10.6</div>
<h1 class="lesson-h1">Recap</h1>
<p class="lesson-intro">Compare the two simplified pipelines. Their main differences here are the attention mask, training objective, and output head. Select a stage to revisit the relevant lesson.</p>

<h2 class="lesson-h2">The Encoder Pipeline Beside the Decoder Pipeline</h2>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Two Uses of One Architecture</span></div>
  <div class="viz-body">
    <canvas id="mlr-canvas" width="640" height="280" style="width:100%;max-width:640px;display:block;margin:0 auto;cursor:pointer"></canvas>
    <div id="mlr-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;text-align:center;min-height:1.8rem">Click a labeled stage to open its section.</div>
  </div>
</div>

<p class="lesson-p">To restate it in order. An encoder is the standard transformer with the causal mask removed, so every token&rsquo;s representation is conditioned on both sides of its context. Because unmasked next-word prediction would let the model copy the answer, pretraining instead masks tokens and reconstructs them, with the 80/10/10 corruption rule ensuring the model represents every position rather than only marked ones; BERT&rsquo;s additional next-sentence objective introduced [CLS], [SEP], and segment embeddings, which outlived the objective itself. Multilingual variants share one model across a hundred languages, using exponential reweighting with &alpha; = 0.3 to keep the tokenizer fair, at the documented costs of the multilinguality tradeoff and representation bias toward high-resource languages. The trained encoder produces a distinct vector for every word instance, so senses separate into clusters, enabling nearest-neighbor sense disambiguation once anisotropy is corrected by per-dimension standardization. Finetuning adds small heads: one softmax on [CLS] for sequence and sentence-pair classification, or one softmax per token for sequence labeling, with BIO tags encoding spans and entity-level F1, which double-counts boundary errors, as the standard metric.</p>

<div class="quiz-block" id="qml-recap"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">At which two points do the encoder and decoder pipelines differ?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qml-recap','Correct. The blocks, embeddings, and residual stream are shared; the encoder removes the causal mask and replaces the next-token head with MLM pretraining heads or finetuned task heads.')">The attention mask, and the heads on top of the final vectors</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-recap','The feedforward layers and layer norms are identical in both.')">The feedforward layers and the layer norms</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-recap','Both use subword tokenization; BERT uses WordPiece, but tokenizer choice is not the architectural fork.')">The tokenizer and the optimizer</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qml-recap','Both use the same residual-stream block design.')">The residual stream and the block count</button>
</div><div class="quiz-explain" id="qml-recap-explain"></div></div>`;

// ── ML EQUATIONS ───────────────────────────────────────────
ML_EQ.bidir = { 'ml-bidir-head': '\\mathrm{head} = \\mathrm{softmax}(\\mathbf{Q}\\mathbf{K}^{\\top}/\\sqrt{d_k})\\mathbf{V}' };
ML_EQ.mlm = {
  'ml-mlm-head': '\\mathbf{y}_i = \\mathrm{softmax}(\\mathbf{z}_i \\mathbf{E}^{\\top})',
  'ml-mlm-loss': 'L_{MLM}(\\theta) = -\\frac{1}{|M|}\\sum_{i \\in M} \\log p_\\theta(x_i \\mid \\mathbf{z}_i)'
};
ML_EQ.nsp = {
  'ml-nsp-input': '\\mathbf{X}[i] = \\mathbf{E}_{tok}(x_i) + \\mathbf{E}_{pos}(i) + \\mathbf{E}_{seg}(s_i)',
  'ml-nsp-head': '\\mathbf{y} = \\mathrm{softmax}(\\mathbf{z}_{CLS} \\mathbf{W}_{NSP})'
};
ML_EQ.multiling = { 'ml-alpha': 'p_i = q_i^{\\alpha} / \\textstyle\\sum_j q_j^{\\alpha}' };
ML_EQ.wsd = {
  'ml-wsd-avg': '\\mathbf{v}_s = \\frac{1}{n_s}\\sum_{i : \\mathrm{sense}(i)=s} \\mathbf{z}_i',
  'ml-wsd-argmax': '\\hat{s} = \\mathrm{argmax}_s \\cos(\\mathbf{z}, \\mathbf{v}_s)'
};
ML_EQ.aniso = {
  'ml-aniso-stats': '\\mu_d, \\sigma_d \\text{ over a corpus}',
  'ml-aniso-z': '\\hat{z}_{i,d} = (z_{i,d} - \\mu_d)/\\sigma_d'
};
ML_EQ.finetune = { 'ml-ft-cls': '\\mathbf{y} = \\mathrm{softmax}(\\mathbf{z}_{CLS} \\mathbf{W}_C)' };
ML_EQ.ner = {
  'ml-ner-head': '\\mathbf{y}_i = \\mathrm{softmax}(\\mathbf{z}_i \\mathbf{W}_T)',
  'ml-ner-f1': 'F_1 = 2PR/(P+R)'
};


// ── 10.0 VIZ: GENERATE VS REPRESENT ────────────────────────
const GVU_SENT=['the','plant','will','open','next','month'];
let _gvu={ t:-1, anim:null };
function gvuBuild(){ _gvu.t=-1; gvuDraw(); }
function gvuRun(){
  if(_gvu.anim) cancelAnimationFrame(_gvu.anim);
  const t0=performance.now();
  const loop=now=>{ _gvu.t=Math.min(1,(now-t0)/2200); gvuDraw(); if(_gvu.t<1) _gvu.anim=requestAnimationFrame(loop); else _gvu.anim=null; };
  _gvu.anim=requestAnimationFrame(loop);
}
function gvuDraw(){
  const cv=document.getElementById('gvu-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, t=_gvu.t;
  ctx.clearRect(0,0,W,H);
  const midX=W/2;
  ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(midX,14); ctx.lineTo(midX,H-14); ctx.stroke();
  ctx.fillStyle='rgba(255,95,142,0.8)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('DECODER \u00b7 causal \u00b7 produces text',18,24);
  ctx.fillStyle='rgba(77,227,255,0.85)';
  ctx.fillText('ENCODER \u00b7 bidirectional \u00b7 produces vectors',midX+18,24);
  const n=GVU_SENT.length;
  // left: sequential emission
  const lw=(midX-40)/n, ly=H*0.55;
  const emitted=t<0?0:Math.floor(t*n+0.001);
  for(let i=0;i<n;i++){
    const x=24+i*lw+lw/2, on=i<emitted;
    ctx.fillStyle=on?'rgba(255,95,142,0.28)':'rgba(255,255,255,0.04)';
    roundRect(ctx,x-lw*0.44,ly-13,lw*0.88,26,5); ctx.fill();
    ctx.strokeStyle=on?'rgba(255,95,142,0.6)':'rgba(255,255,255,0.1)'; ctx.lineWidth=1;
    roundRect(ctx,x-lw*0.44,ly-13,lw*0.88,26,5); ctx.stroke();
    ctx.fillStyle=on?'#fff':'rgba(255,255,255,0.2)'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText(GVU_SENT[i],x,ly+4);
    if(on && i>0){ ctx.strokeStyle='rgba(255,95,142,0.4)'; ctx.beginPath(); ctx.moveTo(x-lw,ly-18); ctx.quadraticCurveTo(x-lw/2,ly-32,x,ly-18); ctx.stroke(); }
  }
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText(t>=0?('tokens emitted: '+emitted+' / '+n+' \u00b7 one at a time, left to right'):'press Run',24,ly+40);
  // right: simultaneous vectors
  const rw=(midX-40)/n, ry=H*0.62;
  const enc=t>=0.25;
  for(let i=0;i<n;i++){
    const x=midX+24+i*rw+rw/2;
    ctx.fillStyle='rgba(255,255,255,0.06)';
    roundRect(ctx,x-rw*0.44,ry-13,rw*0.88,26,5); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
    roundRect(ctx,x-rw*0.44,ry-13,rw*0.88,26,5); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText(GVU_SENT[i],x,ry+4);
    if(enc){
      // vector strip above each token, all at once
      for(let c=0;c<4;c++){
        const v=Math.sin(i*2.1+c*1.3);
        ctx.fillStyle=v>=0?'rgba(77,227,255,'+(0.25+Math.abs(v)*0.5)+')':'rgba(160,140,255,'+(0.25+Math.abs(v)*0.5)+')';
        ctx.fillRect(x-rw*0.34+c*(rw*0.68/4),ry-46,rw*0.68/4-1,18);
      }
      ctx.strokeStyle='rgba(77,227,255,0.35)'; ctx.beginPath(); ctx.moveTo(x,ry-26); ctx.lineTo(x,ry-15); ctx.stroke();
    }
  }
  if(enc){
    // bidirectional arcs over the middle token
    const xm=midX+24+2*rw+rw/2;
    ctx.strokeStyle='rgba(77,227,255,0.3)'; ctx.setLineDash([3,3]);
    for(const j of [0,4,5]){
      const xj=midX+24+j*rw+rw/2;
      ctx.beginPath(); ctx.moveTo(xm,ry-52); ctx.quadraticCurveTo((xm+xj)/2,ry-78,xj,ry-52); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.textAlign='left';
    ctx.fillText('all '+n+' vectors computed in one pass \u00b7 each attends both directions',midX+24,ry+40);
  } else {
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='8px monospace'; ctx.textAlign='left';
    ctx.fillText(t>=0?'encoding\u2026':'press Run',midX+24,ry+40);
  }
  const cap=document.getElementById('gvu-caption');
  if(cap && t>=1) cap.innerHTML='Same sentence, two configurations. The decoder needed '+n+' sequential steps, each conditioned only on earlier tokens; its product is the text. The encoder produced all '+n+' representation vectors in one parallel pass, each conditioned on the whole sentence; its product is the vectors.';
}

// ── 10.1 VIZ: REMOVING THE CAUSAL MASK ─────────────────────
const BAM_TOK=['the','plant','will','open','next','month'];
let _bam={ mode:'causal', sel:3, scores:null };
function bamBuild(){
  const n=BAM_TOK.length; _bam.scores=[];
  for(let i=0;i<n;i++){ const r=[]; for(let j=0;j<n;j++) r.push(0.4+Math.abs(Math.sin(i*3.7+j*1.9))*2.0+(i===j?0.7:0)); _bam.scores.push(r); }
  const cv=document.getElementById('bam-canvas');
  if(cv) cv.onclick=e=>{
    const r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(cv.width/r.width), my=(e.clientY-r.top)*(cv.height/r.height);
    // token row hit test (arrow row)
    const n2=BAM_TOK.length, pad=90, bw=(cv.width-pad-30)/n2;
    if(my>30&&my<70){ const i=Math.floor((mx-pad)/bw); if(i>=0&&i<n2){ _bam.sel=i; bamDraw(); } }
  };
  bamMode(_bam.mode);
}
function bamMode(m){
  _bam.mode=m;
  document.querySelectorAll('.bam-mode').forEach(b=>{ const on=b.dataset.m===m; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  bamDraw();
}
function bamDraw(){
  const cv=document.getElementById('bam-canvas'); if(!cv||!_bam.scores) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const n=BAM_TOK.length, pad=90, bw=(W-pad-30)/n, yTok=52, causal=_bam.mode==='causal', sel=_bam.sel;
  // arrows into selected token
  for(let j=0;j<n;j++){
    if(j===sel) continue;
    const allowed=causal?(j<sel):true;
    if(!allowed) continue;
    const xa=pad+sel*bw+bw/2, xj=pad+j*bw+bw/2;
    ctx.strokeStyle=j<sel?'rgba(77,227,255,0.55)':'rgba(255,140,66,0.6)';
    ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(xj,yTok-16); ctx.quadraticCurveTo((xa+xj)/2,yTok-16-14-Math.abs(xa-xj)*0.1,xa,yTok-16); ctx.stroke();
    ctx.beginPath(); ctx.arc(xa,yTok-16,2.2,0,2*Math.PI);
    ctx.fillStyle=j<sel?'rgba(77,227,255,0.8)':'rgba(255,140,66,0.85)'; ctx.fill();
  }
  // token row
  for(let i=0;i<n;i++){
    const x=pad+i*bw+bw/2, isSel=i===sel;
    ctx.fillStyle=isSel?'rgba(255,95,142,0.3)':'rgba(255,255,255,0.06)';
    roundRect(ctx,x-bw*0.44,yTok-14,bw*0.88,28,6); ctx.fill();
    ctx.strokeStyle=isSel?'rgba(255,95,142,0.8)':'rgba(255,255,255,0.15)'; ctx.lineWidth=isSel?1.6:1;
    roundRect(ctx,x-bw*0.44,yTok-14,bw*0.88,28,6); ctx.stroke();
    ctx.fillStyle=isSel?'#ff8aa0':'rgba(255,255,255,0.75)'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText(BAM_TOK[i],x,yTok+4);
  }
  // grid
  const gTop=100, gs=Math.min(bw,(H-gTop-30)/n);
  for(let i=0;i<n;i++){
    let row=[];
    for(let j=0;j<n;j++){ let v=_bam.scores[i][j]; if(causal&&j>i) v=-Infinity; row.push(v); }
    const valid=row.filter(v=>v>-Infinity), mx=Math.max(...valid);
    const ex=row.map(v=>v===-Infinity?0:Math.exp(v-mx)), Z=ex.reduce((a,b)=>a+b,0);
    const soft=ex.map(e=>e/Z);
    for(let j=0;j<n;j++){
      const x=pad+j*bw+(bw-gs)/2+2, y=gTop+i*gs;
      const blocked=causal&&j>i;
      if(blocked){
        ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.fillRect(x,y,gs-3,gs-3);
        ctx.fillStyle='rgba(255,95,142,0.4)'; ctx.font='9px monospace'; ctx.textAlign='center';
        ctx.fillText('\u2212\u221e',x+gs/2,y+gs/2+3);
      } else {
        ctx.fillStyle='rgba(77,227,255,'+(0.08+soft[j]*0.85)+')'; ctx.fillRect(x,y,gs-3,gs-3);
        if(gs>26){ ctx.fillStyle=soft[j]>0.5?'#050A1C':'rgba(255,255,255,0.7)'; ctx.font='8px monospace'; ctx.textAlign='center';
          ctx.fillText(soft[j].toFixed(2),x+gs/2,y+gs/2+3); }
      }
      if(i===sel){ ctx.strokeStyle='rgba(255,95,142,0.55)'; ctx.lineWidth=1; ctx.strokeRect(x,y,gs-3,gs-3); }
    }
    ctx.fillStyle=i===sel?'#ff8aa0':'rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='right';
    ctx.fillText(BAM_TOK[i],pad-8,gTop+i*gs+gs/2+3);
  }
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('row = query token \u00b7 softmax over allowed positions \u00b7 selected row outlined',pad,H-8);
  const cap=document.getElementById('bam-caption');
  if(cap){
    const w=BAM_TOK[sel];
    if(causal) cap.innerHTML='Causal mode: the upper triangle is blocked, so &ldquo;'+w+'&rdquo; receives information only from its left (teal arrows). Its representation cannot use anything after it'+(sel===3?' \u2014 including &ldquo;next month&rdquo;, the words that establish that &ldquo;open&rdquo; is a verb here':'')+'.';
    else cap.innerHTML='Bidirectional mode: every cell of the grid is live and each row renormalizes over all six positions. &ldquo;'+w+'&rdquo; now receives information from both directions (orange arrows reach right)'+(sel===3?', so the representation of &ldquo;open&rdquo; is conditioned on &ldquo;next month&rdquo; as well as &ldquo;the plant will&rdquo;':'')+'. This one change is the entire difference from a decoder transformer.';
  }
}

// ── 10.1 VIZ: MODEL SIZES ──────────────────────────────────
const MSC_MODELS=[
  ['BERT base','#4DE3FF',110e6,'encoder \u00b7 12 layers \u00b7 d = 768 \u00b7 12 heads \u00b7 30K WordPiece vocab \u00b7 512-token inputs'],
  ['XLM-R large','#A18FFF',550e6,'multilingual encoder \u00b7 24 layers \u00b7 d = 1024 \u00b7 250K SentencePiece vocab \u00b7 ~100 languages'],
  ['Llama 3.1','#FF5F8E',405e9,'decoder \u00b7 126 layers \u00b7 d = 16384 \u00b7 shown for scale']
];
let _msc={ sel:0 };
function mscBuild(){
  const cv=document.getElementById('msc-canvas');
  if(cv) cv.onclick=e=>{
    const r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(cv.width/r.width);
    const bw=cv.width/3;
    _msc.sel=Math.max(0,Math.min(2,Math.floor(mx/bw)));
    mscDraw();
  };
  mscDraw();
}
function mscDraw(){
  const cv=document.getElementById('msc-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const lg0=7.6, lg1=11.8, bot=H-44, top=24;
  const Yh=p=>{ const lg=Math.log10(p); return (lg-lg0)/(lg1-lg0)*(bot-top); };
  MSC_MODELS.forEach(([name,col,p,desc],i)=>{
    const cx=W/6+i*(W/3), h=Yh(p), sel=i===_msc.sel;
    ctx.fillStyle=col; ctx.globalAlpha=sel?0.85:0.4;
    ctx.fillRect(cx-38,bot-h,76,h); ctx.globalAlpha=1;
    if(sel){ ctx.strokeStyle=col; ctx.lineWidth=2; ctx.strokeRect(cx-38,bot-h,76,h); }
    ctx.fillStyle=sel?col:'rgba(255,255,255,0.55)'; ctx.font=(sel?'bold ':'')+'10px monospace'; ctx.textAlign='center';
    ctx.fillText(name,cx,bot+16);
    const fmt=p>=1e9?(p/1e9).toFixed(0)+'B':(p/1e6).toFixed(0)+'M';
    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='9px monospace';
    ctx.fillText(fmt+' params',cx,bot-h-8);
  });
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('log parameter scale',14,16);
  const cap=document.getElementById('msc-caption');
  const m=MSC_MODELS[_msc.sel];
  if(cap){
    let extra='';
    if(_msc.sel===0) extra=' Small enough to finetune on one GPU, which is central to the recipes of Section 10.4.';
    if(_msc.sel===1) extra=' Most of the extra size over BERT is the 250K-item vocabulary needed to cover a hundred scripts (Section 10.2.3).';
    if(_msc.sel===2) extra=' Roughly a thousand times BERT: the bars are on a log scale, so the visual gap understates the ratio.';
    cap.innerHTML='<b style="color:'+m[1]+'">'+m[0]+'</b> \u00b7 '+m[3]+'.'+extra;
  }
}

// ── 10.2 VIZ: CLOZE TRAINER ────────────────────────────────
const CLOZE_TOK=['the','waiter','brought','the','lunch','to','our','table'];
const CLOZE_PRED={
  1:{ both:[['waiter',.52],['server',.23],['chef',.08]], left:[['sun',.07],['man',.06],['dog',.05]] },
  2:{ both:[['brought',.46],['served',.24],['carried',.09]], left:[['was',.13],['and',.08],['had',.07]] },
  4:{ both:[['lunch',.58],['food',.14],['order',.08]], left:[['bill',.19],['menu',.16],['food',.13]] },
  7:{ both:[['table',.64],['booth',.12],['seats',.07]], left:[['table',.20],['left',.13],['door',.10]] }
};
let _cloze={ masked:[2,4] };
function clozeBuild(){ clozeGo(); }
function clozeGo(){
  const keys=Object.keys(CLOZE_PRED).map(Number);
  const a=keys[Math.floor(Math.random()*keys.length)];
  let b=keys[Math.floor(Math.random()*keys.length)];
  if(b===a) b=keys[(keys.indexOf(a)+1)%keys.length];
  _cloze.masked=[a,b].sort((x,y)=>x-y);
  clozeDraw();
}
function clozeDraw(){
  const cv=document.getElementById('cloze-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const cb=document.getElementById('cloze-left');
  const leftOnly=cb?cb.checked:false;
  const n=CLOZE_TOK.length, pad=24, bw=(W-2*pad)/n, yTok=H-40;
  const firstMask=Math.min(..._cloze.masked);
  for(let i=0;i<n;i++){
    const x=pad+i*bw+bw/2;
    const isM=_cloze.masked.includes(i);
    const hidden=leftOnly&&!isM&&i>firstMask;
    ctx.fillStyle=isM?'rgba(255,95,142,0.3)':(hidden?'rgba(255,255,255,0.02)':'rgba(255,255,255,0.07)');
    roundRect(ctx,x-bw*0.44,yTok-14,bw*0.88,28,6); ctx.fill();
    ctx.strokeStyle=isM?'rgba(255,95,142,0.8)':(hidden?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.16)'); ctx.lineWidth=1;
    roundRect(ctx,x-bw*0.44,yTok-14,bw*0.88,28,6); ctx.stroke();
    ctx.fillStyle=isM?'#ff8aa0':(hidden?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.8)'); ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText(isM?'[MASK]':(hidden?'\u00b7\u00b7\u00b7':CLOZE_TOK[i]),x,yTok+4);
  }
  // predictions
  let sumTop=0;
  _cloze.masked.forEach((mi,k)=>{
    const preds=leftOnly?CLOZE_PRED[mi].left:CLOZE_PRED[mi].both;
    const x=pad+mi*bw+bw/2;
    const bx=Math.max(10,Math.min(W-120,x-55)), by=26;
    ctx.strokeStyle='rgba(255,95,142,0.35)'; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(x,yTok-16); ctx.lineTo(bx+55,by+70); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='7px monospace'; ctx.textAlign='left';
    ctx.fillText('p(x'+(mi+1)+' | context)',bx,by-6);
    preds.forEach(([w,p],r)=>{
      const y=by+r*22;
      const correct=w===CLOZE_TOK[mi];
      ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(bx,y,110,16);
      ctx.fillStyle=correct?'rgba(61,220,132,0.7)':'rgba(160,140,255,0.5)';
      ctx.fillRect(bx,y,110*p/0.7,16);
      ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.font='8px monospace';
      ctx.fillText(w+'  '+(p*100).toFixed(0)+'%',bx+4,y+11);
    });
    sumTop+=preds[0][1]*(preds[0][0]===CLOZE_TOK[mi]?1:0);
  });
  const cap=document.getElementById('cloze-caption');
  if(cap){
    if(!leftOnly) cap.innerHTML='Both sides visible: the top prediction at each blank is the original token, with high probability. The loss is computed at the two [MASK] positions only; the other six tokens contribute nothing.';
    else cap.innerHTML='Right-hand context hidden: the same blanks must now be filled from the left alone, and the distributions flatten. In several cases the original token is no longer the top prediction at all. The difference between the two settings is the information that bidirectionality adds.';
  }
}

// ── 10.2.1 VIZ: CORRUPTION DICE ────────────────────────────
let _mrec={ tally:{mask:0,rand:0,keep:0}, last:null };
function mrecReset(){ _mrec={tally:{mask:0,rand:0,keep:0},last:null}; mrecDraw(); const o=document.getElementById('mrec-out'); if(o) o.innerHTML='<span style="color:#8E9AC4">Press roll. The selected token is <b style="color:#ECF1FF">delicious</b>.</span>'; const c=document.getElementById('mrec-caption'); if(c) c.textContent='The target is always the original token, whatever the corruption branch.'; }
function mrecRoll(k){
  const RAND=['bicycle','seven','purple','quietly'];
  for(let i=0;i<k;i++){
    const r=Math.random();
    if(r<0.8){ _mrec.tally.mask++; _mrec.last='mask'; }
    else if(r<0.9){ _mrec.tally.rand++; _mrec.last=RAND[Math.floor(Math.random()*RAND.length)]; }
    else { _mrec.tally.keep++; _mrec.last='keep'; }
  }
  const o=document.getElementById('mrec-out');
  if(o){
    let tok, note;
    if(_mrec.last==='mask'){ tok='<span style="background:rgba(255,95,142,0.25);border:1px solid rgba(255,95,142,0.6);border-radius:5px;padding:0 .35rem;color:#ff8aa0">[MASK]</span>'; note='replaced by [MASK] (p = 0.8)'; }
    else if(_mrec.last==='keep'){ tok='<span style="border-bottom:2px solid #3DDC84">delicious</span>'; note='left unchanged (p = 0.1) \u2014 but still predicted'; }
    else { tok='<span style="background:rgba(255,140,66,0.22);border:1px solid rgba(255,140,66,0.6);border-radius:5px;padding:0 .35rem;color:#ffb37e">'+_mrec.last+'</span>'; note='replaced by a random token (p = 0.1)'; }
    o.innerHTML='lunch was '+tok+' &nbsp;<span style="color:#8E9AC4;font-size:.66rem">'+note+' \u00b7 training target: <b style="color:#ECF1FF">delicious</b></span>';
  }
  mrecDraw();
  const c=document.getElementById('mrec-caption');
  if(c){
    if(_mrec.last==='mask') c.textContent='The common case. Alone, it would let the model neglect every position that is not marked [MASK].';
    else if(_mrec.last==='keep') c.textContent='Unchanged, yet still predicted: since any normal-looking token might be a target, the model must represent every position well. This is the case that matches downstream inputs, which never contain [MASK].';
    else c.textContent='A random replacement: the model must detect that the visible token does not fit its context and predict what belongs there, rather than trusting the input.';
  }
}
function mrecDraw(){
  const cv=document.getElementById('mrec-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const t=_mrec.tally, total=t.mask+t.rand+t.keep;
  const rows=[['\u2192 [MASK]',t.mask,0.8,'#FF5F8E'],['\u2192 random token',t.rand,0.1,'#ff8c42'],['\u2192 unchanged',t.keep,0.1,'#3DDC84']];
  rows.forEach(([lab,c,exp,col],i)=>{
    const y=20+i*40;
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText(lab,16,y+12);
    const bw2=380, bx=150;
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(bx,y,bw2,16);
    const frac=total>0?c/total:0;
    ctx.fillStyle=col; ctx.globalAlpha=0.75; ctx.fillRect(bx,y,bw2*frac,16); ctx.globalAlpha=1;
    // expected tick
    ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.moveTo(bx+bw2*exp,y-3); ctx.lineTo(bx+bw2*exp,y+19); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='8px monospace';
    ctx.fillText(c+' ('+(total>0?(frac*100).toFixed(0):0)+'%)',bx+bw2+10,y+12);
  });
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace';
  ctx.fillText('white ticks: expected 80 / 10 / 10 \u00b7 rolls: '+total,16,H-8);
}

// ── 10.2.2 VIZ: NSP ────────────────────────────────────────
const NSP_A='The dog chased the ball across the yard.';
const NSP_NEXT='It bounced twice and rolled under the fence.';
const NSP_RAND=['The recipe calls for two cups of flour.','Quarterly earnings rose by eight percent.'];
let _nsp={ isNext:true, b:NSP_NEXT, rolled:false };
function nspBuild(){ _nsp.rolled=false; nspDraw(); }
function nspFlip(){
  _nsp.isNext=Math.random()<0.5;
  _nsp.b=_nsp.isNext?NSP_NEXT:NSP_RAND[Math.floor(Math.random()*NSP_RAND.length)];
  _nsp.rolled=true;
  nspDraw();
}
function nspDraw(){
  const cv=document.getElementById('nsp-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  if(!_nsp.rolled){
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText('press the button to construct a training pair',W/2,H/2);
    return;
  }
  // sentence boxes
  ctx.fillStyle='rgba(77,227,255,0.1)'; roundRect(ctx,16,14,W-32,26,6); ctx.fill();
  ctx.strokeStyle='rgba(77,227,255,0.4)'; ctx.lineWidth=1; roundRect(ctx,16,14,W-32,26,6); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('A: '+NSP_A,26,31);
  const bc=_nsp.isNext?'rgba(61,220,132':'rgba(255,140,66';
  ctx.fillStyle=bc+',0.1)'; roundRect(ctx,16,46,W-32,26,6); ctx.fill();
  ctx.strokeStyle=bc+',0.5)'; roundRect(ctx,16,46,W-32,26,6); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.8)';
  ctx.fillText('B: '+_nsp.b,26,63);
  ctx.fillStyle=bc+',0.9)'; ctx.font='8px monospace'; ctx.textAlign='right';
  ctx.fillText(_nsp.isNext?'drawn as the ACTUAL next sentence':'drawn at RANDOM from the corpus',W-24,63);
  // token + embedding strip: [CLS] A... [SEP] B... [SEP]
  const cells=['[CLS]','A','A','A','[SEP]','B','B','B','[SEP]'];
  const segOf=['A','A','A','A','A','B','B','B','B'];
  const sw=(W-120)/cells.length, sx=100, rows=[['token',c=>c==='[CLS]'||c==='[SEP]'?'rgba(253,224,71,':'rgba(160,140,255,'],['+ position',()=>'rgba(255,255,255,'],['+ segment',(c,i)=>segOf[i]==='A'?'rgba(77,227,255,':'rgba(255,140,66,']];
  rows.forEach(([lab,colFn],ri)=>{
    const y=96+ri*26;
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.textAlign='right';
    ctx.fillText(lab,sx-8,y+14);
    cells.forEach((c,i)=>{
      const a=ri===1?(0.12+i*0.055):0.4;
      ctx.fillStyle=colFn(c,i)+a+')';
      ctx.fillRect(sx+i*sw,y,sw-2,20);
      if(ri===0){ ctx.fillStyle='rgba(13,20,23,0.9)'; ctx.font='7px monospace'; ctx.textAlign='center'; ctx.fillText(c,sx+i*sw+sw/2,y+13); }
    });
  });
  // sum row
  const ySum=96+3*26+6;
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.textAlign='right';
  ctx.fillText('= input X',sx-8,ySum+14);
  cells.forEach((c,i)=>{
    ctx.fillStyle='rgba(233,238,236,'+(0.18+Math.abs(Math.sin(i*2.2))*0.3)+')';
    ctx.fillRect(sx+i*sw,ySum,sw-2,20);
  });
  // CLS -> head -> verdict
  const cx=sx+sw/2;
  ctx.strokeStyle='rgba(253,224,71,0.6)'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(cx,ySum+22); ctx.lineTo(cx,ySum+40); ctx.lineTo(W*0.42,ySum+40); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.06)'; roundRect(ctx,W*0.42,ySum+28,120,24,6); ctx.fill();
  ctx.strokeStyle='rgba(253,224,71,0.6)'; roundRect(ctx,W*0.42,ySum+28,120,24,6); ctx.stroke();
  ctx.fillStyle='#fde047'; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText('z_CLS \u00b7 W_NSP',W*0.42+60,ySum+43);
  // bars
  const pIs=_nsp.isNext?0.93:0.09, bars=[['IsNext',pIs,'#3DDC84'],['NotNext',1-pIs,'#ff8c42']];
  bars.forEach(([lab,p,col],i)=>{
    const y=ySum+30+i*0;
    const bx=W*0.42+140, by=ySum+22+i*18;
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(bx,by,100,12);
    ctx.fillStyle=col; ctx.globalAlpha=0.8; ctx.fillRect(bx,by,100*p,12); ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.font='8px monospace'; ctx.textAlign='left';
    ctx.fillText(lab+' '+(p*100).toFixed(0)+'%',bx+104,by+9);
  });
  const cap=document.getElementById('nsp-caption');
  if(cap) cap.innerHTML=(_nsp.isNext
    ? 'An <b>IsNext</b> pair: B really followed A. Note the three embedding rows summing into the input: token, position, and the segment row switching color at the [SEP] boundary. The two-way head on the final [CLS] vector makes the call.'
    : 'A <b>NotNext</b> pair: B was sampled from elsewhere in the corpus, and the classifier detects the topic break. Pairs are constructed 50/50, so guessing achieves 50% and the head must genuinely read both segments to do better.');
}

// ── 10.2.3 VIZ: ALPHA REWEIGHTING ──────────────────────────
const MLA_LANGS=[['English',.55,'#4DE3FF'],['Chinese',.18,'#A18FFF'],['Spanish',.12,'#3DDC84'],['Hindi',.08,'#fde047'],['Swahili',.05,'#ff8c42'],['Yoruba',.02,'#FF5F8E']];
function alphaSet(v){
  const a=parseFloat(v);
  const e=document.getElementById('alpha-v'); if(e) e.textContent=a.toFixed(2);
  const cv=document.getElementById('alpha-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const qs=MLA_LANGS.map(l=>l[1]);
  const pw=qs.map(q=>Math.pow(q,a)), Z=pw.reduce((s,x)=>s+x,0);
  const ps=pw.map(x=>x/Z);
  const n=MLA_LANGS.length, bw=(W-80)/n, bot=H-40, maxH=H-70;
  MLA_LANGS.forEach(([name,q,col],i)=>{
    const x=50+i*bw;
    // raw ghost
    ctx.fillStyle='rgba(255,255,255,0.1)';
    ctx.fillRect(x,bot-q/0.6*maxH,bw*0.32,q/0.6*maxH);
    // reweighted
    ctx.fillStyle=col; ctx.globalAlpha=0.8;
    ctx.fillRect(x+bw*0.36,bot-ps[i]/0.6*maxH,bw*0.32,ps[i]/0.6*maxH); ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText(name,x+bw*0.35,bot+14);
    ctx.fillStyle=col; ctx.font='8px monospace';
    ctx.fillText((ps[i]*100).toFixed(1)+'%',x+bw*0.52,bot-ps[i]/0.6*maxH-6);
  });
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('grey: raw share q\u1d62 \u00b7 colored: sampling share p\u1d62 = q\u1d62^\u03b1 / \u03a3 q\u2c7c^\u03b1',50,16);
  const cap=document.getElementById('alpha-caption');
  if(cap){
    const yr=(ps[5]/qs[5]);
    if(a>0.9) cap.innerHTML='\u03b1 = 1: sampling matches the raw corpus. English takes '+(ps[0]*100).toFixed(0)+'% of the tokenizer training data; Yoruba gets '+(ps[5]*100).toFixed(1)+'%, and its subwords fragment.';
    else if(a>0.2) cap.innerHTML='\u03b1 = '+a.toFixed(2)+': the exponent compresses the gap. Yoruba is now sampled at '+(ps[5]*100).toFixed(1)+'%, '+yr.toFixed(1)+'\u00d7 its raw share, while English still leads. XLM-R uses \u03b1 = 0.3, near this regime. The same exponent trick set word2vec\u2019s negative-sampling distribution.';
    else cap.innerHTML='\u03b1 near 0: sampling approaches uniform, every language '+(100/6).toFixed(1)+'% regardless of size. This maximizes fairness to small languages but discards most of the English data\u2019s volume; practice settles between the extremes.';
  }
}

// ── 10.3 VIZ: CONTEXTUAL EMBEDDING MAP ─────────────────────
const CMAP_WORDS={
  die:[
    {name:'verb: to die', col:'#FF5F8E', c:[150,90],  sents:['Plants die without water.','Many stars die as supernovae.','The battery will die by noon.','Old habits die hard.','Some traditions die out slowly.']},
    {name:'noun: a die (dice)', col:'#4DE3FF', c:[470,100], sents:['He rolled the die and got a six.','Each die in the set has twenty sides.','The die came to rest on the felt.','She loaded the die as a trick.']},
    {name:'German article die', col:'#A18FFF', c:[320,225], sents:['Die Katze schl\u00e4ft auf dem Sofa.','Die Sonne scheint heute.','Die Kinder spielen drau\u00dfen.','Die Stadt ist alt.']}
  ],
  bank:[
    {name:'financial institution', col:'#FF5F8E', c:[170,100], sents:['She deposited the check at the bank.','The bank raised its interest rates.','He works at an investment bank.','The bank approved the loan.']},
    {name:'river bank', col:'#4DE3FF', c:[450,190], sents:['They picnicked on the bank of the river.','Reeds grew along the muddy bank.','The boat drifted toward the bank.','Erosion wore away the bank.']}
  ],
  bass:[
    {name:'low frequencies', col:'#FF5F8E', c:[160,95], sents:['Turn the bass down on the speakers.','The bass rattled the windows.','This song has a heavy bass line.']},
    {name:'the fish', col:'#4DE3FF', c:[470,110], sents:['He caught a striped bass at dawn.','The lake is stocked with bass.','Grilled bass was on the menu.']},
    {name:'the instrument', col:'#A18FFF', c:[320,230], sents:['She plays bass in a jazz trio.','The bass player tuned up.','He bought a used upright bass.']}
  ]
};
let _cmap={ word:'die', t:1, hover:null, pts:[] };
function cmapBuild(){
  const wc=document.getElementById('cmap-words'); if(!wc) return;
  wc.innerHTML=Object.keys(CMAP_WORDS).map(w=>'<button class="cmap-w" data-w="'+w+'" onclick="cmapWord(\''+w+'\')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.35rem .8rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">'+w+'</button>').join('');
  const cv=document.getElementById('cmap-canvas');
  if(cv){
    cv.onmousemove=e=>{
      const r=cv.getBoundingClientRect();
      const mx=(e.clientX-r.left)*(cv.width/r.width), my=(e.clientY-r.top)*(cv.height/r.height);
      let best=null, bd=18*18;
      _cmap.pts.forEach(p=>{ const d=(p.x-mx)*(p.x-mx)+(p.y-my)*(p.y-my); if(d<bd){ bd=d; best=p; } });
      if(best!==_cmap.hover){ _cmap.hover=best; cmapDraw(); }
    };
    cv.onmouseleave=()=>{ _cmap.hover=null; cmapDraw(); };
  }
  cmapWord(_cmap.word);
}
function cmapWord(w){
  _cmap.word=w; _cmap.hover=null;
  document.querySelectorAll('.cmap-w').forEach(b=>{ const on=b.dataset.w===w; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  cmapDraw();
}
function cmapSet(v){
  _cmap.t=parseFloat(v);
  const e=document.getElementById('cmap-tv'); if(e) e.textContent=_cmap.t<0.15?'static (word2vec)':(_cmap.t>0.85?'contextual':'interpolating\u2026');
  cmapDraw();
}
function cmapDraw(){
  const cv=document.getElementById('cmap-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, t=_cmap.t;
  ctx.clearRect(0,0,W,H);
  const senses=CMAP_WORDS[_cmap.word];
  // centroid of everything = the static type vector position
  let cx=0, cy=0, total=0;
  senses.forEach(s=>{ s.sents.forEach(()=>{ cx+=s.c[0]; cy+=s.c[1]; total++; }); });
  cx/=total; cy/=total;
  _cmap.pts=[];
  senses.forEach((s,si)=>{
    s.sents.forEach((sent,i)=>{
      const jx=Math.sin(si*7+i*3.1)*34, jy=Math.cos(si*5+i*2.3)*26;
      const px=cx+( (s.c[0]+jx) - cx )*t, py=cy+( (s.c[1]+jy) - cy )*t;
      _cmap.pts.push({x:px,y:py,sent,sense:s.name,col:s.col});
    });
    // sense label at cluster position (fade in with t)
    if(t>0.5){
      ctx.globalAlpha=(t-0.5)*2;
      ctx.fillStyle=s.col; ctx.font='9px monospace'; ctx.textAlign='center';
      ctx.fillText(s.name,s.c[0],s.c[1]-42);
      ctx.globalAlpha=1;
    }
  });
  // static label
  if(t<0.5){
    ctx.globalAlpha=1-t*2;
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText('the single word2vec vector for \u201c'+_cmap.word+'\u201d',cx,cy-40);
    ctx.globalAlpha=1;
  }
  _cmap.pts.forEach(p=>{
    const hov=_cmap.hover===p;
    ctx.fillStyle=p.col; ctx.globalAlpha=hov?1:0.75;
    ctx.shadowBlur=hov?10:0; ctx.shadowColor=p.col;
    ctx.beginPath(); ctx.arc(p.x,p.y,hov?7:5,0,2*Math.PI); ctx.fill();
    ctx.shadowBlur=0; ctx.globalAlpha=1;
  });
  const cap=document.getElementById('cmap-caption');
  if(cap){
    if(_cmap.hover) cap.innerHTML='<span style="color:'+_cmap.hover.col+'">'+_cmap.hover.sense+'</span> \u00b7 &ldquo;'+_cmap.hover.sent+'&rdquo; \u2014 one point, one sentence, one contextual vector.';
    else if(t<0.15) cap.innerHTML='Static view: every occurrence of &ldquo;'+_cmap.word+'&rdquo; maps to the same vector, so all senses are averaged into one point. This is the static-embedding limitation.';
    else if(t>0.85) cap.innerHTML='Contextual view: each sentence produces its own vector for &ldquo;'+_cmap.word+'&rdquo;, and the instances separate into one cluster per sense. Move the pointer near a point to read its sentence.';
    else cap.innerHTML='Interpolating between one-vector-per-type and one-vector-per-instance.';
  }
}

// ── 10.3.1 VIZ: WSD ────────────────────────────────────────
const WSD_SENSES=[
  {name:'low frequencies', col:'#FF5F8E', c:[150,80]},
  {name:'the fish',        col:'#4DE3FF', c:[500,90]},
  {name:'the instrument',  col:'#A18FFF', c:[330,120]}
];
const WSD_SENTS=[
  {txt:'Turn up the bass so the floor shakes.',   p:[175,95]},
  {txt:'He caught a four-pound bass in the lake.', p:[475,105]},
  {txt:'She plays bass in a jazz trio.',           p:[335,135]}
];
let _wsd={ sel:-1, t:0, anim:null };
function wsdBuild(){
  const h=document.getElementById('wsd-sents'); if(!h) return;
  h.innerHTML=WSD_SENTS.map((s,i)=>'<button class="wsd-s" data-i="'+i+'" onclick="wsdSent('+i+')" style="text-align:left;background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .8rem;font-family:var(--mono);font-size:.7rem;cursor:pointer">'+s.txt+'</button>').join('');
  _wsd.sel=-1; _wsd.t=0; wsdDraw();
  const cap=document.getElementById('wsd-caption');
  if(cap) cap.textContent='The three sense centroids are averages of labeled training instances. Choose a sentence to classify its instance of bass.';
}
function wsdSent(i){
  _wsd.sel=i; _wsd.t=0;
  document.querySelectorAll('.wsd-s').forEach(b=>{ const on=+b.dataset.i===i; b.style.borderColor=on?'var(--accent)':'var(--border2)'; b.style.color=on?'var(--accent)':'var(--text)'; });
  if(_wsd.anim) cancelAnimationFrame(_wsd.anim);
  const t0=performance.now();
  const loop=now=>{ _wsd.t=Math.min(1,(now-t0)/700); wsdDraw(); if(_wsd.t<1) _wsd.anim=requestAnimationFrame(loop); else _wsd.anim=null; };
  _wsd.anim=requestAnimationFrame(loop);
}
function wsdDraw(){
  const cv=document.getElementById('wsd-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const O=[60,H-30]; // origin for cosine geometry
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('\u2299',O[0],O[1]+4);
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('origin (cosines measured from here)',O[0]+12,O[1]+4);
  function cosTo(p,q){
    const a=[p[0]-O[0],p[1]-O[1]], b=[q[0]-O[0],q[1]-O[1]];
    const dot=a[0]*b[0]+a[1]*b[1];
    return dot/(Math.hypot(a[0],a[1])*Math.hypot(b[0],b[1]));
  }
  // sense clouds
  WSD_SENSES.forEach(s=>{
    for(let k=0;k<8;k++){
      const jx=Math.sin(k*2.7+s.c[0])*22, jy=Math.cos(k*1.9+s.c[1])*16;
      ctx.fillStyle=s.col; ctx.globalAlpha=0.22;
      ctx.beginPath(); ctx.arc(s.c[0]+jx,s.c[1]+jy,4,0,2*Math.PI); ctx.fill(); ctx.globalAlpha=1;
    }
    ctx.fillStyle=s.col; ctx.beginPath(); ctx.arc(s.c[0],s.c[1],7,0,2*Math.PI); ctx.fill();
    ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText('v('+s.name+')',s.c[0],s.c[1]-16);
  });
  if(_wsd.sel>=0){
    const target=WSD_SENTS[_wsd.sel].p;
    const start=[W/2,H-50];
    const px=start[0]+(target[0]-start[0])*_wsd.t, py=start[1]+(target[1]-start[1])*_wsd.t;
    // cosine lines
    let best=-1, bestC=-2;
    const cs=WSD_SENSES.map(s=>{ const c=cosTo([px,py],s.c); if(c>bestC){ bestC=c; best=WSD_SENSES.indexOf(s); } return c; });
    WSD_SENSES.forEach((s,i)=>{
      const win=_wsd.t>=1&&i===best;
      ctx.strokeStyle=s.col; ctx.globalAlpha=win?0.9:0.3; ctx.lineWidth=win?2.4:1; ctx.setLineDash(win?[]:[4,3]);
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(s.c[0],s.c[1]); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha=1;
      ctx.fillStyle=s.col; ctx.font=(win?'bold ':'')+'9px monospace'; ctx.textAlign='center';
      ctx.fillText('cos = '+cs[i].toFixed(3),(px+s.c[0])/2,(py+s.c[1])/2+12);
    });
    // instance
    ctx.shadowBlur=12; ctx.shadowColor='#fde047';
    ctx.fillStyle='#fde047'; ctx.beginPath(); ctx.arc(px,py,8,0,2*Math.PI); ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle='#fde047'; ctx.font='bold 9px monospace'; ctx.fillText('z (this instance)',px,py+22);
    const cap=document.getElementById('wsd-caption');
    if(cap&&_wsd.t>=1) cap.innerHTML='The instance vector lands nearest <span style="color:'+WSD_SENSES[best].col+'">'+WSD_SENSES[best].name+'</span> (highest cosine, solid line), so that sense is chosen: \u015d = argmax\u209b cos(z, v\u209b). Switch sentences and the same word lands somewhere else.';
  }
}

// ── 10.3.2 VIZ: ANISOTROPY ─────────────────────────────────
let _ani={ t:0, vecs:null, anim:null };
function _aniGen(){
  const vecs=[];
  for(let i=0;i<50;i++){
    const v=[];
    for(let d=0;d<8;d++){
      const mean=d===0?6:(d===1?-4.5:0.15);
      const sd=d===0?1.6:(d===1?1.3:0.45);
      v.push(mean+sd*(Math.sin(i*12.9898+d*78.233)*0.7+Math.sin(i*3.1+d*9.7)*0.5));
    }
    vecs.push(v);
  }
  return vecs;
}
function _aniStd(vecs){
  const n=vecs.length, D=8, mu=[], sd=[];
  for(let d=0;d<D;d++){
    let m=0; vecs.forEach(v=>m+=v[d]); m/=n; mu.push(m);
    let s=0; vecs.forEach(v=>s+=(v[d]-m)*(v[d]-m)); sd.push(Math.sqrt(s/n)||1);
  }
  return vecs.map(v=>v.map((x,d)=>(x-mu[d])/sd[d]));
}
function _aniAvgCos(vecs){
  let s=0, c=0;
  for(let i=0;i<vecs.length;i+=3) for(let j=i+3;j<vecs.length;j+=3){
    let dot=0, na=0, nb=0;
    for(let d=0;d<8;d++){ dot+=vecs[i][d]*vecs[j][d]; na+=vecs[i][d]**2; nb+=vecs[j][d]**2; }
    s+=dot/Math.sqrt(na*nb); c++;
  }
  return s/c;
}
function anisoReset(){ _ani.t=0; _ani.vecs=_aniGen(); anisoDraw(); }
function anisoGo(){
  if(!_ani.vecs) _ani.vecs=_aniGen();
  if(_ani.anim) cancelAnimationFrame(_ani.anim);
  const t0=performance.now();
  const loop=now=>{ _ani.t=Math.min(1,(now-t0)/1000); anisoDraw(); if(_ani.t<1) _ani.anim=requestAnimationFrame(loop); else _ani.anim=null; };
  _ani.anim=requestAnimationFrame(loop);
}
function anisoDraw(){
  const cv=document.getElementById('aniso-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, t=_ani.t;
  ctx.clearRect(0,0,W,H);
  if(!_ani.vecs) _ani.vecs=_aniGen();
  const raw=_ani.vecs, std=_aniStd(raw);
  const cur=raw.map((v,i)=>v.map((x,d)=>x*(1-t)+std[i][d]*t));
  // left: projection onto dims 0-1
  const ox=150, oy=H*0.52, sc=16;
  ctx.strokeStyle='rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.moveTo(20,oy); ctx.lineTo(290,oy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox,30); ctx.lineTo(ox,H-40); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('dims 1\u20132 projection',20,22);
  cur.forEach((v,i)=>{
    const x=ox+v[0]*sc, y=oy+v[1]*sc*0.8;
    ctx.fillStyle='rgba(77,227,255,0.7)';
    ctx.beginPath(); ctx.arc(Math.max(14,Math.min(296,x)),Math.max(26,Math.min(H-30,y)),3.4,0,2*Math.PI); ctx.fill();
  });
  const avgc=_aniAvgCos(cur);
  ctx.fillStyle=avgc>0.5?'#FF5F8E':'#3DDC84'; ctx.font='bold 11px monospace';
  ctx.fillText('avg cosine, random pairs: '+avgc.toFixed(3),20,H-12);
  // right: per-dim variance bars
  const bx=340, bw=(W-bx-24)/8, bot=H-44;
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='8px monospace';
  ctx.fillText('variance per dimension',bx,22);
  for(let d=0;d<8;d++){
    let m=0; cur.forEach(v=>m+=v[d]); m/=cur.length;
    let va=0; cur.forEach(v=>va+=(v[d]-m)*(v[d]-m)); va/=cur.length;
    // include mean offset in bar to show rogue pull: use m^2+var as "energy"
    const e=m*m+va;
    const h=Math.min(bot-34,e*4.2);
    const rogue=t<0.5&&(d===0||d===1);
    ctx.fillStyle=rogue?'rgba(255,95,142,0.75)':'rgba(160,140,255,0.6)';
    ctx.fillRect(bx+d*bw,bot-h,bw*0.7,h);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.textAlign='center';
    ctx.fillText(String(d+1),bx+d*bw+bw*0.35,bot+12);
  }
  ctx.textAlign='left';
  if(t<0.5){ ctx.fillStyle='rgba(255,95,142,0.8)'; ctx.font='8px monospace'; ctx.fillText('\u2190 rogue dimensions (large mean + variance)',bx,bot+26); }
  else { ctx.fillStyle='rgba(61,220,132,0.8)'; ctx.font='8px monospace'; ctx.fillText('per-dimension energy equalized',bx,bot+26); }
  const cap=document.getElementById('aniso-caption');
  if(cap){
    if(t<=0) cap.innerHTML='Raw vectors: the cloud sits far from the origin, pulled by dimensions 1 and 2 (red bars). Because every vector shares that offset, randomly chosen pairs have cosine '+avgc.toFixed(2)+' \u2014 similarity readings are dominated by the offset, not by the words.';
    else if(t<1) cap.innerHTML='Standardizing: each dimension is recentered by \u03bc_d and rescaled by \u03c3_d\u2026';
    else cap.innerHTML='Standardized: the cloud surrounds the origin, the rogue dimensions are equalized, and random-pair cosine has fallen to '+avgc.toFixed(3)+'. Cosine similarity between specific words is meaningful again. The operation is the layer-norm z-score of Section 8.2, applied with corpus statistics.';
  }
}

// ── 10.4 VIZ: HEAD-SWAPPING BENCH ──────────────────────────
const BENCH_LEX={great:2,delicious:2,loved:2,excellent:2,wonderful:2,superb:2,charming:1.5,fun:1.5,good:1.2,tasty:1.5,bland:-1.5,boring:-1.5,greasy:-1.2,lacks:-1.5,terrible:-2,awful:-2,dull:-1.5,slow:-1,bad:-1.5,mediocre:-1.3,soggy:-1.4};
const BENCH_SENTS=['The pasta was delicious and the service charming.','A slow kitchen and a bland risotto.','The room was fine but the food was mediocre.'];
const BENCH_NLI=[
  {p:'A man is playing a guitar on stage.', h:'A person is making music.', y:[0.86,0.04,0.10], lab:'entailment'},
  {p:'A man is playing a guitar on stage.', h:'The man is asleep in bed.', y:[0.03,0.90,0.07], lab:'contradiction'},
  {p:'A man is playing a guitar on stage.', h:'He is playing his favorite song.', y:[0.18,0.06,0.76], lab:'neutral'}
];
let _bench={ mode:'sent', nli:0 };
function benchBuild(){ benchMode('sent'); }
function benchMode(m){
  _bench.mode=m;
  document.querySelectorAll('.bench-mode').forEach(b=>{ const on=b.dataset.m===m; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  const host=document.getElementById('bench-inputs'); if(!host) return;
  if(m==='sent'){
    host.innerHTML='<input id="bench-text" type="text" value="'+BENCH_SENTS[0]+'" oninput="benchDraw()" style="width:100%;background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.55rem .8rem;font-family:var(--mono);font-size:.72rem;box-sizing:border-box">'
      +'<div style="display:flex;gap:6px;flex-wrap:wrap">'+BENCH_SENTS.map((s,i)=>'<button onclick="benchPreset('+i+')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:6px;padding:.3rem .6rem;font-family:var(--mono);font-size:.62rem;cursor:pointer">example '+(i+1)+'</button>').join('')+'</div>';
  } else {
    host.innerHTML='<div id="bench-nli-box" style="font-family:var(--mono);font-size:.72rem;color:var(--text);line-height:1.8;background:var(--surface2);border-radius:8px;padding:.6rem .8rem"></div>'
      +'<div style="display:flex;gap:6px;flex-wrap:wrap">'+BENCH_NLI.map((x,i)=>'<button onclick="benchNLI('+i+')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:6px;padding:.3rem .6rem;font-family:var(--mono);font-size:.62rem;cursor:pointer">hypothesis '+(i+1)+'</button>').join('')+'</div>';
    benchNLI(_bench.nli);
    return;
  }
  benchDraw();
}
function benchPreset(i){ const t=document.getElementById('bench-text'); if(t){ t.value=BENCH_SENTS[i]; benchDraw(); } }
function benchNLI(i){
  _bench.nli=i;
  const b=document.getElementById('bench-nli-box');
  const x=BENCH_NLI[i];
  if(b) b.innerHTML='<span style="color:var(--muted)">premise:</span> '+x.p+'<br><span style="color:var(--muted)">hypothesis:</span> '+x.h;
  benchDraw();
}
function benchDraw(){
  const cv=document.getElementById('bench-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, m=_bench.mode;
  ctx.clearRect(0,0,W,H);
  // shared frozen encoder
  ctx.fillStyle='rgba(255,255,255,0.05)'; roundRect(ctx,40,70,270,110,10); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.22)'; ctx.lineWidth=1.3; roundRect(ctx,40,70,270,110,10); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('pretrained encoder',175,100);
  ctx.font='14px monospace'; ctx.fillText('\ud83d\udd12',175,122);
  ctx.font='8px monospace'; ctx.fillStyle='rgba(255,255,255,0.35)';
  ctx.fillText('12 blocks \u00b7 bidirectional \u00b7 shared by both heads',175,144);
  ctx.fillText('input tokens \u2192',175,168);
  // CLS arrow
  ctx.strokeStyle='rgba(253,224,71,0.6)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(310,125); ctx.lineTo(370,125); ctx.stroke();
  ctx.fillStyle='#fde047'; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText('z_CLS',340,116);
  // head box
  const col=m==='sent'?'#4DE3FF':'#A18FFF';
  ctx.fillStyle='rgba(255,255,255,0.06)'; roundRect(ctx,372,102,120,46,8); ctx.fill();
  ctx.strokeStyle=col; ctx.lineWidth=1.5; roundRect(ctx,372,102,120,46,8); ctx.stroke();
  ctx.fillStyle=col; ctx.font='bold 9px monospace';
  ctx.fillText(m==='sent'?'sentiment head':'NLI head',432,122);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace';
  ctx.fillText(m==='sent'?'W_C \u2208 R^{d\u00d72}':'W_C \u2208 R^{d\u00d73}',432,138);
  // probabilities
  let bars;
  if(m==='sent'){
    const t=document.getElementById('bench-text');
    const words=(t?t.value:'').toLowerCase().replace(/[^a-z ]/g,'').split(/\s+/);
    let s=0; words.forEach(w=>{ if(BENCH_LEX[w]!==undefined) s+=BENCH_LEX[w]; });
    const p=1/(1+Math.exp(-s*0.9));
    bars=[['positive',p,'#3DDC84'],['negative',1-p,'#FF5F8E']];
  } else {
    const y=BENCH_NLI[_bench.nli].y;
    bars=[['entailment',y[0],'#3DDC84'],['contradiction',y[1],'#FF5F8E'],['neutral',y[2],'#fde047']];
  }
  bars.forEach(([lab,p,c],i)=>{
    const by=90+i*26, bx=510;
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(bx,by,90,14);
    ctx.fillStyle=c; ctx.globalAlpha=0.8; ctx.fillRect(bx,by,90*p,14); ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.font='8px monospace'; ctx.textAlign='left';
    ctx.fillText(lab+' '+(p*100).toFixed(0)+'%',bx,by-4);
  });
  const cap=document.getElementById('bench-caption');
  if(cap) cap.innerHTML=(m==='sent'
    ?'One frozen encoder, a two-way head on z_CLS. Edit the sentence and the verdict updates. (The verdict here is computed by a small word-score table standing in for the trained head; the architecture shown is the real one.)'
    :'Same frozen encoder, a three-way head. [CLS] attends across the [SEP] boundary, so its vector can encode the relation between premise and hypothesis. Verdicts here are preset for the three example pairs.');
}

// ── 10.5 VIZ: ENTITY HIGHLIGHTER ───────────────────────────
const NER_COLS={PER:'#FF5F8E',ORG:'#4DE3FF',GPE:'#A18FFF',LOC:'#A18FFF',DATE:'#fde047',MONEY:'#3DDC84'};
const NER_PRESETS=[
  'Priya Raghunathan of Meridian Freight Holdings closed the deal with Jordan on Tuesday for $4 million',
  'Jordan was the first captain of the national team',
  'She moved from Lisbon to Jordan last spring',
  'Jordan announced new tariffs on Tuesday, according to government insiders'
];
const NER_FIRST=['Priya','Nadia','Miguel','Ingrid','Tomas','Aisha','Rafael'];
const NER_PLACES=['Jordan','Lisbon','Osaka','Denver','Colorado','Berlin','Nairobi','Seattle'];
const NER_ORGSUF=['Freight','Holdings','Logistics','Corp','Inc','University','Bank','Motors'];
const NER_DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
function nerBuild(){
  const p=document.getElementById('ner-presets'); if(!p) return;
  p.innerHTML=NER_PRESETS.map((s,i)=>'<button onclick="nerPreset('+i+')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:6px;padding:.3rem .6rem;font-family:var(--mono);font-size:.62rem;cursor:pointer">'+(i===0?'full example':'Jordan '+i)+'</button>').join('');
  nerRender();
}
function nerPreset(i){ const t=document.getElementById('ner-input'); if(t){ t.value=NER_PRESETS[i]; nerRender(); } }
function nerRender(){
  const t=document.getElementById('ner-input'), out=document.getElementById('ner-out');
  if(!t||!out) return;
  const text=t.value;
  const toks=text.split(/\s+/).filter(x=>x.length);
  const clean=w=>w.replace(/[.,;!?]+$/,'');
  const low=text.toLowerCase();
  const spans=[]; // {a,b,type}
  const used=new Array(toks.length).fill(false);
  // MONEY: $N (million|billion)?
  for(let i=0;i<toks.length;i++){
    if(/^\$[\d,.]+/.test(toks[i])){
      let b=i;
      if(i+1<toks.length && /^(million|billion|thousand)/i.test(clean(toks[i+1]))) b=i+1;
      spans.push({a:i,b,type:'MONEY'});
      for(let k=i;k<=b;k++) used[k]=true;
    }
  }
  // DATE
  toks.forEach((w,i)=>{ if(!used[i] && NER_DAYS.includes(clean(w))){ spans.push({a:i,b:i,type:'DATE'}); used[i]=true; } });
  // ORG: capitalized run ending in an org suffix
  for(let i=0;i<toks.length;i++){
    if(used[i]) continue;
    if(NER_ORGSUF.includes(clean(toks[i]))){
      let a=i;
      while(a>0 && !used[a-1] && /^[A-Z]/.test(toks[a-1])) a--;
      // extend forward over further suffixes
      let b=i;
      while(b+1<toks.length && NER_ORGSUF.includes(clean(toks[b+1]))) b++;
      spans.push({a,b,type:'ORG'});
      for(let k=a;k<=b;k++) used[k]=true;
    }
  }
  // PER: known first name + following capitalized tokens
  for(let i=0;i<toks.length;i++){
    if(used[i]) continue;
    if(NER_FIRST.includes(clean(toks[i]))){
      let b=i;
      while(b+1<toks.length && !used[b+1] && /^[A-Z][a-z]/.test(toks[b+1]) && !NER_PLACES.includes(clean(toks[b+1]))) b++;
      spans.push({a:i,b,type:'PER'});
      for(let k=i;k<=b;k++) used[k]=true;
    }
  }
  // places, with Washington context rules
  const hasPres=/president|captain|general/i.test(low);
  const metonym=/announced|according to|insiders|sanction|tariff/i.test(low);
  for(let i=0;i<toks.length;i++){
    if(used[i]) continue;
    const w=clean(toks[i]);
    if(NER_PLACES.includes(w)){
      let type='GPE';
      if(w==='Jordan'){ if(hasPres) type='PER'; else if(metonym) type='GPE'; }
      spans.push({a:i,b:i,type,meta:(w==='Jordan'&&metonym&&!hasPres)});
      used[i]=true;
    }
  }
  spans.sort((x,y)=>x.a-y.a);
  // render
  let html='', si=0;
  for(let i=0;i<toks.length;i++){
    const sp=spans.find(s=>s.a===i);
    if(sp){
      const col=NER_COLS[sp.type];
      const words=toks.slice(sp.a,sp.b+1).join(' ');
      html+='<span style="background:'+col+'22;border-bottom:2px solid '+col+';border-radius:4px;padding:.05rem .25rem">'+words+'<sup style="color:'+col+';font-size:.58rem;margin-left:.2rem">'+sp.type+'</sup></span> ';
      i=sp.b;
    } else html+=toks[i]+' ';
  }
  out.innerHTML=html;
  const cap=document.getElementById('ner-caption');
  if(cap){
    const wsp=spans.find(s=>clean(toks[s.a])==='Jordan');
    let note='This highlighter uses simple rules (name lists, org suffixes, patterns) to illustrate the task; a real system is the finetuned per-token classifier described below.';
    if(wsp){
      if(wsp.type==='PER') note='&ldquo;Jordan&rdquo; tagged PER: the word &ldquo;captain&rdquo; in the context indicates the person. '+note;
      else if(wsp.meta) note='&ldquo;Jordan&rdquo; tagged GPE used metonymically: the government, not the country, is doing the announcing. Context, not the string, decides the type. '+note;
      else note='&ldquo;Jordan&rdquo; tagged GPE: the movement verb and preposition indicate the place. '+note;
    }
    cap.innerHTML=note;
  }
}

// ── 10.5 VIZ: BIO ENCODING ─────────────────────────────────
const BIO_TOK=['Priya','Raghunathan','of','Meridian','Freight','Holdings','closed','the','Lisbon','deal'];
const BIO_SPANS=[[0,1,'PER'],[3,5,'ORG'],[8,8,'LOC']];
let _bio={ scheme:'BIO' };
function bioMode(m){
  _bio.scheme=m;
  document.querySelectorAll('.bio-mode').forEach(b=>{ const on=b.dataset.m===m; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  bioRender();
}
function bioRender(){
  const out=document.getElementById('bio-out'); if(!out) return;
  const sub=document.getElementById('bio-sub');
  const showSub=sub?sub.checked:false;
  const scheme=_bio.scheme;
  function tagFor(i){
    for(const [a,b,T] of BIO_SPANS){
      if(i>=a&&i<=b){
        if(scheme==='IO') return 'I-'+T;
        if(scheme==='BIO') return (i===a?'B-':'I-')+T;
        // BIOES
        if(a===b) return 'S-'+T;
        if(i===a) return 'B-'+T;
        if(i===b) return 'E-'+T;
        return 'I-'+T;
      }
    }
    return 'O';
  }
  let toks=[], tags=[], firsts=[];
  BIO_TOK.forEach((w,i)=>{
    const tg=tagFor(i);
    if(showSub && w==='Raghunathan'){
      ['Rag','##hun','##athan'].forEach((p,k)=>{ toks.push(p); tags.push(tg); firsts.push(k===0); });
    } else { toks.push(w); tags.push(tg); firsts.push(true); }
  });
  const colOf=tg=>{ if(tg==='O') return 'rgba(255,255,255,0.35)'; const T=tg.split('-')[1]; return NER_COLS[T]||'#fff'; };
  out.innerHTML='<div style="display:flex;gap:4px;flex-wrap:wrap">'
    +toks.map((w,i)=>'<div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:52px">'
      +'<span style="color:#ECF1FF;font-size:.7rem">'+w+'</span>'
      +'<span style="color:'+colOf(tags[i])+';font-size:.62rem;border:1px solid '+colOf(tags[i])+'44;border-radius:4px;padding:.05rem .3rem;'+(showSub&&!firsts[i]?'opacity:.45':'')+'">'+tags[i]+'</span>'
      +(showSub? '<span style="font-size:.5rem;color:'+(firsts[i]?'var(--accent4)':'rgba(255,255,255,0.25)')+'">'+(firsts[i]?'read':'ignore')+'</span>':'')
    +'</div>').join('')+'</div>';
  const cap=document.getElementById('bio-caption');
  if(cap){
    let s='';
    if(scheme==='IO') s='IO: 1 + number-of-types tags. Compact, but if two entities of the same type were adjacent, their boundary would be unrecoverable, since both would read I-T throughout.';
    if(scheme==='BIO') s='BIO: the B tag marks each span start, so adjacent same-type entities stay separable. 2n + 1 tags for n types; this is the standard scheme.';
    if(scheme==='BIOES') s='BIOES: E marks span ends and S marks single-token entities, making every boundary explicit at the cost of 4n + 1 tags.';
    if(showSub) s+=' Subword alignment: Raghunathan splits into three WordPiece tokens; during training the word tag is copied to all pieces, and at decoding the prediction is read from the first piece only.';
    cap.textContent=s;
  }
}

// ── 10.5 VIZ: ENTITY-LEVEL F1 ──────────────────────────────
const NF1_GOLD=[['Priya Raghunathan','PER'],['Meridian Freight Holdings','ORG'],['Lisbon','LOC']];
const NF1_SYS={
  partial:[['Priya','PER'],['Meridian Freight Holdings','ORG'],['Lisbon','LOC']],
  exact:[['Priya Raghunathan','PER'],['Meridian Freight Holdings','ORG'],['Lisbon','LOC']]
};
let _nf1={ mode:'partial' };
function nf1Mode(m){
  _nf1.mode=m;
  document.querySelectorAll('.nf1-mode').forEach(b=>{ const on=b.dataset.m===m; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  const out=document.getElementById('nf1-out'); if(!out) return;
  const sys=NF1_SYS[m];
  const goldKeys=NF1_GOLD.map(g=>g[0]+'|'+g[1]);
  const sysKeys=sys.map(g=>g[0]+'|'+g[1]);
  const correct=sysKeys.filter(k=>goldKeys.includes(k)).length;
  const P=correct/sys.length, R=correct/NF1_GOLD.length, F=(P+R>0)?2*P*R/(P+R):0;
  const chip=(txt,T,status)=>{
    const col=NER_COLS[T];
    const badge=status==='ok'?'<span style="color:#3DDC84"> \u2713</span>':status==='fp'?'<span style="color:#FF5F8E"> \u2717 FP</span>':status==='fn'?'<span style="color:#FF5F8E"> missed \u2192 FN</span>':'';
    return '<span style="background:'+col+'22;border-bottom:2px solid '+col+';border-radius:4px;padding:.05rem .3rem;margin-right:.4rem">'+txt+'<sup style="color:'+col+';font-size:.55rem"> '+T+'</sup>'+badge+'</span>';
  };
  let html='<div style="color:#8E9AC4;font-size:.62rem;margin-bottom:.3rem">GOLD ENTITIES</div><div style="margin-bottom:.8rem">';
  NF1_GOLD.forEach(([txt,T])=>{ const missed=!sysKeys.includes(txt+'|'+T); html+=chip(txt,T,missed?'fn':''); });
  html+='</div><div style="color:#8E9AC4;font-size:.62rem;margin-bottom:.3rem">SYSTEM OUTPUT</div><div style="margin-bottom:.9rem">';
  sys.forEach(([txt,T])=>{ const ok=goldKeys.includes(txt+'|'+T); html+=chip(txt,T,ok?'ok':'fp'); });
  html+='</div>';
  html+='<div style="font-size:.72rem;line-height:1.9">correct = '+correct+' \u00b7 predicted = '+sys.length+' \u00b7 gold = '+NF1_GOLD.length
    +'<br>P = '+correct+'/'+sys.length+' = <b style="color:var(--accent)">'+P.toFixed(3)+'</b>'
    +' &nbsp;\u00b7&nbsp; R = '+correct+'/'+NF1_GOLD.length+' = <b style="color:var(--accent)">'+R.toFixed(3)+'</b>'
    +' &nbsp;\u00b7&nbsp; F\u2081 = <b style="color:'+(F>0.99?'var(--accent4)':'var(--accent3)')+'">'+F.toFixed(3)+'</b></div>';
  out.innerHTML=html;
  const cap=document.getElementById('nf1-caption');
  if(cap) cap.textContent=(m==='partial'
    ? 'System A found the right person but clipped the span: Priya alone matches no gold entity (a false positive), and Priya Raghunathan was never produced (a false negative). One boundary error, two penalties, and F1 drops from 1.0 to 0.667.'
    : 'System B matches every span exactly in both boundaries and type, so precision, recall, and F1 are all 1.0.');
}

// ── 10.6 VIZ: RECAP PIPELINE ───────────────────────────────
const MLR_NODES=[
  {lab:'input tokens', sub:'WordPiece \u00b7 [CLS] [SEP]', col:'#9a9ab8', sec:'nsp',      x:0},
  {lab:'blocks \u00b7 no mask', sub:'bidirectional attention', col:'#4DE3FF', sec:'bidir', x:1},
  {lab:'one vector per token', sub:'contextual embeddings', col:'#A18FFF', sec:'ctx',    x:2},
  {lab:'MLM head', sub:'pretraining (mask \u2192 predict)', col:'#FF5F8E', sec:'mlm',     x:3, row:0},
  {lab:'task heads', sub:'[CLS] or per-token', col:'#3DDC84', sec:'finetune',            x:3, row:1}
];
let _mlr={ rects:[] };
function mlrBuild(){
  const cv=document.getElementById('mlr-canvas'); if(!cv) return;
  cv.onclick=e=>{
    const r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(cv.width/r.width), my=(e.clientY-r.top)*(cv.height/r.height);
    for(const [x,y,w,h,sec] of _mlr.rects){ if(sec&&mx>=x&&mx<=x+w&&my>=y&&my<=y+h){ openMLSec(sec); return; } }
  };
  mlrDraw();
}
function mlrDraw(){
  const cv=document.getElementById('mlr-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  _mlr.rects=[];
  ctx.fillStyle='rgba(77,227,255,0.8)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('ENCODER PIPELINE',16,20);
  const bw=138, bh=46, gap=18, y0=34;
  function node(n,x,y){
    _mlr.rects.push([x,y,bw,bh,n.sec]);
    ctx.fillStyle='rgba(255,255,255,0.05)'; roundRect(ctx,x,y,bw,bh,8); ctx.fill();
    ctx.strokeStyle=n.col; ctx.lineWidth=1.4; roundRect(ctx,x,y,bw,bh,8); ctx.stroke();
    ctx.fillStyle=n.col; ctx.font='bold 9px monospace'; ctx.textAlign='center';
    ctx.fillText(n.lab,x+bw/2,y+18);
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='7px monospace';
    ctx.fillText(n.sub,x+bw/2,y+32);
    if(n.sec){ ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='7px monospace'; ctx.fillText('click \u2192 \u00a7',x+bw/2,y+42); }
  }
  // main row 0..2
  for(let i=0;i<3;i++){
    const x=16+i*(bw+gap);
    node(MLR_NODES[i],x,y0);
    if(i<2){
      ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.moveTo(x+bw,y0+bh/2); ctx.lineTo(x+bw+gap,y0+bh/2); ctx.stroke();
    }
  }
  // fork
  const fx=16+3*(bw+gap);
  const vx=16+2*(bw+gap)+bw;
  ctx.strokeStyle='rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.moveTo(vx,y0+bh/2); ctx.lineTo(vx+gap/2,y0+bh/2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(vx+gap/2,y0+bh/2); ctx.lineTo(vx+gap/2,y0-6); ctx.lineTo(fx,y0-6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(vx+gap/2,y0+bh/2); ctx.lineTo(vx+gap/2,y0+bh+16); ctx.lineTo(fx,y0+bh+16); ctx.stroke();
  node(MLR_NODES[3],fx,y0-28);
  node(MLR_NODES[4],fx,y0+bh-2);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='7px monospace'; ctx.textAlign='left';
  ctx.fillText('pretraining path',fx,y0-34);
  ctx.fillText('finetuning path (sentiment \u00b7 NLI \u00b7 NER)',fx,y0+bh+56);
  // decoder row for contrast
  const dy=H-78;
  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.moveTo(16,dy-18); ctx.lineTo(W-16,dy-18); ctx.stroke();
  ctx.fillStyle='rgba(255,95,142,0.7)'; ctx.font='9px monospace';
  ctx.fillText('DECODER PIPELINE (for contrast)',16,dy-4);
  const dn=[['input tokens','#9a9ab8'],['blocks \u00b7 causal mask','#FF5F8E'],['next-token head','#fde047']];
  dn.forEach(([lab,col],i)=>{
    const x=16+i*(bw+gap);
    ctx.fillStyle='rgba(255,255,255,0.03)'; roundRect(ctx,x,dy+4,bw,36,8); ctx.fill();
    ctx.strokeStyle=col; ctx.globalAlpha=0.5; ctx.lineWidth=1; roundRect(ctx,x,dy+4,bw,36,8); ctx.stroke(); ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='8px monospace'; ctx.textAlign='center';
    ctx.fillText(lab,x+bw/2,dy+26);
    if(i<2){ ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.moveTo(x+bw,dy+22); ctx.lineTo(x+bw+gap,dy+22); ctx.stroke(); }
  });
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('the two pipelines differ at exactly two points: the mask, and the heads',16+3*(bw+gap),dy+26);
  const cap=document.getElementById('mlr-caption');
  if(cap) cap.innerHTML='Tokens \u2192 unmasked blocks \u2192 per-token vectors, then a fork: the MLM head during pretraining, task heads after finetuning. Click any encoder stage to revisit its section.';
}

// ── OPEN ML SECTION ────────────────────────────────────────
function openMLSec(id){
  const pg = ML_PAGES[id];
  if(!pg) return;
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if(!sv || !sb) return;
  const sec = ML_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if(crumb && sec) crumb.innerHTML = 'Masked Language Models <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  renderMath(sb);
  mcSectionDelay(()=>{
    if(id==='mlintro') gvuBuild();
    if(id==='bidir'){ bamBuild(); mscBuild(); }
    if(id==='mlm') clozeBuild();
    if(id==='maskrec') mrecReset();
    if(id==='nsp') nspBuild();
    if(id==='multiling') alphaSet(1);
    if(id==='ctx') cmapBuild();
    if(id==='wsd') wsdBuild();
    if(id==='aniso') anisoReset();
    if(id==='finetune') benchBuild();
    if(id==='ner'){ nerBuild(); bioMode('BIO'); nf1Mode('partial'); }
    if(id==='mlrecap') mlrBuild();
  }, 120);
  sv.onscroll = () => {
    const h = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if(bar) bar.style.width = (h>0?(sv.scrollTop/h)*100:0)+'%';
  };
}
