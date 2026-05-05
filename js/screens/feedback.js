Router.register('feedback', (app) => {
  if (!requireAuth()) return;

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';
  content.innerHTML = `
    <div class="role-tabs" id="fbTabs">
      <button class="role-tab active" data-tab="submit">Submit</button>
      <button class="role-tab" data-tab="history">My Feedback</button>
    </div>
    <div id="fbContent"></div>
  `;

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Feedback', backScreen: 'dashboard', showNotif: false }),
    bottomNav: renderBottomNav('more'),
    content,
  });
  app.appendChild(screen);

  let selectedRating = 5;

  function renderSubmit() {
    const el = screen.querySelector('#fbContent');
    el.innerHTML = `
      <div id="fbAlert"></div>
      <form id="fbForm" class="flex flex-col gap-12">

        <div class="card card-body" style="text-align:center">
          <div style="font-weight:700;font-size:14px;color:var(--text-heading);margin-bottom:12px">Rate Your Experience</div>
          <div id="starRow" style="display:flex;justify-content:center;gap:8px;font-size:36px;cursor:pointer;margin-bottom:4px">
            ${[1,2,3,4,5].map(n => `<span class="star" data-val="${n}" style="color:${n<=selectedRating?'#f59e0b':'#d1d5db'};transition:transform 0.15s">★</span>`).join('')}
          </div>
          <div id="ratingLabel" style="font-size:13px;color:var(--text-muted)">${['','Terrible','Bad','Okay','Good','Excellent!'][selectedRating]}</div>
        </div>

        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Category</label>
          <select class="form-select" id="fbCategory" required>
            <option value="">Select category</option>
            <option>Doctor Quality</option>
            <option>Clinic Cleanliness</option>
            <option>Wait Time</option>
            <option>Staff Behaviour</option>
            <option>App Experience</option>
            <option>Treatment Quality</option>
            <option>General</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Your Feedback</label>
          <textarea class="form-textarea" id="fbMessage" rows="4" placeholder="Share your experience with us…" required></textarea>
        </div>

        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Doctor (optional)</label>
          <select class="form-select" id="fbDoctor">
            <option value="">Select doctor</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary btn-full" id="fbSubmitBtn">
          <span class="material-symbols-outlined">send</span> Submit Feedback
        </button>
      </form>
    `;

    // Load doctors
    fetch('http://192.168.0.236:5000/api/auth/doctors', { headers: { Authorization: `Bearer ${api.getToken()}` } })
      .then(r => r.json()).then(data => {
        const sel = el.querySelector('#fbDoctor');
        (data.data || data.doctors || []).forEach(d => {
          const opt = document.createElement('option');
          opt.value = d._id;
          opt.textContent = `Dr. ${d.full_name}`;
          sel.appendChild(opt);
        });
      }).catch(() => {});

    // Star interaction
    const labels = ['','Terrible','Bad','Okay','Good','Excellent!'];
    el.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.val);
        el.querySelectorAll('.star').forEach((s,i) => {
          s.style.color = i < selectedRating ? '#f59e0b' : '#d1d5db';
          s.style.transform = i < selectedRating ? 'scale(1.15)' : 'scale(1)';
        });
        el.querySelector('#ratingLabel').textContent = labels[selectedRating];
      });
      star.addEventListener('mouseenter', () => star.style.transform = 'scale(1.2)');
      star.addEventListener('mouseleave', () => {
        star.style.transform = parseInt(star.dataset.val) <= selectedRating ? 'scale(1.15)' : 'scale(1)';
      });
    });

    el.querySelector('#fbForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertEl = el.querySelector('#fbAlert');
      const btn = el.querySelector('#fbSubmitBtn');
      btn.disabled = true; btn.textContent = 'Submitting…';
      try {
        await api.createFeedback({
          rating: selectedRating,
          category: el.querySelector('#fbCategory').value,
          message: el.querySelector('#fbMessage').value,
          doctor_id: el.querySelector('#fbDoctor').value || undefined,
        });
        showToast('Thank you for your feedback!', 'success');
        el.querySelector('#fbForm').reset();
        selectedRating = 5;
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-outlined">send</span> Submit Feedback`;
      } catch (err) {
        alertEl.innerHTML = `<div class="alert alert-error"><span class="material-symbols-outlined">error</span><span>${err.message}</span></div>`;
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-outlined">send</span> Submit Feedback`;
      }
    });
  }

  function renderHistory() {
    const el = screen.querySelector('#fbContent');
    el.innerHTML = '';
    el.appendChild(loader());
    api.getFeedback().then(data => {
      const items = data.data || data.feedback || [];
      el.innerHTML = '';
      if (!items.length) { el.appendChild(emptyState('rate_review','No Feedback','You have not submitted any feedback yet.')); return; }
      const ul = document.createElement('div');
      ul.className = 'flex flex-col gap-8';
      items.forEach(f => {
        const stars = '★'.repeat(f.rating || 0) + '☆'.repeat(5 - (f.rating || 0));
        ul.appendChild(html(`
          <div class="card card-body">
            <div class="flex-between mb-8" style="margin-bottom:8px">
              <span style="color:#f59e0b;font-size:18px;letter-spacing:2px">${stars}</span>
              <span style="font-size:11px;color:var(--text-muted)">${f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ''}</span>
            </div>
            <span class="badge badge-cyan" style="margin-bottom:8px">${f.category || 'General'}</span>
            <p style="font-size:13px;color:var(--text);line-height:1.6;margin-top:6px">${f.message || ''}</p>
            ${f.response ? `<div style="margin-top:10px;padding:10px;background:var(--primary-bg);border-radius:var(--radius-sm);font-size:12px;color:var(--primary)"><b>Response:</b> ${f.response}</div>` : ''}
          </div>
        `));
      });
      el.appendChild(ul);
    }).catch(() => { el.innerHTML = ''; el.appendChild(emptyState('error','Failed to load','')); });
  }

  screen.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      screen.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      tab.dataset.tab === 'submit' ? renderSubmit() : renderHistory();
    });
  });

  renderSubmit();
});
