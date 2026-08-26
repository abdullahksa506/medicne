/* Clinical calculators
   Two kinds:
   - type:'form'  → fields + a compute() returning { v, u, i, kind, lines }
   - type:'score' → point items + interpretation bands
*/

const _n = v => (v === '' || v === null || v === undefined || isNaN(+v)) ? null : +v;
const _r = (x, d = 1) => Number(x.toFixed(d));

window.CALCS = [

/* ============ CORE ============ */
{
  id: 'bmi', cat: 'Core', type: 'form',
  title: 'Body Mass Index', sub: 'BMI, body surface area and ideal weight range',
  tags: ['bmi', 'weight', 'obesity', 'bsa', 'body mass'],
  fields: [
    { id: 'w', label: 'Weight', unit: 'kg', type: 'number', step: '0.1' },
    { id: 'h', label: 'Height', unit: 'cm', type: 'number', step: '0.5' },
  ],
  compute(v) {
    const w = _n(v.w), h = _n(v.h);
    if (!w || !h) return null;
    const m = h / 100;
    const bmi = w / (m * m);
    const bsa = Math.sqrt((h * w) / 3600);
    let i, kind;
    if (bmi < 18.5) { i = 'Underweight'; kind = 'warn'; }
    else if (bmi < 25) { i = 'Normal weight'; kind = 'ok'; }
    else if (bmi < 30) { i = 'Overweight'; kind = 'warn'; }
    else if (bmi < 35) { i = 'Obesity class I'; kind = 'danger'; }
    else if (bmi < 40) { i = 'Obesity class II'; kind = 'danger'; }
    else { i = 'Obesity class III'; kind = 'danger'; }
    const lo = _r(18.5 * m * m), hi = _r(24.9 * m * m);
    const lines = [
      'Body surface area: ' + _r(bsa, 2) + ' m²',
      'Normal weight range for this height: ' + lo + ' – ' + hi + ' kg',
    ];
    if (bmi >= 25) lines.push('A 5–10% loss means ' + _r(w * 0.05) + ' – ' + _r(w * 0.1) +
      ' kg, and that alone improves glucose, blood pressure and lipids.');
    return { v: _r(bmi, 1), u: 'kg/m²', i, kind, lines };
  },
},

{
  id: 'egfr', cat: 'Core', type: 'form',
  title: 'Estimated GFR', sub: 'CKD-EPI 2021, without a race coefficient',
  tags: ['kidney', 'renal', 'egfr', 'creatinine', 'ckd'],
  fields: [
    { id: 'age', label: 'Age', unit: 'years', type: 'number' },
    { id: 'sex', label: 'Sex', type: 'seg', opts: [{ v: 'm', t: 'Male' }, { v: 'f', t: 'Female' }], def: 'm' },
    { id: 'cr', label: 'Creatinine', type: 'number', step: '0.01' },
    { id: 'unit', label: 'Creatinine unit', type: 'seg', opts: [{ v: 'mg', t: 'mg/dL' }, { v: 'umol', t: 'µmol/L' }], def: 'mg' },
  ],
  compute(v) {
    const age = _n(v.age); let cr = _n(v.cr);
    if (!age || !cr) return null;
    if (v.unit === 'umol') cr = cr / 88.4;
    const f = v.sex === 'f';
    const k = f ? 0.7 : 0.9, a = f ? -0.241 : -0.302;
    const e = 142 * Math.pow(Math.min(cr / k, 1), a) * Math.pow(Math.max(cr / k, 1), -1.200)
      * Math.pow(0.9938, age) * (f ? 1.012 : 1);
    let i, kind, stage;
    if (e >= 90) { stage = 'G1'; i = 'Normal or high'; kind = 'ok'; }
    else if (e >= 60) { stage = 'G2'; i = 'Mildly decreased'; kind = 'ok'; }
    else if (e >= 45) { stage = 'G3a'; i = 'Mild to moderate decrease'; kind = 'warn'; }
    else if (e >= 30) { stage = 'G3b'; i = 'Moderate to severe decrease'; kind = 'warn'; }
    else if (e >= 15) { stage = 'G4'; i = 'Severely decreased'; kind = 'danger'; }
    else { stage = 'G5'; i = 'Kidney failure'; kind = 'danger'; }
    const lines = ['Stage: ' + stage];
    if (e < 45) lines.push('Metformin: do not start below 45; stop below 30.');
    if (e < 30) lines.push('Avoid nitrofurantoin and NSAIDs, and adjust every renally cleared drug.');
    if (e < 30) lines.push('Warrants nephrology referral.');
    lines.push('Diagnosing CKD needs two readings at least three months apart, together with a urine ACR.');
    return { v: _r(e, 0), u: 'mL/min/1.73m²', i, kind, lines };
  },
},

{
  id: 'crcl', cat: 'Core', type: 'form',
  title: 'Creatinine Clearance', sub: 'Cockcroft-Gault, for drug dose adjustment',
  tags: ['kidney', 'dose', 'cockcroft', 'crcl', 'renal'],
  fields: [
    { id: 'age', label: 'Age', unit: 'years', type: 'number' },
    { id: 'sex', label: 'Sex', type: 'seg', opts: [{ v: 'm', t: 'Male' }, { v: 'f', t: 'Female' }], def: 'm' },
    { id: 'w', label: 'Weight', unit: 'kg', type: 'number', step: '0.1' },
    { id: 'cr', label: 'Creatinine', unit: 'mg/dL', type: 'number', step: '0.01' },
  ],
  compute(v) {
    const age = _n(v.age), w = _n(v.w), cr = _n(v.cr);
    if (!age || !w || !cr) return null;
    let c = ((140 - age) * w) / (72 * cr);
    if (v.sex === 'f') c *= 0.85;
    let i, kind;
    if (c >= 60) { i = 'No general adjustment needed'; kind = 'ok'; }
    else if (c >= 30) { i = 'Several drugs need adjustment'; kind = 'warn'; }
    else { i = 'Adjustment essential — check every drug'; kind = 'danger'; }
    return { v: _r(c, 0), u: 'mL/min', i, kind, lines: [
      'Use this rather than CKD-EPI for narrow-therapeutic-index drugs such as anticoagulants.',
      'Use adjusted body weight in marked obesity and actual body weight when underweight.',
    ]};
  },
},

/* ============ CARDIOVASCULAR ============ */
{
  id: 'ascvd', cat: 'Cardiovascular', type: 'form',
  title: 'ASCVD 10-Year Risk', sub: 'Pooled Cohort Equations',
  tags: ['cardiac', 'risk', 'ascvd', 'statin', 'cholesterol'],
  fields: [
    { id: 'age', label: 'Age', unit: '40 to 79', type: 'number' },
    { id: 'sex', label: 'Sex', type: 'seg', opts: [{ v: 'm', t: 'Male' }, { v: 'f', t: 'Female' }], def: 'm' },
    { id: 'race', label: 'Race', type: 'seg', opts: [{ v: 'w', t: 'Other' }, { v: 'b', t: 'African American' }], def: 'w' },
    { id: 'tc', label: 'Total cholesterol', unit: 'mg/dL', type: 'number' },
    { id: 'hdl', label: 'HDL cholesterol', unit: 'mg/dL', type: 'number' },
    { id: 'sbp', label: 'Systolic BP', unit: 'mmHg', type: 'number' },
    { id: 'rx', label: 'On BP treatment?', type: 'seg', opts: [{ v: '0', t: 'No' }, { v: '1', t: 'Yes' }], def: '0' },
    { id: 'dm', label: 'Diabetes?', type: 'seg', opts: [{ v: '0', t: 'No' }, { v: '1', t: 'Yes' }], def: '0' },
    { id: 'sm', label: 'Current smoker?', type: 'seg', opts: [{ v: '0', t: 'No' }, { v: '1', t: 'Yes' }], def: '0' },
  ],
  compute(v) {
    const age = _n(v.age), tc = _n(v.tc), hdl = _n(v.hdl), sbp = _n(v.sbp);
    if (!age || !tc || !hdl || !sbp) return null;
    if (age < 40 || age > 79) return { v: '—', u: '', i: 'Validated for ages 40 to 79 only', kind: 'warn',
      lines: ['Outside that range, weigh risk factors individually rather than by a computed number.'] };
    const lnA = Math.log(age), lnTC = Math.log(tc), lnH = Math.log(hdl), lnS = Math.log(sbp);
    const t = +v.rx === 1, dm = +v.dm, sm = +v.sm;
    let s, mean, s0;
    if (v.sex === 'm' && v.race === 'w') {
      s = 12.344 * lnA + 11.853 * lnTC - 2.664 * lnA * lnTC - 7.990 * lnH + 1.769 * lnA * lnH
        + (t ? 1.797 : 1.764) * lnS + 7.837 * sm - 1.795 * lnA * sm + 0.658 * dm;
      mean = 61.18; s0 = 0.9144;
    } else if (v.sex === 'm') {
      s = 2.469 * lnA + 0.302 * lnTC - 0.307 * lnH + (t ? 1.916 : 1.809) * lnS + 0.549 * sm + 0.645 * dm;
      mean = 19.54; s0 = 0.8954;
    } else if (v.race === 'w') {
      s = -29.799 * lnA + 4.884 * lnA * lnA + 13.540 * lnTC - 3.114 * lnA * lnTC - 13.578 * lnH
        + 3.149 * lnA * lnH + (t ? 2.019 : 1.957) * lnS + 7.574 * sm - 1.665 * lnA * sm + 0.661 * dm;
      mean = -29.18; s0 = 0.9665;
    } else {
      s = 17.114 * lnA + 0.940 * lnTC - 18.920 * lnH + 4.475 * lnA * lnH
        + (t ? 29.291 * lnS - 6.432 * lnA * lnS : 27.820 * lnS - 6.087 * lnA * lnS)
        + 0.691 * sm + 0.874 * dm;
      mean = 86.61; s0 = 0.9533;
    }
    const risk = (1 - Math.pow(s0, Math.exp(s - mean))) * 100;
    let i, kind, lines;
    if (risk < 5) { i = 'Low risk'; kind = 'ok'; lines = ['Lifestyle focus. No routine statin.']; }
    else if (risk < 7.5) { i = 'Borderline risk'; kind = 'warn'; lines = ['Discuss a statin if risk enhancers are present: premature family history, metabolic syndrome, CKD, chronic inflammation, or LDL ≥ 160.']; }
    else if (risk < 20) { i = 'Intermediate risk'; kind = 'warn'; lines = ['Moderate-intensity statin — target a 30–49% LDL reduction.']; }
    else { i = 'High risk'; kind = 'danger'; lines = ['High-intensity statin — target a ≥ 50% LDL reduction.']; }
    lines.push('Blood pressure control, glycaemic control and smoking cessation outweigh the drug alone.');
    lines.push('Derived from US cohorts; it may over- or under-estimate in other populations. Use it to support the decision, not to make it.');
    return { v: _r(risk, 1), u: '%', i, kind, lines };
  },
},

{
  id: 'chadsvasc', cat: 'Cardiovascular', type: 'score',
  title: 'CHA₂DS₂-VASc', sub: 'Stroke risk in atrial fibrillation',
  tags: ['af', 'atrial fibrillation', 'stroke', 'anticoagulation', 'chads'],
  items: [
    { id: 'chf', t: 'Congestive heart failure or LV dysfunction', pts: 1 },
    { id: 'htn', t: 'Hypertension', pts: 1 },
    { id: 'age', t: 'Age', type: 'radio', opts: [{ t: 'Under 65', pts: 0 }, { t: '65 – 74', pts: 1 }, { t: '75 or older', pts: 2 }] },
    { id: 'dm', t: 'Diabetes', pts: 1 },
    { id: 'stroke', t: 'Prior stroke, TIA or thromboembolism', pts: 2 },
    { id: 'vasc', t: 'Vascular disease (prior MI, peripheral arterial disease, aortic plaque)', pts: 1 },
    { id: 'sex', t: 'Female sex', pts: 1 },
  ],
  bands: [
    { max: 0, label: 'Low risk', kind: 'ok', note: 'No anticoagulation is recommended for a man scoring zero.' },
    { max: 1, label: 'Low to intermediate risk', kind: 'warn', note: 'A man scoring 1: discuss anticoagulation. A woman scoring 1 on sex alone is treated as a zero.' },
    { max: 99, label: 'High risk', kind: 'danger', note: 'Oral anticoagulation is recommended. A DOAC is preferred over warfarin except with a mechanical valve or rheumatic mitral stenosis.' },
  ],
  foot: 'Assess bleeding risk with HAS-BLED — but a high score is a reason to fix modifiable bleeding factors, not to withhold anticoagulation.',
},

{
  id: 'hasbled', cat: 'Cardiovascular', type: 'score',
  title: 'HAS-BLED', sub: 'Bleeding risk on anticoagulation',
  tags: ['bleeding', 'anticoagulation', 'warfarin', 'hasbled'],
  items: [
    { id: 'h', t: 'Uncontrolled hypertension (systolic over 160)', pts: 1 },
    { id: 'a1', t: 'Abnormal renal function (dialysis, transplant, creatinine over 2.26)', pts: 1 },
    { id: 'a2', t: 'Abnormal liver function (cirrhosis or markedly raised enzymes)', pts: 1 },
    { id: 's', t: 'Prior stroke', pts: 1 },
    { id: 'b', t: 'Bleeding history or predisposition', pts: 1 },
    { id: 'l', t: 'Labile INR (for patients on warfarin)', pts: 1 },
    { id: 'e', t: 'Age over 65', pts: 1 },
    { id: 'd1', t: 'Drugs that raise bleeding risk (aspirin, NSAIDs)', pts: 1 },
    { id: 'd2', t: 'Alcohol excess', pts: 1 },
  ],
  bands: [
    { max: 2, label: 'Low bleeding risk', kind: 'ok', note: 'Continue routine follow-up.' },
    { max: 99, label: 'High bleeding risk', kind: 'warn', note: 'Fix what is modifiable: control the blood pressure, stop unnecessary NSAIDs, review dual antiplatelet therapy, reduce alcohol — then follow up closely. A high score is not a contraindication to anticoagulation.' },
  ],
},

/* ============ INFECTION ============ */
{
  id: 'centor', cat: 'Infection', type: 'score',
  title: 'Centor / McIsaac', sub: 'Probability of streptococcal pharyngitis',
  tags: ['throat', 'strep', 'centor', 'antibiotic', 'pharyngitis'],
  items: [
    { id: 'f', t: 'Temperature over 38 °C', pts: 1 },
    { id: 'c', t: 'Absence of cough', pts: 1 },
    { id: 'n', t: 'Tender anterior cervical lymphadenopathy', pts: 1 },
    { id: 't', t: 'Tonsillar swelling or exudate', pts: 1 },
    { id: 'a', t: 'Age', type: 'radio', opts: [{ t: '3 – 14 years', pts: 1 }, { t: '15 – 44 years', pts: 0 }, { t: '45 or older', pts: -1 }] },
  ],
  bands: [
    { max: 1, label: 'Low probability (1 – 10%)', kind: 'ok', note: 'No swab and no antibiotic. Symptomatic treatment and reassurance.' },
    { max: 3, label: 'Intermediate probability (11 – 35%)', kind: 'warn', note: 'Rapid antigen test; treat only if positive.' },
    { max: 99, label: 'High probability (over 50%)', kind: 'danger', note: 'Rapid test or empirical treatment depending on the clinical picture. Amoxicillin 500 mg BD for 10 days.' },
  ],
  foot: 'Always exclude difficulty swallowing saliva, a muffled voice, uvular deviation or neck stiffness — signs of peritonsillar abscess or epiglottitis.',
},

{
  id: 'wells-dvt', cat: 'Infection', type: 'score',
  title: 'Wells Score for DVT', sub: 'Probability of deep vein thrombosis',
  tags: ['dvt', 'clot', 'leg', 'wells', 'thrombosis'],
  items: [
    { id: 'ca', t: 'Active cancer (treatment within 6 months or palliative)', pts: 1 },
    { id: 'par', t: 'Paralysis, paresis or recent immobilisation of the leg', pts: 1 },
    { id: 'bed', t: 'Bedridden 3 days or more, or major surgery within 12 weeks', pts: 1 },
    { id: 'tend', t: 'Localised tenderness along the deep venous system', pts: 1 },
    { id: 'swell', t: 'Entire leg swollen', pts: 1 },
    { id: 'calf', t: 'Calf swelling more than 3 cm greater than the other side', pts: 1 },
    { id: 'pit', t: 'Pitting oedema confined to the symptomatic leg', pts: 1 },
    { id: 'coll', t: 'Collateral superficial veins (non-varicose)', pts: 1 },
    { id: 'prev', t: 'Previously documented DVT', pts: 1 },
    { id: 'alt', t: 'An alternative diagnosis is at least as likely', pts: -2 },
  ],
  bands: [
    { max: 0, label: 'DVT unlikely', kind: 'ok', note: 'A negative high-sensitivity D-dimer effectively excludes DVT. If positive, request a Doppler ultrasound.' },
    { max: 99, label: 'DVT likely', kind: 'danger', note: 'Go straight to Doppler ultrasound; do not rely on D-dimer. Consider interim anticoagulation if imaging will be delayed and bleeding risk is low.' },
  ],
},

/* ============ MENTAL HEALTH ============ */
{
  id: 'phq9', cat: 'Mental health', type: 'score',
  title: 'PHQ-9', sub: 'Depression severity over the last two weeks',
  tags: ['depression', 'phq', 'mental health', 'mood'],
  scale: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  items: [
    { id: 'q1', t: 'Little interest or pleasure in doing things', type: 'scale' },
    { id: 'q2', t: 'Feeling down, depressed or hopeless', type: 'scale' },
    { id: 'q3', t: 'Trouble falling or staying asleep, or sleeping too much', type: 'scale' },
    { id: 'q4', t: 'Feeling tired or having little energy', type: 'scale' },
    { id: 'q5', t: 'Poor appetite or overeating', type: 'scale' },
    { id: 'q6', t: 'Feeling bad about yourself, or that you are a failure or have let people down', type: 'scale' },
    { id: 'q7', t: 'Trouble concentrating on reading or watching television', type: 'scale' },
    { id: 'q8', t: 'Moving or speaking noticeably slowly, or the opposite — restless and fidgety', type: 'scale' },
    { id: 'q9', t: 'Thoughts that you would be better off dead, or of hurting yourself', type: 'scale', flag: true },
  ],
  bands: [
    { max: 4, label: 'No significant depression', kind: 'ok', note: 'No treatment indicated. Reassure and reassess if symptoms change.' },
    { max: 9, label: 'Mild depression', kind: 'warn', note: 'Active monitoring, behavioural activation, regular exercise, and reassessment in two weeks.' },
    { max: 14, label: 'Moderate depression', kind: 'warn', note: 'Start treatment: an SSRI, CBT, or both, with follow-up within two weeks.' },
    { max: 19, label: 'Moderately severe depression', kind: 'danger', note: 'Pharmacological treatment plus psychological referral, with close follow-up.' },
    { max: 99, label: 'Severe depression', kind: 'danger', note: 'Start treatment immediately, refer to psychiatry, and assess suicide risk carefully.' },
  ],
  foot: 'Any positive answer on item 9 requires a direct suicide risk assessment regardless of the total score.',
},

{
  id: 'gad7', cat: 'Mental health', type: 'score',
  title: 'GAD-7', sub: 'Anxiety severity over the last two weeks',
  tags: ['anxiety', 'gad', 'mental health', 'worry'],
  scale: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  items: [
    { id: 'q1', t: 'Feeling nervous, anxious or on edge', type: 'scale' },
    { id: 'q2', t: 'Not being able to stop or control worrying', type: 'scale' },
    { id: 'q3', t: 'Worrying too much about different things', type: 'scale' },
    { id: 'q4', t: 'Trouble relaxing', type: 'scale' },
    { id: 'q5', t: 'Being so restless that it is hard to sit still', type: 'scale' },
    { id: 'q6', t: 'Becoming easily annoyed or irritable', type: 'scale' },
    { id: 'q7', t: 'Feeling afraid as if something awful might happen', type: 'scale' },
  ],
  bands: [
    { max: 4, label: 'Minimal anxiety', kind: 'ok', note: 'No drug treatment indicated.' },
    { max: 9, label: 'Mild anxiety', kind: 'warn', note: 'Education, breathing and relaxation techniques, physical activity, and reassessment.' },
    { max: 14, label: 'Moderate anxiety', kind: 'warn', note: 'CBT and/or an SSRI. Start at half dose to limit the initial agitation.' },
    { max: 99, label: 'Severe anxiety', kind: 'danger', note: 'Pharmacological treatment plus psychological referral, and assess for comorbid depression.' },
  ],
  foot: 'Exclude organic causes: hyperthyroidism, anaemia, excess caffeine, arrhythmia, and sedative withdrawal.',
},

/* ============ LABORATORY ============ */
{
  id: 'a1c', cat: 'Laboratory', type: 'form',
  title: 'HbA1c Converter', sub: 'To estimated average glucose',
  tags: ['diabetes', 'hba1c', 'glucose', 'conversion'],
  fields: [{ id: 'a', label: 'HbA1c', unit: '%', type: 'number', step: '0.1' }],
  compute(v) {
    const a = _n(v.a);
    if (!a) return null;
    const eag = 28.7 * a - 46.7;
    let i, kind;
    if (a < 5.7) { i = 'Normal'; kind = 'ok'; }
    else if (a < 6.5) { i = 'Prediabetes'; kind = 'warn'; }
    else if (a < 7) { i = 'Diabetes — at target for most adults'; kind = 'ok'; }
    else if (a < 8) { i = 'Diabetes — slightly above target'; kind = 'warn'; }
    else { i = 'Diabetes — uncontrolled'; kind = 'danger'; }
    return { v: _r(eag, 0), u: 'mg/dL estimated average', i, kind, lines: [
      'Equivalent to ' + _r(eag / 18, 1) + ' mmol/L.',
      'HbA1c can be unreliable with anaemia, haemoglobinopathy, pregnancy, renal failure or recent transfusion — use continuous monitoring or fructosamine instead.',
    ]};
  },
},

{
  id: 'ca-corr', cat: 'Laboratory', type: 'form',
  title: 'Corrected Calcium', sub: 'Corrected for albumin',
  tags: ['calcium', 'albumin', 'electrolytes'],
  fields: [
    { id: 'ca', label: 'Measured calcium', unit: 'mg/dL', type: 'number', step: '0.1' },
    { id: 'alb', label: 'Albumin', unit: 'g/dL', type: 'number', step: '0.1' },
  ],
  compute(v) {
    const ca = _n(v.ca), alb = _n(v.alb);
    if (!ca || !alb) return null;
    const c = ca + 0.8 * (4 - alb);
    let i, kind;
    if (c < 8.5) { i = 'Hypocalcaemia'; kind = 'warn'; }
    else if (c <= 10.5) { i = 'Within normal range'; kind = 'ok'; }
    else if (c <= 12) { i = 'Mild hypercalcaemia'; kind = 'warn'; }
    else { i = 'Marked hypercalcaemia — needs urgent assessment'; kind = 'danger'; }
    return { v: _r(c, 2), u: 'mg/dL', i, kind, lines: [
      'For any real abnormality request PTH, vitamin D, phosphate, magnesium and renal function.',
      'The commonest outpatient causes of hypercalcaemia are primary hyperparathyroidism and malignancy.',
    ]};
  },
},

{
  id: 'fib4', cat: 'Laboratory', type: 'form',
  title: 'FIB-4', sub: 'Advanced fibrosis risk in fatty liver disease',
  tags: ['liver', 'fatty liver', 'fib4', 'fibrosis', 'nafld'],
  fields: [
    { id: 'age', label: 'Age', unit: 'years', type: 'number' },
    { id: 'ast', label: 'AST', unit: 'U/L', type: 'number' },
    { id: 'alt', label: 'ALT', unit: 'U/L', type: 'number' },
    { id: 'plt', label: 'Platelets', unit: '10⁹/L', type: 'number' },
  ],
  compute(v) {
    const age = _n(v.age), ast = _n(v.ast), alt = _n(v.alt), plt = _n(v.plt);
    if (!age || !ast || !alt || !plt) return null;
    const f = (age * ast) / (plt * Math.sqrt(alt));
    let i, kind, lines;
    if (f < 1.3) { i = 'Advanced fibrosis unlikely'; kind = 'ok'; lines = ['Manage in primary care with attention to metabolic risk factors, and repeat in 2–3 years.']; }
    else if (f <= 2.67) { i = 'Indeterminate range'; kind = 'warn'; lines = ['Needs a second-line test: transient elastography (FibroScan) or ELF.']; }
    else { i = 'Advanced fibrosis likely'; kind = 'danger'; lines = ['Refer to hepatology for assessment.']; }
    lines.push('Over the age of 65 the index tends to over-call; use a higher threshold of 2.0.');
    return { v: _r(f, 2), u: '', i, kind, lines };
  },
},

{
  id: 'anion', cat: 'Laboratory', type: 'form',
  title: 'Anion Gap', sub: 'With albumin and glucose corrections',
  tags: ['anion gap', 'sodium', 'acidosis', 'electrolytes'],
  fields: [
    { id: 'na', label: 'Sodium', unit: 'mmol/L', type: 'number' },
    { id: 'cl', label: 'Chloride', unit: 'mmol/L', type: 'number' },
    { id: 'hco3', label: 'Bicarbonate', unit: 'mmol/L', type: 'number' },
    { id: 'alb', label: 'Albumin (optional)', unit: 'g/dL', type: 'number', step: '0.1' },
    { id: 'glu', label: 'Blood glucose (optional)', unit: 'mg/dL', type: 'number' },
  ],
  compute(v) {
    const na = _n(v.na), cl = _n(v.cl), hco3 = _n(v.hco3);
    if (!na || !cl || !hco3) return null;
    let ag = na - (cl + hco3);
    const lines = ['Uncorrected gap: ' + _r(ag, 1)];
    const alb = _n(v.alb);
    if (alb) { ag = ag + 2.5 * (4 - alb); lines.push('Corrected for albumin: ' + _r(ag, 1)); }
    const glu = _n(v.glu);
    if (glu && glu > 100) lines.push('Sodium corrected for glucose: ' + _r(na + 1.6 * (glu - 100) / 100, 1) + ' mmol/L');
    let i, kind;
    if (ag > 12) { i = 'Raised anion gap'; kind = 'danger'; lines.push('Causes (GOLDMARK): ketoacidosis, lactate, renal failure, and toxic alcohol or salicylate ingestion.'); }
    else if (ag < 8) { i = 'Low gap'; kind = 'warn'; lines.push('Consider hypoalbuminaemia or myeloma.'); }
    else { i = 'Normal gap'; kind = 'ok'; }
    return { v: _r(ag, 1), u: 'mmol/L', i, kind, lines };
  },
},

/* ============ WOMEN'S HEALTH ============ */
{
  id: 'edd', cat: "Women's health", type: 'form',
  title: 'Gestational Age & EDD', sub: 'From the last menstrual period',
  tags: ['pregnancy', 'obstetric', 'edd', 'gestation', 'lmp'],
  fields: [
    { id: 'lmp', label: 'First day of the last menstrual period', type: 'date' },
    { id: 'cyc', label: 'Cycle length', unit: 'days (default 28)', type: 'number', def: '28' },
  ],
  compute(v) {
    if (!v.lmp) return null;
    const lmp = new Date(v.lmp + 'T00:00:00');
    if (isNaN(lmp)) return null;
    const cyc = _n(v.cyc) || 28;
    const adj = cyc - 28;
    const edd = new Date(lmp.getTime() + (280 + adj) * 86400000);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const days = Math.floor((now - lmp) / 86400000) - adj;
    if (days < 0) return { v: '—', u: '', i: 'The date entered is in the future', kind: 'warn', lines: [] };
    const wk = Math.floor(days / 7), d = days % 7;
    const fmt = dt => dt.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    let i, kind;
    if (wk < 14) { i = 'First trimester'; kind = 'ok'; }
    else if (wk < 28) { i = 'Second trimester'; kind = 'ok'; }
    else if (wk < 37) { i = 'Third trimester'; kind = 'warn'; }
    else if (wk < 42) { i = 'Term'; kind = 'warn'; }
    else { i = 'Post-term — needs assessment'; kind = 'danger'; }
    const lines = ['Estimated date of delivery: ' + fmt(edd)];
    if (wk < 14) lines.push('Next milestone: nuchal translucency scan at 11–14 weeks.');
    else if (wk < 22) lines.push('Next milestone: detailed anomaly scan at 18–22 weeks.');
    else if (wk < 28) lines.push('Next milestone: gestational diabetes screen at 24–28 weeks, and anti-D at 28 weeks if Rh negative.');
    else if (wk < 37) lines.push('Next milestone: Tdap between 27 and 36 weeks, and a group B strep swab at 35–37 weeks.');
    lines.push('A first-trimester scan is more accurate than the LMP when the two differ by more than 7 days.');
    return { v: wk + ' weeks + ' + d, u: '', i, kind, lines };
  },
},

/* ============ PREVENTION ============ */
{
  id: 'smoke', cat: 'Prevention', type: 'form',
  title: 'Pack-Years', sub: 'Smoking burden and screening eligibility',
  tags: ['smoking', 'pack year', 'lung', 'tobacco'],
  fields: [
    { id: 'p', label: 'Packs per day', unit: '1 pack = 20 cigarettes', type: 'number', step: '0.05' },
    { id: 'y', label: 'Years smoked', unit: 'years', type: 'number', step: '0.5' },
  ],
  compute(v) {
    const p = _n(v.p), y = _n(v.y);
    if (!p || !y) return null;
    const py = p * y;
    let i, kind, lines = [];
    if (py >= 20) { i = 'Heavy smoking burden'; kind = 'danger'; lines.push('Eligible for low-dose CT lung cancer screening between ages 50 and 80, if currently smoking or quit within 15 years.'); }
    else { i = 'Below the lung cancer screening threshold'; kind = 'warn'; }
    lines.push('Offer cessation support at every visit — brief advice alone raises quit rates.');
    lines.push('Available treatments: nicotine replacement (patch plus gum together), varenicline, or bupropion, alongside behavioural support.');
    return { v: _r(py, 1), u: 'pack-years', i, kind, lines };
  },
},
];
