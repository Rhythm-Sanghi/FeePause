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

      {/* 3-Step Verification Checklist & Independent Next Steps */}
      <div className="verification-checklist-box" data-testid="verification-checklist">
        <div className="checklist-heading-row">
          <span className="checklist-badge">Verification Checklist</span>
          <span className="checklist-subhead">Cross-reference incoming requests before initiating payment</span>
        </div>
        <ol className="checklist-list">
          <li>
            <strong>1. Check the fee description or line item:</strong> Confirm whether the exact assessment (e.g. tuition, library fee, lab assessment) is listed on your authenticated student bill.
          </li>
          <li>
            <strong>2. Check the amount:</strong> Confirm whether the requested figure matches an active pending balance on your official account.
          </li>
          <li>
            <strong>3. Check the academic term or due date:</strong> Confirm whether the official institutional deadline matches the claimed due date.
          </li>
        </ol>

        <div className="checklist-next-steps-grid">
          <div className="next-step-card next-step-agree">
            <span className="next-step-tag">If details agree</span>
            <p>Follow payment instructions directly inside the authenticated official portal. Never pay via third-party links, QR codes, or phone numbers in the message.</p>
          </div>
          <div className="next-step-card next-step-differ">
            <span className="next-step-tag">If details differ or charge is missing</span>
            <p>Do not pay. Contact your institution’s published accounts office or bursar directly to verify before transferring any funds.</p>
          </div>
        </div>

        <div className="checklist-unverified-advisory">
          ℹ️ <em>The original message and its sender-supplied destinations remain unverified in either case. FeePause does not read your private balance; always verify manually.</em>
        </div>
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
        <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', lineHeight: 1.5 }}>
          <strong>Unlisted College Verification Guide:</strong> Open your official student portal using an existing bookmark or search for your institution’s registrar or accounts directory via its verified domain. Never guess a domain or reuse contact details, phone numbers, or links from the message.
        </div>
      )}

      {extractedDestinations.length > 0 && (
        <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
          🛡️ SafeSpace Isolation: {extractedDestinations.length} sender-provided link(s) or handle(s) ({extractedDestinations.join(', ')}) were isolated and strictly prevented from supplying this destination.
        </div>
      )}
    </section>
  );
};
