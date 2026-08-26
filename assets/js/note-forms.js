/* FM Progress Note Assistant — visit templates (Stage 1: adaptive form)
   Every required field carries an `example` (the teaching) and a `why` (the curriculum).
   Note body is ALWAYS English — it is pasted into the EMR. */

(function () {
  'use strict';

  /* field helper: F(id, label, type, extras) */
  const F = (id, en, type, x) => Object.assign({ id: id, en: en, type: type }, x || {});

  const NONE = 'None of the above';

  /* ---------- conditional visibility ----------
     A field carries `when(data)`. It is shown only when the predicate passes, so the
     form asks the diabetes questions only once you have said the patient has diabetes.
     A hidden field's answer is kept in memory (toggling back restores it) but is never
     read into the note — an answer you cannot currently see must not become a finding. */
  const picked = (id, v) => d => Array.isArray(d[id]) && d[id].indexOf(v) >= 0;
  const equals = (id, v) => d => d[id] === v;
  const oneOf = (id, vs) => d => vs.indexOf(d[id]) >= 0;
  const atLeast = (id, n) => d => Number(d[id]) >= n;

  const isVisible = (f, d) => !f.when || !!f.when(d || {});

  /* ---------- red-flag screen builder ---------- */
  const redFlagField = (opts, flags, why) => F('red_flags', 'Red flag screen', 'multiselect', {
    required: true, options: opts.concat([NONE]), redFlags: flags,
    example: NONE,
    why: why || 'Any one of these changes this from an outpatient workup to an urgent pathway.',
  });

  /* ================= SHARED BLOCKS (rule F6) ================= */

  const HEADER = [
    F('age', 'Age', 'number', { required: true, example: '58', why: 'Age reframes the differential for almost every complaint.' }),
    F('sex', 'Sex', 'select', { required: true, options: ['female', 'male'], example: 'female' }),
    F('marital', 'Marital status', 'select', { required: false, options: ['single', 'married'], example: 'married',
      why: 'Part of the house opening line.' }),
    F('smoking', 'Smoking', 'select', { required: true, options: ['Non-smoker', 'Ex-smoker', 'Smoker'], example: 'Non-smoker',
      why: 'Drives CVD risk, and the opening line records it every visit.' }),
    F('pack_years', 'Pack-years', 'number', { required: false, example: '20',
      when: oneOf('smoking', ['Smoker', 'Ex-smoker']),
      why: '20 pack-years is the threshold for lung cancer screening eligibility.' }),
    F('known_case', 'Known case of — one problem per line', 'textarea', { required: true,
      example: 'T2DM: on Metformin 1g BD, HbA1c 7.9%\nHTN: on Amlodipine 5mg OD, controlled\nHypothyroid: following with Endocrine, stable',
      why: 'A bare problem name teaches nothing. Drug + dose + frequency + control status is what makes the list useful to the next reader.' }),
    F('behaviour', 'Patient behaviour flag', 'select', { required: false,
      options: ['No', 'Demanding patient', 'Insisting patient'], example: 'No',
      why: 'House format puts this on its own line. Describe behaviour, never label the person (R6).' }),
  ];

  const SUBJ_TAIL = [
    F('mc', 'Menstrual cycle', 'select', { required: false,
      options: ['MC is regular', 'MC is irregular', 'Post-menopausal', 'Not applicable'], example: 'MC is regular',
      when: equals('sex', 'female'),
      why: 'Recorded for every female patient of reproductive age; irregularity changes the workup.' }),
    F('depression_screen', 'Depression screening', 'select', { required: true,
      options: ['-ive', '+ive', 'Not done'], example: '-ive',
      redFlags: ['+ive'],
      why: 'Screening is due at least annually; a positive screen must lead to PHQ-9 in the same visit.' }),
    F('pmh', 'Other PMH / PSHx', 'text', { required: false, example: 'Nill', why: 'House spelling is "Nill". Keep it.' }),
    F('med_allergy', 'Medication / Allergy', 'text', { required: false, example: 'Nill',
      why: 'An allergy recorded as a reaction type ("penicillin — rash") is worth ten times one recorded as a word.' }),
    F('fmhx', 'FMHx', 'text', { required: false, example: 'Nill',
      why: 'Premature CVD or malignancy in a first-degree relative changes screening thresholds.' }),
    F('diet_exercise', 'Diet / Exercising', 'select', { required: true,
      options: ['Not following diet or exercising (advice given)', 'Following diet and exercising regularly',
                'Following diet only (advice given)', 'Exercising only (advice given)'],
      example: 'Not following diet or exercising (advice given)',
      why: 'Recording that advice was given is both care and documentation.' }),
  ];

  const VITALS = [
    F('sbp', 'SBP (mmHg)', 'number', { required: true, example: '128', why: 'Mean BP is computed for you — do not enter it.' }),
    F('dbp', 'DBP (mmHg)', 'number', { required: true, example: '78' }),
    F('hr', 'HR (Freq./min)', 'number', { required: true, example: '76' }),
    F('rr', 'RR (Freq./min)', 'number', { required: false, example: '18' }),
    F('temp', 'T (°C)', 'number', { required: true, example: '36.8' }),
    F('spo2', 'SpO2 (%)', 'number', { required: true, example: '98' }),
  ];

  const GENERAL_EXAM = F('general_exam', 'General appearance', 'multiselect', {
    required: true, allowCustom: true,
    options: ['Looking well, not in pain or distress', 'In mild distress', 'Pale', 'Dehydrated', 'Obese'],
    example: 'Looking well, not in pain or distress',
    why: 'The house opening line of every physical exam.',
  });

  const LABS = F('labs', 'Labs', 'textarea', { required: false,
    example: 'HbA1c 7.9% (was 7.2% six months ago)\nLDL 3.4, eGFR 78, TSH 2.1',
    why: 'Put prior values beside current ones — direction is the finding, not the number (A3).' });

  const ASSESSMENT = [
    F('assessment_lines', 'Assessment — one line per problem', 'textarea', { required: true,
      example: 'T2DM (uncontrolled, HbA1c 7.9%, rising from 7.2%): adherence confirmed, dietary factors the likely driver; for dietitian referral and recheck in 3/12\nHTN (controlled, 128/78): no change today',
      why: 'Every line: problem (qualifier + number): reasoning; for action. A line with no action is an unfinished thought (A1, A2).' }),
    F('deliberate_non_action', 'Anything you deliberately did NOT do?', 'text', { required: false,
      example: 'NSAIDs avoided due to CKD 3a',
      why: 'Deliberate non-action documented with its reason is what separates a decision from an omission (A5).' }),
    F('disagreement', 'Did the patient insist on or decline anything?', 'select', { required: true,
      options: ['No', 'Insisted on something', 'Declined something'], example: 'No',
      why: 'If yes, the note must record all four parts: what you explained, that they disagreed, what you did, what you offered instead (A6).' }),
    F('disagreement_what', 'What did they insist on / decline?', 'text', { required: true,
      example: 'requested a full body CT for reassurance',
      when: d => d.disagreement && d.disagreement !== 'No',
      why: 'Name the specific request — "wanted tests" is not documentation.' }),
    F('disagreement_action', 'What did you do, and what did you offer instead?', 'text', { required: true,
      example: 'not ordered, rationale documented; targeted ultrasound offered and accepted',
      when: d => d.disagreement && d.disagreement !== 'No',
      why: 'Completes the four-part sequence (A6).' }),
  ];

  const PLAN = [
    F('plan_items', 'Investigations / referrals / prescriptions', 'textarea', { required: true,
      example: 'CBC, HbA1c, lipid profile, renal profile\nDietitian referral\nMetformin 1g BD continued',
      why: 'One item per line. This is the only place a reader learns what was actually ordered.' }),
    F('er_instructions', 'ER instructions — when must they come back immediately?', 'text', { required: true,
      example: 'in case of chest pain, syncope, or severe shortness of breath',
      why: 'Safety netting appears in every plan (R5). Generic wording protects nobody — name the symptoms.' }),
    F('follow_up', 'Follow up after', 'select', { required: true, allowCustom: true,
      options: ['1/52', '2/52', '4/52', '6/52', '3/12', '6/12', '1/12', '12/12'],
      example: '3/12',
      why: 'House interval format: 3/12 is three months, 4/52 is four weeks.' }),
    F('follow_up_for', 'Follow up for', 'text', { required: false, example: 'lab results review',
      why: 'A follow-up with no stated purpose gets cancelled by the patient.' }),
  ];

  /* ================= COMPLAINT-SPECIFIC BLOCKS ================= */

  const V = [];
  const visit = (o) => { V.push(o); };

  visit({
    id: 'chronic', label: 'Chronic disease follow-up', ar: 'متابعة مرض مزمن',
    tags: ['diabetes', 'dm', 'htn', 'hypertension', 'chronic', 'سكري', 'ضغط', 'متابعة'],
    reason: 'follow up', purpose: 'for lab results',
    subjective: [
      F('conditions', 'Which problems are you reviewing today?', 'multiselect', { required: true, allowCustom: true,
        options: ['Diabetes', 'Hypertension', 'Dyslipidaemia', 'Hypothyroidism', 'Asthma / COPD',
                  'CKD', 'IHD / AF', 'Osteoporosis', 'Obesity'],
        example: 'Diabetes, Hypertension',
        why: 'The rest of this form adapts to what you pick — you only get the questions that matter for these problems.' }),
      F('control_status', 'Control status of each problem', 'textarea', { required: true,
        example: 'T2DM: HbA1c 7.9%, rising from 7.2%. Missing evening Metformin dose 2-3 times/week.\nHTN: home readings 125-135/75-85',
        why: 'Direction matters more than the value. "Rising from 7.2%" tells the next reader what to do (A3).' }),
      F('adherence', 'Medication adherence', 'select', { required: true,
        options: ['Taking all medications as prescribed', 'Admits missing doses occasionally',
                  'Admits missing doses frequently', 'Self-discontinued a medication'],
        example: 'Admits missing doses occasionally',
        why: 'Ask non-judgementally: "most people miss doses — how many times this week?" Never write "non-compliant" (R6).' }),

      /* --- diabetes --- */
      F('hypo_symptoms', 'Hypoglycaemia episodes', 'select', { required: true,
        when: picked('conditions', 'Diabetes'),
        options: ['No hypoglycaemic episodes', 'Occasional mild episodes', 'Frequent or severe episodes'],
        redFlags: ['Frequent or severe episodes'],
        example: 'No hypoglycaemic episodes',
        why: 'In older adults hypoglycaemia presents as confusion or falls, not tremor — and it means the regimen is too tight.' }),
      F('dm_complications', 'Diabetes complication screening', 'multiselect', { required: true, allowCustom: true,
        when: picked('conditions', 'Diabetes'),
        options: ['Fundus exam up to date', 'Foot exam done today', 'Urine ACR up to date',
                  'Monofilament sensation intact', 'None up to date'],
        example: 'Foot exam done today, fundus exam up to date',
        why: 'Complication screening is the part of chronic care that silently lapses for years.' }),
      F('dm_symptoms', 'Osmotic symptoms', 'multiselect', { required: false,
        when: picked('conditions', 'Diabetes'),
        options: ['Polyuria', 'Polydipsia', 'Unintentional weight loss', 'Blurred vision', 'New foot numbness', NONE],
        redFlags: ['Unintentional weight loss', 'New foot numbness'],
        example: NONE,
        why: 'Osmotic symptoms mean the glucose is high enough to need action today, not at the next visit.' }),

      /* --- hypertension --- */
      F('home_bp', 'Home BP readings', 'text', { required: true,
        when: picked('conditions', 'Hypertension'),
        example: '125-135 / 75-85, taken twice daily for a week',
        why: 'Home readings predict outcomes better than clinic readings and settle white-coat hypertension.' }),
      F('htn_sx', 'Symptoms on antihypertensives', 'multiselect', { required: false,
        when: picked('conditions', 'Hypertension'),
        options: ['Dizziness on standing', 'Ankle swelling', 'Dry cough', 'Fatigue', NONE],
        redFlags: ['Dizziness on standing'],
        example: NONE,
        why: 'Postural dizziness means the dose is too high for this patient regardless of the clinic number.' }),

      /* --- lipids --- */
      F('statin_status', 'Statin', 'select', { required: true,
        when: picked('conditions', 'Dyslipidaemia'),
        options: ['On statin, tolerating well', 'On statin with muscle symptoms', 'Self-discontinued the statin',
                  'Not on a statin'],
        redFlags: ['On statin with muscle symptoms'],
        example: 'On statin, tolerating well',
        why: 'Most statin "intolerance" is dose- or drug-specific and recoverable — but only if you record it.' }),

      /* --- thyroid --- */
      F('thyroid_sx', 'Thyroid symptoms', 'multiselect', { required: false,
        when: picked('conditions', 'Hypothyroidism'),
        options: ['Fatigue', 'Cold intolerance', 'Constipation', 'Weight gain', 'Hair loss', NONE],
        example: NONE,
        why: 'Symptoms with a normal TSH usually mean something else — do not keep raising the dose.' }),

      /* --- airways --- */
      F('asthma_control', 'Control in the last 4 weeks', 'multiselect', { required: true,
        when: picked('conditions', 'Asthma / COPD'),
        options: ['Daytime symptoms more than twice a week', 'Any night waking due to symptoms',
                  'Reliever needed more than twice a week', 'Any activity limitation', NONE],
        redFlags: ['Any night waking due to symptoms'],
        example: NONE,
        why: 'These four questions are the whole control assessment. None = controlled; three or four = uncontrolled.' }),
      F('inhaler_technique', 'Inhaler technique', 'select', { required: true,
        when: picked('conditions', 'Asthma / COPD'),
        options: ['Checked today, correct', 'Checked today, corrected', 'Not checked this visit'],
        example: 'Checked today, correct',
        why: 'Check technique before stepping up treatment — bad technique looks exactly like uncontrolled disease.' }),

      /* --- kidney --- */
      F('ckd_trend', 'eGFR trend', 'text', { required: true,
        when: picked('conditions', 'CKD'),
        example: 'eGFR 41, was 47 twelve months ago; ACR 12',
        why: 'A falling eGFR is the finding; a single value is not (A3). It also drives every dose in the list.' }),

      /* --- cardiac --- */
      F('cardiac_sx', 'Cardiac symptoms', 'multiselect', { required: true,
        when: picked('conditions', 'IHD / AF'),
        options: ['Chest pain on exertion', 'Palpitation', 'Orthopnoea or PND', 'New leg swelling',
                  'Syncope or presyncope', NONE],
        redFlags: ['Chest pain on exertion', 'Orthopnoea or PND', 'Syncope or presyncope'],
        example: NONE,
        why: 'These separate stable disease from a presentation that needs action in this visit.' }),

      /* --- bone --- */
      F('osteo_status', 'Bone health', 'multiselect', { required: false,
        when: picked('conditions', 'Osteoporosis'),
        options: ['On bisphosphonate, taking it correctly', 'Calcium and vitamin D replete',
                  'New fracture since last visit', 'Fall in the last year', 'Dental check done'],
        redFlags: ['New fracture since last visit', 'Fall in the last year'],
        example: 'On bisphosphonate, taking it correctly, calcium and vitamin D replete',
        why: 'A fragility fracture on treatment means the treatment needs review, not continuation.' }),

      redFlagField(
        ['Chest pain', 'New shortness of breath', 'Visual loss or new blurring', 'Foot ulcer or new numbness',
         'Severe hypoglycaemia needing help', 'Leg swelling'],
        ['Chest pain', 'New shortness of breath', 'Visual loss or new blurring', 'Foot ulcer or new numbness', 'Severe hypoglycaemia needing help'],
        'These convert a routine follow-up into an urgent problem in the same visit.'),
    ],
    exam: [
      F('focused_exam', 'Focused examination', 'multiselect', { required: true, allowCustom: true,
        options: ['Chest: clear, equal air entry', 'CVS: S1+S2+0, no murmur', 'No lower limb oedema',
                  'Feet: intact sensation, pulses palpable, no ulcer', 'Abdomen: soft, non-tender'],
        example: 'CVS: S1+S2+0, no murmur, no lower limb oedema',
        why: 'Examine what changes your decision today, not a full systems tour.' }),
    ],
    er: 'in case of chest pain, severe shortness of breath, or severe hypoglycaemia',
    fu: '3/12', fuFor: 'lab results review',
  });

  visit({
    id: 'routine', label: 'Routine visit / labs / refill', ar: 'زيارة روتينية أو صرف دواء',
    tags: ['routine', 'refill', 'labs', 'روتين', 'صرف', 'تحاليل'],
    reason: 'routine', purpose: 'request labs',
    subjective: [
      F('complaints', 'Any complaints today?', 'select', { required: true,
        options: ['Doing well, No complaints', 'Has a complaint (describe below)'],
        example: 'Doing well, No complaints',
        why: 'The house phrase is "Doing well, No complaints" — keep it exact.' }),
      F('cvd_risk', 'CVD risk assessment', 'textarea', { required: false,
        when: atLeast('age', 40),
        example: 'Non-smoker, BMI 27.4, BP controlled, LDL 3.1, no FMHx of premature CVD. ASCVD 10-yr risk 6.2%.',
        why: 'A routine visit is the only chance to do primary prevention properly.' }),
      F('screening_due', 'Screening due', 'multiselect', { required: true, allowCustom: true,
        options: ['Mammogram', 'Cervical smear', 'Colorectal screening', 'DEXA', 'Lipid profile',
                  'HbA1c / fasting glucose', 'Influenza vaccine', 'Nothing due'],
        example: 'Lipid profile, influenza vaccine',
        why: 'Screening opportunities missed at a routine visit rarely come back.' }),
      redFlagField(
        ['Unintentional weight loss', 'Night sweats with fever', 'New lump', 'Bleeding from any orifice', 'Persistent hoarseness'],
        ['Unintentional weight loss', 'Night sweats with fever', 'New lump', 'Bleeding from any orifice', 'Persistent hoarseness'],
        'A "routine" visit is where these are most often missed — ask explicitly.'),
    ],
    exam: [],
    er: 'in case of new or worsening symptoms',
    fu: '6/12', fuFor: 'routine review',
  });

  visit({
    id: 'palpitation', label: 'Palpitation', ar: 'خفقان',
    tags: ['palpitation', 'خفقان', 'cardiac', 'قلب'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('duration', 'Duration of symptoms', 'select', { required: true, allowCustom: true,
        options: ['< 1 week', '1-4 weeks', '1-6 months', '> 6 months'], example: '3 months',
        why: 'Separates a new arrhythmia needing urgent workup from a long-standing benign pattern.' }),
      F('trigger', 'Triggers', 'multiselect', { required: true, allowCustom: true,
        options: ['At rest', 'On exertion', 'On sudden movement', 'On lifting heavy objects',
                  'After caffeine', 'With emotional stress', 'On standing up'],
        redFlags: ['On exertion'],
        example: 'On sudden movement, on lifting heavy objects',
        why: 'Exertional palpitation carries a far higher risk of a structural or arrhythmic cause.' }),
      F('rhythm_character', 'Character — ask the patient to tap it out', 'select', { required: true,
        options: ['Regular, fast', 'Irregular', 'Isolated skipped beats', 'Unable to characterise'],
        example: 'Isolated skipped beats',
        why: 'Tapping the rhythm is more informative than any description — it distinguishes ectopics from AF at the bedside.' }),
      redFlagField(
        ['Syncope', 'Presyncope', 'Exertional chest pain', 'SOB at rest', 'FMHx of sudden cardiac death'],
        ['Syncope', 'Presyncope', 'Exertional chest pain', 'SOB at rest', 'FMHx of sudden cardiac death'],
        'Any one of these moves this from an outpatient workup to an urgent cardiology pathway.'),
      F('secondary_causes', 'Secondary cause screen', 'multiselect', { required: true, allowCustom: true,
        options: ['Heat intolerance / tremor / weight loss', 'Anemia symptoms', 'Caffeine or energy drinks',
                  'Stimulant or decongestant use', 'Anxiety symptoms', NONE],
        example: NONE,
        why: 'Thyrotoxicosis, anaemia and stimulants explain a large share of palpitation in primary care.' }),
    ],
    exam: [
      F('cvs_exam', 'CVS examination', 'multiselect', { required: true, allowCustom: true,
        options: ['S1+S2+0', 'Regular rhythm', 'Irregular rhythm', 'Murmur present', 'No murmur', 'No leg oedema'],
        redFlags: ['Irregular rhythm', 'Murmur present'],
        example: 'S1+S2+0, regular rhythm, no murmur',
        why: 'A murmur or an irregular rhythm changes the whole pathway — this is the examination that matters here.' }),
      F('ecg', 'ECG today', 'textarea', { required: true,
        example: 'Sinus rhythm, rate 82, normal axis, no pre-excitation, normal QTc, no ischaemic changes',
        why: 'New palpitation without a same-visit ECG is an incomplete assessment. If not done, say so and say why.' }),
    ],
    er: 'in case of syncope, chest pain, or palpitation associated with severe shortness of breath',
    fu: '4/52', fuFor: 'ECG and thyroid function results',
  });

  visit({
    id: 'chest-pain', label: 'Chest pain', ar: 'ألم صدر',
    tags: ['chest pain', 'ألم صدر', 'angina', 'قلب'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('duration', 'Duration and pattern', 'select', { required: true, allowCustom: true,
        options: ['Ongoing now', '< 24 hours', '1-7 days', '1-4 weeks', '> 1 month'], example: '2 weeks, intermittent',
        why: 'Pain present now is a different clinical problem from pain last week.' }),
      F('character', 'Character', 'multiselect', { required: true, allowCustom: true,
        options: ['Central pressure or heaviness', 'Sharp / stabbing', 'Pleuritic (worse on breathing)',
                  'Burning / reflux-like', 'Reproducible on palpation'],
        redFlags: ['Central pressure or heaviness'],
        example: 'Reproducible on palpation, sharp',
        why: 'Reproducible tenderness lowers the probability of ACS but never excludes it on its own.' }),
      F('relation', 'Relation to exertion', 'select', { required: true,
        options: ['Occurs on exertion, relieved by rest', 'Occurs at rest only', 'Unrelated to activity', 'Occurs at rest AND on exertion'],
        redFlags: ['Occurs on exertion, relieved by rest', 'Occurs at rest AND on exertion'],
        example: 'Unrelated to activity',
        why: 'The exertional relationship is the single most discriminating question in chest pain.' }),
      redFlagField(
        ['Radiation to jaw or left arm', 'Diaphoresis', 'Syncope', 'SOB at rest', 'Haemoptysis',
         'Unilateral leg swelling', 'Tearing pain radiating to back'],
        ['Radiation to jaw or left arm', 'Diaphoresis', 'Syncope', 'SOB at rest', 'Haemoptysis',
         'Unilateral leg swelling', 'Tearing pain radiating to back'],
        'These separate the patient who can be worked up in clinic from the one who needs the ER now.'),
      F('risk_factors', 'Cardiovascular risk factors', 'multiselect', { required: true, allowCustom: true,
        options: ['Diabetes', 'Hypertension', 'Dyslipidaemia', 'Smoking', 'FMHx premature CVD', 'Known CAD', NONE],
        example: 'Hypertension, dyslipidaemia',
        why: 'Pre-test probability is built from these — the same pain means different things in different patients.' }),
    ],
    exam: [
      F('cvs_resp_exam', 'CVS / Respiratory examination', 'multiselect', { required: true, allowCustom: true,
        options: ['S1+S2+0, no murmur', 'Chest clear, equal air entry', 'Chest wall tenderness reproduces the pain',
                  'No leg swelling', 'Reduced air entry one side'],
        example: 'S1+S2+0 no murmur, chest clear, chest wall tenderness reproduces the pain',
        why: 'Document the reproducibility explicitly — it is the finding you will be asked about later.' }),
      F('ecg', 'ECG today', 'textarea', { required: true,
        example: 'Sinus rhythm, rate 74, no ST or T wave changes, no Q waves',
        why: 'Chest pain without a same-visit ECG is an incomplete assessment.' }),
    ],
    er: 'in case of chest pain lasting more than 20 minutes, pain with sweating or vomiting, fainting, or severe shortness of breath',
    fu: '2/52', fuFor: 'review of results and symptom progress',
  });

  visit({
    id: 'headache', label: 'Headache', ar: 'صداع',
    tags: ['headache', 'صداع', 'migraine', 'شقيقة'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('pattern', 'Onset and pattern', 'select', { required: true, allowCustom: true,
        options: ['Gradual onset, recurrent', 'Sudden onset, peaked within a minute', 'New daily persistent', 'Progressive over weeks'],
        redFlags: ['Sudden onset, peaked within a minute', 'Progressive over weeks'],
        example: 'Gradual onset, recurrent',
        why: 'Thunderclap onset is subarachnoid haemorrhage until proven otherwise.' }),
      F('features', 'Features', 'multiselect', { required: true, allowCustom: true,
        options: ['Unilateral', 'Pulsating', 'Moderate to severe', 'Worse with activity',
                  'Nausea or vomiting', 'Photophobia and phonophobia', 'Aura'],
        example: 'Unilateral, pulsating, nausea, photophobia',
        why: 'Migraine is a positive diagnosis from these criteria, not a diagnosis of exclusion.' }),
      F('analgesic_days', 'Analgesic use — days per month', 'select', { required: true,
        options: ['< 5 days', '5-9 days', '10-14 days', '15 days or more'],
        redFlags: ['10-14 days', '15 days or more'],
        example: '< 5 days',
        why: 'Analgesic use above 10 days a month causes medication-overuse headache — the treatment is withdrawal, not escalation.' }),
      redFlagField(
        ['Fever with neck stiffness', 'Focal neurological deficit', 'Seizure', 'Altered consciousness',
         'New headache after age 50', 'Worse on coughing or lying flat', 'Immunosuppression or cancer history',
         'Visual loss or jaw claudication'],
        ['Fever with neck stiffness', 'Focal neurological deficit', 'Seizure', 'Altered consciousness',
         'New headache after age 50', 'Worse on coughing or lying flat', 'Immunosuppression or cancer history',
         'Visual loss or jaw claudication'],
        'SNOOP. Any positive means imaging or referral, not a prescription.'),
    ],
    exam: [
      F('neuro_exam', 'Neurological examination', 'multiselect', { required: true, allowCustom: true,
        options: ['Alert and oriented', 'Cranial nerves intact', 'No focal motor or sensory deficit',
                  'Fundoscopy: no papilloedema', 'Neck supple', 'Temporal arteries non-tender'],
        example: 'Alert and oriented, cranial nerves intact, no focal deficit, fundoscopy no papilloedema',
        why: 'Fundoscopy is the examination interns skip and consultants ask about.' }),
    ],
    er: 'in case of sudden severe headache, fever with neck stiffness, weakness, confusion, or visual loss',
    fu: '4/52', fuFor: 'headache diary review',
  });

  visit({
    id: 'back-pain', label: 'Low back pain', ar: 'ألم أسفل الظهر',
    tags: ['back pain', 'ظهر', 'sciatica', 'عرق النسا'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('duration', 'Duration', 'select', { required: true, allowCustom: true,
        options: ['< 6 weeks (acute)', '6-12 weeks (subacute)', '> 12 weeks (chronic)'], example: '< 6 weeks (acute)',
        why: 'Under six weeks with no red flags means no imaging — early imaging worsens outcomes.' }),
      F('radiation', 'Radiation', 'select', { required: true,
        options: ['No radiation', 'Radiates to buttock only', 'Radiates below the knee in a dermatomal pattern'],
        example: 'No radiation',
        why: 'Below the knee in a dermatomal pattern is radicular; above it usually is not.' }),
      redFlagField(
        ['Bladder or bowel incontinence', 'Saddle anaesthesia', 'Bilateral leg weakness', 'Progressive motor weakness',
         'Fever', 'History of cancer', 'Unexplained weight loss', 'Significant trauma', 'IV drug use', 'Chronic steroid use'],
        ['Bladder or bowel incontinence', 'Saddle anaesthesia', 'Bilateral leg weakness', 'Progressive motor weakness',
         'Fever', 'History of cancer', 'Unexplained weight loss', 'Significant trauma', 'IV drug use', 'Chronic steroid use'],
        'Cauda equina and spinal infection are the two you cannot afford to miss here.'),
    ],
    exam: [
      F('msk_exam', 'Examination', 'multiselect', { required: true, allowCustom: true,
        options: ['Normal gait', 'Paraspinal tenderness', 'No midline bony tenderness',
                  'Straight leg raise negative bilaterally', 'Straight leg raise positive',
                  'Power 5/5 both lower limbs', 'Sensation intact', 'Reflexes symmetrical'],
        redFlags: ['Straight leg raise positive'],
        example: 'Normal gait, paraspinal tenderness, SLR negative bilaterally, power 5/5, reflexes symmetrical',
        why: 'Documenting a normal neurological exam is what protects you if the patient deteriorates later.' }),
    ],
    er: 'in case of difficulty passing urine, loss of bladder or bowel control, numbness around the back passage, or progressive leg weakness',
    fu: '4/52', fuFor: 'reassessment if not improving',
  });

  visit({
    id: 'dizziness', label: 'Dizziness / vertigo', ar: 'دوخة ودوار',
    tags: ['dizziness', 'دوخة', 'vertigo', 'دوار'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('type', 'What does the patient actually mean?', 'select', { required: true,
        options: ['Spinning sensation (vertigo)', 'Light-headed / about to faint (presyncope)',
                  'Unsteady on feet (disequilibrium)', 'Vague or hard to characterise'],
        example: 'Spinning sensation (vertigo)',
        why: 'This single question splits the differential into four separate diseases. Ask it before anything else.' }),
      F('duration_episode', 'Duration of each episode', 'select', { required: true,
        options: ['Seconds', 'Minutes to an hour', 'Hours', 'Days, continuous'],
        example: 'Seconds',
        why: 'Seconds with head movement is BPPV; hours with hearing loss is Meniere; days continuous is vestibular neuritis or a stroke.' }),
      redFlagField(
        ['New headache', 'Diplopia', 'Dysarthria', 'Limb ataxia or incoordination', 'New unilateral hearing loss',
         'Focal weakness or numbness', 'Vertical or direction-changing nystagmus'],
        ['New headache', 'Diplopia', 'Dysarthria', 'Limb ataxia or incoordination', 'New unilateral hearing loss',
         'Focal weakness or numbness', 'Vertical or direction-changing nystagmus'],
        'These are the central features that separate posterior circulation stroke from peripheral vertigo.'),
      F('med_review', 'Medications that could cause this', 'multiselect', { required: true, allowCustom: true,
        options: ['Antihypertensives', 'Diuretics', 'Alpha blockers', 'Sedatives or hypnotics',
                  'Antidepressants', 'Anticholinergics', NONE],
        example: 'Antihypertensives, diuretics',
        why: 'In older adults the commonest reversible cause of dizziness is the prescription, not the ear.' }),
    ],
    exam: [
      F('vestibular_exam', 'Examination', 'multiselect', { required: true, allowCustom: true,
        options: ['Postural BP recorded (see vitals)', 'Dix-Hallpike positive', 'Dix-Hallpike negative',
                  'No nystagmus at rest', 'Gait steady', 'Romberg negative', 'Cranial nerves intact'],
        example: 'Dix-Hallpike positive right, gait steady, cranial nerves intact',
        why: 'Postural BP and Dix-Hallpike are the two bedside tests that actually change management here.' }),
      F('postural_bp', 'Postural BP (lying → standing)', 'text', { required: true,
        example: '138/82 lying, 120/76 standing',
        why: 'A drop of 20 systolic or 10 diastolic confirms orthostatic hypotension and redirects the whole workup.' }),
    ],
    er: 'in case of sudden severe headache, double vision, slurred speech, weakness on one side, or inability to walk',
    fu: '2/52', fuFor: 'symptom review',
  });

  visit({
    id: 'fatigue', label: 'Fatigue / tiredness', ar: 'تعب وإرهاق',
    tags: ['fatigue', 'tired', 'تعب', 'إرهاق'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('duration', 'Duration', 'select', { required: true, allowCustom: true,
        options: ['< 1 month', '1-6 months', '> 6 months'], example: '3 months',
        why: 'Over six months moves this towards a chronic fatigue framework rather than an acute workup.' }),
      F('associated', 'Associated features', 'multiselect', { required: true, allowCustom: true,
        options: ['Poor sleep', 'Snoring or witnessed apnoea', 'Low mood or anhedonia', 'Cold intolerance',
                  'Heavy menstrual bleeding', 'Weight gain', 'Weight loss', 'Joint pain', NONE],
        example: 'Poor sleep, low mood',
        why: 'Depression, sleep apnoea, anaemia and thyroid disease account for most fatigue that has a cause.' }),
      redFlagField(
        ['Unintentional weight loss', 'Night sweats', 'Fever', 'Lymphadenopathy', 'Bleeding', 'New breathlessness'],
        ['Unintentional weight loss', 'Night sweats', 'Fever', 'Lymphadenopathy', 'Bleeding', 'New breathlessness'],
        'Fatigue plus any of these needs a malignancy and infection workup, not reassurance.'),
    ],
    exam: [
      F('focused_exam', 'Examination', 'multiselect', { required: true, allowCustom: true,
        options: ['No pallor', 'Pallor present', 'No lymphadenopathy', 'Thyroid not enlarged',
                  'Chest clear', 'No organomegaly'],
        example: 'No pallor, no lymphadenopathy, thyroid not enlarged',
        why: 'Negative findings here are what justify a limited lab panel rather than a broad one.' }),
    ],
    er: 'in case of fainting, chest pain, severe shortness of breath, or bleeding',
    fu: '4/52', fuFor: 'lab results review',
  });

  visit({
    id: 'sore-throat', label: 'Sore throat / URTI', ar: 'التهاب حلق ونزلة برد',
    tags: ['sore throat', 'حلق', 'urti', 'برد', 'tonsillitis'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('duration', 'Duration', 'select', { required: true, allowCustom: true,
        options: ['< 3 days', '3-7 days', '> 7 days', '> 10 days with no improvement'],
        redFlags: ['> 10 days with no improvement'],
        example: '3 days',
        why: 'Beyond ten days without improvement, a bacterial sinusitis pathway opens.' }),
      F('centor', 'Centor / McIsaac criteria present', 'multiselect', { required: true,
        options: ['Fever > 38', 'Absence of cough', 'Tender anterior cervical nodes', 'Tonsillar exudate or swelling', NONE],
        example: 'Absence of cough, tonsillar exudate',
        why: 'The score decides whether a swab or an antibiotic is justified at all — most sore throats need neither.' }),
      redFlagField(
        ['Difficulty swallowing saliva', 'Muffled voice', 'Trismus', 'Uvular deviation', 'Neck stiffness',
         'Stridor or difficulty breathing', 'Unilateral severe swelling'],
        ['Difficulty swallowing saliva', 'Muffled voice', 'Trismus', 'Uvular deviation', 'Neck stiffness',
         'Stridor or difficulty breathing', 'Unilateral severe swelling'],
        'Peritonsillar abscess and epiglottitis present exactly here and need same-day ENT.'),
    ],
    exam: [
      F('ent_exam', 'ENT examination', 'multiselect', { required: true, allowCustom: true,
        options: ['Throat: injected, no exudate', 'Throat: exudate present', 'Tonsils symmetrical',
                  'No cervical lymphadenopathy', 'Tender anterior cervical nodes', 'Ears: TM normal both sides',
                  'Chest clear'],
        example: 'Throat injected with exudate, tender anterior cervical nodes, tonsils symmetrical',
        why: 'Asymmetry is the finding that changes the plan — record it either way.' }),
    ],
    er: 'in case of difficulty swallowing saliva, difficulty breathing, drooling, or neck stiffness with fever',
    fu: '1/52', fuFor: 'review if not improving',
  });

  visit({
    id: 'dysuria', label: 'Urinary symptoms', ar: 'أعراض بولية',
    tags: ['dysuria', 'uti', 'بول', 'حرقان', 'urinary'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('symptoms', 'Urinary symptoms present', 'multiselect', { required: true, allowCustom: true,
        options: ['Dysuria', 'New or worsening frequency', 'New or worsening urgency', 'Suprapubic pain',
                  'Visible haematuria', 'Cloudy or malodorous urine only', 'Incontinence, new'],
        redFlags: ['Visible haematuria'],
        example: 'Dysuria, new frequency, suprapubic pain',
        why: 'Cloudy or smelly urine alone is not an infection. A specific urinary symptom is required before treating.' }),
      redFlagField(
        ['Fever or rigors', 'Flank pain', 'Vomiting', 'Confusion, new', 'Pregnancy', 'Male patient', 'Recurrent episodes'],
        ['Fever or rigors', 'Flank pain', 'Vomiting', 'Confusion, new', 'Pregnancy'],
        'Fever and flank pain make this pyelonephritis, not cystitis — different antibiotic, different duration.'),
      F('prior_abx', 'Antibiotic in the last 3 months', 'select', { required: true,
        options: ['No', 'Yes'], example: 'No',
        why: 'Recent antibiotic exposure predicts resistance and changes the empirical choice.' }),
    ],
    exam: [
      F('abdo_exam', 'Examination', 'multiselect', { required: true, allowCustom: true,
        options: ['Abdomen soft, non-tender', 'Suprapubic tenderness', 'No renal angle tenderness',
                  'Renal angle tenderness present'],
        redFlags: ['Renal angle tenderness present'],
        example: 'Abdomen soft, suprapubic tenderness, no renal angle tenderness',
        why: 'Renal angle tenderness is the single finding that changes cystitis into pyelonephritis.' }),
      F('urine_dip', 'Urine dipstick', 'text', { required: true,
        example: 'Leucocytes ++, nitrites +, blood trace, protein negative',
        why: 'Record it even when negative — a negative dip in a symptomatic patient still needs a culture.' }),
    ],
    er: 'in case of fever with rigors, flank pain, vomiting, or inability to pass urine',
    fu: '1/52', fuFor: 'culture result review',
  });

  visit({
    id: 'abdo-pain', label: 'Abdominal pain', ar: 'ألم بطن',
    tags: ['abdominal', 'بطن', 'ألم بطن', 'stomach'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('site', 'Site', 'select', { required: true, allowCustom: true,
        options: ['Epigastric', 'Right upper quadrant', 'Left upper quadrant', 'Periumbilical',
                  'Right lower quadrant', 'Left lower quadrant', 'Suprapubic', 'Generalised'],
        example: 'Epigastric',
        why: 'Site plus timing narrows this faster than any investigation.' }),
      F('relation_food', 'Relation to food and bowels', 'multiselect', { required: true, allowCustom: true,
        options: ['Worse after meals', 'Relieved by food', 'Relieved by defaecation', 'Worse at night',
                  'Associated with change in bowel habit', 'No clear relation'],
        example: 'Worse after meals',
        why: 'These associations separate biliary, peptic and functional causes without a scan.' }),
      redFlagField(
        ['Rigid abdomen or rebound tenderness', 'Haematemesis or melaena', 'Bilious vomiting', 'Jaundice with fever',
         'Unintentional weight loss', 'Dysphagia', 'Age > 50 with new symptoms', 'Missed period in a woman of reproductive age'],
        ['Rigid abdomen or rebound tenderness', 'Haematemesis or melaena', 'Bilious vomiting', 'Jaundice with fever',
         'Unintentional weight loss', 'Dysphagia', 'Missed period in a woman of reproductive age'],
        'Ectopic pregnancy and perforation are the two time-critical misses in this presentation.'),
    ],
    exam: [
      F('abdo_exam', 'Abdominal examination', 'multiselect', { required: true, allowCustom: true,
        options: ['Soft, non-tender', 'Localised tenderness', 'No guarding or rebound', 'Guarding present',
                  'No organomegaly', 'Bowel sounds normal', 'Murphy sign negative'],
        redFlags: ['Guarding present'],
        example: 'Soft, epigastric tenderness, no guarding or rebound, bowel sounds normal',
        why: 'Guarding and rebound are the findings that make this a surgical referral today.' }),
    ],
    er: 'in case of severe worsening pain, vomiting blood, black stools, fever with jaundice, or a rigid painful abdomen',
    fu: '2/52', fuFor: 'results and symptom review',
  });

  visit({
    id: 'joint-pain', label: 'Joint pain', ar: 'ألم مفاصل',
    tags: ['joint', 'مفاصل', 'arthritis', 'knee', 'ركبة'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('pattern', 'Pattern', 'select', { required: true,
        options: ['Single joint', 'Few joints (2-4), asymmetrical', 'Many joints, symmetrical'],
        example: 'Single joint',
        why: 'Monoarthritis is septic or crystal until proven otherwise; symmetrical polyarthritis is inflammatory.' }),
      F('inflammatory', 'Inflammatory features', 'multiselect', { required: true, allowCustom: true,
        options: ['Morning stiffness > 30 minutes', 'Morning stiffness < 30 minutes', 'Improves with activity',
                  'Worse with activity', 'Joint swelling', 'Joint redness and heat'],
        redFlags: ['Joint redness and heat'],
        example: 'Morning stiffness < 30 minutes, worse with activity',
        why: 'Prolonged morning stiffness that improves with use is inflammatory; the opposite pattern is mechanical.' }),
      redFlagField(
        ['Fever', 'Single hot swollen joint', 'Recent joint injection or surgery', 'Immunosuppression',
         'Inability to weight bear', 'Rash or mouth ulcers'],
        ['Fever', 'Single hot swollen joint', 'Recent joint injection or surgery', 'Immunosuppression', 'Inability to weight bear'],
        'A hot swollen joint with fever is septic arthritis and needs aspiration today, not an NSAID.'),
    ],
    exam: [
      F('joint_exam', 'Joint examination', 'multiselect', { required: true, allowCustom: true,
        options: ['No effusion', 'Effusion present', 'No erythema or warmth', 'Erythema and warmth present',
                  'Full range of movement', 'Restricted range of movement', 'No deformity'],
        redFlags: ['Erythema and warmth present'],
        example: 'No effusion, no erythema or warmth, mildly restricted range of movement',
        why: 'Warmth and erythema are what force an aspiration decision.' }),
    ],
    er: 'in case of fever with a hot swollen joint, inability to move the joint, or inability to bear weight',
    fu: '4/52', fuFor: 'response to treatment',
  });

  visit({
    id: 'dyspnea', label: 'Shortness of breath / cough', ar: 'ضيق نفس وسعال',
    tags: ['dyspnea', 'sob', 'ضيق نفس', 'cough', 'سعال', 'asthma', 'copd'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('duration', 'Duration', 'select', { required: true, allowCustom: true,
        options: ['< 1 week', '1-3 weeks', '3-8 weeks', '> 8 weeks'],
        redFlags: ['> 8 weeks'],
        example: '2 weeks',
        why: 'Cough beyond eight weeks is chronic and needs a chest x-ray and a different differential.' }),
      F('features', 'Associated features', 'multiselect', { required: true, allowCustom: true,
        options: ['Wheeze', 'Sputum production', 'Fever', 'Orthopnoea', 'Paroxysmal nocturnal dyspnoea',
                  'Leg swelling', 'Exertional limitation', NONE],
        redFlags: ['Orthopnoea', 'Paroxysmal nocturnal dyspnoea'],
        example: 'Wheeze, exertional limitation',
        why: 'Orthopnoea and PND point at the heart, not the lungs — and change every next step.' }),
      redFlagField(
        ['Haemoptysis', 'Unintentional weight loss', 'SOB at rest', 'Chest pain', 'Unilateral leg swelling',
         'Unable to complete a sentence', 'Cyanosis'],
        ['Haemoptysis', 'Unintentional weight loss', 'SOB at rest', 'Chest pain', 'Unilateral leg swelling',
         'Unable to complete a sentence', 'Cyanosis'],
        'Malignancy, PE and impending respiratory failure all hide in this presentation.'),
    ],
    exam: [
      F('resp_exam', 'Respiratory examination', 'multiselect', { required: true, allowCustom: true,
        options: ['Chest clear, equal air entry', 'Expiratory wheeze', 'Crackles', 'Reduced air entry one side',
                  'No accessory muscle use', 'Accessory muscle use present', 'No leg oedema'],
        redFlags: ['Accessory muscle use present', 'Reduced air entry one side'],
        example: 'Expiratory wheeze bilaterally, no accessory muscle use, equal air entry',
        why: 'SpO2 with a normal-sounding chest still needs the work of breathing documented.' }),
    ],
    er: 'in case of severe shortness of breath, inability to complete a sentence, blue lips, chest pain, or coughing blood',
    fu: '2/52', fuFor: 'symptom and spirometry review',
  });

  visit({
    id: 'geriatric', label: 'Comprehensive elderly visit', ar: 'زيارة شاملة لكبير السن', geri: true,
    tags: ['elderly', 'geriatric', 'كبار السن', 'cga', 'شامل'],
    reason: 'routine', purpose: 'for lab results',
    subjective: [
      F('frailty', 'Clinical Frailty Scale', 'select', { required: true,
        options: ['1 - Very fit', '2 - Fit', '3 - Managing well', '4 - Living with very mild frailty',
                  '5 - Mild frailty', '6 - Moderate frailty', '7 - Severe frailty', '8 - Very severe frailty', '9 - Terminally ill'],
        redFlags: ['7 - Severe frailty', '8 - Very severe frailty', '9 - Terminally ill'],
        example: '5 - Mild frailty',
        why: 'The frailty score sets the BP and HbA1c targets, decides which drugs still earn their place, and opens the goals-of-care conversation.' }),
      F('polypharmacy', 'Number of regular medications', 'select', { required: true,
        options: ['1-4', '5-9', '10 or more'],
        redFlags: ['5-9', '10 or more'],
        example: '5-9',
        why: 'Five or more warrants a dedicated medication review — not one squeezed into a busy visit.' }),
      F('med_review_done', 'Medication review', 'select', { required: true,
        when: oneOf('polypharmacy', ['5-9', '10 or more']),
        options: ['Full review done today', 'Booked a dedicated review appointment', 'Not yet reviewed'],
        redFlags: ['Not yet reviewed'],
        example: 'Booked a dedicated review appointment',
        why: 'Five or more medications needs its own appointment. Squeezing it into a busy visit is how it never happens.' }),
      F('geriatric_screen', 'Screening domains covered today', 'multiselect', { required: true, allowCustom: true,
        options: ['Falls in the last year asked', 'Cognition screened', 'Mood screened', 'Continence asked',
                  'Nutrition / weight trend reviewed', 'Vision and hearing asked', 'Function (ADL/IADL) asked',
                  'Social support asked', 'Advance care planning discussed'],
        example: 'Falls asked, cognition screened, nutrition reviewed, function asked',
        why: 'Screen briefly across all domains, then book a longer visit for whatever comes back positive.' }),
      F('functional_change', 'Any recent functional decline?', 'select', { required: true,
        options: ['No change', 'Gradual decline over months', 'Sudden decline over days to weeks'],
        redFlags: ['Sudden decline over days to weeks'],
        example: 'No change',
        why: 'Sudden functional decline is an acute illness — delirium, infection or a drug effect — never "old age".' }),
      redFlagField(
        ['New confusion', 'Recent fall with injury', 'Unintentional weight loss', 'New incontinence',
         'Pressure area or skin breakdown', 'Carer reports they cannot cope'],
        ['New confusion', 'Recent fall with injury', 'Unintentional weight loss', 'New incontinence',
         'Pressure area or skin breakdown', 'Carer reports they cannot cope'],
        'Each of these predicts admission or institutionalisation within months if not acted on now.'),
    ],
    exam: [
      F('geri_exam', 'Examination', 'multiselect', { required: true, allowCustom: true,
        options: ['Postural BP recorded', 'Timed Up and Go performed', 'Gait steady', 'Gait unsteady',
                  'Skin intact over pressure areas', 'No peripheral oedema', 'Cognition: Mini-Cog performed'],
        example: 'Postural BP recorded, Timed Up and Go 11 seconds, gait steady, skin intact',
        why: 'Postural BP and a timed walk take ninety seconds and change management more often than any blood test.' }),
      F('postural_bp', 'Postural BP (lying → standing)', 'text', { required: true,
        example: '142/80 lying, 128/76 standing',
        why: 'Measure standing BP at every visit over 65 — it decides whether to intensify or deprescribe.' }),
    ],
    er: 'in case of a fall with injury, new confusion, chest pain, or inability to pass urine',
    fu: '3/12', fuFor: 'medication review and results',
  });

  visit({
    id: 'falls', label: 'Falls assessment', ar: 'تقييم السقوط', geri: true,
    tags: ['falls', 'سقوط', 'balance', 'توازن'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('fall_count', 'Number of falls in the last 12 months', 'select', { required: true,
        options: ['1', '2', '3 or more'],
        redFlags: ['2', '3 or more'],
        example: '2',
        why: 'Two or more falls, or any fall with injury, mandates a full multifactorial assessment.' }),
      F('loc', 'Was there any loss of consciousness?', 'select', { required: true,
        options: ['No', 'Yes', 'Uncertain'],
        redFlags: ['Yes', 'Uncertain'],
        example: 'No',
        why: 'Loss of consciousness makes this syncope, not a fall — cardiac workup, not a physiotherapy referral.' }),
      F('syncope_workup', 'Syncope workup done today', 'multiselect', { required: true, allowCustom: true,
        when: oneOf('loc', ['Yes', 'Uncertain']),
        options: ['ECG done', 'Postural BP done', 'Cardiac murmur excluded', 'Referred to cardiology', 'None yet'],
        redFlags: ['None yet'],
        example: 'ECG done, postural BP done',
        why: 'With loss of consciousness this is syncope, not a fall — it needs a cardiac workup, not physiotherapy.' }),
      F('circumstances', 'Circumstances', 'multiselect', { required: true, allowCustom: true,
        options: ['Tripped over an object', 'On standing up', 'While walking outdoors', 'At night going to the bathroom',
                  'On stairs', 'No clear trigger'],
        redFlags: ['On standing up', 'No clear trigger'],
        example: 'At night going to the bathroom',
        why: 'The circumstances name the intervention — night falls need lighting and nocturia review, not just exercise.' }),
      F('culprit_meds', 'Culprit medications', 'multiselect', { required: true, allowCustom: true,
        options: ['Benzodiazepine or hypnotic', 'Antidepressant', 'Antipsychotic', 'Antihypertensive', 'Diuretic',
                  'Alpha blocker', 'Anticholinergic', 'Opioid', NONE],
        redFlags: ['Benzodiazepine or hypnotic', 'Antipsychotic', 'Alpha blocker', 'Anticholinergic'],
        example: 'Antihypertensive, diuretic',
        why: 'Stopping one culprit drug outperforms any exercise programme. This is the highest-yield line in the note.' }),
      redFlagField(
        ['Head injury while on anticoagulant', 'Fracture suspected', 'Long lie on the floor', 'New focal neurology'],
        ['Head injury while on anticoagulant', 'Fracture suspected', 'Long lie on the floor', 'New focal neurology'],
        'Anticoagulated head injury needs imaging regardless of how well the patient looks.'),
    ],
    exam: [
      F('falls_exam', 'Examination', 'multiselect', { required: true, allowCustom: true,
        options: ['Timed Up and Go performed', 'Gait steady', 'Gait unsteady', 'Able to rise from chair without arms',
                  'Unable to rise from chair without arms', 'Vision grossly normal', 'Feet and footwear inspected',
                  'Cardiac exam: regular rhythm, no murmur'],
        redFlags: ['Gait unsteady', 'Unable to rise from chair without arms'],
        example: 'Timed Up and Go 15 seconds, gait unsteady, unable to rise from chair without arms',
        why: 'Timed Up and Go over 12 seconds is an objective, repeatable marker you can track across visits.' }),
      F('postural_bp', 'Postural BP (lying → standing)', 'text', { required: true,
        example: '150/84 lying, 124/78 standing',
        why: 'Orthostatic hypotension is present in a large share of fallers and is usually drug-induced and reversible.' }),
    ],
    er: 'in case of a fall with head injury, severe pain or inability to bear weight after a fall, or new confusion',
    fu: '6/52', fuFor: 'reassessment after medication review and physiotherapy',
  });

  visit({
    id: 'memory', label: 'Memory concern', ar: 'شكوى ضعف ذاكرة', geri: true,
    tags: ['memory', 'ذاكرة', 'dementia', 'خرف', 'cognition'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('informant', 'Is the history corroborated by an informant?', 'select', { required: true,
        options: ['Yes, family member present', 'Yes, by phone', 'No informant available'],
        redFlags: ['No informant available'],
        example: 'Yes, family member present',
        why: 'The informant history is more accurate than the patient history and more accurate than any bedside test.' }),
      F('onset', 'Onset and course', 'select', { required: true,
        options: ['Gradual over years', 'Stepwise deterioration', 'Sudden over days to weeks', 'Fluctuating day to day'],
        redFlags: ['Sudden over days to weeks', 'Fluctuating day to day'],
        example: 'Gradual over years',
        why: 'Sudden or fluctuating means delirium until proven otherwise — do not diagnose dementia during an acute illness.' }),
      F('functional_impact', 'Functional impact', 'multiselect', { required: true, allowCustom: true,
        options: ['Difficulty managing medications', 'Difficulty managing money', 'Difficulty shopping or cooking',
                  'Got lost in a familiar place', 'Stopped driving', 'Still driving', 'No functional impact yet'],
        redFlags: ['Got lost in a familiar place', 'Still driving'],
        example: 'Difficulty managing medications and money',
        why: 'The diagnosis requires functional decline, not just a low test score. And driving must be addressed explicitly.' }),
      F('reversible_screen', 'Reversible causes considered', 'multiselect', { required: true, allowCustom: true,
        options: ['B12 checked', 'TSH checked', 'Calcium checked', 'Depression screened', 'Medication review done',
                  'Hearing and vision checked', 'None yet'],
        example: 'B12 checked, TSH checked, depression screened, medication review done',
        why: 'Depression, drugs, B12, thyroid and sensory loss all mimic dementia and all are treatable.' }),
      redFlagField(
        ['Visual hallucinations', 'Parkinsonism', 'Gait disturbance preceding memory loss', 'Urinary incontinence with gait change',
         'Focal neurological signs', 'Recent head injury', 'Age under 65 at onset'],
        ['Visual hallucinations', 'Parkinsonism', 'Gait disturbance preceding memory loss', 'Urinary incontinence with gait change',
         'Focal neurological signs', 'Recent head injury', 'Age under 65 at onset'],
        'These point away from Alzheimer disease — Lewy body, NPH and subdural all change management completely.'),
    ],
    exam: [
      F('cognitive_exam', 'Cognitive testing and examination', 'multiselect', { required: true, allowCustom: true,
        options: ['Mini-Cog performed', '4AT performed', 'No focal neurological deficit', 'Gait normal',
                  'Gait apraxic or shuffling', 'No tremor or rigidity', 'Tremor or rigidity present'],
        example: 'Mini-Cog performed (score 2/5), no focal deficit, gait normal',
        why: 'Record the actual score, not "cognitive testing done" (A2).' }),
    ],
    er: 'in case of sudden confusion, fever, new weakness, or a fall with head injury',
    fu: '6/52', fuFor: 'review of blood results and cognitive reassessment',
  });

  visit({
    id: 'other', label: 'Other complaint (generic)', ar: 'شكوى أخرى',
    tags: ['generic', 'other', 'أخرى'],
    reason: 'follow up', purpose: 'new complaint',
    subjective: [
      F('hpi_detail', 'History of presenting complaint', 'textarea', { required: true,
        example: 'Right shoulder pain for 6 weeks, gradual onset, worse on overhead reaching, no trauma, no night pain',
        why: 'Site, onset, character, timing, aggravating and relieving factors, and the relevant negatives.' }),
      F('specific_negatives', 'Relevant negatives for this problem', 'textarea', { required: true,
        example: 'No fever, no weight loss, no night pain, no neurological symptoms',
        why: 'The negatives you chose to ask about are what show your differential. This is the part interns leave out (A4).' }),
      redFlagField(
        ['Fever', 'Unintentional weight loss', 'Night pain', 'Neurological deficit', 'Bleeding', 'Severe or worsening pain'],
        ['Fever', 'Unintentional weight loss', 'Night pain', 'Neurological deficit', 'Bleeding', 'Severe or worsening pain'],
        'A generic red-flag screen still beats no screen at all.'),
    ],
    exam: [
      F('focused_exam', 'Focused examination', 'textarea', { required: true,
        example: 'Right shoulder: full passive range, painful arc 70-120 degrees, empty can test positive, no wasting',
        why: 'Name the tests you did and their result — "examination normal" documents nothing.' }),
    ],
    er: 'in case of severe worsening symptoms, fever, or any new neurological symptoms',
    fu: '4/52', fuFor: 'reassessment',
  });

  /* assemble the full section list for a visit */
  function sectionsFor(v) {
    return [
      { id: 'header', title: 'Patient & problem list', ar: 'المريض وقائمة المشاكل', fields: HEADER },
      { id: 'subjective', title: 'Subjective (History)', ar: 'التاريخ المرضي',
        fields: (v.subjective || []).concat(SUBJ_TAIL) },
      { id: 'objective', title: 'Objective', ar: 'الفحص',
        fields: VITALS.concat([GENERAL_EXAM]).concat(v.exam || []).concat([LABS]) },
      { id: 'assessment', title: 'Assessment — your reasoning', ar: 'التقييم', fields: ASSESSMENT },
      { id: 'plan', title: 'Plan', ar: 'الخطة', fields: PLAN },
    ];
  }

  window.NOTE_VISITS = V;
  window.noteSectionsFor = sectionsFor;
  window.noteFieldVisible = isVisible;
  /* sections with only the fields currently applicable to `data` */
  window.noteVisibleSectionsFor = (v, data) => sectionsFor(v)
    .map(s => Object.assign({}, s, { fields: s.fields.filter(f => isVisible(f, data)) }))
    .filter(s => s.fields.length);
})();
