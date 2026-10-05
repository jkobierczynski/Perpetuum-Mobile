// Perpetuum Mobile. Copyright (C) 2026 Jurgen Kobierczynski.
// SPDX-License-Identifier: GPL-3.0-only
// Made with Claude Opus 5.5 Medium.
// Machines: the first twenty machines. Each M.name = g => ({ step, draw, read, stalled }).


  /* ---------- 1 · overbalanced wheel ---------- */
  M.wheel = g => {
    const cx = 210, cy = 158, R = 118, r0 = 28, r1 = R - 14, N = 12, K = 0.75, RUN = 0.9;
    let th = 0, om = RUN, still = 0, right = 5, left = 7;
    const s = new Array(N).fill(0.5);
    const pt = (i, t) => { const a = th + i * TAU / N + K * t * t, r = r0 + (r1 - r0) * t; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    function lowest(i) { let best = 0, by = -1e9; for (let k = 0; k <= 24; k++) { const y = pt(i, k / 24)[1]; if (y > by) { by = y; best = k / 24; } } return best; }
    for (let i = 0; i < N; i++) s[i] = lowest(i);
    return {
      step(dt, on) {
        let sum = 0; right = 0; left = 0;
        for (let i = 0; i < N; i++) {
          s[i] += clamp(lowest(i) - s[i], -2.4 * dt, 2.4 * dt);
          const x = pt(i, s[i])[0] - cx; sum += x / R; if (x > 1) right++; else if (x < -1) left++;
        }
        if (on) { om += (20 * sum / N - 0.3 * om) * dt; still = Math.abs(om) < 0.04 ? still + dt : 0; }
        else { om += (RUN - om) * Math.min(1, 1.6 * dt); still = 0; }
        th += om * dt;
      },
      draw() {
        g.strokeStyle = C.line; g.lineWidth = 1; g.setLineDash([16, 4, 2, 4]);
        L(g, cx - R - 26, cy, cx + R + 26, cy); L(g, cx, cy - R - 24, cx, cy + R + 30); g.setLineDash([]);
        g.strokeStyle = C.ink; g.lineWidth = 2.2; L(g, cx, cy, cx - 62, 318); L(g, cx, cy, cx + 62, 318);
        ground(g, cx - 112, cx + 112, 318);
        disc(g, cx, cy, R, null, C.ink, 2); disc(g, cx, cy, R - 6, null, C.ink, 1);
        g.strokeStyle = C.ink; g.lineWidth = 1.4;
        for (let i = 0; i < N; i++) { const pp = []; for (let k = 0; k <= 14; k++) pp.push(pt(i, k / 14)); poly(g, pp); g.stroke(); }
        for (let i = 0; i < N; i++) { const p = pt(i, s[i]); disc(g, p[0], p[1], 6.5, C.brass, C.ink, 1.3); }
        disc(g, cx, cy, 12, C.plate, C.ink, 2); disc(g, cx, cy, 2.5, C.ink);
        g.strokeStyle = C.soft; g.lineWidth = 1.3; g.beginPath(); g.arc(cx, cy, R + 13, -1.15, -0.6); g.stroke();
        const a = -0.55; arrow(g, cx + (R + 13) * Math.cos(a - 0.06), cy + (R + 13) * Math.sin(a - 0.06), cx + (R + 13) * Math.cos(a) - 0.5, cy + (R + 13) * Math.sin(a) + 1, 8);
      },
      read() { return [(Math.abs(om) < 0.005 ? 0 : om * 60 / TAU).toFixed(1) + ' rpm', right, left]; },
      stalled(on) { return on && still > 1.2; }
    };
  };

  /* ---------- 2 · self-blowing windmill ---------- */
  M.windmill = g => {
    const d = drive(1.5, 2.6), hub = [120, 170], cw = [355, 70], pv = [250, 170];
    const low = [pv[0] + 110 * Math.cos(0.12), pv[1] + 110 * Math.sin(0.12)];
    let th = 0, puff = 0;
    return {
      step(dt, on) { d.step(dt, on); th += d.v * dt; puff += d.v * dt * 26; },
      draw() {
        ground(g, 40, 392, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.2;
        L(g, hub[0], hub[1], hub[0], 318); L(g, 290, 176, 290, 318); L(g, 350, 183, 350, 318);
        L(g, cw[0], cw[1], 376, cw[1]); L(g, 376, cw[1], 376, 318);
        g.strokeStyle = C.soft; g.lineWidth = 1.1;
        L(g, hub[0] + 3.1, hub[1] + 7.4, cw[0] + 3.1, cw[1] + 7.4); L(g, hub[0] - 3.1, hub[1] - 7.4, cw[0] - 3.1, cw[1] - 7.4);
        // bellows, worked by the crank
        const pin = [cw[0] + 12 * Math.cos(th), cw[1] + 12 * Math.sin(th)];
        const al = Math.asin((40 - 12 * Math.sin(th)) / 110), tip = [pv[0] + 110 * Math.cos(al), pv[1] - 110 * Math.sin(al)];
        const body = [pv];
        for (let k = 0; k <= 6; k++) {
          const t = k / 6; let x = tip[0] + (low[0] - tip[0]) * t, y = tip[1] + (low[1] - tip[1]) * t;
          if (k % 2) { const dd = Math.hypot(pv[0] - x, pv[1] - y); x += (pv[0] - x) / dd * 10; y += (pv[1] - y) / dd * 10; }
          body.push([x, y]);
        }
        poly(g, body, true); g.fillStyle = C.plate; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.3; g.stroke();
        g.lineWidth = 3.4; L(g, pv[0], pv[1], tip[0], tip[1]); L(g, pv[0], pv[1], low[0], low[1]);
        g.lineWidth = 5; L(g, pv[0], pv[1], 216, 170);
        g.lineWidth = 1.6; L(g, pin[0], pin[1], tip[0], tip[1]);
        disc(g, cw[0], cw[1], 14, C.plate, C.ink, 1.8); disc(g, pin[0], pin[1], 3, C.ink);
        // the gust
        g.strokeStyle = C.soft; g.lineWidth = 1.6;
        for (let k = 0; k < 4; k++) {
          const u = ((puff + k * 19) % 76) / 76;
          g.globalAlpha = (1 - u) * d.frac; g.beginPath(); g.arc(222 - u * 70, 170, 12, Math.PI - 0.6, Math.PI + 0.6); g.stroke();
        }
        g.globalAlpha = 1;
        // sails
        for (let k = 0; k < 4; k++) {
          const a = th + k * Math.PI / 2, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
          const P = (al2, w) => [hub[0] + ux * al2 + nx * w, hub[1] + uy * al2 + ny * w];
          poly(g, [P(24, 0), P(80, 0), P(80, 20), P(24, 20)], true); g.fillStyle = C.plate; g.fill();
          g.strokeStyle = C.ink; g.lineWidth = 1.2; g.stroke();
          for (const q of [38, 52, 66]) { const p1 = P(q, 0), p2 = P(q, 20); L(g, p1[0], p1[1], p2[0], p2[1]); }
          g.lineWidth = 2.2; const e = P(80, 0); L(g, hub[0], hub[1], e[0], e[1]);
        }
        disc(g, hub[0], hub[1], 8, C.plate, C.ink, 2);
        label(g, 'bellows', 262, 208, 'right');
      },
      read(on) { return [(d.v * 60 / TAU).toFixed(1) + ' rpm', '100 J', on ? 'about 20 J' : '100 J']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- 3 · Stevin's wreath of spheres ---------- */
  M.stevin = g => {
    const pts = [[256.9, 65.9], [64.9, 225.9]];
    for (let i = 0; i <= 24; i++) { const t = i / 24, u = 1 - t; pts.push([u * u * 62 + 2 * u * t * 200 + t * t * 338, u * u * 232 + 2 * u * t * 372 + t * t * 232]); }
    pts.push([337.4, 228.9], [269.4, 68.9], [263, 62]);
    const path = mkPath(pts, true), n = 18, d = drive(46, 2.2);
    let s = 0, lng = 0, sht = 0;
    return {
      step(dt, on) { d.step(dt, on); s += d.v * dt; },
      draw() {
        poly(g, [[70, 232], [330, 232], [262, 72]], true);
        g.fillStyle = C.plate; g.fill(); g.globalAlpha = 0.07; g.fillStyle = C.ink; g.fill(); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 2; g.stroke();
        poly(g, path.pts); g.strokeStyle = C.soft; g.lineWidth = 1.2; g.stroke();
        lng = 0; sht = 0;
        for (let k = 0; k < n; k++) {
          const p = path.at(s + k * path.len / n); disc(g, p[0], p[1], 8, C.brass, C.ink, 1.3);
          if (p[1] < 226) { if (p[0] < 262) lng++; else sht++; }
        }
        label(g, 'long, gentle', 34, 128); label(g, 'short, steep', 308, 128);
      },
      read() { return [lng, sht, (d.v / 10).toFixed(1) + ' cm/s']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- 4 · Fludd's water screw ---------- */
  M.fludd = g => {
    const d = drive(1.3, 3), W = [300, 196], R = 62, A0 = [62, 300], A1 = [128, 78], nx = 0.958, ny = 0.285, hw = 13;
    let th = 0, ph = 0, flow = 0;
    return {
      step(dt, on) { d.step(dt, on); th -= d.v * dt; ph += d.v * dt * 3; flow += d.v * dt * 46; },
      draw() {
        const f = d.frac;
        g.globalAlpha = 0.4; g.fillStyle = C.water; g.fillRect(30, 292, 360, 26); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, 30, 278, 30, 318); L(g, 30, 318, 390, 318); L(g, 390, 318, 390, 278);
        g.lineWidth = 2.2; L(g, W[0], W[1], 272, 318); L(g, W[0], W[1], 328, 318);
        g.strokeStyle = C.soft; g.lineWidth = 1.1; L(g, 300, 188, 96, 183); L(g, 300, 204, 96, 199);
        // the screw
        poly(g, [[A0[0] - nx * hw, A0[1] - ny * hw], [A1[0] - nx * hw, A1[1] - ny * hw], [A1[0] + nx * hw, A1[1] + ny * hw], [A0[0] + nx * hw, A0[1] + ny * hw]], true);
        g.fillStyle = C.plate; g.fill(); g.globalAlpha = 0.3 * f; g.fillStyle = C.water; g.fill(); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.6; g.stroke();
        g.beginPath();
        for (let i = 0; i <= 90; i++) {
          const t = i / 90, o = hw * Math.sin(TAU * t * 9 - ph), x = A0[0] + (A1[0] - A0[0]) * t + nx * o, y = A0[1] + (A1[1] - A0[1]) * t + ny * o;
          i ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.lineWidth = 1.4; g.stroke();
        disc(g, 95, 191, 8, C.plate, C.ink, 1.6);
        // trough and falling water
        if (f > 0.02) {
          g.strokeStyle = C.water; g.lineWidth = 1 + 5 * f; L(g, 122, 92, 264, 102);
          g.lineWidth = 1 + 4 * f; g.setLineDash([7, 5]); g.lineDashOffset = -flow;
          L(g, 268, 108, 268, 144); L(g, 250, 236, 250, 292); g.setLineDash([]); g.lineDashOffset = 0;
        }
        g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, 112, 97, 270, 108); L(g, 112, 97, 112, 84);
        // the wheel
        disc(g, W[0], W[1], R, null, C.ink, 2); disc(g, W[0], W[1], R - 12, null, C.ink, 1);
        g.lineWidth = 1.3; spokes(g, W[0], W[1], 8, R - 12, 6, th); g.lineWidth = 2; spokes(g, W[0], W[1], R - 12, R, 12, th);
        disc(g, W[0], W[1], 8, C.plate, C.ink, 1.8);
        label(g, 'screw', 118, 250); label(g, 'trough', 180, 84);
      },
      read(on) { const fall = 60 * d.frac; return [(d.v * 60 / TAU).toFixed(1) + ' rpm', fall.toFixed(0) + ' L/min', (fall * (on ? 0.6 : 1)).toFixed(0) + ' L/min']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- 5 · Wilkins's magnet and ramp ---------- */
  M.wilkins = g => {
    const pts = [[60, 271.5], [265, 115]];
    for (let i = 0; i <= 20; i++) { const t = i / 20, u = 1 - t; pts.push([u * u * 268 + 2 * u * t * 250 + t * t * 66, u * u * 131 + 2 * u * t * 292 + t * t * 277]); }
    const path = mkPath(pts, true), upLen = Math.hypot(205, 156.5);
    let s = 40, e = 0, laps = 0, held = 0;
    const pos = () => e > 0 ? [265 + 0.795 * e, 115 - 0.607 * e] : path.at(s);
    return {
      step(dt, on) {
        if (e > 0) { e = on ? Math.min(30, e + 160 * dt) : Math.max(0, e - 220 * dt); held = on && e >= 30 ? held + dt : 0; return; }
        const v = s < upLen ? 70 + 120 * (s / upLen) : 150, ns = s + v * dt;
        if (on && s < upLen && ns >= upLen) { s = upLen; e = 0.01; return; }
        s = ns; if (s >= path.len) { s -= path.len; laps++; }
      },
      draw() {
        ground(g, 30, 392, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.2;
        L(g, 322, 110, 322, 318); L(g, 64, 278, 64, 318);
        L(g, 64, 278, 262, 126.9); L(g, 279, 113.9, 298, 99.4);
        g.beginPath(); g.moveTo(270, 141); g.quadraticCurveTo(250, 303, 56, 288); g.lineTo(50, 270); g.stroke();
        g.globalAlpha = 0.85; g.fillStyle = C.stamp; g.fillRect(298, 72, 24, 38); g.fillStyle = C.water; g.fillRect(322, 72, 24, 38); g.globalAlpha = 1;
        g.lineWidth = 1.8; g.strokeRect(298, 72, 48, 38);
        g.fillStyle = C.plate; g.textAlign = 'center'; g.fillText('N', 310, 95.5); g.fillText('S', 334, 95.5); g.textAlign = 'left';
        const p = pos(); disc(g, p[0], p[1], 8, C.soft, C.ink, 1.5);
        label(g, 'lodestone', 322, 62, 'center'); label(g, 'hole', 252, 104, 'right'); label(g, 'iron ball', 96, 300);
      },
      read() {
        const p = pos();
        return [laps, e >= 30 ? 'held by magnet' : e > 0 ? 'at the hole' : s < upLen ? 'climbing' : 'rolling back', Math.max(0, (286 - p[1]) / 8).toFixed(0) + ' cm'];
      },
      stalled(on) { return on && held > 0.5; }
    };
  };

  /* ---------- 6 · Boyle's self-filling flask ---------- */
  M.boyle = g => {
    const tube = mkPath([[160, 236], [160, 285], [310, 285], [310, 58], [215, 58], [215, 74]], false), LEVEL = 372, FULL = tube.len;
    let fill = FULL, drip = 0, still = 0;
    return {
      step(dt, on) {
        fill = on ? Math.max(LEVEL, fill - 70 * dt) : Math.min(FULL, fill + 70 * dt);
        if (fill >= FULL) drip += dt * 60;
        still = on && fill <= LEVEL ? still + dt : 0;
      },
      draw() {
        ground(g, 60, 372, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2; L(g, 200, 292, 200, 318); L(g, 280, 292, 280, 318);
        g.lineWidth = 13; poly(g, tube.pts); g.stroke();
        g.strokeStyle = C.plate; g.lineWidth = 9.5; poly(g, tube.pts); g.stroke();
        g.lineCap = 'butt'; g.strokeStyle = C.water; g.globalAlpha = 0.75; tube.trace(g, 0, fill); g.globalAlpha = 1;
        if (fill >= FULL) { g.lineWidth = 3; g.setLineDash([6, 5]); g.lineDashOffset = -drip; L(g, 215, 80, 215, 113); g.setLineDash([]); g.lineDashOffset = 0; }
        g.lineCap = 'round';
        g.beginPath(); g.moveTo(85, 90); g.quadraticCurveTo(95, 215, 153.5, 236); g.lineTo(166.5, 236); g.quadraticCurveTo(225, 215, 235, 90);
        g.save(); g.clip(); g.fillStyle = C.plate; g.fillRect(80, 85, 160, 156);
        g.globalAlpha = 0.6; g.fillStyle = C.water; g.fillRect(80, 112, 160, 130); g.restore(); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 2;
        g.beginPath(); g.moveTo(85, 90); g.quadraticCurveTo(95, 215, 153.5, 236); g.moveTo(166.5, 236); g.quadraticCurveTo(225, 215, 235, 90); g.stroke();
        g.strokeStyle = C.soft; g.lineWidth = 1; g.setLineDash([4, 4]); L(g, 240, 112, 336, 112); g.setLineDash([]);
        label(g, 'wide bowl', 85, 80); label(g, 'thin tube', 322, 180); label(g, 'same level', 338, 116);
      },
      read() {
        const y = fill <= 426 ? 285 - (fill - 199) : 58;
        return ['17.7 cm', ((236 - y) / 7).toFixed(1) + ' cm', fill >= FULL ? 'pouring' : 'none'];
      },
      stalled() { return still > 0.6; }
    };
  };

  /* ---------- 7 · Congreve's sponge band ---------- */
  M.congreve = g => {
    const rol = [[150, 74], [150, 236], [318, 236]], path = mkPath(beltPts(rol, 19), true), d = drive(40, 2.2);
    let s = 0;
    return {
      step(dt, on) { d.step(dt, on); s += d.v * dt; },
      draw() {
        g.globalAlpha = 0.4; g.fillStyle = C.water; g.fillRect(50, 222, 340, 84); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, 50, 204, 50, 306); L(g, 50, 306, 390, 306); L(g, 390, 306, 390, 204);
        g.lineWidth = 12; poly(g, path.pts); g.stroke();
        g.strokeStyle = C.plate; g.lineWidth = 9; poly(g, path.pts); g.stroke();
        g.strokeStyle = C.water; g.globalAlpha = 0.8; g.lineCap = 'butt';
        for (let q = 0; q < path.len; q += 4) { const a = path.at(q), b = path.at(q + 4.6); if (a[0] < 141 || a[1] > 224) L(g, a[0], a[1], b[0], b[1]); }
        g.globalAlpha = 1; g.lineCap = 'round';
        for (let q = s % 16; q < path.len; q += 16) { const p = path.at(q); disc(g, p[0], p[1], 1.2, C.ink); }
        for (let q = s % 43; q < path.len; q += 43) {
          const p = path.at(q), dx = p[0] - 206, dy = p[1] - 182, dd = Math.hypot(dx, dy), x = p[0] + dx / dd * 11, y = p[1] + dy / dd * 11;
          g.fillStyle = C.brass; g.fillRect(x - 4.5, y - 4.5, 9, 9); g.strokeStyle = C.ink; g.lineWidth = 1.2; g.strokeRect(x - 4.5, y - 4.5, 9, 9);
        }
        for (const c of rol) { disc(g, c[0], c[1], 13, C.plate, C.ink, 1.8); g.lineWidth = 1.2; spokes(g, c[0], c[1], 0, 13, 2, -s / 19); }
        label(g, 'wet,', 62, 140); label(g, 'heavy', 62, 156); label(g, 'squeezed dry', 262, 112);
      },
      read(on) { return [(d.v / 10).toFixed(1) + ' cm/s', '12 N', on ? '12 N' : '0 N']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- 8 · float belt ---------- */
  M.floats = g => {
    const path = mkPath(beltPts([[205, 58], [205, 266]], 38), true), d = drive(45, 2), n = 12;
    let s = 0;
    return {
      step(dt, on) { d.step(dt, on); s += d.v * dt; },
      draw() {
        ground(g, 60, 372, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.2; L(g, 205, 58, 205, 318); L(g, 296, 240, 296, 318);
        g.globalAlpha = 0.4; g.fillStyle = C.water; g.fillRect(222, 106, 74, 134); g.globalAlpha = 1;
        g.lineWidth = 1.8; L(g, 222, 96, 222, 240); L(g, 222, 240, 296, 240); L(g, 296, 96, 296, 240);
        g.fillStyle = C.ink; g.fillRect(231, 236, 24, 8);
        for (const cy of [58, 266]) { disc(g, 205, cy, 30, C.plate, C.ink, 1.8); g.lineWidth = 1.2; spokes(g, 205, cy, 6, 30, 4, -s / 38); disc(g, 205, cy, 6, C.plate, C.ink, 1.6); }
        poly(g, path.pts); g.strokeStyle = C.soft; g.lineWidth = 1.2; g.stroke();
        for (let k = 0; k < n; k++) { const p = path.at(s + k * path.len / n); disc(g, p[0], p[1], 8.5, C.plate, C.ink, 1.5); }
        label(g, 'air', 148, 166, 'right'); label(g, 'water', 306, 166); label(g, 'seal', 262, 258);
      },
      read(on) { return [(d.v / 10).toFixed(1) + ' cm/s', '14.7 J', on ? '14.7 J' : '0.0 J']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- 9 · drum through a tank wall ---------- */
  M.drum = g => {
    const d = drive(0.9, 2.5), cx = 200, cy = 185, R = 85;
    let th = 0;
    return {
      step(dt, on) { d.step(dt, on); th -= d.v * dt; },
      draw(on) {
        ground(g, 40, 400, 318);
        g.globalAlpha = 0.4; g.fillStyle = C.water; g.fillRect(200, 72, 188, 228); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 2.2; L(g, cx, cy, 140, 318); L(g, cx, cy, 186, 318);
        g.lineWidth = 1.8; L(g, 200, 50, 200, 104); L(g, 200, 266, 200, 300); L(g, 200, 300, 388, 300); L(g, 388, 50, 388, 300);
        L(g, 230, 300, 230, 318); L(g, 370, 300, 370, 318);
        disc(g, cx, cy, R, C.plate, C.ink, 2); disc(g, cx, cy, R - 10, null, C.ink, 1);
        g.lineWidth = 1.3; spokes(g, cx, cy, 12, R - 10, 6, th);
        for (let k = 0; k < 12; k++) { const a = th + k * TAU / 12; disc(g, cx + (R - 5) * Math.cos(a), cy + (R - 5) * Math.sin(a), 2, C.ink); }
        disc(g, cx, cy, 12, C.plate, C.ink, 2); disc(g, cx, cy, 2.5, C.ink);
        g.fillStyle = C.ink; g.fillRect(194, 96, 12, 8); g.fillRect(194, 266, 12, 8);
        if (on) {
          g.strokeStyle = C.stamp;
          for (const deg of [-60, -30, 0, 30, 60]) {
            const a = deg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), len = 12 + (cy + R * sa - 72) * 0.16;
            g.lineWidth = 1.8; arrow(g, cx + (R + 6 + len) * ca, cy + (R + 6 + len) * sa, cx + (R + 4) * ca, cy + (R + 4) * sa, 8);
            g.lineWidth = 1; g.setLineDash([3, 4]); L(g, cx + R * ca, cy + R * sa, cx + 14 * ca, cy + 14 * sa); g.setLineDash([]);
          }
        }
        label(g, 'air', 70, 110); label(g, 'water', 378, 290, 'right');
      },
      read(on) { return [(d.v * 60 / TAU).toFixed(1) + ' rpm', 'strong', on ? 'none' : 'claimed']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- 10 · motor and dynamo ---------- */
  M.motor = g => {
    const d = drive(1, 2.2), wire = mkPath([[305, 170], [305, 80], [115, 80], [115, 170]], false);
    let th = 0, flow = 0;
    return {
      step(dt, on) { d.step(dt, on); th += 6 * d.v * dt; flow += 70 * d.v * dt; },
      draw() {
        const f = d.frac;
        ground(g, 40, 380, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.2; L(g, 40, 292, 380, 292); L(g, 70, 292, 70, 318); L(g, 350, 292, 350, 318);
        g.lineWidth = 1.4; poly(g, wire.pts); g.stroke();
        g.globalAlpha = 0.25 + 0.75 * f;
        for (let q = flow % 24; q < wire.len; q += 24) { const p = wire.at(q); disc(g, p[0], p[1], 2.6, C.brass, C.ink, 0.8); }
        g.globalAlpha = 1;
        disc(g, 210, 80, 14, C.plate, C.ink, 1.6);
        g.globalAlpha = 0.9 * f; disc(g, 210, 80, 12, C.brass);
        g.strokeStyle = C.brass; g.lineWidth = 1.8; g.globalAlpha = f; spokes(g, 210, 80, 19, 26, 8, 0); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.2; poly(g, [[203, 84], [207, 76], [210, 84], [213, 76], [217, 84]]); g.stroke();
        for (const cx of [115, 305]) {
          poly(g, [[cx - 36, 292], [cx - 22, 262], [cx + 22, 262], [cx + 36, 292]], true); g.fillStyle = C.plate; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 2; g.stroke();
          disc(g, cx, 222, 52, C.plate, C.ink, 2); disc(g, cx, 222, 41, null, C.ink, 1); disc(g, cx, 222, 31, null, C.ink, 1.4);
          g.lineWidth = 3; spokes(g, cx, 222, 14, 31, 6, th);
          disc(g, cx, 222, 14, C.plate, C.ink, 1.8); disc(g, cx + 8 * Math.cos(th), 222 + 8 * Math.sin(th), 2.2, C.ink);
        }
        g.strokeStyle = C.soft; g.lineWidth = 1.3; L(g, 115, 208, 305, 208); L(g, 115, 236, 305, 236);
        label(g, 'motor', 115, 310, 'center'); label(g, 'dynamo', 305, 310, 'center'); label(g, 'lamp', 210, 44, 'center');
      },
      read(on) { const P = 100 * d.frac; return [P.toFixed(0) + ' W', (P * (on ? 0.81 : 1.4)).toFixed(0) + ' W', (40 * d.frac).toFixed(0) + ' W']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- 11 · magnet on a stick ---------- */
  M.cart = g => {
    const d = drive(1, 3);
    let x = 0, th = 0;
    return {
      step(dt, on) { d.step(dt, on); x += 80 * d.v * dt; th += 80 * d.v * dt / 15; },
      draw(on) {
        g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, 20, 270, 400, 270);
        g.lineWidth = 1; for (let k = 0; k < 11; k++) { const gx = 24 + (((k * 36 - x) % 396) + 396) % 396; L(g, gx, 270, gx - 6, 277); }
        g.strokeStyle = C.soft; g.lineWidth = 1.4;
        for (let k = 0; k < 3; k++) { const px = (((k * 150 - x * 0.9) % 450) + 450) % 450 - 15; L(g, px, 270, px, 240); disc(g, px, 238, 3, C.plate, C.soft, 1.4); }
        g.globalAlpha = d.frac; L(g, 52, 214, 96, 214); L(g, 66, 226, 100, 226); L(g, 58, 238, 92, 238); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 3.2; poly(g, [[180, 205], [180, 150], [318, 150], [318, 196]]); g.stroke();
        g.fillStyle = C.plate; g.fillRect(110, 205, 140, 40); g.lineWidth = 2; g.strokeRect(110, 205, 140, 40);
        g.fillStyle = C.ink; g.fillRect(250, 195, 8, 50);
        for (const wx of [140, 220]) { disc(g, wx, 255, 15, C.plate, C.ink, 2); g.lineWidth = 1.3; spokes(g, wx, 255, 3, 15, 4, th); disc(g, wx, 255, 3, C.ink); }
        g.fillStyle = C.ink; g.fillRect(322, 196, 9, 44);
        g.globalAlpha = 0.85; g.fillStyle = C.stamp; g.fillRect(290, 196, 32, 12); g.fillStyle = C.water; g.fillRect(290, 228, 32, 12); g.globalAlpha = 1;
        g.lineWidth = 1.4; g.strokeStyle = C.ink; g.strokeRect(290, 196, 32, 12); g.strokeRect(290, 228, 32, 12);
        g.strokeStyle = C.soft; g.lineWidth = 1; g.setLineDash([2, 4]); L(g, 260, 202, 288, 202); L(g, 260, 218, 300, 218); L(g, 260, 234, 288, 234); g.setLineDash([]);
        if (on) {
          g.strokeStyle = C.stamp; g.lineWidth = 2.2; arrow(g, 258, 184, 292, 184, 9); arrow(g, 324, 252, 290, 252, 9);
          g.fillStyle = C.stamp; g.textAlign = 'right'; g.fillText('30 N forward', 250, 188); g.textAlign = 'left'; g.fillText('30 N back', 330, 256);
        }
        label(g, 'iron cart', 180, 230, 'center'); label(g, 'magnet', 340, 222);
      },
      read(on) { return [(18 * d.frac).toFixed(1) + ' km/h', '30 N', on ? '30 N' : 'ignored']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- 12 · Maxwell's demon ---------- */
  M.demon = g => {
    const X0 = 30, X1 = 390, Y0 = 56, Y1 = 262, WX = 210, D0 = 119, D1 = 199, P = [];
    for (let i = 0; i < 40; i++) {
      const fast = i % 2 === 0, sp = fast ? 125 + Math.random() * 45 : 55 + Math.random() * 35, a = Math.random() * TAU;
      let x = X0 + 8 + Math.random() * (X1 - X0 - 16); if (Math.abs(x - WX) < 8) x += 20;
      P.push({ x, y: Y0 + 8 + Math.random() * (Y1 - Y0 - 16), vx: sp * Math.cos(a), vy: sp * Math.sin(a), fast });
    }
    let open = 0, tOn = 0;
    return {
      step(dt, on) {
        tOn = on ? tOn + dt : 0; open = Math.max(0, open - dt);
        for (const p of P) {
          const px = p.x; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < X0 + 4) { p.x = X0 + 4; p.vx = Math.abs(p.vx); } if (p.x > X1 - 4) { p.x = X1 - 4; p.vx = -Math.abs(p.vx); }
          if (p.y < Y0 + 4) { p.y = Y0 + 4; p.vy = Math.abs(p.vy); } if (p.y > Y1 - 4) { p.y = Y1 - 4; p.vy = -Math.abs(p.vy); }
          if ((px - WX) * (p.x - WX) <= 0) {
            const ok = p.y > D0 + 3 && p.y < D1 - 3 && (on || (p.vx > 0 ? p.fast : !p.fast));
            if (ok) { if (!on) open = 0.18; } else { p.x = px; p.vx = -p.vx; }
          }
        }
      },
      draw(on) {
        g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(X0, Y0, X1 - X0, Y1 - Y0);
        g.lineWidth = 3.4; L(g, WX, Y0, WX, D0); L(g, WX, D1, WX, Y1);
        if (on || open > 0) { g.strokeStyle = C.soft; g.lineWidth = 2.2; L(g, WX, D0, WX + 30, D0 + 22); }
        else { g.strokeStyle = C.brass; g.lineWidth = 2.6; L(g, WX, D0, WX, D1); }
        for (const p of P) disc(g, p.x, p.y, 3, p.fast ? C.stamp : C.water);
        // the demon, perched on the wall
        g.strokeStyle = C.ink; g.lineWidth = 1.6; L(g, WX - 5, 30, WX - 9, 22); L(g, WX + 5, 30, WX + 9, 22);
        disc(g, WX, 38, 10, C.plate, C.ink, 1.8);
        if (on) { g.lineWidth = 1.6; L(g, WX - 5, 38, WX + 5, 38); } else disc(g, WX + (open > 0 ? 3 : -2), 39, 2.6, C.ink);
        label(g, on ? 'door left open' : 'slow ones collect', X0, Y0 - 10);
        label(g, on ? 'the sides even out' : 'fast ones collect', X1, Y0 - 10, 'right');
        if (!QUIET) { disc(g, 36, 284, 3, C.stamp); label(g, 'fast', 44, 288); disc(g, 96, 284, 3, C.water); label(g, 'slow', 104, 288); }
      },
      read(on) {
        let l = 0, nl = 0, r = 0, nr = 0;
        for (const p of P) { const e = p.vx * p.vx + p.vy * p.vy; if (p.x < WX) { l += e; nl++; } else { r += e; nr++; } }
        const all = (l + r) / P.length, f = (e, n) => n ? Math.round(300 * e / n / all) + ' K' : 'empty';
        return [f(l, nl), f(r, nr), on ? 'left open' : 'sorting'];
      },
      stalled(on) { return on && tOn > 9; }
    };
  };

  /* ---------- 13 · Gamgee's zeromotor ---------- */
  M.zero = g => {
    const vap = mkPath([[90, 150], [90, 80], [215, 80]], false);
    const rp = [[228, 100], [228, 150], [190, 165], [270, 185], [190, 205], [270, 225], [190, 245], [228, 262], [228, 308], [90, 308], [90, 290]];
    const ret = mkPath(rp, false), condLen = mkPath(rp.slice(0, 8), false).len;
    let pe = 1, om = 2.6, th = 0, flow = 0, tb = 0;
    return {
      step(dt, on) {
        pe += ((on ? 4.3 : 1) - pe) * Math.min(1, (on ? 0.7 : 1.5) * dt);
        om += (2.6 * (4.3 - pe) / 3.3 - om) * Math.min(1, 2 * dt);
        th += om * dt; flow += om * 18 * dt; tb += om * dt;
      },
      draw() {
        const f = om / 2.6;
        g.strokeStyle = C.stamp; g.lineWidth = 1.6; g.globalAlpha = 0.3 + 0.7 * f;
        for (const y0 of [190, 225, 260]) {
          g.beginPath(); for (let i = 0; i <= 10; i++) { const x = 6 + i * 2, y = y0 + 3 * Math.sin(i * 1.2 - tb * 3); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
          arrow(g, 26, y0, 36, y0, 7);
        }
        g.globalAlpha = 1;
        for (const pth of [vap, ret]) { g.strokeStyle = C.ink; g.lineWidth = 5.5; poly(g, pth.pts); g.stroke(); g.strokeStyle = C.plate; g.lineWidth = 2.6; poly(g, pth.pts); g.stroke(); }
        rr(g, 40, 150, 100, 140, 12); g.fillStyle = C.plate; g.fill();
        g.save(); g.clip(); g.globalAlpha = 0.5; g.fillStyle = C.water; g.fillRect(40, 215, 100, 80); g.restore(); g.globalAlpha = 1;
        rr(g, 40, 150, 100, 140, 12); g.strokeStyle = C.ink; g.lineWidth = 2; g.stroke();
        if (f > 0.03) for (let k = 0; k < 6; k++) disc(g, 55 + k * 14, 284 - ((tb * 40 + k * 23) % 66), 2.4, null, C.soft, 1.1);
        for (let q = flow % 20; q < vap.len; q += 20) { const p = vap.at(q); disc(g, p[0], p[1], 1.5, C.ink); }
        for (let q = flow % 20; q < ret.len; q += 20) { const p = ret.at(q); q > condLen ? disc(g, p[0], p[1], 2.3, C.water) : disc(g, p[0], p[1], 1.5, C.ink); }
        // cylinder, piston, flywheel
        g.strokeStyle = C.ink; g.lineWidth = 2; L(g, 368, 80, 350, 130); L(g, 368, 80, 386, 130); L(g, 338, 130, 398, 130);
        g.fillStyle = C.plate; g.fillRect(215, 60, 63, 40); g.strokeRect(215, 60, 63, 40);
        const cxp = 368 + 16 * Math.cos(th), cyp = 80 + 16 * Math.sin(th), xp = cxp - Math.sqrt(4900 - (16 * Math.sin(th)) ** 2);
        g.fillStyle = C.ink; g.fillRect(xp - 54, 62, 8, 36);
        g.lineWidth = 2.6; L(g, xp - 50, 80, xp, 80); L(g, xp, 80, cxp, cyp);
        disc(g, xp, 80, 3.5, C.plate, C.ink, 1.6);
        disc(g, 368, 80, 30, null, C.ink, 2.4); disc(g, 368, 80, 25, null, C.ink, 1);
        g.lineWidth = 1.4; spokes(g, 368, 80, 5, 25, 4, th); disc(g, 368, 80, 5, C.plate, C.ink, 1.6); disc(g, cxp, cyp, 3, C.ink);
        label(g, 'ammonia', 90, 262, 'center'); label(g, 'condenser', 282, 209);
        label(g, '4.3 bar', 100, 132); label(g, pe.toFixed(1) + ' bar', 238, 132);
        label(g, 'heat in from the sea, 0 °C', 8, 332);
      },
      read() { return ['4.3 bar', pe.toFixed(1) + ' bar', (om * 60 / TAU * 4).toFixed(0) + ' rpm']; },
      stalled(on) { return on && om < 0.07; }
    };
  };

  /* ---------- 14 · sea-heat steamer ---------- */
  M.ship = g => {
    const d = drive(1, 3.5), ice = [{ x: 50 }], Y = 215;
    let x = 0, since = 0, count = 1;
    return {
      step(dt, on) {
        d.step(dt, on); const dx = 60 * d.v * dt; x += dx; since += dx;
        for (const b of ice) b.x -= dx;
        while (ice.length && ice[0].x < -20) ice.shift();
        if (since > 58) { since = 0; ice.push({ x: 108 }); count++; }
      },
      draw() {
        g.strokeStyle = C.ink;
        g.lineWidth = 1.6; L(g, 290, 188, 290, 136); L(g, 290, 142, 232, 132);
        g.fillStyle = C.plate; g.fillRect(210, 128, 18, 34); g.strokeRect(210, 128, 18, 34); g.fillStyle = C.ink; g.fillRect(210, 134, 18, 5);
        g.fillStyle = C.plate; g.fillRect(186, 160, 70, 28); g.lineWidth = 1.8; g.strokeRect(186, 160, 70, 28);
        for (const px of [200, 221, 242]) disc(g, px, 174, 3.5, null, C.ink, 1.2);
        poly(g, [[118, 188], [338, 188], [306, 232], [134, 232]], true); g.fillStyle = C.plate; g.fill(); g.lineWidth = 2; g.stroke();
        const wave = xx => Y + 3 * Math.sin((xx + x) * 0.07) + 1.5 * Math.sin((xx + x * 1.4) * 0.19);
        g.beginPath(); g.moveTo(0, 340); for (let xx = 0; xx <= 420; xx += 6) g.lineTo(xx, wave(xx)); g.lineTo(420, 340); g.closePath();
        g.globalAlpha = 0.45; g.fillStyle = C.water; g.fill(); g.globalAlpha = 1;
        g.beginPath(); for (let xx = 0; xx <= 420; xx += 6) xx ? g.lineTo(xx, wave(xx)) : g.moveTo(xx, wave(xx));
        g.strokeStyle = C.soft; g.lineWidth = 1.4; g.stroke();
        for (const b of ice) { const by = wave(b.x) - 6; g.fillStyle = C.plate; g.fillRect(b.x - 7, by, 14, 12); g.strokeStyle = C.ink; g.lineWidth = 1.3; g.strokeRect(b.x - 7, by, 14, 12); }
        g.strokeStyle = C.soft; g.lineWidth = 1.2; g.globalAlpha = d.frac; g.setLineDash([5, 5]); g.lineDashOffset = x;
        L(g, 92, 226, 128, 226); L(g, 100, 234, 130, 234); g.setLineDash([]); g.lineDashOffset = 0; g.globalAlpha = 1;
        label(g, 'ice', 60, 190, 'center'); label(g, 'one reservoir: the sea', 16, 306);
      },
      read() { return [(12 * d.frac).toFixed(1) + ' kn', (5 * d.frac).toFixed(1) + ' MW', count]; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- 15 · Brownian ratchet ---------- */
  M.ratchet = g => {
    const A = { x: 22, y: 30, w: 166, h: 166 }, B = { x: 232, y: 30, w: 166, h: 166 };
    const pc = { x: 105, y: 113 }, rc = { x: 315, y: 113 };
    const VL = 54, Ro = 46, Ri = 36, NT = 12, tooth = TAU / NT, drum = 11;
    const PA = -0.9, pivot = { x: 290, y: 44 }, FLOOR = 318, HMAX = 88;
    let th = PA + 0.01, om = 0, lockU = 0, lastU = 0, fwd = 0, back = 0, lifted = 0;
    let th0 = th, h = 0, bounce = 0, tOn = 0, stuck = false;
    const P = [];
    for (let i = 0; i < 44; i++) {
      const a = Math.random() * TAU, sp = 55 + Math.random() * 45;
      P.push({ x: A.x + 8 + Math.random() * (A.w - 16), y: A.y + 8 + Math.random() * (A.h - 16), vx: sp * Math.cos(a), vy: sp * Math.sin(a) });
    }
    return {
      set(on) { tOn = 0; fwd = 0; back = 0; stuck = false; lockU = Math.floor((th - PA) / tooth); },
      step(dt, on) {
        om += -4 * om * dt + 6.5 * Math.sqrt(dt) * gauss();     // the paddle, buffeted evenly from both sides
        if (on && h > 0) om -= 5 * dt;                        // the load pulls back whenever the pawl lets go
        let nth = th + om * dt;
        const u = (nth - PA) / tooth;
        if (!on) {
          if (u < lockU) { nth = lockU * tooth + PA; om = Math.abs(om) * 0.2; } else lockU = Math.floor(u);
          bounce *= Math.max(0, 1 - 12 * dt);
        } else { tOn += dt; bounce += -7 * bounce * dt + 16 * Math.sqrt(dt) * gauss(); }
        th = nth;
        const iu = Math.floor((th - PA) / tooth + 1e-9);
        if (iu > lastU) fwd += iu - lastU; else if (iu < lastU) back += lastU - iu;
        lastU = iu;
        h = drum * (th - th0);
        if (h < 0) { th0 = th; h = 0; }
        if (h >= HMAX) { if (!on) { lifted++; th0 = th; h = 0; } else { th0 = th - HMAX / drum; h = HMAX; } }
        for (const p of P) {
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < A.x + 4) { p.x = A.x + 4; p.vx = Math.abs(p.vx); } if (p.x > A.x + A.w - 4) { p.x = A.x + A.w - 4; p.vx = -Math.abs(p.vx); }
          if (p.y < A.y + 4) { p.y = A.y + 4; p.vy = Math.abs(p.vy); } if (p.y > A.y + A.h - 4) { p.y = A.y + A.h - 4; p.vy = -Math.abs(p.vy); }
          const dx = p.x - pc.x, dy = p.y - pc.y;
          if (dx * dx + dy * dy < (VL + 5) * (VL + 5)) {
            for (let k = 0; k < 4; k++) {
              const a = th + k * Math.PI / 2, ux = Math.cos(a), uy = Math.sin(a);
              const al = dx * ux + dy * uy; if (al < 4 || al > VL + 2) continue;
              const dd = -dx * uy + dy * ux; if (Math.abs(dd) >= 4) continue;
              const rel = -p.vx * uy + p.vy * ux - om * al;
              if (dd * rel < 0) { p.vx += -2 * rel * -uy; p.vy += -2 * rel * ux; }
              const push = (dd < 0 ? -4 : 4) - dd; p.x += push * -uy; p.y += push * ux;
            }
          }
          const sp = Math.hypot(p.vx, p.vy), want = clamp(sp, 50, 110);
          if (sp > 0 && sp !== want) { p.vx *= want / sp; p.vy *= want / sp; }
        }
      },
      draw(on) {
        g.strokeStyle = C.soft; g.lineWidth = 1.1; L(g, pc.x, pc.y - 8, rc.x, rc.y - 8); L(g, pc.x, pc.y + 8, rc.x, rc.y + 8);
        g.strokeStyle = C.ink; g.lineWidth = 1.8; g.strokeRect(A.x, A.y, A.w, A.h); g.strokeRect(B.x, B.y, B.w, B.h);
        for (const p of P) disc(g, p.x, p.y, 2.4, C.soft);
        g.strokeStyle = C.ink; g.lineWidth = 3.2; spokes(g, pc.x, pc.y, 8, VL, 4, th);
        disc(g, pc.x, pc.y, 8, C.plate, C.ink, 1.8);
        g.beginPath();
        for (let k = 0; k < NT; k++) {
          const a0 = th + k * tooth, a1 = a0 + tooth, x0 = rc.x + Ro * Math.cos(a0), y0 = rc.y + Ro * Math.sin(a0);
          k ? g.lineTo(x0, y0) : g.moveTo(x0, y0); g.lineTo(rc.x + Ri * Math.cos(a1), rc.y + Ri * Math.sin(a1));
        }
        g.closePath(); g.fillStyle = C.plate; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.7; g.stroke();
        disc(g, rc.x + 24 * Math.cos(th), rc.y + 24 * Math.sin(th), 3, C.ink);
        disc(g, rc.x, rc.y, drum, C.plate, C.ink, 1.8); disc(g, rc.x, rc.y, 2.2, C.ink);
        let f = ((PA - th) / tooth) % 1; if (f < 0) f += 1;
        const rp = Ro - (Ro - Ri) * f + Math.min(11, Math.abs(bounce));
        g.strokeStyle = C.ink; g.lineWidth = 3.4; L(g, pivot.x, pivot.y, rc.x + rp * Math.cos(PA), rc.y + rp * Math.sin(PA));
        disc(g, pivot.x, pivot.y, 4.5, C.plate, C.ink, 1.6);
        const wx = rc.x - drum, wb = FLOOR - h;
        g.strokeStyle = C.ink; g.lineWidth = 1.1; L(g, wx, rc.y, wx, wb - 16);
        g.fillStyle = C.brass; g.fillRect(wx - 12, wb - 16, 24, 16); g.lineWidth = 1.3; g.strokeRect(wx - 12, wb - 16, 24, 16);
        ground(g, B.x, B.x + B.w, FLOOR);
        g.strokeStyle = C.soft; g.lineWidth = 1; L(g, wx - 26, FLOOR, wx - 26, FLOOR - HMAX);
        for (let y = 0; y <= HMAX; y += 11) L(g, wx - 26, FLOOR - y, wx - (y % 44 ? 31 : 35), FLOOR - y);
        label(g, 'gas at temperature T', A.x, A.y - 9);
        label(g, on ? 'pawl also at T: slips' : 'pawl never slips', B.x, B.y - 9);
        label(g, 'load', wx + 20, FLOOR - 8);
      },
      read() { return [fwd, back, lifted]; },
      stalled(on) { if (on && tOn > 4 && h < 8) stuck = true; return on && stuck; }
    };
  };

  /* ---------- 16 · noise rectifier ---------- */
  M.diode = g => {
    const loop = mkPath([[80, 80], [340, 80], [340, 250], [80, 250]], true), tr = new Array(64).fill(0);
    let off = 0, q = 0, fwd = 0, back = 0, tOn = 0, nz = 0, acc = 0;
    return {
      set() { fwd = 0; back = 0; },
      step(dt, on) {
        tOn = on ? tOn + dt : 0;
        nz += -8 * nz * dt + 4 * Math.sqrt(dt) * gauss();
        const i = on ? nz : Math.max(0, nz);
        off += i * 60 * dt; if (i > 0) fwd += i * dt * 40; else back -= i * dt * 40;
        q += on ? (i * 40 - q * 1.5) * dt : i * dt * 40;
        acc += dt; if (acc > 0.04) { acc = 0; tr.push(i); tr.shift(); }
      },
      draw() {
        g.strokeStyle = C.ink; g.lineWidth = 1.6; g.strokeRect(80, 80, 260, 170);
        g.fillStyle = C.plate; g.fillRect(70, 118, 20, 94); g.fillRect(180, 68, 60, 24); g.fillRect(330, 157, 20, 16);
        const z = [[80, 118]]; for (let k = 0; k < 8; k++) z.push([80 + (k % 2 ? -8 : 8), 124 + k * 11.7]); z.push([80, 212]);
        poly(g, z); g.stroke();
        poly(g, [[192, 68], [192, 92], [226, 80]], true); g.fillStyle = C.plate; g.fill(); g.lineWidth = 2; g.stroke();
        L(g, 226, 67, 226, 93); g.lineWidth = 1.6; L(g, 180, 80, 192, 80); L(g, 226, 80, 240, 80);
        g.lineWidth = 2.8; L(g, 322, 160, 358, 160); L(g, 322, 170, 358, 170);
        for (let k = 0; k < 14; k++) { const p = loop.at(off + k * loop.len / 14); disc(g, p[0], p[1], 2.7, C.brass, C.ink, 0.8); }
        g.strokeStyle = C.line; g.lineWidth = 1; g.strokeRect(112, 118, 160, 94);
        g.strokeStyle = C.soft; g.setLineDash([3, 4]); L(g, 116, 165, 268, 165); g.setLineDash([]);
        g.strokeStyle = C.ink; g.lineWidth = 1.5; g.beginPath();
        tr.forEach((v, j) => { const x = 116 + j * (152 / 63), y = 165 - clamp(v, -2.6, 2.6) * 15; j ? g.lineTo(x, y) : g.moveTo(x, y); });
        g.stroke();
        g.strokeStyle = C.soft; g.lineWidth = 1.2; g.strokeRect(374, 110, 10, 110);
        const lv = clamp(q / 60, 0, 1) * 108; g.fillStyle = C.brass; g.fillRect(375, 219 - lv, 8, lv);
        label(g, 'resistor', 64, 169, 'right'); label(g, 'diode', 210, 58, 'center'); label(g, 'capacitor', 332, 232, 'right');
        label(g, 'loop current', 116, 228); label(g, 'charge', 379, 102, 'center');
        label(g, 'resistor and diode at one temperature', 210, 34, 'center');
      },
      read() { return [fwd.toFixed(0) + ' fC', back.toFixed(0) + ' fC', q.toFixed(0) + ' fC']; },
      stalled(on) { return on && tOn > 5; }
    };
  };

  /* ---------- 17 · pendulum in a bell jar ---------- */
  M.pend = g => {
    const px = 210, py = 72, LEN = 150, W2 = 8.2, A0 = 30 * Math.PI / 180, E0 = W2 * (1 - Math.cos(A0));
    let th = A0, om = 0, half = 0, peak = A0, amp = A0;
    const gas = []; for (let i = 0; i < 16; i++) gas.push({ x: 104 + Math.random() * 212, y: 112 + Math.random() * 170, p: Math.random() * TAU });
    const energy = () => 0.5 * om * om + W2 * (1 - Math.cos(th));
    return {
      step(dt, on) {
        const n = 4, hh = dt / n;
        for (let k = 0; k < n; k++) {
          let c = on ? 0.32 : 0;
          if (!on) { const E = energy(); if (E < E0 * 0.995) { c = -0.9; if (Math.abs(om) < 0.05 && Math.abs(th) < 0.02) om += 0.08; } else if (E > E0 * 1.005) c = 0.5; }
          om += (-W2 * Math.sin(th) - c * om) * hh;
          const was = th; th += om * hh; peak = Math.max(peak, Math.abs(th));
          if ((was < 0) !== (th < 0)) { if (peak > 0.009) half++; amp = peak; peak = 0; }
        }
        for (const m of gas) m.p += dt * 2;
      },
      draw(on) {
        g.strokeStyle = C.ink; g.lineWidth = 1.8; g.fillStyle = C.plate; g.fillRect(66, 292, 288, 12); g.strokeRect(66, 292, 288, 12);
        L(g, 90, 304, 90, 318); L(g, 330, 304, 330, 318); ground(g, 40, 380, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.2; L(g, px, 28, px, py);
        const RS = 172; g.strokeStyle = C.soft; g.lineWidth = 1; g.fillStyle = C.soft; g.textAlign = 'center';
        g.beginPath(); g.arc(px, py, RS, Math.PI / 2 - 35 * Math.PI / 180, Math.PI / 2 + 35 * Math.PI / 180); g.stroke();
        for (let dg = -35; dg <= 35; dg += 5) {
          const a = dg * Math.PI / 180, len = dg % 10 ? 4 : 8;
          L(g, px + RS * Math.sin(a), py + RS * Math.cos(a), px + (RS + len) * Math.sin(a), py + (RS + len) * Math.cos(a));
          if (dg % 30 === 0) g.fillText(Math.abs(dg) + '°', px + (RS + 21) * Math.sin(a), py + (RS + 21) * Math.cos(a) + 4);
        }
        g.textAlign = 'left'; g.setLineDash([3, 5]);
        for (const sg of [-1, 1]) L(g, px, py, px + sg * (LEN + 13) * Math.sin(A0), py + (LEN + 13) * Math.cos(A0));
        g.setLineDash([]);
        if (on) for (const m of gas) disc(g, m.x + 3 * Math.cos(m.p), m.y + 3 * Math.sin(m.p * 1.3), 1.8, C.soft);
        const bx = px + LEN * Math.sin(th), by = py + LEN * Math.cos(th);
        g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, px, py, bx, by);
        L(g, bx + 13 * Math.sin(th), by + 13 * Math.cos(th), px + (RS - 3) * Math.sin(th), py + (RS - 3) * Math.cos(th));
        disc(g, bx, by, 13, C.brass, C.ink, 1.6); disc(g, px, py, 4, C.plate, C.ink, 1.8);
        g.beginPath(); g.moveTo(88, 292); g.lineTo(88, 95); g.ellipse(210, 95, 122, 67, 0, Math.PI, TAU); g.lineTo(332, 292);
        g.globalAlpha = 0.06; g.fillStyle = C.ink; g.fill(); g.globalAlpha = 1; g.strokeStyle = C.soft; g.lineWidth = 2; g.stroke();
        g.lineWidth = 1.8; L(g, 210, 28, 210, 22); disc(g, 210, 15, 7, C.plate, C.soft, 1.8);
        label(g, on ? 'residual gas, real pivot' : 'perfect vacuum', 12, 20);
      },
      read() { const e = energy() / E0; return [Math.floor(half / 2), (amp * 180 / Math.PI).toFixed(1) + '°', Math.round(clamp(e, 0, 1) * 100) + '%']; },
      stalled(on) { return on && energy() / E0 < 0.004; }
    };
  };

  /* ---------- 18 · Newton's cradle ---------- */
  M.cradle = g => {
    const A0 = 0.6, W = TAU / 1.25, LEN = 165, top = 58;
    let ph = 0.6, A = A0, clicks = 0, sgn = 1;
    return {
      step(dt, on) {
        if (!on) A += (A0 - A) * Math.min(1, 1.2 * dt);
        ph += W * dt;
        const s = Math.sin(ph) >= 0 ? 1 : -1;
        if (s !== sgn) { sgn = s; if (A > 0.012) clicks++; if (on) A *= 0.9; }
        if (on && A < 0.012) A = Math.max(0, A - 0.03 * dt);
      },
      draw() {
        ground(g, 50, 370, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.6; L(g, 100, top, 320, top); L(g, 100, top, 84, 318); L(g, 320, top, 336, 318);
        const sw = Math.sin(ph);
        for (let i = 0; i < 5; i++) {
          const x0 = 146 + 32 * i, a = i === 4 ? A * Math.max(0, sw) : i === 0 ? -A * Math.max(0, -sw) : 0;
          const bx = x0 + LEN * Math.sin(a), by = top + LEN * Math.cos(a);
          g.strokeStyle = C.soft; g.lineWidth = 1.1; L(g, x0, top, bx, by);
          disc(g, bx, by, 16, C.brass, C.ink, 1.6);
        }
      },
      read(on) { return [clicks, Math.round((A / A0) ** 2 * 100) + '%', on ? '19%' : '0%']; },
      stalled(on) { return on && A < 0.012; }
    };
  };

  /* ---------- 19 · flywheel in a vacuum ---------- */
  M.fly = g => {
    const d = drive(3, 6), cx = 210, cy = 160, gas = [];
    for (let i = 0; i < 16; i++) gas.push([Math.random() * TAU, 99 + Math.random() * 10]);
    let th = 0;
    return {
      step(dt, on) { d.step(dt, on); th += d.v * dt; },
      draw(on) {
        ground(g, 70, 350, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.4; L(g, 150, 256, 128, 318); L(g, 270, 256, 292, 318);
        disc(g, cx, cy, 118, C.plate, C.ink, 2.2); disc(g, cx, cy, 112, null, C.ink, 1);
        for (let k = 0; k < 12; k++) { const a = k * TAU / 12 + 0.26; disc(g, cx + 125 * Math.cos(a), cy + 125 * Math.sin(a), 2.6, C.ink); }
        if (on) for (const m of gas) disc(g, cx + m[1] * Math.cos(m[0]), cy + m[1] * Math.sin(m[0]), 1.8, C.soft);
        disc(g, cx, cy, 92, C.plate, C.ink, 2); g.globalAlpha = 0.4; disc(g, cx, cy, 92, C.brass); g.globalAlpha = 1;
        disc(g, cx, cy, 72, C.plate, C.ink, 1.4);
        g.strokeStyle = C.ink; g.lineWidth = 5; spokes(g, cx, cy, 14, 72, 3, th);
        disc(g, cx + 82 * Math.cos(th), cy + 82 * Math.sin(th), 4, C.ink);
        g.lineWidth = 6; g.lineCap = 'butt';
        for (let k = 0; k < 4; k++) { g.strokeStyle = k % 2 ? C.water : C.stamp; g.beginPath(); g.arc(cx, cy, 22, k * Math.PI / 2 + 0.12, (k + 1) * Math.PI / 2 - 0.12); g.stroke(); }
        g.lineCap = 'round';
        disc(g, cx, cy, 11, C.plate, C.ink, 2); g.lineWidth = 1.4; spokes(g, cx, cy, 0, 11, 2, th);
        label(g, on ? 'leftover gas drags on the rim' : 'hard vacuum, shaft held by magnets', 12, 18);
      },
      read(on) { return [(Math.round(200 * d.frac) * 100).toLocaleString('en-US') + ' rpm', Math.round(d.frac * d.frac * 100) + '%', on ? 'some' : 'none']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- 20 · superconducting ring ---------- */
  M.ring = g => {
    let I = 1, th = 0, still = 0, he = 1;
    const wall = k => { g.beginPath(); g.moveTo(70 + k, 96); g.lineTo(70 + k, 262); g.quadraticCurveTo(70 + k, 296 - k, 104, 296 - k); g.lineTo(316, 296 - k); g.quadraticCurveTo(350 - k, 296 - k, 350 - k, 262); g.lineTo(350 - k, 96); };
    return {
      step(dt, on) {
        if (on) { I = Math.max(0, I - (I / 0.45 + 0.03) * dt); still = I === 0 ? still + dt : 0; } else { I += (1 - I) * Math.min(1, 1.5 * dt); still = 0; }
        he += ((on ? 0.12 : 1) - he) * Math.min(1, 1.2 * dt); th += I * 2.2 * dt;
      },
      draw(on) {
        wall(8); g.save(); g.clip(); g.globalAlpha = 0.32; g.fillStyle = C.water; const ly = 288 - he * 160; g.fillRect(70, ly, 290, 300 - ly); g.restore(); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 2; wall(0); g.stroke(); g.lineWidth = 1; wall(8); g.stroke();
        // field through the ring, behind it
        g.strokeStyle = C.stamp; g.lineWidth = 1.6; g.globalAlpha = I;
        arrow(g, 210, 262, 210, 116, 9); arrow(g, 178, 256, 160, 128, 9); arrow(g, 242, 256, 260, 128, 9); g.globalAlpha = 1;
        // the ring
        g.beginPath(); g.ellipse(210, 205, 112, 40, 0, 0, TAU); g.ellipse(210, 205, 84, 25, 0, 0, TAU);
        g.fillStyle = C.plate; g.fill('evenodd'); g.strokeStyle = C.ink; g.lineWidth = 1.8; g.stroke();
        g.beginPath(); g.ellipse(210, 214, 112, 40, 0, 0, Math.PI); g.stroke(); L(g, 98, 205, 98, 214); L(g, 322, 205, 322, 214);
        g.globalAlpha = 0.2 + 0.8 * I;
        for (let k = 0; k < 14; k++) { const a = th + k * TAU / 14; disc(g, 210 + 98 * Math.cos(a), 205 + 32.5 * Math.sin(a), 2.8, C.brass, C.ink, 0.8); }
        g.globalAlpha = 1;
        // the field again where it rises in front of the far side of the ring
        g.strokeStyle = C.stamp; g.lineWidth = 1.6; g.globalAlpha = I; L(g, 210, 178, 210, 150); g.globalAlpha = 1;
        label(g, 'field', 270, 122); label(g, on ? 'ring above 7 K: an ordinary metal' : 'liquid helium, 4 K', 70, 84);
      },
      read(on) { return [(100 * I).toFixed(0) + ' A', on ? 'present' : '0 Ω', (50 * I).toFixed(0) + ' mT']; },
      stalled() { return still > 0.6; }
    };
  };

