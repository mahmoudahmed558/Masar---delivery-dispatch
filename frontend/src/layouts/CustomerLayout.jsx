import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import branding from '../config/branding';
import '../styles/customer.css';

export default function CustomerLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="customer-portal">
      {/* Top Navigation */}
      <nav className="customer-nav">
        <a href="/customer" className="nav-brand">
          <img src={branding.logo} alt={branding.logoAlt} />
          <h1>{branding.companyName}</h1>
        </a>

        <div className="nav-links">
          <NavLink to="/customer" end className={({isActive}) => isActive ? 'active' : ''}>
            📦 طلباتي
          </NavLink>
          <NavLink to="/customer/new" className={({isActive}) => isActive ? 'active' : ''}>
            ✨ طلب جديد
          </NavLink>
        </div>

        <div className="nav-user">
          <span className="user-greeting">
            أهلاً <strong>{user?.name || ''}</strong> 👋
          </span>
          <button className="logout-pill" onClick={logout}>تسجيل خروج</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="customer-body">
        <Outlet />
      </main>
    </div>
  );
}
