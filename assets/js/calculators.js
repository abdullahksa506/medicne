/* الحاسبات السريرية
   نوعان:
   - type:'form'  → حقول + دالة compute تُرجع { v, u, i, kind, sub, lines }
   - type:'score' → عناصر نقاط + نطاقات تفسير
*/

const _n = v => (v === '' || v === null || v === undefined || isNaN(+v)) ? null : +v;
const _r = (x, d = 1) => Number(x.toFixed(d));

window.CALCS = [

/* ============ القياسات الأساسية ============ */
{
  id: 'bmi', cat: 'أساسية', type: 'form',
  title: 'مؤشر كتلة الجسم', sub: 'BMI ومساحة سطح الجسم والوزن المثالي',
  tags: ['bmi', 'وزن', 'سمنة', 'كتلة', 'bsa'],
  fields: [
    { id: 'w', label: 'الوزن', unit: 'كجم', type: 'number', step: '0.1' },
    { id: 'h', label: 'الطول', unit: 'سم', type: 'number', step: '0.5' },
  ],
  compute(v) {
    const w = _n(v.w), h = _n(v.h);
    if (!w || !h) return null;
    const m = h / 100;
    const bmi = w / (m * m);
    const bsa = Math.sqrt((h * w) / 3600);
    let i, kind;
    if (bmi < 18.5) { i = 'نقص وزن'; kind = 'warn'; }
    else if (bmi < 25) { i = 'وزن طبيعي'; kind = 'ok'; }
    else if (bmi < 30) { i = 'زيادة وزن'; kind = 'warn'; }
    else if (bmi < 35) { i = 'سمنة درجة أولى'; kind = 'danger'; }
    else if (bmi < 40) { i = 'سمنة درجة ثانية'; kind = 'danger'; }
    else { i = 'سمنة درجة ثالثة (مفرطة)'; kind = 'danger'; }
    const lo = _r(18.5 * m * m), hi = _r(24.9 * m * m);
    const lines = [
      `مساحة سطح الجسم: ${_r(bsa, 2)} م²`,
      `نطاق الوزن الطبيعي لهذا الطول: ${lo} – ${hi} كجم`,
    ];
    if (bmi >= 25) lines.push(`نزول 5 – 10% يعني ${_r(w * 0.05)} – ${_r(w * 0.1)} كجم — وهو هدف كافٍ لتحسين السكر والضغط والدهون.`);
    return { v: _r(bmi, 1), u: 'كجم/م²', i, kind, lines };
  },
},

{
  id: 'egfr', cat: 'أساسية', type: 'form',
  title: 'معدل الترشيح الكبيبي', sub: 'CKD-EPI 2021 — بدون معامل العرق',
  tags: ['كلى', 'egfr', 'كرياتينين', 'ckd'],
  fields: [
    { id: 'age', label: 'العمر', unit: 'سنة', type: 'number' },
    { id: 'sex', label: 'الجنس', type: 'seg', opts: [{ v: 'm', t: 'ذكر' }, { v: 'f', t: 'أنثى' }], def: 'm' },
    { id: 'cr', label: 'الكرياتينين', type: 'number', step: '0.01' },
    { id: 'unit', label: 'وحدة الكرياتينين', type: 'seg', opts: [{ v: 'mg', t: 'mg/dL' }, { v: 'umol', t: 'µmol/L' }], def: 'mg' },
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
    if (e >= 90) { stage = 'G1'; i = 'طبيعي أو مرتفع'; kind = 'ok'; }
    else if (e >= 60) { stage = 'G2'; i = 'انخفاض بسيط'; kind = 'ok'; }
    else if (e >= 45) { stage = 'G3a'; i = 'انخفاض بسيط إلى متوسط'; kind = 'warn'; }
    else if (e >= 30) { stage = 'G3b'; i = 'انخفاض متوسط إلى شديد'; kind = 'warn'; }
    else if (e >= 15) { stage = 'G4'; i = 'انخفاض شديد'; kind = 'danger'; }
    else { stage = 'G5'; i = 'فشل كلوي'; kind = 'danger'; }
    const lines = [`المرحلة: ${stage}`];
    if (e < 45) lines.push('الميتفورمين: لا يُبدأ · وأوقفه تماماً تحت 30.');
    if (e < 30) lines.push('تجنّب النيتروفيورانتوين ومضادات الالتهاب، وعدّل جرعات الأدوية المطروحة كلوياً.');
    if (e < 30) lines.push('يستدعي تحويلاً لعيادة الكلى.');
    lines.push('التشخيص بالمرض الكلوي المزمن يحتاج قراءتين متباعدتين ≥ 3 شهور، مع ACR بالبول.');
    return { v: _r(e, 0), u: 'مل/د/1.73م²', i, kind, lines };
  },
},

{
  id: 'crcl', cat: 'أساسية', type: 'form',
  title: 'تصفية الكرياتينين', sub: 'Cockcroft-Gault — لضبط جرعات الأدوية',
  tags: ['كلى', 'جرعة', 'cockcroft', 'crcl'],
  fields: [
    { id: 'age', label: 'العمر', unit: 'سنة', type: 'number' },
    { id: 'sex', label: 'الجنس', type: 'seg', opts: [{ v: 'm', t: 'ذكر' }, { v: 'f', t: 'أنثى' }], def: 'm' },
    { id: 'w', label: 'الوزن', unit: 'كجم', type: 'number', step: '0.1' },
    { id: 'cr', label: 'الكرياتينين', unit: 'mg/dL', type: 'number', step: '0.01' },
  ],
  compute(v) {
    const age = _n(v.age), w = _n(v.w), cr = _n(v.cr);
    if (!age || !w || !cr) return null;
    let c = ((140 - age) * w) / (72 * cr);
    if (v.sex === 'f') c *= 0.85;
    let i, kind;
    if (c >= 60) { i = 'لا حاجة لتعديل عام'; kind = 'ok'; }
    else if (c >= 30) { i = 'تعديل مطلوب لعدة أدوية'; kind = 'warn'; }
    else { i = 'تعديل ضروري — راجع كل دواء'; kind = 'danger'; }
    return { v: _r(c, 0), u: 'مل/دقيقة', i, kind, lines: [
      'استخدم هذه المعادلة لضبط جرعات الأدوية ضيقة النافذة (مثل المميعات) بدلاً من CKD-EPI.',
      'مع السمنة الشديدة استخدم الوزن المعدّل، ومع النحافة استخدم الوزن الفعلي.',
    ]};
  },
},

/* ============ القلب والأوعية ============ */
{
  id: 'ascvd', cat: 'قلب', type: 'form',
  title: 'خطورة القلب لعشر سنوات', sub: 'ASCVD — معادلات المجموعات المجمّعة',
  tags: ['قلب', 'خطورة', 'ascvd', 'ستاتين', 'كوليسترول'],
  fields: [
    { id: 'age', label: 'العمر', unit: 'من 40 إلى 79', type: 'number' },
    { id: 'sex', label: 'الجنس', type: 'seg', opts: [{ v: 'm', t: 'ذكر' }, { v: 'f', t: 'أنثى' }], def: 'm' },
    { id: 'race', label: 'العِرق', type: 'seg', opts: [{ v: 'w', t: 'أخرى' }, { v: 'b', t: 'أصول أفريقية' }], def: 'w' },
    { id: 'tc', label: 'الكوليسترول الكلي', unit: 'mg/dL', type: 'number' },
    { id: 'hdl', label: 'الكوليسترول النافع HDL', unit: 'mg/dL', type: 'number' },
    { id: 'sbp', label: 'الضغط الانقباضي', unit: 'mmHg', type: 'number' },
    { id: 'rx', label: 'يتناول علاج ضغط؟', type: 'seg', opts: [{ v: '0', t: 'لا' }, { v: '1', t: 'نعم' }], def: '0' },
    { id: 'dm', label: 'مصاب بالسكري؟', type: 'seg', opts: [{ v: '0', t: 'لا' }, { v: '1', t: 'نعم' }], def: '0' },
    { id: 'sm', label: 'مدخّن حالياً؟', type: 'seg', opts: [{ v: '0', t: 'لا' }, { v: '1', t: 'نعم' }], def: '0' },
  ],
  compute(v) {
    const age = _n(v.age), tc = _n(v.tc), hdl = _n(v.hdl), sbp = _n(v.sbp);
    if (!age || !tc || !hdl || !sbp) return null;
    if (age < 40 || age > 79) return { v: '—', u: '', i: 'المعادلة معتمدة لأعمار 40 – 79 سنة فقط', kind: 'warn', lines: [
      'خارج هذا النطاق قيّم عوامل الخطر فردياً بدون رقم محسوب.'] };
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
    if (risk < 5) { i = 'خطورة منخفضة'; kind = 'ok'; lines = ['ركّز على نمط الحياة. لا ستاتين روتيني.']; }
    else if (risk < 7.5) { i = 'خطورة حدّية'; kind = 'warn'; lines = ['ناقش الستاتين إذا وُجدت عوامل مضاعِفة: تاريخ عائلي مبكر، متلازمة أيضية، مرض كلوي مزمن، التهاب مزمن، أو LDL ≥ 160.']; }
    else if (risk < 20) { i = 'خطورة متوسطة'; kind = 'warn'; lines = ['ستاتين متوسط الشدة — الهدف خفض LDL بنسبة 30 – 49%.']; }
    else { i = 'خطورة عالية'; kind = 'danger'; lines = ['ستاتين عالي الشدة — الهدف خفض LDL بنسبة ≥ 50%.']; }
    lines.push('اضبط الضغط والسكر، وأوقف التدخين — أثرها يفوق أثر الدواء وحده.');
    lines.push('المعادلة مشتقة من مجموعات أمريكية، وقد تبالغ أو تقلّل التقدير في مجتمعات أخرى — استخدمها لدعم القرار لا لتحل محله.');
    return { v: _r(risk, 1), u: '%', i, kind, lines };
  },
},

{
  id: 'chadsvasc', cat: 'قلب', type: 'score',
  title: 'CHA₂DS₂-VASc', sub: 'خطر الجلطة في الرجفان الأذيني',
  tags: ['رجفان', 'جلطة', 'مميع', 'chads', 'af'],
  items: [
    { id: 'chf', t: 'قصور القلب الاحتقاني أو ضعف عضلة القلب', pts: 1 },
    { id: 'htn', t: 'ارتفاع ضغط الدم', pts: 1 },
    { id: 'age', t: 'العمر', type: 'radio', opts: [{ t: 'أقل من 65', pts: 0 }, { t: '65 – 74', pts: 1 }, { t: '75 فأكثر', pts: 2 }] },
    { id: 'dm', t: 'السكري', pts: 1 },
    { id: 'stroke', t: 'جلطة دماغية أو نوبة إقفارية عابرة أو انصمام سابق', pts: 2 },
    { id: 'vasc', t: 'مرض وعائي (جلطة قلبية سابقة، شرايين طرفية، لويحات أبهرية)', pts: 1 },
    { id: 'sex', t: 'أنثى', pts: 1 },
  ],
  bands: [
    { max: 0, label: 'خطورة منخفضة', kind: 'ok', note: 'لا يُنصح بمضاد تخثر لدى الرجل بصفر نقطة.' },
    { max: 1, label: 'خطورة منخفضة – متوسطة', kind: 'warn', note: 'الرجل بنقطة واحدة: ناقش مضاد التخثر. المرأة بنقطة واحدة (الجنس فقط): تُعامل معاملة الصفر.' },
    { max: 99, label: 'خطورة مرتفعة', kind: 'danger', note: 'يُنصح بمضاد تخثر فموي (DOAC مفضّل على الوارفارين عدا الصمام الميكانيكي والتضيق الميترالي الروماتيزمي).' },
  ],
  foot: 'قيّم خطر النزيف بـ HAS-BLED — لكن ارتفاعه سبب لمعالجة عوامل النزيف القابلة للتعديل، لا لمنع مضاد التخثر.',
},

{
  id: 'hasbled', cat: 'قلب', type: 'score',
  title: 'HAS-BLED', sub: 'خطر النزيف مع مضادات التخثر',
  tags: ['نزيف', 'مميع', 'وارفارين', 'hasbled'],
  items: [
    { id: 'h', t: 'ضغط غير مضبوط (انقباضي > 160)', pts: 1 },
    { id: 'a1', t: 'خلل كلوي (غسيل، زرع، كرياتينين > 2.26)', pts: 1 },
    { id: 'a2', t: 'خلل كبدي (تشمع أو ارتفاع إنزيمات كبير)', pts: 1 },
    { id: 's', t: 'جلطة دماغية سابقة', pts: 1 },
    { id: 'b', t: 'تاريخ نزيف أو استعداد للنزيف', pts: 1 },
    { id: 'l', t: 'INR غير مستقر (لمن على وارفارين)', pts: 1 },
    { id: 'e', t: 'العمر أكبر من 65', pts: 1 },
    { id: 'd1', t: 'أدوية ترفع خطر النزيف (أسبرين، مضادات التهاب)', pts: 1 },
    { id: 'd2', t: 'إفراط في الكحول', pts: 1 },
  ],
  bands: [
    { max: 2, label: 'خطر نزيف منخفض', kind: 'ok', note: 'تابع كالمعتاد.' },
    { max: 99, label: 'خطر نزيف مرتفع', kind: 'warn', note: 'عالج ما يمكن تعديله: اضبط الضغط، أوقف مضادات الالتهاب غير الضرورية، راجع الأسبرين المزدوج، وقلل الكحول — ثم تابع عن قرب. النتيجة المرتفعة ليست مانعاً لمضاد التخثر.' },
  ],
},

/* ============ العدوى ============ */
{
  id: 'centor', cat: 'عدوى', type: 'score',
  title: 'Centor / McIsaac', sub: 'احتمالية التهاب الحلق البكتيري',
  tags: ['حلق', 'سترب', 'centor', 'مضاد حيوي'],
  items: [
    { id: 'f', t: 'حرارة أكثر من 38 درجة', pts: 1 },
    { id: 'c', t: 'غياب السعال', pts: 1 },
    { id: 'n', t: 'تضخم وإيلام العقد الرقبية الأمامية', pts: 1 },
    { id: 't', t: 'تورم أو إفرازات على اللوزتين', pts: 1 },
    { id: 'a', t: 'العمر', type: 'radio', opts: [{ t: '3 – 14 سنة', pts: 1 }, { t: '15 – 44 سنة', pts: 0 }, { t: '45 فأكثر', pts: -1 }] },
  ],
  bands: [
    { max: 1, label: 'احتمالية منخفضة (1 – 10%)', kind: 'ok', note: 'لا مسحة ولا مضاد حيوي. علاج عرضي وطمأنة.' },
    { max: 3, label: 'احتمالية متوسطة (11 – 35%)', kind: 'warn', note: 'اعمل مسحة سريعة، وعالج فقط عند النتيجة الموجبة.' },
    { max: 99, label: 'احتمالية مرتفعة (> 50%)', kind: 'danger', note: 'مسحة سريعة أو علاج تجريبي حسب الحالة السريرية. أموكسيسيلين 500 مج مرتين يومياً لمدة 10 أيام.' },
  ],
  foot: 'استبعد دائماً: صعوبة بلع اللعاب، صوت مكتوم، انحراف اللهاة، أو تيبّس رقبة — علامات خرّاج أو التهاب لسان مزمار.',
},

{
  id: 'wells-dvt', cat: 'عدوى', type: 'score',
  title: 'Wells للجلطة الوريدية', sub: 'احتمالية جلطة الساق العميقة',
  tags: ['جلطة', 'dvt', 'ساق', 'wells'],
  items: [
    { id: 'ca', t: 'سرطان نشط (علاج خلال 6 شهور أو ملطّف)', pts: 1 },
    { id: 'par', t: 'شلل أو جبيرة حديثة في الطرف السفلي', pts: 1 },
    { id: 'bed', t: 'ملازمة فراش ≥ 3 أيام أو جراحة كبرى خلال 12 أسبوعاً', pts: 1 },
    { id: 'tend', t: 'إيلام موضعي على مسار الأوردة العميقة', pts: 1 },
    { id: 'swell', t: 'تورّم الساق بالكامل', pts: 1 },
    { id: 'calf', t: 'فرق محيط الساق أكثر من 3 سم عن الجهة الأخرى', pts: 1 },
    { id: 'pit', t: 'وذمة انطباعية في الساق المصابة فقط', pts: 1 },
    { id: 'coll', t: 'أوردة سطحية جانبية بارزة (غير دوالي)', pts: 1 },
    { id: 'prev', t: 'جلطة وريدية عميقة سابقة موثّقة', pts: 1 },
    { id: 'alt', t: 'يوجد تشخيص بديل أرجح من الجلطة', pts: -2 },
  ],
  bands: [
    { max: 0, label: 'احتمالية منخفضة', kind: 'ok', note: 'D-dimer عالي الحساسية: إذا كان سلبياً تُستبعد الجلطة عملياً. إذا كان إيجابياً اطلب دوبلر.' },
    { max: 99, label: 'احتمالية مرتفعة', kind: 'danger', note: 'اطلب دوبلر مباشرة ولا تعتمد على D-dimer. فكّر بالتمييع الوقائي أثناء انتظار التصوير إن كان التأخير طويلاً والخطر النزفي منخفضاً.' },
  ],
},

/* ============ النفسية ============ */
{
  id: 'phq9', cat: 'نفسية', type: 'score',
  title: 'PHQ-9', sub: 'شدة أعراض الاكتئاب — آخر أسبوعين',
  tags: ['اكتئاب', 'phq', 'نفسية', 'مزاج'],
  scale: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'كل يوم تقريباً'],
  items: [
    { id: 'q1', t: 'قلة الاهتمام أو المتعة في عمل الأشياء', type: 'scale' },
    { id: 'q2', t: 'الشعور بالإحباط أو الاكتئاب أو فقدان الأمل', type: 'scale' },
    { id: 'q3', t: 'صعوبة في النوم أو النوم أكثر من اللازم', type: 'scale' },
    { id: 'q4', t: 'الشعور بالتعب أو قلة الطاقة', type: 'scale' },
    { id: 'q5', t: 'ضعف الشهية أو الإفراط في الأكل', type: 'scale' },
    { id: 'q6', t: 'الشعور بالسوء تجاه النفس أو بالفشل أو بخذلان الأهل', type: 'scale' },
    { id: 'q7', t: 'صعوبة التركيز في القراءة أو مشاهدة التلفاز', type: 'scale' },
    { id: 'q8', t: 'بطء واضح في الحركة والكلام، أو العكس: تململ زائد', type: 'scale' },
    { id: 'q9', t: 'أفكار بأنك أفضل لو كنت ميتاً أو بإيذاء نفسك', type: 'scale', flag: true },
  ],
  bands: [
    { max: 4, label: 'لا يوجد اكتئاب يُذكر', kind: 'ok', note: 'لا حاجة لعلاج. طمئن وأعد التقييم عند تغيّر الأعراض.' },
    { max: 9, label: 'اكتئاب خفيف', kind: 'warn', note: 'مراقبة نشطة، تفعيل سلوكي، رياضة منتظمة، وإعادة تقييم بعد أسبوعين.' },
    { max: 14, label: 'اكتئاب متوسط', kind: 'warn', note: 'ابدأ علاجاً: SSRI أو علاج معرفي سلوكي أو كليهما، ومتابعة خلال أسبوعين.' },
    { max: 19, label: 'اكتئاب متوسط إلى شديد', kind: 'danger', note: 'علاج دوائي + إحالة للعلاج النفسي، ومتابعة قريبة.' },
    { max: 99, label: 'اكتئاب شديد', kind: 'danger', note: 'علاج دوائي فوري وإحالة للطب النفسي، مع تقييم دقيق لخطر الانتحار.' },
  ],
  foot: 'أي إجابة إيجابية على السؤال التاسع تستوجب تقييماً مباشراً لخطر الانتحار مهما كانت الدرجة الكلية.',
},

