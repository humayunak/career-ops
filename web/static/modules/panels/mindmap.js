/** Mindmap — full-page zoomable/pannable Mermaid canvas */

const MINDMAP_SOURCE = `mindmap
  root((career-ops))
    Modes
      oferta
        evaluate A-F
      ofertas
        compare and rank
      pdf
        ATS CV gen
      scan
        portal scrape
      pipeline
        process inbox
      batch
        parallel workers
      tracker
        app status
      apply
        form filler
      contacto
        LinkedIn outreach
      patterns
        rejection analysis
      followup
        cadence tracker
      deep
        company research
      interview-prep
        prep report
      training
        cert evaluation
      project
        portfolio eval
      intake
        log job URL
    Data Files
      cv.md
      applications.md
      pipeline.md
      profile.yml
      portals.yml
      article-digest.md
    Outputs
      reports/
      output PDFs
      apply-drafts/
      jds/`;

// Catppuccin Mocha palette injected directly into the SVG so mindmap nodes
// get the right colours regardless of which Mermaid theme variables apply.
const MINDMAP_SVG_STYLE = `
  /* ── root node ── */
  .mindmap-node.section-root > circle,
  .mindmap-node.section-root > ellipse {
    fill: #cba6f7 !important;
    stroke: #b4befe !important;
    stroke-width: 2px;
  }
  .mindmap-node.section-root .nodeLabel, .mindmap-node.section-root text {
    fill: #1e1e2e !important;
    font-weight: 700;
  }

  /* ── branch nodes (depth 1) ── */
  .mindmap-node.section-1 > rect,
  .mindmap-node.section-1 > polygon,
  .mindmap-node.section-1 > path {
    fill: #313244 !important;
    stroke: #89b4fa !important;
    stroke-width: 1.5px;
  }
  .mindmap-node.section-1 .nodeLabel, .mindmap-node.section-1 text {
    fill: #89b4fa !important;
    font-weight: 600;
  }

  /* ── leaf nodes (depth 2+) ── */
  .mindmap-node > rect,
  .mindmap-node > polygon,
  .mindmap-node > path,
  .mindmap-node > circle,
  .mindmap-node > ellipse {
    fill: #1e1e2e !important;
    stroke: #45475a !important;
    stroke-width: 1px;
  }
  .mindmap-node .nodeLabel, .mindmap-node text {
    fill: #cdd6f4 !important;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
    font-size: 13px !important;
  }

  /* ── edges ── */
  .mindmap-edge, path.edge {
    stroke: #585b70 !important;
    stroke-width: 1.5px !important;
  }

  /* ── background ── */
  svg { background: #11111b; }
`;

let mm = { scale: 1, tx: 0, ty: 0, dragging: false, lastX: 0, lastY: 0 };

function clampScale(s) { return Math.min(5, Math.max(0.15, s)); }

function applyTransform(canvas) {
  canvas.style.transform = `translate(${mm.tx}px, ${mm.ty}px) scale(${mm.scale})`;
}

/** Read natural SVG dimensions — handles width="100%", inline max-width style, and viewBox */
function getSvgDims(svgEl) {
  // Strip mermaid's inline max-width so getBoundingClientRect gives real dims
  svgEl.style.maxWidth = 'none';
  svgEl.style.width = 'auto';
  svgEl.style.height = 'auto';

  // Prefer explicit px attributes
  const wa = svgEl.getAttribute('width');
  const ha = svgEl.getAttribute('height');
  let w = wa && !wa.includes('%') ? parseFloat(wa) : 0;
  let h = ha && !ha.includes('%') ? parseFloat(ha) : 0;

  // Fall back to viewBox (most reliable for Mermaid output)
  if (!w || !h) {
    const vb = svgEl.viewBox && svgEl.viewBox.baseVal;
    if (vb && vb.width > 0) { w = vb.width; h = vb.height; }
  }

  // Last resort: actual rendered size
  if (!w || !h) {
    const r = svgEl.getBoundingClientRect();
    w = r.width; h = r.height;
  }

  return { w: w || 800, h: h || 600 };
}

function fitToView(canvas, container) {
  const svg = canvas.querySelector('svg');
  if (!svg) return;
  const { w, h } = getSvgDims(svg);
  const cw = container.clientWidth  || window.innerWidth  - 235;
  const ch = container.clientHeight || window.innerHeight - 57;
  const pad = 60;
  const s = clampScale(Math.min((cw - pad * 2) / w, (ch - pad * 2) / h));
  mm.scale = s;
  mm.tx = (cw - w * s) / 2;
  mm.ty = (ch - h * s) / 2;
  applyTransform(canvas);
}

function updateZoomLabel() {
  const el = document.getElementById('mmZoomLabel');
  if (el) el.textContent = Math.round(mm.scale * 100) + '%';
}

function bindCanvasEvents(container, canvas) {
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.88 : 1.12;
    const rect = container.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const ns = clampScale(mm.scale * factor);
    mm.tx = mx - (mx - mm.tx) * (ns / mm.scale);
    mm.ty = my - (my - mm.ty) * (ns / mm.scale);
    mm.scale = ns;
    applyTransform(canvas);
    updateZoomLabel();
  }, { passive: false });

  container.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    mm.dragging = true;
    mm.lastX = e.clientX;
    mm.lastY = e.clientY;
    container.setPointerCapture(e.pointerId);
    container.style.cursor = 'grabbing';
  });
  container.addEventListener('pointermove', (e) => {
    if (!mm.dragging) return;
    mm.tx += e.clientX - mm.lastX;
    mm.ty += e.clientY - mm.lastY;
    mm.lastX = e.clientX;
    mm.lastY = e.clientY;
    applyTransform(canvas);
  });
  container.addEventListener('pointerup', () => {
    mm.dragging = false;
    container.style.cursor = 'grab';
  });
}

