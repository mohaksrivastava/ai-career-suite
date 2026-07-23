import React from 'react';
import { Link } from 'react-router-dom';

// Required disclosure per the build guide's Phase 8.2 privacy notice.
export default function Privacy() {
  return (
    <div className="page">
      <h1>Privacy notice</h1>
      <ul className="privacy-list">
        <li>Your CV is stored encrypted (AES-256-GCM) on a private server.</li>
        <li>CVs are automatically deleted 30 days after upload. You can delete yours at any time.</li>
        <li>When you request an evaluation, your CV and the job description are sent to Google's Gemini Flash API. Google's free-tier API does not use inputs for model training.</li>
        <li>Job listings are fetched via Apify, which operates its own proxy infrastructure.</li>
        <li>This tool is for personal use between friends and is not a commercial service.</li>
        <li>Application emails and cover letters are drafts only. This tool never sends, submits, or clicks anything on your behalf.</li>
        <li>No data is sold, shared, or used for advertising.</li>
      </ul>
      <Link to="/dashboard" className="btn">Back to dashboard</Link>
    </div>
  );
}