{
  id: 'gad7', cat: 'نفسية', type: 'score',
  title: 'GAD-7', sub: 'شدة أعراض القلق — آخر أسبوعين',
  tags: ['قلق', 'gad', 'نفسية', 'توتر'],
  scale: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'كل يوم تقريباً'],
  items: [
    { id: 'q1', t: 'الشعور بالتوتر أو القلق أو الانزعاج', type: 'scale' },
    { id: 'q2', t: 'عدم القدرة على إيقاف القلق أو التحكم فيه', type: 'scale' },
    { id: 'q3', t: 'القلق الزائد حول أمور مختلفة', type: 'scale' },
    { id: 'q4', t: 'صعوبة الاسترخاء', type: 'scale' },
    { id: 'q5', t: 'التململ لدرجة صعوبة الجلوس بهدوء', type: 'scale' },
    { id: 'q6', t: 'سرعة الانزعاج أو الاستثارة', type: 'scale' },
    { id: 'q7', t: 'الشعور بالخوف وكأن شيئاً سيئاً سيحدث', type: 'scale' },
  ],
  bands: [
    { max: 4, label: 'قلق ضئيل', kind: 'ok', note: 'لا حاجة لتدخل دوائي.' },
    { max: 9, label: 'قلق خفيف', kind: 'warn', note: 'تثقيف، تمارين تنفس واسترخاء، نشاط بدني، وإعادة تقييم.' },
    { max: 14, label: 'قلق متوسط', kind: 'warn', note: 'علاج معرفي سلوكي و/أو SSRI. ابدأ بنصف الجرعة لتقليل التهيّج الأولي.' },
    { max: 99, label: 'قلق شديد', kind: 'danger', note: 'علاج دوائي + إحالة للعلاج النفسي، وتقييم الاكتئاب المصاحب.' },
  ],
  foot: 'استبعد الأسباب العضوية: فرط نشاط الغدة الدرقية، فقر الدم، الكافيين الزائد، اضطراب النظم، وسحب المهدئات.',
},

