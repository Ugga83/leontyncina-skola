/* Ozdoby, které Ayra nosí: nakreslené ve stylu Ayry (tmavý obrys, plné barvy) a vkreslené přímo do jejího obrázku
   (ayra.js je pak ohýbá spolu s hlavou a tělem). Souřadnice: px původního obrázku ayra_full.png (315 × 315),
   počátek = kotva slotu: head = temeno mezi ušima, eyes = střed mezi očima, neck = střed krku. */
(function(){
'use strict';
const O = '#2d2a32', SW = 'stroke="#2d2a32" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
const T = 'stroke-linejoin="round" stroke-linecap="round"';
const petals = (n, r, rx, ry, fill, extra) => Array.from({length:n}, (_, i)=>
  `<ellipse cx="0" cy="${-r}" rx="${rx}" ry="${ry}" fill="${fill}" ${SW} ${extra||''} transform="rotate(${i * 360 / n})"/>`).join('');
const star = (cx, cy, R, r, fill) => { let d = ''; for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, q = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + q*Math.cos(a)).toFixed(1) + ' ' + (cy + q*Math.sin(a)).toFixed(1); }
  return `<path d="${d}Z" fill="${fill}" ${SW} stroke-width="2.4"/>`; };
// the neck curve: from the left of the neck, down under the chin, to the right
const NC = t => [(1-t)*(1-t)*-78 + t*t*78, (1-t)*(1-t)*-10 + 2*(1-t)*t*26 + t*t*-10];
const along = (n, a, b) => Array.from({length:n}, (_, i)=>NC(a + (b - a) * i / (n - 1)));
const scarf = (c1, c2, c3) => `
  <path d="M-82 -16 Q0 24 82 -16 L80 6 Q0 44 -80 6 Z" fill="${c1}" ${SW}/>
  <path d="M-76 -6 Q0 32 76 -6" fill="none" stroke="${c2}" stroke-width="3" ${T}/>
  <path d="M-74 0 Q0 38 74 0" fill="none" stroke="${c2}" stroke-width="2" stroke-dasharray="4 4" ${T}/>
  <path d="M16 18 L38 14 L44 62 L24 66 Z" fill="${c3}" ${SW}/>
  <path d="M19 32 L40 28 M21 46 L42 42" stroke="${c2}" stroke-width="3" ${T}/>
  <path d="M26 66 v8 M31 65 v8 M36 64 v8 M41 63 v8" stroke="${O}" stroke-width="2.4" ${T}/>
  <ellipse cx="27" cy="16" rx="12" ry="9" fill="${c3}" ${SW}/>`;
const crown = (s, gold, dark) => `<g transform="scale(${s})">
  <path d="M-46 8 L-52 -34 L-26 -14 L0 -46 L26 -14 L52 -34 L46 8 Z" fill="${gold}" ${SW}/>
  <path d="M-46 8 L46 8 L45 -2 L-45 -2 Z" fill="${dark}" ${SW} stroke-width="2.4"/>
  <circle cx="0" cy="-46" r="6" fill="#ff5d73" ${SW} stroke-width="2.4"/><circle cx="-52" cy="-34" r="5" fill="#5ab8ff" ${SW} stroke-width="2.4"/><circle cx="52" cy="-34" r="5" fill="#5ab8ff" ${SW} stroke-width="2.4"/>
  <circle cx="-24" cy="3" r="3.6" fill="#ff5d73"/><circle cx="0" cy="3" r="3.6" fill="#5fd38a"/><circle cx="24" cy="3" r="3.6" fill="#ff5d73"/>
  <path d="M-30 -10 L-36 -24" stroke="#fff" stroke-width="3" opacity=".7" ${T}/></g>`;

