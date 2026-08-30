const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src');

const files = {
    "components/common/Button.jsx": `import React from 'react';
import '../../styles/components.css';
export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={\`btn btn-\${variant} \${className}\`} {...props}>
      {children}
    </button>
  );
}`,
    "components/common/Input.jsx": `import React from 'react';
import '../../styles/components.css';
export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={\`input-group \${className}\`}>
      {label && <label>{label}</label>}
      <input className="input-field" {...props} />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}`,
    "components/common/StatusBadge.jsx": `import React from 'react';
import '../../styles/components.css';
export default function StatusBadge({ status }) {
  const normalized = status.toLowerCase().replace(' ', '_');
  return <span className={\`status-badge status-\${normalized}\`}>{status}</span>;
}`,
    "components/common/LoadingSpinner.jsx": `import React from 'react';
export default function LoadingSpinner() {
  return <div className="spinner">Loading...</div>;
}`,
    "components/common/StatsCard.jsx": `import React from 'react';
export default function StatsCard({ title, value, icon, color }) {
  return (
    <div className="glass-card stats-card" style={{ borderTop: \`4px solid \${color}\` }}>
      <div className="stats-info">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
      </div>
      <div className="stats-icon">{icon}</div>
    </div>
  );
}`,
    "layouts/DashboardLayout.jsx": `import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import branding from '../config/branding';
import '../styles/layout.css';

export default function DashboardLayout() {
  const { logout } = useAuth();
  return (
    <div className="dashboard-layout">
      <aside className="sidebar glass-card">
        <div className="brand">
          <img src={branding.logo} alt={branding.logoAlt} className="logo" />
          <h2>{branding.companyName}</h2>
        </div>
        <nav className="nav-menu">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/pilots">Pilots</Link>
          <Link to="/users">Users</Link>
        </nav>
        <button className="btn btn-danger logout-btn" onClick={logout}>Logout</button>
      </aside>
      <main className="main-content">
        <header className="top-header glass-card">
          <h1>Manager Dashboard</h1>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}`,
    "layouts/PilotLayout.jsx": `import React from 'react';
import { Outlet } from 'react-router-dom';
import branding from '../config/branding';
import '../styles/layout.css';

export default function PilotLayout() {
  return (
    <div className="pilot-layout">
      <header className="pilot-header">
        <img src={branding.logo} alt="Logo" className="pilot-logo" />
        <h2>{branding.companyName} Pilot</h2>
      </header>
      <main className="pilot-content">
        <Outlet />
      </main>
    </div>
  );
}`,
    "layouts/PublicLayout.jsx": `import React from 'react';
import { Outlet } from 'react-router-dom';
import '../styles/layout.css';

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <Outlet />
    </div>
  );
}`,
    "pages/auth/Login.jsx": `import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import branding from '../../config/branding';
import '../../styles/auth.css';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(phone, password);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <img src={branding.logo} alt="Logo" className="auth-logo" />
        <h2>Welcome to {branding.companyName}</h2>
        <form onSubmit={handleSubmit}>
          <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" className="full-width mt-4">Login</Button>
        </form>
        <p className="auth-link">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}`,
    "pages/auth/Register.jsx": `import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import '../../styles/auth.css';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', password_confirmation: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
          <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          <Input label="Confirm Password" type="password" value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})} required />
          <Button type="submit" className="full-width mt-4">Register</Button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}`,
    "pages/dashboard/Dashboard.jsx": `import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatsCard from '../../components/common/StatsCard';
import LiveMap from '../../components/maps/LiveMap';
import branding from '../../config/branding';
import '../../styles/dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_orders: 0, pending: 0, active: 0, delivered: 0, failed: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    // Mock data for display, usually fetch from /dashboard/stats
    setStats({ total_orders: 120, pending: 15, active: 30, delivered: 70, failed: 5 });
    setRecent([{ id: 1, tracking_code: 'ELT-001', status: 'delivered' }]);
  }, []);

  return (
    <div className="dashboard-page">
      <div className="stats-grid">
        <StatsCard title="Total Orders" value={stats.total_orders} color={branding.primaryColor} />
        <StatsCard title="Pending" value={stats.pending} color={branding.statusPending} />
        <StatsCard title="Active" value={stats.active} color={branding.statusOnTheWay} />
        <StatsCard title="Delivered" value={stats.delivered} color={branding.statusDelivered} />
        <StatsCard title="Failed" value={stats.failed} color={branding.statusFailed} />
      </div>
      <div className="map-container glass-card">
        <h3>Live Map</h3>
        <LiveMap />
      </div>
    </div>
  );
}`,
    "pages/orders/OrderList.jsx": `import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';

export default function OrderList() {
  return (
    <div className="glass-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h2>Orders</h2>
        <Link to="/orders/new"><Button>New Order</Button></Link>
      </div>
      <table>
        <thead><tr><th>Tracking</th><th>Customer</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          <tr>
            <td>ELT-1234</td><td>John Doe</td><td><StatusBadge status="Pending" /></td>
            <td><Link to="/orders/1">View</Link></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}`,
    "pages/orders/OrderCreate.jsx": `import React from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function OrderCreate() {
  const navigate = useNavigate();
  return (
    <div className="glass-card p-4">
      <h2>Create Order</h2>
      <form onSubmit={(e) => { e.preventDefault(); navigate('/orders'); }}>
        <Input label="Customer Name" required />
        <Input label="Customer Phone" required />
        <Input label="Pickup Address" required />
        <Input label="Dropoff Address" required />
        <Button type="submit" className="mt-4">Submit Order</Button>
      </form>
    </div>
  );
}`,
    "pages/orders/OrderDetail.jsx": `import React from 'react';
import { useParams } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';

export default function OrderDetail() {
  const { id } = useParams();
  return (
    <div className="glass-card p-4">
      <h2>Order Details #{id}</h2>
      <p>Tracking Code: ELT-1234</p>
      <p>Status: <StatusBadge status="Delivered" /></p>
    </div>
  );
}`,
    "pages/pilots/PilotList.jsx": `import React from 'react';

export default function PilotList() {
  return (
    <div className="glass-card p-4">
      <h2>Pilots</h2>
      <p>List of pilots will appear here.</p>
    </div>
  );
}`,
    "pages/users/UserList.jsx": `import React from 'react';

export default function UserList() {
  return (
    <div className="glass-card p-4">
      <h2>Users</h2>
      <p>User management interface here.</p>
    </div>
  );
}`,
    "pages/pilot-app/PilotActiveOrder.jsx": `import React from 'react';
import Button from '../../components/common/Button';
import '../../styles/pilot-app.css';

export default function PilotActiveOrder() {
  return (
    <div className="pilot-active-order p-4">
      <h2>Current Assignment</h2>
      <div className="glass-card p-4 mb-4">
        <h3>Customer: John Doe</h3>
        <p>Dropoff: 123 Main St, Cairo</p>
      </div>
      <Button className="full-width giant-btn">Mark as Picked Up</Button>
    </div>
  );
}`,
    "pages/tracking/PublicTracking.jsx": `import React from 'react';
import { useParams } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import TrackingMap from '../../components/maps/TrackingMap';

export default function PublicTracking() {
  const { trackingCode } = useParams();
  return (
    <div className="public-tracking-page">
      <div className="glass-card p-4 mx-auto max-w-2xl mt-8">
        <h2>Tracking Order: {trackingCode || 'ELT-UNKNOWN'}</h2>
        <div className="mt-4">
          <StatusBadge status="On The Way" />
        </div>
        <div className="mt-8">
          <TrackingMap />
        </div>
      </div>
    </div>
  );
}`,
    "components/maps/LiveMap.jsx": `import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMap() {
  return (
    <MapContainer center={[30.0444, 31.2357]} zoom={12} style={{ height: '400px', width: '100%', borderRadius: '12px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <Marker position={[30.0444, 31.2357]}>
        <Popup>Pilot: Ahmed</Popup>
      </Marker>
    </MapContainer>
  );
}`,
    "components/maps/TrackingMap.jsx": `import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function TrackingMap() {
  return (
    <MapContainer center={[30.0444, 31.2357]} zoom={13} style={{ height: '300px', width: '100%', borderRadius: '12px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[30.0444, 31.2357]} />
    </MapContainer>
  );
}`,
    "components/pod/PodViewer.jsx": `import React from 'react';
export default function PodViewer({ imageUrl, note }) {
  return (
    <div className="pod-viewer">
      <img src={imageUrl} alt="Proof of Delivery" className="max-w-full rounded" />
      {note && <p className="mt-2 text-sm text-gray-400">{note}</p>}
    </div>
  );
}`,
    "styles/layout.css": `
.dashboard-layout { display: flex; height: 100vh; overflow: hidden; }
.sidebar { width: 250px; padding: 2rem; display: flex; flex-direction: column; border-radius: 0; border-right: 1px solid var(--glass-border); }
.nav-menu { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; flex: 1; }
.nav-menu a { color: var(--text-secondary); padding: 0.5rem; border-radius: var(--border-radius-small); }
.nav-menu a:hover { background: var(--bg-card-hover); color: var(--primary-light); }
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.top-header { padding: 1rem 2rem; border-radius: 0; border-bottom: 1px solid var(--glass-border); }
.content-area { padding: 2rem; overflow-y: auto; flex: 1; }
.brand img { max-width: 100%; height: auto; margin-bottom: 1rem; }
.pilot-layout { padding: 1rem; }
.public-layout { min-height: 100vh; padding: 2rem; }
`,
    "styles/components.css": `
.btn { padding: 0.75rem 1.5rem; border-radius: var(--border-radius-small); border: none; cursor: pointer; font-weight: 600; transition: all 0.2s ease; }
.btn-primary { background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)); color: white; }
.btn-danger { background: var(--danger-color); color: white; }
.btn:hover { opacity: 0.9; transform: translateY(-1px); }
.full-width { width: 100%; }
.giant-btn { padding: 2rem; font-size: 1.5rem; border-radius: var(--border-radius-large); }
.input-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
.input-field { padding: 0.75rem; border-radius: var(--border-radius-small); background: var(--bg-dark); border: 1px solid var(--glass-border); color: white; }
.input-field:focus { outline: none; border-color: var(--primary-color); }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
.status-pending { background: rgba(253, 203, 110, 0.2); color: var(--status-pending); }
.status-on_the_way { background: rgba(108, 92, 231, 0.2); color: var(--status-on_the_way); }
.status-delivered { background: rgba(0, 184, 148, 0.2); color: var(--status-delivered); }
.mt-4 { margin-top: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.max-w-2xl { max-width: 42rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
`,
    "styles/auth.css": `
.auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
.auth-card { width: 100%; max-width: 400px; padding: 2.5rem; text-align: center; }
.auth-logo { width: 80px; height: 80px; margin-bottom: 1.5rem; }
.auth-link { margin-top: 1.5rem; color: var(--text-secondary); font-size: 0.875rem; }
`,
    "styles/dashboard.css": `
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stats-card { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
.stats-value { font-size: 2rem; font-weight: bold; margin-top: 0.5rem; }
.map-container { padding: 1.5rem; }
`,
    "styles/pilot-app.css": `
.pilot-active-order { text-align: center; max-width: 500px; margin: 0 auto; }
`,
    "App.jsx": `import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import PilotLayout from './layouts/PilotLayout';
import PublicLayout from './layouts/PublicLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import OrderList from './pages/orders/OrderList';
import OrderCreate from './pages/orders/OrderCreate';
import OrderDetail from './pages/orders/OrderDetail';
import PilotList from './pages/pilots/PilotList';
import UserList from './pages/users/UserList';
import PilotActiveOrder from './pages/pilot-app/PilotActiveOrder';
import PublicTracking from './pages/tracking/PublicTracking';

import './styles/index.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/track/:trackingCode" element={<PublicTracking />} />
          </Route>

          {/* Admin/Manager Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/new" element={<OrderCreate />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/pilots" element={<PilotList />} />
            <Route path="/users" element={<UserList />} />
          </Route>

          {/* Pilot Routes */}
          <Route element={<PilotLayout />}>
            <Route path="/pilot" element={<PilotActiveOrder />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}`,
    "main.jsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
};

for (const [relPath, content] of Object.entries(files)) {
    const fullPath = path.join(baseDir, relPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
}

// Done
console.log("All files generated successfully.");
