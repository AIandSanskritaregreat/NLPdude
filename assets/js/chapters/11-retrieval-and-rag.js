// ════════════════════════════════════════════════════════════
//  CHAPTER 11 · INFORMATION RETRIEVAL & RAG
// ════════════════════════════════════════════════════════════

const IR_SEC = [
  {id:'irintro', num:'11.0',   title:'The Limits of Parametric Knowledge', icon:'\u26A0', desc:'What a model stores in its weights, why it fails, and why a confident answer still needs supporting evidence.', tags:['hallucination','calibration','staleness']},
  {id:'irpipe',  num:'11.1',   title:'The Retrieval Pipeline',        icon:'\u21E5', desc:'Query to ranked documents: the fixed skeleton shared by sparse and dense retrieval.', tags:['query \u2192 ranking','sparse','dense']},
  {id:'bow',     num:'11.1.1', title:'Documents as Bags of Words',    icon:'\u2317', desc:'Discarding word order, the term-document matrix, and what the assumption costs.', tags:['bag of words','term-document','vectors']},
  {id:'tfidf',   num:'11.1.2', title:'Weighting Terms: tf-idf and BM25', icon:'\u2696', desc:'Damping raw counts, penalizing common words, and adding length normalization.', tags:['tf-idf','BM25','k and b']},
  {id:'cosine',  num:'11.1.3', title:'Relevance as an Angle',         icon:'\u2220', desc:'Cosine similarity, why it ignores document length, and the score ledger behind it.', tags:['cosine','length invariance','dot product']},
  {id:'invidx',  num:'11.1.4', title:'The Inverted Index',            icon:'\u2263', desc:'Why scanning every document does not scale, and the data structure that replaces it.', tags:['postings','dictionary','scaling']},
  {id:'ireval',  num:'11.2',   title:'Evaluating a Ranked List',      icon:'\u25F4', desc:'Precision, recall, the sawtooth curve, interpolation, and mean average precision.', tags:['P-R curve','MAP','interpolation']},
  {id:'dense',   num:'11.3',   title:'Dense Retrieval',               icon:'\u25C8', desc:'When query and document use different words: embeddings, encoder architectures, and ANN search.', tags:['vocabulary mismatch','bi-encoder','ColBERT']},
  {id:'ragsec',  num:'11.4',   title:'Retrieval-Augmented Generation',icon:'\u229E', desc:'Putting retrieved passages in the prompt: the assembly line, noise, multi-hop, and citations.', tags:['RAG','reranking','citations']},
  {id:'qadata',  num:'11.5',   title:'Where Questions Come From',     icon:'\u25F1', desc:'The question-answering datasets, and what their design choices measure.', tags:['Natural Questions','MMLU','TyDi QA']},
  {id:'emf1',    num:'11.6',   title:'Exact Match and Token F1',      icon:'\u2713', desc:'Two ways to grade a free-form answer, and where each of them fails.', tags:['EM','token F1','evaluation']},
  {id:'irrecap', num:'11.7',   title:'Recap',                 icon:'\u25C9', desc:'The whole pipeline in one diagram, with the sparse and dense paths traced separately.', tags:['pipeline','recap']}
];

