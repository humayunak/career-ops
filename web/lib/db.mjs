/**
 * web/lib/db.mjs — DB access layer for the web UI server
 * Replaces: web/lib/parsers.mjs (applications + pipeline parsing)
 *
 * Pattern: open → use → close per call (Hermes-style).
 * No persistent singleton — WAL files released cleanly on crash/stop.
 * Graceful degradation: DB errors return empty/null rather than 500.
 */

import { openDb } from '../../scripts/db.mjs';

function withDb(fn) {
  const db = openDb();
  try {
    return fn(db);
  } finally {
    db.close();
  }
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export function getApplications() {
  try {
    return withDb(db =>
      db.prepare(`SELECT * FROM applications ORDER BY num DESC`).all().map(normalizeApp)
    );
  } catch { return []; }
}

export function getApplication(num) {
  try {
    return withDb(db => {
      const row = db.prepare(`SELECT * FROM applications WHERE num = ?`).get(parseInt(num));
      return row ? normalizeApp(row) : null;
    });
  } catch { return null; }
}

export function updateApplication(num, fields) {
  const ALLOWED = new Set(['date','company','role','score','status','pdf','report','notes']);
  const sets = [];
  const vals = [];
  for (const [k, v] of Object.entries(fields)) {
    if (!ALLOWED.has(k)) continue;
    sets.push(`${k} = ?`);
    if (k === 'pdf') vals.push(v === true || v === '1' || v === 1 ? 1 : 0);
    else vals.push(v);
  }
  if (!sets.length) return { ok: false, error: 'No valid fields' };
  vals.push(parseInt(num));
  try {
    withDb(db => db.prepare(`UPDATE applications SET ${sets.join(', ')} WHERE num = ?`).run(...vals));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function getMetrics() {
  try {
    return withDb(db => {
      const total = db.prepare(`SELECT COUNT(*) as n FROM applications`).get().n;
      const byStatus = db.prepare(`SELECT status, COUNT(*) as n FROM applications GROUP BY status`).all();
      const scoreRows = db.prepare(`SELECT score FROM applications WHERE score IS NOT NULL`).all().map(r => r.score);
      const avgScore = scoreRows.length
        ? (scoreRows.reduce((a, b) => a + b, 0) / scoreRows.length).toFixed(2)
        : null;
      const topApply = db.prepare(
        `SELECT * FROM applications WHERE status='Evaluated' AND score IS NOT NULL ORDER BY score DESC LIMIT 5`
      ).all().map(normalizeApp);
      const pending = db.prepare(`SELECT COUNT(*) as n FROM pipeline WHERE status='pending'`).get().n;
      const statusMap = {};
      for (const r of byStatus) statusMap[r.status] = r.n;
      return { total, byStatus: statusMap, avgScore, topApply, pipelinePending: pending };
    });
  } catch {
    return { total: 0, byStatus: {}, avgScore: null, topApply: [], pipelinePending: 0 };
  }
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export function getPipelinePending() {
  try {
    return withDb(db =>
      db.prepare(`SELECT * FROM pipeline WHERE status='pending' ORDER BY added, id`).all()
    );
  } catch { return []; }
}

export function getPipelineAll() {
  try {
    return withDb(db =>
      db.prepare(`SELECT * FROM pipeline ORDER BY added DESC, id DESC`).all()
    );
  } catch { return []; }
}

export function addPipelineUrl({ url, source = 'manual', notes = '' }) {
  const added = new Date().toISOString().slice(0, 10);
  try {
    withDb(db =>
      db.prepare(`INSERT INTO pipeline (url, added, source, notes, status) VALUES (?, ?, ?, ?, 'pending')`)
        .run(url, added, source, notes)
    );
    return { ok: true };
  } catch (e) {
    if (e.message.includes('UNIQUE')) return { ok: false, error: 'URL already in pipeline' };
    return { ok: false, error: e.message };
  }
}

export function markPipelineDone(id, appNum) {
  try {
    withDb(db =>
      db.prepare(`UPDATE pipeline SET status='done', app_num=? WHERE id=?`)
        .run(appNum ? parseInt(appNum) : null, parseInt(id))
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function discardPipelineItem(id) {
  try {
    withDb(db =>
      db.prepare(`UPDATE pipeline SET status='discarded' WHERE id=?`).run(parseInt(id))
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
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
