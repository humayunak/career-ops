/** Workflow — architecture + lifecycle process flows (iframes) */

const WF_DIAGRAMS = [
  {
    id: 'lifecycle',
    label: 'Main workflow',
    src: '/static/career-ops-lifecycle-flow.html',
    title: 'Career-Ops main workflow — Discover, Evaluate, Apply',
  },
  {
    id: 'architecture',
    label: 'System & data',
    src: '/static/career-ops-workflow.html',
    title: 'Career-Ops workflow architecture',
  },
];

function renderWorkflowPanel(activeId = 'lifecycle') {
  const active = WF_DIAGRAMS.find((d) => d.id === activeId) || WF_DIAGRAMS[0];
  const tabs = WF_DIAGRAMS.map(
    (d) => `
      <button
        type="button"
        class="btn btn--sm ${d.id === active.id ? 'btn--primary' : 'btn--ghost'}"
        data-wf-tab="${esc(d.id)}"
      >${esc(d.label)}</button>
    `,
  ).join('');

  return `
    <div class="wf-panel">
      <div class="wf-toolbar glass-card">
        <span class="wf-toolbar__title">Workflow diagrams</span>
        <div class="wf-toolbar__controls">
          ${tabs}
          <a class="btn btn--sm btn--ghost ext-link" href="${esc(active.src)}" target="_blank" rel="noopener">Open in new tab</a>
        </div>
      </div>
      <div class="wf-stage">
        <iframe
          src="${esc(active.src)}"
          title="${esc(active.title)}"
          class="wf-frame"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  `;
}

function bindWorkflowTabs(root) {
  root.querySelectorAll('[data-wf-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-wf-tab');
      root.innerHTML = renderWorkflowPanel(id);
      bindWorkflowTabs(root);
    });
  });
}

function loadWorkflowPanel() {
  const root = $('workflowRoot');
  if (!root) return;
  root.innerHTML = renderWorkflowPanel('lifecycle');
  bindWorkflowTabs(root);
}
