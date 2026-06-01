/** Pipeline — inbox from data/pipeline.md */

async function loadPipelinePanel() {
  const root = $('pipelineRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Loading pipeline…</p>';

  try {
    const snap = await ensureSnapshot();
    const items = snap.pipelinePending || [];

    root.innerHTML = `
      <div class="panel-intro">
        <p>Pending URLs from <code>data/pipeline.md</code>. Process with <code>/career-ops pipeline</code> in Cursor.</p>
        <button type="button" class="btn btn--primary btn--sm" id="copyPipelineCmd">Copy /career-ops pipeline</button>
      </div>
      <div id="pipelineList"></div>
    `;

    $('copyPipelineCmd')?.addEventListener('click', async () => {
      await copyText('/career-ops pipeline\n\nProcess pending URLs in data/pipeline.md.');
      showToast('Copied pipeline command');
    });

    const list = $('pipelineList');
    if (!items.length) {
      list.innerHTML = '<div class="empty-state"><p>Inbox is empty.</p></div>';
      return;
    }

    list.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th></th><th>Company</th><th>Role</th><th>URL</th></tr></thead>
          <tbody>
            ${items
              .map(
                (i, idx) => `
              <tr>
                <td class="muted">${idx + 1}</td>
                <td>${esc(i.company || '—')}</td>
                <td>${esc(i.role || '—')}</td>
                <td><a class="ext-link" href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.url)}</a></td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <p class="muted" style="margin-top:12px">${items.length} pending</p>
    `;
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}
