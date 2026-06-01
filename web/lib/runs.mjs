import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { spawn } from 'child_process';

export const RUN_SCRIPTS = {
  scan: { cmd: 'scan.mjs', label: 'Portal scan' },
  verify: { cmd: 'verify-pipeline.mjs', label: 'Verify pipeline' },
  patterns: { cmd: 'analyze-patterns.mjs', label: 'Pattern analysis' },
  merge: { cmd: 'merge-tracker.mjs', label: 'Merge tracker' },
  doctor: { cmd: 'doctor.mjs', label: 'Doctor' },
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

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(root, spec.cmd)], {
      cwd: root,
      env: { ...process.env },
    });

    let out = `$ ${process.execPath} ${spec.cmd}\n`;
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
