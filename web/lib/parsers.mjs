import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, basename } from 'path';
import { computeMetrics, computeProgressMetrics } from './metrics.mjs';
import { applyDraftExists } from './apply-drafts.mjs';

const RE_SCORE = /(\d+\.?\d*)\/5/;
const RE_REPORT_LINK = /\[(\d+)\]\(([^)]+)\)/;
const RE_CMD_LINE = /^\s*\/career-ops\s+(.+?)\s+→\s*(.+)$/;

const SCRIPT_COMMANDS = new Set(['scan', 'patterns', 'followup', 'update']);

/** Parse discovery block from career-ops SKILL.md */
export function parseCommandsFromSkill(root) {
  const candidates = [
    join(root, '.cursor', 'skills', 'career-ops', 'SKILL.md'),
    join(root, '.claude', 'skills', 'career-ops', 'SKILL.md'),
  ];
  let content = '';
  for (const p of candidates) {
    if (existsSync(p)) {
      content = readFileSync(p, 'utf8');
      break;
    }
  }
  if (!content) return getFallbackCommands();

  const lines = content.split('\n');
  const commands = [];
  let inDiscovery = false;

  for (const line of lines) {
    if (line.includes('Available commands:')) {
      inDiscovery = true;
      continue;
    }
    if (inDiscovery && line.startsWith('```')) {
      if (commands.length) break;
      continue;
    }
    if (!inDiscovery) continue;

    const m = line.match(RE_CMD_LINE);
    if (!m) continue;

    const arg = m[1].trim();
    const desc = m[2].trim();
    const isJd = arg === '{JD}';
    const mode = isJd ? 'auto-pipeline' : arg.split(/\s/)[0];
    const prompt = isJd ? '/career-ops ' : `/career-ops ${arg}`;
    const kind = SCRIPT_COMMANDS.has(mode) ? 'script' : 'agent';

    commands.push({
      mode,
      command: prompt.trim(),
      description: desc,
      kind,
      npmScript: kind === 'script' ? npmScriptFor(mode) : null,
      starterPrompt: starterFor(mode, isJd),
    });
  }

  return commands.length ? commands : getFallbackCommands();
}

function npmScriptFor(mode) {
  const map = {
    scan: 'npm run scan',
    patterns: 'npm run patterns',
    update: 'npm run update:check',
  };
  return map[mode] || null;
}

function starterFor(mode, isJd) {
  if (isJd) {
    return '/career-ops\n\nPaste job URL or JD text here.';
  }
  const starters = {
    pipeline: '/career-ops pipeline\n\nProcess pending URLs in data/pipeline.md.',
    tracker: '/career-ops tracker\n\nShow application status overview.',
    scan: '/career-ops scan\n\nScan portals.yml for new matching roles.',
    apply: '/career-ops apply\n\nAssist with the application form (review before submit).',
  };
  return starters[mode] || `/career-ops ${mode}`;
}

function getFallbackCommands() {
  return [
    {
      mode: 'auto-pipeline',
      command: '/career-ops',
      description: 'Evaluate JD + report + PDF + tracker',
      kind: 'agent',
      npmScript: null,
      starterPrompt: '/career-ops\n\nPaste job URL or JD.',
    },
    {
      mode: 'pipeline',
      command: '/career-ops pipeline',
      description: 'Process pending URLs from inbox',
      kind: 'agent',
      npmScript: null,
      starterPrompt: '/career-ops pipeline',
    },
  ];
}

export function parseApplications(filePath) {
  if (!existsSync(filePath)) return [];
  const lines = readFileSync(filePath, 'utf8').split('\n');
  const apps = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith('|') || line.includes('|---') || line.includes('| #')) continue;

    let fields;
    if (line.includes('\t')) {
      const inner = line.replace(/^\|/, '').trim();
      fields = inner.split('\t').map((p) => p.trim().replace(/^\||\|$/g, ''));
    } else {
      fields = line
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((p) => p.trim());
    }
    if (fields.length < 8) continue;

    const scoreRaw = fields[4];
    let score = null;
    const sm = scoreRaw.match(RE_SCORE);
    if (sm) score = parseFloat(sm[1]);

    let reportNumber = '';
    let reportPath = '';
    const rm = fields[7].match(RE_REPORT_LINK);
    if (rm) {
      reportNumber = rm[1];
      reportPath = rm[2];
    }

    apps.push({
      number: parseInt(fields[0], 10) || apps.length + 1,
      date: fields[1],
      company: fields[2],
      role: fields[3],
      score,
      scoreRaw,
      status: fields[5],
      hasPdf: fields[6].includes('✅'),
      reportNumber,
      reportPath,
      notes: fields[8] || '',
    });
  }
  return apps;
}

