/* ══════════════════════════════════════════════════════════
   CHAPTER 16 · TEXT-TO-SPEECH
   ══════════════════════════════════════════════════════════ */
// ═══════════════════════════════════════════════════════════════════
// BEGIN CH17 BLOCK B — TOY CODEC + AUDIO
// A scaled-down but genuinely functioning codec: real encoder, real
// k-means codebooks, real residual vector quantization, real decoder.
// Dimensions are small (D=16, K=64, Nc=8) so it trains in the browser
// in a few milliseconds. Every number the reader sees is computed.
// ═══════════════════════════════════════════════════════════════════

var TTS_SR = 8000;      // toy sample rate
var TTS_N  = 16;        // analysis frame, samples -> 500 frames/sec
var TTS_D  = 16;        // kept transform coefficients per frame
var TTS_K  = 64;        // codewords per codebook
var TTS_NC = 8;         // residual stages

function ttsClamp(v,a,b){ return v<a?a:(v>b?b:v); }

/* ---- source-filter synthesis: impulse train through 3 resonators ---- */
function ttsSynth(f0,F,BW,dur,sr){
  sr = sr||TTS_SR;
  var n = Math.round(dur*sr), out = new Float32Array(n), i, k;
  var period = sr/f0, next = 0;
  for(i=0;i<n;i++){ if(i>=next){ out[i]=1; next+=period; } }
  for(k=0;k<F.length;k++){
    var r  = Math.exp(-Math.PI*BW[k]/sr);
    var th = 2*Math.PI*F[k]/sr;
    var a1 = 2*r*Math.cos(th), a2 = -r*r, g = (1-a1-a2);
    var y1=0,y2=0;
    for(i=0;i<n;i++){
      var y = g*out[i] + a1*y1 + a2*y2;
      y2=y1; y1=y; out[i]=y;
    }
  }
  // fade edges so concatenation does not click
  var f=Math.min(120,Math.floor(n/6));
  for(i=0;i<f;i++){ out[i]*=i/f; out[n-1-i]*=i/f; }
  return out;
}
function ttsNorm(a,peak){
  var m=0,i; for(i=0;i<a.length;i++) m=Math.max(m,Math.abs(a[i]));
  if(m>0){ var s=(peak||0.9)/m; for(i=0;i<a.length;i++) a[i]*=s; }
  return a;
}
function ttsCat(list){
  var n=0,i,j,k=0; for(i=0;i<list.length;i++) n+=list[i].length;
  var out=new Float32Array(n);
  for(i=0;i<list.length;i++) for(j=0;j<list[i].length;j++) out[k++]=list[i][j];
  return out;
}

/* five vowel targets (F1,F2,F3 in Hz) */
var TTS_VOW = {
  iy:[300,2300,3000], eh:[550,1800,2600], aa:[730,1100,2450],
  ao:[570, 850,2400], uw:[300, 900,2200]
};
var TTS_BWD = [70,110,170];

/* the demo utterance: five vowel-like segments with a falling pitch */
function ttsDemoSignal(){
  var names=['iy','eh','aa','ao','uw'], segs=[], i;
  for(i=0;i<names.length;i++){
    segs.push(ttsSynth(140-i*9, TTS_VOW[names[i]], TTS_BWD, 0.26));
  }
  return ttsNorm(ttsCat(segs));
}
/* a wider training corpus: pitch and formants jittered */
function ttsCorpusSignal(){
  var names=Object.keys(TTS_VOW), segs=[], i, j;
  for(j=0;j<4;j++){
    for(i=0;i<names.length;i++){
      var base=TTS_VOW[names[i]];
      var F=[base[0]*(0.85+0.3*((j*7+i*3)%5)/4),
             base[1]*(0.88+0.24*((j*5+i*2)%4)/3),
             base[2]*(0.94+0.12*((j+i)%3)/2)];
      segs.push(ttsSynth(100+22*j+7*i, F, TTS_BWD, 0.16));
    }
  }
  return ttsNorm(ttsCat(segs));
}

/* ---- orthonormal DCT-II basis, built once ---- */
var TTS_BASIS = null;
function ttsBasis(){
  if(TTS_BASIS) return TTS_BASIS;
  var N=TTS_N, B=[], k,n;
  for(k=0;k<N;k++){
    var row=new Float32Array(N), s=(k===0)?Math.sqrt(1/N):Math.sqrt(2/N);
    for(n=0;n<N;n++) row[n]=s*Math.cos(Math.PI*(n+0.5)*k/N);
    B.push(row);
  }
  return (TTS_BASIS=B);
}
/* encoder: frame -> D coefficients.  decoder: D coefficients -> frame. */
function ttsEncodeFrames(sig){
  var B=ttsBasis(), N=TTS_N, D=TTS_D, nf=Math.floor(sig.length/N), out=[], f,k,n;
  for(f=0;f<nf;f++){
    var v=new Float32Array(D);
    for(k=0;k<D;k++){ var s=0, row=B[k], off=f*N;
      for(n=0;n<N;n++) s+=sig[off+n]*row[n];
      v[k]=s; }
    out.push(v);
  }
  return out;
}
function ttsDecodeFrames(vecs){
  var B=ttsBasis(), N=TTS_N, D=TTS_D, out=new Float32Array(vecs.length*N), f,k,n;
  for(f=0;f<vecs.length;f++){
    var off=f*N;
    for(k=0;k<D;k++){ var c=vecs[f][k]; if(c===0) continue; var row=B[k];
      for(n=0;n<N;n++) out[off+n]+=c*row[n]; }
  }
  return out;
}

/* ---- k-means (assignment / re-estimation), the Ch.16 algorithm ---- */
function ttsKMeans(vecs,K,iters){
  var D=vecs[0].length, N=vecs.length, cent=[], i,j,k,it;
  for(k=0;k<K;k++){                       // deterministic spread-out seed
    var src=vecs[Math.floor(k*N/K)%N], c=new Float32Array(D);
    for(j=0;j<D;j++) c[j]=src[j];
    cent.push(c);
  }
  var asg=new Int32Array(N);
  for(it=0;it<12;it++){
    for(i=0;i<N;i++){                     // assignment
      var best=0,bd=Infinity;
      for(k=0;k<K;k++){
        var d=0,ck=cent[k],vi=vecs[i];
        for(j=0;j<D;j++){ var t=vi[j]-ck[j]; d+=t*t; if(d>bd) break; }
        if(d<bd){ bd=d; best=k; }
      }
      asg[i]=best;
    }
    var sum=[],cnt=new Int32Array(K);     // re-estimation
    for(k=0;k<K;k++) sum.push(new Float64Array(D));
    for(i=0;i<N;i++){ var a=asg[i]; cnt[a]++; for(j=0;j<D;j++) sum[a][j]+=vecs[i][j]; }
    for(k=0;k<K;k++){
      if(cnt[k]===0) continue;
      for(j=0;j<D;j++) cent[k][j]=sum[k][j]/cnt[k];
    }
  }
  return cent;
}
function ttsDistortion(vecs,cent){
  var s=0,i,j,k;
  for(i=0;i<vecs.length;i++){
    var bd=Infinity;
    for(k=0;k<cent.length;k++){ var d=0; for(j=0;j<vecs[i].length;j++){ var t=vecs[i][j]-cent[k][j]; d+=t*t; } if(d<bd) bd=d; }
    s+=bd;
  }
  return s/vecs.length;
}

/* ---- residual vector quantization ---- */
var TTS_MODEL = null;
function ttsTrainRVQ(){
  if(TTS_MODEL) return TTS_MODEL;
  var corpus = ttsEncodeFrames(ttsCorpusSignal());
  var books=[], res=corpus.map(function(v){ return Float32Array.from(v); }), i,j,s;
  var stageErr=[];
  for(s=0;s<TTS_NC;s++){
    var cb=ttsKMeans(res,TTS_K,12);
    books.push(cb);
    var acc=0;
    for(i=0;i<res.length;i++){
      var q=ttsNearest(res[i],cb), c=cb[q], n2=0;
      for(j=0;j<res[i].length;j++){ res[i][j]-=c[j]; n2+=res[i][j]*res[i][j]; }
      acc+=n2;
    }
    stageErr.push(acc/res.length);
  }
  var e0=0;
  for(i=0;i<corpus.length;i++) for(j=0;j<TTS_D;j++) e0+=corpus[i][j]*corpus[i][j];
  TTS_MODEL={books:books, stageErr:stageErr, energy:e0/corpus.length};
  return TTS_MODEL;
}
function ttsNearest(v,cb){
  var best=0,bd=Infinity,k,j;
  for(k=0;k<cb.length;k++){
    var d=0,c=cb[k];
    for(j=0;j<v.length;j++){ var t=v[j]-c[j]; d+=t*t; if(d>bd) break; }
    if(d<bd){ bd=d; best=k; }
  }
  return best;
}
/* returns {codes:[Nc], resNorm:[Nc+1]} for a single vector */
function ttsRVQEncodeVec(v){
  var M=ttsTrainRVQ(), r=Float32Array.from(v), codes=[], norms=[ttsL2(r)], s,j;
  for(s=0;s<TTS_NC;s++){
    var q=ttsNearest(r,M.books[s]); codes.push(q);
    var c=M.books[s][q];
    for(j=0;j<r.length;j++) r[j]-=c[j];
    norms.push(ttsL2(r));
  }
  return {codes:codes, norms:norms};
}
function ttsRVQDecodeVec(codes,stages){
  var M=ttsTrainRVQ(), out=new Float32Array(TTS_D), s,j;
  for(s=0;s<Math.min(stages,codes.length);s++){
    var c=M.books[s][codes[s]];
    for(j=0;j<TTS_D;j++) out[j]+=c[j];
  }
  return out;
}
function ttsL2(v){ var s=0,j; for(j=0;j<v.length;j++) s+=v[j]*v[j]; return Math.sqrt(s); }

/* whole-signal round trip at a given number of stages */
var TTS_DEMO=null, TTS_DEMOV=null, TTS_DEMOC=null;
function ttsDemo(){
  if(!TTS_DEMO){
    TTS_DEMO=ttsDemoSignal();
    TTS_DEMOV=ttsEncodeFrames(TTS_DEMO);
    TTS_DEMOC=TTS_DEMOV.map(function(v){ return ttsRVQEncodeVec(v).codes; });
  }
  return TTS_DEMO;
}
function ttsRoundTrip(stages){
  ttsDemo();
  var rec=TTS_DEMOC.map(function(c){ return ttsRVQDecodeVec(c,stages); });
  return ttsDecodeFrames(rec);
}
/* SNR in dB of b against reference a */
function ttsSNR(a,b){
  var n=Math.min(a.length,b.length), se=0, sa=0, i;
  for(i=0;i<n;i++){ var d=a[i]-b[i]; se+=d*d; sa+=a[i]*a[i]; }
  if(se<=0) return Infinity;
  return 10*Math.log10(sa/se);
}

/* ---- playback ---- */
var TTS_AC=null;
function ttsAudioCtx(){
  if(!TTS_AC){
    var C=window.AudioContext||window.webkitAudioContext;
    if(!C) return null;
    TTS_AC=new C();
  }
  if(TTS_AC.state==='suspended') TTS_AC.resume();
  return TTS_AC;
}
function ttsPlay(sig,sr){
  var ac=ttsAudioCtx(); if(!ac) return false;
  sr=sr||TTS_SR;
  var buf=ac.createBuffer(1,sig.length,sr);
  buf.copyToChannel ? buf.copyToChannel(Float32Array.from(sig),0)
                    : buf.getChannelData(0).set(Float32Array.from(sig));
  if(window.mathcoreAudioSource){try{window.mathcoreAudioSource.stop();}catch{}}
  var src=ac.createBufferSource(); src.buffer=buf; window.mathcoreAudioSource=src;
  src.onended=()=>{if(window.mathcoreAudioSource===src)window.mathcoreAudioSource=null;src.disconnect();};
  var g=ac.createGain(); g.gain.value=0.55;
  src.connect(g); g.connect(ac.destination); src.start();
  return true;
}
/* quantize amplitude to b bits, for the rate ladder */
function ttsRequant(sig,bits){
  var L=Math.pow(2,bits), out=new Float32Array(sig.length), i;
  for(i=0;i<sig.length;i++){
    var v=ttsClamp(sig[i],-1,0.999);
    out[i]=(Math.round((v+1)/2*(L-1))/(L-1))*2-1;
  }
  return out;
}
/* decimate then hold, for the rate ladder */
function ttsDecimate(sig,factor){
  var out=new Float32Array(sig.length), i;
  for(i=0;i<sig.length;i++) out[i]=sig[Math.floor(i/factor)*factor];
  return out;
}
// ═══ END CH17 BLOCK B ═══

/* ══════════════════════════════════════════════════════════════════
   CHAPTER 16 · TEXT-TO-SPEECH — VISUALIZATIONS
   Uses the shared mt* helpers (mtCtx, mtTxt, mtRR, mtChip, mtSet) and
   the MTC light canvas palette, matching chapters 12 through 15.
   ══════════════════════════════════════════════════════════════════ */

/* ── 16.1 THE VOICE BUDGET ─────────────────────────────────── */
let _tvb = {voices:6, enroll:3};
function ttsVbBuild(){
  const host = document.getElementById('tvb-ctrl');
  if(host) host.innerHTML =
    '<div style="min-width:190px;flex:1"><div style="' + MTLBL + ';margin-bottom:4px">target voices</div>' +
    '<input id="tvb-v" type="range" min="1" max="600" step="1" value="' + _tvb.voices +
    '" oninput="ttsVbUpd()" style="width:100%;accent-color:var(--accent)">' +
    '<div id="tvb-v-v" style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:2px"></div></div>' +
    '<div style="min-width:190px;flex:1"><div style="' + MTLBL + ';margin-bottom:4px">enrollment audio</div>' +
    '<input id="tvb-e" type="range" min="0.5" max="30" step="0.5" value="' + _tvb.enroll +
    '" oninput="ttsVbUpd()" style="width:100%;accent-color:var(--accent)">' +
    '<div id="tvb-e-v" style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:2px"></div></div>';
  ttsVbUpd();
}
function ttsVbUpd(){
  const a = document.getElementById('tvb-v'), b = document.getElementById('tvb-e');
  if(a) _tvb.voices = Math.max(1, Math.min(600, Math.round(+a.value)));
  if(b) _tvb.enroll = Math.max(0.5, Math.min(30, +b.value));
  mtSet('tvb-v-v', _tvb.voices + (_tvb.voices === 1 ? ' voice' : ' voices'));
  mtSet('tvb-e-v', _tvb.enroll.toFixed(1) + ' s per voice');
  ttsVbDraw();
}
function ttsVbSim(s){ return 0.45 + 0.48*(1 - Math.exp(-s/3.5)); }
function ttsVbDraw(){
  const c = mtCtx('tvb-canvas', 300); if(!c) return;
  const {x, w} = c;
  const V = _tvb.voices, E = _tvb.enroll;
  const H_ST = 200, H_POOL = 60000, PER = E/3600;
  const hCls = V*H_ST, hZero = H_POOL + V*PER;
  const maxH = Math.max(hCls, hZero, 1);

  mtTxt(x, 'TOTAL RECORDED AUDIO REQUIRED', 14, 18, {size:9, col:MTC.muted});
  const bx = 14, bw = w*0.5 - 26, bh = 26;
  function bar(y, lab, val, col, note){
    x.fillStyle = MTC.surf2; mtRR(x, bx, y, bw, bh, 5); x.fill();
    const frac = Math.max(0.005, Math.log10(1+val)/Math.log10(1+maxH));
    x.fillStyle = col; mtRR(x, bx, y, bw*frac, bh, 5); x.fill();
    mtTxt(x, lab, bx+9, y+bh/2, {size:9.5, col:'#FAFBFF'});
    mtTxt(x, val >= 1000 ? (val/1000).toFixed(1)+'k h' : val.toFixed(1)+' h',
          bx+bw-7, y+bh/2, {size:9.5, col:MTC.text, align:'right'});
    mtTxt(x, note, bx, y+bh+12, {size:8.5, col:MTC.muted});
  }
  bar(38, 'one talker per voice', hCls, MTC.a2, 'studio collection repeated from zero each time');
  bar(94, 'pooled model + prompt', hZero, MTC.a1, '60k h once, then ' + E.toFixed(1) + ' s per voice');

  const cross = H_POOL/(H_ST - PER);
  mtTxt(x, 'crossover at ' + cross.toFixed(0) + ' voices', bx, 158, {size:9.5, col:MTC.a5});
  mtTxt(x, V >= cross ? 'pooled model is ahead here' : 'studio approach still cheaper here',
        bx, 174, {size:9, col:MTC.muted});
  mtTxt(x, 'log axis', bx, 190, {size:8.5, col:MTC.muted});

  mtTxt(x, 'only the pooled model can speak in a voice', bx, 216, {size:9, col:MTC.text});
  mtTxt(x, 'that was never recorded for it.', bx, 231, {size:9, col:MTC.text});

  // right: saturation curve
  const px0 = w*0.56, pw = w - px0 - 18, py = 38, ph = 200;
  mtTxt(x, 'SPEAKER SIMILARITY vs ENROLLMENT LENGTH', px0, 18, {size:9, col:MTC.muted});
  x.strokeStyle = MTC.line; x.lineWidth = 1;
  x.strokeRect(px0, py, pw, ph);
  for(let g=1; g<4; g++){
    const gy = py + ph*g/4;
    x.strokeStyle = MTC.line; x.beginPath(); x.moveTo(px0, gy); x.lineTo(px0+pw, gy); x.stroke();
  }
  x.beginPath();
  for(let i=0; i<=120; i++){
    const s = i/120*30, yy = py + ph - (ttsVbSim(s)-0.4)/0.6*ph;
    i ? x.lineTo(px0 + i/120*pw, yy) : x.moveTo(px0 + i/120*pw, yy);
  }
  x.strokeStyle = MTC.a1; x.lineWidth = 2; x.stroke();
  const mx = px0 + E/30*pw, my = py + ph - (ttsVbSim(E)-0.4)/0.6*ph;
  x.setLineDash([3,3]); x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(px0, my); x.lineTo(mx, my); x.lineTo(mx, py+ph); x.stroke();
  x.setLineDash([]);
  x.fillStyle = MTC.a2; x.beginPath(); x.arc(mx, my, 4.5, 0, 7); x.fill();
  mtTxt(x, '0 s', px0, py+ph+13, {size:8.5, col:MTC.muted});
  mtTxt(x, '30 s', px0+pw, py+ph+13, {size:8.5, col:MTC.muted, align:'right'});
  mtTxt(x, ttsVbSim(E).toFixed(3), mx+8, my-10, {size:9.5, col:MTC.a2});
  mtTxt(x, 'illustrative shape, not a measurement', px0, py+ph+28, {size:8.5, col:MTC.muted});

  mtSet('tvb-cap',
    'Classical collection needs <b>' + hCls.toFixed(0) + ' h</b> for ' + V + ' voices. ' +
    'The pooled model needs <b>' + hZero.toFixed(1) + ' h</b>, of which ' + (V*PER*3600).toFixed(0) +
    ' seconds is the marginal cost. The crossover sits near <b>' + cross.toFixed(0) + ' voices</b>, ' +
    'but the decisive difference is not the total: the pooled model generalizes to speakers it never trained on, ' +
    'and the studio model cannot.');
}

