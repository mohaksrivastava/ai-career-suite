import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { llmLimiter } from '../middleware/rateLimit.js';
import { sanitizeInput } from '../middleware/sanitize.js';
import { generateTailoredCvPdf } from '../services/pdfExport.js';

const router = Router();

// POST /api/pdf/cv
// Body: { jobTitle, company, jobDescription }
router.post('/cv', requireAuth, llmLimiter, async (req, res) => {
  const { cvId } = req.session;
  if (!cvId) return res.status(400).json({ error: 'No CV uploaded' });

  try {
    const jobTitle       = sanitizeInput(req.body.jobTitle       || 'Tailored Role');
    const company        = sanitizeInput(req.body.company        || '');
    const jobDescription = sanitizeInput(req.body.jobDescription || '');

    if (!jobDescription) return res.status(400).json({ error: 'jobDescription is required' });

    const pdf = await generateTailoredCvPdf(cvId, jobTitle, company, jobDescription);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cv-${jobTitle.replace(/\s+/g,'-').toLowerCase()}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  } catch (err) {
    console.error('[pdf] Error:', err.message);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

export default router;
