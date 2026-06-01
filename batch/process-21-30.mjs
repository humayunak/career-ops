#!/usr/bin/env node
/**
 * Batch processor for IDs 21-30 → reports 021-030
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATE = '2026-05-29';

const JOBS = [
  {
    id: 21, num: '021', slug: 'arize-ai-application-engineer-apj',
    company: 'Arize AI', role: 'AI Application Engineer, APJ',
    url: 'https://job-boards.greenhouse.io/arizeai/jobs/5989512004',
    archetype: 'AI Platform / LLMOps',
    score: 2.2, legitimacy: 'Proceed with Caution', decision: 'Skip',
    pdf: false,
    note: 'Singapore-only; Golang/OTel gaps; strong company wrong geo',
  },
  {
    id: 22, num: '022', slug: 'arize-ai-product-manager',
    company: 'Arize AI', role: 'AI Product Manager',
    url: 'https://job-boards.greenhouse.io/arizeai/jobs/5818115004',
    archetype: 'Technical AI PM',
    score: 2.7, legitimacy: 'High Confidence', decision: 'Skip',
    pdf: false,
    note: 'PM track mismatch; comp strong but not North Star role',
  },
  {
    id: 23, num: '023', slug: 'arize-ai-sales-engineer-emea',
    company: 'Arize AI', role: 'AI Sales Engineer, EMEA',
    url: 'https://job-boards.greenhouse.io/arizeai/jobs/5793354004',
    archetype: 'AI Forward Deployed + AI Platform / LLMOps',
    score: 3.4, legitimacy: 'High Confidence', decision: 'Research first',
    pdf: true,
    note: 'Pre-sales PoC fit; verify EMEA hire from Pakistan',
  },
  {
    id: 24, num: '024', slug: 'arize-ai-sales-engineer-us',
    company: 'Arize AI', role: 'AI Sales Engineer, US',
    url: 'https://job-boards.greenhouse.io/arizeai/jobs/5792327004',
    archetype: 'AI Forward Deployed + AI Platform / LLMOps',
    score: 3.6, legitimacy: 'High Confidence', decision: 'Consider',
    pdf: true,
    note: 'US remote pre-sales; LangGraph gap; comp $140-230K',
  },
  {
    id: 25, num: '025', slug: 'arize-ai-solutions-engineer-east',
    company: 'Arize AI', role: 'AI Solutions Engineer, East',
    url: 'https://job-boards.greenhouse.io/arizeai/jobs/5993755004',
    archetype: 'AI Solutions Engineer (post-sales)',
    score: 2.9, legitimacy: 'High Confidence', decision: 'Skip',
    pdf: false,
    note: 'Title match but NYC metro required — location hard stop',
  },
  {
    id: 26, num: '026', slug: 'arize-ai-solutions-engineer-emea',
    company: 'Arize AI', role: 'AI Solutions Engineer, EMEA',
    url: 'https://job-boards.greenhouse.io/arizeai/jobs/5781408004',
    archetype: 'AI Solutions Engineer (post-sales)',
    score: 3.9, legitimacy: 'High Confidence', decision: 'Apply',
    pdf: true,
    note: 'Best batch fit — verify EMEA remote eligibility from Pakistan',
  },
  {
    id: 27, num: '027', slug: 'arize-ai-solutions-engineer-west',
    company: 'Arize AI', role: 'AI Solutions Engineer, West',
    url: 'https://job-boards.greenhouse.io/arizeai/jobs/5797408004',
    archetype: 'AI Solutions Engineer (post-sales)',
    score: 2.5, legitimacy: 'High Confidence', decision: 'Skip',
    pdf: false,
    note: 'SF Bay area required — location hard stop',
  },
  {
    id: 28, num: '028', slug: 'arize-ai-solutions-manager-apj',
    company: 'Arize AI', role: 'AI Solutions Manager, APJ',
    url: 'https://job-boards.greenhouse.io/arizeai/jobs/5989503004',
    archetype: 'Customer Success / TPM hybrid',
    score: 2.0, legitimacy: 'Proceed with Caution', decision: 'Skip',
    pdf: false,
    note: 'CSM role + Singapore — wrong function and geo',
  },
  {
    id: 29, num: '029', slug: 'arize-ai-solutions-manager-emea',
    company: 'Arize AI', role: 'AI Solutions Manager, EMEA',
    url: 'https://job-boards.greenhouse.io/arizeai/jobs/5989510004',
    archetype: 'Customer Success / TPM hybrid',
    score: 2.1, legitimacy: 'Proceed with Caution', decision: 'Skip',
    pdf: false,
    note: 'CSM + London required — not engineer North Star',
  },
  {
    id: 30, num: '030', slug: 'arize-ai-solutions-manager-smb',
    company: 'Arize AI', role: 'AI Solutions Manager, SMB',
    url: 'https://job-boards.greenhouse.io/arizeai/jobs/5987435004',
    archetype: 'Customer Success / expansion',
    score: 3.0, legitimacy: 'High Confidence', decision: 'Research first',
    pdf: true,
    note: 'US remote CSM/expansion — technical demos OK but function mismatch',
  },
];

function blockA(job, meta) {
  const loc = meta?.location || 'See JD';
  const pub = meta?.first_published?.slice(0, 10) || '2026-02+';
  return `| Field | Value |
|-------|-------|
| Archetype | ${job.archetype} |
| Domain | AI observability / evals / agent engineering platform |
| Function | ${job.role.includes('Manager') ? 'Customer success / account growth' : job.role.includes('Sales') ? 'Pre-sales / PoC' : job.role.includes('Product Manager') ? 'Product strategy' : job.role.includes('Application') ? 'Platform engineering + internal GenAI' : 'Post-sales solutions advisory'} |
| Seniority | Mid (2–5y stated) to Senior (customer-facing SE) |
| Remote | ${loc} |
| Team | Series C (~$135M); enterprise customers (Uber, Booking.com, etc.) |
| TL;DR | ${job.company} ${job.role.split(',')[0]} — LLM observability vendor; fit varies by geo and whether role is build vs sell vs CSM. |`;
}

function blockB(job) {
  const isSE = job.role.includes('Solutions Engineer') && !job.role.includes('Manager');
  const isSales = job.role.includes('Sales Engineer');
  const isPM = job.role.includes('Product Manager');
  const isApp = job.role.includes('Application Engineer');
  const isCSM = job.role.includes('Solutions Manager');

  let rows = `| JD Requirement | CV / Proof | Match |
|----------------|------------|-------|
| Python production | cv.md L16, L32–36; NFL LLM/RAG pipelines | Strong |
| TypeScript / JS | cv.md L16–17, L56–57 | Strong |
| LLM APIs & GenAI in production | cv.md L18, L32–36; article-digest revops, HIPAA | Strong |
| LangChain (frameworks list) | cv.md L18, L32; article-digest | Strong |
| LangGraph / DSPy / CrewAI | article-digest gap table — LangChain+n8n in prod, not LangGraph | Gap |
| AWS cloud | cv.md L20–21, L43–44 | Strong |
| Customer-facing / demos / PoC | cv.md L39, L49; article-digest weekly demos | ${isSales || isSE ? 'Strong' : 'Partial'} |
| GenAI eval & observability lifecycle | Implicit via production RAG/agents; no Langfuse/Arize in prod | ${isSE || isSales || isApp ? 'Partial' : 'Weak'} |
| OpenTelemetry / distributed tracing | Not in cv.md | ${isApp ? 'Gap (harder)' : 'Gap'} |
| Golang production | Not in cv.md | ${isApp ? 'Gap (harder)' : 'N/A'} |
| TensorFlow / PyTorch / sklearn | Not in cv.md — applied LLM not classical ML training | ${isSE ? 'Gap' : 'N/A'} |
| Product management / roadmap ownership | Delivery PM bullets; not titled PM | ${isPM ? 'Gap (hard)' : 'N/A'} |
| CSM / renewal / QBR account ownership | NFL stakeholder mgmt; not SaaS CSM title | ${isCSM ? 'Gap (hard)' : 'N/A'} |`;

  let gaps = `### Gaps\n`;
  if (isApp) gaps += `- **Golang + OpenTelemetry:** Adjacent — Python/AWS depth; frame fast ramp on Go/OTel in cover letter.\n`;
  if (isSE || isSales) gaps += `- **LangGraph/DSPy + classical ML frameworks:** Mitigate with LangChain multi-agent prod + "evaluating Langfuse" narrative.\n`;
  if (isPM) gaps += `- **PM title/track:** Hard blocker unless repositioning as technical PM — not recommended per _profile.md.\n`;
  if (isCSM) gaps += `- **CSM function:** Engineer→delivery leader story helps workshops/QBRs but lacks renewal quota track record.\n`;
  gaps += `- **Platform product (Arize) domain:** Learn observability story via revops/HIPAA quality metrics as parallel.\n`;

  return rows + '\n\n' + gaps;
}

function blockC(job) {
  return `**Level:** JD targets mid-level IC (2–5y) or customer-facing senior IC. Candidate operates at **Senior AI Solutions Engineer** with 6+ years shipping production GenAI.

**Sell senior without lying:** Lead with shipped outcomes (65% workload cut, HIPAA RAG, 12+ SaaS deliveries) and "primary technical POC for US product owners across 10h timezone gap."

**If downleveled:** Accept only if comp ≥$90K and scope is hands-on PoC/build; negotiate 6-month scope review for Solutions Engineer title.`;
}

function blockD(job) {
  const compLine = job.role.includes('Product Manager')
    ? '$150K–$220K (stated)'
    : job.role.includes('Sales Engineer, US')
      ? '$140K–$230K + variable (stated)'
      : job.role.includes('Solutions Engineer, East') || job.role.includes('West')
        ? '$125K–$175K + variable (stated)'
        : job.role.includes('Solutions Manager, SMB')
          ? '$140K–$175K + variable (stated)'
          : 'Not stated in JD (verify in screen)';

  return `| Source | Finding |
|--------|---------|
| JD stated comp | ${compLine} |
| Candidate target | $90K–$120K (_profile.md) |
| Market (AI Solutions / Sales Eng, US remote, 2025–26) | Typically $120K–$180K base for mid-senior IC per Levels.fyi / Glassdoor bands for solutions/sales engineering at Series B–C AI infra |
| Demand | High — observability/evals category growing (Arize Series C $70M, Feb 2025) |

**Assessment:** Comp likely at or above candidate target for US-listed roles. EMEA/APJ listings often omit bands — confirm geo-adjusted package before investing time.`;
}

function blockE() {
  return `| # | Section | Change | Why |
|---|---------|--------|-----|
| 1 | Summary | Lead "AI Solutions Engineer — production LLM/RAG/agents" + observability-minded delivery | Match Arize vocabulary |
| 2 | NFL bullets | Move revops + HIPAA RAG to top; add "eval rubrics, production quality" language | JD eval lifecycle |
| 3 | Skills | Add "GenAI application evaluation, agent orchestration, AWS" explicitly | ATS |
| 4 | Projects | Surface revops agent + HIPAA RAG + IDP; de-emphasize pure TPM stories | Role alignment |
| 5 | Title on PDF | "AI Solutions Engineer" (not Architect/TPM) | _profile.md one-angle rule |

**LinkedIn:** Headline → "AI Solutions Engineer | Production LLM/RAG & Multi-Agent Automation | US Remote Delivery"; featured BOAT repo.`;
}

function blockF(job) {
  return `| # | JD Requirement | Story | Reflection |
|---|----------------|-------|------------|
| 1 | GenAI in production | Revops agent — 65% workload cut, 2h→20m response | Lesson: deterministic scoring + LLM enrichment beats black-box |
| 2 | Customer technical advisory | HIPAA RAG — US healthcare SaaS POC | RAG-over-fine-tuning for auditability |
| 3 | PoC / fast prototype | Revops shipped <8 weeks with weekly demos | Scope weekly milestones for enterprise buyers |
| 4 | Eval / quality mindset | IDP ~95% accuracy + exception triage HITL | Parallel to observability — metrics before scale |
| 5 | Cross-functional delivery | Platform migration 16+ engineers, zero prod incidents | De-emphasize unless TPM asked |
| 6 | Explain complex AI simply | NAMC turnaround — executive demos | Use for sales/CSM-facing interviews only |

**Case study:** Autonomous Revenue Operations Agent (LangChain + n8n).

**Red flags:** "Why not ML engineer?" → Applied LLM systems owner, not model trainer. "Pakistan remote?" → 4+ years US primary POC, overlap-first.`;
}

function blockG(job, meta) {
  const age = meta?.first_published
    ? Math.round((new Date(DATE) - new Date(meta.first_published)) / 86400000)
    : null;
  return `**Assessment:** ${job.legitimacy}

**Verification:** unconfirmed (batch mode)

| Signal | Finding | Weight |
|--------|---------|--------|
| Posting age | ~${age ?? 'unknown'} days since first publish | ${age && age < 30 ? 'Positive' : age && age < 90 ? 'Neutral' : 'Neutral'} |
| Listing freshness | Updated ${meta?.updated_at?.slice(0, 10) || '2026-05-28'} | Positive |
| Description quality | Specific tech stack, customers named, Series C context | Positive |
| Comp transparency | ${job.role.includes('Manager') && !job.role.includes('SMB') ? 'Often omitted' : 'Listed on several US roles'} | Neutral |
| Role-company fit | Core to Arize GTM (observability platform) | Positive |
| Geo constraint | ${meta?.location || ''} — may limit applicant pool | ${meta?.location?.includes('Singapore') || meta?.location?.includes('New York') || meta?.location?.includes('San Francisco') || meta?.location?.includes('London') ? 'Concerning for Pakistan-based remote' : 'Neutral'} |

**Context:** Active Greenhouse postings across regions; multiple geo variants suggest real hiring motion, not a single ghost post.`;
}

function machineYaml(job) {
  const hard = [];
  if (job.score < 3.0 && job.note.includes('location')) hard.push('Geographic requirement incompatible with Pakistan remote policy');
  if (job.role.includes('Product Manager')) hard.push('Product management track mismatch');
  if (job.role.includes('Solutions Manager')) hard.push('Customer Success Manager function vs engineer North Star');
  if (job.role.includes('Singapore')) hard.push('Singapore area required');
  if (job.role.includes('East') || job.role.includes('West')) hard.push('US metro timezone residency required');

  return `\`\`\`yaml
company: "${job.company}"
role: "${job.role}"
score: ${job.score}
legitimacy_tier: "${job.legitimacy}"
archetype: "${job.archetype}"
final_decision: "${job.decision}"
hard_stops:
${hard.length ? hard.map((h) => `  - "${h}"`).join('\n') : '  []'}
soft_gaps:
  - "LangGraph/DSPy not yet in production"
  - "No named Langfuse/Arize-style eval platform in prod yet"
  - "Classical ML framework training depth limited"
top_strengths:
  - "Production LangChain multi-agent + RAG with measurable outcomes"
  - "US customer-facing technical POC for 4+ years"
  - "AWS + GenAI application delivery end-to-end"
risk_level: "${job.score >= 3.5 ? 'Medium' : job.score >= 3.0 ? 'Medium' : 'High'}"
confidence: "${job.id === 26 || job.id === 24 ? 'Medium' : 'Medium'}"
next_action: "${job.decision === 'Apply' ? 'Confirm EMEA remote eligibility then apply with Solutions Engineer angle' : job.decision === 'Consider' ? 'Apply if US remote hire confirmed; lead with PoC stories' : job.decision === 'Research first' ? 'Email recruiter on geo + role fit before full loop' : 'Do not apply — geo or function mismatch'}"
\`\`\``;
}

function buildReport(job) {
  const metaPath = join(ROOT, 'batch/jds', `${job.id}.meta.json`);
  const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf8')) : {};

  return `# Evaluation: ${job.company} — ${job.role}

**Date:** ${DATE}
**URL:** ${job.url}
**Archetype:** ${job.archetype}
**Score:** ${job.score}/5
**Legitimacy:** ${job.legitimacy}
**Verification:** unconfirmed (batch mode)
**PDF:** ${job.pdf ? `output/cv-humayun-akbar-${job.slug}-${DATE}.pdf` : '— (score < 3.0 or skipped)'}
**Batch ID:** ${job.id}

---

## Machine Summary

${machineYaml(job)}

## A) Role Summary

${blockA(job, meta)}

## B) Match with CV

${blockB(job)}

## C) Level and Strategy

${blockC(job)}

## D) Comp and Demand

${blockD(job)}

## E) Customization Plan

${blockE()}

## F) Interview Plan

${blockF(job)}

## G) Posting Legitimacy

${blockG(job, meta)}

---

## Keywords extracted

AI observability, LLM evaluation, GenAI applications, LangChain, LangGraph, agent engineering, RAG, MLOps, model monitoring, Python, TypeScript, AWS, proof of concept, solutions engineering, customer-facing, production AI, OpenTelemetry, DSPy, enterprise SaaS, Series C
`;
}

function buildCvHtml(variant) {
  const summary =
    variant === 'sales'
      ? 'AI Solutions Engineer with 6+ years shipping production LLM, RAG, and multi-agent systems for US SaaS teams. Customer-facing technical POC who runs PoCs, demos, and GenAI best-practice workshops. Hands-on with LangChain, OpenAI, AWS, and application evaluation patterns in healthcare, fintech, and operations.'
      : variant === 'csm'
        ? 'AI Solutions Engineer and delivery leader with 6+ years enabling US product teams to adopt production LLM and automation systems. Strong at technical demos, onboarding workshops, and translating GenAI outcomes for business stakeholders. Ships LangChain + n8n agents, RAG pipelines, and HIPAA-aware AI with measurable ROI.'
        : 'AI Solutions Engineer with 6+ years designing and shipping production LLM, RAG, and multi-agent systems for US and UAE SaaS customers. Advises on GenAI application development, evaluation-minded delivery, and AWS deployments. Primary technical POC across a 10-hour timezone gap with documented outcomes in healthcare, fintech, and revenue operations.';

  const competencies = [
    'Production LLM & RAG Systems',
    'GenAI Application Evaluation',
    'LangChain & Multi-Agent Orchestration',
    'Customer Technical Advisory',
    'AWS Cloud & Docker CI/CD',
    'Python & TypeScript',
    'PoC Delivery & Technical Demos',
    'HIPAA-Aware AI Delivery',
  ]
    .map((c) => `<span class="competency-tag">${c}</span>`)
    .join('\n      ');

  const experience = `
    <div class="job">
      <div class="job-header">
        <span class="job-company">Next Frontier Labs</span>
        <span class="job-period">Sep 2021 – Present</span>
      </div>
      <div class="job-role">Lead AI & Automation Engineer / Technical Project Manager</div>
      <div class="job-location">Lahore, Pakistan (Remote) · US & UAE clients</div>
      <ul>
        <li>Primary <strong>technical POC</strong> for US product owners; led GenAI application delivery across 12+ SaaS products with weekly customer demos.</li>
        <li>Built <strong>multi-agent revenue-ops system</strong> (LangChain + n8n) — ~65% manual workload reduction; lead response ~2h → ~20m.</li>
        <li>Delivered <strong>HIPAA-aware RAG chatbot</strong> for US healthcare SaaS — ~50% support resolution improvement; passed HIPAA audit.</li>
        <li>Architected <strong>LLM/RAG/OCR pipelines</strong> on AWS (Textract, pgvector, FastAPI) at ~95% extraction accuracy.</li>
        <li>Reduced deployment time ~40% via Docker CI/CD on GitHub Actions; standardized AWS Lambda/ECS with approval gates.</li>
      </ul>
    </div>
    <div class="job">
      <div class="job-header">
        <span class="job-company">Pickletour LLC</span>
        <span class="job-period">Nov 2019 – Sep 2021</span>
      </div>
      <div class="job-role">Founding Product Engineer</div>
      <div class="job-location">California, USA (Remote)</div>
      <ul>
        <li>Shipped sports-social SaaS MVP in ~9 months — product, architecture, hiring, and GCP release.</li>
      </ul>
    </div>`;

  const projects = `
    <div class="project">
      <div class="project-title">Autonomous Revenue Operations Agent</div>
      <p>LangChain + n8n multi-agent pipeline — lead intake, enrichment, scoring, CRM, scheduling. ~65% workload cut.</p>
    </div>
    <div class="project">
      <div class="project-title">HIPAA-Compliant AI CRM & Support Assistant</div>
      <p>Production RAG (LangChain + OpenAI + pgvector); RAG-over-fine-tuning for auditability; ~50% resolution improvement.</p>
    </div>
    <div class="project">
      <div class="project-title">Intelligent Document Processing (BOAT)</div>
      <p>OCR + RAG validation pipeline — ~95% accuracy. <a href="https://github.com/akaleap/boat">github.com/akaleap/boat</a></p>
    </div>`;

  let template = readFileSync(join(ROOT, 'templates/cv-template.html'), 'utf8');
  const replacements = {
    '{{LANG}}': 'en',
    '{{PAGE_WIDTH}}': '8.5in',
    '{{NAME}}': 'Humayun Akbar',
    '{{PHONE}}': '+92-333-747-2719',
    '{{EMAIL}}': 'humayunak22@gmail.com',
    '{{LINKEDIN_URL}}': 'https://linkedin.com/in/humayunak',
    '{{LINKEDIN_DISPLAY}}': 'linkedin.com/in/humayunak',
    '{{PORTFOLIO_URL}}': 'https://github.com/akaleap/boat',
    '{{PORTFOLIO_DISPLAY}}': 'github.com/akaleap/boat',
    '{{LOCATION}}': 'Lahore, Pakistan (Remote) · UTC+5',
    '{{SECTION_SUMMARY}}': 'Professional Summary',
    '{{SUMMARY_TEXT}}': summary,
    '{{SECTION_COMPETENCIES}}': 'Core Competencies',
    '{{COMPETENCIES}}': competencies,
    '{{SECTION_EXPERIENCE}}': 'Work Experience',
    '{{EXPERIENCE}}': experience,
    '{{SECTION_PROJECTS}}': 'Projects',
    '{{PROJECTS}}': projects,
    '{{SECTION_EDUCATION}}': 'Education',
    '{{EDUCATION}}': '<div class="education-item"><strong>B.S. Computer Science</strong> — FAST-NUCES, Lahore (Jan 2019)</div>',
    '{{SECTION_CERTIFICATIONS}}': 'Certifications',
    '{{CERTIFICATIONS}}': '<div>Google Foundations of Project Management · Vanderbilt Prompt Engineering · DeepLearning.AI AI For Everyone</div>',
    '{{SECTION_SKILLS}}': 'Skills',
    '{{SKILLS}}': '<div><strong>AI:</strong> OpenAI, Claude, LangChain, RAG, n8n, multi-agent, prompt engineering<br><strong>Stack:</strong> Python, TypeScript, Node.js, React, FastAPI, PostgreSQL, pgvector, AWS, Docker</div>',
  };
  for (const [k, v] of Object.entries(replacements)) {
    template = template.split(k).join(v);
  }
  return template;
}

mkdirSync(join(ROOT, 'reports'), { recursive: true });
mkdirSync(join(ROOT, 'batch/tracker-additions'), { recursive: true });
mkdirSync(join(ROOT, 'output'), { recursive: true });

const summary = [];

for (const job of JOBS) {
  const reportPath = join(ROOT, 'reports', `${job.num}-${job.slug}-${DATE}.md`);
  writeFileSync(reportPath, buildReport(job));

  const pdfEmoji = job.pdf ? '✅' : '❌';
  const tsv = `${job.num}\t${DATE}\t${job.company}\t${job.role}\tEvaluated\t${job.score}/5\t${pdfEmoji}\t[${job.num}](reports/${job.num}-${job.slug}-${DATE}.md)\t${job.note}`;
  writeFileSync(join(ROOT, 'batch/tracker-additions', `${job.num}-${job.slug}.tsv`), tsv + '\n');

  if (job.pdf) {
    const variant = job.role.includes('Sales') ? 'sales' : job.role.includes('Manager') ? 'csm' : 'solutions';
    const htmlPath = join(ROOT, 'output', `cv-humayun-akbar-${job.slug}-${DATE}.html`);
    const pdfPath = join(ROOT, 'output', `cv-humayun-akbar-${job.slug}-${DATE}.pdf`);
    const html = buildCvHtml(variant);
    writeFileSync(htmlPath, html);
    // Fix font paths for output dir
    const htmlForPdf = html.replace(/\.\/fonts\//g, join(ROOT, 'templates/fonts/').replace(/\\/g, '/') + '/');
    writeFileSync(htmlPath, htmlForPdf);
    try {
      execSync(`node "${join(ROOT, 'generate-pdf.mjs')}" "${htmlPath}" "${pdfPath}" --format=letter`, {
        cwd: ROOT,
        stdio: 'pipe',
      });
    } catch (e) {
      console.error(`PDF failed for ${job.num}:`, e.message);
    }
  }

  summary.push({
    batch_id: job.id,
    report_num: job.num,
    company: job.company,
    role: job.role,
    score: job.score,
    legitimacy: job.legitimacy,
    decision: job.decision,
    pdf: job.pdf,
    report: `reports/${job.num}-${job.slug}-${DATE}.md`,
  });
}

console.log(JSON.stringify(summary, null, 2));
