/* Clinical guides — concise family medicine summaries
   Block types: { p }, { h }, { ul }, { ol }, { note, kind }, { table:{head,rows} }, { copy } */

window.GUIDES = [

/* ============ CHRONIC DISEASE ============ */
{
  id: 'dm2', cat: 'Chronic disease', title: 'Type 2 Diabetes', sub: 'Diagnosis, targets, treatment escalation',
  tags: ['diabetes', 't2dm', 'hba1c', 'metformin', 'insulin', 'glucose'],
  blocks: [
    { h: 'Diagnostic criteria (any one, repeated to confirm)' },
    { table: { head: ['Test', 'Normal', 'Prediabetes', 'Diabetes'], rows: [
      ['HbA1c', '&lt; 5.7%', '5.7 – 6.4%', '≥ 6.5%'],
      ['Fasting glucose', '&lt; 100', '100 – 125', '≥ 126 mg/dL'],
      ['2-hour OGTT', '&lt; 140', '140 – 199', '≥ 200 mg/dL'],
      ['Random + symptoms', '—', '—', '≥ 200 mg/dL'],
    ]}},
    { note: 'A random glucose ≥ 200 with unequivocal symptoms (thirst, polyuria, weight loss) is diagnostic without repeating.', kind: 'info' },

    { h: 'Treatment targets' },
    { ul: [
      'HbA1c &lt; 7% for most adults — and &lt; 8% for older patients, limited life expectancy, or recurrent hypoglycaemia.',
      'Fasting glucose 80 – 130 mg/dL, and 2-hour postprandial &lt; 180 mg/dL.',
      'Blood pressure &lt; 130/80, and LDL &lt; 70 mg/dL (or &lt; 55 with established cardiovascular disease).',
    ]},

    { h: 'Escalating drug treatment' },
    { ol: [
      '<b>Metformin</b> is first line for everyone unless contraindicated: start 500 mg once daily with food and increase weekly to 1 g twice daily.',
      'With <b>cardiovascular disease, heart failure or kidney disease</b> → add an SGLT2 inhibitor (empagliflozin 10 mg) or a GLP-1 receptor agonist regardless of the HbA1c.',
      'If <b>weight</b> is the priority → a GLP-1 receptor agonist (semaglutide, liraglutide).',
      'If <b>cost</b> is the barrier → a sulfonylurea (gliclazide) or pioglitazone.',
      'If HbA1c &gt; 10%, glucose &gt; 300, or there are catabolic symptoms → start <b>basal insulin</b> directly.',
    ]},

    { h: 'Starting basal insulin' },
    { ul: [
      'Start 10 units at night, or 0.1 – 0.2 units/kg.',
      'Increase by 2 units every 3 days until the fasting glucose reaches 80 – 130.',
      'Reduce by 4 units (or 10%) after any hypoglycaemic episode below 70.',
      'Continue metformin. Stop the sulfonylurea when prandial insulin is added.',
    ]},

    { h: 'Cautions' },
    { note: 'Stop metformin if eGFR is below 30, and do not start it below 45. Hold it before contrast imaging and during acute dehydration or admission.', kind: 'warn' },
    { note: 'SGLT2 inhibitors raise the risk of genital mycotic infection and euglycaemic ketoacidosis. Hold during prolonged fasting, acute illness, or 3 days before surgery.', kind: 'warn' },

    { h: 'Ongoing monitoring' },
    { ul: [
      'HbA1c every 3 months until stable, then every 6 months.',
      'Dilated fundus examination annually from diagnosis.',
      'Annual foot examination (monofilament sensation and pulses).',
      'Urine ACR and creatinine annually.',
      'Lipids annually, and vitamin B12 every two years on long-term metformin.',
    ]},
  ],
},

{
  id: 'htn', cat: 'Chronic disease', title: 'Hypertension', sub: 'Staging, when to treat, drug selection',
  tags: ['hypertension', 'blood pressure', 'amlodipine', 'lisinopril'],
  blocks: [
    { h: 'Classification (ACC/AHA)' },
    { table: { head: ['Category', 'Systolic', '', 'Diastolic'], rows: [
      ['Normal', '&lt; 120', 'and', '&lt; 80'],
      ['Elevated', '120 – 129', 'and', '&lt; 80'],
      ['Stage 1', '130 – 139', 'or', '80 – 89'],
      ['Stage 2', '≥ 140', 'or', '≥ 90'],
      ['Hypertensive crisis', '≥ 180', 'and/or', '≥ 120'],
    ]}},
    { note: 'Never diagnose from a single reading. Confirm with home readings or ambulatory monitoring, and measure properly: 5 minutes of rest, back supported, arm at heart level, correct cuff size.', kind: 'info' },

    { h: 'When to start a drug' },
    { ul: [
      'Stage 1 <b>with</b> cardiovascular disease, diabetes, kidney disease, or a 10-year risk ≥ 10% → drug plus lifestyle.',
      'Stage 1 without those → lifestyle for 3 – 6 months, then reassess.',
      'Stage 2 → start immediately, usually with two agents.',
    ]},

    { h: 'Choosing the drug' },
    { table: { head: ['Situation', 'Preferred'], rows: [
      ['No comorbidity', 'Thiazide, calcium channel blocker, or ACEi/ARB'],
      ['Diabetes or proteinuria', 'ACE inhibitor or ARB'],
      ['After myocardial infarction', 'Beta blocker + ACE inhibitor'],
      ['Heart failure with reduced EF', 'ACEi/ARNI + beta blocker + spironolactone + SGLT2i'],
      ['African ancestry', 'Calcium channel blocker or thiazide'],
      ['Pregnancy', 'Labetalol, nifedipine, methyldopa'],
      ['Benign prostatic hyperplasia', 'Doxazosin as an add-on'],
    ]}},
    { note: 'Contraindicated in pregnancy: ACE inhibitors, ARBs and spironolactone. Always ask about the possibility of pregnancy before prescribing.', kind: 'danger' },

    { h: 'Common starting doses' },
    { ul: [
      'Amlodipine 5 mg daily (up to 10).',
      'Lisinopril 10 mg daily (up to 40) — or losartan 50 mg (up to 100).',
      'Hydrochlorothiazide 12.5 – 25 mg in the morning, or indapamide 1.5 mg.',
      'Bisoprolol 2.5 – 5 mg daily.',
    ]},
    { note: 'Two weeks after starting an ACEi/ARB or a diuretic, check creatinine and potassium. A creatinine rise of up to 30% is acceptable and does not require stopping.', kind: 'warn' },

    { h: 'Severely raised blood pressure without symptoms' },
    { ul: [
      'A reading ≥ 180/120 <b>without</b> end-organ signs (chest pain, breathlessness, severe headache with altered consciousness, visual disturbance) is urgency, not an emergency.',
      'Do not lower it rapidly and do not give sublingual nifedipine. Repeat after 30 minutes of rest, start or adjust oral therapy, and review within 3 – 7 days.',
      'Any end-organ sign → immediate emergency referral.',
    ]},
  ],
},

{
  id: 'lipid', cat: 'Chronic disease', title: 'Dyslipidaemia', sub: 'Who needs a statin, and at what intensity',
  tags: ['cholesterol', 'lipids', 'statin', 'ldl'],
  blocks: [
    { h: 'The four groups who benefit from a statin' },
    { ol: [
      'Established atherosclerotic disease (myocardial infarction, stent, stroke, peripheral arterial disease) → high-intensity statin.',
      'LDL ≥ 190 mg/dL → high-intensity statin, and consider familial hypercholesterolaemia.',
      'Diabetes aged 40 – 75 → at least moderate-intensity statin.',
      'Aged 40 – 75 with a 10-year ASCVD risk ≥ 7.5% → moderate-intensity statin.',
    ]},

    { h: 'Statin intensity' },
    { table: { head: ['Intensity', 'LDL reduction', 'Drugs'], rows: [
      ['High', '≥ 50%', 'Atorvastatin 40 – 80 · rosuvastatin 20 – 40'],
      ['Moderate', '30 – 49%', 'Atorvastatin 10 – 20 · rosuvastatin 5 – 10 · simvastatin 20 – 40'],
      ['Low', '&lt; 30%', 'Simvastatin 10 · pravastatin 10 – 20'],
    ]}},

    { h: 'Follow-up' },
    { ul: [
      'Recheck lipids 4 – 12 weeks after starting or changing the dose, then every 3 – 12 months.',
      'Routine liver enzyme monitoring is not needed — check only if symptomatic.',
      'Muscle symptoms: check CK. If normal or mildly raised, try a two-week washout then rechallenge at a lower dose or with a different statin (rosuvastatin twice weekly works well).',
    ]},
    { note: 'Statins are contraindicated in pregnancy and breastfeeding. Watch for interactions with clarithromycin, amiodarone and grapefruit juice (especially simvastatin and atorvastatin).', kind: 'danger' },

    { h: 'Raised triglycerides' },
    { ul: [
      '150 – 499: treat lifestyle and the underlying cause (uncontrolled diabetes, alcohol, hypothyroidism, drugs).',
      '≥ 500: pancreatitis risk — start fenofibrate or high-dose omega-3 with strict dietary measures.',
    ]},
  ],
},

{
  id: 'thyroid', cat: 'Chronic disease', title: 'Thyroid Disorders', sub: 'Hypo- and hyperthyroidism',
  tags: ['thyroid', 'tsh', 'levothyroxine', 'hypothyroid'],
  blocks: [
    { h: 'Reading the results' },
    { table: { head: ['TSH', 'Free T4', 'Interpretation'], rows: [
      ['High', 'Low', 'Overt hypothyroidism'],
      ['High', 'Normal', 'Subclinical hypothyroidism'],
      ['Low', 'High', 'Overt hyperthyroidism'],
      ['Low', 'Normal', 'Subclinical hyperthyroidism'],
      ['Low', 'Low', 'Central (pituitary) hypothyroidism — refer to endocrinology'],
    ]}},

    { h: 'Hypothyroidism — treatment' },
    { ul: [
      'Levothyroxine 1.6 micrograms/kg daily in an otherwise healthy adult (roughly 100 micrograms at 60 kg).',
      'Older patients or those with cardiac disease: start 25 – 50 micrograms and titrate slowly.',
      'Take on an empty stomach 30 – 60 minutes before breakfast, and 4 hours apart from iron and calcium.',
      'Recheck TSH 6 – 8 weeks after any change, then annually once stable.',
    ]},
    { note: 'Subclinical hypothyroidism: treat if TSH ≥ 10, or TSH 4.5 – 10 with clear symptoms, positive TPO antibodies, pregnancy, or planned conception.', kind: 'info' },
    { note: 'Requirements rise by around 30% in pregnancy. Advise the patient to take two extra doses per week as soon as pregnancy is confirmed, check TSH every 4 weeks, and target a TSH below 2.5.', kind: 'warn' },

    { h: 'Hyperthyroidism' },
    { ul: [
      'Request TSH, free T4, free T3 and TRAb, with a radionuclide scan where needed to differentiate.',
      'For symptom control: propranolol 10 – 40 mg three times daily.',
      'Carbimazole or methimazole is first line (except in the first trimester of pregnancy → propylthiouracil).',
      'Refer to endocrinology for definitive treatment.',
    ]},
    { note: 'Warn every patient on carbimazole: any sore throat with fever means stopping the drug immediately and having a full blood count — risk of agranulocytosis.', kind: 'danger' },
  ],
},

/* ============ RESPIRATORY ============ */
{
  id: 'asthma', cat: 'Respiratory', title: 'Asthma', sub: 'GINA steps, control assessment, acute attack',
  tags: ['asthma', 'inhaler', 'salbutamol', 'wheeze', 'gina'],
  blocks: [
    { h: 'Assessing control — the last 4 weeks' },
    { ul: [
      'Daytime symptoms more than twice a week?',
      'Any night waking due to asthma?',
      'Reliever needed more than twice a week?',
      'Any activity limitation due to asthma?',
    ]},
    { p: 'None = <b>controlled</b> · 1 – 2 = <b>partly controlled</b> · 3 – 4 = <b>uncontrolled</b>.' },

    { h: 'Treatment steps (adults and adolescents)' },
    { table: { head: ['Step', 'Preferred treatment'], rows: [
      ['1 – 2', 'As-needed low-dose ICS-formoterol'],
      ['3', 'Low-dose ICS-formoterol daily plus as needed'],
      ['4', 'Medium-dose ICS-formoterol daily plus as needed'],
      ['5', 'High dose plus specialist referral (tiotropium or a biologic)'],
    ]}},
    { note: 'GINA no longer recommends salbutamol alone without an inhaled corticosteroid — reliever-only treatment increases the risk of severe attacks.', kind: 'warn' },

    { h: 'Acute attack in the clinic' },
    { ol: [
      'Oxygen to maintain saturation 93 – 95%.',
      'Salbutamol 4 – 10 puffs via spacer every 20 minutes for the first hour (or 2.5 – 5 mg nebulised).',
      'Prednisolone 40 – 50 mg orally, given early, for 5 – 7 days without a taper.',
      'Add ipratropium in severe attacks.',
      'Observe the response for an hour. Good response → discharge with a written action plan and review in 2 – 7 days.',
    ]},
    { note: 'Signs demanding immediate transfer: unable to complete a sentence, saturation below 90%, altered consciousness, a silent chest, or a pulse above 120.', kind: 'danger' },

    { h: 'Before stepping up — always check' },
    { ul: ['Inhaler technique (ask for a demonstration).', 'Adherence.', 'Triggers: smoking, dust, animals, allergic rhinitis.', 'Comorbidities: reflux, obesity, sinusitis.'] },
  ],
},

{
  id: 'copd', cat: 'Respiratory', title: 'COPD', sub: 'Diagnosis, GOLD groups, exacerbation',
  tags: ['copd', 'emphysema', 'smoking', 'spirometry'],
  blocks: [
    { h: 'Diagnosis' },
    { ul: [
      'Suspect it with: age over 40, smoking or smoke exposure, and chronic cough, sputum or progressive breathlessness.',
      'Confirm with spirometry: post-bronchodilator FEV1/FVC below 0.70.',
    ]},
    { h: 'Pharmacological treatment' },
    { table: { head: ['Group', 'Description', 'Treatment'], rows: [
      ['A', 'Few symptoms, few exacerbations', 'One long-acting bronchodilator'],
      ['B', 'More symptoms, few exacerbations', 'LABA + LAMA'],
      ['E', 'Frequent exacerbations (≥2 or an admission)', 'LABA + LAMA (add ICS if eosinophils ≥ 300)'],
    ]}},
    { h: 'What matters more than the drug' },
    { ul: [
      '<b>Smoking cessation</b> — the only intervention that slows the decline in lung function.',
      'Annual influenza vaccine plus pneumococcal and COVID vaccination.',
      'Pulmonary rehabilitation for anyone with limiting breathlessness.',
      'Assess for home oxygen if PaO₂ ≤ 55 or saturation ≤ 88%.',
    ]},
    { h: 'Acute exacerbation' },
    { ul: [
      'Increase short-acting bronchodilators.',
      'Prednisolone 40 mg daily for 5 days.',
      'Antibiotic if the sputum becomes more purulent or ventilation is needed (amoxicillin-clavulanate or doxycycline for 5 days).',
    ]},
  ],
},

/* ============ ACUTE ============ */
{
  id: 'uti', cat: 'Acute', title: 'Urinary Tract Infection', sub: 'Simple, complicated, and in pregnancy',
  tags: ['uti', 'urine', 'dysuria', 'nitrofurantoin', 'cystitis'],
  blocks: [
    { h: 'Uncomplicated cystitis (non-pregnant woman)' },
    { ul: [
      'Nitrofurantoin 100 mg twice daily for 5 days. <b>First line.</b>',
      'Or fosfomycin 3 g as a single dose.',
      'Or trimethoprim/sulfamethoxazole 160/800 twice daily for 3 days (only where local resistance is below 20%).',
      'Ciprofloxacin is not first line for simple cystitis — reserve it for complicated infection.',
    ]},
    { note: 'Do not use nitrofurantoin if eGFR is below 30, and not for pyelonephritis (it does not reach renal tissue concentrations).', kind: 'warn' },

    { h: 'Pyelonephritis' },
    { ul: [
      'Features: fever, flank pain, nausea and vomiting, costovertebral angle tenderness.',
      'Always send a urine culture before starting.',
      'Stable patient: ciprofloxacin 500 mg twice daily for 7 days, or a first dose of IV ceftriaxone 1 g then oral therapy.',
      'Admit for: vomiting preventing oral intake, pregnancy, sepsis, or no improvement within 48 – 72 hours.',
    ]},

    { h: 'In pregnancy' },
    { ul: [
      'Even asymptomatic bacteriuria <b>is treated</b> in pregnancy — send a routine culture at the first visit.',
      'Safe: cephalexin 500 mg four times daily · amoxicillin-clavulanate · nitrofurantoin (avoid near term and in the third trimester).',
      'Contraindicated: quinolones · tetracyclines · trimethoprim in the first trimester.',
      'Repeat the culture one week after finishing treatment.',
    ]},

    { h: 'When to suspect something else' },
    { ul: ['Vaginal discharge or ulceration → vaginitis or a sexually transmitted infection.', 'A young man with urinary symptoms → prostatitis or epididymitis.', 'Recurrent infection in a man → image the urinary tract and refer.'] },
  ],
},

{
  id: 'pharyngitis', cat: 'Acute', title: 'Sore Throat', sub: 'When an antibiotic is justified',
  tags: ['throat', 'tonsillitis', 'centor', 'strep', 'penicillin'],
  blocks: [
    { h: 'Modified Centor (McIsaac) criteria' },
    { ul: [
      'Temperature above 38 °C → 1 point',
      'Absence of cough → 1 point',
      'Tender anterior cervical lymphadenopathy → 1 point',
      'Tonsillar swelling or exudate → 1 point',
      'Age 3 – 14 → 1 point · 15 – 44 → 0 · ≥ 45 → minus 1',
    ]},
    { table: { head: ['Score', 'Action'], rows: [
      ['0 – 1', 'No test and no antibiotic — symptomatic treatment'],
      ['2 – 3', 'Rapid antigen test; treat if positive'],
      ['≥ 4', 'Rapid test or empirical treatment depending on the picture'],
    ]}},
    { h: 'Treatment once strep is confirmed' },
    { ul: [
      'Penicillin V 500 mg two to three times daily for 10 days.',
      'Or amoxicillin 500 mg twice daily for 10 days.',
      'Penicillin allergy: azithromycin 500 mg on day 1 then 250 mg for four days, or clindamycin.',
      'Complete the full ten days — the purpose is preventing rheumatic fever.',
    ]},
    { note: 'Warning signs: difficulty swallowing saliva, a muffled voice, uvular deviation, neck stiffness, stridor, or severe unilateral swelling → peritonsillar abscess or epiglottitis, refer immediately.', kind: 'danger' },
    { note: 'An adolescent with marked fatigue, posterior cervical nodes and splenomegaly → consider infectious mononucleosis. Avoid amoxicillin, which causes a widespread rash.', kind: 'warn' },
  ],
},

{
  id: 'urti', cat: 'Acute', title: 'Common Cold & Sinusitis', sub: 'Telling viral from bacterial',
  tags: ['cold', 'coryza', 'sinusitis', 'cough', 'urti'],
  blocks: [
    { h: 'Viral upper respiratory infection' },
    { ul: [
      'The natural course is 7 – 10 days, and cough may last 2 – 3 weeks.',
      'No antibiotic. Treatment: fluids, saline nasal irrigation, paracetamol, and honey for cough (over age one).',
      'Topical decongestants for no more than 3 – 5 days to avoid rebound congestion.',
    ]},
    { h: 'When to suspect bacterial sinusitis' },
    { p: 'Any one of these three:' },
    { ol: [
      'Symptoms persisting ≥ 10 days with no improvement at all.',
      'Severe symptoms from the outset: fever ≥ 39 °C with purulent discharge for ≥ 3 days.',
      'Improvement followed by deterioration ("double sickening").',
    ]},
    { h: 'Treatment' },
    { ul: [
      'Amoxicillin-clavulanate 875/125 twice daily for 5 – 7 days.',
      'Allergy: doxycycline 100 mg twice daily.',
      'Adjuncts: intranasal corticosteroid plus saline irrigation.',
    ]},
    { note: 'Urgent referral for: periorbital swelling or erythema, diplopia, proptosis, severe headache, or any neurological sign.', kind: 'danger' },
  ],
},

/* ============ SYMPTOMS ============ */
{
  id: 'headache', cat: 'Symptoms', title: 'Headache', sub: 'Red flags and migraine management',
  tags: ['headache', 'migraine', 'snoop'],
  blocks: [
    { note: '<b>Red flags (SNOOP)</b> — any one warrants imaging or urgent referral:', kind: 'danger' },
    { ul: [
      '<b>S</b> Systemic features: fever, weight loss, cancer, immunosuppression.',
      '<b>N</b> Neurological signs: weakness, altered consciousness, seizure, neck stiffness, papilloedema.',
      '<b>O</b> Onset sudden and thunderclap, peaking within a minute → subarachnoid haemorrhage until proven otherwise.',
      '<b>O</b> Onset after age 50 → consider giant cell arteritis (request ESR/CRP).',
      '<b>P</b> Pattern change, or worse with coughing, lying flat, or postural change.',
    ]},

    { h: 'Diagnosing migraine' },
    { p: 'Attacks lasting 4 – 72 hours, with two of: unilateral · pulsating · moderate to severe · aggravated by activity — <b>and</b> one of: nausea or vomiting · photophobia and phonophobia.' },

    { h: 'Treating the attack' },
    { ul: [
      'Ibuprofen 400 – 600 mg or naproxen 500 mg taken early in the attack.',
      'A triptan (sumatriptan 50 – 100 mg) if simple analgesia is insufficient.',
      'Metoclopramide 10 mg for nausea — it also improves analgesic absorption.',
    ]},
    { note: 'Triptans are contraindicated with ischaemic heart disease, uncontrolled hypertension, or migraine with brainstem aura.', kind: 'warn' },

    { h: 'Prevention — when and with what' },
    { ul: [
      'Start prevention if: ≥ 4 attacks a month, disabling attacks, or analgesic overuse.',
      'Propranolol 40 – 160 mg/day · amitriptyline 10 – 50 mg at night · topiramate 50 – 100 mg/day · valproate (contraindicated in women of childbearing potential).',
      'Judge the response only after 8 – 12 weeks at an adequate dose.',
    ]},
    { note: 'Medication-overuse headache: analgesic use on more than 10 – 15 days a month. The treatment is withdrawal alongside starting prevention — warn the patient that symptoms worsen for two weeks before improving.', kind: 'warn' },
  ],
},

{
  id: 'lbp', cat: 'Symptoms', title: 'Low Back Pain', sub: 'Triage and management',
  tags: ['back', 'sciatica', 'disc', 'lumbar'],
  blocks: [
    { note: '<b>Red flags</b> — warrant imaging or referral:', kind: 'danger' },
    { ul: [
      'Urinary incontinence or retention, saddle anaesthesia, bilateral leg weakness → <b>cauda equina syndrome, an immediate emergency</b>.',
      'Fever, intravenous drug use, immunosuppression → spinal infection.',
      'Cancer history, unexplained weight loss, age over 50, night pain unrelieved by rest.',
      'Major trauma, or minor trauma with osteoporosis or chronic steroid use.',
      'Progressive motor weakness.',
    ]},
    { h: 'Simple mechanical pain' },
    { ul: [
      '<b>No imaging</b> in the first 6 weeks without red flags — early imaging worsens outcomes rather than improving them.',
      'Stay active; bed rest slows recovery.',
      'Analgesia: paracetamol or a short course of an NSAID, with heat.',
      'A muscle relaxant for a few days only, where there is clear spasm.',
      'Physiotherapy and strengthening for symptoms persisting beyond 4 weeks.',
    ]},
    { h: 'Sciatica' },
    { ul: [
      'Pain radiating below the knee in a dermatomal pattern, with a positive straight leg raise.',
      'Most cases improve within 6 – 12 weeks with conservative management.',
      'Refer for surgical opinion with: progressive motor deficit, cauda equina, or refractory pain beyond 6 – 12 weeks.',
    ]},
  ],
},

{
  id: 'chestpain', cat: 'Symptoms', title: 'Chest Pain in Clinic', sub: 'Rapid triage',
  tags: ['chest pain', 'angina', 'cardiac', 'acs'],
  blocks: [
    { note: 'Any chest pain with one of these → <b>call an ambulance now</b>, give aspirin 300 mg chewed unless contraindicated, and record an ECG if available: crushing pain over 20 minutes, cold sweating, severe breathlessness, syncope, hypotension, pallor, or pain radiating to the jaw or arm.', kind: 'danger' },
    { h: 'Features favouring a cardiac origin' },
    { ul: ['Central pressure or heaviness radiating to the jaw or left arm.', 'Brought on or worsened by exertion, relieved by rest or nitrates.', 'Associated with sweating, nausea or breathlessness.', 'Risk factors: age, diabetes, smoking, hypertension, dyslipidaemia, premature family history.'] },
    { note: 'Note: women, older adults and people with diabetes often present atypically — fatigue, breathlessness, epigastric pain, or nausea alone.', kind: 'warn' },
    { h: 'Other dangerous diagnoses not to miss' },
    { ul: [
      'Pulmonary embolism: sudden pleuritic pain, breathlessness, tachycardia, leg swelling (use Wells and PERC).',
      'Aortic dissection: severe tearing pain radiating to the back, with a blood pressure difference between arms.',
      'Pneumothorax: sudden pain with breathlessness and unilaterally reduced breath sounds.',
    ]},
    { h: 'Common benign causes' },
    { ul: ['Costochondritis: localised pain reproduced on palpation.', 'Reflux: burning after meals or on lying down.', 'Musculoskeletal after exertion or coughing.', 'Anxiety or hyperventilation — a diagnosis of exclusion, never a first assumption.'] },
  ],
},

{
  id: 'ibs', cat: 'Gastrointestinal', title: 'IBS & Reflux', sub: 'Rome IV criteria and reflux management',
  tags: ['ibs', 'bowel', 'reflux', 'gerd', 'heartburn'],
  blocks: [
    { h: 'Irritable bowel syndrome — Rome IV criteria' },
    { p: 'Recurrent abdominal pain at least one day a week over the last 3 months, associated with two of: defecation · a change in stool frequency · a change in stool form.' },
    { note: 'Red flags that exclude the diagnosis and warrant referral: onset after age 50, rectal bleeding, weight loss, anaemia, fever, family history of colorectal cancer or inflammatory bowel disease, and nocturnal symptoms that wake the patient.', kind: 'danger' },
    { h: 'Management' },
    { ul: [
      'Explain the diagnosis clearly and give positive reassurance — this alone reduces repeat attendance.',
      'A low-FODMAP diet under dietetic supervision, with reduced caffeine and fat.',
      'Constipation-predominant: soluble fibre (psyllium), macrogol.',
      'Diarrhoea-predominant: loperamide as needed.',
      'Cramping: antispasmodics (mebeverine, hyoscine) or peppermint oil.',
      'Refractory cases: low-dose amitriptyline at night.',
    ]},

    { h: 'Gastro-oesophageal reflux' },
    { ul: [
      'Start a proton pump inhibitor: omeprazole 20 mg 30 – 60 minutes before breakfast for 4 – 8 weeks.',
      'Lifestyle: weight loss, raise the head of the bed, no food within 3 hours of lying down, reduce fat, caffeine and mint.',
      'After improvement, step down gradually to the lowest effective or on-demand dose.',
    ]},
    { note: 'Refer for endoscopy with: dysphagia, odynophagia, recurrent vomiting, bleeding or anaemia, weight loss, new symptoms over age 50, or failure after 8 weeks of treatment.', kind: 'warn' },
  ],
},

/* ============ HAEMATOLOGY ============ */
{
  id: 'anemia', cat: 'Haematology', title: 'Iron Deficiency Anaemia', sub: 'Diagnosis, cause, replacement',
  tags: ['anaemia', 'iron', 'ferritin', 'haemoglobin'],
  blocks: [
    { h: 'Diagnosis' },
    { ul: [
      'Full blood count: low haemoglobin with a low MCV and a raised RDW.',
      '<b>Ferritin</b> is the most useful test: below 30 ng/mL confirms deficiency.',
      'Ferritin is an acute phase protein — it can be normal or raised despite deficiency when inflammation is present. Then use transferrin saturation below 20%.',
    ]},
    { note: 'The important question is not how to replace the iron but <b>why it was lost</b> — a man, or a postmenopausal woman, with iron deficiency has gastrointestinal blood loss until proven otherwise and needs endoscopic referral.', kind: 'danger' },
    { h: 'Common causes' },
    { ul: ['Heavy menstrual bleeding.', 'Pregnancy and lactation.', 'Gastrointestinal loss: ulcer, malignancy, haemorrhoids, aspirin or NSAIDs.', 'Malabsorption: coeliac disease (request tTG-IgA), Helicobacter pylori, bariatric surgery.', 'Inadequate dietary intake.'] },
    { h: 'Treatment' },
    { ul: [
      'Oral iron 40 – 60 mg elemental <b>on alternate days</b> — trials show better absorption and fewer side effects than multiple daily doses.',
      'Take on an empty stomach with vitamin C; keep away from tea, coffee, calcium and antibiotics.',
      'Recheck haemoglobin at 2 – 4 weeks: expect a rise of at least 1 g/dL.',
      'Continue for 3 months <b>after</b> the haemoglobin normalises to refill stores, then check ferritin.',
      'Intravenous iron for: intolerance, malabsorption, ongoing loss, or an urgent need.',
    ]},
    { note: 'Warn the patient about black stools (normal) and constipation — treat that with a laxative rather than by stopping the iron.', kind: 'info' },
  ],
},

{
  id: 'vitd', cat: 'Haematology', title: 'Vitamin D Deficiency', sub: 'Who to test and how to treat',
  tags: ['vitamin d', 'calcium', 'deficiency', 'bone'],
  blocks: [
    { h: 'Classification' },
    { table: { head: ['Level (ng/mL)', 'Category'], rows: [
      ['&lt; 12', 'Severe deficiency'], ['12 – 20', 'Deficiency'], ['20 – 30', 'Insufficiency'], ['≥ 30', 'Sufficient'],
    ]}},
    { note: 'Population screening is not recommended in asymptomatic people without risk factors. Test with: osteoporosis, recurrent fracture, malabsorption, renal or liver disease, anticonvulsant use, diffuse bone pain, or complete sun avoidance.', kind: 'info' },
    { h: 'Treatment' },
    { ul: [
      'Deficiency in adults: 50,000 IU weekly for 6 – 8 weeks, then maintenance of 1000 – 2000 IU daily.',
      'General adult maintenance: 800 – 2000 IU daily.',
      'Recheck 3 months after the loading course.',
    ]},
    { note: 'Avoid repeated high-dose loading without measurement — toxicity causes hypercalcaemia and renal stones. Never repeat loading blind.', kind: 'warn' },
  ],
},

{
  id: 'gout', cat: 'Musculoskeletal', title: 'Gout', sub: 'Acute attack and urate-lowering therapy',
  tags: ['gout', 'urate', 'allopurinol', 'joint'],
  blocks: [
    { h: 'The acute attack' },
    { ul: [
      'A full-dose NSAID: naproxen 500 mg twice daily or indomethacin — for 5 – 7 days.',
      'Or colchicine 1.2 mg then 0.6 mg after an hour, then 0.6 mg once or twice daily.',
      'Or prednisolone 30 – 40 mg daily for 5 days (the best option with renal impairment).',
      'Start within the first 24 hours — the earlier, the more effective.',
    ]},
    { note: 'Serum urate can be normal during an attack and does not exclude the diagnosis. The definitive test is joint aspiration showing crystals, particularly to exclude septic arthritis.', kind: 'warn' },
    { note: 'A single hot painful joint with fever is <b>septic arthritis</b> until proven otherwise → urgent referral for aspiration.', kind: 'danger' },
    { h: 'Urate-lowering therapy' },
    { ul: [
      'Start it if: ≥ 2 attacks a year, tophi, urate renal stones, or radiographic joint damage.',
      'Allopurinol 100 mg daily (50 mg if eGFR is below 30), titrated every 2 – 5 weeks.',
      'Target: urate below 6 mg/dL (or below 5 with tophi).',
      'Cover the first 3 – 6 months with colchicine 0.6 mg daily to prevent mobilisation flares.',
      '<b>Do not stop</b> urate-lowering therapy during an attack in a patient already established on it.',
    ]},
    { h: 'Lifestyle' },
    { ul: ['Reduce red meat, organ meats and seafood.', 'Avoid fructose-sweetened drinks and alcohol (particularly beer).', 'Weight loss, generous water intake, and low-fat dairy.', 'Review the drug list: thiazide diuretics and low-dose aspirin raise urate.'] },
  ],
},

/* ============ MENTAL HEALTH ============ */
{
  id: 'mental', cat: 'Mental health', title: 'Depression & Anxiety', sub: 'Screening, starting treatment, follow-up',
  tags: ['depression', 'anxiety', 'phq', 'gad', 'ssri'],
  blocks: [
    { h: 'Screening' },
    { ul: [
      'Use PHQ-9 for depression and GAD-7 for anxiety (both in the Calculators tab).',
      '<b>Ask about suicidal thoughts explicitly</b> in every case of depression — asking does not plant the idea.',
      'Exclude organic causes: hypothyroidism, anaemia, B12 or vitamin D deficiency, and drugs (corticosteroids, interferon, some beta blockers).',
    ]},
    { h: 'Starting drug treatment' },
    { ul: [
      'First line: an SSRI — sertraline 50 mg · escitalopram 10 mg · fluoxetine 20 mg.',
      'Start at half dose for the first week to limit early side effects, particularly with anxiety.',
      'Full effect takes 4 – 6 weeks — tell the patient this at the outset, or they will stop after two.',
      'Continue for 6 – 12 months <b>after</b> full remission, and taper slowly when stopping.',
    ]},
    { note: 'Review within 1 – 2 weeks of starting, particularly in patients under 25 (risk of early increase in suicidal ideation).', kind: 'warn' },
    { note: 'Always ask about previous manic or elevated mood episodes — starting an SSRI in bipolar disorder can precipitate mania.', kind: 'danger' },
    { h: 'When to refer to psychiatry' },
    { ul: ['Genuine suicidal risk or a plan.', 'Psychotic symptoms.', 'Suspected bipolar disorder.', 'Failure of two drugs at adequate dose and duration.', 'Severe functional impairment, or depression in pregnancy.'] },
    { h: 'What matters as much as the drug' },
    { ul: ['Cognitive behavioural therapy — effective alone in mild to moderate cases.', 'Regular physical activity.', 'Consistent sleep.', 'Social support and addressing real-world stressors.'] },
  ],
},

{
  id: 'obesity', cat: 'Prevention', title: 'Obesity', sub: 'Assessment and stepwise management',
  tags: ['obesity', 'weight', 'diet', 'semaglutide', 'bmi'],
  blocks: [
    { h: 'Assessment' },
    { ul: [
      'Calculate BMI plus waist circumference (high risk: ≥ 102 cm in men, ≥ 88 cm in women).',
      'Look for comorbidity: diabetes, dyslipidaemia, hypertension, fatty liver, sleep apnoea, polycystic ovary syndrome, joint disease.',
      'Exclude secondary causes: hypothyroidism, Cushing syndrome, and drugs (corticosteroids, antipsychotics, insulin, some antidepressants).',
    ]},
    { h: 'Steps' },
    { ol: [
      'Set a realistic target: 5 – 10% weight loss over 6 months — that alone improves glucose, blood pressure and lipids.',
      'A calorie deficit of 500 – 750 per day, emphasising protein and reducing sugars and sweetened drinks.',
      'Physical activity 150 – 300 minutes weekly at moderate intensity, plus resistance training twice weekly.',
      'Pharmacotherapy if BMI ≥ 30, or ≥ 27 with a comorbidity: a GLP-1 receptor agonist (semaglutide, liraglutide) or orlistat.',
      'Bariatric surgery if BMI ≥ 40, or ≥ 35 with comorbidity, after structured attempts have failed.',
    ]},
    { note: 'Ask about eating disorders (binge eating, night eating) before setting any plan — missing them defeats the treatment.', kind: 'info' },
  ],
},

{
  id: 'anc', cat: "Women's health", title: 'Antenatal Care', sub: 'Visit schedule and screening milestones',
  tags: ['pregnancy', 'antenatal', 'obstetric', 'folic acid'],
  blocks: [
    { h: 'First visit (ideally before 12 weeks)' },
    { ul: [
      'History, previous pregnancies, medications, chronic conditions, immunisations.',
      'Weight, height and blood pressure, with gestational age and estimated delivery date.',
      'Investigations: full blood count, blood group and Rh, fasting glucose or HbA1c, TSH where indicated, urine analysis and culture, hepatitis B and C, HIV, syphilis, rubella immunity, vitamin D, and haemoglobin electrophoresis per protocol.',
      'Folic acid 400 micrograms daily (5 mg with diabetes, obesity, epilepsy, or a previous neural tube defect).',
    ]},
    { h: 'Visit schedule' },
    { ul: ['Up to 28 weeks: every 4 weeks.', '28 to 36 weeks: every 2 weeks.', '36 weeks to delivery: weekly.'] },
    { h: 'Key milestones' },
    { ul: [
      '11 – 14 weeks: nuchal translucency scan and dating confirmation.',
      '18 – 22 weeks: detailed anomaly scan.',
      '24 – 28 weeks: gestational diabetes screening (75 g OGTT).',
      '28 weeks: anti-D for Rh-negative mothers.',
      '27 – 36 weeks: pertussis vaccine (Tdap) in every pregnancy.',
      '35 – 37 weeks: group B streptococcus swab.',
      'Influenza vaccine at any stage during the season.',
    ]},
    { note: '<b>Findings requiring immediate referral:</b> vaginal bleeding, fluid leakage, severe headache with visual disturbance or upper abdominal pain (pre-eclampsia), seizures, high fever, or a clear reduction in fetal movements after 28 weeks.', kind: 'danger' },
  ],
},
];