/* ── 16.2 THE TOKEN RATE LADDER ────────────────────────────── */
const TTS_RATES = [
  {n:'raw PCM 16 kHz',   f:16000, alpha:'2^16',   kind:'orig'},
  {n:'8-bit companded',  f:8000,  alpha:'2^8',    kind:'mu'},
  {n:'codec in this page', f:500, alpha:'64^8',   kind:'codec'},
  {n:'production codec', f:75,    alpha:'1024^8', kind:'none'},
  {n:'BPE text',         f:3,     alpha:'32k',    kind:'none'}
];
let _ttr = {sel:2};
function ttsTrBuild(){
  const host = document.getElementById('ttr-ctrl');
  if(host) host.innerHTML =
    TTS_RATES.map((r,i)=>'<button class="ttr-b" data-i="'+i+'" onclick="ttsTrSel('+i+')" style="'+MTBTN+'">'+r.n+'</button>').join('') +
    '<span style="width:10px"></span>' +
    '<button onclick="ttsTrPlay(\'orig\')" style="'+MTBTNA+'">&#9654; original</button>' +
    '<button onclick="ttsTrPlay(\'mu\')" style="'+MTBTN+'">&#9654; 8-bit</button>' +
    '<button onclick="ttsTrPlay(\'codec\')" style="'+MTBTN+'">&#9654; codec</button>' +
    '<button onclick="ttsTrPlay(\'crush\')" style="'+MTBTN+'">&#9654; crushed</button>';
  ttsTrSel(_ttr.sel);
}
function ttsTrSel(i){
  _ttr.sel = Math.max(0, Math.min(TTS_RATES.length-1, Math.round(i)));
  document.querySelectorAll('.ttr-b').forEach(b=>{
    const on = +b.dataset.i === _ttr.sel;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
    b.style.borderColor = on ? 'var(--accent)' : 'var(--border2)';
  });
  ttsTrDraw();
}
function ttsTrDraw(){
  const c = mtCtx('ttr-canvas', 290); if(!c) return;
  const {x, w} = c;
  mtTxt(x, 'SYMBOL RATE', 14, 18, {size:9, col:MTC.muted});
  mtTxt(x, 'ATTENTION COST FOR 30 SECONDS, LOG SCALE', w*0.40, 18, {size:9, col:MTC.muted});
  const rowH = (290-52)/TTS_RATES.length;
  const maxCost = Math.pow(16000*30, 2);
  for(let i=0; i<TTS_RATES.length; i++){
    const R = TTS_RATES[i], y = 34 + i*rowH, on = (i === _ttr.sel);
    const tau = R.f*30, cost = tau*tau;
    if(on){ x.fillStyle = 'rgba(79,70,229,0.10)'; mtRR(x, 8, y-2, w-16, rowH-5, 6); x.fill(); }
    mtTxt(x, R.n, 16, y+rowH/2-8, {size:10.5, col:on?MTC.a1:MTC.text});
    mtTxt(x, R.f.toLocaleString()+' tok/s   alphabet '+R.alpha, 16, y+rowH/2+7, {size:8.5, col:MTC.muted});
    const bx = w*0.40, bw = w - bx - 76;
    const frac = Math.log10(cost)/Math.log10(maxCost);
    x.fillStyle = MTC.surf2; mtRR(x, bx, y+rowH/2-8, bw, 15, 4); x.fill();
    x.fillStyle = on ? MTC.a1 : (i === 0 ? MTC.a2 : MTC.surf3);
    mtRR(x, bx, y+rowH/2-8, Math.max(3, bw*frac), 15, 4); x.fill();
    const sec = 4096/R.f;
    mtTxt(x, sec < 1 ? (sec*1000).toFixed(0)+' ms' : sec.toFixed(sec<10?1:0)+' s',
          w-10, y+rowH/2, {size:9.5, col:on?MTC.a1:MTC.muted, align:'right'});
  }
  mtTxt(x, 'audio fitting a 4096-token window', w-10, 282, {size:8.5, col:MTC.muted, align:'right'});
  const R = TTS_RATES[_ttr.sel], tau = R.f*30;
  mtSet('ttr-cap',
    'At <b>' + R.f.toLocaleString() + '</b> tokens per second a 30 second clip is <b>' + tau.toLocaleString() +
    '</b> tokens, so the attention matrix holds <b>' + (tau*tau).toExponential(2) + '</b> entries. ' +
    'Raw audio costs <b>' + Math.pow(16000/R.f, 2).toExponential(2) + '</b> times more than this row. ' +
    'A 4096-token window holds <b>' + (4096/R.f < 1 ? ((4096/R.f)*1000).toFixed(0)+' ms' : (4096/R.f).toFixed(1)+' s') + '</b> of audio.');
}
function ttsTrPlay(kind){
  const sig = ttsDemo();
  let out = sig;
  if(kind === 'mu') out = ttsRequant(sig, 8);
  else if(kind === 'codec') out = ttsRoundTrip(8);
  else if(kind === 'crush') out = ttsRequant(ttsDecimate(sig, 6), 3);
  if(!ttsPlay(out)) mtSet('ttr-cap', 'This browser blocked audio until you interact with the page. Press a play button again.');
}

/* ── 16.2.1 THE STRIDE LADDER ──────────────────────────────── */
let _tsl = {s:[2,4,5,8]};
function ttsSlBuild(){
  const host = document.getElementById('tsl-ctrl');
  if(host) host.innerHTML =
    _tsl.s.map((v,i)=>
      '<div style="min-width:104px;flex:1"><div style="'+MTLBL+';margin-bottom:4px">block '+(i+1)+' stride</div>' +
      '<input id="tsl-s'+i+'" type="range" min="1" max="8" step="1" value="'+v+
      '" oninput="ttsSlUpd()" style="width:100%;accent-color:var(--accent)">' +
      '<div id="tsl-s'+i+'-v" style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:2px"></div></div>').join('') +
    '<button onclick="ttsSlReset()" style="'+MTBTN+'">reset to 75 Hz</button>';
  ttsSlUpd();
}
function ttsSlUpd(){
  for(let i=0;i<4;i++){
    const el = document.getElementById('tsl-s'+i);
    if(el) _tsl.s[i] = Math.max(1, Math.min(8, Math.round(+el.value)));
    mtSet('tsl-s'+i+'-v', 'stride ' + _tsl.s[i] + ', kernel ' + (2*_tsl.s[i]));
  }
  ttsSlDraw();
}
function ttsSlReset(){
  _tsl.s = [2,4,5,8];
  for(let i=0;i<4;i++){ const el = document.getElementById('tsl-s'+i); if(el) el.value = _tsl.s[i]; }
  ttsSlUpd();
}
function ttsSlDraw(){
  const c = mtCtx('tsl-canvas', 320); if(!c) return;
  const {x, w} = c;
  const s = _tsl.s;
  let prod = 1; for(let i=0;i<4;i++) prod *= s[i];
  const inLen = 24000, rate = 24000/prod;

  mtTxt(x, 'ENCODER, DOWNSAMPLING', 14, 18, {size:9, col:MTC.muted});
  mtTxt(x, 'DECODER, UPSAMPLING', w/2+14, 18, {size:9, col:MTC.muted});
  x.strokeStyle = MTC.line; x.lineWidth = 1;
  x.beginPath(); x.moveTo(w/2, 28); x.lineTo(w/2, 292); x.stroke();

  let len = inLen;
  const blockH = 52, top = 34, maxW = w/2 - 46;
  for(let i=0; i<=4; i++){
    const bw = Math.max(14, maxW*Math.pow(len/inLen, 0.30));
    const y = top + i*blockH;
    x.fillStyle = (i === 0) ? MTC.surf3 : MTC.surf;
    mtRR(x, 22, y, bw, blockH-18, 4); x.fill();
    x.strokeStyle = (i === 4) ? MTC.a1 : MTC.line2; x.lineWidth = 1; x.stroke();
    mtTxt(x, len >= 1000 ? (len/1000).toFixed(len%1000?1:0)+'k' : String(Math.round(len)),
          27, y+(blockH-18)/2, {size:9, col:(i===4)?MTC.a1:MTC.muted});
    x.fillStyle = MTC.surf;
    mtRR(x, w-22-bw, y, bw, blockH-18, 4); x.fill();
    x.strokeStyle = (i === 0) ? MTC.a4 : MTC.line2; x.stroke();
    if(i < 4){
      mtTxt(x, 's=' + s[i] + '  k=' + (2*s[i]), 22, y+blockH-9, {size:8.5, col:MTC.a5});
      len = Math.floor((len - 2*s[i])/s[i]) + 1;
    }
  }
  let R = 1, mult = 1;
  for(let i=0;i<4;i++){ R += (2*s[i]-1)*mult; mult *= s[i]; }

  const ok = Math.abs(rate-75) < 0.51;
  mtTxt(x, 'stride product ' + s.join(' \u00d7 ') + ' = ' + prod, 22, 300, {size:9.5, col:MTC.text});
  mtTxt(x, '24000 / ' + prod + ' = ' + rate.toFixed(1) + ' Hz',
        w/2+22, 300, {size:9.5, col: ok ? MTC.a4 : MTC.a2});

  mtSet('tsl-cap',
    'Strides multiply to <b>' + prod + '</b>, so 24 kHz becomes <b>' + rate.toFixed(1) + ' Hz</b>, ' +
    'one embedding every ' + (1000/rate).toFixed(1) + ' ms. ' +
    (ok ? 'That is the 75 Hz target.' : 'The 75 Hz target is missed by ' + (rate-75).toFixed(1) + ' Hz.') +
    ' One output vector sees <b>' + R + ' samples</b> (' + (R/24).toFixed(1) + ' ms) through the accumulated receptive field. ' +
    'Sequence length after four blocks: <b>' + len + '</b> vectors.');
}

/* ── 16.2.2 THE CODEBOOK LOOKUP ────────────────────────────── */
let _tcl = {frame:200, K:64, ready:false};
let TTS_KBOOKS = null;
function ttsSizedBooks(){
  if(TTS_KBOOKS) return TTS_KBOOKS;
  const corpus = ttsEncodeFrames(ttsCorpusSignal());
  TTS_KBOOKS = {};
  [4,8,16,32,64].forEach(K=>{
    const cb = ttsKMeans(corpus, K, 12);
    TTS_KBOOKS[K] = {cb:cb, dist:ttsDistortion(corpus, cb)};
  });
  return TTS_KBOOKS;
}
function ttsClBuild(){
  const host = document.getElementById('tcl-ctrl');
  if(host) host.innerHTML =
    '<div style="min-width:200px;flex:1"><div style="'+MTLBL+';margin-bottom:4px">frame</div>' +
    '<input id="tcl-f" type="range" min="0" max="640" step="1" value="'+_tcl.frame+
    '" oninput="ttsClUpd()" style="width:100%;accent-color:var(--accent)">' +
    '<div id="tcl-f-v" style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:2px"></div></div>' +
    '<span style="'+MTLBL+'">codebook size</span>' +
    [4,8,16,32,64].map(K=>'<button class="tcl-k" data-k="'+K+'" onclick="ttsClK('+K+')" style="'+MTBTN+'">'+K+'</button>').join('');
  ttsClUpd();
}
function ttsClK(K){ _tcl.K = K; ttsClUpd(); }
function ttsClUpd(){
  const f = document.getElementById('tcl-f');
  if(f) _tcl.frame = Math.max(0, Math.min(640, Math.round(+f.value)));
  mtSet('tcl-f-v', 'frame ' + _tcl.frame);
  document.querySelectorAll('.tcl-k').forEach(b=>{
    const on = +b.dataset.k === _tcl.K;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
    b.style.borderColor = on ? 'var(--accent)' : 'var(--border2)';
  });
  ttsClDraw();
}
function ttsClDraw(){
  const c = mtCtx('tcl-canvas', 320); if(!c) return;
  const {x, w} = c;
  if(!_tcl.ready){
    mtTxt(x, 'training codebooks with k-means...', w/2, 160, {size:11, col:MTC.muted, align:'center'});
    setTimeout(()=>{ ttsSizedBooks(); ttsDemo(); _tcl.ready = true; ttsClDraw(); }, 30);
    return;
  }
  const B = ttsSizedBooks()[_tcl.K], cb = B.cb;
  const v = TTS_DEMOV[Math.max(0, Math.min(TTS_DEMOV.length-1, Math.round(_tcl.frame)))];
  const q = ttsNearest(v, cb), cw = cb[q];

  const cell = Math.min(15, 268/TTS_D), lx = 20, ly = 36;
  mtTxt(x, 'z_t', lx, 24, {size:9, col:MTC.muted});
  let mx = 0;
  for(let j=0;j<TTS_D;j++) mx = Math.max(mx, Math.abs(v[j]), Math.abs(cw[j]));
  for(let j=0;j<TTS_D;j++){
    const t = v[j]/(mx||1);
    x.fillStyle = t >= 0 ? 'rgba(79,70,229,'+(0.14+0.78*Math.abs(t))+')'
                         : 'rgba(159,18,57,'+(0.14+0.78*Math.abs(t))+')';
    x.fillRect(lx, ly+j*cell, 26, cell-1.5);
  }
  const bx = lx+52, bw = w*0.40;
  mtTxt(x, 'squared distance to each of ' + _tcl.K + ' codewords', bx, 24, {size:9, col:MTC.muted});
  const ds = []; let maxd = 0;
  for(let k=0;k<cb.length;k++){
    let d = 0;
    for(let j=0;j<TTS_D;j++){ const t = v[j]-cb[k][j]; d += t*t; }
    ds.push(d); maxd = Math.max(maxd, d);
  }
  const bh = 268/cb.length;
  for(let k=0;k<cb.length;k++){
    x.fillStyle = (k === q) ? MTC.a1 : MTC.surf3;
    x.fillRect(bx, ly+k*bh, Math.max(1.5, bw*ds[k]/(maxd||1)), Math.max(1, bh-1));
  }
  mtTxt(x, 'nearest is index ' + q, bx, 312, {size:9.5, col:MTC.a1});

  const rx = bx+bw+34, gw = w-rx-20;
  mtTxt(x, 'codeword over input, error between', rx, 24, {size:9, col:MTC.muted});
  for(let j=0;j<TTS_D;j++){
    const yy = ly+j*cell+cell/2, x0 = rx+gw/2;
    x.strokeStyle = MTC.line; x.lineWidth = 1;
    x.beginPath(); x.moveTo(rx, yy); x.lineTo(rx+gw, yy); x.stroke();
    const pv = x0+(v[j]/(mx||1))*(gw/2-3), pc = x0+(cw[j]/(mx||1))*(gw/2-3);
    x.strokeStyle = MTC.a5; x.lineWidth = 2.2;
    x.beginPath(); x.moveTo(pv, yy); x.lineTo(pc, yy); x.stroke();
    x.fillStyle = MTC.a1; x.fillRect(pv-1.5, yy-3, 3, 6);
    x.fillStyle = MTC.a2; x.beginPath(); x.arc(pc, yy, 2.6, 0, 7); x.fill();
  }
  let err = 0;
  for(let j=0;j<TTS_D;j++){ const e = v[j]-cw[j]; err += e*e; }
  err = Math.sqrt(err);
  const d4 = ttsSizedBooks()[4].dist;
  mtSet('tcl-cap',
    'Frame ' + Math.round(_tcl.frame) + ' collapses to the single integer <b>' + q + '</b>, costing <b>log2 ' +
    _tcl.K + ' = ' + Math.log2(_tcl.K).toFixed(0) + ' bits</b> instead of ' + TTS_D + ' floating point numbers. ' +
    'Error for this frame is <b>' + err.toFixed(4) + '</b>. Average distortion over the corpus is <b>' +
    B.dist.toFixed(4) + '</b> at K=' + _tcl.K + ', against ' + d4.toFixed(4) + ' at K=4: a sixteen-fold larger ' +
    'codebook bought a factor of <b>' + (d4/B.dist).toFixed(2) + '</b>, not sixteen.');
}

/* ── 16.2.3 THE RESIDUAL CASCADE ───────────────────────────── */
let _trc = {stages:1, frame:200, ready:false};
function ttsRcBuild(){
  const host = document.getElementById('trc-ctrl');
  if(host) host.innerHTML =
    '<div style="min-width:170px;flex:1"><div style="'+MTLBL+';margin-bottom:4px">stages kept</div>' +
    '<input id="trc-s" type="range" min="1" max="8" step="1" value="'+_trc.stages+
    '" oninput="ttsRcUpd()" style="width:100%;accent-color:var(--accent)">' +
    '<div id="trc-s-v" style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:2px"></div></div>' +
    '<div style="min-width:170px;flex:1"><div style="'+MTLBL+';margin-bottom:4px">frame</div>' +
    '<input id="trc-f" type="range" min="0" max="640" step="1" value="'+_trc.frame+
    '" oninput="ttsRcUpd()" style="width:100%;accent-color:var(--accent)">' +
    '<div id="trc-f-v" style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:2px"></div></div>' +
    '<button onclick="ttsRcPlay(\'orig\')" style="'+MTBTN+'">&#9654; original</button>' +
    '<button onclick="ttsRcPlay(\'rec\')" style="'+MTBTNA+'">&#9654; at this stage count</button>';
  ttsRcUpd();
}
function ttsRcUpd(){
  const s = document.getElementById('trc-s'), f = document.getElementById('trc-f');
  if(s) _trc.stages = Math.max(1, Math.min(TTS_NC, Math.round(+s.value)));
  if(f) _trc.frame = Math.max(0, Math.min(640, Math.round(+f.value)));
  mtSet('trc-s-v', _trc.stages + ' of 8');
  mtSet('trc-f-v', 'frame ' + _trc.frame);
  ttsRcDraw();
}
function ttsRcPlay(which){
  const out = (which === 'orig') ? ttsDemo() : ttsRoundTrip(Math.round(_trc.stages));
  if(!ttsPlay(out)) mtSet('trc-cap', 'This browser blocked audio until you interact with the page. Press play again.');
}
function ttsRcDraw(){
  const c = mtCtx('trc-canvas', 340); if(!c) return;
  const {x, w} = c;
  if(!_trc.ready){
    mtTxt(x, 'training eight residual codebooks...', w/2, 170, {size:11, col:MTC.muted, align:'center'});
    setTimeout(()=>{ ttsTrainRVQ(); ttsDemo(); _trc.ready = true; ttsRcDraw(); }, 30);
    return;
  }
  const fi = Math.max(0, Math.min(TTS_DEMOV.length-1, Math.round(_trc.frame)));
  const enc = ttsRVQEncodeVec(TTS_DEMOV[fi]);
  const S = Math.round(_trc.stages);

  mtTxt(x, 'RESIDUAL NORM AFTER EACH STAGE, LOG AXIS', 14, 18, {size:9, col:MTC.muted});
  const gx = 18, gy = 32, gw = w-36, gh = 138;
  const n0 = enc.norms[0];
  const lo = Math.log10(Math.max(1e-4, enc.norms[TTS_NC])), hi = Math.log10(n0);
  const span = Math.max(0.35, hi-lo);
  const ny = v => gy + gh - (Math.log10(Math.max(1e-4, v))-lo)/span*gh;
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(gx, gy+gh); x.lineTo(gx+gw, gy+gh); x.stroke();
  const stepW = gw/(TTS_NC+1);
  for(let s=0; s<=TTS_NC; s++){
    const px = gx + s*stepW + stepW/2, v = enc.norms[s], on = (s <= S);
    x.fillStyle = on ? (s === 0 ? MTC.a2 : MTC.a1) : MTC.surf3;
    const top = ny(v);
    mtRR(x, px-stepW*0.28, top, stepW*0.56, Math.max(2, gy+gh-top), 3); x.fill();
    mtTxt(x, s === 0 ? 'z' : String(s), px, gy+gh+12, {size:8.5, col:on?MTC.text:MTC.muted, align:'center'});
    if(on) mtTxt(x, v.toFixed(3), px, top-8, {size:8, col:MTC.muted, align:'center'});
  }

  const wy = gy+gh+34, wh = 340-wy-16;
  const sig = TTS_DEMO, rec = ttsRoundTrip(S);
  let a = Math.max(0, fi*TTS_N-320), b = Math.min(sig.length, fi*TTS_N+320);
  mtTxt(x, 'original in grey, reconstruction in teal', 14, wy-8, {size:9, col:MTC.muted});
  const drawWave = (arr, col, lw) => {
    x.beginPath();
    for(let i=a;i<b;i++){
      const px = gx+(i-a)/(b-a)*gw, py = wy+wh/2-arr[i]*wh*0.42;
      i === a ? x.moveTo(px, py) : x.lineTo(px, py);
    }
    x.strokeStyle = col; x.lineWidth = lw; x.stroke();
  };
  drawWave(sig, MTC.line2, 2.4);
  drawWave(rec, MTC.a1, 1.4);

  const snr = ttsSNR(sig, rec);
  const rate = (TTS_SR/TTS_N)*S*Math.log2(TTS_K)/1000;
  const fell = enc.norms[S] <= enc.norms[0];
  mtSet('trc-cap',
    '<b>' + S + '</b> of 8 stages. Residual norm for this frame ' + (fell ? 'fell' : 'rose') + ' from <b>' + enc.norms[0].toFixed(3) +
    '</b> to <b>' + enc.norms[S].toFixed(3) + '</b>, a factor of ' +
    (fell ? (enc.norms[0]/enc.norms[S]).toFixed(1) : (enc.norms[S]/enc.norms[0]).toFixed(1) + ' the wrong way, which single frames are allowed to do') +
    '. Whole-signal SNR is <b>' + snr.toFixed(1) + ' dB</b> at <b>' + rate.toFixed(1) + ' kbps</b>. ' +
    'Codes so far: <b>' + enc.codes.slice(0,S).join(', ') + '</b>. Stored codewords: 8 \u00d7 64 = <b>512</b>; ' +
    'reachable combinations: <b>64^8 = 2^48</b>. Press play at one stage, then at eight.');
}

