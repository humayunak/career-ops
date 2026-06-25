/** LinkedIn Command Center — job scraper + outreach + content */

let linkedinOffers = [];
let linkedinSelected = new Set();
let linkedinTab = 'jobs';

async function loadLinkedinPanel() {
  const root = $('linkedinRoot');
  if (!root) return;

  root.innerHTML = `
    <div class="tab-bar" role="tablist" style="margin-bottom:16px">
      <button type="button" class="tab-btn${linkedinTab === 'jobs' ? ' active' : ''}" data-litab="jobs" role="tab">Job scraper</button>
      <button type="button" class="tab-btn${linkedinTab === 'outreach' ? ' active' : ''}" data-litab="outreach" role="tab">Outreach</button>
      <button type="button" class="tab-btn${linkedinTab === 'content' ? ' active' : ''}" data-litab="content" role="tab">Content</button>
    </div>
    <div id="linkedinTabContent"></div>
  `;

  root.querySelectorAll('[data-litab]').forEach(btn => {
    btn.addEventListener('click', () => {
      linkedinTab = btn.dataset.litab;
      root.querySelectorAll('[data-litab]').forEach(b => b.classList.toggle('active', b === btn));
      renderLinkedinTab();
    });
  });

  renderLinkedinTab();
}

function renderLinkedinTab() {
  const mount = $('linkedinTabContent');
  if (!mount) return;

  if (linkedinTab === 'jobs') {
    mount.innerHTML = `
      <div class="glass-card">
        <h2 class="section-title">LinkedIn job search</h2>
        <p class="muted">Paste a LinkedIn jobs search URL, fetch via Apify, then add matches to your inbox.</p>
        <label class="field-label" for="linkedinUrl">Search URL</label>
        <input type="url" class="search-input" id="linkedinUrl" placeholder="https://www.linkedin.com/jobs/search/?..." style="width:100%;max-width:720px">
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
          <button type="button" class="btn btn--primary" id="btnLinkedinScan">Fetch jobs</button>
          <button type="button" class="btn btn--sm" id="btnLinkedinInbox" disabled>Add selected to inbox</button>
        </div>
        <div id="linkedinResults" style="margin-top:16px"></div>
      </div>
    `;

    $('btnLinkedinScan')?.addEventListener('click', runLinkedinFetch);
    $('btnLinkedinInbox')?.addEventListener('click', addLinkedinToInbox);
    renderLinkedinResults();
  } else if (linkedinTab === 'outreach') {
    mount.innerHTML = `
      <div class="glass-card">
        <h2 class="section-title">LinkedIn outreach</h2>
        <p class="muted">Draft connection requests and follow-up DMs. Run <code>/career-ops-research</code> to generate outreach drafts for a specific company.</p>
        <div class="empty-state" style="margin-top:16px">
          <p>Outreach drafts appear here after running the research skill on a target company.</p>
        </div>
      </div>
    `;
  } else if (linkedinTab === 'content') {
    mount.innerHTML = `
      <div class="glass-card">
        <h2 class="section-title">Content calendar</h2>
        <p class="muted">Plan and track LinkedIn posts to build visibility during your job search.</p>
        <div class="empty-state" style="margin-top:16px">
          <p>Coming soon — post ideas, scheduling, and engagement tracking.</p>
        </div>
      </div>
    `;
  }
}

async function runLinkedinFetch() {
  const url = $('linkedinUrl')?.value?.trim();
  if (!url) {
    showToast('Enter a LinkedIn search URL');
    return;
  }
  const mount = $('linkedinResults');
  const btn = $('btnLinkedinScan');
  if (mount) mount.innerHTML = '<p class="loading">Fetching jobs…</p>';
  if (btn) btn.disabled = true;

  try {
    const result = await api('/api/linkedin/scan', {
      method: 'POST',
      body: JSON.stringify({ searchUrl: url, maxItems: 30 }),
    });
    if (!result.ok) {
      mount.innerHTML = `<div class="empty-state"><p>${esc(result.error)}</p><p class="muted">Check APIFY_TOKEN is set where the web server runs.</p></div>`;
      showToast('LinkedIn fetch failed');
      return;
    }
    linkedinOffers = result.offers || [];
    linkedinSelected = new Set(linkedinOffers.map((_, i) => i));
    renderLinkedinResults();
    showToast(`${linkedinOffers.length} job(s) fetched`);
  } catch (e) {
    if (mount) mount.innerHTML = `<p class="empty-state">${esc(e.message)}</p>`;
    showToast(e.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}

function renderLinkedinResults() {
  const mount = $('linkedinResults');
  const inboxBtn = $('btnLinkedinInbox');
  if (!mount) return;

  if (!linkedinOffers.length) {
    mount.innerHTML = '<p class="muted">Results appear here after fetch.</p>';
    if (inboxBtn) inboxBtn.disabled = true;
    return;
  }

  if (inboxBtn) inboxBtn.disabled = linkedinSelected.size === 0;

  mount.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th class="col-check"><input type="checkbox" data-select-all aria-label="Select all"></th><th>Company</th><th>Role</th><th>Location</th></tr></thead>
        <tbody>
          ${linkedinOffers
            .map(
              (o, i) => `
            <tr>
              <td><input type="checkbox" data-li-idx="${i}" ${linkedinSelected.has(i) ? 'checked' : ''}></td>
              <td>${esc(o.company)}</td>
              <td>${esc(o.title)}</td>
              <td class="muted">${esc(o.location || '—')}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  wireTableSelectAll(mount, {
    rowSelector: '[data-li-idx]',
    onRowChange: (cb, checked) => {
      const i = parseInt(cb.dataset.liIdx, 10);
      if (checked) linkedinSelected.add(i);
      else linkedinSelected.delete(i);
      if (inboxBtn) inboxBtn.disabled = linkedinSelected.size === 0;
    },
  });
}

async function addLinkedinToInbox() {
  const offers = [...linkedinSelected].map((i) => linkedinOffers[i]).filter(Boolean);
  if (!offers.length) return;
  try {
    await api('/api/pipeline/add', {
      method: 'POST',
      body: JSON.stringify({
        offers: offers.map((o) => ({
          url: o.url,
          company: o.company,
          title: o.title,
          source: 'linkedin',
        })),
      }),
    });
    invalidateSnapshot();
    showToast(`Added ${offers.length} to inbox`);
    switchPanel('inbox');
  } catch (e) {
    showToast(e.message);
  }
}
