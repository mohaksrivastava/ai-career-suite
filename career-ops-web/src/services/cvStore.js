import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { CVS_DIR } from '../config/paths.js';

// RULE S-4: files stored on disk as AES-256-GCM encrypted blobs.
const ALGORITHM = 'aes-256-gcm';

function getKey() {
  return Buffer.from(process.env.CV_ENCRYPTION_KEY, 'hex'); // 32 bytes
}

fs.mkdirSync(CVS_DIR, { recursive: true, mode: 0o700 });

export function encryptAndSave(plaintext, cvId) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Layout: [12B iv][16B authTag][N bytes ciphertext]
  const blob = Buffer.concat([iv, authTag, encrypted]);
  const filePath = path.join(CVS_DIR, `${cvId}.bin`);
  fs.writeFileSync(filePath, blob, { mode: 0o600 }); // owner-only (RULE S-4)

  return filePath;
}

export function decryptCv(cvId) {
  const filePath = path.join(CVS_DIR, `${cvId}.bin`);
  if (!fs.existsSync(filePath)) throw new Error('CV not found');

  const blob = fs.readFileSync(filePath);
  const iv         = blob.slice(0, 12);
  const authTag    = blob.slice(12, 28);
  const ciphertext = blob.slice(28);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

export function deleteCv(cvId) {
  const filePath = path.join(CVS_DIR, `${cvId}.bin`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

// Metadata record: stored in a JSON sidecar alongside the blob
export function saveMeta(cvId, meta) {
  const filePath = path.join(CVS_DIR, `${cvId}.meta.json`);
  fs.writeFileSync(filePath, JSON.stringify(meta), { mode: 0o600 });
}

export function loadMeta(cvId) {
  const filePath = path.join(CVS_DIR, `${cvId}.meta.json`);
  if (!fs.existsSync(filePath)) throw new Error('CV metadata not found');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function deleteMeta(cvId) {
  const filePath = path.join(CVS_DIR, `${cvId}.meta.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export function listAllMeta() {
  return fs.readdirSync(CVS_DIR)
    .filter(f => f.endsWith('.meta.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(CVS_DIR, f), 'utf8')));
}
