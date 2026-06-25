# Northstar OS Phase 1 — UI Surgery + Brand

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Career-Ops web UI into Northstar OS — new brand identity, consolidated design tokens, redesigned applications table, and cleaned-up panels.

**Architecture:** CSS-first refactor. Adopt the **shadcn/zinc** monochrome palette from `theme-gallery.html`. Collapse triple-namespace tokens (--r-*, --radius-*, --radius and --ctp-*) into one semantic set. Redesign the applications table as a worklist. Remove mock/placeholder data from panels. All changes are in `web/` — no backend or skill changes.

**Tech Stack:** Vanilla HTML/CSS/JS (no framework), CSS custom properties, SVG icons, `shell.css` as token source of truth.

**Theme source:** `theme-gallery.html` `[data-theme="shadcn"]` — the canonical token reference for this refactor.

## Global Constraints

- **Protected files:** `scripts/db.mjs`, `web/lib/db.mjs`, `data/career-ops.db` — never modify.
- **No new dependencies.** Pure CSS/JS. No build tools, no npm packages for the UI.
- **Dark mode parity.** Every token change must update both `:root` and `:root.dark`.
- **4px spacing grid.** All spacing values must be multiples of 4: 4, 8, 12, 16, 20, 24, 32, 48px.
- **WCAG AA.** Body text ≥ 4.5:1 contrast on canvas. Muted ≥ 4.5:1. Captions ≥ 3:1.
- **Branch:** `humayun/web-ui` — all work on this branch.
- **Server:** `npm run web` → http://127.0.0.1:8793. Stop server after changes, user restarts.
- **Test method:** Visual verification via preview tools (screenshot light + dark), no unit tests for CSS.

---

## shadcn Token Reference (from theme-gallery.html)

```
LIGHT                              DARK
--bg:          #ffffff             --bg:          #09090b
--surface:     #ffffff             --surface:     #0c0c0e
--surface2:    #f4f4f5             --surface2:    #18181b
--ink:         #09090b             --ink:         #fafafa
--muted:       #71717a             --muted:       #a1a1aa
--rule:        #e4e4e7             --rule:        #27272a
--primary:     #18181b             --primary:     #fafafa
--primary-ink: #fafafa             --primary-ink: #18181b
--accent:      #18181b             --accent:      #fafafa
--success:     #16a34a             --success:     #22c55e
--danger:      #dc2626             --danger:      #ef4444
--radius:      8px                 --radius:      8px
```

Key characteristic: **monochrome** — primary = ink-inverted. No color accent. Color only for semantic states (success green, danger red). Brand expressed through clean geometry and typography, not hue.

---

### Task 1: Shadcn Token System — `:root` Palette Swap

**Files:**
- Modify: `web/static/shell.css:1-190` (`:root` and `:root.dark` blocks)
- Modify: `web/DESIGN.md` (update color reference)

**Interfaces:**
- Produces: All CSS custom properties referenced by every panel and component. Every subsequent task depends on these tokens being correct.

**What changes:**

The `:root` block gets the shadcn zinc palette. The key shifts:

| Token | Old (terracotta/warm) | New (shadcn) |
|-------|----------------------|--------------|
| `--canvas` | `#f5f4ed` (parchment) | `#ffffff` (pure white) |
| `--surface-soft` | `#efede5` | `#ffffff` (same as bg) |
| `--surface-card` | `#e8e6dc` | `#f4f4f5` (zinc-100) |
| `--surface-cream-strong` | `#dddad0` | `#e4e4e7` (zinc-200) |
| `--ink` | `#141413` (warm black) | `#09090b` (zinc-950) |
| `--muted` | `#5e5d59` | `#71717a` (zinc-500) |
| `--muted-soft` | `#87867f` | `#a1a1aa` (zinc-400) |
| `--primary` | `#c96442` (terracotta) | `#18181b` (zinc-900) |
| `--primary-active` | `#b85538` | `#09090b` (zinc-950) |
| `--primary-soft` | `rgba(201,100,66,0.12)` | `rgba(24,24,27,0.08)` |
| `--on-primary` | `#ffffff` | `#fafafa` (zinc-50) |
| `--accent` | `#c96442` | `#18181b` |
| `--accent-hover` | `#b85538` | `#09090b` |
| `--accent-soft` | `rgba(201,100,66,0.10)` | `rgba(24,24,27,0.06)` |
| `--accent-amber` | `#c2843e` | REMOVE (no amber in shadcn) |
| `--accent-slate` | `#5a7689` | REMOVE (no slate in shadcn, use `--muted`) |
| `--success` | `#4f9d6b` | `#16a34a` |
| `--warning` | `#cf9a2c` | `#f59e0b` (amber-500, shadcn convention) |
| `--error` | `#c14b42` | `#dc2626` |
| `--hairline` | `#f0eee6` (warm cream) | `#e4e4e7` (zinc-200) |
| `--hairline-soft` | `#e8e6dc` | `#f4f4f5` (zinc-100) |

