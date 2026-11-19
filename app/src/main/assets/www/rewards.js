/* Odměny: obchůdek pro Ayru, Ayřina cesta do června, kalendář tlapek, překvapení */
(function(){
'use strict';
const A = window.App; if (!A) return;
const {sfx, confetti, store} = A;
const $ = s => document.querySelector(s);

// ---------- data ----------
const SHOP = [
  // slot: head / eyes / neck = Ayra wears it; room = goes to Ayra's room
  {id:'bow',    e:'🎀', n:'Mašle',            p:8,  slot:'head'},
  {id:'flower', e:'🌸', n:'Kytička',          p:10, slot:'head'},
  {id:'cap',    e:'🧢', n:'Kšiltovka',        p:15, slot:'head'},
  {id:'hat',    e:'👒', n:'Slaměný klobouk',  p:22, slot:'head'},
  {id:'tophat', e:'🎩', n:'Cylindr',          p:28, slot:'head'},
  {id:'grad',   e:'🎓', n:'Školní čepice',    p:35, slot:'head'},
  {id:'crown',  e:'👑', n:'Korunka',          p:60, slot:'head'},
  {id:'glass',  e:'👓', n:'Brýle',            p:12, slot:'eyes'},
  {id:'sun',    e:'🕶️', n:'Sluneční brýle',   p:20, slot:'eyes'},
  {id:'scarf',  e:'🧣', n:'Šála',             p:15, slot:'neck'},
  {id:'beads',  e:'📿', n:'Korále',           p:25, slot:'neck'},
  {id:'medal',  e:'🏅', n:'Medaile',          p:45, slot:'neck'},
  {id:'bone',   e:'🦴', n:'Kostička',         p:5,  slot:'room'},
  {id:'ball',   e:'🎾', n:'Míček',            p:8,  slot:'room'},
  {id:'teddy',  e:'🧸', n:'Plyšák',           p:18, slot:'room'},
  {id:'cake',   e:'🎂', n:'Dort',             p:20, slot:'room'},
  {id:'kite',   e:'🪁', n:'Drak',             p:22, slot:'room'},
  {id:'bed',    e:'🛏️', n:'Pelíšek',          p:30, slot:'room'},
  {id:'slide',  e:'🛝', n:'Skluzavka',        p:40, slot:'room'},
  {id:'house',  e:'🏠', n:'Bouda',            p:50, slot:'room'},
];
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
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Obchůdek</h1><div class="wallet" id="shopWallet"></div></div>
  <div class="lcard ayrabox"><div class="owl big"></div><div class="room" id="shopRoom"></div></div>
  <div class="lcard"><h4>Pro Ayru na sebe</h4><div class="items" id="shopWear"></div></div>
  <div class="lcard"><h4>Do Ayřina pokojíčku</h4><div class="items" id="shopRoomItems"></div></div>
  <div class="lcard"><h4>🎁 Moje poklady</h4><div class="treasures" id="shopTreasure"></div></div>
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
      <button class="rewbtn" data-rgo="shop"><span>🛍️</span>Obchůdek</button>
      <button class="rewbtn" data-rgo="journey"><span>🗺️</span>Cesta</button>
      <button class="rewbtn" data-rgo="paws"><span>🐾</span>Tlapky</button>
    </div>
    <div class="stknext" id="rewNext"></div>
  </div>`;
document.querySelectorAll('[data-rgo]').forEach(b=>b.addEventListener('click',()=>{ sfx.tap(); open(b.dataset.rgo); }));
function open(id){ A.go(id); if (id==='shop') renderShop(); if (id==='journey') renderJourney(); if (id==='paws') renderPaws(); }

function renderHub(){
  const st = get('stk', {got:0,have:0,cost:5});
  const w = $('#rewWallet'); if (w) w.textContent = '⭐ ' + wallet();
  const n = $('#rewNext'); if (!n) return;
  n.innerHTML = st.got < PLACES.length
    ? `<div class="stkbar"><div style="width:${Math.round(100*Math.min(1,st.have/st.cost))}%"></div></div><span>${PLACES[st.got][0]} ${st.have}/${st.cost}</span>`
    : '<span>Ayra došla až na prázdniny! 🎉</span>';
}

// ---------- shop ----------
function itemHTML(it){
  const have = owned().includes(it.id), on = wear()[it.slot]===it.id;
  const label = !have ? `⭐ ${it.p}` : it.slot==='room' ? 'máš' : on ? 'nosí' : 'obléct';
  return `<button class="item ${have?'have':''} ${on?'on':''} ${!have && wallet()<it.p?'poor':''}" data-it="${it.id}">
    <span class="ie">${it.e}</span><span class="in">${it.n}</span><span class="ip">${label}</span></button>`;
}
function renderShop(){
  $('#shopWallet').textContent = '⭐ ' + wallet();
  $('#shopWear').innerHTML = SHOP.filter(i=>i.slot!=='room').map(itemHTML).join('');
  $('#shopRoomItems').innerHTML = SHOP.filter(i=>i.slot==='room').map(itemHTML).join('');
  const room = SHOP.filter(i=>i.slot==='room' && owned().includes(i.id));
  $('#shopRoom').innerHTML = room.length ? room.map(i=>`<span>${i.e}</span>`).join('') : '<small>Pokojíček je zatím prázdný</small>';
  const tr = get('treasures', {});
  const all = [...TREASURES.common, ...TREASURES.rare, ...TREASURES.gold];
  $('#shopTreasure').innerHTML = all.map(t=>{
    const c = tr[t]||0, cls = TREASURES.gold.includes(t)?'gold':TREASURES.rare.includes(t)?'rare':'';
    return `<span class="tr ${cls} ${c?'':'lock'}">${c?t:'?'}</span>`;
  }).join('');
  decorate();
}
document.getElementById('shop').addEventListener('click', e=>{
  const b = e.target.closest('[data-it]'); if (!b) return;
  const it = SHOP.find(i=>i.id===b.dataset.it), own = owned();
  if (!own.includes(it.id)){
    if (wallet() < it.p){ sfx.bad(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return; }
    set('wallet', wallet() - it.p); own.push(it.id); set('owned', own);
    sfx.good(); confetti(30);
    if (it.slot!=='room'){ const w = wear(); w[it.slot] = it.id; set('wear', w); }
  } else if (it.slot!=='room'){
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
  if (inWeek >= 5 && !wb.includes(wk)){ wb.push(wk); set('weekBonus', wb); set('wallet', wallet()+WEEK_BONUS); out.push(`🎉 5 tlapek za týden: bonus ${WEEK_BONUS} ⭐!`); }
  // surprise box every BOX_EVERY stars (all-time)
  let boxAt = get('boxAt', A.S.total + BOX_EVERY), boxes = 0;
  while (A.S.total >= boxAt){ boxes++; boxAt += BOX_EVERY; }
  set('boxAt', boxAt);
  if (boxes) set('boxes', get('boxes',0) + boxes);
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
  sfx.win(); confetti(60);
  const b = $('#openGift');
  if (b){ const d = document.createElement('div'); d.className='giftres'; d.textContent = txt; b.parentNode.insertBefore(d, b);
    const left = get('boxes',0); if (left>0) b.textContent = '🎁 Otevři další dárek ('+left+')'; else b.remove(); }
  renderHub();
}
document.addEventListener('click', e=>{ if (e.target.closest('#openGift')){ sfx.tap(); openGift(); } });

A.rewards = {afterRound, renderHub, decorate, PLACES};
renderHub(); decorate();
mo.observe(document.body,{childList:true,subtree:true});
})();
