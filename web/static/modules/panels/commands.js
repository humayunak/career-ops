/** Commands — slash commands + compact workflow reference */

function renderWorkflowHint() {
  return `
    <section class="glass-card diagrams-card">
      <div class="section-head">
        <h2 class="section-title">Workflow diagram</h2>
        <button type="button" class="btn btn--sm btn--ghost" id="btnGoWorkflow">Open Workflow tab</button>
      </div>
      <p class="muted">Full-page swimlane: discover → triage → evaluate → persist → apply → status lifecycle. See sidebar <strong>Workflow</strong>.</p>
    </section>

    <section class="glass-card diagrams-card">
      <h2 class="section-title">Apply loop (your workflow)</h2>
      <div class="workflow-human">
        <div class="workflow-human__step">
          <span class="workflow-human__n">1</span>
          <div><strong>Applications → Copy apply</strong> — paste in your single Cursor chat; open the form in the browser</div>
        </div>
        <div class="workflow-human__step">
          <span class="workflow-human__n">2</span>
          <div><strong>Agent saves</strong> <code>data/apply-drafts/NNN.md</code> (see modes/apply.md)</div>
        </div>
        <div class="workflow-human__step">
          <span class="workflow-human__n">3</span>
          <div><strong>Refresh web → View apply</strong> — read answers without hunting Cursor threads</div>
        </div>
      </div>
    </section>

    <section class="glass-card diagrams-card">
      <h2 class="section-title">Data map</h2>
      <table class="data-table data-table--compact">
        <thead><tr><th>File</th><th>Web panel</th><th>Agent command</th></tr></thead>
        <tbody>
          <tr><td><code>config/profile.yml</code></td><td>Profile → Edit config</td><td>evaluate, pdf</td></tr>
          <tr><td><code>portals.yml</code></td><td>Portals → Scan keywords</td><td><code>scan.mjs</code> / scan</td></tr>
          <tr><td><code>data/career-ops.db</code></td><td>Applications · Inbox</td><td><code>node db.mjs</code> · pipeline · tracker</td></tr>
          <tr><td><code>data/pipeline.md</code></td><td>Inbox (sync)</td><td>/career-ops pipeline · add-pipeline</td></tr>
          <tr><td><code>reports/*.md</code></td><td>Reports</td><td>auto-pipeline, oferta</td></tr>
          <tr><td><code>data/apply-drafts/NNN.md</code></td><td>Applications → View apply</td><td>/career-ops apply</td></tr>
          <tr><td><code>output/*.pdf</code></td><td>Applications → PDF</td><td>pdf · generate-pdf.mjs</td></tr>
        </tbody>
      </table>
    </section>
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
      : '<div class="empty-state"><p>No commands found. Check .cursor/skills/career-ops/SKILL.md</p></div>';

    root.innerHTML = `
      ${renderWorkflowHint()}
      <h2 class="section-title" style="margin:24px 0 16px">Slash commands</h2>
      ${cmdsHtml}
    `;

    const goWf = document.getElementById('btnGoWorkflow');
    if (goWf) goWf.addEventListener('click', () => switchPanel('workflow'));

    root.querySelectorAll('[data-copy-cmd]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const card = btn.closest('.glass-card--cmd');
        const ta = card?.querySelector('.cmd-starter');
        const text = ta?.value?.trim() || btn.dataset.copyCmd;
        await copyText(text);
        showToast('Copied to clipboard — paste in Cursor chat');
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
      : '<span class="badge badge--agent">Agent</span>';

  const npmHint = cmd.npmScript
    ? `<p class="cmd-desc">Terminal: <code>${esc(cmd.npmScript)}</code></p>`
    : '';

  return `
    <div class="glass-card glass-card--cmd">
      <div class="cmd-header">
        <code class="cmd-code">${esc(cmd.command)}</code>
        ${badge}
      </div>
      <p class="cmd-desc">${esc(cmd.description)}</p>
      ${npmHint}
      <label class="sr-only" for="starter-${esc(cmd.mode)}">Starter prompt for ${esc(cmd.mode)}</label>
      <textarea class="cmd-starter" id="starter-${esc(cmd.mode)}" rows="3">${esc(cmd.starterPrompt || cmd.command)}</textarea>
      <div class="cmd-actions">
        <button type="button" class="btn btn--primary btn--sm" data-copy-cmd="${esc(cmd.command)}">Copy for Cursor</button>
      </div>
    </div>
  `;
}
