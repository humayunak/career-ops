/** How it works — full-screen agent blueprint */

function loadWorkflowPanel() {
  const root = $('workflowRoot');
  if (!root) return;

  root.innerHTML = `
    <div class="blueprint">

      <!-- ── Header ── -->
      <div class="bp-header">
        <div class="bp-header__title">
          <h1 class="bp-h1">Agent Blueprint</h1>
          <span class="bp-badge">Northstar OS v1</span>
        </div>
        <p class="bp-header__sub">AI-powered job search pipeline — 8 skills, 3 archetypes, fully autonomous scan-to-apply</p>
      </div>

      <!-- ── Pipeline flow ── -->
      <div class="bp-pipeline">

        <!-- Stage 0: Input -->
        <div class="bp-stage bp-stage--input">
          <div class="bp-stage__head">
            <span class="bp-stage__icon">⚡</span>
            <h2 class="bp-stage__title">Input Layer</h2>
            <span class="bp-pill bp-pill--dim">Triggers</span>
          </div>
          <div class="bp-cards">
            <div class="bp-card">
              <div class="bp-card__head">
                <strong>API Scanner</strong>
                <span class="bp-pill bp-pill--green">Cron</span>
              </div>
              <p class="bp-card__body">Greenhouse · Ashby · Lever APIs<br>Zero LLM cost — direct API hits</p>
              <code class="bp-card__cmd">/career-ops-scan</code>
            </div>
            <div class="bp-card">
              <div class="bp-card__head">
                <strong>Apify Actor</strong>
                <span class="bp-pill bp-pill--green">Webhook</span>
              </div>
              <p class="bp-card__body">LinkedIn Jobs Scraper<br>Runs on schedule, pushes to inbox</p>
              <code class="bp-card__cmd">curious_coder/linkedin-jobs-scraper</code>
            </div>
            <div class="bp-card">
              <div class="bp-card__head">
                <strong>Manual</strong>
                <span class="bp-pill bp-pill--dim">User</span>
              </div>
              <p class="bp-card__body">Paste URL · Email forward<br>Add via CLI or web inbox</p>
              <code class="bp-card__cmd">db.mjs add-pipeline &lt;url&gt;</code>
            </div>
          </div>
          <div class="bp-cron">
            <span class="bp-cron__label">Automatable:</span>
            <code>schedule scan every 3 days</code>
          </div>
        </div>

        <div class="bp-arrow">▼</div>

        <!-- Stage 1: Inbox -->
        <div class="bp-stage">
          <div class="bp-stage__head">
            <span class="bp-stage__icon">📥</span>
            <h2 class="bp-stage__title">Inbox</h2>
            <span class="bp-pill bp-pill--amber">status: Inbox</span>
          </div>
          <div class="bp-stage__desc">
            <p>New offers land here from all connectors. Triage: select promising roles → move to Applications for evaluation. Dismiss the rest.</p>
          </div>
          <div class="bp-cron">
            <span class="bp-cron__label">Batch action:</span>
            <code>evaluate all status=Inbox</code>
          </div>
        </div>

        <div class="bp-arrow">▼</div>

        <!-- Stage 2: Evaluate -->
        <div class="bp-stage bp-stage--wide">
          <div class="bp-stage__head">
            <span class="bp-stage__icon">🔬</span>
            <h2 class="bp-stage__title">Evaluate (A–G)</h2>
            <span class="bp-pill bp-pill--blue">AI Skill</span>
            <span class="bp-pill bp-pill--amber">status: Evaluated</span>
          </div>
          <div class="bp-blocks">
            <div class="bp-block">
              <strong>A</strong>
              <span>Role Summary</span>
            </div>
            <div class="bp-block">
              <strong>B</strong>
              <span>Fit Analysis</span>
            </div>
            <div class="bp-block">
              <strong>C</strong>
              <span>Comp & Logistics</span>
            </div>
            <div class="bp-block">
              <strong>D</strong>
              <span>Red/Green Flags</span>
            </div>
            <div class="bp-block">
              <strong>E</strong>
              <span>Negotiation Intel</span>
            </div>
            <div class="bp-block">
              <strong>F</strong>
              <span>Verdict + Score</span>
            </div>
            <div class="bp-block">
              <strong>G</strong>
              <span>Legitimacy Check</span>
            </div>
          </div>
          <div class="bp-outputs">
            <span class="bp-output">📄 Eval report</span>
            <span class="bp-output">🎯 Score /5</span>
            <span class="bp-output">🏷️ Archetype match</span>
            <span class="bp-output">💾 DB update</span>
          </div>
          <div class="bp-cron">
            <span class="bp-cron__label">Batch action:</span>
            <code>run pending evaluations</code> — processes all Inbox items
          </div>
          <code class="bp-card__cmd">/career-ops-evaluate</code>
        </div>

        <div class="bp-arrow">▼</div>

        <!-- Decision -->
        <div class="bp-decision">
          <div class="bp-decision__diamond">Score ≥ 4.0?</div>
          <div class="bp-decision__paths">
            <div class="bp-decision__path bp-decision__path--yes">
              <span class="bp-pill bp-pill--green">Yes → Generate + Apply</span>
            </div>
            <div class="bp-decision__path bp-decision__path--no">
              <span class="bp-pill bp-pill--dim">No → SKIP (save time)</span>
            </div>
          </div>
        </div>

        <div class="bp-arrow">▼</div>

        <!-- Stage 3: Resume -->
        <div class="bp-stage">
          <div class="bp-stage__head">
            <span class="bp-stage__icon">📑</span>
            <h2 class="bp-stage__title">Generate Resume</h2>
            <span class="bp-pill bp-pill--blue">AI Skill</span>
          </div>
          <div class="bp-stage__desc">
            <p>Matches role to archetype → selects bullets from article-digest pool → assembles ATS-optimized HTML → Playwright renders PDF.</p>
          </div>
          <div class="bp-outputs">
            <span class="bp-output">📝 Resume HTML</span>
            <span class="bp-output">📄 PDF (Playwright)</span>
            <span class="bp-output">🏷️ Selected bullets log</span>
          </div>
          <div class="bp-sub-detail">
            <strong>Archetypes:</strong>
            <span class="bp-pill bp-pill--dim">ai-automation</span>
            <span class="bp-pill bp-pill--dim">ai-product-founding</span>
            <span class="bp-pill bp-pill--dim">technical-lead</span>
          </div>
          <div class="bp-cron">
            <span class="bp-cron__label">Batch action:</span>
            <code>run pending PDFs</code> — generates for all Evaluated with score ≥ 4.0
          </div>
          <code class="bp-card__cmd">/career-ops-pdf</code>
        </div>

        <div class="bp-arrow">▼</div>

        <!-- Stage 4: Apply -->
        <div class="bp-stage">
          <div class="bp-stage__head">
            <span class="bp-stage__icon">🚀</span>
            <h2 class="bp-stage__title">Apply</h2>
            <span class="bp-pill bp-pill--blue">AI Skill</span>
            <span class="bp-pill bp-pill--amber">status: Applied</span>
          </div>
          <div class="bp-stage__desc">
            <p>AI fills application forms with grounded answers from profile + eval report. Drafts email and LinkedIn DM. <strong>Never auto-submits</strong> — user reviews first.</p>
          </div>
          <div class="bp-outputs">
            <span class="bp-output">📋 Form answers</span>
            <span class="bp-output">✉️ Email draft</span>
            <span class="bp-output">💬 LinkedIn DM draft</span>
          </div>
          <div class="bp-cron">
            <span class="bp-cron__label">Batch action:</span>
            <code>run pending applications</code>
          </div>
          <code class="bp-card__cmd">/career-ops-apply</code>
        </div>

        <div class="bp-arrow">▼</div>

        <!-- Stage 5: Track -->
        <div class="bp-stage">
          <div class="bp-stage__head">
            <span class="bp-stage__icon">📊</span>
            <h2 class="bp-stage__title">Track + Follow up</h2>
            <span class="bp-pill bp-pill--blue">AI Skills</span>
          </div>
          <div class="bp-stage__desc">
            <p>Monitor application statuses, follow-up cadence, rejection pattern analysis, and interview preparation.</p>
          </div>
          <div class="bp-cards bp-cards--sm">
            <div class="bp-card bp-card--compact">
              <strong>Tracker</strong>
              <code>/career-ops-tracker</code>
            </div>
            <div class="bp-card bp-card--compact">
              <strong>Follow-up</strong>
              <code>/career-ops-followup</code>
            </div>
            <div class="bp-card bp-card--compact">
              <strong>Patterns</strong>
              <code>/career-ops-prep</code>
            </div>
            <div class="bp-card bp-card--compact">
              <strong>Interview</strong>
              <code>/career-ops-prep</code>
            </div>
            <div class="bp-card bp-card--compact">
              <strong>Research</strong>
              <code>/career-ops-research</code>
            </div>
          </div>
          <div class="bp-status-flow">
            <span class="status-pill status-pill--applied">Applied</span>
            <span class="bp-arrow--inline">→</span>
            <span class="status-pill status-pill--responded">Responded</span>
            <span class="bp-arrow--inline">→</span>
            <span class="status-pill status-pill--interview">Interview</span>
            <span class="bp-arrow--inline">→</span>
            <span class="status-pill status-pill--offer">Offer</span>
          </div>
        </div>

      </div>

      <!-- ── Data layer ── -->
      <div class="bp-section">
        <h2 class="bp-section__title">Data Layer</h2>
        <div class="bp-data-grid">
          <div class="bp-data-item">
            <strong>SQLite DB</strong>
            <code>data/career-ops.db</code>
            <span class="bp-sub">Applications + pipeline — source of truth</span>
          </div>
          <div class="bp-data-item">
            <strong>Profile</strong>
            <code>config/profile.yml</code>
            <span class="bp-sub">Identity, targets, comp, preferences</span>
          </div>
          <div class="bp-data-item">
            <strong>Narrative</strong>
            <code>config/_profile.md</code>
            <span class="bp-sub">Archetypes, scoring weights, deal-breakers</span>
          </div>
          <div class="bp-data-item">
            <strong>Proof points</strong>
            <code>config/article-digest.md</code>
            <span class="bp-sub">Bullet pool grouped by lens</span>
          </div>
          <div class="bp-data-item">
            <strong>Portals</strong>
            <code>portals.yml</code>
            <span class="bp-sub">45+ companies, query config, filters</span>
          </div>
          <div class="bp-data-item">
            <strong>Outputs</strong>
            <code>data/outputs/{NNN}-{slug}/</code>
            <span class="bp-sub">Report, PDF, apply draft per job</span>
          </div>
        </div>
      </div>

      <!-- ── Skills inventory ── -->
      <div class="bp-section">
        <h2 class="bp-section__title">Skills Inventory</h2>
        <div class="bp-skills-grid">
          <div class="bp-skill"><strong>/evaluate</strong><span>A–G scoring + report</span></div>
          <div class="bp-skill"><strong>/apply</strong><span>Form answers + drafts</span></div>
          <div class="bp-skill"><strong>/scan</strong><span>Portal API scanner</span></div>
          <div class="bp-skill"><strong>/pdf</strong><span>Resume HTML → PDF</span></div>
          <div class="bp-skill"><strong>/research</strong><span>Deep company intel</span></div>
          <div class="bp-skill"><strong>/prep</strong><span>Patterns + interview</span></div>
          <div class="bp-skill"><strong>/followup</strong><span>Cadence + drafts</span></div>
          <div class="bp-skill"><strong>/tracker</strong><span>Status overview</span></div>
        </div>
      </div>

      <!-- ── Stack ── -->
      <div class="bp-section bp-section--last">
        <h2 class="bp-section__title">Stack</h2>
        <div class="bp-stack">
          <span class="bp-pill bp-pill--dim">Node.js (ESM)</span>
          <span class="bp-pill bp-pill--dim">SQLite</span>
          <span class="bp-pill bp-pill--dim">Playwright</span>
          <span class="bp-pill bp-pill--dim">Claude Code</span>
          <span class="bp-pill bp-pill--dim">Apify MCP</span>
          <span class="bp-pill bp-pill--dim">Vanilla HTML/CSS/JS</span>
          <span class="bp-pill bp-pill--dim">YAML config</span>
        </div>
      </div>

    </div>
  `;
}