/* ── 16.2.4 THE GRADIENT DETOUR ────────────────────────────── */
let _tgd = {ste:true, l1:1, l2:0.3, l3:1};
function ttsGdBuild(){
  const host = document.getElementById('tgd-ctrl');
  if(host) host.innerHTML =
    '<button id="tgd-ste" onclick="ttsGdSte()" style="'+MTBTNA+'">straight-through: on</button>' +
    [['l1','\u03bb1 reconstruction'],['l2','\u03bb2 adversarial'],['l3','\u03bb3 quantizer']].map(p=>
      '<div style="min-width:132px;flex:1"><div style="'+MTLBL+';margin-bottom:4px">'+p[1]+'</div>' +
      '<input id="tgd-'+p[0]+'" type="range" min="0" max="2" step="0.1" value="'+_tgd[p[0]]+
      '" oninput="ttsGdUpd()" style="width:100%;accent-color:var(--accent)">' +
      '<div id="tgd-'+p[0]+'-v" style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:2px"></div></div>').join('');
  ttsGdUpd();
}
function ttsGdSte(){
  _tgd.ste = !_tgd.ste;
  const b = document.getElementById('tgd-ste');
  if(b){ b.textContent = 'straight-through: ' + (_tgd.ste?'on':'off');
         b.style.cssText = _tgd.ste ? MTBTNA : MTBTN; }
  ttsGdDraw();
}
function ttsGdUpd(){
  ['l1','l2','l3'].forEach(k=>{
    const el = document.getElementById('tgd-'+k);
    if(el) _tgd[k] = Math.max(0, Math.min(2, +el.value));
    mtSet('tgd-'+k+'-v', _tgd[k].toFixed(1));
  });
  ttsGdDraw();
}
function ttsGdMSE(a,b){
  const n = Math.min(a.length,b.length); let s = 0;
  for(let i=0;i<n;i++){ const d = a[i]-b[i]; s += d*d; }
  return s/n;
}
function ttsGdCommit(S){
  let s = 0;
  for(let i=0;i<TTS_DEMOV.length;i++){
    const q = ttsRVQDecodeVec(TTS_DEMOC[i], S);
    let d = 0;
    for(let j=0;j<TTS_D;j++){ const t = TTS_DEMOV[i][j]-q[j]; d += t*t; }
    s += Math.sqrt(d);
  }
  return s/TTS_DEMOV.length;
}
function ttsGdDraw(){
  const c = mtCtx('tgd-canvas', 300); if(!c) return;
  const {x, w} = c;
  const boxes = [['x',42],['encoder',76],['z_t',42],['quantize',80],['z_q',42],['decoder',76],['x-hat',48]];
  let total = 0; boxes.forEach(b=>total += b[1]);
  const gap = (w-28-total)/(boxes.length-1);
  let px = 14; const cy = 66, bh = 34, pos = [];
  boxes.forEach((b,i)=>{
    x.fillStyle = (i === 3) ? MTC.surf3 : MTC.surf;
    mtRR(x, px, cy-bh/2, b[1], bh, 6); x.fill();
    x.strokeStyle = (i === 3) ? MTC.a5 : MTC.line2; x.lineWidth = 1; x.stroke();
    mtTxt(x, b[0], px+b[1]/2, cy, {size:9.5, col:(i===3)?MTC.a5:MTC.text, align:'center'});
    pos.push({x:px, w:b[1]}); px += b[1]+gap;
  });
  mtTxt(x, 'forward', 14, cy-bh/2-13, {size:8.5, col:MTC.muted});
  for(let i=0;i<boxes.length-1;i++){
    const x0 = pos[i].x+pos[i].w, x1 = pos[i+1].x;
    x.strokeStyle = MTC.line2; x.lineWidth = 1.4;
    x.beginPath(); x.moveTo(x0, cy); x.lineTo(x1-5, cy); x.stroke();
    x.fillStyle = MTC.line2;
    x.beginPath(); x.moveTo(x1-4, cy); x.lineTo(x1-10, cy-3.5); x.lineTo(x1-10, cy+3.5); x.closePath(); x.fill();
  }
  const by = cy+bh/2+34;
  mtTxt(x, 'backward', 14, by-17, {size:8.5, col:MTC.muted});
  for(let i=boxes.length-1;i>0;i--){
    const live = _tgd.ste ? true : (i > 3);
    const xa = pos[i].x+pos[i].w/2, xb = pos[i-1].x+pos[i-1].w/2;
    x.strokeStyle = live ? MTC.a4 : MTC.line;
    x.lineWidth = live ? 2 : 1;
    if(!live) x.setLineDash([3,4]);
    x.beginPath(); x.moveTo(xa, by); x.lineTo(xb+6, by); x.stroke();
    x.setLineDash([]);
    if(live){
      x.fillStyle = MTC.a4;
      x.beginPath(); x.moveTo(xb+4, by); x.lineTo(xb+10, by-4); x.lineTo(xb+10, by+4); x.closePath(); x.fill();
    }
  }
  const qx = pos[3].x+pos[3].w/2;
  if(!_tgd.ste){
    x.strokeStyle = MTC.a2; x.lineWidth = 2.4;
    x.beginPath(); x.moveTo(qx-12, by-10); x.lineTo(qx+12, by+10); x.stroke();
    x.beginPath(); x.moveTo(qx+12, by-10); x.lineTo(qx-12, by+10); x.stroke();
    mtTxt(x, 'the derivative of argmin is zero almost everywhere', qx, by+28, {size:9, col:MTC.a2, align:'center'});
  } else {
    mtTxt(x, 'gradient copied across the quantizer unchanged', qx, by+28, {size:9, col:MTC.a4, align:'center'});
  }

  const S = _trc.ready ? Math.round(_trc.stages) : 4;
  const Lr = _trc.ready ? ttsGdMSE(TTS_DEMO, ttsRoundTrip(S)) : 0;
  const Lv = _trc.ready ? ttsGdCommit(S) : 0;
  const Lg = 0.5;
  const terms = [['L_recon', Lr, _tgd.l1, MTC.a1], ['L_GAN', Lg, _tgd.l2, MTC.a2], ['L_VQ', Lv, _tgd.l3, MTC.a5]];
  let tot = 0; terms.forEach(t=>tot += t[1]*t[2]);
  const ly = 236;
  mtTxt(x, 'WEIGHTED LOSS AT ' + S + ' STAGES', 14, ly-12, {size:9, col:MTC.muted});
  let acc = 0;
  terms.forEach(t=>{
    const frac = tot > 0 ? (t[1]*t[2])/tot : 0;
    x.fillStyle = t[3];
    x.fillRect(14+acc*(w-28), ly, Math.max(1, frac*(w-28)), 20);
    if(frac > 0.10) mtTxt(x, t[0], 14+acc*(w-28)+6, ly+10, {size:9, col:'#FAFBFF'});
    acc += frac;
  });
  mtTxt(x, 'total ' + tot.toFixed(4), w-14, ly+34, {size:9.5, col:MTC.text, align:'right'});

  mtSet('tgd-cap',
    'Straight-through is <b>' + (_tgd.ste?'on':'off') + '</b>. ' +
    (_tgd.ste ? 'The encoder receives a gradient and learns to place its outputs where codewords already sit.'
              : 'Taking the quantizer literally, the encoder receives nothing and never trains.') +
    ' Measured here: L_recon = <b>' + Lr.toFixed(5) + '</b>, L_VQ = <b>' + Lv.toFixed(5) +
    '</b>, weighted total <b>' + tot.toFixed(4) + '</b>.');
}

/* ── 16.3 THE CODE MATRIX FILLER ───────────────────────────── */
let _tcm = {T:36, P:11, ar:0, nar:1, mask:'causal', timer:null};
function ttsCmBuild(){
  const host = document.getElementById('tcm-ctrl');
  if(host) host.innerHTML =
    '<button onclick="ttsCmStep()" style="'+MTBTN+'">AR step</button>' +
    '<button onclick="ttsCmRun()" style="'+MTBTNA+'">run the first row</button>' +
    '<button onclick="ttsCmNar()" style="'+MTBTN+'">NAR pass</button>' +
    '<button id="tcm-mask" onclick="ttsCmMask()" style="'+MTBTN+'">mask: causal</button>' +
    '<button onclick="ttsCmReset()" style="'+MTBTN+'">reset</button>';
  if(!TTS_DEMOC){ ttsTrainRVQ(); ttsDemo(); }
  ttsCmDraw();
}
function ttsCmStep(){ if(_tcm.ar < _tcm.T-_tcm.P) _tcm.ar++; ttsCmDraw(); }
function ttsCmRun(){
  if(_tcm.timer) return;
  _tcm.timer = setInterval(()=>{
    if(_tcm.ar >= _tcm.T-_tcm.P){ clearInterval(_tcm.timer); _tcm.timer = null; return; }
    _tcm.ar++; ttsCmDraw();
  }, 55);
}
function ttsCmNar(){
  if(_tcm.ar < _tcm.T-_tcm.P) _tcm.ar = _tcm.T-_tcm.P;
  if(_tcm.nar < 8) _tcm.nar++;
  _tcm.mask = 'full';
  const b = document.getElementById('tcm-mask'); if(b) b.textContent = 'mask: full';
  ttsCmDraw();
}
function ttsCmReset(){
  if(_tcm.timer){ clearInterval(_tcm.timer); _tcm.timer = null; }
  _tcm.ar = 0; _tcm.nar = 1; _tcm.mask = 'causal';
  const b = document.getElementById('tcm-mask'); if(b) b.textContent = 'mask: causal';
  ttsCmDraw();
}
function ttsCmMask(){
  _tcm.mask = _tcm.mask === 'causal' ? 'full' : 'causal';
  const b = document.getElementById('tcm-mask'); if(b) b.textContent = 'mask: ' + _tcm.mask;
  ttsCmDraw();
}
function ttsCmDraw(){
  const c = mtCtx('tcm-canvas', 330); if(!c) return;
  const {x, w} = c;
  if(!TTS_DEMOC){ ttsTrainRVQ(); ttsDemo(); }
  const T = _tcm.T, P = _tcm.P;
  const gx = 40, gy = 44, gw = w-gx-120, gh = 214;
  const cw = gw/T, ch = gh/8;

  mtTxt(x, 'time \u2192', gx, 24, {size:9, col:MTC.muted});
  mtTxt(x, 'quantizer', 8, gy+gh/2-7, {size:9, col:MTC.muted});
  mtTxt(x, 'stage', 8, gy+gh/2+6, {size:9, col:MTC.muted});
  x.fillStyle = 'rgba(159,18,57,0.09)';
  x.fillRect(gx, gy, cw*P, gh);
  mtTxt(x, 'enrolled voice', gx+2, gy-10, {size:8.5, col:MTC.a2});
  mtTxt(x, 'generated', gx+cw*P+3, gy-10, {size:8.5, col:MTC.a1});

  for(let row=0; row<8; row++){
    for(let t=0; t<T; t++){
      const filled = (t < P) || (row === 0 ? (t-P) < _tcm.ar : (row < _tcm.nar));
      const px = gx+t*cw, py = gy+row*ch;
      x.fillStyle = filled
        ? (t < P ? 'rgba(159,18,57,0.26)' : (row === 0 ? 'rgba(79,70,229,0.34)' : 'rgba(79,70,229,0.15)'))
        : MTC.surf2;
      x.fillRect(px+0.5, py+0.5, cw-1, ch-1);
      if(filled && cw > 13 && TTS_DEMOC[t]){
        mtTxt(x, String(TTS_DEMOC[t][row]), px+cw/2, py+ch/2, {size:7.5, col:row===0?MTC.text:MTC.muted, align:'center'});
      }
    }
    mtTxt(x, 'q'+(row+1), gx-6, gy+row*ch+ch/2, {size:8.5, col:row===0?MTC.a1:MTC.muted, align:'right'});
  }
  if(_tcm.ar < T-P){
    x.strokeStyle = MTC.a5; x.lineWidth = 2;
    x.strokeRect(gx+(P+_tcm.ar)*cw, gy, cw, ch);
  }

  const mx = w-104, my = gy, ms = 84, n = 10, cell = ms/n;
  mtTxt(x, _tcm.mask === 'causal' ? 'causal mask' : 'full mask', mx, my-10,
        {size:8.5, col:_tcm.mask==='causal'?MTC.a1:MTC.a2});
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){
    const allow = _tcm.mask === 'causal' ? (j <= i) : true;
    x.fillStyle = allow ? 'rgba(79,70,229,0.30)' : MTC.surf2;
    x.fillRect(mx+j*cell+0.5, my+i*cell+0.5, cell-1, cell-1);
  }
  mtTxt(x, 'sequential: ' + _tcm.ar, mx, my+ms+18, {size:9, col:MTC.muted});
  mtTxt(x, 'parallel: ' + (_tcm.nar-1), mx, my+ms+32, {size:9, col:MTC.muted});

  mtSet('tcm-cap',
    'The first row needs <b>' + (T-P) + '</b> sequential steps because each code waits for the one before it. ' +
    'Rows two through eight need <b>7</b> passes in total, each filling a whole row at once, because nothing ' +
    'inside a row is conditioned on anything else inside it. Progress: <b>' + _tcm.ar + '</b> of ' + (T-P) +
    ' steps, <b>' + (_tcm.nar-1) + '</b> of 7 passes. A single autoregressive model over all eight rows would ' +
    'need <b>' + (8*(T-P)) + '</b> steps instead of <b>' + ((T-P)+7) + '</b>.');
}

