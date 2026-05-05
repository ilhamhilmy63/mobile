/* ============================
   ROUTER.JS — Dent AI Mobile
   ============================ */

const Router = (() => {
  const screens = {};
  let current = null;

  function register(name, renderFn) {
    screens[name] = renderFn;
  }

  function navigate(name, params = {}) {
    const fn = screens[name];
    if (!fn) { console.warn('Screen not found:', name); return; }
    current = name;
    const app = document.getElementById('app');
    app.innerHTML = '';
    fn(app, params);
    window.scrollTo(0, 0);
  }

  function getCurrentScreen() { return current; }

  return { register, navigate, getCurrentScreen };
})();

// ---- Helper: render bottom nav ----
function renderBottomNav(activeId) {
  const user = api.getUser();
  const role = user?.role || 'patient';

  const patientItems = [
    { id: 'dashboard',  icon: 'home',          label: 'Home',      screen: 'dashboard' },
    { id: 'appts',      icon: 'calendar_month', label: 'Appts',     screen: 'appointments' },
    { id: 'medical',    icon: 'menu_book',      label: 'Resources', screen: 'medical-resources' },
    { id: 'rx',         icon: 'local_pharmacy', label: 'Rx',        screen: 'prescriptions' },
    { id: 'more',       icon: 'apps',           label: 'More',      screen: 'more' },
  ];

  const items = patientItems;

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'bottom-nav-item' + (item.id === activeId ? ' active' : '');
    btn.innerHTML = `<span class="material-symbols-outlined">${item.icon}</span><span>${item.label}</span>`;
    btn.addEventListener('click', () => Router.navigate(item.screen));
    nav.appendChild(btn);
  });
  return nav;
}

// ---- Helper: top nav ----
function renderTopNav({ title, backScreen, showNotif = true, showProfile = true } = {}) {
  const user = api.getUser();
  const nav = document.createElement('nav');
  nav.className = 'top-nav';

  // Left side
  const left = document.createElement('div');
  left.className = 'flex-items gap-8';
  if (backScreen) {
    const back = document.createElement('button');
    back.className = 'top-nav-back';
    back.innerHTML = `<span class="material-symbols-outlined">arrow_back_ios</span>${title || ''}`;
    back.addEventListener('click', () => Router.navigate(backScreen));
    left.appendChild(back);
  } else {
    const brand = document.createElement('span');
    brand.className = 'top-nav-brand';
    brand.textContent = title || 'Dent AI';
    left.appendChild(brand);
  }
  nav.appendChild(left);

  // Right side
  const right = document.createElement('div');
  right.className = 'top-nav-actions';
  if (showNotif) {
    const btn = document.createElement('button');
    btn.className = 'icon-btn';
    btn.style.position = 'relative';
    btn.innerHTML = `<span class="material-symbols-outlined">notifications</span><span class="notif-dot"></span>`;
    btn.addEventListener('click', () => Router.navigate('notifications'));
    right.appendChild(btn);
  }
  if (showProfile && user) {
    const avatar = document.createElement('div');
    avatar.className = 'avatar avatar-sm';
    avatar.style.cursor = 'pointer';
    const initials = (user.full_name || 'U').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    if (user.profile_image) {
      avatar.style.backgroundImage = `url(${user.profile_image})`;
      avatar.style.backgroundSize = 'cover';
    } else {
      avatar.textContent = initials;
    }
    avatar.addEventListener('click', () => Router.navigate('settings'));
    right.appendChild(avatar);
  }
  nav.appendChild(right);
  return nav;
}

// ---- Helper: create screen wrapper ----
function createScreen({ topNav, bottomNav, content }) {
  const screen = document.createElement('div');
  screen.className = 'screen';
  if (topNav) screen.appendChild(topNav);
  const sc = document.createElement('div');
  sc.className = 'screen-content';
  sc.appendChild(content);
  screen.appendChild(sc);
  if (bottomNav) screen.appendChild(bottomNav);
  return screen;
}

// ---- Helper: HTML builder ----
function html(str) {
  const div = document.createElement('div');
  div.innerHTML = str.trim();
  return div.firstChild;
}

function htmlAll(str) {
  const div = document.createElement('div');
  div.innerHTML = str.trim();
  return Array.from(div.children);
}

// ---- Helper: loader ----
function loader() {
  return html(`<div class="loader-wrap"><div class="spinner"></div><span>Loading…</span></div>`);
}

// ---- Helper: empty state ----
function emptyState(icon, title, desc) {
  return html(`<div class="empty-state"><span class="material-symbols-outlined">${icon}</span><h3>${title}</h3><p>${desc}</p></div>`);
}

