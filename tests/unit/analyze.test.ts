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

  it('correctly extracts urgency and deadline markers', () => {
    const text = 'Your account will be suspended within 3 hours unless resolved by 5:00 pm.';
    const result = analyzeRequestText(text, northwood);

    expect(result.extractedDeadlines.some((d) => d.toLowerCase().includes('within 3 hours'))).toBe(true);
    const urgencyObs = result.observations.filter((o) => o.category === 'urgency');
    expect(urgencyObs.length).toBeGreaterThan(0);
  });

  it('extracts unverified external payment links without making them destinations', () => {
    const text = 'Clear your account here: https://northwood-clearance.invalid/pay';
    const result = analyzeRequestText(text, northwood);

    expect(result.extractedDestinations).toContain('https://northwood-clearance.invalid/pay');
    const linkObs = result.observations.find((o) => o.category === 'unverified_link');
    expect(linkObs).toBeDefined();
    expect(linkObs?.excerpt).toBe('https://northwood-clearance.invalid/pay');
    expect(linkObs?.plainExplanation).toContain('isolates pasted links');
  });

  it('extracts credential / OTP demands', () => {
    const text = 'Submit the 6-digit payment confirmation OTP and transaction reference to the desk.';
    const result = analyzeRequestText(text, northwood);

    const credObs = result.observations.filter((o) => o.category === 'credential_otp');
    expect(credObs.length).toBeGreaterThan(0);
    expect(credObs.some((c) => c.excerpt.toLowerCase().includes('otp'))).toBe(true);
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