/* ============ مخبرية ============ */
{
  id: 'a1c', cat: 'مخبرية', type: 'form',
  title: 'تحويل HbA1c', sub: 'إلى متوسط السكر التقديري',
  tags: ['سكري', 'hba1c', 'تحويل', 'تراكمي'],
  fields: [{ id: 'a', label: 'HbA1c', unit: '%', type: 'number', step: '0.1' }],
  compute(v) {
    const a = _n(v.a);
    if (!a) return null;
    const eag = 28.7 * a - 46.7;
    let i, kind;
    if (a < 5.7) { i = 'طبيعي'; kind = 'ok'; }
    else if (a < 6.5) { i = 'ما قبل السكري'; kind = 'warn'; }
    else if (a < 7) { i = 'سكري — ضمن الهدف لأغلب البالغين'; kind = 'ok'; }
    else if (a < 8) { i = 'سكري — فوق الهدف قليلاً'; kind = 'warn'; }
    else { i = 'سكري غير مضبوط'; kind = 'danger'; }
    return { v: _r(eag, 0), u: 'mg/dL متوسط تقديري', i, kind, lines: [
      `أي ما يعادل ${_r(eag / 18, 1)} mmol/L.`,
      'قد يكون HbA1c غير موثوق مع: فقر الدم، اعتلالات الهيموجلوبين، الحمل، القصور الكلوي، أو بعد نقل دم — عندها اعتمد على القياس المستمر أو الفركتوزامين.',
    ]};
  },
},

