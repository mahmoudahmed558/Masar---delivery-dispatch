import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import '../../styles/orders.css';

export default function OrderCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    pickup_name: '',
    pickup_phone: '',
    pickup_address: '',
    dropoff_name: '',
    dropoff_phone: '',
    dropoff_address: '',
    description: '',
    delivery_fee: '',
    cod_amount: '',
    payment_method: 'cash',
    notes: '',
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = {
        ...form,
        delivery_fee: parseFloat(form.delivery_fee) || 0,
        cod_amount: parseFloat(form.cod_amount) || 0,
      };
      await api.post('/orders', data);
      navigate('/orders');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create order';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>📦 Create New Order</h2>
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="glass-card form-section">
            <h3>📍 Pickup Details</h3>
            <Input label="Sender Name" value={form.pickup_name} onChange={handleChange('pickup_name')} required />
            <Input label="Sender Phone" value={form.pickup_phone} onChange={handleChange('pickup_phone')} required />
            <Input label="Pickup Address" value={form.pickup_address} onChange={handleChange('pickup_address')} required />
          </div>

          <div className="glass-card form-section">
            <h3>📍 Dropoff Details</h3>
            <Input label="Recipient Name" value={form.dropoff_name} onChange={handleChange('dropoff_name')} required />
            <Input label="Recipient Phone" value={form.dropoff_phone} onChange={handleChange('dropoff_phone')} required />
            <Input label="Dropoff Address" value={form.dropoff_address} onChange={handleChange('dropoff_address')} required />
          </div>
        </div>

        <div className="glass-card form-section" style={{ marginTop: '1.5rem' }}>
          <h3>📋 Package & Payment</h3>
          <Input label="Description" value={form.description} onChange={handleChange('description')} />
          <div className="form-row">
            <Input label="Delivery Fee (EGP)" type="number" step="0.01" value={form.delivery_fee} onChange={handleChange('delivery_fee')} />
            <Input label="COD Amount (EGP)" type="number" step="0.01" value={form.cod_amount} onChange={handleChange('cod_amount')} />
          </div>
          <div className="input-group">
            <label>Payment Method</label>
            <select className="input-field" value={form.payment_method} onChange={handleChange('payment_method')}>
              <option value="cash">Cash</option>
              <option value="prepaid">Prepaid</option>
            </select>
          </div>
          <Input label="Notes" value={form.notes} onChange={handleChange('notes')} />
        </div>

        <div className="form-actions">
          <Button type="button" variant="danger" onClick={() => navigate('/orders')}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : '✅ Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}