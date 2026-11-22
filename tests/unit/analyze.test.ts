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
    expect(paymentObs[0].whatIsUnverified).toContain('student balance');
  });

  it('correctly extracts Indian-grouped amounts without dropping leading digits', () => {
    const text = 'Please pay ₹1,25,000 for semester tuition dues immediately.';
    const result = analyzeRequestText(text, northwood);

    expect(result.extractedAmounts).toContain('₹1,25,000');
    expect(result.extractedAmounts).not.toContain('₹1');
    const paymentObs = result.observations.find((o) => o.category === 'payment');
    expect(paymentObs).toBeDefined();
    expect(paymentObs?.excerpt).toBe('₹1,25,000');
    expect(text.slice(paymentObs!.startIndex, paymentObs!.endIndex)).toBe('₹1,25,000');
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
    expect(urgencyObs?.label).toContain('Short deadline stated');

    const textRoutine = 'The assessment is Due by Friday at 5:00 pm.';
    const resultRoutine = analyzeRequestText(textRoutine, northwood);
    const routineObs = resultRoutine.observations.find((o) => o.category === 'urgency');
    expect(routineObs?.label).toContain('Stated deadline');
    expect(routineObs?.label).not.toContain('Short deadline');
  });

  it('extracts unverified external payment links vs neutral links', () => {
    const paymentText = 'Clear your account here: https://northwood-clearance.invalid/pay';
    const paymentResult = analyzeRequestText(paymentText, northwood);
    expect(paymentResult.extractedDestinations).toContain('https://northwood-clearance.invalid/pay');
    const paymentLinkObs = paymentResult.observations.find((o) => o.category === 'unverified_link');
    expect(paymentLinkObs?.label).toContain('Message links to a payment destination');

    const neutralText = 'Read the campus schedule at https://library.example.invalid/hours for details.';
    const neutralResult = analyzeRequestText(neutralText, northwood);
    expect(neutralResult.extractedDestinations).toContain('https://library.example.invalid/hours');
    const neutralLinkObs = neutralResult.observations.find((o) => o.category === 'unverified_link');
    expect(neutralLinkObs?.label).toContain('Link found');
    expect(neutralLinkObs?.label).not.toContain('payment destination');
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

  it('extracts sanction threats and hold mentions', () => {
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
    expect((result as Record<string, unknown>).scamScore).toBeUndefined();
    expect((result as Record<string, unknown>).authenticityVerdict).toBeUndefined();
    expect((result as Record<string, unknown>).isSafeToPay).toBeUndefined();
  });
});

