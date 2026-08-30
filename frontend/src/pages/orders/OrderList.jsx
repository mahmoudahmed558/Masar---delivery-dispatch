import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import '../../styles/orders.css';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });

  const fetchOrders = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNumber };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const response = await api.get('/orders', { params });
      setOrders(response.data?.data || []);
      if (response.data?.meta) {
        setMeta(response.data.meta);
        setPage(response.data.meta.current_page);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.last_page) {
      fetchOrders(newPage);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>📦 Orders</h2>
        <Link to="/orders/new"><Button>+ New Order</Button></Link>
      </div>

      <div className="filters-bar glass-card">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by tracking code, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field search-input"
          />
          <Button type="submit" variant="primary">Search</Button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field filter-select"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="picked_up">Picked Up</option>
          <option value="on_the_way">On The Way</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="glass-card table-container">
        {loading ? (
          <div className="loading-center">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>📭 No orders found</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Tracking</th>
                  <th>Pickup</th>
                  <th>Dropoff</th>
                  <th>Status</th>
                  <th>Pilot</th>
                  <th>Fee</th>
                  <th>COD</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="tracking-code">{order.tracking_code}</td>
                    <td>
                      <div className="cell-name">{order.pickup_name}</div>
                      <div className="cell-sub">{order.pickup_phone}</div>
                    </td>
                    <td>
                      <div className="cell-name">{order.dropoff_name}</div>
                      <div className="cell-sub">{order.dropoff_phone}</div>
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>{order.pilot?.name || '—'}</td>
                    <td>{order.delivery_fee || 0} EGP</td>
                    <td>{order.cod_amount || 0} EGP</td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="view-link">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {meta.last_page > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <Button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</Button>
                <span style={{ display: 'flex', alignItems: 'center' }}>Page {page} of {meta.last_page}</span>
                <Button onClick={() => handlePageChange(page + 1)} disabled={page === meta.last_page}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}