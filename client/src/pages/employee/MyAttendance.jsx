import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../api/attendanceApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';

const MyAttendance = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [todayRes, historyRes] = await Promise.all([
        attendanceApi.getToday(),
        attendanceApi.getMyHistory(),
      ]);

      setTodayAttendance(todayRes.attendance || null);
      setHistory(historyRes.history || []);
    } catch (err) {
      setError(err.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const res = await attendanceApi.checkIn({ notes });
      setTodayAttendance(res.attendance);
      setSuccess(res.message || 'Checked in successfully!');
      setNotes('');
      fetchAttendanceData();
    } catch (err) {
      setError(err.message || 'Failed to check in.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const res = await attendanceApi.checkOut({ notes });
      setTodayAttendance(res.attendance);
      setSuccess(res.message || 'Checked out successfully!');
      setNotes('');
      fetchAttendanceData();
    } catch (err) {
      setError(err.message || 'Failed to check out.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Daily Attendance</h2>
          <p className="text-muted mb-0">Record your daily work shift timestamps and track attendance history.</p>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Today's Punch Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md-6">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle mb-2">
                Shift Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <h4 className="fw-bold text-dark mb-2">Shift Clock & Timestamp</h4>
              {todayAttendance ? (
                <div className="d-flex flex-column gap-1">
                  <div className="small">
                    <span className="text-muted">Check In:</span>{' '}
                    <strong className="text-success">
                      {new Date(todayAttendance.checkIn).toLocaleTimeString()}
                    </strong>
                  </div>
                  <div className="small">
                    <span className="text-muted">Check Out:</span>{' '}
                    <strong className="text-danger">
                      {todayAttendance.checkOut
                        ? new Date(todayAttendance.checkOut).toLocaleTimeString()
                        : 'Shift in progress'}
                    </strong>
                  </div>
                  <div className="small mt-1">
                    <span className="text-muted">Status:</span>{' '}
                    <StatusBadge status={todayAttendance.status} />
                  </div>
                </div>
              ) : (
                <p className="text-muted small mb-0">
                  You have not logged check-in for today's work shift yet.
                </p>
              )}
            </div>

            <div className="col-12 col-md-6">
              <div className="p-3 bg-light rounded-3 border">
                <label className="form-label small fw-semibold text-muted mb-1">Daily Work Note (Optional)</label>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="e.g. Working from office - Room 302"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={todayAttendance?.checkOut}
                />

                <div className="d-flex gap-2">
                  {!todayAttendance ? (
                    <button
                      className="btn btn-success flex-fill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                      onClick={handleCheckIn}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <i className="bi bi-box-arrow-in-right fs-5"></i>
                      )}
                      <span>Punch In (Check-In)</span>
                    </button>
                  ) : !todayAttendance.checkOut ? (
                    <button
                      className="btn btn-danger flex-fill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                      onClick={handleCheckOut}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <i className="bi bi-box-arrow-right fs-5"></i>
                      )}
                      <span>Punch Out (Check-Out)</span>
                    </button>
                  ) : (
                    <button className="btn btn-secondary flex-fill py-2 fw-semibold" disabled>
                      <i className="bi bi-check2-all me-1"></i> Shift Complete ({todayAttendance.workHours} hrs)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold text-dark mb-0">Personal Attendance History</h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading attendance history..." />
          ) : history.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar2-x fs-1 text-secondary mb-2 d-block"></i>
              <h5>No past attendance logs</h5>
              <p className="small">Your daily check-in records will appear here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Duration</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((rec) => (
                    <tr key={rec._id}>
                      <td className="fw-semibold text-dark">{rec.date}</td>
                      <td>
                        <span className="text-success small fw-medium">
                          <i className="bi bi-box-arrow-in-right me-1"></i>
                          {new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td>
                        {rec.checkOut ? (
                          <span className="text-danger small fw-medium">
                            <i className="bi bi-box-arrow-right me-1"></i>
                            {new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-muted small">In Progress</span>
                        )}
                      </td>
                      <td>
                        <span className="fw-bold">{rec.workHours > 0 ? `${rec.workHours} hrs` : '—'}</span>
                      </td>
                      <td>
                        <StatusBadge status={rec.status} />
                      </td>
                      <td>
                        <small className="text-muted">{rec.notes || '—'}</small>
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
  );
};

export default MyAttendance;
