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
  { id: 'patterns', title: 'Patterns', group: 'Insights' },
  { id: 'followups', title: 'Follow-ups', group: 'Insights' },
  { id: 'interviewprep', title: 'Interview prep', group: 'Insights' },
  { id: 'discovery', title: 'Discovery', group: 'Sources' },
  { id: 'linkedin', title: 'LinkedIn', group: 'Sources' },
  { id: 'baseresumes', title: 'Base resumes', group: 'You' },
  { id: 'templates', title: 'Resume templates', group: 'You' },
  { id: 'profile', title: 'Profile', group: 'You' },
  { id: 'workflow', title: 'How it works', group: 'Help' },
  { id: 'commands', title: 'AI commands', group: 'Help' },
  { id: 'runs', title: 'Maintenance', group: 'Help' },
  { id: 'reports', title: 'Reports', group: 'Jobs' },
  { id: 'mindmap', title: 'Mind map', group: 'Insights' },
  { id: 'portals', title: 'Portals (legacy)', group: 'Sources' },
  { id: 'files', title: 'Files', group: 'Help' },
];

const COW_PANEL_IDS = {
  overview: 'mainOverview',
  inbox: 'mainInbox',
  applications: 'mainApplications',
  patterns: 'mainPatterns',
  followups: 'mainFollowups',
  interviewprep: 'mainInterviewprep',
  discovery: 'mainDiscovery',
  linkedin: 'mainLinkedin',
  baseresumes: 'mainBaseResumes',
  templates: 'mainTemplates',
  profile: 'mainProfile',
  workflow: 'mainWorkflow',
  commands: 'mainCommands',
  runs: 'mainRuns',
  reports: 'mainReports',
  mindmap: 'mainMindmap',
  portals: 'mainPortals',
  files: 'mainFiles',
};

const COW_LOADERS = {
  commands: loadCommandsPanel,
  workflow: loadWorkflowPanel,
  overview: loadOverviewPanel,
  inbox: loadInboxPanel,
  applications: loadApplicationsPanel,
  patterns: loadPatternsPanel,
  followups: loadFollowupsPanel,
  interviewprep: loadInterviewPrepPanel,
  discovery: loadDiscoveryPanel,
  linkedin: loadLinkedinPanel,
  baseresumes: loadBaseResumesPanel,
  templates: loadTemplatesPanel,
  profile: loadProfilePanel,
  runs: loadRunsPanel,
  reports: loadReportsPanel,
  mindmap: loadMindmapPanel,
  portals: loadPortalsPanel,
  files: loadFilesPanel,
};

function panelFromHash() {
  const id = (location.hash || '').replace(/^#/, '').trim();
  return id && COW_LOADERS[id] ? id : null;
}

async function switchPanel(name, options = {}) {
  const { pushHash = true } = options;
  if (!COW_LOADERS[name]) return;
  COW.panel = name;

  document.querySelectorAll('.nav-item[data-panel]').forEach((btn) => {
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
  if (sub && meta) sub.textContent = `${meta.group} · Northstar OS`;

  if (pushHash) {
    const nextHash = `#${name}`;
    if (location.hash !== nextHash) {
      history.pushState({ panel: name }, '', nextHash);
    }
  }

  const scroll = document.getElementById('mainScroll');
  if (scroll) scroll.scrollTop = 0;

  await COW_LOADERS[name]();
}

async function refreshAll() {
  COW.snapshot = await api('/api/snapshot');
  await switchPanel(COW.panel);
}

function invalidateSnapshot() {
  COW.snapshot = null;
}
