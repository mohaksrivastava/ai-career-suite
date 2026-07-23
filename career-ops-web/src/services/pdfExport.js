import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGemini } from './gemini.js';
import { decryptCv } from './cvStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE  = fs.readFileSync(
  path.join(__dirname, '../../templates/cv-template.html'), 'utf8'
);

// Generate a tailored CV markdown for a specific job, then render to PDF.
// Mirrors career-ops pdf.md mode logic.
export async function generateTailoredCvPdf(cvId, jobTitle, company, jobDescription) {
  const cvMarkdown = decryptCv(cvId); // RULE S-4: decrypt in memory only

  // Ask Gemini to tailor the CV content for this specific role
  const tailorPrompt = `You are an expert resume writer. Given the candidate's CV below,
rewrite it in ATS-optimised markdown for the role of "${jobTitle}" at "${company}".
Mirror keywords from the job description. Keep it factually accurate — do not invent
experience. Output clean markdown only (no preamble, no commentary).

CV:
${cvMarkdown}

Job Description:
${jobDescription}`;

  const tailoredMarkdown = await callGemini(
    'You produce ATS-optimised CVs. Output markdown only.',
    tailorPrompt,
    { maxTokens: 3000 }
  );

  // Inject into the HTML template
  const html = TEMPLATE
    .replace('{{CV_CONTENT}}', markdownToHtml(tailoredMarkdown))
    .replace(/{{JOB_TITLE}}/g, escapeHtml(jobTitle))
    .replace(/{{COMPANY}}/g, escapeHtml(company));

  // Render PDF
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });
    return pdf; // Buffer
  } finally {
    await browser.close();
  }
}

// Minimal markdown-to-HTML (headings, bold, bullets)
function markdownToHtml(md) {
  return md
    .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
    .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
    .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm,    '<li>$1</li>')
    .replace(/\n\n/g,          '</p><p>')
    .replace(/^(?!<[h|l|p])/gm, '<p>')
    + '</p>';
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
