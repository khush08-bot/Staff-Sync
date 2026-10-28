import React, { useState, useEffect } from 'react';
import { trainingApi } from '../../api/trainingApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';

const HRTraining = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await trainingApi.getAll();
      setTrainings(res.trainings || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch training programs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">Training & Development (HR Overview)</h2>
          <p className="text-muted mb-0">Overview of organizational learning programs and employee enrollments.</p>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      <div className="row g-4">
        {loading ? (
          <div className="col-12">
            <LoadingSpinner message="Loading training courses..." />
          </div>
        ) : trainings.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm p-5 text-center text-muted">
              <i className="bi bi-mortarboard fs-1 mb-2 d-block text-secondary"></i>
              <h5>No training programs created yet</h5>
              <p className="small">Managers create and assign specialized training programs to their teams.</p>
            </div>
          </div>
        ) : (
          trainings.map((prog) => (
            <div key={prog._id} className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                    <h5 className="fw-bold text-dark mb-0">{prog.title}</h5>
                    <StatusBadge status={prog.status} />
                  </div>
                  <p className="text-muted small mb-3 flex-grow-1">{prog.description}</p>

                  <div className="p-3 bg-light rounded-2 mb-3 small">
                    <div className="row g-2">
                      <div className="col-6">
                        <span className="text-muted">Instructor:</span>
                        <div className="fw-semibold text-dark">{prog.instructor}</div>
                      </div>
                      <div className="col-6">
                        <span className="text-muted">Department:</span>
                        <div className="fw-semibold text-dark">{prog.department}</div>
                      </div>
                      <div className="col-12">
                        <span className="text-muted">Timeline:</span>
                        <div className="fw-medium text-dark">
                          {new Date(prog.startDate).toLocaleDateString()} to{' '}
                          {new Date(prog.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-top pt-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="small text-muted">
                        <i className="bi bi-people-fill me-1 text-primary"></i>
                        Assigned: <strong>{prog.assignedEmployees?.length || 0} employees</strong>
                      </span>
                      <span className="small text-muted">
                        Created by {prog.createdBy?.name || 'Manager'}
                      </span>
                    </div>

                    {prog.assignedEmployees && prog.assignedEmployees.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mt-2">
                        {prog.assignedEmployees.map((emp) => (
                          <span key={emp._id} className="badge bg-white text-dark border small">
                            {emp.firstName} {emp.lastName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HRTraining;
