'use strict';

(() => {
  const STORAGE_KEY = 'fareeq.hr.v1';
  const paths = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    users:
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-13 5h2m4 0h2"/>',
    chart: '<path d="M4 3v18h17M8 16v-5m5 5V6m5 10V9"/>',
    settings:
      '<path d="m9 3-.5 2a7 7 0 0 0-2 1L4.5 5.5l-2 3.5L4 10.5a8 8 0 0 0 0 3L2.5 15l2 3.5L6.5 18a7 7 0 0 0 2 1L9 21h6l.5-2a7 7 0 0 0 2-1l2 .5 2-3.5-1.5-1.5a8 8 0 0 0 0-3L21.5 9l-2-3.5-2 .5a7 7 0 0 0-2-1L15 3Z"/><circle cx="12" cy="12" r="3"/>',
    shield:
      '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
    download:
      '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
    upload:
      '<path d="M12 16V4m-4 4 4-4 4 4M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    down: '<path d="m8 10 4 4 4-4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    edit: '<path d="m15 5 4 4M4 20l5-1L20 8a2.8 2.8 0 0 0-4-4L5 15Zm0 0h5"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    money:
      '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>',
    briefcase:
      '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12a22 22 0 0 0 18 0M10 13h4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v6m4-6v6"/>',
    file: '<path d="M14 2H5v20h14V7Zm0 0v5h5M8 12h8m-8 4h6"/>',
    heart:
      '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const icon = (name) =>
    `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.file}</svg>`;
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );
  const number = (value) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
  const today = () =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  const addDays = (date, days) => {
    const d = new Date(`${date}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const shortDate = (value) =>
    new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).format(new Date(`${value}T12:00:00Z`));
  const fullDate = (value) =>
    new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${value}T12:00:00Z`));
  const dayName = (value) =>
    new Intl.DateTimeFormat('ar-EG', {
      weekday: 'short',
      timeZone: 'UTC',
    }).format(new Date(`${value}T12:00:00Z`));
  const daysBetween = (start, end) =>
    Math.round(
      (new Date(`${end}T12:00:00Z`) - new Date(`${start}T12:00:00Z`)) /
        86400000,
    ) + 1;
  const uid = () =>
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const palette = [
    '#a2b98c',
    '#d4dfc4',
    '#73906a',
    '#e3dfbf',
    '#b8cabb',
    '#c9beab',
    '#c2d6da',
    '#bfaec9',
  ];
  const avatarColors = [
    ['#eaf0e1', '#7d9366'],
    ['#efe4d9', '#a78a6c'],
    ['#e4ecee', '#7b9298'],
    ['#eee5ee', '#9b7f99'],
    ['#e9edda', '#8b9669'],
  ];
  const statusLabels = {
    active: ['نشط', 'green'],
    inactive: ['غير نشط', 'gray'],
    present: ['حاضر', 'green'],
    late: ['متأخر', 'amber'],
    absent: ['غائب', 'red'],
    leave: ['في إجازة', 'blue'],
    unrecorded: ['لم يُسجّل', 'gray'],
    pending: ['قيد المراجعة', 'amber'],
    approved: ['مقبول', 'green'],
    rejected: ['مرفوض', 'red'],
  };
  const contractLabels = {
    full: 'دوام كامل',
    part: 'دوام جزئي',
    contractor: 'متعاقد',
  };
  const viewMeta = {
    dashboard: [
      'نظرة عامة',
      'كل يوم، فريق أفضل',
      'صورة واضحة عن فريقك، وكل ما يحتاج انتباهك اليوم.',
    ],
    employees: ['الموظفون', 'الأشخاص أولًا', 'كل تفاصيل فريقك في مكان واحد.'],
    attendance: [
      'الحضور والانصراف',
      'يوم عمل منظم',
      'سجّل الحضور وأوقات العمل، وراجع كل يوم بسهولة.',
    ],
    leaves: [
      'طلبات الإجازة',
      'مساحة للراحة',
      'تابع طلبات فريقك واتخذ القرار المناسب.',
    ],
    reports: [
      'تقارير الفريق',
      'قرارات تبدأ من البيانات',
      'مؤشرات محسوبة من بيانات الموظفين والسجلات المحفوظة.',
    ],
    settings: [
      'إعدادات المساحة',
      'مساحتك، بطريقتك',
      'خصّص بيانات شركتك واحتفظ بنسخة من عملك.',
    ],
  };
  const ui = {
    view: 'dashboard',
    search: '',
    department: 'all',
    status: 'all',
    date: today(),
    leaveStatus: 'all',
  };
  let state;
  let toastTimer;
  let confirmCallback = null;

  function seed() {
    // Project-based seed. Technical placeholders are NOT verified employment facts.
    const rows = [
      ['مالك النشاط','المدير العام والمالية','الإدارة','owner','full'],
      ['عمر يحيى','Media Buyer وبحث المنتجات','التسويق','omar','full'],
      ['إسراء','خدمة العملاء وإدخال الطلبات','العمليات وخدمة العملاء','israa','full'],
      ['مسؤول الكرياتيف (الاسم غير متاح)','إعداد وتنفيذ المحتوى الإعلاني','الكرياتيف','creative','full'],
      ['فريد','إنتاج المحتوى','المحتوى','farid','contractor'],
      ['محمد إسماعيل','Amazon Research & Operations','Amazon','mohamed','contractor']
    ];
    return {
      version: 1,
      demo: true,
      settings: { company: 'AI Growth | Hit & Run & Mellow', currency: 'EGP' },
      employees: rows.map((r,i)=>({
        id: 'project-'+(i+1),code:'TEAM-'+String(i+1).padStart(3,'0'),
        name:r[0],title:r[1],department:r[2],
        email:r[3]+'@example.com',phone:'',salary:0,
        startDate:'2026-10-21',status:'active',contract:r[4]
      })),
      attendance: [],
      leaves: []
    };
  }

  function validDate(value) {
    return (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) &&
      new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
    );
  }

  function validState(data) {
    if (
      !data ||
      data.version !== 1 ||
      typeof data.demo !== 'boolean' ||
      !data.settings ||
      typeof data.settings.company !== 'string' ||
      !data.settings.company.trim() ||
      data.settings.company.length > 60 ||
      !['EGP', 'SAR', 'AED', 'USD'].includes(data.settings.currency)
    )
      return false;
    if (
      ![data.employees, data.attendance, data.leaves].every(Array.isArray) ||
      data.employees.length > 10000 ||
      data.attendance.length > 300000 ||
      data.leaves.length > 50000
    )
      return false;
    const ids = new Set();
    const codes = new Set();
    const emails = new Set();
    for (const e of data.employees) {
      if (
        !e ||
        !['id', 'code', 'name', 'title', 'department', 'email', 'phone'].every(
          (k) => typeof e[k] === 'string' && e[k].length <= 250,
        ) ||
        !e.id ||
        !e.name.trim() ||
        !e.department.trim() ||
        !e.code ||
        ids.has(e.id) ||
        codes.has(e.code) ||
        emails.has(e.email.toLowerCase()) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email) ||
        !Number.isFinite(e.salary) ||
        e.salary < 0 ||
        e.salary > 1e9 ||
        !validDate(e.startDate) ||
        !['active', 'inactive'].includes(e.status) ||
        !Object.hasOwn(contractLabels, e.contract)
      )
        return false;
      ids.add(e.id);
      codes.add(e.code);
      emails.add(e.email.toLowerCase());
    }
    const attendanceKeys = new Set();
    for (const a of data.attendance) {
      if (
        !a ||
        !ids.has(a.employeeId) ||
        !validDate(a.date) ||
        !['present', 'late', 'absent', 'leave'].includes(a.status)
      )
        return false;
      const key = `${a.employeeId}:${a.date}`;
      if (
        attendanceKeys.has(key) ||
        ![a.checkIn, a.checkOut].every(
          (v) =>
            typeof v === 'string' &&
            (v === '' || /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v)),
        )
      )
        return false;
      if (
        ['present', 'late'].includes(a.status) &&
        (!a.checkIn || (a.checkOut && a.checkOut < a.checkIn))
      )
        return false;
      if (['absent', 'leave'].includes(a.status) && (a.checkIn || a.checkOut))
        return false;
      attendanceKeys.add(key);
    }
    const leaveIds = new Set();
    for (const l of data.leaves) {
      if (
        !l ||
        typeof l.id !== 'string' ||
        !l.id ||
        leaveIds.has(l.id) ||
        !ids.has(l.employeeId) ||
        !['سنوية', 'مرضية', 'شخصية', 'بدون راتب'].includes(l.type) ||
        !validDate(l.from) ||
        !validDate(l.to) ||
        l.to < l.from ||
        !validDate(l.createdAt) ||
        typeof l.reason !== 'string' ||
        l.reason.length > 500 ||
        !['pending', 'approved', 'rejected'].includes(l.status)
      )
        return false;
      leaveIds.add(l.id);
    }
    return true;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!validState(parsed)) throw new Error('invalid saved data');
        if (parsed.demo && parsed.employees.length === 12 && parsed.employees.every(e => String(e.id).startsWith('demo-'))) {
          const fresh = seed(); localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); return fresh;
        }
        return parsed;
      }
      const initial = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    } catch {
      $('#storage-warning').hidden = false;
      return seed();
    }
  }

  function save(next) {
    try {
      if (!validState(next)) throw new Error('invalid data');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      state = next;
      $('#storage-warning').hidden = true;
      return true;
    } catch {
      $('#storage-warning').hidden = false;
      toast('لم يتم الحفظ. تحقق من مساحة التخزين وإعدادات المتصفح.', true);
      return false;
    }
  }

  const activeEmployees = () =>
    state.employees.filter((e) => e.status === 'active');
  const departments = () =>
    [...new Set(state.employees.map((e) => e.department))].sort((a, b) =>
      a.localeCompare(b, 'ar'),
    );
  const employeeById = (id) => state.employees.find((e) => e.id === id);
  const recordFor = (id, date) =>
    state.attendance.find((a) => a.employeeId === id && a.date === date);
  const currencyLabel = () =>
    ({ EGP: 'ج.م', SAR: 'ر.س', AED: 'د.إ', USD: '$' })[state.settings.currency];
  const money = (value) => `${number(value)} ${currencyLabel()}`;
  const badge = (status) => {
    const [label, color] = statusLabels[status] || statusLabels.unrecorded;
    return `<span class="badge ${color}">${label}</span>`;
  };
  function avatar(e, large = false) {
    const n =
      [...e.id].reduce((sum, c) => sum + c.charCodeAt(0), 0) %
      avatarColors.length;
    const [bg, fg] = avatarColors[n];
    const initials = e.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('');
    return `<span class="avatar${large ? ' large' : ''}" style="background:${bg};color:${fg}" aria-hidden="true">${esc(initials)}</span>`;
  }
  function person(e, showTitle = false) {
    return `<div class="person">${avatar(e)}<div><strong>${esc(e.name)}</strong><small${showTitle ? ' style="direction:rtl"' : ''}>${esc(showTitle ? e.title : e.code)}</small></div></div>`;
  }
  function button(label, action, iconName = '', className = '', extra = '') {
    return `<button type="button" class="button ${className}" data-action="${action}" ${extra}>${iconName ? icon(iconName) : ''}${label}</button>`;
  }
  function empty(title, text, action = '', label = '') {
    return `<div class="empty">${icon('users')}<strong>${esc(title)}</strong><p>${esc(text)}</p>${action ? button(label, action, 'plus', 'primary') : ''}</div>`;
  }
  function toast(message, error = false) {
    clearTimeout(toastTimer);
    const el = $('#toast');
    el.classList.toggle('error', error);
    el.innerHTML = `${icon(error ? 'info' : 'check')}<span>${esc(message)}</span>`;
    el.hidden = false;
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 4500);
  }
  function statistics(date = today()) {
    const active = activeEmployees();
    const stats = {
      total: active.length,
      present: 0,
      late: 0,
      absent: 0,
      leave: 0,
      unrecorded: 0,
    };
    active.forEach((e) => {
      const a = recordFor(e.id, date);
      stats[a?.status || 'unrecorded']++;
    });
    stats.rate = stats.total
      ? Math.round(((stats.present + stats.late) / stats.total) * 100)
      : 0;
    return stats;
  }
  function statCard(
    label,
    value,
    unit,
    iconName,
    note,
    highlight = false,
  ) {
    return `<article class="stat-card${highlight ? ' highlight' : ''}"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon(iconName)}</span></div><div class="stat-number">${number(value)}${unit ? `<small>${unit}</small>` : ''}</div><div class="stat-bottom">${note}</div></article>`;
  }
  function dashboardStats() {
    const s = statistics();
    const pending = state.leaves.filter((l) => l.status === 'pending').length;
    return `<div class="stat-grid">${statCard('إجمالي الموظفين', state.employees.length, 'موظف', 'users', `<em>${number(s.total)} نشط</em> ضمن فريقك`)}${statCard('الحاضرون اليوم', s.present + s.late, 'موظف', 'clock', `<em>${s.rate}%</em> من الموظفين النشطين`, true)}${statCard('في إجازة اليوم', s.leave, 'موظف', 'sun', 'حسب سجل الحضور اليوم')}${statCard('طلبات قيد المراجعة', pending, 'طلب', 'calendar', pending ? 'بانتظار قرارك' : 'كل الطلبات تمت مراجعتها')}</div>`;
  }
  function attendanceChart() {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6));
    const stats = dates.map((d) => statistics(d));
    const max = Math.max(4, ...stats.map((s) => s.total));
    const recordedDays = stats.filter(
      (s) => s.present + s.late + s.absent + s.leave > 0,
    );
    const avg = recordedDays.length
      ? Math.round(
          recordedDays.reduce((n, s) => n + s.rate, 0) / recordedDays.length,
        )
      : 0;
    return `<section class="panel"><div class="panel-header"><div><h2>الحضور خلال الأسبوع</h2><p>آخر ٧ أيام · الموظفون النشطون</p></div><span class="panel-tag">هذا الأسبوع ${icon('calendar')}</span></div><div class="attendance-chart"><div class="chart-legend"><span><i class="legend-dot" style="background:#b1c69c"></i>حضور في الموعد</span><span><i class="legend-dot" style="background:#e3dfc7"></i>حضور متأخر</span></div><div class="chart-area" role="img" aria-label="${esc(dates.map((d, i) => `${shortDate(d)}: ${stats[i].present} حاضر في الموعد، ${stats[i].late} متأخر`).join('؛ '))}"><div class="chart-axis"><span>${number(max)}</span><span>${number(Math.round(max * 0.75))}</span><span>${number(Math.round(max * 0.5))}</span><span>${number(Math.round(max * 0.25))}</span><span>0</span></div><div class="chart-bars">${dates.map((d, i) => `<div class="bar-group${d === today() ? ' today' : ''}"><div class="chart-bar present" style="height:${(stats[i].present / max) * 100}%"></div><div class="chart-bar late" style="height:${(stats[i].late / max) * 100}%"></div><span class="bar-label">${d === today() ? 'اليوم' : dayName(d)}</span></div>`).join('')}</div></div><div class="chart-summary">${icon('chart')} متوسط الحضور ${number(avg)}% ${recordedDays.length ? 'للأيام المسجّلة' : '· لا توجد سجلات بعد'}</div></div></section>`;
  }
  function departmentPanel() {
    const active = activeEmployees();
    const groups = [...new Set(active.map((e) => e.department))]
      .map((d) => ({
        name: d,
        count: active.filter((e) => e.department === d).length,
      }))
      .sort((a, b) => b.count - a.count);
    const circumference = 2 * Math.PI * 48;
    let offset = 0;
    const arcs = groups
      .map((g, i) => {
        const length = (g.count / active.length) * circumference;
        const arc = `<circle cx="64" cy="64" r="48" fill="none" stroke="${palette[i % palette.length]}" stroke-width="13" stroke-dasharray="${Math.max(0, length - 3)} ${circumference}" stroke-dashoffset="${-offset}"/>`;
        offset += length;
        return arc;
      })
      .join('');
    return `<section class="panel"><div class="panel-header"><div><h2>توزيع الفريق</h2><p>أشخاص مختلفون، هدف واحد</p></div>${icon('users')}</div><div class="department-body"><div class="donut" role="img" aria-label="${esc(groups.map((g) => `${g.name}: ${g.count}`).join('، ') || 'لا يوجد موظفون نشطون')}"><svg viewBox="0 0 128 128" aria-hidden="true"><circle cx="64" cy="64" r="48" fill="none" stroke="#f0f4e8" stroke-width="13"/>${arcs}</svg><div class="donut-label"><strong>${number(active.length)}</strong><span>موظف نشط</span></div></div><div class="department-legend">${groups.map((g, i) => `<div class="department-line"><i style="background:${palette[i % palette.length]}"></i><span>${esc(g.name)}</span><strong>${number(g.count)}</strong></div>`).join('') || '<span class="report-note">أضف أول موظف لعرض الأقسام.</span>'}</div></div><div class="department-foot"><span>${number(groups.length)} أقسام في فريقك</span><a href="#reports">عرض التفاصيل ←</a></div></section>`;
  }
  function filteredEmployees() {
    const q = ui.search.trim().toLocaleLowerCase('ar');
    return state.employees.filter(
      (e) =>
        (!q ||
          [e.name, e.email, e.department, e.title, e.code].some((v) =>
            v.toLocaleLowerCase('ar').includes(q),
          )) &&
        (ui.department === 'all' || e.department === ui.department) &&
        (ui.status === 'all' || e.status === ui.status),
    );
  }
  function employeeTable(employees, compact = false) {
    if (!employees.length)
      return empty(
        'لا يوجد موظفون هنا',
        ui.search || ui.department !== 'all' || ui.status !== 'all'
          ? 'جرّب تغيير البحث أو الفلاتر.'
          : 'ابدأ بإضافة أول شخص إلى فريقك.',
        'add-employee',
        'إضافة موظف',
      );
    return `<div class="table-wrapper"><table><thead><tr><th>الموظف</th><th>القسم</th><th>${compact ? 'المسمى الوظيفي' : 'نوع التعاقد'}</th><th>الحالة</th>${compact ? '' : '<th>تاريخ الانضمام</th><th>الراتب الأساسي</th>'}<th><span class="sr-only">إجراءات</span></th></tr></thead><tbody>${employees.map((e) => `<tr><td><button class="person-button" data-action="employee-details" data-id="${esc(e.id)}">${person(e)}</button></td><td><span class="department-pill">${esc(e.department)}</span></td><td>${esc(compact ? e.title : contractLabels[e.contract])}</td><td>${badge(e.status)}</td>${compact ? '' : `<td>${shortDate(e.startDate)} ${e.startDate.slice(0, 4)}</td><td dir="auto">${money(e.salary)}</td>`}<td><button class="icon-button" data-action="edit-employee" data-id="${esc(e.id)}" aria-label="تعديل ${esc(e.name)}">${icon('edit')}</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  function leaveItem(l, card = false) {
    const e = employeeById(l.employeeId);
    if (!e) return '';
    const duration = daysBetween(l.from, l.to);
    return `<article class="${card ? 'panel leave-card' : 'leave-item'}"><div class="leave-top">${person(e, true)}${badge(l.status)}</div><div class="leave-details">${icon('calendar')}<span>${shortDate(l.from)}${l.from !== l.to ? ` – ${shortDate(l.to)}` : ''}</span><span>· ${number(duration)} ${duration === 1 ? 'يوم' : 'أيام'}</span></div>${card ? `<div class="leave-meta"><span>إجازة ${esc(l.type)}</span><span>${fullDate(l.createdAt)}</span></div><div class="leave-reason">${esc(l.reason || 'بدون ملاحظات إضافية')}</div>` : ''}${l.status === 'pending' ? `<div class="leave-actions">${button('موافقة', 'approve-leave', 'check', 'success', `data-id="${esc(l.id)}"`)}${button('رفض', 'reject-leave', 'close', '', `data-id="${esc(l.id)}"`)}</div>` : card ? `<div class="leave-actions"><span class="report-note">${l.status === 'approved' ? 'تمت الموافقة على الطلب' : 'تم رفض الطلب'}</span></div>` : ''}</article>`;
  }
  function dashboard() {
    const pending = state.leaves.filter((l) => l.status === 'pending');
    const recent = [...filteredEmployees()]
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .slice(0, 5);
    return `<section class="welcome-strip"><div class="welcome-copy"><h2>أهلًا بك في ${esc(state.settings.company)} ${icon('sun')}</h2><p>يوم جديد، وفرصة جديدة للاهتمام بفريقك.</p></div><div class="welcome-date"><span class="date-icon">${icon('calendar')}</span><div><strong>${fullDate(today())}</strong><small>${dayName(today())} · بتوقيت القاهرة</small></div></div></section>${dashboardStats()}<div class="dashboard-grid">${attendanceChart()}${departmentPanel()}</div><div class="dashboard-grid"><section class="panel"><div class="panel-header"><div><h2>${ui.search ? 'نتائج البحث' : 'أحدث أعضاء الفريق'}<span class="subtle-count">${number(filteredEmployees().length)} موظف</span></h2><p>${ui.search ? `نتائج «${esc(ui.search)}»` : 'تفاصيل صغيرة، لفريق كبير الأثر'}</p></div><a class="text-link" href="#employees">عرض الكل ${icon('arrow')}</a></div>${employeeTable(recent, true)}<div class="table-footer"><span>عرض ${number(recent.length)} من ${number(filteredEmployees().length)} موظف</span><a href="#employees">دليل الموظفين ←</a></div></section><section class="panel"><div class="panel-header"><div><h2>طلبات الإجازة<span class="subtle-count">${number(pending.length)}</span></h2><p>طلبات تحتاج إلى مراجعتك</p></div><a class="text-link" href="#leaves">عرض الكل ${icon('arrow')}</a></div>${
      pending.length
        ? `<div class="leave-list">${pending
            .slice(0, 3)
            .map((l) => leaveItem(l))
            .join('')}</div>`
        : empty('كل شيء تمت مراجعته', 'ستظهر طلبات الإجازة الجديدة هنا.')
    }<div class="table-footer"><span>راحة الفريق جزء من نجاحه</span>${icon('heart')}</div></section></div>${state.demo ? `<div class="demo-caption">${icon('info')} هذه بيانات افتراضية للتجربة. يمكنك البدء بسجل فارغ من الإعدادات.</div>` : ''}`;
  }

  function employeesView() {
    const employees = filteredEmployees();
    return `<section class="panel"><div class="filter-bar"><label>القسم <select id="department-filter"><option value="all">جميع الأقسام</option>${departments()
      .map(
        (d) =>
          `<option value="${esc(d)}"${ui.department === d ? ' selected' : ''}>${esc(d)}</option>`,
      )
      .join(
        '',
      )}</select></label><label>الحالة <select id="status-filter"><option value="all">كل الحالات</option><option value="active"${ui.status === 'active' ? ' selected' : ''}>نشط</option><option value="inactive"${ui.status === 'inactive' ? ' selected' : ''}>غير نشط</option></select></label><span class="filter-summary">${ui.search ? `بحث: ${esc(ui.search)} · ` : ''}${number(employees.length)} موظف</span></div>${employeeTable(employees)}<div class="table-footer"><span>إجمالي السجلات: ${number(state.employees.length)}</span><span>اضغط على اسم الموظف لعرض ملفه</span></div></section>`;
  }
  function attendanceView() {
    const s = statistics(ui.date);
    const employees = filteredEmployees().filter((e) => e.status === 'active');
    return `<div class="stat-grid">${statCard('حضور في الموعد', s.present, 'موظف', 'check', fullDate(ui.date), true)}${statCard('حضور متأخر', s.late, 'موظف', 'clock', 'حسب السجلات المحفوظة')}${statCard('غياب / إجازة', s.absent + s.leave, 'موظف', 'calendar', `${number(s.absent)} غائب · ${number(s.leave)} في إجازة`)}${statCard('لم يسجل بعد', s.unrecorded, 'موظف', 'users', 'بدون سجل حضور لهذا التاريخ')}</div><section class="panel"><div class="filter-bar"><label for="attendance-date">تاريخ السجل <input id="attendance-date" type="date" value="${ui.date}" max="${today()}"></label><span class="filter-summary">${number(employees.length)} موظف نشط · احفظ كل سجل بعد تعديله</span></div>${
      employees.length
        ? `<div class="table-wrapper"><table><thead><tr><th>الموظف</th><th>القسم</th><th>الحالة</th><th>وقت الحضور</th><th>وقت الانصراف</th><th>الإجراء</th></tr></thead><tbody>${employees
            .map((e) => {
              const r = recordFor(e.id, ui.date);
              const status = r?.status || 'unrecorded';
              const disabled = !['present', 'late'].includes(status);
              return `<tr data-employee-row="${esc(e.id)}"><td>${person(e)}</td><td><span class="department-pill">${esc(e.department)}</span></td><td><div class="attendance-controls"><select class="attendance-status" aria-label="حالة حضور ${esc(e.name)}"><option value="unrecorded"${status === 'unrecorded' ? ' selected' : ''}>لم يُسجّل</option>${['present', 'late', 'absent', 'leave'].map((v) => `<option value="${v}"${v === status ? ' selected' : ''}>${statusLabels[v][0]}</option>`).join('')}</select></div></td><td><input class="time-input check-in" type="time" aria-label="وقت حضور ${esc(e.name)}" value="${r?.checkIn || ''}"${disabled ? ' disabled' : ''}></td><td><input class="time-input check-out" type="time" aria-label="وقت انصراف ${esc(e.name)}" value="${r?.checkOut || ''}"${disabled ? ' disabled' : ''}></td><td>${button('حفظ', 'save-attendance-row', 'check', 'small', `data-id="${esc(e.id)}"`)}</td></tr>`;
            })
            .join('')}</tbody></table></div>`
        : empty(
            'لا يوجد موظفون نشطون',
            'أضف موظفين أو غيّر البحث لبدء تسجيل الحضور.',
            'add-employee',
            'إضافة موظف',
          )
    }<div class="table-footer"><span>أوقات الحضور والانصراف ليوم عمل واحد · بتوقيت شركتك</span><span>نسبة الحضور ${number(s.rate)}%</span></div></section>`;
  }
  function leavesView() {
    const q = ui.search.trim().toLocaleLowerCase('ar');
    const leaves = state.leaves
      .filter(
        (l) =>
          (ui.leaveStatus === 'all' || l.status === ui.leaveStatus) &&
          (!q ||
            [
              employeeById(l.employeeId)?.name || '',
              employeeById(l.employeeId)?.department || '',
              l.type,
            ].some((v) => v.toLocaleLowerCase('ar').includes(q))),
      )
      .sort(
        (a, b) =>
          (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1) ||
          b.createdAt.localeCompare(a.createdAt),
      );
    return `<div class="filter-bar leave-toolbar"><label>حالة الطلب <select id="leave-filter"><option value="all">جميع الطلبات</option>${['pending', 'approved', 'rejected'].map((v) => `<option value="${v}"${v === ui.leaveStatus ? ' selected' : ''}>${statusLabels[v][0]}</option>`).join('')}</select></label><span class="filter-summary">${number(leaves.length)} طلب · مدة الإجازة تشمل يوم البداية والنهاية</span></div>${leaves.length ? `<div class="leave-grid">${leaves.map((l) => leaveItem(l, true)).join('')}</div>` : `<section class="panel">${empty('لا توجد طلبات إجازة', 'يمكنك تسجيل طلب جديد أو تغيير الفلاتر.', 'add-leave', 'طلب إجازة جديد')}</section>`}`;
  }
  function reportsView() {
    const active = activeEmployees();
    const payroll = active.reduce((n, e) => n + e.salary, 0);
    const groups = departments()
      .map((d) => ({
        name: d,
        count: active.filter((e) => e.department === d).length,
        total: active
          .filter((e) => e.department === d)
          .reduce((n, e) => n + e.salary, 0),
      }))
      .filter((g) => g.count)
      .sort((a, b) => b.total - a.total);
    const approved = state.leaves.filter((l) => l.status === 'approved');
    const month = today().slice(0, 7);
    const monthRecords = state.attendance.filter(
      (a) =>
        a.date.startsWith(month) && active.some((e) => e.id === a.employeeId),
    );
    const attended = monthRecords.filter((a) =>
      ['present', 'late'].includes(a.status),
    ).length;
    return `<div class="stat-grid">${statCard('الرواتب الأساسية الشهرية', payroll, currencyLabel(), 'money', 'الموظفون النشطون فقط', true)}${statCard('متوسط الراتب الأساسي', active.length ? payroll / active.length : 0, currencyLabel(), 'briefcase', 'بدون خصومات أو بدلات')}${statCard('طلبات إجازة مقبولة', approved.length, 'طلب', 'calendar', 'إجمالي الطلبات المحفوظة')}${statCard('حضور الشهر المسجّل', attended, 'يوم عمل', 'clock', `${number(monthRecords.length)} سجل لهذا الشهر`)}</div><div class="reports-grid"><section class="panel"><div class="panel-header"><div><h2>الرواتب حسب القسم</h2><p>مجموع الرواتب الأساسية للموظفين النشطين</p></div>${icon('money')}</div>${groups.length ? groups.map((g, i) => `<div class="report-row"><div class="report-dept"><span>${esc(g.name)} <small>· ${number(g.count)} موظف</small></span><div class="report-progress"><i style="width:${payroll ? (g.total / payroll) * 100 : 0}%;background:${palette[i % palette.length]}"></i></div></div><strong>${money(g.total)}</strong></div>`).join('') : empty('لا توجد بيانات رواتب', 'أضف موظفين نشطين ورواتبهم الأساسية لعرض التقرير.')}</section><section class="panel"><div class="panel-header"><div><h2>ملخص السجلات</h2><p>معلومات فعلية من هذه المساحة</p></div>${icon('file')}</div><div class="report-row"><span>الموظفون النشطون</span><strong>${number(active.length)}</strong></div><div class="report-row"><span>الموظفون غير النشطين</span><strong>${number(state.employees.length - active.length)}</strong></div><div class="report-row"><span>الأقسام التي تضم موظفين نشطين</span><strong>${number(groups.length)}</strong></div><div class="report-row"><span>سجلات الحضور المحفوظة</span><strong>${number(state.attendance.length)}</strong></div><div class="report-row"><span>طلبات الإجازة قيد المراجعة</span><strong>${number(state.leaves.filter((l) => l.status === 'pending').length)}</strong></div><div class="report-row"><span>تصدير بيانات الفريق</span>${button('تنزيل CSV', 'export-employees', 'download', 'small')}</div></section></div><p class="report-note">هذا ملخص إداري للرواتب الأساسية، ولا يحسب الضرائب أو التأمينات أو صافي الراتب. حضور الشهر يحسب السجلات المحفوظة فقط؛ الأيام غير المسجّلة لا تُحسب كغياب.</p>`;
  }
  function settingsView() {
    return `<div class="settings-grid"><section class="panel"><div class="panel-header"><div><h2>بيانات الشركة</h2><p>تظهر هذه البيانات في مساحة العمل والتقارير</p></div>${icon('briefcase')}</div><form id="settings-form" class="settings-form"><label class="field"><span>اسم الشركة</span><input name="company" required maxlength="60" value="${esc(state.settings.company)}" autocomplete="organization"></label><label class="field"><span>عملة الرواتب</span><select name="currency">${[
      ['EGP', 'جنيه مصري (EGP)'],
      ['SAR', 'ريال سعودي (SAR)'],
      ['AED', 'درهم إماراتي (AED)'],
      ['USD', 'دولار أمريكي (USD)'],
    ]
      .map(
        ([v, label]) =>
          `<option value="${v}"${state.settings.currency === v ? ' selected' : ''}>${label}</option>`,
      )
      .join(
        '',
      )}</select><small>تغيير العملة يغيّر رمزها فقط، ولا يحوّل المبالغ.</small></label><button class="button primary settings-save" type="submit">${icon('check')}حفظ الإعدادات</button></form></section><section class="panel"><div class="panel-header"><div><h2>بياناتك ونسخك الاحتياطية</h2><p>${state.demo ? 'تستخدم الآن بيانات افتراضية للتجربة' : 'تستخدم الآن سجلاتك الخاصة'}</p></div>${icon('shield')}</div><div class="settings-info"><p>البيانات محفوظة داخل هذا المتصفح فقط؛ لا تنتقل إلى أجهزة أخرى ولا تُشارك مع زوار الرابط. حذف بيانات الموقع يمسح هذه السجلات. نزّل نسخة احتياطية قبل ذلك.</p>${button('نسخة احتياطية', 'backup', 'download')}${button('استعادة نسخة', 'import', 'upload')}<p class="report-note">النسخة الاحتياطية تحتوي بيانات الموظفين والرواتب؛ احتفظ بها في مكان خاص. الاستعادة تستبدل بيانات هذه المساحة بعد تأكيدك.</p><div class="danger-zone"><strong>${state.demo ? 'جاهز تبدأ ببياناتك؟' : 'إعادة ضبط المساحة'}</strong><p>مسح جميع الموظفين وسجلات الحضور وطلبات الإجازة من هذا المتصفح.</p>${button('البدء بسجل فارغ', 'clear-data', 'trash', 'danger')}${button('تحميل بيانات تجريبية', 'reset-demo', 'users')}</div></div></section></div>`;
  }

  function render() {
    const [title, eyebrow, description] = viewMeta[ui.view];
    $('#page-title').innerHTML = `${title}<span class="heading-dot">.</span>`;
    $('#page-eyebrow').textContent = eyebrow;
    $('#page-description').textContent = description;
    $('#breadcrumb-current').textContent = title;
    $('#workspace-name').textContent = state.settings.company;
    // Seed values of 0 salary and 2026-10-21 dates are technical placeholders, not facts.
    document.title = `${title} | فريق`;
    $$('[data-view]').forEach((a) => {
      const active = a.dataset.view === ui.view;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    $('#nav-count').textContent = number(state.employees.length);
    $('#nav-pending').hidden = !state.leaves.some(
      (l) => l.status === 'pending',
    );
    let actions = '';
    if (ui.view === 'dashboard')
      actions =
        button('تصدير البيانات', 'export-employees', 'download') +
        button('إضافة موظف', 'add-employee', 'plus', 'primary');
    if (ui.view === 'employees')
      actions =
        button('تصدير CSV', 'export-employees', 'download') +
        button('إضافة موظف', 'add-employee', 'plus', 'primary');
    if (ui.view === 'attendance')
      actions =
        button('تصدير الحضور', 'export-attendance', 'download') +
        button('تسجيل حضور', 'add-attendance', 'plus', 'primary');
    if (ui.view === 'leaves')
      actions = button('طلب إجازة جديد', 'add-leave', 'plus', 'primary');
    if (ui.view === 'reports')
      actions =
        button('تصدير الموظفين', 'export-employees', 'download') +
        button('نسخة احتياطية', 'backup', 'download', 'primary');
    $('#page-actions').innerHTML = actions;
    const views = {
      dashboard,
      employees: employeesView,
      attendance: attendanceView,
      leaves: leavesView,
      reports: reportsView,
      settings: settingsView,
    };
    $('#view-content').innerHTML = views[ui.view]();
  }

  function closeMenu() {
    $('#sidebar').classList.remove('open');
    $('#mobile-overlay').hidden = true;
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
  }
  function navigate() {
    const requested = location.hash.slice(1) || 'dashboard';
    ui.view = Object.hasOwn(viewMeta, requested) ? requested : 'dashboard';
    ui.search = '';
    ui.department = 'all';
    ui.status = 'all';
    $('#global-search').value = '';
    closeMenu();
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function showModal(title, subtitle, body, footer = '', form = '') {
    confirmCallback = null;
    $('#modal-content').innerHTML =
      `${form ? `<form id="${form}">` : ''}<div class="modal-header"><div><h2 id="modal-title">${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div><button type="button" class="icon-button" data-action="close-modal" aria-label="إغلاق">${icon('close')}</button></div><div class="modal-body">${body}<div id="form-error" class="form-error" role="alert" hidden></div></div><div class="modal-footer">${footer}</div>${form ? '</form>' : ''}`;
    if (!$('#modal').open) $('#modal').showModal();
  }
  function formError(message) {
    const el = $('#form-error');
    el.textContent = message;
    el.hidden = false;
  }
  function formFooter(label = 'حفظ', extra = '') {
    return `${extra}${button('إلغاء', 'close-modal')}<button class="button primary" type="submit">${icon('check')}${label}</button>`;
  }
  function confirmAction(title, message, label, callback, danger = true) {
    showModal(
      title,
      '',
      `<p class="confirm-text">${esc(message)}</p>`,
      `${button('إلغاء', 'close-modal')}${button(label, 'confirm', danger ? 'trash' : 'check', danger ? 'danger' : 'primary')}`,
    );
    confirmCallback = callback;
  }
  function employeeForm(id) {
    const e = id ? employeeById(id) : null;
    if (id && !e) return;
    const v = (key) => esc(e?.[key] || '');
    showModal(
      e ? 'تعديل بيانات الموظف' : 'أضف شخصًا إلى فريقك',
      'التفاصيل الصحيحة بداية إدارة أفضل.',
      `<input type="hidden" name="id" value="${v('id')}"><div class="field-row"><label class="field"><span>الاسم الكامل *</span><input name="name" required maxlength="100" value="${v('name')}" placeholder="مثال: أحمد محمد" autocomplete="name"></label><label class="field"><span>البريد الإلكتروني *</span><input name="email" type="email" required maxlength="150" value="${v('email')}" placeholder="name@example.com" dir="ltr" autocomplete="email"></label></div><div class="field-row"><label class="field"><span>المسمى الوظيفي *</span><input name="title" required maxlength="100" value="${v('title')}" placeholder="مثال: أخصائي موارد بشرية"></label><label class="field"><span>القسم *</span><input name="department" list="department-options" required maxlength="60" value="${v('department')}" placeholder="اختر قسمًا أو اكتب اسمًا جديدًا"><datalist id="department-options">${[...new Set([...departments(), 'التكنولوجيا', 'الموارد البشرية', 'التصميم', 'التسويق', 'المالية', 'المبيعات', 'العمليات'])].map((d) => `<option value="${esc(d)}"></option>`).join('')}</datalist></label></div><div class="field-row"><label class="field"><span>الراتب الأساسي الشهري (${currencyLabel()}) *</span><input name="salary" type="number" min="0" max="1000000000" step="0.01" required value="${e ? e.salary : ''}" placeholder="0" inputmode="decimal"></label><label class="field"><span>تاريخ الانضمام *</span><input name="startDate" type="date" required value="${e?.startDate || today()}"></label></div><div class="field-row"><label class="field"><span>نوع التعاقد</span><select name="contract">${Object.entries(
        contractLabels,
      )
        .map(
          ([value, label]) =>
            `<option value="${value}"${(e?.contract || 'full') === value ? ' selected' : ''}>${label}</option>`,
        )
        .join(
          '',
        )}</select></label><label class="field"><span>حالة الموظف</span><select name="status"><option value="active"${e?.status !== 'inactive' ? ' selected' : ''}>نشط</option><option value="inactive"${e?.status === 'inactive' ? ' selected' : ''}>غير نشط</option></select></label></div><label class="field"><span>رقم الهاتف (اختياري)</span><input name="phone" type="tel" maxlength="30" value="${v('phone')}" dir="ltr" autocomplete="tel"></label>`,
      formFooter(e ? 'حفظ التعديلات' : 'إضافة الموظف'),
      'employee-form',
    );
  }
  function employeeDetails(id) {
    const e = employeeById(id);
    if (!e) return;
    const details = [
      ['البريد الإلكتروني', e.email],
      ['القسم', e.department],
      ['تاريخ الانضمام', fullDate(e.startDate)],
      ['نوع التعاقد', contractLabels[e.contract]],
      ['الراتب الأساسي الشهري', money(e.salary)],
      ['رقم الهاتف', e.phone || 'غير مسجل'],
    ];
    showModal(
      'ملف الموظف',
      e.code,
      `<div class="detail-person">${avatar(e, true)}<div><h3>${esc(e.name)}</h3><p>${esc(e.title)} · ${badge(e.status)}</p></div></div><dl class="details-grid">${details.map(([label, value]) => `<div><dt>${label}</dt><dd dir="auto">${esc(value)}</dd></div>`).join('')}</dl>`,
      `${button('حذف الموظف', 'delete-employee', 'trash', 'danger', `data-id="${esc(id)}"`)}${button('تعديل البيانات', 'edit-employee', 'edit', 'primary', `data-id="${esc(id)}"`)}`,
    );
  }
  function leaveForm() {
    const employees = activeEmployees();
    if (!employees.length) {
      toast('أضف موظفًا نشطًا أولًا لتسجيل طلب إجازة.', true);
      return;
    }
    showModal(
      'طلب إجازة جديد',
      'سجّل الطلب، ثم راجعه من صفحة الإجازات.',
      `<label class="field"><span>الموظف *</span><select name="employeeId" required><option value="">اختر الموظف</option>${employees.map((e) => `<option value="${esc(e.id)}">${esc(e.name)} — ${esc(e.department)}</option>`).join('')}</select></label><label class="field"><span>نوع الإجازة</span><select name="type">${['سنوية', 'مرضية', 'شخصية', 'بدون راتب'].map((t) => `<option>${t}</option>`).join('')}</select></label><div class="field-row"><label class="field"><span>من تاريخ *</span><input name="from" type="date" required value="${today()}"></label><label class="field"><span>إلى تاريخ *</span><input name="to" type="date" required value="${today()}"></label></div><label class="field"><span>السبب أو ملاحظات إضافية</span><textarea name="reason" maxlength="500" placeholder="أضف تفاصيل تساعد في مراجعة الطلب..."></textarea><small>المدة تُحسب بالأيام التقويمية وتشمل البداية والنهاية.</small></label>`,
      formFooter('تسجيل الطلب'),
      'leave-form',
    );
  }
  function attendanceForm() {
    const employees = activeEmployees();
    if (!employees.length) {
      toast('أضف موظفًا نشطًا أولًا لتسجيل الحضور.', true);
      return;
    }
    showModal(
      'تسجيل حضور',
      'حفظ هذا السجل يحدّث سجل الموظف لنفس التاريخ إن وجد.',
      `<label class="field"><span>الموظف *</span><select name="employeeId" required><option value="">اختر الموظف</option>${employees.map((e) => `<option value="${esc(e.id)}">${esc(e.name)}</option>`).join('')}</select></label><div class="field-row"><label class="field"><span>التاريخ *</span><input name="date" type="date" required value="${ui.date}" max="${today()}"></label><label class="field"><span>الحالة</span><select name="status" id="modal-attendance-status">${['present', 'late', 'absent', 'leave'].map((s) => `<option value="${s}">${statusLabels[s][0]}</option>`).join('')}</select></label></div><div class="field-row"><label class="field"><span>وقت الحضور *</span><input name="checkIn" type="time" value="09:00" required></label><label class="field"><span>وقت الانصراف</span><input name="checkOut" type="time"><small>اتركه فارغًا حتى انتهاء يوم العمل.</small></label></div>`,
      formFooter('حفظ السجل'),
      'attendance-form',
    );
  }

  function saveAttendance(employeeId, date, status, checkIn, checkOut) {
    if (!employeeById(employeeId) || !validDate(date) || date > today())
      return 'اختر موظفًا وتاريخًا صحيحًا لا يتجاوز اليوم.';
    if (!['unrecorded', 'present', 'late', 'absent', 'leave'].includes(status))
      return 'اختر حالة حضور صحيحة.';
    if (['present', 'late'].includes(status)) {
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(checkIn))
        return 'سجّل وقت الحضور أولًا.';
      if (
        checkOut &&
        (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(checkOut) || checkOut < checkIn)
      )
        return 'وقت الانصراف يجب أن يكون بعد وقت الحضور في نفس اليوم.';
    } else {
      checkIn = '';
      checkOut = '';
    }
    const next = structuredClone(state);
    next.attendance = next.attendance.filter(
      (a) => !(a.employeeId === employeeId && a.date === date),
    );
    if (status !== 'unrecorded')
      next.attendance.push({ employeeId, date, status, checkIn, checkOut });
    return save(next) ? '' : 'تعذّر حفظ السجل. تحقق من تخزين المتصفح.';
  }
  function reviewLeave(id, status) {
    const l = state.leaves.find((x) => x.id === id);
    if (!l || l.status !== 'pending') return;
    if (
      status === 'approved' &&
      state.leaves.some(
        (x) =>
          x.id !== id &&
          x.employeeId === l.employeeId &&
          x.status === 'approved' &&
          x.from <= l.to &&
          x.to >= l.from,
      )
    ) {
      toast('توجد إجازة مقبولة تتداخل مع هذه الفترة.', true);
      return;
    }
    const next = structuredClone(state);
    next.leaves.find((x) => x.id === id).status = status;
    if (save(next)) {
      render();
      toast(
        status === 'approved'
          ? 'تمت الموافقة على طلب الإجازة. سجل الحضور يُحدّث بشكل منفصل.'
          : 'تم رفض طلب الإجازة.',
      );
    }
  }
  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function csvCell(value) {
    let s = String(value ?? '');
    // Prevent spreadsheet software from interpreting user input as formulas.
    if (/^[\s]*[=+@-]/.test(s) || /^[\t\r\n]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  }
  function downloadCSV(name, rows) {
    download(
      name,
      '\uFEFF' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n'),
      'text/csv;charset=utf-8',
    );
  }
  function exportEmployees() {
    const employees =
      ui.view === 'employees' ? filteredEmployees() : state.employees;
    downloadCSV(`fareeq-employees-${today()}.csv`, [
      [
        'الكود',
        'الاسم',
        'البريد الإلكتروني',
        'القسم',
        'المسمى الوظيفي',
        'الحالة',
        'نوع التعاقد',
        'تاريخ الانضمام',
        'الراتب الأساسي',
        'العملة',
        'الهاتف',
      ],
      ...employees.map((e) => [
        e.code,
        e.name,
        e.email,
        e.department,
        e.title,
        statusLabels[e.status][0],
        contractLabels[e.contract],
        e.startDate,
        e.salary,
        state.settings.currency,
        e.phone,
      ]),
    ]);
    toast(`تم تنزيل بيانات ${number(employees.length)} موظف.`);
  }
  function exportAttendance() {
    const employees = filteredEmployees().filter((e) => e.status === 'active');
    downloadCSV(`fareeq-attendance-${ui.date}.csv`, [
      [
        'التاريخ',
        'كود الموظف',
        'الاسم',
        'القسم',
        'الحالة',
        'وقت الحضور',
        'وقت الانصراف',
      ],
      ...employees.map((e) => {
        const a = recordFor(e.id, ui.date);
        return [
          ui.date,
          e.code,
          e.name,
          e.department,
          statusLabels[a?.status || 'unrecorded'][0],
          a?.checkIn || '',
          a?.checkOut || '',
        ];
      }),
    ]);
    toast('تم تنزيل سجل الحضور للتاريخ المحدد.');
  }
  function importBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      if (file.size > 25 * 1024 * 1024) {
        toast('حجم الملف أكبر من 25 ميجابايت.', true);
        return;
      }
      try {
        const parsed = JSON.parse(await file.text());
        if (!validState(parsed)) throw new Error('invalid backup');
        confirmAction(
          'استعادة النسخة الاحتياطية؟',
          `سيتم استبدال بيانات هذه المساحة ببيانات «${parsed.settings.company}»: ${number(parsed.employees.length)} موظف و${number(parsed.attendance.length)} سجل حضور. نزّل نسخة من بياناتك الحالية أولًا إن كنت تحتاجها.`,
          'استعادة البيانات',
          () => {
            if (save(parsed)) {
              $('#modal').close();
              ui.department = 'all';
              ui.status = 'all';
              render();
              toast('تمت استعادة النسخة الاحتياطية.');
            }
          },
          false,
        );
      } catch {
        toast('هذا الملف ليس نسخة احتياطية صحيحة من نظام فريق.', true);
      }
    });
    input.click();
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const { action, id } = target.dataset;
    if (action === 'add-employee') employeeForm();
    else if (action === 'edit-employee') employeeForm(id);
    else if (action === 'employee-details') employeeDetails(id);
    else if (action === 'add-leave') leaveForm();
    else if (action === 'add-attendance') attendanceForm();
    else if (action === 'close-modal') $('#modal').close();
    else if (action === 'approve-leave') reviewLeave(id, 'approved');
    else if (action === 'reject-leave')
      confirmAction(
        'رفض طلب الإجازة؟',
        'سيتم تسجيل الطلب كمرفوض في سجل الإجازات.',
        'تأكيد الرفض',
        () => {
          reviewLeave(id, 'rejected');
          $('#modal').close();
        },
        false,
      );
    else if (action === 'confirm' && confirmCallback) confirmCallback();
    else if (action === 'delete-employee') {
      const e = employeeById(id);
      if (!e) return;
      confirmAction(
        'حذف الموظف نهائيًا؟',
        `سيتم حذف «${e.name}» وجميع سجلات حضوره وطلبات إجازاته. يمكنك جعل حالته «غير نشط» بدلًا من الحذف للاحتفاظ بالسجلات.`,
        'حذف الموظف',
        () => {
          const next = structuredClone(state);
          next.employees = next.employees.filter((e) => e.id !== id);
          next.attendance = next.attendance.filter((a) => a.employeeId !== id);
          next.leaves = next.leaves.filter((l) => l.employeeId !== id);
          if (save(next)) {
            $('#modal').close();
            render();
            toast('تم حذف الموظف وسجلاته.');
          }
        },
      );
    } else if (action === 'save-attendance-row') {
      const row = target.closest('tr');
      const error = saveAttendance(
        id,
        ui.date,
        $('.attendance-status', row).value,
        $('.check-in', row).value,
        $('.check-out', row).value,
      );
      if (error) toast(error, true);
      else {
        render();
        toast('تم حفظ سجل الحضور.');
      }
    } else if (action === 'export-employees') exportEmployees();
    else if (action === 'export-attendance') exportAttendance();
    else if (action === 'backup') {
      download(
        `fareeq-backup-${today()}.json`,
        JSON.stringify(state, null, 2),
        'application/json',
      );
      toast('تم تنزيل النسخة الاحتياطية.');
    } else if (action === 'import') importBackup();
    else if (action === 'clear-data')
      confirmAction(
        'البدء بسجل فارغ؟',
        'سيتم حذف كل الموظفين وسجلات الحضور والإجازات من هذا المتصفح. نزّل نسخة احتياطية أولًا إذا كنت تحتاج هذه البيانات.',
        'مسح البيانات',
        () => {
          const next = {
            version: 1,
            demo: false,
            settings: { ...state.settings },
            employees: [],
            attendance: [],
            leaves: [],
          };
          if (save(next)) {
            $('#modal').close();
            ui.department = 'all';
            ui.status = 'all';
            render();
            toast('مساحتك جاهزة. أضف أول موظف إلى فريقك.');
          }
        },
      );
    else if (action === 'reset-demo')
      confirmAction(
        'تحميل البيانات التجريبية؟',
        'سيتم استبدال السجلات الحالية ببيانات افتراضية للتجربة. نزّل نسخة احتياطية أولًا إذا كنت تحتاج بياناتك.',
        'تحميل البيانات',
        () => {
          const next = seed();
          next.settings = { ...state.settings };
          if (save(next)) {
            $('#modal').close();
            ui.department = 'all';
            ui.status = 'all';
            render();
            toast('تم تحميل البيانات التجريبية.');
          }
        },
        false,
      );
  });

  document.addEventListener('submit', (event) => {
    const form = event.target;
    const formId = form.getAttribute('id');
    if (
      ![
        'employee-form',
        'leave-form',
        'attendance-form',
        'settings-form',
      ].includes(formId)
    )
      return;
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (formId === 'employee-form') {
      const trimmed = ['name', 'email', 'title', 'department', 'phone'].reduce(
        (o, key) => ({ ...o, [key]: data[key].trim() }),
        {},
      );
      if (!trimmed.name || !trimmed.title || !trimmed.department)
        return formError('اكتب الاسم والمسمى الوظيفي والقسم بشكل صحيح.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email))
        return formError('اكتب بريدًا إلكترونيًا صحيحًا.');
      if (
        state.employees.some(
          (e) =>
            e.id !== data.id &&
            e.email.toLowerCase() === trimmed.email.toLowerCase(),
        )
      )
        return formError('هذا البريد الإلكتروني مستخدم لموظف آخر.');
      if (!validDate(data.startDate))
        return formError('اختر تاريخ انضمام صحيحًا.');
      const salary = Number(data.salary);
      if (!Number.isFinite(salary) || salary < 0 || salary > 1e9)
        return formError('اكتب راتبًا صحيحًا لا يقل عن صفر.');
      const next = structuredClone(state);
      const existing = data.id
        ? next.employees.find((e) => e.id === data.id)
        : null;
      if (data.id && !existing)
        return formError('هذا الموظف لم يعد موجودًا. أعد فتح الصفحة.');
      const maxCode = Math.max(
        0,
        ...state.employees.map((e) => Number(e.code.replace('HR-', '')) || 0),
      );
      const employee = {
        ...trimmed,
        id: existing?.id || uid(),
        code: existing?.code || `HR-${String(maxCode + 1).padStart(3, '0')}`,
        salary,
        startDate: data.startDate,
        status: data.status,
        contract: data.contract,
      };
      if (existing)
        next.employees[next.employees.findIndex((e) => e.id === data.id)] =
          employee;
      else next.employees.push(employee);
      if (save(next)) {
        $('#modal').close();
        render();
        toast(existing ? 'تم حفظ تعديلات الموظف.' : 'أُضيف الموظف إلى فريقك.');
      }
    } else if (formId === 'leave-form') {
      if (!activeEmployees().some((e) => e.id === data.employeeId))
        return formError('اختر موظفًا نشطًا.');
      if (!validDate(data.from) || !validDate(data.to) || data.to < data.from)
        return formError('تاريخ النهاية يجب أن يكون في يوم البداية أو بعده.');
      if (
        state.leaves.some(
          (l) =>
            l.employeeId === data.employeeId &&
            l.status !== 'rejected' &&
            l.from <= data.to &&
            l.to >= data.from,
        )
      )
        return formError('هناك طلب إجازة لهذا الموظف يتداخل مع هذه الفترة.');
      const next = structuredClone(state);
      next.leaves.push({
        id: uid(),
        employeeId: data.employeeId,
        type: data.type,
        from: data.from,
        to: data.to,
        reason: data.reason.trim(),
        status: 'pending',
        createdAt: today(),
      });
      if (save(next)) {
        $('#modal').close();
        render();
        toast('تم تسجيل طلب الإجازة للمراجعة.');
      }
    } else if (formId === 'attendance-form') {
      const error = saveAttendance(
        data.employeeId,
        data.date,
        data.status,
        data.checkIn || '',
        data.checkOut || '',
      );
      if (error) formError(error);
      else {
        $('#modal').close();
        render();
        toast('تم حفظ سجل الحضور.');
      }
    } else if (formId === 'settings-form') {
      if (!data.company.trim()) {
        toast('اكتب اسم الشركة أولًا.', true);
        return;
      }
      const next = structuredClone(state);
      next.settings = { company: data.company.trim(), currency: data.currency };
      if (save(next)) {
        render();
        toast('تم حفظ إعدادات المساحة.');
      }
    }
  });

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (target.id === 'department-filter') {
      ui.department = target.value;
      render();
    } else if (target.id === 'status-filter') {
      ui.status = target.value;
      render();
    } else if (target.id === 'leave-filter') {
      ui.leaveStatus = target.value;
      render();
    } else if (target.id === 'attendance-date') {
      if (!validDate(target.value) || target.value > today()) {
        toast('اختر تاريخًا صحيحًا لا يتجاوز اليوم.', true);
        target.value = ui.date;
        return;
      }
      ui.date = target.value;
      render();
    } else if (target.classList.contains('attendance-status')) {
      const row = target.closest('tr');
      const enabled = ['present', 'late'].includes(target.value);
      $$('.time-input', row).forEach((input) => {
        input.disabled = !enabled;
        if (!enabled) input.value = '';
      });
      if (enabled && !$('.check-in', row).value)
        $('.check-in', row).value = target.value === 'late' ? '09:15' : '09:00';
    } else if (target.id === 'modal-attendance-status') {
      const enabled = ['present', 'late'].includes(target.value);
      for (const name of ['checkIn', 'checkOut']) {
        const input = $(`[name="${name}"]`, $('#attendance-form'));
        input.disabled = !enabled;
        input.required = enabled && name === 'checkIn';
        if (!enabled) input.value = '';
      }
      if (enabled)
        $('[name="checkIn"]', $('#attendance-form')).value =
          target.value === 'late' ? '09:15' : '09:00';
    }
  });
  $('#global-search').addEventListener('input', (event) => {
    ui.search = event.target.value;
    if (['reports', 'settings'].includes(ui.view)) {
      ui.view = 'employees';
      history.replaceState(null, '', '#employees');
    }
    render();
  });
  $('#menu-toggle').addEventListener('click', () => {
    const open = $('#sidebar').classList.toggle('open');
    $('#mobile-overlay').hidden = !open;
    $('#menu-toggle').setAttribute('aria-expanded', String(open));
  });
  $('#mobile-overlay').addEventListener('click', closeMenu);
  $('#modal').addEventListener('click', (event) => {
    if (event.target === $('#modal')) {
      const r = $('#modal').getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        $('#modal').close();
    }
  });
  $('#modal').addEventListener('close', () => {
    confirmCallback = null;
  });
  document.addEventListener('keydown', (event) => {
    if (
      event.key === '/' &&
      !$('#modal').open &&
      !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
    ) {
      event.preventDefault();
      $('#global-search').focus();
    }
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('hashchange', navigate);
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    if (!event.newValue) {
      $('#storage-warning').hidden = false;
      toast(
        'تم حذف بيانات الموقع من نافذة أخرى. أعد تحميل الصفحة قبل التعديل.',
        true,
      );
      return;
    }
    try {
      const parsed = JSON.parse(event.newValue);
      if (validState(parsed)) {
        state = parsed;
        $('#modal').close();
        render();
        toast('تم تحديث البيانات من نافذة أخرى.');
      }
    } catch {
      /* Keep the current view if another tab wrote malformed data. */
    }
  });
  $$('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
  });
  state = load();
  navigate();
})();
