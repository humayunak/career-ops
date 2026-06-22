# Mode: pipeline — URL Inbox (Second Brain)

Process pending job URLs from the DB pipeline table. Add URLs via `/career-ops intake` or `node db.mjs add-pipeline <url>`, then run `/career-ops pipeline` to evaluate them.

## Workflow

1. **Get pending URLs** — use DB as primary source:
   ```bash
   node db.mjs pipeline-pending
   ```
   Returns JSON array of `{ id, url, source, notes }`. DB is the only source — no MD fallback.
2. **For each pending URL**:
   a. Calculate the next sequential `REPORT_NUM` (read `reports/`, take the highest number + 1)
   b. **Extract source**: parse the `|`-delimited fields of the pending entry for a `linkedin` or `portal` token (typically field 4 after URL | Company | Role). If not present, default to `—`.
   c. **Extract JD** using Playwright (browser_navigate + browser_snapshot) → WebFetch → WebSearch
   d. If the URL is not accessible → `node db.mjs update` pipeline status to `discarded` with a note and continue
   e. **Execute full auto-pipeline**: Evaluation A-F → Report .md → PDF (if score >= 3.0) → Tracker
   f. **Mark done in DB**: `node db.mjs pipeline-done <id> <app_num>`
   g. **Mark done in DB**: already done in step f — no MD update needed
3. **If there are 3+ pending URLs**, launch agents in parallel (Agent tool with `run_in_background`) to maximize speed.
4. **At the end**, show summary table:

```
| # | Company | Role | Score | PDF | Recommended action |
```

## Pipeline DB schema

```
id    url    added    source    notes    status(pending|processing|done|discarded)    app_num
```

Query pending: `node db.mjs pipeline-pending`
Mark done:     `node db.mjs pipeline-done <id> <app_num>`
Add URL:       `node db.mjs add-pipeline <url> [source] [notes]`

## Intelligent JD detection from URL

1. **Playwright (preferred):** `browser_navigate` + `browser_snapshot`. Works with all SPAs.
2. **WebFetch (fallback):** For static pages or when Playwright is unavailable.
3. **WebSearch (last resort):** Search in secondary portals that index the JD.

**Special cases:**
- **LinkedIn**: May require login → mark `[!]` and ask the user to paste the text
- **PDF**: If the URL points to a PDF, read it directly with the Read tool
- **`local:` prefix**: Read the local file. Example: `local:jds/linkedin-pm-ai.md` → read `jds/linkedin-pm-ai.md`

## Automatic numbering

1. List all files in `reports/`
2. Extract the number from the prefix (e.g., `142-medispend...` → 142)
3. New number = maximum found + 1

## Source synchronization

Before processing any URL, verify sync:
```bash
node cv-sync-check.mjs
```
If there is a desynchronization, warn the user before continuing.
