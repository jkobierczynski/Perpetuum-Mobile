// Perpetuum Mobile. Copyright (C) 2026 Jurgen Kobierczynski.
// SPDX-License-Identifier: GPL-3.0-only
// Made with Claude Opus 5.5 Medium.
// Machines: the impostors, the mercury bellows and the two-liquid fountain. Each M.name = g => ({ step, draw, read, stalled }).

  /* ---------- the mercury bellows ---------- */
  M.papin = g => {
    const H = [250, 130];
    let p = 0.1, cyc = 0, rate = 1, flow = 0, still = 0;
    const pose = q => q < 0.45 ? [0.08 + 0.62 * q / 0.45, 2.1, q / 0.45] : q < 0.6 ? [0.7, 2.1 - 1.6 * (q - 0.45) / 0.15, 1] :
      q < 0.85 ? [0.7 - 0.62 * (q - 0.6) / 0.25, 0.5, 1 - (q - 0.6) / 0.25] : [0.08, 0.5 + 1.6 * (q - 0.85) / 0.15, 0];
    return {
      step(dt, on) {
        if (on) { if (p > 0.02) p = Math.max(0.02, p > 0.5 ? (p + dt / 3 >= 1 ? 0.02 : p + dt / 3) : p - dt / 3); rate = 0; still = p <= 0.02 ? still + dt : 0; }
        else { rate = 1; still = 0; p += dt / 5; if (p >= 1) { p -= 1; cyc++; } }
        flow += dt * 60;
      },
      draw(on) {
        const [al, be, m] = pose(p);
        ground(g, 40, 392, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2.4; L(g, H[0], H[1], H[0], 318);
        // cistern of mercury and the pipe up to the hinge
        g.fillStyle = C.plate; g.fillRect(60, 250, 140, 50); g.globalAlpha = 0.5; g.fillStyle = C.ink; g.fillRect(60, 264, 140, 36); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, 60, 244, 60, 300); L(g, 60, 300, 200, 300); L(g, 200, 244, 200, 300); L(g, 80, 300, 80, 318); L(g, 180, 300, 180, 318);
        const pipe = [[130, 290], [130, 130], [250, 130]];
        g.lineWidth = 7; poly(g, pipe); g.stroke(); g.strokeStyle = C.plate; g.lineWidth = 3.6; poly(g, pipe); g.stroke();
        if (!on && p < 0.45) { g.strokeStyle = C.ink; g.globalAlpha = 0.6; poly(g, pipe); g.stroke(); g.globalAlpha = 1; }
        // return trough
        g.strokeStyle = C.ink; g.lineWidth = 2; L(g, 380, 212, 204, 252); L(g, 380, 212, 380, 200);
        if (!on && p > 0.6 && p < 0.88) { g.strokeStyle = C.ink; g.globalAlpha = 0.6; g.lineWidth = 3; g.setLineDash([6, 6]); g.lineDashOffset = flow; L(g, 372, 210, 206, 248); L(g, 346, 186, 346, 214); g.setLineDash([]); g.globalAlpha = 1; }
        // the bellows
        const a1 = be - al / 2, a2 = be + al / 2, P1 = [H[0] + 112 * Math.cos(a1), H[1] + 112 * Math.sin(a1)], P2 = [H[0] + 112 * Math.cos(a2), H[1] + 112 * Math.sin(a2)];
        const body = [H]; for (let k = 0; k <= 6; k++) { const t = k / 6, r = k % 2 ? 100 : 112, a = a1 + (a2 - a1) * t; body.push([H[0] + r * Math.cos(a), H[1] + r * Math.sin(a)]); }
        poly(g, body, true); g.fillStyle = C.plate; g.fill();
        if (m > 0.02) { g.save(); g.clip(); g.globalAlpha = 0.5; g.fillStyle = C.ink; g.beginPath(); g.moveTo(H[0], H[1]); g.arc(H[0], H[1], 112, a1, a1 + (a2 - a1) * 1, false); g.closePath(); g.globalAlpha = 0.5 * m; g.fill(); g.restore(); g.globalAlpha = 1; }
        poly(g, body, true); g.strokeStyle = C.ink; g.lineWidth = 1.3; g.stroke();
        g.lineWidth = 3.4; L(g, H[0], H[1], P1[0], P1[1]); L(g, H[0], H[1], P2[0], P2[1]);
        // counterweight
        const cw = [H[0] - 46 * Math.cos(be), H[1] - 46 * Math.sin(be)]; g.lineWidth = 2.2; L(g, H[0], H[1], cw[0], cw[1]); disc(g, cw[0], cw[1], 9, C.brass, C.ink, 1.4);
        disc(g, H[0], H[1], 5, C.plate, C.ink, 1.8);
        if (on) { g.strokeStyle = C.stamp; g.lineWidth = 1.8; const mid = (r, a, o) => [H[0] + r * Math.cos(a) - o * Math.sin(a), H[1] + r * Math.sin(a) + o * Math.cos(a)];
          for (const r of [50, 90]) { let s = mid(r, a1, -26), e = mid(r, a1, -5); arrow(g, s[0], s[1], e[0], e[1], 8); s = mid(r, a2, 26); e = mid(r, a2, 5); arrow(g, s[0], s[1], e[0], e[1], 8); } }
        label(g, 'mercury', 130, 314, 'center'); label(g, on ? 'the air outside holds it shut' : 'bellows', 268, 100);
      },
      read(on) { return [cyc, '25 inches', on ? '27 inches' : 'ignored']; },
      stalled() { return still > 0.6; }
    };
  };

  /* ---------- Bernoulli's two liquids ---------- */
  M.bernoulli = g => {
    const tube = mkPath([[208, 278], [208, 58], [252, 58], [252, 82]], false), LEVEL = 86, FULL = tube.len, dots = [];
    for (let i = 0; i < 46; i++) dots.push([98 + Math.random() * 194, 160 + Math.random() * 124, i % 2]);
    let fill = FULL, drip = 0, still = 0;
    return {
      step(dt, on) {
        fill = on ? Math.max(LEVEL, fill - 60 * dt) : Math.min(FULL, fill + 60 * dt);
        if (fill >= FULL) drip += dt * 60; still = on && fill <= LEVEL ? still + dt : 0;
      },
      draw(on) {
        ground(g, 50, 370, 318);
        g.fillStyle = C.plate; g.fillRect(90, 120, 210, 172); g.globalAlpha = 0.35; g.fillStyle = C.water; g.fillRect(90, 152, 210, 140); g.globalAlpha = 1;
        for (const q of dots) if (!(q[0] > 196 && q[0] < 220)) disc(g, q[0], q[1], q[2] ? 2 : 2.6, q[2] ? C.brass : C.ink);
        g.strokeStyle = C.ink; g.lineWidth = 2; L(g, 90, 110, 90, 292); L(g, 90, 292, 300, 292); L(g, 300, 110, 300, 292); L(g, 120, 292, 120, 318); L(g, 270, 292, 270, 318);
        g.lineWidth = 17; poly(g, tube.pts); g.stroke(); g.strokeStyle = C.plate; g.lineWidth = 13; poly(g, tube.pts); g.stroke();
        g.lineCap = 'butt'; g.strokeStyle = C.brass; g.globalAlpha = 0.6; tube.trace(g, 0, fill); g.globalAlpha = 1;
        if (fill >= FULL) { g.lineWidth = 3; g.setLineDash([6, 5]); g.lineDashOffset = -drip; L(g, 252, 90, 252, 152); g.setLineDash([]); g.lineDashOffset = 0; }
        g.strokeStyle = C.stamp; g.lineWidth = 2.4; g.setLineDash([3, 3]); L(g, 199, 286, 217, 286); g.setLineDash([]); g.lineCap = 'round';
        if (on) { g.strokeStyle = C.stamp; g.lineWidth = 1.6; arrow(g, 208, 268, 176, 268, 7); arrow(g, 208, 268, 240, 268, 7); }
        label(g, 'mixture of a heavy', 310, 200); label(g, 'and a light liquid', 310, 216); label(g, 'filter', 180, 310, 'center'); label(g, 'light liquid only', 196, 74, 'right');
      },
      read() { const y = fill <= 220 ? 278 - fill : 58; return ['18 cm', Math.max(0, (292 - y) / 7.8).toFixed(0) + ' cm', fill >= FULL ? 'pouring' : 'none']; },
      stalled() { return still > 0.6; }
    };
  };

  /* ---------- Redheffer's machine ---------- */
  M.redheffer = g => {
    const d = drive(1.1, 1.6);
    let th = 0;
    return {
      step(dt, on) { d.step(dt, on); th += d.v * dt; },
      draw(on) {
        ground(g, 30, 396, 318);
        g.strokeStyle = C.ink; g.lineWidth = 4; L(g, 30, 98, 392, 98); g.lineWidth = 3; L(g, 374, 98, 374, 318);
        // the machine on show
        g.lineWidth = 2.4; L(g, 170, 112, 170, 300); L(g, 130, 300, 210, 300); L(g, 270, 236, 270, 300); L(g, 250, 300, 290, 300);
        const ell = (cx, cy, rx, ry, n, a) => { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.fillStyle = C.plate; g.fill(); g.stroke(); for (let k = 0; k < n; k++) { const t = a + k * TAU / n; if (Math.sin(t) > -0.2) L(g, cx + rx * Math.cos(t), cy + ry * Math.sin(t), cx + rx * Math.cos(t), cy + ry * Math.sin(t) + 6); } };
        g.lineWidth = 1.6; ell(170, 236, 78, 16, 28, th); ell(270, 240, 22, 6, 9, -th * 3.5);
        g.beginPath(); g.ellipse(170, 228, 78, 16, 0, 0, TAU); g.fillStyle = C.plate; g.fill(); g.stroke();
        for (const sg of [-1, 1]) {
          const bx = 170 + sg * 46 * Math.cos(th), sc = 0.75 + 0.25 * Math.sin(th) * sg, by = 222 + 6 * Math.sin(th) * sg;
          poly(g, [[bx - 14 * sc, by], [bx + 14 * sc, by], [bx + 14 * sc * sg, by - 26 * sc]], true); g.fillStyle = C.plate; g.fill(); g.lineWidth = 1.4; g.stroke();
          g.fillStyle = C.brass; g.fillRect(bx - 5 * sc - 2 * sg, by - 24 * sc, 10 * sc, 10 * sc); g.strokeRect(bx - 5 * sc - 2 * sg, by - 24 * sc, 10 * sc, 10 * sc);
        }
        g.lineWidth = 2.4; L(g, 170, 112, 170, 214);
        // the loft
        if (on) {
          g.strokeStyle = C.stamp; g.lineWidth = 1.6; g.setLineDash([4, 4]); poly(g, [[306, 62], [374, 62], [374, 240], [292, 240]]); g.stroke(); g.setLineDash([]);
          const hx = 290 + 14 * Math.cos(th * 3), hy = 62 + 14 * Math.sin(th * 3);
          disc(g, 290, 62, 16, C.plate, C.ink, 1.8); g.strokeStyle = C.ink; g.lineWidth = 2; L(g, 290, 62, hx, hy); disc(g, hx, hy, 3, C.ink);
          g.lineWidth = 2.2; disc(g, 236, 40, 8, C.plate, C.ink, 2); L(g, 236, 48, 236, 74); L(g, 236, 56, hx, hy); L(g, 236, 74, 256, 78); L(g, 256, 78, 256, 96); g.strokeRect(222, 74, 26, 22);
          g.strokeStyle = C.soft; g.lineWidth = 1.2; g.strokeRect(40, 16, 344, 80);
        } else {
          g.fillStyle = C.plate; g.fillRect(40, 16, 344, 80); g.globalAlpha = 0.14; g.fillStyle = C.ink; g.fillRect(40, 16, 344, 80); g.globalAlpha = 1;
          g.strokeStyle = C.soft; g.lineWidth = 1; for (let x = 52; x < 384; x += 14) L(g, x, 16, x, 96);
          g.strokeStyle = C.ink; g.lineWidth = 1.2; g.strokeRect(40, 16, 344, 80);
        }
        label(g, on ? 'the cord, and the man who turns it' : 'the floor above, boarded over', 48, 34);
        label(g, 'weights on 45° ramps', 60, 190);
      },
      read(on) { return [(d.v * 60 / TAU).toFixed(1) + ' rpm', 'for show', on ? (d.v > 0 ? 'caught' : 'stopped') : 'cranking']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- the Keely motor ---------- */
  M.keely = g => {
    const d = drive(1.6, 1.6);
    let th = 0;
    return {
      step(dt, on) { d.step(dt, on); th += d.v * dt; },
      draw(on) {
        const f = d.frac;
        g.strokeStyle = C.ink; g.lineWidth = 2.2; L(g, 96, 196, 96, 150); L(g, 204, 196, 204, 150); L(g, 80, 150, 222, 150);
        disc(g, 150, 100, 46, C.plate, C.ink, 2.2); disc(g, 150, 100, 36, null, C.ink, 1); g.lineWidth = 1.6; spokes(g, 150, 100, 6, 36, 6, th); disc(g, 150, 100, 6, C.plate, C.ink, 1.6);
        L(g, 150, 146, 150, 150);
        // gauge and tuning forks
        disc(g, 300, 96, 24, C.plate, C.ink, 2); g.lineWidth = 1; spokes(g, 300, 96, 19, 24, 12, 0);
        const na = Math.PI * 0.8 + f * Math.PI * 1.3; g.strokeStyle = C.stamp; g.lineWidth = 2; L(g, 300, 96, 300 + 18 * Math.cos(na), 96 + 18 * Math.sin(na)); disc(g, 300, 96, 2.5, C.ink);
        g.strokeStyle = C.ink; g.lineWidth = 2; L(g, 300, 120, 300, 196);
        for (const fx of [246, 352]) { const v = 2 * f * Math.sin(th * 9 + fx); g.lineWidth = 2.6; L(g, fx, 196, fx, 170); poly(g, [[fx - 7 - v, 130], [fx - 7, 170], [fx + 7, 170], [fx + 7 + v, 130]]); g.stroke(); }
        g.strokeStyle = C.soft; g.lineWidth = 1.2; poly(g, [[196, 100], [220, 100], [220, 196]]); g.stroke(); L(g, 276, 96, 220, 96);
        // the floor
        g.strokeStyle = C.ink; g.lineWidth = 4; L(g, 30, 198, 392, 198);
        if (on) {
          g.strokeStyle = C.soft; g.lineWidth = 1.2; g.strokeRect(40, 206, 344, 106);
          disc(g, 290, 258, 46, C.plate, C.ink, 2.2); g.globalAlpha = 0.1; disc(g, 290, 258, 46, C.ink); g.globalAlpha = 1;
          g.strokeStyle = C.stamp; g.lineWidth = 1.8; g.setLineDash([4, 4]); poly(g, [[244, 258], [220, 258], [220, 200]]); g.stroke(); g.setLineDash([]);
          g.fillStyle = C.stamp; g.fillRect(212, 204, 16, 8);
          g.strokeStyle = C.ink; g.lineWidth = 1.4; for (const a of [0.6, 1.2, 1.9, 2.5]) L(g, 290 + 40 * Math.cos(a), 258 - 40 * Math.sin(a), 290 + 46 * Math.cos(a), 258 - 46 * Math.sin(a));
          label(g, 'steel sphere of', 60, 250); label(g, 'compressed air', 60, 266); label(g, 'foot valve', 204, 228, 'right');
        } else {
          g.fillStyle = C.plate; g.fillRect(40, 206, 344, 106); g.globalAlpha = 0.14; g.fillStyle = C.ink; g.fillRect(40, 206, 344, 106); g.globalAlpha = 1;
          g.strokeStyle = C.soft; g.lineWidth = 1; for (let x = 52; x < 384; x += 14) L(g, x, 206, x, 312);
          g.strokeStyle = C.ink; g.lineWidth = 1.2; g.strokeRect(40, 206, 344, 106);
          label(g, 'under the floor', 212, 264, 'center');
        }
        label(g, 'vibratory engine', 150, 40, 'center'); label(g, 'gauge', 300, 60, 'center'); label(g, 'a "solid wire"', 226, 140);
      },
      read(on) { return [(d.v * 60 / TAU * 4).toFixed(0) + ' rpm', (Math.round(d.frac * 100) * 100).toLocaleString('en-US') + ' psi', on ? 'shut off' : 'flowing']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- Cox's timepiece ---------- */
  M.cox = g => {
    let tp = 0, p = 0, res = 0.8, hm = 0, wth = 0, still = 0;
    return {
      step(dt, on) {
        if (!on) tp += dt;
        const np = 0.6 * Math.sin(0.5 * tp) + 0.4 * Math.sin(1.3 * tp + 1), dp = Math.abs(np - p); p = np;
        wth += dp * 2.4; res = clamp(res + dp * 0.5 - 0.11 * dt, 0, 1);
        if (res > 0) hm += dt * 1.1; still = on && res <= 0 ? still + dt : 0;
      },
      draw() {
        ground(g, 30, 396, 318);
        g.fillStyle = C.plate; g.fillRect(50, 58, 140, 260); g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(50, 58, 140, 260);
        disc(g, 120, 136, 56, C.plate, C.ink, 2); g.lineWidth = 1.2; spokes(g, 120, 136, 49, 56, 12, 0);
        g.lineWidth = 3; L(g, 120, 136, 120 + 26 * Math.sin(hm / 12), 136 - 26 * Math.cos(hm / 12)); g.lineWidth = 1.8; L(g, 120, 136, 120 + 44 * Math.sin(hm), 136 - 44 * Math.cos(hm)); disc(g, 120, 136, 3.5, C.ink);
        g.lineWidth = 1.4; gear(g, 120, 256, 24, 16, wth, C.plate); disc(g, 120, 256, 5, C.plate, C.ink, 1.4);
        g.strokeStyle = C.soft; g.lineWidth = 1.2; L(g, 144, 256, 262, 272);
        // the barometer
        g.fillStyle = C.plate; g.fillRect(262, 252, 76, 44); g.globalAlpha = 0.55; g.fillStyle = C.ink; g.fillRect(262, 268 + 6 * p, 76, 28 - 6 * p); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, 262, 246, 262, 296); L(g, 262, 296, 338, 296); L(g, 338, 246, 338, 296); L(g, 280, 296, 280, 318); L(g, 320, 296, 320, 318);
        g.fillStyle = C.plate; g.fillRect(292, 80, 16, 200); disc(g, 300, 72, 22, C.plate, C.ink, 1.8);
        const top = 148 - 34 * p; g.globalAlpha = 0.55; g.fillStyle = C.ink; g.fillRect(292, top, 16, 280 - top); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, 292, 92, 292, 280); L(g, 308, 92, 308, 280);
        g.strokeStyle = C.soft; g.lineWidth = 1; for (let k = 0; k <= 8; k++) L(g, 312, 106 + k * 12, k % 4 ? 317 : 321, 106 + k * 12);
        label(g, 'mercury barometer', 300, 40, 'center'); label(g, 'winding ratchet', 120, 304, 'center');
      },
      read() { return [Math.round(1013 + 18 * p) + ' hPa', Math.round(res * 100) + '%', res > 0 ? 'running' : 'stopped']; },
      stalled() { return still > 0.5; }
    };
  };

  /* ---------- self-winding watch ---------- */
  M.watch = g => {
    let t = 0, psi = 0, res = 1, swings = 0, worn = 1, bal = 0, hm = 0, sg = 1, still = 0;
    return {
      step(dt, on) {
        worn += ((on ? 0 : 1) - worn) * Math.min(1, 1.2 * dt); t += dt;
        const pv = psi; psi += (worn * (1.25 * Math.sin(1.9 * t) + 0.6 * Math.sin(3.1 * t + 1)) - psi) * Math.min(1, 6 * dt);
        const s = psi >= 0 ? 1 : -1; if (s !== sg) { sg = s; if (worn > 0.3) swings++; }
        res = clamp(res + Math.abs(psi - pv) * 0.12 - 0.11 * dt, 0, 1);
        if (res > 0) { bal += dt * 14; hm += dt * 0.9; } still = on && res <= 0 ? still + dt : 0;
      },
      draw(on) {
        const cx = 210 + 7 * worn * Math.sin(1.9 * t), cy = 170 + 5 * worn * Math.sin(2.7 * t + 0.5);
        g.fillStyle = C.plate; g.strokeStyle = C.ink; g.lineWidth = 1.8;
        g.fillRect(cx - 42, cy - 172, 84, 90); g.strokeRect(cx - 42, cy - 172, 84, 90); g.fillRect(cx - 42, cy + 82, 84, 90); g.strokeRect(cx - 42, cy + 82, 84, 90);
        g.fillRect(cx + 98, cy - 9, 14, 18); g.strokeRect(cx + 98, cy - 9, 14, 18);
        disc(g, cx, cy, 100, C.plate, C.ink, 2.6); disc(g, cx, cy, 91, null, C.ink, 1);
        disc(g, cx - 38, cy - 34, 24, null, C.ink, 1.6); g.lineWidth = 1.1;
        for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(cx - 38, cy - 34, 5 + k * 5, 0, TAU * (0.25 + 0.75 * res)); g.stroke(); }
        g.lineWidth = 1.3; gear(g, cx + 30, cy - 42, 16, 12, hm, C.plate); gear(g, cx + 56, cy - 12, 10, 8, -hm * 1.5 + 0.3, C.plate);
        const ba = 0.9 * Math.sin(bal); disc(g, cx + 30, cy + 40, 19, null, C.ink, 2); g.lineWidth = 1.3; spokes(g, cx + 30, cy + 40, 0, 19, 2, ba); disc(g, cx + 30, cy + 40, 3, C.ink);
        g.beginPath(); g.arc(cx, cy, 86, psi, psi + Math.PI); g.arc(cx, cy, 30, psi + Math.PI, psi, true); g.closePath();
        g.globalAlpha = 0.5; g.fillStyle = C.brass; g.fill(); g.globalAlpha = 1; g.strokeStyle = C.ink; g.lineWidth = 1.8; g.stroke();
        disc(g, cx, cy, 7, C.plate, C.ink, 1.8);
        label(g, on ? 'lying on a table' : 'on a moving wrist', 12, 20); label(g, 'rotor', 322, 300);
      },
      read() { return [swings, Math.round(res * 40) + ' h', res > 0 ? 'running' : 'stopped']; },
      stalled() { return still > 0.5; }
    };
  };

  /* ---------- Oxford Electric Bell ---------- */
  M.oxford = g => {
    let ph = 0, A = 1, rings = 0, sg = 1;
    return {
      step(dt, on) {
        if (on) A = Math.max(0, A - (A / 2.5 + 0.02) * dt); else A += (1 - A) * Math.min(1, 1.3 * dt);
        ph += TAU * 2 * dt; const s = Math.sin(ph) >= 0 ? 1 : -1; if (s !== sg) { sg = s; if (A > 0.7) rings++; }
      },
      draw() {
        ground(g, 70, 350, 318);
        g.fillStyle = C.plate; g.fillRect(96, 276, 228, 20); g.strokeStyle = C.ink; g.lineWidth = 1.8; g.strokeRect(96, 276, 228, 20); L(g, 120, 296, 120, 318); L(g, 300, 296, 300, 318);
        g.beginPath(); g.moveTo(104, 276); g.lineTo(104, 90); g.ellipse(210, 90, 106, 58, 0, Math.PI, TAU); g.lineTo(316, 276);
        g.globalAlpha = 0.05; g.fillStyle = C.ink; g.fill(); g.globalAlpha = 1; g.strokeStyle = C.soft; g.lineWidth = 2; g.stroke();
        g.strokeStyle = C.ink; g.lineWidth = 2.2; L(g, 138, 52, 282, 52);
        for (const cx of [153, 267]) {
          g.fillStyle = C.plate; g.fillRect(cx - 15, 52, 30, 132); g.strokeStyle = C.soft; g.lineWidth = 1; for (let y = 58; y < 184; y += 5) L(g, cx - 15, y, cx + 15, y);
          g.strokeStyle = C.ink; g.lineWidth = 1.8; g.strokeRect(cx - 15, 52, 30, 132); g.fillStyle = C.brass; g.fillRect(cx - 15, 184, 30, 8); g.strokeRect(cx - 15, 184, 30, 8);
          L(g, cx, 192, cx, 204);
          g.beginPath(); g.moveTo(cx - 30, 240); g.quadraticCurveTo(cx - 24, 204, cx, 204); g.quadraticCurveTo(cx + 24, 204, cx + 30, 240); g.closePath();
          g.fillStyle = C.plate; g.fill(); g.globalAlpha = 0.4; g.fillStyle = C.brass; g.fill(); g.globalAlpha = 1; g.lineWidth = 1.8; g.stroke();
        }
        const bx = 210 + 21 * A * Math.sin(ph);
        g.strokeStyle = C.soft; g.lineWidth = 1; L(g, 210, 52, bx, 228); disc(g, bx, 228, 6, C.brass, C.ink, 1.4);
        g.fillStyle = C.ink; g.textAlign = 'center'; g.fillText('+', 153, 258); g.fillText('-', 267, 258); g.textAlign = 'left';
        label(g, 'dry piles', 92, 64, 'right'); label(g, 'bell', 92, 228, 'right');
      },
      read(on) { return [(1e10 + rings).toLocaleString('en-US'), A > 0.7 ? '2 a second' : A > 0.02 ? 'fading' : 'none', on ? 'spent' : 'still some']; },
      stalled(on) { return on && A === 0; }
    };
  };

  /* ---------- the Beverly Clock ---------- */
  M.beverly = g => {
    let cyc = 0.1, Tb = 0, h = 0.6, hm = 0, wth = 0, still = 0;
    return {
      step(dt, on) {
        cyc = (cyc + dt / 7) % 1;
        const want = on ? 0 : Math.sin(TAU * cyc), nT = Tb + (want - Tb) * Math.min(1, 3 * dt), dT = Math.abs(nT - Tb); Tb = nT;
        wth += dT * 2.2; h = clamp(h + dT * 0.42 - 0.085 * dt, 0, 1);
        if (h > 0) hm += dt * 1.1; still = on && h <= 0 ? still + dt : 0;
      },
      draw(on) {
        ground(g, 30, 396, 318);
        const u = (cyc * 2) % 1, sx = 44 + 332 * u, sy = 62 - 40 * Math.sin(Math.PI * u);
        g.strokeStyle = C.line; g.lineWidth = 1; g.setLineDash([3, 5]); g.beginPath(); g.moveTo(44, 62); g.quadraticCurveTo(210, -18, 376, 62); g.stroke(); g.setLineDash([]);
        if (cyc < 0.5) { disc(g, sx, sy, 10, C.brass, C.ink, 1.2); g.strokeStyle = C.brass; g.lineWidth = 1.6; spokes(g, sx, sy, 14, 19, 8, 0); }
        else { disc(g, sx, sy, 10, C.plate, C.ink, 1.4); disc(g, sx + 5, sy - 3, 8, C.plate); }
        // air box and diaphragm
        g.fillStyle = C.plate; g.fillRect(240, 186, 132, 112); g.strokeStyle = C.ink; g.lineWidth = on ? 5 : 2; g.strokeRect(240, 186, 132, 112);
        g.lineWidth = 2; g.beginPath(); g.moveTo(262, 186); g.quadraticCurveTo(306, 186 - 30 * Tb, 350, 186); g.stroke();
        const ry = 186 - 15 * Tb; L(g, 306, ry, 306, 150); disc(g, 306, 134, 17, C.plate, C.ink, 1.8); g.lineWidth = 1.3; gear(g, 306, 134, 13, 12, wth, C.plate);
        g.strokeStyle = C.soft; g.lineWidth = 1.2; L(g, 306, 117, 70, 117); disc(g, 70, 124, 7, C.plate, C.ink, 1.5);
        const wy = 262 - 104 * h; g.strokeStyle = C.soft; L(g, 63, 124, 63, wy);
        g.fillStyle = C.brass; g.fillRect(51, wy, 24, 32); g.strokeStyle = C.ink; g.lineWidth = 1.4; g.strokeRect(51, wy, 24, 32);
        disc(g, 158, 214, 52, C.plate, C.ink, 2); g.lineWidth = 1.2; spokes(g, 158, 214, 45, 52, 12, 0);
        g.lineWidth = 3; L(g, 158, 214, 158 + 24 * Math.sin(hm / 12), 214 - 24 * Math.cos(hm / 12)); g.lineWidth = 1.8; L(g, 158, 214, 158 + 40 * Math.sin(hm), 214 - 40 * Math.cos(hm)); disc(g, 158, 214, 3.5, C.ink);
        label(g, on ? 'box lagged:' : 'sealed box:', 306, 240, 'center'); label(g, on ? 'no swings reach it' : 'a cubic foot of air', 306, 256, 'center');
        label(g, cyc < 0.5 ? 'day' : 'night', 210, 96, 'center'); label(g, 'weight', 63, 310, 'center');
      },
      read() { return [(15 + 6 * Tb).toFixed(1) + ' °C', Math.round(h * 100) + '%', h > 0 ? 'running' : 'stopped']; },
      stalled() { return still > 0.5; }
    };
  };

  /* ---------- the Atmos clock ---------- */
  M.atmos = g => {
    let tp = 0, T = 0, res = 0.8, hm = 0, tt = 0, amp = 1, wth = 0, still = 0;
    return {
      step(dt, on) {
        if (!on) tp += dt;
        const nT = 0.6 * Math.sin(0.55 * tp) + 0.4 * Math.sin(1.4 * tp + 2), dT = Math.abs(nT - T); T = nT;
        wth += dT * 2.4; res = clamp(res + dT * 0.5 - 0.11 * dt, 0, 1);
        amp += ((res > 0 ? 1 : 0) - amp) * Math.min(1, 0.8 * dt);
        if (res > 0) hm += dt * 1.1; tt += dt; still = on && res <= 0 ? still + dt : 0;
      },
      draw() {
        ground(g, 60, 360, 318);
        g.fillStyle = C.plate; g.fillRect(104, 296, 212, 22); g.strokeStyle = C.ink; g.lineWidth = 1.8; g.strokeRect(104, 296, 212, 22);
        g.globalAlpha = 0.05; g.fillStyle = C.ink; g.fillRect(112, 40, 196, 256); g.globalAlpha = 1; g.strokeStyle = C.soft; g.lineWidth = 2; g.strokeRect(112, 40, 196, 256);
        disc(g, 210, 100, 40, C.plate, C.ink, 2); g.lineWidth = 1.2; spokes(g, 210, 100, 34, 40, 12, 0);
        g.lineWidth = 3; L(g, 210, 100, 210 + 19 * Math.sin(hm / 12), 100 - 19 * Math.cos(hm / 12)); g.lineWidth = 1.8; L(g, 210, 100, 210 + 31 * Math.sin(hm), 100 - 31 * Math.cos(hm)); disc(g, 210, 100, 3, C.ink);
        // the gas capsule and its chain
        const len = 42 + 13 * T, x1 = 126 + len;
        g.fillStyle = C.plate; g.fillRect(126, 166, len, 40); g.strokeStyle = C.ink; g.lineWidth = 1.6; g.strokeRect(126, 166, len, 40);
        g.lineWidth = 1; for (let k = 1; k < 7; k++) L(g, 126 + len * k / 7, 166, 126 + len * k / 7, 206);
        g.strokeStyle = C.soft; g.lineWidth = 1.2; L(g, x1, 186, 262, 186); g.strokeStyle = C.ink; g.lineWidth = 1.3; gear(g, 274, 186, 13, 12, wth, C.plate);
        // torsion pendulum
        g.lineWidth = 1.2; L(g, 210, 140, 210, 256);
        const ang = 2.4 * amp * Math.sin(tt * TAU / 3.4);
        g.beginPath(); g.ellipse(210, 262, 54, 11, 0, 0, TAU); g.fillStyle = C.plate; g.fill(); g.globalAlpha = 0.35; g.fillStyle = C.brass; g.fill(); g.globalAlpha = 1; g.lineWidth = 1.8; g.stroke();
        for (let k = 0; k < 6; k++) { const a = ang + k * TAU / 6; disc(g, 210 + 46 * Math.cos(a), 262 + 9 * Math.sin(a), Math.sin(a) > 0 ? 3.2 : 2.2, C.ink); }
        // room thermometer
        g.fillStyle = C.plate; g.fillRect(62, 86, 10, 180); g.strokeStyle = C.ink; g.lineWidth = 1.4; g.strokeRect(62, 86, 10, 180);
        const ty = 176 - 60 * T; g.fillStyle = C.stamp; g.fillRect(64, ty, 6, 266 - ty); disc(g, 67, 272, 9, C.stamp, C.ink, 1.4);
        label(g, 'room', 67, 76, 'center'); label(g, 'capsule of gas', 126, 226); label(g, 'slow twisting pendulum', 210, 290, 'center');
      },
      read() { return [(20 + 1.5 * T).toFixed(1) + ' °C', Math.round(res * 100) + '%', res > 0 ? 'running' : 'stopped']; },
      stalled() { return still > 0.5; }
    };
  };

  /* ---------- the drinking bird ---------- */
  M.bird = g => {
    const PV = [190, 172];
    let p = 0.2, dips = 0, rate = 1, phi = 0.4;
    return {
      step(dt, on) {
        rate += ((on ? 0 : 1) - rate) * Math.min(1, 0.5 * dt); if (on && rate < 0.03) rate = 0;
        p += rate * dt / 5.2; if (p >= 1) { p -= 1; dips++; }
        const tg = p < 0.72 ? 0.3 + 0.78 * Math.pow(p / 0.72, 2) + 0.1 * Math.sin(p * 44) * (1 - p / 0.72) : p < 0.84 ? 1.56 : 1.56 - 1.26 * ((p - 0.84) / 0.16);
        phi += ((on ? 0.45 + (tg - 0.45) * rate : tg) - phi) * Math.min(1, 10 * dt);
      },
      draw(on) {
        ground(g, 40, 380, 318);
        g.fillStyle = C.plate; g.fillRect(150, 292, 80, 10); g.strokeStyle = C.ink; g.lineWidth = 1.8; g.strokeRect(150, 292, 80, 10); g.strokeRect(252, 238, 82, 64);
        g.lineWidth = 2.2; L(g, PV[0], PV[1], 166, 292); L(g, PV[0], PV[1], 214, 292);
        g.globalAlpha = 0.45; g.fillStyle = C.water; g.fillRect(260, 166, 66, 72); g.globalAlpha = 1; g.strokeStyle = C.ink; g.lineWidth = 1.8; L(g, 260, 150, 260, 238); L(g, 260, 238, 326, 238); L(g, 326, 150, 326, 238);
        const ux = Math.sin(phi), uy = -Math.cos(phi), Hd = [PV[0] + 78 * ux, PV[1] + 78 * uy], Bc = [PV[0] - 62 * ux, PV[1] - 62 * uy];
        const fl = p < 0.72 ? p / 0.72 : Math.max(0, 1 - (p - 0.72) / 0.12);
        g.lineCap = 'butt'; g.strokeStyle = C.ink; g.lineWidth = 9; L(g, Bc[0], Bc[1], Hd[0], Hd[1]); g.strokeStyle = C.plate; g.lineWidth = 5.5; L(g, Bc[0], Bc[1], Hd[0], Hd[1]);
        g.strokeStyle = C.stamp; g.globalAlpha = 0.7; L(g, Bc[0], Bc[1], Bc[0] + 132 * fl * ux, Bc[1] + 132 * fl * uy); g.globalAlpha = 1; g.lineCap = 'round';
        disc(g, Bc[0], Bc[1], 21, C.plate, C.ink, 1.8); g.globalAlpha = 0.55; disc(g, Bc[0], Bc[1], 16, C.stamp); g.globalAlpha = 1;
        const nx = -uy, ny = ux;
        poly(g, [[Hd[0] + 10 * ux + 5 * nx, Hd[1] + 10 * uy + 5 * ny], [Hd[0] + 36 * ux + 9 * nx, Hd[1] + 36 * uy + 9 * ny], [Hd[0] + 6 * ux + 12 * nx, Hd[1] + 6 * uy + 12 * ny]], true); g.fillStyle = C.brass; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.3; g.stroke();
        disc(g, Hd[0], Hd[1], 13, C.plate, C.ink, 1.8); g.globalAlpha = 0.4; disc(g, Hd[0], Hd[1], 13, on ? C.soft : C.water); g.globalAlpha = 1; disc(g, Hd[0] + 4 * ux + 5 * nx, Hd[1] + 4 * uy + 5 * ny, 2, C.ink);
        g.fillStyle = C.ink; poly(g, [[Hd[0] - 12 * nx + 2 * ux, Hd[1] - 12 * ny + 2 * uy], [Hd[0] - 12 * nx + 14 * ux, Hd[1] - 12 * ny + 14 * uy], [Hd[0] - 4 * nx + 16 * ux, Hd[1] - 4 * ny + 16 * uy], [Hd[0] - 4 * nx + 9 * ux, Hd[1] - 4 * ny + 9 * uy]], true); g.fill();
        disc(g, PV[0], PV[1], 4, C.plate, C.ink, 1.6);
        if (on) { g.beginPath(); g.moveTo(40, 302); g.lineTo(40, 96); g.ellipse(196, 96, 156, 76, 0, Math.PI, TAU); g.lineTo(352, 302); g.globalAlpha = 0.05; g.fillStyle = C.ink; g.fill(); g.globalAlpha = 1; g.strokeStyle = C.soft; g.lineWidth = 2; g.stroke(); }
        label(g, on ? 'under a jar the air turns damp' : 'wet head, dry room', 12, 16);
      },
      read(on) { return [dips, rate > 0.5 ? '18.6 °C' : '20.0 °C', '20.0 °C']; },
      stalled(on) { return on && rate === 0; }
    };
  };
