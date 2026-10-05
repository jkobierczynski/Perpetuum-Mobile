// Perpetuum Mobile. Copyright (C) 2026 Jurgen Kobierczynski.
// SPDX-License-Identifier: GPL-3.0-only
// Made with Claude Opus 5.5 Medium.
// Finds every <canvas data-m="..."> on the page, mounts its machine and runs the animation loop.

  /* ---------- runtime: every canvas on the page that names a machine ---------- */
  const figs = [...document.querySelectorAll('canvas[data-m]')].map(cv => {
    const unit = cv.closest('.unit'), g = cv.getContext('2d');
    const f = { cv, g, on: false, vis: true, thumb: unit.classList.contains('card'), m: M[cv.dataset.m](g),
      sw: unit.querySelector('.switch'), state: unit.querySelector('.swstate'), stamp: unit.querySelector('.stamp'),
      dd: [...unit.querySelectorAll('.readout dd')] };
    f.draw = () => {
      const k = cv.width / 420;
      g.setTransform(k, 0, 0, k, 0, 0); g.clearRect(0, 0, 420, 340);
      g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash([]); g.lineDashOffset = 0; g.globalAlpha = 1;
      g.font = '500 12.5px ' + MONO; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      QUIET = f.thumb; f.m.draw(f.on); QUIET = false;
    };
    f.fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.max(50, cv.clientWidth);
      cv.width = Math.round(w * dpr); cv.height = Math.round(w * 340 / 420 * dpr); f.draw();
    };
    f.report = () => {
      if (f.dd.length) f.m.read(f.on).forEach((v, j) => { f.dd[j].textContent = v; });
      if (f.stamp) f.stamp.hidden = !f.m.stalled(f.on);
    };
    return f;
  });

  let paused = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const master = $('master'), pauseBtn = $('pause');
  const allOn = () => figs.every(f => f.on);
  function setPaused(p) { paused = p; if (pauseBtn) pauseBtn.textContent = p ? 'Run' : 'Pause'; }
  function apply(f, on) {
    f.on = on; if (f.m.set) f.m.set(on);
    if (f.sw) { f.sw.setAttribute('aria-checked', String(on)); f.state.textContent = f.sw.dataset[on ? 'on' : 'off']; }
    if (master) master.textContent = allOn() ? master.dataset.on : master.dataset.off;
    setPaused(false);
  }
  figs.forEach(f => { if (f.sw) f.sw.addEventListener('click', () => apply(f, !f.on)); });
  if (master) master.addEventListener('click', () => { const on = !allOn(); figs.forEach(f => apply(f, on)); });
  if (pauseBtn) pauseBtn.addEventListener('click', () => setPaused(!paused));
  setPaused(paused);

  figs.forEach(f => { f.fit(); f.report(); });
  if (window.ResizeObserver) { const ro = new ResizeObserver(es => es.forEach(e => { const f = figs.find(x => x.cv === e.target); if (f) f.fit(); })); figs.forEach(f => ro.observe(f.cv)); }
  if (window.IntersectionObserver) {
    const io = new IntersectionObserver(es => es.forEach(e => { const f = figs.find(x => x.cv === e.target); if (f) f.vis = e.isIntersecting; }), { rootMargin: '120px' });
    figs.forEach(f => io.observe(f.cv));
  }

  let last = performance.now(), tick = 0;
  function frame(now) {
    const dt = clamp((now - last) / 1000, 0, 0.05); last = now; tick++;
    if (tick % 30 === 0) readColors();
    for (const f of figs) {
      if (!f.vis) continue;
      if (!paused) f.m.step(dt, f.on);
      f.draw();
      if (tick % 6 === 0) f.report();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
