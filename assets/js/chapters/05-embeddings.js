// ── EMBEDDINGS SECTION CARDS ───────────────────────────────
// ═══════════════════════════════════════════════════════════
// CHAPTER 5 · LEXICAL SEMANTICS & WORD EMBEDDINGS
// Rebuilt: 10 sections + 4 subsections, live instruments.
// Reuses the shared lr* helpers (lrCanvas, lrSig, LRC, lrFig,
// lrH3, lrTimer, lrStopAll, lrEl, lrSet, lrTxt, lrClamp, lrMix).
// ═══════════════════════════════════════════════════════════

const EMB_SEC = [
  {id:'lexsem',  num:'5.1', title:'What \u201cMeaning\u201d Even Means',  icon:'M', desc:'Lemmas and senses, synonymy, similarity vs. relatedness, and meaning as a point in affective space.', tags:['senses','similarity','valence']},
  {id:'vecintu', num:'5.2', title:'Meaning From Company',          icon:'C', desc:'The distributional hypothesis, deduced firsthand through the kvass mystery.',                      tags:['distributional','context','unknown words']},
  {id:'countemb',num:'5.3', title:'Word Counts Into Vectors',      icon:'#', desc:'Co-occurrence matrices, context windows, rows as vectors, and the curse of sparsity.',            tags:['co-occurrence','windows','sparsity']},
  {id:'cosine',  num:'5.4', title:'Similarity as an Angle',        icon:'\u03B8', desc:'Why raw dot product is a frequency trap, and how cosine fixes it by measuring direction.',      tags:['dot product','cosine','angle']},
  {id:'word2vec',num:'5.5', title:'Dense Vectors by Prediction',   icon:'W', desc:'Word2vec: sparse-and-long to dense-and-short, learned by a self-supervised prediction game.',      tags:['skip-gram','dense','self-supervised']},
  {id:'vizemb',  num:'5.6', title:'Seeing 300 Dimensions',         icon:'P', desc:'Nearest neighbors, hierarchical clustering, and t-SNE projection down to a readable map.',          tags:['t-SNE','clustering','projection']},
  {id:'sempr',   num:'5.7', title:'The Hidden Powers of Vectors',  icon:'A', desc:'Analogy arithmetic, the parallelogram model, its honest failure modes, and window-size effects.',   tags:['analogy','king-queen','offsets']},
  {id:'bias',    num:'5.8', title:'When Embeddings Absorb Bias',   icon:'B', desc:'How vectors inherit and amplify human bias, and why debiasing hides rather than removes it.',        tags:['bias','amplification','harm']},
  {id:'evalemb', num:'5.9', title:'Is an Embedding Any Good?',     icon:'E', desc:'Intrinsic vs. extrinsic evaluation, similarity datasets, and run-to-run instability.',              tags:['evaluation','correlation','variance']},
  {id:'embrecap',num:'5.10',title:'Recap',                 icon:'\u2211', desc:'The full pipeline from raw text to a queryable semantic space, as a navigable map.',            tags:['pipeline','recap']}
];

function buildEmbOverview(){
  const cards = EMB_SEC.map(s=>`
    <div class="sc-card" onclick="openEmbSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Meaning as Geometry</div>
    <h1 class="lesson-h1">Lexical Semantics &amp; Word Embeddings</h1>
    <p class="lesson-intro">One-hot word features do not capture similarity: <em>excellent</em> and <em>superb</em> are separate entries. Embeddings give words vectors whose geometry can reflect how they are used. We will start with a small space you can inspect, then learn vectors from context counts and prediction tasks.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">Meaning is not one thing. Synonymy, similarity, relatedness, connotation, and affect are distinct axes, and a good representation has to keep them apart.</div>
        <div class="ch-sum-item">The distributional hypothesis is the engine behind all of it: a word is defined by the company it keeps, so words in similar contexts get similar vectors.</div>
        <div class="ch-sum-item">Co-occurrence counts give a first, sparse, honest vector for every word. Weighting and prediction then compress that into something dense and useful.</div>
        <div class="ch-sum-item">Cosine similarity compares direction, not length, so it measures meaning without being fooled by how frequent a word is.</div>
        <div class="ch-sum-item">Word2vec learns short dense vectors by training a throwaway classifier on a self-supervised task, and never actually cares about the classifier\u2019s answers.</div>
        <div class="ch-sum-item">The resulting space encodes analogies as parallel offsets, tracks meaning change across centuries, and, unavoidably, absorbs the biases of the text it was trained on.</div>
      </div>
    </div>`;
}

const EMB_PAGES = {};

// dispatch: section id -> init function(s) that run after the page HTML mounts
const EMB_INIT = {
  lexsem:   () => { embSorterInit(); embCubeInit(); },
  vecintu:  () => { embMysteryInit(); },
  countemb: () => { embCoocInit(); },
  cosine:   () => { embCosInit(); },
  word2vec: () => { embMorphInit(); embClassifierInit(); embSkipgramInit(); embSubwordInit(); },
  vizemb:   () => { embProjectInit(); },
  sempr:    () => { embAnalogyInit(); embWindowInit(); embDriftInit(); },
  bias:     () => { embBiasInit(); },
  evalemb:  () => { embGradeInit(); embStabilityInit(); },
  embrecap: () => { embRecapInit(); }
};

function openEmbSec(id) {
  const pg = EMB_PAGES[id];
  if (!pg) return;
  if (window.lrStopAll) lrStopAll();
  if (window.embStopAll) embStopAll();
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if (!sv || !sb) return;
  const sec = EMB_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if (crumb && sec) crumb.innerHTML = 'Lexical Semantics <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  if (window.renderMath) renderMath(sb);
  mcSectionDelay(()=>{ if (EMB_INIT[id]) EMB_INIT[id](); }, 90);
  sv.onscroll = () => {
    const h = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if (bar) bar.style.width = (h>0?(sv.scrollTop/h)*100:0)+'%';
  };
}

// embeddings-local timer registry (independent of lr timers, both cleared on section change)
let EMB_TIMERS = [];
let EMB_RAFS = [];
function embTimer(fn, ms){ const t = setInterval(fn, ms); EMB_TIMERS.push(t); return t; }
function embRaf(fn){ const id = requestAnimationFrame(fn); EMB_RAFS.push(id); return id; }
function embStopAll(){ EMB_TIMERS.forEach(clearInterval); EMB_TIMERS = []; EMB_RAFS.forEach(cancelAnimationFrame); EMB_RAFS = []; }
(function(){ const _cs = window.closeSec; window.closeSec = function(){ if(window.embStopAll) embStopAll(); if(_cs) _cs.apply(this, arguments); }; })();

// small local helpers reused across emb viz
function embFig(label, bodyId, badge, fs){ return lrFig(label, bodyId, badge, fs); }
function embCos(a,b){ let d=0,na=0,nb=0; for(let i=0;i<a.length;i++){ d+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; } return d/(Math.sqrt(na)*Math.sqrt(nb)+1e-9); }

// ───────────────────────────────────────────────────────────
// 5.1  What "Meaning" Even Means
// ───────────────────────────────────────────────────────────
EMB_PAGES.lexsem = `
<div class="lesson-chapter-label">Section 5.1</div>
<h1 class="lesson-h1">What \u201cMeaning\u201d Even Means</h1>
<p class="lesson-intro">Words can be related in several ways: similar meaning, shared topic, opposition, or membership in a category. Distinguishing these relationships helps us decide what an embedding should capture.</p>

<h2 class="lesson-h2">Lemmas, Wordforms, and Senses</h2>
<p class="lesson-p">Start with the units. A <strong>wordform</strong> is a word as it literally appears: <em>sang</em>, <em>sings</em>, <em>singing</em> are three different wordforms. A <strong>lemma</strong> is the dictionary headword that groups them: all three share the lemma <em>sing</em>. When we build embeddings we usually work with wordforms, but the distinction matters because it is the first place meaning splits from spelling.</p>
<p class="lesson-p">The deeper split is the <strong>sense</strong>. A single lemma can carry several unrelated meanings. <em>Mouse</em> is a small rodent and also a pointing device; <em>bank</em> is the side of a river and also a financial institution. These are not shades of one idea but genuinely different concepts that share a spelling, a situation called <strong>polysemy</strong> (many senses) or, in the sharpest cases, <strong>homonymy</strong> (unrelated senses that collide on the same form). This creates a problem for what follows: a single vector per wordform has to average all of a word's senses into one point. The rodent and the device get combined, and <em>mouse</em> ends up in a compromise position close to neither cheese nor keyboards. Contextual models exist largely to solve this, but the static embeddings here cannot, and it is better to know the limitation now than to meet it unexpectedly once models become contextual.</p>

<h2 class="lesson-h2">Five Relationships That Are Not the Same</h2>
<p class="lesson-p">Now the relationships between words. People lump these together in casual speech, but they behave differently and a good semantic space has to keep them apart.</p>
<p class="lesson-p"><strong>Synonymy</strong> is near-identical meaning: <em>couch</em> and <em>sofa</em>, <em>vomit</em> and <em>throw up</em>. True perfect synonyms are almost nonexistent, because two words that meant exactly the same thing in every context would be a waste and one would usually drift or die. But propositional near-synonymy, where swapping one for the other rarely changes the truth of a sentence, is common and useful.</p>
<p class="lesson-p"><strong>Similarity</strong> is looser than synonymy and far more important for us. <em>Cat</em> and <em>dog</em> are not synonyms; you cannot swap them. But they are deeply similar: both are four-legged domestic pet mammals, and they share most of their features. Similarity is about words that play the same <em>kind</em> of role, and it is the relationship embeddings are best at capturing.</p>
<p class="lesson-p"><strong>Relatedness</strong>, or association, is different again, and it is the one most often confused with similarity. <em>Coffee</em> and <em>cup</em> are strongly related but not at all similar: one is a drink and one is a container. They are linked because they occur in the same kind of event, the same <strong>semantic field</strong>, not because they share features. Telling similar-but-not-related apart from related-but-not-similar is the main thing to take from this section, and the sorter below is built around that distinction.</p>
<p class="lesson-p"><strong>Antonymy</strong> is opposition: <em>hot</em>/<em>cold</em>, <em>up</em>/<em>down</em>, <em>fast</em>/<em>slow</em>. This one causes trouble later. Antonyms differ maximally along one dimension while being nearly identical in every other. <em>Hot</em> and <em>cold</em> are both about temperature, both gradable adjectives, and both apply to the same nouns, so they appear in almost identical contexts. A distributional model therefore tends to place antonyms <em>close together</em> rather than far apart. What makes them opposites is invisible to a method that only counts context, and this remains a well-known weakness.</p>
<p class="lesson-p">Finally, <strong>connotation</strong>: the affective flavor a word carries beyond its literal denotation. <em>Innocent</em>, <em>naive</em>, and <em>gullible</em> can describe the same person, but they feel warmer, then cooler, then hostile. Denotation is what a word points at; connotation is how it makes you feel about it.</p>

<h3 class="lr-h3"><span class="lr-h3-num">try it</span>Sort the pairs into the right bucket</h3>
<p class="lesson-p">Drag each word-pair into the relationship it belongs to. The one that catches almost everyone is <em>coffee / cup</em>. Resist the urge to call it similar; ask instead whether the two words share features or merely share a scene.</p>
${embFig('Interactive \u00b7 The meaning-has-many-flavors sorter', 'emb-sorter')}

<h2 class="lesson-h2">Osgood\u2019s Insight: Meaning as a Point in Space</h2>
<p class="lesson-p">In 1957, the psychologist Charles Osgood ran a large study asking people to rate words on scales like good&ndash;bad, strong&ndash;weak, and active&ndash;passive. The ratings collapsed onto three recurring dimensions that showed up again and again across words and cultures, and those three dimensions are the starting point for everything that follows.</p>
<p class="lesson-p"><strong>Valence</strong> is the pleasantness of the word, the good\u2013bad axis: <em>love</em> and <em>happy</em> sit high, <em>hatred</em> and <em>heartbreak</em> sit low. <strong>Arousal</strong> is the intensity of emotion it evokes, calm\u2013excited: <em>music</em> and <em>courageous</em> run hot, <em>nap</em> runs cool. <strong>Dominance</strong> is the degree of control the word implies, weak\u2013powerful: <em>courageous</em> and <em>leadership</em> feel dominant, <em>timid</em> and <em>cub</em> feel submissive.</p>
<p class="lesson-p">The step that matters is to stop treating these as three separate scores and start treating them as three <strong>coordinates</strong>. A word is then a single point in a three-dimensional affective space, and two words are affectively alike when their points are close. That is the whole idea behind embeddings, at small scale: meaning expressed as position, and similarity expressed as distance. The rest is the same idea scaled from three hand-chosen human dimensions up to three hundred dimensions that a machine finds on its own. Rotate the cube, then drag a new word in and see where it lands.</p>
${embFig('Interactive \u00b7 The 3D affective cube (Valence \u00d7 Arousal \u00d7 Dominance)', 'emb-cube', 'flagship', 1)}

<div class="lesson-note"><div class="lesson-note-label">The Through-Line</div>
<p>Hold onto the cube as you read on. Every later method, from raw co-occurrence counts to word2vec\u2019s learned vectors, is answering the same question Osgood answered by hand: what are the axes of meaning, and where does each word land on them? The only thing that changes is who chooses the axes and how many there are.</p></div>

<div class="quiz-block" id="qemb1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why are <em>coffee</em> and <em>cup</em> <strong>related</strong> but not <strong>similar</strong>?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qemb1','Correct. They co-occur in the same event or semantic field, but they share almost none of their own features \u2014 one is a beverage, the other a container.')">They share a scene, not their features</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb1','They are not interchangeable at all; you cannot swap coffee for cup in a sentence.')">They are interchangeable synonyms</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb1','They are not opposites; relatedness is not antonymy.')">They are antonyms</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb1','Both are perfectly common words; frequency is not the issue.')">One is far rarer than the other</button>
</div><div class="quiz-explain" id="qemb1-explain"></div></div>

<div class="quiz-block" id="qemb1b"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Distributional methods often place antonyms like <em>hot</em> and <em>cold</em> <strong>close</strong> together. Why?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qemb1b','Correct. Antonyms differ on one dimension but are identical on every other, so they appear in nearly the same contexts \u2014 and context is all a distributional method sees.')">They appear in nearly identical contexts</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb1b','They are not synonyms; they mean opposite things.')">They are secretly synonyms</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb1b','The method is not broken; this is a predictable consequence of using context.')">The algorithm has a bug</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb1b','Their frequencies are unrelated to why they land near each other.')">They have identical frequencies</button>
</div><div class="quiz-explain" id="qemb1b-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 5.2  Meaning From Company
// ───────────────────────────────────────────────────────────
EMB_PAGES.vecintu = `
<div class="lesson-chapter-label">Section 5.2</div>
<h1 class="lesson-h1">Meaning From Company: The Distributional Hypothesis</h1>
<p class="lesson-intro">Hand-rating every word on semantic scales does not scale well. The distributional hypothesis offers another route: use the contexts in which words appear as evidence about their meanings.</p>

<h2 class="lesson-h2">The Firth Slogan</h2>
<p class="lesson-p">The linguist J.R. Firth stated it in 1957 in a line that has been quoted ever since: <em>you shall know a word by the company it keeps</em>. The claim is that a word's meaning is not an essence hidden inside it but is determined by the distribution of contexts it appears in. Two words that keep the same company, that tend to be surrounded by the same neighbors, must mean similar things. If that holds, then the meaning of a word can be recovered by looking at the words around it.</p>
<p class="lesson-p">This is a strong claim, and a useful one. It says we can learn what words mean without anyone telling us, purely by noticing which words appear near which. No definitions, no supervision, no labels. It also converts the abstract goal of Section 5.1 into a concrete procedure: to place a word in space, count its contexts.</p>

<h2 class="lesson-h2">The Kvass Mystery</h2>
<p class="lesson-p">The clearest way to see the hypothesis at work is to use it yourself. Suppose you have never encountered the word <em>kvass</em> and no dictionary is available. All you have are a few sentences that contain it:</p>
<div class="lesson-math" style="font-family:var(--mono);font-size:.86rem;text-align:left;line-height:2">
\u2022 Kvass is brewed at home and poured cold.<br>
\u2022 A tall glass of kvass with dinner.<br>
\u2022 They sell kvass from barrels in summer.
</div>
<p class="lesson-p">You already know what it is, or close enough. Something brewed, poured cold, served by the glass alongside dinner, sold from barrels when the weather is warm. A drink. You did not deduce this from the word\u2019s spelling or sound; you deduced it from its company. And here is the mechanism made explicit: you know other words that keep exactly this company. <em>Cider</em> is brewed and poured cold. <em>Kombucha</em> comes by the glass. <em>Root beer</em> is sold from barrels in summer. Kvass shares the neighbors of the drinks, so kvass must be a drink. (It is: a lightly fermented Eastern European drink made from rye bread.)</p>
<p class="lesson-p">The exercise below puts you in that position. Highlight the context words in each sentence, watch those same words appear around the known drinks, and let the evidence accumulate before the answer is revealed. You are running the distributional hypothesis by hand, which is the same computation everything that follows automates.</p>
${embFig('Interactive \u00b7 The unknown-word detective game', 'emb-mystery', 'flagship', 1)}

<h2 class="lesson-h2">From Intuition to Algorithm</h2>
<p class="lesson-p">Notice what the exercise required. For each context word, you asked which known words also tend to appear near it. That is a comparison of context <em>profiles</em>. If we could write down, for every word, a tally of which other words appear in its neighborhood, then measuring similarity of meaning would reduce to measuring similarity of profiles, which is something arithmetic can do. That tally is a vector, and building it is the subject of Section 5.3. The distributional hypothesis says the approach is sound; a co-occurrence matrix is how you carry it out.</p>

<div class="lesson-note"><div class="lesson-note-label">Why This Was a Breakthrough</div>
<p>Earlier attempts to represent meaning relied on hand-built resources: dictionaries, thesauri, ontologies like WordNet, each requiring enormous expert labor and each frozen the moment it was published. The distributional hypothesis replaced all of that with raw text, of which the world produces an effectively infinite supply. Meaning became something you could <em>compute</em> rather than something you had to <em>curate</em>. That shift is why everything that follows, and arguably all of modern NLP, was possible.</p></div>

<div class="quiz-block" id="qemb2"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">The distributional hypothesis lets us learn word meaning without dictionaries because:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qemb2','Correct. Words that appear in the same contexts tend to mean similar things, so context profiles substitute for definitions.')">Similar contexts imply similar meanings</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb2','Spelling carries almost no reliable meaning; kvass could be anything by its letters alone.')">A word\u2019s spelling reveals its meaning</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb2','No human labels are needed; that is the entire point.')">Humans secretly label every word</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb2','Frequency alone tells you nothing about what a word means.')">Meaning equals raw frequency</button>
</div><div class="quiz-explain" id="qemb2-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 5.3  Word Counts Into Vectors
// ───────────────────────────────────────────────────────────
EMB_PAGES.countemb = `
<div class="lesson-chapter-label">Section 5.3</div>
<h1 class="lesson-h1">Turning Word Counts Into Vectors</h1>
<p class="lesson-intro">The distributional hypothesis tells us to represent a word by its company. This section makes that concrete: we build a table recording, for every word, how often each other word appears near it. Each row of that table is a vector, and those vectors are our first embeddings. They are crude, but every number in them is something we counted.</p>

<h2 class="lesson-h2">The Word-Word Co-occurrence Matrix</h2>
<p class="lesson-p">Lay out the vocabulary along both the rows and the columns of a big square table. The cell in row <em>w</em>, column <em>c</em> holds a single number: how many times context word <em>c</em> appeared near target word <em>w</em> across the whole corpus. That is a <strong>word-word co-occurrence matrix</strong>, and each row is the context profile the last section asked for, now written as a list of numbers.</p>
<p class="lesson-p">What does \u201cnear\u201d mean? That is set by the <strong>context window</strong>: a span of a few words on each side of the target. A window of \u00b12 counts the two words to the left and the two to the right; \u00b15 reaches further. The window size is not a minor knob, it changes the <em>kind</em> of meaning captured, and Section 5.7 will show that small windows learn syntactic, part-of-speech-like similarity while large windows learn topical, subject-matter similarity. For now, just watch how sliding the window changes which counts land in which cells.</p>
<p class="lesson-p">Run the builder below. Sweep the window across a short corpus about guitars, violins and routers, and watch tally marks drop into the matrix in real time. Every time <em>guitar</em> sits near <em>strings</em> or <em>tuned</em>, its row gains a point in that column. After a few sweeps, the row for <em>guitar</em> and the row for <em>violin</em> start to look alike, because instruments keep instrument-company, while the row for <em>router</em> looks completely different.</p>
${embFig('Interactive \u00b7 Live co-occurrence builder', 'emb-cooc', 'flagship', 1)}

<h2 class="lesson-h2">A Row Is a Point in Space</h2>
<p class="lesson-p">This is where position in space stops being an analogy. A row of counts is a list of numbers, and a list of numbers is the coordinates of a point. If the vocabulary had only three context words, each row would be a point in ordinary 3D space that we could look at directly. In the builder, switch to <strong>vector view</strong> and each row lifts out of the table as an arrow in a small 3D space. <em>Guitar</em> and <em>violin</em> land near each other because their counts are similar; <em>router</em> sits well away from both. Meaning has become position, as promised in 5.1, except the coordinates were counted from text rather than rated by hand.</p>

<h2 class="lesson-h2">The Catch: Sparsity</h2>
<p class="lesson-p">There is a serious problem with this representation. A real vocabulary is not three words, it is fifty thousand or more. So the matrix is not 3&times;3 but 50,000&times;50,000, which is two and a half billion cells. Almost all of them are zero, because any given word co-occurs with only a small handful of the other fifty thousand. The vector for <em>guitar</em> is fifty thousand numbers long, of which perhaps a few hundred are nonzero.</p>
<p class="lesson-p">These vectors are sparse: most entries are zero. Sparse data structures avoid storing and multiplying all those zeros, but the vectors can still have many dimensions and little shared context. The visualization shows that pattern. Dense embeddings offer a shorter learned representation.</p>

<div class="lesson-note"><div class="lesson-note-label">Raw Counts Are Not Quite Enough</div>
<p>Before we compress, real systems usually reweight the raw counts, because frequency is misleading: the word <em>the</em> co-occurs with everything, so a high count against <em>the</em> tells you almost nothing. Weightings like PPMI (positive pointwise mutual information) and TF-IDF downweight these ubiquitous words and highlight the informative ones, asking not \u201chow often do these co-occur?\u201d but \u201chow much more often than chance?\u201d. The dense methods in 5.5 learn this emphasis automatically, but it is the same instinct: not all company is equally telling.</p></div>

<div class="quiz-block" id="qemb3"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why are raw co-occurrence vectors called <strong>sparse</strong>, and why is that a problem?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qemb3','Correct. With a vocabulary of tens of thousands, almost every cell is zero, wasting memory and computation and understating real similarity.')">Almost all entries are zero, which wastes space and hides similarity</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb3','The vectors are extremely long, not short; that is part of the problem.')">The vectors are too short to hold meaning</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb3','The counts are integers, but that is not what sparsity means.')">The counts are whole numbers</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb3','Sparsity is about zeros, not about negative values; raw counts are never negative.')">They contain many negative numbers</button>
</div><div class="quiz-explain" id="qemb3-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 5.4  Similarity as an Angle (Cosine)
// ───────────────────────────────────────────────────────────
EMB_PAGES.cosine = `
<div class="lesson-chapter-label">Section 5.4</div>
<h1 class="lesson-h1">Measuring Similarity as an Angle</h1>
<p class="lesson-intro">We have a vector for each word, but still need a comparison rule. Raw distance is sensitive to vector length. Cosine similarity compares direction instead, which is often useful for word vectors.</p>