/* ── 16.4 THE LISTENING BENCH ──────────────────────────────── */
let _tlb = {tab:'mos', mos:[0,0,0,0,0], cmos:[], stages:4};
function ttsLbBuild(){
  const host = document.getElementById('tlb-ctrl');
  if(host) host.innerHTML =
    [['mos','MOS'],['cmos','CMOS'],['wer','recognizer loop'],['sim','speaker similarity']].map(t=>
      '<button class="tlb-t" data-t="'+t[0]+'" onclick="ttsLbTab(\''+t[0]+'\')" style="'+MTBTN+'">'+t[1]+'</button>').join('') +
    '<span id="tlb-sub" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"></span>';
  ttsLbTab('mos');
}
function ttsLbTab(t){
  _tlb.tab = t;
  document.querySelectorAll('.tlb-t').forEach(b=>{
    const on = b.dataset.t === t;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
    b.style.borderColor = on ? 'var(--accent)' : 'var(--border2)';
  });
  const sub = document.getElementById('tlb-sub');
  if(sub){
    if(t === 'mos') sub.innerHTML = '<span style="'+MTLBL+'">rate clip ' +
      (_tlb.mos.filter(v=>v>0).length+1) + '</span>' +
      [1,2,3,4,5].map(v=>'<button onclick="ttsLbRate('+v+')" style="'+MTBTN+'">'+v+'</button>').join('') +
      '<button onclick="ttsLbClear()" style="'+MTBTN+'">clear</button>';
    else if(t === 'cmos') sub.innerHTML =
      '<button onclick="ttsLbVote(-2)" style="'+MTBTN+'">prefer A</button>' +
      '<button onclick="ttsLbVote(0)" style="'+MTBTN+'">no preference</button>' +
      '<button onclick="ttsLbVote(2)" style="'+MTBTN+'">prefer B</button>' +
      '<button onclick="ttsLbClear()" style="'+MTBTN+'">clear</button>';
    else if(t === 'sim') sub.innerHTML =
      '<div style="min-width:170px"><div style="'+MTLBL+';margin-bottom:4px">stages</div>' +
      '<input id="tlb-s" type="range" min="1" max="8" step="1" value="'+_tlb.stages+
      '" oninput="ttsLbS()" style="width:100%;accent-color:var(--accent)">' +
      '<div id="tlb-s-v" style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:2px">'+_tlb.stages+' of 8</div></div>';
    else sub.innerHTML = '';
  }
  ttsLbDraw();
}
function ttsLbRate(v){
  const i = _tlb.mos.findIndex(r=>r === 0);
  if(i >= 0) _tlb.mos[i] = v;
  ttsLbTab('mos');
}
function ttsLbVote(v){ _tlb.cmos.push(v); if(_tlb.cmos.length > 24) _tlb.cmos.shift(); ttsLbDraw(); }
function ttsLbClear(){ _tlb.mos = [0,0,0,0,0]; _tlb.cmos = []; ttsLbTab(_tlb.tab); }
function ttsLbS(){
  const el = document.getElementById('tlb-s');
  if(el) _tlb.stages = Math.max(1, Math.min(8, Math.round(+el.value)));
  mtSet('tlb-s-v', _tlb.stages + ' of 8');
  ttsLbDraw();
}
function ttsLbDraw(){
  const c = mtCtx('tlb-canvas', 300); if(!c) return;
  const {x, w} = c;
  if(_tlb.tab === 'mos') ttsLbMos(x, w);
  else if(_tlb.tab === 'cmos') ttsLbCmos(x, w);
  else if(_tlb.tab === 'wer') ttsLbWer(x, w);
  else ttsLbSim(x, w);
}
function ttsLbMos(x, w){
  mtTxt(x, 'MEAN OPINION SCORE, FIVE POINT SCALE', 14, 18, {size:9, col:MTC.muted});
  const rated = _tlb.mos.filter(v=>v > 0);
  const counts = [0,0,0,0,0];
  _tlb.mos.forEach(v=>{ if(v > 0) counts[v-1]++; });
  const gx = 20, gy = 36, gw = w*0.46, gh = 200;
  const mxc = Math.max(1, Math.max.apply(null, counts));
  for(let i=0;i<5;i++){
    const bh = gh/5-9, py = gy+i*(gh/5);
    x.fillStyle = MTC.surf2; mtRR(x, gx+22, py, gw, bh, 4); x.fill();
    x.fillStyle = MTC.a1; mtRR(x, gx+22, py, Math.max(2, gw*counts[i]/mxc), bh, 4); x.fill();
    mtTxt(x, String(i+1), gx, py+bh/2, {size:10, col:MTC.muted});
    mtTxt(x, String(counts[i]), gx+30+gw, py+bh/2, {size:9.5, col:MTC.muted});
  }
  let m = 0, sd = 0;
  if(rated.length){
    rated.forEach(v=>m += v); m /= rated.length;
    rated.forEach(v=>sd += (v-m)*(v-m));
    sd = rated.length > 1 ? Math.sqrt(sd/(rated.length-1)) : 0;
  }
  const ci = rated.length ? 1.96*sd/Math.sqrt(rated.length) : 0;
  const px0 = w*0.62, pw = w-px0-24;
  mtTxt(x, 'mean and 95% interval', px0, 36, {size:9, col:MTC.muted});
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(px0, 210); x.lineTo(px0+pw, 210); x.stroke();
  mtTxt(x, '1', px0, 224, {size:8.5, col:MTC.muted});
  mtTxt(x, '5', px0+pw, 224, {size:8.5, col:MTC.muted, align:'right'});
  if(rated.length){
    const mp = px0+(m-1)/4*pw;
    const lo = px0+(Math.max(1,Math.min(5,m-ci))-1)/4*pw;
    const hi = px0+(Math.max(1,Math.min(5,m+ci))-1)/4*pw;
    x.strokeStyle = MTC.a2; x.lineWidth = 3;
    x.beginPath(); x.moveTo(lo, 186); x.lineTo(hi, 186); x.stroke();
    x.fillStyle = MTC.a1; x.beginPath(); x.arc(mp, 186, 5, 0, 7); x.fill();
    mtTxt(x, m.toFixed(2), mp, 166, {size:12, col:MTC.a1, align:'center'});
  }
  mtSet('tlb-cap', rated.length
    ? 'n = <b>' + rated.length + '</b>, mean <b>' + m.toFixed(2) + '</b>, s = ' + sd.toFixed(2) +
      ', half-width 1.96 s / sqrt(n) = <b>' + ci.toFixed(2) + '</b>. ' +
      (rated.length < 5 ? 'Rate the remaining clips and watch the interval narrow.'
                        : 'Five ratings cannot separate two good systems. Quartering the interval costs sixteen times the listeners.')
    : 'Rate five clips. The interval half-width shrinks as one over the square root of n, which is why listening panels are large.');
}
function ttsLbCmos(x, w){
  mtTxt(x, 'COMPARATIVE MOS, PAIRED PREFERENCE', 14, 18, {size:9, col:MTC.muted});
  const gx = 20, gy = 40, gw = w-40, gh = 190;
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(gx, gy+gh/2); x.lineTo(gx+gw, gy+gh/2); x.stroke();
  mtTxt(x, '+3 prefer B', gx, gy+8, {size:8.5, col:MTC.muted});
  mtTxt(x, '-3 prefer A', gx, gy+gh-8, {size:8.5, col:MTC.muted});
  const N = Math.max(10, _tlb.cmos.length);
  _tlb.cmos.forEach((v,i)=>{
    const px = gx+(i+0.5)/N*gw, py = gy+gh/2-v/3*(gh/2-8);
    x.fillStyle = v > 0 ? MTC.a1 : (v < 0 ? MTC.a2 : MTC.muted);
    x.beginPath(); x.arc(px, py, 4, 0, 7); x.fill();
  });
  let m = 0, sd = 0;
  if(_tlb.cmos.length){
    _tlb.cmos.forEach(v=>m += v); m /= _tlb.cmos.length;
    _tlb.cmos.forEach(v=>sd += (v-m)*(v-m));
    sd = _tlb.cmos.length > 1 ? Math.sqrt(sd/(_tlb.cmos.length-1)) : 0;
    const my = gy+gh/2-m/3*(gh/2-8);
    x.strokeStyle = MTC.a5; x.lineWidth = 2; x.setLineDash([4,4]);
    x.beginPath(); x.moveTo(gx, my); x.lineTo(gx+gw, my); x.stroke(); x.setLineDash([]);
    mtTxt(x, 'mean ' + m.toFixed(2), gx+gw, my-11, {size:9.5, col:MTC.a5, align:'right'});
  }
  const t = sd > 0 ? m/(sd/Math.sqrt(_tlb.cmos.length)) : 0;
  mtSet('tlb-cap', _tlb.cmos.length
    ? 'n = <b>' + _tlb.cmos.length + '</b> pairs, mean <b>' + m.toFixed(2) + '</b>, s = ' + sd.toFixed(2) +
      ', t = <b>' + t.toFixed(2) + '</b> on ' + (_tlb.cmos.length-1) + ' degrees of freedom. ' +
      (Math.abs(t) > 2.1 ? 'Large enough to reject equality at the usual threshold.' : 'Not yet distinguishable from zero.')
    : 'Score several pairs. Because both systems read the same sentences, sentence difficulty cancels in the difference, which makes the paired test more sensitive than two separate MOS runs.');
}
function ttsLbWer(x, w){
  mtTxt(x, 'INTELLIGIBILITY: SCORE THE RECOGNIZED TRANSCRIPT', 14, 18, {size:9, col:MTC.muted});
  const ref = ['the','train','leaves','at','nine',''];
  const hyp = ['the','train','leaves','it','nine','thirty'];
  const ev  = ['C','C','C','S','C','I'];
  const gx = 22, cw = (w-44)/6, y0 = 58;
  mtTxt(x, 'reference', gx, y0-20, {size:9, col:MTC.muted});
  for(let i=0;i<6;i++){
    x.fillStyle = MTC.surf2; mtRR(x, gx+i*cw, y0, cw-7, 28, 4); x.fill();
    x.strokeStyle = MTC.line; x.lineWidth = 1; x.stroke();
    if(ref[i]) mtTxt(x, ref[i], gx+i*cw+(cw-7)/2, y0+14, {size:10, col:MTC.text, align:'center'});
  }
  mtTxt(x, 'hypothesis', gx, y0+52, {size:9, col:MTC.muted});
  for(let i=0;i<6;i++){
    const bad = ev[i] !== 'C';
    x.fillStyle = bad ? 'rgba(159,18,57,0.14)' : MTC.surf2;
    mtRR(x, gx+i*cw, y0+64, cw-7, 28, 4); x.fill();
    x.strokeStyle = bad ? MTC.a2 : MTC.line; x.lineWidth = 1; x.stroke();
    mtTxt(x, hyp[i], gx+i*cw+(cw-7)/2, y0+78, {size:10, col:MTC.text, align:'center'});
    mtTxt(x, ev[i], gx+i*cw+(cw-7)/2, y0+106, {size:10, col:bad?MTC.a2:MTC.muted, align:'center'});
  }
  mtTxt(x, 'WER = 100 \u00d7 (I + S + D) / N = 100 \u00d7 (1 + 1 + 0) / 5 = 40.0%',
        w/2, 250, {size:11, col:MTC.a1, align:'center'});
  mtSet('tlb-cap',
    'One substitution (<b>at</b> heard as <b>it</b>), one insertion (<b>thirty</b>), no deletions, against a ' +
    'five word reference: <b>40.0%</b>. This alignment is worked by hand rather than produced by a recognizer ' +
    'running in the page. The metric catches dropped and mangled words, and is blind to a clip that is fully ' +
    'intelligible in the wrong voice.');
}
function ttsSpkEmb(sig, a, b){
  const B = ttsBasis(), N = TTS_N, D = TTS_D;
  const nf = Math.max(1, Math.floor((b-a)/N));
  const e = new Float64Array(D);
  for(let f=0; f<nf; f++){
    for(let k=0;k<D;k++){
      let s = 0; const row = B[k], off = a+f*N;
      for(let n2=0;n2<N;n2++) s += (sig[off+n2]||0)*row[n2];
      e[k] += Math.log(1+s*s*40);
    }
  }
  let nn = 0;
  for(let k=0;k<D;k++){ e[k] /= nf; nn += e[k]*e[k]; }
  nn = Math.sqrt(nn) || 1;
  for(let k=0;k<D;k++) e[k] /= nn;
  return e;
}
function ttsCos(a,b){ let s = 0; for(let k=0;k<a.length;k++) s += a[k]*b[k]; return s; }
function ttsLbSim(x, w){
  mtTxt(x, 'SPEAKER SIMILARITY: COSINE BETWEEN SPECTRAL PROFILES', 14, 18, {size:9, col:MTC.muted});
  ttsDemo();
  const S = Math.round(_tlb.stages);
  const rec = ttsRoundTrip(S);
  const a = 0, b = Math.floor(TTS_DEMO.length*0.2);
  const eEnr = ttsSpkEmb(TTS_DEMO, a, b);
  const eOut = ttsSpkEmb(rec, a, b);
  const eOth = ttsSpkEmb(TTS_DEMO, Math.floor(TTS_DEMO.length*0.6), Math.floor(TTS_DEMO.length*0.8));
  const simSelf = ttsCos(eEnr, eOut), simOther = ttsCos(eEnr, eOth);
  const gx = 24, gw = w-48, gh = 78;
  const prof = (e, y, col, lab) => {
    mtTxt(x, lab, gx, y-9, {size:9, col:MTC.muted});
    const bw = gw/e.length;
    let mx = 0; for(let k=0;k<e.length;k++) mx = Math.max(mx, Math.abs(e[k]));
    for(let k=0;k<e.length;k++){
      const h2 = Math.abs(e[k])/(mx||1)*(gh-10);
      x.fillStyle = col;
      x.fillRect(gx+k*bw+1, y+gh-h2, bw-2, h2);
    }
  };
  prof(eEnr, 46, MTC.a2, 'enrolled voice');
  prof(eOut, 152, MTC.a1, 'generated at ' + S + ' stages');
  const by = 268;
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(gx, by); x.lineTo(gx+gw, by); x.stroke();
  mtTxt(x, '-1', gx, by+13, {size:8.5, col:MTC.muted});
  mtTxt(x, '1', gx+gw, by+13, {size:8.5, col:MTC.muted, align:'right'});
  const mark = (v, col, lab) => {
    const px = gx+(v+1)/2*gw;
    x.fillStyle = col; x.beginPath(); x.arc(px, by, 4.5, 0, 7); x.fill();
    mtTxt(x, lab + ' ' + v.toFixed(3), px, by-13, {size:8.5, col:col, align:'center'});
  };
  mark(simOther, MTC.a5, 'unrelated');
  mark(simSelf, MTC.a4, 'same voice');
  mtSet('tlb-cap',
    'At <b>' + S + '</b> stages the generated audio scores <b>' + simSelf.toFixed(4) +
    '</b> against the enrolled profile, while an unrelated segment scores <b>' + simOther.toFixed(4) +
    '</b>. Any threshold between the two separates them. This metric would pass a clip that keeps the voice ' +
    'and garbles every word, which is the failure the recognizer tab catches.');
}

/* ── 16.5 THE TASK SWITCHBOARD ─────────────────────────────── */
let _tsw = {tab:'diar', thr:0.9};
let TTS_DIAR = null;
function ttsDiarSignal(){
  if(TTS_DIAR) return TTS_DIAR;
  const turns = [0,0,1,0,1,1,0,1], segs = [], truth = [];
  turns.forEach(spk=>{
    const F = spk === 0 ? [320,2200,2900] : [640,1050,2350];
    const seg = ttsSynth(spk === 0 ? 190 : 105, F, TTS_BWD, 0.22);
    segs.push(seg);
    const nf = Math.floor(seg.length/TTS_N);
    for(let f=0; f<nf; f++) truth.push(spk);
  });
  TTS_DIAR = {sig:ttsNorm(ttsCat(segs)), truth:truth};
  return TTS_DIAR;
}
function ttsSwBuild(){
  const host = document.getElementById('tsw-ctrl');
  if(host) host.innerHTML =
    [['diar','who spoke when'],['ver','verification'],['wake','wake word']].map(t=>
      '<button class="tsw-t" data-t="'+t[0]+'" onclick="ttsSwTab(\''+t[0]+'\')" style="'+MTBTN+'">'+t[1]+'</button>').join('') +
    '<span id="tsw-sub" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"></span>';
  ttsSwTab('diar');
}
function ttsSwTab(t){
  _tsw.tab = t;
  document.querySelectorAll('.tsw-t').forEach(b=>{
    const on = b.dataset.t === t;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
    b.style.borderColor = on ? 'var(--accent)' : 'var(--border2)';
  });
  const sub = document.getElementById('tsw-sub');
  if(sub) sub.innerHTML = (t === 'ver')
    ? '<div style="min-width:190px"><div style="'+MTLBL+';margin-bottom:4px">threshold</div>' +
      '<input id="tsw-thr" type="range" min="0" max="1" step="0.01" value="'+_tsw.thr+
      '" oninput="ttsSwThr()" style="width:100%;accent-color:var(--accent)"></div>'
    : '';
  ttsSwDraw();
}
function ttsSwThr(){
  const el = document.getElementById('tsw-thr');
  if(el) _tsw.thr = Math.max(0, Math.min(1, +el.value));
  ttsSwDraw();
}
function ttsSwDraw(){
  const c = mtCtx('tsw-canvas', 300); if(!c) return;
  const {x, w} = c;
  if(_tsw.tab === 'diar') ttsSwDiar(x, w);
  else if(_tsw.tab === 'ver') ttsSwVer(x, w);
  else ttsSwWake(x, w);
}
function ttsSwDiar(x, w){
  const d = ttsDiarSignal();
  const nf = d.truth.length, embs = [];
  for(let f=0; f<nf; f++) embs.push(ttsSpkEmb(d.sig, f*TTS_N, (f+2)*TTS_N));
  const cent = ttsKMeans(embs, 2, 12);
  let asg = embs.map(e=>ttsNearest(e, cent));
  let agree = 0;
  for(let i=0;i<nf;i++) if(asg[i] === d.truth[i]) agree++;
  if(agree < nf/2) asg = asg.map(v=>1-v);
  let conf = 0;
  for(let i=0;i<nf;i++) if(asg[i] !== d.truth[i]) conf++;
  const der = 100*conf/nf;

  mtTxt(x, 'CLUSTER THE SEGMENT EMBEDDINGS, THEN COMPARE WITH THE TRUTH', 14, 18, {size:9, col:MTC.muted});
  const gx = 18, gw = w-36, bh = 22, cwid = gw/nf;
  mtTxt(x, 'reference', gx, 42, {size:9, col:MTC.muted});
  for(let i=0;i<nf;i++){
    x.fillStyle = d.truth[i] ? MTC.a2 : MTC.a1;
    x.fillRect(gx+i*cwid, 52, Math.ceil(cwid), bh);
  }
  mtTxt(x, 'clustered', gx, 100, {size:9, col:MTC.muted});
  for(let i=0;i<nf;i++){
    x.fillStyle = asg[i] ? MTC.a2 : MTC.a1;
    x.fillRect(gx+i*cwid, 110, Math.ceil(cwid), bh);
    if(asg[i] !== d.truth[i]){
      x.fillStyle = MTC.a5;
      x.fillRect(gx+i*cwid, 110+bh, Math.ceil(cwid), 4);
    }
  }
  const wy = 168, wh = 110;
  x.beginPath();
  for(let i=0;i<d.sig.length;i+=2){
    const px = gx+i/d.sig.length*gw, py = wy+wh/2-d.sig[i]*wh*0.44;
    i ? x.lineTo(px, py) : x.moveTo(px, py);
  }
  x.strokeStyle = MTC.line2; x.lineWidth = 1; x.stroke();
  mtSet('tsw-cap',
    'Eight turns and <b>' + nf + '</b> frames, clustered with the same k-means that built the codebooks. ' +
    'Confusion on <b>' + conf + '</b> frames gives a diarization error rate of <b>' + der.toFixed(1) + '%</b>. ' +
    'Nothing here was told the turn structure; the only supplied quantity is the number of clusters, which is ' +
    'exactly the part real systems have to estimate.');
}
function ttsSwVer(x, w){
  const d = ttsDiarSignal();
  const nfPer = Math.floor(d.truth.length/8), segs = [];
  for(let i=0;i<8;i++){
    segs.push({e:ttsSpkEmb(d.sig, i*nfPer*TTS_N, (i+1)*nfPer*TTS_N), spk:d.truth[i*nfPer]});
  }
  const gen = [], imp = [];
  for(let i=0;i<segs.length;i++) for(let j=i+1;j<segs.length;j++){
    const s = ttsCos(segs[i].e, segs[j].e);
    (segs[i].spk === segs[j].spk ? gen : imp).push(s);
  }
  mtTxt(x, 'ONE THRESHOLD ON THE SAME SIMILARITY SCORE', 14, 18, {size:9, col:MTC.muted});
  const gx = 28, gw = w-56, gy = 42, gh = 180;
  const all = imp.concat(gen);
  const lo = Math.min.apply(null, all)-0.01, hi = Math.max.apply(null, all)+0.01;
  const px = v => gx+(v-lo)/(hi-lo)*gw;
  x.strokeStyle = MTC.line2; x.lineWidth = 1;
  x.beginPath(); x.moveTo(gx, gy+gh); x.lineTo(gx+gw, gy+gh); x.stroke();
  imp.forEach(v=>{ x.fillStyle = MTC.a5; x.beginPath(); x.arc(px(v), gy+gh-18, 4.5, 0, 7); x.fill(); });
  gen.forEach(v=>{ x.fillStyle = MTC.a4; x.beginPath(); x.arc(px(v), gy+gh-46, 4.5, 0, 7); x.fill(); });
  mtTxt(x, 'impostor pairs', gx, gy+gh-18, {size:8.5, col:MTC.a5});
  mtTxt(x, 'genuine pairs', gx, gy+gh-46, {size:8.5, col:MTC.a4});
  const th = lo+(hi-lo)*_tsw.thr;
  x.strokeStyle = MTC.a2; x.lineWidth = 2;
  x.beginPath(); x.moveTo(px(th), gy); x.lineTo(px(th), gy+gh); x.stroke();
  mtTxt(x, 'threshold ' + th.toFixed(3), px(th), gy-8, {size:9, col:MTC.a2, align:'center'});
  const fa = imp.filter(v=>v >= th).length/Math.max(1, imp.length);
  const fr = gen.filter(v=>v < th).length/Math.max(1, gen.length);
  mtSet('tsw-cap',
    'At this threshold, FAR = <b>' + (100*fa).toFixed(1) + '%</b> of impostor pairs are accepted and FRR = <b>' +
    (100*fr).toFixed(1) + '%</b> of genuine pairs are rejected. Moving the line trades one against the other and ' +
    'never removes both; the crossing point is the equal error rate. Identification uses the same score but takes ' +
    'an argmax over an enrolled gallery instead of comparing against a threshold.');
}
function ttsSwWake(x, w){
  mtTxt(x, 'ACCURACY AGAINST FOOTPRINT ON A DEVICE THAT NEVER SLEEPS', 14, 18, {size:9, col:MTC.muted});
  const sizes = [['8 k parameters',2.2e-4,0.081],['32 k parameters',9.0e-5,0.043],
                 ['128 k parameters',3.1e-5,0.021],['1 M parameters',1.1e-5,0.009]];
  const gx = 20, gw = w-40, gy = 44, rowH = 58;
  sizes.forEach((s,i)=>{
    const y = gy+i*rowH, fah = 3600*100*s[1];
    mtTxt(x, s[0], gx, y+rowH/2-9, {size:10, col:MTC.text});
    mtTxt(x, 'false wakes/hour ' + fah.toFixed(2) + '   miss ' + (100*s[2]).toFixed(1) + '%',
          gx, y+rowH/2+8, {size:8.5, col:MTC.muted});
    const bx = gx+gw*0.44, bw = gw*0.53;
    x.fillStyle = MTC.surf2; mtRR(x, bx, y+rowH/2-10, bw, 18, 4); x.fill();
    x.fillStyle = MTC.a5;
    mtRR(x, bx, y+rowH/2-10, Math.max(3, bw*Math.min(1, fah/1.0)), 18, 4); x.fill();
  });
  mtSet('tsw-cap',
    'False accepts per hour is 3600 \u00d7 f \u00d7 FAR, with f the decision rate. At a hundred decisions a second, ' +
    'a false accept rate of one in ten thousand wakes the device <b>' + (3600*100*1e-4).toFixed(1) +
    '</b> times an hour. The operating points shown are illustrative rather than measured; what is real is the ' +
    'shape of the trade, and it is why these models run on the device and transmit nothing until they fire.');
}

/* ── 16.6 THE SHARED VOCABULARY STRIP ──────────────────────── */
const TTS_TASKS = {
  tts:{n:'synthesis',            inn:['text','text','text','prompt'], out:['audio','audio','audio','audio']},
  asr:{n:'recognition',          inn:['audio','audio','audio','audio'], out:['text','text','text']},
  s2s:{n:'speech translation',   inn:['audio','audio','audio'], out:['audio','audio','audio','audio']},
  qa: {n:'spoken question answering', inn:['audio','audio'], out:['text','audio','audio']}
};
let _tsv = {task:'tts'};
function ttsSvBuild(){
  const host = document.getElementById('tsv-ctrl');
  if(host) host.innerHTML = Object.keys(TTS_TASKS).map(k=>
    '<button class="tsv-t" data-t="'+k+'" onclick="ttsSvTab(\''+k+'\')" style="'+MTBTN+'">'+TTS_TASKS[k].n+'</button>').join('');
  ttsSvTab('tts');
}
function ttsSvTab(t){
  _tsv.task = t;
  document.querySelectorAll('.tsv-t').forEach(b=>{
    const on = b.dataset.t === t;
    b.style.background = on ? 'var(--accent)' : 'var(--surface2)';
    b.style.color = on ? '#FAFBFF' : 'var(--muted)';
    b.style.borderColor = on ? 'var(--accent)' : 'var(--border2)';
  });
  ttsSvDraw();
}
function ttsSvDraw(){
  const c = mtCtx('tsv-canvas', 260); if(!c) return;
  const {x, w} = c;
  const T = TTS_TASKS[_tsv.task];
  const seq = T.inn.concat(['|'], T.out);
  mtTxt(x, 'ONE STREAM, ONE SOFTMAX. THE TASK IS WHICH SIDE IS WHICH', 14, 18, {size:9, col:MTC.muted});
  const gx = 18, gw = w-36, cy = 92, cw = gw/seq.length;
  seq.forEach((k,i)=>{
    const px = gx+i*cw;
    if(k === '|'){
      x.strokeStyle = MTC.line2; x.lineWidth = 1; x.setLineDash([4,4]);
      x.beginPath(); x.moveTo(px+cw/2, cy-36); x.lineTo(px+cw/2, cy+36); x.stroke();
      x.setLineDash([]);
      mtTxt(x, 'generate \u2192', px+cw/2, cy-46, {size:8.5, col:MTC.muted, align:'center'});
      return;
    }
    const isTxt = (k === 'text');
    x.fillStyle = isTxt ? 'rgba(159,18,57,0.20)' : 'rgba(79,70,229,0.20)';
    mtRR(x, px+3, cy-17, cw-6, 34, 5); x.fill();
    x.strokeStyle = isTxt ? MTC.a2 : MTC.a1; x.lineWidth = 1; x.stroke();
    mtTxt(x, isTxt ? 'txt' : (k === 'prompt' ? 'prm' : 'aud'), px+cw/2, cy, {size:9, col:MTC.text, align:'center'});
  });
  const vTxt = 32000, vAud = 8*1024, vSpec = 8, tot = vTxt+vAud+vSpec;
  const by = 186;
  mtTxt(x, 'THE OUTPUT SOFTMAX SPANS BOTH MODALITIES', 18, by-12, {size:9, col:MTC.muted});
  const parts = [['text BPE '+vTxt.toLocaleString(), vTxt, MTC.a2],
                 ['audio codes '+vAud.toLocaleString(), vAud, MTC.a1],
                 ['special', vSpec, MTC.a5]];
  let acc = 0;
  parts.forEach(p=>{
    const frac = p[1]/tot;
    x.fillStyle = p[2];
    x.fillRect(18+acc*(w-36), by, Math.max(2, frac*(w-36)), 20);
    if(frac > 0.14) mtTxt(x, p[0], 18+acc*(w-36)+7, by+10, {size:9, col:'#FAFBFF'});
    acc += frac;
  });
  mtTxt(x, '|V| = ' + tot.toLocaleString(), w-18, by+36, {size:10, col:MTC.text, align:'right'});
  mtSet('tsv-cap',
    'Task: <b>' + T.n + '</b>. Nothing about the model changed, only which token types sit on each side of the ' +
    'generation boundary. The vocabulary is <b>' + vTxt.toLocaleString() + '</b> text tokens plus <b>' +
    vAud.toLocaleString() + '</b> audio codes across eight codebooks plus ' + vSpec + ' control tokens, giving ' +
    '<b>|V| = ' + tot.toLocaleString() + '</b>.');
}

