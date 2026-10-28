import React, { useState, useEffect } from 'react';
import { trainingApi } from '../../api/trainingApi';
import { employeeApi } from '../../api/employeeApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';

const ManagerTraining = () => {
  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    department: 'Engineering',
    startDate: '',
    endDate: '',
    status: 'Upcoming',
    assignedEmployees: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trainRes, empRes] = await Promise.all([
        trainingApi.getAll(),
        employeeApi.getAll({}),
      ]);

      setTrainings(trainRes.trainings || []);
      setEmployees(empRes.employees || []);
    } catch (err) {
      setError(err.message || 'Failed to load training programs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedId(null);
    setFormData({
      title: '',
      description: '',
      instructor: '',
      department: 'Engineering',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Upcoming',
      assignedEmployees: [],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t) => {
    setModalMode('edit');
    setSelectedId(t._id);
    setFormData({
      title: t.title,
      description: t.description,
      instructor: t.instructor,
      department: t.department || 'General',
      startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : '',
      endDate: t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : '',
      status: t.status || 'Upcoming',
      assignedEmployees: t.assignedEmployees?.map((e) => (typeof e === 'object' ? e._id : e)) || [],
    });
    setShowModal(true);
  };

  const handleToggleEmployee = (empId) => {
    setFormData((prev) => {
      const exists = prev.assignedEmployees.includes(empId);
      if (exists) {
        return { ...prev, assignedEmployees: prev.assignedEmployees.filter((id) => id !== empId) };
      } else {
        return { ...prev, assignedEmployees: [...prev.assignedEmployees, empId] };
      }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'create') {
        await trainingApi.create(formData);
        setSuccess('Training program created and assigned successfully.');
      } else {
        await trainingApi.update(selectedId, formData);
        setSuccess('Training program updated successfully.');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save training program.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Are you sure you want to delete training program "${t.title}"?`)) {
      return;
    }

    try {
      await trainingApi.delete(t._id);
      setSuccess('Training program removed.');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to remove program.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">Training & Development Programs</h2>
          <p className="text-muted mb-0">Create, schedule and assign skill development workshops to employees.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenCreate}>
          <i className="bi bi-mortarboard-fill"></i>
          <span>Create Program</span>
        </button>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="row g-4">
        {loading ? (
          <div className="col-12">
            <LoadingSpinner message="Loading courses and programs..." />
          </div>
        ) : trainings.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm p-5 text-center text-muted">
              <i className="bi bi-mortarboard fs-1 text-secondary mb-2 d-block"></i>
              <h5>No training programs yet</h5>
              <p className="small">Click "Create Program" to schedule your team's first training workshop.</p>
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

                  <div className="border-top pt-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small text-muted">
                        <i className="bi bi-people-fill me-1 text-primary"></i>
                        Enrolled: <strong>{t.assignedEmployees?.length || 0} employees</strong>
                      </span>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleOpenEdit(t)}
                          title="Edit program"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(t)}
                          title="Delete program"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>

                    {t.assignedEmployees && t.assignedEmployees.length > 0 && (
                      <div className="d-flex flex-wrap gap-1">
                        {t.assignedEmployees.map((emp) => (
                          <span key={emp._id || emp} className="badge bg-white text-dark border small">
                            {emp.firstName ? `${emp.firstName} ${emp.lastName}` : 'Enrolled'}
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {modalMode === 'create' ? 'Create New Training Program' : 'Edit Training Program'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Program Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Full-Stack Security and Architecture Workshop"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Instructor / Trainer *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Dr. Jordan Reed"
                        value={formData.instructor}
                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Department</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="General">General / All</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Program Description *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        placeholder="Outline objectives, modules, and schedule expectations..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold mb-2">
                        Assign Employees ({formData.assignedEmployees.length} selected)
                      </label>
                      <div
                        className="border rounded p-2 bg-light"
                        style={{ maxHeight: '180px', overflowY: 'auto' }}
                      >
                        {employees.map((emp) => {
                          const isAssigned = formData.assignedEmployees.includes(emp._id);
                          return (
                            <div key={emp._id} className="form-check py-1">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`emp-${emp._id}`}
                                checked={isAssigned}
                                onChange={() => handleToggleEmployee(emp._id)}
                              />
                              <label
                                className="form-check-label small d-flex justify-content-between"
                                htmlFor={`emp-${emp._id}`}
                              >
                                <span>
                                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                                </span>
                                <span className="text-muted">{emp.department}</span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-1"
                    disabled={submitting}
                  >
                    {submitting && <span className="spinner-border spinner-border-sm"></span>}
                    <span>{modalMode === 'create' ? 'Publish Program' : 'Save Updates'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTraining;
