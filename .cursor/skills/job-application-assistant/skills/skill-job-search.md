# skill-job-search — Job Discovery & Inbox Population

Trigger: user says "find me jobs", "search for roles", "what's out there", or scheduled/manual search trigger.

## Step 1 — Load search criteria
Read job-preference.md for:
- Target roles (all 3 tracks)
- Remote requirement
- Salary range
- Industries / company types

## Step 2 — Search
Use `web_search()` with targeted queries. Run 3-5 searches:
- `"[primary role]" remote job [current year]`
- `"[secondary role]" remote "senior" job posting`
- Site-specific: `site:linkedin.com/jobs [role]`, `site:weworkremotely.com [role]`

For each result, `web_fetch()` the job page to get full JD.

## Step 3 — Score & filter
Run each JD through skill-jd-analyzer scoring logic (inline, no separate trigger).
Filter: only surface jobs with score ≥ 50%.

## Step 4 — Populate Notion inbox
For each qualifying job:
- Create Notion Job Board record
- Status: "Inbox"
- Fill: title, company, score, source URL, brief JD summary, detected track

## Step 5 — Summary
Show user a table of found jobs ranked by score. Ask:
> "Want to review any of these now? I'll pull up the full analysis."
