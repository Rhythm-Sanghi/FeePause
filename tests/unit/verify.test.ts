import { describe, it, expect } from 'vitest';
import { COLLEGES } from '../../src/constants/colleges';
import { resolveVerificationDestination } from '../../src/privacy/privacyGuard';

describe('Verification Destination & Routing Invariants', () => {
  it('strictly rejects message-supplied URLs from overriding official routes', () => {
    const college = COLLEGES.northwood;
    const maliciousLinks = [
      'https://attacker-phishing-bursar.invalid/pay',
      'bursar-spoof@chat-channel.invalid'
    ];

    const destination = resolveVerificationDestination(college, maliciousLinks);

    // Ensure the resolved destination matches the college registry and contains NONE of the attacker's links
    expect(destination.destinationTitle).toBe(college.routeTitle);
    expect(destination.sourceUrl).toBe(college.sourceUrl);
    expect(destination.destinationDescription).not.toContain('attacker-phishing-bursar.invalid');
    expect(destination.sourceUrl).not.toContain('attacker-phishing-bursar.invalid');
  });

  it('provides verified real college records with canonical URLs and verified dates', () => {
    const iitDelhi = COLLEGES.iit_delhi;
    expect(iitDelhi.isSupported).toBe(true);
    expect(iitDelhi.sourceUrl).toBe('https://academics.iitd.ac.in/circulars/');
    expect(iitDelhi.routeTitle).toContain('scorner');
    expect(iitDelhi.verificationSteps.some((s) => s.includes('ecampus.iitd.ac.in/scorner/login'))).toBe(true);
    // Explicitly verify unsupported eAcademics and SBI Collect guidance are NOT present
    expect(iitDelhi.routeDescription).not.toContain('eAcademics');
    expect(iitDelhi.routeDescription).not.toContain('SBI Collect');
    expect(iitDelhi.lastCheckedDate).toBe('2026-11-22');
    expect(iitDelhi.verificationSteps.length).toBeGreaterThan(2);

    const berkeley = COLLEGES.uc_berkeley;
    expect(berkeley.isSupported).toBe(true);
    expect(berkeley.sourceUrl).toBe('https://studentcentral.berkeley.edu/billing-fees-payments/billing/');
    expect(berkeley.routeTitle).toContain('CalCentral');
    expect(berkeley.verificationSteps.some((s) => s.includes('calcentral.berkeley.edu'))).toBe(true);
    expect(berkeley.lastCheckedDate).toBe('2026-11-22');
  });

  it('handles unsupported college with safe manual protocol without guessing URLs', () => {
    const unsupported = COLLEGES.unsupported;
    expect(unsupported.isSupported).toBe(false);
    expect(unsupported.verificationSteps.some((s) => s.includes('existing trusted bookmark') || s.includes('bookmark you already use'))).toBe(true);
    expect(unsupported.verificationSteps.some((s) => s.includes('institution’s official site') || s.includes('top-level domain'))).toBe(true);
  });
});
