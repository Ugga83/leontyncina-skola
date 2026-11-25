/* Živá Ayra: původní obrázky (ayra_full / ayra_walk / ayra_sleep.png) plynule ohýbané na jemné síti bodů (WebGL).
   Nic se nestříhá: hlava se naklání a pohupuje, tělo dýchá, oči se při mrknutí opravdu přivřou, uši stříhají,
   ocásek se vrtí, jazýček oddechuje; při chůzi kráčejí tlapky. Bez WebGL zůstane obyčejný obrázek. */
(function(){
'use strict';
// ---------- where things are on each picture (0..1 of the picture) ----------
const KIND = {
  full:  {src:'ayra_full.png',  neck:[.46,.565], headTop:.55, headBand:.08, eyes:[[.359,.308],[.546,.308]], eyeR:.036,
          ears:[[.30,.11,.32,.175],[.62,.11,.60,.175]], tongue:[.454,.462], tail:{c:[.83,.73], base:[.77,.86], r:.16}, breathBase:.97},
  walk:  {src:'ayra_walk.png',  neck:[.66,.60], headC:[.69,.38], headR:.30, eyes:[[.556,.344],[.747,.344]], eyeR:.038,
          ears:[[.478,.137,.50,.21],[.825,.137,.80,.21]], tongue:[.657,.48], tail:{c:[.18,.35], base:[.34,.52], r:.2},
          legs:[[.65,.88,.62,.72,0],[.27,.86,.30,.70,.5],[.89,.82,.86,.68,.5]], breathBase:.95},
  sleep: {src:'ayra_sleep.png', neck:[.33,.66], headC:[.313,.42], headR:.30, eyes:[], eyeR:.036,
          ears:[[.17,.15,.19,.24],[.44,.15,.42,.24]], tongue:[.313,.555], tail:{c:[.83,.54], base:[.71,.77], r:.2}, breathBase:.95},
};
const M = .2;                                    // room around the picture for movement and for hats
const PAD = 70;                                  // px of the picture added round it for the worn things
const N = 64;                                    // grid
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rot = (p, c, a) => { const s = Math.sin(a), co = Math.cos(a), x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * co - y * s, c[1] + x * s + y * co]; };

// ---------- WebGL: one hidden canvas draws each picture once per frame, then it is copied to every Ayra ----------
const gc = document.createElement('canvas');
const gl = gc.getContext('webgl', {premultipliedAlpha:true, preserveDrawingBuffer:true, antialias:true});
if (!gl){ return; }
const vs = `attribute vec2 p; attribute vec2 uv; varying vec2 v; void main(){ v = uv; gl_Position = vec4(p, 0., 1.); }`;
const fs = `precision mediump float; varying vec2 v; uniform sampler2D t; void main(){ gl_FragColor = texture2D(t, v); }`;
function sh(type, src){ const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
gl.useProgram(prog);
const aP = gl.getAttribLocation(prog, 'p'), aUV = gl.getAttribLocation(prog, 'uv');
// grid: uv of every vertex and triangle indices
const UV = new Float32Array((N + 1) * (N + 1) * 2), IDX = new Uint16Array(N * N * 6), POS = new Float32Array(UV.length);
for (let y = 0, k = 0; y <= N; y++) for (let x = 0; x <= N; x++){ UV[k++] = x / N; UV[k++] = y / N; }
for (let y = 0, k = 0; y < N; y++) for (let x = 0; x < N; x++){
  const i = y * (N + 1) + x; IDX.set([i, i + 1, i + N + 1, i + 1, i + N + 2, i + N + 1], k); k += 6;
}
const bUV = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bUV); gl.bufferData(gl.ARRAY_BUFFER, UV, gl.STATIC_DRAW);
gl.enableVertexAttribArray(aUV); gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
const bP = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bP); gl.bufferData(gl.ARRAY_BUFFER, POS, gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
const bI = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bI); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, IDX, gl.STATIC_DRAW);
gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
// ---------- texture = the picture + what Ayra wears, drawn into it (so it moves with her) ----------
const WEAR = window.AYRA_WEAR || {items:{}, anchors:{}};
const svgCache = {};
function svgImg(id){
  if (svgCache[id]) return svgCache[id];
  const it = WEAR.items[id]; if (!it) return null;
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="-120 -90 240 180">${it.svg}</svg>`);
  return (svgCache[id] = img);
}
const wornNow = () => { try{ return (window.App && window.App.store.get('wear', {})) || {}; }catch(e){ return {}; } };
const SC = 2;                                     // the texture is drawn twice as big: sharp worn things
function compose(K, kind, worn){
  const w = K.w, h = K.h, cv = document.createElement('canvas');
  cv.width = (w + 2 * PAD) * SC; cv.height = (h + 2 * PAD) * SC;
  const x = cv.getContext('2d'); x.imageSmoothingQuality = 'high';
  x.drawImage(K.img, PAD * SC, PAD * SC, w * SC, h * SC);
  const an = WEAR.anchors[kind] || {}, pend = [];
  ['neck', 'eyes', 'head'].forEach(slot=>{
    const id = worn[slot], it = WEAR.items[id], a = an[slot]; if (!it || !a) return;
    const img = svgImg(id);
    if (!img.complete){ pend.push(img); return; }
    x.save(); x.translate((a[0] + PAD) * SC, (a[1] + PAD) * SC); const sz = a[2] * (it.s || 1) * SC / 4; x.scale(sz, sz);
    x.drawImage(img, -480, -360); x.restore();
  });
  if (pend.length){ pend.forEach(im=>im.addEventListener('load', ()=>{ K.sig = null; }, {once:true})); }
  return cv;
}
function upload(K, src){
  if (!K.tex){ K.tex = gl.createTexture(); }
  gl.bindTexture(gl.TEXTURE_2D, K.tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}
function refresh(K, kind){
  const worn = wornNow(), sig = JSON.stringify([worn.head, worn.eyes, worn.neck]);
  if (K.sig === sig || !K.img) return;
  K.sig = sig; K.eyesWorn = !!WEAR.items[worn.eyes];
  try{ upload(K, compose(K, kind, worn)); document.documentElement.classList.add('ayra-wear'); }
  catch(e){ upload(K, K.img); document.documentElement.classList.remove('ayra-wear'); }
}
for (const k in KIND){
  const K = KIND[k], img = new Image();
  img.onload = ()=>{ K.w = img.naturalWidth; K.h = img.naturalHeight; K.img = img; K.px = PAD / K.w; K.py = PAD / K.h; refresh(K, k); };
  img.src = (window.AYRA_IMG && window.AYRA_IMG[k]) || K.src;
}

// ---------- the pose of this moment ----------
const P = {breath:0, head:0, headY:0, tail:0, blink:0, earL:0, earR:0, pant:0, step:0, nod:0};
let blinkAt = 0, blinkLen = 0, tiltUntil = 0, tiltStart = 0, earAt = 0, earSide = 0, happyUntil = 0;
function pose(t, fast){
  P.breath = Math.sin(t * 1.9);
  // head: a slow wander, sometimes a curious tilt
  let tilt = 0;
  if (t < tiltUntil){ const k = (t - tiltStart) / (tiltUntil - tiltStart); tilt = Math.sin(Math.PI * Math.min(1, k)) ** 1.5; }
  P.head = .035 * Math.sin(t * .9) + .02 * Math.sin(t * 1.7 + 1) - .13 * tilt;
  P.headY = .004 * Math.sin(t * 1.9 + .6);
  // blink: quick close and open, now and then twice
  if (t > blinkAt + blinkLen){ blinkAt = t + 2 + Math.random() * 3.5; blinkLen = Math.random() < .25 ? .55 : .22; }
  const bt = t - blinkAt;
  P.blink = bt < 0 || bt > blinkLen ? 0 : blinkLen > .3 ? Math.abs(Math.sin(bt / blinkLen * Math.PI * 2)) : Math.sin(bt / blinkLen * Math.PI);
  // ears: a twitch now and then
  if (t > earAt + .6 && Math.random() < .004){ earAt = t; earSide = Math.random() < .5 ? 0 : 1; }
  const et = t - earAt, tw = et < .5 ? Math.sin(et / .5 * Math.PI * 2) * .22 * (1 - et / .5) : 0;
  P.earL = (earSide === 0 ? tw : 0) + .02 * Math.sin(t * 1.3); P.earR = (earSide === 1 ? -tw : 0) - .02 * Math.sin(t * 1.3 + .5);
  // tail: happy wag is fast
  const happy = fast || t < happyUntil;
  P.tail = (happy ? .16 : .09) * Math.sin(t * (happy ? 16 : 4.2));
  P.pant = Math.sin(t * 7) * .5 + .5;
  P.step = t * 9; P.nod = 0;
}
window.AyraPose = {blink(len){ blinkAt = performance.now() / 1000; blinkLen = len || .22; }, tilt(){ const t = performance.now() / 1000; tiltStart = t; tiltUntil = t + 1.6; }, happy(){ happyUntil = performance.now() / 1000 + 1.4; }};

// ---------- move every grid point ----------
function warp(K, kind, eat){
  const nk = K.neck, hc = K.headC;
  for (let i = 0, k = 0; i < UV.length; i += 2){
    let p = [UV[i] * (1 + 2 * K.px) - K.px, UV[i + 1] * (1 + 2 * K.py) - K.py];
    const u = p[0], v = p[1];
    // eyes: squeeze towards the lower lid
    for (const e of K.eyes){
      const d = Math.hypot((u - e[0]) / 1.1, v - e[1]), w = 1 - ss(K.eyeR * .9, K.eyeR * 1.9, d);
      if (w > 0 && P.blink > 0 && !K.eyesWorn){ const lid = e[1] + K.eyeR * .55; p[1] += (lid - p[1]) * P.blink * .92 * w; }
    }
    // ears: turn round their base
    K.ears.forEach((e, j)=>{
      const d = Math.hypot(u - e[0], v - e[1]), w = 1 - ss(.06, .13, d);
      if (w > 0) p = rot(p, [e[2], e[3]], (j ? P.earR : P.earL) * w);
    });
    // tongue: a little panting
    { const d = Math.hypot(u - K.tongue[0], (v - K.tongue[1]) * 1.3), w = 1 - ss(.015, .05, d); if (w > 0) p[1] += .006 * P.pant * w * (v > K.tongue[1] - .01 ? 1 : 0); }
    // head: turns round the neck, smoothly fading out on the body
    const wh = hc ? 1 - ss(K.headR, K.headR + .1, Math.hypot(u - hc[0], v < hc[1] ? (v - hc[1]) * .55 : v - hc[1])) : 1 - ss(K.headTop, K.headTop + K.headBand, v);
    if (wh > 0){ p = rot(p, nk, P.head * wh * (kind === 'sleep' ? .4 : 1)); p[1] += (P.headY + (eat ? .025 * Math.max(0, Math.sin(P.step * 1.4)) : 0)) * wh; }
    // tail: swings round its base
    { const tl = K.tail, d = Math.hypot(u - tl.c[0], v - tl.c[1]), w = 1 - ss(tl.r * .55, tl.r, d);
      if (w > 0) p = rot(p, tl.base, P.tail * w * (kind === 'sleep' ? .35 : 1)); }
    // walking: legs step one after the other, the body bobs
    if (K.legs){
      K.legs.forEach(l=>{
        const d = Math.hypot(u - l[0], (v - l[1]) * .8), w = 1 - ss(.05, .12, d);
        if (w > 0){ const ph = P.step + l[4] * Math.PI * 2; p[0] += .018 * Math.sin(ph) * w; p[1] -= .016 * Math.max(0, Math.cos(ph)) * w; }
      });
      p[1] -= .008 * Math.abs(Math.sin(P.step)) * (1 - ss(.75, .95, v));
    }
    // breathing: the chest rises, more when asleep
    const amp = kind === 'sleep' ? .018 : .009;
    p[1] -= amp * P.breath * Math.min(K.breathBase - v, .45) / .45 * (v < K.breathBase ? 1 : 0);
    // to clip space, with the margin round the picture
    POS[k++] = ((p[0] + M) / (1 + 2 * M)) * 2 - 1;
    POS[k++] = 1 - ((p[1] + M) / (1 + 2 * M)) * 2;
  }
}

// ---------- every Ayra on the page gets a canvas ----------
const live = new Set();
function attach(o){
  if (o.dataset.live) return; o.dataset.live = '1';
  const c = document.createElement('canvas'); c.className = 'acanvas'; o.insertBefore(c, o.firstChild);
  o.classList.add('live'); live.add(o);
}
function scan(root){ (root.querySelectorAll ? root : document).querySelectorAll('.owl:not([data-live])').forEach(attach); }
scan(document);
new MutationObserver(ms=>{ for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1){
  if (n.classList.contains('owl')) attach(n); else if (n.querySelector && n.querySelector('.owl:not([data-live])')) scan(n);
} }).observe(document.body, {childList:true, subtree:true});

const kindOf = o => { const d = o.closest('.kdog'); return d && d.classList.contains('walk') ? 'walk' : d && d.classList.contains('sleep') ? 'sleep' : 'full'; };
let last = 0;
function frame(now){
  requestAnimationFrame(frame);
  if (document.hidden || now - last < 30) return;
  last = now;
  const t = now / 1000, root = document.documentElement;
  const vis = [...live].filter(o=>o.isConnected && o.offsetParent);
  if (!vis.length) return;
  const fast = vis.some(o=>o.closest('.kdog.wag')), eat = vis.some(o=>o.closest('.kdog.eat'));
  pose(t, fast);
  if (now - (frame.wornAt || 0) > 500){ frame.wornAt = now; for (const k in KIND) refresh(KIND[k], k); }
  // accessories follow the head (CSS variables)
  root.style.setProperty('--ah', (P.head * 57.3).toFixed(2) + 'deg');
  root.style.setProperty('--ahx', (-Math.sin(P.head) * 46).toFixed(2) + '%');
  const groups = {};
  vis.forEach(o=>{ (groups[kindOf(o)] = groups[kindOf(o)] || []).push(o); });
  for (const kind in groups){
    const K = KIND[kind]; if (!K.tex) continue;
    // size: the biggest Ayra of this kind on screen
    let W = 0, H = 0;
    groups[kind].forEach(o=>{ const r = o.getBoundingClientRect(), dpr = Math.min(2.5, devicePixelRatio || 1);
      W = Math.max(W, r.width * (1 + 2 * M) * dpr); H = Math.max(H, r.height * (1 + 2 * M) * dpr); });
    W = Math.min(720, Math.ceil(W)); H = Math.min(720, Math.ceil(H)); if (W < 2 || H < 2) continue;
    if (gc.width !== W || gc.height !== H){ gc.width = W; gc.height = H; }
    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    warp(K, kind, eat && kind === 'full');
    gl.bindBuffer(gl.ARRAY_BUFFER, bP); gl.bufferSubData(gl.ARRAY_BUFFER, 0, POS);
    gl.bindTexture(gl.TEXTURE_2D, K.tex);
    gl.drawElements(gl.TRIANGLES, IDX.length, gl.UNSIGNED_SHORT, 0);
    groups[kind].forEach(o=>{
      const c = o.querySelector('.acanvas'), r = o.getBoundingClientRect(), dpr = Math.min(2.5, devicePixelRatio || 1);
      const w = Math.round(r.width * (1 + 2 * M) * dpr), h = Math.round(r.height * (1 + 2 * M) * dpr);
      if (c.width !== w || c.height !== h){ c.width = w; c.height = h; }
      const x = c.getContext('2d'); x.clearRect(0, 0, w, h); x.drawImage(gc, 0, 0, w, h);
    });
  }
}
requestAnimationFrame(frame);

// a tap: hop and a happy wag
document.addEventListener('pointerdown', e=>{
  const o = e.target.closest('.owl'); if (!o) return;
  window.AyraPose.happy();
  if (o.closest('.kdog')) return;
  o.classList.remove('hop'); void o.offsetWidth; o.classList.add('hop');
  setTimeout(()=>o.classList.remove('hop'), 900);
});
// now and then a curious head tilt or a happy wag
setInterval(()=>{ const r = Math.random(); if (r < .25) window.AyraPose.tilt(); else if (r < .4) window.AyraPose.happy(); }, 3500);
})();
