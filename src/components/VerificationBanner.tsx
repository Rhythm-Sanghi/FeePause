import React from 'react';
import { CollegeRecord } from '../types';

interface VerificationBannerProps {
  college: CollegeRecord;
  onOpenSyntheticPortal: () => void;
  extractedDestinations: string[];
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({
  college,
  onOpenSyntheticPortal,
  extractedDestinations
}) => {
  const isUnsupported = !college.isSupported;

  return (
    <section
      className={`verification-banner ${isUnsupported ? 'unsupported-banner' : ''}`}
      aria-labelledby="verification-heading"
    >
      <div className="verification-banner-header">
        <div className="verification-title-group">
          <span className="verification-step-pill">Primary Safety Action</span>
          <h2 id="verification-heading" className="verification-title">
            Verify Directly with {college.shortName}
          </h2>
          <span className="verification-route-name">{college.routeTitle}</span>
        </div>
        {college.isSynthetic && (
          <button
            type="button"
            className="btn-open-portal"
            onClick={onOpenSyntheticPortal}
            id="btn-open-mock-portal"
          >
            <span>Open Synthetic Portal</span>
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>

      <p className="verification-desc">{college.routeDescription}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
          Recommended Independent Steps:
        </span>
        <ol style={{ paddingLeft: '20px', fontSize: '12.5px', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
          {college.verificationSteps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="verification-source-meta">
        <span>
          <strong>Verified Source:</strong> {college.sourceLabel}
        </span>
        <span>
          <strong>Canonical Domain:</strong>{' '}
          <code style={{ fontFamily: 'var(--font-mono)' }}>{college.sourceUrl}</code>
        </span>
        <span>
          <strong>Route Last Checked:</strong> {college.lastCheckedDate}
        </span>
      </div>

      {extractedDestinations.length > 0 && (
        <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
          🛡️ SafeSpace Isolation: {extractedDestinations.length} sender-provided link(s) or handle(s) ({extractedDestinations.join(', ')}) were isolated and strictly prevented from supplying this destination.
        </div>
      )}
    </section>
  );
};
