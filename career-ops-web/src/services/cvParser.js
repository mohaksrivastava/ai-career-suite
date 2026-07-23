import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';

// Convert PDF/DOCX text to the markdown format career-ops expects (cv.md format)
export async function parseToMarkdown(filePath, fileType) {
  let rawText;

  if (fileType === 'pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    rawText = data.text;
  } else {
    const result = await mammoth.extractRawText({ path: filePath });
    rawText = result.value;
  }

  if (!rawText || rawText.trim().length < 100) {
    throw new Error('CV appears to be empty or could not be parsed. Please try a text-based PDF.');
  }

  // Wrap in the cv.md structure career-ops expects
  return `# Curriculum Vitae\n\n${rawText.trim()}`;
}