/* ── 16.7 THE ROUND TRIP ───────────────────────────────────── */
let TTS_RTNODES = [];
function ttsRtBuild(){ ttsRtDraw(); const cv = document.getElementById('trt-canvas'); if(cv) cv.onclick = ttsRtClick; }
function ttsRtDraw(){
  const c = mtCtx('trt-canvas', 240); if(!c) return;
  const {x, w} = c;
  const nodes = [['waveform',null],['conv encoder','ttssl'],['embeddings','ttsrate'],
                 ['quantizer','ttscb'],['discrete codes','ttsrvq'],['conditional LM','ttslm'],
                 ['conv decoder','ttssl'],['waveform',null]];
  const bw = (w-28)/nodes.length, cy = 74, bh = 42;
  TTS_RTNODES = [];
  nodes.forEach((n,i)=>{
    const px = 14+i*bw;
    x.fillStyle = n[1] ? MTC.surf : MTC.surf2;
    mtRR(x, px+3, cy-bh/2, bw-6, bh, 6); x.fill();
    x.strokeStyle = n[1] ? MTC.a1 : MTC.line2; x.lineWidth = 1; x.stroke();
    const words = n[0].split(' ');
    words.forEach((wd,j)=>{
      mtTxt(x, wd, px+bw/2, cy-(words.length-1)*6+j*12, {size:8.5, col:MTC.text, align:'center'});
    });
    TTS_RTNODES.push({x:px+3, y:cy-bh/2, w:bw-6, h:bh, s:n[1]});
    if(i < nodes.length-1){
      x.strokeStyle = MTC.line2; x.lineWidth = 1.2;
      x.beginPath(); x.moveTo(px+bw-3, cy); x.lineTo(px+bw+2, cy); x.stroke();
    }
  });
  mtTxt(x, 'synthesis runs left to right', 14, cy-bh/2-14, {size:9, col:MTC.a1});
  x.strokeStyle = MTC.a2; x.lineWidth = 1.4; x.setLineDash([5,4]);
  x.beginPath(); x.moveTo(w-16, cy+bh/2+18); x.lineTo(16, cy+bh/2+18); x.stroke();
  x.setLineDash([]);
  mtTxt(x, 'recognition traverses the same spine the other way', w-16, cy+bh/2+32,
        {size:9, col:MTC.a2, align:'right'});
  const ps = [['sample rate','24 kHz'],['embedding rate','75 Hz'],['D','256'],['K','1024'],
              ['codebooks','8'],['bitrate','6 kbps'],['prompt','3 s']];
  const py = 192, pw = (w-28)/ps.length;
  ps.forEach((p,k)=>{
    mtTxt(x, p[0], 14+k*pw, py, {size:8.5, col:MTC.muted});
    mtTxt(x, p[1], 14+k*pw, py+16, {size:11, col:MTC.a1});
  });
  mtSet('trt-cap', 'Nodes outlined in teal are clickable and jump to the section that builds them.');
}
function ttsRtClick(ev){
  const cv = document.getElementById('trt-canvas'); if(!cv) return;
  const r = cv.getBoundingClientRect();
  const mx = ev.clientX-r.left, my = ev.clientY-r.top;
  for(const n of TTS_RTNODES){
    if(n.s && mx >= n.x && mx <= n.x+n.w && my >= n.y && my <= n.y+n.h){ openTTSSec(n.s); return; }
  }
}

/* ── 16.8 THE SYNTHESIS FAMILY TREE ────────────────────────── */
const TTS_HIST = [
  {y:1773,t:'organ-pipe vowel resonators',b:0},
  {y:1791,t:'bellows, reed and leather tract',b:0},
  {y:1951,t:'painted spectrograms played back',b:1},
  {y:1953,t:'low-rate formant synthesis',b:1},
  {y:1982,t:'Klattalk and DECtalk ship',b:1},
  {y:1953,t:'magnetic tape spliced by phone',b:2},
  {y:1958,t:'diphone database with join costs',b:2},
  {y:1977,t:'diphone synthesis implemented',b:2},
  {y:1996,t:'unit selection at scale',b:2},
  {y:1953,t:'electrical analog of the tract',b:3},
  {y:1975,t:'vocal cord dynamics modelled',b:3},
  {y:1968,t:'first parser-driven text front end',b:4},
  {y:2016,t:'sample-by-sample neural waveforms',b:5},
  {y:2023,t:'neural codecs give discrete tokens',b:5},
  {y:2025,t:'codec language models, zero-shot voices',b:5}
];
const TTS_BR = ['mechanical','formant','concatenative','articulatory','text analysis','neural'];
let _tft = {year:2025};
function ttsFtBuild(){
  const host = document.getElementById('tft-ctrl');
  if(host) host.innerHTML =
    '<div style="min-width:280px;flex:1"><div style="'+MTLBL+';margin-bottom:4px">year</div>' +
    '<input id="tft-y" type="range" min="1770" max="2030" step="1" value="'+_tft.year+
    '" oninput="ttsFtUpd()" style="width:100%;accent-color:var(--accent)">' +
    '<div id="tft-y-v" style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:2px"></div></div>';
  ttsFtUpd();
}
function ttsFtUpd(){
  const el = document.getElementById('tft-y');
  if(el) _tft.year = Math.max(1770, Math.min(2030, Math.round(+el.value)));
  mtSet('tft-y-v', String(_tft.year));
  ttsFtDraw();
}
function ttsFtDraw(){
  const c = mtCtx('tft-canvas', 330); if(!c) return;
  const {x, w} = c;
  const y0 = 1760, y1 = 2035;
  const gx = 116, gw = w-gx-22, gy = 30, rowH = (330-70)/TTS_BR.length;
  const px = y => gx+(y-y0)/(y1-y0)*gw;
  TTS_BR.forEach((b,i)=>{
    const yy = gy+i*rowH+rowH/2;
    x.strokeStyle = MTC.line; x.lineWidth = 1;
    x.beginPath(); x.moveTo(gx, yy); x.lineTo(gx+gw, yy); x.stroke();
    mtTxt(x, b, gx-10, yy, {size:9, col:MTC.muted, align:'right'});
  });
  TTS_HIST.forEach(e=>{
    if(e.y > _tft.year) return;
    const ex = px(e.y), ey = gy+e.b*rowH+rowH/2;
    const near = e.y > _tft.year-18;
    x.fillStyle = near ? MTC.a1 : MTC.line2;
    x.beginPath(); x.arc(ex, ey, 4.5, 0, 7); x.fill();
    if(near){
      mtTxt(x, e.t, ex+8, ey-9, {size:8.5, col:MTC.text});
      mtTxt(x, String(e.y), ex+8, ey+8, {size:8, col:MTC.a1});
    }
  });
  x.strokeStyle = MTC.a5; x.lineWidth = 1.5;
  x.beginPath(); x.moveTo(px(_tft.year), gy-6); x.lineTo(px(_tft.year), gy+TTS_BR.length*rowH); x.stroke();
  [1800,1850,1900,1950,2000].forEach(d=>{
    mtTxt(x, String(d), px(d), 318, {size:8.5, col:MTC.muted, align:'center'});
  });
  const shown = TTS_HIST.filter(e=>e.y <= _tft.year).length;
  mtSet('tft-cap',
    'Year <b>' + _tft.year + '</b>, showing <b>' + shown + '</b> of ' + TTS_HIST.length + ' milestones. ' +
    'The gap worth noticing: a diphone database with join costs on pitch and formant distance was described in ' +
    '1958 and not built until the late 1970s, because the storage and search it assumed did not exist. The same ' +
    'pattern repeats with neural methods, proposed well before the hardware could run them.');
}

/* ── 16.9 TEST YOURSELF ────────────────────────────────────── */
const TTS_TXCFG = [{f:75,nc:8,k:1024},{f:50,nc:4,k:512},{f:100,nc:12,k:256},
                   {f:25,nc:8,k:2048},{f:75,nc:2,k:1024},{f:500,nc:8,k:64}];
let _txb = {seed:0, shown:false, rvq:[0,0]};
function ttsXbBuild(){
  const host = document.getElementById('txb-ctrl');
  if(host) host.innerHTML =
    '<button onclick="ttsXbNew()" style="'+MTBTN+'">new configuration</button>' +
    '<button onclick="ttsXbReveal()" style="'+MTBTNA+'">reveal</button>' +
    [0,1].map(i=>
      '<div style="min-width:132px"><div style="'+MTLBL+';margin-bottom:4px">stage '+(i+1)+' pick</div>' +
      '<input id="txb-r'+i+'" type="range" min="0" max="3" step="1" value="'+_txb.rvq[i]+
      '" oninput="ttsXbUpd()" style="width:100%;accent-color:var(--accent)">' +
      '<div id="txb-r'+i+'-v" style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-top:2px"></div></div>').join('');
  ttsXbUpd();
}
function ttsXbNew(){ _txb.seed = (_txb.seed+1)%TTS_TXCFG.length; _txb.shown = false; ttsXbDraw(); }
function ttsXbReveal(){ _txb.shown = true; ttsXbDraw(); }
function ttsXbUpd(){
  for(let i=0;i<2;i++){
    const el = document.getElementById('txb-r'+i);
    if(el) _txb.rvq[i] = Math.max(0, Math.min(3, Math.round(+el.value)));
    mtSet('txb-r'+i+'-v', 'codeword ' + _txb.rvq[i]);
  }
  ttsXbDraw();
}
function ttsXbDraw(){
  const c = mtCtx('txb-canvas', 300); if(!c) return;
  const {x, w} = c;
  const cfg = TTS_TXCFG[_txb.seed];
  mtTxt(x, 'BENCH ONE \u00b7 BITRATE ARITHMETIC', 14, 18, {size:9, col:MTC.muted});
  ['token rate f = '+cfg.f+' Hz', 'codebooks Nc = '+cfg.nc, 'codebook size K = '+cfg.k,
   'reference: 24 kHz, 16 bit = 384000 bits/s'].forEach((s,i)=>{
    mtTxt(x, s, 22, 42+i*18, {size:10, col:MTC.text});
  });
  const bits = cfg.f*cfg.nc*Math.log2(cfg.k), ratio = 384000/bits;
  if(_txb.shown){
    mtTxt(x, 'B = ' + cfg.f + ' \u00d7 ' + cfg.nc + ' \u00d7 ' + Math.log2(cfg.k) + ' = ' + bits.toLocaleString() + ' bits/s',
          22, 128, {size:11, col:MTC.a1});
    mtTxt(x, '= ' + (bits/1000).toFixed(2) + ' kbps, compression ' + ratio.toFixed(1) + '\u00d7',
          22, 148, {size:11, col:MTC.a4});
  } else {
    mtTxt(x, 'compute B and the compression ratio, then reveal', 22, 128, {size:10, col:MTC.muted});
  }

  mtTxt(x, 'BENCH THREE \u00b7 RESIDUAL QUANTIZATION BY HAND', 14, 186, {size:9, col:MTC.muted});
  const v = [0.8,-0.4,0.5];
  const cb1 = [[1,0,0],[0.6,-0.6,0],[0,0,1],[-1,0,0]];
  const cb2 = [[0.2,0.2,0.2],[0.2,-0.2,0.5],[-0.2,0,0.4],[0,0.4,-0.4]];
  const i1 = _txb.rvq[0], i2 = _txb.rvq[1];
  const r1 = [v[0]-cb1[i1][0], v[1]-cb1[i1][1], v[2]-cb1[i1][2]];
  const r2 = [r1[0]-cb2[i2][0], r1[1]-cb2[i2][1], r1[2]-cb2[i2][2]];
  const nrm = a => Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);
  const vs = a => '[' + a.map(q=>q.toFixed(2)).join(', ') + ']';
  mtTxt(x, 'z = ' + vs(v), 22, 208, {size:10, col:MTC.text});
  mtTxt(x, 'stage 1 pick ' + i1 + ':  residual ' + vs(r1) + '  norm ' + nrm(r1).toFixed(3), 22, 228, {size:9.5, col:MTC.muted});
  mtTxt(x, 'stage 2 pick ' + i2 + ':  residual ' + vs(r2) + '  norm ' + nrm(r2).toFixed(3), 22, 246, {size:9.5, col:MTC.muted});
  let best = Infinity, bi = 0, bj = 0;
  for(let a=0;a<4;a++) for(let b=0;b<4;b++){
    const q1 = [v[0]-cb1[a][0], v[1]-cb1[a][1], v[2]-cb1[a][2]];
    const q2 = [q1[0]-cb2[b][0], q1[1]-cb2[b][1], q1[2]-cb2[b][2]];
    if(nrm(q2) < best){ best = nrm(q2); bi = a; bj = b; }
  }
  let greedy = 0, gd = Infinity;
  for(let g=0;g<4;g++){
    const q = [v[0]-cb1[g][0], v[1]-cb1[g][1], v[2]-cb1[g][2]];
    if(nrm(q) < gd){ gd = nrm(q); greedy = g; }
  }
  mtTxt(x, 'greedy stage 1 would pick ' + greedy + '; best joint pair is (' + bi + ', ' + bj + ') at norm ' + best.toFixed(3),
        22, 270, {size:9.5, col:MTC.a5});
  mtSet('txb-cap',
    'Bench one: <b>' + (_txb.shown ? (bits/1000).toFixed(2)+' kbps, '+ratio.toFixed(1)+'\u00d7' : 'hidden') + '</b>. ' +
    'Bench three: your pair (' + i1 + ', ' + i2 + ') leaves residual norm <b>' + nrm(r2).toFixed(3) +
    '</b>, against the best joint pair (' + bi + ', ' + bj + ') at <b>' + best.toFixed(3) + '</b>. ' +
    (greedy === bi ? 'Here greedy agrees with the joint optimum.'
                   : 'Greedy and joint disagree, which is the price residual quantization pays for encoding one stage at a time.'));
}

/* ══════════════════════════════════════════════════════════════════
   CHAPTER 16 · TEXT-TO-SPEECH — SECTIONS, PAGES, DISPATCH
   ══════════════════════════════════════════════════════════════════ */

const TTS_SEC = [
  {id:'ttstask', num:'16.1',   title:'What a Modern Synthesizer Is Actually Asked to Do', icon:'\u25D1', desc:'Why the voice became an input, and the data arithmetic that forced the change.', tags:['zero-shot','enrollment']},
  {id:'ttsrate', num:'16.2',   title:'Turning a Waveform Into Symbols a Language Model Can Read', icon:'\u2337', desc:'Symbol rate against attention cost, with four treatments of the same clip you can hear.', tags:['token rate','bitrate']},
  {id:'ttssl',   num:'16.2.1', title:'Downsampling and Upsampling With Convolution Stacks', icon:'\u25BD', desc:'Stride products, output lengths, receptive fields, and why none of it compresses anything yet.', tags:['strided conv','receptive field']},
  {id:'ttscb',   num:'16.2.2', title:'Replacing a Vector With Its Nearest Codeword', icon:'\u25CE', desc:'Codebooks from k-means, and the exponent that makes one codebook hopeless in high dimensions.', tags:['vector quantization','distortion']},
  {id:'ttsrvq',  num:'16.2.3', title:'Quantizing What the First Codebook Missed', icon:'\u2211', desc:'Eight stages of residual quantization, audible one stage at a time.', tags:['residual VQ','bitrate']},
  {id:'ttsste',  num:'16.2.4', title:'Training Through a Non-Differentiable Step', icon:'\u2260', desc:'Four loss terms, and a backward pass that jumps a gap where no derivative exists.', tags:['straight-through','commitment loss']},
  {id:'ttslm',   num:'16.3',   title:'A Two-Stage Language Model Over Audio Codes', icon:'\u229E', desc:'One row generated left to right, seven rows generated all at once, and why that split works.', tags:['AR and NAR','code matrix']},
  {id:'ttseval', num:'16.4',   title:'Scoring Output That Only Ears Can Judge', icon:'\u2696', desc:'Listening panels, paired preference tests, and the two automatic metrics that fill the gaps.', tags:['MOS','speaker similarity']},
  {id:'ttsadj',  num:'16.5',   title:'Neighboring Tasks That Reuse the Same Front End', icon:'\u2442', desc:'Diarization, verification, language identification and wake words on one shared stack.', tags:['diarization','EER']},
  {id:'ttsslm',  num:'16.6',   title:'Models That Take Speech In and Give Speech Back', icon:'\u21C4', desc:'One vocabulary spanning both modalities, and the tasks that fall out of rearranging it.', tags:['spoken LMs','shared vocabulary']},
  {id:'ttsmap',  num:'16.7',   title:'One Spine, Traversed in Two Directions', icon:'\u25C9', desc:'The full path from text to waveform, with every parameter derived along the way.', tags:['recap','architecture']},
  {id:'ttshist', num:'16.8',   title:'Two and a Half Centuries of Building Voices', icon:'\u231A', desc:'Six research tracks from organ pipes to codec language models, and the gaps between them.', tags:['history','timeline']},
  {id:'ttsex',   num:'16.9',   title:'Test Yourself', icon:'\u270E', desc:'Bitrate arithmetic, stride design, residual quantization by hand, and metric matching.', tags:['exercises','practice']}
];

