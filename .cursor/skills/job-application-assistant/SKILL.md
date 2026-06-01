---
name: job-application-assistant
description: >
  Career Assistant Plugin — full job application workflow for Humayun Akbar.
  ALWAYS trigger this skill when the user mentions: job applications, job descriptions,
  LinkedIn posts, recruiter emails, applying to roles, tailoring resume, cover letter,
  DM to recruiter, form answers, interview prep, job search, career strategy, or pastes
  any job posting. Also trigger on raw inputs that look like a JD, LinkedIn post, or
  job board link. Trigger on "setup" or "onboarding" for first-time initialization.
  This skill manages the full pipeline: setup → JD analysis → approval gate → generation → storage.
---

# Career Assistant — Master Skill

---

## 🔄 SESSION BOOTSTRAP — RUN THIS FIRST, EVERY SESSION

Local files reset on every new session. **Before doing anything — including mentioning
setup — check Google Drive first.** Drive is the source of truth. If data exists there,
onboarding is complete and setup must NEVER be triggered.

### Decision tree (run silently before every response)

```
START
  │
  ▼
Check Drive for master-profile.md:
  → Google Drive:get_file_metadata(fileId="12UenBSC9N63omnYprX0TW5vHwasF_llG")
  │
  ├── ✅ FILE EXISTS (metadata returned, no error)
  │     → Onboarding is COMPLETE.
  │     → Run full bootstrap below (download all 5 files).
  │     → Show confirmation message.
  │     → Handle the user's actual request.
  │
  └── ❌ FILE NOT FOUND (error or null)
        → Onboarding has NOT been done yet.
        → Route to skills/skill-setup.md. Start fresh.
```

⚠️ **CRITICAL RULE: Never ask about setup if Drive has the file.
master-profile.md on Drive = onboarding done = skip setup, always.**

---

### Full bootstrap (runs only when Drive data confirmed present)

**Step 1 — Directories**
```bash
mkdir -p /mnt/project/data/resume-templates /mnt/project/output
```

**Step 2 — Download, decode, write each file**

Call `Google Drive:download_file_content(fileId=ID)` → take `content` (base64) → write:

```bash
python3 -c "
import base64
content = 'BASE64_CONTENT_HERE'
with open('LOCAL_PATH_HERE', 'w') as f:
    f.write(base64.b64decode(content + '==').decode('utf-8'))
print('OK')
"
```

| File | Drive ID | Local path |
|---|---|---|
| master-profile.md | `12UenBSC9N63omnYprX0TW5vHwasF_llG` | `/mnt/project/data/master-profile.md` |
| job-preference.md | `1aWjV7AHCyTNMif8FBBCxmIVWZnhR6uja` | `/mnt/project/data/job-preference.md` |
| linkedin-profile.md | `1MoXI42Zxpxf4M9EWq60BNw95Uuu1zRcn` | `/mnt/project/data/linkedin-profile.md` |
| humayun-akbar-technical-project-manager.html | `14akZd3OLZEmEvU7eRhE-K8T6W6Bxtao5` | `/mnt/project/data/resume-templates/humayun-akbar-technical-project-manager.html` |
| humayun-akbar-ai-automation-engineer.html | `1xvKe0KNpTBYKp4yvTU-AXyGw_8t5uXjl` | `/mnt/project/data/resume-templates/humayun-akbar-ai-automation-engineer.html` |

**Step 3 — Verify**
```bash
ls /mnt/project/data/ && ls /mnt/project/data/resume-templates/
```

### Confirmation message (show after successful bootstrap)
```
✅ Career Assistant ready.
Profile: Humayun Akbar | TPM + AI Automation tracks | Remote $3-5k/mo
Data loaded: master-profile ✓ | job-preference ✓ | 2 resume templates ✓
Notion: https://www.notion.so/2167c74d535a4e42ab259bfb94769c57

→ Paste a JD to analyze and apply
→ "Find me jobs" to search for new roles
→ "Review inbox" to process saved Notion jobs
```

### Failure handling
- Download fails but metadata OK → tell user, ask to re-share the file
- File genuinely missing from Drive → tell user which file, offer to recreate it
- Never silently fail or fall through to setup flow

---

