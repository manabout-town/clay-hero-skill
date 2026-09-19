// clay-hero.js — 타자기 제목 → 부제·CTA 순차 등장, 스틸 교차 페이드 / 비디오 자동재생 안전장치
// 사용: window.CH.mount(document.querySelector('.ch-hero'))  (SPA면 렌더 직후마다 다시 호출)
(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const timers = new WeakMap();

  function clear(hero) { (timers.get(hero) || []).forEach(clearTimeout); timers.set(hero, []); }
  function later(hero, fn, ms) { const id = setTimeout(fn, ms); timers.get(hero).push(id); return id; }

  // 제목을 글자 단위로 친다. <br>는 줄바꿈으로 유지. 한글 1자 110ms, 공백·구두점 60ms.
  function typeTitle(hero, onDone) {
    const h = hero.querySelector('[data-ch-type]');
    if (!h) return onDone();
    const full = h.dataset.chFull || (h.dataset.chFull = h.innerHTML.trim());
    if (RM.matches) { h.innerHTML = full; h.classList.add('is-done'); return onDone(); }
    const lines = full.split(/<br\s*\/?>/i).map(s => s.replace(/<[^>]+>/g, ''));
    h.innerHTML = '';
    const caret = document.createElement('span'); caret.className = 'ch-caret';
    let li = 0, ci = 0;
    (function step() {
      if (li >= lines.length) { h.classList.add('is-done'); return onDone(); }
      if (ci === 0 && li > 0) h.appendChild(document.createElement('br'));
      const ch = lines[li][ci];
      if (ch !== undefined) { h.insertBefore(document.createTextNode(ch), null); ci++; }
      h.appendChild(caret);
      if (ci >= lines[li].length) { li++; ci = 0; return later(hero, step, 260); }  // 줄 끝에서 잠깐 쉼
      later(hero, step, /[\s,.!?]/.test(ch) ? 60 : 110);
    })();
  }

  // 스틸 3~4장 교차 페이드. 화면 밖이면 멈춤.
  function runStills(hero) {
    const stills = [...hero.querySelectorAll('.ch-still')];
    if (stills.length < 2 || RM.matches) return;
    const dwell = parseFloat(getComputedStyle(hero).getPropertyValue('--ch-dwell')) || 2800;
    let i = stills.findIndex(s => s.classList.contains('is-on')); if (i < 0) { i = 0; stills[0].classList.add('is-on'); }
    let id = 0;
    const tick = () => { stills[i].classList.remove('is-on'); i = (i + 1) % stills.length; stills[i].classList.add('is-on'); hero.dataset.chIndex = i; };
    const start = () => { if (!id) id = setInterval(tick, dwell); };
    const stop = () => { clearInterval(id); id = 0; };
    hero.classList.add('is-live');
    new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop(), { threshold: 0.05 }).observe(hero);
  }

  // 비디오: 자동재생 막히면(저전력 모드·데이터 절약) 숨기고 poster 스틸이 대신 보이게
  function runVideo(hero) {
    const v = hero.querySelector('.ch-video');
    if (!v) return;
    if (RM.matches) { v.pause(); v.classList.add('is-off'); return; }
    v.muted = true; v.playsInline = true;
    const p = v.play();
    if (p && p.catch) p.catch(() => v.classList.add('is-off'));
    new IntersectionObserver(([e]) => e.isIntersecting ? v.play().catch(() => {}) : v.pause(), { threshold: 0.05 }).observe(v);
  }

  function mount(hero) {
    if (!hero || hero.dataset.chMounted) return; hero.dataset.chMounted = '1';
    timers.set(hero, []);
    runStills(hero); runVideo(hero);
    const sub = hero.querySelector('.ch-sub'), cta = hero.querySelector('.ch-cta');
    later(hero, () => typeTitle(hero, () => {
      later(hero, () => sub && sub.classList.add('is-in'), 250);
      later(hero, () => cta && cta.classList.add('is-in'), 650);
      hero.classList.add('is-done');
    }), RM.matches ? 0 : 350);  // 배경이 먼저 보이고 글자가 시작된다
  }

  window.CH = { mount, unmount(hero) { clear(hero); delete hero.dataset.chMounted; } };
  document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('.ch-hero').forEach(mount));
})();
