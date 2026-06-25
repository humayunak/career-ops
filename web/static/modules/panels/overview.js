/** Overview — Northstar OS dashboard home layout */

async function loadOverviewPanel() {
  const root = $('overviewRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Loading…</p>';

  try {
    const snap = await ensureSnapshot();
    const m = snap.metrics;
    const p = snap.progress;
    const apps = snap.applications || [];

    const highNotApplied = apps.filter(
      (a) => a.score >= 4 && /^evaluated$/i.test(a.status),
    ).length;

    let followupOverdue = 0;
    try {
      const fu = await api('/api/insights/followups');
      if (fu.ok && fu.data?.metadata) {
        followupOverdue = (fu.data.metadata.overdue || 0) + (fu.data.metadata.urgent || 0);
      }
    } catch { /* optional */ }

    const greetTime = (() => {
      const h = new Date().getHours();
      if (h < 12) return 'Good morning';
      if (h < 17) return 'Good afternoon';
      return 'Good evening';
    })();

    const userName = $('userName')?.textContent?.split(' ')[0] || 'there';

    const funnelHtml = (p.funnelStages || [])
      .map((s) => `
        <div class="ov-funnel-row">
          <span class="ov-funnel-label">${esc(s.label)}</span>
          <div class="ov-funnel-bar"><div class="ov-funnel-fill" style="width:${Math.min(s.pct, 100)}%"></div></div>
          <span class="ov-funnel-count">${s.count} <span class="ov-funnel-pct">${s.pct}%</span></span>
        </div>`)
      .join('');

    const bucketsHtml = (p.scoreBuckets || [])
      .map((b) => `
        <div class="ov-bucket-row">
          <span class="ov-bucket-label">${esc(b.label)}</span>
          <div class="ov-bucket-bar"><div class="ov-bucket-fill" style="width:${bucketWidth(b.count, p.scoreBuckets)}%"></div></div>
          <span class="ov-bucket-n">${b.count}</span>
        </div>`)
      .join('');

    root.innerHTML = `
      <div class="ov-greet">
        <h1>${esc(greetTime)}, ${esc(userName)}.</h1>
        <p>You have <strong>${m.pipelinePending}</strong> job${m.pipelinePending === 1 ? '' : 's'} to evaluate and <strong>${highNotApplied}</strong> strong fit${highNotApplied === 1 ? '' : 's'} waiting to apply.</p>
      </div>

      <div class="ov-stat-row">
        <button type="button" class="ov-stat" data-goto="inbox">
          <div class="ov-stat-lbl">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12H2l3-7h14l3 7z"/><path d="M5 12v7h14v-7"/></svg>
            Inbox
          </div>
          <div class="ov-stat-val">${m.pipelinePending}</div>
          <div class="ov-stat-sub">Jobs to evaluate</div>
        </button>
        <button type="button" class="ov-stat" data-goto="applications" data-filter="top">
          <div class="ov-stat-lbl">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12l5 5L20 6"/></svg>
            Strong fits
          </div>
          <div class="ov-stat-val">${highNotApplied}</div>
          <div class="ov-stat-sub">Not yet applied</div>
        </button>
        <button type="button" class="ov-stat" data-goto="followups">
          <div class="ov-stat-lbl">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            Follow-ups
          </div>
          <div class="ov-stat-val">${followupOverdue}</div>
          <div class="ov-stat-sub">Overdue or urgent</div>
        </button>
      </div>

      <div class="ov-panel-row">
        <div class="ov-panel">
          <div class="ov-panel-head">
            <h3>Funnel</h3>
            <a class="ov-panel-link" href="#applications" data-goto="applications">View all</a>
          </div>
          <div class="ov-funnel">
            ${funnelHtml || '<p class="ov-empty">No applications yet</p>'}
          </div>
          <div class="ov-rate-row">
            <span>Response <strong>${p.responseRate}%</strong></span>
            <span>Interview <strong>${p.interviewRate}%</strong></span>
            <span>Offer <strong>${p.offerRate}%</strong></span>
          </div>
        </div>

        <div class="ov-panel">
          <div class="ov-panel-head">
            <h3>Score distribution</h3>
            <span class="ov-panel-meta">Top: <strong>${p.topScore || '—'}</strong></span>
          </div>
          <div class="ov-buckets">
            ${bucketsHtml || '<p class="ov-empty">—</p>'}
          </div>
          <div class="ov-score-footer">
            <span>Total: <strong>${m.total}</strong></span>
            <span>Avg: <strong>${m.avgScore || '—'}</strong></span>
            <span>With CV: <strong>${m.withPdf}</strong></span>
            <span>Offers: <strong>${p.totalOffers}</strong></span>
          </div>
        </div>
      </div>
    `;

        root.querySelectorAll('[data-goto]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.filter === 'top') appFilterTab = 'top';
        switchPanel(btn.dataset.goto);
      });
    });

    root.querySelectorAll('[href]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (a.dataset.goto) switchPanel(a.dataset.goto);
      });
    });

  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

function bucketWidth(count, buckets) {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return Math.round((count / max) * 100);
}
