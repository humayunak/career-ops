/** Shared tag editors and config form helpers */

function tagsToHtml(tags) {
  return (tags || [])
    .map(
      (t) =>
        `<span class="tag-chip" data-tag="${esc(t)}">${esc(t)}<button type="button" class="tag-chip__remove" aria-label="Remove ${esc(t)}">×</button></span>`,
    )
    .join('');
}

function readTagsFromEditor(container) {
  return [...container.querySelectorAll('.tag-chip')].map((el) => el.dataset.tag);
}

function mountTagEditor(mount, { id, label, tags, hint }) {
  mount.innerHTML = `
    <div class="tag-editor" data-editor-id="${esc(id)}">
      <label class="field-label" for="${esc(id)}-input">${esc(label)}</label>
      ${hint ? `<p class="field-hint">${hint}</p>` : ''}
      <div class="tag-editor__chips" id="${esc(id)}-chips">${tagsToHtml(tags)}</div>
      <input type="text" class="tag-editor__input" id="${esc(id)}-input" placeholder="Type keyword, press Enter" autocomplete="off">
    </div>
  `;

  const chips = $(`${id}-chips`);
  const input = $(`${id}-input`);

  function addTag(value) {
    const v = value.trim();
    if (!v) return;
    const existing = readTagsFromEditor(chips);
    if (existing.some((t) => t.toLowerCase() === v.toLowerCase())) return;
    const span = document.createElement('span');
    span.className = 'tag-chip';
    span.dataset.tag = v;
    span.innerHTML = `${esc(v)}<button type="button" class="tag-chip__remove" aria-label="Remove">×</button>`;
    chips.appendChild(span);
    bindChipRemove(span);
    input.value = '';
  }

  function bindChipRemove(chip) {
    chip.querySelector('.tag-chip__remove')?.addEventListener('click', () => chip.remove());
  }

  chips.querySelectorAll('.tag-chip').forEach(bindChipRemove);

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input.value);
    }
    if (e.key === 'Backspace' && !input.value && chips.lastElementChild) {
      chips.lastElementChild.remove();
    }
  });

  return {
    getTags: () => readTagsFromEditor(chips),
    setTags: (list) => {
      chips.innerHTML = tagsToHtml(list);
      chips.querySelectorAll('.tag-chip').forEach(bindChipRemove);
    },
  };
}

function formField(id, label, value, { type = 'text', mono = false, rows } = {}) {
  if (type === 'textarea') {
    return `
      <div class="form-field">
        <label class="field-label" for="${esc(id)}">${esc(label)}</label>
        <textarea class="form-input${mono ? ' form-input--mono' : ''}" id="${esc(id)}" rows="${rows || 3}">${esc(value || '')}</textarea>
      </div>`;
  }
  return `
    <div class="form-field">
      <label class="field-label" for="${esc(id)}">${esc(label)}</label>
      <input type="${type}" class="form-input" id="${esc(id)}" value="${esc(value || '')}">
    </div>`;
}

function collectForm(ids) {
  const out = {};
  for (const [key, id] of Object.entries(ids)) {
    const el = $(id);
    if (el) out[key] = el.value.trim();
  }
  return out;
}
