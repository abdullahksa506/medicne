/* Reference tools: immunisation, screening, red flags, antibiotics,
   renal dosing, documentation templates, and consultation structure. */

window.TOOLS = [

{
  id: 'vaccines', title: 'Adult Immunisation', sub: 'What is given, when, and what blocks it',
  tags: ['vaccine', 'immunisation', 'influenza', 'tdap', 'shingles'],
  blocks: [
    { note: 'A quick reference only. <b>Always check the current approved national schedule before giving any vaccine</b> — schedules are revised periodically.', kind: 'warn' },
    { h: 'Routine adult vaccines' },
    { ul: [
      '<b>Influenza:</b> annually for everyone, and particularly in pregnancy, older adults, chronic disease and healthcare workers.',
      '<b>Pneumococcal:</b> from age 65, and earlier with chronic disease, immunosuppression or asplenia.',
      '<b>Tdap:</b> one adult dose then Td every 10 years — and one dose in <b>every pregnancy</b> between 27 and 36 weeks.',
      '<b>Herpes zoster (Shingrix):</b> from age 50, two doses 2 to 6 months apart.',
      '<b>Hepatitis B:</b> for unvaccinated healthcare workers, dialysis patients, people with diabetes, and household contacts.',
      '<b>MMR:</b> for non-immune adults — <b>contraindicated in pregnancy</b> (live vaccine); avoid conception for one month afterwards.',
      '<b>HPV:</b> per the national schedule for eligible ages.',
    ]},
    { h: 'Contraindications and cautions' },
    { ul: [
      'Mild illness, with or without a low-grade fever, is <b>not</b> a reason to defer.',
      'The only true contraindication for most vaccines is a previous severe allergic reaction (anaphylaxis) to that vaccine or one of its components.',
      'Live vaccines (MMR, varicella, BCG, oral polio) are contraindicated in pregnancy, severe immunosuppression, and on high-dose corticosteroids.',
      'More than one vaccine can be given at the same visit in different limbs.',
      'A delayed schedule is resumed, never restarted from the beginning.',
    ]},
  ],
},

{
  id: 'screening', title: 'Preventive Screening', sub: 'What to check and at what age',
  tags: ['screening', 'prevention', 'cancer', 'checkup'],
  blocks: [
    { h: 'All adults' },
    { table: { head: ['Test', 'From age', 'Interval'], rows: [
      ['Blood pressure', '18', 'Every visit or annually'],
      ['Weight and BMI', '18', 'Annually'],
      ['Lipid profile', '20 – 40', 'Every 4 – 6 years, more often with risk factors'],
      ['Diabetes (HbA1c or fasting glucose)', '35', 'Every 3 years — earlier with obesity or family history'],
      ['Smoking status', '18', 'Every visit, with an offer of cessation support'],
      ['Depression', '18', 'Annually (PHQ-2 then PHQ-9)'],
    ]}},
    { h: 'Cancer screening' },
    { table: { head: ['Cancer', 'Population', 'Test'], rows: [
      ['Breast', 'Women 40 – 74', 'Mammogram every 1 – 2 years'],
      ['Cervix', 'Women 21 – 65', 'Cytology every 3 years, or co-testing with HPV every 5 years from age 30'],
      ['Colorectal', '45 – 75', 'Faecal occult blood annually, or colonoscopy every 10 years'],
      ['Lung', '50 – 80 with heavy smoking', 'Low-dose CT annually'],
      ['Prostate', 'Men 55 – 69', 'PSA after a shared decision-making discussion'],
    ]}},
    { h: 'Condition-specific' },
    { ul: [
      'Osteoporosis: DEXA for women from 65, earlier with risk factors (chronic steroids, prior fracture, early menopause).',
      'Abdominal aortic aneurysm: one-off ultrasound for men 65 – 75 who have ever smoked.',
      'Anaemia: in pregnancy and in women with heavy menstrual bleeding.',
      'Premarital screening: haemoglobin electrophoresis and infectious disease testing.',
      'Vitamin D and B12: when clinically indicated, not as universal screening.',
    ]},
    { note: 'The most valuable screening in any visit is the conversation: smoking, physical activity, diet, sleep, psychological stress, and medication adherence.', kind: 'ok' },
  ],
},

{
  id: 'redflags', title: 'Red Flags', sub: 'What must not be missed, by presentation',
  tags: ['red flag', 'emergency', 'referral', 'danger'],
  blocks: [
    { note: 'A rapid triage list. Any one of these means urgent assessment or immediate referral — not a later appointment.', kind: 'danger' },
    { h: 'Headache' },
    { ul: ['Thunderclap onset peaking within a minute.', 'Fever with neck stiffness.', 'Focal neurological signs, altered consciousness or seizure.', 'New onset after age 50.', 'Worse on coughing or lying flat, or waking the patient from sleep.', 'Immunosuppression or a cancer history.'] },
    { h: 'Abdominal pain' },
    { ul: ['Rigid abdomen with rebound tenderness.', 'Sudden severe pain with pallor and hypotension.', 'Bilious or bloody vomiting, or melaena.', 'Pain with a missed period in a woman of reproductive age → ectopic pregnancy.', 'Pain with jaundice, fever and rigors → ascending cholangitis.', 'Abdominal pain in an older or cardiac patient — consider mesenteric ischaemia.'] },
    { h: 'Shortness of breath' },
    { ul: ['Saturation below 92%, or respiratory rate above 30.', 'Unable to complete a sentence.', 'Associated chest pain or unilateral leg swelling.', 'New wheeze in an older adult with no history of asthma.', 'Accessory muscle use or cyanosis.'] },
    { h: 'Dizziness and syncope' },
    { ul: ['Syncope on exertion or while lying down.', 'Palpitation preceding the syncope.', 'Family history of premature sudden cardiac death.', 'Syncope with no preceding warning symptoms.', 'Focal neurological signs, diplopia or ataxia.'] },
    { h: 'Constitutional' },
    { ul: ['Unexplained weight loss of more than 5% over 6 months.', 'Drenching night sweats with persistent fever.', 'A hard, fixed, painless enlarging mass.', 'Bleeding from any orifice without an obvious cause.'] },
  ],
},

{
  id: 'abx', title: 'Antibiotic Reference', sub: 'First-line choice and duration',
  tags: ['antibiotic', 'infection', 'dose', 'duration'],
  blocks: [
    { note: 'Ask about allergy before every prescription and record the type of reaction — a "penicillin allergy" that was diarrhoea or nausea is not an allergy.', kind: 'warn' },
    { table: { head: ['Indication', 'First line', 'Duration'], rows: [
      ['Bacterial pharyngitis', 'Amoxicillin 500 mg BD', '10 days'],
      ['Bacterial sinusitis', 'Amoxicillin-clavulanate 875/125 BD', '5 – 7 days'],
      ['Uncomplicated cystitis', 'Nitrofurantoin 100 mg BD', '5 days'],
      ['Pyelonephritis', 'Ciprofloxacin 500 mg BD', '7 days'],
      ['Community-acquired pneumonia (outpatient)', 'Amoxicillin 1 g TDS ± a macrolide', '5 – 7 days'],
      ['Cellulitis', 'Cephalexin 500 mg QDS', '5 – 7 days'],
      ['Skin abscess', 'Drainage first, ± clindamycin', '5 – 7 days'],
      ['Purulent COPD exacerbation', 'Amoxicillin-clavulanate or doxycycline', '5 days'],
    ]}},
    { h: 'Cautions that change the choice' },
    { ul: [
      '<b>Fluoroquinolones:</b> tendon rupture, peripheral neuropathy and aortic aneurysm — do not use them for simple infections that have an alternative.',
      '<b>Macrolides:</b> prolong the QT interval and interact with statins and warfarin.',
      '<b>Doxycycline:</b> contraindicated in pregnancy; take with plenty of water and stay upright afterwards.',
      '<b>Clindamycin:</b> carries the highest risk of Clostridioides difficile colitis.',
      'Most upper respiratory infections are viral — the better prescription is usually the explanation of why no antibiotic is needed.',
    ]},
  ],
},

{
  id: 'renal', title: 'Renal Dose Adjustment', sub: 'Common drugs by eGFR',
  tags: ['renal', 'kidney', 'dose', 'egfr', 'adjustment'],
  blocks: [
    { note: 'Calculate eGFR in the Calculators tab. For narrow-therapeutic-index drugs use Cockcroft-Gault rather than CKD-EPI.', kind: 'info' },
    { table: { head: ['Drug', 'Adjustment'], rows: [
      ['Metformin', 'eGFR 30 – 45: halve the dose and do not initiate · below 30: stop'],
      ['Nitrofurantoin', 'Below 30: avoid (does not reach effective concentration)'],
      ['Allopurinol', 'Below 30: start at 50 mg daily and titrate slowly'],
      ['Gabapentin', 'Below 60: reduce · below 30: reduce substantially'],
      ['SGLT2 inhibitors', 'Below 20: not usually initiated (check the renal indication)'],
      ['NSAIDs', 'Below 60: avoid where possible · below 30: contraindicated'],
      ['Rivaroxaban / apixaban', 'Adjustment required — check the product information'],
      ['Enoxaparin', 'CrCl below 30: 1 mg/kg once daily'],
      ['Aciclovir', 'Clear adjustment required — risk of neurotoxicity'],
      ['Colchicine', 'Reduce the dose and avoid with macrolides'],
    ]}},
    { h: 'Sick day rules — hold temporarily' },
    { p: 'Hold these during vomiting, diarrhoea or fever with reduced fluid intake:' },
    { ul: ['Diuretics', 'ACE inhibitors and ARBs', 'NSAIDs', 'Metformin', 'SGLT2 inhibitors'] },
  ],
},

{
  id: 'notes', title: 'Documentation Templates', sub: 'Ready notes to copy into the record',
  tags: ['documentation', 'soap', 'template', 'referral'],
  blocks: [
    { h: 'General SOAP note' },
    { copy: `S: Patient presents with ______ for ______.
Associated symptoms: ______. Negative for: fever, weight loss, night symptoms.
Chronic conditions: ______ | Medications: ______ | Allergies: ______

O: Looking well, alert and oriented.
Vitals: BP ___/___ · HR ___ · T ___ · RR ___ · SpO2 ___% · Weight ___
Examination: ______

A: ______

P:
1) ______
2) Condition and expected course explained to the patient.
3) Warning symptoms requiring immediate review were explained.
4) Follow up in ______, or sooner if symptoms worsen.` },

    { h: 'Chronic disease review' },
    { copy: `S: Routine review of ______. Medication adherence: good / partial / poor.
Symptoms: ______ | Hypoglycaemia: no / yes | Side effects: ______
Home readings: ______

O: BP ___/___ · HR ___ · Weight ___ · BMI ___
Latest labs: HbA1c ___ (dated ___) · LDL ___ · Cr ___ · eGFR ___ · ACR ___

A: ______ — controlled / uncontrolled.

P:
1) Continue / adjust: ______
2) Requested: ______
3) Preventive care due: fundus ___ · foot exam ___ · influenza vaccine ___
4) Education provided on: ______
5) Follow up in ______` },

    { h: 'Patient declining assessment or leaving against advice' },
    { copy: `The suspected condition and the risks of not completing assessment were explained to the patient, including ______.
______ was advised and was declined by the patient, who has full capacity and understanding.
Clear warning symptoms were given, with instruction to return immediately should they occur.
Willingness to reassess at any time was expressed.
Witness / accompanying person: ______` },

    { h: 'Referral letter' },
    { copy: `To: ______ clinic
Patient: ______ | Age: ___ | File: ______

Reason for referral: ______

Summary: ______ since ______.
Past history: ______ | Current medications: ______ | Allergies: ______

Examination: ______

Investigations enclosed: ______

Management so far: ______

Specific question for you: ______

With thanks,
Dr ______` },
  ],
},

{
  id: 'consult', title: 'The 10-Minute Consultation', sub: 'Structuring a short visit',
  tags: ['time', 'consultation', 'structure', 'clinic'],
  blocks: [
    { note: 'The aim is not to rush, but to order the time so the real concern does not surface in the last thirty seconds.', kind: 'info' },
    { h: 'Minutes 1 – 2 — open and do not interrupt' },
    { ul: [
      'One open question, then stay silent for a full 30 to 60 seconds.',
      'Before going deeper ask: "is there anything else you wanted to raise today?" — repeat until the answer is no.',
      'Then agree the agenda: "we have three concerns and time for two — which matters most to you?"',
    ]},
    { h: 'Minutes 3 – 5 — focus the questions' },
    { ul: [
      'Exclude red flags first, before working through the differential.',
      'Ask <b>ICE</b>: their <b>I</b>deas about the cause, their <b>C</b>oncerns, and their <b>E</b>xpectations of you.',
      'Many visits are driven by one specific fear — addressing it is faster than a test the patient does not need.',
    ]},
    { h: 'Minutes 6 – 8 — targeted examination' },
    { ul: ['Examine only what changes your decision.', 'Narrate what you are doing — it reassures and prevents later questions.'] },
    { h: 'Minutes 9 – 10 — plan and safety net' },
    { ul: [
      'State the diagnosis in plain words, and the expected course with a time frame.',
      '<b>Safety netting:</b> "if this or this happens, come back immediately" — say it clearly and write it down.',
      'Ask for teach-back: "just so I know I explained it well, can you tell me how you will take this?"',
      'Set the follow-up as a time interval, not "as needed".',
    ]},
    { h: 'What actually saves time' },
    { ul: [
      'Use the ready prescriptions and documentation templates instead of typing from scratch.',
      'Print patient instructions rather than repeating them verbally every time.',
      'Defer safely deferrable problems to a longer appointment rather than compressing them.',
      'Document during the visit, not after — deferred documentation swallows the end of the day.',
    ]},
  ],
},
];
