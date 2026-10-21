// Browser test for the built MundaMate targets.
//   python3 scripts/build.py && node tests/browser.test.js
// Exercises dist/web/inject.js (the file the bookmarklet and Android app run) and the
// Chrome extension popup, in a real Chromium, at desktop and phone widths.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');

const root = path.resolve(__dirname, '..');
const rules = JSON.parse(fs.readFileSync(path.join(root, 'data/rules.json')));
const injector = path.join(root, 'dist/web/inject.js');
const extDir = path.join(root, 'dist/chrome-extension');

(async () => {
  const server = http.createServer((req, res) => {
    const file = path.join(extDir, path.basename(new URL(req.url, 'http://localhost').pathname));
    if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', ({'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json'})[path.extname(file)] || 'text/plain');
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 1024, height: 800}});
    const errors = []; page.on('pageerror', e => errors.push(e.message));

    // A fighter-card-like fixture using names exactly as Munda Manager prints them.
    await page.setContent(`
      <div id="card"><h3>Escher Death-Maiden</h3>
        <p id="special">Poison Blood, Nimble, Leash Range</p>
        <p id="skills">Let’s Dance, Catfall</p>
        <p id="wargear">Blood Rush, Grace</p>
        <p id="goliath">Furious Charge, Combat Chems Stash, Counter-charge</p>
        <p id="powers">Force Blast (Free), Terrify (Double)</p>
      </div><div id="all"></div>`);
    await page.addScriptTag({path: injector});
    await page.waitForSelector('.munda-rule-tooltip');
    const keys = sel => page.locator(sel + ' .munda-rule-tooltip').evaluateAll(n => n.map(x => x.dataset.rule));
    assert.deepEqual(await keys('#special'), ['Poison Blood', 'Nimble', 'Leash Range']);
    assert.deepEqual(await keys('#skills'), ["Let's Dance", 'Catfall']);
    assert.deepEqual(await keys('#wargear'), ['Blood Rush', 'Grace']);
    assert.deepEqual(await keys('#goliath'), ['Furious Charge', 'Combat Chems Stash', 'Counter-charge']);
    assert.deepEqual(await keys('#powers'), ['Force Blast (Free)', 'Terrify (Double)']);
    // The fighter type name must not pick up a tooltip.
    assert.equal(await page.locator('#card h3 .munda-rule-tooltip').count(), 0);

    // Every catalog entry, printed on its own, resolves to itself.
    // Blast (3"/5") is the one catalog key Munda Manager never prints literally; it's
    // matched from "Blast (3")" / "Blast (5")", checked separately below.
    const names = Object.keys(rules).filter(n => n !== 'Blast (3"/5")');
    await page.evaluate(() => { const p = document.createElement('p'); p.id = 'blast'; p.textContent = 'Blast (3"), Blast (5")'; document.body.appendChild(p); });
    await page.waitForSelector('#blast .munda-rule-tooltip');
    assert.deepEqual(await keys('#blast'), ['Blast (3"/5")', 'Blast (3"/5")']);
    await page.evaluate(list => {
      const box = document.getElementById('all');
      for (const n of list) { const p = document.createElement('p'); p.dataset.expected = n; p.textContent = n; box.appendChild(p); }
    }, names);
    await page.waitForFunction(n => document.querySelectorAll('#all .munda-rule-tooltip').length >= n, names.length, {timeout: 15000});
    const mismatches = await page.locator('#all p').evaluateAll(ps => ps
      .map(p => [p.dataset.expected, [...p.querySelectorAll('.munda-rule-tooltip')].map(s => s.dataset.rule)])
      .filter(([want, got]) => got.length !== 1 || got[0] !== want));
    assert.deepEqual(mismatches, [], 'rules that do not resolve to themselves');

    // Modal: verbatim text, source line, weapon table, phone width fit.
    await page.locator('#special .munda-rule-tooltip').first().click();
    await page.waitForFunction(() => document.querySelector('#munda-modal').style.display === 'flex');
    const modal = await page.locator('#munda-modal').innerText();
    assert.match(modal, /natural 1 to Wound, they may re-roll the D6/);
    assert.match(modal, /Gangs of the Underhive, PDF p\. 40/);
    await page.keyboard.press('Escape');
    await page.locator('#powers .munda-rule-tooltip').first().click();
    assert.equal(await page.locator('#munda-modal table.munda-weapon-table').count(), 1);
    await page.keyboard.press('Escape');
    await page.setViewportSize({width: 360, height: 640});
    await page.locator('#goliath .munda-rule-tooltip').nth(2).click();
    const box = await page.locator('#munda-modal > div').boundingBox();
    assert(box.y >= 0 && box.y + box.height <= 640 && box.x >= 0 && box.x + box.width <= 360, 'modal fits phone width');
    await page.screenshot({path: path.join(root, 'tests/modal-preview.png')});
    await page.keyboard.press('Escape');
    assert.deepEqual(errors, []);

    // Chrome extension popup.
    await page.goto(`http://127.0.0.1:${server.address().port}/popup.html`);
    await page.setViewportSize({width: 460, height: 620});
    const total = Object.keys(rules).length;
    await page.waitForFunction(n => document.querySelector('#count').textContent.startsWith(`${n} of ${n} rules`), total);
    await page.locator('#search').fill('poison blood');
    assert.equal(await page.locator('.rule').first().evaluate(b => b.firstChild.textContent), 'Poison Blood');
    await page.locator('#house').selectOption('Escher');
    assert(await page.locator('.rule').count() > 0);
    await page.screenshot({path: path.join(root, 'tests/popup-preview.png')});

    console.log(`PASS: ${total} rules; card fixture; modal + weapon table; phone width; popup`);
  } finally {
    await browser.close(); server.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
