/**
 * web/lib/snapshot.mjs — DB-backed snapshot for the web UI
 */

import { getApplications, getPipelinePending } from './db.mjs';
import { listReports, listOutputs } from './parsers.mjs';
import { computeMetrics, computeProgressMetrics } from './metrics.mjs';
import { applyDraftExists } from './apply-drafts.mjs';

function extractReportNum(reportPath) {
  if (!reportPath) return null;
  const m = String(reportPath).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/** Map DB row to frontend application contract */
export function toFrontendApp(row, root, outputsByPrefix) {
  const reportNumber = extractReportNum(row.report);
  const hasPdf = row.pdf === true || row.pdf === 1 || row.pdf === '1';
  let pdfFilename = null;
  if (reportNumber) {
    const n = String(reportNumber);
    pdfFilename =
      outputsByPrefix.get(n) ||
      outputsByPrefix.get(n.padStart(3, '0')) ||
      null;
  }

  const scoreRaw = row.score != null ? `${row.score}/5` : '';

  return {
    number: row.num,
    date: row.date,
    company: row.company,
    role: row.role,
    score: row.score ?? null,
    scoreRaw,
    status: row.status,
    hasPdf,
    reportNumber: reportNumber ? String(reportNumber) : '',
    reportPath: row.report || '',
    notes: row.notes || '',
    source: row.source || '',
    pdfFilename,
    hasApplyDraft: reportNumber ? applyDraftExists(root, reportNumber) : false,
  };
}

function buildOutputsPrefixMap(outputs) {
  const map = new Map();
  for (const o of outputs) {
    const m = o.filename.match(/^(\d+)-/);
    if (m) {
      map.set(m[1], o.filename);
      map.set(String(parseInt(m[1], 10)), o.filename);
    }
  }
  return map;
}

/** Parse pipeline notes "Company — Role" or legacy pipe format */
export function mapPipelineItem(row) {
  const notes = (row.notes || '').trim();
  let company = '—';
  let role = '—';
  if (notes.includes(' — ')) {
    const [c, ...rest] = notes.split(' — ');
    company = c.trim() || '—';
    role = rest.join(' — ').trim() || '—';
  } else if (notes.includes('|')) {
    const parts = notes.split('|').map((p) => p.trim());
    company = parts[1] || parts[0] || '—';
    role = parts[2] || '—';
  } else if (notes) {
    role = notes;
  }
  return {
    id: row.id,
    url: row.url,
    added: row.added,
    source: row.source || 'manual',
    notes,
    company,
    role,
    status: row.status,
  };
}

export function buildSnapshotFromDb(root) {
  const dbApps = getApplications();
  const outputs = listOutputs(root);
  const outputsByPrefix = buildOutputsPrefixMap(outputs);
  const applications = dbApps.map((row) => toFrontendApp(row, root, outputsByPrefix));

  const pipelinePending = getPipelinePending().map(mapPipelineItem);
  const metrics = computeMetrics(applications);
  const progress = computeProgressMetrics(applications);
  const evaluated = applications.filter((a) => /evaluated/i.test(a.status)).length;
  const applied = applications.filter((a) =>
    /applied|interview|offer|responded/i.test(a.status),
  ).length;
  const reports = listReports(root);

  return {
    applications,
    metrics: {
      ...metrics,
      pipelinePending: pipelinePending.length,
    },
    progress,
    pipelinePending,
    workflow: {
      inbox: pipelinePending.length,
      evaluated,
      applied,
      reports: reports.length,
      pdfs: outputs.length,
    },
    reports,
    outputs,
  };
}
