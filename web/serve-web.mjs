#!/usr/bin/env node
/**
 * Career-Ops Web UI — local server (127.0.0.1).
 */

import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

import {
  resolveCareerOpsRoot,
  resolveAllowedFile,
  resolveWritableFile,
  applicationsPath,
} from './lib/paths.mjs';
import { parseCommandsFromSkill, buildSnapshot, findReportFile } from './lib/parsers.mjs';
import { listRuns, readRun, runScript, RUN_SCRIPTS } from './lib/runs.mjs';
import { runScanDryRun, runScanAndSave } from './lib/scan-api.mjs';
import { appendToPipelineFile } from './lib/pipeline-write.mjs';
import {
  loadProfileFull,
  saveProfileStructured,
  saveProfileRaw,
} from './lib/profile-api.mjs';
import {
  loadPortalsFull,
  savePortalsStructured,
  savePortalsRaw,
} from './lib/portals-api.mjs';
import { runLinkedInApify } from './lib/linkedin.mjs';
import { readApplyDraft, listApplyDraftIds } from './lib/apply-drafts.mjs';

const WEB_ROOT = join(fileURLToPath(import.meta.url), '..');
const CAREER_OPS_ROOT = resolveCareerOpsRoot();
const DEFAULT_PORT = parseInt(process.env.CAREER_OPS_WEB_PORT || '8793', 10);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
};

const args = process.argv.slice(2);
const portArg = args.indexOf('--port');
const PORT = portArg !== -1 ? parseInt(args[portArg + 1], 10) : DEFAULT_PORT;
const NO_OPEN = args.includes('--no-open');

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

function readStatic(rel) {
  const full = join(WEB_ROOT, rel);
  if (!existsSync(full)) return null;
  return readFileSync(full);
}

function serveStatic(res, rel) {
  const buf = readStatic(rel);
  if (!buf) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = extname(rel);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(buf);
}

