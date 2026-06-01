/** LinkedIn — Apify search URL → triage → inbox */

let linkedinOffers = [];
let linkedinSelected = new Set();

async function loadLinkedinPanel() {
  const root = $('linkedinRoot');
  if (!root) return;

  root.innerHTML = `
    <div class="glass-card">
      <h2 class="section-title">LinkedIn job search</h2>
      <p class="muted">Paste a LinkedIn jobs search URL, fetch listings, then add the ones you want to your inbox.</p>
      <details class="muted" style="margin:12px 0">
        <summary style="cursor:pointer">Setup (technical)</summary>
        <p style="margin-top:8px">Requires <code>APIFY_TOKEN</code> in your environment. Optional: <code>APIFY_LINKEDIN_ACTOR</code>.</p>
      </details>
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