function renderMindmapPanel() {
  return `
    <div class="mm-panel">
      <div class="mm-toolbar glass-card">
        <span class="mm-toolbar__title">Skill modes mindmap</span>
        <div class="mm-toolbar__controls">
          <button type="button" class="btn btn--sm btn--ghost" id="mmZoomOut" title="Zoom out">−</button>
          <span class="mm-zoom-label" id="mmZoomLabel">—</span>
          <button type="button" class="btn btn--sm btn--ghost" id="mmZoomIn" title="Zoom in">+</button>
          <button type="button" class="btn btn--sm btn--ghost" id="mmFit" title="Fit to view">Fit</button>
          <button type="button" class="btn btn--sm btn--ghost" id="mmReset" title="Reset to 1:1">1:1</button>
        </div>
      </div>
      <div class="mm-stage" id="mmStage">
        <div class="mm-canvas" id="mmCanvas">
          <p id="mmStatus" style="padding:40px;color:var(--muted);font-size:13px">Loading Mermaid…</p>
        </div>
        <div class="mm-hint">Scroll to zoom · Drag to pan</div>
      </div>
    </div>
  `;
}

function loadMermaidLib(onReady) {
  if (window.__mermaidReady) { onReady(); return; }
  if (window.__mermaidPending) { window.__mermaidQueue.push(onReady); return; }
  window.__mermaidPending = true;
  window.__mermaidQueue = [onReady];
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
  s.onerror = () => {
    const status = document.getElementById('mmStatus');
    if (status) status.textContent = 'Failed to load Mermaid from CDN. Check your internet connection.';
  };
  s.onload = () => {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        background: '#11111b',
        mainBkg: '#313244',
        nodeBorder: '#89b4fa',
        lineColor: '#585b70',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '14px',
        primaryColor: '#313244',
        primaryTextColor: '#cdd6f4',
        primaryBorderColor: '#89b4fa',
        secondaryColor: '#1e1e2e',
        tertiaryColor: '#45475a',
        edgeLabelBackground: '#1e1e2e',
        titleColor: '#cba6f7',
      },
    });
    window.__mermaidReady = true;
    window.__mermaidPending = false;
    window.__mermaidQueue.forEach((cb) => cb());
    window.__mermaidQueue = [];
  };
  document.head.appendChild(s);
}

async function loadMindmapPanel() {
  const root = $('mindmapRoot');
  if (!root) return;

  mm = { scale: 1, tx: 0, ty: 0, dragging: false, lastX: 0, lastY: 0 };
  root.innerHTML = renderMindmapPanel();

  const stage = document.getElementById('mmStage');
  const canvas = document.getElementById('mmCanvas');

  stage.style.cursor = 'grab';
  bindCanvasEvents(stage, canvas);

  const zoomStep = (factor) => {
    const cx = stage.clientWidth / 2, cy = stage.clientHeight / 2;
    const ns = clampScale(mm.scale * factor);
    mm.tx = cx - (cx - mm.tx) * (ns / mm.scale);
    mm.ty = cy - (cy - mm.ty) * (ns / mm.scale);
    mm.scale = ns;
    applyTransform(canvas);
    updateZoomLabel();
  };

  document.getElementById('mmZoomIn').addEventListener('click', () => zoomStep(1.25));
  document.getElementById('mmZoomOut').addEventListener('click', () => zoomStep(0.8));
  document.getElementById('mmFit').addEventListener('click', () => { fitToView(canvas, stage); updateZoomLabel(); });
  document.getElementById('mmReset').addEventListener('click', () => {
    mm.scale = 1; mm.tx = 40; mm.ty = 40;
    applyTransform(canvas); updateZoomLabel();
  });

  loadMermaidLib(async () => {
    const status = document.getElementById('mmStatus');
    if (status) status.textContent = 'Rendering diagram…';

    try {
      const renderId = 'mm-svg-' + Date.now();
      const { svg } = await window.mermaid.render(renderId, MINDMAP_SOURCE);

      // Inject into canvas
      canvas.innerHTML = svg;

      const svgEl = canvas.querySelector('svg');
      if (!svgEl) throw new Error('No SVG element found after render');

      // Inject dark-mode styles directly into the SVG so they survive isolation
      const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      styleEl.textContent = MINDMAP_SVG_STYLE;
      svgEl.prepend(styleEl);

      // Remove mermaid's max-width constraint so the SVG can scale freely
      svgEl.style.maxWidth = 'none';
      svgEl.style.width = 'auto';
      svgEl.style.height = 'auto';
      svgEl.style.display = 'block';
      svgEl.style.overflow = 'visible';
      svgEl.removeAttribute('width');
      svgEl.removeAttribute('height');

      // Wait two frames: first for DOM insert, second for layout
      requestAnimationFrame(() => requestAnimationFrame(() => {
        // Restore px dims from viewBox so fitToView math works
        const vb = svgEl.viewBox && svgEl.viewBox.baseVal;
        if (vb && vb.width > 0) {
          svgEl.setAttribute('width', vb.width);
          svgEl.setAttribute('height', vb.height);
        }
        fitToView(canvas, stage);
        updateZoomLabel();
      }));

    } catch (err) {
      canvas.innerHTML = `<p style="padding:40px;color:#f38ba8;font-size:13px">Render error: ${esc(String(err))}</p>`;
    }
  });
}