{
  id: 'ca-corr', cat: 'مخبرية', type: 'form',
  title: 'الكالسيوم المصحّح', sub: 'التصحيح حسب الألبيومين',
  tags: ['كالسيوم', 'البيومين', 'calcium'],
  fields: [
    { id: 'ca', label: 'الكالسيوم المقاس', unit: 'mg/dL', type: 'number', step: '0.1' },
    { id: 'alb', label: 'الألبيومين', unit: 'g/dL', type: 'number', step: '0.1' },
  ],
  compute(v) {
    const ca = _n(v.ca), alb = _n(v.alb);
    if (!ca || !alb) return null;
    const c = ca + 0.8 * (4 - alb);
    let i, kind;
    if (c < 8.5) { i = 'نقص كالسيوم'; kind = 'warn'; }
    else if (c <= 10.5) { i = 'ضمن الطبيعي'; kind = 'ok'; }
    else if (c <= 12) { i = 'ارتفاع كالسيوم بسيط'; kind = 'warn'; }
    else { i = 'ارتفاع كالسيوم كبير — يستدعي تقييماً عاجلاً'; kind = 'danger'; }
    return { v: _r(c, 2), u: 'mg/dL', i, kind, lines: [
      'مع أي خلل حقيقي اطلب: PTH، فيتامين د، فوسفات، مغنيسيوم، ووظائف كلى.',
      'أشيع أسباب ارتفاع الكالسيوم في العيادة: فرط نشاط جارات الدرقية الأولي والأورام.',
    ]};
  },
},

