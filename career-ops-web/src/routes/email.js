import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { llmLimiter } from '../middleware/rateLimit.js';
import { sanitizeInput } from '../middleware/sanitize.js';
import { decryptCv } from '../services/cvStore.js';
import { callGemini } from '../services/gemini.js';
import { buildEmailSystemPrompt } from '../services/promptBuilder.js';

const router = Router();

// POST /api/email/draft  (note: always /draft — reinforces the draft-only nature)
// NOTES FOR JULES item 2: this route must never gain "auto-send" functionality.
router.post('/draft', requireAuth, llmLimiter, async (req, res) => {
  const { cvId } = req.session;
  if (!cvId) return res.status(400).json({ error: 'No CV uploaded' });

  try {
    const jobTitle       = sanitizeInput(req.body.jobTitle       || '');
    const company        = sanitizeInput(req.body.company        || '');
    const jobDescription = sanitizeInput(req.body.jobDescription || '');
    const emailType      = sanitizeInput(req.body.emailType      || 'application');
    // emailType: 'application' | 'recruiter' | 'referral' | 'cold'

    if (!jobDescription) return res.status(400).json({ error: 'jobDescription is required' });

    const cvMarkdown   = decryptCv(cvId);
    const systemPrompt = buildEmailSystemPrompt(cvMarkdown);
    const userPrompt   = `Draft a ${emailType} email for:\n\n**Role:** ${jobTitle}\n**Company:** ${company}\n\n**Job Description:**\n${jobDescription}\n\nIMPORTANT: Produce a draft only. Include subject line, body, and attachment checklist. Do not simulate sending or clicking anything.`;

    const draft = await callGemini(systemPrompt, userPrompt, { maxTokens: 1500 });
    res.json({ draft, jobTitle, company, emailType, warning: 'This is a draft only. Review carefully before sending.' });
  } catch (err) {
    console.error('[email] Error:', err.message);
    res.status(500).json({ error: 'Email draft generation failed' });
  }
});

export default router;
