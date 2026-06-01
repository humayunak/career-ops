# Mode: intake — Job Intake Parser

Accept raw input in any format (JD text, listing URL, apply URL, LinkedIn post, recruiter details) and write one structured record to the `## Pendientes` section of `data/pipeline.md`. No evaluation. No PDF. Just a clean, deduplicated inbox entry.

---

## Input formats accepted (any combination)

- A job listing URL (Greenhouse, Ashby, Lever, Workable, etc.)
- A separate apply URL (different from the listing URL)
- Raw JD text pasted inline
- A LinkedIn post or LinkedIn job URL
- Recruiter name and/or email (optional)
- Any mix of the above in a single message

---

## Parsing logic

### 1. Extract URLs

Scan the input for all URLs. Classify:
- **Listing URL**: first URL that matches known job board patterns (`greenhouse.io`, `ashbyhq.com`, `lever.co`, `jobs.`, `boards.`, `smartrecruiters.`, `workable.com`, `myworkdayjobs.com`, `linkedin.com/jobs`) — this is the canonical record URL
- **Apply URL**: a second distinct URL, or one whose path contains `/apply` — store in notes if different from listing URL
- If only one URL and it contains `/apply` → treat it as listing URL (it's likely also the apply destination)

### 2. Detect source

| Signal | Source |
|--------|--------|
| URL contains `linkedin.com` | `linkedin` |
| Input is a LinkedIn post (contains "LinkedIn", "lnkd.in", "shared this", "commented", "is hiring") | `linkedin` |
| URL is a known portal (`greenhouse.io`, `ashbyhq.com`, `lever.co`, etc.) | `portal` |
| No URL, raw JD text only | ask user: "Was this from LinkedIn or a portal?" |
| Ambiguous | ask user: "Is this from LinkedIn or a portal?" |

### 3. Extract company + role

Priority order:
1. Explicit mention in input ("Applied at **Acme Corp** for **AI Engineer**")
2. URL slug (e.g., `greenhouse.io/acmecorp/jobs/123` → company: `Acme Corp`)
3. JD text: first H1 or H2 heading, or "Company:" / "Role:" labels
4. LinkedIn post: extract from "Company Name is hiring for Role Title"
5. If still unclear → ask: "What company and role is this for?"

### 4. Extract recruiter details

Look for:
- `Name <email@domain.com>` pattern
- `Name, email@domain.com`
- "Recruiter: Name" or "Contact: Name"
- Email address alone (store as-is)

Store as: `Recruiter: {name} <{email}>` in the notes field (omit if not provided).

---

## Deduplication check

Before writing, check the DB:
```bash
node db.mjs query --json   # check pipeline table via db.mjs pipeline-pending
```
Or simply let `node db.mjs add-pipeline` handle it — the pipeline table has a UNIQUE constraint on URL. If the insert returns `{ ok: false, error: "URL already in pipeline" }`:
> "This URL is already in your pipeline. Skip duplicate?"
If yes → stop. If no → user must manually update via `node db.mjs`.

---

## Write to DB (primary)

Use `node db.mjs add-pipeline` to write the record:

```bash
node db.mjs add-pipeline "{listing_url}" "{source}" "{notes}"
```

Where `{notes}` is a single string combining company, role, apply URL (if different), and recruiter info:

```
{company} — {role}{apply_part}{recruiter_part}
```

- `{apply_part}` = ` | Apply: {apply_url}` — only if apply URL differs from listing URL
- `{recruiter_part}` = ` | Recruiter: {name} <{email}>` — only if recruiter info provided

Examples:
```bash
node db.mjs add-pipeline "https://jobs.ashbyhq.com/acme/abc123" "portal" "Acme Corp — AI Solutions Engineer"
node db.mjs add-pipeline "https://www.linkedin.com/jobs/view/123456" "linkedin" "Stripe — Staff Engineer | Recruiter: Jane Doe <jane@stripe.com>"
node db.mjs add-pipeline "https://boards.greenhouse.io/vercel/jobs/789" "portal" "Vercel — Senior PM | Apply: https://vercel.com/apply/senior-pm"
```

The DB is the source of truth. `data/pipeline.md` is kept in sync as a human-readable fallback — also append a matching line to `data/pipeline.md` `## Pendientes` section:

```
- [ ] {listing_url} | {company} | {role} | {source}{apply_url_part}{recruiter_part}
```

---

## Confirmation output

After writing, show:

```
Intake recorded ✓
  Company  : {company}
  Role     : {role}
  Source   : {source}
  URL      : {listing_url}
  Apply    : {apply_url}        ← only if different
  Recruiter: {recruiter}        ← only if provided

Added to pipeline inbox. Run /career-ops pipeline to evaluate.
```

---

## Edge cases

- **No URL at all**: Write the entry using `local:jds/{slug}.md` as the URL placeholder and save the raw JD text to `jds/{slug}.md` (create the file). Slug = kebab-case of `{company}-{role}`.
- **LinkedIn URL requires login**: Note in the entry: `| Note: LinkedIn login required — paste JD text manually`
- **Multiple JDs in one message**: Create one entry per JD. Confirm count with user before writing.
