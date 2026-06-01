/** Overview — metrics, next actions */

async function loadOverviewPanel() {
  const root = $('overviewRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Loading overview…</p>';

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
    } catch {
      /* optional */
    }

    const funnelHtml = (p.funnelStages || [])
      .map(
        (s) => `
      <div class="funnel-row">
        <span class="funnel-row__label">${esc(s.label)}</span>
        <div class="funnel-row__bar"><div class="funnel-row__fill" style="width:${Math.min(s.pct, 100)}%"></div></div>
        <span class="funnel-row__count">${s.count} <span class="funnel-row__pct">${s.pct}%</span></span>
      </div>`,
      )
      .join('');

    const bucketsHtml = (p.scoreBuckets || [])
      .map(
        (b) => `
      <div class="bucket-row">
        <span>${esc(b.label)}</span>
        <div class="bucket-row__bar"><div class="bucket-row__fill" style="width:${bucketWidth(b.count, p.scoreBuckets)}%"></div></div>
        <span class="bucket-row__n">${b.count}</span>
      </div>`,
      )
      .join('');

    root.innerHTML = `
      <section class="glass-card next-actions">
        <h2 class="section-title">What to do next</h2>
        <div class="next-actions__grid">
          <button type="button" class="next-action-card" data-goto="inbox">
            <span class="next-action-card__n">${m.pipelinePending}</span>
            <span class="next-action-card__label">Jobs to evaluate</span>
          </button>
          <button type="button" class="next-action-card" data-goto="applications" data-filter="top">
            <span class="next-action-card__n">${highNotApplied}</span>
            <span class="next-action-card__label">Strong fits not applied</span>
          </button>
          <button type="button" class="next-action-card" data-goto="followups">
            <span class="next-action-card__n">${followupOverdue}</span>
            <span class="next-action-card__label">Follow-ups due</span>
          </button>
        </div>
      </section>

      <div class="kpi-row" style="margin-top:16px">
        <div class="kpi"><div class="kpi__label">Applications</div><div class="kpi__value">${m.total}</div></div>
        <div class="kpi"><div class="kpi__label">Actionable</div><div class="kpi__value">${m.actionable}</div></div>
        <div class="kpi"><div class="kpi__label">Avg score</div><div class="kpi__value">${m.avgScore || '—'}</div></div>
        <button type="button" class="kpi kpi--link" data-goto="inbox"><div class="kpi__label">Inbox</div><div class="kpi__value">${m.pipelinePending}</div></button>
      </div>

      <div class="split-2" style="margin-top:16px">
        <section class="glass-card">
          <h2 class="section-title">Funnel</h2>
          <div class="funnel">${funnelHtml || '<p class="muted">No applications yet</p>'}</div>
          <div class="rate-row">
            <span>Response <strong>${p.responseRate}%</strong></span>
            <span>Interview <strong>${p.interviewRate}%</strong></span>
            <span>Offer <strong>${p.offerRate}%</strong></span>
          </div>
        </section>
        <section class="glass-card">
          <h2 class="section-title">Score distribution</h2>
          <div class="buckets">${bucketsHtml || '<p class="muted">—</p>'}</div>
          <p class="muted" style="margin:12px 0 0">Top score: <strong>${p.topScore || '—'}</strong> · Resumes: <strong>${m.withPdf}</strong> · Offers: <strong>${p.totalOffers}</strong></p>
        </section>
      </div>
    `;

    root.querySelectorAll('[data-goto]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.filter === 'top') {
          appFilterTab = 'top';
        }
        switchPanel(btn.dataset.goto);
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
