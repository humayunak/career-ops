/** AI commands — copy prompts for Cursor / Claude */

function renderWorkflowHint() {
  return `
    <section class="glass-card diagrams-card">
      <div class="section-head">
        <h2 class="section-title">How you work with the assistant</h2>
        <button type="button" class="btn btn--sm btn--ghost" id="btnGoWorkflow">See diagram</button>
      </div>
      <div class="workflow-human">
        <div class="workflow-human__step">
          <span class="workflow-human__n">1</span>
          <div><strong>Discover</strong> — <code>/career-ops intake</code>, portal scan, or LinkedIn</div>
        </div>
        <div class="workflow-human__step">
          <span class="workflow-human__n">2</span>
          <div><strong>Evaluate</strong> — copy a prompt; assistant scores the role and saves a report + resume</div>
        </div>
        <div class="workflow-human__step">
          <span class="workflow-human__n">3</span>
          <div><strong>Apply</strong> — copy application prompt; view saved answers here after Refresh</div>
        </div>
      </div>
    </section>

    <details class="glass-card diagrams-card">
      <summary class="section-title" style="cursor:pointer">Advanced: files and commands</summary>
      <table class="data-table data-table--compact" style="margin-top:12px">
        <thead><tr><th>Data</th><th>Web panel</th><th>Assistant</th></tr></thead>
        <tbody>
          <tr><td>Profile</td><td>Profile</td><td>evaluate, pdf</td></tr>
          <tr><td>Job boards config</td><td>Portals</td><td>scan</td></tr>
          <tr><td>Database</td><td>Applications · Inbox</td><td>pipeline · tracker</td></tr>
          <tr><td>Reports</td><td>Reports</td><td>evaluate JD</td></tr>
          <tr><td>Application answers</td><td>Applications</td><td>apply</td></tr>
          <tr><td>Resume PDFs</td><td>Applications</td><td>pdf</td></tr>
        </tbody>
      </table>
    </details>
  `;
}

async function loadCommandsPanel() {
  const root = $('commandsRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Loading commands…</p>';

  try {
    const { commands } = await api('/api/commands');
    COW.commands = commands;

    const cmdsHtml = commands.length
      ? `<div class="glass-grid glass-grid--cmds">${commands.map(renderCommandCard).join('')}</div>`
      : '<div class="empty-state"><p>No commands found.</p></div>';

    root.innerHTML = `
      <div class="panel-intro">
        <p>Copy a starter prompt into your AI assistant (Cursor, Claude Code, etc.). This app shows results; the assistant does the work.</p>
      </div>
      ${renderWorkflowHint()}
      <h2 class="section-title" style="margin:24px 0 16px">Commands</h2>
      ${cmdsHtml}
    `;

    $('btnGoWorkflow')?.addEventListener('click', () => switchPanel('workflow'));

    root.querySelectorAll('[data-copy-cmd]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const card = btn.closest('.glass-card--cmd');
        const ta = card?.querySelector('.cmd-starter');
        const text = ta?.value?.trim() || btn.dataset.copyCmd;
        await copyText(text);
        showToast('Copied — paste in your AI assistant');
      });
    });
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

function renderCommandCard(cmd) {
  const badge =
    cmd.kind === 'script'
      ? '<span class="badge badge--script">Script</span>'
      : '<span class="badge badge--agent">Assistant</span>';

  return `
    <div class="glass-card glass-card--cmd">
      <div class="cmd-header">
        <code class="cmd-code">${esc(cmd.command)}</code>
        ${badge}
      </div>
      <p class="cmd-desc">${esc(cmd.description)}</p>
      <label class="sr-only" for="starter-${esc(cmd.mode)}">Starter prompt</label>
      <textarea class="cmd-starter" id="starter-${esc(cmd.mode)}" rows="3">${esc(cmd.starterPrompt || cmd.command)}</textarea>
      <div class="cmd-actions">
        <button type="button" class="btn btn--primary btn--sm" data-copy-cmd="${esc(cmd.command)}">Copy prompt</button>
      </div>
    </div>
  `;
}