Dark mode shifts:

| Token | Old (warm dark) | New (shadcn dark) |
|-------|----------------|-------------------|
| `--canvas` | `#141413` | `#09090b` (zinc-950) |
| `--surface-soft` | `#262522` | `#0c0c0e` |
| `--surface-card` | `#2c2b28` | `#18181b` (zinc-900) |
| `--ink` | `#edebe3` | `#fafafa` (zinc-50) |
| `--muted` | `#b8b5ab` | `#a1a1aa` (zinc-400) |
| `--primary` | `#c96442` | `#fafafa` (inverted!) |
| `--primary-active` | — | `#e4e4e7` |
| `--on-primary` | — | `#18181b` |
| `--accent` | `#c96442` | `#fafafa` |
| `--hairline` | `rgba(237,235,227,0.15)` | `#27272a` (zinc-800) |
| `--success` | `#4f9d6b` | `#22c55e` |
| `--error` | `#c14b42` | `#ef4444` |

Also collapse backward-compat aliases: remove `--ctp-*` namespace entirely. Map all `--ctp-*` references to semantic tokens:
- `--ctp-text` → `--ink`
- `--ctp-subtext` → `--muted`
- `--ctp-overlay` → `--muted-soft`
- `--ctp-blue` → `--primary`
- `--ctp-green` → `--success`
- `--ctp-red` → `--error`
- `--ctp-yellow` → `--warning`
- `--ctp-mauve` → `--primary`
- `--ctp-peach` → `--warning`
- `--ctp-surface` → `--canvas`
- `--ctp-mantle` → `--surface-soft`
- `--ctp-crust` → `--surface-card`
- `--ctp-base` → `--surface-soft`
- `--ctp-sky` → `--primary`
- `--ctp-pink` → `--muted`

**Keep** the `--ctp-*` definitions in `:root` as aliases so existing JS doesn't break. Mark with `/* DEPRECATED */`.

Remove font imports for Spectral and Schibsted Grotesk. shadcn uses system fonts:
```css
--sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```
Remove `--serif` / `--font-display` — shadcn has no serif. All display text uses sans at higher weights.

- [ ] **Step 1: Update `:root` light-mode tokens**

Replace surface/color/hairline section with shadcn zinc values. Add `--primary-ink: #fafafa`. Remove `--accent-amber`, `--accent-slate`. Update `--success`, `--warning`, `--error` to shadcn values.

- [ ] **Step 2: Update `:root` backward-compat aliases**

Replace all `--accent: #c96442` → `--accent: #18181b`. Remap `--ctp-*` to semantic tokens with deprecation comment. Map `--foreground` → `--ink`, `--foreground-muted` → `--muted`.

- [ ] **Step 3: Update `:root.dark` block**

Pure zinc dark: `--canvas: #09090b`, `--surface-card: #18181b`. Key shadcn behavior: `--primary` **inverts** in dark mode to `#fafafa` (white on dark). `--primary-ink` becomes `#18181b`.

- [ ] **Step 4: Replace hardcoded hex in component CSS**

Search `shell.css` lines 191+ for raw hex values. Replace with token references:
- `#fff` / `#ffffff` → `var(--on-primary)` or `var(--surface)` depending on context
- `#faf9f5` → `var(--canvas)`
- `#2d6a4f` / `#1b4332` → `var(--success)` / darker success variant
- `rgba(243, 139, 168, ...)` → `color-mix(in srgb, var(--error) %, transparent)`
- `rgba(49, 50, 68, 0.8)` → `var(--surface-card)`
- `rgba(0, 0, 0, 0.3/0.35/0.4/0.45)` → `var(--surface2)` or `rgba(9,9,11,0.5)` for code blocks

- [ ] **Step 5: Update font stack**

