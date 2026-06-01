#!/usr/bin/env node
/**
 * Tailored CV PDFs for batch reports 041-050 (score >= 3.0 only).
 */
import { readFile, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATE = '2026-05-29';

const VARIANTS = {
  'glean-ai-outcomes': {
    title: 'AI Solutions Engineer',
    summary:
      'AI Solutions Engineer with 6+ years shipping production LLM, RAG, and multi-agent systems for US enterprise SaaS teams. Proven at turning executive use cases into measurable outcomes—~65% workload reduction on revenue ops automation, ~50% support resolution improvement on HIPAA RAG. Hands-on with OpenAI, Claude, LangChain, and prompt-driven agent design; partners with engineers and executives without being off the critical path for delivery.',
    competencies: [
      'LLM & agent outcomes',
      'Prompt engineering',
      'Customer discovery',
      'Success metrics & pilots',
      'OpenAI / Claude',
      'LangChain & n8n',
      'Enterprise SaaS delivery',
      'Executive stakeholder communication',
    ],
    projectOrder: ['revops', 'hipaa', 'recruitment', 'idp'],
  },
  'glean-ai-success': {
    title: 'AI Solutions Engineer',
    summary:
      'Technical delivery leader with 6+ years implementing enterprise SaaS and AI platforms for US clients—end-to-end from kickoff through production. Owns deployments on AWS (Lambda, ECS, S3), Agile/DevOps CI/CD, SSO-ready architectures, and connector integrations. Primary technical POC across 12+ projects; excels at joint success plans, escalation management, and measurable adoption outcomes.',
    competencies: [
      'Technical customer success',
      'AWS cloud deployment',
      'Agile / DevOps',
      'SSO & integrations',
      'Program management',
      'Enterprise SaaS',
      'AI platform rollout',
      'Cross-functional delivery',
    ],
    projectOrder: ['hipaa', 'revops', 'idp', 'internal'],
  },
  'glean-fde': {
    title: 'AI Solutions Engineer',
    summary:
      'Founding-minded AI engineer who ships 0-to-1 products in ambiguous environments—concept to production MVP in ~9 months at Pickletour, multi-agent revenue automation in under 8 weeks for US clients. Production AI across LangChain, OpenAI, RAG, and n8n with real business metrics. Trusted technical partner to executives; discovers problems, builds full-stack solutions, and scales what works with core engineering teams.',
    competencies: [
      '0-to-1 product builds',
      'Forward deployed delivery',
      'Production AI / agents',
      'RAG & prompt engineering',
      'Full-stack (Python/TS)',
      'Executive communication',
      'LangChain & n8n',
      'Enterprise integrations',
    ],
    projectOrder: ['revops', 'hipaa', 'idp', 'pickletour'],
  },
  'glean-solutions-architect': {
    title: 'AI Solutions Engineer',
    summary:
      'AI Solutions Engineer with deep hands-on integration experience—Python, FastAPI, Node.js, AWS, Docker, and enterprise API patterns across 12+ SaaS deliveries. Designs HIPAA-aware RAG architectures, custom data connectors, and auditable deploy pipelines. Primary technical advisor to US product owners; bridges security, audit, and engineering stakeholders with shipped production systems.',
    competencies: [
      'Solutions architecture',
      'Python & API integration',
      'AWS (Lambda, ECS, S3)',
      'Security & HIPAA-aware design',
      'RAG / LLM systems',
      'Technical troubleshooting',
      'Enterprise SaaS',
      'Customer technical advisory',
    ],
    projectOrder: ['hipaa', 'idp', 'revops', 'boat'],
  },
};

const PROJECTS = {
  revops: {
    title: 'Autonomous Revenue Operations Agent',
    badge: 'Lead',
    desc: 'Multi-agent pipeline (LangChain + n8n) for lead intake, enrichment, scoring, CRM updates, and scheduling. ~65% manual workload reduction; lead response ~2h to ~20m.',
    tech: 'LangChain, OpenAI, n8n, PostgreSQL, HubSpot, Slack',
  },
  hipaa: {
    title: 'HIPAA-Compliant AI CRM & Support Assistant',
    badge: 'Healthcare',
    desc: 'RAG chatbot on clinical/admin data; platform migration with 16+ engineers. ~50% support resolution improvement; passed HIPAA audit.',
    tech: 'React, Node.js, OpenAI, LangChain, PostgreSQL, AWS ECS',
  },
  idp: {
    title: 'Intelligent Document Processing Pipeline',
    badge: 'IDP',
    desc: 'OCR + NLP + RAG for PDFs and medical images. ~95% extraction accuracy; ~70% processing time reduction.',
    tech: 'Python, Tesseract, AWS Textract, LangChain, pgvector, FastAPI',
  },
  recruitment: {
    title: 'AI Recruitment Screening Pipeline',
    badge: 'HR Tech',
    desc: 'LangChain + embeddings for parse, score, and rank candidates. ~75% screening time reduction with explainable rubric.',
    tech: 'LangChain, OpenAI, PostgreSQL',
  },
  internal: {
    title: 'Internal AI + Agile Workflow Automation',
    badge: 'Ops',
    desc: 'n8n + OpenAI + Whisper with Slack, Asana, GitHub Actions across 8+ products. ~30% feature delivery speed improvement.',
    tech: 'n8n, OpenAI, Whisper, Slack, GitHub Actions',
  },
  boat: {
    title: 'BOAT — Document Intelligence (OSS)',
    badge: 'OSS',
    desc: 'Open-source IDP with RAG validation layer and admin triage console. github.com/akaleap/boat',
    tech: 'Python, FastAPI, pgvector, AWS Lambda',
  },
  pickletour: {
    title: 'Pickletour — Founding Product MVP',
    badge: '0-to-1',
    desc: 'Sports-social SaaS from concept to live MVP in ~9 months; full-system architecture on Google Cloud.',
    tech: 'GCP, React, Node.js, mobile',
  },
};

function tag(text) {
  return `<span class="competency-tag">${text}</span>`;
}

function projectHtml(key) {
  const p = PROJECTS[key];
  return `<div class="project avoid-break">
    <div class="project-title">${p.title}<span class="project-badge">${p.badge}</span></div>
    <div class="project-desc">${p.desc}</div>
    <div class="project-tech">${p.tech}</div>
  </div>`;
}

async function buildPdf(slug, variantKey) {
  const v = VARIANTS[variantKey];
  let template = await readFile(resolve(ROOT, 'templates/cv-template.html'), 'utf8');
  const projectsHtml = v.projectOrder.map(projectHtml).join('\n');

  const experience = `
  <div class="job avoid-break">
    <div class="job-header">
      <span class="job-company">Next Frontier Labs</span>
      <span class="job-period">Sep 2021 – Present</span>
    </div>
    <div class="job-role">Lead AI & Automation Engineer / Technical Project Manager</div>
    <div class="job-location">Lahore, Pakistan (Remote) · US clients</div>
    <ul>
      <li>Architected <strong>LLM, RAG, and OCR pipelines</strong> across 8+ SaaS platforms; primary technical POC for US product owners (10h timezone gap).</li>
      <li>Built <strong>multi-agent revenue-ops system</strong> (LangChain + n8n)—~65% manual workload cut; lead response ~2h to ~20m.</li>
      <li>Delivered <strong>HIPAA-aware RAG chatbot</strong>—~50% support resolution improvement; chose RAG over fine-tuning for auditability.</li>
      <li>Reduced deployment time ~40% with <strong>Docker CI/CD</strong> on GitHub Actions; standardized AWS (Lambda, IAM, ECS).</li>
    </ul>
  </div>
  <div class="job avoid-break">
    <div class="job-header">
      <span class="job-company">Pickletour LLC</span>
      <span class="job-period">Nov 2019 – Sep 2021</span>
    </div>
    <div class="job-role">Founding Product Engineer</div>
    <div class="job-location">California, USA (Remote)</div>
    <ul>
      <li>Shipped sports-social SaaS from <strong>concept to live MVP in ~9 months</strong>—product, architecture, hiring, GCP release.</li>
      <li>Defined full-system architecture for tournament management; established engineering processes from zero.</li>
    </ul>
  </div>`;

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
    '{{SUMMARY_TEXT}}': v.summary,
    '{{SECTION_COMPETENCIES}}': 'Core Competencies',
    '{{COMPETENCIES}}': v.competencies.map(tag).join('\n      '),
    '{{SECTION_EXPERIENCE}}': 'Work Experience',
    '{{EXPERIENCE}}': experience,
    '{{SECTION_PROJECTS}}': 'Projects',
    '{{PROJECTS}}': projectsHtml,
    '{{SECTION_EDUCATION}}': 'Education',
    '{{EDUCATION}}': `<div class="edu-item avoid-break">
      <div class="edu-header">
        <span class="edu-title">Bachelor of Computer Science (BSCS)</span>
        <span class="edu-year">Jan 2019</span>
      </div>
      <div class="edu-desc"><span class="edu-org">FAST-NUCES</span>, Lahore · TA for AI & Data Structures</div>
    </div>`,
    '{{SECTION_CERTIFICATIONS}}': 'Certifications',
    '{{CERTIFICATIONS}}': `
    <div class="cert-item avoid-break"><span class="cert-title">Google Foundations of Project Management</span><span class="cert-org">Google</span><span class="cert-year"></span></div>
    <div class="cert-item avoid-break"><span class="cert-title">Prompt Engineering for Developers</span><span class="cert-org">Vanderbilt</span><span class="cert-year"></span></div>
    <div class="cert-item avoid-break"><span class="cert-title">AI For Everyone</span><span class="cert-org">DeepLearning.AI</span><span class="cert-year"></span></div>`,
    '{{SECTION_SKILLS}}': 'Skills',
    '{{SKILLS}}': `<div class="skills-grid">
      <span class="skill-item"><span class="skill-category">AI:</span> OpenAI, Claude, LangChain, RAG, n8n, prompt engineering, multi-agent</span>
      <span class="skill-item"><span class="skill-category">Languages:</span> Python, TypeScript, JavaScript, Node.js, SQL</span>
      <span class="skill-item"><span class="skill-category">Cloud:</span> AWS (Lambda, ECS, S3, Textract), Docker, GitHub Actions, PostgreSQL, pgvector</span>
    </div>`,
  };

  for (const [k, val] of Object.entries(replacements)) {
    template = template.split(k).join(val);
  }

  const htmlPath = resolve(ROOT, `output/cv-humayunak-${slug}-${DATE}.html`);
  const pdfPath = resolve(ROOT, `output/cv-humayunak-${slug}-${DATE}.pdf`);
  await writeFile(htmlPath, template);
  execSync(`node generate-pdf.mjs "${htmlPath}" "${pdfPath}" --format=letter`, {
    cwd: ROOT,
    stdio: 'inherit',
  });
  return pdfPath;
}

const jobs = [
  ['glean-ai-outcomes-central', 'glean-ai-outcomes'],
  ['glean-ai-outcomes-east', 'glean-ai-outcomes'],
  ['glean-ai-outcomes-west', 'glean-ai-outcomes'],
  ['glean-ai-success-central', 'glean-ai-success'],
  ['glean-ai-success-east', 'glean-ai-success'],
  ['glean-ai-success-west', 'glean-ai-success'],
  ['glean-fde', 'glean-fde'],
  ['glean-solutions-architect', 'glean-solutions-architect'],
];

for (const [slug, variant] of jobs) {
  console.log(`Building ${slug}...`);
  await buildPdf(slug, variant);
}