function serveOutputPdf(res, name) {
  const safe = basename(name);
  if (!safe.endsWith('.pdf') || safe.includes('..')) {
    return json(res, 400, { error: 'Invalid file' });
  }
  const full = join(CAREER_OPS_ROOT, 'output', safe);
  if (!existsSync(full)) return json(res, 404, { error: 'PDF not found' });
  const buf = readFileSync(full);
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${safe}"`,
  });
  res.end(buf);
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/health') {
    return json(res, 200, {
      ok: true,
      root: CAREER_OPS_ROOT,
      version: existsSync(join(CAREER_OPS_ROOT, 'VERSION'))
        ? readFileSync(join(CAREER_OPS_ROOT, 'VERSION'), 'utf8').trim()
        : null,
    });
  }

  if (url.pathname === '/api/commands') {
    return json(res, 200, { commands: parseCommandsFromSkill(CAREER_OPS_ROOT) });
  }

  if (url.pathname === '/api/snapshot') {
    return json(res, 200, buildSnapshot(CAREER_OPS_ROOT, applicationsPath(CAREER_OPS_ROOT)));
  }

  if (url.pathname === '/api/file') {
    const rel = url.searchParams.get('path');
    if (!rel) return json(res, 400, { error: 'Missing path' });
    const resolved = resolveAllowedFile(CAREER_OPS_ROOT, rel);
    if (resolved.error) return json(res, resolved.status, { error: resolved.error });
    const content = readFileSync(resolved.full, 'utf8');
    return json(res, 200, { path: resolved.rel, content });
  }

  const reportMatch = url.pathname.match(/^\/api\/reports\/([^/]+)$/);
  if (reportMatch && req.method === 'GET') {
    const id = reportMatch[1];
    const found = findReportFile(CAREER_OPS_ROOT, id);
    if (!found) return json(res, 404, { error: 'Report not found' });
    const markdown = readFileSync(found.path, 'utf8');
    return json(res, 200, {
      id,
      path: found.rel,
      filename: found.name,
      markdown,
    });
  }

  if (url.pathname === '/api/runs' && req.method === 'GET') {
    return json(res, 200, {
      runs: listRuns(CAREER_OPS_ROOT),
      scripts: Object.entries(RUN_SCRIPTS).map(([id, s]) => ({ id, label: s.label })),
    });
  }

  const runMatch = url.pathname.match(/^\/api\/runs\/([^/]+)$/);
  if (runMatch && req.method === 'GET') {
    const log = readRun(CAREER_OPS_ROOT, runMatch[1]);
    if (log == null) return json(res, 404, { error: 'Log not found' });
    return json(res, 200, { id: runMatch[1], log });
  }

  const runScriptMatch = url.pathname.match(/^\/api\/run\/([^/]+)$/);
  if (runScriptMatch && req.method === 'POST') {
    try {
      const result = await runScript(CAREER_OPS_ROOT, runScriptMatch[1]);
      return json(res, 200, result);
    } catch (e) {
      return json(res, 400, { error: e.message });
    }
  }

  const pdfMatch = url.pathname.match(/^\/api\/output\/([^/]+)$/);
  if (pdfMatch && req.method === 'GET') {
    return serveOutputPdf(res, pdfMatch[1]);
  }

  if (url.pathname === '/api/profile' && req.method === 'GET') {
    return json(res, 200, loadProfileFull(CAREER_OPS_ROOT));
  }

  if (url.pathname === '/api/profile' && req.method === 'PUT') {
    try {
      const body = JSON.parse((await readBody(req)) || '{}');
      if (body.structured) {
        saveProfileStructured(CAREER_OPS_ROOT, body.structured);
      } else if (body.content != null) {
        saveProfileRaw(CAREER_OPS_ROOT, body.content);
      } else {
        return json(res, 400, { error: 'structured or content required' });
      }
      return json(res, 200, { ...loadProfileFull(CAREER_OPS_ROOT), saved: true });
    } catch (e) {
      return json(res, 400, { error: e.message });
    }
  }

  if (url.pathname === '/api/portals' && req.method === 'GET') {
    return json(res, 200, loadPortalsFull(CAREER_OPS_ROOT));
  }

  if (url.pathname === '/api/portals' && req.method === 'PUT') {
    try {
      const body = JSON.parse((await readBody(req)) || '{}');
      if (body.structured) {
        savePortalsStructured(CAREER_OPS_ROOT, body.structured);
      } else if (body.content != null) {
        savePortalsRaw(CAREER_OPS_ROOT, body.content);
      } else {
        return json(res, 400, { error: 'structured or content required' });
      }
      return json(res, 200, { ...loadPortalsFull(CAREER_OPS_ROOT), saved: true });
    } catch (e) {
      return json(res, 400, { error: e.message });
    }
  }

  if (url.pathname === '/api/scan/preview' && req.method === 'POST') {
    try {
      const result = await runScanDryRun(CAREER_OPS_ROOT);
      return json(res, 200, result);
    } catch (e) {
      return json(res, 500, { error: e.message });
    }
  }

  if (url.pathname === '/api/scan/run' && req.method === 'POST') {
    try {
      const result = await runScanAndSave(CAREER_OPS_ROOT);
      return json(res, 200, result);
    } catch (e) {
      return json(res, 500, { error: e.message });
    }
  }

  if (url.pathname === '/api/pipeline/add' && req.method === 'POST') {
    try {
      const body = JSON.parse((await readBody(req)) || '{}');
      const offers = body.offers || [];
      const result = appendToPipelineFile(CAREER_OPS_ROOT, offers);
      return json(res, 200, result);
    } catch (e) {
      return json(res, 400, { error: e.message });
    }
  }

  if (url.pathname === '/api/apply-drafts' && req.method === 'GET') {
    return json(res, 200, { ids: listApplyDraftIds(CAREER_OPS_ROOT) });
  }

  const applyDraftMatch = url.pathname.match(/^\/api\/apply-drafts\/([^/]+)$/);
  if (applyDraftMatch && req.method === 'GET') {
    const result = readApplyDraft(CAREER_OPS_ROOT, applyDraftMatch[1]);
    if (result.error) return json(res, result.status, { error: result.error });
    return json(res, 200, result);
  }

  if (url.pathname === '/api/linkedin/scan' && req.method === 'POST') {
    try {
      const body = JSON.parse((await readBody(req)) || '{}');
      const searchUrl = body.searchUrl || body.url;
      if (!searchUrl) return json(res, 400, { error: 'searchUrl required' });
      const result = await runLinkedInApify(searchUrl, { maxItems: body.maxItems || 25 });
      return json(res, 200, result);
    } catch (e) {
      return json(res, 500, { error: e.message });
    }
  }

  if (url.pathname === '/api/file' && req.method === 'PUT') {
    const body = JSON.parse((await readBody(req)) || '{}');
    const rel = body.path;
    const content = body.content;
    if (!rel || content == null) return json(res, 400, { error: 'path and content required' });
    const resolved = resolveWritableFile(CAREER_OPS_ROOT, rel);
    if (resolved.error) return json(res, resolved.status, { error: resolved.error });
    writeFileSync(resolved.full, content, 'utf8');
    return json(res, 200, { path: resolved.rel, saved: true });
  }

  return json(res, 404, { error: 'Unknown API route' });
}

function handleRequest(req, res) {
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    const readOnlyGet =
      req.method === 'GET' &&
      !url.pathname.startsWith('/api/run/');
    const runPost = req.method === 'POST' && url.pathname.startsWith('/api/run/');
    const mutatingPost =
      req.method === 'POST' &&
      ['/api/scan/preview', '/api/scan/run', '/api/pipeline/add', '/api/linkedin/scan'].includes(
        url.pathname,
      );
    const filePut = req.method === 'PUT' && url.pathname === '/api/file';
    const configPut =
      req.method === 'PUT' && (url.pathname === '/api/profile' || url.pathname === '/api/portals');
    if (!readOnlyGet && !runPost && !mutatingPost && !filePut && !configPut) {
      return json(res, 405, { error: 'Method not allowed' });
    }
    return handleApi(req, res, url);
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    return serveStatic(res, 'index.html');
  }

  if (url.pathname.startsWith('/static/')) {
    return serveStatic(res, url.pathname.slice(1));
  }

  res.writeHead(302, { Location: '/' });
  res.end();
}

const server = createServer(handleRequest);

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${PORT}/`;
  console.log(`Career-Ops Web → ${url}`);
  console.log(`  data root → ${CAREER_OPS_ROOT}`);
  if (!NO_OPEN) {
    const cmd =
      process.platform === 'darwin'
        ? `open "${url}"`
        : process.platform === 'win32'
          ? `start "" "${url}"`
          : `xdg-open "${url}"`;
    exec(cmd, () => {});
  }
});
