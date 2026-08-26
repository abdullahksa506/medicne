/* Build the capability inventory PDF straight from the live app data,
   so the document cannot drift from what the app actually ships. */
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
  const page = await b.newPage();
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:8123/index.html', { waitUntil: 'networkidle' });

  const data = await page.evaluate(() => ({
    calcs: CALCS.map(c => ({ id: c.id, cat: c.cat, type: c.type, title: c.title, sub: c.sub || '',
      count: c.type === 'score' ? (c.items || []).length : (c.fields || []).length })),
    guides: GUIDES.map(g => ({ id: g.id, cat: g.cat, title: g.title, sub: g.sub || '', blocks: (g.blocks || []).length })),
    rx: RX.map(r => ({ id: r.id, cat: r.cat, title: r.title, sub: r.sub || '', lines: (r.text || '').split('\n').length })),
    tools: TOOLS.map(t => ({ id: t.id, title: t.title, sub: t.sub || '', blocks: (t.blocks || []).length })),
    handouts: HANDOUTS.map(h => ({ id: h.id, title: h.title, words: (h.text || '').split(/\s+/).length })),
    visits: NOTE_VISITS.map(v => ({ id: v.id, label: v.label,
      all: noteSectionsFor(v).reduce((a, s) => a + s.fields.length, 0),
      base: noteVisibleSectionsFor(v, {}).reduce((a, s) => a + s.fields.length, 0),
      redFlags: (v.subjective || []).concat(v.exam || []).reduce((a, f) => a + ((f.redFlags || []).length), 0) })),
    assessGroups: (() => {
      const v = NOTE_VISITS.find(x => x.id === 'chronic');
      const f = noteSectionsFor(v).find(s => s.id === 'assessment').fields[0];
      const conds = ['Diabetes', 'Hypertension', 'Dyslipidaemia', 'Hypothyroidism', 'Asthma / COPD', 'CKD', 'IHD / AF', 'Osteoporosis'];
      return f.groups({ conditions: conds }).map(g => ({ label: g.label, n: g.lines.length }));
    })(),
    planGroups: (() => {
      const v = NOTE_VISITS.find(x => x.id === 'chronic');
      const f = noteSectionsFor(v).find(s => s.id === 'plan').fields[0];
      return f.groups({}).map(g => ({ label: g.label, n: g.lines.length }));
    })(),
  }));
  await b.close();

  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const group = (arr, key) => {
    const m = new Map();
    arr.forEach(x => { const k = x[key]; if (!m.has(k)) m.set(k, []); m.get(k).push(x); });
    return [...m.entries()];
  };
  const rows = (items, extra) => items.map(x =>
    `<tr><td class="n">${esc(x.title || x.label)}</td><td class="d">${esc(x.sub || '')}</td><td class="x">${extra(x)}</td></tr>`).join('');

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Capability Inventory</title>
<style>
  @page { size: A4; margin: 16mm 14mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: #15242f; font-size: 9.6pt; line-height: 1.5; margin: 0; }
  h1 { font-size: 21pt; margin: 0 0 2mm; letter-spacing: -.01em; }
  .sub { color: #5b7285; font-size: 10pt; margin-bottom: 6mm; }
  h2 { font-size: 13pt; margin: 8mm 0 2mm; padding-bottom: 1.5mm; border-bottom: 2px solid #0d9488; color: #0f766e; }
  h2:first-of-type { margin-top: 4mm; }
  h3 { font-size: 9.6pt; margin: 4mm 0 1.5mm; color: #5b7285; text-transform: uppercase; letter-spacing: .05em; font-weight: 700; }
  p { margin: 0 0 2.5mm; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 2mm; }
  td, th { padding: 1.5mm 2mm; border-bottom: .5pt solid #e3eaef; vertical-align: top; text-align: left; }
  th { font-size: 8pt; text-transform: uppercase; letter-spacing: .04em; color: #5b7285; border-bottom: 1pt solid #cfdae2; }
  td.n { font-weight: 650; width: 33%; }
  td.d { color: #47606f; width: 45%; }
  td.x { color: #7d919f; font-size: 8.6pt; width: 22%; }
  .lead { background: #f0fdfa; border-left: 3px solid #0d9488; padding: 3mm 4mm; border-radius: 2mm; margin-bottom: 4mm; }
  .tally { display: flex; flex-wrap: wrap; gap: 2mm; margin-bottom: 5mm; }
  .tally div { flex: 1 1 30mm; border: .5pt solid #cfdae2; border-radius: 2mm; padding: 2.5mm 3mm; }
  .tally b { display: block; font-size: 16pt; color: #0f766e; line-height: 1.1; }
  .tally span { font-size: 8pt; color: #5b7285; }
  .note { background: #fff8e6; border-left: 3px solid #b45309; padding: 3mm 4mm; border-radius: 2mm; font-size: 9pt; margin: 3mm 0; }
  ul { margin: 0 0 2mm; padding-left: 5mm; } li { margin-bottom: 1mm; }
  .foot { margin-top: 8mm; padding-top: 3mm; border-top: .5pt solid #cfdae2; color: #7d919f; font-size: 8pt; }
  .pg { page-break-before: always; }
  h2, h3 { page-break-after: avoid; } tr { page-break-inside: avoid; }
  code { background: #eef2f5; padding: .3mm 1mm; border-radius: 1mm; font-size: 8.6pt; }
</style></head><body>

<h1>Family Medicine Assistant</h1>
<div class="sub">Capability inventory &middot; generated ${new Date().toISOString().slice(0, 10)} from the live application</div>

<div class="lead">
<b>Everything the app currently ships.</b> Generated directly from the application data, so it cannot drift from the code.
Counts are structural (fields, content blocks), not estimates.
</div>

<div class="tally">
  <div><b>${data.visits.length}</b><span>Note visit types</span></div>
  <div><b>${data.calcs.length}</b><span>Clinical calculators</span></div>
  <div><b>${data.guides.length}</b><span>Clinical guides</span></div>
  <div><b>${data.rx.length}</b><span>Prescriptions</span></div>
  <div><b>${data.tools.length}</b><span>Reference tools</span></div>
  <div><b>${data.handouts.length}</b><span>Patient handouts</span></div>
</div>

<h2>1. Progress Note</h2>
<p>The primary feature. One job: write a note. Pick a visit type, fill the blanks, and the form asks only what the
selected problems actually need. It runs entirely on the device — no API key, no network call, no patient data leaving
the phone.</p>

<h3>How the form adapts</h3>
<ul>
<li>Questions carry a condition and appear only when relevant. Selecting <b>Hypertension</b> reveals the home BP
readings and the postural-symptom screen; deselecting it hides them again.</li>
<li>An answer to a question that is no longer shown is kept in memory but never reaches the note — what the clinician
cannot see must not become a finding in the record.</li>
<li>Every option list has an <b>Other</b> escape for anything not on it.</li>
<li>Assessment and Plan are built by tapping ready-made lines that insert into a freely editable box, so a template
gives you speed and a blank box is always available underneath.</li>
</ul>

<h3>What it will not do</h3>
<ul>
<li>Never invents a finding, a vital sign, a lab value or a diagnosis. Gaps become <code>[ TO COMPLETE: … ]</code>
in red, and the copy button stays locked until none remain.</li>
<li>Red flags are surfaced as unresolved concerns needing an explicit acknowledge or dismiss, which is logged.</li>
<li>Judgemental language is rewritten neutrally before it reaches the record, and you are told which word and why.</li>
<li>Patient identifiers are stripped. Age and sex only.</li>
<li>Every note ends with ER instructions and a follow-up interval.</li>
<li>Mean BP is computed rather than asked for.</li>
</ul>

<h3>Visit types (${data.visits.length})</h3>
<table><tr><th>Visit type</th><th>Fields shown / total available</th><th>Red-flag options</th></tr>
${data.visits.map(v => `<tr><td class="n">${esc(v.label)}</td><td class="d">${v.base} at start, up to ${v.all}</td><td class="x">${v.redFlags}</td></tr>`).join('')}
</table>

<h3>Assessment line library</h3>
<table><tr><th>Group</th><th></th><th>Ready lines</th></tr>
${data.assessGroups.map(g => `<tr><td class="n">${esc(g.label)}</td><td class="d"></td><td class="x">${g.n}</td></tr>`).join('')}
</table>

<h3>Plan library</h3>
<table><tr><th>Group</th><th></th><th>Ready items</th></tr>
${data.planGroups.map(g => `<tr><td class="n">${esc(g.label)}</td><td class="d"></td><td class="x">${g.n}</td></tr>`).join('')}
</table>

<h3>Rubric (0-2 each, 10 total, stored across visits)</h3>
<table>
<tr><td class="n">Problem list detail</td><td class="d">Drug, dose, frequency and control status on every line</td><td class="x"></td></tr>
<tr><td class="n">Problem-specific negatives</td><td class="d">Red-flag screen completed and specific negatives documented</td><td class="x"></td></tr>
<tr><td class="n">Assessment actionable</td><td class="d">Every line ends in an action and carries a number</td><td class="x"></td></tr>
<tr><td class="n">Defensive documentation</td><td class="d">Deliberate non-action recorded with its reason; disagreements in the four-part sequence</td><td class="x"></td></tr>
<tr><td class="n">Safety netting</td><td class="d">Specific ER instructions and a stated follow-up interval</td><td class="x"></td></tr>
</table>

<div class="pg"></div>
<h2>2. Clinical Calculators (${data.calcs.length})</h2>
<p>All compute live as you type. Every result carries its interpretation band and the practical next step.</p>
${group(data.calcs, 'cat').map(([c, items]) => `<h3>${esc(c)} (${items.length})</h3><table>${rows(items, x => x.count + (x.type === 'score' ? ' items' : ' inputs'))}</table>`).join('')}

<div class="note"><b>Validation.</b> ASCVD was checked against the published reference cases for all four sex and
ethnicity combinations and matches. eGFR uses the 2021 race-free CKD-EPI equation.</div>

<h2>3. Clinical Guides (${data.guides.length})</h2>
<p>Concise summaries: diagnostic criteria, targets, treatment steps and referral thresholds.</p>
${group(data.guides, 'cat').map(([c, items]) => `<h3>${esc(c)} (${items.length})</h3><table>${rows(items, x => x.blocks + ' sections')}</table>`).join('')}

<div class="pg"></div>
<h2>4. Reference Tools (${data.tools.length})</h2>
<table>${rows(data.tools, x => x.blocks + ' sections')}</table>

<h2>5. Prescriptions (${data.rx.length})</h2>
<p>Complete prescriptions with dose, frequency and duration, copied in one tap, each with its own cautions.</p>
${group(data.rx, 'cat').map(([c, items]) => `<h3>${esc(c)} (${items.length})</h3><table>${rows(items, x => x.lines + ' lines')}</table>`).join('')}

<h2>6. Patient Handouts (${data.handouts.length})</h2>
<table>${rows(data.handouts, x => '~' + x.words + ' words')}</table>

<h2>7. Platform</h2>
<table>
<tr><td class="n">Works fully offline</td><td class="d">A service worker caches everything after the first load</td><td class="x">core</td></tr>
<tr><td class="n">Installable</td><td class="d">Add to Home Screen gives a standalone app</td><td class="x">core</td></tr>
<tr><td class="n">Unified search</td><td class="d">One box across every section</td><td class="x">core</td></tr>
<tr><td class="n">Recently used</td><td class="d">Home screen remembers your last eight pages</td><td class="x">optional</td></tr>
<tr><td class="n">Dark mode</td><td class="d">Follows the device, with a persistent manual override</td><td class="x">optional</td></tr>
<tr><td class="n">No backend</td><td class="d">Static files only. No server, no account, no patient data transmitted</td><td class="x">core</td></tr>
</table>

<div class="foot">
Clinical decision support for qualified healthcare professionals. It does not replace clinical judgement.
Doses and protocols require verification against your local approved protocol and the product leaflet before use.
Immunisation schedules change periodically and must be matched against the current national schedule.
The note format reflects one department's house style and should be reviewed by your consultant before launch.
</div>

</body></html>`;

  const out = process.argv[2];
  const b2 = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
  const p2 = await b2.newPage();
  await p2.setContent(html, { waitUntil: 'load' });
  await p2.pdf({ path: out, format: 'A4', printBackground: true,
    margin: { top: '16mm', bottom: '14mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;font-size:7.5pt;color:#98a9b6;padding:0 14mm;font-family:Helvetica,Arial;">' +
      '<span style="float:left">Family Medicine Assistant — capability inventory</span>' +
      '<span style="float:right">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
  });
  await b2.close();
  console.log('written:', out, fs.statSync(out).size, 'bytes');
})();
