# Plugin Architecture Migration Plan

**Goal:** Convert the monolithic `/career-ops` skill (one router → many modes) into a standard multi-skill plugin where each skill is independently invocable, loads only the context it needs, and works across Claude Code, Cursor, OpenCode, and Gemini CLI.

**Status:** Planning — not started  
**Estimated effort:** ~5 hours across 4 phases

---

## Why

| Problem now | After migration |
|---|---|
| Every `/career-ops` call loads ~1200 lines | Each skill loads 150–300 lines |
| One file routes to 15+ modes | Each skill has one job |
| Agent has to parse the mode from args | Direct invocation: `/evaluate`, `/scan`, etc. |
| Hard to update one mode without touching others | Edit the one skill file that changed |
| No standard plugin.json — not portable | Works on any agent platform that follows the standard |

---

## New File Structure

```
career-ops/
├── plugin.json                         ← manifest listing all skills
├── skills/
│   ├── evaluate/SKILL.md               ← A–G scoring
│   ├── scan/SKILL.md                   ← portal fetch
│   ├── apply/SKILL.md                  ← CV tailoring + answers
│   ├── tracker/SKILL.md                ← DB + status updates
│   ├── intake/SKILL.md                 ← add job to inbox
│   ├── followup/SKILL.md               ← cadence + drafts
│   ├── prep/SKILL.md                   ← interview prep pack
│   ├── patterns/SKILL.md               ← rejection analysis
│   ├── deep/SKILL.md                   ← company research
│   └── context/                        ← shared context slices
│       ├── profile-eval.md             ← archetypes + comp targets + deal-breakers
│       ├── profile-apply.md            ← voice + proof points
│       ├── scoring-rules.md            ← A–G block definitions (from _shared.md)
│       └── db-commands.md              ← db.mjs quick reference
├── modes/                              ← kept during migration, archived after Phase 4
├── cv.md                               ← unchanged
├── config/profile.yml                  ← unchanged
├── modes/_profile.md                   ← unchanged (source for context/ slices)
├── data/career-ops.db                  ← unchanged
├── scripts/                            ← unchanged
└── web/                                ← unchanged
```

---

## plugin.json

```json
{
  "name": "career-ops",
  "version": "2.0.0",
  "description": "AI job search pipeline — evaluate, scan, apply, track",
  "skills": [
    { "name": "evaluate", "path": "skills/evaluate/SKILL.md", "description": "A–G job evaluation and scoring" },
    { "name": "scan",     "path": "skills/scan/SKILL.md",     "description": "Scan portals for new offers" },
    { "name": "apply",    "path": "skills/apply/SKILL.md",    "description": "Tailor CV and draft application answers" },
    { "name": "tracker",  "path": "skills/tracker/SKILL.md",  "description": "View and update application statuses" },
    { "name": "intake",   "path": "skills/intake/SKILL.md",   "description": "Log a job URL into the inbox" },
    { "name": "followup", "path": "skills/followup/SKILL.md", "description": "Follow-up cadence and drafts" },
    { "name": "prep",     "path": "skills/prep/SKILL.md",     "description": "Interview prep pack for a specific role" },
    { "name": "patterns", "path": "skills/patterns/SKILL.md", "description": "Rejection pattern analysis" },
    { "name": "deep",     "path": "skills/deep/SKILL.md",     "description": "Deep company research" }
  ]
}
```

---

## Context Slice Rule

Which files each skill loads — no skill loads more than it needs.

| Skill | Context loaded |
|---|---|
| `/evaluate` | `cv.md` + `context/profile-eval.md` + `context/scoring-rules.md` |
| `/scan` | `portals.yml` only |
| `/apply` | `cv.md` + `context/profile-apply.md` |
| `/tracker` | `context/db-commands.md` only |
| `/intake` | `context/db-commands.md` only |
| `/followup` | `cv.md` + `context/profile-apply.md` (for voice) |
| `/prep` | `cv.md` + `context/profile-eval.md` + `interview-prep/story-bank.md` |
| `/patterns` | `context/profile-eval.md` + DB query output |
| `/deep` | nothing pre-loaded — user provides company name |

**Rule:** if the skill outputs something that depends on who you are, load the profile slice. If it's just moving data around, don't.

---

## Context Slices — What Goes Where

