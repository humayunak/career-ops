/** Inbox — portal scan triage, pending evaluate */

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
      <div class="panel-intro">
        <p>Jobs waiting for evaluation. Add new roles with <strong>/career-ops intake</strong> in your assistant, or use portal scan below.</p>
      </div>
      <div class="workflow-strip glass-card" role="list">
        <div class="workflow-step"><span class="workflow-step__n">${wf.inbox ?? pending.length}</span><span>Inbox</span></div>
        <div class="workflow-step__arrow">→</div>
        <div class="workflow-step"><span class="workflow-step__n">${wf.evaluated ?? 0}</span><span>Evaluated</span></div>
        <div class="workflow-step__arrow">→</div>
        <div class="workflow-step"><span class="workflow-step__n">${wf.reports ?? 0}</span><span>Reports</span></div>
        <div class="workflow-step__arrow">→</div>
        <div class="workflow-step"><span class="workflow-step__n">${wf.pdfs ?? 0}</span><span>Resumes</span></div>
      </div>

      <section class="glass-card" style="margin-top:16px">
        <div class="section-head">
          <h2 class="section-title">Portal scan</h2>
          <div class="section-head__actions">
            <button type="button" class="btn btn--sm" id="btnScanPreview">Preview scan</button>
            <button type="button" class="btn btn--sm btn--primary" id="btnScanRun">Run scan</button>
            <button type="button" class="btn btn--sm btn--ghost" data-goto-portals>Portals settings</button>
          </div>
        </div>
        <p class="muted">Uses enabled companies and filters from <strong>Sources → Portals</strong>. Preview first, then run to add matches here.</p>
        <div id="scanTriageMount"></div>
      </section>

      <section class="glass-card" style="margin-top:16px">
        <div class="section-head">
          <h2 class="section-title">Ready to evaluate</h2>
          <button type="button" class="btn btn--sm" id="copyPipelineCmd">Copy batch evaluate prompt</button>
        </div>
        <div id="pipelineList"></div>
      </section>
    `;

    $('btnScanPreview')?.addEventListener('click', runScanPreview);
    $('btnScanRun')?.addEventListener('click', runScanFull);
    $('copyPipelineCmd')?.addEventListener('click', async () => {
      await copyText(pipelinePrompt());
      showToast('Batch evaluate prompt copied');
    });
    root.querySelector('[data-goto-portals]')?.addEventListener('click', () => switchPanel('portals'));

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
    </div>
    <div class="table-wrap" style="margin-top:12px">
      <table class="data-table">
        <thead><tr><th class="col-check"><input type="checkbox" data-select-all aria-label="Select all"></th><th>Company</th><th>Role</th><th>Location</th><th>URL</th></tr></thead>
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

  wireTableSelectAll(mount, {
    rowSelector: '[data-scan-idx]',
    onRowChange: (cb, checked) => {
      const i = parseInt(cb.dataset.scanIdx, 10);
      if (checked) selectedScan.add(i);
      else selectedScan.delete(i);
    },
  });

  $('btnAddSelected')?.addEventListener('click', addSelectedToPipeline);
}

async function runScanPreview() {
  const btn = $('btnScanPreview');
  const mount = $('scanTriageMount');
  if (btn) btn.disabled = true;
  if (mount) mount.innerHTML = '<p class="loading">Scanning job boards…</p>';

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
    showToast('Scan complete — check list below');
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
    showToast(`Added ${r.added ?? offers.length} to inbox`);
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
    list.innerHTML =
      '<div class="empty-state"><p>Inbox is empty. Run portal scan on Portals, use LinkedIn source, or <code>/career-ops intake</code> in your assistant.</p></div>';
    return;
  }

  list.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Company</th><th>Role</th><th>Actions</th></tr></thead>
        <tbody>
          ${items
            .map(
              (i) => `
            <tr data-pipeline-id="${i.id}">
              <td>${esc(i.company || '—')}</td>
              <td>${esc(i.role || '—')}</td>
              <td class="app-actions">
                <a class="btn btn--sm btn--ghost ext-link" href="${esc(i.url)}" target="_blank" rel="noopener">Open</a>
                <button type="button" class="btn btn--sm" data-eval-pipe="${i.id}">Evaluate</button>
                <button type="button" class="btn btn--sm btn--ghost" data-dismiss-pipe="${i.id}">Dismiss</button>
              </td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <p class="muted">${items.length} waiting</p>
  `;

  const byId = new Map(items.map((i) => [String(i.id), i]));

  list.querySelectorAll('[data-eval-pipe]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const item = byId.get(btn.dataset.evalPipe);
      if (!item) return;
      await copyText(evaluatePrompt(item.url, item.company, item.role));
      showToast('Evaluate prompt copied');
    });
  });

  list.querySelectorAll('[data-dismiss-pipe]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await patchPipeline(btn.dataset.dismissPipe, { status: 'discarded' });
        invalidateSnapshot();
        showToast('Removed from inbox');
        await loadInboxPanel();
      } catch (e) {
        showToast(e.message);
      }
    });
  });
}
