import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Upload from './pages/Upload.jsx';
import Search from './pages/Search.jsx';
import Evaluate from './pages/Evaluate.jsx';
import Cover from './pages/Cover.jsx';
import Email from './pages/Email.jsx';
import Interview from './pages/Interview.jsx';
import Privacy from './pages/Privacy.jsx';

function Protected({ children }) {
  return (
    <RequireAuth>
      <Navbar />
      {children}
    </RequireAuth>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/upload" element={<Protected><Upload /></Protected>} />
        <Route path="/search" element={<Protected><Search /></Protected>} />
        <Route path="/evaluate/:jobIndex" element={<Protected><Evaluate /></Protected>} />
        <Route path="/cover" element={<Protected><Cover /></Protected>} />
        <Route path="/email" element={<Protected><Email /></Protected>} />
        <Route path="/interview" element={<Protected><Interview /></Protected>} />
      </Routes>
    </AppProvider>
  );
}
