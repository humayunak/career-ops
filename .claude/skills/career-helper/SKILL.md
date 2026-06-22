---
name: career-helper
description: Personal career coaching -- brand positioning, LinkedIn, interview prep, salary negotiation, digital footprint
arguments: mode
user-invocable: true
argument-hint: "[brand | bio | linkedin | interview | mock | negotiate | offer | footprint | social | transitions | ai-impact | help]"
license: MIT
---

<!-- Added by career-helper (2026-06-02) -->

# career-helper -- Router

Career coaching submodule running inside career-ops. All outputs saved to `career-helper/` unless noted.
Profile source: `config/profile.yml`, `modes/_profile.md`, `career-helper/personal-brand-foundation.md`.

## Mode Routing

| Input | Skill | What it does |
|-------|-------|--------------|
| (empty) | `help` | Show this menu |
| `brand` | `personal-brand` (Capability A) | Build / refresh Why You, Why Them, Why Now foundation |
| `bio` | `personal-brand` (Capability D) | Generate bio library (LinkedIn About, headline, speaker, podcast, email sig) |
| `channels` | `personal-brand` (Capability B) | Audience and channel map |
| `content` | `personal-brand` (Capability C) | Content pillars and weekly cadence plan |
| `linkedin` | `linkedin-coach` | Full LinkedIn profile audit + headline + About rewrite |
| `post <text>` | `linkedin-coach` | Review or improve a draft LinkedIn post |
| `interview` | `interview-master` | Interview prep: STAR framework, company-specific intel |
| `mock` | `interview-master` | Realistic mock interview simulation |
| `rejected` | `interview-master` | Post-rejection debrief and coaching |
| `negotiate` | `career-navigator` | Salary negotiation coaching and scripts |
| `offer` | `career-navigator` | Evaluate or compare job offers |
| `plan` | `career-navigator` | 3-month job search plan with networking |
| `footprint` | `employer-footprint` | Full digital footprint audit (employer view) |
| `social` | `social-media-review` | Quick social media recruiter-eye review |
| `transitions` | `career-transitions` | Fractional, founder, public sector, non-linear paths |
| `ai-impact` | `ai-impact-assessment` | AI disruption risk on your role + 6-month mitigation plan |
| `help` | — | Show this menu |

## Execution

When a mode is identified, load the corresponding career-helper skill and run it with full context.

### Context to always load first

```
config/profile.yml          -- compensation targets, deal-breakers, role targets
modes/_profile.md           -- archetypes, proof points, narrative, interview stories
career-helper/personal-brand-foundation.md  -- positioning, voice rules (if exists)
```

### Output convention

- All new files -> career-helper/{filename}.md
- Write-backs to career-ops files -> tag with <!-- Added by career-helper --> (MD) or # Added by career-helper (YAML)
- Never edit modes/_shared.md or system-layer files

### Discovery menu (empty args)

When called with no arguments, print:

```
career-helper -- personal career coaching

  /career-helper brand        Build your Why You / Why Them / Why Now brand foundation
  /career-helper bio          Generate LinkedIn About, headline, speaker bio, email sig
  /career-helper channels     Map your audience and choose the right channels
  /career-helper content      Content pillars and weekly posting cadence
  /career-helper linkedin     Full LinkedIn profile audit and rewrite
  /career-helper post <text>  Review or improve a LinkedIn post draft
  /career-helper interview    Interview prep with STAR framework
  /career-helper mock         Realistic mock interview simulation
  /career-helper rejected     Post-rejection debrief and recovery coaching
  /career-helper negotiate    Salary negotiation coaching and scripts
  /career-helper offer        Evaluate or compare job offers
  /career-helper plan         3-month job search plan
  /career-helper footprint    Digital footprint audit -- what employers find online
  /career-helper social       Quick social media recruiter-eye review
  /career-helper transitions  Fractional, founder, public sector, non-linear paths
  /career-helper ai-impact    AI disruption risk on your current role

Outputs: career-helper/*.md
Profile: config/profile.yml + modes/_profile.md
```
