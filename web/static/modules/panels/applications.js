/** Applications — table + filters + status edit */

const APP_TABS = [
  { id: 'all', label: 'All' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'evaluated', label: 'Evaluated' },
  { id: 'applied', label: 'Applied' },
  { id: 'interview', label: 'Interview' },
  { id: 'top', label: 'Top ≥4' },
  { id: 'skip', label: 'SKIP' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'discarded', label: 'Discarded' },
];

let appFilterTab = 'all';
let appSearch = '';
let appDrawerNum = null;
let appSortCol = 'score';
let appSortAsc = false;

function normalizeStatus(raw) {
  let s = (raw || '').replace(/\*\*/g, '').trim().toLowerCase();
  const i = s.indexOf(' 202');
  if (i > 0) s = s.slice(0, i).trim();
  if (s.includes('skip') || s.includes('no aplicar')) return 'skip';
  if (s.includes('interview') || s.includes('entrevista')) return 'interview';
  if (s === 'offer' || s.includes('oferta')) return 'offer';
  if (s.includes('responded')) return 'responded';
  if (s.includes('applied') || s.includes('aplicado')) return 'applied';
  if (s.includes('rejected')) return 'rejected';
  if (s.includes('discarded') || s.includes('descartado')) return 'discarded';
  if (s.includes('evaluated') || s.includes('evaluada')) return 'evaluated';
  if (s === 'inbox') return 'inbox';
  return s;
}

function filterApps(apps) {
  let list = apps.map((a) => ({ ...a, norm: normalizeStatus(a.status) }));
  switch (appFilterTab) {
    case 'inbox':
      list = list.filter((a) => a.norm === 'inbox');
      break;
    case 'evaluated':
      list = list.filter((a) => a.norm === 'evaluated');
      break;
    case 'applied':
      list = list.filter((a) => a.norm === 'applied');
      break;
    case 'interview':
      list = list.filter((a) => a.norm === 'interview' || a.norm === 'offer');
      break;
    case 'top':
      list = list.filter((a) => a.score >= 4);
      break;
    case 'skip':
      list = list.filter((a) => a.norm === 'skip');
      break;
    case 'rejected':
      list = list.filter((a) => a.norm === 'rejected');
      break;
    case 'discarded':
      list = list.filter((a) => a.norm === 'discarded');
      break;
    default:
      break;
  }
  if (appSearch) {
    const q = appSearch.toLowerCase();
    list = list.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (a.notes || '').toLowerCase().includes(q) ||
        (a.recruiterName || '').toLowerCase().includes(q) ||
        (a.location || '').toLowerCase().includes(q) ||
        (a.archetype || '').toLowerCase().includes(q),
    );
  }
  return list.sort((a, b) => (b.score || 0) - (a.score || 0));
}

let appSidecarTab = 'report';

async function loadApplicationsPanel() {
  const root = $('applicationsRoot');
  if (!root) return;

  try {
    const snap = await ensureSnapshot();
    const apps = snap.applications || [];

    root.innerHTML = `
      <div class="filter-bar">
        <div class="tab-bar tab-bar--wrap" role="tablist">
          ${APP_TABS.map(
            (t) => `
            <button type="button" class="tab-btn${appFilterTab === t.id ? ' active' : ''}" data-tab="${t.id}" role="tab">${esc(t.label)}</button>`,
          ).join('')}
        </div>
        <label class="search-wrap">
          <span class="sr-only">Search applications</span>
          <input type="search" class="search-input" id="appSearchInput" placeholder="Search company, role, notes…" value="${esc(appSearch)}">
        </label>
      </div>
      <div class="apps-layout" id="appsLayout">
        <div class="apps-table-pane" id="applicationsTable"></div>
        <div id="appSidecarMount"></div>
      </div>
    `;

    root.querySelectorAll('.tab-btn[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        appFilterTab = btn.dataset.tab;
        loadApplicationsPanel();
      });
    });

    const searchEl = $('appSearchInput');
    searchEl?.addEventListener('input', () => {
      appSearch = searchEl.value;
      renderApplicationsTable(filterApps(apps), apps);
    });

    renderApplicationsTable(filterApps(apps), apps);
    if (appDrawerNum != null) {
      const app = apps.find((a) => a.number === appDrawerNum);
      if (app) renderAppSidecar(app, apps);
    }
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

