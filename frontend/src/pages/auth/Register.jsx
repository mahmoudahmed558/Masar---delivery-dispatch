import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useSEO from '../../hooks/useSEO';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import branding from '../../config/branding';
import '../../styles/auth.css';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  useSEO({ title: 'إنشاء حساب جديد', description: 'انضم إلى مسار وابدأ في إدارة أو تتبع شحناتك بسهولة.' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <img src={branding.logo} alt="Logo" className="auth-logo" />
        <h2>Register to {branding.companyName}</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
          <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          <Input label="Confirm Password" type="password" value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})} required />
          <Button type="submit" className="full-width mt-4" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}