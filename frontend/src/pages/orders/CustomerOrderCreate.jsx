import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import useSEO from '../../hooks/useSEO';
import '../../styles/customer.css';

export default function CustomerOrderCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    pickup_name: '',
    pickup_phone: '',
    pickup_address: '',
    dropoff_name: '',
    dropoff_phone: '',
    dropoff_address: '',
    description: '',
    notes: '',
  });

  useSEO({ title: 'طلب توصيل جديد', description: 'أنشئ طلب توصيل جديد مع مسار بسهولة وسرعة.' });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/customer/orders', form);
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل إنشاء الطلب، حاول مرة تانية';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-state">
        <span className="success-icon">🎉</span>
        <h3>تم إرسال طلبك بنجاح!</h3>
        <p>هيتم تعيين طيار لشحنتك في أقرب وقت ممكن</p>
        <Link to="/customer" className="btn-hero primary">
          ← الرجوع لطلباتي
        </Link>
      </div>
    );
  }

  return (
    <div className="create-order-page">
      <h2>✨ طلب توصيل جديد</h2>
      <p className="form-subtitle">املأ البيانات التالية وهنوصل شحنتك في أسرع وقت</p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Pickup Section */}
        <div className="create-section">
          <div className="section-header">
            <div className="section-icon pickup">📍</div>
            <div>
              <h3>بيانات الاستلام</h3>
              <p>من هيسلم الشحنة للطيار؟</p>
            </div>
          </div>
          <div className="customer-input-row">
            <div className="customer-input-group">
              <label>اسم المُرسِل</label>
              <input type="text" placeholder="مثال: أحمد محمد" value={form.pickup_name} onChange={handleChange('pickup_name')} required />
            </div>
            <div className="customer-input-group">
              <label>رقم الهاتف</label>
              <input type="tel" placeholder="01xxxxxxxxx" value={form.pickup_phone} onChange={handleChange('pickup_phone')} required />
            </div>
          </div>
          <div className="customer-input-group">
            <label>عنوان الاستلام</label>
            <input type="text" placeholder="الشارع، المنطقة، المحافظة" value={form.pickup_address} onChange={handleChange('pickup_address')} required />
          </div>
        </div>

        {/* Route Connector */}
        <div className="route-connector">
          <div className="connector-line" />
        </div>

        {/* Dropoff Section */}
        <div className="create-section">
          <div className="section-header">
            <div className="section-icon dropoff">🏠</div>
            <div>
              <h3>بيانات التوصيل</h3>
              <p>مين هيستلم الشحنة؟</p>
            </div>
          </div>
          <div className="customer-input-row">
            <div className="customer-input-group">
              <label>اسم المُستلِم</label>
              <input type="text" placeholder="مثال: سارة أحمد" value={form.dropoff_name} onChange={handleChange('dropoff_name')} required />
            </div>
            <div className="customer-input-group">
              <label>رقم الهاتف</label>
              <input type="tel" placeholder="01xxxxxxxxx" value={form.dropoff_phone} onChange={handleChange('dropoff_phone')} required />
            </div>
          </div>
          <div className="customer-input-group">
            <label>عنوان التوصيل</label>
            <input type="text" placeholder="الشارع، المنطقة، المحافظة" value={form.dropoff_address} onChange={handleChange('dropoff_address')} required />
          </div>
        </div>

        {/* Package Section */}
        <div className="create-section" style={{ marginTop: '0' }}>
          <div className="section-header">
            <div className="section-icon package">📋</div>
            <div>
              <h3>تفاصيل الشحنة</h3>
              <p>اختياري — ممكن تسيبها فاضية</p>
            </div>
          </div>
          <div className="customer-input-group">
            <label>وصف الشحنة</label>
            <input type="text" placeholder="مثال: طرد صغير، أكل، مستندات..." value={form.description} onChange={handleChange('description')} />
          </div>
          <div className="customer-input-group">
            <label>ملاحظات للطيار</label>
            <textarea
              placeholder="مثال: الدور الثالث شقة 5، يرجى الاتصال قبل الوصول..."
              value={form.notes}
              onChange={handleChange('notes')}
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="customer-form-actions">
          <button type="button" className="btn-hero secondary" onClick={() => navigate('/customer')}>
            إلغاء
          </button>
          <button type="submit" className="btn-hero primary" disabled={loading}>
            {loading ? '⏳ جاري الإرسال...' : '🚀 إرسال الطلب'}
          </button>
        </div>
      </form>
    </div>
  );
}