{
  id: 'fib4', cat: 'مخبرية', type: 'form',
  title: 'FIB-4', sub: 'تقدير تليّف الكبد في الكبد الدهني',
  tags: ['كبد', 'دهني', 'fib4', 'تليف'],
  fields: [
    { id: 'age', label: 'العمر', unit: 'سنة', type: 'number' },
    { id: 'ast', label: 'AST', unit: 'U/L', type: 'number' },
    { id: 'alt', label: 'ALT', unit: 'U/L', type: 'number' },
    { id: 'plt', label: 'الصفائح الدموية', unit: '10⁹/L', type: 'number' },
  ],
  compute(v) {
    const age = _n(v.age), ast = _n(v.ast), alt = _n(v.alt), plt = _n(v.plt);
    if (!age || !ast || !alt || !plt) return null;
    const f = (age * ast) / (plt * Math.sqrt(alt));
    let i, kind, lines;
    if (f < 1.3) { i = 'احتمالية تليّف متقدم منخفضة'; kind = 'ok'; lines = ['تابع في الرعاية الأولية مع إدارة عوامل الخطر الأيضية، وأعد الحساب كل 2 – 3 سنوات.']; }
    else if (f <= 2.67) { i = 'نطاق غير حاسم'; kind = 'warn'; lines = ['يحتاج فحصاً إضافياً: الليونة الكبدية (فايبروسكان) أو ELF.']; }
    else { i = 'احتمالية تليّف متقدم مرتفعة'; kind = 'danger'; lines = ['حوّل لعيادة الكبد للتقييم.']; }
    lines.push('عند من هم فوق 65 سنة يميل المؤشر للمبالغة — استخدم عتبة أعلى (2.0).');
    return { v: _r(f, 2), u: '', i, kind, lines };
  },
},

