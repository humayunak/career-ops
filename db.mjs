#!/usr/bin/env node
/**
 * db.mjs — SQLite data layer for career-ops (Humayun's fork)
 *
 * Replaces: merge-tracker.mjs, dedup-tracker.mjs, normalize-statuses.mjs,
 *           verify-pipeline.mjs (basic checks), TSV batch flow
 *
 * Tables:
 *   applications  — evaluated/applied job tracker (#num as PK)
 *   pipeline      — inbox of pending URLs
 *
 * CLI:
 *   node db.mjs migrate          — one-time: import applications.md + pipeline.md → DB
 *   node db.mjs get <num>        — fetch single application by #num (JSON)
 *   node db.mjs update <num> <field>=<value> [field=value ...]
 *   node db.mjs query [--json] [status=X] [score>=N] [company=X]
 *   node db.mjs add-pipeline <url> [company] [notes]
 *   node db.mjs pipeline-pending — list pending pipeline items (JSON)
 *   node db.mjs pipeline-done <id> <app_num>
 *   node db.mjs stats            — summary counts
 *   node db.mjs verify           — check DB integrity
 *   node db.mjs import-tsv <file> — import a batch tracker-additions TSV
 */

import Database from 'better-sqlite3';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(ROOT, 'data', 'career-ops.db');

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export function openDb() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      num        INTEGER PRIMARY KEY,
      date       TEXT NOT NULL,
      company    TEXT NOT NULL,
      role       TEXT NOT NULL,
      score      REAL,
      status     TEXT NOT NULL DEFAULT 'Evaluated'
                   CHECK(status IN ('Evaluated','Applied','Responded','Interview','Offer','Rejected','Discarded','SKIP')),
      pdf        INTEGER NOT NULL DEFAULT 0,  -- 0=no 1=yes
      report     TEXT,                        -- relative path e.g. reports/073-company-2026-05-29.md
      notes      TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS pipeline (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      url        TEXT NOT NULL UNIQUE,
      added      TEXT NOT NULL,
      source     TEXT DEFAULT 'manual',       -- portal | manual | linkedin
      notes      TEXT DEFAULT '',
      status     TEXT NOT NULL DEFAULT 'pending'
                   CHECK(status IN ('pending','processing','done','discarded')),
      app_num    INTEGER REFERENCES applications(num)
    );
  `);

  return db;
}

// ---------------------------------------------------------------------------
// Canonical states
// ---------------------------------------------------------------------------

const STATUS_ALIASES = {
  evaluada: 'Evaluated', condicional: 'Evaluated', hold: 'Evaluated',
  evaluar: 'Evaluated', verificar: 'Evaluated',
  aplicado: 'Applied', enviada: 'Applied', aplicada: 'Applied',
  sent: 'Applied', applied: 'Applied',
  respondido: 'Responded',
  entrevista: 'Interview',
  oferta: 'Offer',
  rechazado: 'Rejected', rechazada: 'Rejected',
  descartado: 'Discarded', descartada: 'Discarded',
  cerrada: 'Discarded', cancelada: 'Discarded',
  'no aplicar': 'SKIP', skip: 'SKIP', monitor: 'SKIP',
};

const VALID_STATUSES = new Set([
  'Evaluated','Applied','Responded','Interview','Offer','Rejected','Discarded','SKIP'
]);

function normalizeStatus(raw) {
  if (!raw) return 'Evaluated';
  const clean = raw.replace(/\*\*/g, '').trim();
  if (VALID_STATUSES.has(clean)) return clean;
  const lower = clean.toLowerCase();
  return STATUS_ALIASES[lower] || 'Evaluated';
}

function parseScore(raw) {
  if (!raw) return null;
  const m = String(raw).match(/(\d+\.?\d*)/);
  return m ? parseFloat(m[1]) : null;
}

// ---------------------------------------------------------------------------
// Migration: applications.md → DB
// ---------------------------------------------------------------------------

function migrateApplications(db) {
  const paths = [
    join(ROOT, 'data', 'applications.md'),
    join(ROOT, 'applications.md'),
  ];
  const file = paths.find(p => existsSync(p));
  if (!file) { console.log('No applications.md found — skipping'); return 0; }

  const lines = readFileSync(file, 'utf-8').split('\n')
    .filter(l => l.startsWith('|') && !l.match(/^\|\s*[#-]/));

  const insert = db.prepare(`
    INSERT OR REPLACE INTO applications (num, date, company, role, score, status, pdf, report, notes)
    VALUES (@num, @date, @company, @role, @score, @status, @pdf, @report, @notes)
  `);

  const insertMany = db.transaction(rows => {
    for (const r of rows) insert.run(r);
  });

  const rows = [];
  for (const line of lines) {
    const cols = line.split('|').map(s => s.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
    if (cols.length < 7) continue;

    // Column order in applications.md: # | Date | Company | Role | Score | Status | PDF | Report | Notes
    const [numRaw, date, company, role, scoreRaw, statusRaw, pdfRaw, reportRaw, ...notesParts] = cols;
    const num = parseInt(numRaw);
    if (isNaN(num)) continue;

    // report: extract path from markdown link [073](reports/...)
    const reportMatch = (reportRaw || '').match(/\(([^)]+)\)/);
    const report = reportMatch ? reportMatch[1] : (reportRaw || '');

    rows.push({
      num,
      date: date || '',
      company: company || '',
      role: role || '',
      score: parseScore(scoreRaw),
      status: normalizeStatus(statusRaw),
      pdf: pdfRaw && pdfRaw.includes('✅') ? 1 : 0,
      report: report || '',
      notes: notesParts.join(' | ').trim(),
    });
  }

  insertMany(rows);
  return rows.length;
}

// ---------------------------------------------------------------------------
// Migration: pipeline.md → DB
// ---------------------------------------------------------------------------

function migratePipeline(db) {
  const file = join(ROOT, 'data', 'pipeline.md');
  if (!existsSync(file)) { console.log('No pipeline.md found — skipping'); return 0; }

  const lines = readFileSync(file, 'utf-8').split('\n');
  const insert = db.prepare(`
    INSERT OR IGNORE INTO pipeline (url, added, source, notes, status)
    VALUES (@url, @added, @source, @notes, @status)
  `);

  const insertMany = db.transaction(rows => {
    for (const r of rows) insert.run(r);
  });

  const rows = [];
  for (const line of lines) {
    // Table row: | url | added | source | notes |
    if (!line.startsWith('|') || line.match(/^\|\s*URL\s*\|/) || line.startsWith('|---')) continue;
    const cols = line.split('|').map(s => s.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
    if (cols.length < 2) continue;
    const [url, added, source, notes] = cols;
    if (!url || !url.startsWith('http')) continue;
    rows.push({ url, added: added || new Date().toISOString().slice(0,10), source: source || 'manual', notes: notes || '', status: 'pending' });
  }

  // Also parse processed lines: - [x] #001 | url | ...
  for (const line of lines) {
    const m = line.match(/^\s*-\s*\[x\]\s*#\d+\s*\|\s*(https?:\/\/\S+)/);
    if (!m) continue;
    const url = m[1];
    rows.push({ url, added: '', source: 'portal', notes: '', status: 'done' });
  }

  insertMany(rows);
  return rows.length;
}

// ---------------------------------------------------------------------------
// CLI commands
// ---------------------------------------------------------------------------

function cmdGet(db, num) {
  const row = db.prepare('SELECT * FROM applications WHERE num = ?').get(parseInt(num));
  if (!row) { console.error(`No application #${num}`); process.exit(1); }
  row.pdf = row.pdf ? '✅' : '❌';
  console.log(JSON.stringify(row, null, 2));
}

