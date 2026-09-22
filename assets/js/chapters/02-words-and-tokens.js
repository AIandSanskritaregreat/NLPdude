// ── SECTION CARDS ──────────────────────────────────────────
const SEC = [
  {id:'words',   num:'2.1',     title:'Words',                   icon:'W', desc:"Types vs instances, Herdan's Law, disfluencies.",         tags:["Herdan's Law",'word types','corpora']},
  {id:'morphs',  num:'2.2',     title:'Morphemes',               icon:'M', desc:'Minimal meaning units. Roots, inflectional vs derivational, typology.', tags:['inflectional','derivational','typology']},
  {id:'unicode', num:'2.3',     title:'Unicode & UTF-8',         icon:'U', desc:'Code points for every script. Variable-length UTF-8 encoding.',         tags:['code points','UTF-8 bit patterns']},
  {id:'bpe',     num:'2.4',     title:'Byte-Pair Encoding',      icon:'B', desc:'Learn subword tokens by merging frequent adjacent pairs.',         tags:['BPE training','BPE encoder','SuperBPE']},
  {id:'corpora', num:'2.5',     title:'Corpora',                 icon:'C', desc:'Language is situated. Genre, dialect, code-switching.',                  tags:['language variation','datasheets']},
  {id:'regex',   num:'2.6',     title:'Regular Expressions',     icon:'R', desc:'Formal language for text pattern-matching.',                             tags:['disjunction','counters','lookahead']},
  {id:'practice',num:'2.7-2.8', title:'Tokenization in Practice',icon:'T', desc:'Unix tools, Penn Treebank, sentence segmentation.',                     tags:['Unix pipeline','Penn Treebank']},
  {id:'editdist',num:'2.9',     title:'Minimum Edit Distance',   icon:'D', desc:'Quantifying string similarity via dynamic programming.',                 tags:['Levenshtein','DP recurrence','backtrace']}
];

