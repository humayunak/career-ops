/** Panel router — sidebar navigation */

const COW = {
  panel: 'overview',
  snapshot: null,
  commands: [],
};

const COW_PANELS = [
  { id: 'overview', title: 'Overview', group: 'Home' },
  { id: 'inbox', title: 'Inbox', group: 'Jobs' },
  { id: 'applications', title: 'Applications', group: 'Jobs' },
  { id: 'reports', title: 'Reports', group: 'Insights' },
  { id: 'patterns', title: 'Patterns', group: 'Insights' },
  { id: 'followups', title: 'Follow-ups', group: 'Insights' },
  { id: 'interviewprep', title: 'Interview prep', group: 'Insights' },
  { id: 'discovery', title: 'Discovery', group: 'Sources' },
  { id: 'linkedin', title: 'LinkedIn', group: 'Sources' },
  { id: 'profile', title: 'Profile', group: 'You' },
  { id: 'workflow', title: 'How it works', group: 'Help' },
  { id: 'commands', title: 'AI commands', group: 'Help' },
  { id: 'runs', title: 'Maintenance', group: 'Help' },
];

const COW_PANEL_IDS = {
  overview: 'mainOverview',
  inbox: 'mainInbox',
  applications: 'mainApplications',
  reports: 'mainReports',
  patterns: 'mainPatterns',
  followups: 'mainFollowups',
  interviewprep: 'mainInterviewprep',
  discovery: 'mainDiscovery',
  linkedin: 'mainLinkedin',
  profile: 'mainProfile',
  workflow: 'mainWorkflow',
  commands: 'mainCommands',
  runs: 'mainRuns',
};

const COW_LOADERS = {
  commands: loadCommandsPanel,
  workflow: loadWorkflowPanel,
  overview: loadOverviewPanel,
  inbox: loadInboxPanel,
  applications: loadApplicationsPanel,
  reports: loadReportsPanel,
  patterns: loadPatternsPanel,
  followups: loadFollowupsPanel,
  interviewprep: loadInterviewPrepPanel,
  discovery: loadDiscoveryPanel,
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
