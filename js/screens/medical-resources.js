Router.register('medical-resources', (app) => {
  if (!requireAuth()) return;

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';

  content.innerHTML = `
    <div style="margin-bottom:8px">
      <h2 style="font-family:var(--font-heading);font-weight:800;font-size:1.5rem;color:#0f172a;margin:0">My Medical Records</h2>
      <p style="font-size:13px;color:#64748b;margin:4px 0 0">View your reports, prescriptions, and history</p>
    </div>

    <div class="search-bar" style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:8px 16px;display:flex;align-items:center;gap:12px">
      <span class="material-symbols-outlined" style="color:#94a3b8">search</span>
      <input type="text" id="resSearch" placeholder="Search by type or date…" style="border:none;outline:none;flex:1;font-size:14px" />
    </div>

    <div id="resList" class="flex flex-col gap-16"></div>
  `;

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Health Records', backScreen: 'dashboard', showNotif: false }),
    bottomNav: renderBottomNav('medical'),
    content,
  });
  app.appendChild(screen);

  let allRecords = [];

  function renderList(records) {
    const list = screen.querySelector('#resList');
    list.innerHTML = '';
    
    if (!records.length) {
      list.appendChild(emptyState('menu_book', 'No Records', 'No medical records found.'));
      return;
    }

    records.forEach(r => {
      const card = html(`
        <div class="card" style="background:white;border:1px solid #e2e8f0;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px;box-shadow:0 2px 4px rgba(0,0,0,0.02);cursor:pointer">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="background:#ecfeff;color:#0891b2;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase">
              ${r.record_type || 'Record'}
            </div>
            <div style="font-size:12px;color:#94a3b8;font-weight:500">
              ${r.record_date ? new Date(r.record_date).toLocaleDateString() : 'Recently'}
            </div>
          </div>

          <div style="margin-top:4px">
            <div style="font-size:1.1rem;font-weight:700;color:#0f172a">${r.patient_name || 'My Record'}</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px">Patient ID: ${r.patient_id || 'N/A'}</div>
          </div>

          <div style="height:1px;background:#f1f5f9;margin:4px 0"></div>

          <div class="flex flex-col gap-8">
            <div class="flex-items gap-8" style="font-size:13px;color:#475569">
              <span class="material-symbols-outlined" style="font-size:16px;color:#64748b">person</span>
              <span>Doctor ID: ${r.doctor_id || 'N/A'}</span>
            </div>
          </div>

          <div style="background:#f8fafc;padding:12px;border-radius:8px;margin-top:8px">
            <div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:4px;text-transform:uppercase">Doctor Notes</div>
            <div style="font-size:13px;color:#334155;line-height:1.4">${r.description || 'No notes provided.'}</div>
          </div>

          ${r.url ? `
            <div style="margin-top:8px;color:#0891b2;font-size:13px;font-weight:700;display:flex;align-items:center;gap:4px">
              <span class="material-symbols-outlined" style="font-size:16px">link</span>
              View Attached Report
            </div>
          ` : ''}
        </div>
      `);

      card.addEventListener('click', () => Router.navigate('resource-detail', { resource: r }));
      list.appendChild(card);
    });
  }

  function applyFilters() {
    const q = screen.querySelector('#resSearch').value.toLowerCase();
    let filtered = allRecords;
    if (q) {
      filtered = filtered.filter(r => 
        (r.record_type && r.record_type.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    }
    renderList(filtered);
  }

  function loadRecords() {
    const listEl = screen.querySelector('#resList');
    listEl.innerHTML = '';
    listEl.appendChild(loader());

    api.getMedicalResources().then(data => {
      allRecords = data.data || [];
      applyFilters();
    }).catch(() => {
      listEl.innerHTML = '';
      listEl.appendChild(emptyState('error', 'Failed to load', 'Could not fetch your health records.'));
    });
  }

  screen.querySelector('#resSearch').addEventListener('input', applyFilters);

  loadRecords();
});