<h2 class="lesson-h2">The Dot Product, and Why It Cheats</h2>
<p class="lesson-p">The natural way to score how aligned two vectors are is the <strong>dot product</strong>: multiply them component by component and add up the results.</p>
<div class="lesson-math">\\[ \\mathbf{a}\\cdot\\mathbf{b} = \\sum_{i} a_i b_i \\]</div>
<p class="lesson-p">When two vectors point the same way and have large values in the same slots, their dot product is large, which is what we want. But the dot product also grows simply when the vectors are <strong>long</strong>, and a word's vector is long precisely when the word is <strong>frequent</strong>, since frequent words accumulate large co-occurrence counts. So the dot product systematically favors common words. A frequent, uninformative word can score higher against your target than a rarer word that is closer in meaning. The measure is contaminated by frequency, which is exactly what we do not want meaning to depend on.</p>

<h2 class="lesson-h2">Normalize Away the Length</h2>
<p class="lesson-p">The fix is to divide out the lengths, leaving only the part of the dot product that is about <em>direction</em>. Divide the dot product by the magnitude of each vector, and what remains is the cosine of the angle between them:</p>
<div class="lesson-math">\\[ \\cos(\\theta) = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\lVert \\mathbf{a}\\rVert\\,\\lVert \\mathbf{b}\\rVert} \\]</div>
<p class="lesson-p">This is <strong>cosine similarity</strong>, and its point is that it ignores length and depends only on angle. Two vectors pointing in the same direction score 1, no matter how long or short either one is. Vectors at right angles, sharing no context, score 0. (For raw counts, which are never negative, cosine ranges from 0 to 1; once vectors can have negative components, it ranges from &minus;1 to 1, with &minus;1 meaning opposite directions.) A frequent word and a rare word that keep the same company now score as highly similar, because they point the same way even though one arrow is much longer. Frequency has been divided out, and only direction remains.</p>

<h3 class="lr-h3"><span class="lr-h3-num">try it</span>The angle-versus-length tug-of-war</h3>
<p class="lesson-p">Drag the two word-vectors below and compare the raw dot product against the cosine. Then run the decisive test: use the length slider to stretch one vector <em>without rotating it</em>. The dot product grows, implying the words became more similar, which cannot be right, since neither moved relative to the other. The cosine does not change, because the angle did not. That is the difference between the two measures in a single adjustment.</p>
${embFig('Interactive \u00b7 Angle vs. length', 'emb-cos', 'flagship', 1)}

<h2 class="lesson-h2">Reading the Numbers Off the Picture</h2>
<p class="lesson-p">Load the <strong>guitar vs. router</strong> preset. The vectors have a dot product of <strong>2.14</strong>, but their directions differ: the cosine is about <strong>0.26</strong>, or an angle of <strong>75°</strong>. Drag one vector and compare the dot product with the cosine. Scaling a vector changes the dot product; changing its direction changes the cosine.</p>

<div class="lesson-note"><div class="lesson-note-label">Why Cosine, Everywhere</div>
<p>Cosine similarity is widely used to compare word, sentence, and document embeddings. Standard scaled dot-product attention uses dot products instead, without dividing by the query and key norms. Keeping that distinction in mind will help when we reach attention.</p></div>

<div class="quiz-block" id="qemb4"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">You stretch a vector to twice its length without rotating it. What happens?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qemb4','Correct. The dot product with another vector doubles, but cosine is unchanged because the angle is unchanged \u2014 exactly why cosine resists the frequency trap.')">Dot product grows; cosine stays the same</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb4','Cosine ignores length, so it does not change when you only rescale.')">Both grow together</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb4','The dot product depends on length, so it does change.')">Both stay exactly the same</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb4','Cosine does not shrink here; the angle is untouched, so cosine is constant.')">Cosine shrinks toward zero</button>
</div><div class="quiz-explain" id="qemb4-explain"></div></div>`;


// ───────────────────────────────────────────────────────────
// 5.5  Dense Vectors by Prediction (word2vec) + subsections
// ───────────────────────────────────────────────────────────
EMB_PAGES.word2vec = `
<div class="lesson-chapter-label">Section 5.5</div>
<h1 class="lesson-h1">Learning Dense Vectors by Prediction</h1>
<p class="lesson-intro">Word2vec learns short, dense vectors through a prediction task. In skip-gram, a word helps predict nearby words. The learned vectors can then be used for similarity and other tasks.</p>

<h2 class="lesson-h2">Sparse-and-Long to Dense-and-Short</h2>
<p class="lesson-p">A count vector has one dimension per context word, so it is as long as the vocabulary, tens of thousands of slots, almost all zero. A word2vec vector is different in every respect. It has a fixed, small length chosen in advance, typically 100 to 300 dimensions. Every slot holds a real number, positive or negative, and none of them are zero. And no single dimension corresponds to a nameable context word; the meaning is smeared across all of them at once. These are <strong>dense embeddings</strong>, and empirically they work better than sparse count vectors on nearly every task, while taking a fraction of the space.</p>
<p class="lesson-p">Why would compressing 50,000 numbers down to 300 <em>improve</em> anything rather than lose information? Because the compression is not arbitrary. It is forced to preserve exactly the structure that predicts context. Slots that always moved together in the count matrix get merged into a single dimension, and variation that predicted nothing gets discarded. What survives are the dimensions that carry meaning. The animation below shows a 50,000-slot sparse vector, mostly empty, collapsing into a 300-slot dense one.</p>
${embFig('Interactive \u00b7 Sparse-to-dense morph', 'emb-morph')}

<h2 class="lesson-h2">The Core Idea</h2>
<p class="lesson-p">The method in one sentence: train a classifier on an artificial yes/no question, then discard the classifier and keep the weights it learned. The question is, for a target word and a nearby word, "was this pair actually adjacent in real text, or did I make it up?" To answer well, the model has to give each word a vector such that words appearing together have aligned vectors. Those vectors are the embeddings. The classifier's answers are of no interest; only its internal representation matters. The subsections below build this up piece by piece.</p>

${lrH3('5.5.1', 'The Trick: A Yes/No Classifier in Disguise')}
<p class="lesson-p">The property that makes this work is <strong>self-supervision</strong>. Classifiers need labeled examples, and nobody labeled our text, so word2vec manufactures the labels from the text itself. Take a target word, say <em>violin</em>. The words that actually appeared near it in the corpus, <em>bow</em>, <em>rosin</em>, <em>concerto</em>, become <strong>positive examples</strong>, labeled "yes, real neighbor." Then draw a few random words from the vocabulary, <em>latency</em>, <em>monsoon</em>, <em>ledger</em>, that did not appear nearby. These become <strong>negative examples</strong>, labeled "no, not a neighbor." This is <strong>negative sampling</strong>, and the labels cost nothing, because the corpus itself determined them.</p>
<p class="lesson-p">The classifier's job is to tell real neighbors from fake ones, and its scoring pipeline is the one from logistic regression. Take the target's vector and a candidate's vector, compute their <strong>dot product</strong> to measure alignment, push that through the <strong>sigmoid</strong> to get a number between 0 and 1, and read it as the probability that this is a real neighbor. Similarity becomes dot product becomes sigmoid becomes probability: the same four-step machine as logistic regression, used here to position words. Play a few rounds below with <em>violin</em> fixed, judging each candidate, and follow the dot product through the sigmoid into a probability bar.</p>
${embFig('Interactive \u00b7 Is this a real neighbor?', 'emb-classifier')}

${lrH3('5.5.2', 'Watching Embeddings Slide Into Place', 'flagship')}
<p class="lesson-p">Training turns that classifier into a procedure that moves the vectors. Every word starts at a random position. For each real (target, neighbor) pair, the model moves the two vectors <em>closer</em>, because it wants their dot product, and therefore the predicted probability, to be high. For each fake (target, random) pair, it pushes the two vectors <em>apart</em>, because it wants that probability low. That is the entire dynamic: <strong>pull real neighbors together, push random words apart</strong>, repeated billions of times.</p>
<p class="lesson-p">Run the training loop below. On each step a target such as <em>violin</em> is pulled toward <em>bow</em> by a positive-example arrow while being pushed away from <em>monsoon</em> and <em>latency</em> by negative-example arrows. Over many steps the instruments gather into one cluster, the network words into another, the drinks into a third, and the weather words into a fourth, without anyone defining what an instrument or a drink is. Three sliders control the process: the <strong>window size</strong> \\(( \\pm L)\\) sets how far "nearby" extends, the <strong>negative-sample count</strong> \\((k)\\) sets how many random words each real pair is contrasted against, and the <strong>learning rate</strong> \\((\\eta)\\) controls how far each step moves the vectors.</p>
<p class="lesson-p">One implementation detail worth exposing: word2vec actually keeps <strong>two</strong> vectors per word, a <em>target</em> vector used when the word is the thing being predicted-from, and a <em>context</em> vector used when it is the neighbor. Toggling the two-matrices view shows both copies. In practice we add or average them at the end to get each word\u2019s final embedding; the split just makes the math cleaner during training.</p>
${embFig('Interactive \u00b7 Skip-gram training in a live embedding space', 'emb-skipgram', 'flagship', 1)}

${lrH3('5.5.3', 'Handling Unknown Words: fastText & GloVe')}
<p class="lesson-p">Plain word2vec has one clear weakness: it only knows words it saw during training. Given a typo, a rare inflection, or a word coined last month, it has no vector at all, which is an <strong>out-of-vocabulary</strong> failure. <strong>fastText</strong> addresses this by representing a word not as a single unit but as a bag of its <strong>character n-grams</strong>, the overlapping chunks of letters inside it. The word <em>quiet</em> becomes the pieces <em>&lt;qu, qui, uie, iet, et&gt;</em> plus the whole word, each with its own small vector, and the word's embedding is their sum.</p>
<p class="lesson-p">Because the pieces are shared across words, meaning now attaches to them rather than only to whole words. A word the model has never seen, such as <em>unfriendliness</em>, still breaks into familiar chunks, <em>un</em>, <em>friend</em>, <em>li</em>, <em>ness</em>, each of which appeared thousands of times inside other words, so a reasonable vector can be assembled from parts the model already has. Morphology, the internal structure of words, becomes something the model can use without being told about it. Type any word, including an invented one, into the subword builder below and watch it break into n-grams that sum to an embedding. <strong>GloVe</strong> reaches vectors of similar quality from the other direction, by factoring the global co-occurrence matrix directly rather than sampling local windows, which suggests the count-based and prediction-based routes end up in much the same place.</p>
${embFig('Interactive \u00b7 The subword Lego builder', 'emb-subword')}

<div class="lesson-note"><div class="lesson-note-label">The Deep Punchline</div>
<p>Word2vec is a bait-and-switch. We pretend to care about a trivial question, real neighbor or not, and train a classifier to answer it. But we never use the answers. The entire value is in the vectors the classifier grew in order to answer well. This pattern, invent a self-supervised task whose solution requires understanding, then keep the understanding and discard the task, is the same pattern that, scaled up enormously, trains every large language model in this course. Word2vec is where you meet it first.</p></div>

<div class="quiz-block" id="qemb5"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In word2vec, what do we ultimately keep after training?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qemb5','Correct. The classifier and its predictions are thrown away; the learned word vectors are the whole prize.')">The learned word vectors, not the classifier</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb5','The predictions are worthless once training ends; only the vectors matter.')">The classifier\u2019s neighbor predictions</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb5','No human labels were ever used; the task is self-supervised.')">The human-annotated labels</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb5','The sparse count matrix is exactly what we were trying to replace.')">The sparse co-occurrence matrix</button>
</div><div class="quiz-explain" id="qemb5-explain"></div></div>

