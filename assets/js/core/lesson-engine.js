// ── KATEX RENDERING ────────────────────────────────────────
// Renders all \( \) and \[ \] math inside an element using KaTeX's
// auto-render extension. Retries until the extension has finished loading.
function renderMath(el) {
  if (!el) return;
  let tries = 0;
  function go() {
    if (!el.isConnected) return;
    if (window.renderMathInElement) {
      renderMathInElement(el, {
        delimiters: [
          {left:'\\[', right:'\\]', display:true},
          {left:'\\(', right:'\\)', display:false}
        ], throwOnError:false, strict:false
      });
    } else if (++tries < 60) setTimeout(go, 100);
  }
  go();
}

// ── OPEN/CLOSE ─────────────────────────────────────────────
function openSec(id) {
  const pg = PAGES[id];
  if (!pg) return;
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if (!sv || !sb) return;
  const sec = SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if (crumb && sec) crumb.innerHTML = 'Words &amp; Tokens <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  renderMath(sb);
  mcSectionDelay(()=>{
    if (id==='words') buildHerdanViz();
    if (id==='morphs') buildMorphViz();
    if (id==='unicode') buildUnicodeViz();
    if (id==='corpora') buildCorpusViz();
    if (id==='regex') buildRegexViz();
    if (id==='practice') buildPracticeViz();
    if (id==='bpe') buildBPEViz();
    if (id==='editdist') buildEditDistViz();
  }, 250);
  sv.onscroll = () => {
    const h = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if (bar) bar.style.width = (h>0?(sv.scrollTop/h)*100:0)+'%';
  };
}

function closeSec() {
  const sv = document.getElementById('subsection-view');
  if (sv) sv.style.display = 'none';
}

// ── CHAPTER META ───────────────────────────────────────────
const chapterMeta = {
  intro:{title:"Introduction to NLP", chapter: ""},
  tokens:{title:"Words and Tokens", chapter: ""},
  ngram:{title:"N-gram Language Models", chapter: ""},
  logreg:{title:"Logistic Regression & Text Classification", chapter: ""},
  embeddings:{title:"Vector Semantics & Embeddings", chapter: ""},
  nn:{title:"Neural Networks", chapter: ""},
  llm:{title:"Large Language Models", chapter: ""},
  rnn:{title:"RNNs and LSTMs", chapter: ""},
  transformers:{title:"Transformers", chapter: ""},
  pretraining:{title:"Pre-training & Fine-tuning", chapter: ""},
  mt:{title:"Machine Translation", chapter: ""},
  qa:{title:"Question Answering", chapter: ""},
  phonetics:{title:"Phonetics & Speech Feature Extraction", chapter: ""},
  speech:{title:"Automatic Speech Recognition", chapter: ""},
  dialogue:{title:"Dialogue Systems", chapter: ""},
  parsing:{title:"Syntactic Parsing", chapter: ""},
  semantics:{title:"Semantic Analysis", chapter: ""},
  coref:{title:"Coreference Resolution", chapter: ""},
  information:{title:"Information Extraction", chapter: ""},
  ppmi:{title:"PPMI & Word Vectors", chapter: ""},
  noisy:{title:"Noisy Channel Models", chapter: ""},
  posttraining:{title:"Post-Training: RLHF & Alignment", chapter: ""},
  masked:{title:"Masked Language Models", chapter: ""},
  rag:{title:"Information Retrieval & RAG", chapter: ""},
  asr:{title:"Automatic Speech Recognition", chapter: ""},
  tts:{title:"Text-to-Speech", chapter: ""},
  pos:{title:"Sequence Labeling: POS & NER", chapter: ""},
  cfg:{title:"Context-Free Grammars & Constituency Parsing", chapter: ""},
  dep:{title:"Dependency Parsing", chapter: ""},
  ie:{title:"Information Extraction", chapter: ""},
  srl:{title:"Semantic Role Labeling", chapter: ""},
  sentiment:{title:"Lexicons for Sentiment & Affect", chapter: ""},
  discourse:{title:"Discourse Coherence", chapter: ""},
  conv:{title:"Conversation & Its Structure", chapter: ""}
};

