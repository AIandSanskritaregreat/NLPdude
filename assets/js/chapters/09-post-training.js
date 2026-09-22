// ════════════════════════════════════════════════════════════
//  CHAPTER 9 · POST-TRAINING: RLHF & ALIGNMENT
// ════════════════════════════════════════════════════════════

const PT_SEC = [
  {id:'sft',      num:'9.1',   title:'Instruction Tuning',            icon:'\u270D', desc:'Same next-token loss, new curated data: teaching the base model to follow instructions.',  tags:['SFT','same CE loss','meta-learning']},
  {id:'instrdata',num:'9.1.1', title:'Where Instruction Data Comes From', icon:'\u2699', desc:'Humans, templates over old datasets, annotation guidelines, and LLM-generated data.',   tags:['templates','Aya','safety data']},
  {id:'sfteval',  num:'9.1.2', title:'Testing an Instruction-Tuned Model', icon:'\u2696', desc:'Leave whole task clusters out, or the evaluation quietly leaks.',                      tags:['held-out clusters','leakage']},
  {id:'pref',     num:'9.2',   title:'Learning From Preferences',     icon:'\u2665', desc:'Judging a good answer needs no expertise, only an opinion. Where preference pairs come from.', tags:['pairwise','rankings','web votes']},
  {id:'bt',       num:'9.2.2', title:'The Bradley-Terry Model',       icon:'S',      desc:'Preferences become probabilities through the logistic-regression sigmoid: P = \u03c3(z\u1d62 \u2212 z\u2c7c).', tags:['sigmoid','log-odds','hidden scores']},
  {id:'rm',       num:'9.2.3', title:'The Reward Model',              icon:'\u2691', desc:'Learning scalar scores we never observed, from raw comparisons alone.',                   tags:['scalar head','BCE','generalization']},
  {id:'align',    num:'9.3',   title:'Alignment and the KL Penalty',  icon:'\u26D3', desc:'Generation framed as RL, and the KL term that prevents reward hacking and forgetting.', tags:['policy','reward','KL penalty']},
  {id:'dpo',      num:'9.3.2', title:'Direct Preference Optimization',icon:'\u2702', desc:'The algebra that cancels the reward model away: align on preference pairs directly.',    tags:['DPO','Z(x) cancels','2 models not 4']},
  {id:'ttc',      num:'9.4',   title:'Test-Time Compute',             icon:'\u23F1', desc:'A third lever: think longer at answer time. Chain-of-thought prompting.',                tags:['chain-of-thought','GSM8K','inference']},
  {id:'ptrecap',  num:'9.5',   title:'Recap',                 icon:'\u25C9', desc:'The whole post-training pipeline, base model to aligned model, in one clickable line.',  tags:['pipeline','recap']}
];

