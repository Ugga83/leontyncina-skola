/* Ayra – animovaná samojedka (SVG z dílů: hlava, uši, oči, tlapky, ocásek). Nahrazuje obrázky ayra*.png.
   Stejné rozměry jako ayra_full.png (hlava uprostřed na 46 %, oči ve 32 %), aby seděly ozdoby z boudy.
   Stavy podle tříd na rodičích: .kdog.walk / .sleep / .wag / .eat (bouda), .owl.hop (ťuknutí), .owl.wave (mávání). */
(function(){
'use strict';
const INK = '#34343f';
// a fluffy outline: an ellipse with small bumps
function fluff(cx, cy, rx, ry, n, amp, rot){
  const r = (rot || 0) * Math.PI / 180, P = (a, k)=>{
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    return [(cx + x * Math.cos(r) - y * Math.sin(r)).toFixed(2), (cy + x * Math.sin(r) + y * Math.cos(r)).toFixed(2)];
  };
  let d = '';
  for (let i = 0; i <= n; i++){
    const a = -Math.PI / 2 + i / n * Math.PI * 2, p = P(a, 1);
    if (!i){ d += `M${p[0]} ${p[1]}`; continue; }
    const m = -Math.PI / 2 + (i - .5) / n * Math.PI * 2, c = P(m, 1 + amp / Math.min(rx, ry));
    d += ` Q${c[0]} ${c[1]} ${p[0]} ${p[1]}`;
  }
  return d + 'Z';
}
const st = `stroke="${INK}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"`;
const leg = (x, cls) => `<g class="a-leg ${cls}">
    <path d="M${x} 77 Q${x - .6} 86 ${x} 91 Q${x} 96.5 ${x + 5} 96.5 Q${x + 10} 96.5 ${x + 10} 91 Q${x + 10.6} 86 ${x + 10} 77" fill="#fff" ${st}/>
    <path d="M${x + 3.4} 95 v-2.4 M${x + 6.6} 95 v-2.4" stroke="${INK}" stroke-width="1" stroke-linecap="round"/></g>`;
const SVG = `<svg class="ayra-svg" viewBox="0 0 100 100" aria-hidden="true">
  <ellipse class="a-shadow" cx="46" cy="97.5" rx="30" ry="2.6" fill="#00000018"/>
  <g class="a-tail"><path d="${fluff(75, 70, 10.5, 16, 10, 2.4, 28)}" fill="#fff" ${st}/>
    <path d="M71 64 q4 4 3 10 M76 60 q3 5 1 11" fill="none" stroke="#d9dfee" stroke-width="1.2" stroke-linecap="round"/></g>
  <g class="a-body">
    <ellipse cx="28" cy="92" rx="9" ry="5" fill="#fff" ${st}/><ellipse cx="64" cy="92" rx="9" ry="5" fill="#fff" ${st}/>
    <path d="${fluff(46, 75, 24, 20, 14, 2.2)}" fill="#fff" ${st}/>
    <path d="M30 80 q2 6 6 9 M62 80 q-2 6 -6 9" fill="none" stroke="#dfe4f1" stroke-width="1.4" stroke-linecap="round"/>
    <path d="${fluff(46, 57.5, 23, 7.5, 14, 2.2)}" fill="#fff" stroke="#c9cfe0" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M37 60 l3 5 l3 -4 l3 6 l3 -6 l3 4 l3 -5" fill="none" stroke="#dfe4f1" stroke-width="1.3" stroke-linejoin="round"/>
  </g>
  <g class="a-legs">${leg(34.5, 'a-legL')}${leg(47.5, 'a-legR')}</g>
  <g class="a-head">
    <g class="a-earL"><path d="M21 25 Q19 8 27 1.5 Q36 5.5 42 14 Z" fill="#fff" ${st}/><path d="M25.5 18.5 Q25 10 28.5 6.5 Q33 9.5 36.5 14 Z" fill="#ffb3c1"/></g>
    <g class="a-earR"><path d="M50 14 Q56 5.5 65 1.5 Q73 8 71 25 Z" fill="#fff" ${st}/><path d="M55.5 14 Q59 9.5 63.5 6.5 Q67 10 66.5 18.5 Z" fill="#ffb3c1"/></g>
    <path d="${fluff(46, 31.5, 27.5, 23.5, 20, 2)}" fill="#fff" ${st}/>
    <path d="M24 40 q3 5 8 7 M68 40 q-3 5 -8 7" fill="none" stroke="#e3e7f3" stroke-width="1.3" stroke-linecap="round"/>
    <ellipse class="a-cheek" cx="30.5" cy="39.5" rx="3.6" ry="2.1" fill="#ffb3bd" opacity=".75"/>
    <ellipse class="a-cheek" cx="61.5" cy="39.5" rx="3.6" ry="2.1" fill="#ffb3bd" opacity=".75"/>
    <g class="a-eyes">
      <g class="a-eye"><circle cx="37" cy="32" r="3.4" fill="#1d1d27"/><circle cx="38.3" cy="30.7" r="1.1" fill="#fff"/></g>
      <g class="a-eye"><circle cx="55" cy="32" r="3.4" fill="#1d1d27"/><circle cx="56.3" cy="30.7" r="1.1" fill="#fff"/></g>
    </g>
    <path class="a-closed" d="M33.4 32.5 q3.6 3 7.2 0 M51.4 32.5 q3.6 3 7.2 0" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M43 37.3 q3 -1.7 6 0 q-.4 2.6 -3 3.3 q-2.6 -.7 -3 -3.3z" fill="#1d1d27"/>
    <g class="a-mouth">
      <path class="a-open" d="M40.6 42.2 Q46 52.5 51.4 42.2 Q46 45.2 40.6 42.2Z" fill="#43262f" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/>
      <path class="a-tongue" d="M42.6 45 Q46 51.4 49.4 45 Q46 46.6 42.6 45Z" fill="#ff7f98"/>
      <path d="M46 40.6 v1.6 M40.6 41.6 q2.8 3 5.4 .6 q2.6 2.4 5.4 -.6" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>
    </g>
  </g>
  <g class="a-zzz"><text x="70" y="22">z</text><text x="76" y="13">z</text><text x="83" y="5">Z</text></g>
</svg>`;

// every Ayra on the page gets the drawing (also the ones the modules add later)
function dress(root){
  (root.querySelectorAll ? root : document).querySelectorAll('.owl:not([data-svg])').forEach(o=>{
    o.dataset.svg = '1'; o.insertAdjacentHTML('afterbegin', SVG);
  });
}
dress(document);
new MutationObserver(ms=>{ for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1){
  if (n.classList.contains('owl') && !n.dataset.svg){ n.dataset.svg = '1'; n.insertAdjacentHTML('afterbegin', SVG); }
  else if (n.querySelector && n.querySelector('.owl:not([data-svg])')) dress(n);
} }).observe(document.body, {childList:true, subtree:true});

// a tap makes her hop and wag
document.addEventListener('pointerdown', e=>{
  const o = e.target.closest('.owl'); if (!o || o.closest('.kdog')) return;
  o.classList.remove('hop'); void o.offsetWidth; o.classList.add('hop');
  setTimeout(()=>o.classList.remove('hop'), 900);
});
// little things now and then: she tilts her head, twitches an ear or wags
const IDLE = ['tilt', 'ear', 'happy'];
setInterval(()=>{
  const vis = [...document.querySelectorAll('.screen.active .owl, .kdog .owl')].filter(o=>o.offsetParent);
  if (!vis.length || Math.random() < .35) return;
  const o = vis[Math.floor(Math.random() * vis.length)], k = IDLE[Math.floor(Math.random() * IDLE.length)];
  o.classList.add('i-' + k); setTimeout(()=>o.classList.remove('i-' + k), 1600);
}, 2600);
window.AyraSVG = SVG;
})();
