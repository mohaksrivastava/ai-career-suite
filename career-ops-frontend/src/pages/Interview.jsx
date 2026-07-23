import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { interviewApi } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

export default function Interview() {
  const { selectedJob } = useApp();
  const [tailored, setTailored] = useState(!!selectedJob);
  const [loadingStories, setLoadingStories] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState('');
  const [stories, setStories] = useState(null);
  const [questions, setQuestions] = useState(null);

  async function generateStories() {
    setError('');
    setLoadingStories(true);
    try {
      const body = tailored && selectedJob
        ? { jobTitle: selectedJob.title, jobDescription: selectedJob.description }
        : {};
      const res = await interviewApi.stories(body);
      setStories(res.stories);
    } catch (err) {
      setError(err.message || 'Story generation failed');
    } finally {
      setLoadingStories(false);
    }
  }

  async function generateQuestions() {
    if (!selectedJob) {
      setError('Evaluate a job first to generate role-specific questions.');
      return;
    }
    setError('');
    setLoadingQuestions(true);
    try {
      const res = await interviewApi.questions({
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        jobDescription: selectedJob.description,
      });
      setQuestions(res.questions);
    } catch (err) {
      setError(err.message || 'Question generation failed');
    } finally {
      setLoadingQuestions(false);
    }
  }

  return (
    <div className="page">
      <h1>Interview prep</h1>

      <div className="card row">
        <label>
          <input
            type="checkbox"
            checked={tailored}
            disabled={!selectedJob}
            onChange={e => setTailored(e.target.checked)}
          />
          {' '}Tailor to last evaluated role {selectedJob ? `(${selectedJob.title})` : '(none selected)'}
        </label>
        <button className="btn" onClick={generateStories} disabled={loadingStories}>
          {loadingStories ? 'Generating…' : 'Generate STAR+R stories'}
        </button>
        <button className="btn-outline" onClick={generateQuestions} disabled={loadingQuestions}>
          {loadingQuestions ? 'Generating…' : 'Generate interview questions'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {stories && (
        <div className="card markdown">
          <h2>STAR+R stories</h2>
          <ReactMarkdown>{stories}</ReactMarkdown>
        </div>
      )}

      {questions && (
        <div className="card markdown">
          <h2>Likely questions</h2>
          <ReactMarkdown>{questions}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
