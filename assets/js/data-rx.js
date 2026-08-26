/* Ready prescriptions and patient handouts — every text copies in one tap */

window.RX = [
  /* ===== RESPIRATORY ===== */
  { id: 'rx-urti', cat: 'Respiratory', title: 'Viral Upper Respiratory Infection', sub: 'Symptomatic, no antibiotic',
    tags: ['cold', 'urti', 'cough', 'coryza'],
    text: `1) Paracetamol 500 mg — one or two tablets every 6 hours as needed for fever or pain (maximum 4 g daily)
2) Normal saline nasal spray — two sprays in each nostril 3 – 4 times daily
3) Xylometazoline 0.1% nasal spray — one spray in each nostril twice daily, no longer than 5 days
4) Warm salt water gargle three times daily
5) Warm fluids and rest`,
    notes: ['The natural course is 7 – 10 days, and cough may persist for two to three weeks.',
      'Return if: fever above 39 °C for more than 3 days, shortness of breath, or deterioration after initial improvement.'] },

  { id: 'rx-strep', cat: 'Respiratory', title: 'Bacterial Pharyngitis', sub: 'Confirmed strep or a high Centor score',
    tags: ['throat', 'tonsillitis', 'strep', 'penicillin'],
    text: `1) Amoxicillin 500 mg — one capsule twice daily for 10 days (complete the full course)
2) Paracetamol 500 mg — one or two tablets every 6 hours as needed
3) Ibuprofen 400 mg — one tablet every 8 hours after food for severe pain
4) Anaesthetic throat spray or lozenges as needed
5) Warm salt water gargle`,
    notes: ['Penicillin allergy: azithromycin 500 mg on day 1 then 250 mg for four days.',
      'Completing the full 10 days is what prevents rheumatic fever.'] },

  { id: 'rx-sinus', cat: 'Respiratory', title: 'Bacterial Sinusitis', sub: 'After 10 days, or double worsening',
    tags: ['sinusitis', 'sinus', 'nasal'],
    text: `1) Amoxicillin/Clavulanate 875/125 mg — one tablet twice daily after food for 7 days
2) Mometasone nasal spray — two sprays in each nostril once daily for two weeks
3) Normal saline nasal irrigation twice daily
4) Paracetamol 500 mg as needed for pain`,
    notes: ['Penicillin allergy: doxycycline 100 mg twice daily for 7 days.',
      'Urgent referral for periorbital swelling, diplopia, or severe headache with neurological signs.'] },

  { id: 'rx-asthma-exac', cat: 'Respiratory', title: 'Mild to Moderate Asthma Exacerbation', sub: 'Discharge from clinic',
    tags: ['asthma', 'inhaler', 'steroid', 'wheeze'],
    text: `1) Salbutamol inhaler 100 mcg — 4 puffs through a spacer every 4 – 6 hours for 48 hours, then as needed
2) Prednisolone 40 mg — one tablet each morning after food for 5 days (no taper)
3) Continue the preventer (inhaled corticosteroid) regularly — do not stop it
4) Clinic review within 3 – 7 days for reassessment`,
    notes: ['Always use a spacer — it delivers the drug better than direct actuation.',
      'Attend the emergency department immediately for: inability to complete a sentence, blue lips, or no response to the reliever.'] },

  /* ===== URINARY ===== */
  { id: 'rx-cystitis', cat: 'Urinary', title: 'Uncomplicated Cystitis', sub: 'Non-pregnant woman',
    tags: ['uti', 'dysuria', 'bladder', 'urine'],
    text: `1) Nitrofurantoin 100 mg — one capsule twice daily with food for 5 days
2) Paracetamol 500 mg as needed for pain
3) Phenazopyridine 200 mg — one tablet three times daily for two days only, for severe dysuria (warn: turns urine orange)
4) Drink 2 – 3 litres of water daily`,
    notes: ['Do not use nitrofurantoin if eGFR is below 30.',
      'Alternative: fosfomycin 3 g as a single dose.',
      'Return if fever, flank pain, vomiting, or symptoms persisting beyond 3 days.'] },

  { id: 'rx-uti-preg', cat: 'Urinary', title: 'UTI in Pregnancy', sub: 'Safe options',
    tags: ['pregnancy', 'uti', 'urine', 'antenatal'],
    text: `1) Cephalexin 500 mg — one capsule three to four times daily for 7 days
2) Paracetamol 500 mg as needed
3) Increase fluid intake
4) Repeat urine culture one week after completing treatment`,
    notes: ['Contraindicated in pregnancy: quinolones, tetracyclines, and trimethoprim in the first trimester.',
      'Asymptomatic bacteriuria is treated in pregnancy, unlike in non-pregnant adults.'] },

  /* ===== GASTROINTESTINAL ===== */
  { id: 'rx-gastro-adult', cat: 'Gastrointestinal', title: 'Adult Gastroenteritis', sub: 'Supportive care',
    tags: ['diarrhoea', 'vomiting', 'stomach', 'dehydration'],
    text: `1) Oral rehydration salts — one sachet dissolved in one litre of water, sipped through the day
2) Ondansetron 4 mg — one tablet as needed for vomiting (maximum three times daily)
3) Loperamide 2 mg — after each loose stool, maximum 8 mg daily (avoid with fever or bloody stool)
4) Paracetamol 500 mg as needed
5) Light diet: rice, toast, banana, yoghurt`,
    notes: ['No antibiotic in most cases — the majority are viral.',
      'Return if: blood in stool, high fever, clear dehydration, or symptoms beyond 5 days.'] },

  { id: 'rx-gerd', cat: 'Gastrointestinal', title: 'Gastro-oesophageal Reflux', sub: 'An 8-week course',
    tags: ['reflux', 'heartburn', 'gerd', 'stomach'],
    text: `1) Omeprazole 20 mg — one capsule 30 minutes before breakfast daily for 8 weeks
2) Alginate or antacid suspension — one spoonful after meals and at bedtime as needed
3) Lifestyle: no food within 3 hours of lying down · raise the head of the bed 15 cm · reduce fat, caffeine, mint and citrus · lose weight · stop smoking`,
    notes: ['After improvement, step down to the lowest effective dose or on-demand use.',
      'Refer for endoscopy with: dysphagia, weight loss, anaemia, recurrent vomiting, or failure after 8 weeks.'] },

  { id: 'rx-constipation', cat: 'Gastrointestinal', title: 'Chronic Constipation', sub: 'Adults',
    tags: ['constipation', 'laxative', 'bowel'],
    text: `1) Macrogol (PEG 3350) — one sachet dissolved in a glass of water once daily (may increase to two)
2) Psyllium husk — one tablespoon in a glass of water once daily with plenty of fluids
3) Lactulose 15 ml at night as needed
4) Lifestyle: 25 – 30 g fibre daily · 2 litres of water · 30 minutes of walking · do not defer the urge`,
    notes: ['Look for causes: hypothyroidism, diabetes, and drugs (iron, opioids, antidepressants, calcium).',
      'Refer for: bleeding, weight loss, a persistent change in bowel habit over age 50, or a family history of colorectal cancer.'] },

  /* ===== PAIN ===== */
  { id: 'rx-lbp', cat: 'Pain', title: 'Mechanical Low Back Pain', sub: 'No red flags',
    tags: ['back', 'pain', 'muscle', 'lumbar'],
    text: `1) Ibuprofen 400 mg — one tablet three times daily after food for 5 – 7 days
2) Paracetamol 1 g — every 8 hours as needed
3) Cyclobenzaprine 5 mg or Tizanidine 2 mg — at night for 3 – 5 days if there is muscle spasm
4) Warm compresses for 15 – 20 minutes twice daily
5) Stay active and continue daily activity — avoid complete bed rest
6) Core strengthening exercises once the acute pain settles`,
    notes: ['Return immediately for: leg weakness, saddle numbness, or urinary or faecal incontinence.',
      'Avoid NSAIDs with peptic ulcer disease, renal impairment, or anticoagulation.'] },

  { id: 'rx-migraine', cat: 'Pain', title: 'Acute Migraine', sub: 'Attack treatment',
    tags: ['headache', 'migraine'],
    text: `1) Naproxen 500 mg — one tablet at the onset of the attack, repeatable after 12 hours
2) Sumatriptan 50 mg — one tablet if the analgesic is insufficient, repeatable after 2 hours (maximum 200 mg daily)
3) Metoclopramide 10 mg — one tablet for nausea
4) Rest in a dark, quiet room
5) Keep a headache diary: timing, duration, triggers, and analgesic days per month`,
    notes: ['Triptans are contraindicated with ischaemic heart disease or uncontrolled hypertension.',
      'Analgesic use on more than 10 days a month causes medication-overuse headache.'] },

  { id: 'rx-gout-acute', cat: 'Pain', title: 'Acute Gout', sub: 'Start within 24 hours',
    tags: ['gout', 'joint', 'urate'],
    text: `1) Naproxen 500 mg — one tablet twice daily after food for 5 – 7 days
2) Or Colchicine 0.6 mg — two tablets immediately, one after an hour, then one once or twice daily
3) Omeprazole 20 mg daily for gastric protection alongside the NSAID
4) Elevate the limb, apply cold compresses, and rest the joint
5) If already on allopurinol, do not stop it`,
    notes: ['With renal impairment use prednisolone 30 – 40 mg for 5 days instead of an NSAID.',
      'A hot joint with systemic fever means excluding septic arthritis by aspiration first.'] },

  /* ===== DERMATOLOGY ===== */
  { id: 'rx-eczema', cat: 'Dermatology', title: 'Atopic Dermatitis', sub: 'Mild to moderate flare',
    tags: ['eczema', 'skin', 'itch', 'steroid'],
    text: `1) Thick emollient (petrolatum or a ceramide cream) — two to three times daily and within minutes of bathing
2) Hydrocortisone 1% cream — for the face and skin folds, once daily for 5 – 7 days
3) Betamethasone valerate 0.1% cream — for the body and limbs, once daily for 7 – 10 days
4) Cetirizine 10 mg at night for severe itch
5) Short lukewarm showers with a soap-free, fragrance-free wash`,
    notes: ['Do not use potent steroids on the face or skin folds for prolonged periods.',
      'Honey-coloured crusting or pus indicates secondary infection needing an antibiotic.'] },

  { id: 'rx-tinea', cat: 'Dermatology', title: 'Superficial Fungal Infection', sub: "Athlete's foot / tinea corporis",
    tags: ['fungal', 'tinea', 'skin', 'itch'],
    text: `1) Clotrimazole 1% cream — apply to the area and 2 cm beyond it, twice daily for 2 – 4 weeks
2) Continue for one further week after the rash clears
3) Advice: dry the area thoroughly · loose cotton clothing · do not share towels · change socks daily`,
    notes: ['Scalp and nail infections need oral treatment (terbinafine or griseofulvin), not topical.',
      'If the rash spreads despite treatment, reconsider the diagnosis (eczema, psoriasis).'] },

  /* ===== CHRONIC ===== */
  { id: 'rx-dm-start', cat: 'Chronic', title: 'Starting Type 2 Diabetes Treatment', sub: 'First line',
    tags: ['diabetes', 'metformin', 't2dm'],
    text: `1) Metformin 500 mg — one tablet with dinner for one week, then one with breakfast and one with dinner
   (titrate up to 1 g twice daily as tolerated)
2) Check fasting glucose twice weekly and record it
3) HbA1c in 3 months
4) Referral to a dietitian and diabetes educator
5) Fundus screening + foot examination + urine ACR`,
    notes: ['Gastrointestinal effects are common initially and settle with slow titration and taking it after food.',
      'Hold metformin during dehydration, acute illness, or before contrast imaging.'] },

  { id: 'rx-htn-start', cat: 'Chronic', title: 'Starting Antihypertensive Treatment', sub: 'First line, no comorbidity',
    tags: ['hypertension', 'amlodipine', 'blood pressure'],
    text: `1) Amlodipine 5 mg — one tablet once daily (may increase to 10 mg after 4 weeks)
2) Measure blood pressure at home twice daily (morning and evening) and record the readings for one week before each review
3) Reduce salt to under 5 g daily
4) Walk 30 minutes on most days of the week
5) Review in 4 weeks with the reading diary`,
    notes: ['Ankle swelling is the commonest side effect of amlodipine; it improves with a lower dose or by adding an ACE inhibitor.',
      'With diabetes or proteinuria, start an ACE inhibitor or ARB instead.'] },

  { id: 'rx-vitd', cat: 'Chronic', title: 'Vitamin D Replacement', sub: 'Adults',
    tags: ['vitamin d', 'deficiency'],
    text: `1) Cholecalciferol 50,000 IU — one capsule once weekly for 8 weeks
2) Then Cholecalciferol 1000 – 2000 IU daily as maintenance
3) Dietary calcium: milk, yoghurt, cheese, green leafy vegetables
4) Sun exposure 15 – 20 minutes, three times weekly
5) Recheck the level after 3 months`,
    notes: ['Do not repeat a loading course without remeasuring.',
      'Malabsorption or obesity may need higher doses and closer follow-up.'] },

  { id: 'rx-iron', cat: 'Chronic', title: 'Oral Iron Replacement', sub: 'Iron deficiency anaemia',
    tags: ['iron', 'anaemia', 'ferritin'],
    text: `1) Ferrous sulfate 200 mg (65 mg elemental iron) — one tablet on alternate days on an empty stomach
2) With a glass of orange juice or vitamin C 500 mg to improve absorption
3) Avoid tea, coffee, milk and calcium within two hours either side of the dose
4) Macrogol or a mild laxative if constipated
5) Repeat the full blood count after one month, and continue for 3 months after the haemoglobin normalises`,
    notes: ['Alternate-day dosing is absorbed better than multiple daily doses and causes fewer side effects.',
      'Black stools are expected and harmless.',
      'Find the cause — replacement alone is not the treatment.'] },
];

