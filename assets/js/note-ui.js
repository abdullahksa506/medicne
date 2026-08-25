/* FM Progress Note Assistant — user interface */

(function () {
  'use strict';

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* live form state, survives navigation within the session */
  let DATA = {};
  let VISIT = null;
  let RESULT = null;
  const SKEY = 'fm.note.draft';

  function saveDraft() {
    try { sessionStorage.setItem(SKEY, JSON.stringify({ v: VISIT && VISIT.id, d: DATA })); } catch (e) {}
  }
  function loadDraft(visitId) {
    try {
      const s = JSON.parse(sessionStorage.getItem(SKEY));
      if (s && s.v === visitId) return s.d || {};
    } catch (e) {}
    return {};
  }

  /* ============ practice scenarios (mode = drill) ============ */
  const DRILLS = [
    {
      id: 'd1', level: 'Straightforward',
      stem: '62 y/o married female, non-smoker, known T2DM on Metformin 1g BD and HTN on Amlodipine 5mg OD. ' +
        'Routine follow-up for lab results. Feels well. HbA1c 7.9%, was 7.2% six months ago. Admits missing the evening ' +
        'Metformin dose two to three times a week. Home BP readings 125-135/75-85. BP today 128/78, HR 76, T 36.8, SpO2 98%. ' +
        'Foot exam normal, fundus up to date.',
      ask: 'Write the Assessment section only — one line per problem.',
      model: '- T2DM (uncontrolled, HbA1c 7.9%, rising from 7.2%): adherence gap identified — missing evening dose 2-3x/week; for adherence counselling and dietitian referral, recheck 3/12\n' +
        '- HTN (controlled, 128/78, home readings consistent): no change today',
      points: ['Both lines end in an action (A1).', 'Both carry a number (A2).',
        'The diabetes line shows direction, not a bare value (A3).', 'The hypertension line is explicitly marked "no change today" rather than left silent (A7).'],
    },
    {
      id: 'd2', level: 'Red flag hidden in a routine visit',
      stem: '55 y/o male, smoker 25 pack-year, known dyslipidaemia on Atorvastatin 20mg. Came for a routine refill. ' +
        'Mentions in passing that for the last three weeks he gets a central chest heaviness when he walks up the hill to ' +
        'his house, which settles after a few minutes of rest. No pain at rest. BP 142/88, HR 80, ECG today shows sinus ' +
        'rhythm with no acute changes.',
      ask: 'Write the Assessment section. Decide what the leading problem is.',
      model: '- Exertional chest pain (3 weeks, reproducible on exertion and relieved by rest, ECG today with no acute changes): ' +
        'features consistent with stable angina in a patient with multiple risk factors — a normal resting ECG does not exclude it; ' +
        'for urgent cardiology referral, aspirin and GTN started, discussed same-day ER return criteria\n' +
        '- Dyslipidaemia (on Atorvastatin 20mg, LDL not available today): for high-intensity statin given the new presentation; lipid panel requested\n' +
        '- Smoking (25 pack-year): cessation advice given, referred to cessation clinic; also meets criteria for lung cancer screening',
      points: ['The exertional pain goes first — the problem acted on today leads (A7).',
        'The reassuring ECG is named and explicitly not allowed to close the case (R4).',
        'Statin intensity is revisited because the clinical picture changed.',
        'The pack-year number triggers a screening action rather than sitting as a descriptor.'],
    },
    {
      id: 'd3', level: 'Patient disagreement',
      stem: '38 y/o female, no chronic illness. Two months of tiredness. Sleeps 5 hours a night, two young children. ' +
        'No weight loss, no night sweats, no lymphadenopathy, no bleeding. Exam normal, no pallor. She is asking for a ' +
        'full body MRI because a relative was recently diagnosed with cancer. You explained why it is not indicated, she ' +
        'was not satisfied, you offered a targeted blood panel and she accepted.',
      ask: 'Write the Assessment section, including how you document the disagreement.',
      model: '- Fatigue (2 months, with a clearly identified sleep deficit of ~5 hours/night, no B symptoms, examination normal): ' +
        'most consistent with sleep insufficiency; for CBC, ferritin, TSH, vitamin D to exclude common reversible causes, and sleep hygiene counselling\n' +
        '- Request for whole-body MRI: explained in detail that it is not indicated in the absence of red flags and carries incidental-finding harm, ' +
        'but still insisting; not ordered, rationale documented; targeted blood panel offered and accepted\n' +
        '- Family history of malignancy: reviewed, does not currently change screening thresholds; no indication for imaging at this stage',
      points: ['The disagreement uses all four parts in order (A6).',
        'The negatives she does not have are named — that is what shows the differential (A4).',
        'The deliberate non-action carries its reason (A5).',
        '"Still insisting" describes behaviour; "demanding" would label the person (R6).'],
    },
    {
      id: 'd4', level: 'Geriatric complexity',
      stem: '81 y/o male, lives with his daughter. Known T2DM on Gliclazide 80mg BD and Insulin glargine 20 units nocte, ' +
        'HTN on Amlodipine 10mg and Indapamide, osteoarthritis on regular Ibuprofen. Two falls in the last four months, ' +
        'both on standing up at night. HbA1c 6.4%. BP 148/78 lying, 122/70 standing. eGFR 41. Clinical Frailty Scale 6.',
      ask: 'Write the Assessment section. There are at least four problems here worth a line each.',
      model: '- Recurrent falls (2 in 4 months, both postural, orthostatic drop 26 systolic confirmed today, CFS 6): ' +
        'multifactorial with a dominant drug contribution; for medication review as below, physiotherapy referral and home hazard assessment\n' +
        '- T2DM (overtreated, HbA1c 6.4% on Gliclazide and insulin, target for this frailty level is <8.0-8.5%): ' +
        'for Gliclazide stopped and glargine reduced to 14 units, recheck 6/52\n' +
        '- HTN (148/78 lying but 122/70 standing with symptoms): for Indapamide stopped and postural BP rechecked 2/52; ' +
        'standing readings will guide any further change\n' +
        '- Osteoarthritis on regular NSAID with eGFR 41: Ibuprofen stopped given renal impairment and fall risk; ' +
        'for regular Paracetamol 1g TDS and topical Diclofenac',
      points: ['The frailty score is used as a number that sets the targets, not as a label (A2).',
        'HbA1c 6.4% is correctly read as overtreatment rather than success — the commonest miss in this age group.',
        'Each drug change carries a specific new dose and a recheck interval (A1).',
        'The NSAID line documents a stop with its reason — deliberate non-action made explicit (A5).'],
    },
  ];

  /* ============ shared render helpers ============ */

  function fieldControl(f, onChange) {
    const wrap = el('div', 'field');
    const lab = el('label', null, esc(f.en) + (f.required ? ' <span class="req">*</span>' : ''));
    wrap.appendChild(lab);
    if (f.why) wrap.appendChild(el('div', 'field__why', esc(f.why)));

    const set = v => { DATA[f.id] = v; saveDraft(); onChange(); };

    if (f.type === 'multiselect') {
      const cur = () => Array.isArray(DATA[f.id]) ? DATA[f.id] : [];
      const box = el('div', 'chips');
      (f.options || []).forEach(o => {
        const c = el('button', 'chip' + (f.redFlags && f.redFlags.indexOf(o) >= 0 ? ' chip--flag' : ''), esc(o));
        c.type = 'button';
        const sync = () => c.setAttribute('aria-pressed', String(cur().indexOf(o) >= 0));
        c.addEventListener('click', () => {
          let a = cur().slice();
          const NONE = 'None of the above';
          if (o === NONE) a = a.indexOf(NONE) >= 0 ? [] : [NONE];
          else {
            a = a.filter(x => x !== NONE);
            const i = a.indexOf(o);
            if (i >= 0) a.splice(i, 1); else a.push(o);
          }
          set(a);
          [...box.children].forEach(ch => { if (ch.dataset.opt !== undefined) ch.setAttribute('aria-pressed', String(a.indexOf(ch.textContent) >= 0)); });
        });
        c.dataset.opt = '1';
        sync();
        box.appendChild(c);
      });
      wrap.appendChild(box);
      if (f.allowCustom) {
        const extra = el('input');
        extra.type = 'text';
        extra.placeholder = 'Add your own…';
        extra.addEventListener('change', () => {
          if (!extra.value.trim()) return;
          const a = cur().slice();
          a.push(extra.value.trim());
          set(a);
          extra.value = '';
          renderCustom();
        });
        wrap.appendChild(extra);
        const customBox = el('div', 'chips');
        wrap.appendChild(customBox);
        const renderCustom = () => {
          customBox.innerHTML = '';
          cur().filter(x => (f.options || []).indexOf(x) < 0).forEach(x => {
            const c = el('button', 'chip', esc(x) + ' ×');
            c.type = 'button';
            c.setAttribute('aria-pressed', 'true');
            c.addEventListener('click', () => { set(cur().filter(y => y !== x)); renderCustom(); });
            customBox.appendChild(c);
          });
        };
        renderCustom();
      }
    } else if (f.type === 'select') {
      const s = el('select');
      s.appendChild(el('option', null, '— select —'));
      (f.options || []).forEach(o => { const op = el('option', null, esc(o)); op.value = o; s.appendChild(op); });
      if (f.allowCustom) { const op = el('option', null, 'Other…'); op.value = '__other'; s.appendChild(op); }
      if (DATA[f.id]) s.value = DATA[f.id];
      const other = el('input');
      other.type = 'text';
      other.placeholder = f.example ? 'e.g. ' + f.example : 'Type your own';
      other.hidden = true;
      other.addEventListener('input', () => set(other.value));
      s.addEventListener('change', () => {
        if (s.value === '__other') { other.hidden = false; other.focus(); set(''); }
        else { other.hidden = true; set(s.value === '— select —' ? '' : s.value); }
      });
      wrap.appendChild(s);
      wrap.appendChild(other);
    } else if (f.type === 'textarea') {
      const t = el('textarea');
      t.placeholder = f.example ? 'e.g. ' + f.example : '';
      if (DATA[f.id]) t.value = DATA[f.id];
      t.addEventListener('input', () => set(t.value));
      wrap.appendChild(t);
    } else {
      const i = el('input');
      i.type = f.type === 'number' ? 'number' : 'text';
      if (f.type === 'number') i.inputMode = 'decimal';
      i.placeholder = f.example ? 'e.g. ' + f.example : '';
      if (DATA[f.id]) i.value = DATA[f.id];
      i.addEventListener('input', () => set(i.value));
      wrap.appendChild(i);
    }
    return wrap;
  }

  /* ============ page: hub ============ */
  function pageHub(view, setTop, showSearch) {
    view.classList.add('en');
    setTop('Progress Note', false);
    showSearch(false);

    view.appendChild(el('div', 'note-hero',
      '<div class="note-hero__t">FM Progress Note Assistant</div>' +
      '<div class="note-hero__d">Structured OPD notes in house format — and feedback that teaches you to write them without it. ' +
      'Every note is a <b>draft</b> the treating physician must read, correct and sign.</div>'));

    const hist = window.NoteEngine.history();
    if (hist.length) {
      const last = hist.slice(-5);
      const avg = (last.reduce((a, b) => a + b.total, 0) / last.length).toFixed(1);
      view.appendChild(el('div', 'note-hero__stat',
        'Last ' + last.length + ' notes — average rubric ' + avg + '/10 · latest ' + last[last.length - 1].total + '/10'));
    }

    view.appendChild(el('div', 'sec-title', 'Modes'));
    const modes = [
      { t: 'Write a note', d: 'Pick the visit type, fill an adaptive form, get the note plus feedback', r: '#/note/new' },
      { t: 'Critique my note', d: 'Paste a note you wrote — get the rubric and a corrected Assessment', r: '#/note/critique' },
      { t: 'Quick expand', d: 'Shorthand in, full note out, every gap left as a visible placeholder', r: '#/note/expand' },
      { t: 'Practice', d: 'Worked scenarios with a model answer and the rules behind it', r: '#/note/drill' },
    ];
    const list = el('div', 'list');
    modes.forEach(m => {
      const a = el('a', 'row');
      a.href = m.r;
      a.innerHTML = '<span class="row__body"><span class="row__t">' + m.t + '</span><span class="row__d">' + m.d + '</span></span>' +
        '<span class="row__chev"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></span>';
      list.appendChild(a);
    });
    view.appendChild(list);

    view.appendChild(el('div', 'note-rules',
      '<b>House rules this tool enforces</b>' +
      '<ul>' +
      '<li>It never invents a finding, a vital sign, a lab value or a diagnosis. Gaps become <span class="ph">[ TO COMPLETE: … ]</span> and the copy button stays locked until none remain.</li>' +
      '<li>Red flags you entered are surfaced as unresolved concerns — they are never smoothed into a reassuring line.</li>' +
      '<li>Judgemental words are rewritten neutrally before they reach the record, and you are told which and why.</li>' +
      '<li>Patient identifiers are stripped. Age and sex only.</li>' +
      '<li>Every note ends with ER instructions and a follow-up interval.</li>' +
      '</ul>'));
  }

  /* ============ page: visit picker ============ */
  function pageVisitPicker(view, setTop, showSearch) {
    view.classList.add('en');
    setTop('Choose visit type', true);
    showSearch(false);
    view.appendChild(el('div', 'note-note',
      'The form adapts to the complaint — a palpitation visit and a diabetes follow-up do not produce the same fields.'));
    const list = el('div', 'list');
    window.NOTE_VISITS.forEach(v => {
      const a = el('a', 'row');
      a.href = '#/note/new/' + v.id;
      a.innerHTML = '<span class="row__body"><span class="row__t">' + esc(v.label) + '</span>' +
        '<span class="row__d">' + esc(v.ar) + '</span></span>' +
        (v.geri ? '<span class="row__tag">كبار السن</span>' : '') +
        '<span class="row__chev"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></span>';
      list.appendChild(a);
    });
    view.appendChild(list);
  }

  /* ============ page: the form ============ */
  function pageForm(view, setTop, showSearch, visitId) {
    view.classList.add('en');
    const v = window.NOTE_VISITS.find(x => x.id === visitId);
    if (!v) { view.appendChild(el('div', 'empty', 'Unknown visit type.')); return; }
    if (!VISIT || VISIT.id !== v.id) { VISIT = v; DATA = loadDraft(v.id); }
    setTop(v.label, true);
    showSearch(false);

    const progress = el('div', 'note-progress');
    view.appendChild(progress);

    const sections = window.noteSectionsFor(v);
    const allRequired = [];
    sections.forEach(s => s.fields.forEach(f => { if (f.required) allRequired.push(f.id); }));

    const update = () => {
      const done = allRequired.filter(id => {
        const x = DATA[id];
        return Array.isArray(x) ? x.length : (x !== undefined && x !== null && String(x).trim() !== '');
      }).length;
      const pct = Math.round(done / allRequired.length * 100);
      progress.innerHTML = '<div class="note-progress__bar"><span style="width:' + pct + '%"></span></div>' +
        '<div class="note-progress__t">' + done + ' of ' + allRequired.length + ' required fields</div>';
    };

    sections.forEach(s => {
      view.appendChild(el('div', 'sec-title', s.title + ' · ' + s.ar));
      const card = el('div', 'card');
      s.fields.forEach(f => card.appendChild(fieldControl(f, update)));
      view.appendChild(card);
    });

    const btns = el('div', 'btnrow btnrow--sticky');
    const go = el('button', 'btn btn--row', 'Generate note');
    go.addEventListener('click', () => {
      RESULT = window.NoteEngine.build(v, DATA);
      RESULT.visit = v;
      window.NoteEngine.saveRubric(RESULT.rubric, v.id);
      location.hash = '#/note/result';
    });
    const clr = el('button', 'btn btn--row btn--ghost', 'Clear');
    clr.addEventListener('click', () => {
      if (!confirm('Clear all entered data for this visit?')) return;
      DATA = {}; saveDraft(); location.hash = '#/note/new/' + v.id; location.reload();
    });
    btns.append(go, clr);
    view.appendChild(btns);
    update();
  }

  /* ============ page: result ============ */
  function pageResult(view, setTop, showSearch, toast, copyText) {
    view.classList.add('en');
    if (!RESULT) { location.hash = '#/note'; return; }
    const R = RESULT;
    setTop('Generated note', true);
    showSearch(false);

    /* safety alerts need a human decision — never auto-applied */
    if (R.alerts.length) {
      view.appendChild(el('div', 'sec-title', 'Safety alerts — ' + R.alerts.length));
      R.alerts.forEach((a, i) => {
        const c = el('div', 'alert');
        c.innerHTML = '<div class="alert__t">' + esc(a.trigger) + '</div>' +
          '<div class="alert__d">' + esc(a.concern) + '</div>' +
          '<div class="alert__q">' + esc(a.question) + '</div>';
        const row = el('div', 'btnrow');
        const acc = el('button', 'btn btn--row', 'Acknowledge');
        const dis = el('button', 'btn btn--row btn--ghost', 'Dismiss');
        const mark = (choice) => {
          c.classList.add('alert--decided');
          row.innerHTML = '<div class="alert__done">' + (choice === 'ack' ? 'Acknowledged' : 'Dismissed') + ' — logged</div>';
          try {
            const k = 'fm.note.alertlog';
            const log = JSON.parse(localStorage.getItem(k) || '[]');
            log.push({ t: Date.now(), visit: R.visit.id, trigger: a.trigger, choice: choice });
            localStorage.setItem(k, JSON.stringify(log.slice(-100)));
          } catch (e) {}
        };
        acc.addEventListener('click', () => mark('ack'));
        dis.addEventListener('click', () => mark('dismiss'));
        row.append(acc, dis);
        c.appendChild(row);
        view.appendChild(c);
      });
    }

    if (R.identifierStripped) {
      view.appendChild(el('div', 'note--warn note-note',
        'A patient identifier was detected and left out of the note. Age and sex only.'));
    }

    /* missing */
    if (R.missing.length) {
      view.appendChild(el('div', 'sec-title', 'To complete — ' + R.missing.length));
      const card = el('div', 'card');
      const ul = el('ul');
      R.missing.forEach(m => ul.appendChild(el('li', null,
        '<b>' + esc(m.label) + '</b>' + (m.why ? '<span class="miss__why">' + esc(m.why) + '</span>' : ''))));
      card.appendChild(ul);
      view.appendChild(card);
    }

    if (R.autoSuggested.length) {
      view.appendChild(el('div', 'note-note',
        'Auto-suggested for you: <b>' + R.autoSuggested.join(', ') + '</b>. Read and adjust before signing.'));
    }

    /* the note */
    view.appendChild(el('div', 'sec-title', 'Note'));
    const pre = el('pre', 'notebox');
    pre.innerHTML = esc(R.note).replace(/\[ TO COMPLETE: ([^\]]+) \]/g,
      '<span class="ph">[ TO COMPLETE: $1 ]</span>');
    view.appendChild(pre);

    const btns = el('div', 'btnrow');
    const copy = el('button', 'btn btn--row', 'Copy note');
    if (R.placeholderCount > 0) {
      copy.disabled = true;
      copy.classList.add('btn--locked');
      copy.textContent = 'Copy locked — ' + R.placeholderCount + ' to complete';
    }
    copy.addEventListener('click', () => copyText(R.note));
    const back = el('button', 'btn btn--row btn--ghost', 'Back to form');
    back.addEventListener('click', () => { location.hash = '#/note/new/' + R.visit.id; });
    btns.append(copy, back);
    view.appendChild(btns);

    if (R.placeholderCount > 0) {
      const ov = el('button', 'btn btn--ghost btn--small', 'Copy anyway with placeholders visible');
      ov.addEventListener('click', () => {
        if (!confirm('The note still contains ' + R.placeholderCount + ' placeholder(s). Copy it anyway?')) return;
        copyText(R.note);
      });
      view.appendChild(ov);
    }

    renderRubric(view, R.rubric);
    renderTeaching(view, R.teaching);

    view.appendChild(el('p', 'disclaimer',
      'This is a draft. The treating physician must read, correct and sign it.'));
  }

  function renderRubric(view, r) {
    view.appendChild(el('div', 'sec-title', 'Rubric — ' + r.total + '/10'));
    const card = el('div', 'card');
    const rows = [
      ['Problem list detail', r.problem_list_detail],
      ['Problem-specific negatives', r.problem_specific_negatives],
      ['Assessment actionable', r.assessment_actionable],
      ['Defensive documentation', r.defensive_documentation],
      ['Safety netting', r.safety_netting],
    ];
    rows.forEach(row => {
      const d = el('div', 'rub');
      d.innerHTML = '<span class="rub__t">' + row[0] + '</span>' +
        '<span class="rub__dots">' + [0, 1].map(i =>
          '<i class="' + (row[1] > i ? 'on' : '') + '"></i>').join('') + '</span>' +
        '<span class="rub__n">' + row[1] + '/2</span>';
      card.appendChild(d);
    });
    card.appendChild(el('div', 'rub__verdict', '<b>Fix first:</b> ' + esc(r.one_line_verdict)));
    view.appendChild(card);
  }

  function renderTeaching(view, teaching) {
    if (!teaching || !teaching.length) return;
    view.appendChild(el('div', 'sec-title', 'Teaching'));
    teaching.forEach(t => {
      if (t.strength) {
        view.appendChild(el('div', 'teach teach--good',
          '<div class="teach__lbl">What you did well</div><div>' + esc(t.strength) + '</div>'));
      } else {
        const c = el('div', 'teach');
        c.innerHTML = '<div class="teach__lbl">Improve</div><div>' + esc(t.improve) + '</div>' +
          (t.instead ? '<div class="teach__lbl">Instead</div><pre class="teach__fix">' + esc(t.instead) + '</pre>' : '') +
          (t.rule ? '<div class="teach__rule">' + esc(t.rule) + '</div>' : '');
        view.appendChild(c);
      }
    });
  }

  /* ============ page: critique ============ */
  function pageCritique(view, setTop, showSearch, toast, copyText) {
    view.classList.add('en');
    setTop('Critique my note', true);
    showSearch(false);
    view.appendChild(el('div', 'note-note',
      'Paste a note you already wrote. You get the rubric, the teaching points, and a corrected <b>Assessment section only</b> — ' +
      'rewriting the whole note for you teaches nothing.'));
    const card = el('div', 'card');
    const ta = el('textarea');
    ta.style.minHeight = '220px';
    ta.placeholder = 'Paste the full note here…';
    card.appendChild(ta);
    view.appendChild(card);

    const out = el('div');
    const btn = el('button', 'btn', 'Critique');
    btn.addEventListener('click', () => {
      const t = ta.value.trim();
      if (t.length < 40) { toast('Paste a longer note'); return; }
      const c = window.NoteEngine.critique(t);
      out.innerHTML = '';
      renderRubric(out, c.rubric);
      renderTeaching(out, c.teaching);
      out.appendChild(el('div', 'sec-title', 'Corrected Assessment'));
      const pre = el('pre', 'notebox');
      pre.innerHTML = esc(c.corrected).replace(/\[ TO COMPLETE: ([^\]]+) \]/g, '<span class="ph">[ TO COMPLETE: $1 ]</span>');
      out.appendChild(pre);
      const cp = el('button', 'btn btn--ghost', 'Copy corrected Assessment');
      cp.addEventListener('click', () => copyText(c.corrected));
      out.appendChild(cp);
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    view.appendChild(btn);
    view.appendChild(out);
  }

  /* ============ page: expand ============ */
  function pageExpand(view, setTop, showSearch, toast, copyText) {
    view.classList.add('en');
    setTop('Quick expand', true);
    showSearch(false);
    view.appendChild(el('div', 'note-note',
      'The fast path for a busy clinic. Type shorthand — everything it cannot read from you becomes a visible placeholder. ' +
      'The placeholders are what keep it honest.'));
    const card = el('div', 'card');
    const ta = el('textarea');
    ta.placeholder = 'e.g. 55F DM2 HTN routine, A1c 8.1 up from 7.4, misses evening dose, BP 138/84, HR 78, T 36.7, SpO2 98';
    card.appendChild(ta);
    view.appendChild(card);
    const out = el('div');
    const btn = el('button', 'btn', 'Expand to note');
    btn.addEventListener('click', () => {
      const t = ta.value.trim();
      if (t.length < 8) { toast('Type a little more'); return; }
      const R = window.NoteEngine.expand(t);
      RESULT = R;
      out.innerHTML = '';
      out.appendChild(el('div', 'note-note', 'Read as: <b>' + esc(R.visit.label) + '</b>. ' +
        R.placeholderCount + ' placeholder(s) left for you.'));
      const pre = el('pre', 'notebox');
      pre.innerHTML = esc(R.note).replace(/\[ TO COMPLETE: ([^\]]+) \]/g, '<span class="ph">[ TO COMPLETE: $1 ]</span>');
      out.appendChild(pre);
      const row = el('div', 'btnrow');
      const cp = el('button', 'btn btn--row' + (R.placeholderCount ? ' btn--locked' : ''),
        R.placeholderCount ? 'Copy locked — ' + R.placeholderCount + ' to complete' : 'Copy note');
      if (R.placeholderCount) cp.disabled = true;
      cp.addEventListener('click', () => copyText(R.note));
      const full = el('button', 'btn btn--row btn--ghost', 'Open full form');
      full.addEventListener('click', () => {
        VISIT = R.visit; DATA = R.parsed; saveDraft();
        location.hash = '#/note/new/' + R.visit.id;
      });
      row.append(cp, full);
      out.appendChild(row);
      renderRubric(out, R.rubric);
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    view.appendChild(btn);
    view.appendChild(out);
  }

  /* ============ page: drill ============ */
  function pageDrill(view, setTop, showSearch, toast) {
    view.classList.add('en');
    setTop('Practice', true);
    showSearch(false);

    const hist = window.NoteEngine.history();
    const avg = hist.length ? hist.slice(-5).reduce((a, b) => a + b.total, 0) / Math.min(5, hist.length) : 0;
    const start = avg >= 8 ? 1 : 0;

    view.appendChild(el('div', 'note-note',
      'Read the scenario, write your answer, then reveal the model answer and compare. ' +
      (hist.length ? 'Your recent rubric average is ' + avg.toFixed(1) + '/10, so start around scenario ' + (start + 1) + '.' : '')));

    DRILLS.forEach((d, i) => {
      const card = el('div', 'card');
      card.appendChild(el('h3', null, 'Scenario ' + (i + 1) + ' — ' + esc(d.level)));
      card.appendChild(el('p', null, esc(d.stem)));
      card.appendChild(el('div', 'note-note', '<b>Task:</b> ' + esc(d.ask)));
      const ta = el('textarea');
      ta.placeholder = 'Write your answer here first…';
      card.appendChild(ta);

      const rev = el('button', 'btn btn--ghost', 'Check my answer');
      const ans = el('div');
      ans.hidden = true;
      rev.addEventListener('click', () => {
        if (ans.hidden) {
          if (ta.value.trim().length < 20) { toast('Write your attempt first — that is the whole point'); return; }
          const a = window.NoteEngine.analyseAssessment(ta.value);
          ans.innerHTML = '';
          const self = el('div', 'note-note',
            'Your answer: ' + a.lines.length + ' line(s), ' + a.withAction + ' ending in an action, ' +
            a.withNumber + ' carrying a number' + (a.withDirection ? ', ' + a.withDirection + ' showing direction' : '') + '.');
          ans.appendChild(self);
          ans.appendChild(el('div', 'teach__lbl', 'Model answer'));
          ans.appendChild(el('pre', 'notebox', esc(d.model)));
          ans.appendChild(el('div', 'teach__lbl', 'Why it scores'));
          const ul = el('ul');
          d.points.forEach(p => ul.appendChild(el('li', null, esc(p))));
          const c2 = el('div', 'card');
          c2.appendChild(ul);
          ans.appendChild(c2);
          ans.hidden = false;
          rev.textContent = 'Hide model answer';
        } else { ans.hidden = true; rev.textContent = 'Check my answer'; }
      });
      card.appendChild(rev);
      card.appendChild(ans);
      view.appendChild(card);
    });
  }

  window.NoteUI = {
    hub: pageHub, picker: pageVisitPicker, form: pageForm, result: pageResult,
    critique: pageCritique, expand: pageExpand, drill: pageDrill,
    hasResult: () => !!RESULT,
  };
})();
