import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const PORTALS_FILE = 'portals.yml';

const AUTOMATED_PROVIDERS = ['greenhouse', 'ashby', 'lever', 'local-parser'];

export function portalsPath(root) {
  return join(root, PORTALS_FILE);
}

/** How scan.mjs will treat this company (heuristic for UI; matches provider detect rules). */
export function inferCompanyScanSource(company) {
  const url = (company.careers_url || company.careersUrl || '').toLowerCase();
  const api = (company.api || '').toLowerCase();
  const parser = company.parser || {};

  if (parser.command || parser.script || (Array.isArray(parser.args) && parser.args.length)) {
    return {
      provider: 'local-parser',
      methodLabel: 'Local parser script',
      inAutomatedScan: true,
      badge: 'parser',
    };
  }

  if (company.provider) {
    const id = String(company.provider);
    return {
      provider: id,
      methodLabel: `${id} (explicit)`,
      inAutomatedScan: AUTOMATED_PROVIDERS.includes(id),
      badge: id,
    };
  }

  if (api.includes('greenhouse.io') || url.includes('greenhouse')) {
    return {
      provider: 'greenhouse',
      methodLabel: 'Greenhouse Jobs API',
      inAutomatedScan: true,
      badge: 'greenhouse',
    };
  }

  if (url.includes('ashbyhq.com') || api.includes('ashbyhq')) {
    return {
      provider: 'ashby',
      methodLabel: 'Ashby Jobs API',
      inAutomatedScan: true,
      badge: 'ashby',
    };
  }

  if (url.includes('lever.co') || api.includes('lever')) {
    return {
      provider: 'lever',
      methodLabel: 'Lever Jobs API',
      inAutomatedScan: true,
      badge: 'lever',
    };
  }

  if (company.scan_method === 'websearch' || company.scanMethod === 'websearch') {
    return {
      provider: null,
      methodLabel: 'Web search (agent only)',
      inAutomatedScan: false,
      badge: 'websearch',
      warning:
        'Run scan button uses APIs only. Use /career-ops scan in your assistant for this company.',
    };
  }

  return {
    provider: null,
    methodLabel: 'No API match',
    inAutomatedScan: false,
    badge: 'skip',
    warning: 'Automated scan may skip this company until API URL or provider is set.',
  };
}

function parseSearchQueries(list) {
  return (list || []).map((q, index) => ({
    index,
    name: q.name || `Query ${index + 1}`,
    query: q.query || '',
    enabled: q.enabled !== false,
  }));
}

export function loadPortalsFull(root) {
  const path = portalsPath(root);
  if (!existsSync(path)) {
    return { error: 'portals.yml not found — copy from templates/portals.example.yml' };
  }
  const raw = readFileSync(path, 'utf8');
  const data = yaml.load(raw) || {};

  const companiesRaw = data.tracked_companies || [];
  const companies = companiesRaw.map((c) => {
    const scan = inferCompanyScanSource(c);
    return {
      name: c.name,
      enabled: c.enabled !== false,
      careersUrl: c.careers_url || '',
      api: c.api || '',
      provider: c.provider || '',
      scanMethod: c.scan_method || '',
      scanQuery: c.scan_query || '',
      notes: c.notes || '',
      hasParser: !!(c.parser?.command || c.parser?.script),
      ...scan,
    };
  });

  const titleFilter = data.title_filter || {};
  const loc = data.location_filter || {};
  const searchQueries = parseSearchQueries(data.search_queries);

  const enabledCompanies = companies.filter((c) => c.enabled);
  const automatedTargets = enabledCompanies.filter((c) => c.inAutomatedScan);
  const agentOnlyCompanies = enabledCompanies.filter((c) => !c.inAutomatedScan);

  const byProvider = {};
  for (const c of companies) {
    const key = c.badge || 'other';
    byProvider[key] = (byProvider[key] || 0) + 1;
  }

  return {
    enabledCount: enabledCompanies.length,
    totalCount: companies.length,
    automatedScanCount: automatedTargets.length,
    agentOnlyCount: agentOnlyCompanies.length,
    searchQueriesEnabled: searchQueries.filter((q) => q.enabled).length,
    searchQueriesTotal: searchQueries.length,
    titleFilter: {
      positive: titleFilter.positive || [],
      negative: titleFilter.negative || [],
      seniorityBoost: titleFilter.seniority_boost || [],
    },
    locationFilter: {
      allow: loc.allow || [],
      block: loc.block || [],
      alwaysAllow: loc.always_allow || [],
    },
    searchQueries,
    companies,
    automatedProviders: AUTOMATED_PROVIDERS,
    byProvider,
    raw,
    path: PORTALS_FILE,
  };
}

export function savePortalsStructured(root, patch) {
  const path = portalsPath(root);
  const raw = readFileSync(path, 'utf8');
  const data = yaml.load(raw) || {};

  if (patch.titleFilter) {
    data.title_filter = {
      ...(data.title_filter || {}),
      positive: patch.titleFilter.positive ?? data.title_filter?.positive,
      negative: patch.titleFilter.negative ?? data.title_filter?.negative,
    };
  }

  if (patch.locationFilter) {
    data.location_filter = {
      ...(data.location_filter || {}),
      allow: patch.locationFilter.allow ?? data.location_filter?.allow,
      block: patch.locationFilter.block ?? data.location_filter?.block,
    };
    if (patch.locationFilter.alwaysAllow !== undefined) {
      if (patch.locationFilter.alwaysAllow.length) {
        data.location_filter.always_allow = patch.locationFilter.alwaysAllow;
      } else {
        delete data.location_filter.always_allow;
      }
    }
  }

  if (patch.companies?.length && Array.isArray(data.tracked_companies)) {
    const byName = new Map(patch.companies.map((c) => [c.name, c.enabled]));
    for (const company of data.tracked_companies) {
      if (company?.name && byName.has(company.name)) {
        company.enabled = byName.get(company.name);
      }
    }
  }

  if (patch.searchQueries?.length && Array.isArray(data.search_queries)) {
    const byIndex = new Map(patch.searchQueries.map((q) => [q.index, q.enabled]));
    data.search_queries.forEach((q, i) => {
      if (byIndex.has(i)) {
        q.enabled = byIndex.get(i);
      }
    });
  }

  const out = yaml.dump(data, { lineWidth: 100, noRefs: true });
  writeFileSync(path, out, 'utf8');
  return { saved: true, path: PORTALS_FILE };
}

export function savePortalsRaw(root, content) {
  writeFileSync(portalsPath(root), content, 'utf8');
  return { saved: true, path: PORTALS_FILE };
}
