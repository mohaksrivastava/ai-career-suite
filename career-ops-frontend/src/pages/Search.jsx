import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

export default function Search() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { jobs, setJobs, setSelectedJob } = useApp();
  const navigate = useNavigate();

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await searchApi.jobs({ query, location, source });
      setJobs(res.jobs);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  function openJob(job, index) {
    setSelectedJob(job);
    navigate(`/evaluate/${index}`);
  }

  return (
    <div className="page">
      <h1>Search jobs</h1>

      <form className="card" onSubmit={handleSearch}>
        <input
          placeholder="Job title / keywords"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <input
          placeholder="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
        <select value={source} onChange={e => setSource(e.target.value)}>
          <option value="all">All boards</option>
          <option value="linkedin">LinkedIn</option>
          <option value="greenhouse:">Greenhouse (enter company slug below)</option>
          <option value="lever:">Lever (enter company slug below)</option>
        </select>
        {(source.startsWith('greenhouse') || source.startsWith('lever')) && (
          <input
            placeholder="Company slug"
            onChange={e => setSource(prev => prev.split(':')[0] + ':' + e.target.value)}
          />
        )}
        <button type="submit" disabled={loading || !query}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="job-list">
        {jobs.map((job, i) => (
          <div className="job-card" key={i}>
            <h3>{job.title}</h3>
            <p className="muted">{job.company} · {job.location} · <span className="badge">{job.source}</span></p>
            <div className="row">
              <button className="btn" onClick={() => openJob(job, i)}>Evaluate</button>
              {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="btn-outline">View posting</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
