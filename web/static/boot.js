/** Boot Northstar OS Web */

document.addEventListener('DOMContentLoaded', () => {
  // nav items → panel switching
  document.querySelectorAll('.nav-item[data-panel]').forEach((btn) => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });

  // modal close handlers
  document.querySelectorAll('[data-close-pdf]').forEach((el) => {
    el.addEventListener('click', closePdfPreview);
  });
  document.querySelectorAll('[data-close-apply]').forEach((el) => {
    el.addEventListener('click', closeApplyModal);
  });
  document.querySelectorAll('[data-close-template-preview]').forEach((el) => {
    el.addEventListener('click', closeTemplatePreview);
  });
  document.querySelectorAll('[data-close-report-drawer]').forEach((el) => {
    el.addEventListener('click', closeReportDrawer);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePdfPreview();
      closeApplyModal();
      closeTemplatePreview();
      closeReportDrawer();
      closePopup();
    }
  });

  // topbar refresh button
  const refreshBtn = $('btnRefresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      try {
        await refreshAll();
        showToast('Synced');
      } finally {
        refreshBtn.disabled = false;
      }
    });
  }

  // health → version + user chip
  api('/api/health')
    .then((h) => {
      const ver = $('sidebarVersion');
      if (ver) ver.textContent = h.version ? `v${h.version}` : '';

      if (h.userName) {
        const initials = h.userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        ['userAvatar', 'popupAvatar'].forEach(id => {
          const el = $(id); if (el) el.textContent = initials;
        });
        const nm = $('userName'); if (nm) nm.textContent = h.userName;
        const pnm = $('popupName'); if (pnm) pnm.textContent = h.userName;
      }
      if (h.userRole) {
        const rl = $('userRole'); if (rl) rl.textContent = h.userRole;
        const prl = $('popupRole'); if (prl) prl.textContent = h.userRole;
      }
    })
    .catch(() => {});

  // user chip popup
  const userChip = $('userChip');
  const sidePopup = $('sidePopup');

  function closePopup() {
    if (!sidePopup) return;
    sidePopup.hidden = true;
    if (userChip) userChip.setAttribute('aria-expanded', 'false');
  }

  if (userChip && sidePopup) {
    userChip.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !sidePopup.hidden;
      if (isOpen) {
        closePopup();
      } else {
        sidePopup.hidden = false;
        userChip.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('click', (e) => {
      if (!sidePopup.hidden && !sidePopup.contains(e.target) && e.target !== userChip) {
        closePopup();
      }
    });
  }

  // popup: items that close popup and navigate
  document.querySelectorAll('[data-close-popup]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closePopup();
      if (btn.dataset.panel) switchPanel(btn.dataset.panel);
    });
  });

  // popup: theme toggle
  const popupThemeBtn = $('popupThemeBtn');
  if (popupThemeBtn) {
    popupThemeBtn.addEventListener('click', () => {
      const dark = document.documentElement.classList.contains('dark');
      CareerOpsTheme.set(dark ? 'light' : 'dark');
      closePopup();
    });
  }

  // popup: refresh
  const popupRefreshBtn = $('popupRefreshBtn');
  if (popupRefreshBtn) {
    popupRefreshBtn.addEventListener('click', async () => {
      closePopup();
      popupRefreshBtn.disabled = true;
      try {
        await refreshAll();
        showToast('Synced');
      } finally {
        popupRefreshBtn.disabled = false;
      }
    });
  }

  // initial panel from URL hash
  const initialPanel = panelFromHash() || 'overview';
  switchPanel(initialPanel, { pushHash: false });

  window.addEventListener('popstate', () => {
    const panel = panelFromHash() || history.state?.panel || 'overview';
    switchPanel(panel, { pushHash: false });
  });

  // update inbox badge after snapshot loads
  ensureSnapshot().then((snap) => {
    const badge = $('navCountInbox');
    if (badge && snap.metrics?.pipelinePending > 0) {
      badge.textContent = snap.metrics.pipelinePending;
    }
  }).catch(() => {});
});
