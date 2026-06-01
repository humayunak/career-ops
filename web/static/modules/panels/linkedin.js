/** LinkedIn — Apify search URL → triage → inbox */

let linkedinOffers = [];
let linkedinSelected = new Set();

async function loadLinkedinPanel() {
  const root = $('linkedinRoot');
  if (!root) return;

  root.innerHTML = `
    <div class="glass-card">
      <h2 class="section-title">LinkedIn search (Apify)</h2>
      <p class="muted">Paste a LinkedIn jobs search URL. Requires <code>APIFY_TOKEN</code> in your environment. Override actor with <code>APIFY_LINKEDIN_ACTOR</code>.</p>
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
  if (mount) mount.innerHTML = '<p class="loading">Calling Apify…</p>';
  if (btn) btn.disabled = true;

  try {
    const result = await api('/api/linkedin/scan', {
      method: 'POST',
      body: JSON.stringify({ searchUrl: url, maxItems: 30 }),
    });
    if (!result.ok) {
      mount.innerHTML = `<div class="empty-state"><p>${esc(result.error)}</p></div>`;
      showToast('Apify not configured or failed');
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
  const addBtn = $('btnLinkedinInbox');
  if (!mount) return;

  if (!linkedinOffers.length) {
    mount.innerHTML = '<p class="muted">No results yet.</p>';
    if (addBtn) addBtn.disabled = true;
    return;
  }
  if (addBtn) addBtn.disabled = false;

  mount.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th></th><th>Company</th><th>Role</th><th>Location</th><th></th></tr></thead>
        <tbody>
          ${linkedinOffers
            .map(
              (o, i) => `
            <tr>
              <td><input type="checkbox" data-li-idx="${i}" ${linkedinSelected.has(i) ? 'checked' : ''}></td>
              <td>${esc(o.company)}</td>
              <td>${esc(o.title)}</td>
              <td class="muted">${esc(o.location || '—')}</td>
              <td><a class="ext-link" href="${esc(o.url)}" target="_blank" rel="noopener">Open</a></td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  mount.querySelectorAll('[data-li-idx]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const i = parseInt(cb.dataset.liIdx, 10);
      if (cb.checked) linkedinSelected.add(i);
      else linkedinSelected.delete(i);
    });
  });
}

async function addLinkedinToInbox() {
  const offers = [...linkedinSelected].map((i) => linkedinOffers[i]).filter((o) => o?.url);
  if (!offers.length) {
    showToast('Select jobs with URLs');
    return;
  }
  try {
    const r = await api('/api/pipeline/add', {
      method: 'POST',
      body: JSON.stringify({ offers }),
    });
    invalidateSnapshot();
    showToast(`Added ${r.added} to pipeline`);
    linkedinOffers = [];
    linkedinSelected = new Set();
    switchPanel('inbox');
  } catch (e) {
    showToast(e.message);
  }
}
