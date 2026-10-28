import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container py-5 text-center">
        <div className="card shadow-sm p-5 max-w-500 mx-auto border-0">
          <i className="bi bi-shield-lock text-danger" style={{ fontSize: '3.5rem' }}></i>
          <h3 className="mt-3 text-dark fw-bold">Access Restricted</h3>
          <p className="text-muted">
            Your role (<strong className="text-uppercase">{user.role}</strong>) does not have permission to view this section.
          </p>
          <div>
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
