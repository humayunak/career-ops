/** Profile — form editor, narrative MD, CV/digest, raw YAML */

let profileTab = 'edit';
let profileTagEditors = {};

async function loadProfilePanel() {
  const root = $('profileRoot');
  if (!root) return;
  root.innerHTML = '<p class="loading">Loading profile…</p>';
  profileTagEditors = {};

  try {
    const data = await api('/api/profile');
    if (data.error) {
      root.innerHTML = `<div class="empty-state"><p>${esc(data.error)}</p></div>`;
      return;
    }

    root.innerHTML = `
      <div class="panel-intro">
        <p>Edit <code>config/profile.yml</code> (identity, targets, comp) and <code>modes/_profile.md</code> (archetypes, framing). Changes apply on next scan/evaluation.</p>
      </div>
      <div class="tab-bar" role="tablist">
        <button type="button" class="tab-btn${profileTab === 'edit' ? ' active' : ''}" data-ptab="edit">Edit config</button>
        <button type="button" class="tab-btn${profileTab === 'narrative' ? ' active' : ''}" data-ptab="narrative">Narrative (_profile.md)</button>
        <button type="button" class="tab-btn${profileTab === 'cv' ? ' active' : ''}" data-ptab="cv">CV</button>
        <button type="button" class="tab-btn${profileTab === 'digest' ? ' active' : ''}" data-ptab="digest">Digest</button>
        <button type="button" class="tab-btn${profileTab === 'yaml' ? ' active' : ''}" data-ptab="yaml">Advanced YAML</button>
      </div>
      <div id="profileContent"></div>
    `;

    root.querySelectorAll('[data-ptab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        profileTab = btn.dataset.ptab;
        loadProfilePanel();
      });
    });

    const content = $('profileContent');

    if (profileTab === 'edit') {
      renderProfileForm(content, data);
    } else if (profileTab === 'yaml') {
      renderProfileYaml(content, data);
    } else if (profileTab === 'narrative') {
      await renderProfileMarkdown(content, 'modes/_profile.md');
    } else {
      const filePath = profileTab === 'cv' ? 'cv.md' : 'article-digest.md';
      await renderProfileMarkdown(content, filePath);
    }
  } catch (e) {
    root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}

