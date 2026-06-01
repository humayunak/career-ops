#!/usr/bin/env node
/**
 * Minimal CV HTML builder for batch PDFs — reads templates/cv-template.html
 */
import { readFile, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const PRESETS = {
  'hightouch-gtm': {
    summary:
      'AI Automation Engineer with 6+ years shipping production SaaS and agentic GTM systems for US product teams. Built a multi-agent revenue-ops pipeline (LangChain + n8n) that cut manual workload ~65% and lead response from ~2h to ~20m. Owns API integrations, prompt workflows, RAG-backed context layers, and cross-functional enablement for sales and marketing ops.',
    competencies: [
      'Agentic GTM Automation',
      'LangChain + n8n Orchestration',
      'RevOps & CRM Integrations',
      'OpenAI & Claude APIs',
      'RAG & Context Engineering',
      'Python & FastAPI',
      'SQL & PostgreSQL',
      'Stakeholder Enablement',
    ],
  },
  'hightouch-strategy': {
    summary:
      'AI Solutions Engineer who partners with US product and marketing stakeholders to discover, deliver, and scale AI use cases end-to-end. Combines Python/SQL discovery, technical project leadership, and production LLM systems (RAG, agents) with measurable outcomes — including ~50% support resolution improvement on a HIPAA-compliant platform.',
    competencies: [
      'AI Use Case Discovery',
      'Technical Program Delivery',
      'Martech Integrations',
      'LLM & RAG in Production',
      'Python & SQL',
      'Cross-Functional Leadership',
      'Executive Communication',
      'HIPAA-Aware AI Systems',
    ],
  },
  'hightouch-fde': {
    summary:
      'Forward-deployed AI engineer with strong Python, SQL, and customer-facing diagnostics for production LLM and automation systems. Delivers notebook-style analysis, data quality pipelines, and clear explanations of model behavior to non-technical stakeholders — with proven uplift metrics across healthcare, revops, and document intelligence workloads.',
    competencies: [
      'Python Data Analysis',
      'SQL & Warehouses',
      'Production LLM Diagnostics',
      'Experiment Design',
      'Customer-Facing Delivery',
      'FastAPI & APIs',
      'RAG Pipelines',
      'HIPAA-Aware Systems',
    ],
  },
};

const EXPERIENCE = `
<div class="job avoid-break">
  <div class="job-header">
    <span class="job-company">Next Frontier Labs</span>
    <span class="job-period">Sep 2021 – Present</span>
  </div>
  <div class="job-role">Lead AI & Automation Engineer / Technical Project Manager</div>
  <div class="job-location">Lahore, Pakistan (Remote) · US stakeholders</div>
  <ul>
    <li><strong>Agentic GTM automation:</strong> Multi-agent revops pipeline (LangChain + n8n, HubSpot, Slack) — ~65% manual workload reduction; lead response ~2h → ~20m.</li>
    <li><strong>Context & RAG:</strong> HIPAA-aware RAG chatbot — ~50% support resolution improvement; chose RAG over fine-tuning for auditability.</li>
    <li><strong>Data & APIs:</strong> OCR + RAG document pipeline (~95% extraction accuracy); FastAPI, pgvector, AWS; primary technical POC for US owners.</li>
    <li><strong>Enablement:</strong> Improved delivery velocity ~30% via AI-assisted Agile workflows across 8+ SaaS products.</li>
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
    <li>Shipped sports-social SaaS MVP in ~9 months — architecture, hiring, and GCP release lifecycle.</li>
  </ul>
</div>
`;

const PROJECTS = `
<div class="project avoid-break">
  <div class="project-title">Autonomous Revenue Operations Agent <span class="project-badge">GTM</span></div>
  <div class="project-desc">LangChain + n8n multi-agent pipeline for lead intake, enrichment, scoring, CRM updates, and scheduling. Shipped in under 8 weeks with weekly demos.</div>
  <div class="project-tech">LangChain · OpenAI · n8n · PostgreSQL · HubSpot · Slack</div>
</div>
<div class="project avoid-break">
  <div class="project-title">HIPAA-Compliant AI CRM & Support Assistant</div>
  <div class="project-desc">RAG chatbot over clinical/admin data; platform migration with 16+ engineers; passed HIPAA audit.</div>
  <div class="project-tech">LangChain · OpenAI · pgvector · React · Node.js · AWS ECS</div>
</div>
<div class="project avoid-break">
  <div class="project-title">Intelligent Document Processing (IDP)</div>
  <div class="project-desc">OCR + RAG validation pipeline — ~95% extraction accuracy; ~70% faster than manual baseline.</div>
  <div class="project-tech">Python · Tesseract · AWS Textract · FastAPI · pgvector</div>
</div>
`;

const EDUCATION = `
<div class="edu-item">
  <div class="edu-header">
    <span class="edu-title"><span class="edu-org">FAST-NUCES</span> — BSCS</span>
    <span class="edu-year">Jan 2019</span>
  </div>
  <div class="edu-desc">Relevant: AI, Data Structures, Databases · TA for AI & Data Structures</div>
</div>
`;

const CERTS = `
<div class="cert-item"><span class="cert-title">Google Foundations of Project Management</span><span></span><span></span></div>
<div class="cert-item"><span class="cert-title">Vanderbilt Prompt Engineering for Developers</span><span></span><span></span></div>
<div class="cert-item"><span class="cert-title">DeepLearning.AI AI For Everyone</span><span></span><span></span></div>
`;

const SKILLS = `
<p style="font-size:10.5px;line-height:1.6;color:#333;"><strong>Languages:</strong> Python, TypeScript, JavaScript, SQL · <strong>AI:</strong> OpenAI, Claude, LangChain, RAG, n8n, prompt engineering · <strong>Cloud:</strong> AWS (Lambda, ECS, S3, Textract), Docker, GitHub Actions · <strong>Data:</strong> PostgreSQL, pgvector, MongoDB</p>
`;

async function main() {
  const presetKey = process.argv[2];
  const outPath = process.argv[3];
  if (!presetKey || !outPath || !PRESETS[presetKey]) {
    console.error('Usage: node batch/build-cv-html.mjs <preset> <output.html>');
    console.error('Presets:', Object.keys(PRESETS).join(', '));
    process.exit(1);
  }
  const preset = PRESETS[presetKey];
  let html = await readFile(resolve(root, 'templates/cv-template.html'), 'utf-8');
  const competencies = preset.competencies
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
    '{{LOCATION}}': 'Lahore, Pakistan (Remote) · UTC+5',
    '{{SECTION_SUMMARY}}': 'Professional Summary',
    '{{SUMMARY_TEXT}}': preset.summary,
    '{{SECTION_COMPETENCIES}}': 'Core Competencies',
    '{{COMPETENCIES}}': competencies,
    '{{SECTION_EXPERIENCE}}': 'Work Experience',
    '{{EXPERIENCE}}': EXPERIENCE,
    '{{SECTION_PROJECTS}}': 'Selected Projects',
    '{{PROJECTS}}': PROJECTS,
    '{{SECTION_EDUCATION}}': 'Education',
    '{{EDUCATION}}': EDUCATION,
    '{{SECTION_CERTIFICATIONS}}': 'Certifications',
    '{{CERTIFICATIONS}}': CERTS,
    '{{SECTION_SKILLS}}': 'Skills',
    '{{SKILLS}}': SKILLS,
  };
  for (const [k, v] of Object.entries(replacements)) {
    html = html.split(k).join(v);
  }
  await writeFile(resolve(outPath), html, 'utf-8');
  console.log('Wrote', outPath);
}

main();
