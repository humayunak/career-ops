# Career-Ops Web UI

Local dashboard for your job search — reads from **SQLite** (`data/career-ops.db`).

## Run

```bash
npm run web
```

http://127.0.0.1:8793 · `CAREER_OPS_ROOT` · `CAREER_OPS_WEB_PORT`

## Navigation

| Group | Panel | Purpose |
|-------|-------|---------|
| **Home** | Overview | KPIs, next actions, quick add job |
| **Jobs** | Inbox | Add URLs, portal scan, evaluate handoffs |
| | Applications | Tracker, status edits, apply answers, compare |
| **Insights** | Reports | Summary + full evaluation reports |
| | Patterns | Targeting insights from history |
| | Follow-ups | Cadence and copy follow-up prompts |
| | Interview prep | Read interview prep documents |
| **Sources** | Portals | Job board keywords and companies |
| | LinkedIn | Import from LinkedIn search (Apify) |
| **You** | Profile | Your targets and CV |
| **Help** | How it works | Lifecycle diagram |
| | AI commands | Copy prompts for your assistant |
| | Maintenance | Scan, doctor, DB verify, patterns script |

## Workflow

1. **Add jobs** in Inbox (URL) or via portal/LinkedIn scan.
2. **Evaluate** — copy prompt → paste in Cursor/Claude → assistant writes report + PDF.
3. **Refresh** in the web UI to see updates.
4. **Apply** — copy application prompt → view saved answers in Applications.
5. **Update status** with the dropdown in Applications.

## APIs

- `GET /api/snapshot` — DB-backed applications, pipeline, metrics
- `PATCH /api/applications/:num` — update status, notes, etc.
- `PATCH /api/pipeline/:id` — dismiss inbox item
- `POST /api/pipeline` — add job URL
- `GET /api/insights/patterns` · `GET /api/insights/followups`
- `GET /api/interview-prep` — list prep markdown files
