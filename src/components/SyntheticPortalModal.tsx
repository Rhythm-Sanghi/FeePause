import React, { useEffect, useRef } from 'react';
import {
  MOCK_STUDENT_PROFILE,
  URGENT_SAMPLE_LEDGER_ITEMS,
  ROUTINE_SAMPLE_LEDGER_ITEMS,
  CUSTOM_LEDGER_ITEMS
} from '../constants/syntheticLedger';

interface SyntheticPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSampleId: string | null;
  isCustomOrEdited: boolean;
  claimedAmount?: string;
}

export const SyntheticPortalModal: React.FC<SyntheticPortalModalProps> = ({
  isOpen,
  onClose,
  activeSampleId,
  isCustomOrEdited,
  claimedAmount = '$385.00'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement as HTMLElement | null;

      const timer = setTimeout(() => {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          focusable[0].focus();
        }
      }, 30);

      return () => clearTimeout(timer);
    } else {
      if (openerRef.current && typeof openerRef.current.focus === 'function') {
        openerRef.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Only unchanged built-in samples can show a matching or no-matching fictional ledger result
  const isUrgentSample = activeSampleId === 'sample-urgent-suspicious' && !isCustomOrEdited;
  const isRoutineSample = activeSampleId === 'sample-ordinary-reminder' && !isCustomOrEdited;
  const isCustomMode = isCustomOrEdited || (!isUrgentSample && !isRoutineSample);

  let currentItems = CUSTOM_LEDGER_ITEMS;

  if (isUrgentSample) {
    currentItems = URGENT_SAMPLE_LEDGER_ITEMS;
  } else if (isRoutineSample) {
    currentItems = ROUTINE_SAMPLE_LEDGER_ITEMS;
  } else {
    currentItems = CUSTOM_LEDGER_ITEMS;
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="portal-modal" ref={modalRef}>
        <div className="portal-header">
          <div className="portal-brand">
            <span className="portal-mock-badge">Fictional Demonstration Ledger</span>
            <h2 id="portal-modal-title" className="portal-title">
              Northwood Tech — Student Accounts Self-Service (Demo)
            </h2>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Close demo portal"
            id="btn-close-demo-portal"
          >
            ✕
          </button>
        </div>

        <div className="portal-content">
          <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <strong>Fictional demonstration:</strong> This mock environment illustrates how college students cross-reference an incoming message against an authoritative ledger record before paying.
          </div>

          <div className="student-card">
            <div className="student-card-item">
              <span className="student-card-label">Student Name</span>
              <span className="student-card-value">{MOCK_STUDENT_PROFILE.studentName}</span>
            </div>
            <div className="student-card-item">
              <span className="student-card-label">Student ID</span>
              <span className="student-card-value">{MOCK_STUDENT_PROFILE.studentId}</span>
            </div>
            <div className="student-card-item">
              <span className="student-card-label">Current Term</span>
              <span className="student-card-value">{MOCK_STUDENT_PROFILE.term}</span>
            </div>
            <div className="student-card-item">
              <span className="student-card-label">Official Status</span>
              <span className="student-card-value">{MOCK_STUDENT_PROFILE.academicStanding}</span>
            </div>
          </div>

          <div className="ledger-table-container">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Charge Code</th>
                  <th>Description</th>
                  <th>Assessed Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Ledger Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => {
                  const isPending = item.status === 'pending';
                  return (
                    <tr
                      key={item.id}
                      className={isPending ? 'highlighted-fee' : ''}
                    >
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{item.code}</td>
                      <td>{item.description}</td>
                      <td>{item.assessedDate}</td>
                      <td>{item.dueDate}</td>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {item.amount}
                      </td>
                      <td>
                        <span
                          className={item.status === 'paid' ? 'badge-paid' : 'badge-pending'}
                        >
                          {item.status === 'paid' ? 'Paid / Settled' : 'Pending Invoice'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Three Compact Rows: Routine Sample (Matching Ledger Demo) */}
          {isRoutineSample && (
            <div className="ledger-three-rows-container match-found" data-testid="portal-finding-routine">
              <div className="three-row-header">
                <span className="three-row-badge match">Matching charge in this demo ledger</span>
                <span className="three-row-subtitle">Fictional Demonstration Comparison</span>
              </div>

              <div className="three-rows-grid">
                <div className="three-row-item">
                  <span className="three-row-label">1. What the message claims</span>
                  <div className="three-row-value">
                    Campus Library Materials Assessment of <strong>$42.50</strong> (claimed due Nov 28, 2026).
                  </div>
                </div>

                <div className="three-row-item">
                  <span className="three-row-label">2. What the demo ledger shows</span>
                  <div className="three-row-value">
                    <span className="status-indicator match">●</span> <strong>Matching charge:</strong> A legitimate pending assessment of <strong>$42.50</strong> (Code: <code>LIB-4402</code>) appears as an authorized line item on this fictional student ledger.
                  </div>
                </div>

                <div className="three-row-item highlight-unverified">
                  <span className="three-row-label">3. What remains unverified</span>
                  <div className="three-row-value">
                    <div style={{ fontWeight: 600, color: 'var(--olive-hover, #2D402D)' }}>
                      Reminder Status: The incoming reminder itself remains unverified.
                    </div>
                    <p style={{ marginTop: '3px', fontSize: '11.5px', color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
                      The email sender and the payment link (<code>northwood-dues-collection.invalid</code>) remain unverified. Even when a matching charge exists, <strong>never pay through links in the message</strong>. Official fees must be settled exclusively through authenticated portal cashier instructions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Three Compact Rows: Urgent Sample (No Matching Charge Demo) */}
          {isUrgentSample && (
            <div className="ledger-three-rows-container no-match" data-testid="portal-finding-urgent">
              <div className="three-row-header">
                <span className="three-row-badge no-match">No matching charge in this demo ledger</span>
                <span className="three-row-subtitle">Fictional Demonstration Comparison</span>
              </div>

              <div className="three-rows-grid">
                <div className="three-row-item">
                  <span className="three-row-label">1. What the message claims</span>
                  <div className="three-row-value">
                    Fall Term Lab Access & Tech fee of <strong>{claimedAmount}</strong> due in 3 hours under threat of immediate enrollment freeze.
                  </div>
                </div>

                <div className="three-row-item">
                  <span className="three-row-label">2. What the demo ledger shows</span>
                  <div className="three-row-value">
                    <span className="status-indicator no-match">●</span> <strong>No corresponding charge shown:</strong> The official student ledger shows zero pending fees and zero active holds. A missing entry calls for follow-up with the accounts office—charges may be delayed or misattributed, but students should never pay an unverified fee.
                  </div>
                </div>

                <div className="three-row-item highlight-unverified">
                  <span className="three-row-label">3. What remains unverified</span>
                  <div className="three-row-value">
                    <div style={{ fontWeight: 600, color: 'var(--sanction-ink, #9C1414)' }}>
                      Reminder Status: The incoming reminder itself remains unverified.
                    </div>
                    <p style={{ marginTop: '3px', fontSize: '11.5px', color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
                      The sender identity, external payment link (<code>northwood-clearance.invalid</code>), and OTP demand are unverified. Verify directly with the bursar or cashier office before taking any payment action.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Custom or Edited Text Mode */}
          {isCustomMode && (
            <div
              className="ledger-three-rows-container custom-mode"
              data-testid="portal-finding-custom"
            >
              <div className="three-row-header">
                <span className="three-row-badge custom">No demo result for this message</span>
                <span className="three-row-subtitle">Custom / Edited Input</span>
              </div>
              <div style={{ padding: 'var(--space-3)', fontSize: '12.5px', color: 'var(--ink-secondary)', lineHeight: 1.45 }}>
                <p>
                  Only unchanged built-in samples can show a matching or no-matching fictional ledger result.
                  Because this message is custom or edited, no simulated outcome is available in this demo.
                </p>
                <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed var(--border-medium)', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  Reminder Status: The incoming reminder itself remains unverified.
                </div>
                <p style={{ marginTop: '2px', fontSize: '11.5px' }}>
                  Use your institution’s verified route above to check whether an actual fee appears in your official student portal or contact the accounts office.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              id="btn-return-analysis"
            >
              Return to FeePause Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