// ── LESSONS ────────────────────────────────────────────────
const lessons = {

  intro: {
    chapter: "",
    title: "Introduction to NLP",
    content: () => `
      <div class="lesson-chapter-label">Foundations</div>
      <h1 class="lesson-h1">Introduction to NLP</h1>
      <p class="lesson-intro">Natural language processing (NLP) studies how computers work with human language. Tasks include translation, text classification, speech recognition, and generation. This course focuses on the mathematics that makes those systems work.</p>

      <h2 class="lesson-h2">What Makes Language Hard</h2>
      <p class="lesson-p">Programming languages have formal rules for parsing statements. Human language leaves much more to context. In <em>“She told her sister she was wrong,”</em> either person could be wrong. In <em>“The chicken is ready to eat,”</em> the chicken could be hungry or cooked. A useful language system has to deal with ambiguities like these.</p>
      <p class="lesson-p">Context also changes how we interpret individual words and intentions. <em>“Fine”</em> can describe something acceptable or refer to a monetary penalty; said sarcastically, it can signal displeasure. <em>“Can you pass the salt?”</em> usually functions as a request. Readers and listeners draw on shared knowledge to resolve these meanings, which makes context central to NLP.</p>
      <p class="lesson-p">The field works on this at several levels at once. Morphology covers how words are built from meaningful parts. Syntax covers how words combine into grammatical structure. Semantics covers what sentences mean. Pragmatics covers what a speaker intended beyond the literal words. Modern neural models handle much of this implicitly, without ever being taught any of it as a separate task.</p>

      <h2 class="lesson-h2">How We Got Here</h2>
      <p class="lesson-p">NLP began in the 1950s with systems built entirely from hand-written rules. The Georgetown-IBM experiment in 1954 translated 60 Russian sentences into English automatically, and its authors predicted machine translation would be fully solved within three to five years. It was not. Rule-based systems worked reasonably well in narrow, controlled domains, but they were fragile and could not scale.</p>
      <p class="lesson-p">The field shifted in the 1980s and 1990s toward <strong>statistical methods</strong>. Instead of writing rules, researchers learned probability distributions over text from large corpora. N-gram language models estimated how likely a word was given the previous few words. These approaches were more robust and general, and they scaled much better with data.</p>
      <p class="lesson-p">In the 2010s, <strong>neural networks</strong> shifted the field again. Word embeddings showed that a network trained on raw text learns vector representations where meaning is encoded geometrically: words used in similar contexts end up close together in the vector space, and relationships like singular/plural or present/past appear as consistent directions you can do arithmetic on. Then in 2017 the transformer architecture put self-attention at the center of a sequence model, which made training parallelizable enough to run on internet-scale datasets. The models in use today descend directly from that change.</p>

      <h2 class="lesson-h2">What NLP Systems Actually Do</h2>
      <p class="lesson-p"><strong>Classification tasks</strong> take text as input and output a label: is this review positive or negative, is this email spam, does this sentence logically follow from that one. <strong>Sequence labeling tasks</strong> assign a label to every single token: which words are named entities, what part of speech is each word. <strong>Structured prediction tasks</strong> produce complex outputs like parse trees or semantic graphs. <strong>Generation tasks</strong> produce new text: translating between languages, summarizing a document, answering a question, continuing a conversation.</p>

      <h2 class="lesson-h2">Why the Math Matters</h2>
      <p class="lesson-p">The mathematics gives us a way to describe and test these systems. Language models assign probabilities to token sequences. Embeddings represent words or tokens as vectors. Attention combines value vectors using weights computed from queries and keys. Dynamic programming reuses solutions to smaller problems in tasks such as alignment and parsing.</p>
      <p class="lesson-p">The lessons build these ideas through derivations and examples. The aim is to help you reason about a model’s behavior and understand what changes when you alter it.</p>

      <div class="lesson-note">
        <div class="lesson-note-label">The Bitter Lesson</div>
        <p>In his 2019 essay <em>The Bitter Lesson</em>, Rich Sutton argues that general methods which benefit from more computation, especially search and learning, have driven much of AI’s long-term progress. The essay motivates a question that runs through this course: which parts of a method continue to improve as data and computation grow?</p>
      </div>
    `
  },

  tokens: {
    chapter: "",
    title: "Words and Tokens",
    content: () => buildTokensOverview()
  },

  ngram: { chapter: "", title: "N-gram Language Models", content: () => buildNgramOverview() },
  logreg: { chapter: "", title: "Logistic Regression", content: () => buildLogregOverview() },
  embeddings: { chapter: "", title: "Vector Semantics & Embeddings", content: () => buildEmbOverview() },
  nn: { chapter: "", title: "Neural Networks", content: () => buildNNOverview() },
  llm: { chapter: "", title: "Large Language Models", content: () => buildLLMOverview() },
  rnn: { chapter: "", title: "RNNs and LSTMs", content: () => buildRNOverview() },
  transformers: { chapter: "", title: "Transformers", content: () => buildTXOverview() },
  posttraining: { chapter: "", title: "Post-Training: RLHF & Alignment", content: () => buildPTOverview() },
  masked: { chapter: "", title: "Masked Language Models", content: () => buildMLOverview() },
  rag: { chapter: "", title: "Information Retrieval & RAG", content: () => buildIROverview() },
  pretraining: { chapter: "", title: "Pre-training & Fine-tuning", content: () => defaultLesson('pretraining','Pre-training & Fine-tuning') },
  mt: { chapter: "", title: "Machine Translation", content: () => buildMTOverview() },
  qa: { chapter: "", title: "Question Answering", content: () => defaultLesson('qa','Question Answering') },
  phonetics: { chapter: "", title: "Phonetics & Speech Feature Extraction", content: () => buildPHOverview() },
  asr: { chapter: "", title: "Automatic Speech Recognition", content: () => buildASROverview() },
  tts: { chapter: "", title: "Text-to-Speech", content: () => buildTTSOverview() },
  speech: { chapter: "", title: "Automatic Speech Recognition", content: () => defaultLesson('speech','Automatic Speech Recognition') },
  dialogue: { chapter: "", title: "Dialogue Systems", content: () => defaultLesson('dialogue','Dialogue Systems') },
  parsing: { chapter: "", title: "Syntactic Parsing", content: () => defaultLesson('parsing','Syntactic Parsing') },
  semantics: { chapter: "", title: "Semantic Analysis", content: () => defaultLesson('semantics','Semantic Analysis') },
  coref: { chapter: "", title: "Coreference Resolution", content: () => defaultLesson('coref','Coreference Resolution') },
  information: { chapter: "", title: "Information Extraction", content: () => defaultLesson('information','Information Extraction') },
  ppmi: { chapter: "", title: "PPMI & Word Vectors", content: () => defaultLesson('ppmi','PPMI & Word Vectors') },
  noisy: { chapter: "", title: "Noisy Channel Models", content: () => defaultLesson('noisy','Noisy Channel Models') }
};

