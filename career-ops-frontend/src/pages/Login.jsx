import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

export default function Login() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuthenticated } = useApp();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.login(code);
      setAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid invite code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="centered-page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>career-ops</h1>
        <p className="subtitle">Private access — invite code required</p>
        <input
          type="password"
          placeholder="Invite code"
          value={code}
          onChange={e => setCode(e.target.value)}
          autoFocus
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading || !code}>
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
