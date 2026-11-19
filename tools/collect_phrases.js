// Collects every sentence the app can say -> app/src/main/assets/www/voice/phrases.json
// Run: node tools/collect_phrases.js   (needs Playwright with Chromium)
const path = require('path'), fs = require('fs');
const {chromium} = require('playwright');
(async () => {
  const www = path.resolve(__dirname, '../app/src/main/assets/www');
  const b = await chromium.launch(); const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + www + '/index.html'); await p.waitForTimeout(500);
  const list = await p.evaluate(() => window.__allPhrases().map(t => ({t, k: window.__vkey(t)})));
  await b.close();
  if (errs.length) { console.error(errs); process.exit(1); }
  fs.writeFileSync(path.join(www, 'voice/phrases.json'), JSON.stringify(list, null, 0).replace(/},{/g, '},\n{') + '\n');
  console.log(list.length + ' phrases');
})();
