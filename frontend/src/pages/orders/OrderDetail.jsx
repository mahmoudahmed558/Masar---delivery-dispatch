import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import '../../styles/orders.css';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [pilots, setPilots] = useState([]);
  const [selectedPilot, setSelectedPilot] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchOrder();
    fetchPilots();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data?.data || null);
    } catch (error) {
      console.error('Failed to fetch order', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPilots = async () => {
    try {
      const response = await api.get('/pilots');
      setPilots(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch pilots', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedPilot) return;
    setAssigning(true);
    try {
      await api.post(`/orders/${id}/assign`, { pilot_id: selectedPilot });
      fetchOrder();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign');
    } finally {
      setAssigning(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.delete(`/orders/${id}`);
      navigate('/orders');
    } catch (error) {
      alert('Failed to cancel order');
    }
  };

  if (loading) return <div className="loading-center">Loading...</div>;
  if (!order) return <div className="empty-state">Order not found</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Order #{order.tracking_code}</h2>
        <StatusBadge status={order.status} />
      </div>

      <div className="detail-grid">
        <div className="glass-card form-section">
          <h3>📍 Pickup</h3>
          <p><strong>Name:</strong> {order.pickup_name}</p>
          <p><strong>Phone:</strong> <a href={`tel:${order.pickup_phone}`}>{order.pickup_phone}</a></p>
          <p><strong>Address:</strong> {order.pickup_address}</p>
        </div>

        <div className="glass-card form-section">
          <h3>📍 Dropoff</h3>
          <p><strong>Name:</strong> {order.dropoff_name}</p>
          <p><strong>Phone:</strong> <a href={`tel:${order.dropoff_phone}`}>{order.dropoff_phone}</a></p>
          <p><strong>Address:</strong> {order.dropoff_address}</p>
        </div>
      </div>

      <div className="glass-card form-section" style={{ marginTop: '1.5rem' }}>
        <h3>📋 Details</h3>
        <p><strong>Description:</strong> {order.description || '—'}</p>
        <p><strong>Delivery Fee:</strong> {order.delivery_fee} EGP</p>
        <p><strong>COD Amount:</strong> {order.cod_amount} EGP</p>
        <p><strong>Payment:</strong> {order.payment_method}</p>
        <p><strong>Pilot:</strong> {order.pilot?.name || 'Not assigned'}</p>
        <p><strong>Notes:</strong> {order.notes || '—'}</p>
      </div>

      {/* Assign Pilot Section */}
      {(order.status === 'pending' || order.status === 'assigned') && (
        <div className="glass-card form-section" style={{ marginTop: '1.5rem' }}>
          <h3>👤 Assign Pilot</h3>
          <div className="assign-row">
            <select
              className="input-field"
              value={selectedPilot}
              onChange={(e) => setSelectedPilot(e.target.value)}
            >
              <option value="">Select a pilot...</option>
              {pilots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.is_online ? '🟢' : '⚪'} ({p.current_orders_count || 0} active)
                </option>
              ))}
            </select>
            <Button onClick={handleAssign} disabled={assigning || !selectedPilot}>
              {assigning ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </div>
      )}

      {/* POD Section */}
      {order.proof && (
        <div className="glass-card form-section" style={{ marginTop: '1.5rem' }}>
          <h3>📸 Proof of Delivery</h3>
          <img
            src={`/storage/${order.proof.photo_path}`}
            alt="Proof of delivery"
            className="pod-image"
          />
          {order.proof.note && <p><strong>Note:</strong> {order.proof.note}</p>}
          <p className="cell-sub">
            Delivered at: {new Date(order.proof.created_at).toLocaleString()}
          </p>
        </div>
      )}

      {/* Status Timeline */}
      {order.status_logs && order.status_logs.length > 0 && (
        <div className="glass-card form-section" style={{ marginTop: '1.5rem' }}>
          <h3>📜 Status Timeline</h3>
          <div className="timeline">
            {order.status_logs.map((log, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <StatusBadge status={log.to_status} />
                  <span className="timeline-time">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                  {log.note && <span className="timeline-note">{log.note}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <Button variant="danger" onClick={handleCancel} disabled={['delivered', 'cancelled'].includes(order.status)}>
          Cancel Order
        </Button>
        <Button onClick={() => navigate('/orders')}>← Back to Orders</Button>
      </div>
    </div>
  );
}