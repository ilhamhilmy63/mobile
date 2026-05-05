Router.register('dashboard', (app) => {
  if (!requireAuth()) return;
  const user = api.getUser();
  const initials = (user?.full_name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';

  // Hero Card
  content.appendChild(html(`
    <div class="hero-card">
      <div class="hero-card-subtitle">🦷 Dental Health Portal</div>
      <div class="hero-card-title">${greeting}, ${(user?.full_name || 'User').split(' ')[0]}!</div>
      <div class="hero-card-desc">Stay on top of your dental health journey.</div>
      <div style="margin-top:16px">
        <button id="heroBookBtn" class="btn" style="background:rgba(255,255,255,0.2);color:#fff;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.3)">
          <span class="material-symbols-outlined">add_circle</span> Book Appointment
        </button>
      </div>
    </div>
  `));

  // Quick Actions
  const qaSection = document.createElement('div');
  qaSection.innerHTML = `<div class="section-header"><span class="section-title">Quick Actions</span></div>`;
  const qa = document.createElement('div');
  qa.className = 'quick-actions';
  [
    { icon: 'calendar_add_on', label: 'Book Appt',   screen: 'book-appointment', color: '#0e7490' },
    { icon: 'menu_book',       label: 'Resources',    screen: 'medical-resources', color: '#8b5cf6' },
    { icon: 'local_pharmacy',  label: 'Rx',           screen: 'prescriptions',    color: '#10b981' },
    { icon: 'emergency',       label: 'Emergency',    screen: 'emergency',        color: '#ef4444' },
    { icon: 'medication',      label: 'Medicines',    screen: 'medication-ordering', color: '#f59e0b' },
    { icon: 'payment',         label: 'Payment',      screen: 'payments',         color: '#06b6d4' },
    { icon: 'rate_review',     label: 'Feedback',     screen: 'feedback',         color: '#ec4899' },
    { icon: 'settings',        label: 'Settings',     screen: 'settings',         color: '#6b7280' },
  ].forEach(item => {
    const el = html(`
      <div class="quick-action">
        <div class="quick-action-icon" style="background:${item.color}18;color:${item.color}">
          <span class="material-symbols-outlined">${item.icon}</span>
        </div>
        <span>${item.label}</span>
      </div>
    `);
    el.addEventListener('click', () => Router.navigate(item.screen));
    qa.appendChild(el);
  });
  qaSection.appendChild(qa);
  content.appendChild(qaSection);

  // Stats row
  const statsSection = document.createElement('div');
  statsSection.innerHTML = `<div class="section-header"><span class="section-title">Overview</span></div>`;
  const statsGrid = document.createElement('div');
  statsGrid.className = 'grid-2';
  statsGrid.innerHTML = `
    <div class="stat-card"><div class="stat-card-label">Appointments</div><div class="stat-card-value" id="statAppts">—</div><div class="stat-card-desc">Total booked</div></div>
    <div class="stat-card"><div class="stat-card-label">Prescriptions</div><div class="stat-card-value" id="statRx">—</div><div class="stat-card-desc">Active prescriptions</div></div>
  `;
  statsSection.appendChild(statsGrid);
  content.appendChild(statsSection);

  // Upcoming Appointments section
  const apptSection = document.createElement('div');
  apptSection.innerHTML = `
    <div class="section-header">
      <span class="section-title">Upcoming Appointments</span>
      <button class="section-link" id="seeAllAppts">See all</button>
    </div>
    <div id="dashApptList"><div class="loader-wrap"><div class="spinner"></div></div></div>
  `;
  content.appendChild(apptSection);

  // Medical Resources preview
  const resSection = document.createElement('div');
  resSection.innerHTML = `
    <div class="section-header">
      <span class="section-title">Medical Resources</span>
      <button class="section-link" id="seeAllRes">See all</button>
    </div>
    <div id="dashResList"><div class="loader-wrap"><div class="spinner"></div></div></div>
  `;
  content.appendChild(resSection);

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Dent AI' }),
    bottomNav: renderBottomNav('dashboard'),
    content,
  });
  app.appendChild(screen);

  // Events
  screen.querySelector('#heroBookBtn').addEventListener('click', () => Router.navigate('book-appointment'));
  screen.querySelector('#seeAllAppts').addEventListener('click', () => Router.navigate('appointments'));
  screen.querySelector('#seeAllRes').addEventListener('click', () => Router.navigate('medical-resources'));

  // Load appointments
  api.getAppointments().then(data => {
    const appts = (data.data || data.appointments || []).slice(0, 3);
    const list = screen.querySelector('#dashApptList');
    list.innerHTML = '';
    screen.querySelector('#statAppts').textContent = data.data?.length || data.appointments?.length || 0;
    if (!appts.length) {
      list.appendChild(emptyState('event_busy', 'No appointments', 'Book your first appointment.'));
      return;
    }
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
      el.addEventListener('click', () => Router.navigate('appointments'));
      ul.appendChild(el);
    });
    list.appendChild(ul);
  }).catch(() => {
    screen.querySelector('#dashApptList').innerHTML = '';
    screen.querySelector('#dashApptList').appendChild(emptyState('event_busy', 'No appointments', ''));
  });

  // Load resources preview
  api.getMedicalResources().then(data => {
    const res = (data.data || []).slice(0, 2);
    const list = screen.querySelector('#dashResList');
    list.innerHTML = '';
    if (!res.length) { list.appendChild(emptyState('menu_book', 'No resources', '')); return; }
    const ul = document.createElement('div');
    ul.className = 'flex flex-col gap-8';
    res.forEach(r => {
      const el = html(`
        <div class="list-item">
          <div class="list-item-icon" style="background:#8b5cf618;color:#8b5cf6"><span class="material-symbols-outlined">menu_book</span></div>
          <div class="list-item-body">
            <div class="list-item-title">${r.title}</div>
            <div class="list-item-sub">${r.category}</div>
          </div>
          <div class="list-item-arrow"><span class="material-symbols-outlined">chevron_right</span></div>
        </div>
      `);
      el.addEventListener('click', () => Router.navigate('resource-detail', { resource: r }));
      ul.appendChild(el);
    });
    list.appendChild(ul);
  }).catch(() => {});

  // Load prescriptions count
  api.getPrescriptions().then(data => {
    const rxList = data.data || data.prescriptions || [];
    screen.querySelector('#statRx').textContent = rxList.length;
  }).catch(() => {});
});
