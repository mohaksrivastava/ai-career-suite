import path from 'path';

// On the production VM this is /var/career-ops-data (see build guide Phase 0.6).
// DATA_DIR lets local development point at a writable folder instead.
export const DATA_DIR = process.env.DATA_DIR || '/var/career-ops-data';
export const CVS_DIR = path.join(DATA_DIR, 'cvs');
export const REPORTS_DIR = path.join(DATA_DIR, 'reports');
export const LOGS_DIR = path.join(DATA_DIR, 'logs');
