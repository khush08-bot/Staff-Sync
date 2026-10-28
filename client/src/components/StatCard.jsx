import React from 'react';

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => {
  return (
    <div className="card border-0 shadow-sm h-100 rounded-3">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              {title}
            </p>
            <h3 className="fw-bold mb-0 text-dark">{value}</h3>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div
            className={`rounded-3 d-flex align-items-center justify-content-center bg-${color} bg-opacity-10 text-${color}`}
            style={{ width: '48px', height: '48px' }}
          >
            <i className={`bi ${icon} fs-4`}></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