function buildTokensOverview(){
  const cards = SEC.map(s=>`
    <div class="sc-card" onclick="openSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Foundations of NLP</div>
    <h1 class="lesson-h1">Words and Tokens</h1>
    <p class="lesson-intro">How should a model split text into useful units? Explore words, morphemes, encodings, and tokenizers, then try the examples and exercises.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">Words and morphemes are useful but hard to define formally across languages.</div>
        <div class="ch-sum-item">Unicode identifies encoded characters with code points; UTF-8 stores them as variable-length byte sequences.</div>
        <div class="ch-sum-item">BPE learns reusable text pieces by merging frequent adjacent symbols.</div>
        <div class="ch-sum-item">Regular expressions provide a formal algebraic language for specifying text patterns.</div>
        <div class="ch-sum-item">Minimum edit distance quantifies string similarity via dynamic programming, enabling sequence alignment.</div>
      </div>
    </div>`;
}

// ── SUBSECTION PAGES ────────────────────────────────────────
const PAGES = {};

PAGES.words = `
<div class="lesson-chapter-label">Section 2.1</div>
<h1 class="lesson-h1">Words</h1>
<p class="lesson-intro">Counting words sounds straightforward until you try it on contractions, speech, or multilingual text. This section looks at what to count and how vocabulary grows as you read more.</p>
<p class="lesson-p">What counts as a word seems obvious until you try to define it precisely. You can read a sentence and count its words without effort, but writing down the exact rule a computer could follow to do the same thing is surprisingly difficult.</p>
<p class="lesson-p">The simplest rule is to split text on spaces, but it breaks down quickly. Is <em>don't</em> one word or two? It means <em>do</em> and <em>not</em>, but has no space inside it. Is <em>New York</em> one word or two? It is two space-separated pieces but one place. The same problem appears with <em>ice cream</em>, hashtags like <em>#nlp</em>, URLs, and emoji. Spoken language is harder still. In <em>"I uh I mean the the dog,"</em> it is unclear whether <em>uh</em> and the repeated <em>the</em> should count as words or be removed. The right choice depends on the application.</p>
<p class="lesson-p">Tokenization determines which units a language model works with. Merging, splitting, or removing text changes the vocabulary and the patterns the model can learn. We will start by defining the units we count.</p>
<p class="lesson-p">A good place to start is the difference between word types and word instances.</p>
<h2 class="lesson-h2">Types vs. Instances</h2>
<p class="lesson-p">Sentence: <em>"A rose is a rose is a rose."</em> - 8 instances, 3 distinct types (<em>a</em> and <em>rose</em> each appear 3 times, <em>is</em> twice).</p>
<div class="lesson-math">\\[|V| = \\text{number of distinct word types (vocabulary size)}\\]</div>
<div class="lesson-math">\\[N = \\text{total running word instances (corpus length)}\\]</div>
<p class="lesson-p">As you read more text, familiar words repeat and new ones appear. The relationship between text length and vocabulary size is often approximated by a power law.</p>
<h2 class="lesson-h2">Herdan's Law</h2>
<p class="lesson-p">Larger samples of a corpus usually contain more distinct word types. Herdan’s Law describes this growth approximately:</p>
<div class="lesson-math">\\[\\boxed{|V| = k N^{\\beta}}\\]</div>
<p class="lesson-p">Here \\(k>0\\) and \\(0<\\beta<1\\). Values near \\(\\beta=0.5\\) are common examples: vocabulary then grows roughly with the square root of corpus size. The fitted exponent depends on the corpus, tokenizer, and range of text lengths.</p>
<div style="overflow-x:auto;margin:1.5rem 0"><table style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:.78rem">
<tr style="border-bottom:1px solid var(--border2)"><th style="text-align:left;padding:.5rem .75rem;color:var(--muted);font-weight:400">Corpus</th><th style="text-align:right;padding:.5rem .75rem;color:var(--muted);font-weight:400">Types |V|</th><th style="text-align:right;padding:.5rem .75rem;color:var(--muted);font-weight:400">Instances N</th></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:.45rem .75rem;color:var(--text)">Shakespeare</td><td style="text-align:right;padding:.45rem .75rem;color:var(--accent)">31,000</td><td style="text-align:right;padding:.45rem .75rem;color:var(--muted)">884,000</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:.45rem .75rem;color:var(--text)">Brown Corpus</td><td style="text-align:right;padding:.45rem .75rem;color:var(--accent)">38,000</td><td style="text-align:right;padding:.45rem .75rem;color:var(--muted)">1,000,000</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:.45rem .75rem;color:var(--text)">COCA</td><td style="text-align:right;padding:.45rem .75rem;color:var(--accent)">2,000,000</td><td style="text-align:right;padding:.45rem .75rem;color:var(--muted)">440,000,000</td></tr>
<tr><td style="padding:.45rem .75rem;color:var(--text)">Google n-grams</td><td style="text-align:right;padding:.45rem .75rem;color:var(--accent)">13,000,000+</td><td style="text-align:right;padding:.45rem .75rem;color:var(--muted)">1,000,000,000,000</td></tr>
</table></div>
<p class="lesson-p" style="font-size:.9rem;color:var(--muted)">The counts are rounded examples from different corpora and editions. Vocabulary size depends on tokenization, case handling, and whether numbers and punctuation count as types.</p>
<p class="lesson-p" style="font-size:.9rem;color:var(--muted)">Herdan’s Law describes growth <em>within one corpus</em>. These rows show scale, but their ratios cannot estimate a shared exponent: the texts differ in genre, date, and collection method. Use the simulator below to fit a curve to a single text.</p>
<p class="lesson-p"><strong>Consequence:</strong> a fixed word vocabulary can encounter unfamiliar words in new text. This is the <strong>unknown word problem</strong>.</p>
<h2 class="lesson-h2">Function Words vs. Content Words</h2>
<p class="lesson-p">Vocabulary keeps growing because words fall into two groups that behave very differently.</p>
<p class="lesson-p"><strong>Function words</strong>, such as <em>the</em>, <em>of</em>, <em>and</em>, and <em>to</em>, mainly express grammatical relationships. They belong to relatively small, stable classes, so many recur early in a corpus.</p>
<p class="lesson-p"><strong>Content words</strong> include nouns, main verbs, adjectives, and many adverbs. New names, technical terms, and other words keep entering these <strong>open classes</strong>, contributing to vocabulary growth.</p>
<p class="lesson-p">Common function words and content words appear early and then repeat. Rarer words arrive less often, so the rate of vocabulary growth tends to slow as the sample gets larger.</p>
<h2 class="lesson-h2">The Shape of the Curve</h2>
<p class="lesson-p">On a graph with the number of words read on the horizontal axis and vocabulary size on the vertical axis, the early stage looks almost like a straight diagonal line, because nearly every word is new. As common words start to repeat, each new word is less likely to be one you have not seen, so the line flattens into a curve shaped like a square root.</p>
<p class="lesson-p">The exponent &beta; controls the curve. At &beta; = 1, vocabulary grows linearly; at &beta; = 0.5, it grows with the square root of text length. Try the slider to compare these shapes. The shaded band marks an illustrative range around 0.5, not a universal bound for language.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Interactive - How &beta; bends the V vs N curve</span></div><div class="viz-body" id="herdan-beta-viz"></div></div>
<h2 class="lesson-h2">Two Slopes, Not One</h2>
<p class="lesson-p">A single exponent is a simplification. When vocabulary is plotted against corpus size on log-log axes, where a power law appears as a straight line with slope &beta;, the data often does not form one straight line. It forms two: a steeper line at the start, a gentler line later, and a bend (called a knee) between them. For this reason, researchers sometimes fit two exponents instead of one, which is called a broken power law.</p>
<p class="lesson-p">A change in slope can reflect a shift from frequent words to rarer vocabulary, as well as the corpus’s mix of topics and sources. The exponents and the location of the knee vary. A two-slope fit is a description of that pattern, not proof of a single linguistic cause.</p>
<p class="lesson-p">On log-log axes the two stages are easy to see. Use the sliders below to set the two slopes and see where the steep early line meets the gentler late line, and how a single straight fit (the dashed line) misses the bend.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Interactive - The two-slope (broken power law) fit</span></div><div class="viz-body" id="herdan-twobeta-viz"></div></div>
<h2 class="lesson-h2">Measure It Yourself</h2>
<p class="lesson-p">You can run Herdan's Law on your own text. Paste any text below, such as a paragraph, a chapter, or your own writing. The tool reads it one word at a time, tracks the running word count N and vocabulary size |V|, and plots how they grow together (the cyan curve). It then fits Herdan's Law to the text to estimate its k and &beta;, shown as the dashed line. Longer and more varied text gives a more reliable fit. Use the full-screen button for more room.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Interactive - Herdan's Law simulator</span></div><div class="viz-body" id="herdan-sim-viz"></div></div>
<div class="lesson-note"><div class="lesson-note-label">Two Growth Phases</div><p>Common words appear early and recur often; rarer words continue to add new types. The fitted exponent \\(\\beta\\) can change with corpus size and composition.</p></div>
<div class="quiz-block" id="qw1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">With \\(\\beta=0.5\\), if a corpus grows from 1M to 4M words, vocabulary grows by a factor of:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qw1','4x needs beta=1 (linear).')">4&times;</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qw1','Correct! k(4N)^0.5 / kN^0.5 = sqrt(4) = 2.')">2&times;</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qw1','sqrt(4)=2, not sqrt(2).')">\\(\\sqrt{2}\\)&times;</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qw1','Content words keep appearing.')">No change</button>
</div><div class="quiz-explain" id="qw1-explain"></div></div>`;

PAGES.morphs = `
<div class="lesson-chapter-label">Section 2.2</div>
<h1 class="lesson-h1">Morphemes: Parts of Words</h1>
<p class="lesson-intro">Words have internal structure. Morphology is the study of the smallest meaning-bearing pieces inside a word, and it explains why tokenization is difficult across languages.</p>
<p class="lesson-p">In the last section we treated each word as the smallest unit. That is not quite right. Many words are built from smaller pieces, and each piece adds meaning. The word <em>unhappiness</em> is made of three of them: <em>un-</em> means "not", <em>happy</em> is the core, and <em>-ness</em> turns it into a noun. You were never taught these pieces as separate words, but you can still understand a word you have never seen, like <em>unfriendliness</em>, because you read it in parts.</p>
<p class="lesson-p">Each of these pieces is a <strong>morpheme</strong>. A morpheme is the smallest part of a word that still has a meaning. Cut it any smaller and you are left with sounds that mean nothing. <em>Cat</em> is one morpheme. <em>Cats</em> is two: <em>cat</em>, plus <em>-s</em> meaning "more than one".</p>
<p class="lesson-p">How many morphemes a word has depends on the language. English uses very few, so most English words have one or two. Other languages put many morphemes in a single word. The Turkish word <em>evlerinizden</em> means "from your houses" in one word: house + plural + your + from. This is why tokenization is hard. A method that works for English can fail on a language that builds words in a different way, and many of the world's languages do.</p>
<h2 class="lesson-h2">Roots, Affixes, and Clitics</h2>
<p class="lesson-p">Every word is built from a few basic kinds of morpheme.</p>
<div class="def-list">
<div class="def-row"><span class="def-term">Root</span><span class="def-text">The core part of a word that carries its main meaning and can usually stand on its own. In <em>cats</em>, the root is <em>cat</em>.</span></div>
<div class="def-row"><span class="def-term">Affix</span><span class="def-text">A piece added to a root to change its meaning or grammar. It cannot stand alone. A <strong>prefix</strong> goes before the root (<em>un-</em> in <em>unkind</em>); a <strong>suffix</strong> goes after it (<em>-s</em> in <em>cats</em>).</span></div>
<div class="def-row"><span class="def-term">Clitic</span><span class="def-text">A small word that cannot stand on its own and leans on another word, even though it acts like a separate word. The <em>n't</em> in <em>can't</em> and the <em>'s</em> in <em>she's</em> are clitics.</span></div>
</div>
<h2 class="lesson-h2">Two Kinds of Affixes</h2>
<p class="lesson-p">Affixes come in two types, and the difference matters for how words are formed.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:1.5rem 0">
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1.25rem"><div style="font-family:var(--mono);font-size:.65rem;color:var(--accent);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.6rem">Inflectional</div><p style="font-size:.85rem;color:var(--text);line-height:1.7;font-weight:300">Mark grammatical properties. Productive and predictable.<br><br><em>walk + -ed</em> &rarr; past tense<br><em>cat + -s</em> &rarr; plural</p></div>
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1.25rem"><div style="font-family:var(--mono);font-size:.65rem;color:var(--accent2);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.6rem">Derivational</div><p style="font-size:.85rem;color:var(--text);line-height:1.7;font-weight:300">Create new words, often shifting grammatical class.<br><br><em>care</em> (noun) &rarr; <em>careful</em> (adj)<br><em>careful</em> &rarr; <em>carefully</em> (adv)</p></div></div>
<div style="display:flex;align-items:center;justify-content:center;gap:1.5rem;padding:1.75rem;background:var(--surface2);border-radius:12px;margin:1.5rem 0;flex-wrap:wrap">
<div style="text-align:center"><div style="font-size:1.5rem;font-weight:700;color:var(--text)">care</div><div style="font-family:var(--mono);font-size:.68rem;color:var(--muted);margin-top:.3rem">noun</div></div>
<div style="text-align:center"><div style="font-family:var(--mono);font-size:.72rem;color:var(--accent);margin-bottom:.15rem">+ -ful</div><div style="font-size:1.3rem;color:var(--muted)">&rarr;</div></div>
<div style="text-align:center"><div style="font-size:1.5rem;font-weight:700;color:var(--text)">careful</div><div style="font-family:var(--mono);font-size:.68rem;color:var(--muted);margin-top:.3rem">adjective</div></div>
<div style="text-align:center"><div style="font-family:var(--mono);font-size:.72rem;color:var(--accent);margin-bottom:.15rem">+ -ly</div><div style="font-size:1.3rem;color:var(--muted)">&rarr;</div></div>
<div style="text-align:center"><div style="font-size:1.5rem;font-weight:700;color:var(--text)">carefully</div><div style="font-family:var(--mono);font-size:.68rem;color:var(--muted);margin-top:.3rem">adverb</div></div>
</div>
<h2 class="lesson-h2">How Languages Build Words</h2>
<p class="lesson-p">Languages differ a lot in how many morphemes they pack into a word. The clearest way to compare them is the average number of morphemes per word.</p>
<div class="def-list">
<div class="def-row"><span class="def-term">Morphemes per word</span><span class="def-text">The average number of morphemes in each word of a text. This single number is the simplest way to compare how languages build words.</span></div>
<div class="def-row"><span class="def-term">Isolating</span><span class="def-text">Words are usually a single morpheme, so the average is close to 1. Chinese and Vietnamese are mostly isolating.</span></div>
<div class="def-row"><span class="def-term">Synthetic</span><span class="def-text">Words are built from several morphemes. Most affix-heavy languages are synthetic. English is mildly synthetic.</span></div>
<div class="def-row"><span class="def-term">Agglutinative</span><span class="def-text">A synthetic type where each morpheme stays separate and keeps one clear meaning, stacked in a row. Turkish, Finnish, and Japanese work this way.</span></div>
<div class="def-row"><span class="def-term">Fusional</span><span class="def-text">A synthetic type where one affix carries several meanings at once, so the pieces cannot be cleanly separated. Spanish and Russian are fusional. The English <em>-s</em> in <em>she reads</em> marks third person, singular, and present tense all at once.</span></div>
<div class="def-row"><span class="def-term">Polysynthetic</span><span class="def-text">An extreme synthetic type where one word can express what English needs a whole sentence for. Inuktitut and many Indigenous American languages are polysynthetic.</span></div>
</div>
<h2 class="lesson-h2">Break a Sentence Into Morphemes</h2>
<p class="lesson-p">Type any English sentence and the tool below splits each word into its morphemes, labels them, and reports the average number of morphemes per word. It uses simple rules instead of a full dictionary, so it is approximate, but it shows the idea. Press full screen for more room.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Interactive - Morpheme analyzer</span></div><div class="viz-body" id="morph-viz"></div></div>
<div class="quiz-block" id="qm1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">English <em>-s</em> in "she reads" simultaneously encodes 3rd-person singular AND present tense - inseparable. This morphology type is:</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qm1','Agglutinative means clean, separable boundaries.')">Agglutinative</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qm1','Correct! Fusion: one affix conflates multiple grammatical categories that cannot be split.')">Fusion (fusional morphology)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qm1','Isolating means roughly 1 morpheme per word.')">Isolating</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qm1','Derivational morphemes create new words.')">Derivational</button>
</div><div class="quiz-explain" id="qm1-explain"></div></div>`;

PAGES.unicode = `
<div class="lesson-chapter-label">Section 2.3</div>
<h1 class="lesson-h1">Unicode &amp; UTF-8</h1>
<p class="lesson-intro">Unicode provides a shared way to identify text characters. UTF-8 specifies how to store those code points as bytes. The distinction matters when a tokenizer works across languages.</p>
<p class="lesson-p">Computers store text as numbers. Every character a program handles, including letters, digits, symbols, and emoji, is represented internally as an integer, and that integer is turned back into a glyph when the text is displayed. For many years there was no single agreed way to do this. Different systems used different numbering schemes, so the same byte could mean one character on one computer and a different character on another, and text often arrived corrupted when moved between machines. Garbled output such as <em>cafÃ©</em> in place of <em>café</em> is a symptom of an encoding being read with the wrong scheme.</p>
<p class="lesson-p">Unicode assigns code points to encoded characters. For example, <em>A</em> is U+0041 and <em>Δ</em> is U+0394. A visible character can also combine several code points: an accented letter may use a base letter plus a combining mark, and many emoji use sequences. Code points identify text components; they do not always correspond one-to-one with what you see on screen.</p>
<p class="lesson-p">An encoding determines how code points are stored. UTF-8 uses one to four bytes per Unicode scalar value: ASCII characters use one byte, while other code points need more. Its byte patterns distinguish leading bytes from continuation bytes, and ASCII text is already valid UTF-8.</p>
<p class="lesson-p">Byte-level tokenizers work with UTF-8 bytes. Starting with all 256 byte values lets them represent valid text in any script, even when a character was absent from training. The tools below trace text through code points and encodings.</p>
<h2 class="lesson-h2">ASCII: The First Encoding</h2>
<p class="lesson-p">ASCII is a 7-bit code with values from 0 to 127, commonly stored in one byte. It includes unaccented Latin letters, digits, punctuation, and control characters. The converter below shows decimal, hexadecimal, and binary values. Characters outside ASCII, such as <em>é</em>, are marked in red.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Model 1 - ASCII converter</span></div><div class="viz-body" id="ascii-viz"></div></div>
<h2 class="lesson-h2">Code Points</h2>
<p class="lesson-p">Unicode assigns a unique integer - a <strong>code point</strong> - to every character across all scripts. Written U+XXXX in hex. Unicode 16.0: 150,000+ characters, 168 scripts.</p>
<div style="display:flex;flex-wrap:wrap;gap:.55rem;margin:1.4rem 0">
<span style="display:inline-flex;align-items:baseline;gap:.5rem;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.45rem .8rem"><code style="font-family:var(--mono);font-size:.78rem;color:var(--muted)">U+0041</code><span style="color:var(--border2)">&rarr;</span><span style="font-size:1.05rem;color:var(--accent)">A</span></span>
<span style="display:inline-flex;align-items:baseline;gap:.5rem;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.45rem .8rem"><code style="font-family:var(--mono);font-size:.78rem;color:var(--muted)">U+0394</code><span style="color:var(--border2)">&rarr;</span><span style="font-size:1.05rem;color:var(--accent)">&Delta;</span></span>
<span style="display:inline-flex;align-items:baseline;gap:.5rem;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.45rem .8rem"><code style="font-family:var(--mono);font-size:.78rem;color:var(--muted)">U+4E2D</code><span style="color:var(--border2)">&rarr;</span><span style="font-size:1.05rem;color:var(--accent)">&#20013;</span></span>
<span style="display:inline-flex;align-items:baseline;gap:.5rem;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.45rem .8rem"><code style="font-family:var(--mono);font-size:.78rem;color:var(--muted)">U+1F600</code><span style="color:var(--border2)">&rarr;</span><span style="font-size:1.05rem">&#x1F600;</span></span>
</div>
<h2 class="lesson-h2">Text to Code Points</h2>
<p class="lesson-p">Unicode covers a much wider range of characters than ASCII. The converter below shows their code points in U+ notation. Try accented letters, Chinese characters, and emoji, and notice when a visible symbol contains more than one code point.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Model 2 - Unicode code points</span></div><div class="viz-body" id="cp-viz"></div></div>
<h2 class="lesson-h2">UTF-8 Encoding</h2>
<div style="overflow-x:auto;margin:1.5rem 0"><table style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:.75rem">
<tr style="border-bottom:1px solid var(--border2)"><th style="text-align:left;padding:.5rem .75rem;color:var(--muted);font-weight:400">Range</th><th style="text-align:center;padding:.5rem .75rem;color:var(--muted);font-weight:400">Bytes</th><th style="text-align:left;padding:.5rem .75rem;color:var(--muted);font-weight:400">Bit pattern</th><th style="text-align:left;padding:.5rem .75rem;color:var(--muted);font-weight:400">Examples</th></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:.5rem .75rem;color:var(--text)">U+0000-U+007F</td><td style="text-align:center;padding:.5rem .75rem;color:var(--accent)">1</td><td style="padding:.5rem .75rem;color:var(--muted)">0xxxxxxx</td><td style="padding:.5rem .75rem;color:var(--text)">a, b, 1, !</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:.5rem .75rem;color:var(--text)">U+0080-U+07FF</td><td style="text-align:center;padding:.5rem .75rem;color:var(--accent)">2</td><td style="padding:.5rem .75rem;color:var(--muted)">110yyyyy 10xxxxxx</td><td style="padding:.5rem .75rem;color:var(--text)">&eacute;, &ntilde;, Arabic</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:.5rem .75rem;color:var(--text)">U+0800-U+FFFF</td><td style="text-align:center;padding:.5rem .75rem;color:var(--accent)">3</td><td style="padding:.5rem .75rem;color:var(--muted)">1110zzzz 10yyyyyy 10xxxxxx</td><td style="padding:.5rem .75rem;color:var(--text)">&#20013;, &#26085;, Devanagari</td></tr>
<tr><td style="padding:.5rem .75rem;color:var(--text)">U+10000-U+10FFFF</td><td style="text-align:center;padding:.5rem .75rem;color:var(--accent)">4</td><td style="padding:.5rem .75rem;color:var(--muted)">11110uuu 10uuzzzz...</td><td style="padding:.5rem .75rem;color:var(--text)">&#x1F600;, rare CJK</td></tr>
</table></div>
<h2 class="lesson-h2">UTF-8 vs UTF-16 vs UTF-32</h2>
<p class="lesson-p">UTF-8 uses one to four bytes per Unicode scalar value, UTF-16 uses two or four, and UTF-32 uses four. A visible character may contain several such values. The tool below compares the encodings and separates UTF-8’s structural bits from its payload bits.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Model 3 - UTF-8 / UTF-16 / UTF-32</span></div><div class="viz-body" id="utf-viz"></div></div>
<div class="quiz-block" id="qu1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">&#xF1; (n-tilde) has code point U+00F1 = 241 decimal. How many UTF-8 bytes?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qu1','1 byte only covers 0-127.')">1 byte</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qu1','Correct! U+00F1 falls in U+0080-U+07FF, 2 bytes.')">2 bytes</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qu1','3 bytes is for U+0800-U+FFFF (CJK).')">3 bytes</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qu1','4 bytes is only for U+10000+.')">4 bytes</button>
</div><div class="quiz-explain" id="qu1-explain"></div></div>`;

PAGES.bpe = `
<div class="lesson-chapter-label">Section 2.4</div>
<h1 class="lesson-h1">Byte-Pair Encoding (BPE)</h1>
<p class="lesson-intro">Byte-pair encoding (BPE) learns a vocabulary of reusable text pieces. Frequent sequences can become single tokens; less familiar words split into smaller pieces.</p>
<p class="lesson-p">A fixed list of whole words cannot handle new input. The first time a model sees a word that is not on its list, such as a new product name or a typo, it must replace the entire word with a single unknown token, and the meaning inside the word is lost. Making the list larger does not solve this, because by Herdan's Law new words keep appearing.</p>
<p class="lesson-p">Using single characters avoids unknown tokens, since any word can be spelled out, but it makes sequences very long and forces the model to rebuild common words from letters every time. BPE sits between these two options. It keeps frequent pieces whole and splits rare pieces into smaller units it has seen before. The word <em>the</em> becomes one token, while a rare word breaks into a few familiar parts.</p>
<p class="lesson-p"><strong>Byte-Pair Encoding</strong> learns these pieces from data. It begins with individual characters or bytes and repeatedly finds the most frequent pair of adjacent symbols, then merges that pair into a new symbol. Frequent pairs such as <em>t</em> and <em>h</em> merge early into <em>th</em>, and then <em>th</em> and <em>e</em> merge into <em>the</em>. After enough rounds, frequent words are single tokens while rare words remain split into parts. BPE was originally a data-compression method from 1994 and was later adapted for tokenization.</p>
<h2 class="lesson-h2">The Two Phases: Training and Encoding</h2>
<p class="lesson-p">BPE has two phases. Training runs once and produces a vocabulary and an ordered list of merge rules. Encoding uses those rules to turn any new text into token IDs. Before either phase the text is pre-tokenized: it is split into words, and each word is turned into a sequence of bytes or characters, which become the starting symbols. The diagram below shows both phases.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization 1 - Trainer and encoder overview</span></div><div class="viz-body" id="bpe-overview"></div></div>
<h2 class="lesson-h2">2.4.1 BPE Training</h2>
<div class="lesson-math">\\[V_0 = \\Sigma \\quad \\text{(all unique characters)}\\]</div>
<div class="lesson-math">\\[\\text{for } i=1 \\text{ to } k:\\quad(t_L^*, t_R^*)=\\underset{(t_L,\\,t_R)}{\\arg\\max}\\,\\text{count}(t_L,t_R) \\quad \\Rightarrow \\quad V\\leftarrow V\\cup\\{t_L^*t_R^*\\}\\]</div>
<p class="lesson-p">After \\(k\\) merges, \\(|V|=|\\Sigma|+k\\). For scale: GPT-2 used about 50,000 tokens, GPT-4 (the <code>cl100k_base</code> tokenizer) about 100,000, and GPT-4o (<code>o200k_base</code>) about 200,000.</p>
<p class="lesson-p">The model below trains BPE on a corpus you choose. It shows the starting vocabulary, counts every adjacent pair at each step, merges the most frequent one, and appends the new token to the vocabulary. Step through it or press Auto.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization 2 - BPE training, step by step (ASCII bytes)</span></div><div class="viz-body" id="bpe-train"></div></div>
<h2 class="lesson-h2">2.4.2 BPE Encoder</h2>
<p class="lesson-p">Encoding applies the learned merge rules to new text. At each step it chooses the available pair with the earliest rank in the merge list. This works for any input whose starting symbols are in the vocabulary; byte-level BPE ensures that coverage by including all 256 byte values.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization 3 - BPE encoding pseudocode</span></div><div class="viz-body"><pre style="font-family:var(--mono);font-size:.78rem;line-height:1.7;color:var(--text);background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1.1rem 1.3rem;overflow:auto;margin:0"><span style="color:var(--accent2)">function</span> encode(word, merges):
    symbols = bytes(word) + [end_of_word]
    <span style="color:var(--muted)"># rank[pair] = position in merges (lower = learned earlier)</span>
    <span style="color:var(--accent2)">while</span> True:
        pair = adjacent pair in symbols with the smallest rank
        <span style="color:var(--accent2)">if</span> no adjacent pair has a rank:
            <span style="color:var(--accent2)">break</span>
        replace every occurrence of pair with the merged symbol
    <span style="color:var(--accent2)">return</span> [ id(t) <span style="color:var(--accent2)">for</span> t <span style="color:var(--accent2)">in</span> symbols ]</pre></div></div>
<p class="lesson-p">The model below encodes a test sentence using merges learned from a small training set. It shows the final tokens with their IDs, and the greedy merge steps for the first word.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization 4 - Encoder on a test sentence (ASCII bytes)</span></div><div class="viz-body" id="bpe-encoder"></div></div>
<h2 class="lesson-h2">2.4.3 BPE in Practice</h2>
<p class="lesson-p">Byte-level BPE starts from UTF-8 bytes rather than a restricted alphabet of characters. With all 256 byte values available, it can encode text even when the training corpus never contained a particular character. Try the conversion below.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization 5 - Unicode to UTF-8 to token IDs</span></div><div class="viz-body" id="bpe-bytes"></div></div>
<p class="lesson-p">This is the main difference between the two common kinds of BPE. Character-level BPE builds its vocabulary from characters, so a character it never saw in training becomes an unknown token. Byte-level BPE builds its vocabulary from the 256 possible byte values, so nothing is ever unknown. The comparison below runs both on the same input.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization 6 - Character-level vs byte-level BPE</span></div><div class="viz-body" id="bpe-types"></div></div>
<p class="lesson-p">Because BPE learns its merges from data, the tokens it produces depend on the training language. A model trained on English learns different merges than one trained on Spanish, and each tokenizes its own language more efficiently. The comparison below trains BPE on English and on Spanish and tokenizes the same text with each.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization 7 - English vs Spanish BPE</span></div><div class="viz-body" id="bpe-lang"></div></div>
<div class="lesson-note"><div class="lesson-note-label">SuperBPE (Liu et al., 2025)</div><p>Standard BPE splits at whitespace first. SuperBPE allows merges across word boundaries, creating tokens like "of the" or "New York". 27-33% more efficient.</p></div>
<div class="quiz-block" id="qb1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">During BPE encoding, which frequencies determine merge order?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qb1','Test frequencies are irrelevant.')">Test data frequencies</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qb1','Correct! The encoder applies merges in training-learned order regardless of test frequencies.')">Training data (learned merge order)</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qb1','BPE does not re-count at encoding time.')">Current input frequencies</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qb1','Merges are deterministic.')">Random order</button>
</div><div class="quiz-explain" id="qb1-explain"></div></div>`;

PAGES.corpora = `
<div class="lesson-chapter-label">Section 2.5</div>
<h1 class="lesson-h1">Corpora</h1>
<p class="lesson-intro">No corpus is a neutral sample of a language. Every text was produced by particular people, in a particular variety, at a particular time, for a particular purpose.</p>
<p class="lesson-p">A corpus is the body of text a model is trained and tested on. It is not a neutral sample of a language. It is a sample of particular people, writing or speaking a particular variety of a particular language, at a particular time, for a particular purpose. All of these factors affect the data, and through it the model.</p>
<p class="lesson-p">The word English does not describe a single kind of text. A model trained on Wikipedia learns an edited, encyclopedic style and performs poorly on informal text such as social media posts. A tokenizer trained on English splits Spanish into awkward fragments, because its statistics come from a different language. There are about 7,100 living languages, and most NLP work has used only a few of them, English most of all. As a result, reported progress often applies mainly to the kinds of text that were easy to collect.</p>
<p class="lesson-p">Language also varies within a single language. Speakers code-switch, mixing two languages in one sentence. Genre changes both vocabulary and grammar: a legal contract, a medical record, a chat message, and a poem are all English but differ greatly, and a system trained on one may perform poorly on another. Language also changes over time as new words appear and existing words shift in meaning.</p>
<p class="lesson-p">The standard response is documentation. Before using a corpus, you should know who produced the text, when, in what variety, how it was collected, with what permission, and who labeled it. Recording this information helps prevent bias and blind spots from being built into systems that later affect real people.</p>
<h2 class="lesson-h2">Code-Switching</h2>
<p class="lesson-p">Code-switching is when a speaker moves between two languages within a single sentence or conversation. It is common among bilingual speakers and follows regular patterns rather than being random. The visualization below shows example code-switched sentences, with each word colored by its language and each switch point marked. Because a tokenizer is usually trained on one language, the other language is split into many small pieces, which makes mixed text harder for models.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization - Code-switching</span></div><div class="viz-body" id="cs-viz"></div></div>
<h2 class="lesson-h2">What Shapes Language Choice</h2>
<p class="lesson-p">A speaker's choice of language variety is not arbitrary. It depends on their motivation, such as showing closeness or signaling authority, and on the situation, such as being at home, at work, or in a formal setting. These factors connect to the variety a speaker uses, for example a home language, casual slang, a standard formal register, or technical vocabulary. The graph below shows how motivation and situation connect to language variety. Hover over a node to trace the connections.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization - Motivation, situation, and language variety</span></div><div class="viz-body" id="socio-viz"></div></div>
<h2 class="lesson-h2">Language Variation</h2>
<p class="lesson-p">The world has ~7,100 languages. Most NLP is built on English. Code switching is common globally - speakers mix languages in one utterance. Genre matters: newswire vs. social media vs. legal text all use different vocabulary and syntax.</p>
<h2 class="lesson-h2">Datasheets for Datasets</h2>
<p class="lesson-p">Every corpus should document: motivation, collection situation, language variety, speaker demographics, collection process, annotation process, and distribution rights.</p>
<div class="lesson-note"><div class="lesson-note-label">Why This Matters</div><p>A model trained on Wikipedia fails on tweets. A tokenizer trained on English oversegments Spanish. Knowing your corpus is not optional - it is the foundation of responsible NLP.</p></div>`;

PAGES.regex = `
<div class="lesson-chapter-label">Section 2.6</div>
<h1 class="lesson-h1">Regular Expressions</h1>
<p class="lesson-intro">Regular expressions describe patterns for finding and splitting text. They power BPE pre-tokenization, rule-based tokenizers, and text cleaning.</p>
<p class="lesson-p">A regular expression describes a pattern of text rather than a fixed string. It lets you search for text defined by a shape, such as every phone number, every email address, or every word ending in -ing, which cannot be listed one by one. Regular expressions are the standard tool for this.</p>
<p class="lesson-p">Regular expressions come from work in the 1950s by the mathematician Stephen Kleene on what simple machines can recognize. They are now used throughout text processing: in editors, on the command line, and in scripts that clean text before it reaches a model. They are also used inside tokenizers. The first step of GPT's tokenizer is a regular expression that splits text into rough pieces before any merging.</p>
<p class="lesson-p">Regular expressions are built from a small set of constructs that combine: sets of characters, repetition, optional parts, alternation, and positions in the line. Combining these lets you describe specific patterns compactly. The playground below lets you test patterns on your own text, and the rest of this section covers each construct in turn.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization - Regex playground</span></div><div class="viz-body" id="regex-play"></div></div>
<h2 class="lesson-h2">2.6.1 Character Disjunction</h2>
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;font-family:var(--mono);font-size:.78rem;line-height:2.1;margin:1rem 0">
<span style="color:var(--accent3)">r"[aeiou]"</span>&nbsp;<span style="color:var(--muted)"># any single vowel</span><br>
<span style="color:var(--accent3)">r"[A-Z]"</span>&nbsp;<span style="color:var(--muted)"># any uppercase</span><br>
<span style="color:var(--accent3)">r"[^aeiou]"</span>&nbsp;<span style="color:var(--muted)"># NOT a vowel</span><br>
<span style="color:var(--accent3)">r"[mM]ary"</span>&nbsp;<span style="color:var(--muted)"># "Mary" or "mary"</span>
</div>
<h2 class="lesson-h2">2.6.2 Counters, Optionality, Wildcards</h2>
<div style="overflow-x:auto;margin:1rem 0 1.5rem"><table style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:.78rem">
<tr style="border-bottom:1px solid var(--border2)"><th style="text-align:left;padding:.4rem .75rem;color:var(--muted);font-weight:400">Pattern</th><th style="text-align:left;padding:.4rem .75rem;color:var(--muted);font-weight:400;font-family:var(--body)">Meaning</th><th style="text-align:left;padding:.4rem .75rem;color:var(--muted);font-weight:400;font-family:var(--body)">Example</th></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:.4rem .75rem;color:var(--accent)">*</td><td style="padding:.4rem .75rem;color:var(--text);font-family:var(--body)">Zero or more (Kleene star)</td><td style="padding:.4rem .75rem;color:var(--muted)">ba* &rarr; b, ba, baa</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:.4rem .75rem;color:var(--accent)">+</td><td style="padding:.4rem .75rem;color:var(--text);font-family:var(--body)">One or more</td><td style="padding:.4rem .75rem;color:var(--muted)">[0-9]+ &rarr; any integer</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:.4rem .75rem;color:var(--accent)">?</td><td style="padding:.4rem .75rem;color:var(--text);font-family:var(--body)">Zero or one (optional)</td><td style="padding:.4rem .75rem;color:var(--muted)">colou?r &rarr; color or colour</td></tr>
<tr><td style="padding:.4rem .75rem;color:var(--accent)">.</td><td style="padding:.4rem .75rem;color:var(--text);font-family:var(--body)">Any single character</td><td style="padding:.4rem .75rem;color:var(--muted)">c.t &rarr; cat, cut, cot</td></tr>
</table></div>
<h2 class="lesson-h2">2.6.3 Anchors</h2>
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;font-family:var(--mono);font-size:.78rem;line-height:2.1;margin:1rem 0">
<span style="color:var(--accent3)">r"^The"</span>&nbsp;<span style="color:var(--muted)"># start of line</span><br>
<span style="color:var(--accent3)">r"end$"</span>&nbsp;<span style="color:var(--muted)"># end of line</span><br>
<span style="color:var(--accent3)">r"\\bcat\\b"</span>&nbsp;<span style="color:var(--muted)"># "cat" not "catfish"</span>
</div>
<h2 class="lesson-h2">2.6.4 Disjunction, Grouping, Precedence</h2>
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;font-family:var(--mono);font-size:.78rem;line-height:2.1;margin:1rem 0">
<span style="color:var(--accent3)">r"category|ies"</span>&nbsp;<span style="color:var(--muted)"># WRONG: "category" OR "ies"</span><br>
<span style="color:var(--accent3)">r"categor(y|ies)"</span>&nbsp;<span style="color:var(--muted)"># CORRECT: "category" or "categories"</span>
</div>
<div style="display:flex;flex-direction:column;gap:5px;margin:1rem 0 1.5rem">
<div style="display:flex;align-items:center;gap:12px;padding:.5rem .75rem;background:var(--surface2);border-radius:6px;border-left:2px solid var(--accent);font-family:var(--mono);font-size:.78rem"><span style="color:var(--accent);width:120px">( )</span><span style="color:var(--muted)">Parentheses - highest</span></div>
<div style="display:flex;align-items:center;gap:12px;padding:.5rem .75rem;background:var(--surface2);border-radius:6px;border-left:2px solid var(--accent2);font-family:var(--mono);font-size:.78rem"><span style="color:var(--accent2);width:120px">* + ? {n}</span><span style="color:var(--muted)">Counters</span></div>
<div style="display:flex;align-items:center;gap:12px;padding:.5rem .75rem;background:var(--surface2);border-radius:6px;border-left:2px solid #fbbf24;font-family:var(--mono);font-size:.78rem"><span style="color:#fbbf24;width:120px">abc ^ $ \\b</span><span style="color:var(--muted)">Sequences and anchors</span></div>
<div style="display:flex;align-items:center;gap:12px;padding:.5rem .75rem;background:var(--surface2);border-radius:6px;border-left:2px solid var(--accent3);font-family:var(--mono);font-size:.78rem"><span style="color:var(--accent3);width:120px">|</span><span style="color:var(--muted)">Disjunction - lowest</span></div>
</div>
<h2 class="lesson-h2">2.6.5 A Simple Example</h2>
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;font-family:var(--mono);font-size:.78rem;line-height:2.1;margin:1rem 0">
<span style="color:var(--accent3)">r"and"</span>&nbsp;<span style="color:var(--muted)"># misses "And"</span><br>
<span style="color:var(--accent3)">r"[aA]nd"</span>&nbsp;<span style="color:var(--muted)"># also matches "band", "random"</span><br>
<span style="color:var(--accent3)">r"\\b[aA]nd\\b"</span>&nbsp;<span style="color:var(--muted)"># correct</span>
</div>
<h2 class="lesson-h2">2.6.6 Substitutions and Capture Groups</h2>
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;font-family:var(--mono);font-size:.78rem;line-height:2.1;margin:1rem 0">
<span style="color:var(--muted)"># Swap MM/DD/YYYY to DD-MM-YYYY</span><br>
<span style="color:var(--accent)">re.sub</span>(<span style="color:var(--accent3)">r"(\\d{2})/(\\d{2})/(\\d{4})"</span>, <span style="color:var(--accent3)">r"&#92;2-&#92;1-&#92;3"</span>, text)<br><br>
<span style="color:var(--muted)"># Non-capturing group</span><br>
<span style="color:var(--accent3)">r"(?:ha)+"</span>&nbsp;<span style="color:var(--muted)"># matches ha, haha - no capture</span>
</div>
<h2 class="lesson-h2">2.6.7 Lookahead Assertions</h2>
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;font-family:var(--mono);font-size:.78rem;line-height:2.1;margin:1rem 0">
<span style="color:var(--accent3)">r"\\w+(?=ing)"</span>&nbsp;<span style="color:var(--muted)"># positive: word followed by "ing"</span><br>
<span style="color:var(--accent3)">r"^(?![tT])(\\w+)\\b"</span>&nbsp;<span style="color:var(--muted)"># negative: not starting with T/t</span>
</div>
<h2 class="lesson-h2">2.6.8 BPE Pre-tokenization</h2>
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;font-family:var(--mono);font-size:.78rem;line-height:2.1;margin:1rem 0;overflow-x:auto">
<span style="color:var(--accent3)">r"'s|'t|'re|'ve|'m|'ll|'d| ?\\p{L}+| ?\\p{N}+| ?[^\\s\\p{L}\\p{N}]+|\\s+(?!\\S)|\\s+"</span>
</div>
<h2 class="lesson-h2">Regex Reference</h2>
<p class="lesson-p">A summary of the common regular-expression constructs.</p>
<div class="def-list"><div class="def-row"><span class="def-term">.</span><span class="def-text">Any character except a newline</span></div><div class="def-row"><span class="def-term">[abc]</span><span class="def-text">Any one of the listed characters</span></div><div class="def-row"><span class="def-term">[^abc]</span><span class="def-text">Any character except the listed ones</span></div><div class="def-row"><span class="def-term">[a-z]</span><span class="def-text">Any character in the range</span></div><div class="def-row"><span class="def-term">&#92;d &nbsp; &#92;D</span><span class="def-text">A digit; a non-digit</span></div><div class="def-row"><span class="def-term">&#92;w &nbsp; &#92;W</span><span class="def-text">A word character (letter, digit, underscore); a non-word character</span></div><div class="def-row"><span class="def-term">&#92;s &nbsp; &#92;S</span><span class="def-text">A whitespace character; a non-whitespace character</span></div><div class="def-row"><span class="def-term">^ &nbsp; $</span><span class="def-text">Start of line; end of line</span></div><div class="def-row"><span class="def-term">&#92;b &nbsp; &#92;B</span><span class="def-text">A word boundary; a non-boundary</span></div><div class="def-row"><span class="def-term">*</span><span class="def-text">Zero or more of the preceding item</span></div><div class="def-row"><span class="def-term">+</span><span class="def-text">One or more of the preceding item</span></div><div class="def-row"><span class="def-term">?</span><span class="def-text">Zero or one (optional)</span></div><div class="def-row"><span class="def-term">{n} &nbsp; {n,} &nbsp; {n,m}</span><span class="def-text">Exactly n; n or more; between n and m</span></div><div class="def-row"><span class="def-term">*? &nbsp; +?</span><span class="def-text">Lazy quantifiers (match as few as possible)</span></div><div class="def-row"><span class="def-term">(...)</span><span class="def-text">Capturing group</span></div><div class="def-row"><span class="def-term">(?:...)</span><span class="def-text">Non-capturing group</span></div><div class="def-row"><span class="def-term">|</span><span class="def-text">Alternation (either the left or the right side)</span></div><div class="def-row"><span class="def-term">&#92;1</span><span class="def-text">Backreference to the first captured group</span></div><div class="def-row"><span class="def-term">(?=...) &nbsp; (?!...)</span><span class="def-text">Positive lookahead; negative lookahead</span></div><div class="def-row"><span class="def-term">&#92;. &nbsp; &#92;* &nbsp; &#92;+</span><span class="def-text">A literal special character (escape it with a backslash)</span></div><div class="def-row"><span class="def-term">flags: g i m</span><span class="def-text">Global (all matches); case-insensitive; multiline (^ and $ match each line)</span></div></div>
<div class="quiz-block" id="qr1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does <code style="font-family:var(--mono)">r"categor(y|ies)"</code> match that <code style="font-family:var(--mono)">r"category|ies"</code> does NOT?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qr1','Both match category.')">The string "category"</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qr1','Correct! r&quot;category|ies&quot; matches category OR the bare string ies. r&quot;categor(y|ies)&quot; correctly matches category or categories.')">The string "categories"</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qr1','Neither pattern adds word boundaries.')">Only whole-word matches</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qr1','Neither adds boundaries.')">Only with \\b anchors</button>
</div><div class="quiz-explain" id="qr1-explain"></div></div>`;

PAGES.practice = `
<div class="lesson-chapter-label">Sections 2.7-2.8</div>
<h1 class="lesson-h1">Tokenization in Practice</h1>
<p class="lesson-intro">From Unix pipelines to rule-based tokenizers to sentence segmentation.</p>
<p class="lesson-p">Earlier sections covered the ideas behind tokenization. This section is about carrying it out. In practice, much of the difficulty in natural language processing is not in the model but in preparing the text before the model sees it.</p>
<p class="lesson-p">Standard command-line tools are enough to do a large amount of this work. Ever since pipes arrived in Unix in 1973, the word frequencies of an entire book could be computed with a single line of piped commands, each doing one task and passing its output to the next: split into words, lowercase, sort, count duplicates, and sort by count. The same pipeline still works today. The general point is that text processing benefits from small tools combined carefully, and from understanding each step.</p>
<p class="lesson-p">When explicit rules are needed, the field uses shared conventions such as the Penn Treebank scheme so that tokenizations are consistent and comparable. These conventions make specific choices: contractions are split, so <em>doesn't</em> becomes <em>does</em> and <em>n't</em>; punctuation is separated from words; and hyphenated compounds are kept together. These are agreed conventions rather than the only correct answer.</p>
<p class="lesson-p">A harder problem is deciding where a sentence ends, which is covered at the end of this section. It is a task people do easily but that is difficult to specify as an exact rule.</p>
<h2 class="lesson-h2">2.7 Unix Tools</h2>
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;font-family:var(--mono);font-size:.78rem;line-height:2.1;margin:1rem 0">
<span style="color:var(--muted)"># Tokenize, lowercase, sort, count by frequency</span><br>
<span style="color:var(--accent4)">tr -sc 'A-Za-z' '&#92;n' &lt; corpus.txt | tr A-Z a-z | sort | uniq -c | sort -n -r</span>
</div>
<p class="lesson-p">The tool below builds a command from a plain-language description. Describe what you want to do with a text file.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization - Unix command generator</span></div><div class="viz-body" id="unixgen-viz"></div></div>
<p class="lesson-p">The tool below runs a pipeline on a sample corpus. Pick a corpus, add commands one at a time, and see the output after each stage. Load the word-frequency pipeline to see the classic example.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization - Unix pipeline simulator</span></div><div class="viz-body" id="unixsim-viz"></div></div>
<h2 class="lesson-h2">2.8 Rule-Based Tokenization</h2>
<p class="lesson-p"><strong>Penn Treebank standard</strong>: separate clitics, keep hyphens, separate all punctuation.</p>
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;font-family:var(--mono);font-size:.78rem;line-height:1.9;margin:1rem 0">
Input: <span style="color:var(--muted)">"The Delhi-based studio," she wrote, "can't bill $250".</span><br>
Output: <span style="color:var(--accent4)">&ldquo; The Delhi-based studio , &rdquo; she wrote , &ldquo; ca n't bill $ 250 &rdquo; .</span>
</div>
<p class="lesson-p">The model below applies these rules to any text you type and shows the resulting tokens.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization - Penn Treebank tokenizer</span></div><div class="viz-body" id="ptb-viz"></div></div>
<p class="lesson-p">A tokenizer is often written as a single regular expression that matches each token. The model below lets you write a token pattern and returns the list of tokens it produces, in the same list form a program would use.</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization - Regex tokenizer (returns a token list)</span></div><div class="viz-body" id="regextok-viz"></div></div>
<h2 class="lesson-h2">2.8.1 Sentence Segmentation</h2>
<p class="lesson-p">The period "." is ambiguous: sentence boundary, abbreviation (Dr., Inc.), or decimal (3.14). Most systems use an abbreviation dictionary or classifier.</p>
<div class="quiz-block" id="qp1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Penn Treebank: how is "doesn't" tokenized?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qp1','Penn Treebank splits clitics.')">Single token: doesn't</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qp1','Correct! doesn\\'t becomes does + n\\'t.')">Two tokens: does + n't</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qp1','Penn Treebank keeps n\\'t, not expanding to not.')">Two tokens: does + not</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qp1','Three tokens is not the standard.')">Three tokens</button>
</div><div class="quiz-explain" id="qp1-explain"></div></div>`;

PAGES.editdist = `
<div class="lesson-chapter-label">Section 2.9</div>
<h1 class="lesson-h1">Minimum Edit Distance</h1>
<p class="lesson-intro">How similar are two strings? Minimum edit distance answers that with dynamic programming. It is the measure behind spell correction, speech-recognition word error rate, DNA alignment, and machine translation evaluation.</p>
<p class="lesson-p">A spelling corrector needs a way to compare a typed word with possible replacements. <strong>Edit distance</strong> measures the cost of turning one string into another using insertions, deletions, and substitutions. It is one part of spelling correction: word frequency and context also help decide which replacement makes sense.</p>
<p class="lesson-p">The measure is used well beyond spell correction. The same count scores how far a speech recognizer's transcript is from what was actually said, which is the word error rate behind every voice assistant. It aligns two strands of DNA to locate where a base was inserted or deleted. It grades a machine translation against a human reference. Any time you need to know how far apart two sequences are, this is the standard tool.</p>
<p class="lesson-p">The difficulty is that there are exponentially many ways to turn one string into another, and we want the cheapest one. Trying them all is impractical even for short words. The solution is <strong>dynamic programming</strong>, and it rests on a simple observation: the cheapest way to align two whole strings is built from the cheapest ways to align their prefixes. Solve each prefix-against-prefix subproblem once, store the answer in a table, and never recompute it. What looked exponential becomes a matter of filling in a grid.</p>
<p class="lesson-p">The rest of this section states the recurrence precisely, shows why it is correct, and then gives you a table you can fill in one cell at a time.</p>
<h2 class="lesson-h2">Definition</h2>
<p class="lesson-p">The <strong>minimum edit distance</strong> is the least total cost of insertions, deletions, and substitutions that turn X into Y. Standard <a href="https://nlp.stanford.edu/IR-book/html/htmledition/edit-distance-1.html" target="_blank" rel="noopener noreferrer">Levenshtein distance</a> assigns cost 1 to each operation. The worked example here uses a weighted variant: insertion and deletion cost 1, substitution costs 2, and a match costs 0.</p>
<p class="lesson-p">Alignment of <em>semantics &rarr; syntactic</em>:</p>
<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:1.25rem;font-family:var(--mono);font-size:.85rem;text-align:center;margin:1.25rem 0;line-height:2.6">
<div style="color:var(--text);letter-spacing:.2em">S&nbsp;&nbsp;*&nbsp;&nbsp;E&nbsp;&nbsp;M&nbsp;&nbsp;A&nbsp;&nbsp;N&nbsp;&nbsp;T&nbsp;&nbsp;I&nbsp;&nbsp;C&nbsp;&nbsp;S</div>
<div style="color:var(--border2)">|&nbsp;&nbsp;|&nbsp;&nbsp;|&nbsp;&nbsp;|&nbsp;&nbsp;|&nbsp;&nbsp;|&nbsp;&nbsp;|&nbsp;&nbsp;|&nbsp;&nbsp;|&nbsp;&nbsp;|</div>
<div style="color:var(--text);letter-spacing:.2em">S&nbsp;&nbsp;Y&nbsp;&nbsp;N&nbsp;&nbsp;T&nbsp;&nbsp;A&nbsp;&nbsp;C&nbsp;&nbsp;T&nbsp;&nbsp;I&nbsp;&nbsp;C&nbsp;&nbsp;*</div>
<div style="color:var(--accent);font-size:.72rem;letter-spacing:.3em;margin-top:.2rem">&nbsp;&nbsp;&nbsp;i&nbsp;&nbsp;&nbsp;s&nbsp;&nbsp;&nbsp;s&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;s&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d</div>
</div>
<p class="lesson-p">Cost: 1(ins Y) + 2(E&rarr;N) + 2(M&rarr;T) + 2(N&rarr;C) + 1(del S) = <strong>8</strong>. The three columns on the right (<em>T</em>, <em>I</em>, <em>C</em>) already match, so they are free.</p>
<p class="lesson-p">With these costs, a substitution ties with a deletion followed by an insertion: both cost 2. Several alignments can therefore have the same minimum cost of 8. The distance is fixed, but the chosen alignment depends on how the backtrace breaks ties. The lab prefers a diagonal step when costs tie.</p>
<h2 class="lesson-h2">String Alignment</h2>
<p class="lesson-p">An edit sequence can be shown as an alignment: the two strings written one above the other, with a dash wherever a character is inserted or deleted. The model below aligns any two words and marks each column underneath as a match, a substitution (s), a deletion (d), or an insertion (i).</p>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Visualization - String alignment</span></div><div class="viz-body" id="align-viz"></div></div>
<h2 class="lesson-h2">2.9.1 The DP Algorithm</h2>
<p class="lesson-p">Let source X have length n, target Y have length m. Define D[i,j] = edit distance between X[1..i] and Y[1..j]. The recurrence:</p>
<div class="lesson-math" style="padding:2rem 1.5rem">\\[D[i,j] = \\min \\begin{cases} D[i-1,\\, j] + \\mathrm{del}(X_i) \\\\ D[i,\\, j-1] + \\mathrm{ins}(Y_j) \\\\ D[i-1,\\, j-1] + \\mathrm{sub}(X_i, Y_j) \\end{cases}\\]</div>
<p class="lesson-p">With unit insertion and deletion costs, the base cases are D[i,0] = i and D[0,j] = j. For the weighted example with substitution cost 2:</p>
<div class="lesson-math" style="padding:2rem 1.5rem">\\[D[i,j] = \\min \\begin{cases} D[i-1,j]+1 \\\\ D[i,j-1]+1 \\\\ D[i-1,j-1] + \\begin{cases} 2 & \\text{if } X_i \\neq Y_j \\\\ 0 & \\text{if } X_i = Y_j \\end{cases} \\end{cases}\\]</div>
<p class="lesson-p">Fills the table in O(nm) time and space. Optimal <strong>alignment</strong> recovered by backtracing from D[n,m] to D[0,0].</p>
<div class="lesson-note"><div class="lesson-note-label">Why DP Works Here</div>
<p>If an intermediate string is on the optimal path X to Y, the sub-path from X to that intermediate must also be optimal. If not, we could replace it with a shorter path - contradicting optimality. This optimal substructure is what makes DP applicable.</p></div>
<h2 class="lesson-h2">Why the Recurrence Is Correct</h2>
<p class="lesson-p">The recurrence works because of a property called <strong>optimal substructure</strong>: an optimal solution to the whole problem is built from optimal solutions to smaller subproblems. Let D[i,j] be the edit distance between the first i characters of X and the first j characters of Y.</p>
<p class="lesson-p">Consider any optimal alignment of those two prefixes and look at its final column. There are only three possibilities for that column: the last character of X is deleted, the last character of Y is inserted, or the two last characters are aligned to each other (a match if they are equal, otherwise a substitution). Whatever remains after removing that final column must itself be an optimal alignment of the smaller prefixes. If it were not, we could replace it with a cheaper one and lower the total cost, which would contradict the assumption that the full alignment was optimal. The three cases therefore have these costs, and the true value is the smallest of them, which is exactly the recurrence:</p>
<div class="lesson-math">\\[D[i,j] = \\min\\{\\, D[i-1,j]+d,\\; D[i,j-1]+d,\\; D[i-1,j-1]+s(x_i,y_j) \\,\\}\\]</div>
<p class="lesson-p">The base cases are correct as well: turning a prefix of length i into the empty string takes i deletions, and building a prefix of length j from the empty string takes j insertions.</p>
<div class="lesson-math">\\[D[i,0] = i \\cdot d, \\quad D[0,j] = j \\cdot d\\]</div>
<p class="lesson-p">By induction on i + j, every entry equals the true minimum, so D[n,m] is the minimum edit distance. Because each of the (n+1)(m+1) cells is computed once from three earlier cells, the algorithm runs in O(nm) time and O(nm) space.</p>
<h2 class="lesson-h2">Pseudocode</h2>
<div class="viz-container"><div class="viz-header"><span class="viz-label">Minimum edit distance algorithm</span></div><div class="viz-body"><pre style="font-family:var(--mono);font-size:.76rem;line-height:1.65;color:var(--text);background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1.1rem 1.3rem;overflow:auto;margin:0"><span style="color:var(--accent2)">function</span> min_edit_distance(X, Y):   <span style="color:var(--muted)"># X has n chars, Y has m chars</span>
    make table D[0..n][0..m]
    D[0][0] = 0
    <span style="color:var(--accent2)">for</span> i <span style="color:var(--accent2)">in</span> 1..n:  D[i][0] = D[i-1][0] + del_cost   <span style="color:var(--muted)"># delete all of X</span>
    <span style="color:var(--accent2)">for</span> j <span style="color:var(--accent2)">in</span> 1..m:  D[0][j] = D[0][j-1] + ins_cost   <span style="color:var(--muted)"># insert all of Y</span>
    <span style="color:var(--accent2)">for</span> i <span style="color:var(--accent2)">in</span> 1..n:
        <span style="color:var(--accent2)">for</span> j <span style="color:var(--accent2)">in</span> 1..m:
            sub = 0 <span style="color:var(--accent2)">if</span> X[i] == Y[j] <span style="color:var(--accent2)">else</span> sub_cost
            D[i][j] = min( D[i-1][j] + del_cost,     <span style="color:var(--muted)"># deletion</span>
                           D[i][j-1] + ins_cost,     <span style="color:var(--muted)"># insertion</span>
                           D[i-1][j-1] + sub )       <span style="color:var(--muted)"># match / substitute</span>
    <span style="color:var(--accent2)">return</span> D[n][m]</pre></div></div>
<h2 class="lesson-h2">Interactive Lab</h2>
<p class="lesson-p">Enter two strings, including empty strings, to compare up to 14 Unicode code points each. Select <strong>&#9654; Step</strong> to start or advance the table, or <strong>Compute</strong> for the full result. Text is normalized to NFC and case is preserved.</p>
<div id="edit-lab" style="background:var(--surface);border:1px solid var(--border2);border-radius:16px;overflow:hidden;margin:2rem 0">
  <div style="background:var(--surface2);padding:1rem 1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
    <div style="font-family:var(--mono);font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent)">Interactive Lab - Minimum Edit Distance</div>
  </div>
  <div style="padding:1.25rem 1.5rem;display:flex;gap:14px;align-items:flex-end;flex-wrap:wrap;border-bottom:1px solid var(--border)">
    <div style="flex:1;min-width:140px">
      <div style="font-family:var(--mono);font-size:.65rem;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px">Source word</div>
      <input id="el-src" type="text" value="semantics" maxlength="14" style="width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.6rem .9rem;font-family:var(--mono);font-size:1rem;color:var(--text);outline:none">
    </div>
    <div style="flex:1;min-width:140px">
      <div style="font-family:var(--mono);font-size:.65rem;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px">Target word</div>
      <input id="el-tgt" type="text" value="syntactic" maxlength="14" style="width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.6rem .9rem;font-family:var(--mono);font-size:1rem;color:var(--text);outline:none">
    </div>
    <div style="display:flex;gap:10px">
      <button onclick="elCompute()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.65rem 1.4rem;font-family:var(--mono);font-size:.78rem;font-weight:600;cursor:pointer">Compute</button>
      <button onclick="elStep()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.65rem 1.1rem;font-family:var(--mono);font-size:.78rem;cursor:pointer">&#9654; Step</button>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;width:100%">
      <span style="font-family:var(--mono);font-size:.62rem;color:var(--muted);align-self:center">examples:</span>
      <button onclick="elPreset('semantics','syntactic')" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);border-radius:6px;padding:.25rem .55rem;font-family:var(--mono);font-size:.64rem;cursor:pointer">semantics &rarr; syntactic</button>
      <button onclick="elPreset('sunday','saturday')" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);border-radius:6px;padding:.25rem .55rem;font-family:var(--mono);font-size:.64rem;cursor:pointer">sunday &rarr; saturday</button>
      <button onclick="elPreset('kitten','sitting')" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);border-radius:6px;padding:.25rem .55rem;font-family:var(--mono);font-size:.64rem;cursor:pointer">kitten &rarr; sitting</button>
    </div>
  </div>
  <div style="padding:.75rem 1.5rem;display:flex;gap:20px;flex-wrap:wrap;align-items:center;border-bottom:1px solid var(--border);background:var(--surface2)">
    <div style="font-family:var(--mono);font-size:.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">Costs:</div>
    <label style="font-family:var(--mono);font-size:.72rem;color:var(--muted);display:flex;align-items:center;gap:6px">Insert <input id="el-ins" type="number" value="1" min="1" max="5" style="width:44px;padding:3px 6px;background:var(--surface);border:1px solid var(--border2);border-radius:5px;font-family:var(--mono);font-size:.78rem;color:var(--text);text-align:center"></label>
    <label style="font-family:var(--mono);font-size:.72rem;color:var(--muted);display:flex;align-items:center;gap:6px">Delete <input id="el-del" type="number" value="1" min="1" max="5" style="width:44px;padding:3px 6px;background:var(--surface);border:1px solid var(--border2);border-radius:5px;font-family:var(--mono);font-size:.78rem;color:var(--text);text-align:center"></label>
    <label style="font-family:var(--mono);font-size:.72rem;color:var(--muted);display:flex;align-items:center;gap:6px">Substitute <input id="el-sub" type="number" value="2" min="1" max="5" style="width:44px;padding:3px 6px;background:var(--surface);border:1px solid var(--border2);border-radius:5px;font-family:var(--mono);font-size:.78rem;color:var(--text);text-align:center"></label>
  </div>
  <div id="el-stats" style="padding:.85rem 1.5rem;display:flex;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--border)">
    <div style="background:rgba(77,227,255,.08);border:1px solid rgba(77,227,255,.2);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.78rem;color:var(--accent)">Distance: <strong id="el-dist">&mdash;</strong></div>
    <div style="background:rgba(61,220,132,.06);border:1px solid rgba(61,220,132,.15);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.78rem;color:var(--accent4)">Inserts: <strong id="el-ins-count">&mdash;</strong></div>
    <div style="background:rgba(255,95,142,.06);border:1px solid rgba(255,95,142,.15);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.78rem;color:var(--accent3)">Deletes: <strong id="el-del-count">&mdash;</strong></div>
    <div style="background:rgba(160,140,255,.08);border:1px solid rgba(160,140,255,.2);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.78rem;color:#a78bfa">Subs: <strong id="el-sub-count">&mdash;</strong></div>
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.78rem;color:var(--muted)">Matches: <strong id="el-match-count">&mdash;</strong></div>
  </div>
  <div style="padding:.6rem 1.5rem 0"><label style="font-family:var(--mono);font-size:.72rem;color:var(--muted);cursor:pointer"><input type="checkbox" id="el-backtrace" checked onchange="elCompute()"> Show backtrace path</label></div>
  <div style="padding:1.25rem 1.5rem;overflow-x:auto"><div id="el-table" style="font-family:var(--mono);font-size:.8rem"></div></div>
  <div style="padding:0 1.5rem 1rem;border-top:1px solid var(--border)">
    <div style="font-family:var(--mono);font-size:.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;padding:.85rem 0 .6rem">Optimal alignment</div>
    <div id="el-align" style="font-family:var(--mono);font-size:.82rem;overflow-x:auto"></div>
  </div>
  <div id="el-explain" style="display:none;margin:.5rem 1.5rem 1.25rem;padding:.85rem 1rem;background:var(--surface2);border-radius:8px;border-left:2px solid var(--accent);font-family:var(--mono);font-size:.78rem;color:var(--muted);line-height:1.7"></div>
</div>
<div class="quiz-block" id="qd1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Weighted edit distance (ins=del=1, sub=2) between "cat" and "cut"?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qd1','1 would be correct with unit substitution cost. This example sets substitution cost to 2.')">1</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qd1','Correct! One substitution a to u costs 2. c and t match.')">2</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qd1','Only one operation needed.')">3</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qd1','0 means identical.')">0</button>
</div><div class="quiz-explain" id="qd1-explain"></div></div>`;

// ── BPE VISUALIZER ─────────────────────────────────────────
function cssVar(v){ const MC_VIZ={'--accent':'#4DE3FF','--accent2':'#A18FFF','--accent3':'#FF5F8E','--accent4':'#3DDC84','--text':'#ECF1FF','--muted':'#8E9AC4','--border':'rgba(214,226,255,0.13)','--border2':'rgba(214,226,255,0.25)','--bg':'#0B101F','--surface':'#111A30','--surface2':'#182342','--surface3':'#223055'}; return MC_VIZ[v] || '#8E9AC4'; }
function herdanFitCanvas(cv){
  const r=cv.getBoundingClientRect();
  const dpr=Math.max(1, window.devicePixelRatio||1);
  const w=Math.max(1,Math.round(r.width)), h=Math.max(1,Math.round(r.height));
  cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr);
  const ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
  cv._w=w; cv._h=h; return ctx;
}
function herdanTokenize(t){ return (String(t).toLowerCase().match(/[a-z0-9']+/g))||[]; }

let _hb={ beta:0.5 };
let _hs={ full:false, pts:null, N:0, V:0, k:NaN, beta:NaN, r2:NaN };
const HS_PRESETS = {
  natural: "The river wound slowly through the valley, catching the last light of the afternoon. Children played along its banks while their parents watched from the shade of old oak trees. A heron lifted from the reeds and drifted downstream, unhurried. Somewhere a dog barked, then fell silent. The evening settled in with the smell of cut grass and distant smoke, and the whole village seemed to breathe more slowly as the day gave way to a quiet and ordinary night. Nobody spoke of the harvest yet, though everyone was thinking of it, counting the weeks in their heads while the swallows turned overhead.",
  technical: "The transformer architecture replaces recurrence with self-attention, computing scaled dot-product attention over query, key, and value projections. Multi-head attention runs several attention functions in parallel, concatenating their outputs before a final linear projection. Positional encodings inject sequence order, since attention is permutation-invariant. Layer normalization and residual connections stabilize gradient flow through deep stacks. The feed-forward sublayer applies two linear transformations with a nonlinearity between them. During pretraining, the model minimizes cross-entropy over next-token prediction, and downstream fine-tuning adapts these pretrained parameters to specific classification or generation tasks.",
  repetitive: ("the cat sat on the mat . the cat sat on the mat . the dog sat on the mat . the cat ran on the mat . ").repeat(14)
};

function buildHerdanViz(){ buildHerdanBeta(); buildHerdanTwoBeta(); buildHerdanSim(); }

// ── beta curve explorer ──
function buildHerdanBeta(){
  const host=document.getElementById('herdan-beta-viz'); if(!host) return;
  host.innerHTML =
    '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:.8rem">'
    +'<div style="font-family:var(--mono);font-size:.72rem;color:var(--muted)">exponent &beta; = <span id="hb-val" style="color:var(--accent)">0.50</span></div>'
    +'<input id="hb-slider" type="range" min="0.3" max="1" step="0.01" value="0.5" style="flex:1;min-width:160px;accent-color:var(--accent)">'
    +'<div id="hb-label" style="font-family:var(--mono);font-size:.66rem;color:var(--accent2);min-width:170px;text-align:right">square-root growth</div>'
    +'</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;font-family:var(--mono);font-size:.68rem;margin-bottom:.9rem">'
    +'<span style="background:rgba(77,227,255,.08);border:1px solid rgba(77,227,255,.22);border-radius:7px;padding:.3rem .65rem;color:var(--accent)">double N &rarr; |V| &times; <strong id="hb-fac">1.41</strong></span>'
    +'<span style="background:rgba(226,233,255,.05);border:1px solid var(--border2);border-radius:7px;padding:.3rem .65rem;color:var(--muted)">10&times; N &rarr; |V| &times; <strong id="hb-fac10" style="color:var(--text)">3.2</strong></span>'
    +'</div>'
    +'<canvas id="hb-canvas" style="width:100%;height:300px;display:block"></canvas>';
  const sl=document.getElementById('hb-slider');
  sl.addEventListener('input', ()=>{ _hb.beta=parseFloat(sl.value); drawHerdanBeta(); });
  requestAnimationFrame(drawHerdanBeta);
}
function drawHerdanBeta(){
  const cv=document.getElementById('hb-canvas'); if(!cv) return;
  const ctx=herdanFitCanvas(cv); const W=cv._w,H=cv._h; ctx.clearRect(0,0,W,H);
  const beta=_hb.beta;
  const x0=52,y0=H-30,x1=W-18,y1=16, PW=x1-x0, PH=y0-y1;
  // gridlines at |V| fractions and N fractions
  ctx.font='500 10px "IBM Plex Mono", monospace'; ctx.textAlign='left';
  ctx.strokeStyle='rgba(226,233,255,0.06)'; ctx.lineWidth=1;
  for(let g=1;g<=4;g++){ const gy=y0-(g/4)*PH; ctx.beginPath(); ctx.moveTo(x0,gy); ctx.lineTo(x1,gy); ctx.stroke();
    ctx.fillStyle='rgba(139,147,187,0.55)'; ctx.fillText((g/4).toFixed(2), 6, gy+3); }
  for(let g=1;g<=4;g++){ const gx=x0+(g/4)*PW; ctx.strokeStyle='rgba(226,233,255,0.045)'; ctx.beginPath(); ctx.moveTo(gx,y1); ctx.lineTo(gx,y0); ctx.stroke(); }
  // real-language band 0.44..0.56 shaded between those two power curves
  ctx.beginPath();
  for(let i=0;i<=PW;i++){ const t=i/PW; const py=y0-Math.pow(t,0.44)*PH; if(i===0)ctx.moveTo(x0+i,py); else ctx.lineTo(x0+i,py); }
  for(let i=PW;i>=0;i--){ const t=i/PW; const py=y0-Math.pow(t,0.56)*PH; ctx.lineTo(x0+i,py); }
  ctx.closePath(); ctx.fillStyle='rgba(61,220,132,0.09)'; ctx.fill();
  // axis
  ctx.strokeStyle=cssVar('--border2'); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x0,y1); ctx.lineTo(x0,y0); ctx.lineTo(x1,y0); ctx.stroke();
  ctx.fillStyle=cssVar('--muted'); ctx.font='500 11px "IBM Plex Mono", monospace';
  ctx.fillText('words read  N \u2192', x0+PW/2-44, H-8);
  ctx.save(); ctx.translate(14,y1+PH/2+44); ctx.rotate(-Math.PI/2); ctx.fillText('vocabulary  |V| \u2192',0,0); ctx.restore();
  // linear reference (beta=1)
  ctx.strokeStyle='rgba(160,140,255,0.4)'; ctx.setLineDash([5,5]); ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='rgba(160,140,255,0.75)'; ctx.fillText('linear (\u03b2=1)', x1-92, y1+26);
  // sqrt reference (beta=0.5)
  ctx.strokeStyle='rgba(139,147,187,0.35)'; ctx.setLineDash([2,4]); ctx.lineWidth=1.2;
  ctx.beginPath();
  for(let i=0;i<=PW;i++){ const t=i/PW; const py=y0-Math.sqrt(t)*PH; if(i===0)ctx.moveTo(x0+i,py); else ctx.lineTo(x0+i,py); }
  ctx.stroke(); ctx.setLineDash([]);
  // active curve
  ctx.strokeStyle=cssVar('--accent'); ctx.lineWidth=2.6; ctx.shadowColor=cssVar('--accent'); ctx.shadowBlur=8;
  ctx.beginPath();
  for(let i=0;i<=PW;i++){ const t=i/PW; const v=Math.pow(t,beta); const px=x0+i, py=y0-v*PH; if(i===0)ctx.moveTo(px,py); else ctx.lineTo(px,py); }
  ctx.stroke(); ctx.shadowBlur=0;
  // endpoint dot (curve reaches |V|=1 at N=max)
  ctx.fillStyle=cssVar('--accent'); ctx.beginPath(); ctx.arc(x1,y1,3.5,0,7); ctx.fill();
  document.getElementById('hb-val').textContent=beta.toFixed(2);
  const f2=document.getElementById('hb-fac'); if(f2) f2.textContent=Math.pow(2,beta).toFixed(2);
  const f10=document.getElementById('hb-fac10'); if(f10) f10.textContent=Math.pow(10,beta).toFixed(1);
  const lbl=document.getElementById('hb-label');
  lbl.textContent = beta>0.9 ? 'nearly linear growth' : beta>=0.44 && beta<=0.56 ? 'near square-root growth' : beta<0.44 ? 'slower vocabulary growth' : 'between square-root and linear growth';
}

// ── two-slope (broken power law) on log-log axes ──
let _h2b={ b1:0.78, b2:0.44, knee:2.0, ND:4 };
function buildHerdanTwoBeta(){
  const host=document.getElementById('herdan-twobeta-viz'); if(!host) return;
  host.innerHTML =
    '<div style="display:flex;gap:22px;flex-wrap:wrap;margin-bottom:1rem;font-family:var(--mono);font-size:.72rem">'
    +'<label style="display:flex;align-items:center;gap:8px;color:var(--muted)">early &beta;<sub>1</sub> = <span id="h2-b1" style="color:var(--accent)">0.78</span><input id="h2-s1" type="range" min="0.55" max="1" step="0.01" value="0.78" style="accent-color:var(--accent)"></label>'
    +'<label style="display:flex;align-items:center;gap:8px;color:var(--muted)">late &beta;<sub>2</sub> = <span id="h2-b2" style="color:var(--accent3)">0.44</span><input id="h2-s2" type="range" min="0.3" max="0.65" step="0.01" value="0.44" style="accent-color:var(--accent3)"></label>'
    +'</div>'
    +'<canvas id="h2-canvas" style="width:100%;height:300px;display:block"></canvas>';
  const s1=document.getElementById('h2-s1'), s2=document.getElementById('h2-s2');
  s1.addEventListener('input',()=>{_h2b.b1=parseFloat(s1.value);drawHerdanTwoBeta();});
  s2.addEventListener('input',()=>{_h2b.b2=parseFloat(s2.value);drawHerdanTwoBeta();});
  requestAnimationFrame(drawHerdanTwoBeta);
}
function drawHerdanTwoBeta(){
  const cv=document.getElementById('h2-canvas'); if(!cv) return;
  const ctx=herdanFitCanvas(cv); const W=cv._w,H=cv._h; ctx.clearRect(0,0,W,H);
  const b1=_h2b.b1,b2=_h2b.b2,knee=_h2b.knee,ND=_h2b.ND;
  const x0=54,y0=H-34,x1=W-18,y1=30, PW=x1-x0, PH=y0-y1;
  const lv=ln=> ln<=knee ? b1*ln : b1*knee + b2*(ln-knee);
  const maxV=Math.max(lv(ND),0.001);
  const X=ln=> x0+(ln/ND)*PW;
  const Y=v=> y0-(v/maxV)*PH;
  // regime shading: steep (early) region up to knee, gentle (late) after
  const kxShade=X(knee);
  ctx.fillStyle='rgba(77,227,255,0.05)'; ctx.fillRect(x0,y1,kxShade-x0,y0-y1);
  ctx.fillStyle='rgba(255,95,142,0.05)'; ctx.fillRect(kxShade,y1,x1-kxShade,y0-y1);
  // decade gridlines with tick labels (log scale => integer decades)
  ctx.textAlign='center'; ctx.font='500 9.5px "IBM Plex Mono", monospace';
  const SUP=['\u2070','\u00B9','\u00B2','\u00B3','\u2074','\u2075','\u2076'];
  for(let d=0;d<=ND;d++){ const gx=X(d); ctx.strokeStyle='rgba(226,233,255,0.05)'; ctx.beginPath(); ctx.moveTo(gx,y1); ctx.lineTo(gx,y0); ctx.stroke();
    ctx.fillStyle='rgba(139,147,187,0.55)'; ctx.fillText('10'+(SUP[d]||''), gx, y0+16); }
  ctx.textAlign='left';
  ctx.strokeStyle=cssVar('--border'); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x0,y1); ctx.lineTo(x0,y0); ctx.lineTo(x1,y0); ctx.stroke();
  ctx.fillStyle=cssVar('--muted'); ctx.font='500 11px "IBM Plex Mono", monospace';
  ctx.fillText('log N  (corpus size) \u2192', x0+PW/2-58, H-8);
  ctx.save(); ctx.translate(15,y1+PH/2+48); ctx.rotate(-Math.PI/2); ctx.fillText('log |V|  (vocabulary) \u2192',0,0); ctx.restore();
  ctx.fillText('log-log scale: a power law is a straight line whose slope is \u03b2', x0+6, 16);
  ctx.strokeStyle='rgba(255,255,255,0.05)';
  for(let d=1;d<=ND;d++){ ctx.beginPath(); ctx.moveTo(X(d),y1); ctx.lineTo(X(d),y0); ctx.stroke(); }
  // single-fit reference chord (faint dashed)
  ctx.strokeStyle='rgba(160,140,255,0.35)'; ctx.lineWidth=1.4; ctx.setLineDash([5,5]);
  ctx.beginPath(); ctx.moveTo(X(0),Y(lv(0))); ctx.lineTo(X(ND),Y(lv(ND))); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='rgba(160,140,255,0.7)'; ctx.fillText('one-\u03b2 fit', X(ND)-66, Y(lv(ND))+16);
  // knee guide
  const kx=X(knee), ky=Y(lv(knee));
  ctx.strokeStyle='rgba(255,255,255,0.22)'; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(kx,ky); ctx.lineTo(kx,y0); ctx.stroke(); ctx.setLineDash([]);
  // segment 1 (steep, early)
  ctx.strokeStyle=cssVar('--accent'); ctx.lineWidth=2.6; ctx.shadowColor=cssVar('--accent'); ctx.shadowBlur=6;
  ctx.beginPath(); ctx.moveTo(X(0),Y(lv(0))); ctx.lineTo(kx,ky); ctx.stroke();
  // segment 2 (shallow, late)
  ctx.strokeStyle=cssVar('--accent3'); ctx.beginPath(); ctx.moveTo(kx,ky); ctx.lineTo(X(ND),Y(lv(ND))); ctx.stroke();
  ctx.shadowBlur=0;
  // knee dot + label
  ctx.fillStyle=cssVar('--text'); ctx.beginPath(); ctx.arc(kx,ky,4,0,7); ctx.fill();
  ctx.fillStyle=cssVar('--muted'); ctx.font='500 11px "IBM Plex Mono", monospace';
  ctx.fillText('knee: function words run out', kx+8, ky-7);
  // slope labels
  ctx.font='500 12px "IBM Plex Mono", monospace';
  ctx.fillStyle=cssVar('--accent'); ctx.fillText('\u03b2\u2081 = '+b1.toFixed(2)+'  (steep)', X(knee/2)-18, Y(lv(knee/2))-12);
  ctx.fillStyle=cssVar('--accent3'); ctx.fillText('\u03b2\u2082 = '+b2.toFixed(2)+'  (gentle)', X((knee+ND)/2)-18, Y(lv((knee+ND)/2))+22);
  const e1=document.getElementById('h2-b1'); if(e1) e1.textContent=b1.toFixed(2);
  const e2=document.getElementById('h2-b2'); if(e2) e2.textContent=b2.toFixed(2);
}

// ── Herdan's Law simulator ──
function buildHerdanSim(){
  const host=document.getElementById('herdan-sim-viz'); if(!host) return;
  const sample=(typeof LM_CORPUS!=='undefined'?LM_CORPUS:'the quick brown fox jumps over the lazy dog . the dog runs and the fox runs too .').replace(/</g,'&lt;');
  host.innerHTML =
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:.6rem">'
    +'<span style="font-family:var(--mono);font-size:.64rem;color:var(--muted);align-self:center;margin-right:2px">load a sample:</span>'
    +'<button class="hs-preset" data-p="natural" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);border-radius:6px;padding:.3rem .6rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">natural prose</button>'
    +'<button class="hs-preset" data-p="technical" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);border-radius:6px;padding:.3rem .6rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">technical</button>'
    +'<button class="hs-preset" data-p="repetitive" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);border-radius:6px;padding:.3rem .6rem;font-family:var(--mono);font-size:.66rem;cursor:pointer">repetitive</button>'
    +'</div>'
    +'<textarea id="hs-text" spellcheck="false" style="width:100%;height:120px;background:var(--surface2);border:1px solid var(--border2);border-radius:10px;padding:.8rem;font-family:var(--mono);font-size:.76rem;color:var(--text);outline:none;resize:vertical;line-height:1.6">'+sample+'</textarea>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:.9rem 0">'
    +'<button id="hs-measure" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.55rem 1.3rem;font-family:var(--mono);font-size:.74rem;font-weight:700;cursor:pointer">Measure</button>'
    +'<button id="hs-expand" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.55rem 1rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">\u2922 Full screen</button>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;font-family:var(--mono);font-size:.72rem">'
    +'<span style="background:rgba(77,227,255,.08);border:1px solid rgba(77,227,255,.2);border-radius:7px;padding:.35rem .7rem;color:var(--accent)">N = <strong id="hs-N">&mdash;</strong></span>'
    +'<span style="background:rgba(160,140,255,.1);border:1px solid rgba(160,140,255,.25);border-radius:7px;padding:.35rem .7rem;color:#A18FFF">|V| = <strong id="hs-V">&mdash;</strong></span>'
    +'<span style="background:rgba(61,220,132,.06);border:1px solid rgba(61,220,132,.18);border-radius:7px;padding:.35rem .7rem;color:var(--accent4)">k = <strong id="hs-k">&mdash;</strong></span>'
    +'<span style="background:rgba(255,95,142,.07);border:1px solid rgba(255,95,142,.2);border-radius:7px;padding:.35rem .7rem;color:var(--accent3)">&beta; = <strong id="hs-beta">&mdash;</strong></span>'
    +'<span style="background:rgba(226,233,255,.05);border:1px solid var(--border2);border-radius:7px;padding:.35rem .7rem;color:var(--muted)">R&sup2; = <strong id="hs-r2" style="color:var(--text)">&mdash;</strong></span>'
    +'</div></div>'
    +'<canvas id="hs-canvas" style="width:100%;height:330px;display:block;background:var(--surface);border:1px solid var(--border);border-radius:10px"></canvas>';
  document.getElementById('hs-measure').addEventListener('click', runHerdanSim);
  document.getElementById('hs-expand').addEventListener('click', toggleHerdanFull);
  host.querySelectorAll('.hs-preset').forEach(function(b){ b.addEventListener('click', function(){
    var ta=document.getElementById('hs-text'); if(ta){ ta.value=HS_PRESETS[b.dataset.p]||ta.value; runHerdanSim(); }
  }); });
  requestAnimationFrame(runHerdanSim);
}
function runHerdanSim(){
  const ta=document.getElementById('hs-text'); if(!ta) return;
  const toks=herdanTokenize(ta.value);
  const seen=new Set(); const pts=[]; const stride=Math.max(1,Math.floor(toks.length/600));
  for(let i=0;i<toks.length;i++){ seen.add(toks[i]); if(i%stride===0||i===toks.length-1) pts.push([i+1, seen.size]); }
  _hs.pts=pts; _hs.N=toks.length; _hs.V=seen.size;
  let sx=0,sy=0,sxx=0,sxy=0,m=0; const XY=[];
  for(const p of pts){ const n=p[0],v=p[1]; if(n<5||v<1)continue; const X=Math.log(n),Y=Math.log(v); sx+=X;sy+=Y;sxx+=X*X;sxy+=X*Y;m++; XY.push([X,Y]); }
  let beta=NaN,k=NaN,r2=NaN;
  if(m>=2){ const den=m*sxx-sx*sx; if(den!==0){ beta=(m*sxy-sx*sy)/den; const b0=(sy-beta*sx)/m; k=Math.exp(b0);
    // R^2 of the log-log linear fit
    const ybar=sy/m; let ssTot=0, ssRes=0;
    for(const [X,Y] of XY){ const yhat=b0+beta*X; ssTot+=(Y-ybar)*(Y-ybar); ssRes+=(Y-yhat)*(Y-yhat); }
    r2 = ssTot>0 ? Math.max(0, 1-ssRes/ssTot) : NaN;
  } }
  _hs.beta=beta; _hs.k=k; _hs.r2=r2;
  const set=(id,val)=>{const e=document.getElementById(id); if(e)e.textContent=val;};
  set('hs-N', _hs.N.toLocaleString()); set('hs-V', _hs.V.toLocaleString());
  set('hs-k', isFinite(k)?k.toFixed(2):'\u2014'); set('hs-beta', isFinite(beta)?beta.toFixed(3):'\u2014');
  set('hs-r2', isFinite(r2)?r2.toFixed(3):'\u2014');
  drawHerdanSim();
}
function drawHerdanSim(){
  const cv=document.getElementById('hs-canvas'); if(!cv) return;
  const ctx=herdanFitCanvas(cv); const W=cv._w,H=cv._h; ctx.clearRect(0,0,W,H);
  if(!_hs.pts || !_hs.pts.length){ ctx.fillStyle=cssVar('--muted'); ctx.font='14px sans-serif'; ctx.fillText('Enter some text, then select Measure.',20,40); return; }
  const pts=_hs.pts; const Nmax=pts[pts.length-1][0]||1, Vmax=pts[pts.length-1][1]||1;
  const x0=52,y0=H-34,x1=W-18,y1=18, PW=x1-x0, PH=y0-y1;
  const sx=n=>x0+(n/Nmax)*PW, sy=v=>y0-(v/Vmax)*PH;
  ctx.strokeStyle=cssVar('--border'); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x0,y1); ctx.lineTo(x0,y0); ctx.lineTo(x1,y0); ctx.stroke();
  ctx.fillStyle=cssVar('--muted'); ctx.font='500 11px "IBM Plex Mono", monospace';
  ctx.fillText('N (words read) \u2192', x0+PW/2-52, H-12);
  ctx.save(); ctx.translate(15,y1+PH/2+50); ctx.rotate(-Math.PI/2); ctx.fillText('|V| (vocabulary) \u2192',0,0); ctx.restore();
  ctx.fillText('0', x0-7, y0+15);
  ctx.fillText(Nmax.toLocaleString(), x1-46, y0+15);
  ctx.fillText(Vmax.toLocaleString(), 6, y1+8);
  if(isFinite(_hs.k)&&isFinite(_hs.beta)){
    ctx.strokeStyle='rgba(255,95,142,0.75)'; ctx.lineWidth=2; ctx.setLineDash([6,4]);
    ctx.beginPath();
    for(let i=0;i<=PW;i++){ const n=Math.max((i/PW)*Nmax,1); const v=_hs.k*Math.pow(n,_hs.beta); const py=sy(v); if(i===0)ctx.moveTo(x0+i,py); else ctx.lineTo(x0+i,py); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.strokeStyle=cssVar('--accent'); ctx.lineWidth=2.5;
  ctx.beginPath();
  for(let i=0;i<pts.length;i++){ const px=sx(pts[i][0]), py=sy(pts[i][1]); if(i===0)ctx.moveTo(px,py); else ctx.lineTo(px,py); }
  ctx.stroke();
  ctx.font='500 11px "IBM Plex Mono", monospace';
  ctx.fillStyle=cssVar('--accent'); ctx.fillText('\u25cf measured growth', x0+12, y1+14);
  ctx.fillStyle='rgba(255,95,142,0.9)'; ctx.fillText('\u254c\u254c fitted  k\u00b7N^\u03b2', x0+150, y1+14);
}
function toggleHerdanFull(){
  const host=document.getElementById('herdan-sim-viz'); if(!host) return;
  const card=host.closest('.viz-container')||host;
  _hs.full=!_hs.full;
  if(_hs.full){ card.classList.add('herdan-full'); document.body.style.overflow='hidden'; }
  else { card.classList.remove('herdan-full'); document.body.style.overflow=''; }
  const btn=document.getElementById('hs-expand'); if(btn) btn.innerHTML=_hs.full?'\u2715 Close':'\u2922 Full screen';
  requestAnimationFrame(()=>requestAnimationFrame(drawHerdanSim));
}
document.addEventListener('keydown', function(e){ if(e.key==='Escape' && _hs.full) toggleHerdanFull(); });

// ── MORPHEME ANALYZER (heuristic, approximate) ──────────────
const MORPH_PREFIX = {
  un:'not / reverse', re:'again / back', pre:'before', post:'after', dis:'not / opposite',
  non:'not', anti:'against', de:'remove / reverse', over:'too much', under:'too little',
  mis:'wrongly', sub:'under', super:'above', inter:'between', trans:'across', en:'make / put into',
  co:'together', ex:'former / out', im:'not', il:'not', ir:'not', auto:'self', mid:'middle'
};
// suffix -> [meaning, kind]  kind: 'infl' or 'deriv'
const MORPH_SUFFIX = [
  ['ness',['the state of being','deriv']],
  ['ment',['the result / act of','deriv']],
  ['ation',['the act / process of','deriv']],
  ['tion',['the act / process of','deriv']],
  ['sion',['the act / process of','deriv']],
  ['able',['able to be','deriv']],
  ['ible',['able to be','deriv']],
  ['ship',['state / skill of','deriv']],
  ['hood',['state of being','deriv']],
  ['less',['without','deriv']],
  ['ful',['full of','deriv']],
  ['ist',['one who','deriv']],
  ['ism',['belief / system','deriv']],
  ['ize',['to make / become','deriv']],
  ['ise',['to make / become','deriv']],
  ['ity',['the quality of','deriv']],
  ['ous',['full of / having','deriv']],
  ['ive',['tending to','deriv']],
  ['ial',['relating to','deriv']],
  ['al',['relating to','deriv']],
  ['ly',['in a ... manner','deriv']],
  ['dom',['domain / state of','deriv']],
  ['est',['most (superlative)','infl']],
  ['ing',['ongoing action','infl']],
  ['ed',['past tense','infl']],
  ['er',['comparative / one who','infl']],
  ['en',['made of / past participle','infl']],
  ['es',['plural / 3rd-person','infl']],
  ['s',['plural / 3rd-person','infl']]
];
const MORPH_CLITIC = { "n't":'not (negation)', "'s":"is / has / possessive", "'re":'are', "'ve":'have', "'ll":'will', "'d":'would / had', "'m":'am' };
const MORPH_STOP = new Set(("the of a an and or but to in on at by for with as is are was were be been being am do does did has have had not no yes "
 +"i you he she it we they this that these those his her him its our their my your me us them who whom whose which what when where why how "
 +"here there then than so if else while once "
 +"thing king ring sing bring spring string wing during morning evening ceiling something nothing anything everything "
 +"under over after other another number water father mother brother sister winter summer never ever clever proper paper "
 +"address across class glass grass pass miss kiss boss less unless this his us bus plus gas yes news series species always perhaps "
 +"red bed wed need feed seed indeed bread dead head read instead spread "
 +"very many few much most best worst else only just also even still able "
 +"remember member consider whatever however moreover together weather gather rather order border wonder wander "
 +"letter better butter matter bitter center enter master faster monster computer character corner dinner power flower "
 +"tiger finger silver river cover offer suffer differ danger anger super proper paper regular popular similar familiar "
 +"call called calling fall fill filled tell sell roll pull will well small ball kill hill still skill smell shell all add off").split(/\s+/));

function morphAnalyzeWord(orig){
  const w0 = orig.toLowerCase();
  let body = w0;
  // 1. clitic at end
  const clitMatch = body.match(/(n't|'s|'re|'ve|'ll|'d|'m)$/);
  let clitic=null;
  if (clitMatch && body.length>clitMatch[0].length){ clitic=clitMatch[0]; body=body.slice(0,body.length-clitic.length); }
  const finish=(pieces)=>{ if(clitic) pieces.push({form:clitic,label:'clitic',gloss:MORPH_CLITIC[clitic]||'attached word',kind:'clitic'}); return pieces; };
  // 2. whole-word stoplist -> single root
  if (MORPH_STOP.has(body)) return finish([{form:body,label:'root',gloss:'core meaning',kind:'root'}]);
  // 3. suffixes first (longest-first, repeated), with spelling fixes
  const suffixes=[]; let guard=0;
  while (guard++ < 4){
    let stripped=false;
    for (const [suf,info] of MORPH_SUFFIX){
      if (!body.endsWith(suf)) continue;
      if (suf==='s' && /(ss|us|is|as|os)$/.test(body)) continue;
      let root = body.slice(0, body.length-suf.length);
      if ((suf==='s'||suf==='es') && body.endsWith('ies')) root = body.slice(0,body.length-3)+'y';
      else if (suf==='ed' && body.endsWith('ied')) root = body.slice(0,body.length-3)+'y';
      if ((suf==='ing'||suf==='ed'||suf==='er'||suf==='est') && root.length>=3 && /([bdfglmnprt])\1$/.test(root)) root = root.slice(0,-1);
      if (root.length>=3 && /i$/.test(root)) root = root.slice(0,-1)+'y';  // happi->happy, studi->study
      if (root.length < 3) continue;
      suffixes.unshift({form:suf,label:info[1]==='infl'?'inflectional suffix':'derivational suffix',gloss:info[0],kind:info[1]==='infl'?'infl':'deriv'});
      body=root; stripped=true; break;
    }
    if(!stripped) break;
  }
  // 4. one prefix, applied to the remaining stem
  let prefix=null;
  for (const p of Object.keys(MORPH_PREFIX).sort((a,b)=>b.length-a.length)){
    if (body.startsWith(p) && body.length-p.length>=3){ prefix=p; body=body.slice(p.length); break; }
  }
  const pieces=[];
  if (prefix) pieces.push({form:prefix,label:'prefix',gloss:MORPH_PREFIX[prefix],kind:'prefix'});
  pieces.push({form:body,label:'root',gloss:'core meaning',kind:'root'});
  for (const s of suffixes) pieces.push(s);
  return finish(pieces);
}

const MORPH_COLORS = { root:'#4DE3FF', prefix:'#a78bfa', infl:'#3DDC84', deriv:'#ffb347', clitic:'#FF5F8E' };

let _mph={ full:false };
function buildMorphViz(){
  const host=document.getElementById('morph-viz'); if(!host) return;
  host.innerHTML =
    '<textarea id="mph-text" spellcheck="false" style="width:100%;height:80px;background:var(--surface2);border:1px solid var(--border2);border-radius:10px;padding:.8rem;font-family:var(--mono);font-size:.82rem;color:var(--text);outline:none;resize:vertical;line-height:1.6">The teachers happily rewrote the unhappiest student\'s misspelled essays.</textarea>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:.9rem 0">'
    +'<button id="mph-go" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.55rem 1.3rem;font-family:var(--mono);font-size:.74rem;font-weight:700;cursor:pointer">Analyze</button>'
    +'<button id="mph-expand" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.55rem 1rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">\u2922 Full screen</button>'
    +'<span style="background:rgba(77,227,255,.08);border:1px solid rgba(77,227,255,.2);border-radius:7px;padding:.4rem .8rem;font-family:var(--mono);font-size:.74rem;color:var(--accent)">avg morphemes / word = <strong id="mph-avg">&mdash;</strong></span>'
    +'</div>'
    +'<div style="display:flex;gap:14px;flex-wrap:wrap;margin:.4rem 0 1rem;font-family:var(--mono);font-size:.62rem;color:var(--muted)">'
    +'<span style="color:'+MORPH_COLORS.root+'">\u25cf root</span><span style="color:'+MORPH_COLORS.prefix+'">\u25cf prefix</span>'
    +'<span style="color:'+MORPH_COLORS.infl+'">\u25cf inflectional</span><span style="color:'+MORPH_COLORS.deriv+'">\u25cf derivational</span>'
    +'<span style="color:'+MORPH_COLORS.clitic+'">\u25cf clitic</span></div>'
    +'<div id="mph-gauge" style="margin:0 0 1.2rem"></div>'
    +'<div id="mph-out"></div>';
  document.getElementById('mph-go').addEventListener('click', runMorph);
  document.getElementById('mph-expand').addEventListener('click', toggleMorphFull);
  runMorph();
}
function runMorph(){
  const ta=document.getElementById('mph-text'); const out=document.getElementById('mph-out'); if(!ta||!out) return;
  const words=(ta.value.match(/[A-Za-z][A-Za-z']*/g))||[];
  let total=0; let html='';
  for(const w of words){
    const parts=morphAnalyzeWord(w); total+=parts.length;
    let chips='';
    for(let i=0;i<parts.length;i++){
      const p=parts[i];
      const col=MORPH_COLORS[p.kind]||'#888';
      chips+=(i>0?'<span style="color:var(--border2);align-self:center;font-size:1.1rem">+</span>':'')
        +'<div style="display:flex;flex-direction:column;align-items:center;gap:2px">'
        +'<div style="font-family:var(--mono);font-size:.9rem;font-weight:700;color:'+col+';border:1px solid '+col+'55;background:'+col+'12;border-radius:7px;padding:.3rem .65rem">'+escapeHtml(p.form)+'</div>'
        +'<div style="font-family:var(--mono);font-size:.56rem;color:var(--muted);text-transform:uppercase;letter-spacing:.04em">'+p.label+'</div>'
        +'<div style="font-size:.62rem;color:var(--muted2,#8a8aa8);max-width:120px;text-align:center">'+escapeHtml(p.gloss)+'</div>'
        +'</div>';
    }
    html+='<div style="margin-bottom:1.1rem">'
      +'<div style="font-family:var(--mono);font-size:.78rem;color:var(--text);margin-bottom:.45rem">'+escapeHtml(w)+' <span style="color:var(--muted)">\u2192 '+parts.length+' morpheme'+(parts.length>1?'s':'')+'</span></div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-start">'+chips+'</div></div>';
  }
  out.innerHTML = html || '<div style="color:var(--muted);font-family:var(--mono);font-size:.78rem">Type a sentence and press Analyze.</div>';
  const avg=words.length? (total/words.length):0;
  const ae=document.getElementById('mph-avg'); if(ae) ae.textContent=avg.toFixed(2);
  // typology gauge: place the measured ratio on the isolating -> polysynthetic axis
  const g=document.getElementById('mph-gauge');
  if(g){
    const LO=1, HI=4, pct=Math.max(0,Math.min(1,(avg-LO)/(HI-LO)))*100;
    const refs=[['Chinese',1.06],['English',1.5],['Turkish',2.3],['Inuktitut',3.7]];
    let ticks='';
    for(const [name,val] of refs){ const rp=Math.max(0,Math.min(1,(val-LO)/(HI-LO)))*100;
      ticks+='<div style="position:absolute;left:'+rp.toFixed(1)+'%;top:0;transform:translateX(-50%);text-align:center">'
        +'<div style="width:1px;height:9px;background:var(--border2);margin:0 auto"></div>'
        +'<div style="font-family:var(--mono);font-size:.54rem;color:var(--muted);margin-top:2px;white-space:nowrap">'+name+'</div>'
        +'<div style="font-family:var(--mono);font-size:.5rem;color:var(--border2)">'+val.toFixed(2)+'</div></div>';
    }
    g.innerHTML =
      '<div style="font-family:var(--mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem">Morphological typology &middot; where this text lands</div>'
      +'<div style="position:relative;height:10px;border-radius:5px;background:linear-gradient(90deg,#4DE3FF,#A18FFF,#FF5F8E)">'
      +'<div style="position:absolute;left:'+pct.toFixed(1)+'%;top:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:var(--text);border:2px solid var(--bg);box-shadow:0 0 0 2px var(--text)"></div>'
      +'</div>'
      +'<div style="position:relative;height:34px;margin-top:5px">'+ticks+'</div>'
      +'<div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.55rem;color:var(--muted);margin-top:-2px"><span>isolating (1 morpheme/word)</span><span>polysynthetic (many)</span></div>';
  }
}
function toggleMorphFull(){
  const host=document.getElementById('morph-viz'); if(!host) return;
  const card=host.closest('.viz-container')||host;
  _mph.full=!_mph.full;
  if(_mph.full){ card.classList.add('morph-full'); document.body.style.overflow='hidden'; }
  else { card.classList.remove('morph-full'); document.body.style.overflow=''; }
  const b=document.getElementById('mph-expand'); if(b) b.innerHTML=_mph.full?'\u2715 Close':'\u2922 Full screen';
}
document.addEventListener('keydown', function(e){ if(e.key==='Escape' && _mph.full) toggleMorphFull(); });

// ── UNICODE / ENCODING MODELS ───────────────────────────────
function uniEsc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function cpToUTF8(cp){ if(cp<0x80)return[cp]; if(cp<0x800)return[0xC0|cp>>6,0x80|cp&0x3F]; if(cp<0x10000)return[0xE0|cp>>12,0x80|(cp>>6&0x3F),0x80|cp&0x3F]; return[0xF0|cp>>18,0x80|(cp>>12&0x3F),0x80|(cp>>6&0x3F),0x80|cp&0x3F]; }
function cpToUTF16(cp){ if(cp<=0xFFFF)return[cp>>8&0xFF,cp&0xFF]; cp-=0x10000; var hi=0xD800|cp>>10, lo=0xDC00|(cp&0x3FF); return[hi>>8&0xFF,hi&0xFF,lo>>8&0xFF,lo&0xFF]; }
function cpToUTF32(cp){ return[(cp>>>24)&0xFF,cp>>16&0xFF,cp>>8&0xFF,cp&0xFF]; }
function hex2(b){ return b.toString(16).toUpperCase().padStart(2,'0'); }
function bits8(b){ return b.toString(2).padStart(8,'0'); }
function uhex(cp){ return 'U+'+cp.toString(16).toUpperCase().padStart(4,'0'); }

// hostId -> redraw callback, invoked after the fullscreen layout settles so
// canvas-based figures re-measure and re-render at the new size.
var VIZ_FS_REDRAW = {};
function vizRegisterRedraw(hostId, fn){ VIZ_FS_REDRAW[hostId]=fn; }
function vizFsRedraw(hostId){
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    window.dispatchEvent(new Event('resize'));
    var fn=VIZ_FS_REDRAW[hostId]; if(fn){ try{ fn(); }catch(e){} }
  }); });
}
function vizToggleFull(hostId){
  var el=document.getElementById(hostId); if(!el) return;
  var card=el.closest('.viz-container')||el;
  var on=!card.classList.contains('viz-fullscreen');
  card.classList.toggle('viz-fullscreen',on);
  document.body.style.overflow=on?'hidden':'';
  var b=card.querySelector('.viz-fs-btn'); if(b) b.innerHTML=on?'\u2715 Close':'\u2922 Full screen';
  vizFsRedraw(hostId);
}
document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ document.querySelectorAll('.viz-container.viz-fullscreen').forEach(function(c){ c.classList.remove('viz-fullscreen'); document.body.style.overflow=''; var b=c.querySelector('.viz-fs-btn'); if(b)b.innerHTML='\u2922 Full screen'; var body=c.querySelector('.viz-body'); if(body&&body.id) vizFsRedraw(body.id); }); } });
function fsBtn(hostId){ return '<button class="viz-fs-btn" onclick="vizToggleFull(\''+hostId+'\')" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .9rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">\u2922 Full screen</button>'; }

function buildUnicodeViz(){ buildAsciiModel(); buildCPModel(); buildUtfModel(); }

// ---- Model 1: ASCII ----
var _asc={mode:'enc', text:{enc:'Cat & 7', dec:'67 97 116 32 38 32 55'}};
function buildAsciiModel(){
  var host=document.getElementById('ascii-viz'); if(!host) return;
  host.innerHTML=
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:.9rem">'
    +'<div style="display:inline-flex;border:1px solid var(--border2);border-radius:8px;overflow:hidden;font-family:var(--mono);font-size:.72rem">'
    +'<button id="asc-m1" onclick="ascSetMode(\'enc\')" style="padding:.45rem .9rem;border:none;cursor:pointer">Text \u2192 ASCII</button>'
    +'<button id="asc-m2" onclick="ascSetMode(\'dec\')" style="padding:.45rem .9rem;border:none;cursor:pointer">ASCII \u2192 Text</button>'
    +'</div>'+fsBtn('ascii-viz')+'</div>'
    +'<input id="asc-in" oninput="runAscii()" style="width:100%;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.7rem .9rem;font-family:var(--mono);font-size:.95rem;color:var(--text);outline:none" />'
    +'<div id="asc-out" style="margin-top:1rem"></div>';
  var i=document.getElementById('asc-in'); if(i) i.value=_asc.text[_asc.mode];
  ascStyle(); runAscii();
}
function ascStyle(){
  var b1=document.getElementById('asc-m1'), b2=document.getElementById('asc-m2'); if(!b1||!b2)return;
  b1.style.background=_asc.mode==='enc'?'var(--accent)':'transparent'; b1.style.color=_asc.mode==='enc'?'var(--bg)':'var(--muted)';
  b2.style.background=_asc.mode==='dec'?'var(--accent)':'transparent'; b2.style.color=_asc.mode==='dec'?'var(--bg)':'var(--muted)';
}
function ascSetMode(m){
  if(m===_asc.mode) return;
  var i=document.getElementById('asc-in'); if(i) _asc.text[_asc.mode]=i.value;   // remember what was typed
  _asc.mode=m;
  if(i) i.value=(_asc.text[m]!==undefined?_asc.text[m]:'');                       // restore the other mode's text
  ascStyle(); runAscii();
}
function runAscii(){
  var i=document.getElementById('asc-in'), out=document.getElementById('asc-out'); if(!i||!out)return;
  if(_asc.mode==='enc'){
    var chars=Array.from(i.value); var h='<div style="display:flex;gap:8px;flex-wrap:wrap">';
    for(var n=0;n<chars.length;n++){ var ch=chars[n]; var code=ch.codePointAt(0); var ok=code<128; var col=ok?'var(--accent)':'var(--accent3)';
      var binsq='';
      if(ok){ var bs=bits8(code); for(var k=0;k<8;k++){ binsq+='<div style="width:11px;height:11px;border-radius:2px;background:'+(bs[k]==='1'?'var(--accent)':'var(--surface3)')+'"></div>'; } }
      h+='<div style="background:var(--surface2);border:1px solid '+(ok?'var(--border)':'var(--accent3)')+';border-radius:9px;padding:.6rem;text-align:center;min-width:62px">'
        +'<div style="font-size:1.4rem;font-weight:700;color:var(--text);min-height:1.7rem">'+(ch===' '?'<span style="color:var(--muted)">\u2423</span>':uniEsc(ch))+'</div>'
        +(ok?('<div style="font-family:var(--mono);font-size:.82rem;color:'+col+';margin-top:.2rem">'+code+'</div>'
        +'<div style="font-family:var(--mono);font-size:.6rem;color:var(--muted)">0x'+hex2(code)+'</div>'
        +'<div style="display:flex;gap:2px;justify-content:center;margin-top:.45rem">'+binsq+'</div>')
        :'<div style="font-family:var(--mono);font-size:.6rem;color:var(--accent3);margin-top:.4rem">not ASCII</div>')
        +'</div>';
    }
    h+='</div>';
    if(chars.some(function(c){return c.codePointAt(0)>=128;})) h+='<div style="margin-top:.8rem;font-family:var(--mono);font-size:.7rem;color:var(--accent3)">Red cells fall outside ASCII (0-127). ASCII cannot store them. Unicode can.</div>';
    out.innerHTML=h;
  } else {
    var nums=(i.value.match(/\d+/g)||[]).map(Number); var txt='', cells='';
    for(var j=0;j<nums.length;j++){ var nn=nums[j]; if(nn>=0&&nn<128){ var c=String.fromCharCode(nn); txt+=c;
      cells+='<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.5rem .6rem;text-align:center;min-width:46px"><div style="font-family:var(--mono);font-size:.74rem;color:var(--accent)">'+nn+'</div><div style="font-size:1.2rem;color:var(--text)">'+(c===' '?'\u2423':uniEsc(c))+'</div></div>'; } }
    out.innerHTML='<div style="font-size:1.2rem;color:var(--text);margin-bottom:.8rem;word-break:break-word">\u201c'+uniEsc(txt)+'\u201d</div><div style="display:flex;gap:6px;flex-wrap:wrap">'+cells+'</div>';
  }
}

// ---- Model 2: Unicode code points ----
var _cp={mode:'enc', text:{enc:'café 中 😀', dec:'U+0041 U+00E9 U+4E2D U+1F600'}};
function buildCPModel(){
  var host=document.getElementById('cp-viz'); if(!host)return;
  host.innerHTML=
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:.9rem">'
    +'<div style="display:inline-flex;border:1px solid var(--border2);border-radius:8px;overflow:hidden;font-family:var(--mono);font-size:.72rem">'
    +'<button id="cp-m1" onclick="cpSetMode(\'enc\')" style="padding:.45rem .9rem;border:none;cursor:pointer">Text \u2192 Code points</button>'
    +'<button id="cp-m2" onclick="cpSetMode(\'dec\')" style="padding:.45rem .9rem;border:none;cursor:pointer">Code points \u2192 Text</button>'
    +'</div>'+fsBtn('cp-viz')+'</div>'
    +'<input id="cp-in" oninput="runCP()" style="width:100%;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.7rem .9rem;font-family:var(--mono);font-size:1rem;color:var(--text);outline:none" />'
    +'<div id="cp-out" style="margin-top:1rem"></div>';
  var i=document.getElementById('cp-in'); if(i) i.value=_cp.text[_cp.mode];
  cpStyle(); runCP();
}
function cpStyle(){
  var b1=document.getElementById('cp-m1'), b2=document.getElementById('cp-m2'); if(!b1||!b2)return;
  b1.style.background=_cp.mode==='enc'?'var(--accent2)':'transparent'; b1.style.color=_cp.mode==='enc'?'var(--bg)':'var(--muted)';
  b2.style.background=_cp.mode==='dec'?'var(--accent2)':'transparent'; b2.style.color=_cp.mode==='dec'?'var(--bg)':'var(--muted)';
}
function cpSetMode(m){
  if(m===_cp.mode) return;
  var i=document.getElementById('cp-in'); if(i) _cp.text[_cp.mode]=i.value;
  _cp.mode=m;
  if(i) i.value=(_cp.text[m]!==undefined?_cp.text[m]:'');
  cpStyle(); runCP();
}
function runCP(){
  var i=document.getElementById('cp-in'), out=document.getElementById('cp-out'); if(!i||!out)return;
  if(_cp.mode==='enc'){
    var arr=Array.from(i.value); var h='<div style="display:flex;gap:8px;flex-wrap:wrap">';
    for(var n=0;n<arr.length;n++){ var ch=arr[n]; var cp=ch.codePointAt(0); var ascii=cp<128;
      h+='<div style="background:var(--surface2);border:1px solid '+(ascii?'var(--border)':'var(--accent2)')+';border-radius:9px;padding:.6rem .7rem;text-align:center;min-width:66px">'
        +'<div style="font-size:1.6rem;color:var(--text);min-height:1.9rem">'+(ch===' '?'<span style="color:var(--muted)">\u2423</span>':uniEsc(ch))+'</div>'
        +'<div style="font-family:var(--mono);font-size:.76rem;color:'+(ascii?'var(--muted)':'var(--accent2)')+';margin-top:.25rem">'+uhex(cp)+'</div>'
        +'<div style="font-family:var(--mono);font-size:.6rem;color:var(--muted)">'+cp+'</div></div>';
    }
    h+='</div>'; out.innerHTML=h;
  } else {
    var toks=(i.value.match(/U\+[0-9A-Fa-f]+|0x[0-9A-Fa-f]+|\d+/g)||[]); var txt='',cells='';
    for(var j=0;j<toks.length;j++){ var t=toks[j], cp; if(/^U\+/i.test(t))cp=parseInt(t.slice(2),16); else if(/^0x/i.test(t))cp=parseInt(t,16); else cp=parseInt(t,10);
      if(cp>=0&&cp<=0x10FFFF&&!(cp>=0xD800&&cp<=0xDFFF)){ var ch=''; try{ch=String.fromCodePoint(cp);}catch(e){ch='?';} txt+=ch;
        cells+='<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.5rem;text-align:center;min-width:60px"><div style="font-family:var(--mono);font-size:.66rem;color:var(--accent2)">'+uhex(cp)+'</div><div style="font-size:1.5rem;color:var(--text)">'+(ch===' '?'\u2423':uniEsc(ch))+'</div></div>'; } }
    out.innerHTML='<div style="font-size:1.5rem;color:var(--text);margin-bottom:.8rem;word-break:break-word">'+uniEsc(txt)+'</div><div style="display:flex;gap:6px;flex-wrap:wrap">'+cells+'</div>';
  }
}

// ---- Model 3: UTF-8 / 16 / 32 ----
function byteBoxes(bytes, struct){
  var h='<div style="display:flex;gap:8px;flex-wrap:wrap">';
  for(var k=0;k<bytes.length;k++){ var bs=bits8(bytes[k]); var s=struct?struct[k]:0; var bitsHtml='';
    for(var bi=0;bi<8;bi++){ var isS=bi<s; bitsHtml+='<span style="display:inline-block;width:13px;text-align:center;font-family:var(--mono);font-size:.72rem;color:'+(isS?'var(--muted)':'var(--accent)')+';'+(isS?'opacity:.65':'font-weight:700')+'">'+bs[bi]+'</span>'; }
    h+='<div style="text-align:center"><div style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:.35rem .4rem">'+bitsHtml+'</div><div style="font-family:var(--mono);font-size:.58rem;color:var(--muted);margin-top:.2rem">0x'+hex2(bytes[k])+(struct?(k===0?' lead':' cont'):'')+'</div></div>';
  }
  h+='</div>'; return h;
}
function buildUtfModel(){
  var host=document.getElementById('utf-viz'); if(!host)return;
  var samples=[['ASCII','A'],['Latin','café'],['Greek','λόγος'],['Cyrillic','мир'],['CJK','中文'],['Arabic','\u0644\u063a\u0629'],['Emoji','\ud83d\ude00'],['ZWJ family','\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66']];
  var chips=samples.map(function(s){ return '<button onclick="utfSet(this.getAttribute(\'data-v\'))" data-v="'+s[1].replace(/"/g,'&quot;')+'" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);border-radius:6px;padding:.3rem .6rem;font-family:var(--mono);font-size:.64rem;cursor:pointer">'+s[0]+'</button>'; }).join('');
  host.innerHTML=
    '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:.9rem"><div style="font-family:var(--mono);font-size:.72rem;color:var(--muted)">Enter text:</div>'+fsBtn('utf-viz')+'</div>'
    +'<input id="utf-in" oninput="runUtf()" value="A é 中 😀" style="width:100%;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.7rem .9rem;font-family:var(--mono);font-size:1rem;color:var(--text);outline:none" />'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:.6rem"><span style="font-family:var(--mono);font-size:.62rem;color:var(--muted);align-self:center">try a script:</span>'+chips+'</div>'
    +'<div id="utf-sum" style="margin-top:1rem"></div><div id="utf-out" style="margin-top:1rem"></div>';
  runUtf();
}
function utfSet(v){ var i=document.getElementById('utf-in'); if(i){ i.value=v; runUtf(); } }
function runUtf(){
  var i=document.getElementById('utf-in'); if(!i)return;
  var cps=Array.from(i.value).map(function(c){return c.codePointAt(0);});
  var t8=0,t16=0,t32=0;
  for(var a=0;a<cps.length;a++){ t8+=cpToUTF8(cps[a]).length; t16+=(cps[a]<=0xFFFF?2:4); t32+=4; }
  var mx=Math.max(t8,t16,t32,1);
  function bar(label,val,col){ return '<div style="display:flex;align-items:center;gap:10px;margin:.35rem 0"><div style="font-family:var(--mono);font-size:.72rem;color:'+col+';width:62px">'+label+'</div><div style="flex:1;background:var(--surface3);border-radius:6px;overflow:hidden;height:22px"><div style="width:'+(val/mx*100)+'%;height:100%;background:'+col+';opacity:.85"></div></div><div style="font-family:var(--mono);font-size:.72rem;color:var(--text);width:64px;text-align:right">'+val+' bytes</div></div>'; }
  document.getElementById('utf-sum').innerHTML=
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:1rem 1.1rem">'
    +'<div style="font-family:var(--mono);font-size:.64rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:.5rem">Total size of your text</div>'
    +bar('UTF-8',t8,'var(--accent)')+bar('UTF-16',t16,'var(--accent2)')+bar('UTF-32',t32,'var(--accent3)')
    +'<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.5rem">'+cps.length+' code points &middot; UTF-32 always uses 4 bytes each &middot; UTF-8 is smallest for plain English</div>'
    +(function(){ var gc=cps.length; try{ if(typeof Intl!=='undefined'&&Intl.Segmenter){ gc=[...new Intl.Segmenter().segment(i.value)].length; } }catch(e){}
       return gc<cps.length ? '<div style="font-family:var(--mono);font-size:.62rem;color:var(--accent2);margin-top:.35rem;border-top:1px solid var(--border);padding-top:.5rem">What you see as <strong>'+gc+'</strong> character'+(gc===1?'':'s')+' is <strong>'+cps.length+'</strong> code points. One grapheme can be several code points joined by ZWJ (U+200D) or combining marks.</div>' : ''; })()
    +'</div>';
  var h='';
  for(var n=0;n<cps.length;n++){ var cp=cps[n]; var ch=String.fromCodePoint(cp);
    var u8=cpToUTF8(cp), u16=cpToUTF16(cp), u32=cpToUTF32(cp);
    var struct=u8.map(function(b,k){ return k===0?(u8.length===1?1:u8.length+1):2; });
    h+='<div style="background:var(--surface2);border:1px solid var(--border);border-radius:11px;padding:1rem;margin-bottom:.9rem">'
      +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:.7rem;flex-wrap:wrap"><div style="font-size:1.9rem;color:var(--text)">'+(ch===' '?'\u2423':uniEsc(ch))+'</div><div style="font-family:var(--mono);font-size:.8rem;color:var(--accent2)">'+uhex(cp)+'</div><div style="font-family:var(--mono);font-size:.64rem;color:var(--muted)">UTF-8 '+u8.length+'B &middot; UTF-16 '+u16.length+'B &middot; UTF-32 4B</div></div>'
      +'<div style="font-family:var(--mono);font-size:.58rem;color:var(--muted);margin:.2rem 0 .3rem">UTF-8 bits &mdash; grey = structure, cyan = character value</div>'
      +byteBoxes(u8,struct)
      +'<div style="display:flex;gap:26px;flex-wrap:wrap;margin-top:.7rem">'
      +'<div><div style="font-family:var(--mono);font-size:.58rem;color:var(--accent2);margin-bottom:.25rem">UTF-16</div>'+byteBoxes(u16,null)+'</div>'
      +'<div><div style="font-family:var(--mono);font-size:.58rem;color:var(--accent3);margin-bottom:.25rem">UTF-32</div>'+byteBoxes(u32,null)+'</div>'
      +'</div></div>';
  }
  document.getElementById('utf-out').innerHTML=h;
}

// ═══ 2.5 CORPORA ════════════════════════════════════════════
function buildCorpusViz(){ buildCodeSwitch(); buildSociograph(); }

var CS_EXAMPLES = [
  { name:'Spanish + English (Spanglish)', a:'English', b:'Spanish', words:[['I','a'],["'m",'a'],['going','a'],['to','a'],['la','b'],['tienda','b'],['to','a'],['comprar','b'],['some','a'],['milk','a']] },
  { name:'Hindi + English (Hinglish)', a:'English', b:'Hindi', words:[['This','a'],['movie','a'],['is','a'],['bilkul','b'],['bekaar','b'],[',','a'],["let's",'a'],['just','a'],['chalein','b']] },
  { name:'Tagalog + English (Taglish)', a:'English', b:'Tagalog', words:[['Can','a'],['you','a'],['please','a'],['i-send','b'],['mo','b'],['the','a'],['file','a'],['ngayon','b']] },
  { name:'French + English (Franglais)', a:'English', b:'French', words:[['We','a'],['had','a'],['a','a'],['petit','b'],['déjeuner','b'],['before','a'],['the','a'],['réunion','b']] },
  { name:'Arabic + English', a:'English', b:'Arabic', words:[['Yalla','b'],[',','a'],["let's",'a'],['go','a'],[',','a'],['I','a'],['am','a'],['khalas','b'],['done','a']] }
];
var _cs={idx:0};
function buildCodeSwitch(){
  var host=document.getElementById('cs-viz'); if(!host) return;
  var opts=CS_EXAMPLES.map(function(e,i){ return '<option value="'+i+'"'+(i===_cs.idx?' selected':'')+'>'+e.name+'</option>'; }).join('');
  host.innerHTML='<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:1rem">'
    +'<select id="cs-sel" onchange="csPick(this.value)" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .7rem;font-family:var(--mono);font-size:.74rem">'+opts+'</select>'
    +fsBtn('cs-viz')+'</div><div id="cs-out"></div>';
  csRender();
}
function csPick(i){ _cs.idx=+i; csRender(); }
function csRender(){
  var out=document.getElementById('cs-out'); if(!out) return;
  var ex=CS_EXAMPLES[_cs.idx];
  var cA='var(--accent)', cB='var(--accent3)';
  var chips='', switches=0, prev=null;
  ex.words.forEach(function(w){
    var isSwitch = prev!==null && w[1]!==prev && /[a-zA-Z]/.test(w[0]);
    if(isSwitch) switches++;
    var col = w[1]==='a'?cA:cB;
    chips += (isSwitch?'<span style="color:var(--muted);margin:0 2px;font-size:1.1rem">|</span>':'')
      +'<span style="display:inline-block;font-family:var(--mono);font-size:.9rem;background:'+col+'14;border:1px solid '+col+'55;color:var(--text);border-radius:5px;padding:3px 8px;margin:2px">'+uniEsc(w[0])+'</span>';
    if(/[a-zA-Z]/.test(w[0])) prev=w[1];
  });
  out.innerHTML='<div style="line-height:2.4;margin-bottom:1rem">'+chips+'</div>'
    +'<div style="display:flex;gap:16px;flex-wrap:wrap;font-family:var(--mono);font-size:.7rem;margin-bottom:.6rem">'
    +'<span style="color:'+cA+'">\u25cf '+ex.a+'</span><span style="color:'+cB+'">\u25cf '+ex.b+'</span>'
    +'<span style="color:var(--muted)">| = switch point ('+switches+' switches)</span></div>'
    +'<div style="font-size:.78rem;color:var(--muted);line-height:1.6">Code-switching mixes two languages in one utterance. A tokenizer trained on only one of them will split the other language into many small, awkward pieces, so mixed text is harder for models to handle.</div>';
}

// sociolinguistic graph: motivation + situation -> language variety
var SOCIO={
  motivation:[{id:'m1',t:'Show closeness'},{id:'m2',t:'Signal authority'},{id:'m3',t:'Express identity'},{id:'m4',t:'Be understood'}],
  situation:[{id:'s1',t:'At home'},{id:'s2',t:'At work'},{id:'s3',t:'With friends'},{id:'s4',t:'Formal / public'}],
  variety:[{id:'v1',t:'Home language'},{id:'v2',t:'Casual / slang'},{id:'v3',t:'Standard / formal'},{id:'v4',t:'Technical register'}],
  edges:[['m1','s1'],['m1','s3'],['m3','s1'],['m3','s3'],['m2','s2'],['m2','s4'],['m4','s2'],['m4','s4'],
         ['s1','v1'],['s3','v2'],['s1','v2'],['s2','v3'],['s2','v4'],['s4','v3'],['s4','v3']]
};
function buildSociograph(){
  var host=document.getElementById('socio-viz'); if(!host) return;
  host.innerHTML='<div style="display:flex;justify-content:flex-end;margin-bottom:.5rem">'+fsBtn('socio-viz')+'</div>'
    +'<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:.6rem">Hover a node to trace how a speaker\'s motivation and situation shape the language variety they choose.</div>'
    +'<div id="socio-svg"></div>';
  socioRender(null);
}
function socioNodePos(){
  var pos={}, cols=[['motivation',60],['situation',300],['variety',540]];
  var W=600, colKeys=['motivation','situation','variety'], xs=[60,300,540];
  ['motivation','situation','variety'].forEach(function(k,ci){
    SOCIO[k].forEach(function(n,i){ pos[n.id]={x:xs[ci], y:40+i*70, t:n.t, col:ci}; });
  });
  return pos;
}
function socioRender(hi){
  var host=document.getElementById('socio-svg'); if(!host) return;
  var pos=socioNodePos();
  var cols=['var(--accent)','var(--accent2)','var(--accent4)'];
  var active={}; if(hi){ active[hi]=1; SOCIO.edges.forEach(function(e){ if(e[0]===hi)active[e[1]]=1; if(e[1]===hi)active[e[0]]=1; }); }
  var svg='<svg viewBox="0 0 600 320" style="width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">';
  // edges
  SOCIO.edges.forEach(function(e){
    var a=pos[e[0]], b=pos[e[1]]; if(!a||!b) return;
    var on = !hi || (active[e[0]]&&active[e[1]]&&(e[0]===hi||e[1]===hi));
    var mx=(a.x+b.x)/2;
    svg+='<path d="M'+(a.x+55)+' '+(a.y+14)+' C'+mx+' '+(a.y+14)+' '+mx+' '+(b.y+14)+' '+(b.x-55)+' '+(b.y+14)+'" fill="none" stroke="'+(on?'var(--accent)':'var(--border2)')+'" stroke-width="'+(on&&hi?2:1)+'" opacity="'+(on?(hi?0.9:0.4):0.08)+'"/>';
  });
  // nodes
  ['motivation','situation','variety'].forEach(function(k,ci){
    SOCIO[k].forEach(function(n){ var p=pos[n.id]; var on=!hi||active[n.id];
      svg+='<g style="cursor:pointer" onmouseover="socioRender(\''+n.id+'\')" onmouseout="socioRender(null)">'
        +'<rect x="'+(p.x-55)+'" y="'+p.y+'" width="110" height="28" rx="7" fill="var(--surface2)" stroke="'+cols[ci]+'" stroke-width="'+(n.id===hi?2:1)+'" opacity="'+(on?1:0.25)+'"/>'
        +'<text x="'+p.x+'" y="'+(p.y+18)+'" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="'+(on?'var(--text)':'var(--muted)')+'" opacity="'+(on?1:0.4)+'">'+n.t+'</text></g>';
    });
  });
  // column labels
  ['MOTIVATION','SITUATION','LANGUAGE VARIETY'].forEach(function(lab,ci){ var x=[60,300,540][ci];
    svg+='<text x="'+x+'" y="18" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="'+cols[ci]+'" letter-spacing="1">'+lab+'</text>'; });
  svg+='</svg>';
  host.innerHTML=svg;
}

// ═══ 2.6 REGEX PLAYGROUND ═══════════════════════════════════
var RX_PRESETS=[
  ['Words', '\\w+', 'The quick brown fox jumps over 3 lazy dogs.'],
  ['Digits', '\\d+', 'Order 66 shipped on 2026-07-04 for $128.50'],
  ['Email', '[\\w.]+@[\\w.]+', 'Contact ana@site.org or bob_1@mail.co.uk today.'],
  ['Capitalized', '[A-Z][a-z]+', 'Alice and Bob went to New York in April.'],
  ['-ing words', '\\w+ing', 'running jumping sing thing walking bring'],
  ['Repeated letters', '(\\w)\\1', 'letter mississippi bookkeeper aardvark']
];
var _rx={flags:{g:true,i:false,m:false}};
function buildRegexViz(){ buildRegexPlayground(); }
function buildRegexPlayground(){
  var host=document.getElementById('regex-play'); if(!host) return;
  var presets=RX_PRESETS.map(function(p,i){ return '<button onclick="rxLoad('+i+')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:6px;padding:.3rem .6rem;font-family:var(--mono);font-size:.66rem;cursor:pointer;margin:2px">'+p[0]+'</button>'; }).join('');
  host.innerHTML=
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:.7rem"><span style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">presets:</span>'+presets+fsBtn('regex-play')+'</div>'
    +'<div style="display:flex;gap:8px;align-items:center;margin-bottom:.7rem;flex-wrap:wrap">'
    +'<span style="font-family:var(--mono);color:var(--accent3);font-size:1rem">/</span>'
    +'<input id="rx-pat" oninput="rxRun()" value="\\w+ing" spellcheck="false" style="flex:1;min-width:200px;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.55rem .7rem;font-family:var(--mono);font-size:.9rem;color:var(--accent3);outline:none">'
    +'<span style="font-family:var(--mono);color:var(--accent3);font-size:1rem">/</span>'
    +'<label style="font-family:var(--mono);font-size:.72rem;color:var(--muted)"><input type="checkbox" id="rx-g" checked onchange="rxRun()">g</label>'
    +'<label style="font-family:var(--mono);font-size:.72rem;color:var(--muted)"><input type="checkbox" id="rx-i" onchange="rxRun()">i</label>'
    +'<label style="font-family:var(--mono);font-size:.72rem;color:var(--muted)"><input type="checkbox" id="rx-m" onchange="rxRun()">m</label></div>'
    +'<textarea id="rx-text" oninput="rxRun()" spellcheck="false" style="width:100%;height:90px;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.7rem;font-family:var(--mono);font-size:.85rem;color:var(--text);outline:none;resize:vertical;line-height:1.6">The quick brown fox is running and jumping over the sleeping dog.</textarea>'
    +'<div id="rx-status" style="font-family:var(--mono);font-size:.7rem;margin:.7rem 0"></div>'
    +'<div id="rx-out" style="background:var(--surface);border:1px solid var(--border);border-radius:9px;padding:.9rem;font-family:var(--mono);font-size:.85rem;line-height:1.9;white-space:pre-wrap;word-break:break-word;min-height:40px"></div>'
    +'<div id="rx-groups" style="margin-top:.8rem"></div>';
  rxRun();
}
function rxLoad(i){ var p=RX_PRESETS[i]; document.getElementById('rx-pat').value=p[1]; document.getElementById('rx-text').value=p[2]; rxRun(); }
function rxRun(){
  var patEl=document.getElementById('rx-pat'), txtEl=document.getElementById('rx-text'); if(!patEl||!txtEl) return;
  var pat=patEl.value, text=txtEl.value;
  var flags=''; if(document.getElementById('rx-g').checked)flags+='g'; if(document.getElementById('rx-i').checked)flags+='i'; if(document.getElementById('rx-m').checked)flags+='m';
  var status=document.getElementById('rx-status'), out=document.getElementById('rx-out'), groups=document.getElementById('rx-groups');
  var re;
  try{ re=new RegExp(pat, flags.indexOf('g')<0?flags+'g':flags); }
  catch(e){ status.innerHTML='<span style="color:var(--accent3)">invalid regex: '+uniEsc(e.message)+'</span>'; out.innerHTML=uniEsc(text); groups.innerHTML=''; return; }
  var html='', last=0, m, count=0, guard=0, groupRows='';
  re.lastIndex=0;
  while((m=re.exec(text))!==null){
    if(guard++>10000) break;
    var s=m.index, e=s+m[0].length;
    html+=uniEsc(text.slice(last,s))+'<span style="background:rgba(77,227,255,.22);border-radius:3px;box-shadow:0 0 0 1px var(--accent)">'+uniEsc(m[0])+'</span>';
    last=e; count++;
    if(count<=8 && m.length>1){ groupRows+='<div style="font-family:var(--mono);font-size:.68rem;color:var(--muted);margin:2px 0">match '+count+': "'+uniEsc(m[0])+'"'+m.slice(1).map(function(g,gi){ return ' &nbsp;group '+(gi+1)+'="<span style="color:var(--accent2)">'+uniEsc(g===undefined?'':g)+'</span>"'; }).join('')+'</div>'; }
    if(m[0]===''){ re.lastIndex++; }
    if(flags.indexOf('g')<0) break;
  }
  html+=uniEsc(text.slice(last));
  out.innerHTML=html || '<span style="color:var(--muted)">(no text)</span>';
  status.innerHTML='<span style="color:var(--accent)">'+count+' match'+(count===1?'':'es')+'</span>';
  groups.innerHTML=groupRows;
}

// ═══ 2.7 UNIX TOOLS ═════════════════════════════════════════
function buildPracticeViz(){ buildUnixGen(); buildUnixSim(); buildPTBViz(); buildRegexTokViz(); }

// --- generator: text -> command ---
var UNIX_EXAMPLES=['count word frequencies','split into words one per line','lowercase the text','sort lines and remove duplicates','find lines containing cat','show the first 10 lines','count the number of lines','count the number of words'];
function buildUnixGen(){
  var host=document.getElementById('unixgen-viz'); if(!host) return;
  var chips=UNIX_EXAMPLES.map(function(x){ return '<button onclick="ugSet(this)" data-q="'+x+'" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:6px;padding:.3rem .6rem;font-family:var(--mono);font-size:.64rem;cursor:pointer;margin:2px">'+x+'</button>'; }).join('');
  host.innerHTML='<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:.5rem">Describe a text task in plain words. Try:</div><div style="margin-bottom:.7rem">'+chips+'</div>'
    +'<input id="ug-in" oninput="ugRun()" value="count word frequencies" style="width:100%;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.6rem .8rem;font-family:var(--mono);font-size:.9rem;color:var(--text);outline:none">'
    +'<div id="ug-out" style="margin-top:.9rem"></div>';
  ugRun();
}
function ugSet(b){ document.getElementById('ug-in').value=b.getAttribute('data-q'); ugRun(); }
function ugRun(){
  var i=document.getElementById('ug-in'), out=document.getElementById('ug-out'); if(!i||!out) return;
  var q=i.value.toLowerCase();
  var parts=[], notes=[];
  var wantFreq=/frequenc|how many times|count .*word.*(each|frequenc)|most common|word count.*each/.test(q);
  if(/lowercase|lower case|downcase/.test(q)){ parts.push("tr 'A-Z' 'a-z'"); notes.push('lowercase every letter'); }
  if(wantFreq || /split|tokenize|one per line|one word per/.test(q)){ parts.push("tr -sc 'A-Za-z' '\\n'"); notes.push('replace non-letters with newlines, so one word per line'); }
  if(wantFreq){ parts.push('sort'); notes.push('sort so identical words are adjacent'); parts.push('uniq -c'); notes.push('collapse duplicates and count them'); parts.push('sort -rn'); notes.push('sort by count, most frequent first'); }
  else {
    if(/\bsort\b/.test(q)) { parts.push('sort'); notes.push('sort lines'); }
    if(/uniq|dedup|duplicate|unique/.test(q)){ parts.push('uniq'); notes.push('remove adjacent duplicate lines'); }
  }
  var gm=q.match(/(?:find|search|grep|containing|contains|lines with)\s+([a-z0-9]+)/);
  if(gm){ parts.unshift("grep '"+gm[1]+"'"); notes.unshift('keep only lines containing "'+gm[1]+'"'); }
  var hm=q.match(/first\s+(\d+)|top\s+(\d+)/); if(hm){ var n=hm[1]||hm[2]; parts.push('head -n '+n); notes.push('keep the first '+n+' lines'); }
  if(/count.*lines|number of lines|how many lines/.test(q)){ parts.push('wc -l'); notes.push('count the lines'); }
  if(/count.*words|number of words|how many words/.test(q) && !wantFreq){ parts.push('wc -w'); notes.push('count the words'); }
  var cmd = parts.length? ('cat input.txt | '+parts.join(' | ')) : '';
  if(!cmd){ out.innerHTML='<div style="font-family:var(--mono);font-size:.75rem;color:var(--muted)">Try words like: count, frequency, sort, unique, lowercase, split into words, find X, first 10 lines.</div>'; return; }
  out.innerHTML='<div style="background:var(--surface);border:1px solid var(--accent)55;border-radius:9px;padding:.8rem 1rem;font-family:var(--mono);font-size:.82rem;color:var(--accent);overflow:auto">'+uniEsc(cmd)+'</div>'
    +'<div style="margin-top:.7rem">'+parts.map(function(p,idx){ return '<div style="font-family:var(--mono);font-size:.68rem;color:var(--muted);margin:3px 0"><span style="color:var(--text)">'+uniEsc(p)+'</span> &nbsp;\u2014 '+notes[idx]+'</div>'; }).join('')+'</div>';
}

// --- simulator: apply command pipeline to a corpus ---
var UNIX_CORPORA={
  'Tiny sentence':'The cat sat on the mat. The cat ran.',
  'Repeated words':'red blue red green blue red blue green red',
  'Shakespeare line':'To be or not to be that is the question to be',
  'Mixed case':'Apple apple APPLE banana Banana apple BANANA'
};
var _us={corpus:Object.keys(UNIX_CORPORA)[0], pipe:[]};
var UNIX_CMDS=["tr 'A-Z' 'a-z'","tr -sc 'A-Za-z' '\\n'","sort","uniq -c","uniq","sort -rn","head -n 5","rev","wc -l","wc -w"];
function buildUnixSim(){
  var host=document.getElementById('unixsim-viz'); if(!host) return;
  var opts=Object.keys(UNIX_CORPORA).map(function(k){ return '<option'+(k===_us.corpus?' selected':'')+'>'+k+'</option>'; }).join('');
  var palette=UNIX_CMDS.map(function(c){ return '<button onclick="usAdd(this)" data-c="'+uniEsc(c)+'" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:6px;padding:.3rem .6rem;font-family:var(--mono);font-size:.66rem;cursor:pointer;margin:2px">'+uniEsc(c)+'</button>'; }).join('');
  host.innerHTML='<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:.7rem">'
    +'<select id="us-corpus" onchange="usPick(this.value)" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .7rem;font-family:var(--mono);font-size:.72rem">'+opts+'</select>'
    +'<button onclick="usPreset()" style="background:var(--accent2);color:var(--bg);border:none;border-radius:7px;padding:.45rem .8rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">Load word-frequency pipeline</button>'
    +'<button onclick="usUndo()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .8rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">Undo</button>'
    +'<button onclick="usClear()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .8rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">Clear</button>'
    +fsBtn('unixsim-viz')+'</div>'
    +'<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:.35rem">add a command to the pipeline:</div><div style="margin-bottom:.8rem">'+palette+'</div>'
    +'<div id="us-out"></div>';
  usRender();
}
function usPick(c){ _us.corpus=c; usRender(); }
function usAdd(b){ _us.pipe.push(b.getAttribute('data-c')); usRender(); }
function usUndo(){ _us.pipe.pop(); usRender(); }
function usClear(){ _us.pipe=[]; usRender(); }
function usPreset(){ _us.pipe=["tr 'A-Z' 'a-z'","tr -sc 'A-Za-z' '\\n'","sort","uniq -c","sort -rn"]; usRender(); }
function unixApply(lines, cmd){
  if(cmd==="tr 'A-Z' 'a-z'") return lines.map(function(l){ return l.toLowerCase(); });
  if(cmd==="tr -sc 'A-Za-z' '\\n'"){ var t=lines.join('\n').split(/[^A-Za-z]+/).filter(Boolean); return t; }
  if(cmd==='sort') return lines.slice().sort();
  if(cmd==='sort -rn') return lines.slice().sort(function(a,b){ return (parseInt(b,10)||0)-(parseInt(a,10)||0); });
  if(cmd==='uniq'){ var o=[]; lines.forEach(function(l){ if(o.length===0||o[o.length-1]!==l) o.push(l); }); return o; }
  if(cmd==='uniq -c'){ var o=[],cnt=0,cur=null; lines.forEach(function(l){ if(l===cur){cnt++;} else { if(cur!==null)o.push(String(cnt).padStart(4,' ')+' '+cur); cur=l;cnt=1; } }); if(cur!==null)o.push(String(cnt).padStart(4,' ')+' '+cur); return o; }
  if(cmd==='head -n 5') return lines.slice(0,5);
  if(cmd==='rev') return lines.map(function(l){ return Array.from(l).reverse().join(''); });
  if(cmd==='wc -l') return [String(lines.length)];
  if(cmd==='wc -w') return [String(lines.join(' ').split(/\s+/).filter(Boolean).length)];
  return lines;
}
function usRender(){
  var out=document.getElementById('us-out'); if(!out) return;
  var text=UNIX_CORPORA[_us.corpus];
  var lines=[text];
  var stages=[{cmd:'input.txt', lines:lines.slice()}];
  _us.pipe.forEach(function(c){ lines=unixApply(lines, c); stages.push({cmd:c, lines:lines.slice()}); });
  var cmdStr='cat input.txt'+(_us.pipe.length?' | '+_us.pipe.join(' | '):'');
  var h='<div style="background:var(--surface);border:1px solid var(--accent2)55;border-radius:9px;padding:.7rem .9rem;font-family:var(--mono);font-size:.78rem;color:var(--accent2);overflow:auto;margin-bottom:1rem">'+uniEsc(cmdStr)+'</div>';
  h+='<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start">';
  stages.forEach(function(st,idx){
    var shown=st.lines.slice(0,14);
    h+='<div style="flex:1;min-width:130px"><div style="font-family:var(--mono);font-size:.62rem;color:'+(idx===0?'var(--muted)':'var(--accent)')+';margin-bottom:.3rem">'+(idx===0?'input':uniEsc(st.cmd))+'</div>'
      +'<div style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:.5rem;font-family:var(--mono);font-size:.7rem;color:var(--text);white-space:pre;overflow:auto;max-height:230px">'
      +shown.map(function(l){ return uniEsc(l)||'&nbsp;'; }).join('\n')+(st.lines.length>14?'\n<span style="color:var(--muted)">... +'+(st.lines.length-14)+' more</span>':'')+'</div>'
      +'<div style="font-family:var(--mono);font-size:.58rem;color:var(--muted);margin-top:.2rem">'+st.lines.length+' line'+(st.lines.length===1?'':'s')+'</div></div>';
    if(idx<stages.length-1) h+='<div style="align-self:center;color:var(--muted);font-size:1.1rem;padding-top:1rem">\u2192</div>';
  });
  h+='</div>';
  out.innerHTML=h;
}

// ═══ 2.8 additions: Penn Treebank + regex tokenizer ═════════
function ptbTokenize(raw){
  var s = ' ' + raw + ' ';
  s = s.replace(/\.\.\./g, ' ... ');
  // opening quotes
  s = s.replace(/([ (\[{<])"/g, '$1 `` ');
  // closing quotes
  s = s.replace(/"/g, " '' ");
  // separate these punctuation marks
  s = s.replace(/([,;:@#&?!()\[\]{}<>])/g, ' $1 ');
  s = s.replace(/\$/g, ' $ ');
  s = s.replace(/%/g, ' % ');
  // contractions: n't
  s = s.replace(/([A-Za-z])(n['\u2019]t)\b/g, "$1 $2");
  // contractions: 'll 're 've 'd 'm 's
  s = s.replace(/([A-Za-z])['\u2019](ll|re|ve|d|m|s|LL|RE|VE|D|M|S)\b/g, "$1 '$2");
  // final sentence period: a period followed by whitespace or end, not part of abbrev/decimal
  s = s.replace(/([A-Za-z0-9%])\.(\s)/g, "$1 . $2");
  s = s.replace(/([A-Za-z0-9%])\.$/g, "$1 . ");
  return s.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
}
function buildPTBViz(){
  var host=document.getElementById('ptb-viz'); if(!host) return;
  host.innerHTML='<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:.7rem"><span style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">enter text:</span>'+fsBtn('ptb-viz')+'</div>'
    +'<textarea id="ptb-in" oninput="ptbRun()" spellcheck="false" style="width:100%;height:64px;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.7rem;font-family:var(--mono);font-size:.88rem;color:var(--text);outline:none;resize:vertical">"The S.F.-based restaurant," they said, "doesn\'t charge $10".</textarea>'
    +'<div id="ptb-out" style="margin-top:1rem"></div>';
  ptbRun();
}
function ptbRun(){
  var i=document.getElementById('ptb-in'), out=document.getElementById('ptb-out'); if(!i||!out) return;
  var toks=ptbTokenize(i.value);
  var chips=toks.map(function(t){ var punct=/^[^A-Za-z0-9]+$/.test(t); var cl=(t==="n't"||/^'(ll|re|ve|d|m|s)$/.test(t)); var col=cl?'var(--accent3)':(punct?'var(--muted)':'var(--accent)');
    return '<span style="display:inline-block;font-family:var(--mono);font-size:.82rem;background:'+col+'14;border:1px solid '+col+'55;color:var(--text);border-radius:5px;padding:3px 8px;margin:3px">'+uniEsc(t)+'</span>'; }).join('');
  out.innerHTML='<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:.4rem">'+toks.length+' tokens</div><div style="line-height:2.2">'+chips+'</div>'
    +'<div style="display:flex;gap:16px;flex-wrap:wrap;font-family:var(--mono);font-size:.64rem;margin-top:.7rem"><span style="color:var(--accent)">\u25cf word</span><span style="color:var(--accent3)">\u25cf split clitic</span><span style="color:var(--muted)">\u25cf punctuation</span></div>'
    +'<div style="font-size:.76rem;color:var(--muted);line-height:1.6;margin-top:.7rem">Penn Treebank rules: split contractions (does + n\'t), separate punctuation and currency, convert quotes to `` and \x27\x27, and keep hyphenated words together.</div>';
}

var RTOK_PRESETS=[['Words + punctuation','\\w+|[^\\w\\s]'],['Words only','\\w+'],['Whitespace split','\\S+'],['Letters only','[A-Za-z]+']];
function buildRegexTokViz(){
  var host=document.getElementById('regextok-viz'); if(!host) return;
  var pre=RTOK_PRESETS.map(function(p,i){ return '<button onclick="rtLoad('+i+')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:6px;padding:.3rem .6rem;font-family:var(--mono);font-size:.64rem;cursor:pointer;margin:2px">'+p[0]+'</button>'; }).join('');
  host.innerHTML='<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:.6rem"><span style="font-family:var(--mono);font-size:.64rem;color:var(--muted)">token pattern:</span>'+pre+fsBtn('regextok-viz')+'</div>'
    +'<div style="display:flex;gap:8px;align-items:center;margin-bottom:.6rem"><span style="font-family:var(--mono);color:var(--accent3)">/</span><input id="rt-pat" oninput="rtRun()" spellcheck="false" value="\\w+|[^\\w\\s]" style="flex:1;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.5rem .7rem;font-family:var(--mono);font-size:.88rem;color:var(--accent3);outline:none"><span style="font-family:var(--mono);color:var(--accent3)">/g</span></div>'
    +'<textarea id="rt-in" oninput="rtRun()" spellcheck="false" style="width:100%;height:60px;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.7rem;font-family:var(--mono);font-size:.86rem;color:var(--text);outline:none;resize:vertical">Hello, world! It costs $3.50.</textarea>'
    +'<div id="rt-status" style="font-family:var(--mono);font-size:.68rem;margin:.6rem 0;color:var(--accent)"></div>'
    +'<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:.3rem">token list</div>'
    +'<pre id="rt-out" style="background:var(--surface);border:1px solid var(--border);border-radius:9px;padding:.9rem;font-family:var(--mono);font-size:.82rem;color:var(--accent4);overflow:auto;white-space:pre-wrap;word-break:break-word;margin:0"></pre>';
  rtRun();
}
function rtLoad(i){ document.getElementById('rt-pat').value=RTOK_PRESETS[i][1]; rtRun(); }
function rtRun(){
  var p=document.getElementById('rt-pat'), t=document.getElementById('rt-in'), out=document.getElementById('rt-out'), st=document.getElementById('rt-status'); if(!p||!t||!out) return;
  var re;
  try{ re=new RegExp(p.value,'g'); }
  catch(e){ st.style.color='var(--accent3)'; st.textContent='invalid regex: '+e.message; out.textContent='[]'; return; }
  var toks=(t.value.match(re))||[];
  st.style.color='var(--accent)'; st.textContent=toks.length+' tokens';
  var body=toks.map(function(x){ return "  '"+x.replace(/\\/g,'\\\\').replace(/'/g,"\\'")+"'"; }).join(',\n');
  out.textContent='tokens = [\n'+body+'\n]';
}

// ═══ 2.9 additions: alignment model + proof render ══════════
function edComputeAlign(a,b){
  a=Array.from(String(a||'').normalize('NFC')).slice(0,16); b=Array.from(String(b||'').normalize('NFC')).slice(0,16);
  var n=a.length,m=b.length;
  var D=[],F=[];
  for(var i=0;i<=n;i++){ D.push([]); F.push([]); for(var j=0;j<=m;j++){ if(i===0){D[i][j]=j;F[i][j]='i';} else if(j===0){D[i][j]=i;F[i][j]='d';} else {D[i][j]=0;F[i][j]=null;} } }
  for(i=1;i<=n;i++) for(j=1;j<=m;j++){ var match=a[i-1]===b[j-1];
    var del=D[i-1][j]+1, ins=D[i][j-1]+1, sub=D[i-1][j-1]+(match?0:1);
    var best=Math.min(del,ins,sub); D[i][j]=best;
    F[i][j]= (sub<=del&&sub<=ins)?(match?'=':'s'):(del<=ins?'d':'i'); }
  // backtrace
  var ops=[]; i=n; j=m;
  while(i>0||j>0){ var f=F[i][j];
    if(i===0){ ops.unshift({op:'i',s:'*',t:b[j-1]}); j--; }
    else if(j===0){ ops.unshift({op:'d',s:a[i-1],t:'*'}); i--; }
    else if(f==='='||f==='s'){ ops.unshift({op:f,s:a[i-1],t:b[j-1]}); i--; j--; }
    else if(f==='d'){ ops.unshift({op:'d',s:a[i-1],t:'*'}); i--; }
    else { ops.unshift({op:'i',s:'*',t:b[j-1]}); j--; }
  }
  return {dist:D[n][m], ops:ops, a:a, b:b};
}
function buildAlignViz(){
  var host=document.getElementById('align-viz'); if(!host) return;
  host.innerHTML='<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:.9rem">'
    +'<input id="al-a" oninput="alRun()" value="semantics" spellcheck="false" style="width:150px;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.5rem .7rem;font-family:var(--mono);font-size:.88rem;color:var(--text);outline:none">'
    +'<span style="color:var(--muted)">\u2192</span>'
    +'<input id="al-b" oninput="alRun()" value="syntactic" spellcheck="false" style="width:150px;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.5rem .7rem;font-family:var(--mono);font-size:.88rem;color:var(--text);outline:none">'
    +fsBtn('align-viz')+'</div><div id="al-out"></div>';
  alRun();
}
function alRun(){
  var A=document.getElementById('al-a'), B=document.getElementById('al-b'), out=document.getElementById('al-out'); if(!A||!B||!out) return;
  var r=edComputeAlign(A.value, B.value);
  var col={d:'var(--accent3)',i:'var(--accent4)',s:'#a78bfa','=':'var(--muted)'};
  var W=28;
  function cell(ch,c){ return '<span style="display:inline-block;width:'+W+'px;text-align:center;color:'+c+';font-size:1rem;font-family:var(--mono)">'+uniEsc(ch)+'</span>'; }
  var top='', mid='', bot='';
  r.ops.forEach(function(o){ var c=col[o.op]; top+=cell(o.s==='*'?'\u2014':o.s.toUpperCase(), o.s==='*'?'var(--muted)':'var(--text)');
    bot+=cell(o.t==='*'?'\u2014':o.t.toUpperCase(), o.t==='*'?'var(--muted)':'var(--text)');
    mid+='<span style="display:inline-block;width:'+W+'px;text-align:center;color:'+c+';font-size:.62rem;font-weight:700;font-family:var(--mono)">'+(o.op==='='?'|':o.op)+'</span>'; });
  var ic=r.ops.filter(function(o){return o.op==='i';}).length, dc=r.ops.filter(function(o){return o.op==='d';}).length, sc=r.ops.filter(function(o){return o.op==='s';}).length, mc=r.ops.filter(function(o){return o.op==='=';}).length;
  out.innerHTML='<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1.1rem;overflow:auto"><div style="line-height:2;white-space:nowrap">'
    +'<div>'+top+'</div><div>'+mid+'</div><div>'+bot+'</div></div></div>'
    +'<div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:.9rem;font-family:var(--mono);font-size:.72rem">'
    +'<span style="color:var(--accent)">edit distance = '+r.dist+'</span>'
    +'<span style="color:var(--muted)">| '+mc+' match</span>'
    +'<span style="color:#a78bfa">s '+sc+' sub</span>'
    +'<span style="color:var(--accent3)">d '+dc+' del</span>'
    +'<span style="color:var(--accent4)">i '+ic+' ins</span></div>'
    +'<div style="font-size:.75rem;color:var(--muted);line-height:1.6;margin-top:.6rem">The row between the words marks each column: | is a match, s a substitution, d a deletion (top only), i an insertion (bottom only). Costs here are 1 for insert and delete and 1 for substitute.</div>';
}

// ═══ BPE SYSTEM (Section 2.4) ═══════════════════════════════
var BPE_END = '\u2581'; // visible end-of-word marker (like SentencePiece)
var SYNTH_CORPORA = {
  'Classic (low/newest)': 'low low low low low lower lower newest newest newest newest newest newest widest widest widest',
  'English function words': 'the the the the of of of and and and to to the then them there their that this the',
  '-ing verbs': 'running running jumping jumping singing running walking talking talking running jumping',
  '-tion nouns': 'nation action station motion nation station action fiction fiction motion nation action',
  'abracadabra': 'abracadabra abracadabra cadabra abra abra cadabra abracadabra abra',
  'fruits': 'apple apple apples apples applesauce pineapple pineapple apple pineapples apples',
  'DNA strands': 'gattaca gattaca gattgatt acaca gattaca acaca gattgatt gattaca acaca',
  'Spanish words': 'el el la la los las de de de que que casa casa cantar cantando comer comiendo',
  'banana': 'banana banana bandana banana bandana banana ananas banana banana',
  'mississippi': 'mississippi mississippi missouri missouri mission mission missile missing'
};

function bpeWordSyms(word){ return Array.from(word).concat([BPE_END]); }

// core trainer over pre-symbolised items [{syms:[...], freq:n}]
function bpeTrainItems(items, numMerges){
  items = items.map(function(it){ return {syms: it.syms.slice(), freq: it.freq}; });
  var initVocab=[], seen={};
  items.forEach(function(it){ it.syms.forEach(function(s){ if(!seen[s]){ seen[s]=1; initVocab.push(s); } }); });
  var merges=[], steps=[];
  for(var m=0;m<numMerges;m++){
    var pairs={};
    items.forEach(function(it){ for(var i=0;i<it.syms.length-1;i++){ var k=it.syms[i]+'\u0001'+it.syms[i+1]; pairs[k]=(pairs[k]||0)+it.freq; } });
    var entries=Object.keys(pairs).map(function(k){ return [k,pairs[k]]; }).sort(function(a,b){ return b[1]-a[1]; });
    if(!entries.length || entries[0][1]<2) break;
    var bestKey=entries[0][0], bestCount=entries[0][1];
    var ab=bestKey.split('\u0001'), a=ab[0], b=ab[1], merged=a+b;
    var before=items.map(function(it){ return {syms:it.syms.slice(), freq:it.freq}; });
    items.forEach(function(it){ var ns=[]; for(var i=0;i<it.syms.length;i++){ if(i<it.syms.length-1 && it.syms[i]===a && it.syms[i+1]===b){ ns.push(merged); i++; } else ns.push(it.syms[i]); } it.syms=ns; });
    merges.push([a,b,merged]);
    steps.push({ words: before, pairs: entries.slice(0,8), best:[a,b,merged,bestCount], after: items.map(function(it){ return {syms:it.syms.slice(), freq:it.freq}; }) });
  }
  return { merges:merges, initVocab:initVocab, steps:steps, finalItems:items };
}

function bpeTrainText(text, numMerges){
  var words=text.trim().split(/\s+/).filter(Boolean);
  var freq={}; words.forEach(function(w){ freq[w]=(freq[w]||0)+1; });
  var items=Object.keys(freq).map(function(w){ return {syms:bpeWordSyms(w), freq:freq[w]}; });
  return bpeTrainItems(items, numMerges);
}

// vocab list + id map
function bpeVocabList(model){ return model.initVocab.concat(model.merges.map(function(m){ return m[2]; })); }
function bpeIdMap(model){ var v=bpeVocabList(model), map={}; v.forEach(function(t,i){ map[t]=i; }); return map; }

function bpeRank(merges){ var r={}; merges.forEach(function(m,i){ r[m[0]+'\u0001'+m[1]]=i; }); return r; }

// greedy encode one word, return steps
function bpeEncodeWord(syms0, merges){
  var rank=bpeRank(merges), syms=syms0.slice(), steps=[{syms:syms.slice(), note:'initial bytes'}];
  while(true){
    var bi=-1, br=Infinity;
    for(var i=0;i<syms.length-1;i++){ var k=syms[i]+'\u0001'+syms[i+1]; if(k in rank && rank[k]<br){ br=rank[k]; bi=i; } }
    if(bi<0) break;
    var a=syms[bi], b=syms[bi+1], merged=a+b, ns=[];
    for(var j=0;j<syms.length;j++){ if(j<syms.length-1 && syms[j]===a && syms[j+1]===b){ ns.push(merged); j++; } else ns.push(syms[j]); }
    syms=ns; steps.push({syms:syms.slice(), note:a+' + '+b+' \u2192 '+merged, merged:merged});
  }
  return {tokens:syms, steps:steps};
}

// UTF-8 byte tokens for a word: array of hex-ish byte symbols
function bpeByteSyms(word){ var out=[]; Array.from(word).forEach(function(ch){ cpToUTF8(ch.codePointAt(0)).forEach(function(b){ out.push(hex2(b)); }); }); out.push(BPE_END); return out; }
function bpeTrainBytes(text, numMerges){
  var words=text.trim().split(/\s+/).filter(Boolean);
  var freq={}; words.forEach(function(w){ freq[w]=(freq[w]||0)+1; });
  var items=Object.keys(freq).map(function(w){ return {syms:bpeByteSyms(w), freq:freq[w]}; });
  return bpeTrainItems(items, numMerges);
}

// display helpers
function bpeTok(t, col, hl){ col=col||'var(--accent)'; var disp = (t===BPE_END)?'<span style="opacity:.45">\u2581</span>':uniEsc(t);
  return '<span style="display:inline-block;font-family:var(--mono);font-size:.8rem;background:'+col+(hl?'33':'14')+';border:1px solid '+col+(hl?'':'55')+';color:var(--text);border-radius:5px;padding:2px 6px;margin:2px;'+(hl?'box-shadow:0 0 0 1px '+col:'')+'">'+disp+'</span>'; }

function bpeCorpusOptions(sel){ return Object.keys(SYNTH_CORPORA).map(function(k){ return '<option'+(k===sel?' selected':'')+'>'+k+'</option>'; }).join(''); }

// ─── Orchestrator ───
function buildBPEViz(){ buildBpeOverview(); buildBpeTrain(); buildBpeEncoder(); buildBpeBytes(); buildBpeTypes(); buildBpeLang(); }

// ─── Viz 1: overview diagram ───
function buildBpeOverview(){
  var host=document.getElementById('bpe-overview'); if(!host) return;
  function stage(txt,col){ return '<div style="background:var(--surface2);border:1px solid '+col+'55;border-left:3px solid '+col+';border-radius:8px;padding:.55rem .8rem;font-family:var(--mono);font-size:.72rem;color:var(--text)">'+txt+'</div>'; }
  function arrow(){ return '<div style="text-align:center;color:var(--muted);font-size:1rem">\u2193</div>'; }
  host.innerHTML=
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">'
    +'<div><div style="font-family:var(--mono);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:.7rem">Training (once)</div>'
      +stage('Training corpus','var(--accent)')+arrow()+stage('Pre-tokenize: split into words','var(--accent)')+arrow()+stage('Convert to bytes / characters','var(--accent)')+arrow()+stage('Count all adjacent pairs','var(--accent)')+arrow()+stage('Merge the most frequent pair','var(--accent)')+arrow()+stage('Repeat k times','var(--accent)')+arrow()
      +'<div style="background:rgba(61,220,132,.08);border:1px solid var(--accent4)55;border-radius:8px;padding:.55rem .8rem;font-family:var(--mono);font-size:.72rem;color:var(--accent4)">Output: vocabulary + ordered merge list</div></div>'
    +'<div><div style="font-family:var(--mono);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent2);margin-bottom:.7rem">Encoding (every input)</div>'
      +stage('New text','var(--accent2)')+arrow()+stage('Pre-tokenize: split into words','var(--accent2)')+arrow()+stage('Convert to bytes / characters','var(--accent2)')+arrow()+stage('Apply merge rules in learned order','var(--accent2)')+arrow()+stage('Greedy: highest-priority merge first','var(--accent2)')+arrow()
      +'<div style="background:rgba(61,220,132,.08);border:1px solid var(--accent4)55;border-radius:8px;padding:.55rem .8rem;font-family:var(--mono);font-size:.72rem;color:var(--accent4)">Output: token IDs</div></div>'
    +'</div>';
}

// ─── Viz 2: training ───
var _bt={corpus:Object.keys(SYNTH_CORPORA)[0], model:null, step:0};
function buildBpeTrain(){
  var host=document.getElementById('bpe-train'); if(!host) return;
  host.innerHTML=
    '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:1rem">'
    +'<select id="bt-corpus" onchange="btPick(this.value)" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .7rem;font-family:var(--mono);font-size:.74rem">'+bpeCorpusOptions(_bt.corpus)+'</select>'
    +'<button onclick="btStep(-1)" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .9rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">\u2190 Prev</button>'
    +'<button onclick="btStep(1)" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.74rem;font-weight:700;cursor:pointer">Next merge \u2192</button>'
    +'<button onclick="btAuto()" style="background:var(--surface3);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem .9rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">\u25b6 Auto</button>'
    +'<button onclick="btReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem .9rem;font-family:var(--mono);font-size:.74rem;cursor:pointer">Reset</button>'
    +fsBtn('bpe-train')+'</div><div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:.8rem">Symbols are ASCII bytes. Each character below is one byte (its value is shown in the starting vocabulary).</div>'
    +'<div id="bt-body"></div>';
  btPick(_bt.corpus);
}
function btPick(c){ _bt.corpus=c; _bt.model=bpeTrainText(SYNTH_CORPORA[c], 12); _bt.step=0; btRender(); }
function btReset(){ _bt.step=0; btRender(); }
function btStep(d){ if(!_bt.model)return; var n=_bt.step+d; if(n<0||n>_bt.model.merges.length)return; _bt.step=n; btRender(); }
function btAuto(){ if(!_bt.model)return; if(_bt._t){ clearInterval(_bt._t); _bt._t=null; return; } _bt._t=setInterval(function(){ if(_bt.step>=_bt.model.merges.length){ clearInterval(_bt._t); _bt._t=null; return; } btStep(1); }, 900); }
function btRender(){
  var host=document.getElementById('bt-body'); if(!host||!_bt.model) return;
  var M=_bt.model, s=_bt.step, L=M.merges.length;
  var words = s===0? M.steps.length? M.steps[0].words : M.finalItems : M.steps[s-1].after;
  var nextBest = s<L? M.steps[s].best : null;   // pair to merge next
  var pairsNext = s<L? M.steps[s].pairs : null;
  var vocabNow = M.initVocab.concat(M.merges.slice(0,s).map(function(m){ return m[2]; }));
  var lastMerged = s>0? M.merges[s-1][2] : null;
  var h='';
  // words
  h+='<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin:.2rem 0 .4rem">Corpus words (after '+s+' merge'+(s===1?'':'s')+')</div><div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:1rem">';
  words.forEach(function(it){
    var chips='';
    for(var i=0;i<it.syms.length;i++){
      var isPair = nextBest && it.syms[i]===nextBest[0] && i+1<it.syms.length && it.syms[i+1]===nextBest[1];
      chips+=bpeTok(it.syms[i], isPair?'var(--accent3)':'var(--accent)', isPair);
    }
    h+='<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.4rem .5rem">'+chips+'<span style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-left:4px">\u00d7'+it.freq+'</span></div>';
  });
  h+='</div>';
  // two columns: pair counts + vocab
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.2rem">';
  // pair counts
  h+='<div><div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.4rem">Adjacent pair counts</div>';
  if(pairsNext){ pairsNext.forEach(function(p,idx){ var ab=p[0].split('\u0001'); var best=idx===0;
    h+='<div style="display:flex;align-items:center;gap:8px;padding:.28rem .5rem;border-radius:6px;margin-bottom:3px;'+(best?'background:rgba(255,95,142,.1);border:1px solid var(--accent3)55':'background:var(--surface2);border:1px solid var(--border)')+'">'
      +bpeTok(ab[0],best?'var(--accent3)':'var(--muted)')+'<span style="color:var(--muted)">+</span>'+bpeTok(ab[1],best?'var(--accent3)':'var(--muted)')
      +'<span style="flex:1"></span><span style="font-family:var(--mono);font-size:.72rem;color:'+(best?'var(--accent3)':'var(--muted)')+'">'+p[1]+(best?'  \u2190 merge':'')+'</span></div>'; });
  } else { h+='<div style="font-family:var(--mono);font-size:.72rem;color:var(--accent4)">Training complete. No pair repeats.</div>'; }
  h+='</div>';
  // vocab
  h+='<div><div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.4rem">Vocabulary ('+vocabNow.length+' tokens)</div><div style="display:flex;flex-wrap:wrap">';
  vocabNow.forEach(function(t){ var isNew=(t===lastMerged); h+=bpeTok(t, isNew?'var(--accent4)':'var(--surface3)', isNew); });
  h+='</div>';
  if(lastMerged) h+='<div style="font-family:var(--mono);font-size:.62rem;color:var(--accent4);margin-top:.4rem">+ appended "'+uniEsc(lastMerged)+'"</div>';
  h+='</div></div>';
  // merge list
  if(s>0){ h+='<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin:1rem 0 .4rem">Learned merges (in order)</div><div style="display:flex;flex-wrap:wrap;gap:6px">';
    M.merges.slice(0,s).forEach(function(m,idx){ h+='<span style="font-family:var(--mono);font-size:.66rem;color:var(--muted);background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:2px 6px">'+(idx+1)+'. '+uniEsc(m[0])+'+'+uniEsc(m[1])+'</span>'; });
    h+='</div>'; }
  h+='<div style="font-family:var(--mono);font-size:.7rem;color:var(--muted);margin-top:1rem">Step '+s+' of '+L+'</div>';
  host.innerHTML=h;
}

// ─── Viz 4: encoder on a test sentence ───
var _be={model:null, word:'', step:0};
var BE_TRAIN='the there their they them then the of and to in that this with have from lowest newest widest lower slower fastest';
function buildBpeEncoder(){
  var host=document.getElementById('bpe-encoder'); if(!host) return;
  _be.model=bpeTrainText(BE_TRAIN, 40);
  host.innerHTML=
    '<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:.7rem">Trained on: '+BE_TRAIN.split(' ').slice(0,10).join(' ')+' ...  (ASCII bytes, 40 merges)</div>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:.9rem">'
    +'<input id="be-in" oninput="beRun()" value="newest lowest slowest" style="flex:1;min-width:200px;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.6rem .8rem;font-family:var(--mono);font-size:.9rem;color:var(--text);outline:none" />'
    +fsBtn('bpe-encoder')+'</div>'
    +'<div id="be-out"></div>';
  beRun();
}
function beRun(){
  var i=document.getElementById('be-in'), out=document.getElementById('be-out'); if(!i||!out||!_be.model) return;
  var words=i.value.trim().split(/\s+/).filter(Boolean);
  var idmap=bpeIdMap(_be.model);
  var h='';
  // full sentence tokenization
  h+='<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.4rem">Tokens + IDs</div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:1.2rem">';
  var allTokens=[];
  words.forEach(function(w){ var r=bpeEncodeWord(bpeWordSyms(w), _be.model.merges); r.tokens.forEach(function(t){ allTokens.push(t); var id=(t in idmap)?idmap[t]:'?';
    h+='<div style="text-align:center"><div>'+bpeTok(t,'var(--accent2)')+'</div><div style="font-family:var(--mono);font-size:.58rem;color:var(--muted)">'+id+'</div></div>'; }); });
  h+='</div>';
  var nChars=words.join('').length, nTok=allTokens.length, cpt=nTok?(nChars/nTok):0;
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1.2rem;font-family:var(--mono);font-size:.66rem">'
    +'<span style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:.32rem .65rem;color:var(--muted)">'+nChars+' chars</span>'
    +'<span style="background:rgba(160,140,255,.1);border:1px solid rgba(160,140,255,.25);border-radius:7px;padding:.32rem .65rem;color:var(--accent2)">'+nTok+' tokens</span>'
    +'<span style="background:rgba(61,220,132,.08);border:1px solid rgba(61,220,132,.2);border-radius:7px;padding:.32rem .65rem;color:var(--accent4)">'+cpt.toFixed(2)+' chars / token</span>'
    +'<span style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:.32rem .65rem;color:var(--muted)">'+words.length+' words</span>'
    +'</div>';
  // step-by-step for first word
  if(words.length){ var r=bpeEncodeWord(bpeWordSyms(words[0]), _be.model.merges);
    h+='<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.4rem">Greedy merge steps for "'+uniEsc(words[0])+'"</div>';
    r.steps.forEach(function(st,idx){ h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:5px"><span style="font-family:var(--mono);font-size:.6rem;color:var(--muted);width:120px">'+(idx===0?'start':st.note)+'</span><div style="display:flex;flex-wrap:wrap">'+st.syms.map(function(t){ return bpeTok(t, t===st.merged?'var(--accent4)':'var(--accent2)', t===st.merged); }).join('')+'</div></div>'; });
  }
  out.innerHTML=h;
}

// ─── Viz 5: Unicode -> UTF-8 -> token IDs (byte-level) ───
var _bb={model:null};
var BB_TRAIN='the the of and to hello hola bonjour café café niño niño 中文 中文 日本 emoji 😀 😀 straße straße';
function buildBpeBytes(){
  var host=document.getElementById('bpe-bytes'); if(!host) return;
  _bb.model=bpeTrainBytes(BB_TRAIN, 40);
  host.innerHTML=
    '<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:.7rem">Byte-level BPE: text \u2192 UTF-8 bytes \u2192 merges \u2192 token IDs. Works on any language or emoji.</div>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:.9rem">'
    +'<input id="bb-in" oninput="bbRun()" value="café 中 😀" style="flex:1;min-width:200px;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.6rem .8rem;font-family:var(--mono);font-size:1rem;color:var(--text);outline:none" />'
    +fsBtn('bpe-bytes')+'</div><div id="bb-out"></div>';
  bbRun();
}
function bbRun(){
  var i=document.getElementById('bb-in'), out=document.getElementById('bb-out'); if(!i||!out||!_bb.model) return;
  var words=i.value.trim().split(/\s+/).filter(Boolean);
  var idmap=bpeIdMap(_bb.model); var h='';
  words.forEach(function(w){
    h+='<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.8rem;margin-bottom:.8rem">';
    h+='<div style="font-size:1.3rem;color:var(--text);margin-bottom:.5rem">'+uniEsc(w)+'</div>';
    // bytes
    var bytes=[]; Array.from(w).forEach(function(ch){ cpToUTF8(ch.codePointAt(0)).forEach(function(b){ bytes.push(b); }); });
    h+='<div style="font-family:var(--mono);font-size:.6rem;color:var(--muted);margin-bottom:.3rem">UTF-8 bytes ('+bytes.length+')</div><div style="display:flex;flex-wrap:wrap;margin-bottom:.6rem">'+bytes.map(function(b){ return '<span style="font-family:var(--mono);font-size:.68rem;background:var(--surface3);border:1px solid var(--border);border-radius:4px;padding:2px 5px;margin:2px;color:var(--muted)">'+hex2(b)+'</span>'; }).join('')+'</div>';
    // tokens
    var r=bpeEncodeWord(bpeByteSyms(w), _bb.model.merges);
    h+='<div style="font-family:var(--mono);font-size:.6rem;color:var(--muted);margin-bottom:.3rem">Tokens + IDs ('+r.tokens.length+')</div><div style="display:flex;flex-wrap:wrap;gap:4px">'+r.tokens.map(function(t){ var id=(t in idmap)?idmap[t]:'?'; return '<div style="text-align:center"><div>'+bpeTok(t,'var(--accent)')+'</div><div style="font-family:var(--mono);font-size:.56rem;color:var(--muted)">'+id+'</div></div>'; }).join('')+'</div>';
    h+='</div>';
  });
  out.innerHTML=h;
}

// ─── Viz 6: types of BPE (char-level vs byte-level) ───
var BPE_TYPES_TRAIN='the the of and to hello world token text data model learn';
function buildBpeTypes(){
  var host=document.getElementById('bpe-types'); if(!host) return;
  host.innerHTML=
    '<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:.7rem">Both models are trained on English only (no accents). See how each handles input the training set never saw.</div>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:.9rem">'
    +'<input id="bpt-in" oninput="bptRun()" value="café" style="flex:1;min-width:180px;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:.6rem .8rem;font-family:var(--mono);font-size:1rem;color:var(--text);outline:none" />'
    +fsBtn('bpe-types')+'</div><div id="bpt-out"></div>';
  bptRun();
}
function bptRun(){
  var i=document.getElementById('bpt-in'), out=document.getElementById('bpt-out'); if(!i||!out) return;
  var word=i.value.trim().split(/\s+/)[0]||'';
  var charModel=bpeTrainText(BPE_TYPES_TRAIN,30);
  var byteModel=bpeTrainBytes(BPE_TYPES_TRAIN,30);
  var charVocab={}; charModel.initVocab.forEach(function(s){ charVocab[s]=1; });
  // char-level: symbols not in training vocab become <UNK>
  var charSyms=Array.from(word).map(function(ch){ return charVocab[ch]?ch:'<UNK>'; }).concat([BPE_END]);
  var charTok=bpeEncodeWord(charSyms, charModel.merges).tokens;
  var byteTok=bpeEncodeWord(bpeByteSyms(word), byteModel.merges).tokens;
  var hasUnk=charTok.indexOf('<UNK>')>=0;
  var h='<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.2rem">';
  h+='<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.9rem"><div style="font-family:var(--mono);font-size:.72rem;color:var(--accent3);margin-bottom:.5rem">Character-level BPE</div><div style="display:flex;flex-wrap:wrap;margin-bottom:.5rem">'+charTok.map(function(t){ return bpeTok(t, t==='<UNK>'?'var(--accent3)':'var(--accent)', t==='<UNK>'); }).join('')+'</div><div style="font-size:.72rem;color:var(--muted);line-height:1.5">Vocabulary is a set of characters. A character it never saw ('+(hasUnk?'like in your input':'e.g. an accent or emoji')+') becomes an unknown token. Meaning is lost.</div></div>';
  h+='<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.9rem"><div style="font-family:var(--mono);font-size:.72rem;color:var(--accent);margin-bottom:.5rem">Byte-level BPE</div><div style="display:flex;flex-wrap:wrap;margin-bottom:.5rem">'+byteTok.map(function(t){ return bpeTok(t,'var(--accent)'); }).join('')+'</div><div style="font-size:.72rem;color:var(--muted);line-height:1.5">Vocabulary starts from the 256 possible bytes. Every character, in any language, is some sequence of bytes, so nothing is ever unknown. GPT-2 and most modern LLMs use this.</div></div>';
  h+='</div>';
  out.innerHTML=h;
}

// ─── Viz 7: Spanish vs English BPE ───
var EN_CORPUS='the the the of of and and to in that is it he was for on are as with his they at be this from you not but what all were when we there can an your which their said if do will each about how up out them then she many some so these would other into has more her two like him see time could no make than first been its who now people my made over did down only way find use may water long little very after words called just where most know get through back much before go good new write our used me man too any day same right look think also around another came come work three word must because does part even place well such here take why things help put years different away again off went old number great tell men say small every found still between name should home big give air line set own under read last never us left end along while might next sound below saw something thought both few those always looked show large often together asked house world going want school important until form food keep children feet land side without boy once animal life enough took sometimes four head above kind began almost live page got earth need far hand high year mother light country father let night picture being study second eyes soon times story boys since white days ever paper hard near sentence better best across during today however sure means knew it try told young miles sun ways thing whole hear example heard several change answer room against top turned learn point city play toward five himself usually'.split(' ').slice(0,80).join(' ');
var ES_CORPUS='el el el la la la los los las las de de de de que que que en en en un una y y a a por por con con no se se lo lo su su para para es es son como como más más pero pero sus le ya o este sí porque esta entre cuando muy sin sobre también me hasta hay donde quien desde todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mí antes algunos qué unos yo otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo nosotros mi mis tú te ti tu tus ellas nosotras vosotros vosotras os mío mía casa casa cantar cantando comer comiendo niño niña ción ción nación estación canción'.split(' ').slice(0,90).join(' ');
function buildBpeLang(){
  var host=document.getElementById('bpe-lang'); if(!host) return;
  var enM=bpeTrainText(EN_CORPUS,25), esM=bpeTrainText(ES_CORPUS,25);
  function mergeList(m){ return m.merges.slice(0,10).map(function(x,i){ return '<span style="font-family:var(--mono);font-size:.66rem;color:var(--text);background:var(--surface3);border:1px solid var(--border);border-radius:5px;padding:2px 6px;margin:2px;display:inline-block">'+uniEsc(x[2])+'</span>'; }).join(''); }
  host.innerHTML=
    '<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:.8rem">The same algorithm, trained on two languages, learns different tokens. The merges reflect whatever patterns are common in the training text.</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;margin-bottom:1.1rem">'
    +'<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.9rem"><div style="font-family:var(--mono);font-size:.72rem;color:var(--accent);margin-bottom:.5rem">English BPE \u2014 first merges</div>'+mergeList(enM)+'</div>'
    +'<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.9rem"><div style="font-family:var(--mono);font-size:.72rem;color:var(--accent2);margin-bottom:.5rem">Spanish BPE \u2014 first merges</div>'+mergeList(esM)+'</div></div>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:.7rem"><span style="font-family:var(--mono);font-size:.66rem;color:var(--muted)">Tokenize a sentence with each model:</span>'
    +'<input id="bl-in" oninput="blRun()" value="the corporation" style="flex:1;min-width:160px;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.5rem .7rem;font-family:var(--mono);font-size:.85rem;color:var(--text);outline:none">'
    +fsBtn('bpe-lang')+'</div><div id="bl-out"></div>';
  _bl={en:enM, es:esM}; blRun();
}
var _bl={};
function blRun(){
  var i=document.getElementById('bl-in'), out=document.getElementById('bl-out'); if(!i||!out||!_bl.en) return;
  var words=i.value.trim().split(/\s+/).filter(Boolean);
  function tok(model){ var all=[]; words.forEach(function(w){ bpeEncodeWord(bpeWordSyms(w),model.merges).tokens.forEach(function(t){ all.push(t); }); }); return all; }
  var enT=tok(_bl.en), esT=tok(_bl.es);
  function row(label,toks,col){ return '<div style="margin-bottom:.7rem"><div style="font-family:var(--mono);font-size:.64rem;color:'+col+';margin-bottom:.3rem">'+label+' \u2014 '+toks.length+' tokens</div><div style="display:flex;flex-wrap:wrap">'+toks.map(function(t){ return bpeTok(t,col); }).join('')+'</div></div>'; }
  out.innerHTML=row('English model',enT,'var(--accent)')+row('Spanish model',esT,'var(--accent2)')
    +'<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.3rem">The model whose training language matches the text usually needs fewer tokens.</div>';
}


// ── EDIT DISTANCE LAB ──────────────────────────────────────
function buildEditDistViz() {
  elInit();
  buildAlignViz();
}

let _elFull = null, _elStep = 0;

function elInit() {
  const s = document.getElementById('el-src');
  const t = document.getElementById('el-tgt');
  if (!s) return;
  s.addEventListener('keydown', e=>{ if(e.key==='Enter') elCompute(); });
  t.addEventListener('keydown', e=>{ if(e.key==='Enter') elCompute(); });
  elCompute();
}

function elGetCosts() {
  const read = (id, fallback) => {
    const el = document.getElementById(id);
    const parsed = Number(el.value);
    const value = el.value.trim() && Number.isFinite(parsed) ? Math.max(1, Math.min(5, Math.round(parsed))) : fallback;
    el.value = value;
    return value;
  };
  return {ins:read('el-ins',1), del:read('el-del',1), sub:read('el-sub',2)};
}

function elComputeMatrix(src,tgt,costs) {
  const n=src.length, m=tgt.length;
  const D=Array.from({length:n+1},(_,i)=>Array.from({length:m+1},(_,j)=>{ if(i===0)return j*costs.ins; if(j===0)return i*costs.del; return 0; }));
  const FROM=Array.from({length:n+1},()=>Array(m+1).fill(null));
  for(let i=1;i<=n;i++) for(let j=1;j<=m;j++){
    const match=src[i-1]===tgt[j-1];
    // diagonal first, so a tie between a substitution and a delete+insert pair
    // resolves to the substitution the worked example in the text shows
    const opts=[{v:D[i-1][j-1]+(match?0:costs.sub),from:match?'match':'sub'},{v:D[i-1][j]+costs.del,from:'del'},{v:D[i][j-1]+costs.ins,from:'ins'}];
    const best=opts.reduce((a,b)=>a.v<=b.v?a:b);
    D[i][j]=best.v; FROM[i][j]=best.from;
  }
  return {D,FROM,n,m};
}

function elBacktrace(src,tgt,D,FROM,n,m){
  const path=new Set(),ops=[];
  let i=n,j=m;
  while(i>0||j>0){
    path.add(i+','+j);
    const f=FROM[i][j];
    if(i===0){ops.unshift({op:'ins',t:tgt[j-1],i,j});j--;}
    else if(j===0){ops.unshift({op:'del',s:src[i-1],i,j});i--;}
    else if(f==='match'){ops.unshift({op:'match',s:src[i-1],t:tgt[j-1],i,j});i--;j--;}
    else if(f==='sub'){ops.unshift({op:'sub',s:src[i-1],t:tgt[j-1],i,j});i--;j--;}
    else if(f==='del'){ops.unshift({op:'del',s:src[i-1],i,j});i--;}
    else{ops.unshift({op:'ins',t:tgt[j-1],i,j});j--;}
  }
  path.add('0,0');
  return {path,ops};
}

function elCompute(limit) {
  const src=Array.from(document.getElementById('el-src').value.normalize('NFC')).slice(0,14);
  const tgt=Array.from(document.getElementById('el-tgt').value.normalize('NFC')).slice(0,14);
  const costs=elGetCosts();
  const {D,FROM,n,m}=elComputeMatrix(src,tgt,costs);
  const {path,ops}=elBacktrace(src,tgt,D,FROM,n,m);
  _elFull={D,FROM,n,m,src,tgt,path,ops,costs};
  _elStep=(limit!==undefined)?limit:n*(m+1)+m+1;
  elRender(_elFull,_elStep);
}

function elPreset(s,t){ var a=document.getElementById('el-src'), b=document.getElementById('el-tgt'); if(a&&b){ a.value=s; b.value=t; elCompute(); } }
function elStep() {
  const src=Array.from(document.getElementById('el-src').value.normalize('NFC')).slice(0,14);
  const tgt=Array.from(document.getElementById('el-tgt').value.normalize('NFC')).slice(0,14);
  const costs=elGetCosts();
  const changed=!_elFull || src.join('')!==_elFull.src.join('') || tgt.join('')!==_elFull.tgt.join('') || Object.keys(costs).some(k=>costs[k]!==_elFull.costs[k]);
  if(changed || _elStep>=(_elFull.n+1)*(_elFull.m+1)){ elCompute(1); return; }
  _elStep++;
  elRender(_elFull,_elStep);
}

function elRender({D,FROM,n,m,src,tgt,path,ops,costs},stepLimit){
  var _elBack=(document.getElementById('el-backtrace')||{checked:true}).checked;
  const total=(n+1)*(m+1);
  const isDone=stepLimit>=total;
  if(isDone){
    const ic=ops.filter(o=>o.op==='ins').length, dc=ops.filter(o=>o.op==='del').length, sc=ops.filter(o=>o.op==='sub').length, mc=ops.filter(o=>o.op==='match').length;
    document.getElementById('el-dist').textContent=D[n][m];
    document.getElementById('el-ins-count').textContent=ic+'x'+costs.ins;
    document.getElementById('el-del-count').textContent=dc+'x'+costs.del;
    document.getElementById('el-sub-count').textContent=sc+'x'+costs.sub;
    document.getElementById('el-match-count').textContent=mc;
  } else {
    ['el-dist','el-ins-count','el-del-count','el-sub-count','el-match-count'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='...';});
  }
  const cs=36;
  let html='<table style="border-collapse:collapse;font-family:var(--mono);font-size:.72rem">';
  html+=`<tr><td style="width:${cs}px;height:${cs}px"></td><td style="width:${cs}px;text-align:center;color:var(--muted);padding:4px">#</td>`;
  for(let j=0;j<m;j++) html+=`<td style="width:${cs}px;text-align:center;color:var(--accent);font-weight:700;padding:4px">${uniEsc(tgt[j])}</td>`;
  html+='</tr>';
  for(let i=0;i<=n;i++){
    html+='<tr>';
    html+=`<td style="text-align:center;color:${i===0?'var(--muted)':'var(--accent)'};font-weight:700;padding:4px">${i===0?'#':uniEsc(src[i-1])}</td>`;
    for(let j=0;j<=m;j++){
      const cellIdx=i*(m+1)+j, revealed=cellIdx<stepLimit, isCurrent=cellIdx===stepLimit-1, onPath=isDone&&_elBack&&path.has(i+','+j);
      let bg,border,color,fw;
      if(!revealed){bg='rgba(255,255,255,0.02)';border='1px solid rgba(255,255,255,0.04)';color='transparent';fw='400';}
      else if(onPath){bg='rgba(77,227,255,0.18)';border='1px solid rgba(77,227,255,0.5)';color='var(--accent)';fw='700';}
      else if(isCurrent){bg='rgba(160,140,255,0.2)';border='1px solid rgba(160,140,255,0.6)';color='#a78bfa';fw='700';}
      else{bg='rgba(255,255,255,0.03)';border='1px solid rgba(255,255,255,0.06)';color='var(--muted)';fw='400';}
      let arrow='';
      const fromDir=FROM[i][j];
      if(onPath&&i>0&&j>0&&fromDir){const am={del:'↑',ins:'←',match:'↖',sub:'↖'};arrow=`<span style="font-size:.55rem;opacity:.6;position:absolute;top:2px;left:3px">${am[fromDir]||''}</span>`;}
      html+=`<td style="width:${cs}px;height:${cs}px;text-align:center;background:${bg};border:${border};color:${color};font-weight:${fw};border-radius:3px;position:relative">${arrow}${revealed?D[i][j]:''}</td>`;
    }
    html+='</tr>';
  }
  html+='</table>';
  html+=`<div style="font-family:var(--mono);font-size:.65rem;color:var(--muted);margin-top:.6rem">${isDone?'Complete - '+total+' cells filled':'Cell '+stepLimit+' of '+total}</div>`;
  document.getElementById('el-table').innerHTML=html;
  const explEl=document.getElementById('el-explain');
  if(!isDone&&stepLimit>0){
    const si=Math.floor((stepLimit-1)/(m+1)),sj=(stepLimit-1)%(m+1);
    let msg='';
    if(si===0&&sj===0) msg='D[0,0] = 0 - base case: two empty strings have edit distance 0.';
    else if(si===0) msg=`D[0,${sj}] = ${sj} x ins-cost(${costs.ins}) = ${D[0][sj]} - inserting ${sj} character${sj>1?'s':''} into empty source.`;
    else if(sj===0) msg=`D[${si},0] = ${si} x del-cost(${costs.del}) = ${D[si][0]} - deleting ${si} character${si>1?'s':''}.`;
    else{
      const s=src[si-1],t=tgt[sj-1],match=s===t;
      const dOpt=D[si-1][sj]+costs.del,iOpt=D[si][sj-1]+costs.ins,sOpt=D[si-1][sj-1]+(match?0:costs.sub);
      const best=Math.min(dOpt,iOpt,sOpt);
      msg=`D[${si},${sj}] = min(&#8595; ${dOpt}, &#8592; ${iOpt}, &#8598; ${sOpt}) = <strong>${best}</strong>`;
      if(match) msg+=` - "${uniEsc(s)}" = "${uniEsc(t)}", match! sub cost = 0.`;
      else msg+=` - "${uniEsc(s)}" &ne; "${uniEsc(t)}", sub cost = ${costs.sub}.`;
    }
    if(explEl){explEl.style.display='block';explEl.innerHTML=msg;}
  } else if(explEl){explEl.style.display='none';}
  if(isDone){
    const srcRow=[],opsRow=[],tgtRow=[];
    ops.forEach(op=>{
      if(op.op==='match'){srcRow.push(op.s);opsRow.push('=');tgtRow.push(op.t);}
      else if(op.op==='sub'){srcRow.push(op.s);opsRow.push('s');tgtRow.push(op.t);}
      else if(op.op==='del'){srcRow.push(op.s);opsRow.push('d');tgtRow.push('*');}
      else{srcRow.push('*');opsRow.push('i');tgtRow.push(op.t);}
    });
    const opColor={d:'var(--accent3)',i:'var(--accent4)',s:'#a78bfa','=':'var(--muted)'};
    const opLabel={d:'del',i:'ins',s:'sub','=':'='};
    const mkRow=(arr,colored)=>arr.map((ch,k)=>{const op=opsRow[k];const col=colored?(opColor[op]||'var(--text)'):(op==='='?'var(--muted)':'var(--text)');return `<span style="display:inline-block;width:26px;text-align:center;color:${col};font-size:.85rem">${uniEsc(ch)}</span>`;}).join('');
    const mkOpRow=arr=>arr.map((op)=>`<span style="display:inline-block;width:26px;text-align:center;color:${opColor[op]||'var(--muted)'};font-size:.6rem;font-weight:600">${opLabel[op]}</span>`).join('');
    const alignEl=document.getElementById('el-align');
    if(alignEl) alignEl.innerHTML='<div style="line-height:2;white-space:nowrap"><div>'+mkRow(srcRow,false)+'</div><div>'+mkOpRow(opsRow)+'</div><div>'+mkRow(tgtRow,true)+'</div></div><div style="margin-top:.75rem;font-family:var(--mono);font-size:.65rem;color:var(--muted)"><span style="margin-right:12px">= match</span><span style="color:var(--accent3);margin-right:12px">d delete</span><span style="color:var(--accent4);margin-right:12px">i insert</span><span style="color:#a78bfa">s substitute</span></div>';
  } else {
    const alignEl=document.getElementById('el-align');
    if(alignEl) alignEl.innerHTML='<span style="font-family:var(--mono);font-size:.78rem;color:var(--muted)">Complete the table to see alignment...</span>';
  }
}
