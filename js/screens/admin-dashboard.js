/* ============================
   ADMIN DASHBOARD — Dent AI
   ============================ */

Router.register('admin-dashboard', (app) => {
  if (!requireAuth()) return;

  const user = api.getUser();
  if (user?.role !== 'admin') {
    Router.navigate('dashboard');
    return;
  }

  const initials = (user?.full_name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';

  // ── Hero banner ──────────────────────────────────────────────────────────
  content.appendChild(html(`
    <div class="admin-hero">
      <div class="admin-hero-ring"></div>
      <div class="admin-hero-ring admin-hero-ring-2"></div>
      <div class="admin-hero-badge">
        <span class="material-symbols-outlined" style="font-size:14px;font-variation-settings:'FILL' 1">shield</span>
        Admin Panel
      </div>
      <div class="admin-hero-greeting">${greeting}, ${(user?.full_name || 'Admin').split(' ')[0]}!</div>
      <div class="admin-hero-sub">System overview &amp; management portal</div>
    </div>
  `));

  // ── Stats grid ───────────────────────────────────────────────────────────
  const statsSection = document.createElement('div');
  statsSection.innerHTML = `<div class="section-header"><span class="section-title">System Overview</span></div>`;
  const statsGrid = document.createElement('div');
  statsGrid.className = 'admin-stats-grid';
  statsGrid.innerHTML = `
    <div class="admin-stat-card" style="--accent-col:#0e7490">
      <span class="material-symbols-outlined admin-stat-icon">groups</span>
      <div class="admin-stat-value" id="aStatPatients">—</div>
      <div class="admin-stat-label">Patients</div>
    </div>
    <div class="admin-stat-card" style="--accent-col:#8b5cf6">
      <span class="material-symbols-outlined admin-stat-icon">stethoscope</span>
      <div class="admin-stat-value" id="aStatDoctors">—</div>
      <div class="admin-stat-label">Doctors</div>
    </div>
    <div class="admin-stat-card" style="--accent-col:#10b981">
      <span class="material-symbols-outlined admin-stat-icon">calendar_month</span>
      <div class="admin-stat-value" id="aStatAppts">—</div>
      <div class="admin-stat-label">Appointments</div>
    </div>
    <div class="admin-stat-card" style="--accent-col:#f59e0b">
      <span class="material-symbols-outlined admin-stat-icon">menu_book</span>
      <div class="admin-stat-value" id="aStatRes">—</div>
      <div class="admin-stat-label">Resources</div>
    </div>
  `;
  statsSection.appendChild(statsGrid);
  content.appendChild(statsSection);

  // ── Management quick-actions ─────────────────────────────────────────────
  const mgmtSection = document.createElement('div');
  mgmtSection.innerHTML = `<div class="section-header"><span class="section-title">Management</span></div>`;
  const mgmtGrid = document.createElement('div');
  mgmtGrid.className = 'admin-mgmt-grid';

  const mgmtItems = [
    { icon: 'menu_book',       label: 'Resources',    screen: 'medical-resources', color: '#8b5cf6' },
    { icon: 'calendar_month',  label: 'Appointments', screen: 'appointments',      color: '#0e7490' },
    { icon: 'local_pharmacy',  label: 'Prescriptions',screen: 'prescriptions',     color: '#10b981' },
    { icon: 'medication',      label: 'Medicines',    screen: 'medication-ordering', color: '#f59e0b' },
    { icon: 'payment',         label: 'Payments',     screen: 'payments',          color: '#06b6d4' },
    { icon: 'emergency',       label: 'Emergency',    screen: 'emergency',         color: '#ef4444' },
    { icon: 'rate_review',     label: 'Feedback',     screen: 'feedback',          color: '#ec4899' },
    { icon: 'settings',        label: 'Settings',     screen: 'settings',          color: '#6b7280' },
  ];

  mgmtItems.forEach(item => {
    const el = html(`
      <div class="admin-mgmt-item">
        <div class="admin-mgmt-icon" style="background:${item.color}18;color:${item.color}">
          <span class="material-symbols-outlined">${item.icon}</span>
        </div>
        <span>${item.label}</span>
      </div>
    `);
    el.addEventListener('click', () => Router.navigate(item.screen));
    mgmtGrid.appendChild(el);
  });

  mgmtSection.appendChild(mgmtGrid);
  content.appendChild(mgmtSection);

  // ── Recent appointments ──────────────────────────────────────────────────
  const apptSection = document.createElement('div');
  apptSection.innerHTML = `
    <div class="section-header">
      <span class="section-title">Recent Appointments</span>
      <button class="section-link" id="adminSeeAppts">See all</button>
    </div>
    <div id="adminApptList"><div class="loader-wrap"><div class="spinner"></div></div></div>
  `;
  content.appendChild(apptSection);

  // ── Recent resources ─────────────────────────────────────────────────────
  const resSection = document.createElement('div');
  resSection.innerHTML = `
    <div class="section-header">
      <span class="section-title">Medical Resources</span>
      <button class="section-link" id="adminSeeRes">Manage</button>
    </div>
    <div id="adminResList"><div class="loader-wrap"><div class="spinner"></div></div></div>
  `;
  content.appendChild(resSection);

  // ── Sign-out ─────────────────────────────────────────────────────────────
  const logoutWrap = document.createElement('div');
  logoutWrap.style.paddingBottom = '8px';
  const logoutBtn = html(`
    <button class="btn btn-ghost btn-full" style="border-color:var(--danger);color:var(--danger)">
      <span class="material-symbols-outlined">logout</span>Sign Out
    </button>
  `);
  logoutBtn.addEventListener('click', () => {
    api.clearAuth();
    Router.navigate('login');
  });
  logoutWrap.appendChild(logoutBtn);
  content.appendChild(logoutWrap);

  // ── Build screen ─────────────────────────────────────────────────────────
  const screen = createScreen({
    topNav: renderTopNav({ title: 'Admin Panel', showProfile: true }),
    content,
  });
  app.appendChild(screen);

  // ── Wire up "see all" buttons ────────────────────────────────────────────
  screen.querySelector('#adminSeeAppts').addEventListener('click', () => Router.navigate('appointments'));
  screen.querySelector('#adminSeeRes').addEventListener('click',   () => Router.navigate('medical-resources'));

  // ── Load appointments ────────────────────────────────────────────────────
  api.getAppointments().then(data => {
    const appts = (data.data || data.appointments || []).slice(0, 4);
    const list = screen.querySelector('#adminApptList');
    list.innerHTML = '';
    screen.querySelector('#aStatAppts').textContent = data.data?.length ?? data.appointments?.length ?? 0;
    if (!appts.length) { list.appendChild(emptyState('event_busy', 'No appointments', '')); return; }
    const ul = document.createElement('div');
    ul.className = 'flex flex-col gap-8';
    appts.forEach(a => {
      const statusColor = a.status === 'confirmed' ? 'green' : a.status === 'cancelled' ? 'red' : 'yellow';
      const el = html(`
        <div class="list-item">
          <div class="list-item-icon"><span class="material-symbols-outlined">event</span></div>
          <div class="list-item-body">
            <div class="list-item-title">Dr. ${a.doctor_name || a.doctorName || 'Doctor'}</div>
            <div class="list-item-sub">${a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : ''} ${a.appointment_time || ''}</div>
          </div>
          <span class="badge badge-${statusColor}">${a.status || 'pending'}</span>
        </div>
      `);
      ul.appendChild(el);
    });
    list.appendChild(ul);
  }).catch(() => {
    const list = screen.querySelector('#adminApptList');
    list.innerHTML = '';
    list.appendChild(emptyState('event_busy', 'No appointments', ''));
    screen.querySelector('#aStatAppts').textContent = 0;
  });

  // ── Load medical resources ───────────────────────────────────────────────
  api.getMedicalResources().then(data => {
    const res = (data.data || []);
    screen.querySelector('#aStatRes').textContent = res.length;
    const list = screen.querySelector('#adminResList');
    list.innerHTML = '';
    if (!res.length) { list.appendChild(emptyState('menu_book', 'No resources', '')); return; }
    const ul = document.createElement('div');
    ul.className = 'flex flex-col gap-8';
    res.slice(0, 3).forEach(r => {
      const el = html(`
        <div class="list-item">
          <div class="list-item-icon" style="background:#8b5cf618;color:#8b5cf6">
            <span class="material-symbols-outlined">menu_book</span>
          </div>
          <div class="list-item-body">
            <div class="list-item-title">${r.title}</div>
            <div class="list-item-sub">${r.category || ''}</div>
          </div>
          <div class="list-item-arrow"><span class="material-symbols-outlined">chevron_right</span></div>
        </div>
      `);
      el.addEventListener('click', () => Router.navigate('resource-detail', { resource: r }));
      ul.appendChild(el);
    });
    list.appendChild(ul);
  }).catch(() => {
    screen.querySelector('#adminResList').innerHTML = '';
    screen.querySelector('#aStatRes').textContent = 0;
  });

  // ── Populate patient / doctor counts via analytics if available ──────────
  api.getAnalytics().then(data => {
    const d = data.data || data;
    if (d.totalPatients !== undefined) screen.querySelector('#aStatPatients').textContent = d.totalPatients;
    if (d.totalDoctors  !== undefined) screen.querySelector('#aStatDoctors').textContent  = d.totalDoctors;
  }).catch(() => {});
});
