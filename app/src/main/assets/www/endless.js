// Učíme se s Ayrou – Ze všeho: an endless game mixing everything, 3 hearts, prizes the further she gets
(() => {
const A = window.App, {speak, sfx, confetti, pick, store} = A;
const $ = s => document.querySelector(s);
const M = A.math;

const E_SAY = {
  start:'Hra ze všeho! Máš tři srdíčka. Čím dál dojdeš, tím lepší odměny!',
  find:'Najdi slabiku.', findW:'Najdi psanou slabiku.', findV:'Najdi písmenko.',
  wrong:'To nebylo ono. Ztrácíš srdíčko.', last:'Pozor, máš poslední srdíčko!',
  over:'Konec hry! To byl skvělý výkon!', record:'Haf haf! Nový rekord!',
  prize:'Haf! Odměna!',
  praise:['Výborně!','Správně!','Super!','Paráda!','Jsi šikulka!'],
};
// prizes on the way (one run); the special things only the first time
const PRIZES = [
  {at:10,  s:3,               t:'⭐ 3 hvězdičky'},
  {at:20,  g:1,               t:'🎁 dárek'},
  {at:30,  pic:'rare',        t:'💜 vzácný obrázek do alba'},
  {at:40,  item:'en_cup',     t:'🏆 Pohár šampiona do boudy'},
  {at:50,  g:2,               t:'🎁🎁 dva dárky'},
  {at:60,  pic:'gold',        t:'✨ zlatý obrázek do alba'},
  {at:75,  item:'en_medal',   t:'🥇 Medaile šampiona pro Ayru'},
  {at:100, item:'en_crown',   t:'👑 Koruna šampiona pro Ayru'},
];
const prizeAt = n => PRIZES.find(p=>p.at===n) || (n > 100 && n % 25 === 0 ? {at:n, g:1, s:5, t:'🎁 dárek a ⭐ 5'} : null);
const nextPrize = n => PRIZES.find(p=>p.at>n) || {at: Math.ceil((n+1)/25)*25, t:'🎁 dárek a ⭐ 5'};

document.getElementById('end').insertAdjacentHTML('beforebegin', `
<section id="endless" class="screen">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button>
    <div class="hearts" id="enHearts"></div><div style="flex:1"></div>
    <div class="scount" id="enCount">🔥 0</div><button class="round-btn" id="enSay" aria-label="Zopakovat">🔊</button></div>
  <div class="ennext" id="enNext"></div>
  <div class="gtalk"><div class="owl"></div><div class="bubble" id="enBubble"></div></div>
  <div class="card encard" id="enCard"></div>
  <div class="answers enans" id="enAns"></div>
</section>`);

const ES = {n:0, hearts:3, task:null, busy:false, run:0, last:''};
const isOn = () => document.getElementById('endless').classList.contains('active');

function start(){
  ES.n = 0; ES.hearts = 3; ES.run++; ES.last = '';
  A.go('endless'); speak(E_SAY.start); next(true);
}
document.querySelector('#hub [data-go="endless"]').addEventListener('click', ()=>setTimeout(start, 0));

// ---------- tasks ----------
const shuffle = a => a.sort(()=>Math.random()-.5);
function makeTask(){
  const lvl = ES.n, max = lvl < 15 ? 5 : 10, nOpt = lvl < 10 ? 3 : 4;
  const kinds = ['add','sub','cmp','syl','syl','cur'];
  let kind;
  do { kind = pick(kinds); } while (kind === ES.last && Math.random() < .7);
  ES.last = kind;
  if (kind==='add' || kind==='sub' || kind==='cmp'){
    const t = M.genTask(kind, max);
    if (kind==='cmp') return {kind, t, say:M.prompt(t), show:`${t.a} <span class="slot">?</span> ${t.b}`, ans:t.answer, opts:['<','=','>'], key:'math'};
    const opts = new Set([t.answer]);
    while (opts.size < nOpt){ const x = t.answer + Math.floor(Math.random()*5) - 2; if (x >= 0 && x <= max) opts.add(x); }
    return {kind, t, say:M.prompt(t), show:`${t.a} ${kind==='add'?'+':'−'} ${t.b} = <span class="slot">?</span>`, ans:t.answer, opts:shuffle([...opts]), key:'math'};
  }
  const pool = A.syllables ? A.syllables().map(s=>s.toLowerCase()) : ['ma','me','mi','mo','mu'];
  const uniq = [...new Set(pool)];
  if (kind==='cur' && Math.random() < .35){                     // a cursive vowel
    const v = pick(['a','e','i','o','u']), opts = new Set([v]);
    while (opts.size < nOpt) opts.add(pick(['a','e','i','o','u','m','l','s','p']));
    return {kind:'cur', say:E_SAY.findV, sayX:v, show:'👂', ans:v, opts:shuffle([...opts]), cursive:true};
  }
  const s = pick(uniq), opts = new Set([s]);
  // similar syllables are the useful distractors: same consonant or same vowel
  const near = uniq.filter(x=>x!==s && (x[0]===s[0] || x[1]===s[1]));
  while (opts.size < nOpt) opts.add(near.length && Math.random() < .75 ? pick(near) : pick(uniq));
  return {kind, say: kind==='cur' ? E_SAY.findW : E_SAY.find, sayX:s, show:'👂', ans:s, opts:shuffle([...opts]), cursive: kind==='cur', key:'read'};
}
function sayTask(queue){
  const t = ES.task; if (!t) return;
  const p = speak(t.say, {queue:!!queue});
  return t.sayX ? speak(t.sayX, {queue:true}) : p;
}
function render(){
  $('#enHearts').innerHTML = [0,1,2].map(i=>`<span class="${i < ES.hearts ? '' : 'lost'}">❤️</span>`).join('');
  $('#enCount').textContent = '🔥 ' + ES.n;
  const np = nextPrize(ES.n), prev = PRIZES.filter(p=>p.at<=ES.n).map(p=>p.at).pop() || 0;
  $('#enNext').innerHTML = `<span>Další odměna: ${np.t}</span><i><b style="width:${Math.round(100*(ES.n-prev)/Math.max(1,np.at-prev))}%"></b></i>`;
}
function next(first){
  ES.task = makeTask(); ES.busy = false;
  const t = ES.task;
  render();
  $('#enBubble').textContent = t.kind==='syl' ? 'Najdi slabiku, kterou říkám.' : t.kind==='cur' ? 'Najdi psané písmo, které říkám.' : t.kind==='cmp' ? 'Větší, menší, nebo rovná se?' : 'Kolik to je?';
  $('#enCard').innerHTML = `<div class="enq ${t.show==='👂'?'ear':''}">${t.show}</div>`;
  $('#enAns').className = 'answers enans' + (t.cursive ? ' cursive' : '');
  $('#enAns').innerHTML = t.opts.map(o=>`<button class="ans" data-v="${o}">${o}</button>`).join('');
  sayTask(!!first);
}
$('#enSay').addEventListener('click', ()=>{ sfx.tap(); sayTask(); });
$('#enCard').addEventListener('click', ()=>{ if (ES.task && ES.task.sayX) sayTask(); });

$('#enAns').addEventListener('click', async e=>{
  const b = e.target.closest('.ans'); if (!b || ES.busy) return;
  ES.busy = true; const t = ES.task, my = ES.run, ok = String(t.ans) === b.dataset.v;
  if (A.progress && t.key) A.progress.track(t.key, t.key==='math' ? t.t.type+'|'+t.t.a+'|'+t.t.b : t.ans, ok);
  $('#enAns').classList.add('locked');
  if (ok){
    b.classList.add('right'); sfx.good(); ES.n++; render();
    if (t.t){ const sl = $('#enCard .slot'); if (sl){ sl.textContent = t.ans; sl.classList.add('filled'); } }
    const pr = prizeAt(ES.n);
    if (pr){ await givePrize(pr); }
    else { confetti(12); await speak(pick(E_SAY.praise)); }
  } else {
    b.classList.add('wrong'); sfx.bad(); ES.hearts--; render();
    const right = [...document.querySelectorAll('#enAns .ans')].find(x=>x.dataset.v===String(t.ans)); if (right) right.classList.add('right');
    if (navigator.vibrate) try{ navigator.vibrate(80); }catch(e){}
    await speak(ES.hearts === 1 ? E_SAY.last : E_SAY.wrong);
    if (t.t) await speak(M.solution(t.t), {queue:true}); else await speak(t.ans, {queue:true});
  }
  await new Promise(r=>setTimeout(r, 450));
  if (my !== ES.run || !isOn()) return;
  if (ES.hearts <= 0) return gameOver();
  next();
});

async function givePrize(p){
  const R = A.rewards, got = [];
  if (p.s){ store.set('wallet', store.get('wallet',0) + p.s); got.push('⭐ ' + p.s); }
  if (p.g){ store.set('boxes', store.get('boxes',0) + p.g); got.push('🎁'.repeat(p.g) + ' v Pokladech'); }
  if (p.pic && R) got.push(R.addPicture(R.drawPicture(p.pic)));
  if (p.item && R){
    const it = R.SHOP.find(i=>i.id===p.item);
    if (R.giveItem(p.item)) got.push(`${it.e} ${it.n}!`);
    else { store.set('wallet', store.get('wallet',0) + 5); got.push('⭐ 5'); }
  }
  if (R) R.renderHub();
  const pop = document.createElement('div'); pop.className = 'enprize';
  pop.innerHTML = `<b>${ES.n}! Odměna:</b><span>${got.join('<br>')}</span>`;
  document.body.appendChild(pop); setTimeout(()=>pop.remove(), 3200);
  sfx.win(); confetti(90);
  await speak(E_SAY.prize);
}

function gameOver(){
  const best = store.get('enBest', 0), rec = ES.n > best;
  if (rec){ store.set('enBest', ES.n); if (best > 0){ store.set('wallet', store.get('wallet',0) + 5); } }
  speak(rec && best > 0 ? E_SAY.record : E_SAY.over);
  A.finishRound(Math.min(ES.n, 20), start, 'hub', 20);
  const extra = `<div class="rewline">🔥 Došla jsi až na <b>${ES.n}</b>. ${rec ? (best > 0 ? '🏆 Nový rekord! +5 ⭐' : '🏆 Tvůj první rekord!') : `Rekord: ${best}`}</div>`;
  const ns = document.getElementById('newStk'); if (ns) ns.insertAdjacentHTML('afterbegin', extra);
  const sc = document.querySelector('#endStars .score'); if (sc) sc.textContent = `došla jsi až na ${ES.n} správně`;
}
A.onLeave(id=>{ if (id !== 'endless') ES.run++; });

A.phraseSources.push(()=>[E_SAY.start, E_SAY.find, E_SAY.findW, E_SAY.findV, E_SAY.wrong, E_SAY.last, E_SAY.over, E_SAY.record, E_SAY.prize, ...E_SAY.praise]);
})();
