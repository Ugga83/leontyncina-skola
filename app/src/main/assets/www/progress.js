// Učíme se s Ayrou – what went wrong (to repeat it), daily challenge, parents' overview
(() => {
const A = window.App, {store, speak, sfx, confetti} = A;
const $ = s => document.querySelector(s);
const SEC = {math:['🔢','Matematika'], logo:['👄','Logopedie'], read:['📖','Čtení'], write:['✏️','Psaní']};
const BACK2SEC = {home:'math', logo:'logo', logopedie:'logo', rlesson:'read', write:'write'};
const CH_BONUS = 3;

const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const todayISO = () => iso(new Date());
const stats = () => { const s = store.get('stats', null) || {}; s.days = s.days || {}; s.weak = s.weak || {}; s.errs = s.errs || {}; return s; };

// ---------- mistakes ----------
// ok = right on the first try. A miss puts the item on the "weak" list (up to 3),
// every first-try success takes one off, so it keeps coming back until it is really learned.
function track(sec, key, ok){
  key = String(key);
  const st = stats(), d = st.days[todayISO()] || (st.days[todayISO()] = {});
  const s = d[sec] || (d[sec] = [0, 0, 0]);   // [first-try right, answered, rounds]
  s[1]++; if (ok) s[0]++;
  const w = st.weak[sec] || (st.weak[sec] = {});
  if (!ok){
    w[key] = Math.min((w[key] || 0) + 1, 3);
    const e = st.errs[sec] || (st.errs[sec] = {}); e[key] = (e[key] || 0) + 1;
  } else if (w[key] && --w[key] <= 0) delete w[key];
  const keys = Object.keys(st.days).sort();                 // keep 90 days
  while (keys.length > 90) delete st.days[keys.shift()];
  store.set('stats', st);
}
// what the microphone heard when a syllable did not match (last 30), for tuning the recognition
function heard(target, results){
  const h = store.get('heard', []);
  h.unshift([target, (results||[]).slice(0,3).join(' / ') || '(ticho)', todayISO()]);
  store.set('heard', h.slice(0, 30));
}
function weak(sec, n){
  const w = stats().weak[sec] || {};
  return Object.keys(w).sort((a,b)=>w[b]-w[a]).slice(0, n || 99);
}

// ---------- daily challenge ----------
const CH = [
  {sec:'write', go:'write', t:'Obtáhni písmenka v Psaní', say:'Dnešní výzva: obtáhni písmenka v psaní. Dostaneš tři hvězdičky navíc!'},
  {sec:'math',  go:'home',  t:'Zahraj si jedno kolo počítání', say:'Dnešní výzva: zahraj si jedno kolo počítání. Dostaneš tři hvězdičky navíc!'},
  {sec:'read',  go:'read',  t:'Přečti slabiky ve Čtení', say:'Dnešní výzva: přečti slabiky ve čtení. Dostaneš tři hvězdičky navíc!'},
];
const CH_DONE = 'Haf haf! Splnila jsi dnešní výzvu! Tady máš tři hvězdičky navíc.';
const dayIndex = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
const challenge = () => CH[dayIndex() % CH.length];
const chDone = () => store.get('chDone', '') === todayISO();

function renderChallenge(){
  let el = $('#challenge');
  if (!el){
    const tiles = $('#hub .hubtiles'); if (!tiles) return;
    tiles.insertAdjacentHTML('afterend', '<button class="challenge" id="challenge"></button>');
    el = $('#challenge');
    el.addEventListener('click', ()=>{
      sfx.tap(); const c = challenge();
      if (chDone()) return speak(CH_DONE.split('!')[0] + '!');
      A.go(c.go); speak(c.say);
    });
  }
  const c = challenge(), done = chDone();
  el.classList.toggle('done', done);
  el.innerHTML = `<span class="ci">${done ? '✅' : '🎯'}</span><span class="ct"><small>Výzva dne</small><b>${SEC[c.sec][0]} ${c.t}</b></span>
    <span class="cb">${done ? 'splněno' : '+' + CH_BONUS + ' ⭐'}</span>`;
}

// called by finishRound: counts the round and pays the challenge bonus
function roundDone(backTo){
  const sec = BACK2SEC[backTo]; if (!sec) return '';
  const st = stats(), d = st.days[todayISO()] || (st.days[todayISO()] = {});
  const s = d[sec] || (d[sec] = [0, 0, 0]); s[2]++; store.set('stats', st);
  if (challenge().sec !== sec || chDone()) return '';
  store.set('chDone', todayISO());
  store.set('chCount', store.get('chCount', 0) + 1);
  store.set('wallet', store.get('wallet', 0) + CH_BONUS);
  speak(CH_DONE, {queue:true}); confetti(60);
  renderChallenge(); if (A.rewards) A.rewards.renderHub();
  return `<div class="rewline">🎯 Výzva dne splněna: +${CH_BONUS} ⭐</div>`;
}

// ---------- parents' overview (hold the title on the main screen) ----------
document.body.insertAdjacentHTML('beforeend', `
<section id="parent" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Pro rodiče</h1></div>
  <div class="lcard" id="pSum"></div>
  <button class="lesson" style="--c:var(--teal);--d:var(--teal-d)" id="pLogo"><span class="le">👄</span><span class="lt"><b>Logopedie</b><small>cvičení C S Z a Č Š Ž – hrajte spolu</small></span></button>
  <div class="lcard"><h4>Posledních 14 dní <small>(počet odehraných kol)</small></h4><div class="pchart" id="pChart"></div></div>
  <div class="lcard"><h4>Úspěšnost napoprvé <small>(posledních 7 dní)</small></h4><div class="ptiles" id="pAcc"></div></div>
  <div class="lcard"><h4>Co ještě nejde <small>(opakuje se, dokud to nezvládne)</small></h4><div id="pWeak"></div>
    <button class="pclear" id="pClear">Vymazat seznam chyb</button></div>
  <div class="lcard"><h4>Nejčastější chyby celkem</h4><div id="pErrs"></div></div>
  <div class="lcard"><h4>Co Ayra slyšela <small>(když slabiku nepoznala)</small></h4><div id="pHeard"></div></div>
</section>`);

function lastDays(n){ const out = []; for (let i=n-1;i>=0;i--){ const d = new Date(); d.setDate(d.getDate()-i); out.push(d); } return out; }
const keyLabel = (sec, k) => sec==='math' ? (([t,a,b]) => t==='add' ? `${a} + ${b}` : t==='sub' ? `${a} − ${b}` : `${a} ${+a>+b?'>':+a<+b?'<':'='} ${b}`)(k.split('|')) : k;

function renderParent(){
  const st = stats(), days = lastDays(14);
  const rounds = d => Object.values(st.days[iso(d)] || {}).reduce((s,x)=>s + (x[2]||0), 0);
  const played = days.filter(d=>rounds(d) > 0).length;
  let streak = 0;
  for (let i = rounds(new Date()) > 0 ? 0 : 1; i < 400; i++){ const d = new Date(); d.setDate(d.getDate()-i); if (rounds(d) > 0) streak++; else break; }
  $('#pSum').innerHTML = `<div class="psum">
    <div><b>${played}</b><span>dní ze 14</span></div>
    <div><b>${streak}</b><span>dní v řadě</span></div>
    <div><b>${A.S.total}</b><span>hvězd celkem</span></div>
    <div><b>${store.get('wallet',0)}</b><span>hvězd k utracení</span></div></div>`;
  const max = Math.max(1, ...days.map(rounds));
  $('#pChart').innerHTML = days.map(d=>{
    const r = rounds(d), wd = 'NePoÚtStČtPáSo'.substr(d.getDay()*2, 2);
    const by = Object.entries(st.days[iso(d)] || {}).filter(([,x])=>x[2]).map(([s,x])=>`${SEC[s]?SEC[s][1]:s}: ${x[2]}`).join(', ');
    return `<div class="pcol" title="${d.getDate()}. ${d.getMonth()+1}. – ${r} kol${by?' ('+by+')':''}">
      <span class="pv">${r || ''}</span><div class="pbar" style="height:${r ? Math.max(6, 100*r/max) : 0}%"></div>
      <span class="pd">${wd}<br>${d.getDate()}.</span></div>`;
  }).join('');
  const week = lastDays(7).map(d=>st.days[iso(d)] || {});
  $('#pAcc').innerHTML = Object.entries(SEC).map(([s,[ic,name]])=>{
    const ok = week.reduce((a,d)=>a + (d[s] ? d[s][0] : 0), 0), n = week.reduce((a,d)=>a + (d[s] ? d[s][1] : 0), 0);
    return `<div class="ptile"><span>${ic} ${name}</span><b>${n ? Math.round(100*ok/n) + ' %' : '–'}</b><small>${n ? ok + ' z ' + n : 'zatím nehrála'}</small></div>`;
  }).join('');
  const chips = (sec, obj, keys) => keys.map(k=>`<span class="pchip">${keyLabel(sec,k)}<i>${obj[k]}×</i></span>`).join('');
  const list = src => Object.entries(SEC).map(([s,[ic,name]])=>{
    const o = src[s] || {}, keys = Object.keys(o).sort((a,b)=>o[b]-o[a]).slice(0, 12);
    return keys.length ? `<div class="prow"><b>${ic} ${name}</b><div>${chips(s, o, keys)}</div></div>` : '';
  }).join('') || '<p class="pnone">Nic – všechno jde! 🎉</p>';
  $('#pWeak').innerHTML = list(st.weak);
  $('#pErrs').innerHTML = list(st.errs);
  const hd = store.get('heard', []);
  $('#pHeard').innerHTML = hd.length ? hd.map(([t,r,d])=>`<div class="pheard"><b>${t}</b><span>${r}</span><i>${d.slice(8)}.${d.slice(5,7)}.</i></div>`).join('')
    : '<p class="pnone">Zatím nic.</p>';
}
$('#pLogo').addEventListener('click', ()=>{ sfx.tap(); A.go('logopedie'); });
$('#pClear').addEventListener('click', ()=>{
  if (!confirm('Opravdu vymazat seznam chyb k opakování?')) return;
  const st = stats(); st.weak = {}; store.set('stats', st); renderParent();
});
// hold the title "Učíme se s Ayrou" for 2 seconds
(() => {
  const h = $('#hub h1'); if (!h) return; let t = null;
  const stop = () => { clearTimeout(t); t = null; h.classList.remove('holding'); };
  h.addEventListener('pointerdown', ()=>{ h.classList.add('holding'); t = setTimeout(()=>{ stop(); sfx.tap(); A.go('parent'); renderParent(); }, 2000); });
  ['pointerup','pointerleave','pointercancel'].forEach(e=>h.addEventListener(e, stop));
  h.addEventListener('contextmenu', e=>e.preventDefault());
})();

A.progress = {track, weak, heard, roundDone, renderChallenge};
A.phraseSources.push(()=>[...CH.map(c=>c.say), CH_DONE, CH_DONE.split('!')[0] + '!']);
renderChallenge();
})();
