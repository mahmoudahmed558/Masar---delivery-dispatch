import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import TrackingMap from '../../components/maps/TrackingMap';
import branding from '../../config/branding';
import useSEO from '../../hooks/useSEO';
import '../../styles/tracking.css';

const STATUS_STEPS = ['pending', 'assigned', 'picked_up', 'on_the_way', 'delivered'];

export default function PublicTracking() {
  const { trackingCode } = useParams();
  const [trackingInput, setTrackingInput] = useState(trackingCode || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useSEO({ 
    title: trackingCode ? `تتبع الشحنة ${trackingCode}` : 'تتبع شحنتك',
    description: 'تتبع حالة شحنتك لحظة بلحظة مع مسار.'
  });

  useEffect(() => {
    if (trackingCode) fetchTracking(trackingCode);
  }, [trackingCode]);

  const fetchTracking = async (code) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/track/${code}`);
      setData(response.data?.data || null);
    } catch (err) {
      setError('Order not found. Please check the tracking code.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (trackingInput.trim()) fetchTracking(trackingInput.trim());
  };

  const order = data?.order;
  const pilotLocation = data?.pilot_location;
  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="tracking-page">
      <div className="tracking-header">
        <img src={branding.logo} alt={branding.logoAlt} className="tracking-logo" />
        <h1>{branding.companyName}</h1>
        <p>{branding.companyTagline}</p>
      </div>

      <form onSubmit={handleSearch} className="tracking-search glass-card">
        <input
          type="text"
          placeholder="Enter tracking code (e.g., ELT-ABCD)"
          value={trackingInput}
          onChange={(e) => setTrackingInput(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="btn btn-primary">Track</button>
      </form>

      {loading && <div className="loading-center">Searching...</div>}
      {error && <div className="tracking-error glass-card">{error}</div>}

      {order && (
        <div className="tracking-result">
          <div className="glass-card tracking-card">
            <div className="tracking-code-display">
              <span>Tracking Code</span>
              <strong>{order.tracking_code}</strong>
            </div>

            <div className="tracking-status">
              <StatusBadge status={order.status} />
            </div>

            {/* Progress Bar */}
            {order.status !== 'failed' && order.status !== 'cancelled' && (
              <div className="progress-bar">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className={`progress-step ${i <= currentStep ? 'active' : ''}`}>
                    <div className="step-dot" />
                    <span className="step-label">{step.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}

            {order.status === 'failed' && (
              <div className="failed-banner">❌ Delivery failed: {order.failure_reason || 'Unknown reason'}</div>
            )}
          </div>

          <div className="glass-card tracking-card">
            <h3>📦 Delivery Details</h3>
            <div className="tracking-details">
              <div>
                <span className="label">From</span>
                <strong>{order.pickup_name}</strong>
              </div>
              <div className="arrow">→</div>
              <div>
                <span className="label">To</span>
                <strong>{order.dropoff_name}</strong>
              </div>
            </div>
            {order.delivered_at && (
              <p className="cell-sub">Delivered at: {new Date(order.delivered_at).toLocaleString()}</p>
            )}
          </div>

          {/* Live Map when on the way */}
          {order.status === 'on_the_way' && pilotLocation && (
            <div className="glass-card tracking-card">
              <h3>🗺️ Live Location</h3>
              <TrackingMap
                pilotLat={parseFloat(pilotLocation.lat)}
                pilotLng={parseFloat(pilotLocation.lng)}
                pilotName={order.pilot?.name || 'Pilot'}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}