function cmdUpdate(db, num, pairs) {
  const ALLOWED = new Set(['date','company','role','score','status','pdf','report','notes']);
  const sets = [];
  const vals = [];

  for (const pair of pairs) {
    const eq = pair.indexOf('=');
    if (eq === -1) { console.error(`Bad pair: ${pair}`); process.exit(1); }
    const field = pair.slice(0, eq).trim().toLowerCase();
    let val = pair.slice(eq + 1).trim();
    if (!ALLOWED.has(field)) { console.error(`Unknown field: ${field}`); process.exit(1); }
    if (field === 'status') val = normalizeStatus(val);
    if (field === 'score') val = parseScore(val);
    if (field === 'pdf') val = val === '✅' || val === '1' || val.toLowerCase() === 'true' ? 1 : 0;
    sets.push(`${field} = ?`);
    vals.push(val);
  }

  if (!sets.length) { console.error('No fields to update'); process.exit(1); }
  vals.push(parseInt(num));
  db.prepare(`UPDATE applications SET ${sets.join(', ')} WHERE num = ?`).run(...vals);
  console.log(JSON.stringify({ ok: true, num: parseInt(num), updated: pairs }));
}

function cmdQuery(db, args) {
  const json = args.includes('--json');
  const conditions = [];
  const vals = [];

  for (const arg of args.filter(a => !a.startsWith('--'))) {
    const m = arg.match(/^(\w+)(>=|<=|!=|=|>|<)(.+)$/);
    if (!m) continue;
    const [, field, op, val] = m;
    if (field === 'score') { conditions.push(`score ${op} ?`); vals.push(parseFloat(val)); }
    else if (field === 'status') { conditions.push(`status = ?`); vals.push(normalizeStatus(val)); }
    else { conditions.push(`${field} LIKE ?`); vals.push(`%${val}%`); }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM applications ${where} ORDER BY num DESC`).all(...vals);

  if (json) { console.log(JSON.stringify(rows)); return; }

  console.log(`\n${'─'.repeat(80)}`);
  console.log(`  #   Date        Company                    Role                           Score  Status`);
  console.log(`${'─'.repeat(80)}`);
  for (const r of rows) {
    const score = r.score ? `${r.score}/5` : ' — ';
    console.log(
      `  ${String(r.num).padEnd(4)} ${r.date}  ${r.company.slice(0,25).padEnd(26)} ${r.role.slice(0,30).padEnd(31)} ${score.padEnd(7)} ${r.status}`
    );
  }
  console.log(`${'─'.repeat(80)}`);
  console.log(`  ${rows.length} result(s)\n`);
}

function cmdStats(db) {
  const total = db.prepare('SELECT COUNT(*) as n FROM applications').get().n;
  const byStatus = db.prepare(`SELECT status, COUNT(*) as n FROM applications GROUP BY status ORDER BY n DESC`).all();
  const topScore = db.prepare(`SELECT * FROM applications WHERE score IS NOT NULL ORDER BY score DESC LIMIT 5`).all();
  const pending = db.prepare(`SELECT COUNT(*) as n FROM pipeline WHERE status='pending'`).get().n;

  console.log('\n📊 Career-Ops Stats\n');
  console.log(`  Applications: ${total}   Pipeline inbox: ${pending}`);
  console.log(`\n  By status:`);
  for (const r of byStatus) console.log(`    ${r.status.padEnd(12)} ${r.n}`);
  console.log(`\n  Top scored (not yet applied):`);
  for (const r of topScore.filter(r => r.status === 'Evaluated').slice(0,5))
    console.log(`    #${r.num} ${r.company} — ${r.role} (${r.score}/5)`);
  console.log('');
}

function cmdVerify(db) {
  const errors = [];
  const dupes = db.prepare(`SELECT num, COUNT(*) as c FROM applications GROUP BY num HAVING c > 1`).all();
  if (dupes.length) errors.push(`Duplicate nums: ${dupes.map(d => d.num).join(', ')}`);

  const badStatus = db.prepare(`SELECT num, status FROM applications WHERE status NOT IN ('Evaluated','Applied','Responded','Interview','Offer','Rejected','Discarded','SKIP')`).all();
  if (badStatus.length) errors.push(`Bad statuses: ${badStatus.map(r => `#${r.num}:${r.status}`).join(', ')}`);

  if (errors.length) {
    console.error('❌ Verify failed:\n' + errors.map(e => '  ' + e).join('\n'));
    process.exit(1);
  }
  const count = db.prepare('SELECT COUNT(*) as n FROM applications').get().n;
  console.log(`✅ DB clean — ${count} applications, no issues`);
}

function cmdPipelinePending(db) {
  const rows = db.prepare(`SELECT * FROM pipeline WHERE status='pending' ORDER BY added, id`).all();
  console.log(JSON.stringify(rows, null, 2));
}

function cmdAddPipeline(db, url, source, notes) {
  db.prepare(`INSERT OR IGNORE INTO pipeline (url, added, source, notes, status) VALUES (?, ?, ?, ?, 'pending')`)
    .run(url, new Date().toISOString().slice(0,10), source || 'manual', notes || '');
  console.log(JSON.stringify({ ok: true, url }));
}

function cmdPipelineDone(db, id, appNum) {
  db.prepare(`UPDATE pipeline SET status='done', app_num=? WHERE id=?`).run(parseInt(appNum) || null, parseInt(id));
  console.log(JSON.stringify({ ok: true, id: parseInt(id) }));
}

function cmdImportTsv(db, file) {
  if (!existsSync(file)) { console.error(`File not found: ${file}`); process.exit(1); }
  const lines = readFileSync(file, 'utf-8').split('\n').filter(Boolean);
  const insert = db.prepare(`
    INSERT OR REPLACE INTO applications (num, date, company, role, score, status, pdf, report, notes)
    VALUES (@num, @date, @company, @role, @score, @status, @pdf, @report, @notes)
  `);
  const insertMany = db.transaction(rows => { for (const r of rows) insert.run(r); });
  const rows = [];
  for (const line of lines) {
    const cols = line.includes('\t') ? line.split('\t') : line.split('|').map(s=>s.trim()).filter(Boolean);
    if (cols.length < 7) continue;
    const [numRaw, date, company, role, statusRaw, scoreRaw, pdfRaw, reportRaw, ...notesParts] = cols;
    const num = parseInt(numRaw);
    if (isNaN(num)) continue;
    const reportMatch = (reportRaw||'').match(/\(([^)]+)\)/);
    rows.push({
      num, date, company, role,
      score: parseScore(scoreRaw),
      status: normalizeStatus(statusRaw),
      pdf: pdfRaw && pdfRaw.includes('✅') ? 1 : 0,
      report: reportMatch ? reportMatch[1] : (reportRaw||''),
      notes: notesParts.join('\t').trim(),
    });
  }
  insertMany(rows);
  console.log(`Imported ${rows.length} rows from ${file}`);
}

function cmdMigrate(db) {
  console.log('Migrating applications.md...');
  const a = migrateApplications(db);
  console.log(`  → ${a} applications imported`);
  console.log('Migrating pipeline.md...');
  const p = migratePipeline(db);
  console.log(`  → ${p} pipeline entries imported`);
  console.log('✅ Migration complete');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const [,, cmd, ...rest] = process.argv;

const db = openDb();

switch (cmd) {
  case 'migrate':       cmdMigrate(db); break;
  case 'get':           cmdGet(db, rest[0]); break;
  case 'update':        cmdUpdate(db, rest[0], rest.slice(1)); break;
  case 'query':         cmdQuery(db, rest); break;
  case 'stats':         cmdStats(db); break;
  case 'verify':        cmdVerify(db); break;
  case 'pipeline-pending': cmdPipelinePending(db); break;
  case 'add-pipeline':  cmdAddPipeline(db, rest[0], rest[1], rest[2]); break;
  case 'pipeline-done': cmdPipelineDone(db, rest[0], rest[1]); break;
  case 'import-tsv':    cmdImportTsv(db, rest[0]); break;
  default:
    console.log(`career-ops db.mjs

Commands:
  migrate                         Import applications.md + pipeline.md → DB (run once)
  get <num>                       Fetch single application (JSON)
  update <num> field=val ...      Update application fields
  query [--json] [field=val ...]  Query applications (status=Applied, score>=4.0, company=Glean)
  stats                           Summary counts
  verify                          Check DB integrity
  pipeline-pending                List pending pipeline URLs (JSON)
  add-pipeline <url> [src] [note] Add URL to pipeline inbox
  pipeline-done <id> <app_num>    Mark pipeline item processed
  import-tsv <file>               Import a batch tracker-additions TSV
`);
}

db.close();
