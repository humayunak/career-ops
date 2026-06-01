# skill-setup — Onboarding & Profile Generation

Trigger: user says "setup", "onboarding", project has no master-profile.md, or user is starting fresh.

## ⚠️ SETUP IS ALREADY COMPLETE FOR HUMAYUN AKBAR

All 9 steps have been completed as of May 2026. Do NOT re-run setup unless the user explicitly
says "start fresh" or "redo setup". 

If user triggers setup keyword accidentally, say:
> "Your setup is already complete. All your data is saved and ready. Just paste a JD or say
> 'find me jobs' to get started."

## Current Setup State

```
[✅] 1. LinkedIn PDF — extracted to linkedin-profile.md
[✅] 2. Existing resumes — 9 source files processed
[✅] 3. Onboarding Q&A — completed
[✅] 4. Career path confirmed:
         Primary A: Technical Project Manager (TPM)
         Primary B: AI Automation Engineer
         Tertiary:  AI Solutions Architect
[✅] 5. master-profile.md — 303 lines, full career history
[✅] 6. job-preference.md — remote, $3-5k/mo, 2 tracks
[✅] 7. Resume templates — 2 HTML files (Google Doc design, JSON data layer)
[✅] 8. Google Drive — all files saved to career-assistant/
[✅] 9. Notion Job Board — live at https://www.notion.so/2167c74d535a4e42ab259bfb94769c57
```

## Profile Summary (for quick reference)

**User:** Humayun Akbar | Lahore, Pakistan | humayunak22@gmail.com
**Experience:** 6+ years | Next Frontier Labs (TPM → AI Engineer) | PickleTour | Deepcloud.ai
**Salary target:** $3,000–$5,000/mo USD | Fully remote | Any timezone
**Key metrics:** 12+ projects, 100% on-time, 65% ops reduction, 50% support time cut, 70% faster processing
**Top projects:** Autonomous RevOps Agent, IDP Pipeline, HIPAA AI CRM, Happy Tenant (UAE), HeardPOS

## If User Requests Profile Updates

If user says "update my profile", "I have a new job", "add this project", etc.:
1. Take the new information
2. Update `/mnt/project/data/master-profile.md`
3. Update the relevant resume template JSON if needed
4. Re-upload updated files to Google Drive (use existing file IDs to overwrite)
5. Confirm changes

## Fresh Setup Instructions (if explicitly requested)

Only run the checklist below if user says "start fresh" or "redo setup".

### Checklist
```
[ ] 1. LinkedIn PDF provided
[ ] 2. Existing resumes provided (1 or more)
[ ] 3. Onboarding Q&A completed
[ ] 4. Career path + target roles confirmed
[ ] 5. master-profile.md generated
[ ] 6. job-preference.md generated
[ ] 7. Resume templates generated (1 per target role)
[ ] 8. Files saved to Google Drive data/
[ ] 9. Notion Job Board DB initialized
```

### Step 1 — LinkedIn PDF
> "Download your LinkedIn profile as a PDF:
> LinkedIn → Me → View Profile → More → Save to PDF
> Then upload it here."

Once uploaded: extract to `linkedin-profile.md`
Structure: Contact → Summary → Experience (reverse chrono) → Education → Skills → Certs

### Step 2 — Existing Resumes
> "Upload any existing resumes (Word, PDF, or text — as many as you have)."
Extract unique data not in LinkedIn PDF. Supplement, don't overwrite.

### Step 3 — Onboarding Q&A (2-3 questions at a time)

**Group A:** Role direction | Remote preference | Salary target
**Group B:** Missing projects/metrics | Unlisted skills
**Group C:** Roles to avoid | Timeline (active vs exploring)

Store in `job-preference.md`.

### Step 4 — Career Path Recommendation
Analyze all inputs. Show:
- Primary role (100% match)
- Secondary role (strong match, slight pivot)
- Tertiary role (aspirational, 6–12 months)
- LinkedIn profile improvement suggestions
Wait for user confirmation.

### Step 5 — Generate master-profile.md
```
# Master Profile — [Name]
## Contact | Summary | Target Roles | Experience | Projects | Skills | Education | Certifications | Preferences
```
Rules: LinkedIn = authority for dates/titles. All metrics must be real.

### Step 6 — Generate Resume Templates (HTML)

Use the **approved Google Doc design**:
- STIX Two Text font for headings and body
- Table-based layout (555.3pt wide)
- #434343 body text color
- Section headers: bold, 12pt, bottom-bordered
- JSON data layer in `<script id="RESUME_DATA" type="application/json">`
- Renderer script at bottom — reads JSON, builds full page
- **Never mix data and structure**

Template naming: `humayun-akbar-[kebab-role].html`

### Step 7 — Save to Google Drive
Save under `career-assistant/data/` (folder ID: `1pMe9M0dnkQ3OJYxaRXD3EEQznutes-pP`)
Record all file IDs in SKILL.md Google Drive table.

### Step 8 — Initialize Notion Job Board
Create database with full schema from conventions.md (including Recruiter Name, Recruiter Email, Requirements columns).
Create 3 views: Pipeline Board (kanban by Status) | TPM Track (filtered) | AI Automation Track (filtered)
Record DB ID in SKILL.md and conventions.md.

### Setup Complete Message
```
✅ SETUP COMPLETE
Files: linkedin-profile.md | master-profile.md | job-preference.md | [N] resume templates
Notion Job Board: [link]
Google Drive: [link]
Ready — paste a JD or say "find me jobs" to start.
```
