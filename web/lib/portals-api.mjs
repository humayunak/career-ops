import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const PORTALS_FILE = 'portals.yml';

export function portalsPath(root) {
  return join(root, PORTALS_FILE);
}

export function loadPortalsFull(root) {
  const path = portalsPath(root);
  if (!existsSync(path)) {
    return { error: 'portals.yml not found — copy from templates/portals.example.yml' };
  }
  const raw = readFileSync(path, 'utf8');
  const data = yaml.load(raw) || {};
  const companies = (data.tracked_companies || []).map((c) => ({
    name: c.name,
    enabled: c.enabled !== false,
    careersUrl: c.careers_url || '',
    provider: c.provider || '',
  }));
  const titleFilter = data.title_filter || {};
  const loc = data.location_filter || {};
  return {
    enabledCount: companies.filter((c) => c.enabled).length,
    totalCount: companies.length,
    titleFilter: {
      positive: titleFilter.positive || [],
      negative: titleFilter.negative || [],
    },
    locationFilter: {
      allow: loc.allow || [],
      block: loc.block || [],
      alwaysAllow: loc.always_allow || [],
    },
    searchQueries: (data.search_queries || []).length,
    companies,
    raw,
    path: PORTALS_FILE,
  };
}

/** @deprecated */
export function loadPortalsSummary(root) {
  const full = loadPortalsFull(root);
  if (full.error) return full;
  return {
    ...full,
    titleFilterPositive: full.titleFilter.positive,
    titleFilterNegative: full.titleFilter.negative,
    locationFilter: full.locationFilter,
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

  const out = yaml.dump(data, { lineWidth: 100, noRefs: true });
  writeFileSync(path, out, 'utf8');
  return { saved: true, path: PORTALS_FILE };
}

export function savePortalsRaw(root, content) {
  writeFileSync(portalsPath(root), content, 'utf8');
  return { saved: true, path: PORTALS_FILE };
}
