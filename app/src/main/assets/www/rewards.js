/* Odměny: obchůdek pro Ayru, Ayřina cesta do června, kalendář tlapek, překvapení */
(function(){
'use strict';
const A = window.App; if (!A) return;
const {sfx, confetti, store, speak, pick} = A;
const SAY = {
  wear:['Haf! Děkuju, to mi sluší!','Haf haf! Moc se mi to líbí!'], room:'Haf! To je pro mě? Děkuju!',
  poor:'Na tohle ještě nemáme dost hvězdiček.', shop:'Vítej v mojí boudě! Co mi koupíš?',
  treasure:'Tady je tvoje album sbírek a odznaky.', journey:'Tohle je naše cesta. Na konci jsou prázdniny!', paws:'Za každý den s procvičováním dostaneš tlapku.',
  week:'Haf haf! Pět tlapek za týden! Tady máš bonus.', gift:'Haf! Máš dárek! Otevři ho.', gold:'Haf haf! Zlatý poklad!', yay:'Paráda!',
  night:'Psst, Ayra už spinká. Ťukni na ni a probudí se.', night2:'Dobrý večer! Ayra je ospalá. Kup jí pelíšek, ať má kde spát.',
  lockAlbum:'Tohle nejde koupit. Dostaneš to, když dokončíš sbírku v albu.', lockAdvent:'Tohle je z adventního kalendáře.',
  album:'Hurá! Máš celou sbírku! Tady máš deset hvězdiček a něco speciálního pro Ayru!',
  badge:'Haf haf! Máš nový odznak!', trick:'Haf! Naučila jsem se nový trik! Pojď se podívat do boudy.',
  wheelWin:'Haf! Kolo štěstí se zastavilo!', spin:'Pět tlapek za týden! Můžeš zatočit kolem štěstí!',
  advent:'Tohle je adventní kalendář. Každý den, kdy si zahraješ, otevřeš jedno okénko.',
  advOpen:'Haf! Co je v okénku?', adv24:'Veselé Vánoce! Tady je velký dárek!',
  advWait:'Tohle okénko ještě nejde otevřít. Musíš počkat na ten den.', advPlay:'Nejdřív si dnes zahraj aspoň jedno kolo.',
  visit:'Ahoj Ayro! Přišel jsem na návštěvu!', swap:'Vyber si obrázek, který chceš.',
  yum:'Mňam, mňam! Děkuju!', ball:'Haf haf! Hodíš mi ho ještě?', teddy:'Můj plyšáček!', bed:'Jdu si na chvilku lehnout.'
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
  {id:'balloon',e:'🎈', n:'Balonek',           p:10, slot:'room', wall:[76,12,.45]},
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
  // ---- speciální: za dokončené sbírky v albu (from:'album:<id>') a z adventního kalendáře (from:'advent') ----
  {id:'cl_sea',   e:'🤿', n:'Potápěčská maska',  p:0, slot:'eyes', from:'album:sea'},
  {id:'cl_tent',  e:'🏕️', n:'Stan',              p:0, slot:'room', from:'album:forest', pos:[33,.38,.75]},
  {id:'cl_tract', e:'🚜', n:'Traktůrek',          p:0, slot:'room', from:'album:farm',   pos:[70,1,.32]},
  {id:'cl_space', e:'🌟', n:'Hvězdná čelenka',    p:0, slot:'head', from:'album:space'},
  {id:'cl_dino',  e:'🦕', n:'Plyšový dinosaurus', p:0, slot:'room', from:'album:dino',   pos:[19,.96,.45]},
  {id:'cl_lolly', e:'🍭', n:'Obří lízátko',       p:0, slot:'room', from:'album:sweet',  pos:[97,.88,.55]},
  {id:'cl_fruit', e:'🧺', n:'Košík s ovocem',     p:0, slot:'room', from:'album:fruit',  pos:[42,.62,.32]},
  {id:'cl_bugs',  e:'🔍', n:'Lupa na broučky',    p:0, slot:'room', from:'album:bugs',   pos:[60,.78,.22]},
  {id:'cl_music', e:'🎤', n:'Mikrofon',           p:0, slot:'room', from:'album:music',  pos:[76,.62,.4]},
  {id:'cl_tales', e:'👸', n:'Princeznovská korunka',   p:0, slot:'head', from:'album:tales'},
  {id:'cl_rain',  e:'☂️', n:'Deštník',            p:0, slot:'room', from:'album:weather', wall:[33,10,.4]},
  {id:'cl_race',  e:'🏎️', n:'Závodní auto',       p:0, slot:'room', from:'album:trans',  pos:[90,.99,.36]},
  {id:'w_snow',   e:'🌨️', n:'Sníh za oknem',      p:0, slot:'snow', from:'advent'},
  {id:'w_stock',  e:'🧦', n:'Vánoční punčocha',   p:0, slot:'room', from:'advent', winter:true, wall:[88,40,.35]},
  {id:'w_snowman',e:'⛄', n:'Sněhulák',           p:0, slot:'room', from:'advent', winter:true, pos:[3,.75,.6]},
  {id:'w_sled',   e:'🛷', n:'Sáňky',              p:0, slot:'room', from:'advent', winter:true, pos:[28,.75,.5]},
  {id:'w_bells',  e:'🔔', n:'Vánoční zvonky',     p:0, slot:'room', from:'advent', winter:true, wall:[85,8,.35]},
  {id:'w_scarf',  e:'🧣', n:'Zimní šála',         p:0, slot:'neck', from:'advent'},
  {id:'w_candle', e:'🕯️', n:'Svíčka',             p:0, slot:'room', from:'advent', winter:true, pos:[55,.97,.25]},
  {id:'w_santa',  e:'🎅', n:'Mikulášská čepice',  p:0, slot:'head', from:'advent'},
  {id:'w_gifts',  e:'🎁', n:'Dárky pod stromeček',p:0, slot:'room', from:'advent', winter:true, pos:[89,.12,.4]},
];
const WEAR_SLOTS = ['head','eyes','neck'], HOUSE_SLOTS = ['wall','floor','window','light'];
const PLACES = [
  ['🏡','Domov'],['🌳','Les'],['🌻','Louka'],['🍄','Hřibová stezka'],['🌉','Most'],['🏞️','Řeka'],['🐟','Rybník'],
  ['🏕️','Tábor'],['🌲','Hluboký les'],['⛰️','Kopec'],['🏔️','Hory'],['❄️','Sněžné pole'],['⛷️','Sjezdovka'],['🌄','Údolí'],
  ['🌾','Pole'],['🚂','Nádraží'],['🏙️','Město'],['🎪','Cirkus'],['🎡','Pouť'],['🏜️','Poušť'],['🌴','Oáza'],['🏖️','Pláž'],
  ['🌊','Moře'],['⛵','Plachetnice'],['🏝️','Ostrov'],['🐠','Korálový útes'],['🌈','Duha'],['🏰','Hrad'],['🎆','Ohňostroj'],['🎉','Prázdniny!']
];
const BOX_EVERY = 10;

// ---------- state helpers ----------
const get = (k,d)=>store.get(k,d), set = (k,v)=>store.set(k,v);
const wallet = ()=>get('wallet', 0);
const dayNo = d => Math.floor((d||new Date()).getTime()/86400000 - (d||new Date()).getTimezoneOffset()/1440);
const weekOf = n => Math.floor((n + 3) / 7);            // weeks start on Monday (day 0 = Thu 1.1.1970)
function owned(){ return get('owned', []); }
function wear(){ return get('wear', {}); }

// ====================================================================================
// ALBUM: 12 collections of 10 (6 common, 3 rare, 1 gold). Gifts bring album pictures;
// 3 spare doubles can be swapped for a missing one; a full collection = 10 ⭐ + a special thing.
// ====================================================================================
const COLL = [
  {id:'sea',     n:'Moře',      e:'🌊', it:['🐚','🦀','🐟','🐠','🦐','🐡','🐙','🐢','🐬','🐳']},
  {id:'forest',  n:'Les',       e:'🌲', it:['🍄','🌰','🍂','🐌','🦔','🐿️','🦊','🦉','🦌','🐻']},
  {id:'farm',    n:'Statek',    e:'🐄', it:['🐔','🐣','🐷','🐮','🐑','🐐','🐴','🦆','🐇','🐓']},
  {id:'space',   n:'Vesmír',    e:'🚀', it:['🌙','⭐','☄️','🌍','🪐','🛰️','👽','🛸','🌌','👩‍🚀']},
  {id:'dino',    n:'Dinosauři', e:'🦕', it:['🥚','🦴','🌋','🌿','🦎','🐊','🦕','🦖','🐉','🐲']},
  {id:'sweet',   n:'Sladkosti', e:'🍭', it:['🍬','🍭','🍫','🍪','🍩','🧁','🍰','🍦','🎂','🍯']},
  {id:'fruit',   n:'Ovoce',     e:'🍎', it:['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍒','🍍']},
  {id:'bugs',    n:'Broučci',   e:'🐞', it:['🐜','🐛','🐝','🐞','🦗','🕷️','🕸️','🪲','🦋','🌼']},
  {id:'music',   n:'Hudba',     e:'🎵', it:['🎵','🎶','🥁','🎺','🎷','🎻','🪕','🎹','🎸','🎼']},
  {id:'tales',   n:'Pohádky',   e:'🏰', it:['🧚','🧙','🧝','🧜','🐸','🔮','🪄','🦄','🏰','👸']},
  {id:'weather', n:'Počasí',    e:'🌈', it:['☀️','☁️','🌧️','⛅','❄️','⛄','⚡','🌪️','🌈','🌞']},
  {id:'trans',   n:'Doprava',   e:'🚗', it:['🚲','🛴','🚌','🚕','🚓','🚑','🚒','🚂','✈️','🚁']},
];
const RARITY = i => i < 6 ? 'common' : i < 9 ? 'rare' : 'gold';
const ALBUM_TOTAL = COLL.length * 10;
const album = () => get('album', {});                    // {"sea:3": copies}
const albumHave = (al, c) => c.it.filter((_,i)=>al[c.id+':'+i]).length;
const spare = al => Object.values(al).reduce((s,n)=>s + Math.max(0, n-1), 0);
// old treasures move into the album (same picture where it exists, else a common picture)
if (!get('albumv1', false)){
  const old = get('treasures', {}), al = album();
  Object.keys(old).forEach(t=>{
    let k = null;
    COLL.forEach(c=>c.it.forEach((x,i)=>{ if (!k && x===t) k = c.id+':'+i; }));
    if (!k){ const free = COLL.flatMap(c=>c.it.map((_,i)=>c.id+':'+i)).filter(x=>!al[x] && RARITY(+x.split(':')[1])==='common'); k = pick(free); }
    if (k) al[k] = (al[k]||0) + 1;
  });
  set('album', al); set('albumv1', true);
}
// a new picture: mostly ones she does not have yet, so the album keeps filling up
function drawPicture(tier){
  const al = album();
  if (!tier){ const r = Math.random(); tier = r < .06 ? 'gold' : r < .3 ? 'rare' : 'common'; }
  const all = COLL.flatMap(c=>c.it.map((_,i)=>c.id+':'+i)).filter(k=>RARITY(+k.split(':')[1])===tier);
  const missing = all.filter(k=>!al[k]);
  return (missing.length && Math.random() < .75) ? pick(missing) : pick(all);
}
const picOf = k => { const [c,i] = k.split(':'); return COLL.find(x=>x.id===c).it[+i]; };
// adds a picture; returns text for the screen, pays the bonus for a finished collection
function addPicture(k){
  const al = album(), [cid, i] = k.split(':'), c = COLL.find(x=>x.id===cid), tier = RARITY(+i);
  const isNew = !al[k]; al[k] = (al[k]||0) + 1; set('album', al);
  let txt = `${picOf(k)} ${isNew ? (tier==='gold' ? 'ZLATÝ obrázek' : tier==='rare' ? 'vzácný obrázek' : 'nový obrázek') : 'obrázek, který už máš (do výměny)'} – sbírka ${c.n}`;
  if (isNew && albumHave(al, c) === 10) txt += '<br>' + finishCollection(c);
  return txt;
}
function finishCollection(c){
  const done = get('albumDone', []); if (done.includes(c.id)) return '';
  done.push(c.id); set('albumDone', done);
  set('wallet', wallet() + 10);
  const sp = SHOP.find(i=>i.from==='album:'+c.id), own = owned();
  if (sp && !own.includes(sp.id)){ own.push(sp.id); set('owned', own); }
  confetti(120); speak(SAY.album, {queue:true});
  return `🏆 Celá sbírka ${c.e} ${c.n}! +10 ⭐ a ${sp ? sp.e + ' ' + sp.n : ''} pro Ayru!`;
}

// ====================================================================================
// BADGES: real learning milestones, bronze / silver / gold
// ====================================================================================
const BADGES = [
  {id:'read',   e:'📖', n:'Čtenářka',    t:'přečtené slabiky',     at:[100, 500, 1000]},
  {id:'math',   e:'🔢', n:'Počtářka',    t:'příklady napoprvé',    at:[50, 200, 500]},
  {id:'write',  e:'✏️', n:'Písařka',     t:'obtažená písmena',     at:[20, 100, 300]},
  {id:'streak', e:'🔥', n:'Vytrvalost',  t:'dní v řadě',           at:[3, 7, 30]},
  {id:'perfect',e:'🌟', n:'Bez chyby',   t:'kola za 3 hvězdičky',  at:[10, 50, 150]},
  {id:'stars',  e:'⭐', n:'Hvězdička',   t:'hvězdiček celkem',     at:[100, 300, 1000]},
  {id:'album',  e:'📒', n:'Sběratelka',  t:'obrázků v albu',       at:[20, 60, 120]},
  {id:'chall',  e:'🎯', n:'Výzvy',       t:'splněné výzvy dne',    at:[5, 20, 60]},
];
const TIERS = ['🥉','🥈','🥇'], TIER_N = ['bronzový','stříbrný','zlatý'];
function badgeValue(id){
  const st = store.get('stats', {}) || {}, days = Object.values(st.days || {});
  const sum = (sec, i) => days.reduce((a,d)=>a + (d[sec] ? d[sec][i] : 0), 0);
  if (id==='read') return sum('read', 0);
  if (id==='math') return sum('math', 0);
  if (id==='write') return sum('write', 1);
  if (id==='streak') return get('bestStreak', 0);
  if (id==='perfect') return get('perfect', 0);
  if (id==='stars') return A.S.total;
  if (id==='album') return Object.keys(album()).length;
  if (id==='chall') return get('chCount', 0);
  return 0;
}
const badgeLevel = b => b.at.filter(x=>badgeValue(b.id) >= x).length;     // 0..3
function checkBadges(){
  const got = get('badges', {}), out = [];
  BADGES.forEach(b=>{
    const lv = badgeLevel(b);
    if (lv > (got[b.id]||0)){ got[b.id] = lv; out.push(`${TIERS[lv-1]} ${b.e} Nový ${TIER_N[lv-1]} odznak ${b.n}!`); }
  });
  if (out.length){ set('badges', got); speak(SAY.badge, {queue:true}); }
  return out;
}
function updateStreak(){
  const paws = new Set(get('paws', [])); let n = 0, d = dayNo();
  while (paws.has(d)){ n++; d--; }
  if (n > get('bestStreak', 0)) set('bestStreak', n);
}

// ====================================================================================
// TRICKS: every 50 stars Ayra learns a new trick and shows it in her kennel
// ====================================================================================
const TRICKS = [
  {id:'sit',   n:'Sedni!'},          {id:'jump',  n:'Hop!'},           {id:'spin',  n:'Zatoč se!'},
  {id:'paw',   n:'Dej pac!'},        {id:'bow',   n:'Ukloň se!'},      {id:'roll',  n:'Převal se!'},
  {id:'dance', n:'Zatancuj!'},       {id:'five',  n:'Dej pětku!'},     {id:'stand', n:'Panáček!'},
  {id:'sing',  n:'Zazpívej!'},       {id:'flip',  n:'Salto!'},         {id:'wave',  n:'Zamávej!'},
];
const STARS_PER_LEVEL = 50;
const level = () => Math.floor(A.S.total / STARS_PER_LEVEL);
const tricksKnown = () => TRICKS.slice(0, Math.min(TRICKS.length, level()));
function checkLevel(){
  const lv = level(), seen = get('levelSeen', lv === 0 ? 0 : lv - 1);
  if (lv <= seen) return [];
  set('levelSeen', lv);
  const t = TRICKS[Math.min(lv, TRICKS.length) - 1];
  speak(SAY.trick, {queue:true});
  return [lv <= TRICKS.length ? `🐶 Ayra je na úrovni ${lv} a naučila se nový trik: <b>${t.n}</b> Ukáže ti ho v boudě.` : `🐶 Ayra je na úrovni ${lv}!`];
}

// ====================================================================================
// LUCKY WHEEL instead of the fixed weekly bonus (5 paws in a week = one spin)
// ====================================================================================
const WHEEL = [
  {e:'⭐3', k:'s', v:3, c:'#ffd447'}, {e:'🎁', k:'g', v:1, c:'#ff8fb1'}, {e:'⭐5', k:'s', v:5, c:'#7fd3ff'},
  {e:'💜', k:'r', v:1, c:'#c9a7ff'},  {e:'⭐8', k:'s', v:8, c:'#9be38f'}, {e:'🎁🎁', k:'g', v:2, c:'#ffb36b'},
  {e:'⭐4', k:'s', v:4, c:'#ffd447'}, {e:'⭐15', k:'s', v:15, c:'#ff7b7b'},
];
function wheelSVG(){
  const n = WHEEL.length, R = 100;
  return `<svg viewBox="-105 -105 210 210" class="wheel" id="wheel">${WHEEL.map((w,i)=>{
    const a0 = (i/n)*2*Math.PI - Math.PI/2, a1 = ((i+1)/n)*2*Math.PI - Math.PI/2, am = (a0+a1)/2;
    return `<path d="M0 0 L${R*Math.cos(a0)} ${R*Math.sin(a0)} A${R} ${R} 0 0 1 ${R*Math.cos(a1)} ${R*Math.sin(a1)} Z" fill="${w.c}" stroke="#fff" stroke-width="3"/>
      <text x="${62*Math.cos(am)}" y="${62*Math.sin(am)+7}" font-size="19" font-weight="900" text-anchor="middle" fill="#3b3b5c">${w.e}</text>`;
  }).join('')}<circle r="14" fill="#fff" stroke="#ddd" stroke-width="3"/></svg>`;
}
let wheelTurn = 0, spinning = false;
function spinWheel(){
  if (spinning || get('spins', 0) <= 0) return;
  spinning = true; set('spins', get('spins',0) - 1); sfx.tap();
  const i = Math.floor(Math.random() * WHEEL.length), seg = 360 / WHEEL.length;
  wheelTurn += 360*5 + (360 - (wheelTurn % 360)) - (i*seg + seg/2);
  $('#wheel').style.transform = `rotate(${wheelTurn}deg)`;
  setTimeout(()=>{
    const w = WHEEL[i]; let txt;
    if (w.k==='s'){ set('wallet', wallet() + w.v); txt = `⭐ ${w.v} hvězdiček!`; }
    else if (w.k==='g'){ set('boxes', get('boxes',0) + w.v); txt = w.v > 1 ? '🎁🎁 Dva dárky! Otevřeš je v Pokladech.' : '🎁 Dárek! Otevřeš ho v Pokladech.'; }
    else txt = addPicture(drawPicture('rare'));
    sfx.win(); confetti(70); speak(SAY.wheelWin);
    $('#wheelRes').innerHTML = txt; spinning = false; renderHub(); renderWheelBtn();
  }, 4200);
}
function renderWheelBtn(){
  const n = get('spins', 0), b = $('#spinBtn'); if (!b) return;
  b.disabled = n <= 0 || spinning; b.textContent = n > 0 ? `🎡 Zatoč! (${n})` : '🎡 Zatočíš za 5 tlapek v týdnu';
}

// ====================================================================================
// ADVENT CALENDAR: 1.–24. 12., one window for every day she plays (missed ones can be caught up)
// ====================================================================================
const ADVENT = {
  1:{s:3}, 2:{i:'w_snow'}, 3:{s:3}, 4:{g:1}, 5:{i:'w_stock'}, 6:{s:5, g:1}, 7:{s:3}, 8:{i:'w_snowman'},
  9:{s:3}, 10:{g:1}, 11:{i:'w_sled'}, 12:{s:4}, 13:{i:'w_bells'}, 14:{g:1}, 15:{i:'w_scarf'}, 16:{s:4},
  17:{i:'w_candle'}, 18:{g:1}, 19:{s:5}, 20:{i:'w_santa'}, 21:{g:1}, 22:{s:5}, 23:{i:'w_gifts'}, 24:{s:15, g:3, i:'tree'},
};
const ADV_ORDER = [7,15,2,20,11,4,18,9,23,1,13,6,16,22,3,10,19,8,14,24,5,17,12,21];   // shuffled like a real one
const isWinter = () => [11,0,1].includes(new Date().getMonth());
const adventOn = () => { const d = new Date(); return (d.getMonth()===10 && d.getDate()>=25) || (d.getMonth()===11 && d.getDate()<=31); };
const advDay = () => { const d = new Date(); return d.getMonth()===11 ? Math.min(d.getDate(), 24) : 0; };
const playedToday = () => get('paws', []).includes(dayNo());
function advContent(day){
  const a = ADVENT[day], parts = [];
  if (a.i){ const it = SHOP.find(x=>x.id===a.i); if (it) parts.push(it.e); }
  if (a.g) parts.push('🎁'.repeat(Math.min(a.g, 3)));
  if (a.s) parts.push('⭐' + a.s);
  return parts.join(' ');
}
function openAdvent(day){
  const opened = get('advent', []);
  if (opened.includes(day)) return;
  if (day > advDay()) { speak(SAY.advWait); return; }
  if (!playedToday()){ speak(SAY.advPlay); return; }
  opened.push(day); set('advent', opened);
  const a = ADVENT[day], own = owned(); let txt = [];
  if (a.i){ const it = SHOP.find(x=>x.id===a.i);
    if (it && !own.includes(it.id)){ own.push(it.id); set('owned', own); txt.push(`${it.e} ${it.n}`); }
    else if (it) { set('wallet', wallet() + 10); txt.push('⭐ 10'); } }
  if (a.g){ set('boxes', get('boxes',0) + a.g); txt.push(`🎁 ${a.g > 1 ? a.g + ' dárky' : 'dárek'}`); }
  if (a.s){ set('wallet', wallet() + a.s); txt.push(`⭐ ${a.s}`); }
  sfx.win(); confetti(day===24 ? 150 : 60); speak(day===24 ? SAY.adv24 : SAY.advOpen);
  renderAdvent(`${day}. prosince: ${txt.join(' + ')}`); renderHub();
}
function renderAdvent(msg){
  const opened = get('advent', []), today = advDay();
  $('#advInfo').innerHTML = msg ? `<b>${msg}</b>` : today === 0
    ? 'Kalendář se otevírá 1. prosince. Každý den, kdy si zahraješ aspoň jedno kolo, otevřeš okénko!'
    : (playedToday() ? 'Dnes jsi hrála, můžeš otvírat okénka! 🎄' : 'Zahraj si dnes aspoň jedno kolo a pak otevři okénko. 🎄');
  $('#advGrid').innerHTML = ADV_ORDER.map(d=>{
    const o = opened.includes(d), can = !o && d <= today && playedToday();
    return `<button class="advwin ${o?'open':''} ${can?'can':''} ${d===24?'big':''}" data-adv="${d}">${o ? `<span>${advContent(d)}</span>` : `<b>${d}</b>`}</button>`;
  }).join('');
}

// ====================================================================================
// FRIENDS from the journey come to visit the kennel (a different one every day)
// ====================================================================================
function visitor(){
  const st = get('stk', {got:0}), friends = (A.STICKERS || []).slice(0, st.got);
  if (!friends.length) return null;
  const d = dayNo(); if (d % 3 === 1) return null;                      // some days Ayra is alone
  return friends[d % friends.length];
}


// first run: a welcome gift so she can buy something straight away
if (get('rewv1', 0) === 0){ set('wallet', wallet() + 15); set('boxAt', A.S.total + BOX_EVERY); set('rewv1', 1); }

// ---------- Ayra's accessories (shown on every Ayra picture) ----------
// a knitted scarf drawn around Ayra's neck (the emoji one only hangs straight down)
// neck things are drawn around the neck (emoji alone would just hang over the mouth)
const NECK_CURVE = t => [3*(1-t)*(1-t) + 100*(1-t)*t + 97*t*t, 10*(1-t)*(1-t) + 60*(1-t)*t + 10*t*t];  // Q 3,10 50,30 97,10
const along = (n, from, to) => Array.from({length:n}, (_,i)=>NECK_CURVE(from + (to-from)*i/(n-1)));
const NECK = {
  scarf:`<path d="M3 10 Q50 30 97 10 L95 24 Q50 44 5 24 Z" fill="#e2574c"/>
    <path d="M8 14 Q50 33 92 14 M8 19 Q50 38 92 19" stroke="#f47f73" stroke-width="1.6" fill="none"/>
    <path d="M57 30 L71 29 L77 56 L62 58 Z" fill="#d94a40"/>
    <rect x="59" y="38" width="15" height="3" fill="#f4a29a" transform="rotate(-6 66 39)"/><rect x="60" y="46" width="16" height="3" fill="#f4a29a" transform="rotate(-6 68 47)"/>
    <path d="M63 58 v6 M66 57.6 v6 M69 57.2 v6 M72 56.8 v6 M75 56.4 v6" stroke="#d94a40" stroke-width="1.6"/>
    <ellipse cx="64" cy="30" rx="9" ry="7" fill="#c43d33"/>`,
  beads: along(15, .02, .98).map(([x,y],i)=>`<circle cx="${x}" cy="${y+2}" r="3.6" fill="${['#e2574c','#f2b134','#3f8fd2','#5fb36b','#9b6bd3'][i%5]}" stroke="#00000033" stroke-width=".6"/><circle cx="${x-1}" cy="${y+.8}" r="1" fill="#fff9"/>`).join(''),
  bell:`<path d="M3 10 Q50 30 97 10" stroke="#d93b3b" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M3 8.5 Q50 28.5 97 8.5" stroke="#ff7a7a" stroke-width="1.4" fill="none"/>
    <text x="50" y="40" font-size="20" text-anchor="middle">🔔</text>`,
  medal:`<path d="M34 16 L46 44 L54 44 L44 18 Z" fill="#3f8fd2"/><path d="M66 16 L54 44 L46 44 L56 18 Z" fill="#e2574c"/>
    <circle cx="50" cy="50" r="10" fill="#f5c242" stroke="#d39b12" stroke-width="2"/><text x="50" y="55" font-size="12" text-anchor="middle" fill="#b07a00" font-weight="900">1</text>`,
  gem:`<path d="M3 10 Q50 30 97 10" stroke="#c9ced8" stroke-width="1.6" fill="none" stroke-dasharray="2 1.2"/>
    <path d="M44 20 L50 25 L56 20" stroke="#c9ced8" stroke-width="1.6" fill="none"/><text x="50" y="40" font-size="16" text-anchor="middle">💎</text>`,
  hibis: along(5, .1, .9).map(([x,y])=>`<text x="${x}" y="${y+7}" font-size="15" text-anchor="middle">🌺</text>`).join(''),
  ribbon:`<text x="76" y="44" font-size="20" text-anchor="middle">🎗️</text>`,     // pinned on the chest, her left side
};
// winter scarf: the knitted one in green and white
NECK.w_scarf = NECK.scarf.replace(/#e2574c/g,'#2f9e5b').replace(/#f47f73/g,'#ffffff').replace(/#d94a40/g,'#278a4e').replace(/#f4a29a/g,'#ffffff').replace(/#c43d33/g,'#1f7a43');
const NECK_SVG = id => NECK[id] ? `<svg viewBox="0 0 100 64" overflow="visible">${NECK[id]}</svg>` : null;
// drawn hats (an emoji face would not fit): Santa's cap sits on the head, slightly tilted
// drawn head things: the white fur band (y 46–60) sits on the top of the head between the ears
const HEAD = {
  w_santa:`<path d="M6 50 Q14 6 60 4 Q86 6 94 30 L82 34 Q72 18 58 22 Q36 30 30 50 Z" fill="#e2453c"/>
    <path d="M58 22 Q74 14 82 34" fill="none" stroke="#c43a32" stroke-width="2"/>
    <rect x="0" y="44" width="100" height="17" rx="8.5" fill="#fff"/><rect x="0" y="44" width="100" height="5" rx="2.5" fill="#eef1f6"/>
    <circle cx="89" cy="34" r="10" fill="#fff"/>`,
  cl_space:`<path d="M8 60 Q50 30 92 60" fill="none" stroke="#3b4a9c" stroke-width="7" stroke-linecap="round"/>
    <path d="M30 46 Q22 32 26 16 M70 46 Q78 32 74 16" fill="none" stroke="#6c7bd9" stroke-width="3"/>
    <text x="26" y="20" font-size="24" text-anchor="middle">⭐</text><text x="74" y="20" font-size="24" text-anchor="middle">⭐</text>
    <text x="50" y="40" font-size="14" text-anchor="middle">🌙</text>`,
  cl_tales:`<path d="M10 60 L16 32 L32 46 L50 14 L68 46 L84 32 L90 60 Z" fill="#ffd447" stroke="#e0a800" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="50" cy="16" r="5" fill="#ff6fa8"/><circle cx="16" cy="32" r="4" fill="#5ab8ff"/><circle cx="84" cy="32" r="4" fill="#5ab8ff"/>
    <rect x="12" y="52" width="76" height="6" rx="3" fill="#ffe680"/><circle cx="50" cy="42" r="5" fill="#9a7bff"/>`,
};
const HATS = ['cap','hat','tophat','grad','crown'];                     // proper hats are as wide as the head
const HEAD_SVG = id => HEAD[id] ? `<svg viewBox="0 0 100 64" overflow="visible">${HEAD[id]}</svg>` : null;
// put the worn things on every Ayra; only owls whose outfit changed are touched
function decorate(){
  const w = wear(), sig = [w.head, w.eyes, w.neck].join('|');
  document.querySelectorAll('.owl').forEach(o=>{
    if (o.dataset.acc === sig) return;
    o.dataset.acc = sig;
    o.querySelectorAll('.acc').forEach(x=>x.remove());
    ['head','eyes','neck'].forEach(slot=>{
      const it = SHOP.find(i=>i.id===w[slot]); if (!it) return;
      const s = document.createElement('span'); s.className='acc acc-'+slot;
      const svg = (slot==='neck' && NECK_SVG(it.id)) || (slot==='head' && HEAD_SVG(it.id));
      if (svg){ s.className += ' wrap'; s.innerHTML = svg; } else s.textContent = it.e;
      if (HATS.includes(it.id)) s.className += ' hat';
      o.appendChild(s);
    });
  });
}
let decoQueued = false;
const mo = new MutationObserver(()=>{ if (decoQueued) return; decoQueued = true; requestAnimationFrame(()=>{ decoQueued = false; decorate(); }); });

// ---------- screens ----------
document.getElementById('end').insertAdjacentHTML('beforebegin', `
<section id="shop" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Ayřina bouda</h1><div class="wallet" id="shopWallet"></div></div>
  <div class="kennel" id="kennel"></div>
  <div class="tabs" id="shopTabs"><button data-tab="wear" class="on">👒 Na sebe</button><button data-tab="room">🧸 Do boudy</button><button data-tab="furn">🪑 Nábytek</button><button data-tab="house">🎨 Vylepšení</button></div>
  <div class="lcard"><div class="items" id="shopItems"></div></div>
</section>
<section id="treasure" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Album a odznaky</h1></div>
  <div class="hero"><div class="owl"></div><div class="bubble" id="trBubble">Za každých 10 hvězdiček dostaneš dárek s obrázkem do alba. Za celou sbírku dostane Ayra něco speciálního!</div></div>
  <div class="lcard" id="trGifts"></div>
  <div class="lcard"><h4>🏅 Odznaky</h4><div class="badges" id="trBadges"></div></div>
  <div class="lcard"><h4 id="trCount"></h4><div id="trAll"></div></div>
</section>
<section id="advent" class="screen scroll">
  <div class="top"><button class="round-btn" data-back aria-label="Zpět">⬅️</button><h1 class="subh">Adventní kalendář</h1></div>
  <div class="lcard advinfo" id="advInfo"></div>
  <div class="advgrid" id="advGrid"></div>
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
      <button class="rewbtn" data-rgo="treasure"><span>🎁</span>Poklady<i class="rbadge" id="giftBadge"></i></button>
    </div>
    <button class="advcard" data-rgo="advent" id="advCard">🎄 <b>Adventní kalendář</b><span id="advCardTxt"></span></button>
    <div class="stknext" id="rewNext"></div>
  </div>`;
document.querySelectorAll('[data-rgo]').forEach(b=>b.addEventListener('click',()=>{ sfx.tap(); open(b.dataset.rgo); }));
function open(id){ A.go(id); if (id==='shop') renderShop(); if (id==='journey') renderJourney(); if (id==='paws') renderPaws(); if (id==='treasure'){ swapMode = false; renderTreasure(); } if (id==='advent') renderAdvent();
  speak(id==='shop' && phase()==='night' ? (owned().includes('bed') ? SAY.night : SAY.night2) : SAY[id]); }

function renderHub(){
  const st = get('stk', {got:0,have:0,cost:5});
  const w = $('#rewWallet'); if (w) w.textContent = '⭐ ' + wallet();
  const ac = $('#advCard'); if (ac){ ac.style.display = adventOn() ? '' : 'none';
    const waiting = advDay() && !get('advent', []).includes(advDay());
    $('#advCardTxt').textContent = !advDay() ? 'od 1. prosince' : waiting ? (playedToday() ? 'otevři dnešní okénko!' : 'zahraj si a otevři okénko') : 'dnešní okénko je otevřené';
    ac.classList.toggle('ready', !!(waiting && playedToday())); }
  const gb = $('#giftBadge'); if (gb){ const n = get('boxes',0); gb.textContent = n || ''; gb.style.display = n ? '' : 'none'; }
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
  const need = !have && needs(it), lockedSpecial = !have && it.from;
  const label = lockedSpecial ? (it.from==='advent' ? '🔒 z adventu' : `🔒 sbírka ${COLL.find(c=>'album:'+c.id===it.from).n}`)
    : need ? `nejdřív ${need.n.toLowerCase()}` : !have ? `⭐ ${it.p}` : !togg ? 'máš' : on ? (WEAR_SLOTS.includes(it.slot)?'nosí':'je tam') : (WEAR_SLOTS.includes(it.slot)?'obléct':'použít');
  const icon = it.svg ? `<svg viewBox="0 0 ${FURN[it.svg].w} ${FURN[it.svg].h}">${FURN[it.svg].draw(true)}</svg>` : it.e;
  return `<button class="item ${have?'have':''} ${on?'on':''} ${need||lockedSpecial?'need':''} ${it.from?'special':''} ${!have && !need && !lockedSpecial && wallet()<it.p?'poor':''}" data-it="${it.id}">
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
    return `<span class="kit wall" data-id="${it.id}" style="left:${it.wall[0]}%;top:${it.wall[1]}%;font-size:${it.wall[2]*M*.8}cqw">${it.e}</span>`;
  if (it.slot==='furn' && it.wall){
    const f = FURN[it.svg], w = it.wall[2]*M*.8;
    return `<svg class="kit furn" data-id="${it.id}" viewBox="0 0 ${f.w} ${f.h}" style="left:${it.wall[0]}%;top:${it.wall[1]}%;width:${w}cqw;margin-left:${-w/2}cqw;z-index:5">${f.draw()}</svg>`;
  }
  const p = spot(it, own);
  if (it.svg){
    const f = FURN[it.svg], w = it.pos[2]*M*kOf(it.pos[1]);
    const full = it.id==='bookcase' && own.includes('books');
    return `<svg class="kit furn" data-id="${it.id}" viewBox="0 0 ${f.w} ${f.h}" style="left:${p.x}%;bottom:${p.bottom}%;width:${w}cqw;margin-left:${-w/2}cqw;z-index:${p.z}">${f.draw(full)}</svg>`;
  }
  return `<span class="kit floor" data-id="${it.id}" style="left:${p.x}%;bottom:${p.bottom}%;font-size:${p.size}cqw;z-index:${p.z}">${it.e}</span>`;
}
// things bought before furniture existed get their piece of furniture for free
if (!get('furnv1', false)){
  const own = owned();
  SHOP.forEach(i=>{ if (i.on && own.includes(i.id) && !own.includes(i.on)) own.push(i.on); });
  set('owned', own); set('furnv1', true);
}
// ---------- Ayra comes alive: day & night, tap her or her things ----------
function phase(){ const h = new Date().getHours(); return h >= 20 || h < 7 ? 'night' : h >= 17 ? 'eve' : 'day'; }
const HOME = [50, .7], DOG = {busy:false, run:0, at:HOME};
const BED_SPOT = () => { const b = SHOP.find(i=>i.id==='bed').pos; return [b[0], b[1] + .01]; };
function placeDog(at, pose){
  const el = $('#kdog'); if (!el) return;
  const p = spot({pos:[at[0], at[1], .7]}, []);
  DOG.at = at;
  el.style.left = p.x + '%'; el.style.bottom = (p.bottom + (pose==='sleep' ? .8 : 0)) + '%';
  el.style.fontSize = p.size + 'cqw'; el.style.zIndex = p.z + 2;
  el.className = 'kdog' + (pose ? ' ' + pose : '');
  const z = el.querySelector('.zzz');
  if (pose==='sleep' && !z) el.insertAdjacentHTML('beforeend', '<span class="zzz">💤</span>');
  if (pose!=='sleep' && z) z.remove();
}
const wait = ms => new Promise(r=>setTimeout(r, ms));
async function walkTo(at){
  const el = $('#kdog'), from = DOG.at;
  if (Math.abs(from[0]-at[0]) < 1 && Math.abs(from[1]-at[1]) < .02) return;
  placeDog(at, 'walk' + (at[0] < from[0] ? ' left' : ''));
  await wait(950);
  if (el.isConnected) el.classList.remove('walk', 'left');
}
function hearts(n, emo){
  const el = $('#kdog'), k = $('#kennel'); if (!el || !k) return;
  for (let i=0;i<(n||3);i++){
    const h = document.createElement('span'); h.className = 'kheart'; h.textContent = emo || pick(['💕','❤️','💖']);
    h.style.left = `calc(${el.style.left} + ${(Math.random()*8-4).toFixed(1)}%)`;
    h.style.bottom = `calc(${el.style.bottom} + ${el.style.fontSize})`; h.style.animationDelay = (i*.18)+'s';
    k.appendChild(h); setTimeout(()=>h.remove(), 2000);
  }
}
const near = (id, dx) => { const it = SHOP.find(i=>i.id===id); return [it.pos[0] + (dx||0), Math.max(.2, it.pos[1] - .04)]; };
const isShop = () => document.getElementById('shop').classList.contains('active');
async function act(fn){
  if (DOG.busy) return; DOG.busy = true; const my = ++DOG.run;
  try{ await fn(()=>my===DOG.run && isShop()); } finally { if (my===DOG.run) DOG.busy = false; }
}
async function goHome(alive){
  if (!alive()) return;
  if (phase()==='night' && owned().includes('bed')){ await walkTo(BED_SPOT()); if (alive()) placeDog(BED_SPOT(), 'sleep'); }
  else await walkTo(HOME);
}
document.getElementById('kennel').addEventListener('click', e=>{
  const dog = e.target.closest('#kdog'), kit = e.target.closest('[data-id]');
  if (dog) return act(async alive=>{
    const el = $('#kdog');
    if (el.classList.contains('sleep')){ placeDog(DOG.at, ''); speak('Haf!'); hearts(2); await wait(9000); if (alive()) await goHome(alive); return; }
    const known = tricksKnown();
    if (!known.length){ el.classList.add('wag'); speak(pick(A.BARKS)); hearts(3); await wait(900); el.classList.remove('wag'); return; }
    // a trick she has learnt (the newest one more often)
    const t = Math.random() < .4 ? known[known.length-1] : pick(known);
    const tag = document.createElement('div'); tag.className = 'ktrick'; tag.textContent = t.n;
    tag.style.left = el.style.left; tag.style.bottom = `calc(${el.style.bottom} + ${el.style.fontSize} * 1.15)`;
    $('#kennel').appendChild(tag);
    el.classList.add('trick-' + t.id); speak(t.n); if (t.id==='sing') hearts(4, '🎵'); else hearts(2);
    if (t.id==='five' || t.id==='paw' || t.id==='wave') hearts(1, t.id==='five' ? '✋' : t.id==='wave' ? '👋' : '🐾');
    await wait(1600); el.classList.remove('trick-' + t.id); tag.remove();
  });
  if (e.target.closest('[data-id="visitor"]')){ sfx.tap(); speak(SAY.visit); hearts(3); return; }
  if (!kit) return;
  const id = kit.dataset.id;
  kit.classList.remove('boing'); void kit.getBoundingClientRect(); kit.classList.add('boing'); sfx.tap();
  if (id==='ball') return act(async alive=>{
    await walkTo(near('ball', -6)); if (!alive()) return;
    speak(SAY.ball); hearts(2, '🎾'); await wait(1300); await goHome(alive);
  });
  if (id==='bowl' || id==='meat') return act(async alive=>{
    await walkTo(near(id, 5)); if (!alive()) return;
    $('#kdog').classList.add('eat'); speak(SAY.yum); hearts(3, '😋'); await wait(1800);
    if (!alive()) return; $('#kdog').classList.remove('eat'); await goHome(alive);
  });
  if (id==='teddy') return act(async alive=>{
    await walkTo(near('teddy', 7)); if (!alive()) return;
    speak(SAY.teddy); hearts(4); await wait(1500); await goHome(alive);
  });
  if (id==='bed') return act(async alive=>{
    await walkTo(BED_SPOT()); if (!alive()) return;
    placeDog(BED_SPOT(), 'sleep'); speak(SAY.bed); await wait(4500);
    if (!alive() || phase()==='night') return;
    placeDog(BED_SPOT(), ''); await wait(300); await goHome(alive);
  });
});
// earned badges stand on a little shelf on the wall
function trophyShelf(){
  const got = get('badges', {}), list = BADGES.filter(b=>got[b.id]);
  if (!list.length) return '';
  return `<div class="trophies">${list.map(b=>`<span title="${b.n}">${TIERS[got[b.id]-1]}</span>`).join('')}</div>`;
}
function levelTag(){
  const lv = level(), into = A.S.total % STARS_PER_LEVEL;
  return `<div class="klevel">🐶 Úroveň ${lv} · triky ${Math.min(lv, TRICKS.length)}/${TRICKS.length}<i><b style="width:${into*100/STARS_PER_LEVEL}%"></b></i></div>`;
}
function renderKennel(){
  const w = wear(), own = owned();
  const wall = (SHOP.find(i=>i.id===w.wall)||{}).v || '#efe3cf';
  const floor = (SHOP.find(i=>i.id===w.floor)||{}).v || 'plain';
  const win = (SHOP.find(i=>i.id===w.window)||{}).v;
  const items = SHOP.filter(i=>(i.slot==='room' || i.slot==='furn') && own.includes(i.id) && (!i.winter || isWinter()));
  const ph = phase(), sleeping = ph==='night' && own.includes('bed');
  const sofa = SHOP.find(i=>i.id==='sofa');
  $('#kennel').style.setProperty('--wall', wall);
  $('#kennel').className = 'kennel floor-'+floor + (w.light ? ' lit' : '') + ' ' + ph + (own.includes('w_snow') && isWinter() && win ? ' snowy' : '');
  $('#kennel').innerHTML = `
    <div class="roof"></div><div class="wallz"></div><div class="floorz"></div>
    ${win ? `<div class="win"><span>${ph==='night' ? '🌙' : win}</span></div>` : ''}
    ${ph==='night' && own.includes('sofa') ? `<div class="lampglow" style="left:${sofa.pos[0]+8}%"></div>` : ''}
    ${trophyShelf()}
    ${levelTag()}
    ${(()=>{ const v = visitor(); if (!v || ph==='night') return ''; const p = spot({pos:[73,.82,.42]}, []);
      return `<span class="kit floor visitor" data-id="visitor" style="left:${p.x}%;bottom:${p.bottom}%;font-size:${p.size}cqw;z-index:${p.z}">${v}</span>`; })()}
    ${w.light ? '<div class="garland">✨ ✨ ✨ ✨ ✨ ✨ ✨</div>' : ''}
    ${items.map(i=>kitHTML(i, own)).join('')}
    <div class="kdog" id="kdog"><div class="kshadow"></div><div class="owl kayra full"></div></div>
    ${!items.length && !win && !w.wall ? '<div class="kempty">Ayřina bouda je zatím prázdná. Kup jí něco hezkého! 🛍️</div>' : ''}`;
  DOG.busy = false; DOG.run++;
  placeDog(sleeping ? BED_SPOT() : HOME, sleeping ? 'sleep' : '');
  decorate();
}
function renderShop(){
  $('#shopWallet').textContent = '⭐ ' + wallet();
  document.querySelectorAll('#shopTabs button').forEach(b=>b.classList.toggle('on', b.dataset.tab===shopTab));
  $('#shopItems').innerHTML = SHOP.filter(inTab).sort((a,b)=>(!!a.from - !!b.from) || a.p-b.p).map(itemHTML).join('');
  renderKennel();
}
document.getElementById('shopTabs').addEventListener('click', e=>{
  const b = e.target.closest('[data-tab]'); if (!b) return; sfx.tap(); shopTab = b.dataset.tab; renderShop();
});
document.getElementById('shop').addEventListener('click', e=>{
  const b = e.target.closest('[data-it]'); if (!b) return;
  const it = SHOP.find(i=>i.id===b.dataset.it), own = owned();
  if (!own.includes(it.id)){
    if (it.from){ sfx.bad(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      speak(it.from==='advent' ? SAY.lockAdvent : SAY.lockAlbum); return; }
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
    <small>${claimed ? 'Tento týden už máš 5 tlapek. Skvělé!' : 'Za 5 dní s tlapkou v týdnu zatočíš kolem štěstí.'}</small>
    <div class="wheelbox"><div class="wpin">▼</div>${wheelSVG()}</div>
    <button class="giftbtn" id="spinBtn"></button><div class="giftres" id="wheelRes"></div>`;
  $('#wheel').style.transform = `rotate(${wheelTurn}deg)`; renderWheelBtn();
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
  if (add >= 3) set('perfect', get('perfect', 0) + 1);
  // paw for today; 5 paws in a week = a spin of the lucky wheel
  const today = dayNo(), paws = get('paws', []);
  if (!paws.includes(today)){ paws.push(today); set('paws', paws); out.push('🐾 Dnešní tlapka je v kalendáři!'); }
  updateStreak();
  const wk = weekOf(today); let inWeek = 0; for (let d=0; d<7; d++) if (paws.includes(wk*7-3+d)) inWeek++;
  const wb = get('weekBonus', []);
  if (inWeek >= 5 && !wb.includes(wk)){ wb.push(wk); set('weekBonus', wb); set('spins', get('spins',0) + 1);
    out.push('🎡 5 tlapek za týden: zatoč kolem štěstí v Tlapkách!'); speak(SAY.spin, {queue:true}); }
  // surprise box every BOX_EVERY stars (all-time)
  let boxAt = get('boxAt', A.S.total + BOX_EVERY), boxes = 0;
  while (A.S.total >= boxAt){ boxes++; boxAt += BOX_EVERY; }
  set('boxAt', boxAt);
  if (boxes){ set('boxes', get('boxes',0) + boxes); speak(SAY.gift, {queue:true}); }
  out.push(...checkLevel(), ...checkBadges());
  if (adventOn() && advDay() && !get('advent', []).includes(advDay())) out.push('🎄 Dnešní okénko v adventním kalendáři čeká!');
  if (get('boxes',0) > 0) out.push(`<button class="giftbtn" id="openGift">🎁 Otevři dárek${get('boxes',0)>1?' ('+get('boxes',0)+')':''}</button>`);
  out.push(`<span class="small">Teď máš ⭐ ${wallet()} na nákupy v obchůdku</span>`);
  renderHub();
  return out.map(x=>`<div class="rewline">${x}</div>`).join('');
}

// ---------- album + badges screen ----------
let swapMode = false;
function renderTreasure(){
  const al = album(), n = get('boxes', 0), sp = spare(al), have = Object.keys(al).length;
  $('#trGifts').innerHTML = (n > 0
    ? `<div class="rewline"><button class="giftbtn" id="openGift">🎁 Otevři dárek${n>1?' ('+n+')':''}</button></div>`
    : `<div class="trnext">🎁 Další dárek za <b>${Math.max(1, get('boxAt', A.S.total + BOX_EVERY) - A.S.total)} ⭐</b></div>`)
    + `<div class="swaprow"><span>🔁 Obrázky navíc: <b>${sp}</b></span>
       <button class="swapbtn ${swapMode?'on':''}" id="swapBtn" ${sp < 3 && !swapMode ? 'disabled' : ''}>${swapMode ? 'Zrušit výměnu' : 'Vyměnit 3 za 1'}</button></div>
       ${swapMode ? '<div class="swaphint">Ťukni na otazník, který chceš. Zlatý stojí 6 obrázků navíc.</div>' : ''}`;
  $('#trCount').textContent = `Album: ${have} z ${ALBUM_TOTAL} obrázků · hotové sbírky ${get('albumDone',[]).length} z ${COLL.length}`;
  $('#trAll').innerHTML = COLL.map(c=>{
    const h = albumHave(al, c), done = h === 10, sp2 = SHOP.find(i=>i.from==='album:'+c.id);
    return `<div class="coll ${done?'done':''}"><div class="ch"><span class="ce">${c.e}</span><b>${c.n}</b>
      <span class="cp"><i style="width:${h*10}%"></i></span><small>${h}/10</small></div>
      <div class="treasures">${c.it.map((x,i)=>{ const k = c.id+':'+i, cnt = al[k]||0, t = RARITY(i);
        return `<span class="tr ${t==='common'?'':t} ${cnt?'':'lock'} ${swapMode&&!cnt?'pickable':''}" data-pic="${k}">${cnt ? x : '?'}${cnt>1?`<i>${cnt}</i>`:''}</span>`; }).join('')}</div>
      <div class="creward">${done ? '✅' : '🎁'} Odměna: ${sp2 ? sp2.e+' '+sp2.n : ''} + 10 ⭐</div></div>`;
  }).join('');
  const got = get('badges', {});
  $('#trBadges').innerHTML = BADGES.map(b=>{
    const lv = got[b.id]||0, v = badgeValue(b.id), next = b.at[lv];
    return `<div class="badge lv${lv}"><span class="be">${b.e}</span><span class="bt">${lv ? TIERS[lv-1] : '⚪'}</span>
      <b>${b.n}</b><small>${next ? `${Math.min(v,next)}/${next} ${b.t}` : `${v} ${b.t} – hotovo!`}</small></div>`;
  }).join('');
}
document.addEventListener('click', e=>{
  if (e.target.closest('#swapBtn')){ sfx.tap(); swapMode = !swapMode; if (swapMode) speak(SAY.swap); renderTreasure(); return; }
  const t = e.target.closest('[data-pic]'); if (!t || !swapMode) return;
  const k = t.dataset.pic, al = album(); if (al[k]) return;
  const cost = RARITY(+k.split(':')[1]) === 'gold' ? 6 : 3;
  if (spare(al) < cost){ sfx.bad(); speak(SAY.poor); return; }
  let left = cost;                                    // take the spares from the pictures she has most of
  Object.keys(al).sort((a,b)=>al[b]-al[a]).forEach(x=>{ while (left && al[x] > 1){ al[x]--; left--; } });
  set('album', al); swapMode = false;
  const txt = addPicture(k); sfx.win(); confetti(50); speak(SAY.yay);
  renderTreasure(); const d = document.createElement('div'); d.className = 'giftres'; d.innerHTML = txt; $('#trGifts').prepend(d);
});
function openGift(){
  let n = get('boxes',0); if (n<=0) return; set('boxes', n-1);
  let txt;
  if (Math.random() < 0.3){
    const s = 2 + Math.floor(Math.random()*3); set('wallet', wallet()+s); txt = `⭐ ${s} hvězdičky navíc!`;
  } else txt = addPicture(drawPicture()) + ' – najdeš ho v albu 🎁';
  sfx.win(); confetti(60); speak(/ZLATÝ/.test(txt) ? SAY.gold : SAY.yay);
  const b = $('#openGift');
  if (b){ const d = document.createElement('div'); d.className='giftres'; d.innerHTML = txt; b.parentNode.insertBefore(d, b);
    const left = get('boxes',0); if (left>0) b.textContent = '🎁 Otevři další dárek ('+left+')'; else b.remove(); }
  renderHub();
  if (document.getElementById('treasure').classList.contains('active')){       // keep the result visible
    const keep = $('#trGifts').querySelectorAll('.giftres'); renderTreasure();
    keep.forEach(d=>$('#trGifts').prepend(d));
  }
}
document.addEventListener('click', e=>{ if (e.target.closest('#spinBtn')) spinWheel(); });
document.addEventListener('click', e=>{ const w = e.target.closest('[data-adv]'); if (w){ sfx.tap(); openAdvent(+w.dataset.adv); } });
document.addEventListener('click', e=>{ if (e.target.closest('#openGift')){ sfx.tap(); openGift(); } });

A.rewards = {afterRound, renderHub, decorate, PLACES};
A.phraseSources.push(()=>[...Object.values(SAY).flat(), ...SHOP.filter(i=>i.say).map(i=>i.say)]);
renderHub(); decorate();
mo.observe(document.body,{childList:true,subtree:true});
})();
