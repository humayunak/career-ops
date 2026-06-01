/** Portals — keyword editor, companies, raw YAML */

let portalsTab = 'keywords';
let portalsData = null;
let portalsTagEditors = {};
let companyFilter = '';

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
      <div class="panel-intro">
        <p><strong>Title keywords</strong> control what <code>node scan.mjs</code> keeps. At least one <em>positive</em> match and zero <em>negative</em> matches required. Sync with Profile → primary roles.</p>
      </div>
      <div class="glass-grid glass-grid--stats">
        <div class="kpi glass-card"><div class="kpi__label">Companies on</div><div class="kpi__value" id="portalsEnabledKpi">${data.enabledCount}/${data.totalCount}</div></div>
        <div class="kpi glass-card"><div class="kpi__label">Positive keywords</div><div class="kpi__value">${(data.titleFilter?.positive || []).length}</div></div>
        <div class="kpi glass-card"><div class="kpi__label">Blocked location terms</div><div class="kpi__value">${(data.locationFilter?.block || []).length}</div></div>
      </div>
      <div class="tab-bar" role="tablist">
        <button type="button" class="tab-btn${portalsTab === 'keywords' ? ' active' : ''}" data-ptab="keywords">Scan keywords</button>
        <button type="button" class="tab-btn${portalsTab === 'companies' ? ' active' : ''}" data-ptab="companies">Companies</button>
        <button type="button" class="tab-btn${portalsTab === 'yaml' ? ' active' : ''}" data-ptab="yaml">Advanced YAML</button>
      </div>
      <div id="portalsContent"></div>
    `;

    root.querySelectorAll('[data-ptab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        portalsTab = btn.dataset.ptab;
        loadPortalsPanel();
      });
    });

    const content = $('portalsContent');
    if (portalsTab === 'keywords') renderPortalsKeywords(content, data);
    else if (portalsTab === 'companies') renderPortalsCompanies(content, data);
    else renderPortalsYaml(content, data);
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

function renderPortalsKeywords(content, data) {
  const tf = data.titleFilter || { positive: [], negative: [] };
  const lf = data.locationFilter || { allow: [], block: [], alwaysAllow: [] };

  content.innerHTML = `
    <form id="portalsKeywordsForm" class="config-form">
      <section class="glass-card">
        <h2 class="section-title">Title filter</h2>
        <div id="tags-title-pos"></div>
        <div id="tags-title-neg" style="margin-top:20px"></div>
      </section>
      <section class="glass-card">
        <h2 class="section-title">Location filter</h2>
        <p class="field-hint">Applied after title filter. Empty job location still passes. <code>block</code> rejects hybrid/on-site/relocation phrases.</p>
        <div id="tags-loc-allow"></div>
        <div id="tags-loc-block" style="margin-top:20px"></div>
        <div id="tags-loc-always" style="margin-top:20px"></div>
      </section>
      <div class="form-actions">
        <button type="submit" class="btn btn--primary">Save keywords</button>
        <button type="button" class="btn btn--sm" id="btnScanPreviewPortals">Preview scan</button>
        <button type="button" class="btn btn--sm btn--primary" id="btnScanRunPortals">Run scan → inbox</button>
      </div>
    </form>
  `;

  portalsTagEditors.positive = mountTagEditor($('tags-title-pos'), {
    id: 'title-pos',
    label: 'Positive keywords (must match ≥1)',
    tags: tf.positive,
    hint: 'e.g. AI Solutions Engineer, RAG, LangChain',
  });
  portalsTagEditors.negative = mountTagEditor($('tags-title-neg'), {
    id: 'title-neg',
    label: 'Negative keywords (reject if any match)',
    tags: tf.negative,
    hint: 'e.g. Intern, Junior only',
  });
  portalsTagEditors.locAllow = mountTagEditor($('tags-loc-allow'), {
    id: 'loc-allow',
    label: 'Location allow',
    tags: lf.allow,
  });
  portalsTagEditors.locBlock = mountTagEditor($('tags-loc-block'), {
    id: 'loc-block',
    label: 'Location block',
    tags: lf.block,
  });
  portalsTagEditors.locAlways = mountTagEditor($('tags-loc-always'), {
    id: 'loc-always',
    label: 'Always allow (optional rescue list)',
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

  bindPortalsScanButtons();
}

function renderPortalsCompanies(content, data) {
  const companies = data.companies || [];
  const filtered = companyFilter
    ? companies.filter((c) => c.name.toLowerCase().includes(companyFilter.toLowerCase()))
    : companies;

  content.innerHTML = `
    <section class="glass-card">
      <div class="section-head">
        <h2 class="section-title">Tracked companies</h2>
        <label class="search-wrap">
          <span class="sr-only">Filter companies</span>
          <input type="search" class="search-input" id="companySearch" placeholder="Filter by name…" value="${esc(companyFilter)}">
        </label>
      </div>
      <div class="table-wrap table-wrap--scroll">
        <table class="data-table data-table--compact" id="companiesTable">
          <thead><tr><th>On</th><th>Company</th><th>Provider</th></tr></thead>
          <tbody>
            ${filtered
              .map(
                (c) => `
              <tr>
                <td><input type="checkbox" data-company="${esc(c.name)}" ${c.enabled ? 'checked' : ''} aria-label="Enable ${esc(c.name)}"></td>
                <td>${esc(c.name)}</td>
                <td class="muted">${esc(c.provider || 'auto')}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <p class="muted">${filtered.length} shown · ${companies.filter((c) => c.enabled).length} enabled</p>
      <div class="form-actions" style="margin-top:16px">
        <button type="button" class="btn btn--primary" id="saveCompanies">Save company toggles</button>
        <button type="button" class="btn btn--sm" id="enableAllCos">Enable all visible</button>
        <button type="button" class="btn btn--sm" id="disableAllCos">Disable all visible</button>
      </div>
    </section>
  `;

  $('companySearch')?.addEventListener('input', (e) => {
    companyFilter = e.target.value;
    renderPortalsCompanies($('portalsContent'), portalsData);
  });

  $('enableAllCos')?.addEventListener('click', () => {
    content.querySelectorAll('[data-company]').forEach((cb) => {
      cb.checked = true;
    });
  });
  $('disableAllCos')?.addEventListener('click', () => {
    content.querySelectorAll('[data-company]').forEach((cb) => {
      cb.checked = false;
    });
  });

  $('saveCompanies')?.addEventListener('click', async () => {
    const toggled = new Map(
      [...content.querySelectorAll('[data-company]')].map((cb) => [cb.dataset.company, cb.checked]),
    );
    const companies = (portalsData.companies || []).map((c) => ({
      name: c.name,
      enabled: toggled.has(c.name) ? toggled.get(c.name) : c.enabled,
    }));
    await savePortalsStructured({ companies });
  });
}

function renderPortalsYaml(content, data) {
  content.innerHTML = `
    <div class="glass-card">
      <p class="muted">Full <code>portals.yml</code> — use Scan keywords tab for day-to-day edits.</p>
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
      portalsTab = 'keywords';
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
      showToast('Scan complete');
      switchPanel('inbox');
    } catch (e) {
      showToast(e.message);
    }
  });
}
