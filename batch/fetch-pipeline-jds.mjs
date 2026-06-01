#!/usr/bin/env node
/**
 * Fetch JD text for pipeline URLs via Greenhouse boards-api.
 * Writes batch/jds/{id}.txt (plain) and batch/jds/{id}.meta.json
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PIPELINE = join(ROOT, 'data', 'pipeline.md');
const JDS_DIR = join(__dirname, 'jds');

function stripHtml(html) {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePipelineLine(line) {
  const m = line.match(/^- \[[ !x]\] (https?:\/\/\S+)(?:\s*\|\s*([^|]+?)\s*\|\s*(.+))?$/);
  if (!m) return null;
  return { url: m[1].trim(), company: (m[2] || '').trim(), role: (m[3] || '').trim() };
}

function greenhouseJobApi(url) {
  const u = new URL(url.replace(/^http:/, 'https:'));
  const ghJid = u.searchParams.get('gh_jid');
  if (u.hostname === 'coreweave.com') {
    const board = u.searchParams.get('board') || 'coreweave';
    const id = ghJid || u.searchParams.get('4683502006');
    if (id) return `https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${id}`;
  }
  if (u.hostname.includes('stability.ai')) {
    const id = ghJid;
    if (id) return `https://boards-api.greenhouse.io/v1/boards/stabilityai/jobs/${id}`;
  }
  const pathMatch = u.pathname.match(/\/([^/]+)\/jobs\/(\d+)/);
  if (pathMatch) {
    return `https://boards-api.greenhouse.io/v1/boards/${pathMatch[1]}/jobs/${pathMatch[2]}`;
  }
  return null;
}

async function fetchJob(apiUrl) {
  const res = await fetch(apiUrl, { redirect: 'error' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function buildJdText(job, fallbackCompany, fallbackRole) {
  const lines = [
    `Title: ${job.title || fallbackRole}`,
    `Company: ${job.company_name || fallbackCompany}`,
    `Location: ${job.location?.name || 'N/A'}`,
    `URL: ${job.absolute_url || ''}`,
    `Updated: ${job.updated_at || 'N/A'}`,
    `First published: ${job.first_published || 'N/A'}`,
    '',
    stripHtml(job.content || ''),
  ];
  return lines.join('\n');
}

async function main() {
  const md = readFileSync(PIPELINE, 'utf8');
  const pending = md
    .split('\n')
    .filter((l) => l.startsWith('- [ ]'))
    .map(parsePipelineLine)
    .filter(Boolean);

  mkdirSync(JDS_DIR, { recursive: true });

  const rows = [['id', 'url', 'source', 'notes'].join('\t')];
  const results = [];

  for (let i = 0; i < pending.length; i++) {
    const id = String(i + 1);
    const { url, company, role } = pending[i];
    const apiUrl = greenhouseJobApi(url);
    const notes = [company, role].filter(Boolean).join(' — ');
    rows.push([id, url, 'pipeline', notes].join('\t'));

    const txtPath = join(JDS_DIR, `${id}.txt`);
    const metaPath = join(JDS_DIR, `${id}.meta.json`);

    if (existsSync(txtPath) && existsSync(metaPath)) {
      results.push({ id, url, status: 'cached' });
      continue;
    }

    if (!apiUrl) {
      writeFileSync(txtPath, `URL: ${url}\nCompany: ${company}\nRole: ${role}\n\n(JD fetch failed — non-Greenhouse URL; verify manually)\n`);
      writeFileSync(metaPath, JSON.stringify({ url, company, role, error: 'no-api-url' }, null, 2));
      results.push({ id, url, status: 'no-api' });
      continue;
    }

    try {
      const job = await fetchJob(apiUrl);
      const text = buildJdText(job, company, role);
      writeFileSync(txtPath, text);
      writeFileSync(
        metaPath,
        JSON.stringify(
          {
            url: job.absolute_url || url,
            title: job.title,
            company_name: job.company_name || company,
            location: job.location?.name,
            updated_at: job.updated_at,
            first_published: job.first_published,
            apiUrl,
          },
          null,
          2
        )
      );
      results.push({ id, url, status: 'ok', title: job.title });
      process.stdout.write(`✓ ${id}/${pending.length} ${job.title?.slice(0, 50)}\n`);
    } catch (e) {
      writeFileSync(txtPath, `URL: ${url}\n\nFetch error: ${e.message}\n`);
      writeFileSync(metaPath, JSON.stringify({ url, error: String(e.message) }, null, 2));
      results.push({ id, url, status: 'error', error: e.message });
      process.stdout.write(`✗ ${id} ${e.message}\n`);
    }
  }

  writeFileSync(join(__dirname, 'batch-input.tsv'), rows.join('\n') + '\n');
  writeFileSync(join(__dirname, 'pipeline-fetch-summary.json'), JSON.stringify(results, null, 2));
  console.log(`\nWrote ${pending.length} entries to batch/batch-input.tsv and batch/jds/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
