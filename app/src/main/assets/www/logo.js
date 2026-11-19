/* Logopedie: C S Z (úsměv) a Č Š Ž (čumáček) */
(function(){
'use strict';
const A = window.App; if (!A) return;
const {speak, hush, sfx, confetti, pick, VOC} = A;
const $ = s => document.querySelector(s);
const cap = s => s.charAt(0).toUpperCase()+s.slice(1);

// ---------- data ----------
const L = {
  S:{grp:'smile', voiced:false, aff:false, emo:'🐍', name:'had',      who:'Had syčí',        snd:'s',   pair:'Š',
     words:[['sova','🦉'],['slon','🐘'],['sýr','🧀'],['sáňky','🛷'],['pes','🐕'],['nos','👃']],
     syl:['sa','se','si','so','su']},
  Z:{grp:'smile', voiced:true,  aff:false, emo:'🐝', name:'včelka',   who:'Včelka bzučí',    snd:'z',   pair:'Ž',
     words:[['zebra','🦓'],['zámek','🏰'],['zub','🦷'],['zmrzlina','🍦'],['koza','🐐'],['váza','🏺']],
     syl:['za','ze','zi','zo','zu']},
  C:{grp:'smile', voiced:false, aff:true,  emo:'🦗', name:'cvrček',   who:'Cvrček cvrká',    snd:'c', pair:'Č',
     words:[['citron','🍋'],['cibule','🧅'],['opice','🐒'],['ovce','🐑'],['palec','👍'],['měsíc','🌙']],
     syl:['ca','ce','ci','co','cu']},
  'Š':{grp:'round', voiced:false, aff:false, emo:'🚂', name:'mašinka', who:'Mašinka šumí',   snd:'š',   pair:'S',
     words:[['šnek','🐌'],['šála','🧣'],['šaty','👗'],['myš','🐭'],['koš','🧺'],['hruška','🍐']],
     syl:['ša','še','ši','šo','šu']},
  'Ž':{grp:'round', voiced:true,  aff:false, emo:'🪲', name:'brouček', who:'Brouček letí',   snd:'ž',   pair:'Z',
     words:[['žába','🐸'],['žirafa','🦒'],['ježek','🦔'],['lžíce','🥄'],['žížala','🪱'],['nůžky','✂️']],
     syl:['ža','že','ži','žo','žu']},
  'Č':{grp:'round', voiced:false, aff:true,  emo:'🐱', name:'kočička', who:'Voláme kočičku',  snd:'č', pair:'C',
     words:[['čokoláda','🍫'],['čaj','🍵'],['kočka','🐱'],['klíč','🔑'],['míč','⚽'],['čert','😈']],
     syl:['ča','če','či','čo','ču']},
};
const PAIRS = [['S','Š'],['Z','Ž'],['C','Č']];

function steps(k){
  const d = L[k], smile = d.grp==='smile';
  const out = [
    {p:'lips',  i:smile?'😁':'😗', t: smile?'Rty: udělej široký úsměv.':'Rty: našpul pusinku dopředu jako čumáček.'},
    {p:'teeth', i:'🦷', t:'Zoubky: dej je k sobě.'},
  ];
  if (smile) out.push({p:'tongue', i:'👅', t:'Jazýček: špička se schová dolů, za dolní zoubky.'});
  else {
    out.push({p:'finger', i:'☝️', t:'Prstík: dej si prst pod bradu.'});
    out.push({p:'tongue finger', i:'👅', t:'Jazýček: špičku dej dolů a namiř ji na prstík pod bradou.'});
  }
  let air = smile ? 'Vzduch: foukej úzkým proudem mezi zoubky ven.' : 'Vzduch: foukej mezi zoubky ven a pusinka zůstane jako čumáček.';
  if (d.aff) air = smile ? 'Jazýček krátce ťukne a hned zasyčí: c! c! c!' : 'Jazýček krátce ťukne a hned zašumí: č! č! č!';
  out.push({p:'air', i:'💨', t:air});
  if (d.voiced) out.push({p:'vib', i:'✋', t:'Dej si ruku na krček. Když to děláš správně, krček bzučí.'});
  return out;
}

// ---------- SVG pictures ----------
const FINGER_FRONT = `<g class="hlable" data-p="finger">
    <rect x="87" y="124" width="26" height="52" rx="13" fill="#f2b49a" stroke="#d98f73" stroke-width="2"/>
    <ellipse cx="100" cy="134" rx="8" ry="6" fill="#ffd9cc" stroke="#d98f73" stroke-width="1.5"/></g>`;
let uid = 0;
function frontSVG(grp){
  const id = 'c'+(++uid);
  if (grp==='smile') return `
<svg class="mouth" viewBox="0 0 200 130" aria-hidden="true">
  <circle cx="100" cy="66" r="62" fill="#fcd9c8"/>
  <defs><clipPath id="${id}"><path d="M44,64 Q100,50 156,64 Q100,96 44,64 Z"/></clipPath></defs>
  <g class="hlable" data-p="lips"><path d="M26,62 Q100,28 174,62 Q100,120 26,62 Z" fill="#e8667a"/></g>
  <path d="M44,64 Q100,50 156,64 Q100,96 44,64 Z" fill="#5b1f2c"/>
  <g class="hlable" data-p="teeth" clip-path="url(#${id})">
    <rect x="40" y="46" width="120" height="22" fill="#fff"/><rect x="40" y="69" width="120" height="20" fill="#f3f3f3"/>
    <path d="M70,46V90M85,46V90M100,46V90M115,46V90M130,46V90" stroke="#d8d8e0" stroke-width="1.5"/>
    <path d="M40,68.5H160" stroke="#c9c9d6" stroke-width="1.5"/>
  </g>
</svg>`;
  return `
<svg class="mouth" viewBox="0 0 200 170" aria-hidden="true">
  <circle cx="100" cy="66" r="62" fill="#fcd9c8"/>
  ${FINGER_FRONT}
  <defs><clipPath id="${id}"><ellipse cx="100" cy="67" rx="25" ry="19"/></clipPath></defs>
  <g class="hlable" data-p="lips">
    <ellipse cx="100" cy="67" rx="46" ry="40" fill="#e8667a"/>
    <path d="M66,48 Q100,30 134,48" stroke="#f59aa8" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
  <ellipse cx="100" cy="67" rx="25" ry="19" fill="#5b1f2c"/>
  <g class="hlable" data-p="teeth" clip-path="url(#${id})">
    <rect x="70" y="44" width="60" height="22" fill="#fff"/><rect x="70" y="67" width="60" height="22" fill="#f3f3f3"/>
    <path d="M88,44V90M100,44V90M112,44V90" stroke="#d8d8e0" stroke-width="1.5"/>
    <path d="M70,66.5H130" stroke="#c9c9d6" stroke-width="1.5"/>
  </g>
</svg>`;
}
function sideSVG(grp, voiced){
  const smile = grp==='smile';
  const upLip = smile ? 'M148,36 Q164,46 162,62 Q160,73 151,75 L149,50 Z' : 'M148,34 Q182,42 182,60 Q180,74 158,76 L150,76 L149,50 Z';
  const loLip = smile ? 'M151,85 Q162,88 161,101 Q160,113 149,117 L148,96 Z' : 'M154,84 Q182,86 181,101 Q178,116 150,118 Z';
  const tongue = smile
    ? 'M18,124 Q26,72 88,66 Q128,62 139,88 Q143,98 140,105 Q120,119 80,125 Q40,130 18,124 Z'
    : 'M18,124 Q24,66 84,62 Q124,60 136,88 Q141,102 138,112 Q122,124 80,127 Q40,130 18,124 Z';
  const air = smile ? 'M58,58 Q112,52 136,80 L214,80' : 'M58,54 Q110,48 134,76 Q144,80 160,80 L214,80';
  return `
<svg class="mouth" viewBox="0 0 220 ${smile?170:206}" aria-hidden="true">
  <path d="M6,14 H138 Q150,18 150,50 L140,51 Q108,33 60,40 Q28,46 6,62 Z" fill="#f6c7b5"/>
  <path d="M6,162 H138 Q156,150 150,116 L140,111 Q120,129 80,131 Q38,133 6,122 Z" fill="#f6c7b5"/>
  <g class="hlable" data-p="lips"><path d="${upLip}" fill="#e8667a"/><path d="${loLip}" fill="#e8667a"/></g>
  <g class="hlable" data-p="teeth">
    <path d="M137,48 L151,50 L154,78 Q148,82 143,78 Z" fill="#fff" stroke="#c9c9d6" stroke-width="1.5"/>
    <path d="M143,85 Q148,80 154,84 L152,111 L140,111 Z" fill="#fff" stroke="#c9c9d6" stroke-width="1.5"/>
  </g>
  <g class="hlable" data-p="tongue"><path d="${tongue}" fill="#ff8fa3" stroke="#e0607a" stroke-width="2"/>
    <path d="${smile?'M60,96 Q100,84 132,94':'M60,104 Q96,94 120,80'}" stroke="#e0607a" stroke-width="1.5" fill="none" opacity=".6"/></g>
  <g class="hlable" data-p="air"><path class="air" d="${air}" stroke="#3aa0ff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M206,73 L215,80 L206,87" stroke="#3aa0ff" stroke-width="3.5" fill="none" stroke-linecap="round"/></g>
  ${smile?'':`<g class="hlable" data-p="finger">
    <rect x="124" y="166" width="26" height="46" rx="13" fill="#f2b49a" stroke="#d98f73" stroke-width="2"/>
    <ellipse cx="137" cy="174" rx="8" ry="5" fill="#ffd9cc" stroke="#d98f73" stroke-width="1.5"/>
    <path d="M138,116 L137,158" stroke="#ff9f1c" stroke-width="3" stroke-dasharray="5 5" fill="none"/>
    <path d="M131,151 L137,160 L143,151" stroke="#ff9f1c" stroke-width="3" fill="none" stroke-linecap="round"/></g>`}
  ${voiced?`<g class="hlable" data-p="vib"><g class="vib"><path d="M8,148 l6,-8 l6,8 l6,-8 l6,8 l6,-8 l6,8" stroke="#9a7bff" stroke-width="3.5" fill="none" stroke-linejoin="round"/></g>
    <text x="26" y="166" font-size="12" font-weight="800" fill="#7656e6" text-anchor="middle" font-family="Nunito,sans-serif">bzučí</text></g>`:''}
</svg>`;
}

// ---------- model sounds ----------
// Parent's own recording (saved on the phone) if there is one, otherwise the bundled sound
// (sounds/*.mp3: the isolated sound cut from the Czech voice and lengthened; see tools/README).
const FILES = {S:'s.mp3', Z:'z.mp3', C:'c.mp3', 'Š':'sh.mp3', 'Ž':'zh.mp3', 'Č':'ch.mp3'};
let curAudio = null;
function stopModel(){ if (curAudio){ try{ curAudio.pause(); }catch(e){} curAudio = null; } }
function ownModel(k){ return A.store.get('model_'+k, null); }
function modelText(k){ const d=L[k]; return `${d.syl[0]}, ${d.syl[2]}, ${d.syl[4]}. ${d.words[0][0]}.`; }
function playModel(k){
  return new Promise(res=>{
    let done=false; const fin=()=>{ if(!done){ done=true; res(); } };
    if (!A.S.sound) return fin();
    stopModel(); hush();
    const a = new Audio(ownModel(k) || ('sounds/'+FILES[k])); curAudio = a;
    a.onended = fin; a.onerror = ()=>speak(modelText(k)).then(fin);
    const p = a.play(); if (p && p.catch) p.catch(a.onerror);
    setTimeout(fin, 7000);
  });
}

// ---------- screens ----------
// Lessons: add new ones here (screen = id of the lesson's screen)
const LESSONS = [
  {screen:'logo', emo:'🐍', title:'C S Z · Č Š Ž', sub:'sykavky: úsměv a čumáček', c:'teal'},
];
const html = `
<section id="logopedie" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Logopedie</h1></div>
  <div class="hero"><div class="owl" id="lessOwl"></div><div class="bubble" id="lessBubble">Vyber si lekci!</div></div>
  <div class="lsec"><h3>📚 Lekce</h3><div class="lessons">
    ${LESSONS.map((l,i)=>`<button class="lesson" style="--c:var(--${l.c});--d:var(--${l.c}-d)" data-lesson="${l.screen}">
      <span class="ln">${i+1}</span><span class="le">${l.emo}</span><span class="lt"><b>${l.title}</b><small>${l.sub}</small></span></button>`).join('')}
    <div class="lesson soon"><span class="le">✨</span><span class="lt"><b>Další lekce</b><small>brzy přibudou</small></span></div>
  </div></div>
  <div class="lsec"><h3>🤸 Na rozehřátí</h3><div class="gamebtns">
    <button class="gbtn wide" style="--c:var(--orange);--d:var(--orange-d)" id="btnWarm">🤸 Rozcvička pusinky</button>
  </div></div>
  <div class="note"><b>Pro rodiče:</b> pomůcka k domácímu procvičování, nenahrazuje logopedku. Pokud paní logopedka učí jinou polohu jazyka nebo jiné obrázky, řiďte se jí. Cvičte krátce (5–10 minut), hlavně s chválou. Nejdřív zvuk samotný, pak slabiky, pak slova.</div>
</section>

<section id="logo" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Sykavky</h1></div>
  <div class="hero"><div class="owl" id="logoOwl"></div><div class="bubble" id="logoBubble">Budeme trénovat pusinku!</div></div>
  <div class="lsec"><h3>😁 Úsměv</h3><div class="ltiles">
    ${['S','Z','C'].map(k=>`<button class="ltile smile" data-l="${k}"><span class="L">${k}</span><span class="A">${L[k].emo}</span></button>`).join('')}
  </div></div>
  <div class="lsec"><h3>😗 Čumáček</h3><div class="ltiles">
    ${['Š','Ž','Č'].map(k=>`<button class="ltile round" data-l="${k}"><span class="L">${k}</span><span class="A">${L[k].emo}</span></button>`).join('')}
  </div></div>
  <div class="lsec"><h3>🎮 Hry</h3><div class="gamebtns">
    ${PAIRS.map(([a,b])=>`<button class="gbtn" style="--c:var(--violet);--d:var(--violet-d)" data-pair="${a}${b}">👂 ${a} nebo ${b}?</button>`).join('')}
    <button class="gbtn" style="--c:var(--violet);--d:var(--violet-d)" data-pair="mix">👂 Všechno</button>
  </div></div>
</section>

<section id="sound" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><div style="flex:1"></div>
    <button class="round-btn" id="sndPlay" aria-label="Jak to zní">🔊</button></div>
  <div class="lhead"><div class="bigL" id="sndL">S</div><div class="bubble" id="sndBubble"></div></div>
  <div class="lcard">
    <h4>Jak na to</h4>
    <div class="diagrams"><div class="diag" id="dFront"></div><div class="diag" id="dSide"></div></div>
    <ul class="steps" id="sndSteps"></ul>
    <div class="btnrow"><button class="pill go" id="sndShow">▶ Ukaž mi to</button><button class="pill" id="sndModel">🔊 Jak to zní</button></div>
  </div>
  <div class="lcard">
    <h4>Zkus to sama</h4>
    <div class="btnrow" style="margin-top:0"><button class="pill" id="sndMirror">🪞 Zrcátko</button><button class="pill rec" id="sndRec">🔴 Nahraj se</button><button class="pill" id="sndHear" disabled style="opacity:.5">▶️ Poslechni se</button></div>
    <div class="mirror" id="mirror"><video id="mirrorVid" autoplay playsinline muted></video><div class="diag" id="dMirror"></div></div>
    <div class="merr" id="merr"></div>
  </div>
  <div class="lcard parent">
    <h4>👩 Pro rodiče: vlastní ukázka</h4>
    <div class="ptext">Nesedí vám ukázka? Nahrajte, jak hlásku vyslovuje paní logopedka nebo vy. Ayra pak bude pouštět vaši nahrávku.</div>
    <div class="btnrow"><button class="pill" id="ownRec">🎙️ Nahrát ukázku</button><button class="pill" id="ownDel">↩️ Vrátit původní</button></div>
    <div class="ptext" id="ownState"></div>
  </div>
  <div class="lcard"><h4>Slabiky</h4><div class="chips" id="sndSyl"></div></div>
  <div class="lcard"><h4>Slova</h4><div class="words" id="sndWords"></div></div>
</section>

<section id="lgame" class="screen">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><div style="flex:1"></div>
    <div class="scount" id="lgStars">✓ 0</div><button class="round-btn" id="lgSay" aria-label="Zopakovat">🔊</button></div>
  <div class="dots" id="lgDots"></div>
  <div class="gtalk"><div class="owl"></div><div class="bubble" id="lgBubble"></div></div>
  <div class="card"><div class="lpic" id="lgPic"></div><div class="reveal" id="lgWord"></div></div>
  <div class="answers" id="lgAns"></div>
</section>

<section id="warm" class="screen">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><div style="flex:1"></div><div class="dots" id="wDots"></div><div style="flex:1"></div></div>
  <div class="card">
    <div class="wemoji" id="wEmo"></div><div class="wtitle" id="wTitle"></div><div class="wtext" id="wText"></div><div class="wbeat" id="wBeat"></div>
  </div>
  <div class="btns" style="padding-bottom:6px"><button class="bigbtn" style="--c:var(--teal);--d:var(--teal-d)" id="wGo">▶ Začít</button>
    <button class="bigbtn" style="--c:var(--violet);--d:var(--violet-d)" id="wNext">Další ➜</button></div>
</section>`;
const end = document.getElementById('end');
end.insertAdjacentHTML('beforebegin', html);

// ---------- lessons ----------
document.querySelectorAll('[data-lesson]').forEach(b=>b.addEventListener('click',()=>{
  sfx.tap(); A.go(b.dataset.lesson);
  if (b.dataset.lesson==='logo') speak('Lekce sykavky. Vyber si písmenko.');
}));
$('#lessOwl').addEventListener('click',()=>{
  const t = pick(LESS_OWL);
  $('#lessBubble').textContent=t; speak(t);
});

const LESS_OWL = ['Vyber si lekci.', 'Než začneme, můžeme si udělat rozcvičku pusinky.', 'Každý den kousek, a půjde to samo!'];
const LOGO_OWL = ['Vyber si písmenko. Ukážu ti, kam dát jazýček.',
  'U písmenek S, Z a C se usmíváme. U Š, Ž a Č děláme čumáček a prstík dáme pod bradu.',
  'Když se ti nedaří, zkus nejdřív rozcvičku pusinky.'];
const LG_PRAISE = ['Ano!','Výborně!','Správně!','Super!'];
const WARM_PRAISE = ['Výborně!','Šikovná!','Paráda!'];
const MIRROR = {smile:'Podívej se do zrcátka. Usměj se a dej zoubky k sobě.', round:'Podívej se do zrcátka. Udělej čumáček, zoubky dej k sobě a prstík pod bradu.'};

// ---------- menu ----------
document.querySelectorAll('.ltile').forEach(b=>b.addEventListener('click',()=>{ sfx.tap(); openSound(b.dataset.l); }));
document.querySelectorAll('[data-pair]').forEach(b=>b.addEventListener('click',()=>{ sfx.tap(); startListen(b.dataset.pair); }));
$('#btnWarm').addEventListener('click',()=>{ sfx.tap(); startWarm(); });
$('#logoOwl').addEventListener('click',()=>{
  const t = pick(LOGO_OWL);
  $('#logoBubble').textContent=t; speak(t);
});
// greet on entering
document.querySelector('#hub [data-go="logopedie"]').addEventListener('click',()=>{
  setTimeout(()=>speak('Vyber si lekci.'), 60);
});

// ---------- sound detail ----------
let cur = 'S', showing = 0;
function openSound(k){
  cur = k; const d = L[k];
  A.go('sound');
  $('#sndL').textContent = k;
  const intro = `${d.emo} ${d.who}: ${d.snd}`;
  $('#sndBubble').textContent = intro;
  $('#dFront').innerHTML = frontSVG(d.grp) + (d.grp==='smile'?'zepředu: úsměv':'zepředu: čumáček');
  $('#dSide').innerHTML = sideSVG(d.grp, d.voiced) + (d.grp==='smile'?'z boku: kde je jazýček':'z boku: jazýček míří na prstík');
  $('#dMirror').innerHTML = frontSVG(d.grp) + 'takhle to má vypadat';
  $('#sndSteps').innerHTML = steps(k).map((s,i)=>`<li data-i="${i}" data-p="${s.p}"><span class="si">${s.i}</span><span>${s.t}</span></li>`).join('');
  $('#sndSyl').innerHTML = d.syl.map(s=>`<button class="chip">${s}</button>`).join('');
  $('#sndWords').innerHTML = d.words.map(([w,e])=>`<button class="word" data-w="${w}"><span class="e">${e}</span><span class="w">${mark(w,k)}</span></button>`).join('');
  stopMirror(); resetRec(); ownUI();
  speak(`${d.who}.`).then(()=>{ if (cur===k && isOn('sound')) playModel(k); });
}
function spokenLetter(k){ return {S:'es',Z:'zet',C:'cé','Š':'eš','Ž':'žet','Č':'čé'}[k]; }
function mark(w,k){ const lc=k.toLowerCase(); return w.split('').map(ch=>ch===lc?`<b>${ch}</b>`:ch).join(''); }
function isOn(id){ return document.getElementById(id).classList.contains('active'); }
function highlight(part){
  const parts = (part||'').split(' ');
  document.querySelectorAll('#sound .hlable').forEach(g=>g.classList.toggle('hl', parts.includes(g.dataset.p)));
  document.querySelectorAll('#sndSteps li').forEach(li=>li.classList.toggle('on', li.dataset.p===part));
}
async function walkSteps(){
  const my = ++showing; hush();
  const st = steps(cur);
  for (const s of st){
    if (my!==showing || !isOn('sound')) return;
    highlight(s.p);
    await speak(s.t);
    await new Promise(r=>setTimeout(r,350));
  }
  if (my!==showing || !isOn('sound')) return;
  highlight('air');
  await speak('A teď poslouchej, jak to zní.');
  await playModel(cur);
  await new Promise(r=>setTimeout(r,400));
  if (my!==showing || !isOn('sound')) return;
  highlight(null);
  speak('Zkus to taky! Můžeš se podívat do zrcátka.');
}
$('#sndShow').addEventListener('click',()=>{ sfx.tap(); walkSteps(); });
$('#sndL').addEventListener('click',()=>{ showing++; hush(); playModel(cur); });
$('#sndModel').addEventListener('click',()=>{ showing++; hush(); playModel(cur); });
$('#sndPlay').addEventListener('click',()=>{ showing++; hush(); playModel(cur); });
$('#sndSteps').addEventListener('click',e=>{
  const li = e.target.closest('li'); if(!li) return;
  showing++; highlight(li.dataset.p); const st=steps(cur)[+li.dataset.i]; if(st) speak(st.t);
});
$('#sndSyl').addEventListener('click',e=>{ const c=e.target.closest('.chip'); if(c){ showing++; sfx.tap(); speak(c.textContent); }});
$('#sndWords').addEventListener('click',e=>{
  const w=e.target.closest('.word'); if(!w) return; showing++;
  document.querySelectorAll('.word').forEach(x=>x.classList.toggle('say',x===w));
  speak(w.dataset.w).then(()=>speak('Řekni to se mnou: '+w.dataset.w, {queue:true}));
});

// ---------- mirror (front camera) ----------
let camStream = null;
async function startMirror(){
  const err = $('#merr'); err.style.display='none';
  try{
    camStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}, audio:false});
    $('#mirrorVid').srcObject = camStream;
    $('#mirror').classList.add('on'); $('#sndMirror').textContent='🪞 Zavřít zrcátko';
    speak(MIRROR[L[cur].grp]);
  }catch(e){
    err.textContent='Zrcátko se nepodařilo zapnout. Povol aplikaci přístup ke kameře.'; err.style.display='block';
  }
}
function stopMirror(){
  if (camStream){ camStream.getTracks().forEach(t=>t.stop()); camStream=null; }
  $('#mirror').classList.remove('on'); $('#sndMirror').textContent='🪞 Zrcátko';
  const v=$('#mirrorVid'); if (v) v.srcObject=null;
}
$('#sndMirror').addEventListener('click',()=>{ sfx.tap(); camStream ? stopMirror() : startMirror(); });