<div class="quiz-block" id="qemb5b"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">How does fastText produce a vector for a word it never saw in training?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qemb5b','Correct. It sums the vectors of the word\u2019s character n-grams, which are shared across words and were seen many times.')">By summing the vectors of its character n-grams</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb5b','It does not fall back to a dictionary; it uses subword pieces.')">By looking the word up in a dictionary</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb5b','It does not return zero; that would be the vanilla word2vec failure it fixes.')">By returning the zero vector</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb5b','It does not guess randomly; the subwords give a principled vector.')">By assigning a random vector</button>
</div><div class="quiz-explain" id="qemb5b-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 5.6  Seeing 300 Dimensions
// ───────────────────────────────────────────────────────────
EMB_PAGES.vizemb = `
<div class="lesson-chapter-label">Section 5.6</div>
<h1 class="lesson-h1">Seeing 300 Dimensions on a Flat Screen</h1>
<p class="lesson-intro">Word vectors often have hundreds of dimensions. Projection methods let us inspect them in two or three, but each method preserves some relationships and distorts others. Compare what the views reveal.</p>

<h2 class="lesson-h2">Lens One: Nearest Neighbors</h2>
<p class="lesson-p">The simplest way to examine an embedding space is to pick a word and ask for its <strong>nearest neighbors</strong>, the words with the highest cosine similarity to it. There is no projection and no distortion, just a ranked list read directly out of the full-dimensional space. Ask for the neighbors of <em>sweet</em> and you get <em>honey</em>, <em>candy</em>, <em>juice</em>, <em>sugary</em>. This is the reference the prettier visualizations should be checked against, since it reports real distances, though it only shows a small part of the space at a time.</p>

<h2 class="lesson-h2">Lens Two: Hierarchical Clustering</h2>
<p class="lesson-p">To see structure rather than one word\u2019s neighborhood, we can group the whole vocabulary by repeatedly merging the closest pairs, then the closest groups, building a tree called a <strong>dendrogram</strong>. Words fuse into small tight clusters, which fuse into larger looser ones, which finally join at the root. Run this on a mixed vocabulary and the tree recovers categories nobody labeled: body parts branch together, animals form their own limb, places gather separately. The height at which two words finally join measures how distant they are, so the tree encodes similarity in its shape.</p>

<h2 class="lesson-h2">Lens Three: t-SNE Projection</h2>
<p class="lesson-p">The familiar word-map pictures come from <strong>t-SNE</strong>, an algorithm that compresses a high-dimensional space down to two dimensions while trying to keep neighbors as neighbors. It is nonlinear, and it prioritizes <em>local</em> structure, meaning which pairs of points are close, at the cost of distorting large-scale distances. That is why t-SNE plots show such clean separated clusters, and it is also why the spacing between clusters should not be read too literally. The projector below takes a high-dimensional word, shown first as a bar-code of a hundred values, and flattens it into the 2D map, reproducing the neighborhood of sweet, honey, candy, and juice. Toggle between all three views on the same words to confirm that the neighbor list, the dendrogram, and the scatter describe one underlying space.</p>
${embFig('Interactive \u00b7 Squash the hypercube: three lenses on one space', 'emb-project')}

<div class="lesson-note"><div class="lesson-note-label">Read t-SNE With Caution</div>
<p>t-SNE is seductive and slightly dishonest, and every practitioner should know how. Because it sacrifices global structure to preserve local structure, the <em>distances between clusters</em> in a t-SNE plot are largely meaningless, two clusters drawn far apart may be no more different than two drawn close. Cluster <em>sizes</em> are meaningless too, since the algorithm expands dense regions and contracts sparse ones. And the same data, run twice with different settings, can produce very different-looking maps. Use t-SNE to spot which words group together, never to measure how far apart the groups are. When you need real distances, go back to Lens One.</p></div>

<div class="quiz-block" id="qemb6"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In a t-SNE plot, which of these can you trust?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qemb6','Correct. t-SNE preserves local neighborhoods well, so which points cluster together is meaningful. Distances between clusters and cluster sizes are not.')">Which words fall into the same cluster</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb6','Between-cluster distances are exactly what t-SNE distorts.')">The exact distance between two clusters</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb6','Cluster sizes are distorted by the algorithm and carry no real meaning.')">The relative sizes of clusters</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb6','Re-running with different settings can reshape the whole map, so absolute positions are not stable.')">The absolute coordinates of each word</button>
</div><div class="quiz-explain" id="qemb6-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 5.7  The Hidden Powers of Vectors + 5.7.1 drift
// ───────────────────────────────────────────────────────────
EMB_PAGES.sempr = `
<div class="lesson-chapter-label">Section 5.7</div>
<h1 class="lesson-h1">The Hidden Powers of Embeddings</h1>
<p class="lesson-intro">Some relationships appear as directions in a learned embedding space. Vector arithmetic can recover useful analogies, though its success depends on the words, relation, and training data.</p>

<h2 class="lesson-h2">Analogies as Vector Arithmetic</h2>
<p class="lesson-p">Consider the relationship between a man and a woman, or a king and a queen. In a well-trained embedding space, the vector that takes you from <em>man</em> to <em>woman</em> is close to the vector that takes you from <em>king</em> to <em>queen</em>: same direction, similar length. The relationship has become a fixed offset that can be added to other words. This is the <strong>parallelogram model</strong>, and it produces the best-known equation in the field:</p>
<div class="lesson-math">\\[ \\text{king} - \\text{man} + \\text{woman} \\approx \\text{queen} \\]</div>
<p class="lesson-p">Read it as a sequence of moves. Start at <em>king</em>. Subtract <em>man</em> to remove the male component, leaving something closer to royalty in general. Add <em>woman</em> to reintroduce gender, now female. The result lands near <em>queen</em>. The model learned royal gender as a direction in space without ever being told what gender or royalty are. Do the arithmetic yourself in the tool below by dragging the vectors, and the resulting point settles beside <em>queen</em>. Then use the free-form box to pose your own analogies: it computes <em>a &minus; b + c</em>, so <em>Rome &minus; Paris + France</em> asks &ldquo;Paris is to France as Rome is to what?&rdquo; and lands on <em>Italy</em>. The parallelogram is drawn along with the nearest word.</p>
${embFig('Interactive \u00b7 The king \u2212 man + woman = queen machine', 'emb-analogy', 'flagship', 1)}

<h2 class="lesson-h2">The Honest Part: Where It Breaks</h2>
<p class="lesson-p">The failures matter as much as the successes. The parallelogram model is real but fragile, and knowing where it breaks is part of understanding it. It works best on frequent words and a handful of well-attested relations such as capital-of and gender. On rarer relationships it often returns a <strong>morphological variant</strong> instead of the intended answer &mdash; asked for the past tense of <em>walk</em>, it lands on <em>walks</em> &mdash; because inflected forms sit very close together in the space. It also has a built-in quirk: the standard method explicitly excludes the input words from the answer, so the analogy can never return one of the words you started with, even when that would be correct. And for genuinely obscure relations it simply misses, landing near a word that shares surface context rather than the intended relationship. Toggle the honesty switch in the tool to see curated cases where the parallelogram fails.</p>

<h2 class="lesson-h2">Window Size Shapes What \u201cSimilar\u201d Means</h2>
<p class="lesson-p">Recall the promise from Section 5.3. The context window does not just tune quality, it changes the kind of similarity learned. With a <strong>small window</strong> of about \u00b12, a word\u2019s company is its immediate grammatical neighbors, so the model learns <strong>syntactic</strong> similarity, grouping words that play the same part-of-speech role. The nearest neighbors of <em>Everest</em> become <em>Denali</em> and <em>Kilimanjaro</em>, other proper nouns that fill the same slot. With a <strong>large window</strong> of about \u00b15 or more, company means \u201cappears anywhere in the same passage,\u201d so the model learns <strong>topical</strong> similarity, grouping words about the same subject. Now the neighbors of <em>Everest</em> become <em>sherpa</em> and <em>base-camp</em>, words from the same story rather than things of the same kind. Slide the window control below and watch the neighbor list flip between these two flavors of \u201csimilar.\u201d</p>
${embFig('Interactive \u00b7 Window size: syntactic vs. topical neighbors', 'emb-window')}

${lrH3('5.7.1', 'Watching Words Change Meaning Over Time')}
<p class="lesson-p">If you train separate embeddings on text from different eras, you can watch words <em>move</em> through meaning-space across history, because the company a word keeps changes as the culture does. This is <strong>diachronic</strong> or historical semantics, and it turns the abstract idea of \u201cmeaning change\u201d into literal motion you can trace.</p>
<p class="lesson-p">Three well-documented cases show the effect. <em>Gay</em> moved over the twentieth century from a neighborhood of <em>cheerful</em> and <em>merry</em> toward one about sexual orientation. <em>Broadcast</em> began near <em>sow</em> and <em>seeds</em>, an agricultural term for scattering, and moved to <em>television</em> and <em>radio</em> as technology repurposed it. <em>Awful</em> underwent <strong>pejoration</strong>, shifting from "full of awe, awe-inspiring" toward simply "terrible." Drag the decade slider below from 1850 to 2000 and follow each word's path across the space, with trails marking the route it took.</p>
${embFig('Interactive \u00b7 Semantic drift across 150 years', 'emb-drift')}

<div class="quiz-block" id="qemb7"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why do analogies work as vector arithmetic like king \u2212 man + woman \u2248 queen?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qemb7','Correct. A relationship becomes a consistent direction (offset) in the space, so adding it moves any word along that relationship.')">Relationships become consistent offset directions</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb7','No one hard-coded gender or royalty; the structure emerged from training.')">Someone hand-coded the gender dimension</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb7','It is not exact and not universal; it fails on rare relations and returns morphological variants.')">It works perfectly for every word pair</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb7','Spelling similarity is not what drives the arithmetic.')">The words are spelled similarly</button>
</div><div class="quiz-explain" id="qemb7-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 5.8  Bias in Embeddings
// ───────────────────────────────────────────────────────────
EMB_PAGES.bias = `
<div class="lesson-chapter-label">Section 5.8</div>
<h1 class="lesson-h1">When Embeddings Absorb Our Biases</h1>
<p class="lesson-intro">Embeddings can reflect social stereotypes in their training text. We will look at how these associations are measured, how they can affect downstream systems, and why removing them is difficult.</p>

<h2 class="lesson-h2">The Same Trick That Gave Us Analogies Gives Us Stereotypes</h2>
<p class="lesson-p">The parallelogram model that produced <em>king \u2212 man + woman \u2248 queen</em> can be pointed at social relationships too, and when researchers did, the results were troubling. Bolukbasi and colleagues showed in 2016 that embeddings trained on ordinary news text completed <em>man : computer_programmer :: woman : ?</em> with <em>homemaker</em>, and produced a long list of similarly stereotyped associations. The vectors had learned, from the statistics of who-appears-near-what, the occupational gender stereotypes woven through the training corpus. The mechanism that captures real relationships cannot help but capture prejudicial ones, because to the algorithm they look identical: both are just consistent patterns of company.</p>

<h2 class="lesson-h2">Amplification: Worse Than the World</h2>
<p class="lesson-p">The problem is not only that embeddings mirror society, but that they can <strong>amplify</strong> it. If a corpus reflects a profession that is, say, 70% one gender, the embedding often encodes an association <em>stronger</em> than 70%, because training sharpens frequent patterns into confident directions. The bias in the vectors can exceed the bias in the data, which in turn exceeds the bias most people would endorse. The panel below makes this measurable by placing a documented stereotyped association next to the real-world labor statistic, so the amplification appears as a gap between two bars.</p>
${embFig('Interactive \u00b7 A bias-audit panel', 'emb-bias')}

<h2 class="lesson-h2">Two Kinds of Harm</h2>
<p class="lesson-p">It helps to name what can go wrong, using the same vocabulary as logistic regression. <strong>Representational harm</strong> is when a system demeans or stereotypes a group, as when an embedding ties <em>woman</em> to <em>homemaker</em> and thereby entrenches a diminished image. <strong>Allocational harm</strong> is when a system unfairly distributes real resources, as when a r\u00e9sum\u00e9-screening tool built on such embeddings quietly downranks qualified candidates whose names or words associate, in the vectors, with the \u201cwrong\u201d group. Because embeddings sit underneath so many downstream systems, a bias absorbed here silently propagates into hiring, lending, search, and translation.</p>

<h2 class="lesson-h2">Debiasing Hides, It Does Not Cure</h2>
<p class="lesson-p">A natural hope is to simply subtract the bias, and methods exist that identify a \u201cgender direction\u201d and project it out of occupation words. They help on the specific metric they target. But Gonen and Goldberg showed in 2019 that this is largely cosmetic: after debiasing, stereotyped words still cluster together, and a classifier can still recover the group structure with high accuracy. The bias was not removed, it was pushed into a form the simple metric no longer detects. Toggle the before/after control below to see the headline number drop while the underlying clustering persists. The honest takeaway is that this is not a solved problem, and treating a debiasing step as a cure is itself a risk.</p>

<div class="lesson-note"><div class="lesson-note-label">Why This Is Structural, Not a Bug</div>
<p>You cannot patch this away at the level of the algorithm, because the algorithm is doing exactly what it was designed to do: faithfully encode the statistics of the text. The bias lives in the text, which is a record of a biased world. That means mitigation has to happen at every level at once, in the choice of training data, in the design of downstream systems, in evaluation, and in the decision of whether to deploy at all, rather than in a single subtraction. Embeddings did not invent these biases; they made them measurable, portable, and easy to deploy at scale, which is precisely why they demand care.</p></div>

<div class="quiz-block" id="qemb8"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What did Gonen and Goldberg (2019) show about debiasing methods?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qemb8','Correct. Debiasing reduced the targeted metric but left the stereotype structure intact and recoverable \u2014 it hid the bias rather than removing it.')">They hide bias on one metric while it remains recoverable</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb8','They did not find a complete cure; that is the whole point.')">They completely remove all bias</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb8','Bias comes from the training text, not from a coding error.')">Bias is just a software bug</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb8','Embeddings can amplify bias beyond the data, not only reflect it.')">Embeddings always understate real bias</button>
</div><div class="quiz-explain" id="qemb8-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 5.9  Evaluation
// ───────────────────────────────────────────────────────────
EMB_PAGES.evalemb = `
<div class="lesson-chapter-label">Section 5.9</div>
<h1 class="lesson-h1">How Do We Know an Embedding Is Any Good?</h1>
<p class="lesson-intro">A convincing plot is only a first check. To compare embeddings, we need evaluation tasks and a way to estimate how much the scores vary across samples or training runs.</p>

<h2 class="lesson-h2">Extrinsic vs. Intrinsic Evaluation</h2>
<p class="lesson-p">There are two philosophies. <strong>Extrinsic evaluation</strong> is the gold standard: plug the embeddings into a real downstream task, sentiment analysis, question answering, translation, and measure whether they make that task\u2019s numbers go up. This is what ultimately matters, since embeddings are a means, not an end. Its drawback is cost and entanglement: a full downstream pipeline is slow to run, and when the score changes you cannot always tell whether the embeddings or some other component was responsible.</p>
<p class="lesson-p"><strong>Intrinsic evaluation</strong> tests the vectors directly against human judgments of meaning, no downstream task involved. It is fast, clean, and isolating, and its risk is that a model can look good on the intrinsic proxy yet fail to help the real task. The two are complementary: intrinsic tests for quick iteration, extrinsic tests for the final verdict.</p>

<h2 class="lesson-h2">Similarity Datasets and Correlation</h2>
<p class="lesson-p">The most common intrinsic test uses a <strong>similarity dataset</strong>: a list of word pairs that humans have rated for similarity, such as <em>cup</em>/<em>mug</em> rated very high, <em>cup</em>/<em>coffee</em> moderate, <em>cup</em>/<em>car</em> very low. We ask the embedding for the cosine similarity of each pair, then measure how well the model\u2019s rankings agree with the humans\u2019, usually with a rank correlation. A high correlation means the geometry of the space agrees with human judgements about meaning. Play annotator below: rate a few pairs yourself, then watch your ratings plotted against the model\u2019s cosines with the correlation computed live. That number is exactly what an intrinsic similarity benchmark reports.</p>
${embFig('Interactive \u00b7 Grade the model: human ratings vs. cosine', 'emb-grade')}

<h2 class="lesson-h2">The Instability Nobody Mentions</h2>
<p class="lesson-p">One fact about word2vec is easy to miss and matters for careful work: it is <strong>stochastic</strong>. It starts from random initial vectors and trains on randomly sampled negatives, so training twice on the identical corpus produces two <em>different</em> embedding spaces. Overall quality is similar, but the details move: a word's exact nearest-neighbor list can change between runs, especially for rarer words. Press <strong>retrain</strong> in the panel below a few times and watch the neighbor list shuffle. This is why careful practice does not trust a single model. You train several with different random seeds and average the results, or report the variance, so the conclusion reflects the method rather than one initialization. A difference between two embedding methods only means something if it is larger than this run-to-run noise, which is the same bootstrap logic from logistic regression applied to models instead of test sets.</p>
${embFig('Interactive \u00b7 Run-to-run instability', 'emb-stability')}

<div class="lesson-note"><div class="lesson-note-label">Evaluate for Your Task</div>
<p>No embedding is best in the abstract. A small window gives vectors that shine on syntactic tasks and stumble on topical ones; a large window does the reverse. High similarity-benchmark scores do not guarantee downstream gains. The only fully trustworthy evaluation is the one that measures the thing you actually care about, on the task you will actually deploy, averaged over enough runs to see past the noise. Everything else is a fast, useful, and fallible proxy.</p></div>

<div class="quiz-block" id="qemb9"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why should you train several embedding models with different random seeds?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qemb9','Correct. Training is stochastic, so any single run\u2019s details are partly luck; averaging over runs separates the method from the noise.')">Training is random, so one run\u2019s details are partly luck</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb9','More seeds does not fix bias in the training text.')">It removes bias from the corpus</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb9','The vocabulary is the same across runs; that is not the reason.')">It enlarges the vocabulary</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb9','Averaging models is about stability, not about making them sparse.')">It makes the vectors sparse again</button>
</div><div class="quiz-explain" id="qemb9-explain"></div></div>`;

// ───────────────────────────────────────────────────────────
// 5.10  Recap
// ───────────────────────────────────────────────────────────
EMB_PAGES.embrecap = `
<div class="lesson-chapter-label">Section 5.10</div>
<h1 class="lesson-h1">The Whole Pipeline, End to End</h1>
<p class="lesson-intro">Follow the pipeline from text to word vectors. Select a stage to revisit its explanation or experiment.</p>