The `skills/context/` files are extracted from existing sources. They are NOT duplicates — they are focused views.

**`profile-eval.md`** — extracted from `modes/_profile.md` and `config/profile.yml`:
- Target archetypes (AI Solutions Engineer, AI Automation Engineer, etc.)
- Comp targets and range
- Location policy (remote-only, EMEA)
- Deal-breakers
- Scoring weights if customized

**`profile-apply.md`** — extracted from `modes/_profile.md` and `article-digest.md`:
- Writing voice and tone
- Top proof points and metrics
- Key achievements to lead with

**`scoring-rules.md`** — extracted from `modes/_shared.md`:
- A–F block definitions and scoring criteria
- G legitimacy tier logic
- Recommendation thresholds (apply ≥ 4.0, skip < 3.5)

**`db-commands.md`** — condensed from `CLAUDE.md` DB Quick Reference:
- `node scripts/db.mjs get <num>`
- `node scripts/db.mjs update <num> status=Applied`
- `node scripts/db.mjs query status=Evaluated`
- Canonical states table

---

## Migration Phases

### Phase 1 — Scaffold (~2 hours)
Highest-value skills first. Test each before moving on.

- [ ] Create `plugin.json`
- [ ] Create `skills/context/` — extract the 4 slices from `_shared.md` and `_profile.md`
- [ ] Write `skills/evaluate/SKILL.md` — highest value, do first
- [ ] Write `skills/scan/SKILL.md` — simplest, no profile context
- [ ] Write `skills/tracker/SKILL.md` — pure DB commands
- [ ] Test all three in Claude Code: `/evaluate`, `/scan`, `/tracker`

### Phase 2 — Apply Flow (~1.5 hours)

- [ ] Write `skills/apply/SKILL.md` — merge `modes/apply.md` + `modes/pdf.md`
- [ ] Write `skills/intake/SKILL.md` — simple DB insert
- [ ] Write `skills/followup/SKILL.md` — from `modes/followup.md` + `scripts/followup-cadence.mjs`
- [ ] Test: `/apply`, `/intake`, `/followup`

### Phase 3 — Intelligence Skills (~1.5 hours)

- [ ] Write `skills/prep/SKILL.md` — wire in `interview-prep/story-bank.md`
- [ ] Write `skills/patterns/SKILL.md` — from `modes/patterns.md` + `scripts/analyze-patterns.mjs`
- [ ] Write `skills/deep/SKILL.md` — from `modes/deep.md`
- [ ] Test: `/prep`, `/patterns`, `/deep`

### Phase 4 — Cleanup (after all skills tested)

- [ ] Delete `.claude/skills/career-ops/SKILL.md` (old router)
- [ ] Archive `modes/` folder (don't delete — context slices were derived from it)
- [ ] Update `CLAUDE.md` to reflect new invocation pattern
- [ ] Update `AGENTS.md` similarly
- [ ] Verify Cursor and Claude Code both resolve skills from `plugin.json`

---

## What Does NOT Change

- `data/career-ops.db` — SQLite stays, same schema
- `scripts/db.mjs` — same CLI, same commands
- `scripts/scan.mjs` — same scanner, same portals.yml
- `cv.md`, `config/profile.yml`, `modes/_profile.md` — same user files
- `web/` — web UI at port 8793, unchanged
- `portals.yml` — unchanged
- All reports in `reports/` — unchanged

---

## Invocation After Migration

```bash
# Before
/career-ops oferta       # router reads the arg, loads _shared.md + oferta.md
/career-ops scan
/career-ops tracker

# After
/evaluate                # loads only evaluate/SKILL.md + its context slices
/scan                    # loads only scan/SKILL.md + portals.yml
/tracker                 # loads only tracker/SKILL.md + db-commands.md
```

---

## Notes

- The `modes/` folder is kept until Phase 4 is complete and all skills are verified — it's the source of truth during migration
- `context/profile-eval.md` and `context/profile-apply.md` are derived from `modes/_profile.md` — when the user updates their profile, these slices need to be regenerated. Consider adding a `/update-context` script or a note in `_profile.md` to remind the user.
- Skills that are rarely used (`/contacto`, `/training`, `/project`, `/latex`, `/audit`) can be added after Phase 3 or kept as sub-commands of the closest skill if invocation frequency doesn't justify a dedicated skill file.
