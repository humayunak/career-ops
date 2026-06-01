/** Files — config, CV, digest with markdown preview */

const FILE_ENTRIES = [
  { key: 'profile', label: 'Profile', path: 'config/profile.yml' },
  { key: 'cv', label: 'CV', path: 'cv.md' },
  { key: 'digest', label: 'Digest', path: 'article-digest.md' },
  { key: 'narrative', label: 'Narrative', path: 'modes/_profile.md' },
  { key: 'portals', label: 'Portals', path: 'portals.yml' },
];

let filesTab = 'cv';

async function loadFilesPanel() {
  const root = $('filesRoot');
  if (!root) return;

  root.innerHTML = `
    <div class="tab-bar" role="tablist">
      ${FILE_ENTRIES.map(
        (f) => `
        <button type="button" class="tab-btn${filesTab === f.key ? ' active' : ''}" data-file="${f.key}" role="tab">${esc(f.label)}</button>`,
      ).join('')}
    </div>
    <div id="filesViewer" class="files-viewer"></div>
  `;

  root.querySelectorAll('[data-file]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filesTab = btn.dataset.file;
      loadFilesPanel();
    });
  });

  await loadFileContent(FILE_ENTRIES.find((f) => f.key === filesTab));
}

async function loadFileContent(entry) {
  const viewer = $('filesViewer');
  if (!viewer || !entry) return;
  viewer.innerHTML = '<p class="loading">Loading…</p>';

  try {
    const { content, path } = await api(`/api/file?path=${encodeURIComponent(entry.path)}`);
    const isMd = path.endsWith('.md');
    const isYaml = path.endsWith('.yml') || path.endsWith('.yaml');

    if (isMd) {
      viewer.innerHTML = '<div id="fileMdMount"></div>';
      mountMdViewer($('fileMdMount'), content, path);
    } else if (isYaml) {
      viewer.innerHTML = `
        <div class="md-viewer">
          <div class="md-viewer__toolbar"><span class="md-viewer__path">${esc(path)}</span></div>
          <pre class="file-raw">${esc(content)}</pre>
        </div>`;
    } else {
      viewer.innerHTML = `<pre class="file-raw">${esc(content)}</pre>`;
    }
  } catch (e) {
    viewer.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}
