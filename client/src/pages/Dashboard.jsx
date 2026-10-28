import React from 'react';
import { useAuth } from '../context/AuthContext';
import HRDashboard from './hr/HRDashboard';
import ManagerDashboard from './manager/ManagerDashboard';
import EmployeeDashboard from './employee/EmployeeDashboard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  switch (user.role) {
    case 'hr':
      return <HRDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
    default:
      return <EmployeeDashboard />;
  }
};

export default Dashboard;
