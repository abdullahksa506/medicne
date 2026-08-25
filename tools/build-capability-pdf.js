/* Build the English capability inventory PDF straight from the live app data,
   so the document cannot drift from what the site actually ships. */
const { chromium } = require('playwright');
const fs = require('fs');

/* English titles for content authored in Arabic. Keyed by item id so a renamed
   Arabic title never silently changes the English document. */
const EN = {
  // calculators
  bmi: ['Body Mass Index', 'BMI, body surface area, ideal weight range'],
  egfr: ['Estimated GFR', 'CKD-EPI 2021, race-free; stages and drug implications'],
  crcl: ['Creatinine Clearance', 'Cockcroft-Gault, for drug dose adjustment'],
  ascvd: ['ASCVD 10-Year Risk', 'Pooled Cohort Equations; statin intensity guidance'],
  chadsvasc: ['CHA₂DS₂-VASc', 'Stroke risk in atrial fibrillation'],
  hasbled: ['HAS-BLED', 'Bleeding risk on anticoagulation'],
  centor: ['Centor / McIsaac', 'Probability of streptococcal pharyngitis'],
  'wells-dvt': ['Wells Score (DVT)', 'Deep vein thrombosis probability'],
  phq9: ['PHQ-9', 'Depression severity'],
  gad7: ['GAD-7', 'Anxiety severity'],
  a1c: ['HbA1c Converter', 'HbA1c to estimated average glucose'],
  'ca-corr': ['Corrected Calcium', 'Albumin-corrected calcium'],
  fib4: ['FIB-4', 'Advanced fibrosis risk in fatty liver disease'],
  anion: ['Anion Gap', 'With albumin and glucose corrections'],
  edd: ['Gestational Age & EDD', 'From LMP, with antenatal milestones'],
  smoke: ['Pack-Years', 'Smoking burden and screening eligibility'],
  cfs: ['Clinical Frailty Scale', 'CFS 1-9 — sets targets for every other decision'],
  adl: ['Katz ADL', 'Basic functional independence'],
  minicog: ['Mini-Cog', 'Three-minute cognitive screen'],
  '4at': ['4AT', 'Delirium detection in two minutes'],
  gds15: ['GDS-15', 'Geriatric Depression Scale'],
  acb: ['Anticholinergic Burden', 'Cumulative ACB score across the medication list'],
  'falls-risk': ['Falls Risk', 'STEADI screen and modifiable factors'],
  ortho: ['Orthostatic Hypotension', 'Lying vs standing blood pressure'],
  mna: ['MNA-SF', 'Malnutrition screening'],
  // guides
  dm2: ['Type 2 Diabetes', 'Diagnosis, targets, treatment escalation'],
  htn: ['Hypertension', 'Staging, when to treat, drug selection'],
  lipid: ['Dyslipidaemia', 'Who needs a statin and at what intensity'],
  thyroid: ['Thyroid Disorders', 'Hypo- and hyperthyroidism'],
  asthma: ['Asthma', 'GINA steps, control assessment, acute attack'],
  copd: ['COPD', 'Diagnosis, GOLD groups, exacerbation'],
  uti: ['Urinary Tract Infection', 'Simple, complicated, and in pregnancy'],
  pharyngitis: ['Sore Throat', 'When an antibiotic is justified'],
  urti: ['Common Cold & Sinusitis', 'Differentiating viral from bacterial'],
  headache: ['Headache', 'SNOOP red flags and migraine management'],
  lbp: ['Low Back Pain', 'Triage, red flags, sciatica'],
  chestpain: ['Chest Pain in Clinic', 'Rapid triage'],
  ibs: ['IBS & GERD', 'Rome IV criteria and reflux management'],
  anemia: ['Iron Deficiency Anaemia', 'Diagnosis, cause hunting, replacement'],
  vitd: ['Vitamin D Deficiency', 'Who to test and how to treat'],
  gout: ['Gout', 'Acute attack and urate-lowering therapy'],
  mental: ['Depression & Anxiety', 'Screening, starting treatment, follow-up'],
  obesity: ['Obesity', 'Assessment and stepwise management'],
  anc: ['Antenatal Care', 'Visit schedule and screening milestones'],
  dementia: ['Dementia', 'Diagnosis, subtypes, management'],
  bpsd: ['Agitation in Dementia', 'Find the cause before reaching for a drug'],
  delirium: ['Delirium', 'A symptom of acute illness, not a diagnosis'],
  'uti-elderly': ['Asymptomatic Bacteriuria', 'The most over-treated diagnosis in older adults'],
  'falls-guide': ['Falls', 'Multifactorial assessment and intervention'],
  osteoporosis: ['Osteoporosis', 'Who to screen, who to treat, how'],
  deprescribing: ['Polypharmacy & Deprescribing', 'Time-to-benefit framework'],
  'dm-elderly': ['Diabetes in Older Adults', 'Relaxed targets, avoiding overtreatment'],
  'htn-elderly': ['Hypertension in Older Adults', 'Balancing benefit against falls'],
  incontinence: ['Urinary Incontinence', 'Treatable and rarely volunteered'],
  'insomnia-elderly': ['Insomnia in Older Adults', 'Behavioural first; hypnotics are harmful'],
  'weight-loss': ['Unexplained Weight Loss', 'Structured workup'],
  palliative: ['Palliative & Advance Care Planning', 'Questions asked early, not late'],
  pressure: ['Pressure Ulcers', 'Prevention, staging, treatment'],
  // tools
  vaccines: ['Adult Immunisation', 'What is given, when, and contraindications'],
  screening: ['Preventive Screening', 'What to screen and at what age'],
  redflags: ['Red Flags', 'What must not be missed, by presentation'],
  abx: ['Antibiotic Reference', 'First-line choice and duration'],
  renal: ['Renal Dose Adjustment', 'Common drugs by eGFR'],
  notes: ['Documentation Templates', 'SOAP, chronic review, referral, refusal'],
  consult: ['The 10-Minute Consultation', 'Structuring a short visit'],
  beers: ['Drugs to Avoid in Older Adults', 'Beers-based, with a safer alternative for each'],
  cga: ['Comprehensive Geriatric Assessment', 'What to cover in one structured visit'],
  medrec: ['Medication Reconciliation', 'After hospital discharge'],
  // prescriptions
  'rx-urti': ['Viral Upper Respiratory Infection'],
  'rx-strep': ['Bacterial Pharyngitis'],
  'rx-sinus': ['Bacterial Sinusitis'],
  'rx-asthma-exac': ['Mild-Moderate Asthma Exacerbation'],
  'rx-cystitis': ['Uncomplicated Cystitis'],
  'rx-uti-preg': ['UTI in Pregnancy'],
  'rx-gastro-adult': ['Adult Gastroenteritis'],
  'rx-gerd': ['Gastro-oesophageal Reflux'],
  'rx-constipation': ['Chronic Constipation'],
  'rx-lbp': ['Mechanical Low Back Pain'],
  'rx-migraine': ['Acute Migraine'],
  'rx-gout-acute': ['Acute Gout'],
  'rx-eczema': ['Atopic Dermatitis'],
  'rx-tinea': ['Superficial Fungal Infection'],
  'rx-dm-start': ['Starting Type 2 Diabetes Treatment'],
  'rx-htn-start': ['Starting Antihypertensive Treatment'],
  'rx-vitd': ['Vitamin D Replacement'],
  'rx-iron': ['Oral Iron Replacement'],
  'rx-osteo': ['Osteoporosis Treatment'],
  'rx-pain-elderly': ['Chronic Pain in Older Adults'],
  'rx-insomnia-elderly': ['Insomnia — Non-Drug Plan'],
  // handouts
  'h-inhaler': ['How to Use Your Inhaler'],
  'h-warfarin': ['Warfarin Patient Instructions'],
  'h-dm-sick': ['Sick Day Rules for Diabetes'],
  'h-hypoglycemia': ['Managing Low Blood Sugar'],
  'h-bp-home': ['Measuring Blood Pressure at Home'],
  'h-back': ['Caring for Your Lower Back'],
  'h-falls-home': ['Preventing Falls at Home'],
  'h-dementia-care': ['Managing Confusion and Agitation'],
  'h-med-card': ['My Medication Card'],
  'h-caregiver': ['Support for Caregivers'],
};

