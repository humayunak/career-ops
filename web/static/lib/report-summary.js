/** Client-side report summary parsing (mirrors web/lib/report-summary.mjs) */

function parseReportSummary(markdown) {
  if (!markdown) return null;
  const md = markdown;

  const pick = (re) => {
    const m = md.match(re);
    return m ? m[1].trim() : null;
  };

  const score = pick(/\*\*Score:\*\*\s*([\d.]+(?:\/5)?)/i);
  const legitimacy = pick(/\*\*Legitimacy:\*\*\s*(\S+)/i);
  const urlRaw = pick(/\*\*URL:\*\*\s*(<?([^>\s]+)>?|(\S+))/i);
  const jobUrl = urlRaw ? urlRaw.replace(/^<|>$/g, '') : null;

  let machine = null;
  const yamlBlock = md.match(/## Machine Summary\s*```ya?ml\s*([\s\S]*?)```/i);
  if (yamlBlock) {
    machine = {};
    for (const line of yamlBlock[1].split('\n')) {
      const m = line.match(/^([a-z_]+):\s*(.+)$/i);
      if (m) machine[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }

  let recommendation = null;
  const recLine = md.match(/(?:^|\n)(?:\*\*)?(?:Recommendation|Verdict)(?:\*\*)?:\s*([^\n]+)/i);
  if (recLine) recommendation = recLine[1].trim();

  return {
    score,
    legitimacy,
    url: jobUrl,
    finalDecision: machine?.final_decision || null,
    nextAction: machine?.next_action || null,
    archetype: machine?.archetype || null,
    company: machine?.company || null,
    role: machine?.role || null,
    recommendation,
  };
}

function renderReportSummaryCard(summary) {
  if (!summary) return '<p class="muted">No summary available.</p>';
  const parts = [];
  if (summary.score) parts.push(`<div class="summary-row"><span class="summary-row__k">Score</span><span>${summary.score}</span></div>`);
  if (summary.legitimacy) parts.push(`<div class="summary-row"><span class="summary-row__k">Legitimacy</span><span>${summary.legitimacy}</span></div>`);
  if (summary.finalDecision) parts.push(`<div class="summary-row"><span class="summary-row__k">Decision</span><span>${summary.finalDecision}</span></div>`);
  if (summary.nextAction) parts.push(`<div class="summary-row"><span class="summary-row__k">Next step</span><span>${summary.nextAction}</span></div>`);
  if (summary.url) {
    parts.push(
      `<div class="summary-row"><span class="summary-row__k">Job</span><a href="${summary.url}" target="_blank" rel="noopener">Open posting</a></div>`,
    );
  }
  if (summary.recommendation) {
    parts.push(`<p class="summary-rec">${summary.recommendation}</p>`);
  }
  return `<div class="report-summary-card">${parts.join('')}</div>`;
}
