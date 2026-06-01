import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');

export function runPatternsAnalysis(root) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(REPO_ROOT, 'scripts/analyze-patterns.mjs')], {
      cwd: REPO_ROOT,
      env: { ...process.env, CAREER_OPS_ROOT: root },
    });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => {
      out += d.toString();
    });
    child.stderr.on('data', (d) => {
      err += d.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      try {
        const parsed = JSON.parse(out.trim());
        resolve({ ok: code === 0 && !parsed.error, data: parsed, stderr: err, exitCode: code });
      } catch {
        resolve({
          ok: false,
          error: 'Failed to parse patterns output',
          raw: out,
          stderr: err,
          exitCode: code,
        });
      }
    });
  });
}