describe('Reproduction & Accuracy Regression Cases', () => {
  const northwood = COLLEGES.northwood;

  it('Case 1: "Your account has no administrative hold." -> Hold mentioned, no threat claim', () => {
    const text = 'Your account has no administrative hold.';
    const result = analyzeRequestText(text, northwood);
    const holdObs = result.observations.find((o) => o.category === 'sanction_threat');
    expect(holdObs).toBeDefined();
    expect(holdObs?.label).toContain('Administrative hold mentioned');
    expect(holdObs?.label).not.toContain('Threat');
    expect(holdObs?.plainExplanation).toContain('neutral or clearing context');
  });

  it('Case 2: "Pay by Friday or your enrollment will be cancelled." -> Stated deadline & conditional cancellation claim, both unverified', () => {
    const text = 'Pay by Friday or your enrollment will be cancelled.';
    const result = analyzeRequestText(text, northwood);

    const deadlineObs = result.observations.find((o) => o.category === 'urgency');
    expect(deadlineObs).toBeDefined();
    expect(deadlineObs?.label).toContain('Stated deadline');

    const cancellationObs = result.observations.find((o) => o.category === 'sanction_threat');
    expect(cancellationObs).toBeDefined();
    expect(cancellationObs?.label).toContain('Conditional cancellation claim');
    expect(cancellationObs?.whatIsUnverified).toContain('Text in an incoming message cannot cancel your enrollment');
  });

  it('Case 3: "Your fee is past due." -> Overdue status stated, no claim that pressure is artificial', () => {
    const text = 'Your fee is past due.';
    const result = analyzeRequestText(text, northwood);
    const overdueObs = result.observations.find((o) => o.category === 'urgency');
    expect(overdueObs).toBeDefined();
    expect(overdueObs?.label).toContain('Overdue status stated');
    expect(overdueObs?.label).not.toContain('Artificial');
    expect(overdueObs?.plainExplanation).not.toContain('panic');
  });

  it('Case 4: "Due by Friday." -> Stated deadline distinct from explicit time pressure', () => {
    const text = 'Due by Friday.';
    const result = analyzeRequestText(text, northwood);
    const deadlineObs = result.observations.find((o) => o.category === 'urgency');
    expect(deadlineObs).toBeDefined();
    expect(deadlineObs?.label).toContain('Stated deadline');
    expect(deadlineObs?.label).not.toContain('Short deadline');
  });

  it('Case 5: "Tuition fees are due Friday. Campus calendar: https://calendar.example.invalid" -> Link found, neighboring fee wording does not make calendar URL a payment route', () => {
    const text = 'Tuition fees are due Friday. Campus calendar: https://calendar.example.invalid';
    const result = analyzeRequestText(text, northwood);
    const linkObs = result.observations.find((o) => o.category === 'unverified_link');
    expect(linkObs).toBeDefined();
    expect(linkObs?.label).toBe('Link found: https://calendar.example.invalid');
    expect(linkObs?.label).not.toContain('payment destination');
  });

  it('Case 6: "Pay the fee at https://campus-payment.example.invalid." -> Message links to a payment destination, stays inert and unverified', () => {
    const text = 'Pay the fee at https://campus-payment.example.invalid.';
    const result = analyzeRequestText(text, northwood);
    const linkObs = result.observations.find((o) => o.category === 'unverified_link');
    expect(linkObs).toBeDefined();
    expect(linkObs?.label).toBe('Message links to a payment destination: https://campus-payment.example.invalid');
    expect(linkObs?.plainExplanation).toContain('isolates pasted links');
  });

  it('Case 7: "Please share your OTP. Never share your debit card PIN." -> OTP requested, PIN in caution, second sentence does not suppress first', () => {
    const text = 'Please share your OTP. Never share your debit card PIN.';
    const result = analyzeRequestText(text, northwood);

    const otpObs = result.observations.find((o) => o.category === 'credential_otp' && o.excerpt.includes('OTP'));
    expect(otpObs).toBeDefined();
    expect(otpObs?.label).toContain('Request for OTP');

    const pinObs = result.observations.find((o) => o.category === 'credential_otp' && o.excerpt.includes('PIN'));
    expect(pinObs).toBeDefined();
    expect(pinObs?.label).toBe('PIN mentioned');
    expect(pinObs?.label).not.toContain('Request');
  });

  it('Case 8: "Never share your OTP." -> Neutral/cautionary credential mention, no request claim', () => {
    const text = 'Never share your OTP.';
    const result = analyzeRequestText(text, northwood);
    const otpObs = result.observations.find((o) => o.category === 'credential_otp');
    expect(otpObs).toBeDefined();
    expect(otpObs?.label).toBe('OTP mentioned');
    expect(otpObs?.label).not.toContain('Request');
  });

  it('Case 9: "Total balance: ₹6,500. Scholarship credit: ₹1,500." -> Both extracted as amounts mentioned, scholarship credit not described as money owed', () => {
    const text = 'Total balance: ₹6,500. Scholarship credit: ₹1,500.';
    const result = analyzeRequestText(text, northwood);
    expect(result.extractedAmounts).toContain('₹6,500');
    expect(result.extractedAmounts).toContain('₹1,500');

    const scholarshipObs = result.observations.find((o) => o.excerpt === '₹1,500');
    expect(scholarshipObs).toBeDefined();
    expect(scholarshipObs?.label).toBe('Amount mentioned: ₹1,500');
    expect(scholarshipObs?.plainExplanation).toContain('Credits reduce balances rather than creating new payment obligations');
    expect(scholarshipObs?.plainExplanation).not.toContain('instructs payment');
  });

  it('Case 10: "Please pay ₹1,25,000." -> Extract full ₹1,25,000 with exact source span', () => {
    const text = 'Please pay ₹1,25,000.';
    const result = analyzeRequestText(text, northwood);
    expect(result.extractedAmounts).toEqual(['₹1,25,000']);
    const obs = result.observations.find((o) => o.category === 'payment');
    expect(obs).toBeDefined();
    expect(obs?.excerpt).toBe('₹1,25,000');
    expect(text.slice(obs!.startIndex, obs!.endIndex)).toBe('₹1,25,000');
  });

  it('Case 11: "Lab fee: $12.345" -> No parsed partial amount like $12.34', () => {
    const text = 'Lab fee: $12.345';
    const result = analyzeRequestText(text, northwood);
    expect(result.extractedAmounts).not.toContain('$12.34');
    expect(result.extractedAmounts.length).toBe(0);
  });

  it('Case 12: "Fee: ₹1,2,500" -> No parsed partial amount like ₹1 or ₹500', () => {
    const text = 'Fee: ₹1,2,500';
    const result = analyzeRequestText(text, northwood);
    expect(result.extractedAmounts).not.toContain('₹1');
    expect(result.extractedAmounts).not.toContain('₹500');
    expect(result.extractedAmounts.length).toBe(0);
  });
});
