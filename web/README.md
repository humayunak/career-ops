# Career-Ops Web UI

Local mission control — **Catppuccin Mocha** + glass surfaces.

## Run

```bash
npm run web
```

http://127.0.0.1:8793 · `CAREER_OPS_ROOT` · `CAREER_OPS_WEB_PORT`

## Navigation

| Group | Panel | Content |
|-------|-------|---------|
| **Work** | Overview | KPIs, funnel, score distribution |
| | Inbox | Workflow strip, portal scan triage, pipeline pending |
| | Applications | Tracker + **Copy apply** / **View apply** + PDF preview |
| | Reports | Report markdown + linked resume PDF |
| | LinkedIn | Apify search URL → triage → inbox (`APIFY_TOKEN`) |
| **You** | Profile | Form editor for `profile.yml`, markdown view for `_profile.md`, CV/digest |
| **Sources** | Portals | Tag editors for scan keywords + company toggles + YAML |
| **System** | Runs | `scan`, `verify`, `patterns`, … |
| | Commands | `/career-ops` copy for Cursor |

## APIs (local only)

- `POST /api/scan/preview` — dry-run portal scan (`scan.mjs --dry-run --json-only`)
- `POST /api/scan/run` — write matches to `data/pipeline.md`
- `POST /api/pipeline/add` — `{ offers: [{ url, company, title }] }`
- `POST /api/linkedin/scan` — `{ searchUrl }` via Apify
- `PUT /api/profile` — `{ structured: {...} }` or `{ content: "yaml..." }`
- `PUT /api/portals` — `{ structured: { titleFilter, locationFilter, companies } }` or raw YAML
- `PUT /api/file` — save allowlisted files
- `GET /api/output/{file}.pdf` — inline PDF (also used in preview modal)
- `GET /api/apply-drafts/{reportNum}` — apply Q&A markdown from `data/apply-drafts/`

### Apply workflow

1. **Applications → Copy apply** — paste in one pinned Cursor chat (not a new thread per job).
2. Agent completes `/career-ops apply` and saves `data/apply-drafts/{NNN}.md`.
3. **Refresh** → **View apply** on that row.

See **Commands** for the architecture diagram (`/static/career-ops-workflow.html`).

## LinkedIn / Apify

```bash
export APIFY_TOKEN=your_token
# optional: export APIFY_LINKEDIN_ACTOR=actor~name
```

Paste a LinkedIn jobs search URL in **Sources → LinkedIn**, fetch, select rows, **Add to inbox**.
