import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { employeeApi } from '../../api/employeeApi';
import { leaveApi } from '../../api/leaveApi';
import { trainingApi } from '../../api/trainingApi';
import { announcementApi } from '../../api/announcementApi';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    teamSize: 0,
    pendingLeaves: 0,
    activeTrainings: 0,
    announcements: 0,
  });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      const [teamRes, leaveRes, trainRes, annRes] = await Promise.all([
        employeeApi.getMyTeam(),
        leaveApi.getForReview({ status: 'Pending' }),
        trainingApi.getAll(),
        announcementApi.getAll(),
      ]);

      setStats({
        teamSize: teamRes.count || 0,
        pendingLeaves: leaveRes.count || 0,
        activeTrainings: trainRes.count || 0,
        announcements: annRes.count || 0,
      });

      setPendingLeaves(leaveRes.leaves?.slice(0, 5) || []);
      setTrainings(trainRes.trainings?.slice(0, 3) || []);
    } catch (err) {
      setError(err.message || 'Failed to load manager dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading Manager Workspace..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">Team Management Dashboard</h2>
          <p className="text-muted mb-0">Oversee team leave approvals, training initiatives and employee progress.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/manager/leaves" className="btn btn-purple text-white btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-calendar2-check"></i>
            <span>Team Leaves</span>
          </Link>
          <Link to="/manager/training" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-plus-circle"></i>
            <span>Create Training</span>
          </Link>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="My Team"
            value={stats.teamSize}
            icon="bi-people-fill"
            color="primary"
            subtitle="Direct reporting employees"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Team Leave Requests"
            value={stats.pendingLeaves}
            icon="bi-hourglass-split"
            color="warning"
            subtitle="Pending your authorization"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Active Programs"
            value={stats.activeTrainings}
            icon="bi-mortarboard-fill"
            color="info"
            subtitle="Team learning & growth"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Announcements"
            value={stats.announcements}
            icon="bi-megaphone-fill"
            color="secondary"
            subtitle="Visible company updates"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Pending Team Leaves */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-calendar-check text-warning"></i>
                <span>Team Leaves Needing Review</span>
              </h5>
              <Link to="/manager/leaves" className="text-primary text-decoration-none small fw-semibold">
                Manage Leaves <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="card-body p-0">
              {pendingLeaves.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-check-circle fs-3 text-success mb-2 d-block"></i>
                  All team leave requests are currently reviewed and processed.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Team Member</th>
                        <th>Type</th>
                        <th>Duration</th>
                        <th>Days</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLeaves.map((leave) => (
                        <tr key={leave._id}>
                          <td>
                            <div className="fw-semibold">
                              {leave.employee?.firstName} {leave.employee?.lastName}
                            </div>
                            <small className="text-muted">{leave.employee?.designation}</small>
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
                            <Link to="/manager/leaves" className="btn btn-sm btn-outline-primary py-0 px-2">
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

        {/* Training Programs */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-mortarboard text-primary"></i>
                <span>Team Learning Programs</span>
              </h5>
              <Link to="/manager/training" className="text-primary text-decoration-none small fw-semibold">
                Manage All <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="card-body p-3">
              {trainings.length === 0 ? (
                <div className="text-center text-muted py-4">No training programs scheduled yet.</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {trainings.map((t) => (
                    <div key={t._id} className="p-3 rounded-2 border bg-light bg-opacity-50">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-semibold text-dark">{t.title}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="text-muted small mb-2 text-truncate-2" style={{ maxHeight: '2.8rem', overflow: 'hidden' }}>
                        {t.description}
                      </p>
                      <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                        <span>
                          <i className="bi bi-person-badge me-1"></i>
                          {t.instructor}
                        </span>
                        <span>
                          <i className="bi bi-people me-1"></i>
                          {t.assignedEmployees?.length || 0} enrolled
                        </span>
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

export default ManagerDashboard;
