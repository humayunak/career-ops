import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const MARKER = '## Pendientes';

/** Parse dry-run scan stdout lines: `  + Company | Title | Location` */
export function parseScanStdout(stdout) {
  const offers = [];
  let inNew = false;
  for (const line of stdout.split('\n')) {
    if (line.includes('New offers:')) {
      inNew = true;
      continue;
    }
    if (inNew && line.startsWith('  + ')) {
      const body = line.slice(4).trim();
      const parts = body.split('|').map((p) => p.trim());
      if (parts.length >= 2) {
        offers.push({
          company: parts[0],
          title: parts[1],
          location: parts[2] || '',
          url: '',
        });
      }
    }
    if (inNew && line.trim() === '' && offers.length) break;
  }
  return offers;
}

/** Re-parse scan output with URL from scan-history if needed — dry-run lacks URLs in print */
export function enrichOffersWithUrls(offers, stdout) {
  const urlLines = [];
  for (const line of stdout.split('\n')) {
    const m = line.match(/https?:\/\/\S+/);
    if (m) urlLines.push(m[0]);
  }
  if (urlLines.length === offers.length) {
    return offers.map((o, i) => ({ ...o, url: urlLines[i] }));
  }
  return offers;
}

export function appendToPipelineFile(root, offers) {
  if (!offers.length) return { added: 0 };
  const path = join(root, 'data', 'pipeline.md');
  mkdirSync(join(root, 'data'), { recursive: true });
  let text = existsSync(path) ? readFileSync(path, 'utf8') : '# Pipeline Inbox\n\n## Pendientes\n\n';

  const lines = offers
    .filter((o) => o.url)
    .map((o) => `- [ ] ${o.url} | ${o.company} | ${o.title}`);

  if (!lines.length) return { added: 0, error: 'No offers with URLs' };

  const block = lines.join('\n') + '\n';
  const idx = text.indexOf(MARKER);
  if (idx === -1) {
    text += `\n${MARKER}\n\n${block}`;
  } else {
    const after = idx + MARKER.length;
    const rest = text.slice(after);
    const nl = rest.startsWith('\n') ? 1 : 0;
    text = text.slice(0, after) + '\n\n' + block + text.slice(after + nl);
  }
  writeFileSync(path, text, 'utf8');
  return { added: lines.length };
}
