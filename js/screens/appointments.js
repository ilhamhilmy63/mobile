Router.register('appointments', (app) => {
  if (!requireAuth()) return;

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';

  // Tabs
  content.innerHTML = `
    <div class="role-tabs mb-12" id="apptTabs" style="margin-bottom:0">
      <button class="role-tab active" data-tab="upcoming">Upcoming</button>
      <button class="role-tab" data-tab="past">Past</button>
    </div>
    <div id="apptList"></div>
    <button class="btn btn-primary btn-full" id="bookNewBtn">
      <span class="material-symbols-outlined">add_circle</span> Book New Appointment
    </button>
  `;

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Appointments', backScreen: 'dashboard', showNotif: false }),
    bottomNav: renderBottomNav('appts'),
    content,
  });
  app.appendChild(screen);

  screen.querySelector('#bookNewBtn').addEventListener('click', () => Router.navigate('book-appointment'));

  let allAppts = [];
  const listEl = screen.querySelector('#apptList');

  function renderAppts(tab) {
    listEl.innerHTML = '';
    const now = new Date();
    const filtered = allAppts.filter(a => {
      const d = new Date(a.appointment_date || a.date);
      return tab === 'upcoming' ? d >= now : d < now;
    });
    if (!filtered.length) {
      listEl.appendChild(emptyState('event_busy', tab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments', tab === 'upcoming' ? 'Book an appointment with a doctor.' : ''));
      return;
    }
    const ul = document.createElement('div');
    ul.className = 'flex flex-col gap-8';
    filtered.forEach(a => {
      const statusColor = { confirmed:'green', cancelled:'red', completed:'cyan', pending:'yellow' }[a.status] || 'yellow';
      const dateStr = a.appointment_date ? new Date(a.appointment_date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }) : '—';
      const el = html(`
        <div class="card card-body">
          <div class="flex-between mb-8" style="margin-bottom:8px">
            <span class="badge badge-${statusColor}">${a.status || 'pending'}</span>
            <span style="font-size:12px;color:var(--text-muted)">${dateStr}</span>
          </div>
          <div style="font-family:var(--font-heading);font-weight:800;font-size:1rem;color:var(--text-heading);margin-bottom:4px">Dr. ${a.doctor_name || a.doctorName || 'Doctor'}</div>
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:10px">${a.appointment_time || a.time || ''} · ${a.reason || a.type || 'General Checkup'}</div>
          <div class="divider" style="margin:10px 0"></div>
          <div class="flex-items gap-8">
            <span class="material-symbols-outlined" style="font-size:16px;color:var(--text-muted)">location_on</span>
            <span style="font-size:12px;color:var(--text-muted)">${a.location || 'Dent AI Clinic'}</span>
          </div>
        </div>
      `);
      ul.appendChild(el);
    });
    listEl.appendChild(ul);
  }

  screen.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      screen.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderAppts(tab.dataset.tab);
    });
  });

  listEl.appendChild(loader());
  api.getAppointments().then(data => {
    allAppts = data.data || data.appointments || [];
    listEl.innerHTML = '';
    renderAppts('upcoming');
  }).catch(() => {
    listEl.innerHTML = '';
    listEl.appendChild(emptyState('error', 'Failed to load', 'Could not fetch appointments.'));
  });
});
