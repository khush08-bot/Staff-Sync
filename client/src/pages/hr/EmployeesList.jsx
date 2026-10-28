import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../api/employeeApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';

const EmployeesList = () => {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedId, setSelectedId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    role: 'employee',
    manager: '',
    status: 'Active',
    address: '',
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeApi.getAll({
        search,
        department,
        role,
        status,
      });
      setEmployees(res.employees || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await employeeApi.getManagersList();
      setManagers(res.managers || []);
    } catch (err) {
      console.warn('Could not load managers list:', err.message);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, department, role, status]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedId(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      department: 'Engineering',
      designation: '',
      role: 'employee',
      manager: '',
      status: 'Active',
      address: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (emp) => {
    setModalMode('edit');
    setSelectedId(emp._id);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      password: '',
      phone: emp.phone || '',
      department: emp.department,
      designation: emp.designation,
      role: emp.role,
      manager: emp.manager?._id || '',
      status: emp.status || 'Active',
      address: emp.address || '',
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'create') {
        await employeeApi.create(formData);
        setSuccess('Employee and user account created successfully.');
      } else {
        await employeeApi.update(selectedId, formData);
        setSuccess('Employee record updated successfully.');
      }
      setShowModal(false);
      fetchEmployees();
      fetchManagers();
    } catch (err) {
      setError(err.message || 'Failed to save employee record.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (emp) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete employee "${emp.firstName} ${emp.lastName}"? This also removes their login credentials.`
      )
    ) {
      return;
    }

    try {
      await employeeApi.delete(emp._id);
      setSuccess(`Employee "${emp.firstName} ${emp.lastName}" deleted.`);
      fetchEmployees();
    } catch (err) {
      setError(err.message || 'Failed to delete employee.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Employee Directory</h2>
          <p className="text-muted mb-0">View, create, edit and manage organization staff records.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenCreate}>
          <i className="bi bi-person-plus-fill"></i>
          <span>Add Employee</span>
        </button>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by name, email or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="All">All Roles</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Admin</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            <div className="col-6 col-md-1 text-end">
              <button
                className="btn btn-outline-secondary w-100"
                title="Reset filters"
                onClick={() => {
                  setSearch('');
                  setDepartment('All');
                  setRole('All');
                  setStatus('All');
                }}
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Filtering employee records..." />
          ) : employees.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-person-x fs-1 text-secondary mb-2 d-block"></i>
              <h5>No employees match your search criteria</h5>
              <p className="small">Try adjusting search parameters or create a new employee.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Emp ID</th>
                    <th>Name / Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Role</th>
                    <th>Reporting Manager</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
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
                      <td>{emp.department}</td>
                      <td>{emp.designation}</td>
                      <td>
                        <span className={`badge ${emp.role === 'hr' ? 'bg-primary' : emp.role === 'manager' ? 'bg-purple' : 'bg-secondary'}`}>
                          {emp.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {emp.manager ? (
                          <span className="small text-dark fw-medium">
                            <i className="bi bi-person-check me-1 text-primary"></i>
                            {emp.manager.name}
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={emp.status} />
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleOpenEdit(emp)}
                            title="Edit Employee"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(emp)}
                            title="Delete Employee"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {modalMode === 'create' ? 'Add New Employee Record' : 'Edit Employee Details'}
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
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        disabled={modalMode === 'edit'}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      {modalMode === 'edit' && (
                        <small className="text-muted">Email cannot be modified directly.</small>
                      )}
                    </div>

                    {modalMode === 'create' && (
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Initial Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Default: StaffSync@2026"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Department *</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Designation *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Senior Backend Engineer"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">System Role *</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR Admin</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Reporting Manager</label>
                      <select
                        className="form-select"
                        value={formData.manager}
                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      >
                        <option value="">No Manager Assigned</option>
                        {managers.map((mgr) => (
                          <option key={mgr._id} value={mgr._id}>
                            {mgr.name} ({mgr.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Employment Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Work / Home Address</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      ></textarea>
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
                    disabled={formSubmitting}
                  >
                    {formSubmitting && <span className="spinner-border spinner-border-sm"></span>}
                    <span>{modalMode === 'create' ? 'Create Employee' : 'Save Changes'}</span>
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

export default EmployeesList;