function defaultLesson(id, title) {
  return `
    <h1 class="lesson-h1">${title}</h1>
    <p class="lesson-intro">This lesson is still in development. Browse the curriculum for completed lessons and interactive examples.</p>
    <div style="margin-top:3rem;padding:2rem;background:var(--surface2);border-radius:14px;border:1px solid var(--border);text-align:center">
      <div style="font-family:var(--mono);font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-bottom:.75rem">Status</div>
      <div style="font-family:var(--display);font-size:2rem;letter-spacing:.1em;color:var(--muted)">In Development</div>
    </div>`;
}

// ── LESSON OPEN/CLOSE ──────────────────────────────────────
function openLesson(id) {
  const meta = chapterMeta[id] || {title: id, chapter: ""};
  document.getElementById("lesson-title-nav").textContent = meta.title;
  const lv = document.getElementById("lesson-view");
  const lb = document.getElementById("lesson-body");
  const hv = document.getElementById("home-view");
  lv.style.display = "block";
  hv.style.display = "none";
  lv.scrollTop = 0;
  const lessonData = lessons[id];
  if (lessonData) {
    lb.innerHTML = lessonData.content();
  } else {
    lb.innerHTML = defaultLesson(id, meta.title);
  }
  renderMath(lb);
  setTimeout(() => {
    if (id === 'bpe') buildBPEViz();
  }, 200);
  lv.onscroll = () => {
    const h = lv.scrollHeight - lv.clientHeight;
    document.getElementById("lesson-progress").style.width = (h>0?(lv.scrollTop/h)*100:0)+"%";
  };
}

function closeLesson() {
  document.getElementById("lesson-view").style.display = "none";
  document.getElementById("home-view").style.display = "block";
  document.getElementById("lesson-progress").style.width = "0%";
  const sv = document.getElementById('subsection-view');
  if (sv) sv.style.display = 'none';
}

function showHome() { closeLesson(); }

// ── QUIZ ───────────────────────────────────────────────────
function checkQuiz(btn, correct, quizId, explanation) {
  const block = document.getElementById(quizId);
  if (!block || block.dataset.answered) return;
  const exp = document.getElementById(quizId + '-explain');
  if (correct) {
    block.dataset.answered = '1';
    const btns = block.querySelectorAll('.quiz-opt-btn');
    btns.forEach(b => { b.disabled = true; b.style.cursor = 'default'; if (b !== btn && !b.dataset.tried) b.style.opacity = '.5'; });
    btn.style.opacity = '1';
    btn.style.background = 'rgba(61,220,132,0.15)';
    btn.style.borderColor = 'rgba(61,220,132,0.4)';
    btn.style.color = 'var(--accent4)';
    if (exp) { exp.textContent = explanation; exp.style.display = 'block'; exp.style.marginTop = '.75rem'; exp.style.padding = '.75rem 1rem'; exp.style.background = 'var(--surface2)'; exp.style.borderRadius = '8px'; exp.style.fontSize = '.82rem'; exp.style.color = 'var(--muted)'; exp.style.borderLeft = '2px solid var(--accent4)'; }
  } else {
    // wrong: mark only this option, keep the rest active so the user can try again
    btn.dataset.tried = '1';
    btn.disabled = true;
    btn.style.cursor = 'default';
    btn.style.opacity = '.6';
    btn.style.background = 'rgba(255,95,142,0.12)';
    btn.style.borderColor = 'rgba(255,95,142,0.35)';
    btn.style.color = 'var(--accent3)';
    if (exp) { exp.textContent = explanation + '  (Try again.)'; exp.style.display = 'block'; exp.style.marginTop = '.75rem'; exp.style.padding = '.75rem 1rem'; exp.style.background = 'var(--surface2)'; exp.style.borderRadius = '8px'; exp.style.fontSize = '.82rem'; exp.style.color = 'var(--muted)'; exp.style.borderLeft = '2px solid var(--accent3)'; }
  }
}

// ── HOME NAVIGATION ────────────────────────────────────────
function scrollToCurriculum() {
  document.getElementById("curriculum").scrollIntoView({ behavior: "smooth" });
}
