#!/usr/bin/env node
/**
 * Generate tracker-additions TSVs from reports/*.md and update data/pipeline.md
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPORTS = join(ROOT, 'reports');
const TRACKER = join(__dirname, 'tracker-additions');
const PIPELINE = join(ROOT, 'data', 'pipeline.md');
const DATE = '2026-05-29';

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

function parseReport(file, content) {
  const num = file.slice(0, 3);
  const title = content.match(/^# Evaluation: (.+?) — (.+)$/m);
  const company = title?.[1]?.trim() || 'Unknown';
  const role = title?.[2]?.trim() || 'Unknown';
  const score = content.match(/\*\*Score:\*\*\s*([\d.]+)\/5/)?.[1] || '-';
  const url = content.match(/\*\*URL:\*\*\s*(.+)/)?.[1]?.trim() || '';
  const pdfLine = content.match(/\*\*PDF:\*\*\s*(.+)/)?.[1]?.trim() || '';
  const pdf =
    pdfLine.includes('.pdf') || pdfLine.includes('✅')
      ? '✅'
      : '❌';
  const note =
    content.match(/final_decision:\s*"([^"]+)"/)?.[1] ||
    content.match(/TL;DR[:\s]+(.+)/i)?.[1]?.slice(0, 80) ||
    '';
  const slug = slugify(`${company}-${role}`);
  const reportFile = file;
  const reportLink = `[${num}](reports/${reportFile})`;
  const tsv = [num, DATE, company, role, 'Evaluated', `${score}/5`, pdf, reportLink, note.slice(0, 120)].join(
    '\t'
  );
  return { num, company, role, score, url, pdf, slug, tsv, reportFile };
}

const files = readdirSync(REPORTS)
  .filter((f) => f.endsWith('.md'))
  .sort();
mkdirSync(TRACKER, { recursive: true });

const parsed = files.map((f) => parseReport(f, readFileSync(join(REPORTS, f), 'utf8')));

for (const p of parsed) {
  writeFileSync(join(TRACKER, `${p.num}-${p.slug}.tsv`), p.tsv + '\n');
}

// Build pipeline.md
const md = readFileSync(PIPELINE, 'utf8');
const headerEnd = md.indexOf('## Pendientes');
const header = headerEnd >= 0 ? md.slice(0, headerEnd) : md.split('## Procesados')[0];

const processedLines = parsed
  .sort((a, b) => a.num.localeCompare(b.num))
  .map(
    (p) =>
      `- [x] #${p.num} | ${p.url} | ${p.company} | ${p.role} | ${p.score}/5 | PDF ${p.pdf}`
  );

const newMd =
  header.trimEnd() +
  '\n\n## Pendientes\n\n_(vacío — procesado 2026-05-29)_\n\n## Procesados\n\n' +
  processedLines.join('\n') +
  '\n';

writeFileSync(PIPELINE, newMd);
console.log(`Wrote ${parsed.length} tracker TSVs and updated ${PIPELINE}`);