/* ============ أطفال وحمل ============ */
{
  id: 'peds-dose', cat: 'أطفال', type: 'form',
  title: 'جرعة الطفل بالمليلتر', sub: 'حساب الحجم من الوزن والتركيز',
  tags: ['أطفال', 'جرعة', 'شراب', 'وزن'],
  fields: [
    { id: 'w', label: 'وزن الطفل', unit: 'كجم', type: 'number', step: '0.1' },
    { id: 'drug', label: 'الدواء', type: 'select', opts: [
      { v: '15|120|5|كل 6 ساعات|1000', t: 'باراسيتامول شراب 120 مج / 5 مل' },
      { v: '15|250|5|كل 6 ساعات|1000', t: 'باراسيتامول شراب 250 مج / 5 مل' },
      { v: '10|100|5|كل 8 ساعات|400', t: 'إيبوبروفين شراب 100 مج / 5 مل' },
      { v: '25|125|5|مرتين يومياً|500', t: 'أموكسيسيلين 250 مج / 5 مل — 50 مج/كجم/يوم' },
      { v: '45|400|5|مرتين يومياً|1000', t: 'أموكسيسيلين 400 مج / 5 مل — 90 مج/كجم/يوم (أذن)' },
      { v: '22.5|228|5|مرتين يومياً|875', t: 'أموكسي-كلاف 228 مج / 5 مل — 45 مج/كجم/يوم' },
      { v: '10|200|5|مرة يومياً|500', t: 'أزيثرومايسين 200 مج / 5 مل — اليوم الأول' },
      { v: '12.5|250|5|4 مرات يومياً|500', t: 'سيفاليكسين 250 مج / 5 مل — 50 مج/كجم/يوم' },
      { v: '1|15|5|مرة يومياً|40', t: 'بريدنيزولون 15 مج / 5 مل — 1 مج/كجم' },
      { v: '0.15|4|5|جرعة واحدة|4', t: 'أوندانسيترون 4 مج / 5 مل' },
    ]},
  ],
  compute(v) {
    const w = _n(v.w);
    if (!w || !v.drug) return null;
    const [mgkg, conc, per, freq, cap] = v.drug.split('|');
    let dose = w * (+mgkg);
    const lines = [];
    if (+cap && dose > +cap) { dose = +cap; lines.push(`تم تطبيق الحد الأقصى للجرعة الواحدة (${cap} مج).`); }
    const ml = dose / (+conc / +per);
    lines.unshift(`الجرعة: ${_r(dose, 1)} مج — ${freq}`);
    if (w > 40) lines.push('الوزن قريب من وزن البالغ — لا تتجاوز جرعة البالغين.');
    lines.push('تحقّق من تركيز العبوة الفعلي قبل الصرف — التركيزات تختلف بين الشركات.');
    return { v: _r(ml, 1), u: 'مل لكل جرعة', i: freq, kind: 'ok', lines };
  },
},

