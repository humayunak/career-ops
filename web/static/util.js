/** Shared utilities — Career-Ops Web (Catppuccin) */

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

function statusColor(norm) {
  const map = {
    evaluated: 'var(--ctp-blue)',
    applied: 'var(--ctp-green)',
    responded: 'var(--ctp-sky)',
    interview: 'var(--ctp-mauve)',
    offer: 'var(--ctp-yellow)',
    rejected: 'var(--ctp-red)',
    discarded: 'var(--ctp-overlay)',
    skip: 'var(--ctp-peach)',
  };
  return map[norm] || 'var(--ctp-subtext)';
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

  const url = `/api/output/${encodeURIComponent(filename)}`;
  frame.src = url;
  if (heading) heading.textContent = title || filename;
  if (openLink) openLink.href = url;
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
}

function buildApplyPrompt(app) {
  const num = app.reportNumber ? String(app.reportNumber).padStart(3, '0') : '???';
  const reportLine = app.reportPath
    ? `Report: ${app.reportPath}`
    : app.reportNumber
      ? `Report: #${app.reportNumber} (search reports/ for ${app.company})`
      : 'Report: (run evaluation first)';

  return `/career-ops apply

Company: ${app.company}
Role: ${app.role}
${reportLine}
Apply draft file: data/apply-drafts/${num}.md

Open the job application form in your browser, then continue here.

After generating form answers, write the full Q&A to data/apply-drafts/${num}.md so I can read it in the web UI (Applications → View apply). Use one career-ops chat — do not open a new thread.`;
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
    mount.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p><p class="muted">Run apply in Cursor first; agent should save to <code>data/apply-drafts/${String(reportNumber).padStart(3, '0')}.md</code></p></div>`;
  }
}

function closeApplyModal() {
  const modal = $('applyModal');
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

document.addEventListener('DOMContentLoaded', initMarked);