function buildTTSOverview(){
  const cards = TTS_SEC.map(s=>`
    <div class="sc-card" onclick="openTTSSec('${s.id}')">
      <div class="sc-arrow">&#8594;</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-num">${s.num}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-tags">${s.tags.map(t=>`<span class="sc-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <div class="lesson-chapter-label">Words Into Waveforms</div>
    <h1 class="lesson-h1">Text-to-Speech</h1>
    <p class="lesson-intro">Recognition has one correct answer and can be scored against it. Synthesis has an enormous set of acceptable answers, because the same sentence can be said at any pitch, any speed, in any voice, and all of them are right. The task only becomes trainable once it is narrowed, and the way modern systems narrow it is by making the voice an input: a few seconds of a speaker nobody trained on, supplied as a prompt. What remains is conditional generation over a sequence of discrete tokens, which is a problem language models already solve. The work here is producing those tokens. A codec compresses the waveform into a handful of integers per frame, a second codec stage quantizes what the first one missed, and a two-stage language model fills in the resulting matrix. The codec is built here rather than described, and you can hear each stage of it.</p>
    <div class="sc-grid">${cards}</div>
    <div class="ch-summary">
      <div class="ch-summary-label">Summary</div>
      <div class="ch-summary-items">
        <div class="ch-sum-item">Synthesis is conditional generation over audio tokens produced by a codec, with the target voice supplied as a prompt of encoded audio rather than learned into the weights.</div>
        <div class="ch-sum-item">Audio has to be discretized before a language model can touch it, and the binding constraint is rate rather than alphabet size, because attention cost grows with the square of sequence length.</div>
        <div class="ch-sum-item">A neural codec downsamples with strided convolutions, quantizes, and upsamples back through a mirrored decoder; the convolutional stage reorganizes the signal but does not compress it.</div>
        <div class="ch-sum-item">Vector quantization replaces a vector with the index of its nearest codeword, where the codebook comes from k-means, and distortion falls only as K to the power minus two over D.</div>
        <div class="ch-sum-item">Residual vector quantization repeats the operation on what the previous stage missed, reaching an effective capacity of K to the power Nc from Nc times K stored vectors.</div>
        <div class="ch-sum-item">The quantizer has no usable derivative, so the straight-through estimator copies the gradient across it unchanged and the codebook is maintained by separate commitment terms.</div>
        <div class="ch-sum-item">Generation splits along the residual hierarchy: the first quantizer row is autoregressive, the remaining rows are filled in parallel, one pass each.</div>
        <div class="ch-sum-item">Evaluation rests on listening panels, since no reference waveform exists; word error rate and speaker similarity each cover one failure mode and prosody is covered by neither.</div>
      </div>
    </div>`;
}

const TTS_PAGES = {};

/* ══ 16.1 WHAT A SYNTHESIZER IS ASKED TO DO ═══════════════ */
TTS_PAGES.ttstask = `
<div class="lesson-chapter-label">Section 16.1</div>
<h1 class="lesson-h1">What a Modern Synthesizer Is Actually Asked to Do</h1>
<p class="lesson-intro">A sentence can be spoken in many valid ways, with different voices, timing, and emphasis. Speech synthesis therefore has no single correct waveform for a text. Its training objective needs to account for more than sample-by-sample agreement with one recording.</p>

<h2 class="lesson-h2">Narrowing the Task by Fixing the Voice</h2>
<p class="lesson-p">The classical solution was to remove the variation by construction. Record hundreds of hours from one talker under controlled conditions, train a system on that talker alone, and the target becomes nearly deterministic. The cost is that the system produces exactly one voice, and a second voice requires a second collection.</p>
<p class="lesson-p">The modern arrangement inverts this. Train on tens of thousands of hours from thousands of speakers, and supply the target voice at generation time as a short recording. The system has never heard that speaker and will not be retrained for them, which is what the term <strong>zero-shot</strong> refers to.</p>
<div class="lesson-math">\\[\\hat{\\mathbf{x}}_{\\mathrm{audio}} \\sim p\\big(\\cdot \\mid \\mathbf{x},\\, \\mathbf{y}'\\big), \\qquad \\mathrm{speaker}(\\mathbf{y}') \\notin \\mathcal{D}_{\\mathrm{train}}\\]</div>
<p class="lesson-p">The arithmetic of the two arrangements crosses over at a point that is easy to compute. Let \\(H\\) be the studio hours needed per voice and \\(H_{\\mathrm{pool}}\\) the one-time pooled corpus.</p>
<div class="lesson-math">\\[\\mathrm{hours}_{\\mathrm{classical}}(V) = V \\cdot H, \\qquad \\mathrm{hours}_{\\mathrm{zero\\text{-}shot}}(V) = H_{\\mathrm{pool}} + V \\cdot \\frac{3}{3600}\\]</div>
<div class="lesson-math">\\[V^{*} = \\frac{H_{\\mathrm{pool}}}{H - 3/3600} \\approx \\frac{60000}{200} = 300\\]</div>
<p class="lesson-p">Below three hundred voices the studio approach uses less recorded audio in total. That number is the less interesting half of the comparison. The decisive difference is not the total but the marginal case: the pooled model can speak in a voice that was never recorded for it, and no amount of studio time gives the single-talker system that ability.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Voice Budget</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="tvb-ctrl"></div>
    <canvas id="tvb-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tvb-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">What the Prompt Has To Carry</h2>
<p class="lesson-p">Three seconds is a small amount of audio, and it has to convey everything about the voice that should persist: vocal tract length, pitch range, breathiness, speaking rate, and whatever else distinguishes one speaker from another. It cannot convey the content, since the content comes from the text. The separation is not enforced by any explicit mechanism. It emerges because the model was trained on many speakers saying many different things, so nothing about a particular speaker predicts the words and nothing about the words predicts the speaker.</p>
<p class="lesson-p">Once the voice is conditioning rather than a property of the weights, the remaining task has a familiar shape: generate a sequence given a prefix.</p>
<div class="lesson-math">\\[p(\\mathbf{c}_{1:T} \\mid \\mathbf{x}, \\mathbf{C}^{P}) = \\prod_{t=1}^{T} p(\\mathbf{c}_t \\mid \\mathbf{c}_{&lt;t}, \\mathbf{x}, \\mathbf{C}^{P})\\]</div>
<p class="lesson-p">This is next-token prediction with two conditioning streams. Everything in the next several sections exists to make \\(\\mathbf{c}_t\\) into something a language model can predict, because a waveform in its raw form is not.</p>

<div class="quiz-block" id="qts-tk"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A system trained on 60,000 hours from 7,000 talkers reads a sentence in the voice of someone who supplied three seconds of audio. What makes this work?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-tk','No gradient step happens at generation time. Fine-tuning on three seconds would overfit immediately and would cost a training run per voice, which is the expense the design removes.')">The three seconds are used to fine-tune the weights before generating</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-tk','Correct. The enrollment audio is tokenized and placed in the prompt, so the voice is conditioning rather than a parameter. The marginal cost of a new voice is three seconds, not a training run.')">The voice is supplied as conditioning input at generation time rather than learned into the weights</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-tk','The output is not restricted to the training voices. If it were, the system could not produce a speaker it had never heard, which is the whole capability being described.')">The system finds the nearest of the 7,000 training talkers and substitutes that voice</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-tk','The prompt conditions generation; it is not spliced onto the output. The generated audio is new signal throughout.')">The three seconds are concatenated onto the front of the output waveform</button>
</div><div class="quiz-explain" id="qts-tk-explain"></div></div>`;

/* ══ 16.2 TOKEN RATE ══════════════════════════════════════ */
TTS_PAGES.ttsrate = `
<div class="lesson-chapter-label">Section 16.2</div>
<h1 class="lesson-h1">Turning a Waveform Into Symbols a Language Model Can Read</h1>
<p class="lesson-intro">A language model consumes a sequence of discrete symbols. Digital audio is already a sequence of discrete symbols, so at first glance nothing needs doing. The obstacle is not discreteness. It is rate, and the way rate interacts with attention.</p>

<h2 class="lesson-h2">The Alphabet Is Fine, the Rate Is Not</h2>
<p class="lesson-p">Sixteen bit audio sampled at 16 kHz is a sequence over an alphabet of 65,536 values, arriving 16,000 times a second. The alphabet is comparable to a large subword vocabulary and presents no difficulty. The rate is the problem, and it enters the cost squared, because self-attention compares every position with every other position.</p>
<div class="lesson-math">\\[|\\Sigma| = 2^{16} = 65{,}536, \\qquad f = 16{,}000 \\text{ symbols per second}\\]</div>
<div class="lesson-math">\\[\\tau = f\\,S \\;\\Longrightarrow\\; \\text{attention cost} = O(\\tau^{2}) = O(f^{2}S^{2})\\]</div>
<p class="lesson-p">Comparing thirty seconds of audio at the raw rate against the same thirty seconds at a codec rate makes the size of the gap concrete:</p>
<div class="lesson-math">\\[\\frac{(16000 \\cdot 30)^{2}}{(75 \\cdot 30)^{2}} = \\left(\\frac{16000}{75}\\right)^{2} \\approx 4.6\\times10^{4}\\]</div>
<p class="lesson-p">Forty six thousand times more attention for the same audio. Storage is not the motivation here and never was; a thirty second clip is a trivial file. The motivation is that a transformer cannot attend over half a million positions, and reducing the rate is the only lever that helps quadratically.</p>

<h2 class="lesson-h2">What a Discrete Tokenizer Costs</h2>
<p class="lesson-p">Once a rate is chosen, the remaining quantity is the bitrate, which follows from the number of codebooks and their size. Each frame emits \\(N_c\\) indices, each costing \\(\\log_2 K\\) bits.</p>
<div class="lesson-math">\\[B = f \\cdot N_c \\cdot \\log_2 K \\quad \\text{bits per second}\\]</div>
<p class="lesson-p">The ladder below places five representations on one axis. The playback buttons run the actual signal through each treatment, so the audible cost of each rate reduction is available rather than asserted. The codec row is the working codec built in these sections, not a recording of one.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Token Rate Ladder</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="ttr-ctrl"></div>
    <canvas id="ttr-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="ttr-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The codec running in this page operates at 500 tokens per second and 24 kbps rather than the 75 Hz and 6 kbps of a production system. The reason is stated plainly in the sections that follow: its encoder is a fixed transform rather than a learned convolutional stack, and a fixed transform cannot afford a 320-fold reduction without destroying the signal. The equations throughout use the production numbers; the widgets report their own.</p>

<div class="quiz-block" id="qts-rt"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Halving the token rate has what effect on the cost of self-attention over a fixed duration of audio?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-rt','Halving would be right if attention were linear in sequence length. It compares every position against every other, so the relationship is quadratic.')">It halves it</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-rt','Correct. Sequence length is proportional to rate and attention is quadratic in length, so cost scales with the square. This is why a single strided convolutional layer with stride 2 removes three quarters of the attention cost.')">It quarters it</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-rt','Rate directly sets sequence length for a fixed duration, so cost cannot be independent of it.')">It leaves it unchanged</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-rt','This inverts the exponent. Cost grows as the square of length, so halving length divides cost by four rather than by the square root of two.')">It reduces it by a factor of the square root of two</button>
</div><div class="quiz-explain" id="qts-rt-explain"></div></div>`;

/* ══ 16.2.1 CONVOLUTION STACKS ════════════════════════════ */
TTS_PAGES.ttssl = `
<div class="lesson-chapter-label">Section 16.2.1</div>
<h1 class="lesson-h1">Downsampling and Upsampling With Convolution Stacks</h1>
<p class="lesson-intro">The rate reduction is done by convolution with stride. A block reads a window of the input, steps forward by more than one sample, and emits one vector, so its output is shorter than its input by the stride. Stacking four such blocks multiplies their strides together, which is how a factor of 320 is reached without any single layer doing anything drastic.</p>

<h2 class="lesson-h2">Layer Arithmetic</h2>
<p class="lesson-p">One layer, with kernel width \\(k_l\\), padding \\(p\\) and stride \\(s_l\\):</p>
<div class="lesson-math">\\[n_l = \\left\\lfloor \\frac{n_{l-1} + 2p - k_l}{s_l} \\right\\rfloor + 1\\]</div>
<p class="lesson-p">Codec encoders tie kernel width to twice the stride, \\(k = 2s\\), so consecutive windows overlap by half and every input sample influences at least one output. Four blocks with strides 2, 4, 5 and 8 give:</p>
<div class="lesson-math">\\[\\prod_l s_l = 2 \\cdot 4 \\cdot 5 \\cdot 8 = 320, \\qquad \\frac{24000}{320} = 75\\ \\mathrm{Hz}\\]</div>
<p class="lesson-p">One embedding every 13.3 milliseconds. The receptive field, meaning how much of the original waveform a single output vector actually sees, grows much faster than the kernel widths suggest, because each layer inherits the accumulated stride of everything beneath it.</p>
<div class="lesson-math">\\[R_L = 1 + \\sum_{l=1}^{L}(k_l - 1)\\prod_{j&lt;l} s_j\\]</div>
<p class="lesson-p">A stack of narrow kernels ends up looking at a long span. That is the point: no individual layer needs a wide kernel, and the parameter count stays small while the effective window becomes large enough to cover a phone.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Stride Ladder</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="tsl-ctrl"></div>
    <canvas id="tsl-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tsl-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">The Decoder Is the Encoder Reflected</h2>
<p class="lesson-p">Transposed convolutions with the same strides expand the sequence back to 24 kHz. Inside each block, residual units add the block input to its output, so a block can learn a small correction rather than an entire transformation.</p>
<div class="lesson-math">\\[\\mathbf{u}^{(l)} = \\mathbf{u}^{(l-1)} + f_2\\big(f_1(\\mathbf{u}^{(l-1)})\\big)\\]</div>

<h2 class="lesson-h2">Nothing Has Been Compressed Yet</h2>
<p class="lesson-p">This is the part that is easy to misread. Twenty four thousand 16 bit samples have become 75 vectors of 256 floating point values. Counting bits:</p>
<div class="lesson-math">\\[\\underbrace{24000 \\times 16}_{384{,}000 \\text{ bits/s}} \\;\\longrightarrow\\; \\underbrace{75 \\times 256 \\times 32}_{614{,}400 \\text{ bits/s}}\\]</div>
<p class="lesson-p">The representation got larger. The encoder buys structure rather than size: it produces vectors that lie on a low-dimensional manifold a quantizer can cover, at a rate a transformer can attend over. Compression arrives only when those vectors are replaced by integers, which is the next section.</p>

<div class="quiz-block" id="qts-sl"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Four blocks with strides 2, 4, 5 and 8 are applied to a 24 kHz waveform. What is the output rate, and has the representation been compressed?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-sl','The rate is right but the second half is not. Each of those 75 vectors carries 256 floats, which is more bits per second than the waveform it replaced.')">75 Hz, and yes, compressed by a factor of 320</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-sl','Correct. The strides multiply to 320 giving 75 Hz, but 75 vectors of 256 floats is about 614 kbps against the original 384 kbps. The convolutional stage reorganizes the signal; the quantizer compresses it.')">75 Hz, but no: the embeddings occupy more bits than the samples did</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-sl','This would follow from adding the strides rather than multiplying them. Each layer divides the length of whatever reaches it, so the reductions compound.')">19 Hz, compressed by a factor of 1280</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-sl','Kernel width affects the receptive field and the edge behaviour, not the rate. Only the strides set the output rate.')">320 Hz, and compression depends on the kernel widths</button>
</div><div class="quiz-explain" id="qts-sl-explain"></div></div>`;

/* ══ 16.2.2 VECTOR QUANTIZATION ═══════════════════════════ */
TTS_PAGES.ttscb = `
<div class="lesson-chapter-label">Section 16.2.2</div>
<h1 class="lesson-h1">Replacing a Vector With Its Nearest Codeword</h1>
<p class="lesson-intro">Vector quantization replaces a vector with the index of a nearby codebook entry. Encoding finds an entry; decoding looks it up. The table is fixed during an encoding pass but can be learned during codec training.</p>

<div class="lesson-math">\\[q_t = \\arg\\min_{k \\in \\{1,\\dots,K\\}} \\big\\|\\mathbf{z}_t - \\mathbf{e}_k\\big\\|^2, \\qquad \\mathbf{z}_{q_t} = \\mathbf{e}_{q_t}\\]</div>

<h2 class="lesson-h2">Where the Codebook Comes From</h2>
<p class="lesson-p">The codebook is built by k-means over encoder outputs from a large amount of audio: the same two step algorithm used to induce acoustic units for self-supervised speech models. Assignment puts every vector with its nearest centroid, re-estimation moves each centroid to the mean of what it received, and both steps lower the same objective.</p>
<div class="lesson-math">\\[J = \\sum_{i=1}^{N} \\big\\|\\mathbf{v}^{(i)} - \\boldsymbol\\mu_{\\mathrm{cluster}(i)}\\big\\|^2\\]</div>
<p class="lesson-p">During end to end training the centroids cannot be recomputed over the whole corpus at every gradient step, so they are maintained online with running counts and sums.</p>
<div class="lesson-math">\\[n_k \\leftarrow \\gamma n_k + (1-\\gamma)|S_k|, \\quad \\mathbf{m}_k \\leftarrow \\gamma \\mathbf{m}_k + (1-\\gamma)\\!\\!\\sum_{\\mathbf{z}\\in S_k}\\!\\!\\mathbf{z}, \\quad \\mathbf{e}_k = \\frac{\\mathbf{m}_k}{n_k}\\]</div>

