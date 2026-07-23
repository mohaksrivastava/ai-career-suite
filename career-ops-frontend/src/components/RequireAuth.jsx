import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function RequireAuth({ children }) {
  const { authenticated } = useApp();

  if (authenticated === null) return <p className="loading">Checking session…</p>;
  if (!authenticated) return <Navigate to="/" replace />;
  return children;
}
