import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/AlertBanner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === '1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for presentation/evaluation
  const fillDemo = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="auth-brand-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <h4 className="fw-bold text-dark mb-1">StaffSync</h4>
          <p className="text-muted small">Modern Human Resource Management Solution</p>
        </div>

        {isExpired && (
          <AlertBanner
            type="warning"
            message="Your session has expired. Please sign in again."
            onClose={() => {}}
          />
        )}

        {error && (
          <AlertBanner
            type="danger"
            message={error}
            onClose={() => setError('')}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-envelope text-muted"></i>
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-muted">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-3 pt-3 border-top">
          <p className="text-muted small mb-3">
            New employee?{' '}
            <Link to="/register" className="fw-semibold text-primary text-decoration-none">
              Register employee account
            </Link>
          </p>

          {/* Quick Demo Credentials Box */}
          <div className="p-2 bg-light rounded-3 text-start border">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-bold small text-dark">
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Demo Logins:
              </span>
              <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.65rem' }}>
                Password: Password123!
              </span>
            </div>
            <div className="d-flex gap-1">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm flex-fill py-1 px-1"
                style={{ fontSize: '0.75rem' }}
                onClick={() => fillDemo('hr@staffsync.com', 'HR')}
              >
                HR Admin
              </button>
              <button
                type="button"
                className="btn btn-outline-purple btn-sm flex-fill py-1 px-1 text-purple border"
                style={{ fontSize: '0.75rem' }}
                onClick={() => fillDemo('manager@staffsync.com', 'Manager')}
              >
                Manager
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm flex-fill py-1 px-1"
                style={{ fontSize: '0.75rem' }}
                onClick={() => fillDemo('employee@staffsync.com', 'Employee')}
              >
                Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
