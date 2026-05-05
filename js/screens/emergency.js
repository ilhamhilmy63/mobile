Router.register('emergency', (app) => {
  if (!requireAuth()) return;

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';
  content.innerHTML = `
    <!-- SOS Banner -->
    <div style="background:var(--danger);border-radius:var(--radius-xl);padding:24px;text-align:center;box-shadow:0 8px 24px rgba(239,68,68,0.4)">
      <div style="font-size:40px;margin-bottom:8px">🚨</div>
      <div style="font-family:var(--font-heading);font-weight:800;font-size:1.3rem;color:#fff;margin-bottom:4px">Emergency SOS</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-bottom:16px">For life-threatening emergencies, call emergency services immediately.</div>
      <a href="tel:110" class="btn btn-full" style="background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.4);text-decoration:none;display:flex;justify-content:center">
        <span class="material-symbols-outlined">call</span> Call 110 (Ambulance)
      </a>
    </div>

    <!-- Quick contacts -->
    <div>
      <div class="section-title mb-12" style="margin-bottom:12px">Quick Emergency Contacts</div>
      <div class="flex flex-col gap-8">
        <a href="tel:110" class="list-item" style="text-decoration:none;color:inherit">
          <div class="list-item-icon" style="background:#fef2f2;color:var(--danger)"><span class="material-symbols-outlined">local_hospital</span></div>
          <div class="list-item-body"><div class="list-item-title">Ambulance</div><div class="list-item-sub">110</div></div>
          <div style="color:var(--danger)"><span class="material-symbols-outlined">call</span></div>
        </a>
        <a href="tel:119" class="list-item" style="text-decoration:none;color:inherit">
          <div class="list-item-icon" style="background:#fff7ed;color:#f97316"><span class="material-symbols-outlined">local_fire_department</span></div>
          <div class="list-item-body"><div class="list-item-title">Fire & Rescue</div><div class="list-item-sub">119</div></div>
          <div style="color:#f97316"><span class="material-symbols-outlined">call</span></div>
        </a>
        <a href="tel:118" class="list-item" style="text-decoration:none;color:inherit">
          <div class="list-item-icon" style="background:#eff6ff;color:#3b82f6"><span class="material-symbols-outlined">local_police</span></div>
          <div class="list-item-body"><div class="list-item-title">Police</div><div class="list-item-sub">118</div></div>
          <div style="color:#3b82f6"><span class="material-symbols-outlined">call</span></div>
        </a>
        <a href="tel:1990" class="list-item" style="text-decoration:none;color:inherit">
          <div class="list-item-icon" style="background:var(--primary-bg);color:var(--primary)"><span class="material-symbols-outlined">dental</span></div>
          <div class="list-item-body"><div class="list-item-title">Dent AI Clinic</div><div class="list-item-sub">1990</div></div>
          <div style="color:var(--primary)"><span class="material-symbols-outlined">call</span></div>
        </a>
      </div>
    </div>

    <!-- Report form -->
    <div>
      <div class="section-title mb-12" style="margin-bottom:12px">Report a Dental Emergency</div>
      <div id="emAlert"></div>
      <form id="emForm" class="flex flex-col gap-12">
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Emergency Type</label>
          <select class="form-select" id="emType" required>
            <option value="">Select type</option>
            <option>Severe Tooth Pain</option>
            <option>Broken / Knocked-out Tooth</option>
            <option>Jaw Injury</option>
            <option>Oral Bleeding</option>
            <option>Abscess / Swelling</option>
            <option>Other</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" id="emDesc" rows="3" placeholder="Describe the emergency…" required></textarea>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Severity</label>
          <div class="flex-items gap-8" id="emSeverity" style="gap:8px">
            ${['Low','Medium','High','Critical'].map((s,i) => `
              <button type="button" class="chip sev-chip" data-sev="${s}" style="flex:1;text-align:center;${i===2?'border-color:var(--danger);background:var(--danger-bg);color:var(--danger)':''}">${s}</button>
            `).join('')}
          </div>
        </div>
        <button type="submit" class="btn btn-danger btn-full" id="emSubmitBtn">
          <span class="material-symbols-outlined">emergency</span> Report Emergency
        </button>
      </form>
    </div>

    <!-- Past emergencies -->
    <div>
      <div class="section-title mb-12" style="margin-bottom:12px">My Emergency Reports</div>
      <div id="emList"><div class="loader-wrap"><div class="spinner"></div></div></div>
    </div>
  `;

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Emergency', backScreen: 'dashboard', showNotif: false }),
    bottomNav: renderBottomNav('more'),
    content,
  });
  app.appendChild(screen);

  let selectedSeverity = 'High';
  screen.querySelectorAll('.sev-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      screen.querySelectorAll('.sev-chip').forEach(c => { c.style.borderColor=''; c.style.background=''; c.style.color=''; c.classList.remove('active'); });
      chip.style.borderColor = 'var(--danger)';
      chip.style.background = 'var(--danger-bg)';
      chip.style.color = 'var(--danger)';
      selectedSeverity = chip.dataset.sev;
    });
  });

  screen.querySelector('#emForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = screen.querySelector('#emSubmitBtn');
    const alertEl = screen.querySelector('#emAlert');
    btn.disabled = true; btn.textContent = 'Submitting…';
    try {
      await api.createEmergency({
        type: screen.querySelector('#emType').value,
        description: screen.querySelector('#emDesc').value,
        severity: selectedSeverity,
      });
      showToast('Emergency reported. Help is on the way!', 'success');
      screen.querySelector('#emForm').reset();
      btn.disabled = false;
      btn.innerHTML = `<span class="material-symbols-outlined">emergency</span> Report Emergency`;
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error"><span class="material-symbols-outlined">error</span><span>${err.message}</span></div>`;
      btn.disabled = false;
      btn.innerHTML = `<span class="material-symbols-outlined">emergency</span> Report Emergency`;
    }
  });

  api.getEmergency().then(data => {
    const list = screen.querySelector('#emList');
    const items = data.data || [];
    list.innerHTML = '';
    if (!items.length) { list.appendChild(emptyState('emergency_home', 'No reports', 'No emergency reports yet.')); return; }
    const ul = document.createElement('div');
    ul.className = 'flex flex-col gap-8';
    items.slice(0,5).forEach(e => {
      const sc = { Low:'green', Medium:'yellow', High:'yellow', Critical:'red' }[e.severity] || 'yellow';
      ul.appendChild(html(`
        <div class="list-item">
          <div class="list-item-icon" style="background:var(--danger-bg);color:var(--danger)"><span class="material-symbols-outlined">emergency</span></div>
          <div class="list-item-body">
            <div class="list-item-title">${e.type || 'Emergency'}</div>
            <div class="list-item-sub">${e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ''}</div>
          </div>
          <span class="badge badge-${sc}">${e.severity || '—'}</span>
        </div>
      `));
    });
    list.appendChild(ul);
  }).catch(() => { screen.querySelector('#emList').innerHTML = ''; });
});
