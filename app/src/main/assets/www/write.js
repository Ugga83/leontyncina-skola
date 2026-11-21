// Učíme se s Ayrou – Psaní: tracing Czech school cursive letters with a finger
(() => {
const A = window.App, {speak, sfx, confetti, pick} = A;
const $ = s => document.querySelector(s);
// Slabikář: Czech school cursive (shapes by Petr Olšák)
const FONT = () => 'Slabikar';

const W_LESSONS = [
  {id:'vow',  c:'orange', t:'Samohlásky',     items:['a','e','i','o','u']},
  {id:'mlsp', c:'teal',   t:'Písmena m l s p', items:['m','l','s','p']},
  {id:'syl',  c:'violet', t:'Slabiky',        items:['ma','me','mi','mo','mu','la','le','li','lo','lu','sa','se','si','so','su','pa','pe','pi','po','pu']},
  {id:'word', c:'coral',  t:'Slova',          items:['máma','mele','Ema','lama','pila','pes','osel','Pepa','lupa','sele']},
  {id:'cap',  c:'teal',   t:'Velká písmena',  items:['A','E','I','O','U','M','L','S','P']},
  {id:'num',  c:'orange', t:'Číslice',        items:['1','2','3','4','5','6','7','8','9','0']},
];
// endless mode: everything mixed, it never ends – stars after every 10
const ALL = {id:'all', c:'violet', t:'Ze všeho – bez konce', items:[...new Set(W_LESSONS.flatMap(l=>l.items))], endless:true};
const NUM = {'0':'nula','1':'jedna','2':'dva','3':'tři','4':'čtyři','5':'pět','6':'šest','7':'sedm','8':'osm','9':'devět'};
const isNum = x => /^[0-9]$/.test(x);
// how a letter is said: consonants by name (em, el…), always with a word, so it can't be misheard.
// A vowel on its own would be read long by the sentence voice ("é"), so it is said as a separate
// short recorded sound (voice/fixed, exact pronunciation) between two parts of the sentence.
const NAME = {m:'em', l:'el', s:'es', p:'pé'};
const LIKE = {a:'auto', e:'Ema', i:'iglú', o:'osel', u:'ucho', m:'máma', l:'lama', s:'sova', p:'pes'};
const isVowel = x => /^[aeiou]$/i.test(x);
const ROUND = 6;
const W_SAY = {
  pick:'Vyber si, co budeme psát.',
  start:'Obtáhni prstem šedé písmenko. Jezdi přesně po čáře.',
  slow:'Jezdi prstem přesně po šedé čáře. Zkus to znovu.',
  rest:'Ještě obtáhni zbytek.',
  praise:['Krásně!','Paráda, to je hezké!','Výborně!','Haf! To se ti povedlo!','Jako ve škole!'],
};
const isSyl = x => W_LESSONS[2].items.includes(x);
const big = x => x.length===1 && !isNum(x) && x===x.toUpperCase();
function promptParts(x){
  if (isNum(x)) return [`Obtáhni číslo ${NUM[x]}.`];
  if (x.length === 1){
    const k = x.toLowerCase(), head = big(x) ? 'Obtáhni velké písmeno' : 'Obtáhni písmenko';
    return isVowel(k) ? [head, k, `jako ${LIKE[k]}.`] : [`${head} ${NAME[k]}, jako ${LIKE[k]}.`];
  }
  return isSyl(x) ? ['Obtáhni slabiku.', x] : [`Obtáhni slovo ${x}.`];     // a syllable alone: recorded sound
}
// after tracing Ayra says what is written there
function writtenParts(x){
  if (isNum(x)) return [`To je ${NUM[x]}.`];
  if (x.length === 1){
    const k = x.toLowerCase(), head = big(x) ? 'To je velké' : 'To je';
    return isVowel(k) ? [head, k, `jako ${LIKE[k]}.`] : [`${head} ${NAME[k]}, jako ${LIKE[k]}.`];
  }
  return isSyl(x) ? [x] : [`Napsala jsi ${x}.`];
}
const sayParts = (parts, queue) => parts.reduce((p, t, i)=>speak(t, {queue: i>0 || !!queue}), null);
const sayWritten = x => sayParts(writtenParts(x), true);
const sayItem = (x, queue) => sayParts(promptParts(x), queue);

document.getElementById('end').insertAdjacentHTML('beforebegin', `
<section id="write" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Psaní</h1></div>
  <div class="hero"><div class="owl" id="writeOwl"></div><div class="bubble">Vyber si, co budeme psát!</div></div>
  <div class="lsec"><h3>✏️ Psací písmo</h3><div class="lessons">
    ${W_LESSONS.map(l=>`<button class="lesson" style="--c:var(--${l.c});--d:var(--${l.c}-d)" data-wl="${l.id}">
      <span class="le wcur">${l.items.slice(0, l.id==='word'?2:5).join(' ')}</span><span class="lt"><b>${l.t}</b></span></button>`).join('')}
    <button class="lesson" style="--c:var(--violet);--d:var(--violet-d)" data-wl="all">
      <span class="le">🎲</span><span class="lt"><b>${ALL.t}</b><small>všechno dohromady, hvězdičky po každých 10</small></span></button>
  </div></div>
</section>
<section id="wtrace" class="screen">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><div style="flex:1"></div>
    <div class="scount" id="wStars">✓ 0</div><button class="round-btn" id="wSay" aria-label="Zopakovat">🔊</button></div>
  <div class="dots" id="wDots"></div>
  <div class="gtalk"><div class="owl"></div><div class="bubble" id="wBubble"></div></div>
  <div class="card wcard" id="wCard"><canvas id="wGuide"></canvas><canvas id="wInk"></canvas></div>
  <div class="btns" style="padding-bottom:6px">
    <button class="bigbtn" style="--c:var(--violet);--d:var(--violet-d)" id="wClear">🧽 Smazat</button>
  </div>
</section>`);

const WS = {lesson:null, items:[], idx:0, stars:0, res:[], miss:0, done:false, fs:0, mask:null, target:null, run:0, restSaid:false};
const isOn = id => document.getElementById(id).classList.contains('active');

document.querySelectorAll('[data-wl]').forEach(b=>b.addEventListener('click', ()=>{ sfx.tap(); start(b.dataset.wl); }));
document.querySelector('#hub [data-go="write"]').addEventListener('click', ()=>setTimeout(()=>speak(W_SAY.pick), 60));
$('#writeOwl').addEventListener('click', ()=>speak(W_SAY.pick));

function batch(){
  const pool = [...WS.lesson.items], out = [], n = WS.lesson.endless ? 10 : Math.min(ROUND, pool.length);
  // what went wrong lately comes first
  (A.progress ? A.progress.weak('write', 10) : []).filter(x=>pool.includes(x)).slice(0, 2).forEach(x=>out.push(x));
  while (out.length < n){ const x = pick(pool); if (!out.includes(x)) out.push(x); }
  WS.items = out.sort(()=>Math.random()-.5); WS.idx = 0; WS.stars = 0; WS.res = [];
}
function start(id){
  WS.lesson = id==='all' ? ALL : W_LESSONS.find(l=>l.id===id);
  batch();
  A.go('wtrace');
  document.fonts.load(`100px ${FONT()}`).then(()=>{ setup(true); });
}

function setup(first){
  const x = WS.items[WS.idx]; WS.miss = 0; WS.done = false; WS.restSaid = false; WS.run++;
  $('#wDots').innerHTML = WS.items.map((_,i)=>`<div class="dot ${i===WS.idx?'cur':''} ${WS.res[i]===1?'gold':WS.res[i]===2?'ok':''}"></div>`).join('');
  $('#wStars').textContent = '✓ ' + WS.stars;
  const what = isNum(x) ? 'číslo' : x.length===1 ? (x===x.toUpperCase() ? 'velké písmeno' : 'písmenko') : W_LESSONS[2].items.includes(x) ? 'slabiku' : 'slovo';
  $('#wBubble').innerHTML = `Obtáhni ${what} <b class="wcur">${x}</b>`;
  draw();
  if (first){ speak(W_SAY.start); sayItem(x, true); } else sayItem(x);
}

// ---------- drawing ----------
function sizeCanvas(c){
  const r = $('#wCard').getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
  c.style.width = r.width + 'px'; c.style.height = r.height + 'px';
  return c.getContext('2d');
}
function layout(ctx, x){
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.font = `100px ${FONT()}`; ctx.textAlign = 'center';
  // the school font has lead-in and lead-out strokes outside the letter box: fit the real ink box
  const m = ctx.measureText(x), Lx = m.actualBoundingBoxLeft, Rx = m.actualBoundingBoxRight;
  const asc = Math.max(m.actualBoundingBoxAscent, 70), desc = Math.max(m.actualBoundingBoxDescent, 30);
  const fs = Math.min(100 * W * .8 / (Lx + Rx), 100 * H * .8 / (asc + desc), H * .62);
  const base = H * .5 + (asc - desc) / 100 * fs / 2;
  return {fs, base, cx: W / 2 - (Rx - Lx) / 2 * fs / 100};
}
function glyph(ctx, x, L){ ctx.font = `${L.fs}px ${FONT()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; }
function draw(){
  const x = WS.items[WS.idx], g = sizeCanvas($('#wGuide')); sizeCanvas($('#wInk'));
  const L = layout(g, x); WS.fs = L.fs; WS.L = L;
  const W = g.canvas.width, H = g.canvas.height;
  // school lines: baseline, x-height and a faint top line
  g.font = `${L.fs}px ${FONT()}`;
  const xh = g.measureText('m').actualBoundingBoxAscent, top = g.measureText('l').actualBoundingBoxAscent;
  g.lineWidth = Math.max(1, L.fs * .008);
  [[L.base, '#c9d2ee', []], [L.base - xh, '#dfe5f6', [L.fs*.04, L.fs*.04]], [L.base - top, '#eef1fa', []]].forEach(([y, c, d])=>{
    g.strokeStyle = c; g.setLineDash(d); g.beginPath(); g.moveTo(W*.04, y); g.lineTo(W*.96, y); g.stroke();
  });
  g.setLineDash([]);
  // wide light "road" and the grey letter in the middle of it
  glyph(g, x, L); g.lineJoin = g.lineCap = 'round';
  g.strokeStyle = '#eef2fd'; g.lineWidth = L.fs * .14; g.strokeText(x, L.cx, L.base);
  g.strokeStyle = '#b7c0e3'; g.lineWidth = L.fs * .035; g.strokeText(x, L.cx, L.base);
  g.fillStyle = '#b7c0e3'; g.fillText(x, L.cx, L.base);
  // start dot = left-most point of the letter
  // masks for checking: road (where ink may go) and target (what must be covered)
  const off = document.createElement('canvas'); off.width = W; off.height = H;
  const o = off.getContext('2d'); glyph(o, x, L); o.lineJoin = o.lineCap = 'round';
  o.strokeStyle = '#000'; o.lineWidth = L.fs * .2; o.strokeText(x, L.cx, L.base); o.fillText(x, L.cx, L.base);
  WS.mask = o.getImageData(0, 0, W, H).data;
  o.clearRect(0, 0, W, H); o.lineWidth = L.fs * .03; o.strokeText(x, L.cx, L.base); o.fillText(x, L.cx, L.base);
  WS.target = o.getImageData(0, 0, W, H).data;
}
window.addEventListener('resize', ()=>{ if (isOn('wtrace') && WS.items.length) draw(); });

// ---------- finger ----------
const ink = $('#wInk');
let drawing = false, last = null, checkT = null;
function pos(e){ const r = ink.getBoundingClientRect(); return [(e.clientX - r.left) * ink.width / r.width, (e.clientY - r.top) * ink.height / r.height]; }
ink.addEventListener('pointerdown', e=>{
  if (WS.done) return; e.preventDefault(); ink.setPointerCapture(e.pointerId);
  drawing = true; last = pos(e); clearTimeout(checkT); dot(last);
});
ink.addEventListener('pointermove', e=>{
  if (!drawing) return; const p = pos(e), c = ink.getContext('2d');
  c.strokeStyle = '#2f6fd8'; c.lineWidth = WS.fs * .075; c.lineCap = c.lineJoin = 'round';
  c.beginPath(); c.moveTo(last[0], last[1]); c.lineTo(p[0], p[1]); c.stroke(); last = p;
});
['pointerup','pointercancel'].forEach(ev=>ink.addEventListener(ev, ()=>{
  if (!drawing) return; drawing = false; clearTimeout(checkT); checkT = setTimeout(check, 450);
}));
function dot(p){ const c = ink.getContext('2d'); c.fillStyle = '#2f6fd8'; c.beginPath(); c.arc(p[0], p[1], WS.fs*.0375, 0, 7); c.fill(); }

function measure(){
  const c = ink.getContext('2d'), W = ink.width, H = ink.height, d = c.getImageData(0, 0, W, H).data;
  const step = Math.max(2, Math.round(WS.fs / 60));
  let tN = 0, tHit = 0, iN = 0, iOut = 0;
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step){
    const i = (y * W + x) * 4 + 3;
    if (WS.target[i] > 100){ tN++; if (d[i] > 0) tHit++; }
    if (d[i] > 0){ iN++; if (WS.mask[i] < 50) iOut++; }
  }
  WS.inkN = iN; WS.tN = tN;
  return {cover: tN ? tHit / tN : 0, out: iN ? iOut / iN : 0};
}
async function check(){
  if (WS.done || !isOn('wtrace')) return;
  const {cover, out} = measure(), my = WS.run;
  if (out > .35 && (cover > .3 || WS.inkN > WS.tN * .6)){                       // scribbled outside the letter
    WS.miss++; sfx.bad(); $('#wBubble').textContent = 'Jezdi přesně po šedé čáře.';
    speak(W_SAY.slow); clearInk(); return;
  }
  if (cover >= .78){
    WS.done = true; const first = WS.miss === 0;
    if (A.progress) A.progress.track('write', WS.items[WS.idx], first);
    if (first){ WS.stars++; WS.res[WS.idx] = 1; } else WS.res[WS.idx] = 2;
    recolor(); sfx.good(); confetti(first ? 35 : 15);
    const p = pick(W_SAY.praise), x = WS.items[WS.idx];
    $('#wBubble').innerHTML = `${p} <b class="wcur">${x}</b>`; $('#wStars').textContent = '✓ ' + WS.stars;
    await speak(p); await sayWritten(x); await new Promise(r=>setTimeout(r, 500));
    if (my !== WS.run || !isOn('wtrace')) return;
    WS.idx++;
    if (WS.idx >= WS.items.length){
      if (!WS.lesson.endless) return A.finishRound(WS.stars, ()=>start(WS.lesson.id), 'write', WS.items.length);
      const r = A.awardRound(WS.stars, WS.items.length, 'write'); A.toastStars(r.add, r.won);   // and on it goes
      batch(); setup(); return;
    }
    setup();
    return;
  }
  if (cover > .35 && !WS.restSaid){ WS.restSaid = true; $('#wBubble').textContent = 'Ještě obtáhni zbytek.'; speak(W_SAY.rest); }
}
function recolor(){                                    // the finished letter turns green
  const c = ink.getContext('2d'); c.globalCompositeOperation = 'source-in';
  c.fillStyle = '#20b37a'; c.fillRect(0, 0, ink.width, ink.height); c.globalCompositeOperation = 'source-over';
}
function clearInk(){ const c = ink.getContext('2d'); c.clearRect(0, 0, ink.width, ink.height); WS.restSaid = false; }
$('#wClear').addEventListener('click', ()=>{ sfx.tap(); if (!WS.done) clearInk(); });
$('#wSay').addEventListener('click', ()=>{ sfx.tap(); sayItem(WS.items[WS.idx]); });

WS.demo = 0;
A.onLeave(()=>{ WS.run++; WS.demo++; });

A.phraseSources.push(()=>[...W_LESSONS.flatMap(l=>l.items).flatMap(x=>[...promptParts(x), ...writtenParts(x)]), W_SAY.pick, W_SAY.start, W_SAY.slow, W_SAY.rest, ...W_SAY.praise]);
})();
