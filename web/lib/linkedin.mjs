/**
 * LinkedIn search via Apify (optional). Set APIFY_TOKEN in env.
 * Actor default: apify/linkedin-jobs-scraper — override with APIFY_LINKEDIN_ACTOR.
 */

const DEFAULT_ACTOR = 'curious_coder~linkedin-jobs-scraper';

export async function runLinkedInApify(searchUrl, { maxItems = 25 } = {}) {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    return {
      ok: false,
      error: 'APIFY_TOKEN not set. Add it to your environment to enable LinkedIn search.',
      offers: [],
    };
  }

  const actor = (process.env.APIFY_LINKEDIN_ACTOR || DEFAULT_ACTOR).replace('/', '~');
  const input = {
    urls: [searchUrl],
    maxItems,
  };

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${actor}/runs?token=${token}&waitForFinish=120`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!runRes.ok) {
    const errText = await runRes.text();
    return { ok: false, error: `Apify run failed: ${runRes.status} ${errText.slice(0, 200)}`, offers: [] };
  }

  const runData = await runRes.json();
  const datasetId = runData?.data?.defaultDatasetId;
  if (!datasetId) {
    return { ok: false, error: 'Apify run returned no dataset', offers: [] };
  }

  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&format=json&limit=${maxItems}`,
  );
  if (!itemsRes.ok) {
    return { ok: false, error: `Failed to fetch dataset: ${itemsRes.status}`, offers: [] };
  }

  const items = await itemsRes.json();
  const offers = (Array.isArray(items) ? items : [])
    .map((item) => ({
      company: item.companyName || item.company || '',
      title: item.title || item.jobTitle || '',
      location: item.location || item.jobLocation || '',
      url: item.link || item.url || item.jobUrl || '',
    }))
    .filter((o) => o.url && o.title);

  return { ok: true, offers, count: offers.length };
}
