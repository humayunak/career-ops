/** User-facing clipboard prompts (minimal technical paths) */

const CANONICAL_STATUSES = [
  'Evaluated',
  'Applied',
  'Responded',
  'Interview',
  'Offer',
  'Rejected',
  'Discarded',
  'SKIP',
];

function evaluatePrompt(url, company, role) {
  const lines = ['/career-ops', ''];
  if (url) lines.push(`Job URL: ${url}`);
  if (company) lines.push(`Company: ${company}`);
  if (role) lines.push(`Role: ${role}`);
  lines.push('', 'Evaluate this role: score, report, and tailored resume PDF.');
  return lines.join('\n');
}

function pipelinePrompt() {
  return `/career-ops pipeline

Process all pending jobs in my inbox.`;
}

function applyPrompt(app) {
  const num = app.reportNumber ? String(app.reportNumber).padStart(3, '0') : '???';
  return `/career-ops apply

Company: ${app.company}
Role: ${app.role}
Report: #${app.reportNumber || num}

Open the job application form in your browser, then help me fill it out.
Save the Q&A answers so I can review them in the web UI afterward.`;
}

function comparePrompt(apps) {
  const list = apps
    .map(
      (a) =>
        `- #${a.reportNumber || a.number} ${a.company} — ${a.role} (${a.score ? `${a.score}/5` : 'no score'})`,
    )
    .join('\n');
  return `/career-ops ofertas

Compare and rank these offers:

${list}`;
}

function followupPrompt(entry) {
  return `/career-ops followup

Company: ${entry.company}
Role: ${entry.role}
Status: ${entry.status}

Draft a follow-up message for this application.`;
}

function statusSelectOptions(currentStatus) {
  const cur = (currentStatus || '').trim();
  return CANONICAL_STATUSES.map((s) => {
    const sel = s.toLowerCase() === cur.toLowerCase() ? ' selected' : '';
    return `<option value="${s}"${sel}>${s}</option>`;
  }).join('');
}
