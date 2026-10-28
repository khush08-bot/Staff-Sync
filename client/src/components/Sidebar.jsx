import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const role = user?.role;

  const hrLinks = [
    { to: '/dashboard', label: 'HR Dashboard', icon: 'bi-grid-1x2-fill' },
    { to: '/hr/employees', label: 'Employees', icon: 'bi-people-fill' },
    { to: '/hr/attendance', label: 'Attendance', icon: 'bi-calendar-check-fill' },
    { to: '/hr/leaves', label: 'Leave Requests', icon: 'bi-calendar2-range-fill' },
    { to: '/hr/announcements', label: 'Announcements', icon: 'bi-megaphone-fill' },
    { to: '/hr/training', label: 'Training Programs', icon: 'bi-journal-bookmark-fill' },
  ];

  const managerLinks = [
    { to: '/dashboard', label: 'Manager Dashboard', icon: 'bi-grid-1x2-fill' },
    { to: '/manager/leaves', label: 'Team Leave Requests', icon: 'bi-calendar2-check-fill' },
    { to: '/manager/training', label: 'Training & Development', icon: 'bi-mortarboard-fill' },
    { to: '/manager/team', label: 'My Team Members', icon: 'bi-people-fill' },
  ];

  const employeeLinks = [
    { to: '/dashboard', label: 'Employee Dashboard', icon: 'bi-grid-1x2-fill' },
    { to: '/employee/profile', label: 'My Profile', icon: 'bi-person-badge-fill' },
    { to: '/employee/attendance', label: 'My Attendance', icon: 'bi-clock-history' },
    { to: '/employee/leaves', label: 'My Leave Requests', icon: 'bi-calendar2-plus-fill' },
    { to: '/employee/announcements', label: 'Announcements', icon: 'bi-bell-fill' },
    { to: '/employee/training', label: 'My Assigned Training', icon: 'bi-award-fill' },
  ];

  let navLinks = [];
  if (role === 'hr') navLinks = hrLinks;
  else if (role === 'manager') navLinks = managerLinks;
  else if (role === 'employee') navLinks = employeeLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop d-md-none"
          onClick={closeSidebar}
        ></div>
      )}

      <aside className={`sidebar bg-white border-end ${isOpen ? 'show' : ''}`}>
        <div className="p-3 border-bottom d-none d-md-block">
          <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
            {role ? `${role.toUpperCase()} WORKSPACE` : 'MENU'}
          </span>
        </div>

        <nav className="p-2 nav flex-column gap-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 rounded-2 px-3 py-2 text-decoration-none fw-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-secondary hover-bg-light'
                }`
              }
            >
              <i className={`bi ${item.icon} fs-5`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-3 border-top bg-light">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-circle p-1">
              <span className="visually-hidden">Online</span>
            </span>
            <small className="text-muted">StaffSync v1.0.0 (Live)</small>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
