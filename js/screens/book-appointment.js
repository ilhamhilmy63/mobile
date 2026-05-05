Router.register('book-appointment', (app) => {
  if (!requireAuth()) return;

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';

  content.innerHTML = `
    <div id="bookAlert"></div>
    <form id="bookForm" class="flex flex-col gap-16">

      <div class="card card-body" style="background:var(--primary-bg);border-color:rgba(14,116,144,0.2)">
        <div class="flex-items gap-12">
          <span class="material-symbols-outlined" style="color:var(--primary);font-size:28px">info</span>
          <p style="font-size:13px;color:var(--primary);line-height:1.5">Book an appointment with one of our dental specialists. You'll receive a confirmation once accepted.</p>
        </div>
      </div>

      <div>
        <div class="section-title mb-12" style="margin-bottom:12px">Appointment Details</div>
        <div class="flex flex-col gap-12">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Select Doctor</label>
            <select class="form-select" id="bookDoctor" required>
              <option value="">Loading doctors…</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Date</label>
            <input class="form-input" type="date" id="bookDate" required />
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Preferred Time</label>
            <select class="form-select" id="bookTime" required>
              <option value="">Select time slot</option>
              <option>09:00 AM</option><option>09:30 AM</option>
              <option>10:00 AM</option><option>10:30 AM</option>
              <option>11:00 AM</option><option>11:30 AM</option>
              <option>02:00 PM</option><option>02:30 PM</option>
              <option>03:00 PM</option><option>03:30 PM</option>
              <option>04:00 PM</option><option>04:30 PM</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Reason for Visit</label>
            <select class="form-select" id="bookReason" required>
              <option value="">Select reason</option>
              <option>General Checkup</option>
              <option>Tooth Pain</option>
              <option>Cleaning & Scaling</option>
              <option>Root Canal</option>
              <option>Tooth Extraction</option>
              <option>Braces / Orthodontics</option>
              <option>Whitening</option>
              <option>X-Ray</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Additional Notes (optional)</label>
            <textarea class="form-textarea" id="bookNotes" rows="3" placeholder="Describe your symptoms or any relevant info…"></textarea>
          </div>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-full" id="bookSubmitBtn">
        <span class="material-symbols-outlined">calendar_add_on</span>
        Confirm Appointment
      </button>
    </form>
  `;

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Book Appointment', backScreen: 'appointments', showNotif: false }),
    content,
  });
  app.appendChild(screen);

  // Set min date to today
  const dateInput = screen.querySelector('#bookDate');
  dateInput.min = new Date().toISOString().split('T')[0];

  // Load doctors
  const doctorSelect = screen.querySelector('#bookDoctor');
  fetch('http://localhost:5000/api/auth/doctors', {
    headers: { Authorization: `Bearer ${api.getToken()}` }
  }).then(r => r.json()).then(data => {
    const doctors = data.data || data.doctors || [];
    doctorSelect.innerHTML = '<option value="">Select a doctor</option>';
    doctors.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d._id;
      opt.textContent = `Dr. ${d.full_name} — ${d.specialization || 'General'}`;
      doctorSelect.appendChild(opt);
    });
  }).catch(() => {
    doctorSelect.innerHTML = '<option value="">Could not load doctors</option>';
  });

  screen.querySelector('#bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertEl = screen.querySelector('#bookAlert');
    const btn = screen.querySelector('#bookSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Booking…';
    alertEl.innerHTML = '';

    try {
      await api.createAppointment({
        doctor_id: screen.querySelector('#bookDoctor').value,
        appointment_date: screen.querySelector('#bookDate').value,
        appointment_time: screen.querySelector('#bookTime').value,
        reason: screen.querySelector('#bookReason').value,
        notes: screen.querySelector('#bookNotes').value,
      });
      showToast('Appointment booked successfully!', 'success');
      Router.navigate('appointments');
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error"><span class="material-symbols-outlined">error</span><span>${err.message}</span></div>`;
      btn.disabled = false;
      btn.innerHTML = `<span class="material-symbols-outlined">calendar_add_on</span> Confirm Appointment`;
    }
  });
});
