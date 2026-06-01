/**
 * Parse evaluation report markdown into a compact summary for the web UI.
 */

export function parseReportSummary(markdown) {
  if (!markdown) return null;
  const md = markdown;

  const pick = (re) => {
    const m = md.match(re);
    return m ? m[1].trim() : null;
  };

  const score = pick(/\*\*Score:\*\*\s*([\d.]+(?:\/5)?)/i);
  const legitimacy = pick(/\*\*Legitimacy:\*\*\s*(\S+)/i);
  const url = pick(/\*\*URL:\*\*\s*(<?([^>\s]+)>?|(\S+))/i);
  const jobUrl = url ? (url.replace(/^<|>$/g, '') || url) : null;

  let machine = null;
  const yamlBlock = md.match(/## Machine Summary\s*```ya?ml\s*([\s\S]*?)```/i);
  if (yamlBlock) {
    machine = parseSimpleYaml(yamlBlock[1]);
  }

  let recommendation = pick(/## Block [A-F].*?\n+([\s\S]*?)(?=\n## |\n---|\z)/i);
  if (!recommendation) {
    const rec = md.match(/(?:recommendation|verdict|decision)[:\s]*([^\n]+)/i);
    recommendation = rec ? rec[1].trim() : null;
  }
  if (recommendation && recommendation.length > 280) {
    recommendation = recommendation.slice(0, 277) + '…';
  }

  return {
    score,
    legitimacy,
    url: jobUrl,
    company: machine?.company || null,
    role: machine?.role || null,
    archetype: machine?.archetype || null,
    finalDecision: machine?.final_decision || machine?.finalDecision || null,
    nextAction: machine?.next_action || machine?.nextAction || null,
    topStrengths: machine?.top_strengths || machine?.topStrengths || null,
    recommendation,
    machine,
  };
}

function parseSimpleYaml(text) {
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([a-z_]+):\s*(.+)$/i);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return out;
}

export function reportSummaryToHtml(summary) {
  if (!summary) return '';
  const rows = [];
  if (summary.score) rows.push(['Score', summary.score]);
  if (summary.legitimacy) rows.push(['Legitimacy', summary.legitimacy]);
  if (summary.finalDecision) rows.push(['Decision', summary.finalDecision]);
  if (summary.nextAction) rows.push(['Next step', summary.nextAction]);
  if (summary.archetype) rows.push(['Archetype', summary.archetype]);
  if (summary.url) {
    rows.push(['Posting', `<a href="${summary.url}" target="_blank" rel="noopener">Open job</a>`]);
  }
  const body = rows
    .map(([k, v]) => `<div class="summary-row"><span class="summary-row__k">${k}</span><span class="summary-row__v">${v}</span></div>`)
    .join('');
  const rec = summary.recommendation
    ? `<p class="summary-rec">${summary.recommendation}</p>`
    : '';
  return `<div class="report-summary-card">${body}${rec}</div>`;
}
