/** Workflow — full-page architecture diagram (iframe) */

function renderWorkflowPanel() {
  return `
    <div class="wf-panel">
      <div class="wf-toolbar glass-card">
        <span class="wf-toolbar__title">Session lifecycle &amp; data flow</span>
        <div class="wf-toolbar__controls">
          <a class="btn btn--sm btn--ghost ext-link" href="/static/career-ops-workflow.html" target="_blank" rel="noopener">Open in new tab</a>
        </div>
      </div>
      <div class="wf-stage">
        <iframe
          src="/static/career-ops-workflow.html"
          title="Career-Ops workflow architecture"
          class="wf-frame"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  `;
}

function loadWorkflowPanel() {
  const root = $('workflowRoot');
  if (!root) return;
  root.innerHTML = renderWorkflowPanel();
}
