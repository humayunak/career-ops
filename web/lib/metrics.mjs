/** Metrics — ported from dashboard/internal/data/career.go */

export function normalizeStatus(raw) {
  let s = (raw || '').replace(/\*\*/g, '').trim().toLowerCase();
  const dateIdx = s.indexOf(' 202');
  if (dateIdx > 0) s = s.slice(0, dateIdx).trim();

  if (s.includes('no aplicar') || s.includes('no_aplicar') || s === 'skip' || s.includes('geo blocker')) {
    return 'skip';
  }
  if (s.includes('interview') || s.includes('entrevista')) return 'interview';
  if (s === 'offer' || s.includes('oferta')) return 'offer';
  if (s.includes('responded') || s.includes('respondido')) return 'responded';
  if (
    s.includes('applied') ||
    s.includes('aplicado') ||
    s === 'enviada' ||
    s === 'aplicada' ||
    s === 'sent'
  ) {
    return 'applied';
  }
  if (s.includes('rejected') || s.includes('rechazado') || s === 'rechazada') return 'rejected';
  if (
    s.includes('discarded') ||
    s.includes('descartado') ||
    s === 'descartada' ||
    s === 'cerrada' ||
    s === 'cancelada' ||
    s.startsWith('duplicado') ||
    s.startsWith('dup')
  ) {
    return 'discarded';
  }
  if (
    s.includes('evaluated') ||
    s.includes('evaluada') ||
    s === 'condicional' ||
    s === 'hold' ||
    s === 'monitor' ||
    s === 'evaluar' ||
    s === 'verificar'
  ) {
    return 'evaluated';
  }
  return s;
}

function safePct(n, d) {
  if (!d) return 0;
  return Math.round((n / d) * 1000) / 10;
}

export function computeMetrics(apps) {
  const byStatus = {};
  let totalScore = 0;
  let scored = 0;
  let topScore = 0;
  let withPdf = 0;
  let actionable = 0;

  for (const app of apps) {
    const status = normalizeStatus(app.status);
    byStatus[status] = (byStatus[status] || 0) + 1;
    if (app.score > 0) {
      totalScore += app.score;
      scored++;
      if (app.score > topScore) topScore = app.score;
    }
    if (app.hasPdf) withPdf++;
    if (!['skip', 'rejected', 'discarded'].includes(status)) actionable++;
  }

  return {
    total: apps.length,
    byStatus,
    avgScore: scored ? Math.round((totalScore / scored) * 100) / 100 : 0,
    topScore,
    withPdf,
    actionable,
  };
}

export function computeProgressMetrics(apps) {
  const statusCounts = {};
  let totalScore = 0;
  let scored = 0;
  let topScore = 0;
  let totalOffers = 0;
  let activeApps = 0;

  for (const app of apps) {
    const norm = normalizeStatus(app.status);
    statusCounts[norm] = (statusCounts[norm] || 0) + 1;
    if (app.score > 0) {
      totalScore += app.score;
      scored++;
      if (app.score > topScore) topScore = app.score;
    }
    if (norm === 'offer') totalOffers++;
    if (!['skip', 'rejected', 'discarded'].includes(norm)) activeApps++;
  }

  const total = apps.length;
  const applied =
    (statusCounts.applied || 0) +
    (statusCounts.responded || 0) +
    (statusCounts.interview || 0) +
    (statusCounts.offer || 0) +
    (statusCounts.rejected || 0);
  const responded =
    (statusCounts.responded || 0) + (statusCounts.interview || 0) + (statusCounts.offer || 0);
  const interview = (statusCounts.interview || 0) + (statusCounts.offer || 0);
  const offer = statusCounts.offer || 0;

  const buckets = [0, 0, 0, 0, 0];
  for (const app of apps) {
    if (app.score <= 0) continue;
    if (app.score >= 4.5) buckets[0]++;
    else if (app.score >= 4.0) buckets[1]++;
    else if (app.score >= 3.5) buckets[2]++;
    else if (app.score >= 3.0) buckets[3]++;
    else buckets[4]++;
  }

  return {
    funnelStages: [
      { label: 'Evaluated', count: total, pct: 100 },
      { label: 'Applied', count: applied, pct: safePct(applied, total) },
      { label: 'Responded', count: responded, pct: safePct(responded, applied) },
      { label: 'Interview', count: interview, pct: safePct(interview, applied) },
      { label: 'Offer', count: offer, pct: safePct(offer, applied) },
    ],
    scoreBuckets: [
      { label: '4.5–5.0', count: buckets[0] },
      { label: '4.0–4.4', count: buckets[1] },
      { label: '3.5–3.9', count: buckets[2] },
      { label: '3.0–3.4', count: buckets[3] },
      { label: '<3.0', count: buckets[4] },
    ],
    responseRate: applied ? Math.round((responded / applied) * 1000) / 10 : 0,
    interviewRate: applied ? Math.round((interview / applied) * 1000) / 10 : 0,
    offerRate: applied ? Math.round((offer / applied) * 1000) / 10 : 0,
    avgScore: scored ? Math.round((totalScore / scored) * 100) / 100 : 0,
    topScore,
    totalOffers,
    activeApps,
  };
}

/** TUI filter tabs from pipeline.go */
export const PIPELINE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'evaluated', label: 'Evaluated' },
  { id: 'applied', label: 'Applied' },
  { id: 'interview', label: 'Interview' },
  { id: 'top', label: 'Top ≥4' },
  { id: 'skip', label: 'SKIP' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'discarded', label: 'Discarded' },
];

export function filterApplications(apps, tabId, search = '') {
  let list = apps.map((a) => ({ ...a, normStatus: normalizeStatus(a.status) }));

  switch (tabId) {
    case 'evaluated':
      list = list.filter((a) => a.normStatus === 'evaluated');
      break;
    case 'applied':
      list = list.filter((a) => a.normStatus === 'applied');
      break;
    case 'interview':
      list = list.filter((a) => a.normStatus === 'interview' || a.normStatus === 'offer');
      break;
    case 'top':
      list = list.filter((a) => a.score >= 4);
      break;
    case 'skip':
      list = list.filter((a) => a.normStatus === 'skip');
      break;
    case 'rejected':
      list = list.filter((a) => a.normStatus === 'rejected');
      break;
    case 'discarded':
      list = list.filter((a) => a.normStatus === 'discarded');
      break;
    default:
      break;
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (a.notes || '').toLowerCase().includes(q),
    );
  }

  return list.sort((a, b) => (b.score || 0) - (a.score || 0));
}
