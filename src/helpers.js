// Perpetuum Mobile. Copyright (C) 2026 Jurgen Kobierczynski.
// SPDX-License-Identifier: GPL-3.0-only
// Made with Claude Opus 5.5 Medium.
// Drawing helpers shared by every machine. build.js wraps this file, the machines and runtime.js in one function.
  const TAU = Math.PI * 2;
  const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  const C = {};
  function readColors() {
    const s = getComputedStyle(document.documentElement);
    for (const k of ['paper', 'plate', 'ink', 'soft', 'line', 'brass', 'stamp', 'water']) C[k] = s.getPropertyValue('--' + k).trim();
  }
  readColors();

  /* ---------- drawing helpers ---------- */
  const L = (g, x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
  const hatch = (g, x0, x1, y) => { for (let x = x0 + 6; x <= x1; x += 9) L(g, x, y, x - 6, y + 6); };
  const disc = (g, x, y, r, fill, stroke, lw) => {
    g.beginPath(); g.arc(x, y, r, 0, TAU);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 1.4; g.stroke(); }
  };
  const poly = (g, pts, close) => {
    g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]));
    if (close) g.closePath();
  };
  const spokes = (g, cx, cy, r0, r1, n, th) => {
    for (let k = 0; k < n; k++) { const a = th + k * TAU / n; L(g, cx + r0 * Math.cos(a), cy + r0 * Math.sin(a), cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)); }
  };
  const arrow = (g, x1, y1, x2, y2, h) => {
    h = h || 7; const a = Math.atan2(y2 - y1, x2 - x1);
    L(g, x1, y1, x2 - Math.cos(a) * h * 0.6, y2 - Math.sin(a) * h * 0.6);
    g.beginPath(); g.moveTo(x2, y2);
    g.lineTo(x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45));
    g.lineTo(x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45));
    g.closePath(); g.fillStyle = g.strokeStyle; g.fill();
  };
  const rr = (g, x, y, w, h, r) => {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  };
  let QUIET = false;
  const label = (g, s, x, y, al) => { if (QUIET) return; g.fillStyle = C.soft; g.textAlign = al || 'left'; g.fillText(s, x, y); g.textAlign = 'left'; };
  const ground = (g, x0, x1, y) => { g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, x0, y, x1, y); g.lineWidth = 1; hatch(g, x0, x1, y); };
  const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(TAU * Math.random());
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const $ = id => document.getElementById(id);

  // a path you can walk along by distance
  function mkPath(pts, closed) {
    const P = closed ? pts.concat([pts[0]]) : pts, cum = [0];
    for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const len = cum[cum.length - 1];
    function at(s) {
      s = closed ? ((s % len) + len) % len : clamp(s, 0, len);
      let lo = 0, hi = cum.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
      const f = (s - cum[lo]) / ((cum[hi] - cum[lo]) || 1);
      return [P[lo][0] + (P[hi][0] - P[lo][0]) * f, P[lo][1] + (P[hi][1] - P[lo][1]) * f];
    }
    function trace(g, s0, s1) {
      g.beginPath();
      const n = Math.max(2, Math.ceil(Math.abs(s1 - s0) / 3));
      for (let i = 0; i <= n; i++) { const p = at(s0 + (s1 - s0) * i / n); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
      g.stroke();
    }
    return { len, at, trace, pts: P };
  }
  // outline of a belt run round equal rollers, travelling anticlockwise on screen
  function beltPts(cs, r) {
    const n = cs.length, out = [], nm = [];
    for (let i = 0; i < n; i++) { const a = cs[i], b = cs[(i + 1) % n], d = Math.hypot(b[0] - a[0], b[1] - a[1]); nm.push([-(b[1] - a[1]) / d, (b[0] - a[0]) / d]); }
    for (let i = 0; i < n; i++) {
      const a = cs[i], b = cs[(i + 1) % n], n1 = nm[i], n2 = nm[(i + 1) % n];
      out.push([a[0] + r * n1[0], a[1] + r * n1[1]], [b[0] + r * n1[0], b[1] + r * n1[1]]);
      const a1 = Math.atan2(n1[1], n1[0]); let da = Math.atan2(n2[1], n2[0]) - a1;
      while (da > 0) da -= TAU; while (da <= -TAU) da += TAU;
      for (let k = 1; k < 8; k++) { const t = a1 + da * k / 8; out.push([b[0] + r * Math.cos(t), b[1] + r * Math.sin(t)]); }
    }
    return out;
  }
  // steady while helped along; runs down to a dead stop when the rule is in force
  function drive(run, tau) {
    const d = { v: run, still: 0,
      step(dt, on) {
        if (on) { d.v = Math.max(0, d.v - (d.v / tau + 0.05 * run) * dt); d.still = d.v === 0 ? d.still + dt : 0; }
        else { d.v += (run - d.v) * Math.min(1, 1.6 * dt); d.still = 0; }
      },
      get frac() { return d.v / run; },
      stalled() { return d.still > 0.6; } };
    return d;
  }

  const gear = (g, cx, cy, r, n, th, fill) => {
    const w = TAU / n; g.beginPath();
    for (let k = 0; k < n; k++) {
      const a = th + k * w;
      [[-0.22, r + 4], [0.22, r + 4], [0.32, r - 4], [0.68, r - 4]].forEach((q, j) => {
        const x = cx + q[1] * Math.cos(a + q[0] * w), y = cy + q[1] * Math.sin(a + q[0] * w);
        k + j ? g.lineTo(x, y) : g.moveTo(x, y);
      });
    }
    g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } g.stroke();
  };
