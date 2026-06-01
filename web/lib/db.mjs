/**
 * web/lib/db.mjs — DB access layer for the web UI server
 * Replaces: web/lib/parsers.mjs (applications + pipeline parsing)
 */

import { openDb } from '../../db.mjs';

let _db = null;
function db() {
  if (!_db) _db = openDb();
  return _db;
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export function getApplications() {
  return db().prepare(`SELECT * FROM applications ORDER BY num DESC`).all()
    .map(normalizeApp);
}

export function getApplication(num) {
  const row = db().prepare(`SELECT * FROM applications WHERE num = ?`).get(parseInt(num));
  return row ? normalizeApp(row) : null;
}

export function updateApplication(num, fields) {
  const ALLOWED = new Set(['date','company','role','score','status','pdf','report','notes']);
  const sets = [];
  const vals = [];
  for (const [k, v] of Object.entries(fields)) {
    if (!ALLOWED.has(k)) continue;
    sets.push(`${k} = ?`);
    vals.push(v);
  }
  if (!sets.length) return { ok: false, error: 'No valid fields' };
  vals.push(parseInt(num));
  db().prepare(`UPDATE applications SET ${sets.join(', ')} WHERE num = ?`).run(...vals);
  return { ok: true };
}

export function getMetrics() {
  const d = db();
  const total = d.prepare(`SELECT COUNT(*) as n FROM applications`).get().n;
  const byStatus = d.prepare(`SELECT status, COUNT(*) as n FROM applications GROUP BY status`).all();
  const scoreRows = d.prepare(`SELECT score FROM applications WHERE score IS NOT NULL`).all().map(r => r.score);
  const avgScore = scoreRows.length ? (scoreRows.reduce((a,b) => a+b, 0) / scoreRows.length).toFixed(2) : null;
  const topApply = d.prepare(`SELECT * FROM applications WHERE status='Evaluated' AND score IS NOT NULL ORDER BY score DESC LIMIT 5`).all().map(normalizeApp);
  const pending = d.prepare(`SELECT COUNT(*) as n FROM pipeline WHERE status='pending'`).get().n;

  const statusMap = {};
  for (const r of byStatus) statusMap[r.status] = r.n;

  return { total, byStatus: statusMap, avgScore, topApply, pipelinePending: pending };
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export function getPipelinePending() {
  return db().prepare(`SELECT * FROM pipeline WHERE status='pending' ORDER BY added, id`).all();
}

export function getPipelineAll() {
  return db().prepare(`SELECT * FROM pipeline ORDER BY added DESC, id DESC`).all();
}

export function addPipelineUrl({ url, source = 'manual', notes = '' }) {
  const added = new Date().toISOString().slice(0, 10);
  try {
    db().prepare(`INSERT INTO pipeline (url, added, source, notes, status) VALUES (?, ?, ?, ?, 'pending')`)
      .run(url, added, source, notes);
    return { ok: true };
  } catch (e) {
    if (e.message.includes('UNIQUE')) return { ok: false, error: 'URL already in pipeline' };
    throw e;
  }
}

export function markPipelineDone(id, appNum) {
  db().prepare(`UPDATE pipeline SET status='done', app_num=? WHERE id=?`)
    .run(appNum ? parseInt(appNum) : null, parseInt(id));
  return { ok: true };
}

export function discardPipelineItem(id) {
  db().prepare(`UPDATE pipeline SET status='discarded' WHERE id=?`).run(parseInt(id));
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeApp(row) {
  return {
    ...row,
    pdf: row.pdf === 1 || row.pdf === '1',
    score: row.score ?? null,
    reportNum: row.report ? extractReportNum(row.report) : null,
  };
}

function extractReportNum(reportPath) {
  const m = reportPath.match(/(\d+)/);
  return m ? parseInt(m[1]) : null;
}
