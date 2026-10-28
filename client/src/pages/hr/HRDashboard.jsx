import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { employeeApi } from '../../api/employeeApi';
import { leaveApi } from '../../api/leaveApi';
import { attendanceApi } from '../../api/attendanceApi';
import { announcementApi } from '../../api/announcementApi';
import { trainingApi } from '../../api/trainingApi';

const HRDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    todayPresent: 0,
    totalAnnouncements: 0,
    totalTrainings: 0,
  });
  const [pendingLeavesList, setPendingLeavesList] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [empRes, leaveRes, attRes, annRes, trainRes] = await Promise.all([
        employeeApi.getAll({}),
        leaveApi.getForReview({ status: 'Pending' }),
        attendanceApi.getAll({ date: new Date().toISOString().split('T')[0] }),
        announcementApi.getAll(),
        trainingApi.getAll(),
      ]);

      setStats({
        totalEmployees: empRes.count || 0,
        pendingLeaves: leaveRes.count || 0,
        todayPresent: attRes.count || 0,
        totalAnnouncements: annRes.count || 0,
        totalTrainings: trainRes.count || 0,
      });

      setPendingLeavesList(leaveRes.leaves?.slice(0, 5) || []);
      setRecentAnnouncements(annRes.announcements?.slice(0, 4) || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading HR analytics & records..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">HR Administration Dashboard</h2>
          <p className="text-muted mb-0">Overview of employees, daily attendance, leaves and company notices.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/hr/employees" className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-person-plus"></i>
            <span>Manage Employees</span>
          </Link>
          <Link to="/hr/announcements" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-megaphone"></i>
            <span>Post Notice</span>
          </Link>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Staff"
            value={stats.totalEmployees}
            icon="bi-people-fill"
            color="primary"
            subtitle="Active organization staff"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon="bi-hourglass-split"
            color="warning"
            subtitle="Awaiting HR / Manager decision"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Today's Attendance"
            value={stats.todayPresent}
            icon="bi-check2-circle"
            color="success"
            subtitle="Checked in today"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Training Programs"
            value={stats.totalTrainings}
            icon="bi-mortarboard-fill"
            color="info"
            subtitle="Skill development courses"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Pending Leave Requests */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-calendar-event text-warning"></i>
                <span>Action Required: Pending Leaves</span>
              </h5>
              <Link to="/hr/leaves" className="text-primary text-decoration-none small fw-semibold">
                View All <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="card-body p-0">
              {pendingLeavesList.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-check2-circle fs-3 text-success mb-2 d-block"></i>
                  No pending leave requests right now. All requests are up to date!
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>Dates</th>
                        <th>Days</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLeavesList.map((leave) => (
                        <tr key={leave._id}>
                          <td>
                            <div className="fw-semibold">
                              {leave.employee?.firstName} {leave.employee?.lastName}
                            </div>
                            <small className="text-muted">{leave.employee?.department}</small>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">{leave.leaveType}</span>
                          </td>
                          <td>
                            <small>
                              {new Date(leave.startDate).toLocaleDateString()} -{' '}
                              {new Date(leave.endDate).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <span className="fw-semibold">{leave.days} d</span>
                          </td>
                          <td>
                            <Link to="/hr/leaves" className="btn btn-sm btn-outline-primary py-0 px-2">
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company Announcements */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-megaphone text-primary"></i>
                <span>Recent Announcements</span>
              </h5>
              <Link to="/hr/announcements" className="text-primary text-decoration-none small fw-semibold">
                Manage <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="card-body p-3">
              {recentAnnouncements.length === 0 ? (
                <div className="text-center text-muted py-4">No announcements published yet.</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {recentAnnouncements.map((item) => (
                    <div key={item._id} className="p-3 rounded-2 border bg-light bg-opacity-50">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-semibold text-dark">{item.title}</span>
                        <StatusBadge status={item.priority} />
                      </div>
                      <p className="text-muted small mb-2 text-truncate-2" style={{ maxHeight: '2.8rem', overflow: 'hidden' }}>
                        {item.message}
                      </p>
                      <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                        <span>
                          <i className="bi bi-people me-1"></i>
                          Audience: <strong className="text-capitalize">{item.targetAudience}</strong>
                        </span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
