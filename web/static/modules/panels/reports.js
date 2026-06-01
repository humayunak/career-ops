/** Reports & output — markdown preview + PDF links */

let selectedReportId = null;

async function loadReportsPanel() {
  const root = $('reportsRoot');
  if (!root) return;

  try {
    const snap = await ensureSnapshot();
    const reports = snap.reports || [];
    const outputs = snap.outputs || [];

    if (COW._reportPick) {
      selectedReportId = COW._reportPick;
      COW._reportPick = null;
    }
    if (!selectedReportId && reports.length) selectedReportId = reports[0].id;

    root.innerHTML = `
      <div class="split-2 split-2--reports">
        <section>
          <h2 class="section-title">Reports</h2>
          <nav class="report-list" id="reportListNav" aria-label="Reports"></nav>
        </section>
        <section>
          <h2 class="section-title">Report preview</h2>
          <div id="reportPreviewMount"></div>
          <div id="reportPdfMount" class="report-pdf-slot"></div>
        </section>
      </div>
      <section class="glass-card" style="margin-top:20px">
        <h2 class="section-title">Generated resumes (PDF)</h2>
        <div id="outputPdfList"></div>
      </section>
    `;

    const nav = $('reportListNav');
    if (!reports.length) {
      nav.innerHTML = '<p class="muted">No reports yet. Run <code>/career-ops {JD}</code>.</p>';
      $('reportPreviewMount').innerHTML = '<div class="empty-state"><p>Evaluate a role to create a report.</p></div>';
    } else {
      nav.innerHTML = reports
        .map(
          (r) => `
        <button type="button" class="report-item${r.id === selectedReportId ? ' active' : ''}" data-id="${esc(r.id)}">
          <strong>#${esc(r.id)}</strong>
          <span class="report-item__file">${esc(r.filename)}</span>
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
      outEl.innerHTML = '<p class="muted">No PDFs in <code>output/</code> yet.</p>';
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
    const pdf = (snap.outputs || []).find((o) => o.filename.startsWith(`${padded}-`) || o.filename.startsWith(`${id}-`));

    mount.innerHTML = '<div id="reportMdMount"></div>';
    mountMdViewer($('reportMdMount'), data.markdown, data.path);

    if (pdfMount && pdf) {
      pdfMount.innerHTML = `
        <div class="glass-card" style="margin-top:16px">
          <div class="section-head">
            <h3 class="section-title">Resume PDF</h3>
            <button type="button" class="btn btn--sm btn--primary" data-preview-pdf="${esc(pdf.filename)}">Preview PDF</button>
          </div>
          <p class="muted">${esc(pdf.filename)}</p>
        </div>`;
      pdfMount.querySelector('[data-preview-pdf]')?.addEventListener('click', () => {
        openPdfPreview(pdf.filename, `Report #${id}`);
      });
    }
  } catch (e) {
    mount.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}
