/* Čtení: slabiky podle úkolů ze školy ("Čti každý den") */
(function(){
'use strict';
const A = window.App; if (!A) return;
const {speak, hush, sfx, confetti, pick} = A;
const $ = s => document.querySelector(s);
const native = window.AndroidTTS || null;

// ---------- data: one lesson = one school worksheet. Add new ones at the top. ----------
const R_LESSONS = [
  {id:'t1', title:'Slabiky s T', sub:'úkol 23.–25. 11.', emo:'🌷', c:'coral',
   pics:[['TA','ta','🛍️','taška'],['TE','te','🌡️','teploměr'],['TO','to','🏭','továrna'],['TU','tu','🌷','tulipán']],
   days:[
     {title:'Pondělí – slabiky', date:'23. 11.', dates:['2026-11-23'], cols:[
       ['ME','LO','SU','PA','MI','LU','SA','PO'],
       ['MA','LI','SO','PU','MO','LA','SI','PE'],
       ['mo','li','sa','pu','me','la','so','pi','ma','lu'],
       ['se','po','mu','le','si','pa','mi','lo','su','pe']]},
     {title:'Pondělí – slova', date:'23. 11.', dates:['2026-11-23'], pic:'📝', cols:[
       ['MÁMA','MALÁ','MASO','MÍLA','MÁLO','PILA'],
       ['PUSA','SAMA','PASE','SOLÍ','MUSÍ','LUPA']]},
     {title:'Úterý', date:'24. 11.', dates:['2026-11-24'], pic:'🌡️', cols:[
       ['TA','TE','TO','TU','Ta','Te','To','Tu'],
       ['ta','te','to','tu','tá','té','tó','tů'],
       ['TULÍ','TOPÍ','TETA','METE','PATA','LÉTO','LÉTÁ','TUPÁ']]},
     {title:'Středa – slabiky', date:'25. 11.', dates:['2026-11-25'], pic:'🔤', cols:[
       ['MA','LA','SA','PA','TA'],
       ['me','le','se','pe','te'],
       ['Mi','Li','Si','Pi'],
       ['mo','lo','so','po','to'],
       ['Mu','Lu','Su','Pu','Tu'],
       ['má','lí','sé','pó','tů'],
       ['mí','lů','só','pá','té'],
       ['ma','le','si','pe','to']]},
     {title:'Středa – slova', date:'25. 11.', dates:['2026-11-25'], pic:'📝', cols:[
       ['TETA','TÁTA','TOPÍ','MOTÁ','LÉTO','TULÍ','TELE'],
       ['PASE','SOLÍ','MELA','LÁME','MÍSA','MASO','TUPÁ'],
       ['PÍPÁ','LUPA','LÍPA','LEPÍ','MAPA','PÁLÍ','PILA']]},
   ]},
  {id:'p1', title:'Slabiky s P', sub:'úkol 18.–22. 11.', emo:'🦜', c:'violet',
   pics:[['PA','pa','🦜','papoušek'],['PE','pe','👛','peněženka'],['PI','pi','🪚','pila'],['PO','po','👮','policista'],['PU','pu','🧩','puzzle']],
   days:[
     {title:'Středa', date:'18. 11.', dates:['2026-11-18'], cols:[
       ['Ma','Mi','Mo','Mu','Me','La','Li','Lu','Le','Lo'],
       ['Sa','Se','So','Su','Si','Pi','Po','Pi','Pu','Pa'],
       ['me','lo','su','pa','mi','lu','se','po','ma','pe']]},
     {title:'Čtvrtek', date:'19. 11.', dates:['2026-11-19'], pic:'🧦', cols:[
       ['me','le','se','pe','mi','li','si','pi'],
       ['ma','la','sa','pa','mu','lu','su','pu'],
       ['mo','lo','so','po'],
       ['ME','LA','SO','PI'],
       ['LI','PU','MO','PE']]},
     {title:'Pátek – Neděle', date:'20.–22. 11.', dates:['2026-11-20','2026-11-21','2026-11-22'], cols:[
       ['Po','Li','Ma','So','Pe','Lu','Mi','Sa','Pu','Lo'],
       ['me','si','po','la','mu','se','pi','le','mo','su'],
       ['PA','SE','MI','LA','PO','SI','LE','MU','PE','LO'],
       ['mí','sů','lé','má','pů','lí','pá','mů','sí','pé'],
       ['Pu','Sá','Mé','Lo','Pa','Si','Pí','Mo','Pe','Lu']]},
   ]},
];
// the voice always gets lower case (upper case could be read as letters)
const say = syl => syl.toLowerCase();
const picWord = p => `${p[3]}.`;
const sayPic = p => { speak(say(p[1])); return speak(picWord(p), {queue:true}); };
const R_PRAISE = ['Výborně!','Správně!','Super!','Paráda!'];
const R_MSG = {
  pick:'Vyber si úkol.', pickDay:'Vyber si den.',
  readStart:'Čti slabiky nahlas. Já poslouchám.', readManual:'Čti slabiky nahlas. Po každé klepni na fajfku.', again:'Zkus to znovu.', listen:'Poslouchej.',
  later:'Tuhle si přečteme později.', silent:'Neslyšela jsem tě. Řekni to nahlas.',
  allDone:'Všechny slabiky máš přečtené!', noMic:'Mikrofon nefunguje. Čti nahlas a potvrď tlačítkem.',
  findHelp:'Poslouchej a najdi slabiku.', findWord:'Poslouchej a najdi slovo.',
  readStartW:'Čti slova nahlas. Já poslouchám.', readManualW:'Čti slova nahlas. Po každém klepni na fajfku.', allDoneW:'Všechna slova máš přečtená!'
};
const todayISO = ()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };

// ---------- screens ----------
document.getElementById('end').insertAdjacentHTML('beforebegin', `
<section id="read" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Čtení</h1></div>
  <div class="hero"><div class="owl" id="readOwl"></div><div class="bubble" id="readBubble">Vyber si úkol!</div></div>
  <div class="lsec"><h3>📚 Úkoly ze školy</h3><div class="lessons">
    ${R_LESSONS.map(l=>`<button class="lesson" style="--c:var(--${l.c});--d:var(--${l.c}-d)" data-rl="${l.id}">
      <span class="le">${l.emo}</span><span class="lt"><b>${l.title}</b><small>${l.sub}</small></span></button>`).join('')}
    <div class="lesson soon"><span class="le">✨</span><span class="lt"><b>Další úkoly</b><small>přidáme podle papíru ze školy</small></span></div>
  </div></div>
</section>

<section id="rlesson" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh" id="rlTitle"></h1></div>
  <div class="lcard"><h4>Slabiky s obrázky</h4><div class="rpics" id="rlPics"></div></div>
  <div class="lsec"><h3>📅 Dny</h3><div class="lessons" id="rlDays"></div></div>
</section>


<section id="rread" class="screen">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button>
    <button class="mictoggle" id="rrMode"></button><div style="flex:1"></div>
    <div class="scount" id="rrCount"></div></div>
  <div class="gtalk"><div class="owl"></div><div class="bubble" id="rrBubble"></div></div>
  <div class="card rrcard">
    <div class="rrtop"><div class="rsyl" id="rrSyl"></div><div class="mic" id="rrMic">🎤</div></div>
    <div class="heard" id="rrHeard"></div>
    <div class="rgrid mini" id="rrGrid"></div>
  </div>
  <div class="btns" style="padding-bottom:6px">
    <button class="bigbtn" style="--c:var(--violet);--d:var(--violet-d)" id="rrMicBtn">🎤 Znovu</button>
    <button class="bigbtn small" style="--c:var(--teal);--d:var(--teal-d)" id="rrOk" title="Pro rodiče: potvrdit ručně">✓</button>
  </div>
</section>

<section id="rfind" class="screen">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><div style="flex:1"></div>
    <div class="scount" id="rfStars">✓ 0</div><button class="round-btn" id="rfSay" aria-label="Zopakovat">🔊</button></div>
  <div class="dots" id="rfDots"></div>
  <div class="gtalk"><div class="owl"></div><div class="bubble" id="rfBubble"></div></div>
  <div class="answers rfans" id="rfAns"></div>
  <div class="btns" style="padding-bottom:6px"><button class="bigbtn" style="--c:var(--orange);--d:var(--orange-d)" id="rfAgain">🔊 Znovu</button></div>
</section>`);

const lessonById = id => R_LESSONS.find(l=>l.id===id);
let curL = null, curDay = null;
const isOn = id => document.getElementById(id).classList.contains('active');
// curDay -1 = repeating the syllables that went wrong lately (any lesson)
const REP_DAY = () => { const w = A.progress ? A.progress.weak('read', 20) : []; return {title:'Opakování', date:'', dates:[], cols:[w]}; };
const day = () => curDay < 0 ? (curL._rep || (curL._rep = REP_DAY())) : curL.days[curDay];
const wordDay = () => day().cols.flat().every(s=>s.length > 2);   // a day of whole words only
const dayCells = d => d.cols.flatMap((c,ci)=>c.map((s,ri)=>({s, ci, ri})));

document.querySelectorAll('[data-rl]').forEach(b=>b.addEventListener('click',()=>{ sfx.tap(); openLesson(b.dataset.rl); }));
$('#readOwl').addEventListener('click',()=>{ $('#readBubble').textContent='Vyber si úkol!'; speak(R_MSG.pick); });
document.querySelector('#hub [data-go="read"]').addEventListener('click',()=>setTimeout(()=>speak(R_MSG.pick),60));

// ---------- lesson: pictures + list of days ----------
function openLesson(id){
  curL = lessonById(id); A.go('rlesson');
  $('#rlTitle').textContent = curL.title;
  $('#rlPics').innerHTML = curL.pics.map((p,i)=>`<button class="rpic" data-i="${i}"><span class="e">${p[2]}</span><b>${p[0]}</b><span>${p[1]}</span></button>`).join('');
  renderDays();
  speak(R_MSG.pickDay);
}
function renderDays(){
  const today = todayISO();
  const done = A.store.get('rdone', {});
  const weak = A.progress ? A.progress.weak('read', 20) : [];
  $('#rlDays').innerHTML = (weak.length ? `<div class="dayrow"><button class="lesson" style="--c:var(--violet);--d:var(--violet-d)" data-day="-1">
      <span class="le">🔁</span><span class="lt"><b>Opakování</b><small>${weak.length===1?'1 slabika, která minule nešla':weak.length<5?weak.length+' slabiky, které minule nešly':weak.length+' slabik, které minule nešly'}</small></span></button></div>` : '') + curL.days.map((d,i)=>{
    const isToday = d.dates.includes(today), ok = done[curL.id+'_'+i];
    const col = isToday?'orange':'teal';
    return `<div class="dayrow"><button class="lesson ${isToday?'today':''}" style="--c:var(--${col});--d:var(--${col}-d)" data-day="${i}">
      <span class="le">${ok?'✅':(d.pic||'📖')}</span><span class="lt"><b>${d.title}</b><small>${d.date}${isToday?' · dnes':''} · ${A.store.get('rprog_'+curL.id+'_'+i,null)?'pokračuj':'čti'}</small></span></button>
      <button class="lesson game" style="--c:var(--violet);--d:var(--violet-d)" data-game="${i}" aria-label="Hra Najdi slabiku"><span class="le">🎮</span></button></div>`;
  }).join('');
}
$('#rlPics').addEventListener('click',e=>{ const b=e.target.closest('.rpic'); if(!b) return; sfx.tap(); sayPic(curL.pics[+b.dataset.i]); });
$('#rlDays').addEventListener('click',e=>{
  const g=e.target.closest('[data-game]'); if (g){ sfx.tap(); curDay=+g.dataset.game; startFind(); return; }
  const b=e.target.closest('[data-day]'); if (b){ sfx.tap(); curDay=+b.dataset.day; curL._rep = null; startRead(curDay<0 ? true : undefined); }
});

// ---------- table of a day ----------
function gridHTML(d, cls){ return d.cols.map((c,ci)=>`<div class="rcol">${c.map((s,ri)=>`<button class="rs ${cls||''}" data-c="${ci}" data-r="${ri}">${s}</button>`).join('')}</div>`).join(''); }

// ---------- speech recognition ----------
const STT_KIND = (native && native.listen) ? 'native' : ((window.SpeechRecognition||window.webkitSpeechRecognition) ? 'web' : null);
let sttSeq = 0; const sttWait = {};
window.__stt = (id, type, data)=>{
  const w = sttWait[id]; if (!w) return;
  if (type==='ready') return w.ready && w.ready();
  if (type==='end') return;
  delete sttWait[id];
  w.done(type==='res' ? {ok:true, results:data||[]} : {ok:false, code:+data});
};
function sttAvailable(){
  if (STT_KIND==='native'){ try{ return native.sttAvailable(); }catch(e){ return false; } }
  return STT_KIND==='web';
}
let webRec = null;
const STT_ERR = {1:'pomalý internet', 2:'chybí internet', 3:'problém s mikrofonem', 4:'chyba serveru rozpoznávání',
  5:'chyba aplikace', 6:'nic jsem neslyšela (ticho)', 7:'zvuk byl, ale nerozpoznala jsem slovo', 8:'rozpoznávání je zaneprázdněné',
  9:'chybí povolení mikrofonu', 10:'moc požadavků', 11:'odpojeno od serveru', 12:'čeština není podporovaná', 13:'chybí stažená čeština'};
function sttError(code){ return `chyba ${code}: ${STT_ERR[code]||'neznámá'}`; }
function listenOnce(onReady){
  return new Promise(done=>{
    const id = String(++sttSeq);
    const t = setTimeout(()=>{ if (sttWait[id]){ delete sttWait[id]; stopListen(); done({ok:false, code:6}); } }, 16000);
    sttWait[id] = {ready:onReady, done:r=>{ clearTimeout(t); done(r); }};
    if (STT_KIND==='native'){ try{ native.listen(id); }catch(e){ window.__stt(id,'err',5); } return; }
    try{
      const R = new (window.SpeechRecognition||window.webkitSpeechRecognition)();
      R.lang='cs-CZ'; R.maxAlternatives=10; R.interimResults=false;
      let got=null;
      R.onstart = ()=>window.__stt(id,'ready');
      R.onresult = e=>{ got=[]; for (const alt of e.results[0]) got.push(alt.transcript); };
      R.onerror = e=>window.__stt(id,'err', e.error==='not-allowed'?9:7);
      R.onend = ()=>{ if (got) window.__stt(id,'res',got); else window.__stt(id,'err',7); };
      R.start(); webRec = R;
    }catch(e){ window.__stt(id,'err',5); }
  });
}
function stopListen(){
  Object.keys(sttWait).forEach(k=>delete sttWait[k]);
  try{ if (STT_KIND==='native') native.stopListen(); else if (webRec) webRec.abort(); }catch(e){}
}
// lenient match for a first-grader: ignore case, accents (length, háčky), i/y, similar consonants
const norm = s => s.toLowerCase().replace(/π/g,'pi').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/y/g,'i').replace(/[^a-z ]/g,' ');
const CGROUP = {s:'szc', z:'szc', c:'szc', p:'pb', b:'pb', m:'mnb', n:'mn', l:'lr', r:'lr', t:'td', d:'td'};
// how the recogniser writes a lone syllable or letter: "mo" -> "mol", "se" -> "C", "si" -> "sí"
const LETTER = {c:'ce', s:'es', z:'zet', m:'em', l:'el', p:'pe', t:'te'};
function syllableOk(t, w){
  if (!w) return false;
  if (w.startsWith(t)) return true;
  if (t.length > 2) return w.length >= t.length - 1 && t.startsWith(w);   // a whole word: (almost) all of it
  const c = t[0], v = t[1], g = CGROUP[c] || c;
  if (!v) return w[0]===c;
  if (g.includes(w[0]) && w[1]===v) return true;
  if (w.length===1 && g.includes(w)) return true;                    // only the consonant was caught
  if (LETTER[w] && g.includes(w[0]) && LETTER[w].endsWith(v)) return true;   // read as a letter name
  return false;
}
function matches(target, results){
  const t = norm(target).replace(/ /g,'');
  return results.some(r=>{
    const words = norm(r).split(/\s+/).filter(Boolean), all = words.join('');
    return syllableOk(t, all) || words.some(w=>syllableOk(t, w))
      || (all.length <= t.length + 2 && all.includes(t));           // "a mo", "omo"
  });
}

