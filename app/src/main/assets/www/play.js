/* Herna (tři klidné hry za tlapky) a návštěvy kamarádů na Ayřině cestě */
(function(){
'use strict';
const A = window.App; if (!A) return;
const {speak, sfx, confetti, store, pick} = A;
const $ = s => document.querySelector(s);
const isOn = id => document.getElementById(id).classList.contains('active');
const shuffle = a => a.sort(()=>Math.random()-.5);
const wait = ms => new Promise(r=>setTimeout(r, ms));
const dayNo = () => { const d = new Date(); return Math.floor(d.getTime()/86400000 - d.getTimezoneOffset()/1440); };

// names of the journey friends (A.STICKERS, same order) – for what Ayra and the friend say
const FRIEND = ['pejsek','kočička','zajíček','veverka','ježek','želva','kachnička','kuřátko','tučňák','sova','papoušek',
  'plameňák','včelka','motýlek','beruška','delfín','velryba','krab','chobotnice','vydra','klokan','lenochod','koník',
  'ovečka','kozička','jelen','slon','tygr','dinosaurus','dráček'];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const SAY = {
  herna:'Vítej v herně! Za každou tlapku si zahraješ jednu hru.',
  noPaw:'Na hru potřebuješ tlapku. Tlapku dostaneš, když si zahraješ kolo počítání, čtení nebo psaní.',
  garden:'Zahrádka! Za každou správnou odpověď zaliješ kytičku a ona povyroste.',
  gardenDone:'Kytička vykvetla! Zasadíme ji do zahrádky.',
  feed:'Kamarádi mají hlad. Dej každému tolik, kolik chce, a ťukni na fajfku.',
  feedWrong:'To není tolik, kolik chci. Spočítej to znovu.',
  feedDone:'Všichni kamarádi jsou najedení. Děkujeme!',
  bones:'Pozor, veverky chtějí odnést Ayře kostičky! Každá správná odpověď jednu veverku zažene.',
  bonesGone:'Ťap! Jedna veverka utekla!', bonesTaken:'Jejda, tahle veverka si vzala kostičku.',
  bonesDone:'Veverky jsou pryč! Ubránila jsi kostičky.',
  again:'Zkus to znovu.', listen:'Poslouchej.', find:'Najdi slabiku.', pic:'Přečti slovo a ukaž správný obrázek.',
  ok:['Výborně!','Správně!','Super!','Paráda!'],
  visitWin:'Hurá! Kamarád jde s námi na cestu!',
  fork:'Rozcestí! Kudy půjdeme? Vyber si cestičku.', treasure:'Haf haf! Na téhle cestičce byl poklad!',
  berries:'Mňam! Na téhle cestičce rostly jahůdky.',
  journeyBtn:'Na zastávce na nás čeká kamarád. Pojď ho pozdravit!'
};
const greet = n => `Ahoj, tady ${n}! Vyřeš se mnou tři úkoly a půjdu s vámi.`;
// numbers with a noun: jablíčko (neuter), kostička (feminine)
const NUM_N = ['','jedno','dvě','tři','čtyři','pět','šest','sedm','osm','devět','deset'];
const NUM_F = ['','jednu','dvě','tři','čtyři','pět','šest','sedm','osm','devět','deset'];
const FOOD = [
  {e:'🍎', say:n => `Dej mi ${NUM_N[n]} ${n===1?'jablíčko':n<5?'jablíčka':'jablíček'}.`},
  {e:'🦴', say:n => `Dej mi ${NUM_F[n]} ${n===1?'kostičku':n<5?'kostičky':'kostiček'}.`},
];

// ---------- paws are tickets for the Herna: one paw for every day of practice ----------
const pawsAll = () => store.get('paws', []).length;
const pawBal = () => Math.max(0, pawsAll() - store.get('pawSpent', 0));
function givePrize(n){                     // stars for the shop and for the journey
  store.set('wallet', store.get('wallet', 0) + n);
  const won = A.addStars(n);
  return A.toastStars(n, won);
}

// ---------- one small task: math, "find the syllable" or "read the word, show the picture" ----------
function makeTask(){
  const words = A.wordPics ? A.wordPics() : [], syl = A.syllables ? A.syllables() : [];
  const kinds = ['math','math'];
  if (syl.length >= 3) kinds.push('syl');
  if (words.length >= 3) kinds.push('pic');
  const kind = pick(kinds), max = A.S.max || 5;
  if (kind === 'math'){
    const t = A.math.genTask(pick(['add','sub','cmp']), max);
    if (t.type === 'cmp') return {q:`${t.a} ? ${t.b}`, say:[A.math.prompt(t)], opts:['<','=','>'], ans:t.answer, after:A.math.solution(t)};
    const opts = new Set([t.answer]);
    while (opts.size < 3){ const v = t.answer + pick([-2,-1,1,2]); if (v >= 1 && v <= max) opts.add(v); }
    return {q:`${t.a} ${t.type==='add'?'+':'−'} ${t.b} = ?`, say:[A.math.prompt(t)], opts:shuffle([...opts].map(String)), ans:String(t.answer), after:A.math.solution(t)};
  }
  if (kind === 'syl'){
    const base = x => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const s = pick(syl).toLowerCase(), opts = [s];
    for (let g = 0; opts.length < 3 && g < 200; g++){ const x = pick(syl).toLowerCase(); if (!opts.some(o=>base(o)===base(x))) opts.push(x); }
    return {q:'👂', say:[SAY.find, s], opts:shuffle(opts), ans:s, after:s};
  }
  const [w, e] = pick(words), all = A.allPics();
  const opts = [e]; while (opts.length < 3){ const x = pick(all); if (!opts.includes(x)) opts.push(x); }
  return {q:w, say:[SAY.pic], opts:shuffle(opts), ans:e, after:w.toLowerCase(), pics:true};
}
const sayAll = (parts, queue) => parts.reduce((p, t, i)=>speak(t, {queue: i > 0 || !!queue}), null);
// shows a task in box/answers, resolves with true (first try) or false; she can't fail: after 2 misses Ayra shows it
function runTask(box, ans, bubble, scr){
  return new Promise(done=>{
    const t = makeTask(); let miss = 0, busy = false;
    bubble.textContent = t.pics ? 'Přečti slovo a ukaž obrázek.' : t.q === '👂' ? 'Najdi slabiku, kterou říkám.' : 'Vyber správnou odpověď.';
    box.innerHTML = `<div class="pq ${t.pics?'word':''}">${t.q.replace('<','&lt;')}</div><button class="round-btn psay" aria-label="Zopakovat">🔊</button>`;
    box.querySelector('.psay').onclick = ()=>{ sfx.tap(); sayAll(t.say); };
    ans.classList.remove('locked');
    const esc = o => o.replace('<','&lt;').replace('>','&gt;');
    ans.innerHTML = t.opts.map(o=>`<button class="ans ${t.pics?'pimg':''}" data-v="${esc(o)}">${esc(o)}</button>`).join('');
    sayAll(t.say);
    ans.onclick = async e=>{
      const b = e.target.closest('.ans'); if (!b || busy || !isOn(scr)) return;
      if (b.dataset.v === t.ans){
        busy = true; ans.classList.add('locked'); b.classList.add('right'); sfx.good();
        const p = pick(SAY.ok); bubble.textContent = p; speak(p); await speak(t.after, {queue:true});
        await wait(350); done(miss === 0);
      } else {
        miss++; sfx.bad(); b.classList.add('wrong');
        if (miss === 1){ bubble.textContent = 'Zkus to znovu!'; speak(SAY.again); }
        else { const r = [...ans.querySelectorAll('.ans')].find(x=>x.dataset.v === t.ans); if (r) r.classList.add('hint'); bubble.textContent = 'Tady je to správně.'; speak(SAY.listen); speak(t.after, {queue:true}); }
      }
    };
  });
}

// ---------- screens ----------
document.getElementById('end').insertAdjacentHTML('beforebegin', `
<section id="herna" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Herna</h1>
    <div style="flex:1"></div><div class="scount" id="hPaws"></div></div>
  <div class="hero"><div class="owl" id="hOwl"></div><div class="bubble" id="hBubble">Za každou tlapku si zahraješ jednu hru!</div></div>
  <div class="lsec"><div class="lessons">
    <button class="lesson" style="--c:var(--teal);--d:var(--teal-d)" data-hg="garden"><span class="le">🌱</span><span class="lt"><b>Zahrádka</b><small>správná odpověď zalije kytičku</small></span></button>
    <button class="lesson" style="--c:var(--orange);--d:var(--orange-d)" data-hg="feed"><span class="le">🍎</span><span class="lt"><b>Nakrm kamarády</b><small>dej každému tolik, kolik chce</small></span></button>
    <button class="lesson" style="--c:var(--violet);--d:var(--violet-d)" data-hg="bones"><span class="le">🐿️</span><span class="lt"><b>Ubraň kostičky</b><small>zažeň veverky správnými odpověďmi</small></span></button>
  </div></div>
  <div class="lcard"><h4>🌷 Moje zahrádka</h4><div class="hgarden" id="hGarden"></div></div>
</section>
<section id="hgame" class="screen">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><div style="flex:1"></div><div class="scount" id="hgCount"></div></div>
  <div class="gtalk"><div class="owl"></div><div class="bubble" id="hgBubble"></div></div>
  <div class="hscene" id="hgScene"></div>
  <div class="card pcard" id="hgBox"></div>
  <div class="answers pans" id="hgAns"></div>
</section>
<section id="jvisit" class="screen">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><div style="flex:1"></div><div class="scount" id="jvCount"></div></div>
  <div class="gtalk"><div class="vfriend" id="jvFriend"></div><div class="bubble" id="jvBubble"></div></div>
  <div class="hscene" id="jvScene"></div>
  <div class="card pcard" id="jvBox"></div>
  <div class="answers pans" id="jvAns"></div>
</section>`);

// hub: the Herna card under the reward buttons
const adv = document.getElementById('advCard');
if (adv) adv.insertAdjacentHTML('beforebegin', `<button class="advcard hernacard" id="hernaCard">🎮 <b>Herna</b><span id="hernaTxt"></span></button>`);
$('#hernaCard').addEventListener('click', ()=>{ sfx.tap(); openHerna(); speak(SAY.herna); });
function renderCard(){ const t = $('#hernaTxt'); if (t) t.textContent = `🐾 ${pawBal()} ${pawBal()===1?'tlapka':pawBal()>=2&&pawBal()<=4?'tlapky':'tlapek'} na hraní`; }
renderCard();
A.onLeave(id=>{ if (id !== 'hgame' && id !== 'jvisit') RUN++; if (id === 'hub') setTimeout(renderCard, 0); });
document.addEventListener('visibilitychange', renderCard);
setInterval(()=>{ if (isOn('hub')) renderCard(); }, 2000);

function openHerna(){
  A.go('herna');
  $('#hPaws').textContent = '🐾 ' + pawBal();
  const g = store.get('garden', []);
  $('#hGarden').innerHTML = g.length ? g.map(c=>c.charAt(0) === '#' ? `<span class="gmini">${plantSVG(1, c)}</span>` : `<span>${c}</span>`).join('') : '<small>Zatím prázdná. Zahraj si Zahrádku!</small>';
  // a game she left in the middle goes on for free
  const open = store.get('hplay', {});
  document.querySelectorAll('[data-hg]').forEach(b=>{
    const sm = b.querySelector('small'); if (!b.dataset.sub) b.dataset.sub = sm.textContent;
    b.classList.toggle('hopen', !!open[b.dataset.hg]);
    sm.textContent = open[b.dataset.hg] ? '▶ rozehraná hra – pokračuj zdarma' : b.dataset.sub;
  });
}
$('#hOwl').addEventListener('click', ()=>speak(SAY.herna));
document.querySelectorAll('[data-hg]').forEach(b=>b.addEventListener('click', ()=>{
  sfx.tap();
  const g = b.dataset.hg, open = store.get('hplay', {});
  if (!open[g]){
    if (pawBal() < 1){ $('#hBubble').textContent = 'Na hru potřebuješ tlapku 🐾. Dostaneš ji za den s procvičováním.'; speak(SAY.noPaw); return; }
    store.set('pawSpent', store.get('pawSpent', 0) + 1);
    open[g] = {i:0, first:0, n:0}; store.set('hplay', open);
  }
  ({garden, feed, bones})[g](open[g]);
}));
// progress of a game is saved after every task, so leaving does not cost the paw
const saveG = (g, st) => { const o = store.get('hplay', {}); o[g] = st; store.set('hplay', o); };
const endG = g => { const o = store.get('hplay', {}); delete o[g]; store.set('hplay', o); };

let RUN = 0;
const ROUNDS_BASE = 8;
async function finishGame(score, of, msg){
  const my = RUN;
  await speak(msg);
  if (my !== RUN || !isOn('hgame')) return;
  const add = score/of >= .9 ? 3 : score/of >= .6 ? 2 : 1;
  await givePrize(add);
  await wait(1200);
  if (my === RUN && isOn('hgame')) openHerna();
}

// a flower pot drawn in SVG: p = 0 (only soil) … 1 (in bloom); c = colour of the flower
function plantSVG(p, c, water){
  const top = 150 - 118 * p, leaf = (y, side, k) => `<ellipse cx="${100 + side*17}" cy="${y}" rx="${16*k}" ry="${7*k}" fill="#4cb860"
    transform="rotate(${side*-28} ${100 + side*17} ${y})"/>`;
  let g = '';
  if (p > 0){
    g += `<path d="M100 152 C 98 ${(152 + top)/2}, 103 ${(152 + top)/2}, 100 ${top}" stroke="#3d9a4f" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    [[.2, 132], [.45, 112], [.7, 92]].forEach(([at, y], i)=>{ if (p > at){ const k = Math.min(1, (p - at) / .2); g += leaf(Math.max(y, top + 14), i % 2 ? 1 : -1, k); } });
    if (p >= .85 && p < 1) g += `<ellipse cx="100" cy="${top - 4}" rx="9" ry="12" fill="${c}"/><path d="M92 ${top + 2} Q100 ${top + 10} 108 ${top + 2}" fill="#4cb860"/>`;
    if (p >= 1) g += [0,60,120,180,240,300].map(a=>`<ellipse cx="100" cy="${top - 15}" rx="10" ry="16" fill="${c}" transform="rotate(${a} 100 ${top})"/>`).join('')
      + `<circle cx="100" cy="${top}" r="9" fill="#ffd23f"/>`;
  }
  const drops = water ? `<g class="gdrops"><path d="M70 20 q5 9 0 13 q-5 -4 0 -13z"/><path d="M100 8 q5 9 0 13 q-5 -4 0 -13z"/><path d="M130 22 q5 9 0 13 q-5 -4 0 -13z"/></g>` : '';
  return `<svg viewBox="0 0 200 220" class="gsvg">${drops}${g}
    <path d="M52 150 L148 150 L136 212 L64 212 Z" fill="#d9734a"/><rect x="46" y="140" width="108" height="16" rx="5" fill="#e88a5f"/>
    <ellipse cx="100" cy="148" rx="48" ry="6" fill="#6b4226"/></svg>`;
}

// 🌱 garden: every correct answer waters the flower, it grows; the flower goes to the garden
const COLORS = ['#ff6b9a','#ff9f1c','#a66bff','#ff4d4d','#4da3ff','#ffd23f'];
async function garden(st){
  A.go('hgame'); const my = ++RUN;
  if (!st.n){ st.n = A.roundLen(ROUNDS_BASE); st.c = pick(COLORS); saveG('garden', st); }
  const N = st.n;
  const draw = (k, water) => { $('#hgScene').innerHTML = `<div class="gplant">${plantSVG(k / N, st.c, water)}</div>`; };
  draw(st.i); $('#hgBubble').textContent = 'Odpověz a zalij kytičku.';
  $('#hgBox').innerHTML = ''; $('#hgAns').innerHTML = '';
  if (!st.i) await speak(SAY.garden);
  for (; st.i < N; ){
    if (my !== RUN || !isOn('hgame')) return;
    $('#hgCount').textContent = `💧 ${st.i} / ${N}`;
    const ok = await runTask($('#hgBox'), $('#hgAns'), $('#hgBubble'), 'hgame');
    if (my !== RUN) return;
    if (ok) st.first++; st.i++; saveG('garden', st);
    draw(st.i, true); confetti(10); await wait(800); if (my === RUN) draw(st.i);
  }
  $('#hgCount').textContent = `💧 ${N} / ${N}`;
  const g = store.get('garden', []); g.push(st.c); store.set('garden', g); endG('garden');
  $('#hgBox').innerHTML = ''; $('#hgAns').innerHTML = ''; confetti(40);
  finishGame(st.first, N, SAY.gardenDone);
}

// 🍎 feed the friends: count the right number of apples/bones into the bowl
async function feed(st){
  A.go('hgame'); const my = ++RUN;
  if (!st.n){ st.n = A.roundLen(5); saveG('feed', st); }
  const N = st.n, got = Math.max(3, (store.get('stk', {got:0}).got || 0));
  const friends = A.STICKERS.slice(0, Math.min(got, A.STICKERS.length));
  const max = A.S.max || 5;
  $('#hgBubble').textContent = 'Dej kamarádovi tolik, kolik chce.';
  $('#hgScene').innerHTML = ''; $('#hgBox').innerHTML = ''; $('#hgAns').innerHTML = '';
  if (!st.i) await speak(SAY.feed);
  for (; st.i < N; ){
    if (my !== RUN || !isOn('hgame')) return;
    $('#hgCount').textContent = `${st.i} / ${N}`;
    const f = pick(friends), food = pick(FOOD), n = 1 + Math.floor(Math.random() * max);
    let put = 0, miss = 0;
    $('#hgScene').innerHTML = `<div class="ffriend">${f}</div><div class="fwant">${food.e} × ${n}</div>`;
    $('#hgBubble').textContent = food.say(n);
    const render = () => { $('#hgBox').innerHTML = `<div class="fbowl">${food.e.repeat(put) || '<small>miska</small>'}</div>`; };
    render();
    $('#hgAns').classList.remove('locked');
    $('#hgAns').innerHTML = `<button class="ans fput">${food.e}</button><button class="ans fundo">↩️</button><button class="ans fok">✓</button>`;
    speak(food.say(n));
    const ok = await new Promise(res=>{
      $('#hgAns').onclick = async e=>{
        const b = e.target.closest('.ans'); if (!b || my !== RUN) return;
        if (b.classList.contains('fput')){ if (put < 10){ put++; sfx.tap(); render(); } return; }
        if (b.classList.contains('fundo')){ if (put > 0){ put--; sfx.tap(); render(); } return; }
        if (put === n){ $('#hgAns').classList.add('locked'); sfx.good(); confetti(14); $('#hgBubble').textContent = 'Mňam, děkuju!'; await speak('Mňam, mňam! Děkuju!'); res(miss === 0); }
        else { miss++; sfx.bad(); put = 0; render(); $('#hgBubble').textContent = food.say(n); speak(SAY.feedWrong); speak(food.say(n), {queue:true}); }
      };
    });
    if (my !== RUN) return;
    if (ok) st.first++; st.i++; saveG('feed', st);
    await wait(300);
  }
  endG('feed');
  $('#hgCount').textContent = `${N} / ${N}`; $('#hgBox').innerHTML = ''; $('#hgAns').innerHTML = '';
  finishGame(st.first, N, SAY.feedDone);
}

// 🐿️ squirrels want Ayra's bones: a right answer chases one away (on the first try), else it takes a bone
async function bones(st){
  A.go('hgame'); const my = ++RUN;
  if (!st.n){ st.n = A.roundLen(ROUNDS_BASE); saveG('bones', st); }
  const N = st.n;
  const draw = () => { $('#hgScene').innerHTML = `<div class="bline"><span class="bsq">${'🐿️'.repeat(N - st.i)}</span><span class="bhome">🏠</span></div><div class="bbones">${'🦴'.repeat(st.first)}</div>`; };
  draw(); $('#hgBubble').textContent = 'Zažeň veverky!';
  $('#hgBox').innerHTML = ''; $('#hgAns').innerHTML = '';
  if (!st.i) await speak(SAY.bones);
  for (; st.i < N; ){
    if (my !== RUN || !isOn('hgame')) return;
    $('#hgCount').textContent = `🦴 ${st.first}`;
    const ok = await runTask($('#hgBox'), $('#hgAns'), $('#hgBubble'), 'hgame');
    if (my !== RUN) return;
    st.i++; if (ok) st.first++; saveG('bones', st);
    draw(); $('#hgBubble').textContent = ok ? 'Veverka utekla!' : 'Veverka si vzala kostičku.';
    if (!ok) await speak(SAY.bonesTaken);
    await wait(400);
  }
  endG('bones');
  $('#hgCount').textContent = `🦴 ${st.first}`; $('#hgBox').innerHTML = ''; $('#hgAns').innerHTML = '';
  finishGame(st.first, N, SAY.bonesDone);
}

// ---------- Ayřina cesta: a friend waits at every new stop (3 tasks), sometimes a fork with a treasure ----------
const visited = () => {
  const st = store.get('stk', {got:0});
  let v = store.get('jvisit', null);
  if (v === null){ v = st.got; store.set('jvisit', v); }       // stops reached before this version: already greeted
  return v;
};
A.play = {
  journey(){
    const st = store.get('stk', {got:0}), v = visited();
    const old = $('#jVisitBtn'); if (old) old.remove();
    if (v >= st.got || v >= A.STICKERS.length) return;
    $('#jNext').insertAdjacentHTML('afterbegin', `<button class="advcard ready jvisitbtn" id="jVisitBtn">${A.STICKERS[v]} <b>Kamarád čeká na zastávce!</b><span>pojď ho pozdravit</span></button>`);
    $('#jVisitBtn').addEventListener('click', ()=>{ sfx.tap(); visit(v); });
    setTimeout(()=>speak(SAY.journeyBtn, {queue:true}), 400);
  }
};
async function visit(i){
  A.go('jvisit'); const my = ++RUN;
  const place = A.rewards.PLACES[i] || ['🌳',''], name = FRIEND[i] || 'kamarád';
  $('#jvFriend').textContent = A.STICKERS[i];
  $('#jvScene').innerHTML = `<div class="vplace">${place[0]} <b>${place[1]}</b></div>`;
  $('#jvBubble').textContent = greet(name);
  await speak(greet(name));
  let first = 0;
  for (let k = 0; k < 3; k++){
    if (my !== RUN || !isOn('jvisit')) return;
    $('#jvCount').textContent = `${k} / 3`;
    if (await runTask($('#jvBox'), $('#jvAns'), $('#jvBubble'), 'jvisit')) first++;
  }
  if (my !== RUN) return;
  $('#jvCount').textContent = '3 / 3';
  store.set('jvisit', i + 1);
  $('#jvBox').innerHTML = `<div class="pq">${A.STICKERS[i]} 🐶</div>`; $('#jvAns').innerHTML = '';
  $('#jvBubble').textContent = cap(name) + ' jde s námi!'; confetti(40); sfx.win();
  await speak(SAY.visitWin);
  if (my !== RUN || !isOn('jvisit')) return;
  if (i % 3 === 2) return fork(my);
  await givePrize(first === 3 ? 2 : 1);
  await wait(1200); if (my === RUN && isOn('jvisit')) A.go('journey');
}
// the fork: one path has a treasure (3 stars), the other strawberries (1 star) – nothing is ever lost
async function fork(my){
  $('#jvBubble').textContent = 'Rozcestí! Kudy půjdeme?';
  $('#jvBox').innerHTML = '<div class="pq">🪧</div>';
  $('#jvAns').classList.remove('locked');
  $('#jvAns').innerHTML = `<button class="ans pimg" data-v="l">🌲⬅️</button><button class="ans pimg" data-v="r">➡️🌻</button>`;
  speak(SAY.fork);
  const lucky = Math.random() < .5 ? 'l' : 'r';
  const ch = await new Promise(res=>{ $('#jvAns').onclick = e=>{ const b = e.target.closest('.ans'); if (b) res(b); }; });
  if (my !== RUN) return;
  $('#jvAns').classList.add('locked'); sfx.tap();
  const win = ch.dataset.v === lucky;
  $('#jvBox').innerHTML = `<div class="pq">${win ? '🎁' : '🍓'}</div>`;
  $('#jvBubble').textContent = win ? 'Poklad!' : 'Jahůdky!';
  await speak(win ? SAY.treasure : SAY.berries);
  await givePrize(win ? 3 : 1);
  await wait(1200); if (my === RUN && isOn('jvisit')) A.go('journey');
}

// paws screen: what the paws are for
const pw = $('#pWeek');
if (pw) pw.closest('.lcard').insertAdjacentHTML('beforebegin', `<div class="lcard pawuse"><b>🐾 Tlapky na hraní: <span id="pBal"></span></b>
  <small>Za každý den s procvičováním dostaneš tlapku. Za tlapku si zahraješ jednu hru v Herně.</small>
  <button class="advcard hernacard" id="pToHerna">🎮 <b>Do Herny</b></button></div>`);
const pb = $('#pToHerna'); if (pb) pb.addEventListener('click', ()=>{ sfx.tap(); openHerna(); speak(SAY.herna); });
document.querySelectorAll('[data-rgo="paws"]').forEach(b=>b.addEventListener('click', ()=>{ const e = $('#pBal'); if (e) e.textContent = pawBal(); }));

// ---------- Skládám slova: Ayra says a word, she builds it from letter tiles (in Psaní) ----------
const D_SAY = {start:'Poslouchej slovo a slož ho z písmenek.', wrong:'Tohle písmenko tam nepatří. Poslouchej ještě jednou.', done:'Všechna slova jsou složená!'};
document.getElementById('end').insertAdjacentHTML('beforebegin', `
<section id="wdict" class="screen">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><div style="flex:1"></div>
    <div class="scount" id="wdStars">✓ 0</div><button class="round-btn" id="wdSay" aria-label="Zopakovat">🔊</button></div>
  <div class="dots" id="wdDots"></div>
  <div class="gtalk"><div class="owl"></div><div class="bubble" id="wdBubble"></div></div>
  <div class="card wdcard"><div class="wdpic" id="wdPic"></div><div class="wdslots" id="wdSlots"></div></div>
  <div class="wdtiles" id="wdTiles"></div>
</section>`);
const ex = $('#wExtra');
if (ex) ex.outerHTML = `<button class="lesson" style="--c:var(--violet);--d:var(--violet-d)" id="wdStart"><span class="le">🧩</span><span class="lt"><b>Skládám slova</b><small>poslouchej a slož slovo z písmenek</small></span></button>`;
const WD = {items:[], idx:0, stars:0, res:[], run:0};
const wdBtn = $('#wdStart');
if (wdBtn){
  wdBtn.addEventListener('click', ()=>{ sfx.tap(); startDict(); });
  document.querySelector('#hub [data-go="write"]').addEventListener('click', ()=>{ wdBtn.style.display = A.words && A.words().length >= 3 ? '' : 'none'; });
}
function startDict(){
  const pool = A.words(); WD.items = [];
  const n = A.roundLen(6);
  while (WD.items.length < n){ const w = pick(pool); if (WD.items[WD.items.length-1] !== w && (!WD.items.includes(w) || pool.length < n)) WD.items.push(w); }
  WD.idx = 0; WD.stars = 0; WD.res = []; A.go('wdict'); showDict(true);
}
function showDict(first){
  const w = WD.items[WD.idx], my = ++WD.run, letters = [...w];
  let pos = 0, miss = 0, busy = false;
  const pic = (A.wordPics() || []).find(p=>p[0].toUpperCase() === w);
  $('#wdPic').textContent = pic ? pic[1] : '👂';
  $('#wdDots').innerHTML = WD.items.map((_,i)=>`<div class="dot ${i===WD.idx?'cur':''} ${WD.res[i]===1?'gold':WD.res[i]===2?'ok':''}"></div>`).join('');
  $('#wdStars').textContent = '✓ ' + WD.stars;
  $('#wdBubble').textContent = 'Slož slovo, které slyšíš.';
  $('#wdSlots').innerHTML = letters.map(()=>'<span class="wdslot"></span>').join('');
  // the letters of the word and two more she already knows
  const extra = [], known = A.unlocked().map(c=>c.toUpperCase()).filter(c=>!letters.includes(c));
  while (extra.length < 2 && known.length){ extra.push(known.splice(Math.floor(Math.random()*known.length), 1)[0]); }
  $('#wdTiles').innerHTML = shuffle([...letters, ...extra]).map(c=>`<button class="ans wdtile" data-c="${c}">${c}</button>`).join('');
  const sayW = q => speak(w.toLowerCase(), {queue:!!q});
  if (first){ speak(D_SAY.start); sayW(true); } else sayW();
  $('#wdSay').onclick = ()=>{ sfx.tap(); sayW(); };
  $('#wdTiles').onclick = async e=>{
    const b = e.target.closest('.wdtile'); if (!b || busy || b.disabled || my !== WD.run) return;
    if (b.dataset.c === letters[pos]){
      sfx.tap(); b.disabled = true; b.classList.add('used');
      $('#wdSlots').children[pos].textContent = letters[pos]; $('#wdSlots').children[pos].classList.add('full');
      pos++; document.querySelectorAll('#wdTiles .hint').forEach(x=>x.classList.remove('hint'));
      if (pos < letters.length) return;
      busy = true; sfx.good(); confetti(miss ? 12 : 30);
      if (!miss){ WD.stars++; WD.res[WD.idx] = 1; } else WD.res[WD.idx] = 2;
      if (A.progress) A.progress.track('write', 'slovo ' + w, miss === 0);
      $('#wdStars').textContent = '✓ ' + WD.stars;
      const p = pick(SAY.ok); $('#wdBubble').textContent = p + ' ' + w; speak(p); await sayW(true);
      await wait(600); if (my !== WD.run || !isOn('wdict')) return;
      WD.idx++;
      if (WD.idx >= WD.items.length){ await speak(D_SAY.done); return A.finishRound(WD.stars, startDict, 'write', WD.items.length); }
      showDict();
    } else {
      miss++; sfx.bad(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      $('#wdBubble').textContent = 'Tohle tam nepatří.';
      speak(D_SAY.wrong); sayW(true);
      if (miss >= 2){ const right = [...document.querySelectorAll('#wdTiles .wdtile')].find(x=>!x.disabled && x.dataset.c === letters[pos]); if (right) right.classList.add('hint'); }
    }
  };
}
A.onLeave(id=>{ if (id !== 'wdict') WD.run++; });

// for automated tests
document.querySelector('#hgame [data-back]').addEventListener('click', ()=>setTimeout(()=>{ if (isOn('herna')) openHerna(); }, 0));
window.__playTest = {pawBal, plantSVG, makeTask, visit, garden, feed, bones, startDict};

A.phraseSources.push(()=>{
  const out = [...Object.values(SAY).flat(), ...Object.values(D_SAY), 'Mňam, mňam! Děkuju!'];
  FRIEND.forEach(n=>out.push(greet(n)));
  FOOD.forEach(f=>{ for (let n = 1; n <= 10; n++) out.push(f.say(n)); });
  return out;
});
})();
