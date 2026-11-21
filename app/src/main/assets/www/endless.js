// Učíme se s Ayrou – Ze všeho: an endless game mixing everything, 3 hearts, prizes the further she gets
(() => {
const A = window.App, {speak, sfx, confetti, pick, store} = A;
const $ = s => document.querySelector(s);
const M = A.math;

const E_SAY = {
  start:'Hra ze všeho! Máš tři srdíčka. Čím dál dojdeš, tím lepší odměny!',
  find:'Najdi slabiku.', read:'Přečti slabiku nahlas.', again:'Zkus to znovu.', listen:'Poslouchej.', later:'Tuhle si přečteme jindy.',
  wrong:'To nebylo ono. Ztrácíš srdíčko.', last:'Pozor, máš poslední srdíčko!',
  over:'Konec hry! To byl skvělý výkon!', cont:'Pokračujeme! Kde jsme skončily?', ask:'Chceš pokračovat v rozehrané hře?', record:'Haf haf! Nový rekord!',
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
    <div class="scount" id="enCount">🔥 0</div><button class="round-btn" id="enPics" aria-label="Obrázky">🙈</button><button class="round-btn" id="enSay" aria-label="Zopakovat">🔊</button></div>
  <div class="ennext" id="enNext"></div>
  <div class="gtalk"><div class="owl"></div><div class="bubble" id="enBubble"></div></div>
  <div class="card encard" id="enCard"></div>
  <div class="answers enans" id="enAns"></div>
</section>`);

const ES = {n:0, hearts:3, task:null, busy:false, run:0, last:''};
const isOn = () => document.getElementById('endless').classList.contains('active');

// a game in progress is kept, so she can stop and continue later (hearts and count stay)
const save = () => store.set('enSave', ES.hearts > 0 && ES.n > 0 ? {n:ES.n, hearts:ES.hearts} : null);
function start(cont){
  const sv = cont ? store.get('enSave', null) : null;
  ES.n = sv ? sv.n : 0; ES.hearts = sv ? sv.hearts : 3; ES.run++; ES.last = ''; ES.task = null;
  if (!sv) store.set('enSave', null);
  A.go('endless'); speak(sv ? E_SAY.cont : E_SAY.start); next(true);
}
function offer(){
  const sv = store.get('enSave', null);
  if (!sv) return start(false);
  ES.task = null; ES.busy = false; ES.n = sv.n; ES.hearts = sv.hearts; render();
  $('#enBubble').textContent = `Máš rozehranou hru: 🔥 ${sv.n}. Pokračovat?`;
  $('#enCard').innerHTML = '<div class="enq">🎲</div>';
  $('#enAns').className = 'answers enans';
  $('#enAns').innerHTML = `<button class="ans encont" data-act="cont">▶️ Pokračovat<small>🔥 ${sv.n} · ${'❤️'.repeat(sv.hearts)}</small></button>
    <button class="ans encont" data-act="new">🔄 Nová hra</button>`;
  speak(E_SAY.ask);
}
document.querySelector('#hub [data-go="endless"]').addEventListener('click', ()=>setTimeout(offer, 0));

// ---------- tasks: math (exactly like Matematika), find a syllable, read a syllable, write ----------
const shuffle = a => a.sort(()=>Math.random()-.5);
const enPics = () => store.get('enPics', 0);                   // pictures hidden by default
function makeTask(){
  const nOpt = ES.n < 10 ? 3 : 4;
  const kinds = ['math','math','syl','read','write'];
  let kind;
  do { kind = pick(kinds); } while (kind === ES.last && Math.random() < .75);
  ES.last = kind;
  if (kind==='read' && !(A.stt && A.stt.available())) kind = 'syl';    // no microphone: find it instead
  if (kind==='math'){
    const type = pick(['add','sub','cmp']), t = M.genTask(type, A.S.max);   // "počítáme do" from Matematika
    t.emoji = pick(M.EMOJI); t.emoji2 = pick(M.EMOJI.filter(e=>e!==t.emoji));
    return {kind, t, say:M.prompt(t), ans:t.answer, key:'math'};
  }
  const uniq = [...new Set((A.syllables ? A.syllables() : ['ma','me','mi','mo','mu']).map(s=>s.toLowerCase()))];
  if (kind==='write') return {kind, x: pick(A.write ? A.write.items() : ['a'])};
  const s = pick(uniq);
  if (kind==='read') return {kind, say:E_SAY.read, ans:s, key:'read', tries:0};
  const opts = new Set([s]);
  // similar syllables are the useful distractors: same consonant or same vowel
  const near = uniq.filter(x=>x!==s && (x[0]===s[0] || x[1]===s[1]));
  while (opts.size < nOpt) opts.add(near.length && Math.random() < .75 ? pick(near) : pick(uniq));
  return {kind, say:E_SAY.find, sayX:s, ans:s, opts:shuffle([...opts]), key:'read'};
}
function sayTask(queue){
  const t = ES.task; if (!t || t.kind==='write') return;
  const p = speak(t.say, {queue:!!queue});
  return t.sayX ? speak(t.sayX, {queue:true}) : p;
}
function render(){
  $('#enHearts').innerHTML = [0,1,2].map(i=>`<span class="${i < ES.hearts ? '' : 'lost'}">❤️</span>`).join('');
  $('#enCount').textContent = '🔥 ' + ES.n;
  const np = nextPrize(ES.n), prev = PRIZES.filter(p=>p.at<=ES.n).map(p=>p.at).pop() || 0;
  $('#enNext').innerHTML = `<span>Další odměna: ${np.t}</span><i><b style="width:${Math.round(100*(ES.n-prev)/Math.max(1,np.at-prev))}%"></b></i>`;
  const pb = $('#enPics'); pb.textContent = enPics() ? '🍎' : '🙈'; pb.classList.toggle('off', !enPics());
  pb.style.visibility = ES.task && ES.task.kind==='math' ? '' : 'hidden';
}
function applyPics(){ const t = ES.task; $('#enCard').classList.toggle('nopics', !(enPics() || (t && t.reveal))); }
function next(first){
  ES.task = makeTask(); ES.busy = false;
  const t = ES.task;
  render();
  $('#endless').classList.toggle('mathmode', t.kind==='math'); $('#endless').classList.toggle('readmode', t.kind==='read');
  $('#enAns').className = 'answers enans';
  $('#enCard').classList.remove('nopics');
  if (t.kind==='write'){                                         // tracing in the Psaní screen, then back here
    $('#enBubble').textContent = 'Teď budeme psát!';
    return A.write.traceOne(t.x, first => written(first));
  }
  if (t.kind==='math'){
    $('#enBubble').textContent = t.t.type==='cmp' ? `Je ${t.t.a} větší, menší, nebo stejně jako ${t.t.b}?` : `Kolik je ${t.t.a} ${t.t.type==='add'?'+':'−'} ${t.t.b}?`;
    M.draw($('#enCard'), $('#enAns'), t.t, A.S.max);
    const sl = $('#enCard .slot'); if (sl) sl.removeAttribute('id');
    applyPics();
  } else if (t.kind==='syl'){
    $('#enBubble').textContent = 'Najdi slabiku, kterou říkám.';
    $('#enCard').innerHTML = `<div class="enq ear">👂</div><button class="bigbtn enreplay" style="--c:var(--orange);--d:var(--orange-d)">🔊 Znovu</button>`;
    $('#enAns').innerHTML = t.opts.map(o=>`<button class="ans" data-v="${o}">${o}</button>`).join('');
  } else {                                                       // read one syllable aloud
    $('#enBubble').textContent = 'Přečti slabiku nahlas.';
    $('#enCard').innerHTML = `<div class="enread" id="enSyl">${t.ans}</div><div class="mic" id="enMic">🎤</div><div class="heard" id="enHeard"></div>`;
    $('#enAns').innerHTML = `<button class="bigbtn" style="--c:var(--violet);--d:var(--violet-d)" data-read="again">🎤 Znovu</button>
      <button class="bigbtn small" style="--c:var(--teal);--d:var(--teal-d)" data-read="ok" title="Pro rodiče: potvrdit ručně">✓</button>`;
    $('#enAns').className = 'btns enreadbtns';
    return speak(t.say, {queue:!!first}).then(()=>listen(t));
  }
  sayTask(!!first);
}
$('#enSay').addEventListener('click', ()=>{ sfx.tap(); if (ES.task && ES.task.kind==='read') speak(E_SAY.read); else sayTask(); });
$('#enPics').addEventListener('click', ()=>{ sfx.tap(); store.set('enPics', enPics() ? 0 : 1); render(); applyPics(); });
// "again" says just the syllable, without the whole sentence
$('#enCard').addEventListener('click', e=>{ if (ES.task && ES.task.sayX){ sfx.tap(); speak(ES.task.sayX); } });

// ---------- reading with the microphone ----------
async function listen(t){
  const my = ES.run;
  if (ES.task !== t || !isOn()) return;
  const mic = $('#enMic'); mic.className = 'mic busy';
  await new Promise(r=>setTimeout(r, 250));
  const r = await A.stt.listenOnce(()=>{ if (my===ES.run && ES.task===t) mic.className = 'mic on'; });
  if (my !== ES.run || ES.task !== t || !isOn()) return;
  mic.className = 'mic';
  if (r.ok && A.stt.matches(t.ans, r.results)) return readDone(t, true);
  t.tries++;
  if (r.ok && A.progress && A.progress.heard) A.progress.heard(t.ans, r.results);
  $('#enHeard').textContent = r.ok ? (r.results.length ? 'slyšela jsem: ' + r.results.slice(0,2).join(' / ') : '') : '⚠️ ' + A.stt.error(r.code);
  if (t.tries >= 3){                                             // the microphone may be wrong: no heart lost
    $('#enBubble').textContent = 'Přečteme si ji jindy.';
    await speak(E_SAY.later); await speak(t.ans, {queue:true});
    if (my === ES.run && isOn()) next();
    return;
  }
  sfx.bad(); $('#enBubble').textContent = 'Zkus to znovu!';
  await speak(t.tries === 2 ? E_SAY.listen : E_SAY.again);
  if (t.tries === 2) await speak(t.ans, {queue:true});
  listen(t);
}
async function readDone(t, ok){
  if (ES.busy) return; ES.busy = true; A.stt.stop();
  if (A.progress) A.progress.track('read', t.ans, t.tries === 0);
  $('#enSyl').classList.add('good'); sfx.good();
  await success();
}
$('#enAns').addEventListener('click', e=>{
  const r = e.target.closest('[data-read]'); const t = ES.task; if (!r || !t || t.kind!=='read' || ES.busy) return;
  sfx.tap();
  if (r.dataset.read === 'ok') return readDone(t, true);
  A.stt.stop(); ES.run++; t.tries = Math.max(0, t.tries); listen(t);
});

// ---------- after a task ----------
async function success(){
  const my = ES.run;
  ES.n++; render(); save();
  const pr = prizeAt(ES.n);
  if (pr) await givePrize(pr);
  else { confetti(12); await speak(pick(E_SAY.praise)); }
  await new Promise(r=>setTimeout(r, 400));
  if (my !== ES.run || !isOn()) return;
  next();
}
async function loseHeart(){
  ES.hearts--; render(); save();
  if (navigator.vibrate) try{ navigator.vibrate(80); }catch(e){}
  if (ES.hearts <= 0) return true;
  speak(ES.hearts === 1 ? E_SAY.last : E_SAY.wrong);          // she may answer again straight away
  return false;
}
function written(first){                                         // back from tracing
  A.go('endless'); ES.run++;
  if (first === null) return next();                             // she left the tracing: just go on
  success();
}
$('#enAns').addEventListener('click', async e=>{
  const act = e.target.closest('[data-act]');
  if (act){ sfx.tap(); return start(act.dataset.act === 'cont'); }
  const b = e.target.closest('.ans'); const t = ES.task;
  if (!b || ES.busy || !t || (t.kind!=='math' && t.kind!=='syl')) return;
  const ok = String(t.ans) === b.dataset.v, my = ES.run;
  if (!t.wrongs && A.progress && t.key) A.progress.track(t.key, t.kind==='math' ? t.t.type+'|'+t.t.a+'|'+t.t.b : t.ans, ok);
  if (ok){
    ES.busy = true; $('#enAns').classList.add('locked'); b.classList.add('right'); sfx.good();
    if (t.kind==='math'){ const sl = $('#enCard .slot'); if (sl){ sl.textContent = t.ans; sl.classList.add('filled'); }
      await speak(M.solution(t.t)); }
    return success();
  }
  // wrong: the first mistake in a task costs a heart, then she tries again (like in Matematika)
  t.wrongs = (t.wrongs||0) + 1; b.classList.add('wrong'); sfx.bad(); ES.busy = true;
  if (t.wrongs === 1 && await loseHeart()){
    const right = [...document.querySelectorAll('#enAns .ans')].find(x=>x.dataset.v===String(t.ans)); if (right) right.classList.add('right');
    await speak(t.kind==='math' ? M.solution(t.t) : t.ans);
    return gameOver();
  }
  if (my !== ES.run || !isOn()) return;
  if (t.wrongs >= 2){
    if (t.kind==='math'){                                         // show the pictures and count together
      const hidden = !enPics() && !t.reveal; t.reveal = true; applyPics();
      $('#enBubble').textContent = hidden ? 'Ukážu obrázky a spočítáme to spolu!' : 'Spočítáme to spolu!';
      await speak(hidden ? M.HINT_HIDDEN : M.HINT_SHOWN); ES.busy = false; M.hint(t.t, $('#enCard')); return;
    }
    $('#enBubble').textContent = 'Poslouchej: ' + t.ans; await speak(t.ans);
  } else { $('#enBubble').textContent = 'Zkus to znovu!'; }
  ES.busy = false;
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
  store.set('enSave', null);
  const best = store.get('enBest', 0), rec = ES.n > best;
  if (rec){ store.set('enBest', ES.n); if (best > 0){ store.set('wallet', store.get('wallet',0) + 5); } }
  speak(rec && best > 0 ? E_SAY.record : E_SAY.over);
  A.finishRound(Math.min(ES.n, 20), ()=>start(false), 'hub', 20);
  const extra = `<div class="rewline">🔥 Došla jsi až na <b>${ES.n}</b>. ${rec ? (best > 0 ? '🏆 Nový rekord! +5 ⭐' : '🏆 Tvůj první rekord!') : `Rekord: ${best}`}</div>`;
  const ns = document.getElementById('newStk'); if (ns) ns.insertAdjacentHTML('afterbegin', extra);
  const sc = document.querySelector('#endStars .score'); if (sc) sc.textContent = `došla jsi až na ${ES.n} správně`;
}
A.onLeave(id=>{ if (id !== 'endless'){ ES.run++; if (A.stt) A.stt.stop(); } });

A.phraseSources.push(()=>[E_SAY.cont, E_SAY.ask, E_SAY.start, E_SAY.find, E_SAY.read, E_SAY.again, E_SAY.listen, E_SAY.later, E_SAY.wrong, E_SAY.last, E_SAY.over, E_SAY.record, E_SAY.prize, ...E_SAY.praise]);
})();