Remove Google Fonts import for Spectral/Schibsted/JetBrains. Replace with system stack:
```css
--sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
```
Remove `--serif` and `--font-display`. Update `.topbar__title` from `font-family: var(--serif)` to `var(--sans)` with `font-weight: 600`.

- [ ] **Step 6: Normalize off-grid spacing**

Find spacing values not on 4px grid: `13px`, `10px`, `11px`, `9px`, `7px`, `5px`, `3px`. Snap each to nearest 4px-grid value. Do NOT change font sizes.

- [ ] **Step 7: Visual verification**

Run dev server. Screenshot light + dark mode. Verify:
- Clean monochrome zinc look (no warm tints, no terracotta)
- Primary buttons are near-black on light, near-white on dark
- Success green and danger red are the only chromatic colors
- System fonts render correctly
- Dark mode is true dark zinc, not blue-tinted
- WCAG contrast passes

- [ ] **Step 8: Update `web/DESIGN.md`**

Rewrite to document shadcn zinc palette. Remove all terracotta/cairn/Claude-warm references. Document the inverted-primary pattern (dark on light, light on dark). Update agent rules.

- [ ] **Step 9: Commit**

```bash
git add web/static/shell.css web/DESIGN.md
git commit -m "feat(web): adopt shadcn zinc monochrome token system, replace terracotta palette"
```

---

### Task 2: Rebrand Sidebar + Topbar → Northstar OS

**Files:**
- Modify: `web/index.html:23-35` (sidebar brand), `web/index.html:2-5` (title + meta)
- Modify: `web/static/shell.css:254-276` (`.side-brand`, `.cairn-mark`)
- Modify: `web/static/favicon.svg`
- Modify: `web/static/modules/panels/overview.js` (greeting text)

**Interfaces:**
- Consumes: Shadcn tokens from Task 1 (`--primary`, `--ink`)
- Produces: Updated brand identity visible in sidebar, topbar, title, favicon

- [ ] **Step 1: Replace cairn SVG with north-star mark**

In `web/index.html`, replace the cairn `<svg>` (3 stacked ellipses) with a 5-point star. In shadcn monochrome, the star uses `--ink` (not a colored accent):

```html
<svg class="star-mark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--ink)" aria-hidden="true">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" stroke="none"/>
</svg>
```

- [ ] **Step 2: Update brand text**

In `web/index.html`:
- `<title>Career-Ops</title>` → `<title>Northstar OS</title>`
- `<span>Career-Ops</span>` → `<span>Northstar OS</span>`
- Topbar meta: `Home · Career-Ops` → `Home · Northstar OS`

- [ ] **Step 3: Rename CSS class**

In `shell.css`: `.cairn-mark .stone` → `.star-mark path`. Remove old cairn-specific styles.

- [ ] **Step 4: Update overview greeting**

In `web/static/modules/panels/overview.js`, update any "Career-Ops" text to "Northstar OS".

- [ ] **Step 5: Replace favicon**

Replace `web/static/favicon.svg` with a clean star SVG in `--ink` tone:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#18181b"/>
</svg>
```

- [ ] **Step 6: Visual verification**

Screenshot sidebar + topbar in light and dark. Star mark should be monochrome (ink-colored). Text reads "Northstar OS". Favicon visible in browser tab.

- [ ] **Step 7: Commit**

```bash
git add web/index.html web/static/shell.css web/static/favicon.svg web/static/modules/panels/overview.js
git commit -m "feat(web): rebrand Career-Ops to Northstar OS with star mark"
```

---

### Task 3: Applications Table Redesign (Hero View)

**Files:**
- Modify: `web/static/modules/panels/applications.js` (rewrite table render)
- Modify: `web/static/shell.css` (add new table styles)

**Interfaces:**
- Consumes: Shadcn tokens from Task 1. Application data from `/api/applications` endpoint.
- Produces: Redesigned applications table with stacked company+role, status pills with semantic color, tiered score pills, archetype badge, next-action column.

**Design spec (from plan §9, adapted to shadcn):**
Columns: Company+Role (stacked) · Status pill (monochrome base, green/red for positive/negative states) · Score (tiered) · Archetype · Next action. Sortable, filterable.

- [ ] **Step 1: Read current applications.js to understand data shape**

```bash
cat web/static/modules/panels/applications.js
```

Identify: API endpoint, available fields, current column structure.

- [ ] **Step 2: Add new CSS for redesigned table**

```css
/* Northstar applications table — hero view */
.app-cell-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.app-cell-stack__company {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-cell-stack__role {
  font-size: 0.8125rem;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--r-pill);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

/* shadcn-style: monochrome base, chromatic only for semantic states */
.status-pill--evaluated { background: var(--surface-card); color: var(--muted); }
.status-pill--applied { background: color-mix(in srgb, var(--success) 14%, transparent); color: var(--success); }
.status-pill--interview { background: color-mix(in srgb, var(--success) 14%, transparent); color: var(--success); }
.status-pill--offer { background: color-mix(in srgb, var(--success) 20%, transparent); color: var(--success); font-weight: 700; }
.status-pill--responded { background: var(--surface-card); color: var(--ink); }
.status-pill--rejected { background: color-mix(in srgb, var(--error) 12%, transparent); color: var(--error); }
.status-pill--discarded { background: var(--surface-card); color: var(--muted); }
.status-pill--skip { background: var(--surface-card); color: var(--muted-soft); }

.archetype-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--r-pill);
  font-size: 0.6875rem;
  font-weight: 500;
  background: var(--surface-card);
  color: var(--muted);
  border: 1px solid var(--hairline);
  text-transform: capitalize;
  white-space: nowrap;
}

