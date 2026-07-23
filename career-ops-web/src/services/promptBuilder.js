import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.join(__dirname, '../../prompts');

// Load prompt files once at startup (they don't change at runtime)
const SHARED   = fs.readFileSync(path.join(PROMPTS_DIR, '_shared.md'), 'utf8');
const OFERTA   = fs.readFileSync(path.join(PROMPTS_DIR, 'oferta.md'),  'utf8');
const COVER    = fs.readFileSync(path.join(PROMPTS_DIR, 'cover.md'),   'utf8');
const EMAIL_MD = fs.readFileSync(path.join(PROMPTS_DIR, 'email.md'),   'utf8');

/**
 * Build the system prompt for a single-job evaluation (career-ops oferta mode).
 * Injects the user's CV markdown so the LLM has full context.
 */
export function buildEvalSystemPrompt(cvMarkdown) {
  const cvSection = `\n\n## CANDIDATE CV\n\n${cvMarkdown}\n\n`;
  return SHARED + cvSection + OFERTA;
}

/**
 * Build the user turn for a single evaluation — just the job description.
 */
export function buildEvalUserPrompt(jobTitle, company, jobDescription) {
  return `Please evaluate this job posting using the career-ops A-F pipeline:\n\n**Role:** ${jobTitle}\n**Company:** ${company}\n\n**Job Description:**\n${jobDescription}`;
}

/**
 * Cover letter system prompt (career-ops cover.md)
 */
export function buildCoverSystemPrompt(cvMarkdown) {
  return SHARED + `\n\n## CANDIDATE CV\n\n${cvMarkdown}\n\n` + COVER;
}

/**
 * Application email system prompt (career-ops email.md)
 * IMPORTANT: email.md explicitly instructs the LLM to draft only.
 * Never sends, submits, or clicks anything. This must be preserved.
 */
export function buildEmailSystemPrompt(cvMarkdown) {
  return SHARED + `\n\n## CANDIDATE CV\n\n${cvMarkdown}\n\n` + EMAIL_MD;
}
