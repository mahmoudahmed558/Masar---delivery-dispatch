import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/orders.css';

export default function PilotList() {
  const [pilots, setPilots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPilots = async () => {
      try {
        const response = await api.get('/pilots');
        setPilots(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch pilots', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPilots();
  }, []);

  if (loading) return <div className="loading-center">Loading pilots...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>🛵 Pilots</h2>
      </div>

      <div className="pilots-grid">
        {pilots.length === 0 ? (
          <div className="empty-state glass-card">No pilots found</div>
        ) : (
          pilots.map((pilot) => (
            <div key={pilot.id} className="glass-card pilot-card">
              <div className="pilot-card-header">
                <div className="pilot-avatar">
                  {(pilot.name || 'P').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{pilot.name || 'Unknown'}</h3>
                  <span className="cell-sub">{pilot.phone}</span>
                </div>
                <span className={`online-dot ${pilot.is_online ? 'online' : 'offline'}`}>
                  {pilot.is_online ? '🟢 Online' : '⚪ Offline'}
                </span>
              </div>
              <div className="pilot-card-body">
                <div className="pilot-stat">
                  <span className="stat-label">Vehicle</span>
                  <span className="stat-value">{pilot.vehicle_type || '—'}</span>
                </div>
                <div className="pilot-stat">
                  <span className="stat-label">Active Orders</span>
                  <span className="stat-value">{pilot.current_orders_count || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}