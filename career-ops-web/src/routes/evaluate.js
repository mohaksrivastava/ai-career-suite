import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { llmLimiter } from '../middleware/rateLimit.js';
import { sanitizeInput } from '../middleware/sanitize.js';
import { decryptCv } from '../services/cvStore.js';
import { callGemini } from '../services/gemini.js';
import { buildEvalSystemPrompt, buildEvalUserPrompt } from '../services/promptBuilder.js';

const router = Router();

// POST /api/evaluate/job
// Body: { jobTitle, company, jobDescription }
// Requires: session must have a cvId
router.post('/job', requireAuth, llmLimiter, async (req, res) => {
  const { cvId } = req.session;
  if (!cvId) return res.status(400).json({ error: 'No CV uploaded. Upload your CV first.' });

  try {
    const jobTitle       = sanitizeInput(req.body.jobTitle       || '');
    const company        = sanitizeInput(req.body.company        || '');
    const jobDescription = sanitizeInput(req.body.jobDescription || '');

    if (!jobDescription) return res.status(400).json({ error: 'jobDescription is required' });

    // Decrypt CV — RULE S-2: content never logged
    const cvMarkdown = decryptCv(cvId);

    const systemPrompt = buildEvalSystemPrompt(cvMarkdown);
    const userPrompt   = buildEvalUserPrompt(jobTitle, company, jobDescription);

    const evaluation = await callGemini(systemPrompt, userPrompt, { maxTokens: 4096 });

    res.json({ evaluation, jobTitle, company });
  } catch (err) {
    console.error('[evaluate] Error:', err.message); // RULE S-2: message only
    res.status(500).json({ error: 'Evaluation failed. Please try again.' });
  }
});

// POST /api/evaluate/batch
// Body: { jobs: [{ jobTitle, company, jobDescription }] }  max 10 items
router.post('/batch', requireAuth, async (req, res) => {
  const { cvId } = req.session;
  if (!cvId) return res.status(400).json({ error: 'No CV uploaded' });

  const jobs = req.body.jobs;
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return res.status(400).json({ error: 'jobs array is required' });
  }
  if (jobs.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 jobs per batch' });
  }

  try {
    const cvMarkdown = decryptCv(cvId);
    const systemPrompt = buildEvalSystemPrompt(cvMarkdown);

    // Sequential to stay within free-tier RPM (15 RPM on Gemini Flash free tier)
    const results = [];
    for (const job of jobs) {
      const jt  = sanitizeInput(job.jobTitle       || '');
      const co  = sanitizeInput(job.company        || '');
      const jd  = sanitizeInput(job.jobDescription || '');
      if (!jd) { results.push({ error: 'Missing description', jobTitle: jt }); continue; }
      const evaluation = await callGemini(systemPrompt, buildEvalUserPrompt(jt, co, jd));
      results.push({ evaluation, jobTitle: jt, company: co });
      // Respect free-tier rate limit: ~4s gap keeps us well under 15 RPM
      await new Promise(r => setTimeout(r, 4000));
    }

    res.json({ results });
  } catch (err) {
    console.error('[batch] Error:', err.message);
    res.status(500).json({ error: 'Batch evaluation failed' });
  }
});

export default router;
