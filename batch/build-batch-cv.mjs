#!/usr/bin/env node
/** One-off tailored CV HTML for batch PDFs */
import { readFile, writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const template = await readFile(resolve(root, 'templates/cv-template.html'), 'utf8');

const base = {
  LANG: 'en',
  PAGE_WIDTH: '8.5in',
  NAME: 'Humayun Akbar',
  PHONE: '+92-333-747-2719',
  EMAIL: 'humayunak22@gmail.com',
  LINKEDIN_URL: 'https://linkedin.com/in/humayunak',
  LINKEDIN_DISPLAY: 'linkedin.com/in/humayunak',
  PORTFOLIO_URL: 'https://github.com/akaleap/boat',
  PORTFOLIO_DISPLAY: 'github.com/akaleap/boat',
  LOCATION: 'Lahore, Pakistan (Remote)',
  SECTION_SUMMARY: 'Professional Summary',
  SECTION_COMPETENCIES: 'Core Competencies',
  SECTION_EXPERIENCE: 'Work Experience',
  SECTION_PROJECTS: 'Selected Projects',
  SECTION_EDUCATION: 'Education',
  SECTION_CERTIFICATIONS: 'Certifications',
  SECTION_SKILLS: 'Skills',
  EDUCATION: `<div class="edu-item"><div class="edu-header"><span class="edu-school"><strong>B.S. Computer Science</strong> — FAST-NUCES, Lahore</span><span class="edu-period">Jan 2019</span></div></div>`,
  CERTIFICATIONS: `<div class="cert-item">Google Foundations of Project Management · Vanderbilt Prompt Engineering · DeepLearning.AI AI For Everyone</div>`,
  SKILLS: `<p><strong>Languages:</strong> Python, TypeScript, JavaScript, Node.js, React, Next.js, SQL · <strong>AI:</strong> OpenAI, Claude, LangChain, RAG, n8n, multi-agent, OCR, prompt engineering · <strong>Cloud:</strong> AWS (Lambda, ECS, S3, Textract), Docker, CI/CD, PostgreSQL, pgvector</p>`,
};

const experience = `
<div class="job">
  <div class="job-header"><span class="job-company">Next Frontier Labs</span><span class="job-period">Sep 2021 – Present</span></div>
  <div class="job-role">Lead AI & Automation Engineer / Technical Project Manager</div>
  <div class="job-location">Lahore, Pakistan (Remote) · US product teams</div>
  <ul>
    <li><strong>GenAI delivery:</strong> Architected LLM, RAG, and OCR pipelines across 8+ SaaS platforms; primary technical POC for US product owners across 10h timezone gap.</li>
    <li><strong>Multi-agent automation:</strong> Built LangChain + n8n revenue-ops system — ~65% manual workload cut; lead response ~2h to ~20m.</li>
    <li><strong>Production evaluation patterns:</strong> HIPAA-aware RAG chatbot with traceable responses — ~50% support resolution improvement; passed HIPAA audit.</li>
    <li><strong>Integrations & APIs:</strong> FastAPI services, pgvector, AWS (Lambda, ECS, Textract); Docker CI/CD cutting deploy time ~40%.</li>
  </ul>
</div>
<div class="job">
  <div class="job-header"><span class="job-company">Pickletour LLC</span><span class="job-period">Nov 2019 – Sep 2021</span></div>
  <div class="job-role">Founding Product Engineer</div>
  <div class="job-location">California, USA (Remote)</div>
  <ul>
    <li>Shipped sports-social SaaS MVP in ~9 months — full-stack architecture, hiring, and GCP release.</li>
  </ul>
</div>`;

const projectsFde = `
<div class="project"><div class="project-title">Autonomous Revenue Operations Agent</div>
  <div class="project-desc">Multi-agent pipeline (LangChain + n8n) for lead intake, enrichment, scoring, CRM, scheduling. ~65% workload reduction.</div>
  <div class="project-tech">LangChain · OpenAI · n8n · PostgreSQL · HubSpot</div></div>
<div class="project"><div class="project-title">HIPAA-Compliant AI CRM & Support Assistant</div>
  <div class="project-desc">Production RAG with audit-friendly citations; platform migration with 16+ engineers, zero prod incidents in migration phase.</div>
  <div class="project-tech">LangChain · OpenAI · pgvector · AWS ECS · React · Node.js</div></div>
<div class="project"><div class="project-title">Intelligent Document Processing (IDP)</div>
  <div class="project-desc">OCR + RAG validation pipeline — ~95% extraction accuracy, ~70% faster than manual baseline.</div>
  <div class="project-tech">Python · FastAPI · Textract · pgvector · github.com/akaleap/boat</div></div>`;

const projectsFs = `
<div class="project"><div class="project-title">HIPAA-Compliant AI CRM (Full-Stack)</div>
  <div class="project-desc">React/Node RAG product with RBAC and audit logs; ~50% support resolution improvement.</div>
  <div class="project-tech">React · Node.js · LangChain · PostgreSQL · AWS</div></div>
<div class="project"><div class="project-title">Pickletour MVP</div>
  <div class="project-desc">End-to-end web/mobile tournament platform from concept to production in ~9 months.</div>
  <div class="project-tech">React · GCP · REST APIs</div></div>
<div class="project"><div class="project-title">IDP / BOAT</div>
  <div class="project-desc">Document intelligence UI + FastAPI backend with data-heavy admin console.</div>
  <div class="project-tech">React · Python · FastAPI · pgvector</div></div>`;

const variants = {
  'arize-ai': {
    SUMMARY_TEXT: 'AI Solutions Engineer with 6+ years shipping production SaaS and GenAI systems for US teams. Hands-on with LLM integration, RAG, multi-agent workflows, and client-facing delivery — from discovery through production observability patterns, evaluation rubrics, and measurable outcomes.',
    COMPETENCIES: `<span class="comp-tag">GenAI & LLM Production</span><span class="comp-tag">RAG & Evaluation</span><span class="comp-tag">Python & FastAPI</span><span class="comp-tag">TypeScript & Node.js</span><span class="comp-tag">LangChain & n8n</span><span class="comp-tag">AWS & Docker</span><span class="comp-tag">Client-Facing Delivery</span><span class="comp-tag">HIPAA-Aware Systems</span>`,
    EXPERIENCE: experience,
    PROJECTS: projectsFde,
    outPdf: 'output/cv-humayun-akbar-arize-ai-2026-05-29.pdf',
    outHtml: '/tmp/cv-humayun-akbar-arize-ai.html',
  },
  'arize-ai-fullstack': {
    SUMMARY_TEXT: 'Senior full-stack AI product engineer with 6+ years building React/TypeScript and Python systems for US SaaS teams. Ships LLM-powered UIs, APIs, and data-heavy dashboards with strong product ownership and production discipline.',
    COMPETENCIES: `<span class="comp-tag">React & TypeScript</span><span class="comp-tag">Next.js & Node.js</span><span class="comp-tag">Python & FastAPI</span><span class="comp-tag">LLM Product Features</span><span class="comp-tag">Data Visualization</span><span class="comp-tag">AWS & Docker</span><span class="comp-tag">SaaS Delivery</span><span class="comp-tag">UX & Product Ownership</span>`,
    EXPERIENCE: experience.replace('GenAI delivery:', 'Full-stack AI:').replace('Production evaluation patterns:', 'Product & platform:'),
    PROJECTS: projectsFs,
    outPdf: 'output/cv-humayun-akbar-arize-ai-fullstack-2026-05-29.pdf',
    outHtml: '/tmp/cv-humayun-akbar-arize-ai-fullstack.html',
  },
};

const key = process.argv[2];
const v = variants[key];
if (!v) {
  console.error('Usage: node build-batch-cv.mjs <arize-ai|arize-ai-fullstack>');
  process.exit(1);
}

let html = template;
const all = { ...base, ...v };
for (const [k, val] of Object.entries(all)) {
  html = html.replaceAll(`{{${k}}}`, val);
}

await writeFile(v.outHtml, html);
const pdfPath = resolve(root, v.outPdf);
execSync(`node generate-pdf.mjs "${v.outHtml}" "${pdfPath}" --format=letter`, { cwd: root, stdio: 'inherit' });
console.log(JSON.stringify({ pdf: v.outPdf }));