<h2 class="lesson-h2">From Text to a Space of Meaning</h2>
<p class="lesson-p">Follow the whole sequence. <strong>Raw text</strong> enters. We count which words appear near which to build a <strong>co-occurrence matrix</strong> (5.3), whose rows are accurate but <strong>sparse</strong> vectors. We could compare those directly with <strong>cosine similarity</strong> (5.4), but in practice we compress them first: the <strong>skip-gram prediction task</strong> (5.5) trains throwaway classifiers whose learned weights become short, <strong>dense embeddings</strong>. From there the space is usable. We <strong>project</strong> it to 2D to inspect it (5.6), do <strong>analogy arithmetic</strong> and trace <strong>semantic drift</strong> through it (5.7), <strong>audit it for bias</strong> (5.8), and <strong>evaluate</strong> it against human judgment (5.9). Click any node in the map below to jump back to its section.</p>
${embFig('Interactive \u00b7 The grand unified embedding pipeline', 'emb-recap')}

<div class="lesson-note"><div class="lesson-note-label">Where This Goes Next</div>
<p>Static embeddings have one unfixable flaw, met back in 5.1: one vector per word, so every sense of <em>bank</em> or <em>mouse</em> is averaged into a single blurred point. The next leap is to let a word\u2019s vector depend on the sentence it sits in, so <em>bank</em> by a river and <em>bank</em> with your money get different vectors. That is <strong>contextual embeddings</strong>, and producing them is the job of neural networks and transformers. Everything here, the vectors, the cosine, the prediction-as-training trick, carries straight through. You have built the atom; the rest of the book is what it assembles into.</p></div>

