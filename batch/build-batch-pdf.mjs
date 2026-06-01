#!/usr/bin/env node
/** One-off builder for batch 067/068 tailored CVs */
import { readFile, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const templatePath = resolve(root, 'templates/cv-template.html');

const profiles = {
  'hightouch-software-engineer-ai-agents': {
    summary:
      'Product-minded AI engineer with 6+ years shipping production SaaS and LLM agent systems for US product teams. Builds end-to-end production pipelines — multi-agent orchestration (LangChain + n8n), RAG, context engineering, and backend APIs — with measurable outcomes. Primary technical POC across 10-hour timezone gap.',
    competencies: [
      'Production LLM Agents',
      'Multi-Agent Orchestration',
      'LangChain & OpenAI',
      'RAG Pipelines',
      'Context Engineering',
      'Python & FastAPI',
      'PostgreSQL & APIs',
      'AWS & Docker CI/CD',
    ],
    nflBullets: [
      'Architected <strong>production LLM agent pipelines</strong> and RAG systems across 8+ SaaS platforms — OpenAI, LangChain, pgvector, AWS Textract.',
      'Built a <strong>multi-agent revenue-ops system</strong> (LangChain + n8n): ~65% manual workload reduction; lead response ~2h to ~20m with tiered human-in-the-loop.',
      'Delivered HIPAA-aware <strong>RAG chatbot</strong> — ~50% support resolution improvement; chose RAG over fine-tuning for auditability and day-zero updates.',
      'Owned end-to-end delivery as primary technical POC for US product owners across 12+ projects.',
    ],
    projects: [
      {
        title: 'Autonomous Revenue Operations Agent',
        badge: 'Agentic',
        desc: 'Multi-agent pipeline (LangChain + n8n): lead intake, enrichment, scoring, CRM, scheduling. ~65% workload cut; ~2h to ~20m response.',
      },
      {
        title: 'HIPAA-Compliant AI CRM & Support Assistant',
        badge: 'RAG',
        desc: 'Production RAG (LangChain + OpenAI + pgvector). ~50% resolution improvement; passed HIPAA audit.',
      },
      {
        title: 'Intelligent Document Processing Pipeline',
        badge: 'Data + RAG',
        desc: 'OCR + RAG validation at ~95% accuracy; ~70% faster than manual. FastAPI, pgvector, AWS.',
      },
    ],
  },
  'hightouch-solutions-engineer-mid-market': {
    summary:
      'AI Solutions Engineer with 6+ years of customer-facing technical delivery for US SaaS teams. Leads technical discovery, proof-of-concept execution, and production integrations — LLM agents, RAG, data pipelines, and APIs — with clear business outcomes. Trusted technical advisor across engineering and product stakeholders.',
    competencies: [
      'Technical Discovery',
      'Proof of Concept Delivery',
      'LLM & RAG Integrations',
      'API & Data Integrations',
      'Stakeholder Communication',
      'Python & JavaScript',
      'PostgreSQL & AWS',
      'Enterprise SaaS Delivery',
    ],
    nflBullets: [
      'Primary <strong>technical POC</strong> for US product owners across 12+ SaaS projects — discovery, scoping, weekly demos, production delivery.',
      'Led <strong>proof-of-concept to production</strong> for multi-agent automation (LangChain + n8n) — ~65% workload reduction; retired 3 manual tools.',
      'Architected integrations across CRM, email, calendar, Slack, and data stores for enterprise workflows.',
      'Improved delivery velocity ~30% via AI-assisted Agile automation (n8n, GitHub Actions, Slack).',
    ],
    projects: [
      {
        title: 'Autonomous Revenue Operations Agent',
        badge: 'POC → Prod',
        desc: 'Customer-facing agent POC shipped in <8 weeks with weekly demos; full production automation for tier-1 leads.',
      },
      {
        title: 'HIPAA-Compliant AI CRM & Support Assistant',
        badge: 'Enterprise',
        desc: 'RAG assistant with compliance constraints; 16+ engineer migration with zero prod incidents in cutover phase.',
      },
      {
        title: 'Intelligent Document Processing Pipeline',
        badge: 'Data',
        desc: 'OCR + RAG pipeline replacing manual document ops — ~95% accuracy, executive-ready metrics.',
      },
    ],
  },
};

function buildExperience(bullets) {
  return `<div class="job avoid-break">
    <div class="job-header">
      <span class="job-company">Next Frontier Labs</span>
      <span class="job-period">Sep 2021 – Present</span>
    </div>
    <div class="job-role">Lead AI & Automation Engineer / Technical Project Manager</div>
    <div class="job-location">Lahore, Pakistan (Remote) · US clients</div>
    <ul>${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
  </div>
  <div class="job avoid-break">
    <div class="job-header">
      <span class="job-company">Pickletour LLC</span>
      <span class="job-period">Nov 2019 – Sep 2021</span>
    </div>
    <div class="job-role">Founding Product Engineer</div>
    <div class="job-location">California, USA (Remote)</div>
    <ul>
      <li>Shipped sports-social SaaS from concept to live MVP in ~9 months — product, architecture, and GCP release.</li>
    </ul>
  </div>`;
}

function buildProjects(projects) {
  return projects
    .map(
      (p) => `<div class="project avoid-break">
    <div class="project-title">${p.title} <span class="project-badge">${p.badge}</span></div>
    <div class="project-desc">${p.desc}</div>
  </div>`
    )
    .join('\n');
}

async function build(slug, outPdfName) {
  let html = await readFile(templatePath, 'utf8');
  const p = profiles[slug];
  const tags = p.competencies
    .map((c) => `<span class="competency-tag">${c}</span>`)
    .join('\n      ');

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
    '{{LOCATION}}': 'Lahore, Pakistan (Remote)',
    '{{SECTION_SUMMARY}}': 'Professional Summary',
    '{{SUMMARY_TEXT}}': p.summary,
    '{{SECTION_COMPETENCIES}}': 'Core Competencies',
    '{{COMPETENCIES}}': tags,
    '{{SECTION_EXPERIENCE}}': 'Work Experience',
    '{{EXPERIENCE}}': buildExperience(p.nflBullets),
    '{{SECTION_PROJECTS}}': 'Projects',
    '{{PROJECTS}}': buildProjects(p.projects),
    '{{SECTION_EDUCATION}}': 'Education',
    '{{EDUCATION}}': `<div class="education-entry"><strong>Bachelor of Computer Science (BSCS)</strong> — FAST-NUCES, Lahore · Jan 2019</div>`,
    '{{SECTION_CERTIFICATIONS}}': 'Certifications',
    '{{CERTIFICATIONS}}': `<div class="cert-entry">Google Foundations of Project Management · Vanderbilt Prompt Engineering · DeepLearning.AI AI For Everyone</div>`,
    '{{SECTION_SKILLS}}': 'Skills',
    '{{SKILLS}}': `<div class="skills-text"><strong>Languages:</strong> Python, TypeScript, JavaScript, Node.js, SQL · <strong>AI:</strong> OpenAI, Claude, LangChain, RAG, n8n, multi-agent, prompt/context engineering · <strong>Cloud:</strong> AWS (Lambda, ECS, S3, Textract), Docker, GitHub Actions, PostgreSQL, pgvector</div>`,
  };

  for (const [k, v] of Object.entries(replacements)) {
    html = html.split(k).join(v);
  }

  const htmlPath = resolve(root, 'templates', `cv-temp-${slug}.html`);
  const pdfPath = resolve(root, 'output', outPdfName);
  await writeFile(htmlPath, html);
  execSync(`node generate-pdf.mjs "${htmlPath}" "${pdfPath}" --format=letter`, {
    cwd: root,
    stdio: 'inherit',
  });
  return pdfPath;
}

const slug067 = 'hightouch-software-engineer-ai-agents';
const slug068 = 'hightouch-solutions-engineer-mid-market';

await build(slug067, 'cv-candidate-hightouch-software-engineer-ai-agents-2026-05-29.pdf');
await build(slug068, 'cv-candidate-hightouch-solutions-engineer-mid-market-2026-05-29.pdf');
console.log('PDFs generated OK');
