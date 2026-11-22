import React, { useEffect } from 'react';
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
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
      <div className="portal-modal">
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

          {/* Finding Banner: Only unchanged built-in samples show a match or no-match result */}
          {isUrgentSample && (
            <div className="portal-learning-takeaway no-match" data-testid="portal-finding-urgent">
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                No matching charge in this demo ledger
              </div>
              <p>
                The urgent message claimed an overdue assessment of {claimedAmount} and threatened an immediate
                enrollment hold within 3 hours. However, the official student ledger shows <strong>no corresponding charge</strong> and
                no active holds on the student account.
              </p>
              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed var(--sanction-border)', fontWeight: 600 }}>
                Reminder Status: The incoming reminder itself remains unverified.
              </div>
              <p style={{ marginTop: '2px', fontSize: '11.5px' }}>
                A missing ledger entry does not prove a message is fake—charges may be delayed or misattributed—but students should never pay an unverified fee. Verify directly with the bursar or cashier office before taking action.
              </p>
            </div>
          )}

          {isRoutineSample && (
            <div className="portal-learning-takeaway match-found" data-testid="portal-finding-routine">
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                Matching charge in this demo ledger
              </div>
              <p>
                A corresponding charge for <strong>$42.50</strong> (Campus Library Materials Assessment) appears as an
                authorized line item on this student ledger.
              </p>
              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed var(--olive-border)', fontWeight: 600 }}>
                Reminder Status: The incoming reminder itself remains unverified.
              </div>
              <p style={{ marginTop: '2px', fontSize: '11.5px' }}>
                Even when a matching charge exists, <strong>never pay through links in the message</strong> (e.g. <code>northwood-dues-collection.invalid</code>).
                Official fees must be settled exclusively through the authenticated cashier instructions within this portal.
              </p>
            </div>
          )}

          {isCustomMode && (
            <div className="portal-learning-takeaway" style={{ backgroundColor: 'var(--bg-surface-subtle)', borderColor: 'var(--border-medium)', color: 'var(--ink-secondary)' }} data-testid="portal-finding-custom">
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: 'var(--ink-primary)' }}>
                No demo result for this message
              </div>
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
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Return to FeePause Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
