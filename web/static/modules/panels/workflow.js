/** How it works — minimal system flow infographic */

function loadWorkflowPanel() {
  const root = $('workflowRoot');
  if (!root) return;

  root.innerHTML = `
    <div class="wf-infographic">
      <svg viewBox="0 0 800 520" xmlns="http://www.w3.org/2000/svg" role="img" style="width:100%;max-width:800px;margin:0 auto;display:block">
        <title>Northstar OS — How it works</title>
        <desc>Job search pipeline: Discover → Evaluate → Decide → Apply → Track</desc>
        <style>
          .wf-box { fill: var(--surface-card); stroke: var(--hairline); stroke-width: 1; rx: 8; }
          .wf-box--active { stroke: var(--primary); stroke-width: 1.5; }
          .wf-label { fill: var(--ink); font-family: var(--sans); font-size: 13px; font-weight: 600; }
          .wf-sub { fill: var(--muted); font-family: var(--sans); font-size: 10px; }
          .wf-arrow { stroke: var(--muted-soft); stroke-width: 1.5; fill: none; marker-end: url(#wfArrow); }
          .wf-agent { fill: var(--primary-soft); stroke: var(--primary); stroke-width: 1; rx: 8; }
          .wf-agent-label { fill: var(--primary); font-family: var(--sans); font-size: 10px; font-weight: 500; }
          .wf-section { fill: var(--muted); font-family: var(--sans); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
          .wf-connector { fill: var(--muted-soft); font-family: var(--sans); font-size: 9px; }
        </style>
        <defs>
          <marker id="wfArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="var(--muted-soft)"/>
          </marker>
        </defs>

        <!-- Section: Sources -->
        <text x="120" y="30" class="wf-section" text-anchor="middle">Sources</text>

        <rect x="20" y="44" width="200" height="52" class="wf-box"/>
        <text x="120" y="68" class="wf-label" text-anchor="middle">Discovery</text>
        <text x="120" y="84" class="wf-sub" text-anchor="middle">Greenhouse · Ashby · Lever APIs</text>

        <rect x="20" y="108" width="200" height="52" class="wf-box"/>
        <text x="120" y="132" class="wf-label" text-anchor="middle">Connectors</text>
        <text x="120" y="148" class="wf-sub" text-anchor="middle">Apify · LinkedIn · Email · Manual</text>

        <!-- Arrow: Sources → Inbox -->
        <path d="M220,96 L260,96 L260,180 L300,180" class="wf-arrow"/>

        <!-- Section: Pipeline -->
        <text x="420" y="30" class="wf-section" text-anchor="middle">Pipeline</text>

        <rect x="300" y="44" width="240" height="56" class="wf-box wf-box--active"/>
        <text x="420" y="66" class="wf-label" text-anchor="middle">Inbox</text>
        <text x="420" y="82" class="wf-sub" text-anchor="middle">New offers land here · Triage + select</text>

        <!-- Agent badge -->
        <rect x="468" y="90" width="68" height="20" class="wf-agent"/>
        <text x="502" y="104" class="wf-agent-label" text-anchor="middle">AI Scan</text>

        <!-- Arrow: Inbox → Evaluate -->
        <path d="M420,100 L420,140" class="wf-arrow"/>
        <text x="430" y="128" class="wf-connector">select</text>

        <rect x="300" y="145" width="240" height="56" class="wf-box wf-box--active"/>
        <text x="420" y="168" class="wf-label" text-anchor="middle">Evaluate (A–G)</text>
        <text x="420" y="184" class="wf-sub" text-anchor="middle">Score · Archetype · Legitimacy check</text>

        <rect x="468" y="191" width="68" height="20" class="wf-agent"/>
        <text x="502" y="205" class="wf-agent-label" text-anchor="middle">AI Eval</text>

        <!-- Arrow: Evaluate → Decide -->
        <path d="M420,201 L420,240" class="wf-arrow"/>

        <!-- Decision diamond -->
        <polygon points="420,245 460,270 420,295 380,270" style="fill:var(--surface-card);stroke:var(--hairline);stroke-width:1"/>
        <text x="420" y="274" class="wf-label" text-anchor="middle" style="font-size:11px">≥ 4.0?</text>

        <!-- Arrow: Yes → Apply -->
        <path d="M460,270 L520,270 L520,340 L560,340" class="wf-arrow"/>
        <text x="480" y="264" class="wf-connector">yes</text>

        <!-- Arrow: No → Skip -->
        <path d="M380,270 L340,270 L340,340 L300,340" class="wf-arrow"/>
        <text x="350" y="264" class="wf-connector">no</text>

        <rect x="260" y="315" width="100" height="44" class="wf-box" style="opacity:0.6"/>
        <text x="310" y="340" class="wf-label" text-anchor="middle" style="font-size:11px;opacity:0.6">Skip</text>

        <!-- Section: Action -->
        <text x="680" y="30" class="wf-section" text-anchor="middle">Action</text>

        <rect x="560" y="44" width="220" height="56" class="wf-box"/>
        <text x="670" y="66" class="wf-label" text-anchor="middle">Generate Resume</text>
        <text x="670" y="82" class="wf-sub" text-anchor="middle">Archetype-matched · ATS-optimized PDF</text>

        <rect x="708" y="90" width="68" height="20" class="wf-agent"/>
        <text x="742" y="104" class="wf-agent-label" text-anchor="middle">AI PDF</text>

        <!-- Arrow: Evaluate → Resume -->
        <path d="M540,170 L670,170 L670,100" class="wf-arrow"/>

        <rect x="560" y="310" width="220" height="56" class="wf-box wf-box--active"/>
        <text x="670" y="332" class="wf-label" text-anchor="middle">Apply</text>
        <text x="670" y="348" class="wf-sub" text-anchor="middle">Form answers · Email · LinkedIn DM</text>

        <rect x="708" y="356" width="68" height="20" class="wf-agent"/>
        <text x="742" y="370" class="wf-agent-label" text-anchor="middle">AI Apply</text>

        <!-- Arrow: Apply → Track -->
        <path d="M670,366 L670,410" class="wf-arrow"/>

        <rect x="560" y="415" width="220" height="56" class="wf-box"/>
        <text x="670" y="438" class="wf-label" text-anchor="middle">Track + Follow up</text>
        <text x="670" y="454" class="wf-sub" text-anchor="middle">Status · Cadence · Interview prep</text>

        <!-- Loop arrow: Track → Inbox -->
        <path d="M560,443 L100,443 L100,160 L300,160" class="wf-arrow" stroke-dasharray="4,3"/>
        <text x="100" y="310" class="wf-connector" text-anchor="middle" transform="rotate(-90,100,310)">feedback loop</text>

        <!-- Legend -->
        <g transform="translate(300,488)">
          <rect x="0" y="0" width="12" height="12" class="wf-box wf-box--active"/>
          <text x="18" y="10" class="wf-sub">Active step</text>
          <rect x="100" y="0" width="12" height="12" class="wf-agent"/>
          <text x="118" y="10" class="wf-sub">AI agent skill</text>
          <line x1="210" y1="6" x2="240" y2="6" class="wf-arrow" stroke-dasharray="4,3"/>
          <text x="248" y="10" class="wf-sub">Feedback loop</text>
        </g>
      </svg>
    </div>
  `;
}
