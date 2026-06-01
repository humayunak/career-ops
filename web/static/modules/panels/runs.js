/** Runs — script execution logs */

let selectedRunId = null;

async function loadRunsPanel() {
  const root = $('runsRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Loading runs…</p>';

  try {
    const { runs, scripts } = await api('/api/runs');

    root.innerHTML = `
      <div class="panel-intro">
        <p>Maintenance tools (scan, health check, pattern analysis). For everyday job search, use Inbox and Applications instead.</p>
        <div class="run-actions" id="runScriptBtns"></div>
      </div>
      <div class="split-2">
        <section>
          <h2 class="section-title">History</h2>
          <div class="report-list" id="runsList"></div>
        </section>
        <section>
          <h2 class="section-title">Log</h2>
          <pre class="log-view" id="runLogView">Select a run or execute a script.</pre>
        </section>
      </div>
    `;

    const btns = $('runScriptBtns');
    btns.innerHTML = scripts
      .map(
        (s) => `<button type="button" class="btn btn--sm" data-run="${esc(s.id)}">${esc(s.label)}</button>`,
      )
      .join('');

    btns.querySelectorAll('[data-run]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        const logView = $('runLogView');
        logView.textContent = 'Running…';
        try {
          const result = await api(`/api/run/${btn.dataset.run}`, { method: 'POST' });
          logView.textContent = result.log;
          selectedRunId = result.id;
          showToast(`Finished (exit ${result.exitCode})`);
          loadRunsPanel();
        } catch (e) {
          logView.textContent = e.message;
          showToast(e.message);
        } finally {
          btn.disabled = false;
        }
      });
    });

    const list = $('runsList');
    if (!runs.length) {
      list.innerHTML = '<p class="muted">No runs yet.</p>';
    } else {
      if (!selectedRunId) selectedRunId = runs[0].id;
      list.innerHTML = runs
        .map(
          (r) => `
        <button type="button" class="report-item${r.id === selectedRunId ? ' active' : ''}" data-run-id="${esc(r.id)}">
          <strong>${esc(r.filename)}</strong>
          <span class="report-item__file">${esc(r.preview)}</span>
        </button>`,
        )
        .join('');

      list.querySelectorAll('[data-run-id]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          selectedRunId = btn.dataset.runId;
          const { log } = await api(`/api/runs/${encodeURIComponent(selectedRunId)}`);
          $('runLogView').textContent = log;
          loadRunsPanel();
        });
      });

      if (selectedRunId) {
        const { log } = await api(`/api/runs/${encodeURIComponent(selectedRunId)}`);
        $('runLogView').textContent = log;
      }
    }
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}
