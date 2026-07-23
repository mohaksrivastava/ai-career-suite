import rateLimit from 'express-rate-limit';

// RULE S-8: 10 requests/minute per IP on /api/* routes
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please wait a moment' },
});

// RULE S-8: max 3 concurrent LLM jobs per session — stricter limiter for LLM endpoints
export const llmLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.session?.id || req.ip,
  message: { error: 'LLM rate limit reached' },
});
