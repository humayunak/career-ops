import { spawn } from 'child_process';
import { join } from 'path';
import { parseScanStdout } from './pipeline-write.mjs';

export function runScanDryRun(root, { verify = false } = {}) {
  const args = [join(root, 'scripts/scan.mjs'), '--dry-run', '--json-only'];
  if (verify) args.push('--verify');

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: root,
      env: { ...process.env },
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
      let offers = [];
      let summary = {};
      try {
        const jsonLine = out
          .trim()
          .split('\n')
          .reverse()
          .find((l) => l.startsWith('{'));
        const parsed = JSON.parse(jsonLine || out.trim());
        offers = parsed.offers || [];
        summary = parsed.summary || {};
      } catch {
        offers = parseScanStdout(out);
        summary = parseScanSummary(out);
      }
      resolve({
        exitCode: code,
        stdout: out,
        stderr: err,
        offers,
        summary,
      });
    });
  });
}

function parseScanSummary(stdout) {
  const summary = {};
  const patterns = [
    ['companiesScanned', /Companies scanned:\s+(\d+)/],
    ['totalFound', /Total jobs found:\s+(\d+)/],
    ['filteredTitle', /Filtered by title:\s+(\d+)/],
    ['filteredLocation', /Filtered by location:\s+(\d+)/],
    ['dupes', /Duplicates:\s+(\d+)/],
    ['newOffers', /New offers added:\s+(\d+)/],
  ];
  for (const [key, re] of patterns) {
    const m = stdout.match(re);
    if (m) summary[key] = parseInt(m[1], 10);
  }
  return summary;
}

export function runScanAndSave(root) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(root, 'scripts/scan.mjs')], {
      cwd: root,
      env: { ...process.env },
    });
    let out = '';
    child.stdout.on('data', (d) => {
      out += d.toString();
    });
    child.stderr.on('data', (d) => {
      out += d.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ exitCode: code, stdout: out, offers: parseScanStdout(out) });
    });
  });
}
