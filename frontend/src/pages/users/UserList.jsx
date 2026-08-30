import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', role: 'user', vehicle_type: '' });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', phone: '', email: '', password: '', role: 'user', vehicle_type: '' });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, phone: user.phone, email: user.email || '', password: '', role: user.role, vehicle_type: user.vehicle_type || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      if (!data.email) delete data.email;
      if (data.role !== 'pilot') delete data.vehicle_type;

      if (editUser) {
        await api.put(`/users/${editUser.id}`, data);
      } else {
        await api.post('/users', data);
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert('Failed to deactivate');
    }
  };

  const roleBadge = (role) => {
    const colors = { admin: '#E17055', manager: '#6C5CE7', pilot: '#00CEC9', user: '#74B9FF' };
    const color = colors[role] || '#888';
    return (
      <span className="status-badge" style={{ background: `${color}22`, color: color }}>
        {role}
      </span>
    );
  };

  if (loading) return <div className="loading-center">Loading users...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>👥 Users</h2>
        <Button onClick={openCreate}>+ Add User</Button>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.phone}</td>
                <td>{u.email || '—'}</td>
                <td>{roleBadge(u.role)}</td>
                <td>{u.is_active ? '🟢 Active' : '🔴 Inactive'}</td>
                <td>
                  <button className="link-btn" onClick={() => openEdit(u)}>Edit</button>
                  {' '}
                  <button className="link-btn danger" onClick={() => handleDeactivate(u.id)}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editUser ? 'Edit User' : 'Create User'}</h3>
            <form onSubmit={handleSubmit}>
              <Input label="Name" value={form.name} onChange={handleChange('name')} required />
              <Input label="Phone" value={form.phone} onChange={handleChange('phone')} required />
              <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} />
              <Input label="Password" type="password" value={form.password} onChange={handleChange('password')} required={!editUser} />
              <div className="input-group">
                <label>Role</label>
                <select className="input-field" value={form.role} onChange={handleChange('role')}>
                  <option value="user">User</option>
                  <option value="pilot">Pilot</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {form.role === 'pilot' && (
                <Input label="Vehicle Type" value={form.vehicle_type} onChange={handleChange('vehicle_type')} />
              )}
              <div className="form-actions">
                <Button type="button" variant="danger" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">{editUser ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}