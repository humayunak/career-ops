# Career-Ops Web UI — Claude Design System

**Claude palette** applied over the Cairn shell. Warm parchment canvas, literary serif headlines, terracotta accent. Feels like Claude.ai — deliberate, warm, unhurried.

**Backup:** `web-backup-pre-claude-design/` — original Cairn/Catppuccin state before this migration.

**Source files (canonical reference):**
- `web/design-system/Cairn Design System.html` — full living styleguide (open in browser)
- `web/design-system/Cairn Dashboard Shell.html` — app-shell prototype with sidebar, modals, popovers
- `web/static/shell.css` — **live token source of truth** (`:root` and `:root.dark` blocks)

---

## Philosophy

Three rules that keep the design feeling like Claude:

1. **Parchment, not cool gray.** `--canvas` (`#f5f4ed`) is the page floor — warm, paper-like. The sidebar (`--bg-sidebar` / `--surface-soft`) sits one step darker (`#efede5`). Active nav items use `--surface-solid` (`#ffffff`) to pop above the sidebar. Never use pure white as the canvas.
2. **Serif for display, sans for UI.** Spectral (weight 400, negative tracking) carries every headline. Never bold it. Schibsted Grotesk handles all body, nav, labels.
3. **Terracotta is scarce.** `--primary` / `--accent` (`#c96442`) on primary CTAs, active nav borders, active badges only. Depth comes from surface-color contrast, not shadows.

---

## Fonts

```html
<link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Schibsted+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Role | Family | Weight | Usage |
|------|--------|--------|-------|
| Display / serif | Spectral | 400 only | All `display-*` headings, page titles |
| Body / UI / sans | Schibsted Grotesk | 400–600 | Body, nav, buttons, labels |
| Code / mono | JetBrains Mono | 400 | Code, tokens, inline metadata |

**Rule:** Never use `font-weight: 700` on Spectral. Never use Schibsted for display headlines.

---

## Color tokens

### Brand & accent
| Token | Value | Use |
|-------|-------|-----|
| `--primary` | `#c96442` | Terracotta — CTAs, active states, full-bleed callouts |
| `--primary-active` | `#b85538` | Pressed / hover state |
| `--primary-soft` | `rgba(201,100,66,0.12)` | Tinted backgrounds (goal icons, badge-soft) |
| `--primary-disabled` | `#dddad0` | Disabled button fill |
| `--accent-amber` | `#c2843e` | Warm companion — category labels, tier eyebrows |
| `--accent-slate` | `#5a7689` | Cool companion — status, secondary data viz |
| `--focus-ring` | `#3898ec` | Input focus ring only (cool blue, WCAG) |

### Surface (light)
| Token | Value | Use |
|-------|-------|-----|
| `--canvas` | `#f5f4ed` | Default page floor (parchment) |
| `--surface-soft` | `#efede5` | Sidebar background |
| `--surface-card` | `#e8e6dc` | Feature cards, nav active state |
| `--surface-cream-strong` | `#dddad0` | Toggle switch off-state |
| `--surface-solid` | `#faf9f5` | Elevated/floating surfaces (ivory) |
| `--surface-dark` | `#141413` | Footer, code windows, dark product areas |
| `--surface-dark-elevated` | `#262522` | Elevated elements on dark surface |
| `--surface-dark-soft` | `#1e1d1a` | Softer dark surface |

### Hairlines
| Token | Value | Contrast note |
|-------|-------|---------------|
| `--hairline` | `#f0eee6` | Visible warm cream border on canvas |
| `--hairline-soft` | `#e8e6dc` | Softer dividers |
| `--hairline-dark` | `#3a3835` | On dark surfaces |

### Text (ink scale)
| Token | Value | WCAG on canvas |
|-------|-------|----------------|
| `--ink` | `#141413` | ~18:1 ✓ |
| `--body-strong` | `#27261f` | ~14:1 ✓ |
| `--body` | `#3d3c39` | ~9:1 ✓ |
| `--muted` | `#5e5d59` | ~5.3:1 ✓ AA |
| `--muted-soft` | `#87867f` | ~3.1:1 (captions only) |
| `--on-primary` | `#ffffff` | On terracotta backgrounds |
| `--on-dark` | `#edebe3` | Text on dark surfaces |
| `--on-dark-soft` | `#a3a197` | Muted text on dark surfaces |

### Semantic
| Token | Value | Use |
|-------|-------|-----|
| `--success` | `#4f9d6b` | Status dots, "on track" |
| `--warning` | `#cf9a2c` | Due-soon flags |
| `--error` | `#c14b42` | Validation errors |

### Dark theme overrides
Applied via `html.dark` on `<html>`:

