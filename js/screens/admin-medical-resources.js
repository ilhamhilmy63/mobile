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
      <h2 style="font-family:var(--font-heading);font-weight:700">Manage Resources</h2>
      <button class="btn btn-primary btn-sm" id="addResourceBtn">
        <span class="material-symbols-outlined">add</span> Add New
      </button>
    </div>
    <div class="search-bar">
      <span class="material-symbols-outlined">search</span>
      <input type="text" id="resSearch" placeholder="Search resources…" />
    </div>
    <div id="resList"></div>
  `;

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Admin Resources', backScreen: 'admin-dashboard', showNotif: false }),
    content,
  });
  app.appendChild(screen);

  let allResources = [];

  function renderList(resources) {
    const list = screen.querySelector('#resList');
    list.innerHTML = '';
    if (!resources.length) {
      list.appendChild(emptyState('menu_book', 'No Resources', 'No medical resources found.'));
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'flex flex-col gap-12';
    resources.forEach(r => {
      const card = html(`
        <div class="card" style="display:flex;flex-direction:row;align-items:center;padding:12px;gap:12px">
          ${r.image_url
            ? `<img src="http://localhost:5000${r.image_url}" alt="${r.title}" style="width:60px;height:60px;object-fit:cover;border-radius:var(--radius-sm)" />`
            : `<div style="width:60px;height:60px;border-radius:var(--radius-sm);background:var(--surface-3);display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="color:var(--text-muted)">menu_book</span></div>`}
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--font-heading);font-size:1rem;font-weight:700;color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.title}</div>
            <div style="font-size:12px;color:var(--text-muted)">${r.category}</div>
          </div>
          <div class="flex-items gap-8">
            <button class="btn btn-ghost btn-icon edit-btn" style="color:var(--primary)" data-id="${r._id}">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="btn btn-ghost btn-icon delete-btn" style="color:var(--danger)" data-id="${r._id}">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      `);

      card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        Router.navigate('admin-medical-resource-form', { resource: r });
      });

      card.querySelector('.delete-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this resource?')) {
          try {
            await api.deleteMedicalResource(r._id);
            showToast('Resource deleted successfully', 'success');
            loadResources(); // Refresh
          } catch (err) {
            showToast(err.message || 'Failed to delete resource', 'error');
          }
        }
      });

      grid.appendChild(card);
    });
    list.appendChild(grid);
  }

  function applyFilters() {
    const q = screen.querySelector('#resSearch').value.toLowerCase();
    let filtered = allResources;
    if (q) filtered = filtered.filter(r => r.title.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)));
    renderList(filtered);
  }

  function loadResources() {
    const listEl = screen.querySelector('#resList');
    listEl.innerHTML = '';
    listEl.appendChild(loader());

    api.getMedicalResources().then(data => {
      allResources = data.data || [];
      applyFilters();
    }).catch(() => {
      listEl.innerHTML = '';
      listEl.appendChild(emptyState('error', 'Failed to load', 'Could not fetch medical resources.'));
    });
  }

  screen.querySelector('#addResourceBtn').addEventListener('click', () => {
    Router.navigate('admin-medical-resource-form');
  });

  screen.querySelector('#resSearch').addEventListener('input', applyFilters);

  loadResources();
});
