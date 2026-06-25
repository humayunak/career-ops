/** Inbox — portal scan triage, pending evaluate */

let scanOffers = [];

/** Location cell with remote-friendliness flag (worldwide-remote search) */
function renderLocationCell(location) {
  if (!location) return '—';
  const loc = location.toLowerCase();
  const remoteHints = ['remote', 'worldwide', 'anywhere', 'global', 'distributed', 'emea', 'apac'];
  const isRemote = remoteHints.some((k) => loc.includes(k));
  const badge = isRemote
    ? '<span class="badge" style="background:color-mix(in srgb,var(--success) 12%,transparent);color:var(--success);margin-left:6px">remote</span>'
    : '<span class="badge" style="background:color-mix(in srgb,var(--warning) 12%,transparent);color:var(--warning);margin-left:6px" title="Location does not look worldwide-remote — verify before adding">check geo</span>';
  return `${esc(location)}${badge}`;
}

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
      <section class="glass-card">
        <h2 class="section-title">Input channels</h2>
        <p class="muted" style="margin-bottom:12px">Connected sources that feed jobs into your inbox.</p>
        <div class="channel-grid" id="channelGrid"></div>
      </section>

      <section class="glass-card" style="margin-top:16px">
        <div class="section-head">
          <h2 class="section-title">Scan results</h2>
          <div class="section-head__actions">
            <button type="button" class="btn btn--sm" id="btnScanPreview">Preview scan</button>
            <button type="button" class="btn btn--sm btn--primary" id="btnScanRun">Run scan</button>
          </div>
        </div>
        <div id="scanTriageMount"></div>
      </section>

      <section class="glass-card" style="margin-top:16px">
        <div class="section-head">
          <h2 class="section-title">Ready to evaluate (${pending.length})</h2>
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

    renderChannelGrid(snap);
    renderScanTriage();
    renderPipelineList(pending);
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

function renderChannelGrid(snap) {
  const grid = $('channelGrid');
  if (!grid) return;

  const portals = snap.portals || {};
  const enabledCo = portals.enabledCount || 0;
  const totalCo = portals.totalCount || 0;

  const channels = [
    {
      name: 'API Scanner',
      desc: `Greenhouse, Ashby, Lever APIs`,
      status: enabledCo > 0 ? 'active' : 'inactive',
      detail: `${enabledCo}/${totalCo} companies enabled`,
      action: () => switchPanel('discovery'),
      actionLabel: 'Configure',
    },
    {
      name: 'Apify',
      desc: 'LinkedIn Jobs Scraper actor',
      status: 'configured',
      detail: 'curious_coder/linkedin-jobs-scraper',
      link: 'https://console.apify.com/',
      actionLabel: 'Open Apify',
    },
    {
      name: 'LinkedIn Import',
      desc: 'Manual URL paste or DM links',
      status: 'manual',
      detail: 'Paste URLs via /career-ops intake',
      actionLabel: 'How to use',
    },
    {
      name: 'Email',
      desc: 'Gmail recruiter thread import',
      status: 'available',
      detail: 'MCP connector available',
      actionLabel: 'Connect',
    },
  ];

  const statusIcon = (s) => {
    switch (s) {
      case 'active': return '<span class="channel-dot channel-dot--on"></span>';
      case 'configured': return '<span class="channel-dot channel-dot--on"></span>';
      case 'manual': return '<span class="channel-dot channel-dot--dim"></span>';
      default: return '<span class="channel-dot"></span>';
    }
  };

  grid.innerHTML = channels.map(ch => `
    <div class="channel-card glass-card">
      <div class="channel-card__head">
        ${statusIcon(ch.status)}
        <strong>${esc(ch.name)}</strong>
      </div>
      <p class="muted" style="font-size:0.8125rem;margin:4px 0">${esc(ch.desc)}</p>
      <p style="font-size:0.75rem;color:var(--muted-soft)">${esc(ch.detail)}</p>
      ${ch.link ? `<a href="${esc(ch.link)}" target="_blank" rel="noopener" class="btn btn--sm btn--ghost" style="margin-top:8px">${esc(ch.actionLabel)}</a>` : ''}
      ${ch.action ? `<button type="button" class="btn btn--sm btn--ghost channel-action" style="margin-top:8px">${esc(ch.actionLabel)}</button>` : ''}
      ${!ch.link && !ch.action ? `<span class="muted" style="font-size:0.75rem;margin-top:8px;display:block">${esc(ch.actionLabel)}</span>` : ''}
    </div>
  `).join('');

  const actionChannels = channels.filter(c => c.action);
  grid.querySelectorAll('.channel-action').forEach((btn, i) => {
    if (actionChannels[i]?.action) btn.addEventListener('click', actionChannels[i].action);
  });
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
              <td class="muted">${renderLocationCell(o.location)}</td>
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
