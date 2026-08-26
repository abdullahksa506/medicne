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

  /* ============ shared render helpers ============ */

  function fieldControl(f, onChange) {
    const wrap = el('div', 'field');
    const lab = el('label', null, esc(f.en) + (f.required ? ' <span class="req">*</span>' : ''));
    wrap.appendChild(lab);
    if (f.why) wrap.appendChild(el('div', 'field__why', esc(f.why)));

    const set = v => { DATA[f.id] = v; saveDraft(); onChange(); };

    if (f.type === 'builder') {
      const ta = el('textarea');
      ta.placeholder = f.placeholder || (f.example ? 'e.g. ' + f.example : '');
      ta.style.minHeight = '150px';
      if (DATA[f.id]) ta.value = DATA[f.id];
      ta.addEventListener('input', () => set(ta.value));

      const insert = line => {
        const cur = ta.value.replace(/\s+$/, '');
        ta.value = (cur ? cur + '\n' : '') + line;
        set(ta.value);
        ta.focus();
        ta.setSelectionRange(ta.value.length, ta.value.length);
      };

      const groups = typeof f.groups === 'function' ? f.groups(DATA) : (f.groups || []);
      groups.forEach(g => {
        wrap.appendChild(el('div', 'builder__grp', esc(g.label)));
        const box = el('div', 'chips');
        g.lines.forEach(line => {
          const c = el('button', 'chip chip--add', '+ ' + esc(line));
          c.type = 'button';
          c.addEventListener('click', () => insert(line));
          box.appendChild(c);
        });
        wrap.appendChild(box);
      });
      wrap.appendChild(el('div', 'builder__grp', 'Other — write your own'));
      wrap.appendChild(ta);
      return wrap;
    }

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
        extra.placeholder = 'Other — type it and press enter';
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

  /* ============ page: pick the visit ============ */
  function pageVisitPicker(view, setTop, showSearch) {
    view.classList.add('en');
    setTop('Write a note', false);
    showSearch(false);

    view.appendChild(el('div', 'note-hero',
      '<div class="note-hero__t">Progress Note</div>' +
      '<div class="note-hero__d">Fill the blanks, pick the problems, and the form asks only what those problems need. ' +
      'Every note is a <b>draft</b> the treating physician must read, correct and sign.</div>'));

    const hist = window.NoteEngine.history();
    if (hist.length) {
      const last = hist.slice(-5);
      const avg = (last.reduce((a, b) => a + b.total, 0) / last.length).toFixed(1);
      view.appendChild(el('div', 'note-hero__stat',
        'Last ' + last.length + ' notes — average rubric ' + avg + '/10 · latest ' + last[last.length - 1].total + '/10'));
    }

    view.appendChild(el('div', 'sec-title', 'Visit type'));
    const list = el('div', 'list');
    window.NOTE_VISITS.forEach(v => {
      const a = el('a', 'row');
      a.href = '#/note/new/' + v.id;
      a.innerHTML = '<span class="row__body"><span class="row__t">' + esc(v.label) + '</span></span>' +
        '<span class="row__chev"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></span>';
      list.appendChild(a);
    });
    view.appendChild(list);

    view.appendChild(el('div', 'note-rules',
      '<b>What this tool will not do</b>' +
      '<ul>' +
      '<li>It never invents a finding, a vital sign, a lab value or a diagnosis. Gaps become <span class="ph">[ TO COMPLETE: … ]</span> and the copy button stays locked until none remain.</li>' +
      '<li>Red flags you entered are surfaced as unresolved concerns — never smoothed into a reassuring line.</li>' +
      '<li>Judgemental words are rewritten neutrally before they reach the record, and you are told which and why.</li>' +
      '<li>Patient identifiers are stripped. Age and sex only.</li>' +
      '</ul>'));
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
    const rendered = [];   /* { f, node } for every field, shown or not */
    const secNodes = [];   /* { fields, title, card } so an empty section hides too */

    const filled = id => {
      const x = DATA[id];
      return Array.isArray(x) ? x.length > 0 : (x !== undefined && x !== null && String(x).trim() !== '');
    };

    /* Re-evaluate every `when` on each answer, so questions appear the moment they
       become relevant and disappear again when they stop being. */
    const update = () => {
      rendered.forEach(r => { r.node.hidden = !window.noteFieldVisible(r.f, DATA); });
      secNodes.forEach(sn => {
        const anyVisible = sn.fields.some(f => window.noteFieldVisible(f, DATA));
        sn.title.hidden = !anyVisible;
        sn.card.hidden = !anyVisible;
      });
      const req = rendered.filter(r => r.f.required && window.noteFieldVisible(r.f, DATA));
      const done = req.filter(r => filled(r.f.id)).length;
      const pct = req.length ? Math.round(done / req.length * 100) : 0;
      progress.innerHTML = '<div class="note-progress__bar"><span style="width:' + pct + '%"></span></div>' +
        '<div class="note-progress__t">' + done + ' of ' + req.length + ' required fields</div>';
    };

    sections.forEach(s => {
      const title = el('div', 'sec-title', s.title);
      const card = el('div', 'card');
      s.fields.forEach(f => {
        const node = fieldControl(f, update);
        card.appendChild(node);
        rendered.push({ f: f, node: node });
      });
      view.appendChild(title);
      view.appendChild(card);
      secNodes.push({ fields: s.fields, title: title, card: card });
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

  window.NoteUI = {
    picker: pageVisitPicker, form: pageForm, result: pageResult,
    hasResult: () => !!RESULT,
  };
})();
