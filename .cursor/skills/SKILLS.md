# Design skills hub (from hermes-claw)

Symlinks to `hermes-claw/.hermes/skills/creative/` plus full **ui-ux-pro-max** (data + scripts from `~/work/ui-ux-pro-max-skill`). Do not edit symlink targets here — patch in `.hermes` or the ui-ux-pro-max repo.

When improving **CV templates**, **dashboard**, or any UI in this repo, read the matching `SKILL.md` before coding.

## Design / UX

| Skill | Path | Load when |
|-------|------|-----------|
| ui-ux-pro-max | `.cursor/skills/ui-ux-pro-max/SKILL.md` | Palettes, typography, UX rules, stack-specific UI; run `scripts/search.py` for design systems |
| frontend-design | `.cursor/skills/frontend-design/SKILL.md` | Production UI components/pages (distinctive, not generic) |
| design-audit | `.cursor/skills/design-audit/SKILL.md` | UI consistency audit, design system fidelity |
| design-md | `.cursor/skills/design-md/SKILL.md` | DESIGN.md tokens, export spec |
| sketch | `.cursor/skills/sketch/SKILL.md` | 2–3 HTML mock variants |
| claude-design | `.cursor/skills/claude-design/SKILL.md` | Throwaway HTML prototypes |
| ui-typography | `.cursor/skills/ui-typography/SKILL.md` | Type scale, pairing, readability |
| popular-web-designs | `.cursor/skills/popular-web-designs/SKILL.md` | Reference patterns from well-known sites |
| architecture-diagram | `.cursor/skills/architecture-diagram/SKILL.md` | Dark SVG/HTML architecture diagrams |
| excalidraw | `.cursor/skills/excalidraw/SKILL.md` | Hand-drawn style diagrams |

## Career-ops

| Skill | Path | Load when |
|-------|------|-----------|
| career-ops | `.cursor/skills/career-ops/SKILL.md` | Job search pipeline, evaluate, PDF, scan |
| job-application-assistant | `.cursor/skills/job-application-assistant/SKILL.md` | Full apply workflow: JD analysis, resume/cover letter, form answers, recruiter DM, Drive bootstrap |
| prompt-master | `.cursor/skills/prompt-master/SKILL.md` | Create, improve, or reuse prompts for any task; saves to `my-prompts/` |

### job-application-assistant sub-skills

| File | Use when |
|------|----------|
| `skills/skill-setup.md` | First-time onboarding (Drive profile missing) |
| `skills/skill-jd-analyzer.md` | Parse/analyze a job description |
| `skills/skill-resume-tailor.md` | Tailor resume/CV for a role |
| `skills/skill-cover-letter.md` | Cover letter draft |
| `skills/skill-form-answers.md` | Application form short answers |
| `skills/skill-dm-email.md` | Recruiter DM or email |
| `skills/skill-job-search.md` | Job search strategy |

## ui-ux-pro-max quick search

From repo root:

```bash
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "saas analytics dashboard" --design-system -p "CareerOps"
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "minimalism dark" --domain style
```
