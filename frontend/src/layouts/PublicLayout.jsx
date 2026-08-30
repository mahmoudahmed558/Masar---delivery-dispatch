import React from 'react';
import { Outlet } from 'react-router-dom';
import '../styles/layout.css';

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <Outlet />
    </div>
  );
}