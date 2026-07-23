import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import os from 'os';
import { requireAuth } from '../middleware/auth.js';
import { validateFileMagic } from '../utils/fileValidation.js';
import { parseToMarkdown } from '../services/cvParser.js';
import { encryptAndSave, deleteCv, saveMeta, loadMeta, deleteMeta } from '../services/cvStore.js';

const router = Router();
const UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024; // 10 MB

// Multer stores to OS temp dir; we move it after validation
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: UPLOAD_LIMIT_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf',
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PDF and DOCX files are accepted'));
    }
    cb(null, true);
  },
});

// POST /api/cv/upload
router.post('/upload', requireAuth, upload.single('cv'), async (req, res) => {
  const tmpPath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // RULE S-3: validate magic bytes
    const fileType = validateFileMagic(tmpPath);

    // Parse to markdown
    const markdown = await parseToMarkdown(tmpPath, fileType);

    // RULE S-4: encrypt and persist
    const cvId = uuidv4();
    encryptAndSave(markdown, cvId);
    saveMeta(cvId, {
      cvId,
      sessionId: req.session.id,
      originalName: req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'),
      fileType,
      uploadedAt: new Date().toISOString(),
      charCount: markdown.length,
    });

    // Attach cvId to session so this user can reference it
    req.session.cvId = cvId;

    res.json({ cvId, charCount: markdown.length });
  } catch (err) {
    // RULE S-2: never expose CV content in error
    res.status(err.message.includes('Unsupported') ? 415 : 400)
       .json({ error: err.message });
  } finally {
    // Always clean up the temp file
    if (tmpPath && fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
});

// GET /api/cv/info — returns metadata only, never CV content
router.get('/info', requireAuth, (req, res) => {
  const { cvId } = req.session;
  if (!cvId) return res.status(404).json({ error: 'No CV uploaded yet' });
  try {
    const meta = loadMeta(cvId);
    res.json({
      cvId: meta.cvId,
      originalName: meta.originalName,
      uploadedAt: meta.uploadedAt,
      charCount: meta.charCount,
    });
  } catch {
    res.status(404).json({ error: 'CV not found' });
  }
});

// DELETE /api/cv — user can delete their own CV
router.delete('/', requireAuth, (req, res) => {
  const { cvId } = req.session;
  if (!cvId) return res.status(404).json({ error: 'No CV on record' });
  deleteCv(cvId);
  deleteMeta(cvId);
  delete req.session.cvId;
  res.json({ ok: true });
});

export default router;