// ---- Helper: alert toast ----
function showToast(msg, type = 'info') {
  const icons = { info:'info', success:'check_circle', error:'error', warning:'warning' };
  const t = html(`<div class="alert alert-${type}" style="position:fixed;bottom:calc(var(--bottom-nav-height)+16px);left:50%;transform:translateX(-50%);width:calc(100% - 32px);max-width:400px;z-index:500;box-shadow:var(--shadow-lg)"><span class="material-symbols-outlined">${icons[type]}</span><span>${msg}</span></div>`);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ---- Auth guard ----
function requireAuth() {
  if (!api.getToken()) { Router.navigate('login'); return false; }
  return true;
}

// ---- More screen ----
Router.register('more', (app) => {
  if (!requireAuth()) return;
  const user = api.getUser();
  const content = document.createElement('div');
  content.className = 'page-pad';

  // Profile Card
  const initials = (user?.full_name || 'U').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  content.innerHTML = `
    <div class="hero-card mb-16" style="margin-bottom:16px">
      <div class="flex-items gap-12">
        <div class="avatar avatar-lg" style="background:rgba(255,255,255,0.2);color:#fff;font-size:24px">${initials}</div>
        <div>
          <div style="font-size:11px;opacity:0.75;font-weight:700;letter-spacing:1px;text-transform:uppercase">${user?.role || 'Patient'}</div>
          <div style="font-family:var(--font-heading);font-size:1.2rem;font-weight:800;color:#fff">${user?.full_name || 'User'}</div>
          <div style="font-size:12px;opacity:0.8">${user?.email || ''}</div>
        </div>
      </div>
    </div>
  `;

  const menuItems = [
    { icon: 'medication', label: 'Medication Orders', screen: 'medication-ordering', color: '#8b5cf6' },
    { icon: 'payment',    label: 'E-Payments',        screen: 'payments',            color: '#10b981' },
    { icon: 'feedback',   label: 'Feedback',          screen: 'feedback',            color: '#f59e0b' },
    { icon: 'emergency',  label: 'Emergency',         screen: 'emergency',           color: '#ef4444' },
    { icon: 'settings',   label: 'Settings',          screen: 'settings',            color: '#6b7280' },
  ];

  const list = document.createElement('div');
  list.className = 'flex flex-col gap-8';
  menuItems.forEach(item => {
    const el = html(`
      <div class="list-item">
        <div class="list-item-icon" style="background:${item.color}18;color:${item.color}">
          <span class="material-symbols-outlined">${item.icon}</span>
        </div>
        <div class="list-item-body">
          <div class="list-item-title">${item.label}</div>
        </div>
        <div class="list-item-arrow"><span class="material-symbols-outlined">chevron_right</span></div>
      </div>
    `);
    el.addEventListener('click', () => Router.navigate(item.screen));
    list.appendChild(el);
  });

  const logoutBtn = html(`<button class="btn btn-ghost btn-full mt-16" style="margin-top:16px;border-color:var(--danger);color:var(--danger)"><span class="material-symbols-outlined">logout</span>Sign Out</button>`);
  logoutBtn.addEventListener('click', () => {
    api.clearAuth();
    Router.navigate('login');
  });

  content.appendChild(list);
  content.appendChild(logoutBtn);

  const screen = createScreen({
    topNav: renderTopNav({ title: 'More', showProfile: false }),
    bottomNav: renderBottomNav('more'),
    content,
  });
  app.appendChild(screen);
});

// ---- Notifications screen ----
Router.register('notifications', (app) => {
  if (!requireAuth()) return;
  const content = document.createElement('div');
  content.className = 'page-pad';

  const ldr = loader();
  content.appendChild(ldr);

  api.getNotifications().then(data => {
    ldr.remove();
    const notifs = data.data || data.notifications || [];
    if (!notifs.length) {
      content.appendChild(emptyState('notifications_off', 'No Notifications', 'You are all caught up!'));
      return;
    }
    const list = document.createElement('div');
    list.className = 'flex flex-col gap-8';
    notifs.forEach(n => {
      list.appendChild(html(`
        <div class="list-item">
          <div class="list-item-icon">
            <span class="material-symbols-outlined">notification_important</span>
          </div>
          <div class="list-item-body">
            <div class="list-item-title">${n.title || 'Notification'}</div>
            <div class="list-item-sub">${n.message || ''}</div>
          </div>
        </div>
      `));
    });
    content.appendChild(list);
  }).catch(() => {
    ldr.remove();
    content.appendChild(emptyState('notifications_off', 'No Notifications', 'You are all caught up!'));
  });

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Notifications', backScreen: 'dashboard', showNotif: false }),
    content,
  });
  app.appendChild(screen);
});
