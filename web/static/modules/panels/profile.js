/** Profile — vertical nav: Config | Raw YAML | Narrative | Article digest */

let profileTab = 'config';
let profileTagEditors = {};
let profileDataCache = null;

async function loadProfilePanel() {
  const root = $('profileRoot');
  if (!root) return;

  if (!profileDataCache) {
    root.innerHTML = '<p class="loading">Loading profile…</p>';
    profileTagEditors = {};
    try {
      const data = await api('/api/profile');
      if (data.error) {
        root.innerHTML = `<div class="empty-state"><p>${esc(data.error)}</p></div>`;
        return;
      }
      profileDataCache = data;
    } catch (e) {
      root.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
      return;
    }
  }

  root.innerHTML = `
    <div class="disco-shell">
      <nav class="disco-nav" aria-label="Profile settings">
        <div class="disco-nav__group">
          <span class="disco-nav__label">Settings</span>
          <button class="disco-nav__item${profileTab === 'config' ? ' is-active' : ''}" data-ptab="config">Config</button>
          <button class="disco-nav__item${profileTab === 'yaml' ? ' is-active' : ''}" data-ptab="yaml">Raw YAML</button>
        </div>
        <div class="disco-nav__group">
          <span class="disco-nav__label">Content</span>
          <button class="disco-nav__item${profileTab === 'narrative' ? ' is-active' : ''}" data-ptab="narrative">Narrative</button>
          <button class="disco-nav__item${profileTab === 'digest' ? ' is-active' : ''}" data-ptab="digest">Article digest</button>
        </div>
      </nav>
      <div class="disco-content" id="profileContent"></div>
    </div>
  `;

  root.querySelectorAll('[data-ptab]').forEach(btn => {
    btn.addEventListener('click', () => {
      profileTab = btn.dataset.ptab;
      root.querySelectorAll('[data-ptab]').forEach(b => b.classList.toggle('is-active', b === btn));
      renderProfileTab();
    });
  });

  renderProfileTab();
}

async function renderProfileTab() {
  const content = $('profileContent');
  if (!content) return;

  if (profileTab === 'config') {
    renderProfileForm(content, profileDataCache);
  } else if (profileTab === 'yaml') {
    renderProfileYaml(content, profileDataCache);
  } else if (profileTab === 'narrative') {
    await renderProfileMarkdown(content, 'config/_profile.md');
  } else if (profileTab === 'digest') {
    await renderProfileMarkdown(content, 'config/article-digest.md');
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
        <div id="tags-secondary" class="mt-16"></div>
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
        <div id="tags-dealbreakers" class="mt-16"></div>
        <div id="tags-industries" class="mt-16"></div>
      </section>

      <div class="form-actions">
        <button type="submit" class="btn btn--primary">Save profile.yml</button>
        <span class="disco-hint disco-hint--warn form-actions__hint">Form save rewrites YAML formatting — any hand-edited comments will be lost. Use Raw YAML to preserve them.</span>
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
      profileDataCache = null;
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
      <h2 class="section-title">Raw YAML — config/profile.yml</h2>
      <p class="field-hint">Direct edit. YAML comments and formatting are preserved. Form save (Config tab) will overwrite this.</p>
      <textarea class="yaml-editor yaml-editor--full" id="profileYaml">${esc(data.raw || '')}</textarea>
      <div class="form-actions">
        <button type="button" class="btn btn--primary" id="saveProfileYaml">Save YAML</button>
        <button type="button" class="btn btn--ghost btn--sm" id="cancelProfileYaml">Discard changes</button>
      </div>
    </div>
  `;
  $('saveProfileYaml')?.addEventListener('click', async () => {
    try {
      const newContent = $('profileYaml')?.value;
      await api('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ content: newContent }),
      });
      if (profileDataCache) profileDataCache.raw = newContent;
      invalidateSnapshot();
      showToast('profile.yml saved');
    } catch (e) {
      showToast(e.message);
    }
  });
  $('cancelProfileYaml')?.addEventListener('click', () => {
    profileDataCache = null;
    loadProfilePanel();
  });
}

async function renderProfileMarkdown(content, filePath) {
  content.innerHTML = '<p class="loading">Loading…</p>';
  try {
    const { content: md, path } = await api(`/api/file?path=${encodeURIComponent(filePath)}`);
    content.innerHTML = `
      <div class="section-head" style="margin-bottom:12px">
        <span class="field-hint" style="margin:0"><code>${esc(filePath)}</code></span>
        <button type="button" class="btn btn--ghost btn--sm" id="mdEditToggle">Edit</button>
      </div>
      <div id="profileMdMount"></div>
      <div id="profileMdEditor" hidden>
        <textarea class="yaml-editor yaml-editor--full" id="profileMdSource">${esc(md || '')}</textarea>
        <div class="form-actions">
          <button type="button" class="btn btn--primary" id="saveMdFile">Save</button>
          <button type="button" class="btn btn--ghost btn--sm" id="cancelMdEdit">Cancel</button>
        </div>
      </div>
    `;
    mountMdViewer($('profileMdMount'), md, path);

    let editing = false;
    $('mdEditToggle')?.addEventListener('click', () => {
      editing = !editing;
      $('profileMdMount').hidden = editing;
      $('profileMdEditor').hidden = !editing;
      $('mdEditToggle').textContent = editing ? 'Preview' : 'Edit';
      if (editing) $('profileMdSource').focus();
    });

    $('cancelMdEdit')?.addEventListener('click', () => {
      editing = false;
      $('profileMdMount').hidden = false;
      $('profileMdEditor').hidden = true;
      $('mdEditToggle').textContent = 'Edit';
    });

    $('saveMdFile')?.addEventListener('click', async () => {
      const newMd = $('profileMdSource')?.value;
      try {
        await api('/api/file', {
          method: 'PUT',
          body: JSON.stringify({ path: filePath, content: newMd }),
        });
        invalidateSnapshot();
        showToast(`${filePath} saved`);
        editing = false;
        $('profileMdMount').hidden = false;
        $('profileMdEditor').hidden = true;
        $('mdEditToggle').textContent = 'Edit';
        const mount = $('profileMdMount');
        mount.innerHTML = '<div id="profileMdMountInner"></div>';
        mountMdViewer($('profileMdMountInner'), newMd, path);
      } catch (e) {
        showToast(e.message);
      }
    });
  } catch (e) {
    content.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
  }
}
