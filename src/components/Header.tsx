import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="app-header" role="banner">
      <div className="header-top">
        <div className="wordmark-group">
          <h1 className="wordmark">
            Fee<span className="wordmark-pause">Pause</span>
          </h1>
          <span className="badge-tag">SafeSpace Hacks</span>
        </div>
        <div className="header-meta">
          <span className="meta-privacy" title="Raw text remains in memory only. No analytics, tracking, or network calls.">
            Client-Side Privacy • Zero Storage • Zero Tracking
          </span>
        </div>
      </div>
      <p className="app-description">
        Verify unexpected college fee demands, overdue fines, and urgent billing notices through your institution’s
        authenticated portal or accounts office before transferring funds.
      </p>
    </header>
  );
};
