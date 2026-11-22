import React from 'react';
import { Observation } from '../types';

interface EvidenceInspectorProps {
  selectedObservation: Observation | null;
  onOpenSyntheticPortal?: () => void;
  isSyntheticCollege?: boolean;
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  selectedObservation,
  onOpenSyntheticPortal,
  isSyntheticCollege
}) => {
  return (
    <aside className="evidence-inspector" aria-labelledby="inspector-heading">
      <div className="inspector-panel">
        <h3 id="inspector-heading" className="inspector-heading">
          Evidence Inspector
        </h3>

        {selectedObservation ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="inspector-field">
              <span className="inspector-field-label">Selected Observation:</span>
              <strong style={{ fontSize: '13px', color: 'var(--ink-primary)' }}>
                {selectedObservation.label}
              </strong>
            </div>

            <div className="inspector-field">
              <span className="inspector-field-label">Exact Message Excerpt:</span>
              <div className="inspector-excerpt-box">
                {selectedObservation.excerpt}
              </div>
            </div>

            <div className="inspector-field">
              <span className="inspector-field-label">Plain-Language Assessment:</span>
              <p className="inspector-explanation">
                {selectedObservation.plainExplanation}
              </p>
            </div>

            <div className="inspector-unverified-box">
              <div className="inspector-unverified-title">What Remains Unverified:</div>
              <div>{selectedObservation.whatIsUnverified}</div>
            </div>

            {isSyntheticCollege && onOpenSyntheticPortal && (
              <div style={{ paddingTop: 'var(--space-1)' }}>
                <button
                  type="button"
                  id="inspector-open-mock-portal"
                  className="btn-open-portal"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={onOpenSyntheticPortal}
                >
                  Verify in Synthetic Portal →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="inspector-empty">
            <p>
              Select an observation in the workspace to view its exact excerpt, plain-language risk assessment,
              and why message content alone cannot prove an institutional balance.
            </p>
            <p style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--ink-muted)' }}>
              FeePause uses deterministic pattern detection. No scam probabilities or &ldquo;safe to pay&rdquo; verdicts
              are generated.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