function scoreTier(s) {
  if (s >= 4) return 'high';
  if (s >= 3) return 'mid';
  return 'low';
}

function nextAction(a) {
  const s = normalizeStatus(a.status);
  if (s === 'interview' || s === 'offer') return { text: 'Prep interview', due: true };
  if (s === 'applied') return { text: a.followUpDate || 'Follow up', due: !!a.followUpDate };
  if (s === 'evaluated') return { text: a.hasPdf ? 'Apply' : 'Generate PDF', due: true };
  if (s === 'inbox') return { text: 'Evaluate', due: false };
  return { text: '—', due: false };
}

function sortApps(list) {
  const dir = appSortAsc ? 1 : -1;
  return [...list].sort((a, b) => {
    switch (appSortCol) {
      case 'company': return dir * (a.company || '').localeCompare(b.company || '');
      case 'status': return dir * (a.norm || '').localeCompare(b.norm || '');
      case 'score': return dir * ((a.score || 0) - (b.score || 0));
      default: return dir * ((a.score || 0) - (b.score || 0));
    }
  });
}

function sortArrow(col) {
  if (appSortCol !== col) return '<span class="sort-arrow">↕</span>';
  return `<span class="sort-arrow active">${appSortAsc ? '↑' : '↓'}</span>`;
}

