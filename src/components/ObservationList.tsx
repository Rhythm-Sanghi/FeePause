import React from 'react';
import { Observation } from '../types';

interface ObservationListProps {
  observations: Observation[];
  selectedObservationId: string | null;
  onSelectObservation: (obs: Observation) => void;
  isLowInformation: boolean;
  hasChecked: boolean;
}

export const ObservationList: React.FC<ObservationListProps> = ({
  observations,
  selectedObservationId,
  onSelectObservation,
  isLowInformation,
  hasChecked
}) => {
  if (!hasChecked) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">Ready for Inspection</div>
        <div>
          Load a sample from above or paste message text to extract observable payment details and examine unverified claims.
        </div>
      </div>
    );
  }

  if (isLowInformation) {
    return (
      <div className="empty-state" role="status" aria-live="polite">
        <div className="empty-state-title">No Fee Patterns Identified in Text</div>
        <div>
          The provided text does not contain recognizable payment amounts, strict deadlines, or payment links.
          Even without suspicious markers, <strong>wordings alone cannot prove legitimacy</strong>.
          Check your official institution portal above to confirm whether any balance is due.
        </div>
      </div>
    );
  }

  return (
    <div className="observations-section" role="region" aria-label="Extracted Observations">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-secondary)', textTransform: 'uppercase' }}>
          Extracted Text Observations ({observations.length})
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
          Click an observation to inspect evidence
        </span>
      </div>

      <div className="observation-rows" role="list">
        {observations.map((obs) => {
          const isSelected = selectedObservationId === obs.id;
          let pillClass = 'obs-pill-contact';
          let pillLabel = 'Contact';

          if (obs.category === 'payment') {
            pillClass = 'obs-pill-payment';
            pillLabel = 'Payment Claim';
          } else if (obs.category === 'urgency') {
            pillClass = 'obs-pill-urgency';
            pillLabel = 'Urgent Deadline';
          } else if (obs.category === 'unverified_link') {
            pillClass = 'obs-pill-link';
            pillLabel = 'Unverified Link';
          } else if (obs.category === 'sanction_threat') {
            pillClass = 'obs-pill-sanction';
            pillLabel = 'Threatened Hold';
          } else if (obs.category === 'credential_otp') {
            pillClass = 'obs-pill-credential';
            pillLabel = 'Credential / OTP';
          }

          return (
            <div
              key={obs.id}
              role="listitem"
              tabIndex={0}
              className={`observation-row ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectObservation(obs)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectObservation(obs);
                }
              }}
              aria-selected={isSelected}
            >
              <div className="observation-header">
                <span className={`obs-pill ${pillClass}`}>{pillLabel}</span>
                <span className="obs-excerpt-preview">{obs.excerpt}</span>
              </div>
              <div className="obs-label">{obs.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
