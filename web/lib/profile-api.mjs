import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const PROFILE_PATH = 'config/profile.yml';

export function profilePath(root) {
  return join(root, PROFILE_PATH);
}

export function loadProfileFull(root) {
  const path = profilePath(root);
  let raw = '';
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    return { error: 'profile.yml not found', raw: '' };
  }
  const data = yaml.load(raw) || {};
  const c = data.candidate || {};
  const comp = data.compensation || {};
  const prefs = data.preferences || {};
  const loc = data.location || {};
  const roles = data.target_roles || {};

  return {
    candidate: {
      fullName: c.full_name || '',
      email: c.email || '',
      phone: c.phone || '',
      location: c.location || '',
      linkedin: c.linkedin || '',
      portfolio: c.portfolio_url || '',
      github: c.github || '',
      twitter: c.twitter || '',
    },
    targetRoles: {
      primary: roles.primary || [],
      secondary: roles.secondary || [],
      tertiary: roles.tertiary || [],
    },
    narrative: {
      headline: data.narrative?.headline || '',
      brandTitle: data.narrative?.brand_title || '',
      applicationPrimary: data.narrative?.application_primary || '',
      applicationAlternate: data.narrative?.application_alternate || '',
      exitStory: data.narrative?.exit_story || '',
    },
    compensation: {
      target: comp.target_range || comp.target_annual_usd || comp.target || '',
      minimum: comp.minimum || '',
      currency: comp.currency || 'USD',
      hourlyTarget: comp.hourly_target || '',
      hourlyMinimum: comp.hourly_minimum || '',
    },
    location: {
      country: loc.country || '',
      city: loc.city || '',
      timezone: loc.timezone || '',
      workArrangement: loc.work_arrangement || '',
      onsiteAvailability: loc.onsite_availability || '',
    },
    preferences: {
      companySize: prefs.company_size || '',
      industries: prefs.industries || [],
      dealBreakers: prefs.deal_breakers || [],
      greenFlags: prefs.green_flags || [],
    },
    raw,
    path: PROFILE_PATH,
  };
}

/** @deprecated use loadProfileFull */
export function loadProfileSummary(root) {
  return loadProfileFull(root);
}

export function saveProfileStructured(root, patch) {
  const path = profilePath(root);
  const raw = readFileSync(path, 'utf8');
  const data = yaml.load(raw) || {};

  if (patch.candidate) {
    data.candidate = {
      ...(data.candidate || {}),
      full_name: patch.candidate.fullName ?? data.candidate?.full_name,
      email: patch.candidate.email ?? data.candidate?.email,
      phone: patch.candidate.phone ?? data.candidate?.phone,
      location: patch.candidate.location ?? data.candidate?.location,
      linkedin: patch.candidate.linkedin ?? data.candidate?.linkedin,
      portfolio_url: patch.candidate.portfolio ?? data.candidate?.portfolio_url,
      github: patch.candidate.github ?? data.candidate?.github,
      twitter: patch.candidate.twitter ?? data.candidate?.twitter,
    };
  }

  if (patch.targetRoles) {
    data.target_roles = {
      ...(data.target_roles || {}),
      primary: patch.targetRoles.primary ?? data.target_roles?.primary,
      secondary: patch.targetRoles.secondary ?? data.target_roles?.secondary,
      tertiary: patch.targetRoles.tertiary ?? data.target_roles?.tertiary,
    };
  }

  if (patch.narrative) {
    data.narrative = {
      ...(data.narrative || {}),
      headline: patch.narrative.headline ?? data.narrative?.headline,
      brand_title: patch.narrative.brandTitle ?? data.narrative?.brand_title,
      application_primary: patch.narrative.applicationPrimary ?? data.narrative?.application_primary,
      application_alternate: patch.narrative.applicationAlternate ?? data.narrative?.application_alternate,
      exit_story: patch.narrative.exitStory ?? data.narrative?.exit_story,
    };
  }

  if (patch.compensation) {
    data.compensation = {
      ...(data.compensation || {}),
      target_range: patch.compensation.target ?? data.compensation?.target_range,
      minimum: patch.compensation.minimum ?? data.compensation?.minimum,
      currency: patch.compensation.currency ?? data.compensation?.currency,
      hourly_target: patch.compensation.hourlyTarget ?? data.compensation?.hourly_target,
      hourly_minimum: patch.compensation.hourlyMinimum ?? data.compensation?.hourly_minimum,
    };
  }

  if (patch.location) {
    data.location = {
      ...(data.location || {}),
      country: patch.location.country ?? data.location?.country,
      city: patch.location.city ?? data.location?.city,
      timezone: patch.location.timezone ?? data.location?.timezone,
      work_arrangement: patch.location.workArrangement ?? data.location?.work_arrangement,
      onsite_availability: patch.location.onsiteAvailability ?? data.location?.onsite_availability,
    };
  }

  if (patch.preferences) {
    data.preferences = {
      ...(data.preferences || {}),
      company_size: patch.preferences.companySize ?? data.preferences?.company_size,
      industries: patch.preferences.industries ?? data.preferences?.industries,
      deal_breakers: patch.preferences.dealBreakers ?? data.preferences?.deal_breakers,
      green_flags: patch.preferences.greenFlags ?? data.preferences?.green_flags,
    };
  }

  const out = yaml.dump(data, { lineWidth: 100, noRefs: true });
  writeFileSync(path, out, 'utf8');
  return { saved: true, path: PROFILE_PATH };
}

export function saveProfileRaw(root, content) {
  writeFileSync(profilePath(root), content, 'utf8');
  return { saved: true, path: PROFILE_PATH };
}
