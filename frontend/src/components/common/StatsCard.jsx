import React from 'react';
export default function StatsCard({ title, value, icon, color }) {
  return (
    <div className="glass-card stats-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stats-info">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
      </div>
      <div className="stats-icon">{icon}</div>
    </div>
  );
}