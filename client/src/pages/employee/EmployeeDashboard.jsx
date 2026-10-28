import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { attendanceApi } from '../../api/attendanceApi';
import { leaveApi } from '../../api/leaveApi';
import { trainingApi } from '../../api/trainingApi';
import { announcementApi } from '../../api/announcementApi';
import { useAuth } from '../../context/AuthContext';

const EmployeeDashboard = () => {
  const { user, employee } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [myTrainings, setMyTrainings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attLoading, setAttLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [todayRes, leavesRes, trainRes, annRes] = await Promise.all([
        attendanceApi.getToday(),
        leaveApi.getMyLeaves(),
        trainingApi.getAll(),
        announcementApi.getAll(),
      ]);

      setTodayAttendance(todayRes.attendance || null);
      setMyLeaves(leavesRes.leaves || []);
      setMyTrainings(trainRes.trainings || []);
      setAnnouncements(annRes.announcements || []);
    } catch (err) {
      setError(err.message || 'Failed to load employee dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    try {
      setAttLoading(true);
      setError('');
      setSuccess('');
      const res = await attendanceApi.checkIn();
      setTodayAttendance(res.attendance);
      setSuccess(res.message || 'Checked in successfully!');
    } catch (err) {
      setError(err.message || 'Check-in failed.');
    } finally {
      setAttLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setAttLoading(true);
      setError('');
      setSuccess('');
      const res = await attendanceApi.checkOut();
      setTodayAttendance(res.attendance);
      setSuccess(res.message || 'Checked out successfully!');
    } catch (err) {
      setError(err.message || 'Check-out failed.');
    } finally {
      setAttLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing your workspace..." />;
  }

  const pendingLeavesCount = myLeaves.filter((l) => l.status === 'Pending').length;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card border-0 shadow-sm mb-4 bg-primary text-white p-4 rounded-3">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <span className="badge bg-white text-primary mb-2 fw-semibold">
              Employee Portal • {employee?.employeeId || 'Staff'}
            </span>
            <h2 className="fw-bold mb-1">Welcome back, {user?.name}!</h2>
            <p className="mb-0 text-white-50">
              {employee?.designation} • {employee?.department} Department
            </p>
          </div>

          {/* Quick Check-in / Check-out interactive module */}
          <div className="bg-white text-dark p-3 rounded-3 shadow-sm d-flex flex-column align-items-center text-center">
            <small className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.72rem' }}>
              Today's Attendance
            </small>

            {!todayAttendance ? (
              <div>
                <button
                  className="btn btn-success fw-bold px-4 py-2 d-flex align-items-center gap-2"
                  onClick={handleCheckIn}
                  disabled={attLoading}
                >
                  {attLoading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <i className="bi bi-box-arrow-in-right fs-5"></i>
                  )}
                  <span>Check In Now</span>
                </button>
                <small className="text-muted d-block mt-1">Not checked in today</small>
              </div>
            ) : !todayAttendance.checkOut ? (
              <div>
                <div className="mb-2">
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                    Checked in at {new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button
                  className="btn btn-danger fw-bold px-4 py-2 d-flex align-items-center gap-2"
                  onClick={handleCheckOut}
                  disabled={attLoading}
                >
                  {attLoading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <i className="bi bi-box-arrow-right fs-5"></i>
                  )}
                  <span>Check Out</span>
                </button>
              </div>
            ) : (
              <div className="py-1">
                <span className="badge bg-secondary px-3 py-2 fs-6">
                  <i className="bi bi-check2-all me-1"></i> Checked Out ({todayAttendance.workHours} hrs)
                </span>
                <small className="text-muted d-block mt-1">Attendance complete for today</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="My Attendance"
            value={todayAttendance ? todayAttendance.status : 'Pending'}
            icon="bi-clock-history"
            color={todayAttendance ? 'success' : 'warning'}
            subtitle={todayAttendance ? `In: ${new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not checked in yet'}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="My Leaves"
            value={myLeaves.length}
            icon="bi-calendar2-range"
            color="primary"
            subtitle={`${pendingLeavesCount} pending approval`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Enrolled Training"
            value={myTrainings.length}
            icon="bi-mortarboard-fill"
            color="info"
            subtitle="Skills & workshops"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Announcements"
            value={announcements.length}
            icon="bi-megaphone-fill"
            color="secondary"
            subtitle="Company updates"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Leaves */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-calendar2-check text-primary"></i>
                <span>My Recent Leave Requests</span>
              </h5>
              <Link to="/employee/leaves" className="btn btn-outline-primary btn-sm">
                Apply Leave
              </Link>
            </div>
            <div className="card-body p-0">
              {myLeaves.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  You haven't submitted any leave requests yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Leave Type</th>
                        <th>Dates</th>
                        <th>Days</th>
                        <th>Status</th>
                        <th>Reviewer Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myLeaves.slice(0, 4).map((l) => (
                        <tr key={l._id}>
                          <td>
                            <span className="badge bg-light text-dark border">{l.leaveType}</span>
                          </td>
                          <td>
                            <small className="fw-medium">
                              {new Date(l.startDate).toLocaleDateString()} -{' '}
                              {new Date(l.endDate).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <span className="fw-semibold">{l.days} d</span>
                          </td>
                          <td>
                            <StatusBadge status={l.status} />
                          </td>
                          <td>
                            <small className="text-muted">{l.reviewRemarks || '—'}</small>
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
                <i className="bi bi-bell text-warning"></i>
                <span>Notices & Announcements</span>
              </h5>
              <Link to="/employee/announcements" className="text-primary text-decoration-none small fw-semibold">
                View All <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="card-body p-3">
              {announcements.length === 0 ? (
                <div className="text-center text-muted py-4">No active announcements.</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {announcements.slice(0, 3).map((a) => (
                    <div key={a._id} className="p-3 rounded-2 border bg-light bg-opacity-50">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-semibold text-dark">{a.title}</span>
                        <StatusBadge status={a.priority} />
                      </div>
                      <p className="text-muted small mb-1 text-truncate-2" style={{ maxHeight: '2.5rem', overflow: 'hidden' }}>
                        {a.message}
                      </p>
                      <small className="text-muted d-block text-end" style={{ fontSize: '0.72rem' }}>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </small>
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

export default EmployeeDashboard;
