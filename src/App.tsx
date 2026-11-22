import React, { useState, useCallback, useMemo } from 'react';
import { COLLEGES } from './constants/colleges';
import { SAMPLE_REQUESTS } from './constants/samples';
import { analyzeRequestText } from './engine/analyze';
import { Header } from './components/Header';
import { VerificationBanner } from './components/VerificationBanner';
import { RequestWorkspace } from './components/RequestWorkspace';
import { ObservationList } from './components/ObservationList';
import { EvidenceInspector } from './components/EvidenceInspector';
import { SyntheticPortalModal } from './components/SyntheticPortalModal';
import { LimitationNotice } from './components/LimitationNotice';
import { Observation, SampleRequest, AnalysisResult } from './types';
import './styles/app.css';

export const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('northwood');
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedObservationId, setSelectedObservationId] = useState<string | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState<boolean>(false);

  // Only unchanged built-in samples can show a matching or no-matching fictional ledger result
  const isUnchangedSample = useMemo(() => {
    if (!activeSampleId || isStale) return false;
    const sample = SAMPLE_REQUESTS.find((s) => s.id === activeSampleId);
    return sample ? sample.body === inputText : false;
  }, [activeSampleId, inputText, isStale]);

  const isCustomOrEdited = !isUnchangedSample;

  const currentCollege = useMemo(() => {
    return COLLEGES[selectedCollegeId] || COLLEGES.unsupported;
  }, [selectedCollegeId]);

  const handleCheck = useCallback(() => {
    const result = analyzeRequestText(inputText, currentCollege);
    setAnalysis(result);
    setHasChecked(true);
    setIsStale(false);

    if (result.observations.length > 0) {
      setSelectedObservationId(result.observations[0].id);
    } else {
      setSelectedObservationId(null);
    }
  }, [inputText, currentCollege]);

  const handleSelectSample = useCallback((sample: SampleRequest) => {
    setInputText(sample.body);
    setSelectedCollegeId(sample.collegeId);
    setActiveSampleId(sample.id);
    setIsStale(false);

    const college = COLLEGES[sample.collegeId] || COLLEGES.unsupported;
    const result = analyzeRequestText(sample.body, college);
    setAnalysis(result);
    setHasChecked(true);

    if (result.observations.length > 0) {
      setSelectedObservationId(result.observations[0].id);
    } else {
      setSelectedObservationId(null);
    }
  }, []);

  const handleClear = useCallback(() => {
    setInputText('');
    setHasChecked(false);
    setIsStale(false);
    setAnalysis(null);
    setSelectedObservationId(null);
    setActiveSampleId(null);
  }, []);

  const handleTextChange = useCallback(
    (newText: string) => {
      setInputText(newText);
      if (hasChecked || analysis) {
        setIsStale(true);
        setAnalysis(null);
        setSelectedObservationId(null);
      }
    },
    [hasChecked, analysis]
  );

  const handleCollegeChange = useCallback(
    (newCollegeId: string) => {
      setSelectedCollegeId(newCollegeId);
      if (hasChecked && !isStale) {
        const nextCollege = COLLEGES[newCollegeId] || COLLEGES.unsupported;
        const result = analyzeRequestText(inputText, nextCollege);
        setAnalysis(result);
      }
    },
    [hasChecked, isStale, inputText]
  );

  const selectedObservation = useMemo(() => {
    if (!analysis || !selectedObservationId) return null;
    return analysis.observations.find((o) => o.id === selectedObservationId) || null;
  }, [analysis, selectedObservationId]);

  const extractedDestinations = useMemo(() => {
    return analysis?.extractedDestinations || [];
  }, [analysis]);

  return (
    <div className="app-container">
      <Header />

      {/* Top Quick-Demo Bar for Instant 1-Click Judge Access (Within Easy Reach on Mobile) */}
      <div className="quick-demo-strip" role="region" aria-label="Quick Judge Demos">
        <span className="quick-demo-label">Judge Quick Start:</span>
        <div className="quick-demo-buttons">
          <button
            type="button"
            className="btn-quick-routine"
            onClick={() => handleSelectSample(SAMPLE_REQUESTS[1])}
            id="btn-quick-routine-top"
          >
            ★ Try the routine reminder
          </button>
          <button
            type="button"
            className="btn-quick-sample"
            onClick={() => handleSelectSample(SAMPLE_REQUESTS[0])}
            id="btn-quick-urgent-top"
          >
            Urgent notice
          </button>
          <button
            type="button"
            className="btn-quick-sample"
            onClick={() => handleSelectSample(SAMPLE_REQUESTS[2])}
            id="btn-quick-unlisted-top"
          >
            Unlisted college
          </button>
        </div>
      </div>

      {/* Verification Action Banner: Highest Visual Hierarchy */}
      <VerificationBanner
        college={currentCollege}
        onOpenSyntheticPortal={() => setIsPortalModalOpen(true)}
        extractedDestinations={extractedDestinations}
      />

      {/* Main Grid: Request Workspace & Observations (Left) + Evidence Inspector (Right) */}
      <main className="main-layout">
        <div className="request-workspace">
          <RequestWorkspace
            inputText={inputText}
            onTextChange={handleTextChange}
            selectedCollegeId={selectedCollegeId}
            onCollegeChange={handleCollegeChange}
            onCheckRequest={handleCheck}
            onClear={handleClear}
            onSelectSample={handleSelectSample}
            activeSampleId={activeSampleId}
          />

          <ObservationList
            observations={analysis?.observations || []}
            selectedObservationId={selectedObservationId}
            onSelectObservation={(obs: Observation) => setSelectedObservationId(obs.id)}
            isLowInformation={analysis?.isLowInformation || false}
            hasChecked={hasChecked}
            isStale={isStale}
          />
        </div>

        <EvidenceInspector
          selectedObservation={selectedObservation}
          onOpenSyntheticPortal={() => setIsPortalModalOpen(true)}
          isSyntheticCollege={currentCollege.isSynthetic}
        />
      </main>

      <LimitationNotice />

      {/* Synthetic Portal Demonstration Modal */}
      <SyntheticPortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        activeSampleId={isUnchangedSample ? activeSampleId : null}
        isCustomOrEdited={isCustomOrEdited}
        claimedAmount={analysis?.extractedAmounts[0] || '$385.00'}
      />
    </div>
  );
};

export default App;
