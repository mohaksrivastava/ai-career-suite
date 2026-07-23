import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authApi } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const { setAuthenticated } = useApp();

  async function handleLogout() {
    await authApi.logout().catch(() => {});
    setAuthenticated(false);
    navigate('/');
  }

  return (
    <nav className="navbar">
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/upload">Upload CV</NavLink>
      <NavLink to="/search">Search Jobs</NavLink>
      <NavLink to="/interview">Interview Prep</NavLink>
      <NavLink to="/privacy">Privacy</NavLink>
      <button className="link-btn" onClick={handleLogout}>Logout</button>
    </nav>
  );
}
