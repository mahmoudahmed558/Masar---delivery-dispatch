import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import PilotLayout from './layouts/PilotLayout';
import PublicLayout from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import OrderList from './pages/orders/OrderList';
import OrderCreate from './pages/orders/OrderCreate';
import OrderDetail from './pages/orders/OrderDetail';
import CustomerOrderList from './pages/orders/CustomerOrderList';
import CustomerOrderCreate from './pages/orders/CustomerOrderCreate';
import PilotList from './pages/pilots/PilotList';
import UserList from './pages/users/UserList';
import PilotActiveOrder from './pages/pilot-app/PilotActiveOrder';
import PublicTracking from './pages/tracking/PublicTracking';

import './styles/index.css';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, token, isLoading } = useContext(AuthContext);

  if (isLoading || (token && !user)) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'pilot') return <Navigate to="/pilot" replace />;
    if (['admin', 'manager'].includes(user.role)) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/customer" replace />;
  }

  return children ? children : <Outlet />;
};

const CatchAllRedirect = () => {
  const { user, token, isLoading } = useContext(AuthContext);
  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === 'pilot') return <Navigate to="/pilot" replace />;
  if (['admin', 'manager'].includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/customer" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track/:trackingCode" element={<PublicTracking />} />
        <Route path="/track" element={<PublicTracking />} />
      </Route>

      {/* Admin/Manager Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/new" element={<OrderCreate />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/pilots" element={<PilotList />} />
      </Route>
      
      {/* Admin Only */}
      <Route element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/users" element={<UserList />} />
      </Route>

      {/* Customer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['user']}><CustomerLayout /></ProtectedRoute>}>
        <Route path="/customer" element={<CustomerOrderList />} />
        <Route path="/customer/new" element={<CustomerOrderCreate />} />
        <Route path="/customer/orders/:id" element={<OrderDetail />} />
      </Route>

      {/* Pilot Routes */}
      <Route element={<ProtectedRoute allowedRoles={['pilot']}><PilotLayout /></ProtectedRoute>}>
        <Route path="/pilot" element={<PilotActiveOrder />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}