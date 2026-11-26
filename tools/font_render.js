// Renders cursive items with the school font (Slabikář) in Chromium, so letters join exactly as the font designer made them.
// Output: tools/font_out/<n>.png + index.json (text, baseline, x-height in px). Then: python3 tools/font_strokes.py
// Run: node tools/font_render.js
const path = require('path'), fs = require('fs');
const {chromium} = require('playwright');
const WWW = path.resolve(__dirname, '../app/src/main/assets/www');
const OUT = path.join(__dirname, 'font_out');
const lower = 'a á b c č d ď e é ě f g h ch i í j k l m n ň o ó p q r ř s š t ť u ú ů v w x y ý z ž'.split(' ');
const upper = 'A Á B C Č D Ď E É F G H Ch I Í J K L M N Ň O Ó P Q R Ř S Š T Ť U Ú V W X Y Ý Z Ž'.split(' ');
// everything the app lets her trace in cursive (write.js W_LESSONS) + whole words from school tasks
const lessons = ['ma','me','mi','mo','mu','la','le','li','lo','lu','sa','se','si','so','su','pa','pe','pi','po','pu','ta','te','ti','to','tu',
  'máma','mele','Ema','lama','pila','pes','osel','Pepa','lupa','sele','táta','teta','léto','mapa'];
const items = [...new Set([...lower, ...upper, ...lessons])];
(async()=>{
  fs.mkdirSync(OUT, {recursive:true});
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent(`<html><head><style>@font-face{font-family:S;src:url(file://${WWW}/fonts/slabikar.otf)}</style></head>
    <body><canvas id=c></canvas><span style="font-family:S">a</span></body></html>`);
  await p.goto('file://' + WWW + '/index.html'); // a file:// page so the font file may load
  await p.evaluate(()=>{ const s = document.createElement('style'); s.textContent = '@font-face{font-family:SLB;src:url(fonts/slabikar.otf)}'; document.head.appendChild(s); });
  await p.evaluate(()=>document.fonts.load('600px SLB'));
  const index = [];
  for (let i = 0; i < items.length; i++){
    const t = items[i];
    const r = await p.evaluate(t=>{
      const FS = 600, c = document.createElement('canvas'), g = c.getContext('2d');
      g.font = `${FS}px SLB`;
      const m = g.measureText(t), mx = g.measureText('x'), ml = g.measureText('l');
      const f1 = g.measureText(t.startsWith('Ch') || t.startsWith('ch') ? t.slice(0, 2) : t[0]);
      const pad = 140, W = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + pad * 2;
      const asc = Math.max(m.actualBoundingBoxAscent, ml.actualBoundingBoxAscent) , desc = Math.max(m.actualBoundingBoxDescent, FS * .35);
      const H = Math.ceil(asc + desc) + pad * 2, base = pad + asc;
      c.width = W; c.height = H; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
      g.font = `${FS}px SLB`; g.fillStyle = '#000'; g.fillText(t, pad + m.actualBoundingBoxLeft, base);
      return {png: c.toDataURL('image/png'), base, xh: mx.actualBoundingBoxAscent, x0: pad + m.actualBoundingBoxLeft, w1: f1.actualBoundingBoxLeft + f1.actualBoundingBoxRight};
    }, t);
    fs.writeFileSync(path.join(OUT, i + '.png'), Buffer.from(r.png.split(',')[1], 'base64'));
    index.push({t, file: i + '.png', base: r.base, xh: r.xh, x0: r.x0, w1: r.w1});
  }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index));
  console.log(index.length + ' rendered');
  await b.close();
})();
