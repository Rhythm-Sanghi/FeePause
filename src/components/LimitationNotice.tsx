import React from 'react';

export const LimitationNotice: React.FC = () => {
  return (
    <footer className="limitations-footer" role="contentinfo">
      <div className="limitations-title">Important System Limitations & Privacy Boundary</div>
      <p>
        <strong>FeePause cannot authenticate the sender or see your student fee balance.</strong> Incoming
        emails, texts, and letterheads can be forged or mimicked. A message that seems legitimate may be fraudulent,
        and an urgent notice may sometimes be genuine campus administration.
      </p>
      <p>
        Therefore, FeePause never assigns an authenticity score, scam percentage, or &ldquo;safe to pay&rdquo; verdict.
        The student must always confirm whether a fee is actually listed on their authenticated college portal or consult
        the official accounts office directly before transferring funds.
      </p>
      <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--ink-faint)' }}>
        Private by design: No text is persisted in browser storage, logged, or transmitted over any network.
        FeePause design language influenced by Threadmark.
      </div>
    </footer>
  );
};
