Router.register('admin-medical-resources', (app) => {
  if (!requireAuth()) return;
  const user = api.getUser();
  if (user?.role !== 'admin') {
    Router.navigate('dashboard');
    return;
  }

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';

  content.innerHTML = `
    <div class="flex-items justify-between">
      <h2 style="font-family:var(--font-heading);font-weight:800;font-size:1.5rem;color:#0f172a">Medical History</h2>
      <button class="btn btn-primary btn-sm" id="addRecordBtn" style="background:#2563eb;border-radius:8px;padding:8px 16px">
        <span class="material-symbols-outlined">add</span> New Entry
      </button>
    </div>
    
    <div class="search-bar" style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:8px 16px;display:flex;align-items:center;gap:12px">
      <span class="material-symbols-outlined" style="color:#94a3b8">search</span>
      <input type="text" id="resSearch" placeholder="Search by name, ID or type…" style="border:none;outline:none;flex:1;font-size:14px" />
    </div>

    <div id="resList" class="flex flex-col gap-16"></div>
  `;

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Medical Records', backScreen: 'admin-dashboard', showNotif: false }),
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
        <div class="card" style="background:white;border:1px solid #e2e8f0;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px;box-shadow:0 2px 4px rgba(0,0,0,0.02)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="background:#eff6ff;color:#2563eb;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase">
              ${r.record_type || 'Record'}
            </div>
            <div class="flex-items gap-12">
              <button class="edit-btn" style="background:none;border:none;color:#2563eb;cursor:pointer;padding:4px">
                <span class="material-symbols-outlined" style="font-size:20px">edit</span>
              </button>
              <button class="delete-btn" style="background:none;border:none;color:#dc2626;cursor:pointer;padding:4px">
                <span class="material-symbols-outlined" style="font-size:20px">delete</span>
              </button>
            </div>
          </div>

          <div style="margin-top:4px">
            <div style="font-size:1.1rem;font-weight:700;color:#0f172a">${r.patient_name || 'N/A'}</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px">ID: ${r.patient_id || 'N/A'} • ${r.sex || 'N/A'}</div>
          </div>

          <div style="height:1px;background:#f1f5f9;margin:4px 0"></div>

          <div class="flex flex-col gap-8">
            <div class="flex-items gap-8" style="font-size:13px;color:#475569">
              <span class="material-symbols-outlined" style="font-size:16px;color:#64748b">person</span>
              <span>Doctor ID: ${r.doctor_id || 'N/A'}</span>
            </div>
            <div class="flex-items gap-8" style="font-size:13px;color:#475569">
              <span class="material-symbols-outlined" style="font-size:16px;color:#64748b">calendar_today</span>
              <span>Date: ${r.record_date ? new Date(r.record_date).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>

          <div style="background:#f8fafc;padding:12px;border-radius:8px;margin-top:8px">
            <div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:4px;text-transform:uppercase">Notes</div>
            <div style="font-size:13px;color:#334155;line-height:1.4">${r.description || 'No description provided.'}</div>
          </div>
        </div>
      `);

      card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        Router.navigate('admin-medical-resource-form', { resource: r });
      });

      card.querySelector('.delete-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete this record for ${r.patient_name}?`)) {
          try {
            await api.deleteMedicalResource(r._id);
            showToast('Record deleted successfully', 'success');
            loadRecords(); // Refresh
          } catch (err) {
            showToast(err.message || 'Failed to delete record', 'error');
          }
        }
      });

      list.appendChild(card);
    });
  }

  function applyFilters() {
    const q = screen.querySelector('#resSearch').value.toLowerCase();
    let filtered = allRecords;
    if (q) {
      filtered = filtered.filter(r => 
        (r.patient_name && r.patient_name.toLowerCase().includes(q)) || 
        (r.patient_id && r.patient_id.toLowerCase().includes(q)) || 
        (r.record_type && r.record_type.toLowerCase().includes(q))
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
      listEl.appendChild(emptyState('error', 'Failed to load', 'Could not fetch medical history.'));
    });
  }

  screen.querySelector('#addRecordBtn').addEventListener('click', () => {
    Router.navigate('admin-medical-resource-form');
  });

  screen.querySelector('#resSearch').addEventListener('input', applyFilters);

  loadRecords();
});
