import { deleteCv, deleteMeta, listAllMeta } from '../services/cvStore.js';
import { getApifyMonthlyUsageUsd } from '../services/apify.js';

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

// Phase 9.2: daily Apify credit-balance check so the group notices before
// the $5/month free tier runs out. Never logs the token itself.
async function logApifyBalance() {
  try {
    const usd = await getApifyMonthlyUsageUsd();
    console.log(`[apify] Monthly credit used: $${usd}`);
  } catch (err) {
    console.error('[apify] Balance check failed:', err.message);
  }
}

export function startRetentionCron() {
  // Run once at startup, then every 24 hours
  runRetentionCheck();
  logApifyBalance();
  setInterval(runRetentionCheck, 24 * 60 * 60 * 1000);
  setInterval(logApifyBalance, 24 * 60 * 60 * 1000);
  console.log('[retention] 30-day CV cleanup cron started');
}
