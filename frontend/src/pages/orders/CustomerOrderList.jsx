import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import useSEO from '../../hooks/useSEO';
import '../../styles/customer.css';

const STATUS_ICONS = {
  pending: '⏳',
  assigned: '🏍️',
  picked_up: '📦',
  on_the_way: '🚀',
  delivered: '✅',
  failed: '❌',
  cancelled: '🚫',
};

export default function CustomerOrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useSEO({ title: 'طلباتي', description: 'تابع حالة كل طلباتك مع مسار.' });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customer/orders');
      const data = response.data?.data;
      setOrders(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter(o => ['assigned', 'picked_up', 'on_the_way'].includes(o.status)).length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    return { total, active, delivered, pending };
  }, [orders]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء النور';
    return 'مساء الخير';
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="customer-hero">
        <div className="hero-content">
          <span className="hero-badge">🚀 Masar Speed Delivery</span>
          <h2>
            {getGreeting()}, <span className="highlight">{user?.name || 'عميلنا'}</span>
          </h2>
          <p>تابع شحناتك لحظة بلحظة وأنشئ طلبات توصيل جديدة بسهولة وسرعة</p>
          <div className="hero-actions">
            <Link to="/customer/new" className="btn-hero primary">
              ✨ طلب توصيل جديد
            </Link>
            <button className="btn-hero secondary" onClick={fetchOrders}>
              🔄 تحديث الطلبات
            </button>
          </div>
        </div>
      </div>

      {/* Mini Stats */}
      {orders.length > 0 && (
        <div className="customer-stats">
          <div className="stat-mini">
            <span className="stat-icon">📦</span>
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">إجمالي الطلبات</span>
          </div>
          <div className="stat-mini">
            <span className="stat-icon">🚀</span>
            <span className="stat-number" style={{ color: '#3498DB' }}>{stats.active}</span>
            <span className="stat-label">جاري التوصيل</span>
          </div>
          <div className="stat-mini">
            <span className="stat-icon">✅</span>
            <span className="stat-number" style={{ color: '#00B894' }}>{stats.delivered}</span>
            <span className="stat-label">تم التوصيل</span>
          </div>
          <div className="stat-mini">
            <span className="stat-icon">⏳</span>
            <span className="stat-number" style={{ color: '#FDCB6E' }}>{stats.pending}</span>
            <span className="stat-label">في الانتظار</span>
          </div>
        </div>
      )}

      {/* Orders List */}
      <h3 className="orders-section-title">📋 طلباتك الأخيرة</h3>

      {loading ? (
        <div className="order-cards">
          {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="customer-empty">
          <span className="empty-icon">📭</span>
          <h3>مفيش طلبات لسه</h3>
          <p>ابدأ أول طلب توصيل دلوقتي واستمتع بالسرعة والأمان!</p>
          <Link to="/customer/new" className="btn-hero primary">
            ✨ اطلب توصيل دلوقتي
          </Link>
        </div>
      ) : (
        <div className="order-cards">
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/track/${order.tracking_code}`}
              target="_blank"
              className="order-card"
            >
              <div className={`oc-icon ${order.status}`}>
                {STATUS_ICONS[order.status] || '📦'}
              </div>

              <div className="oc-details">
                <div className="oc-route">
                  {order.pickup_name}
                  <span className="arrow">←</span>
                  {order.dropoff_name}
                </div>
                <div className="oc-tracking">{order.tracking_code}</div>
              </div>

              <div className="oc-meta">
                <StatusBadge status={order.status} />
                {(order.delivery_fee !== null && order.delivery_fee !== undefined) && (
                  <span className="oc-fee">{order.delivery_fee} جنيه</span>
                )}
                <span className="oc-date">{formatDate(order.created_at)}</span>
              </div>

              <span className="oc-arrow">←</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
