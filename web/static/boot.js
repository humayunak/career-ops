/** Boot Career-Ops Web */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sidebar-nav__item[data-panel]').forEach((btn) => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });

  document.querySelectorAll('[data-close-pdf]').forEach((el) => {
    el.addEventListener('click', closePdfPreview);
  });
  document.querySelectorAll('[data-close-apply]').forEach((el) => {
    el.addEventListener('click', closeApplyModal);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePdfPreview();
      closeApplyModal();
    }
  });

  const refreshBtn = $('btnRefresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      try {
        await refreshAll();
        showToast('Synced');
      } catch (e) {
        showToast(e.message);
      } finally {
        refreshBtn.disabled = false;
      }
    });
  }

  api('/api/health')
    .then((h) => {
      const ver = $('sidebarVersion');
      if (ver) ver.textContent = h.version ? `v${h.version}` : 'local';
    })
    .catch(() => {});

  switchPanel('overview');
});