{
  id: 'fluids', cat: 'أطفال', type: 'form',
  title: 'سوائل الصيانة للطفل', sub: 'قاعدة Holliday-Segar',
  tags: ['سوائل', 'أطفال', 'جفاف', 'صيانة'],
  fields: [{ id: 'w', label: 'الوزن', unit: 'كجم', type: 'number', step: '0.1' }],
  compute(v) {
    const w = _n(v.w);
    if (!w) return null;
    let day;
    if (w <= 10) day = w * 100;
    else if (w <= 20) day = 1000 + (w - 10) * 50;
    else day = 1500 + (w - 20) * 20;
    const hr = day / 24;
    const ors = [_r(w * 50, 0), _r(w * 100, 0)];
    const bolus = _r(w * 20, 0);
    return { v: _r(hr, 0), u: 'مل/ساعة', i: `أي ${_r(day, 0)} مل خلال 24 ساعة`, kind: 'ok', lines: [
      `تعويض فموي للجفاف الخفيف/المتوسط: ${ors[0]} – ${ors[1]} مل خلال 4 ساعات.`,
      `بولس وريدي للجفاف الشديد: ${bolus} مل (20 مل/كجم نورمال سالين).`,
      'أضف 10 مل/كجم بعد كل إسهال و 2 مل/كجم بعد كل قيئة.',
    ]};
  },
},

{
  id: 'edd', cat: 'أطفال', type: 'form',
  title: 'عمر الحمل وتاريخ الولادة', sub: 'من تاريخ آخر دورة',
  tags: ['حمل', 'ولادة', 'edd', 'دورة'],
  fields: [
    { id: 'lmp', label: 'أول يوم في آخر دورة', type: 'date' },
    { id: 'cyc', label: 'طول الدورة', unit: 'يوم (الافتراضي 28)', type: 'number', def: '28' },
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
    if (days < 0) return { v: '—', u: '', i: 'التاريخ المُدخل في المستقبل', kind: 'warn', lines: [] };
    const wk = Math.floor(days / 7), d = days % 7;
    const fmt = dt => dt.toLocaleDateString('ar-SA-u-ca-gregory', { year: 'numeric', month: 'long', day: 'numeric' });
    let i, kind;
    if (wk < 14) { i = 'الثلث الأول'; kind = 'ok'; }
    else if (wk < 28) { i = 'الثلث الثاني'; kind = 'ok'; }
    else if (wk < 37) { i = 'الثلث الثالث'; kind = 'warn'; }
    else if (wk < 42) { i = 'حمل مكتمل'; kind = 'warn'; }
    else { i = 'حمل متجاوز — يستدعي تقييماً'; kind = 'danger'; }
    const lines = [`تاريخ الولادة المتوقع: ${fmt(edd)}`];
    if (wk < 14) lines.push('محطة قادمة: سونار الشفافية القفوية في الأسبوع 11 – 14.');
    else if (wk < 22) lines.push('محطة قادمة: السونار التفصيلي في الأسبوع 18 – 22.');
    else if (wk < 28) lines.push('محطة قادمة: فحص سكري الحمل في الأسبوع 24 – 28، وأنتي-D عند الأسبوع 28 لسالبات Rh.');
    else if (wk < 37) lines.push('محطة قادمة: تطعيم Tdap بين 27 و 36، ومسحة GBS بين 35 و 37.');
    lines.push('السونار في الثلث الأول أدق من تاريخ الدورة عند اختلافهما بأكثر من 7 أيام.');
    return { v: `${wk} أسبوع + ${d}`, u: '', i, kind, lines };
  },
},

