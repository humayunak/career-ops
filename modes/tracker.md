# Mode: tracker — Application Tracker

Query and display application data from the DB.

```bash
node db.mjs stats                        # summary counts by status
node db.mjs query                        # all applications (table)
node db.mjs query status=Evaluated       # filtered
node db.mjs query --json score>=4.0      # JSON output
node db.mjs get <num>                    # single application detail
```

**To update a status or field:**
```bash
node db.mjs update <num> status=Applied
node db.mjs update <num> notes="text" score=4.2
```

**Canonical statuses:** `Evaluated` → `Applied` → `Responded` → `Interview` → `Offer` / `Rejected` / `Discarded` / `SKIP`

Show the user a formatted summary table from `node db.mjs query` output. Include stats: total, by status, avg score, pipeline pending.
