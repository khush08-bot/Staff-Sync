import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../api/employeeApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';

const TeamMembers = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await employeeApi.getMyTeam();
      setTeam(res.team || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">Direct Reporting Team</h2>
          <p className="text-muted mb-0">Employees currently reporting directly to your managerial supervision.</p>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading team directory..." />
          ) : team.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people fs-1 text-secondary mb-2 d-block"></i>
              <h5>No team members assigned yet</h5>
              <p className="small">HR can assign employees to your managerial oversight from the Employee Directory.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Contact</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <span className="badge bg-light text-dark font-monospace border">
                          {emp.employeeId}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <small className="text-muted">{emp.email}</small>
                      </td>
                      <td>{emp.designation}</td>
                      <td>{emp.department}</td>
                      <td>
                        <span className="small">{emp.phone || '—'}</span>
                      </td>
                      <td>
                        <StatusBadge status={emp.status} />
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

export default TeamMembers;
