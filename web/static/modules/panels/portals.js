/** Portals — scanner config aligned with portals.yml */

let portalsTab = 'overview';
let portalsData = null;
let portalsTagEditors = {};
let companyFilter = '';
let companyProviderFilter = 'all';
let queryFilter = '';

async function loadPortalsPanel() {
  const root = $('portalsRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Loading portals…</p>';
  portalsTagEditors = {};

  try {
    const data = await api('/api/portals');
    portalsData = data;
    if (data.error) {
      root.innerHTML = `<div class="empty-state"><p>${esc(data.error)}</p></div>`;
      return;
    }

    root.innerHTML = `
      <div class="tab-bar tab-bar--wrap" role="tablist">
        <button type="button" class="tab-btn${portalsTab === 'overview' ? ' active' : ''}" data-ptab="overview">How scanning works</button>
        <button type="button" class="tab-btn${portalsTab === 'filters' ? ' active' : ''}" data-ptab="filters">Job filters</button>
        <button type="button" class="tab-btn${portalsTab === 'companies' ? ' active' : ''}" data-ptab="companies">Companies (${data.enabledCount}/${data.totalCount})</button>
        <button type="button" class="tab-btn${portalsTab === 'queries' ? ' active' : ''}" data-ptab="queries">Discovery queries (${data.searchQueriesEnabled}/${data.searchQueriesTotal})</button>
        <button type="button" class="tab-btn${portalsTab === 'yaml' ? ' active' : ''}" data-ptab="yaml">Advanced</button>
      </div>
      <div id="portalsContent" style="margin-top:16px"></div>
    `;

    root.querySelectorAll('[data-ptab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        portalsTab = btn.dataset.ptab;
        loadPortalsPanel();
      });
    });

    const content = $('portalsContent');
    if (portalsTab === 'overview') renderPortalsOverview(content, data);
    else if (portalsTab === 'filters') renderPortalsFilters(content, data);
    else if (portalsTab === 'companies') renderPortalsCompanies(content, data);
    else if (portalsTab === 'queries') renderPortalsQueries(content, data);
    else renderPortalsYaml(content, data);
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

function renderPortalsOverview(content, data) {
  const providerBreakdown = Object.entries(data.byProvider || {})
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `<li><span class="badge badge--agent">${esc(k)}</span> ${n} companies</li>`)
    .join('');

  content.innerHTML = `
    <section class="glass-card">
      <h2 class="section-title">Two ways jobs enter your pipeline</h2>
      <div class="scan-flow">
        <div class="scan-flow__col">
          <h3 class="scan-flow__title">1 · Automated scan (this app)</h3>
          <p class="muted">Inbox → <strong>Preview scan</strong> or <strong>Run scan</strong> runs <code>scan.mjs</code> with zero AI tokens.</p>
          <ol class="scan-flow__steps">
            <li>Loads enabled companies from <code>tracked_companies</code></li>
            <li>Fetches jobs via <strong>Greenhouse</strong>, <strong>Ashby</strong>, <strong>Lever</strong>, or <strong>local parser</strong> APIs</li>
            <li>Applies <strong>title</strong> and <strong>location</strong> filters (Job filters tab)</li>
            <li>Dedupes against scan history and your tracker</li>
            <li>New matches go to your inbox</li>
          </ol>
          <p class="muted scan-flow__note"><strong>${data.automatedScanCount}</strong> enabled companies are picked up by automated scan. <strong>${data.agentOnlyCount}</strong> are configured for agent/web search only (see Companies tab).</p>
        </div>
        <div class="scan-flow__col">
          <h3 class="scan-flow__title">2 · Agent discovery (Cursor)</h3>
          <p class="muted"><strong>Discovery queries</strong> in portals.yml are used when you run <code>/career-ops scan</code> in your assistant (WebSearch across job boards).</p>
          <p class="muted"><strong>${data.searchQueriesEnabled}</strong> of ${data.searchQueriesTotal} discovery queries are enabled. They do not run when you click Run scan here.</p>
          <p class="muted">For new URLs from recruiters or LinkedIn, use <code>/career-ops intake</code> instead of manual forms.</p>
        </div>
      </div>
    </section>

    <div class="glass-grid glass-grid--stats" style="margin-top:16px">
      <div class="kpi glass-card"><div class="kpi__label">Companies enabled</div><div class="kpi__value">${data.enabledCount}</div></div>
      <div class="kpi glass-card"><div class="kpi__label">API scan targets</div><div class="kpi__value">${data.automatedScanCount}</div></div>
      <div class="kpi glass-card"><div class="kpi__label">Title must-match</div><div class="kpi__value">${(data.titleFilter?.positive || []).length} keywords</div></div>
      <div class="kpi glass-card"><div class="kpi__label">Location blocked</div><div class="kpi__value">${(data.locationFilter?.block || []).length} terms</div></div>
    </div>

    <section class="glass-card" style="margin-top:16px">
      <h2 class="section-title">Company scan sources</h2>
      <ul class="simple-list">${providerBreakdown || '<li class="muted">No companies</li>'}</ul>
    </section>

    <section class="glass-card" style="margin-top:16px">
      <div class="section-head">
        <h2 class="section-title">Run automated scan</h2>
        <div class="section-head__actions">
          <button type="button" class="btn btn--sm" id="btnScanPreviewPortals">Preview</button>
          <button type="button" class="btn btn--sm btn--primary" id="btnScanRunPortals">Run scan → inbox</button>
        </div>
      </div>
      <p class="muted">Preview shows new matches without saving. Run scan adds matches to your inbox (then evaluate in your assistant).</p>
    </section>
  `;

  bindPortalsScanButtons();
}

