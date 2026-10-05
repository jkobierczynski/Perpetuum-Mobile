// Perpetuum Mobile. Copyright (C) 2026 Jurgen Kobierczynski.
// SPDX-License-Identifier: GPL-3.0-only
// Made with Claude Opus 5.5 Medium.
//
// Builds dist/index.html (the gallery) and one dist/<machine>.html per machine.
// Every page is self-contained: styles and scripts are inlined. Run: node build.js
const fs = require('fs');
const SRC = __dirname + '/src/', DIST = __dirname + '/dist/';
const rd = f => fs.readFileSync(SRC + f, 'utf8');
const css = rd('pm.css'), helpers = rd('helpers.js'), runtime = rd('runtime.js');
const msrc = fs.readdirSync(SRC + 'machines').filter(f => f.endsWith('.js')).sort().map(f => rd('machines/' + f)).join('\n');
const NOTICE = '<!-- Perpetuum Mobile. Copyright (C) 2026 Jurgen Kobierczynski. SPDX-License-Identifier: GPL-3.0-only. Made with Claude Opus 5.5 Medium. -->';
const COLOPHON = '<p class="colophon">Perpetuum Mobile · Copyright © 2026 Jurgen Kobierczynski · Free software under the <a href="https://www.gnu.org/licenses/gpl-3.0.html">GNU General Public License, version 3</a>, with no warranty · Made with Claude Opus 5.5 Medium</p>';
const chunks = {};
msrc.split(/\n(?=  \/\* -{10} )/).forEach(c => { const m = c.match(/^  M\.(\w+) = g => \{/m); if (m) chunks[m[1]] = c; });
const FIGS = require('./src/figs.js'), N = FIGS.length;
FIGS.forEach(f => { if (!chunks[f.m]) throw new Error('no machine code for ' + f.m); });
const G = {
  1: { id: 'first', name: 'First kind', h: 'The first kind', tag: 'First kind · work from nothing', whyh: 'Why it stops', stamp: 'Refused',
    desc: 'Machines that give out more work than they take in. The first law of thermodynamics says energy is never created, so each of these hides a mistake in the bookkeeping.' },
  2: { id: 'second', name: 'Second kind', h: 'The second kind', tag: 'Second kind · work from heat at one temperature', whyh: 'Why it stops', stamp: 'Refused',
    desc: 'Machines that create no energy. They take heat from surroundings at a single temperature and turn it into work, which the second law of thermodynamics forbids.' },
  3: { id: 'third', name: 'Third kind', h: 'The third kind', tag: 'Third kind · loses nothing, so never stops', whyh: 'Why it stops', stamp: 'Refused',
    desc: 'Machines that keep moving because nothing takes their energy away. They make no claim to give out work, and they fail because some loss always remains.' },
  4: { id: 'impostors', name: 'Impostor', h: 'The impostors', tag: 'Impostor', whyh: 'What really drives it', stamp: 'Unmasked',
    desc: 'Machines that did run, some for a season and some for centuries, on energy that nobody mentioned. Two were frauds. The rest are honest devices that live off small changes in their surroundings.' }
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Besley:wght@500;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">';
const script = slugs => '<script>\n(() => {\n' + helpers + '\n  const M = {};\n' + slugs.map(s => chunks[s]).join('\n') + '\n' + runtime + '})();\n</script>';
const num = i => 'Fig. ' + (i + 1);
const head = title => `<!doctype html>
${NOTICE}
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
${FONTS}
<style>
:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0}
[hidden]{display:none!important}
${css}</style>
</head>
<body>`;

fs.mkdirSync(DIST, { recursive: true });

// one page per machine
FIGS.forEach((F, i) => {
  const g = G[F.k], prev = FIGS[(i + N - 1) % N], next = FIGS[(i + 1) % N], pi = (i + N - 1) % N, ni = (i + 1) % N;
  const html = `${head(F.title)}
<main class="sheet page">
  <header class="mast">
    <nav class="crumbs" aria-label="Back"><a href="index.html">← All ${N} machines</a></nav>
    <p class="eyebrow">${num(i)} · ${esc(F.tag || g.tag)}</p>
    <h1 class="h1m">${esc(F.title)}</h1>
    <dl class="titleblock tb3">
      <div class="cell"><dt>Sheet</dt><dd>${i + 1} of ${N}</dd></div>
      <div class="cell"><dt>Group</dt><dd>${esc(g.h)}</dd></div>
      <div class="cell"><dt>Motion</dt><dd><button class="btn" id="pause" type="button">Pause</button></dd></div>
    </dl>
  </header>
  <section class="plate unit" aria-label="${esc(F.title)}">
    <figure class="fig">
      <div class="stage"><canvas data-m="${F.m}" role="img" aria-label="${esc(F.aria)}"></canvas>
        <div class="stamp" hidden><b>${g.stamp}</b><span>${esc(F.stamp)}</span></div></div>
      <figcaption>${num(i)} · ${esc(F.cap)}</figcaption>
      <dl class="readout">${F.read.map(r => `<div><dt>${esc(r)}</dt><dd>–</dd></div>`).join('')}</dl>
    </figure>
    <div class="spec">
      <p class="why">The claim</p>
      <p>${esc(F.claim)}</p>
      <button class="switch" id="sw" type="button" role="switch" aria-checked="false" aria-labelledby="swn" data-off="${esc(F.law[1])}" data-on="${esc(F.law[2])}">
        <span class="track"><span class="thumb"></span></span>
        <span class="swtext"><span class="swname" id="swn">${esc(F.law[0])}</span><span class="swstate">${esc(F.law[1])}</span></span>
      </button>
      <p class="why">${g.whyh}</p>
      <p>${esc(F.why)}</p>
    </div>
  </section>
  <nav class="pager" aria-label="Other machines">
    <a class="prev" href="${prev.m}.html"><span>← ${num(pi)}</span><b>${esc(prev.title)}</b></a>
    <a class="next" href="${next.m}.html"><span>${num(ni)} →</span><b>${esc(next.title)}</b></a>
  </nav>
  ${COLOPHON}
</main>
${script([F.m])}
</body>
</html>
`;
  fs.writeFileSync(DIST + F.m + '.html', html);
});

// the gallery
const ranges = {}; FIGS.forEach((F, i) => { (ranges[F.k] = ranges[F.k] || []).push(i + 1); });
const rg = k => 'figs. ' + ranges[k][0] + '–' + ranges[k][ranges[k].length - 1];
const SOURCES = [
  ['History of perpetual motion machines (Wikipedia)', 'https://en.wikipedia.org/wiki/History_of_perpetual_motion_machines'],
  ['Donald Simanek, The Museum of Unworkable Devices', 'https://dsimanek.vialattea.net/museum/unwork.htm'],
  ['Museo Galileo, Taccola\'s wheel with articulated arms', 'https://mostre.museogalileo.it/motoperpetuo/en/before-leonardo/the-sienese-engineers/perpetual-wheel-with-articulated-arms.html'],
  ['Linda Hall Library, Simon Stevin', 'https://www.lindahall.org/about/news/scientist-of-the-day/simon-stevin/'],
  ['Britannica, closed-cycle water mill', 'https://britannica.com/technology/closed-cycle-water-mill'],
  ['Scientific American (1911), on Papin and the mercury bellows', 'https://www.scientificamerican.com/article/perpetual-motion-1911-11-18/'],
  ['Johann Bessler (Wikipedia)', 'https://en.wikipedia.org/wiki/Johann_Bessler'],
  ['Charles Redheffer (Wikipedia)', 'https://en.wikipedia.org/wiki/Charles_Redheffer'],
  ['John Keely (Wikipedia)', 'https://www.wikipedia.org/wiki/John_Keely'],
  ['Chemistry World, on Gamgee\'s zeromotor', 'https://www.chemistryworld.com/opinion/the-impossible-dream-of-perpetual-motion-machines/3004957.article'],
  ['Maxwell\'s demon (Wikipedia)', 'https://en.wikipedia.org/wiki/Maxwell%27s_demon'],
  ['Brownian ratchet (Wikipedia)', 'https://en.wikipedia.org/wiki/Brownian_ratchet'],
  ['Crookes radiometer (Wikipedia)', 'https://en.wikipedia.org/wiki/Crookes_radiometer'],
  ['Cox\'s timepiece (Wikipedia)', 'https://en.wikipedia.org/wiki/Cox%27s_timepiece'],
  ['Atmos clock (Wikipedia)', 'https://en.wikipedia.org/wiki/Atmos_clock'],
  ['Beverly Clock (Wikipedia)', 'https://en.wikipedia.org/wiki/Beverly_Clock'],
  ['Oxford Electric Bell (Wikipedia)', 'https://en.wikipedia.org/wiki/Oxford_Electric_Bell'],
  ['Drinking bird (Wikipedia)', 'https://en.wikipedia.org/wiki/Drinking_bird'],
  ['Automatic watch (Wikipedia)', 'https://en.wikipedia.org/wiki/Automatic_watch']
];
const body = `<main class="sheet">
  <header class="mast">
    <p class="eyebrow">${N} machines · three kinds and some impostors</p>
    <h1>Perpetuum Mobile</h1>
    <p class="lede">${N} machines that claim to run for ever. Physicists sort such machines into three kinds, by the rule each one has to break. On these sheets they do run for ever, because that rule is switched off. Open a machine to read its claim, switch the rule back on, and watch it stop.</p>
    <dl class="titleblock">
      <div class="cell"><dt>Sheets</dt><dd>${N}, one per machine</dd></div>
      <div class="cell"><dt>Scale</dt><dd>None of it to scale</dd></div>
      <div class="cell"><dt>Physics</dt><dd><button class="btn" id="master" type="button" data-off="Enforce on all ${N}" data-on="Suspend on all ${N}">Enforce on all ${N}</button></dd></div>
      <div class="cell"><dt>Motion</dt><dd><button class="btn" id="pause" type="button">Pause</button></dd></div>
    </dl>
    <nav class="jump" aria-label="Groups">${[1, 2, 3, 4].map(k => `<a href="#${G[k].id}">${G[k].h.replace('The ', '').replace(/^./, c => c.toUpperCase())} · ${rg(k)}</a>`).join('')}</nav>
  </header>
${[1, 2, 3, 4].map(k => `
  <section class="group" id="${G[k].id}" aria-labelledby="g${k}">
    <header><p class="eyebrow">${rg(k).replace('figs', 'Figs')}</p><h2 id="g${k}">${G[k].h}</h2><p>${G[k].desc}</p></header>
    <div class="cards">
${FIGS.map((F, i) => F.k !== k ? '' : `      <a class="card unit" href="${F.m}.html"><div class="stage"><canvas data-m="${F.m}" role="img" aria-label="${esc(F.aria)}"></canvas><div class="stamp" hidden><b>${G[k].stamp}</b></div></div><span class="num">${num(i)}</span><span class="ct">${esc(F.title)}</span><span class="cc">${esc(F.cap)}</span></a>
`).join('')}    </div>
  </section>`).join('\n')}

  <p class="foot">In 1775 the Royal Academy of Sciences in Paris resolved to stop examining proposals for perpetual motion. With its rule suspended, each figure here is helped along by an unseen hand. With the rule in force it runs down as the real thing would. The numbers in the readouts are illustrative.</p>
  <div class="sources"><p>Names, dates and mechanisms were checked against these sources in October 2026.</p>
    <ul>${SOURCES.map(s => `<li><a href="${s[1]}">${esc(s[0])}</a></li>`).join('')}</ul></div>
  ${COLOPHON}
</main>
${script(FIGS.map(f => f.m))}
`;
fs.writeFileSync(DIST + 'index.html', head('Perpetuum Mobile') + '\n' + body + '</body>\n</html>\n');
// Optional: the gallery as a bare fragment (no <html> or <head>), for hosts that add their own page skeleton.
if (process.env.PM_FRAGMENT) fs.writeFileSync(process.env.PM_FRAGMENT, '<title>Perpetuum Mobile</title>\n' + NOTICE + '\n' + FONTS + '\n<style>\n' + css + '</style>\n\n' + body);
console.log('built', N, 'machine pages and the gallery in dist/');
