import { deleteCv, deleteMeta, listAllMeta } from '../services/cvStore.js';

// RULE S-10: CVs are auto-deleted 30 days after upload.
const RETENTION_DAYS = 30;

function runRetentionCheck() {
  const now = Date.now();
  const cutoff = RETENTION_DAYS * 24 * 60 * 60 * 1000;

  const allMeta = listAllMeta();
  for (const meta of allMeta) {
    const age = now - new Date(meta.uploadedAt).getTime();
    if (age > cutoff) {
      console.log(`[retention] Deleting expired CV ${meta.cvId} (uploaded ${meta.uploadedAt})`);
      deleteCv(meta.cvId);
      deleteMeta(meta.cvId);
    }
  }
}

export function startRetentionCron() {
  // Run once at startup, then every 24 hours
  runRetentionCheck();
  setInterval(runRetentionCheck, 24 * 60 * 60 * 1000);
  console.log('[retention] 30-day CV cleanup cron started');
}
