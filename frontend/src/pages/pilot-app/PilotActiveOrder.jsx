import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import '../../styles/pilot-app.css';

const STATUS_FLOW = {
  assigned: { next: 'picked_up', label: '📦 Mark as Picked Up', color: '#A29BFE' },
  picked_up: { next: 'on_the_way', label: '🚀 Start Delivery', color: '#6C5CE7' },
  on_the_way: { next: 'delivered', label: '✅ Mark as Delivered', color: '#00B894' },
};

export default function PilotActiveOrder() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(user?.is_online || false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showCamera, setShowCamera] = useState(null);
  const [podNote, setPodNote] = useState('');
  const [podPhoto, setPodPhoto] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [podPreview, setPodPreview] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    fetchOrders();
    if (isOnline) startTracking();
    return () => {
      stopTracking();
      stopCamera();
    };
  }, [isOnline]);

  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [showCamera]);

  useEffect(() => {
    if (podPhoto) {
      const url = URL.createObjectURL(podPhoto);
      setPodPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPodPreview(null);
    }
  }, [podPhoto]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsCameraReady(true);
      }
    } catch (err) {
      console.error('Failed to access camera', err);
      alert('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    setIsCameraReady(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      setPodPhoto(blob);
      stopCamera();
    }, 'image/jpeg', 0.8);
  };

  const retakePhoto = () => {
    setPodPhoto(null);
    startCamera();
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/pilot/orders');
      setOrders(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnline = async () => {
    try {
      const response = await api.put('/pilot/toggle-online');
      const newStatus = response.data?.data?.is_online;
      setIsOnline(newStatus);
      if (newStatus) startTracking(); else stopTracking();
    } catch (error) {
      alert('Failed to toggle status');
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        api.post('/pilot/location', {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }).catch(() => {});
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handleStatusUpdate = async (order) => {
    const flow = STATUS_FLOW[order.status];
    if (!flow) return;

    if (flow.next === 'delivered') {
      setShowCamera(order.id);
      return;
    }

    setUpdatingStatus(true);
    try {
      await api.put(`/pilot/orders/${order.id}/status`, { status: flow.next });
      fetchOrders();
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelivered = async (orderId) => {
    setUpdatingStatus(true);
    try {
      await api.put(`/pilot/orders/${orderId}/status`, { status: 'delivered' });

      if (podPhoto) {
        const formData = new FormData();
        formData.append('photo', podPhoto, 'pod.jpg');
        formData.append('note', podNote);
        try {
          if (navigator.geolocation) {
            const pos = await new Promise((resolve, reject) =>
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
            );
            formData.append('lat', pos.coords.latitude);
            formData.append('lng', pos.coords.longitude);
          }
        } catch (gpsError) {
          console.warn('GPS not available for POD:', gpsError);
        }
        
        await api.post(`/pilot/orders/${orderId}/pod`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setShowCamera(null);
      setPodPhoto(null);
      setPodNote('');
      fetchOrders();
    } catch (error) {
      alert('Failed to confirm delivery');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFailed = async (orderId) => {
    const reason = prompt('Enter failure reason:');
    if (!reason) return;
    try {
      await api.put(`/pilot/orders/${orderId}/status`, { status: 'failed', failure_reason: reason });
      fetchOrders();
    } catch (error) {
      alert('Failed to update');
    }
  };

  if (loading) return <div className="loading-center">Loading...</div>;

  return (
    <div className="pilot-app">
      <div className="pilot-top-bar">
        <div>
          <h2>🛵 {user?.name || 'Pilot'}</h2>
        </div>
        <div className="pilot-controls">
          <button
            className={`online-toggle ${isOnline ? 'is-online' : 'is-offline'}`}
            onClick={toggleOnline}
          >
            {isOnline ? '🟢 Online' : '⚪ Offline'}
          </button>
          <button className="link-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card pilot-empty">
          <h3>🎉 No active orders</h3>
          <p>You're all caught up! Wait for new assignments.</p>
        </div>
      ) : (
        orders.map((order) => {
          const flow = STATUS_FLOW[order.status];
          return (
            <div key={order.id} className="glass-card pilot-order-card">
              <div className="pilot-order-header">
                <span className="tracking-code">{order.tracking_code}</span>
                <StatusBadge status={order.status} />
              </div>

              <div className="pilot-order-details">
                <div className="pilot-address">
                  <span className="label">📍 Pickup</span>
                  <strong>{order.pickup_name}</strong>
                  <span>{order.pickup_address}</span>
                  <a href={`tel:${order.pickup_phone}`} className="phone-link">📞 {order.pickup_phone}</a>
                </div>
                <div className="pilot-address">
                  <span className="label">📍 Dropoff</span>
                  <strong>{order.dropoff_name}</strong>
                  <span>{order.dropoff_address}</span>
                  <a href={`tel:${order.dropoff_phone}`} className="phone-link">📞 {order.dropoff_phone}</a>
                </div>
              </div>

              {order.description && (
                <p className="pilot-desc">📋 {order.description}</p>
              )}

              {order.cod_amount > 0 && (
                <div className="cod-alert">💰 Collect COD: {order.cod_amount} EGP</div>
              )}

              <div className="pilot-actions">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    order.status === 'assigned' ? order.pickup_address : order.dropoff_address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-nav"
                >
                  🗺️ Navigate
                </a>

                {flow && (
                  <button
                    className="btn giant-btn"
                    style={{ background: flow.color }}
                    onClick={() => handleStatusUpdate(order)}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? 'Updating...' : flow.label}
                  </button>
                )}

                {order.status !== 'delivered' && (
                  <button className="btn btn-fail" onClick={() => handleFailed(order.id)}>
                    ❌ Failed
                  </button>
                )}
              </div>

              {/* POD Camera Modal */}
              {showCamera === order.id && (
                <div className="pod-capture glass-card">
                  <h3>📸 Proof of Delivery</h3>
                  
                  {!podPhoto ? (
                    <div className="camera-container" style={{ position: 'relative', width: '100%', background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                      <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted 
                        style={{ width: '100%', display: isCameraReady ? 'block' : 'none' }}
                      />
                      {!isCameraReady && <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Loading Camera...</div>}
                      {isCameraReady && (
                        <button 
                          onClick={capturePhoto} 
                          style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '4px solid #fff' }}
                        >
                          📸
                        </button>
                      )}
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                  ) : (
                    <div style={{ marginBottom: '1rem' }}>
                      <img src={podPreview} alt="Captured POD" style={{ width: '100%', borderRadius: '8px' }} />
                      <button onClick={retakePhoto} className="link-btn mt-4" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                        🔄 Retake Photo
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Note (e.g., left with neighbor)"
                    value={podNote}
                    onChange={(e) => setPodNote(e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                  
                  <div className="pod-actions">
                    <Button variant="danger" onClick={() => { stopCamera(); setShowCamera(null); setPodPhoto(null); }}>Cancel</Button>
                    <Button onClick={() => handleDelivered(order.id)} disabled={updatingStatus || !podPhoto}>
                      {updatingStatus ? 'Confirming...' : '✅ Confirm'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}