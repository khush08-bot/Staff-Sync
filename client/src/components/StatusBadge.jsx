import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let bgClass = 'bg-secondary';
  let icon = null;

  if (normalized === 'active' || normalized === 'approved' || normalized === 'present' || normalized === 'completed') {
    bgClass = 'bg-success';
    icon = 'bi-check-circle-fill';
  } else if (normalized === 'pending' || normalized === 'in progress' || normalized === 'half day') {
    bgClass = 'bg-warning text-dark';
    icon = 'bi-clock-fill';
  } else if (normalized === 'rejected' || normalized === 'inactive' || normalized === 'late') {
    bgClass = 'bg-danger';
    icon = 'bi-x-circle-fill';
  } else if (normalized === 'on leave' || normalized === 'upcoming') {
    bgClass = 'bg-info text-dark';
    icon = 'bi-calendar-event-fill';
  }

  return (
    <span className={`badge rounded-pill ${bgClass} px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1`}>
      {icon && <i className={`bi ${icon}`} style={{ fontSize: '0.75rem' }}></i>}
      {status}
    </span>
  );
};

export default StatusBadge;