## User
**Name:** Humayun Akbar
**Email:** humayunak22@gmail.com
**Location:** Lahore, Pakistan
**Target:** Fully remote | $3,000–$5,000/mo USD | Any timezone

## Architecture

```
career-assistant/
├── SKILL.md                  ← you are here (router + orchestrator)
├── skills/
│   ├── skill-setup.md        ← Layer 0: onboarding, profile gen, resume templates
│   ├── skill-jd-analyzer.md  ← Layer 1: score, classify, detect track
│   ├── skill-resume-tailor.md
│   ├── skill-cover-letter.md
│   ├── skill-dm-email.md
│   ├── skill-form-answers.md
│   └── skill-job-search.md
├── references/
│   ├── data-schema.md        ← all file formats and field specs
│   └── conventions.md        ← naming, folder structure, output rules
└── data/                     ← user's working data (project files)
    ├── linkedin-profile.md
    ├── master-profile.md
    ├── job-preference.md
    └── resume-templates/
        ├── humayun-akbar-technical-project-manager.html
        ├── humayun-akbar-ai-automation-engineer.html
        └── humayun-akbar-[tertiary-role].html
```

## Google Drive — LIVE File Locations

Setup is COMPLETE. All files are saved to Google Drive.

| File | Google Drive ID | Drive Path |
|---|---|---|
| `career-assistant/` (root folder) | `1mUB5EvORhEuXv4QUntDY8hDToqRHs3-H` | My Drive → career-assistant |
| `data/` folder | `1pMe9M0dnkQ3OJYxaRXD3EEQznutes-pP` | career-assistant/data |
| `resume-templates/` folder | `1igOykTx2dK7dLoQahjDAozanVSA0S0zo` | career-assistant/data/resume-templates |
| `master-profile.md` | `12UenBSC9N63omnYprX0TW5vHwasF_llG` | career-assistant/data/master-profile.md |
| `job-preference.md` | `1aWjV7AHCyTNMif8FBBCxmIVWZnhR6uja` | career-assistant/data/job-preference.md |
| `linkedin-profile.md` | `1MoXI42Zxpxf4M9EWq60BNw95Uuu1zRcn` | career-assistant/data/linkedin-profile.md |
| `humayun-akbar-technical-project-manager.html` | `14akZd3OLZEmEvU7eRhE-K8T6W6Bxtao5` | career-assistant/data/resume-templates/ |
| `humayun-akbar-ai-automation-engineer.html` | `1xvKe0KNpTBYKp4yvTU-AXyGw_8t5uXjl` | career-assistant/data/resume-templates/ |

**Notion Job Board:**
- Database ID: `2167c74d535a4e42ab259bfb94769c57`
- URL: https://www.notion.so/2167c74d535a4e42ab259bfb94769c57
- Views: 📋 Pipeline Board (Kanban) | 🔵 TPM Track | 🟣 AI Automation Track

When saving new output files, create them inside:
`career-assistant/output/[kebab-role]_@_[kebab-company]/`
(parent folder ID: `1mUB5EvORhEuXv4QUntDY8hDToqRHs3-H`)

## Resume Tracks

| Track | Template File | Drive ID | Title Preset |
|---|---|---|---|
| TPM | `humayun-akbar-technical-project-manager.html` | `14akZd3OLZEmEvU7eRhE-K8T6W6Bxtao5` | Technical Project Manager \| Engineering Delivery Lead |
| AI Automation | `humayun-akbar-ai-automation-engineer.html` | `1xvKe0KNpTBYKp4yvTU-AXyGw_8t5uXjl` | AI Automation Engineer \| Solutions Architect |
| Full-Stack | _(not yet built — clone AI template if needed)_ | — | — |

## Resume Template Architecture (CRITICAL)

Templates use the **approved Google Doc design** — STIX Two Text font, table-based layout, #434343 body text, section dividers as bottom-bordered headings.

**JSON data layer** lives inside `<script id="RESUME_DATA" type="application/json">` at the top.
**Renderer script** at bottom reads that JSON and builds the full document dynamically.

⚠️ **NEVER touch HTML structure, CSS, or the renderer script. Only edit the JSON.**

