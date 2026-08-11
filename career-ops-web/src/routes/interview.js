import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { llmLimiter } from '../middleware/rateLimit.js';
import { sanitizeInput } from '../middleware/sanitize.js';
import { decryptCv } from '../services/cvStore.js';
import { callGemini } from '../services/gemini.js';
import { buildInterviewSystemPrompt } from '../services/promptBuilder.js';

const router = Router();

const STAR_SYSTEM = buildInterviewSystemPrompt();

// POST /api/interview/stories
router.post('/stories', requireAuth, llmLimiter, async (req, res) => {
  const { cvId } = req.session;
  if (!cvId) return res.status(400).json({ error: 'No CV uploaded' });

  try {
    const jobTitle       = sanitizeInput(req.body.jobTitle       || '');
    const jobDescription = sanitizeInput(req.body.jobDescription || '');

    const cvMarkdown = decryptCv(cvId);
    const userPrompt = `Here is the candidate's CV:\n\n${cvMarkdown}\n\n${
      jobDescription ? `Target role: ${jobTitle} at an unnamed company.\n\nJob Description:\n${jobDescription}\n\nTailor the stories to this role.`
                     : 'Generate 5 general master STAR+R stories from this CV.'
    }`;

    const stories = await callGemini(STAR_SYSTEM, userPrompt, { maxTokens: 3000 });
    res.json({ stories });
  } catch (err) {
    console.error('[interview] Error:', err.message);
    res.status(500).json({ error: 'Interview prep generation failed' });
  }
});

// POST /api/interview/questions
router.post('/questions', requireAuth, llmLimiter, async (req, res) => {
  const { cvId } = req.session;
  if (!cvId) return res.status(400).json({ error: 'No CV uploaded' });

  try {
    const jobTitle       = sanitizeInput(req.body.jobTitle       || '');
    const company        = sanitizeInput(req.body.company        || '');
    const jobDescription = sanitizeInput(req.body.jobDescription || '');

    if (!jobDescription) return res.status(400).json({ error: 'jobDescription is required' });

    const cvMarkdown = decryptCv(cvId);
    const userPrompt = `Generate the 10 interview questions for this role:\n\nCV:\n\n${cvMarkdown}\n\nRole: ${jobTitle} at ${company}\n\nJD:\n${jobDescription}`;

    const questions = await callGemini(STAR_SYSTEM, userPrompt, { maxTokens: 2500 });
    res.json({ questions });
  } catch (err) {
    console.error('[interview] Error:', err.message);
    res.status(500).json({ error: 'Question generation failed' });
  }
});

export default router;