<div class="quiz-block" id="qemb10"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What is the one flaw of static embeddings that contextual models exist to fix?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qemb10','Correct. A single vector per word averages all of its senses together, so polysemous words like bank get one blurred representation.')">One vector per word blurs all its senses together</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb10','Dense vectors are the goal, not the flaw.')">The vectors are too dense</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb10','Cosine works fine; it is not the limitation.')">Cosine similarity stops working</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qemb10','The distributional hypothesis still holds; contextual models extend it, not discard it.')">The distributional hypothesis is abandoned</button>
</div><div class="quiz-explain" id="qemb10-explain"></div></div>`;


// ═══════════════════════════════════════════════════════════
// CHAPTER 5 · INSTRUMENTS  (part 1: 5.1–5.4)
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// 5.1 — Meaning sorter (drag pairs into relationship buckets)
// ───────────────────────────────────────────────────────────
const SORT_PAIRS = [
  { id:'p1', a:'couch', b:'sofa',    ans:'synonym'  },
  { id:'p2', a:'cat',   b:'dog',     ans:'similar'  },
  { id:'p3', a:'coffee',b:'cup',     ans:'related'  },
  { id:'p4', a:'hot',   b:'cold',    ans:'antonym'  },
  { id:'p5', a:'car',   b:'automobile', ans:'synonym' },
  { id:'p6', a:'coffee',b:'tea',     ans:'similar'  },
  { id:'p7', a:'doctor',b:'hospital',ans:'related'  },
  { id:'p8', a:'up',    b:'down',    ans:'antonym'  }
];
const SORT_BUCKETS = [
  { k:'synonym', label:'Synonym', hint:'interchangeable' },
  { k:'similar', label:'Similar', hint:'same kind, shared features' },
  { k:'related', label:'Related', hint:'same scene, not same features' },
  { k:'antonym', label:'Antonym', hint:'opposite on one axis' }
];
let _embSort = { placed:{} };
function embSorterInit(){
  _embSort = { placed:{} };
  const host = lrEl('emb-sorter'); if(!host) return;
  host.innerHTML =
    '<div id="emb-sort-pool" class="emb-drop" style="min-height:56px;margin-bottom:1rem">'+
      '<div class="emb-drop-label"><span>Unsorted pairs</span><span id="emb-sort-score"></span></div>'+
      '<div id="emb-sort-pool-chips"></div></div>'+
    '<div class="lr-grid2" id="emb-sort-buckets"></div>'+
    '<div class="lr-note" id="emb-sort-note">Drag each pair into a bucket. Watch <em>coffee / cup</em> especially \u2014 shared scene, not shared features.</div>';
  lrEl('emb-sort-buckets').innerHTML = SORT_BUCKETS.map(b=>
    '<div class="emb-drop" data-bucket="'+b.k+'" ondragover="embSortOver(event,this)" ondragleave="this.classList.remove(\'over\')" ondrop="embSortDrop(event,\''+b.k+'\')">'+
      '<div class="emb-drop-label"><span>'+b.label+'</span><span style="text-transform:none;letter-spacing:0">'+b.hint+'</span></div>'+
      '<div class="emb-bucket-chips" data-chips="'+b.k+'"></div></div>'
  ).join('');
  embSortRender();
}
function embSortRender(){
  const pool = lrEl('emb-sort-pool-chips'); if(!pool) return;
  // unplaced chips
  pool.innerHTML = SORT_PAIRS.filter(p=>!_embSort.placed[p.id]).map(p=>embSortChip(p)).join('') || '<span style="color:var(--muted);font-family:var(--mono);font-size:.72rem">all sorted \u2713</span>';
  SORT_BUCKETS.forEach(b=>{
    const c = document.querySelector('[data-chips="'+b.k+'"]'); if(!c) return;
    c.innerHTML = SORT_PAIRS.filter(p=>_embSort.placed[p.id]===b.k).map(p=>{
      const ok = p.ans===b.k;
      return '<span class="emb-chip '+(ok?'correct':'wrong')+'" draggable="true" ondragstart="embSortDrag(event,\''+p.id+'\')">'+p.a+' / '+p.b+' '+(ok?'\u2713':'\u2717')+'</span>';
    }).join('');
  });
  const placed = Object.keys(_embSort.placed).length;
  const correct = SORT_PAIRS.filter(p=>_embSort.placed[p.id]===p.ans).length;
  lrTxt('emb-sort-score', placed? correct+' / '+SORT_PAIRS.length+' correct' : '');
  if(placed===SORT_PAIRS.length){
    lrSet('emb-sort-note', correct===SORT_PAIRS.length
      ? '<b style="color:var(--accent4)">All correct.</b> Notice the split: <em>coffee/cup</em> and <em>doctor/hospital</em> are related (same scene), while <em>cat/dog</em> and <em>coffee/tea</em> are similar (same kind).'
      : 'Some are off. The classic trap: <em>coffee/cup</em> is <b>related</b>, not similar \u2014 they co-star in an event but share no features.');
  }
}
function embSortChip(p){ return '<span class="emb-chip" draggable="true" ondragstart="embSortDrag(event,\''+p.id+'\')">'+p.a+' / '+p.b+'</span>'; }
function embSortDrag(e,id){ e.dataTransfer.setData('text/plain', id); }
function embSortOver(e,el){ e.preventDefault(); el.classList.add('over'); }
function embSortDrop(e,bucket){ e.preventDefault(); const id=e.dataTransfer.getData('text/plain'); document.querySelectorAll('.emb-drop').forEach(d=>d.classList.remove('over')); if(id){ _embSort.placed[id]=bucket; embSortRender(); } }

// ───────────────────────────────────────────────────────────
// 5.1 — Affective cube (Valence × Arousal × Dominance)  [flagship]
// ───────────────────────────────────────────────────────────
const CUBE_WORDS = [
  { w:'courageous', V:0.8, A:0.7, D:0.9, c:LRC.grn },
  { w:'music',      V:0.7, A:0.6, D:0.4, c:LRC.acc },
  { w:'heartbreak', V:0.1, A:0.6, D:0.2, c:LRC.red },
  { w:'cub',        V:0.6, A:0.3, D:0.15,c:LRC.amb },
  { w:'calm',       V:0.7, A:0.15,D:0.5, c:LRC.pur }
];
const CUBE_BANK = ['triumph','panic','lullaby','tyrant','kitten','funeral','victory','boredom'];
const CUBE_BANK_VAD = { triumph:[0.9,0.8,0.85], panic:[0.1,0.95,0.2], lullaby:[0.7,0.1,0.4], tyrant:[0.15,0.7,0.95], kitten:[0.75,0.35,0.2], funeral:[0.15,0.35,0.3], victory:[0.9,0.75,0.8], boredom:[0.3,0.1,0.35] };
let _embCube = { rot:0.6, tilt:-0.35, drag:false, lx:0, ly:0, words:null, anim:null };
function embCubeInit(){
  _embCube = { rot:0.6, tilt:-0.35, drag:false, lx:0, ly:0, words:CUBE_WORDS.map(o=>Object.assign({},o)), anim:null };
  const host = lrEl('emb-cube'); if(!host) return;
  host.innerHTML =
    '<canvas id="emb-cube-cv" style="width:100%;display:block;cursor:grab;touch-action:none"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem"><span class="lr-note" style="margin:0">Drag to rotate. Add a word:</span>'+
      CUBE_BANK.map(w=>'<button class="lr-btn" onclick="embCubeAdd(\''+w+'\')">'+w+'</button>').join('')+
    '</div>'+
    '<div class="emb-legend"><span><span class="emb-dot" style="background:'+LRC.acc+'"></span>Valence (pleasant \u2192)</span><span><span class="emb-dot" style="background:'+LRC.amb+'"></span>Arousal (intense \u2191)</span><span><span class="emb-dot" style="background:'+LRC.pur+'"></span>Dominance (in control \u2197)</span></div>';
  const cv = lrEl('emb-cube-cv');
  const down = e=>{ _embCube.drag=true; const p=e.touches?e.touches[0]:e; _embCube.lx=p.clientX; _embCube.ly=p.clientY; cv.style.cursor='grabbing'; };
  const move = e=>{ if(!_embCube.drag) return; const p=e.touches?e.touches[0]:e; _embCube.rot += (p.clientX-_embCube.lx)*0.01; _embCube.tilt += (p.clientY-_embCube.ly)*0.01; _embCube.tilt=lrClamp(_embCube.tilt,-1.2,1.2); _embCube.lx=p.clientX; _embCube.ly=p.clientY; embCubeDraw(); if(e.cancelable)e.preventDefault(); };
  const up = ()=>{ _embCube.drag=false; cv.style.cursor='grab'; };
  cv.addEventListener('mousedown',down); window.addEventListener('mousemove',move); window.addEventListener('mouseup',up);
  cv.addEventListener('touchstart',down,{passive:true}); cv.addEventListener('touchmove',move,{passive:false}); cv.addEventListener('touchend',up);
  // gentle auto-rotate until first drag
  _embCube.anim = embTimer(()=>{ if(!_embCube.drag){ _embCube.rot += 0.006; embCubeDraw(); } }, 40);
  embCubeDraw();
}
function embCubeAdd(w){
  if(_embCube.words.some(o=>o.w===w)) return;
  const v = CUBE_BANK_VAD[w] || [Math.random(),Math.random(),Math.random()];
  _embCube.words.push({ w, V:v[0], A:v[1], D:v[2], c:'#ECF1FF', fresh:true });
  embCubeDraw();
}
function embCubeProject(V,A,D){
  // map [0,1]^3 to centered coords, rotate around vertical (rot) then tilt
  const x=(V-0.5), y=(D-0.5), z=(A-0.5);
  const cr=Math.cos(_embCube.rot), sr=Math.sin(_embCube.rot);
  let x1=x*cr - z*sr, z1=x*sr + z*cr, y1=y;
  const ct=Math.cos(_embCube.tilt), st=Math.sin(_embCube.tilt);
  let y2=y1*ct - z1*st, z2=y1*st + z1*ct;
  return { x:x1, y:y2, depth:z2 };
}
function embCubeDraw(){
  const c = lrCanvas('emb-cube-cv', 340); if(!c) return;
  const { ctx, W, H } = c;
  const cx=W/2, cy=H/2, S=Math.min(W,H)*0.62;
  // cube corners
  const corners=[]; for(let i=0;i<8;i++){ const V=i&1?1:0, D=i&2?1:0, A=i&4?1:0; corners.push(embCubeProject(V,A,D)); }
  const edges=[[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]];
  const px=p=>cx+p.x*S, py=p=>cy+p.y*S;
  ctx.strokeStyle='rgba(214,226,255,0.14)'; ctx.lineWidth=1;
  edges.forEach(([a,b])=>{ ctx.beginPath(); ctx.moveTo(px(corners[a]),py(corners[a])); ctx.lineTo(px(corners[b]),py(corners[b])); ctx.stroke(); });
  // axis labels at cube extents
  const axV=embCubeProject(1,0,0), axA=embCubeProject(0,1,0), axD=embCubeProject(0,0,1), org=embCubeProject(0,0,0);
  const drawAxis=(p,lab,col)=>{ ctx.strokeStyle=col; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(px(org),py(org)); ctx.lineTo(px(p),py(p)); ctx.stroke(); ctx.fillStyle=col; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText(lab,px(p)+3,py(p)); };
  drawAxis(axV,'V',LRC.acc); drawAxis(axA,'A',LRC.amb); drawAxis(axD,'D',LRC.pur);
  // words sorted by depth (painter's algorithm)
  const pts = _embCube.words.map(o=>{ const p=embCubeProject(o.V,o.A,o.D); return {o,p}; }).sort((m,n)=>m.p.depth-n.p.depth);
  pts.forEach(({o,p})=>{
    const sx=px(p), sy=py(p), r=o.fresh?7:5.5;
    // drop line to floor (D=0 plane)
    const fl=embCubeProject(o.V,o.A,0);
    ctx.strokeStyle='rgba(214,226,255,0.12)'; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(px(fl),py(fl)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle=o.c; ctx.beginPath(); ctx.arc(sx,sy,r,0,7); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle=LRC.text; ctx.font=(o.fresh?'700 ':'')+'11px IBM Plex Mono, monospace'; ctx.fillText(o.w, sx+9, sy+4);
  });
}

// ───────────────────────────────────────────────────────────
// 5.2 — Unknown-word detective game  [flagship]
// ───────────────────────────────────────────────────────────
const MYS_SENTENCES = [
  { toks:['Kvass','is','brewed','at','home','and','poured','cold'], ctx:['brewed','poured','cold'] },
  { toks:['A','tall','glass','of','kvass','with','dinner'], ctx:['glass','dinner'] },
  { toks:['They','sell','kvass','from','barrels','in','summer'], ctx:['barrels','summer'] }
];
const MYS_KNOWN = {
  cider:['brewed','poured','cold','glass','barrels'],
  kombucha:['brewed','poured','cold','glass','summer'],
  'root beer':['poured','cold','glass','dinner','summer']
};
let _embMys = { picked:{}, revealed:false };
function embMysteryInit(){
  _embMys = { picked:{}, revealed:false };
  const host = lrEl('emb-mystery'); if(!host) return;
  host.innerHTML =
    '<div class="lr-card-t" style="margin-bottom:.6rem">The mystery word appears in three sentences. Click its context words.</div>'+
    '<div id="emb-mys-sents" style="display:flex;flex-direction:column;gap:.6rem;font-size:.95rem;line-height:1.9"></div>'+
    '<div style="margin:1.2rem 0 .5rem;font-family:var(--mono);font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Known drinks light up when they share your picked context</div>'+
    '<div id="emb-mys-known" class="lr-grid3"></div>'+
    '<div style="margin-top:1.1rem"><div class="emb-drop-label"><span>Confidence: this unknown word is a drink</span><span id="emb-mys-pct">0%</span></div>'+
      '<div class="emb-meter"><div class="emb-meter-fill" id="emb-mys-meter" style="width:0%"></div></div></div>'+
    '<div id="emb-mys-reveal" style="margin-top:1rem"></div>';
  embMysRender();
}
function embMysRender(){
  const sents = lrEl('emb-mys-sents'); if(!sents) return;
  sents.innerHTML = MYS_SENTENCES.map((s,si)=> '<div>'+ s.toks.map((t,ti)=>{
    const low=t.toLowerCase();
    const isCtx = s.ctx.includes(low);
    if(/^kvass$/i.test(t)) return '<span style="color:'+LRC.amb+';font-weight:700">'+ (_embMys.revealed?'kvass':'_______') +'</span>';
    if(isCtx){ const on=_embMys.picked[low]; return '<span class="emb-ctxword '+(on?'picked':'')+'" onclick="embMysPick(\''+low+'\')">'+t+'</span>'; }
    return '<span>'+t+'</span>';
  }).join(' ') +'</div>').join('');
  // known greens
  const picked = Object.keys(_embMys.picked).filter(k=>_embMys.picked[k]);
  const known = lrEl('emb-mys-known');
  known.innerHTML = Object.keys(MYS_KNOWN).map(g=>{
    const shared = MYS_KNOWN[g].filter(w=>picked.includes(w));
    const lit = shared.length>0;
    return '<div class="lr-card" style="border-color:'+(lit?LRC.grn:'var(--border)')+';transition:border-color .2s">'+
      '<div class="lr-card-t" style="color:'+(lit?LRC.grn:LRC.acc)+'">'+g+'</div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:.25rem;margin-top:.4rem">'+
        MYS_KNOWN[g].map(w=>{ const on=picked.includes(w); return '<span style="font-family:var(--mono);font-size:.66rem;padding:.15rem .4rem;border-radius:4px;background:'+(on?'rgba(61,220,132,0.2)':'var(--surface3)')+';color:'+(on?LRC.grn:LRC.muted)+'">'+w+'</span>'; }).join('')+
      '</div><div style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.4rem">'+shared.length+' shared</div></div>';
  }).join('');
  // meter: fraction of all known-green context evidence covered
  const allCtx = [...new Set(MYS_SENTENCES.flatMap(s=>s.ctx))];
  const overlapTotal = picked.filter(w=>Object.values(MYS_KNOWN).some(arr=>arr.includes(w))).length;
  const pct = Math.min(100, Math.round(overlapTotal / allCtx.length * 100));
  lrEl('emb-mys-meter').style.width = pct+'%';
  lrTxt('emb-mys-pct', pct+'%');
  const rev = lrEl('emb-mys-reveal');
  if(pct>=80 && !_embMys.revealed){
    rev.innerHTML = '<button class="lr-btn solid" onclick="embMysReveal()">Enough evidence \u2014 reveal the word</button>';
  } else if(_embMys.revealed){
    rev.innerHTML = '<div class="lr-note" style="margin:0"><b style="color:'+LRC.amb+'">It\u2019s kvass</b> \u2014 a lightly fermented Eastern European drink made from rye bread. You deduced it exactly the way the algorithm does: same company as cider, kombucha, and root beer \u2192 same kind of meaning.</div>';
  } else {
    rev.innerHTML = '<div class="lr-note" style="margin:0">Keep clicking context words until the drinks light up and confidence passes 80%.</div>';
  }
}
function embMysPick(w){ _embMys.picked[w] = !_embMys.picked[w]; embMysRender(); }
function embMysReveal(){ _embMys.revealed = true; embMysRender(); }

// ───────────────────────────────────────────────────────────
// 5.3 — Live co-occurrence builder  [flagship]
// ───────────────────────────────────────────────────────────
const COOC_TOKENS = ['guitar','strings','sound','tuned','a','violin','strings','also','tuned','then','the','router','packets','network','reach'];
const COOC_TARGETS = ['guitar','violin','router'];
const COOC_CONTEXTS = ['strings','tuned','sound','packets','reach','network'];
let _embCooc = { win:2, center:0, matrix:null, view:'matrix', anim:null, zoom:false };
function embCoocInit(){
  _embCooc = { win:2, center:0, matrix:{}, view:'matrix', anim:null, zoom:false };
  COOC_TARGETS.forEach(t=>{ _embCooc.matrix[t]={}; COOC_CONTEXTS.forEach(c=>_embCooc.matrix[t][c]=0); });
  const host = lrEl('emb-cooc'); if(!host) return;
  host.innerHTML =
    '<div id="emb-cooc-sent" style="font-family:var(--mono);font-size:.9rem;line-height:2.4;margin-bottom:1rem;text-align:center"></div>'+
    '<div class="lr-ctl" style="margin-bottom:1rem">'+
      '<button class="lr-btn solid" id="emb-cooc-play" onclick="embCoocPlay()">\u25b6 Sweep the corpus</button>'+
      '<button class="lr-btn" onclick="embCoocStep()">step</button>'+
      '<button class="lr-btn" onclick="embCoocReset()">reset</button>'+
      '<div class="lr-sl" style="margin-left:auto">window \u00b1<input id="emb-cooc-win" type="range" min="1" max="3" step="1" value="2" oninput="embCoocWin(this.value)"><b id="emb-cooc-winv">2</b></div>'+
    '</div>'+
    '<div class="lr-ctl" style="margin-bottom:1rem">'+
      '<button class="lr-btn on" id="emb-cooc-mv" onclick="embCoocView(\'matrix\')">matrix view</button>'+
      '<button class="lr-btn" id="emb-cooc-vv" onclick="embCoocView(\'vector\')">vector view (3D)</button>'+
      '<button class="lr-btn" style="margin-left:auto" onclick="embCoocZoom()">\uD83D\uDD0D zoom out to real vocabulary</button>'+
    '</div>'+
    '<div id="emb-cooc-body"></div>'+
    '<div class="lr-note" id="emb-cooc-note">Slide the window, then sweep. Each time a target sits within \u00b1window of a context word, its tally ticks up.</div>';
  embCoocRenderSent(); embCoocRenderBody();
}
function embCoocReset(){ if(_embCooc.anim){clearInterval(_embCooc.anim);_embCooc.anim=null;} COOC_TARGETS.forEach(t=>COOC_CONTEXTS.forEach(c=>_embCooc.matrix[t][c]=0)); _embCooc.center=0; _embCooc.zoom=false; embCoocRenderSent(); embCoocRenderBody(); const b=lrEl('emb-cooc-play'); if(b)b.textContent='\u25b6 Sweep the corpus'; }
function embCoocWin(v){ _embCooc.win=parseInt(v); lrTxt('emb-cooc-winv',v); embCoocRenderSent(); }
function embCoocView(v){ _embCooc.view=v; _embCooc.zoom=false; lrEl('emb-cooc-mv').classList.toggle('on',v==='matrix'); lrEl('emb-cooc-vv').classList.toggle('on',v==='vector'); embCoocRenderBody(); }
function embCoocZoom(){ _embCooc.zoom=true; embCoocRenderBody(); }
function embCoocRenderSent(){
  const host=lrEl('emb-cooc-sent'); if(!host) return;
  host.innerHTML = COOC_TOKENS.map((t,i)=>{
    const inWin = Math.abs(i-_embCooc.center)<=_embCooc.win && i!==_embCooc.center;
    const isCenter = i===_embCooc.center;
    let style='color:var(--muted)';
    if(inWin) style='color:'+LRC.acc+';background:rgba(77,227,255,0.12);border-radius:4px;padding:0 .2rem';
    if(isCenter) style='color:'+LRC.amb+';font-weight:700;background:rgba(224,169,59,0.14);border-radius:4px;padding:0 .3rem';
    return '<span style="'+style+'">'+t+'</span>';
  }).join(' ');
}
function embCoocStep(){
  const i=_embCooc.center, tok=COOC_TOKENS[i];
  if(COOC_TARGETS.includes(tok)){
    for(let j=Math.max(0,i-_embCooc.win); j<=Math.min(COOC_TOKENS.length-1,i+_embCooc.win); j++){
      if(j===i) continue; const c=COOC_TOKENS[j];
      if(COOC_CONTEXTS.includes(c)) _embCooc.matrix[tok][c]++;
    }
  }
  _embCooc.center=(i+1)%COOC_TOKENS.length;
  embCoocRenderSent(); embCoocRenderBody();
}
function embCoocPlay(){
  if(_embCooc.anim){clearInterval(_embCooc.anim);_embCooc.anim=null;const b=lrEl('emb-cooc-play');if(b)b.textContent='\u25b6 Resume';return;}
  const b=lrEl('emb-cooc-play'); if(b)b.textContent='\u2759\u2759 Pause';
  _embCooc.anim=embTimer(()=>{ embCoocStep(); if(_embCooc.center===0){clearInterval(_embCooc.anim);_embCooc.anim=null;const bb=lrEl('emb-cooc-play');if(bb)bb.textContent='\u21ba Sweep again';} }, 420);
}
function embCoocRenderBody(){
  const host=lrEl('emb-cooc-body'); if(!host) return;
  if(_embCooc.zoom){ embCoocRenderZoom(host); return; }
  if(_embCooc.view==='matrix'){
    host.innerHTML='<table class="lr-table"><tr><th>target \\ context</th>'+COOC_CONTEXTS.map(c=>'<th>'+c+'</th>').join('')+'</tr>'+
      COOC_TARGETS.map(t=>'<tr><td style="color:'+LRC.amb+'">'+t+'</td>'+COOC_CONTEXTS.map(c=>{ const v=_embCooc.matrix[t][c]; return '<td style="color:'+(v>0?LRC.acc:'var(--muted)')+';font-weight:'+(v>0?'700':'400')+'">'+v+'</td>'; }).join('')+'</tr>').join('')+'</table>';
  } else {
    host.innerHTML='<canvas id="emb-cooc-cv" style="width:100%;display:block"></canvas>';
    embCoocDraw3D();
  }
}
function embCoocRenderZoom(host){
  host.innerHTML='<div style="text-align:center"><canvas id="emb-cooc-zcv" style="width:100%;max-width:520px;display:block;margin:0 auto"></canvas>'+
    '<div class="lr-note">This is the same matrix at real scale: 50,000 \u00d7 50,000. Almost every cell is zero \u2014 that empty ocean is <b>sparsity</b>, and it is why we need dense vectors (\u00a75.5).</div></div>';
  const c=lrCanvas('emb-cooc-zcv',260); if(!c) return;
  const {ctx,W,H}=c; const g=48, cw=W/g, ch=H/g;
  for(let y=0;y<g;y++)for(let x=0;x<g;x++){ const nz=Math.random()<0.012; ctx.fillStyle=nz?LRC.acc:'rgba(37,50,56,0.5)'; ctx.fillRect(x*cw+0.5,y*ch+0.5,cw-1,ch-1); }
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText('|V| \u00d7 |V| \u2248 2.5 billion cells, ~99.99% zero', 6, H-6);
}
function embCoocDraw3D(){
  const c=lrCanvas('emb-cooc-cv',300); if(!c) return;
  const {ctx,W,H}=c;
  // use first 3 contexts as axes
  const axes=COOC_CONTEXTS.slice(0,3);
  const cx=W*0.42, cy=H*0.6, S=110;
  const proj=(a,b,cc)=>({ x:cx + a*S*0.9 - cc*S*0.4, y:cy - b*S*0.9 + cc*S*0.35 });
  // axis lines
  ctx.strokeStyle='rgba(214,226,255,0.2)'; ctx.lineWidth=1;
  [[1,0,0],[0,1,0],[0,0,1]].forEach((v,i)=>{ const p=proj(v[0],v[1],v[2]); ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText(axes[i],p.x+2,p.y); });
  const cols={guitar:LRC.red,violin:LRC.grn,router:LRC.acc};
  const maxV=Math.max(1,...COOC_TARGETS.flatMap(t=>axes.map(a=>_embCooc.matrix[t][a])));
  COOC_TARGETS.forEach(t=>{ const a=_embCooc.matrix[t][axes[0]]/maxV, b=_embCooc.matrix[t][axes[1]]/maxV, cc=_embCooc.matrix[t][axes[2]]/maxV; const p=proj(a,b,cc);
    ctx.strokeStyle=cols[t]; ctx.lineWidth=2; ctx.globalAlpha=.6; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.globalAlpha=1;
    ctx.fillStyle=cols[t]; ctx.beginPath(); ctx.arc(p.x,p.y,6,0,7); ctx.fill(); ctx.fillStyle=LRC.text; ctx.font='700 11px IBM Plex Mono, monospace'; ctx.fillText(t,p.x+8,p.y+3);
  });
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace';
  ctx.fillText('guitar & violin point similar ways; router drifts off', 6, H-8);
}

// ───────────────────────────────────────────────────────────
// 5.4 — Cosine: angle vs length tug-of-war  [flagship]
// ───────────────────────────────────────────────────────────
let _embCos = { a:{x:2.6,y:1.0,label:'violin'}, b:{x:1.4,y:2.4,label:'router'}, drag:null, len:1 };
function embCosInit(){
  _embCos = { a:{x:2.6,y:1.0,label:'violin'}, b:{x:1.4,y:2.4,label:'router'}, drag:null, len:1 };
  const host = lrEl('emb-cos'); if(!host) return;
  host.innerHTML =
    '<canvas id="emb-cos-cv" style="width:100%;display:block;cursor:crosshair;touch-action:none"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem">'+
      '<button class="lr-btn" onclick="embCosPreset()">guitar vs router preset</button>'+
      '<button class="lr-btn" onclick="embCosInit()">reset</button>'+
      '<div class="lr-sl" style="margin-left:auto">stretch vector A \u00d7<input id="emb-cos-len" type="range" min="0.4" max="3" step="0.05" value="1" oninput="embCosLen(this.value)"><b id="emb-cos-lenv">1.0</b></div>'+
    '</div>'+
    '<div class="lr-readout" style="margin-top:.85rem">'+
      '<span class="lr-stat"><span class="lr-stat-k">dot product a\u00b7b</span><span class="lr-stat-v" id="emb-cos-dot" style="color:'+LRC.red+'">\u2014</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">cosine</span><span class="lr-stat-v" id="emb-cos-cos" style="color:'+LRC.acc+'">\u2014</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">angle \u03b8</span><span class="lr-stat-v" id="emb-cos-ang" style="color:'+LRC.pur+'">\u2014</span></span>'+
    '</div>'+
    '<div class="lr-note" id="emb-cos-note">Drag either arrowhead. Then stretch A with the slider: watch the dot product balloon while the cosine holds perfectly still.</div>';
  const cv=lrEl('emb-cos-cv');
  const pick=e=>{ const r=cv.getBoundingClientRect(); const p=e.touches?e.touches[0]:e; const S=Math.min(r.width,r.height); const ox=(r.width-S)/2; const gx=(p.clientX-r.left-ox)/S*6-0; const gy=(r.height-(p.clientY-r.top))/S*6-0; // find nearest head
    const va={x:_embCos.a.x*_embCos.len,y:_embCos.a.y*_embCos.len}, vb=_embCos.b;
    const da=Math.hypot(gx-va.x,gy-va.y), db=Math.hypot(gx-vb.x,gy-vb.y);
    _embCos.drag = da<db?'a':'b'; embCosMove(e); };
  const embCosMove=e=>{ if(!_embCos.drag) return; const r=cv.getBoundingClientRect(); const p=e.touches?e.touches[0]:e; const S=Math.min(r.width,r.height); const ox=(r.width-S)/2; let gx=(p.clientX-r.left-ox)/S*6; let gy=(r.height-(p.clientY-r.top))/S*6; gx=lrClamp(gx,-0.2,5.5); gy=lrClamp(gy,-0.2,5.5); if(_embCos.drag==='a'){ _embCos.a.x=gx/_embCos.len; _embCos.a.y=gy/_embCos.len; } else { _embCos.b.x=gx; _embCos.b.y=gy; } embCosDraw(); if(e.cancelable)e.preventDefault(); };
  window.__embCosMove=embCosMove;
  cv.addEventListener('mousedown',pick); window.addEventListener('mousemove',embCosMove); window.addEventListener('mouseup',()=>_embCos.drag=null);
  cv.addEventListener('touchstart',pick,{passive:true}); cv.addEventListener('touchmove',embCosMove,{passive:false}); cv.addEventListener('touchend',()=>_embCos.drag=null);
  embCosDraw();
}
function embCosPreset(){ _embCos.a={x:2.9,y:0.35,label:'guitar'}; _embCos.b={x:0.4,y:2.8,label:'router'}; _embCos.len=1; lrEl('emb-cos-len').value=1; lrTxt('emb-cos-lenv','1.0'); lrSet('emb-cos-note','Two words that share almost no company: the readout shows a dot product of 2.14 but a cosine of only <b>0.26</b>, an angle of about 75\u00b0. Now drag <em>router</em> toward <em>guitar</em> and watch the cosine climb toward 1.'); embCosDraw(); }
function embCosLen(v){ _embCos.len=parseFloat(v); lrTxt('emb-cos-lenv',_embCos.len.toFixed(1)); embCosDraw(); }
function embCosDraw(){
  const c=lrCanvas('emb-cos-cv',320); if(!c) return;
  const {ctx,W,H}=c; const S=Math.min(W,H), ox=(W-S)/2;
  const sx=x=>ox+x/6*S, sy=y=>H-(y/6*S)-(H-S);
  // grid
  ctx.strokeStyle=LRC.grid; ctx.lineWidth=1;
  for(let i=0;i<=6;i++){ ctx.beginPath(); ctx.moveTo(sx(i),sy(0)); ctx.lineTo(sx(i),sy(6)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx(0),sy(i)); ctx.lineTo(sx(6),sy(i)); ctx.stroke(); }
  const a={x:_embCos.a.x*_embCos.len,y:_embCos.a.y*_embCos.len}, b=_embCos.b;
  // angle arc
  const angA=Math.atan2(a.y,a.x), angB=Math.atan2(b.y,b.x);
  ctx.strokeStyle='rgba(161,143,255,0.5)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(sx(0),sy(0),36,-angA,-angB, angA<angB); ctx.stroke();
  const drawVec=(v,col,lab)=>{ ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(sx(0),sy(0)); ctx.lineTo(sx(v.x),sy(v.y)); ctx.stroke();
    const ang=Math.atan2(sy(v.y)-sy(0),sx(v.x)-sx(0)); ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(sx(v.x),sy(v.y)); ctx.lineTo(sx(v.x)-11*Math.cos(ang-0.4),sy(v.y)-11*Math.sin(ang-0.4)); ctx.lineTo(sx(v.x)-11*Math.cos(ang+0.4),sy(v.y)-11*Math.sin(ang+0.4)); ctx.closePath(); ctx.fill();
    ctx.fillStyle=LRC.text; ctx.font='700 12px IBM Plex Mono, monospace'; ctx.fillText(lab,sx(v.x)+6,sy(v.y)-4); };
  drawVec(a,LRC.red,_embCos.a.label+(_embCos.len!==1?' \u00d7'+_embCos.len.toFixed(1):'')); drawVec(b,LRC.acc,_embCos.b.label);
  // readouts
  const dot=a.x*b.x+a.y*b.y; const cos=embCos([a.x,a.y],[b.x,b.y]); const ang=Math.acos(lrClamp(cos,-1,1))*180/Math.PI;
  lrTxt('emb-cos-dot',dot.toFixed(2)); lrTxt('emb-cos-cos',cos.toFixed(3)); lrTxt('emb-cos-ang',ang.toFixed(0)+'\u00b0');
}


// ═══════════════════════════════════════════════════════════
// CHAPTER 5 · INSTRUMENTS  (part 2: 5.5–5.7)
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// 5.5 — Sparse-to-dense morph
// ───────────────────────────────────────────────────────────
let _embMorph = { dense:false, anim:null };
function embMorphInit(){
  _embMorph = { dense:false, anim:null };
  const host = lrEl('emb-morph'); if(!host) return;
  host.innerHTML =
    '<canvas id="emb-morph-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center">'+
      '<button class="lr-btn solid" id="emb-morph-btn" onclick="embMorphToggle()">\u2b07 Compress: 50,000 \u2192 300</button>'+
    '</div>'+
    '<div class="lr-readout" style="margin-top:.6rem;justify-content:center">'+
      '<span class="lr-stat"><span class="lr-stat-k">length</span><span class="lr-stat-v" id="emb-morph-len" style="color:'+LRC.acc+'">50,000</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">nonzero</span><span class="lr-stat-v" id="emb-morph-nz" style="color:'+LRC.amb+'">~200</span></span>'+
      '<span class="lr-stat"><span class="lr-stat-k">wasted</span><span class="lr-stat-v" id="emb-morph-w" style="color:'+LRC.red+'">99.6%</span></span>'+
    '</div>'+
    '<div class="lr-note" id="emb-morph-note">The sparse vector is mostly a scrollbar of zeros. Compress squeezes the air out into 300 dense, meaningful numbers.</div>';
  embMorphDraw(0);
}
function embMorphToggle(){
  _embMorph.dense=!_embMorph.dense;
  const b=lrEl('emb-morph-btn'); if(b){ b.textContent=_embMorph.dense?'\u2b06 Expand back to sparse':'\u2b07 Compress: 50,000 \u2192 300'; }
  lrTxt('emb-morph-len', _embMorph.dense?'300':'50,000');
  lrTxt('emb-morph-nz', _embMorph.dense?'300 (all)':'~200');
  lrTxt('emb-morph-w', _embMorph.dense?'0%':'99.6%');
  lrSet('emb-morph-note', _embMorph.dense
    ? 'Now every one of the 300 slots holds a real number that matters. No dimension names a single context word \u2014 meaning is smeared across all of them.'
    : 'The sparse vector is mostly a scrollbar of zeros. Compress squeezes the air out into 300 dense, meaningful numbers.');
  if(_embMorph.anim) cancelAnimationFrame(_embMorph.anim);
  const t0=performance.now();
  const step=(t)=>{ let k=Math.min(1,(t-t0)/650); k=1-Math.pow(1-k,3); embMorphDraw(_embMorph.dense?k:1-k); if(k<1) _embMorph.anim=embRaf(step); };
  _embMorph.anim=embRaf(step);
}
function embMorphDraw(t){
  const c=lrCanvas('emb-morph-cv',150); if(!c) return;
  const {ctx,W,H}=c;
  const sparseN=200, denseN=60; // visual proxy
  const y0=20, bh=H-40;
  // interpolate cell count and fill
  const n=Math.round(sparseN + (denseN-sparseN)*t);
  const cw=W/n;
  for(let i=0;i<n;i++){
    const denseVal = (Math.sin(i*0.7)*0.5+0.5);
    const isNZ_sparse = (i%17===0);
    const v = t*denseVal + (1-t)*(isNZ_sparse?0.8:0.0);
    const col = t>0.5 ? lrMix('#223055', LRC.acc, v) : (isNZ_sparse?LRC.amb:'#182342');
    ctx.fillStyle=col;
    const hh=Math.max(2, v*bh);
    ctx.fillRect(i*cw+0.5, y0+(bh-hh), Math.max(1,cw-1), hh);
  }
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace';
  ctx.fillText(t>0.5?'dense: 300 meaningful values':'sparse: 50,000 slots, almost all zero', 6, H-6);
}

// ───────────────────────────────────────────────────────────
// 5.5.1 — Is this a real neighbor? classifier game
// ───────────────────────────────────────────────────────────
const NB_TARGET = 'violin';
const NB_CANDS = [
  { w:'bow', real:true, dot:2.4 }, { w:'rosin', real:true, dot:1.6 },
  { w:'concerto', real:true, dot:1.9 }, { w:'latency', real:false, dot:-1.8 },
  { w:'monsoon', real:false, dot:-2.2 }, { w:'ledger', real:false, dot:-1.2 }
];
let _embNb = { i:0, score:0, answered:0 };
function embClassifierInit(){
  _embNb = { i:0, score:0, answered:0, order:[...NB_CANDS].sort(()=>Math.random()-0.5) };
  const host = lrEl('emb-classifier'); if(!host) return;
  host.innerHTML =
    '<div style="text-align:center;margin-bottom:1rem">Target word: <b style="color:'+LRC.amb+';font-family:var(--mono)">'+NB_TARGET+'</b></div>'+
    '<div id="emb-nb-body"></div>'+
    '<div class="lr-note">Each guess runs the same pipeline as logistic regression: dot product \u2192 sigmoid \u2192 probability.</div>';
  embNbRender();
}
function embNbRender(){
  const host=lrEl('emb-nb-body'); if(!host) return;
  if(_embNb.i>=_embNb.order.length){
    host.innerHTML='<div class="lr-card" style="text-align:center"><div class="lr-card-t" style="color:'+LRC.grn+'">Done \u2014 '+_embNb.score+' / '+_embNb.order.length+' correct</div>'+
      '<div class="lr-card-b" style="margin-top:.5rem">You just did what training does billions of times: pull real neighbors close (high probability), push fake ones away (low).</div>'+
      '<button class="lr-btn solid" style="margin-top:.8rem" onclick="embClassifierInit()">play again</button></div>';
    return;
  }
  const cand=_embNb.order[_embNb.i];
  host.innerHTML=
    '<div class="lr-card" style="text-align:center"><div style="font-family:var(--mono);font-size:.7rem;color:var(--muted)">candidate '+(_embNb.i+1)+' of '+_embNb.order.length+'</div>'+
    '<div style="font-family:var(--mono);font-size:1.3rem;font-weight:700;color:var(--text);margin:.6rem 0">'+cand.w+'</div>'+
    '<div class="lr-ctl" style="justify-content:center"><button class="lr-btn solid" onclick="embNbGuess(true)">real neighbor</button><button class="lr-btn" onclick="embNbGuess(false)">random noise</button></div>'+
    '<div id="emb-nb-feedback" style="margin-top:1rem;min-height:80px"></div></div>';
}
function embNbGuess(guess){
  const cand=_embNb.order[_embNb.i];
  const p=lrSig(cand.dot);
  const correct = guess===cand.real;
  if(correct) _embNb.score++;
  const fb=lrEl('emb-nb-feedback');
  fb.innerHTML=
    '<div style="font-family:var(--mono);font-size:.78rem;color:var(--muted);margin-bottom:.4rem">'+NB_TARGET+' \u00b7 '+cand.w+' \u2192 dot = <b style="color:'+(cand.dot>=0?LRC.grn:LRC.red)+'">'+cand.dot.toFixed(1)+'</b> \u2192 \u03c3 = '+p.toFixed(2)+'</div>'+
    '<div style="height:22px;background:var(--surface3);border-radius:6px;overflow:hidden;position:relative;margin-bottom:.5rem"><div style="height:100%;width:'+(p*100).toFixed(0)+'%;background:'+(p>=0.5?'rgba(61,220,132,0.5)':'rgba(255,95,142,0.5)')+'"></div><div style="position:absolute;left:50%;top:0;bottom:0;width:2px;background:var(--text);opacity:.4"></div></div>'+
    '<div style="font-family:var(--mono);font-size:.85rem;font-weight:700;color:'+(correct?LRC.grn:LRC.red)+'">'+(correct?'\u2713 correct':'\u2717 not quite')+' \u2014 '+cand.w+' was '+(cand.real?'a real neighbor':'random noise')+'</div>'+
    '<button class="lr-btn" style="margin-top:.7rem" onclick="embNbNext()">next \u2192</button>';
}
function embNbNext(){ _embNb.i++; embNbRender(); }

// ───────────────────────────────────────────────────────────
// 5.5.2 — Skip-gram training in a live embedding space  [flagship]
// ───────────────────────────────────────────────────────────
const SG_WORDS = [
  { w:'violin', grp:0 }, { w:'bow', grp:0 }, { w:'cello', grp:0 }, { w:'rosin', grp:0 },
  { w:'cider', grp:1 }, { w:'kombucha', grp:1 }, { w:'brewed', grp:1 }, { w:'barrel', grp:1 },
  { w:'router', grp:2 }, { w:'packet', grp:2 }, { w:'latency', grp:2 }, { w:'firewall', grp:2 },
  { w:'monsoon', grp:3 }, { w:'drizzle', grp:3 }, { w:'hailstorm', grp:3 }
];
const SG_GRPCOL = [LRC.amb, LRC.grn, LRC.acc, LRC.pur];
let _embSg = { pts:null, win:2, k:3, eta:0.12, anim:null, step:0, twoMat:false, active:null };
function embSkipgramInit(){
  _embSg = { win:2, k:3, eta:0.12, anim:null, step:0, twoMat:false, active:null };
  _embSg.pts = SG_WORDS.map(o=>({ w:o.w, grp:o.grp, x:(Math.random()-0.5)*4.6, y:(Math.random()-0.5)*4.6, cx:(Math.random()-0.5)*4.6, cy:(Math.random()-0.5)*4.6 }));
  const host = lrEl('emb-skipgram'); if(!host) return;
  host.innerHTML =
    '<canvas id="emb-sg-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem">'+
      '<button class="lr-btn solid" id="emb-sg-play" onclick="embSgPlay()">\u25b6 Train</button>'+
      '<button class="lr-btn" onclick="embSgStepN(1)">step</button>'+
      '<button class="lr-btn" onclick="embSkipgramInit()">re-scatter</button>'+
      '<button class="lr-btn" id="emb-sg-2m" onclick="embSgTwoMat()">show 2 matrices</button>'+
    '</div>'+
    '<div class="lr-grid3" style="margin-top:1rem">'+
      lrSlider('emb-sg-win','window \u00b1L',1,5,1,2,LRC.acc)+
      lrSlider('emb-sg-k','neg samples k',1,8,1,3,LRC.red)+
      lrSlider('emb-sg-eta','learn rate \u03b7',0.02,0.3,0.01,0.12,LRC.grn)+
    '</div>'+
    '<div class="lr-readout" style="margin-top:.6rem;justify-content:center"><span class="lr-stat"><span class="lr-stat-k">step</span><span class="lr-stat-v" id="emb-sg-step">0</span></span></div>'+
    '<div class="lr-note">Real neighbors attract (green pull), random words repel (red push). Watch instruments, drinks, network terms, and weather words self-organize.</div>';
  ['win','k','eta'].forEach(kk=>{ const el=lrEl('emb-sg-'+kk); if(el) el.addEventListener('input',()=>embSgParam()); });
  embSgDraw();
}
function embSgParam(){ _embSg.win=+lrEl('emb-sg-win').value; _embSg.k=+lrEl('emb-sg-k').value; _embSg.eta=+lrEl('emb-sg-eta').value; lrTxt('emb-sg-win-v',_embSg.win.toFixed(0)); lrTxt('emb-sg-k-v',_embSg.k.toFixed(0)); lrTxt('emb-sg-eta-v',_embSg.eta.toFixed(2)); }
function embSgTwoMat(){ _embSg.twoMat=!_embSg.twoMat; lrEl('emb-sg-2m').classList.toggle('on',_embSg.twoMat); embSgDraw(); }
function embSgStepN(n){
  for(let s=0;s<n;s++){
    // pick a random target; positive = same group neighbor, negatives = k random other-group
    const pts=_embSg.pts; const ti=Math.floor(Math.random()*pts.length); const t=pts[ti];
    const sameGrp=pts.filter((p,i)=>i!==ti && p.grp===t.grp);
    if(sameGrp.length){ const pos=sameGrp[Math.floor(Math.random()*sameGrp.length)];
      // attract target(x,y) to pos context(cx,cy)
      const dx=pos.cx - t.x, dy=pos.cy - t.y; t.x+=_embSg.eta*dx*0.5; t.y+=_embSg.eta*dy*0.5; pos.cx-=_embSg.eta*dx*0.25; pos.cy-=_embSg.eta*dy*0.25;
      _embSg.active={t:ti, pos:pts.indexOf(pos), negs:[]};
    }
    for(let j=0;j<_embSg.k;j++){ const others=pts.filter(p=>p.grp!==t.grp); const neg=others[Math.floor(Math.random()*others.length)];
      const dx=neg.cx - t.x, dy=neg.cy - t.y; const d=Math.hypot(dx,dy)+1e-3; const push=_embSg.eta*0.35/d;
      t.x-=push*dx; t.y-=push*dy; neg.cx+=push*dx*0.5; neg.cy+=push*dy*0.5;
      if(_embSg.active) _embSg.active.negs.push(pts.indexOf(neg));
    }
    // keep bounded
    pts.forEach(p=>{ p.x=lrClamp(p.x,-3.2,3.2); p.y=lrClamp(p.y,-3.2,3.2); p.cx=lrClamp(p.cx,-3.2,3.2); p.cy=lrClamp(p.cy,-3.2,3.2); });
    _embSg.step++;
  }
  lrTxt('emb-sg-step',_embSg.step);
  embSgDraw();
}
function embSgPlay(){
  if(_embSg.anim){clearInterval(_embSg.anim);_embSg.anim=null;const b=lrEl('emb-sg-play');if(b)b.textContent='\u25b6 Train';return;}
  const b=lrEl('emb-sg-play'); if(b)b.textContent='\u2759\u2759 Pause';
  _embSg.anim=embTimer(()=>{ embSgStepN(1); if(_embSg.step>600){clearInterval(_embSg.anim);_embSg.anim=null;const bb=lrEl('emb-sg-play');if(bb)bb.textContent='\u21ba Retrain';} }, 60);
}
function embSgDraw(){
  const c=lrCanvas('emb-sg-cv',360); if(!c) return;
  const {ctx,W,H}=c; const S=Math.min(W,H), ox=(W-S)/2;
  const sx=x=>ox+(x+3.5)/7*S, sy=y=>(3.5-y)/7*S;
  // active-pair arrows
  if(_embSg.active){ const pts=_embSg.pts; const t=pts[_embSg.active.t];
    if(pts[_embSg.active.pos]){ const p=pts[_embSg.active.pos]; ctx.strokeStyle='rgba(61,220,132,0.55)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(sx(t.x),sy(t.y)); ctx.lineTo(sx(p.cx),sy(p.cy)); ctx.stroke(); }
    _embSg.active.negs.forEach(ni=>{ const n=pts[ni]; if(!n) return; ctx.strokeStyle='rgba(255,95,142,0.35)'; ctx.lineWidth=1.2; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(sx(t.x),sy(t.y)); ctx.lineTo(sx(n.cx),sy(n.cy)); ctx.stroke(); ctx.setLineDash([]); });
  }
  _embSg.pts.forEach(p=>{
    const col=SG_GRPCOL[p.grp];
    if(_embSg.twoMat){ // context copy
      ctx.fillStyle='rgba(255,255,255,0.12)'; ctx.strokeStyle=col; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(sx(p.cx),sy(p.cy),4,0,7); ctx.fill(); ctx.stroke();
      ctx.fillStyle='rgba(214,226,255,0.4)'; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText(p.w,sx(p.cx)+5,sy(p.cy)+3);
    }
    ctx.fillStyle=col; ctx.beginPath(); ctx.arc(sx(p.x),sy(p.y),5.5,0,7); ctx.fill();
    ctx.fillStyle=LRC.text; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText(p.w,sx(p.x)+7,sy(p.y)+3);
  });
  if(_embSg.twoMat){ ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText('solid = target vectors (W), hollow = context vectors (C)', 6, H-8); }
}

// ───────────────────────────────────────────────────────────
// 5.5.3 — Subword Lego builder
// ───────────────────────────────────────────────────────────
let _embSub = { word:'unfriendliness' };
function embSubwordInit(){
  _embSub = { word:'unfriendliness' };
  const host = lrEl('emb-subword'); if(!host) return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem"><input id="emb-sub-in" value="unfriendliness" oninput="embSubSet(this.value)" style="flex:1;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.6rem .8rem;font-family:var(--mono);font-size:.9rem;color:var(--text);outline:none">'+
      '<button class="lr-btn" onclick="embSubTry(\'zorptastic\')">try a made-up word</button></div>'+
    '<div id="emb-sub-body"></div>';
  embSubRender();
}
function embSubSet(v){ _embSub.word=v.trim()||' '; embSubRender(); }
function embSubTry(w){ _embSub.word=w; lrEl('emb-sub-in').value=w; embSubRender(); }
function embSubRender(){
  const host=lrEl('emb-sub-body'); if(!host) return;
  const w='<'+_embSub.word+'>';
  const grams=[]; for(let n=3;n<=4;n++){ for(let i=0;i+n<=w.length;i++) grams.push(w.slice(i,i+n)); }
  const uniq=[...new Set(grams)].slice(0,18);
  // each gram gets a pseudo-vector shown as a mini bar
  const vecs = uniq.map(g=>{ let s=0; for(let i=0;i<g.length;i++)s+=g.charCodeAt(i); return { g, v:(s%40)/40 }; });
  host.innerHTML=
    '<div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem">'+
      vecs.map(o=>'<div style="text-align:center"><div style="font-family:var(--mono);font-size:.72rem;color:'+LRC.acc+';background:var(--surface3);border:1px solid var(--border2);border-radius:6px;padding:.25rem .45rem">'+o.g.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>'+
        '<div style="height:'+(8+o.v*26)+'px;width:70%;margin:.3rem auto 0;background:'+lrMix('#223055',LRC.acc,o.v)+';border-radius:2px"></div></div>').join('')+
    '</div>'+
    '<div style="display:flex;align-items:center;gap:.6rem;justify-content:center;margin-bottom:.6rem"><span style="font-family:var(--mono);font-size:.8rem;color:var(--muted)">sum of pieces \u2192</span>'+
      '<span style="font-family:var(--mono);font-size:.85rem;font-weight:700;color:'+LRC.grn+'">embedding("'+_embSub.word+'")</span></div>'+
    '<div class="lr-note">Even a word never seen in training breaks into familiar chunks, so fastText can still build it a sensible vector \u2014 vanilla word2vec would return nothing.</div>';
}

// ───────────────────────────────────────────────────────────
// 5.6 — Projection: three lenses
// ───────────────────────────────────────────────────────────
const PROJ_WORDS = [
  { w:'sweet', x:0.8, y:2.4, grp:'taste' }, { w:'honey', x:1.1, y:2.7, grp:'taste' }, { w:'candy', x:0.6, y:2.9, grp:'taste' }, { w:'juice', x:1.3, y:2.2, grp:'taste' },
  { w:'arm', x:3.2, y:0.8, grp:'body' }, { w:'leg', x:3.5, y:1.1, grp:'body' }, { w:'hand', x:3.0, y:0.5, grp:'body' },
  { w:'Paris', x:2.2, y:3.4, grp:'place' }, { w:'Tokyo', x:2.5, y:3.6, grp:'place' }, { w:'Cairo', x:1.9, y:3.2, grp:'place' }
];
const PROJ_COL = { taste:LRC.grn, body:LRC.acc, place:LRC.pur };
let _embProj = { view:'tsne' };
function embProjectInit(){
  _embProj = { view:'tsne' };
  const host = lrEl('emb-project'); if(!host) return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center">'+
      '<button class="lr-btn on" id="emb-proj-tsne" onclick="embProjView(\'tsne\')">t-SNE scatter</button>'+
      '<button class="lr-btn" id="emb-proj-nn" onclick="embProjView(\'nn\')">nearest neighbors</button>'+
      '<button class="lr-btn" id="emb-proj-dendro" onclick="embProjView(\'dendro\')">dendrogram</button>'+
    '</div>'+
    '<div id="emb-proj-body"></div>'+
    '<div class="lr-note">Three views of one space. The t-SNE clusters are trustworthy; the distances <em>between</em> clusters are not.</div>';
  embProjRender();
}
function embProjView(v){ _embProj.view=v; ['tsne','nn','dendro'].forEach(k=>lrEl('emb-proj-'+k).classList.toggle('on',k===v)); embProjRender(); }
function embProjRender(){
  const host=lrEl('emb-proj-body'); if(!host) return;
  if(_embProj.view==='nn'){
    const target=PROJ_WORDS[0];
    const others=PROJ_WORDS.slice(1).map(o=>({w:o.w, d:Math.hypot(o.x-target.x,o.y-target.y), grp:o.grp})).sort((a,b)=>a.d-b.d);
    host.innerHTML='<div class="lr-card"><div class="lr-card-t">nearest neighbors of <b style="color:'+LRC.grn+'">sweet</b></div>'+
      others.map((o,i)=>'<div style="display:flex;align-items:center;gap:.6rem;padding:.3rem 0"><span style="font-family:var(--mono);font-size:.68rem;color:var(--muted);width:18px">'+(i+1)+'</span>'+
        '<span style="font-family:var(--mono);font-size:.82rem;color:'+PROJ_COL[o.grp]+';width:60px">'+o.w+'</span>'+
        '<div style="flex:1;height:14px;background:var(--surface3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+(100-o.d*22)+'%;background:'+PROJ_COL[o.grp]+'"></div></div>'+
        '<span style="font-family:var(--mono);font-size:.7rem;color:var(--muted)">cos '+(1-o.d/5).toFixed(2)+'</span></div>').join('')+'</div>';
    return;
  }
  if(_embProj.view==='dendro'){
    host.innerHTML='<canvas id="emb-proj-cv" style="width:100%;display:block"></canvas>'; embProjDendro(); return;
  }
  host.innerHTML='<canvas id="emb-proj-cv" style="width:100%;display:block"></canvas>'; embProjScatter();
}
function embProjScatter(){
  const c=lrCanvas('emb-proj-cv',300); if(!c) return;
  const {ctx,W,H}=c; const S=Math.min(W,H), ox=(W-S)/2;
  const sx=x=>ox+x/4*S*0.9+10, sy=y=>H-(y/4*S*0.9)-14;
  PROJ_WORDS.forEach(o=>{ ctx.fillStyle=PROJ_COL[o.grp]; ctx.beginPath(); ctx.arc(sx(o.x),sy(o.y),6,0,7); ctx.fill(); ctx.fillStyle=LRC.text; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText(o.w,sx(o.x)+8,sy(o.y)+3); });
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText('local clusters are real; between-cluster distance is not', 6, H-6);
}
function embProjDendro(){
  const c=lrCanvas('emb-proj-cv',300); if(!c) return;
  const {ctx,W,H}=c;
  const groups=[['sweet','honey','candy','juice'],['arm','leg','hand'],['Paris','Tokyo','Cairo']];
  const cols=[LRC.grn,LRC.acc,LRC.pur];
  const x0=110; let y=26; const rowH=(H-50)/(PROJ_WORDS.length);
  const leafY={};
  groups.forEach((g,gi)=>{ g.forEach(w=>{ leafY[w]=y; ctx.fillStyle=cols[gi]; ctx.font='11px IBM Plex Mono, monospace'; ctx.textAlign='right'; ctx.fillText(w,x0-10,y+4); ctx.textAlign='start'; y+=rowH; }); });
  // draw merges within group then to root
  groups.forEach((g,gi)=>{ const ys=g.map(w=>leafY[w]); const my=(Math.min(...ys)+Math.max(...ys))/2; const bx=x0+70;
    ys.forEach(yy=>{ ctx.strokeStyle=cols[gi]; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(x0,yy); ctx.lineTo(bx,yy); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(bx,Math.min(...ys)); ctx.lineTo(bx,Math.max(...ys)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx,my); ctx.lineTo(W-30,my); ctx.stroke(); g._my=my; });
  // root spine
  const mys=groups.map(g=>g._my); ctx.strokeStyle=LRC.muted; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(W-30,Math.min(...mys)); ctx.lineTo(W-30,Math.max(...mys)); ctx.stroke();
  ctx.fillStyle=LRC.muted; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText('categories recovered with no labels', 6, H-6);
}

// ───────────────────────────────────────────────────────────
// 5.7 — Analogy machine  [flagship]
// ───────────────────────────────────────────────────────────
const ANA_VEC = {
  king:[3.2,2.6], man:[2.6,1.0], woman:[1.4,1.2], queen:[2.0,2.8],
  Paris:[0.8,3.0], France:[1.2,2.0], Rome:[2.6,3.0], Italy:[3.0,2.0],
  sing:[1.0,0.6], sang:[1.5,0.9], walk:[2.4,0.7], walked:[2.9,1.4], walks:[2.85,1.05]
};
/* nearest known word to a point, excluding the three query words */
function embAnaNearest(pt, exclude){
  let best=null, bd=Infinity;
  Object.keys(ANA_VEC).forEach(w=>{
    if(exclude.indexOf(w)>=0) return;
    const d=Math.hypot(ANA_VEC[w][0]-pt[0], ANA_VEC[w][1]-pt[1]);
    if(d<bd){ bd=d; best=w; }
  });
  return best;
}
let _embAna = { honest:false, custom:null };
function embAnalogyInit(){
  _embAna = { honest:false, custom:null };
  const host = lrEl('emb-analogy'); if(!host) return;
  host.innerHTML =
    '<canvas id="emb-ana-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem">'+
      '<button class="lr-btn solid" onclick="embAnaRun(\'king\',\'man\',\'woman\')">king \u2212 man + woman</button>'+
      '<button class="lr-btn" onclick="embAnaRun(\'Paris\',\'France\',\'Italy\')">Paris \u2212 France + Italy</button>'+
      '<button class="lr-btn '+(_embAna.honest?'on':'')+'" id="emb-ana-honest" onclick="embAnaHonest()">honesty: show failures</button>'+
    '</div>'+
    '<div class="lr-ctl" style="margin-top:.6rem"><span class="lr-note" style="margin:0">Free-form:</span>'+
      '<input id="emb-ana-a" placeholder="Rome" value="Rome" style="width:80px;background:var(--surface2);border:1px solid var(--border2);border-radius:6px;padding:.35rem .5rem;font-family:var(--mono);font-size:.78rem;color:var(--text)">'+
      '<span style="color:var(--muted)">\u2212</span><input id="emb-ana-b" placeholder="Paris" value="Paris" style="width:80px;background:var(--surface2);border:1px solid var(--border2);border-radius:6px;padding:.35rem .5rem;font-family:var(--mono);font-size:.78rem;color:var(--text)">'+
      '<span style="color:var(--muted)">+</span><input id="emb-ana-c" placeholder="France" value="France" style="width:80px;background:var(--surface2);border:1px solid var(--border2);border-radius:6px;padding:.35rem .5rem;font-family:var(--mono);font-size:.78rem;color:var(--text)">'+
      '<button class="lr-btn" onclick="embAnaCustom()">solve</button></div>'+
    '<div id="emb-ana-eq" style="text-align:center;font-family:var(--mono);font-size:.9rem;margin-top:1rem;color:var(--text)"></div>'+
    '<div class="lr-note" id="emb-ana-note">Drag builds the parallelogram: subtract the first, add the third, land near the answer.</div>';
  embAnaRun('king','man','woman');
}
function embAnaHonest(){ _embAna.honest=!_embAna.honest; lrEl('emb-ana-honest').classList.toggle('on',_embAna.honest);
  if(_embAna.honest){
    lrSet('emb-ana-eq','<span style="color:'+LRC.acc+'">sang</span> \u2212 sing + walk \u2248 <span style="color:'+LRC.red+';font-weight:700">walks</span> <span style="color:var(--muted)">(wanted: walked)</span>');
    lrSet('emb-ana-note','<b style="color:'+LRC.red+'">Failure mode:</b> the past-tense offset is weaker than the royalty one, so the parallelogram lands closest to a <em>morphological variant</em> \u2014 <em>walks</em> rather than <em>walked</em>. The magic is real but narrow.');
    embAnaDraw('sang','sing','walk','walks',true);
  }
  else { lrSet('emb-ana-note','Drag builds the parallelogram: subtract the first, add the third, land near the answer.'); embAnaRun('king','man','woman'); }
}
function embAnaRun(a,b,c){
  const r=[ANA_VEC[a][0]-ANA_VEC[b][0]+ANA_VEC[c][0], ANA_VEC[a][1]-ANA_VEC[b][1]+ANA_VEC[c][1]];
  const target = embAnaNearest(r,[a,b,c]);
  embAnaDraw(a,b,c,target,false);
  lrSet('emb-ana-eq','<span style="color:'+LRC.acc+'">'+a+'</span> \u2212 '+b+' + '+c+' \u2248 <span style="color:'+LRC.grn+';font-weight:700">'+target+'</span>');
}
function embAnaCustom(){
  const a=lrEl('emb-ana-a').value.trim(), b=lrEl('emb-ana-b').value.trim(), c=lrEl('emb-ana-c').value.trim();
  if(ANA_VEC[a]&&ANA_VEC[b]&&ANA_VEC[c]){
    // compute result vector and nearest known word
    const r=[ANA_VEC[a][0]-ANA_VEC[b][0]+ANA_VEC[c][0], ANA_VEC[a][1]-ANA_VEC[b][1]+ANA_VEC[c][1]];
    const best = embAnaNearest(r,[a,b,c]);
    embAnaDraw(a,b,c,best,false);
    lrSet('emb-ana-eq','<span style="color:'+LRC.acc+'">'+a+'</span> \u2212 '+b+' + '+c+' \u2248 <span style="color:'+LRC.grn+';font-weight:700">'+best+'</span>');
    lrSet('emb-ana-note','Nearest word to the computed point is <b style="color:'+LRC.grn+'">'+best+'</b>. Try <b>Rome \u2212 Paris + France</b> \u2014 it should find Italy.');
  } else {
    lrSet('emb-ana-note','<b style="color:'+LRC.red+'">Unknown word.</b> This mini-space only knows: '+Object.keys(ANA_VEC).join(', ')+'.');
  }
}
function embAnaDraw(a,b,c,target,fail){
  const c2=lrCanvas('emb-ana-cv',320); if(!c2) return;
  const {ctx,W,H}=c2; const S=Math.min(W,H), ox=(W-S)/2;
  const sx=x=>ox+x/4*S*0.9+16, sy=y=>H-(y/4*S*0.9)-16;
  const va=ANA_VEC[a],vb=ANA_VEC[b],vc=ANA_VEC[c],vt=ANA_VEC[target];
  if(!va||!vb||!vc){ return; }
  const r=[va[0]-vb[0]+vc[0], va[1]-vb[1]+vc[1]];
  // grid
  ctx.strokeStyle=LRC.grid; ctx.lineWidth=1; for(let i=0;i<=4;i++){ ctx.beginPath(); ctx.moveTo(sx(i),sy(0)); ctx.lineTo(sx(i),sy(4)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx(0),sy(i)); ctx.lineTo(sx(4),sy(i)); ctx.stroke(); }
  // parallelogram: a - b defines offset, applied at c
  ctx.strokeStyle='rgba(161,143,255,0.4)'; ctx.setLineDash([5,4]); ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(sx(vb[0]),sy(vb[1])); ctx.lineTo(sx(va[0]),sy(va[1])); ctx.lineTo(sx(r[0]),sy(r[1])); ctx.lineTo(sx(vc[0]),sy(vc[1])); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
  const pt=(v,col,lab,solid)=>{ ctx.fillStyle=col; ctx.beginPath(); ctx.arc(sx(v[0]),sy(v[1]),solid?6:5,0,7); ctx.fill(); if(!solid){ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();} ctx.fillStyle=LRC.text; ctx.font='700 11px IBM Plex Mono, monospace'; ctx.fillText(lab,sx(v[0])+8,sy(v[1])+3); };
  pt(va,LRC.acc,a,true); pt(vb,LRC.muted,b,true); pt(vc,LRC.pur,c,true);
  // ghost result
  ctx.fillStyle=fail?LRC.red:LRC.grn; ctx.globalAlpha=.5; ctx.beginPath(); ctx.arc(sx(r[0]),sy(r[1]),9,0,7); ctx.fill(); ctx.globalAlpha=1;
  ctx.strokeStyle=fail?LRC.red:LRC.grn; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(sx(r[0]),sy(r[1]),9,0,7); ctx.stroke();
  ctx.fillStyle=fail?LRC.red:LRC.grn; ctx.font='700 10px IBM Plex Mono, monospace'; ctx.fillText('result',sx(r[0])+11,sy(r[1])-6);
  if(vt) pt(vt,fail?LRC.red:LRC.grn,target,false);
}

// ───────────────────────────────────────────────────────────
// 5.7 — Window size: syntactic vs topical
// ───────────────────────────────────────────────────────────
let _embWin = { size:2 };
const WIN_NEIGHBORS = {
  small:{ label:'\u00b12 \u2014 syntactic', words:['Denali','Kilimanjaro','Annapurna','Aconcagua'], note:'other mountains (same part-of-speech slot)' },
  large:{ label:'\u00b15 \u2014 topical', words:['sherpa','base-camp','oxygen','frostbite'], note:'words from the same subject matter' }
};
function embWindowInit(){
  _embWin = { size:2 };
  const host = lrEl('emb-window'); if(!host) return;
  host.innerHTML =
    '<div style="text-align:center;margin-bottom:1rem">nearest neighbors of <b style="color:'+LRC.amb+';font-family:var(--mono)">Everest</b></div>'+
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center"><div class="lr-sl">window \u00b1<input id="emb-win-sz" type="range" min="2" max="5" step="1" value="2" oninput="embWinSet(this.value)"><b id="emb-win-szv">2</b></div></div>'+
    '<div id="emb-win-body"></div>';
  embWinRender();
}
function embWinSet(v){ _embWin.size=parseInt(v); lrTxt('emb-win-szv',v); embWinRender(); }
function embWinRender(){
  const host=lrEl('emb-win-body'); if(!host) return;
  const set = _embWin.size<=3 ? WIN_NEIGHBORS.small : WIN_NEIGHBORS.large;
  const col = _embWin.size<=3 ? LRC.acc : LRC.pur;
  host.innerHTML='<div class="lr-card" style="border-color:'+col+'"><div class="lr-card-t" style="color:'+col+'">'+set.label+'</div>'+
    '<div style="display:flex;flex-wrap:wrap;gap:.4rem;margin:.6rem 0">'+set.words.map(w=>'<span class="emb-chip" style="cursor:default">'+w+'</span>').join('')+'</div>'+
    '<div style="font-family:var(--mono);font-size:.72rem;color:var(--muted)">'+set.note+'</div></div>'+
    '<div class="lr-note">Small windows learn <b>syntactic</b> similarity (same kind of word); large windows learn <b>topical</b> similarity (same subject).</div>';
}


// ═══════════════════════════════════════════════════════════
// CHAPTER 5 · INSTRUMENTS  (part 3: 5.7.1, 5.8, 5.9, 5.10)
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// 5.7.1 — Semantic drift time-slider
// ───────────────────────────────────────────────────────────
// each word has keyframe positions across decades; interpolate
const DRIFT_WORDS = {
  gay: { col:LRC.pur, frames:{ 1850:[0.7,2.8], 1900:[0.9,2.6], 1950:[1.6,2.0], 1980:[2.6,1.2], 2000:[3.1,0.9] }, from:'cheerful, merry', to:'sexual orientation' },
  broadcast: { col:LRC.acc, frames:{ 1850:[0.6,0.7], 1900:[1.0,0.9], 1950:[2.0,1.6], 1980:[2.9,2.4], 2000:[3.2,2.7] }, from:'scatter seed', to:'television / radio' },
  awful: { col:LRC.red, frames:{ 1850:[2.9,2.9], 1900:[2.4,2.4], 1950:[1.6,1.6], 1980:[0.9,1.0], 2000:[0.6,0.7] }, from:'awe-inspiring', to:'terrible' }
};
const DRIFT_ANCHORS = [
  { w:'cheerful', x:0.7, y:3.0 }, { w:'homosexual', x:3.3, y:0.8 },
  { w:'sow/seed', x:0.5, y:0.6 }, { w:'television', x:3.4, y:2.8 },
  { w:'awe', x:3.1, y:3.1 }, { w:'terrible', x:0.5, y:0.6 }
];
let _embDrift = { year:1850 };
function embDriftInterp(word, year){
  const fr=DRIFT_WORDS[word].frames; const yrs=Object.keys(fr).map(Number).sort((a,b)=>a-b);
  if(year<=yrs[0]) return fr[yrs[0]]; if(year>=yrs[yrs.length-1]) return fr[yrs[yrs.length-1]];
  for(let i=0;i<yrs.length-1;i++){ if(year>=yrs[i]&&year<=yrs[i+1]){ const t=(year-yrs[i])/(yrs[i+1]-yrs[i]); const a=fr[yrs[i]],b=fr[yrs[i+1]]; return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]; } }
  return fr[yrs[0]];
}
function embDriftInit(){
  _embDrift = { year:1850 };
  const host = lrEl('emb-drift'); if(!host) return;
  host.innerHTML =
    '<canvas id="emb-drift-cv" style="width:100%;display:block"></canvas>'+
    '<div class="lr-ctl" style="margin-top:1rem;justify-content:center"><div class="lr-sl" style="flex:1;max-width:420px">1850<input id="emb-drift-yr" type="range" min="1850" max="2000" step="5" value="1850" oninput="embDriftSet(this.value)" style="flex:1">2000 <b id="emb-drift-yrv" style="min-width:44px">1850</b></div></div>'+
    '<div class="emb-legend" style="justify-content:center">'+Object.keys(DRIFT_WORDS).map(w=>'<span><span class="emb-dot" style="background:'+DRIFT_WORDS[w].col+'"></span>'+w+': '+DRIFT_WORDS[w].from+' \u2192 '+DRIFT_WORDS[w].to+'</span>').join('')+'</div>';
  embDriftDraw();
}
function embDriftSet(v){ _embDrift.year=parseInt(v); lrTxt('emb-drift-yrv',v); embDriftDraw(); }
function embDriftDraw(){
  const c=lrCanvas('emb-drift-cv',320); if(!c) return;
  const {ctx,W,H}=c; const S=Math.min(W,H), ox=(W-S)/2;
  const sx=x=>ox+x/4*S*0.9+16, sy=y=>H-(y/4*S*0.9)-30;
  // anchor meaning-regions (faint)
  DRIFT_ANCHORS.forEach(a=>{ ctx.fillStyle='rgba(134,144,137,0.5)'; ctx.font='10px IBM Plex Mono, monospace'; ctx.fillText(a.w,sx(a.x)-6,sy(a.y)); ctx.fillStyle='rgba(134,144,137,0.25)'; ctx.beginPath(); ctx.arc(sx(a.x),sy(a.y),3,0,7); ctx.fill(); });
  // each word: trail from 1850 to current year, then dot
  Object.keys(DRIFT_WORDS).forEach(w=>{
    const col=DRIFT_WORDS[w].col;
    ctx.strokeStyle=col; ctx.globalAlpha=.35; ctx.lineWidth=2; ctx.beginPath();
    let first=true;
    for(let y=1850;y<=_embDrift.year;y+=5){ const p=embDriftInterp(w,y); if(first){ctx.moveTo(sx(p[0]),sy(p[1]));first=false;} else ctx.lineTo(sx(p[0]),sy(p[1])); }
    ctx.stroke(); ctx.globalAlpha=1;
    const cur=embDriftInterp(w,_embDrift.year);
    ctx.fillStyle=col; ctx.beginPath(); ctx.arc(sx(cur[0]),sy(cur[1]),6,0,7); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle=LRC.text; ctx.font='700 11px IBM Plex Mono, monospace'; ctx.fillText(w,sx(cur[0])+9,sy(cur[1])+3);
  });
  ctx.fillStyle=LRC.muted; ctx.font='11px IBM Plex Mono, monospace'; ctx.fillText('year: '+_embDrift.year, 10, 20);
  ctx.fillText('meaning-space (each word carves a path as its company changes)', 10, H-8);
}

// ───────────────────────────────────────────────────────────
// 5.8 — Bias-audit panel
// ───────────────────────────────────────────────────────────
const BIAS_CASES = [
  { analogy:'man : programmer :: woman : ?', stereo:'homemaker', embAssoc:0.82, realStat:0.78, occ:'programmers who are men' },
  { analogy:'man : doctor :: woman : ?', stereo:'nurse', embAssoc:0.74, realStat:0.62, occ:'doctors who are men' },
  { analogy:'man : boss :: woman : ?', stereo:'assistant', embAssoc:0.79, realStat:0.60, occ:'managers who are men' }
];
let _embBias = { idx:0, debiased:false };
function embBiasInit(){
  _embBias = { idx:0, debiased:false };
  const host = lrEl('emb-bias'); if(!host) return;
  host.innerHTML =
    '<div class="lr-ctl" style="margin-bottom:1rem">'+BIAS_CASES.map((b,i)=>'<button class="lr-btn '+(i===0?'on':'')+'" id="emb-bias-c'+i+'" onclick="embBiasCase('+i+')">'+b.analogy.split('::')[0].trim()+'\u2026</button>').join('')+
      '<button class="lr-btn" style="margin-left:auto" id="emb-bias-db" onclick="embBiasDebias()">debiasing: OFF</button></div>'+
    '<div id="emb-bias-body"></div>';
  embBiasRender();
}
function embBiasCase(i){ _embBias.idx=i; BIAS_CASES.forEach((b,j)=>lrEl('emb-bias-c'+j).classList.toggle('on',j===i)); embBiasRender(); }
function embBiasDebias(){ _embBias.debiased=!_embBias.debiased; lrEl('emb-bias-db').textContent='debiasing: '+(_embBias.debiased?'ON':'OFF'); embBiasRender(); }
function embBiasRender(){
  const host=lrEl('emb-bias-body'); if(!host) return;
  const b=BIAS_CASES[_embBias.idx];
  const embVal = _embBias.debiased ? b.realStat*0.55 : b.embAssoc; // debiasing lowers the headline metric...
  const residual = _embBias.debiased ? 0.68 : 0.0; // ...but clustering persists
  host.innerHTML=
    '<div class="lr-card" style="margin-bottom:1rem"><div style="font-family:var(--mono);font-size:.9rem;color:var(--text);text-align:center">'+b.analogy+' \u2192 <b style="color:'+LRC.red+'">'+b.stereo+'</b></div></div>'+
    '<div style="margin-bottom:1rem">'+
      embBiasBar('embedding association', embVal, _embBias.debiased?LRC.amb:LRC.red)+
      embBiasBar('real-world labor statistic', b.realStat, LRC.muted)+
    '</div>'+
    (!_embBias.debiased
      ? '<div class="lr-note">The embedding\u2019s association ('+(b.embAssoc*100).toFixed(0)+'%) <b style="color:'+LRC.red+'">exceeds</b> the real-world statistic ('+(b.realStat*100).toFixed(0)+'%). That gap is <b>amplification</b>: the model is more biased than the world it learned from.</div>'
      : '<div class="lr-note"><b style="color:'+LRC.amb+'">Debiasing lowered the headline number</b> \u2014 but a classifier can still recover the stereotype grouping with '+(residual*100).toFixed(0)+'% accuracy (Gonen &amp; Goldberg 2019). The bias was hidden, not removed.</div>');
}
function embBiasBar(label,v,col){
  return '<div style="display:flex;align-items:center;gap:.7rem;margin-bottom:.6rem"><span style="font-family:var(--mono);font-size:.7rem;color:var(--muted);width:180px">'+label+'</span>'+
    '<div style="flex:1;height:22px;background:var(--surface3);border-radius:6px;overflow:hidden"><div style="height:100%;width:'+(v*100).toFixed(0)+'%;background:'+col+';transition:width .4s"></div></div>'+
    '<span style="font-family:var(--mono);font-size:.75rem;color:'+col+';width:44px;text-align:right">'+(v*100).toFixed(0)+'%</span></div>';
}

// ───────────────────────────────────────────────────────────
// 5.9 — Grade the model (human rating vs cosine)
// ───────────────────────────────────────────────────────────
const GRADE_PAIRS = [
  { a:'cup', b:'mug', model:0.86 }, { a:'cup', b:'coffee', model:0.58 },
  { a:'plane', b:'car', model:0.44 }, { a:'king', b:'queen', model:0.72 },
  { a:'happy', b:'cheerful', model:0.80 }, { a:'cat', b:'banana', model:0.09 }
];
let _embGrade = { ratings:{} };
function embGradeInit(){
  _embGrade = { ratings:{} };
  const host = lrEl('emb-grade'); if(!host) return;
  host.innerHTML =
    '<div class="lr-grid2"><div><div class="lr-card-t" style="margin-bottom:.6rem">Rate each pair 0\u201310 (your human judgment)</div><div id="emb-grade-sliders"></div></div>'+
      '<div><div class="lr-card-t" style="margin-bottom:.6rem">Your ratings vs. model cosine</div><canvas id="emb-grade-cv" style="width:100%;display:block"></canvas>'+
      '<div class="lr-readout" style="margin-top:.5rem;justify-content:center"><span class="lr-stat"><span class="lr-stat-k">correlation</span><span class="lr-stat-v" id="emb-grade-r" style="color:'+LRC.acc+'">\u2014</span></span></div></div></div>'+
    '<div class="lr-note">This is exactly what an intrinsic similarity benchmark computes: how well the model\u2019s cosines track human similarity judgments.</div>';
  lrEl('emb-grade-sliders').innerHTML = GRADE_PAIRS.map((p,i)=>{
    return '<div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.7rem"><span style="font-family:var(--mono);font-size:.76rem;color:var(--text);width:110px">'+p.a+' \u00b7 '+p.b+'</span>'+
      '<input type="range" min="0" max="10" step="1" value="5" oninput="embGradeSet('+i+',this.value)" style="flex:1;accent-color:'+LRC.acc+'">'+
      '<span id="emb-grade-v'+i+'" style="font-family:var(--mono);font-size:.76rem;color:'+LRC.acc+';width:20px">5</span></div>';
  }).join('');
  GRADE_PAIRS.forEach((p,i)=>_embGrade.ratings[i]=5);
  embGradeDraw();
}
function embGradeSet(i,v){ _embGrade.ratings[i]=parseInt(v); lrTxt('emb-grade-v'+i,v); embGradeDraw(); }
function embGradeDraw(){
  const c=lrCanvas('emb-grade-cv',220); if(!c) return;
  const {ctx,W,H}=c; const pad=32, x0=pad,x1=W-12,y0=H-24,y1=12;
  ctx.strokeStyle=LRC.grid; ctx.lineWidth=1; ctx.strokeRect(x0,y1,x1-x0,y0-y1);
  ctx.fillStyle=LRC.muted; ctx.font='9px IBM Plex Mono, monospace'; ctx.fillText('cosine \u2192',x1-52,y0+16); ctx.save(); ctx.translate(10,y1+40); ctx.rotate(-Math.PI/2); ctx.fillText('your rating \u2192',0,0); ctx.restore();
  // points
  const xs=[],ys=[];
  GRADE_PAIRS.forEach((p,i)=>{ const rx=x0+p.model*(x1-x0); const ry=y0-(_embGrade.ratings[i]/10)*(y0-y1); xs.push(p.model); ys.push(_embGrade.ratings[i]/10);
    ctx.fillStyle=LRC.acc; ctx.beginPath(); ctx.arc(rx,ry,5,0,7); ctx.fill(); ctx.fillStyle=LRC.muted; ctx.font='8px IBM Plex Mono, monospace'; ctx.fillText(p.a,rx+6,ry-2); });
  // correlation
  const n=xs.length; const mx=xs.reduce((a,b)=>a+b)/n, my=ys.reduce((a,b)=>a+b)/n;
  let num=0,dx=0,dy=0; for(let i=0;i<n;i++){ num+=(xs[i]-mx)*(ys[i]-my); dx+=(xs[i]-mx)**2; dy+=(ys[i]-my)**2; }
  const r = (dx&&dy)? num/Math.sqrt(dx*dy) : 0;
  lrTxt('emb-grade-r', r.toFixed(2));
  // trend line
  if(dx){ const slope=num/dx, b0=my-slope*mx; ctx.strokeStyle='rgba(224,169,59,0.6)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(x0+ (0)*(x1-x0), y0-(b0)*(y0-y1)); ctx.lineTo(x0+1*(x1-x0), y0-(slope+b0)*(y0-y1)); ctx.stroke(); }
}

// ───────────────────────────────────────────────────────────
// 5.9 — Run-to-run instability
// ───────────────────────────────────────────────────────────
const STAB_TARGET = 'plant';
const STAB_POOL = ['factory','flower','tree','seedling','garden','crop','bush','shrub','greenhouse','soil','leaf','root'];
let _embStab = { runs:[], run:0 };
function embStabilityInit(){
  _embStab = { runs:[], run:0 };
  const host = lrEl('emb-stability'); if(!host) return;
  host.innerHTML =
    '<div style="text-align:center;margin-bottom:1rem">nearest neighbors of <b style="color:'+LRC.amb+';font-family:var(--mono)">'+STAB_TARGET+'</b>, retrained from scratch each time</div>'+
    '<div class="lr-ctl" style="margin-bottom:1rem;justify-content:center"><button class="lr-btn solid" onclick="embStabRetrain()">\u21ba retrain (new random seed)</button><button class="lr-btn" onclick="embStabilityInit()">clear</button></div>'+
    '<div id="emb-stab-body"></div>'+
    '<div class="lr-note">Same corpus, different random seed \u2192 different neighbor list. This wobble is why best practice averages over several bootstrapped models.</div>';
  embStabRetrain();
}
function embStabRetrain(){
  _embStab.run++;
  // pick 5 neighbors with slight random reshuffle each run
  const shuffled=[...STAB_POOL].map(w=>({w, s:Math.random()})).sort((a,b)=>a.s-b.s).slice(0,5).map(o=>o.w);
  _embStab.runs.unshift({ run:_embStab.run, list:shuffled });
  if(_embStab.runs.length>4) _embStab.runs.pop();
  embStabRender();
}
function embStabRender(){
  const host=lrEl('emb-stab-body'); if(!host) return;
  // find words that appear in every run (stable core)
  const allLists=_embStab.runs.map(r=>r.list);
  const core = allLists.length? allLists[0].filter(w=>allLists.every(l=>l.includes(w))) : [];
  host.innerHTML = _embStab.runs.map(r=>
    '<div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem"><span style="font-family:var(--mono);font-size:.68rem;color:var(--muted);width:56px">run '+r.run+'</span>'+
      '<div style="display:flex;gap:.35rem;flex-wrap:wrap">'+r.list.map(w=>{ const stable=core.includes(w); return '<span class="emb-chip" style="cursor:default;'+(stable?'border-color:'+LRC.grn+';color:'+LRC.grn:'')+'">'+w+'</span>'; }).join('')+'</div></div>'
  ).join('') + (core.length? '<div style="font-family:var(--mono);font-size:.7rem;color:'+LRC.grn+';margin-top:.5rem">stable core (in every run): '+core.join(', ')+'</div>' : '');
}

// ───────────────────────────────────────────────────────────
// 5.10 — Grand unified pipeline (clickable nodes)
// ───────────────────────────────────────────────────────────
const RECAP_NODES = [
  { id:'txt', lab:'raw text', sec:null, col:LRC.muted },
  { id:'cooc', lab:'co-occurrence', sec:'countemb', col:LRC.acc },
  { id:'sparse', lab:'sparse vector', sec:'countemb', col:LRC.acc },
  { id:'train', lab:'skip-gram', sec:'word2vec', col:LRC.amb },
  { id:'dense', lab:'dense embedding', sec:'word2vec', col:LRC.grn },
  { id:'use', lab:'cosine / analogy / t-SNE', sec:'sempr', col:LRC.pur }
];
let _embRecap = { hover:null };
function embRecapInit(){
  _embRecap = { hover:null };
  const host = lrEl('emb-recap'); if(!host) return;
  host.innerHTML =
    '<canvas id="emb-recap-cv" style="width:100%;display:block;cursor:pointer"></canvas>'+
    '<div class="lr-note" id="emb-recap-note">Click any stage to jump back to its section.</div>';
  const cv=lrEl('emb-recap-cv');
  cv.addEventListener('click', e=>{ const hit=embRecapHit(e); if(hit&&hit.sec){ openEmbSec(hit.sec); } });
  cv.addEventListener('mousemove', e=>{ const hit=embRecapHit(e); const nn=hit?hit.id:null; if(nn!==_embRecap.hover){ _embRecap.hover=nn; embRecapDraw(); if(hit) lrSet('emb-recap-note', hit.sec?'\u2192 '+hit.lab+' (click to open \u00a7'+ (EMB_SEC.find(s=>s.id===hit.sec)||{}).num +')':'the starting point: ordinary text'); } });
  embRecapDraw();
}
function embRecapLayout(W,H){
  const n=RECAP_NODES.length; const bw=W/n; const cy=H/2;
  return RECAP_NODES.map((nd,i)=>({ nd, x:bw*i+bw/2, y:cy, w:bw*0.72, h:56 }));
}
function embRecapHit(e){
  const cv=lrEl('emb-recap-cv'); if(!cv) return null; const r=cv.getBoundingClientRect();
  const x=e.clientX-r.left, y=e.clientY-r.top; const lay=embRecapLayout(r.width, cv.__H||220);
  for(const L of lay){ if(Math.abs(x-L.x)<L.w/2 && Math.abs(y-L.y)<L.h/2) return L.nd; } return null;
}
function embRecapDraw(){
  const c=lrCanvas('emb-recap-cv',220); if(!c) return;
  const {ctx,W,H}=c; c.cv.__H=H;
  const lay=embRecapLayout(W,H);
  lay.forEach((L,i)=>{
    if(i<lay.length-1){ const N=lay[i+1]; ctx.strokeStyle=LRC.grid; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(L.x+L.w/2*0.5,L.y); ctx.lineTo(N.x-N.w/2*0.5,N.y); ctx.stroke();
      ctx.fillStyle=LRC.grid; const ax=N.x-N.w/2*0.5; ctx.beginPath(); ctx.moveTo(ax,N.y); ctx.lineTo(ax-7,N.y-4); ctx.lineTo(ax-7,N.y+4); ctx.closePath(); ctx.fill(); }
  });
  lay.forEach(L=>{
    const on=_embRecap.hover===L.nd.id; const clickable=!!L.nd.sec;
    ctx.fillStyle=on?'var(--surface3)':LRC.s2; ctx.strokeStyle=L.nd.col; ctx.lineWidth=on?2.5:1.5;
    ctx.beginPath(); ctx.roundRect(L.x-L.w/2,L.y-L.h/2,L.w,L.h,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle=L.nd.col; ctx.font='700 8px IBM Plex Mono, monospace'; ctx.textAlign='center';
    const num = L.nd.sec ? '\u00a7'+((EMB_SEC.find(s=>s.id===L.nd.sec)||{}).num||'') : 'start';
    ctx.fillText(num, L.x, L.y-L.h/2+13);
    ctx.fillStyle=LRC.text; ctx.font='10px IBM Plex Mono, monospace';
    // wrap label
    const words=L.nd.lab.split(' '); let line='',yy=L.y-2;
    words.forEach(w=>{ if((line+w).length>12){ ctx.fillText(line,L.x,yy); yy+=11; line=w+' '; } else line+=w+' '; });
    ctx.fillText(line.trim(),L.x,yy);
    if(clickable){ ctx.fillStyle=L.nd.col; ctx.font='7px IBM Plex Mono, monospace'; ctx.fillText('click \u2192',L.x,L.y+L.h/2-6); }
  });
  ctx.textAlign='start';
}
