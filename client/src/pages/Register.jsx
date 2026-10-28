import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/AlertBanner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper py-5">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="text-center mb-4">
          <div className="auth-brand-icon">
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <h4 className="fw-bold text-dark mb-1">Create Employee Account</h4>
          <p className="text-muted small">Join your team on StaffSync</p>
          <div className="alert alert-info py-2 px-3 small text-start border-0 bg-info-subtle text-info-emphasis mt-2">
            <i className="bi bi-shield-check me-1"></i>
            <strong>Security Notice:</strong> Public onboarding creates standard Employee accounts. HR and Manager roles are safely assigned by HR administrators.
          </div>
        </div>

        {error && (
          <AlertBanner
            type="danger"
            message={error}
            onClose={() => setError('')}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Jordan Miller"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold text-muted">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold text-muted">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold text-muted">Department *</label>
              <select
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold text-muted">Designation *</label>
              <input
                type="text"
                name="designation"
                className="form-control"
                placeholder="e.g. Software Engineer"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row g-2 mb-4">
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold text-muted">Password *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="At least 6 chars"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold text-muted">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <i className="bi bi-check2"></i>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-3 pt-3 border-top">
          <p className="text-muted small mb-0">
            Already have an account?{' '}
            <Link to="/login" className="fw-semibold text-primary text-decoration-none">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
