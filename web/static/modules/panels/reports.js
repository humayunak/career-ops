/** Reports — summary + full markdown + PDF */

let selectedReportId = null;
let reportViewMode = 'summary';

function reportLabel(r, apps) {
  const app = apps.find((a) => String(a.reportNumber) === String(r.id));
  if (app) {
    const score = app.score ? ` · ${app.score}/5` : '';
    return `#${r.id} · ${app.company} · ${app.role}${score}`;
  }
  return `#${r.id} · ${r.filename.replace(/\.md$/, '')}`;
}

async function loadReportsPanel() {
  const root = $('reportsRoot');
  if (!root) return;

  try {
    const snap = await ensureSnapshot();
    const reports = snap.reports || [];
    const outputs = snap.outputs || [];
    const apps = snap.applications || [];

    if (COW._reportPick) {
      selectedReportId = COW._reportPick;
      COW._reportPick = null;
    }
    if (!selectedReportId && reports.length) selectedReportId = reports[0].id;

    root.innerHTML = `
      <div class="panel-intro">
        <p>Evaluation reports from your AI assistant. Pick a role to see the summary or full write-up.</p>
      </div>
      <div class="split-2 split-2--reports">
        <section>
          <h2 class="section-title">Reports</h2>
          <nav class="report-list" id="reportListNav" aria-label="Reports"></nav>
        </section>
        <section>
          <div class="tab-bar" role="tablist" style="margin-bottom:12px">
            <button type="button" class="tab-btn${reportViewMode === 'summary' ? ' active' : ''}" data-rmode="summary">Summary</button>
            <button type="button" class="tab-btn${reportViewMode === 'full' ? ' active' : ''}" data-rmode="full">Full report</button>
          </div>
          <div id="reportPreviewMount"></div>
          <div id="reportPdfMount" class="report-pdf-slot"></div>
        </section>
      </div>
      <section class="glass-card" style="margin-top:20px">
        <h2 class="section-title">Generated resumes</h2>
        <div id="outputPdfList"></div>
      </section>
    `;

    root.querySelectorAll('[data-rmode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        reportViewMode = btn.dataset.rmode;
        loadReportPreview(selectedReportId);
        root.querySelectorAll('[data-rmode]').forEach((b) => {
          b.classList.toggle('active', b.dataset.rmode === reportViewMode);
        });
      });
    });

    const nav = $('reportListNav');
    if (!reports.length) {
      nav.innerHTML = '<p class="muted">No reports yet.</p>';
      $('reportPreviewMount').innerHTML =
        '<div class="empty-state"><p>Evaluate a role in your AI assistant, then click Refresh.</p></div>';
    } else {
      nav.innerHTML = reports
        .map(
          (r) => `
        <button type="button" class="report-item${r.id === selectedReportId ? ' active' : ''}" data-id="${esc(r.id)}">
          <strong>${esc(reportLabel(r, apps))}</strong>
        </button>`,
        )
        .join('');

      nav.querySelectorAll('.report-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedReportId = btn.dataset.id;
          loadReportsPanel();
        });
      });

      await loadReportPreview(selectedReportId);
    }

    const outEl = $('outputPdfList');
    if (!outputs.length) {
      outEl.innerHTML = '<p class="muted">No resume PDFs yet.</p>';
    } else {
      outEl.innerHTML = `<ul class="pdf-list">${outputs
        .map(
          (o) => `
        <li class="pdf-list__item">
          <button type="button" class="link-btn" data-preview-pdf="${esc(o.filename)}">${esc(o.filename)}</button>
          <span class="muted">${esc(o.mtime.slice(0, 10))}</span>
        </li>`,
        )
        .join('')}</ul>`;
      outEl.querySelectorAll('[data-preview-pdf]').forEach((btn) => {
        btn.addEventListener('click', () => openPdfPreview(btn.dataset.previewPdf, btn.textContent));
      });
    }
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

async function loadReportPreview(id) {
  const mount = $('reportPreviewMount');
  const pdfMount = $('reportPdfMount');
  if (!mount || !id) return;
  mount.innerHTML = '<p class="loading">Loading report…</p>';
  if (pdfMount) pdfMount.innerHTML = '';

  try {
    const data = await api(`/api/reports/${encodeURIComponent(id)}`);
    const snap = await ensureSnapshot();
    const padded = String(id).padStart(3, '0');
    const pdf = (snap.outputs || []).find(
      (o) => o.filename.startsWith(`${padded}-`) || o.filename.startsWith(`${id}-`),
    );

    const summary = data.summary || parseReportSummary(data.markdown);

    if (reportViewMode === 'summary') {
      mount.innerHTML = summary
        ? renderReportSummaryCard(summary)
        : '<div class="empty-state"><p>No summary block in this report. Switch to Full report.</p></div>';
    } else {
      mount.innerHTML = '<div id="reportMdMount"></div>';
      mountMdViewer($('reportMdMount'), data.markdown, '');
    }

    if (pdfMount && pdf) {
      pdfMount.innerHTML = `
        <div class="glass-card" style="margin-top:16px">
          <div class="section-head">
            <h3 class="section-title">Resume PDF</h3>
            <button type="button" class="btn btn--sm btn--primary" data-preview-pdf="${esc(pdf.filename)}">Preview</button>
          </div>
        </div>`;
      pdfMount.querySelector('[data-preview-pdf]')?.addEventListener('click', () => {
        openPdfPreview(pdf.filename, `Report #${id}`);
      });
    }
  } catch (e) {
    mount.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}
