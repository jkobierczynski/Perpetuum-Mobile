// Perpetuum Mobile. Copyright (C) 2026 Jurgen Kobierczynski.
// SPDX-License-Identifier: GPL-3.0-only
// Made with Claude Opus 5.5 Medium.
// Machines: more of the first kind. Each M.name = g => ({ step, draw, read, stalled }).

  /* ---------- Villard's hammer wheel ---------- */
  M.villard = g => {
    const d = drive(0.8, 2.6), cx = 210, cy = 165, R = 92, N = 7, AL = 38, rho = new Array(N).fill(0);
    let th = 0, right = 4, left = 3;
    const settle = (i, lim) => {
      const a = (((th + i * TAU / N) % TAU) + TAU) % TAU, dn = a > 1.5 * Math.PI + 0.2 || a < 0.5 * Math.PI;
      if (dn && rho[i] < -Math.PI / 2) rho[i] += TAU;      // over the top: the mallet flops forward
      if (!dn && rho[i] > 0.01) rho[i] = 0;
      rho[i] += clamp((dn ? 0 : clamp(Math.PI / 2 - a, -Math.PI, 0)) - rho[i], -lim, lim);
    };
    for (let i = 0; i < N; i++) settle(i, 9);
    return {
      step(dt, on) { d.step(dt, on); th += d.v * dt; for (let i = 0; i < N; i++) settle(i, 7 * dt); },
      draw() {
        ground(g, 80, 340, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.2; L(g, cx, cy, cx - 56, 318); L(g, cx, cy, cx + 56, 318);
        disc(g, cx, cy, R, null, C.ink, 2); disc(g, cx, cy, R - 6, null, C.ink, 1);
        g.lineWidth = 1.3; spokes(g, cx, cy, 10, R - 6, N, th);
        right = 0; left = 0;
        for (let i = 0; i < N; i++) {
          const a = th + i * TAU / N, px = cx + R * Math.cos(a), py = cy + R * Math.sin(a), b = a + rho[i];
          const ex = px + AL * Math.cos(b), ey = py + AL * Math.sin(b), nx = -Math.sin(b), ny = Math.cos(b);
          g.strokeStyle = C.ink; g.lineWidth = 2.4; L(g, px, py, ex, ey);
          g.lineCap = 'butt'; g.lineWidth = 12; L(g, ex - nx * 10, ey - ny * 10, ex + nx * 10, ey + ny * 10);
          g.strokeStyle = C.brass; g.lineWidth = 9; L(g, ex - nx * 8.5, ey - ny * 8.5, ex + nx * 8.5, ey + ny * 8.5); g.lineCap = 'round';
          disc(g, px, py, 3, C.plate, C.ink, 1.4);
          if (ex > cx + 1) right++; else if (ex < cx - 1) left++;
        }
        disc(g, cx, cy, 10, C.plate, C.ink, 2);
      },
      read() { return [(d.v * 60 / TAU).toFixed(1) + ' rpm', right, left]; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- Taccola's folding arms ---------- */
  M.taccola = g => {
    const d = drive(0.8, 2.6), cx = 210, cy = 160, N = 12, A1 = 56, A2 = 54, fold = [];
    let th = 0, far = 6;
    const want = i => { const a = (((th + i * TAU / N) % TAU) + TAU) % TAU; return a > 1.5 * Math.PI || a < 0.5 * Math.PI ? 0 : 2.3; };
    for (let i = 0; i < N; i++) fold.push(want(i));
    return {
      step(dt, on) { d.step(dt, on); th += d.v * dt; for (let i = 0; i < N; i++) fold[i] += clamp(want(i) - fold[i], -4 * dt, 4 * dt); },
      draw() {
        ground(g, 80, 340, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.2; L(g, cx, cy, cx - 56, 318); L(g, cx, cy, cx + 56, 318);
        far = 0;
        for (let i = 0; i < N; i++) {
          const a = th + i * TAU / N, x1 = cx + A1 * Math.cos(a), y1 = cy + A1 * Math.sin(a), b = a - fold[i];
          const x2 = x1 + A2 * Math.cos(b), y2 = y1 + A2 * Math.sin(b);
          g.strokeStyle = C.ink; g.lineWidth = 2.8; L(g, cx, cy, x1, y1); g.lineWidth = 2.2; L(g, x1, y1, x2, y2);
          disc(g, x1, y1, 3.2, C.plate, C.ink, 1.4); disc(g, x2, y2, 9, C.brass, C.ink, 1.4);
          if (fold[i] < 0.5) far++;
        }
        disc(g, cx, cy, 11, C.plate, C.ink, 2); disc(g, cx, cy, 2.5, C.ink);
      },
      read() { return [(d.v * 60 / TAU).toFixed(1) + ' rpm', far, N - far]; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- Bessler's wheel ---------- */
  M.bessler = g => {
    const d = drive(0.7, 2.8), cx = 170, cy = 172, R = 96;
    let th = 0, h = 0, lifted = 0;
    return {
      step(dt, on) { d.step(dt, on); th += d.v * dt; h += d.v * dt * 26; if (h > 170) { h = 0; lifted++; } },
      draw() {
        ground(g, 30, 396, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.4; L(g, cx, cy, cx - 70, 318); L(g, cx, cy, cx + 70, 318);
        L(g, 366, 318, 366, 50); L(g, 366, 50, 334, 50);
        g.strokeStyle = C.soft; g.lineWidth = 1.2; L(g, cx + 6, cy - 9, 330, 42); L(g, 342, 50, 342, 268 - h);
        disc(g, 334, 50, 8, C.plate, C.ink, 1.6);
        g.fillStyle = C.brass; g.fillRect(326, 268 - h, 32, 22); g.strokeStyle = C.ink; g.lineWidth = 1.3; g.strokeRect(326, 268 - h, 32, 22);
        L(g, 326, 279 - h, 358, 279 - h); L(g, 342, 268 - h, 342, 279 - h); L(g, 334, 279 - h, 334, 290 - h); L(g, 350, 279 - h, 350, 290 - h);
        disc(g, cx, cy, R, C.plate, C.ink, 2.2); g.globalAlpha = 0.08; disc(g, cx, cy, R, C.ink); g.globalAlpha = 1;
        disc(g, cx, cy, R - 8, null, C.ink, 1);
        g.strokeStyle = C.soft; g.lineWidth = 1; spokes(g, cx, cy, 14, R - 8, 8, th);
        disc(g, cx, cy, 12, C.plate, C.ink, 2); disc(g, cx, cy, 2.5, C.ink);
        g.fillStyle = C.soft; g.font = '700 46px ' + MONO; g.textAlign = 'center'; g.fillText('?', cx, cy - 30);
        g.font = '500 12.5px ' + MONO; g.textAlign = 'left';
        label(g, 'cloth-covered drum', 24, 52); label(g, 'box of bricks', 318, 308, 'center');
      },
      read() { return [(d.v * 60 / TAU).toFixed(1) + ' rpm', lifted, 'never shown']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- capillary fountain ---------- */
  M.capfount = g => {
    const tube = mkPath([[130, 292], [130, 84], [180, 84], [180, 102]], false), d = drive(1.6, 2);
    let th = 0, drip = 0;
    return {
      step(dt, on) { d.step(dt, on); th -= d.v * dt; drip += d.v * dt * 38; },
      draw(on) {
        ground(g, 40, 380, 318);
        g.globalAlpha = 0.4; g.fillStyle = C.water; g.fillRect(60, 272, 300, 34); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, 60, 256, 60, 306); L(g, 60, 306, 360, 306); L(g, 360, 256, 360, 306);
        L(g, 90, 306, 90, 318); L(g, 330, 306, 330, 318);
        g.lineWidth = 2; L(g, 192, 196, 168, 306); L(g, 192, 196, 216, 306);
        g.lineWidth = 8; poly(g, tube.pts); g.stroke(); g.strokeStyle = C.plate; g.lineWidth = 4.4; poly(g, tube.pts); g.stroke();
        g.strokeStyle = C.water; g.globalAlpha = 0.85; poly(g, tube.pts); g.stroke(); g.globalAlpha = 1;
        if (on && d.v === 0) disc(g, 180, 107, 4.4, C.water, C.ink, 1);
        else for (let k = 0; k < 3; k++) {
          g.globalAlpha = d.frac; disc(g, 180, 108 + ((drip + k * 20) % 58), 2.6, C.water); disc(g, 176, 232 + ((drip + k * 13) % 38), 2.4, C.water); g.globalAlpha = 1;
        }
        disc(g, 192, 196, 30, null, C.ink, 1.8); g.lineWidth = 2; spokes(g, 192, 196, 6, 30, 8, th); disc(g, 192, 196, 6, C.plate, C.ink, 1.6);
        label(g, 'thin tube', 118, 150, 'right'); if (on) label(g, 'the drop will not let go', 192, 110);
      },
      read(on) { return ['12 cm', Math.round(d.frac * 40) + ' a minute', (d.v * 60 / TAU).toFixed(1) + ' rpm']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- siphon with a fat leg ---------- */
  M.siphon = g => {
    const loop = mkPath([[140, 286], [140, 70], [280, 70], [280, 286], [210, 298]], true), d = drive(46, 2.2);
    let s = 0, th = 0;
    return {
      step(dt, on) { d.step(dt, on); s += d.v * dt; th += d.v * dt / 14; },
      draw() {
        ground(g, 40, 380, 318);
        g.globalAlpha = 0.4; g.fillStyle = C.water; g.fillRect(60, 256, 300, 50); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, 60, 240, 60, 306); L(g, 60, 306, 360, 306); L(g, 360, 240, 360, 306);
        L(g, 90, 306, 90, 318); L(g, 330, 306, 330, 318);
        const wide = [[263, 290], [263, 114], [275, 90], [285, 90], [297, 114], [297, 290]];
        poly(g, wide, true); g.fillStyle = C.plate; g.fill(); g.globalAlpha = 0.55; g.fillStyle = C.water; g.fill(); g.globalAlpha = 1;
        poly(g, wide); g.strokeStyle = C.ink; g.lineWidth = 1.8; g.stroke();
        const thin = [[140, 290], [140, 70], [280, 70], [280, 92]];
        g.lineWidth = 10; poly(g, thin); g.stroke(); g.strokeStyle = C.plate; g.lineWidth = 6; poly(g, thin); g.stroke();
        g.strokeStyle = C.water; g.globalAlpha = 0.75; poly(g, thin); g.stroke(); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 2; spokes(g, 280, 200, 3, 13, 4, th); disc(g, 280, 200, 3, C.ink);
        for (let q = s % 26; q < loop.len; q += 26) { const p = loop.at(q); if (p[1] < 252) disc(g, p[0], p[1], 1.7, C.ink); }
        label(g, 'narrow leg', 128, 170, 'right'); label(g, 'wide leg', 306, 170);
      },
      read() { return ['0.1 kg', '2.0 kg', (d.frac * 3).toFixed(1) + ' L/min']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- lopsided chain ---------- */
  M.chain = g => {
    const pts = [[172, 70], [172, 270]];
    for (let k = 1; k <= 8; k++) { const t = Math.PI - k * Math.PI / 8; pts.push([200 + 28 * Math.cos(t), 270 + 28 * Math.sin(t)]); }
    pts.push([286, 232], [228, 194], [286, 156], [228, 118], [228, 70]);
    for (let k = 1; k < 8; k++) { const t = -k * Math.PI / 8; pts.push([200 + 28 * Math.cos(t), 70 + 28 * Math.sin(t)]); }
    const path = mkPath(pts, true), d = drive(40, 2.2), n = 28;
    let s = 0, zig = 0, str = 0;
    return {
      step(dt, on) { d.step(dt, on); s -= d.v * dt; },
      draw() {
        ground(g, 80, 340, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.4; L(g, 200, 70, 200, 318);
        g.strokeStyle = C.soft; g.lineWidth = 1.2; for (const r of [[276, 232], [238, 194], [276, 156], [238, 118]]) L(g, 200, r[1], r[0], r[1]);
        for (const cy of [70, 270]) { disc(g, 200, cy, 22, C.plate, C.ink, 1.8); g.lineWidth = 1.2; spokes(g, 200, cy, 5, 22, 4, s / 28); disc(g, 200, cy, 5, C.plate, C.ink, 1.5); }
        for (const r of [[276, 232], [238, 194], [276, 156], [238, 118]]) disc(g, r[0], r[1], 7, C.plate, C.ink, 1.5);
        poly(g, path.pts); g.strokeStyle = C.soft; g.lineWidth = 1.2; g.stroke();
        zig = 0; str = 0;
        for (let k = 0; k < n; k++) {
          const p = path.at(s + k * path.len / n); disc(g, p[0], p[1], 5, C.brass, C.ink, 1.1);
          if (p[1] > 70 && p[1] < 270) { if (p[0] > 214) zig++; else if (p[0] < 186) str++; }
        }
        label(g, 'straight', 160, 174, 'right'); label(g, 'zigzag', 300, 198);
      },
      read() { return [zig, str, (d.v / 10).toFixed(1) + ' cm/s']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- ball-lifting screw ---------- */
  M.ballscrew = g => {
    const d = drive(50, 2.6), W = [285, 185], R = 70, A0 = [66, 296], A1 = [128, 82], nx = 0.96, ny = 0.277, hw = 13;
    const pts = [[66, 292], [128, 82], [258, 112]];
    for (let k = 1; k <= 12; k++) { const t = (-110 - k * 140 / 12) * Math.PI / 180; pts.push([W[0] + R * Math.cos(t), W[1] + R * Math.sin(t)]); }
    pts.push([72, 294]);
    const path = mkPath(pts, true), n = 9;
    let s = 0, th = 0, ph = 0;
    return {
      step(dt, on) { d.step(dt, on); s += d.v * dt; th -= d.v / R * dt; ph += d.v * dt * 0.07; },
      draw() {
        ground(g, 30, 392, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.2; L(g, W[0], W[1], 258, 318); L(g, W[0], W[1], 312, 318);
        g.strokeStyle = C.soft; g.lineWidth = 1.1; L(g, W[0], W[1] - 8, 97, 180); L(g, W[0], W[1] + 8, 97, 196);
        poly(g, [[A0[0] - nx * hw, A0[1] - ny * hw], [A1[0] - nx * hw, A1[1] - ny * hw], [A1[0] + nx * hw, A1[1] + ny * hw], [A0[0] + nx * hw, A0[1] + ny * hw]], true);
        g.fillStyle = C.plate; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.6; g.stroke();
        g.beginPath();
        for (let i = 0; i <= 90; i++) {
          const t = i / 90, o = hw * Math.sin(TAU * t * 9 - ph * TAU), x = A0[0] + (A1[0] - A0[0]) * t + nx * o, y = A0[1] + (A1[1] - A0[1]) * t + ny * o;
          i ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.lineWidth = 1.3; g.stroke();
        disc(g, 97, 188, 8, C.plate, C.ink, 1.6);
        g.lineWidth = 1.8; L(g, 132, 92, 254, 121); L(g, 268, 262, 70, 304);
        disc(g, W[0], W[1], R - 8, null, C.ink, 2); g.lineWidth = 1.3; spokes(g, W[0], W[1], 8, R - 8, 8, th);
        g.lineWidth = 2.4; spokes(g, W[0], W[1], R - 8, R + 5, 8, th + TAU / 16);
        disc(g, W[0], W[1], 8, C.plate, C.ink, 1.8);
        for (let k = 0; k < n; k++) { const p = path.at(s + k * path.len / n); disc(g, p[0], p[1], 6.5, C.brass, C.ink, 1.3); }
        label(g, 'screw', 122, 250);
      },
      read(on) { return [(d.v / R * 60 / TAU).toFixed(1) + ' rpm', '2.0 J', on ? 'over 2.0 J' : 'ignored']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- shielded-magnet wheel ---------- */
  M.shield = g => {
    const cx = 180, cy = 170, R = 88, N = 8, RUN = 0.9;
    let th = 0.2, om = RUN, still = 0;
    return {
      step(dt, on) {
        if (on) { om += (-1.4 * Math.sin(N * th) - 0.5 * om) * dt; still = Math.abs(om) < 0.03 ? still + dt : 0; }
        else { om += (RUN - om) * Math.min(1, 1.6 * dt); still = 0; }
        th += om * dt;
      },
      draw() {
        ground(g, 60, 372, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.2; L(g, cx, cy, cx - 56, 318); L(g, cx, cy, cx + 56, 318); L(g, 314, 184, 314, 318);
        disc(g, cx, cy, R - 24, null, C.ink, 1.6); g.lineWidth = 1.3; spokes(g, cx, cy, 10, R - 24, N, th);
        g.lineCap = 'butt';
        for (let k = 0; k < N; k++) {
          const a = th + k * TAU / N, ca = Math.cos(a), sa = Math.sin(a), P = r => [cx + r * ca, cy + r * sa];
          const i0 = P(R - 23), m = P(R - 8), o = P(R + 7);
          g.strokeStyle = C.ink; g.lineWidth = 13; L(g, i0[0], i0[1], o[0], o[1]);
          g.lineWidth = 10; g.strokeStyle = C.water; L(g, P(R - 21.5)[0], P(R - 21.5)[1], m[0], m[1]); g.strokeStyle = C.stamp; L(g, m[0], m[1], P(R + 5.5)[0], P(R + 5.5)[1]);
        }
        g.strokeStyle = C.ink; g.lineWidth = 9; g.beginPath(); g.arc(cx, cy, R + 19, 0.2, 1.17); g.stroke();
        g.strokeStyle = C.brass; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R + 19, 0.215, 1.155); g.stroke();
        g.lineCap = 'round';
        g.fillStyle = C.water; g.fillRect(288, 156, 27, 28); g.fillStyle = C.stamp; g.fillRect(315, 156, 27, 28);
        g.strokeStyle = C.ink; g.lineWidth = 1.8; g.strokeRect(288, 156, 54, 28);
        disc(g, cx, cy, 10, C.plate, C.ink, 2);
        label(g, 'fixed magnet', 316, 146, 'center'); label(g, 'shield', 296, 262);
      },
      read(on) { return [(Math.abs(om) < 0.005 ? 0 : om * 60 / TAU).toFixed(1) + ' rpm', '5 J', on ? '5 J' : 'blocked']; },
      stalled(on) { return on && still > 1; }
    };
  };

  /* ---------- wheel of opening floats ---------- */
  M.bfloat = g => {
    const d = drive(0.8, 2.5), cx = 210, cy = 182, R = 76, N = 8;
    let th = 0;
    return {
      step(dt, on) { d.step(dt, on); th += d.v * dt; },
      draw() {
        ground(g, 40, 380, 318);
        g.globalAlpha = 0.4; g.fillStyle = C.water; g.fillRect(72, 64, 276, 236); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, 72, 48, 72, 300); L(g, 72, 300, 348, 300); L(g, 348, 48, 348, 300);
        L(g, 100, 300, 100, 318); L(g, 320, 300, 320, 318);
        g.lineWidth = 2.2; L(g, cx, cy, cx, 300);
        disc(g, cx, cy, R, null, C.ink, 1.6); g.lineWidth = 1.2; spokes(g, cx, cy, 8, R, N, th);
        for (let k = 0; k < N; k++) {
          const a = th + k * TAU / N, open = clamp(0.5 - 0.9 * Math.cos(a), 0, 1), r = 8 + 9 * open, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
          disc(g, x, y, r, C.plate, C.ink, 1.5); disc(g, x, y, r * 0.55, null, C.soft, 1);
          disc(g, x + (r - 3) * Math.cos(a), y + (r - 3) * Math.sin(a), 2.6, C.brass, C.ink, 0.8);
        }
        disc(g, cx, cy, 8, C.plate, C.ink, 2);
        label(g, 'open', 84, 182); label(g, 'shut', 336, 182, 'right');
      },
      read(on) { return [(d.v * 60 / TAU).toFixed(1) + ' rpm', '6 J', on ? '6 J' : 'ignored']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- water as fuel ---------- */
  M.waterfuel = g => {
    const d = drive(1, 2.4), gas = mkPath([[95, 172], [95, 80], [250, 80], [250, 112]], false), wat = mkPath([[250, 190], [250, 308], [95, 308], [95, 290]], false);
    let th = 0, flow = 0, tb = 0;
    return {
      step(dt, on) { d.step(dt, on); th += 5 * d.v * dt; flow += 50 * d.v * dt; tb += d.v * dt; },
      draw() {
        const f = d.frac;
        for (const p of [gas, wat]) { g.strokeStyle = C.ink; g.lineWidth = 5.5; poly(g, p.pts); g.stroke(); g.strokeStyle = C.plate; g.lineWidth = 2.6; poly(g, p.pts); g.stroke(); }
        for (let q = flow % 18; q < gas.len; q += 18) { const p = gas.at(q); disc(g, p[0], p[1], 1.6, C.ink); }
        for (let q = flow % 22; q < wat.len; q += 22) { const p = wat.at(q); disc(g, p[0], p[1], 2.3, C.water); }
        g.strokeStyle = C.ink; g.lineWidth = 1.4; L(g, 215, 150, 75, 150); L(g, 75, 150, 75, 172); L(g, 115, 150, 115, 172);
        g.globalAlpha = 0.25 + 0.75 * f; for (let q = flow % 22; q < 140; q += 22) disc(g, 215 - q, 150, 2.5, C.brass, C.ink, 0.8); g.globalAlpha = 1;
        g.fillStyle = C.plate; g.fillRect(40, 172, 110, 118); g.globalAlpha = 0.45; g.fillStyle = C.water; g.fillRect(40, 192, 110, 98); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(40, 172, 110, 118); g.lineWidth = 3.2; L(g, 75, 172, 75, 268); L(g, 115, 172, 115, 268);
        if (f > 0.03) for (let k = 0; k < 6; k++) { const y = 264 - ((tb * 46 + k * 17) % 70); disc(g, (k % 2 ? 67 : 83) , y, 2.2, null, C.soft, 1); disc(g, (k % 2 ? 107 : 123), y + 6, 2.2, null, C.soft, 1); }
        g.fillStyle = C.plate; g.fillRect(215, 112, 130, 78); g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(215, 112, 130, 78);
        g.globalAlpha = f; poly(g, [[236, 174], [245, 150 - 5 * Math.sin(tb * 22)], [254, 174]], true); g.fillStyle = C.brass; g.fill(); g.globalAlpha = 1;
        disc(g, 308, 151, 27, null, C.ink, 2); g.lineWidth = 1.4; spokes(g, 308, 151, 5, 27, 4, th); disc(g, 308, 151, 5, C.plate, C.ink, 1.6);
        g.lineWidth = 1.4; L(g, 345, 130, 366, 130); disc(g, 378, 130, 11, C.plate, C.ink, 1.6); g.globalAlpha = 0.9 * f; disc(g, 378, 130, 9, C.brass); g.globalAlpha = 1;
        label(g, 'hydrogen', 172, 70, 'center'); label(g, 'water back', 172, 328, 'center'); label(g, 'engine, dynamo', 262, 104); label(g, 'cell', 48, 284);
      },
      read(on) { const P = 100 * d.frac; return [P.toFixed(0) + ' W', (P * (on ? 0.25 : 1.4)).toFixed(0) + ' W', (40 * d.frac).toFixed(0) + ' W']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- gears that feed themselves ---------- */
  M.gears = g => {
    const d = drive(1.2, 0.25), A = [112, 160], B = [224, 160];
    let th = 0, belt = 0;
    return {
      step(dt, on) { d.step(dt, on); th += d.v * dt; belt += d.v * dt * 16; },
      draw() {
        ground(g, 40, 380, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.4; L(g, A[0], A[1], A[0], 318); L(g, B[0], B[1], B[0], 318);
        g.lineWidth = 1.6; gear(g, B[0], B[1], 84, 42, -th / 3 - Math.PI / 42, C.plate); gear(g, A[0], A[1], 28, 14, th, C.plate);
        disc(g, B[0], B[1], 66, null, C.ink, 1); g.lineWidth = 1.4; spokes(g, B[0], B[1], 16, 66, 6, -th / 3);
        g.strokeStyle = C.soft; g.lineWidth = 1.8; g.setLineDash([7, 5]); g.lineDashOffset = -belt;
        L(g, A[0], A[1] - 16, B[0], B[1] + 16); L(g, A[0], A[1] + 16, B[0], B[1] - 16); g.setLineDash([]); g.lineDashOffset = 0;
        disc(g, A[0], A[1], 16, C.plate, C.ink, 1.8); disc(g, B[0], B[1], 16, C.plate, C.ink, 1.8);
        disc(g, A[0] + 10 * Math.cos(th), A[1] + 10 * Math.sin(th), 2.4, C.ink); disc(g, B[0] + 10 * Math.cos(-th / 3), B[1] + 10 * Math.sin(-th / 3), 2.4, C.ink);
        label(g, 'small gear', 36, 116); label(g, 'large gear', 300, 80); label(g, 'crossed belt', 168, 282, 'center');
      },
      read(on) { return [(d.v * 60 / TAU).toFixed(0) + ' rpm', (d.v * 20 / TAU).toFixed(0) + ' rpm', on ? 'locked' : 'x3 claimed']; },
      stalled() { return d.stalled(); }
    };
  };
