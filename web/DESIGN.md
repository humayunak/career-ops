# Northstar OS — shadcn/zinc Design System

**Monochrome zinc palette** — brand identity through clean geometry and typography, not hue. Color is reserved for semantic states only (green success, red danger).

**Source of truth:** `web/static/shell.css` (`:root` and `:root.dark` blocks)

---

## Philosophy

1. **Monochrome first.** Primary is near-black on light (`#18181b`), near-white on dark (`#fafafa`). No hue accent. Depth from zinc surface steps, not color.
2. **System fonts only.** No web font imports. The OS sans stack renders fast and familiar.
3. **Color = semantics.** Green for success/active. Red for danger/error. Amber for warnings. Everything else is zinc grayscale.

---

## Fonts

No external imports — system stack only.

| Role | Stack | Weight | Usage |
|------|-------|--------|-------|
| Sans / UI | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | 400–600 | All text |
| Mono | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace` | 400 | Code, metadata |

**Rule:** 400 for body, 500 for UI labels, 600 for headings. No 700 in the system.

---

## Color tokens

### Primary (inverts in dark mode)
| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--primary` | `#18181b` | `#fafafa` | CTAs, active states |
| `--primary-active` | `#09090b` | `#e4e4e7` | Pressed/hover |
| `--primary-soft` | `rgba(24,24,27,0.08)` | `rgba(250,250,250,0.08)` | Tinted backgrounds |
| `--primary-ink` | `#fafafa` | `#18181b` | Text on primary bg |
| `--on-primary` | `#fafafa` | `#18181b` | Same as primary-ink |

### Surface (zinc ladder)
| Token | Light | Dark |
|-------|-------|------|
| `--canvas` | `#ffffff` | `#09090b` |
| `--surface-soft` | `#fafafa` | `#0c0c0e` |
| `--surface-card` | `#f4f4f5` | `#18181b` |
| `--surface-cream-strong` | `#e4e4e7` | `#27272a` |

### Hairlines
| Token | Light | Dark |
|-------|-------|------|
| `--hairline` | `#e4e4e7` | `#27272a` |
| `--hairline-soft` | `#f4f4f5` | `#18181b` |

### Text (zinc ink scale)
| Token | Light | Dark |
|-------|-------|------|
| `--ink` | `#09090b` | `#fafafa` |
| `--body-strong` | `#18181b` | `#e4e4e7` |
| `--body` | `#27272a` | `#d4d4d8` |
| `--muted` | `#71717a` | `#a1a1aa` |
| `--muted-soft` | `#a1a1aa` | `#71717a` |

### Semantic
| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--success` | `#16a34a` | `#22c55e` | Active, on track |
| `--warning` | `#f59e0b` | `#f59e0b` | Due soon, pending |
| `--error` | `#dc2626` | `#ef4444` | Errors, rejected |

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

---

## Border radius

| Token | Value | Use |
|-------|-------|-----|
| `--r-xs` | 4px | Micro elements |
| `--r-sm` | 6px | Nav items |
| `--r-md` | 8px | Buttons, inputs, cards (shadcn default) |
| `--r-lg` | 12px | Larger cards |
| `--r-xl` | 16px | Modals |
| `--r-pill` | 9999px | Badges, pills |

---

## Elevation

Depth from surface contrast, not shadows. Shadows used sparingly:

| Level | Treatment |
|-------|-----------|
| Flat | No shadow, no border |
| Hairline | `1px var(--hairline)` border |
| Card | `var(--surface-card)` background |
| Soft lift | `--shadow-soft` — hover states |
| Pop | `--shadow-pop` — modals, popovers |

---

## Agent rules

1. **Semantic tokens only** — never hardcode hex in component CSS. All hex lives in `:root` / `:root.dark`.
2. **Test light + dark** after every visual change.
3. **Primary inverts** — near-black on light, near-white on dark. `--on-primary` flips too.
4. **No colored accents** — only `--success`, `--warning`, `--error` carry hue.
5. **No serif** — system sans for everything. No Spectral, no font-display.
6. **No shadows on cards** — use surface-color ladder for depth.
7. **Status pills** use `status-pill--{status}` classes, not inline color.
8. **Focus ring** uses `--primary` (monochrome), not a blue ring.
9. **4px spacing grid** — all padding/margin/gap must be multiples of 4.
