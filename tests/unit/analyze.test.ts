import { describe, it, expect } from 'vitest';
import { analyzeRequestText } from '../../src/engine/analyze';
import { COLLEGES } from '../../src/constants/colleges';
import { SAMPLE_REQUESTS } from '../../src/constants/samples';

describe('Deterministic Observation Engine (analyzeRequestText)', () => {
  const northwood = COLLEGES.northwood;

  it('correctly extracts payment amounts from text', () => {
    const text = 'Notice of assessed lab dues: $385.00 must be cleared immediately.';
    const result = analyzeRequestText(text, northwood);

    expect(result.extractedAmounts).toContain('$385.00');
    const paymentObs = result.observations.filter((o) => o.category === 'payment');
    expect(paymentObs.length).toBeGreaterThan(0);
    expect(paymentObs[0].excerpt).toBe('$385.00');
    expect(paymentObs[0].plainExplanation).toBeDefined();
    expect(paymentObs[0].whatIsUnverified).toContain('institutional student balance');
  });

  it('correctly extracts Indian-grouped amounts without dropping leading digits', () => {
    const text = 'Please pay ₹1,25,000 for semester tuition dues immediately.';
    const result = analyzeRequestText(text, northwood);

    expect(result.extractedAmounts).toContain('₹1,25,000');
    expect(result.extractedAmounts).not.toContain('₹1');
    const paymentObs = result.observations.find((o) => o.category === 'payment');
    expect(paymentObs).toBeDefined();
    expect(paymentObs?.excerpt).toBe('₹1,25,000');
  });

  it('handles Western grouping, plain numbers, and currency variations', () => {
    const textWestern = 'Amount assessed: $1,250,000 for building fee.';
    const resultWestern = analyzeRequestText(textWestern, northwood);
    expect(resultWestern.extractedAmounts).toContain('$1,250,000');

    const textPlain = 'Pay ₹500 directly or 500 dollars.';
    const resultPlain = analyzeRequestText(textPlain, northwood);
    expect(resultPlain.extractedAmounts).toContain('₹500');
    expect(resultPlain.extractedAmounts.some((a) => a.includes('500 dollars'))).toBe(true);
  });

  it('correctly extracts urgency and deadline markers, distinguishing panic from stated deadlines', () => {
    const textPanic = 'Your account will be suspended within 3 hours unless resolved.';
    const resultPanic = analyzeRequestText(textPanic, northwood);
    expect(resultPanic.extractedDeadlines.some((d) => d.toLowerCase().includes('within 3 hours'))).toBe(true);
    const urgencyObs = resultPanic.observations.find((o) => o.category === 'urgency');
    expect(urgencyObs?.label).toContain('Artificial urgency or short deadline');

    const textRoutine = 'The assessment is Due by Friday at 5:00 pm.';
    const resultRoutine = analyzeRequestText(textRoutine, northwood);
    const routineObs = resultRoutine.observations.find((o) => o.category === 'urgency');
    expect(routineObs?.label).toContain('Stated deadline');
    expect(routineObs?.label).not.toContain('Artificial urgency');
  });

  it('extracts unverified external payment links vs neutral links', () => {
    const paymentText = 'Clear your account here: https://northwood-clearance.invalid/pay';
    const paymentResult = analyzeRequestText(paymentText, northwood);
    expect(paymentResult.extractedDestinations).toContain('https://northwood-clearance.invalid/pay');
    const paymentLinkObs = paymentResult.observations.find((o) => o.category === 'unverified_link');
    expect(paymentLinkObs?.label).toContain('Unverified payment or clearance link');

    const neutralText = 'Read the campus schedule at https://library.example.invalid/hours for details.';
    const neutralResult = analyzeRequestText(neutralText, northwood);
    expect(neutralResult.extractedDestinations).toContain('https://library.example.invalid/hours');
    const neutralLinkObs = neutralResult.observations.find((o) => o.category === 'unverified_link');
    expect(neutralLinkObs?.label).toContain('Link found in message');
  });

  it('distinguishes credential demands from neutral mentions like "Never share your OTP"', () => {
    const mentionText = 'Security reminder: Never share your OTP or password with anyone.';
    const mentionResult = analyzeRequestText(mentionText, northwood);
    const mentionObs = mentionResult.observations.find((o) => o.category === 'credential_otp');
    expect(mentionObs).toBeDefined();
    expect(mentionObs?.label).toBe('OTP mentioned');

    const demandText = 'Submit your OTP to verify payment.';
    const demandResult = analyzeRequestText(demandText, northwood);
    const demandObs = demandResult.observations.find((o) => o.category === 'credential_otp');
    expect(demandObs).toBeDefined();
    expect(demandObs?.label).toContain('Request for OTP');
  });

  it('extracts sanction threats (course enrollment freeze)', () => {
    const text = 'An administrative hold will freeze your course enrollment.';
    const result = analyzeRequestText(text, northwood);

    const sanctionObs = result.observations.filter((o) => o.category === 'sanction_threat');
    expect(sanctionObs.length).toBeGreaterThan(0);
  });

  it('handles empty input gracefully with isLowInformation: true', () => {
    const result = analyzeRequestText('', northwood);

    expect(result.observations).toEqual([]);
    expect(result.hasObservations).toBe(false);
    expect(result.isLowInformation).toBe(true);
    expect(result.extractedAmounts).toEqual([]);
  });

  it('handles input with no recognizable fee details', () => {
    const benignText = 'Hello team, let us meet tomorrow afternoon at 2 PM to discuss the project ideas.';
    const result = analyzeRequestText(benignText, northwood);

    expect(result.hasObservations).toBe(false);
    expect(result.isLowInformation).toBe(true);
    expect(result.observations.length).toBe(0);
  });

  it('parses the urgent suspicious sample with rich multi-category observations', () => {
    const sample = SAMPLE_REQUESTS.find((s) => s.id === 'sample-urgent-suspicious')!;
    const result = analyzeRequestText(sample.body, northwood);

    expect(result.hasObservations).toBe(true);
    expect(result.extractedAmounts).toContain('$385.00');
    expect(result.observations.some((o) => o.category === 'urgency')).toBe(true);
    expect(result.observations.some((o) => o.category === 'unverified_link')).toBe(true);
    expect(result.observations.some((o) => o.category === 'credential_otp')).toBe(true);
    expect(result.observations.some((o) => o.category === 'sanction_threat')).toBe(true);
  });

  it('parses the ordinary fee reminder without generating scam scores or verdicts', () => {
    const sample = SAMPLE_REQUESTS.find((s) => s.id === 'sample-ordinary-reminder')!;
    const result = analyzeRequestText(sample.body, northwood);

    expect(result.hasObservations).toBe(true);
    expect(result.extractedAmounts).toContain('$42.50');
    // Verify no probabilistic verdicts exist on the result object
    expect((result as Record<string, unknown>).scamScore).toBeUndefined();
    expect((result as Record<string, unknown>).authenticityVerdict).toBeUndefined();
    expect((result as Record<string, unknown>).isSafeToPay).toBeUndefined();
  });
});
