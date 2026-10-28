import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import StatusBadge from '../../components/StatusBadge';
import AlertBanner from '../../components/AlertBanner';

const MyProfile = () => {
  const { user, employee, refreshUser } = useAuth();

  const [phone, setPhone] = useState(employee?.phone || '');
  const [address, setAddress] = useState(employee?.address || '');
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      await authApi.updateProfile({ phone, address });
      await refreshUser();
      setSuccess('Profile contact details updated successfully.');
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Employee Profile</h2>
          <p className="text-muted mb-0">View your organizational placement and manage contact information.</p>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm text-center p-4">
            <div className="mb-3">
              <div
                className="rounded-circle bg-primary text-white fw-bold d-inline-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '90px', height: '90px', fontSize: '2.2rem' }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <h4 className="fw-bold text-dark mb-1">{user?.name}</h4>
            <p className="text-muted mb-2">{employee?.designation}</p>
            <div className="d-flex justify-content-center gap-1 mb-3">
              <span className="badge bg-light text-dark border font-monospace">
                {employee?.employeeId}
              </span>
              <StatusBadge status={employee?.status || 'Active'} />
            </div>

            <div className="border-top pt-3 text-start small">
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Department:</span>
                <span className="fw-semibold text-dark">{employee?.department}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Account Role:</span>
                <span className="fw-semibold text-capitalize text-dark">{user?.role}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Reporting Manager:</span>
                <span className="fw-semibold text-dark">
                  {employee?.manager?.name || 'No Direct Manager'}
                </span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Joining Date:</span>
                <span className="fw-semibold text-dark">
                  {employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information & Contact Form */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold text-dark mb-0">Employment & Contact Information</h5>
              {!editing && (
                <button
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                  onClick={() => setEditing(true)}
                >
                  <i className="bi bi-pencil"></i>
                  <span>Edit Contact Info</span>
                </button>
              )}
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleUpdate}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted">Full Legal Name</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      disabled
                      value={user?.name || ''}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted">Company Email Address</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      disabled
                      value={user?.email || ''}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted">Phone Number</label>
                    <input
                      type="tel"
                      className={`form-control ${!editing ? 'bg-light' : ''}`}
                      disabled={!editing}
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted">Designation</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      disabled
                      value={employee?.designation || ''}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-muted">Residential / Mailing Address</label>
                    <textarea
                      className={`form-control ${!editing ? 'bg-light' : ''}`}
                      disabled={!editing}
                      rows="3"
                      placeholder="Street, City, Postal Code"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    ></textarea>
                  </div>

                  {editing && (
                    <div className="col-12 d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={() => {
                          setEditing(false);
                          setPhone(employee?.phone || '');
                          setAddress(employee?.address || '');
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary d-flex align-items-center gap-1"
                        disabled={submitting}
                      >
                        {submitting && <span className="spinner-border spinner-border-sm"></span>}
                        <span>Save Contact Details</span>
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
