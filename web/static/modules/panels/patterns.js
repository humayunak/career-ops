/** Patterns — rejection / targeting insights */

async function loadPatternsPanel() {
  const root = $('patternsRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Analyzing your application history…</p>';

  try {
    const result = await api('/api/insights/patterns');
    if (!result.ok || result.data?.error) {
      root.innerHTML = `<div class="empty-state"><p>${esc(result.data?.error || result.error || 'Analysis failed')}</p><button type="button" class="btn btn--sm" id="btnPatternsRetry">Retry</button></div>`;
      $('btnPatternsRetry')?.addEventListener('click', loadPatternsPanel);
      return;
    }
    const d = result.data;
    const recs = (d.recommendations || [])
      .map(
        (r, i) => `
      <div class="insight-card glass-card">
        <span class="badge badge--${r.impact === 'high' ? 'script' : 'agent'}">${esc(r.impact)}</span>
        <p><strong>${i + 1}. ${esc(r.action)}</strong></p>
        <p class="muted">${esc(r.reasoning)}</p>
      </div>`,
      )
      .join('');

    const blockers = (d.blockerAnalysis || [])
      .slice(0, 8)
      .map((b) => `<li>${esc(b.blocker)} — ${b.frequency}x (${b.percentage}%)</li>`)
      .join('');

    root.innerHTML = `
      <div class="panel-intro">
        <p>Insights from your evaluated roles. Use these to tighten targeting before your next batch of applications.</p>
      </div>
      <div class="kpi-row">
        <div class="kpi"><div class="kpi__label">Applications analyzed</div><div class="kpi__value">${d.metadata?.total ?? '—'}</div></div>
        <div class="kpi"><div class="kpi__label">Recommended threshold</div><div class="kpi__value">${d.scoreThreshold?.recommended ?? '—'}/5</div></div>
      </div>
      ${d.scoreThreshold?.reasoning ? `<p class="muted">${esc(d.scoreThreshold.reasoning)}</p>` : ''}
      <section class="glass-card" style="margin-top:16px">
        <h2 class="section-title">Recommendations</h2>
        ${recs || '<p class="muted">Not enough data yet. Evaluate more roles first.</p>'}
      </section>
      ${
        blockers
          ? `<section class="glass-card" style="margin-top:16px"><h2 class="section-title">Top blockers</h2><ul class="simple-list">${blockers}</ul></section>`
          : ''
      }
      <details class="glass-card" style="margin-top:16px">
        <summary class="section-title" style="cursor:pointer">Technical output</summary>
        <pre class="log-view" style="margin-top:12px;max-height:320px">${esc(JSON.stringify(d, null, 2))}</pre>
      </details>
    `;
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}
