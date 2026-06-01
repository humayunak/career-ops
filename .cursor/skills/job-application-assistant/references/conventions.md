# Conventions — Naming, Folder Structure, Storage Rules

## Google Drive Folder Structure (LIVE)

```
career-assistant/                          ← ID: 1mUB5EvORhEuXv4QUntDY8hDToqRHs3-H
├── data/                                  ← ID: 1pMe9M0dnkQ3OJYxaRXD3EEQznutes-pP
│   ├── master-profile.md                  ← ID: 12UenBSC9N63omnYprX0TW5vHwasF_llG
│   ├── job-preference.md                  ← ID: 1aWjV7AHCyTNMif8FBBCxmIVWZnhR6uja
│   ├── linkedin-profile.md                ← ID: 1MoXI42Zxpxf4M9EWq60BNw95Uuu1zRcn
│   └── resume-templates/                  ← ID: 1igOykTx2dK7dLoQahjDAozanVSA0S0zo
│       ├── humayun-akbar-technical-project-manager.html  ← ID: 14akZd3OLZEmEvU7eRhE-K8T6W6Bxtao5
│       └── humayun-akbar-ai-automation-engineer.html     ← ID: 1xvKe0KNpTBYKp4yvTU-AXyGw_8t5uXjl
└── output/                                ← CREATE HERE for each application
    └── [kebab-role]_@_[kebab-company]/
        ├── application-data.md
        ├── [name]-[role]-resume.html
        ├── [name]-[role]-cover-letter.html  (optional)
        └── interview-prep.md               (optional)
```

When creating an output folder, use parent ID `1mUB5EvORhEuXv4QUntDY8hDToqRHs3-H`
and create `output/` subfolder first if it doesn't exist, then the role@company folder inside it.

## Naming Rules
- All lowercase, kebab-case
- Role = kebab job title (e.g. `technical-project-manager`)
- Company = kebab company name (e.g. `tether-operations`)
- Example: `technical-project-manager_@_tether-operations/`

## Notion Job Board (LIVE)
- **Database ID:** `2167c74d535a4e42ab259bfb94769c57`
- **URL:** https://www.notion.so/2167c74d535a4e42ab259bfb94769c57

### Full Schema (as of May 2026)

| Field | Type |
|---|---|
| Job Title | Title |
| Company | Text |
| Track | Select: TPM / AI Automation / Full-Stack |
| Match Score | Number |
| Status | Select: Inbox / Reviewing / Applied / Interview / Offer / Rejected / Skipped |
| JD Summary | Text |
| Resume | URL |
| Cover Letter | URL |
| Applied Date | Date |
| Source | Select: LinkedIn / Job Board / Direct / Referral |
| Notes | Text |
| Recruiter Name | Text |
| Recruiter Email | Email |
| Requirements | Multi-select: tailored-resume / cover-letter / answers / email |

### notion_log() — How to log a new application
```
Notion:notion-create-pages({
  parent: { data_source_id: "5cc4139c-4148-4c21-9f8e-20460c0a152e", type: "data_source_id" },
  pages: [{
    properties: {
      "Job Title": "...",
      "Company": "...",
      "Track": "TPM" | "AI Automation" | "Full-Stack",
      "Match Score": 0-100,
      "Status": "Inbox",
      "JD Summary": "...",
      "Notes": "...",
      "Source": "LinkedIn" | "Job Board" | "Direct" | "Referral"
    }
  }]
})
```

### notion_update() — How to update Requirements (multi-select)
Pass as JSON array string: `"[\"tailored-resume\", \"cover-letter\"]"`

## application-data.md Template

```markdown
# Application — [Role] @ [Company]
Date: [date]
Track: [track]
Match Score: [X]%
Status: [status]
JD URL: [url]

## Job Description
[full JD text]

## Gap Analysis
[honest gaps — bullet list]

## Tailoring Notes
[what was emphasized and why]

## Application Answers
[Q&A if applicable]

## Notes
[recruiter info, follow-up dates, anything else]
```

## Resume Template maxChars Reference

| Field | Limit |
|---|---|
| Name | 30 |
| Title | 60 |
| Contact (full string) | 120 |
| Summary | 400 |
| Skill label | 22 |
| Skill value | 160 |
| Experience title | 65 |
| Experience company | 55 |
| Experience dates | 20 |
| Group label | 25 |
| Experience bullet | 120 |
| Project title | 50 |
| Project subtitle | 45 |
| Project bullet | 120 |
