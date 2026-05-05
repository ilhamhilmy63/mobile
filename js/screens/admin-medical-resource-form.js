Router.register('admin-medical-resource-form', (app, { resource } = {}) => {
  if (!requireAuth()) return;
  const user = api.getUser();
  if (user?.role !== 'admin') {
    Router.navigate('dashboard');
    return;
  }

  const isEdit = !!resource;
  const title = isEdit ? 'Edit Entry' : 'Create New Entry';

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';

  content.innerHTML = `
    <div class="flex-items justify-between mb-8">
      <div style="width:40px;height:40px;border-radius:8px;background:#2563eb;display:flex;align-items:center;justify-content:center">
        <span class="material-symbols-outlined" style="color:white">add</span>
      </div>
      <div class="flex-items gap-8">
        <button class="btn btn-ghost btn-sm border" id="clearBtnTop">Clear</button>
        <button class="btn btn-ghost btn-sm border">Collapse</button>
      </div>
    </div>

    <div class="mb-16">
      <h2 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin:0">Create New Entry</h2>
      <p style="font-size:13px;color:#64748b;margin:4px 0 0">Add a medical record or inventory asset</p>
    </div>

    <div class="flex flex-col gap-16">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="input-group">
          <label style="font-size:10px;font-weight:800;color:#1e293b;text-transform:uppercase">Record Type *</label>
          <select id="rRecordType" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;width:100%">
            <option value="">Select type...</option>
            <option value="Xray">Xray</option>
            <option value="Photo">Photo</option>
            <option value="Report">Report</option>
            <option value="Prescription">Prescription</option>
            <option value="Schedule">Schedule</option>
            <option value="Inventory">Inventory</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="input-group">
          <label style="font-size:10px;font-weight:800;color:#1e293b;text-transform:uppercase">Record Date *</label>
          <input type="date" id="rRecordDate" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;width:100%" />
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="input-group">
          <label style="font-size:10px;font-weight:800;color:#1e293b;text-transform:uppercase">Patient ID *</label>
          <input type="text" id="rPatientId" placeholder="P10000" maxlength="6" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;width:100%" />
        </div>
        <div class="input-group">
          <label style="font-size:10px;font-weight:800;color:#1e293b;text-transform:uppercase">Patient Name *</label>
          <input type="text" id="rPatientName" placeholder="john" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;width:100%" />
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="input-group">
          <label style="font-size:10px;font-weight:800;color:#1e293b;text-transform:uppercase">Phone Number *</label>
          <input type="tel" id="rPhone" placeholder="0817171717" maxlength="10" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;width:100%" />
        </div>
        <div class="input-group">
          <label style="font-size:10px;font-weight:800;color:#1e293b;text-transform:uppercase">Sex *</label>
          <select id="rSex" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;width:100%">
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div class="input-group">
        <label style="font-size:10px;font-weight:800;color:#1e293b;text-transform:uppercase">Doctor ID *</label>
        <input type="text" id="rDoctorId" placeholder="D11111" maxlength="6" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;width:100%" />
      </div>

      <div class="input-group">
        <label style="font-size:10px;font-weight:800;color:#1e293b;text-transform:uppercase">Email</label>
        <input type="email" id="rEmail" placeholder="example@mail.com" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;width:100%" />
      </div>

      <div class="input-group">
        <label style="font-size:10px;font-weight:800;color:#1e293b;text-transform:uppercase">Description (Max 100 Characters) *</label>
        <textarea id="rDesc" rows="3" maxlength="100" placeholder="Clinical notes..." style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;width:100%"></textarea>
        <div style="text-align:right;font-size:10px;color:#94a3b8;margin-top:4px" id="charCount">0/100</div>
      </div>

      <div class="input-group">
        <label style="font-size:10px;font-weight:800;color:#1e293b;text-transform:uppercase">Diagnostic Image / File URL</label>
        <input type="url" id="rUrl" placeholder="Or paste image URL here..." style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;width:100%" />
      </div>

      <div class="flex justify-end gap-12 mt-16">
        <button type="button" class="btn btn-ghost" id="clearBtnBottom" style="background:#f1f5f9;color:#475569;padding:12px 24px">Clear</button>
        <button type="button" class="btn btn-primary" id="saveBtn" style="background:#0891b2;border:none;padding:12px 24px;min-width:120px;color:white;font-weight:700;border-radius:8px">
          ${isEdit ? 'Update Record' : 'Save Record'}
        </button>
      </div>
    </div>
  `;

  const screen = createScreen({
    topNav: renderTopNav({ title, backScreen: 'admin-medical-resources', showNotif: false }),
    content,
  });
  app.appendChild(screen);

  const typeInput = screen.querySelector('#rRecordType');
  const dateInput = screen.querySelector('#rRecordDate');
  const pidInput = screen.querySelector('#rPatientId');
  const pnameInput = screen.querySelector('#rPatientName');
  const phoneInput = screen.querySelector('#rPhone');
  const sexInput = screen.querySelector('#rSex');
  const didInput = screen.querySelector('#rDoctorId');
  const emailInput = screen.querySelector('#rEmail');
  const descInput = screen.querySelector('#rDesc');
  const urlInput = screen.querySelector('#rUrl');
  const saveBtn = screen.querySelector('#saveBtn');
  const charCount = screen.querySelector('#charCount');

  if (!isEdit) {
    dateInput.value = new Date().toISOString().split('T')[0];
  } else {
    typeInput.value = resource.record_type || '';
    dateInput.value = resource.record_date ? new Date(resource.record_date).toISOString().split('T')[0] : '';
    pidInput.value = resource.patient_id || '';
    pnameInput.value = resource.patient_name || '';
    phoneInput.value = resource.phone_number || '';
    sexInput.value = resource.sex || '';
    didInput.value = resource.doctor_id || '';
    emailInput.value = resource.email || '';
    descInput.value = resource.description || '';
    urlInput.value = resource.url || '';
    charCount.textContent = `${descInput.value.length}/100`;
  }

  descInput.addEventListener('input', () => {
    charCount.textContent = `${descInput.value.length}/100`;
  });

  const clearForm = () => {
    Router.navigate('admin-medical-resources');
  };

  screen.querySelector('#clearBtnTop').addEventListener('click', clearForm);
  screen.querySelector('#clearBtnBottom').addEventListener('click', clearForm);

  saveBtn.addEventListener('click', async () => {
    console.log('Save button clicked');
    
    // Manual validation
    if (!typeInput.value || !dateInput.value || !pidInput.value || !pnameInput.value || !phoneInput.value || !didInput.value || !descInput.value) {
      showToast('Please fill in all required fields (*)', 'error');
      return;
    }

    if (pidInput.value.length !== 6) {
      showToast('Patient ID must be 6 characters', 'error');
      return;
    }
    if (didInput.value.length !== 6) {
      showToast('Doctor ID must be 6 characters', 'error');
      return;
    }
    if (phoneInput.value.length !== 10) {
      showToast('Phone Number must be 10 digits', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      const fd = new FormData();
      fd.append('title', typeInput.value);
      fd.append('category', 'Medical Record');
      fd.append('record_type', typeInput.value);
      fd.append('record_date', dateInput.value);
      fd.append('patient_id', pidInput.value);
      fd.append('patient_name', pnameInput.value);
      fd.append('phone_number', phoneInput.value);
      fd.append('sex', sexInput.value);
      fd.append('doctor_id', didInput.value);
      fd.append('email', emailInput.value);
      fd.append('description', descInput.value);
      fd.append('url', urlInput.value);

      console.log('Sending data:', Object.fromEntries(fd.entries()));

      if (isEdit) {
        await api.updateMedicalResource(resource._id, fd);
        showToast('Record updated successfully', 'success');
      } else {
        await api.createMedicalResource(fd);
        showToast('Record created successfully', 'success');
      }
      
      Router.navigate('admin-medical-resources');
    } catch (err) {
      console.error('Submission error:', err);
      showToast(err.message || 'Failed to save record', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = isEdit ? 'Update Record' : 'Save Record';
    }
  });
});
