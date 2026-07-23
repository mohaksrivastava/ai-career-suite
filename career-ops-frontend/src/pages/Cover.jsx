import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { coverApi } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

export default function Cover() {
  const { selectedJob } = useApp();
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [letter, setLetter] = useState(null);

  async function generate() {
    if (!selectedJob) return;
    setError('');
    setLoading(true);
    try {
      const res = await coverApi.generate({
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        jobDescription: selectedJob.description,
        tone,
      });
      setLetter(res.coverLetter);
    } catch (err) {
      setError(err.message || 'Cover letter generation failed');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (letter) navigator.clipboard.writeText(letter);
  }

  if (!selectedJob) {
    return <div className="page"><p>Evaluate a job first to generate a cover letter for it.</p></div>;
  }

  return (
    <div className="page">
      <h1>Cover letter</h1>
      <p className="muted">{selectedJob.title} · {selectedJob.company}</p>

      <div className="card row">
        <select value={tone} onChange={e => setTone(e.target.value)}>
          <option value="professional">Professional</option>
          <option value="conversational">Conversational</option>
          <option value="bold">Bold</option>
        </select>
        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate cover letter'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {letter && (
        <div className="card">
          <button className="btn-outline" onClick={copyToClipboard}>Copy to clipboard</button>
          <div className="markdown">
            <ReactMarkdown>{letter}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