function renderPortalsFilters(content, data) {
  const tf = data.titleFilter || { positive: [], negative: [] };
  const lf = data.locationFilter || { allow: [], block: [], alwaysAllow: [] };

  content.innerHTML = `
    <div class="panel-intro">
      <p>Every job from automated scan must match <strong>at least one</strong> positive title keyword and <strong>no</strong> negative keywords. Location rules apply when the posting lists a location.</p>
    </div>
    <form id="portalsKeywordsForm" class="config-form">
      <section class="glass-card">
        <h2 class="section-title">Title filter</h2>
        <div id="tags-title-pos"></div>
        <div id="tags-title-neg" style="margin-top:20px"></div>
      </section>
      <section class="glass-card">
        <h2 class="section-title">Location filter</h2>
        <p class="field-hint">Reject on-site / hybrid phrases in the location field. Empty location still passes.</p>
        <div id="tags-loc-allow"></div>
        <div id="tags-loc-block" style="margin-top:20px"></div>
        <div id="tags-loc-always" style="margin-top:20px"></div>
      </section>
      <div class="form-actions">
        <button type="submit" class="btn btn--primary">Save filters</button>
      </div>
    </form>
  `;

  portalsTagEditors.positive = mountTagEditor($('tags-title-pos'), {
    id: 'title-pos',
    label: 'Positive (must match at least one)',
    tags: tf.positive,
    hint: 'Role keywords: AI Engineer, RAG, Solutions Architect…',
  });
  portalsTagEditors.negative = mountTagEditor($('tags-title-neg'), {
    id: 'title-neg',
    label: 'Negative (reject if any match)',
    tags: tf.negative,
    hint: 'Intern, Junior, .NET, Crypto…',
  });
  portalsTagEditors.locAllow = mountTagEditor($('tags-loc-allow'), {
    id: 'loc-allow',
    label: 'Location allow (remote signals)',
    tags: lf.allow,
  });
  portalsTagEditors.locBlock = mountTagEditor($('tags-loc-block'), {
    id: 'loc-block',
    label: 'Location block',
    tags: lf.block,
  });
  portalsTagEditors.locAlways = mountTagEditor($('tags-loc-always'), {
    id: 'loc-always',
    label: 'Always allow (overrides block)',
    tags: lf.alwaysAllow,
  });

  $('portalsKeywordsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await savePortalsStructured({
      titleFilter: {
        positive: portalsTagEditors.positive.getTags(),
        negative: portalsTagEditors.negative.getTags(),
      },
      locationFilter: {
        allow: portalsTagEditors.locAllow.getTags(),
        block: portalsTagEditors.locBlock.getTags(),
        alwaysAllow: portalsTagEditors.locAlways.getTags(),
      },
    });
  });
}

