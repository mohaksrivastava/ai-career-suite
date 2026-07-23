import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cvApi } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

export default function Dashboard() {
  const { cvInfo, setCvInfo } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cvApi.info()
      .then(setCvInfo)
      .catch(() => setCvInfo(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1>Dashboard</h1>

      {loading ? (
        <p className="loading">Loading…</p>
      ) : cvInfo ? (
        <div className="card">
          <h2>Your CV</h2>
          <p><strong>{cvInfo.originalName}</strong></p>
          <p className="muted">Uploaded {new Date(cvInfo.uploadedAt).toLocaleDateString()}</p>
          <p className="muted">Auto-deleted 30 days after upload.</p>
          <Link to="/search" className="btn">Search jobs</Link>
        </div>
      ) : (
        <div className="card">
          <h2>Get started</h2>
          <p>Upload your CV to unlock job search, evaluation, cover letters, and interview prep.</p>
          <Link to="/upload" className="btn">Upload your CV</Link>
        </div>
      )}
    </div>
  );
}
