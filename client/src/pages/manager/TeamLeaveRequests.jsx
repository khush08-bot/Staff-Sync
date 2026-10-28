import React, { useState, useEffect } from 'react';
import { leaveApi } from '../../api/leaveApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';

const TeamLeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Decision Modal State
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [decisionType, setDecisionType] = useState('Approved');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTeamLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveApi.getForReview({ status });
      setLeaves(res.leaves || []);
    } catch (err) {
      setError(err.message || 'Failed to load team leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamLeaves();
  }, [status]);

  const handleOpenDecision = (leave, type) => {
    setSelectedLeave(leave);
    setDecisionType(type);
    setReviewRemarks('');
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    try {
      setSubmitting(true);
      setError('');
      await leaveApi.updateStatus(selectedLeave._id, {
        status: decisionType,
        reviewRemarks,
      });

      setSuccess(`Leave request for ${selectedLeave.employee?.firstName} has been ${decisionType.toLowerCase()}.`);
      setSelectedLeave(null);
      fetchTeamLeaves();
    } catch (err) {
      setError(err.message || 'Failed to process team leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">Team Leave Approvals</h2>
          <p className="text-muted mb-0">Review and authorize leave applications submitted by your direct reporting team members.</p>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filter toolbar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold text-muted mb-1">Filter by Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="All">All Requests</option>
                <option value="Pending">Pending Decision</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Retrieving team requests..." />
          ) : leaves.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar2-check fs-1 text-secondary mb-2 d-block"></i>
              <h5>No team leave requests found</h5>
              <p className="small">Your direct reports have not submitted any leave requests matching this filter.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Team Member</th>
                    <th>Leave Category</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Review Info</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="fw-semibold">
                          {item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'Team Member'}
                        </div>
                        <small className="text-muted">{item.employee?.designation}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{item.leaveType}</span>
                      </td>
                      <td>
                        <div className="small fw-medium">
                          {new Date(item.startDate).toLocaleDateString()} to{' '}
                          {new Date(item.endDate).toLocaleDateString()}
                        </div>
                        <small className="text-muted">
                          Applied: {new Date(item.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <span className="fw-bold">{item.days} d</span>
                      </td>
                      <td style={{ maxWidth: '220px' }}>
                        <span className="small text-muted text-break">{item.reason}</span>
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        {item.reviewedBy ? (
                          <div className="small">
                            <span className="fw-medium text-dark">{item.reviewerName}</span>
                            <div className="text-muted">{item.reviewRemarks || 'No remarks'}</div>
                          </div>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="text-end">
                        {item.status === 'Pending' ? (
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-success"
                              onClick={() => handleOpenDecision(item, 'Approved')}
                              title="Approve Leave"
                            >
                              <i className="bi bi-check-lg"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleOpenDecision(item, 'Rejected')}
                              title="Reject Leave"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        ) : (
                          <span className="badge bg-light text-muted border">Completed</span>
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

      {/* Decision Modal */}
      {selectedLeave && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {decisionType === 'Approved' ? (
                    <span className="text-success d-flex align-items-center gap-2">
                      <i className="bi bi-check-circle-fill"></i> Approve Team Leave
                    </span>
                  ) : (
                    <span className="text-danger d-flex align-items-center gap-2">
                      <i className="bi bi-x-circle-fill"></i> Reject Team Leave
                    </span>
                  )}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedLeave(null)}
                ></button>
              </div>
              <form onSubmit={handleDecisionSubmit}>
                <div className="modal-body">
                  <div className="p-3 bg-light rounded-2 mb-3">
                    <div className="fw-semibold text-dark">
                      {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}
                    </div>
                    <div className="small text-muted mb-1">
                      {selectedLeave.leaveType} ({selectedLeave.days} days)
                    </div>
                    <div className="small text-dark fst-italic">"{selectedLeave.reason}"</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Manager Feedback / Remarks</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Enter optional approval remarks or reason for rejection..."
                      value={reviewRemarks}
                      onChange={(e) => setReviewRemarks(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setSelectedLeave(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${decisionType === 'Approved' ? 'btn-success' : 'btn-danger'} d-flex align-items-center gap-1`}
                    disabled={submitting}
                  >
                    {submitting && <span className="spinner-border spinner-border-sm"></span>}
                    <span>Confirm {decisionType}</span>
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

export default TeamLeaveRequests;
