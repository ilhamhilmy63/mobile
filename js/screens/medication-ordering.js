Router.register('medication-ordering', (app) => {
  if (!requireAuth()) return;

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';
  content.innerHTML = `
    <div class="role-tabs" id="medTabs">
      <button class="role-tab active" data-tab="browse">Browse</button>
      <button class="role-tab" data-tab="orders">My Orders</button>
    </div>
    <div id="medContent"></div>
  `;

  const screen = createScreen({
    topNav: renderTopNav({ title: 'Medications', backScreen: 'dashboard', showNotif: false }),
    bottomNav: renderBottomNav('more'),
    content,
  });
  app.appendChild(screen);

  let cart = [];
  let allMeds = [];

  function renderBrowse() {
    const el = screen.querySelector('#medContent');
    el.innerHTML = '';
    el.appendChild(loader());
    api.getMedications().then(data => {
      allMeds = data.data || data.medications || [];
      el.innerHTML = '';
      if (!allMeds.length) { el.appendChild(emptyState('medication', 'No medications', 'No medications available.')); return; }

      // Cart summary
      const cartBar = html(`
        <div id="cartBar" class="card card-body flex-between" style="background:var(--primary);display:${cart.length ? 'flex' : 'none'};margin-bottom:12px">
          <div>
            <div style="font-weight:800;color:#fff;font-size:14px" id="cartCount">${cart.length} item(s) in cart</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.8)" id="cartTotal">LKR ${cart.reduce((s,c)=>s+c.price*c.qty,0).toFixed(2)}</div>
          </div>
          <button class="btn" style="background:rgba(255,255,255,0.2);color:#fff;font-size:13px" id="checkoutBtn">Checkout</button>
        </div>
      `);
      el.appendChild(cartBar);

      const grid = document.createElement('div');
      grid.className = 'flex flex-col gap-8';
      allMeds.forEach(med => {
        const card = html(`
          <div class="card card-body flex-between">
            <div style="flex:1;min-width:0">
              <div style="font-family:var(--font-heading);font-weight:800;font-size:14px;color:var(--text-heading)">${med.name}</div>
              <div style="font-size:12px;color:var(--text-muted);margin:2px 0">${med.category || 'General'} · ${med.unit || 'tablet'}</div>
              <div style="font-weight:800;color:var(--primary);font-size:15px">LKR ${med.price || '0.00'}</div>
            </div>
            <div class="flex-items gap-8">
              <div id="qty-${med._id}" class="flex-items gap-8" style="display:none">
                <button class="btn btn-sm btn-secondary" data-dec="${med._id}">−</button>
                <span class="qty-val" style="font-weight:800;min-width:20px;text-align:center">1</span>
                <button class="btn btn-sm btn-secondary" data-inc="${med._id}">+</button>
              </div>
              <button class="btn btn-primary btn-sm add-btn" data-id="${med._id}" data-name="${med.name}" data-price="${med.price||0}">
                <span class="material-symbols-outlined" style="font-size:16px">add</span>
              </button>
            </div>
          </div>
        `);
        grid.appendChild(card);
      });
      el.appendChild(grid);

      function updateCartUI() {
        const bar = screen.querySelector('#cartBar');
        bar.style.display = cart.length ? 'flex' : 'none';
        if (cart.length) {
          screen.querySelector('#cartCount').textContent = `${cart.reduce((s,c)=>s+c.qty,0)} item(s) in cart`;
          screen.querySelector('#cartTotal').textContent = `LKR ${cart.reduce((s,c)=>s+c.price*c.qty,0).toFixed(2)}`;
        }
      }

      el.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const existing = cart.find(c => c.id === id);
          if (!existing) {
            cart.push({ id, name: btn.dataset.name, price: parseFloat(btn.dataset.price), qty: 1 });
          }
          const qtyEl = screen.querySelector(`#qty-${id}`);
          qtyEl.style.display = 'flex';
          btn.style.display = 'none';
          updateCartUI();
        });
      });

      el.querySelectorAll('[data-inc]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.inc;
          const item = cart.find(c => c.id === id);
          if (item) { item.qty++; btn.closest('.flex-items').querySelector('.qty-val').textContent = item.qty; }
          updateCartUI();
        });
      });

      el.querySelectorAll('[data-dec]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.dec;
          const item = cart.find(c => c.id === id);
          if (item && item.qty > 1) { item.qty--; btn.closest('.flex-items').querySelector('.qty-val').textContent = item.qty; }
          else {
            cart = cart.filter(c => c.id !== id);
            const qtyEl = screen.querySelector(`#qty-${id}`);
            qtyEl.style.display = 'none';
            qtyEl.nextElementSibling.style.display = '';
          }
          updateCartUI();
        });
      });

      screen.querySelector('#checkoutBtn').addEventListener('click', async () => {
        if (!cart.length) { showToast('Cart is empty', 'warning'); return; }
        try {
          await api.createMedicationOrder({ items: cart.map(c => ({ medication_id: c.id, quantity: c.qty })) });
          showToast('Order placed successfully!', 'success');
          cart = [];
          updateCartUI();
          screen.querySelectorAll('.role-tab')[1].click();
        } catch (err) { showToast(err.message, 'error'); }
      });

    }).catch(() => { el.innerHTML=''; el.appendChild(emptyState('error','Failed to load','')); });
  }

  function renderOrders() {
    const el = screen.querySelector('#medContent');
    el.innerHTML = '';
    el.appendChild(loader());
    api.getMedicationOrders().then(data => {
      const orders = data.data || data.orders || [];
      el.innerHTML = '';
      if (!orders.length) { el.appendChild(emptyState('receipt_long','No Orders','Place your first medication order.')); return; }
      const ul = document.createElement('div');
      ul.className = 'flex flex-col gap-8';
      orders.forEach(o => {
        const sc = { pending:'yellow', confirmed:'cyan', delivered:'green', cancelled:'red' }[o.status] || 'yellow';
        ul.appendChild(html(`
          <div class="card card-body">
            <div class="flex-between mb-8" style="margin-bottom:8px">
              <span style="font-family:var(--font-heading);font-weight:800;font-size:13px">Order #${o._id?.slice(-6).toUpperCase()}</span>
              <span class="badge badge-${sc}">${o.status}</span>
            </div>
            <div style="font-size:12px;color:var(--text-muted)">${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}</div>
            <div style="font-size:13px;font-weight:700;color:var(--primary);margin-top:6px">LKR ${o.total_amount || o.totalAmount || '—'}</div>
          </div>
        `));
      });
      el.appendChild(ul);
    }).catch(() => { el.innerHTML=''; el.appendChild(emptyState('error','Failed to load','')); });
  }

  screen.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      screen.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      tab.dataset.tab === 'browse' ? renderBrowse() : renderOrders();
    });
  });

  renderBrowse();
});