function renderPortalsCompanies(content, data) {
  const companies = data.companies || [];
  let filtered = companies;
  if (companyFilter) {
    const q = companyFilter.toLowerCase();
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(q));
  }
  if (companyProviderFilter !== 'all') {
    filtered = filtered.filter((c) => c.badge === companyProviderFilter);
  }

  const providerOptions = ['all', ...new Set(companies.map((c) => c.badge).filter(Boolean))];

  content.innerHTML = `
    <div class="panel-intro">
      <p>Each row is a company in <code>tracked_companies</code>. Toggle which ones participate in <strong>automated scan</strong>. Companies marked <span class="badge badge--script">websearch</span> or <span class="badge badge--script">skip</span> need <code>/career-ops scan</code> in your assistant instead.</p>
    </div>
    <section class="glass-card">
      <div class="filter-bar">
        <label class="search-wrap">
          <span class="sr-only">Filter companies</span>
          <input type="search" class="search-input" id="companySearch" placeholder="Search company…" value="${esc(companyFilter)}">
        </label>
        <select class="status-select" id="companyProviderFilter" aria-label="Filter by scan source">
          ${providerOptions
            .map(
              (p) =>
                `<option value="${esc(p)}"${companyProviderFilter === p ? ' selected' : ''}>${p === 'all' ? 'All sources' : esc(p)}</option>`,
            )
            .join('')}
        </select>
      </div>
      <div class="table-wrap table-wrap--scroll" style="margin-top:12px">
        <table class="data-table data-table--compact">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" data-select-all aria-label="Select all visible"></th>
              <th>Company</th>
              <th>Automated scan</th>
              <th>Source</th>
              <th>Careers page</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map(
                (c) => `
              <tr class="${c.inAutomatedScan ? '' : 'row--muted'}">
                <td><input type="checkbox" data-company="${esc(c.name)}" ${c.enabled ? 'checked' : ''} aria-label="Enable ${esc(c.name)}"></td>
                <td>
                  <strong>${esc(c.name)}</strong>
                  ${c.notes ? `<div class="muted" style="font-size:0.8rem">${esc(c.notes)}</div>` : ''}
                  ${c.scanQuery ? `<div class="muted" style="font-size:0.75rem"><code>${esc(c.scanQuery.length > 80 ? c.scanQuery.slice(0, 77) + '…' : c.scanQuery)}</code></div>` : ''}
                  ${c.warning ? `<div class="muted" style="font-size:0.75rem;color:var(--ctp-peach)">${esc(c.warning)}</div>` : ''}
                </td>
                <td>${c.inAutomatedScan ? '<span class="muted">Yes</span>' : '<span class="muted">No</span>'}</td>
                <td><span class="badge badge--${c.inAutomatedScan ? 'agent' : 'script'}">${esc(c.methodLabel)}</span></td>
                <td>${
                  c.careersUrl
                    ? `<a class="ext-link" href="${esc(c.careersUrl)}" target="_blank" rel="noopener">Open</a>`
                    : '—'
                }</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <p class="muted">${filtered.length} shown · ${companies.filter((c) => c.enabled).length} enabled · ${companies.filter((c) => c.enabled && c.inAutomatedScan).length} in automated scan</p>
      <div class="form-actions" style="margin-top:16px">
        <button type="button" class="btn btn--primary" id="saveCompanies">Save toggles</button>
        <button type="button" class="btn btn--sm" id="enableAllCos">Enable visible</button>
        <button type="button" class="btn btn--sm" id="disableAllCos">Disable visible</button>
      </div>
    </section>
  `;

  $('companySearch')?.addEventListener('input', (e) => {
    companyFilter = e.target.value;
    renderPortalsCompanies($('portalsContent'), portalsData);
  });
  $('companyProviderFilter')?.addEventListener('change', (e) => {
    companyProviderFilter = e.target.value;
    renderPortalsCompanies($('portalsContent'), portalsData);
  });

  const companiesTable = content.querySelector('.table-wrap');
  wireTableSelectAll(companiesTable, { rowSelector: '[data-company]' });

  $('enableAllCos')?.addEventListener('click', () => {
    const header = companiesTable?.querySelector('[data-select-all]');
    if (header) {
      header.checked = true;
      header.indeterminate = false;
      header.dispatchEvent(new Event('change'));
    }
  });
  $('disableAllCos')?.addEventListener('click', () => {
    const header = companiesTable?.querySelector('[data-select-all]');
    if (header) {
      header.checked = false;
      header.indeterminate = false;
      header.dispatchEvent(new Event('change'));
    }
  });

  $('saveCompanies')?.addEventListener('click', async () => {
    const toggled = new Map(
      [...content.querySelectorAll('[data-company]')].map((cb) => [cb.dataset.company, cb.checked]),
    );
    const companiesPatch = (portalsData.companies || []).map((c) => ({
      name: c.name,
      enabled: toggled.has(c.name) ? toggled.get(c.name) : c.enabled,
    }));
    await savePortalsStructured({ companies: companiesPatch });
  });
}

function renderPortalsQueries(content, data) {
  const queries = data.searchQueries || [];
  let filtered = queries;
  if (queryFilter) {
    const q = queryFilter.toLowerCase();
    filtered = filtered.filter(
      (item) => item.name.toLowerCase().includes(q) || item.query.toLowerCase().includes(q),
    );
  }

  content.innerHTML = `
    <div class="panel-intro">
      <p>These are <strong>WebSearch discovery queries</strong> for your AI assistant (<code>/career-ops scan</code>). They search across job boards (Ashby, Greenhouse, Remotive, etc.) — separate from the API scan on the Overview tab.</p>
    </div>
    <section class="glass-card">
      <label class="search-wrap">
        <span class="sr-only">Filter queries</span>
        <input type="search" class="search-input" id="querySearch" placeholder="Filter by name or query text…" value="${esc(queryFilter)}">
      </label>
      <div class="table-wrap" style="margin-top:12px">
        <table class="data-table data-table--compact">
          <thead><tr><th class="col-check"><input type="checkbox" data-select-all aria-label="Select all visible"></th><th>Name</th><th>Query</th></tr></thead>
          <tbody>
            ${filtered
              .map(
                (q) => `
              <tr>
                <td><input type="checkbox" data-query-idx="${q.index}" ${q.enabled ? 'checked' : ''} aria-label="Enable ${esc(q.name)}"></td>
                <td>${esc(q.name)}</td>
                <td><code class="query-preview">${esc(q.query.length > 120 ? q.query.slice(0, 117) + '…' : q.query)}</code></td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <p class="muted">${filtered.length} shown · ${queries.filter((q) => q.enabled).length} enabled</p>
      <div class="form-actions" style="margin-top:16px">
        <button type="button" class="btn btn--primary" id="saveQueries">Save query toggles</button>
      </div>
    </section>
  `;

  $('querySearch')?.addEventListener('input', (e) => {
    queryFilter = e.target.value;
    renderPortalsQueries($('portalsContent'), portalsData);
  });

  wireTableSelectAll(content.querySelector('.table-wrap'), { rowSelector: '[data-query-idx]' });

  $('saveQueries')?.addEventListener('click', async () => {
    const toggles = [...content.querySelectorAll('[data-query-idx]')].map((cb) => ({
      index: parseInt(cb.dataset.queryIdx, 10),
      enabled: cb.checked,
    }));
    await savePortalsStructured({ searchQueries: toggles });
  });
}

function renderPortalsYaml(content, data) {
  content.innerHTML = `
    <div class="glass-card">
      <p class="muted">Full <code>portals.yml</code>. Prefer the other tabs for everyday edits.</p>
      <textarea class="yaml-editor" id="portalsYaml">${esc(data.raw || '')}</textarea>
      <button type="button" class="btn btn--primary btn--sm" id="savePortalsYaml" style="margin-top:12px">Save YAML</button>
    </div>
  `;
  $('savePortalsYaml')?.addEventListener('click', async () => {
    try {
      await api('/api/portals', {
        method: 'PUT',
        body: JSON.stringify({ content: $('portalsYaml')?.value }),
      });
      showToast('portals.yml saved');
      portalsTab = 'overview';
      loadPortalsPanel();
    } catch (e) {
      showToast(e.message);
    }
  });
}

async function savePortalsStructured(structured) {
  try {
    await api('/api/portals', {
      method: 'PUT',
      body: JSON.stringify({ structured }),
    });
    invalidateSnapshot();
    showToast('portals.yml saved');
    loadPortalsPanel();
  } catch (e) {
    showToast(e.message);
  }
}

function bindPortalsScanButtons() {
  $('btnScanPreviewPortals')?.addEventListener('click', async () => {
    switchPanel('inbox');
    setTimeout(() => $('btnScanPreview')?.click(), 150);
  });
  $('btnScanRunPortals')?.addEventListener('click', async () => {
    try {
      await api('/api/scan/run', { method: 'POST' });
      invalidateSnapshot();
      showToast('Scan complete — check Inbox');
      switchPanel('inbox');
    } catch (e) {
      showToast(e.message);
    }
  });
}
