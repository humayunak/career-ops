/** Base Resume Library — subnav with Source (MD) + Generated PDFs */

let selectedPdfName = null;
let baseResumeTab = 'source';

async function loadBaseResumesPanel() {
  const root = $('baseResumesRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Loading base resumes…</p>';

  try {
    root.innerHTML = `
      <div class="tab-bar" role="tablist" style="margin-bottom:16px">
        <button type="button" class="tab-btn${baseResumeTab === 'source' ? ' active' : ''}" data-brtab="source" role="tab">Source (MD)</button>
        <button type="button" class="tab-btn${baseResumeTab === 'pdfs' ? ' active' : ''}" data-brtab="pdfs" role="tab">Generated PDFs</button>
      </div>
      <div id="baseResumeContent"></div>
    `;

    root.querySelectorAll('[data-brtab]').forEach(btn => {
      btn.addEventListener('click', () => {
        baseResumeTab = btn.dataset.brtab;
        root.querySelectorAll('[data-brtab]').forEach(b => b.classList.toggle('active', b === btn));
        renderBaseResumeTab();
      });
    });

    renderBaseResumeTab();
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

async function renderBaseResumeTab() {
  const mount = $('baseResumeContent');
  if (!mount) return;

  if (baseResumeTab === 'source') {
    mount.innerHTML = '<p class="loading">Loading CV source…</p>';
    try {
      const sources = [
        { key: 'cv', label: 'CV', path: 'config/cv.md' },
        { key: 'digest', label: 'Article digest', path: 'config/article-digest.md' },
        { key: 'profile', label: 'Profile', path: 'config/_profile.md' },
      ];

      const fetches = await Promise.allSettled(
        sources.map(s => api(`/api/file?path=${encodeURIComponent(s.path)}`))
      );

      const available = sources.filter((s, i) => fetches[i].status === 'fulfilled' && fetches[i].value?.content);

      mount.innerHTML = `
        <div class="split-2 split-2--reports split-2--sticky-left">
          <section>
            <h2 class="section-title">Source files</h2>
            <nav class="report-list" id="brSourceNav">
              ${available.map((s, i) => `
                <button type="button" class="report-item${i === 0 ? ' active' : ''}" data-br-src="${i}">
                  <strong>${esc(s.label)}</strong>
                  <span class="report-item__file">${esc(s.path)}</span>
                </button>
              `).join('')}
            </nav>
          </section>
          <section style="display:flex;flex-direction:column;min-height:0;">
            <h2 class="section-title">Preview</h2>
            <div id="brSourcePreview" style="flex:1;min-height:0;overflow-y:auto;"></div>
          </section>
        </div>
      `;

      const preview = $('brSourcePreview');
      if (available.length && preview) {
        mountMdViewer(preview, fetches[0].value.content, available[0].path);
      }

      mount.querySelectorAll('[data-br-src]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.brSrc, 10);
          mount.querySelectorAll('.report-item').forEach(b => b.classList.toggle('active', b === btn));
          if (preview && fetches[idx]?.status === 'fulfilled') {
            mountMdViewer(preview, fetches[idx].value.content, available[idx].path);
          }
        });
      });
    } catch (e) {
      mount.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
    }
  } else {
    mount.innerHTML = '<p class="loading">Loading PDFs…</p>';
    try {
      const { files } = await api('/api/base-resumes');
      if (!selectedPdfName && files.length) selectedPdfName = files[0].path;

      mount.innerHTML = `
        <div class="split-2 split-2--reports split-2--sticky-left">
          <section>
            <h2 class="section-title">Versions</h2>
            <nav class="report-list" id="resumeListNav"></nav>
          </section>
          <section style="display:flex;flex-direction:column;min-height:0;">
            <h2 class="section-title">PDF Preview</h2>
            <div id="resumePreviewMount" style="flex:1;min-height:0;"></div>
          </section>
        </div>
      `;

      const nav = $('resumeListNav');
      if (!files.length) {
        nav.innerHTML = '<p class="muted">No PDFs yet. Run <code>/career-ops pdf</code>.</p>';
        $('resumePreviewMount').innerHTML = '<div class="empty-state"><p>Nothing to show.</p></div>';
        return;
      }

      nav.innerHTML = files.map(f => `
        <button type="button" class="report-item${f.path === selectedPdfName ? ' active' : ''}" data-path="${esc(f.path)}">
          <strong>${esc(f.label)}</strong>
          <span class="report-item__file">${esc(f.mtime.slice(0, 10))}</span>
        </button>
      `).join('');

      nav.querySelectorAll('.report-item').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedPdfName = btn.dataset.path;
          nav.querySelectorAll('.report-item').forEach(b => b.classList.toggle('active', b === btn));
          renderPdfPreview(selectedPdfName);
        });
      });

      renderPdfPreview(selectedPdfName);
    } catch (e) {
      mount.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
    }
  }
}

function renderPdfPreview(name) {
  const mount = $('resumePreviewMount');
  if (!mount || !name) return;
  const url = `/api/base-resume-pdf/${encodeURIComponent(name)}`;
  mount.innerHTML = `<iframe
    src="${url}"
    style="width:100%;height:75vh;border:none;border-radius:6px;"
    title="Resume PDF preview"
  ></iframe>`;
}