export function parsePipelinePending(filePath) {
  if (!existsSync(filePath)) return [];
  const items = [];
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const m = line.match(/^- \[ \]\s+(.+)$/);
    if (!m) continue;
    const rest = m[1].trim();
    const parts = rest.split('|').map((p) => p.trim());
    items.push({
      raw: rest,
      url: parts[0] || rest,
      company: parts[1] || '',
      role: parts[2] || '',
    });
  }
  return items;
}

export function listReports(root) {
  const dir = join(root, 'reports');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const full = join(dir, f);
      const idMatch = f.match(/^(\d+)-/);
      return {
        id: idMatch ? idMatch[1] : f,
        filename: f,
        path: `reports/${f}`,
        mtime: statSync(full).mtime.toISOString(),
      };
    })
    .sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
}

export function listOutputs(root) {
  const dir = join(root, 'output');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.pdf'))
    .map((f) => ({
      filename: f,
      path: `output/${f}`,
      mtime: statSync(join(dir, f)).mtime.toISOString(),
    }))
    .sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
}

function attachPdfFilenames(root, apps, outputs) {
  const byReportPrefix = new Map();
  for (const o of outputs) {
    const m = o.filename.match(/^(\d+)-/);
    if (m) {
      const n = m[1];
      byReportPrefix.set(n, o.filename);
      byReportPrefix.set(String(parseInt(n, 10)), o.filename);
    }
  }
  return apps.map((a) => {
    let pdfFilename = null;
    let hasApplyDraft = false;
    if (a.reportNumber) {
      const n = String(a.reportNumber);
      pdfFilename =
        byReportPrefix.get(n) ||
        byReportPrefix.get(n.padStart(3, '0')) ||
        outputs.find((o) => o.filename.includes(`-${n}-`))?.filename ||
        null;
      hasApplyDraft = applyDraftExists(root, a.reportNumber);
    }
    return { ...a, pdfFilename, hasApplyDraft };
  });
}

export function buildSnapshot(root, appsPath) {
  const apps = parseApplications(appsPath);
  const pipelinePath = join(root, 'data', 'pipeline.md');
  const pending = parsePipelinePending(pipelinePath);
  const outputs = listOutputs(root);
  const appsWithPdf = attachPdfFilenames(root, apps, outputs);
  const metrics = computeMetrics(apps);
  const progress = computeProgressMetrics(apps);
  const evaluated = apps.filter((a) => /evaluated/i.test(a.status)).length;
  const applied = apps.filter((a) => /applied|interview|offer|responded/i.test(a.status)).length;

  return {
    applications: appsWithPdf,
    metrics: {
      ...metrics,
      pipelinePending: pending.length,
    },
    progress,
    pipelinePending: pending,
    workflow: {
      inbox: pending.length,
      evaluated,
      applied,
      reports: listReports(root).length,
      pdfs: outputs.length,
    },
    reports: listReports(root),
    outputs,
  };
}

export function findReportFile(root, id) {
  const dir = join(root, 'reports');
  if (!existsSync(dir)) return null;
  const pad = String(id).padStart(3, '0');
  const match = readdirSync(dir).find(
    (f) => f.startsWith(`${pad}-`) || f.startsWith(`${id}-`),
  );
  if (!match) return null;
  return { path: join(dir, match), rel: `reports/${match}`, name: match };
}

export function simpleMarkdownHtml(md) {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(/\n\n/g, '</p><p>');
  return `<div class="md-body"><p>${html}</p></div>`;
}
