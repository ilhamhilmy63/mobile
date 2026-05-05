Router.register('settings', (app) => {
  if (!requireAuth()) return;
  const user = api.getUser();
  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';

  content.innerHTML = `
    <div class="card p-16 flex-items gap-12" style="background:var(--primary);color:white">
      <div class="avatar avatar-lg">${(user?.full_name || 'U').charAt(0)}</div>
      <div>
        <div style="font-weight:700;font-size:1.2rem">${user?.full_name || 'User'}</div>
        <div style="opacity:0.8;font-size:13px">${user?.email || ''}</div>
      </div>
    </div>

    <div class="section-header"><span class="section-title">Account Settings</span></div>
    <div class="flex flex-col gap-8">
      <div class="list-item">
        <div class="list-item-icon"><span class="material-symbols-outlined">person</span></div>
        <div class="list-item-body">Edit Profile</div>
        <div class="list-item-arrow"><span class="material-symbols-outlined">chevron_right</span></div>
      </div>
      <div class="list-item">
        <div class="list-item-icon"><span class="material-symbols-outlined">lock</span></div>
        <div class="list-item-body">Change Password</div>
        <div class="list-item-arrow"><span class="material-symbols-outlined">chevron_right</span></div>
      </div>
    </div>

    <button class="btn btn-ghost btn-full mt-16" id="logoutBtn" style="border-color:var(--danger);color:var(--danger)">
      <span class="material-symbols-outlined">logout</span> Sign Out
    </button>
  `;

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Settings', backScreen: 'dashboard', showProfile: false }),
    content,
  });
  app.appendChild(screen);

  screen.querySelector('#logoutBtn').addEventListener('click', () => {
    api.clearAuth();
    Router.navigate('login');
  });
});
