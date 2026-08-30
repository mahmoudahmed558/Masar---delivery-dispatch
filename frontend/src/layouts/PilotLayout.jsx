import React from 'react';
import { Outlet } from 'react-router-dom';
import branding from '../config/branding';
import '../styles/layout.css';

export default function PilotLayout() {
  return (
    <div className="pilot-layout">
      <header className="pilot-header">
        <img src={branding.logo} alt="Logo" className="pilot-logo" />
        <h2>{branding.companyName} Pilot</h2>
      </header>
      <main className="pilot-content">
        <Outlet />
      </main>
    </div>
  );
}