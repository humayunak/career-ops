# skill-jd-analyzer — JD Scoring & Classification

Trigger: user pastes a JD, LinkedIn post, job URL, or requests inbox review.

## Step 1 — Extract JD

**If URL provided:** use `web_fetch(url)` to get page content. Extract job title, company, description.
**If LinkedIn post pasted:** parse directly — look for role, company, contact/apply info, email if present.
**If plain text pasted:** use as-is.
**If "review inbox":** fetch Notion Job Board rows where Status = "Inbox", process each.

## Step 2 — Load Profile Context

Read from project files (load only what's needed — token efficient):
- `/mnt/project/data/master-profile.md` — full profile
- `/mnt/project/data/job-preference.md` — preferences and constraints

## Step 3 — Analyze & Score

Extract from JD:
- Job title + seniority level
- Company name + size signals
- Required skills (must-have)
- Preferred skills (nice-to-have)
- Key responsibilities
- Keywords used 3+ times
- Remote/hybrid/onsite signal
- Compensation (if listed)
- Red flags (unrealistic demands, vague scope, no company name)

Score against master-profile.md:

| Category | Weight |
|---|---|
| Skills match (required) | 40% |
| Experience level match | 25% |
| Role type alignment | 20% |
| Preferences match (remote, salary, industry) | 15% |

Score = weighted sum, expressed as 0-100%.

Detect track: TPM / AI Automation / Full-Stack (or hybrid — pick dominant one).

Detect case type:
- Has email in post → Case 1 (outreach email + resume)
- Has apply link → Case 2 or 4 (apply flow)
- Has "DM me" or "message me" → Case 3 (DM)

## Step 4 — Output Match Report

Show the Approval Gate format defined in SKILL.md Step 3.
Include detected case type as a hint:
> "This looks like a **Case 1** — recruiter post with email. Suggested: outreach email + resume attachment."

## Step 5 — Log to Notion (if new job)

After showing report, log to Notion Job Board:
- Status: "Reviewing"
- Fill all extractable fields
- Confirm log with Notion page link
