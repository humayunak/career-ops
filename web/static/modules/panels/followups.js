/** Follow-ups — cadence tracker */

async function loadFollowupsPanel() {
  const root = $('followupsRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Loading follow-up cadence…</p>';

  try {
    const result = await api('/api/insights/followups');
    if (!result.ok || result.data?.error) {
      root.innerHTML = `<div class="empty-state"><p>${esc(result.data?.error || result.error || 'Could not load follow-ups')}</p></div>`;
      return;
    }
    const { metadata, entries } = result.data;

    root.innerHTML = `
      <div class="panel-intro">
        <p>Applications that may need a nudge. Copy a prompt for your AI assistant to draft a follow-up message.</p>
      </div>
      <div class="kpi-row">
        <div class="kpi"><div class="kpi__label">Actionable</div><div class="kpi__value">${metadata?.actionable ?? 0}</div></div>
        <div class="kpi"><div class="kpi__label">Overdue</div><div class="kpi__value">${metadata?.overdue ?? 0}</div></div>
        <div class="kpi"><div class="kpi__label">Urgent</div><div class="kpi__value">${metadata?.urgent ?? 0}</div></div>
      </div>
      <div id="followupsTable"></div>
    `;

    const table = $('followupsTable');
    if (!entries?.length) {
      table.innerHTML = '<div class="empty-state"><p>No active applications need follow-up right now.</p></div>';
      return;
    }

    table.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>#</th><th>Company</th><th>Role</th><th>Status</th><th>Days</th><th>Urgency</th><th>Next</th><th></th></tr>
          </thead>
          <tbody>
            ${entries
              .map(
                (e) => `
              <tr>
                <td>${e.num}</td>
                <td>${esc(e.company)}</td>
                <td>${esc(e.role)}</td>
                <td>${esc(e.status)}</td>
                <td>${e.daysSinceApplication ?? '—'}</td>
                <td><span class="badge">${esc(e.urgency)}</span></td>
                <td>${esc(e.nextFollowupDate || '—')}</td>
                <td><button type="button" class="btn btn--sm" data-fu-copy="${e.num}">Copy prompt</button></td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    const byNum = new Map(entries.map((e) => [e.num, e]));
    table.querySelectorAll('[data-fu-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const entry = byNum.get(parseInt(btn.dataset.fuCopy, 10));
        if (!entry) return;
        await copyText(followupPrompt(entry));
        showToast('Follow-up prompt copied');
      });
    });
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}