// ---------- read with the microphone ----------
const RR = {queue:[], total:0, firstTry:0, silent:0, run:0, manual:false};
let micWanted = A.store.get('rmic', 1);
function applyMode(){
  RR.manual = !micWanted || !sttAvailable();
  const b = $('#rrMode');
  b.textContent = RR.manual ? '🔇 bez poslechu' : '🎤 poslouchám';
  b.classList.toggle('off', RR.manual);
  b.style.display = sttAvailable() ? '' : 'none';
  $('#rrMicBtn').style.display = RR.manual ? 'none' : '';
  $('#rrOk').classList.toggle('small', !RR.manual);
  $('#rrOk').textContent = RR.manual ? '✓ Přečetla jsem' : '✓';
  $('#rrMic').style.visibility = RR.manual ? 'hidden' : '';
}
// progress of an unfinished day is kept, so leaving by accident does not start it over
const progKey = ()=> 'rprog_'+curL.id+'_'+curDay;
function saveProgress(){
  const done = dayCells(day()).filter(c=>!RR.queue.some(q=>q.ci===c.ci && q.ri===c.ri)).map(c=>c.ci+'-'+c.ri);
  A.store.set(progKey(), {done, firstTry: RR.firstTry});
}
// pick the number of columns that gives the biggest letters in the space left on the card
function fitGrid(){
  const g = $('#rrGrid'), n = g.children.length; if (!n || !g.clientHeight) return;
  const W = g.clientWidth, H = g.clientHeight; let best = [0, 1];
  const len = Math.max(2, ...[...g.children].map(x=>x.textContent.length));   // whole words need wider cells
  for (let c=2; c<=8; c++){
    const r = Math.ceil(n/c), f = Math.min(H/r*.62, W/c*.72/len);
    if (f > best[0]) best = [f, c];
  }
  const c = best[1], r = Math.ceil(n/c);
  g.style.setProperty('--cols', c); g.style.setProperty('--rows', r);
  g.style.fontSize = Math.min(best[0], 64) + 'px';
}
window.addEventListener('resize', ()=>{ if (isOn('rread')) fitGrid(); });
function startRead(fresh){
  const cells = dayCells(day());
  const saved = fresh===true ? null : A.store.get(progKey(), null);
  const doneSet = new Set(saved ? saved.done : []);
  RR.queue = cells.filter(c=>!doneSet.has(c.ci+'-'+c.ri)).map(c=>({...c, tries:0}));
  if (!RR.queue.length){ RR.queue = cells.map(c=>({...c, tries:0})); doneSet.clear(); }
  RR.total = cells.length; RR.firstTry = saved && doneSet.size ? saved.firstTry : 0; RR.silent = 0;
  A.go('rread');
  if (STT_KIND==='native' && native.setHints){ try{ native.setHints(JSON.stringify([...new Set(cells.map(c=>c.s.toLowerCase()))])); }catch(e){} }
  // the paper's columns are not kept: syllables flow left to right in reading order and fill the card
  $('#rrGrid').innerHTML = cells.map(c=>`<span class="rs" data-c="${c.ci}" data-r="${c.ri}">${c.s}</span>`).join('');
  fitGrid();
  doneSet.forEach(k=>{ const [ci,ri]=k.split('-'); const el=document.querySelector(`#rrGrid .rs[data-c="${ci}"][data-r="${ri}"]`); if (el) el.classList.add('done'); });
  applyMode(); requestAnimationFrame(fitGrid);
  showCur(); setMic('off');
  speak(RR.manual ? (wordDay() ? R_MSG.readManualW : R_MSG.readManual) : (wordDay() ? R_MSG.readStartW : R_MSG.readStart)).then(()=>{ if (isOn('rread')) loop(); });
}
function cellEl(c){ return document.querySelector(`#rrGrid .rs[data-c="${c.ci}"][data-r="${c.ri}"]`); }
function showCur(){
  const c = RR.queue[0]; if (!c) return;
  document.querySelectorAll('#rrGrid .rs').forEach(x=>x.classList.remove('cur'));
  const el = cellEl(c); if (el){ el.classList.add('cur'); el.scrollIntoView({block:'nearest'}); }
  const big = $('#rrSyl'); big.textContent = c.s; big.classList.remove('pop','good'); void big.offsetWidth; big.classList.add('pop');
  $('#rrCount').textContent = `✅ ${RR.total-RR.queue.length} / ${RR.total}`;
  if (RR.lastShown !== c){ $('#rrHeard').textContent = ''; RR.lastShown = c; }
  $('#rrOk').classList.remove('hint');
  const what = c.s.length > 2 ? 'slovo' : 'slabiku';
  $('#rrBubble').textContent = RR.manual ? `Přečti ${what} nahlas.` : `Přečti ${what} nahlas (klidně 2×).`;
}
function setMic(state){ const m=$('#rrMic'); m.className='mic '+(state||''); m.textContent = state==='busy'?'⏳':'🎤'; }
async function loop(){
  const my = ++RR.run;
  while (RR.queue.length && my===RR.run && isOn('rread')){
    showCur();
    const c = RR.queue[0];
    if (RR.manual){ setMic('off'); return; }        // waits for the ✓ button
    setMic('busy');
    await new Promise(r=>setTimeout(r,250));          // let the voice finish completely before the mic opens
    if (my!==RR.run || !isOn('rread')) return;
    const r = await listenOnce(()=>{ if (my===RR.run) setMic('on'); });
    if (my!==RR.run || !isOn('rread')) return;
    setMic('off');
    if (!r.ok){
      if (r.code===9 || r.code===5){ micWanted = 0; applyMode(); await speak(R_MSG.noMic); continue; }
      RR.silent++;
      $('#rrBubble').textContent = 'Neslyšela jsem tě.';
      $('#rrHeard').textContent = '⚠️ ' + sttError(r.code);
      if (RR.silent >= 3){ RR.silent = 0; await speak(R_MSG.silent); $('#rrBubble').textContent='Klepni na 🎤 Znovu a čti.'; return; }
      continue;
    }
    RR.silent = 0;
    if (matches(c.s, r.results)) await success(c);
    else await miss(c, r.results);
  }
  if (my===RR.run && isOn('rread') && !RR.queue.length) finishRead();
}
async function success(c){
  RR.queue.shift(); if (c.tries===0) RR.firstTry++;
  if (A.progress) A.progress.track('read', c.s, c.tries===0);
  saveProgress();
  sfx.good();
  const el = cellEl(c); if (el){ el.classList.remove('cur','bad'); el.classList.add('done'); }
  $('#rrSyl').classList.add('good');
  const p = pick(R_PRAISE); $('#rrBubble').textContent = `${p} ${c.s}`;
  $('#rrCount').textContent = `✅ ${RR.total-RR.queue.length} / ${RR.total}`;
  if (Math.random()<.35) await speak(p); else await new Promise(r=>setTimeout(r,500));
}
async function miss(c, heard){
  c.tries++; sfx.bad();
  if (A.progress && A.progress.heard) A.progress.heard(c.s, heard);
  const el = cellEl(c); if (el) el.classList.add('bad');
  $('#rrHeard').textContent = heard.length ? `slyšela jsem: ${heard.slice(0,3).join(' / ')}` : '';
  if (c.tries === 1){ $('#rrBubble').textContent='Zkus to znovu!'; await speak(R_MSG.again); }
  else if (c.tries === 2){ $('#rrBubble').textContent='Poslouchej: '+c.s; $('#rrOk').classList.add('hint'); await speak(R_MSG.listen); await speak(say(c.s), {queue:true}); }
  else { RR.queue.push(RR.queue.shift()); c.tries = 2; $('#rrBubble').textContent='Vrátíme se k ní.'; await speak(R_MSG.later); }
}
function finishRead(){
  if (curDay >= 0){ const done = A.store.get('rdone', {}); done[curL.id+'_'+curDay] = true; A.store.set('rdone', done); }
  try{ localStorage.removeItem('mat_'+progKey()); }catch(e){}
  setMic('off');
  speak(wordDay() ? R_MSG.allDoneW : R_MSG.allDone).then(()=>{
    if (!isOn('rread')) return;
    A.finishRound(RR.firstTry, ()=>startRead(true), 'rlesson', RR.total);
  });
}
$('#rrMode').addEventListener('click',()=>{
  sfx.tap(); micWanted = micWanted ? 0 : 1; A.store.set('rmic', micWanted);
  RR.run++; stopListen(); hush(); setMic('off'); applyMode();
  if (!RR.manual) loop(); else showCur();
});
$('#rrMicBtn').addEventListener('click',()=>{ sfx.tap(); RR.run++; stopListen(); hush(); loop(); });
let okBusy = false;
$('#rrOk').addEventListener('click', async ()=>{   // manual confirm (no microphone / parent)
  const c = RR.queue[0]; if (!c || okBusy) return; okBusy = true;
  RR.run++; stopListen(); setMic('off');
  await success(c); okBusy = false;
  if (!isOn('rread')) return;
  if (!RR.queue.length) return finishRead();
  if (RR.manual) showCur(); else loop();
});

