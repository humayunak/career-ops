#!/usr/bin/env node
import { writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATE = '2026-05-29';

const REPORTS = [
  {
    batchId: 41,
    num: '041',
    slug: 'coreweave-threat-intel',
    company: 'CoreWeave',
    role: 'Senior Threat Intelligence Specialist (Supply Chain & Geopolitical Security)',
    url: 'https://coreweave.com/careers/job?4683502006&board=coreweave&gh_jid=4683502006',
    archetype: 'Out of scope (Security / Geopolitical Intelligence)',
    score: 1.7,
    legitimacy: 'High Confidence',
    verification: 'unconfirmed (batch mode)',
    pdf: null,
    decision: 'Skip',
    hardStops: ['Role requires 7+ years threat intelligence / geopolitical risk — not AI solutions engineering', 'Export-controlled information access (US person / licensing likely required)', 'Hybrid-first culture; remote only for candidates 30+ miles from hub'],
    softGaps: ['Python automation mentioned in preferred qualifications only'],
    strengths: ['Python scripting for workflow automation (adjacent, not domain fit)'],
    risk: 'High',
    confidence: 'High',
    nextAction: 'Do not apply — domain mismatch. Re-scan CoreWeave for AI/platform engineering roles instead.',
    note: 'Wrong domain — security intel, not AI delivery',
    blockA: `| Field | Value |
|-------|-------|
| Archetype | Out of scope — Geopolitical / Threat Intelligence (not in career-ops AI archetypes) |
| Domain | Cloud infrastructure security / global risk intelligence |
| Function | Analyze / brief / operationalize threat intel — not build AI products |
| Seniority | Senior (7+ years threat intel) |
| Remote | Listed Remote but hybrid-first; onboarding at hubs |
| Team | Global Security, Data Center Security, Executive Protection |
| TL;DR | CoreWeave needs a geopolitical threat analyst, not an AI solutions engineer. |`,
    blockB: `| JD Requirement | CV Match | Gap? |
|----------------|----------|------|
| 7+ years threat intelligence, supply chain security | No equivalent — AI/LLM delivery background | **Hard blocker** |
| Geopolitical risk, terrorism, sanctions analysis | Not in CV | **Hard blocker** |
| Executive briefings, travel risk assessments | Stakeholder comms with US product owners — different domain | Major gap |
| Python/SQL intelligence automation (preferred) | Python in production AI pipelines | Partial — wrong context |
| CTIA/GIAC certifications (preferred) | None | Gap |
| Hyperscale / critical infrastructure (preferred) | AWS ECS/Lambda at SaaS scale — not security intel | Weak adjacency |

**Gaps:** This is a career change into security intelligence, not a stretch role. No mitigation path worth pursuing unless Humayun is actively pivoting to threat intel.`,
    blockC: `**Level:** Senior specialist in a domain Humayun does not occupy.

**Sell senior without lying:** Not applicable — applying would misrepresent the profile.

**If downleveled:** N/A — recommend skipping entirely.`,
    blockD: `| Factor | Finding |
|--------|---------|
| Posted range | $143,000–$210,000 base (NYC/SF market) |
| Market | Strong for specialized security intel at hyperscalers |
| CoreWeave context | Public (CRWV); AI cloud leader; comp above Humayun's target band |
| Demand | Niche role; legitimate security function |

**Sources:** JD (May 2025); CoreWeave public comp range in posting.`,
    blockE: `Not recommended to customize CV for this role. If forced to pivot long-term, would require new certifications and a security-focused narrative — outside current North Star.`,
    blockF: `No interview prep recommended. If exploring CoreWeave AI roles later, lead with NFL platform delivery and inference infrastructure interest — not this posting.`,
    blockG: `**Assessment:** High Confidence (real, fresh posting)

| Signal | Finding | Weight |
|--------|---------|--------|
| Posting age | First published 2026-05-21; updated 2026-05-23 | Positive |
| Apply state | Active on Greenhouse (batch fetch) | Positive |
| Description quality | Highly specific domain requirements | Positive |
| Comp transparency | $143K–$210K base stated | Positive |
| Role-company fit | Aligns with CoreWeave global ops / data centers | Positive |

**Context:** New listing; export control note is standard for infrastructure companies, not a ghost signal.`,
    keywords: 'threat intelligence, geopolitical risk, supply chain security, OSINT, executive briefings, Python, SQL, critical infrastructure, CoreWeave, cloud security',
  },
  {
    batchId: 42,
    num: '042',
    slug: 'glean-ai-outcomes-central',
    company: 'Glean',
    role: 'AI Outcomes Manager, Central',
    url: 'https://job-boards.greenhouse.io/gleanwork/jobs/4661913005',
    archetype: 'AI Transformation + Technical AI PM (hybrid)',
    score: 3.3,
    legitimacy: 'Proceed with Caution',
    verification: 'unconfirmed (batch mode)',
    pdf: 'output/cv-humayunak-glean-ai-outcomes-central-2026-05-29.pdf',
    decision: 'Research first',
    hardStops: ['Remote — US only; must be in US Central timezone (Pakistan unlikely without US work authorization)'],
    softGaps: ['Role explicitly not on critical path for production code', 'Formal AI outcomes evaluation stack (Langfuse) not in prod', 'Enterprise post-sales CS title vs builder identity'],
    strengths: ['Shipped measurable AI outcomes (65% workload cut, 50% support improvement)', 'Prompting + multi-agent in production', 'Executive-facing US delivery'],
    risk: 'Medium',
    confidence: 'Medium',
    nextAction: 'Confirm US work authorization / remote-from-Pakistan policy with recruiter before investing; if eligible, apply Central only.',
    note: 'Strong AI fluency; US-only CS outcomes role',
    blockA: `| Field | Value |
|-------|-------|
| Archetype | AI Transformation / Technical AI PM (customer outcomes) |
| Domain | Enterprise Work AI — search, assistants, agents |
| Function | Consult / enable / drive adoption — not primary builder |
| Seniority | Mid-senior (5+ years blended biz+tech) |
| Remote | Remote — US Central timezone required |
| Team | Customer-facing outcomes; partners with Product/R&D |
| TL;DR | Post-sales customer outcomes role: workshops, pilots, agent design with executives — light on production engineering. |`,
    blockB: `| JD Requirement | CV Evidence | Gap? |
|----------------|-------------|------|
| 5+ years biz+tech blend | NFL 2021–present; Pickletour founding | Match |
| Customer-facing consultative | US POC, 12+ SaaS projects | Match |
| Craft prompts, guide AI agents, shipped outcomes | Revops agent, HIPAA RAG, recruitment pipeline | Strong match |
| LLM capabilities/limitations | RAG vs fine-tuning tradeoff; production constraints | Match |
| Product sense across functions | Pickletour + multi-domain SaaS | Match |
| OpenAI/Claude hands-on, not critical-path coder | LangChain/OpenAI prod — but Humayun *does* ship code | Over-qualified technically; title mismatch |
| Define success criteria, eval outcomes (nice-to-have) | Custom metrics; no Langfuse in prod | Soft gap |
| US Central timezone | Lahore UTC+5 — overlap possible; **location policy unclear** | **Hard stop until verified** |

**Gaps:** Clarify eligibility. Frame as "outcomes engineer who still ships" only if recruiter confirms remote Pakistan.`,
    blockC: `**Level:** Peer level on experience; role sits in Customer Success / Outcomes, not Engineering.

**Sell senior without lying:** Lead with revops agent business metrics and executive workshops (NAMC/Happy Tenant for stakeholder mgmt only if asked).

**If downleveled:** Unlikely — role is not engineering ladder.`,
    blockD: `| Factor | Finding |
|--------|---------|
| OTE range | $150,000–$200,000 (JD) |
| vs target | Above $90–120K target — excellent if eligible |
| Market | Competitive for enterprise AI CS/consulting in SF ecosystem |
| Glean | Well-funded Work AI leader; high growth |

**Sources:** Glean Greenhouse posting (Feb 2025, updated May 2025).`,
    blockE: `| # | Section | Change | Why |
|---|---------|--------|-----|
| 1 | Title | AI Solutions Engineer (not TPM) | Align with builder-outcomes hybrid |
| 2 | Summary | Lead 65% + 50% metrics; "executive use cases → production agents" | JD outcomes focus |
| 3 | Projects | Revops, HIPAA, recruitment screening top 3 | Agent + enterprise proof |
| 4 | De-emphasize | Pure PMO / team size bullets | Avoid TPM pigeonhole |
| 5 | LinkedIn | Add "AI outcomes" language mirroring Glean vocabulary | ATS + recruiter scan |`,
    blockF: `| # | JD Requirement | Story | Reflection |
|---|----------------|-------|------------|
| 1 | Shipped AI outcomes | Revops agent — 65% reduction, 2h→20m response | Learned deterministic scoring + LLM enrichment |
| 2 | Executive stakeholders | US healthcare SaaS POC + HIPAA audit path | RAG traceability won compliance |
| 3 | Prompting / agents | Recruitment screening pipeline — explainable rubric | Set expectations on LLM limits early |
| 4 | Workshops / discovery | NAMC scope reset — weekly demos (use sparingly) | Recovery through transparency |
| 5 | LLM limits | RAG vs fine-tuning decision | Would prototype both again before committing |

**Case study:** Revops agent live demo. **Red flag Q:** "Why not engineering?" → "I ship code; I'm applying where outcomes matter — I've done both for US clients."`,
    blockG: `**Assessment:** Proceed with Caution

| Signal | Finding | Weight |
|--------|---------|--------|
| Posting age | First published 2026-02-13 (~3.5 months) | Neutral |
| Reposting | Central/East/West variants — regional split, not ghost | Neutral |
| Description | Specific responsibilities and AI interview step | Positive |
| Comp | OTE $150K–$200K stated | Positive |
| US-only remote | May limit international applicants | Concerning |

**Context:** Long-open regional CS roles are common at hypergrowth SaaS; verify active hiring intent.`,
    keywords: 'AI outcomes, enterprise search, Work AI, agents, OpenAI, Claude, prompt engineering, customer success, discovery workshops, Glean, adoption, success metrics',
  },
];

// Clone Glean outcomes for 43, 44 with regional tweaks
const east = { ...REPORTS[1], batchId: 43, num: '043', slug: 'glean-ai-outcomes-east', role: 'AI Outcomes Manager, East', url: 'https://job-boards.greenhouse.io/gleanwork/jobs/4661934005', pdf: 'output/cv-humayunak-glean-ai-outcomes-east-2026-05-29.pdf', score: 3.3, hardStops: ['Remote — US only; US East Coast timezone required'], nextAction: 'Same as Central — confirm work authorization; East timezone overlap from Pakistan is feasible (evening overlap) but eligibility is the gate.' };
const west = { ...REPORTS[1], batchId: 44, num: '044', slug: 'glean-ai-outcomes-west', role: 'AI Outcomes Manager, West', url: 'https://job-boards.greenhouse.io/gleanwork/jobs/4661899005', pdf: 'output/cv-humayunak-glean-ai-outcomes-west-2026-05-29.pdf', score: 3.2, hardStops: ['Remote — US only; US West Coast timezone required'], note: 'Same role family as 042; West OTE floor lower ($130K)', blockD: `| Factor | Finding |
|--------|---------|
| OTE range | $130,000–$210,000 (JD) — lower floor than Central/East |
| vs target | Still above target if eligible |
| Market | Same as 042 |

**Sources:** Glean Greenhouse posting.` };
REPORTS.push(east, west);

// AI Success Managers 45-47
const aismBase = {
  ...REPORTS[1],
  archetype: 'Technical TPM / Customer Success (hybrid)',
  decision: 'Consider',
  softGaps: ['Dedicated enterprise CS / SSO connector rollout as primary job function', '3–5 years title bands to Humayun\'s 6+ — may read overqualified', 'Less hands-on agent building than ideal'],
  strengths: ['12+ enterprise SaaS deliveries as technical POC', 'AWS, Agile, DevOps, playbooks', 'Joint success plans and escalation management (NAMC)'],
  blockA: `| Field | Value |
|-------|-------|
| Archetype | Technical TPM / Customer Success |
| Domain | Enterprise Work AI platform deployment |
| Function | Post-sales implementation, SSO/connectors, program management |
| Seniority | Mid (3–5 years stated; Humayun senior) |
| Remote | Remote — US timezone band |
| TL;DR | Technical customer success lead for Glean deployments — PM-heavy, lighter on building new AI products. |`,
  blockB: `| JD Requirement | CV Evidence | Gap? |
|----------------|-------------|------|
| 3–5 years technical CS / implementation | NFL delivery lead 12+ projects | Match (senior side) |
| Agile / DevOps | GitHub Actions, Scrum, n8n sprint automation | Match |
| AWS/GCP/Azure | AWS Lambda, ECS, S3 standardized | Match |
| SSO + connectors guidance | Integrations across HubSpot, Slack, Gmail, SaaS APIs | Partial — not SSO specialist |
| Joint success plans / EBRs | NAMC, Happy Tenant PMO | Match for TPM framing |
| Enterprise escalations | US POC, on-call delivery | Match |
| AI business outcomes | HIPAA RAG, revops — customer outcomes | Strong differentiator |

**Gaps:** Don't compete as generic CSM — position as technical implementer who can unblock engineering.`,
  blockC: `**Level:** Humayun may be over-leveled; risk of "too senior / will get bored."

**Sell senior without lying:** "I've been the deployment owner and technical POC, not ticket-router CS."

**If downleveled:** Accept only if scope includes technical unblocking and AI adoption metrics.`,
  blockD: `| Factor | Finding |
|--------|---------|
| OTE range | $120,000–$170,000 (Central) / $140K–$200K (East/West) |
| vs target | Meets or exceeds $90–120K target |
| Demand | Strong for technical CSM at AI SaaS |

**Sources:** Glean Greenhouse postings.`,
  blockE: `Emphasize AWS deployment, enterprise rollout, HIPAA migration (16 engineers), and measurable adoption metrics. De-emphasize pure agent-building unless asked.`,
  blockF: `STAR: HIPAA platform migration — zero prod incidents; NAMC renewal + bonus for delivery recovery; internal n8n sprint automation for velocity metrics.`,
  blockG: `**Assessment:** Proceed with Caution (045–046); 047 West posting fresher (May 2026) → High Confidence for 047

| Signal | Finding | Weight |
|--------|---------|--------|
| Posting age | Feb 2025 listings (~3 months) | Neutral |
| 047 West | First published 2026-05-15 | Positive |
| US-only | Same eligibility concern as Outcomes roles | Concerning |`,
  keywords: 'AI success manager, technical customer success, SSO, connectors, AWS, Agile, DevOps, enterprise SaaS, implementation, Glean, EBR, joint success plan',
};
REPORTS.push(
  { ...aismBase, batchId: 45, num: '045', slug: 'glean-ai-success-central', role: 'AI Success Manager, Central', url: 'https://job-boards.greenhouse.io/gleanwork/jobs/4661884005', score: 3.5, pdf: 'output/cv-humayunak-glean-ai-success-central-2026-05-29.pdf', hardStops: ['Remote — US only; US Central timezone'], note: 'Technical CS fit; verify US eligibility' },
  { ...aismBase, batchId: 46, num: '046', slug: 'glean-ai-success-east', role: 'AI Success Manager, East', url: 'https://job-boards.greenhouse.io/gleanwork/jobs/4661878005', score: 3.5, pdf: 'output/cv-humayunak-glean-ai-success-east-2026-05-29.pdf', hardStops: ['Remote — US only; US East Coast'] },
  { ...aismBase, batchId: 47, num: '047', slug: 'glean-ai-success-west', role: 'AI Success Manager, West', url: 'https://job-boards.greenhouse.io/gleanwork/jobs/4694339005', score: 3.6, pdf: 'output/cv-humayunak-glean-ai-success-west-2026-05-29.pdf', legitimacy: 'High Confidence', hardStops: ['Remote — US only; US Pacific timezone'], note: 'Freshest AISM posting; best of CS trio if eligible' },
);

// 048 FDE
REPORTS.push({
  batchId: 48,
  num: '048',
  slug: 'glean-fde',
  company: 'Glean',
  role: 'Founding Forward Deployed Engineer',
  url: 'https://job-boards.greenhouse.io/gleanwork/jobs/4651991005',
  archetype: 'AI Forward Deployed Engineer',
  score: 4.4,
  legitimacy: 'Proceed with Caution',
  verification: 'unconfirmed (batch mode)',
  pdf: 'output/cv-humayunak-glean-fde-2026-05-29.pdf',
  decision: 'Apply',
  hardStops: ['25–50% travel required', 'Remote US — confirm international eligibility', 'Formal eval frameworks (Langfuse/LangSmith) not yet in prod'],
  softGaps: ['LangGraph not shipped — LangChain + n8n is stack', 'Public GitHub lighter than "founding FDE" bar at top tier'],
  strengths: ['0-to-1 Pickletour MVP ~9 months', 'Production multi-agent revops in <8 weeks', 'C-suite ready communication via US enterprise clients', 'Full-stack depth with measurable AI outcomes'],
  risk: 'Medium',
  confidence: 'High',
  nextAction: 'Apply with FDE-tailored PDF; lead cover letter with revops + Pickletour founding; ask recruiter explicitly about Pakistan remote + travel %.',
  note: 'Best fit in batch — FDE archetype match; confirm US hire',
  blockA: `| Field | Value |
|-------|-------|
| Archetype | AI Forward Deployed Engineer |
| Domain | Enterprise Work AI — 0-to-1 product surfaces with strategic customers |
| Function | Discover, build, ship new product extensions with C-suite customers |
| Seniority | Senior / founding team member |
| Remote | Remote US + 25–50% travel |
| TL;DR | Founder-mode technical role building new Glean product surfaces for strategic enterprises — strongest alignment in this batch. |`,
  blockB: `| JD Requirement | CV Evidence | Gap? |
|----------------|-------------|------|
| 0-to-1 production software | Pickletour MVP ~9 months; revops agent <8 weeks | Strong match |
| Production AI (agents, prompts, evals) | LangChain + n8n agents; custom metrics — no Langfuse | Soft gap on eval tooling |
| Full-stack enterprise systems | 12+ SaaS, AWS, React/Node/Python | Match |
| Business acumen / C-suite | US POC, executive demos, NAMC recovery | Match |
| 4+ years technical | 6+ years | Match |
| Former founders encouraged | Pickletour founding engineer | Strong match |
| Travel 25–50% | Remote from Pakistan historically — travel may be hard | Operational concern |

**Gaps:** Eval stack and US eligibility are the real gates, not ability.`,
  blockC: `**Level:** Appropriate senior IC/founding scope.

**Sell senior without lying:** "I've already operated as forward-deployed engineer for US clients — I discover the workflow, ship the agent, and hand off a scalable pattern."

**If downleveled:** Unlikely; if offered adjacent Outcomes role, negotiate FDE scope or pass.`,
  blockD: `| Factor | Finding |
|--------|---------|
| Range | $160,000–$270,000 (JD) |
| vs target | Significantly above $90–120K — top of band exceptional |
| Market | Premium for founding FDE at agentic AI companies |
| Demand | High for proven 0-to-1 + production AI |

**Sources:** Glean Greenhouse (Jan 2025, updated May 2025).`,
  blockE: `| # | Section | Change | Why |
|---|---------|--------|-----|
| 1 | Title | AI Solutions Engineer | Consistent brand |
| 2 | Summary | Founder-mode 0-to-1 + production agents | FDE narrative |
| 3 | Projects | Revops, Pickletour, HIPAA, BOAT | 0-to-1 + enterprise |
| 4 | Skills | Add "evaluation", "discovery", "executive stakeholder" | JD vocabulary |
| 5 | Cover letter | One paragraph on "built what didn't exist" at Pickletour + revops | FDE hook |`,
  blockF: `| # | JD Requirement | Story | Reflection |
|---|----------------|-------|------------|
| 1 | 0-to-1 build | Pickletour concept → live MVP | Would validate market earlier |
| 2 | Production AI | Revops multi-agent | Deterministic rubric + LLM hybrid |
| 3 | C-suite trust | HIPAA RAG audit path | Transparency beats black-box |
| 4 | Scale with R&D | NFL standardizing AWS CI/CD across portfolio | Productize internal patterns |

**Case study:** Live walkthrough of revops agent + architecture diagram. **Red flag:** "Can you travel 50%?" → negotiate or clarify passport/visa constraints upfront.`,
  blockG: `**Assessment:** Proceed with Caution

| Signal | Finding | Weight |
|--------|---------|--------|
| Age | ~4 months since Jan 2025 publish | Neutral |
| Description | Very specific founder FDE scope | Positive |
| Comp | $160K–$270K | Positive |
| Founding team | Credible at Glean scale | Positive |

**Context:** Strategic roles stay open longer; not automatically ghost.`,
  keywords: 'forward deployed engineer, 0-to-1, production AI, agents, prompt engineering, evaluation, full-stack, C-suite, enterprise, Glean, founder, discovery',
});

// 049 SA
REPORTS.push({
  batchId: 49,
  num: '049',
  slug: 'glean-solutions-architect',
  company: 'Glean',
  role: 'Solutions Architect',
  url: 'https://job-boards.greenhouse.io/gleanwork/jobs/4508312005',
  archetype: 'AI Solutions Architect',
  score: 3.7,
  legitimacy: 'Proceed with Caution',
  verification: 'unconfirmed (batch mode)',
  pdf: 'output/cv-humayunak-glean-solutions-architect-2026-05-29.pdf',
  decision: 'Consider',
  hardStops: ['US-only remote', 'Deep networking + Java/Go requirement — second language weak'],
  softGaps: ['Pre-sales/post-sales SA career path vs builder identity', 'Posting first published Dec 2024 — long-running req'],
  strengths: ['Python, API integrations, AWS, HIPAA audit experience', 'Customer technical advisor pattern on 12+ projects', 'Security/compliance-aware RAG architecture'],
  risk: 'Medium',
  confidence: 'Medium',
  nextAction: 'Apply only if willing to pivot to customer-facing SA; emphasize Python + AWS + enterprise integrations in application.',
  note: 'Architect title but SA job — hands-on integration fit partial',
  blockA: `| Field | Value |
|-------|-------|
| Archetype | AI Solutions Architect (post-sales technical advisor) |
| Domain | Enterprise Work AI integrations |
| Function | Post-sale architecture, troubleshooting, customer enablement |
| Seniority | Senior (3+ years consulting) |
| Remote | Remote US |
| TL;DR | Customer "CTO" for Glean enterprise deployments — integration-heavy SA, not greenfield AI builder. |`,
  blockB: `| JD Requirement | CV Evidence | Gap? |
|----------------|-------------|------|
| Python + second language (Java/Go) | Python strong; Java/Go not in CV | Gap |
| API / SaaS integrations | HubSpot, Slack, Gmail, REST across SaaS | Match |
| Cloud AWS/GCP/Azure | AWS primary | Match |
| Security & audit stakeholders | HIPAA RAG, RBAC, audit logs | Strong match |
| Networking depth | Standard AWS networking — not deep on-prem | Soft gap |
| Pre/post-sales SA experience | Technical POC, not titled SA | Partial |
| Log analysis / debugging | Production delivery, CI/CD | Match |

**Gaps:** Java/Go and networking depth — mitigate with Python-first integration wins and HIPAA security story.`,
  blockC: `**Level:** Aligns with senior technical consultant.

**Sell senior without lying:** "I architected integrations and compliance paths, not slideware."

**If downleveled:** N/A.`,
  blockD: `| Factor | Finding |
|--------|---------|
| OTE | $160,000–$225,000 |
| vs target | Above target band |
| Note | Long-lived posting (Dec 2024) may indicate pipeline role |

**Sources:** Glean Greenhouse.`,
  blockE: `Lead HIPAA migration, IDP/BOAT, AWS architecture. Add Python API integration bullets. Do not claim Java/Go.`,
  blockF: `STAR: RAG vs fine-tuning for audits; IDP pipeline integration architecture; platform migration with 16 engineers.`,
  blockG: `**Assessment:** Proceed with Caution — posting age ~17 months suggests evergreen/pipeline SA hiring.

| Signal | Finding | Weight |
|--------|---------|--------|
| Age | Dec 2024 first publish | Concerning |
| Quality | Detailed technical requirements | Positive |
| Comp | Transparent OTE | Positive |`,
  keywords: 'solutions architect, Python, API integration, AWS, enterprise search, security audit, HIPAA, networking, Glean, post-sales, technical advisor',
});

// 050 Later
REPORTS.push({
  batchId: 50,
  num: '050',
  slug: 'later-domain-architect',
  company: 'Later',
  role: 'Domain Architect',
  url: 'https://job-boards.greenhouse.io/later/jobs/8366766002',
  archetype: 'AI Solutions Architect (platform) — poor fit',
  score: 2.5,
  legitimacy: 'Suspicious',
  verification: 'unconfirmed (batch mode)',
  pdf: null,
  decision: 'Skip',
  hardStops: ['10+ years with 3+ principal architecture — Humayun ~6 years, not principal platform architect', 'Rails/DDD/microservices focus — not AI product stack', 'Influencer marketing domain — not target industry'],
  softGaps: ['AWS ECS/Lambda experience transferable', 'CI/CD and observability overlap'],
  strengths: ['AWS, Docker, GitHub Actions, cross-functional delivery'],
  risk: 'Low',
  confidence: 'Medium',
  nextAction: 'Skip — stale posting and seniority mismatch. Monitor Later only if AI platform roles appear.',
  note: 'Principal platform architect — seniority & stack mismatch',
  blockA: `| Field | Value |
|-------|-------|
| Archetype | Enterprise Platform Architect (non-AI) |
| Domain | Influencer marketing / MarTech |
| Function | DDD, microservices, Rails↔Node integration |
| Seniority | Principal (10+ years) |
| Remote | Remote (generic — favorable) |
| TL;DR | Senior platform architect for Rails/Node consolidation — not AI solutions work. |`,
  blockB: `| JD Requirement | CV Evidence | Gap? |
|----------------|-------------|------|
| 10+ years, 3+ principal arch | ~6 years, no principal arch title | **Hard blocker** |
| Rails, Django, Laravel decomposition | Limited Rails depth | Gap |
| Kafka/event streams, DDD | Some integration; not architect-level DDD | Gap |
| Terraform/IaC at scale | Docker/GitHub Actions; lighter Terraform | Gap |
| AI platform | Not in JD — marketing tech | Wrong North Star |

**Gaps:** Seniority and stack are disqualifying for current positioning.`,
  blockC: `Not recommended to pursue.`,
  blockD: `| Factor | Finding |
|--------|---------|
| Range | $200,000–$230,000 OTE |
| Note | Comp attractive but role misaligned |

**Sources:** Later Greenhouse posting.`,
  blockE: `N/A — skip.`,
  blockF: `N/A`,
  blockG: `**Assessment:** Suspicious

| Signal | Finding | Weight |
|--------|---------|--------|
| Posting age | Published 2026-01-08, unchanged 5 months | Concerning |
| Quality | Detailed — could be evergreen | Neutral |
| Role fit | MarTech architect, not AI | Negative |

**Context:** May be slow-fill senior arch or deprioritized requisition.`,
  keywords: 'domain architect, DDD, microservices, Rails, Node, AWS, Terraform, Kafka, influencer marketing, Later',
});

function renderReport(r) {
  const pdfLine = r.pdf ? `**PDF:** ${r.pdf}` : '**PDF:** pending';
  const yamlScore = r.score;
  return `# Evaluation: ${r.company} — ${r.role}

**Date:** ${DATE}
**URL:** ${r.url}
**Archetype:** ${r.archetype}
**Score:** ${r.score}/5
**Legitimacy:** ${r.legitimacy}
**Verification:** ${r.verification}
${pdfLine}
**Batch ID:** ${r.batchId}

---

## Machine Summary

\`\`\`yaml
company: "${r.company}"
role: "${r.role}"
score: ${yamlScore}
legitimacy_tier: "${r.legitimacy}"
archetype: "${r.archetype}"
final_decision: "${r.decision}"
hard_stops:
${r.hardStops.map((s) => `  - "${s}"`).join('\n')}
soft_gaps:
${r.softGaps.map((s) => `  - "${s}"`).join('\n')}
top_strengths:
${r.strengths.map((s) => `  - "${s}"`).join('\n')}
risk_level: "${r.risk}"
confidence: "${r.confidence}"
next_action: "${r.nextAction}"
\`\`\`

## A) Role Summary

${r.blockA}

## B) Match with CV

${r.blockB}

## C) Level and Strategy

${r.blockC}

## D) Comp and Demand

${r.blockD}

## E) Customization Plan

${r.blockE}

## F) Interview Plan

${r.blockF}

## G) Posting Legitimacy

${r.blockG}

---

## Keywords extracted

${r.keywords}
`;
}

async function main() {
  await mkdir(resolve(ROOT, 'reports'), { recursive: true });
  await mkdir(resolve(ROOT, 'batch/tracker-additions'), { recursive: true });
  for (const r of REPORTS) {
    const path = resolve(ROOT, `reports/${r.num}-${r.slug}-${DATE}.md`);
    await writeFile(path, renderReport(r), 'utf8');
    const pdfEmoji = r.pdf ? '✅' : '❌';
    const tsv = `${r.num}\t${DATE}\t${r.company}\t${r.role}\tEvaluated\t${r.score}/5\t${pdfEmoji}\t[${r.num}](reports/${r.num}-${r.slug}-${DATE}.md)\t${r.note}\n`;
    await writeFile(resolve(ROOT, `batch/tracker-additions/${r.num}-${r.slug}.tsv`), tsv, 'utf8');
    console.log(`Wrote ${r.num} ${r.slug}`);
  }
}

main();
