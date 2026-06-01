/** Discovery — control plane for portals.yml (scan engine + discovery queries) */

let discoverySection = 'engine';
let discoveryData = null;
let discoveryTagEditors = {};
let companySearch = '';
let companyProviderF = 'all';
let querySearch = '';

// ── SVG icon set ──────────────────────────────────────────────────────────────

const ICONS = {
  zap:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2L3 9h5l-1 5 6-7H8L9 2z"/></svg>`,
  building: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14V4l5-2 5 2v10"/><path d="M3 14h10"/><rect x="6" y="9" width="2" height="5" rx=".5"/><rect x="10" y="6" width="1.5" height="2" rx=".25"/><rect x="6" y="6" width="1.5" height="2" rx=".25"/><rect x="10" y="9" width="1.5" height="2" rx=".25"/></svg>`,
  search:   `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>`,
  tag:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h4v4l-6 6a1.5 1.5 0 01-2 0L3 10a1.5 1.5 0 010-2L9 2z"/><circle cx="11" cy="5" r=".75" fill="currentColor" stroke="none"/></svg>`,
  mappin:   `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1a4 4 0 014 4c0 3-4 9-4 9S4 8 4 5a4 4 0 014-4z"/><circle cx="8" cy="5" r="1.5"/></svg>`,
  code:     `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4L1 8l4 4M11 4l4 4-4 4M9 2l-2 12"/></svg>`,
  play:     `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="4,2 14,8 4,14"/></svg>`,
  eye:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>`,
  arrow:    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`,
  inbox:    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10h3l1.5 3h3L11 10h3"/><path d="M2 10V4h12v6"/></svg>`,
  linkedin: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 7v4M5 5v.01M8 11V8a1.5 1.5 0 013 0v3M8 8v3"/></svg>`,
  globe:    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M8 2c-2 2-3 4-3 6s1 4 3 6M8 2c2 2 3 4 3 6s-1 4-3 6M2 8h12"/></svg>`,
  check:    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l3.5 3.5L13 5"/></svg>`,
  x:        `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>`,
};

function icon(name, cls = '') {
  return `<span class="disco-icon${cls ? ' ' + cls : ''}" aria-hidden="true">${ICONS[name] || ''}</span>`;
}

// ── Provider helpers ──────────────────────────────────────────────────────────

const PROVIDER_META = {
  greenhouse: { label: 'Greenhouse', cls: 'badge--gh' },
  ashby:      { label: 'Ashby',      cls: 'badge--ash' },
  lever:      { label: 'Lever',      cls: 'badge--lev' },
  websearch:  { label: 'websearch',  cls: 'badge--web' },
  skip:       { label: 'skip',       cls: 'badge--skip' },
  parser:     { label: 'parser',     cls: 'badge--web' },
};

function providerBadge(badge) {
  const m = PROVIDER_META[badge] || { label: badge, cls: 'badge--skip' };
  return `<span class="badge ${m.cls}">${esc(m.label)}</span>`;
}

function isLinkedInQuery(q) {
  return (q.query || '').toLowerCase().includes('linkedin.com');
}

// ── Main loader ───────────────────────────────────────────────────────────────