// ---------- record & play back ----------
let rec=null, recUrl=null, recTimer=null, micStream=null;
function resetRec(){
  if (rec && rec.state==='recording') try{ rec.stop(); }catch(e){}
  if (micStream){ micStream.getTracks().forEach(t=>t.stop()); micStream=null; }
  clearInterval(recTimer);
  const b=$('#sndRec'); b.classList.remove('live'); b.textContent='🔴 Nahraj se';
  const h=$('#sndHear'); h.disabled=!recUrl; h.style.opacity=recUrl?1:.5;
}
async function startRec(){
  const err = $('#merr'); err.style.display='none';
  hush(); showing++;
  try{
    micStream = await navigator.mediaDevices.getUserMedia({audio:true});
    const chunks=[]; rec = new MediaRecorder(micStream);
    rec.ondataavailable = e=>{ if(e.data.size) chunks.push(e.data); };
    rec.onstop = ()=>{
      if (recUrl) URL.revokeObjectURL(recUrl);
      recUrl = URL.createObjectURL(new Blob(chunks,{type:rec.mimeType||'audio/webm'}));
      if (micStream){ micStream.getTracks().forEach(t=>t.stop()); micStream=null; }
      resetRec(); playRec();
    };
    rec.start();
    let left=4; const b=$('#sndRec'); b.classList.add('live'); b.textContent='⏺ Mluv… '+left;
    recTimer=setInterval(()=>{ left--; b.textContent='⏺ Mluv… '+left; if(left<=0){ clearInterval(recTimer); if(rec.state==='recording') rec.stop(); } },1000);
  }catch(e){
    err.textContent='Mikrofon se nepodařilo zapnout. Povol aplikaci přístup k mikrofonu.'; err.style.display='block'; resetRec();
  }
}
function playRec(){ if(!recUrl) return; const a=new Audio(recUrl); a.play().catch(()=>{}); }
$('#sndRec').addEventListener('click',()=>{ sfx.tap(); if (rec && rec.state==='recording'){ clearInterval(recTimer); rec.stop(); } else startRec(); });
$('#sndHear').addEventListener('click',()=>{ playRec(); });

