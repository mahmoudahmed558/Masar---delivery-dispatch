import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useSEO from '../../hooks/useSEO';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import branding from '../../config/branding';
import '../../styles/auth.css';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useSEO({ title: 'تسجيل الدخول', description: 'سجل دخولك إلى لوحة تحكم مسار لإدارة عمليات التوصيل.' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userData = await login(phone, password);
      if (['admin', 'manager'].includes(userData.role)) {
        navigate('/dashboard');
      } else if (userData.role === 'pilot') {
        navigate('/pilot');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <img src={branding.logo} alt="Logo" className="auth-logo" />
        <h2>Welcome to {branding.companyName}</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" className="full-width mt-4" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
        </form>
        <p className="auth-link">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}