import React, { useState } from 'react';
import { emailApi } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

export default function Email() {
  const { selectedJob } = useApp();
  const [emailType, setEmailType] = useState('application');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(null);

  async function generate() {
    if (!selectedJob) return;
    setError('');
    setLoading(true);
    try {
      const res = await emailApi.draft({
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        jobDescription: selectedJob.description,
        emailType,
      });
      setDraft(res);
    } catch (err) {
      setError(err.message || 'Email draft generation failed');
    } finally {
      setLoading(false);
    }
  }

  if (!selectedJob) {
    return <div className="page"><p>Evaluate a job first to draft an application email for it.</p></div>;
  }

  return (
    <div className="page">
      <h1>Application email</h1>
      <p className="muted">{selectedJob.title} · {selectedJob.company}</p>

      <div className="warning-banner">
        ⚠️ This is a draft only. career-ops never sends emails on your behalf. Review carefully before sending.
      </div>

      <div className="card row">
        <select value={emailType} onChange={e => setEmailType(e.target.value)}>
          <option value="application">Application</option>
          <option value="recruiter">Recruiter follow-up</option>
          <option value="referral">Referral request</option>
          <option value="cold">Cold outreach</option>
        </select>
        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? 'Drafting…' : 'Draft email'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {draft && (
        <div className="card">
          <pre className="draft-body">{draft.draft}</pre>
        </div>
      )}
    </div>
  );
}