const CAT_EN = {
  'كبار السن': 'Older Adults', 'أساسية': 'Core', 'قلب': 'Cardiovascular', 'عدوى': 'Infection',
  'نفسية': 'Mental Health', 'مخبرية': 'Laboratory', 'نساء': 'Women’s Health', 'وقاية': 'Prevention',
  'مزمنة': 'Chronic Disease', 'تنفسية': 'Respiratory', 'حادة': 'Acute', 'أعراض': 'Symptoms',
  'هضمية': 'Gastrointestinal', 'دم': 'Haematology', 'عظام': 'Musculoskeletal',
  'تنفسي': 'Respiratory', 'مسالك': 'Urinary', 'هضمي': 'Gastrointestinal', 'ألم': 'Pain',
  'جلدية': 'Dermatology', 'مزمن': 'Chronic',
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await b.newPage();
  await page.goto('http://127.0.0.1:8123/index.html', { waitUntil: 'networkidle' });

  const data = await page.evaluate(() => ({
    calcs: CALCS.map(c => ({ id: c.id, cat: c.cat, type: c.type, geri: !!c.geri,
      inputs: c.type === 'form' ? (c.fields || []).map(f => f.label) : (c.items || []).map(i => i.t),
      itemCount: c.type === 'score' ? (c.items || []).length : (c.fields || []).length })),
    guides: GUIDES.map(g => ({ id: g.id, cat: g.cat, geri: !!g.geri, blocks: (g.blocks || []).length })),
    rx: RX.map(r => ({ id: r.id, cat: r.cat, geri: !!r.geri, lines: (r.text || '').split('\n').length })),
    tools: TOOLS.map(t => ({ id: t.id, geri: !!t.geri, blocks: (t.blocks || []).length })),
    handouts: HANDOUTS.map(h => ({ id: h.id, geri: !!h.geri, words: (h.text || '').split(/\s+/).length })),
    visits: NOTE_VISITS.map(v => ({ id: v.id, label: v.label, geri: !!v.geri,
      fields: noteSectionsFor(v).reduce((a, s) => a + s.fields.length, 0),
      required: noteSectionsFor(v).reduce((a, s) => a + s.fields.filter(f => f.required).length, 0),
      redFlags: (v.subjective || []).concat(v.exam || []).reduce((a, f) => a + ((f.redFlags || []).length), 0) })),
  }));
  await b.close();

  const t = (id, i) => (EN[id] && EN[id][i]) || null;
  const name = id => t(id, 0) || '(' + id + ')';
  const desc = id => t(id, 1) || '';
  const cat = c => CAT_EN[c] || c;

  const group = (arr, keyFn) => {
    const m = new Map();
    arr.forEach(x => { const k = keyFn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); });
    return [...m.entries()];
  };

  const rows = (items, extra) => items.map(x =>
    `<tr><td class="n">${name(x.id)}</td><td class="d">${desc(x.id) || ''}</td><td class="x">${extra(x)}</td></tr>`).join('');

  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  const calcGroups = group(data.calcs, c => c.cat);
  const guideGroups = group(data.guides, g => g.cat);
  const rxGroups = group(data.rx, r => r.cat);

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
  .decide { background: #f7f9fb; border: .5pt solid #cfdae2; border-radius: 2mm; padding: 3mm 4mm; margin: 2mm 0 4mm; font-size: 9pt; }
  ul { margin: 0 0 2mm; padding-left: 5mm; } li { margin-bottom: 1mm; }
  .foot { margin-top: 8mm; padding-top: 3mm; border-top: .5pt solid #cfdae2; color: #7d919f; font-size: 8pt; }
  .pg { page-break-before: always; }
  h2, h3 { page-break-after: avoid; } tr { page-break-inside: avoid; }
  code { background: #eef2f5; padding: .3mm 1mm; border-radius: 1mm; font-size: 8.6pt; }
</style></head><body>

<h1>Family Medicine Assistant</h1>
<div class="sub">Complete capability inventory &middot; generated ${new Date().toISOString().slice(0, 10)} from the live application</div>

<div class="lead">
<b>What this document is for.</b> Every feature the site currently ships, so you can decide what to keep and what
to remove. Nothing here is aspirational — the list is generated directly from the application data, so it cannot
drift from the code. Counts in the tables are structural (how many inputs, how many content blocks), not estimates.
</div>

<div class="tally">
  <div><b>${data.calcs.length}</b><span>Clinical calculators</span></div>
  <div><b>${data.guides.length}</b><span>Clinical guides</span></div>
  <div><b>${data.rx.length}</b><span>Prescription templates</span></div>
  <div><b>${data.tools.length}</b><span>Reference tools</span></div>
  <div><b>${data.handouts.length}</b><span>Patient handouts</span></div>
  <div><b>${data.visits.length}</b><span>Note visit types</span></div>
</div>

<h2>1. Progress Note Assistant</h2>
<p>A two-stage documentation tool. Stage one produces a form that adapts to the presenting complaint; stage two
assembles the note in house format and returns teaching feedback with a rubric score. It runs entirely on the
device — no API key, no network call, no patient data leaving the phone.</p>

<h3>What it enforces</h3>
<ul>
<li><b>Never invents clinical content.</b> Any required field left blank becomes a visible <code>[ TO COMPLETE: ... ]</code>
placeholder, rendered in red, and the copy button stays locked until none remain.</li>
<li><b>Red flags are surfaced, never smoothed over.</b> Flags you entered raise an alert that needs an explicit
acknowledge or dismiss, and that choice is logged. If your assessment already carries the flag, the tool says so
instead of nagging.</li>
<li><b>Judgemental language is rewritten</b> before it reaches the record — "non-compliant" becomes "admits missing
doses" — and you are told which word and why.</li>
<li><b>Patient identifiers are stripped.</b> Phone numbers, national IDs, MRNs and full dates of birth are removed.
Age and sex only.</li>
<li><b>Every note ends with safety netting.</b> ER instructions and a follow-up interval, auto-suggested from the
complaint if you leave them blank and flagged as auto-suggested so you review them.</li>
<li><b>Mean BP is computed</b> from your SBP and DBP rather than asked for.</li>
</ul>

<h3>Four modes</h3>
<table><tr><td class="n">Write a note</td><td class="d">Pick a visit type, fill the adaptive form, get the note plus rubric and teaching</td><td class="x">main path</td></tr>
<tr><td class="n">Critique my note</td><td class="d">Paste a note you wrote; returns the rubric, teaching, and a corrected Assessment section only</td><td class="x">rewriting the whole note teaches nothing</td></tr>
<tr><td class="n">Quick expand</td><td class="d">Shorthand in, full note out, every unsupplied element left as a visible placeholder</td><td class="x">fast path for busy clinics</td></tr>
<tr><td class="n">Practice</td><td class="d">Four worked scenarios with model answers and the rules behind each</td><td class="x">difficulty adapts to your rubric history</td></tr></table>

<h3>Rubric (scored 0-2 each, 10 total, stored across visits)</h3>
<table><tr><td class="n">Problem list detail</td><td class="d">Drug, dose, frequency and control status on every line</td><td class="x"></td></tr>
<tr><td class="n">Problem-specific negatives</td><td class="d">Red-flag screen completed and the specific negatives documented</td><td class="x"></td></tr>
<tr><td class="n">Assessment actionable</td><td class="d">Every line ends in an action and carries a number</td><td class="x"></td></tr>
<tr><td class="n">Defensive documentation</td><td class="d">Deliberate non-action recorded with its reason; disagreements in the four-part sequence</td><td class="x"></td></tr>
<tr><td class="n">Safety netting</td><td class="d">Specific ER instructions and a stated follow-up interval</td><td class="x"></td></tr></table>

<h3>Visit types (${data.visits.length})</h3>
<table><th>Visit type</th><th>Fields / required</th><th>Red-flag options</th>
${data.visits.map(v => `<tr><td class="n">${esc(v.label)}${v.geri ? ' <span class="x">&middot; older adults</span>' : ''}</td><td class="d">${v.fields} fields, ${v.required} required</td><td class="x">${v.redFlags}</td></tr>`).join('')}
</table>

<div class="decide"><b>Deciding on this feature.</b> It is the only part of the site that produces an artefact for
the medical record rather than a reference lookup, so it carries the most risk and the most benefit. It is also the
largest single piece of code. If you drop it, everything else still works unchanged — it is fully self-contained in
three files.</div>

<div class="pg"></div>
<h2>2. Clinical Calculators (${data.calcs.length})</h2>
<p>All compute live as you type, with no calculate button. Every result carries its interpretation band and the
practical next step, not just a number.</p>
${calcGroups.map(([c, items]) => `<h3>${cat(c)} (${items.length})</h3><table>${rows(items, x => x.itemCount + (x.type === 'score' ? ' items' : ' inputs'))}</table>`).join('')}

<div class="note"><b>Validation note.</b> The ASCVD calculator was checked against the published reference cases for
all four sex and ethnicity combinations and matches. eGFR uses the 2021 race-free CKD-EPI equation.</div>

<div class="pg"></div>
<h2>3. Clinical Guides (${data.guides.length})</h2>
<p>Short reference summaries: diagnostic criteria, targets, treatment steps, and referral thresholds.</p>
${guideGroups.map(([c, items]) => `<h3>${cat(c)} (${items.length})</h3><table>${rows(items, x => x.blocks + ' sections')}</table>`).join('')}

<h2>4. Reference Tools (${data.tools.length})</h2>
<table>${rows(data.tools, x => x.blocks + ' sections')}</table>

<div class="pg"></div>
<h2>5. Prescription Templates (${data.rx.length})</h2>
<p>Complete prescriptions with dose, frequency and duration, copied to the clipboard in one tap, each with its own
cautions and alternatives.</p>
${rxGroups.map(([c, items]) => `<h3>${cat(c)} (${items.length})</h3><table>${rows(items, x => x.lines + ' lines')}</table>`).join('')}

<h2>6. Patient Handouts (${data.handouts.length})</h2>
<p>Written in Arabic for the patient or family, sent by WhatsApp or printed.</p>
<table>${rows(data.handouts, x => '~' + x.words + ' words')}</table>

<h2>7. Platform Capabilities</h2>
<table>
<tr><td class="n">Works fully offline</td><td class="d">A service worker caches everything after the first load; no network needed in clinic</td><td class="x">core</td></tr>
<tr><td class="n">Installable</td><td class="d">Add to Home Screen gives a standalone app with its own icon</td><td class="x">core</td></tr>
<tr><td class="n">Unified search</td><td class="d">One box across every section; ignores Arabic hamza and diacritics so spelling need not be exact</td><td class="x">core</td></tr>
<tr><td class="n">Recently used</td><td class="d">Home screen remembers your last eight pages</td><td class="x">optional</td></tr>
<tr><td class="n">Dark mode</td><td class="d">Follows the device, with a manual override that persists</td><td class="x">optional</td></tr>
<tr><td class="n">Copy and share</td><td class="d">Prescriptions and templates to the clipboard; handouts to WhatsApp</td><td class="x">core</td></tr>
<tr><td class="n">No backend</td><td class="d">Static files only. No server, no database, no account, no patient data transmitted</td><td class="x">core</td></tr>
</table>

<h2>8. What to Consider Removing</h2>
<div class="decide">
<p>An honest read on what earns its place, if you want to trim:</p>
<ul>
<li><b>Strongest keep:</b> the Progress Note assistant, the older-adult section, red flags, prescription templates,
and the drug-related tools (Beers, renal dosing, antibiotics). These are the ones that change what you do in the room.</li>
<li><b>Weakest keep:</b> Pack-Years and the HbA1c converter are single-line arithmetic you can do in your head.
Anion Gap and Corrected Calcium are more inpatient than family medicine.</li>
<li><b>Depends on your practice:</b> Gestational Age and Antenatal Care matter only if you run antenatal clinics.
Wells DVT is uncommon in an outpatient setting.</li>
<li><b>Needs local sign-off before launch:</b> the adult immunisation schedule and the house note format. The note
skeleton reflects one department's style — anything your consultant does differently should be changed to match him.</li>
</ul>
</div>

<div class="foot">
Clinical decision support for qualified healthcare professionals. It does not replace clinical judgement.
Doses and protocols are quick references that require verification against your local approved protocol and the
product leaflet before use. Immunisation schedules change periodically and must be matched against the current
national schedule.
</div>

</body></html>`;

  const out = process.argv[2];
  fs.writeFileSync(out.replace(/\.pdf$/, '.html'), html);
  const b2 = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
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
