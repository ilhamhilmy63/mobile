Router.register('medical-resources', (app) => {
  if (!requireAuth()) return;

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';

  // Search + filter
  content.innerHTML = `
    <div class="search-bar">
      <span class="material-symbols-outlined">search</span>
      <input type="text" id="resSearch" placeholder="Search resources…" />
    </div>
    <div class="filter-chips" id="filterChips">
      <button class="chip active" data-cat="all">All</button>
    </div>
    <div id="resList"></div>
  `;

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Medical Resources', backScreen: 'dashboard', showNotif: false }),
    bottomNav: renderBottomNav('medical'),
    content,
  });
  app.appendChild(screen);

  let allResources = [];
  let activeCategory = 'all';

  function renderList(resources) {
    const list = screen.querySelector('#resList');
    list.innerHTML = '';
    if (!resources.length) {
      list.appendChild(emptyState('menu_book', 'No Resources', 'No medical resources found for this category.'));
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'flex flex-col gap-12';
    resources.forEach(r => {
      const card = html(`
        <div class="card" style="cursor:pointer;transition:transform 0.18s,box-shadow 0.18s">
          ${r.image_url
            ? `<img class="card-img" src="http://localhost:5000${r.image_url}" alt="${r.title}" />`
            : `<div class="card-img-placeholder"><span class="material-symbols-outlined">menu_book</span></div>`}
          <div class="card-body">
            <span class="badge badge-cyan mb-8" style="margin-bottom:8px">${r.category}</span>
            <div style="font-family:var(--font-heading);font-size:1.05rem;font-weight:800;color:var(--text-heading);margin-bottom:6px">${r.title}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${r.description}</div>
            <div class="flex-items gap-8">
              ${r.url ? `<span style="font-size:12px;font-weight:700;color:var(--primary)"><span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle">link</span> Has Link</span>` : ''}
              <span style="flex:1"></span>
              <span style="font-size:11px;color:var(--text-muted)">${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
            </div>
          </div>
        </div>
      `);
      card.addEventListener('click', () => Router.navigate('resource-detail', { resource: r }));
      card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = 'var(--shadow-md)'; });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.boxShadow = ''; });
      grid.appendChild(card);
    });
    list.appendChild(grid);
  }

  function applyFilters() {
    const q = screen.querySelector('#resSearch').value.toLowerCase();
    let filtered = allResources;
    if (activeCategory !== 'all') filtered = filtered.filter(r => r.category === activeCategory);
    if (q) filtered = filtered.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    renderList(filtered);
  }

  // Load resources
  const listEl = screen.querySelector('#resList');
  listEl.appendChild(loader());

  api.getMedicalResources().then(data => {
    allResources = data.data || [];
    listEl.innerHTML = '';

    // Build category chips
    const cats = [...new Set(allResources.map(r => r.category))];
    const chips = screen.querySelector('#filterChips');
    cats.forEach(cat => {
      const chip = html(`<button class="chip" data-cat="${cat}">${cat}</button>`);
      chip.addEventListener('click', () => {
        chips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = cat;
        applyFilters();
      });
      chips.appendChild(chip);
    });

    chips.querySelector('[data-cat="all"]').addEventListener('click', () => {
      chips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chips.querySelector('[data-cat="all"]').classList.add('active');
      activeCategory = 'all';
      applyFilters();
    });

    screen.querySelector('#resSearch').addEventListener('input', applyFilters);
    renderList(allResources);
  }).catch(() => {
    listEl.innerHTML = '';
    listEl.appendChild(emptyState('error', 'Failed to load', 'Could not fetch medical resources.'));
  });
});
