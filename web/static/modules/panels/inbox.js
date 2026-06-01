/** Inbox — workflow strip, scan triage, pipeline pending */

let scanOffers = [];
let selectedScan = new Set();

async function loadInboxPanel() {
  const root = $('inboxRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Loading inbox…</p>';

  try {
    const snap = await ensureSnapshot();
    const wf = snap.workflow || {};
    const pending = snap.pipelinePending || [];

    root.innerHTML = `
      <div class="workflow-strip glass-card" role="list">
        <div class="workflow-step"><span class="workflow-step__n">${wf.inbox ?? pending.length}</span><span>Inbox</span></div>
        <div class="workflow-step__arrow">→</div>
        <div class="workflow-step"><span class="workflow-step__n">${wf.evaluated ?? 0}</span><span>Evaluated</span></div>
        <div class="workflow-step__arrow">→</div>
        <div class="workflow-step"><span class="workflow-step__n">${wf.reports ?? 0}</span><span>Reports</span></div>
        <div class="workflow-step__arrow">→</div>
        <div class="workflow-step"><span class="workflow-step__n">${wf.pdfs ?? 0}</span><span>PDFs</span></div>
      </div>

      <section class="glass-card">
        <div class="section-head">
          <h2 class="section-title">Portal scan (preview)</h2>
          <div class="section-head__actions">
            <button type="button" class="btn btn--sm" id="btnScanPreview">Preview scan</button>
            <button type="button" class="btn btn--sm btn--primary" id="btnScanRun">Run scan → inbox</button>
          </div>
        </div>
        <p class="muted">Dry-run matches <code>portals.yml</code> filters. Add selected roles to <code>data/pipeline.md</code> before evaluating in Cursor.</p>
        <div id="scanTriageMount"></div>
      </section>

      <section class="glass-card">
        <div class="section-head">
          <h2 class="section-title">Pending evaluate</h2>
          <button type="button" class="btn btn--sm btn--primary" id="copyPipelineCmd">Copy /career-ops pipeline</button>
        </div>
        <div id="pipelineList"></div>
      </section>
    `;

    $('btnScanPreview')?.addEventListener('click', runScanPreview);
    $('btnScanRun')?.addEventListener('click', runScanFull);
    $('copyPipelineCmd')?.addEventListener('click', async () => {
      await copyText('/career-ops pipeline\n\nProcess pending URLs in data/pipeline.md.');
      showToast('Copied pipeline command');
    });

    renderScanTriage();
    renderPipelineList(pending);
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

function renderScanTriage() {
  const mount = $('scanTriageMount');
  if (!mount) return;

  if (!scanOffers.length) {
    mount.innerHTML = '<p class="muted" style="margin-top:12px">Run preview to see new portal matches.</p>';
    return;
  }

  mount.innerHTML = `
    <div class="triage-actions">
      <button type="button" class="btn btn--sm btn--primary" id="btnAddSelected">Add selected to inbox</button>
      <button type="button" class="btn btn--sm" id="btnSelectAll">Select all</button>
    </div>
    <div class="table-wrap" style="margin-top:12px">
      <table class="data-table">
        <thead><tr><th></th><th>Company</th><th>Role</th><th>Location</th><th>URL</th></tr></thead>
        <tbody>
          ${scanOffers
            .map(
              (o, i) => `
            <tr>
              <td><input type="checkbox" data-scan-idx="${i}" ${selectedScan.has(i) ? 'checked' : ''} aria-label="Select"></td>
              <td>${esc(o.company)}</td>
              <td>${esc(o.title)}</td>
              <td class="muted">${esc(o.location || '—')}</td>
              <td>${o.url ? `<a class="ext-link" href="${esc(o.url)}" target="_blank" rel="noopener">Open</a>` : '—'}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <p class="muted">${scanOffers.length} match(es)</p>
  `;

  mount.querySelectorAll('[data-scan-idx]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const i = parseInt(cb.dataset.scanIdx, 10);
      if (cb.checked) selectedScan.add(i);
      else selectedScan.delete(i);
    });
  });

  $('btnSelectAll')?.addEventListener('click', () => {
    scanOffers.forEach((_, i) => selectedScan.add(i));
    renderScanTriage();
  });

  $('btnAddSelected')?.addEventListener('click', addSelectedToPipeline);
}

async function runScanPreview() {
  const btn = $('btnScanPreview');
  const mount = $('scanTriageMount');
  if (btn) btn.disabled = true;
  if (mount) mount.innerHTML = '<p class="loading">Scanning portals (dry-run)…</p>';

  try {
    const result = await api('/api/scan/preview', { method: 'POST' });
    scanOffers = (result.offers || []).filter((o) => o.url);
    selectedScan = new Set(scanOffers.map((_, i) => i));
    renderScanTriage();
    const n = result.summary?.newOffers ?? scanOffers.length;
    showToast(`Preview: ${n} new match(es)`);
  } catch (e) {
    if (mount) mount.innerHTML = `<p class="empty-state">${esc(e.message)}</p>`;
    showToast(e.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function runScanFull() {
  const btn = $('btnScanRun');
  if (btn) btn.disabled = true;
  try {
    await api('/api/scan/run', { method: 'POST' });
    invalidateSnapshot();
    showToast('Scan complete — check pending inbox');
    await loadInboxPanel();
  } catch (e) {
    showToast(e.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function addSelectedToPipeline() {
  const offers = [...selectedScan].map((i) => scanOffers[i]).filter(Boolean);
  if (!offers.length) {
    showToast('Select at least one offer');
    return;
  }
  try {
    const r = await api('/api/pipeline/add', {
      method: 'POST',
      body: JSON.stringify({ offers }),
    });
    invalidateSnapshot();
    showToast(`Added ${r.added} to pipeline`);
    scanOffers = [];
    selectedScan = new Set();
    await loadInboxPanel();
  } catch (e) {
    showToast(e.message);
  }
}

function renderPipelineList(items) {
  const list = $('pipelineList');
  if (!list) return;

  if (!items.length) {
    list.innerHTML = '<div class="empty-state"><p>Inbox is empty. Use portal scan or LinkedIn source.</p></div>';
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
              <td><a class="ext-link" href="${esc(i.url)}" target="_blank" rel="noopener">${esc(truncateUrl(i.url))}</a></td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <p class="muted">${items.length} pending</p>
  `;
}

function truncateUrl(url) {
  if (!url || url.length < 48) return url || '';
  return url.slice(0, 44) + '…';
}
