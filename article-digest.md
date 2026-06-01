# Article Digest — Proof Points (Humayun Akbar)

Compact proof points for evaluations and tailored CVs. **Metrics here override cv.md when they differ.**

---

## Autonomous Revenue Operations Agent

**Hero metrics:** ~65% manual workload reduction · lead response ~2h → ~20m · zero human handoff for tier-1 leads

**Architecture:** Multi-agent pipeline (LangChain + n8n) — lead intake → enrichment → scoring → CRM → auto-scheduling. Integrations: Gmail, HubSpot, Google Calendar, Slack.

**Key decisions:**
- Deterministic scoring rubric alongside LLM enrichment for explainability
- n8n for ops-visible workflow vs opaque code-only orchestration
- Tier-1 full automation; human judgment reserved for high-value deals

**Proof points:**
- Shipped in under 8 weeks with weekly client demos
- Retired 3 manual tools from client sales process
- Best lead artifact for "AI Solutions Engineer" and "AI Automation Engineer" JDs

---

## Intelligent Document Processing (IDP) / BOAT

**Hero metrics:** ~95% extraction accuracy · ~70% processing time reduction vs manual baseline

**Architecture:** OCR (Tesseract, AWS Textract) + NLP + RAG validation + multi-document reconciliation. FastAPI + pgvector. AWS Lambda/S3 for extraction artifacts.

**Key decisions:**
- RAG-based validation layer instead of single-pass OCR trust
- Admin console for exception triage (human-in-the-loop on edge cases)

**Proof points:**
- Replaced human-operated healthcare/finance document workflow
- Public repo: https://github.com/akaleap/boat
- Lead artifact for architect and document-intelligence JDs

---

## HIPAA-Compliant AI CRM & Support Assistant

**Hero metrics:** ~50% support resolution time reduction · passed HIPAA audit · ~70% report generation speedup (dynamic report builder)

**Architecture:** RAG chatbot (LangChain + OpenAI + pgvector) over clinical/admin data. Platform migration (React/Node → RoR on AWS ECS). RBAC, audit logs, encryption.

**Key decisions:**
- **RAG over fine-tuning** — traceable citations for audits; day-zero content updates; lower iteration cost vs fine-tune cycles
- Prototyped both approaches on subset before committing

**Proof points:**
- 16+ engineer cross-functional delivery with zero production incidents in migration phase
- STAR story: "Technical Tradeoff — RAG over Fine-Tuning"
- Best for healthcare AI, compliance-sensitive product roles

---

## Voice AI Real Estate Agent

**Hero metrics:** ~60% lead-qualification cost reduction · improved qualified-lead conversion

**Architecture:** Twilio + OpenAI + Whisper + ElevenLabs; CRM integration for scheduling.

**Proof points:**
- Conversational AI in production (not chat-only)
- Good secondary bullet for voice/conversational AI JDs

---

## AI Recruitment Screening Pipeline

**Hero metrics:** ~75% screening time reduction · explainable scoring rubric

**Architecture:** LangChain + embeddings — parse, score, rank against role criteria.

**Proof points:**
- HR-tech and agentic workflow positioning
- Supports "automation engineer" keyword match

---

## Internal AI + Agile Workflow Automation

**Hero metrics:** ~30% feature delivery speed improvement · ~35% bug resolution time reduction

**Architecture:** n8n + OpenAI + Whisper integrated with Slack, Asana, GitHub Actions — sprint digests, meeting transcription, risk flags across 8+ products.

**Proof points:**
- Shows AI applied to engineering ops, not only customer features
- De-emphasize when JD is pure customer-facing solutions role

---

## NAMC Turnaround (Delivery)

**Hero metrics:** Contract renewed · $2K delivery bonus

**Story:** At-risk US enterprise engagement — reset scope, weekly demos, 6-month transparent roadmap focused on booking + payments critical path.

**Proof points:**
- Use only for TPM-explicit JDs or when stakeholder management is core
- Pair with one technical decision bullet (don't out-TPM career TPMs)

---

## Happy Tenant — PropTech PMO

**Hero metrics:** v3 ~2 weeks ahead of plan · ~99% uptime · zero critical incidents in scaling phase

**Story:** Built PMO and Scrum from scratch for UAE PropTech; executive workshop → 6-month roadmap with OKRs.

**Proof points:** TPM tertiary framing only.

---

## Pickletour — Founding Product Engineer

**Hero metrics:** Concept to live MVP in ~9 months (web + mobile)

**Story:** Founding engineer — product, architecture, hiring, GCP release lifecycle.

**Proof points:** Lead for Senior Full-Stack (AI-heavy) JDs; AI as supporting angle.

---

## Skill Gaps (honest framing in interviews)

| Gap | Status | Framing if asked |
|-----|--------|------------------|
| Public GitHub / OSS | BOAT + Hermes in progress | "Shipping sanitized demos; production work was client-private" |
| Langfuse / LangSmith | Not in prod yet | "Custom dashboards for latency/quality; evaluating Langfuse" |
| LangGraph / CrewAI | LangChain + n8n in prod | "Ready to adopt your framework within first month" |
