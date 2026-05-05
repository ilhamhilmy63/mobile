Router.register('payments', (app) => {
  if (!requireAuth()) return;

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';
  content.innerHTML = `<div id="payList"></div>`;

  const screen = createScreen({
    topNav: renderTopNav({ title: 'E-Payments', backScreen: 'dashboard', showNotif: false }),
    bottomNav: renderBottomNav('more'),
    content,
  });
  app.appendChild(screen);

  const listEl = screen.querySelector('#payList');
  listEl.appendChild(loader());

  api.getPayments().then(data => {
    const payments = data.data || data.payments || [];
    listEl.innerHTML = '';

    // Summary card
    const total = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
    const pending = payments.filter(p => p.status !== 'paid').reduce((s, p) => s + (p.amount || 0), 0);
    listEl.appendChild(html(`
      <div class="hero-card mb-16" style="margin-bottom:16px">
        <div style="font-size:11px;font-weight:700;opacity:0.8;text-transform:uppercase;letter-spacing:1px">Total Paid</div>
        <div style="font-family:var(--font-heading);font-size:2rem;font-weight:800;color:#fff;margin:4px 0">LKR ${total.toFixed(2)}</div>
        <div style="font-size:13px;opacity:0.8">Pending: LKR ${pending.toFixed(2)}</div>
      </div>
    `));

    if (!payments.length) {
      listEl.appendChild(emptyState('payment', 'No Payments', 'Your payment history will appear here.'));
      return;
    }

    listEl.appendChild(html(`<div class="section-title mb-12" style="margin-bottom:12px">Payment History</div>`));

    const ul = document.createElement('div');
    ul.className = 'flex flex-col gap-8';
    payments.forEach(p => {
      const sc = { paid:'green', pending:'yellow', failed:'red', refunded:'cyan' }[p.status] || 'yellow';
      const icon = { paid:'check_circle', pending:'hourglass_empty', failed:'cancel', refunded:'replay' }[p.status] || 'payment';
      ul.appendChild(html(`
        <div class="card card-body">
          <div class="flex-between mb-8" style="margin-bottom:8px">
            <div class="flex-items gap-10">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--primary-bg);display:flex;align-items:center;justify-content:center;color:var(--primary)">
                <span class="material-symbols-outlined" style="font-size:18px">${icon}</span>
              </div>
              <div>
                <div style="font-weight:700;font-size:14px;color:var(--text-heading)">${p.description || p.type || 'Payment'}</div>
                <div style="font-size:11px;color:var(--text-muted)">${p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : ''}</div>
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-family:var(--font-heading);font-weight:800;font-size:15px;color:var(--text-heading)">LKR ${(p.amount || 0).toFixed(2)}</div>
              <span class="badge badge-${sc}" style="font-size:10px">${p.status}</span>
            </div>
          </div>
          ${p.method ? `<div class="flex-items gap-6" style="gap:6px"><span class="material-symbols-outlined" style="font-size:14px;color:var(--text-muted)">credit_card</span><span style="font-size:12px;color:var(--text-muted)">${p.method}</span></div>` : ''}
          ${p.reference ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">Ref: ${p.reference}</div>` : ''}
        </div>
      `));
    });
    listEl.appendChild(ul);
  }).catch(() => {
    listEl.innerHTML = '';
    listEl.appendChild(emptyState('error', 'Failed to load', 'Could not fetch payment history.'));
  });
});