/* ============ متفرقات ============ */
{
  id: 'anion', cat: 'مخبرية', type: 'form',
  title: 'الفجوة الأنيونية والصوديوم المصحّح',
  sub: 'مع التصحيح للألبيومين والسكر',
  tags: ['فجوة', 'صوديوم', 'حماض', 'انيون'],
  fields: [
    { id: 'na', label: 'الصوديوم', unit: 'mmol/L', type: 'number' },
    { id: 'cl', label: 'الكلورايد', unit: 'mmol/L', type: 'number' },
    { id: 'hco3', label: 'البيكربونات', unit: 'mmol/L', type: 'number' },
    { id: 'alb', label: 'الألبيومين (اختياري)', unit: 'g/dL', type: 'number', step: '0.1' },
    { id: 'glu', label: 'سكر الدم (اختياري)', unit: 'mg/dL', type: 'number' },
  ],
  compute(v) {
    const na = _n(v.na), cl = _n(v.cl), hco3 = _n(v.hco3);
    if (!na || !cl || !hco3) return null;
    let ag = na - (cl + hco3);
    const lines = [`الفجوة غير المصحّحة: ${_r(ag, 1)}`];
    const alb = _n(v.alb);
    if (alb) { ag = ag + 2.5 * (4 - alb); lines.push(`بعد التصحيح للألبيومين: ${_r(ag, 1)}`); }
    const glu = _n(v.glu);
    if (glu && glu > 100) lines.push(`الصوديوم المصحّح للسكر: ${_r(na + 1.6 * (glu - 100) / 100, 1)} mmol/L`);
    let i, kind;
    if (ag > 12) { i = 'فجوة أنيونية مرتفعة'; kind = 'danger'; lines.push('الأسباب (GOLDMARK): حماض كيتوني، لاكتيك، فشل كلوي، تسمم بالكحوليات أو الساليسيلات.'); }
    else if (ag < 8) { i = 'فجوة منخفضة'; kind = 'warn'; lines.push('فكّر بنقص الألبيومين أو المايلوما.'); }
    else { i = 'فجوة طبيعية'; kind = 'ok'; }
    return { v: _r(ag, 1), u: 'mmol/L', i, kind, lines };
  },
},

{
  id: 'smoke', cat: 'وقاية', type: 'form',
  title: 'سنوات العلبة', sub: 'قياس العبء التدخيني',
  tags: ['تدخين', 'pack year', 'رئة'],
  fields: [
    { id: 'p', label: 'عدد العلب يومياً', unit: 'علبة = 20 سيجارة', type: 'number', step: '0.05' },
    { id: 'y', label: 'عدد سنوات التدخين', unit: 'سنة', type: 'number', step: '0.5' },
  ],
  compute(v) {
    const p = _n(v.p), y = _n(v.y);
    if (!p || !y) return null;
    const py = p * y;
    let i, kind, lines = [];
    if (py >= 20) { i = 'عبء تدخيني ثقيل'; kind = 'danger'; lines.push('مؤهل لفحص سرطان الرئة بالمقطعية منخفضة الجرعة إذا كان العمر 50 – 80 سنة (حالياً أو أقلع خلال 15 سنة).'); }
    else { i = 'دون عتبة فحص سرطان الرئة'; kind = 'warn'; }
    lines.push('اعرض المساعدة على الإقلاع في كل زيارة: النصيحة القصيرة وحدها ترفع فرص الإقلاع.');
    lines.push('العلاج المتاح: بدائل النيكوتين (لصقة + علكة معاً)، فارينيكلين، أو بوبروبيون — مع الدعم السلوكي.');
    return { v: _r(py, 1), u: 'سنة/علبة', i, kind, lines };
  },
},
];
