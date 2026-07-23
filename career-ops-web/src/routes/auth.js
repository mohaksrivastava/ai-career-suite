import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  const { code } = req.body;
  if (!code || code !== process.env.INVITE_CODE) {
    return res.status(401).json({ error: 'Invalid invite code' });
  }
  req.session.authenticated = true;
  req.session.jobCount = 0;
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/status', (req, res) => {
  res.json({ authenticated: !!req.session?.authenticated });
});

export default router;
