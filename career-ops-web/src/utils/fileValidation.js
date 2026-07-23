import { readFileSync } from 'fs';

// RULE S-3: validate by magic-byte signature before any parsing.
const SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46],   // %PDF
  docx: [0x50, 0x4B, 0x03, 0x04],  // PK\x03\x04 (ZIP-based)
};

export function validateFileMagic(filePath) {
  const buf = readFileSync(filePath);
  const header = [...buf.slice(0, 4)];

  const isPdf  = SIGNATURES.pdf.every((b, i)  => b === header[i]);
  const isDocx = SIGNATURES.docx.every((b, i) => b === header[i]);

  if (!isPdf && !isDocx) {
    throw new Error('Unsupported file type. Only PDF and DOCX are accepted.');
  }
  return isPdf ? 'pdf' : 'docx';
}