// ---------- parent's own model recording ----------
function ownUI(){
  const has = !!ownModel(cur);
  $('#ownState').textContent = has ? '✅ Používá se vaše nahrávka.' : 'Teď se používá původní ukázka.';
  $('#ownDel').style.display = has ? '' : 'none';
}
async function recordClip(btn, seconds){
  const label = btn.textContent;
  const stream = await navigator.mediaDevices.getUserMedia({audio:true});
  return new Promise(resolve=>{
    const chunks=[]; const r = new MediaRecorder(stream);
    r.ondataavailable = e=>{ if(e.data.size) chunks.push(e.data); };
    r.onstop = ()=>{ stream.getTracks().forEach(t=>t.stop()); btn.classList.remove('live'); btn.textContent=label;
      resolve(new Blob(chunks,{type:r.mimeType||'audio/webm'})); };
    r.start(); btn.classList.add('live');
    let left = seconds; btn.textContent='⏺ Nahrávám… '+left;
    const t = setInterval(()=>{ left--; btn.textContent='⏺ Nahrávám… '+left; if(left<=0){ clearInterval(t); r.stop(); } },1000);
  });
}
$('#ownRec').addEventListener('click', async ()=>{
  const btn=$('#ownRec'); if (btn.classList.contains('live')) return;
  showing++; hush(); stopModel();
  try{
    const blob = await recordClip(btn, 3);
    const url = await new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(blob); });
    A.store.set('model_'+cur, url); ownUI(); playModel(cur);
  }catch(e){ $('#ownState').textContent='Mikrofon se nepodařilo zapnout. Povolte aplikaci přístup k mikrofonu.'; }
});
$('#ownDel').addEventListener('click',()=>{ try{ localStorage.removeItem('mat_model_'+cur); }catch(e){} ownUI(); playModel(cur); });