| Token | Value | WCAG on surface-card (#2c2b28) |
|-------|-------|-------------------------------|
| `--canvas` | `#141413` | — |
| `--surface-soft` | `#262522` | — |
| `--surface-card` | `#2c2b28` | — |
| `--surface-cream-strong` | `#34322e` | — |
| `--primary-soft` | `rgba(201,100,66,0.14)` | — |
| `--hairline` | `rgba(237,235,227,0.15)` | Visible warm border |
| `--hairline-soft` | `rgba(237,235,227,0.10)` | — |
| `--ink` | `#edebe3` | ~14:1 ✓ |
| `--body-strong` | `#d9d7cf` | ~11:1 ✓ |
| `--body` | `#c4c2ba` | ~8:1 ✓ |
| `--muted` | `#b8b5ab` | ~5.1:1 ✓ AA |
| `--muted-soft` | `#a3a197` | ~3.9:1 (captions) |

---

## Typography scale

| Class | Family | Size | Weight | Line | Tracking |
|-------|--------|------|--------|------|---------|
| `.display-xl` | Spectral | clamp(40px, 6.4vw, 64px) | 400 | 1.04 | -0.025em |
| `.display-lg` | Spectral | clamp(34px, 5vw, 48px) | 400 | 1.10 | -0.02em |
| `.display-md` | Spectral | 36px | 400 | 1.15 | -0.015em |
| `.display-sm` | Spectral | 28px | 400 | 1.20 | -0.01em |
| `.title-lg` | Schibsted | 22px | 600 | 1.30 | — |
| `.title-md` | Schibsted | 18px | 600 | 1.40 | — |
| `.title-sm` | Schibsted | 16px | 600 | 1.40 | — |
| `.body-md` | Schibsted | 16px | 400 | 1.55 | — |
| `.eyebrow` | Schibsted | 12px | 600 | 1.40 | 0.14em uppercase |
| `.mono` | JetBrains | 14px | 400 | 1.60 | — |

---

## Spacing (4px base)

| Token | Value |
|-------|-------|
| `--s-xxs` | 4px |
| `--s-xs` | 8px |
| `--s-sm` | 12px |
| `--s-md` | 16px |
| `--s-lg` | 24px |
| `--s-xl` | 32px |
| `--s-xxl` | 48px |
| `--s-section` | 96px |

**Cards:** 32px internal padding. **Sections:** 96px between bands.

---

## Border radius

| Token | Value | Use |
|-------|-------|-----|
| `--r-xs` | 4px | Micro elements |
| `--r-sm` | 6px | Nav items, menu items |
| `--r-md` | 8px | Buttons, inputs |
| `--r-lg` | 12px | Cards |
| `--r-xl` | 16px | Modals |
| `--r-pill` | 9999px | Badges, tags |

---

## Elevation

Cairn is **color-block first** — depth comes from surface contrast, not shadows.

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | no shadow, no border | Body sections, nav, hero |
| Hairline | `1px --hairline` | Inputs, sub-nav |
| Stone card | `--surface-card` background | Feature cards |
| Dark surface | `--surface-dark` background | Code, terminal, footer |
| Subtle lift | `0 1px 3px rgba(26,28,25,.08)` | Hover states only |
| Pop | `0 12px 40px rgba(26,28,25,.16)` | Modals, popovers |

---

## Layout

```
html / body             height 100dvh, overflow hidden
#app                    CSS grid: var(--nav-w) 1fr; height 100vh
├── .side               sidebar — --surface-soft bg, hairline border-right
│   ├── .side-top       64px brand + collapse button
│   ├── .side-scroll    flex 1, overflow-y auto, nav items
│   └── .side-foot      user chip, hairline border-top
└── .main               flex column, overflow hidden
    ├── .topbar         64px, --canvas bg, hairline border-bottom
    └── .content        flex 1, overflow-y auto, 32px 36px padding
        └── .content-inner   max-width 1080px, centered
```

**Variables:**
- `--nav-w: 264px` (full) / `76px` (collapsed via `.app.collapsed`)
- `--maxw: 1120px` (marketing pages)

---

## Components

### Buttons
```css
.btn              /* base: 40px height, 8px radius, 14px 600 Schibsted */
.btn-primary      /* evergreen bg, white text */
.btn-secondary    /* canvas bg, ink text, hairline border */
.btn-on-dark      /* dark-elevated bg, on-dark text */
.btn-cream        /* canvas bg on dark sections — the "coral-equivalent" moment */
.btn-ghost        /* transparent bg, hairline border */
.btn-text         /* no bg, no border */
.btn-icon         /* 36×36px circle */
.btn-sm           /* 32px height variant */
```

### Badges & status
```css
.badge-pill       /* surface-card bg, ink text */
.badge-amber      /* amber bg, white text, uppercase */
.badge-soft       /* primary tint bg, primary-active text */
.status           /* dot + label, 13px */
```

### Cards
```css
.feature-card     /* surface-card bg, 12px radius, 32px padding */
.dark-card        /* surface-dark bg, on-dark text */
.compare-card     /* canvas bg, hairline border */
.price-card       /* canvas bg; .featured = surface-dark bg */
.callout          /* primary bg, on-primary text, 64px padding */
.code-window      /* surface-dark bg, code-bar + code-body */
```

### Navigation
```css
.nav-item         /* 14px 500, 9px 12px padding, r-md, muted text */
.nav-item.active  /* surface-card bg, ink text, 3px primary left accent bar */
.nav-item:hover   /* surface-card bg */
```

### Inputs
```css
.input            /* 40px height, hairline border, canvas bg, r-md */
.input:focus      /* primary border, 3px primary ring */
```

### Tabs
```css
.tabs             /* surface-soft bg, 4px padding, r-md */
.tab              /* 14px 500, muted text */
.tab.active       /* canvas bg, ink text, shadow-soft */
```

### Modal / Settings
```css
.scrim            /* fixed inset, rgba(20,22,19,.42), backdrop-blur(3px) */
.modal            /* canvas bg, r-xl, shadow-pop, pop animation */
.settings         /* 2-col grid: 232px rail + flex panel */
```

### Switch
```css
.switch           /* 44×26px, cream-strong bg off, primary bg on */
.switch.on i      /* thumb slides right */
```

---

## Patterns

### Do
- Anchor every page on the limestone canvas (`--canvas` #f6f4ee)
- Spectral serif for every display headline — weight 400 only
- Alternate cream feature cards with dark product mockups (band pacing)
- Reserve evergreen for primary CTAs and full-bleed callout cards
- Show real product chrome (code, ladders, terminals) over illustration
- Keep 96px between bands, 32px inside cards

### Don't
- Never use cool gray or pure white as the canvas
- Never bold Spectral display — weight 700 reads as bombastic
- Never paint evergreen everywhere — scarcity is its power
- Never introduce a 4th surface tone (limestone + evergreen + dark = the trinity)
- Never use sans for display headlines
- Never repeat the same surface mode in consecutive bands

---

## Responsive breakpoints

| Breakpoint | Width | Changes |
|------------|-------|---------|
| Mobile | < 768px | Sidebar collapses to 76px; hero 64→34px; cards stack 1-up |
| Tablet | 768–1024px | Nav tightens; feature cards 2-up; pricing 2-up |
| Desktop | 1024–1440px | Full nav; 3-up cards; 3-up pricing |
| Wide | > 1440px | Content caps at 1120px with extra outer breathing room |

At ≤ 860px in the app shell, sidebar auto-collapses and stat/panel rows stack to 1 column.

---

## Shell token aliases (backward compat)

Panel markup uses these aliases — they map to the canonical token:

| Alias | Resolves to | Light value | Dark value |
|-------|-------------|-------------|------------|
| `--bg` | `--canvas` | `#f5f4ed` | `#141413` |
| `--bg-sidebar` | `--surface-soft` | `#efede5` | `#262522` |
| `--surface-solid` | (own value) | `#ffffff` | `#2c2b28` |
| `--text` | `--ink` | `#141413` | `#edebe3` |
| `--text-muted` | `--muted` | `#5e5d59` | `#b8b5ab` |
| `--text-faint` | `--muted-soft` | `#87867f` | `#a3a197` |
| `--border` | `--hairline` | `#f0eee6` | `rgba(237,235,227,.15)` |
| `--accent` | (own value) | `#c96442` | `#c96442` |
| `--accent-cta` | `--accent` | `#c96442` | `#c96442` |
| `--focus-ring` | (own value) | `#3898ec` | `#3898ec` |
| `--radius-sm` | `--r-md` | 8px | 8px |
| `--radius-md` | `--r-lg` | 12px | 12px |
| `--sidebar-w` | `--nav-w` | 264px | 264px |
| `--header-h` | (own value) | 64px | 64px |

### Surface ladder (light → dark)

```
Light:  --canvas #f5f4ed → --surface-soft #efede5 → --surface-card #e8e6dc → --surface-cream-strong #dddad0
Dark:   --canvas #141413 → --surface-soft #262522 → --surface-card #2c2b28 → --surface-cream-strong #34322e
```

Key rule: **sidebar uses `--bg-sidebar` (one step darker than canvas); active nav uses `--surface-solid` (one step lighter/white), so it pops above the sidebar.**

---

## Agent rules

1. **Semantic tokens only** — never hardcode hex values in component CSS. All hex lives in `:root` and `:root.dark` inside `shell.css`.
2. **Test light + dark** after any visual change.
3. **No cool gray, no pure white for canvas** — always `--canvas` (`#f5f4ed`). Pure white (`#ffffff`) is reserved for `--surface-solid` (elevated dropdowns, active nav items).
4. **No drop shadows on cards** — use surface color contrast instead (`--surface-soft` → `--surface-card` ladder).
5. **Spectral weight 400** for all display/serif elements — never 600 or 700.
6. **Sidebar background** must use `var(--bg-sidebar)`, not `var(--surface-solid)` — they differ by design.
7. **Active nav item** background uses `var(--surface-solid)` to lift above `var(--bg-sidebar)`.
8. **Active tab** background uses `var(--surface-solid)` to lift above the tab strip (`--input-bg`).
9. **Focus ring** — inputs only use `var(--focus-ring)` (`#3898ec`). Do not use terracotta for focus.
10. **Backup:** `web-backup-pre-claude-design/` if you need to compare against the original Cairn/Catppuccin state.