.next-action-cell {
  font-size: 0.8125rem;
  color: var(--muted);
}

.next-action-cell--due {
  color: var(--ink);
  font-weight: 500;
}
```

- [ ] **Step 3: Rewrite table header in applications.js**

New column order: `# | Company + Role | Status | Score | Archetype | Next Action | Report | PDF | Apply`

Remove noise columns to an expand-row or side drawer: recruiter, email, location, remote, salary, exp, contract, via, legit, followup, source.

- [ ] **Step 4: Rewrite row renderer**

Each row renders:
- **#** — app number (monospace, clickable)
- **Company+Role** — stacked with `.app-cell-stack`
- **Status** — `.status-pill--{status.toLowerCase()}`
- **Score** — `.score-pill--high/mid/low` (≥4.0 high/green, ≥3.0 mid/warning, <3.0 low/muted)
- **Archetype** — `.archetype-badge` if present, else `—`
- **Next action** — from `next_action` field or status-derived default
- **Report/PDF/Apply** — existing action buttons

- [ ] **Step 5: Add sort headers**

Make Company, Status, Score columns clickable to sort. In-memory sort, click toggles asc/desc.

- [ ] **Step 6: Visual verification**

Screenshot applications panel with real data. Verify:
- Clean monochrome table with color only on status pills (green/red)
- Stacked company+role readable
- Score pills tier correctly
- F-pattern scannability

- [ ] **Step 7: Commit**

```bash
git add web/static/modules/panels/applications.js web/static/shell.css
git commit -m "feat(web): redesign applications table as hero worklist view"
```

---

### Task 4: De-Noise Mock Panels

**Files:**
- Modify: `web/static/modules/panels/linkedin.js`
- Modify: `web/static/modules/panels/portals.js`
- Modify: `web/static/modules/panels/discovery.js`
- Modify: `web/static/modules/panels/applications.js`

**Interfaces:**
- Consumes: Shadcn tokens from Task 1.
- Produces: Clean panels — no fake data. Real data or proper empty states.

- [ ] **Step 1: Audit linkedin.js mock data**

Read file. Replace mock content with empty state: "Connect LinkedIn to unlock content + comms." Remove hardcoded fake posts/stats.

- [ ] **Step 2: Audit portals.js mock data**

Read file. Replace hardcoded portal lists with data from `/api/portals`. Remove placeholder strings.

- [ ] **Step 3: Audit discovery.js mock data**

Read file (697 lines). Replace mock stats/counts with real API data or proper empty states.

- [ ] **Step 4: Verify applications.js has no mock rows**

After Task 3 rewrite, confirm all data comes from `/api/applications`.

- [ ] **Step 5: Consistent empty states**

Shadcn-style empty state:
```css
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--muted);
}

.empty-state__msg {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink);
  margin: 0 0 4px;
}

.empty-state__hint {
  font-size: 0.8125rem;
  color: var(--muted);
  margin: 0;
}
```

- [ ] **Step 6: Visual verification**

Screenshot cleaned panels. No mock data visible. Clean empty states where no data.

