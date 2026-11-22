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
    expect(destination.guidanceUrl).toBeUndefined();
    expect(destination.destinationDescription).not.toContain('attacker-phishing-bursar.invalid');
  });

  it('fictional Northwood exposes no external guidance link and labels data as fictional demo data', () => {
    const northwood = COLLEGES.northwood;
    expect(northwood.isSynthetic).toBe(true);
    expect(northwood.guidanceUrl).toBeUndefined();
    expect(northwood.sourceLabel).toBe('Fictional demo data');
    expect(northwood.lastCheckedDate).toBeUndefined();
    expect(northwood.routeDescription).toContain('officially simulated');
  });

  it('provides verified real college records with separate portal and guidance URLs', () => {
    const iitDelhi = COLLEGES.iit_delhi;
    expect(iitDelhi.isSupported).toBe(true);
    expect(iitDelhi.portalUrl).toBe('https://ecampus.iitd.ac.in/scorner/login');
    expect(iitDelhi.portalHostname).toBe('ecampus.iitd.ac.in');
    expect(iitDelhi.guidanceUrl).toContain('academics.iitd.ac.in');
    expect(iitDelhi.sourceLabel).toContain('IIT Delhi');
    expect(iitDelhi.sourceLabel).toContain('First-Semester Fee Circular');
    expect(iitDelhi.routeTitle).toContain('scorner');
    expect(iitDelhi.verificationSteps.some((s) => s.includes('ecampus.iitd.ac.in/scorner/login'))).toBe(true);
    // Explicitly verify unsupported eAcademics and SBI Collect guidance are NOT present
    expect(iitDelhi.routeDescription).not.toContain('eAcademics');
    expect(iitDelhi.routeDescription).not.toContain('SBI Collect');
    expect(iitDelhi.routeDescription).toContain('IIT Delhi’s 2026–27 first-semester circular directs continuing students to eCampus Student Corner for the semester fees covered by that circular.');
    expect(iitDelhi.lastCheckedDate).toBe('2026-11-22');
    expect(iitDelhi.verificationSteps.length).toBeGreaterThan(2);

    const berkeley = COLLEGES.uc_berkeley;
    expect(berkeley.isSupported).toBe(true);
    expect(berkeley.portalUrl).toBe('https://calcentral.berkeley.edu');
    expect(berkeley.portalHostname).toBe('calcentral.berkeley.edu');
    expect(berkeley.guidanceUrl).toBe('https://studentcentral.berkeley.edu/billing-fees-payments/billing/');
    expect(berkeley.sourceLabel).toContain('Berkeley Student Central');
    expect(berkeley.routeTitle).toContain('CalCentral');
    expect(berkeley.verificationSteps.some((s) => s.includes('calcentral.berkeley.edu'))).toBe(true);
    expect(berkeley.verificationSteps.some((s) => s.includes('View Transactions'))).toBe(true);
    expect(berkeley.lastCheckedDate).toBe('2026-11-22');
  });

  it('handles unsupported college with safe manual protocol without guessing URLs or false verification badges', () => {
    const unsupported = COLLEGES.unsupported;
    expect(unsupported.isSupported).toBe(false);
    expect(unsupported.portalUrl).toBeUndefined();
    expect(unsupported.portalHostname).toBeUndefined();
    expect(unsupported.guidanceUrl).toBeUndefined();
    expect(unsupported.sourceLabel).toBeUndefined();
    expect(unsupported.lastCheckedDate).toBeUndefined();
    expect(unsupported.verificationSteps.some((s) => s.includes('existing trusted bookmark') || s.includes('bookmark'))).toBe(true);
    expect(unsupported.verificationSteps.some((s) => s.includes('registrar or student accounts office') || s.includes('registrar'))).toBe(true);
  });
});
