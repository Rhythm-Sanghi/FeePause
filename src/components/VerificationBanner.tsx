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
  const isRealSupported = college.isSupported && !college.isSynthetic;

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

        <div className="verification-actions">
          {college.isSynthetic && (
            <button
              type="button"
              className="btn-open-portal"
              onClick={onOpenSyntheticPortal}
              id="btn-open-mock-portal"
            >
              <span>Open demo ledger</span>
              <span aria-hidden="true">→</span>
            </button>
          )}

          {isRealSupported && college.portalUrl && (
            <a
              href={college.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-open-portal"
              id="btn-open-real-portal"
            >
              <span>Open official student portal</span>
              {college.portalHostname && (
                <span className="portal-hostname-badge">{college.portalHostname}</span>
              )}
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
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

      {college.isSynthetic && (
        <div className="verification-source-meta">
          <span>
            <strong>Data Source:</strong> Fictional demo data
          </span>
        </div>
      )}

      {isRealSupported && (
        <div className="verification-source-meta">
          {college.sourceLabel && (
            <span>
              <strong>Verified Source:</strong> {college.sourceLabel}
            </span>
          )}
          {college.guidanceUrl && (
            <span>
              <a
                href={college.guidanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="guidance-link"
                style={{ color: 'var(--olive)', textDecoration: 'underline', fontWeight: 500 }}
              >
                View university guidance ↗
              </a>
            </span>
          )}
          {college.lastCheckedDate && (
            <span>
              <strong>Route Last Checked:</strong> {college.lastCheckedDate}
            </span>
          )}
        </div>
      )}

      {isUnsupported && (
        <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
          ℹ️ Unlisted institution: Use your existing bookmark or search manually for your registrar or accounts office without guessing domains.
        </div>
      )}

      {extractedDestinations.length > 0 && (
        <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
          🛡️ SafeSpace Isolation: {extractedDestinations.length} sender-provided link(s) or handle(s) ({extractedDestinations.join(', ')}) were isolated and strictly prevented from supplying this destination.
        </div>
      )}
    </section>
  );
};
