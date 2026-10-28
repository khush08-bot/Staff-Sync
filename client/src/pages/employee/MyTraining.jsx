import React, { useState, useEffect } from 'react';
import { trainingApi } from '../../api/trainingApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';

const MyTraining = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyTrainings = async () => {
    try {
      setLoading(true);
      const res = await trainingApi.getAll();
      setTrainings(res.trainings || []);
    } catch (err) {
      setError(err.message || 'Failed to load your assigned training programs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTrainings();
  }, []);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Assigned Training Programs</h2>
          <p className="text-muted mb-0">Professional development initiatives and courses assigned to you.</p>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      <div className="row g-4">
        {loading ? (
          <div className="col-12">
            <LoadingSpinner message="Retrieving course assignments..." />
          </div>
        ) : trainings.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm p-5 text-center text-muted">
              <i className="bi bi-mortarboard fs-1 text-secondary mb-2 d-block"></i>
              <h5>No training programs assigned currently</h5>
              <p className="small">When your manager assigns you to an upcoming workshop or course, it will appear here.</p>
            </div>
          </div>
        ) : (
          trainings.map((t) => (
            <div key={t._id} className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                    <h5 className="fw-bold text-dark mb-0">{t.title}</h5>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-muted small mb-3 flex-grow-1">{t.description}</p>

                  <div className="p-3 bg-light rounded-2 mb-3 small">
                    <div className="row g-2">
                      <div className="col-6">
                        <span className="text-muted">Instructor:</span>
                        <div className="fw-semibold text-dark">{t.instructor}</div>
                      </div>
                      <div className="col-6">
                        <span className="text-muted">Department:</span>
                        <div className="fw-semibold text-dark">{t.department}</div>
                      </div>
                      <div className="col-12">
                        <span className="text-muted">Schedule:</span>
                        <div className="fw-medium text-dark">
                          {new Date(t.startDate).toLocaleDateString()} to{' '}
                          {new Date(t.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-top d-flex align-items-center justify-content-between text-muted small">
                    <span>
                      <i className="bi bi-person-check text-success me-1"></i>
                      Enrolled Participant
                    </span>
                    <span>
                      Supervisor: <strong>{t.createdBy?.name || 'Manager'}</strong>
                    </span>
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

export default MyTraining;
