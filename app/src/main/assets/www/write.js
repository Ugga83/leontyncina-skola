// Učíme se s Ayrou – Psaní: tracing Czech school cursive letters with a finger
(() => {
const A = window.App, {speak, sfx, confetti, pick} = A;
const $ = s => document.querySelector(s);
// Slabikář: Czech school cursive (shapes by Petr Olšák); print letters: the app's rounded font
const isPrint = () => !!(WS.lesson && WS.lesson.font === 'print');
const FSPEC = size => isPrint() ? `400 ${size}px Nunito` : `${size}px Slabikar`;
const PEN = () => WS.pat ? (isPat(WS.items[WS.idx]) ? .16 : .15) : isPrint() ? .15 : .075;                    // print letters are thicker: a thicker pen
const FCLASS = () => isPrint() ? 'wprint' : 'wcur';

const W_LESSONS = [
  {id:'vow',  c:'orange', t:'Samohlásky',     items:['a','e','i','o','u']},
  {id:'mlsp', c:'teal',   t:'Písmena m l s p t', items:['m','l','s','p','t']},
  {id:'syl',  c:'violet', t:'Slabiky',        items:['ma','me','mi','mo','mu','la','le','li','lo','lu','sa','se','si','so','su','pa','pe','pi','po','pu','ta','te','ti','to','tu']},
  {id:'word', c:'coral',  t:'Slova',          items:['máma','mele','Ema','lama','pila','pes','osel','Pepa','lupa','sele','táta','teta','léto','mapa']},
  {id:'cap',  c:'teal',   t:'Velká písmena',  items:['A','E','I','O','U','M','L','S','P','T']},
  {id:'num',  c:'orange', t:'Číslice',        items:['1','2','3','4','5','6','7','8','9','0']},
  // ---- tiskací písmo ----
  {id:'pcap', c:'coral',  t:'Velká tiskací',  items:['A','E','I','O','U','M','L','S','P','T'], font:'print'},
  {id:'plow', c:'teal',   t:'Malá tiskací',   items:['a','e','i','o','u','m','l','s','p','t'], font:'print'},
  {id:'psyl', c:'violet', t:'Tiskací slabiky', items:['MA','ME','MI','MO','MU','LA','LE','LI','LO','LU','SA','SE','SI','SO','SU','PA','PE','PI','PO','PU','TA','TE','TI','TO','TU'], font:'print'},
];
// warm-up for the hand: shapes traced from the green dot (always added last: the indexes above are used elsewhere)
W_LESSONS.push({id:'warm', c:'teal', t:'Rozcvička ruky', items:['~vlnky','~dest','~pila','~kolecka','~houpacky','~klicky','~snek'], pat:true});
const TAU = Math.PI * 2;
const curve = (n, f) => Array.from({length:n + 1}, (_, i)=>f(i / n));
// each shape: name for Ayra, an emoji, strokes in a box bw × bh (px, y down); a stroke starts at its first point
const PAT = {
  '~vlnky':   {n:'vlnky', e:'🌊', s:(w,h)=>[curve(160, t=>[t*w, h*.5 - h*.3*Math.sin(TAU*3*t)])]},
  '~dest':    {n:'kapky deště', e:'🌧️', s:(w,h)=>[.1,.3,.5,.7,.9].map(x=>curve(20, t=>[x*w, h*(.1 + .8*t)]))},
  '~pila':    {n:'pilku', e:'🪚', s:(w,h)=>[[0,1,2,3,4,5,6].map(i=>[i/6*w, i%2 ? h*.15 : h*.85])]},
  '~kolecka': {n:'kolečka', e:'⭕', s:(w,h)=>{ const r = Math.min(h*.4, w/7.5); return [w*.18, w*.5, w*.82].map(cx=>curve(80, t=>[cx + r*Math.cos(-Math.PI/2 - TAU*t), h*.5 + r*Math.sin(-Math.PI/2 - TAU*t)])); }},
  '~houpacky':{n:'houpačky', e:'🎠', s:(w,h)=>[curve(150, t=>[t*w, h*.15 + h*.7*Math.abs(Math.sin(Math.PI*3*t))])]},
  '~klicky':  {n:'kličky', e:'➰', s:(w,h)=>{ const T = TAU*4, a = 1, b = 2.3, x0 = -b, x1 = a*T + b*0.2;
                 return [curve(260, t=>{ const u = t*T; return [((a*u - b*Math.sin(u)) - x0)/(x1 - x0)*w, h*.5 + h*.38*Math.cos(u)]; })]; }},
  '~snek':    {n:'šnečka', e:'🐌', s:(w,h)=>{ const R = Math.min(h*.46, w*.3); return [curve(200, t=>[w*.5 + R*t*Math.cos(TAU*2.6*t), h*.5 + R*t*Math.sin(TAU*2.6*t)])]; }},
};
const isPat = x => x.charAt(0) === '~';
// ---------- digits 0–9 drawn as real strokes (Czech school norm): units u 0..1 across, v 0 = Y3 (top) .. 1 = Y1 (baseline) ----------
// angles: -90 = 12 h (top), 0 = 3 h, 90 = 6 h, 180 = 9 h; CW = growing angle, CCW = falling angle
const ARC = (cx, cy, rx, ry, a0, a1, n) => curve(n || 48, t=>{ const a = (a0 + (a1 - a0) * t) * Math.PI / 180; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
const LINE = (a, b, n) => curve(n || 16, t=>[a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
const CAT = (...parts) => parts.reduce((out, p)=>out.concat(out.length ? p.slice(1) : p), []);
const at = (cx, cy, rx, ry, a) => [cx + rx * Math.cos(a * Math.PI / 180), cy + ry * Math.sin(a * Math.PI / 180)];
const DIGIT = {
  // 0: from 12 h, a narrow closed oval CCW down to Y1 and back
  '0': [ARC(.5, .5, .4, .5, -90, -450, 64)],
  // 1: from below Y3 on the left a short slant up to Y3 (the beak), sharp turn, long straight line down to Y1 (no foot)
  '1': [CAT(LINE([.16, .2], [.62, 0], 10), LINE([.62, 0], [.62, 1], 24))],
  // 2: from below Y3 on the left, the top arc CW over Y3, slant down-left to Y1, sharp turn, along Y1 to the right
  '2': [CAT(ARC(.5, .28, .4, .28, 190, 380, 40), LINE(at(.5, .28, .4, .28, 380), [.06, 1], 22), LINE([.06, 1], [.95, 1], 14))],
  // 3: from below Y3 on the left, top arc CW to the middle (Y2), sharp turn, bottom arc CW over Y1, ends left above Y1
  '3': [CAT(ARC(.47, .25, .36, .25, 200, 450, 36), ARC(.47, .75, .4, .25, 270, 520, 44))],
  // 4 (open): from Y3 a little left, slant down just below Y2, sharp turn, to the right; LIFT; from the right between Y2 and Y3 straight down to Y1
  '4': [CAT(LINE([.34, 0], [.08, .62], 18), LINE([.08, .62], [.95, .62], 16)), LINE([.72, .26], [.72, 1], 20)],
  // 5: from Y3 on the left down to Y2, without lifting the belly CW to Y1 and back up left; LIFT; along Y3 from left to right
  '5': [CAT(LINE([.22, 0], [.17, .47], 12), LINE([.17, .47], at(.47, .72, .38, .28, 218), 3), ARC(.47, .72, .38, .28, 218, 510, 44)), LINE([.22, 0], [.9, 0], 14)],
  // 6: from 2 h a long arc CCW over Y3 to the left and down to Y1, on CCW up to Y2 closing the belly
  '6': [CAT(ARC(.52, .5, .4, .5, -35, -270, 44), ARC(.52, .75, .38, .25, 90, -170, 40))],
  // 7: from the left on Y3 to the right, sharp turn, slant down-left to Y1; LIFT; a short bar on Y2 from left to right through the middle
  '7': [CAT(LINE([.06, 0], [.94, 0], 14), LINE([.94, 0], [.36, 1], 22)), LINE([.4, .5], [.9, .5], 12)],
  // 8: one stroke like a closed S: from 2 h the top arc CCW over Y3 to the left and down to Y2, across down-right,
  //    bottom arc CW over Y1 to the left and up, across up-right through the middle back to the start
  '8': [CAT(ARC(.5, .25, .3, .25, -30, -225, 32), LINE(at(.5, .25, .3, .25, -225), at(.5, .75, .36, .25, -60), 10),
            ARC(.5, .75, .36, .25, -60, 215, 44), LINE(at(.5, .75, .36, .25, 215), at(.5, .25, .3, .25, -30), 18))],
  // 9: from 2 h a closed oval CCW in Y2–Y3, from the start without lifting straight down to Y1
  '9': [CAT(ARC(.5, .27, .33, .27, -30, -390, 52), LINE(at(.5, .27, .33, .27, -30), [.79, 1], 22))],
};
const hasStrokes = x => isPat(x) || DIGIT[x] !== undefined || !!(window.WSTROKES && WSTROKES.knows(x, isPrint())) || !!(!isPrint() && window.FONT_STROKES && FONT_STROKES[x]);

// endless mode: everything mixed, it never ends – stars after every 10
const ALL = {id:'all', c:'violet', t:'Ze všeho – bez konce', items:[], endless:true};
const NUM = {'0':'nula','1':'jedna','2':'dva','3':'tři','4':'čtyři','5':'pět','6':'šest','7':'sedm','8':'osm','9':'devět'};
const isNum = x => /^[0-9]$/.test(x);
// how a letter is said: consonants by name (em, el…), always with a word, so it can't be misheard.
// A vowel on its own would be read long by the sentence voice ("é"), so it is said as a separate
// short recorded sound (voice/fixed, exact pronunciation) between two parts of the sentence.
const NAME = {m:'em', l:'el', s:'es', p:'pé', t:'té'};
const LIKE = {a:'auto', e:'Ema', i:'iglú', o:'osel', u:'ucho', m:'máma', l:'lama', s:'sova', p:'pes', t:'táta'};
const isVowel = x => /^[aeiou]$/i.test(x);
const ROUND = 6;
const W_SAY = {
  pick:'Vyber si, co budeme psát.',
  start:'Obtáhni prstem šedé písmenko. Jezdi přesně po čáře.',
  warm:'Rozcvičíme ruku. Jeď prstem po šedé čáře od zeleného bodu.',
  slow:'Jezdi prstem přesně po šedé čáře. Zkus to znovu.',
  rest:'Ještě obtáhni zbytek.',
  praise:['Krásně!','Paráda, to je hezké!','Výborně!','Haf! To se ti povedlo!','Jako ve škole!'],
};
const isSyl = x => W_LESSONS[2].items.includes(x.toLowerCase());
const big = x => x.length===1 && !isNum(x) && x===x.toUpperCase();
function promptParts(x){
  if (isPat(x)) return [`Obtáhni ${PAT[x].n}.`];
  if (isNum(x)) return [`Obtáhni číslo ${NUM[x]}.`];
  if (x.length === 1){
    const k = x.toLowerCase(), head = big(x) ? 'Obtáhni velké písmeno' : 'Obtáhni písmenko';
    return isVowel(k) ? [head, k, `jako ${LIKE[k]}.`] : [`${head} ${NAME[k]}, jako ${LIKE[k]}.`];
  }
  return isSyl(x) ? ['Obtáhni slabiku.', x.toLowerCase()] : [`Obtáhni slovo ${x}.`];     // a syllable alone: recorded sound
}
// after tracing Ayra says what is written there
function writtenParts(x){
  if (isPat(x)) return [];
  if (isNum(x)) return [`To je ${NUM[x]}.`];
  if (x.length === 1){
    const k = x.toLowerCase(), head = big(x) ? 'To je velké' : 'To je';
    return isVowel(k) ? [head, k, `jako ${LIKE[k]}.`] : [`${head} ${NAME[k]}, jako ${LIKE[k]}.`];
  }
  return isSyl(x) ? [x.toLowerCase()] : [`Napsala jsi ${x}.`];
}
const sayParts = (parts, queue) => parts.reduce((p, t, i)=>speak(t, {queue: i>0 || !!queue}), Promise.resolve());
const sayWritten = x => sayParts(writtenParts(x), true);
const sayItem = (x, queue) => sayParts(promptParts(x), queue);

document.getElementById('end').insertAdjacentHTML('beforebegin', `
<section id="write" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Psaní</h1></div>
  <div class="hero"><div class="owl" id="writeOwl"></div><div class="bubble">Vyber si, co budeme psát!</div></div>
  <div class="lsec"><h3>🤸 Rozcvička</h3><div class="lessons">
    <button class="lesson" style="--c:var(--teal);--d:var(--teal-d)" data-wl="warm"><span class="le">〰️</span><span class="lt"><b>Rozcvička ruky</b><small>vlnky, kolečka, kličky… od zeleného bodu</small></span></button>
    <div id="wExtra"></div>
  </div></div>
  <div class="lsec"><h3>🔤 Tiskací písmo</h3><div class="lessons">
    ${W_LESSONS.filter(l=>l.font==='print').map(l=>`<button class="lesson" style="--c:var(--${l.c});--d:var(--${l.c}-d)" data-wl="${l.id}">
      <span class="le wprint">${l.items.slice(0, l.id==='psyl'?3:5).join(' ')}</span><span class="lt"><b>${l.t}</b></span></button>`).join('')}
  </div></div>
  <div class="lsec"><h3>✏️ Psací písmo</h3><div class="lessons">
    ${W_LESSONS.filter(l=>!l.font && !l.pat).map(l=>`<button class="lesson" style="--c:var(--${l.c});--d:var(--${l.c}-d)" data-wl="${l.id}">
      <span class="le wcur">${l.items.slice(0, l.id==='word'?2:5).join(' ')}</span><span class="lt"><b>${l.t}</b></span></button>`).join('')}
    <button class="lesson" style="--c:var(--violet);--d:var(--violet-d)" data-wl="all">
      <span class="le">🎲</span><span class="lt"><b>${ALL.t}</b><small>všechno dohromady, hvězdičky po každých 10</small></span></button>
  </div></div>
</section>
<section id="wtrace" class="screen">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><div style="flex:1"></div>
    <div class="scount" id="wStars">✓ 0</div><button class="round-btn" id="wShow" aria-label="Ukaž, jak se to píše">✏️</button><button class="round-btn" id="wSay" aria-label="Zopakovat">🔊</button></div>
  <div class="dots" id="wDots"></div>
  <div class="gtalk"><div class="owl"></div><div class="bubble" id="wBubble"></div></div>
  <div class="card wcard" id="wCard"><canvas id="wGuide"></canvas><canvas id="wInk"></canvas><canvas id="wDemo"></canvas></div>
  <div class="btns" style="padding-bottom:6px">
    <button class="bigbtn" style="--c:var(--teal);--d:var(--teal-d)" id="wUndo">↩️ Zpět</button>
    <button class="bigbtn" style="--c:var(--violet);--d:var(--violet-d)" id="wClear">🧽 Smazat</button>
  </div>
</section>`);

const WS = {lesson:null, items:[], idx:0, stars:0, res:[], miss:0, done:false, fs:0, mask:null, target:null, run:0, restSaid:false};
const isOn = id => document.getElementById(id).classList.contains('active');

document.querySelectorAll('[data-wl]').forEach(b=>b.addEventListener('click', ()=>{ sfx.tap(); start(b.dataset.wl); }));
// lessons with nothing taught yet are hidden (the parent sets the letters in Pro rodiče)
function refreshLessons(){
  document.querySelectorAll('#write [data-wl]').forEach(b=>{ const l = W_LESSONS.find(x=>x.id===b.dataset.wl);
    if (l) b.style.display = l.items.some(x=>isPat(x) || isNum(x) || A.allowed(x)) ? '' : 'none'; });
}
document.querySelector('#hub [data-go="write"]').addEventListener('click', ()=>{ refreshLessons(); setTimeout(()=>speak(W_SAY.pick), 60); });
$('#writeOwl').addEventListener('click', ()=>speak(W_SAY.pick));

function batch(){
  const pool = WS.lesson.items.filter(x=>isPat(x) || isNum(x) || A.allowed(x));
  if (!pool.length) pool.push(...WS.lesson.items);
  const out = [], n = WS.lesson.endless ? 10 : Math.min(A.roundLen(ROUND), pool.length);
  // what went wrong lately comes first
  (A.progress ? A.progress.weak('write', 10) : []).filter(x=>pool.includes(x)).slice(0, 2).forEach(x=>out.push(x));
  while (out.length < n){ const x = pick(pool); if (!out.includes(x)) out.push(x); }
  WS.items = out.sort(()=>Math.random()-.5); WS.idx = 0; WS.stars = 0; WS.res = [];
}
function start(id){
  WS.lesson = id==='all' ? ALL : W_LESSONS.find(l=>l.id===id);
  if (id==='all') ALL.items = [...new Set(W_LESSONS.filter(l=>!l.font && !l.pat).flatMap(l=>l.items))];
  batch();
  A.go('wtrace');
  document.fonts.load(FSPEC(100)).then(()=>{ setup(true); });
}

function setup(first){
  const x = WS.items[WS.idx]; WS.miss = 0; WS.done = false; WS.restSaid = false; WS.run++;
  $('#wDots').innerHTML = WS.items.map((_,i)=>`<div class="dot ${i===WS.idx?'cur':''} ${WS.res[i]===1?'gold':WS.res[i]===2?'ok':''}"></div>`).join('');
  $('#wStars').textContent = '✓ ' + WS.stars;
  WS.pat = hasStrokes(x);
  if (isPat(x)){ $('#wBubble').innerHTML = `Obtáhni ${PAT[x].n} ${PAT[x].e}`; draw();
    if (first){ speak(W_SAY.warm); sayItem(x, true); } else sayItem(x); return; }
  const what = isNum(x) ? 'číslo' : x.length===1 ? (x===x.toUpperCase() ? 'velké písmeno' : 'písmenko') : isSyl(x) ? 'slabiku' : 'slovo';
  $('#wBubble').innerHTML = `Obtáhni ${what} <b class="${FCLASS()}">${x}</b>`;
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
  ctx.font = FSPEC(100); ctx.textAlign = 'center';
  // the school font has lead-in and lead-out strokes outside the letter box: fit the real ink box
  const m = ctx.measureText(x), Lx = m.actualBoundingBoxLeft, Rx = m.actualBoundingBoxRight;
  const asc = Math.max(m.actualBoundingBoxAscent, 70), desc = Math.max(m.actualBoundingBoxDescent, 30);
  const fs = Math.min(100 * W * .8 / (Lx + Rx), 100 * H * .8 / (asc + desc), H * .62);
  const base = H * .5 + (asc - desc) / 100 * fs / 2;
  return {fs, base, cx: W / 2 - (Rx - Lx) / 2 * fs / 100};
}
function glyph(ctx, x, L){ ctx.font = FSPEC(L.fs); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; }
function draw(){
  const x = WS.items[WS.idx], g = sizeCanvas($('#wGuide')); sizeCanvas($('#wInk')); undo.length = 0; activeId = null; drawing = false;
  if (hasStrokes(x)) return drawPat(g, x);
  const L = layout(g, x); WS.fs = L.fs; WS.L = L;
  const W = g.canvas.width, H = g.canvas.height;
  // school lines: baseline, x-height and a faint top line
  g.font = FSPEC(L.fs);
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
  // the cursive letter writes itself first (left to right, like a pen), then a green dot shows where to start
  // letters: no moving pen until their strokes are written down by the school rules (the old left-to-right sweep showed a wrong start)
  $('#wShow').style.display = 'none';
}

// ---------- shapes of the warm-up: the same checking, the real stroke direction is shown ----------
function patStrokes(x, W, H){
  if (DIGIT[x]){
    const hd = Math.min(H * .56, W * .9 / .62), wd = hd * .62, y1 = H * .5 + hd * .5, y3 = y1 - hd;
    const sl = isPrint() ? 0 : Math.tan(15 * Math.PI / 180) * hd, ox = (W - wd) / 2 - sl / 2;
    return {bh: hd * .8, lines:{y3, y2: y3 + hd / 2, y1, y0: y1 + hd / 2},
      strokes: DIGIT[x].map(st=>st.map(([u, v])=>[ox + u * wd + (1 - v) * sl, y3 + v * hd]))};
  }
  if (!isPat(x)){                              // letters, syllables and words by the school norm (write_strokes.js)
    const F = !isPrint() && window.FONT_STROKES && FONT_STROKES[x];   // cursive straight from the school font Slabikář (write_font.js)
    const r = F ? {strokes: F} : WSTROKES.build(x, isPrint()), sl = (isPrint() || F) ? 0 : Math.tan(15 * Math.PI / 180);
    const pts = r.strokes.flat().map(([a, b])=>a - b * sl), x0 = Math.min(...pts), x1 = Math.max(...pts);
    const ys = r.strokes.flat().map(q=>q[1]), yT = Math.min(-2, ...ys), yB = Math.max(1, ...ys);   // fit the height too (háček above Ť)
    const u = Math.min(H * .86 / 3.2, W * .82 / Math.max(.6, x1 - x0), (H / 2 - H * .05) / (-yT - .5), (H / 2 - H * .05) / (yB + .5)), y1 = H / 2 + u * .5, ox = W / 2 - (x0 + x1) / 2 * u;
    return {bh: u * 1.6, lines:{y3: y1 - 2 * u, y2: y1 - u, y1, y0: y1 + u},
      strokes: r.strokes.map(st=>st.map(([a, b])=>[ox + (a - b * sl) * u, y1 + b * u]))};
  }
  const bw = W * .86, bh = Math.min(H * .6, bw * .6), ox = (W - bw) / 2, oy = (H - bh) / 2;
  return {bh, strokes: PAT[x].s(bw, bh).map(st=>st.map(([a, b])=>[ox + a, oy + b]))};
}
function pathOf(ctx, strokes){ ctx.beginPath(); strokes.forEach(st=>{ ctx.moveTo(st[0][0], st[0][1]); st.slice(1).forEach(p=>ctx.lineTo(p[0], p[1])); }); }
function drawPat(g, x){
  const W = g.canvas.width, H = g.canvas.height, {bh, strokes, lines} = patStrokes(x, W, H);
  WS.fs = bh; WS.L = {fs:bh}; WS.strokes = strokes;
  if (lines){                                   // the school lines Y3, Y2 (dashed), Y1 and a faint Y0
    g.lineWidth = Math.max(1, bh * .012);
    [[lines.y3, '#dfe5f6', []], [lines.y2, '#dfe5f6', [bh * .05, bh * .05]], [lines.y1, '#c9d2ee', []], [lines.y0, '#f0f2fa', []]].forEach(([y, c, dsh])=>{
      g.strokeStyle = c; g.setLineDash(dsh); g.beginPath(); g.moveTo(W * .04, y); g.lineTo(W * .96, y); g.stroke(); });
    g.setLineDash([]);
  }
  g.lineJoin = g.lineCap = 'round';
  pathOf(g, strokes); g.strokeStyle = '#eef2fd'; g.lineWidth = bh * .24; g.stroke();
  pathOf(g, strokes); g.strokeStyle = '#b7c0e3'; g.lineWidth = bh * .05; g.stroke();
  const off = document.createElement('canvas'); off.width = W; off.height = H;
  const o = off.getContext('2d'); o.lineJoin = o.lineCap = 'round'; o.strokeStyle = '#000';
  pathOf(o, strokes); o.lineWidth = bh * .32; o.stroke(); WS.mask = o.getImageData(0, 0, W, H).data;
  o.clearRect(0, 0, W, H); pathOf(o, strokes); o.lineWidth = bh * .04; o.stroke(); WS.target = o.getImageData(0, 0, W, H).data;
  $('#wShow').style.display = '';
  demoPat();
}
// the pen goes along the real strokes, then a green dot stays at the start of every stroke
function demoPat(){
  const my = ++WS.demo, g = $('#wGuide'), W = g.width, H = g.height, strokes = WS.strokes, bh = WS.fs;
  const d = sizeCanvas($('#wDemo'));
  const pts = strokes.flatMap((st, si)=>st.map((p, i)=>({p, si, i})));
  const len = strokes.reduce((a, st)=>a + st.slice(1).reduce((b, p, i)=>b + Math.hypot(p[0] - st[i][0], p[1] - st[i][1]), 0), 0);
  const dur = Math.min(5000, 1200 + len / bh * 450), t0 = performance.now();
  WS.demoOn = true;
  const frame = now=>{
    if (my !== WS.demo) return;
    const k = Math.max(0, Math.min(1, (now - t0) / dur)), upto = Math.floor(k * (pts.length - 1));
    d.clearRect(0, 0, W, H); d.lineJoin = d.lineCap = 'round'; d.strokeStyle = '#ff8a3d'; d.lineWidth = bh * .05;
    d.beginPath();
    for (let j = 0; j <= upto; j++){ const q = pts[j]; if (q.i === 0) d.moveTo(q.p[0], q.p[1]); else d.lineTo(q.p[0], q.p[1]); }
    d.stroke();
    const pen = pts[upto].p;
    d.fillStyle = '#ff8a3d'; d.strokeStyle = '#fff'; d.lineWidth = bh * .02;
    d.beginPath(); d.arc(pen[0], pen[1], bh * .06, 0, 7); d.fill(); d.stroke();
    if (k < 1) return requestAnimationFrame(frame);
    setTimeout(()=>{
      if (my !== WS.demo) return;
      d.clearRect(0, 0, W, H); WS.demoOn = false;
      const gc = g.getContext('2d'); gc.fillStyle = '#2fc77a'; gc.strokeStyle = '#fff'; gc.lineWidth = bh * .02;
      const labels = [];
      strokes.forEach((st, i)=>{
        // a little arrow a bit along the stroke, pointing the way
        const k = Math.min(st.length - 1, Math.max(3, Math.round(st.length * .18))), a = st[k], b = st[Math.min(st.length - 1, k + 2)];
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), r = bh * .07;
        gc.save(); gc.translate(a[0], a[1]); gc.rotate(ang); gc.fillStyle = '#2fc77a';
        gc.beginPath(); gc.moveTo(r, 0); gc.lineTo(-r * .7, -r * .75); gc.lineTo(-r * .7, r * .75); gc.closePath(); gc.fill(); gc.restore();
        gc.fillStyle = '#2fc77a'; gc.strokeStyle = '#fff'; gc.lineWidth = bh * .02;
        gc.beginPath(); gc.arc(st[0][0], st[0][1], bh * .07, 0, 7); gc.fill(); gc.stroke();
        if (strokes.length > 1){                  // the number of the stroke beside its start, on the left of the way it goes
          const vert = Math.abs(Math.sin(ang)) > Math.abs(Math.cos(ang));
          let nx = st[0][0] - (vert ? bh * .17 : 0), ny = st[0][1] - (vert ? 0 : bh * .17);
          for (let g = 0; g < 6 && labels.some(([lx, ly])=>Math.hypot(lx - nx, ly - ny) < bh * .14); g++){ if (vert) nx -= bh * .14; else ny -= bh * .14; }
          labels.push([nx, ny]);
          gc.fillStyle = '#ff8a3d'; gc.strokeStyle = '#fff'; gc.lineWidth = bh * .02;
          gc.beginPath(); gc.arc(nx, ny, bh * .065, 0, 7); gc.fill(); gc.stroke();
          gc.fillStyle = '#fff'; gc.font = `900 ${bh * .09}px Nunito, sans-serif`; gc.textAlign = 'center'; gc.textBaseline = 'middle';
          gc.fillText(String(i + 1), nx, ny + bh * .005); }
      });
    }, 450);
  };
  requestAnimationFrame(frame);
}

// ---------- the letter writes itself (cursive only: its strokes really go from left to right) ----------
function demo(){
  const my = ++WS.demo, g = $('#wGuide'), W = g.width, H = g.height, t = WS.target, L = WS.L, x = WS.items[WS.idx];
  const d = sizeCanvas($('#wDemo'));
  // ink of the letter, column by column
  const step = 2, cols = [];
  let x0 = -1, x1 = -1;
  for (let cx = 0; cx < W; cx += step){
    const ys = [];
    for (let y = 0; y < H; y += step) if (t[(y * W + cx) * 4 + 3] > 100) ys.push(y);
    cols.push(ys); if (ys.length){ if (x0 < 0) x0 = cx; x1 = cx; }
  }
  if (x0 < 0) return;
  const startY = cols[x0 / step].reduce((a, b)=>a + b, 0) / cols[x0 / step].length;
  const pic = document.createElement('canvas'); pic.width = W; pic.height = H;
  const pc = pic.getContext('2d'); glyph(pc, x, L); pc.lineJoin = pc.lineCap = 'round';
  pc.fillStyle = pc.strokeStyle = '#ff8a3d'; pc.lineWidth = L.fs * .03; pc.strokeText(x, L.cx, L.base); pc.fillText(x, L.cx, L.base);
  WS.demoOn = true;
  const dur = Math.min(4200, 900 + (x1 - x0) / L.fs * 1100), t0 = performance.now();
  let py = startY;
  const frame = now=>{
    if (my !== WS.demo) return;
    const k = Math.max(0, Math.min(1, (now - t0) / dur)), fx = x0 + (x1 - x0) * k;
    const ys = cols[Math.round(fx / step)] || [];
    if (ys.length) py = ys.reduce((a, b)=>Math.abs(b - py) < Math.abs(a - py) ? b : a);
    d.clearRect(0, 0, W, H);
    d.save(); d.beginPath(); d.rect(0, 0, fx + 1, H); d.clip(); d.drawImage(pic, 0, 0); d.restore();
    d.fillStyle = '#ff8a3d'; d.strokeStyle = '#fff'; d.lineWidth = L.fs * .012;
    d.beginPath(); d.arc(fx, py, L.fs * .035, 0, 7); d.fill(); d.stroke();
    if (k < 1) return requestAnimationFrame(frame);
    setTimeout(()=>{
      if (my !== WS.demo) return;
      d.clearRect(0, 0, W, H); WS.demoOn = false;
      // green start dot on the guide: here the pen goes down
      const gc = g.getContext('2d'); gc.fillStyle = '#2fc77a'; gc.strokeStyle = '#fff'; gc.lineWidth = L.fs * .012;
      gc.beginPath(); gc.arc(x0, startY, L.fs * .04, 0, 7); gc.fill(); gc.stroke();
    }, 450);
  };
  requestAnimationFrame(frame);
}
$('#wShow').addEventListener('click', ()=>{ sfx.tap(); if (!WS.done) (WS.pat ? demoPat : demo)(); });
window.addEventListener('resize', ()=>{ if (isOn('wtrace') && WS.items.length) draw(); });

// ---------- finger ----------
const ink = $('#wInk');
let drawing = false, last = null, checkT = null, activeId = null, penAt = 0;
const undo = [];
function pos(e){ const r = ink.getBoundingClientRect(); return [(e.clientX - r.left) * ink.width / r.width, (e.clientY - r.top) * ink.height / r.height]; }
// palm rejection: only one pointer draws at a time; a big contact (a resting hand) is ignored;
// once a real pen was used, finger/palm touches are ignored for a while
function isPalm(e){
  if (e.pointerType === 'pen'){ penAt = Date.now(); return false; }
  if (e.pointerType === 'touch' && Date.now() - penAt < 60000) return true;
  return Math.max(e.width || 0, e.height || 0) > 42;
}
ink.addEventListener('pointerdown', e=>{
  e.preventDefault();
  if (WS.done || WS.demoOn || activeId !== null || isPalm(e)) return;
  activeId = e.pointerId; try{ ink.setPointerCapture(e.pointerId); }catch(err){}
  const c = ink.getContext('2d');
  undo.push(c.getImageData(0, 0, ink.width, ink.height)); if (undo.length > 15) undo.shift();
  drawing = true; last = pos(e); clearTimeout(checkT); dot(last);
});
ink.addEventListener('pointermove', e=>{
  if (!drawing || e.pointerId !== activeId) return;
  if (e.pointerType === 'touch' && Math.max(e.width || 0, e.height || 0) > 60){ cancelStroke(); return; }   // turned out to be a palm
  const p = pos(e), c = ink.getContext('2d');
  c.strokeStyle = '#2f6fd8'; c.lineWidth = WS.fs * PEN(); c.lineCap = c.lineJoin = 'round';
  c.beginPath(); c.moveTo(last[0], last[1]); c.lineTo(p[0], p[1]); c.stroke(); last = p;
});
['pointerup','pointercancel'].forEach(ev=>ink.addEventListener(ev, e=>{
  if (e.pointerId !== activeId) return;
  activeId = null;
  if (!drawing) return; drawing = false; clearTimeout(checkT); checkT = setTimeout(check, 450);
}));
function cancelStroke(){
  drawing = false; activeId = null;
  const snap = undo.pop(); if (snap) ink.getContext('2d').putImageData(snap, 0, 0);
}
function dot(p){ const c = ink.getContext('2d'); c.fillStyle = '#2f6fd8'; c.beginPath(); c.arc(p[0], p[1], WS.fs*PEN()/2, 0, 7); c.fill(); }

function measure(){
  const c = ink.getContext('2d'), W = ink.width, H = ink.height, d = c.getImageData(0, 0, W, H).data;
  const step = Math.max(2, Math.round(WS.fs / 60));
  let tN = 0, tHit = 0, iN = 0, iOut = 0;
  // the letter is also checked piece by piece, so a missing stroke or end is not hidden by the average
  const B = Math.max(8, Math.round(WS.fs * .1)), bins = new Map();
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step){
    const i = (y * W + x) * 4 + 3;
    if (WS.target[i] > 100){
      tN++; const hit = d[i] > 0; if (hit) tHit++;
      const k = ((y / B) | 0) * 10000 + ((x / B) | 0), b = bins.get(k) || [0, 0];
      b[0]++; if (hit) b[1]++; bins.set(k, b);
    }
    if (d[i] > 0){ iN++; if (WS.mask[i] < 50) iOut++; }
  }
  WS.inkN = iN; WS.tN = tN;
  let gaps = 0;                                         // pieces of the letter left (almost) grey
  bins.forEach(([n, h])=>{ if (n >= 4 && h / n < .3) gaps++; });
  return {cover: tN ? tHit / tN : 0, out: iN ? iOut / iN : 0, gaps};
}
async function check(){
  if (WS.done || !isOn('wtrace')) return;
  const {cover, out, gaps} = measure(), my = WS.run;
  if (out > .35 && (cover > .3 || WS.inkN > WS.tN * .6)){                       // scribbled outside the letter
    WS.miss++; sfx.bad(); $('#wBubble').textContent = 'Jezdi přesně po šedé čáře.';
    speak(W_SAY.slow); clearInk(); return;
  }
  if (cover >= .85 && gaps === 0){
    WS.done = true; const first = WS.miss === 0;
    if (A.progress) A.progress.track('write', (isPrint() ? 'tiskací ' : '') + WS.items[WS.idx], first);
    if (first){ WS.stars++; WS.res[WS.idx] = 1; } else WS.res[WS.idx] = 2;
    recolor(); sfx.good(); confetti(first ? 35 : 15);
    const p = pick(W_SAY.praise), x = WS.items[WS.idx];
    $('#wBubble').innerHTML = `${p} <b class="${FCLASS()}">${x}</b>`; $('#wStars').textContent = '✓ ' + WS.stars;
    await speak(p); await sayWritten(x); await new Promise(r=>setTimeout(r, 500));
    if (my !== WS.run || !isOn('wtrace')) return;
    if (WS.ext){ const cb = WS.ext; WS.ext = null; return cb(first); }     // one item for the game Ze všeho
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
$('#wClear').addEventListener('click', ()=>{ sfx.tap(); if (!WS.done){ clearInk(); undo.length = 0; } });
$('#wUndo').addEventListener('click', ()=>{               // takes back the last stroke (e.g. a hand touched the screen)
  sfx.tap(); if (WS.done || !undo.length) return;
  ink.getContext('2d').putImageData(undo.pop(), 0, 0); clearTimeout(checkT);
});
$('#wSay').addEventListener('click', ()=>{ sfx.tap(); sayItem(WS.items[WS.idx]); });

WS.demo = 0; WS.demoOn = false;
// the game Ze všeho borrows this screen for one item: done(firstTry), or done(null) when she goes back
A.write = {
  traceOne(x, done, font){
    WS.lesson = {id:'ext', items:[x], font}; WS.items = [x]; WS.idx = 0; WS.stars = 0; WS.res = []; WS.ext = done;
    A.go('wtrace');
    document.fonts.load(FSPEC(100)).then(()=>{ setup(true); });
  },
  // Ze všeho: only syllables and numbers – mostly print letters, cursive only now and then
  item: () => { const ok = a => a.filter(x=>isNum(x) || A.allowed(x));
    return Math.random() < .8 ? {x: pick(ok([...W_LESSONS[8].items, ...W_LESSONS[5].items])), font:'print'}
                              : {x: pick(ok([...W_LESSONS[2].items, ...W_LESSONS[5].items]))}; },
};
document.querySelector('#wtrace [data-back]').addEventListener('click', e=>{
  if (!WS.ext) return;
  e.stopPropagation(); const cb = WS.ext; WS.ext = null; sfx.tap(); cb(null);
});
A.onLeave(()=>{ WS.run++; WS.demo++; WS.demoOn = false; });
// for automated tests
window.__writeTest = {WS, PEN};

A.phraseSources.push(()=>[W_SAY.warm, ...W_LESSONS.flatMap(l=>l.items).flatMap(x=>[...promptParts(x), ...writtenParts(x)]), W_SAY.pick, W_SAY.start, W_SAY.slow, W_SAY.rest, ...W_SAY.praise]);
})();
