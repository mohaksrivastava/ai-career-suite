import { ApifyClient } from 'apify-client';
import striptags from 'striptags';

// RULE S-11: token is server-side only, never returned to client
const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

// Sanitise a single Apify result object (RULE S-13)
function sanitizeJob(job) {
  const clean = {};
  for (const [key, val] of Object.entries(job)) {
    clean[key] = typeof val === 'string' ? striptags(val).trim() : val;
  }
  return clean;
}

/**
 * Search for jobs using the Google-for-Jobs aggregator actor.
 * Covers Indeed, LinkedIn, Glassdoor, ZipRecruiter and company career pages
 * in one deduplicated feed.
 */
export async function searchJobs({ query, location, maxResults = 50, datePosted = 'week' }) {
  const run = await client.actor('sian.agency/jsearch-jobs-scraper').call({
    jobSearch: query,
    location,
    maxResults,
    datePosted,
  }, { waitSecs: 120 });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items.map(sanitizeJob);
}

/**
 * Search specifically for LinkedIn jobs.
 */
export async function searchLinkedIn({ keyword, location, maxJobs = 50 }) {
  const run = await client.actor('automation-lab/linkedin-jobs-scraper').call({
    keyword,
    location,
    maxJobs,
    workplaceType: ['Remote', 'On-site', 'Hybrid'],
  }, { waitSecs: 120 });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items.map(sanitizeJob);
}

/**
 * Scan ATS boards directly for a list of companies.
 * No Apify needed for these — plain HTTP JSON calls (RULE S-13 still applies).
 */
export async function scanGreenhouseBoard(companySlug) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs?content=true`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.jobs || []).map(j => ({
    title: striptags(j.title || ''),
    company: companySlug,
    location: striptags((j.location?.name) || 'Not specified'),
    url: j.absolute_url,
    description: striptags(j.content || '').slice(0, 5000), // cap description length
    source: 'greenhouse',
    postedAt: j.updated_at,
  }));
}

export async function scanLeverBoard(companySlug) {
  const url = `https://api.lever.co/v0/postings/${companySlug}?mode=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data || []).map(j => ({
    title: striptags(j.text || ''),
    company: companySlug,
    location: striptags(j.categories?.location || 'Not specified'),
    url: j.hostedUrl,
    description: striptags(j.descriptionPlain || '').slice(0, 5000),
    source: 'lever',
    postedAt: new Date(j.createdAt).toISOString(),
  }));
}
