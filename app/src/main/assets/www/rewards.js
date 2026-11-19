/* Odměny: obchůdek pro Ayru, Ayřina cesta do června, kalendář tlapek, překvapení */
(function(){
'use strict';
const A = window.App; if (!A) return;
const {sfx, confetti, store, speak, pick} = A;
const SAY = {
  wear:['Haf! Děkuju, to mi sluší!','Haf haf! Moc se mi to líbí!'], room:'Haf! To je pro mě? Děkuju!',
  poor:'Na tohle ještě nemáme dost hvězdiček.', shop:'Vítej v mojí boudě! Co mi koupíš?',
  journey:'Tohle je naše cesta. Na konci jsou prázdniny!', paws:'Za každý den s procvičováním dostaneš tlapku.',
  week:'Haf haf! Pět tlapek za týden! Tady máš bonus.', gift:'Haf! Máš dárek! Otevři ho.', gold:'Haf haf! Zlatý poklad!', yay:'Paráda!'
};
const $ = s => document.querySelector(s);

// ---------- data ----------
const SHOP = [
  // ---- na sebe (Ayra wears it everywhere): slot head / eyes / neck ----
  {id:'bow',    e:'🎀', n:'Mašle',             p:8,  slot:'head'},
  {id:'flower', e:'🌸', n:'Kytička',           p:10, slot:'head'},
  {id:'daisy',  e:'🌼', n:'Sedmikráska',       p:10, slot:'head'},
  {id:'cherry', e:'🍒', n:'Třešničky',         p:12, slot:'head'},
  {id:'fly',    e:'🦋', n:'Motýlek',           p:14, slot:'head'},
  {id:'rose',   e:'🌹', n:'Růže',              p:16, slot:'head'},
  {id:'sunfl',  e:'🌻', n:'Slunečnice',        p:16, slot:'head'},
  {id:'cap',    e:'🧢', n:'Kšiltovka',         p:15, slot:'head'},
  {id:'hat',    e:'👒', n:'Slaměný klobouk',   p:22, slot:'head'},
  {id:'tophat', e:'🎩', n:'Cylindr',           p:28, slot:'head'},
  {id:'grad',   e:'🎓', n:'Školní čepice',     p:35, slot:'head'},
  {id:'crown',  e:'👑', n:'Korunka',           p:60, slot:'head'},
  {id:'glass',  e:'👓', n:'Brýle',             p:12, slot:'eyes'},
  {id:'sun',    e:'🕶️', n:'Sluneční brýle',    p:20, slot:'eyes'},
  {id:'goggle', e:'🥽', n:'Lyžařské brýle',    p:25, slot:'eyes'},
  {id:'scarf',  e:'🧣', n:'Šála',              p:15, slot:'neck'},
  {id:'ribbon', e:'🎗️', n:'Stužka',            p:10, slot:'neck'},
  {id:'bell',   e:'🔔', n:'Zvoneček',          p:14, slot:'neck'},
  {id:'hibis',  e:'🌺', n:'Havajská kytka',    p:18, slot:'neck'},
  {id:'beads',  e:'📿', n:'Korále',            p:25, slot:'neck'},
  {id:'medal',  e:'🏅', n:'Medaile',           p:45, slot:'neck'},
  {id:'gem',    e:'💎', n:'Diamant',           p:70, slot:'neck'},
  // ---- do boudy: pos = [x %, depth 0 back wall..1 front, real size m] standing on the floor; wall = [x %, y %, m] hanging ----
  {id:'bone',   e:'🦴', n:'Kostička',          p:5,  slot:'room', pos:[31,.93,.3]},
  {id:'bowl',   e:'🥣', n:'Miska',             p:6,  slot:'room', pos:[39,.8,.34]},
  {id:'ball',   e:'🎾', n:'Míček',             p:8,  slot:'room', pos:[64,.92,.3]},
  {id:'meat',   e:'🍖', n:'Masíčko',           p:9,  slot:'room', pos:[44,.98,.3]},
  {id:'balloon',e:'🎈', n:'Balonek',           p:10, slot:'room', wall:[7,13,.45]},
  {id:'car',    e:'🚗', n:'Autíčko',           p:12, slot:'room', pos:[57,1,.34]},
  {id:'puzzle', e:'🧩', n:'Skládačka',         p:12, slot:'room', pos:[80,.97,.34]},
  {id:'plant',  e:'🪴', n:'Kytka v květináči', p:14, slot:'room', pos:[52,0,.6]},
  {id:'frame',  e:'🖼️', n:'Obrázek',           p:15, slot:'room', wall:[12,25,.55]},
  {id:'clock',  e:'🕰️', n:'Hodiny na poličku',            p:16, slot:'room', pos:[66,.88,.35], on:'wshelf'},
  {id:'books',  e:'📚', n:'Knížky do knihovny',            p:16, slot:'room', pos:[24,.9,.3], on:'bookcase'},
  {id:'teddy',  e:'🧸', n:'Plyšák',            p:18, slot:'room', pos:[9,.82,.5]},
  {id:'cake',   e:'🎂', n:'Dort',              p:20, slot:'room', pos:[72,.88,.36], on:'table'},
  {id:'mirror', e:'🪞', n:'Zrcátko',           p:20, slot:'room', wall:[33,22,.45]},
  {id:'kite',   e:'🪁', n:'Drak',              p:22, slot:'room', wall:[93,17,.6]},
  {id:'flowers',e:'💐', n:'Kytice',            p:22, slot:'room', pos:[86,.95,.4], on:'table'},
  {id:'bed',    e:'🛏️', n:'Pelíšek',           p:30, slot:'room', pos:[20,.45,1.0], svg:'dogbed'},
  {id:'drum',   e:'🥁', n:'Bubínek',           p:30, slot:'room', pos:[67,.55,.45]},
  {id:'guitar', e:'🎸', n:'Kytara',            p:32, slot:'room', pos:[5,.55,.8]},
  {id:'fish',   e:'🐠', n:'Akvárium',          p:35, slot:'room', pos:[48,.9,.45], on:'dresser', svg:'tank'},
  {id:'tv',     e:'📺', n:'Televize',          p:40, slot:'room', pos:[60,.9,.6], on:'dresser'},
  {id:'sofa',   e:'🛋️', n:'Gauč',              p:45, slot:'room', pos:[81,.18,1.6]},
  {id:'slide',  e:'🛝', n:'Skluzavka',         p:45, slot:'room', pos:[8,.15,1.25]},
  {id:'piano',  e:'🎹', n:'Piano',             p:50, slot:'room', pos:[37,.02,.75]},
  {id:'tree',   e:'🎄', n:'Stromeček',         p:55, slot:'room', pos:[95,.02,1.4]},
  {id:'rocket', e:'🚀', n:'Raketa',            p:65, slot:'room', pos:[54,.95,.35], on:'wshelf'},
  {id:'unicorn',e:'🦄', n:'Houpací jednorožec',p:80, slot:'room', pos:[88,.66,.6]},
  // ---- nábytek: other things stand on it (item.on) ----
  {id:'wshelf', e:'', n:'Polička',  p:15, slot:'furn', wall:[80,31,.9], svg:'wshelf', say:'Na to potřebuju poličku. Kup ji nejdřív.'},
  {id:'table',  e:'', n:'Stolek',   p:20, slot:'furn', pos:[46,.25,.7], svg:'table', say:'Na to potřebuju stolek. Kup ho nejdřív.'},
  {id:'dresser',e:'', n:'Komoda',   p:25, slot:'furn', pos:[64,0,1.3], svg:'dresser', say:'Na to potřebuju komodu. Kup ji nejdřív.'},
  {id:'bookcase',e:'',n:'Knihovna', p:30, slot:'furn', pos:[24,0,.9], svg:'bookcase', say:'Na to potřebuju knihovnu. Kup ji nejdřív.'},
  // ---- vylepšení boudy: slot wall / floor / window / light ----
  {id:'wpink',  e:'🩷', n:'Růžová stěna',      p:20, slot:'wall',   v:'#ffd6e7'},
  {id:'wblue',  e:'🩵', n:'Modrá stěna',       p:20, slot:'wall',   v:'#cfe9ff'},
  {id:'wyellow',e:'💛', n:'Žlutá stěna',       p:20, slot:'wall',   v:'#fff1b8'},
  {id:'wviolet',e:'💜', n:'Fialová stěna',     p:20, slot:'wall',   v:'#e6dcff'},
  {id:'fcarpet',e:'🟥', n:'Koberec',           p:25, slot:'floor',  v:'carpet'},
  {id:'fwood',  e:'🟫', n:'Parkety',           p:25, slot:'floor',  v:'wood'},
  {id:'wsun',   e:'🌤️', n:'Okno se sluníčkem', p:30, slot:'window', v:'☀️'},
  {id:'wmoon',  e:'🌙', n:'Okno s měsíčkem',   p:30, slot:'window', v:'🌙'},
  {id:'lights', e:'✨', n:'Světýlka',          p:25, slot:'light'},
];
const WEAR_SLOTS = ['head','eyes','neck'], HOUSE_SLOTS = ['wall','floor','window','light'];
const PLACES = [
  ['🏡','Domov'],['🌳','Les'],['🌻','Louka'],['🍄','Hřibová stezka'],['🌉','Most'],['🏞️','Řeka'],['🐟','Rybník'],
  ['🏕️','Tábor'],['🌲','Hluboký les'],['⛰️','Kopec'],['🏔️','Hory'],['❄️','Sněžné pole'],['⛷️','Sjezdovka'],['🌄','Údolí'],
  ['🌾','Pole'],['🚂','Nádraží'],['🏙️','Město'],['🎪','Cirkus'],['🎡','Pouť'],['🏜️','Poušť'],['🌴','Oáza'],['🏖️','Pláž'],
  ['🌊','Moře'],['⛵','Plachetnice'],['🏝️','Ostrov'],['🐠','Korálový útes'],['🌈','Duha'],['🏰','Hrad'],['🎆','Ohňostroj'],['🎉','Prázdniny!']
];
const TREASURES = {
  common:['🐚','🍀','🪨','🌰','🍁','🪶','🔮','🎈'],
  rare:['💎','🦋','🌟','🪄','🧩','🎐'],
  gold:['🏆','🥇','🦄','👸']
};
const WEEK_BONUS = 5, BOX_EVERY = 10;

// ---------- state helpers ----------
const get = (k,d)=>store.get(k,d), set = (k,v)=>store.set(k,v);
const wallet = ()=>get('wallet', 0);
const dayNo = d => Math.floor((d||new Date()).getTime()/86400000 - (d||new Date()).getTimezoneOffset()/1440);
const weekOf = n => Math.floor((n + 3) / 7);            // weeks start on Monday (day 0 = Thu 1.1.1970)
function owned(){ return get('owned', []); }
function wear(){ return get('wear', {}); }

// first run: a welcome gift so she can buy something straight away
if (get('rewv1', 0) === 0){ set('wallet', wallet() + 15); set('boxAt', A.S.total + BOX_EVERY); set('rewv1', 1); }

// ---------- Ayra's accessories (shown on every Ayra picture) ----------
function decorate(){
  const w = wear();
  document.querySelectorAll('.owl').forEach(o=>{
    o.querySelectorAll('.acc').forEach(x=>x.remove());
    ['head','eyes','neck'].forEach(slot=>{
      const it = SHOP.find(i=>i.id===w[slot]); if (!it) return;
      const s = document.createElement('span'); s.className='acc acc-'+slot; s.textContent = it.e; o.appendChild(s);
    });
  });
}
const mo = new MutationObserver(()=>{ mo.disconnect(); decorate(); mo.observe(document.body,{childList:true,subtree:true}); });

// ---------- screens ----------
document.getElementById('end').insertAdjacentHTML('beforebegin', `
<section id="shop" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Ayřina bouda</h1><div class="wallet" id="shopWallet"></div></div>
  <div class="kennel" id="kennel"></div>
  <div class="tabs" id="shopTabs"><button data-tab="wear" class="on">👒 Na sebe</button><button data-tab="room">🧸 Do boudy</button><button data-tab="furn">🪑 Nábytek</button><button data-tab="house">🎨 Vylepšení</button><button data-tab="tr">🎁 Poklady</button></div>
  <div class="lcard"><div class="items" id="shopItems"></div></div>
</section>
<section id="journey" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Ayřina cesta</h1></div>
  <div class="lcard"><div id="jNext"></div></div>
  <div class="map" id="jMap"></div>
</section>
<section id="paws" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Kalendář tlapek</h1></div>
  <div class="lcard"><div id="pWeek"></div></div>
  <div class="lcard"><h4 id="pMonth"></h4><div class="cal" id="pCal"></div></div>
</section>`);

// hub: wallet + three buttons instead of the old sticker panel
const stkPanel = document.getElementById('stickers') && document.getElementById('stickers').closest('.panel');
if (stkPanel) stkPanel.outerHTML = `
  <div class="panel rewpanel">
    <div class="row"><span class="lbl">Moje hvězdičky</span><span class="starsum" id="rewWallet"></span></div>
    <div class="rewbtns">
      <button class="rewbtn" data-rgo="shop"><span>🏠</span>Bouda</button>
      <button class="rewbtn" data-rgo="journey"><span>🗺️</span>Cesta</button>
      <button class="rewbtn" data-rgo="paws"><span>🐾</span>Tlapky</button>
    </div>
    <div class="stknext" id="rewNext"></div>
  </div>`;
document.querySelectorAll('[data-rgo]').forEach(b=>b.addEventListener('click',()=>{ sfx.tap(); open(b.dataset.rgo); }));
function open(id){ A.go(id); if (id==='shop') renderShop(); if (id==='journey') renderJourney(); if (id==='paws') renderPaws(); speak(SAY[id]); }

function renderHub(){
  const st = get('stk', {got:0,have:0,cost:5});
  const w = $('#rewWallet'); if (w) w.textContent = '⭐ ' + wallet();
  const n = $('#rewNext'); if (!n) return;
  n.innerHTML = st.got < PLACES.length
    ? `<div class="stkbar"><div style="width:${Math.round(100*Math.min(1,st.have/st.cost))}%"></div></div><span>${PLACES[st.got][0]} ${st.have}/${st.cost}</span>`
    : '<span>Ayra došla až na prázdniny! 🎉</span>';
}

// ---------- shop + kennel ----------
let shopTab = 'wear';
const inTab = it => shopTab==='wear' ? WEAR_SLOTS.includes(it.slot) : shopTab==='room' ? it.slot==='room'
  : shopTab==='furn' ? it.slot==='furn' : HOUSE_SLOTS.includes(it.slot);
const needs = it => it.on && !owned().includes(it.on) ? SHOP.find(f=>f.id===it.on) : null;
function itemHTML(it){
  const have = owned().includes(it.id), on = wear()[it.slot]===it.id, togg = !['room','furn'].includes(it.slot);
  const need = !have && needs(it);
  const label = need ? `nejdřív ${need.n.toLowerCase()}` : !have ? `⭐ ${it.p}` : !togg ? 'máš' : on ? (WEAR_SLOTS.includes(it.slot)?'nosí':'je tam') : (WEAR_SLOTS.includes(it.slot)?'obléct':'použít');
  const icon = it.svg ? `<svg viewBox="0 0 ${FURN[it.svg].w} ${FURN[it.svg].h}">${FURN[it.svg].draw(true)}</svg>` : it.e;
  return `<button class="item ${have?'have':''} ${on?'on':''} ${need?'need':''} ${!have && !need && wallet()<it.p?'poor':''}" data-it="${it.id}">
    <span class="ie">${icon}</span><span class="in">${it.n}</span><span class="ip">${label}</span></button>`;
}

// ---------- the room ----------
// Everything uses one scale (centimetres -> cqw), so things keep real proportions: Ayra sits ~70 cm,
// a sofa is 160 cm wide, a TV 60 cm. Things further back stand higher on the floor and look smaller.
// Small things stand on furniture (item.on) the way they would in a real room.
const FLOOR = 58, M = 15;                // floor line in % of the height; cqw per metre at the back wall
const kOf = d => .8 + d*.55;             // perspective scale: d = 0 back wall .. 1 front
const H = 75;                            // the room is 4:3, so its height is 75 cqw
const BOOKS = [[7,34,'#e2574c'],[6,30,'#3f8fd2'],[8,36,'#f2b134'],[5,28,'#5fb36b'],[7,33,'#9b6bd3'],[6,31,'#ef8a3c'],[8,35,'#2f6fae'],[6,29,'#d94f8a']];
function bookRow(x0, yBottom, from, n){
  let x = x0, out = '';
  for (let i=0;i<n;i++){
    const [w,h,c] = BOOKS[(from+i)%BOOKS.length];
    out += `<rect x="${x}" y="${yBottom-h}" width="${w}" height="${h}" rx="1" fill="${c}"/><rect x="${x}" y="${yBottom-h+5}" width="${w}" height="2" fill="#ffffff66"/>`;
    x += w + .6;
  }
  return out;
}
// furniture drawings, sizes in cm (w x h); surf = height of the top they hold things on
const FURN = {
  bookcase:{w:90,h:150,surf:150, draw:full=>`
    <rect x="0" y="4" width="90" height="146" rx="3" fill="#b8763d"/><rect x="6" y="9" width="78" height="135" fill="#6e4220"/>
    <rect x="-1" y="0" width="92" height="8" rx="3" fill="#cf9157"/><rect x="6" y="52" width="78" height="5" fill="#cf9157"/>
    <rect x="6" y="97" width="78" height="5" fill="#cf9157"/><rect x="0" y="144" width="90" height="6" fill="#8f5a2b"/>
    ${full ? bookRow(9,52,0,9) + bookRow(10,97,3,6) + `<rect x="58" y="80" width="22" height="7" rx="1" fill="#5fb36b"/><rect x="60" y="73" width="19" height="7" rx="1" fill="#e2574c"/>` + bookRow(9,144,5,10) : ''}`},
  dresser:{w:130,h:62,surf:62, draw:()=>`
    <rect x="10" y="50" width="7" height="12" fill="#7a4a22"/><rect x="113" y="50" width="7" height="12" fill="#7a4a22"/>
    <rect x="3" y="6" width="124" height="46" rx="3" fill="#b8763d"/><rect x="0" y="0" width="130" height="8" rx="3" fill="#d39a5f"/>
    <rect x="9" y="13" width="54" height="33" rx="3" fill="#cf9157"/><rect x="67" y="13" width="54" height="33" rx="3" fill="#cf9157"/>
    <circle cx="36" cy="29" r="3.5" fill="#7a4a22"/><circle cx="94" cy="29" r="3.5" fill="#7a4a22"/>`},
  table:{w:70,h:55,surf:53, draw:()=>`
    <ellipse cx="35" cy="51" rx="20" ry="4" fill="#8f5a2b"/><rect x="31" y="8" width="8" height="43" fill="#a86a35"/>
    <ellipse cx="35" cy="8" rx="35" ry="5" fill="#b8763d"/><ellipse cx="35" cy="5.5" rx="35" ry="5" fill="#d9a066"/>`},
  wshelf:{w:90,h:22,surf:22, draw:()=>`
    <path d="M14 6 L24 6 L14 22 Z" fill="#8f5a2b"/><path d="M76 6 L66 6 L76 22 Z" fill="#8f5a2b"/>
    <rect x="0" y="0" width="90" height="7" rx="2" fill="#cf9157"/><rect x="0" y="5" width="90" height="2" fill="#a86a35"/>`, top:true},
  dogbed:{w:100,h:38, draw:()=>`
    <ellipse cx="50" cy="20" rx="50" ry="16" fill="#c9443c"/><ellipse cx="50" cy="21" rx="40" ry="10" fill="#f6dcc6"/>
    <ellipse cx="50" cy="23" rx="33" ry="6.5" fill="#efcdb2"/>
    <path d="M0 20 Q0 38 50 38 Q100 38 100 20 Q96 31 50 31 Q4 31 0 20 Z" fill="#e2574c"/>
    <path d="M10 28 Q50 36 90 28" stroke="#ffffff88" stroke-width="2" fill="none" stroke-dasharray="4 4"/>`},
  tank:{w:50,h:36, draw:()=>`
    <rect x="1" y="5" width="48" height="31" rx="3" fill="#bfe8ff" stroke="#eaf7ff" stroke-width="2"/>
    <rect x="3" y="9" width="44" height="25" fill="#6fc3ef"/><rect x="3" y="28" width="44" height="6" fill="#e3c48d"/>
    <path d="M10 30 Q8 20 12 13 M13 30 Q15 22 12 16 M40 30 Q38 22 41 15" stroke="#3fa55a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="30" cy="14" r="1.4" fill="#fff9"/><circle cx="33" cy="11" r="1" fill="#fff9"/>
    <text x="27" y="26" font-size="14" text-anchor="middle">🐠</text><rect x="0" y="2" width="50" height="5" rx="2" fill="#4c5a66"/>`},
};
// where an item stands: {x %, bottom %, size cqw, z}
function spot(it, own){
  const base = it.on && own.includes(it.on) ? SHOP.find(f=>f.id===it.on) : null;
  if (base && base.wall){                                   // on the wall shelf
    const s = M*.8/100, [fx, fy] = base.wall;
    const dx = {clock:-22, rocket:22}[it.id] || 0;
    return {x: fx + dx*s, bottom: 100 - fy, size: it.pos[2]*M*.8, z: 6};
  }
  if (base){                                                // on a piece of furniture
    const [fx, d] = base.pos, k = kOf(d), f = FURN[base.svg];
    const dx = {tv:-30, fish:33, flowers:-14, cake:15, books:0}[it.id] || 0;
    const bottom = 100 - (FLOOR + d*(97-FLOOR)) + (f.surf*M*k/100)/H*100 - .4;
    return {x: fx + dx*M*k/100, bottom, size: it.pos[2]*M*k, z: 10+Math.round(d*100)+1};
  }
  const [x, d, m] = it.pos, k = kOf(d);
  return {x, bottom: 100 - (FLOOR + d*(97-FLOOR)), size: m*M*k, z: 10+Math.round(d*100)};
}
function kitHTML(it, own){
  if (it.id==='books' && own.includes('bookcase')) return '';          // drawn inside the bookcase
  if (it.wall && it.slot!=='furn')
    return `<span class="kit wall" style="left:${it.wall[0]}%;top:${it.wall[1]}%;font-size:${it.wall[2]*M*.8}cqw">${it.e}</span>`;
  if (it.slot==='furn' && it.wall){
    const f = FURN[it.svg], w = it.wall[2]*M*.8;
    return `<svg class="kit furn" viewBox="0 0 ${f.w} ${f.h}" style="left:${it.wall[0]}%;top:${it.wall[1]}%;width:${w}cqw;margin-left:${-w/2}cqw;z-index:5">${f.draw()}</svg>`;
  }
  const p = spot(it, own);
  if (it.svg){
    const f = FURN[it.svg], w = it.pos[2]*M*kOf(it.pos[1]);
    const full = it.id==='bookcase' && own.includes('books');
    return `<svg class="kit furn" viewBox="0 0 ${f.w} ${f.h}" style="left:${p.x}%;bottom:${p.bottom}%;width:${w}cqw;margin-left:${-w/2}cqw;z-index:${p.z}">${f.draw(full)}</svg>`;
  }
  return `<span class="kit floor" style="left:${p.x}%;bottom:${p.bottom}%;font-size:${p.size}cqw;z-index:${p.z}">${it.e}</span>`;
}
// things bought before furniture existed get their piece of furniture for free
if (!get('furnv1', false)){
  const own = owned();
  SHOP.forEach(i=>{ if (i.on && own.includes(i.id) && !own.includes(i.on)) own.push(i.on); });
  set('owned', own); set('furnv1', true);
}
function renderKennel(){
  const w = wear(), own = owned();
  const wall = (SHOP.find(i=>i.id===w.wall)||{}).v || '#efe3cf';
  const floor = (SHOP.find(i=>i.id===w.floor)||{}).v || 'plain';
  const win = (SHOP.find(i=>i.id===w.window)||{}).v;
  const items = SHOP.filter(i=>(i.slot==='room' || i.slot==='furn') && own.includes(i.id));
  const ay = spot({pos:[50,.7,.7]}, own);
  $('#kennel').style.setProperty('--wall', wall);
  $('#kennel').className = 'kennel floor-'+floor + (w.light ? ' lit' : '');
  $('#kennel').innerHTML = `
    <div class="roof"></div><div class="wallz"></div><div class="floorz"></div>
    ${win ? `<div class="win"><span>${win}</span></div>` : ''}
    ${w.light ? '<div class="garland">✨ ✨ ✨ ✨ ✨ ✨ ✨</div>' : ''}
    ${items.map(i=>kitHTML(i, own)).join('')}
    <div class="kshadow" style="left:${ay.x}%;bottom:${ay.bottom}%;width:${ay.size*.75}cqw;margin-left:${-ay.size*.375}cqw;z-index:${ay.z-1}"></div>
    <div class="owl kayra full" style="left:${ay.x}%;bottom:${ay.bottom}%;font-size:${ay.size}cqw;z-index:${ay.z}"></div>
    ${!items.length && !win && !w.wall ? '<div class="kempty">Ayřina bouda je zatím prázdná. Kup jí něco hezkého! 🛍️</div>' : ''}`;
  decorate();
}
function renderShop(){
  $('#shopWallet').textContent = '⭐ ' + wallet();
  document.querySelectorAll('#shopTabs button').forEach(b=>b.classList.toggle('on', b.dataset.tab===shopTab));
  if (shopTab==='tr'){
    const tr = get('treasures', {});
    const all = [...TREASURES.common, ...TREASURES.rare, ...TREASURES.gold];
    $('#shopItems').innerHTML = '<div class="treasures">' + all.map(t=>{
      const c = tr[t]||0, cls = TREASURES.gold.includes(t)?'gold':TREASURES.rare.includes(t)?'rare':'';
      return `<span class="tr ${cls} ${c?'':'lock'}">${c?t:'?'}</span>`;
    }).join('') + '</div>';
  } else {
    $('#shopItems').innerHTML = SHOP.filter(inTab).sort((a,b)=>a.p-b.p).map(itemHTML).join('');
  }
  renderKennel();
}
document.getElementById('shopTabs').addEventListener('click', e=>{
  const b = e.target.closest('[data-tab]'); if (!b) return; sfx.tap(); shopTab = b.dataset.tab; renderShop();
});
document.getElementById('shop').addEventListener('click', e=>{
  const b = e.target.closest('[data-it]'); if (!b) return;
  const it = SHOP.find(i=>i.id===b.dataset.it), own = owned();
  if (!own.includes(it.id)){
    const need = needs(it);
    if (need){ sfx.bad(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); speak(need.say); return; }
    if (wallet() < it.p){ sfx.bad(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); speak(SAY.poor); return; }
    set('wallet', wallet() - it.p); own.push(it.id); set('owned', own);
    sfx.good(); confetti(30); speak(WEAR_SLOTS.includes(it.slot) ? pick(SAY.wear) : SAY.room);
    if (!['room','furn'].includes(it.slot)){ const w = wear(); w[it.slot] = it.id; set('wear', w); }
    $('#kennel').scrollIntoView({behavior:'smooth', block:'start'});
  } else if (!['room','furn'].includes(it.slot)){
    const w = wear(); w[it.slot] = w[it.slot]===it.id ? null : it.id; set('wear', w); sfx.tap();
  }
  renderShop(); renderHub();
});

// ---------- journey ----------
function renderJourney(){
  const st = get('stk', {got:0,have:0,cost:5});
  const reached = Math.min(st.got, PLACES.length-1);
  $('#jNext').innerHTML = st.got < PLACES.length
    ? `<b>Další zastávka: ${PLACES[st.got][0]} ${PLACES[st.got][1]}</b>
       <div class="stkbar big"><div style="width:${Math.round(100*Math.min(1,st.have/st.cost))}%"></div></div>
       <small>Ještě ${st.cost-st.have} ⭐. Cesta je naplánovaná tak, aby Ayra došla na prázdniny koncem června.</small>`
    : '<b>Hurá! Ayra došla až na prázdniny! 🎉</b>';
  const friends = A.STICKERS || [];
  $('#jMap').innerHTML = PLACES.map((p,i)=>{
    const done = i < st.got, here = i === Math.min(st.got, PLACES.length) - 1 || (st.got===0 && i===0);
    return `<div class="stop ${done?'done':''} ${here?'here':''} ${i%2?'r':'l'}">
      <span class="pe">${p[0]}</span><span class="pn">${p[1]}</span>
      ${done && friends[i] ? `<span class="fr" title="kamarád">${friends[i]}</span>` : ''}
      ${here ? '<span class="owl tiny"></span>' : ''}</div>`;
  }).reverse().join('');
  decorate();
  const h = document.querySelector('#jMap .here'); if (h) setTimeout(()=>h.scrollIntoView({block:'center'}), 50);
}

// ---------- paw calendar ----------
const MONTHS = ['leden','únor','březen','duben','květen','červen','červenec','srpen','září','říjen','listopad','prosinec'];
function renderPaws(){
  const paws = new Set(get('paws', []));
  const today = dayNo(), wk = weekOf(today);
  let inWeek = 0; for (let d=0; d<7; d++) if (paws.has(wk*7-3+d)) inWeek++;
  const claimed = get('weekBonus', []).includes(wk);
  $('#pWeek').innerHTML = `<b>Tento týden: ${'🐾'.repeat(inWeek)}${'⚪'.repeat(Math.max(0,5-inWeek))}</b>
    <small>${claimed ? `Týdenní bonus ${WEEK_BONUS} ⭐ už máš. Skvělé!` : `Za 5 dní s tlapkou v týdnu dostaneš bonus ${WEEK_BONUS} ⭐.`}</small>`;
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  $('#pMonth').textContent = MONTHS[m][0].toUpperCase()+MONTHS[m].slice(1)+' '+y;
  const first = new Date(y,m,1), offset = (first.getDay()+6)%7, days = new Date(y,m+1,0).getDate();
  let h = ['Po','Út','St','Čt','Pá','So','Ne'].map(d=>`<span class="cd hd">${d}</span>`).join('');
  for (let i=0;i<offset;i++) h += '<span class="cd"></span>';
  for (let d=1; d<=days; d++){
    const n = dayNo(new Date(y,m,d));
    h += `<span class="cd ${n===today?'today':''} ${paws.has(n)?'paw':''}">${paws.has(n)?'🐾':d}</span>`;
  }
  $('#pCal').innerHTML = h;
}

// ---------- after every finished round ----------
// gets the stars earned, returns HTML for the end screen
function afterRound(add){
  const out = [];
  set('wallet', wallet() + add);
  // paw for today + weekly bonus
  const today = dayNo(), paws = get('paws', []);
  if (!paws.includes(today)){ paws.push(today); set('paws', paws); out.push('🐾 Dnešní tlapka je v kalendáři!'); }
  const wk = weekOf(today); let inWeek = 0; for (let d=0; d<7; d++) if (paws.includes(wk*7-3+d)) inWeek++;
  const wb = get('weekBonus', []);
  if (inWeek >= 5 && !wb.includes(wk)){ wb.push(wk); set('weekBonus', wb); set('wallet', wallet()+WEEK_BONUS); out.push(`🎉 5 tlapek za týden: bonus ${WEEK_BONUS} ⭐!`); speak(SAY.week, {queue:true}); }
  // surprise box every BOX_EVERY stars (all-time)
  let boxAt = get('boxAt', A.S.total + BOX_EVERY), boxes = 0;
  while (A.S.total >= boxAt){ boxes++; boxAt += BOX_EVERY; }
  set('boxAt', boxAt);
  if (boxes){ set('boxes', get('boxes',0) + boxes); speak(SAY.gift, {queue:true}); }
  if (get('boxes',0) > 0) out.push(`<button class="giftbtn" id="openGift">🎁 Otevři dárek${get('boxes',0)>1?' ('+get('boxes',0)+')':''}</button>`);
  out.push(`<span class="small">Teď máš ⭐ ${wallet()} na nákupy v obchůdku</span>`);
  renderHub();
  return out.map(x=>`<div class="rewline">${x}</div>`).join('');
}
function openGift(){
  let n = get('boxes',0); if (n<=0) return; set('boxes', n-1);
  let txt;
  if (Math.random() < 0.55){
    const s = 2 + Math.floor(Math.random()*3); set('wallet', wallet()+s); txt = `⭐ ${s} hvězdičky navíc!`;
  } else {
    const r = Math.random(), tier = r < 0.07 ? 'gold' : r < 0.32 ? 'rare' : 'common';
    const t = TREASURES[tier][Math.floor(Math.random()*TREASURES[tier].length)];
    const tr = get('treasures', {});
    if (tr[t]){ set('wallet', wallet()+2); txt = `${t} tenhle poklad už máš, tak ⭐ 2 navíc!`; }
    else { tr[t] = 1; set('treasures', tr); txt = `${t} nový ${tier==='gold'?'ZLATÝ ':tier==='rare'?'vzácný ':''}poklad!`; }
  }
  sfx.win(); confetti(60); speak(/ZLATÝ/.test(txt) ? SAY.gold : SAY.yay);
  const b = $('#openGift');
  if (b){ const d = document.createElement('div'); d.className='giftres'; d.textContent = txt; b.parentNode.insertBefore(d, b);
    const left = get('boxes',0); if (left>0) b.textContent = '🎁 Otevři další dárek ('+left+')'; else b.remove(); }
  renderHub();
}
document.addEventListener('click', e=>{ if (e.target.closest('#openGift')){ sfx.tap(); openGift(); } });

A.rewards = {afterRound, renderHub, decorate, PLACES};
A.phraseSources.push(()=>[...Object.values(SAY).flat(), ...SHOP.filter(i=>i.say).map(i=>i.say)]);
renderHub(); decorate();
mo.observe(document.body,{childList:true,subtree:true});
})();
