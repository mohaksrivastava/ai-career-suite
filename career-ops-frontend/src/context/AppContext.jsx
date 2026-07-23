import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(null); // null = unknown/loading
  const [cvInfo, setCvInfo] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    authApi.status()
      .then(r => setAuthenticated(!!r.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  const value = {
    authenticated, setAuthenticated,
    cvInfo, setCvInfo,
    jobs, setJobs,
    selectedJob, setSelectedJob,
    evaluation, setEvaluation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
