// Perpetuum Mobile. Copyright (C) 2026 Jurgen Kobierczynski.
// SPDX-License-Identifier: GPL-3.0-only
// Made with Claude Opus 5.5 Medium.
// Machines: more of the second kind. Each M.name = g => ({ step, draw, read, stalled }).

  /* ---------- Smoluchowski's trapdoor ---------- */
  M.trapdoor = g => {
    const X0 = 30, X1 = 390, Y0 = 50, Y1 = 236, WX = 210, D0 = 108, D1 = 178, P = [];
    for (let i = 0; i < 38; i++) {
      const sp = 75 + Math.random() * 40, a = Math.random() * TAU;
      let x = X0 + 8 + Math.random() * (X1 - X0 - 16); if (Math.abs(x - WX) < 8) x += 20;
      P.push({ x, y: Y0 + 8 + Math.random() * (Y1 - Y0 - 16), vx: sp * Math.cos(a), vy: sp * Math.sin(a) });
    }
    let open = 0, flap = false, tf = 0, tOn = 0, nl = 19, nr = 19, th = 0;
    return {
      step(dt, on) {
        tOn = on ? tOn + dt : 0; open = Math.max(0, open - dt);
        if (on) { tf -= dt; if (tf <= 0) { flap = !flap; tf = 0.12 + Math.random() * 0.35; } }
        nl = 0; nr = 0;
        for (const p of P) {
          const px = p.x; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < X0 + 4) { p.x = X0 + 4; p.vx = Math.abs(p.vx); } if (p.x > X1 - 4) { p.x = X1 - 4; p.vx = -Math.abs(p.vx); }
          if (p.y < Y0 + 4) { p.y = Y0 + 4; p.vy = Math.abs(p.vy); } if (p.y > Y1 - 4) { p.y = Y1 - 4; p.vy = -Math.abs(p.vy); }
          if ((px - WX) * (p.x - WX) <= 0) {
            const ok = p.y > D0 + 3 && p.y < D1 - 3 && (on ? flap : p.vx > 0);
            if (ok) { if (!on) open = 0.16; } else { p.x = px; p.vx = -p.vx; }
          }
          if (p.x < WX) nl++; else nr++;
        }
        th += Math.max(0, nr - nl) / 38 * 6 * dt;
      },
      draw(on) {
        g.strokeStyle = C.ink; g.lineWidth = 5.5; poly(g, [[110, Y1], [110, 290], [310, 290], [310, Y1]]); g.stroke();
        g.strokeStyle = C.plate; g.lineWidth = 2.6; poly(g, [[110, Y1 + 2], [110, 290], [310, 290], [310, Y1 + 2]]); g.stroke();
        disc(g, 210, 290, 15, C.plate, C.ink, 1.8); g.lineWidth = 2; spokes(g, 210, 290, 3, 15, 4, th); disc(g, 210, 290, 3, C.ink);
        g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(X0, Y0, X1 - X0, Y1 - Y0);
        g.lineWidth = 3.4; L(g, WX, Y0, WX, D0); L(g, WX, D1, WX, Y1);
        const sw = on ? (flap ? 0.7 : 0.08) : (open > 0 ? 0.7 : 0);
        g.strokeStyle = C.brass; g.lineWidth = 2.8; L(g, WX, D0, WX + (D1 - D0) * Math.sin(sw), D0 + (D1 - D0) * Math.cos(sw));
        g.strokeStyle = C.soft; g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= 12; i++) { const x = WX + 4 + i * 2.6, y = D0 - 6 + (i % 2 ? -4 : 4); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
        for (const p of P) disc(g, p.x, p.y, 3, C.soft);
        label(g, on ? 'the flap is warm too, and flutters' : 'flap opens one way only', X0, Y0 - 10);
        label(g, 'turbine', 232, 316);
      },
      read(on) { return [nl, nr, on ? 'fluttering' : 'one-way']; },
      stalled(on) { return on && tOn > 7; }
    };
  };

  /* ---------- Szilard's engine ---------- */
  M.szilard = g => {
    const XA = 60, XB = 360, YA = 110, YB = 190, DUR = [1.3, 0.4, 0.5, 1.7, 0.9];
    let x = 120, y = 150, vx = 170, vy = 110, ph = 0, t = 0, side = -1, pist = 210, cycles = 0, cycOn = 0, lift = 0;
    return {
      set() { cycOn = 0; },
      step(dt, on) {
        t += dt;
        if (t > DUR[ph]) {
          t = 0; ph = (ph + 1) % 5;
          if (ph === 1) { if (Math.abs(x - 210) < 8) x += x < 210 ? -10 : 10; side = x < 210 ? -1 : 1; pist = 210; }
          if (ph === 0) { cycles++; if (on) cycOn++; side = 0; }
        }
        if (ph === 3) pist = 210 - side * 138 * Math.min(1, t / DUR[3]);
        if (ph === 3) lift = Math.min(1, t / DUR[3]);
        if (ph === 4) lift = on ? 1 - Math.min(1, t / DUR[4]) : 1;
        if (ph === 0) lift = on ? 0 : Math.max(0, lift - dt * 3);
        const lo = ph >= 1 && ph <= 3 && side > 0 ? pist + 5 : XA + 4, hi = ph >= 1 && ph <= 3 && side < 0 ? pist - 5 : XB - 4;
        x += vx * dt; y += vy * dt;
        if (x < lo) { x = lo; vx = Math.abs(vx); } if (x > hi) { x = hi; vx = -Math.abs(vx); }
        if (y < YA + 4) { y = YA + 4; vy = Math.abs(vy); } if (y > YB - 4) { y = YB - 4; vy = -Math.abs(vy); }
      },
      draw(on) {
        g.fillStyle = C.plate; g.fillRect(XA, YA, XB - XA, YB - YA); g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(XA, YA, XB - XA, YB - YA);
        if (ph >= 1 && ph <= 3) {
          const drop = ph === 1 ? Math.min(1, t / DUR[1]) : 1;
          g.strokeStyle = C.ink; g.lineWidth = 5; L(g, pist, YA - 26 + 26 * drop, pist, YA + (YB - YA) * drop);
        } else { g.strokeStyle = C.soft; g.lineWidth = 5; L(g, 210, YA - 30, 210, YA - 6); }
        disc(g, x, y, 5, C.stamp, C.ink, 1);
        // the weight the gas lifts
        const wy = 300 - 26 - lift * 44;
        g.strokeStyle = C.soft; g.lineWidth = 1; L(g, 386, 300, 386, 222); for (let k = 0; k <= 4; k++) L(g, 386, 300 - k * 11 - 26, 392, 300 - k * 11 - 26);
        g.strokeStyle = C.ink; g.lineWidth = 1.2; L(g, 356, YB, 356, wy);
        g.fillStyle = C.brass; g.fillRect(342, wy, 28, 26); g.strokeRect(342, wy, 28, 26);
        ground(g, 320, 400, 300);
        // the demon's record
        g.fillStyle = C.plate; g.fillRect(150, 226, 120, 50); g.strokeStyle = C.ink; g.lineWidth = 1.6; g.strokeRect(150, 226, 120, 50);
        const erasing = on && ph === 4;
        g.fillStyle = erasing ? C.stamp : C.ink; g.font = '700 26px ' + MONO; g.textAlign = 'center';
        g.fillText(erasing ? 'wipe' : ph >= 2 && side ? (side < 0 ? 'LEFT' : 'RIGHT') : '· · ·', 210, 261);
        g.font = '500 12.5px ' + MONO; g.textAlign = 'left';
        if (erasing) { g.strokeStyle = C.stamp; g.lineWidth = 1.6; arrow(g, 140, 240, 116, 232, 7); arrow(g, 140, 262, 116, 270, 7); arrow(g, 280, 240, 304, 232, 7); }
        label(g, 'one molecule', XA, YA - 12); label(g, 'record', 210, 294, 'center'); label(g, 'partition', 222, YA - 14);
      },
      read(on) { return [cycles, 'kT ln 2', on ? 'kT ln 2' : 'ignored']; },
      stalled(on) { return on && cycOn >= 2; }
    };
  };

  /* ---------- Loschmidt's gas column ---------- */
  M.loschmidt = g => {
    const X0 = 150, X1 = 270, Y0 = 36, Y1 = 300, P = [], d = drive(1.4, 2.6);
    for (let i = 0; i < 44; i++) { const sp = 60 + Math.random() * 50, a = Math.random() * TAU; P.push({ x: X0 + 6 + Math.random() * (X1 - X0 - 12), y: Y1 - 6 - 250 * Math.pow(Math.random(), 1.8), vx: sp * Math.cos(a), vy: sp * Math.sin(a), vf: 90 + Math.random() * 85 }); }
    let th = 0;
    return {
      step(dt, on) {
        d.step(dt, on); th += d.v * dt;
        for (const p of P) {
          p.vy += 70 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < X0 + 4) { p.x = X0 + 4; p.vx = Math.abs(p.vx); } if (p.x > X1 - 4) { p.x = X1 - 4; p.vx = -Math.abs(p.vx); }
          if (p.y < Y0 + 4) { p.y = Y0 + 4; p.vy = Math.abs(p.vy); } if (p.y > Y1 - 4) { p.y = Y1 - 4; p.vy = -p.vf; }   // the warm floor sends each one up again
        }
      },
      draw(on) {
        ground(g, 60, 380, 318);
        g.strokeStyle = C.ink; g.lineWidth = 1.6; poly(g, [[X1, 60], [336, 60], [336, 150]]); g.stroke(); poly(g, [[X1, 280], [336, 280], [336, 198]]); g.stroke();
        disc(g, 336, 174, 26, C.plate, C.ink, 2); g.lineWidth = 1.4; spokes(g, 336, 174, 5, 26, 4, th); disc(g, 336, 174, 5, C.plate, C.ink, 1.6);
        g.fillStyle = C.plate; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0); g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(X0, Y0, X1 - X0, Y1 - Y0);
        L(g, X0, Y1, X0, 318); L(g, X1, Y1, X1, 318);
        for (const p of P) disc(g, p.x, p.y, 3, on ? C.soft : (p.y < 150 ? C.water : p.y > 215 ? C.stamp : C.soft));
        g.strokeStyle = C.soft; g.lineWidth = 1.4; arrow(g, 110, 120, 110, 210, 8);
        label(g, 'gravity', 100, 110, 'right'); label(g, on ? 'top: 300 K' : 'top: 280 K', 140, 50, 'right'); label(g, 'bottom: 300 K', 140, 296, 'right');
        label(g, 'engine', 336, 222, 'center');
      },
      read(on) { return ['300 K', on ? '300 K' : '280 K', (d.v * 60 / TAU).toFixed(1) + ' rpm']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- heat pump feeding a heat engine ---------- */
  M.heatpump = g => {
    const d = drive(1, 2.6);
    let th = 0, flow = 0;
    return {
      step(dt, on) { d.step(dt, on); th += 2.4 * d.v * dt; flow += 40 * d.v * dt; },
      draw(on) {
        const f = d.frac, fat = (u, x1, y1, x2, y2, col) => { g.strokeStyle = col; g.lineWidth = 2 + 4 * u * f; g.setLineDash([8, 5]); g.lineDashOffset = -flow; g.lineCap = 'butt'; L(g, x1, y1, x2, y2); g.setLineDash([]); g.lineCap = 'round'; };
        g.globalAlpha = 0.3; g.fillStyle = C.stamp; g.fillRect(60, 40, 300, 30); g.fillStyle = C.water; g.fillRect(60, 270, 300, 30); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.8; g.strokeRect(60, 40, 300, 30); g.strokeRect(60, 270, 300, 30);
        fat(2, 130, 270, 130, 206, C.water); fat(3, 130, 134, 130, 72, C.stamp);
        fat(3, 290, 70, 290, 134, C.stamp); fat(on ? 2.4 : 1.6, 290, 206, 290, 268, C.water);
        fat(on ? 0.6 : 1.4, 254, 170, 168, 170, C.brass);
        g.lineDashOffset = 0;
        for (const cx of [130, 290]) { disc(g, cx, 170, 36, C.plate, C.ink, 2); g.lineWidth = 1.4; spokes(g, cx, 170, 6, 26, 5, cx < 200 ? th : -th); disc(g, cx, 170, 6, C.plate, C.ink, 1.6); }
        g.strokeStyle = C.brass; g.lineWidth = 2; arrow(g, 180, 170, 168, 170, 9);
        label(g, 'warm room', 210, 60, 'center'); label(g, 'cold outdoors', 210, 290, 'center');
        label(g, 'pump', 130, 226, 'center'); label(g, 'engine', 290, 226, 'center'); label(g, 'work', 210, 160, 'center');
      },
      read(on) { const f = d.frac; return [(1 * f).toFixed(1) + ' kW', (3 * f).toFixed(1) + ' kW', ((on ? 0.6 : 1.4) * f).toFixed(1) + ' kW']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- thermocouple loop at one temperature ---------- */
  M.thermoloop = g => {
    const cx = 210, cy = 172, R = 96;
    let I = 1, th = 0, still = 0;
    return {
      step(dt, on) {
        if (on) { I = Math.max(0, I - (I / 0.6 + 0.03) * dt); still = I === 0 ? still + dt : 0; } else { I += (1 - I) * Math.min(1, 1.5 * dt); still = 0; }
        th += I * 1.4 * dt;
      },
      draw(on) {
        g.lineCap = 'butt'; g.lineWidth = 13; g.strokeStyle = C.ink; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke();
        g.lineWidth = 10; g.strokeStyle = C.brass; g.beginPath(); g.arc(cx, cy, R, Math.PI / 2, 1.5 * Math.PI); g.stroke();
        g.strokeStyle = C.soft; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2); g.stroke(); g.lineCap = 'round';
        disc(g, cx, cy - R, 8, C.plate, C.ink, 2); disc(g, cx, cy + R, 8, C.plate, C.ink, 2);
        g.globalAlpha = 0.2 + 0.8 * I; for (let k = 0; k < 14; k++) { const a = th + k * TAU / 14; disc(g, cx + R * Math.cos(a), cy + R * Math.sin(a), 2.6, C.plate, C.ink, 0.9); } g.globalAlpha = 1;
        disc(g, cx, cy, 40, C.plate, C.ink, 1.8); g.strokeStyle = C.soft; g.lineWidth = 1; spokes(g, cx, cy, 34, 40, 12, 0);
        const na = -Math.PI / 2 + 1.05 * I, ca = Math.cos(na), sa = Math.sin(na);
        poly(g, [[cx + 30 * ca, cy + 30 * sa], [cx - 5 * sa, cy + 5 * ca], [cx + 5 * sa, cy - 5 * ca]], true); g.fillStyle = C.stamp; g.fill();
        poly(g, [[cx - 30 * ca, cy - 30 * sa], [cx - 5 * sa, cy + 5 * ca], [cx + 5 * sa, cy - 5 * ca]], true); g.fillStyle = C.soft; g.fill();
        disc(g, cx, cy, 3, C.ink);
        label(g, 'copper', cx - R - 12, cy + 4, 'right'); label(g, 'bismuth', cx + R + 12, cy + 4);
        label(g, '+2 mV', cx + 14, cy - R - 14); label(g, on ? '-2 mV: they cancel' : '+2 mV', cx + 14, cy + R + 22);
      },
      read(on) { return ['+2 mV', on ? '-2 mV' : '+2 mV', (I * 30).toFixed(0) + ' mA']; },
      stalled() { return still > 0.6; }
    };
  };

  /* ---------- radiometer in an even room ---------- */
  M.radiometer = g => {
    const d = drive(1.6, 3), cx = 210, cy = 150;
    let th = 0, w = 0;
    return {
      step(dt, on) { d.step(dt, on); th -= d.v * dt; w += dt; },
      draw(on) {
        ground(g, 90, 330, 318);
        g.strokeStyle = C.ink; g.lineWidth = 2; poly(g, [[196, 246], [190, 300], [150, 310], [150, 318]]); g.stroke(); poly(g, [[224, 246], [230, 300], [270, 310], [270, 318]]); g.stroke();
        g.globalAlpha = 0.06; disc(g, cx, cy, 102, C.ink); g.globalAlpha = 1; disc(g, cx, cy, 102, null, C.soft, 2);
        g.strokeStyle = C.stamp; g.lineWidth = 1.4; g.globalAlpha = 0.35 + 0.5 * d.frac;
        for (let k = 0; k < 6; k++) {
          const a = k * TAU / 6 + 0.5, ca = Math.cos(a), sa = Math.sin(a);
          g.beginPath(); for (let i = 0; i <= 12; i++) { const r = 150 - i * 2.2, o = 3 * Math.sin(i * 1.1 - w * 5); const x = cx + r * ca - o * sa, y = cy + r * sa + o * ca; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
          arrow(g, cx + 124 * ca, cy + 124 * sa, cx + 114 * ca, cy + 114 * sa, 7);
        }
        g.globalAlpha = 1;
        for (let k = 0; k < 4; k++) {
          // each vane is a plate seen edge-on: black on one face, bright on the other
          const a = th + k * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a), P = (r, o) => [cx + r * ca - o * sa, cy + r * sa + o * ca];
          g.strokeStyle = C.ink; g.lineWidth = 1.4; L(g, cx, cy, cx + 46 * ca, cy + 46 * sa);
          g.lineCap = 'butt'; g.lineWidth = 5;
          let p1 = P(44, 2.5), p2 = P(80, 2.5); L(g, p1[0], p1[1], p2[0], p2[1]);
          g.strokeStyle = C.brass; p1 = P(44, -2.5); p2 = P(80, -2.5); L(g, p1[0], p1[1], p2[0], p2[1]);
          g.lineCap = 'round';
        }
        disc(g, cx, cy, 4, C.plate, C.ink, 1.6); g.strokeStyle = C.ink; g.lineWidth = 1.6; L(g, cx, cy, cx, 248);
        label(g, on ? 'room, glass and vanes all at 20 °C' : 'the warmth of the room', 12, 20);
      },
      read(on) { return [(d.v * 60 / TAU).toFixed(1) + ' rpm', on ? '20.0 °C' : '20.6 °C', '20.0 °C']; },
      stalled() { return d.stalled(); }
    };
  };

  /* ---------- one-way mirror between two bodies ---------- */
  M.mirror = g => {
    const ph = [];
    let Ta = 300, Tb = 300, acc = 0, flip = false;
    return {
      step(dt, on) {
        acc += dt; if (acc > 0.11) { acc = 0; flip = !flip; ph.push({ x: flip ? 134 : 286, y: 118 + Math.random() * 104, v: flip ? 150 : -150, born: flip ? 0 : 1 }); }
        for (const p of ph) {
          const px = p.x; p.x += p.v * dt;
          if (!on && p.v < 0 && px >= 213 && p.x < 213) { p.x = 213; p.v = -p.v; }
        }
        for (let i = ph.length - 1; i >= 0; i--) if (ph[i].x < 132 || ph[i].x > 288) ph.splice(i, 1);
        Ta += ((on ? 300 : 255) - Ta) * Math.min(1, 0.25 * dt); Tb += ((on ? 300 : 345) - Tb) * Math.min(1, 0.25 * dt);
      },
      draw(on) {
        const body = (x, T) => {
          g.fillStyle = C.plate; g.fillRect(x, 108, 82, 124);
          g.globalAlpha = clamp(Math.abs(T - 300) / 70, 0, 0.7); g.fillStyle = T > 300 ? C.stamp : C.water; g.fillRect(x, 108, 82, 124); g.globalAlpha = 1;
          g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(x, 108, 82, 124);
        };
        body(50, Ta); body(288, Tb);
        g.strokeStyle = C.ink; g.lineWidth = 3; L(g, 210, 88, 210, 252);
        g.strokeStyle = C.soft; g.lineWidth = 1.2; for (let y = 96; y < 250; y += 12) L(g, 213, y, on ? 213 : 219, on ? y : y + 6);
        for (const p of ph) disc(g, p.x, p.y, 2.4, C.brass, C.ink, 0.6);
        g.fillStyle = C.ink; g.textAlign = 'center'; g.fillText(Math.round(Ta) + ' K', 91, 174); g.fillText(Math.round(Tb) + ' K', 329, 174); g.textAlign = 'left';
        label(g, 'body A', 91, 100, 'center'); label(g, 'body B', 329, 100, 'center');
        label(g, on ? 'passes both ways' : 'one-way mirror', 210, 76, 'center'); label(g, 'heat rays', 210, 276, 'center');
      },
      read(on) { return [Math.round(Ta) + ' K', Math.round(Tb) + ' K', on ? 'two-way' : 'one-way']; },
      stalled(on) { return on && Math.abs(Ta - Tb) < 5; }
    };
  };
