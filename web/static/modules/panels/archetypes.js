/** Archetypes — base resume MD list with preview + edit */

let archetypeSelected = null;

async function loadArchetypesPanel() {
  const root = $('archetypesRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Loading archetypes…</p>';

  try {
    const files = await api('/api/file-list?dir=base-resumes&ext=.md');
    const list = files.files || [];

    if (!list.length) {
      root.innerHTML = '<div class="empty-state"><p>No archetype resumes found in <code>base-resumes/</code>. Run <code>/career-ops pdf</code> to generate one.</p></div>';
      return;
    }

    if (!archetypeSelected || !list.find(f => f.name === archetypeSelected)) {
      archetypeSelected = list[0].name;
    }

    root.innerHTML = `
      <div class="disco-shell">
        <nav class="disco-nav" aria-label="Archetype resumes">
          <div class="disco-nav__group">
            <span class="disco-nav__label">Base resumes</span>
            ${list.map(f => `
              <button class="disco-nav__item${f.name === archetypeSelected ? ' is-active' : ''}" data-arch="${esc(f.name)}">
                ${esc(f.name.replace(/\.md$/, '').replace(/-/g, ' '))}
              </button>
            `).join('')}
          </div>
        </nav>
        <div class="disco-content" id="archContent">
          <div class="section-head" style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
            <h2 class="section-title" style="margin:0" id="archPreviewTitle">${esc(archetypeSelected.replace(/\.md$/, ''))}</h2>
            <button type="button" class="btn btn--ghost btn--sm" id="archEditToggle">Edit</button>
          </div>
          <div id="archPreview" style="flex:1;min-height:0;overflow-y:auto;"></div>
          <div id="archEditor" hidden>
            <textarea class="yaml-editor yaml-editor--full" id="archSource"></textarea>
            <div class="form-actions">
              <button type="button" class="btn btn--primary" id="archSave">Save</button>
              <button type="button" class="btn btn--ghost btn--sm" id="archCancel">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;

    async function showArchetype(name) {
      archetypeSelected = name;
      const preview = $('archPreview');
      const title = $('archPreviewTitle');
      if (title) title.textContent = name.replace(/\.md$/, '').replace(/-/g, ' ');
      if (!preview) return;
      preview.innerHTML = '<p class="loading">Loading…</p>';
      try {
        const { content: md, path } = await api(`/api/file?path=${encodeURIComponent('base-resumes/' + name)}`);
        mountMdViewer(preview, md, path);
        const src = $('archSource');
        if (src) src.value = md || '';
      } catch (e) {
        preview.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
      }
    }

    root.querySelectorAll('[data-arch]').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('[data-arch]').forEach(b => b.classList.toggle('is-active', b === btn));
        showArchetype(btn.dataset.arch);
        $('archPreview').hidden = false;
        $('archEditor').hidden = true;
        $('archEditToggle').textContent = 'Edit';
      });
    });

    let editing = false;
    $('archEditToggle')?.addEventListener('click', () => {
      editing = !editing;
      $('archPreview').hidden = editing;
      $('archEditor').hidden = !editing;
      $('archEditToggle').textContent = editing ? 'Preview' : 'Edit';
      if (editing) $('archSource')?.focus();
    });

    $('archCancel')?.addEventListener('click', () => {
      editing = false;
      $('archPreview').hidden = false;
      $('archEditor').hidden = true;
      $('archEditToggle').textContent = 'Edit';
    });

    $('archSave')?.addEventListener('click', async () => {
      const newMd = $('archSource')?.value;
      const filePath = 'base-resumes/' + archetypeSelected;
      try {
        await api('/api/file', {
          method: 'PUT',
          body: JSON.stringify({ path: filePath, content: newMd }),
        });
        showToast(`${filePath} saved`);
        editing = false;
        $('archPreview').hidden = false;
        $('archEditor').hidden = true;
        $('archEditToggle').textContent = 'Edit';
        const preview = $('archPreview');
        if (preview) mountMdViewer(preview, newMd, filePath);
      } catch (e) {
        showToast(e.message);
      }
    });

    showArchetype(archetypeSelected);
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}
