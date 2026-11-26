/* Tahy písmen podle české školní normy (specifikace od rodiče): tiskací i psací (vázané) písmo.
   Jednotky: výška malého písmene = 1. Osa y dolů: Y1 = 0 (základní linka), Y2 = -1, Y3 = -2, Y0 = +1.
   Úhly oválů: -90 = 12 h (nahoře), -60 = 2 h, 0 = 3 h, 90 = 6 h, 180 = 9 h; CW = úhel roste, CCW = úhel klesá.
   Výsledek: tahy (pole bodů) v pořadí psaní; diakritika, tečky a přeškrtnutí až po dopsání slova. */
(function(){
'use strict';
const curve = (n, f) => Array.from({length:n + 1}, (_, i)=>f(i / n));
const L = (a, b, n) => curve(n || 10, t=>[a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
const C = (a, b, c, d, n) => curve(n || 16, t=>{ const s = 1 - t; return [s*s*s*a[0] + 3*s*s*t*b[0] + 3*s*t*t*c[0] + t*t*t*d[0], s*s*s*a[1] + 3*s*s*t*b[1] + 3*s*t*t*c[1] + t*t*t*d[1]]; });
const ARC = (cx, cy, rx, ry, a0, a1, n) => curve(n || 40, t=>{ const a = (a0 + (a1 - a0) * t) * Math.PI / 180; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
const P = (cx, cy, rx, ry, a) => [cx + rx * Math.cos(a * Math.PI / 180), cy + ry * Math.sin(a * Math.PI / 180)];
const J = (...parts) => parts.reduce((out, p)=>out.concat(out.length ? p.slice(1) : p), []);
// the bowl at the end of a letter [DOLNÍ]: down to Y1 and up to the right
const cup = x => C([x, -.3], [x, .02], [x + .18, .04], [x + .32, -.3], 14);
const dot = (x, y) => ARC(x, y, .05, .05, -90, -450, 10);
const acute = (x) => L([x + .12, -1.5], [x - .1, -1.28], 8);          // čárka: zprava shora šikmo dolů doleva
const ring = (x) => ARC(x, -1.38, .1, .1, -90, -450, 16);              // kroužek CCW od 12 h

// ---------- PSACÍ malá: s = start ('up' nájezd z Y1, 'oval' od 2 h, 'arch' pod Y2), end 'D' / 'H', w = kde končí ----------
const CUR = {
  i:{s:'up', main:J(C([0,0],[.15,-.3],[.32,-.72],[.38,-1]), L([.38,-1],[.38,-.3]), cup(.38)), w:.7, after:[dot(.42,-1.42)]},
  u:{s:'up', main:J(C([0,0],[.12,-.3],[.26,-.72],[.3,-1]), L([.3,-1],[.3,-.4]), C([.3,-.4],[.3,.06],[.76,.06],[.78,-1]), L([.78,-1],[.78,-.3]), cup(.78)), w:1.1},
  e:{s:'up', main:J(C([0,0],[.25,-.18],[.55,-.5],[.6,-.82]), C([.6,-.82],[.63,-1.1],[.28,-1.1],[.3,-.78]), C([.3,-.78],[.31,-.5],[.3,-.35],[.34,-.3]), cup(.34)), w:.66},
  l:{s:'up', main:J(C([0,0],[.3,-.4],[.76,-1.4],[.66,-1.84]), C([.66,-1.84],[.6,-2.1],[.3,-2.02],[.34,-1.62]), L([.34,-1.62],[.38,-.3]), cup(.38)), w:.7},
  t:{s:'up', main:J(C([0,0],[.2,-.4],[.44,-1.1],[.5,-1.66]), L([.5,-1.66],[.5,-.3]), cup(.5)), w:.82, after:[L([.26,-1],[.78,-1],8)]},
  s:{s:'up', main:J(C([0,0],[.2,-.4],[.34,-.9],[.42,-1.12]), C([.42,-1.12],[.78,-.8],[.82,-.15],[.46,-.06]), C([.46,-.06],[.24,0],[.28,-.26],[.5,-.16]), C([.5,-.16],[.64,-.08],[.8,-.14],[.9,-.3])), w:.9},
  p:{s:'up', main:J(C([0,0],[.15,-.3],[.3,-.75],[.35,-1]), L([.35,-1],[.35,.95],18), L([.35,.95],[.35,-.72],18), C([.35,-.72],[.5,-1.1],[.86,-1.06],[.86,-.62]), L([.86,-.62],[.86,-.3]), cup(.86)), w:1.18},
  m:{s:'arch', main:J(C([.02,-.78],[.12,-1.06],[.42,-1.06],[.42,-.66]), L([.42,-.66],[.42,0]), L([.42,0],[.42,-.72]), C([.42,-.72],[.52,-1.06],[.8,-1.06],[.8,-.66]), L([.8,-.66],[.8,0]), L([.8,0],[.8,-.72]), C([.8,-.72],[.9,-1.06],[1.18,-1.06],[1.18,-.66]), L([1.18,-.66],[1.18,-.3]), cup(1.18)), w:1.5},
  a:{s:'oval', main:J(ARC(.38,-.5,.33,.5,-60,-420,40), L(P(.38,-.5,.33,.5,-60),[.71,-1],4), L([.71,-1],[.71,-.3]), cup(.71)), w:1.03},
  o:{s:'oval', main:J(ARC(.38,-.5,.33,.5,-60,-420,40), C(P(.38,-.5,.33,.5,-60),[.44,-.74],[.66,-.72],[.68,-.86]), C([.68,-.86],[.74,-.96],[.86,-.92],[.96,-.9])), w:.96, end:'H'},
};
// ---------- PSACÍ velká: nap = napojuje (končí mističkou na Y1) ----------
const CAP = {
  A:{main:J(C([0,0],[.25,-.6],[.55,-1.6],[.72,-2]), L([.72,-2],[.72,-.3]), cup(.72)), w:1.04, nap:true, after:[L([.18,-.95],[.95,-.95],8)]},
  E:{main:J(ARC(.56,-1.5,.32,.46,-30,-245,28), C(P(.56,-1.5,.32,.46,-245),[.62,-.98],[.6,-.9],[.46,-.94]), ARC(.56,-.5,.43,.48,-104,-330,34)), w:.95, nap:true},
  I:{main:J(C([0,-1],[.04,-1.72],[.34,-2.06],[.62,-2]), L([.62,-2],[.6,-.3]), C([.6,-.3],[.6,.06],[.24,.06],[.14,-.26])), w:.75, nap:false},
  O:{main:J(ARC(.56,-1,.5,1,-90,-450,60), C([.56,-2],[.78,-1.96],[.72,-1.7],[.52,-1.76])), w:1.12, nap:false},
  U:{main:J(C([0,-1.75],[.04,-2.06],[.3,-2.02],[.3,-1.62]), L([.3,-1.62],[.3,-.42]), C([.3,-.42],[.32,.06],[.96,.06],[.98,-2]), L([.98,-2],[.98,-.3]), cup(.98)), w:1.3, nap:true},
  M:{main:J(C([-.06,-1.78],[0,-2.02],[.1,-2.02],[.12,-1.96]), L([.12,-1.96],[.12,0],18), L([.12,0],[.12,-1.8],18), C([.12,-1.8],[.22,-2.1],[.6,-2.1],[.6,-1.62]), L([.6,-1.62],[.6,0],16), L([.6,0],[.6,-1.8],16), C([.6,-1.8],[.7,-2.1],[1.1,-2.1],[1.1,-1.62]), L([1.1,-1.62],[1.1,-.3],14), cup(1.1)), w:1.42, nap:true},
  L:{main:J(C([.76,-1.7],[.92,-2.06],[.5,-2.16],[.56,-1.74]), C([.56,-1.74],[.56,-1],[.46,-.3],[.3,-.1]), C([.3,-.1],[.14,.08],[0,-.06],[.16,-.13]), C([.16,-.13],[.4,-.22],[.62,.06],[.9,-.05]), C([.9,-.05],[1,-.08],[1.05,-.16],[1.1,-.3])), w:1.1, nap:true},
  S:{main:J(C([0,0],[.3,-.6],[.7,-1.6],[.8,-1.95]), C([.8,-1.95],[.76,-2.16],[.44,-2.06],[.55,-1.7]), C([.55,-1.7],[1.3,-1.3],[1.2,-.04],[.56,-.02]), C([.56,-.02],[.2,0],[.14,-.36],[.46,-.42])), w:1.1, nap:false},
  P:{main:J(L([.15,-2],[.15,0],18), L([.15,0],[.15,-2],18), C([.15,-2],[.82,-2.16],[.98,-1.18],[.15,-1.1])), w:1.0, nap:false},
  T:{main:C([0,-1.74],[.24,-2.12],[.52,-1.84],[1.12,-2.04]), extra:[J(L([.62,-1.96],[.56,-.32],16), C([.56,-.32],[.52,.06],[.12,.06],[.1,-.26]))], w:1.15, nap:false},
};
// ---------- TISKACÍ: každé písmeno zvlášť, tahy v pořadí ----------
const PR = {
  A:{st:[L([.62,-2],[0,0],16), L([.62,-2],[1.24,0],16), L([.31,-1],[.93,-1],10)], w:1.24},
  E:{st:[L([0,-2],[0,0],16), L([0,-2],[.9,-2],10), L([0,-1],[.76,-1],10), L([0,0],[.9,0],10)], w:.9},
  I:{st:[L([0,-2],[0,0],16)], w:0},
  O:{st:[ARC(.62,-1,.62,1,-90,-450,60)], w:1.24},
  U:{st:[J(L([0,-2],[0,-.56],12), ARC(.56,-.56,.56,.56,180,0,24), L([1.12,-.56],[1.12,-2],12))], w:1.12},
  M:{st:[L([0,-2],[0,0],16), J(L([0,-2],[.66,-.3],14), L([.66,-.3],[1.32,-2],14), L([1.32,-2],[1.32,0],16))], w:1.32},
  L:{st:[J(L([0,-2],[0,0],16), L([0,0],[.9,0],10))], w:.9},
  S:{st:[J(ARC(.5,-1.5,.45,.5,-30,-270,28), ARC(.5,-.5,.5,.5,-90,150,30))], w:1},
  P:{st:[L([0,-2],[0,0],16), C([0,-2],[1.1,-2.06],[1.1,-.94],[0,-1])], w:.9},
  T:{st:[L([.6,-2],[.6,0],16), L([0,-2],[1.2,-2],12)], w:1.2},
  a:{st:[ARC(.4,-.5,.4,.5,-60,-420,36), L([.8,-1],[.8,0],10)], w:.8},
  e:{st:[J(L([.04,-.5],[.82,-.5],8), ARC(.43,-.5,.39,.5,0,-300,32))], w:.82},
  i:{st:[L([0,-1],[0,0],10), dot(0,-1.4)], w:0},
  o:{st:[ARC(.45,-.5,.45,.5,-60,-420,36)], w:.9},
  u:{st:[J(L([0,-1],[0,-.38],8), ARC(.38,-.38,.38,.38,180,0,18), L([.76,-.38],[.76,-1],6), L([.76,-1],[.76,0],10))], w:.76},
  m:{st:[J(L([0,-1],[0,0],10), L([0,0],[0,-.68],8), C([0,-.68],[.06,-1.06],[.5,-1.06],[.5,-.62]), L([.5,-.62],[.5,0],8), L([.5,0],[.5,-.68],8), C([.5,-.68],[.56,-1.06],[1,-1.06],[1,-.62]), L([1,-.62],[1,0],8))], w:1},
  l:{st:[L([0,-2],[0,0],16)], w:0},
  s:{st:[J(ARC(.34,-.75,.3,.25,-30,-270,22), ARC(.34,-.25,.35,.25,-90,150,22))], w:.7},
  p:{st:[L([0,-1],[0,1],16), C([0,-.9],[.88,-1.16],[.88,.16],[0,-.06])], w:.66},
  t:{st:[J(L([.3,-1.5],[.3,-.22],12), C([.3,-.22],[.3,.02],[.54,.02],[.64,-.1])), L([0,-1],[.64,-1],8)], w:.64},
};
const ACC = {'á':'a','é':'e','í':'i','ó':'o','ú':'u','ů':'u'};
// does the alphabet know every letter of x?
function knows(x, print){ return [...x].every(ch=>{ const b = ACC[ch] || ch; return print ? PR[b] : (CUR[b] || CAP[b]); }); }
const shift = (pts, dx) => pts.map(p=>[p[0] + dx, p[1]]);

// ---------- one word: strokes in units ----------
function build(x, print){
  if (!knows(x, print)) return null;
  const strokes = [], later = [];
  let cx = 0;
  if (print){
    [...x].forEach((ch, i)=>{
      const b = ACC[ch] || ch, g = PR[b];
      g.st.forEach(s=>strokes.push(shift(s, cx)));
      if (ACC[ch]){ const mid = cx + g.w / 2; strokes.push(ch==='ů' ? ring(mid) : shift(acute(0), mid)); }
      cx += g.w + .35;                                                  // mezera mezi písmeny
    });
    return {strokes, w: cx - .35};
  }
  let cur = null, exit = null, endType = 'D';                           // the stroke being written without lifting
  const flush = () => { if (cur && cur.length > 1) strokes.push(cur); cur = null; };
  [...x].forEach((ch, i)=>{
    const b = ACC[ch] || ch, big = CAP[b], g = big || CUR[b];
    let main = shift(g.main, cx);
    if (cur && exit){
      if (!big && g.s === 'up'){
        // the upstroke starts where the previous letter ended: skip its part below the exit height
        const k = main.findIndex(p=>p[1] <= exit[1]);
        main = [exit].concat(main.slice(Math.max(1, k)));
      } else {
        // to an oval letter (from 2 h back CCW) or an arch: straight from the exit to the start
        main = J(L(exit, main[0], 8), main);
      }
      cur = cur.concat(main.slice(1));
    } else { flush(); cur = main.slice(); }
    (g.extra || []).forEach(e=>later.push(shift(e, cx)));
    if (!(ch==='í')) (g.after || []).forEach(a=>later.push(shift(a, cx)));
    if (ACC[ch]){ const mid = cx + (b==='i' ? .42 : g.w * .45); later.push(ch==='ů' ? ring(mid) : shift(acute(0), mid)); }
    // a capital that does not join: lift the pen, the next letter starts close beside it
    if (big && !big.nap){ exit = null; flush(); cx += g.w + .12; return; }
    exit = cur[cur.length - 1]; endType = g.end || 'D';
    cx += g.w;
  });
  flush();
  // dots, crossbars and accents come after the whole word (the letter i keeps its dot even alone)
  return {strokes: strokes.concat(later), w: cx};
}
window.WSTROKES = {build, knows};
})();
