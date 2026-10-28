import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, employee, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'hr':
        return <span className="badge bg-primary px-2 py-1">HR Admin</span>;
      case 'manager':
        return <span className="badge bg-purple px-2 py-1" style={{ backgroundColor: '#6f42c1', color: '#fff' }}>Manager</span>;
      case 'employee':
      default:
        return <span className="badge bg-secondary px-2 py-1">Employee</span>;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-2 px-3 shadow-xs">
      <div className="container-fluid px-0">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-light d-md-none me-2 border"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <i className="bi bi-list fs-5"></i>
          </button>
          <Link to="/dashboard" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary mb-0">
            <span
              className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-2"
              style={{ width: '32px', height: '32px' }}
            >
              <i className="bi bi-people-fill fs-6"></i>
            </span>
            <span className="fs-5 tracking-tight text-dark">
              Staff<span className="text-primary">Sync</span>
            </span>
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3 ms-auto">
          {user && (
            <div className="d-flex align-items-center gap-2">
              <div className="text-end d-none d-sm-block">
                <div className="fw-semibold text-dark fs-6 lh-sm">{user.name}</div>
                <div className="d-flex align-items-center justify-content-end gap-1">
                  {getRoleBadge(user.role)}
                  {employee?.employeeId && (
                    <small className="text-muted fw-mono ms-1">{employee.employeeId}</small>
                  )}
                </div>
              </div>
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center border"
                style={{ width: '38px', height: '38px', fontSize: '0.9rem' }}
              >
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 ms-1"
                onClick={handleLogout}
                title="Log out from StaffSync"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span className="d-none d-md-inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
