import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { llmLimiter } from '../middleware/rateLimit.js';
import { sanitizeInput } from '../middleware/sanitize.js';
import { searchJobs, searchLinkedIn, scanGreenhouseBoard, scanLeverBoard } from '../services/apify.js';

const router = Router();

// POST /api/search/jobs
// Body: { query, location, source, maxResults }
// source: 'all' | 'linkedin' | 'greenhouse:<slug>' | 'lever:<slug>'
router.post('/jobs', requireAuth, llmLimiter, async (req, res) => {
  try {
    const query    = sanitizeInput(req.body.query    || '');
    const location = sanitizeInput(req.body.location || '');
    const source   = req.body.source || 'all';
    const maxResults = Math.min(parseInt(req.body.maxResults) || 50, 100);

    if (!query) return res.status(400).json({ error: 'query is required' });

    let jobs = [];

    if (source === 'linkedin') {
      jobs = await searchLinkedIn({ keyword: query, location, maxJobs: maxResults });
    } else if (source.startsWith('greenhouse:')) {
      const slug = source.split(':')[1].replace(/[^a-z0-9-]/g, '');
      jobs = await scanGreenhouseBoard(slug);
    } else if (source.startsWith('lever:')) {
      const slug = source.split(':')[1].replace(/[^a-z0-9-]/g, '');
      jobs = await scanLeverBoard(slug);
    } else {
      // Default: Google-for-Jobs aggregator (LinkedIn + Indeed + Glassdoor + more)
      jobs = await searchJobs({ query, location, maxResults, datePosted: 'week' });
    }

    // Cap and return
    res.json({ count: jobs.length, jobs: jobs.slice(0, 100) });
  } catch (err) {
    console.error('[search] Error:', err.message);
    res.status(500).json({ error: 'Search failed. Try again in a moment.' });
  }
});

export default router;
