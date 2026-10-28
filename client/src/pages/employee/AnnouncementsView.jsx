import React, { useState, useEffect } from 'react';
import { announcementApi } from '../../api/announcementApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';

const AnnouncementsView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementApi.getAll();
      setAnnouncements(res.announcements || []);
    } catch (err) {
      setError(err.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">Company Announcements</h2>
          <p className="text-muted mb-0">Official organizational communications, policies, and event notices.</p>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      <div className="row g-4">
        {loading ? (
          <div className="col-12">
            <LoadingSpinner message="Loading company notices..." />
          </div>
        ) : announcements.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm p-5 text-center text-muted">
              <i className="bi bi-bell-slash fs-1 text-secondary mb-2 d-block"></i>
              <h5>No announcements right now</h5>
              <p className="small">New company notices and messages will appear here.</p>
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
                  <p className="text-muted mb-4 flex-grow-1" style={{ whiteSpace: 'pre-line' }}>
                    {item.message}
                  </p>
                  <div className="pt-3 border-top d-flex align-items-center justify-content-between small text-muted">
                    <span>
                      <i className="bi bi-person-fill me-1"></i>
                      Posted by {item.authorName}
                    </span>
                    <span>
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(item.createdAt).toLocaleDateString()}
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

export default AnnouncementsView;
