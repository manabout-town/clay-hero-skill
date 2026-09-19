// verify.mjs — clay-hero 검사 (playwright)
// 사용: node verify.mjs <url> <출력폴더>
// 폭 1440·430·390·320에서: 타이핑 중 컷 → 완료 컷, 제목이 원문과 같아졌는지, 부제·CTA가 보이는지,
// 배경이 움직이는지(스틸 index 변화 또는 video currentTime), 가로 넘침, 콘솔 에러. 마지막에 reduced-motion.
import { chromium } from 'playwright';
const [,, url, out = '.'] = process.argv;
if (!url) { console.error('usage: node verify.mjs <url> <outdir>'); process.exit(1); }
const b = await chromium.launch();
const log = [];
for (const [w, h] of [[1440, 820], [430, 932], [390, 844], [320, 700]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: w < 800 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1100);
  await p.screenshot({ path: `${out}/typing-${w}.png` });
  const done = await p.waitForSelector('.ch-hero.is-done', { timeout: 9000 }).then(() => true, () => false);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/done-${w}.png` });
  const before = await p.evaluate(() => ({ i: document.querySelector('.ch-hero')?.dataset.chIndex, t: document.querySelector('.ch-video')?.currentTime }));
  await p.waitForTimeout(3200);
  const r = await p.evaluate((before) => {
    const hero = document.querySelector('.ch-hero'), h = hero.querySelector('[data-ch-type]');
    const vis = el => el && getComputedStyle(el).opacity !== '0' && el.getBoundingClientRect().height > 0;
    const inBox = el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; };
    const title = h.innerText.replace(/\s+/g, ' ').trim();
    const full = (h.dataset.chFull || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const v = hero.querySelector('.ch-video');
    const moving = v ? (v.currentTime > (before.t || 0) && !v.classList.contains('is-off')) : hero.dataset.chIndex !== before.i;
    return { titleOk: title === full, subVis: vis(hero.querySelector('.ch-sub')), ctaVis: vis(hero.querySelector('.ch-cta')),
      ctaInView: inBox(hero.querySelector('.ch-cta')), moving, hscroll: document.documentElement.scrollWidth - innerWidth };
  }, before);
  const ok = done && r.titleOk && r.subVis && r.ctaVis && r.ctaInView && r.moving && r.hscroll === 0 && !errs.length;
  log.push(`${w} ${ok ? 'OK' : 'CHECK'} done=${done} ${JSON.stringify(r)}${errs.length ? ' errors=' + JSON.stringify(errs) : ''}`);
  await p.close();
}
const rm = await b.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await rm.goto(url); await rm.waitForTimeout(500);
const r = await rm.evaluate(() => ({ done: !!document.querySelector('.ch-hero.is-done'), caret: !!document.querySelector('.ch-caret'), live: !!document.querySelector('.ch-hero.is-live') }));
await rm.screenshot({ path: `${out}/reduced-390.png` });
log.push(`reduced-motion ${r.done && !r.live ? 'OK' : 'CHECK'} ${JSON.stringify(r)}`);
console.log(log.join('\n'));
await b.close();
