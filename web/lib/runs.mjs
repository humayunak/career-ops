import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const WEB_LIB = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = join(WEB_LIB, '..', '..');

export const RUN_SCRIPTS = {
  scan: { cmd: 'scripts/scan.mjs', label: 'Portal scan', cwd: REPO_ROOT },
  patterns: { cmd: 'scripts/analyze-patterns.mjs', label: 'Pattern analysis', cwd: REPO_ROOT },
  doctor: { cmd: 'scripts/doctor.mjs', label: 'Doctor', cwd: REPO_ROOT },
  verify: { cmd: 'scripts/db.mjs', args: ['verify'], label: 'Verify database', cwd: REPO_ROOT },
};

export function runsDir(root) {
  const dir = join(root, 'data', 'web-runs');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export function listRuns(root) {
  const dir = runsDir(root);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.log'))
    .map((f) => {
      const full = join(dir, f);
      const stat = readFileSync(full, 'utf8');
      const lines = stat.split('\n');
      const first = lines.find((l) => l.trim()) || '';
      return {
        id: f.replace(/\.log$/, ''),
        filename: f,
        preview: first.slice(0, 120),
        size: stat.length,
      };
    })
    .sort((a, b) => (a.id < b.id ? 1 : -1));
}

export function readRun(root, id) {
  const safe = id.replace(/[^a-zA-Z0-9._-]/g, '');
  const full = join(runsDir(root), `${safe}.log`);
  if (!existsSync(full)) return null;
  return readFileSync(full, 'utf8');
}

export function runScript(root, name) {
  const spec = RUN_SCRIPTS[name];
  if (!spec) return Promise.reject(new Error('Unknown script'));

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = join(runsDir(root), `${name}-${ts}.log`);
  const cwd = spec.cwd || root;
  const scriptPath = join(cwd, spec.cmd);
  const args = [scriptPath, ...(spec.args || [])];

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd,
      env: { ...process.env, CAREER_OPS_ROOT: root },
    });

    let out = `$ ${process.execPath} ${args.join(' ')}\n`;
    child.stdout.on('data', (d) => {
      out += d.toString();
    });
    child.stderr.on('data', (d) => {
      out += d.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      out += `\n[exit ${code}]\n`;
      writeFileSync(logPath, out, 'utf8');
      resolve({
        id: `${name}-${ts}`,
        exitCode: code,
        log: out,
        path: `data/web-runs/${basename(logPath)}`,
      });
    });
  });
}
