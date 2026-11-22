import React from 'react';
import { SAMPLE_REQUESTS } from '../constants/samples';
import { SampleRequest } from '../types';

interface RequestWorkspaceProps {
  inputText: string;
  onTextChange: (text: string) => void;
  selectedCollegeId: string;
  onCollegeChange: (collegeId: string) => void;
  onCheckRequest: () => void;
  onClear: () => void;
  onSelectSample: (sample: SampleRequest) => void;
  onUseOwnMessage: () => void;
  activeSampleId: string | null;
}

export const RequestWorkspace: React.FC<RequestWorkspaceProps> = ({
  inputText,
  onTextChange,
  selectedCollegeId,
  onCollegeChange,
  onCheckRequest,
  onClear,
  onSelectSample,
  onUseOwnMessage,
  activeSampleId
}) => {
  const isPersonalMode = activeSampleId === null;

  return (
    <section className="panel" aria-labelledby="workspace-title">
      <div className="panel-title-bar">
        <h2 id="workspace-title" className="panel-title">
          Fee Request Inspection Workspace
        </h2>
        <span className="panel-subtitle">In-Memory Local Analysis</span>
      </div>

      {/* Unified Entry Strip: One prominent Routine action, nearby samples, and Use My Own Message */}
      <div className="entry-mode-strip" role="toolbar" aria-label="Demo samples and personal message entry">
        <div className="sample-actions-group">
          <button
            type="button"
            className={`sample-chip sample-chip-featured ${activeSampleId === 'sample-ordinary-reminder' ? 'active' : ''}`}
            onClick={() => onSelectSample(SAMPLE_REQUESTS[1])}
            title={SAMPLE_REQUESTS[1].tagline}
            id="btn-sample-ordinary-reminder"
          >
            ★ Try the routine reminder (Recommended)
          </button>
          <button
            type="button"
            className={`sample-chip ${activeSampleId === 'sample-urgent-suspicious' ? 'active' : ''}`}
            onClick={() => onSelectSample(SAMPLE_REQUESTS[0])}
            title={SAMPLE_REQUESTS[0].tagline}
            id="btn-sample-urgent-suspicious"
          >
            {SAMPLE_REQUESTS[0].name}
          </button>
          <button
            type="button"
            className={`sample-chip ${activeSampleId === 'sample-unsupported-college' ? 'active' : ''}`}
            onClick={() => onSelectSample(SAMPLE_REQUESTS[2])}
            title={SAMPLE_REQUESTS[2].tagline}
            id="btn-sample-unsupported-college"
          >
            {SAMPLE_REQUESTS[2].name}
          </button>
        </div>

        <div className="personal-action-group">
          <button
            type="button"
            className={`btn-use-own-message ${isPersonalMode ? 'active' : ''}`}
            onClick={onUseOwnMessage}
            id="btn-use-own-message"
            title="Inspect your own fee request with real university verification"
          >
            Use my own message ✍️
          </button>
        </div>
      </div>

      {/* College Selector */}
      <div className="form-group">
        <label htmlFor="college-select" className="form-label">
          <span>Target Institution</span>
          <span className="form-label-hint">
            {isPersonalMode
              ? 'Select your college or choose "My college is not listed"'
              : 'Determines trusted verification route'}
          </span>
        </label>
        <select
          id="college-select"
          className="select-college"
          value={selectedCollegeId}
          onChange={(e) => onCollegeChange(e.target.value)}
        >
          <option value="iit_delhi">Indian Institute of Technology Delhi (IIT Delhi)</option>
          <option value="uc_berkeley">University of California, Berkeley</option>
          <option value="unsupported">My college is not listed / Other institution</option>
          <option value="northwood">
            Northwood Institute of Technology (Fictional Demo — Sample Flow Only)
          </option>
        </select>
        {isPersonalMode && selectedCollegeId === 'northwood' && (
          <div style={{ fontSize: '11.5px', color: 'var(--amber-dim, #B25E00)', marginTop: '4px' }}>
            ⚠️ Northwood is a fictional simulation for demo samples. Select your real college or choose &quot;My college is not listed&quot; for authentic verification.
          </div>
        )}
      </div>

      {/* Text Area for Message */}
      <div className="form-group">
        <label htmlFor="message-textarea" className="form-label">
          <span>Fee Request Message Content</span>
          <span className="form-label-hint">Paste raw email, SMS, or notice</span>
        </label>
        <textarea
          id="message-textarea"
          className="textarea-message"
          rows={7}
          placeholder="Paste an unexpected fee demand, tuition notice, fine, or payment link here..."
          value={inputText}
          onChange={(e) => onTextChange(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
        <div className="textarea-footer">
          <span>Character count: {inputText.length}</span>
          <span>Zero network traffic • Text is kept in memory</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="workspace-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={onCheckRequest}
          id="btn-check-request"
        >
          Check Request & View Observations
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onClear}
          id="btn-clear-request"
        >
          Clear Workspace
        </button>
      </div>
    </section>
  );
};
