# skill-resume-tailor — Tailored Resume Generator

Trigger: user selects [2] or [7] at Approval Gate, or says "tailor my resume for this role".

## Inputs required (confirm all exist before proceeding)
- `/mnt/project/data/master-profile.md` — full profile data
- Correct HTML template from Drive (see table below)
- Scored JD analysis from skill-jd-analyzer (already in context)

## Preset Templates (pre-built, Google Doc-faithful design)

Both templates replicate the approved Google Doc layout exactly:
STIX Two Text font | table-based layout | #434343 body text | section headers with bottom border.

**Architecture:** JSON data layer (`<script id="RESUME_DATA">`) + renderer script at bottom.
**Rule:** ONLY edit the JSON. Never touch HTML structure, CSS, or renderer script.

| Track | Local path | Drive ID |
|---|---|---|
| TPM | `/mnt/project/data/resume-templates/humayun-akbar-technical-project-manager.html` | `14akZd3OLZEmEvU7eRhE-K8T6W6Bxtao5` |
| AI Automation | `/mnt/project/data/resume-templates/humayun-akbar-ai-automation-engineer.html` | `1xvKe0KNpTBYKp4yvTU-AXyGw_8t5uXjl` |
| Full-Stack | _(not built — clone AI template if needed)_ | — |

## JSON Data Layer Schema

```json
{
  "name": "...",           // ~30 chars max
  "title": "...",          // ~60 chars max
  "contact": "...",        // pipe-separated string
  "summary": "...",        // ~400 chars max
  "skills": [
    { "label": "...", "value": "..." }
  ],
  "experience": [
    {
      "title": "...",      // ~65 chars max
      "company": "...",    // ~55 chars max
      "dates": "...",      // ~20 chars max
      "groups": [          // use groups OR bullets — never both
        { "label": "...", "bullets": ["...", "..."] }
      ],
      "bullets": ["..."]   // flat list; each ~120 chars max
    }
  ],
  "projects": [
    {
      "title": "...",      // ~50 chars max
      "subtitle": "...",   // ~45 chars max — italic after em-dash
      "bullets": ["..."]   // last bullet = "Stack: ..." line
    }
  ],
  "education": {
    "degree": "...",
    "graduated": "...",
    "school": "..."
  },
  "additional": [
    { "label": "...", "value": "..." }
  ]
}
```

## Layout
Single continuous page: Name/Title → Contact → Summary → Skills → Experience → Projects → Education → Additional

---

## Step 1 — Select Template
Map detected JD track to template:
- TPM → `humayun-akbar-technical-project-manager.html`
- AI Automation → `humayun-akbar-ai-automation-engineer.html`

Read the local template file. Extract the `RESUME_DATA` JSON block.

## Step 2 — Build Tailored JSON

Create a copy of the JSON. Modify ONLY these fields:

- `title` — match JD role title if close (≤60 chars)
- `summary` — rewrite to speak directly to this role (≤400 chars)
- `skills` — reorder groups so JD-matching category leads
- `experience.bullets` / `experience.groups.bullets` — reorder so JD-matching achievements surface first; mirror JD keywords naturally (no stuffing); every bullet: action verb + metric
- `projects` — promote most JD-relevant project to first slot

**NEVER:**
- Invent metrics or experiences not in master-profile.md
- Modify HTML structure, CSS, or renderer `<script>`
- Exceed any `maxChars` limit
- Add new JSON keys not in the schema

## Step 3 — Produce Output HTML

Replace `RESUME_DATA` JSON block in template with tailored JSON.

Save locally to: `/mnt/project/output/[kebab-role]_@_[kebab-company]/`
Filename: `humayun-akbar-[kebab-role]-resume.html`

Tell user: open in Chrome → Ctrl+P → Save as PDF → Margins: None → Save.

## Step 4 — Save to Google Drive & Log Notion

1. Create output subfolder in Drive under `career-assistant/output/` (parent: `1mUB5EvORhEuXv4QUntDY8hDToqRHs3-H`)
2. Upload HTML file; record Drive file ID
3. Update Notion row: add Resume URL, set Requirements to include "tailored-resume"

## Step 5 — Gap Summary

After delivering file, show 3–5 bullets:
- What was emphasized and why
- JD keywords surfaced
- Honest gaps between JD and profile