function buildIROverview(){
  const cards = IR_SEC.map(s=>`
    <div class="sc-card" onclick="openIRSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Looking Things Up</div>
    <h1 class="lesson-h1">Information Retrieval &amp; RAG</h1>
    <p class="lesson-intro">A model’s weights encode patterns learned during training, but they are not an up-to-date, searchable database. Retrieval-augmented generation supplies relevant passages at answer time. We will build the retrieval side first: document vectors, term weights, indexes, ranking, and evaluation.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">Information learned during training can be outdated, incomplete, or recalled incorrectly. A confident tone alone is not evidence of accuracy.</div>
        <div class="ch-sum-item">Sparse retrieval represents documents as weighted bags of words, using log-damped term frequency times inverse document frequency, with BM25 adding saturation and length normalization.</div>
        <div class="ch-sum-item">Cosine similarity ranks by the angle between vectors rather than their magnitudes, which makes scores invariant to uniform rescaling of a vector.</div>
        <div class="ch-sum-item">An inverted index replaces a scan over every document with a dictionary lookup and a walk down a short postings list, which is what makes retrieval scale.</div>
        <div class="ch-sum-item">Ranked lists are evaluated with interpolated precision-recall curves and mean average precision, which averages precision at the relevant ranks and then averages over queries.</div>
        <div class="ch-sum-item">Dense retrieval encodes queries and documents into a shared vector space, helping address vocabulary mismatch; bi-encoders, ColBERT, and cross-encoders trade accuracy against compute.</div>
        <div class="ch-sum-item">RAG assembles retrieved passages into the prompt before generation, which grounds the answer, allows citation, and is sensitive to the quality and ordering of what was retrieved.</div>
      </div>
    </div>`;
}

const IR_PAGES = {};
const IR_EQ = {};

// ── 11.0 THE LIMITS OF PARAMETRIC KNOWLEDGE ────────────────
IR_PAGES.irintro = `
<div class="lesson-chapter-label">Section 11.0</div>
<h1 class="lesson-h1">The Limits of Parametric Knowledge</h1>
<p class="lesson-intro">A model can answer some questions using information learned during training. This is often called <strong>parametric knowledge</strong>. Its coverage, freshness, and reliability are limited, which motivates supplying relevant source material at answer time.</p>

<h2 class="lesson-h2">Three Ways Parametric Knowledge Fails</h2>
<p class="lesson-p">The first limitation is <strong>staleness</strong>. Fixed weights do not automatically incorporate later events or corrections. New information must come from further training, the prompt, or an external source.</p>
<p class="lesson-p">The second is <strong>access</strong>. A model cannot reliably answer from a private document it has never received. Such data can be supplied through authorized training or retrieval; increasing model size alone does not provide it.</p>
<p class="lesson-p">The third is <strong>unreliable recall</strong>. A fact appearing in training does not guarantee that the model will reproduce it correctly. Unlike a database lookup, generation does not return a dependable “not found” result.</p>

<h2 class="lesson-h2">Confidence and Correctness</h2>
<p class="lesson-p">A model can produce a plausible but false answer, often called a <strong>hallucination</strong>. It may also express uncertainty or decline to answer. Error rates depend on the model, task, prompts, and evaluation method, so a rate from one setting should not be treated as universal.</p>
<p class="lesson-p">The simulation below deliberately generates confidence independently of correctness. Use it to see what an uninformative confidence score looks like. Individual outcomes are either correct or incorrect; calibration concerns groups of predictions. Among answers assigned 80% confidence, a calibrated system should be right about 80% of the time.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Simulation &middot; Confidence and Correctness</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
      <span style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">domain:</span>
      <button class="ctrap-dom" data-d="general" onclick="ctrapDomain('general')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">Preset A: 82% accuracy</button>
      <button class="ctrap-dom" data-d="medical" onclick="ctrapDomain('medical')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">Preset B: 55% accuracy</button>
      <button class="ctrap-dom" data-d="legal" onclick="ctrapDomain('legal')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">Preset C: 22% accuracy</button>
      <button onclick="ctrapAsk(1)" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.45rem 1rem;font-family:var(--mono);font-size:.7rem;font-weight:700;cursor:pointer;margin-left:auto">Ask one</button>
      <button onclick="ctrapAsk(20)" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.45rem .9rem;font-family:var(--mono);font-size:.7rem;cursor:pointer">Ask &times;20</button>
    </div>
    <div id="ctrap-q" style="background:var(--panel);border-radius:10px;padding:.9rem 1rem;font-family:var(--mono);font-size:.74rem;line-height:1.8;color:#ECF1FF;min-height:4.2rem;margin-bottom:1rem"></div>
    <canvas id="ctrap-canvas" width="640" height="240" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="ctrap-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<p class="lesson-p">In this simulation, confidence was chosen independently of correctness, so filtering by confidence does not systematically improve accuracy. Real confidence estimates can carry useful information, but they need validation on the task at hand; see <a href="https://arxiv.org/abs/2207.05221" target="_blank" rel="noopener noreferrer">Kadavath et al. (2022)</a>. Confident wording and next-token probability are not, by themselves, calibrated probabilities that an entire answer is true.</p>

<h2 class="lesson-h2">The Alternative: Non-Parametric Knowledge</h2>
<p class="lesson-p">One way to supply missing information is to keep documents in a searchable collection and retrieve relevant passages at question time. This <strong>non-parametric knowledge</strong> can be updated without retraining the model and can include authorized private material. Retrieval still needs evaluation: the right document may be missed, or the model may misread it.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Three Failures, One Repair</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem" id="vault-btns"></div>
    <canvas id="vault-canvas" width="640" height="240" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="vault-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<div class="quiz-block" id="qir-intro"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does confidence filtering fail in this simulation?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qir-intro','Correct. This simulation samples correctness independently of confidence, so thresholding has no systematic advantage.')">Confidence is generated independently of correctness</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-intro','The demo supplies a confidence value for each outcome. A token probability is not automatically an answer-level confidence estimate.')">Models do not expose confidence values</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-intro','Thresholding is inexpensive. Here the confidence score contains no information about correctness.')">Computing the threshold is too expensive</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-intro','Errors can occur in many domains. These presets are illustrative, not measurements of a particular model.')">Hallucination only happens in legal questions</button>
</div><div class="quiz-explain" id="qir-intro-explain"></div></div>`;

// ── 11.1 THE RETRIEVAL PIPELINE ────────────────────────────
IR_PAGES.irpipe = `
<div class="lesson-chapter-label">Section 11.1</div>
<h1 class="lesson-h1">The Retrieval Pipeline</h1>
<p class="lesson-intro">Information retrieval is the task of finding, from a large collection, the documents that satisfy a user&rsquo;s information need. Some terminology first, because it is used consistently from here on. A <strong>document</strong> is the unit that gets returned, which might be a web page, a paragraph, or a passage of a few hundred tokens. The <strong>collection</strong> is the set of all documents. A <strong>query</strong> is the user&rsquo;s expression of their information need, usually a handful of words. The system&rsquo;s job is to return a <strong>ranked list</strong> of documents, most relevant first.</p>

<h2 class="lesson-h2">The Fixed Skeleton</h2>
<p class="lesson-p">Almost every retrieval system, old or new, has the same four stages. The query is processed into some internal form. The documents in the collection have already been processed into the same kind of form, offline. A scoring function compares the query representation against document representations. The scores are sorted, and the top results are returned. What varies between systems is the content of those boxes, not their arrangement.</p>
<p class="lesson-p">The two families that fill them differently are <strong>sparse</strong> and <strong>dense</strong> retrieval. Sparse retrieval represents a document as a vector over the vocabulary, one dimension per word type, mostly zeros, with nonzero weights for the words the document actually contains; scoring is a weighted overlap of terms, and the search structure is an inverted index. Dense retrieval represents a document as a few hundred continuous dimensions produced by an encoder like the ones built for masked language models; scoring is a dot product or cosine in that space, and the search structure is an approximate nearest-neighbor index. Sections 11.1.1 through 11.1.4 build the sparse path in full; Section 11.3 builds the dense one. Switch between them below to see which components change.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Same Pipeline, Two Implementations</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
      <button class="rpipe-mode" data-m="sparse" onclick="rpipeMode('sparse')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">sparse (11.1)</button>
      <button class="rpipe-mode" data-m="dense" onclick="rpipeMode('dense')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">dense (11.3)</button>
    </div>
    <canvas id="rpipe-canvas" width="640" height="270" style="width:100%;max-width:640px;display:block;margin:0 auto;cursor:pointer"></canvas>
    <div id="rpipe-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem">Click any stage for what it contains.</div>
  </div>
</div>

<div class="quiz-block" id="qir-pipe"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What distinguishes sparse from dense retrieval?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qir-pipe','Correct. Sparse uses high-dimensional, mostly-zero vectors over the vocabulary with term-overlap scoring; dense uses low-dimensional learned embeddings with vector-space scoring. The pipeline stages are the same.')">How documents are represented: vocabulary-sized sparse vectors versus learned dense embeddings</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-pipe','Both return ranked lists of documents; the output format is identical.')">Sparse returns documents and dense returns answers</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-pipe','Both index the collection offline; the index structure differs, not whether one exists.')">Dense retrieval does not need an index</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-pipe','The stage sequence is the same in both; only the contents of the stages change.')">They have completely different pipeline stages</button>
</div><div class="quiz-explain" id="qir-pipe-explain"></div></div>`;

// ── 11.1.1 BAGS OF WORDS ───────────────────────────────────
IR_PAGES.bow = `
<div class="lesson-chapter-label">Section 11.1.1</div>
<h1 class="lesson-h1">Documents as Bags of Words</h1>
<p class="lesson-intro">A bag-of-words representation records which terms occur in a document and how often, while discarding their order. It is simple and useful, but some distinctions disappear. Compare sentences with the same words in different orders.</p>

<h2 class="lesson-h2">Discarding Order</h2>
<p class="lesson-p">Below, a paragraph is separated into its words, which are then counted and sorted by frequency. The sentence structure is gone; what remains is a list of counts. The second panel shows the cost directly: <em>dog bites man</em> and <em>man bites dog</em> contain exactly the same words with exactly the same counts, so they produce identical vectors. Any system built on this representation is unable to tell them apart. That is a real loss, and it is accepted because for the purpose of judging topical relevance, which words appear turns out to carry most of the signal, and counting words is enormously cheaper than modeling their arrangement.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Separating a Document Into Counts</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1rem">
      <button onclick="blendGo()" id="blend-btn" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Separate into words &#8594;</button>
      <button onclick="blendReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">Reset</button>
    </div>
    <canvas id="blend-canvas" width="640" height="270" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="blend-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.2rem">A short review. Press the button to reduce it to word counts.</div>
  </div>
</div>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">What the Representation Cannot See</span></div>
  <div class="viz-body">
    <canvas id="blend2-canvas" width="640" height="170" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center">Two sentences with opposite meanings produce bit-for-bit identical vectors. Word order is not recoverable from a bag of words.</div>
  </div>
</div>

<h2 class="lesson-h2">The Term-Document Matrix</h2>
<p class="lesson-p">Stack the vectors for every document in the collection and the result is a <strong>term-document matrix</strong>: one row per vocabulary word, one column per document, each cell holding the count of that word in that document. The matrix supports two readings, and both are useful. Read a <em>column</em> and you have a document represented as a vector of word counts. Read a <em>row</em> and you have a word represented by its distribution across documents, which is the same idea used to build word embeddings from co-occurrence.</p>
<p class="lesson-p">The four documents below are two mountaineering texts and two cycling texts, with six words counted across them. Documents live in a space with one dimension per vocabulary word, which cannot be drawn, so pick any two words as axes and project. The choice matters: click a row or column below to lift it out, then choose axes. Selecting <em>summit</em> and <em>derailleur</em> splits the mountains from the bicycles immediately. Selecting <em>gear</em> and <em>route</em> piles all four into one indistinguishable cluster, because both words are frequent in every one of them and therefore say nothing about which document you are looking at. That observation is exactly what the next section formalizes.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Term-Document Matrix</span></div>
  <div class="viz-body">
    <canvas id="tdm-canvas" width="640" height="230" style="width:100%;max-width:640px;display:block;margin:0 auto;cursor:pointer"></canvas>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin:1rem 0;align-items:center">
      <span style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">plot axes:</span>
      <select id="tdm-x" onchange="tdmDraw()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.35rem .5rem;font-family:var(--mono);font-size:.68rem"></select>
      <select id="tdm-y" onchange="tdmDraw()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.35rem .5rem;font-family:var(--mono);font-size:.68rem"></select>
      <button onclick="tdmAxes('summit','derailleur')" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.35rem .7rem;font-family:var(--mono);font-size:.64rem;cursor:pointer">summit / derailleur</button>
      <button onclick="tdmAxes('gear','route')" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.35rem .7rem;font-family:var(--mono);font-size:.64rem;cursor:pointer">gear / route</button>
    </div>
    <canvas id="tdm2-canvas" width="640" height="240" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="tdm-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.2rem"></div>
  </div>
</div>

<div class="quiz-block" id="qir-bow"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does a row of the term-document matrix represent?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qir-bow','Correct. A row gives one word&rsquo;s counts across all documents, which is a distributional profile of that word; a column gives one document&rsquo;s word counts.')">One word&rsquo;s distribution of counts across all documents</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-bow','That is a column: one document as a vector of word counts.')">One document as a vector of word counts</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-bow','Order is exactly what the bag-of-words representation discards.')">The order of words in a document</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-bow','Similarity scores are computed from the matrix, not stored in its cells; cells hold counts.')">The similarity between two documents</button>
</div><div class="quiz-explain" id="qir-bow-explain"></div></div>`;

// ── 11.1.2 TF-IDF AND BM25 ─────────────────────────────────
IR_PAGES.tfidf = `
<div class="lesson-chapter-label">Section 11.1.2</div>
<h1 class="lesson-h1">Weighting Terms: tf-idf and BM25</h1>
<p class="lesson-intro">Raw counts are a poor weighting. They treat a word appearing 100 times as a hundred times more important than a word appearing once, and they treat <em>the</em>, which appears in every document, as equally informative as <em>crampon</em>, which appears in one. The tf-idf weighting fixes both problems with two multiplied factors, one about the document and one about the collection.</p>

<h2 class="lesson-h2">Damping the Term Frequency</h2>
<p class="lesson-p">A document that mentions a word twenty times is more about that word than one mentioning it twice, but not ten times more. The relationship should be increasing and strongly compressed, which is what a logarithm provides:</p>
<div class="lesson-math" id="ir-tf">\\[\\mathrm{tf}_{t,d} = \\begin{cases}1 + \\log_{10} \\mathrm{count}(t,d) & \\text{if } \\mathrm{count}(t,d) > 0\\\\ 0 & \\text{otherwise}\\end{cases}\\]</div>
<p class="lesson-p">A count of 1 gives tf = 1, a count of 10 gives 2, a count of 100 gives 3, and a count of 1000 gives 4. The special case for zero is needed because log 0 is undefined, and a word that does not occur should contribute nothing.</p>

<h2 class="lesson-h2">Penalizing Common Words</h2>
<p class="lesson-p">The second factor asks how many documents in the collection contain the term at all. Let df<sub>t</sub> be that <strong>document frequency</strong> and N the collection size. The <strong>inverse document frequency</strong> is</p>
<div class="lesson-math" id="ir-idf">\\[\\mathrm{idf}_t = \\log_{10}\\!\\left(\\frac{N}{\\mathrm{df}_t}\\right)\\]</div>
<p class="lesson-p">A term occurring in every document has df = N, so idf = log 1 = 0, and its weight vanishes entirely no matter how often it occurs. Take a collection of 48 route guides: a term appearing in just one of them has idf = log(48) &asymp; 1.68. Note that idf uses document frequency, not total count: a word that appears fifty times but all within a single document is still rare in the collection sense, and should still discriminate. The final weight multiplies the two factors:</p>
<div class="lesson-math" id="ir-tfidf">\\[w_{t,d} = \\mathrm{tf}_{t,d} \\times \\mathrm{idf}_t\\]</div>
<p class="lesson-p">Move the two sliders below. The left panel compares raw counts against the damped tf; the right shows six words from those 48 guides as points whose height is their idf, dropping to the floor as document frequency rises.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Two Factors</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:1rem">
      <label style="font-family:var(--mono);font-size:.7rem;color:var(--accent);flex:1;min-width:200px">raw count of the term <input id="tfd-tf" type="range" min="1" max="1000" step="1" value="10" oninput="tfdSet()" style="width:100%;accent-color:var(--accent)"> <span id="tfd-tfv">10</span></label>
      <label style="font-family:var(--mono);font-size:.7rem;color:var(--accent3);flex:1;min-width:200px">document frequency (of 48 guides) <input id="tfd-df" type="range" min="1" max="48" step="1" value="1" oninput="tfdSet()" style="width:100%;accent-color:var(--accent3)"> <span id="tfd-dfv">1</span></label>
    </div>
    <canvas id="tfd-canvas" width="640" height="250" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="tfd-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<h2 class="lesson-h2">BM25: Saturation and Length</h2>
<p class="lesson-p">BM25 is the standard refinement of tf-idf and remains the default sparse ranking function in production systems. It keeps idf and replaces the logarithmic tf with a saturating function, then adds a correction for document length. Note that the numerator here is the <em>raw</em> count of the term in the document, not the log-damped \\(\\mathrm{tf}_{t,d}\\) of the previous section: BM25 does its own damping. The score of document d for query q is the sum over query terms:</p>
<div class="lesson-math" id="ir-bm25">\\[\\mathrm{score}(q,d) = \\sum_{t \\in q} \\log\\!\\left(\\frac{N}{\\mathrm{df}_t}\\right) \\cdot \\frac{\\mathrm{count}(t,d)}{k\\left(1 - b + b\\dfrac{|d|}{|d_{avg}|}\\right) + \\mathrm{count}(t,d)}\\]</div>
<p class="lesson-p">Two parameters control it. The parameter <strong>k</strong> sets how quickly term frequency saturates: as k approaches 0 the fraction approaches 1 for any nonzero count, so the score depends only on whether the term is present, not how often; as k grows, the count matters more nearly linearly. The parameter <strong>b</strong>, between 0 and 1, controls length normalization: at b = 0 document length is ignored entirely, while at b = 1 the term frequency is fully divided by the document&rsquo;s length relative to the collection average, which stops long documents from ranking highly merely by containing more of everything. Values around k between 1.2 and 2 and b = 0.75 work well across many collections and are the usual defaults. Turn the knobs below and watch the ranking reorder.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The BM25 Parameters</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
      <label style="font-family:var(--mono);font-size:.7rem;color:var(--accent);flex:1;min-width:180px">k = <span id="bm25-kv">1.20</span> <input id="bm25-k" type="range" min="0" max="6" step="0.05" value="1.2" oninput="bm25Set()" style="width:100%;accent-color:var(--accent)"></label>
      <label style="font-family:var(--mono);font-size:.7rem;color:var(--accent3);flex:1;min-width:180px">b = <span id="bm25-bv">0.75</span> <input id="bm25-b" type="range" min="0" max="1" step="0.01" value="0.75" oninput="bm25Set()" style="width:100%;accent-color:var(--accent3)"></label>
      <button onclick="bm25Preset()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">defaults</button>
    </div>
    <canvas id="bm25-canvas" width="640" height="260" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="bm25-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<h2 class="lesson-h2">A Note on Stop Words</h2>
<p class="lesson-p">An older practice removed the most frequent words from documents entirely using a fixed <strong>stop list</strong>. With idf weighting this is largely unnecessary, since frequent words already receive weights near zero, and it can be actively harmful: applying a stop list to the query <em>what to do about it</em> deletes the query outright, because every one of those five words sits on a standard stop list. Modern systems generally keep all terms and let the weighting handle it.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; What a Stop List Removes</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;justify-content:center;margin-bottom:1rem"><button onclick="shredGo()" style="background:var(--accent3);color:#fff;border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Apply the stop list</button></div>
    <div id="shred-out" style="background:var(--panel);border-radius:10px;padding:1rem;font-family:var(--mono);font-size:.9rem;line-height:2;color:#ECF1FF;min-height:3rem;text-align:center"></div>
    <div id="shred-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;text-align:center"></div>
  </div>
</div>

<div class="quiz-block" id="qir-tfidf"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What happens to a term that appears in every document of the collection?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qir-tfidf','Correct. df = N gives idf = log(N/N) = log 1 = 0, and multiplying by zero removes the term&rsquo;s contribution regardless of how often it occurs.')">Its idf is exactly 0, so its weight is 0 no matter how often it occurs</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-tfidf','High raw counts are damped by the log, and the idf factor then zeroes the weight entirely.')">It gets the highest weight because it is so frequent</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-tfidf','Removal is what a stop list does; idf achieves the effect through weighting instead.')">It is deleted from the vocabulary automatically</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-tfidf','idf depends only on document frequency, which is identical for all documents here.')">Its weight depends on which document it is in</button>
</div><div class="quiz-explain" id="qir-tfidf-explain"></div></div>`;

// ── 11.1.3 COSINE ──────────────────────────────────────────
IR_PAGES.cosine = `
<div class="lesson-chapter-label">Section 11.1.3</div>
<h1 class="lesson-h1">Relevance as an Angle</h1>
<p class="lesson-intro">The dot product grows when query and document vectors put weight on the same terms, but also depends on their magnitudes. Cosine similarity normalizes those magnitudes. Compare how the two scores respond when you scale a document vector.</p>

<h2 class="lesson-h2">Normalizing Away Length</h2>
<p class="lesson-p">Dividing the dot product by both vector lengths removes the magnitude entirely, leaving only the angle between the two vectors. This is the <strong>cosine similarity</strong> from embeddings, applied here to documents rather than words:</p>
<div class="lesson-math" id="ir-cos">\\[\\mathrm{score}(q,d) = \\cos(\\mathbf{q}, \\mathbf{d}) = \\frac{\\mathbf{q} \\cdot \\mathbf{d}}{|\\mathbf{q}|\\,|\\mathbf{d}|} = \\frac{\\displaystyle\\sum_{t \\in q} w_{t,q}\\, w_{t,d}}{\\sqrt{\\displaystyle\\sum_{t \\in q} w_{t,q}^2}\\;\\sqrt{\\displaystyle\\sum_{t \\in d} w_{t,d}^2}}\\]</div>
<p class="lesson-p">Because all weights are non-negative, the cosine ranges from 0, meaning the vectors share no terms and are orthogonal, to 1, meaning they point in exactly the same direction. Two properties are worth noticing in the formula itself. First, the numerator only receives contributions from terms present in both the query and the document; every term in one but not the other multiplies by zero. Second, since queries are short, the sum runs over just a few terms, which is what makes the whole thing fast.</p>
<p class="lesson-p">Drag the query vector below and watch the ranking reorder as the angles change. Then press the duplicate button, which concatenates one document to itself: every weight doubles, the arrow becomes twice as long, and the score does not move at all, because the direction is unchanged. That is length invariance, and it is the property the normalization was introduced to obtain.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Ranking by Angle</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
      <label style="font-family:var(--mono);font-size:.7rem;color:var(--muted);flex:1;min-width:220px">query direction <input id="cosk-a" type="range" min="0" max="90" step="1" value="35" oninput="coskSet()" style="width:100%;accent-color:var(--accent)"></label>
      <button onclick="coskDup()" id="cosk-dup" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">duplicate document 1</button>
    </div>
    <canvas id="cosk-canvas" width="640" height="290" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="cosk-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<div class="quiz-block" id="qir-cos"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is the dot product alone unsuitable as a relevance score?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qir-cos','Correct. The dot product scales with vector magnitude, so longer documents score higher for reasons unrelated to relevance; dividing by both norms removes the effect.')">It grows with vector magnitude, so long documents score highly regardless of relevance</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-cos','The dot product is cheap; cost is not the problem.')">It is too expensive to compute</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-cos','With non-negative tf-idf weights the dot product cannot be negative.')">It can be negative for tf-idf vectors</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-cos','Shared terms are exactly what it measures; the flaw is the magnitude sensitivity.')">It ignores terms shared by the query and document</button>
</div><div class="quiz-explain" id="qir-cos-explain"></div></div>`;

// ── 11.1.4 INVERTED INDEX ──────────────────────────────────
IR_PAGES.invidx = `
<div class="lesson-chapter-label">Section 11.1.4</div>
<h1 class="lesson-h1">The Inverted Index</h1>
<p class="lesson-intro">The scoring function is now defined, but computing it against every document in a collection of billions is not possible within the time a user will wait. What makes retrieval fast is a data structure, and it follows from one observation about the cosine formula: only terms that appear in both the query and the document contribute anything. Documents containing none of the query terms score exactly zero, so there is no reason to examine them.</p>

<h2 class="lesson-h2">The Structure</h2>
<p class="lesson-p">An <strong>inverted index</strong> stores, for every term in the vocabulary, the list of documents that contain it. It has two parts. The <strong>dictionary</strong> maps each term to its document frequency and a pointer. The <strong>postings list</strong> for that term is the list of documents containing it, each entry recording the document identifier and the term frequency within it. The word &ldquo;inverted&rdquo; is literal: an ordinary forward index maps documents to their words, and this structure is that mapping transposed.</p>
<p class="lesson-p">Query processing then walks only the postings lists of the query&rsquo;s terms, accumulating scores for the documents that actually appear in them. The number of documents touched is the number containing at least one query term, which for a specific query is a minute fraction of the collection. Build an index from four short documents below, then query it, then transpose it back to the forward view to confirm that the same information is present either way.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Building and Querying an Index</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
      <button onclick="idx2Build()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.45rem 1rem;font-family:var(--mono);font-size:.7rem;font-weight:700;cursor:pointer">Build the index</button>
      <button onclick="idx2Flip()" id="idx2-flip" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.45rem .9rem;font-family:var(--mono);font-size:.7rem;cursor:pointer">show forward index</button>
      <span style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-left:auto">query a term:</span>
      <span id="idx2-terms" style="display:flex;gap:5px;flex-wrap:wrap"></span>
    </div>
    <div id="idx2-out" style="background:var(--panel);border-radius:10px;padding:1rem;font-family:var(--mono);font-size:.72rem;line-height:1.9;color:#ECF1FF;min-height:7rem"></div>
    <div id="idx2-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6"></div>
  </div>
</div>

<h2 class="lesson-h2">What It Saves</h2>
<p class="lesson-p">The comparison below runs the same query two ways as the collection grows. A linear scan examines every document, so the work it does is proportional to the collection size N. The indexed version follows a pointer and walks one short postings list, so its work depends on how many documents contain the term, not on how many exist. Drag the collection size and watch the two counters separate.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Scan Versus Index</span></div>
  <div class="viz-body">
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>collection size N</span><span id="race2-nv" style="color:var(--accent)">1,000</span></div>
      <input id="race2-n" type="range" min="0.6" max="6" step="0.05" value="3" oninput="race2Set()" style="width:100%;accent-color:var(--accent)">
    </div>
    <canvas id="race2-canvas" width="640" height="240" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="race2-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.2rem"></div>
  </div>
</div>

<div class="quiz-block" id="qir-idx"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can a retrieval system safely ignore most documents in the collection?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qir-idx','Correct. The numerator of the cosine only receives contributions from shared terms, so a document with no query terms scores exactly zero and cannot enter the ranking.')">Documents sharing no terms with the query score exactly zero</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-idx','The index is exact for the terms it covers; it is not an approximation in the sparse setting.')">The index is an approximation that accepts some error</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-idx','Document length affects the score through normalization but never rules a document out.')">Long documents are excluded automatically</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-idx','Recency is not part of the cosine score at all.')">Only recently added documents are searched</button>
</div><div class="quiz-explain" id="qir-idx-explain"></div></div>`;

// ── 11.2 EVALUATING A RANKED LIST ──────────────────────────
IR_PAGES.ireval = `
<div class="lesson-chapter-label">Section 11.2</div>
<h1 class="lesson-h1">Evaluating a Ranked List</h1>
<p class="lesson-intro">Precision and recall were defined earlier for a set of predictions. Retrieval returns a ranked list, which is more informative than a set: a system that puts the relevant documents at ranks 1 and 2 is better than one that puts them at 20 and 21, even though both returned the same set. Evaluation must therefore be sensitive to position.</p>

<h2 class="lesson-h2">Precision and Recall at Each Rank</h2>
<p class="lesson-p">The standard approach is to read the ranked list from the top and, after each document, compute precision and recall over everything seen so far. If the system has returned k documents of which r are relevant, and the collection contains R relevant documents in total:</p>
<div class="lesson-math" id="ir-pr">\\[P@k = \\frac{r}{k}, \\qquad R@k = \\frac{r}{R}\\]</div>
<p class="lesson-p">Their behavior as k increases is quite different, and the difference is structural. Recall can only increase or stay flat, since the denominator R is fixed and the numerator r never decreases. Precision moves both ways: it rises when a relevant document is added and falls when an irrelevant one is. Scrub down the ranked list below and watch the two meters. Every relevant document advances recall and lifts precision; every irrelevant one leaves recall untouched and pulls precision down.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Descending a Ranked List</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
      <button onclick="ribPlay()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.45rem 1rem;font-family:var(--mono);font-size:.7rem;font-weight:700;cursor:pointer">&#9654; Descend</button>
      <button onclick="ribInterp()" id="rib-interp" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.45rem .9rem;font-family:var(--mono);font-size:.7rem;cursor:pointer">interpolate the curve</button>
      <button onclick="ribMAP()" id="rib-map" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.45rem .9rem;font-family:var(--mono);font-size:.7rem;cursor:pointer">show average precision</button>
      <label style="font-family:var(--mono);font-size:.68rem;color:var(--muted);flex:1;min-width:180px">rank <input id="rib-k" type="range" min="0" max="25" step="1" value="0" oninput="ribSet(this.value)" style="width:100%;accent-color:var(--accent)"></label>
    </div>
    <canvas id="rib-canvas" width="640" height="320" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="rib-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Interpolation and Mean Average Precision</h2>
<p class="lesson-p">Plotting precision against recall produces a sawtooth, because precision dips at every irrelevant document and recovers at the next relevant one. The dips are an artifact of the exact positions rather than a property worth reporting, so curves are conventionally <strong>interpolated</strong>: the precision reported at a given recall level is the maximum precision achieved at that recall level or any higher one.</p>
<div class="lesson-math" id="ir-interp">\\[P_{\\mathrm{interp}}(r) = \\max_{r' \\ge r} P(r')\\]</div>
<p class="lesson-p">This replaces the sawtooth with a decreasing staircase and makes curves from different systems comparable. To summarize a ranking in a single number, <strong>average precision</strong> takes the precision at each rank where a relevant document was found and averages those values, which rewards putting relevant documents early. Averaging that quantity over a set of queries gives <strong>mean average precision</strong>. The two levels of averaging are the part people mix up: the inner average is over the relevant documents of one query, the outer is over queries.</p>
<div class="lesson-math" id="ir-map">\\[\\mathrm{AP} = \\frac{1}{|R|}\\sum_{d \\in R} P@\\mathrm{rank}(d), \\qquad \\mathrm{MAP} = \\frac{1}{|Q|}\\sum_{q \\in Q} \\mathrm{AP}(q)\\]</div>

<div class="quiz-block" id="qir-eval"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can recall never decrease as you go further down a ranked list?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qir-eval','Correct. Recall is r/R with R fixed by the collection, and r counts relevant documents found so far, which can only stay the same or grow as more documents are examined.')">Its denominator is fixed and its numerator counts relevant documents found so far</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-eval','Rankings are not required to place relevant documents first; that is what is being measured.')">Because relevant documents are always ranked first</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-eval','Interpolation smooths the precision axis; recall is monotonic before any interpolation.')">Because the curve is interpolated</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-eval','Precision is the quantity that falls on an irrelevant document; recall simply stays flat.')">Because irrelevant documents lower it only slightly</button>
</div><div class="quiz-explain" id="qir-eval-explain"></div></div>`;

// ── 11.3 DENSE RETRIEVAL ───────────────────────────────────
IR_PAGES.dense = `
<div class="lesson-chapter-label">Section 11.3</div>
<h1 class="lesson-h1">Dense Retrieval</h1>
<p class="lesson-intro">A relevant document may use different words from the query. This is the <strong>vocabulary mismatch</strong> problem. Dense retrieval uses learned representations to find semantic matches that term overlap can miss.</p>

<h2 class="lesson-h2">The Failure, Precisely</h2>
<p class="lesson-p">Consider the query <em>how do I fix my car&rsquo;s engine noise</em> and the document <em>automobile motor rattling repair guide</em>. To a reader these are obviously about the same thing. To a term-matching scorer they share no content words at all: <em>car</em> is not <em>automobile</em>, <em>engine</em> is not <em>motor</em>, <em>noise</em> is not <em>rattling</em>, <em>fix</em> is not <em>repair</em>. Every product in the cosine numerator is zero, so the score is exactly zero and the document is unreachable, regardless of how the weights are tuned. Use the slider below to substitute the author&rsquo;s exact words one at a time and watch the sparse score stay at zero until you happen to guess them.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Vocabulary Mismatch</span></div>
  <div class="viz-body">
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>rewrite the query toward the document&rsquo;s vocabulary</span><span id="vmw-nv" style="color:var(--accent)">0 of 4 words replaced</span></div>
      <input id="vmw-n" type="range" min="0" max="4" step="1" value="0" oninput="vmwSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <canvas id="vmw-canvas" width="640" height="270" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="vmw-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Encoding Both Sides Into One Space</h2>
<p class="lesson-p">Dense retrieval replaces term overlap with meaning. Both the query and the document are passed through encoders of the kind built for masked language models, producing fixed-length vectors, and relevance is their similarity in that shared space:</p>
<div class="lesson-math" id="ir-dense">\\[\\mathrm{score}(q,d) = \\mathbf{z}_q \\cdot \\mathbf{z}_d, \\qquad \\mathbf{z}_q = \\mathrm{BERT}_Q(q)[\\mathrm{CLS}], \\quad \\mathbf{z}_d = \\mathrm{BERT}_D(d)[\\mathrm{CLS}]\\]</div>
<p class="lesson-p">Because the encoders were trained so that texts with similar meanings receive similar vectors, <em>car</em> and <em>automobile</em> land near each other whether or not they ever co-occur, and the pair above scores highly despite sharing no words.</p>

<h2 class="lesson-h2">Three Architectures, One Tradeoff</h2>
<p class="lesson-p">There is a design choice about when the query and document interact, and it determines both accuracy and cost. A <strong>cross-encoder</strong> concatenates the query and document and runs them through one encoder together, so every query token attends to every document token. This is the most accurate arrangement and the most expensive: nothing can be precomputed, because the document&rsquo;s representation depends on the query, so scoring a collection of eight million documents requires eight million encoder passes per query. That is not deployable as a first-stage retriever.</p>
<p class="lesson-p">A <strong>bi-encoder</strong> is the opposite: query and document are encoded separately, each into a single vector, and scoring is one dot product. Document vectors are computed once, offline, and stored, so a query costs exactly one encoder pass plus a nearest-neighbor lookup. Accuracy is lower, because the query never sees the document during encoding, but this is the arrangement that scales.</p>
<p class="lesson-p"><strong>ColBERT</strong> sits between them. Each side is encoded separately, preserving one vector per token rather than collapsing to one vector per text, and the score sums, over query tokens, the best match each finds among the document tokens:</p>
<div class="lesson-math" id="ir-maxsim">\\[\\mathrm{score}(q,d) = \\sum_{i \\in q} \\max_{j \\in d} \\; \\mathbf{z}_i \\cdot \\mathbf{z}_j\\]</div>
<p class="lesson-p">Document token vectors are still precomputable, so it keeps most of the bi-encoder&rsquo;s efficiency while recovering some of the fine-grained matching. Slide through the three architectures below and watch both the wiring and the two meters.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Cross-Encoder, ColBERT, Bi-Encoder</span></div>
  <div class="viz-body">
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>interaction between query and document</span><span id="arch-nv" style="color:var(--accent)">cross-encoder</span></div>
      <input id="arch-s" type="range" min="0" max="2" step="1" value="0" oninput="archSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <label style="font-family:var(--mono);font-size:.68rem;color:var(--muted);display:flex;align-items:center;gap:6px;margin-bottom:1rem"><input type="checkbox" id="arch-rerank" onchange="archDraw()"> two-stage: BM25 retrieves 1000, cross-encoder rescores the top 50</label>
    <canvas id="arch-canvas" width="640" height="290" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="arch-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Searching the Vector Space</h2>
<p class="lesson-p">One problem remains. The inverted index of Section 11.1.4 works because sparse vectors have few nonzero coordinates, giving a natural key to index on. Dense vectors are nonzero in every dimension, so that structure does not apply, and comparing a query against every stored vector is again a linear scan. The practical answer is <strong>approximate nearest neighbor</strong> search, implemented in libraries such as Faiss: the space is partitioned in advance, and a query searches only the partitions near it. This is sublinear rather than exhaustive, and it is genuinely approximate. Occasionally the true nearest document sits just across a partition boundary and is missed. Systems accept that, because the recall lost is small and the speedup is several orders of magnitude.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Exact Versus Approximate Search</span></div>
  <div class="viz-body">
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>cells searched around the query</span><span id="msim-nv" style="color:var(--accent)">1</span></div>
      <input id="msim-n" type="range" min="0" max="9" step="1" value="1" oninput="msimSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <canvas id="msim-canvas" width="640" height="280" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="msim-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<div class="quiz-block" id="qir-dense"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can a cross-encoder not be used to search a large collection directly?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qir-dense','Correct. Because the document representation depends on the query, nothing can be precomputed, so every document in the collection requires its own encoder pass at query time.')">Its document representations depend on the query, so nothing can be precomputed</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-dense','Cross-encoders are the most accurate of the three; cost is what rules them out as first-stage retrievers.')">It is less accurate than a bi-encoder</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-dense','It handles both texts at once by design; that is precisely what makes it accurate.')">It cannot process a query and document together</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-dense','Vocabulary mismatch is solved by all dense architectures, cross-encoders included.')">It suffers from vocabulary mismatch</button>
</div><div class="quiz-explain" id="qir-dense-explain"></div></div>`;

// ── 11.4 RAG ───────────────────────────────────────────────
IR_PAGES.ragsec = `
<div class="lesson-chapter-label">Section 11.4</div>
<h1 class="lesson-h1">Retrieval-Augmented Generation</h1>
<p class="lesson-intro">RAG retrieves passages, adds them to the prompt, and asks the model to answer using that context. The model still brings its learned knowledge to the task, so retrieved text guides the answer without guaranteeing that every claim is supported.</p>

<h2 class="lesson-h2">The Assembly</h2>
<p class="lesson-p">Mechanically, RAG is prompt construction. The retriever returns the top k passages, which are concatenated with the question into a single prompt, typically with an instruction to answer from the provided context. Generation then proceeds exactly as before, one token at a time, conditioned on that assembled prompt. No weights change and no new architecture is involved; the entire method is a change to what the model is conditioned on.</p>
<p class="lesson-p">The switch in the demonstration below is the whole argument in one control. With retrieval off, the model answers from its weights and produces a confident, wrong date. With retrieval on, the passage containing the correct date is placed in the prompt and the answer changes, with the supporting passage highlighted as it is used.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The RAG Assembly Line</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
      <button onclick="raglToggle()" id="ragl-sw" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.45rem 1rem;font-family:var(--mono);font-size:.7rem;cursor:pointer">retrieval: OFF</button>
      <button onclick="raglRun()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.45rem 1.1rem;font-family:var(--mono);font-size:.7rem;font-weight:700;cursor:pointer">&#9654; Answer the question</button>
    </div>
    <canvas id="ragl-canvas" width="640" height="300" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="ragl-out" style="background:var(--panel);border-radius:10px;padding:.9rem 1rem;font-family:var(--mono);font-size:.74rem;line-height:1.8;color:#ECF1FF;margin-top:1rem;min-height:3rem"></div>
    <div id="ragl-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Retrieval Quality Determines Answer Quality</h2>
<p class="lesson-p">RAG inherits the retriever&rsquo;s mistakes. If the top k passages are mostly irrelevant, the model has to answer around them, and in practice it often does not: it drifts toward whatever the distractor passages discuss, since they are sitting in its context with as much apparent authority as the correct one. Two mitigations matter. A <strong>reranker</strong>, typically the cross-encoder of Section 11.3, rescores the retrieved candidates so the genuinely relevant ones move to the top before the prompt is assembled. And the <strong>order</strong> of passages within the prompt has a measurable effect on its own: models attend unevenly across a long context, so the same passage set arranged differently can produce different answers.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Distractor Passages and Reranking</span></div>
  <div class="viz-body">
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>share of retrieved passages that are irrelevant</span><span id="noise-nv" style="color:var(--accent)">0%</span></div>
      <input id="noise-n" type="range" min="0" max="80" step="10" value="0" oninput="noiseSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <label style="font-family:var(--mono);font-size:.68rem;color:var(--muted);display:flex;align-items:center;gap:6px;margin-bottom:1rem"><input type="checkbox" id="noise-rr" onchange="noiseDraw()"> apply a cross-encoder reranker before assembling the prompt</label>
    <canvas id="noise-canvas" width="640" height="250" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="noise-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Multiple Retrievals and Routing</h2>
<p class="lesson-p">Some questions cannot be answered by one retrieval, because the query does not contain the terms needed to find the answer. Asking which director of the film that won Best Picture for 2001 also directed a film about the Apollo programme requires first finding that year&rsquo;s winner, then searching again using the title it returns. This is <strong>multi-hop</strong> retrieval: the result of one retrieval becomes the query for the next. Step through the chain below and use the single-hop toggle to see it fail.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Multi-Hop Retrieval</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
      <button onclick="hopStep()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.45rem 1rem;font-family:var(--mono);font-size:.7rem;font-weight:700;cursor:pointer">Next hop &#8594;</button>
      <button onclick="hopReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.45rem .9rem;font-family:var(--mono);font-size:.7rem;cursor:pointer">Reset</button>
      <label style="font-family:var(--mono);font-size:.68rem;color:var(--muted);display:flex;align-items:center;gap:6px;margin-left:auto"><input type="checkbox" id="hop-single" onchange="hopReset()"> restrict to a single hop</label>
    </div>
    <canvas id="hop-canvas" width="640" height="250" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="hop-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<p class="lesson-p">Not every turn needs retrieval at all, and when it does, the right collection depends on the question. A deployed system therefore puts a <strong>router</strong> in front of the retriever, deciding whether to search and where. A greeting needs no search; a question about last quarter&rsquo;s numbers needs the private document store; a question about yesterday&rsquo;s news needs the web.</p>

<h2 class="lesson-h2">Citations and Their Failure Mode</h2>
<p class="lesson-p">Because RAG answers are produced from specific retrieved passages, the system can attach a citation to each claim, which is a genuine advantage over parametric answering: the user can check the source. But the citation is only as trustworthy as the link between claim and passage. Models sometimes produce a claim that no retrieved passage supports and attach a citation marker anyway, which is worse than no citation, because the marker signals verification that did not occur. In the demonstration below, hover each claim to trace it back. One of them traces back to nothing.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Tracing Citations</span></div>
  <div class="viz-body">
    <div id="cite-answer" style="background:var(--panel);border-radius:10px;padding:1rem;font-family:var(--mono);font-size:.74rem;line-height:2;color:#ECF1FF;margin-bottom:1rem"></div>
    <div id="cite-src" style="display:flex;flex-direction:column;gap:8px"></div>
    <div id="cite-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem">Hover or tap a numbered claim to trace it to its passage.</div>
  </div>
</div>

<div class="quiz-block" id="qir-rag"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does RAG actually change about the model?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qir-rag','Correct. RAG is prompt construction: retrieved passages are placed in the context, and generation proceeds normally. No weights are updated and no architecture changes.')">Nothing about the model; it changes what the model is conditioned on</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-rag','No gradient updates occur; the retrieved text enters through the prompt, not through training.')">It finetunes the model on the retrieved passages</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-rag','The architecture is unchanged; a retriever is added in front of it.')">It adds a retrieval layer inside the transformer</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-rag','The decoding algorithm is unchanged; the usual sampling applies.')">It replaces sampling with exact lookup</button>
</div><div class="quiz-explain" id="qir-rag-explain"></div></div>`;

// ── 11.5 DATASETS ──────────────────────────────────────────
IR_PAGES.qadata = `
<div class="lesson-chapter-label">Section 11.5</div>
<h1 class="lesson-h1">Where Questions Come From</h1>
<p class="lesson-intro">Question-answering systems are compared on standard datasets, and the datasets differ along two axes that determine what they actually measure. Knowing where a benchmark sits on those axes tells you what a good score on it means.</p>

<h2 class="lesson-h2">Two Axes</h2>
<p class="lesson-p">The first axis is where the questions came from. Some are <strong>naturally information-seeking</strong>: real people typed them because they wanted to know, so the distribution reflects genuine curiosity, including vagueness and questions with no good answer. Others are <strong>designed for probing</strong>: written by experts to test specific knowledge, which gives clean coverage of a syllabus but a distribution nothing like real usage.</p>
<p class="lesson-p">The second axis is what the system may consult. In the <strong>closed-book</strong> setting the model answers from its weights alone. In the <strong>open-book</strong> setting it is given documents, which is the RAG setting and measures reading and synthesis rather than memorization. Some datasets can be run either way, which makes them useful for measuring exactly what retrieval adds. Explore the map below; each point has a real example question.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Dataset Map</span></div>
  <div class="viz-body">
    <canvas id="dsl-canvas" width="640" height="300" style="width:100%;max-width:640px;display:block;margin:0 auto;cursor:pointer"></canvas>
    <div style="margin:1rem 0">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.7rem;color:var(--muted);margin-bottom:5px"><span>Natural Questions: run it closed-book or open-book</span><span id="dsl-nq" style="color:var(--accent)">open-book</span></div>
      <input id="dsl-slider" type="range" min="0" max="1" step="0.01" value="1" oninput="dslNQ(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <div id="dsl-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);line-height:1.7;min-height:3.4rem">Click a dataset for a sample question.</div>
  </div>
</div>

<div class="quiz-block" id="qir-data"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What distinguishes an open-book from a closed-book evaluation?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qir-data','Correct. Open-book supplies documents and measures reading and synthesis; closed-book withholds them and measures what the weights alone contain.')">Whether the system is given documents to answer from</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-data','Both settings occur with multiple-choice and freeform answers alike.')">Whether answers are multiple choice</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-data','Dataset size is unrelated to the open/closed distinction.')">How many questions the dataset contains</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-data','Both settings can use either exact match or token F1.')">Which scoring metric is used</button>
</div><div class="quiz-explain" id="qir-data-explain"></div></div>`;

// ── 11.6 EM AND F1 ─────────────────────────────────────────
IR_PAGES.emf1 = `
<div class="lesson-chapter-label">Section 11.6</div>
<h1 class="lesson-h1">Exact Match and Token F1</h1>
<p class="lesson-intro">A system produces a free-form string; a gold answer is a different free-form string. Deciding automatically whether they agree is harder than it sounds, and the two standard metrics fail in opposite directions.</p>

<h2 class="lesson-h2">Exact Match</h2>
<p class="lesson-p"><strong>Exact match</strong> scores 1 if the normalized prediction is character-for-character identical to a gold answer and 0 otherwise. Normalization usually lowercases, strips punctuation, and removes leading articles. The metric is unambiguous and trivially reproducible, which is why it is reported, but it is brutally strict: predicting &ldquo;Paris, France&rdquo; against the gold answer &ldquo;Paris&rdquo; scores zero despite being correct and arguably more informative. Because most datasets provide several acceptable gold answers, the score is the maximum over them.</p>

<h2 class="lesson-h2">Token F1</h2>
<p class="lesson-p">The alternative treats both strings as bags of tokens and measures their overlap, using the precision, recall, and F1 defined earlier. Precision is the share of predicted tokens that appear in the gold answer, recall is the share of gold tokens that appear in the prediction, and F1 is their harmonic mean:</p>
<div class="lesson-math" id="ir-f1">\\[P = \\frac{|T_{pred} \\cap T_{gold}|}{|T_{pred}|}, \\qquad R = \\frac{|T_{pred} \\cap T_{gold}|}{|T_{gold}|}, \\qquad F_1 = \\frac{2PR}{P+R}\\]</div>
<p class="lesson-p">This awards partial credit, so &ldquo;Paris, France&rdquo; scores well against &ldquo;Paris&rdquo; instead of scoring nothing. But it has its own blind spot, and it is the mirror image of exact match&rsquo;s: because it compares bags of tokens, it cannot see word order, exactly as in Section 11.1.1. A prediction that reverses the meaning of the gold answer while reusing its words scores highly. Neither metric is a measure of correctness; each is a cheap approximation that fails in a characteristic way. Work through the preset pairs below, particularly the last one.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Two Graders, One Answer</span></div>
  <div class="viz-body">
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:1rem">
      <label style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">gold answer</label>
      <input id="grade-gold" type="text" value="Paris" oninput="gradeDraw()" style="width:100%;background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.55rem .8rem;font-family:var(--mono);font-size:.74rem;box-sizing:border-box">
      <label style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">system prediction</label>
      <input id="grade-pred" type="text" value="Paris, France" oninput="gradeDraw()" style="width:100%;background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.55rem .8rem;font-family:var(--mono);font-size:.74rem;box-sizing:border-box">
    </div>
    <div id="grade-presets" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:1rem"></div>
    <canvas id="grade-canvas" width="640" height="240" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="grade-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<div class="quiz-block" id="qir-emf1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Which failure is characteristic of token F1?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qir-emf1','Correct. F1 compares bags of tokens, so a prediction that reuses the gold answer&rsquo;s words in an order that reverses the meaning still scores highly.')">It scores highly on answers that reuse the gold words but reverse the meaning</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-emf1','That is exact match&rsquo;s failure; F1 exists to award partial credit.')">It gives zero credit for a nearly correct answer</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-emf1','It handles multiple gold answers the same way exact match does, by taking the maximum.')">It cannot handle multiple gold answers</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-emf1','Both metrics normalize case and punctuation before comparing.')">It is sensitive to capitalization</button>
</div><div class="quiz-explain" id="qir-emf1-explain"></div></div>`;

// ── 11.7 RECAP ─────────────────────────────────────────────
IR_PAGES.irrecap = `
<div class="lesson-chapter-label">Section 11.7</div>
<h1 class="lesson-h1">Recap</h1>
<p class="lesson-intro">Compare sparse and dense retrieval from query to ranked passages, then follow the passages into the prompt. Select a stage to revisit its explanation.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Whole Pipeline</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
      <button class="atlas-p" data-p="sparse" onclick="atlasPath('sparse')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">sparse path</button>
      <button class="atlas-p" data-p="dense" onclick="atlasPath('dense')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">dense path</button>
      <button class="atlas-p" data-p="both" onclick="atlasPath('both')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">both</button>
    </div>
    <canvas id="atlas-canvas" width="640" height="300" style="width:100%;max-width:640px;display:block;margin:0 auto;cursor:pointer"></canvas>
    <div id="atlas-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;text-align:center;min-height:2.2rem">Click a labeled stage to open its section.</div>
  </div>
</div>

<p class="lesson-p">To restate it in order. A model&rsquo;s parametric knowledge is fixed at training time, excludes private material, and is recalled unreliably, and its confidence does not indicate whether a given answer is right, so the fix must change where the information comes from rather than filter the output. Retrieval supplies that: documents are represented as weighted bags of words, with term frequency damped logarithmically and inverse document frequency zeroing out words that occur everywhere, and BM25 adding saturation and length normalization on top. Relevance is measured as the cosine between query and document vectors, which is length-invariant, and an inverted index makes scoring practical by touching only documents that contain a query term. Ranked lists are evaluated with interpolated precision-recall curves and mean average precision. Term matching fails whenever the query and document use different words for the same thing, which dense retrieval solves by encoding both into a shared vector space, with cross-encoders, ColBERT, and bi-encoders trading accuracy against cost and approximate nearest-neighbor search making the dense index practical. RAG then assembles retrieved passages into the prompt, which grounds the answer and permits citation, while making answer quality dependent on retrieval quality, passage ordering, and the honesty of the citation link. Finally, answers are graded with exact match or token F1, each of which fails in a predictable direction.</p>

<div class="quiz-block" id="qir-recap"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Where do the sparse and dense paths differ?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qir-recap','Correct. The representation, the scoring function, and the index structure differ; the query intake and everything from ranked passages onward are shared.')">In the representation, the scoring function, and the index structure</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-recap','Both produce ranked passages that feed the same prompt assembly and generation steps.')">Dense retrieval skips prompt assembly</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-recap','Exact match and token F1 apply regardless of how passages were retrieved.')">They use different answer metrics</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qir-recap','Both index the collection offline before any query arrives.')">Only the sparse path builds an index in advance</button>
</div><div class="quiz-explain" id="qir-recap-explain"></div></div>`;

// ── IR EQUATIONS ───────────────────────────────────────────
IR_EQ.tfidf = {
  'ir-tf': '\\mathrm{tf}_{t,d} = 1 + \\log_{10} \\mathrm{count}(t,d) \\;\\text{ if count} > 0,\\; \\text{else } 0',
  'ir-idf': '\\mathrm{idf}_t = \\log_{10}(N / \\mathrm{df}_t)',
  'ir-tfidf': 'w_{t,d} = \\mathrm{tf}_{t,d} \\times \\mathrm{idf}_t',
  'ir-bm25': '\\mathrm{score}(q,d) = \\sum_{t \\in q} \\log(N/\\mathrm{df}_t) \\cdot \\frac{\\mathrm{tf}_{t,d}}{k(1 - b + b|d|/|d_{avg}|) + \\mathrm{tf}_{t,d}}'
};
IR_EQ.cosine = { 'ir-cos': '\\cos(\\mathbf{q},\\mathbf{d}) = \\frac{\\mathbf{q} \\cdot \\mathbf{d}}{|\\mathbf{q}||\\mathbf{d}|}' };
IR_EQ.ireval = {
  'ir-pr': 'P@k = r/k, \\qquad R@k = r/R',
  'ir-interp': 'P_{\\mathrm{interp}}(r) = \\max_{r\' \\ge r} P(r\')',
  'ir-map': '\\mathrm{AP} = \\frac{1}{|R|}\\sum_{d \\in R} P@\\mathrm{rank}(d)'
};
IR_EQ.dense = {
  'ir-dense': '\\mathrm{score}(q,d) = \\mathbf{z}_q \\cdot \\mathbf{z}_d',
  'ir-maxsim': '\\mathrm{score}(q,d) = \\sum_{i \\in q} \\max_{j \\in d} \\mathbf{z}_i \\cdot \\mathbf{z}_j'
};
IR_EQ.emf1 = { 'ir-f1': 'F_1 = 2PR/(P+R)' };

// ── OPEN IR SECTION ────────────────────────────────────────
function openIRSec(id){
  const pg = IR_PAGES[id];
  if(!pg) return;
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if(!sv || !sb) return;
  const sec = IR_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if(crumb && sec) crumb.innerHTML = 'Information Retrieval &amp; RAG <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  renderMath(sb);
  mcSectionDelay(()=>{
    if(id==='irintro'){ ctrapBuild(); vaultBuild(); }
    if(id==='irpipe') rpipeBuild();
    if(id==='bow'){ blendReset(); tdmBuild(); }
    if(id==='tfidf'){ tfdSet(); bm25Set(); shredReset(); }
    if(id==='cosine') coskBuild();
    if(id==='invidx'){ idx2Init(); race2Set(); }
    if(id==='ireval') ribBuild();
    if(id==='dense'){ vmwSet(0); archSet(0); msimSet(1); }
    if(id==='ragsec'){ raglBuild(); noiseSet(0); hopReset(); citeBuild(); }
    if(id==='qadata') dslBuild();
    if(id==='emf1') gradeBuild();
    if(id==='irrecap') atlasBuild();
  }, 120);
  sv.onscroll = () => {
    const h = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if(bar) bar.style.width = (h>0?(sv.scrollTop/h)*100:0)+'%';
  };
}

// ── 11.0 VIZ: CONFIDENCE VS CORRECTNESS ────────────────────
const CTRAP_Q={
  general:[['What is the capital of Australia?','Canberra',0.72],['Who wrote Beloved?','Toni Morrison',0.83],['What is 7 times 8?','56',0.62]],
  medical:[['How many sides does a hexagon have?','6',0.78],['What is the square root of 81?','9',0.69],['What is 12 divided by 3?','4',0.84]],
  legal:[['Which planet is closest to the Sun?','Mercury',0.88],['What is the chemical symbol for oxygen?','O',0.81],['How many minutes are in one hour?','60',0.90]]
};
// Preset error rates illustrate miscalibration; these are not measured model results.
const CTRAP_ACC={general:0.82,medical:0.55,legal:0.22};
let _ctrap={ dom:'general', pts:[], qi:0 };
function ctrapBuild(){ _ctrap={dom:'general',pts:[],qi:0}; ctrapDomain('general'); }
function ctrapDomain(d){
  _ctrap.dom=d; _ctrap.pts=[]; _ctrap.qi=0;
  document.querySelectorAll('.ctrap-dom').forEach(b=>{ const on=b.dataset.d===d; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  const q=document.getElementById('ctrap-q');
  if(q) q.innerHTML='<span style="color:#8E9AC4">Domain set to '+({general:'Preset A',medical:'Preset B',legal:'Preset C'}[d])+'. Press <b>Ask one</b> to simulate an answer, or <b>Ask \u00d720</b> to fill the plot.</span>';
  ctrapDraw();
}
function ctrapAsk(n){
  const pool=CTRAP_Q[_ctrap.dom], acc=CTRAP_ACC[_ctrap.dom];
  let last=null;
  for(let i=0;i<n;i++){
    const q=pool[_ctrap.qi%pool.length]; _ctrap.qi++;
    const conf=Math.max(0.35,Math.min(0.98,q[2]+(Math.random()-0.5)*0.22));
    const correct=Math.random()<acc;
    _ctrap.pts.push({c:conf,ok:correct});
    last={q,conf,correct};
  }
  const el=document.getElementById('ctrap-q');
  if(el&&last){
    el.innerHTML='<span style="color:#8E9AC4">Q:</span> '+last.q[0]
      +'<br><span style="color:#8E9AC4">A:</span> '+(last.correct?last.q[1]:'<span style="color:#ff8aa0">'+_ctrapWrong(last.q[1])+'</span>')
      +'<br><span style="color:#8E9AC4">stated confidence:</span> <b style="color:#4DE3FF">'+(last.conf*100).toFixed(0)+'%</b>'
      +' &nbsp; <span style="color:'+(last.correct?'#3DDC84':'#FF5F8E')+'">'+(last.correct?'\u2713 correct':'\u2717 incorrect')+'</span>';
  }
  ctrapDraw();
}
function _ctrapWrong(t){
  const alternatives={'Canberra':'Sydney','Toni Morrison':'Alice Walker','56':'54','6':'8','9':'8','4':'3','Mercury':'Venus','O':'Ox','60':'100'};
  return alternatives[t] || '(incorrect answer)';
}
function ctrapDraw(){
  const cv=document.getElementById('ctrap-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const L=60, R=W-30, T=22, B=H-40;
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(R,B); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.textAlign='center';
  ctx.fillText('stated confidence \u2192',(L+R)/2,H-10);
  ctx.textAlign='right';
  ctx.fillText('correct',L-8,T+6); ctx.fillText('incorrect',L-8,B+3);
  ctx.fillText('0%',L+4,B+14); ctx.textAlign='left'; ctx.fillText('100%',R-24,B+14);
  // calibration diagonal
  ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(L,B); ctx.lineTo(R,T); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('calibration target for grouped accuracy',L+90,T+40);
  // points
  let nOk=0;
  _ctrap.pts.forEach((p,i)=>{
    const x=L+p.c*(R-L);
    const y=(p.ok?T+14:B-14)+Math.sin(i*3.7)*9;
    ctx.fillStyle=p.ok?'rgba(61,220,132,0.75)':'rgba(255,95,142,0.75)';
    ctx.beginPath(); ctx.arc(x,y,4,0,2*Math.PI); ctx.fill();
    if(p.ok) nOk++;
  });
  const n=_ctrap.pts.length;
  const cap=document.getElementById('ctrap-caption');
  if(cap){
    if(n===0) cap.textContent='No answers yet. Each answered question drops one point: horizontal position is simulated confidence; vertical position is the sampled correct/incorrect outcome.';
    else {
      const okC=_ctrap.pts.filter(p=>p.ok), badC=_ctrap.pts.filter(p=>!p.ok);
      const avgOk=okC.length?okC.reduce((s,p)=>s+p.c,0)/okC.length:0;
      const avgBad=badC.length?badC.reduce((s,p)=>s+p.c,0)/badC.length:0;
      const mean = values => values.length ? (values.reduce((sum,p)=>sum+p.c,0)/values.length*100).toFixed(0)+'%' : 'not available';
      cap.textContent=n+' simulated answers; '+nOk+' correct ('+(nOk/n*100).toFixed(0)+'%). Mean confidence on correct answers: '+mean(okC)+'; on incorrect answers: '+mean(badC)+'. Confidence and correctness are independent by construction in this demo. Individual outcomes form two bands even for a calibrated predictor; compare grouped accuracy with confidence to assess calibration.';

    }
  }
}

// ── 11.0 VIZ: THREE FAILURES ───────────────────────────────
const VAULT_MODES=[
  {id:'stale', lab:'stale', col:'#ff8c42'},
  {id:'private', lab:'inaccessible', col:'#FF5F8E'},
  {id:'recall', lab:'unreliable recall', col:'#fde047'},
  {id:'rag', lab:'the repair: retrieval', col:'#3DDC84'}
];
let _vault={ m:'stale' };
function vaultBuild(){
  const b=document.getElementById('vault-btns'); if(!b) return;
  b.innerHTML=VAULT_MODES.map(m=>'<button class="vault-b" data-m="'+m.id+'" onclick="vaultSet(\''+m.id+'\')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">'+m.lab+'</button>').join('');
  vaultSet('stale');
}
function vaultSet(m){
  _vault.m=m;
  document.querySelectorAll('.vault-b').forEach(b=>{ const on=b.dataset.m===m; const col=(VAULT_MODES.find(x=>x.id===b.dataset.m)||{}).col; b.style.background=on?col:'var(--surface2)'; b.style.color=on?'#0B101F':'var(--muted)'; b.style.borderColor=on?col:'var(--border2)'; });
  vaultDraw();
}
function vaultDraw(){
  const cv=document.getElementById('vault-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, m=_vault.m;
  ctx.clearRect(0,0,W,H);
  // the weights box
  const bx=60, by=40, bw=250, bh=H-90;
  ctx.fillStyle='rgba(255,255,255,0.05)'; roundRect(ctx,bx,by,bw,bh,10); ctx.fill();
  ctx.strokeStyle=m==='rag'?'rgba(61,220,132,0.6)':'rgba(255,255,255,0.25)'; ctx.lineWidth=1.6;
  roundRect(ctx,bx,by,bw,bh,10); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('parametric knowledge (weights)',bx+bw/2,by-10);
  // facts inside
  const facts=[['Paris is the capital of France',true],['Water boils at 100 \u00b0C',true],['The 2019 champion was\u2026',true],['A 2026 policy change\u2026',false],['Your Q3 revenue was\u2026',false]];
  facts.forEach(([t,inside],i)=>{
    const y=by+22+i*26;
    let show=inside, grey=false;
    if(m==='stale'&&i===2) grey=true;
    if(m==='recall'&&i===2) grey=true;
    if(!inside) show=false;
    if(show){
      ctx.fillStyle=grey?'rgba(255,255,255,0.06)':'rgba(77,227,255,0.16)';
      roundRect(ctx,bx+12,y,bw-24,20,5); ctx.fill();
      ctx.fillStyle=grey?'rgba(255,255,255,0.22)':'rgba(255,255,255,0.7)'; ctx.font='8px monospace'; ctx.textAlign='left';
      ctx.fillText(t,bx+18,y+14);
      if(grey&&m==='stale'){ ctx.fillStyle='#ff8c42'; ctx.textAlign='right'; ctx.fillText('past cutoff',bx+bw-18,y+14); }
      if(grey&&m==='recall'){ ctx.fillStyle='#fde047'; ctx.textAlign='right'; ctx.fillText('present but not recalled',bx+bw-18,y+14); }
    }
  });
  // outside items
  if(m==='private'||m==='rag'){
    const out=[['your email',380],['internal documents',408],['patient records',436],['discovery materials',464]];
    out.forEach(([t,y])=>{});
    ['your email','internal documents','patient records','case discovery'].forEach((t,i)=>{
      const y=by+22+i*30;
      ctx.fillStyle=m==='rag'?'rgba(61,220,132,0.14)':'rgba(255,95,142,0.12)';
      roundRect(ctx,bx+bw+70,y,190,22,5); ctx.fill();
      ctx.strokeStyle=m==='rag'?'rgba(61,220,132,0.5)':'rgba(255,95,142,0.45)'; ctx.lineWidth=1;
      roundRect(ctx,bx+bw+70,y,190,22,5); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='8px monospace'; ctx.textAlign='left';
      ctx.fillText(t,bx+bw+78,y+15);
      if(m==='rag'){
        ctx.strokeStyle='rgba(61,220,132,0.55)'; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(bx+bw+66,y+11); ctx.lineTo(bx+bw+8,by+bh/2); ctx.stroke(); ctx.setLineDash([]);
      }
    });
    ctx.fillStyle=m==='rag'?'rgba(61,220,132,0.7)':'rgba(255,95,142,0.7)'; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText(m==='rag'?'retrieved at question time':'never in training data',bx+bw+70,by-10);
  }
  if(m==='stale'){
    ctx.fillStyle='rgba(255,140,66,0.75)'; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText('training cutoff',bx+bw+60,by+40);
    ctx.strokeStyle='rgba(255,140,66,0.6)'; ctx.lineWidth=2; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(bx+bw+55,by+50); ctx.lineTo(bx+bw+55,by+bh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace';
    ctx.fillText('everything after this date',bx+bw+65,by+70);
    ctx.fillText('is absent or out of date',bx+bw+65,by+84);
  }
  if(m==='recall'){
    ctx.fillStyle='rgba(253,224,71,0.8)'; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText('the fact is in there',bx+bw+50,by+50);
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace';
    ctx.fillText('but knowledge is distributed, not',bx+bw+50,by+70);
    ctx.fillText('addressed, so there is no lookup that',bx+bw+50,by+84);
    ctx.fillText('either succeeds or returns nothing.',bx+bw+50,by+98);
    ctx.fillText('The model answers regardless.',bx+bw+50,by+112);
  }
  const cap=document.getElementById('vault-caption');
  if(cap){
    const t={
      stale:'<b style="color:#ff8c42">Staleness.</b> The weights were fixed when training ended. Facts that changed afterward are wrong inside the model, and the model has no signal telling it which of its facts are the stale ones.',
      private:'<b style="color:#FF5F8E">Inaccessibility.</b> Private material was never in the training data and never can be. This is not a capacity limitation, so a larger model does not help; the information is on the other side of an access boundary.',
      recall:'<b style="color:#fde047">Unreliable recall.</b> Even facts that were in the training data may not be produced. Because there is no addressable store, there is no failed-lookup signal, so instead of returning nothing the model returns a plausible fabrication.',
      rag:'<b style="color:#3DDC84">The repair.</b> Move the knowledge outside the model into a searchable collection and retrieve at question time. The collection can be updated, can contain private material, and either returns a document or does not, which the system can report.'
    };
    cap.innerHTML=t[m];
  }
}

// ── 11.1 VIZ: PIPELINE ─────────────────────────────────────
const RPIPE_STAGES={
  sparse:[
    ['query processing','tokenize \u00b7 lowercase \u00b7 stem','The same text preprocessing applied to documents at index time is applied to the query, so the two sides use the same vocabulary.'],
    ['query vector','tf-idf weights over |V| dims','The query becomes a sparse vector with one dimension per vocabulary word, nonzero only for its own few terms (Section 11.1.1 and 11.1.2).'],
    ['scoring','cosine or BM25 over an inverted index','Only documents appearing in the postings lists of the query terms are scored, since all others contribute zero (Sections 11.1.3 and 11.1.4).'],
    ['ranked documents','sorted by score','The top k are returned. Section 11.2 covers how this ranking is evaluated.']
  ],
  dense:[
    ['query processing','subword tokenize for the encoder','The query is tokenized for the encoder rather than stemmed; no vocabulary matching is involved downstream.'],
    ['query vector','encoder \u2192 one dense vector','An encoder maps the query into a few hundred continuous dimensions, all of them nonzero (Section 11.3).'],
    ['scoring','dot product over an ANN index','Document vectors were encoded offline. Search is approximate nearest neighbor, since no inverted index applies to dense vectors (Section 11.3).'],
    ['ranked documents','sorted by score','Identical output format to the sparse path, which is why the two are interchangeable and often combined.']
  ]
};
let _rpipe={ mode:'sparse', sel:-1, rects:[] };
function rpipeBuild(){
  const cv=document.getElementById('rpipe-canvas');
  if(cv) cv.onclick=e=>{
    const r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(cv.width/r.width), my=(e.clientY-r.top)*(cv.height/r.height);
    _rpipe.rects.forEach((rc,i)=>{ if(mx>=rc[0]&&mx<=rc[0]+rc[2]&&my>=rc[1]&&my<=rc[1]+rc[3]) _rpipe.sel=i; });
    rpipeDraw();
  };
  rpipeMode('sparse');
}
function rpipeMode(m){
  _rpipe.mode=m; _rpipe.sel=-1;
  document.querySelectorAll('.rpipe-mode').forEach(b=>{ const on=b.dataset.m===m; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  rpipeDraw();
}
function rpipeDraw(){
  const cv=document.getElementById('rpipe-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const st=RPIPE_STAGES[_rpipe.mode], col=_rpipe.mode==='sparse'?'#4DE3FF':'#A18FFF';
  _rpipe.rects=[];
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('query: "how do I fix my car\u2019s engine noise"',20,20);
  const bw=138, bh=66, gap=14, y=48;
  st.forEach((s,i)=>{
    const x=16+i*(bw+gap);
    _rpipe.rects.push([x,y,bw,bh]);
    const sel=_rpipe.sel===i;
    ctx.fillStyle=sel?'rgba(255,255,255,0.09)':'rgba(255,255,255,0.04)';
    roundRect(ctx,x,y,bw,bh,9); ctx.fill();
    ctx.strokeStyle=sel?col:'rgba(255,255,255,0.18)'; ctx.lineWidth=sel?1.8:1.1;
    roundRect(ctx,x,y,bw,bh,9); ctx.stroke();
    ctx.fillStyle=col; ctx.font='bold 9px monospace'; ctx.textAlign='center';
    ctx.fillText(s[0],x+bw/2,y+22);
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='7px monospace';
    const words=s[1].split(' '); let line='', ly=y+40;
    words.forEach(w=>{ if((line+w).length>20){ ctx.fillText(line,x+bw/2,ly); ly+=11; line=w+' '; } else line+=w+' '; });
    ctx.fillText(line,x+bw/2,ly);
    if(i<st.length-1){
      ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=1.3;
      ctx.beginPath(); ctx.moveTo(x+bw,y+bh/2); ctx.lineTo(x+bw+gap,y+bh/2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x+bw+gap-5,y+bh/2-3.5); ctx.lineTo(x+bw+gap,y+bh/2); ctx.lineTo(x+bw+gap-5,y+bh/2+3.5); ctx.stroke();
    }
  });
  // collection
  ctx.fillStyle='rgba(255,255,255,0.04)'; roundRect(ctx,16+2*(bw+gap),y+bh+34,bw,44,8); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1; roundRect(ctx,16+2*(bw+gap),y+bh+34,bw,44,8); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace'; ctx.textAlign='center';
  ctx.fillText(_rpipe.mode==='sparse'?'inverted index':'ANN index',16+2*(bw+gap)+bw/2,y+bh+56);
  ctx.fillText('(built offline)',16+2*(bw+gap)+bw/2,y+bh+70);
  ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(16+2*(bw+gap)+bw/2,y+bh+34); ctx.lineTo(16+2*(bw+gap)+bw/2,y+bh); ctx.stroke(); ctx.setLineDash([]);
  const cap=document.getElementById('rpipe-caption');
  if(cap) cap.innerHTML=_rpipe.sel>=0
    ? '<b style="color:'+col+'">'+st[_rpipe.sel][0]+'</b> \u2014 '+st[_rpipe.sel][2]
    : 'The four stages are identical in both families. Switch the toggle and only the contents change: the representation, the scoring function, and the index structure. Click a stage for detail.';
}

// ── 11.1.1 VIZ: BAG OF WORDS ───────────────────────────────
const BLEND_TEXT='the film was good the acting was good but the plot was thin and the ending was poor';
let _blend={ t:0, anim:null };
function blendReset(){ _blend.t=0; blendDraw(); blend2Draw();
  const c=document.getElementById('blend-caption'); if(c) c.textContent='A short review. Press the button to reduce it to word counts.'; }
function blendGo(){
  if(_blend.anim) cancelAnimationFrame(_blend.anim);
  const t0=performance.now();
  const loop=now=>{ _blend.t=Math.min(1,(now-t0)/1200); blendDraw(); if(_blend.t<1) _blend.anim=requestAnimationFrame(loop); else{ _blend.anim=null;
    const c=document.getElementById('blend-caption');
    if(c) c.innerHTML='The document is now a set of counts: <b>the</b> 4, <b>was</b> 4, <b>good</b> 2, and so on. Every trace of which word followed which is gone, and the representation is exactly as long as the vocabulary, not the document.';
  } };
  _blend.anim=requestAnimationFrame(loop);
}
function blendDraw(){
  const cv=document.getElementById('blend-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, t=_blend.t;
  ctx.clearRect(0,0,W,H);
  const words=BLEND_TEXT.split(' ');
  const counts={}; words.forEach(w=>counts[w]=(counts[w]||0)+1);
  const uniq=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]);
  // source positions (wrapped text)
  let sx=16, sy=30;
  const srcPos=words.map(w=>{
    const wpx=w.length*6.4+8;
    if(sx+wpx>W-16){ sx=16; sy+=20; }
    const p={x:sx,y:sy,w:wpx,word:w}; sx+=wpx; return p;
  });
  // target positions (histogram)
  const hTop=sy+40, bw=(W-40)/uniq.length;
  const maxC=Math.max(...uniq.map(u=>counts[u]));
  const tgt={};
  uniq.forEach((u,i)=>{ tgt[u]={x:20+i*bw,y:H-34}; });
  // draw histogram bars (fade in)
  if(t>0.2){
    ctx.globalAlpha=Math.min(1,(t-0.2)/0.4);
    uniq.forEach((u,i)=>{
      const h=(counts[u]/maxC)*(H-hTop-56);
      ctx.fillStyle='rgba(77,227,255,0.5)';
      ctx.fillRect(20+i*bw,H-34-h,bw*0.7,h);
      ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='7px monospace'; ctx.textAlign='center';
      ctx.fillText(u,20+i*bw+bw*0.35,H-22);
      ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.font='8px monospace';
      ctx.fillText(counts[u],20+i*bw+bw*0.35,H-38-h);
    });
    ctx.globalAlpha=1;
  }
  // words flying
  const seen={};
  srcPos.forEach((p,i)=>{
    const u=p.word; seen[u]=(seen[u]||0);
    const d=tgt[u];
    const delay=(i/srcPos.length)*0.35;
    const f=Math.max(0,Math.min(1,(t-delay)/0.55));
    const x=p.x+(d.x+4-p.x)*f, y=p.y+(d.y-p.y)*f;
    ctx.globalAlpha=1-f*0.75;
    ctx.fillStyle=f>0.05?'rgba(160,140,255,0.85)':'rgba(255,255,255,0.8)';
    ctx.font='10px monospace'; ctx.textAlign='left';
    ctx.fillText(u,x,y);
    ctx.globalAlpha=1;
    seen[u]++;
  });
  if(t<0.05){
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='8px monospace'; ctx.textAlign='left';
    ctx.fillText('document (order intact)',16,16);
  }
}
function blend2Draw(){
  const cv=document.getElementById('blend2-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const pair=[['dog bites man','#4DE3FF'],['man bites dog','#FF5F8E']];
  const vocab=['bites','dog','man'];
  pair.forEach(([s,col],i)=>{
    const x0=30+i*(W/2-20);
    ctx.fillStyle=col; ctx.font='10px monospace'; ctx.textAlign='left';
    ctx.fillText('"'+s+'"',x0,24);
    vocab.forEach((v,j)=>{
      const y=44+j*32;
      ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
      ctx.fillText(v,x0,y+12);
      ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(x0+52,y,150,16);
      ctx.fillStyle=col; ctx.globalAlpha=0.7; ctx.fillRect(x0+52,y,150,16); ctx.globalAlpha=1;
      ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.font='8px monospace'; ctx.textAlign='left';
      ctx.fillText('1',x0+208,y+12);
    });
  });
  ctx.strokeStyle='rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.moveTo(W/2,16); ctx.lineTo(W/2,H-30); ctx.stroke();
  ctx.fillStyle='rgba(253,224,71,0.85)'; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText('identical vectors \u00b7 cosine = 1.000',W/2,H-10);
}

// ── 11.1.1 VIZ: TERM-DOCUMENT MATRIX ───────────────────────
const TDM_WORDS=['summit','ridge','derailleur','tyre','gear','route'];
const TDM_DOCS=['Trail Guide','Bike Repair','Alpine Climbs','Bike Touring'];
const TDM_M=[[31,0,84,2],[27,1,63,3],[0,58,0,41],[2,74,1,66],[47,52,44,50],[58,41,49,55]];
const TDM_MAX=Math.max(...TDM_M.map(r=>Math.max(...r)));
let _tdm={ row:-1, col:-1 };
function tdmBuild(){
  ['tdm-x','tdm-y'].forEach((id,k)=>{
    const s=document.getElementById(id);
    if(s) s.innerHTML=TDM_WORDS.map(w=>'<option value="'+w+'"'+((k===0&&w==='summit')||(k===1&&w==='derailleur')?' selected':'')+'>'+w+'</option>').join('');
  });
  const cv=document.getElementById('tdm-canvas');
  if(cv) cv.onclick=e=>{
    const r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(cv.width/r.width), my=(e.clientY-r.top)*(cv.height/r.height);
    const L=90, T=44, cw=(cv.width-L-24)/4, rh=(cv.height-T-24)/6;
    const c=Math.floor((mx-L)/cw), rr=Math.floor((my-T)/rh);
    if(mx<L&&rr>=0&&rr<6){ _tdm.row=rr; _tdm.col=-1; }
    else if(my<T&&c>=0&&c<4){ _tdm.col=c; _tdm.row=-1; }
    else if(c>=0&&c<4&&rr>=0&&rr<6){ _tdm.row=rr; _tdm.col=c; }
    tdmDraw();
  };
  tdmDraw();
}
function tdmAxes(x,y){
  const sx=document.getElementById('tdm-x'), sy=document.getElementById('tdm-y');
  if(sx) sx.value=x; if(sy) sy.value=y;
  tdmDraw();
}
function tdmDraw(){
  const cv=document.getElementById('tdm-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const L=90, T=44, cw=(W-L-24)/4, rh=(H-T-24)/6;
  ctx.font='8px monospace';
  TDM_DOCS.forEach((d,c)=>{
    ctx.fillStyle=_tdm.col===c?'#4DE3FF':'rgba(255,255,255,0.5)'; ctx.textAlign='center';
    const parts=d.split(' ');
    ctx.fillText(parts.slice(0,2).join(' '),L+c*cw+cw/2,T-20);
    if(parts.length>2) ctx.fillText(parts.slice(2).join(' '),L+c*cw+cw/2,T-10);
  });
  TDM_WORDS.forEach((w,r)=>{
    ctx.fillStyle=_tdm.row===r?'#A18FFF':'rgba(255,255,255,0.5)'; ctx.textAlign='right'; ctx.font='9px monospace';
    ctx.fillText(w,L-8,T+r*rh+rh/2+3);
    TDM_DOCS.forEach((d,c)=>{
      const v=TDM_M[r][c], a=Math.min(1,v/TDM_MAX);
      const hl=(_tdm.row===r||_tdm.col===c);
      ctx.fillStyle='rgba(77,227,255,'+(0.06+a*0.6)+')';
      ctx.fillRect(L+c*cw+2,T+r*rh+2,cw-4,rh-4);
      if(hl){ ctx.strokeStyle=_tdm.row===r&&_tdm.col===c?'#fde047':(_tdm.row===r?'#A18FFF':'#4DE3FF'); ctx.lineWidth=1.4; ctx.strokeRect(L+c*cw+2,T+r*rh+2,cw-4,rh-4); }
      ctx.fillStyle=a>0.5?'#050A1C':'rgba(255,255,255,0.8)'; ctx.font='9px monospace'; ctx.textAlign='center';
      ctx.fillText(v,L+c*cw+cw/2,T+r*rh+rh/2+3);
    });
  });
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('click a word (row) or a document (column)',6,14);
  // projection
  const cv2=document.getElementById('tdm2-canvas'); if(!cv2) return;
  const c2=cv2.getContext('2d'), W2=cv2.width, H2=cv2.height;
  c2.clearRect(0,0,W2,H2);
  const xw=(document.getElementById('tdm-x')||{}).value||'summit';
  const yw=(document.getElementById('tdm-y')||{}).value||'derailleur';
  const xi=TDM_WORDS.indexOf(xw), yi=TDM_WORDS.indexOf(yw);
  const L2=54, B2=H2-34, T2=20, R2=W2-24;
  c2.strokeStyle='rgba(255,255,255,0.15)';
  c2.beginPath(); c2.moveTo(L2,T2); c2.lineTo(L2,B2); c2.lineTo(R2,B2); c2.stroke();
  const mx=Math.max(...TDM_M[xi])*1.15||1, my=Math.max(...TDM_M[yi])*1.15||1;
  c2.fillStyle='rgba(255,255,255,0.45)'; c2.font='9px monospace'; c2.textAlign='center';
  c2.fillText(xw+' \u2192',(L2+R2)/2,H2-8);
  c2.save(); c2.translate(16,(T2+B2)/2); c2.rotate(-Math.PI/2); c2.fillText(yw+' \u2192',0,0); c2.restore();
  const cols=['#4DE3FF','#3DDC84','#FF5F8E','#ff8c42'];
  const pts=[];
  TDM_DOCS.forEach((d,c)=>{
    const x=L2+(TDM_M[xi][c]/mx)*(R2-L2), y=B2-(TDM_M[yi][c]/my)*(B2-T2);
    pts.push([x,y]);
    c2.strokeStyle=cols[c]; c2.lineWidth=1.6; c2.globalAlpha=0.5;
    c2.beginPath(); c2.moveTo(L2,B2); c2.lineTo(x,y); c2.stroke(); c2.globalAlpha=1;
    c2.fillStyle=cols[c]; c2.beginPath(); c2.arc(x,y,5.5,0,2*Math.PI); c2.fill();
    c2.font='8px monospace'; c2.textAlign='left';
    c2.fillText(d,Math.min(x+9,W2-90),y-6);
  });
  // spread measure
  let spread=0;
  for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++) spread+=Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]);
  spread/=6;
  const diag=Math.hypot(R2-L2,B2-T2);
  const cap=document.getElementById('tdm-caption');
  if(cap){
    let sel='';
    if(_tdm.row>=0&&_tdm.col>=0) sel='Cell: <b>'+TDM_WORDS[_tdm.row]+'</b> occurs '+TDM_M[_tdm.row][_tdm.col]+' times in <b>'+TDM_DOCS[_tdm.col]+'</b>. ';
    else if(_tdm.col>=0) sel='Column lifted: <b>'+TDM_DOCS[_tdm.col]+'</b> as a vector of word counts \u2014 this is the document representation. ';
    else if(_tdm.row>=0) sel='Row lifted: <b>'+TDM_WORDS[_tdm.row]+'</b> across the four documents \u2014 this is the word\u2019s distributional profile, the idea behind word embeddings. ';
    const useful=(spread/diag)>0.20;
    cap.innerHTML=sel+'Axes <b>'+xw+'</b> and <b>'+yw+'</b>: '+(useful
      ? 'the documents spread out, so these two words discriminate between them. Rare, content-bearing words carry the signal.'
      : 'the documents collapse into one region, so these words tell you almost nothing about which document you are looking at. They are frequent everywhere, which is exactly the condition inverse document frequency is designed to penalize.');
  }
}

// ── 11.1.2 VIZ: TF AND IDF ─────────────────────────────────
function tfdSet(){
  const tfEl=document.getElementById('tfd-tf'), dfEl=document.getElementById('tfd-df');
  if(!tfEl||!dfEl) return;
  const cnt=parseInt(tfEl.value), df=parseInt(dfEl.value), N=48;
  const a=document.getElementById('tfd-tfv'); if(a) a.textContent=cnt;
  const b=document.getElementById('tfd-dfv'); if(b) b.textContent=df;
  const tf=1+Math.log10(cnt), idf=Math.log10(N/df);
  const cv=document.getElementById('tfd-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  // LEFT: raw vs damped
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('raw count vs. log-damped tf',16,18);
  const bot=H-46, maxH=bot-40;
  const rawH=Math.min(maxH*1.6,(cnt/1000)*maxH*3.2);
  ctx.fillStyle='rgba(255,95,142,0.55)';
  ctx.fillRect(40,Math.max(6,bot-rawH),44,Math.min(rawH,bot-6));
  if(rawH>bot-6){ ctx.fillStyle='#FF5F8E'; ctx.font='8px monospace'; ctx.textAlign='center'; ctx.fillText('off scale',62,16); }
  ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='8px monospace'; ctx.textAlign='center';
  ctx.fillText('raw = '+cnt,62,bot+14);
  ctx.fillStyle='rgba(77,227,255,0.75)';
  const tfH=(tf/4)*maxH;
  ctx.fillRect(110,bot-tfH,44,tfH);
  ctx.fillStyle='rgba(255,255,255,0.6)';
  ctx.fillText('tf = '+tf.toFixed(2),132,bot+14);
  // log curve
  ctx.strokeStyle='rgba(77,227,255,0.4)'; ctx.lineWidth=1.5;
  ctx.beginPath();
  for(let c=1;c<=1000;c*=1.06){
    const x=180+(Math.log10(c)/3)*90, y=bot-((1+Math.log10(c))/4)*maxH;
    if(c===1) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();
  const px=180+(Math.log10(cnt)/3)*90, py=bot-(tf/4)*maxH;
  ctx.fillStyle='#4DE3FF'; ctx.beginPath(); ctx.arc(px,py,4.5,0,2*Math.PI); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='7px monospace'; ctx.textAlign='center';
  ctx.fillText('1 \u2192 1000 (log x)',225,bot+14);
  // divider
  ctx.strokeStyle='rgba(255,255,255,0.1)';
  ctx.beginPath(); ctx.moveTo(300,14); ctx.lineTo(300,H-14); ctx.stroke();
  // RIGHT: idf balloons
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('idf = log\u2081\u2080(' + N + ' / df)',320,18);
  const words=[['crampon',1],['moraine',3],['bivouac',6],['cairn',16],['route',N],['trail',N]];
  const floor=H-46;
  words.forEach(([w,d],i)=>{
    const x=340+i*48;
    const v=Math.log10(N/d);
    const y=floor-(v/Math.log10(N))*(floor-38);
    ctx.strokeStyle='rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.moveTo(x,floor); ctx.lineTo(x,y); ctx.stroke();
    ctx.fillStyle=v<0.05?'rgba(255,95,142,0.7)':'rgba(160,140,255,0.7)';
    ctx.beginPath(); ctx.arc(x,y,7,0,2*Math.PI); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='7px monospace'; ctx.textAlign='center';
    ctx.fillText(w,x,floor+12);
    ctx.fillStyle='rgba(255,255,255,0.4)';
    ctx.fillText(v.toFixed(2),x,y-11);
  });
  ctx.strokeStyle='rgba(255,95,142,0.35)'; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(320,floor); ctx.lineTo(W-16,floor); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,95,142,0.6)'; ctx.font='7px monospace'; ctx.textAlign='right';
  ctx.fillText('idf = 0: no discriminating power',W-16,floor+22);
  const cap=document.getElementById('tfd-caption');
  if(cap) cap.innerHTML='count = '+cnt+' \u2192 tf = 1 + log\u2081\u2080('+cnt+') = <b style="color:var(--accent)">'+tf.toFixed(3)+'</b>; df = '+df+' \u2192 idf = log\u2081\u2080('+N+'/'+df+') = <b style="color:var(--accent3)">'+idf.toFixed(3)+'</b>; the weight is their product, <b>'+(tf*idf).toFixed(3)+'</b>. '
    +(df===N?'At df = N the idf is exactly zero, so this term contributes nothing however often it occurs.':'A thousandfold change in raw count moves tf by only 3, while moving df from 1 to '+N+' drives idf all the way to zero.');
}

// ── 11.1.2 VIZ: BM25 ───────────────────────────────────────
const BM25_DOCS=[
  {id:'D1', len:120, tf:{engine:3, noise:2}},
  {id:'D2', len:900, tf:{engine:9, noise:5}},
  {id:'D3', len:150, tf:{engine:1, noise:4}},
  {id:'D4', len:400, tf:{engine:6, noise:0}}
];
const BM25_IDF={engine:1.1, noise:1.4};
function bm25Preset(){ const k=document.getElementById('bm25-k'), b=document.getElementById('bm25-b'); if(k) k.value=1.2; if(b) b.value=0.75; bm25Set(); }
function bm25Set(){
  const kEl=document.getElementById('bm25-k'), bEl=document.getElementById('bm25-b');
  if(!kEl||!bEl) return;
  const k=parseFloat(kEl.value), b=parseFloat(bEl.value);
  const kv=document.getElementById('bm25-kv'); if(kv) kv.textContent=k.toFixed(2);
  const bv=document.getElementById('bm25-bv'); if(bv) bv.textContent=b.toFixed(2);
  const avg=BM25_DOCS.reduce((s,d)=>s+d.len,0)/BM25_DOCS.length;
  const scored=BM25_DOCS.map(d=>{
    let s=0;
    for(const t of ['engine','noise']){
      const tf=d.tf[t]||0;
      if(tf>0) s+=BM25_IDF[t]*(tf/(k*(1-b+b*d.len/avg)+tf));
    }
    return {...d, score:s};
  }).sort((x,y)=>y.score-x.score);
  const cv=document.getElementById('bm25-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('query: "engine noise" \u00b7 ranking updates live',16,18);
  const maxS=Math.max(...scored.map(s=>s.score))||1;
  scored.forEach((d,i)=>{
    const y=34+i*52;
    ctx.fillStyle='rgba(255,255,255,0.04)'; roundRect(ctx,16,y,W-32,44,8); ctx.fill();
    ctx.strokeStyle=i===0?'rgba(77,227,255,0.6)':'rgba(255,255,255,0.12)'; ctx.lineWidth=i===0?1.5:1;
    roundRect(ctx,16,y,W-32,44,8); ctx.stroke();
    ctx.fillStyle=i===0?'#4DE3FF':'rgba(255,255,255,0.6)'; ctx.font='bold 10px monospace'; ctx.textAlign='left';
    ctx.fillText('#'+(i+1)+'  '+d.id,26,y+18);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace';
    ctx.fillText('length '+d.len+' tokens \u00b7 engine \u00d7'+(d.tf.engine||0)+' \u00b7 noise \u00d7'+(d.tf.noise||0),26,y+33);
    const bx=250, bwid=W-300;
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(bx,y+14,bwid,16);
    ctx.fillStyle=i===0?'rgba(77,227,255,0.75)':'rgba(160,140,255,0.5)';
    ctx.fillRect(bx,y+14,bwid*(d.score/maxS),16);
    ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText(d.score.toFixed(3),bx+bwid+8,y+26);
  });
  const cap=document.getElementById('bm25-caption');
  if(cap){
    let t='';
    if(k<0.15) t='k near 0: the term-frequency fraction is close to 1 whenever the term appears at all, so BM25 has collapsed into presence-or-absence matching and the counts no longer affect the ranking.';
    else if(k>4){
      const d2=scored.find(d=>d.id==='D2'), pos=scored.findIndex(d=>d.id==='D2')+1;
      t='Large k: saturation is weak, so a second occurrence of a term counts nearly as much as the first and the scores track raw counts closely. The ranking barely moves, though. Once b is above about 0.5 the length penalty on the 900-token D2 grows in proportion to k, so raising k pushes the long document further down rather than lifting it \u2014 D2 is at '+((d2.score/scored[0].score)*100).toFixed(0)+'% of the top score here, ranked #'+pos+'. In this collection b is the knob that reorders results; k mostly changes the spacing between them.';
    }
    else if(b<0.15) t='b near 0: length normalization is off. D2 is 900 tokens long and wins largely because more text means more occurrences, which is the bias b exists to correct. It keeps that lead until b passes about 0.54, and drops to third once b clears 0.69.';
    else if(b>0.9) t='b near 1: term frequency is fully divided by relative document length, so short focused documents are favored strongly.';
    else t='With k = '+k.toFixed(2)+' and b = '+b.toFixed(2)+' the ranking balances how often a term occurs against how long the document is. Values near k = 1.2 to 2 and b = 0.75 are the usual defaults.';
    cap.textContent=t;
  }
}

// ── 11.1.2 VIZ: STOP LIST ──────────────────────────────────
const SHRED_STOP=['a','about','and','are','as','at','be','but','by','do','for','in','is','it','of','on','or','that','the','this','to','was','what','with'];
function shredReset(){
  const o=document.getElementById('shred-out');
  if(o) o.innerHTML='what to do about it'.split(' ').map(w=>'<span style="color:#ECF1FF;margin:0 .3rem">'+w+'</span>').join('');
  const c=document.getElementById('shred-caption');
  if(c) c.textContent='A five-word query. Press the button to remove every term on a standard stop list.';
}
function shredGo(){
  const o=document.getElementById('shred-out');
  const words='what to do about it'.split(' ');
  if(o) o.innerHTML=words.map(w=>SHRED_STOP.includes(w)
    ? '<span style="color:rgba(255,255,255,0.15);text-decoration:line-through;margin:0 .3rem">'+w+'</span>'
    : '<span style="color:#3DDC84;font-weight:700;margin:0 .3rem">'+w+'</span>').join('');
  const c=document.getElementById('shred-caption');
  if(c) c.innerHTML='All five words removed: <b>the query is now empty</b> and there is nothing left to retrieve on. With idf weighting every one of these terms would already carry a weight near zero without being deleted, and on the rare occasion one of them does matter \u2014 a title, a quoted phrase \u2014 it is still there to be used.';
}

// ── 11.1.3 VIZ: COSINE ─────────────────────────────────────
let _cosk={ a:35, dup:false };
function coskBuild(){ _cosk={a:35,dup:false}; const s=document.getElementById('cosk-a'); if(s) s.value=35; coskSet(); }
function coskDup(){
  _cosk.dup=!_cosk.dup;
  const b=document.getElementById('cosk-dup');
  if(b){ b.textContent=_cosk.dup?'restore document 1':'duplicate document 1'; b.style.color=_cosk.dup?'var(--accent)':'var(--text)'; b.style.borderColor=_cosk.dup?'var(--accent)':'var(--border2)'; }
  coskSet();
}
function coskSet(){
  const s=document.getElementById('cosk-a');
  if(s) _cosk.a=parseFloat(s.value);
  const cv=document.getElementById('cosk-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const O=[60,H-44], S=Math.min((W*0.5-80),(H-80));
  const docs=[
    {id:'Doc 1 (sonnet)', v:[0.30,0.92], col:'#4DE3FF'},
    {id:'Doc 2 (manual)', v:[0.93,0.16], col:'#FF5F8E'},
    {id:'Doc 3 (letter)', v:[0.66,0.66], col:'#A18FFF'},
    {id:'Doc 4 (recipe)', v:[0.86,0.42], col:'#ff8c42'}
  ];
  if(_cosk.dup) docs[0]={...docs[0], v:[0.60,1.84], id:'Doc 1 + Doc 1'};
  const th=_cosk.a*Math.PI/180;
  const q=[Math.cos(th),Math.sin(th)];
  // axes
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(O[0],O[1]); ctx.lineTo(O[0]+S,O[1]); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(O[0],O[1]); ctx.lineTo(O[0],O[1]-S); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText('sweet \u2192',O[0]+S/2,O[1]+18);
  ctx.save(); ctx.translate(O[0]-22,O[1]-S/2); ctx.rotate(-Math.PI/2); ctx.fillText('love \u2192',0,0); ctx.restore();
  // scale so a length-2 vector still fits
  const sc=S/2;
  // doc arrows
  const scored=docs.map(d=>{
    const n=Math.hypot(d.v[0],d.v[1]);
    const cos=(q[0]*d.v[0]+q[1]*d.v[1])/n;
    return {...d, cos, n};
  }).sort((a,b)=>b.cos-a.cos);
  docs.forEach(d=>{
    const x=O[0]+d.v[0]*sc, y=O[1]-d.v[1]*sc;
    ctx.strokeStyle=d.col; ctx.lineWidth=2; ctx.globalAlpha=0.8;
    ctx.beginPath(); ctx.moveTo(O[0],O[1]); ctx.lineTo(x,y); ctx.stroke(); ctx.globalAlpha=1;
    ctx.fillStyle=d.col; ctx.beginPath(); ctx.arc(x,y,4,0,2*Math.PI); ctx.fill();
  });
  // query arrow
  const qx=O[0]+q[0]*sc*0.85, qy=O[1]-q[1]*sc*0.85;
  ctx.strokeStyle='#fde047'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(O[0],O[1]); ctx.lineTo(qx,qy); ctx.stroke();
  ctx.fillStyle='#fde047'; ctx.font='bold 9px monospace'; ctx.textAlign='left';
  ctx.fillText('query',qx+6,qy-4);
  // angle wedge to top doc
  const top=scored[0];
  const ang=Math.atan2(top.v[1],top.v[0]);
  ctx.strokeStyle='rgba(253,224,71,0.35)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(O[0],O[1],40,-th,-ang,th<ang); ctx.stroke();
  // ranking panel
  const px=W*0.56;
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('ranking by cosine',px,26);
  scored.forEach((d,i)=>{
    const y=40+i*44;
    ctx.fillStyle='rgba(255,255,255,0.04)'; roundRect(ctx,px,y,W-px-16,36,7); ctx.fill();
    ctx.strokeStyle=i===0?d.col:'rgba(255,255,255,0.1)'; ctx.lineWidth=i===0?1.4:1;
    roundRect(ctx,px,y,W-px-16,36,7); ctx.stroke();
    ctx.fillStyle=d.col; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText('#'+(i+1)+' '+d.id,px+8,y+14);
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(px+8,y+20,W-px-90,9);
    ctx.fillStyle=d.col; ctx.globalAlpha=0.75; ctx.fillRect(px+8,y+20,(W-px-90)*d.cos,9); ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='8px monospace';
    ctx.fillText(d.cos.toFixed(3),W-72,y+28);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='7px monospace';
    ctx.fillText('|d| = '+d.n.toFixed(2),W-72,y+16);
  });
  const cap=document.getElementById('cosk-caption');
  if(cap){
    if(_cosk.dup) cap.innerHTML='Document 1 has been concatenated with itself, so every weight doubled and its length went from 0.97 to <b>1.94</b>. Its cosine and its rank did not change at all, because doubling a vector does not change its direction. This is why the normalization matters: without it, the duplicated document would have scored twice as high for containing exactly the same content twice.';
    else cap.innerHTML='Query direction '+_cosk.a.toFixed(0)+'\u00b0 \u00b7 top result <b style="color:'+top.col+'">'+top.id+'</b> at cosine '+top.cos.toFixed(3)+'. Swing the query and the ranking follows the angle, not the arrow lengths. Now press the duplicate button.';
  }
}

// ── 11.1.4 VIZ: INVERTED INDEX ─────────────────────────────
const IDX_DOCS=[
  {id:'D1', txt:'ridge cairn ridge'},
  {id:'D2', txt:'cairn scree summit'},
  {id:'D3', txt:'ridge summit ridge scree'},
  {id:'D4', txt:'traverse cairn'}
];
let _idx2={ built:false, fwd:false, q:null };
function idx2Init(){ _idx2={built:false,fwd:false,q:null}; idx2Render();
  const t=document.getElementById('idx2-terms');
  const terms=[...new Set(IDX_DOCS.flatMap(d=>d.txt.split(' ')))].sort();
  if(t) t.innerHTML=terms.map(w=>'<button onclick="idx2Query(\''+w+'\')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:6px;padding:.25rem .55rem;font-family:var(--mono);font-size:.62rem;cursor:pointer">'+w+'</button>').join('');
}
function idx2Build(){ _idx2.built=true; _idx2.q=null; idx2Render(); }
function idx2Flip(){
  _idx2.fwd=!_idx2.fwd;
  const b=document.getElementById('idx2-flip');
  if(b) b.textContent=_idx2.fwd?'show inverted index':'show forward index';
  idx2Render();
}
function idx2Query(w){ if(!_idx2.built) _idx2.built=true; _idx2.fwd=false; _idx2.q=w; idx2Render(); }
function idx2Render(){
  const o=document.getElementById('idx2-out'); if(!o) return;
  if(!_idx2.built){
    o.innerHTML=IDX_DOCS.map(d=>'<div><span style="color:#4DE3FF">'+d.id+'</span> <span style="color:#8E9AC4">:</span> '+d.txt+'</div>').join('')
      +'<div style="color:#8E9AC4;font-size:.62rem;margin-top:.6rem">Four short documents. Press <b>Build the index</b>.</div>';
    const c=document.getElementById('idx2-caption'); if(c) c.textContent='';
    return;
  }
  if(_idx2.fwd){
    o.innerHTML='<div style="color:#8E9AC4;font-size:.62rem;margin-bottom:.5rem">FORWARD INDEX \u00b7 document \u2192 terms</div>'
      +IDX_DOCS.map(d=>{
        const c={}; d.txt.split(' ').forEach(w=>c[w]=(c[w]||0)+1);
        return '<div><span style="color:#4DE3FF">'+d.id+'</span> \u2192 '+Object.keys(c).map(w=>w+'<span style="color:#8E9AC4">['+c[w]+']</span>').join(', ')+'</div>';
      }).join('');
    const cc=document.getElementById('idx2-caption');
    if(cc) cc.textContent='The same information, transposed. A forward index answers "what is in this document"; retrieval needs the opposite question, "which documents contain this term", which is why the index is inverted.';
    return;
  }
  const post={};
  IDX_DOCS.forEach(d=>{
    const c={}; d.txt.split(' ').forEach(w=>c[w]=(c[w]||0)+1);
    Object.keys(c).forEach(w=>{ (post[w]=post[w]||[]).push([d.id,c[w]]); });
  });
  const terms=Object.keys(post).sort();
  o.innerHTML='<div style="color:#8E9AC4;font-size:.62rem;margin-bottom:.5rem">INVERTED INDEX \u00b7 dictionary {df} \u2192 postings [tf]</div>'
    +terms.map(w=>{
      const hit=_idx2.q===w;
      return '<div style="'+(hit?'background:rgba(77,227,255,0.12);border-radius:5px;padding:0 .3rem':'')+'">'
        +'<span style="color:'+(hit?'#4DE3FF':'#A18FFF')+';font-weight:700">'+w+'</span>'
        +'<span style="color:#8E9AC4">{'+post[w].length+'}</span> \u2192 '
        +post[w].map(([id,tf])=>'<span style="color:'+(hit?'#3DDC84':'#ECF1FF')+'">'+id+'</span><span style="color:#8E9AC4">['+tf+']</span>').join(' \u2192 ')
        +'</div>';
    }).join('');
  const c=document.getElementById('idx2-caption');
  if(c){
    if(_idx2.q) c.innerHTML='Query <b>'+_idx2.q+'</b>: the dictionary lookup lands on one entry, and only the '+post[_idx2.q].length+' document'+(post[_idx2.q].length>1?'s':'')+' on its postings list '+(post[_idx2.q].length>1?'are':'is')+' scored. The other documents are never examined, because they would score zero.';
    else c.textContent='Each dictionary entry stores the term, its document frequency in braces, and a pointer to its postings list. Each posting records a document and the term frequency inside it. Click a term to query.';
  }
}
function race2Set(){
  const s=document.getElementById('race2-n'); if(!s) return;
  const N=Math.round(Math.pow(10,parseFloat(s.value)));
  const v=document.getElementById('race2-nv'); if(v) v.textContent=N.toLocaleString();
  const cv=document.getElementById('race2-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const postings=Math.max(2,Math.round(N*0.004));
  const lanes=[['linear scan','#FF5F8E',N,'touches every document'],['inverted index','#4DE3FF',postings,'touches only the postings list']];
  lanes.forEach(([lab,col,ops,note],i)=>{
    const y=30+i*66;
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText(lab,16,y);
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(16,y+8,W-140,20);
    const frac=Math.min(1,Math.log10(ops+1)/6);
    ctx.fillStyle=col; ctx.globalAlpha=0.75; ctx.fillRect(16,y+8,(W-140)*frac,20); ctx.globalAlpha=1;
    ctx.fillStyle=col; ctx.font='bold 10px monospace'; ctx.textAlign='left';
    ctx.fillText(ops.toLocaleString()+' docs',W-116,y+23);
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='7px monospace';
    ctx.fillText(note,16,y+40);
  });
  // log plot
  const px=16, py=H-16, pw=W-32, ph=70;
  ctx.strokeStyle='rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.moveTo(px,py-ph); ctx.lineTo(px,py); ctx.lineTo(px+pw,py); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='7px monospace'; ctx.textAlign='left';
  ctx.fillText('documents touched (log) vs. collection size (log)',px+4,py-ph-4);
  [['#FF5F8E',n=>n],['#4DE3FF',n=>Math.max(2,n*0.004)]].forEach(([col,f])=>{
    ctx.strokeStyle=col; ctx.lineWidth=1.6; ctx.beginPath();
    for(let e=0.6;e<=6;e+=0.05){
      const n=Math.pow(10,e), x=px+((e-0.6)/5.4)*pw, y=py-(Math.log10(f(n)+1)/6)*ph;
      if(e===0.6) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  });
  const cx=px+((parseFloat(s.value)-0.6)/5.4)*pw;
  ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(cx,py-ph); ctx.lineTo(cx,py); ctx.stroke(); ctx.setLineDash([]);
  const cap=document.getElementById('race2-caption');
  if(cap) cap.innerHTML='At N = '+N.toLocaleString()+', the scan examines every document while the index examines about '+postings.toLocaleString()+', a ratio of roughly '+Math.round(N/postings)+' to 1. The scan\u2019s cost is proportional to the collection size; the index\u2019s cost is proportional to how many documents contain the term, which does not grow the same way.';
}

// ── 11.2 VIZ: RANKING RIBBON ───────────────────────────────
const RIB_REL=[1,1,0,1,0,0,0,1,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0];
let _rib={ k:0, interp:false, map:false, anim:null };
function ribBuild(){ _rib={k:0,interp:false,map:false,anim:null}; const s=document.getElementById('rib-k'); if(s) s.value=0; ribDraw(); }
function ribSet(v){ _rib.k=parseInt(v); ribDraw(); }
function ribPlay(){
  if(_rib.anim) clearInterval(_rib.anim);
  _rib.k=0;
  _rib.anim=setInterval(()=>{
    _rib.k++;
    const s=document.getElementById('rib-k'); if(s) s.value=_rib.k;
    ribDraw();
    if(_rib.k>=25){ clearInterval(_rib.anim); _rib.anim=null; }
  },170);
}
function ribInterp(){
  _rib.interp=!_rib.interp;
  const b=document.getElementById('rib-interp');
  if(b){ b.style.color=_rib.interp?'var(--accent)':'var(--text)'; b.style.borderColor=_rib.interp?'var(--accent)':'var(--border2)'; }
  ribDraw();
}
function ribMAP(){
  _rib.map=!_rib.map;
  const b=document.getElementById('rib-map');
  if(b){ b.style.color=_rib.map?'var(--accent4)':'var(--text)'; b.style.borderColor=_rib.map?'var(--accent4)':'var(--border2)'; }
  ribDraw();
}
function ribDraw(){
  const cv=document.getElementById('rib-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, k=_rib.k;
  ctx.clearRect(0,0,W,H);
  const R=RIB_REL.reduce((a,b)=>a+b,0);
  // ribbon
  const rw=22, rx=16, rTop=30, rh=(H-rTop-24)/25;
  let r=0;
  const pts=[];
  RIB_REL.forEach((rel,i)=>{
    if(i<k&&rel) r++;
    const y=rTop+i*rh;
    const seen=i<k;
    ctx.fillStyle=rel?(seen?'rgba(61,220,132,0.75)':'rgba(61,220,132,0.16)'):(seen?'rgba(255,255,255,0.13)':'rgba(255,255,255,0.05)');
    ctx.fillRect(rx,y,rw,rh-1.5);
    ctx.fillStyle=seen?'#0B101F':'rgba(255,255,255,0.3)'; ctx.font='7px monospace'; ctx.textAlign='center';
    if(rh>9) ctx.fillText(rel?'R':'N',rx+rw/2,y+rh*0.72);
  });
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('rank',rx,20);
  // cursor
  ctx.strokeStyle='#fde047'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(rx-4,rTop+k*rh); ctx.lineTo(rx+rw+6,rTop+k*rh); ctx.stroke();
  // meters
  const P=k>0?r/k:0, Rc=r/R;
  const mx=rx+rw+26;
  [['precision  r/k',P,'#FF5F8E'],['recall  r/R',Rc,'#4DE3FF']].forEach(([lab,v,col],i)=>{
    const y=34+i*46;
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace'; ctx.textAlign='left';
    ctx.fillText(lab,mx,y);
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(mx,y+6,150,16);
    ctx.fillStyle=col; ctx.globalAlpha=0.75; ctx.fillRect(mx,y+6,150*v,16); ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.font='9px monospace';
    ctx.fillText(v.toFixed(3),mx+156,y+18);
    if(i===1){ ctx.fillStyle='rgba(77,227,255,0.5)'; ctx.font='7px monospace'; ctx.fillText('cannot decrease',mx,y+34); }
    else { ctx.fillStyle='rgba(255,95,142,0.5)'; ctx.font='7px monospace'; ctx.fillText('falls on every N, rises on every R',mx,y+34); }
  });
  // curve
  const gx=mx+210, gy=H-40, gw=W-gx-24, gh=H-96;
  ctx.strokeStyle='rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.moveTo(gx,gy-gh); ctx.lineTo(gx,gy); ctx.lineTo(gx+gw,gy); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.textAlign='center';
  ctx.fillText('recall \u2192',gx+gw/2,gy+16);
  ctx.save(); ctx.translate(gx-14,gy-gh/2); ctx.rotate(-Math.PI/2); ctx.fillText('precision',0,0); ctx.restore();
  // build P-R points up to k
  let rr=0; const curve=[];
  for(let i=0;i<k;i++){ if(RIB_REL[i]) rr++; curve.push([rr/R, rr/(i+1), RIB_REL[i]]); }
  if(curve.length){
    ctx.strokeStyle='rgba(160,140,255,0.75)'; ctx.lineWidth=1.6; ctx.beginPath();
    curve.forEach(([re,pr],i)=>{ const x=gx+re*gw, y=gy-pr*gh; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.stroke();
    if(_rib.interp){
      // interpolated staircase over relevant points
      const relPts=curve.filter(c=>c[2]);
      const ip=relPts.map((c,i)=>[c[0], Math.max(...relPts.slice(i).map(z=>z[1]))]);
      ctx.strokeStyle='#3DDC84'; ctx.lineWidth=2.2; ctx.beginPath();
      ip.forEach(([re,pr],i)=>{
        const x=gx+re*gw, y=gy-pr*gh;
        if(i===0) ctx.moveTo(gx,y);
        else { const py=gy-ip[i-1][1]*gh; ctx.lineTo(x,py); }
        ctx.lineTo(x,y);
      });
      ctx.stroke();
      ctx.fillStyle='#3DDC84'; ctx.font='7px monospace'; ctx.textAlign='left';
      ctx.fillText('interpolated',gx+4,gy-gh+10);
    }
    if(_rib.map){
      const relPts=curve.filter(c=>c[2]);
      relPts.forEach(([re,pr])=>{
        ctx.fillStyle='rgba(253,224,71,0.9)';
        ctx.beginPath(); ctx.arc(gx+re*gw,gy-pr*gh,3.6,0,2*Math.PI); ctx.fill();
      });
      const ap=relPts.length?relPts.reduce((s,c)=>s+c[1],0)/R:0;
      ctx.fillStyle='#fde047'; ctx.font='bold 9px monospace'; ctx.textAlign='left';
      ctx.fillText('AP = '+ap.toFixed(3),gx+4,gy-gh+24);
    }
  }
  const cap=document.getElementById('rib-caption');
  if(cap){
    if(k===0) cap.textContent='Twenty-five ranked results, seven of them relevant. Descend the list and watch the two meters and the curve.';
    else {
      let t='At rank '+k+': '+r+' of '+R+' relevant documents found. Precision '+P.toFixed(3)+', recall '+Rc.toFixed(3)+'. ';
      t+=RIB_REL[k-1]?'The document at this rank was relevant, so both meters rose.':'The document at this rank was not relevant, so precision fell while recall stayed exactly where it was.';
      if(_rib.interp) t+=' The green staircase replaces each precision value with the maximum achieved at that recall or beyond, removing the sawtooth dips.';
      if(_rib.map) t+=' The yellow points are the precisions at the relevant ranks; average precision is their sum divided by the total number of relevant documents.';
      cap.textContent=t;
    }
  }
}

// ── 11.3 VIZ: VOCABULARY MISMATCH ──────────────────────────
const VMW_PAIRS=[['car','automobile'],['engine','motor'],['noise','rattling'],['fix','repair']];
function vmwSet(v){
  const n=parseInt(v);
  const el=document.getElementById('vmw-nv'); if(el) el.textContent=n+' of 4 words replaced';
  const cv=document.getElementById('vmw-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const qWords=VMW_PAIRS.map((p,i)=>i<n?p[1]:p[0]);
  const dWords=VMW_PAIRS.map(p=>p[1]);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('query terms',30,22); ctx.textAlign='right';
  ctx.fillText('document terms',W-30,22);
  const rowY=i=>44+i*34;
  let matches=0;
  qWords.forEach((w,i)=>{
    const y=rowY(i);
    const hit=w===dWords[i];
    if(hit) matches++;
    ctx.fillStyle=hit?'rgba(61,220,132,0.16)':'rgba(255,255,255,0.05)';
    roundRect(ctx,30,y-13,150,26,6); ctx.fill();
    ctx.strokeStyle=hit?'rgba(61,220,132,0.6)':'rgba(255,255,255,0.14)'; ctx.lineWidth=1;
    roundRect(ctx,30,y-13,150,26,6); ctx.stroke();
    ctx.fillStyle=hit?'#3DDC84':'rgba(255,255,255,0.75)'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText(w,105,y+4);
    ctx.fillStyle='rgba(255,255,255,0.05)'; roundRect(ctx,W-180,y-13,150,26,6); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.14)'; roundRect(ctx,W-180,y-13,150,26,6); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.textAlign='center';
    ctx.fillText(dWords[i],W-105,y+4);
    // link
    ctx.strokeStyle=hit?'rgba(61,220,132,0.7)':'rgba(255,95,142,0.25)'; ctx.lineWidth=hit?2:1;
    if(!hit) ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(182,y); ctx.lineTo(W-182,y); ctx.stroke(); ctx.setLineDash([]);
    if(!hit){
      ctx.fillStyle='rgba(255,95,142,0.6)'; ctx.font='8px monospace'; ctx.textAlign='center';
      ctx.fillText('0',W/2,y-5);
    } else {
      ctx.fillStyle='rgba(61,220,132,0.85)'; ctx.font='8px monospace'; ctx.textAlign='center';
      ctx.fillText('match',W/2,y-5);
    }
  });
  // scores
  const sparse=matches/4;
  const y0=H-40;
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('sparse (term overlap)',30,y0);
  ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(180,y0-11,140,14);
  ctx.fillStyle=sparse>0?'rgba(77,227,255,0.75)':'rgba(255,95,142,0.5)'; ctx.fillRect(180,y0-11,140*sparse,14);
  ctx.fillStyle=sparse>0?'#4DE3FF':'#FF5F8E'; ctx.font='bold 10px monospace';
  ctx.fillText(sparse.toFixed(3),328,y0);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace';
  ctx.fillText('dense (embedding cosine)',30,y0+20);
  ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(180,y0+9,140,14);
  ctx.fillStyle='rgba(160,140,255,0.8)'; ctx.fillRect(180,y0+9,140*0.89,14);
  ctx.fillStyle='#A18FFF'; ctx.font='bold 10px monospace';
  ctx.fillText('0.890',328,y0+20);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='7px monospace';
  ctx.fillText('unchanged by the rewriting: it never depended on shared words',400,y0+20);
  const cap=document.getElementById('vmw-caption');
  if(cap){
    if(n===0) cap.innerHTML='The two texts are about the same thing and share no content words. Every term product in the cosine numerator is zero, so the sparse score is exactly <b>0.000</b> and no weighting scheme can rescue it. The dense score is 0.89 because the encoders map the two phrasings to nearby vectors.';
    else if(n<4) cap.innerHTML=n+' word'+(n>1?'s':'')+' replaced with the author\u2019s exact vocabulary: the sparse score rose to '+sparse.toFixed(3)+'. Note what this requires of the user, namely guessing the words the document happens to use. Furnas and colleagues found two people pick the same term for the same thing less than 20% of the time.';
    else cap.innerHTML='All four words replaced: the sparse score is now 1.000. The retrieval succeeded only because the query was rewritten into the document\u2019s vocabulary, which a real user has no way to do.';
  }
}

// ── 11.3 VIZ: ARCHITECTURES ────────────────────────────────
const ARCH_INFO=[
  {name:'cross-encoder', col:'#FF5F8E', acc:0.97, passes:8000000, note:'Query and document are concatenated and encoded together, so every query token attends to every document token. Nothing can be precomputed, because the document\u2019s representation depends on the query.'},
  {name:'ColBERT', col:'#fde047', acc:0.91, passes:1, note:'Both sides are encoded separately but kept as one vector per token. Scoring sums, over query tokens, the maximum similarity to any document token. Document token vectors are precomputed, so a query costs one encoder pass plus the MaxSim computation.'},
  {name:'bi-encoder', col:'#4DE3FF', acc:0.84, passes:1, note:'Each side is collapsed to a single vector. Document vectors are precomputed offline, so a query costs one encoder pass and one nearest-neighbor lookup. Least accurate of the three, and the only one that scales to a full collection on its own.'}
];
let _arch={ i:0 };
function archSet(v){
  _arch.i=parseInt(v);
  const el=document.getElementById('arch-nv'); if(el) el.textContent=ARCH_INFO[_arch.i].name;
  archDraw();
}
function archDraw(){
  const cv=document.getElementById('arch-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, a=ARCH_INFO[_arch.i];
  ctx.clearRect(0,0,W,H);
  const rr=document.getElementById('arch-rerank');
  const rerank=rr?rr.checked:false;
  const qn=4, dn=6, qx=110, dx=W-190, top=40, sp=26;
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText('query tokens',qx,22); ctx.fillText('document tokens',dx,22);
  const qy=i=>top+i*sp, dy=i=>top+i*sp*0.72;
  if(_arch.i===0){
    for(let i=0;i<qn;i++) for(let j=0;j<dn;j++){
      ctx.strokeStyle='rgba(255,95,142,0.16)'; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.moveTo(qx+22,qy(i)); ctx.lineTo(dx-22,dy(j)); ctx.stroke();
    }
  } else if(_arch.i===1){
    const best=[2,0,4,3];
    for(let i=0;i<qn;i++){
      ctx.strokeStyle='rgba(253,224,71,0.7)'; ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.moveTo(qx+22,qy(i)); ctx.lineTo(dx-22,dy(best[i])); ctx.stroke();
      for(let j=0;j<dn;j++) if(j!==best[i]){
        ctx.strokeStyle='rgba(253,224,71,0.09)'; ctx.lineWidth=0.7;
        ctx.beginPath(); ctx.moveTo(qx+22,qy(i)); ctx.lineTo(dx-22,dy(j)); ctx.stroke();
      }
    }
    ctx.fillStyle='rgba(253,224,71,0.7)'; ctx.font='8px monospace'; ctx.textAlign='center';
    ctx.fillText('each query token keeps its best match (MaxSim)',W/2,H-70);
  } else {
    ctx.strokeStyle='rgba(77,227,255,0.8)'; ctx.lineWidth=2.6;
    ctx.beginPath(); ctx.moveTo(qx+22,top+sp); ctx.lineTo(dx-22,top+sp); ctx.stroke();
    ctx.fillStyle='rgba(77,227,255,0.85)';
    ctx.beginPath(); ctx.arc(qx,top+sp,9,0,2*Math.PI); ctx.fill();
    ctx.beginPath(); ctx.arc(dx,top+sp,9,0,2*Math.PI); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace'; ctx.textAlign='center';
    ctx.fillText('z_q',qx,top+sp+22); ctx.fillText('z_d',dx,top+sp+22);
    ctx.fillText('one dot product',W/2,top+sp-12);
  }
  if(_arch.i<2){
    for(let i=0;i<qn;i++){ ctx.fillStyle='rgba(160,140,255,0.7)'; ctx.beginPath(); ctx.arc(qx,qy(i),6,0,2*Math.PI); ctx.fill(); }
    for(let j=0;j<dn;j++){ ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(dx,dy(j),6,0,2*Math.PI); ctx.fill(); }
  }
  // meters
  const my=H-52;
  const passes=rerank?50:a.passes;
  const acc=rerank?0.955:a.acc;
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('accuracy',16,my);
  ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(80,my-10,180,13);
  ctx.fillStyle=a.col; ctx.globalAlpha=0.8; ctx.fillRect(80,my-10,180*acc,13); ctx.globalAlpha=1;
  ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='9px monospace';
  ctx.fillText((acc*100).toFixed(1)+'%',266,my);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace';
  ctx.fillText('encoder passes per query',330,my);
  ctx.fillStyle=passes>1000?'#FF5F8E':'#3DDC84'; ctx.font='bold 11px monospace';
  ctx.fillText(passes.toLocaleString(),330,my+18);
  const cap=document.getElementById('arch-caption');
  if(cap) cap.innerHTML=rerank
    ? '<b>Two-stage retrieval.</b> BM25 or a bi-encoder retrieves 1000 candidates cheaply, then the cross-encoder rescores only the top 50. Encoder passes drop from eight million to fifty, roughly five orders of magnitude, while accuracy stays near the cross-encoder\u2019s. This is what production systems actually do, and it is why Section 11.4 can assume a reranker is available.'
    : '<b style="color:'+a.col+'">'+a.name+'</b> \u2014 '+a.note;
}

// ── 11.3 VIZ: ANN SEARCH ───────────────────────────────────
function msimSet(v){
  const cells=parseInt(v);
  const el=document.getElementById('msim-nv'); if(el) el.textContent=cells===0?'exhaustive (exact)':cells;
  const cv=document.getElementById('msim-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const L=20, T=20, S=Math.min(W-220,H-50);
  // grid cells
  const g=4, cw=S/g;
  for(let i=0;i<g;i++) for(let j=0;j<g;j++){
    ctx.strokeStyle='rgba(255,255,255,0.09)'; ctx.lineWidth=1;
    ctx.strokeRect(L+i*cw,T+j*cw,cw,cw);
  }
  // points
  const pts=[];
  for(let i=0;i<70;i++){
    const x=L+8+((Math.sin(i*12.9898)*0.5+0.5)*(S-16));
    const y=T+8+((Math.sin(i*78.233)*0.5+0.5)*(S-16));
    pts.push([x,y]);
  }
  const q=[L+S*0.42,T+S*0.46];
  const qc=[Math.floor((q[0]-L)/cw),Math.floor((q[1]-T)/cw)];
  // true nearest
  let nn=0, nd=1e9;
  pts.forEach((p,i)=>{ const d=Math.hypot(p[0]-q[0],p[1]-q[1]); if(d<nd){ nd=d; nn=i; } });
  const inSearched=p=>{
    if(cells===0) return true;
    const ci=Math.floor((p[0]-L)/cw), cj=Math.floor((p[1]-T)/cw);
    const dist=Math.max(Math.abs(ci-qc[0]),Math.abs(cj-qc[1]));
    if(cells<=1) return dist===0;
    if(cells<=4) return dist<=1&&(Math.abs(ci-qc[0])+Math.abs(cj-qc[1]))<=1;
    if(cells<=9) return dist<=1;
    return true;
  };
  // highlight searched cells
  for(let i=0;i<g;i++) for(let j=0;j<g;j++){
    const d=Math.max(Math.abs(i-qc[0]),Math.abs(j-qc[1]));
    let on = cells===0 ? true : (cells<=1 ? d===0 : (cells<=4 ? (d<=1&&(Math.abs(i-qc[0])+Math.abs(j-qc[1]))<=1) : d<=1));
    if(on){ ctx.fillStyle='rgba(77,227,255,0.07)'; ctx.fillRect(L+i*cw,T+j*cw,cw,cw); }
  }
  let touched=0;
  pts.forEach((p,i)=>{
    const searched=inSearched(p);
    if(searched) touched++;
    const isNN=i===nn;
    ctx.fillStyle=isNN?(searched?'#3DDC84':'#FF5F8E'):(searched?'rgba(77,227,255,0.7)':'rgba(255,255,255,0.13)');
    ctx.beginPath(); ctx.arc(p[0],p[1],isNN?6:3.2,0,2*Math.PI); ctx.fill();
    if(isNN){ ctx.strokeStyle=searched?'#3DDC84':'#FF5F8E'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(p[0],p[1],10,0,2*Math.PI); ctx.stroke(); }
  });
  ctx.fillStyle='#fde047'; ctx.beginPath(); ctx.arc(q[0],q[1],6,0,2*Math.PI); ctx.fill();
  ctx.fillStyle='#fde047'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('query',q[0]+9,q[1]-6);
  // readout
  const px=L+S+24;
  const found=inSearched(pts[nn]);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('vectors compared',px,50);
  ctx.fillStyle=touched>50?'#FF5F8E':'#4DE3FF'; ctx.font='bold 15px monospace';
  ctx.fillText(touched+' / 70',px,70);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace';
  ctx.fillText('true nearest neighbor',px,100);
  ctx.fillStyle=found?'#3DDC84':'#FF5F8E'; ctx.font='bold 11px monospace';
  ctx.fillText(found?'found':'MISSED',px,118);
  const cap=document.getElementById('msim-caption');
  if(cap){
    if(cells===0) cap.innerHTML='Exact search compares the query against every stored vector: '+touched+' comparisons, guaranteed correct, and linear in the collection size. At a billion vectors this is not viable.';
    else if(found) cap.innerHTML='Approximate search examined only the cells near the query: '+touched+' of 70 comparisons, and the true nearest neighbor was inside the searched region. This is the normal case, and it is why the approximation is acceptable.';
    else cap.innerHTML='Approximate search examined '+touched+' of 70 vectors and <b style="color:var(--accent3)">missed the true nearest neighbor</b>, which sits just across a cell boundary. This is the cost of the approximation. Widening the search recovers it at the price of more comparisons.';
  }
}

// ── 11.4 VIZ: RAG ASSEMBLY LINE ────────────────────────────
const RAGL_PASSAGES=[
  {t:'Mozart\u2019s The Magic Flute (Die Zauberfl\u00f6te) premiered on 30 September 1791 at the Theater auf der Wieden in Vienna.', rel:true},
  {t:'The Magic Flute is a singspiel in two acts, with a libretto by Emanuel Schikaneder.', rel:true},
  {t:'Mozart completed his Requiem in D minor only partially before his death in December 1791.', rel:false}
];
let _ragl={ on:false, stage:0, anim:null };
function raglBuild(){ _ragl={on:false,stage:0,anim:null}; raglSw(); raglDraw();
  const o=document.getElementById('ragl-out'); if(o) o.innerHTML='<span style="color:#8E9AC4">Press the button to answer the question.</span>';
  const c=document.getElementById('ragl-caption'); if(c) c.textContent='Question: in what year did Mozart\u2019s The Magic Flute premiere? Try it with retrieval off first.';
}
function raglSw(){
  const b=document.getElementById('ragl-sw');
  if(b){ b.textContent='retrieval: '+(_ragl.on?'ON':'OFF'); b.style.background=_ragl.on?'var(--accent4)':'var(--surface2)'; b.style.color=_ragl.on?'#0B101F':'var(--muted)'; b.style.borderColor=_ragl.on?'var(--accent4)':'var(--border2)'; }
}
function raglToggle(){ _ragl.on=!_ragl.on; _ragl.stage=0; raglSw(); raglDraw();
  const o=document.getElementById('ragl-out'); if(o) o.innerHTML='<span style="color:#8E9AC4">Press the button to answer the question.</span>'; }
function raglRun(){
  if(_ragl.anim) clearInterval(_ragl.anim);
  _ragl.stage=0;
  _ragl.anim=setInterval(()=>{
    _ragl.stage++;
    raglDraw();
    if(_ragl.stage>=(_ragl.on?4:2)){
      clearInterval(_ragl.anim); _ragl.anim=null;
      const o=document.getElementById('ragl-out'), c=document.getElementById('ragl-caption');
      if(_ragl.on){
        if(o) o.innerHTML='<span style="color:#8E9AC4">answer:</span> The Magic Flute premiered in <b style="color:#3DDC84">1791</b>, on 30 September at the Theater auf der Wieden in Vienna. <span style="color:#4DE3FF">[1]</span>';
        if(c) c.innerHTML='With retrieval on, passage 1 was placed in the prompt and the correct date came from that text rather than from the weights. The model did not need to know the answer; it needed to read it. Note also that the answer can now be checked against a specific source.';
      } else {
        if(o) o.innerHTML='<span style="color:#8E9AC4">answer:</span> The Magic Flute premiered in <b style="color:#FF5F8E">1787</b> in Vienna.';
        if(c) c.innerHTML='With retrieval off, the model answered from its weights and produced a confident, fluent, wrong date. Nothing in the output marks it as unreliable. Now switch retrieval on and run it again.';
      }
    }
  },420);
}
function raglDraw(){
  const cv=document.getElementById('ragl-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, st=_ragl.stage;
  ctx.clearRect(0,0,W,H);
  // question
  ctx.fillStyle='rgba(160,140,255,0.14)'; roundRect(ctx,16,14,W-32,26,6); ctx.fill();
  ctx.strokeStyle='rgba(160,140,255,0.5)'; ctx.lineWidth=1; roundRect(ctx,16,14,W-32,26,6); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('user question: in what year did Mozart\u2019s The Magic Flute premiere?',26,31);
  if(_ragl.on){
    // retriever + passages
    ctx.fillStyle='rgba(255,255,255,0.04)'; roundRect(ctx,16,50,120,34,7); ctx.fill();
    ctx.strokeStyle=st>=1?'#4DE3FF':'rgba(255,255,255,0.15)'; ctx.lineWidth=1.2; roundRect(ctx,16,50,120,34,7); ctx.stroke();
    ctx.fillStyle=st>=1?'#4DE3FF':'rgba(255,255,255,0.4)'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText('retriever',76,71);
    if(st>=1){
      ctx.strokeStyle='rgba(77,227,255,0.5)'; ctx.beginPath(); ctx.moveTo(136,67); ctx.lineTo(160,67); ctx.stroke();
    }
    RAGL_PASSAGES.forEach((p,i)=>{
      const y=50+i*38;
      const shown=st>=2;
      const used=st>=4&&p.rel&&i===0;
      ctx.fillStyle=used?'rgba(61,220,132,0.15)':(shown?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.02)');
      roundRect(ctx,166,y,W-186,32,6); ctx.fill();
      ctx.strokeStyle=used?'rgba(61,220,132,0.7)':(shown?'rgba(255,255,255,0.14)':'rgba(255,255,255,0.05)'); ctx.lineWidth=used?1.6:1;
      roundRect(ctx,166,y,W-186,32,6); ctx.stroke();
      ctx.fillStyle=used?'#3DDC84':(shown?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.15)'); ctx.font='8px monospace'; ctx.textAlign='left';
      const txt=p.t.length>78?p.t.slice(0,76)+'\u2026':p.t;
      ctx.fillText('['+(i+1)+'] '+txt,174,y+20);
    });
    // prompt block
    if(st>=3){
      ctx.fillStyle='rgba(253,224,71,0.08)'; roundRect(ctx,16,172,W-32,54,8); ctx.fill();
      ctx.strokeStyle='rgba(253,224,71,0.5)'; ctx.lineWidth=1.2; roundRect(ctx,16,172,W-32,54,8); ctx.stroke();
      ctx.fillStyle='#fde047'; ctx.font='8px monospace'; ctx.textAlign='left';
      ctx.fillText('assembled prompt:',26,188);
      ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='7px monospace';
      ctx.fillText('Answer the question using only the context below.',26,201);
      ctx.fillText('[context: passages 1-3]  [question: in what year did \u2026]',26,213);
    }
  } else {
    ctx.fillStyle='rgba(255,255,255,0.03)'; roundRect(ctx,16,60,W-32,80,8); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.setLineDash([4,4]); ctx.lineWidth=1; roundRect(ctx,16,60,W-32,80,8); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText('retrieval is off \u00b7 no passages are added to the prompt',W/2,105);
  }
  // generator
  const gy=_ragl.on?240:170;
  const active=_ragl.on?st>=4:st>=2;
  ctx.fillStyle=active?'rgba(160,140,255,0.16)':'rgba(255,255,255,0.04)';
  roundRect(ctx,W/2-90,gy,180,34,8); ctx.fill();
  ctx.strokeStyle=active?'#A18FFF':'rgba(255,255,255,0.15)'; ctx.lineWidth=1.3;
  roundRect(ctx,W/2-90,gy,180,34,8); ctx.stroke();
  ctx.fillStyle=active?'#A18FFF':'rgba(255,255,255,0.4)'; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText('generator',W/2,gy+21);
}

// ── 11.4 VIZ: NOISE + RERANK ───────────────────────────────
function noiseSet(v){
  const p=parseInt(v);
  const el=document.getElementById('noise-nv'); if(el) el.textContent=p+'%';
  noiseDraw();
}
function noiseDraw(){
  const s=document.getElementById('noise-n'); if(!s) return;
  const p=parseInt(s.value);
  const rrEl=document.getElementById('noise-rr');
  const rr=rrEl?rrEl.checked:false;
  const cv=document.getElementById('noise-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const k=5, nBad=Math.round(k*p/100);
  let slots=[];
  for(let i=0;i<k;i++) slots.push(i<nBad?'bad':'good');
  // interleave the bad ones for realism
  slots = slots.sort(()=>0).map((x,i)=> (i%2===0 && nBad>0 && i/2<nBad) ? 'bad':'good');
  let bc=slots.filter(x=>x==='bad').length;
  while(bc<nBad){ const idx=slots.indexOf('good'); slots[idx]='bad'; bc++; }
  while(bc>nBad){ const idx=slots.indexOf('bad'); slots[idx]='good'; bc--; }
  const shown = rr ? slots.slice().sort((a,b)=>(a==='good'?0:1)-(b==='good'?0:1)) : slots;
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText(rr?'top-5 passages after reranking':'top-5 passages as retrieved',16,18);
  shown.forEach((s2,i)=>{
    const y=28+i*30;
    const good=s2==='good';
    ctx.fillStyle=good?'rgba(61,220,132,0.13)':'rgba(255,95,142,0.11)';
    roundRect(ctx,16,y,W-190,24,6); ctx.fill();
    ctx.strokeStyle=good?'rgba(61,220,132,0.5)':'rgba(255,95,142,0.45)'; ctx.lineWidth=1;
    roundRect(ctx,16,y,W-190,24,6); ctx.stroke();
    ctx.fillStyle=good?'#3DDC84':'#ff8aa0'; ctx.font='8px monospace'; ctx.textAlign='left';
    ctx.fillText('['+(i+1)+'] '+(good?'passage about the question':'passage on an adjacent but different topic'),24,y+16);
  });
  // quality meter
  const base=1-0.85*(nBad/k);
  const q=rr? Math.min(1,base+0.62*(nBad/k)) : base;
  const mx=W-160;
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('answer quality',mx,40);
  ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(mx,48,130,16);
  ctx.fillStyle=q>0.7?'rgba(61,220,132,0.8)':(q>0.4?'rgba(253,224,71,0.8)':'rgba(255,95,142,0.8)');
  ctx.fillRect(mx,48,130*q,16);
  ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.font='bold 10px monospace';
  ctx.fillText((q*100).toFixed(0)+'%',mx,80);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='7px monospace';
  ctx.fillText(rr?'reranker applied':'no reranker',mx,96);
  const cap=document.getElementById('noise-caption');
  if(cap){
    if(nBad===0) cap.textContent='Every retrieved passage is relevant. The model has only correct material to read, and the answer reflects it.';
    else if(rr) cap.innerHTML='The cross-encoder reranker rescored the candidates and moved the relevant passages to the top of the prompt. The same '+nBad+' distractor'+(nBad>1?'s are':' is')+' still present but now sits at the bottom, and answer quality recovers substantially. This is the standard mitigation.';
    else cap.innerHTML=nBad+' of 5 passages are irrelevant, and they occupy early positions in the prompt. The model has no way to know which passages deserve trust, so it tends to incorporate distractor content into the answer. Enable the reranker to see the effect of reordering.';
  }
}

// ── 11.4 VIZ: MULTI-HOP ────────────────────────────────────
const HOP_STAGES=[
  {lab:'question', txt:'Which director of the film that won Best Picture for 2001 also directed a film about the Apollo programme?', col:'#A18FFF'},
  {lab:'hop 1 retrieval', txt:'\u2192 retrieves: "A Beautiful Mind won Best Picture at the 74th Academy Awards, for films of 2001."', col:'#4DE3FF'},
  {lab:'new query', txt:'Who directed A Beautiful Mind, and did they direct a film about the Apollo programme?', col:'#fde047'},
  {lab:'hop 2 retrieval', txt:'\u2192 retrieves: "Ron Howard directed A Beautiful Mind." and "Ron Howard directed Apollo 13 (1995)." plus a filmography passage.', col:'#4DE3FF'},
  {lab:'answer', txt:'Ron Howard \u2014 assembled from two retrievals, neither sufficient alone.', col:'#3DDC84'}
];
let _hop={ n:0 };
function hopReset(){ _hop.n=0; hopDraw();
  const c=document.getElementById('hop-caption');
  const sg=document.getElementById('hop-single');
  if(c) c.textContent=(sg&&sg.checked)?'Single-hop mode. Press Next hop and watch where the chain stops.':'A question whose answer cannot be retrieved in one step. Press Next hop.'; }
function hopStep(){
  const sg=document.getElementById('hop-single');
  const max=(sg&&sg.checked)?2:HOP_STAGES.length-1;
  _hop.n=Math.min(max,_hop.n+1);
  hopDraw();
  const c=document.getElementById('hop-caption');
  if(!c) return;
  if(sg&&sg.checked&&_hop.n>=2) c.innerHTML='Single-hop retrieval stops here. The first retrieval found the 1994 winner, but the question asked about its <em>director</em>, and no single passage contains both the award fact and the filmography. Without a second retrieval using the newly discovered title, the chain cannot complete.';
  else if(_hop.n>=HOP_STAGES.length-1) c.innerHTML='The chain completed. The fact retrieved in hop 1 supplied the terms needed to formulate the hop 2 query. This is what multi-hop means: the output of one retrieval becomes the input of the next, and neither retrieval alone answers the question.';
  else c.textContent=HOP_STAGES[_hop.n].lab+': '+HOP_STAGES[_hop.n].txt;
}
function hopDraw(){
  const cv=document.getElementById('hop-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const sg=document.getElementById('hop-single');
  const single=sg?sg.checked:false;
  HOP_STAGES.forEach((s,i)=>{
    const y=14+i*46, on=i<=_hop.n;
    const blocked=single&&i>2;
    ctx.fillStyle=on?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.02)';
    roundRect(ctx,16,y,W-32,38,7); ctx.fill();
    ctx.strokeStyle=on?s.col:(blocked?'rgba(255,95,142,0.2)':'rgba(255,255,255,0.08)'); ctx.lineWidth=on?1.4:1;
    if(blocked) ctx.setLineDash([4,4]);
    roundRect(ctx,16,y,W-32,38,7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle=on?s.col:'rgba(255,255,255,0.2)'; ctx.font='bold 8px monospace'; ctx.textAlign='left';
    ctx.fillText(s.lab,26,y+15);
    ctx.fillStyle=on?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.15)'; ctx.font='7px monospace';
    const t=s.txt.length>96?s.txt.slice(0,94)+'\u2026':s.txt;
    ctx.fillText(t,26,y+29);
    if(i<HOP_STAGES.length-1){
      ctx.strokeStyle=on&&_hop.n>i?'rgba(255,255,255,0.35)':'rgba(255,255,255,0.1)'; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(W/2,y+38); ctx.lineTo(W/2,y+46); ctx.stroke();
    }
  });
  if(single&&_hop.n>=2){
    ctx.strokeStyle='rgba(255,95,142,0.7)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(W/2-40,14+3*46-4); ctx.lineTo(W/2+40,14+3*46-4); ctx.stroke();
    ctx.fillStyle='#FF5F8E'; ctx.font='8px monospace'; ctx.textAlign='center';
    ctx.fillText('second retrieval not permitted',W/2,14+3*46+12);
  }
}

// ── 11.4 VIZ: CITATION TRACER ──────────────────────────────
const CITE_CLAIMS=[
  {txt:'Gong Li was born in Shenyang in 1965', src:0},
  {txt:'she first appeared in Red Sorghum in 1987', src:1},
  {txt:'she has won three Best Actress awards at the Golden Rooster Awards', src:-1}
];
const CITE_SRC=[
  'Gong Li (born 31 December 1965 in Shenyang, Liaoning) is a Chinese-born Singaporean actress.',
  'She made her film debut in Zhang Yimou\u2019s Red Sorghum (1987), which won the Golden Bear at Berlin.'
];
let _cite={ sel:-1 };
function citeBuild(){
  const a=document.getElementById('cite-answer');
  if(a) a.innerHTML=CITE_CLAIMS.map((c,i)=>
    '<span onmouseover="citeShow('+i+')" onclick="citeShow('+i+')" style="cursor:pointer;border-bottom:1px dotted rgba(255,255,255,0.3);padding:0 .1rem">'+c.txt+'</span> <span style="color:#4DE3FF">['+(i+1)+']</span>'+(i<CITE_CLAIMS.length-1?', and ':'.')
  ).join('');
  citeShow(-1);
}
function citeShow(i){
  _cite.sel=i;
  const s=document.getElementById('cite-src');
  if(s) s.innerHTML=CITE_SRC.map((t,j)=>{
    const hit=i>=0&&CITE_CLAIMS[i].src===j;
    return '<div style="background:'+(hit?'rgba(61,220,132,0.12)':'var(--surface2)')+';border:1px solid '+(hit?'rgba(61,220,132,0.6)':'var(--border2)')+';border-radius:8px;padding:.55rem .8rem;font-family:var(--mono);font-size:.7rem;line-height:1.7;color:'+(hit?'#ECF1FF':'rgba(233,238,236,0.55)')+'"><span style="color:#4DE3FF">passage '+(j+1)+':</span> '+t+'</div>';
  }).join('');
  const c=document.getElementById('cite-caption');
  if(!c) return;
  if(i<0) c.textContent='Hover or tap a numbered claim to trace it to its passage.';
  else if(CITE_CLAIMS[i].src>=0) c.innerHTML='Claim '+(i+1)+' traces to passage '+(CITE_CLAIMS[i].src+1)+', which states it directly. This is what a citation is supposed to mean, and the user can verify it.';
  else c.innerHTML='<b style="color:var(--accent3)">Claim '+(i+1)+' traces to nothing.</b> No retrieved passage mentions the Golden Rooster Awards, yet the answer carries a citation marker as though it did. This failure is worse than an uncited claim, because the marker signals a verification that never happened. Checking that each citation actually supports its claim is a necessary habit, not an optional one.';
}

// ── 11.5 VIZ: DATASET MAP ──────────────────────────────────
const DSL_SETS=[
  {name:'Natural Questions', x:0.12, y:0.5, r:9, col:'#4DE3FF', q:'"who wrote the book the origin of species" \u2014 a real Google query, paired with a Wikipedia page containing the answer.', note:'Real user queries, so the distribution includes vague and unanswerable questions. Runs either open-book with its paired page or closed-book without it, which is why it can slide along the vertical axis.'},
  {name:'MS MARCO', x:0.20, y:0.86, r:8, col:'#3DDC84', q:'"what is the average salary of a physical therapist" \u2014 with passages retrieved from the web.', note:'Bing queries with human-written answers and passage relevance labels; heavily used to train and evaluate retrievers themselves, not just readers.'},
  {name:'DuReader', x:0.24, y:0.80, r:7, col:'#A18FFF', q:'A Baidu search query with retrieved Chinese web documents.', note:'Chinese-language open-book QA built from Baidu queries and documents, at a scale comparable to the English resources.'},
  {name:'TyDi QA', x:0.34, y:0.76, r:7, col:'#ff8c42', q:'A question written by a speaker who genuinely did not know the answer, in one of 11 typologically diverse languages.', note:'Eleven languages chosen for typological diversity rather than data availability, including Arabic, Bengali, Kiswahili, Russian, and Thai. Questions were written before the answer passage was seen, so they are information-seeking rather than reverse-engineered from a text.'},
  {name:'MMLU', x:0.86, y:0.12, r:9, col:'#FF5F8E', q:'"Which of the following is the most likely cause of a sudden drop in TCP throughput?" \u2014 four options, one correct.', note:'Fifty-seven subjects from elementary mathematics to international law and professional medicine, written to probe knowledge rather than to seek it. Multiple choice, closed-book by design.'}
];
let _dsl={ sel:-1, nq:1 };
function dslBuild(){
  const cv=document.getElementById('dsl-canvas');
  if(cv) cv.onclick=e=>{
    const r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(cv.width/r.width), my=(e.clientY-r.top)*(cv.height/r.height);
    const L=60,T=24,R=cv.width-24,B=cv.height-40;
    let best=-1, bd=400;
    DSL_SETS.forEach((d,i)=>{
      const y=(i===0?_dsl.nq:d.y);
      const px=L+d.x*(R-L), py=T+(1-y)*(B-T);
      const dd=(px-mx)**2+(py-my)**2;
      if(dd<bd){ bd=dd; best=i; }
    });
    if(best>=0){ _dsl.sel=best; dslDraw(); }
  };
  _dsl={sel:-1,nq:1};
  dslDraw();
}
function dslNQ(v){
  _dsl.nq=parseFloat(v);
  const el=document.getElementById('dsl-nq');
  if(el) el.textContent=_dsl.nq>0.66?'open-book':(_dsl.nq<0.33?'closed-book':'either');
  dslDraw();
}
function dslDraw(){
  const cv=document.getElementById('dsl-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const L=60,T=24,R=W-24,B=H-40;
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1;
  ctx.strokeRect(L,T,R-L,B-T);
  ctx.beginPath(); ctx.moveTo(L,(T+B)/2); ctx.lineTo(R,(T+B)/2); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('naturally information-seeking',L+6,B+14);
  ctx.textAlign='right';
  ctx.fillText('designed to probe knowledge',R-6,B+14);
  ctx.save(); ctx.translate(18,(T+B)/2); ctx.rotate(-Math.PI/2); ctx.textAlign='center';
  ctx.fillText('closed-book \u2190 \u2192 open-book',0,0); ctx.restore();
  DSL_SETS.forEach((d,i)=>{
    const y=(i===0?_dsl.nq:d.y);
    const px=L+d.x*(R-L), py=T+(1-y)*(B-T);
    const sel=_dsl.sel===i;
    if(i===0){
      ctx.strokeStyle='rgba(77,227,255,0.3)'; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(px,T+4); ctx.lineTo(px,B-4); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.fillStyle=d.col; ctx.globalAlpha=sel?1:0.75;
    ctx.shadowBlur=sel?12:0; ctx.shadowColor=d.col;
    ctx.beginPath(); ctx.arc(px,py,d.r,0,2*Math.PI); ctx.fill();
    ctx.shadowBlur=0; ctx.globalAlpha=1;
    ctx.fillStyle=sel?d.col:'rgba(255,255,255,0.55)'; ctx.font=(sel?'bold ':'')+'8px monospace'; ctx.textAlign='center';
    ctx.fillText(d.name,px,py-d.r-6);
  });
  const cap=document.getElementById('dsl-caption');
  if(cap){
    if(_dsl.sel<0) cap.textContent='Click a dataset for a sample question. The horizontal axis is where the questions came from; the vertical axis is whether the system may consult documents.';
    else { const d=DSL_SETS[_dsl.sel];
      cap.innerHTML='<b style="color:'+d.col+'">'+d.name+'</b> \u00b7 sample: '+d.q+'<br><span style="color:var(--muted)">'+d.note+'</span>'; }
  }
}

// ── 11.6 VIZ: GRADING ──────────────────────────────────────
const GRADE_PRESETS=[
  ['the Treaty of Versailles','the Treaty of Versailles 1919','right, but more specific'],
  ['Paris','Paris, France','extra qualifier'],
  ['Paris','paris','case and punctuation only'],
  ['the Ninth Circuit','Ninth Circuit','dropped article'],
  ['Ron Howard directed Apollo 13','Apollo 13 directed Ron Howard','reversed meaning'],
  ['1791','1787','simply wrong']
];
function gradeBuild(){
  const p=document.getElementById('grade-presets');
  if(p) p.innerHTML=GRADE_PRESETS.map((g,i)=>'<button onclick="gradePreset('+i+')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:6px;padding:.3rem .6rem;font-family:var(--mono);font-size:.62rem;cursor:pointer">'+g[2]+'</button>').join('');
  gradeDraw();
}
function gradePreset(i){
  const g=document.getElementById('grade-gold'), p=document.getElementById('grade-pred');
  if(g) g.value=GRADE_PRESETS[i][0];
  if(p) p.value=GRADE_PRESETS[i][1];
  gradeDraw();
}
function _gradeNorm(s){ return s.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\b(a|an|the)\b/g,'').replace(/\s+/g,' ').trim(); }
function gradeDraw(){
  const gEl=document.getElementById('grade-gold'), pEl=document.getElementById('grade-pred');
  if(!gEl||!pEl) return;
  const gold=_gradeNorm(gEl.value), pred=_gradeNorm(pEl.value);
  const gt=gold.split(' ').filter(x=>x), pt=pred.split(' ').filter(x=>x);
  const em=(gold===pred&&gold.length>0)?1:0;
  const gset={}, inter=[];
  gt.forEach(t=>gset[t]=(gset[t]||0)+1);
  const tmp={...gset};
  pt.forEach(t=>{ if(tmp[t]>0){ inter.push(t); tmp[t]--; } });
  const P=pt.length?inter.length/pt.length:0;
  const R=gt.length?inter.length/gt.length:0;
  const F=(P+R>0)?2*P*R/(P+R):0;
  const cv=document.getElementById('grade-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  // EM stamp
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('exact match',20,20);
  ctx.fillStyle=em?'rgba(61,220,132,0.16)':'rgba(255,95,142,0.14)';
  roundRect(ctx,20,30,150,54,9); ctx.fill();
  ctx.strokeStyle=em?'#3DDC84':'#FF5F8E'; ctx.lineWidth=2; roundRect(ctx,20,30,150,54,9); ctx.stroke();
  ctx.fillStyle=em?'#3DDC84':'#FF5F8E'; ctx.font='bold 20px monospace'; ctx.textAlign='center';
  ctx.fillText(em?'1':'0',95,64);
  ctx.font='7px monospace'; ctx.fillStyle='rgba(255,255,255,0.4)';
  ctx.fillText(em?'strings identical after normalizing':'strings differ after normalizing',95,98);
  // Venn
  const cx1=330, cx2=420, cy=76, rad=54;
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('token F1',250,20);
  ctx.globalAlpha=0.28;
  ctx.fillStyle='#A18FFF'; ctx.beginPath(); ctx.arc(cx1,cy,rad,0,2*Math.PI); ctx.fill();
  ctx.fillStyle='#4DE3FF'; ctx.beginPath(); ctx.arc(cx2,cy,rad,0,2*Math.PI); ctx.fill();
  ctx.globalAlpha=1;
  ctx.strokeStyle='rgba(160,140,255,0.7)'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.arc(cx1,cy,rad,0,2*Math.PI); ctx.stroke();
  ctx.strokeStyle='rgba(77,227,255,0.7)'; ctx.beginPath(); ctx.arc(cx2,cy,rad,0,2*Math.PI); ctx.stroke();
  ctx.fillStyle='rgba(160,140,255,0.9)'; ctx.font='8px monospace'; ctx.textAlign='center';
  ctx.fillText('gold ('+gt.length+')',cx1-34,cy-rad-8);
  ctx.fillStyle='rgba(77,227,255,0.9)';
  ctx.fillText('prediction ('+pt.length+')',cx2+40,cy-rad-8);
  ctx.fillStyle='#fde047'; ctx.font='bold 11px monospace';
  ctx.fillText(inter.length,(cx1+cx2)/2,cy+4);
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='7px monospace';
  ctx.fillText('shared',(cx1+cx2)/2,cy+16);
  // metrics
  ctx.textAlign='left'; ctx.font='9px monospace';
  ctx.fillStyle='rgba(255,255,255,0.6)';
  ctx.fillText('P = '+inter.length+'/'+(pt.length||0)+' = '+P.toFixed(3),20,H-46);
  ctx.fillText('R = '+inter.length+'/'+(gt.length||0)+' = '+R.toFixed(3),160,H-46);
  ctx.fillStyle=F>0.8?'#3DDC84':(F>0.4?'#fde047':'#FF5F8E'); ctx.font='bold 12px monospace';
  ctx.fillText('F\u2081 = '+F.toFixed(3),320,H-46);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='7px monospace';
  ctx.fillText('normalized gold: "'+gold+'"   normalized prediction: "'+pred+'"',20,H-22);
  const cap=document.getElementById('grade-caption');
  if(cap){
    let t='EM = '+em+', F1 = '+F.toFixed(3)+'. ';
    if(em===0&&F>0.85&&gt.length!==pt.length) t+='The prediction is correct and slightly more specific than the gold answer, but exact match scores it zero. This is exact match&rsquo;s characteristic failure: no partial credit.';
    else if(em===1) t+='Both metrics agree. Normalization folded away the surface differences \u2014 case, punctuation and a leading article \u2014 before either metric saw the strings.';
    else if(F>0.8&&gt.length===pt.length&&gold!==pred) t+='Every gold token appears in the prediction, so token F1 is high, but the words have been rearranged into a statement that says something different. F1 compares bags of tokens and cannot see order, exactly as in Section 11.1.1. This is the case that shows F1 is not a measure of correctness.';
    else if(F<0.2) t+='The prediction shares almost nothing with the gold answer, and both metrics agree that it is wrong.';
    else t+='Partial overlap: exact match gives nothing while F1 awards credit proportional to the shared tokens.';
    cap.innerHTML=t;
  }
}

// ── 11.7 VIZ: ATLAS ────────────────────────────────────────
const ATLAS_NODES=[
  {lab:'question',        sub:'user information need', col:'#A18FFF', sec:'irintro', x:0, y:0, path:'both'},
  {lab:'sparse retrieval',sub:'tf-idf \u00b7 BM25',     col:'#4DE3FF', sec:'tfidf',   x:1, y:-1, path:'sparse'},
  {lab:'dense retrieval', sub:'encoders \u00b7 ANN',    col:'#A18FFF', sec:'dense',   x:1, y:1,  path:'dense'},
  {lab:'inverted index',  sub:'postings lists',        col:'#4DE3FF', sec:'invidx',  x:2, y:-1, path:'sparse'},
  {lab:'vector index',    sub:'approximate NN',        col:'#A18FFF', sec:'dense',   x:2, y:1,  path:'dense'},
  {lab:'ranked passages', sub:'scored \u00b7 evaluated',col:'#fde047', sec:'ireval',  x:3, y:0,  path:'both'},
  {lab:'prompt assembly', sub:'passages + question',   col:'#ff8c42', sec:'ragsec',  x:0, y:2.6, path:'both'},
  {lab:'generation',      sub:'decoding',    col:'#FF5F8E', sec:'ragsec',  x:1.4, y:2.6, path:'both'},
  {lab:'citation',        sub:'claim \u2192 passage',   col:'#3DDC84', sec:'ragsec',  x:2.7, y:2.6, path:'both'},
  {lab:'evaluation',      sub:'EM \u00b7 token F1',     col:'#4DE3FF', sec:'emf1',    x:4, y:2.6, path:'both'}
];
let _atlas={ path:'both', rects:[] };
function atlasBuild(){
  const cv=document.getElementById('atlas-canvas');
  if(cv) cv.onclick=e=>{
    const r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(cv.width/r.width), my=(e.clientY-r.top)*(cv.height/r.height);
    for(const [x,y,w,h,sec] of _atlas.rects){ if(mx>=x&&mx<=x+w&&my>=y&&my<=y+h){ openIRSec(sec); return; } }
  };
  atlasPath('both');
}
function atlasPath(p){
  _atlas.path=p;
  document.querySelectorAll('.atlas-p').forEach(b=>{ const on=b.dataset.p===p; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  atlasDraw();
}
function atlasDraw(){
  const cv=document.getElementById('atlas-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, P=_atlas.path;
  ctx.clearRect(0,0,W,H);
  _atlas.rects=[];
  const bw=112, bh=40;
  const X=x=>18+x*(bw+18), Y=y=>60+y*46;
  const act=n=>P==='both'||n.path==='both'||n.path===P;
  // edges
  const edges=[[0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[5,6],[6,7],[7,8],[8,9]];
  edges.forEach(([a,b])=>{
    const na=ATLAS_NODES[a], nb=ATLAS_NODES[b];
    const on=act(na)&&act(nb);
    ctx.strokeStyle=on?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.07)';
    ctx.lineWidth=on?1.4:1;
    const x1=X(na.x)+bw, y1=Y(na.y)+bh/2, x2=X(nb.x), y2=Y(nb.y)+bh/2;
    ctx.beginPath();
    if(b===6){ ctx.moveTo(X(na.x)+bw/2,Y(na.y)+bh); ctx.lineTo(X(na.x)+bw/2,Y(na.y)+bh+16); ctx.lineTo(X(nb.x)+bw/2,Y(nb.y)-10); ctx.lineTo(X(nb.x)+bw/2,Y(nb.y)); }
    else { ctx.moveTo(x1,y1); ctx.lineTo((x1+x2)/2,y1); ctx.lineTo((x1+x2)/2,y2); ctx.lineTo(x2,y2); }
    ctx.stroke();
  });
  ATLAS_NODES.forEach(n=>{
    const x=X(n.x), y=Y(n.y), on=act(n);
    _atlas.rects.push([x,y,bw,bh,n.sec]);
    ctx.fillStyle=on?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.015)';
    roundRect(ctx,x,y,bw,bh,7); ctx.fill();
    ctx.strokeStyle=on?n.col:'rgba(255,255,255,0.08)'; ctx.lineWidth=on?1.4:1;
    roundRect(ctx,x,y,bw,bh,7); ctx.stroke();
    ctx.fillStyle=on?n.col:'rgba(255,255,255,0.18)'; ctx.font='bold 8px monospace'; ctx.textAlign='center';
    ctx.fillText(n.lab,x+bw/2,y+17);
    ctx.fillStyle=on?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.12)'; ctx.font='7px monospace';
    ctx.fillText(n.sub,x+bw/2,y+30);
  });
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('retrieval',18,26);
  ctx.fillText('generation and evaluation',18,Y(2.6)-16);
  const cap=document.getElementById('atlas-caption');
  if(cap) cap.innerHTML=P==='sparse'
    ? 'The sparse path: term weighting with tf-idf or BM25, scored against an inverted index. Exact, interpretable, and unable to match a query to a document that uses different words.'
    : (P==='dense'
      ? 'The dense path: both sides encoded into a shared vector space and searched approximately. Handles vocabulary mismatch, at the cost of an approximate index and an encoder to train and run.'
      : 'Both paths produce ranked passages, and everything from there on is shared: assembly into the prompt, generation, citation, and evaluation. Click any stage to open its section.');
}