function renderApplicationsTable(list, allApps) {
  const el = $('applicationsTable');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = '<div class="empty-state"><p class="empty-state__msg">No applications match this filter.</p><p class="empty-state__hint">Try a different tab or search term.</p></div>';
    return;
  }

  const sorted = sortApps(list);

  el.innerHTML = `
    <div class="table-wrap table-wrap--scroll">
      <table class="data-table data-table--hero">
        <thead>
          <tr>
            <th class="col-num">#</th>
            <th class="col-company" data-sort="company">Company / Role ${sortArrow('company')}</th>
            <th class="col-status" data-sort="status">Status ${sortArrow('status')}</th>
            <th class="col-score" data-sort="score">Score ${sortArrow('score')}</th>
            <th class="col-arch">Archetype</th>
            <th class="col-next">Next</th>
            <th class="col-outputs">Outputs</th>
          </tr>
        </thead>
        <tbody>
          ${sorted
            .map((a) => {
              const na = nextAction(a);
              return `
            <tr data-app-num="${a.number}" class="app-row${appDrawerNum === a.number ? ' app-row--open' : ''}">
              <td class="col-num">${a.number}</td>
              <td class="col-company">
                <div class="app-cell-stack">
                  <span class="app-cell-stack__company" title="${esc(a.company)}">${a.companyUrl ? `<a href="${esc(a.companyUrl)}" target="_blank" rel="noopener" class="link-btn">${esc(a.company)}</a>` : esc(a.company)}</span>
                  <span class="app-cell-stack__role" title="${esc(a.role)}">${a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.role)}</a>` : esc(a.role)}</span>
                </div>
              </td>
              <td class="col-status"><span class="status-pill status-pill--${a.norm}">${esc(a.status || '—')}</span></td>
              <td class="col-score"><span class="score-tier--${scoreTier(a.score)}">${esc(formatScore(a.score, a.scoreRaw))}</span></td>
              <td class="col-arch">${a.archetype ? `<span class="archetype-badge">${esc(a.archetype)}</span>` : '<span class="muted">—</span>'}</td>
              <td class="col-next"><span class="next-action-cell${na.due ? ' next-action-cell--due' : ''}">${esc(na.text)}</span></td>
              <td class="col-outputs">
                <span class="output-tray">
                  <span class="output-tick${a.reportNumber ? ' output-tick--on' : ''}" title="Report">R</span>
                  <span class="output-tick${a.hasPdf || a.pdfFilename ? ' output-tick--on' : ''}" title="PDF">P</span>
                  <span class="output-tick${a.hasApplyDraft ? ' output-tick--on' : ''}" title="Answers">A</span>
                </span>
              </td>
            </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  el.querySelectorAll('[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (appSortCol === col) { appSortAsc = !appSortAsc; }
      else { appSortCol = col; appSortAsc = col === 'company'; }
      renderApplicationsTable(list, allApps);
    });
  });

  el.querySelectorAll('.app-row').forEach((row) => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      const num = parseInt(row.dataset.appNum, 10);
      appDrawerNum = appDrawerNum === num ? null : num;
      el.querySelectorAll('.app-row').forEach((r) => {
        r.classList.toggle('app-row--open', parseInt(r.dataset.appNum, 10) === appDrawerNum);
      });
      const app = allApps.find((a) => a.number === num);
      renderAppSidecar(appDrawerNum != null ? app : null, allApps);
    });
  });

}

function getSidecarMount() {
  let mount = $('appSidecarOverlay');
  if (!mount) {
    mount = document.createElement('div');
    mount.id = 'appSidecarOverlay';
    document.body.appendChild(mount);
  }
  return mount;
}

async function renderAppSidecar(app, allApps) {
  const mount = getSidecarMount();
  if (!app) {
    mount.innerHTML = '';
    return;
  }

  const TABS = [
    { id: 'report',   label: 'Report',      has: !!app.reportNumber },
    { id: 'pdf',      label: 'PDF',         has: !!(app.hasPdf || app.pdfFilename) },
    { id: 'answers',  label: 'Answers',     has: !!app.hasApplyDraft },
    { id: 'email',    label: 'Email draft',  has: false },
    { id: 'linkedin', label: 'LinkedIn DM',  has: false },
  ];

  if (!TABS.find(t => t.id === appSidecarTab)?.has) {
    const first = TABS.find(t => t.has);
    appSidecarTab = first ? first.id : 'report';
  }

  mount.innerHTML = `
    <aside class="app-sidecar" aria-label="Application details">
      <div class="app-sidecar__header">
        <button type="button" class="btn btn--sm btn--ghost app-sidecar__close" data-close-sidecar aria-label="Close">&times;</button>
        <h2 class="app-sidecar__company">${esc(app.company)}</h2>
        <p class="app-sidecar__role">${esc(app.role)}</p>
        <div class="app-sidecar__meta">
          <span class="status-pill status-pill--${app.norm}">${esc(app.status || '—')}</span>
          <span class="score-tier--${scoreTier(app.score)}">${esc(formatScore(app.score, app.scoreRaw))}</span>
          ${app.archetype ? `<span class="archetype-badge">${esc(app.archetype)}</span>` : ''}
          ${/^evaluated$/i.test(app.status) ? `<button type="button" class="btn btn--sm btn--primary" data-sidecar-mark-applied="${app.number}">Mark Applied</button>` : ''}
        </div>
      </div>
      <nav class="app-sidecar__tabs">
        ${TABS.map(t => `<button type="button" class="app-sidecar__tab${appSidecarTab === t.id ? ' is-active' : ''}" data-stab="${t.id}" ${t.has ? '' : 'disabled'}>${t.label}</button>`).join('')}
      </nav>
      <div class="app-sidecar__body" id="sidecarBody">
        <p class="loading">Loading…</p>
      </div>
    </aside>
  `;

  mount.querySelector('[data-close-sidecar]')?.addEventListener('click', () => {
    appDrawerNum = null;
    getSidecarMount().innerHTML = '';
    document.querySelectorAll('.app-row--open').forEach(r => r.classList.remove('app-row--open'));
  });

  mount.querySelectorAll('[data-stab]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      appSidecarTab = btn.dataset.stab;
      mount.querySelectorAll('.app-sidecar__tab').forEach(t => t.classList.toggle('is-active', t.dataset.stab === appSidecarTab));
      loadSidecarContent(app);
    });
  });

  mount.querySelector('[data-sidecar-mark-applied]')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      await patchApplication(app.number, { status: 'Applied' });
      btn.textContent = 'Applied';
      btn.classList.add('btn--ghost');
      btn.classList.remove('btn--primary');
      showToast(`Job #${app.number} marked as Applied`);
    } catch {
      btn.disabled = false;
      btn.textContent = 'Mark Applied';
      showToast('Failed to update status');
    }
  });

  loadSidecarContent(app);
}

