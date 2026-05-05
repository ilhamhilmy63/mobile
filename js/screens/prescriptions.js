Router.register('prescriptions', (app) => {
  if (!requireAuth()) return;

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';
  content.innerHTML = `<div id="rxList"></div>`;

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Prescriptions', backScreen: 'dashboard', showNotif: false }),
    bottomNav: renderBottomNav('rx'),
    content,
  });
  app.appendChild(screen);

  const listEl = screen.querySelector('#rxList');
  listEl.appendChild(loader());

  api.getPrescriptions().then(data => {
    const rxList = data.data || data.prescriptions || [];
    listEl.innerHTML = '';
    if (!rxList.length) {
      listEl.appendChild(emptyState('local_pharmacy', 'No Prescriptions', 'Your prescriptions from doctors will appear here.'));
      return;
    }
    const ul = document.createElement('div');
    ul.className = 'flex flex-col gap-12';
    rxList.forEach(rx => {
      const meds = rx.medications || rx.items || [];
      const statusColor = { active:'green', expired:'red', completed:'cyan' }[rx.status] || 'yellow';
      const card = html(`
        <div class="card">
          <div class="card-body">
            <div class="flex-between mb-8" style="margin-bottom:8px">
              <div style="font-family:var(--font-heading);font-weight:800;font-size:1rem;color:var(--text-heading)">
                Rx #${rx._id?.slice(-6).toUpperCase() || '------'}
              </div>
              <span class="badge badge-${statusColor}">${rx.status || 'active'}</span>
            </div>
            <div class="flex-items gap-8 mb-8" style="margin-bottom:8px">
              <span class="material-symbols-outlined" style="font-size:15px;color:var(--text-muted)">person</span>
              <span style="font-size:13px;color:var(--text-muted)">Dr. ${rx.doctor_name || rx.doctorName || 'Doctor'}</span>
            </div>
            <div class="flex-items gap-8 mb-12" style="margin-bottom:12px">
              <span class="material-symbols-outlined" style="font-size:15px;color:var(--text-muted)">calendar_today</span>
              <span style="font-size:13px;color:var(--text-muted)">${rx.createdAt ? new Date(rx.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}</span>
            </div>
            <div class="divider" style="margin:10px 0"></div>
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Medications</div>
            <div id="meds-${rx._id}" class="flex flex-col gap-8">
              ${meds.length ? meds.map(m => `
                <div class="flex-items gap-8" style="padding:8px;background:var(--surface-3);border-radius:var(--radius-sm)">
                  <span class="material-symbols-outlined" style="font-size:18px;color:var(--primary)">medication</span>
                  <div style="flex:1">
                    <div style="font-weight:700;font-size:13px;color:var(--text-heading)">${m.name || m.medication_name || 'Medication'}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${m.dosage || ''} ${m.frequency ? '· ' + m.frequency : ''} ${m.duration ? '· ' + m.duration : ''}</div>
                  </div>
                </div>
              `).join('') : '<div style="font-size:13px;color:var(--text-muted)">No medications listed</div>'}
            </div>
            ${rx.notes ? `<div style="margin-top:10px;font-size:13px;color:var(--text-muted);font-style:italic">📝 ${rx.notes}</div>` : ''}
          </div>
        </div>
      `);
      ul.appendChild(card);
    });
    listEl.appendChild(ul);
  }).catch(() => {
    listEl.innerHTML = '';
    listEl.appendChild(emptyState('error', 'Failed to load', 'Could not fetch prescriptions.'));
  });
});