A.onLeave(()=>{ stopModel(); showing++; stopMirror(); resetRec(); lgRun++; wRun++; highlight(null); });

// ---------- listening game: S or Š? ----------
const ROUND = 10;
const LG = {pair:'', items:[], idx:0, stars:0, wrong:0, res:[], busy:false};
let lgRun = 0;
function buildLG(pair){
  const pairs = pair==='mix' ? PAIRS : [pair.split('')];
  const pool = [];
  pairs.forEach(pr=>pr.forEach(k=>L[k].words.forEach(([w,e])=>pool.push({w,e,k,pr}))));
  const out=[]; const used=new Set();
  while(out.length<ROUND){
    const it = pick(pool);
    if (used.has(it.w) && used.size<pool.length) continue;
    if (out.length && out[out.length-1].w===it.w) continue;
    used.add(it.w); out.push(it);
  }
  return out;
}
function startListen(pair){
  LG.pair=pair; LG.items=buildLG(pair); LG.idx=0; LG.stars=0; LG.res=[];
  A.go('lgame'); renderLG(true);
}
function lgAnswer(it){ return `${cap(it.w)}. To je ${L[it.k].name}. Řekni to se mnou: ${it.w}.`; }
function lgPrompt(it){ const [a,b]=it.pr; return `Poslouchej: ${it.w}. Je tam ${L[a].name}, nebo ${L[b].name}?`; }
function renderLG(first){
  const it = LG.items[LG.idx]; LG.wrong=0; LG.busy=false;
  $('#lgDots').innerHTML = LG.items.map((_,i)=>`<div class="dot ${i===LG.idx?'cur':''} ${LG.res[i]===1?'gold':LG.res[i]===2?'ok':''}"></div>`).join('');
  $('#lgStars').textContent='✓ '+LG.stars;
  $('#lgPic').textContent = it.e;
  $('#lgWord').innerHTML = '&nbsp;';
  const [a,b] = it.pr;
  $('#lgBubble').textContent = `${L[a].emo} ${a}, nebo ${L[b].emo} ${b}?`;
  $('#lgAns').classList.remove('locked');
  $('#lgAns').innerHTML = [a,b].map(k=>`<button class="ans snd" data-k="${k}"><span>${k} <span class="em">${L[k].emo}</span></span><small>${L[k].name}</small></button>`).join('');
  speak(lgPrompt(it), {queue:!!first});
}
$('#lgAns').addEventListener('click', async e=>{
  const btn = e.target.closest('.ans'); if(!btn || LG.busy) return;
  const it = LG.items[LG.idx]; const my = lgRun;
  if (btn.dataset.k===it.k){
    LG.busy=true; $('#lgAns').classList.add('locked'); btn.classList.add('right');
    sfx.good(); confetti(LG.wrong?15:35);
    if (!LG.wrong){ LG.stars++; LG.res[LG.idx]=1; } else LG.res[LG.idx]=2;
    $('#lgStars').textContent='✓ '+LG.stars;
    $('#lgWord').innerHTML = mark(it.w, it.k);
    const praise = pick(LG_PRAISE);
    $('#lgBubble').textContent = `${praise} ${L[it.k].emo} ${it.k}`;
    speak(praise);
    await speak(lgAnswer(it), {queue:true});
    await new Promise(r=>setTimeout(r,1300));
    if (my!==lgRun || !isOn('lgame')) return;
    LG.idx++;
    if (LG.idx>=LG.items.length) return A.finishRound(LG.stars, ()=>startListen(LG.pair), 'logo');
    renderLG();
  } else {
    LG.wrong++; btn.classList.add('wrong'); sfx.bad();
    $('#lgBubble').textContent = 'Poslouchej ještě jednou!';
    speak(`Poslouchej ještě jednou. ${it.w}.`);
  }
});
$('#lgSay').addEventListener('click',()=>{ const it=LG.items[LG.idx]; if(it) speak(lgPrompt(it)); });

