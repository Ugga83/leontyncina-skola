/* Čtení: slabiky podle úkolů ze školy ("Čti každý den") */
(function(){
'use strict';
const A = window.App; if (!A) return;
const {speak, hush, sfx, confetti, pick} = A;
const $ = s => document.querySelector(s);

// ---------- data: one lesson = one school worksheet. Add new ones at the top. ----------
const R_LESSONS = [
  {id:'p1', title:'Slabiky s P', sub:'úkol 18.–22. 11.', emo:'🦜', c:'violet',
   pics:[['PA','pa','🦜','papoušek'],['PE','pe','👛','peněženka'],['PI','pi','🪚','pila'],['PO','po','👮','policista'],['PU','pu','🧩','puzzle']],
   days:[
     {title:'Středa 18. 11.', cols:[
       ['Ma','Mi','Mo','Mu','Me','La','Li','Lu','Le','Lo'],
       ['Sa','Se','So','Su','Si','Pi','Po','Pi','Pu','Pa'],
       ['me','lo','su','pa','mi','lu','se','po','ma','pe']]},
     {title:'Čtvrtek 19. 11.', pic:'🧦', cols:[
       ['me','le','se','pe','mi','li','si','pi'],
       ['ma','la','sa','pa','mu','lu','su','pu'],
       ['mo','lo','so','po'],
       ['ME','LA','SO','PI'],
       ['LI','PU','MO','PE']]},
     {title:'Pátek 20. 11. – Neděle 22. 11.', cols:[
       ['Po','Li','Ma','So','Pe','Lu','Mi','Sa','Pu','Lo'],
       ['me','si','po','la','mu','se','pi','le','mo','su'],
       ['PA','SE','MI','LA','PO','SI','LE','MU','PE','LO'],
       ['mí','sů','lé','má','pů','lí','pá','mů','sí','pé'],
       ['Pu','Sá','Mé','Lo','Pa','Si','Pí','Mo','Pe','Lu']]},
   ]},
];
// the voice always gets lower case (upper case could be read as letters)
const say = syl => syl.toLowerCase();
const picSay = p => `${say(p[1])}. ${p[3]}.`;
const R_PRAISE = ['Výborně!','Správně!','Super!','Paráda!'];
const R_MSG = {
  pick:'Vyber si úkol.', day:'Klepni na slabiku a uslyšíš ji.',
  readHelp:'Přečti slabiku nahlas. Když si nevíš rady, klepni na ucho.',
  findHelp:'Poslouchej a najdi slabiku.', again:'Zkus to znovu.', done:'Hotovo! Dnešní čtení máš za sebou.'
};

// ---------- screens ----------
document.getElementById('end').insertAdjacentHTML('beforebegin', `
<section id="read" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Čtení</h1></div>
  <div class="hero"><div class="owl" id="readOwl">🦉</div><div class="bubble" id="readBubble">Vyber si úkol!</div></div>
  <div class="lsec"><h3>📚 Úkoly ze školy</h3><div class="lessons">
    ${R_LESSONS.map(l=>`<button class="lesson" style="--c:var(--${l.c});--d:var(--${l.c}-d)" data-rl="${l.id}">
      <span class="le">${l.emo}</span><span class="lt"><b>${l.title}</b><small>${l.sub}</small></span></button>`).join('')}
    <div class="lesson soon"><span class="le">✨</span><span class="lt"><b>Další úkoly</b><small>přidáme podle papíru ze školy</small></span></div>
  </div></div>
</section>

<section id="rlesson" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh" id="rlTitle"></h1></div>
  <div class="lcard"><h4>Slabiky s obrázky</h4><div class="rpics" id="rlPics"></div></div>
  <div id="rlDays"></div>
</section>

<section id="rread" class="screen">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><div style="flex:1"></div>
    <div class="scount" id="rrCount"></div></div>
  <div class="gtalk"><div class="owl">🦉</div><div class="bubble" id="rrBubble"></div></div>
  <div class="card"><div class="rsyl" id="rrSyl"></div></div>
  <div class="btns" style="padding-bottom:6px">
    <button class="bigbtn" style="--c:var(--orange);--d:var(--orange-d)" id="rrHelp">👂 Poslechnout</button>
    <button class="bigbtn" style="--c:var(--teal);--d:var(--teal-d)" id="rrOk">✓ Přečetla jsem</button>
  </div>
</section>

<section id="rfind" class="screen">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><div style="flex:1"></div>
    <div class="scount" id="rfStars">⭐ 0</div><button class="round-btn" id="rfSay" aria-label="Zopakovat">🔊</button></div>
  <div class="dots" id="rfDots"></div>
  <div class="gtalk"><div class="owl">🦉</div><div class="bubble" id="rfBubble"></div></div>
  <div class="answers rfans" id="rfAns"></div>
</section>`);

const lessonById = id => R_LESSONS.find(l=>l.id===id);
let curL = null, curDay = null;
const isOn = id => document.getElementById(id).classList.contains('active');

document.querySelectorAll('[data-rl]').forEach(b=>b.addEventListener('click',()=>{ sfx.tap(); openLesson(b.dataset.rl); }));
$('#readOwl').addEventListener('click',()=>{ $('#readBubble').textContent='Vyber si úkol!'; speak(R_MSG.pick); });
document.querySelector('#hub [data-go="read"]').addEventListener('click',()=>setTimeout(()=>speak(R_MSG.pick),60));

function openLesson(id){
  curL = lessonById(id); A.go('rlesson');
  $('#rlTitle').textContent = curL.title;
  $('#rlPics').innerHTML = curL.pics.map((p,i)=>`<button class="rpic" data-i="${i}"><span class="e">${p[2]}</span><b>${p[0]}</b><span>${p[1]}</span></button>`).join('');
  $('#rlDays').innerHTML = curL.days.map((d,i)=>`
    <div class="lcard">
      <h4>${d.title} ${d.pic||''}</h4>
      <div class="rgrid">${d.cols.map(c=>`<div class="rcol">${c.map(s=>`<button class="rs">${s}</button>`).join('')}</div>`).join('')}</div>
      <div class="btnrow"><button class="pill go" data-read="${i}">📖 Číst po jedné</button><button class="pill" data-find="${i}">👂 Najdi slabiku</button></div>
    </div>`).join('');
  speak(R_MSG.day);
}
$('#rlPics').addEventListener('click',e=>{ const b=e.target.closest('.rpic'); if(!b) return; sfx.tap(); speak(picSay(curL.pics[+b.dataset.i])); });
$('#rlDays').addEventListener('click',e=>{
  const s=e.target.closest('.rs'); if (s){ sfx.tap(); s.classList.remove('hit'); void s.offsetWidth; s.classList.add('hit'); speak(say(s.textContent)); return; }
  const r=e.target.closest('[data-read]'); if (r){ sfx.tap(); startRead(+r.dataset.read); return; }
  const f=e.target.closest('[data-find]'); if (f){ sfx.tap(); startFind(+f.dataset.find); }
});

// ---------- read one by one ----------
const RR = {list:[], idx:0, clean:0, helped:false, busy:false};
function startRead(dayIdx){
  curDay = dayIdx; RR.list = curL.days[dayIdx].cols.flat(); RR.idx = 0; RR.clean = 0;
  A.go('rread'); showRead(true);
}
function showRead(first){
  RR.helped = false; RR.busy = false;
  const el = $('#rrSyl'); el.textContent = RR.list[RR.idx];
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  $('#rrCount').textContent = `${RR.idx+1} / ${RR.list.length}`;
  $('#rrBubble').textContent = 'Přečti slabiku nahlas.';
  if (first) speak(R_MSG.readHelp);
}
$('#rrHelp').addEventListener('click',()=>{ RR.helped = true; speak(say(RR.list[RR.idx])); });
$('#rrOk').addEventListener('click', async ()=>{
  if (RR.busy) return; RR.busy = true;
  sfx.good(); if (!RR.helped) RR.clean++;
  const s = RR.list[RR.idx];
  $('#rrBubble').textContent = '👍 ' + s;
  await speak(say(s));
  if (!isOn('rread')){ RR.busy = false; return; }
  RR.idx++;
  if (RR.idx >= RR.list.length){
    const stars = Math.max(1, Math.round(10 * RR.clean / RR.list.length));
    return A.finishRound(stars, ()=>startRead(curDay), 'rlesson', 10);
  }
  showRead();
});

// ---------- find the syllable (listen & pick) ----------
const RF = {items:[], idx:0, stars:0, wrong:0, res:[], busy:false, opts:[]};
let rfRun = 0;
function startFind(dayIdx){
  curDay = dayIdx;
  const pool = [...new Set(curL.days[dayIdx].cols.flat())];
  RF.items = []; let last='';
  while (RF.items.length < 10){ const s = pick(pool); if (s.toLowerCase()===last) continue; RF.items.push(s); last=s.toLowerCase(); }
  RF.idx = 0; RF.stars = 0; RF.res = [];
  A.go('rfind'); showFind(true);
}
function findSay(s){ return `Najdi slabiku ${say(s)}.`; }
function showFind(first){
  const s = RF.items[RF.idx]; RF.wrong = 0; RF.busy = false;
  const pool = [...new Set(curL.days[curDay].cols.flat())].filter(x=>x.toLowerCase()!==s.toLowerCase());
  const opts = [s];
  while (opts.length < 4 && pool.length){ const x = pool.splice(Math.floor(Math.random()*pool.length),1)[0]; if (!opts.some(o=>o.toLowerCase()===x.toLowerCase())) opts.push(x); }
  opts.sort(()=>Math.random()-.5); RF.opts = opts;
  $('#rfDots').innerHTML = RF.items.map((_,i)=>`<div class="dot ${i===RF.idx?'cur':''} ${RF.res[i]===1?'gold':RF.res[i]===2?'ok':''}"></div>`).join('');
  $('#rfStars').textContent = '⭐ ' + RF.stars;
  $('#rfBubble').textContent = 'Kterou slabiku slyšíš?';
  $('#rfAns').classList.remove('locked');
  $('#rfAns').innerHTML = opts.map(o=>`<button class="ans rsylb" data-v="${o}">${o}</button>`).join('');
  if (first) speak(R_MSG.findHelp).then(()=>{ if (isOn('rfind')) speak(findSay(s), {queue:true}); });
  else speak(findSay(s));
}
$('#rfSay').addEventListener('click',()=>{ const s=RF.items[RF.idx]; if (s) speak(findSay(s)); });
$('#rfAns').addEventListener('click', async e=>{
  const b = e.target.closest('.ans'); if (!b || RF.busy) return;
  const s = RF.items[RF.idx], my = rfRun;
  if (b.dataset.v.toLowerCase() === s.toLowerCase()){
    RF.busy = true; $('#rfAns').classList.add('locked'); b.classList.add('right');
    sfx.good(); confetti(RF.wrong?12:30);
    if (!RF.wrong){ RF.stars++; RF.res[RF.idx]=1; } else RF.res[RF.idx]=2;
    $('#rfStars').textContent = '⭐ ' + RF.stars;
    const p = pick(R_PRAISE); $('#rfBubble').textContent = p + ' ' + s;
    speak(p); await speak(say(s), {queue:true});
    await new Promise(r=>setTimeout(r,700));
    if (my!==rfRun || !isOn('rfind')) return;
    RF.idx++;
    if (RF.idx >= RF.items.length) return A.finishRound(RF.stars, ()=>startFind(curDay), 'rlesson');
    showFind();
  } else {
    RF.wrong++; b.classList.add('wrong'); sfx.bad();
    $('#rfBubble').textContent = 'Zkus to znovu!';
    speak(R_MSG.again); speak(findSay(s), {queue:true});
  }
});
A.onLeave(()=>{ rfRun++; });

// ---------- every sentence this module can say (voice pre-recording) ----------
A.phraseSources.push(()=>{
  const out = [...R_PRAISE, ...Object.values(R_MSG)];
  R_LESSONS.forEach(l=>{
    l.pics.forEach(p=>out.push(picSay(p)));
    l.days.forEach(d=>d.cols.flat().forEach(s=>out.push(say(s), findSay(s))));
  });
  return out;
});
})();
