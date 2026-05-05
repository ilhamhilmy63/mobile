Router.register('register', (app) => {
  const screen = document.createElement('div');
  screen.className = 'auth-screen';

  screen.innerHTML = `
    <div class="auth-header">
      <div class="auth-logo-icon">
        <span class="material-symbols-outlined">dental</span>
      </div>
      <div class="auth-logo">Dent AI</div>
      <div class="auth-tagline">Create your account</div>
    </div>
    <div class="auth-body" style="overflow-y:auto">
      <div class="auth-title">Get Started</div>
      <div class="auth-sub">Join the Dent AI health platform</div>

      <div class="role-tabs mb-20">
        <button class="role-tab active" data-role="patient">Patient</button>
        <button class="role-tab" data-role="doctor">Doctor</button>
        <button class="role-tab" data-role="admin">Admin</button>
      </div>

      <div id="regAlert"></div>

      <form id="registerForm">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input class="form-input" type="text" id="regName" placeholder="Your full name" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input class="form-input" type="email" id="regEmail" placeholder="name@dentai.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" type="password" id="regPassword" placeholder="Create a strong password" required />
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input class="form-input" type="tel" id="regPhone" placeholder="+94 77 000 0000" />
        </div>
        <button type="submit" class="btn btn-primary btn-full" id="regBtn">
          <span class="material-symbols-outlined">person_add</span>
          Create Account
        </button>
      </form>

      <div class="auth-switch mt-16">
        Already have an account? <a href="#" id="goLogin">Sign In</a>
      </div>
    </div>
  `;

  app.appendChild(screen);

  let selectedRole = 'patient';
  screen.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      screen.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRole = tab.dataset.role;
    });
  });

  screen.querySelector('#goLogin').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('login');
  });

  screen.querySelector('#registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertEl = screen.querySelector('#regAlert');
    const btn = screen.querySelector('#regBtn');
    btn.disabled = true;
    btn.textContent = 'Creating account…';
    alertEl.innerHTML = '';

    try {
      const data = await api.register({
        full_name: screen.querySelector('#regName').value,
        email: screen.querySelector('#regEmail').value,
        password: screen.querySelector('#regPassword').value,
        phone: screen.querySelector('#regPhone').value,
        role: selectedRole,
      });
      api.saveAuth(data.token, data.user);
      showToast('Account created successfully!', 'success');
      Router.navigate('dashboard');
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error"><span class="material-symbols-outlined">error</span><span>${err.message}</span></div>`;
      btn.disabled = false;
      btn.innerHTML = `<span class="material-symbols-outlined">person_add</span> Create Account`;
    }
  });
});
