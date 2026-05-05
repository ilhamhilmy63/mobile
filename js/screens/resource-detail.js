Router.register('resource-detail', (app, { resource } = {}) => {
  if (!requireAuth()) return;
  if (!resource) { Router.navigate('medical-resources'); return; }

  const content = document.createElement('div');
  content.className = 'flex flex-col';

  // Hero image
  if (resource.image_url) {
    content.appendChild(html(`<img src="http://192.168.0.236:5000${resource.image_url}" alt="${resource.title}" style="width:100%;height:220px;object-fit:cover" />`));
  } else {
    content.appendChild(html(`<div style="width:100%;height:220px;background:linear-gradient(135deg,#e0f2fe,#cffafe);display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="font-size:72px;color:var(--primary);opacity:0.5">menu_book</span></div>`));
  }

  const body = document.createElement('div');
  body.className = 'page-pad flex flex-col gap-16';
  body.innerHTML = `
    <div>
      <span class="badge badge-cyan" style="margin-bottom:10px">${resource.category}</span>
      <h1 style="font-family:var(--font-heading);font-size:1.4rem;font-weight:800;color:var(--text-heading);margin-bottom:8px">${resource.title}</h1>
      <div style="font-size:12px;color:var(--text-muted)">Added ${resource.createdAt ? new Date(resource.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : 'recently'}</div>
    </div>
    <div class="divider"></div>
    <div>
      <div class="section-title mb-8" style="margin-bottom:8px">About This Resource</div>
      <p style="font-size:15px;line-height:1.7;color:var(--text)">${resource.description}</p>
    </div>
  `;

  if (resource.url) {
    const linkCard = html(`
      <div class="card card-body" style="background:var(--primary-bg);border-color:rgba(14,116,144,0.2)">
        <div class="flex-items gap-12">
          <div style="width:44px;height:44px;border-radius:var(--radius-md);background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span class="material-symbols-outlined" style="color:#fff;font-size:22px">open_in_new</span>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:14px;color:var(--text-heading)">External Resource</div>
            <div style="font-size:12px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${resource.url}</div>
          </div>
        </div>
        <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-full" style="margin-top:12px;text-decoration:none;display:flex">
          <span class="material-symbols-outlined">open_in_new</span> View Full Resource
        </a>
      </div>
    `);
    body.appendChild(linkCard);
  }

  // Related info card
  body.appendChild(html(`
    <div class="card card-body" style="background:var(--surface-3)">
      <div class="section-title mb-8" style="margin-bottom:8px;font-size:13px">💡 Health Tip</div>
      <p style="font-size:13px;color:var(--text-muted);line-height:1.6">
        Regular dental checkups and good oral hygiene can prevent most dental problems. 
        If you have questions about this resource, please consult your dentist.
      </p>
    </div>
  `));

  // Share / bookmark row
  const actions = html(`
    <div class="flex-items gap-8">
      <button class="btn btn-ghost flex-1" id="shareBtn">
        <span class="material-symbols-outlined">share</span> Share
      </button>
      <button class="btn btn-secondary flex-1" id="bookmarkBtn">
        <span class="material-symbols-outlined">bookmark_add</span> Save
      </button>
    </div>
  `);
  body.appendChild(actions);

  content.appendChild(body);

  const screen = createScreen({
    topNav: renderTopNav({ title: resource.title.length > 18 ? resource.title.slice(0,18)+'…' : resource.title, backScreen: 'medical-resources', showNotif: false }),
    content,
  });
  app.appendChild(screen);

  screen.querySelector('#shareBtn')?.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: resource.title, text: resource.description, url: resource.url || window.location.href });
    } else {
      showToast('Share link copied!', 'success');
    }
  });
  screen.querySelector('#bookmarkBtn')?.addEventListener('click', () => {
    showToast('Resource saved!', 'success');
  });
});