function renderProfileForm(content, data) {
  const c = data.candidate || {};
  const n = data.narrative || {};
  const comp = data.compensation || {};
  const loc = data.location || {};
  const roles = data.targetRoles || {};
  const prefs = data.preferences || {};

  content.innerHTML = `
    <form id="profileForm" class="config-form">
      <section class="glass-card">
        <h2 class="section-title">Identity</h2>
        <div class="form-grid form-grid--2">
          ${formField('pf-name', 'Full name', c.fullName)}
          ${formField('pf-email', 'Email', c.email, { type: 'email' })}
          ${formField('pf-phone', 'Phone', c.phone)}
          ${formField('pf-location', 'Location line', c.location)}
          ${formField('pf-linkedin', 'LinkedIn', c.linkedin)}
          ${formField('pf-github', 'GitHub', c.github)}
          ${formField('pf-portfolio', 'Portfolio URL', c.portfolio)}
        </div>
      </section>

      <section class="glass-card">
        <h2 class="section-title">Target roles (scan & evaluate)</h2>
        <p class="field-hint">Primary titles drive matching. Keep aligned with <code>portals.yml</code> title keywords.</p>
        <div id="tags-primary"></div>
        <div id="tags-secondary" style="margin-top:16px"></div>
      </section>

      <section class="glass-card">
        <h2 class="section-title">Narrative (profile.yml)</h2>
        <div class="form-grid">
          ${formField('pf-headline', 'Headline', n.headline)}
          ${formField('pf-brand', 'Brand title', n.brandTitle)}
          ${formField('pf-apply', 'Application primary title', n.applicationPrimary)}
          ${formField('pf-apply-alt', 'Application alternate', n.applicationAlternate)}
          ${formField('pf-exit', 'Exit story', n.exitStory, { type: 'textarea', rows: 4 })}
        </div>
      </section>

      <section class="glass-card">
        <h2 class="section-title">Compensation</h2>
        <div class="form-grid form-grid--2">
          ${formField('pf-comp-target', 'Target range', comp.target)}
          ${formField('pf-comp-min', 'Minimum', comp.minimum)}
          ${formField('pf-comp-currency', 'Currency', comp.currency)}
          ${formField('pf-comp-hourly', 'Hourly target', comp.hourlyTarget)}
        </div>
      </section>

      <section class="glass-card">
        <h2 class="section-title">Location & preferences</h2>
        <div class="form-grid form-grid--2">
          ${formField('pf-country', 'Country', loc.country)}
          ${formField('pf-city', 'City', loc.city)}
          ${formField('pf-tz', 'Timezone', loc.timezone)}
          ${formField('pf-remote', 'Work arrangement', loc.workArrangement)}
          ${formField('pf-onsite', 'On-site availability', loc.onsiteAvailability)}
          ${formField('pf-company-size', 'Company size', prefs.companySize)}
        </div>
        <div id="tags-dealbreakers" style="margin-top:16px"></div>
        <div id="tags-industries" style="margin-top:16px"></div>
      </section>

      <div class="form-actions">
        <button type="submit" class="btn btn--primary">Save profile.yml</button>
        <span class="muted form-actions__hint">Form save rewrites YAML formatting; comments may be lost.</span>
      </div>
    </form>
  `;

  profileTagEditors.primary = mountTagEditor($('tags-primary'), {
    id: 'role-primary',
    label: 'Primary target roles',
    tags: roles.primary || [],
  });
  profileTagEditors.secondary = mountTagEditor($('tags-secondary'), {
    id: 'role-secondary',
    label: 'Secondary roles',
    tags: roles.secondary || [],
  });
  profileTagEditors.dealBreakers = mountTagEditor($('tags-dealbreakers'), {
    id: 'deal-breakers',
    label: 'Deal-breakers',
    tags: prefs.dealBreakers || [],
  });
  profileTagEditors.industries = mountTagEditor($('tags-industries'), {
    id: 'industries',
    label: 'Target industries',
    tags: prefs.industries || [],
  });

  $('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const structured = {
      candidate: {
        fullName: $('pf-name')?.value,
        email: $('pf-email')?.value,
        phone: $('pf-phone')?.value,
        location: $('pf-location')?.value,
        linkedin: $('pf-linkedin')?.value,
        github: $('pf-github')?.value,
        portfolio: $('pf-portfolio')?.value,
      },
      targetRoles: {
        primary: profileTagEditors.primary.getTags(),
        secondary: profileTagEditors.secondary.getTags(),
      },
      narrative: {
        headline: $('pf-headline')?.value,
        brandTitle: $('pf-brand')?.value,
        applicationPrimary: $('pf-apply')?.value,
        applicationAlternate: $('pf-apply-alt')?.value,
        exitStory: $('pf-exit')?.value,
      },
      compensation: {
        target: $('pf-comp-target')?.value,
        minimum: $('pf-comp-min')?.value,
        currency: $('pf-comp-currency')?.value,
        hourlyTarget: $('pf-comp-hourly')?.value,
      },
      location: {
        country: $('pf-country')?.value,
        city: $('pf-city')?.value,
        timezone: $('pf-tz')?.value,
        workArrangement: $('pf-remote')?.value,
        onsiteAvailability: $('pf-onsite')?.value,
      },
      preferences: {
        companySize: $('pf-company-size')?.value,
        dealBreakers: profileTagEditors.dealBreakers.getTags(),
        industries: profileTagEditors.industries.getTags(),
      },
    };

    try {
      await api('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ structured }),
      });
      invalidateSnapshot();
      showToast('profile.yml saved');
    } catch (err) {
      showToast(err.message);
    }
  });
}

function renderProfileYaml(content, data) {
  content.innerHTML = `
    <div class="glass-card">
      <p class="muted">Direct edit of <code>config/profile.yml</code></p>
      <textarea class="yaml-editor" id="profileYaml">${esc(data.raw || '')}</textarea>
      <button type="button" class="btn btn--primary btn--sm" id="saveProfileYaml" style="margin-top:12px">Save YAML</button>
    </div>
  `;
  $('saveProfileYaml')?.addEventListener('click', async () => {
    try {
      await api('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ content: $('profileYaml')?.value }),
      });
      showToast('profile.yml saved');
      profileTab = 'edit';
      loadProfilePanel();
    } catch (e) {
      showToast(e.message);
    }
  });
}

async function renderProfileMarkdown(content, filePath) {
  content.innerHTML = '<p class="loading">Loading markdown…</p>';
  try {
    const { content: md, path } = await api(`/api/file?path=${encodeURIComponent(filePath)}`);
    content.innerHTML = '<div id="profileMdMount"></div>';
    mountMdViewer($('profileMdMount'), md, path);
  } catch (e) {
    content.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}
