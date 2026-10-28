import React, { useState, useEffect } from 'react';
import { leaveApi } from '../../api/leaveApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveApi.getMyLeaves();
      setLeaves(res.leaves || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 0;
    const diff = e.getTime() - s.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculatedDays = calculateDays(formData.startDate, formData.endDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    try {
      setSubmitting(true);
      await leaveApi.apply(formData);
      setSuccess('Leave application submitted successfully for review.');
      setShowApplyModal(false);
      setFormData({
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: '',
      });
      fetchLeaves();
    } catch (err) {
      setError(err.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Leave Applications</h2>
          <p className="text-muted mb-0">Apply for time off and check approval statuses from HR and managers.</p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowApplyModal(true)}
        >
          <i className="bi bi-calendar2-plus-fill"></i>
          <span>Apply for Leave</span>
        </button>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Leave Requests Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Fetching your leave records..." />
          ) : leaves.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar2-heart fs-1 text-secondary mb-2 d-block"></i>
              <h5>No leave requests found</h5>
              <p className="small">You have not submitted any leave requests yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Leave Category</th>
                    <th>Dates</th>
                    <th>Total Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Reviewer Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <span className="badge bg-light text-dark border">{item.leaveType}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">
                          {new Date(item.startDate).toLocaleDateString()} to{' '}
                          {new Date(item.endDate).toLocaleDateString()}
                        </div>
                        <small className="text-muted">
                          Applied: {new Date(item.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <span className="fw-bold">{item.days} days</span>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <span className="small text-muted text-break">{item.reason}</span>
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        {item.reviewedBy ? (
                          <div className="small">
                            <span className="fw-medium text-dark">{item.reviewerName || 'Supervisor'}</span>
                            <div className="text-muted">{item.reviewRemarks || 'No remarks provided'}</div>
                          </div>
                        ) : (
                          <span className="text-muted small">Pending Review</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Submit Leave Application</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApplyModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Leave Type *</label>
                    <select
                      className="form-select"
                      value={formData.leaveType}
                      onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                      required
                    >
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Annual Leave">Annual Leave</option>
                      <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
                      <option value="Unpaid Leave">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {formData.startDate && formData.endDate && (
                    <div className="alert alert-light border py-2 px-3 small d-flex justify-content-between align-items-center mb-3">
                      <span>Calculated Duration:</span>
                      <strong className={calculatedDays > 0 ? 'text-primary' : 'text-danger'}>
                        {calculatedDays > 0 ? `${calculatedDays} day(s)` : 'Invalid Date Range'}
                      </strong>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reason for Leave *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="State the reason for your leave request..."
                      required
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-1"
                    disabled={submitting || calculatedDays <= 0}
                  >
                    {submitting && <span className="spinner-border spinner-border-sm"></span>}
                    <span>Submit Request</span>
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

export default MyLeaves;