async function loadDiscoveryPanel() {
  const root = $('discoveryRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Loading…</p>';
  discoveryTagEditors = {};

  try {
    const data = await api('/api/portals');
    discoveryData = data;

    if (data.error) {
      root.innerHTML = `<div class="empty-state"><p>${esc(data.error)}</p></div>`;
      return;
    }

    const linkedInTotal  = (data.searchQueries || []).filter(isLinkedInQuery).length;
    const linkedInOn     = (data.searchQueries || []).filter(q => isLinkedInQuery(q) && q.enabled).length;
    const boardTotal     = (data.searchQueries || []).filter(q => !isLinkedInQuery(q)).length;
    const boardOn        = (data.searchQueries || []).filter(q => !isLinkedInQuery(q) && q.enabled).length;

    root.innerHTML = `
      <div class="disco-shell">

        <!-- ── Left nav ── -->
        <nav class="disco-nav" aria-label="Discovery settings">
          <div class="disco-nav__group">
            <span class="disco-nav__label">Engine</span>
            <button class="disco-nav__item${discoverySection === 'engine' ? ' is-active' : ''}" data-dsec="engine">
              ${icon('zap')} Engine status
            </button>
          </div>
          <div class="disco-nav__group">
            <span class="disco-nav__label">API sources</span>
            <button class="disco-nav__item${discoverySection === 'companies' ? ' is-active' : ''}" data-dsec="companies">
              ${icon('building')} Companies
              <span class="disco-nav__count disco-nav__count--green">${data.enabledCount} on</span>
            </button>
          </div>
          <div class="disco-nav__group">
            <span class="disco-nav__label">Discovery queries</span>
            <button class="disco-nav__item${discoverySection === 'boards' ? ' is-active' : ''}" data-dsec="boards">
              ${icon('search')} Job boards
              <span class="disco-nav__count">${boardOn}/${boardTotal}</span>
            </button>
            <button class="disco-nav__item${discoverySection === 'linkedin' ? ' is-active' : ''}" data-dsec="linkedin">
              ${icon('linkedin')} LinkedIn
              <span class="disco-nav__count">${linkedInOn}/${linkedInTotal}</span>
            </button>
          </div>
          <div class="disco-nav__group">
            <span class="disco-nav__label">Filtering</span>
            <button class="disco-nav__item${discoverySection === 'title' ? ' is-active' : ''}" data-dsec="title">
              ${icon('tag')} Title rules
            </button>
            <button class="disco-nav__item${discoverySection === 'location' ? ' is-active' : ''}" data-dsec="location">
              ${icon('mappin')} Location rules
            </button>
          </div>
          <div class="disco-nav__group">
            <span class="disco-nav__label">Advanced</span>
            <button class="disco-nav__item${discoverySection === 'yaml' ? ' is-active' : ''}" data-dsec="yaml">
              ${icon('code')} Raw config
              <span class="disco-nav__count disco-nav__count--dim">yml</span>
            </button>
          </div>
        </nav>

        <!-- ── Right content ── -->
        <div class="disco-content" id="discoContent"></div>
      </div>
    `;

    root.querySelectorAll('[data-dsec]').forEach(btn => {
      btn.addEventListener('click', () => {
        discoverySection = btn.dataset.dsec;
        loadDiscoveryPanel();
      });
    });

    renderDiscoverySection($('discoContent'), data, { linkedInOn, linkedInTotal, boardOn, boardTotal });

  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

function renderDiscoverySection(el, data, counts) {
  switch (discoverySection) {
    case 'engine':    return renderEngine(el, data, counts);
    case 'companies': return renderCompanies(el, data);
    case 'boards':    return renderQueries(el, data, false);
    case 'linkedin':  return renderQueries(el, data, true);
    case 'title':     return renderTitleFilters(el, data);
    case 'location':  return renderLocationFilters(el, data);
    case 'yaml':      return renderYaml(el, data);
  }
}

// ── Engine Status ─────────────────────────────────────────────────────────────

function renderEngine(el, data, { linkedInOn, linkedInTotal, boardOn, boardTotal }) {
  const byP = data.byProvider || {};
  const ghCount  = byP.greenhouse || 0;
  const ashCount = byP.ashby || 0;
  const levCount = byP.lever || 0;
  const webCount = byP.websearch || 0;
  const skipCount = byP.skip || 0;

  // Group board queries by detected source domain
  const boardQueries = (data.searchQueries || []).filter(q => !isLinkedInQuery(q));
  const ghQs  = boardQueries.filter(q => q.query.toLowerCase().includes('greenhouse.io'));
  const ashQs = boardQueries.filter(q => q.query.toLowerCase().includes('ashbyhq.com'));
  const otherQs = boardQueries.filter(q =>
    !q.query.toLowerCase().includes('greenhouse.io') &&
    !q.query.toLowerCase().includes('ashbyhq.com'));

  const ghQOn  = ghQs.filter(q => q.enabled).length;
  const ashQOn = ashQs.filter(q => q.enabled).length;
  const otherQOn = otherQs.filter(q => q.enabled).length;

  el.innerHTML = `
    <!-- Hero -->
    <div class="disco-hero">
      <div class="disco-hero__body">
        <div class="disco-hero__eyebrow">Scan engine · API path</div>
        <div class="disco-hero__title">
          ${data.enabledCount} companies armed
          <span class="disco-hero__sep">·</span>
          ${boardOn} board queries
          <span class="disco-hero__sep">·</span>
          ${linkedInOn} LinkedIn queries
        </div>
        <div class="disco-hero__sub">Direct API calls to Greenhouse, Ashby, Lever — zero AI tokens, zero browser</div>
      </div>
      <div class="disco-hero__actions">
        <button class="btn btn--primary" id="dEngineRun">
          ${icon('play')} Run scan → Inbox
        </button>
        <button class="btn" id="dEnginePreview">
          ${icon('eye')} Preview only
        </button>
      </div>
    </div>

    <!-- Last run strip -->
    <div class="disco-lastrun">
      <span class="disco-lastrun__dot"></span>
      <span>Scan engine is configured and ready</span>
      <span class="disco-lastrun__spacer"></span>
      <button class="btn btn--ghost btn--sm" onclick="switchPanel('inbox')">View Inbox ${icon('arrow')}</button>
    </div>

    <!-- Stats row -->
    <div class="disco-stats">
      <div class="disco-stat">
        <div class="disco-stat__val" style="color:var(--ctp-green)">${data.enabledCount}</div>
        <div class="disco-stat__label">Companies enabled</div>
      </div>
      <div class="disco-stat">
        <div class="disco-stat__val" style="color:var(--ctp-blue)">${data.automatedScanCount}</div>
        <div class="disco-stat__label">API scan targets</div>
      </div>
      <div class="disco-stat">
        <div class="disco-stat__val" style="color:var(--ctp-mauve)">${boardOn}</div>
        <div class="disco-stat__label">Board queries active</div>
      </div>
      <div class="disco-stat">
        <div class="disco-stat__val" style="color:var(--ctp-sky)">${linkedInOn}</div>
        <div class="disco-stat__label">LinkedIn queries</div>
      </div>
    </div>

    <!-- Source map -->
    <div class="glass-card">
      <div class="disco-card-head">
        ${icon('globe', 'disco-card-head__icon')}
        <div>
          <div class="disco-card-head__title">Where jobs come from</div>
          <div class="disco-card-head__sub">Two separate paths — both land in your Inbox</div>
        </div>
      </div>

      <div class="disco-sourcemap">

        <!-- API scan col -->
        <div class="disco-sourcecol">
          <div class="disco-sourcecol__head">
            <span class="disco-sourcecol__label disco-sourcecol__label--green">API scan</span>
            <span class="disco-sourcecol__note">free · instant · structured JSON</span>
          </div>
          ${ghCount ? `
          <div class="disco-sourceitem">
            <span class="disco-sourceitem__dot" style="background:var(--ctp-green)"></span>
            <div class="disco-sourceitem__body">
              <div class="disco-sourceitem__name">Greenhouse</div>
              <div class="disco-sourceitem__note">boards-api.greenhouse.io/v1/boards/{slug}/jobs</div>
            </div>
            <span class="badge badge--gh">${ghCount} co${ghCount !== 1 ? 's' : ''}</span>
          </div>` : ''}
          ${ashCount ? `
          <div class="disco-sourceitem">
            <span class="disco-sourceitem__dot" style="background:var(--ctp-blue)"></span>
            <div class="disco-sourceitem__body">
              <div class="disco-sourceitem__name">Ashby</div>
              <div class="disco-sourceitem__note">api.ashbyhq.com/jobPostings</div>
            </div>
            <span class="badge badge--ash">${ashCount} co${ashCount !== 1 ? 's' : ''}</span>
          </div>` : ''}
          ${levCount ? `
          <div class="disco-sourceitem">
            <span class="disco-sourceitem__dot" style="background:var(--ctp-mauve)"></span>
            <div class="disco-sourceitem__body">
              <div class="disco-sourceitem__name">Lever</div>
              <div class="disco-sourceitem__note">api.lever.co/v0/postings/{slug}</div>
            </div>
            <span class="badge badge--lev">${levCount} co${levCount !== 1 ? 's' : ''}</span>
          </div>` : ''}
          ${webCount ? `
          <div class="disco-sourceitem disco-sourceitem--dim">
            <span class="disco-sourceitem__dot" style="background:var(--ctp-overlay)"></span>
            <div class="disco-sourceitem__body">
              <div class="disco-sourceitem__name">websearch-only</div>
              <div class="disco-sourceitem__note">agent path only — skipped by Run scan</div>
            </div>
            <span class="badge badge--skip">${webCount} co${webCount !== 1 ? 's' : ''}</span>
          </div>` : ''}
        </div>

        <div class="disco-sourcearrow">${icon('arrow')}</div>

        <!-- Discovery queries col -->
        <div class="disco-sourcecol">
          <div class="disco-sourcecol__head">
            <span class="disco-sourcecol__label disco-sourcecol__label--mauve">Discovery queries</span>
            <span class="disco-sourcecol__note">AI agent · costs tokens</span>
          </div>
          ${ghQs.length ? `
          <div class="disco-sourceitem">
            <span class="disco-sourceitem__dot" style="background:var(--ctp-green)"></span>
            <div class="disco-sourceitem__body">
              <div class="disco-sourceitem__name">Greenhouse boards</div>
              <div class="disco-sourceitem__note">site:boards.greenhouse.io &amp; job-boards.greenhouse.io</div>
            </div>
            <span class="badge badge--gh">${ghQOn}/${ghQs.length}</span>
          </div>` : ''}
          ${ashQs.length ? `
          <div class="disco-sourceitem">
            <span class="disco-sourceitem__dot" style="background:var(--ctp-blue)"></span>
            <div class="disco-sourceitem__body">
              <div class="disco-sourceitem__name">Ashby boards</div>
              <div class="disco-sourceitem__note">site:jobs.ashbyhq.com</div>
            </div>
            <span class="badge badge--ash">${ashQOn}/${ashQs.length}</span>
          </div>` : ''}
          ${otherQs.length ? `
          <div class="disco-sourceitem">
            <span class="disco-sourceitem__dot" style="background:var(--ctp-yellow)"></span>
            <div class="disco-sourceitem__body">
              <div class="disco-sourceitem__name">Remote boards &amp; job sites</div>
              <div class="disco-sourceitem__note">Remotive, HN Hiring, fwddeploy, YC, ai-jobs.net…</div>
            </div>
            <span class="badge badge--web">${otherQOn}/${otherQs.length}</span>
          </div>` : ''}
          <div class="disco-sourceitem" style="border-color:rgba(137,180,250,.22);background:rgba(137,180,250,.04)">
            <span class="disco-sourceitem__dot" style="background:var(--ctp-sky)"></span>
            <div class="disco-sourceitem__body">
              <div class="disco-sourceitem__name" style="color:var(--ctp-sky)">LinkedIn Jobs</div>
              <div class="disco-sourceitem__note">site:linkedin.com/jobs — no public ATS API</div>
            </div>
            <span class="badge badge--li">${linkedInOn}/${linkedInTotal}</span>
          </div>
        </div>

      </div><!-- /sourcemap -->

      <!-- Merge line -->
      <div class="disco-merge">
        <span class="disco-merge__line"></span>
        <span class="disco-merge__label">both paths land in</span>
        <span class="disco-merge__inbox">${icon('inbox')} Inbox</span>
        <span class="disco-merge__line"></span>
      </div>
    </div>
  `;

  $('dEngineRun')?.addEventListener('click', async () => {
    try {
      await api('/api/scan/run', { method: 'POST' });
      invalidateSnapshot();
      showToast('Scan complete — check Inbox');
      switchPanel('inbox');
    } catch (e) { showToast(e.message); }
  });

  $('dEnginePreview')?.addEventListener('click', () => {
    switchPanel('inbox');
    setTimeout(() => $('btnScanPreview')?.click(), 150);
  });
}

// ── Companies ─────────────────────────────────────────────────────────────────

function renderCompanies(el, data) {
  const companies = data.companies || [];
  const providers = ['all', ...new Set(companies.map(c => c.badge).filter(Boolean))];

  let filtered = companies;
  if (companySearch) {
    const q = companySearch.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(q));
  }
  if (companyProviderF !== 'all') {
    filtered = filtered.filter(c => c.badge === companyProviderF);
  }

  el.innerHTML = `
    <div class="disco-hint">
      Each row is a <code>tracked_companies</code> entry. Toggle to include in the <strong>API scan</strong>.
      Companies without an ATS API are skipped — they surface via discovery queries only.
    </div>
    <div class="glass-card glass-card--flush">
      <div class="disco-filterbar">
        <label class="sr-only" for="coSearch">Filter companies</label>
        <input type="search" class="search-input" id="coSearch" placeholder="Search companies…" value="${esc(companySearch)}">
        <select class="status-select" id="coProviderFilter" aria-label="Filter by source">
          ${providers.map(p => `<option value="${esc(p)}"${companyProviderF === p ? ' selected' : ''}>${p === 'all' ? 'All sources' : esc(p)}</option>`).join('')}
        </select>
      </div>
      <div class="table-wrap table-wrap--scroll">
        <table class="data-table data-table--compact">
          <thead>
            <tr>
              <th class="col-check">
                <input type="checkbox" data-select-all aria-label="Select all">
              </th>
              <th>Company</th>
              <th>Source</th>
              <th>API scan</th>
              <th>Careers</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(c => `
              <tr class="${c.inAutomatedScan ? '' : 'row--muted'}">
                <td>
                  <label class="disco-toggle">
                    <input type="checkbox" data-company="${esc(c.name)}" ${c.enabled ? 'checked' : ''} aria-label="Enable ${esc(c.name)}">
                    <span class="disco-toggle__track"></span>
                    <span class="disco-toggle__thumb"></span>
                  </label>
                </td>
                <td>
                  <div class="fw500">${esc(c.name)}</div>
                  ${c.notes ? `<div class="text-xs muted">${esc(c.notes)}</div>` : ''}
                  ${c.warning ? `<div class="text-xs" style="color:var(--ctp-peach)">${esc(c.warning)}</div>` : ''}
                </td>
                <td>${providerBadge(c.badge)}</td>
                <td>
                  ${c.inAutomatedScan
                    ? `<span class="disco-yn disco-yn--yes">${icon('check')} Yes</span>`
                    : `<span class="disco-yn disco-yn--no">${icon('x')} No</span>`}
                </td>
                <td>${c.careersUrl ? `<a class="ext-link" href="${esc(c.careersUrl)}" target="_blank" rel="noopener">Open ↗</a>` : '—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="disco-tablefooter">
        <span class="muted">${filtered.length} shown · ${companies.filter(c => c.enabled).length} enabled · ${companies.filter(c => c.enabled && c.inAutomatedScan).length} in API scan</span>
        <div class="disco-tablefooter__actions">
          <button class="btn btn--ghost btn--sm" id="coEnableAll">Enable visible</button>
          <button class="btn btn--ghost btn--sm" id="coDisableAll">Disable visible</button>
          <button class="btn btn--primary btn--sm" id="coSave">Save</button>
        </div>
      </div>
    </div>
  `;

  $('coSearch')?.addEventListener('input', e => { companySearch = e.target.value; renderCompanies(el, data); });
  $('coProviderFilter')?.addEventListener('change', e => { companyProviderF = e.target.value; renderCompanies(el, data); });

  const tableWrap = el.querySelector('.table-wrap');
  wireTableSelectAll(tableWrap, { rowSelector: '[data-company]' });

  const toggleAll = (checked) => {
    const hdr = tableWrap?.querySelector('[data-select-all]');
    if (hdr) { hdr.checked = checked; hdr.indeterminate = false; hdr.dispatchEvent(new Event('change')); }
  };
  $('coEnableAll')?.addEventListener('click', () => toggleAll(true));
  $('coDisableAll')?.addEventListener('click', () => toggleAll(false));

  $('coSave')?.addEventListener('click', async () => {
    const toggled = new Map([...el.querySelectorAll('[data-company]')].map(cb => [cb.dataset.company, cb.checked]));
    const patch = (discoveryData.companies || []).map(c => ({
      name: c.name,
      enabled: toggled.has(c.name) ? toggled.get(c.name) : c.enabled,
    }));
    await saveDiscovery({ companies: patch });
  });
}

// ── Discovery queries ─────────────────────────────────────────────────────────

function renderQueries(el, data, linkedInOnly) {
  const all = data.searchQueries || [];
  let queries = linkedInOnly ? all.filter(isLinkedInQuery) : all.filter(q => !isLinkedInQuery(q));

  if (querySearch) {
    const q = querySearch.toLowerCase();
    queries = queries.filter(item => item.name.toLowerCase().includes(q) || item.query.toLowerCase().includes(q));
  }

  // Group board queries by domain
  let rows = '';
  if (!linkedInOnly) {
    const groups = [
      { label: 'Greenhouse', badge: 'badge--gh', items: queries.filter(q => q.query.toLowerCase().includes('greenhouse.io')) },
      { label: 'Ashby', badge: 'badge--ash', items: queries.filter(q => q.query.toLowerCase().includes('ashbyhq.com')) },
      { label: 'Lever', badge: 'badge--lev', items: queries.filter(q => q.query.toLowerCase().includes('lever.co')) },
      { label: 'Remote &amp; other boards', badge: 'badge--web', items: queries.filter(q =>
          !q.query.toLowerCase().includes('greenhouse.io') &&
          !q.query.toLowerCase().includes('ashbyhq.com') &&
          !q.query.toLowerCase().includes('lever.co')) },
    ].filter(g => g.items.length);

    rows = groups.map(g => `
      <tr class="disco-group-row">
        <td colspan="3">
          <span class="badge ${g.badge}">${g.label}</span>
          <span class="text-xs muted" style="margin-left:6px">${g.items.filter(q => q.enabled).length}/${g.items.length} enabled</span>
        </td>
      </tr>
      ${g.items.map(q => queryRow(q)).join('')}
    `).join('');
  } else {
    rows = queries.map(q => queryRow(q)).join('');
  }

  const enabledCount = queries.filter(q => q.enabled).length;

  el.innerHTML = `
    ${linkedInOnly ? `
    <div class="disco-hint" style="border-color:rgba(137,180,250,.18);background:rgba(137,180,250,.04)">
      LinkedIn has no public ATS API — <code>site:linkedin.com/jobs</code> Google searches are the only automated way to surface roles there.
      These run via <code>/career-ops scan</code> in your assistant, not via the Run scan button.
    </div>` : `
    <div class="disco-hint disco-hint--warn">
      These run when you call <code>/career-ops scan</code> in Cursor — <strong>not</strong> via Run scan here. Each query costs AI tokens (WebSearch).
    </div>`}
    <div class="glass-card glass-card--flush">
      <div class="disco-filterbar">
        <input type="search" class="search-input" id="qSearch" placeholder="Filter by name or query…" value="${esc(querySearch)}">
      </div>
      <div class="table-wrap table-wrap--scroll">
        <table class="data-table data-table--compact">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" data-select-all aria-label="Select all"></th>
              <th>Name</th>
              <th>Query</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="disco-tablefooter">
        <span class="muted">${queries.length} shown · ${enabledCount} enabled</span>
        <div class="disco-tablefooter__actions">
          <button class="btn btn--primary btn--sm" id="qSave">Save toggles</button>
        </div>
      </div>
    </div>
  `;

  $('qSearch')?.addEventListener('input', e => { querySearch = e.target.value; renderQueries(el, data, linkedInOnly); });
  wireTableSelectAll(el.querySelector('.table-wrap'), { rowSelector: '[data-query-idx]' });

  $('qSave')?.addEventListener('click', async () => {
    const toggles = [...el.querySelectorAll('[data-query-idx]')].map(cb => ({
      index: parseInt(cb.dataset.queryIdx, 10),
      enabled: cb.checked,
    }));
    await saveDiscovery({ searchQueries: toggles });
  });
}

function queryRow(q) {
  const preview = q.query.length > 110 ? q.query.slice(0, 107) + '…' : q.query;
  return `
    <tr>
      <td>
        <label class="disco-toggle">
          <input type="checkbox" data-query-idx="${q.index}" ${q.enabled ? 'checked' : ''} aria-label="${esc(q.name)}">
          <span class="disco-toggle__track"></span>
          <span class="disco-toggle__thumb"></span>
        </label>
      </td>
      <td class="fw500">${esc(q.name)}</td>
      <td><code class="query-preview">${esc(preview)}</code></td>
    </tr>`;
}

// ── Title Filters ─────────────────────────────────────────────────────────────

function renderTitleFilters(el, data) {
  const tf = data.titleFilter || { positive: [], negative: [] };

  el.innerHTML = `
    <div class="disco-hint">
      API scan: every job title must match <strong>at least one</strong> positive keyword and <strong>zero</strong> negative keywords. Case-insensitive substring match.
    </div>
    <form id="dTitleForm" class="config-form">
      <div class="disco-filters-grid">
        <section class="glass-card">
          <div class="disco-card-head">
            <span class="disco-icon-badge disco-icon-badge--green">${icon('check')}</span>
            <div>
              <div class="disco-card-head__title">Must match <span class="text-xs muted">(any)</span></div>
              <div class="disco-card-head__sub">Title must contain at least one</div>
            </div>
          </div>
          <div id="dTagTitlePos"></div>
        </section>
        <section class="glass-card">
          <div class="disco-card-head">
            <span class="disco-icon-badge disco-icon-badge--red">${icon('x')}</span>
            <div>
              <div class="disco-card-head__title">Must not match <span class="text-xs muted">(any)</span></div>
              <div class="disco-card-head__sub">Reject if title contains any</div>
            </div>
          </div>
          <div id="dTagTitleNeg"></div>
        </section>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn--primary">Save title rules</button>
        <span class="muted text-xs">Applies on next scan run</span>
      </div>
    </form>
  `;

  discoveryTagEditors.positive = mountTagEditor($('dTagTitlePos'), {
    id: 'title-pos', label: 'Positive keywords', tags: tf.positive,
    hint: 'AI Engineer, RAG, Solutions Architect…',
  });
  discoveryTagEditors.negative = mountTagEditor($('dTagTitleNeg'), {
    id: 'title-neg', label: 'Negative keywords', tags: tf.negative,
    hint: 'Intern, Junior, .NET, Crypto…',
  });

  $('dTitleForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    await saveDiscovery({
      titleFilter: {
        positive: discoveryTagEditors.positive.getTags(),
        negative: discoveryTagEditors.negative.getTags(),
      },
    });
  });
}

// ── Location Filters ──────────────────────────────────────────────────────────

function renderLocationFilters(el, data) {
  const lf = data.locationFilter || { allow: [], block: [], alwaysAllow: [] };

  el.innerHTML = `
    <div class="disco-hint">
      Applied when the posting includes a location field. Empty location always passes.
      <strong>Always allow</strong> overrides any block rule.
    </div>
    <form id="dLocForm" class="config-form">
      <section class="glass-card">
        <div id="dTagLocAllow"></div>
        <div id="dTagLocBlock"  style="margin-top:20px"></div>
        <div id="dTagLocAlways" style="margin-top:20px"></div>
      </section>
      <div class="form-actions">
        <button type="submit" class="btn btn--primary">Save location rules</button>
        <span class="muted text-xs">Applies on next scan run</span>
      </div>
    </form>
  `;

  discoveryTagEditors.locAllow = mountTagEditor($('dTagLocAllow'), {
    id: 'loc-allow', label: 'Remote signals (allow)', tags: lf.allow,
    hint: 'Remote, Worldwide, EMEA…',
  });
  discoveryTagEditors.locBlock = mountTagEditor($('dTagLocBlock'), {
    id: 'loc-block', label: 'Block (reject)', tags: lf.block,
    hint: 'On-site, Hybrid, In-office…',
  });
  discoveryTagEditors.locAlways = mountTagEditor($('dTagLocAlways'), {
    id: 'loc-always', label: 'Always allow (override)', tags: lf.alwaysAllow,
    hint: 'London, Berlin…',
  });

  $('dLocForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    await saveDiscovery({
      locationFilter: {
        allow:       discoveryTagEditors.locAllow.getTags(),
        block:       discoveryTagEditors.locBlock.getTags(),
        alwaysAllow: discoveryTagEditors.locAlways.getTags(),
      },
    });
  });
}

// ── Raw YAML ──────────────────────────────────────────────────────────────────

function renderYaml(el, data) {
  el.innerHTML = `
    <div class="disco-hint disco-hint--warn">
      Direct edit of <code>portals.yml</code>. Prefer the structured sections — invalid YAML will break the scan engine.
    </div>
    <div class="glass-card">
      <textarea class="yaml-editor" id="dYaml">${esc(data.raw || '')}</textarea>
      <div class="form-actions">
        <button class="btn btn--primary btn--sm" id="dYamlSave">Save YAML</button>
      </div>
    </div>
  `;

  $('dYamlSave')?.addEventListener('click', async () => {
    try {
      await api('/api/portals', { method: 'PUT', body: JSON.stringify({ content: $('dYaml')?.value }) });
      showToast('portals.yml saved');
      loadDiscoveryPanel();
    } catch (e) { showToast(e.message); }
  });
}

// ── Save helper ───────────────────────────────────────────────────────────────

async function saveDiscovery(structured) {
  try {
    await api('/api/portals', { method: 'PUT', body: JSON.stringify({ structured }) });
    invalidateSnapshot();
    showToast('Saved');
    loadDiscoveryPanel();
  } catch (e) { showToast(e.message); }
}
