/** Applications — table + filters + status edit */

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
let appCompareSelected = new Set();
let appDrawerNum = null;

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
        <p><strong>Copy application answers</strong> sends a prompt to your AI assistant. After it saves answers, click <strong>Refresh</strong> then <strong>View answers</strong>.</p>
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
        <button type="button" class="btn btn--sm" id="btnCompareApps" disabled>Compare selected (0)</button>
      </div>
      <div id="applicationsTable"></div>
      <div id="appDrawerMount"></div>
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

    $('btnCompareApps')?.addEventListener('click', async () => {
      const selected = apps.filter((a) => appCompareSelected.has(a.number));
      if (selected.length < 2) {
        showToast('Select at least 2 applications to compare');
        return;
      }
      if (selected.length > 3) {
        showToast('Select at most 3 applications');
        return;
      }
      await copyText(comparePrompt(selected));
      showToast('Compare prompt copied — paste in your AI assistant');
    });

    renderApplicationsTable(filterApps(apps), apps);
    if (appDrawerNum != null) {
      const app = apps.find((a) => a.number === appDrawerNum);
      if (app) renderAppDrawer(app);
    }
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

function updateCompareButton() {
  const btn = $('btnCompareApps');
  if (!btn) return;
  const n = appCompareSelected.size;
  btn.disabled = n < 2;
  btn.textContent = `Compare selected (${n})`;
}

