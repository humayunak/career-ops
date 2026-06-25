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

    renderApplicationsTable(filterApps(apps), apps);
    if (appDrawerNum != null) {
      const app = apps.find((a) => a.number === appDrawerNum);
      if (app) renderAppDrawer(app);
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
            <th class="col-report">Report</th>
            <th class="col-pdf">PDF</th>
            <th class="col-apply">Apply</th>
          </tr>
        </thead>
        <tbody>
          ${sorted
            .map((a) => {
              const na = nextAction(a);
              return `
            <tr data-app-num="${a.number}" class="app-row${appDrawerNum === a.number ? ' app-row--open' : ''}">
              <td class="col-num"><button type="button" class="link-btn" data-open-drawer="${a.number}">${a.number}</button></td>
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
              <td class="col-report">${
                a.reportNumber
                  ? `<button type="button" class="app-report-link" data-open-report="${esc(a.reportNumber)}" data-app-num="${a.number}" title="Open report #${esc(a.reportNumber)}">${coIcon('arrow')}<span>#${esc(a.reportNumber)}</span></button>`
                  : '<span class="muted">—</span>'
              }</td>
              <td class="col-pdf">${
                a.pdfFilename
                  ? `<button type="button" class="link-btn" data-preview-pdf="${esc(a.pdfFilename)}">Preview</button>`
                  : a.hasPdf
                    ? '<span class="muted">✓</span>'
                    : '<span class="muted">—</span>'
              }</td>
              <td class="col-apply app-actions">
                ${
                  a.hasApplyDraft
                    ? `<button type="button" class="btn btn--sm btn--primary" data-view-apply="${esc(a.reportNumber || a.number)}">See Answers</button>`
                    : '<span class="muted app-actions__pending">—</span>'
                }
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

  el.querySelectorAll('[data-open-report]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const reportId = btn.dataset.openReport;
      const appNum = parseInt(btn.dataset.appNum, 10);
      const app = allApps.find((a) => a.number === appNum);
      openReportDrawer(reportId, app);
    });
  });

  el.querySelectorAll('[data-preview-pdf]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openPdfPreview(btn.dataset.previewPdf, btn.textContent);
    });
  });

  const appByNum = new Map(list.map((a) => [a.number, a]));

  el.querySelectorAll('[data-view-apply]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const app = [...appByNum.values()].find(
        (a) => String(a.reportNumber) === btn.dataset.viewApply || a.number === parseInt(btn.dataset.viewApply, 10),
      );
      openApplyDraft(app?.reportNumber || btn.dataset.viewApply, app ? `${app.company} — ${app.role}` : undefined);
    });
  });
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
      <p class="muted">Job #${app.number} · ${esc(formatTimeAgo(app.date))} · <span class="score-pill ${scoreClass(app.score)}">${esc(formatScore(app.score, app.scoreRaw))}</span></p>
      <div class="app-drawer__actions">
        ${app.reportNumber ? `<button type="button" class="btn btn--sm" data-drawer-report="${esc(app.reportNumber)}">View report</button>` : ''}
        ${app.pdfFilename ? `<button type="button" class="btn btn--sm" data-drawer-pdf="${esc(app.pdfFilename)}">Preview resume</button>` : ''}
        ${app.hasApplyDraft ? `<button type="button" class="btn btn--sm btn--primary" data-drawer-view-apply="${esc(app.reportNumber)}">See Answers</button>` : ''}
        ${/^evaluated$/i.test(app.status) ? `<button type="button" class="btn btn--sm btn--success" data-drawer-mark-applied="${app.number}">✓ Mark Applied</button>` : ''}
      </div>
      ${app.selectedBullets ? `
      <div class="app-drawer__bullets">
        <h3 class="section-title" style="font-size:12px;margin:10px 0 6px">CV bullets used</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${app.selectedBullets.split(',').map(b => `<span class="badge" title="Bullet ID from article-digest.md pool">${esc(b.trim())}</span>`).join('')}
        </div>
      </div>` : ''}
      <div id="appDrawerSummary" class="app-drawer__summary"><p class="loading">Loading summary…</p></div>
    </aside>
  `;

  mount.querySelector('[data-close-drawer]')?.addEventListener('click', () => {
    appDrawerNum = null;
    mount.innerHTML = '';
    document.querySelectorAll('.app-row--open').forEach((r) => r.classList.remove('app-row--open'));
  });

  mount.querySelector('[data-drawer-report]')?.addEventListener('click', () => {
    openReportDrawer(app.reportNumber, app);
  });

  mount.querySelector('[data-drawer-pdf]')?.addEventListener('click', (e) => {
    openPdfPreview(e.target.dataset.drawerPdf, `${app.company} resume`);
  });

  mount.querySelector('[data-drawer-view-apply]')?.addEventListener('click', () => {
    openApplyDraft(app.reportNumber, `${app.company} — ${app.role}`);
  });

  mount.querySelector('[data-drawer-mark-applied]')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      await patchApplication(app.number, { status: 'Applied' });
      btn.textContent = '✓ Applied';
      btn.classList.remove('btn--success');
      btn.classList.add('btn--ghost');
      // sync the status label in the table row
      const lbl = document.querySelector(`[data-status-num="${app.number}"]`);
      if (lbl) { lbl.textContent = 'Applied'; lbl.style.color = statusColor('applied'); }
      showToast(`Job #${app.number} marked as Applied`);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = '✓ Mark Applied';
      showToast('Failed to update status');
    }
  });

  const sumEl = $('appDrawerSummary');
  if (app.hasApplyDraft && app.reportNumber) {
    try {
      const data = await api(`/api/apply-drafts/${encodeURIComponent(app.reportNumber)}`);
      if (sumEl) {
        sumEl.innerHTML = `
          <h3 class="section-title" style="font-size:12px;margin:0 0 8px">Application Answers</h3>
          <div id="applyDraftInlineMount"></div>`;
        mountMdViewer($('applyDraftInlineMount'), data.markdown, data.path);
      }
    } catch {
      if (sumEl) sumEl.innerHTML = '<p class="muted">Could not load apply draft.</p>';
    }
  } else if (app.reportNumber) {
    try {
      const data = await api(`/api/reports/${encodeURIComponent(app.reportNumber)}`);
      const summary = typeof parseReportSummary === 'function' ? parseReportSummary(data.markdown) : null;
      if (sumEl && summary) {
        sumEl.innerHTML = renderReportSummaryCard(summary);
      } else if (sumEl) {
        sumEl.innerHTML = '<p class="muted">No summary available. Open the full report.</p>';
      }
    } catch {
      if (sumEl) sumEl.innerHTML = '<p class="muted">Report not found.</p>';
    }
  } else {
    if (sumEl) sumEl.innerHTML = '<p class="muted">Evaluate this role to generate a report.</p>';
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