const W = {
  // ---------- na hlavu ----------
  bow:{s:1.2, slot:'head', svg:`<g transform="translate(44 12) rotate(-14)">
    <path d="M-2 4 L-14 30 L-6 26 L-1 33 L4 6 Z" fill="#e8435b" ${SW} stroke-width="2.4"/>
    <path d="M2 4 L12 29 L5 27 L1 33" fill="#e8435b" ${SW} stroke-width="2.4"/>
    <path d="M0 0 C-10 -18 -36 -16 -34 0 C-32 16 -10 16 0 0 Z" fill="#ff5d73" ${SW}/>
    <path d="M0 0 C10 -18 36 -16 34 0 C32 16 10 16 0 0 Z" fill="#ff5d73" ${SW}/>
    <path d="M-26 -6 Q-20 -11 -13 -8 M26 -6 Q20 -11 13 -8" stroke="#fff" stroke-width="2.4" opacity=".75" fill="none" ${T}/>
    <ellipse cx="0" cy="0" rx="7" ry="8" fill="#e8435b" ${SW} stroke-width="2.6"/></g>`},
  flower:{s:1.3, slot:'head', svg:`<g transform="translate(46 12)">
    <ellipse cx="-14" cy="10" rx="9" ry="4.5" fill="#6cc46b" ${SW} stroke-width="2.2" transform="rotate(30 -14 10)"/>
    ${petals(5, 9, 7.5, 9.5, '#ff9ec4')}<circle r="5" fill="#ffd447" ${SW} stroke-width="2.2"/></g>`},
  daisy:{s:1.3, slot:'head', svg:`<g transform="translate(46 12)">${petals(11, 11, 3.6, 8.5, '#ffffff', 'stroke-width="2"')}<circle r="7" fill="#ffc93c" ${SW} stroke-width="2.4"/></g>`},
  cherry:{s:1.3, slot:'head', svg:`<g transform="translate(44 6)">
    <path d="M2 -8 Q-6 4 -8 16 M2 -8 Q8 4 10 18" fill="none" stroke="#4d8a3a" stroke-width="2.6" ${T}/>
    <path d="M2 -8 Q14 -16 22 -8 Q12 -4 2 -8 Z" fill="#6cc46b" ${SW} stroke-width="2.2"/>
    <circle cx="-8" cy="20" r="8" fill="#e8435b" ${SW}/><circle cx="11" cy="22" r="8" fill="#e8435b" ${SW}/>
    <circle cx="-10.5" cy="17" r="2.2" fill="#fff" opacity=".8"/><circle cx="8.5" cy="19" r="2.2" fill="#fff" opacity=".8"/></g>`},
  fly:{s:1.25, slot:'head', svg:`<g transform="translate(46 4) rotate(-18)">
    <path d="M0 0 C-8 -22 -32 -22 -30 -4 C-28 6 -10 6 0 0 Z" fill="#6fb8ff" ${SW}/><path d="M0 0 C8 -22 32 -22 30 -4 C28 6 10 6 0 0 Z" fill="#6fb8ff" ${SW}/>
    <path d="M0 2 C-6 18 -24 18 -22 6 C-20 0 -8 0 0 2 Z" fill="#ffb347" ${SW}/><path d="M0 2 C6 18 24 18 22 6 C20 0 8 0 0 2 Z" fill="#ffb347" ${SW}/>
    <circle cx="-18" cy="-10" r="3" fill="#fff" opacity=".8"/><circle cx="18" cy="-10" r="3" fill="#fff" opacity=".8"/>
    <ellipse cx="0" cy="1" rx="3.2" ry="11" fill="${O}"/><path d="M-1 -9 Q-5 -18 -9 -20 M1 -9 Q5 -18 9 -20" fill="none" stroke="${O}" stroke-width="2" ${T}/></g>`},
  rose:{s:1.3, slot:'head', svg:`<g transform="translate(46 12)">
    <path d="M-8 8 Q-24 6 -26 16 Q-14 20 -8 8 Z" fill="#6cc46b" ${SW} stroke-width="2.2"/><path d="M8 8 Q22 4 26 14 Q14 18 8 8 Z" fill="#6cc46b" ${SW} stroke-width="2.2"/>
    <circle r="12" fill="#e8435b" ${SW}/><path d="M-6 -2 Q0 -9 6 -2 Q4 6 -3 4 Q-6 1 -2 -2 Q3 -3 2 1" fill="none" stroke="#a82a3c" stroke-width="2.2" ${T}/>
    <path d="M-9 -6 Q-5 -11 0 -11" stroke="#fff" stroke-width="2" opacity=".7" fill="none" ${T}/></g>`},
  sunfl:{s:1.3, slot:'head', svg:`<g transform="translate(46 12)">${petals(12, 13, 4.5, 8, '#ffcc2e', 'stroke-width="2"')}<circle r="9" fill="#8a5a2b" ${SW} stroke-width="2.4"/>
    <circle cx="-3" cy="-2" r="1.3" fill="#5c3a19"/><circle cx="3" cy="2" r="1.3" fill="#5c3a19"/><circle cx="2" cy="-4" r="1.3" fill="#5c3a19"/><circle cx="-3" cy="4" r="1.3" fill="#5c3a19"/></g>`},
  cap:{s:1.4, slot:'head', svg:`<g transform="translate(-2 4) rotate(-6)">
    <path d="M26 4 C52 -2 82 4 88 14 C66 18 42 16 22 12 Z" fill="#2f74b5" ${SW}/>
    <path d="M-50 10 C-52 -34 50 -36 48 8 Z" fill="#3f8fd2" ${SW}/>
    <path d="M0 -26 C-6 -12 -6 0 -2 8 M-26 -20 C-30 -6 -28 4 -24 9" fill="none" stroke="#2f74b5" stroke-width="2.4" ${T}/>
    <path d="M-50 10 C-20 16 20 16 48 8" fill="none" ${SW}/><circle cx="0" cy="-27" r="4.5" fill="#2f74b5" ${SW} stroke-width="2.2"/>
    <path d="M-36 -16 Q-30 -26 -18 -28" stroke="#fff" stroke-width="3" opacity=".55" fill="none" ${T}/>
    ${star(20, -6, 9, 4, '#ffd447')}</g>`},
  hat:{slot:'head', svg:`<g transform="translate(0 6) rotate(-5)">
    <ellipse cx="0" cy="6" rx="90" ry="18" fill="#f4d58d" ${SW}/>
    <path d="M-80 8 Q0 26 80 8" fill="none" stroke="#e0b866" stroke-width="2.4" ${T}/>
    <path d="M-44 8 C-44 -40 44 -40 44 8 Z" fill="#f7df9e" ${SW}/>
    <path d="M-44 0 C-20 6 20 6 44 0 L44 -10 C20 -4 -20 -4 -44 -10 Z" fill="#ff7aa2" ${SW} stroke-width="2.6"/>
    <path d="M-26 -22 C-14 -28 10 -30 24 -24 M-34 -10 C-14 -16 14 -16 36 -12" fill="none" stroke="#e0b866" stroke-width="2" ${T}/>
    <g transform="translate(38 -6)">${petals(5, 6, 5, 6.5, '#ffffff', 'stroke-width="2"')}<circle r="3.6" fill="#ffd447" ${SW} stroke-width="2"/></g></g>`},
  tophat:{s:1.15, slot:'head', svg:`<g transform="translate(6 2) rotate(-9)">
    <ellipse cx="0" cy="4" rx="46" ry="10" fill="#2b2b33" ${SW}/>
    <path d="M-30 4 L-32 -58 Q0 -64 32 -58 L30 4 Q0 10 -30 4 Z" fill="#33333d" ${SW}/>
    <path d="M-31 -14 Q0 -8 31 -14 L31 -4 Q0 2 -31 -4 Z" fill="#e2453c" ${SW} stroke-width="2.6"/>
    <path d="M-22 -50 L-22 -22" stroke="#fff" stroke-width="4" opacity=".25" ${T}/></g>`},
  grad:{s:1.3, slot:'head', svg:`<g transform="translate(0 4) rotate(-6)">
    <path d="M-36 -6 L-36 10 C-20 20 20 20 36 10 L36 -6 Z" fill="#3a3a44" ${SW}/>
    <path d="M-66 -14 L0 -38 L66 -14 L0 10 Z" fill="#2b2b33" ${SW}/>
    <path d="M0 -14 L48 -4 L48 26" fill="none" stroke="#ffcc2e" stroke-width="3" ${T}/>
    <path d="M42 24 L54 24 L56 40 L40 40 Z" fill="#ffcc2e" ${SW} stroke-width="2.2"/><circle cx="0" cy="-14" r="5" fill="#ffcc2e" ${SW} stroke-width="2.2"/>
    <path d="M-40 -18 L-8 -30" stroke="#fff" stroke-width="3" opacity=".3" ${T}/></g>`},
  crown:{s:1.3, slot:'head', svg:`<g transform="translate(0 4) rotate(-5)">${crown(.9, '#ffcc33', '#ffdb5c')}</g>`},
  en_crown:{s:1.2, slot:'head', svg:`<g transform="translate(0 2) rotate(-4)">${crown(1.08, '#ffc21a', '#ffd84d')}${star(0, -18, 9, 4, '#fff6b3')}</g>`},
  cl_tales:{s:1.3, slot:'head', svg:`<g transform="translate(0 6)">
    <path d="M-38 6 L-34 -12 L-18 -2 L0 -28 L18 -2 L34 -12 L38 6 Q0 14 -38 6 Z" fill="#ffd447" ${SW}/>
    <circle cx="0" cy="-12" r="6" fill="#ff6fa8" ${SW} stroke-width="2.2"/><circle cx="-24" cy="0" r="4" fill="#9a7bff" ${SW} stroke-width="2"/><circle cx="24" cy="0" r="4" fill="#9a7bff" ${SW} stroke-width="2"/>
    <circle cx="0" cy="-28" r="3.4" fill="#5ab8ff" ${SW} stroke-width="2"/></g>`},
  cl_space:{s:1.05, slot:'head', svg:`<g transform="translate(0 10)">
    <path d="M-84 22 C-62 -26 62 -26 84 22" fill="none" stroke="${O}" stroke-width="12" ${T}/><path d="M-84 22 C-62 -26 62 -26 84 22" fill="none" stroke="#4a5bd4" stroke-width="7" ${T}/>
    <path d="M-24 -12 Q-30 -30 -36 -44 M24 -12 Q30 -30 36 -44" fill="none" stroke="${O}" stroke-width="3" ${T}/>
    ${star(-37, -48, 11, 5, '#ffd447')}${star(37, -48, 11, 5, '#ffd447')}
    <circle cx="-50" cy="-2" r="2.4" fill="#fff"/><circle cx="54" cy="0" r="2" fill="#fff"/></g>`},
  w_santa:{s:1.15, slot:'head', svg:`<g transform="translate(-4 6) rotate(-10)">
    <path d="M-56 8 C-50 -40 6 -64 50 -44 C70 -34 82 -8 80 16 L62 16 C60 -6 46 -22 20 -20 C-12 -16 -32 -6 -40 8 Z" fill="#e2453c" ${SW}/>
    <path d="M-30 -24 C-10 -40 20 -44 40 -36" stroke="#fff" stroke-width="3" opacity=".35" fill="none" ${T}/>
    <rect x="-64" y="0" width="128" height="20" rx="10" fill="#ffffff" ${SW}/>
    <circle cx="80" cy="20" r="12" fill="#ffffff" ${SW}/></g>`},
  // ---------- na oči ----------
  glass:{slot:'eyes', svg:`
    <path d="M-45 -4 L-72 -10 M45 -4 L72 -10" stroke="${O}" stroke-width="3.4" ${T}/>
    <circle cx="-29.5" cy="0" r="16" fill="#cfe9ff" fill-opacity=".28" stroke="${O}" stroke-width="3.6"/>
    <circle cx="29.5" cy="0" r="16" fill="#cfe9ff" fill-opacity=".28" stroke="${O}" stroke-width="3.6"/>
    <path d="M-13.5 -2 Q0 -9 13.5 -2" fill="none" stroke="${O}" stroke-width="3.4" ${T}/>
    <path d="M-38 -7 Q-34 -11 -28 -11 M21 -7 Q25 -11 31 -11" stroke="#fff" stroke-width="2.4" opacity=".8" fill="none" ${T}/>`},
  sun:{slot:'eyes', svg:`
    <path d="M-47 -6 L-74 -12 M47 -6 L74 -12" stroke="${O}" stroke-width="3.4" ${T}/>
    <path d="M-50 -12 Q-50 -16 -44 -16 L-14 -16 Q-9 -16 -10 -10 L-12 4 Q-15 16 -30 16 Q-46 16 -49 4 Z" fill="#1f2430" ${SW}/>
    <path d="M50 -12 Q50 -16 44 -16 L14 -16 Q9 -16 10 -10 L12 4 Q15 16 30 16 Q46 16 49 4 Z" fill="#1f2430" ${SW}/>
    <path d="M-10 -9 Q0 -14 10 -9" fill="none" stroke="${O}" stroke-width="3.4" ${T}/>
    <path d="M-42 -9 L-30 -9 M18 -9 L30 -9" stroke="#fff" stroke-width="3" opacity=".55" ${T}/><path d="M-40 -2 L-34 -2 M20 -2 L26 -2" stroke="#fff" stroke-width="2.2" opacity=".35" ${T}/>`},
  goggle:{slot:'eyes', svg:`<defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset=".5" stop-color="#ff6fa8"/><stop offset="1" stop-color="#8a7bff"/></linearGradient></defs>
    <path d="M-100 -8 C-60 -14 60 -14 100 -8 L100 6 C60 0 -60 0 -100 6 Z" fill="#3f8fd2" ${SW}/>
    <rect x="-52" y="-20" width="104" height="40" rx="18" fill="#ffffff" ${SW}/>
    <rect x="-46" y="-15" width="92" height="30" rx="14" fill="url(#gg)" ${SW} stroke-width="2.4"/>
    <path d="M-36 -8 Q-20 -12 -6 -10" stroke="#fff" stroke-width="3.4" opacity=".75" fill="none" ${T}/>`},
  cl_sea:{slot:'eyes', svg:`
    <path d="M52 -2 C66 -6 66 -40 60 -64" fill="none" stroke="${O}" stroke-width="11" ${T}/><path d="M52 -2 C66 -6 66 -40 60 -64" fill="none" stroke="#ff9f1c" stroke-width="6" ${T}/>
    <rect x="-54" y="-22" width="108" height="46" rx="20" fill="#2b2b33" ${SW}/>
    <rect x="-46" y="-15" width="92" height="32" rx="14" fill="#8fdcff" fill-opacity=".55" ${SW} stroke-width="2.4"/>
    <path d="M-36 -8 Q-22 -12 -8 -10" stroke="#fff" stroke-width="3.4" opacity=".8" fill="none" ${T}/>`},
  // ---------- na krk ----------
  scarf:{slot:'neck', svg:scarf('#e2574c', '#f7a197', '#d94a40')},
  w_scarf:{slot:'neck', svg:scarf('#2f9e5b', '#ffffff', '#278a4e')},
  bell:{slot:'neck', svg:`
    <path d="M-80 -12 Q0 30 80 -12" fill="none" stroke="${O}" stroke-width="12" ${T}/><path d="M-80 -12 Q0 30 80 -12" fill="none" stroke="#e2453c" stroke-width="7.5" ${T}/>
    <path d="M-74 -11 Q0 25 74 -11" fill="none" stroke="#ff8a80" stroke-width="2" ${T}/>
    <path d="M-12 30 C-12 12 12 12 12 30 Z" fill="#ffcc33" ${SW}/><rect x="-14" y="28" width="28" height="6" rx="3" fill="#e0a800" ${SW} stroke-width="2.4"/>
    <circle cx="0" cy="37" r="3.6" fill="#c98a00" ${SW} stroke-width="2"/><path d="M-6 20 Q-4 16 0 16" stroke="#fff" stroke-width="2.4" opacity=".8" fill="none" ${T}/>`},
  beads:{slot:'neck', svg: along(15, .02, .98).map(([x, y], i)=>`<circle cx="${x.toFixed(1)}" cy="${(y + 2).toFixed(1)}" r="6" fill="${['#e2574c','#ffcc33','#3f8fd2','#5fd38a','#9a7bff'][i % 5]}" ${SW} stroke-width="2.2"/><circle cx="${(x - 1.8).toFixed(1)}" cy="${(y).toFixed(1)}" r="1.6" fill="#fff" opacity=".85"/>`).join('')},
  hibis:{slot:'neck', svg: along(7, .03, .97).map(([x, y], i)=>`<g transform="translate(${x.toFixed(1)} ${(y + 3).toFixed(1)}) rotate(${i * 23})">${petals(5, 6.5, 6, 7.5, ['#ff6f91','#ffcc33','#ff9f1c'][i % 3], 'stroke-width="2"')}<circle r="3" fill="#fff3b0" ${SW} stroke-width="1.6"/></g>`).join('')},
  ribbon:{s:1.3, slot:'neck', svg:`<g transform="translate(36 34)">
    <path d="M0 -14 C-14 -14 -10 6 6 22 L12 16 C-4 2 -6 -6 0 -6 C6 -6 4 2 -12 16 L-6 22 C10 6 14 -14 0 -14 Z" fill="#ffcc33" ${SW}/></g>`},
  medal:{slot:'neck', svg:`
    <path d="M-28 -6 L-6 36 L4 36 L-14 -6 Z" fill="#3f8fd2" ${SW}/><path d="M28 -6 L6 36 L-4 36 L14 -6 Z" fill="#e2453c" ${SW}/>
    <circle cx="0" cy="44" r="13" fill="#ffcc33" ${SW}/><circle cx="0" cy="44" r="8" fill="none" stroke="#e0a800" stroke-width="2"/>${star(0, 44, 6, 2.6, '#fff3b0')}`},
  en_medal:{slot:'neck', svg:`
    <path d="M-34 -8 L-8 40 L4 40 L-18 -8 Z" fill="#e2453c" ${SW}/><path d="M34 -8 L8 40 L-4 40 L18 -8 Z" fill="#3f8fd2" ${SW}/>
    <circle cx="0" cy="50" r="17" fill="#ffc21a" ${SW}/><circle cx="0" cy="50" r="11" fill="none" stroke="#e09a00" stroke-width="2.4"/>${star(0, 50, 9, 4, '#fff3b0')}`},
  gem:{slot:'neck', svg:`
    <path d="M-78 -12 Q0 30 78 -12" fill="none" stroke="#c3c9d6" stroke-width="3" stroke-dasharray="3.5 2.5" ${T}/>
    <path d="M-11 22 L0 14 L11 22 L0 42 Z" fill="#8fe3ff" ${SW}/><path d="M-11 22 L11 22 M0 14 L-4 22 L0 42 M0 14 L4 22" stroke="#4fb6db" stroke-width="1.6" fill="none" ${T}/>
    <path d="M-5 19 L-2 17" stroke="#fff" stroke-width="2.4" ${T}/>`},
};
// an attribute given twice (the common outline + a thinner line) would make the SVG invalid: keep the last one
const dedupe = svg => svg.replace(/<[a-zA-Z][^>]*>/g, tag=>{
  const seen = {}, parts = [];
  tag.replace(/\s([a-zA-Z:-]+)="([^"]*)"/g, (m, k, v)=>{ seen[k] = v; return m; });
  const name = tag.match(/^<([a-zA-Z]+)/)[1], end = /\/>$/.test(tag) ? '/>' : '>';
  for (const k in seen) parts.push(`${k}="${seen[k]}"`);
  return `<${name}${parts.length ? ' ' + parts.join(' ') : ''}${end}`;
});
for (const k in W) W[k].svg = dedupe(W[k].svg);
// where the slots are on each picture (px of that picture) and how big the head is there
window.AYRA_WEAR = {items:W, anchors:{
  full:  {head:[145, 37, 1],    eyes:[142.5, 97, 1],  neck:[145, 172, 1]},
  walk:  {head:[194, 37, .97],  eyes:[193.5, 100, .97], neck:[198, 170, .95]},
  sleep: {head:[112, 37, 1.03], eyes:[112.5, 101, 1.03], neck:[112, 168, 1]},
}};
})();
