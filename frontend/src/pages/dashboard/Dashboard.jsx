import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatsCard from '../../components/common/StatsCard';
import LiveMap from '../../components/maps/LiveMap';
import StatusBadge from '../../components/common/StatusBadge';
import branding from '../../config/branding';
import useSEO from '../../hooks/useSEO';
import '../../styles/dashboard.css';

export default function Dashboard() {
  useSEO({ title: 'لوحة التحكم', description: 'نظرة عامة على إحصائيات الطلبات وأحدث التوصيلات.' });

  const [stats, setStats] = useState({ total_orders: 0, pending: 0, active: 0, delivered: 0, failed: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data?.data || { total_orders: 0, pending: 0, active: 0, delivered: 0, failed: 0 });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };

    const fetchRecent = async () => {
      try {
        const response = await api.get('/dashboard/recent-deliveries');
        setRecent(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch recent deliveries', error);
      }
    };

    Promise.all([fetchStats(), fetchRecent()]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <div className="stats-grid">
        <StatsCard title="Total Orders" value={stats.total_orders} color={branding.primaryColor} />
        <StatsCard title="Pending" value={stats.pending} color={branding.statusPending} />
        <StatsCard title="Active" value={stats.active} color={branding.statusOnTheWay} />
        <StatsCard title="Delivered" value={stats.delivered} color={branding.statusDelivered} />
        <StatsCard title="Failed" value={stats.failed} color={branding.statusFailed} />
      </div>
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="map-container glass-card">
          <h3>Live Map</h3>
          <LiveMap />
        </div>
        
        <div className="recent-container glass-card" style={{ padding: '1.5rem' }}>
          <h3>Recent Deliveries</h3>
          {recent.length === 0 ? (
            <p className="empty-state">No recent deliveries.</p>
          ) : (
            <div className="recent-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {recent.map((order) => (
                <div key={order.id} className="recent-item" style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: 'var(--border-radius-small)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--primary-light)' }}>{order.tracking_code}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>{order.pickup_name}</strong> → <strong>{order.dropoff_name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <StatusBadge status={order.status} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pilot: {order.pilot?.name || 'Unassigned'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}