- [ ] **Step 7: Commit**

```bash
git add web/static/modules/panels/linkedin.js web/static/modules/panels/portals.js web/static/modules/panels/discovery.js web/static/modules/panels/applications.js web/static/shell.css
git commit -m "fix(web): remove mock data from panels, add shadcn-style empty states"
```

---

### Task 5: Consistency Pass — Headers, Buttons, Spacing

**Files:**
- Modify: `web/static/shell.css`
- Modify: `web/index.html` (if structural inconsistencies)
- Modify: various panel JS files

**Interfaces:**
- Consumes: All shadcn tokens from Task 1.
- Produces: Visually unified panels.

- [ ] **Step 1: Audit panel headers**

Normalize all to `.section-head` + `.section-title`. Sans-serif (system font), 15px, weight 600.

- [ ] **Step 2: Audit button consistency**

All buttons use `.btn` / `.btn--primary` / `.btn--ghost` / `.btn--sm`. shadcn primary = near-black on light. Ghost = transparent + border.

- [ ] **Step 3: Normalize card padding to 4px grid**

Current: `18px 20px`. Change to `20px` (symmetric, on-grid).

- [ ] **Step 4: Replace orphaned aliases**

Ensure `--foreground: var(--ink)` and `--foreground-muted: var(--muted)` are defined or replaced everywhere.

- [ ] **Step 5: Kill serif references**

Search all panel JS for `var(--serif)` or `var(--font-display)` references. Replace with `var(--sans)`. shadcn is mono-family.

- [ ] **Step 6: Visual verification**

Walkthrough all 18 panels. Consistent headers, cards, buttons. No old-theme colors. Screenshot 4-5 panels in both modes.

- [ ] **Step 7: Commit**

```bash
git add web/static/shell.css web/index.html web/static/modules/panels/
git commit -m "style(web): normalize headers, buttons, cards to shadcn consistency"
```

---

### Task 6: Final Polish + DESIGN.md Rewrite

**Files:**
- Modify: `web/DESIGN.md` (complete rewrite)
- Modify: `web/static/shell.css` (dead CSS cleanup)

**Interfaces:**
- Consumes: All work from Tasks 1–5.
- Produces: Updated design docs, clean CSS.

- [ ] **Step 1: Remove dead CSS**

Search for selectors not referenced in HTML or JS:
- `.cairn-mark` (replaced by `.star-mark`)
- Old Catppuccin classes
- Orphaned serif/display rules

- [ ] **Step 2: Rewrite `web/DESIGN.md`**

New doc structure:
- **Philosophy:** Clean, monochrome, structural. Color for semantics only (green success, red danger). No hue accent.
- **Token reference:** shadcn zinc palette, light + dark
- **Typography:** System sans only, no serif display. Weights: 400 body, 500 UI, 600 headings.
- **Spacing:** 4px grid
- **Radius:** 8px default (shadcn `--radius`)
- **Agent rules:** No colored accents. Primary inverts in dark mode. Test both modes.

- [ ] **Step 3: Sort `:root` token block**

Order: 1) Fonts 2) Colors 3) Surfaces 4) Hairlines 5) Text 6) Semantic 7) Radii 8) Spacing 9) Shadow 10) Layout 11) Deprecated aliases

- [ ] **Step 4: Full visual verification**

Complete walkthrough — all panels, both modes. No terracotta remnants, no warm tints, no Spectral/serif leaking through. Pure shadcn zinc.

- [ ] **Step 5: Commit**

```bash
git add web/static/shell.css web/DESIGN.md
git commit -m "chore(web): finalize shadcn design system, rewrite DESIGN.md, remove dead CSS"
```

---

## Summary

| Task | What | Size |
|------|------|------|
| 1 | Token system — shadcn zinc palette swap | Medium-Large |
| 2 | Rebrand sidebar + topbar → Northstar OS | Small |
| 3 | Applications table redesign (hero worklist) | Large |
| 4 | De-noise mock panels | Medium |
| 5 | Consistency pass (headers, buttons, cards) | Medium |
| 6 | Final polish + DESIGN.md rewrite | Small |

**Total: 6 tasks, ~3,947 lines CSS to refactor, 18 panels to verify.**

Key difference from original plan: monochrome palette means color is ONLY semantic (green/red). Brand identity comes from clean geometry + the star mark, not a signature hue. This is the shadcn way.
