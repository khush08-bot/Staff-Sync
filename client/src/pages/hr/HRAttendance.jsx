import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../api/attendanceApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';

const HRAttendance = () => {
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceApi.getAll({
        date,
        department,
        status,
      });
      setRecords(res.records || []);
    } catch (err) {
      setError(err.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date, department, status]);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">Attendance Tracking</h2>
          <p className="text-muted mb-0">Daily employee check-in, check-out logs and work duration.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setDate(new Date().toISOString().split('T')[0])}
          >
            Today ({new Date().toISOString().split('T')[0]})
          </button>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-sm-4">
              <label className="form-label small fw-semibold text-muted mb-1">Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="col-6 col-sm-4">
              <label className="form-label small fw-semibold text-muted mb-1">Department</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div className="col-6 col-sm-4">
              <label className="form-label small fw-semibold text-muted mb-1">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Half Day">Half Day</option>
                <option value="Late">Late</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Retrieving daily attendance log..." />
          ) : records.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar-x fs-1 text-secondary mb-2 d-block"></i>
              <h5>No attendance logged for {date}</h5>
              <p className="small">Employees have not submitted check-in logs for this date yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Emp ID</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Duration</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => (
                    <tr key={rec._id}>
                      <td>
                        <span className="badge bg-light text-dark font-monospace border">
                          {rec.employee?.employeeId || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold">
                          {rec.employee ? `${rec.employee.firstName} ${rec.employee.lastName}` : 'Unknown'}
                        </div>
                        <small className="text-muted">{rec.employee?.designation}</small>
                      </td>
                      <td>{rec.employee?.department || '—'}</td>
                      <td>
                        <span className="fw-medium text-dark">
                          <i className="bi bi-box-arrow-in-right text-success me-1"></i>
                          {new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td>
                        {rec.checkOut ? (
                          <span className="fw-medium text-dark">
                            <i className="bi bi-box-arrow-right text-danger me-1"></i>
                            {new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="badge bg-light text-muted border">Active Now</span>
                        )}
                      </td>
                      <td>
                        <span className="fw-semibold">{rec.workHours > 0 ? `${rec.workHours} hrs` : 'In Progress'}</span>
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

export default HRAttendance;
