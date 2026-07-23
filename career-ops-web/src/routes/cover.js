import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { llmLimiter } from '../middleware/rateLimit.js';
import { sanitizeInput } from '../middleware/sanitize.js';
import { decryptCv } from '../services/cvStore.js';
import { callGemini } from '../services/gemini.js';
import { buildCoverSystemPrompt } from '../services/promptBuilder.js';

const router = Router();

// POST /api/cover
// Body: { jobTitle, company, jobDescription, tone? }
router.post('/', requireAuth, llmLimiter, async (req, res) => {
  const { cvId } = req.session;
  if (!cvId) return res.status(400).json({ error: 'No CV uploaded' });

  try {
    const jobTitle       = sanitizeInput(req.body.jobTitle       || '');
    const company        = sanitizeInput(req.body.company        || '');
    const jobDescription = sanitizeInput(req.body.jobDescription || '');
    const tone           = sanitizeInput(req.body.tone           || 'professional');

    if (!jobDescription) return res.status(400).json({ error: 'jobDescription is required' });

    const cvMarkdown   = decryptCv(cvId);
    const systemPrompt = buildCoverSystemPrompt(cvMarkdown);
    const userPrompt   = `Generate a cover letter for:\n\n**Role:** ${jobTitle}\n**Company:** ${company}\n**Tone:** ${tone}\n\n**Job Description:**\n${jobDescription}`;

    const coverLetter = await callGemini(systemPrompt, userPrompt, { maxTokens: 2048 });
    res.json({ coverLetter, jobTitle, company });
  } catch (err) {
    console.error('[cover] Error:', err.message);
    res.status(500).json({ error: 'Cover letter generation failed' });
  }
});

export default router;
