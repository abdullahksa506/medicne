# Family Medicine Assistant

A mobile-first web app that works **offline**, built to save a busy family physician seconds in clinic:
a progress note writer, clinical calculators, concise guides, and ready prescriptions.

> Full capability inventory: [`docs/FM-Assistant-Capabilities.pdf`](docs/FM-Assistant-Capabilities.pdf)
> Regenerate it from the live app data with `node tools/build-capability-pdf.js out.pdf` so it never drifts from the code.

## Progress Note

The primary feature, and it has exactly one job: write a note. Pick a visit type, fill the blanks,
and the form asks only what the selected problems actually need.

**The form adapts as you answer.** Selecting *Hypertension* reveals the home BP readings and the
postural-symptom screen; deselecting it hides them again. Selecting *Diabetes* brings up hypoglycaemia
episodes, complication screening and osmotic symptoms. The same applies to smoking (pack-years),
sex (menstrual cycle), and patient disagreement (the four-part sequence).

An answer to a question that is no longer displayed stays in memory — so toggling back restores it —
but it **never reaches the note**. What the clinician cannot see must not become a finding in the record.

**Assessment and Plan are built by tapping.** Ready-made lines, scoped to the problems you picked,
insert into a freely editable box underneath. A template when one fits, a blank box when none does.
Every option list also carries an **Other** escape for anything not on it.

### What it will not do

- **Never invents clinical content.** Any required field left blank becomes a visible `[ TO COMPLETE: … ]`
  placeholder in red, and the copy button stays locked until none remain.
- **Red flags are surfaced, never smoothed over.** They raise an alert needing an explicit acknowledge or
  dismiss, and that choice is logged. If your assessment already carries the flag, it says so instead of nagging.
- **Judgemental language is rewritten** before it reaches the record — "non-compliant" becomes "admits missing
  doses" — and you are told which word and why.
- **Patient identifiers are stripped.** Age and sex only.
- **Every note ends with safety netting**: ER instructions and a follow-up interval, auto-suggested from the
  complaint if left blank and flagged as auto-suggested so you review them.
- **Mean BP is computed** from your systolic and diastolic rather than asked for.

It runs entirely on the device — no API key, no network call, no patient data leaving the phone.

## Content

| Section | What is in it |
|---|---|
| **Calculators** | 16: BMI · eGFR (CKD-EPI 2021) · creatinine clearance · ASCVD · CHA₂DS₂-VASc · HAS-BLED · Centor/McIsaac · Wells DVT · PHQ-9 · GAD-7 · FIB-4 · HbA1c converter · corrected calcium · anion gap · gestational age · pack-years |
| **Guides** | 19 common family medicine conditions — diagnosis, targets, treatment steps, referral thresholds |
| **Prescriptions** | 18 complete prescriptions, copied to the clipboard in one tap |
| **Handouts** | 6 patient instruction sheets to send or print |
| **Tools** | Adult immunisation · preventive screening · red flags · antibiotics · renal dosing · documentation templates · the 10-minute consultation |

## What actually saves time

- **One search across everything** — type "diabetes" or "dose" and the calculator, guide and prescription all come back.
- **One-tap copy** — prescriptions and documentation templates to the clipboard, handouts to a messaging app.
- **Recently used** — the home screen remembers your last eight pages.
- **Live results** — calculators compute as you type, with the result pinned to the bottom of the screen while you scroll.
- **Interpretation, not just a number** — every result carries its band and the practical next step.
- **Works with no signal** — fully offline after the first load.

## Running it

Static files, no dependencies and no build step:

```bash
npx http-server -p 8080
# then open http://localhost:8080
```

To deploy: upload the folder as-is to any static host (GitHub Pages, Netlify, Cloudflare Pages).
HTTPS is required for offline mode and clipboard access.

### Installing on a phone

Open the site in the browser, then **Add to Home Screen**. It runs as a standalone app with its own icon
and works offline.

### Single-file build

`node tools/build-single-file.js out.html` inlines the whole app into one HTML file for quick preview or sharing.

## Structure

```
index.html                      shell and bottom navigation
manifest.webmanifest            install settings
sw.js                           service worker — offline caching
assets/css/app.css              design, dark mode
assets/js/app.js                routing, search, page rendering, copy
assets/js/calculators.js        calculator engine and all calculators
assets/js/data-guides.js        clinical guides
assets/js/data-rx.js            prescriptions and patient handouts
assets/js/data-tools.js         reference tools and templates
assets/js/note-forms.js         visit templates, conditional fields, assessment and plan libraries
assets/js/note-engine.js        note assembly, rubric, teaching feedback
assets/js/note-ui.js            progress note interface
tools/build-capability-pdf.js   capability inventory PDF
tools/build-single-file.js      single-file bundle
```

Content is adult and older-adult family medicine. There is no paediatric content.

### Adding content

All content is data, separate from the code. Add an object to the right array and it appears in the lists
and in search automatically.

**A new guide** in `data-guides.js`:

```js
{
  id: 'anemia-b12', cat: 'Haematology', title: 'Vitamin B12 Deficiency', sub: 'Diagnosis and replacement',
  tags: ['b12', 'vitamin', 'neuropathy'],
  blocks: [
    { h: 'Subheading' },
    { p: 'A paragraph.' },
    { ul: ['A point', 'Another point'] },
    { note: 'Something important', kind: 'warn' },   // info · warn · danger · ok
    { table: { head: ['Column', 'Column'], rows: [['Cell', 'Cell']] } },
    { copy: 'Text with a copy button' },
  ],
}
```

**A new conditional question** in `note-forms.js` — add `when` to any field:

```js
F('statin_status', 'Statin', 'select', {
  required: true,
  when: picked('conditions', 'Dyslipidaemia'),   // only shown when that problem is selected
  options: ['On statin, tolerating well', 'On statin with muscle symptoms', 'Not on a statin'],
  redFlags: ['On statin with muscle symptoms'],
  example: 'On statin, tolerating well',
  why: 'One line on why this question matters clinically.',
})
```

**A new calculator** in `calculators.js` — either `form` (fields plus a compute function) or
`score` (point items plus interpretation bands).

## Disclaimer

Clinical decision support for qualified healthcare professionals. It does not replace clinical judgement
or approved references. Doses and protocols are quick references that require verification against your
local approved protocol and the product leaflet before use. Immunisation schedules change periodically and
must be matched against the current national schedule. The note format reflects one department's house
style and should be reviewed by your consultant before launch.
