/** Shared utilities — Northstar OS Web */

const CO_ICONS = {
  arrow: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`,
};

function coIcon(name, cls = '') {
  return `<span class="co-icon${cls ? ` ${cls}` : ''}" aria-hidden="true">${CO_ICONS[name] || ''}</span>`;
}

function $(id) {
  return document.getElementById(id);
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      Accept: 'application/json',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function copyText(text) {
  return navigator.clipboard.writeText(text);
}

function showToast(message) {
  let el = $('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('is-visible'), 2800);
}

function scoreClass(score) {
  if (score == null || score <= 0) return '';
  if (score >= 4.4) return 'score-pill--high';
  if (score >= 4) return 'score-pill--mid';
  return 'score-pill--low';
}

function formatScore(score, raw) {
  if (score != null && score > 0) return `${score}/5`;
  return raw || '—';
}

/** Relative time from YYYY-MM-DD (or ISO) — e.g. "3 hr ago", "2 days ago" */
function formatTimeAgo(dateStr) {
  if (!dateStr) return '—';
  const raw = String(dateStr).trim();
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T12:00:00` : raw);
  if (Number.isNaN(d.getTime())) return raw;

  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 45) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return '1 day ago';
  if (day < 7) return `${day} days ago`;
  const week = Math.floor(day / 7);
  if (week === 1) return '1 wk ago';
  if (week < 5) return `${week} wk ago`;
  const month = Math.floor(day / 30);
  if (month === 1) return '1 mo ago';
  if (month < 12) return `${month} mo ago`;
  const year = Math.floor(day / 365);
  return year === 1 ? '1 yr ago' : `${year} yr ago`;
}

function statusColor(norm) {
  const map = {
    evaluated: 'var(--status-info)',
    applied: 'var(--success)',
    responded: 'var(--status-info)',
    interview: 'var(--status-highlight)',
    offer: 'var(--warning)',
    rejected: 'var(--error)',
    discarded: 'var(--text-faint)',
    skip: 'var(--accent-text)',
  };
  return map[norm] || 'var(--text-muted)';
}

function initMarked() {
  if (typeof marked !== 'undefined') {
    marked.setOptions({ gfm: true, breaks: true, headerIds: false, mangle: false });
  }
}

function renderMarkdown(md) {
  initMarked();
  if (typeof marked !== 'undefined') {
    return marked.parse(md || '');
  }
  return `<pre>${esc(md)}</pre>`;
}

/** Mount preview/source toggle for markdown content */
function mountMdViewer(container, markdown, metaPath = '') {
  const id = `mdv-${Math.random().toString(36).slice(2, 9)}`;
  container.innerHTML = `
    <div class="md-viewer" id="${id}">
      <div class="md-viewer__toolbar">
        <span class="md-viewer__path">${esc(metaPath)}</span>
        <div class="md-viewer__toggle" role="tablist" aria-label="View mode">
          <button type="button" class="md-toggle is-active" data-mode="preview" role="tab" aria-selected="true">Preview</button>
          <button type="button" class="md-toggle" data-mode="source" role="tab" aria-selected="false">Source</button>
        </div>
      </div>
      <div class="md-viewer__preview md-preview" data-preview role="tabpanel"></div>
      <pre class="md-viewer__source" data-source role="tabpanel" hidden></pre>
    </div>
  `;

  const root = container.querySelector(`#${id}`);
  const preview = root.querySelector('[data-preview]');
  const source = root.querySelector('[data-source]');
  source.textContent = markdown || '';
  preview.innerHTML = renderMarkdown(markdown);

  root.querySelectorAll('.md-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isPreview = btn.dataset.mode === 'preview';
      root.querySelectorAll('.md-toggle').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      preview.hidden = !isPreview;
      source.hidden = isPreview;
    });
  });

  return root;
}

async function ensureSnapshot() {
  if (!COW.snapshot) {
    COW.snapshot = await api('/api/snapshot');
  }
  return COW.snapshot;
}

/** Inline PDF preview modal */
function openPdfPreview(filename, title) {
  const modal = $('pdfModal');
  const frame = $('pdfModalFrame');
  const heading = $('pdfModalTitle');
  const openLink = $('pdfModalOpen');
  if (!modal || !frame) return;

  const url = `/api/output/${filename.split('/').map(encodeURIComponent).join('/')}`;
  frame.src = url;
  if (heading) heading.textContent = title || filename;
  if (openLink) openLink.href = url;
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
}

function buildApplyPrompt(app) {
  return typeof applyPrompt === 'function' ? applyPrompt(app) : '';
}

async function patchApplication(num, fields) {
  return api(`/api/applications/${encodeURIComponent(num)}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

async function patchPipeline(id, fields) {
  return api(`/api/pipeline/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

async function addPipelineJob({ url, notes, source }) {
  return api('/api/pipeline', {
    method: 'POST',
    body: JSON.stringify({ url, notes: notes || '', source: source || 'manual' }),
  });
}

async function openApplyDraft(reportNumber, title) {
  const modal = $('applyModal');
  const mount = $('applyModalBody');
  const heading = $('applyModalTitle');
  if (!modal || !mount) return;

  if (heading) heading.textContent = title || `Apply draft #${reportNumber}`;
  mount.innerHTML = '<p class="loading">Loading apply draft…</p>';
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');

  try {
    const data = await api(`/api/apply-drafts/${encodeURIComponent(reportNumber)}`);
    mount.innerHTML = '<div id="applyMdMount"></div>';
    mountMdViewer($('applyMdMount'), data.markdown, data.path);
  } catch (e) {
    mount.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p><p class="muted">Run the application assistant first, then Refresh.</p></div>`;
  }
}

function closeApplyModal() {
  const modal = $('applyModal');
  if (modal) {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  }
}

function closeTemplatePreview() {
  const modal = $('templatePreviewModal');
  const frame = $('templatePreviewFrame');
  if (frame) frame.src = 'about:blank';
  if (modal) {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  }
}

function closePdfPreview() {
  const modal = $('pdfModal');
  const frame = $('pdfModalFrame');
  if (frame) frame.src = 'about:blank';
  if (modal) {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Wire a header "select all" checkbox to row checkboxes in the same table.
 * Updates checked / indeterminate on the header when rows change.
 */
function wireTableSelectAll(container, { rowSelector, onRowChange }) {
  const header = container?.querySelector('[data-select-all]');
  if (!header || !rowSelector) return;

  const getRows = () => [...container.querySelectorAll(rowSelector)];

  const syncHeader = () => {
    const rows = getRows();
    const checked = rows.filter((cb) => cb.checked);
    header.checked = rows.length > 0 && checked.length === rows.length;
    header.indeterminate = checked.length > 0 && checked.length < rows.length;
  };

  header.addEventListener('change', () => {
    const on = header.checked;
    header.indeterminate = false;
    getRows().forEach((cb) => {
      if (cb.checked !== on) {
        cb.checked = on;
        onRowChange?.(cb, on);
      }
    });
    syncHeader();
  });

  getRows().forEach((cb) => {
    cb.addEventListener('change', () => {
      onRowChange?.(cb, cb.checked);
      syncHeader();
    });
  });

  syncHeader();
}

document.addEventListener('DOMContentLoaded', initMarked);