function buildPTOverview(){
  const cards = PT_SEC.map(s=>`
    <div class="sc-card" onclick="openPTSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Teaching the Model to Behave</div>
    <h1 class="lesson-h1">Post-Training: RLHF &amp; Alignment</h1>
    <p class="lesson-intro">Pretraining produces a model that can predict text but will not obey you. Ask it a question and it may continue your question instead of answering it. What follows covers the training that happens after pretraining. Instruction tuning teaches the model to follow instructions, using the same loss it was pretrained with on new curated data. Preference learning converts human comparisons between model outputs into a trainable signal. Alignment then optimizes the model toward that signal under a KL constraint that keeps it close to its starting point. A recurring observation throughout: almost every step reuses mathematics introduced earlier, in particular the cross-entropy loss and the sigmoid from logistic regression, and the training procedures from large language models.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">Instruction tuning (SFT) continues training with the identical next-token cross-entropy loss, on curated instruction-response pairs, and generalizes to unseen tasks.</div>
        <div class="ch-sum-item">Preference data is cheap because judging is easier than writing; rankings, web votes, and LLM judges all distill into pairwise comparisons.</div>
        <div class="ch-sum-item">Bradley-Terry turns a score difference into a win probability through the sigmoid, and a reward model learns those scores from comparisons alone.</div>
        <div class="ch-sum-item">Alignment maximizes reward while a &beta;-weighted KL term constrains the policy toward the reference model, preventing reward hacking and catastrophic forgetting.</div>
        <div class="ch-sum-item">DPO rearranges the algebra so the partition function cancels, training directly on preference pairs with two models instead of four.</div>
        <div class="ch-sum-item">Test-time compute, exemplified by chain-of-thought, buys better answers with more inference computation and no weight changes at all.</div>
      </div>
    </div>`;
}

const PT_PAGES = {};
const PT_EQ = {};

// ── 9.1 INSTRUCTION TUNING ─────────────────────────────────
PT_PAGES.sft = `
<div class="lesson-chapter-label">Section 9.1</div>
<h1 class="lesson-h1">Instruction Tuning</h1>
<p class="lesson-intro">A pretrained language model has one skill: given some text, predict what text comes next. That skill was learned from web text, where a question is more often followed by another question, a list of related searches, or a change of topic than by a direct answer. So when you give a base model the prompt &ldquo;Plan me three dinners for this week,&rdquo; it frequently responds with more requests, or a forum-style discussion about meal planning, rather than a plan. The model is not broken. It is doing exactly what it was trained to do: continue text the way text on the internet tends to continue. Instruction tuning, also called supervised finetuning (SFT), is the first stage of post-training, and its job is to change what the model treats as a natural continuation.</p>

<h2 class="lesson-h2">Same Loss, New Data</h2>
<p class="lesson-p">The method is continued training. We take the pretrained model and keep training it, with the same next-token prediction objective and the same cross-entropy loss, but on a new dataset: pairs consisting of an instruction and a correct response. Each training example is formatted as one sequence, instruction first, response after it. The model is trained to assign high probability to the response tokens given the instruction as context. Writing the instruction as x and the response as y = (y&#8321;, &hellip;, y&#8348;), the loss for one example is:</p>
<div class="lesson-math" id="pt-sft-loss">\\[L_{SFT}(\\theta) = -\\sum_{t=1}^{T} \\log p_\\theta\\big(y_t \\mid x,\\, y_{&lt;t}\\big)\\]</div>
<p class="lesson-p">This is the identical quantity minimized during pretraining; the only differences are the data and one common bookkeeping detail: the loss is usually computed only on the response tokens, not on the instruction tokens, because we want the model to learn to produce responses, not to reproduce instructions. There is no new architecture, no new objective, and no reinforcement learning anywhere in this section.</p>
<p class="lesson-p">Why does this work better than it sounds like it should? A single instruction dataset teaches a single behavior. But instruction-tuning corpora such as FLAN or Alpaca contain many different tasks at once: translation, summarization, question answering, classification, rewriting, and so on, each phrased as a natural-language instruction. Training on this mixture teaches the model something more general than any one task: it teaches the mapping from &ldquo;text that states a task&rdquo; to &ldquo;text that performs the task.&rdquo; The result is that performance improves on instructions the model was never trained on. This transfer to unseen tasks is the point of the whole exercise, and it is what the demonstration below is set up to show. Train on three task families, then test on a fourth that was deliberately left out of training.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Same Loss, New Data</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1rem">
      <button onclick="sftTrain()" id="sft-train" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Train one pass &#8595;</button>
      <button onclick="sftTest()" style="background:var(--accent4);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Test on held-out task</button>
      <button onclick="sftReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">Reset</button>
    </div>
    <canvas id="sft-canvas" width="640" height="230" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="sft-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:3.4rem"></div>
  </div>
</div>

<h2 class="lesson-h2">The Cost Relative to Pretraining</h2>
<p class="lesson-p">It is worth being concrete about scale, because the two stages differ by several orders of magnitude. Pretraining processes on the order of 10&sup1;&sup3; tokens, takes months on large clusters, and is done once. Instruction tuning uses tens of thousands to a few million examples, on the order of 10&#8312; tokens, and runs for a few epochs. On the log-scale comparison below the two bars are not even close. This matters practically: instruction tuning is cheap enough to redo when the data improves, cheap enough for academic groups to perform, and cheap enough that its cost is a rounding error next to the pretraining run it modifies.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Scale &middot; Pretraining vs. Instruction Tuning</span></div>
  <div class="viz-body">
    <canvas id="sft-cost" width="640" height="120" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
  </div>
</div>

<h2 class="lesson-h2">Four Procedures That All Get Called Finetuning</h2>
<p class="lesson-p">The word &ldquo;finetuning&rdquo; is used for at least four different procedures, and conflating them causes real confusion, so it is worth separating them explicitly. All four start from a pretrained model and continue training; they differ in what data is used, which parameters are updated, what loss is minimized, and what the resulting model can do.</p>
<p class="lesson-p"><strong>Continued pretraining</strong> updates all parameters with the ordinary next-token loss on raw text from a new domain, for example legal or biomedical documents. The result is still a base model, just one that knows the new domain. <strong>Parameter-efficient finetuning</strong> (PEFT, of which LoRA from Section 8.8 is the standard example) freezes the entire network and trains only a small number of added parameters, the low-rank A and B matrices; this is used when full updates are too expensive or when many task-specific adapters must be maintained. <strong>Task-head finetuning</strong>, the standard procedure for masked language models such as BERT, adds a new classification head on top of the network and trains with a task-specific loss such as classification cross-entropy; the result performs that one task. <strong>Instruction tuning</strong>, the subject of this section, updates all parameters with the next-token loss on instruction-response pairs spanning many tasks; the result is a general instruction-follower. Click each lane below to compare the four along all four dimensions.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Finetuning Comparison Board</span></div>
  <div class="viz-body">
    <canvas id="ftb-canvas" width="640" height="300" style="width:100%;max-width:640px;display:block;margin:0 auto;cursor:pointer"></canvas>
    <div id="ftb-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<div class="quiz-block" id="qpt-sft"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What training loss does instruction tuning use?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qpt-sft','Correct. SFT is ordinary continued training: the identical next-token cross-entropy, computed on curated instruction-response pairs, typically only over the response tokens.')">The same next-token cross-entropy as pretraining</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-sft','Preference losses appear later, in reward modeling and DPO, not in SFT.')">A pairwise preference loss</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-sft','No reinforcement learning is involved in SFT.')">A policy-gradient RL objective</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-sft','That describes task-head finetuning, a different procedure.')">A classification loss on a new task head</button>
</div><div class="quiz-explain" id="qpt-sft-explain"></div></div>`;

// ── 9.1.1 WHERE INSTRUCTION DATA COMES FROM ────────────────
PT_PAGES.instrdata = `
<div class="lesson-chapter-label">Section 9.1.1</div>
<h1 class="lesson-h1">Where Instruction Data Comes From</h1>
<p class="lesson-intro">Instruction tuning needs pairs of instructions and correct responses, and someone has to produce them. In practice the data comes from four sources, which differ substantially in cost and quality. Understanding these sources matters because the behavior of an instruction-tuned model is largely determined by what its instruction data contains.</p>

<h2 class="lesson-h2">The Four Sources</h2>
<p class="lesson-p"><strong>First, people write examples directly.</strong> Annotators are given a task description and write both the instruction and the response by hand. This produces the highest-quality data and is the most expensive option. The Aya dataset is a notable example: a human-curated multilingual instruction collection covering 65 languages, built by contributors writing instructions and responses in their own languages, precisely because template-converted English data does not transfer well to most of the world&rsquo;s languages.</p>
<p class="lesson-p"><strong>Second, existing supervised datasets are converted with templates.</strong> NLP has accumulated decades of labeled datasets: sentiment classification, natural language inference, question answering, and many more. Each labeled example can be turned into an instruction by filling a template. A sentiment example with fields (text, label) becomes the instruction &ldquo;[text] How does the reviewer feel about the movie?&rdquo; with the label converted into the gold response. One dataset of fifty thousand rows yields fifty thousand instructions, and writing several paraphrases of the template multiplies the diversity of instruction wording, which matters because we want the model to follow instructions however they are phrased, not just in one fixed format.</p>
<p class="lesson-p"><strong>Third, annotation guidelines are repurposed.</strong> When crowdworkers built the original datasets, they were given careful written instructions describing the task. Those guideline texts are themselves natural instructions and can be paired with the datasets they produced.</p>
<p class="lesson-p"><strong>Fourth, language models generate the data.</strong> A strong model is prompted to produce instructions, responses, or paraphrases, which are filtered and added to the training set. This is now common because it is cheap, though it inherits whatever biases and errors the generating model has.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Template Instantiation</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:1rem">
      <div style="flex:1;min-width:220px;background:var(--surface2);border-radius:10px;padding:.8rem">
        <div style="font-family:var(--mono);font-size:.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem">raw supervised example</div>
        <div style="font-family:var(--mono);font-size:.72rem;line-height:1.7"><span style="color:var(--accent)">text:</span> <span style="color:var(--text)">&ldquo;Did not like the service that I was provided&rdquo;</span><br><span style="color:var(--accent3)">label:</span> <span style="color:var(--text)">0 (negative)</span></div>
      </div>
      <div style="flex:1;min-width:220px">
        <div style="font-family:var(--mono);font-size:.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem">choose a template</div>
        <select id="tmpl-select" onchange="tmplRender()" style="width:100%;background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.5rem;font-family:var(--mono);font-size:.7rem"></select>
        <button onclick="tmplPara()" style="margin-top:.6rem;background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">&#10024; paraphrase the template &times;3</button>
      </div>
    </div>
    <div id="tmpl-out" style="background:var(--panel);border-radius:10px;padding:1rem;font-family:var(--mono);font-size:.74rem;line-height:1.8;color:#ECF1FF;min-height:3.4rem"></div>
    <div id="tmpl-para" style="margin-top:.7rem"></div>
  </div>
</div>

<h2 class="lesson-h2">Safety Training Data</h2>
<p class="lesson-p">The same machinery produces safety data. A safety example pairs a harmful request with an appropriate refusal or a safe redirection; these pairs are typically generated by a model and reviewed, then mixed into the instruction-tuning set. Bianchi et al. (2024) measured how the amount of safety data affects behavior and found two results worth knowing. First, the required amount is small: a few hundred safety examples, roughly 500, already produce most of the achievable reduction in harmful responses. Second, more is not monotonically better: adding too much safety data causes the model to refuse benign requests that merely resemble unsafe ones, a failure mode called exaggerated safety or over-refusal. The slider below reproduces the first effect; the shape of the curve, steep at the start and flat after a few hundred examples, is the finding.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; How Much Safety Data Is Needed?</span></div>
  <div class="viz-body">
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>safety examples mixed into SFT data</span><span id="safe-nv" style="color:var(--accent)">0</span></div>
      <input id="safe-n" type="range" min="0" max="2000" step="50" value="0" oninput="safeSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-family:var(--mono);font-size:.66rem;color:var(--muted);white-space:nowrap">harmful responses</span>
      <div style="flex:1;height:18px;background:var(--surface3);border-radius:5px;overflow:hidden"><div id="safe-bar" style="height:100%;width:38%;background:linear-gradient(90deg,#FF5F8E,#ff8c42);border-radius:5px;transition:width .2s"></div></div>
      <span id="safe-pct" style="font-family:var(--mono);font-size:.7rem;color:var(--accent3);width:52px">38%</span>
    </div>
    <div id="safe-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6"></div>
  </div>
</div>

<div class="quiz-block" id="qpt-data"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why are templates such a productive source of instruction data?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qpt-data','Correct. Decades of labeled NLP datasets already exist; a template converts every labeled row into an instruction, and paraphrases multiply the wording diversity.')">They convert huge existing labeled datasets into instructions automatically</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-data','Templates need no gradient updates at all; they are pure text manipulation.')">They finetune the model faster than gradient descent</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-data','Templates fill slots with existing data; humans or models still supply the underlying examples.')">They eliminate the need for any underlying data</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-data','Safety data is one use, but the productivity comes from converting existing datasets in general.')">They are only used for safety refusals</button>
</div><div class="quiz-explain" id="qpt-data-explain"></div></div>`;

// ── 9.1.2 TESTING AN INSTRUCTION-TUNED MODEL ───────────────
PT_PAGES.sfteval = `
<div class="lesson-chapter-label">Section 9.1.2</div>
<h1 class="lesson-h1">Testing an Instruction-Tuned Model</h1>
<p class="lesson-intro">The claim we want to test is that instruction tuning generalizes: that the model can follow instructions for tasks it was not trained on. Designing an evaluation that actually tests this claim is less obvious than it appears, and the standard machine-learning habit of holding out a dataset gives a misleading answer here.</p>

<h2 class="lesson-h2">Why Held-Out Datasets Are Not Enough</h2>
<p class="lesson-p">The problem is that instruction-tuning corpora contain many datasets for the same underlying task. A large corpus might include twenty-five different natural language inference datasets, each built by different researchers from different text sources, but all teaching the same skill. If you hold out one of them and train on the other twenty-four, the model performs well on the held-out one, but this shows nothing about generalization to new tasks: the model was trained, extensively, on natural language inference. The evaluation has a leak, and the leak is at the level of the task, not the dataset.</p>
<p class="lesson-p">The accepted fix is <strong>leave-one-out evaluation over task clusters</strong>. Datasets are grouped into clusters by the ability they test: one cluster for entailment, one for sentiment, one for question answering, and so on. To evaluate, an entire cluster is removed from training, the model is trained on all remaining clusters, and it is scored only on the removed one. Now a good score means what we want it to mean: the model followed instructions for a task family it had never been trained on. Run both procedures below on the same pool of datasets. The score gap between them is the size of the leak.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Cluster Leave-One-Out</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
      <button class="loo-mode" data-m="cluster" onclick="looMode('cluster')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">hold out the whole sentiment cluster</button>
      <button class="loo-mode" data-m="single" onclick="looMode('single')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.45rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">hold out one sentiment dataset (naive)</button>
      <button onclick="looRun()" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.45rem 1.1rem;font-family:var(--mono);font-size:.7rem;font-weight:700;cursor:pointer;margin-left:auto">Run evaluation</button>
    </div>
    <canvas id="loo-canvas" width="640" height="290" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="loo-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem">Datasets grouped by task cluster. Pick a hold-out strategy, then run.</div>
  </div>
</div>

<div class="quiz-block" id="qpt-loo"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is holding out a single dataset a misleading test of generalization?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qpt-loo','Correct. Sibling datasets of the same task remain in training, so the model was effectively trained on the task; only holding out the whole cluster tests true novelty.')">Sibling datasets of the same task stay in training and teach the task anyway</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-loo','Dataset size is not the issue; task overlap is.')">One dataset is too small to score reliably</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-loo','The loss function is unchanged either way.')">The loss function changes when a dataset is removed</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-loo','Clusters are defined by task type, not by score.')">Clusters always score higher than datasets</button>
</div><div class="quiz-explain" id="qpt-loo-explain"></div></div>`;

// ── 9.2 LEARNING FROM PREFERENCES ──────────────────────────
PT_PAGES.pref = `
<div class="lesson-chapter-label">Section 9.2</div>
<h1 class="lesson-h1">Learning From What People Prefer</h1>
<p class="lesson-intro">Instruction tuning teaches the model to produce responses of the right form, but it cannot by itself make the model as helpful, honest, and harmless as we would like, because supervised finetuning only imitates the demonstrations it is given. Writing demonstrations that are simultaneously accurate, well-calibrated, and well-written requires expert effort for every single example, and even experts disagree about what the ideal response looks like. The next stage of post-training therefore switches to a different, cheaper kind of supervision: instead of asking people to write good responses, we ask them to compare responses that the model has already produced.</p>

<h2 class="lesson-h2">Judging Is Easier Than Writing</h2>
<p class="lesson-p">This works because of an asymmetry: evaluating an answer is much easier than producing one. To write a correct, appropriately hedged answer about whether garlic helps with colds, you need to know the medical literature. To decide which of two given answers is better, you mostly need to notice that one of them overclaims a cure and the other does not. Judging takes an opinion; writing takes expertise, and expertise is the more expensive of the two, so preference data can be collected at a scale that demonstration data cannot. The examples below are in the style of Anthropic&rsquo;s HH-RLHF corpus, one of the earliest public preference datasets: each record is a prompt with two model responses, one marked chosen and one marked rejected by a human annotator. Make your own choice before revealing the annotation.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Chosen vs. Rejected</span></div>
  <div class="viz-body">
    <div id="judge-host"></div>
    <div style="display:flex;justify-content:center;margin-top:1rem"><button onclick="judgeNext()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:.45rem 1rem;font-family:var(--mono);font-size:.7rem;cursor:pointer">next pair &#8594;</button></div>
  </div>
</div>

<h2 class="lesson-h2">Forms and Sources of Preference Data</h2>
<p class="lesson-p">Preference data comes in a few standard forms. The simplest is the <strong>pairwise comparison</strong> just shown: two responses, one preferred. Annotators are sometimes instead asked to <strong>rank N responses</strong>, which is more information per judgment; a full ranking of N items determines the preference between every pair of them, so it can be converted into</p>
<div class="lesson-math" id="pt-pref-pairs">\\[\\binom{N}{2} = \\frac{N(N-1)}{2}\\]</div>
<p class="lesson-p">pairwise comparisons. Annotators may also give <strong>scalar ratings</strong> on aspects such as helpfulness or honesty, from which comparisons can again be derived.</p>
<p class="lesson-p">The sources also vary. <strong>Paid annotators</strong> give the most controlled data. <strong>Implicit web signals</strong> give the cheapest: on sites like StackExchange or Reddit, users have already voted on answers, and the vote counts impose an ordering on the answers to each question, yielding preference pairs with no annotation cost at all. <strong>Model judgments</strong> are the third source: a strong LLM is prompted to score or compare responses, as in the UltraFeedback dataset. Synthetic judgments scale furthest but inherit the judging model&rsquo;s own biases, for example a documented tendency to prefer longer responses. The converter below shows all three routes producing the same output format, a set of pairs, which is what every method that follows consumes.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Ranking &rarr; Pairs Converter</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:8px;margin-bottom:1rem;flex-wrap:wrap">
      <button class="rank-tab" data-t="rank" onclick="rankTab('rank')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">annotator ranking</button>
      <button class="rank-tab" data-t="web" onclick="rankTab('web')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">web votes</button>
      <button class="rank-tab" data-t="judge" onclick="rankTab('judge')" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:7px;padding:.4rem .9rem;font-family:var(--mono);font-size:.68rem;cursor:pointer">LLM judge</button>
    </div>
    <div id="rank-host"></div>
    <div style="font-family:var(--mono);font-size:.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin:1rem 0 .5rem">implied preference pairs</div>
    <div id="rank-pairs" style="display:flex;gap:6px;flex-wrap:wrap"></div>
  </div>
</div>

<div class="quiz-block" id="qpt-pref"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why is preference data so much cheaper to collect than demonstration data?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qpt-pref','Correct. Writing an expert answer requires expertise; picking the better of two answers requires only an opinion, and web votes even provide it for free.')">Comparing two answers requires only an opinion, not the skill to write one</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-pref','Preferences still need people or judges; the saving is in the difficulty per label, not zero labor.')">It requires no human involvement at all</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-pref','Model size is unrelated to data collection cost.')">Preference models are smaller</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-pref','Both kinds of data can be used for many tasks.')">Preferences only apply to one task</button>
</div><div class="quiz-explain" id="qpt-pref-explain"></div></div>`;

// ── 9.2.2 BRADLEY-TERRY ────────────────────────────────────
PT_PAGES.bt = `
<div class="lesson-chapter-label">Section 9.2.2</div>
<h1 class="lesson-h1">The Bradley-Terry Model</h1>
<p class="lesson-intro">We now have a dataset of comparisons and we want to learn from it with gradient descent, which means we need a probabilistic model that connects comparisons to numbers. The standard choice is the Bradley-Terry model, proposed in 1952 for ranking problems such as sports teams, and it rests on one assumption: every option i has an unobserved scalar quality z&#7522;, and the probability that option i is preferred over option j depends only on those two scores.</p>

<h2 class="lesson-h2">From Scores to Win Probabilities</h2>
<p class="lesson-p">Concretely, Bradley-Terry models the preference probability as option i&rsquo;s share of the total when each score is exponentiated:</p>
<div class="lesson-math" id="pt-bt-exp">\\[P(o_i \\succ o_j) = \\frac{e^{z_i}}{e^{z_i} + e^{z_j}}\\]</div>
<p class="lesson-p">Divide numerator and denominator by \\(e^{z_i}\\) and this becomes a function of the score difference alone:</p>
<div class="lesson-math" id="pt-bt-main">\\[P(o_i \\succ o_j) = \\frac{1}{1 + e^{-(z_i - z_j)}} = \\sigma(z_i - z_j)\\]</div>
<p class="lesson-p">This is the sigmoid function from logistic regression, applied to a score difference. The correspondence with logistic regression is exact, not loose: in logistic regression, a linear score is interpreted as the log-odds of the positive class and the sigmoid converts it to a probability. Here, the score difference &delta; = z&#7522; &minus; z&#11388; is the log-odds that i beats j:</p>
<div class="lesson-math" id="pt-bt-logit">\\[\\delta = z_i - z_j = \\log\\frac{P(o_i \\succ o_j)}{1 - P(o_i \\succ o_j)}\\]</div>
<p class="lesson-p">The consequences are the ones you already know from logistic regression. If the scores are equal, &delta; = 0 and the preference probability is exactly 0.5: the model predicts a coin flip, which is the correct formalization of &ldquo;no real preference.&rdquo; As the gap grows, the probability approaches 0 or 1, and it saturates: beyond a gap of three or four, additional score difference changes the probability very little. Only differences matter; adding the same constant to every score changes nothing, so the scores have no absolute zero point. Move the two scores below and verify each of these properties on the curve.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Preference Sigmoid</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:1rem">
      <label style="font-family:var(--mono);font-size:.7rem;color:var(--accent)">z&#7522; (answer A) <input type="range" min="-3" max="3" step="0.1" value="0.5" oninput="btSet('zi',this.value)" style="width:130px;accent-color:var(--accent);vertical-align:middle"> <span id="bt-ziv">0.5</span></label>
      <label style="font-family:var(--mono);font-size:.7rem;color:var(--accent3)">z&#11388; (answer B) <input type="range" min="-3" max="3" step="0.1" value="-0.5" oninput="btSet('zj',this.value)" style="width:130px;accent-color:var(--accent3);vertical-align:middle"> <span id="bt-zjv">-0.5</span></label>
    </div>
    <canvas id="bt-canvas" width="640" height="250" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="bt-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;text-align:center;min-height:1.8rem"></div>
  </div>
</div>

<div class="quiz-block" id="qpt-bt"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">In the Bradley-Terry model, what does a win probability of exactly 0.5 mean?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qpt-bt','Correct. P = 0.5 means the score difference is zero: the two answers have equal hidden quality, so the comparison is a coin flip.')">The two answers have equal hidden scores, no real preference</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-bt','Both answers can be excellent or terrible; 0.5 only says they are equal.')">Both answers are bad</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-bt','The sigmoid maps a zero difference to 0.5 by design, not by failure.')">The model has failed to converge</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-bt','Annotator noise is a separate matter; 0.5 is about equal scores.')">The annotators disagreed</button>
</div><div class="quiz-explain" id="qpt-bt-explain"></div></div>`;

// ── 9.2.3 THE REWARD MODEL ─────────────────────────────────
PT_PAGES.rm = `
<div class="lesson-chapter-label">Section 9.2.3</div>
<h1 class="lesson-h1">The Reward Model</h1>
<p class="lesson-intro">Bradley-Terry assumes each response has a scalar score, but the dataset contains no scores, only comparisons. The solution is to make the score a learned function: train a network \\(r_\\theta(x, o)\\) that reads a prompt x and a candidate response o and outputs one number, and fit its parameters so that the Bradley-Terry probabilities it induces match the observed comparisons. This network is called the <strong>reward model</strong>, and it is the component that converts a pile of human judgments into a signal that optimization can use.</p>

<h2 class="lesson-h2">The Architecture: An LLM With a Scalar Head</h2>
<p class="lesson-p">A reward model must judge language, so it is built from a language model. The standard construction starts from a pretrained, usually instruction-tuned, LLM and replaces its output layer. Recall from Section 8.5 that the language-modeling head is a linear projection from the final hidden vector to a vector of |V| logits, one per vocabulary item. For the reward model, that head is removed and replaced by a linear layer producing a single scalar; the score is read off at the final token of the (prompt, response) sequence. Everything the LLM learned about language during pretraining is kept and repurposed: the network no longer predicts the next word, it summarizes the whole sequence into one number.</p>

<h2 class="lesson-h2">The Training Objective</h2>
<p class="lesson-p">Substituting the learned rewards for the hidden scores in the Bradley-Terry model, the probability that the human-chosen response \\(o_w\\) is preferred over the rejected response \\(o_l\\) is:</p>
<div class="lesson-math" id="pt-rm-bt">\\[p\\big(o_w \\succ o_l \\mid x\\big) = \\sigma\\big(r_\\theta(x, o_w) - r_\\theta(x, o_l)\\big)\\]</div>
<p class="lesson-p">Training maximizes the likelihood of the observed comparisons, which is a binary cross-entropy in which the label is always &ldquo;the chosen response wins&rdquo;:</p>
<div class="lesson-math" id="pt-rm-loss">\\[L_{RM}(\\theta) = -\\,\\mathbb{E}_{(x,\\, o_w,\\, o_l) \\sim D}\\Big[\\log \\sigma\\big(r_\\theta(x, o_w) - r_\\theta(x, o_l)\\big)\\Big]\\]</div>
<p class="lesson-p">The gradient of this loss has an informative structure. Its magnitude is proportional to \\(\\sigma(r_l - r_w)\\), the model&rsquo;s current probability of getting the comparison wrong. When the model already scores the winner far above the loser, the gradient is near zero and the example barely changes anything; when the model has the pair backwards, the gradient is large. Training therefore concentrates on the comparisons the model currently gets wrong, the same behavior logistic regression exhibits.</p>
<p class="lesson-p">Note two things about what this training does and does not determine. Because only differences enter the loss, the absolute scale of the rewards is arbitrary. And because the supervision never includes true scores, the reward model&rsquo;s outputs on new responses are an extrapolation: the useful empirical fact is that this extrapolation works, and a trained reward model assigns sensible scores to responses that appeared in no comparison. The demonstration below trains a two-response reward model with the exact gradient above, then evaluates it on responses outside the training pair.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Train a Reward Model</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1rem">
      <button onclick="rmStep()" id="rm-step" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Gradient step &#8595;</button>
      <button onclick="rmTest()" id="rm-test" style="background:var(--accent4);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Test on fresh answers</button>
      <button onclick="rmReset()" style="background:var(--surface2);color:var(--muted);border:1px solid var(--border2);border-radius:8px;padding:.5rem 1rem;font-family:var(--mono);font-size:.72rem;cursor:pointer">Reset</button>
    </div>
    <canvas id="rm-canvas" width="640" height="270" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="rm-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<div class="quiz-block" id="qpt-rm"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What supervision does the reward model actually receive during training?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qpt-rm','Correct. No true scores exist; the only signal is which answer humans preferred, fit through the Bradley-Terry model as a binary cross-entropy.')">Only which of two answers was preferred, never the true scores</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-rm','Gold scalar rewards are exactly what we never observe; that is the whole difficulty.')">Gold scalar reward values for each answer</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-rm','Next-token prediction is the pretraining and SFT objective, not the reward-model objective.')">Next-token prediction targets</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-rm','No environment rollout is involved in training the reward model itself.')">Rewards from interacting with an environment</button>
</div><div class="quiz-explain" id="qpt-rm-explain"></div></div>`;

// ── 9.3 ALIGNMENT AND THE KL PENALTY ───────────────────────
PT_PAGES.align = `
<div class="lesson-chapter-label">Section 9.3</div>
<h1 class="lesson-h1">Alignment and the KL Penalty</h1>
<p class="lesson-intro">With a trained reward model in hand, the final training stage uses it to change the language model itself, so that the model produces the kinds of responses people preferred. This stage is framed as reinforcement learning, and the framing is worth stating precisely, because every term in it maps onto something concrete introduced earlier.</p>

<h2 class="lesson-h2">Generation as Reinforcement Learning</h2>
<p class="lesson-p">In reinforcement learning, an agent in a state takes actions according to a policy and receives rewards. For a language model: the <strong>state</strong> is the current context, the prompt plus the tokens generated so far; an <strong>action</strong> is emitting one token from the vocabulary; the <strong>policy</strong> \\(\\pi_\\theta\\) is the language model itself, since it is exactly a distribution over next tokens given the context; and the <strong>reward</strong> is the reward model&rsquo;s score r&#966;(x, y), given once the full response y is complete. Reinforcement learning is needed rather than ordinary supervised learning because there is no target response to imitate: the reward arrives only for whole sampled outputs, and sampling is not differentiable, so we cannot backpropagate from the reward through the generation. Policy-gradient algorithms, of which PPO (Proximal Policy Optimization) is the standard choice in this setting, are the tools built for exactly this situation: they sample outputs from the current policy, score them, and adjust the policy to make high-scoring outputs more probable.</p>

<h2 class="lesson-h2">Why the KL Term Exists</h2>
<p class="lesson-p">If we simply maximized the expected reward, the procedure would fail, for a reason that is important to understand. The reward model is not the truth; it is a proxy fit to a finite set of comparisons, and it has regions where its scores are high for bad reasons. An optimizer given free rein will find those regions. The policy drifts toward outputs the reward model happens to overrate, repetitive, exaggerated, or degenerate text, and its score climbs while its actual quality collapses. This failure is called <strong>reward hacking</strong>. At the same time, large unconstrained updates destroy the language ability the model spent all of pretraining acquiring, which is <strong>catastrophic forgetting</strong>.</p>
<p class="lesson-p">Both problems have the same fix: penalize the optimized policy for moving too far, in distribution, from the model it started as. Let \\(\\pi_\\theta\\) be the policy being trained and \\(\\pi_{ref}\\) a frozen copy of the SFT model. The objective maximizes reward minus a penalty proportional to the KL divergence between the two:</p>
<div class="lesson-math" id="pt-al-obj">\\[\\max_\\theta \\;\\; \\mathbb{E}_{x \\sim D,\\; y \\sim \\pi_\\theta(\\cdot \\mid x)}\\big[\\, r_\\phi(x, y) \\,\\big] \\;-\\; \\beta\\, D_{KL}\\big(\\pi_\\theta(\\cdot \\mid x) \\,\\big\\|\\, \\pi_{ref}(\\cdot \\mid x)\\big)\\]</div>
<p class="lesson-p">where the KL divergence measures how differently the two models distribute probability over responses:</p>
<div class="lesson-math" id="pt-al-kl">\\[D_{KL}\\big(\\pi_\\theta \\,\\big\\|\\, \\pi_{ref}\\big) = \\mathbb{E}_{y \\sim \\pi_\\theta(\\cdot \\mid x)}\\left[\\log \\frac{\\pi_\\theta(y \\mid x)}{\\pi_{ref}(y \\mid x)}\\right]\\]</div>
<p class="lesson-p">In practice the penalty is folded into the reward of each sampled response, giving the quantity the RL algorithm actually optimizes:</p>
<div class="lesson-math" id="pt-al-rew">\\[R(x, y) = r_\\phi(x, y) - \\beta \\log \\frac{\\pi_\\theta(y \\mid x)}{\\pi_{ref}(y \\mid x)}\\]</div>
<p class="lesson-p">The coefficient &beta; controls the tradeoff, and its two failure directions are asymmetric. If &beta; is too small, the penalty is negligible and the policy reward-hacks as described above. If &beta; is too large, the penalty dominates and the policy barely changes: fluent, unchanged, and no more aligned than before. An intermediate &beta; moves the policy toward responses the reward model scores well while keeping it close enough to the reference to remain fluent. This is why alignment is accurately described as an adjustment of an existing model rather than new training from scratch. In the demonstration below, the horizontal axis is a one-dimensional schematic of response space (real response space is enormous; the axis is an illustration, not the real geometry). The reward function has two high regions: a broad one at genuinely helpful responses and a narrow, higher one representing the reward model&rsquo;s exploitable error. The marker shows where the optimum of R lands as you change &beta;.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Effect of the KL Coefficient &beta;</span></div>
  <div class="viz-body">
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:5px"><span>KL coefficient &beta;</span><span id="kl-bv" style="color:var(--accent)">0.60</span></div>
      <input id="kl-slider" type="range" min="0.02" max="3" step="0.02" value="0.6" oninput="klSet(this.value)" style="width:100%;accent-color:var(--accent)">
    </div>
    <canvas id="kl-canvas" width="640" height="260" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="kl-sample" style="background:var(--panel);border-radius:10px;padding:.9rem 1rem;font-family:var(--mono);font-size:.72rem;line-height:1.7;color:#ECF1FF;margin-top:1rem;min-height:3rem"></div>
    <div id="kl-caption" style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.8rem;line-height:1.6;min-height:1.6rem"></div>
  </div>
</div>

<div class="quiz-block" id="qpt-al"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What goes wrong when &beta; is set too small?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qpt-al','Correct. With a negligible penalty the policy drifts far from the reference, exploits the reward model with degenerate high-scoring text, and loses language quality.')">The policy reward-hacks into degenerate text and forgets its language ability</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-al','That is what happens with beta too LARGE: the model barely moves from the reference.')">The model refuses to change at all</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-al','The reward model is frozen during policy optimization; it does not retrain here.')">The reward model overfits</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-al','Vocabulary size is fixed by the tokenizer, unrelated to beta.')">The vocabulary shrinks</button>
</div><div class="quiz-explain" id="qpt-al-explain"></div></div>`;

// ── 9.3.2 DPO ──────────────────────────────────────────────
PT_PAGES.dpo = `
<div class="lesson-chapter-label">Section 9.3.2</div>
<h1 class="lesson-h1">Direct Preference Optimization</h1>
<p class="lesson-intro">PPO-based RLHF uses a policy, reference policy, reward model, and value estimates. Direct Preference Optimization (DPO) derives a preference loss from the KL-regularized objective, so it can train directly on preferred and rejected response pairs without a separate reward model or an online reinforcement-learning loop.</p>

<h2 class="lesson-h2">The Derivation in Three Steps</h2>
<p class="lesson-p"><strong>Step one: solve for the optimal policy.</strong> The objective of Section 9.3, expected reward minus &beta; times the KL to the reference, is well studied, and its maximizer has a closed form. The optimal policy is the reference policy reweighted by the exponentiated reward:</p>
<div class="lesson-math" id="pt-dpo-opt">\\[\\pi^*(y \\mid x) = \\frac{1}{Z(x)}\\, \\pi_{ref}(y \\mid x)\\, \\exp\\!\\big(r(x, y)/\\beta\\big), \\qquad Z(x) = \\sum_{y'} \\pi_{ref}(y' \\mid x)\\, \\exp\\!\\big(r(x, y')/\\beta\\big)\\]</div>
<p class="lesson-p">Z(x) is the partition function, the normalizer that makes &pi;* a proper distribution. It is a sum over every possible response to x, which makes it impossible to compute; this intractability is exactly why RLHF resorts to sampling-based RL in the first place. Now take the logarithm of the equation above and rearrange it to express the reward in terms of the policy:</p>
<div class="lesson-math" id="pt-dpo-r" style="display:block">\\[r(x, y) = \\beta \\log \\frac{\\pi^*(y \\mid x)}{\\pi_{ref}(y \\mid x)} + \\textcolor{#9F1239}{\\beta \\log Z(x)}\\]</div>
<p class="lesson-p">Read this carefully: it says that any reward function and its optimal KL-anchored policy are two descriptions of the same object. Given the policy, the reward it optimizes is recoverable (up to the term in pink) as &beta; times the log of how much the policy upweights y relative to the reference. This identity is the observation behind the DPO paper&rsquo;s title, &ldquo;Your Language Model Is Secretly a Reward Model.&rdquo;</p>
<p class="lesson-p"><strong>Step two: substitute into Bradley-Terry.</strong> The Bradley-Terry probability that the chosen response \\(y_w\\) beats the rejected response \\(y_l\\) depends only on the <em>difference</em> of their rewards. Substitute the expression above for both rewards. The pink term &beta;&thinsp;log&thinsp;Z(x) depends only on the prompt x, not on which response is being scored, so it appears identically in both terms of the difference and subtracts away:</p>
<div class="lesson-math" id="pt-dpo-diff" style="display:none">\\[r(x, y_w) - r(x, y_l) = \\beta \\log \\frac{\\pi_\\theta(y_w \\mid x)}{\\pi_{ref}(y_w \\mid x)} - \\beta \\log \\frac{\\pi_\\theta(y_l \\mid x)}{\\pi_{ref}(y_l \\mid x)} + \\textcolor{#9F1239}{\\beta \\log Z(x) - \\beta \\log Z(x)}\\]</div>
<p class="lesson-p"><strong>Step three: write the loss.</strong> The intractable normalizer is gone, and what remains involves only quantities we can compute: log-probabilities of the two responses under the trainable policy \\(\\pi_\\theta\\) and the frozen reference. Maximizing the likelihood of the observed preferences gives the DPO loss, a binary cross-entropy over preference pairs:</p>
<div class="lesson-math" id="pt-dpo-loss" style="display:none">\\[L_{DPO}(\\theta) = -\\,\\mathbb{E}_{(x,\\, y_w,\\, y_l) \\sim D}\\left[\\log \\sigma\\!\\left(\\beta \\log \\frac{\\pi_\\theta(y_w \\mid x)}{\\pi_{ref}(y_w \\mid x)} - \\beta \\log \\frac{\\pi_\\theta(y_l \\mid x)}{\\pi_{ref}(y_l \\mid x)}\\right)\\right]\\]</div>
<p class="lesson-p">The gradient of this loss increases the probability of the chosen response and decreases the probability of the rejected one, weighted by how wrong the implicit reward currently is on that pair. Training is ordinary supervised learning over a fixed dataset: no reward model is ever trained, no value model exists, and no sampling from the policy occurs during training. Only two networks are involved, the policy and the frozen reference, and the reference is only evaluated, never updated. Step through the pipeline comparison below while the equations above track the corresponding stage of the derivation.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; PPO vs. DPO</span></div>
  <div class="viz-body">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
      <button onclick="dpoStep()" id="dpo-btn" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.2rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">Next step of the derivation &#8594;</button>
      <span id="dpo-count" style="font-family:var(--mono);font-size:.7rem;color:var(--muted);margin-left:auto"></span>
    </div>
    <canvas id="dpo-canvas" width="640" height="250" style="width:100%;max-width:640px;display:block;margin:0 auto"></canvas>
    <div id="dpo-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:2.6rem"></div>
  </div>
</div>

<p class="lesson-p">One thing does not change between the two methods: &beta; appears in the DPO loss playing the same role it played in Section 9.3. The aligned model is still constrained toward its reference; the constraint is simply enforced through the loss rather than through an explicit penalty during RL. DPO removed the machinery of RLHF, not its underlying objective.</p>

<div class="quiz-block" id="qpt-dpo"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does the partition function Z(x) disappear from the DPO loss?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qpt-dpo','Correct. Bradley-Terry depends only on the reward DIFFERENCE between the two answers, and Z(x) depends only on the prompt, so it is identical for both and cancels.')">It depends only on the prompt, so it is identical for both answers and cancels in the difference</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-dpo','Z(x) is intractable to compute; the derivation succeeds precisely because we never need to.')">It is easy to compute so we just divide it out numerically</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-dpo','Z(x) is not zero; it simply appears on both sides of the subtraction.')">It equals zero at the optimum</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-dpo','The reference model stays: DPO trains the policy against the frozen reference.')">The reference model absorbs it during sampling</button>
</div><div class="quiz-explain" id="qpt-dpo-explain"></div></div>`;

// ── 9.4 TEST-TIME COMPUTE ──────────────────────────────────
PT_PAGES.ttc = `
<div class="lesson-chapter-label">Section 9.4</div>
<h1 class="lesson-h1">Test-Time Compute</h1>
<p class="lesson-intro">Everything so far has improved the model by changing its weights: pretraining sets them, post-training adjusts them. There is a third way to get better answers that changes no weights at all: spend more computation at inference time, when the model is answering. This family of methods is called test-time compute, and its simplest and most influential member is chain-of-thought prompting (Wei et al., 2022).</p>

<h2 class="lesson-h2">Chain-of-Thought Prompting</h2>
<p class="lesson-p">Consider an arithmetic word problem of the kind collected in grade-school math benchmarks such as GSM8K: &ldquo;A workshop had 34 chairs. Staff carried 18 of them into the hall, then took delivery of 7 new ones. How many chairs are in the workshop now?&rdquo; Under standard few-shot prompting, the demonstrations in the prompt show questions followed immediately by answers, so the model imitates that format and must produce the final number in a single step. On multi-step problems it frequently produces a plausible-looking wrong number, such as 45 here, which is what you get by adding the 18 instead of subtracting it.</p>
<p class="lesson-p">Chain-of-thought prompting changes only the demonstrations: each demonstration now shows the intermediate reasoning written out before the answer. The model imitates this format too, generating its own intermediate steps before committing to a final number, and accuracy on multi-step problems improves dramatically. The mechanism is conditional generation, nothing more. The model generates a reasoning chain c token by token, then generates the answer a conditioned on both the problem and the chain:</p>
<div class="lesson-math" id="pt-cot-fact">\\[p(c, a \\mid x) = p(c \\mid x)\\, \\cdot\\, p(a \\mid x, c)\\]</div>
<p class="lesson-p">Each generated reasoning token becomes part of the context for everything after it. Producing &ldquo;34 &minus; 18 = 16&rdquo; is an easy prediction; once it is in the context, &ldquo;16 + 7 = 23&rdquo; is also easy; and once both are in the context, the final answer 23 is nearly forced. The hard single prediction has been decomposed into a sequence of easy ones, at the cost of generating more tokens, which is exactly what &ldquo;spending more compute at test time&rdquo; means. Two details are worth recording. First, no weights change and no training data is involved; the entire effect comes from the prompt. Second, the standard evaluations of chain-of-thought decode greedily at temperature 0 (Section 7.4), so the improvement is not an artifact of sampling randomness.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Standard vs. Chain-of-Thought</span></div>
  <div class="viz-body">
    <div style="font-family:var(--mono);font-size:.72rem;color:var(--text);line-height:1.7;background:var(--surface2);border-radius:10px;padding:.8rem 1rem;margin-bottom:1rem"><span style="color:var(--muted)">problem:</span> A workshop had 34 chairs. Staff carried 18 of them into the hall, then took delivery of 7 new ones. How many chairs are in the workshop now?</div>
    <div style="display:flex;justify-content:center;margin-bottom:1rem"><button onclick="cotRun()" id="cot-btn" style="background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:.5rem 1.3rem;font-family:var(--mono);font-size:.72rem;font-weight:700;cursor:pointer">&#9654; Generate both answers</button></div>
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      <div style="flex:1;min-width:260px">
        <div style="font-family:var(--mono);font-size:.6rem;color:var(--accent3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem">standard prompting</div>
        <div id="cot-std" style="background:var(--panel);border-radius:10px;padding:.9rem;font-family:var(--mono);font-size:.74rem;line-height:1.8;color:#ECF1FF;min-height:6.5rem"></div>
      </div>
      <div style="flex:1;min-width:260px">
        <div style="font-family:var(--mono);font-size:.6rem;color:var(--accent4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem">chain-of-thought (demos include worked steps)</div>
        <div id="cot-cot" style="background:var(--panel);border-radius:10px;padding:.9rem;font-family:var(--mono);font-size:.74rem;line-height:1.8;color:#ECF1FF;min-height:6.5rem"></div>
      </div>
    </div>
    <div id="cot-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;min-height:1.8rem">Same weights, same problem. The only difference is that the chain-of-thought prompt includes demonstrations with worked steps.</div>
  </div>
</div>

<div class="quiz-block" id="qpt-cot"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does chain-of-thought prompting improve accuracy without any weight changes?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qpt-cot','Correct. Each generated reasoning token becomes conditioning context, decomposing a hard prediction into easier ones and making the final answer token far more likely to be right.')">Each generated reasoning token becomes context that makes the final answer more probable</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-cot','No gradient updates occur at inference time; the weights are untouched.')">The model finetunes itself on the reasoning steps</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-cot','Temperature is typically zero (greedy) in these evaluations; randomness is not the mechanism.')">Higher temperature explores more answers</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-cot','The context window is unchanged; it is simply used to hold the reasoning.')">The context window becomes larger</button>
</div><div class="quiz-explain" id="qpt-cot-explain"></div></div>`;

// ── 9.5 CHAPTER RECAP ──────────────────────────────────────
PT_PAGES.ptrecap = `
<div class="lesson-chapter-label">Section 9.5</div>
<h1 class="lesson-h1">Recap</h1>
<p class="lesson-intro">Training was described earlier in three stages: pretraining, instruction tuning, alignment. Here we covered the second and third. The pipeline below shows every component in order; click any labeled stage to return to its section.</p>

<h2 class="lesson-h2">The Full Pipeline</h2>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Base Model to Aligned Model</span></div>
  <div class="viz-body">
    <canvas id="ptr-canvas" width="640" height="250" style="width:100%;max-width:640px;display:block;margin:0 auto;cursor:pointer"></canvas>
    <div id="ptr-caption" style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7;text-align:center;min-height:1.8rem">Hover or click a stage.</div>
  </div>
</div>

<p class="lesson-p">To summarize it all as a sequence of decisions. A base model predicts text but does not follow instructions, so we continue training it on instruction-response pairs with the unchanged next-token cross-entropy; because the training mixture spans many tasks, the resulting model follows instructions for tasks outside the mixture as well. Demonstrations are expensive to write, so further supervision comes as comparisons between model outputs, which anyone can provide. The Bradley-Terry model converts comparisons into a probabilistic objective, P(i beats j) = &sigma;(z&#7522; &minus; z&#11388;), and a reward model trained with the corresponding binary cross-entropy learns to score responses from comparisons alone. Optimizing the language model against that reward requires reinforcement learning, and requires a KL penalty toward the frozen reference model, controlled by &beta;, to prevent reward hacking and preserve language quality. DPO reaches the same objective without the reward model or the sampling loop, because the optimal policy determines its reward up to a term that cancels in Bradley-Terry differences. Finally, test-time compute improves answers with no weight changes at all, by generating intermediate reasoning that conditions the final answer.</p>
<p class="lesson-p">Notice how little new mathematics was needed. SFT uses the same cross-entropy introduced earlier. Bradley-Terry, the reward model, and DPO all use the sigmoid and the logistic loss from logistic regression. The genuinely new elements are the KL penalty and the closed form of its optimal policy, and both are single equations. Post-training is a small amount of new theory applied on top of machinery built earlier in this course.</p>

<div class="quiz-block" id="qpt-recap"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Which ordering correctly describes the post-training pipeline?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qpt-recap','Correct. SFT teaches instruction-following first; preferences are then collected and modeled; alignment optimizes the SFT model toward them under a KL constraint.')">Base &rarr; instruction tuning &rarr; preference data &rarr; reward modeling &rarr; KL-constrained alignment</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-recap','Alignment needs a preference signal to optimize; it cannot come before the preference data exists.')">Base &rarr; alignment &rarr; preference data &rarr; instruction tuning</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-recap','The reward model is trained FROM preference data, so the data must come first.')">Base &rarr; reward modeling &rarr; preference data &rarr; SFT</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qpt-recap','Chain-of-thought is test-time compute, applied at inference after all training stages.')">Chain-of-thought &rarr; SFT &rarr; pretraining</button>
</div><div class="quiz-explain" id="qpt-recap-explain"></div></div>`;

// ── PT EQUATIONS ───────────────────────────────────────────
PT_EQ.sft = { 'pt-sft-loss': 'L_{SFT}(\\theta) = -\\sum_{t=1}^{T} \\log p_\\theta(y_t \\mid x, y_{<t})' };
PT_EQ.pref = { 'pt-pref-pairs': '\\binom{N}{2} = \\frac{N(N-1)}{2}' };
PT_EQ.bt = {
  'pt-bt-exp': 'P(o_i \\succ o_j) = \\frac{e^{z_i}}{e^{z_i} + e^{z_j}}',
  'pt-bt-main': 'P(o_i \\succ o_j) = \\frac{1}{1 + e^{-(z_i - z_j)}} = \\sigma(z_i - z_j)',
  'pt-bt-logit': '\\delta = z_i - z_j = \\log\\frac{P(o_i \\succ o_j)}{1 - P(o_i \\succ o_j)}'
};
PT_EQ.rm = {
  'pt-rm-bt': 'p(o_w \\succ o_l \\mid x) = \\sigma(r_\\theta(x, o_w) - r_\\theta(x, o_l))',
  'pt-rm-loss': 'L_{RM}(\\theta) = -\\mathbb{E}_{(x, o_w, o_l) \\sim D}[\\log \\sigma(r_\\theta(x, o_w) - r_\\theta(x, o_l))]'
};
PT_EQ.align = {
  'pt-al-obj': '\\max_\\theta \\; \\mathbb{E}[r_\\phi(x, y)] - \\beta D_{KL}(\\pi_\\theta \\| \\pi_{ref})',
  'pt-al-kl': 'D_{KL}(\\pi_\\theta \\| \\pi_{ref}) = \\mathbb{E}_{y \\sim \\pi_\\theta}[\\log(\\pi_\\theta / \\pi_{ref})]',
  'pt-al-rew': 'R(x, y) = r_\\phi(x, y) - \\beta \\log(\\pi_\\theta(y|x) / \\pi_{ref}(y|x))'
};

// ── OPEN PT SECTION ────────────────────────────────────────
function openPTSec(id){
  const pg = PT_PAGES[id];
  if(!pg) return;
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if(!sv || !sb) return;
  const sec = PT_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if(crumb && sec) crumb.innerHTML = 'Post-Training <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  renderMath(sb);
  mcSectionDelay(()=>{
    if(id==='sft'){ sftReset(); ftbBuild(); }
    if(id==='instrdata'){ tmplBuild(); safeSet(0); }
    if(id==='sfteval') looBuild();
    if(id==='pref'){ judgeBuild(); rankBuild(); }
    if(id==='bt') btBuild();
    if(id==='rm') rmReset();
    if(id==='align') klBuild();
    if(id==='dpo') dpoBuild();
    if(id==='ttc') cotBuild();
    if(id==='ptrecap') ptrecapBuild();
  }, 120);
  sv.onscroll = () => {
    const h = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if(bar) bar.style.width = (h>0?(sv.scrollTop/h)*100:0)+'%';
  };
}


// ── 9.1 VIZ: SAME LOSS, NEW DATA ───────────────────────────
const SFT_TASKS=[['translation','"Translate to French: the sea" \u2192 "la mer"','#4DE3FF'],['summarization','"Summarize this report: \u2026" \u2192 [3-line summary]','#A18FFF'],['question answering','"Who wrote Dracula?" \u2192 "Bram Stoker"','#ff8c42']];
let _sft={ ep:0, tested:false };
function sftReset(){ _sft.ep=0; _sft.tested=false; sftDraw(); const c=document.getElementById('sft-caption'); if(c) c.innerHTML='Three instruction datasets, one untouched held-out task. Test now to see what the raw base model does, or train first.'; }
function sftTrain(){ if(_sft.ep<4){ _sft.ep++; _sft.tested=false; sftDraw(); const c=document.getElementById('sft-caption'); if(c) c.innerHTML='Pass '+_sft.ep+': every example scored with the SAME next-token cross-entropy as pretraining, L = \u2212log p(response | instruction). Losses falling on all three tasks.'; } }
function sftTest(){ _sft.tested=true; sftDraw(); const c=document.getElementById('sft-caption');
  if(!c) return;
  if(_sft.ep===0) c.innerHTML='<span style="color:var(--accent3)">Held-out task, base model:</span> &ldquo;Plan me three dinners for this week&rdquo; \u2192 <i>&ldquo;Plan me three lunches for next week. Plan me four breakfasts\u2026&rdquo;</i> \u2717 &mdash; it continues the text instead of obeying it.';
  else if(_sft.ep===1) c.innerHTML='<span style="color:#fde047">Held-out task, 1 pass:</span> \u2192 <i>&ldquo;Dinner one: pasta. Dinner one: pasta. Dinner\u2026&rdquo;</i> &mdash; trying to answer now, but shaky. Keep training.';
  else c.innerHTML='<span style="color:var(--accent4)">Held-out task, '+_sft.ep+' passes:</span> \u2192 <i>&ldquo;Mon: lentil soup + bread. Wed: chicken stir-fry. Fri: mushroom risotto.&rdquo;</i> \u2713 &mdash; <b>meal planning was never in the training data.</b> Training on a diverse mixture of instructions improved instruction-following in general, which is the transfer effect described in the text.';
}
function sftDraw(){
  const cv=document.getElementById('sft-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, ep=_sft.ep;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('TRAINING TASKS (loss \u2193 with each pass)',20,20);
  SFT_TASKS.forEach(([name,ex,col],i)=>{
    const y=40+i*58;
    ctx.fillStyle='rgba(255,255,255,0.06)'; roundRect(ctx,20,y,380,46,8); ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=1; ctx.globalAlpha=0.5; roundRect(ctx,20,y,380,46,8); ctx.stroke(); ctx.globalAlpha=1;
    ctx.fillStyle=col; ctx.font='bold 10px monospace'; ctx.fillText(name,32,y+16);
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace'; ctx.fillText(ex,32,y+30);
    const loss=2.6*Math.pow(0.52,ep)+0.35;
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace'; ctx.fillText('loss',32,y+42);
    ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(58,y+36,200,7);
    ctx.fillStyle=col; ctx.fillRect(58,y+36,200*(loss/3),7);
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.fillText(loss.toFixed(2),264,y+42);
  });
  // held out card
  const hx=430, hy=64;
  ctx.setLineDash([5,4]);
  ctx.strokeStyle=_sft.tested?'rgba(61,220,132,0.7)':'rgba(255,255,255,0.25)'; ctx.lineWidth=1.4;
  roundRect(ctx,hx,hy,190,96,10); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle=_sft.tested?'rgba(61,220,132,0.08)':'rgba(255,255,255,0.02)'; roundRect(ctx,hx,hy,190,96,10); ctx.fill();
  ctx.fillStyle=_sft.tested?'#3DDC84':'rgba(255,255,255,0.5)'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
  ctx.fillText('HELD-OUT TASK',hx+95,hy+22);
  ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='9px monospace';
  ctx.fillText('meal planning',hx+95,hy+40);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace';
  ctx.fillText('never seen in training',hx+95,hy+56);
  ctx.fillText('passes trained: '+ep,hx+95,hy+76);
}

// cost bar (static)
function sftCostDraw(){
  const cv=document.getElementById('sft-cost'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const x0=140, x1=W-30, lg0=6, lg1=13.4;
  const X=lg=>x0+(lg-lg0)/(lg1-lg0)*(x1-x0);
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.moveTo(x0,H-26); ctx.lineTo(x1,H-26); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace'; ctx.textAlign='center';
  for(let g=6;g<=13;g++){ ctx.fillText('10^'+g,X(g),H-12); }
  // pretraining bar
  ctx.fillStyle='rgba(255,95,142,0.55)'; ctx.fillRect(x0,22,X(13.2)-x0,16);
  ctx.fillStyle='#ff8aa0'; ctx.font='9px monospace'; ctx.textAlign='right';
  ctx.fillText('pretraining \u00b7 ~10\u00b9\u00b3 tokens',x0-8,34);
  // sft bar
  ctx.fillStyle='rgba(77,227,255,0.8)'; ctx.fillRect(x0,52,Math.max(3,X(8)-x0),16);
  ctx.fillStyle='#4DE3FF'; ctx.textAlign='right';
  ctx.fillText('instruction tuning \u00b7 ~10\u2078 tokens (~100K examples)',x0-8,64);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.textAlign='center'; ctx.font='8px monospace';
  ctx.fillText('tokens processed (log scale)',(x0+x1)/2,H-1);
}

// ── 9.1 VIZ: FINETUNING BOARD ──────────────────────────────
const FTB_LANES=[
  {name:'continued pretraining', col:'#A18FFF', data:'raw domain text (e.g. legal, medical)', loss:'next-token CE', lit:[1,1,1,1,1,1], extra:null, infer:'a base model that knows the new domain',
   cap:'Continued pretraining: keep the pretraining recipe, swap in new-domain text. EVERY parameter updates. The result is still a base model, just fluent in the new domain.'},
  {name:'LoRA / PEFT', col:'#4DE3FF', data:'task or domain data', loss:'next-token CE', lit:[0,0,0,0,0,0], extra:'AB', infer:'the frozen base plus a snap-on adapter',
   cap:'Parameter-efficient finetuning: the entire stack stays frozen \ud83d\udd12; only the tiny low-rank A and B matrices from Section 8.8 learn. Cheap to train, adapters swap per domain.'},
  {name:'MLM task head', col:'#fde047', data:'labeled examples (x, y)', loss:'classification CE', lit:[0,0,0,0,1,1], extra:'HEAD', infer:'a classifier for one specific task',
   cap:'Task-head finetuning (the BERT recipe): bolt a fresh classification head on top, train it (and often the top layers) with a task-specific loss. Powerful, but the result does one task.'},
  {name:'instruction tuning', col:'#3DDC84', data:'(instruction \u2192 response) pairs, many tasks', loss:'next-token CE', lit:[1,1,1,1,1,1], extra:null, infer:'a general instruction-follower',
   cap:'Instruction tuning: all parameters update, with the ordinary next-word loss, but toward diverse instruction-following. The one lane that produces a general-purpose assistant.'}
];
let _ftb={ sel:3 };
function ftbBuild(){
  const cv=document.getElementById('ftb-canvas'); if(!cv) return;
  cv.onclick=e=>{
    const r=cv.getBoundingClientRect();
    const y=(e.clientY-r.top)*(cv.height/r.height);
    const lane=Math.floor((y-30)/68);
    if(lane>=0&&lane<4){ _ftb.sel=lane; ftbDraw(); }
  };
  ftbDraw();
}
function ftbDraw(){
  const cv=document.getElementById('ftb-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('data in',20,22); ctx.fillText('parameters updated',236,22); ctx.fillText('loss',420,22); ctx.fillText('result',508,22);
  FTB_LANES.forEach((L,i)=>{
    const y=30+i*68, sel=i===_ftb.sel;
    ctx.fillStyle=sel?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.02)';
    roundRect(ctx,12,y,W-24,60,9); ctx.fill();
    ctx.strokeStyle=sel?L.col:'rgba(255,255,255,0.12)'; ctx.lineWidth=sel?1.6:1;
    roundRect(ctx,12,y,W-24,60,9); ctx.stroke();
    ctx.fillStyle=L.col; ctx.font='bold 10px monospace'; ctx.textAlign='left';
    ctx.fillText(L.name,20,y+16);
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='8px monospace';
    const d=L.data.length>34?L.data.slice(0,33)+'\u2026':L.data;
    ctx.fillText(d,20,y+32);
    // param stack
    for(let b=0;b<6;b++){
      const bx=236+b*26;
      const on=L.lit[b];
      ctx.fillStyle=on?L.col:'rgba(255,255,255,0.07)';
      ctx.globalAlpha=on?0.8:1;
      ctx.fillRect(bx,y+24,22,16); ctx.globalAlpha=1;
      if(!on){ ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='9px monospace'; ctx.textAlign='center'; ctx.fillText('\ud83d\udd12',bx+11,y+36); ctx.textAlign='left'; }
    }
    if(L.extra==='AB'){ ctx.fillStyle='#4DE3FF'; ctx.fillRect(236+6*26+4,y+24,8,16); ctx.fillRect(236+6*26+15,y+24,8,16); ctx.font='7px monospace'; ctx.fillText('A B',236+6*26+4,y+50); }
    if(L.extra==='HEAD'){ ctx.fillStyle='#fde047'; ctx.fillRect(236+6*26+4,y+24,19,16); ctx.font='7px monospace'; ctx.fillStyle='#fde047'; ctx.fillText('new head',236+6*26+2,y+50); }
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='8px monospace';
    ctx.fillText(L.loss,420,y+34);
    const inf=L.infer.length>22?L.infer.slice(0,21)+'\u2026':L.infer;
    ctx.fillStyle='rgba(255,255,255,0.55)';
    ctx.fillText(inf,508,y+34);
  });
  const cap=document.getElementById('ftb-caption');
  if(cap) cap.innerHTML=FTB_LANES[_ftb.sel].cap;
}

// ── 9.1.1 VIZ: TEMPLATE MACHINE + SAFETY ───────────────────
const TMPL_LIST=[
  '{{text}} How does the reviewer feel about the movie?',
  'Given the review: {{text}} \u2014 is the sentiment positive or negative?',
  'Read this and classify the sentiment. Review: {{text}}'
];
const TMPL_PARA=[
  'What is the emotional tone of this review? {{text}}',
  '{{text}} Would you say the writer enjoyed the experience?',
  'Decide whether the following review is favorable: {{text}}'
];
function tmplBuild(){
  const sel=document.getElementById('tmpl-select'); if(!sel) return;
  sel.innerHTML=TMPL_LIST.map((t,i)=>'<option value="'+i+'">template '+(i+1)+'</option>').join('');
  const p=document.getElementById('tmpl-para'); if(p) p.innerHTML='';
  tmplRender();
}
function tmplRender(){
  const sel=document.getElementById('tmpl-select'), out=document.getElementById('tmpl-out');
  if(!sel||!out) return;
  const t=TMPL_LIST[parseInt(sel.value)||0];
  const filled=t.replace('{{text}}','<span style="color:#4DE3FF">&ldquo;Did not like the service that I was provided&rdquo;</span>');
  out.innerHTML='<span style="color:#8E9AC4">instruction:</span> '+filled+'<br><span style="color:#8E9AC4">response:</span> <span style="color:#FF8AA0">negative</span>'
    +'<div style="font-size:.6rem;color:#8E9AC4;margin-top:.5rem">the {{text}} slot (teal) was filled from the raw example; the label 0 became the gold response. One dataset \u2192 thousands of instructions.</div>';
}
function tmplPara(){
  const p=document.getElementById('tmpl-para'); if(!p) return;
  p.innerHTML='<div style="font-family:var(--mono);font-size:.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem">LLM-paraphrased variants (wording diversity for free)</div>'
    +TMPL_PARA.map(t=>'<div style="font-family:var(--mono);font-size:.68rem;color:var(--text);background:var(--surface2);border-radius:7px;padding:.45rem .7rem;margin-bottom:.35rem">'+t.replace('{{text}}','<span style="color:var(--accent)">{{text}}</span>')+'</div>').join('');
}
function safeSet(v){
  const n=parseInt(v);
  const nv=document.getElementById('safe-nv'); if(nv) nv.textContent=n;
  const harm=35*Math.exp(-n/260)+3.5;
  const bar=document.getElementById('safe-bar'); if(bar) bar.style.width=harm.toFixed(1)+'%';
  const pct=document.getElementById('safe-pct'); if(pct) pct.textContent=harm.toFixed(1)+'%';
  const cap=document.getElementById('safe-caption');
  if(cap){
    if(n===0) cap.textContent='No safety data: the instruction-tuned model answers harmful requests at its base rate.';
    else if(n<500) cap.textContent='The curve falls steeply at first: each additional safety example produces a large reduction.';
    else if(n<1200) cap.innerHTML='By roughly 500 examples, <b>most of the achievable reduction has already occurred</b> (Bianchi et al., 2024).';
    else cap.textContent='Past ~1000 examples the curve is nearly flat, and Bianchi et al. found that adding much more safety data begins to cause over-refusal of benign requests (not shown on this axis).';
  }
}

// ── 9.1.2 VIZ: CLUSTER LEAVE-ONE-OUT ───────────────────────
const LOO_CLUSTERS=[['entailment','#A18FFF'],['sentiment','#FF5F8E'],['QA','#4DE3FF'],['summarization','#ff8c42']];
let _loo={ mode:'cluster', f:0, anim:null, run:false };
function looBuild(){ _loo.f=0; _loo.run=false; looMode('cluster'); }
function looMode(m){
  _loo.mode=m; _loo.f=0; _loo.run=false;
  document.querySelectorAll('.loo-mode').forEach(b=>{ const on=b.dataset.m===m; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  looDraw();
  const c=document.getElementById('loo-caption');
  if(c) c.innerHTML=m==='cluster'?'All five sentiment datasets will lift out together. Run it.':'Only ONE sentiment dataset will be held out; its four siblings stay in training. Run it and watch the leak.';
}
function looRun(){
  if(_loo.anim) cancelAnimationFrame(_loo.anim);
  _loo.run=true;
  const t0=performance.now();
  const loop=now=>{ _loo.f=Math.min(1,(now-t0)/700); looDraw(); if(_loo.f<1) _loo.anim=requestAnimationFrame(loop); else{ _loo.anim=null; looCaption(); } };
  _loo.anim=requestAnimationFrame(loop);
}
function looCaption(){
  const c=document.getElementById('loo-caption'); if(!c) return;
  if(_loo.mode==='cluster') c.innerHTML='Score on the withheld cluster: <span style="color:var(--accent)">71%</span> \u2014 an honest measure of instruction-following on a genuinely unseen TASK.';
  else c.innerHTML='Score on the held-out dataset: <span style="color:var(--accent3)">93%</span> \u2014 inflated. The dashed pink lines are the leak: four sibling sentiment datasets stayed in training and taught the task anyway.';
}
function looDraw(){
  const cv=document.getElementById('loo-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, f=_loo.f;
  ctx.clearRect(0,0,W,H);
  // train pool + test tray
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
  roundRect(ctx,16,86,W-32,H-100,10); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace'; ctx.textAlign='left';
  ctx.fillText('TRAINING POOL',26,102);
  ctx.strokeStyle='rgba(61,220,132,0.4)'; ctx.setLineDash([4,4]);
  roundRect(ctx,W-232,12,216,58,9); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='rgba(61,220,132,0.55)'; ctx.fillText('TEST TRAY (evaluate only here)',W-222,26);
  const heldIdx=[];
  LOO_CLUSTERS.forEach(([name,col],ci)=>{
    for(let d=0;d<5;d++){
      const isSent=ci===1;
      const held=_loo.run && isSent && (_loo.mode==='cluster' || d===2);
      const baseX=40+ci*150+d*24, baseY=150+(d%2)*36;
      const tx=W-212+((_loo.mode==='cluster'?d:0))*38+((_loo.mode==='single')?80:0), ty=40;
      const x=held?baseX+(tx-baseX)*f:baseX, y=held?baseY+(ty-baseY)*f:baseY;
      if(held) heldIdx.push([x,y]);
      ctx.fillStyle=col; ctx.globalAlpha=held?0.95:0.7;
      ctx.beginPath(); ctx.arc(x,y,9,0,2*Math.PI); ctx.fill(); ctx.globalAlpha=1;
      if(_loo.run && _loo.mode==='single' && isSent && d!==2 && f>0.6){
        // leak lines from siblings to held dot
        ctx.strokeStyle='rgba(255,95,142,0.5)'; ctx.setLineDash([3,3]); ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(x,y-9); ctx.lineTo(W-212+80,ty+9); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    ctx.fillStyle=col; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText(name,40+ci*150,132);
  });
  if(_loo.run && _loo.mode==='single' && f>0.6){
    ctx.fillStyle='rgba(255,95,142,0.8)'; ctx.font='8px monospace'; ctx.textAlign='left';
    ctx.fillText('\u26a0 siblings still teaching the task',W-232,H-14);
  }
}

// ── 9.2 VIZ: YOU BE THE JUDGE ──────────────────────────────
const JUDGE_EX=[
  { p:'Does garlic help with colds?',
    a:'Some small studies suggest garlic may modestly reduce cold frequency, but the evidence is weak and inconsistent. It will not cure a cold; rest and fluids matter more.',
    b:'Yes! Garlic is a powerful natural antibiotic that kills cold viruses and will cure your cold in a day or two.',
    chosen:'a', why:'The chosen answer is helpful AND honestly hedged; the rejected one overclaims a cure, which is exactly the harmful confidence preference data is collected to discourage.'},
  { p:'How do I get better at chess quickly?',
    a:'Buy the most expensive engine subscription. Talent is mostly innate anyway, so if you are not improving fast, chess may not be for you.',
    b:'Solve simple tactics daily, play slower games so you have time to think, and review your losses to find one recurring mistake at a time. Improvement is steady, not instant.',
    chosen:'b', why:'The chosen answer gives actionable, encouraging, realistic advice; the rejected one is discouraging and unhelpful despite being fluent.'}
];
let _judge={ i:0, picked:null };
function judgeBuild(){ _judge={i:0,picked:null}; judgeRender(); }
function judgeNext(){ _judge.i=(_judge.i+1)%JUDGE_EX.length; _judge.picked=null; judgeRender(); }
function judgePick(k){ if(_judge.picked) return; _judge.picked=k; judgeRender(); }
function judgeRender(){
  const h=document.getElementById('judge-host'); if(!h) return;
  const ex=JUDGE_EX[_judge.i], done=!!_judge.picked;
  function card(k,txt){
    let border='var(--border2)', bg='var(--surface2)', badge='';
    if(done){
      const off=ex.chosen===k;
      border=off?'rgba(61,220,132,0.6)':'rgba(255,95,142,0.5)';
      bg=off?'rgba(61,220,132,0.07)':'rgba(255,95,142,0.05)';
      badge='<div style="font-family:var(--mono);font-size:.6rem;margin-top:.5rem;color:'+(off?'var(--accent4)':'var(--accent3)')+'">'+(off?'\u2713 CHOSEN (official)':'\u2717 REJECTED (official)')+(_judge.picked===k?' \u00b7 your pick':'')+'</div>';
    }
    return '<div onclick="judgePick(\''+k+'\')" style="flex:1;min-width:250px;background:'+bg+';border:1px solid '+border+';border-radius:10px;padding:.9rem;cursor:'+(done?'default':'pointer')+'">'
      +'<div style="font-family:var(--mono);font-size:.72rem;line-height:1.7;color:var(--text)">'+txt+'</div>'+badge+'</div>';
  }
  h.innerHTML='<div style="font-family:var(--mono);font-size:.74rem;color:var(--text);margin-bottom:.9rem"><span style="color:var(--muted)">prompt:</span> '+ex.p+'</div>'
    +'<div style="display:flex;gap:12px;flex-wrap:wrap">'+card('a',ex.a)+card('b',ex.b)+'</div>'
    +(done?'<div style="font-family:var(--mono);font-size:.66rem;color:var(--muted);margin-top:.9rem;line-height:1.7">'+ex.why+'</div>'
          :'<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:.9rem">Click the answer you prefer. Note that judging does not require the expertise needed to write the answer.</div>');
}

// ── 9.2 VIZ: RANKING \u2192 PAIRS ───────────────────────────────
const RANK_OUT=[['A','Clear, correct, cites a source'],['B','Correct but rambling'],['C','Partially wrong'],['D','Confidently wrong']];
let _rank={ tab:'rank', order:[1,3,0,2] };
function rankBuild(){ _rank={tab:'rank',order:[1,3,0,2]}; rankTab('rank'); }
function rankTab(t){
  _rank.tab=t;
  document.querySelectorAll('.rank-tab').forEach(b=>{ const on=b.dataset.t===t; b.style.background=on?'var(--accent)':'var(--surface2)'; b.style.color=on?'var(--bg)':'var(--muted)'; b.style.borderColor=on?'var(--accent)':'var(--border2)'; });
  rankRender();
}
function rankMove(pos,dir){
  const o=_rank.order, np=pos+dir;
  if(np<0||np>=o.length) return;
  const t=o[pos]; o[pos]=o[np]; o[np]=t;
  rankRender();
}
function rankRender(){
  const h=document.getElementById('rank-host'), ph=document.getElementById('rank-pairs');
  if(!h||!ph) return;
  let pairs=[];
  if(_rank.tab==='rank'){
    h.innerHTML=_rank.order.map((oi,pos)=>{
      const [nm,desc]=RANK_OUT[oi];
      return '<div style="display:flex;align-items:center;gap:10px;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.5rem .8rem;margin-bottom:.4rem">'
        +'<span style="font-family:var(--mono);font-size:.66rem;color:var(--muted);width:44px">rank '+(pos+1)+'</span>'
        +'<span style="font-family:var(--mono);font-size:.76rem;color:var(--accent);font-weight:700;width:16px">'+nm+'</span>'
        +'<span style="font-family:var(--mono);font-size:.68rem;color:var(--text);flex:1">'+desc+'</span>'
        +'<button onclick="rankMove('+pos+',-1)" style="background:var(--surface3);color:var(--text);border:none;border-radius:5px;padding:.2rem .5rem;font-family:var(--mono);cursor:pointer">\u25b2</button>'
        +'<button onclick="rankMove('+pos+',1)" style="background:var(--surface3);color:var(--text);border:none;border-radius:5px;padding:.2rem .5rem;font-family:var(--mono);cursor:pointer">\u25bc</button></div>';
    }).join('');
    for(let i=0;i<4;i++) for(let j=i+1;j<4;j++) pairs.push([RANK_OUT[_rank.order[i]][0],RANK_OUT[_rank.order[j]][0]]);
    ph.previousElementSibling.textContent='implied preference pairs \u00b7 C(4,2) = 6, distilled from your ranking';
  } else if(_rank.tab==='web'){
    const posts=[['Accepted answer with worked example','412 \u25b2'],['Terse but correct answer','87 \u25b2'],['Wrong approach, downvoted','\u22125 \u25bc']];
    h.innerHTML='<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:.5rem">a StackExchange thread \u00b7 votes impose the ordering, no annotator paid</div>'
      +posts.map(([t,v])=>'<div style="display:flex;justify-content:space-between;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.5rem .8rem;margin-bottom:.4rem;font-family:var(--mono);font-size:.7rem"><span style="color:var(--text)">'+t+'</span><span style="color:var(--accent)">'+v+'</span></div>').join('');
    pairs=[['412\u25b2','87\u25b2'],['412\u25b2','\u22125\u25bc'],['87\u25b2','\u22125\u25bc']];
    ph.previousElementSibling.textContent='implied preference pairs \u00b7 harvested for free from vote counts';
  } else {
    h.innerHTML='<div style="font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-bottom:.5rem">an LLM judge scores two sampled outputs (UltraFeedback-style)</div>'
      +'<div style="display:flex;gap:12px;flex-wrap:wrap">'
      +'<div style="flex:1;min-width:220px;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.6rem .8rem;font-family:var(--mono);font-size:.7rem"><span style="color:var(--text)">output 1</span><br><span style="color:var(--muted)">helpfulness 8.5 \u00b7 honesty 9.0</span></div>'
      +'<div style="flex:1;min-width:220px;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:.6rem .8rem;font-family:var(--mono);font-size:.7rem"><span style="color:var(--text)">output 2</span><br><span style="color:var(--muted)">helpfulness 6.2 \u00b7 honesty 5.5</span></div></div>';
    pairs=[['output 1','output 2']];
    ph.previousElementSibling.textContent='implied preference pair \u00b7 fully synthetic, cheap, but inherits the judge\u2019s biases';
  }
  ph.innerHTML=pairs.map(([w,l])=>'<span style="font-family:var(--mono);font-size:.68rem;background:var(--surface2);border:1px solid var(--border2);border-radius:6px;padding:.3rem .6rem"><span style="color:var(--accent4)">'+w+'</span> <span style="color:var(--muted)">\u227b</span> <span style="color:var(--accent3)">'+l+'</span></span>').join('');
}

// ── 9.2.2 VIZ: PREFERENCE SIGMOID ──────────────────────────
let _btm={ zi:0.5, zj:-0.5 };
function btBuild(){ btDraw(); }
function btSet(k,v){ _btm[k]=parseFloat(v); const e=document.getElementById('bt-'+k+'v'); if(e) e.textContent=_btm[k].toFixed(1); btDraw(); }
function btDraw(){
  const cv=document.getElementById('bt-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const d=_btm.zi-_btm.zj, P=1/(1+Math.exp(-d));
  const x0=60, x1=W-30, yTop=24, yBot=H-46;
  const X=dd=>x0+(dd+6)/12*(x1-x0);
  const Y=p=>yBot-(p)*(yBot-yTop);
  // axes
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x0,yTop); ctx.lineTo(x0,yBot); ctx.lineTo(x1,yBot); ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(x0,Y(0.5)); ctx.lineTo(x1,Y(0.5)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X(0),yTop); ctx.lineTo(X(0),yBot); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='9px monospace'; ctx.textAlign='right';
  ctx.fillText('1.0',x0-6,Y(1)+3); ctx.fillText('0.5',x0-6,Y(0.5)+3); ctx.fillText('0.0',x0-6,Y(0)+3);
  ctx.textAlign='center';
  ctx.fillText('\u03b4 = z\u1d62 \u2212 z\u2c7c  (the logit)',(x0+x1)/2,H-10);
  ctx.fillText('0',X(0),yBot+14);
  // curve — the logistic-regression sigmoid
  ctx.strokeStyle='#A18FFF'; ctx.lineWidth=2.5; ctx.beginPath();
  for(let dd=-6;dd<=6;dd+=0.1){ const x=X(dd), y=Y(1/(1+Math.exp(-dd))); if(dd===-6) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
  ctx.stroke();
  // dot
  ctx.shadowBlur=12; ctx.shadowColor='rgba(77,227,255,0.7)';
  ctx.fillStyle='#4DE3FF'; ctx.beginPath(); ctx.arc(X(d),Y(P),7,0,2*Math.PI); ctx.fill(); ctx.shadowBlur=0;
  ctx.strokeStyle='rgba(77,227,255,0.4)'; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(X(d),Y(P)); ctx.lineTo(X(d),yBot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0,Y(P)); ctx.lineTo(X(d),Y(P)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#4DE3FF'; ctx.font='bold 11px monospace'; ctx.textAlign='left';
  ctx.fillText('P(A \u227b B) = '+P.toFixed(3),X(d)+12,Y(P)-8);
  const cap=document.getElementById('bt-caption');
  if(cap){
    if(Math.abs(d)<0.15) cap.innerHTML='\u03b4 \u2248 0: equal hidden scores. Win probability 0.5, a coin flip \u2014 &ldquo;no real preference&rdquo; has an exact mathematical meaning.';
    else if(Math.abs(d)>3.5) cap.innerHTML='A big score gap: the sigmoid has saturated and the preference is near-certain. Same saturation behavior you saw with logistic regression.';
    else cap.innerHTML='\u03b4 = '+d.toFixed(2)+' is the log-odds of A beating B. This is literally logistic regression on a score difference \u2014 the logistic regression machinery, unchanged.';
  }
}

// ── 9.2.3 VIZ: REWARD MODEL TRAINER ────────────────────────
let _rm={ rw:-0.4, rl:0.6, steps:0, tested:false };
function rmReset(){ _rm={rw:-0.4,rl:0.6,steps:0,tested:false}; rmDraw();
  const c=document.getElementById('rm-caption'); if(c) c.innerHTML='Untrained: the model currently scores the REJECTED answer higher. The loss \u2212log \u03c3(r\u1d65 \u2212 r\u2097) is large. Step gradient descent.'; }
function rmStep(){
  const g=1/(1+Math.exp(_rm.rw-_rm.rl)); // sigmoid(-(rw-rl)) = gradient magnitude
  _rm.rw+=0.38*g; _rm.rl-=0.38*g; _rm.steps++; _rm.tested=false; rmDraw();
  const loss=-Math.log(1/(1+Math.exp(-(_rm.rw-_rm.rl))));
  const c=document.getElementById('rm-caption');
  if(c) c.innerHTML='Step '+_rm.steps+': the gradient pushes r\u1d65 up and r\u2097 down, hardest when the model is most wrong (the \u03c3 factor). Loss now '+loss.toFixed(3)+'.'+(loss<0.35?' The ordering is learned \u2014 try testing on fresh answers.':'');
}
function rmTest(){ _rm.tested=true; rmDraw();
  const c=document.getElementById('rm-caption');
  const ready=(_rm.rw-_rm.rl)>0.8;
  if(c) c.innerHTML=ready
    ? '<span style="color:var(--accent4)">Fresh, never-seen answers scored:</span> the careful hedged one gets +1.3, the confident overclaim gets \u22120.9. The supervision was only comparisons, yet the learned scores extrapolate sensibly to new responses.'
    : 'The fresh answers get muddled scores \u2014 the model has not learned the ordering yet. Train a few more steps first.';
}
function rmDraw(){
  const cv=document.getElementById('rm-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  // head swap schematic
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('the reward model = an LLM with its head swapped:',20,20);
  ctx.fillStyle='rgba(255,95,142,0.7)'; ctx.font='9px monospace';
  ctx.fillText('LM head [1\u00d7|V|]',330,20);
  ctx.strokeStyle='rgba(255,95,142,0.7)'; ctx.beginPath(); ctx.moveTo(326,16); ctx.lineTo(432,16); ctx.stroke();
  ctx.fillStyle='#4DE3FF'; ctx.fillText('\u2192 scalar head [1\u00d71]',440,20);
  // answers
  const rows=[['CHOSEN \u00b7 hedged, honest answer','#3DDC84',_rm.rw,'r\u1d65'],['REJECTED \u00b7 confident overclaim','#FF5F8E',_rm.rl,'r\u2097']];
  rows.forEach(([lab,col,r,sym],i)=>{
    const y=52+i*64;
    ctx.fillStyle='rgba(255,255,255,0.05)'; roundRect(ctx,20,y,300,48,8); ctx.fill();
    ctx.strokeStyle=col; ctx.globalAlpha=0.5; roundRect(ctx,20,y,300,48,8); ctx.stroke(); ctx.globalAlpha=1;
    ctx.fillStyle=col; ctx.font='9px monospace'; ctx.fillText(lab,32,y+18);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='8px monospace'; ctx.fillText('\u2192 same LLM body \u2192 scalar',32,y+36);
    // reward dial
    const dx=360, dw=200, mid=dx+dw/2;
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.moveTo(dx,y+24); ctx.lineTo(dx+dw,y+24); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo(mid,y+16); ctx.lineTo(mid,y+32); ctx.stroke();
    const px=mid+Math.max(-1,Math.min(1,r/2))*dw/2;
    ctx.shadowBlur=8; ctx.shadowColor=col;
    ctx.fillStyle=col; ctx.beginPath(); ctx.arc(px,y+24,7,0,2*Math.PI); ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.font='10px monospace'; ctx.textAlign='left';
    ctx.fillText(sym+' = '+r.toFixed(2),dx+dw+14,y+28);
  });
  // loss meter
  const loss=-Math.log(1/(1+Math.exp(-(_rm.rw-_rm.rl))));
  const ly=190;
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('L = \u2212log \u03c3(r\u1d65 \u2212 r\u2097) =',20,ly+12);
  ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(190,ly+2,240,12);
  ctx.fillStyle=loss>0.6?'#FF5F8E':'#3DDC84'; ctx.fillRect(190,ly+2,Math.min(240,240*loss/2),12);
  ctx.font='bold 11px monospace'; ctx.fillText(loss.toFixed(3),440,ly+12);
  if(_rm.tested && (_rm.rw-_rm.rl)>0.8){
    ctx.fillStyle='rgba(61,220,132,0.85)'; ctx.font='9px monospace';
    ctx.fillText('fresh pair \u2192 hedged: +1.3   overclaim: \u22120.9   (generalized!)',20,ly+40);
  }
}

// ── 9.3 VIZ: KL LEASH ──────────────────────────────────────
let _kl={ beta:0.6 };
function klBuild(){ klSet(0.6); }
function _klReward(x){ return 2.2*Math.exp(-Math.pow(x-6,2)/2.2)+3.4*Math.exp(-Math.pow(x-9.4,2)/0.18); }
function klSet(v){
  _kl.beta=parseFloat(v);
  const e=document.getElementById('kl-bv'); if(e) e.textContent=_kl.beta.toFixed(2);
  klDraw();
}
function klDraw(){
  const cv=document.getElementById('kl-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, b=_kl.beta;
  ctx.clearRect(0,0,W,H);
  // find argmax of r(x) - b*(x-2)^2 over grid
  let best=2, bestV=-1e9;
  for(let x=2;x<=10;x+=0.02){ const v=_klReward(x)-b*0.55*Math.pow(x-2,2); if(v>bestV){ bestV=v; best=x; } }
  const x0=40, x1=W-30, X=x=>x0+(x-1)/9.5*(x1-x0);
  const axisY=H-70;
  // reward landscape
  ctx.strokeStyle='rgba(160,140,255,0.55)'; ctx.lineWidth=2; ctx.beginPath();
  for(let x=1;x<=10.5;x+=0.05){ const y=axisY-_klReward(x)*34; if(x===1) ctx.moveTo(X(x),y); else ctx.lineTo(X(x),y); }
  ctx.stroke();
  ctx.fillStyle='rgba(160,140,255,0.6)'; ctx.font='8px monospace'; ctx.textAlign='center';
  ctx.fillText('reward landscape r(y)',X(4),40);
  // zones
  ctx.fillStyle='rgba(61,220,132,0.5)'; ctx.fillText('helpful responses',X(6),axisY+16);
  ctx.fillStyle='rgba(255,95,142,0.65)'; ctx.fillText('reward-model error (exploitable)',X(9.1),axisY+16);
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fillText('\u03c0ref',X(2),axisY+16);
  // axis
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(x0,axisY); ctx.lineTo(x1,axisY); ctx.stroke();
  // anchor
  ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.arc(X(2),axisY,6,0,2*Math.PI); ctx.fill();
  // leash: zigzag spring, thickness ~ beta
  const py=axisY, px=X(best);
  ctx.strokeStyle='rgba(253,224,71,'+(0.3+Math.min(0.6,b/3))+')'; ctx.lineWidth=1+b*2;
  ctx.beginPath(); ctx.moveTo(X(2),py-2);
  const segs=10;
  for(let s=1;s<=segs;s++){ const t=s/segs; ctx.lineTo(X(2)+(px-X(2))*t, py-2-((s%2)?5:-5)*(1-t*0.4)); }
  ctx.stroke();
  // policy dot
  const col=best>8.4?'#FF5F8E':(best>4.4?'#3DDC84':'#ECF1FF');
  ctx.shadowBlur=14; ctx.shadowColor=col;
  ctx.fillStyle=col; ctx.beginPath(); ctx.arc(px,py,9,0,2*Math.PI); ctx.fill(); ctx.shadowBlur=0;
  ctx.fillStyle=col; ctx.font='bold 9px monospace'; ctx.fillText('\u03c0\u03b8',px,py-16);
  // meters
  const rew=_klReward(best), kl=0.55*Math.pow(best-2,2);
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('reward r = '+rew.toFixed(2),x0,H-34);
  ctx.fillText('KL from \u03c0ref \u2248 '+kl.toFixed(2),x0+160,H-34);
  ctx.fillText('objective r \u2212 \u03b2\u00b7KL = '+(rew-b*kl).toFixed(2),x0+330,H-34);
  const samp=document.getElementById('kl-sample');
  const cap=document.getElementById('kl-caption');
  if(best>8.4){
    if(samp) samp.innerHTML='<span style="color:#8E9AC4">sample:</span> &ldquo;amazing amazing amazing best answer 10/10 best best!!! helpful helpful!!!&rdquo;';
    if(cap) cap.innerHTML='<span style="color:var(--accent3)">\u03b2 too small.</span> The KL penalty is negligible, so the optimum of R sits inside the reward model\u2019s error region: degenerate text with a high proxy score and low actual quality. This is reward hacking, and the distance from \u03c0ref also means the model\u2019s language ability has been damaged.';
  } else if(best>4.4){
    if(samp) samp.innerHTML='<span style="color:#8E9AC4">sample:</span> &ldquo;Garlic may modestly help some people, but the evidence is weak; rest and fluids matter more. Happy to explain the studies.&rdquo;';
    if(cap) cap.innerHTML='<span style="color:var(--accent4)">Intermediate \u03b2.</span> The narrow error region is now too expensive in KL terms, but the broad region of helpful responses is reachable. The policy improves on the reward while staying close enough to \u03c0ref to remain fluent. This is the intended operating range.';
  } else {
    if(samp) samp.innerHTML='<span style="color:#8E9AC4">sample:</span> &ldquo;Garlic is a plant in the genus Allium. Garlic has been cultivated for\u2026&rdquo; (the reference model, unchanged)';
    if(cap) cap.innerHTML='<span style="color:#fde047">\u03b2 too large.</span> The KL penalty dominates the objective, so the optimum stays at the reference model. The policy remains fluent but is no more aligned than before training.';
  }
}

// ── 9.3.2 VIZ: PPO VS DPO ──────────────────────────────────
let _dpo={ stage:0 };
function dpoBuild(){ _dpo.stage=0; dpoDraw();
  ['pt-dpo-r','pt-dpo-diff','pt-dpo-loss'].forEach((id,i)=>{ const e=document.getElementById(id); if(e) e.style.display=i===0?'block':'none'; });
  const c=document.getElementById('dpo-caption'); if(c) c.innerHTML='Step 1 \u2014 the reward written in terms of the policy: \u03b2 times the policy-to-reference log-ratio, plus the intractable term \u03b2 log Z(x) (shown in pink in the equation above). The PPO pipeline still needs all four models at this point.';
  const ct=document.getElementById('dpo-count'); if(ct) ct.innerHTML='models on screen: <span style="color:var(--accent3)">4</span> \u00b7 online sampling: <span style="color:var(--accent3)">yes</span>';
}
function dpoStep(){
  _dpo.stage=Math.min(2,_dpo.stage+1); dpoDraw();
  ['pt-dpo-r','pt-dpo-diff','pt-dpo-loss'].forEach((id,i)=>{ const e=document.getElementById(id); if(e) e.style.display=i===_dpo.stage?'block':'none'; });
  const c=document.getElementById('dpo-caption'), ct=document.getElementById('dpo-count');
  if(_dpo.stage===1){
    if(c) c.innerHTML='Step 2 \u2014 substitute both rewards into the Bradley-Terry difference. Z(x) depends only on the prompt, so the two pink terms are identical and cancel. The reward model and value model are no longer needed, because the policy itself provides the reward difference.';
    if(ct) ct.innerHTML='models on screen: <span style="color:#fde047">4 \u2192 collapsing\u2026</span>';
  } else if(_dpo.stage===2){
    if(c) c.innerHTML='Step 3 \u2014 the remaining loss is a binary cross-entropy on preference pairs: raise the chosen response\u2019s log-ratio, lower the rejected one\u2019s. Training is supervised, offline, and involves two networks: the trainable policy and the frozen reference. \u03b2 keeps the same role it had in Section 9.3.';
    if(ct) ct.innerHTML='models on screen: <span style="color:var(--accent4)">2</span> \u00b7 online sampling: <span style="color:var(--accent4)">none</span>';
  }
}
function dpoDraw(){
  const cv=document.getElementById('dpo-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, st=_dpo.stage;
  ctx.clearRect(0,0,W,H);
  function box(x,y,w,h,col,lab,dead){
    ctx.globalAlpha=dead?0.22:1;
    ctx.fillStyle='rgba(255,255,255,0.06)'; roundRect(ctx,x,y,w,h,8); ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=1.4; roundRect(ctx,x,y,w,h,8); ctx.stroke();
    ctx.fillStyle=dead?'rgba(255,255,255,0.45)':col; ctx.font='bold 9px monospace'; ctx.textAlign='center';
    ctx.fillText(lab,x+w/2,y+h/2+3);
    if(dead){ ctx.strokeStyle='rgba(255,95,142,0.8)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(x+6,y+6); ctx.lineTo(x+w-6,y+h-6); ctx.moveTo(x+w-6,y+6); ctx.lineTo(x+6,y+h-6); ctx.stroke(); }
    ctx.globalAlpha=1;
  }
  // PPO lane
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('PPO / RLHF PIPELINE',20,22);
  box(20,34,120,38,'#4DE3FF','policy \u03c0\u03b8',false);
  box(160,34,120,38,'#ECF1FF','reference \u03c0ref',false);
  box(300,34,120,38,'#FF5F8E','reward model', st>=2);
  box(440,34,120,38,'#ff8c42','value model', st>=2);
  // loop arrows
  ctx.strokeStyle=st>=2?'rgba(255,255,255,0.12)':'rgba(255,95,142,0.5)'; ctx.setLineDash([4,3]); ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(80,80); ctx.quadraticCurveTo(300,116,520,80); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle=st>=2?'rgba(255,255,255,0.25)':'rgba(255,95,142,0.7)'; ctx.font='8px monospace'; ctx.textAlign='center';
  ctx.fillText(st>=2?'sampling loop: removed':'sample \u2192 score \u2192 RL update \u2192 sample \u2192 \u2026',300,112);
  // DPO lane
  ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText('DPO PIPELINE',20,152);
  box(20,164,120,38,'#4DE3FF','policy \u03c0\u03b8',false);
  box(160,164,120,38,'#ECF1FF','reference \u03c0ref (frozen)',false);
  ctx.fillStyle=st>=2?'#3DDC84':'rgba(255,255,255,0.3)'; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText(st>=2?'+ a dataset of (y\u1d65 \u227b y\u2097) pairs \u2014 that is all':'(waiting for the algebra above to collapse\u2026)',300,187);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace';
  ctx.fillText('both lanes obey the same \u03b2-leash intuition from 9.3',20,H-14);
}

// ── 9.4 VIZ: CHAIN OF THOUGHT ──────────────────────────────
let _cot={ timer:null };
function cotBuild(){
  const s=document.getElementById('cot-std'), c=document.getElementById('cot-cot');
  if(s) s.innerHTML='<span style="color:#8E9AC4">A: </span>';
  if(c) c.innerHTML='<span style="color:#8E9AC4">A: </span>';
}
function cotRun(){
  if(_cot.timer) clearInterval(_cot.timer);
  cotBuild();
  const std='The answer is 45.';
  const cot='The workshop started with 34 chairs. Staff carried 18 out, so 34 \u2212 18 = 16. Then 7 arrived, so 16 + 7 = 23. The answer is 23.';
  let i=0;
  const se=document.getElementById('cot-std'), ce=document.getElementById('cot-cot');
  _cot.timer=setInterval(()=>{
    i++;
    if(se) se.innerHTML='<span style="color:#8E9AC4">A: </span>'+std.slice(0,Math.min(std.length,Math.floor(i*0.7)))+(i*0.7<std.length?'<span style="color:#4DE3FF">\u258d</span>':' <span style="color:#FF5F8E">\u2717 wrong</span>');
    if(ce) ce.innerHTML='<span style="color:#8E9AC4">A: </span>'+cot.slice(0,i)+(i<cot.length?'<span style="color:#4DE3FF">\u258d</span>':' <span style="color:#3DDC84">\u2713 correct</span>');
    if(i>=cot.length+4){
      clearInterval(_cot.timer); _cot.timer=null;
      const cap=document.getElementById('cot-caption');
      if(cap) cap.innerHTML='Same weights, zero training. The left prompt asked for an answer and got a plausible-sounding guess. The right prompt\u2019s demonstrations showed worked steps, so the model generated its own: &ldquo;34 \u2212 18 = 16&rdquo; became context that made &ldquo;16 + 7 = 23&rdquo; likely, which made &ldquo;23&rdquo; nearly inevitable. Conditional generation doing the reasoning.';
    }
  },28);
}

// ── 9.5 VIZ: POST-TRAINING ASSEMBLY LINE ───────────────────
const PTR_NODES=[
  {lab:'base model',      sub:'predicts, cannot obey', col:'#9a9ab8', sec:null},
  {lab:'instruction tune',sub:'same CE loss',          col:'#3DDC84', sec:'sft'},
  {lab:'preference data', sub:'chosen \u227b rejected', col:'#FF5F8E', sec:'pref'},
  {lab:'reward model',    sub:'\u03c3(z\u1d62\u2212z\u2c7c) \u00b7 Ch.4 again', col:'#A18FFF', sec:'bt'},
  {lab:'PPO or DPO',      sub:'KL-constrained update', col:'#fde047', sec:'align'},
  {lab:'aligned model',   sub:'helpful, honest',       col:'#4DE3FF', sec:null},
  {lab:'+ test-time',     sub:'chain-of-thought',      col:'#ff8c42', sec:'ttc'}
];
let _ptr={ rects:[] };
function ptrecapBuild(){
  const cv=document.getElementById('ptr-canvas'); if(!cv) return;
  cv.onclick=e=>{
    const r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(cv.width/r.width), my=(e.clientY-r.top)*(cv.height/r.height);
    for(const [x,y,w,h,sec] of _ptr.rects){ if(sec && mx>=x&&mx<=x+w&&my>=y&&my<=y+h){ openPTSec(sec); return; } }
  };
  ptrecapDraw();
}
function ptrecapDraw(){
  const cv=document.getElementById('ptr-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  _ptr.rects=[];
  const perRow=4, bw=136, bh=54, gx=(W-perRow*bw-(perRow-1)*20)/2;
  PTR_NODES.forEach((n,i)=>{
    const row=Math.floor(i/perRow), colI=i%perRow;
    const x=gx+colI*(bw+20), y=34+row*96;
    _ptr.rects.push([x,y,bw,bh,n.sec]);
    ctx.fillStyle='rgba(255,255,255,0.05)'; roundRect(ctx,x,y,bw,bh,9); ctx.fill();
    ctx.strokeStyle=n.col; ctx.lineWidth=1.4; roundRect(ctx,x,y,bw,bh,9); ctx.stroke();
    ctx.fillStyle=n.col; ctx.font='bold 10px monospace'; ctx.textAlign='center';
    ctx.fillText(n.lab,x+bw/2,y+22);
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='8px monospace';
    ctx.fillText(n.sub,x+bw/2,y+38);
    if(n.sec){ ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='7px monospace'; ctx.fillText('click \u2192 \u00a7',x+bw/2,y+50); }
    // arrows
    if(i<PTR_NODES.length-1){
      ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=1.4;
      if(colI<perRow-1 && i+1<PTR_NODES.length && Math.floor((i+1)/perRow)===row){
        ctx.beginPath(); ctx.moveTo(x+bw,y+bh/2); ctx.lineTo(x+bw+20,y+bh/2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+bw+14,y+bh/2-4); ctx.lineTo(x+bw+20,y+bh/2); ctx.lineTo(x+bw+14,y+bh/2+4); ctx.stroke();
      } else if(colI===perRow-1){
        ctx.beginPath(); ctx.moveTo(x+bw/2,y+bh); ctx.lineTo(x+bw/2,y+bh+18);
        ctx.lineTo(gx+bw/2,y+bh+18); ctx.lineTo(gx+bw/2,y+96-2); ctx.stroke();
      }
    }
  });
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px monospace'; ctx.textAlign='center';
  ctx.fillText('this line is the right half of the\u2019s three-stage training diagram: pretrain \u2192 instruction-tune \u2192 align',W/2,H-12);
  const cap=document.getElementById('ptr-caption');
  if(cap) cap.innerHTML='Base \u2192 SFT \u2192 preferences \u2192 reward \u2192 KL-anchored alignment \u2192 aligned model, with test-time compute as the optional final lever. Click any labeled stage to revisit it.';
}
