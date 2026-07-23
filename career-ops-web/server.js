import { existsSync, readFileSync } from 'fs';

// RULE S-1: secrets live only in /etc/career-ops/secrets.env on the VM.
// Locally (no such file, e.g. during development), fall back to dotenv/.env.
const SECRETS_PATH = process.env.SECRETS_PATH || '/etc/career-ops/secrets.env';
if (existsSync(SECRETS_PATH)) {
  const secretsRaw = readFileSync(SECRETS_PATH, 'utf8');
  for (const line of secretsRaw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    process.env[key.trim()] = rest.join('=').trim();
  }
} else {
  const { config } = await import('dotenv');
  config();
}

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import { apiLimiter } from './src/middleware/rateLimit.js';
import authRouter from './src/routes/auth.js';
import cvRouter from './src/routes/cv.js';
import searchRouter from './src/routes/search.js';
import evaluateRouter from './src/routes/evaluate.js';
import coverRouter from './src/routes/cover.js';
import emailRouter from './src/routes/email.js';
import interviewRouter from './src/routes/interview.js';
import pdfRouter from './src/routes/pdf.js';
import { startRetentionCron } from './src/utils/retention.js';

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

if (!process.env.GEMINI_API_KEY || !process.env.APIFY_TOKEN ||
    !process.env.SESSION_SECRET || !process.env.CV_ENCRYPTION_KEY ||
    !process.env.INVITE_CODE) {
  console.error(`FATAL: Missing required environment variables. Check ${SECRETS_PATH} (or .env locally).`);
  process.exit(1);
}

// Security headers (RULE S-12)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      frameAncestors: ALLOWED_ORIGIN ? [ALLOWED_ORIGIN] : ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// CORS — locked to the deployed frontend origin only (RULE S-5)
app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

app.use(express.json({ limit: '1mb' })); // Body payloads capped at 1 MB

// Rate limiting (RULE S-8)
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/cv', cvRouter);
app.use('/api/search', searchRouter);
app.use('/api/evaluate', evaluateRouter);
app.use('/api/cover', coverRouter);
app.use('/api/email', emailRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/pdf', pdfRouter);

// Health check (no auth required)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404 handler — never leak stack traces
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler — never send internal errors to client (RULE S-2)
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message); // Log message only, never CV content
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`career-ops API listening on 127.0.0.1:${PORT}`);
});

startRetentionCron();
