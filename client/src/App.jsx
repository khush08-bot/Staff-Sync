import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// HR Pages
import EmployeesList from './pages/hr/EmployeesList';
import HRAttendance from './pages/hr/HRAttendance';
import HRLeaveRequests from './pages/hr/HRLeaveRequests';
import HRAnnouncements from './pages/hr/HRAnnouncements';
import HRTraining from './pages/hr/HRTraining';

// Manager Pages
import TeamLeaveRequests from './pages/manager/TeamLeaveRequests';
import ManagerTraining from './pages/manager/ManagerTraining';
import TeamMembers from './pages/manager/TeamMembers';

// Employee Pages
import MyProfile from './pages/employee/MyProfile';
import MyAttendance from './pages/employee/MyAttendance';
import MyLeaves from './pages/employee/MyLeaves';
import AnnouncementsView from './pages/employee/AnnouncementsView';
import MyTraining from './pages/employee/MyTraining';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Main Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* HR Exclusive Routes */}
      <Route
        path="/hr/employees"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Layout>
              <EmployeesList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/attendance"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Layout>
              <HRAttendance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/leaves"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Layout>
              <HRLeaveRequests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/announcements"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Layout>
              <HRAnnouncements />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/training"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Layout>
              <HRTraining />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Manager Routes */}
      <Route
        path="/manager/leaves"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout>
              <TeamLeaveRequests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/training"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout>
              <ManagerTraining />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/team"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout>
              <TeamMembers />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Employee Routes (accessible to employees and elevated roles viewing own records) */}
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute allowedRoles={['employee', 'manager', 'hr']}>
            <Layout>
              <MyProfile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/attendance"
        element={
          <ProtectedRoute allowedRoles={['employee', 'manager', 'hr']}>
            <Layout>
              <MyAttendance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/leaves"
        element={
          <ProtectedRoute allowedRoles={['employee', 'manager', 'hr']}>
            <Layout>
              <MyLeaves />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/announcements"
        element={
          <ProtectedRoute allowedRoles={['employee', 'manager', 'hr']}>
            <Layout>
              <AnnouncementsView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/training"
        element={
          <ProtectedRoute allowedRoles={['employee', 'manager', 'hr']}>
            <Layout>
              <MyTraining />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
