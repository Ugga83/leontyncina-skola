/* Živá Ayra: původní obrázek (ayra_full.png) rozdělený na hlavu, tělo a ocásek, aby se mohly hýbat zvlášť.
   Dýchá, mrká (víčka přes její vlastní oči), kývá hlavou, vrtí ocáskem; ťuknutí = poskok.
   V boudě zůstávají původní obrázky chůze a spánku (ayra_walk.png, ayra_sleep.png), jen s pohybem. */
(function(){
'use strict';
const RIG = `<div class="arig" aria-hidden="true"><img class="a-tail" src="ayra_tail.png" alt=""><img class="a-body" src="ayra_body.png" alt="">
  <div class="a-head"><img src="ayra_head.png" alt=""><i class="a-lid l"></i><i class="a-lid r"></i></div></div>`;
function rig(o){ if (o.dataset.rig) return; o.dataset.rig = '1'; o.classList.add('rig'); o.insertAdjacentHTML('afterbegin', RIG); }
function dress(root){ (root.querySelectorAll ? root : document).querySelectorAll('.owl:not([data-rig])').forEach(rig); }
dress(document);
new MutationObserver(ms=>{ for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1){
  if (n.classList.contains('owl')) rig(n); else if (n.querySelector && n.querySelector('.owl:not([data-rig])')) dress(n);
} }).observe(document.body, {childList:true, subtree:true});

// a tap makes her hop and wag (not in the kennel, which has its own reactions)
document.addEventListener('pointerdown', e=>{
  const o = e.target.closest('.owl'); if (!o || o.closest('.kdog')) return;
  o.classList.remove('hop'); void o.offsetWidth; o.classList.add('hop');
  setTimeout(()=>o.classList.remove('hop'), 900);
});
// now and then: she tilts her head, nods or wags happily
const IDLE = ['tilt', 'nod', 'happy'];
setInterval(()=>{
  const vis = [...document.querySelectorAll('.screen.active .owl, .kdog .owl')].filter(o=>o.offsetParent);
  if (!vis.length || Math.random() < .35) return;
  const o = vis[Math.floor(Math.random() * vis.length)], k = IDLE[Math.floor(Math.random() * IDLE.length)];
  o.classList.add('i-' + k); setTimeout(()=>o.classList.remove('i-' + k), 1600);
}, 2600);
})();
