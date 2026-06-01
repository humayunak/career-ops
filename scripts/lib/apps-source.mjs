/**
 * Load application tracker entries from applications.md or SQLite (fork fallback).
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { openDb } from '../db.mjs';

const CAREER_OPS = dirname(fileURLToPath(import.meta.url));

function appsMarkdownPath() {
  const data = join(CAREER_OPS, 'data', 'applications.md');
  if (existsSync(data)) return data;
  return join(CAREER_OPS, 'applications.md');
}

function parseFromMarkdown(filePath) {
  if (!existsSync(filePath)) return [];
  const content = readFileSync(filePath, 'utf-8');
  const entries = [];
  for (const line of content.split('\n')) {
    if (!line.startsWith('|')) continue;
    const parts = line.split('|').map((s) => s.trim());
    if (parts.length < 9) continue;
    const num = parseInt(parts[1], 10);
    if (Number.isNaN(num)) continue;
    entries.push({
      num,
      date: parts[2],
      company: parts[3],
      role: parts[4],
      score: parts[5],
      status: parts[6],
      pdf: parts[7],
      report: parts[8],
      notes: parts[9] || '',
    });
  }
  return entries;
}

function parseFromDb() {
  let db;
  try {
    db = openDb();
    return db
      .prepare(`SELECT * FROM applications ORDER BY num`)
      .all()
      .map((row) => ({
        num: row.num,
        date: row.date,
        company: row.company,
        role: row.role,
        score: row.score != null ? `${row.score}/5` : '',
        status: row.status,
        pdf: row.pdf ? '✅' : '❌',
        report: row.report || '',
        notes: row.notes || '',
      }));
  } catch {
    return [];
  } finally {
    db?.close();
  }
}

/** @returns {Array<{num, date, company, role, score, status, pdf, report, notes}>} */
export function loadTrackerEntries() {
  const md = parseFromMarkdown(appsMarkdownPath());
  if (md.length) return md;
  return parseFromDb();
}

export function resolveReportPath(reportField) {
  if (!reportField) return null;
  const linkMatch = reportField.match(/\]\(([^)]+)\)/);
  if (linkMatch) return join(CAREER_OPS, linkMatch[1]);
  if (reportField.startsWith('reports/')) return join(CAREER_OPS, reportField);
  return join(CAREER_OPS, reportField);
}

export { CAREER_OPS };