/* ===== Patient handouts — copy or send by messaging app ===== */
window.HANDOUTS = [
  { id: 'h-inhaler', title: 'How to Use Your Inhaler', tags: ['inhaler', 'asthma', 'spacer', 'copd'],
    text: `Using your inhaler correctly with a spacer

1) Shake the inhaler well and fit it into the spacer.
2) Breathe out fully, away from the spacer.
3) Put the mouthpiece between your teeth and seal your lips around it.
4) Press the inhaler once — one puff only.
5) Breathe in slowly and deeply, then hold your breath for 10 seconds.
6) Wait 30 to 60 seconds before the next puff, and repeat for each puff separately.
7) After a steroid inhaler, rinse your mouth with water and spit it out to prevent oral thrush and hoarseness.

• Wash the spacer weekly with soap and water and let it air dry — do not towel dry it.
• The preventer inhaler is used every day, even when you feel well, not only during an attack.` },

  { id: 'h-warfarin', title: 'Warfarin Patient Instructions', tags: ['warfarin', 'inr', 'anticoagulant'],
    text: `Important instructions if you take warfarin

• Take your dose at the same time every day, preferably in the evening.
• Never change the dose yourself — only according to your INR result and your doctor's instruction.
• If you miss a dose: take it the same day if you remember, and never double the dose the next day.
• Keep every INR appointment.

Diet:
• Do not avoid green vegetables, but keep the amount you eat steady each week (spinach, parsley, cabbage, broccoli).
• Avoid sudden changes to your diet.

Warnings:
• Tell any doctor, dentist or pharmacist that you take warfarin.
• Do not take any anti-inflammatory (ibuprofen, diclofenac), aspirin, or herbal supplement without checking first.
• Antibiotics can raise your INR dangerously — see your doctor whenever one is prescribed.

Go to the emergency department for: bleeding that will not stop, blood in the urine or stool, black stools, vomiting blood, sudden large bruises, or a severe headache after a blow to the head.` },

  { id: 'h-dm-sick', title: 'Sick Day Rules for Diabetes', tags: ['diabetes', 'illness', 'insulin'],
    text: `What to do when you are ill and have diabetes

• <b>Never stop your insulin</b>, even if you are not eating — your body needs more of it when you are ill.
• Check your blood glucose every 4 hours (every 2 hours if it is high).
• Drink plenty of water — roughly a glass every hour.
• If you cannot eat, replace meals with carbohydrate-containing fluids (juice, soup, milk).
• Check for ketones if your glucose is above 250 and you use insulin.

Hold these medications temporarily during acute illness or dehydration, and speak to your doctor:
metformin · SGLT2 inhibitors (empagliflozin, dapagliflozin) · diuretics · ACE inhibitors and ARBs.

Go to the emergency department for: persistent vomiting preventing fluid intake, glucose above 300 that will not come down, positive ketones, severe abdominal pain, rapid deep breathing, or confusion.` },

  { id: 'h-hypoglycemia', title: 'Managing Low Blood Sugar', tags: ['hypoglycaemia', 'diabetes', 'insulin'],
    text: `Low blood sugar — the 15/15 rule

Warning signs: shaking, cold sweat, sudden hunger, dizziness, palpitations, confusion, poor concentration.

If your glucose is below 70 and you are awake:
1) Take 15 g of fast sugar: 3 – 4 teaspoons of sugar in water, half a glass of juice, or 3 glucose tablets.
2) Wait 15 minutes and recheck.
3) If still below 70, repeat once more.
4) Once stable, eat a snack with carbohydrate and protein (bread with cheese).

<b>Important:</b> chocolate and ice cream are not fast treatments — the fat slows sugar absorption.

If the person loses consciousness: give nothing by mouth. Put them on their side, call an ambulance immediately, and give glucagon if available.

After any severe or repeated episode, see your doctor to review the doses.` },

  { id: 'h-bp-home', title: 'Measuring Blood Pressure at Home', tags: ['blood pressure', 'monitoring', 'home'],
    text: `How to measure your blood pressure correctly at home

For 30 minutes before: no coffee, no smoking, no exercise, and empty your bladder.

Steps:
1) Sit and rest quietly for 5 minutes before starting.
2) Back supported, feet flat on the floor, legs uncrossed.
3) Rest your arm on a table so the cuff is at heart level.
4) Place the cuff on bare skin, its lower edge 2 – 3 cm above the elbow crease.
5) Do not talk during the measurement.
6) Take two readings a minute apart and record the average.

When: once in the morning before medication and breakfast, and once in the evening before bed, for 7 days before your review.

Record every reading and bring them with you — home readings guide treatment better than clinic readings.

Go to the emergency department if your reading is 180/120 or higher together with: chest pain, shortness of breath, severe headache, visual disturbance, or weakness in a limb.` },

  { id: 'h-back', title: 'Caring for Your Lower Back', tags: ['back', 'pain', 'exercise'],
    text: `Looking after your lower back

• Keep up your daily activity as much as you can — complete bed rest slows recovery and increases stiffness.
• Warm compresses for 15 – 20 minutes twice daily.
• Take pain relief on a regular schedule in the first few days, not only when the pain peaks.
• Sleep on your side with a pillow between your knees, or on your back with a pillow underneath them.

Lifting:
• Bend your knees, not your back; hold the object close to you; do not twist while lifting.

At work:
• Stand and move every 30 to 45 minutes.
• Set your chair height so your feet rest flat and your lower back is supported.

Most episodes improve within 2 to 6 weeks.

See a doctor immediately if: weakness or numbness in the legs, numbness around the seat area, difficulty or loss of control passing urine or stool, fever, or unexplained weight loss.` },
];
