/* مساعد طبيب الأسرة — منطق التطبيق */
(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const view = $('#view');
  const topTitle = $('#topTitle');
  const backBtn = $('#backBtn');
  const searchWrap = $('#searchWrap');
  const searchInput = $('#searchInput');
  const clearSearch = $('#clearSearch');

  /* ---------- أدوات مساعدة ---------- */
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const chev = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = el('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      toast('تم النسخ');
    } catch (e) {
      toast('تعذّر النسخ — انسخ يدوياً');
    }
  }

  function shareText(title, text) {
    if (navigator.share) {
      navigator.share({ title, text }).catch(() => {});
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
    }
  }

  /* ---------- الوضع الليلي ---------- */
  const THEME_KEY = 'fm.theme';
  function applyTheme(t) {
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme')
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  try { applyTheme(localStorage.getItem(THEME_KEY)); } catch (e) {}
  $('#themeBtn').addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

  /* ---------- الأخيرة ---------- */
  const RECENT_KEY = 'fm.recent';
  function getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch (e) { return []; }
  }
  function pushRecent(route) {
    try {
      let r = getRecent().filter(x => x !== route);
      r.unshift(route);
      localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 8)));
    } catch (e) {}
  }

  /* ---------- فهرس البحث ---------- */
  const INDEX = [];
  const addIdx = (arr, type, route, kindLabel) => (arr || []).forEach(o => INDEX.push({
    id: o.id, type, kindLabel,
    title: o.title, sub: o.sub || '',
    route: route(o),
    hay: [o.title, o.sub || '', (o.tags || []).join(' '), o.cat || ''].join(' ').toLowerCase(),
  }));
  addIdx(window.CALCS, 'calc', o => '#/calc/' + o.id, 'حاسبة');
  addIdx(window.GUIDES, 'guide', o => '#/guide/' + o.id, 'دليل');
  addIdx(window.RX, 'rx', o => '#/rx/' + o.id, 'وصفة');
  addIdx(window.TOOLS, 'tool', o => '#/tools/' + o.id, 'أداة');
  addIdx(window.HANDOUTS, 'handout', o => '#/handout/' + o.id, 'نصائح للمريض');

  const norm = s => String(s).toLowerCase()
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[ًٌٍَُِّْ]/g, '');

  INDEX.forEach(x => { x.hay = norm(x.hay); });

  function search(q) {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return INDEX
      .map(x => {
        let score = 0;
        for (const t of terms) {
          if (!x.hay.includes(t)) return null;
          score += norm(x.title).startsWith(t) ? 3 : norm(x.title).includes(t) ? 2 : 1;
        }
        return { x, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map(r => r.x);
  }

  const byId = (arr, id) => (arr || []).find(o => o.id === id);

  /* ---------- عرض الكتل (الأدلة والأدوات) ---------- */
  function renderBlocks(blocks, host) {
    let card = null;
    const flush = () => { if (card && card.childNodes.length) host.appendChild(card); card = null; };
    const ensure = () => { if (!card) card = el('div', 'card'); return card; };

    blocks.forEach(b => {
      if (b.h) {
        flush();
        ensure().appendChild(el('h3', null, b.h));
      } else if (b.p) {
        ensure().appendChild(el('p', null, b.p));
      } else if (b.ul || b.ol) {
        const list = el(b.ul ? 'ul' : 'ol');
        (b.ul || b.ol).forEach(li => list.appendChild(el('li', null, li)));
        ensure().appendChild(list);
      } else if (b.note) {
        flush();
        const kind = b.kind === 'warn' ? ' note--warn' : b.kind === 'danger' ? ' note--danger'
          : b.kind === 'ok' ? ' note--ok' : '';
        host.appendChild(el('div', 'note' + kind, b.note));
      } else if (b.table) {
        const wrap = el('div', 'tablewrap');
        const t = el('table');
        const thead = el('thead');
        const trh = el('tr');
        b.table.head.forEach(h => trh.appendChild(el('th', null, h)));
        thead.appendChild(trh);
        t.appendChild(thead);
        const tb = el('tbody');
        b.table.rows.forEach(r => {
          const tr = el('tr');
          r.forEach(c => tr.appendChild(el('td', null, c)));
          tb.appendChild(tr);
        });
        t.appendChild(tb);
        wrap.appendChild(t);
        ensure().appendChild(wrap);
      } else if (b.copy) {
        const box = el('div', 'copybox', esc(b.copy));
        ensure().appendChild(box);
        const btn = el('button', 'btn btn--ghost', 'نسخ القالب');
        btn.addEventListener('click', () => copyText(b.copy));
        ensure().appendChild(btn);
        flush();
      }
    });
    flush();
  }

  /* ---------- الصفحات ---------- */
  const CALC_CATS = ['كبار السن', 'أساسية', 'قلب', 'عدوى', 'نفسية', 'مخبرية', 'أطفال', 'وقاية'];

  const geriOf = arr => (arr || []).filter(o => o.geri);

  function pageHome() {
    setTop('مساعد طبيب الأسرة', false);
    showSearch(true);

    const geriCount = geriOf(window.CALCS).length + geriOf(window.GUIDES).length
      + geriOf(window.TOOLS).length + geriOf(window.RX).length + geriOf(window.HANDOUTS).length;

    const feat = el('a', 'feature');
    feat.href = '#/geri';
    feat.innerHTML = `<span class="feature__ic"><svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10" cy="5" r="2.5"/><path d="M10 9v11M10 13l4 2M6 20l4-7M17 10v11M17 12h-3"/></svg></span>
      <span class="feature__body">
        <span class="feature__t">كبار السن</span>
        <span class="feature__d">التقييم الشامل، الهشاشة، الخرف، السقوط، ومراجعة الأدوية — ${geriCount} مادة</span>
      </span><span class="row__chev">${chev}</span>`;
    view.appendChild(feat);

    const quick = [
      { t: 'مقياس الهشاشة', d: 'يوجّه كل قرار آخر', r: '#/calc/cfs', ic: '<path d="M4 19h16M7 19V9M12 19V5M17 19v-7"/>' },
      { t: 'أدوية يُتجنّب وصفها', d: 'معايير Beers', r: '#/tools/beers', ic: '<path d="M9 3h6v4H9zM7 7h10l1 14H6z"/><path d="M9 12h6"/>' },
      { t: 'الهذيان', d: 'مقياس 4AT في دقيقتين', r: '#/calc/4at', ic: '<path d="M12 3a6 6 0 016 6c0 3-2 4-2 7H8c0-3-2-4-2-7a6 6 0 016-6z"/><path d="M9 20h6"/>' },
      { t: 'خطر السقوط', d: 'فرز وعوامل قابلة للتعديل', r: '#/calc/falls-risk', ic: '<path d="M13 4a1.5 1.5 0 100-.01M11 21l1-6-3-3 1-5 4 3 3 1"/>' },
      { t: 'العلامات الحمراء', d: 'ما لا يجوز تفويته', r: '#/tools/redflags', ic: '<path d="M4 4v16M4 5h13l-2 4 2 4H4"/>' },
      { t: 'قوالب التوثيق', d: 'ملاحظات جاهزة', r: '#/tools/notes', ic: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h5"/>' },
    ];

    view.appendChild(el('div', 'sec-title', 'وصول سريع'));
    const g = el('div', 'grid');
    quick.forEach(q => {
      const a = el('a', 'tile');
      a.href = q.r;
      a.innerHTML = `<span class="tile__ic"><svg viewBox="0 0 24 24" aria-hidden="true">${q.ic}</svg></span>
        <span class="tile__t">${q.t}</span><span class="tile__d">${q.d}</span>`;
      g.appendChild(a);
    });
    view.appendChild(g);

    const recent = getRecent().map(r => INDEX.find(x => x.route === r)).filter(Boolean);
    if (recent.length) {
      view.appendChild(el('div', 'sec-title', 'استخدمتها مؤخراً'));
      view.appendChild(rowList(recent));
    }

    view.appendChild(el('div', 'sec-title', 'الأقسام'));
    view.appendChild(rowList([
      { title: 'الحاسبات السريرية', sub: window.CALCS.length + ' حاسبة', route: '#/calc' },
      { title: 'الأدلة السريعة', sub: window.GUIDES.length + ' حالة', route: '#/guide' },
      { title: 'الوصفات الجاهزة', sub: window.RX.length + ' وصفة قابلة للنسخ', route: '#/rx' },
      { title: 'نصائح للمريض', sub: window.HANDOUTS.length + ' ورقة إرشادية', route: '#/handout' },
      { title: 'أدوات مرجعية', sub: 'تطعيمات، فحوصات، مضادات حيوية، توثيق', route: '#/tools' },
    ]));

    view.appendChild(el('p', 'disclaimer',
      'أداة دعم قرار للاستخدام من قِبل الكوادر الصحية المؤهلة، ولا تُغني عن الحكم السريري.<br>تحقّق من الجرعات والبروتوكولات المعتمدة محلياً قبل التطبيق. تعمل بدون إنترنت بعد أول فتح.'));
  }

  function rowList(items) {
    const list = el('div', 'list');
    items.forEach(it => {
      const a = el('a', 'row');
      a.href = it.route;
      a.innerHTML = `<span class="row__body"><span class="row__t">${it.title}</span>
        ${it.sub ? `<span class="row__d">${it.sub}</span>` : ''}</span>
        ${it.kindLabel ? `<span class="row__tag">${it.kindLabel}</span>` : ''}
        <span class="row__chev">${chev}</span>`;
      list.appendChild(a);
    });
    return list;
  }

  function pageGeri() {
    setTop('كبار السن', false);
    showSearch(true);

    const sections = [
      { t: 'مقاييس التقييم', arr: geriOf(window.CALCS), pre: '#/calc/' },
      { t: 'أدلة سريرية', arr: geriOf(window.GUIDES), pre: '#/guide/' },
      { t: 'أدوات مرجعية', arr: geriOf(window.TOOLS), pre: '#/tools/' },
      { t: 'وصفات', arr: geriOf(window.RX), pre: '#/rx/' },
      { t: 'إرشادات للأسرة ومقدّم الرعاية', arr: geriOf(window.HANDOUTS), pre: '#/handout/' },
    ];

    view.appendChild(el('div', 'note',
      'ابدأ بـ <b>مقياس الهشاشة</b> — درجته تحدّد أهداف الضغط والسكر، وأي دواء يستحق الاستمرار، ومتى يبدأ نقاش أهداف الرعاية.'));

    sections.forEach(s => {
      if (!s.arr.length) return;
      view.appendChild(el('div', 'sec-title', s.t));
      view.appendChild(rowList(s.arr.map(o => ({
        title: o.title, sub: o.sub || '', route: s.pre + o.id,
      }))));
    });
  }

  function pageList(title, arr, prefix, groupBy) {
    setTop(title, false);
    showSearch(true);
    if (groupBy) {
      const cats = [];
      arr.forEach(o => { if (!cats.includes(o.cat)) cats.push(o.cat); });
      cats.forEach(c => {
        view.appendChild(el('div', 'sec-title', c));
        view.appendChild(rowList(arr.filter(o => o.cat === c)
          .map(o => ({ title: o.title, sub: o.sub, route: prefix + o.id }))));
      });
    } else {
      view.appendChild(rowList(arr.map(o => ({ title: o.title, sub: o.sub, route: prefix + o.id }))));
    }
  }

  function pageGuide(id) {
    const g = byId(window.GUIDES, id) || byId(window.TOOLS, id);
    if (!g) return pageMissing();
    setTop(g.title, true);
    showSearch(false);
    if (g.sub) view.appendChild(el('p', 'disclaimer', g.sub));
    renderBlocks(g.blocks, view);
  }

  function pageRx(id) {
    const r = byId(window.RX, id);
    if (!r) return pageMissing();
    setTop(r.title, true);
    showSearch(false);
    if (r.sub) view.appendChild(el('p', 'disclaimer', r.sub));

    const card = el('div', 'card');
    card.appendChild(el('h3', null, 'الوصفة'));
    card.appendChild(el('div', 'copybox', esc(r.text)));
    view.appendChild(card);

    const btns = el('div', 'btnrow');
    const c = el('button', 'btn btn--row', 'نسخ الوصفة');
    c.addEventListener('click', () => copyText(r.text));
    const s = el('button', 'btn btn--row btn--ghost', 'مشاركة');
    s.addEventListener('click', () => shareText(r.title, r.title + '\n\n' + r.text));
    btns.append(c, s);
    view.appendChild(btns);

    if (r.notes && r.notes.length) {
      const n = el('div', 'card');
      n.appendChild(el('h3', null, 'ملاحظات'));
      const ul = el('ul');
      r.notes.forEach(x => ul.appendChild(el('li', null, x)));
      n.appendChild(ul);
      view.appendChild(n);
    }
    view.appendChild(el('p', 'disclaimer', 'راجع الجرعة والحساسية والتداخلات الدوائية وحالة الكلى والكبد قبل الصرف.'));
  }

  function pageHandout(id) {
    const h = byId(window.HANDOUTS, id);
    if (!h) return pageMissing();
    setTop(h.title, true);
    showSearch(false);
    const plain = h.text.replace(/<\/?b>/g, '');
    view.appendChild(el('div', 'note', 'نص جاهز للإرسال للمريض أو الطباعة.'));
    const card = el('div', 'card');
    card.appendChild(el('div', 'copybox', esc(plain)));
    view.appendChild(card);
    const btns = el('div', 'btnrow');
    const c = el('button', 'btn btn--row', 'نسخ');
    c.addEventListener('click', () => copyText(plain));
    const s = el('button', 'btn btn--row btn--ghost', 'إرسال');
    s.addEventListener('click', () => shareText(h.title, plain));
    btns.append(c, s);
    view.appendChild(btns);
  }

  /* ---------- الحاسبات ---------- */
  function pageCalc(id) {
    const c = byId(window.CALCS, id);
    if (!c) return pageMissing();
    setTop(c.title, true);
    showSearch(false);
    if (c.sub) view.appendChild(el('p', 'disclaimer', c.sub));
    if (c.type === 'score') renderScore(c); else renderForm(c);
  }

  function resultBox() {
    const box = el('div', 'result result--empty');
    box.innerHTML = '<div class="result__v">أكمل الحقول لعرض النتيجة</div>';
    return box;
  }

  function paintResult(box, res) {
    if (!res) {
      box.className = 'result result--empty';
      box.innerHTML = '<div class="result__v">أكمل الحقول لعرض النتيجة</div>';
      return;
    }
    box.className = 'result';
    const pillCls = res.kind === 'ok' ? 'pill--ok' : res.kind === 'danger' ? 'pill--danger'
      : res.kind === 'warn' ? 'pill--warn' : 'pill--info';
    let html = `<div class="result__v">${res.v} <span class="result__u">${res.u || ''}</span></div>`;
    if (res.i) html += `<div class="result__i"><span class="pill ${pillCls}">${res.i}</span></div>`;
    if (res.lines && res.lines.length) {
      html += '<div class="result__sub">' + res.lines.map(l => '• ' + l).join('<br>') + '</div>';
    }
    box.innerHTML = html;
  }

  function renderForm(c) {
    const state = {};
    const card = el('div', 'card');
    const box = resultBox();
    const run = () => paintResult(box, c.compute(state));

    c.fields.forEach(f => {
      const wrap = el('div', 'field');
      wrap.appendChild(el('label', null,
        esc(f.label) + (f.unit ? ` <span class="field__hint">(${esc(f.unit)})</span>` : '')));

      if (f.type === 'choice') {
        const group = 'ch_' + f.id + '_' + Math.random().toString(36).slice(2, 7);
        f.opts.forEach(o => {
          const lab = el('label', 'check');
          const inp = el('input');
          inp.type = 'radio';
          inp.name = group;
          inp.addEventListener('change', () => { state[f.id] = o.v; run(); });
          lab.append(inp, el('span', 'check__t',
            `<b>${esc(o.t)}</b>${o.d ? `<span class="check__d">${esc(o.d)}</span>` : ''}`));
          wrap.appendChild(lab);
        });
      } else if (f.type === 'seg') {
        state[f.id] = f.def != null ? f.def : f.opts[0].v;
        const seg = el('div', 'seg');
        f.opts.forEach(o => {
          const b = el('button', null, esc(o.t));
          b.type = 'button';
          b.setAttribute('aria-pressed', String(o.v === state[f.id]));
          b.addEventListener('click', () => {
            state[f.id] = o.v;
            [...seg.children].forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            run();
          });
          seg.appendChild(b);
        });
        wrap.appendChild(seg);
      } else if (f.type === 'select') {
        const sel = el('select');
        sel.appendChild(el('option', null, '— اختر —'));
        f.opts.forEach(o => {
          const op = el('option', null, esc(o.t));
          op.value = o.v;
          sel.appendChild(op);
        });
        sel.addEventListener('change', () => { state[f.id] = sel.value; run(); });
        wrap.appendChild(sel);
      } else {
        const inp = el('input');
        inp.type = f.type === 'date' ? 'date' : 'number';
        if (f.type !== 'date') { inp.inputMode = 'decimal'; inp.step = f.step || '1'; }
        if (f.def != null) { inp.value = f.def; state[f.id] = f.def; }
        inp.addEventListener('input', () => { state[f.id] = inp.value; run(); });
        wrap.appendChild(inp);
      }
      card.appendChild(wrap);
    });

    view.appendChild(card);
    view.appendChild(box);
    run();
  }

  function renderScore(c) {
    const state = {};
    const card = el('div', 'card');
    const box = resultBox();

    /* بعض المقاييس تكون الصفر فيها أسوأ نتيجة (الاستقلالية، التغذية، الإدراك)،
       فلا تُعرض نتيجة قبل أن يُدخل الطبيب شيئاً حتى لا تبدو النتيجة الابتدائية حكماً. */
    let touched = !c.needsInput;
    const total = () => Object.values(state).reduce((a, b) => a + (+b || 0), 0);
    const run = () => {
      if (!touched) { paintResult(box, null); return; }
      const t = total();
      const band = c.bands.find(b => t <= b.max) || c.bands[c.bands.length - 1];
      const lines = [band.note];
      if (c.foot) lines.push(c.foot);
      if (c.items.some(i => i.flag) && c.items.filter(i => i.flag).some(i => (+state[i.id] || 0) > 0)) {
        lines.unshift('⚠ إجابة إيجابية على بند خطر إيذاء النفس — يستوجب تقييماً مباشراً الآن.');
      }
      paintResult(box, { v: t, u: 'نقطة', i: band.label, kind: band.kind, lines });
    };

    c.items.forEach(it => {
      if (it.type === 'radio') {
        const wrap = el('div', 'field');
        wrap.appendChild(el('label', null, esc(it.t)));
        state[it.id] = it.opts[0].pts;
        const seg = el('div', 'seg');
        it.opts.forEach((o, ix) => {
          const b = el('button', null, esc(o.t));
          b.type = 'button';
          b.setAttribute('aria-pressed', String(ix === 0));
          b.addEventListener('click', () => {
            touched = true;
            state[it.id] = o.pts;
            [...seg.children].forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            run();
          });
          seg.appendChild(b);
        });
        wrap.appendChild(seg);
        card.appendChild(wrap);
      } else if (it.type === 'scale') {
        const wrap = el('div', 'field');
        wrap.appendChild(el('label', null, esc(it.t)));
        state[it.id] = 0;
        const seg = el('div', 'seg');
        (c.scale || []).forEach((lbl, ix) => {
          const b = el('button', null, String(ix));
          b.type = 'button';
          b.title = lbl;
          b.setAttribute('aria-label', lbl);
          b.setAttribute('aria-pressed', String(ix === 0));
          b.addEventListener('click', () => {
            touched = true;
            state[it.id] = ix;
            [...seg.children].forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            run();
          });
          seg.appendChild(b);
        });
        wrap.appendChild(seg);
        card.appendChild(wrap);
      } else {
        state[it.id] = 0;
        const lab = el('label', 'check');
        const inp = el('input');
        inp.type = 'checkbox';
        inp.addEventListener('change', () => { touched = true; state[it.id] = inp.checked ? it.pts : 0; run(); });
        lab.append(inp, el('span', 'check__t', esc(it.t)),
          el('span', 'check__pts', (it.pts > 0 ? '+' : '') + it.pts));
        card.appendChild(lab);
      }
    });

    if (c.intro) view.appendChild(el('div', 'note', c.intro));
    if (c.scale) {
      view.appendChild(el('div', 'note',
        'اختر لكل بند: ' + c.scale.map((s, i) => `<b>${i}</b> ${s}`).join(' · ')));
    }
    view.appendChild(card);

    const reset = el('button', 'btn btn--ghost', 'إعادة تعيين');
    reset.addEventListener('click', () => { render(); });
    view.appendChild(reset);
    view.appendChild(box);
    run();
  }

  /* ---------- البحث ---------- */
  function pageSearch(q) {
    setTop('نتائج البحث', true);
    showSearch(true);
    searchInput.value = q;
    const res = search(q);
    if (!res.length) {
      view.appendChild(el('div', 'empty',
        '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
        '<div>لا توجد نتائج لـ «' + esc(q) + '»</div>'));
      return;
    }
    view.appendChild(el('div', 'sec-title', res.length + ' نتيجة'));
    view.appendChild(rowList(res));
  }

  function pageMissing() {
    setTop('غير موجود', true);
    showSearch(false);
    view.appendChild(el('div', 'empty', 'الصفحة المطلوبة غير موجودة.'));
  }

  /* ---------- الهيكل العام ---------- */
  function setTop(title, showBack) {
    topTitle.textContent = title;
    document.title = title === 'مساعد طبيب الأسرة' ? title : title + ' — مساعد طبيب الأسرة';
    backBtn.hidden = !showBack;
  }
  function showSearch(on) { searchWrap.hidden = !on; }

  function setTab(name) {
    document.querySelectorAll('.tab').forEach(t => {
      if (t.dataset.tab === name) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
  }

  function render() {
    const hash = location.hash || '#/home';
    const parts = hash.replace(/^#\//, '').split('/');
    const [sec, id] = parts;
    view.innerHTML = '';
    window.scrollTo(0, 0);

    if (sec === 'search') {
      setTab('');
      pageSearch(decodeURIComponent(parts.slice(1).join('/') || ''));
      return;
    }

    setTab(sec === 'handout' ? 'rx' : sec === 'geri' ? 'home' : sec);

    switch (sec) {
      case 'geri':
        pageGeri();
        break;
      case 'calc':
        if (id) { pushRecent(hash); pageCalc(id); }
        else pageList('الحاسبات السريرية', sortByCat(window.CALCS, CALC_CATS), '#/calc/', true);
        break;
      case 'guide':
        if (id) { pushRecent(hash); pageGuide(id); }
        else pageList('الأدلة السريعة', window.GUIDES, '#/guide/', true);
        break;
      case 'rx':
        if (id) { pushRecent(hash); pageRx(id); }
        else {
          setTop('الوصفات الجاهزة', false);
          showSearch(true);
          const cats = [];
          window.RX.forEach(o => { if (!cats.includes(o.cat)) cats.push(o.cat); });
          cats.forEach(cat => {
            view.appendChild(el('div', 'sec-title', cat));
            view.appendChild(rowList(window.RX.filter(o => o.cat === cat)
              .map(o => ({ title: o.title, sub: o.sub, route: '#/rx/' + o.id }))));
          });
          view.appendChild(el('div', 'sec-title', 'نصائح للمريض'));
          view.appendChild(rowList(window.HANDOUTS
            .map(o => ({ title: o.title, sub: 'نص جاهز للإرسال', route: '#/handout/' + o.id }))));
        }
        break;
      case 'handout':
        if (id) { pushRecent(hash); pageHandout(id); }
        else pageList('نصائح للمريض', window.HANDOUTS.map(h => ({ ...h, sub: 'نص جاهز للإرسال' })), '#/handout/', false);
        break;
      case 'tools':
        if (id) { pushRecent(hash); pageGuide(id); }
        else pageList('أدوات مرجعية', window.TOOLS, '#/tools/', false);
        break;
      default:
        pageHome();
    }
  }

  function sortByCat(arr, order) {
    return [...arr].sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat));
  }

  /* ---------- الأحداث ---------- */
  backBtn.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.hash = '#/home';
  });

  let searchTimer;
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    clearSearch.hidden = !q;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (q.length >= 2) location.hash = '#/search/' + encodeURIComponent(q);
      else if (location.hash.startsWith('#/search')) location.hash = '#/home';
    }, 220);
  });
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchInput.blur(); });
  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch.hidden = true;
    if (location.hash.startsWith('#/search')) location.hash = '#/home';
    searchInput.focus();
  });

  window.addEventListener('hashchange', render);
  render();

  /* ---------- العمل بدون إنترنت ---------- */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
