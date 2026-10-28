import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-3 text-muted fw-medium">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