### JSON schema
```json
{
  "name": "...",           // ~30 chars max
  "title": "...",          // ~60 chars max
  "contact": "...",        // pipe-separated: "City | phone | email | linkedin"
  "summary": "...",        // ~400 chars max — italic centered
  "skills": [
    { "label": "...", "value": "..." }
  ],
  "experience": [
    {
      "title": "...",      // ~65 chars max
      "company": "...",    // ~55 chars max
      "dates": "...",      // ~20 chars max
      "groups": [          // use groups OR bullets, not both
        { "label": "...", "bullets": ["...", "..."] }
      ],
      "bullets": ["..."]   // flat list; each bullet ~120 chars max
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
    "graduated": "...",    // italic after em-dash
    "school": "..."
  },
  "additional": [
    { "label": "...", "value": "..." }
  ]
}
```

### Layout (single page, continuous)
Name/Title → Contact → Summary → Skills → Experience → Projects → Education → Additional

## Notion Job Board Schema (LIVE — includes all added columns)

| Field | Type | Notes |
|---|---|---|
| Job Title | Title | role name |
| Company | Text | |
| Track | Select | TPM / AI Automation / Full-Stack |
| Match Score | Number | 0–100 |
| Status | Select | Inbox / Reviewing / Applied / Interview / Offer / Rejected / Skipped |
| JD Summary | Text | 2–3 sentence summary |
| Resume | URL | Google Drive link |
| Cover Letter | URL | Google Drive link |
| Applied Date | Date | |
| Source | Select | LinkedIn / Job Board / Direct / Referral |
| Notes | Text | gaps, recruiter, follow-up |
| Recruiter Name | Text | ← added May 2026 |
| Recruiter Email | Email | ← added May 2026 |
| Requirements | Multi-select | tailored-resume / cover-letter / answers / email ← added May 2026 |

## Job Search — Known Blockers

When searching for TPM roles, flag and skip any JD with:
- "US citizenship required" or "US work authorization"
- "Security clearance" or "Pentagon" or "DoD"
- On-site only with no remote option

Preferred targets:
- UAE/Middle East companies (strong match — Happy Tenant client history)
- Companies using Deel/Remote.com for global payroll
- European SaaS companies with remote-first culture
- Fintech/Web3 companies with global remote hiring (e.g. Tether hires from Pakistan)

## How to Route

### Step 0 — Bootstrap (ALWAYS first, ALWAYS silent)
1. Call `Google Drive:get_file_metadata(fileId="12UenBSC9N63omnYprX0TW5vHwasF_llG")`
2. **If file exists** → run full bootstrap, then handle user's request. Never mention setup.
3. **If file not found** → route to `skills/skill-setup.md`. Only then ask about setup.

### Step 1 — Identify trigger

| Input | Route to |
|---|---|
| "setup", "onboarding", "start fresh" | `skills/skill-setup.md` |
| Raw JD / LinkedIn post / job URL | `skills/skill-jd-analyzer.md` |
| "find me jobs" / "search for roles" | `skills/skill-job-search.md` |
| Notion inbox review | `skills/skill-jd-analyzer.md` (batch mode) |
| Scored job, user picks output | Approval Gate (below) |

### Step 3 — Approval Gate (after scoring)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JOB MATCH REPORT
Role: [title] @ [company]
Track: [TPM / AI Automation / Full-Stack]
Match Score: [X]%
Top gaps: [list max 3]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
What do you need?
[1] Base resume only
[2] Tailored resume
[3] Cover letter
[4] DM / Recruiter message
[5] Outreach email (will send via Gmail)
[6] Form / application answers
[7] Full package (2+3+6)
[0] Skip / not interested
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If score < 50%: warn but still show gate.
If user pre-stated intent (e.g. "apply mode"), pre-select and confirm.

### Step 4 — Generate
Read relevant sub-skill. Always read `references/conventions.md` for naming/storage rules first.

### Step 5 — Save & Log
1. Save to Google Drive under `career-assistant/output/[role]_@_[company]/`
2. Log/update Notion row (DB ID: `2167c74d535a4e42ab259bfb94769c57`)
3. Confirm with file links

## Core Principles
- **Never invent.** Only use data from master-profile.md and explicit user input.
- **Human in the loop.** Never generate without approval gate confirmation.
- **Format never breaks.** Only edit JSON in resume templates, never HTML/CSS.
- **One application = one folder.** All outputs for a role@company go in one Drive folder.
- **Pakistan-eligible only.** Flag and skip US-auth-required roles automatically.
