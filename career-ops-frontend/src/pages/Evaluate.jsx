import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { evaluateApi, pdfApi } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

export default function Evaluate() {
  const { jobIndex } = useParams();
  const navigate = useNavigate();
  const { jobs, selectedJob, setSelectedJob, evaluation, setEvaluation } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const job = selectedJob || jobs[Number(jobIndex)];

  useEffect(() => {
    if (job && !selectedJob) setSelectedJob(job);
  }, [job]);

  async function runEvaluation() {
    if (!job) return;
    setError('');
    setLoading(true);
    try {
      const res = await evaluateApi.job({
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.description,
      });
      setEvaluation(res);
    } catch (err) {
      setError(err.message || 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    setDownloading(true);
    try {
      await pdfApi.downloadCv({
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.description,
      });
    } catch (err) {
      setError(err.message || 'PDF generation failed');
    } finally {
      setDownloading(false);
    }
  }

  if (!job) {
    return (
      <div className="page">
        <p>No job selected. Go back to <button className="link-btn" onClick={() => navigate('/search')}>search</button>.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{job.title}</h1>
      <p className="muted">{job.company} · {job.location}</p>

      {!evaluation && (
        <button className="btn" onClick={runEvaluation} disabled={loading}>
          {loading ? 'Evaluating…' : 'Run A-F evaluation'}
        </button>
      )}
      {error && <p className="error">{error}</p>}

      {evaluation && (
        <>
          <div className="card row">
            <button className="btn" onClick={downloadPdf} disabled={downloading}>
              {downloading ? 'Generating…' : 'Download ATS CV PDF'}
            </button>
            <button className="btn-outline" onClick={() => navigate('/cover')}>Generate cover letter</button>
            <button className="btn-outline" onClick={() => navigate('/email')}>Draft application email</button>
            <button className="btn-outline" onClick={() => navigate('/interview')}>Interview prep</button>
          </div>
          <div className="markdown card">
            <ReactMarkdown>{evaluation.evaluation}</ReactMarkdown>
          </div>
        </>
      )}
    </div>
  );
}
