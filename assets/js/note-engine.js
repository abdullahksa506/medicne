/* FM Progress Note Assistant — Stage 2 engine
   Deterministic: assembles the house-format note, flags what is missing,
   raises safety alerts, scores the rubric, and returns teaching points.
   It never invents clinical content (R1) and never adds a diagnosis (R2). */

(function () {
  'use strict';

  const PH = x => '[ TO COMPLETE: ' + x + ' ]';
  /* form labels teach ("Character — ask the patient to tap it out"); the EMR note wants the noun only */
  const noteLabel = s => String(s).split(' — ')[0].trim();
  const val = v => (v === undefined || v === null || v === '') ? null
    : (Array.isArray(v) ? (v.length ? v.join(', ') : null) : String(v).trim() || null);

  /* ---------- R6: neutral language ---------- */
  const BANNED = [
    /* absorb the copula so the rewrite stays grammatical: "is non-compliant" → "admits missing doses" */
    { re: /\b(?:is|was|has been|been|appears)\s+non[- ]?complian(?:t|ce)\b/gi, fix: 'admits missing doses',
      why: 'states behaviour instead of labelling the person' },
    { re: /\bnon[- ]?compliance\b/gi, fix: 'missed doses', why: 'names the behaviour, not a verdict' },
    { re: /\bnon[- ]?compliant\b/gi, fix: 'missing doses', why: 'states behaviour instead of labelling the person' },
    { re: /\bdifficult patient\b/gi, fix: 'still insisting after discussion', why: 'describes what happened, not a judgement' },
    { re: /\b(?:is|was|been)\s+uncooperative\b/gi, fix: 'declined examination after discussion', why: 'records the specific refusal' },
    { re: /\buncooperative\b/gi, fix: 'declined examination after discussion', why: 'records the specific refusal' },
    { re: /\bdrug[- ]seeking\b/gi, fix: 'requesting opioid analgesia', why: 'records the request without attributing motive' },
    { re: /\bhysterical\b/gi, fix: 'distressed', why: 'neutral and clinically accurate' },
    { re: /\bmalinger\w*\b/gi, fix: 'symptoms not reproduced on examination', why: 'records the finding, not the accusation' },
    { re: /\brefus(?:es|ed)\b/gi, fix: 'declined', why: 'softer register, same clinical meaning' },
    { re: /\bclaims\b/gi, fix: 'reports', why: '"claims" signals disbelief in a legal record' },
    { re: /\bdenies\b(?!\s)/gi, fix: 'denies', why: '' },
  ];

  function neutralise(text) {
    const hits = [];
    let out = text;
    BANNED.forEach(b => {
      if (!b.why) return;
      b.re.lastIndex = 0;
      if (!b.re.test(out)) { b.re.lastIndex = 0; return; }
      b.re.lastIndex = 0;
      hits.push({ found: (out.match(b.re) || [])[0], fix: b.fix, why: b.why });
      /* keep the sentence reading correctly: a match that was capitalised stays capitalised */
      out = out.replace(b.re, m => (/^[A-Z]/.test(m) ? b.fix.charAt(0).toUpperCase() + b.fix.slice(1) : b.fix));
      b.re.lastIndex = 0;
    });
    return { text: out, hits: hits };
  }

  /* ---------- R3: identifiers ---------- */
  function stripIdentifiers(text) {
    let found = false;
    let out = text
      .replace(/\b(?:05|٠٥)\d{8}\b/g, () => { found = true; return '[identifier removed]'; })
      .replace(/\b[12]\d{9}\b/g, () => { found = true; return '[identifier removed]'; })
      .replace(/\bMRN[:\s#]*\d+/gi, () => { found = true; return '[identifier removed]'; })
      .replace(/\b\d{1,2}\/\d{1,2}\/(19|20)\d{2}\b/g, () => { found = true; return '[identifier removed]'; });
    return { text: out, found: found };
  }

  /* ---------- assessment line analysis ---------- */
  const ACTION_RE = /(^|[;:,]\s*)(for\b|continue|continued|no change|referred|refer\b|start(ed)?\b|stop(ped)?\b|increase|decrease|titrat|arrange|book|repeat|recheck|review|admit|observe|monitor)/i;

  function analyseAssessment(text) {
    const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean);
    return {
      lines: lines,
      withAction: lines.filter(l => ACTION_RE.test(l)).length,
      withNumber: lines.filter(l => /\d/.test(l)).length,
      withDirection: lines.filter(l => /(→|->|rising|falling|up from|down from|trending|improved from|worse than)/i.test(l)).length,
      withQualifier: lines.filter(l => /\((?=[^)]*\w)/.test(l)).length,
    };
  }

  /* ================= NOTE BUILD ================= */

  function buildNote(visit, data) {
    const missing = [];
    const alerts = [];
    const languageHits = [];
    let identifierStripped = false;

    const get = (id) => {
      const v = val(data[id]);
      return v;
    };
    /* required-but-absent → placeholder + missing entry (R1) */
    const need = (id, label, why) => {
      const v = get(id);
      if (v) return v;
      missing.push({ field: id, label: label, why: why, placeholder: PH(label) });
      return PH(label);
    };
    const clean = (s) => {
      if (!s) return s;
      const a = stripIdentifiers(s);
      if (a.found) identifierStripped = true;
      const b = neutralise(a.text);
      b.hits.forEach(h => languageHits.push(h));
      return b.text;
    };

    /* Only fields currently applicable to this patient are read. An answer the
       clinician can no longer see must not silently reach the record (R1). */
    const vis = f => window.noteFieldVisible(f, data);

    /* --- collect red flags across all applicable fields (R4) --- */
    const sections = window.noteVisibleSectionsFor(visit, data);
    sections.forEach(sec => sec.fields.forEach(f => {
      if (!f.redFlags || !f.redFlags.length) return;
      const raw = data[f.id];
      const picked = Array.isArray(raw) ? raw : (raw ? [raw] : []);
      picked.forEach(p => {
        if (f.redFlags.indexOf(p) >= 0) {
          alerts.push({
            trigger: p,
            field: f.en,
            concern: f.why || 'This finding is not consistent with a benign cause.',
            question: 'Do you want the Assessment to reflect "' + p + '" as an unresolved concern rather than a reassuring line?',
          });
        }
      });
    }));

    /* --- header --- */
    const L = [];
    L.push('Physical Visit');
    const behaviour = get('behaviour');
    if (behaviour && behaviour !== 'No') L.push(behaviour);

    const age = need('age', 'age');
    const sex = need('sex', 'sex');
    const marital = get('marital') || 'married';
    let smoke = get('smoking') || 'Non-smoker';
    const py = get('pack_years');
    if (smoke === 'Smoker' && py) smoke = 'Smoker (' + py + ' pack-year)';
    else if (smoke === 'Ex-smoker' && py) smoke = 'Ex-smoker (' + py + ' pack-year)';
    L.push('This is a ' + age + ' y/o, ' + marital + ', ' + sex + ', ' + smoke + ', k/c');

    const kc = get('known_case');
    if (kc) {
      kc.split('\n').map(x => x.trim()).filter(Boolean).forEach(p => {
        L.push('- ' + clean(p.replace(/^[-•]\s*/, '')));
      });
    } else {
      missing.push({ field: 'known_case', label: 'known case / problem list',
        why: 'The problem list is the first thing the next reader uses. Drug, dose and control status belong on each line.',
        placeholder: PH('problem list') });
      L.push('- ' + PH('problem list'));
    }

    /* --- subjective --- */
    L.push('');
    L.push('Subjective (History):');
    const reason = get('visit_reason') || visit.reason || 'follow up';
    const purpose = get('visit_purpose') || visit.purpose || 'for lab results';
    L.push('Came today as a ' + reason + ' visit ' + (/^for|^to /.test(purpose) ? purpose : 'to ' + purpose));

    const complaints = get('complaints');
    if (complaints === 'Doing well, No complaints') {
      L.push('Doing well, No complaints');
    } else {
      const hpi = get('hpi_detail') || get('control_status');
      if (hpi) hpi.split('\n').map(x => x.trim()).filter(Boolean).forEach(x => L.push(clean(x)));
    }

    /* problem-specific block: every visit-specific field that has a value */
    const specificLines = [];
    (visit.subjective || []).forEach(f => {
      /* `conditions` steers which questions appear; it is not itself a clinical finding */
      if (f.id === 'hpi_detail' || f.id === 'control_status' || f.id === 'complaints' || f.id === 'conditions') return;
      if (!vis(f)) return;
      const v = get(f.id);
      if (!v) {
        if (f.required) missing.push({ field: f.id, label: f.en.toLowerCase(), why: f.why || '', placeholder: PH(f.en.toLowerCase()) });
        return;
      }
      if (f.id === 'red_flags') {
        specificLines.push(v === 'None of the above' ? 'Red flags screened: all -ive' : 'Red flags present: ' + v);
      } else {
        specificLines.push(noteLabel(f.en) + ': ' + clean(v));
      }
    });
    const sn = get('specific_negatives');
    if (sn) sn.split('\n').map(x => x.trim()).filter(Boolean).forEach(x => specificLines.push(clean(x)));

    if (specificLines.length) {
      L.push(visit.id === 'chronic' ? 'Chronic condition review:'
        : visit.id === 'routine' ? 'CVD risk assessment:' : 'Problem-specific review:');
      specificLines.forEach(x => L.push('- ' + x));
    }
    const cvd = get('cvd_risk');
    if (cvd) cvd.split('\n').map(x => x.trim()).filter(Boolean).forEach(x => L.push('- ' + clean(x)));

    const mc = get('mc');
    if (mc && mc !== 'Not applicable') L.push(mc);
    L.push('Depression screening is ' + (get('depression_screen') || '-ive'));
    L.push('Other PMH/PSHx: ' + (get('pmh') || 'Nill'));
    L.push('Medication/Allergy: ' + (get('med_allergy') || 'Nill'));
    L.push('FMHx: ' + (get('fmhx') || 'Nill'));
    L.push('Diet/Exercising: ' + (get('diet_exercise') || 'Not following diet or exercising (advice given)'));

    /* --- objective --- */
    L.push('');
    L.push('Objective:');
    L.push('V/S:');
    const sbp = get('sbp'), dbp = get('dbp');
    let meanBp = PH('Mean BP');
    if (sbp && dbp && !isNaN(+sbp) && !isNaN(+dbp)) meanBp = (+dbp + (+sbp - +dbp) / 3).toFixed(1);
    const vit = [
      ['SBP (mmHg)', sbp || PH('SBP')],
      ['DBP (mmHg)', dbp || PH('DBP')],
      ['Mean BP (mmHg)', meanBp],
      ['HR (Freq./min)', get('hr') || PH('HR')],
      ['RR (Freq./min)', get('rr') || '-'],
      ['T (°C)', get('temp') || PH('temperature')],
      ['SpO2 (%)', get('spo2') || PH('SpO2')],
    ];
    ['sbp', 'dbp', 'hr', 'temp', 'spo2'].forEach(id => {
      if (!get(id)) missing.push({ field: id, label: id.toUpperCase(),
        why: 'A vital sign left blank in the record reads as not taken.', placeholder: PH(id.toUpperCase()) });
    });
    const wid = Math.max.apply(null, vit.map(r => r[0].length)) + 1;
    vit.forEach(r => L.push(r[0] + ' '.repeat(wid - r[0].length) + r[1]));

    L.push('Physical exam:');
    L.push(get('general_exam') || 'Looking well, not in pain or distress');
    (visit.exam || []).forEach(f => {
      if (!vis(f)) return;
      const v = get(f.id);
      if (!v) {
        if (f.required) missing.push({ field: f.id, label: f.en.toLowerCase(), why: f.why || '', placeholder: PH(f.en.toLowerCase()) });
        return;
      }
      if (f.type === 'textarea') { L.push(noteLabel(f.en) + ':'); v.split('\n').filter(Boolean).forEach(x => L.push(x.trim())); }
      else L.push(noteLabel(f.en) + ': ' + clean(v));
    });

    L.push('');
    L.push('Labs:');
    const labs = get('labs');
    if (labs) labs.split('\n').map(x => x.trim()).filter(Boolean).forEach(x => L.push(clean(x)));
    else L.push('No recent');

    /* --- assessment --- */
    L.push('');
    L.push('Assessment:');
    const aRaw = get('assessment_lines');
    const aTxt = aRaw ? clean(aRaw) : null;
    if (aTxt) {
      aTxt.split('\n').map(x => x.trim()).filter(Boolean)
        .forEach(x => L.push(x.replace(/^[-•]\s*/, '- ').replace(/^(?!- )/, '- ')));
    } else {
      missing.push({ field: 'assessment_lines', label: 'assessment',
        why: 'The assessment is the only section that records your reasoning. Nothing else in the note can substitute for it.',
        placeholder: PH('assessment') });
      L.push('- ' + PH('assessment'));
    }
    const dna = get('deliberate_non_action');
    if (dna) L.push('- ' + clean(dna));

    const dis = get('disagreement');
    if (dis && dis !== 'No') {
      const what = get('disagreement_what');
      const act = get('disagreement_action');
      const verb = dis === 'Insisted on something' ? 'still insisting' : 'declined after discussion';
      if (what && act) {
        L.push('- ' + clean(what) + ': explained in detail, but ' + verb + '; ' + clean(act));
      } else {
        missing.push({ field: 'disagreement_action', label: 'what you did and what you offered instead',
          why: 'A disagreement needs all four parts: what you explained, that they disagreed, what you did, what you offered instead (A6).',
          placeholder: PH('four-part disagreement sequence') });
        L.push('- ' + (what ? clean(what) + ': ' : '') + 'explained in detail, but ' + verb + '; ' + PH('what you did and what you offered instead'));
      }
    }

    /* --- plan --- */
    L.push('');
    L.push('Plan:');
    L.push('- Explain and reassurance');
    L.push('- Education regarding healthy diet and stress on exercise');
    const plan = get('plan_items');
    if (plan) plan.split('\n').map(x => x.trim()).filter(Boolean).forEach(x => L.push('- ' + clean(x.replace(/^[-•]\s*/, ''))));
    else missing.push({ field: 'plan_items', label: 'investigations / referrals / prescriptions',
      why: 'The plan is what the next clinician acts on.', placeholder: PH('plan items') });

    let er = get('er_instructions'), erAuto = false;
    if (!er) { er = visit.er; erAuto = true; }
    L.push('- ER instructions were provided clearly (' + er + ')');

    let fu = get('follow_up'), fuAuto = false;
    if (!fu) { fu = visit.fu; fuAuto = true; }
    const fuFor = get('follow_up_for') || visit.fuFor || '';
    L.push('- Follow up after ' + fu + (fuFor ? ' for ' + fuFor : '') + ' - self booking instructions given clearly');

    const note = L.join('\n');
    const rubric = scoreRubric(visit, data, { note: note, missing: missing, alerts: alerts, languageHits: languageHits });
    const teaching = buildTeaching(visit, data, {
      missing: missing, alerts: alerts, languageHits: languageHits,
      erAuto: erAuto, fuAuto: fuAuto, rubric: rubric, identifierStripped: identifierStripped,
    });

    return {
      note: note, missing: missing, alerts: alerts, rubric: rubric, teaching: teaching,
      autoSuggested: [].concat(erAuto ? ['ER instructions'] : [], fuAuto ? ['follow-up interval'] : []),
      identifierStripped: identifierStripped,
      placeholderCount: (note.match(/\[ TO COMPLETE:/g) || []).length,
    };
  }

  /* ================= RUBRIC ================= */

  function scoreRubric(visit, data, ctx) {
    const r = {};

    /* 1. problem list detail */
    const kc = val(data.known_case) || '';
    const kcLines = kc.split('\n').map(x => x.trim()).filter(Boolean);
    /* a genuinely healthy patient has nothing to detail — do not penalise that */
    const noProblems = kcLines.length === 1 && /^(nil+|none|no (known )?(chronic|medical|past)|not known|healthy|free)/i.test(kcLines[0]);
    const detailed = kcLines.filter(l => /\d/.test(l) && /(on |following with|controlled|uncontrolled|stable)/i.test(l)).length;
    r.problem_list_detail = noProblems ? 2 : !kcLines.length ? 0 : (detailed === kcLines.length ? 2 : detailed ? 1 : 0);

    /* 2. problem-specific negatives — judged against the questions actually asked */
    const specFields = (visit.subjective || [])
      .filter(f => f.id !== 'red_flags' && window.noteFieldVisible(f, data));
    const specDone = specFields.filter(f => val(data[f.id])).length;
    const rfDone = !!val(data.red_flags);
    r.problem_specific_negatives = (rfDone && specDone >= Math.max(2, Math.ceil(specFields.length * 0.6))) ? 2
      : (rfDone || specDone >= 2) ? 1 : 0;

    /* 3. assessment actionable */
    const a = analyseAssessment(val(data.assessment_lines) || '');
    if (!a.lines.length) r.assessment_actionable = 0;
    else {
      let s = 0;
      if (a.withAction === a.lines.length) s++;
      if (a.withNumber >= Math.ceil(a.lines.length / 2)) s++;
      r.assessment_actionable = s;
    }

    /* 4. defensive documentation */
    let d = 0;
    if (val(data.deliberate_non_action)) d++;
    const dis = val(data.disagreement);
    if (dis === 'No') { if (d < 2) d++; }
    else if (val(data.disagreement_what) && val(data.disagreement_action)) d = 2;
    if (ctx.languageHits.length) d = Math.max(0, d - 1);
    r.defensive_documentation = Math.min(2, d);

    /* 5. safety netting */
    const er = val(data.er_instructions), fu = val(data.follow_up);
    r.safety_netting = (er && fu) ? 2 : (er || fu) ? 1 : 0;

    r.total = r.problem_list_detail + r.problem_specific_negatives + r.assessment_actionable
      + r.defensive_documentation + r.safety_netting;

    const weakest = [
      ['problem_list_detail', r.problem_list_detail, 'Put drug, dose and control status on every problem-list line.'],
      ['problem_specific_negatives', r.problem_specific_negatives, 'Document the specific negatives for this complaint — they show your differential.'],
      ['assessment_actionable', r.assessment_actionable, 'End every assessment line with an action, and put the number in.'],
      ['defensive_documentation', r.defensive_documentation, 'Record what you deliberately did not do, and why.'],
      ['safety_netting', r.safety_netting, 'Name the specific symptoms that should bring them back, not "if worse".'],
    ].sort((x, y) => x[1] - y[1])[0];
    r.one_line_verdict = r.total >= 9 ? 'Strong note. Keep the assessment discipline exactly as it is.' : weakest[2];
    return r;
  }

  /* ================= TEACHING ================= */

  function buildTeaching(visit, data, ctx) {
    const out = [];
    const a = analyseAssessment(val(data.assessment_lines) || '');
    const r = ctx.rubric;

    /* T1: always lead with a genuine strength */
    const strengths = [];
    const kcHasProblems = /\d/.test(val(data.known_case) || '');
    if (r.problem_list_detail === 2 && kcHasProblems) strengths.push('Your problem list carries drug, dose and control status on every line — that is exactly what the next reader needs.');
    if (a.lines.length && a.withAction === a.lines.length) strengths.push('Every assessment line ends in an action. That habit is the hardest one to build and you have it.');
    if (a.withDirection) strengths.push('You showed direction on a value rather than a bare number — "' + (a.lines.find(l => /(→|->|rising|falling|up from|down from|trending)/i.test(l)) || '').slice(0, 70) + '". That is what makes a follow-up note useful.');
    if (r.problem_specific_negatives === 2) strengths.push('You worked through the red-flag screen and the problem-specific history rather than jumping to the plan.');
    if (r.safety_netting === 2 && val(data.er_instructions)) strengths.push('You wrote your own safety netting instead of leaving the default — and named specific symptoms.');
    if (val(data.deliberate_non_action)) strengths.push('You documented a deliberate non-action with its reason. That single line is what separates a decision from an omission.');
    if (!strengths.length) strengths.push('You completed the structured form rather than free-typing the note — that is the habit that makes the rest teachable.');
    out.push({ strength: strengths[0] });

    /* Improvements, in priority order. Only three are shown (T1), so the two that
       carry patient-safety weight — red flags and language that reaches the record —
       are pushed first and can never be crowded out by a formatting point. */
    const imps = [];

    /* Only nag when the assessment has NOT already carried the flag. Firing R4 at a
       clinician who did the right thing trains them to ignore the alerts. */
    const aLower = (val(data.assessment_lines) || '').toLowerCase();
    const flagsHandled = ctx.alerts.length > 0 && ctx.alerts.every(al => {
      const words = al.trigger.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const named = words.some(w => aLower.indexOf(w) >= 0);
      const escalates = /(not consistent with a benign|unresolved|urgent|refer|admit|same-day|rule out|exclude|cannot exclude|er\b)/i.test(aLower);
      return named || escalates;
    });
    if (flagsHandled) {
      out.push({ strength: 'You carried the red flag into the Assessment as an unresolved concern instead of writing a reassuring line around it. That is the judgement this whole tool exists to protect.' });
    }

    if (ctx.alerts.length && !flagsHandled) {
      imps.push({
        improve: 'You recorded ' + ctx.alerts.length + ' red flag' + (ctx.alerts.length > 1 ? 's' : '') +
          ' ("' + ctx.alerts.map(a => a.trigger).join('", "') + '"). The Assessment must carry ' +
          (ctx.alerts.length > 1 ? 'them' : 'it') + ' as an unresolved concern — a reassuring line that contradicts ' +
          (ctx.alerts.length > 1 ? 'them' : 'it') + ' will not survive review.',
        instead: 'Palpitation with ' + ctx.alerts[0].trigger.toLowerCase() +
          ': features not consistent with a benign cause; for urgent cardiology referral and same-day ECG',
        rule: 'R4 — red flags are surfaced, never smoothed over.',
      });
    }

    if (ctx.languageHits.length) {
      const h = ctx.languageHits[0];
      imps.push({
        improve: 'The note contained "' + h.found + '". Rewritten automatically before it reached the record.',
        instead: h.fix,
        rule: 'R6 — describe behaviour, never label the person; ' + h.why + '.',
      });
    }

    if (a.lines.length && a.withAction < a.lines.length) {
      const bad = a.lines.find(l => !/(^|[;:,]\s*)(for\b|continue|no change|refer|start|stop|increase|decrease|titrat|arrange|book|repeat|recheck|review|monitor)/i.test(l)) || '';
      imps.push({
        improve: a.lines.length - a.withAction + ' of your ' + a.lines.length + ' assessment lines end without an action: "' + bad.slice(0, 70) + '".',
        instead: bad.replace(/[.;]\s*$/, '') + '; for [investigation / referral / no change today]',
        rule: 'A1 — a line with no action is an unfinished thought.',
      });
    }

    if (a.lines.length && a.withNumber < a.lines.length) {
      imps.push({
        improve: 'Some assessment lines carry no number. "Uncontrolled" without a value cannot be compared at the next visit.',
        instead: 'T2DM (uncontrolled, HbA1c 8.4%): adherence gaps identified; for dietitian referral and recheck 3/12',
        rule: 'A2 — put the number in.',
      });
    }

    if (r.problem_list_detail < 2 && (val(data.known_case) || '').trim()) {
      imps.push({
        improve: 'The problem list is not carrying enough detail. A bare diagnosis name tells the next reader nothing.',
        instead: 'HTN: on Amlodipine 5mg OD, controlled, home readings 125-135/75-85',
        rule: 'House format — drug + dose + frequency + control status on every line.',
      });
    }

    if (ctx.erAuto || ctx.fuAuto) {
      imps.push({
        improve: 'Safety netting was auto-suggested for you (' + (ctx.erAuto ? 'ER instructions' : '') +
          (ctx.erAuto && ctx.fuAuto ? ' and ' : '') + (ctx.fuAuto ? 'follow-up interval' : '') + '). Read it and make it specific to this patient before you sign.',
        instead: 'ER instructions were provided clearly (' + visit.er + ')',
        rule: 'R5 — every note ends with safety netting, and generic wording protects nobody.',
      });
    }

    if (ctx.missing.length && !imps.length) {
      imps.push({
        improve: ctx.missing.length + ' field' + (ctx.missing.length > 1 ? 's are' : ' is') + ' still a placeholder in the note.',
        instead: 'Fill ' + ctx.missing[0].label + ' before signing — the note is blocked from copying until none remain.',
        rule: 'R1 — never fill a gap with a plausible guess.',
      });
    }

    if (val(data.disagreement) !== 'No' && !(val(data.disagreement_what) && val(data.disagreement_action))) {
      imps.push({
        improve: 'A patient disagreement is recorded but the four-part sequence is incomplete.',
        instead: 'explained in detail, but still insisting; not ordered, rationale documented; targeted ultrasound offered and accepted',
        rule: 'A6 — what you explained, that they disagreed, what you did, what you offered instead.',
      });
    }

    /* T5: progress across stored rubrics */
    const hist = loadHistory();
    if (hist.length >= 3) {
      const last3 = hist.slice(-3);
      if (last3.every(h => h.assessment_actionable === 2)) {
        out.push({ strength: 'Your assessment lines have carried actions in all three of your last notes — that habit is set.' });
      } else if (r.total > (hist[hist.length - 1] || {}).total) {
        out.push({ strength: 'Your rubric total moved from ' + hist[hist.length - 1].total + ' to ' + r.total + ' since your last note.' });
      }
    }

    return out.concat(imps.slice(0, 3));
  }

  /* ================= RUBRIC HISTORY ================= */
  const HIST_KEY = 'fm.note.rubric';
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HIST_KEY)) || []; } catch (e) { return []; }
  }
  function saveRubric(r, visitId) {
    try {
      const h = loadHistory();
      h.push({ t: Date.now(), visit: visitId, total: r.total,
        assessment_actionable: r.assessment_actionable, safety_netting: r.safety_netting });
      localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(-20)));
    } catch (e) {}
  }

  /* ================= MODE: CRITIQUE ================= */
  /* Input: a note the intern already wrote. Output: rubric + teaching + a corrected
     Assessment section only. Rewriting the whole note teaches nothing. */
  function critique(text) {
    const sec = (name) => {
      const re = new RegExp(name + ':\\s*\\n([\\s\\S]*?)(?=\\n\\s*\\n[A-Z]|\\n(?:Objective|Labs|Assessment|Plan|Subjective)\\b|$)', 'i');
      const m = text.match(re);
      return m ? m[1].trim() : '';
    };
    const assessBlock = sec('Assessment');
    const planBlock = sec('Plan');
    const a = analyseAssessment(assessBlock.replace(/^[-•]\s*/gm, ''));
    const lang = neutralise(text);
    const ids = stripIdentifiers(text);

    const kcLines = (text.match(/^- .+$/gm) || []).slice(0, 6);
    const detailed = kcLines.filter(l => /\d/.test(l) && /(on |following with|controlled|uncontrolled|stable)/i.test(l)).length;

    const r = {
      problem_list_detail: !kcLines.length ? 0 : (detailed >= kcLines.length * 0.8 ? 2 : detailed ? 1 : 0),
      problem_specific_negatives: /(-ive|no |denies|red flag|negative)/i.test(text) ? (/(red flag|screened)/i.test(text) ? 2 : 1) : 0,
      assessment_actionable: !a.lines.length ? 0 : ((a.withAction === a.lines.length ? 1 : 0) + (a.withNumber >= Math.ceil(a.lines.length / 2) ? 1 : 0)),
      defensive_documentation: (/(rationale documented|offered and accepted|avoided due to|not ordered|no indication for)/i.test(text) ? 2 : /(explained)/i.test(text) ? 1 : 0) - (lang.hits.length ? 1 : 0),
      safety_netting: (/ER instructions/i.test(planBlock) ? 1 : 0) + (/follow up after/i.test(planBlock) ? 1 : 0),
    };
    r.defensive_documentation = Math.max(0, r.defensive_documentation);
    r.total = r.problem_list_detail + r.problem_specific_negatives + r.assessment_actionable
      + r.defensive_documentation + r.safety_netting;

    const teaching = [];
    teaching.push({ strength: a.lines.length && a.withAction === a.lines.length
      ? 'Every assessment line already ends in an action — that is the habit most interns take a year to build.'
      : a.withNumber ? 'You put numbers in your assessment rather than adjectives. Keep that.'
      : 'You wrote a structured note with the house sections in order.' });

    if (lang.hits.length) teaching.push({
      improve: 'The note contains "' + lang.hits[0].found + '".',
      instead: lang.hits[0].fix, rule: 'R6 — describe behaviour, never label the person.' });
    if (ids.found) teaching.push({
      improve: 'The note contains what looks like a patient identifier.',
      instead: 'Age and sex only — remove MRN, phone and full date of birth.', rule: 'R3 — no patient identifiers.' });
    if (a.lines.length && a.withAction < a.lines.length) teaching.push({
      improve: (a.lines.length - a.withAction) + ' assessment line(s) end without an action.',
      instead: (a.lines.find(l => !ACTION_RE.test(l)) || '').slice(0, 70) + '; for [action]',
      rule: 'A1 — a line with no action is an unfinished thought.' });
    if (a.lines.length && a.withNumber < a.lines.length) teaching.push({
      improve: 'Not every assessment line carries a number.',
      instead: 'T2DM (uncontrolled, HbA1c 8.4%): ... ; for dietitian referral and recheck 3/12',
      rule: 'A2 — put the number in.' });
    if (r.safety_netting < 2) teaching.push({
      improve: 'Safety netting is incomplete in the Plan.',
      instead: '- ER instructions were provided clearly (in case of chest pain, syncope, or severe SOB)\n- Follow up after 3/12 - self booking instructions given clearly',
      rule: 'R5 — every note ends with safety netting.' });

    const weakest = [
      ['assessment_actionable', r.assessment_actionable, 'End every assessment line with an action, and put the number in.'],
      ['safety_netting', r.safety_netting, 'Name the specific symptoms that should bring them back.'],
      ['problem_list_detail', r.problem_list_detail, 'Put drug, dose and control status on every problem-list line.'],
      ['defensive_documentation', r.defensive_documentation, 'Record what you deliberately did not do, and why.'],
      ['problem_specific_negatives', r.problem_specific_negatives, 'Document the specific negatives for this complaint.'],
    ].sort((x, y) => x[1] - y[1])[0];
    r.one_line_verdict = r.total >= 9 ? 'Strong note — keep this structure.' : weakest[2];

    /* corrected Assessment only */
    let corrected = a.lines.map(l => {
      let s = l.replace(/^[-•]\s*/, '');
      s = neutralise(s).text;
      if (!ACTION_RE.test(s)) s = s.replace(/[.;]\s*$/, '') + '; for ' + PH('action');
      if (!/\d/.test(s)) s = s.replace(/^([^:(]+)/, '$1 (' + PH('qualifier + number') + ')');
      return '- ' + s;
    }).join('\n');
    if (!a.lines.length) corrected = '- ' + PH('assessment — one line per problem');

    return { rubric: r, teaching: teaching.slice(0, 5), corrected: corrected };
  }

  /* ================= MODE: EXPAND ================= */
  /* Shorthand → full note with every unsupplied element as an explicit placeholder. */
  function expand(short) {
    const d = {};
    const t = ' ' + short.replace(/\s+/g, ' ').trim() + ' ';

    const ageSex = t.match(/\b(\d{1,3})\s*(?:y\/o|yo|yrs?|years?)?\s*([MFmf])\b/) || t.match(/\b(\d{1,3})\s*(male|female)\b/i);
    if (ageSex) {
      d.age = ageSex[1];
      const s = ageSex[2].toLowerCase();
      d.sex = (s === 'f' || s === 'female') ? 'female' : 'male';
    }
    const bp = t.match(/\b(\d{2,3})\s*\/\s*(\d{2,3})\b/);
    if (bp) { d.sbp = bp[1]; d.dbp = bp[2]; }
    const hr = t.match(/\b(?:hr|pulse)\s*:?\s*(\d{2,3})\b/i);
    if (hr) d.hr = hr[1];
    const temp = t.match(/\b(?:t|temp)\s*:?\s*(3[5-9](?:\.\d)?|4[0-2](?:\.\d)?)\b/i);
    if (temp) d.temp = temp[1];
    const spo2 = t.match(/\b(?:spo2|sats?|o2)\s*:?\s*(\d{2,3})\s*%?/i);
    if (spo2) d.spo2 = spo2[1];

    const labBits = [];
    const a1c = t.match(/\ba1c\s*:?\s*(\d{1,2}(?:\.\d)?)\s*%?/i);
    if (a1c) {
      const prev = t.match(/\ba1c[^,;]*?(?:up |down |from )\s*(\d{1,2}(?:\.\d)?)/i);
      labBits.push('HbA1c ' + a1c[1] + '%' + (prev ? ' (was ' + prev[1] + '%)' : ''));
    }
    [['ldl', 'LDL'], ['egfr', 'eGFR'], ['tsh', 'TSH'], ['hb', 'Hb'], ['cr', 'Creatinine'], ['k', 'K']].forEach(p => {
      const m = t.match(new RegExp('\\b' + p[0] + '\\s*:?\\s*(\\d{1,3}(?:\\.\\d+)?)\\b', 'i'));
      if (m && p[0] !== 'k') labBits.push(p[1] + ' ' + m[1]);
    });
    if (labBits.length) d.labs = labBits.join('\n');

    const COND = [
      [/\bdm2?\b|\bt2dm\b|diabet/i, 'T2DM'], [/\bhtn\b|hypertens/i, 'HTN'],
      [/\bdyslipid|\bhld\b|cholesterol/i, 'Dyslipidaemia'], [/\bckd\b/i, 'CKD'],
      [/\bhypothyroid|\bhypothyro/i, 'Hypothyroidism'], [/\basthma\b/i, 'Asthma'],
      [/\bcopd\b/i, 'COPD'], [/\bosteopor/i, 'Osteoporosis'], [/\baf\b|atrial fib/i, 'AF'],
      [/\bihd\b|\bcad\b/i, 'IHD'], [/\bobes/i, 'Obesity'], [/\bgout\b/i, 'Gout'],
    ];
    const found = COND.filter(c => c[0].test(t)).map(c => c[1]);
    if (found.length) {
      d.known_case = found.map(c => c + ': ' + PH('drug + dose + frequency, control status')).join('\n');
    }

    if (/\bmiss\w*\s+(?:the\s+)?(?:evening|morning|night)?\s*dose/i.test(t) || /\bmisses\b/i.test(t)) {
      d.adherence = 'Admits missing doses occasionally';
    }
    if (/non[- ]?smok/i.test(t)) d.smoking = 'Non-smoker';
    else if (/\bex[- ]?smok/i.test(t)) d.smoking = 'Ex-smoker';
    else if (/\bsmok/i.test(t)) d.smoking = 'Smoker';

    /* One ordered chain. Every pattern is anchored on word boundaries — without them
       "routine" matches "uti" and every chronic follow-up is read as a urinary visit. */
    let visitId;
    if (/\bpalpitat\w*\b/i.test(t)) visitId = 'palpitation';
    else if (/\bchest pain\b/i.test(t)) visitId = 'chest-pain';
    else if (/\bheadaches?\b|\bmigraine\b/i.test(t)) visitId = 'headache';
    else if (/\bback pain\b|\bsciatica\b/i.test(t)) visitId = 'back-pain';
    else if (/\bdizz\w*\b|\bvertigo\b/i.test(t)) visitId = 'dizziness';
    else if (/\bfalls?\b|\bfell\b/i.test(t)) visitId = 'falls';
    else if (/\bmemory\b|\bforgetful\w*\b|\bdementia\b/i.test(t)) visitId = 'memory';
    else if (/\bsore throat\b|\btonsil\w*\b/i.test(t)) visitId = 'sore-throat';
    else if (/\bdysuria\b|\burinary\b|\buti\b/i.test(t)) visitId = 'dysuria';
    else if (/\bsob\b|\bcough\b|\bbreathless\w*\b|\bwheez\w*\b/i.test(t)) visitId = 'dyspnea';
    else if (/\bfatigue\b|\btired\w*\b/i.test(t)) visitId = 'fatigue';
    else if (/\babdo\w*\b|\babdominal pain\b/i.test(t)) visitId = 'abdo-pain';
    else if (/\bjoint pain\b|\barthrit\w*\b/i.test(t)) visitId = 'joint-pain';
    else if (found.length) visitId = 'chronic';
    else if (/\broutine\b|\brefill\b|\blabs?\b/i.test(t)) visitId = 'routine';
    else visitId = 'other';

    const raw = short.trim();
    if (visitId === 'chronic') d.control_status = raw;
    else if (visitId !== 'routine') d.hpi_detail = raw;
    if (/\broutine\b/i.test(t)) { d.visit_reason = 'routine'; }

    const visit = window.NOTE_VISITS.find(v => v.id === visitId) || window.NOTE_VISITS[0];
    const built = buildNote(visit, d);
    built.visit = visit;
    built.parsed = d;
    return built;
  }

  window.NoteEngine = {
    build: buildNote,
    critique: critique,
    expand: expand,
    saveRubric: saveRubric,
    history: loadHistory,
    analyseAssessment: analyseAssessment,
  };
})();