// ---------- warm-up of the mouth ----------
const WARM = [
  {e:['😁','😗'], t:'Úsměv a pusinka', x:'Usměj se a ukaž zoubky. Pak udělej pusinku dopředu. Střídej to se mnou.', b:['úsměv','pusinka','úsměv','pusinka','úsměv','pusinka']},
  {e:['👅⬆️','👅⬇️'], t:'Jazýček výtah', x:'Otevři pusu. Jazýček jede nahoru za horní zoubky a pak dolů za dolní zoubky.', b:['nahoru','dolů','nahoru','dolů','nahoru','dolů']},
  {e:['🍫'], t:'Mlsná pusinka', x:'Olízni si pusinku dokola, jako když máš na ní čokoládu.', b:['jedna','dva','tři','čtyři','pět']},
  {e:['🐴'], t:'Koník', x:'Klapej jazýčkem o patro jako koník.', b:['klap','klap','klap','klap','klap','klap']},
  {e:['🐱👅','🐱'], t:'Kočička pije mlíčko', x:'Vyplázni jazýček a zase ho schovej, jako když kočička pije mlíčko.', b:['ven','schovat','ven','schovat','ven','schovat']},
  {e:['🕯️','💨'], t:'Sfoukni svíčku', x:'Nadechni se nosem a pak dlouze foukej, jako když sfoukáváš svíčku.', b:['nádech','fouká','fouká','fouká','hotovo']},
];
let wIdx=0, wRun=0;
function startWarm(){ wIdx=0; A.go('warm'); renderWarm(true); }
function renderWarm(first){
  const w = WARM[wIdx];
  $('#wDots').innerHTML = WARM.map((_,i)=>`<div class="dot ${i===wIdx?'cur':i<wIdx?'gold':''}"></div>`).join('');
  $('#wEmo').textContent = w.e[0]; $('#wTitle').textContent = w.t; $('#wText').textContent = w.x; $('#wBeat').innerHTML='&nbsp;';
  $('#wNext').textContent = wIdx===WARM.length-1 ? 'Hotovo ✓' : 'Další ➜';
  speak(`${w.t}. ${w.x}`, {queue:!!first});
}
async function runWarm(){
  const my = ++wRun; const w = WARM[wIdx];
  hush();
  await speak('Připravit, pozor, teď!');
  for (let i=0;i<w.b.length;i++){
    if (my!==wRun || !isOn('warm')) return;
    const em = $('#wEmo'); em.textContent = w.e[i % w.e.length];
    em.classList.remove('beat'); void em.offsetWidth; em.classList.add('beat');
    $('#wBeat').textContent = w.b[i];
    sfx.tap(); speak(w.b[i]);
    await new Promise(r=>setTimeout(r,1300));
  }
  if (my!==wRun || !isOn('warm')) return;
  sfx.good(); confetti(25);
  $('#wBeat').textContent='👏';
  speak(pick(WARM_PRAISE));
}
$('#wGo').addEventListener('click',()=>{ sfx.tap(); runWarm(); });
$('#wNext').addEventListener('click',()=>{
  wRun++; sfx.tap();
  if (wIdx<WARM.length-1){ wIdx++; renderWarm(); }
  else A.finishRound(3, startWarm, 'logopedie', 0);
});

// ---------- every sentence this module can say (used to pre-record the voice) ----------
A.phraseSources.push(()=>{
  const out = [...LESS_OWL, ...LOGO_OWL, ...LG_PRAISE, ...WARM_PRAISE, ...Object.values(MIRROR),
    'Lekce sykavky. Vyber si písmenko.', 'Vyber si lekci.', 'A teď poslouchej, jak to zní.',
    'Zkus to taky! Můžeš se podívat do zrcátka.', 'Připravit, pozor, teď!', 'Poslouchej ještě jednou!'];
  Object.keys(L).forEach(k=>{
    const d=L[k];
    out.push(`${d.who}.`, modelText(k));
    steps(k).forEach(s=>out.push(s.t));
    d.syl.forEach(x=>out.push(x));
    d.words.forEach(([w])=>{
      out.push(w, 'Řekni to se mnou: '+w, `Poslouchej ještě jednou. ${w}.`);
      PAIRS.forEach(pr=>{ if (pr.includes(k)){ const it={w,k,pr}; out.push(lgPrompt(it), lgAnswer(it)); } });
    });
  });
  WARM.forEach(w=>{ out.push(`${w.t}. ${w.x}`); w.b.forEach(b=>out.push(b)); });
  return out;
});
})();
