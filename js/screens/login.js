Router.register('login', (app) => {
  const screen = document.createElement('div');
  screen.className = 'auth-screen';

  screen.innerHTML = `
    <div class="auth-header">
      <div class="auth-logo-icon">
        <span class="material-symbols-outlined">dental</span>
      </div>
      <div class="auth-logo">Dent AI</div>
      <div class="auth-tagline">Your Dental Health Companion</div>
    </div>
    <div class="auth-body">
      <div class="auth-title">Welcome Back</div>
      <div class="auth-sub">Sign in to access your health portal</div>

      <div class="role-tabs mb-20" id="roleTabs">
        <button class="role-tab active" data-role="patient">Patient</button>
        <button class="role-tab" data-role="doctor">Doctor</button>
        <button class="role-tab" data-role="admin">Admin</button>
      </div>

      <div id="loginAlert"></div>

      <form id="loginForm">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input class="form-input" type="email" id="loginEmail" placeholder="name@dentai.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" type="password" id="loginPassword" placeholder="Enter your password" required />
        </div>
        <button type="submit" class="btn btn-primary btn-full" id="loginBtn">
          <span class="material-symbols-outlined">login</span>
          Sign In
        </button>
      </form>

      <div class="auth-switch mt-16">
        Don't have an account? <a href="#" id="goRegister">Create Account</a>
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

  screen.querySelector('#goRegister').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('register');
  });

  screen.querySelector('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertEl = screen.querySelector('#loginAlert');
    const btn = screen.querySelector('#loginBtn');
    const email = screen.querySelector('#loginEmail').value;
    const password = screen.querySelector('#loginPassword').value;

    btn.disabled = true;
    btn.textContent = 'Signing in…';
    alertEl.innerHTML = '';

    try {
      const data = await api.login({ email, password, role: selectedRole });
      api.saveAuth(data.token, data.user);
      const userRole = data.user?.role || selectedRole;
      Router.navigate(userRole === 'admin' ? 'admin-dashboard' : 'dashboard');
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error"><span class="material-symbols-outlined">error</span><span>${err.message || 'Login failed'}</span></div>`;
      btn.disabled = false;
      btn.innerHTML = `<span class="material-symbols-outlined">login</span> Sign In`;
    }
  });
});
