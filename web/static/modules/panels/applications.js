/** Applications — table + TUI-style filter tabs */

const APP_TABS = [
  { id: 'all', label: 'All' },
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
  return s;
}

function filterApps(apps) {
  let list = apps.map((a) => ({ ...a, norm: normalizeStatus(a.status) }));
  switch (appFilterTab) {
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
        (a.notes || '').toLowerCase().includes(q),
    );
  }
  return list.sort((a, b) => (b.score || 0) - (a.score || 0));
}

async function loadApplicationsPanel() {
  const root = $('applicationsRoot');
  if (!root) return;

  try {
    const snap = await ensureSnapshot();
    const apps = snap.applications || [];

    root.innerHTML = `
      <div class="panel-intro">
        <p><strong>Copy apply</strong> → paste in your single Cursor career-ops chat. After the agent saves <code>data/apply-drafts/NNN.md</code>, click <strong>View apply</strong> and refresh.</p>
      </div>
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
      <div id="applicationsTable"></div>
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
      renderApplicationsTable(filterApps(apps));
    });

    renderApplicationsTable(filterApps(apps));
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

function renderApplicationsTable(list) {
  const el = $('applicationsTable');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = '<div class="empty-state"><p>No applications match this filter.</p></div>';
    return;
  }

  el.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th><th>Date</th><th>Company</th><th>Role</th><th>Score</th><th>Status</th><th>PDF</th><th>Report</th><th>Apply</th>
          </tr>
        </thead>
        <tbody>
          ${list
            .map(
              (a) => `
            <tr>
              <td>${a.number}</td>
              <td>${esc(a.date)}</td>
              <td>${esc(a.company)}</td>
              <td>${esc(a.role)}</td>
              <td><span class="score-pill ${scoreClass(a.score)}">${esc(formatScore(a.score, a.scoreRaw))}</span></td>
              <td><span class="status-chip" style="color:${statusColor(a.norm)}">${esc(a.status)}</span></td>
              <td>${
                a.pdfFilename
                  ? `<button type="button" class="link-btn" data-preview-pdf="${esc(a.pdfFilename)}">Preview</button>`
                  : a.hasPdf
                    ? '<span class="muted">✓</span>'
                    : '—'
              }</td>
              <td>${a.reportNumber ? `<button type="button" class="link-btn" data-goto-report="${esc(a.reportNumber)}">#${esc(a.reportNumber)}</button>` : '—'}</td>
              <td class="app-actions">
                ${
                  a.reportNumber
                    ? `<button type="button" class="btn btn--sm" data-copy-apply="${esc(a.reportNumber)}">Copy apply</button>
                       ${
                         a.hasApplyDraft
                           ? `<button type="button" class="btn btn--sm btn--primary" data-view-apply="${esc(a.reportNumber)}">View apply</button>`
                           : `<span class="muted app-actions__pending">—</span>`
                       }`
                    : '—'
                }
              </td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  el.querySelectorAll('[data-goto-report]').forEach((btn) => {
    btn.addEventListener('click', () => {
      COW._reportPick = btn.dataset.gotoReport;
      switchPanel('reports');
    });
  });

  el.querySelectorAll('[data-preview-pdf]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openPdfPreview(btn.dataset.previewPdf, `CV #${btn.closest('tr')?.querySelector('td')?.textContent || ''}`);
    });
  });

  const appByReport = new Map(list.filter((a) => a.reportNumber).map((a) => [String(a.reportNumber), a]));

  el.querySelectorAll('[data-copy-apply]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const app = appByReport.get(btn.dataset.copyApply);
      if (!app) return;
      await copyText(buildApplyPrompt(app));
      showToast('Apply prompt copied — paste in your career-ops Cursor chat');
    });
  });

  el.querySelectorAll('[data-view-apply]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const app = appByReport.get(btn.dataset.viewApply);
      openApplyDraft(btn.dataset.viewApply, app ? `${app.company} — ${app.role}` : undefined);
    });
  });
}
