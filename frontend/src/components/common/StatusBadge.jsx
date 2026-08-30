import React from 'react';
import '../../styles/components.css';

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  picked_up: 'Picked Up',
  on_the_way: 'On The Way',
  delivered: 'Delivered',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const normalized = status.toLowerCase().replace(/\s+/g, '_');
  const label = STATUS_LABELS[normalized] || status;
  return <span className={`status-badge status-${normalized}`}>{label}</span>;
}