// ---------- find the syllable (listen & pick) ----------
const RF = {items:[], idx:0, stars:0, wrong:0, res:[], busy:false};
let rfRun = 0;
function startFind(){
  const pool = [...new Set(day().cols.flat())];
  RF.items = []; let last='';
  while (RF.items.length < 10){ const s = pick(pool); if (s.toLowerCase()===last) continue; RF.items.push(s); last=s.toLowerCase(); }
  RF.idx = 0; RF.stars = 0; RF.res = [];
  A.go('rfind'); showFind(true);
}
// the syllable is always spoken on its own (inside a sentence the voice may spell it out)
function sayFind(s, queue){ return speak(say(s), {queue:!!queue}); }
function showFind(first){
  const s = RF.items[RF.idx]; RF.wrong = 0; RF.busy = false;
  const base = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');   // ma = má = MA by ear
  const pool = [...new Set(day().cols.flat())].filter(x=>base(x)!==base(s));
  const opts = [s];
  while (opts.length < 4 && pool.length){ const x = pool.splice(Math.floor(Math.random()*pool.length),1)[0]; if (!opts.some(o=>base(o)===base(x))) opts.push(x); }
  opts.sort(()=>Math.random()-.5);
  $('#rfDots').innerHTML = RF.items.map((_,i)=>`<div class="dot ${i===RF.idx?'cur':''} ${RF.res[i]===1?'gold':RF.res[i]===2?'ok':''}"></div>`).join('');
  $('#rfStars').textContent = '✓ ' + RF.stars;
  $('#rfBubble').textContent = s.length > 2 ? 'Které slovo slyšíš?' : 'Kterou slabiku slyšíš?';
  $('#rfAns').classList.remove('locked');
  $('#rfAns').innerHTML = opts.map(o=>`<button class="ans rsylb" data-v="${o}">${o}</button>`).join('');
  if (first) speak(s.length > 2 ? R_MSG.findWord : R_MSG.findHelp).then(()=>{ if (isOn('rfind')) sayFind(s, true); });
  else sayFind(s);
}
$('#rfSay').addEventListener('click',()=>{ const s=RF.items[RF.idx]; if (s) sayFind(s); });
$('#rfAgain').addEventListener('click',()=>{ const s=RF.items[RF.idx]; if (s){ sfx.tap(); sayFind(s); } });
$('#rfAns').addEventListener('click', async e=>{
  const b = e.target.closest('.ans'); if (!b || RF.busy) return;
  const s = RF.items[RF.idx], my = rfRun;
  if (b.dataset.v.toLowerCase() === s.toLowerCase()){
    RF.busy = true; $('#rfAns').classList.add('locked'); b.classList.add('right');
    sfx.good(); confetti(RF.wrong?12:30);
    if (!RF.wrong){ RF.stars++; RF.res[RF.idx]=1; } else RF.res[RF.idx]=2;
    $('#rfStars').textContent = '✓ ' + RF.stars;
    const p = pick(R_PRAISE); $('#rfBubble').textContent = p + ' ' + s;
    speak(p); await speak(say(s), {queue:true});
    await new Promise(r=>setTimeout(r,700));
    if (my!==rfRun || !isOn('rfind')) return;
    RF.idx++;
    if (RF.idx >= RF.items.length) return A.finishRound(RF.stars, startFind, 'rlesson');
    showFind();
  } else {
    RF.wrong++; b.classList.add('wrong'); sfx.bad();
    $('#rfBubble').textContent = 'Zkus to znovu!';
    speak(R_MSG.again); sayFind(s, true);
  }
});
A.onLeave(id=>{ rfRun++; RR.run++; stopListen();
  if (id==='rlesson' && curL) setTimeout(renderDays, 0); });

// for automated tests
window.__readTest = {matches};

// ---------- every sentence this module can say (voice pre-recording) ----------
A.phraseSources.push(()=>{
  const out = [...R_PRAISE, ...Object.values(R_MSG)];
  R_LESSONS.forEach(l=>{
    l.pics.forEach(p=>out.push(say(p[1]), picWord(p)));
    l.days.forEach(d=>d.cols.flat().forEach(s=>out.push(say(s))));
  });
  return out;
});
// for the endless game: speech recognition of one syllable
A.stt = {available: ()=>sttAvailable() && !!micWanted, listenOnce, matches, stop: ()=>stopListen(), error: sttError};
// all syllables of the school tasks, without whole words (used by the endless game)
A.syllables = () => [...new Set(R_LESSONS.flatMap(l=>l.days.flatMap(d=>d.cols.flat())).filter(s=>s.length<=2))];
})();
