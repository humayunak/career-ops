/**
 * Northstar OS theme: light | dark (toggle) | system (legacy localStorage only).
 */
(function initTheme(global) {
  const STORAGE_KEY = 'career-ops-theme';
  const VALID = new Set(['light', 'dark', 'system']);

  let systemMq = null;
  let onSystemChange = null;

  function normalize(value) {
    const key = typeof value === 'string' ? value.trim().toLowerCase() : '';
    return VALID.has(key) ? key : 'system';
  }

  function isDarkApplied() {
    return document.documentElement.classList.contains('dark');
  }

  function applyResolved(isDark) {
    document.documentElement.classList.toggle('dark', !!isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    syncToggle();
  }

  function apply(theme) {
    const next = normalize(theme);
    if (systemMq && onSystemChange) {
      systemMq.removeEventListener('change', onSystemChange);
      systemMq = null;
      onSystemChange = null;
    }
    if (next === 'system') {
      systemMq = global.matchMedia('(prefers-color-scheme: dark)');
      onSystemChange = () => applyResolved(systemMq.matches);
      applyResolved(systemMq.matches);
      systemMq.addEventListener('change', onSystemChange);
    } else {
      applyResolved(next === 'dark');
    }
    return next;
  }

  function get() {
    return normalize(localStorage.getItem(STORAGE_KEY));
  }

  function set(theme) {
    const next = apply(theme);
    localStorage.setItem(STORAGE_KEY, next);
    return next;
  }

  function syncToggle() {
    const btn = document.getElementById('btnTheme');
    if (!btn) return;
    const dark = isDarkApplied();
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function bindThemeToggle() {
    const btn = document.getElementById('btnTheme');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      set(isDarkApplied() ? 'light' : 'dark');
    });
    syncToggle();
  }

  apply(get());

  global.CareerOpsTheme = { get, set, apply, normalize, isDarkApplied, STORAGE_KEY };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindThemeToggle);
  } else {
    bindThemeToggle();
  }
})(typeof window !== 'undefined' ? window : globalThis);
