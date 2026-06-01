import { existsSync, readdirSync, readFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const DRAFTS_DIR = 'data/apply-drafts';

export function applyDraftsDir(root) {
  return join(root, DRAFTS_DIR);
}

export function applyDraftRelPath(reportNumber) {
  const num = String(reportNumber).replace(/\D/g, '');
  if (!num) return null;
  return `${DRAFTS_DIR}/${num.padStart(3, '0')}.md`;
}

export function resolveApplyDraft(root, reportNumber) {
  const rel = applyDraftRelPath(reportNumber);
  if (!rel) return { error: 'Invalid report number', status: 400 };
  const full = resolve(join(root, rel));
  const draftsRoot = resolve(join(root, DRAFTS_DIR));
  if (!full.startsWith(draftsRoot)) {
    return { error: 'Invalid path', status: 403 };
  }
  if (!existsSync(full)) {
    return { error: 'Apply draft not found', status: 404 };
  }
  return { full, rel };
}

export function applyDraftExists(root, reportNumber) {
  const rel = applyDraftRelPath(reportNumber);
  if (!rel) return false;
  return existsSync(join(root, rel));
}

export function readApplyDraft(root, reportNumber) {
  const resolved = resolveApplyDraft(root, reportNumber);
  if (resolved.error) return resolved;
  const markdown = readFileSync(resolved.full, 'utf8');
  return { path: resolved.rel, markdown, reportNumber: String(reportNumber) };
}

export function listApplyDraftIds(root) {
  const dir = applyDraftsDir(root);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, '').replace(/^0+/, '') || '0');
}

export function ensureApplyDraftsDir(root) {
  const dir = applyDraftsDir(root);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}