function renderApplicationsTable(list, allApps) {
  const el = $('applicationsTable');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = '<div class="empty-state"><p>No applications match this filter.</p></div>';
    updateCompareButton();
    return;
  }

  el.innerHTML = `
    <div class="table-wrap">
      <table class="data-table data-table--apps">
        <thead>
          <tr>
            <th class="col-check"><input type="checkbox" data-select-all aria-label="Select all for compare"></th>
            <th>#</th><th>Date</th><th>Company</th><th>Role</th><th>Score</th><th>Status</th><th>Notes</th><th>PDF</th><th>Report</th><th>Apply</th>
          </tr>
        </thead>
        <tbody>
          ${list
            .map(
              (a) => `
            <tr data-app-num="${a.number}" class="app-row${appDrawerNum === a.number ? ' app-row--open' : ''}">
              <td class="col-check">
                <input type="checkbox" data-compare="${a.number}" aria-label="Select for compare" ${appCompareSelected.has(a.number) ? 'checked' : ''}>
              </td>
              <td><button type="button" class="link-btn" data-open-drawer="${a.number}">${a.number}</button></td>
              <td>${esc(a.date)}</td>
              <td>${esc(a.company)}</td>
              <td>${esc(a.role)}</td>
              <td><span class="score-pill ${scoreClass(a.score)}">${esc(formatScore(a.score, a.scoreRaw))}</span></td>
              <td>
                <select class="status-select" data-status-num="${a.number}" aria-label="Status for ${esc(a.company)}">
                  ${statusSelectOptions(a.status)}
                </select>
              </td>
              <td class="notes-cell">
                <input type="text" class="notes-input" data-notes-num="${a.number}" value="${esc(a.notes || '')}" placeholder="Notes…">
              </td>
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
                    ? `<button type="button" class="btn btn--sm" data-copy-apply="${esc(a.reportNumber)}">Copy answers</button>
                       ${
                         a.hasApplyDraft
                           ? `<button type="button" class="btn btn--sm btn--primary" data-view-apply="${esc(a.reportNumber)}">View answers</button>`
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

  const maxCompare = 3;
  const compareHeader = el.querySelector('[data-select-all]');

  const syncCompareHeader = () => {
    if (!compareHeader) return;
    const rows = [...el.querySelectorAll('[data-compare]')];
    const checked = rows.filter((cb) => cb.checked);
    compareHeader.checked = rows.length > 0 && checked.length === rows.length;
    compareHeader.indeterminate = checked.length > 0 && checked.length < rows.length;
  };

  const applyCompareRow = (cb, checked) => {
    const num = parseInt(cb.dataset.compare, 10);
    if (checked) {
      if (appCompareSelected.size >= maxCompare && !appCompareSelected.has(num)) {
        cb.checked = false;
        showToast('Maximum 3 applications for compare');
        return;
      }
      appCompareSelected.add(num);
    } else {
      appCompareSelected.delete(num);
    }
    updateCompareButton();
    syncCompareHeader();
  };

  el.querySelectorAll('[data-compare]').forEach((cb) => {
    cb.addEventListener('change', () => applyCompareRow(cb, cb.checked));
  });

  compareHeader?.addEventListener('change', () => {
    if (compareHeader.checked) {
      for (const a of list) {
        if (appCompareSelected.size >= maxCompare) break;
        appCompareSelected.add(a.number);
      }
      if (list.length > maxCompare) {
        showToast('Only the first 3 rows were selected (compare limit)');
      }
    } else {
      for (const a of list) appCompareSelected.delete(a.number);
    }
    el.querySelectorAll('[data-compare]').forEach((cb) => {
      const num = parseInt(cb.dataset.compare, 10);
      cb.checked = appCompareSelected.has(num);
    });
    updateCompareButton();
    syncCompareHeader();
  });

  syncCompareHeader();

  el.querySelectorAll('[data-open-drawer]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const num = parseInt(btn.dataset.openDrawer, 10);
      appDrawerNum = appDrawerNum === num ? null : num;
      const app = allApps.find((a) => a.number === num);
      renderAppDrawer(app || null);
      el.querySelectorAll('.app-row').forEach((row) => {
        row.classList.toggle('app-row--open', parseInt(row.dataset.appNum, 10) === appDrawerNum);
      });
    });
  });

  el.querySelectorAll('[data-status-num]').forEach((sel) => {
    sel.addEventListener('change', async () => {
      const num = sel.dataset.statusNum;
      try {
        await patchApplication(num, { status: sel.value });
        invalidateSnapshot();
        showToast('Status updated');
      } catch (e) {
        showToast(e.message);
      }
    });
  });

  el.querySelectorAll('[data-notes-num]').forEach((input) => {
    input.addEventListener('change', async () => {
      const num = input.dataset.notesNum;
      try {
        await patchApplication(num, { notes: input.value });
        invalidateSnapshot();
        showToast('Notes saved');
      } catch (e) {
        showToast(e.message);
      }
    });
  });

  el.querySelectorAll('[data-goto-report]').forEach((btn) => {
    btn.addEventListener('click', () => {
      COW._reportPick = btn.dataset.gotoReport;
      switchPanel('reports');
    });
  });

  el.querySelectorAll('[data-preview-pdf]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openPdfPreview(btn.dataset.previewPdf, btn.textContent);
    });
  });

  const appByReport = new Map(list.filter((a) => a.reportNumber).map((a) => [String(a.reportNumber), a]));

  el.querySelectorAll('[data-copy-apply]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const app = appByReport.get(btn.dataset.copyApply);
      if (!app) return;
      await copyText(buildApplyPrompt(app));
      showToast('Application prompt copied — paste in your AI assistant');
    });
  });

  el.querySelectorAll('[data-view-apply]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const app = appByReport.get(btn.dataset.viewApply);
      openApplyDraft(btn.dataset.viewApply, app ? `${app.company} — ${app.role}` : undefined);
    });
  });

  updateCompareButton();
}

async function renderAppDrawer(app) {
  const mount = $('appDrawerMount');
  if (!mount) return;
  if (!app) {
    mount.innerHTML = '';
    return;
  }

  mount.innerHTML = `
    <aside class="app-drawer glass-card" aria-label="Job details">
      <div class="app-drawer__head">
        <h2 class="section-title">${esc(app.company)} — ${esc(app.role)}</h2>
        <button type="button" class="btn btn--sm btn--ghost" data-close-drawer aria-label="Close">Close</button>
      </div>
      <p class="muted">#${app.number} · ${esc(app.date)} · <span class="score-pill ${scoreClass(app.score)}">${esc(formatScore(app.score, app.scoreRaw))}</span></p>
      <div class="app-drawer__actions">
        ${app.reportNumber ? `<button type="button" class="btn btn--sm" data-drawer-report="${esc(app.reportNumber)}">View report</button>` : ''}
        ${app.pdfFilename ? `<button type="button" class="btn btn--sm" data-drawer-pdf="${esc(app.pdfFilename)}">Preview resume</button>` : ''}
        ${app.reportNumber ? `<button type="button" class="btn btn--sm" data-drawer-copy-apply="${esc(app.reportNumber)}">Copy application prompt</button>` : ''}
        ${app.hasApplyDraft ? `<button type="button" class="btn btn--sm btn--primary" data-drawer-view-apply="${esc(app.reportNumber)}">View answers</button>` : ''}
      </div>
      <div id="appDrawerSummary" class="app-drawer__summary"><p class="loading">Loading summary…</p></div>
    </aside>
  `;

  mount.querySelector('[data-close-drawer]')?.addEventListener('click', () => {
    appDrawerNum = null;
    mount.innerHTML = '';
    document.querySelectorAll('.app-row--open').forEach((r) => r.classList.remove('app-row--open'));
  });

  mount.querySelector('[data-drawer-report]')?.addEventListener('click', () => {
    COW._reportPick = app.reportNumber;
    switchPanel('reports');
  });

  mount.querySelector('[data-drawer-pdf]')?.addEventListener('click', (e) => {
    openPdfPreview(e.target.dataset.drawerPdf, `${app.company} resume`);
  });

  mount.querySelector('[data-drawer-copy-apply]')?.addEventListener('click', async () => {
    await copyText(buildApplyPrompt(app));
    showToast('Application prompt copied');
  });

  mount.querySelector('[data-drawer-view-apply]')?.addEventListener('click', () => {
    openApplyDraft(app.reportNumber, `${app.company} — ${app.role}`);
  });

  if (app.reportNumber) {
    try {
      const data = await api(`/api/reports/${encodeURIComponent(app.reportNumber)}`);
      const summary = typeof parseReportSummary === 'function' ? parseReportSummary(data.markdown) : null;
      const sumEl = $('appDrawerSummary');
      if (sumEl && summary) {
        sumEl.innerHTML = renderReportSummaryCard(summary);
      } else if (sumEl) {
        sumEl.innerHTML = '<p class="muted">No summary available. Open the full report.</p>';
      }
    } catch {
      const sumEl = $('appDrawerSummary');
      if (sumEl) sumEl.innerHTML = '<p class="muted">Report not found.</p>';
    }
  } else {
    $('appDrawerSummary').innerHTML = '<p class="muted">Evaluate this role to generate a report.</p>';
  }
}
