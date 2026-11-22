import React from 'react';
import { SAMPLE_REQUESTS } from '../constants/samples';
import { COLLEGES } from '../constants/colleges';
import { SampleRequest } from '../types';

interface RequestWorkspaceProps {
  inputText: string;
  onTextChange: (text: string) => void;
  selectedCollegeId: string;
  onCollegeChange: (collegeId: string) => void;
  onCheckRequest: () => void;
  onClear: () => void;
  onSelectSample: (sample: SampleRequest) => void;
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
  activeSampleId
}) => {
  return (
    <section className="panel" aria-labelledby="workspace-title">
      <div className="panel-title-bar">
        <h2 id="workspace-title" className="panel-title">
          Fee Request Inspection Workspace
        </h2>
        <span className="panel-subtitle">In-Memory Local Analysis</span>
      </div>

      {/* Quick Sample Selector */}
      <div className="sample-bar">
        <span className="sample-bar-label">Try a sample (1-Click Demo for Judges):</span>
        <div className="sample-chips" role="group" aria-label="Sample fee requests">
          {SAMPLE_REQUESTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className={`sample-chip ${activeSampleId === sample.id ? 'active' : ''}`}
              onClick={() => onSelectSample(sample)}
              title={sample.tagline}
              id={`btn-${sample.id}`}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* College Selector */}
      <div className="form-group">
        <label htmlFor="college-select" className="form-label">
          <span>Target Institution</span>
          <span className="form-label-hint">Determines trusted verification route</span>
        </label>
        <select
          id="college-select"
          className="select-college"
          value={selectedCollegeId}
          onChange={(e) => onCollegeChange(e.target.value)}
        >
          {Object.values(COLLEGES).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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
