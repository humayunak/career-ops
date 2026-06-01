/** Panel router — sidebar navigation */

const COW = {
  panel: 'overview',
  snapshot: null,
  commands: [],
};

const COW_PANELS = [
  { id: 'overview', title: 'Overview', group: 'Work' },
  { id: 'inbox', title: 'Inbox', group: 'Work' },
  { id: 'applications', title: 'Applications', group: 'Work' },
  { id: 'reports', title: 'Reports', group: 'Work' },
  { id: 'portals', title: 'Portals', group: 'Sources' },
  { id: 'linkedin', title: 'LinkedIn', group: 'Sources' },
  { id: 'profile', title: 'Profile', group: 'You' },
  { id: 'runs', title: 'Runs', group: 'System' },
  { id: 'workflow', title: 'Workflow', group: 'System' },
  { id: 'commands', title: 'Commands', group: 'System' },
  { id: 'mindmap', title: 'Mindmap', group: 'System' },
];

const COW_PANEL_IDS = Object.fromEntries(
  COW_PANELS.map((p) => [p.id, `main${p.id.charAt(0).toUpperCase()}${p.id.slice(1)}`]),
);

const COW_LOADERS = {
  commands: loadCommandsPanel,
  workflow: loadWorkflowPanel,
  mindmap: loadMindmapPanel,
  overview: loadOverviewPanel,
  inbox: loadInboxPanel,
  applications: loadApplicationsPanel,
  reports: loadReportsPanel,
  portals: loadPortalsPanel,
  linkedin: loadLinkedinPanel,
  profile: loadProfilePanel,
  runs: loadRunsPanel,
};

async function switchPanel(name) {
  if (!COW_LOADERS[name]) return;
  COW.panel = name;

  document.querySelectorAll('.sidebar-nav__item[data-panel]').forEach((btn) => {
    const on = btn.dataset.panel === name;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-current', on ? 'page' : 'false');
  });

  document.querySelectorAll('.main-view').forEach((view) => {
    const active = view.id === COW_PANEL_IDS[name];
    view.classList.toggle('is-active', active);
    view.hidden = !active;
  });

  const meta = COW_PANELS.find((p) => p.id === name);
  const title = $('topbarTitle');
  const sub = $('topbarMeta');
  if (title && meta) title.textContent = meta.title;
  if (sub && meta) sub.textContent = `${meta.group} · Career-Ops`;

  await COW_LOADERS[name]();
}

async function refreshAll() {
  COW.snapshot = await api('/api/snapshot');
  await switchPanel(COW.panel);
}

function invalidateSnapshot() {
  COW.snapshot = null;
}