<h2 class="lesson-h2">Why One Codebook Cannot Be Enough</h2>
<p class="lesson-p">The error a quantizer makes depends on how densely codewords fill the space. Expected squared error is the integral of the distance to the assigned codeword, taken over each cell of the partition.</p>
<div class="lesson-math">\\[\\mathbb{E}\\big[\\|\\boldsymbol\\varepsilon\\|^2\\big] = \\sum_{k=1}^{K}\\int_{V_k}\\|\\mathbf{z}-\\mathbf{e}_k\\|^2 p(\\mathbf{z})\\,d\\mathbf{z}, \\qquad V_k = \\{\\mathbf{z} : \\|\\mathbf{z}-\\mathbf{e}_k\\| \\le \\|\\mathbf{z}-\\mathbf{e}_j\\|\\ \\forall j\\}\\]</div>
<p class="lesson-p">At high rates this has a well known asymptotic form, and the exponent is what matters:</p>
<div class="lesson-math">\\[\\mathbb{E}\\big[\\|\\boldsymbol\\varepsilon\\|^2\\big] \\;\\propto\\; K^{-2/D}\\]</div>
<p class="lesson-p">Solve for the codebook growth needed to halve the error:</p>
<div class="lesson-math">\\[\\tfrac{1}{2} = \\left(\\tfrac{K'}{K}\\right)^{-2/D} \\;\\Longrightarrow\\; K' = K \\cdot 2^{D/2}\\]</div>
<p class="lesson-p">At \\(D = 256\\) that factor is \\(2^{128}\\). There is no codebook size that fixes this, and the failure is not a shortcoming of k-means but a property of covering high dimensional space with a finite set of points. The instrument below shows the exponent biting on real data: five codebook sizes, each trained by an honest k-means run, with the measured distortion for each.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Codebook Lookup</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="tcl-ctrl"></div>
    <canvas id="tcl-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tcl-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Sixteen times the codewords does not buy sixteen times less error, or anything close to it. The way out is not a bigger table. It is to use the table repeatedly.</p>

<div class="quiz-block" id="qts-cb"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why does growing the codebook from 64 to 1024 codewords fail to solve reconstruction for 256 dimensional embeddings?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-cb','k-means converges fine at these sizes; it is guaranteed to converge for any k because both steps are non-increasing in the same objective. The obstacle is geometric, not algorithmic.')">k-means stops converging above a few hundred clusters</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-cb','Correct. With D = 256 the exponent is minus one over 128, so multiplying K by sixteen multiplies the distortion by about 0.98. Codebook size is the wrong knob entirely.')">Distortion falls as K to the power minus two over D, so at D = 256 even large increases in K barely move the error</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-cb','Index width is a storage detail and 1024 fits in ten bits regardless. Nothing about the reconstruction quality depends on how the index is packed.')">The index no longer fits in a single byte</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-cb','Normalization changes the shape of the distribution being covered but not the exponent, which depends only on the dimension.')">The encoder output is not normalized before quantization</button>
</div><div class="quiz-explain" id="qts-cb-explain"></div></div>`;

/* ══ 16.2.3 RESIDUAL VQ ═══════════════════════════════════ */
TTS_PAGES.ttsrvq = `
<div class="lesson-chapter-label">Section 16.2.3</div>
<h1 class="lesson-h1">Quantizing What the First Codebook Missed</h1>
<p class="lesson-intro">Residual quantization repeats the process on the error left by earlier codebooks. Each stage refines the reconstruction, at the cost of more bits. Try several stages and listen to the difference; the number used depends on the codec and bitrate.</p>

<div class="lesson-math">\\[\\mathbf{r}^{(0)}_t = \\mathbf{z}_t, \\qquad q_{t,i} = \\arg\\min_{k}\\big\\|\\mathbf{r}^{(i-1)}_t - \\mathbf{e}^{(i)}_k\\big\\|^2, \\qquad \\mathbf{r}^{(i)}_t = \\mathbf{r}^{(i-1)}_t - \\mathbf{e}^{(i)}_{q_{t,i}}\\]</div>
<p class="lesson-p">Written for the first stage alone, which is the form the residual is usually defined in:</p>
<div class="lesson-math">\\[\\mathrm{residual} = \\mathbf{z}_t - \\mathbf{z}^{(1)}_{q\\,t}\\]</div>
<p class="lesson-p">Reconstruction requires no machinery. The chosen codewords are added together.</p>
<div class="lesson-math">\\[\\mathbf{z}_{q_t} = \\sum_{i=1}^{N_c} \\mathbf{e}^{(i)}_{q_{t,i}}, \\qquad \\mathbf{z}_t - \\mathbf{z}_{q_t} = \\mathbf{r}^{(N_c)}_t\\]</div>

<h2 class="lesson-h2">Why the Error Falls</h2>
<p class="lesson-p">Each stage fits its codebook by k-means to the distribution of residuals the previous stage left behind, so what falls stage by stage is the <em>mean</em> squared residual, taken over the training distribution:</p>
<div class="lesson-math">\\[\\mathbb{E}\\big[\\|\\mathbf{r}^{(i)}\\|^2\\big] \\;\\le\\; \\mathbb{E}\\big[\\|\\mathbf{r}^{(i-1)}\\|^2\\big]\\]</div>
<p class="lesson-p">It is worth being precise that this is an expectation and not a promise about every vector. For one particular \\(\\mathbf{r}^{(i-1)}_t\\), the nearest codeword can sit further from it than the origin does, and then the norm goes <em>up</em>. That happens when a residual is already far smaller than the typical codeword the stage was fitted to, so every entry in the book overshoots it. The codec running in this page does exactly this on about one stage transition in forty; adding the zero vector to every codebook would buy back the per-vector guarantee at the cost of one wasted index. In practice the decay of the average is close to geometric, \\(\\|\\mathbf{r}^{(i)}\\| \\approx \\rho^{i}\\|\\mathbf{z}\\|\\) with \\(\\rho &lt; 1\\). The capacity this reaches is the part worth pausing on:</p>
<div class="lesson-math">\\[K^{N_c} = 1024^{8} = 2^{80} \\quad \\text{reachable states, from} \\quad N_c K = 8192 \\text{ stored vectors}\\]</div>
<p class="lesson-p">Eight thousand vectors in memory addressing eighty bits of distinguishable states. A single codebook with that reach would need \\(2^{80}\\) entries, which is why the previous section's exponent stopped being an obstacle: the dimension did not change, but the number of codewords needed at each stage did.</p>
<div class="lesson-math">\\[B = 75 \\times 8 \\times 10 = 6000 \\text{ bits/s} = 6\\ \\mathrm{kbps}\\]</div>
<p class="lesson-p">Against 384 kbps for the original waveform, a factor of 64. And because the stages are ordered by how much they contribute, truncating to the first \\(m\\) of them yields a valid lower-rate stream with no retraining:</p>
<div class="lesson-math">\\[B_m = 75 \\times m \\times 10, \\qquad m \\le N_c\\]</div>
<p class="lesson-p">Bitrate becomes a dial rather than a design decision. That same ordering is what the generation architecture in the next section is built around: the first stage carries most of what the signal is, and the later ones carry refinements.</p>

<h2 class="lesson-h2">The Cascade, Running</h2>
<p class="lesson-p">Everything below is computed in the page. The codebooks were trained by k-means on a synthetic speech corpus, the demonstration utterance is encoded through all eight stages, and the reconstruction is decoded and played at whatever stage count is selected. Signal to noise ratio is measured against the original waveform. Listen at one stage, then at eight.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Residual Cascade</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="trc-ctrl"></div>
    <canvas id="trc-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="trc-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Greedy residual quantization chooses the nearest codeword at each stage. The locally best sequence of choices need not give the best combined reconstruction. Exhaustive search over \\(K^{N_c}\\) combinations is usually too costly; the exercises show a small case where greedy and exhaustive search disagree.</p>

<div class="quiz-block" id="qts-rv"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Residual quantization with 8 codebooks of 1024 entries stores 8192 vectors. How many distinct reconstructions can it produce?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-rv','That is the number of vectors held in memory, not the number of outputs. Each stage chooses independently, so the choices multiply rather than add.')">8192, one per stored codeword</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-rv','This adds the stages instead of multiplying them. Eight independent choices from 1024 options each give a product, not a sum.')">1024 times 8, so 8192</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-rv','Correct. 1024 to the eighth is 2 to the eightieth. The greedy encoder will not find the best of those combinations, and that gap between reachable and findable is what residual quantization trades for speed.')">1024 to the power 8, roughly 10 to the 24th</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-rv','The dimension governs how well those reconstructions cover the space, but the count of distinct sums depends only on the number of stages and the codebook size.')">It depends on D and cannot be determined from these numbers</button>
</div><div class="quiz-explain" id="qts-rv-explain"></div></div>`;

/* ══ 16.2.4 TRAINING ══════════════════════════════════════ */
TTS_PAGES.ttsste = `
<div class="lesson-chapter-label">Section 16.2.4</div>
<h1 class="lesson-h1">Training Through a Non-Differentiable Step</h1>
<p class="lesson-intro">The codec is trained end to end as an autoencoder: waveform in, the same waveform out, quantizer in the middle. Two things make this harder than the description suggests. The loss cannot be a single term, and the middle of the network has no usable derivative.</p>

<h2 class="lesson-h2">Four Losses, Because One Is Not Enough</h2>
<p class="lesson-p">Sample by sample difference is the obvious reconstruction term. On its own it produces output that scores well and sounds wrong, because two waveforms can differ substantially point by point and be perceptually identical, while two that differ slightly in the wrong way can sound broken.</p>
<div class="lesson-math">\\[L_{\\mathrm{reconstruction}}(\\mathbf{x}, \\hat{\\mathbf{x}}) = \\sum_{t=1}^{T}\\|x_t - \\hat{x}_t\\|^2\\]</div>
<p class="lesson-p">A spectral term computed at several window lengths repairs part of this, since it compares energy distributions rather than sample values, and different window sizes catch different time scales.</p>
<div class="lesson-math">\\[L_{\\mathrm{spec}} = \\sum_{s \\in \\mathcal{S}}\\Big(\\big\\|\\mathcal{M}_s(\\mathbf{x}) - \\mathcal{M}_s(\\hat{\\mathbf{x}})\\big\\|_1 + \\big\\|\\mathcal{M}_s(\\mathbf{x}) - \\mathcal{M}_s(\\hat{\\mathbf{x}})\\big\\|_2\\Big)\\]</div>
<p class="lesson-p">An adversarial term supplies what neither of the above can: a learned judgement of whether the output sounds like speech at all.</p>
<div class="lesson-math">\\[L_D = \\mathbb{E}\\big[\\max(0, 1 - D(\\mathbf{x}))\\big] + \\mathbb{E}\\big[\\max(0, 1 + D(\\hat{\\mathbf{x}}))\\big], \\qquad L_{\\mathrm{GAN}} = \\mathbb{E}\\big[\\max(0, 1 - D(\\hat{\\mathbf{x}}))\\big]\\]</div>
<p class="lesson-p">And a quantizer term keeps the codebook and the encoder in contact with each other.</p>
<div class="lesson-math">\\[L_{\\mathrm{VQ}}(\\mathbf{x},\\hat{\\mathbf{x}}) = \\sum_{t=1}^{T}\\sum_{c=1}^{N_c}\\big\\|\\mathbf{z}^{(c)}_t - \\mathbf{z}^{(c)}_{q\\,t}\\big\\|\\]</div>
<p class="lesson-p">That last term does two jobs which pull in opposite directions, so it is split with a stop gradient, letting each half act on one side only.</p>
<div class="lesson-math">\\[\\underbrace{\\big\\|\\mathrm{sg}[\\mathbf{z}_t] - \\mathbf{e}\\big\\|^2}_{\\text{moves the codeword}} + \\beta \\underbrace{\\big\\|\\mathbf{z}_t - \\mathrm{sg}[\\mathbf{e}]\\big\\|^2}_{\\text{moves the encoder}}\\]</div>
<div class="lesson-math">\\[L(\\mathbf{x},\\hat{\\mathbf{x}}) = \\lambda_1 L_{\\mathrm{reconstruction}} + \\lambda_2 L_{\\mathrm{GAN}} + \\lambda_3 L_{\\mathrm{VQ}}\\]</div>

<h2 class="lesson-h2">The Derivative That Does Not Exist</h2>
<p class="lesson-p">The quantizer selects an index by argmin. That function is piecewise constant: nudging the input leaves the selected index unchanged everywhere except on the boundaries between cells, where it jumps.</p>
<div class="lesson-math">\\[q_t = \\arg\\min_k \\|\\mathbf{z}_t - \\mathbf{e}_k\\|^2 \\qquad \\Longrightarrow \\qquad \\frac{\\partial q_t}{\\partial \\mathbf{z}_t} = 0 \\ \\text{ almost everywhere}\\]</div>
<p class="lesson-p">Backpropagation reaches the quantizer and stops. The decoder trains, the encoder receives nothing, and nothing upstream of the quantizer ever improves. The repair is to rewrite the quantizer output using a stop gradient in a way that changes nothing in the forward direction:</p>
<div class="lesson-math">\\[\\mathbf{z}_{q_t} := \\mathbf{z}_t + \\mathrm{sg}\\big[\\mathbf{z}_{q_t} - \\mathbf{z}_t\\big]\\]</div>
<p class="lesson-p">Evaluated forward, the added term is exactly the difference, so the result is \\(\\mathbf{z}_{q_t}\\) as before. Differentiated, the bracketed term contributes nothing and the gradient passes through the first term untouched:</p>
<div class="lesson-math">\\[\\frac{\\partial L}{\\partial \\mathbf{z}_t} := \\frac{\\partial L}{\\partial \\mathbf{z}_{q_t}}\\]</div>
<p class="lesson-p">This is not the derivative of anything. It is a substitute, justified by the fact that the quantizer output is close to its input, so treating the step as the identity points the encoder in approximately the right direction. It works well enough that nearly every discrete bottleneck in deep learning uses it.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Gradient Detour</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="tgd-ctrl"></div>
    <canvas id="tgd-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tgd-cap" style="${MTCAP}"></div>
  </div>
</div>

<div class="quiz-block" id="qts-st"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does the straight-through estimator compute?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-st','No chain rule derivation produces it, because the function it stands in for has a zero derivative almost everywhere and an undefined one on the boundaries.')">The exact gradient of the quantizer, obtained by the chain rule</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-st','A finite difference would still measure the true function, which is flat almost everywhere and would return zero. No sampling scheme recovers a useful signal from a piecewise constant map.')">A finite difference approximation to the quantizer gradient</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-st','Correct. The forward pass is exact and the backward pass is a deliberate fiction: the gradient is copied across as though the quantizer were the identity. It works because the output is close to the input.')">No gradient of the quantizer at all: it copies the incoming gradient across as if the quantizer were the identity</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-st','That is the codebook term, which is a separate part of the loss. The straight-through estimator concerns how gradient reaches the encoder, not how codewords are updated.')">The gradient of the codebook loss with respect to the codewords</button>
</div><div class="quiz-explain" id="qts-st-explain"></div></div>`;

/* ══ 16.3 TWO-STAGE LM ════════════════════════════════════ */
TTS_PAGES.ttslm = `
<div class="lesson-chapter-label">Section 16.3</div>
<h1 class="lesson-h1">A Two-Stage Language Model Over Audio Codes</h1>
<p class="lesson-intro">The codec turns a waveform into a matrix rather than a sequence: one column per time step, one row per quantizer stage. Generation has to fill that matrix given the text and a voice prompt, and the shape of the matrix suggests how.</p>

<div class="lesson-math">\\[\\mathbf{C}^{T \\times 8} = \\mathrm{Codec}(\\mathbf{y})\\]</div>
<p class="lesson-p">Row \\(\\mathbf{c}_{t,:}\\) holds the eight codes for frame \\(t\\); column \\(\\mathbf{c}_{:,j}\\) holds the whole sequence coming from quantizer \\(j\\). Training maximizes the likelihood of the matrix given the text.</p>
<div class="lesson-math">\\[L = -\\log p(\\mathbf{C} \\mid \\mathbf{x}) = -\\log \\prod_{t=0}^{T} p(\\mathbf{c}_{t,:} \\mid \\mathbf{c}_{&lt;t,:},\\, \\mathbf{x})\\]</div>

