import { existsSync } from 'fs';
import { join, normalize, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** User-layer files the web UI may read (relative to career-ops root). */
export const FILE_ALLOWLIST = new Set([
  'config/cv.md',
  'config/article-digest.md',
  'config/profile.yml',
  'config/_profile.md',
  'data/applications.md',
  'data/pipeline.md',
  'data/follow-ups.md',
  'data/scan-history.tsv',
  'config/portals.yml',
]);

/** Allow interview-prep and base-resume markdown files */
export function resolveAllowedFile(root, relPath) {
  const normalized = normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
  if (normalized.startsWith('interview-prep/') && normalized.endsWith('.md')) {
    const full = resolve(join(root, normalized));
    if (!full.startsWith(resolve(join(root, 'interview-prep')))) {
      return { error: 'Invalid path', status: 403 };
    }
    if (!existsSync(full)) {
      return { error: 'File not found', status: 404 };
    }
    return { full, rel: normalized };
  }
  if (normalized.startsWith('base-resumes/') && normalized.endsWith('.md')) {
    const full = resolve(join(root, normalized));
    if (!full.startsWith(resolve(join(root, 'base-resumes')))) {
      return { error: 'Invalid path', status: 403 };
    }
    if (!existsSync(full)) {
      return { error: 'File not found', status: 404 };
    }
    return { full, rel: normalized };
  }
  if (normalized === 'base-resumes') {
    const full = resolve(join(root, normalized));
    if (!existsSync(full)) {
      return { error: 'Directory not found', status: 404 };
    }
    return { full, rel: normalized };
  }
  if (normalized.startsWith('data/outputs/') && (normalized.endsWith('.md') || normalized.endsWith('.yml'))) {
    const full = resolve(join(root, normalized));
    if (!full.startsWith(resolve(join(root, 'data/outputs')))) {
      return { error: 'Invalid path', status: 403 };
    }
    if (!existsSync(full)) {
      return { error: 'File not found', status: 404 };
    }
    return { full, rel: normalized };
  }
  if (!FILE_ALLOWLIST.has(normalized)) {
    return { error: 'Path not allowlisted', status: 403 };
  }
  const full = resolve(join(root, normalized));
  if (!full.startsWith(root)) {
    return { error: 'Invalid path', status: 403 };
  }
  if (!existsSync(full)) {
    return { error: 'File not found', status: 404 };
  }
  return { full, rel: normalized };
}

export function resolveCareerOpsRoot() {
  const fromEnv = process.env.CAREER_OPS_ROOT;
  if (fromEnv) return resolve(fromEnv);
  return resolve(join(__dirname, '..', '..'));
}

/** User-layer files the web UI may write. */
export const FILE_WRITE_ALLOWLIST = new Set([
  'config/profile.yml',
  'config/portals.yml',
  'data/pipeline.md',
]);

export function resolveWritableFile(root, relPath) {
  const normalized = normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
  if (!FILE_WRITE_ALLOWLIST.has(normalized)) {
    return { error: 'Path not writable', status: 403 };
  }
  const full = resolve(join(root, normalized));
  if (!full.startsWith(root)) {
    return { error: 'Invalid path', status: 403 };
  }
  return { full, rel: normalized };
}

export function applicationsPath(root) {
  const data = join(root, 'data', 'applications.md');
  if (existsSync(data)) return data;
  return join(root, 'applications.md');
}
