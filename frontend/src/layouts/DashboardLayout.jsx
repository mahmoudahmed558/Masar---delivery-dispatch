import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import branding from '../config/branding';
import '../styles/layout.css';

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  return (
    <div className="dashboard-layout">
      <aside className="sidebar glass-card">
        <div className="brand">
          <img src={branding.logo} alt={branding.logoAlt} className="logo" />
          <h2>{branding.companyName}</h2>
        </div>
        <nav className="nav-menu">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/orders" className={({isActive}) => isActive ? 'active' : ''}>Orders</NavLink>
          <NavLink to="/pilots" className={({isActive}) => isActive ? 'active' : ''}>Pilots</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/users" className={({isActive}) => isActive ? 'active' : ''}>Users</NavLink>
          )}
        </nav>
        <button className="btn btn-danger logout-btn" onClick={logout}>Logout</button>
      </aside>
      <main className="main-content">
        <header className="top-header glass-card">
          <h1>{user?.role === 'admin' ? 'Admin Dashboard' : 'Manager Dashboard'}</h1>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}