<h2 class="lesson-h2">The Stages Are Not Equals</h2>
<p class="lesson-p">The residual cascade already showed the asymmetry: the first quantizer carries most of the signal and the later ones carry refinements. That asymmetry is exploited directly. The first row gets an autoregressive model, and the remaining seven get a non-autoregressive one that fills an entire row in a single pass.</p>
<div class="lesson-math">\\[L_{\\mathrm{AR}} = -\\log p(\\mathbf{c}_{:,1} \\mid \\mathbf{x};\\theta_{\\mathrm{AR}}) = -\\sum_{t}\\log p(c_{t,1} \\mid \\mathbf{c}_{&lt;t,1}, \\mathbf{x};\\theta_{\\mathrm{AR}})\\]</div>
<div class="lesson-math">\\[L_{\\mathrm{NAR}} = -\\sum_{j=2}^{8}\\log p\\big(\\mathbf{c}_{>T',j} \\mid \\mathbf{x},\\, \\mathbf{C}_{:T',:},\\, \\mathbf{C}_{>T',&lt;j};\\theta_{\\mathrm{NAR}}\\big)\\]</div>
<p class="lesson-p">Read the conditioning set of the second expression carefully. Row \\(j\\) depends on the text, on the acoustic prompt, and on every row above it. It does not depend on anything else inside row \\(j\\). That absence is precisely the condition under which parallel generation is valid, so all positions in the row can be produced simultaneously, attending freely in both directions along the time axis.</p>

<h2 class="lesson-h2">What the Split Saves</h2>
<div class="lesson-math">\\[\\text{single AR model over all rows: } 8T \\text{ sequential steps}\\]</div>
<div class="lesson-math">\\[\\text{AR first row, NAR remainder: } T + 7 \\text{ steps}\\]</div>
<p class="lesson-p">For a ten second clip at 75 Hz that is 750 plus 7 rather than 6000: close to an eightfold reduction in the number of sequential decoder invocations, which is what wall clock latency is made of.</p>
<div class="lesson-math">\\[\\mathbf{C}^T = \\arg\\max_{\\mathbf{C}^T} p(\\mathbf{C}^T \\mid \\mathbf{C}^P, \\mathbf{x}) = \\arg\\max_{\\mathbf{C}^T}\\prod_{t=T'+1}^{T} p(\\mathbf{c}_{t,:} \\mid \\mathbf{c}_{&lt;t,:}, \\mathbf{x})\\]</div>
<p class="lesson-p">The prompt \\(\\mathbf{C}^P\\) is the enrolled speaker's audio, tokenized by the same codec and placed in front of the region to be generated. The model continues it. Speaker identity is carried by nothing more elaborate than that prefix, which is why a new voice costs three seconds and no training.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Code Matrix Filler</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="tcm-ctrl"></div>
    <canvas id="tcm-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tcm-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The cell values are real codes taken from the codec running in this page. Run the first row and watch the cursor advance one cell at a time; then run the non-autoregressive passes and watch whole rows appear at once. The mask panel changes with them, from lower triangular to fully populated.</p>

<div class="quiz-block" id="qts-lm"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Why can rows two through eight be generated non-autoregressively when row one cannot?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-lm','They do carry less information, but that would only justify a smaller model, not a parallel one. Parallelism requires an absence of dependence, not an absence of importance.')">Those rows carry less information, so errors in them do not matter</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-lm','Correct. Conditioning runs downward across rows and outward from the prompt, never sideways within a row. With no within-row dependence, every position in the row can be produced at once.')">No cell in a given row is conditioned on any other cell in that same row</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-lm','Model size is unrelated. A larger model with the same sequential dependencies would still have to generate one position at a time.')">The non-autoregressive model is larger and can afford to guess</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-lm','The prompt conditions those rows but does not supply them. They are generated, and they differ from the prompt because the content differs.')">Those rows are copied directly from the enrolled prompt</button>
</div><div class="quiz-explain" id="qts-lm-explain"></div></div>`;

/* ══ 16.4 EVALUATION ══════════════════════════════════════ */
TTS_PAGES.ttseval = `
<div class="lesson-chapter-label">Section 16.4</div>
<h1 class="lesson-h1">Scoring Output That Only Ears Can Judge</h1>
<p class="lesson-intro">There are many acceptable waveforms for the same text, so exact agreement with a reference is not enough to judge synthesis. Human listeners assess naturalness and voice similarity; automatic metrics measure related properties such as intelligibility.</p>

<h2 class="lesson-h2">Asking People</h2>
<p class="lesson-p">Listeners rate clips on a five point scale and the ratings are averaged. The interval around that average narrows only as the square root of the number of ratings.</p>
<div class="lesson-math">\\[\\overline{\\mathrm{MOS}} = \\frac{1}{n}\\sum_{i=1}^{n} r_i, \\qquad \\mathrm{CI}_{95} = \\overline{\\mathrm{MOS}} \\pm 1.96\\,\\frac{s}{\\sqrt{n}}\\]</div>
<p class="lesson-p">Separating two systems that differ by a tenth of a point therefore takes a large panel, and most reported differences of that size are not supported by the sample sizes used to obtain them.</p>
<p class="lesson-p">When the question is specifically whether one system beats another, the same sentences are played from both and listeners state a preference. The pairing matters more than it appears to.</p>
<div class="lesson-math">\\[d_i = r^A_i - r^B_i, \\qquad t = \\frac{\\bar{d}}{s_d/\\sqrt{n}}, \\qquad \\mathrm{df} = n-1\\]</div>
<div class="lesson-math">\\[\\mathrm{Var}(d) = \\sigma_A^2 + \\sigma_B^2 - 2\\rho\\,\\sigma_A\\sigma_B\\]</div>
<p class="lesson-p">When the paired scores have positive correlation \\(\\rho\\), the variance of their difference is smaller than in an unpaired comparison. This often happens because difficult sentences challenge both systems. Positive correlation is useful here, but it is an empirical property, not a guarantee.</p>
<div class="lesson-math">\\[\\mathrm{CMOS} \\in [-3, 3], \\qquad H_0: \\mu_{\\mathrm{CMOS}} = 0\\]</div>

<h2 class="lesson-h2">What Machines Can Check</h2>
<p class="lesson-p">Two automatic measurements add information cheaply. Running the output through a recognizer and scoring the transcript catches words that came out wrong. Comparing speaker embeddings catches a voice that drifted away from the enrollment.</p>
<div class="lesson-math">\\[\\mathrm{WER} = 100 \\times \\frac{I+S+D}{N_{\\mathrm{ref}}}, \\qquad \\mathrm{ref} = \\mathbf{x}, \\quad \\mathrm{hyp} = \\mathcal{R}(\\hat{\\mathbf{x}})\\]</div>
<div class="lesson-math">\\[\\mathrm{SIM} = \\frac{\\phi(\\mathbf{y}')\\cdot\\phi(\\hat{\\mathbf{x}})}{\\|\\phi(\\mathbf{y}')\\|\\,\\|\\phi(\\hat{\\mathbf{x}})\\|}\\]</div>
<p class="lesson-p">Neither sees what the other sees, and between them they still miss things. A clip can be perfectly intelligible in the wrong voice, or perfectly on-voice while mangling a name. Prosody that is flat and lifeless passes both without complaint, and no widely agreed automatic measure of it exists.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Listening Bench</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="tlb-ctrl"></div>
    <canvas id="tlb-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tlb-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The similarity tab computes real cosines between spectral profiles of the enrolled and generated audio, using the codec in this page at whatever stage count is chosen. The recognizer tab works a fixed alignment by hand rather than running recognition in the browser, and is labelled as such.</p>

<div class="quiz-block" id="qts-ev"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A system scores 4.4 MOS and 2% word error rate, and listeners still reject it. What do those two numbers fail to measure?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-ev','Bitrate is a property of the codec, not of perceived quality, and a system can be excellent or terrible at any bitrate.')">The bitrate of the underlying codec</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-ev','Correct. Word error rate only sees the words and MOS compresses everything into one number that listeners apply inconsistently. Speaker similarity covers the voice; prosody has no agreed automatic metric at all.')">Whether the output is in the requested voice, and whether the prosody is appropriate</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-ev','Sample rate is fixed by the system and reported separately. It constrains bandwidth but says nothing about whether a given clip is acceptable.')">The sample rate of the output waveform</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-ev','If they jointly determined quality, the premise of the question could not occur. The fact that listeners reject a system passing both is the evidence that they do not.')">Nothing: jointly those two metrics determine quality</button>
</div><div class="quiz-explain" id="qts-ev-explain"></div></div>`;

/* ══ 16.5 ADJACENT TASKS ══════════════════════════════════ */
TTS_PAGES.ttsadj = `
<div class="lesson-chapter-label">Section 16.5</div>
<h1 class="lesson-h1">Neighboring Tasks That Reuse the Same Front End</h1>
<p class="lesson-intro">A convolutional stack that turns a waveform into a sequence of embeddings is not specific to synthesis. Several long-standing speech problems reduce to putting a different head on that same stack, and the components that appear are ones already built: k-means for clustering, cosine similarity for comparison, a softmax for classification.</p>

<h2 class="lesson-h2">Who Spoke When</h2>
<p class="lesson-p">Diarization marks the boundaries of each speaker's turns. The classical pipeline finds regions of speech, embeds each region, and clusters the embeddings. The error metric charges separately for three distinct failures, which is why a single accuracy number would hide too much.</p>
<div class="lesson-math">\\[\\mathrm{DER} = \\frac{T_{\\mathrm{false\\ alarm}} + T_{\\mathrm{miss}} + T_{\\mathrm{confusion}}}{\\mathcal{T}}\\]</div>

<h2 class="lesson-h2">Who Is Speaking</h2>
<p class="lesson-p">Verification asks a yes or no question about one claimed identity and answers with a threshold. Identification asks which of a known set and answers with an argmax. The score being thresholded is the same cosine used to check whether synthesis stayed on voice.</p>
<div class="lesson-math">\\[\\text{accept if } s \\ge \\theta, \\qquad \\mathrm{FAR}(\\theta) = P(s \\ge \\theta \\mid \\mathrm{impostor}), \\qquad \\mathrm{FRR}(\\theta) = P(s &lt; \\theta \\mid \\mathrm{genuine})\\]</div>
<div class="lesson-math">\\[\\mathrm{EER} = \\mathrm{FAR}(\\theta^{*}) \\ \\text{ where } \\ \\mathrm{FAR}(\\theta^{*}) = \\mathrm{FRR}(\\theta^{*})\\]</div>
<p class="lesson-p">Reporting a single equal error rate requires choosing the crossing point, which is a convention rather than an optimum. A bank and a voice assistant want thresholds on opposite sides of it, and the equal error rate describes neither.</p>
<div class="lesson-math">\\[\\hat{s} = \\arg\\max_{s \\in \\{1,\\dots,N\\}} \\cos\\big(\\phi(\\mathbf{y}), \\boldsymbol\\mu_s\\big)\\]</div>

<h2 class="lesson-h2">Which Language, and Which Word</h2>
<p class="lesson-p">Language identification pools the frame embeddings and classifies the result. Wake word detection has the same shape and a hard constraint attached: it runs continuously on a device with very little compute, and it exists so nothing is transmitted until it fires.</p>
<div class="lesson-math">\\[\\hat{\\ell} = \\arg\\max_{\\ell} \\mathrm{softmax}(\\mathbf{W}\\bar{\\mathbf{h}})_\\ell, \\qquad \\bar{\\mathbf{h}} = \\frac{1}{\\tau}\\sum_t \\mathbf{h}_t\\]</div>
<div class="lesson-math">\\[\\text{false wakes per hour} = 3600 \\, f_{\\mathrm{decision}} \\cdot \\mathrm{FAR}(\\theta)\\]</div>
<p class="lesson-p">At a hundred decisions per second, a false accept rate of one in ten thousand wakes the device thirty six times an hour. This is why the operating point sits far out on the tail and why a poor miss rate is tolerated: a detector that occasionally fails to wake is an annoyance, and one that wakes on its own is unusable.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Task Switchboard</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="tsw-ctrl"></div>
    <canvas id="tsw-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tsw-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">The diarization panel runs real clustering on a synthetic two speaker recording and scores itself against the known turn structure. The verification panel builds score distributions from genuine and impostor pairs drawn from that same recording. The wake word panel is illustrative.</p>

<div class="quiz-block" id="qts-ad"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A wake word detector makes 100 decisions per second with a false accept rate of 0.00001. How often does it wake by mistake?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-ad','This drops a factor. Multiply the decision rate by the seconds in an hour first: 3600 times 100 is 360,000 decisions per hour.')">About once an hour</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-ad','Correct. 3600 times 100 times 0.00001 gives 3.6. Rates that look negligible in a table become constant interruptions once the classifier never stops running.')">About 3.6 times an hour</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-ad','That would need a false accept rate roughly a hundred times smaller. At this operating point the device wakes several times per hour, not once per day.')">About once a day</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-ad','This overshoots by a factor of ten. 360,000 decisions per hour times one in a hundred thousand is 3.6, not 36.')">About 36 times an hour</button>
</div><div class="quiz-explain" id="qts-ad-explain"></div></div>`;

/* ══ 16.6 SPOKEN LANGUAGE MODELS ══════════════════════════ */
TTS_PAGES.ttsslm = `
<div class="lesson-chapter-label">Section 16.6</div>
<h1 class="lesson-h1">Models That Take Speech In and Give Speech Back</h1>
<p class="lesson-intro">Discrete audio and text tokens can be combined in a shared model. The input and output token types determine tasks such as recognition, synthesis, and speech continuation. Different architectures organize these sequences in different ways.</p>

<div class="lesson-math">\\[\\mathcal{V} = \\mathcal{V}_{\\mathrm{text}} \\cup \\{(i,k) : i \\in [1,N_c],\\, k \\in [1,K]\\} \\cup \\mathcal{V}_{\\mathrm{special}}\\]</div>
<div class="lesson-math">\\[|\\mathcal{V}| = |\\mathcal{V}_{\\mathrm{text}}| + N_cK + |\\mathcal{V}_{\\mathrm{special}}|\\]</div>
<div class="lesson-math">\\[p(\\mathbf{u}_{1:M}) = \\prod_{m=1}^{M} p(u_m \\mid u_{&lt;m}), \\qquad u_m \\in \\mathcal{V}\\]</div>

<p class="lesson-p">Text in and audio out is synthesis. Audio in and text out is recognition. Audio in and audio out is speech to speech translation, or a spoken answer to a spoken question. The model does not distinguish among these cases and neither does the loss; each is a different arrangement of the same next-token problem.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Shared Vocabulary Strip</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="tsv-ctrl"></div>
    <canvas id="tsv-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tsv-cap" style="${MTCAP}"></div>
  </div>
</div>

<p class="lesson-p">Two consequences follow. The first is that a spoken answer can preserve things a written one discards: hesitation, emphasis, tone. The second is that the audio side of the vocabulary is large relative to the text side, so most of the output distribution's capacity is spent on acoustic detail rather than content, which is one reason these models are expensive for what they deliver.</p>
<p class="lesson-p">This section describes where the area is heading rather than a settled result. What is already clear is that the discrete tokenizer is the load bearing part. Without it there is no shared vocabulary, and none of this composes.</p>

<div class="quiz-block" id="qts-sl2"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What single component makes it possible to run recognition, synthesis and speech to speech translation through one model with one loss?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-sl2','Cross-attention is one way to connect an encoder to a decoder, but it does not make speech and text commensurable. Without discrete audio tokens there is nothing for a shared softmax to range over.')">Cross-attention between an encoder and a decoder</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-sl2','Correct. Language models operate on sequences of discrete symbols. Once audio is discretized into tokens that live in the same vocabulary as text, all of these tasks become the same next-token prediction problem.')">An audio tokenizer that places speech and text in a shared discrete vocabulary</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-sl2','More data helps any of these systems, but it does not let one softmax range over two incompatible representations.')">A substantially larger training corpus</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-sl2','The straight-through estimator is what makes the tokenizer trainable, so it is upstream of the answer, but it is not itself the unifying component.')">The straight-through estimator</button>
</div><div class="quiz-explain" id="qts-sl2-explain"></div></div>`;

/* ══ 16.7 SUMMARY ═════════════════════════════════════════ */
TTS_PAGES.ttsmap = `
<div class="lesson-chapter-label">Section 16.7</div>
<h1 class="lesson-h1">One Spine, Traversed in Two Directions</h1>
<p class="lesson-intro">Recognition maps audio to text; synthesis maps text to audio. They can use related components, including convolutional encoders, discrete audio units, and transformers. Compare their roles in the two directions.</p>

<div class="lesson-math">\\[\\underbrace{\\mathbf{x} \\to \\mathbf{z}_t \\to \\mathbf{q}_t \\to \\hat{\\mathbf{x}}}_{\\text{codec, trained to reconstruct}} \\qquad \\underbrace{(\\mathbf{x}_{\\mathrm{text}}, \\mathbf{C}^P) \\to \\mathbf{C}^T \\to \\hat{\\mathbf{x}}}_{\\text{synthesis, trained to generate}}\\]</div>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Round Trip</span></div>
  <div class="viz-body">
    <canvas id="trt-canvas" data-w="660" style="width:100%;display:block;cursor:pointer"></canvas>
    <div id="trt-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">What To Take Away</h2>
<ul class="lesson-list">
<li>Synthesis is conditional generation over audio tokens produced by a codec, not direct waveform prediction. The voice is a prompt, so an unseen speaker costs three seconds rather than a training run.</li>
<li>Audio must be discretized before a language model can use it, and the binding constraint is rate, not alphabet size, because attention cost grows with the square of sequence length.</li>
<li>A codec has three parts: a convolutional encoder that downsamples, a quantizer that discretizes, and a convolutional decoder that upsamples. Only the middle part compresses anything.</li>
<li>Vector quantization replaces a vector with the index of its nearest codeword. Codebooks come from k-means, and distortion falls only as \\(K^{-2/D}\\), which makes a single codebook hopeless at high dimension.</li>
<li>Residual quantization repeats the operation on what the previous stage missed, reaching \\(K^{N_c}\\) reachable states from \\(N_c K\\) stored vectors, with the bitrate truncatable at any stage.</li>
<li>The quantizer has no usable derivative, so the straight-through estimator copies the gradient across it and separate commitment terms keep the codebook and encoder aligned.</li>
<li>Generation splits along the residual hierarchy: the first row autoregressive, the remaining seven filled one parallel pass each.</li>
<li>Evaluation rests on listening panels because no reference waveform exists. Word error rate and speaker similarity each catch one failure mode, and prosody is caught by neither.</li>
</ul>

<div class="quiz-block" id="qts-mp"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Where in the codec pipeline does compression actually happen?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-mp','The encoder reduces the rate but raises the bit count: 75 vectors per second of 256 floats is about 614 kbps against the original 384 kbps.')">In the convolutional encoder, which reduces 24 kHz to 75 Hz</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-mp','Correct. Only when those vectors become eight ten-bit indices does the rate fall, from 384 kbps to 6 kbps (75 \u00d7 8 \u00d7 10). Everything before that is reorganization.')">In the quantizer, which replaces vectors of floats with small integers</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-mp','The adversarial loss shapes what the decoder produces during training. It has no role at inference and moves no bits.')">In the adversarial loss, which discards perceptually irrelevant detail</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-mp','The decoder expands the representation back to a waveform. It is the opposite of a compression step.')">In the transposed convolutions of the decoder</button>
</div><div class="quiz-explain" id="qts-mp-explain"></div></div>`;

/* ══ 16.8 HISTORY ═════════════════════════════════════════ */
TTS_PAGES.ttshist = `
<div class="lesson-chapter-label">Section 16.8</div>
<h1 class="lesson-h1">Two and a Half Centuries of Building Voices</h1>
<p class="lesson-intro">Speech synthesis is older than the computer. The mechanical era built vocal tracts out of physical materials, the electrical era modelled resonances, the recorded era cut and rejoined human speech, and the current era learns discrete units and predicts them. Each paradigm solved the previous one's central difficulty and inherited a new one.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; The Synthesis Family Tree</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="tft-ctrl"></div>
    <canvas id="tft-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="tft-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Two Patterns Worth Noticing</h2>
<p class="lesson-p">The first is the gap between proposal and implementation. A diphone database with join costs on pitch and formant distance was described in 1958 and not actually built until the late 1970s, because the storage and search it assumed did not exist. Neural methods repeat the pattern: the architectures were proposed well before hardware could train them.</p>
<p class="lesson-p">The second is that paradigms did not replace each other cleanly. Formant synthesis was still shipping in commercial products decades after concatenative methods sounded better, because it was small, fast, and completely controllable. Quality is one axis among several, and it is rarely the one that decides deployment.</p>

<h2 class="lesson-h2">Unit Selection and What Followed It</h2>
<p class="lesson-p">The objective that drove concatenative synthesis in the 1990s is worth reading beside the generation objective built earlier, because they are closer than they look.</p>
<div class="lesson-math">\\[\\hat{u}_{1:n} = \\arg\\min_{u_{1:n}}\\left[\\sum_{i=1}^{n} C_{\\mathrm{target}}(u_i, s_i) + \\sum_{i=2}^{n} C_{\\mathrm{join}}(u_{i-1}, u_i)\\right]\\]</div>
<p class="lesson-p">A sequence chosen to match the target at each position while joining smoothly between positions, minimized by dynamic programming over a lattice of candidates. Replace costs with negative log probabilities and the search with sampling, and the modern objective appears. What changed is where the units come from: recorded from one talker and indexed, or learned from thousands of talkers and quantized.</p>
<div class="lesson-math">\\[\\underbrace{O(P^2)}_{\\text{recorded diphones}} \\qquad \\text{versus} \\qquad \\underbrace{K^{N_c}}_{\\text{implicit combinations}}\\]</div>
<p class="lesson-p">A diphone inventory grows with the square of the phone set and every unit has to be physically recorded. A residual codebook reaches vastly more distinct outputs from a few thousand learned vectors, and none of them correspond to a recording of anything.</p>

<div class="quiz-block" id="qts-hs"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">What does unit selection have in common with a codec language model?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-hs','Unit selection does store recorded speech, and the codec model stores no recordings at all. That is one of the sharpest differences between them rather than a similarity.')">Both store recorded speech from a single talker</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-hs','Correct. Target cost and join cost are a per-position term and a transition term, minimized over sequences. Swap in negative log probabilities and the structure is the one used to score generated token sequences.')">Both choose a sequence by optimizing a per-position term plus a between-position term</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-hs','Physical vocal tract modelling is the articulatory paradigm, which is a separate branch and unrelated to either of these.')">Both require a physical model of the vocal tract</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-hs','Both are discrete. Unit selection picks among stored units and the codec model picks among codewords; the discreteness is what makes dynamic programming and next-token prediction applicable.')">Both operate on continuous rather than discrete representations</button>
</div><div class="quiz-explain" id="qts-hs-explain"></div></div>`;

/* ══ 16.9 EXERCISES ═══════════════════════════════════════ */
TTS_PAGES.ttsex = `
<div class="lesson-chapter-label">Section 16.9</div>
<h1 class="lesson-h1">Test Yourself</h1>
<p class="lesson-intro">Work through the five exercises before revealing the answers. Where your result differs, use the feedback to check the calculation or assumption.</p>

<h2 class="lesson-h2">Bench One: Bitrate Arithmetic</h2>
<p class="lesson-p">Given a token rate, a codebook count and a codebook size, compute the bitrate and the compression ratio against 24 kHz 16 bit audio. Six configurations, cycled by the button.</p>

<h2 class="lesson-h2">Bench Two: Residual Quantization by Hand</h2>
<p class="lesson-p">A three dimensional vector and two codebooks of four entries each. Choose a codeword at each stage and read off the residual, then compare your pair against what the greedy encoder would pick and against the best joint pair, which the tool finds by exhaustive search over all sixteen combinations.</p>

<div class="viz-container">
  <div class="viz-header"><span class="viz-label">Interactive &middot; Benches One and Two</span></div>
  <div class="viz-body">
    <div style="${MTROW}" id="txb-ctrl"></div>
    <canvas id="txb-canvas" data-w="660" style="width:100%;display:block"></canvas>
    <div id="txb-cap" style="${MTCAP}"></div>
  </div>
</div>

<h2 class="lesson-h2">Bench Three: Stride Design</h2>
<p class="lesson-p">Return to the stride ladder in Section 16.2.1 and hit 50 Hz from a 24 kHz input using four blocks. Then try 70 Hz and work out why no set of integer strides reaches it. The answer is in the prime factorization of 24{,}000, which is 2<sup>6</sup>&middot;3&middot;5<sup>3</sup>: it contains no factor of 7, so 24000/70 is not a whole number of samples per frame at all.</p>

<h2 class="lesson-h2">Bench Four: Trace the Backward Pass</h2>
<p class="lesson-p">On the gradient detour figure in Section 16.2.4, switch the estimator off and identify every arrow that still carries a real derivative. Switch it on and identify the one arrow carrying a fiction. Then state what would happen to the codebook if the commitment term were removed while the estimator stayed on.</p>

<h2 class="lesson-h2">Bench Five: Match the Failure to the Metric</h2>
<p class="lesson-p">Five failure modes: the wrong voice, a mispronounced surname, a buzzing artifact, a dropped word, flat and unnatural phrasing. Match each to the metric most likely to catch it. Two of the five are caught by no automatic metric at all.</p>

<div class="quiz-block" id="qts-x1"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">A codec runs at 50 Hz with 4 codebooks of 512 entries. What is its bitrate?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-x1','Correct. 50 times 4 times log2 512, which is 9, gives 1800 bits per second, or 1.8 kbps. Against 384 kbps that is a compression factor of about 213.')">1800 bits per second</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-x1','This uses 10 bits per code, which would be log2 1024. A 512 entry codebook costs 9 bits.')">2000 bits per second</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-x1','This looks like the codebook size carried through directly. The codebook size enters through its logarithm, since the index is what gets stored.')">1024 bits per second</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-x1','This multiplies by the codebook size somewhere instead of taking its logarithm. Only the index is transmitted, at log2 K bits.')">4608 bits per second</button>
</div><div class="quiz-explain" id="qts-x1-explain"></div></div>

<div class="quiz-block" id="qts-x2"><div style="font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem">Quick Check</div>
<div class="quiz-q">Which two failure modes are caught by neither word error rate nor speaker similarity?</div>
<div class="quiz-opts-list">
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-x2','A dropped word appears directly in the transcript as a deletion, and the wrong voice moves the cosine. Both of these are caught.')">A dropped word and the wrong voice</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,true,'qts-x2','Correct. A buzz that leaves every word intelligible passes the recognizer and barely moves the spectral profile, and prosody has no agreed automatic measure. These are why listening panels have not gone away.')">A buzzing artifact and flat unnatural phrasing</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-x2','Both of these show up in the transcript: a mispronounced surname as a substitution, a dropped word as a deletion.')">A mispronounced surname and a dropped word</button>
<button class="quiz-opt-btn" onclick="checkQuiz(this,false,'qts-x2','The wrong voice is exactly what speaker similarity measures, and a mispronounced surname is what the recognizer loop catches.')">The wrong voice and a mispronounced surname</button>
</div><div class="quiz-explain" id="qts-x2-explain"></div></div>`;

/* ══ DISPATCH ═════════════════════════════════════════════ */
function openTTSSec(id){
  const pg = TTS_PAGES[id];
  if(!pg) return;
  const sv = document.getElementById('subsection-view');
  const sb = document.getElementById('sub-body');
  if(!sv || !sb) return;
  const sec = TTS_SEC.find(s=>s.id===id);
  sb.innerHTML = pg;
  const crumb = document.getElementById('sub-crumb');
  if(crumb && sec) crumb.innerHTML = 'Text-to-Speech <span style="margin:0 5px;color:var(--border2)">&#8250;</span> <span>' + sec.num + ' ' + sec.title + '</span>';
  sv.style.display = 'block';
  sv.scrollTop = 0;
  renderMath(sb);
  mcSectionDelay(()=>{
    if(id==='ttstask') ttsVbBuild();
    if(id==='ttsrate') ttsTrBuild();
    if(id==='ttssl')   ttsSlBuild();
    if(id==='ttscb')   ttsClBuild();
    if(id==='ttsrvq')  ttsRcBuild();
    if(id==='ttsste')  ttsGdBuild();
    if(id==='ttslm')   ttsCmBuild();
    if(id==='ttseval') ttsLbBuild();
    if(id==='ttsadj')  ttsSwBuild();
    if(id==='ttsslm')  ttsSvBuild();
    if(id==='ttsmap')  ttsRtBuild();
    if(id==='ttshist') ttsFtBuild();
    if(id==='ttsex')   ttsXbBuild();
  }, 120);
  sv.onscroll = () => {
    const hh = sv.scrollHeight - sv.clientHeight;
    const bar = document.getElementById('sub-progress');
    if(bar) bar.style.width = (hh>0?(sv.scrollTop/hh)*100:0)+'%';
  };
}

/* ══ END CHAPTER 16 ══════════════════════════════════════ */
