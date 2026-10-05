// Perpetuum Mobile. Copyright (C) 2026 Jurgen Kobierczynski.
// SPDX-License-Identifier: GPL-3.0-only
// Made with Claude Opus 5.5 Medium.
// Machines: more of the third kind. Each M.name = g => ({ step, draw, read, stalled }).

  /* ---------- light between perfect mirrors ---------- */
  M.light = g => {
    const XA = 76, XB = 344;
    let x = 120, v = 520, I = 1, bounces = 0;
    return {
      step(dt, on) {
        if (!on) I += (1 - I) * Math.min(1, 1.2 * dt);
        x += v * dt;
        if (x > XB) { x = XB; v = -v; hit(on); } else if (x < XA) { x = XA; v = -v; hit(on); }
        function hit(o) { if (I > 0.012) bounces++; if (o) I *= 0.82; }
        if (on && I < 0.012) I = Math.max(0, I - 0.03 * dt);
      },
      draw() {
        ground(g, 40, 380, 318);
        for (const mx of [XA - 14, XB]) {
          g.fillStyle = C.plate; g.fillRect(mx, 84, 14, 176); g.strokeStyle = C.ink; g.lineWidth = 1.8; g.strokeRect(mx, 84, 14, 176);
          g.lineWidth = 1; const hx = mx === XB ? XB + 14 : XA - 14; for (let y = 90; y < 260; y += 9) L(g, hx, y, hx + (mx === XB ? 6 : -6), y + 6);
          g.lineWidth = 2.2; L(g, mx + 7, 260, mx + 7, 318);
        }
        g.strokeStyle = C.brass; g.globalAlpha = 0.25 * I; g.lineWidth = 3; L(g, XA, 172, XB, 172);
        const tail = v > 0 ? Math.max(XA, x - 46) : Math.min(XB, x + 46);
        g.globalAlpha = I; g.lineWidth = 6; L(g, tail, 172, x, 172); disc(g, x, 172, 7, C.brass); g.globalAlpha = 0.35 * I; disc(g, x, 172, 13, C.brass);
        g.globalAlpha = 1;
        label(g, 'mirror', XA - 7, 74, 'center'); label(g, 'mirror', XB + 7, 74, 'center'); label(g, 'flash of light', 210, 150, 'center');
      },
      read(on) { return [bounces, Math.round(I * 100) + '%', on ? '18%' : '0%']; },
      stalled(on) { return on && I < 0.012; }
    };
  };

  /* ---------- satellite in orbit ---------- */
  M.orbit = g => {
    const cx = 210, cy = 170, RP = 46, R0 = 122, trail = [];
    let r = R0, a = 0, orbits = 0, gone = 0, flash = 0;
    return {
      step(dt, on) {
        if (gone) { gone += dt; flash = Math.max(0, flash - dt); if (!on) { gone = 0; r = R0; trail.length = 0; } return; }
        if (on) r -= (5 + (R0 - r) * 0.45) * dt; else r += (R0 - r) * Math.min(1, 1.5 * dt);
        const w = 0.9 * Math.pow(R0 / r, 1.5), na = a + w * dt;
        if (Math.floor(na / TAU) > Math.floor(a / TAU)) orbits++;
        a = na; trail.push([cx + r * Math.cos(a), cy - r * Math.sin(a)]); if (trail.length > 70) trail.shift();
        if (r < RP + 9) { gone = 0.01; flash = 0.6; }
      },
      draw(on) {
        g.strokeStyle = C.line; g.lineWidth = 1; g.setLineDash([3, 5]); g.beginPath(); g.arc(cx, cy, R0, 0, TAU); g.stroke(); g.setLineDash([]);
        if (on) { g.globalAlpha = 0.12; disc(g, cx, cy, RP + 44, C.water); g.globalAlpha = 0.16; disc(g, cx, cy, RP + 20, C.water); g.globalAlpha = 1; }
        disc(g, cx, cy, RP, C.plate, C.ink, 2); g.globalAlpha = 0.45; disc(g, cx, cy, RP, C.water); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1; g.beginPath(); g.ellipse(cx, cy, RP, 14, 0, 0, Math.PI); g.stroke(); g.beginPath(); g.ellipse(cx, cy, 20, RP, 0, -Math.PI / 2, Math.PI / 2); g.stroke();
        if (trail.length > 1 && !gone) { g.strokeStyle = C.soft; g.lineWidth = 1.2; poly(g, trail); g.stroke(); }
        if (!gone) { const p = trail[trail.length - 1] || [cx + r, cy]; g.fillStyle = C.brass; g.fillRect(p[0] - 5, p[1] - 4, 10, 8); g.strokeStyle = C.ink; g.lineWidth = 1.2; g.strokeRect(p[0] - 5, p[1] - 4, 10, 8); L(g, p[0] - 12, p[1], p[0] + 12, p[1]); }
        if (flash > 0) { const p = trail[trail.length - 1]; g.globalAlpha = flash / 0.6; disc(g, p[0], p[1], 6 + 30 * (0.6 - flash), C.stamp); g.globalAlpha = 1; }
        label(g, on ? 'thin air reaches this high' : 'no air at all', 12, 20); label(g, 'Earth', cx, cy + RP + 16, 'center');
      },
      read(on) { return [orbits, gone ? 'burned up' : Math.round((r - RP) * 5.26) + ' km', on ? 'slight' : 'none']; },
      stalled(on) { return on && gone > 0.8; }
    };
  };

  /* ---------- superfluid in a ring ---------- */
  M.superfluid = g => {
    const cx = 210, cy = 172;
    let v = 1, th = 0, laps = 0, still = 0;
    return {
      step(dt, on) {
        if (on) { v = Math.max(0, v - (v / 1.4 + 0.04) * dt); still = v === 0 ? still + dt : 0; } else { v += (1 - v) * Math.min(1, 1.5 * dt); still = 0; }
        const n = th + v * 1.1 * dt; if (Math.floor(n / TAU) > Math.floor(th / TAU)) laps++; th = n;
      },
      draw(on) {
        g.beginPath(); g.arc(cx, cy, 112, 0, TAU); g.arc(cx, cy, 70, 0, TAU);
        g.fillStyle = C.plate; g.fill('evenodd'); g.globalAlpha = 0.45; g.fillStyle = C.water; g.fill('evenodd'); g.globalAlpha = 1;
        disc(g, cx, cy, 112, null, C.ink, 2.2); disc(g, cx, cy, 70, null, C.ink, 2.2);
        g.strokeStyle = C.ink; g.lineWidth = 1.3;
        for (let k = 0; k < 16; k++) {
          const a = th + k * TAU / 16, r = 84 + (k % 3) * 8, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
          g.globalAlpha = 0.3 + 0.7 * v; g.beginPath(); g.arc(cx, cy, r, a - 0.16 * v - 0.02, a); g.stroke(); disc(g, x, y, 2.2, C.ink);
        }
        g.globalAlpha = 1;
        g.strokeStyle = C.soft; g.lineWidth = 1.3; g.beginPath(); g.arc(cx, cy, 124, -1.1, -0.55); g.stroke();
        arrow(g, cx + 124 * Math.cos(-0.6), cy + 124 * Math.sin(-0.6), cx + 124 * Math.cos(-0.52), cy + 124 * Math.sin(-0.52), 8);
        label(g, on ? 'above 2.17 K: an ordinary liquid' : 'superfluid helium, 1.5 K', 12, 20); label(g, 'ring-shaped channel', cx, cy + 4, 'center');
      },
      read(on) { return [(v * 4).toFixed(1) + ' cm/s', on ? 'present' : 'zero', laps]; },
      stalled() { return still > 0.6; }
    };
  };

  /* ---------- coil and capacitor ---------- */
  M.lc = g => {
    const loop = mkPath([[90, 90], [330, 90], [330, 250], [90, 250]], true), tr = new Array(70).fill(0), W = TAU / 1.6;
    let ph = 0, A = 1, off = 0, swings = 0, acc = 0, sgn = 1;
    return {
      step(dt, on) {
        if (!on) A += (1 - A) * Math.min(1, 1.2 * dt); else A = Math.max(0, A - (A * 0.2 + 0.006) * dt);
        ph += W * dt; const q = A * Math.cos(ph), i = -A * Math.sin(ph);
        off += i * 60 * dt; const s = q >= 0 ? 1 : -1; if (s !== sgn) { sgn = s; if (s > 0 && A > 0.02) swings++; }
        acc += dt; if (acc > 0.035) { acc = 0; tr.push(q); tr.shift(); }
      },
      draw() {
        const q = A * Math.cos(ph), i = -A * Math.sin(ph);
        g.strokeStyle = C.ink; g.lineWidth = 1.6; g.strokeRect(90, 90, 240, 160);
        g.fillStyle = C.plate; g.fillRect(78, 160, 24, 20); g.fillRect(318, 116, 24, 108);
        g.lineWidth = 3; g.strokeStyle = q >= 0 ? C.stamp : C.water; g.globalAlpha = 0.25 + 0.75 * Math.abs(q); L(g, 70, 164, 110, 164);
        g.strokeStyle = q >= 0 ? C.water : C.stamp; L(g, 70, 176, 110, 176); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.2; L(g, 70, 164, 110, 164); L(g, 70, 176, 110, 176);
        g.lineWidth = 1.8; g.beginPath(); for (let k = 0; k < 6; k++) g.arc(330, 125 + k * 18, 9, -Math.PI / 2, Math.PI / 2); g.stroke();
        g.strokeStyle = C.stamp; g.lineWidth = 1.3; g.globalAlpha = Math.abs(i);
        for (const o of [20, 34]) { g.beginPath(); g.ellipse(346, 170, o, 62 + o * 0.4, 0, -Math.PI / 2 + 0.25, Math.PI / 2 - 0.25); g.stroke(); }
        g.globalAlpha = 1;
        for (let k = 0; k < 14; k++) { const p = loop.at(off + k * loop.len / 14); disc(g, p[0], p[1], 2.7, C.brass, C.ink, 0.8); }
        g.strokeStyle = C.line; g.lineWidth = 1; g.strokeRect(128, 126, 164, 88);
        g.strokeStyle = C.soft; g.setLineDash([3, 4]); L(g, 132, 170, 288, 170); g.setLineDash([]);
        g.strokeStyle = C.ink; g.lineWidth = 1.5; g.beginPath(); tr.forEach((v, j) => { const x = 132 + j * (156 / 69), y = 170 - v * 36; j ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
        label(g, 'capacitor', 90, 80, 'center'); label(g, 'coil', 330, 80, 'center'); label(g, 'voltage', 132, 228);
      },
      read(on) { return [swings, Math.round(A * 100) + '%', on ? '27%' : '0%']; },
      stalled(on) { return on && A < 0.012; }
    };
  };

  /* ---------- weight on a perfect spring ---------- */
  M.spring = g => {
    const A0 = 46, W = TAU / 1.5, Y0 = 196;
    let ph = 0, A = A0, n = 0, sgn = 1;
    return {
      step(dt, on) {
        if (!on) A += (A0 - A) * Math.min(1, 1.2 * dt); else A = Math.max(0, A - (A * 0.22 + 0.25) * dt);
        ph += W * dt; const s = Math.cos(ph) >= 0 ? 1 : -1; if (s !== sgn) { sgn = s; if (s > 0 && A > 1) n++; }
      },
      draw() {
        const y = Y0 + A * Math.cos(ph);
        g.strokeStyle = C.ink; g.lineWidth = 2.6; L(g, 120, 50, 300, 50); g.lineWidth = 1; for (let x = 126; x <= 300; x += 9) L(g, x, 50, x + 6, 44);
        g.lineWidth = 2.2; L(g, 120, 50, 120, 318); ground(g, 80, 340, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(210, 50); g.lineTo(210, 62);
        const n2 = 22, len = y - 22 - 62; for (let k = 1; k <= n2; k++) g.lineTo(210 + (k === n2 ? 0 : (k % 2 ? 16 : -16)), 62 + len * k / n2);
        g.lineTo(210, y - 14); g.stroke();
        g.fillStyle = C.brass; g.fillRect(184, y - 14, 52, 40); g.lineWidth = 1.6; g.strokeRect(184, y - 14, 52, 40);
        g.strokeStyle = C.soft; g.lineWidth = 1; L(g, 290, 130, 290, 270); for (let k = 0; k <= 14; k++) L(g, 290, 130 + k * 10, k % 5 ? 296 : 300, 130 + k * 10);
        g.strokeStyle = C.ink; g.lineWidth = 1.4; arrow(g, 240, y + 6, 286, y + 6, 7);
        g.strokeStyle = C.soft; g.setLineDash([3, 5]); L(g, 150, Y0 - A0 + 6, 286, Y0 - A0 + 6); L(g, 150, Y0 + A0 + 6, 286, Y0 + A0 + 6); g.setLineDash([]);
      },
      read() { return [n, (2 * A).toFixed(0) + ' mm', Math.round((A / A0) ** 2 * 100) + '%']; },
      stalled(on) { return on && A < 0.3; }
    };
  };

  /* ---------- tuning fork ---------- */
  M.fork = g => {
    let ph = 0, A = 1, w = 0;
    return {
      step(dt, on) { if (!on) A += (1 - A) * Math.min(1, 1.2 * dt); else A = Math.max(0, A - (A * 0.18 + 0.008) * dt); ph += 38 * dt; w += dt; },
      draw(on) {
        ground(g, 90, 330, 318);
        g.fillStyle = C.plate; g.fillRect(150, 292, 120, 26); g.strokeStyle = C.ink; g.lineWidth = 1.8; g.strokeRect(150, 292, 120, 26);
        const dx = 9 * A * Math.sin(ph);
        if (on) {
          g.strokeStyle = C.soft; g.lineWidth = 1.4;
          for (let k = 0; k < 4; k++) {
            const u = ((w * 0.9 + k / 4) % 1), r = 30 + u * 110; g.globalAlpha = (1 - u) * A;
            g.beginPath(); g.arc(238, 140, r, -0.7, 0.7); g.stroke(); g.beginPath(); g.arc(182, 140, r, Math.PI - 0.7, Math.PI + 0.7); g.stroke();
          }
          g.globalAlpha = 1;
        } else {
          g.beginPath(); g.moveTo(96, 292); g.lineTo(96, 100); g.ellipse(210, 100, 114, 62, 0, Math.PI, TAU); g.lineTo(324, 292);
          g.globalAlpha = 0.06; g.fillStyle = C.ink; g.fill(); g.globalAlpha = 1; g.strokeStyle = C.soft; g.lineWidth = 2; g.stroke();
        }
        g.strokeStyle = C.ink; g.lineWidth = 9; g.lineCap = 'butt'; L(g, 210, 292, 210, 226);
        for (const sg of [-1, 1]) {
          g.beginPath(); g.moveTo(210, 228); g.lineTo(210 + sg * 24, 228);
          for (let k = 1; k <= 12; k++) { const t = k / 12; g.lineTo(210 + sg * (24 + dx * t * t), 228 - 150 * t); }
          g.lineJoin = 'miter'; g.stroke();
        }
        g.lineCap = 'round'; g.lineJoin = 'round';
        label(g, on ? 'the note you hear is energy leaving' : 'silent, in a vacuum', 12, 20);
      },
      read(on) { return ['440 Hz', Math.round(A * 100) + '%', on ? 'yes' : 'none']; },
      stalled(on) { return on && A < 0.012; }
    };
  };

  /* ---------- ball in a frictionless bowl ---------- */
  M.bowl = g => {
    const cx = 210, cy = 40, RB = 232, rb = 13, W2 = 7, A0 = 0.82, E0 = W2 * (1 - Math.cos(A0));
    let th = A0, om = 0, half = 0, peak = A0, amp = A0;
    const energy = () => 0.5 * om * om + W2 * (1 - Math.cos(th));
    return {
      step(dt, on) {
        const n = 4, hh = dt / n;
        for (let k = 0; k < n; k++) {
          let c = on ? 0.4 : 0;
          if (!on) { const E = energy(); if (E < E0 * 0.995) { c = -0.9; if (Math.abs(om) < 0.05 && Math.abs(th) < 0.02) om += 0.08; } else if (E > E0 * 1.005) c = 0.5; }
          om += (-W2 * Math.sin(th) - c * om) * hh; const was = th; th += om * hh; peak = Math.max(peak, Math.abs(th));
          if ((was < 0) !== (th < 0)) { if (peak > 0.012) half++; amp = peak; peak = 0; }
        }
      },
      draw() {
        ground(g, 50, 370, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.2; L(g, 150, 264, 150, 318); L(g, 270, 264, 270, 318);
        g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, RB, Math.PI / 2 - 0.98, Math.PI / 2 + 0.98); g.stroke();
        const hy = cy + (RB - rb - 2) * Math.cos(A0) - rb;
        g.strokeStyle = C.soft; g.lineWidth = 1; g.setLineDash([3, 5]); L(g, 30, hy, 390, hy); g.setLineDash([]);
        const r = RB - rb - 2, bx = cx + r * Math.sin(th), by = cy + r * Math.cos(th), roll = -th * r / rb;
        disc(g, bx, by, rb, C.brass, C.ink, 1.6); g.lineWidth = 1.2; spokes(g, bx, by, 0, rb, 2, roll);
        label(g, 'height of release', 30, hy - 8);
      },
      read() { const e = energy() / E0; return [half, Math.round(clamp((1 - Math.cos(amp)) / (1 - Math.cos(A0)), 0, 1) * 100) + '%', Math.round(clamp(e, 0, 1) * 100) + '%']; },
      stalled(on) { return on && energy() / E0 < 0.004; }
    };
  };

  /* ---------- spinning top ---------- */
  M.top = g => {
    let w = 1, spin = 0, prec = 0, tilt = 0.05, down = 0;
    return {
      step(dt, on) {
        if (on) w = Math.max(0, w - (w / 5 + 0.03) * dt); else w += (1 - w) * Math.min(1, 1.3 * dt);
        spin += w * 16 * dt; prec += (0.6 + 2.2 * (1 - w)) * dt * (w > 0.02 ? 1 : 0);
        const want = w < 0.14 ? 1.42 : 0.05 + 0.5 * (1 - w) * (1 - w);
        tilt += (want - tilt) * Math.min(1, (w < 0.14 ? 3 : 4) * dt);
        down = on && w < 0.14 && tilt > 1.38 ? down + dt : 0;
      },
      draw() {
        ground(g, 60, 360, 290);
        const lean = tilt * (w < 0.14 ? 1 : Math.cos(prec)), ca = Math.cos(lean), sa = Math.sin(lean), T = (x, y) => [210 + x * ca - y * sa, 290 + x * sa + y * ca];
        const body = [[0, 0], [-40, -60], [-40, -74], [-8, -86], [-8, -114], [8, -114], [8, -86], [40, -74], [40, -60]].map(p => T(p[0], p[1]));
        poly(g, body, true); g.fillStyle = C.plate; g.fill(); g.globalAlpha = 0.35; g.fillStyle = C.brass; g.fill(); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 2; g.stroke();
        g.lineWidth = 1.6;
        for (let k = 0; k < 6; k++) { const a = spin + k * Math.PI / 3; if (Math.cos(a) < 0) continue; const x = 40 * Math.sin(a), p1 = T(x, -60), p2 = T(x, -74), p3 = T(x * 0.2, -86), p0 = T(x * 0.5, -30); L(g, p1[0], p1[1], p2[0], p2[1]); L(g, p2[0], p2[1], p3[0], p3[1]); L(g, p1[0], p1[1], p0[0], p0[1]); }
        if (w > 0.14) { g.strokeStyle = C.soft; g.lineWidth = 1; g.setLineDash([3, 4]); g.beginPath(); g.ellipse(210, 290 - 114 * Math.cos(tilt), 114 * Math.sin(tilt) + 0.5, 5 + 20 * Math.sin(tilt), 0, 0, TAU); g.stroke(); g.setLineDash([]); }
      },
      read() { return [Math.round(w * 18) * 100 + ' rpm', (tilt * 180 / Math.PI).toFixed(0) + '°', w < 0.14 ? (tilt > 1.3 ? 'fallen' : 'falling') : tilt > 0.12 ? 'wobbling' : 'steady']; },
      stalled() { return down > 0.5; }
    };
  };