async function loadSidecarContent(app) {
  const body = $('sidecarBody');
  if (!body) return;

  if (appSidecarTab === 'report' && app.reportNumber) {
    body.innerHTML = '<p class="loading">Loading report…</p>';
    try {
      const data = await api(`/api/reports/${encodeURIComponent(app.reportNumber)}`);
      body.innerHTML = '<div id="sidecarReportMd"></div>';
      mountMdViewer($('sidecarReportMd'), data.markdown, '');
    } catch {
      body.innerHTML = '<div class="empty-state"><p>Report not found.</p></div>';
    }
  } else if (appSidecarTab === 'pdf' && (app.hasPdf || app.pdfFilename)) {
    const filename = app.pdfFilename || `${app.number}.pdf`;
    body.innerHTML = `<iframe src="/api/pdf-preview/${encodeURIComponent(filename)}" style="width:100%;height:100%;border:none;border-radius:var(--r-sm)"></iframe>`;
  } else if (appSidecarTab === 'answers' && app.hasApplyDraft) {
    body.innerHTML = '<p class="loading">Loading answers…</p>';
    try {
      const data = await api(`/api/apply-drafts/${encodeURIComponent(app.reportNumber)}`);
      body.innerHTML = '<div id="sidecarAnswersMd"></div>';
      mountMdViewer($('sidecarAnswersMd'), data.markdown, data.path);
    } catch {
      body.innerHTML = '<div class="empty-state"><p>Could not load apply draft.</p></div>';
    }
  } else if (appSidecarTab === 'email') {
    body.innerHTML = '<div class="empty-state"><p>Email draft not yet generated. Run the apply skill to create one.</p></div>';
  } else if (appSidecarTab === 'linkedin') {
    body.innerHTML = '<div class="empty-state"><p>LinkedIn DM draft not yet generated. Run the apply skill to create one.</p></div>';
  } else {
    body.innerHTML = '<div class="empty-state"><p>Evaluate this role to generate outputs.</p></div>';
  }
}

async function openReportDrawer(reportId, app) {
  const drawer = $('reportDrawer');
  const titleEl = $('reportDrawerTitle');
  const subtitleEl = $('reportDrawerSubtitle');
  const summaryEl = $('reportDrawerSummary');
  const bodyEl = $('reportDrawerBody');
  const linkEl = $('reportDrawerLink');
  if (!drawer) return;

  if (titleEl) titleEl.textContent = app ? `${app.company} — ${app.role}` : `Report #${reportId}`;
  if (subtitleEl) {
    const parts = [];
    if (app?.number) parts.push(`Job #${app.number}`);
    if (app?.date) parts.push(formatTimeAgo(app.date));
    if (app?.score) parts.push(`${app.score}/5`);
    subtitleEl.textContent = parts.join(' · ');
  }
  if (summaryEl) summaryEl.innerHTML = '<p class="loading">Loading…</p>';
  if (bodyEl) bodyEl.innerHTML = '';
  if (linkEl) linkEl.hidden = true;

  drawer.hidden = false;
  drawer.setAttribute('aria-hidden', 'false');

  try {
    const data = await api(`/api/reports/${encodeURIComponent(reportId)}`);
    const summary = data.summary || (typeof parseReportSummary === 'function' ? parseReportSummary(data.markdown) : null);

    if (summaryEl) {
      summaryEl.innerHTML = summary
        ? renderReportSummaryCard(summary)
        : '<p class="muted">No summary block in this report.</p>';
    }

    if (bodyEl) {
      bodyEl.innerHTML = '<div id="reportDrawerMd"></div>';
      mountMdViewer($('reportDrawerMd'), data.markdown, '');
    }

    if (linkEl && data.url) {
      linkEl.href = data.url;
      linkEl.hidden = false;
    }
  } catch (e) {
    if (summaryEl) summaryEl.innerHTML = '';
    if (bodyEl) bodyEl.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

function closeReportDrawer() {
  const drawer = $('reportDrawer');
  if (!drawer) return;
  drawer.hidden = true;
  drawer.setAttribute('aria-hidden', 'true');
}
