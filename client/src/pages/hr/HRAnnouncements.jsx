import React, { useState, useEffect } from 'react';
import { announcementApi } from '../../api/announcementApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';

const HRAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'Medium',
    targetAudience: 'All',
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementApi.getAll();
      setAnnouncements(res.announcements || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await announcementApi.create(formData);
      setSuccess('Announcement published successfully.');
      setShowModal(false);
      setFormData({
        title: '',
        message: '',
        priority: 'Medium',
        targetAudience: 'All',
      });
      fetchAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete announcement "${item.title}"?`)) {
      return;
    }

    try {
      await announcementApi.delete(item._id);
      setSuccess('Announcement removed.');
      fetchAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to remove announcement.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">Company Announcements</h2>
          <p className="text-muted mb-0">Publish organizational updates, notices and emergency alerts.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-megaphone-fill"></i>
          <span>New Announcement</span>
        </button>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Announcements List */}
      <div className="row g-3">
        {loading ? (
          <div className="col-12">
            <LoadingSpinner message="Loading notices..." />
          </div>
        ) : announcements.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm p-5 text-center text-muted">
              <i className="bi bi-bell-slash fs-1 mb-2 d-block text-secondary"></i>
              <h5>No announcements published yet</h5>
              <p className="small">Click "New Announcement" above to publish your first organizational update.</p>
            </div>
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item._id} className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                    <h5 className="fw-bold text-dark mb-0">{item.title}</h5>
                    <StatusBadge status={item.priority} />
                  </div>
                  <p className="text-muted mb-3 flex-grow-1" style={{ whiteSpace: 'pre-line' }}>
                    {item.message}
                  </p>
                  <div className="pt-3 border-top d-flex align-items-center justify-content-between small text-muted">
                    <div>
                      <span className="me-3">
                        <i className="bi bi-person me-1"></i>
                        {item.authorName}
                      </span>
                      <span>
                        <i className="bi bi-people me-1"></i>
                        Audience: <strong className="text-capitalize">{item.targetAudience}</strong>
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <button
                        className="btn btn-outline-danger btn-sm py-0 px-2"
                        title="Delete announcement"
                        onClick={() => handleDelete(item)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Publish New Announcement</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Health Insurance Policy Update"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Priority Level</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Target Audience</label>
                      <select
                        className="form-select"
                        value={formData.targetAudience}
                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      >
                        <option value="All">All Staff (Everyone)</option>
                        <option value="employee">Employees Only</option>
                        <option value="manager">Managers Only</option>
                        <option value="hr">HR Personnel Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Message Content *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Write your announcement message here..."
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
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
                    <span>Publish Announcement</span>
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

export default HRAnnouncements;
